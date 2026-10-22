# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `318ffe7f7c5131cf`: **not yet**.

```
code validation 2026-10-22T19:02:20Z - change-set 318ffe7f7c5131cf
files:
  context/decisions.md
  dashboard/brain-4d.html
  dashboard/wave2/splice-presence-orgchart.py
  integrations/agent-os/agents.json
  memory/ai-team.md
  projects/aeo-presence.md
  projects/aeo-presence/README.md
  projects/aeo-presence/data/citations-nap.csv
  projects/aeo-presence/data/compliance-log.csv
  projects/aeo-presence/data/geo-activity-log.csv
  projects/aeo-presence/data/kpi-monthly.csv
  projects/aeo-presence/data/llm-benchmark-log.csv
  projects/aeo-presence/docs/01-presence-audit.md
  projects/aeo-presence/docs/07-technical-seo-spec.md
  projects/aeo-presence/docs/08-local-seo-citations.md
  projects/aeo-presence/docs/09-aeo-answer-engineering.md
  projects/aeo-presence/docs/10-geo-llm-playbook.md
  projects/aeo-presence/docs/11-content-pillars-and-briefs.md
  projects/aeo-presence/docs/12-measurement-and-governance.md
  projects/aeo-presence/docs/13-compliance-marketing-claims.md
  projects/aeo-presence/profiles/00-canonical-identity.md
  projects/aeo-presence/profiles/x-threads.md
  projects/aeo-presence/profiles/youtube.md
  projects/aeo-presence/schema/faq.jsonld
  projects/aeo-presence/scripts/nap-consistency.mjs
  projects/aeo-presence/site/index.html
  projects/aeo-presence/site/links.html
  projects/aeo-presence/site/llms-full.txt
  projects/aeo-presence/site/llms.txt
  projects/aeo-presence/site/military-families-temecula.html
  projects/aeo-presence/site/sitemap.xml
  projects/aeo-presence/site/va-home-loans-temecula.html
  wiki/ai-team/cross-functional.md
  wiki/ai-team/index.md
  wiki/ai-team/org-chart.md
FAIL quickcheck dashboard/brain-4d.html
      FAIL cdStateSeed JSON parses
      FAIL no functions called but never defined (approx.) — active, addEventListener, agent, agents, and, append, approved, assistant, autopilot, back, body, brain, bridge, bridges, browser
PASS py_compile dashboard/wave2/splice-presence-orgchart.py
PASS json integrations/agent-os/agents.json
PASS node --check projects/aeo-presence/scripts/nap-consistency.mjs
PASS brain doctor
verdict: FAIL (4 passed, 1 failed)
```
