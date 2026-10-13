#!/bin/bash
# Stop hook: once code has been written in this session, it is not "done" until (1) the deterministic checks pass and
# (2) a DIFFERENT agent - the code-validator - has read the diff with the VibeBreaker protocol. Steven, 2026-10-12:
# "ensure once I code something another agent validates the code works using these tools".
# Blocks the stop at most once per change-set (hash of the diff); never blocks when Claude is already continuing
# because of this hook (stop_hook_active), and never blocks when nothing code-like changed.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"; cd "$ROOT" || exit 0
INPUT=$(cat 2>/dev/null || true)
printf '%s' "$INPUT" | grep -q '"stop_hook_active": *true' && exit 0
STATE=".claude/state"; mkdir -p "$STATE"
CHANGED=$( { git diff --name-only HEAD -- ; git ls-files --others --exclude-standard; } 2>/dev/null | grep -E '\.(py|sh|js|mjs|ts|html|json)$|^go\.sh$' | grep -v '^\.claude/state/' | head -50)
[ -z "$CHANGED" ] && exit 0
HASH=$(bash scripts/validate-code.sh --hash 2>/dev/null)
[ -n "$HASH" ] && grep -q "^$HASH " "$STATE/validated.txt" 2>/dev/null && exit 0
if OUT=$(bash scripts/validate-code.sh 2>&1); then
  REASON="Code changed this session and the deterministic checks PASS (docs/reports/CODE-VALIDATION.md). Before stopping, run the second half of the code-validation gate: dispatch the code-validator subagent (Agent tool, subagent_type \"code-validator\") on the current diff, apply or answer every CONFIRMED finding, then run \`bash scripts/validate-code.sh --mark\` so this change-set ($HASH) is recorded as reviewed. Then stop."
else
  REASON="Code changed this session and the deterministic checks FAIL. Fix them first (output below), then dispatch the code-validator subagent on the diff and run \`bash scripts/validate-code.sh --mark\`.
$(printf '%s' "$OUT" | grep -A12 '^FAIL' | head -40)"
fi
python3 - "$REASON" <<'EOF'
import json, sys
print(json.dumps({"decision": "block", "reason": sys.argv[1]}))
EOF
exit 0
