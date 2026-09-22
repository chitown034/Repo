# Cloud routines can write the artifact database

**Settled 2026-09-22 by measurement. Finding F-INT-08.**

## What was assumed

Five consecutive loop cycles were built on the belief that an unattended cloud
routine cannot write an artifact database, because the write parks on a
permission prompt with nobody there to answer it. That belief shaped every
routine prompt in this ecosystem: cloud routines were told to research, test and
report, and the scheduled tasks on Steven's Mac were made the only writers.

The belief was last tested on 2026-09-04. It was never re-tested after the
platform changed, and Claude Code 2.1.277 (released 2026-09-18) states that
scheduled routine runs save data to editable artifacts without asking.

## What was measured

A one-shot probe routine (`trig_018SkUALe5aKrWaL9HjdPRUh`) was created with a
single job: write one named document to the Command Deck database, unattended,
and record the outcome either way.

It fired at 09:05 UTC on 2026-09-22 with no human present. The document exists:

| Field | Value |
| --- | --- |
| Document | `cloudWriteProbe` |
| Version | 1 (first write, not an overwrite) |
| Written at | 2026-09-22T09:05:56Z |
| Result recorded | `write succeeded unattended` |

No permission prompt. No error. The document did not exist before the routine
fired, so the write is the routine's and nothing else's.

## What changes

The Mac-only-writer constraint is lifted. It was the single largest structural
limitation in this ecosystem, and it was wrong.

Consequences worth acting on, in order:

1. **Feeder tasks stop depending on a laptop being awake.** The tasks that keep
   the dashboard's numbers honest currently run on the Mac. A closed laptop is
   why the Sunday backup has never run and why the ISA comms bridge only carries
   messages between 7:37 AM and 9:37 PM Pacific. Those can move to cloud
   routines that do not care whether the lid is open.
2. **Cloud routines become accountable to the output-not-execution rule.** A
   cloud routine that "succeeded" but left its document untouched is now a
   failure, not an accepted limitation. The Pipeline Sync routine, which has
   succeeded four times a day and never synced anything, is the first case.
3. **The ISA comms bridge can run in the cloud.** The hourly cloud bridge was
   disabled precisely because it was thought unable to write. That reasoning no
   longer holds.

## What does not change

Connectors. A routine created by an agent stores no MCP connectors, so anything
needing Zoho, Lofty, Gmail or GitHub credentials still has to run where those
credentials live. The write path is open; the credential path is not. Keep
CRM syncs on the Mac until a routine created in the web interface, which can
carry connectors, is set up for them.

## How to re-test

Re-run the probe whenever the platform version changes. The shape of the test is
the point: one named write, read back, outcome recorded verbatim whichever way
it lands. An assumption that is never re-tested becomes architecture by default.
