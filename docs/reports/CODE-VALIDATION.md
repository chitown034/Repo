# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `0e2e4b8f2c2dc7c7`: **not yet**.

```
code validation 2026-11-15T20:11:35Z - change-set 0e2e4b8f2c2dc7c7
files:
  .claude/skills/agent-browser/SKILL.md
  context/decisions.md
  integrations/browser-agents/README.md
  integrations/browser-agents/install.sh
  integrations/openmausbot/README.md
  integrations/openmausbot/build-team.py
  integrations/openmausbot/install.sh
  integrations/openmausbot/souls/caio-nadia.md
  integrations/openmausbot/souls/cco-alexandra.md
  integrations/openmausbot/souls/ciso-elena.md
  integrations/openmausbot/souls/cmo-sofia.md
  integrations/openmausbot/souls/cro-victor.md
  integrations/openmausbot/souls/cto-derek.md
  integrations/openmausbot/souls/cto-innovator.md
  integrations/openmausbot/souls/vanessa-orchestrator.md
  integrations/openmausbot/team.yaml
  references/index.md
PASS bash -n integrations/browser-agents/install.sh
PASS py_compile integrations/openmausbot/build-team.py
PASS bash -n integrations/openmausbot/install.sh
PASS yaml integrations/openmausbot/team.yaml
PASS brain doctor
verdict: PASS (5 passed, 0 failed)
```
