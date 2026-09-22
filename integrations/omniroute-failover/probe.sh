#!/usr/bin/env bash
# probe.sh — proves the Claude subscription is usable again and restores mode=subscription for claude-auto.sh.
# Runs every 15 min from a LaunchAgent (plist in README.md). No LLM work except one 1-turn, no-tool probe,
# which costs a handful of tokens when the subscription is fine and nothing when it is still limited.
# Usage: probe.sh [--now] [--check]   --now: ignore reset_at and probe immediately · --check: probe even in subscription mode
# Exit 0 = conclusive (restored, or still limited). Exit 1 = inconclusive; after OMNIROUTE_PROBE_MAX_FAIL of those in a
# row it ESCALATES: writes state/NEEDS-STEVEN and falls the route back to plain `claude` (mode=subscription) so a broken
# probe can never strand the Mac on free providers (H3, 2026-09-22, closes F-V2-11/12).
# Spec: integrations/omniroute-failover/README.md · written 2026-09-22 · NOT yet installed on the Mac. No secrets here.
# Written for macOS bash 3.2; BSD and GNU userland.
set -u
set -f
umask 077
CFG="${OMNIROUTE_CFG:-$HOME/.config/omniroute}"; STATE="$CFG/state"; mkdir -p "$STATE" && chmod 700 "$STATE"
ROUTE="$STATE/route.env"; MODEFILE="$STATE/mode"; LOG="$STATE/probe.log"; SAMPLES="$STATE/limit-samples.log"
MARKER="$STATE/NEEDS-STEVEN"; FAILS="$STATE/probe-failures"
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
PROBE_MODEL="${OMNIROUTE_PROBE_MODEL:-sonnet}"
PROBE_MAX_FAIL="${OMNIROUTE_PROBE_MAX_FAIL:-4}"           # consecutive inconclusive probes before escalation (4 × 15 min = 1 h)
PROBE_FORCE_AGE="${OMNIROUTE_PROBE_FORCE_AGE:-21600}"     # probe at least this often (6 h) even while reset_at is in the future
RESET_MAX_AHEAD="${OMNIROUTE_RESET_MAX_AHEAD:-172800}"    # a reset epoch more than 48 h out is a parse failure, not a wait
# Same vocabulary and the same envelope rule as claude-auto.sh (F-V2-10); keep the two in step.
LIMIT_RE='usage limit|you.{0,3}ve hit your ([a-z]+ ){0,2}limit|(usage|rate|spend|weekly|session|monthly) limit (has been )?reached|out of (extra )?usage|rate_limit(_error)?|"error": ?"rate_limit"|rate limited|(api error|http|status|code)[ :="]*429([^0-9]|$)|429 too many requests'

NOW_FLAG=0; CHECK=0; for a in "$@"; do case "$a" in --now) NOW_FLAG=1 ;; --check) CHECK=1 ;; esac; done
log()  { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$LOG"; }
write_marker() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$MARKER"; }
# Redaction for the probe's own diagnostic sample (F-V2-13). Four rules, in order: (1) an identifier containing
# key/token/secret/pass/auth/cred, then = or :, then the value — NAME=value, name: value, "name":"value",
# x-api-key: value, and Authorization: Bearer value (the scheme word is swallowed with the value); (2) the same
# words followed by whitespace or a dash and an 8+ char run — the CLI-flag form (--api-key value, token value);
# (3) bare sk-… / Bearer … / ghp_ / xox tokens; (4) any 32+ char opaque run. Case-insensitive through bracket
# classes: BSD sed has no I flag. Keep in step with redact_line() in mac-verify.sh.
redact() {
  sed -E \
    -e 's/([A-Za-z0-9_.-]*([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][A-Za-z]*|[Aa][Uu][Tt][Hh][A-Za-z]*|[Cc][Rr][Ee][Dd][A-Za-z]*)[A-Za-z0-9_.-]*["'"'"']?[[:space:]]*[=:][[:space:]]*["'"'"']?)(([Bb][Ee][Aa][Rr][Ee][Rr]|[Bb][Aa][Ss][Ii][Cc]|[Tt][Oo][Kk][Ee][Nn])[[:space:]]+)?[^[:space:]"'"'"',;}]+/\1[REDACTED]/g' \
    -e 's/(([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][Ww]?[Oo]?[Rr]?[Dd]?)[-_[:space:]]+)[A-Za-z0-9._-]{8,}/\1[REDACTED]/g' \
    -e 's/(sk-(ant-)?|[Bb][Ee][Aa][Rr][Ee][Rr][[:space:]]+|ghp_|xox[a-z]-)[A-Za-z0-9._-]{6,}/\1[REDACTED]/g' \
    -e 's/[A-Za-z0-9+\/_=.-]{32,}/[REDACTED-LONG]/g' | tr -d '\r' | head -c 200
}
filemode() {
  _m=$(stat -c '%a' "$1" 2>/dev/null || true)
  case "${_m:-x}" in ''|*[!0-7]*) _m='' ;; esac
  if [ -z "$_m" ]; then
    _m=$(stat -f '%OLp' "$1" 2>/dev/null || true)
    case "${_m:-x}" in ''|*[!0-7]*) _m='?' ;; esac
  fi
  printf '%s' "$_m"
}
fileowner() {
  _u=$(stat -c '%u' "$1" 2>/dev/null || true)
  case "${_u:-x}" in ''|*[!0-9]*) _u='' ;; esac
  if [ -z "$_u" ]; then
    _u=$(stat -f '%u' "$1" 2>/dev/null || true)
    case "${_u:-x}" in ''|*[!0-9]*) _u='?' ;; esac
  fi
  printf '%s' "$_u"
}
hash256() {
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -c1-64
  elif command -v sha256sum >/dev/null 2>&1; then sha256sum | cut -c1-64
  else cksum | awk '{printf "cksum:%-58s", $1}'; fi
}
rotate() { [ -f "$1" ] && [ "$(wc -l < "$1" | tr -d ' ')" -gt "$2" ] && { tail -n "$2" "$1" > "$1.tmp" && mv "$1.tmp" "$1"; }; return 0; }
route_get() { _v=$(sed -n "s/^$1=//p" "$ROUTE" 2>/dev/null | tail -1); printf '%s' "$_v" | tr -d "'\"" | tr -c 'A-Za-z0-9 _.:=/-' '_'; }
route_num() { _v=$(route_get "$1"); case "$_v" in ''|*[!0-9]*) printf '%s' "$2" ;; *) printf '%s' "$_v" ;; esac; }
route_file_trusted() {
  [ -f "$1" ] && [ ! -L "$1" ] || return 1
  [ "$(fileowner "$1")" = "$(id -u)" ] || return 1
  case "$(filemode "$1")" in 600|400) return 0 ;; esac
  return 1
}
# shellcheck disable=SC2034  # reason is read for completeness (claude-auto --status shows it); the probe decides on mode/reset_at/probed_at
read_route() { # parsed and validated, never sourced (F-V2-18)
  mode=subscription; since=0; reset_at=0; reason=; omni_ok=1; probed_at=0
  [ -e "$ROUTE" ] || return 0
  if ! route_file_trusted "$ROUTE"; then
    # Not ours, or writable by others: its content is untrusted and is RESET, not merely skipped — otherwise the
    # next run would trust whatever was planted once the mode is fixed. subscription is the safe route; a limited
    # subscription simply gets re-detected on the next headless run.
    log "WARN $ROUTE is not a plain owner-only file (mode $(filemode "$ROUTE"), owner $(fileowner "$ROUTE")) — content discarded, route reset to subscription"
    rm -f "$ROUTE"; write_route subscription "$(date +%s)" 0 "untrusted-route-file-reset" 1 0; return 0
  fi
  mode=$(route_get mode); [ -n "$mode" ] || mode=subscription
  since=$(route_num since 0); reset_at=$(route_num reset_at 0); probed_at=$(route_num probed_at 0)
  omni_ok=$(route_get omni_ok); case "$omni_ok" in 0|1) ;; *) omni_ok=1 ;; esac
  reason=$(route_get reason)
  _t=$(date +%s)
  if [ "$reset_at" -ne 0 ] && { [ "$reset_at" -lt $((_t - 3600)) ] || [ "$reset_at" -gt $((_t + RESET_MAX_AHEAD)) ]; }; then
    log "WARN reset_at=$reset_at in $ROUTE is outside the sane window — treated as 0 (probe now)"; reset_at=0
  fi
}
write_route() { r=$(printf '%s' "$4" | tr -c 'A-Za-z0-9 _.:=/-' '_')
  printf 'mode=%s\nsince=%s\nreset_at=%s\nreason=%s\nomni_ok=%s\nprobed_at=%s\n' "$1" "$2" "$3" "'$r'" "$5" "$6" > "$ROUTE"
  printf '%s\n' "$1" > "$MODEFILE"; }
envelope_text() { # stdin: the probe's combined output → the error envelope only (F-V2-10)
  _o=$(cat)
  if printf '%s\n' "$_o" | grep -qE '^\{.*"type": ?"result"'; then
    printf '%s\n' "$_o" | grep -E '^\{.*"type": ?"result"' | tail -1 | grep -oE '"(result|error|errors|message|subtype)": ?("(\\.|[^"\\])*"|\{[^}]{0,400}|\[[^]]{0,400})'
  else printf '%s\n' "$_o" | tail -n 5; fi
}
limit_branch() {
  _t=$(cat)
  for _b in 'usage limit:usage-limit' 'hit your:hit-your-limit' 'limit (has been )?reached:limit-reached' 'out of (extra )?usage:out-of-usage' 'rate_limit:rate_limit-token' 'rate limited:rate-limited'; do
    if printf '%s' "$_t" | grep -qiE "${_b%%:*}"; then printf '%s' "${_b#*:}"; return; fi
  done
  printf 'http-429'
}
parse_reset_epoch() { # stdin → epoch or 0; only "limit reached|<epoch>", clamped to now-1h..now+48h (F-V2-12)
  _e=$(grep -oiE 'limit reached[|][0-9]{10}' | head -1 | grep -oE '[0-9]{10}$'); _n=$(date +%s)
  [ -n "$_e" ] || { echo 0; return; }
  if [ "$_e" -lt $((_n - 3600)) ] || [ "$_e" -gt $((_n + RESET_MAX_AHEAD)) ]; then log "reset epoch $_e is outside now-1h..now+${RESET_MAX_AHEAD}s — treated as unknown (0)"; echo 0; return; fi
  echo "$_e"
}
fail_count() { _c=''; [ -f "$FAILS" ] && _c=$(tr -dc '0-9' < "$FAILS"); printf '%s' "${_c:-0}"; }

read_route
t=$(date +%s)
if [ "$mode" = subscription ] && [ $CHECK = 0 ]; then exit 0; fi
if [ $NOW_FLAG = 0 ] && [ "$reset_at" -gt $((t + 60)) ] && [ $((t - probed_at)) -lt "$PROBE_FORCE_AGE" ]; then
  log "waiting: mode=$mode reset_at=$reset_at (forced re-probe when probed_at is ${PROBE_FORCE_AGE}s old)"; exit 0
fi

# 1. OmniRoute liveness — only matters while we depend on it; recorded so claude-auto can defer instead of failing
if curl -fsS --max-time 5 "$OMNI_BASE/healthz" >/dev/null 2>&1; then omni=1; else omni=0; log "omniroute $OMNI_BASE/healthz DOWN"; fi

# 2. The subscription probe: one turn, no tools, no session file, proxy variables stripped so it cannot hit OmniRoute
out=$(env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY \
      claude -p 'Reply with exactly: OK' --model "$PROBE_MODEL" --max-turns 1 --output-format json \
             --no-session-persistence --disallowedTools '*' 2>&1); rc=$?
env_txt=$(printf '%s\n' "$out" | envelope_text)
if [ "$rc" -eq 0 ] && printf '%s' "$out" | grep -qE '"is_error": ?false'; then
  write_route subscription "$t" 0 "probe-ok" "$omni" "$t"
  printf '0\n' > "$FAILS"
  [ -f "$MARKER" ] && { rm -f "$MARKER"; log "NEEDS-STEVEN marker cleared: the probe is conclusive again"; }
  log "RESTORED: subscription usable again (was mode=$mode since=$since)"; exit 0
elif [ "$rc" -ne 0 ] && printf '%s\n' "$env_txt" | grep -qiE "$LIMIT_RE"; then
  epoch=$(printf '%s\n' "$env_txt" | parse_reset_epoch)
  [ "$mode" = subscription ] && mode=free-fallback
  write_route "$mode" "${since:-$t}" "$epoch" "still-limited" "$omni" "$t"
  printf '0\n' > "$FAILS"
  log "still limited: mode=$mode reset_at=$epoch omni_ok=$omni branch=$(printf '%s' "$env_txt" | limit_branch)"; exit 0
else
  n=$(( $(fail_count) + 1 )); printf '%s\n' "$n" > "$FAILS"
  { printf '%s probe rc=%s inconclusive=%s/%s bytes=%s sha256=%s sample=' "$(date -u +%FT%TZ)" "$rc" "$n" "$PROBE_MAX_FAIL" "$(printf '%s' "$out" | wc -c | tr -d ' ')" "$(printf '%s' "$out" | hash256)"
    printf '%s' "$env_txt" | redact; echo; } >> "$SAMPLES"      # the probe's prompt is fixed text: nothing of a client's can be in here
  rotate "$SAMPLES" 500
  if [ "$n" -ge "$PROBE_MAX_FAIL" ]; then
    write_marker "probe.sh: $n consecutive inconclusive probes (last rc=$rc) — switch-back cannot be proven, so the route fell back to plain claude (mode=subscription). Check that claude is on the LaunchAgent PATH, that its -p flags still exist, and that it is logged in; see $LOG and $SAMPLES. Delete this file once fixed."
    write_route subscription "$t" 0 "probe-inconclusive-x${n}-fallback" "$omni" "$t"
    printf '0\n' > "$FAILS"
    log "ESCALATED: $n consecutive inconclusive probes (rc=$rc) — mode=subscription (fail back to plain claude), marker written at $MARKER"; exit 1
  fi
  write_route "$mode" "${since:-$t}" "$reset_at" "probe-unknown rc=$rc ($n/$PROBE_MAX_FAIL)" "$omni" "$t"
  log "probe inconclusive (rc=$rc) $n/$PROBE_MAX_FAIL — mode kept: $mode; escalates at $PROBE_MAX_FAIL"; exit 1
fi
