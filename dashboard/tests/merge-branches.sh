#!/bin/bash
# Integrator merge: fold every engineer branch into master, one at a time, gating each merge.
# Usage: bash merge-branches.sh [branch ...]   (default: all engineer branches that have a commit)
set -uo pipefail
DECK=/tmp/claude-0/-home-user-Repo/b13c2454-73f6-56a0-bac6-c201ba53a4a7/scratchpad/deck
TESTS=/tmp/claude-0/-home-user-Repo/b13c2454-73f6-56a0-bac6-c201ba53a4a7/scratchpad/tests
cd "$DECK" || exit 1

BRANCHES=${*:-"e1-daily e2-markets e3-wealth e4a-crm e4b-realestate e5-life e6-aiteam"}
echo "=== merging: $BRANCHES"
FAILED=""
for b in $BRANCHES; do
  if ! git rev-parse --verify "$b" >/dev/null 2>&1; then echo "SKIP $b (no branch)"; continue; fi
  if [ "$(git rev-parse "$b")" = "$(git rev-parse master)" ]; then echo "SKIP $b (no commits beyond base)"; continue; fi
  echo ""
  echo "--- merging $b ($(git log --oneline -1 "$b" | head -c 80))"
  if git merge --no-edit "$b" >/tmp/merge-$b.log 2>&1; then
    echo "    merged clean"
  else
    echo "    CONFLICT — see /tmp/merge-$b.log"
    git diff --name-only --diff-filter=U | sed 's/^/      conflict: /'
    FAILED="$FAILED $b"
    git merge --abort
    continue
  fi
  if python3 "$TESTS/quickcheck.py" command-deck.html 2>&1 | grep -E '^FAIL' | grep -v 'never defined'; then
    echo "    GATE FAILED after $b — rolling this merge back"
    git reset --hard HEAD~1
    FAILED="$FAILED $b(gate)"
  else
    echo "    gate passed"
  fi
done
echo ""
echo "=== done. size: $(wc -c < command-deck.html) bytes"
[ -n "$FAILED" ] && echo "=== NEEDS HAND MERGE:$FAILED" || echo "=== all branches merged"
