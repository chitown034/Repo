#!/bin/bash
# test-alienware-docs.sh - static hygiene checks for integrations/alienware and integrations/anydesk.
# No network, no PowerShell needed. Exit 0 = all pass.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANY="$(cd "$HERE/../anydesk" && pwd)"
FAILS=0
pass() { printf 'PASS  %s\n' "$*"; }
fail() { printf 'FAIL  %s\n' "$*"; FAILS=$((FAILS + 1)); }

# Files to scan: everything in both folders except this test and the linter (which name the patterns).
FILES=()
for f in "$HERE"/*.ps1 "$HERE"/*.md "$ANY"/*.md "$ANY"/*.py "$ANY"/*.json; do
  [ -f "$f" ] && FILES+=("$f")
done
[ "${#FILES[@]}" -gt 0 ] || { echo "no files found"; exit 1; }

check_absent() { # label, extended-regex
  local label="$1" re="$2" hits
  hits="$(grep -nEi -- "$re" "${FILES[@]}" 2>/dev/null || true)"
  if [ -n "$hits" ]; then fail "$label"; printf '%s\n' "$hits" | sed 's/^/        /'; else pass "$label"; fi
}

check_absent "no Invoke-Expression"            'Invoke-Expression'
check_absent "no iex"                          '(^|[^A-Za-z0-9_-])iex([^A-Za-z0-9_-]|$)'
check_absent "no execution-policy Bypass"      'Bypass'
check_absent "no -ExecutionPolicy flag"        '(^|[[:space:]])-ExecutionPolicy'
check_absent "no Start-Transcript"             'Start-Transcript'
check_absent "no AWS keys"                     'AKIA[0-9A-Z]{16}'
check_absent "no GitHub tokens"                'gh[pousr]_[A-Za-z0-9]{20,}'
check_absent "no Hugging Face tokens"          'hf_[A-Za-z0-9]{20,}'
check_absent "no Tailscale auth keys"          'tskey-[A-Za-z0-9]{8,}'
check_absent "no API-style secret keys"        'sk-[A-Za-z0-9_-]{20,}'
check_absent "no private key blocks"           'BEGIN [A-Z ]*PRIVATE KEY'
check_absent "no assigned passwords"           '(password|passwd|pwd|secret|token)[[:space:]]*[=:][[:space:]]*["'"'"'][^"'"'"'[:space:]]{4,}'
check_absent "no real pairing links"           'orca://pair\?code=[A-Za-z0-9]'

# Hard-coded public IPv4 addresses (private, loopback, CGNAT/Tailscale, link-local are fine).
ips="$(grep -noE '([0-9]{1,3}\.){3}[0-9]{1,3}' "${FILES[@]}" 2>/dev/null || true)"
bad=""
while IFS= read -r line; do
  [ -n "$line" ] || continue
  ip="${line##*:}"
  IFS=. read -r a b c d <<<"$ip"
  case "$a" in 10|127|0) continue ;; esac
  if [ "$a" = 172 ] && [ "$b" -ge 16 ] && [ "$b" -le 31 ]; then continue; fi
  if [ "$a" = 192 ] && [ "$b" = 168 ]; then continue; fi
  if [ "$a" = 100 ] && [ "$b" -ge 64 ] && [ "$b" -le 127 ]; then continue; fi
  if [ "$a" = 169 ] && [ "$b" = 254 ]; then continue; fi
  bad="${bad}${line}"$'\n'
done <<<"$ips"
if [ -n "$bad" ]; then fail "no public IP literals"; printf '%s' "$bad" | sed 's/^/        /'; else pass "no public IP literals"; fi

# The only AnyDesk id examples allowed are the fake 000 000 000 style.
if grep -nE '"id"[[:space:]]*:[[:space:]]*"[0-9 ]+"' "$ANY/devices.example.json" | grep -vE '"000 000 00[0-9]"' >/dev/null; then
  fail "devices.example.json must only hold fake 000 000 000 ids"
else pass "devices.example.json holds only fake ids"; fi

# Safety statements must be present.
grep -q 'NEVER sets an unattended-access password' "$HERE/alienware-setup.ps1" && pass "script states it never sets an AnyDesk password" || fail "missing no-password statement"
grep -q 'AsSecureString' "$HERE/alienware-setup.ps1" && pass "hidden prompt for pairing link" || fail "no hidden prompt"
if grep -nE "ArgumentList[^#]*grant-desktop" "$HERE/alienware-setup.ps1" >/dev/null; then fail "desktop control passed to orca"; else pass "desktop control never passed to orca"; fi

# Linter + tests, when python3 is present.
if command -v python3 >/dev/null 2>&1; then
  python3 "$HERE/lint-ps1.py" >/dev/null && pass "lint-ps1.py clean" || fail "lint-ps1.py reported findings"
  (cd "$ANY" && python3 -m unittest -q test_anydesk_links 2>&1 | tail -3) | grep -q '^OK' && pass "anydesk unit tests" || fail "anydesk unit tests"
fi

if [ "$FAILS" -gt 0 ]; then echo "RESULT: $FAILS failure(s)"; exit 1; fi
echo "RESULT: all checks pass"
