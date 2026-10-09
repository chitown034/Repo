---
name: ai-ecosystem-backup
description: "Weekly full backup of Steven's AI ecosystem (v2): both artifact stores, the redacted Claude Desktop configuration, the Master Findings Table and the latest Weekly Report, into Documents/AI-Ecosystem-Backups/YYYY-MM-DD, with an 8-week rolling prune, an integrity check, one automatic retry, and escalation to Steven after two failures. Use for the Sunday backup, a pre-change backup, or when Steven asks whether his backups are current."
---

# ai-ecosystem-backup v2 — Sunday full backup, verified

Seat: execution — **Claude Sonnet 5** under Derek (CTO). Escalations go to Vanessa
(Claude Fable 5.1). Runs on the **Mac runner only** — not because a cloud routine cannot write the
artifact DB (that was disproved by measurement on 2026-09-22; see
`docs/CLOUD-WRITE-ARCHITECTURE.md`), but because a backup reads local files and the Mac keychain —
neither of which a cloud routine can reach at all.

## Trigger
- **Every Sunday 00:00 local (America/Los_Angeles)** — Steven's spec.
  Drift to fix, stated honestly: the existing Mac task `r6-weekly-backup` is scheduled
  `0 5 * * 0` = Sun 5:00 AM PT and has **never run** under `claude-runner` (it missed Sun 2026-09-20).
  Until Steven re-points that cron to `0 0 * * 0`, run in whichever slot invoked you and record the
  slot in the log — never report the spec time as if it were the actual time.
- On demand: before any irreversible change (a store migration, a bulk delete, a deck republish).

## Inputs / scope (all four parts, or the run is a failure)
1. **Both artifact stores** — Command Deck (`collection:"state"`, 161 docs at 2026-09-22) and the ISA
   Portal store (13 docs at the last verified backup). Export every doc as `<doc>.json`.
2. **Claude Desktop configuration, redacted** — settings, installed skills/extensions list,
   memory/context files, connector and MCP server configs. Every secret is replaced with
   `"<redacted>"` before it is written: API keys, tokens, OAuth blobs, passwords, phone numbers,
   `.env` values. A backup that contains a live credential is a **failed** backup — delete it and
   re-run redacted.
3. **Master Findings Table** — the current `auditFindings` document.
4. **Latest Weekly Report** — the newest `weeklyBrief` (and the loop cycle report it points to).

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db` with `db_op:"list"` on `collection:"state"` to enumerate, then `db_op:"get"` per doc;
`write_db` with `db_op:"set"` and `data:{v:…}` for `backupStatus`. Read `backupStatus` before
writing so `history` is appended, never replaced. **Every doc is `{v:<value>}` — no exceptions:**
send `data:{v:<whole doc>}`, never the bare value. Back every doc up exactly as found, and **report
any doc whose top level is not a single `v` key** — that is a writer bug, not a shape to preserve.

## Procedure
1. **Resolve the root.** Canonical root is `~/Documents/AI-Ecosystem-Backups/`; this run's folder is
   `~/Documents/AI-Ecosystem-Backups/<YYYY-MM-DD>/`. The legacy root `~/AI-Ecosystem-Backups/` holds
   the last verified backup (`2026-09-14`); treat it as read-only history, count its folders in the
   8-week window, and do not delete anything there without Steven (see HALT).
2. **Create** the dated folder with `state/`, `isa-portal/`, `config/`, `reports/`.
3. **Export** each scope item. Count docs and bytes as you go.
4. **Redact** the config copy (see scope 2). Grep the finished folder for key-shaped strings before
   the integrity check; any hit fails the run.
5. **Manifest** — write `manifest.json` (shape below) with a sha256 per file.
6. **Integrity check** — every file: exists, non-empty, readable, parses (JSON where JSON is
   expected), and has the expected structure — **every deck doc's top level is a single `v` key**.
   List any doc that fails that test by id in the run output and in `backupStatus.note`; a bare-value
   doc is a writer bug and must be named, never silently backed up as correct. Doc count must equal
   the enumeration from step 3. Pass/fail is recorded, never assumed.
7. **Retry once.** On any failure, delete the partial folder and run steps 2–6 again exactly once.
   Record `retried:true`.
8. **Restore test** (monthly, or after any retry): restore the folder into a scratch namespace,
   count docs restored, confirm each parses, and record `{at, checks, failed, note, source}`.
9. **Prune to 8 weeks.** Sort dated folders (both roots) newest first; keep 8; delete only folders
   older than the 8th **whose `integrityCheck` is `pass`** — never delete the most recent verified
   backup, and never delete a folder that failed its check (that is evidence). `weeksKept` today is
   **3**; moving to 8 means the next three runs add, not prune.
10. **Write `backupStatus`**, then report: path, docs, size, integrity, what was pruned, what failed.

## Outputs (exact shapes)
`backupStatus` — keep the live shape exactly:
```json
{"v":{"lastBackup":"YYYY-MM-DD","path":"~/Documents/AI-Ecosystem-Backups/YYYY-MM-DD",
 "syncedAt":"<ISO>","docs":0,"sizeBytes":0,"stores":{"commandDeck":0,"isaPortal":0},
 "integrityCheck":"pass|fail","restoreTest":{"at":"<ISO>","checks":0,"failed":0,"note":"","source":"YYYY-MM-DD"},
 "retried":false,"weeksKept":8,"currency":"current|stale","sameDiskOnly":true,
 "history":[{"at":"<ISO>","lastBackup":"YYYY-MM-DD","docs":0,"sizeBytes":0,
             "integrityCheck":"pass|fail","restoreTest":"pass|fail","retried":false}]}}
```
`manifest.json` in the dated folder:
```json
{"createdAt":"<ISO>","root":"~/Documents/AI-Ecosystem-Backups/YYYY-MM-DD","slot":"<cron that fired>",
 "docCount":0,"sizeBytes":0,"redacted":true,
 "scope":{"commandDeck":0,"isaPortal":0,"config":true,"findings":true,"weeklyReport":true},
 "files":[{"path":"state/<doc>.json","bytes":0,"sha256":"<hex>"}],
 "integrity":{"result":"pass|fail","checked":0,"failures":[]}}
```
`sameDiskOnly:true` is the truth today — everything lives on the same disk. Say it plainly: this is
a versioned copy, **not** off-site disaster recovery.

## Guardrails
- Never write a secret into a backup. Redaction happens before the integrity check, not after.
- Never delete the most recent verified backup, a failed-check folder, or anything in the legacy root.
- Never report success on a partial run. Missing scope item = failure, even if the docs exported.
- Never claim a restore test that did not run this cycle — carry the previous `restoreTest` forward
  with its own `at`/`source`, unchanged.
- Never run two backups into the same dated folder; a same-day re-run replaces only after its own
  integrity check passes.
- The Mac must be awake; if the runner was asleep, say "missed <date>", do not backfill a stamp.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** For this skill, halt and escalate when:
- **two consecutive failures** (this run plus the prior `history` entry) — stop, do not retry a third
  time, escalate;
- pruning would delete a folder that is not `integrityCheck:"pass"`, or anything in the legacy root;
- a credential is found in a config file and cannot be redacted automatically;
- the destination disk is full, unwritable, or the store enumeration is incomplete;
- Steven asks for an off-site/cloud destination (needs money and a permission decision).

Escalation packet → `twinQueue`: `{id:"tw_<epoch-ms>", ts:"<ISO>", from:"vanessa", priority:"p1",
status:"needs-steven", task:"Backup failed twice — <date>", note:"<what failed · both errors ·
last good backup and its path · what you need from Steven>"}`, plus a phone push on the same path
the morning brief uses. If push is unavailable, the `twinQueue` P1 item is the escalation of record
and you say so.

## Logging
- Every run appends one `history` entry to `backupStatus` — success **and** failure (a failure logs
  `integrityCheck:"fail"` with the reason in `restoreTest.note`), so a missed Sunday is visible.
- One `ciLog` line per run: `{date:"<YYYY-MM-DD>", text:"ai-ecosystem-backup: <n> docs, <MB>,
  integrity <pass|fail>, kept <n> weeks, pruned <list>"}`.
- The dated folder's `manifest.json` is the on-disk log; never edit a past manifest.

## Self-test (`selftest:ai-ecosystem-backup`, nightly suite, BackupVerification)
Cheap and read-only, ≤60 s — no full export (the nightly suite already fails on timeout, exit 124,
last error 2026-09-15).
1. Freshness: read `backupStatus`; Pass if `lastBackup` is within 8 days of today **and**
   `integrityCheck === "pass"`. Today that is a **Fail**: last verified backup 2026-09-14, and
   `r6-weekly-backup` has never run — report the real reason, do not soften it.
2. Path check: the canonical root exists and is writable; the most recent dated folder has a
   `manifest.json` that parses and whose `files[].sha256` count equals `docCount`.
3. Redaction guard: scan the newest manifest's file list for names like `*.env`, `settings*.json`
   and assert `redacted:true`; grep a 1 KB sample of the config copy for key-shaped strings — any
   hit is a Fail and a P1 to Elena.
4. Prune arithmetic: with a fixture of 11 dated folders, assert exactly 8 are kept and no
   failed-check folder is selected for deletion.
5. Shape: build a `backupStatus` document in memory and assert every key above is present.
Report `{id:"selftest:ai-ecosystem-backup", category:"BackupVerification", result, detail}` into `selfTest`.
