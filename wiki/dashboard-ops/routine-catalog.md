# Each cloud routine: schedule, and what it can and cannot write

Each cloud routine: schedule, and what it can and cannot write. **Pointer page — see below for why.**

## Where the real catalog is

| Source | What it has | Its own stamp |
|---|---|---|
| `always-on/README.md` | The **writers that prove themselves** (six writers + one watchdog), the routines that "run, report success, write nothing", and the nine that were dying on startup — all narrated with what changed and when | Multiple, per-section — read the file |
| `routines/cloud-routine-repairs.md` | What was actually changed in each agent-editable routine's prompt, and the document or fired run that proves it | 2026-09-23 |
| `docs/inventory/cloud-routines.md` | The raw listing: every routine, cron, enabled, last run, next run, id | Pulled 2026-09-22 08:09 UTC |

## The count, and the one rule

**57 total, 53 enabled**, counted 2026-09-23 (`wiki/dashboard-ops/index.md`'s own standing fact —
the long-standing "50 / 46" figure was stale). **A routine is proven by the document it leaves,
never by its run status** (`REMOTE-ACCESS.md`): the old "Pipeline Sync" routine
(`trig_018BSAYiYzvtyaUkpAY4SnqE`) reports SUCCEEDED four times a day and has never moved a document
— only Steven can disable it, `docs/NEEDS-STEVEN.md` item 7.

**Credentials never travel with an agent-created routine.** A routine an agent creates carries **no
MCP connectors**; Zoho, Lofty, Gmail, Calendar, Strava, Notion and Inkbox still run only where those
credentials live — a Mac, or a routine Steven creates himself in the web UI (`REMOTE-ACCESS.md`).
