---
name: cos-daily-cycle
description: "Vanessa's Chief-of-Staff daily cycle, run on demand in an attended session (the cloud routine runs it weekdays 6:25 AM PT): read the backlog, sort every item into Automation / AI team / ISA-EA / Steven, dispatch up to 8 cross-functional squads in parallel, QA, write cosBrief with at most 3 Needs-Steven items and the measured 80/20 split. Use when Steven says 'run the daily cycle', 'what needs me today', 'get the team on the backlog', or when the morning cycle failed."
---
# Chief-of-Staff daily cycle (on demand)

Same procedure as the cloud routine `Vanessa — Chief of Staff daily cycle` (`trig_019whypw6EeNu2G8xxY5xE5N`);
the 80/20 rule and the map are in `docs/AUTOMATION-MAP-2026-10-20.md`. Orchestration rules: `vanessa-orchestrator`.

1. **Recall once**: `bin/brain recall "<the ask>"`; `bin/brain owner` for any panel named.
2. **Read once** (ArtifactData, Command Deck `state`, note versions): cosBrief, twinQueue, twinBrief, kanbanCards,
   isaLine, loftyLeads, leadTriage, leadResponse, marketingQueue, calendarSnapshot, feedFreshness, runnerStatus
   (silent > 36 h = a p1 Needs-Steven item), vanessaRuns (last 3), vanessaRecommendations (open).
3. **Four buckets** for every open item: Automation (name the routine/task) · AI team (default; be aggressive) ·
   ISA-EA (write it so the ISA can do it from the ISA Portal at the noon huddle) · Steven (HALT-list items only,
   at most 3; the rest queued with dates).
4. **Dispatch squads in one response**, ≤ 8, ≤ 4 web-research, each prompt self-contained with the HALT list and
   only the data it needs; lane leads Victor · Marcus · Sofia · Derek · Alexandra (any client/ad draft) · Elena
   (anything that smells like fraud); Nadia and Elon proposal-only. No squad sends, posts, books, pays.
5. **QA** each result (shape, citations with stamps, no invented fact, no secret, no client surname); one retry.
6. **Write back** in one batch (pin versions): set `cosBrief` {date, ranAt, needsSteven ≤3, delegated, drafts,
   isaInstructions, queuedForSteven, split{automation, aiTeam, isaEa, steven, stevenShare}, stale, headline};
   append new packets to `twinQueue`; append `vanessaRuns` and `vanessaLog`. Never `set` those three.
7. **Tell Steven** in plain words: the ≤3 things that need him, the split ("team drafted 6, automations 9, ISA 2,
   you 2"), what is stale and why. In an attended session, the drafts can be shown and approved on the spot.
