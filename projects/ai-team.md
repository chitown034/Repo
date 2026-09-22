# Project — AI Team

**What.** The org of AI seats that runs behind Vanessa: on the Mac, **172 agents** (tier 1: 17,
tier 2: 96, tier 3: 59), **60 scheduled tasks**, **15 MCP servers** (`toolkitSnapshot`, synced
2026-09-16 00:52 UTC). Full seat-by-seat detail is in `wiki/ai-team/index.md` — do not read the
roster dump to answer a "who owns X" question.

## The shape

- **Steven** — principal. Every licensed decision.
- **Vanessa** — Chief of Staff / COO, orchestrator, single point of contact, council chair.
- **Steve** — Steven's digital twin, Tier-1 work.
- **Executives:** Marcus (CFO) · Sofia (CMO) · Derek (CTO) · Alexandra (CCO) · Nadia (CAIO) ·
  Victor (CRO) · Elena (CISO) · Elon (CTO Innovator).
- **Mentors:** Maxwell (broker coach) · Apex (trade advisor) · James (wealth / family office) ·
  **Kevin** (personal development — the deck's name; the Desktop skill is `cole-mentor`, drift open).
- **Human:** ISA / EA, Mon–Fri 12–4 PM PT.

Lead agents by fan-out: cro-victor 27 · vanessa-orchestrator 22 · cmo-sofia 15 · cco-alexandra 12 ·
cto-derek 10 · cfo-marcus 8 · caio-nadia 6 · portfolio-manager 6 · ciso-elena 4.

## The engineering loop (under Elon, vetted before anything ships)

Stress Test · Reliability · Efficiency · Capability · Integration engineers, plus Sandbox QA and the
Chief Automation Strategist. **ECC** (standards, test, observability, accessibility, security,
dependency and agent-safety officers, under Derek) reviews every change — it is a **gate, not a store**.
Nadia scans outward and proposes; Elon vets inward and decides feasibility; both are proposal-only and
report to Steven cc Vanessa.

## Status (2026-09-22) — honest

- Model tiering is decided and recorded (`context/decisions.md`), not yet enforced by tooling.
- **Skills present on the Mac:** continuous-process-improvement, automation-audit, automation-audit-ops,
  ai-ecosystem-backup, deck-backup, fub-followups (a Follow Up Boss template library — needs porting
  to Lofty). **Not present:** interview-me, prompt-master, vanessa-orchestrator (it exists as an agent,
  and the CI log records a Mac skill on 2026-09-08, but it is not in the snapshot's 1,400 names),
  loop-engineering, scale-growth-engine. `skills-refresh` exists as a **Sunday task that has never run**,
  not as a skill.
- `weekly-self-update` (Fri 23:10 PT) has **never run**; `improvementProposals` is empty.
- `steve-twin-sweep` (weekdays 12:55 PM PT) last **refused**: a Bash write to `~/Shearrill-Vault` is
  not on the runner's allow-list. The cloud Steve-twin routine is disabled.
