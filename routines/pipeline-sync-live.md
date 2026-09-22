# Command Deck ↔ ISA Portal — Pipeline Sync (live, writes)

`trig_01M5zR1Po44gnHvTwA9ogZaB` · cron `0 4,10,16,22 * * *` (UTC) · created 2026-09-22
· needs no connectors, because `ArtifactData` is a built-in tool

## Why this routine was created

The dashboard already had a routine named "Command Deck ↔ ISA Portal — Pipeline
Sync" (`trig_018BSAYiYzvtyaUkpAY4SnqE`, cron `0 1,7,13,19 * * *`). It ran four
times a day, reported SUCCEEDED every time, and had never synced anything.

That is not a bug in its logic. Its own prompt opens with:

> You are running the 4x-DAILY Pipeline Sync check (RESEARCH-ONLY MODE)

and later instructs, in as many words, `Do NOT call Edit, Write, or Bash-write
any file. Do NOT call Artifact with action "publish".` It compares the
`cdStateSeed` JSON baked into each artifact's published HTML. Both seeds are
`{}`. Equal seeds, no drift, success — four times a day, forever.

The routine was written that way on two beliefs, both of which were true when it
was authored and are false now:

| Belief in the old prompt | Status today |
| --- | --- |
| "The Artifact tool's read action ... CANNOT see either artifact's live db documents" | False. `ArtifactData` reads and writes live documents directly. |
| An unattended cloud routine cannot write an artifact database | False. Measured 2026-09-22 09:05 UTC; see `docs/CLOUD-WRITE-ARCHITECTURE.md`. |

The old routine cannot be repaired in place: it was created through the web
interface (`created_via: http_api`), and an agent may only update routines it
created itself. **Steven needs to disable it** at
https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE — otherwise it
keeps writing a green row into the log for work it is not doing, which is worse
than no row at all.

## What this one does

Four keys, both directions, on the live databases: `reClients`, `pipeline`,
`isaGradingScores`, `isaKpiSopActuals`.

- Reads each key from both artifacts with `ArtifactData`, never from the seed.
- Copies a document to whichever side is missing it.
- Merges rather than overwrites when both sides differ, and never drops a row.
  Client rows match on name or client, case-insensitive and trimmed; the row
  further along the pipeline wins. Per-index score arrays take the non-empty
  value, and ISA Portal wins a genuine disagreement, because the ISA is the
  person who fills those in.
- Pins every write with the `if_version` it just read, so a concurrent edit
  makes the write fail rather than silently win. No force, ever.
- Re-reads all four keys from both sides afterwards and confirms they match.
  **A sync that did not change a document it claimed to change is a failure.**
- Appends one `ciLog` entry naming which keys moved, in which direction, and how
  many rows.

## How to tell it is working

The test is the `ciLog` entry and the documents themselves, never the routine's
own status. Check that `reClients` and `pipeline` carry the same rows on both
artifacts. If the routine reports `verified: false`, believe it.

Schedule is offset from the old routine's hours (01/07/13/19 UTC) to 04/10/16/22
UTC so the two never contend, and to stay clear of the Friday-evening and
Sunday-afternoon windows where quota contention killed thirteen runs this cycle.
