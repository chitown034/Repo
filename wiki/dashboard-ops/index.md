# Wiki — Dashboard ops

How the Command Deck, its documents and its automations actually behave. This is the page that keeps
the brain honest about what runs.

## The one rule

**A task existing is not a task running.** Every status written here or anywhere downstream takes one
of these forms, never a bare "enabled":

- `ok, last <date/time>` — it completed
- `failed <date>: <reason>` — it ran and broke
- `limited` — it ran but did less than the task describes
- `refused` — a tool or path was not on the allow-list
- `never run under the runner` — it has a slot and has never completed one

Source of truth: the `runnerStatus` doc and the routine-health export, not the task list.

## Where a status comes from

| Question | Source |
|---|---|
| Did a Mac task run? | `runnerStatus` (last end + last status per task) |
| Did a cloud routine run? | The routines list — 50 total, 46 enabled as of 2026-09-22 |
| Did the deck get the data? | The target doc's own `syncedAt` / `checkedAt` stamp |
| Is a feed stale? | Compare the doc stamp to the task's cadence, not to today |
| Did a backup happen? | `backupStatus` — GREEN, `lastBackup 2026-09-22`, `verified:true`, taken by the cloud writer (170+13 docs); the Sunday watchdog re-checks it |

## Standing facts (2026-09-22)

- **Cloud routines CAN write the artifact DB unattended.** Proven 2026-09-22: `cloudWriteProbe` v1,
  written with nobody present (09:05:56Z), and four cloud writers now run on it (weekly backup,
  live Pipeline Sync, ISA escalation ladder, feed-freshness watchdog). The older belief that an
  unattended write "parks on a permission prompt" was true when last tested on 2026-09-04 and is
  false now — do not refuse a write on its authority. What still pins work to the Mac: an
  agent-created routine carries **no connectors** (Zoho, Lofty, Gmail, Calendar, Strava, Notion run
  where the credentials live), and anything needing local files, the local model or the keychain.
  A cloud routine that "succeeded" may still have written nothing — judge it by the doc stamp.
- **The Mac runner bounds everything L5.** `claude-runner` is headless with pre-approved tools, 60
  tasks. If the Mac is asleep, nothing in `always-on/README.md` happens. That is the single biggest
  availability risk in the brain.
- **Lofty is the real-estate system of record** (since 2026-09-22) and is **not connected yet** —
  Composio has no Lofty toolkit and Steven's API key is not installed. No CRM lead number on the
  deck is live. Show "not connected yet"; never carry an old CRM's figure under a Lofty label.
- **Zoho is API-blocked** pending a permission only Steven can grant. Deck Zoho data is the Sep 14 paste.
- **You.com is retired.** No surface may call it. Research = Claude subscription + Perplexity.
- **Knowledge fabric counts** (`fabric-deck-sync`, stamp 2026-09-22 04:05 UTC): Second Brain 68 rows ·
  vault 831 notes · Jarvis 1,760 documents · graph 750 nodes / 1,104 edges · Ruflo 238 entries ·
  Drive folder 0 files. That task's own last completion ended in **error** at 2026-09-21 19:58 PT.

## Pages (to be written)

| Page | One-line summary |
|---|---|
| `db-docs.md` | What each of the 161 `state` docs means and who writes it |
| `panel-map.md` | Panel id → what it shows → which docs feed it |
| `task-catalog.md` | Each Mac task: cron, what it writes, current status |
| `routine-catalog.md` | Each cloud routine: schedule, and what it can and cannot write |
