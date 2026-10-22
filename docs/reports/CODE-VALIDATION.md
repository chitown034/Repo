# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `e7f0c30a7ef41e26`: **not yet**.

```
code validation 2026-10-22T23:14:04Z - change-set e7f0c30a7ef41e26
files:
  dashboard/brain-4d.html
  projects/aeo-presence.md
FAIL quickcheck dashboard/brain-4d.html
      FAIL cdStateSeed JSON parses
      FAIL no functions called but never defined (approx.) — active, addEventListener, agent, agents, and, append, approved, assistant, audience, autopilot, back, body, brain, bridge, bridges
PASS brain doctor
verdict: FAIL (1 passed, 1 failed)
```
