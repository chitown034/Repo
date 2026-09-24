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
# Usage: claude-auto [--task NAME] [--pii|--no-pii] [--force subscription|free|local] [--status]
#                    [--lease|--no-lease|--lease-check|--take-lease|--release-lease] [--] <claude args…>
#   The options are recognised anywhere before `--` — argument order does not matter (F-V2-07). Every other
#   argument, and everything after `--`, is passed to claude untouched, in its original order.
# No secrets live in this file. OMNIROUTE_API_KEY is read from ~/.config/omniroute/.env (must be chmod 600).
#
# TASK LEASE — PEER by default, PRIMARY/STANDBY kept as legacy roles, and it FAILS ASYMMETRICALLY (P7,
# 2026-09-22; PEER + explicit control + heartbeat added R6, 2026-09-24 — two equal Macs, CLAUDE.md HALT-free).
# Two Macs running the same ~59 claude-runner tasks double-write the same artifact documents: duplicate `ciLog`
# rows, `isaLine` sent twice, churn on `sectionEdits`. REMOTE-ACCESS.md specifies the cure as a five-step LEASE
# CHECK pasted at the top of all 59 task prompts; editing 59 live prompts is a HALT an agent cannot do and a
# chore that never finishes, so the same five steps — same document, same 90-minute TTL, same `if_version` pin,
# same step-4 re-read — run HERE instead, once, in the one choke point every task already goes through. The
# prompt-level block stays documented in REMOTE-ACCESS.md as the fallback for any writer that does NOT come
# through this launcher.
#   Role: the first `primary`, `standby` or `peer` line of ~/.config/claude-runner/role. Unset, unreadable, not
#   owned by this user, group/world-writable, or holding anything else  ->  STANDBY. A freshly imaged Mac is a
#   standby. `primary`/`standby` are legacy values, kept working exactly as before; `peer` is what the installer
#   now writes on a fresh Mac and what both of Steven's Macs are meant to run — see PEER below.
#   The role decides ONE thing: what to do when the check itself cannot complete. It never overrides an answer.
#     conclusive HELD / ACQUIRED  -> run       (on any role: we are the writer)
#     conclusive FOREIGN / RACE   -> exit 75   (on any role — a role that ignored a live foreign lease would
#                                               make the whole mechanism pointless)
#     inconclusive on PRIMARY     -> RUN. Fails OPEN. A network blip, a logged-out `claude` or a timeout must
#                                   never silently stop all of Steven's automation; the lease has a 90-minute
#                                   TTL precisely so a primary may keep working through one.
#     inconclusive on STANDBY     -> exit 75. Fails CLOSED. A standby that cannot PROVE it should take over and
#                                   guesses is exactly the double-write this exists to prevent.
#     inconclusive on PEER        -> STICKY. Fails OPEN only if THIS Mac was the conclusive holder (HELD or
#                                   ACQUIRED, naming this machine) at its own last real check, and the expiresAt
#                                   from that check has not yet passed. Otherwise fails CLOSED, same as standby.
#                                   That memory lives in the decision cache (state/lease.env) and is carried
#                                   forward — never blanked — across a run of inconclusive checks, so a string of
#                                   blips doesn't erase it; it is replaced the moment a new conclusive check
#                                   lands, and it lapses on its own once the remembered expiresAt passes. This is
#                                   why peer has no permanent primary: leadership is sticky, not assigned.
#   Explicit control, either Mac, any time: `--take-lease` writes state/taskLease with NO if_version (an
#   unconditional takeover), reads it back to confirm, and busts this Mac's decision cache. `--release-lease`
#   sets expiresAt to now, pinned with if_version, and ONLY if this Mac is the current holder; it also busts the
#   cache. Both are one `claude -p` turn and print exactly one line.
#   Heartbeat: every CONCLUSIVE lease check (HELD/ACQUIRED/FOREIGN/RACE) also writes this Mac's own
#   state/macHeartbeat.<machineId> document, best effort, in the SAME `claude -p` turn — it can never block or
#   fail the task the lease check is gating. Shape is fixed by REMOTE-ACCESS.md -> Both Macs; unknown fields
#   (no CLAUDE_RUNNER_REPO_DIR set, no `runnerctl` on PATH) are JSON null, never guessed.
#   Cost: a bash script cannot read the artifact DB, so the check is one `claude -p` turn (the probe.sh shape).
#   One per task invocation would be unaffordable, so the decision is cached in state/lease.env for 30 min —
#   about 48 real checks a day worst case, three renewals inside every 90-minute lease. See README.md.
#   Precedence: the lease gate runs AFTER --status/--lease-check and BEFORE everything that can invoke claude for
#   the task, so it sits in front of — never inside — the PII gate. They compose as AND and both fail towards
#   exit 75; the lease path sets nothing the PII gate reads. Lease first because "may this Mac work at all" is
#   broader than "which provider may see this data", and because the reverse order would let a primary whose
#   subscription is limited defer a client task for PII reasons WITHOUT renewing its lease — silently handing
#   the standby a takeover. The lease check's own output is never scanned for LIMIT_RE: only a real task run may
#   move the route (F-V2-10). Invocations with no --task are not gated (interactive Vanessa Live has a human
#   present and is not one of the 59 scheduled writers); --lease gates them anyway, --no-lease skips the gate and
#   is logged as a WARN.
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
# --- task lease (P7). The document's shape is fixed by REMOTE-ACCESS.md; these are locations and budgets only.
RUNNER_CFG="${CLAUDE_RUNNER_CFG:-$HOME/.config/claude-runner}"     # the runner's config, NOT omniroute's
ROLEFILE="$RUNNER_CFG/role"                                        # first non-comment line: primary | standby (absent = standby)
IDFILE="$RUNNER_CFG/id"                                            # optional short stable holder id; absent = derived from the computer name
LEASE_CACHE="$STATE/lease.env"                                     # decision= verdict= role= checked_at= expires_iso= holder= fails= — PARSED, never sourced
LEASE_LOCK="$STATE/lease.lock"                                     # mkdir-lock: 59 tasks firing at once pay for ONE check, not 59
LEASE_ART="${CLAUDE_RUNNER_LEASE_ARTIFACT:-1624daae-d683-405a-971d-c5828dce0f8d}"  # Command Deck store; document state/taskLease
LEASE_TTL="${CLAUDE_RUNNER_LEASE_TTL:-5400}"                       # 90 min — FIXED by REMOTE-ACCESS.md, not a tuning knob
LEASE_CACHE_TTL="${CLAUDE_RUNNER_LEASE_CACHE_TTL:-1800}"           # 30 min between real checks: ~48/day, 3 renewals per lease
LEASE_FAIL_TTL="${CLAUDE_RUNNER_LEASE_FAIL_TTL:-300}"              # first retry after an inconclusive check; doubles up to LEASE_CACHE_TTL
LEASE_TIMEOUT="${CLAUDE_RUNNER_LEASE_TIMEOUT:-60}"                 # seconds the one-turn check may take before it is killed
LEASE_MODEL="${CLAUDE_RUNNER_LEASE_MODEL:-sonnet}"                 # execution seat (CLAUDE.md tiering); same choice as probe.sh
LEASE_TOOLS="${CLAUDE_RUNNER_LEASE_TOOLS:-ArtifactData}"           # the artifact-DB tool's CLI name — override here if the CLI renames it
LEASE_TIMEOUT_BIN="${CLAUDE_RUNNER_LEASE_TIMEOUT_BIN:-auto}"       # auto = use timeout/gtimeout when present; none = always the built-in watchdog
CLAUDE_AUTO_VERSION="${CLAUDE_AUTO_VERSION_OVERRIDE:-2026-09-24-r6-peer1}"  # reported in --status and every heartbeat; bump when the lease/heartbeat contract changes
CLAUDE_RUNNER_REPO_DIR="${CLAUDE_RUNNER_REPO_DIR:-}"               # optional: this Mac's brain-repo checkout, for the heartbeat's repo.* fields ONLY. The installed
                                                                    # launcher (~/.local/bin/claude-auto) has no other way to know where Steven put it (a plain clone,
                                                                    # or symlinked into the vault — MAC-INSTALL.md §0) — absent, repo.* is null, never guessed

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
usage_err() { echo "claude-auto: $*" >&2; echo "usage: claude-auto [--task NAME] [--pii|--no-pii] [--force subscription|free|local] [--status] [--lease|--no-lease|--lease-check|--take-lease|--release-lease] [--] <claude args…>" >&2; exit 64; }

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

# ---------------------------------------------------------------- the task lease (P7): one writer across two Macs
filemtime() { # GNU first and validated, then BSD — same reason as filemode (F-V2-15)
  _s=$(stat -c '%Y' "$1" 2>/dev/null || true)
  case "${_s:-x}" in ''|*[!0-9]*) _s='' ;; esac
  if [ -z "$_s" ]; then
    _s=$(stat -f '%m' "$1" 2>/dev/null || true)
    case "${_s:-x}" in ''|*[!0-9]*) _s=0 ;; esac
  fi
  printf '%s' "$_s"
}
iso_at() { # epoch -> ISO-8601 Z. GNU `date -d @` first and VALIDATED, then BSD `date -r`; empty if neither works
  _v=$(date -u -d "@$1" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || true)
  case "$_v" in [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z) printf '%s' "$_v"; return 0 ;; esac
  _v=$(date -u -r "$1" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || true)
  case "$_v" in [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]Z) printf '%s' "$_v"; return 0 ;; esac
  printf ''
}
iso_num() { # ISO-8601 Z -> YYYYMMDDHHMMSS for a locale-proof numeric compare; empty when it is not 14 digits
  _d=$(printf '%s' "$1" | tr -dc '0-9' | cut -c1-14)
  case "$_d" in [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) printf '%s' "$_d" ;; *) printf '' ;; esac
}
# Anything that is not an explicit, owner-only, not-world-writable `primary` is a STANDBY. Sets ROLE and ROLE_WHY.
read_role() {
  ROLE=standby; ROLE_WHY="no role file at $ROLEFILE"
  [ -f "$ROLEFILE" ] && [ ! -L "$ROLEFILE" ] || return 0
  [ "$(fileowner "$ROLEFILE")" = "$(id -u)" ] || { ROLE_WHY="$ROLEFILE is not owned by uid $(id -u)"; return 0; }
  _rm=$(filemode "$ROLEFILE")
  case "$_rm" in [0-7][0-7][0-7][0-7]) _rm=${_rm#?} ;; [0-7][0-7][0-7]) ;; *) _rm=777 ;; esac
  case "${_rm#?}" in *[2367]*) ROLE_WHY="$ROLEFILE is group- or world-writable (mode $_rm)"; return 0 ;; esac
  _r=$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$ROLEFILE" 2>/dev/null | grep -v '^$' | head -1 | tr '[:upper:]' '[:lower:]')
  case "$_r" in
    primary|standby|peer) ROLE="$_r"; ROLE_WHY="$ROLEFILE" ;;
    *) ROLE_WHY="$ROLEFILE holds no primary/standby/peer line" ;;
  esac
}
lease_my_id() { # a short stable id per machine; two Macs with the same id defeats the whole mechanism
  _i=''
  if [ -f "$IDFILE" ] && [ ! -L "$IDFILE" ]; then
    _i=$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$IDFILE" 2>/dev/null | grep -v '^$' | head -1)
  fi
  [ -n "$_i" ] || _i=$(scutil --get ComputerName 2>/dev/null || true)
  [ -n "$_i" ] || _i=$(hostname 2>/dev/null || true)
  [ -n "$_i" ] || _i=unknown-mac
  printf '%s' "$_i" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9._-' '-' | cut -c1-40
}
lease_my_host() { # `hostname` for humans, exactly as REMOTE-ACCESS.md specifies
  _h=$(scutil --get ComputerName 2>/dev/null || true)
  [ -n "$_h" ] || _h=$(hostname 2>/dev/null || true)
  [ -n "$_h" ] || _h=unknown
  printf '%s' "$_h" | tr -c 'A-Za-z0-9 ._-' '_' | cut -c1-60
}
# lease.env gets the same treatment as route.env: six known keys, read with sed, validated, NEVER sourced (F-V2-18).
lease_get() { _v=$(sed -n "s/^$1=//p" "$LEASE_CACHE" 2>/dev/null | tail -1); printf '%s' "$_v" | tr -d "'\"" | tr -c 'A-Za-z0-9_.:-' '_'; }
lease_num() { _v=$(lease_get "$1"); case "$_v" in ''|*[!0-9]*) printf '%s' "$2" ;; *) printf '%s' "$_v" ;; esac; }
read_lease_cache() {
  c_decision=''; c_verdict=''; c_role=''; c_checked=0; c_expires='-'; c_holder='-'; c_fails=0
  [ -e "$LEASE_CACHE" ] || return 0
  if ! route_file_trusted "$LEASE_CACHE"; then
    log "WARN $LEASE_CACHE is not a plain owner-only file (mode $(filemode "$LEASE_CACHE"), owner $(fileowner "$LEASE_CACHE")) — discarded, the lease is re-checked"
    rm -f "$LEASE_CACHE"; return 0
  fi
  c_decision=$(lease_get decision); c_verdict=$(lease_get verdict); c_role=$(lease_get role)
  c_checked=$(lease_num checked_at 0); c_fails=$(lease_num fails 0)
  c_expires=$(lease_get expires_iso); [ -n "$c_expires" ] || c_expires='-'
  c_holder=$(lease_get holder); [ -n "$c_holder" ] || c_holder='-'
  case "$c_decision" in run|defer) ;; *) c_decision='' ;; esac
  case "$c_role" in primary|standby|peer) ;; *) c_decision='' ;; esac
}
write_lease_cache() { # decision verdict role checked_at expires_iso holder fails
  printf 'decision=%s\nverdict=%s\nrole=%s\nchecked_at=%s\nexpires_iso=%s\nholder=%s\nfails=%s\n' \
    "$1" "$2" "$3" "$4" "$5" "$6" "$7" > "$LEASE_CACHE"
}
LOCKHELD=0
lease_unlock() { [ "$LOCKHELD" = 1 ] && { rmdir "$LEASE_LOCK" 2>/dev/null || true; LOCKHELD=0; trap - EXIT INT TERM; }; return 0; }
lease_run_timeout() { # seconds outfile cmd… — stdout+stderr to outfile, 124 on timeout. macOS ships no `timeout`.
  _to="$1"; _of="$2"; shift 2
  if [ "$LEASE_TIMEOUT_BIN" != none ]; then
    if command -v timeout >/dev/null 2>&1; then timeout "$_to" "$@" >"$_of" 2>&1; return $?; fi
    if command -v gtimeout >/dev/null 2>&1; then gtimeout "$_to" "$@" >"$_of" 2>&1; return $?; fi
  fi
  "$@" >"$_of" 2>&1 & _pid=$!
  _i=0
  while [ "$_i" -lt "$_to" ]; do kill -0 "$_pid" 2>/dev/null || break; sleep 1; _i=$((_i + 1)); done
  if kill -0 "$_pid" 2>/dev/null; then
    kill -TERM "$_pid" 2>/dev/null; sleep 1; kill -KILL "$_pid" 2>/dev/null
    wait "$_pid" 2>/dev/null; return 124
  fi
  wait "$_pid"; return $?
}
# shellcheck disable=SC1003  # the \\ is a literal backslash in tr's delete-set, not an escaped quote
json_str() { printf '"%s"' "$(printf '%s' "$1" | tr -d '\n\r\t"\\')"; }   # hand-built JSON string literal: strip what would break it, never full-escape
json_num_or_null() { case "$1" in ''|*[!0-9]*) printf 'null' ;; *) printf '%s' "$1" ;; esac; }

# Best-effort, shell-only facts for the heartbeat step in lease_prompt() below — NEVER the model's job, and
# NEVER allowed to slow or fail the lease check itself. Missing `runnerctl`, no CLAUDE_RUNNER_REPO_DIR, or a
# `git` that errors all just mean the corresponding field is JSON null (R6, 2026-09-24). Prints five
# pipe-joined fields: tasks|branch|head|behind|ahead — the last four already JSON-literal (quoted or null).
heartbeat_static_json() {
  _hs_tasks='null'
  if command -v runnerctl >/dev/null 2>&1; then
    _n=$(runnerctl list 2>/dev/null | grep -c . 2>/dev/null)
    case "$_n" in ''|*[!0-9]*) ;; *) _hs_tasks="$_n" ;; esac
  fi
  _hs_branch='null'; _hs_head='null'; _hs_behind='null'; _hs_ahead='null'
  if [ -n "$CLAUDE_RUNNER_REPO_DIR" ] && git -C "$CLAUDE_RUNNER_REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    _v=$(git -C "$CLAUDE_RUNNER_REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null); [ -n "$_v" ] && _hs_branch=$(json_str "$_v")
    _v=$(git -C "$CLAUDE_RUNNER_REPO_DIR" rev-parse --short HEAD 2>/dev/null);      [ -n "$_v" ] && _hs_head=$(json_str "$_v")
    _v=$(git -C "$CLAUDE_RUNNER_REPO_DIR" rev-list --left-right --count '@{upstream}...HEAD' 2>/dev/null)
    if [ -n "$_v" ]; then
      _hs_behind=$(json_num_or_null "$(printf '%s' "$_v" | awk '{print $1+0}')")
      _hs_ahead=$(json_num_or_null "$(printf '%s' "$_v" | awk '{print $2+0}')")
    fi
  fi
  printf '%s|%s|%s|%s|%s' "$_hs_tasks" "$_hs_branch" "$_hs_head" "$_hs_behind" "$_hs_ahead"
}

lease_prompt() { # my-id hostname now-iso expires-iso — REMOTE-ACCESS.md's five steps, verbatim in intent,
                  # plus the step-6 heartbeat (R6, 2026-09-24).
  _hb=$(heartbeat_static_json)
  _hbt=${_hb%%|*}; _hbr=${_hb#*|}
  _hbbr=${_hbr%%|*}; _hbr=${_hbr#*|}
  _hbhd=${_hbr%%|*}; _hbr=${_hbr#*|}
  _hbbe=${_hbr%%|*}; _hbah=${_hbr#*|}
  cat <<PROMPT
Task-lease check for a claude-runner host. Use ONLY the artifact database tool. Do not read or write files, do
not run commands, do not ask questions, do not explain, do not summarise.
ARTIFACT: https://claude.ai/code/artifact/$LEASE_ART
COLLECTION: state    DOCUMENT: taskLease
MY_ID: $1
HOSTNAME: $2
NOW: $3
EXPIRES: $4
Steps, in order:
1. Get the document taskLease from collection state on that artifact. Remember its version, or that it is absent.
2. If it exists AND its v.holder is not $1 AND its v.expiresAt is later than $3, print exactly one line
   LEASE FOREIGN holder=<its v.holder> expires=<its v.expiresAt>
   and stop after step 6 below. Write nothing to taskLease.
3. Otherwise set state/taskLease to
   {"v":{"holder":"$1","hostname":"$2","acquiredAt":"$3","expiresAt":"$4"}}
   pinned with if_version = the version you read in step 1. Omit if_version ONLY if the document was absent.
   If that write is refused because the version has moved, print exactly one line
   LEASE RACE holder=- expires=-
   and stop after step 6 below. Do not retry it and do not write it unpinned.
4. Get state/taskLease again. If its v.holder is not $1, print exactly one line
   LEASE RACE holder=<its v.holder> expires=<its v.expiresAt>
   and stop after step 6 below.
5. Otherwise your line is:
   LEASE HELD holder=$1 expires=$4        if step 1 found the document already held by $1
   LEASE ACQUIRED holder=$1 expires=$4    if it was absent, or its v.expiresAt was not later than $3
6. Whichever line you reached (step 2, 4 or 5), before printing it make ONE more ArtifactData 'set' call —
   best effort, never retried, and it must NEVER change that line: set state/macHeartbeat.$1 to
   {"v":{"machineId":"$1","hostname":"$2","role":"$ROLE","checkedAt":"$3","verdict":"<the exact HELD, ACQUIRED, FOREIGN or RACE word from the line you are about to print>","leaseHolder":"<the holder= value from that same line>","leaseExpiresAt":"<the expires= value from that same line>","claudeAutoVersion":"$CLAUDE_AUTO_VERSION","runner":{"tasks":$_hbt,"scheduleEnabled":null},"repo":{"branch":$_hbbr,"head":$_hbhd,"behind":$_hbbe,"ahead":$_hbah,"checkedAt":"$3"}}}
   If that call errors for any reason, ignore the error completely and move on.
Your entire reply is exactly the one line from step 2, 4 or 5. No other words, no markdown, no code fences.
PROMPT
}
lease_result_text() { # stdin: the check's raw output -> the CLI's own result field only, never the prompt we sent
  _o=$(cat)
  if printf '%s\n' "$_o" | grep -qE '^\{.*"type": ?"result"'; then
    printf '%s\n' "$_o" | grep -E '^\{.*"type": ?"result"' | tail -1 | grep -oE '"result": ?"(\\.|[^"\\])*"'
  else
    printf '%s\n' "$_o" | tail -n 5
  fi
}
lease_verdict() { # stdin -> HELD|ACQUIRED|FOREIGN|RACE, and NOTHING unless exactly one of them is present
  _v=$(grep -oE 'LEASE (HELD|ACQUIRED|FOREIGN|RACE)' | sed 's/^LEASE //' | sort -u | tr '\n' ' ')
  case "$_v" in 'HELD ') printf 'HELD' ;; 'ACQUIRED ') printf 'ACQUIRED' ;; 'FOREIGN ') printf 'FOREIGN' ;; 'RACE ') printf 'RACE' ;; *) printf '' ;; esac
}
lease_field() { # field-name, stdin: result text -> the value, charset-limited and truncated. Never raw model text.
  # `tr -d` before `tr -c`: tr -c maps the trailing newline too, and a holder of "mac-one_" matches no machine.
  grep -oE "$1=[^ \"\\]+" | tail -1 | sed "s/^$1=//" | tr -d '\n' | tr -c 'A-Za-z0-9_.:-' '_' | cut -c1-40
}
# Sticky leadership for role=peer (R6, 2026-09-24): true only if the MOST RECENTLY READ cache fields —
# c_verdict/c_holder/c_expires, as read_lease_cache() left them — name THIS machine as the conclusive holder
# of a lease that has not yet expired as of epoch $1. Callers read the cache (or carry its fields forward
# from before a fresh check attempt) before calling this; it never reads the cache file itself, so it works
# identically whether the cache is still on disk or was just wiped (--lease-check wipes it on purpose).
peer_sticky() {
  case "$c_verdict" in HELD|ACQUIRED) ;; *) return 1 ;; esac
  [ "$c_holder" = "$(lease_my_id)" ] || return 1
  _en=$(iso_num "$c_expires"); _nn=$(iso_num "$(iso_at "$1")")
  [ -n "$_en" ] && [ -n "$_nn" ] && [ "$_en" -gt "$_nn" ]
}
# One `claude -p` turn, same shape as lease_check_now, for a prompt that is not the five-step check —
# --take-lease and --release-lease below. Prints the result text on stdout; returns claude's own exit code.
lease_call() {
  _lc_p="$1"
  _lc_t=$(mktemp "${TMPDIR:-/tmp}/claude-auto-lease.XXXXXX") || return 71
  lease_run_timeout "$LEASE_TIMEOUT" "$_lc_t" \
    env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY \
        claude -p "$_lc_p" --model "$LEASE_MODEL" --max-turns 8 --output-format json \
               --no-session-persistence --allowedTools "$LEASE_TOOLS" \
               --disallowedTools 'Bash,Task,WebFetch,WebSearch,Write,Edit,NotebookEdit'
  _lc_rc=$?
  lease_result_text < "$_lc_t"
  rm -f "$_lc_t"
  return "$_lc_rc"
}
lease_take_prompt() { # my-id hostname now-iso expires-iso
  cat <<PROMPT
Task-lease TAKEOVER for a claude-runner host. Use ONLY the artifact database tool. Do not read or write files,
do not run commands, do not ask questions, do not explain, do not summarise.
ARTIFACT: https://claude.ai/code/artifact/$LEASE_ART
COLLECTION: state    DOCUMENT: taskLease
MY_ID: $1
HOSTNAME: $2
NOW: $3
EXPIRES: $4
Steps, in order:
1. Set state/taskLease to
   {"v":{"holder":"$1","hostname":"$2","acquiredAt":"$3","expiresAt":"$4"}}
   with NO if_version — this is an unconditional takeover, whatever the document currently holds.
2. Get state/taskLease again.
3. Print exactly one line:
   LEASE TAKEN holder=$1 expires=$4                                        if step 2's v.holder is $1
   LEASE TAKE-UNCERTAIN holder=<its v.holder> expires=<its v.expiresAt>     otherwise
Your entire reply is that one line. No other words, no markdown, no code fences.
PROMPT
}
lease_release_prompt() { # my-id hostname now-iso
  cat <<PROMPT
Task-lease RELEASE for a claude-runner host. Use ONLY the artifact database tool. Do not read or write files,
do not run commands, do not ask questions, do not explain, do not summarise.
ARTIFACT: https://claude.ai/code/artifact/$LEASE_ART
COLLECTION: state    DOCUMENT: taskLease
MY_ID: $1
HOSTNAME: $2
NOW: $3
Steps, in order:
1. Get the document taskLease from collection state on that artifact. Remember its version.
2. If it does not exist, print exactly one line
   LEASE RELEASE-NOOP holder=- expires=-
   and stop. Write nothing.
3. If its v.holder is not $1, print exactly one line
   LEASE RELEASE-NOTHOLDER holder=<its v.holder> expires=<its v.expiresAt>
   and stop. Write nothing.
4. Otherwise set state/taskLease to
   {"v":{"holder":"$1","hostname":"$2","acquiredAt":"$3","expiresAt":"$3"}}
   pinned with if_version = the version you read in step 1 — this hands the lease back by expiring it now.
   If that write is refused because the version has moved, print exactly one line
   LEASE RELEASE-RACE holder=- expires=-
   and stop. Do not retry it and do not write it unpinned.
5. Otherwise print exactly one line:
   LEASE RELEASED holder=$1 expires=$3
Your entire reply is that one line. No other words, no markdown, no code fences.
PROMPT
}
lease_take_verdict() { # stdin -> TAKEN|TAKE-UNCERTAIN, empty unless exactly one is present
  _v=$(grep -oE 'LEASE (TAKEN|TAKE-UNCERTAIN)' | sed 's/^LEASE //' | sort -u | tr '\n' ' ')
  case "$_v" in 'TAKEN ') printf 'TAKEN' ;; 'TAKE-UNCERTAIN ') printf 'TAKE-UNCERTAIN' ;; *) printf '' ;; esac
}
lease_release_verdict() { # stdin -> RELEASED|RELEASE-NOOP|RELEASE-NOTHOLDER|RELEASE-RACE, empty unless exactly one is present
  _v=$(grep -oE 'LEASE (RELEASED|RELEASE-NOOP|RELEASE-NOTHOLDER|RELEASE-RACE)' | sed 's/^LEASE //' | sort -u | tr '\n' ' ')
  case "$_v" in
    'RELEASED ') printf 'RELEASED' ;; 'RELEASE-NOOP ') printf 'RELEASE-NOOP' ;;
    'RELEASE-NOTHOLDER ') printf 'RELEASE-NOTHOLDER' ;; 'RELEASE-RACE ') printf 'RELEASE-RACE' ;;
    *) printf '' ;;
  esac
}
# One `claude -p` turn, the probe.sh shape: no session file, proxy variables stripped so it can never reach
# OmniRoute, and a tool allow-list of one. Its output is NEVER scanned for LIMIT_RE — only a real task run may
# move the route (F-V2-10). Sets LEASE_VERDICT / LEASE_HOLDER / LEASE_EXP / LEASE_RC; rc 1 = inconclusive.
lease_check_now() {
  LEASE_VERDICT=''; LEASE_HOLDER='-'; LEASE_EXP='-'; LEASE_RC=0
  LEASE_MY_ID=$(lease_my_id); _host=$(lease_my_host); _t=$(now)
  _now_iso=$(iso_at "$_t"); _exp_iso=$(iso_at $((_t + LEASE_TTL)))
  if [ -z "$_now_iso" ] || [ -z "$_exp_iso" ]; then
    log "lease check impossible: neither GNU nor BSD date produced an ISO-8601 stamp"; LEASE_RC=70; return 1
  fi
  _p=$(lease_prompt "$LEASE_MY_ID" "$_host" "$_now_iso" "$_exp_iso")
  _lt=$(mktemp "${TMPDIR:-/tmp}/claude-auto-lease.XXXXXX") || { LEASE_RC=71; return 1; }
  lease_run_timeout "$LEASE_TIMEOUT" "$_lt" \
    env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY \
        claude -p "$_p" --model "$LEASE_MODEL" --max-turns 8 --output-format json \
               --no-session-persistence --allowedTools "$LEASE_TOOLS" \
               --disallowedTools 'Bash,Task,WebFetch,WebSearch,Write,Edit,NotebookEdit'
  LEASE_RC=$?
  _res=$(lease_result_text < "$_lt")
  LEASE_VERDICT=$(printf '%s' "$_res" | lease_verdict)
  LEASE_HOLDER=$(printf '%s' "$_res" | lease_field holder); [ -n "$LEASE_HOLDER" ] || LEASE_HOLDER='-'
  LEASE_EXP=$(printf '%s' "$_res" | lease_field expires);   [ -n "$LEASE_EXP" ] || LEASE_EXP='-'
  rm -f "$_lt"
  [ -n "$LEASE_VERDICT" ] || return 1
  # a HELD/ACQUIRED that does not name US is a confused answer, not a licence to write
  case "$LEASE_VERDICT" in
    HELD|ACQUIRED) [ "$LEASE_HOLDER" = "$LEASE_MY_ID" ] || { log "lease check answered $LEASE_VERDICT but holder=$LEASE_HOLDER is not $LEASE_MY_ID — treated as inconclusive"; LEASE_VERDICT=''; return 1; } ;;
  esac
  return 0
}
# Returns 0 = this invocation may run, 1 = defer. Sets LEASE_WHY and LEASE_SEEN_HOLDER for the caller's messages.
lease_gate() {
  read_role; read_lease_cache
  LEASE_WHY=''; LEASE_SEEN_HOLDER='-'
  _t=$(now); _use=0
  if [ -n "$c_decision" ] && [ "$c_role" = "$ROLE" ]; then
    if [ "$c_verdict" = none ]; then                      # an inconclusive check backs off 5 -> 10 -> 20 -> 30 min
      _ttl="$LEASE_FAIL_TTL"; _n="$c_fails"
      while [ "$_n" -gt 1 ] && [ "$_ttl" -lt "$LEASE_CACHE_TTL" ]; do _ttl=$((_ttl * 2)); _n=$((_n - 1)); done
      [ "$_ttl" -gt "$LEASE_CACHE_TTL" ] && _ttl="$LEASE_CACHE_TTL"
    else _ttl="$LEASE_CACHE_TTL"; fi
    if [ $((_t - c_checked)) -lt "$_ttl" ] && [ "$c_checked" -le "$_t" ]; then
      _use=1
      # a cached "someone else holds it" never outlives the lease it saw: the moment that lease expires we
      # re-check, so a standby takes over promptly instead of waiting the cache out
      if [ "$c_verdict" = FOREIGN ]; then
        _en=$(iso_num "$c_expires"); _nn=$(iso_num "$(iso_at "$_t")")
        if [ -z "$_en" ] || [ -z "$_nn" ] || [ "$_en" -le "$_nn" ]; then _use=0; fi
      fi
    fi
  fi
  if [ "$_use" = 1 ]; then
    LEASE_SEEN_HOLDER="$c_holder"
    LEASE_WHY="cached $c_verdict holder=$c_holder $(( (_t - c_checked) / 60 ))m old"
    [ "$c_decision" = run ] && return 0
    return 1
  fi
  # no usable cache: one real check, under a lock, so 59 tasks firing together pay for one and not 59
  c0_checked="$c_checked"                                    # what we saw before the lock: anything NEWER is somebody's fresh answer
  if ! mkdir "$LEASE_LOCK" 2>/dev/null; then
    _lm=$(filemtime "$LEASE_LOCK")
    if [ "$_lm" -gt 0 ] && [ $((_t - _lm)) -gt $((LEASE_TIMEOUT + 60)) ]; then
      log "WARN removing a stale lease lock at $LEASE_LOCK ($((_t - _lm))s old)"
      rmdir "$LEASE_LOCK" 2>/dev/null || true
    fi
    if ! mkdir "$LEASE_LOCK" 2>/dev/null; then                 # someone else is mid-check: wait for their answer
      _i=0
      while [ "$_i" -lt 3 ]; do
        sleep 2; _i=$((_i + 1)); read_lease_cache
        if [ -n "$c_decision" ] && [ "$c_role" = "$ROLE" ] && [ "$c_checked" -gt "$c0_checked" ]; then
          LEASE_SEEN_HOLDER="$c_holder"; LEASE_WHY="another claude-auto was mid-check; used its $c_verdict"
          [ "$c_decision" = run ] && return 0
          return 1
        fi
      done
      LEASE_WHY="another claude-auto holds $LEASE_LOCK and produced no answer"
      case "$ROLE" in
        primary) return 0 ;;                                   # same asymmetry: primary open, standby closed
        peer)
          if peer_sticky "$_t"; then
            LEASE_WHY="$LEASE_WHY — PEER fails OPEN (sticky: was $c_verdict until $c_expires)"; return 0
          fi
          LEASE_WHY="$LEASE_WHY — PEER fails CLOSED (not the last conclusive holder here, or that lease expired)"
          return 1 ;;
        *) return 1 ;;
      esac
    fi
  fi
  LOCKHELD=1; trap 'lease_unlock' EXIT INT TERM
  if lease_check_now; then
    _dec=defer; case "$LEASE_VERDICT" in HELD|ACQUIRED) _dec=run ;; esac
    write_lease_cache "$_dec" "$LEASE_VERDICT" "$ROLE" "$_t" "$LEASE_EXP" "$LEASE_HOLDER" 0
    lease_unlock
    LEASE_SEEN_HOLDER="$LEASE_HOLDER"; LEASE_WHY="$LEASE_VERDICT holder=$LEASE_HOLDER expires=$LEASE_EXP"
    [ "$_dec" = run ] && return 0
    return 1
  fi
  _n=$((c_fails + 1))
  case "$ROLE" in
    primary)
      write_lease_cache run none primary "$_t" '-' '-' "$_n"; lease_unlock
      LEASE_WHY="check inconclusive (rc=$LEASE_RC, $_n in a row) — PRIMARY fails OPEN, the task runs"
      return 0 ;;
    peer)
      # Sticky leadership: c_verdict/c_holder/c_expires are still whatever read_lease_cache() found on
      # disk at the TOP of this function, before this attempt — i.e. this Mac's own last real check, since
      # write_lease_cache below carries them forward on every inconclusive write instead of blanking them
      # (unlike primary/standby, whose inconclusive writes stay holder=- expires=- exactly as before).
      if peer_sticky "$_t"; then
        write_lease_cache run "$c_verdict" peer "$_t" "$c_expires" "$c_holder" "$_n"; lease_unlock
        LEASE_WHY="check inconclusive (rc=$LEASE_RC, $_n in a row) — PEER fails OPEN (sticky: was $c_verdict until $c_expires)"
        return 0
      fi
      write_lease_cache defer none peer "$_t" '-' '-' "$_n"; lease_unlock
      LEASE_WHY="check inconclusive (rc=$LEASE_RC, $_n in a row) — PEER fails CLOSED (not the last conclusive holder here, or that lease expired)"
      return 1 ;;
    *)
      write_lease_cache defer none standby "$_t" '-' '-' "$_n"; lease_unlock
      LEASE_WHY="check inconclusive (rc=$LEASE_RC, $_n in a row) — STANDBY fails CLOSED (role: $ROLE_WHY)"
      return 1 ;;
  esac
}

# ---------------------------------------------------------------- options: all of them, wherever they are (F-V2-07)
TASK=""; PII=""; FORCE=""; SHOW=0; CARGS=(); LEASE_GATE=auto; LEASE_CHECK=0; TAKE_LEASE=0; RELEASE_LEASE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --task)    [ $# -ge 2 ] || usage_err "--task needs a value"; TASK="$2"; shift 2 ;;
    --task=*)  TASK="${1#--task=}"; shift ;;
    --force)   [ $# -ge 2 ] || usage_err "--force needs subscription|free|local"; FORCE="$2"; shift 2 ;;
    --force=*) FORCE="${1#--force=}"; shift ;;
    --pii)     PII=1; shift ;;
    --no-pii)  PII=0; shift ;;
    --status)  SHOW=1; shift ;;
    --lease)   LEASE_GATE=on; shift ;;          # gate this invocation even without --task
    --no-lease) LEASE_GATE=off; shift ;;        # skip the lease gate — logged as a WARN; manual use only
    --lease-check) LEASE_CHECK=1; shift ;;      # force one real check now, print the verdict, run nothing
    --take-lease) TAKE_LEASE=1; shift ;;        # immediate takeover: write with no if_version, read it back, bust the cache
    --release-lease) RELEASE_LEASE=1; shift ;;  # hand back now: expiresAt=now, pinned, only if this Mac holds it; bust the cache
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
# The DENY-list is matched case-INSENSITIVELY and the ALLOW-list case-SENSITIVELY (H3b, closes F-H3b-01).
# Globs in `case` are case-sensitive, so with only the original matching a client task renamed
# `Lofty-CRM-Refresh` slipped past `lofty-*` and, given any allow-list pattern that matched its case, reached
# a free provider. Folding the name and the deny patterns to lower case can only ever catch MORE; leaving the
# allow-list unfolded can only ever admit FEWER. Both directions of the asymmetry favour deferring.
pii_list=$(printf '%s %s' "$DEFAULT_PII_TASKS" "$(list_file "$CFG/pii-tasks.txt")" | tr '[:upper:]' '[:lower:]')
free_list="$DEFAULT_FREE_OK_TASKS $(list_file "$CFG/free-ok-tasks.txt")"
task_lc=$(printf '%s' "$TASK" | tr '[:upper:]' '[:lower:]')
is_pii=1; why="no --task and no --no-pii: fail closed"
# shellcheck disable=SC2086  # the lists are split into one pattern per word on purpose; set -f stops pathname expansion
if [ "$PII" = 1 ]; then why="--pii"
elif [ -n "$TASK" ] && hit=$(match_list "$task_lc" $pii_list); then
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
  read_role; printf 'lease_role=%s\nlease_role_src=%s\nlease_id=%s\nclaude_auto_version=%s\n' "$ROLE" "$ROLE_WHY" "$(lease_my_id)" "$CLAUDE_AUTO_VERSION"
  if [ -e "$LEASE_CACHE" ]; then read_lease_cache
    printf 'lease_cached=%s verdict=%s holder=%s expires=%s age=%ss fails=%s\n' "${c_decision:-untrusted}" "$c_verdict" "$c_holder" "$c_expires" "$(( $(now) - c_checked ))" "$c_fails"
  else echo "lease_cached=none (no check yet)"; fi
  [ -f "$MARKER" ] && { echo "NEEDS-STEVEN:"; cat "$MARKER"; }
  exit 0
fi


# ---------------------------------------------------------------- the lease gate (P7). Header: why it lives here.
# After --status/--lease-check (a diagnostic must never spend a token or take a lease) and before everything that
# can invoke claude for the task, so it is the FIRST gate a task meets and the PII gate below is reached only when
# this Mac is allowed to work at all. The two compose as AND and both fail towards exit 75.
rotate "$LOG" 5000                                          # the gate can exit before the rotate further down
if [ "$LEASE_CHECK" = 1 ]; then
  read_role
  printf 'lease_role=%s (%s)\nlease_id=%s\nlease_hostname=%s\nlease_artifact=%s\nlease_tool=%s\n' \
    "$ROLE" "$ROLE_WHY" "$(lease_my_id)" "$(lease_my_host)" "$LEASE_ART" "$LEASE_TOOLS"
  read_lease_cache                                          # capture the PRIOR state for the peer sticky prediction below, before wiping it
  rm -f "$LEASE_CACHE"                                      # --lease-check means "ignore the cache and really ask"
  if lease_check_now; then
    ldec=defer; case "$LEASE_VERDICT" in HELD|ACQUIRED) ldec=run ;; esac
    write_lease_cache "$ldec" "$LEASE_VERDICT" "$ROLE" "$(now)" "$LEASE_EXP" "$LEASE_HOLDER" 0
    printf 'verdict=%s holder=%s expires=%s decision=%s\n' "$LEASE_VERDICT" "$LEASE_HOLDER" "$LEASE_EXP" "$ldec"
    log "lease-check verdict=$LEASE_VERDICT holder=$LEASE_HOLDER expires=$LEASE_EXP decision=$ldec role=$ROLE"
    exit 0
  fi
  lwould=DEFER
  case "$ROLE" in
    primary) lwould=RUN ;;
    peer) peer_sticky "$(now)" && lwould=RUN ;;
  esac
  printf 'verdict=INCONCLUSIVE rc=%s — with role=%s a task would %s\n' "$LEASE_RC" "$ROLE" "$lwould"
  printf 'check that claude is logged in, and that the artifact-DB tool is really named "%s" (override: CLAUDE_RUNNER_LEASE_TOOLS)\n' "$LEASE_TOOLS"
  log "lease-check INCONCLUSIVE rc=$LEASE_RC role=$ROLE tool=$LEASE_TOOLS"
  exit 1
fi
if [ "$TAKE_LEASE" = 1 ]; then
  read_role
  _id=$(lease_my_id); _host=$(lease_my_host); _t=$(now)
  _now_iso=$(iso_at "$_t"); _exp_iso=$(iso_at $((_t + LEASE_TTL)))
  if [ -z "$_now_iso" ] || [ -z "$_exp_iso" ]; then
    echo "claude-auto: take-lease FAILED — neither GNU nor BSD date produced an ISO-8601 stamp" >&2
    log "take-lease impossible: no ISO-8601 stamp"; exit 70
  fi
  _res=$(lease_call "$(lease_take_prompt "$_id" "$_host" "$_now_iso" "$_exp_iso")"); _trc=$?
  _tv=$(printf '%s' "$_res" | lease_take_verdict)
  _th=$(printf '%s' "$_res" | lease_field holder); [ -n "$_th" ] || _th='-'
  _te=$(printf '%s' "$_res" | lease_field expires); [ -n "$_te" ] || _te='-'
  rm -f "$LEASE_CACHE"                                      # busts this Mac's decision cache either way
  if [ "$_tv" = TAKEN ] && [ "$_th" = "$_id" ]; then
    log "take-lease OK holder=$_id expires=$_exp_iso role=$ROLE"
    echo "claude-auto: TOOK the lease — holder=$_id expires=$_exp_iso"
    exit 0
  fi
  log "take-lease INCONCLUSIVE rc=$_trc verdict=${_tv:-none} holder=$_th expires=$_te"
  echo "claude-auto: take-lease FAILED — rc=$_trc verdict=${_tv:-none} holder=$_th expires=$_te (check claude is logged in and the artifact-DB tool name)" >&2
  exit 1
fi
if [ "$RELEASE_LEASE" = 1 ]; then
  read_role
  _id=$(lease_my_id); _host=$(lease_my_host); _now_iso=$(iso_at "$(now)")
  if [ -z "$_now_iso" ]; then
    echo "claude-auto: release-lease FAILED — neither GNU nor BSD date produced an ISO-8601 stamp" >&2
    log "release-lease impossible: no ISO-8601 stamp"; exit 70
  fi
  _res=$(lease_call "$(lease_release_prompt "$_id" "$_host" "$_now_iso")"); _rrc=$?
  _rv=$(printf '%s' "$_res" | lease_release_verdict)
  _rh=$(printf '%s' "$_res" | lease_field holder); [ -n "$_rh" ] || _rh='-'
  rm -f "$LEASE_CACHE"                                      # busts this Mac's decision cache either way
  case "$_rv" in
    RELEASED)
      log "release-lease OK holder=$_id at $_now_iso role=$ROLE"
      echo "claude-auto: RELEASED the lease — it is free as of $_now_iso"
      exit 0 ;;
    RELEASE-NOOP)
      log "release-lease NOOP: no taskLease document exists"
      echo "claude-auto: nothing to release — no taskLease document exists"
      exit 0 ;;
    RELEASE-NOTHOLDER)
      log "release-lease REFUSED: held by $_rh, not $_id"
      echo "claude-auto: cannot release — this Mac does not hold the lease (held by $_rh)" >&2
      exit 1 ;;
    RELEASE-RACE)
      log "release-lease RACE: the version moved under this attempt"
      echo "claude-auto: release FAILED — the lease changed underneath this attempt; re-run --release-lease" >&2
      exit 1 ;;
    *)
      log "release-lease INCONCLUSIVE rc=$_rrc verdict=${_rv:-none}"
      echo "claude-auto: release-lease FAILED — rc=$_rrc verdict=${_rv:-none} (check claude is logged in and the artifact-DB tool name)" >&2
      exit 1 ;;
  esac
fi
LEASE_WHY=''; LEASE_SEEN_HOLDER='-'
if [ "$LEASE_GATE" = off ]; then
  log "WARN lease gate SKIPPED by --no-lease task=${TASK:-none} by $(id -un) — manual use only, never in a task definition"
elif [ "$LEASE_GATE" = auto ] && [ -z "$TASK" ]; then
  : # no --task: not one of the 59 scheduled writers. Interactive Vanessa Live, or a one-off with a human
    # present — the same reasoning the Command Deck uses. `--lease` gates those too.
elif lease_gate; then
  log "lease ok role=$ROLE task=${TASK:-none} mode=$mode ($LEASE_WHY)"
else
  log "defer task=${TASK:-none} role=$ROLE mode=$mode: lease — $LEASE_WHY"
  if [ "$LEASE_SEEN_HOLDER" != '-' ] && [ -n "$LEASE_SEEN_HOLDER" ]; then
    echo "claude-auto: standby: lease held by $LEASE_SEEN_HOLDER — this Mac is not the task writer." >&2
  else
    echo "claude-auto: standby: this Mac cannot prove it holds the task lease." >&2
  fi
  echo "claude-auto: $LEASE_WHY" >&2
  echo "claude-auto: deferred (exit 75); the runner retries. To make this Mac PRIMARY see REMOTE-ACCESS.md." >&2
  exit 75
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
