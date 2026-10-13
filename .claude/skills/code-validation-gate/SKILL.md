---
name: code-validation-gate
description: The rule that code is not done until a different agent has validated it — deterministic checks (scripts/validate-code.sh) plus the VibeBreaker 20-pass adversarial review by the code-validator agent, recorded per change-set. Use after writing or changing any code, when the Stop hook blocks with a validation reason, when Steven asks "does this actually work", or before a commit, publish or push of code.
---
# Code validation gate

Steven, 2026-10-12: "ensure once I code something another agent validates the code works using these tools."
Two halves, both required, in this order:

1. **Deterministic** — `bash scripts/validate-code.sh` (every changed file: syntax, JSON parse, node/bash checks, the
   brain's unit tests and `bin/brain layout` when `brain/` changed, dashboard `quickcheck.py` for HTML, `bin/brain doctor`
   when the brain's pages changed). Report: `docs/reports/CODE-VALIDATION.md`. Exit 1 on any FAIL.
2. **Adversarial, by a different agent** — dispatch `code-validator` (Agent tool, `subagent_type: "code-validator"`; on the
   Mac: `claude --agent code-validator`). It reads the diff with the VibeBreaker protocol vendored in
   `integrations/code-validation/vibebreaker/` (20 passes: injection, auth, secrets, failure paths, concurrency, leaks,
   N+1, complexity, memory, timeouts, idempotency, transactions, config, supply chain, logging, API and cross-module
   contracts, test gaps, then pass 20 disproves everything it can). Report: `docs/reports/CODE-VALIDATION-REVIEW.md`.
3. Fix or answer every CONFIRMED finding, re-run step 1, then `bash scripts/validate-code.sh --mark`. The mark is refused
   unless this exact change-set PASSED the checks and `docs/reports/CODE-VALIDATION-REVIEW.md` names its hash (the
   validator copies the `change-set:` line from the checks' output), so nothing can be marked without a real review.
   Marks live in `.claude/state/validated.txt` (gitignored, per machine). Tests: `bash scripts/tests/test-validate-code.sh`.

**Enforcement.** `.claude/settings.json` runs `.claude/hooks/validate-on-stop.sh` as a Stop hook: when code files changed
and this change-set is not marked, the stop is blocked once with the instruction above. It never loops (respects
`stop_hook_active`) and never fires on prose-only edits. On the Mac the same hook runs in every Claude Code session in
this repo; `go.sh` pulls it with the files.

**Who.** The validator reports to Derek beside the ECC gate; the ECC officers still own standards, the validator owns
"does it actually work". Engineering seats (every `*-engineer`, `*-reviewer`, `*-architect`, the ECC officers, Elon's
team) carry this gate and the VibeBreaker pack in their toolkit line (`bin/brain os show <slug>`).

**Never.** Never mark a change-set the validator has not read. Never skip a FAIL to get a clean stop. Never let the
validator patch code: it reports, the author fixes.

**Known lows (validator round 6, 2026-10-13, accepted as follow-ups).** Shebang sniffing reads the first 80 bytes and does not
parse `env -S …`; an extensionless file outside `bin/`, `scripts/`, `.claude/hooks/` and `.github/workflows/` does not trigger the
hook; the SKIP-yaml branch is untested where PyYAML is installed. None lets broken code through silently: the hook still asks
for the agent review on every path it watches. Six validator rounds on the gate itself found 17 defects; the ledger is in
`docs/reports/CODE-VALIDATION-REVIEW.md` (latest) and the gate's own tests.
