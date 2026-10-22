# Mentors and benches

The four mentor seats (on call through Vanessa, not inside the executive dispatch chain) and what a "ruflo bench" actually is when you see one listed under an executive.

## The mentor seats

- **Maxwell** — Broker Mentor & Coach. Loan scenarios and underwriting, processing, mortgage brokering, California practice and CAR forms, transaction coordination, producer coaching. Answers in a fixed structure: priorities → 4 courses of action → recommendation → implement this week. Monday recommendations task.
- **Apex** — Trade Advisor Mentor. Structured trade tickets, session plans, process grades — **never an execution**. Runs the 7-agent investment-committee bench (market-scout → technical-analyst → fundamental-analyst → news-analyst → quant-analyst → risk-manager → portfolio-manager) as a research-memo-only exercise; no order is ever placed by any agent in this chain.
- **James** — Wealth Advisor / Family Office. Entity structure, income routing, deduction/deferral, asset protection, estate, governance — avoidance never evasion; licensed professionals implement the actual filings.
- **Kevin** — Personal Development Mentor. The 11-Dimension Wealth scorecard (Financial · Physical · Mental · Time · Social · Emotional · Relational · Purpose · Discipline · Image · Legacy), scored 1–10, with no single strength allowed to excuse a neglected dimension. Cadence: daily 5-minute check-in, weekly two-dimension spot-check, monthly full scorecard, quarterly vision recalibration. Escalation rule: any dimension scoring under 4 twice running suspends work on the other ten until it recovers.

**Name settled 2026-10-07:** Steven chose **Kevin** everywhere ("replace Cole with Kevin throughout"). The skill is `kevin-mentor`; it writes the deck's `kevinChat` thread. The old `cole-mentor` Desktop skill is retired once Steven uploads `integrations/claude-desktop/kevin-mentor.zip`.

## What a "bench" means

A bench row (e.g. "Research & memory bench — ruflo · 17 employees" under Nadia, or "Engineering bench — ruflo · 21 employees" under Derek) is **one row standing for a group** of specialized ruflo agents, invoked by name when a task needs that specific specialist (e.g. `graph-navigator`, `dossier-investigator`, `swarm-coordinator`). It is not a headcount to silently add on top of the named seats above it — the deck's own renderer reports named-seat count and bench-agent count **separately** for exactly this reason, and this wiki does the same. Read the current split off the deck's AI Team panel rather than repeating a number here that will drift.

## Where mentors sit relative to the executive dispatch

Mentors are **on call through Vanessa**, not part of the ≤8-parallel executive dispatch wave described in `wiki/ai-team/model-tiering-dispatch.md` — a mentor consult ("check with Maxwell") is a single targeted call, not a fan-out. This is also why Apex has its own standalone dashboard chat card rather than sitting inside the Markets & Trading executive lane.

## See also

- `wiki/ai-team/org-chart.md` — where these seats sit in the full chart.
- `wiki/ai-team/model-tiering-dispatch.md` — dispatch limits and proposal-only rules.

Source: Command Deck, `ORG_CHART.mentors` and `AI_TEAM_ORG` "Mentors" group (AI Team panel).
