#!/usr/bin/env bash
# claude-auto.sh — Claude subscription first; OmniRoute free-only providers while the subscription is
# usage-limited; back to the subscription when probe.sh proves it usable again.
#
# PII gate — FAILS CLOSED (H3, 2026-09-22, closes F-V2-07/08/09). While the route is anything but the
# subscription, an invocation reaches a free provider ONLY when
#   (a) its --task name matches the free-OK allow-list (DEFAULT_FREE_OK_TASKS + ~/.config/omniroute/free-ok-tasks.txt), or
#   (b) the caller passes an explicit --no-pii,
# and NEVER when the task name matches a client-data pattern (DEFAULT_PII_TASKS + ~/.config/omniroute/pii-tasks.txt),
# which wins over both. Everything else — no --task, an unknown task, a renamed client task — is deferred (exit 75,
# the runner retries after the reset) or, when OMNIROUTE_LOCAL_MODEL names the local Jarvis model inside OmniRoute,
# pinned to that local model. Mode is published for every task to read.
# Spec: integrations/omniroute-failover/README.md · written 2026-09-22 · NOT yet installed on the Mac.
# Usage: claude-auto [--task NAME] [--pii|--no-pii] [--force subscription|free|local] [--status] [--] <claude args…>
#   The options are recognised anywhere before `--` — argument order does not matter (F-V2-07). Every other
#   argument, and everything after `--`, is passed to claude untouched, in its original order.
# No secrets live in this file. OMNIROUTE_API_KEY is read from ~/.config/omniroute/.env (must be chmod 600).
# Written for macOS bash 3.2 (no associative arrays, no mapfile, no ${var,,}); BSD and GNU userland.
set -u
set -f                                                    # the task lists are glob PATTERNS: never let the shell expand them against the cwd
umask 077                                                 # every file this script creates is owner-only (F-V2-14/18)

CFG="${OMNIROUTE_CFG:-$HOME/.config/omniroute}"
STATE="$CFG/state"; mkdir -p "$STATE" && chmod 700 "$STATE"
ROUTE="$STATE/route.env"          # mode= since= reset_at= reason= omni_ok= probed_at=  — PARSED, never sourced (F-V2-18)
MODEFILE="$STATE/mode"            # one word for tasks to read: subscription | free-fallback | local-only
LOG="$STATE/claude-auto.log"
SAMPLES="$STATE/limit-samples.log" # one line per detected limit: exit status, matched branch, size, sha256. Never task output (F-V2-14)
MARKER="$STATE/NEEDS-STEVEN"       # visible escalation written when switch-back cannot be proven (F-V2-11)
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
FREE_MODEL="${OMNIROUTE_FREE_MODEL:-auto/coding:free}"   # OmniRoute auto-combo, free tier only (docs/routing/AUTO-COMBO.md)
LOCAL_MODEL="${OMNIROUTE_LOCAL_MODEL:-}"                  # e.g. ollama-local/llama3.1:8b once that provider exists in OmniRoute; empty = no local route
PROBE_MAX_AGE="${OMNIROUTE_PROBE_MAX_AGE:-1500}"          # seconds of stale state before the launcher re-probes on its own
PROBE_FORCE_AGE="${OMNIROUTE_PROBE_FORCE_AGE:-21600}"     # re-probe at least this often (6 h) even while reset_at is in the future (F-V2-12)
RESET_MAX_AHEAD="${OMNIROUTE_RESET_MAX_AHEAD:-172800}"    # a parsed reset epoch more than 48 h out is a parse failure, not a wait (F-V2-12)

# Usage-limit vocabulary (F-V2-10). Taken from the strings inside the Claude Code 2.1.278 binary itself (grep,
# 2026-09-22): "Usage limit reached", "You've hit your limit", "rate_limit_error", "rate limited", and the API's
# 429 — but 429 only in an HTTP/API-error context, never as a bare number ($429,000 is a loan amount). No bare
# "resets at|in" branch and no bare "limit reached": ordinary prose matches those. Matched case-insensitively,
# and ONLY against the error envelope that envelope() extracts — never against a task's output.
LIMIT_RE='usage limit|you.{0,3}ve hit your ([a-z]+ ){0,2}limit|(usage|rate|spend|weekly|session|monthly) limit (has been )?reached|out of (extra )?usage|rate_limit(_error)?|"error": ?"rate_limit"|rate limited|(api error|http|status|code)[ :="]*429([^0-9]|$)|429 too many requests'

# Free-OK allow-list: glob patterns of task names whose inputs are public or system data (weather, news, rates,
# market and model feeds, incentives, the vendored skills, doc freshness, runner health, the toolkit inventory).
# Extend it in ~/.config/omniroute/free-ok-tasks.txt (one pattern per line, # comments) — with the security
# steward's sign-off, never for a task that reads client, loan, CRM, ISA, credit, health or account data.
DEFAULT_FREE_OK_TASKS="weather-news-refresh mortgage-rates-daily r5-rates-market-refresh feeds-market-close feeds-weekly openrouter-feeds-refresh incentives-daily-scan skills-refresh-weekly r9-feed-freshness-sweep r10-automation-health toolkit-deck-sync"
# Client-data deny-list (glob patterns; wins over --no-pii and over the allow-list). Every name in the original
# exact-match list is covered by a pattern here, and so are its renames (lofty-crm-sync-v2 — F-V2-09).
DEFAULT_PII_TASKS="lofty-* zoho-* *crm* isa-* *-isa-* lead-* *-lead-* r12-inbox-* r13-appointment-* showing-* steve-twin-* vanessa-imessage-* vanessa-discord-* vanessa-whatsapp-* vanessa-morning-* vanessa-significant-* vanessa-sweep vanessa-ops-review health-* r8-apple-health-* strava-* calendar-* r1-morning-brief r3-eod-rollup r7-plaid-* r4-quantvue-* r17-trading-* coach-* month-end-* mortgage-desk-* revenue-* *client* *loan* *borrower* *inbox* *pii*"

log()  { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$LOG"; }
now()  { date +%s; }
write_marker() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$MARKER"; }
usage_err() { echo "claude-auto: $*" >&2; echo "usage: claude-auto [--task NAME] [--pii|--no-pii] [--force subscription|free|local] [--status] [--] <claude args…>" >&2; exit 64; }

# GNU stat first and validated: on Linux `stat -f` means "file SYSTEM status" and succeeds with the wrong output,
# so a BSD-first fallback prints a filesystem report as a file mode (F-V2-15). Same shape as mac-verify.sh.
filemode() {
  _m=$(stat -c '%a' "$1" 2>/dev/null || true)
  case "${_m:-x}" in ''|*[!0-7]*) _m='' ;; esac
  if [ -z "$_m" ]; then
    _m=$(stat -f '%OLp' "$1" 2>/dev/null || true)          # macOS / BSD
    case "${_m:-x}" in ''|*[!0-7]*) _m='?' ;; esac
  fi
  printf '%s' "$_m"
}
fileowner() {
  _u=$(stat -c '%u' "$1" 2>/dev/null || true)
  case "${_u:-x}" in ''|*[!0-9]*) _u='' ;; esac
  if [ -z "$_u" ]; then
    _u=$(stat -f '%u' "$1" 2>/dev/null || true)             # macOS / BSD
    case "${_u:-x}" in ''|*[!0-9]*) _u='?' ;; esac
  fi
  printf '%s' "$_u"
}
hash256() { # fixed-width digest of stdin; shasum is what macOS ships, sha256sum is GNU
  if command -v shasum >/dev/null 2>&1; then shasum -a 256 | cut -c1-64
  elif command -v sha256sum >/dev/null 2>&1; then sha256sum | cut -c1-64
  else cksum | awk '{printf "cksum:%-58s", $1}'; fi
}
rotate() { [ -f "$1" ] && [ "$(wc -l < "$1" | tr -d ' ')" -gt "$2" ] && { tail -n "$2" "$1" > "$1.tmp" && mv "$1.tmp" "$1"; }; return 0; }

# route.env is a data file: six known keys, read with sed and validated, never sourced (F-V2-18). A route file
# that is not a plain file owned by this user with owner-only permissions is discarded and reset to the safe
# route, subscription — the one route that cannot push a task to a free provider.
route_get() { _v=$(sed -n "s/^$1=//p" "$ROUTE" 2>/dev/null | tail -1); printf '%s' "$_v" | tr -d "'\"" | tr -c 'A-Za-z0-9 _.:=/-' '_'; }
route_num() { _v=$(route_get "$1"); case "$_v" in ''|*[!0-9]*) printf '%s' "$2" ;; *) printf '%s' "$_v" ;; esac; }
route_file_trusted() {
  [ -f "$1" ] && [ ! -L "$1" ] || return 1
  [ "$(fileowner "$1")" = "$(id -u)" ] || return 1
  case "$(filemode "$1")" in 600|400) return 0 ;; esac
  return 1
}
# shellcheck disable=SC2034  # since and reason are read so --status and the log can show them; the launcher's own decisions use mode/reset_at/probed_at/omni_ok
read_route() {
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
  t=$(now)   # a reset epoch outside now-1h..now+48h is a parse failure: never wait on it (F-V2-12)
  if [ "$reset_at" -ne 0 ] && { [ "$reset_at" -lt $((t - 3600)) ] || [ "$reset_at" -gt $((t + RESET_MAX_AHEAD)) ]; }; then
    log "WARN reset_at=$reset_at in $ROUTE is outside the sane window — treated as 0 (probe now)"; reset_at=0
  fi
}
write_route() { # mode since reset_at reason omni_ok probed_at
  r=$(printf '%s' "$4" | tr -c 'A-Za-z0-9 _.:=/-' '_')
  printf 'mode=%s\nsince=%s\nreset_at=%s\nreason=%s\nomni_ok=%s\nprobed_at=%s\n' "$1" "$2" "$3" "'$r'" "$5" "$6" > "$ROUTE"
  printf '%s\n' "$1" > "$MODEFILE"; }

# ---------------------------------------------------------------- options: all of them, wherever they are (F-V2-07)
TASK=""; PII=""; FORCE=""; SHOW=0; CARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --task)    [ $# -ge 2 ] || usage_err "--task needs a value"; TASK="$2"; shift 2 ;;
    --task=*)  TASK="${1#--task=}"; shift ;;
    --force)   [ $# -ge 2 ] || usage_err "--force needs subscription|free|local"; FORCE="$2"; shift 2 ;;
    --force=*) FORCE="${1#--force=}"; shift ;;
    --pii)     PII=1; shift ;;
    --no-pii)  PII=0; shift ;;
    --status)  SHOW=1; shift ;;
    --)        shift; CARGS=(${CARGS[@]+"${CARGS[@]}"} "$@"); break ;;
    *)         CARGS=(${CARGS[@]+"${CARGS[@]}"} "$1"); shift ;;
  esac
done
set -- ${CARGS[@]+"${CARGS[@]}"}
case "$TASK" in *[!A-Za-z0-9_.-]*) usage_err "--task name may only contain A-Za-z0-9 _ . -" ;; esac

# ---------------------------------------------------------------- the gate: closed unless proven open (F-V2-08/09)
list_file() { # patterns from a config file: comments and blanks stripped, charset-checked
  [ -f "$1" ] || return 0
  sed -e 's/#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' "$1" | grep -E '^[A-Za-z0-9_*?.-]+$' | tr '\n' ' '
}
match_list() { # name pattern… → prints the first glob pattern the name matches; rc 1 when none
  _n="$1"; shift
  # shellcheck disable=SC2254  # $_p is meant to be a glob pattern here (set -f keeps it from touching the cwd)
  for _p in "$@"; do case "$_n" in $_p) printf '%s' "$_p"; return 0 ;; esac; done
  return 1
}
pii_list="$DEFAULT_PII_TASKS $(list_file "$CFG/pii-tasks.txt")"
free_list="$DEFAULT_FREE_OK_TASKS $(list_file "$CFG/free-ok-tasks.txt")"
is_pii=1; why="no --task and no --no-pii: fail closed"
# shellcheck disable=SC2086  # the lists are split into one pattern per word on purpose; set -f stops pathname expansion
if [ "$PII" = 1 ]; then why="--pii"
elif [ -n "$TASK" ] && hit=$(match_list "$TASK" $pii_list); then
  why="task matches client-data pattern '$hit'"; [ "$PII" = 0 ] && why="$why (--no-pii refused)"
elif [ "$PII" = 0 ]; then is_pii=0; why="--no-pii (explicit, no task pattern objected)"
elif [ -n "$TASK" ]; then
  # shellcheck disable=SC2086
  if hit=$(match_list "$TASK" $free_list); then is_pii=0; why="task allow-listed by '$hit'"
  else why="task not on the free-OK allow-list: fail closed"; fi
fi

if [ -n "$FORCE" ]; then
  case "$FORCE" in
    subscription) write_route subscription "$(now)" 0 forced 1 0 ;;
    free)         write_route free-fallback "$(now)" 0 forced 1 "$(now)" ;;   # probed_at=now: a forced mode holds for a probe interval
    local)        write_route local-only "$(now)" 0 forced 1 "$(now)" ;;      # instead of being self-probed away on the very next call
    *) usage_err "--force takes subscription|free|local" ;;
  esac
  log "forced mode=$FORCE by $(id -un)"
fi
read_route
if [ "$mode" != subscription ]; then
  t=$(now); stale=0
  [ $((t - probed_at)) -gt "$PROBE_MAX_AGE" ] && [ "$reset_at" -le "$t" ] && stale=1
  [ $((t - probed_at)) -gt "$PROBE_FORCE_AGE" ] && stale=1
  if [ $stale = 1 ]; then                                  # state is stale: prove it before trusting it — and say how it went (F-V2-11)
    self="$0"; while [ -L "$self" ]; do tgt=$(readlink "$self"); case "$tgt" in /*) self="$tgt" ;; *) self="$(dirname "$self")/$tgt" ;; esac; done
    probe="$(cd "$(dirname "$self")" && pwd)/probe.sh"
    if [ -x "$probe" ]; then
      "$probe" --now >>"$LOG" 2>&1; prc=$?
      log "self-probe rc=$prc (state was >${PROBE_MAX_AGE}s old)"
      read_route
    else
      log "ERROR probe.sh not found or not executable at $probe — the launcher cannot re-check the subscription on its own"
      write_marker "claude-auto: probe.sh missing at $probe — switch-back is impossible until it is installed next to claude-auto"
    fi
  fi
fi
if [ $SHOW = 1 ]; then
  cat "$ROUTE" 2>/dev/null || echo "mode=subscription"
  [ -f "$STATE/probe-failures" ] && echo "probe_failures=$(tr -dc '0-9' < "$STATE/probe-failures")"
  [ -f "$MARKER" ] && { echo "NEEDS-STEVEN:"; cat "$MARKER"; }
  exit 0
fi

headless=0; for a in "$@"; do case "$a" in -p|--print) headless=1 ;; esac; done

load_omni_key() {
  f="$CFG/.env"; [ -f "$f" ] || { echo "claude-auto: $f missing (needs OMNIROUTE_API_KEY=…)" >&2; return 1; }
  p=$(filemode "$f")
  case "$p" in 600|400) ;; *) echo "claude-auto: $f must be chmod 600 (is $p)" >&2; return 1 ;; esac
  OMNIROUTE_API_KEY=$(grep -E '^OMNIROUTE_API_KEY=' "$f" | tail -1 | cut -d= -f2- | tr -d '"'"'"' ')
  [ -n "$OMNIROUTE_API_KEY" ] || { echo "claude-auto: OMNIROUTE_API_KEY not set in $f" >&2; return 1; }
}

route_omni() { # model route-mode pii_ok claude-args…
  model="$1"; rmode="$2"; piiok="$3"; shift 3
  curl -fsS --max-time 5 "$OMNI_BASE/healthz" >/dev/null 2>&1 || { log "omniroute /healthz failed task=${TASK:-none} pii=$is_pii ($why)"; echo "claude-auto: OmniRoute not answering on $OMNI_BASE — deferred (exit 75)" >&2; exit 75; }
  export ANTHROPIC_BASE_URL="$OMNI_BASE" ANTHROPIC_AUTH_TOKEN="$OMNIROUTE_API_KEY"
  export ANTHROPIC_MODEL="$model" ANTHROPIC_DEFAULT_OPUS_MODEL="$model" ANTHROPIC_DEFAULT_SONNET_MODEL="$model" \
         ANTHROPIC_DEFAULT_HAIKU_MODEL="$model" ANTHROPIC_DEFAULT_FABLE_MODEL="$model"
  unset ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN       # the subscription credential never reaches the proxy
  export VANESSA_ROUTE_MODE="$rmode" VANESSA_PII_OK="$piiok"
  args=(); skip=0                                       # rewrite an explicit --model so seat names resolve inside OmniRoute
  for a in "$@"; do
    if [ $skip = 1 ]; then args+=("$model"); skip=0; continue; fi
    case "$a" in --model) args+=("$a"); skip=1 ;; --model=*) args+=("--model=$model") ;; *) args+=("$a") ;; esac
  done
  log "route=$rmode model=$model task=${TASK:-none} pii=$is_pii headless=$headless ($why)"
  exec claude ${args[@]+"${args[@]}"}
}

# The text LIMIT_RE is allowed to see (F-V2-10): the CLI's error envelope, never the task's output.
#   JSON result (--output-format json|stream-json): the "result", "error…", "message" and "subtype" fields of the
#   {"type":"result"…} object only. Text mode: stderr plus the LAST three lines of stdout (where `claude -p` prints
#   a failure as the result), and only when the run exited non-zero. A healthy run's stdout is never scanned.
envelope() { # stdout-file stderr-file rc
  cat "$2" 2>/dev/null
  if grep -qE '^\{.*"type": ?"result"' "$1" 2>/dev/null; then
    grep -E '^\{.*"type": ?"result"' "$1" | tail -1 | grep -oE '"(result|error|errors|message|subtype)": ?("(\\.|[^"\\])*"|\{[^}]{0,400}|\[[^]]{0,400})'
  elif [ "$3" -ne 0 ]; then tail -n 3 "$1" 2>/dev/null; fi
}
limit_branch() { # which LIMIT_RE branch matched stdin — a label of ours, never the text
  _t=$(cat)
  for _b in 'usage limit:usage-limit' 'hit your:hit-your-limit' 'limit (has been )?reached:limit-reached' 'out of (extra )?usage:out-of-usage' 'rate_limit:rate_limit-token' 'rate limited:rate-limited'; do
    if printf '%s' "$_t" | grep -qiE "${_b%%:*}"; then printf '%s' "${_b#*:}"; return; fi
  done
  printf 'http-429'
}
parse_reset_epoch() { # stdin: envelope → epoch or 0. Only the CLI's own "limit reached|<epoch>" shape counts, clamped (F-V2-12)
  _e=$(grep -oiE 'limit reached[|][0-9]{10}' | head -1 | grep -oE '[0-9]{10}$'); _n=$(now)
  [ -n "$_e" ] || { echo 0; return; }
  if [ "$_e" -lt $((_n - 3600)) ] || [ "$_e" -gt $((_n + RESET_MAX_AHEAD)) ]; then log "reset epoch $_e is outside now-1h..now+${RESET_MAX_AHEAD}s — treated as unknown (0)"; echo 0; return; fi
  echo "$_e"
}
record_sample() { # envelope-text rc — exit status, branch, size and sha256 only; the text itself never lands on disk (F-V2-14)
  _b=$(printf '%s' "$1" | limit_branch); _n=$(printf '%s' "$1" | wc -c | tr -d ' '); _h=$(printf '%s' "$1" | hash256)
  printf '%s task=%s rc=%s pii=%s branch=%s bytes=%s sha256=%s\n' "$(date -u +%FT%TZ)" "${TASK:-none}" "$2" "$is_pii" "$_b" "$_n" "$_h" >> "$SAMPLES"
  rotate "$SAMPLES" 500
}

run_headless_and_watch() { # subscription path: run, mirror output, detect a usage-limit result
  tmp=$(mktemp "${TMPDIR:-/tmp}/claude-auto.XXXXXX")
  claude "$@" 2>"$tmp.err" | tee "$tmp"; rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ] || grep -qE '"is_error": ?true' "$tmp"; then
    env_txt=$(envelope "$tmp" "$tmp.err" "$rc")
    if printf '%s\n' "$env_txt" | grep -qiE "$LIMIT_RE"; then
      epoch=$(printf '%s\n' "$env_txt" | parse_reset_epoch)
      write_route free-fallback "$(now)" "$epoch" "limit-detected task=${TASK:-none}" 1 0
      record_sample "$env_txt" "$rc"
      log "LIMIT detected task=${TASK:-none} rc=$rc branch=$(printf '%s' "$env_txt" | limit_branch) reset_at=$epoch -> mode=free-fallback; exit 75 so the runner retries on the new route"
      cat "$tmp.err" >&2; rm -f "$tmp" "$tmp.err"; exit 75
    fi
    log "run failed task=${TASK:-none} rc=$rc — not a usage limit, route unchanged"
  fi
  cat "$tmp.err" >&2; rm -f "$tmp" "$tmp.err"; exit "$rc"
}

rotate "$LOG" 5000
case "$mode" in
  subscription)
    unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN           # never inherit a stale proxy setting
    export VANESSA_ROUTE_MODE=subscription VANESSA_PII_OK=1
    if [ $headless = 1 ]; then run_headless_and_watch "$@"; else exec claude "$@"; fi ;;
  free-fallback|local-only)
    if [ "$omni_ok" != 1 ]; then log "defer task=${TASK:-none} pii=$is_pii: subscription limited and OmniRoute unhealthy"; echo "claude-auto: subscription limited and OmniRoute unhealthy — deferred (exit 75)" >&2; exit 75; fi
    load_omni_key || exit 78
    if [ $is_pii = 1 ] || [ "$mode" = local-only ]; then
      if [ -n "$LOCAL_MODEL" ]; then route_omni "$LOCAL_MODEL" local-only 1 "$@"; fi
      log "defer task=${TASK:-none} pii=1 ($why): no local model configured, subscription limited (reset_at=$reset_at)"
      echo "claude-auto: subscription limited (mode=$mode) and this invocation is not cleared for a free provider — $why." >&2
      echo "claude-auto: deferred until the subscription resets (exit 75). Only an allow-listed --task, or --no-pii on a session with no client data, runs on a free provider." >&2
      exit 75
    fi
    route_omni "$FREE_MODEL" free-fallback 0 "$@" ;;
  *) echo "claude-auto: unknown mode '$mode' in $ROUTE" >&2; exit 78 ;;
esac
