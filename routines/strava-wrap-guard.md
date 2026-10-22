# `Command Deck — Strava wrapper guard` — cloud routine

**Created 2026-09-22 23:27 UTC** by the orchestrator, as a **stopgap**. Trigger id
`trig_01Nqu4xFXLqtTB2oSdGXEi4X`. Schedule `47 12 * * *` (UTC) — first fire **2026-09-23T12:47:00Z**.
Provenance `meta_mcp`, so an agent can edit or delete it. Notifications: **email only**, and the
routine is told to finish silently when there is nothing to repair.

## Why it exists

The Mac task `strava-daily-sync` writes `stravaSnapshot` with a **bare top level** — no `{v: …}`
wrapper. The deck reads `doc.data.v`, so a bare document breaks the Strava panel outright. This was
observed on 2026-09-22: the document was repaired to `{v:…}` earlier that day and the task
overwrote it at **12:32 UTC**, twelve minutes after its `20 5 * * *` Pacific slot (= 12:20 UTC).

The permanent fix is a one-time prompt paste on the Mac — `routines/mac-task-repairs.md` §1. That is
Steven's to do; an agent cannot edit a live Mac task. **This routine does not replace that fix.** It
runs 27 minutes behind the Mac task and moves the bytes one level down so the panel keeps rendering
until the paste happens.

## What it does, exactly

| Found | Action |
|---|---|
| top level has `v` | nothing — the task was fixed, or did not run |
| top level is bare (`activities`, `syncedAt`, …) | `set` it to `{v: <that object, unchanged>}`, pinned with `if_version` |
| missing, empty, or any other shape | **writes nothing** and reports it — an unexpected shape is a finding, not something to normalise |

Every run writes `stravaWrapGuard` — `{v:{lastRun, foundBare, action, activityCount,
snapshotSyncedAt, note}}` — whether or not it repaired anything, so the routine is provable by the
document it leaves rather than by its own green row. A repair also appends one `ciLog` row, in the
mandatory `{date:"YYYY-MM-DD", text}` shape.

It may touch **only** `stravaSnapshot`, `stravaWrapGuard` and `ciLog`, on artifact
`1624daae-d683-405a-971d-c5828dce0f8d`.

## What it does NOT fix — read this before trusting the panel

- **The activity count.** On 2026-09-22 the Mac task wrote **1** activity where a 30-day window
  returns **3**, and carried no `via` field. This routine has **no Strava access** — agent-created
  routines carry no MCP connectors, and the creating call confirmed none were passed through. It
  re-wraps whatever the task wrote. A thin snapshot stays thin, and the routine says so in its note.
- **The `via` provenance.** Copied across as-is. If the task wrote none, there is none.
- **The root cause.** The task keeps writing bare every day. The guard just keeps cleaning up.

So: a wrapped-but-thin panel instead of a broken one. That is the whole of the improvement.

## Evidence it can run at all

Cloud routines can write the artifact DB unattended — proven this session by `cloudWriteProbe` v1 at
**2026-09-22T09:05:56Z**. `ArtifactData` is a first-party tool, not an `mcp__*` connector, so the
"stores no MCP connectors" warning on creation does not affect it. **Unverified until its first
fire**: this specific routine has never run. Check `stravaWrapGuard` after 2026-09-23T12:47Z — if
that document does not exist, the routine did not run and this page is wrong.

## Retiring it

Once `strava-daily-sync` carries the fixed prompt and has written a correctly wrapped document on
two consecutive days, delete the trigger (`trig_01Nqu4xFXLqtTB2oSdGXEi4X`). Leaving it costs one
read a day and does no harm, but a guard nobody retires becomes a guard nobody checks.
