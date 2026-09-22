#!/usr/bin/env bash
# probe.sh — proves the Claude subscription is usable again and restores mode=subscription for claude-auto.sh.
# Runs every 15 min from a LaunchAgent (plist in README.md). No LLM work except one 1-turn, no-tool probe,
# which costs a handful of tokens when the subscription is fine and nothing when it is still limited.
# Usage: probe.sh [--now] [--check]   --now: ignore reset_at and probe immediately · --check: probe even in subscription mode
# Spec: integrations/omniroute-failover/README.md · written 2026-09-22 · NOT yet installed on the Mac. No secrets here.
set -u
CFG="${OMNIROUTE_CFG:-$HOME/.config/omniroute}"; STATE="$CFG/state"; mkdir -p "$STATE"
ROUTE="$STATE/route.env"; MODEFILE="$STATE/mode"; LOG="$STATE/probe.log"; SAMPLES="$STATE/limit-samples.log"
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
PROBE_MODEL="${OMNIROUTE_PROBE_MODEL:-sonnet}"
LIMIT_RE='usage limit|hit your [a-z ]{0,12}limit|limit (has been )?reached|out of (extra )?usage|resets? (at|in) |rate_limit(_error)?|"error": ?"rate_limit"|[^0-9]429[^0-9]'

NOW_FLAG=0; CHECK=0; for a in "$@"; do case "$a" in --now) NOW_FLAG=1 ;; --check) CHECK=1 ;; esac; done
log()  { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$LOG"; }
redact() { sed -E 's/(sk|key|token|Bearer)[-_ ][A-Za-z0-9_-]{6,}/\1-…/g' | tr -d '\r' | head -c 300; }
read_route() { mode=subscription; since=0; reset_at=0; reason=; omni_ok=1; probed_at=0; [ -f "$ROUTE" ] && . "$ROUTE"; }
write_route() { r=$(printf '%s' "$4" | tr -c 'A-Za-z0-9 _.:=-' '_')
  printf 'mode=%s\nsince=%s\nreset_at=%s\nreason=%s\nomni_ok=%s\nprobed_at=%s\n' "$1" "$2" "$3" "'$r'" "$5" "$6" > "$ROUTE"
  printf '%s\n' "$1" > "$MODEFILE"; }

read_route
t=$(date +%s)
if [ "$mode" = subscription ] && [ $CHECK = 0 ]; then exit 0; fi
if [ $NOW_FLAG = 0 ] && [ "${reset_at:-0}" -gt $((t + 60)) ]; then log "waiting: mode=$mode reset_at=$reset_at"; exit 0; fi

# 1. OmniRoute liveness — only matters while we depend on it; recorded so claude-auto can defer instead of failing
if curl -fsS --max-time 5 "$OMNI_BASE/healthz" >/dev/null 2>&1; then omni=1; else omni=0; log "omniroute $OMNI_BASE/healthz DOWN"; fi

# 2. The subscription probe: one turn, no tools, no session file, proxy variables stripped so it cannot hit OmniRoute
out=$(env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY \
      claude -p 'Reply with exactly: OK' --model "$PROBE_MODEL" --max-turns 1 --output-format json \
             --no-session-persistence --disallowedTools '*' 2>&1); rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -qE '"is_error": ?false'; then
  write_route subscription "$t" 0 "probe-ok" "$omni" "$t"
  log "RESTORED: subscription usable again (was mode=$mode since=$since)"; exit 0
elif printf '%s' "$out" | grep -qiE "$LIMIT_RE"; then
  epoch=$(printf '%s' "$out" | grep -oE '\|[0-9]{10}' | head -1 | tr -d '|'); [ -n "$epoch" ] || epoch=0
  [ "$mode" = subscription ] && mode=free-fallback
  write_route "$mode" "${since:-$t}" "$epoch" "still-limited" "$omni" "$t"
  log "still limited: mode=$mode reset_at=$epoch omni_ok=$omni"; exit 0
else
  write_route "$mode" "${since:-$t}" "${reset_at:-0}" "probe-unknown rc=$rc" "$omni" "$t"
  { printf '%s probe rc=%s sample=' "$(date -u +%FT%TZ)" "$rc"; printf '%s' "$out" | redact; echo; } >> "$SAMPLES"
  log "probe inconclusive (rc=$rc) — mode kept: $mode; sample appended to $SAMPLES"; exit 1
fi
