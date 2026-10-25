#!/bin/bash
# runner-transfer-tests.sh - stubbed tests for runner-export.sh / runner-import.sh (Linux or macOS).
set -u
cd "$(dirname "$0")/../.." || exit 1
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1"; fi; }
# a fake Mac 1
H1="$T/mac1"; mkdir -p "$H1/Applications/claude-runner/tasks" "$H1/Applications/claude-runner/__pycache__" "$H1/.local/bin" "$H1/Library/LaunchAgents" "$H1/Desktop" "$H1/.config/claude-runner"
echo 'print("sup")' > "$H1/Applications/claude-runner/supervisor.py"; echo '{}' > "$H1/Applications/claude-runner/schedule.json"
echo 'x' > "$H1/Applications/claude-runner/tasks/a.md"; echo 'junk' > "$H1/Applications/claude-runner/run.log"; echo 'c' > "$H1/Applications/claude-runner/__pycache__/x.pyc"
echo 'SECRET' > "$H1/.config/claude-runner/oauth-token"
printf '#!/bin/sh\necho ctl\n' > "$H1/.local/bin/runnerctl"
printf '<plist><dict><key>ProgramArguments</key><array><string>/usr/bin/python3</string><string>%s/Applications/claude-runner/supervisor.py</string></array></dict></plist>\n' "$H1" > "$H1/Library/LaunchAgents/com.stevenshearrill.claude-runner.plist"
HOME="$H1" bash scripts/runner-export.sh >"$T/exp.out" 2>&1; check "export runs" "$?" 0
Z="$H1/Desktop/claude-runner-mac2.zip"; [ -s "$Z" ]; check "zip written" "$?" 0
unzip -l "$Z" > "$T/zl"; grep -q "supervisor.py" "$T/zl" && grep -q "tasks/a.md" "$T/zl" && grep -q "bin/runnerctl" "$T/zl"; check "zip holds runner, tasks, runnerctl, plist" "$?" 0
grep -qE "run.log|pycache|oauth-token" "$T/zl"; check "zip holds no log, cache or token" "$?" 1
[ "$(cat "$H1/.config/claude-runner/role")" = peer ]; check "export writes peer role on Mac 1 when missing" "$?" 0
# a fake Mac 2
H2="$T/mac2"; mkdir -p "$H2/Downloads" "$H2/.config/claude-runner" "$T/bin"; cp "$Z" "$H2/Downloads/"; echo peer > "$H2/.config/claude-runner/role"
printf '#!/bin/sh\necho "$@" >> "%s/launchctl.calls"\nexit 0\n' "$T" > "$T/bin/launchctl"; printf '#!/bin/sh\nexit 0\n' > "$T/bin/plutil"; printf '#!/bin/sh\necho 501\n' > "$T/bin/id"; chmod +x "$T/bin/"*
HOME="$H2" PATH="$T/bin:$PATH" bash scripts/runner-import.sh >"$T/imp.out" 2>&1; check "import runs" "$?" 0
[ -f "$H2/Applications/claude-runner/supervisor.py" ] && [ -x "$H2/.local/bin/runnerctl" ]; check "runner + runnerctl installed" "$?" 0
grep -q "$H2/Applications/claude-runner/supervisor.py" "$H2/Library/LaunchAgents/com.stevenshearrill.claude-runner.plist"; check "plist rewritten to this home" "$?" 0
grep -q "bootstrap gui/501" "$T/launchctl.calls"; check "agent loaded with launchctl" "$?" 0
grep -qiE "login|save-token" "$T/launchctl.calls"; check "import never signs in" "$?" 1
HOME="$H2" PATH="$T/bin:$PATH" bash scripts/runner-import.sh --preview >"$T/prev.out" 2>&1; grep -q "would:" "$T/prev.out"; check "preview prints the plan" "$?" 0
echo "runner-transfer tests: $pass passed, $fail failed"; [ "$fail" -eq 0 ]
