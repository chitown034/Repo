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
# python 3.9 -> brew install python is the planned step; claude 2.1.278 -> claude update
printf '#!/bin/sh\ncase "$*" in *version_info*) exit 1 ;; *) echo 3.9 ;; esac\n' > "$T/bin/python3"
printf '#!/bin/sh\n[ "$1" = --version ] && echo "2.1.278 (Claude Code)"\n' > "$T/bin/claude"; chmod +x "$T/bin/python3" "$T/bin/claude"
out="$(GO_FORCE=1 HOME="$T/home" PATH="$T/bin:$PATH" bash scripts/second-mac.sh --preview 2>&1)"
printf '%s' "$out" | grep -q "would run: py_via_uv";                             check "old python -> uv-built Python 3.12 planned"  "$?" 0
printf '#!/bin/sh\ncase "$1" in python) [ "$2" = find ] && echo "%s/uvpy/bin/python3.12"; exit 0 ;; esac\nexit 0\n' "$T" > "$T/bin/uv"; mkdir -p "$T/uvpy/bin"; printf '#!/bin/sh\n' > "$T/uvpy/bin/python3.12"; chmod +x "$T/bin/uv" "$T/uvpy/bin/python3.12"
rm -f "$T/bin/python3"; GO_FORCE=1 HOME="$T/home" PATH="$T/bin:/usr/bin:/bin" bash -c '. <(sed -n "/^have()/p;/^run()/p;/^py_via_uv() {/,/^}/p" scripts/second-mac.sh); PREVIEW=0; py_via_uv' >/dev/null 2>&1
[ -L "$T/home/.local/bin/python3" ] && grep -q "local/bin" "$T/home/.zprofile";  check "py_via_uv: shim in ~/.local/bin + .zprofile line, nothing under /usr" "$?" 0
printf '%s' "$out" | grep -q "would run: claude update";                         check "old Claude Code -> claude update planned"    "$?" 0
printf '#!/bin/sh\n[ "$1" = --version ] && echo "2.1.290 (Claude Code)"\n' > "$T/bin/claude"
out="$(GO_FORCE=1 HOME="$T/home" PATH="$T/bin:$PATH" bash scripts/second-mac.sh --preview 2>&1)"
printf '%s' "$out" | grep -q "would run: claude update";                         check "new Claude Code -> no update"                "$?" 1
echo "second-mac tests: $pass passed, $fail failed"; [ "$fail" -eq 0 ]
