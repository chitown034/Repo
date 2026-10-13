#!/bin/bash
# shellcheck disable=SC2034  # several variables are read only inside check()'s eval strings
# Tests for the code-validation gate (scripts/validate-code.sh + .claude/hooks/validate-on-stop.sh), run in a scratch
# git repo so the real tree is never touched. Written from the validator's own pass-19 list (2026-10-13).
set -u
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
T=$(mktemp -d 2>/dev/null || mktemp -d -t vc 2>/dev/null); [ -n "$T" ] && [ -d "$T" ] || { echo "no temp dir - refusing to run in the real tree" >&2; exit 2; }
trap 'rm -rf "$T"' EXIT
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "PASS $1"; }
bad() { FAIL=$((FAIL+1)); echo "FAIL $1"; }
check() { if eval "$2"; then ok "$1"; else bad "$1"; fi; }

# scratch repo with the gate copied in
mkdir -p "$T/scripts" "$T/.claude/hooks" "$T/docs/reports" "$T/dashboard/tests" "$T/bin"
cp "$HERE/scripts/validate-code.sh" "$T/scripts/"; cp "$HERE/.claude/hooks/validate-on-stop.sh" "$T/.claude/hooks/"
cp "$HERE/dashboard/tests/quickcheck.py" "$T/dashboard/tests/" 2>/dev/null || printf '#!/usr/bin/env python3\nprint("RESULT: PASS")\n' > "$T/dashboard/tests/quickcheck.py"
printf '#!/bin/sh\nexit 0\n' > "$T/bin/brain"; chmod +x "$T/bin/brain"
cd "$T" || exit 2
git init -q && git config user.email t@t && git config user.name t && printf '.claude/state/\n' > .gitignore && git add -A && git commit -qm init
V="bash scripts/validate-code.sh"; H="bash .claude/hooks/validate-on-stop.sh"
export CLAUDE_PROJECT_DIR="$T"

# 1. mark guard: broken code can never be marked
printf 'x = (\n' > bad.py
$V >/dev/null 2>&1; rc=$?
check "broken python makes the checks FAIL (exit 1)" '[ "$rc" = 1 ]'
check "--mark is refused without a PASS" '! $V --mark >/dev/null 2>&1'
check "hook still blocks after a refused mark" 'echo "{}" | $H | grep -q "\"decision\": \"block\""'
rm bad.py

# 2. mark guard: passing code without a review record is refused; with the review it is accepted
printf 'x = 1\n' > good.py
$V >/dev/null 2>&1; rc=$?
check "valid python PASSES (exit 0)" '[ "$rc" = 0 ]'
check "--mark is refused without a review naming the hash" '! $V --mark >/dev/null 2>&1'
h=$($V --hash)
printf '# review\nchange-set: %s\nverdict: SHIP\n' "$h" > docs/reports/CODE-VALIDATION-REVIEW.md
check "--mark is accepted once the review names the hash" '$V --mark >/dev/null 2>&1'
check "hook allows the stop after a valid mark" '[ -z "$(echo "{}" | $H)" ]'

# 3. mark stability: a plain re-run after the mark does not move the hash
$V >/dev/null 2>&1
check "re-running the checks keeps the same hash" '[ "$($V --hash)" = "$h" ]'
check "hook still allows the stop after the re-run" '[ -z "$(echo "{}" | $H)" ]'

# 4. filename edge cases
printf 'y = 2\n' > "my mod.py"
$V >/dev/null 2>&1; rc=$?
check "a valid file name with a space PASSES" '[ "$rc" = 0 ]'
h1=$($V --hash); printf 'y = 3\n' > "my mod.py"; h2=$($V --hash)
check "editing an untracked file with a space changes the hash" '[ "$h1" != "$h2" ]'
rm "my mod.py"
printf '<html></html>\n' > "dashboard/x';id>PWNED;'.html"
$V >/dev/null 2>&1
check "a crafted dashboard file name runs no command" '[ ! -e PWNED ]'
rm -f "dashboard/x';id>PWNED;'.html" PWNED

# 5. --since with a bad ref fails loudly
check "--since nosuchref exits non-zero" '! $V --since nosuchref >/dev/null 2>&1'

# 6. stop_hook_active is respected even with dirty code
printf 'z = (\n' > dirty.py
check "stop_hook_active true -> no output, exit 0" '[ -z "$(echo "{\"stop_hook_active\": true}" | $H)" ]'
rm dirty.py

# 7. prose-only or generated-only changes never block
git add -A >/dev/null 2>&1; git commit -qm step >/dev/null 2>&1
printf 'note\n' > NOTES.md; mkdir -p brain; printf '{}' > brain/index.json
check "markdown + brain/index.json changes do not block" '[ -z "$(echo "{}" | $H)" ]'

# 8. the report lists the files it checked
rm -f NOTES.md brain/index.json; printf 'w = 4\n' > listed.py; $V >/dev/null 2>&1
check "the report names the checked file" 'grep -q "listed.py" docs/reports/CODE-VALIDATION.md'

# 9. generated files never move the hash (the brain loop rewrites these after a mark)
mkdir -p brain; printf '{}' > brain/loop-history.jsonl; printf 'x\n' > docs/reports/BRAIN-LOOP.md; git add -A >/dev/null 2>&1; git commit -qm gen >/dev/null 2>&1
printf 'v = 5\n' > gen.py; g1=$($V --hash); printf '{"a":1}' > brain/loop-history.jsonl; printf 'changed\n' > docs/reports/BRAIN-LOOP.md; g2=$($V --hash)
check "editing generated loop files keeps the hash" '[ "$g1" = "$g2" ]'
rm -f gen.py; git checkout -q -- brain/loop-history.jsonl docs/reports/BRAIN-LOOP.md

# 10. the suite refuses to run when no temp dir can be made (it must never touch the caller's repo)
FAKE="$T/fakebin"; mkdir -p "$FAKE"; printf '#!/bin/sh\nexit 1\n' > "$FAKE/mktemp"; chmod +x "$FAKE/mktemp"
before=$(git rev-parse HEAD)
( cd "$T" && PATH="$FAKE:$PATH" bash "$HERE/scripts/tests/test-validate-code.sh" >/dev/null 2>&1 ); rc=$?
check "no temp dir -> the suite exits 2 and leaves HEAD alone" '[ "$rc" = 2 ] && [ "$(git rev-parse HEAD)" = "$before" ]'

# 11. deleting a tracked file after a mark changes the hash (the deletion gets reviewed)
printf 'a = 1\n' > a.py; printf 'b = 1\n' > b.py; git add -A >/dev/null 2>&1; git commit -qm ab >/dev/null 2>&1
printf 'b = 2\n' > b.py; d1=$($V --hash); rm a.py; d2=$($V --hash)
check "deleting a tracked file changes the hash" '[ "$d1" != "$d2" ]'
# 12. a deletion-only change can PASS and be marked
git checkout -q -- b.py
$V >/dev/null 2>&1; rc=$?; dh=$($V --hash)
printf 'change-set: %s\n' "$dh" > docs/reports/CODE-VALIDATION-REVIEW.md
check "a deletion-only change-set passes and can be marked" '[ "$rc" = 0 ] && $V --mark >/dev/null 2>&1'
git checkout -q -- a.py
# 13. staged-only changes are part of the change-set
printf '#!/bin/sh\n' > run.sh; git add run.sh >/dev/null 2>&1; git commit -qm run >/dev/null 2>&1
c0=$($V --hash); git update-index --chmod=+x run.sh; c1=$($V --hash)
check "a staged-only mode change changes the hash" '[ "$c0" != "$c1" ]'
git reset -q --hard HEAD

# 14. non-ASCII file names are part of the change-set
printf 'c = 1\n' > "café.py"; git add -A >/dev/null 2>&1; git commit -qm cafe >/dev/null 2>&1
n0=$($V --hash); printf 'c = 2\n' > "café.py"; n1=$($V --hash)
check "editing a non-ASCII file name changes the hash" '[ "$n0" != "$n1" ]'
printf 'z = (\n' > "naïve.py"; $V >/dev/null 2>&1; rc=$?
check "a broken non-ASCII untracked file FAILS the checks" '[ "$rc" = 1 ]'
rm -f "naïve.py"; git checkout -q -- "café.py"
# 15. a deletion beside a staged copy (git's rename detection) still changes the hash
cp a.py b2.py; git add b2.py >/dev/null 2>&1; r0=$($V --hash); rm a.py; r1=$($V --hash)
check "deleting a file beside its staged copy changes the hash" '[ "$r0" != "$r1" ]'
git reset -q --hard HEAD; rm -f b2.py
# 16. an extensionless python script under bin/ is checked and blocks the stop
mkdir -p bin; printf '#!/usr/bin/env python3\nq = (\n' > bin/tool; chmod +x bin/tool
$V >/dev/null 2>&1; rc=$?
check "a broken extensionless script FAILS the checks" '[ "$rc" = 1 ]'
check "the hook blocks on a broken extensionless script" 'echo "{}" | $H | grep -q "\"decision\": \"block\""'
rm -f bin/tool

# 17. the shebang sniff never fires on a word, only on a real #! line; CRLF shebangs fail; skipped YAML is SKIP not PASS
printf '# python notes\n' > NOTES2.md; printf 'FROM python:3.12-slim\n' > Dockerfile; printf '#!/bin/bash # python launcher\necho ok\n' > bin/launch
$V >/dev/null 2>&1; rc=$?
check "a .md and a Dockerfile mentioning python PASS; a bash shebang with the word python gets bash -n" '[ "$rc" = 0 ] && grep -q "bash -n bin/launch" docs/reports/CODE-VALIDATION.md && ! grep -q "py_compile Dockerfile" docs/reports/CODE-VALIDATION.md'
rm -f NOTES2.md Dockerfile bin/launch
printf '#!/bin/bash\r\necho hi\r\n' > bin/crlf; $V >/dev/null 2>&1; rc=$?
check "a CRLF shebang FAILS" '[ "$rc" = 1 ]'
rm -f bin/crlf
printf 'on: [push\n' > bad.yml; out=$(PYTHONPATH=/nonexistent python3 -c "import yaml" >/dev/null 2>&1 && echo has || echo none)
$V > out.txt 2>&1; rc=$?
if [ "$out" = has ]; then check "a broken .yml FAILS when PyYAML is installed" '[ "$rc" = 1 ]'; else check "a .yml is reported SKIP, not PASS, without PyYAML" 'grep -q "SKIP yaml bad.yml" out.txt && ! grep -q "PASS yaml" out.txt'; fi
rm -f bad.yml out.txt

echo "validate-code gate tests: $PASS passed, $FAIL failed"
[ "$FAIL" = 0 ]
