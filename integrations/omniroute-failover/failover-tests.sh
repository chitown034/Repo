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
okc()  { _d="$1"; shift; if "$@"; then pass "$_d"; else fail "$_d" "check failed: $*"; fi; }
eq()   { if [ "$2" = "$3" ]; then pass "$1 ($2)"; else fail "$1" "expected '$3', got '$2'"; fi; }
has()  { case "$2" in *"$3"*) pass "$1" ;; *) fail "$1" "'$3' not found in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-300)" ;; esac; }
hasnt(){ case "$2" in *"$3"*) fail "$1" "'$3' WAS present in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-300)" ;; *) pass "$1" ;; esac; }

# ------------------------------------------------------------------ stubs
cat > "$BIN/claude" <<'STUB'
#!/usr/bin/env bash
# Records what the launcher handed it (never the token's value), then answers per STUB_MODE: ok | limit | exhaust
auth=unset; [ -n "${ANTHROPIC_AUTH_TOKEN:-}" ] && { auth=other; [ "$ANTHROPIC_AUTH_TOKEN" = "$TEST_OR_KEY" ] && auth=or-key; }
api=unset; [ "${ANTHROPIC_API_KEY+x}" = x ] && { api=set; [ -z "$ANTHROPIC_API_KEY" ] && api=empty; }
printf 'BASE=%s AUTH=%s APIKEY=%s MODEL=%s OAUTH=%s ROUTE=%s IFREE=%s ARGS=%s\n' "${ANTHROPIC_BASE_URL:-unset}" "$auth" "$api" "${ANTHROPIC_MODEL:-unset}" "${CLAUDE_CODE_OAUTH_TOKEN:+set}" "${VANESSA_ROUTE_MODE:-unset}" "${VANESSA_INTERACTIVE_FREE:-}" "$*" >> "$STUBROOT/calls.log"
mode="${STUB_MODE:-ok}"
if [ -s "$STUBROOT/stub_seq" ]; then mode=$(head -1 "$STUBROOT/stub_seq"); sed -i.bak 1d "$STUBROOT/stub_seq"; fi
case "$mode" in
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
  */healthz) [ -f "$STUBROOT/omni_up" ] && [ ! -f "$STUBROOT/no_healthz" ] && { echo ok; exit 0; }; exit 7 ;;
  */api/health) [ -f "$STUBROOT/omni_up" ] && { echo ok; exit 0; }; exit 7 ;;
  */v1/key)  cat >/dev/null; [ -f "$STUBROOT/keyjson" ] && { cat "$STUBROOT/keyjson"; exit 0; }; exit 22 ;;
esac
exit 22
STUB
chmod +x "$BIN/claude" "$BIN/curl"
export PATH="$BIN:$PATH"

# ------------------------------------------------------------------ helpers
fresh() { # wipe all state; write the omniroute key file; omni up
  rm -rf "$ROOT/stub_seq" "$HOME/.claude" "$HOME/.config" "$HOME/.local" "$HOME/Library" "$HOME/Applications" "$ROOT/no_healthz" "$ROOT/launchctl.log" "$ROOT/calls.log" "$ROOT/curl.log" "$ROOT/keyjson"
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


# ================================================================== 9. /api/health is accepted as well as /healthz
sect "OmniRoute that only serves /api/health still counts as healthy (a likely real-world blocker)"
fresh; set_route free-fallback; : > "$ROOT/no_healthz"
run --task "$OKTASK" -p 'hi'
eq "runs on tier 2" "$RC" 0; has "tier 2" "$(lastcall)" "BASE=http://127.0.0.1:20128"

# ================================================================== 10. --doctor
sect "--doctor"
XBIN="$ROOT/xbin"; mkdir -p "$XBIN"
cat > "$XBIN/omniroute" <<'STUB'
#!/usr/bin/env bash
case "$1" in --version) echo "omniroute ${STUB_OMNI_VER:-3.8.50}" ;; providers) [ "${STUB_PROVIDERS:-yes}" = yes ] && printf 'ID  STATUS\nnvidia connected\nopenrouter-free connected\n' ;; esac
exit 0
STUB
cat > "$XBIN/launchctl" <<'STUB'
#!/usr/bin/env bash
case "$1" in list) [ -f "$STUBROOT/agent_loaded" ] && printf '123\t0\tcom.stevenshearrill.omniroute-probe\n' ;; load) printf 'load %s\n' "$*" >> "$STUBROOT/launchctl.log"; : > "$STUBROOT/agent_loaded" ;; esac
exit 0
STUB
cat > "$XBIN/runnerctl" <<'STUB'
#!/usr/bin/env bash
cat "$STUBROOT/runnerlist" 2>/dev/null
STUB
chmod +x "$XBIN/omniroute" "$XBIN/launchctl" "$XBIN/runnerctl"
good_world() { # a Mac where every precondition holds
  fresh; rm -f "$ROOT/agent_loaded" "$ROOT/runnerlist"
  mkdir -p "$HOME/.local/bin" "$HOME/Library/LaunchAgents" "$STATE" "$HOME/.config/claude-runner"
  cp "$AUTO" "$HOME/.local/bin/claude-auto"; cp "$PROBE" "$HOME/.local/bin/probe.sh"; chmod +x "$HOME/.local/bin/claude-auto" "$HOME/.local/bin/probe.sh"
  printf 'OMNIROUTE_API_KEY=%s\n' "$DOC_SECRET" > "$OCFG/.env"; chmod 600 "$OCFG/.env"
  echo '<plist/>' > "$HOME/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist"; : > "$ROOT/agent_loaded"
  printf 'peer\n' > "$HOME/.config/claude-runner/role"; chmod 600 "$HOME/.config/claude-runner/role"
  set_route subscription
  printf '2026-10-09T10:00:00Z task=x rc=1 pii=0 branch=usage-limit bytes=10 sha256=ab\n' > "$STATE/limit-samples.log"
  printf 'weather-news-refresh  claude-auto --task weather-news-refresh -p x\nr10-automation-health  claude-auto --task r10-automation-health -p y\n' > "$ROOT/runnerlist"
  PATH_SAVE="$PATH"
}
doctor() { PATH="$HOME/.local/bin:$XBIN:$PATH_SAVE" "$AUTO" --doctor > "$ROOT/doc" 2>&1; RC=$?; }
DOC_SECRET="doctor-secret-VALUE-must-not-print-123"
good_world
find "$HOME" -type f -exec cksum {} + 2>/dev/null | sort > "$ROOT/before"; : > "$ROOT/calls.log"
doctor
eq "healthy Mac: exit 0" "$RC" 0
has "summary line" "$(cat "$ROOT/doc")" "0 FAIL"
hasnt "no FAIL lines" "$(cat "$ROOT/doc")" "FAIL  "
hasnt "key value never printed" "$(cat "$ROOT/doc")" "$DOC_SECRET"
find "$HOME" -type f -exec cksum {} + 2>/dev/null | sort > "$ROOT/after"
eq "doctor is read-only (no file created, changed or removed)" "$(cmp -s "$ROOT/before" "$ROOT/after" && echo same || echo changed)" same
eq "doctor never called claude" "$(calls)" 0
for want in "/healthz" "omniroute 3.8.50" "mode 600" "OMNIROUTE_API_KEY is set" "providers list printed" "matches" "probe.sh sits next" "LaunchAgent is loaded" "lease role: peer" "state/mode=subscription" "limit detection" "use claude-auto"; do has "PASS line: $want" "$(cat "$ROOT/doc")" "$want"; done
has "shows claude / claude-auto paths" "$(cat "$ROOT/doc")" "claude-auto ->"

good_world; omni_down; doctor
eq "OmniRoute down: exit 1" "$RC" 1; has "FAIL names it with a fix" "$(cat "$ROOT/doc")" "FAIL  OmniRoute does not answer"
good_world; : > "$ROOT/no_healthz"; doctor
has "only /api/health: PASS" "$(cat "$ROOT/doc")" "/api/health"; eq "exit 0" "$RC" 0
good_world; chmod 644 "$OCFG/.env"; doctor
has "env mode 644 FAIL + chmod fix" "$(cat "$ROOT/doc")" "chmod 600"; eq "exit 1" "$RC" 1
good_world; printf 'OMNIROUTE_API_KEY=\n' > "$OCFG/.env"; chmod 600 "$OCFG/.env"; doctor
has "empty key FAIL" "$(cat "$ROOT/doc")" "FAIL  OMNIROUTE_API_KEY is empty"
good_world; rm -f "$OCFG/.env"; doctor
has "missing env FAIL" "$(cat "$ROOT/doc")" "is missing"
good_world; STUB_PROVIDERS=no doctor
has "no providers FAIL" "$(cat "$ROOT/doc")" "lists no providers"
good_world; STUB_OMNI_VER=3.7.1 doctor
has "old omniroute FAIL" "$(cat "$ROOT/doc")" "older than 3.8.50"
good_world; echo '# drift' >> "$HOME/.local/bin/claude-auto"; doctor
has "stale installed launcher FAIL" "$(cat "$ROOT/doc")" "differs from"
good_world; rm -f "$HOME/.local/bin/probe.sh"; doctor
has "missing probe FAIL" "$(cat "$ROOT/doc")" "probe.sh is not installed"
good_world; rm -f "$HOME/.local/bin/claude-auto"; doctor
has "missing claude-auto FAIL" "$(cat "$ROOT/doc")" "claude-auto is not installed"
good_world; rm -f "$ROOT/agent_loaded"; doctor
has "agent not loaded FAIL + load fix" "$(cat "$ROOT/doc")" "launchctl load -w"
good_world; rm -f "$HOME/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist"; doctor
has "no plist FAIL" "$(cat "$ROOT/doc")" "plist missing"
good_world; rm -f "$HOME/.config/claude-runner/role"; doctor
has "no role file WARN" "$(cat "$ROOT/doc")" "WARN  lease role defaults to standby"; eq "WARN alone exits 0" "$RC" 0
good_world; mkdir -p "$HOME/Applications/claude-fallback"; printf '#!/bin/sh\nexit 0\n' > "$HOME/Applications/claude-fallback/claude-auto"; chmod +x "$HOME/Applications/claude-fallback/claude-auto"
PATH="$HOME/Applications/claude-fallback:$HOME/.local/bin:$XBIN:$PATH_SAVE" "$AUTO" --doctor > "$ROOT/doc" 2>&1; RC=$?
has "older claude-auto shadowing the new one FAIL" "$(cat "$ROOT/doc")" "older one shadows"
has "old launcher flagged as the one that runs" "$(cat "$ROOT/doc")" "OLD launcher"
eq "exit 1" "$RC" 1
good_world; mkdir -p "$HOME/Applications/claude-fallback"; echo "export PATH=\$HOME/Applications/claude-fallback:\$PATH" > "$HOME/.zshrc"; doctor
has "old launcher referenced from .zshrc" "$(cat "$ROOT/doc")" ".zshrc"
good_world; printf 'weather  claude -p x\nother  claude-auto -p y\n' > "$ROOT/runnerlist"; doctor
has "tasks without --task WARN" "$(cat "$ROOT/doc")" "only 0 pass --task"
good_world; printf 'a  claude -p x\n' > "$ROOT/runnerlist"; doctor
has "no task uses claude-auto WARN" "$(cat "$ROOT/doc")" "none of 1 runnerctl lines mention claude-auto"
good_world; : > "$STATE/limit-samples.log"; doctor
has "no limit ever detected WARN" "$(cat "$ROOT/doc")" "no limit has ever been detected"
good_world; set_route free-fallback; touch -d '2 days ago' "$STATE/mode"; doctor
has "stale non-subscription mode WARN" "$(cat "$ROOT/doc")" "WARN  state/mode=free-fallback"
good_world; printf '%s task=weather-news-refresh route=free-fallback\n' "2026-10-09T10:00:00Z" > "$STATE/claude-auto.log"; doctor
has "log tail shown" "$(cat "$ROOT/doc")" "| 2026-10-09T10:00:00Z task=weather-news-refresh"

# ================================================================== 11. installer
sect "install-failover.sh (stubs, temp HOME)"
INST="$HERE/install-failover.sh"
run_inst() { # answers-string args… ; stdin = one answer per line
  _ans="$1"; shift
  printf '%b' "$_ans" | PATH="$XBIN:$PATH_SAVE" "$INST" "$@" > "$ROOT/inst.out" 2>&1; RC=$?
}
files_hash() { find "$HOME" -type f -exec cksum {} + 2>/dev/null | sort | cksum; }
good_world; rm -rf "$HOME/.local" "$HOME/Library" "$HOME/.config/claude-runner" "$OCFG"; : > "$ROOT/calls.log"
before=$(files_hash); run_inst '' --dry-run
eq "dry-run changes nothing" "$(files_hash)" "$before"
has "dry-run says what it would ask" "$(cat "$ROOT/inst.out")" "would ask: Install"
has "dry-run still runs the doctor" "$(cat "$ROOT/inst.out")" "claude-auto --doctor"
run_inst ''
eq "EOF on stdin = all N: nothing created" "$(files_hash)" "$before"
run_inst 'n\nn\nn\nn\nn\nn\n'
eq "explicit n everywhere: nothing created" "$(files_hash)" "$before"
run_inst 'banana\n\nno\nN\nx\nx\n'
eq "anything but y/yes is no" "$(files_hash)" "$before"
run_inst 'y\ny\ny\ny\ny\ny\n'
okc "claude-auto installed, executable" test -x "$HOME/.local/bin/claude-auto"
okc "claude-auto is the repo copy" cmp -s "$AUTO" "$HOME/.local/bin/claude-auto"
okc "probe.sh is the repo copy, next to claude-auto" cmp -s "$PROBE" "$HOME/.local/bin/probe.sh"
eq "role file says peer" "$(tr -d '\n' < "$HOME/.config/claude-runner/role")" peer
eq ".env holds the key NAME only (empty)" "$(cat "$OCFG/.env")" "OMNIROUTE_API_KEY="
eq ".env is chmod 600" "$(stat -c %a "$OCFG/.env")" 600
has "plist has the label" "$(cat "$HOME/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist")" "<string>com.stevenshearrill.omniroute-probe</string>"
has "plist runs probe.sh every 900 s" "$(cat "$HOME/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist")" "<integer>900</integer>"
has "plist points at the installed probe.sh" "$(cat "$HOME/Library/LaunchAgents/com.stevenshearrill.omniroute-probe.plist")" "$HOME/.local/bin/probe.sh"
has "launchctl load called" "$(cat "$ROOT/launchctl.log" 2>/dev/null)" "load -w"
has "tells Steven to paste the key himself" "$(cat "$ROOT/inst.out")" "YOU paste the key"
has "prints the runner-task lines instead of editing them" "$(cat "$ROOT/inst.out")" "claude-auto --task <that-task's-own-name>"
has "ends with the doctor" "$(cat "$ROOT/inst.out")" "doctor:"
eq "never touched claude or any Claude config" "$(calls)" 0
eq "no ~/.claude created" "$([ -e "$HOME/.claude" ] && echo yes || echo no)" no
hasnt "installer never prints a key value" "$(cat "$ROOT/inst.out")" "$DOC_SECRET"
printf 'OMNIROUTE_API_KEY=pasted-by-steven\n' > "$OCFG/.env"; h1=$(cksum < "$OCFG/.env")
run_inst 'n\nn\nn\nn\n'
eq "re-run leaves an existing .env alone" "$(cksum < "$OCFG/.env")" "$h1"
hasnt "re-run does not re-ask to copy identical files" "$(cat "$ROOT/inst.out")" "Install $HOME/.local/bin/claude-auto"
echo '# local edit' >> "$HOME/.local/bin/claude-auto"
run_inst 'y\nn\nn\nn\n'
okc "differing install replaced on yes" cmp -s "$AUTO" "$HOME/.local/bin/claude-auto"
eq "old copy kept as .bak" "$(find "$HOME/.local/bin" -name 'claude-auto.bak*' | wc -l | tr -d ' ')" 1
chmod 644 "$OCFG/.env"; run_inst 'n\nn\nn\ny\n' 
eq "offers chmod 600 for a loose .env (asked once)" "$(grep -c 'the launcher refuses any other mode' "$ROOT/inst.out")" 1

# ================================================================== 12. --interactive-free (human-present opt-in)
sect "--interactive-free: explicit, tty-only, banner, guard hook, PII-refused, default off"
need_script=$(command -v script || true)
if [ -z "$need_script" ]; then fail "script(1) is needed to give the tests a pty" "install util-linux/bsdutils"; else
ipty() { # typed-answer args… : run claude-auto under a pty, answer typed on its stdin
  _t="$1"; shift
  printf '%s\n' "$_t" | script -qec "$AUTO --no-lease $*" "$ROOT/typescript" >/dev/null 2>&1; RC=$?
}
fresh; set_route subscription; export CLAUDE_CODE_OAUTH_TOKEN=oauth-not-real
run --interactive-free
eq "no tty: refused (77)" "$RC" 77; eq "no claude call" "$(calls)" 0
ipty FREE --interactive-free
eq "typed FREE under a pty: starts (rc 0)" "$RC" 0
has "launched on OmniRoute" "$(lastcall)" "BASE=http://127.0.0.1:20128"
has "free combo model" "$(lastcall)" "MODEL=auto/coding:free"
has "interactive marker exported" "$(lastcall)" "IFREE=1"
has "client-data guard settings passed" "$(lastcall)" "--settings $STATE/interactive-free-settings.json"
has "subscription token not passed" "$(lastcall)" "OAUTH= "
has "banner shown" "$(cat "$ROOT/typescript")" "FREE ROUTE - no client data, nothing from CRM/ISA/loan files"
eq "route state untouched (still subscription)" "$(modeof)" subscription
SJ="$STATE/interactive-free-settings.json"
eq "settings file is owner-only" "$(stat -c %a "$SJ")" 600
has "settings: UserPromptSubmit hook" "$(cat "$SJ")" "UserPromptSubmit"
has "settings: PreToolUse hook" "$(cat "$SJ")" "PreToolUse"
has "settings: hook runs claude-auto --guard-hook" "$(cat "$SJ")" "--guard-hook"
okc "settings file is valid JSON" python3 -c "import json,sys;json.load(open(sys.argv[1]))" "$SJ"
fresh; set_route subscription
ipty no --interactive-free
eq "anything but FREE cancels (rc 1)" "$RC" 1; eq "no claude call" "$(calls)" 0
ipty "" --interactive-free
eq "empty answer cancels" "$RC" 1; eq "no claude call" "$(calls)" 0
for t in lofty-crm-sync Lofty-CRM-Refresh isa-daily-report r12-inbox-triage client-followup; do
  ipty FREE --interactive-free --task "$t"
  eq "PII task '$t' refused (77), FREE typed" "$RC" 77; eq "'$t': no claude call" "$(calls)" 0
done
ipty FREE --interactive-free --pii
eq "--pii refused" "$RC" 77
ipty FREE --interactive-free -p hi
eq "headless refused (64)" "$RC" 64
mkdir -p "$ROOT/wiki/clients/jane"; (cd "$ROOT/wiki/clients/jane" && printf 'FREE\n' | script -qec "$AUTO --no-lease --interactive-free" "$ROOT/typescript" >/dev/null 2>&1); RC=$?
eq "client-looking cwd refused (77)" "$RC" 77; eq "no claude call" "$(calls)" 0
omni_down; ipty FREE --interactive-free
eq "OmniRoute down: exit 75, nothing started" "$RC" 75; eq "no claude call" "$(calls)" 0; omni_up
ipty FREE --interactive-free --task "$OKTASK"
eq "a non-client task name is allowed" "$RC" 0
fresh; set_route free-fallback
printf '' | script -qec "$AUTO --no-lease" "$ROOT/typescript" >/dev/null 2>&1; RC=$?
eq "DEFAULT OFF: plain interactive on the free route is still deferred" "$RC" 75; eq "no claude call" "$(calls)" 0

sect "--keep-going: Claude -> OmniRoute free at the limit -> Claude again, same conversation"
kpty() { # typed-lines args… (lines separated by |)
  _t="$1"; shift
  printf '%s\n' "$_t" | tr '|' '\n' | script -qec "$AUTO --no-lease $*" "$ROOT/typescript" >/dev/null 2>&1; RC=$?
}
fresh; set_route subscription
kpty q --keep-going
eq "off until auto-continue exists (77)" "$RC" 77; eq "no claude call" "$(calls)" 0
fresh; set_route subscription; : > "$OCFG/auto-continue"
printf 'ok\nok\n' > "$ROOT/stub_seq"
kpty q --keep-going
eq "subscription usable: quits cleanly" "$RC" 0
eq "probe + one session" "$(calls)" 2
has "session on the subscription (no proxy)" "$(lastcall)" "BASE=unset"
hasnt "first leg is not --continue" "$(lastcall)" "--continue"
fresh; set_route subscription; : > "$OCFG/auto-continue"
printf 'limit\nok\nok\nok\n' > "$ROOT/stub_seq"
kpty "|q" --keep-going
eq "limit then reset: rc 0" "$RC" 0
L2=$(sed -n 2p "$ROOT/calls.log"); L4=$(sed -n 4p "$ROOT/calls.log")
has "at the limit the session runs on OmniRoute" "$L2" "BASE=http://127.0.0.1:20128"
has "free leg carries the guard hook" "$L2" "--settings $STATE/interactive-free-settings.json"
has "after reset: back on the subscription" "$L4" "BASE=unset"
has "after reset: same conversation (--continue)" "$L4" "--continue"
fresh; set_route subscription; : > "$OCFG/auto-continue"
printf 'ok\nok\nlimit\nok\n' > "$ROOT/stub_seq"
kpty "|q" --keep-going
L4=$(sed -n 4p "$ROOT/calls.log")
has "limit mid-day: next leg on OmniRoute" "$L4" "BASE=http://127.0.0.1:20128"
has "and it continues the same conversation" "$L4" "--continue"
has "route recorded as free-fallback" "$(cat "$STATE/mode")" "free-fallback"
fresh; set_route subscription; : > "$OCFG/auto-continue"
PD="$HOME/.claude/projects/$(printf '%s' "$PWD" | sed 's#[/.]#-#g')"; mkdir -p "$PD"
printf '{"message":"borrower file for the Lofty lead"}\n' > "$PD/s.jsonl"
printf 'ok\nok\nlimit\nok\n' > "$ROOT/stub_seq"
kpty "|q" --keep-going
L4=$(sed -n 4p "$ROOT/calls.log")
has "client-data transcript: still free route" "$L4" "BASE=http://127.0.0.1:20128"
hasnt "but a NEW conversation, not --continue" "$L4" "--continue"
fresh; set_route subscription; : > "$OCFG/auto-continue"; omni_down
printf 'limit\nok\nok\n' > "$ROOT/stub_seq"
kpty "q" --keep-going
eq "limit + OmniRoute down: only the probe ran" "$(calls)" 1
unset CLAUDE_CODE_OAUTH_TOKEN
fi

sect "the guard hook itself"
fresh; set_route free-fallback
g() { printf '%s' "$1" | "$AUTO" --guard-hook >/dev/null 2>"$ROOT/gerr"; RC=$?; }
g '{"prompt":"summarize wiki/clients/jane-sample.md"}'; eq "client wiki path blocked" "$RC" 2
g '{"prompt":"ssn is 123-45-6789"}'; eq "SSN shape blocked" "$RC" 2
g '{"tool_name":"Bash","tool_input":{"command":"cat ~/.config/omniroute/.env"}}'; eq "credential file read blocked" "$RC" 2
g '{"tool_name":"Read","tool_input":{"file_path":"/x/lofty-export.csv"}}'; eq "CRM export blocked" "$RC" 2
g '{"prompt":"what is the weather in San Diego","cwd":"/Users/s/clients/x","transcript_path":"/u/crm/t.jsonl"}'; eq "benign prompt passes; cwd/transcript_path are not scanned" "$RC" 0
g ''; eq "empty input fails closed" "$RC" 2
g '{"prompt":"ssn 123-45-6789"}'
hasnt "log never holds the blocked content" "$(cat "$STATE/claude-auto.log")" "123-45-6789"
has "log records that it blocked" "$(cat "$STATE/claude-auto.log")" "guard-hook: BLOCKED"

printf '\n------------------------------------------------------------\npass %s   FAIL %s\n' "$N_PASS" "$N_FAIL"
[ "$N_FAIL" -eq 0 ]
