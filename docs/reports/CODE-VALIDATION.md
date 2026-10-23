# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `5ce4447a7b3870eb`: **not yet**.

```
code validation 2026-10-23T00:10:20Z - change-set 5ce4447a7b3870eb
files:
  always-on/README.md
  dashboard/brain-4d.html
  integrations/agent-os/agents.json
  integrations/agent-os/agents/homelab-architect.md
  integrations/agent-os/agents/network-troubleshooter.md
  integrations/agent-os/agents/pytorch-build-resolver.md
  wiki/ai-team/bot-crew.md
  wiki/ai-team/cross-functional.md
  wiki/ai-team/org-chart.md
PASS quickcheck dashboard/brain-4d.html
PASS json integrations/agent-os/agents.json
PASS brain doctor
verdict: PASS (3 passed, 0 failed)
```
