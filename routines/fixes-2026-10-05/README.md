# Routine fixes — 2026-10-05 (engineer E6, ROUTINES lane)

Steven, 2026-10-05: *"look for everything throughout the dashboard that is stale, not working, not connected
and have engineers fix them"*.

Measured 2026-10-05, 18:02–19:00 UTC, from the routine list exports (65 enabled, 17 disabled), the 18:05 UTC
database dumps and the connectors. **Nothing here has been applied.** I called no routine tool (no update,
fire, create or delete), wrote no database and made no git commit.

> **Integrator update, 2026-10-05 19:05–19:15 UTC — applied.** A, B and C (section 2) were applied with
> `update_trigger`; the live prompts were re-read and are identical to these files. The backup was fired once at
> 19:09 UTC and passed first time (`backupStatus` GREEN at 19:12 UTC: 182 + 15 documents in 6 + 1 parts,
> verified, `weeksKept` 2). Finding 4.2 is fixed in `routines/feed-writers-2026-10-05/12-market-close.prompt.txt`:
> the cloud market-close writer now also writes `marketSnapshot` (first run tonight, 21:20 UTC). Findings 4.1
> and 4.3 are fixed in Command Deck v172. Section 1 is still Steven's (NEEDS-STEVEN 87–89). Strava (item 1):
> once the cloud routine writes `stravaSnapshot`, pause the Mac's `strava-daily-sync` (the Mac paste-in §2.5
> reads why it wrote an empty list) so the two never overwrite each other. The three prompt files are the **full new
prompt** (live prompt plus the smallest change); each has a `.diff` against the live text so a reviewer sees
exactly what moved.

| File | Routine | Verdict |
|---|---|---|
| `backup.prompt.txt` · `.diff` | Weekly ecosystem backup — cloud writer · [`trig_01JcPh3AM2z21Bsv34SvSkqM`](https://claude.ai/code/routines/trig_01JcPh3AM2z21Bsv34SvSkqM) | broken by design — fixed |
| `feed-watchdog.prompt.txt` · `.diff` | Feed freshness watchdog · [`trig_01AcWPY2aSQZay5e2DBCfczD`](https://claude.ai/code/routines/trig_01AcWPY2aSQZay5e2DBCfczD) | fixed |
| `backup-watchdog.prompt.txt` · `.diff` | Backup verification watchdog · [`trig_01PhgrwpwaQ9vLvFxQPrPJ6W`](https://claude.ai/code/routines/trig_01PhgrwpwaQ9vLvFxQPrPJ6W) | fixed |
| (none) | ISA line — reply check & escalation ladder · [`trig_01J9xuWgAuUCHATtpLivDkgp`](https://claude.ai/code/routines/trig_01J9xuWgAuUCHATtpLivDkgp) | **no prompt change** — the heartbeat is already there (section 2) |

**Usage is the binding constraint, and these routines spend it for nothing.** Last week's allowance was gone by
Tuesday Sep 29 (failures Sep 29–Oct 4). Counting from the routine crons, Steven's own enabled research-only
routines that end with JSON nobody applies fire about **54 times a week** (the four named: 40; Opportunity Radar
and On This Day, which a cloud writer already covers: 14), the stock vault templates another **12**. That is about
66 runs a week that change no dashboard. Switching those off (section 1) is the cheapest fix for the failures in
section 3.

---

## 1. Steven's own routines that need HIS action

These were made by Steven (`http_api`), so an agent cannot edit or disable them. Link pattern:
`https://claude.ai/code/routines/<id>`.

### 1a. The four research-only routines you named

Each reads real data and ends with a JSON message that nothing applies (confirmed in each prompt's last
paragraph). I checked what already writes the same document.

| # | Routine · link | Fires | Do exactly this | Why |
|---|---|---|---|---|
| 1 | Strava activity refresh · [`trig_015Fm6K3R7yvyHv3SkPGXHwL`](https://claude.ai/code/routines/trig_015Fm6K3R7yvyHv3SkPGXHwL) | 2×/day (14/wk) | **Paste** the whole of `routines/feed-writers-2026-09-28/03-strava.prompt.txt` into its prompt box and save. Keep it on. | The Mac task `strava-daily-sync` (slot 5:20 AM PT) owns `stravaSnapshot`, but the document, stamped 12:22 UTC today, holds `activities: []` while the Strava connector shows an activity (Sep 12) inside the 30-day window. This routine already carries the Strava connector; the writer prompt makes it write the document itself, with the clock read from `date -u`. |
| 2 | Calendar refresh · [`trig_011992fizYkQthCSRft4tqR1`](https://claude.ai/code/routines/trig_011992fizYkQthCSRft4tqR1) | 2×/day (14/wk) | **Switch off.** | The Mac task `calendar-daily-sync` (6:35 AM / 5:35 PM PT) ran ok and wrote `calendarSnapshot` at 13:37 UTC today (9 events). The cloud copy only prints JSON. If you would rather have the cloud as primary, paste `10-calendar.prompt.txt` instead, after copying the calendar-id table out of the old prompt (the repo copy has the ids removed). |
| 3 | Mortgage rates & market refresh · [`trig_017qftG3Aa7KDT7rCBSecp94`](https://claude.ai/code/routines/trig_017qftG3Aa7KDT7rCBSecp94) | daily (7/wk) | **Switch off.** | The Mac tasks `mortgage-rates-daily` (6:38 AM / 1:38 PM PT, weekdays) and `r5-rates-market-refresh` (Mon 5:05 AM PT) ran ok and wrote `ratesSnapshot` at 13:39 UTC today. The cloud sandbox cannot reach FRED, Freddie Mac or Redfin (NEEDS-STEVEN 74), so the repo writer `02-mortgage-rates-market.prompt.txt` could only carry old numbers forward. |
| 4 | Trading strategy performance daily · [`trig_011CXFHCT3hou6uaCfb5rWkC`](https://claude.ai/code/routines/trig_011CXFHCT3hou6uaCfb5rWkC) | weekdays (5/wk) | **Switch off.** | The Mac task `r4-quantvue-sync` (weekdays 11:20 PM PT) writes `strategySnapshot`; it has shown "limited" since Oct 1 (usage) and its next slot is tonight. This routine's last run failed Oct 2 and its JSON is applied by no one. No writer prompt exists in the repo for it. |

### 1b. Same pattern, found by scanning every enabled `http_api` routine

| # | Routine · link | Fires | Action | Why |
|---|---|---|---|---|
| 5 | Opportunity Radar research (daily) · [`trig_01Wus8zVhZNEs1hZUYNTFj3E`](https://claude.ai/code/routines/trig_01Wus8zVhZNEs1hZUYNTFj3E) | 7/wk | **Switch off.** | The cloud *morning feeds* writer already writes `liveFeeds.oppRadarLiveList` (feed-writers-2026-10-05 README). |
| 6 | On This Day & Birthdays daily · [`trig_01FDN3HkHaW2SM1GrpSEzFg1`](https://claude.ai/code/routines/trig_01FDN3HkHaW2SM1GrpSEzFg1) | 7/wk | **Switch off.** | The *morning feeds* writer already writes `onThisDayHistoryList` and `onThisDayBirthdayList`. |
| 7–10 | Daily deals & hacks · [`trig_015MZSefaw573ciFQSvoWDmZ`](https://claude.ai/code/routines/trig_015MZSefaw573ciFQSvoWDmZ) · Travel & Experiences weekly · [`trig_01Qgz9ZEvt2KYFqfAte8zVRi`](https://claude.ai/code/routines/trig_01Qgz9ZEvt2KYFqfAte8zVRi) · Next Big Moves weekly · [`trig_01Lb3aYRQZSLsAkcnDpZ8zEL`](https://claude.ai/code/routines/trig_01Lb3aYRQZSLsAkcnDpZ8zEL) · ISA drift check, 2×/day · [`trig_01PahyyhhmNzze1o1ujcGno2`](https://claude.ai/code/routines/trig_01PahyyhhmNzze1o1ujcGno2) | 7 + 1 + 1 + 14 /wk | **Your call**: switch off, or ask an engineer for a writer prompt (the pattern is `03-strava.prompt.txt`). | All four end with a JSON message that nothing applies, and no writer exists for them. The drift check overlaps with *Pipeline Sync (live, writes)*, which already reconciles the shared documents 4×/day. |

### 1c. Two Cowork runs waiting for your approval (both started today)

| # | Routine · link | Waiting since | Do exactly this | Why |
|---|---|---|---|---|
| 11 | Real Estate Weekly Brief · [`trig_01CjaMXrbMga1jPdJzUnwLUo`](https://claude.ai/code/routines/trig_01CjaMXrbMga1jPdJzUnwLUo) | 16:43 UTC · session `cse_01SfkGd1ktpFeuqwnsNTJfTW` | Open the routine, **Stop** the waiting run, then **switch the routine off** (retire it). | Third time it has sat waiting: abandoned Sep 21; pending from Sep 23 until it finished on Sep 28; pending again today. NEEDS-STEVEN 16 said to retire it if it hung again. (If you do want the brief, answer its pending permission once.) |
| 12 | Weekly dashboard refresh — Rent, Buy, or Wait · [`trig_01EBvRQ4Rv63EgrLihjNxwiG`](https://claude.ai/code/routines/trig_01EBvRQ4Rv63EgrLihjNxwiG) | 17:37 UTC · session `cse_01KnHHi6PZCrdgQYQykxvbZd` | **Do not approve it before Sun Oct 11, 20:00 UTC** (the usage reset). Then approve it, or Stop it and retire the weekly. | (Abandoned Sep 21, hit the limit Sep 28.) Today is the first Monday of the month, so it is on the **monthly tier** (full submarket median and rent sweep, on Opus 5) and is asking to republish the public Rent, Buy, or Wait page. Approving a heavy Opus run while the allowance is at its warning level risks another lockout. NEEDS-STEVEN 49 suggests moving Rent/Buy/Wait to a Monday Mac task. |

### 1d. Decisions already on your list

| # | Routine · link | Do exactly this | Why |
|---|---|---|---|
| 13 | Project Risk Review · [`trig_01YHGFTYdWdVG5nFKCjmcd9M`](https://claude.ai/code/routines/trig_01YHGFTYdWdVG5nFKCjmcd9M) (NEEDS-STEVEN 16) | **Switch off.** | Stock template that reads `/home/claude/vault`, which the cloud does not have; two siblings (Ops Issue Review, Books Reconciliation) were disabled 09-23 for that reason. Its last run failed Sep 29. |
| 14 | Opus 5 → 5.5 trio (NEEDS-STEVEN 85): Monthly state market refresh · [`trig_01JvvDEbVqzusqzc6dcWdTtH`](https://claude.ai/code/routines/trig_01JvvDEbVqzusqzc6dcWdTtH) · Muster Point monthly · [`trig_01RA64qRFH7B4ZYuTAzg7e2B`](https://claude.ai/code/routines/trig_01RA64qRFH7B4ZYuTAzg7e2B) · Weekly dashboard refresh · [`trig_01EBvRQ4Rv63EgrLihjNxwiG`](https://claude.ai/code/routines/trig_01EBvRQ4Rv63EgrLihjNxwiG) | Say in words: **"move those three to Opus 5.5"**. | They are agent-made, so the integrator can change the model, but only on your explicit say-so. Optional. |
| 15 | Cloud ISA bridge (hourly) · [`trig_01VpcvVPTrbdfvdbXn1mD7hB`](https://claude.ai/code/routines/trig_01VpcvVPTrbdfvdbXn1mD7hB) and Steve twin · [`trig_0174717mnSfAk1LtQQVJhH7r`](https://claude.ai/code/routines/trig_0174717mnSfAk1LtQQVJhH7r) (NEEDS-STEVEN 17) — both disabled | Decide, then **switch on in the UI**. The twin must be created in the web UI to carry its Gmail connector. | Both were disabled on a belief later disproved (cloud writes park on a prompt). The bridge is 24 runs a day: enable it after the Oct 11, 20:00 UTC reset, not before. |

### 1e. USC study planner

| # | Item | Do exactly this | Why |
|---|---|---|---|
| 16 | R19 prompt · [`trig_01VkpVzzqPkGtXPS24E4JNKP`](https://claude.ai/code/routines/trig_01VkpVzzqPkGtXPS24E4JNKP) | Edit the prompt: change the document name `courseSchedule` to `uscSchedule`. | The prompt reads four documents; `courseSchedule` does not exist (the store has `uscSchedule`, one row: the Wednesday 5:30–7:00 PM PT live class). |
| 17 | `uscDeadlines` Weeks 5–7 | Give an engineer the three weeks' due dates from Canvas, or the Canvas iCal URL (NEEDS-STEVEN 31). | The document holds 9 rows: Weeks 1–4 (all past) and the Week 8 final (Oct 19). **R19 cannot fill the gap**: its prompt is read-only ("do not attempt a write") and says to report an incomplete schedule rather than invent a date. No Mac or cloud task syncs the deadlines. I have not guessed any date. |

### 1f. Seven more stock vault templates (agent-made — the integrator can switch them off once you say yes; NEEDS-STEVEN 49)

Morning Brief (daily) · [`trig_01VYBYonPtRiKL3h3F6wTWuV`](https://claude.ai/code/routines/trig_01VYBYonPtRiKL3h3F6wTWuV) · Metrics Digest · [`trig_01SjkicmXr11d49QtmQ1H2wC`](https://claude.ai/code/routines/trig_01SjkicmXr11d49QtmQ1H2wC) · Social Calendar Planning · [`trig_01EivcMF7k68SHioBAdHGUPm`](https://claude.ai/code/routines/trig_01EivcMF7k68SHioBAdHGUPm) · Account Health
Check · [`trig_01286edKBozYKNuvZzKhwvVi`](https://claude.ai/code/routines/trig_01286edKBozYKNuvZzKhwvVi) · Content Calendar Review · [`trig_01QUMYcsP8UREwxzp41w4QJL`](https://claude.ai/code/routines/trig_01QUMYcsP8UREwxzp41w4QJL) · SEO Content Gap Audit · [`trig_01FjDLMrJBa1dKEh7Nv7JJ4h`](https://claude.ai/code/routines/trig_01FjDLMrJBa1dKEh7Nv7JJ4h) · Financial Summary · [`trig_01CAk1pekAM5AXRiwUxxdnru`](https://claude.ai/code/routines/trig_01CAk1pekAM5AXRiwUxxdnru).
All seven read `/home/claude/vault` (the same defect as the two disabled on 09-23). I did not read their run outputs.

---

## 2. Agent-made routine fixes for the integrator to apply

Apply each with `update_trigger(trigger_id, prompt = <the file's full text>)`. All three routines were created via
`meta_mcp`, so agents may edit them. Files are UTF-8 (they contain em dashes). Suggested order: A first, then fire it
once and check the result before relying on it; B and C run on their own schedules (B daily 16:12 UTC, C Sundays 17:30
UTC), or fire B once to see the new states.

**Before overwriting:** each file is the live prompt as exported at 18:02 UTC plus the edits in its `.diff`. If a routine's
prompt has changed since, do not overwrite it: re-derive it with the generator that made the file
(`SCRATCH/eng-1005/e6/make_backup_prompt.py`, `make_watchdog_prompt.py`, `make_backup_watchdog_prompt.py`; each applies
exact-string replacements and stops with an assertion if the live text no longer matches). The helper script embedded in
`backup.prompt.txt` can be extracted from its fenced block and run on its own (`build`, `verify`, `streak`; standard
library only). The integrator's checkpoint commit `4635a7c` holds an early draft of `backup.prompt.txt` and its `.diff`; the
working tree supersedes it in one paragraph (the staging folder is now in the working directory first).

| # | Routine · id | File | The change, in one line | Fire once and expect |
|---|---|---|---|---|
| A | Weekly ecosystem backup · [`trig_01JcPh3AM2z21Bsv34SvSkqM`](https://claude.ai/code/routines/trig_01JcPh3AM2z21Bsv34SvSkqM) | `backup.prompt.txt` | Stage through files (`list … out_dir` → helper script → `set … file_path`) instead of the conversation; one HARD RULE sentence loosened to allow a staging folder emptied at the end; honest `docCount` / new `liveDocCount` / date-derived `consecutiveFailures`; retention only after a pass; one escalation per streak. | `backups` holds `2026-10-05-commanddeck-p1…p6` and `2026-10-05-isaportal`; `backupStatus` GREEN, `docCount` equal to the live counts (182 / 15 at 18:05 UTC), `liveDocCount` the same, `consecutiveFailures` 0; one `ciLog` row. |
| B | Feed freshness watchdog · [`trig_01AcWPY2aSQZay5e2DBCfczD`](https://claude.ai/code/routines/trig_01AcWPY2aSQZay5e2DBCfczD) | `feed-watchdog.prompt.txt` | Real stamps for `marketSnapshot`, `aiNews`, `liveFeeds`; a `waiting` state for `healthNotionSync`; weekday cadence for `isaLadder`; `openrouterFeeds` retired. | `feedFreshness`: `unknown` falls from 3 to 0, `healthNotionSync` is `waiting`, 25 docs checked. |
| C | Backup verification watchdog · [`trig_01PhgrwpwaQ9vLvFxQPrPJ6W`](https://claude.ai/code/routines/trig_01PhgrwpwaQ9vLvFxQPrPJ6W) | `backup-watchdog.prompt.txt` | Read the cloud writer's `backupStatus` shape; count the live store with `out_dir` instead of an inline `list`; say what AMBER and RED mean. | A verdict, not a crash: expect **AMBER** (verified, restore test never run, 2 of 8 weeks: Sep 22 and Oct 5). |

### A. Weekly ecosystem backup — why

The prompt told its model to `list` every document of both databases, hold each value in its context and write
it back, while a HARD RULE said the data "stays inside these artifact databases. Never write it to a file". The
Command Deck is 182 documents and 1.09 MiB compact (1.28 MiB as the tool saves it); that cannot pass through a
conversation, and the rule forbade the only alternative. So the 18:14 run stopped with "too large to export without
local files" and wrote RED. The fix keeps the destination (the Command Deck's own `backups` collection:
`<date>-commanddeck-p1…`, `<date>-isaportal`, the Sep 22 shape) and the three checks, but moves the bytes with
`ArtifactData list … out_dir` → a stdlib Python helper → `set … file_path`, then reads the stored copy back the same
way and verifies **every** document by script plus three random live comparisons. The helper is embedded in the
prompt and was tested on the real dumps (182 docs → 6 parts, largest 244,039 bytes; nine failure cases caught).
The part size rests on the documented limit of 256 KiB per document and on the Sep 22 backup, whose largest part
(241,802 bytes compact) the store accepted.
`docCount`: the old 170 / 13 was the Sep 22 backup's count (it also appears in the prompt's own example, now
replaced by placeholders). It now always describes the backup `lastBackup` names; a failed run leaves it alone and
the new `liveDocCount` carries what that run counted live (null if nothing). `consecutiveFailures`: a run stopped by
the usage limit never starts, so "increment on failure" counted 1. A `streak` helper counts this failed attempt plus
every Sunday since the last good backup with no run, giving **3** today (Sep 27, Oct 4, Oct 5). A failed run now
deletes nothing, so the Sep 22 backup survives any streak.

**Needs your eye (the integrator may want to tell Steven):** the loosened rule is a *client-data* rule (client names and
loan amounts sit in these documents). The staging copy lives only in the run's sandbox working folder, is never
committed or sent anywhere, and step 7 deletes it. **Not proven:** an unattended run reading with `out_dir`. The ISA bridge's prompt says "never pass out_dir to
read_db" because it "could trigger a permission prompt", and R16, R18 and R19 repeat the warning. Against that, the
hourly bridge's prompt had it write files in its working directory and its runs succeeded, and the monthly Nellis
routine uses `out_dir` but has never completed a run. The staging folder is therefore in the working directory, never
under `~/.claude` (the "sensitive file" trap named in the feed writers). The first on-demand fire settles it. If it waits on a permission,
the failure is visible (the run reports RED with the reason) and the fallback is the Mac backup
(`ai-ecosystem-backup`, NEEDS-STEVEN 18). Two cautions: the copies live in the same database as the data (they
protect against bad writes, not against losing the artifact); and eight weekly copies are about 9 MiB — the db
contract documents no byte quota (only 256 KiB per document, 5,000 documents), but `integrations/vanessa-voice-everywhere.md`
assumes a ~5 MB working budget, so watch for `quota_exceeded` and lower the 8 weeks if it appears.

### B. Feed freshness watchdog — why

`marketSnapshot` and `aiNews` came back `unknown` because neither carries a stamp field, only a prose `asOf`, and no
writer leaves one in the document. Verified against the dumps: the deck's own freshness board already uses
`liveFeeds.feeds.aiNewsList.checkedAt` for the AI-news card (a real ISO instant, 17:31 UTC today), so `aiNews` uses
that. `marketSnapshot` feeds the index tiles and has no such twin, so it is read by the session date its text names
("Oct 2, 2026 close") and judged by sessions, not hours (fresh while it holds the latest completed session). That
will turn `late` by Tuesday and `stale` by Wednesday, which is true: see section 4 (nothing writes it). Three more
false alarms were coming and are fixed in the same prompt: `liveFeeds.updatedAt` is only touched by the Mac feed
tasks (the cloud writers update single entries), so it is judged by the newest entry stamp; `isaLadder` runs
Tuesday–Saturday only, so it would read `late` every Monday; and `openrouterFeeds` has no reader (the deck never
loads it) and no writer once the Mac task is paused. `healthNotionSync` (database created, 0 rows, status
`awaiting-first-phone-run`) is now `waiting`, reported as "waiting on Steven's first phone run", and never the
`worst` doc. Every existing rule is kept. The `feedFreshness` document has no on-page reader (searched the deck), so
the new `waiting` count is safe.

### C. Backup verification watchdog — why

It expected the Mac task's `backupStatus` shape (`integrityCheck`, `restoreTest`, `docs`, `sizeBytes`, `path`),
which the cloud writer never writes, so it would report a failure after every good backup; and its step 3 listed
the whole 1.1 MiB store inline to count it, which cannot fit in a conversation. It now reads the cloud shape
(`verified`, `docCount`, `liveDocCount`, `weeksKept`, `consecutiveFailures`), counts the live store with `out_dir`
into a folder it deletes (and says "unavailable" if refused), and defines AMBER and RED. It still never writes a
document and keeps its standard (verified within 8 days, a passing restore test within 30, eight weekly copies).

### D. ISA line escalation ladder — no prompt change (checked, not assumed)

The brief assumed `isaLadder` looks stale because it "only writes on change". It does not. Step 4 of the live
prompt says "Write isaLadder every run", and `updatedAt` is already defined as the actual write time ("the ladder's
only proof of life"; the 09-23 repair in `routines/mac-task-repairs.md` §6). The document proves a no-change run
stamps it: `updatedAt 2026-09-24T14:44:01Z`, rung `halted`, note "…nothing written to isaLine or twinQueue". It is
stale because **no run has succeeded since**: the exports show the last run failing in 5 seconds on Sat Sep 26 and again on
Sat Oct 3 (14:42:04 → 14:42:09 UTC both times, the same signature as the other usage-limit failures), and the document
shows nothing was written on Sep 25 or Sep 29–Oct 2 either. The cron is Tue–Sat 14:30 UTC (the morning after each Mon–Fri evening nudge), so the next run is **Tue Oct 6**
and will restamp it. Adding a second heartbeat field would change nothing while runs fail at startup. If you want it
fresh now, fire it once (a two-minute run). Two small side effects are in B (Monday false alarm) and section 4 (the
deck label).

**Reviewed, no change:** *Weekly Loop Engineering + Self-Test* [`trig_01W1KHiBfVXZ5Xwd1aCFJM72`](https://claude.ai/code/routines/trig_01W1KHiBfVXZ5Xwd1aCFJM72) — its premise ("cloud cannot write the database") is
outdated but it is report-only by design and mails its report, so it is not broken; making it write `loopLog` is a design
choice for Steven. *Strava wrapper guard*, *Pipeline Sync (live, writes)*, *AI twin autopilot* (it serves Signal Deck
Pro, not the Command Deck) ran fine today. The 2026-09-28/10-05 feed writers were left alone as instructed.

---

## 3. Re-run plan: the 13 monthly routines that failed Oct 1–2, plus R19

**Why they failed.** The usage limit (verified on samples earlier today; the failed runs lasted 15–69 seconds). **Eight
of them have never completed a run** (the dashboard monthlies were created Sep 27–28, so Oct 1–2 was their first), so
fire **one at a time** and check each result before the next; a failure that is not the limit means fix that prompt
first. **Fire only after the reset, Sun 2026-10-11 20:00 UTC.** Suggested slots (UTC), at most two a day: 23:00 UTC
(4 PM PT, after the 21:20 market-close writer) and 03:00 UTC (8 PM PT, after the 01:35 weather & news run).
Agent-made routines can be fired by the integrator; the `http_api` ones (R16, R18, R19, the integrations check) may
need Steven's **Run now** button.

| Order | Routine · link | What it refreshes | Weight | Slot (UTC) | Note |
|---|---|---|---|---|---|
| 1 | VA Command Center — monthly market & competitor · [`trig_01RpEqUFbqaPDguF2ku6PEmv`](https://claude.ai/code/routines/trig_01RpEqUFbqaPDguF2ku6PEmv) | Writes only the database document `refresh/market` of the *Shearrill VA Command Center* page; it does not republish the page | Opus 5.5, web research | Mon 10-12 23:00 | Page last updated Sep 27, the oldest of the dashboards. Lightest of the eight: one document write, no page rebuild. |
| 2 | R16 marketing compliance sweep · [`trig_01KDp9oB87M99NjUnyWiTbMd`](https://claude.ai/code/routines/trig_01KDp9oB87M99NjUnyWiTbMd) | Report only: reviews `marketingQueue`, `contentCalendar`, `webinarFunnel`, `reviewPipeline` against NMLS, Reg Z, RESPA §8 and similar; pushes a notification | Sonnet, light | Tue 10-13 23:00 | Alexandra drafts, Steven decides. Last good run Sep 13. |
| 3 | Sentinel monthly figures · [`trig_01RJJZeocYiNhyDRAAxHm9SW`](https://claude.ai/code/routines/trig_01RJJZeocYiNhyDRAAxHm9SW) | Republishes the *Sentinel Military Family Office* site with current VA, pay, BAH, TSP, IRS and similar figures | default model | Wed 10-14 03:00 | Page last updated Sep 28. |
| 4 | Tech & AI Command Deck — monthly · [`trig_01RsFftt7y4myjmEDqoe1EbS`](https://claude.ai/code/routines/trig_01RsFftt7y4myjmEDqoe1EbS) | Republishes the *Tech & AI Command Deck* modules after parallel sub-agent research | Opus 5.5, sub-agents | Wed 10-14 23:00 | Page last updated Sep 28. "Perplexity" in its prompt is only a product it researches, not a dependency. |
| 5 | Things I Wish I Knew — monthly · [`trig_01HXTDADHyGpghP9MMUgmCBM`](https://claude.ai/code/routines/trig_01HXTDADHyGpghP9MMUgmCBM) | Creates a new Google Doc "Appendix B — Current Rates and Figures — <Month YYYY>" in the book-updates Drive folder | Opus 5.5 | Thu 10-15 03:00 | Google Drive is attached. Not a dashboard. |
| 6 | NAVWAR PM Deck — monthly · [`trig_01ArqD9f1QVCQwEDVthncB3b`](https://claude.ai/code/routines/trig_01ArqD9f1QVCQwEDVthncB3b) | Republishes *The NAVWAR Program Manager's Deck* and its update log | Opus 5.5 | Thu 10-15 23:00 | The page shows updated 2026-10-05: read its change log first. |
| 7 | Nellis VA Webinar — monthly · [`trig_01VWeehgtJYJX5vVDa5reSGE`](https://claude.ai/code/routines/trig_01VWeehgtJYJX5vVDa5reSGE) | Rebuilds the deck kit (283 template parts) and republishes *Nellis VA Webinar Desk* | Opus 5.5, sub-agents | Fri 10-16 03:00 | Page updated 2026-10-05; prompt edited Oct 4 21:31 UTC. Heavy build. |
| 8 | Muster Point — monthly · [`trig_01RA64qRFH7B4ZYuTAzg7e2B`](https://claude.ai/code/routines/trig_01RA64qRFH7B4ZYuTAzg7e2B) | Re-verifies ~1,320 benefit items in the 2.5 MB *Muster Point* page and republishes it | **Opus 5**, heavy | Fri 10-16 23:00 | Page updated 2026-10-05. If you approve item 14, it moves to 5.5 first. |
| 9 | Monthly state market refresh — Rent, Buy, or Wait · [`trig_01JvvDEbVqzusqzc6dcWdTtH`](https://claude.ai/code/routines/trig_01JvvDEbVqzusqzc6dcWdTtH) | Monthly tier plus a 56-area, five-state sweep, with parallel sub-agents and a headless-browser render; republishes **both** copies and writes `market/current` | **Opus 5, heaviest** | Mon 10-19 23:00 | Last, and only after item 12 is settled: today's weekly run is the same monthly tier on the public copy only. |
| 10 | Property Search & Tax-Data integrations check · [`trig_01TVFXodf4JhV9yp6oaYgYpK`](https://claude.ai/code/routines/trig_01TVFXodf4JhV9yp6oaYgYpK) | Reachability check of deep-links and county tax sites; ends with JSON a human reads | Sonnet, light | optional | Low value; next scheduled run is Nov 1. |
| — | R18 card credits · [`trig_0138GgRga2sggpEYbJapZnvN`](https://claude.ai/code/routines/trig_0138GgRga2sggpEYbJapZnvN) | Report on expiring card credits | Sonnet | **do not re-fire** | Its own schedule runs again **Thu Oct 15, 15:00 UTC**, 4 days after the reset. |
| — | SEO Content Gap Audit · [`trig_01FjDLMrJBa1dKEh7Nv7JJ4h`](https://claude.ai/code/routines/trig_01FjDLMrJBa1dKEh7Nv7JJ4h) and Financial Summary · [`trig_01CAk1pekAM5AXRiwUxxdnru`](https://claude.ai/code/routines/trig_01CAk1pekAM5AXRiwUxxdnru) | Stock vault templates (read `/home/claude/vault`) | — | **do not re-run** | Retire them (NEEDS-STEVEN 49, section 1f). |
| — | R19 USC study planner · [`trig_01VkpVzzqPkGtXPS24E4JNKP`](https://claude.ai/code/routines/trig_01VkpVzzqPkGtXPS24E4JNKP) | Read-only plan for the coming week; writes nothing | Sonnet | runs by itself **Mon Oct 12, 00:00 UTC** | **Does not maintain `uscDeadlines`**, so a re-run **would not fill Weeks 5–7**: it would report the schedule incomplete. See 1e. |

That is 13 monthlies: items 1–10, R18, SEO and Financial Summary. Also note that the Sunday Oct 11 weeklies (the
backup at 11:00 UTC, the loops at 15:00–17:30 UTC) fire **before** the 20:00 UTC reset; if the allowance is still
empty they fail again, so re-fire the backup after 20:00 UTC.

---

## 4. Found outside my lane (for the integrator)

1. **Deck label, `SCRATCH/deck/command-deck.html` line 27439** (`renderIsaLadder`): it prints
   `"slot " + stamp + " (a schedule-slot stamp, not proof it ran)"`. That described the pre-09-23 bug; the stamp is
   now the real write time. Suggested: `ladderBits.push("last ran " + orStampText(d.updatedAt));`.
2. **`marketSnapshot` has no writer.** The market-close writer ([`trig_01LmhuxXi3waJWpZfqiCfgJH`](https://claude.ai/code/routines/trig_01LmhuxXi3waJWpZfqiCfgJH), first run tonight 21:20 UTC) writes only
   `liveFeeds.mktMoversList` and `mktSectorList`. The index tiles read `marketSnapshot.indices` (Oct 2 close), and the Mac
   `feeds-market-close` is being paused (`integrations/mac-claude-only.md`). Extending the writer to refresh
   `marketSnapshot` is a writer change, so I left it. The new watchdog rule will show the gap by Wednesday.
3. **Backup card** (`renderBackupStatus`, about line 21246) reads the Mac's `docs`, `sizeBytes` and `path` and names
   `r6-weekly-backup` as the scheduled owner; the cloud writer leaves `docCount` / `liveDocCount` / `status`, so the
   Documents and Size tiles show a dash and the owner text is wrong. Render `docCount` and name the cloud routine.
4. **`feedFreshness` has no reader on the page** (searched the deck): the watchdog's work is visible only in the
   database and in `ciLog`.
5. **Unproven first runs:** the backup fix (unattended `out_dir`), and the eight dashboard monthlies.
