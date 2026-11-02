# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `68f1a82fb79faaeb`: **not yet**.

```
code validation 2026-11-02T01:22:59Z - change-set 68f1a82fb79faaeb
files:
  brain/__main__.py
  brain/agentos.py
  brain/deck-sync.json
  brain/layers.py
  brain/links.py
  brain/recs/big-moves.json
  brain/tests/test_agentos.py
  brain/tests/test_layers.py
  brain/tests/test_route_baseline.py
  context/decisions.md
  dashboard/brain-4d.html
  docs/inventory/agent-roster.md
  docs/inventory/claude-sessions.md
  docs/inventory/org-chart.json
  docs/reports/BIG-MOVES.md
  docs/reports/LAYERS.md
  docs/reports/PRESENCE.md
  exports/notebooklm/00-START-HERE.md
  exports/notebooklm/01-router-and-index.md
  exports/notebooklm/02-who-and-decisions.md
  exports/notebooklm/03-projects.md
  exports/notebooklm/04-wiki-ai-team.md
  exports/notebooklm/05-wiki-mortgage-programs.md
  exports/notebooklm/06-wiki-real-estate-playbooks.md
  exports/notebooklm/07-wiki-dashboard-ops.md
  exports/notebooklm/08-wiki-events-networking.md
  exports/notebooklm/09-references.md
  exports/notebooklm/10-always-on-and-automation.md
  exports/notebooklm/11-6d-brain-map.md
  exports/notebooklm/12-integrations.md
  integrations/CONNECTIONS.md
  integrations/agent-os/agents.json
  integrations/agent-os/agents/README.md
  integrations/agent-os/agents/agent-evaluator.md
  integrations/agent-os/agents/ux-designer.md
  integrations/notebooklm/README.md
  integrations/notebooklm/drive-manifest.json
  integrations/skill-packs/REGISTRY-2026-11-01.md
  integrations/skill-packs/install-mac.sh
  integrations/skill-packs/reports/2026-11-01-group-a.md
  integrations/skill-packs/reports/2026-11-01-group-b.md
  integrations/skill-packs/reports/2026-11-01-group-c.md
  memory.md
  memory/fieldy-meetings.md
  projects/command-deck.md
  scripts/skill-pick.sh
  wiki/ai-team/cross-functional.md
  wiki/ai-team/desk-seats.md
  wiki/ai-team/index.md
  wiki/ai-team/org-chart.md
PASS py_compile brain/__main__.py
PASS py_compile brain/agentos.py
PASS json brain/deck-sync.json
PASS py_compile brain/layers.py
PASS py_compile brain/links.py
PASS json brain/recs/big-moves.json
PASS py_compile brain/tests/test_agentos.py
PASS py_compile brain/tests/test_layers.py
PASS py_compile brain/tests/test_route_baseline.py
PASS quickcheck dashboard/brain-4d.html
PASS json docs/inventory/org-chart.json
PASS json integrations/agent-os/agents.json
PASS json integrations/notebooklm/drive-manifest.json
PASS bash -n integrations/skill-packs/install-mac.sh
PASS shellcheck integrations/skill-packs/install-mac.sh
PASS bash -n scripts/skill-pick.sh
PASS shellcheck scripts/skill-pick.sh
PASS 6D page tests (passages script-safe + private, merge-live)
PASS brain unit tests
PASS brain layout
PASS brain doctor
verdict: PASS (21 passed, 0 failed)
```
