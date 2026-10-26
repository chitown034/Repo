# Process coverage — who keeps every Command Deck document alive, and whether it did

As of 2026-10-26. Steven (2026-10-26): *"ensure all data is live and synced and look for gaps in the process to automate
and have an AI agent facilitate to ensure complete coverage of all processes listed and identified within the dashboard."*

## The rule

**Every document the deck reads has one writer, one cadence and one owning seat — and its status is read from its own
stamp, never from a task's "ok".** A document is covered when its writer moved it inside 1.5× its cadence. A gap is an
automated document that is stale, never written, has no writer, or whose writer is retired. Manual rows (Steven types
them) are his by design and are never counted as gaps.

## Where it lives

| Layer | What | Refreshed by |
|---|---|---|
| Register | `brain/coverage/writers.json` — doc → writer, kind (cloud / mac / ci / deck / user / derived / retired / none), cadence hours, owner seat, pod, fix note | by hand, in a session, whenever a writer or seat changes |
| Panel map | `docs/inventory/deck-doc-panels.json` — doc → tab, panel, render functions, scanned from the live deck | `bin/brain coverage --scan <deck.html>` after a deck change |
| Report | `docs/inventory/process-coverage.md` + `.json` — gaps first, then every document by tab, scored against a database export | `bin/brain coverage --db <export dir> --write` (the Big-moves routine, daily 6:05 AM PT, once it carries the step; any session otherwise) |
| Deck | `processCoverage` document (the register without statuses) and the **Process coverage** card, first section of Orchestration & Loop Engineering: the page computes each automated document's status from that document's own stamp in the database, right now, in the browser — no routine and no tokens | `bin/brain coverage --deck-doc out.json` + ArtifactData set |
| Sweep | The daily freshness sweep's STEP 1b reads the register, checks up to 60 automated documents and writes the gaps (with owner seats) into `feedFreshness.coverage` | cloud routine, 15:40 UTC daily |
| Moves | Each gap becomes a "Cover <doc>" risk signal in the Big moves run, owned by the row's seat, so Vanessa's four courses of action carry it until the writer is fixed | Big moves routine (its prompt is bound to the session that created it; the step is written in this page and in `docs/inventory/daily-updates.md` for that session to adopt) |

Owner of the whole thing: **Nova — Coverage & Process Auditor** (reports to Owen in Derek's line, Ops Pod; `wiki/ai-team/desk-seats.md`).
Nova proposes, never edits a live routine: a gap's fix goes to the writer's owner seat, a Mac-side fix to
`integrations/mac-task-specs.md` § 9 and Steven's one paste.

## Counts on 2026-10-26 (database export at 18:24 UTC)

| | |
|---|---|
| Documents the deck reads or the register names | 266 |
| Automated (cloud routine, Mac task, GitHub Action, the page itself) | 89 |
| Fresh now | 57 |
| Stale | 13 |
| Never written / no writer | 7 |
| Manual (Steven types them) | 82 (39 of them never typed yet) |
| Deck UI state (filters, markers, tokens) | 40 |
| Retired writers | 11 |
| **Gaps** | **26** |

## The gaps, by fix owner (2026-10-26)

| Fix | Docs | Owner | What to do |
|---|---|---|---|
| Mac task writes the wrong target or nothing | `healthAnalysis` (reads the retired Notion path), `marketingQueue` (task ok Oct 23, doc Oct 8), `knowledgeGraph` (Sunday cap since Sep 13), `weeklyBrief` (Friday cap since Sep 26), `cpiOpportunityLog` (late) | Sam (Derek) | spec § 9: repoint health-full-analysis at `appleHealth`; re-check r14's write step; move the Sunday/Friday tasks to weekday slots; Steven pastes `runnerctl run <name>` once |
| The weekly loop stopped writing its four companion documents | `auditFindings`, `stressTestReport`, `scaleOpportunityLog`, `trustLevels` | Ezra (Elon) | put their write steps back in `loop-engineering-weekly`, or retire the four cards and say so on the panel |
| No writer at all | `tradingDeskReport`, `inboxDesk` | Apex; Voicemail & Inbox Triage | a weekly Mac task for the trading desk report; point r12-inbox-triage (or the cloud inbox sweep) at `inboxDesk` |
| Cloud routine hangs | `realEstateBrief` (last write Oct 5) | Bianca | rewrite to WebSearch-only or fold into the morning feeds |
| Never written because the input does not exist yet | `isaScorecard`, `isaGradingScores`, `isaKpiSopActuals` (no ISA scored day), `tcDeals`, `refiWatchList`, `sphereList` (Steven's lists), `eventsFeed` (the Sunday action writes a report, not the doc) | Victor; Document Intake Clerk; Refi Watch Analyst; Sphere Nurture Coordinator; Travel Desk | not sync gaps: the ISA starts, Steven types the two lists, the events action gets an ArtifactData step |
| Waiting on Steven | `whatsappKapso` (register the Kapso Mac tasks), `zohoSync` / `zohoLeads` / `zohoDeals` (the Zoho API grant), `openrouterFeeds` (pause the three feed tasks) | Vanessa; Victor; Derek | `docs/STEVEN-STEPS.md` |
| Stale on its own cadence | `hfCommitteeMemo` (Monday run, 48 days old) | Apex | type a ticker in `hfRequest`; the Monday routine only runs with one |

Everything else that is automated moved on time: morning feeds, weather, news, market close, rates, calendar, the
daily cycle, the morning brief, big moves, health sync, Strava, Fieldy, Lofty, lead response, ISA line, the runner
status, the second brain, the toolkit, backups, the 6D brain.

## How to read the card

Tiles: documents · automated · fresh now · stale · never written / no writer · manual · gaps. Chips: Gaps (default),
Automated, All, then one per tab. Each row: the document, its panel, its writer (with the fix note under it), cadence,
owner seat and pod, last stamp (Pacific, with age), status. The register's `generatedAt` is in the note; the statuses are
computed when the page renders, so a register that is a week old still shows today's truth.

## See also

- `wiki/dashboard-ops/freshness-routines.md` — the writers' schedules.
- `docs/AUTOMATION-MAP-2026-10-26.md` — the panel-level map `bin/brain owner` answers from.
- `wiki/ai-team/desk-seats.md` § Nova, `wiki/ai-team/org-chart.md`.
