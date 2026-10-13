#!/bin/bash
# validate-code.sh - the deterministic half of the code-validation gate. Bash 3.2 safe, no network.
#
#   bash scripts/validate-code.sh            check every file changed since HEAD (staged, unstaged, untracked)
#   bash scripts/validate-code.sh --since X  check files changed since commit/ref X (exit 2 on a bad ref)
#   bash scripts/validate-code.sh --files a b check exactly these files
#   bash scripts/validate-code.sh --hash      print the change-set hash the hook, --mark and the validator agree on
#   bash scripts/validate-code.sh --mark      record the change-set as reviewed - refused unless this same hash
#                                             PASSED the checks and docs/reports/CODE-VALIDATION-REVIEW.md names it
#
# Per file type: .py -> py_compile (+ the brain's unit tests and `bin/brain layout` when brain/ changed); .sh -> bash -n
# (+ shellcheck when installed); .js/.mjs -> node --check; .json -> parse; dashboard HTML -> dashboard/tests/quickcheck.py;
# Deleted and staged-only changes are part of the change-set (hashed, listed) even though no per-file check can run on them.
# brain pages (CLAUDE.md, INDEX.md, memory, wiki, references, context, projects) -> bin/brain doctor.
# Writes docs/reports/CODE-VALIDATION.md and exits 1 on any FAIL. The second half - a different agent reading the diff
# with the VibeBreaker 20-pass protocol - is the code-validator agent (.claude/agents/code-validator.md); the Stop
# hook asks for it once per change-set. Generated reports and the index are never part of the change-set.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT" || exit 2
STATE=".claude/state"; mkdir -p "$STATE"
REPORT="docs/reports/CODE-VALIDATION.md"
REVIEW="docs/reports/CODE-VALIDATION-REVIEW.md"
EXCLUDE='^(docs/reports/CODE-VALIDATION(-REVIEW)?\.md|brain/index\.json|INDEX\.md|brain/loop-history\.jsonl|docs/reports/(BRAIN-LOOP|BRAIN-BENCH|ENCYCLOPEDIA)\.md|\.claude/state/.*|(.*/)?__pycache__/.*|.*\.pyc|(.*/)?node_modules/.*)$'
MODE="${1:-}"; [ $# -gt 0 ] && shift
g() { git -c core.quotepath=off "$@"; }   # plain UTF-8 names, never "caf\303\251.py" in quotes

changed_files() {
  case "$MODE" in
    --files) printf '%s\n' "$@" ;;
    --since) g diff --no-renames --name-only "$1" -- ; g diff --no-renames --cached --name-only -- ; g ls-files --others --exclude-standard ;;
    *) g diff --no-renames --name-only HEAD -- 2>/dev/null; g diff --no-renames --cached --name-only -- 2>/dev/null; g ls-files --others --exclude-standard 2>/dev/null ;;
  esac
}
if [ "$MODE" = "--since" ]; then
  git rev-parse --verify --quiet "${1:-}^{commit}" >/dev/null 2>&1 || { echo "bad ref: ${1:-<none>}" >&2; exit 2; }
fi
FILES=$(changed_files "$@" | grep -v '^$' | grep -Ev "$EXCLUDE" | sort -u | while IFS= read -r f; do { [ -f "$f" ] || git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; } && printf '%s\n' "$f"; done)
# The hash covers the file list, the tracked diff of exactly those files, and the content of every untracked one -
# one EXCLUDE list decides both what is checked and what is hashed, so a generated file can never move the hash.
HASH=$( { printf '%s\n' "$FILES"
          while IFS= read -r f; do
            [ -n "$f" ] || continue
            if git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then g diff --no-renames HEAD -- "$f" 2>/dev/null; g diff --no-renames --cached -- "$f" 2>/dev/null; [ -f "$f" ] || echo "deleted $f"; else cat -- "$f"; fi
          done <<< "$FILES"
        } | (command -v shasum >/dev/null 2>&1 && shasum -a 256 || sha256sum) | cut -c1-16)

case "$MODE" in
  --hash) printf '%s\n' "$HASH"; exit 0 ;;
  --mark)
    grep -q "^$HASH " "$STATE/passed.txt" 2>/dev/null || { echo "refused: change-set $HASH has not PASSED the deterministic checks (run: bash scripts/validate-code.sh)"; exit 1; }
    grep -q "$HASH" "$REVIEW" 2>/dev/null || { echo "refused: $REVIEW does not name change-set $HASH - the code-validator agent has not reviewed it"; exit 1; }
    printf '%s %s\n' "$HASH" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE/validated.txt"; echo "marked $HASH as reviewed"; exit 0 ;;
esac

PASS=0; FAIL=0; LINES=""
say() { LINES="$LINES
$1"; printf '%s\n' "$1"; }
run() { # <label> <command...>
  local label="$1"; shift
  local out; if out=$("$@" 2>&1); then PASS=$((PASS+1)); say "PASS $label"; else FAIL=$((FAIL+1)); say "FAIL $label"; say "$(printf '%s' "$out" | tail -12 | sed 's/^/      /')"; fi
}
quickcheck() { # dashboard HTML: the one pre-existing "functions called but never defined" row is a known false positive
  local out; out=$(python3 dashboard/tests/quickcheck.py "$1" 2>&1) || true
  printf '%s' "$out" | grep -q 'RESULT: PASS' && return 0
  printf '%s' "$out" | grep '^FAIL' | grep -v 'no functions called but never defined' | grep -q . && { printf '%s\n' "$out" | grep '^FAIL'; return 1; }
  return 0
}

[ -z "$FILES" ] && { say "nothing changed since HEAD - nothing to validate"; exit 0; }
say "code validation $(date -u +%Y-%m-%dT%H:%M:%SZ) - change-set $HASH"
say "files:"
while IFS= read -r f; do [ -n "$f" ] && say "  $f"; done <<< "$FILES"
BRAIN=0; DOCTOR=0; KAPSO=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in brain/*.py) BRAIN=1;; integrations/kapso/*.py) KAPSO=1;; esac
  [ -f "$f" ] || { say "  deleted: $f"; continue; }
  case "$f" in
    *.py) run "py_compile $f" python3 -m py_compile "$f"; case "$f" in brain/*) BRAIN=1;; esac ;;
    *.sh) run "bash -n $f" bash -n "$f"; command -v shellcheck >/dev/null 2>&1 && run "shellcheck $f" shellcheck -S warning "$f" ;;
    *.js|*.mjs) run "node --check $f" node --check "$f" ;;
    *.json) run "json $f" python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$f" ;;
    dashboard/*.html) run "quickcheck $f" quickcheck "$f" ;;
    *.yml|*.yaml) if python3 -c "import yaml" >/dev/null 2>&1; then run "yaml $f" python3 -c "import sys, yaml; yaml.safe_load(open(sys.argv[1]))" "$f"; else say "SKIP yaml $f (PyYAML not installed)"; fi ;;
    CLAUDE.md|memory.md|wiki/*|references/*|context/*|projects/*) DOCTOR=1 ;;
    *) # extensionless scripts: decide by the shebang line only, never by a word elsewhere on line 1
       line1=$(head -c 80 -- "$f" 2>/dev/null | head -1)
       case "$line1" in
         "#!"*"$(printf '\r')") run "shebang has CRLF $f" sh -c 'echo "line 1 ends in \\r - the kernel cannot run this script"; exit 1' ;;
         "#!"*/python*|"#!"*"env python"*) run "py_compile $f" python3 -m py_compile "$f" ;;
         "#!"*/bash|"#!"*/bash" "*|"#!"*/sh|"#!"*/sh" "*|"#!"*"env bash"*|"#!"*"env sh"*) run "bash -n $f" bash -n "$f" ;;
       esac ;;
  esac
done <<< "$FILES"
[ "$KAPSO" = 1 ] && run "kapso unit tests" sh -c "cd integrations/kapso/tests && python3 -m unittest -q 2>&1 | tail -3 | grep -q '^OK'"
[ "$BRAIN" = 1 ] && { DOCTOR=1; run "brain unit tests" sh -c "cd brain/tests && python3 -m unittest -q 2>&1 | tail -3 | grep -q '^OK'"; run "brain layout" bin/brain layout; }
[ "$DOCTOR" = 1 ] && run "brain doctor" bin/brain doctor
VERDICT=$([ "$FAIL" = 0 ] && echo PASS || echo FAIL)
say "verdict: $VERDICT ($PASS passed, $FAIL failed)"
[ "$FAIL" = 0 ] && printf '%s %s\n' "$HASH" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATE/passed.txt"
REVIEWED="not yet"; grep -q "^$HASH " "$STATE/validated.txt" 2>/dev/null && REVIEWED="yes"
mkdir -p "$(dirname "$REPORT")"
{ echo "# Code validation — last run"; echo; echo "Deterministic checks by \`scripts/validate-code.sh\`; the agent review (VibeBreaker 20-pass, code-validator) for change-set \`$HASH\`: **$REVIEWED**."; echo; echo '```'; printf '%s\n' "$LINES" | sed '1{/^$/d;}'; echo '```'; } > "$REPORT"
[ "$FAIL" = 0 ]
