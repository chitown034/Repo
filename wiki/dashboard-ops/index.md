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
| Did a cloud routine run? | The routines list — **57 total, 53 enabled**, counted 2026-09-23 (the long-standing "50 / 46" was stale) |
| Did the deck get the data? | The target doc's own `syncedAt` / `checkedAt` stamp |
| Is a feed stale? | Compare the doc stamp to the task's cadence, not to today |
| Did a backup happen? | `backupStatus` — GREEN, `lastBackup 2026-09-22`, `verified:true`, taken by the cloud writer (170+13 docs); the Sunday watchdog re-checks it |

## Standing facts (2026-09-22)

- **Cloud routines CAN write the artifact DB unattended.** Proven 2026-09-22: `cloudWriteProbe` v1,
  written with nobody present (09:05:56Z), and four cloud writers now run on it (weekly backup,
  live Pipeline Sync, ISA escalation ladder, feed-freshness watchdog). The older belief that an
  unattended write "parks on a permission prompt" was true when last tested on 2026-09-04 and is
  false now — do not refuse a write on its authority. What still pins work to the Mac: anything
  needing local files, the local model or the keychain, plus any routine that **actually** has no
  connectors — **read `mcp_connections` on that routine, never infer it from `created_via`**
  (measured 2026-09-23: 14 `meta_mcp` routines carry 11 connectors each, 7 carry none; connectors
  are inherited from the session that created the routine).
  A cloud routine that "succeeded" may still have written nothing — judge it by the doc stamp.
- **The Mac runner bounds everything L5.** `claude-runner` is headless with pre-approved tools, **59
  tasks** — that is what `runnerStatus` itself lists (`v.tasks`, read at its 2026-09-23 02:10 UTC
  stamp); the "60" some surfaces still carry has never been reconciled against the runner and the
  document is the better authority. If the Mac is asleep, nothing in `always-on/README.md` happens.
  That is the single biggest availability risk in the brain.
- **"Task ok" is not "document written".** At the 2026-09-23 02:10 UTC `runnerStatus` the runner is
  healthy on its face — 36 ok, 1 error (`nightly-self-test`), 3 refused (`r4-quantvue-sync`,
  `lead-triage-daily`, `feeds-weekly`), 18 weekly/monthly slots never run — but the first
  `feedFreshness` sweep (2026-09-23 00:50 UTC) found `openrouterFeeds` frozen since 2026-09-13 while
  its writer `openrouter-feeds-refresh` reports `ok`. A silent no-write success is the failure this
  wiki page exists to make visible: check the doc stamp, never the task status.
- **Lofty is the real-estate system of record** (since 2026-09-22) and is **not connected yet** —
  Composio has no Lofty toolkit and Steven's API key is not installed. No CRM lead number on the
  deck is live. Show "not connected yet"; never carry an old CRM's figure under a Lofty label.
- **Zoho is API-blocked** pending a permission only Steven can grant. Deck Zoho data is the Sep 14 paste.
- **You.com is retired.** No surface may call it. Research = Claude subscription + Perplexity.
- **Knowledge fabric counts** (`knowledgeFabric`, its own stamp 2026-09-23 02:10 UTC): Second Brain 71
  rows · vault 832 notes · Jarvis 1,761 documents · graph 750 nodes / 1,104 edges · Ruflo 238 entries ·
  **Drive folder 0 files**. `fabric-deck-sync` has recovered — last completion ok 2026-09-22 17:08,
  and it was running again at the 02:10 stamp — so the earlier "ended in error" note is spent. Two
  counts on that row are still not what they look like: the **graph** figure is the 2026-09-13 build
  (`knowledgeGraph` has not moved since; `ops-knowledge-graph` has never run), and **Drive is a store
  nothing can reach** — 0 files on every sample, no credential, no connector. A 0-file store rendered
  as a live store is a false green; the decision to wire it or drop it from the count is Steven's
  (`integrations/google-drive-brain.md`).

## Pages

**Status: written.** Each page describes categories and the operating rules, not a row-by-row live
table — a row-by-row table would drift the same day it was written. Ask the named doc for a current
count, per the "one rule" above.

| Page | One-line summary |
|---|---|
| `db-docs.md` | What the `state` collection's documents mean, the `{v:...}` shape rule, and which docs are known to carry a not-really-live body |
| `panel-map.md` | The deck's fifteen tabs and panels, and which docs feed the ones relevant to this repo's wikis |
| `task-catalog.md` | The Mac task rhythm under `claude-runner`, and how to read a task's status honestly |
| `routine-catalog.md` | Cloud routine categories, the disproved "can't write unattended" rule, and the connector-inheritance gotcha |
