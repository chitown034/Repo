#!/usr/bin/env bash
# configure-omniroute.sh — registers the local Bonsai provider and the `local` combo, with its
# compression setting, against a running OmniRoute (integrations/omniroute/README.md).
# Idempotent: create-or-update, safe to re-run. Never touches the Claude subscription/OAuth path.
# The Perplexity provider and the `research` combo were removed 2026-10-05 (Steven): research runs
# on the Claude subscription, direct, and the subscription never goes through OmniRoute.
#
# Surface used (researched 2026-09-28 from OmniRoute's GitHub wiki/docs — NOT executed against a
# real install in this sandbox; see integrations/omniroute/README.md #Honest-status):
#   CLI (documented; not called by this script since 2026-10-05):
#     omniroute providers add <id> --credential-env NAME       (cloud providers — none registered
#                                                                 here since 2026-10-05)
#     omniroute providers add <id> --base-url URL               (local providers — best-effort flag
#                                                                 name; unconfirmed, see below)
#   REST (what this script drives, and what its own stub proof used — every shape below
#     IS confirmed from docs/routing/AUTO-COMBO.md and docs/compression/COMPRESSION_GUIDE.md, fetched
#     2026-09-28):
#     POST http://$HOST:$PORT/api/providers        {"id","baseUrl"[,"credentialEnv"]}
#     POST http://$HOST:$PORT/api/combos            {"name","strategy":"priority","targets":[{"model"}]}
#     PUT  http://$HOST:$PORT/api/combos/{name}      {"compressionMode": Default|Off|Lite|Standard|Aggressive|Ultra}
#   No CLI flag for a local provider's base URL was found documented anywhere reachable in this
#   sandbox (only the dashboard flow was, per Provider-Reference) — this script therefore uses the
#   REST form for the LOCAL provider (it tried the CLI first only for the Perplexity key, removed
#   2026-10-05). If your installed OmniRoute's REST paths differ, this
#   script's HTTP calls are isolated in the *_api() functions below — point them at the real paths
#   and nothing else here needs to change.
#
# Usage: configure-omniroute.sh [--dry-run] [--local-base-url URL] [--local-provider-id ID]
#                                [--omni-base URL]
# Keys: none. The only provider registered here is the loopback Bonsai server, which has no
#   credential, so this script reads, prints, echoes and writes no key. (--set-perplexity-key was
#   removed 2026-10-05; passing it now exits 64 with a message.)
# macOS, bash 3.2-safe (no associative arrays, no ${var,,}, no mapfile). No secrets in this file.
set -u
umask 077

DRY_RUN=0
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
LOCAL_PROVIDER_ID="${BONSAI_OMNIROUTE_PROVIDER_ID:-bonsai-local}"
LOCAL_BASE_URL="${BONSAI_LOCAL_BASE_URL:-http://127.0.0.1:8080/v1}"
LOCAL_MODEL_NAME="${BONSAI_MODEL_NAME:-bonsai-2-27b}"
LOCAL_COMPRESSION_MODE="${LOCAL_COMPRESSION_MODE:-Standard}"

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --local-base-url) shift; LOCAL_BASE_URL="${1:-}" ;;
    --local-provider-id) shift; LOCAL_PROVIDER_ID="${1:-}" ;;
    --omni-base) shift; OMNI_BASE="${1:-}" ;;
    --set-perplexity-key)
      echo "configure-omniroute.sh: --set-perplexity-key was removed 2026-10-05 — Perplexity is gone and research runs on the Claude subscription; there is no key to set." >&2
      exit 64 ;;
    -h|--help) sed -n '2,33p' "$0"; exit 0 ;;
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
      _curl PUT "/api/combos/$_name" "$body" >/dev/null; HTTP_CODE=$(read_code)
      case "$HTTP_CODE" in 200|201|204) ;; 000) [ "$DRY_RUN" = 1 ] || { log "no response updating combo '$_name'"; return 1; } ;;
        *) log "unexpected response updating combo '$_name': http=$HTTP_CODE"; return 1 ;; esac ;;
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
    200|201|204) log "combo '$_name' compressionMode -> $_mode." ;;
    000) if [ "$DRY_RUN" = 1 ]; then log "  (dry-run: compressionMode not sent)"; else log "no response setting compressionMode on '$_name'"; return 1; fi ;;
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

# ---- research: no provider, no combo (removed 2026-10-05) ---------------------------------------
# Perplexity was removed (Steven, 2026-10-05). Research runs on the Claude subscription, direct, and
# the subscription never goes through OmniRoute (README #hard-rules), so there is nothing to register.
log "== research: nothing to configure — Perplexity removed 2026-10-05; research runs on the Claude subscription, direct =="
log "  If an earlier run created a 'research' combo or a 'perplexity' provider here, neither is used any more;"
log "  remove them from OmniRoute's dashboard ($OMNI_BASE) when convenient."

echo
log "Done. Verify before trusting: 'omniroute providers test-all' or GET $OMNI_BASE/api/providers,"
log "and a real request through each combo (integrations/omniroute/README.md's proof section shows the shape)."
