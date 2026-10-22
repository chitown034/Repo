# Code validation — last run

Deterministic checks by `scripts/validate-code.sh`; the agent review (VibeBreaker 20-pass, code-validator) for change-set `be456516ed8780cb`: **not yet**.

```
code validation 2026-10-22T18:01:30Z - change-set be456516ed8780cb
files:
  .claude/agents/caio-nadia.md
  .claude/agents/cco-alexandra.md
  .claude/agents/cfo-marcus.md
  .claude/agents/ciso-elena.md
  .claude/agents/cmo-sofia.md
  .claude/agents/cro-victor.md
  .claude/agents/cto-derek.md
  .claude/agents/cto-innovator.md
  .claude/agents/vanessa-orchestrator.md
  CLAUDE.md
  brain/agentfiles.py
  brain/indexer.py
  brain/tests/test_agentos.py
  docs/branch-triage-2026-10-22.md
  integrations/agent-os/agents/network-troubleshooter.md
  integrations/agent-os/agents/vanessa-orchestrator.md
  projects/aeo-presence.md
  projects/aeo-presence/README.md
  projects/aeo-presence/docs/01-presence-audit.md
  projects/aeo-presence/docs/02-strategy.md
  projects/aeo-presence/docs/03-question-bank.md
  projects/aeo-presence/docs/04-content-calendar-90-days.md
  projects/aeo-presence/docs/05-llm-citation-checklist.md
  projects/aeo-presence/docs/06-schema-for-existing-sites.md
  projects/aeo-presence/profiles/00-canonical-identity.md
  projects/aeo-presence/profiles/facebook.md
  projects/aeo-presence/profiles/google-business-profile.md
  projects/aeo-presence/profiles/instagram.md
  projects/aeo-presence/profiles/linkedin.md
  projects/aeo-presence/profiles/nmls-dre-directories.md
  projects/aeo-presence/profiles/tiktok.md
  projects/aeo-presence/profiles/x-threads.md
  projects/aeo-presence/profiles/yelp-nextdoor-bing-apple.md
  projects/aeo-presence/profiles/youtube.md
  projects/aeo-presence/profiles/zillow-realtor-homes.md
  projects/aeo-presence/schema/faq.jsonld
  projects/aeo-presence/schema/mortgage-loan-originator.jsonld
  projects/aeo-presence/schema/person.jsonld
  projects/aeo-presence/schema/real-estate-agent.jsonld
  projects/aeo-presence/schema/video.jsonld
  projects/aeo-presence/scripts/validate-schema.mjs
  projects/aeo-presence/site/.well-known/security.txt
  projects/aeo-presence/site/humans.txt
  projects/aeo-presence/site/index.html
  projects/aeo-presence/site/llms-full.txt
  projects/aeo-presence/site/llms.txt
  projects/aeo-presence/site/robots.txt
  projects/aeo-presence/site/sitemap.xml
  projects/aeo-presence/site/va-home-loans-temecula.html
  wiki/ai-team/model-tiering-dispatch.md
  wiki/ai-team/toolkit.md
PASS py_compile brain/agentfiles.py
PASS py_compile brain/indexer.py
PASS py_compile brain/tests/test_agentos.py
PASS node --check projects/aeo-presence/scripts/validate-schema.mjs
PASS brain unit tests
PASS brain layout
PASS brain doctor
verdict: PASS (7 passed, 0 failed)
```
