# Routine catalog

The cloud routines (claude.ai/code routines) — what they can and cannot write, and the specific belief about them that turned out to be wrong.

## What changed — read this before assuming a routine can't write

The old rule was "a cloud routine cannot write to the artifact database unattended — it parks on a permission prompt." That was true when last tested in early September 2026 and is **disproved now**: a probe routine wrote this deck's own artifact database with nobody present, and several cloud writers (weekly backup, live pipeline sync, the ISA escalation ladder, the feed-freshness watchdog among them) run on that finding today. **Do not refuse a cloud write on the authority of the old rule.**

## What still pins a routine to the Mac

Not the write capability — **connectors.** A routine created by an agent still lacks whatever connectors that creating session didn't have; anything needing Zoho, Lofty, Gmail, or GitHub credentials stays on the Mac task layer (`wiki/dashboard-ops/task-catalog.md`) until the routine itself is created from a session holding those connectors. **Check a routine's actual `mcp_connections`, never infer connector access from `created_via`** — routines created the same way have been observed with wildly different connector counts, because connectors are inherited from the session that created the routine, not from its type.

## Categories seen in practice

- **Daily research cadence — the layer that reliably holds:** weather & news (several times daily), calendar and Strava refresh, mortgage rates & market data, the Econoday economic calendar, top-performer and builder-incentive scans, opportunity-radar research, the weekday strategy sync.
- **Weekly review / self-improvement layer — the layer that has repeatedly failed:** the loop-engineering QA, the orchestrated ops review, the weekly self-improvement and weekly improvement loops, the weekly opportunity audit, ops/project issue reviews, the books-reconciliation reminder. Treat a "FAILED last run" status here as the norm to verify against, not the exception.
- **Disabled / abandoned:** routines superseded by a Mac-task equivalent, or abandoned when a dependency (e.g. the Steve-twin cloud path) was dropped.

## The one rule that matters most

**A routine reporting SUCCEEDED has not necessarily changed anything.** Judge every routine by whether its target document's own stamp moved (`wiki/dashboard-ops/db-docs.md`), never by the routine's own reported status — this is the same "task ok ≠ document written" rule that applies to Mac tasks, and it applies at least as strongly here because a routine's failure modes are less visible day to day.

## Where the live table actually is

Per-routine schedule, enabled/disabled state, and last-run status are read from the routines list and `routineHealth` at their own stamps — this page describes the categories and the two hard-won rules above, not a row-by-row table that would drift the same day it's written.

## See also

- `wiki/dashboard-ops/task-catalog.md` — the Mac-task equivalent, and the connector/credential line between the two.
- `wiki/dashboard-ops/db-docs.md` — how to verify a routine's claimed write.

Source: `projects/command-deck.md` ("Known open items") and `wiki/dashboard-ops/index.md` ("Standing facts"), describing the cloud-write-capability finding and the connector-inheritance rule.
