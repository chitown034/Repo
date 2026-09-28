# Each Mac task: cron, what it writes, current status

Each Mac task: cron, what it writes, current status. **This page is a pointer, on purpose — the
catalog already lives in two places kept current by other rounds, and copying it here would just
give it a third copy to drift.**

## Where the real catalog is

| Source | What it has | Its own stamp |
|---|---|---|
| `always-on/README.md` | The **honest, narrative** version — cron, does, last end, status, with every "reports ok but wrote nothing" case called out by name. Read this first. | `runnerStatus`, 2026-09-22 07:06:12Z (see that file's own timestamp correction) |
| `docs/inventory/mac-task-descriptions.md` | The **raw** per-task description dump, one line each, from `toolkitSnapshot` | `syncedAt 2026-09-16T00:52:24Z` — counts `{tasks: 60}`, already superseded by `runnerStatus`'s own 59 (`always-on/README.md`) |
| `docs/inventory/routine-health.md` | Per-task expected-doc vs. actual-result verdict, written by `r10-automation-health` | `syncedAt 2026-09-22T00:57:57-07:00` |

## The one fact worth stating here, not just there

**59 tasks, one runner (`claude-runner`), one Mac's uptime.** If the Mac sleeps, nothing on any of
the three sources above runs, and none of them gets a new stamp — see `always-on/README.md` → "The
uptime bound — say it out loud". A task existing in the catalog is never proof it ran; the doc it
was supposed to write, and that doc's own stamp, is the proof.
