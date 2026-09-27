# Panel map

The Command Deck's fifteen tabs, what each one shows, and which documents feed it — use this to find where a live number would appear before going looking for it in the source.

## The fifteen tabs (page ids)

Daily Ops · Markets & Trading · Family Office & Wealth · **Lending & Real Estate** · **Showings** · **AI Team** · Career & Education · Health & Wellness · Rewards & Ventures · PE & Defense Innovation · Elite Affluent Tracker · Next Big Moves · Travel & Experiences · Toolkit & Remote Access · Orchestration & Loop.

Each tab is made of one or more named panels (HTML sections marked in the source with a `<!-- PANEL: ... -->` comment) — locate a panel by that marker text or its element id, never by line number, per `projects/command-deck.md`'s editing rule.

## Panels relevant to this repo's four wikis

| Panel | What it shows | Docs / data it reads |
|---|---|---|
| Accounts, Real Estate & Lending | Loan-program cards, VA scenario checklists, lender directory, real-estate transaction SOP, compliance quick-reference | `LOAN_PROGRAMS`, `LENDER_DIRECTORY` (in-page data, not a `state` doc), `ratesSnapshot` |
| Showings — schedule by client | Itinerary builder, route planner, ShowingTime/Showami request drafting | Client/showing records kept client-side; requests relay through the ISA line, never a doc read directly by a client |
| AI Team — employees, C-suite agents, digital twin, Vanessa | Org chart, model badges, toolbox card, roster table | `ORG_CHART` / `AI_TEAM_ORG` / `AI_TEAM_TOOLBOX` (in-page data), `aiTeamRoster`, `toolkitSnapshot` |
| Virtual EA / ISA Operations | ISA scorecard, lead triage, ISA line | `isaKpi`, `isaKpiSopActuals`, `isaGradingScores`, `isaLineRead`, `leadTriage`, `leadResponse` |
| Master Plan | Priorities, kanban, sprint tracking | `priorities`, `kanbanCards`, `todoList`, `sprintGoal`, `sprintDates`, `sprintVelocity` |
| Orchestration & Loop Engineering | Runner status, cloud routines, CI log, backup status | `runnerStatus`, `routineHealth`, `ciLog`/`ciLogResetToken`, `backupStatus`, `knowledgeFabric` |

## How to trace a panel to its data when this table doesn't have it

Search the deck source for the panel's element id (shown in its `<!-- PANEL: ... -->` marker or its `id="..."` attribute), then find the `lsGet("<docName>", ...)` calls inside the render function that fills that element — the doc name passed to `lsGet` is the `state` collection document that feeds it. This is Lena's (Code Explorer) lane when it needs doing live; see `wiki/ai-team/org-chart.md`.

## What this page cannot tell you

Whether a panel's number is **current** — that is a freshness question, answered by the doc's own stamp (`wiki/dashboard-ops/db-docs.md`), never by which panel displays it.

## See also

- `wiki/dashboard-ops/db-docs.md` — the documents themselves and their known freshness issues.
- `wiki/ai-team/org-chart.md` — the AI Team panel's content in full.

Source: Command Deck source, `PAGE_DEFS` array (the fifteen tabs) and the `<!-- PANEL: ... -->` markers throughout the document.
