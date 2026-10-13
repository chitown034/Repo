#!/bin/bash
# validate-code.sh - the deterministic half of the code-validation gate. Bash 3.2 safe, no network.
#
#   bash scripts/validate-code.sh            check every file changed since HEAD (staged, unstaged, untracked)
#   bash scripts/validate-code.sh --since X  check files changed since commit/ref X
#   bash scripts/validate-code.sh --files a b check exactly these files
#   bash scripts/validate-code.sh --mark      record the current change-set as reviewed by the code-validator agent
#   bash scripts/validate-code.sh --hash      print the change-set hash the hook and --mark agree on
#
# Per file type: .py -> py_compile (+ the brain's unit tests when brain/ changed); .sh -> bash -n (+ shellcheck when
# installed); .js/.mjs -> node --check; .json -> parse; dashboard HTML -> dashboard/tests/quickcheck.py; CLAUDE.md /
# INDEX.md / wiki / memory -> bin/brain doctor. Writes docs/reports/CODE-VALIDATION.md and exits 1 on any FAIL.
# The second half - a different agent reading the diff with the VibeBreaker 20-pass protocol - is the
# code-validator agent (.claude/agents/code-validator.md); the Stop hook asks for it once per change-set.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT" || exit 2
STATE=".claude/state"; mkdir -p "$STATE"
REPORT="docs/reports/CODE-VALIDATION.md"
MODE="${1:-}"; shift || true

changed_files() {
  if [ "$MODE" = "--files" ]; then printf '%s\n' "$@"; return; fi
  if [ "$MODE" = "--since" ]; then git diff --name-only "${1:-HEAD}" -- ; git ls-files --others --exclude-standard; return; fi
  { git diff --name-only HEAD -- ; git ls-files --others --exclude-standard; } 2>/dev/null
}
FILES=$(changed_files "$@" | grep -v '^$' | sort -u | while read -r f; do [ -f "$f" ] && printf '%s\n' "$f"; done)
HASH=$( { printf '%s\n' "$FILES"; git diff HEAD -- 2>/dev/null; for f in $FILES; do git ls-files --error-unmatch "$f" >/dev/null 2>&1 || cat "$f"; done; } | (command -v shasum >/dev/null 2>&1 && shasum -a 256 || sha256sum) | cut -c1-16)

case "$MODE" in
  --hash) printf '%s\n' "$HASH"; exit 0 ;;
  --mark) printf '%s %s\n' "$HASH" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE/validated.txt"; echo "marked $HASH as reviewed"; exit 0 ;;
esac

PASS=0; FAIL=0; LINES=""
say() { LINES="$LINES
$1"; printf '%s\n' "$1"; }
run() { # <label> <command...>
  local label="$1"; shift
  local out; if out=$("$@" 2>&1); then PASS=$((PASS+1)); say "PASS $label"; else FAIL=$((FAIL+1)); say "FAIL $label"; say "$(printf '%s' "$out" | tail -12 | sed 's/^/      /')"; fi
}

[ -z "$FILES" ] && { say "nothing changed since HEAD - nothing to validate"; exit 0; }
say "code validation $(date -u +%Y-%m-%dT%H:%M:%SZ) - change-set $HASH"
say "files:"; printf '%s\n' "$FILES" | sed 's/^/  /'
BRAIN=0; DOCTOR=0
for f in $FILES; do
  case "$f" in
    *.py) run "py_compile $f" python3 -m py_compile "$f"; case "$f" in brain/*) BRAIN=1;; esac ;;
    *.sh) run "bash -n $f" bash -n "$f"; command -v shellcheck >/dev/null 2>&1 && run "shellcheck $f" shellcheck -S warning "$f" ;;
    *.js|*.mjs) run "node --check $f" node --check "$f" ;;
    *.json) run "json $f" python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$f" ;;
    dashboard/*.html) run "quickcheck $f" sh -c "python3 dashboard/tests/quickcheck.py '$f' | grep -q 'RESULT: PASS' || { python3 dashboard/tests/quickcheck.py '$f' | grep '^FAIL' | grep -v 'no functions called but never defined' | grep -q . && exit 1; exit 0; }" ;;
    CLAUDE.md|INDEX.md|memory.md|wiki/*|references/*|context/*|projects/*) DOCTOR=1 ;;
  esac
done
[ "$BRAIN" = 1 ] && { DOCTOR=1; run "brain unit tests" sh -c "cd brain/tests && python3 -m unittest -q 2>&1 | tail -3 | grep -q '^OK'"; run "brain layout" bin/brain layout; }
[ "$DOCTOR" = 1 ] && run "brain doctor" bin/brain doctor
VERDICT=$([ "$FAIL" = 0 ] && echo PASS || echo FAIL)
say "verdict: $VERDICT ($PASS passed, $FAIL failed)"
REVIEWED="not yet"; grep -q "^$HASH " "$STATE/validated.txt" 2>/dev/null && REVIEWED="yes"
mkdir -p "$(dirname "$REPORT")"
{ echo "# Code validation — last run"; echo; echo "Deterministic checks by \`scripts/validate-code.sh\`; the agent review (VibeBreaker 20-pass, code-validator) for this change-set: **$REVIEWED**."; echo; echo '```'; printf '%s\n' "$LINES" | sed '1{/^$/d;}'; echo '```'; } > "$REPORT"
[ "$FAIL" = 0 ]
