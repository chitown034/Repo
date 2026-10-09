#!/usr/bin/env bash
# failover-tests.sh — executes the three-tier failover (T1 subscription -> T2 OmniRoute free combo -> T3 OpenRouter,
# paid, capped, off by default) against a STUB `claude`, a STUB `curl` and a temp HOME. No Mac, no login, no network,
# no OpenRouter account, no money. Written 2026-10-09. The stub key below is a made-up string, never a real one.
#   ./failover-tests.sh      # run everything; exit 0 only if every case passes
# lease-tests.sh is the regression suite for everything this file does not touch; run both.
set -u
set -f
HERE="$(cd "$(dirname "$0")" && pwd)"
AUTO="$HERE/claude-auto.sh"; PROBE="$HERE/probe.sh"
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/failover-tests.XXXXXX") || exit 2
trap 'rm -rf "$ROOT"' EXIT INT TERM
export HOME="$ROOT/home" ; BIN="$ROOT/bin"; mkdir -p "$HOME" "$BIN"
unset OMNIROUTE_CFG OPENROUTER_CFG ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN
OCFG="$HOME/.config/omniroute"; ORCFG="$HOME/.config/openrouter"; STATE="$OCFG/state"
export OMNIROUTE_BASE="http://127.0.0.1:20128"
export TEST_OR_KEY="sk-or-test-NOT-A-REAL-KEY-0123456789"
export STUBROOT="$ROOT"

N_PASS=0; N_FAIL=0
pass() { N_PASS=$((N_PASS+1)); printf '  ok    %s\n' "$1"; }
fail() { N_FAIL=$((N_FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; }
sect() { printf '\n== %s\n' "$*"; }
eq()   { if [ "$2" = "$3" ]; then pass "$1 ($2)"; else fail "$1" "expected '$3', got '$2'"; fi; }
has()  { case "$2" in *"$3"*) pass "$1" ;; *) fail "$1" "'$3' not found in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-300)" ;; esac; }
hasnt(){ case "$2" in *"$3"*) fail "$1" "'$3' WAS present in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-300)" ;; *) pass "$1" ;; esac; }

# ------------------------------------------------------------------ stubs
cat > "$BIN/claude" <<'STUB'
#!/usr/bin/env bash
# Records what the launcher handed it (never the token's value), then answers per STUB_MODE: ok | limit | exhaust
auth=unset; [ -n "${ANTHROPIC_AUTH_TOKEN:-}" ] && { auth=other; [ "$ANTHROPIC_AUTH_TOKEN" = "$TEST_OR_KEY" ] && auth=or-key; }
api=unset; [ "${ANTHROPIC_API_KEY+x}" = x ] && { api=set; [ -z "$ANTHROPIC_API_KEY" ] && api=empty; }
printf 'BASE=%s AUTH=%s APIKEY=%s MODEL=%s OAUTH=%s ROUTE=%s\n' "${ANTHROPIC_BASE_URL:-unset}" "$auth" "$api" "${ANTHROPIC_MODEL:-unset}" "${CLAUDE_CODE_OAUTH_TOKEN:+set}" "${VANESSA_ROUTE_MODE:-unset}" >> "$STUBROOT/calls.log"
case "${STUB_MODE:-ok}" in
  limit)   echo '{"type":"result","subtype":"error","is_error":true,"result":"Claude AI usage limit reached"}'; exit 1 ;;
  exhaust) echo '{"type":"result","subtype":"error","is_error":true,"result":"All providers exhausted for combo auto/coding:free"}'; exit 1 ;;
  *)       echo '{"type":"result","subtype":"success","is_error":false,"result":"OK"}'; exit 0 ;;
esac
STUB
cat > "$BIN/curl" <<'STUB'
#!/usr/bin/env bash
# healthz answers iff $STUBROOT/omni_up exists; OpenRouter's /v1/key answers with $STUBROOT/keyjson if present, else fails.
url=''; for a in "$@"; do case "$a" in http*) url="$a" ;; esac; done
printf '%s\n' "$url" >> "$STUBROOT/curl.log"
case "$url" in
  */healthz) [ -f "$STUBROOT/omni_up" ] && { echo ok; exit 0; }; exit 7 ;;
  */v1/key)  cat >/dev/null; [ -f "$STUBROOT/keyjson" ] && { cat "$STUBROOT/keyjson"; exit 0; }; exit 22 ;;
esac
exit 22
STUB
chmod +x "$BIN/claude" "$BIN/curl"
export PATH="$BIN:$PATH"

# ------------------------------------------------------------------ helpers
fresh() { # wipe all state; write the omniroute key file; omni up
  rm -rf "$HOME/.config" "$ROOT/calls.log" "$ROOT/curl.log" "$ROOT/keyjson"
  mkdir -p "$OCFG" && printf 'OMNIROUTE_API_KEY=not-a-real-omni-key\n' > "$OCFG/.env" && chmod 600 "$OCFG/.env"
  : > "$ROOT/omni_up"; : > "$ROOT/calls.log"; : > "$ROOT/curl.log"
  unset STUB_MODE OMNIROUTE_FREE_RETRY OMNIROUTE_FREE_FAIL_N OPENROUTER_HEADROOM_USD
}
omni_down() { rm -f "$ROOT/omni_up"; }
omni_up()   { : > "$ROOT/omni_up"; }
set_route() { # mode — a fresh, trusted route.env (probed just now, so the launcher does not self-probe)
  mkdir -p "$STATE"; chmod 700 "$STATE"; t=$(date +%s)
  printf "mode=%s\nsince=%s\nreset_at=0\nreason='test'\nomni_ok=1\nprobed_at=%s\n" "$1" "$t" "$t" > "$STATE/route.env"; chmod 600 "$STATE/route.env"
  printf '%s\n' "$1" > "$STATE/mode"
}
t3_on() { # [cap] — enabled file + env file with a cap (default 25) and the stub key; mode 600
  mkdir -p "$ORCFG"; : > "$ORCFG/enabled"
  printf 'OPENROUTER_API_KEY=%s\n' "$TEST_OR_KEY" > "$ORCFG/.env"
  [ "${1:-25}" != none ] && printf 'OPENROUTER_MONTHLY_CAP_USD=%s\n' "${1:-25}" >> "$ORCFG/.env"
  chmod 600 "$ORCFG/.env"
}
ledger() { mkdir -p "$STATE"; printf 'month=%s\nspent_usd=%s\nupdated_at=1\n' "$(date -u +%Y-%m)" "$1" > "$STATE/openrouter-ledger.env"; chmod 600 "$STATE/openrouter-ledger.env"; }
run() { "$AUTO" --no-lease "$@" >"$ROOT/out" 2>"$ROOT/err"; RC=$?; }   # rc in $RC, streams in $ROOT/out and $ROOT/err
calls() { wc -l < "$ROOT/calls.log" | tr -d ' '; }
lastcall() { tail -1 "$ROOT/calls.log"; }
modeof() { tr -d '\n' < "$STATE/mode" 2>/dev/null; }
alltext() { cat "$ROOT/out" "$ROOT/err" "$STATE"/*.log "$STATE/NEEDS-STEVEN" 2>/dev/null; }
OKTASK=weather-news-refresh

# ================================================================== 1. T1 is the default
sect "T1 default: plain claude, OAuth, no proxy env, never OmniRoute"
fresh; t3_on; omni_down
run --task "$OKTASK" -p 'hi'
eq "T1 runs" "$RC" 0
has "T1 no proxy env" "$(lastcall)" "BASE=unset AUTH=unset APIKEY=unset"
hasnt "T1 never touched healthz or OpenRouter" "$(cat "$ROOT/curl.log")" "http"

# ================================================================== 2. limit -> T2 immediately
sect "limit detected -> T2 immediately"
fresh
STUB_MODE=limit run --task "$OKTASK" -p 'hi'
eq "limit run exits 75 (runner retries)" "$RC" 75
eq "mode flipped to free-fallback" "$(modeof)" free-fallback
# the freshly flipped route has probed_at=0, so the launcher would self-probe (and the stub says "ok"); hold the probe off
OMNIROUTE_PROBE_MAX_AGE=9999999999 OMNIROUTE_PROBE_FORCE_AGE=9999999999 STUB_MODE=ok run --task "$OKTASK" -p 'hi'
eq "retry runs" "$RC" 0
has "retry goes to OmniRoute loopback" "$(lastcall)" "BASE=http://127.0.0.1:20128"
has "retry uses the free combo" "$(lastcall)" "MODEL=auto/coding:free"
hasnt "retry carries no OpenRouter key" "$(lastcall)" "or-key"
has "retry has no subscription token" "$(lastcall)" "OAUTH= "
hasnt "no OpenRouter call made" "$(cat "$ROOT/curl.log")" "openrouter.ai"

# ================================================================== 3. T2 down -> T3 only when enabled + cap
sect "T2 down -> T3 (enabled file + cap)"
fresh; set_route free-fallback; t3_on 25; omni_down
run --task "$OKTASK" -p 'hi'
eq "T3 runs" "$RC" 0
has "T3 base url is OpenRouter" "$(lastcall)" "BASE=https://openrouter.ai/api"
has "T3 token is the OpenRouter key" "$(lastcall)" "AUTH=or-key"
has "T3 ANTHROPIC_API_KEY is blank, not unset" "$(lastcall)" "APIKEY=empty"
has "T3 has no subscription token" "$(lastcall)" "OAUTH= "
has "T3 route label" "$(lastcall)" "ROUTE=paid-backup"
eq "state/mode is paid-backup" "$(modeof)" paid-backup
has "ledger charged the headroom (key endpoint unreadable)" "$(cat "$STATE/openrouter-ledger.env")" "spent_usd=1.0000"
hasnt "key never in any log or output" "$(alltext)" "$TEST_OR_KEY"
hasnt "key never on a command line (curl log holds URLs only)" "$(cat "$ROOT/curl.log")" "$TEST_OR_KEY"
eq "ledger file is owner-only" "$(stat -c %a "$STATE/openrouter-ledger.env")" 600

sect "T3 settles from the key's own usage_monthly when readable"
fresh; set_route free-fallback; t3_on 25; omni_down
printf '{"data":{"limit":25,"limit_remaining":20.5,"usage_monthly":4.5}}\n' > "$ROOT/keyjson"
run --task "$OKTASK" -p 'hi'
eq "T3 runs" "$RC" 0
has "ledger = max(ledger, usage_monthly)" "$(cat "$STATE/openrouter-ledger.env")" "spent_usd=4.5000"

# ================================================================== 4. T3 refusals
sect "T3 refused: no enabled file / no cap / bad cap / bad perms / over cap"
fresh; set_route free-fallback; t3_on 25; omni_down; rm -f "$ORCFG/enabled"
run --task "$OKTASK" -p 'hi'
eq "no enabled file -> deferred 75" "$RC" 75; eq "no claude call" "$(calls)" 0
has "reason logged" "$(cat "$STATE/claude-auto.log")" "tier 3 refused"
hasnt "no OpenRouter call" "$(cat "$ROOT/curl.log")" "openrouter.ai"
fresh; set_route free-fallback; t3_on none; omni_down
run --task "$OKTASK" -p 'hi'
eq "enabled but no cap -> 75" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route free-fallback; t3_on 0; omni_down
run --task "$OKTASK" -p 'hi'
eq "cap 0 -> 75" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route free-fallback; t3_on abc; omni_down
run --task "$OKTASK" -p 'hi'
eq "cap not a number -> 75" "$RC" 75
fresh; set_route free-fallback; t3_on 25; omni_down; chmod 644 "$ORCFG/.env"
run --task "$OKTASK" -p 'hi'
eq ".env not chmod 600 -> 75" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route free-fallback; t3_on 25; omni_down; rm -f "$ORCFG/.env"
run --task "$OKTASK" -p 'hi'
eq "no .env -> 75" "$RC" 75
fresh; set_route free-fallback; t3_on 25; omni_down; ledger 24.5
run --task "$OKTASK" -p 'hi'
eq "over cap (24.5 + 1.0 headroom > 25) -> 75" "$RC" 75; eq "no claude call" "$(calls)" 0
has "reason names the cap" "$(cat "$STATE/claude-auto.log")" "monthly cap"
fresh; set_route free-fallback; t3_on 25; omni_down; ledger 24
run --task "$OKTASK" -p 'hi'
eq "exactly at cap (24 + 1 = 25) is allowed" "$RC" 0
fresh; set_route free-fallback; t3_on 25; omni_down
printf '{"data":{"limit":25,"limit_remaining":0.2,"usage_monthly":24.8}}\n' > "$ROOT/keyjson"
run --task "$OKTASK" -p 'hi'
eq "key endpoint says nearly spent -> 75" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route free-fallback; t3_on 25; omni_down; printf 'month=%s\nspent_usd=banana\n' "$(date -u +%Y-%m)" > "$STATE/openrouter-ledger.env"; chmod 600 "$STATE/openrouter-ledger.env"
run --task "$OKTASK" -p 'hi'
eq "garbled ledger -> refuse, never reset" "$RC" 75
fresh; set_route free-fallback; t3_on 25; omni_down; ledger 99; sed -i 's/^month=.*/month=1999-01/' "$STATE/openrouter-ledger.env"
run --task "$OKTASK" -p 'hi'
eq "ledger from an old month does not count" "$RC" 0

sect "T3 is never used while the subscription is fine"
fresh; t3_on 25; omni_down
run --task "$OKTASK" -p 'hi'
hasnt "T1 not T3" "$(lastcall)" "openrouter"
has "still plain claude" "$(lastcall)" "BASE=unset"

# ================================================================== 5. exhaustion trigger
sect "free combo exhausted N times in a row -> T3"
fresh; set_route free-fallback; t3_on 25
for i in 1 2 3; do STUB_MODE=exhaust run --task "$OKTASK" -p 'hi'; eq "exhaustion run $i exits 75" "$RC" 75; has "run $i was on tier 2" "$(lastcall)" "BASE=http://127.0.0.1:20128"; done
has "streak recorded" "$(cat "$STATE/free-fails")" "3 "
STUB_MODE=ok run --task "$OKTASK" -p 'hi'
eq "4th run goes to T3" "$RC" 0
has "T3 took over" "$(lastcall)" "BASE=https://openrouter.ai/api"
eq "mode paid-backup" "$(modeof)" paid-backup

sect "two exhaustion failures are not enough (N=3)"
fresh; set_route free-fallback; t3_on 25
for i in 1 2; do STUB_MODE=exhaust run --task "$OKTASK" -p 'hi'; done
STUB_MODE=ok run --task "$OKTASK" -p 'hi'
has "still tier 2" "$(lastcall)" "BASE=http://127.0.0.1:20128"
hasnt "streak cleared by the success" "$(ls "$STATE")" "free-fails"

sect "exhausted but T3 not enabled -> tier 2 is still tried (nothing to fall back to)"
fresh; set_route free-fallback
for i in 1 2 3; do STUB_MODE=exhaust run --task "$OKTASK" -p 'hi'; done
STUB_MODE=ok run --task "$OKTASK" -p 'hi'
eq "runs on tier 2" "$RC" 0; has "tier 2" "$(lastcall)" "BASE=http://127.0.0.1:20128"

# ================================================================== 6. PII
sect "PII: client-data work never reaches T2 or T3 (same gate as the free route)"
for case_ in "--task lofty-crm-sync" "--task Lofty-CRM-Refresh" "--task some-brand-new-task" "--task lofty-crm-sync --no-pii" "--pii --task $OKTASK" ""; do
  for world in up down; do
    fresh; set_route free-fallback; t3_on 25; "omni_$world"
    # shellcheck disable=SC2086
    run $case_ -p 'summarize the client file'
    eq "[$world] '$case_' deferred" "$RC" 75
    eq "[$world] '$case_' no claude call" "$(calls)" 0
    hasnt "[$world] '$case_' no OpenRouter call" "$(cat "$ROOT/curl.log")" "openrouter.ai"
  done
done
fresh; set_route paid-backup; t3_on 25; omni_down
run --task lofty-crm-sync -p 'x'
eq "client task while mode=paid-backup -> deferred" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route local-only; t3_on 25; omni_down
run --task "$OKTASK" -p 'x'
eq "mode local-only never goes to T3" "$RC" 75; eq "no claude call" "$(calls)" 0
fresh; set_route free-fallback; t3_on 25; omni_down
run -p 'x' --no-pii
eq "explicit --no-pii with no task may use T3 (same as the free route)" "$RC" 0
has "T3" "$(lastcall)" "openrouter.ai"
fresh; set_route free-fallback; t3_on 25; omni_down
"$AUTO" --no-lease >"$ROOT/out" 2>"$ROOT/err" </dev/null; RC=$?
eq "interactive, no task: deferred" "$RC" 75

# ================================================================== 7. back up the chain
sect "return T3 -> T2 the moment OmniRoute is healthy"
fresh; set_route free-fallback; t3_on 25; omni_down
run --task "$OKTASK" -p 'hi'; has "on T3" "$(lastcall)" "openrouter.ai"; eq "mode" "$(modeof)" paid-backup
omni_up
run --task "$OKTASK" -p 'hi'
has "next run on T2" "$(lastcall)" "BASE=http://127.0.0.1:20128"
hasnt "not on T3" "$(lastcall)" "or-key"
eq "mode back to free-fallback" "$(modeof)" free-fallback

sect "return T3 -> T2 after an exhausted combo recovers (retry interval)"
fresh; set_route free-fallback; t3_on 25; export OMNIROUTE_FREE_RETRY=3600
for i in 1 2 3; do STUB_MODE=exhaust run --task "$OKTASK" -p 'hi'; done
STUB_MODE=ok run --task "$OKTASK" -p 'hi'; has "T3 covers" "$(lastcall)" "openrouter.ai"
export OMNIROUTE_FREE_RETRY=0
STUB_MODE=ok run --task "$OKTASK" -p 'hi'
has "retry due: T2 tried again" "$(lastcall)" "BASE=http://127.0.0.1:20128"
hasnt "streak cleared" "$(ls "$STATE")" "free-fails"
eq "mode free-fallback" "$(modeof)" free-fallback

sect "T3 -> T2 via probe.sh while the subscription is still limited"
fresh; set_route paid-backup; t3_on 25; omni_up
STUB_MODE=limit "$PROBE" --now; eq "probe exits 0" "$?" 0
eq "probe moved paid-backup -> free-fallback" "$(modeof)" free-fallback
fresh; set_route paid-backup; omni_down
STUB_MODE=limit "$PROBE" --now
eq "OmniRoute still down: stays paid-backup" "$(modeof)" paid-backup

sect "return to T1 after the subscription resets (probe.sh, from every mode)"
for m in free-fallback paid-backup; do
  fresh; set_route "$m"; t3_on 25; printf '3 1\n' > "$STATE/free-fails"
  STUB_MODE=ok "$PROBE" --now
  eq "[$m] probe restores subscription" "$(modeof)" subscription
  hasnt "[$m] exhaustion streak cleared" "$(ls "$STATE")" "free-fails"
  run --task "$OKTASK" -p 'hi'
  has "[$m] next run is plain claude, no proxy" "$(lastcall)" "BASE=unset AUTH=unset APIKEY=unset"
done
fresh; set_route paid-backup; t3_on 25; ledger 7
STUB_MODE=ok "$PROBE" --now
has "the ledger survives a restore (cap is monthly, not per episode)" "$(cat "$STATE/openrouter-ledger.env")" "spent_usd=7"

# ================================================================== 8. status + hygiene
sect "--status and hygiene"
fresh; set_route paid-backup; t3_on 25; ledger 3.25
"$AUTO" --status >"$ROOT/out" 2>&1
has "status shows mode" "$(cat "$ROOT/out")" "mode=paid-backup"
has "status shows the cap" "$(cat "$ROOT/out")" "tier3_cap_usd=25"
has "status shows the spend" "$(cat "$ROOT/out")" "tier3_spent_usd_this_month=3.25"
hasnt "status never prints the key" "$(cat "$ROOT/out")" "$TEST_OR_KEY"
fresh; set_route free-fallback; t3_on 25; omni_down
run --task "$OKTASK" -p 'hi' --model sonnet
has "T3 rewrites nothing it should not: model is set via env" "$(lastcall)" "MODEL=anthropic/"
hasnt "the OmniRoute key never goes to OpenRouter" "$(cat "$ROOT/calls.log")" "not-a-real-omni-key"

printf '\n------------------------------------------------------------\npass %s   FAIL %s\n' "$N_PASS" "$N_FAIL"
[ "$N_FAIL" -eq 0 ]
