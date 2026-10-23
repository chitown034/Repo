#!/bin/bash
# second-mac-tests.sh - stubbed preview tests for scripts/second-mac.sh (Linux or macOS).
set -u
cd "$(dirname "$0")/../.." || exit 1
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT; mkdir -p "$T/bin" "$T/home"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1"; fi; }
printf '#!/bin/sh\n[ "$1" = -p ] && { echo /Library/Developer; exit 0; }\nexit 1\n' > "$T/bin/xcode-select"
printf '#!/bin/sh\necho vm\n' > "$T/bin/scutil"; chmod +x "$T/bin/"*
out="$(GO_FORCE=1 HOME="$T/home" PATH="$T/bin:$PATH" bash scripts/second-mac.sh --preview 2>&1)"; rc=$?
check "preview exits 0"                                      "$rc" 0
printf '%s' "$out" | grep -q "would run: bash .*connect-all.sh --preview";       check "preview hands off to connect-all --preview" "$?" 0
[ ! -e "$T/home/.config/claude-runner/role" ];                                   check "preview writes no role file"                "$?" 0
printf "%s" "$out" | grep -E "would run:" | grep -qiE "login|save-token|claude auth"; check "never runs a sign-in or token command" "$?" 1
printf '%s' "$out" | grep -q "Lease role";                                        check "lease role step present"                    "$?" 0
echo "second-mac tests: $pass passed, $fail failed"; [ "$fail" -eq 0 ]
