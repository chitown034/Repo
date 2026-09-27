# DB docs

What the artifact database's `state` collection actually holds, the one universal shape rule, and the specific documents known to be broken, blocked, or stale — read this before trusting any panel number.

## The one shape rule

Every document in the collection is `{"v": ...}` — **no exceptions.** A writer must send `data:{v:<whole doc>}`, never the bare value. `stravaSnapshot` was written bare (top-level `activities`/`syncedAt`/`via`) until it was repaired; readers still accept both shapes defensively, but a doc whose top level is not a single `v` key is a **writer bug to fix**, not a shape to reproduce in a new writer.

## Document groups (by what they feed)

| Question | Doc(s) |
|---|---|
| Weather / news / feeds | `weatherSnapshot`, `newsSnapshot`, `liveFeeds` |
| Calendar (next 7 days) | `calendarSnapshot` |
| Mortgage rates | `ratesSnapshot` |
| Markets, strategies | `marketSnapshot`, `strategySnapshot`, `openTerminalSnapshot` |
| Real-estate CRM leads | `loftyLeads`, `leadTriage`, `leadResponse` |
| Mortgage CRM | `zohoSync`, `zohoLeads`, `zohoDeals` |
| Health | `appleHealth`, `healthAnalysis`, `healthMetrics`, `healthCoaching`, `healthInsight`, `healthNutrition` |
| Knowledge stores | `knowledgeFabric`, `secondBrain`, `toolkitSnapshot` |
| Automation truth | `runnerStatus`, `routineHealth`, `ciLog` (via `ciLogResetToken`), `backupStatus` |
| ISA operations | `isaKpi`, `isaKpiSopActuals`, `isaGradingScores`, `isaLineRead`, `leadTriage` |
| AI team roster | `aiTeamRoster` |
| Family office / wealth | `foEntities`, `foAdvisors`, `foActions`, `foReviews`, `estateReview` |

This is a reading of the doc **names** the deck's script reads via its local-storage/document accessor — it is not itself a live count of what exists in the artifact database today. For a current document count and freshness, read `runnerStatus`/`knowledgeFabric`'s own sync stamps, never this page.

## Documents known to carry an honest "not really live" body

- **`loftyLeads`** — exists but carries a *blocked* body: no sync has run, the API key is not installed. Never read a lead number off it.
- **`zohoSync`** — exists at v1, body is the 403 `NO_PERMISSION` block. `zohoLeads` and `zohoDeals` **do not exist** — the Deals module has never been read.
- **`stravaSnapshot`** — was repaired to the `{v:…}` shape but the writing task may still write it bare; a cloud wrapper-guard routine is meant to stand behind it. Check whether that guard has actually run before trusting the shape.
- **`openrouterFeeds`** — has been observed frozen at an old date while its writer reports `ok` — a silent no-write success. Always compare the doc's own `syncedAt`/`checkedAt` stamp to its refresh cadence, never trust the writer's status alone.

## How to read any doc's freshness

Compare the doc's own stamp (`syncedAt`, `checkedAt`, or similar) to the cadence of the task or routine that is supposed to write it — never to today's date, and never to the writer's reported status. "Task ok" is not "document written." See `wiki/dashboard-ops/task-catalog.md` and `routine-catalog.md` for the writer side of this.

## See also

- `wiki/dashboard-ops/panel-map.md` — which panel reads which doc.
- `wiki/dashboard-ops/task-catalog.md` / `routine-catalog.md` — what writes each doc, and how to tell if the write actually happened.

Source: `projects/command-deck.md` (the doc-question table and the `{v:...}` shape rule) and the deck's own document-name usage across its render functions.
