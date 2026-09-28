#!/usr/bin/env bash
# configure-omniroute.sh — registers the local Bonsai provider, the `local` and `research` combos,
# and their compression settings, against a running OmniRoute (integrations/omniroute/README.md).
# Idempotent: create-or-update, safe to re-run. Never touches the Claude subscription/OAuth path.
#
# Surface used (researched 2026-09-28 from OmniRoute's GitHub wiki/docs — NOT executed against a
# real install in this sandbox; see integrations/omniroute/README.md #Honest-status):
#   CLI (preferred when `omniroute` is on PATH):
#     omniroute providers add <id> --credential-env NAME       (cloud providers — Perplexity)
#     omniroute providers add <id> --base-url URL               (local providers — best-effort flag
#                                                                 name; unconfirmed, see below)
#   REST (fallback, and what this script actually drives its own stub proof with — every shape below
#     IS confirmed from docs/routing/AUTO-COMBO.md and docs/compression/COMPRESSION_GUIDE.md, fetched
#     2026-09-28):
#     POST http://$HOST:$PORT/api/providers        {"id","baseUrl"[,"credentialEnv"]}
#     POST http://$HOST:$PORT/api/combos            {"name","strategy":"priority","targets":[{"model"}]}
#     PUT  http://$HOST:$PORT/api/combos/{name}      {"compressionMode": Default|Off|Lite|Standard|Aggressive|Ultra}
#   No CLI flag for a local provider's base URL was found documented anywhere reachable in this
#   sandbox (only the dashboard flow was, per Provider-Reference) — this script therefore prefers
#   the REST form for the LOCAL provider specifically, and tries the CLI first only for Perplexity
#   (whose --credential-env shape the existing omniroute-failover/README.md already ran for real
#   against omniroute 3.8.50 on 2026-09-22). If your installed OmniRoute's REST paths differ, this
#   script's HTTP calls are isolated in the *_api() functions below — point them at the real paths
#   and nothing else here needs to change.
#
# Usage: configure-omniroute.sh [--dry-run] [--local-base-url URL] [--local-provider-id ID]
#                                [--set-perplexity-key] [--omni-base URL]
# Keys: NEVER reads, prints, echoes, or writes a provider key value to any file this repo tracks.
#   Default: prints the exact dashboard click path for Steven to paste the Perplexity key himself.
#   --set-perplexity-key: prompts with `read -r -s` (not echoed to the terminal), and hands the value
#   straight to `omniroute providers add perplexity --credential-stdin` (OmniRoute's own encrypted
#   store) if the CLI is present, or a single REST call if not — either way the value lives only in
#   one shell variable, unset immediately after use, never logged (set +x throughout), never written
#   to disk by this script.
# macOS, bash 3.2-safe (no associative arrays, no ${var,,}, no mapfile). No secrets in this file.
set -u
umask 077

DRY_RUN=0
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
LOCAL_PROVIDER_ID="${BONSAI_OMNIROUTE_PROVIDER_ID:-bonsai-local}"
LOCAL_BASE_URL="${BONSAI_LOCAL_BASE_URL:-http://127.0.0.1:8080/v1}"
LOCAL_MODEL_NAME="${BONSAI_MODEL_NAME:-bonsai-2-27b}"
PERPLEXITY_MODEL="${PERPLEXITY_MODEL:-perplexity/sonar}"   # NOT independently verified against OmniRoute's
                                                             # provider catalog this round — confirm once a
                                                             # real key is added: `omniroute providers test-all`
RESEARCH_COMPRESSION_MODE="${RESEARCH_COMPRESSION_MODE:-Standard}"
LOCAL_COMPRESSION_MODE="${LOCAL_COMPRESSION_MODE:-Standard}"
SET_PPLX_KEY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --local-base-url) shift; LOCAL_BASE_URL="${1:-}" ;;
    --local-provider-id) shift; LOCAL_PROVIDER_ID="${1:-}" ;;
    --omni-base) shift; OMNI_BASE="${1:-}" ;;
    --set-perplexity-key) SET_PPLX_KEY=1 ;;
    -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "configure-omniroute.sh: unknown argument '$1'" >&2; exit 64 ;;
  esac
  shift
done

log() { printf '[configure-omniroute] %s\n' "$*"; }

# ---- thin REST helpers -------------------------------------------------------------------------
# Every call prints the verb+path (never a body that might carry a credential) so a --dry-run trace
# and a real run log look the same shape. curl's own -s suppresses progress; body always goes via
# stdin (-d @-) so it is never on the process argv, where `ps` on a shared Mac could see it.
#
# _curl's caller reads its status via _CODE_FILE, not a variable _curl sets: every caller invokes it
# as `out=$(_curl ...)`, and command substitution runs the function in a SUBSHELL, so a plain
# `HTTP_CODE=...` assignment inside _curl would vanish the moment that subshell exits (bash 3.2 has
# no `coproc`/namerefs to work around that). A file survives the subshell boundary; a variable does not.
_CODE_FILE=$(mktemp "${TMPDIR:-/tmp}/cor-code.XXXXXX") || _CODE_FILE="${TMPDIR:-/tmp}/cor-code.$$"
trap 'rm -f "$_CODE_FILE"' EXIT INT TERM

_curl() { # method path json-body(or '') -> prints response body; caller then reads $_CODE_FILE
  _m="$1"; _p="$2"; _body="${3:-}"
  log "+ $_m $OMNI_BASE$_p"
  if [ "$DRY_RUN" = 1 ]; then printf '000' > "$_CODE_FILE"; printf '{"dry_run":true}'; return 0; fi
  _tmp=$(mktemp "${TMPDIR:-/tmp}/cor-resp.XXXXXX") || _tmp="${TMPDIR:-/tmp}/cor-resp.$$"
  if [ -n "$_body" ]; then
    resp=$(printf '%s' "$_body" | curl -sS -o "$_tmp" -w '%{http_code}' --max-time 10 \
      -X "$_m" -H 'Content-Type: application/json' -d @- "$OMNI_BASE$_p" 2>/dev/null) || resp="000"
  else
    resp=$(curl -sS -o "$_tmp" -w '%{http_code}' --max-time 10 -X "$_m" "$OMNI_BASE$_p" 2>/dev/null) || resp="000"
  fi
  printf '%s' "$resp" > "$_CODE_FILE"
  cat "$_tmp" 2>/dev/null; rm -f "$_tmp"
}
read_code() { cat "$_CODE_FILE" 2>/dev/null || printf '000'; }

json_str() { # minimal JSON-string escaper for values this script builds itself (ids/urls, no free text)
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

ensure_provider() { # id base_url  -- create, or accept "already exists" as success (idempotent)
  _id="$1"; _url="$2"
  body="{\"id\":\"$(json_str "$_id")\",\"baseUrl\":\"$(json_str "$_url")\"}"
  out=$(_curl POST /api/providers "$body"); HTTP_CODE=$(read_code)
  case "$HTTP_CODE" in
    200|201) log "provider '$_id' registered." ;;
    409)     log "provider '$_id' already exists — leaving it as configured." ;;
    000)
      if [ "$DRY_RUN" = 1 ]; then log "  (dry-run: not sent)"; else log "no response from OmniRoute at $OMNI_BASE — is it running?"; return 1; fi ;;
    *)       log "unexpected response registering '$_id': http=$HTTP_CODE body=$out"; return 1 ;;
  esac
}

ensure_combo() { # name model-target -- create with one target, or PUT to fix its targets if it exists
  _name="$1"; _target="$2"
  body="{\"name\":\"$(json_str "$_name")\",\"strategy\":\"priority\",\"targets\":[{\"model\":\"$(json_str "$_target")\"}]}"
  out=$(_curl POST /api/combos "$body"); HTTP_CODE=$(read_code)
  case "$HTTP_CODE" in
    200|201) log "combo '$_name' created -> [$_target]." ;;
    409)
      log "combo '$_name' already exists — updating its targets to match (single target, no fallback member)."
      _curl PUT "/api/combos/$_name" "$body" >/dev/null ;;
    000)
      if [ "$DRY_RUN" = 1 ]; then log "  (dry-run: not sent)"; else log "no response from OmniRoute at $OMNI_BASE — is it running?"; return 1; fi ;;
    *)       log "unexpected response creating combo '$_name': http=$HTTP_CODE body=$out"; return 1 ;;
  esac
}

set_compression() { # combo-name mode
  _name="$1"; _mode="$2"
  body="{\"compressionMode\":\"$(json_str "$_mode")\"}"
  out=$(_curl PUT "/api/combos/$_name" "$body"); HTTP_CODE=$(read_code)
  case "$HTTP_CODE" in
    200|201|000) log "combo '$_name' compressionMode -> $_mode." ;;
    *) log "unexpected response setting compressionMode on '$_name': http=$HTTP_CODE body=$out"; return 1 ;;
  esac
}

# ---- health -------------------------------------------------------------------------------------
if [ "$DRY_RUN" != 1 ]; then
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$OMNI_BASE/healthz" 2>/dev/null) || code="000"
  if [ "$code" != 200 ]; then
    log "OmniRoute is not answering healthy at $OMNI_BASE/healthz (http=$code). Start it first; nothing changed."
    exit 75
  fi
fi

# ---- the local provider + combo (Bonsai 27B, no credential — it is loopback) --------------------
log "== local provider + combo =="
ensure_provider "$LOCAL_PROVIDER_ID" "$LOCAL_BASE_URL" || exit 1
ensure_combo "local" "$LOCAL_PROVIDER_ID/$LOCAL_MODEL_NAME" || exit 1
set_compression "local" "$LOCAL_COMPRESSION_MODE" || exit 1
log "OMNIROUTE_LOCAL_MODEL=local   # claude-auto.sh's OMNIROUTE_LOCAL_MODEL should be the COMBO name,"
log "  since route_omni() sets it straight into ANTHROPIC_MODEL and OmniRoute resolves a combo name"
log "  or a raw provider/model string identically (docs/routing/AUTO-COMBO.md's resolution order)."

# ---- Perplexity provider + research combo --------------------------------------------------------
log "== Perplexity provider + research combo =="
if [ "$SET_PPLX_KEY" = 1 ] && [ "$DRY_RUN" != 1 ]; then
  printf 'Paste the Perplexity API key (input hidden, never logged, never written to a file): '
  stty -echo 2>/dev/null; IFS= read -r pplx_key; stty echo 2>/dev/null; printf '\n'
  if command -v omniroute >/dev/null 2>&1; then
    printf '%s' "$pplx_key" | omniroute providers add perplexity --credential-stdin >/dev/null 2>&1
    rc=$?
  else
    body="{\"id\":\"perplexity\",\"credential\":\"$(json_str "$pplx_key")\"}"
    _curl POST /api/providers "$body" >/dev/null; HTTP_CODE=$(read_code)
    rc=0; [ "$HTTP_CODE" = 200 ] || [ "$HTTP_CODE" = 201 ] || [ "$HTTP_CODE" = 409 ] || rc=1
  fi
  unset pplx_key
  if [ $rc -eq 0 ]; then
    log "Perplexity credential handed to OmniRoute's own store."
  else
    log "Perplexity credential submission failed (rc=$rc) — nothing was logged either way."
  fi
else
  log "Perplexity key: not set by this script (pass --set-perplexity-key to do it interactively, hidden input)."
  log "  Dashboard click path instead: open $OMNI_BASE -> Providers -> Add Provider -> search 'Perplexity'"
  log "  -> paste the API key in the Credential field -> Save -> Test. (Steven does this himself.)"
  log "  The research combo below is still created/updated now — it will simply fail Test until that key exists."
fi
ensure_combo "research" "$PERPLEXITY_MODEL" || exit 1
set_compression "research" "$RESEARCH_COMPRESSION_MODE" || exit 1

echo
log "Done. Verify before trusting: 'omniroute providers test-all' or GET $OMNI_BASE/api/providers,"
log "and a real request through each combo (integrations/omniroute/README.md's proof section shows the shape)."
