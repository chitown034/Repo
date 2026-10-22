#!/bin/bash
# Tests for rc-agent.sh using stub claude/launchctl/pmset/caffeinate in a temp HOME.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT="${HERE}/rc-agent.sh"
T="$(mktemp -d "${TMPDIR:-/tmp}/rc-test.XXXXXX")"
trap 'kill $(jobs -p) 2>/dev/null; rm -rf "$T"' EXIT
export HOME="$T/home"; mkdir -p "$HOME" "$T/bin" "$T/repo"
STUBS="$T/bin"; export STUB_DIR="$T/stubstate"; mkdir -p "$STUB_DIR"
export PATH="$STUBS:/usr/bin:/bin"
export RC_REPO="$T/repo"
PASS=0; FAIL=0
ck() { if [ "$1" = 0 ]; then PASS=$((PASS + 1)); printf 'ok   - %s\n' "$2"; else FAIL=$((FAIL + 1)); printf 'FAIL - %s\n' "$2"; fi; }
t() { local d="$1"; shift; if "$@"; then ck 0 "$d"; else ck 1 "$d"; fi; }

cat > "$STUBS/claude" <<'S'
#!/bin/bash
case "$1" in
  --version) echo "2.1.295 (Claude Code)" ;;
  auth) if [ "${STUB_LOGIN:-1}" = 1 ]; then printf '{\n  "loggedIn": true,\n  "authMethod": "oauth_token"\n}\n'; else printf '{\n  "loggedIn": false\n}\n'; fi ;;
  remote-control) cat "${STUB_RC_OUT:-/dev/null}"; sleep 30 ;;
esac
S
cat > "$STUBS/launchctl" <<'S'
#!/bin/bash
echo "$*" >> "$STUB_DIR/launchctl.log"
case "$1" in
  bootstrap) touch "$STUB_DIR/loaded" ;;
  bootout)   if [ -f "$STUB_DIR/loaded" ]; then rm -f "$STUB_DIR/loaded"; else exit 3; fi ;;
  print)     [ -f "$STUB_DIR/loaded" ] || exit 113
             printf 'gui/501/x = {\n\tstate = running\n\tpid = %s\n}\n' "$(cat "$STUB_DIR/pid" 2>/dev/null || echo 0)" ;;
esac
exit 0
S
cat > "$STUBS/pmset" <<'S'
#!/bin/bash
printf 'Battery Power:\n sleep                5\n womp                 0\nAC Power:\n sleep                10\n womp                 1\n'
S
cat > "$STUBS/caffeinate" <<'S'
#!/bin/bash
echo "caffeinate $*" >> "$STUB_DIR/caff.log"
[ "$1" = "-i" ] && shift
exec "$@"
S
cat > "$STUBS/pgrep" <<'S'
#!/bin/bash
cat "$STUB_DIR/pgrep.out" 2>/dev/null; exit 0
S
cat > "$STUBS/scutil" <<'S'
#!/bin/bash
echo "Steven's MacBook"
S
chmod +x "$STUBS"/*

snap() { (cd "$HOME" && find . -print | LC_ALL=C sort; grep -v "^print" "$STUB_DIR/launchctl.log" 2>/dev/null); }

# 1 dry-run changes nothing
before="$(snap)"
for c in install stop uninstall restart report; do
  : | "$AGENT" --dry-run "$c" >/dev/null 2>&1
done
"$AGENT" install --dry-run </dev/null >"$T/dry.out" 2>&1
after="$(snap)"
t "dry-run changes nothing (no files, no launchctl calls)" [ "$before" = "$after" ]
t "dry-run install prints the plist" grep -q 'KeepAlive' "$T/dry.out"
t "dry-run install does not prompt or install" bash -c "! test -e '$HOME/Library/LaunchAgents'"

# 2 install refuses without y
for ans in "" "n" "N" "maybe"; do printf '%s\n' "$ans" | "$AGENT" install >/dev/null 2>&1; done
"$AGENT" install </dev/null >/dev/null 2>&1
t "install without y writes nothing" bash -c "! test -e '$HOME/Library/LaunchAgents/com.stevenshearrill.claude-remote-control.plist'"
t "install without y never bootstraps" bash -c "! grep -q bootstrap '$STUB_DIR/launchctl.log' 2>/dev/null"
printf 'y\n' | "$AGENT" install >"$T/inst.out" 2>&1
P="$HOME/Library/LaunchAgents/com.stevenshearrill.claude-remote-control.plist"
t "install with y writes the plist" test -f "$P"
t "plist has KeepAlive, the label, caffeinate and the repo" bash -c "grep -q '<key>KeepAlive</key><true/>' '$P' && grep -q com.stevenshearrill.claude-remote-control '$P' && grep -q RC_CAFFEINATE '$P' && grep -q '$T/repo' '$P'"
t "install with y bootstraps once" bash -c "[ \$(grep -c '^bootstrap' '$STUB_DIR/launchctl.log') = 1 ]"
t "plist logs go to vanessa-remote-control" grep -q 'Library/Logs/vanessa-remote-control' "$P"

# 3 url parsing
ESC="$(printf '\033')"; BEL="$(printf '\007')"
mkdir -p "$HOME/Library/Logs/vanessa-remote-control"; LOG="$HOME/Library/Logs/vanessa-remote-control/agent.log"
rm -f "$HOME/.config/claude-runner/remote-control.json"
geturl() { printf '%b' "$1" > "$LOG"; "$AGENT" url 2>/dev/null; }
t "url: plain line" [ "$(geturl 'Session URL: https://claude.ai/code/session_ABC123\n')" = "https://claude.ai/code/session_ABC123" ]
t "url: ANSI colour + trailing period" [ "$(geturl "Open ${ESC}[36mhttps://claude.ai/code/session_X9?bridge=env_1${ESC}[0m.\n")" = "https://claude.ai/code/session_X9?bridge=env_1" ]
t "url: OSC-8 hyperlink wrapper" [ "$(geturl "${ESC}]8;;https://claude.ai/code/session_OSC${BEL}click${ESC}]8;;${BEL}\n")" = "https://claude.ai/code/session_OSC" ]
t "url: takes the LAST link" [ "$(geturl 'a https://claude.ai/code/session_old\r\nb https://claude.ai/code/session_new\r\n')" = "https://claude.ai/code/session_new" ]
t "url: brackets/quotes stop the match" [ "$(geturl 'see (https://claude.ai/code/session_P)\n')" = "https://claude.ai/code/session_P" ]
t "url: no link means no output and exit 1" bash -c "printf 'Remote Control starting...\n' > '$LOG'; ! '$AGENT' url >/dev/null 2>&1"
t "url: ignores non-claude.ai links" bash -c "printf 'docs https://example.com/x\n' > '$LOG'; ! '$AGENT' url >/dev/null 2>&1"

# 4 run loop captures a link from the stub CLI, report is clean
printf 'Remote Control connected\nSession URL: https://claude.ai/code/session_LIVE42\n' > "$STUB_DIR/rc.out"
export STUB_RC_OUT="$STUB_DIR/rc.out"
rm -f "$LOG" "$HOME/.config/claude-runner/remote-control.json"
printf "Steven's Mac #2\n" > /dev/null
mkdir -p "$HOME/.config/claude-runner"; printf 'Test Mac Alpha\n/Users/x/secret\n' > "$HOME/.config/claude-runner/id"
RC_CLAUDE="$STUBS/claude" RC_CAFFEINATE="$STUBS/caffeinate" "$AGENT" run >/dev/null 2>&1 &
RUNPID=$!; echo "$RUNPID" > "$STUB_DIR/pid"
for _ in 1 2 3 4 5 6 7 8 9 10; do grep -q LIVE42 "$HOME/.config/claude-runner/remote-control.json" 2>/dev/null && break; sleep 1; done
S="$HOME/.config/claude-runner/remote-control.json"
t "run: state JSON has the captured url" grep -q '"url":"https://claude.ai/code/session_LIVE42"' "$S"
t "run: state JSON has host, startedAt, pid, claudeVersion" bash -c "grep -q '\"host\":' '$S' && grep -q '\"startedAt\":\"20' '$S' && grep -q '\"pid\":[0-9]' '$S' && grep -q '\"claudeVersion\":\"2.1.295' '$S'"
t "run: wrapped in caffeinate -i" grep -q '^caffeinate -i' "$STUB_DIR/caff.log"
R="$("$AGENT" report)"
t "report: one line" [ "$(printf '%s\n' "$R" | wc -l | tr -d ' ')" = 1 ]
t "report: has the five keys and the url" bash -c "printf '%s' '$R' | grep -Eq '^\\{\"host\":\"[^\"]*\",\"label\":\"Test Mac Alpha\",\"url\":\"https://claude.ai/code/session_LIVE42\",\"startedAt\":\"20[^\"]*\",\"checkedAt\":\"20[^\"]*\"\\}\$'"
t "report: no HOME path, no keys, no file paths" bash -c "! printf '%s' '$R' | grep -Eq '$HOME|/Users/|/home/|sk-ant|token'"
t "report: valid JSON (if python3 present)" bash -c "command -v python3 >/dev/null || exit 0; printf '%s' '$R' | python3 -c 'import json,sys; d=json.load(sys.stdin); assert sorted(d)==[\"checkedAt\",\"host\",\"label\",\"startedAt\",\"url\"]'"
t "doctor: finds the running agent, one instance, passes" bash -c "printf '4242\n' > '$STUB_DIR/pgrep.out'; STUB_LOGIN=1 '$AGENT' doctor >'$T/doc.ok' 2>&1; rc=\$?; grep -q 'no other remote-control instance' '$T/doc.ok'; [ \$rc = 0 ]"
t "doctor: reports pmset values and a sleep warning" bash -c "grep -q 'pmset sleep: AC=10' '$T/doc.ok' && grep -q 'WARN  AC idle sleep' '$T/doc.ok'"
t "doctor: warns about a second instance" bash -c "printf '1\n2\n3\n' > '$STUB_DIR/pgrep.out'; '$AGENT' doctor 2>&1 | grep -q 'other .claude remote-control. process'"
kill "$RUNPID" 2>/dev/null; wait "$RUNPID" 2>/dev/null; pkill -f "$STUBS/claude" 2>/dev/null
: > "$STUB_DIR/pgrep.out"

# 4b dead agent: report must not hand out a stale link
echo 999999 > "$STUB_DIR/pid"
sed -i.bak 's/"pid":[0-9]*/"pid":999999/' "$S"
R2="$("$AGENT" report)"
t "report: stale link withheld when the process is gone" bash -c "printf '%s' '$R2' | grep -q '\"url\":\"\"'"

# 5 stop / uninstall idempotent
t "stop twice exits 0" bash -c "'$AGENT' stop >/dev/null 2>&1 && '$AGENT' stop >/dev/null 2>&1"
t "uninstall twice exits 0" bash -c "'$AGENT' uninstall >/dev/null 2>&1 && '$AGENT' uninstall >/dev/null 2>&1"
t "uninstall removed plist and state" bash -c "! test -e '$P' && ! test -e '$S'"
t "stop on a never-installed Mac exits 0" bash -c "'$AGENT' stop >/dev/null 2>&1"
t "uninstall keeps the logs" test -d "$HOME/Library/Logs/vanessa-remote-control"

# 6 doctor flags missing login and agent
rm -f "$STUB_DIR/loaded"
STUB_LOGIN=0 "$AGENT" doctor >"$T/doc.bad" 2>&1; rc=$?
t "doctor exits non-zero when problems exist" [ "$rc" != 0 ]
t "doctor flags missing login" grep -q 'FAIL  not logged in' "$T/doc.bad"
t "doctor flags missing LaunchAgent" grep -q 'FAIL  LaunchAgent not installed' "$T/doc.bad"
t "doctor flags not loaded" grep -q 'FAIL  LaunchAgent not loaded' "$T/doc.bad"
printf 'Enable Remote Control? (y/n)\n' > "$LOG"
"$AGENT" doctor 2>&1 | grep -q 'first-run prompt'; t "doctor flags an unanswered first-run prompt" [ $? = 0 ]
t "doctor flags a gateway base URL" bash -c "ANTHROPIC_BASE_URL=https://gw.example.com '$AGENT' doctor 2>&1 | grep -q 'FAIL  ANTHROPIC_BASE_URL'"

printf '\n%s passed, %s failed\n' "$PASS" "$FAIL"
[ "$FAIL" = 0 ]
