#!/bin/bash
# Tests for setup.sh (2026-10-27): syntax, the --check plan runs anywhere without a terminal, nothing secret is printed,
# and the branch overrides reach the two scripts it wraps. Run: bash scripts/tests/test_setup.sh
set -u
cd "$(dirname "$0")/../.." || exit 2
pass=0; fail=0
t() { if "$@" >/dev/null 2>&1; then pass=$((pass+1)); else fail=$((fail+1)); echo "FAIL: $*"; fi; }
t bash -n setup.sh
t bash -n connect-all.sh
t bash -n scripts/fix-mine.sh
TMP="$(mktemp -d)"; export HOME="$TMP"
out="$(GO_FORCE=1 SETUP_REPO="$PWD" FIX_MINE_UNAME=Darwin bash setup.sh --check </dev/null 2>&1)"; rc=$?
t test "$rc" -eq 0
t grep -q "CHECK ONLY" <<<"$out"
t grep -q "REPORT" <<<"$out"
t grep -q "Only you" <<<"$out"
t grep -q "would ask (hidden, Enter skips): Hume" <<<"$out"
# never a value: the plan must not print anything that looks like a key or token
if grep -qE "[A-Za-z0-9_-]{32,}" <<<"$out"; then fail=$((fail+1)); echo "FAIL: a long token-like string appeared in the --check output"; else pass=$((pass+1)); fi
# branch override is exported to the wrapped scripts
t grep -q 'CONNECT_ALL_BRANCH' connect-all.sh
t grep -q 'FIX_MINE_BRANCH' scripts/fix-mine.sh
t grep -q 'REPO_SYNC_BRANCH' scripts/repo-sync.sh
# the plan never reads the terminal (stdin closed above) and never writes a key file
t test ! -d "$TMP/.config"
rm -rf "$TMP"
echo "setup tests: pass $pass  FAIL $fail"
[ "$fail" -eq 0 ]
# ---- validator follow-ups (2026-10-27) ----
pass2=0; fail2=0
t2() { if "$@" >/dev/null 2>&1; then pass2=$((pass2+1)); else fail2=$((fail2+1)); echo "FAIL: $*"; fi; }
t2 grep -q '<key>REPO_SYNC_BRANCH</key><string>$BRANCH</string>' connect-all.sh          # the LaunchAgent keeps the branch
t2 test "$(grep -c 'CONNECT_ALL_SKIP_KEYS' connect-all.sh)" -ge 3                          # Lofty, TidyCal, Arive prompts skippable
t2 grep -q 'SETUP_NESTED' scripts/fix-mine.sh
TMP2="$(mktemp -d)"; export HOME="$TMP2"; mkdir -p "$TMP2/bin"
printf '#!/bin/sh\necho "runner: running"\necho "CLI NOT logged in"\necho "task x last ok"\n' > "$TMP2/bin/runnerctl"; chmod +x "$TMP2/bin/runnerctl"
out2="$(PATH="$TMP2/bin:$PATH" GO_FORCE=1 SETUP_REPO="$PWD" FIX_MINE_UNAME=Darwin bash setup.sh --check </dev/null 2>&1)"
t2 grep -q "signed out" <<<"$out2"                                                       # a signed-out runner is NOT "connected"
t2 grep -q "runnerctl login" <<<"$out2"
t2 test "$(grep -c 'copy from here down' <<<"$out2")" -eq 1                                # exactly one REPORT banner
rm -rf "$TMP2"
echo "setup follow-up tests: pass $pass2  FAIL $fail2"
[ "$fail2" -eq 0 ]
