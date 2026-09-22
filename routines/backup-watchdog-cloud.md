# Routine spec — Backup Watchdog (cloud)

A cheap cloud routine that answers one question: **is Steven's backup actually current?** It does not
take the backup — `ai-ecosystem-backup` on the Mac does that. This is the tripwire for the case the
Mac was asleep, the task never fired, or the backup failed quietly.

Why a watchdog exists: `r6-weekly-backup` is enabled and has **never run** under `claude-runner`
(it missed Sun 2026-09-20), and the last verified backup is **2026-09-14** (7,931 docs, 109 MB,
integrity pass, restore test 13/13 on 2026-09-15, `weeksKept` 3). Nothing noticed until a human did.

## Where it runs
**Cloud (claude.ai/code/routines).** Deliberately read-only: an unattended cloud run's artifact-DB
write parks on a permission prompt (confirmed three times), so this routine **never writes the DB**.
Its output is the run summary plus a push/email notification, and a ready-to-paste `twinQueue`
packet that the next attended session or the Mac writes.

## Schedule
| | Cron (UTC — cloud routines are UTC) | Local (America/Los_Angeles) |
|---|---|---|
| Weekly check, after the backup window | `30 17 * * 0` | **Sun 10:30 AM PT** (PDT, UTC−7) |
| Mid-week safety check (optional) | `0 16 * * 3` | Wed 9:00 AM PT |

The backup itself is specified for **Sunday 00:00 PT** (Steven's spec); the Mac's `r6-weekly-backup`
currently sits at `0 5 * * 0` = Sun 5:00 AM PT. Either slot is finished well before 10:30 AM PT.
Cloud crons are UTC and shift one hour relative to PT at the **Nov 1 2026** PDT→PST change; after
that date `30 17 * * 0` is Sun 9:30 AM PT — adjust to `30 18 * * 0` to hold 10:30 AM PT.
Avoid `0 16 * * 0`: three existing Sunday routines already fire there and all failed on 2026-09-20.

## Model
**Claude Sonnet 5** — a read-and-report seat. No sub-agents, no research, no Perplexity.

## Tools
- `Artifact` `read_db`, `db_op:"get"`, `collection:"state"`, `doc_id:"backupStatus"` (read only).
- Routine completion notifications: **push + email** to Steven.
- Nothing else. No write, no connector, no messaging tool.

## Prompt text (paste verbatim into the routine)
```
Backup watchdog. Read one document and report - do not write anything.

1. read_db the Command Deck artifact 1624daae-d683-405a-971d-c5828dce0f8d, collection "state",
   doc_id "backupStatus". If the read cannot complete unattended, say exactly that and stop -
   do not guess the backup's state.
2. Compute: days since v.lastBackup; whether v.integrityCheck == "pass"; v.docs, v.sizeBytes,
   v.weeksKept, v.path; and the newest v.history entry (its at, integrityCheck, retried).
3. Verdict:
   - CURRENT - lastBackup is within 8 days AND integrityCheck == "pass".
   - LATE - 8 to 14 days, or the newest history entry shows retried:true.
   - STALE/FAILED - over 14 days, integrityCheck != "pass", or the doc is missing.
4. Report in the run output, in this order: verdict, lastBackup date, days since, docs, size,
   integrity, restoreTest {at, checks, failed}, weeksKept (target 8), path, and the newest history
   entry. Numbers only from the document; never estimate a backup you cannot see.
5. If the verdict is not CURRENT, end the output with a ready-to-paste Needs-Steven packet:
   {"id":"tw_<epoch-ms>","ts":"<ISO>","from":"vanessa","priority":"p1","status":"needs-steven",
    "task":"Backup not current - <n> days since <lastBackup>",
    "note":"<verdict · what the doc shows · likely cause (r6-weekly-backup has never run under the
     runner) · what Steven should do: run the backup task once manually and confirm backupStatus
     updates>"}
   Say plainly that this routine cannot write it: a cloud write parks on a permission prompt.
6. Never claim the backup ran. This routine reads a status document; it is not evidence that files
   exist on disk. Only ai-ecosystem-backup's own integrity check is that evidence.
```

## Success condition
1. The routine completed and printed a verdict grounded in `backupStatus` (or an explicit
   "could not read unattended").
2. On any verdict other than CURRENT, a push **and** an email reached Steven, and the run output
   contains the paste-ready packet.
3. No write was attempted against the artifact DB.

**Failure**: a run that reports CURRENT without citing `lastBackup` and `integrityCheck`; a run that
estimates or infers the backup state; a silent completion on a STALE verdict.

## Expected first result (honest baseline, 2026-09-22)
`lastBackup 2026-09-14`, integrity `pass`, `weeksKept 3`, path `~/AI-Ecosystem-Backups/2026-09-14`.
On the next Sunday firing that is **more than 8 days old**, so the first real run should return
**LATE or STALE** and escalate. If it returns CURRENT, the watchdog is wrong — check it before
trusting it.
