# L5 — Always-on

What keeps the brain current while nobody is watching. Everything here runs under **`claude-runner`**
on the Mac (headless, pre-approved tools, 60 tasks).

**Status source:** the `runnerStatus` doc, `syncedAt 2026-09-22T04:05:04Z`. Crons are Mac local (PT).
"Last end" is the last completion the runner recorded — **not** proof that today's slot ran.

> **`runnerStatus` itself is stale, and it understates the runner.** Its newest entry is
> 2026-09-21 21:05 PT, yet `vanessa-discord-inbox` runs every 5 minutes — so the doc stopped being
> written ~9.5 h before this audit, not the runner. Two documents prove the runner ran **today**:
> `toolkitSnapshot` stamped `2026-09-22T13:15:45Z` against `toolkit-deck-sync`'s 06:15 PT slot
> (= 13:15 UTC, exact), and `knowledgeFabric` stamped `04:05:04Z` against `fabric-deck-sync`'s
> 21:05 PT slot. Both tasks are marked `limited` / `error` below from a Sep 16–17 log.
> **Read every "Last end" in this file as a floor, never as the truth.** Audited 2026-09-22 13:32 UTC.

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
leave, never by their run status — three writers and one read-only watchdog:

| Routine | Schedule (UTC) | Writes | Verified 2026-09-22 13:32 UTC |
| --- | --- | --- | --- |
| Weekly ecosystem backup — cloud writer | Sun 11:00 | `backups/<date>-*`, `backupStatus`, `ciLog` | **working** — ran 09:35Z; `backupStatus.lastBackup 2026-09-22`, `verified: true`, `consecutiveFailures: 0`, 170 + 13 docs; two `weekly-ecosystem-backup — ok` rows in `ciLog` |
| Command Deck ↔ ISA Portal — Pipeline Sync (live, writes) | 04/10/16/22 daily | `reClients`, `pipeline`, `isaGradingScores`, `isaKpiSopActuals`, `isaScorecard` on both stores; `ciLog` | **working** — ran 10:09Z; `reClients` and `pipeline` carry 2 rows each and three `pipeline-sync — ok` rows are in `ciLog`. Note `isaScorecard` is `[]` on both sides — equal, so the sync is honest, but there is nothing in it yet |
| ISA line — reply check & escalation ladder | weekdays 14:30 | `isaLadder`, at most one `isaLine` message and one `twinQueue` item per streak, `ciLog` | **working, bad stamp** — ran 12:59Z; `isaLadder.rung: "halted"`, packet `tw_isa_seat_20260922`, two `isa-ladder — halted` rows in `ciLog`. But `isaLadder.updatedAt` reads `2026-09-22T14:35:00Z` — **an hour in the future** at audit time. The proof-of-life field is wrong; fix it to the real write time |
| Backup verification watchdog | Sun 17:30 | nothing — read-only by design | **not yet due** — created 2026-09-22, no run recorded, first firing Sun 2026-09-27 17:35Z. Unproven, not failing. Its spec's "expected first result" (`lastBackup 2026-09-14`, "if it returns CURRENT the watchdog is wrong") is now stale — the Sep 22 backup is real, so CURRENT will be the correct verdict |

The old web-created "Pipeline Sync" routine (`trig_018BSAYiYzvtyaUkpAY4SnqE`) reports success and
writes nothing; an agent cannot disable it. It fired again at 13:08Z today and reported SUCCEEDED.
**Steven turns it off** at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE.

## Runs, reports success, writes nothing — say it here, not in green

The register's rule: **a routine is proven by the documents it leaves, never by its run status.**
These are the ones that pass their own status check and fail that test.

| Thing | Schedule | Should write | The document actually says | Verdict |
| --- | --- | --- | --- | --- |
| `r8-apple-health-snapshot` | `10 5,21 * * *` PT | `appleHealth` | `syncedAt 2026-09-13T23:15:59Z` — 9 days stale across ~18 slots | **lying** — runs, ingest daemon is down, writes nothing. Known since 2026-09-17 |
| `health-full-analysis` | `25 5 * * *` PT | `healthAnalysis` | `generatedAt 2026-09-13T01:08:00Z` | **silent** — nothing to analyse while `appleHealth` is frozen |
| `r4-quantvue-sync` | `20 23 * * 1-5` PT | a QuantVue doc | **no such doc exists in `state`** — nothing to check it against | **silent** since 2026-09-16 |
| Strategy cycle | weekly | `strategySnapshot` | `syncedAt 2026-09-16T03:26:59Z` | **silent** — four runs missed |
| `strava-daily-sync` | `20 5 * * *` PT (= 12:20 UTC) | `stravaSnapshot` as `{v:…}` | wrote it **bare** at 12:32 UTC today, no `v` wrapper — repaired by hand the same afternoon | **corrupting** — see below |
| Old "Pipeline Sync" (`trig_018BS…`) | 01/07/13/19 UTC | nothing (research-only prompt) | green row, no document ever moved | **lying** — only Steven can disable it |

### The `stravaSnapshot` writer — P1, open

Every doc in `state` is `{v:<value>}`. `strava-daily-sync` writes the body bare
(`{activities, syncedAt, via}`), which the page's reader tolerates and nothing else does. It was
repaired to `{v:{…}}` on 2026-09-22 (now version 9) and **will be re-broken on the next 05:20 PT
run**. The task prompt lives on the Mac, so only Steven can fix it; the repo-side specs that told
agents the bare shape was correct have been corrected. A 172-doc sweep of `state` on 2026-09-22
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
