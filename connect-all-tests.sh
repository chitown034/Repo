#!/bin/bash
# connect-all-tests.sh - stubbed tests for connect-all.sh's runner_fix and keep_awake (runs on Linux or macOS).
set -u
cd "$(dirname "$0")" || exit 1
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/home"
FUNCS="$(sed -n '/^have()/p;/^runner_fix() {/,/^}/p;/^keep_awake() {/,/^}/p' connect-all.sh)"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (expected rc $3, got $2)"; fi; }
stub_runner() { # <restart exit code> <status text after restart>
  cat > "$T/bin/runnerctl" <<S
#!/bin/sh
case "\$1" in
  restart) echo restarted; [ -f "$T/restarted" ] || touch "$T/restarted"; exit $1 ;;
  status) if [ -f "$T/restarted" ]; then echo "$2"; else echo "logged in; running: fabric-deck-sync"; fi ;;
  list) echo "task ok" ;;
esac
S
  chmod +x "$T/bin/runnerctl"; rm -f "$T/restarted"
}
run_fn() { PATH="$T/bin:$PATH" HOME="$T/home" LOG="$T/log" bash -c "sleep() { :; }; $FUNCS
$1" >/dev/null 2>&1; echo $?; }

stub_runner 0 "logged in; idle";            check "hung runner is restarted and passes"      "$(run_fn runner_fix)" 0
stub_runner 1 "logged in; idle";            check "failed restart lands in FAIL"            "$(run_fn runner_fix)" 1
stub_runner 0 "not running";                check "runner still stopped lands in FAIL"      "$(run_fn runner_fix)" 1
stub_runner 0 "not logged in";              check "logged-out runner lands in FAIL"         "$(run_fn runner_fix)" 1

printf '#!/bin/sh\n[ "$1" = list ] && echo "{ \\"PID\\" = 42; }"\nexit 0\n' > "$T/bin/launchctl"; chmod +x "$T/bin/launchctl"
check "keep-awake loads and is confirmed by PID"    "$(run_fn keep_awake)" 0
printf '#!/bin/sh\n[ "$1" = list ] && echo "{ }"\nexit 0\n' > "$T/bin/launchctl"
check "keep-awake without a PID lands in FAIL"       "$(run_fn keep_awake)" 1
printf '#!/bin/sh\n[ "$1" = load ] && exit 5\nexit 0\n' > "$T/bin/launchctl"
check "launchctl load failure lands in FAIL"         "$(run_fn keep_awake)" 1

echo "connect-all tests: $pass passed, $fail failed"; [ "$fail" = 0 ]
