# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `0833480d8b00af18`: **not yet**.

```
code validation 2026-11-09T04:30:03Z - change-set 0833480d8b00af18
files:
  context/decisions.md
  integrations/ai-engineering-from-scratch/README.md
  integrations/ai-engineering-from-scratch/install.sh
  integrations/perplexica/README.md
  integrations/perplexica/install.sh
  references/index.md
PASS bash -n integrations/ai-engineering-from-scratch/install.sh
PASS bash -n integrations/perplexica/install.sh
PASS brain doctor
verdict: PASS (3 passed, 0 failed)
```
