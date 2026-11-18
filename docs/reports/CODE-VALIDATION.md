# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `d3ece96ebdd93bb9`: **not yet**.

```
code validation 2026-11-18T03:28:19Z - change-set d3ece96ebdd93bb9
files:
  brain/__main__.py
  brain/agency.py
  brain/layout.py
  brain/tests/test_agency.py
  context/decisions.md
  integrations/agency-agents/README.md
  integrations/agency-agents/install.sh
  integrations/agency-agents/roster.json
  integrations/skill-packs/REGISTRY-2026-11-18.md
  integrations/skill-packs/install-2026-11-18.sh
  references/index.md
  wiki/ai-team/agency-teams.md
  wiki/ai-team/org-chart.md
PASS py_compile brain/__main__.py
PASS py_compile brain/agency.py
PASS py_compile brain/layout.py
PASS py_compile brain/tests/test_agency.py
PASS bash -n integrations/agency-agents/install.sh
PASS json integrations/agency-agents/roster.json
PASS bash -n integrations/skill-packs/install-2026-11-18.sh
PASS brain unit tests
PASS brain layout
PASS brain doctor
verdict: PASS (10 passed, 0 failed)
```
