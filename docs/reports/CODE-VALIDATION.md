# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `baeb865807d0813a`: **not yet**.

```
code validation 2026-11-15T20:23:05Z - change-set baeb865807d0813a
files:
  brain/__main__.py
  brain/agentos.py
  brain/layout.py
  brain/mausbot.py
  brain/tests/test_mausbot.py
  context/decisions.md
  integrations/agent-os/agents.json
  integrations/openmausbot/README.md
  integrations/openmausbot/build-team.py
  integrations/openmausbot/team.yaml
  scripts/fix-mine.sh
  wiki/ai-team/org-chart.md
PASS py_compile brain/__main__.py
PASS py_compile brain/agentos.py
PASS py_compile brain/layout.py
PASS py_compile brain/mausbot.py
PASS py_compile brain/tests/test_mausbot.py
PASS json integrations/agent-os/agents.json
PASS py_compile integrations/openmausbot/build-team.py
PASS yaml integrations/openmausbot/team.yaml
PASS bash -n scripts/fix-mine.sh
PASS fix-mine shell tests
PASS brain unit tests
PASS brain layout
PASS brain doctor
verdict: PASS (13 passed, 0 failed)
```
