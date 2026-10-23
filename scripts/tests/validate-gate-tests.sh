#!/bin/bash
# validate-gate-tests.sh - scripts/validate-code.sh can hash and mark a change-set that is already committed (--since).
set -u
cd "$(dirname "$0")/../.." || exit 1
pass=0; fail=0; check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (got $2, want $3)"; fi; }
H1=$(bash scripts/validate-code.sh --since HEAD~1 --hash); H2=$(bash scripts/validate-code.sh --since HEAD~1 2>/dev/null | grep -o 'change-set [0-9a-f]*' | head -1 | cut -d' ' -f2)
[ -n "$H1" ] && [ "$H1" = "$H2" ]; check "--since --hash equals the hash the --since check run prints" "$?" 0
H3=$(bash scripts/validate-code.sh --hash)
[ "$H1" != "$H3" ] || [ -z "$(git status --short | grep -v '^??')" ]; check "--since hash is not the working-tree hash (unless the tree is clean)" "$?" 0
bash scripts/validate-code.sh --since HEAD~1 --mark >/dev/null 2>&1; rc=$?
grep -q "^$H1 " .claude/state/passed.txt 2>/dev/null && grep -q "$H1" docs/reports/CODE-VALIDATION-REVIEW.md 2>/dev/null; both=$?
[ "$rc" = 0 ] && [ "$both" = 0 ] || [ "$rc" != 0 ] && [ "$both" != 0 ]; check "--since --mark succeeds exactly when the range passed and is reviewed" "$?" 0
bash scripts/validate-code.sh --since nosuchref --hash >/dev/null 2>&1; check "bad ref is refused" "$?" 2
echo "validate-gate tests: $pass passed, $fail failed"; [ "$fail" -eq 0 ]
