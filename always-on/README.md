# L5 — Always-on

What keeps the brain current while nobody is watching. Everything here runs under **`claude-runner`**
on the Mac (headless, pre-approved tools, **59** tasks — counted from the live runnerStatus doc 2026-09-23).

> **Everything on this page that is broken has a written repair in
> [`routines/mac-task-repairs.md`](../routines/mac-task-repairs.md)** — one section each, with the
> corrected prompt or command already written and the check that proves it worked. This page says
> *what is wrong*; that one says *what to paste*. **Item 1 has a deadline: 2026-09-23 12:20 UTC.**
>
> **The cloud routines are a separate file, and they are already repaired:**
> [`routines/cloud-routine-repairs.md`](../routines/cloud-routine-repairs.md). A cloud routine
> created by an agent can be edited by an agent, so nothing in that file is waiting on Steven —
> it records what was changed on 2026-09-23 and the document or fired run that proves each one.
> The exception is the seven `http_api` routines, which only Steven can touch; they are listed
> there with a link each.

**Status source:** the `runnerStatus` doc, `syncedAt 2026-09-22T07:06:12Z`. Crons are Mac local (PT).
"Last end" is the last completion the runner recorded — **not** proof that today's slot ran.

> **Corrected 2026-09-22 14:40 UTC: `runnerStatus` is not dead. Its clock is.** The earlier reading
> on this page — that the doc stopped being written at `04:05:04Z`, ~9.5 h before the audit — was
> wrong, and it was wrong in a way worth naming, because it made a live machine look like a dead one.
> `runnerStatus` (v8) and `knowledgeFabric` (v7) carry the **identical** writer stamp
> `2026-09-22T07:06:12Z` — one `run.sh fabric` pass wrote both. The **server** recorded that write at
> `updatedAt 2026-09-22T14:07:22.431452Z`. The gap is **7 h 01 m**, exactly the PDT offset: the
> runner stamps **Mac-local Pacific time and appends a `Z`**. So that doc was written at ~14:06 UTC,
> about an hour before the audit, and its newest `lastEnd` — `vanessa-discord-inbox 07:05:00` PT
> (= 14:05 UTC) — is one minute older than the write.
>
> **Read every "Last end" in this file as a floor, and assume every writer stamp may be seven hours
> behind the true write time until the fix in `routines/mac-task-repairs.md` §2 is applied.** A doc's
> own server `updatedAt` is the only timestamp here that is unambiguously UTC.

## The brain's own tasks

| Task | Cron (PT) | Does | Last end | Status |
|---|---|---|---|---|
| `brain-deck-sync` | `20 7-22 * * *` — hourly :20, 7 AM–10 PM | Copies every Second Brain row (name, summary, type, status, tags, link) from Notion into the deck's `secondBrain` doc | 2026-09-21 20:24 | **working** — `secondBrain.syncedAt 2026-09-22T08:06:38Z`. Today's first slot (14:20 UTC) had not fired at audit time |
| `brain-learn-daily` | `50 22 * * *` — 10:50 PM daily | Distills Steven's own words (chat transcripts) and the Drive "Second Brain" folder into Second Brain rows; flagged items wait for review | 2026-09-15 22:56 | **ok, but no completion recorded since 2026-09-15** |
| `brain-weekly-verify` | `0 16 * * 0` — **Sunday 4:00 PM** | The **review gate**: what the brain learned this week (Notion Inbox rows) plus the sensitive items held back; re-indexes the vault | 2026-09-14 02:34 | **ok** |
| `fabric-deck-sync` | `5 7-21/2 * * *` — every 2 h at :05, 7 AM–9 PM | Counts every store (Second Brain rows, vault notes, Jarvis docs, graph nodes, Ruflo entries) into the deck's knowledge-fabric tiles | 2026-09-21 19:58 | **working, logged `error`** — `knowledgeFabric.syncedAt 2026-09-22T04:05:04Z` matches the 21:05 PT slot exactly. It wrote, then the runner recorded an error |
| `ops-knowledge-graph` | `45 5 * * 0` — Sunday 5:45 AM | Graphs the dashboard export, playbooks, decisions and agent roster into the vault | — | **never run** — confirmed by output: `knowledgeGraph.syncedAt` is still 2026-09-13, through two Sundays |

## The self-improvement pair

| Task | Cron (PT) | Does | Last end | Status |
|---|---|---|---|---|
| `loop-engineering-weekly` | `30 4 * * 6` — Saturday 4:30 AM | The full cycle: nine parallel audit passes, Nadia's disruption brief, the CTO Innovator's feasibility gate, the CPI and Scale logs | — | **never run under the runner** |
| `nightly-self-test` | `0 23 * * *` — 11:00 PM daily | Functional + integration check across every skill, task, agent and connector; self-heals routine breakage | 2026-09-15 23:32 | **error — timeout, exit 124**; no `selfTest` doc exists in `state`, so it has left no output to check against |

## Tasks the brain depends on

| Task | Cron (PT) | Why the brain cares | Status |
|---|---|---|---|
| `vanessa-research-queue` | `30 7-21 * * *` — hourly :30 | Answers queued research (recall level 3) with Perplexity + the AI team | **unproven** — runner says ok 2026-09-21 20:31, but `vanessaResearch.updatedAt` is 2026-09-12. A no-work run writes nothing, so silence here is not failure — and not proof either |
| `local-bridge-queue` | `25 6-21 * * *` — hourly :25 | Runs queued read-only verbs through the local bridge allow-list | **unproven** — runner says ok 2026-09-21 20:25, `localBridgeQueue.updatedAt` is 2026-09-12. Queue-driven: an empty queue writes nothing |
| `toolkit-deck-sync` | `15 6 * * *` — 6:15 AM | Rebuilds `toolkitSnapshot` (tools, agents, skills, tasks, MCP servers) | **working** — `toolkitSnapshot.syncedAt 2026-09-22T13:15:45Z`, its 06:15 PT slot to the second. The `limited`/2026-09-16 record is the stale log, not the task |
| `skills-refresh-weekly` | `0 7 * * 0` — Sunday 7:00 AM | Audits every SKILL.md for bad frontmatter and dead paths | **never run** |
| `steve-twin-sweep` | `55 12 * * 1-5` — weekdays 12:55 PM | Twin work; writes into the vault | **refused** — Bash write to `~/Shearrill-Vault` not allow-listed |
| `r6-weekly-backup` | `0 5 * * 0` — Sunday 5:00 AM | Backs up both stores + redacted config + findings | **superseded** — never run, missed Sep 20. The cloud backup writer below took the Sep 22 backup instead (`backupStatus.lastBackup 2026-09-22`, `verified: true`) |

## The Sunday review gate

`brain-weekly-verify` is the only path by which something the brain learned becomes something the
brain asserts. It presents: what was learned this week, and **what was held back because it was
flagged sensitive**. Steven approves or rejects. Nothing sensitive moves to Notion, to the wiki, or
into the graph without passing through it. If the gate has not run, learnings **queue** — they do not
promote themselves.

## The uptime bound — say it out loud

**Everything on this page is bounded by the Mac being awake and logged in.** `claude-runner` is
headless, but it is still a process on one laptop. If the Mac sleeps, none of this runs, no doc gets
a new stamp, and the deck keeps showing yesterday's numbers with yesterday's timestamp. That is the
single largest availability risk in the brain, and it is why every recall reports the age of what it
returns rather than assuming freshness.

Cloud routines **are** a partial fallback, as of 2026-09-22. The older rule on this page — that an
unattended cloud run's DB write parks on a permission prompt — was true when it was written and is
false now; the write probe settled it (`docs/CLOUD-WRITE-ARCHITECTURE.md`, `cloudWriteProbe` doc,
`"write succeeded unattended"`). Three cloud routines now write the DB with no laptop involved (see
below). Everything **not** in that table is still bounded by the Mac.

## What the weekly loop must check here

Recall hit rate · cache hit % · tokens per answer · **stale-store alerts** (a store whose `builtAt`
or `syncedAt` is older than its own cadence). See `OPTIMIZATION.md`.

## Cloud routines that WRITE — added 2026-09-22

The cloud-write probe (`docs/CLOUD-WRITE-ARCHITECTURE.md`) settled that an unattended cloud routine
can write an artifact database. These run without a laptop and are proven by the documents they
leave, never by their run status — **six writers and one read-only watchdog**:

| Routine | Schedule (UTC) | Writes | Verified — 2026-09-22 13:32 UTC unless the row says otherwise |
| --- | --- | --- | --- |
| Weekly ecosystem backup — cloud writer | Sun 11:00 | `backups/<date>-*`, `backupStatus`, `ciLog` | **working** — ran 09:35Z; `backupStatus.lastBackup 2026-09-22`, `verified: true`, `consecutiveFailures: 0`, 170 + 13 docs; two `weekly-ecosystem-backup — ok` rows in `ciLog` |
| Command Deck ↔ ISA Portal — Pipeline Sync (live, writes) | 04/10/16/22 daily | `reClients`, `pipeline`, `isaGradingScores`, `isaKpiSopActuals`, `isaScorecard` on both stores; `ciLog` | **working** — ran 10:09Z; `reClients` and `pipeline` carry 2 rows each and three `pipeline-sync — ok` rows are in `ciLog`. Note `isaScorecard` is `[]` on both sides — equal, so the sync is honest, but there is nothing in it yet |
| ISA line — reply check & escalation ladder | weekdays 14:30 | `isaLadder`, at most one `isaLine` message and one `twinQueue` item per streak, `ciLog` | **working, bad stamp** — ran 12:59Z; `isaLadder.rung: "halted"`, packet `tw_isa_seat_20260922`, two `isa-ladder — halted` rows in `ciLog`. But `isaLadder.updatedAt` reads `2026-09-22T14:35:00Z` — **an hour in the future** at audit time. The proof-of-life field is wrong; fix it to the real write time |
| Backup verification watchdog | Sun 17:30 | nothing — read-only by design | **not yet due** — created 2026-09-22, no run recorded, first firing Sun 2026-09-27 17:35Z. Unproven, not failing. Its spec's "expected first result" (`lastBackup 2026-09-14`, "if it returns CURRENT the watchdog is wrong") is now stale — the Sep 22 backup is real, so CURRENT will be the correct verdict |
| Feed freshness watchdog | daily 16:12 | `feedFreshness`, one `ciLog` row | **working — proven twice, re-verified 2026-09-23 03:00 UTC.** The earlier reading on this page — no run recorded and no `feedFreshness` document — was true when written and is now false. A run fired 2026-09-23T00:18:51Z and SUCCEEDED in **7 m 04 s**, writing `feedFreshness` v1 and a correctly-shaped `ciLog` row. A second, manual proving run at 02:53:41Z rewrote it (now **v3**, `checkedAt 2026-09-23T02:59:00Z`, `{v:{…}}`), and its `note` correctly diffs against the previous run rather than repeating it. Current verdict: 26 feeds — 19 fresh, 1 late, 4 stale, 2 unknown, 0 missing, no future-dated stamps; **worst is `openrouterFeeds`**, frozen since 2026-09-13 while its own task keeps reporting `ok`. Its 2026-09-22 FAILED run was a dropped run, not a prompt fault — the prompt has never been edited (`created_at` == `updated_at`). See `routines/cloud-routine-repairs.md` §1 |
| Strava wrapper guard | daily 12:47 | `stravaWrapGuard`, and `ciLog` only if it repaired something | **not yet due** — created 2026-09-22T23:27Z, cron `47 12 * * *`, first firing **2026-09-23T12:47Z**. No run recorded and no `stravaWrapGuard` document, which is the correct state for a routine whose first slot has not arrived (checked 02:47 UTC, ~10 h early). It re-wraps `stravaSnapshot` if `strava-daily-sync` writes it bare again at 12:20Z. Check after 12:47Z — if Steven pasted the §1 prompt in time, expect `foundBare:false` / `action:"none-needed"` and no `ciLog` row |

| Real Estate Weekly Brief | Mon 16:30 | `realEstateBrief`, two `ciLog` rows | **rewritten 2026-09-23 and again 2026-09-24 (the retired CRM's name removed; its Composio connection deleted the same day), NOT yet proven.** It used to query **Follow Up Boss**, retired as the CRM on 2026-09-22 — those calls are gone; it now uses only the Google Calendar and Gmail connectors it actually carries, reports the CRM as "not connected", and writes a `realEstateBrief` document plus a started/finish `ciLog` pair. **But its proving run hung** (fired 02:53:50Z, still `PENDING` with no `finished_at` 14 min later, nothing written — not even the "started" row). It hung the same way on 2026-09-21 under the old prompt. With `Rent, Buy, or Wait` these are the **only two routines on the account that have ever produced a run with no `finished_at`**; every other 11-connector routine finishes in 19–58 s. Left enabled: it has never been seen on a true natural slot. **Check 2026-09-28T16:37Z** — nothing in `ciLog` means a third hang, and then it should be disabled. `routines/cloud-routine-repairs.md` §4 |

The old web-created "Pipeline Sync" routine (`trig_018BSAYiYzvtyaUkpAY4SnqE`) reports success and
writes nothing; an agent cannot disable it. It fired again at 13:08Z today and reported SUCCEEDED.
**Steven turns it off** at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE.

## Runs, reports success, writes nothing — say it here, not in green

The register's rule: **a routine is proven by the documents it leaves, never by its run status.**
These are the ones that pass their own status check and fail that test.

| Thing | Schedule | Should write | The document actually says | Verdict |
| --- | --- | --- | --- | --- |
| `r8-apple-health-snapshot` | `10 5,21 * * *` PT | `appleHealth` | newest source row ends `2026-09-13 00:00:00` — 9 days stale across ~18 slots | **lying** — live `runnerStatus` says `lastStatus "ok"`, `lastEnd 2026-09-22T05:12:04`. It is **not** erroring as recorded here before; it reports ok twice a day and writes nothing, which is worse. Retire it — `routines/mac-task-repairs.md` §3 |
| `health-full-analysis` | `25 5 * * *` PT | `healthAnalysis` | `generatedAt 2026-09-13T01:08:00Z` | **silent** — nothing to analyse while `appleHealth` is frozen. Also reports `ok`, `lastEnd 2026-09-22T05:32:45` |
| `r4-quantvue-sync` | `20 23 * * 1-5` PT | **`strategySnapshot`** — not a separate QuantVue doc | `syncedAt 2026-09-16T03:26:59Z` | **refused, not silent** — live `runnerStatus` says `lastStatus "refused"`, `lastEnd 2026-09-22T01:19:43`. It runs on schedule and a tool or path is denied. `mac-task-descriptions.md:40` names `strategySnapshot` as its output; a 173-doc listing confirms no separate QuantVue doc was ever expected. §4 |
| Strategy cycle — `trig_011CXFHCT3hou6uaCfb5rWkC` | weekdays 22:00 UTC | `strategySnapshot` | `syncedAt 2026-09-16T03:26:59Z` | **lying** — SUCCEEDED 2026-09-21T22:03:34Z and moved nothing. Its own prompt: *"Your only job is to fetch real data and report it … FINAL MESSAGE ONLY"*. No write step exists in it. `http_api`, so **only Steven can edit it**. Corrected prompt in §5 |
| `strava-daily-sync` | `20 5 * * *` PT (= 12:20 UTC) | `stravaSnapshot` as `{v:…}` | wrote it **bare** at 12:32 UTC today, no `v` wrapper — repaired by hand the same afternoon | **corrupting** — see below |
| Old "Pipeline Sync" (`trig_018BS…`) | 01/07/13/19 UTC | nothing (research-only prompt) | green row, no document ever moved | **lying** — only Steven can disable it. Disable retried and refused again 2026-09-22 (`created_via http_api`); fired 13:08:44Z, SUCCEEDED, moved nothing. Third confirmation |

### Nine routines that were not running — one cause, not nine, and the free test has now passed

Separate from the table above, which is about routines that run and write nothing. These nine never
reach their prompt. Four `http_api` FAILED in **5.5–6.0 s**, three `meta_mcp` FAILED in
**9.6–10.5 s**, and two ABANDONED runs have no `finished_at` at all. Routines with different
prompts, tools and targets cannot coincidentally die at the same point in their lifecycle, and the
three `meta_mcp` ones have Monday, Tuesday and Wednesday crons yet all last ran on Friday 2026-09-18
within two hours of each other. Everything that fired on 2026-09-22 succeeded and ran for 1 m 36 s
to 8 m 47 s, so the platform is healthy now. **Do not rewrite nine prompts** — the next natural
firing is the free test. Full timing table, the two genuine latent defects, and the four links only
Steven can use: `routines/mac-task-repairs.md` §7.

> **Resolved 2026-09-23 by R1 — the free test ran, and the diagnosis held.** `Project Risk Review`
> fired on its own Tuesday slot at 2026-09-22T18:07:22Z and **SUCCEEDED**, and the feed-freshness
> watchdog went FAILED → SUCCEEDED on a prompt that has never been edited. Both confirm the failures
> never reached a prompt. Two of the `meta_mcp` routines were nonetheless **disabled** — not for
> failing, but because `Books Reconciliation Reminder` and `Ops Issue Review` are stock templates
> reading a `/home/claude/vault` that does not exist, and are report-only so even a perfect run
> leaves nothing. `Real Estate Weekly Brief` was **rewritten**: it was querying Follow Up Boss, which
> Steven retired on 2026-09-22, and it now uses only the Calendar and Gmail connectors it actually
> carries and leaves a `realEstateBrief` document plus a `ciLog` trace. The seven `http_api` ones are
> still Steven's alone and still untouched. **One correction to §7 of that file:** its conclusion that
> an agent-created routine "stores no MCP connectors" is not true of this batch — connectors are
> inherited from the session that created the routine, and `Real Estate Weekly Brief` has eleven.
> Full write-up, per routine, with what proves each: **`routines/cloud-routine-repairs.md`**.

### The `stravaSnapshot` writer — P1, open

Every doc in `state` is `{v:<value>}`. `strava-daily-sync` writes the body bare
(`{activities, syncedAt, via}`), which the page's reader tolerates and nothing else does. It was
repaired to `{v:{…}}` on 2026-09-22 (now version 9, re-read 14:05 UTC — still correct) and **will be
re-broken on the next 05:20 PT run**. That run is **2026-09-23 12:20 UTC, and it is a deadline**: the
corrected prompt is written out ready to paste in `routines/mac-task-repairs.md` §1, and if it is not
pasted before then the repair is lost and the cycle repeats. The task prompt lives on the Mac, so
only Steven can apply it; the repo-side specs that told agents the bare shape was correct have been
corrected. A 172-doc sweep of `state` on 2026-09-22
found exactly one other malformed doc: `marketingQueue`, which carries both `v` (3 rows, live) and
an orphaned `data.v` (2 rows, frozen 2026-09-15) — a writer that passed the API envelope as the
document body.

### The standing check this needs

A bare-value write is invisible: the deck renders, nothing throws, and it rots quietly. The cheapest
detector is already running and was simply calibrated to expect the bug — the weekly
`ai-ecosystem-backup` integrity step and the `stress-test-sweep` BackupRecovery step both count
"docs missing `v`". Both now expect **zero** and name any offender. For same-day coverage, the
**Pipeline Sync (live, writes)** routine already reads the DB four times a day: one extra `list` of
`state` and an assertion that every doc's top level is a single `v` key would catch a bare write
within 6 hours and cost one read. **That change is Steven's to make — an agent may not edit a
routine.**
