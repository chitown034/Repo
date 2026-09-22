#!/usr/bin/env bash
# lease-tests.sh — executes the task-lease gate in claude-auto.sh, and re-proves that the PII gate and the
# usage-limit detection it sits in front of still behave, against a STUB `claude` and a simulated artifact-DB
# document. No Mac, no `claude` login, no network, no real artifact store is touched.
#
# The stub is not a canned answer: it implements REMOTE-ACCESS.md's five steps against a fake `state/taskLease`
# file, including the `if_version` pin and the step-4 re-read, so a pinned write really is refused when the
# version moves. STUB_* variables choose which world the stub lives in; see stub_claude() below.
#
#   ./lease-tests.sh            # run everything
#   ./lease-tests.sh -v         # also print each stub invocation
# Exit 0 only if every case passes. Written for macOS bash 3.2; BSD and GNU userland. No secrets.
set -u
set -f

VERBOSE=0; for a in "$@"; do [ "$a" = -v ] && VERBOSE=1; done
HERE="$(cd "$(dirname "$0")" && pwd)"
AUTO="${LEASE_TESTS_AUTO:-$HERE/claude-auto.sh}"
[ -f "$AUTO" ] || { echo "no claude-auto.sh at $AUTO" >&2; exit 2; }
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/lease-tests.XXXXXX") || exit 2
trap 'rm -rf "$ROOT"' EXIT INT TERM

FAKEHOME="$ROOT/home"; BIN="$ROOT/bin"; DB="$ROOT/db"
mkdir -p "$FAKEHOME" "$BIN" "$DB"
OCFG="$FAKEHOME/.config/omniroute"; RCFG="$FAKEHOME/.config/claude-runner"
mkdir -p "$OCFG" "$RCFG"
printf 'OMNIROUTE_API_KEY=not-a-real-key-test-only\n' > "$OCFG/.env"; chmod 600 "$OCFG/.env"
STATE="$OCFG/state"
# a stand-in for OmniRoute's /healthz that needs no listener: curl speaks file://
mkdir -p "$ROOT/omni"; printf 'ok\n' > "$ROOT/omni/healthz"
export OMNIROUTE_BASE="file://$ROOT/omni"

N_PASS=0; N_FAIL=0; FAILED=''
pass() { N_PASS=$((N_PASS+1)); printf '  ok    %s\n' "$1"; }
fail() { N_FAIL=$((N_FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; FAILED="$FAILED
  $1 :: $2"; }
sect() { printf '\n== %s\n' "$*"; }
eq()   { if [ "$2" = "$3" ]; then pass "$1 ($2)"; else fail "$1" "expected '$3', got '$2'"; fi; }
has()  { case "$2" in *"$3"*) pass "$1" ;; *) fail "$1" "'$3' not found in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-400)" ;; esac; }
hasnt(){ case "$2" in *"$3"*) fail "$1" "'$3' WAS present in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-400)" ;; *) pass "$1" ;; esac; }

# ------------------------------------------------------------------ the stub `claude`
cat > "$BIN/claude" <<'STUB'
#!/usr/bin/env bash
# Stub `claude`. Two jobs:
#  (a) a lease check  — recognised by "Task-lease check" in the -p prompt. Implements REMOTE-ACCESS.md's five
#      steps against $DB/taskLease (version= holder= hostname= acquiredAt= expiresAt=; absent file = no document).
#      STUB_RACE=pin    another Mac writes between step 1 and step 3 -> the pinned write is refused
#      STUB_RACE=step4  our write lands, another Mac overwrites it -> the step-4 re-read sees a foreign holder
#      STUB_LEASE=fail  exit 1 with an error envelope (the wording deliberately matches LIMIT_RE)
#      STUB_LEASE=prose exit 0 with no verdict line at all
#      STUB_LEASE=two   exit 0 with two different verdicts in one reply
#      STUB_LEASE=hang  sleep past the timeout
#  (b) anything else is a task run — recorded, then answered per STUB_MODE (ok|limit|prose).
set -u
isonum() { printf '%s' "${1:-}" | tr -dc '0-9' | cut -c1-14; }
prompt=''; want=0
for a in "$@"; do
  if [ "$want" = 1 ]; then prompt="$a"; want=0; fi
  case "$a" in -p|--print) want=1 ;; esac
done
case "$prompt" in
  *"Task-lease check"*)
    # one line per invocation (the prompt is multi-line), plus the routing env the check was handed
    printf 'LEASECHECK BASE_URL=%s AUTH=%s APIKEY=%s\n' "${ANTHROPIC_BASE_URL:-unset}" "${ANTHROPIC_AUTH_TOKEN:+set}" "${ANTHROPIC_API_KEY:+set}" >> "$DB/invocations.lease"
    case "${STUB_LEASE:-ok}" in
      hang)  sleep 120; exit 0 ;;
      fail)  echo '{"type":"result","subtype":"error_during_execution","is_error":true,"result":"API Error: Usage limit reached. Invalid API key - please run /login"}'; exit 1 ;;
      prose) echo '{"type":"result","subtype":"success","is_error":false,"result":"I was unable to use that tool."}'; exit 0 ;;
      two)   echo '{"type":"result","subtype":"success","is_error":false,"result":"LEASE HELD holder=x expires=- and also LEASE FOREIGN holder=y expires=-"}'; exit 0 ;;
      slow)  sleep 3 ;;
    esac
    myid=$(printf '%s\n' "$prompt"   | sed -n 's/^MY_ID: //p'    | head -1)
    myhost=$(printf '%s\n' "$prompt" | sed -n 's/^HOSTNAME: //p' | head -1)
    now=$(printf '%s\n' "$prompt"    | sed -n 's/^NOW: //p'      | head -1)
    exp=$(printf '%s\n' "$prompt"    | sed -n 's/^EXPIRES: //p'  | head -1)
    doc="$DB/taskLease"
    # step 1
    if [ -f "$doc" ]; then
      v1=$(sed -n 's/^version=//p' "$doc"); h1=$(sed -n 's/^holder=//p' "$doc"); e1=$(sed -n 's/^expiresAt=//p' "$doc")
      existed=1
    else v1=''; h1=''; e1=''; existed=0; fi
    say() { printf '{"type":"result","subtype":"success","is_error":false,"result":"%s"}\n' "$1"; exit 0; }
    # step 2 — a live lease someone else holds
    if [ "$existed" = 1 ] && [ "$h1" != "$myid" ] && [ "$(isonum "$e1")" -gt "$(isonum "$now")" ]; then
      say "LEASE FOREIGN holder=$h1 expires=$e1"
    fi
    # another Mac moves the document between our read and our write
    [ "${STUB_RACE:-}" = pin ] && { printf 'version=%s\nholder=other-mac\nhostname=Other\nacquiredAt=%s\nexpiresAt=%s\n' "$(( ${v1:-0} + 1 ))" "$now" "$exp" > "$doc"; }
    # step 3 — the pinned write
    vnow=''; [ -f "$doc" ] && vnow=$(sed -n 's/^version=//p' "$doc")
    if [ "$existed" = 1 ] && [ "$v1" != "$vnow" ]; then say "LEASE RACE holder=- expires=-"; fi
    printf 'version=%s\nholder=%s\nhostname=%s\nacquiredAt=%s\nexpiresAt=%s\n' "$(( ${vnow:-0} + 1 ))" "$myid" "$myhost" "$now" "$exp" > "$doc"
    [ "${STUB_RACE:-}" = step4 ] && { printf 'version=%s\nholder=other-mac\nhostname=Other\nacquiredAt=%s\nexpiresAt=%s\n' "$(( ${vnow:-0} + 2 ))" "$now" "$exp" > "$doc"; }
    # step 4 — the re-read
    h2=$(sed -n 's/^holder=//p' "$doc"); e2=$(sed -n 's/^expiresAt=//p' "$doc")
    [ "$h2" != "$myid" ] && say "LEASE RACE holder=$h2 expires=$e2"
    # step 5
    if [ "$existed" = 1 ] && [ "$h1" = "$myid" ]; then say "LEASE HELD holder=$myid expires=$exp"; fi
    say "LEASE ACQUIRED holder=$myid expires=$exp"
    ;;
esac
# (b) a task run
{ printf 'INVOKE args=[%s] BASE_URL=%s AUTH=%s MODEL=%s ROUTE=%s PII_OK=%s\n' "$*" \
    "${ANTHROPIC_BASE_URL:-unset}" "${ANTHROPIC_AUTH_TOKEN:+set}" "${ANTHROPIC_MODEL:-unset}" \
    "${VANESSA_ROUTE_MODE:-unset}" "${VANESSA_PII_OK:-unset}"; } >> "$DB/invocations.task"
case "${STUB_MODE:-ok}" in
  limit) echo '{"type":"result","subtype":"error_during_execution","is_error":true,"result":"Claude usage limit reached. Your limit will reset at 9pm."}'; exit 1 ;;
  prose) echo '{"type":"result","subtype":"success","is_error":false,"result":"Loan amount $429,000; the escrow limit has been reached for this account."}'; exit 0 ;;
  *)     echo '{"type":"result","subtype":"success","is_error":false,"result":"ok"}'; exit 0 ;;
esac
STUB
chmod +x "$BIN/claude"

# ------------------------------------------------------------------ harness plumbing
reset() { # fresh state, fresh lease document, fresh counters. `set -f` is on, so never glob "$DB"/*.
  rm -rf "$STATE" "$DB"; mkdir -p "$DB" "$STATE"; chmod 700 "$STATE"
  : > "$DB/invocations.lease"; : > "$DB/invocations.task"
  STUB_LEASE=''; STUB_RACE=''; STUB_MODE=''; CACHETTL=''; TMO=8; TMOBIN=''
  rm -f "$OCFG/free-ok-tasks.txt" "$OCFG/pii-tasks.txt"
}
set_doc() { printf 'version=%s\nholder=%s\nhostname=%s\nacquiredAt=%s\nexpiresAt=%s\n' "$1" "$2" "$2-host" "$3" "$4" > "$DB/taskLease"; }
iso_in() { date -u -d "@$(( $(date +%s) + $1 ))" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -r $(( $(date +%s) + $1 )) +%Y-%m-%dT%H:%M:%SZ; }
role() { if [ "$1" = none ]; then rm -f "$RCFG/role"; else printf '# this Mac claude-runner role\n%s\n' "$1" > "$RCFG/role"; chmod 644 "$RCFG/role"; fi; }
myid()  { printf 'test-mac-one\n' > "$RCFG/id"; }
nleases() { wc -l < "$DB/invocations.lease" | tr -d ' '; }
ntasks()  { wc -l < "$DB/invocations.task"  | tr -d ' '; }
LOGF() { cat "$STATE/claude-auto.log" 2>/dev/null || true; }
# state/mode is only written when the route MOVES; no file means the default, subscription.
route_mode() { if [ -r "$STATE/mode" ]; then tr -dc 'a-z-' < "$STATE/mode"; else printf 'subscription'; fi; }

# Everything the stub and the launcher read is EXPORTED: a word produced by expansion is not an assignment,
# so the ${x:+VAR=val} form would be parsed as a command name. Empty means "the default" everywhere (`${x:-…}`).
STUB_LEASE=''; STUB_RACE=''; STUB_MODE=''; CACHETTL=''; TMO=8; TMOBIN=''
export DB HOME PATH STUB_LEASE STUB_RACE STUB_MODE
export OMNIROUTE_CFG="$OCFG" CLAUDE_RUNNER_CFG="$RCFG"
run() { # -> RC, OUT, ERR
  HOME="$FAKEHOME" PATH="$BIN:$PATH" \
  CLAUDE_RUNNER_LEASE_TIMEOUT="$TMO" CLAUDE_RUNNER_LEASE_CACHE_TTL="$CACHETTL" \
  CLAUDE_RUNNER_LEASE_TIMEOUT_BIN="$TMOBIN" \
  STUB_LEASE="$STUB_LEASE" STUB_RACE="$STUB_RACE" STUB_MODE="$STUB_MODE" \
  bash "$AUTO" "$@" >"$ROOT/out" 2>"$ROOT/err"; RC=$?
  OUT=$(cat "$ROOT/out"); ERR=$(cat "$ROOT/err")
  [ "$VERBOSE" = 1 ] && printf '    $ claude-auto %s  -> rc=%s\n' "$*" "$RC"
  return 0
}

printf 'claude-auto lease gate — executed tests\n  script : %s\n  sandbox: %s\n' "$AUTO" "$ROOT"

# ================================================================== A. static checks
sect "A. static"
if bash -n "$AUTO" 2>"$ROOT/e"; then pass "bash -n claude-auto.sh"; else fail "bash -n" "$(cat "$ROOT/e")"; fi
if command -v shellcheck >/dev/null 2>&1; then
  if shellcheck "$AUTO" >"$ROOT/e" 2>&1; then pass "shellcheck (default)"; else fail "shellcheck" "$(cat "$ROOT/e")"; fi
  if shellcheck -S style "$AUTO" >"$ROOT/e" 2>&1; then pass "shellcheck -S style"; else fail "shellcheck style" "$(cat "$ROOT/e")"; fi
else printf '  --    shellcheck not installed, skipped\n'; fi
b4=$(grep -nE 'mapfile|readarray|declare -A|\$\{[A-Za-z_]+\^\^|\$\{[A-Za-z_]+,,|&>>|wait -n|readlink -f' "$AUTO" | grep -v '^[0-9]*:#' || true)
if [ -z "$b4" ]; then pass "no bash-4-only constructs outside comments"; else fail "bash 3.2" "$b4"; fi

# ================================================================== B. the lease gate
sect "B. lease gate — the cases the brief names"

reset; myid; role primary
run --task r10-automation-health -p hello
eq   "B1 primary, no document yet -> runs"              "$RC" "0"
eq   "B1 task really ran"                                "$(ntasks)" "1"
eq   "B1 one lease check"                                "$(nleases)" "1"
has  "B1 verdict ACQUIRED in the log"                    "$(LOGF)" "ACQUIRED"
has  "B1 the lease document now names this Mac"          "$(cat "$DB/taskLease")" "holder=test-mac-one"

reset; myid; role primary; set_doc 4 test-mac-one "$(iso_in -600)" "$(iso_in 3000)"
run --task r10-automation-health -p hello
eq   "B2 primary already holds the lease -> runs"        "$RC" "0"
has  "B2 verdict HELD"                                   "$(LOGF)" "HELD"
eq   "B2 renewed (version bumped 4 -> 5)"                "$(sed -n 's/^version=//p' "$DB/taskLease")" "5"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --task r10-automation-health -p hello
eq   "B3 standby, LIVE foreign lease -> exit 75"         "$RC" "75"
eq   "B3 the task never ran"                             "$(ntasks)" "0"
has  "B3 stderr names the holder"                        "$ERR" "standby: lease held by mac-number-one"
eq   "B3 nothing was written (version still 7)"          "$(sed -n 's/^version=//p' "$DB/taskLease")" "7"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -9000)" "$(iso_in -600)"
run --task r10-automation-health -p hello
eq   "B4 standby, EXPIRED foreign lease -> acquires, runs" "$RC" "0"
eq   "B4 task ran"                                       "$(ntasks)" "1"
has  "B4 verdict ACQUIRED"                               "$(LOGF)" "ACQUIRED"
eq   "B4 document taken over"                            "$(sed -n 's/^holder=//p' "$DB/taskLease")" "test-mac-one"

reset; myid; role primary; set_doc 4 test-mac-one "$(iso_in -600)" "$(iso_in 3000)"; STUB_RACE=pin
run --task r10-automation-health -p hello
eq   "B5 if_version race (pinned write refused) -> 75"   "$RC" "75"
eq   "B5 the task never ran"                             "$(ntasks)" "0"
has  "B5 verdict RACE"                                   "$(LOGF)" "RACE"
eq   "B5 the other Mac's write stands"                   "$(sed -n 's/^holder=//p' "$DB/taskLease")" "other-mac"
STUB_RACE=''

reset; myid; role primary; STUB_RACE=step4
run --task r10-automation-health -p hello
eq   "B6 step-4 re-read sees a foreign holder -> 75"     "$RC" "75"
eq   "B6 the task never ran"                             "$(ntasks)" "0"
STUB_RACE=''

reset; myid; role primary; STUB_LEASE=fail
run --task r10-automation-health -p hello
eq   "B7 check fails while PRIMARY -> RUNS (fail open)"  "$RC" "0"
eq   "B7 task ran"                                       "$(ntasks)" "1"
has  "B7 log says fails OPEN"                            "$(LOGF)" "PRIMARY fails OPEN"
eq   "B7 the route did NOT move (lease output is never scanned for LIMIT_RE)" "$(route_mode)" "subscription"
STUB_LEASE=''

reset; myid; role standby; STUB_LEASE=fail
run --task r10-automation-health -p hello
eq   "B8 check fails while STANDBY -> defers (fail closed)" "$RC" "75"
eq   "B8 the task never ran"                             "$(ntasks)" "0"
has  "B8 log says fails CLOSED"                          "$(LOGF)" "STANDBY fails CLOSED"
STUB_LEASE=''

reset; myid; role none; STUB_LEASE=fail
run --task r10-automation-health -p hello
eq   "B9 NO role file + failing check -> standby, defers" "$RC" "75"
has  "B9 log names the missing role file"                "$(LOGF)" "no role file at"
STUB_LEASE=''

reset; myid; role none
run --task r10-automation-health -p hello
eq   "B10 no role file, healthy check -> still runs"     "$RC" "0"

reset; myid; printf 'primary\n' > "$RCFG/role"; chmod 666 "$RCFG/role"; STUB_LEASE=fail
run --task r10-automation-health -p hello
eq   "B11 world-writable role file ignored -> standby"   "$RC" "75"
has  "B11 log says group/world-writable"                 "$(LOGF)" "group- or world-writable"
STUB_LEASE=''

reset; myid; printf 'PRIMARY\n' > "$RCFG/role"; chmod 644 "$RCFG/role"; STUB_LEASE=fail
run --task r10-automation-health -p hello
eq   "B12 role file is case-insensitive (PRIMARY)"       "$RC" "0"
STUB_LEASE=''

reset; myid; role standby; STUB_LEASE=prose
run --task r10-automation-health -p hello
eq   "B13 reply with no verdict line -> inconclusive"    "$RC" "75"
STUB_LEASE=''

reset; myid; role standby; STUB_LEASE=two
run --task r10-automation-health -p hello
eq   "B14 two contradictory verdicts -> inconclusive"    "$RC" "75"
STUB_LEASE=''

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"; TMO=3; STUB_LEASE=hang
run --task r10-automation-health -p hello
eq   "B15 check times out while STANDBY -> defers"       "$RC" "75"
STUB_LEASE=''; TMO=8

reset; myid; role primary; TMO=3; STUB_LEASE=hang; TMOBIN=none
run --task r10-automation-health -p hello
eq   "B16 timeout via the built-in watchdog, PRIMARY -> runs" "$RC" "0"
eq   "B16 task ran"                                      "$(ntasks)" "1"
STUB_LEASE=''; TMO=8; TMOBIN=''

reset; myid; role primary; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --task r10-automation-health -p hello
eq   "B17 a PRIMARY facing a LIVE foreign lease still defers" "$RC" "75"
eq   "B17 the task never ran"                            "$(ntasks)" "0"
has  "B17 the role never overrides a conclusive answer"  "$(LOGF)" "FOREIGN holder=mac-number-one"

reset; myid; role primary
ANTHROPIC_BASE_URL=http://127.0.0.1:20128 ANTHROPIC_AUTH_TOKEN=fake-proxy-token ANTHROPIC_API_KEY=fake-key \
  run --force free --task weather-news-refresh -p hello
has  "B18 the lease check runs with the proxy variables stripped" "$(cat "$DB/invocations.lease")" "BASE_URL=unset AUTH= APIKEY="

# ================================================================== C. cost control
sect "C. cost control — the cache"

reset; myid; role primary
run --task r10-automation-health -p hello; eq "C1 first call checks" "$(nleases)" "1"
run --task r10-automation-health -p hello
run --task feeds-weekly -p hello
run --task weather-news-refresh -p hello
eq   "C1 three more task invocations, still ONE lease check" "$(nleases)" "1"
eq   "C1 all four tasks ran"                             "$(ntasks)" "4"
has  "C1 the later ones say cached"                      "$(LOGF)" "cached ACQUIRED"

reset; myid; role primary; CACHETTL=1
run --task r10-automation-health -p hello; sleep 2
run --task r10-automation-health -p hello
eq   "C2 an expired cache re-checks"                     "$(nleases)" "2"
CACHETTL=''

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 4)"
run --task r10-automation-health -p hello; eq "C3 standby defers on the live lease" "$RC" "75"
sleep 6
run --task r10-automation-health -p hello
eq   "C3 cached FOREIGN never outlives the lease it saw -> re-checks" "$(nleases)" "2"
eq   "C3 and takes over once it has expired"             "$RC" "0"

reset; myid; role primary
run --task r10-automation-health -p hello
printf 'standby\n' > "$RCFG/role"; chmod 644 "$RCFG/role"
set_doc 9 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --task r10-automation-health -p hello
eq   "C4 flipping the role file busts the cache at once" "$(nleases)" "2"
eq   "C4 and the old primary stands down immediately"    "$RC" "75"

reset; myid; role primary
run --task r10-automation-health -p hello
chmod 666 "$STATE/lease.env"
run --task r10-automation-health -p hello
eq   "C5 a world-writable lease.env is discarded, not trusted" "$(nleases)" "2"
has  "C5 and logged"                                     "$(LOGF)" "not a plain owner-only file"

reset; myid; role primary; STUB_LEASE=slow
run --task feeds-weekly -p hello & p1=$!
run --task weather-news-refresh -p hello & p2=$!
wait $p1 $p2 2>/dev/null || true
eq   "C6 two concurrent invocations pay for ONE lease check (mkdir lock)" "$(nleases)" "1"
STUB_LEASE=''

# ================================================================== D. scope of the gate
sect "D. scope"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run -p hello
eq   "D1 no --task (interactive) is NOT lease-gated"     "$RC" "0"
eq   "D1 no lease check was even run"                    "$(nleases)" "0"
eq   "D1 the session ran"                                "$(ntasks)" "1"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --lease -p hello
eq   "D2 --lease gates a no-task invocation too"         "$RC" "75"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --no-lease --task r10-automation-health -p hello
eq   "D3 --no-lease skips the gate"                      "$RC" "0"
has  "D3 and is logged as a WARN"                        "$(LOGF)" "WARN lease gate SKIPPED by --no-lease"

reset; myid; role standby; set_doc 7 mac-number-one "$(iso_in -60)" "$(iso_in 5000)"
run --status
eq   "D4 --status exits 0"                               "$RC" "0"
eq   "D4 --status spends nothing"                        "$(nleases)" "0"
has  "D4 --status shows the role"                        "$OUT" "lease_role=standby"
has  "D4 --status shows there is no cached decision"     "$OUT" "lease_cached=none"

reset; myid; role primary
run --lease-check
eq   "D5 --lease-check exits 0 when conclusive"          "$RC" "0"
has  "D5 prints the verdict"                             "$OUT" "verdict=ACQUIRED"
eq   "D5 ran no task"                                    "$(ntasks)" "0"

reset; myid; role standby; STUB_LEASE=fail
run --lease-check
eq   "D6 --lease-check exits 1 when it cannot complete"  "$RC" "1"
has  "D6 and says what a task would do"                  "$OUT" "a task would DEFER"
has  "D6 and names the tool to check"                    "$OUT" "CLAUDE_RUNNER_LEASE_TOOLS"
STUB_LEASE=''

# ================================================================== E. nothing that worked was broken
sect "E. pre-existing behaviour (PII gate, limit detection, route hygiene)"

reset; myid; role primary
run --force free --task lofty-crm-sync -p 'summarize the client file'
eq   "E1 client task on the free route still defers"     "$RC" "75"
has  "E1 with the same reason as before"                 "$(LOGF)" "task matches client-data pattern 'lofty-*'"
eq   "E1 no provider was reached"                        "$(ntasks)" "0"

reset; myid; role primary
run --force free -p 'summarize the client file' --task lofty-crm-sync
eq   "E2 F-V2-07 (options after the claude args) still closed" "$RC" "75"

reset; myid; role primary
run --force free -p hello
eq   "E3 F-V2-08 (no --task on a free route) still closed" "$RC" "75"

reset; myid; role primary
run --force free --task lofty-crm-sync-v2 -p hello
eq   "E4 F-V2-09 (renamed client task) still closed"     "$RC" "75"

reset; myid; role primary
printf '*Refresh*\n' > "$OCFG/free-ok-tasks.txt"
run --force free --task Lofty-CRM-Refresh -p hello
eq   "E5 F-H3b-01 (client task in another case) still closed" "$RC" "75"
has  "E5 caught by the deny-list, not the allow-list"    "$(LOGF)" "matches client-data pattern 'lofty-*'"
rm -f "$OCFG/free-ok-tasks.txt"

reset; myid; role primary
run --force free --task lofty-crm-sync --no-pii -p hello
eq   "E6 deny-list still beats --no-pii"                 "$RC" "75"
has  "E6 and says so"                                    "$(LOGF)" "(--no-pii refused)"

reset; myid; role primary
run --force free --task weather-news-refresh -p hello --output-format json
eq   "E7 an allow-listed task still reaches the free provider" "$RC" "0"
has  "E7 with the free model and PII_OK=0"               "$(cat "$DB/invocations.task")" "MODEL=auto/coding:free"
has  "E7 route mode published"                           "$(cat "$DB/invocations.task")" "ROUTE=free-fallback PII_OK=0"

reset; myid; role primary; STUB_MODE=prose
run --task r10-automation-health -p hello --output-format json
eq   "E8 F-V2-10: a healthy run mentioning \$429,000 does NOT flip the route" "$(route_mode)" "subscription"
eq   "E8 and exits 0"                                    "$RC" "0"
STUB_MODE=''

reset; myid; role primary; STUB_MODE=limit
run --task r10-automation-health -p hello --output-format json
eq   "E9 a real usage limit still flips the route"       "$(route_mode)" "free-fallback"
eq   "E9 and exits 75 so the runner retries"             "$RC" "75"
has  "E9 limit-samples.log records the branch, not the text" "$(cat "$STATE/limit-samples.log")" "branch=usage-limit"
STUB_MODE=''

reset; myid; role primary
run --task 'bad name!' -p hello
eq   "E10 the --task charset check still rejects"        "$RC" "64"
eq   "E10 before any lease check"                        "$(nleases)" "0"

reset; myid; role primary
# shellcheck disable=SC2016  # the $(…) is the planted injection payload: it must NOT expand here
printf 'mode=free-fallback\nEVIL=$(touch %s/PWNED)\n' "$ROOT" > "$STATE/route.env"; chmod 666 "$STATE/route.env"
run --status
if [ -e "$ROOT/PWNED" ]; then fail "E11 route.env is never sourced" "the planted command RAN"; else pass "E11 route.env is still never sourced"; fi
has  "E11 and an untrusted route.env is reset"           "$OUT" "mode=subscription"

reset; myid; role primary
run --task r10-automation-health -p hello
eq   "E12 state dir is 700"                              "$(stat -c '%a' "$STATE" 2>/dev/null || stat -f '%OLp' "$STATE")" "700"
eq   "E12 lease.env is 600"                              "$(stat -c '%a' "$STATE/lease.env" 2>/dev/null || stat -f '%OLp' "$STATE/lease.env")" "600"

reset; myid; role primary
run --task r10-automation-health -p hello
hasnt "E13 no lease lock is left behind"                 "$(ls "$STATE")" "lease.lock"

# ================================================================== summary
printf '\n------------------------------------------------------------\n'
printf 'pass %s   FAIL %s\n' "$N_PASS" "$N_FAIL"
if [ "$N_FAIL" -gt 0 ]; then printf 'failed:%s\n' "$FAILED"; exit 1; fi
exit 0
