# What runs when: schedule, automation map, routine budget, Steven's steps

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `10-always-on-and-automation`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: always-on/README.md -->
# FILE: always-on/README.md

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
| `brain-maintenance` | daily `0 6 * * *`; weekly check `30 15 * * 0` — Sun 3:30 PM, **before** `brain-weekly-verify`'s 4:00 PM gate | **Daily:** `scripts/brain-sync.sh --quiet` — pulls the repo, `bin/brain reindex`/`doctor`, keeps `bin/brain` on PATH and this Mac's skills linked. **Weekly (Sun 3:30 PM):** `bin/brain doctor` + `bin/brain bench --write` (writes/refreshes `docs/reports/BRAIN-BENCH.md`), and flags any regression (tokens-per-answer up, correctness down, "not in brain" rate up) for the 4:00 PM gate to carry. **Also weekly:** scans `memory.md` for lines older than 90 days and **flags** them as stale/duplicate candidates in a proposal list — it never deletes or edits `memory.md` itself | — | **new — never run**. `bin/brain` is in this checkout since 2026-10-08 (merged from the side branch it was built on; doctor PASS, bench 16/18 in the cloud). Install on the Mac with `integrations/mac-brain-2026-10-08.md` |

## The self-improvement pair

| Task | Cron (PT) | Does | Last end | Status |
|---|---|---|---|---|
| `loop-engineering-weekly` | `30 4 * * 6` — Saturday 4:30 AM | The full cycle: nine parallel audit passes, Nadia's disruption brief, the CTO Innovator's feasibility gate, the CPI and Scale logs | — | **never run under the runner** |
| `nightly-self-test` | `0 23 * * *` — 11:00 PM daily | Functional + integration check across every skill, task, agent and connector; self-heals routine breakage | 2026-09-15 23:32 | **error — timeout, exit 124**; no `selfTest` doc exists in `state`, so it has left no output to check against |

## Proposed additions to the loop — NOT scheduled, 2026-09-28

Three lines this round is handing to the integrator/Steven, not installing. **None of these run
anywhere yet.** Say so plainly until one of them has a `runnerStatus` line of its own.

| Task (proposed) | Cron (PT), proposed | Would do | Status |
|---|---|---|---|
| `prompt-master` step, inside `loop-engineering-weekly` | `30 4 * * 6` — same Saturday 4:30 AM slot, not a new cron | Once per loop cycle, reviews the orchestrator's and executives' system prompts against that cycle's measured outcomes (runs, failures, rework, escalations) and proposes at most 5 prompt diffs through the weekly-self-update human gate — never edits a live prompt itself. Per `.claude/skills/prompt-master/SKILL.md` | **PROPOSED — not scheduled.** `loop-engineering-weekly` itself has never run under the runner (above), so a step inside it has nothing to run inside yet |
| `interview-me` (weekly, one topic) | `0 8 * * 0` — Sunday 8:00 AM, proposed to land ahead of the 4:00 PM review gate | Prompts Steven for one week's "Grill Me" topic; the resulting vault note and knowledge-graph entity stubs are exactly the kind of learned item `brain-weekly-verify` holds for Sunday review before anything promotes — this is the **main deliberate feed** for L4, named but not scheduled in `knowledge-graph/README.md` | **PROPOSED — not scheduled.** `interview-me` is in `.claude/skills/` (enabled for any session here) but has no cron anywhere, and `MAC-SETUP.sh` does not install it as a task (see `docs/NEEDS-STEVEN.md` hand-back row) |
| Laya router weekly accuracy check | `0 5 * * 6` — Saturday 5:00 AM, proposed to land after `loop-engineering-weekly`'s 4:30 AM start | Runs `integrations/laya/laya_route.py --engine real --batch integrations/laya/sample-requests.jsonl` — the same 20-request, 16-class holdout this round proved the harness against in `--engine stub` (see `integrations/laya/README.md`) — scores each `brain_route` decision against the row's own `expected_class`, and writes accuracy + latency into whatever doc `loop-engineering-weekly` reads for "tokens per answer" (`OPTIMIZATION.md`) | **PROPOSED — not scheduled, and cannot run for real yet: `--engine real` needs a Hugging Face checkpoint this sandbox cannot reach** (`integrations/laya/README.md`). The holdout file exists now so this check has something to run against the day it is installed |

## Tasks the brain depends on

| Task | Cron (PT) | Why the brain cares | Status |
|---|---|---|---|
| `vanessa-research-queue` | `30 7-21 * * *` — hourly :30 | Answers queued research (recall level 3) with Claude WebSearch + the AI team (Perplexity removed 2026-10-05; the task's own Mac prompt switches to Claude-only research with Steven's 2026-10-05 Mac paste — `integrations/mac-claude-only.md`) | **unproven** — runner says ok 2026-09-21 20:31, but `vanessaResearch.updatedAt` is 2026-09-12. A no-work run writes nothing, so silence here is not failure — and not proof either |
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

**`brain-maintenance`'s weekly pass feeds this same gate, on the same self-cleaning-with-a-human-gate
rule.** It runs *before* `brain-weekly-verify` (3:30 PM vs. 4:00 PM) so its findings — the doctor/bench
regressions and the memory.md staleness list — are already sitting there when the 4:00 PM review opens.
"The brain cleans itself" here means it **proposes**, never that it acts: a `memory.md` line older than
90 days is flagged as a dedupe/stale candidate in a list Steven reads at the Sunday review — it is never
edited, reordered or removed by the task itself. Nothing in the brain auto-ingests and nothing in it
auto-deletes; every promotion and every removal is Steven's decision, made at this gate.

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

## Added 2026-10-22 — the push-button schedule (cloud, Pacific time)

| When | What | Writes | Reads |
|---|---|---|---|
| 3:30 AM daily | 6D Brain rebuild + republish (this session) | brain-4d.html, INDEX, reports | repo |
| 6:05 AM weekdays | Transaction & Showing desk | tcDesk, twinQueue | tcDeals, showings, calendar |
| 6:25 AM weekdays | Vanessa's Chief-of-Staff cycle — works `vanessaQueue` first, ≤8 pod squads in parallel | cosBrief, vanessaQueue, twinQueue, ISA `isaToday` | the deck + ISA `vanessaOutbox` |
| 6:34 AM daily | Morning brief across the three dashboards — push + `morningBrief {text, voiceScript}` | morningBrief, morningBriefStatus | cosBrief, tcDesk, inboxDesk, ISA Portal |
| 6:40 AM daily (Mac) | iMessage text of that brief + Vanessa's voice note (`mac-task-specs` §8/§8b) | — | morningBrief |
| 3:30 AM daily | 6D Brain rebuild + republish (reindex, loop, toolkit, layers, build, merge-live, publish, proof row) | brain6dStatus, dashboard/brain-4d.html, docs/reports/LAYERS.md | the repo tree, the live 6D page |
| 7:20 AM Mon | Refi watch — prep list vs the market average (never a quote) | refiWatchDesk, vanessaQueue | ratesSnapshot, refiWatchList | Test-fired 2026-10-22 23:14 UTC: wrote refiWatchDesk (listSize 0, market average as of 2026-10-22) and one pending vanessaQueue item; refiWatch untouched. |
| 7:40 AM, 11th monthly | Sphere & past-client touches — drafts + ISA call list | sphereTouches, marketingQueue, vanessaQueue | sphereList, liveFeeds market notes |
| 8:40 AM daily (15:40 UTC) | Freshness sweep — per-key cadence (8 d / 4 d / 80 h / 26 h) + ISA mirror | liveFeeds, feedFreshness, ISA ratesSnapshot/liveFeeds | — |
| Sun 2:07 PM (21:07 UTC) | Weekly backup, verified; watchdog 4:41 PM | backups/, backupStatus | both stores |
| On a button | Run the cycle now · Triage my inbox · Recap my meetings · Draft follow-ups · Text me the brief (Command Deck; Gmail/Fieldy/Zoom/Inkbox as the viewer) | inboxDesk, twinQueue, vanessaQueue | — |
| Pabbly (no Claude usage) | Kapso inbound → Notion; workflows 1–11 in `integrations/pabbly/WORKFLOWS.md` | Notion, Gmail drafts, Calendar tasks | Lofty, Zoho, Gmail, Kapso |


---

<!-- source file: docs/AUTOMATION-MAP-2026-10-20.md -->
# FILE: docs/AUTOMATION-MAP-2026-10-20.md

# Automation map — who does what on the Command Deck (2026-10-20)

Steven, 2026-10-20: *"AI, automation workflows, systems, tools, resources, AI twin Steve, Vanessa and the human
ISA/EA are handling 80% of everything, leaving me to only do 20% of actions requiring me to personally do…
Vanessa as the Chief of Staff orchestrator for everything… Vanessa is supposed to send me morning text and
verbal iMessages with the daily morning brief."*

This file is the map: every panel of the Command Deck, who owns keeping it alive, what mechanism does the work,
and the one residual thing that is genuinely Steven's. Owners: **Routine** (claude.ai cloud routine), **Mac**
(claude-runner task on the Mac), **Vanessa** (the daily Chief-of-Staff cycle, cloud), **Steve** (digital twin
sweep, Mac), **ISA/EA** (human, Mon–Fri 12–4 PM PT), **Steven** (licensed decisions, money, credentials,
sign-ins — the HALT list in `CLAUDE.md`).

## What changed today

| Change | Where | Status |
|---|---|---|
| **Vanessa — Chief of Staff daily cycle** (weekdays 6:25 AM PT): reads the backlog (`twinQueue`, kanban, ISA line, leads, marketing queue, calendar, freshness, runner), sorts every item into Automation / AI team / ISA-EA / Steven, dispatches ≤8 cross-functional squads in parallel (Victor+Alexandra for a lead draft, Marcus for deadlines, Sofia for content, Derek for automation health, Elena for fraud smell), QA's each result, writes `cosBrief` (≤3 Needs-Steven items, drafts, ISA instructions, the 80/20 split) and `twinQueue` packets. | routine `trig_019whypw6EeNu2G8xxY5xE5N` | **live**, first run Tue 2026-10-21 13:25 UTC |
| **Morning brief** (6:48 AM PT) now reads `cosBrief` first: "Needs you" is the cycle's ≤3 items, "Handled for you" is the split, and it says plainly when the Mac has been silent. Push to the Claude app every day; writes `morningBriefStatus`. | routine `trig_01Q9VPMwrKwNUW3kZL54rKgy` (prompt updated) | **live** |
| **Morning voice note** in Vanessa's recorded voice, on the same iMessage thread as her morning text — a one-paragraph amendment to the Mac task `vanessa-morning-brief-text` so it queues a spoken lead-in after the text; `voice-reply-render` + `vanessa-voice-send.py` already do the rest. | `integrations/mac-task-specs.md` §7 (paste-ready) | **spec written; Steven pastes it** (Action Desk step) |
| **Transaction & Showing desk** (weekdays 6:05 AM PT since 2026-10-22, before the 6:25 cycle; added 2026-10-22): the transaction coordinator builds each open deal's timeline from the dates in `tcDeals` (never assumed), the document checklist, due-in-7-days and overdue items, and client/escrow/lender/co-op reminder drafts; the showing assistant writes prep, route order, ShowingTime/Showami confirmation drafts and a feedback form for every showing; Alexandra's line on each draft; writes `tcDesk`, ISA instructions, ≤3 Needs-Steven packets. The daily cycle folds `tcDesk` into its 80/20 split. | routine `trig_011iofWVNizNQ1SNujNcp5tL` | **live**, first run 2026-10-22 14:10 UTC |
| **Refi watch** (Mondays 7:20 AM PT, added 2026-10-22): compares `refiWatchList` (Steven's own list: first name, note rate, loan type, month closed) to the market averages in `ratesSnapshot`, flags "worth a conversation" at 0.75 pts or more, writes `refiWatchDesk` (never the older hand-entered `refiWatch` list) and queues a call-outline task per flag in `vanessaQueue`; never a quote, never eligibility, never a savings figure. | routine `trig_014ipr6x9z35psmtHJCPVqj1` | **live**, first run 2026-10-26 |
| **Sphere & past-client touches** (11th monthly, 7:40 AM PT, added 2026-10-22): market-note drafts per city from the housing feeds, birthday/anniversary notes from `sphereList`, 90-day check-ins, an ISA call list; writes `sphereTouches` + `marketingQueue` drafts; Alexandra's line on every draft; nothing sent. | routine `trig_01Pn8xLNKTVVFYjYTj8d8JTd` | **live**, first run 2026-11-11 |
| **Pabbly — Kapso WhatsApp custom app**: plan recorded on Steven's "yes build the kapso connection" (2026-10-22): triggers New Inbound WhatsApp Message, New Conversation; actions Send WhatsApp Message, List Phone Numbers; Check Auth built against `/platform/v1/whatsapp/phone_numbers` (Kapso answered 401 to an anonymous call — the header and host are right). | Pabbly Integration Builder | **waiting on Steven's Kapso key** on Pabbly's secure connection page |
| Routine budget: +5 runs/week (the cycle), 0 for the brief. About 144 runs/week. | `docs/ROUTINE-BUDGET-2026-10-09.md` baseline 139 | — |

The cloud cannot send an iMessage from a routine: routines created by an agent carry no connectors (the API
said so when these were created). So the **text and the voice note stay Mac-side**, where they already exist
(`vanessa-morning-brief-text` 6:40 AM PT, `voice-reply-render` every 10 min, Inkbox iMessage); the cloud push
is the guaranteed fallback. **Both were last seen working 2026-10-13** — see the first row below.

## The one thing blocking most of the 80%

`runnerStatus.syncedAt` on the live deck is **2026-10-13 07:13 UTC** (read 2026-10-20). The Mac runner has not
reported for seven days, so every Mac-owned document is stale: the iMessage morning text, the voice note, Lofty
sync, calendar, rates, QuantVue strategy, Steve's twin sweep, the ISA comms bridge, the research queue, the
iMessage inbox. Nothing in the cloud can wake it. **Steven: wake the Mac, open Terminal, run `runnerctl status`,
paste the last lines to Claude.** Until then the cloud routines carry the deck (feeds, market, pipeline sync,
weather when the connector loads) and the morning brief says "the Mac has been silent since Oct 13".

## Panel by panel

Owner column = who keeps it current. "Residual" = the only part that stays Steven's. Writers are the names in
`docs/inventory/mac-task-descriptions.md` and `docs/inventory/cloud-routines.md`; freshness verdicts are the
live `feedFreshness` document of 2026-10-20 15:41 UTC (17 fresh · 8 stale, all Mac-side or weather).

| # | Panel | Owner | Mechanism | Residual for Steven |
|---|---|---|---|---|
| 0 | Vanessa — Chief of Staff (pinned) | **Vanessa** | Daily cycle (cloud, weekdays) + `vanessa-sweep` (Mac, 3×/day) + research queue (Mac, hourly) + iMessage/WhatsApp inbox (Mac, 10 min). Chat card is live. | Answer the ≤3 "Needs you" lines |
| 1 | Morning Brief | Routine + Mac | Cloud push 6:48 AM; Mac text 6:40 AM; voice note after §7 paste; feeds 13:05 UTC; freshness sweep 03:40/15:40 UTC | Read it |
| 2 | News — global & local | Routine | Morning feeds + freshness sweep (local-news keys refill when searches find dated stories) | — |
| 3 | Apex — trade mentor | Steven | Persona chat on demand | Ask |
| 4 | QuantVue — NQ bot | Mac + Routine | `r4-quantvue-sync` (strategy), market-close writer (cloud, weekdays 21:20 UTC), Econoday (cloud), `r17-trading-day-log` | Daily-loss inputs (his trading) |
| 5 | AI Hedge Fund Team | Routine | Monday remote run reads `hfRequest` | Type the ticker |
| 6 | OpenTerminal | Mac | `openterminal-remote-queue` | — |
| 7 | Mortgage, Lending & RE Tools | Routine + Steven | Pipeline Sync (cloud, weekdays 15/20/23 UTC) writes pipeline/reClients; Zoho stays red until the API permission | **Zoho: tick "Zoho CRM API Access"** (STEVEN-STEPS 15) |
| 8 | James — wealth mentor | Steven | Persona chat | Ask |
| 9 | Personal Accounts & Investments | Steven | Manual; Plaid declined by default | Type balances, or say "Plaid yes" |
| 10 | Tax & Compliance | Steven + Marcus | Manual inputs; Alan (tax deadlines) drafts the calendar through the cycle | Type the figures |
| 11 | Appointments & Tasks | Routine + Mac | Calendar refresh (cloud 03/15 UTC) + `calendar-daily-sync`; `r13-appointment-prep` an hour before each meeting | Attend |
| 12 | PTO Optimization | Steven | Static planner | — |
| 13 | E3R APM Support | Steven | Static; RoleCompass daily (cloud) feeds the job hunt separately | — |
| 14 | Kevin — standards mentor | Steven | Persona chat | Ask |
| 15 | Health & Wellness | Phone + Mac | Apple Health via the Claude iOS app → Notion → `health-notion-sync`; Strava daily (Mac) + cloud refresh; `health-full-analysis` | **Say "update my health stats in Notion" on the iPhone; re-sign-in Strava** |
| 16 | Mind — USC | Routine | R19 USC planner (Sun evening) | Study |
| 17 | Family Office | Steven + James | Manual; James drafts reviews on request | Decide |
| 18 | Tools & Notebooks | Mac | `weekly-self-update` (never run under the runner) | — |
| 19 | Showings | Routine + Mac + ISA | Transaction & Showing desk (weekdays): prep, route, confirmation drafts, feedback form; `showing-sync` 3×/day from Lofty appointments; ISA sends confirmations | **Sign in once to ShowingTime / Showami** (step 14) |
| 20 | Virtual EA / ISA Operations | Routine + Mac + ISA | Pipeline Sync (KPI docs), `lead-triage-daily`, `lofty-crm-sync`, `r2-lead-response-watchdog`, `r11-isa-kpi-compile`; the cycle writes `cosBrief.isaInstructions` for the 12 PM huddle | Fill the ISA seat (open packet since 2026-09-22) |
| 21 | AI Employees & Digital Twin | Vanessa + Steve + Mac | Daily cycle writes `twinQueue`/`vanessaRuns`/`vanessaLog`; `steve-twin-sweep` weekdays; `fabric-deck-sync`, `brain-deck-sync`, `toolkit-deck-sync`; ISA ladder (cloud) | Answer packets |
| 22 | Master Plan | Steven | Manual | Edit |
| 23 | Loyalty & Credit Cards | Routine | Elite Rewards scan (Mon), R18 credits & deadlines (1st/15th) | Act on a deadline |
| 24 | Road to a Million | Steven + Marcus | Manual GCI inputs; FERS engine annual (cloud) | Type deals |
| 25 | Nonprofit & Future Ventures | Steven + Corinne/Paloma | Manual; grant drafts through the cycle on request | Decide |
| 26 | PE & Defense Innovation | Routine | PE & Defense notes (Mon/Thu), `openrouter-credits-refresh` (Mac) | — |
| 27 | Elite Affluent Tracker | Routine | Weekly (Sun) | — |
| 28 | Next Big Moves | Routine | Opportunity Radar daily, Next Big Moves weekly | Pick a move |
| 29 | Travel & Experiences | Routine | Weekly (Mon) | Book (money = HALT) |
| 30 | Task Board | Vanessa + Steven | The cycle reads cards due within 7 days and assigns them; `r20-weekly-review-local` (Fri) | Move cards |
| 31 | Process Excellence | Mac | `cpi-daily-scan`, `ciLog` from every writer | — |
| 32 | Assets | Steven | Manual | Edit |
| 33 | Marketing & Content | Mac + Routine + Sofia/Alexandra | `r14-content-pipeline` (Tue–Fri), VA avatar drafts (Sun), AI twin autopilot posts only approved items; the cycle gets Alexandra's compliance line on every draft | **Approve or decline each draft** (licensed: his signature) |
| 34 | Dream Future Empire | Steven | Manual | — |
| 35 | Ops Radar | Mac + Routine | `r10-automation-health`, backup writer (Sun), `r2` watchdog | Read |
| 36 | Practice Trackers | Routine + ISA + Victor | Transaction & Showing desk reads the TC intake (`tcDeals`): timelines, checklists, deadline alerts, reminder drafts; ISA enters each new deal's dates from the RPA; `revenue-scan-weekly` / `mortgage-desk-weekly` (Mac, Sun) | Sign; approve client sends |
| 37 | Money Housekeeping | Steven + Grace | Manual subscriptions list; Grace flags anomalies at month-end (`month-end-close-prep`, 28th) | Cancel/keep |
| 38 | Toolkit & Remote Access | Mac | `toolkit-deck-sync`, `fabric-deck-sync` | Paste `rc-agent.sh report` once |
| 39 | Orchestration & Loop Engineering | Routine + Mac | Saturday loop + self-test (cloud), `loop-engineering-weekly`, `cpi-daily-scan`; GitHub `brain-loop` weekly | Switch off the 3 duplicate Sunday loops |
| 40 | Computer Hub | Steven | Paste the two report lines (steps 9–10) | Once |
| 41 | Trading Research Desk | unknown writer | not in any inventory — the cycle's Derek squad flags it | — |

**Count:** 42 panels. 27 have a machine or AI owner today, 9 are Steven-typed data by design (finance, tax,
plans, assets), 6 are mentor chats on demand. The cycle's `cosBrief.split` reports the live 80/20 number every
weekday morning; the target is `stevenShare` ≤ 20% of open items.

## Vanessa as Chief of Staff — how the parallel teams work now

```
06:25 PT  Vanessa daily cycle (cloud)      reads backlog → 4 buckets → ≤8 squads in parallel → QA → cosBrief, twinQueue
06:40 PT  vanessa-morning-brief-text (Mac) texts the brief on iMessage, then queues the spoken lead-in (§7)
06:48 PT  morning brief (cloud)            push to the Claude app; "Needs you" = the cycle's ≤3 items
≤07:00    voice-reply-render (Mac)         renders the lead-in in Vanessa's recorded voice → voice note on the same thread
12:00 PT  ISA/EA huddle                    cosBrief.isaInstructions on the ISA Portal (via Pipeline Sync)
12:35/12:55 PT  vanessa-sweep / steve-twin-sweep (Mac)   work the queues
Fri 16:00 PT  Weekly Ops Review (Steven's routine, Sonnet 5)   Victor · Marcus · Derek · Elena in parallel
Sat        Weekly loop + self-test (cloud)  proposes prompt/routine changes through the human gate
```

Squads are cross-functional by rule: any draft that touches a client, an ad or a disclosure carries Alexandra's
line; anything that smells like fraud goes to Elena; Nadia and Elon only propose. Caps: 8 squads in flight, 4
web-research squads. Models: the cycle runs on the routine's default model; Steven's tiering (Vanessa on Fable,
executives on Opus) applies to attended sessions — raising the routine's model is his call and costs allowance.

## Pabbly Connect

Steven asked (2026-10-20) to "connect to Pabbly Connect MCP to enable automations of workflows of items within my
dashboard". The Pabbly tool here is an *Integration Builder*: it builds a custom Pabbly app (triggers/actions for
one service) inside his Pabbly account; it does not create or run workflows. His account holds zero custom apps.
The deck's data is not reachable by Pabbly today. Decision (R9, 2026-09-28) stands: one owner per system — Zoho
through Composio, Lofty/dotloop through CLI-Anything. Pabbly's place is a system nobody owns yet; he names the
workflow and the service, and the builder path in `integrations/CONNECTIONS.md` §"Pabbly" applies.

## What stays Steven's (the 20%) — the standing list

1. Wake the Mac and run `runnerctl status` (today's blocker).
2. Paste `integrations/mac-task-specs.md` §7 into `vanessa-morning-brief-text`, run `voice-setup.sh` once if not done.
3. Approve/decline marketing drafts; every send to a client; every rate or eligibility answer.
4. Zoho API permission; ShowingTime/Showami/homes.com sign-ins; Strava re-sign-in; Apple Health phone recipe.
5. Switch off the three duplicate Sunday loops (his routines).
6. The open decisions: ISA seat, NMLS number for the Attraction Command Center, LPT DRE/entity, avatar provider.

Everything else is owned above. `docs/STEVEN-STEPS.md` / the Action Desk carry these as numbered steps.


---

<!-- source file: docs/ROUTINE-BUDGET-2026-10-09.md -->
# FILE: docs/ROUTINE-BUDGET-2026-10-09.md

# Routine budget — 2026-10-09

Steven: "ensure all sections of the dashboards that require updates are on routines and nothing is stale and
working efficiently and updated reasonably without burning all of my tokens."

## What was wrong

25 of 49 enabled cloud routines had failed their last run with **USAGE_LIMIT_REACHED** — the weekly Claude allowance
was spent. Scheduled routines were firing about **199 times a week**; 35 of those runs were on Opus 5.5.
Several daily writers fed cards that the deck itself treats as fresh for 8 days (`staleHrs: 192`).

## Freshness (computed in code, 2026-10-09 ~18:30 UTC, `scripts/feed_freshness.py`)

17 fresh · 2 late (weather, news — the 13:35 run hit the usage limit) · 3 stale, all waiting on Steven
(appleHealth: phone recipe; zohoSync: Zoho permission; knowledgeGraph: Mac task never run) · 1 waiting
(healthNotionSync) · 2 with no standard stamp (leadTriage, vanessaBrief carry `ranAt`).

## Changes made (each reversible; old schedule shown)

| Routine | Was | Now | Runs/week |
|---|---|---|---|
| Elite Rewards scan note | `56 12 * * *` | `56 12 * * 1` | 7 → 1 |
| PE & Defense notes | `47 13 * * *` | `47 13 * * 1,4` | 7 → 2 |
| Builder incentives note | `53 13 * * *` | `53 13 * * 3` | 7 → 1 |
| Top performers note (market-close recap) | `26 13 * * *` | `26 13 * * 2-6` (after each weekday close) | 7 → 5 |
| Scrape queue runner (jobs are Daily/Weekly with a 20 h window) | `7 9,13,17 * * *` PT | `7 9 * * *` PT | 21 → 7 |
| Pipeline sync, Deck ↔ ISA (ISA works Mon–Fri 12–4 PT) | `0 4,10,16,22 * * *` | `0 15,20,23 * * 1-5` | 28 → 15 |
| AI twin autopilot (Opus) | `57 7,17 * * *` PT | `57 7 * * *` PT | 14 → 7 |
| Morning feeds (now always the full morning run) | `20 0,12 * * *` | `20 12 * * *` | 14 → 7 |

**About 199 → 139 runs a week (−30%).** Command Deck v186 moved two "stale" thresholds to match: Opportunity radar
18 → 30 h, Top performers 30 → 80 h (covers the weekend). Nothing else on the page changed.

## Needs Steven (agents cannot change routines he created)

Switch off three duplicate Sunday loops; each reads the whole 4.5 MB deck, and Saturday's
"Weekly Loop Engineering + Self-Test" plus the free GitHub `brain-loop` check already cover them:
- https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY (Weekly Loop Engineering QA, Sun 16:00)
- https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX (weekly improvement loop, Sun 16:00)
- https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX (weekly self-improvement loop, Sun 15:00)

Optional, his call (a model change is his decision): move the daily Opus routines — AI twin autopilot, Attraction
Command Center, RoleCompass — to Sonnet. They follow fixed checklists; that is about 19 Opus runs a week.

## Model change — Steven approved ("yes, Sonnet", 2026-10-09)

AI twin autopilot, Attraction Command Center daily run and RoleCompass daily job hunt moved from `claude-opus-5-5`
to `claude-sonnet-5-5`. Schedules and prompts unchanged. Opus runs a week: about 28 → 9 (only the Gridiron Codex
sports routines, the monthly refreshes and the weekly Rent/Buy/Wait refresh stay on Opus). To undo, set the model
back to `claude-opus-5-5` on each routine.

Found while doing this, not changed: the Attraction Command Center prompt gives Patriot Pacific's NMLS as 1952360,
while the brain and the deck use 1921615 (company). Ads must carry the right NMLS ID; Steven confirms which is right.

## Follow-ups (2026-10-09, later)

- Allowance: `seven_day`, status `allowed_warning`, resets 2026-10-11 20:00 UTC. Cloud routines will keep failing on the
  limit until then; nothing to fire before it.
- The post-reset reminder no longer asks Steven to switch the hourly ISA comms bridge back on (it would add ~168 runs a
  week; Pipeline Sync replaced it). It now only nudges about the three duplicate Sunday loops, and only if still on.
- The missed-monthly re-run check-in now fires four per wake and re-arms daily (two wakes, not four), with no repo reading.
- `scripts/feed_freshness.py` reads `ranAt`: 19 fresh · 2 late · 3 stale (waiting on Steven) · 1 waiting · 0 unknown.
- Biggest single user of the allowance is long working conversations on Opus (this one). New work starts best in a
  fresh session.


---

<!-- source file: docs/ROUTINE-BUDGET-2026-10-22.md -->
# FILE: docs/ROUTINE-BUDGET-2026-10-22.md

# Routine budget — 2026-10-22

Steven (2026-10-22): "streamline efficiencies… fix anything not working." The weekly Claude allowance is the
binding limit: 14 routines failed on `USAGE_LIMIT_REACHED` this month (the allowance resets about Sunday 20:00 UTC).
The 2026-10-09 cuts (`docs/ROUTINE-BUDGET-2026-10-09.md`) had come undone: the five research-note writers were back
to daily (changed 2026-10-12), and the freshness sweep re-researched any key older than 26 hours.

## Runs per week (scheduled cloud routines, enabled, as listed 2026-10-22 ~14:30 UTC)

| | Runs/week |
|---|---|
| Before (54 recurring routines; monthlies counted as 0.23/week) | **≈ 202** |
| After the changes below | **≈ 133 (−34%)** |
| After Steven also does the "Steven only" list below | **≈ 127 (−37%)** |

Opus runs a week are unchanged (about 9 plus the monthlies). See the model note at the end.

## Changed (all routines created via `meta_mcp`; each reversible: set the old schedule back or `enabled=true`)

| Routine | Id | Old schedule | New schedule / state | Runs/wk | Why |
|---|---|---|---|---|---|
| Elite Rewards scan note (writer) | trig_017E4o86FsKSBpyzp9VonXG8 | `56 12 * * *` | `56 12 * * 1` (Mon); renamed "weekly Mon" | 7 → 1 | Back to the 10-09 budget; the card is weekly material |
| PE & Defense notes (writer) | trig_01LB6aBYyDa8ApbwASpSqStQ | `47 13 * * *` | `47 13 * * 1,4` (Mon, Thu); renamed | 7 → 2 | Back to the 10-09 budget |
| Builder incentives note (writer) | trig_01CGCPAiVa5CyCKP7szMuUtS | `53 13 * * *` | `53 13 * * 1,4` (Mon, Thu); renamed | 7 → 2 | The ISA Portal shows it, so twice a week rather than the 10-09 once |
| Elite Affluent note (writer) | trig_01LkHGJWWeSzeh3SyoARN59A | `51 15 * * *` | `51 15 * * 1` (Mon); renamed | 7 → 1 | Weekly material |
| Econoday note (writer) | trig_01Kz8PfWLGmiN44NjyiqCyjp | `35 12 * * *` | `35 12 * * 1,4` (Mon, Thu); renamed | 7 → 2 | Note covers the next 2–3 weeks of releases |
| Weekend Builds dashboards refresh | trig_01EumN8gNtiq7HFKnhFoyU44 | `CRON_TZ=America/Los_Angeles 50 6 * * *` | `CRON_TZ=America/Los_Angeles 50 6 * * 1,4`; renamed (was "Daily refresh: …") | 7 → 2 | Three side-project dashboards; daily is more than they need |
| RoleCompass job hunt (v4) | trig_01Sac7gQ2GdGdCYPti7JsrgB | `CRON_TZ=America/Los_Angeles 40 6 * * *` | `CRON_TZ=America/Los_Angeles 40 6 * * 1,3,5`; renamed | 7 → 3 | Its prompt already searches since `lastRefresh` with a 1-day overlap, so nothing is missed |
| Command Deck — daily freshness sweep | trig_01Y1zZ3bmawgi4Mw2jNw9ZFM | `40 3,15 * * *` | `40 15 * * *`, and the STEP 4 staleness rule now follows each key's cadence (below) | 14 → 7 | The 03:40 run mostly re-researched keys that the morning writers refresh hours later. Without the cadence rule the sweep would refill the weekly keys every day and undo the cuts above |
| Feed freshness watchdog | trig_01AcWPY2aSQZay5e2DBCfczD | `12 16 * * *` | **disabled** | 7 → 0 | A second writer of `feedFreshness`; the sweep owns that document and runs 32 minutes earlier |
| Strava wrapper guard | trig_01Nqu4xFXLqtTB2oSdGXEi4X | `47 12 * * *` | **disabled** | 7 → 0 | Guards the Mac task `strava-daily-sync`, frozen since 10-13. Turn it back on when that Mac task runs again |
| Transaction & Showing desk | trig_011iofWVNizNQ1SNujNcp5tL | `CRON_TZ=America/Los_Angeles 10 7 * * 1-5` | `CRON_TZ=America/Los_Angeles 5 6 * * 1-5`; renamed "(weekdays 6:05 AM PT)" | 5 → 5 | Now runs before the 6:25 AM daily cycle, so the cycle reads today's `tcDesk` and not yesterday's |
| Weather & news (writer) | trig_017MzzeaebbUsMLcSPVpEKeG | `35 1,13 * * *` | `35 13 * * *` (morning only) | 14 → 7 | The evening run refreshed only `newsSnapshot`; the morning run does news plus the city and housing lists |
| Pipeline Sync (live, writes) | trig_01M5zR1Po44gnHvTwA9ogZaB | `0 15,20,23 * * 1-5` | `7 20,23 * * 1-5` | 15 → 10 | The ISA works noon–4 PM PT (19–23 UTC). The 15 UTC run fell before her shift; the 20 and 23 UTC runs cover mid-shift and end of shift |
| Tech & AI Command Deck — monthly | trig_01RsFftt7y4myjmEDqoe1EbS | `0 14 1 * *` | `17 14 3 * *` | — | Spreads the monthly Opus jobs off days 1–2 |
| VA Command Center — monthly | trig_01RpEqUFbqaPDguF2ku6PEmv | `0 15 1 * *` | `23 15 4 * *` | — | Same |
| Things I Wish I Knew book — monthly | trig_01HXTDADHyGpghP9MMUgmCBM | `CRON_TZ=America/Los_Angeles 51 8 2 * *` | `CRON_TZ=America/Los_Angeles 51 8 5 * *` | — | Same |
| NAVWAR PM Deck — monthly | trig_01ArqD9f1QVCQwEDVthncB3b | `CRON_TZ=America/Los_Angeles 52 8 1 * *` | `CRON_TZ=America/Los_Angeles 52 9 6 * *` | — | Same |
| Nellis VA Webinar — monthly | trig_01VWeehgtJYJX5vVDa5reSGE | `CRON_TZ=America/Los_Angeles 49 6 1 * *` | `CRON_TZ=America/Los_Angeles 49 7 7 * *` | — | Same |
| Muster Point — monthly | trig_01RA64qRFH7B4ZYuTAzg7e2B | `0 14 2 * *` | `13 16 8 * *` | — | Same |
| Rent, Buy, or Wait — monthly state refresh | trig_01JvvDEbVqzusqzc6dcWdTtH | `0 15 1 * *` | `41 15 9 * *` | — | Same |
| Sentinel monthly figures refresh | trig_01RJJZeocYiNhyDRAAxHm9SW | `7 14 2 * *` | `7 17 10 * *` | — | Same |

The eight monthly jobs (six on Opus) all fired on the 1st and 2nd, the days the allowance was already spent. They now
run one a day, days 3–10, at different hours. Nothing is lost: each still runs once a month.

### Freshness sweep: the cadence rule (the only prompt change)

The first sentence of STEP 4 used to read "For every key in liveFeeds.feeds whose checkedAt is older than 26 hours".
It now says a key is stale only past its cadence limit:

- `elitScanLiveList`, `eliteAffluentLiveList` (weekly) — 8 days (192 h)
- `pedefenseLiveList`, `defenseUpdatesList`, `builderIncentiveLiveList`, `econodayLiveList` (Mon + Thu) — 4 days (96 h)
- `mktMoversList`, `mktSectorList`, `topPerformersLiveList` (weekday close) — 80 h, which matches the deck's own top-performers
  threshold. STEP 3 still catches a missed close.
- every other key — 26 h, as before.

The rest of the prompt is unchanged, word for word. The Weekend Builds dashboards write no `liveFeeds` keys, so the
rule needs no entry for them. The DAILY-KEY RULE still names a "03:40 run". That run no longer exists, so the sentence
is now inert.

### Left as is (checked)

- Top performers note (`26 13 * * 2-6`), morning feeds, market close, morning brief, the daily Chief of Staff cycle,
  Attraction Command Center, AI twin autopilot, Scrape queue runner, Command Deck Brief, ISA ladder, the 6D Brain
  daily rebuild, and the Sunday backup and backup watchdog.
- The one-shot "Monthly refresh pass 3" (fires 2026-10-25 20:10 UTC). It names the monthlies by id, so the new days
  do not affect it.

### Small follow-ups (wording only, not changed)

- The RoleCompass and Weekend Builds prompts still set `nextRefresh` to "tomorrow". The NAVWAR prompt writes
  `cadence: "Monthly, 1st of each month"`, and the Nellis prompt sets "next refresh = the 1st of next month". The
  dashboards will show the wrong next date until those lines are edited.
- The daily-cycle prompt (trig_019whypw6EeNu2G8xxY5xE5N) still describes `tcDesk` as written at "7:10 AM PT".
- The "Weekly Loop Engineering + Self-Test" routine (trig_01W1KHiBfVXZ5Xwd1aCFJM72) runs **Sunday** 13:05 PT
  (`CRON_TZ=America/Los_Angeles 5 13 * * 0`), not Saturday.

## Steven only (created via API — agents cannot change these)

Open each link and set what is shown. About 6 runs a week, plus one unattended publish removed.

| Routine | Link | Change |
|---|---|---|
| Command Deck — weekly self-improvement loop (Sun 15:00 UTC) | https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX | **Disable.** The Sunday Loop Engineering + Self-Test covers it |
| Command Deck — weekly improvement loop (Sun 16:00 UTC) | https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX | **Disable.** Same; each run reads the whole 4.5 MB deck |
| Command Deck & ISA Portal Weekly Loop Engineering QA (Sun 16:00 UTC) | https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY | **Disable.** Same |
| Command Deck — weekly opportunity audit (Sun 17:00 UTC) | https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU | **Disable.** It edits and **republishes the Command Deck unattended** (HALT: a live artifact changed outside an assigned region), and the Sunday cycle covers it |
| Vanessa orchestrated Weekly Ops Review (Fri 23:00 UTC) | https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs | **Keep, but fix the prompt.** It still says "Follow Up Boss for real estate"; Lofty replaced it on 2026-09-22 (read `loftyLeads`). Or disable it if the weekday daily cycle is enough |
| Weekly 1/5/10-Year Plan Review Reminder (Mon 14:00 UTC) | https://claude.ai/code/routines/trig_01W37dE7VHCqceffB159zNYr | **Disable** and add a recurring Google Calendar reminder (Mon 7:00 AM PT). A whole session just to send one push notification |
| Command Deck — Weekly content edit reminder (Mon 15:00 UTC) | https://claude.ai/code/routines/trig_018RcDPPx35doBvNAxg8xTkQ | **Disable** and add a recurring Google Calendar reminder (Mon 8:00 AM PT) |

Optional: R16 marketing compliance (trig_01KDp9oB87M99NjUnyWiTbMd, `0 16 1 * *`), R18 card credits
(trig_0138GgRga2sggpEYbJapZnvN, `0 15 1,15 * *`) and the Property Search health check (trig_01TVFXodf4JhV9yp6oaYgYpK,
`0 15 1 * *`) also land on the 1st. Moving them to the 11th, 16th and 12th (for example `17 16 11 * *`,
`43 15 12 * *`, and `9 15 1,16 * *` for R18) would finish clearing that day.

## Recommendation only — model changes need Steven's own words

These run on `claude-opus-5-5` and follow fixed checklists. Moving them to Sonnet would cut Opus use further, but it
is Steven's call, as it was on 2026-10-09:

- Gridiron Codex – game-day scores (trig_012AgCktxWx94zsNqcxb96p1): 3 runs every Sunday
- Gridiron Codex – prime-time scores (trig_011hRsg6AHMgSmRgtEZovQNm): Mon and Thu
- Gridiron Codex – weekly Bears analysis (trig_01TYxX2H8oeAp5tiThEGTTi3): Tue. Its last run was ABANDONED on 10-20
- Weekly Rent, Buy, or Wait refresh (trig_01EBvRQ4Rv63EgrLihjNxwiG): Mon. Its last run was ABANDONED on 10-19

That is about 7 Opus runs a week. Say "yes, Sonnet" for any of them and it is a one-field change.


---

<!-- source file: docs/SECOND-MAC-SETUP.md -->
# FILE: docs/SECOND-MAC-SETUP.md

# Both Macs — setup runbook

*Corrected 2026-09-24 (R6):* this file used to bring a second Mac up as a permanent, lease-blocked
**standby** — install everything, then leave it unable to run a single task, forever, unless Steven
performed a manual "promotion." That was never what he asked for. His words, verbatim: **"Ensure both of
my MacBooks can access the same information and equally have control of this dashboard setup
infrastructure."** Two equal Macs, not one primary and one permanent spare. This file now ends with both
Macs on the **same role** (`peer`), the **same schedule enabled**, and a proof that either one can take
over from the other — not with one of them parked.

Bringing a Mac up to the same brain, in order. Every step has a check and the output it should
print. **Do them in order** and stop at the first check that does not match — a later step will
otherwise hide the failure. Run this file on **both** Macs; nothing in it is "do this only on Mac #1."

Rules that hold throughout: **no credential value appears in this file, in a prompt, in a task, in a
log or in the deck** — only the file it lives in and the variable's NAME.

**What changed on 2026-09-22, and again on 2026-09-24:** standing by no longer means editing 59 task
prompts (2026-09-22 — the lease check moved into `claude-auto`, the one launcher every task already goes
through). And a second Mac no longer means *standing by* at all (2026-09-24) — it means running the **same**
role, `peer`, as the first one. Installing one script and writing one word — the **same** word on both
Macs — is the whole of what makes two equal Macs safe.

---

## Shortcut (2026-10-23): one paste does levels (ii) and most of (iii)

`bash scripts/second-mac.sh` (from the cloned repo) installs the basics, writes the `peer` role file (11b) and runs
`connect-all.sh`. What it cannot do is in its own "still yours" list: `claude` sign-in, and the runner copy from Mac 1
(11). The levels below remain the reference and the checks.

## Level (i) — read the dashboards  (2 minutes, nothing to install)

### 1. Sign in to claude.ai in the browser you will actually use

Use one browser profile per Mac and keep to it: the deck's device identity and its per-device
settings live in that profile's local storage.

**Check:** claude.ai loads signed in as Steven.

### 2. Open both artifacts and pin them

- Command Deck — `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`
- ISA Portal — `https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041`
- Toolbox dashboard — `https://claude.ai/code/artifact/256ccb1b-85af-4f98-97a0-af[phone masked]`

**Check:** each opens with data already in it. Nothing to install, nothing to import.

### 3. Confirm the sync badge

Top of the Command Deck, the pill next to the title.

**Expect:** `Synced across devices`.
**If it says `Local only (this device)`** the page has no database capability in this browser —
edits will stay on this Mac. Reload once; if it persists, open it outside a private window.
**If it says `Read-only — changes stay on this device`** the artifact's db permission was revoked
for this login. That is a **HALT**: it needs an account change, not a workaround.

### 4. Confirm both Macs appear

Command Deck → **Toolkit & Remote Access** (panel 38) → *Devices attached to this dashboard*.

**Expect:** a row for this Mac marked **this device**, and within a few minutes a second row for
the other Mac. Rename either row to whatever you call that machine; the name syncs to the other Mac.
A row registers at most **once an hour**, so give it that long before calling it missing.

---

## Level (ii) — drive Vanessa from this Mac

### 5. Install Claude Code and log in

```bash
npm install -g @anthropic-ai/claude-code     # or the installer you used on the other Mac
claude --version
claude       # then: /login
```

**Expect:** `claude --version` prints a version; `/login` completes in the browser and `claude`
starts a session without asking again.

### 6. Clone the brain repo

```bash
mkdir -p ~/Projects && git clone https://github.com/chitown034/Repo ~/Projects/second-brain
cd ~/Projects/second-brain && ls CLAUDE.md AGENTS.md wiki always-on REMOTE-ACCESS.md
```

**Expect:** all five names echo back with no `No such file` line.

If you keep the tree inside the vault on the other Mac (`~/Shearrill-Vault/00-Brain`), mirror that here and
symlink rather than keeping two copies — see `MAC-INSTALL.md` §0, and *Your vault on both Macs* (step 6b)
right below, which is a related but **separate** question: this step is about the git repo; that one is
about `~/Shearrill-Vault` itself, which is not a git repo Steven wants synced the same way (see why below).

**Check the router loads:**

```bash
cd ~/Projects/second-brain && claude -p "Which one file answers 'what runs when, and did it run'? Name the file only."
```

**Expect:** `always-on/README.md` — one file, not a list. That proves `CLAUDE.md` is being read.

### 6b. Your vault on both Macs — a decision, and one option costs money

`~/Shearrill-Vault` holds `00-Brain` (the repo, if you chose option A in `MAC-INSTALL.md` §0), the Jarvis
index source, and everything `steve-twin-sweep` writes. **No document before this one said how it reaches a
second Mac** — `MAC-INSTALL.md` §0 describes it on one Mac only. It matters even if you chose option B (a
plain clone at `~/Projects/second-brain`, symlinked in): the vault still exists, still holds Jarvis's index
and the twin's output, and those still need to agree between your two Macs the same way the repo does.

Three ways, and the choice is **yours** — it is not this runbook's to make, because one of them is not free:

| Way | Cost | What it is |
|---|---|---|
| **iCloud Drive** | Free | Put the vault folder where iCloud Drive syncs it; Apple's own sync, Obsidian reads a folder like any other |
| **Obsidian Sync** | **Paid** (Obsidian's own subscription) | Versioned, end-to-end encrypted, built for exactly this — the "just works" option, at a monthly cost |
| **Git** | Free | Works, but conflict-prone for prose notes (no line-based diff reads like one), and manual — you `pull`/`push` it yourself |

**If you pick iCloud Drive**, the exact move:
```bash
mkdir -p "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault"
# with the vault NOT open in Obsidian and no task running against it:
rsync -av --remove-source-files "$HOME/Shearrill-Vault/" \
  "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault/"
find "$HOME/Shearrill-Vault" -type d -empty -delete
ln -s "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault" "$HOME/Shearrill-Vault"
```
Then, on the **other** Mac, once the folder has synced down through iCloud (check the Files app or Finder —
iCloud, not this Mac's local disk): `ln -s "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Shearrill-Vault" "$HOME/Shearrill-Vault"`
there too, so both Macs open the **same** symlink name and Obsidian never notices the difference.

**If you pick Obsidian Sync:** turn it on in Obsidian's own Settings → Sync on this Mac, sign in on the
other Mac's Obsidian, and choose "Connect to existing vault" there rather than creating a second one.
Nothing on the filesystem needs to move for this option.

**Never put this repo's `.git` inside an iCloud-synced folder — that is a different question from the vault,
and the answer is no.** iCloud syncs file-by-file, mid-write, with no notion of git's object store as a
single atomic unit; a `.git` directory caught mid-sync is a well-documented way to corrupt a repository, and
recovering from it is worse than not doing it. Keep the repo at `~/Projects/second-brain` (a plain clone,
**not** inside iCloud Drive) and symlink it into the vault if you want Obsidian to see it — exactly what
`MAC-INSTALL.md` §0 option B already sets up, and exactly why option B, not option A, is the default this
runbook assumes. If the vault itself (not the repo) is ever made a git repo for some other reason, the same
warning applies to it too, and `mac-sync.sh status`/`diff` will flag `icloud+git` together for exactly this
reason — see `integrations/mac-sync/README.md`.

**Check:** `mac-sync.sh status` (from the repo, once you have reached step 11 below) reports this Mac's
`vault sync` method, and `mac-sync.sh diff` flags it if the two Macs' methods do not match.

**Needs Steven:** pick one of the three ways above — this runbook installs nothing for the vault on its
own, on purpose; it is a data-location decision, not a script's to make.

### 6c. Brain on this Mac — set up and sync the second brain on every Mac

One script gets the deterministic retrieval engine (`brain/`, CLI `bin/brain`) working here the same
way it works on the other Mac. It is separate from, and does not replace, step 7 below.

```bash
cd ~/Projects/second-brain      # or wherever you cloned it, step 6
bash scripts/brain-sync.sh      # pulls the repo, reindexes, links bin/brain and skills
brain doctor                    # non-zero means the INDEX is stale or a routed path is missing
brain recall "what model does Vanessa run on"
```

**Expect:** `brain doctor` exits 0; `brain recall` prints a file, a section, and evidence — here the
model-tiering entry in `context/decisions.md` (or it says plainly "not in the brain", which is a
correct answer too, never a crash). If `bin/brain` does not
exist in your checkout yet, `brain-sync.sh` says so and skips those steps gracefully — it is being
built alongside this runbook, not before it. Re-run `scripts/brain-sync.sh` any time (by hand or on a
schedule, see `always-on/README.md` → `brain-maintenance`): it is idempotent and never overwrites a
skill directory you have hand-edited — it tells you the exact command to replace it yourself instead.

**Keeping it synced (2026-10-22):** `bash scripts/repo-sync.sh` is the one way this Mac catches up with GitHub
(`brain-sync.sh`, `go.sh` and `connect-all.sh` all call it; `connect-all.sh` step 1b also runs it every 30 minutes
as the LaunchAgent `com.vanessa.repo-sync`). Files the brain rebuilds (listed in `.gitattributes`) are backed up to
`~/Documents/Repo-sync-backups/<date-time>/` and replaced, your own edits are kept (or backed up first if GitHub
changed the same file), local commits are replayed or saved on a `backup/repo-sync-*` branch, and nothing is ever
pushed. Log: `~/Library/Logs/vanessa-setup/repo-sync.log`. Do not use plain `git pull` here.

Then turn on auto-memory (step 7, right below) so this session's own recall gets written back.

**Optional — Laya, a local classifier for the router:**
```bash
pip install "laya[mcp]"
export BRAIN_ROUTER=laya
```
This only changes how a query gets routed to a leaf file (`integrations/laya/laya_route.py`); nothing
about the recall order in `CLAUDE.md` changes, and it is entirely optional on either Mac.

**Both Macs get the same brain through git — nothing else needs to sync it.** Notion (the Second Brain
database — the record) and the Google Drive "Second Brain" folder are shared cloud sources both Macs
already read the same way; they are not, and do not need to be, synced by git.

### 7. Turn on auto-memory

In Claude Code from the project root: `/memory on`.
**Expect:** the session appends to `memory.md` in this repo, not to a new file elsewhere.

### 8. MCP servers — install what this Mac will actually use

The first Mac has **15 connected** (`toolkitSnapshot`, 2026-09-22 13:15 UTC): `filesystem`, `fetch`,
`memory`, `git`, `perplexity` (Perplexity removed 2026-10-05), `notion-brain`, `openrouter`,
`openterminal`, `lofty`, `tradingview`, `apination`, `apple-health`, `apple-health-xml`,
`health-export`, `plugin:ruflo-core:ruflo`.

You do **not** need all of them on a second Mac. Take them in three groups:

| Group | Servers | Install here too? |
|---|---|---|
| **Needed for any real work** | `filesystem`, `fetch`, `git`, `memory` | **Yes** |
| **Needed to answer like Vanessa** | `notion-brain` (Second Brain), `plugin:ruflo-core:ruflo` (recall). Research needs no server: it is Claude Code's built-in WebSearch/WebFetch on Steven's Claude subscription — do not install `perplexity` (removed 2026-10-05) | **Yes** |
| **Tied to the first Mac's data or hardware** | `lofty`, `apple-health`, `apple-health-xml`, `health-export`, `openterminal`, `tradingview`, `apination`, `openrouter` | Only if this Mac will read those same local daemons, local files or a machine-local key. **Equal control does not mean identical hardware** — a Mac without the Apple Watch nearby still cannot be the one reading Health data, whatever its lease role says |

`plugin:ruflo-core:ruflo` arrives with the `ruflo-core` plugin, not as a standalone server. For the wider tooling set, `./MAC-SETUP.sh --dry-run` then `./mac-verify.sh` cover it.

```bash
claude mcp list
```

**Expect:** every server you installed prints `connected`. A server listed but not connected is
worse than one absent — it makes the deck advertise a capability this Mac does not have.

### 9. Credential files — by NAME only, never a value

Create each file on **this** Mac by hand, `chmod 600`, and never paste a value into a prompt, a task
definition, a skill, a log or the deck (`integrations/CONNECTIONS.md` rule 5).

| File | Variable NAMES it holds | Needed here |
|---|---|---|
| `~/.config/lofty/.env` | `LOFTY_API_KEY` | Only if this Mac runs `lofty-crm-sync` (see the hardware note in step 8 — this is now about which Mac happens to run that task at a given moment, not a fixed role) |
| `~/.config/omniroute/.env` | `OMNIROUTE_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `BYTEZ_API_KEY` | Only if you install the OmniRoute **free-provider failover** here. `claude-auto` itself does **not** need this file to hold the lease: with no `.env` the route simply stays `subscription` |
| `~/.config/higgsfield/.env` | `HF_API_KEY_ID`, `HF_API_KEY_SECRET` | Optional; media tooling only |
| macOS Keychain | everything else | As needed |

**Check — no value ever lands in the tree:**

```bash
cd ~/Projects/second-brain
grep -rniE 'api[_-]?key|secret|token|password|bearer ' --include='*.md' . | grep -v 'keychain\|\.env\|never\|NAME'
ls -l ~/.config/*/.env 2>/dev/null
```

**Expect:** the grep prints nothing, and every `.env` listed shows `-rw-------`.

### 10. Skills

The 22 skills in `.claude/skills/` come with the clone and load from the project directory — there
is nothing per-machine to install for those. Anything installed globally on the other Mac (the personal
`~/.claude/skills`) does **not** travel with the repo — `mac-sync.sh status`/`diff` (step 11) is how you
see that drift, since those are exactly the globally-installed skills that can differ between your two Macs.

```bash
ls ~/Projects/second-brain/.claude/skills | wc -l
```

**Expect:** `22`. Then ask a session to name the skills it can see; if one is missing, its
frontmatter will not load on this machine — run the `skills-refresh` audit rather than guessing.

---

## Level (iii) — the scheduled tasks, as an EQUAL peer

### 11. Install claude-runner and the tasks — on both Macs, not just one

Install `claude-runner` and copy the task set from the Mac that already has it (or build it fresh if
neither does yet). The `runnerStatus` doc stamped 2026-09-22T04:05:04Z lists **59** tasks and the toolkit
snapshot counts **60** — reconcile against the runner that already has them, not against either document.

```bash
runnerctl status
scutil --get ComputerName
```

**Expect:** `runnerctl status` lists the tasks; the computer name is **different** from your other Mac's.
Two machines with the same lease id defeats the whole mechanism, and the id is derived from that name unless
you write `~/.config/claude-runner/id` yourself.

### 11b. The lease — one script and one word, the SAME word on both Macs

Nothing goes into the 59 task prompts. Install the launcher, declare the role, prove it.

```bash
# from the repo clone
cp integrations/omniroute-failover/claude-auto.sh ~/.local/bin/claude-auto
cp integrations/omniroute-failover/probe.sh       ~/.local/bin/probe.sh
chmod +x ~/.local/bin/claude-auto ~/.local/bin/probe.sh

mkdir -p ~/.config/claude-runner
printf 'peer\n' > ~/.config/claude-runner/role     # the SAME word on the OTHER Mac too — not 'primary'/'standby'

claude-auto --status
claude-auto --lease-check
```

(`./MAC-SETUP.sh --only omniroute` does the two copies and the role file for you. It writes `peer` when no
role file exists, and **never overwrites one that already exists** — so a Mac still on the old `primary`/
`standby` pair from before 2026-09-24 keeps working exactly as before until you change it yourself:
`printf 'peer\n' > ~/.config/claude-runner/role` is the entire migration, on either Mac, any time.)

**Expect on whichever Mac checks first:** `--status` prints `lease_role=peer` and `lease_cached=none`.
`--lease-check` prints `verdict=ACQUIRED` and exits **0** — this is the run that **creates**
`state/taskLease`. It must be a Mac that does it, never the cloud.
**Expect on the second Mac to check:** `verdict=FOREIGN holder=<the first Mac's id>` and exits **0** — that
is correct, not a failure: the lease now has a holder, and this Mac is not it, yet.
**If either prints `verdict=INCONCLUSIVE`**, the check could not reach the store: `claude` is not logged in
on this Mac, or the artifact-DB tool is not named `ArtifactData` in this CLI build (override with
`CLAUDE_RUNNER_LEASE_TOOLS`). Do not enable the schedule until it is conclusive.

Then point the runner's task wrapper at `~/.local/bin/claude-auto` and make sure **every task passes
`--task <its name>`**: an invocation with no `--task` is not lease-gated, by design (that is what keeps
interactive Vanessa Live working on this Mac — see step 12b). Never put `--no-lease` in a task definition.
**Enable the schedule on this Mac now** — that is the point of `peer`. It does not need to wait for the
other Mac, and it does not need "promoting" first.

### 12. Prove the lease actually does its job — run this on BOTH Macs, back to back

While **both** Macs are awake:

```bash
claude-auto --task r10-automation-health -p 'say hi'; echo "exit $?"
```

**Expect:** on the Mac that does **not** currently hold the lease, stderr says `standby: lease held by <the
other Mac's id>`, and `exit 75` — the runner's "retry later," having written nothing. (The prompt-level
block in `REMOTE-ACCESS.md` exits 0 instead; in the launcher it is 75 because that is the code
`claude-runner` already understands.) On the Mac that **does** hold it, the task runs and exits 0. Both are
correct — `peer` means whichever Mac holds the lease writes, not that both refuse or both write.
**If both exit 75 or both write**, something is wrong: run `claude-auto --lease-check` on each and compare
`holder=` — they must agree on exactly one machine, or the lease document has not settled yet (give it a
few seconds and re-check).

### 12a. Prove either Mac can take over — the failover this whole file exists for

On the Mac that does **not** currently hold the lease:

```bash
claude-auto --take-lease
```

**Expect:** one line, `claude-auto: TOOK the lease — holder=<this Mac's id> expires=<...>`. Immediately
re-run the step-12 command **on the Mac that used to hold it** — it now gets `exit 75`, and on **this** Mac
the same command now runs and exits 0. No role file was touched. Nothing was "promoted." The lease simply
moved, because you told it to.

Hand it back the same way, from either Mac:

```bash
claude-auto --release-lease
```

**Expect:** `claude-auto: RELEASED the lease — it is free as of <...>`. The next `claude-auto --lease-check`
on **either** Mac now returns `verdict=ACQUIRED` — the lease is free, and whichever Mac checks (or runs a
task) next becomes the new holder. That is sticky leadership: it follows whoever actually did the work most
recently, not a file either of you have to remember to flip.

**This is the proof "both Macs equally have control" actually asked for.** Level (iii) is not complete
until you have run this step for real, on both Macs, and watched the lease move both ways.

### 12b. Prove Vanessa still works here, on both Macs, regardless of who holds the lease

```bash
claude-auto -p 'name the file that answers "what runs when, and did it run"'
```

**Expect:** it answers — `always-on/README.md`. An invocation with **no `--task`** is deliberately not
lease-gated on any role: a human is present, it is not one of the 59 scheduled writers, and this is what
lets both Macs drive Vanessa interactively regardless of which one currently holds the task lease.

### 13. mac-sync.sh — the "same information" half

The lease (steps 11b–12a) is "equal control." This is "same information": a one-screen parity report, a
safe way to keep the repo current, and names-only manifests either Mac can compare against the other's.

```bash
integrations/mac-sync/mac-sync.sh status     # repo/role/lease/vault/counts, all on one screen
integrations/mac-sync/mac-sync.sh pull       # git pull --rebase --autostash; refuses on a real conflict, says why
integrations/mac-sync/mac-sync.sh export     # writes mac-config/<this Mac's id>/ — names only, commits locally
integrations/mac-sync/mac-sync.sh diff       # what THIS Mac lacks, vs the other Mac's last export
```

**Expect:** `status` prints cleanly with no error; run `export` on one Mac, `pull` then `diff` on the other,
and `diff` reports either `no gaps found` or a specific, named list of what to go install. Full reference,
including the two LaunchAgent templates that run `pull` every 30 minutes and `export` daily on their own:
`integrations/mac-sync/README.md`.

**Runner task *definitions* (prompts), not just names — read this before assuming a script can copy them.**
This repo does not document where `claude-runner` stores a task's prompt, only its CLI surface — so
`mac-sync.sh export` deliberately never touches one, and there is no safe scripted way to copy one either.
The exact manual steps, and why: `integrations/mac-sync/README.md` → *Runner task definitions*.

---

## The 60-second proof that both Macs see the same DASHBOARD data

This is a **different** kind of "same information" from step 13 — that one is config (MCP servers,
skills, `.env` names); this one is the live artifact database both Macs' browsers read. Do this with both
machines open side by side. It tests the real path, not the badge.

1. **Mac A** — Command Deck → *Quick tasks* (or any editable list). Add a row: `sync test <time>`.
2. **Mac A** — the sync pill goes `Syncing…` then `Synced across devices`. If it sticks on
   `Sync pending…`, click the pill once to flush.
3. **Mac B** — wait up to ~30 seconds. The row appears, or the page reloads and then shows it.
   (A remote change refreshes the view at most once every 30 s per tab, by design.)
4. **Mac B** — delete the row. **Mac A** — it disappears within ~30 seconds.
5. **Both** — panel 38 → *Devices*: two rows, each with a recent **Last seen**, one marked
   **this device** on each machine.

**All five true → both Macs are live on the same data.**

If step 3 fails but the badge on both says `Synced across devices`, the two browsers are signed into
**different logins** — check the account menu on each before touching anything else.

**What is still device-local by design, and will not appear on the other Mac:** `deviceId` (that is
the point), `ahLogFilledFor`, `hlAutoTried`, `openTerminalSnapshot` (a live local read, never written
back to the shared store) and `voicePlayed` (per viewer). Everything else syncs — including
`hlPrefs`, the health-lab metric/range/auto choices, which moved to the synced path on 2026-09-22.


---

<!-- source file: docs/STEVEN-STEPS.md -->
# FILE: docs/STEVEN-STEPS.md

# Steven's steps — everything still waiting on you, in order (2026-10-22)

Same list as the Action Desk page (https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn), which has a button per step.
Includes every connection that still has to be made. Already done: Lofty key (54 leads syncing), 14 failed routines re-run, both dashboards updated (cycle 11), Remote Control card built, one-command Mac script, failover with a $25 OpenRouter cap, connection plan; your USC answers and personal DRE are saved.
research on Claude only; Gmail, Google Calendar, Notion, Slack, Canva and Inkbox iMessage are connected; the five research-only routines are already off.

## Start here (2026-10-23, evening) — ONE paste, then the short list it prints

Steven: *"make a new script that I can cut and paste into the terminal to fix whatever requires my actions; make it simple and limit the back and forth."*

**Mac 1 (plugged in), Terminal, one line:**
`cd ~/Repo && bash scripts/repo-sync.sh --quiet; VANESSA_THREAD=aa1a9d19-c7db-4dea-b7c8-f34999e58510 bash scripts/fix-mine.sh`

The same paste now also lets Vanessa answer at night: it widens the Mac message tasks from 7 AM–10 PM to all day (the cloud copy already answers every hour, day and night).

The script also asks for your **SkySlope** keys: the Access Key + Secret from SkySlope → My Account → Integrations → Generate New Key (the secret shows once), and the Client ID + Client Secret if SkySlope or your brokerage gave you one (Enter to skip; the login needs both pairs, so without the Client pair the proof step reports 401 and I ask SkySlope's side for it).

(`VANESSA_THREAD` is your Vanessa iMessage thread, linked 2026-10-23 23:54 UTC; it lets the script allow-list that one thread for her voice notes. It is an id, not a secret.)

It brings the repo up to date, asks once (hidden; Enter skips) for the Lofty, TidyCal, Arive and Zoho keys, registers Lofty's own
MCP server as `lofty-cloud`, makes Jarvis speak and think as Vanessa with the brain in its memory, re-runs Laya + Orca + the AI-team
wiring, pauses the retired runner tasks, re-runs the failed ones in the background, and ends with a **REPORT**: what it did, what it
skipped, and the lettered list only you can do (A iMessage text · B Zoho tick · C two browser sign-ins · D phone health clicks ·
E connectors · F AnyDesk permissions · G Orca phone pairing · A2 the Discord bot). Paste the REPORT back to Claude. **Why Vanessa did not answer your texts (2026-10-23 23:50 UTC):** Inkbox shows no linked phone — the connect text never arrived; use the tap link the script prints (A). Kapso: nothing reads that number yet (sign-in + two runner tasks). Discord: no bot token. The cloud now sweeps iMessage, the deck chat box and Discord hourly as a fallback. Run it again any time; it only does
what is still missing. `bash scripts/fix-mine.sh --check` shows the plan without doing or asking anything.

## 1 · Phone · 5 minutes (Do these first; nothing else depends on them)

## Every day (from 2026-10-23) — Vanessa's four courses of action, your yes or no

Open the 6D Brain (https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8) → "Vanessa recommends — four courses of action".
Four lanes, four moves each, all scored by impact × confidence ÷ effort with the plan standing by: **Next big moves**
(money, clients, connections) · **Self-improvement** (loop engineering: what the brain and the team change in themselves —
failing gold questions, stale pages, tune proposals, declined-too-often weights, Nadia's scout) · **Risks and actions to
take** (what is stale, failing or silent and the action that heads it off) · **Opportunities to pursue** (marketing,
presence, new capabilities). Under them, **"Questions you may have"**: one answer per leading move plus the standing
questions (what only you can do, what runs each morning, what is not connected, what the weekly loop found, how approval
works, where the morning brief is), each answered from the brain's own page with the action to take. **Approve** → Vanessa starts on it right away (the page fires her
Big-moves task through your Claude Code Remote connector; the first time, allow "Claude Code Remote" when the page asks). Her
items land in the Vanessa queue on the Command Deck; yours stay listed with the plan standing by until you say "done".
**Decline** → hidden 30 days and that kind weighs less. The 6:05 AM task re-learns from every decision (`docs/reports/BIG-MOVES.md`).

## Start here (2026-10-23, round 2 — simplified the same evening) — three pastes, then four clicks

Everything scripted is inside the pastes now (Jarvis, Laya, Orca, AnyDesk, TidyCal, Arive credentials, homes.com /
ShowingTime / Showami wrappers, Lofty, Zoho check, NotebookLM, the failing-task logs). Each paste asks before it changes
anything, never signs in for you, never pays, and prints a REPORT — paste that REPORT back to Claude; Claude does the rest.

**Paste 1 — Mac 1 (plugged in), Terminal:**
`cd ~/Repo && bash scripts/repo-sync.sh && bash connect-all.sh`
It will ask, hidden, for: your Lofty API key (7b), your TidyCal token (7c), your Arive Client ID / Secret / API key (7e).
Enter skips any of them; make them first if you want them in this pass (Lofty → Settings → Integrations → API; TidyCal →
Integrations → API → Manage API keys; Arive → Settings → Integrations → Generate, Pro plan).

**Paste 2 — Mac 2, Terminal:**
`cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/second-mac.sh`

**Paste 3 — Alienware (Windows 11), PowerShell (not as administrator), one line:**
`irm https://claude.ai/install.ps1 | iex; winget install --id AnyDesk.AnyDesk -e -h --accept-package-agreements --accept-source-agreements; git clone https://github.com/chitown034/Repo.git $env:USERPROFILE\Repo; cd $env:USERPROFILE\Repo\integrations\alienware; Set-ExecutionPolicy RemoteSigned -Scope Process; .\alienware-setup.ps1; .\alienware-setup.ps1 -Action Install`
(Claude Code, AnyDesk, the Doctor, then Orca / Laya / Bonsai / Ollama — it asks y before each.) Then `claude` once to sign in.

**Then four clicks, in this order** (say "done A" … "done D"):
- **A. Link your iMessage line (fixes the missing morning text + voice note).** From your phone, text
  `connect @vanessa-shearrill` to **+1 650 484 9720**, once. Until then the brief comes by e-mail ([e-mail masked])
  and push, with the voice note attached to the e-mail.
- **B. Zoho** → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access".
- **C. Claim your profiles for AI search** → Google Business Profile, Bing Places, Zillow (agent + lender), Realtor.com,
  Homes.com, Yelp; send Sofia the DRE number (`wiki/real-estate-playbooks/ai-search-visibility.md`).
- **D. AnyDesk permissions** on each Mac (Screen Recording + Accessibility, unattended password) and the tablet app
  (Play Store "AnyDesk Remote Desktop" → Unattended Access; iPad: App Store → AnyDesk, reach-only).
- **E. Health on the phone (2 minutes, once)** → MyFitnessPal → More → Apps & Devices → Apple Health → on; Strava → Settings →
  Apple Health → on; BodyPark ATOM app → its settings → Apple Health / HealthKit → allow (do ATOM sessions with the Apple Watch
  so each one lands in Apple Health as a workout); Health Auto Export → Automations → your Google Drive export → Metrics: select
  all, Workouts: on. From then
  on the deck's Health tiles, the Strava card and the nutrition tiles refresh by themselves every morning at 6:15 (nothing on
  the Mac, nothing to tap daily). `integrations/apple-health-dashboard.md`.

**Carried by Vanessa as big moves** (no longer a list you keep — each one surfaces on the 6D Brain with its plan standing by, in
value order, and you approve it when you want it; the Big-moves task reads this list):
- **e. Lofty API key** → Lofty → Settings → Integrations → API → create; paste 1 asks for it (step 7b).
- **f. TidyCal token** → TidyCal → Integrations → API → Manage API keys → Create token; paste 1 asks for it (step 7c).
- **g. Arive** → Settings → Integrations → Generate (Client ID, Secret, API Key; Pro plan); paste 1 asks for them (step 7e). `integrations/arive/README.md`.
- **h. MBS Highway** → e-mail your rep for the Home Report webhook / CSV path (say "draft the MBS Highway rep email"). `integrations/mbs-highway/README.md`.
- **i. Ticor Title** → ask your Ticor rep for Ticor Online Pro credentials; farm lists export as CSV. `integrations/ticor/README.md`.
- **j. Pivo** → pair the Pod in the Pivo app; the tour link is what the team uses. `integrations/pivo/README.md`.
- **k. Drips and texts** → Lofty 10DLC registration, then say "specs ready for review" (`wiki/real-estate-playbooks/drip-and-text-follow-up.md`).
- **l. Orca pairing and the runner copy to Mac 2** → steps 1e and C below.

## Start here (2026-10-23) — one paste, then a few clicks

**Why things were stale:** your Mac's task runner froze on Oct 13, and every `git pull` on the Mac failed because the
cloud and the Mac both rebuild the same brain files. Both are fixed in the paste below. Everything cloud-side runs.

1. **On the Mac (plugged in): open Terminal, paste this one line, answer y.** Then paste the REPORT back to Claude.
   `cd ~/Repo && git fetch origin claude/stoic-cori-pvn3f8 && git show FETCH_HEAD:scripts/repo-sync.sh > /tmp/repo-sync.sh && REPO_SYNC_DIR="$PWD" bash /tmp/repo-sync.sh && bash connect-all.sh`
   It syncs the repo (and every 30 min after), restarts the frozen runner, keeps the Mac awake on the charger, installs
   or checks Kapso, Gondola, Inkbox voice, **Laya** (installs it + registers its MCP server), **Jarvis** (installs Ollama +
   the llama3.1:8b model; if this Mac has no OpenJarvis index yet the report names the one command that builds it, `runnerctl run openjarvis`, because that run spends Claude allowance), **Orca** (installs, opens on the Repo
   folder, runs its doctor), AnyDesk, the Agent OS, the seven Claude mods (new: `/cycle`, `/inbox`,
   `/meetings`, `/today`, `/tc`, `/queue <task>`, `/sync`, `/connect` and a status line that says when the repo is behind).
   It never signs in, pairs, sends or pays.
1b. **Mac 1 is connected (2026-10-23 01:14 UTC):** runner signed in and running, Laya real engine answering, Jarvis
   all green (index 1,828 rows, vault 850 notes, 8 voice clips, brain doctor PASS), mods on. Nothing more to paste for
   these. The 30-minute sync keeps the Mac current; `bash connect-all.sh` any time re-checks everything.
1d-result. **Mac 2 first run (2026-10-23 01:39 UTC, Intel MacBook Pro "(6)"):** Gondola, Orca, AnyDesk, sync, keep-awake done.
   Root cause of 6 of the 12 stops: Python 3.9 (brain, Agent OS, Jarvis checks need 3.10+); Laya's installer stalled
   building `cryptography` from source (no wheel for that Mac); Claude Code 2.1.278 is older than the mods need. The
   script now installs Homebrew's python, updates Claude Code and installs Laya wheel-first (build tools as fallback).
   Second attempt (01:53 UTC): Claude Code updated to 2.1.309; Homebrew could not build python (Intel Mac on macOS 26,
   outdated Command Line Tools), so the script now installs a ready-built Python 3.12 with uv instead.
   Rerun: `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/second-mac.sh` (then paste the REPORT). Still Steven's
   on Mac 2: `claude` sign-in, Kapso sign-in, the vault (6b: iCloud or a copy — Jarvis's index needs it), the runner copy
   from Mac 1 (`command -v runnerctl; ls ~/Library/LaunchAgents | grep -i runner` **on Mac 1**), and the Inkbox voice
   key only if Mac 2 should also send her voice notes (Mac 1 already does).
1e. **Runner onto Mac 2 (2026-10-23 02:10 UTC):** Mac 1's runner = `~/Applications/claude-runner` (supervisor.py,
   schedule.json, tasks), `~/.local/bin/runnerctl`, LaunchAgent `com.stevenshearrill.claude-runner` (sign-in lives in the
   Claude CLI, no token file). **On Mac 1:** `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/runner-export.sh`
   → AirDrop `~/Desktop/claude-runner-mac2.zip` to Mac 2 (Finder → right-click → Share → AirDrop). **On Mac 2:**
   `cd ~/Repo && bash scripts/repo-sync.sh && bash scripts/runner-import.sh && runnerctl login && runnerctl status`.
   The export also writes Mac 1's missing lease role (`peer`), so both Macs share the schedule without double runs.
1d. **Second Mac (2026-10-23): one paste, then two small things.** On the other Mac open Terminal and paste
   (if a window asks to install developer tools, click Install, wait, then paste the same line again):
   `[ -d ~/Repo ] || git clone https://github.com/chitown034/Repo.git ~/Repo; cd ~/Repo && git fetch origin claude/stoic-cori-pvn3f8 && git checkout claude/stoic-cori-pvn3f8 && git pull && bash scripts/second-mac.sh`
   It installs Homebrew, Claude Code and uv if missing, writes the lease word `peer`, then runs the same connect-all as
   Mac 1 (Laya, Jarvis engine, Orca, AnyDesk, Agent OS, mods, Gondola, Inkbox voice). Then: (a) run `claude` once and
   sign in; (b) on **Mac 1** paste `command -v runnerctl; ls ~/Library/LaunchAgents | grep -i runner` and send Claude
   the two lines — the task runner was built on Mac 1 only and its copy step for Mac 2 comes from that. Jarvis's index
   on Mac 2 needs the vault there too (`docs/SECOND-MAC-SETUP.md` 6b: iCloud or a copy).
1f. **NotebookLM, once (5 minutes):** the brain is already in your Drive as 13 Google Docs under **SECOND BRAIN/**
   (https://drive.google.com/drive/folders/16sh0SNlicvHOEpAtTUufI504agSlQRaX) and a weekly task keeps them current.
   notebook.google.com → New notebook **AI Automation and VANESSA** → Add sources → Google Drive → every `SB …` Doc in
   `01 Reference Sources/AI and Automation` + `SB 00-START-HERE` + `SB 02-who-and-decisions`. Then **Mortgage Reference
   Library** (`SB 05`, `SB 09`, `SB 00`, `SB 02`) and **Business Operating Playbooks** (`SB 06`, `SB 08`, `SB 09`, `SB 00`,
   `SB 02`). Google refreshes Drive Docs in NotebookLM automatically. `integrations/notebooklm/README.md`.
1f2-done. **NotebookLM connector signed in on Mac 1 (2026-10-23 06:30 UTC, 5 notebooks found).** Next, in Terminal on
   Mac 1: `cd ~/Repo && claude`, then type: *add every SB Google Doc from my Drive folder SECOND BRAIN to my "2nd brain"
   notebook, then list that notebook's sources*. Claude uses the notebooklm MCP; nothing else to do afterwards.
1f2. **NotebookLM direct connector (your opt-in, 2026-10-23):** the paste now installs it (step 6f). Then on Mac 1 run
   `nlm login` (browser sign-in, Google session stays on that Mac), then `nlm login --check`. In a new Claude Code session:
   "list my NotebookLM notebooks" → then "add every SB Google Doc from SECOND BRAIN to my 2nd brain notebook". Claude
   does the picker for you from then on. Non-sensitive notebooks only.
1h. **Your claude.ai chats into the brain (5 minutes, then monthly):** claude.ai has no API for other chat windows, so the
   path is your own export. claude.ai → Settings → Privacy → **Export data** → Google emails a zip → unzip → put
   `conversations.json` in `~/Repo/inbox/` (any folder works) → in Terminal: `cd ~/Repo && bin/brain ingest claude-export
   ~/Repo/inbox/conversations.json`. It writes `memory/claude-chats.md`: one line per chat (date, title, what you asked first) and
   a "tasks you mentioned" list, your words only, phones/e-mails masked. Claude Code sessions need nothing from you: a
   daily ledger (3:52 AM) lists them in `docs/inventory/claude-sessions.md`, and the Mac's `brain-learner` task captures your
   words from their transcripts.
1g. **Your GitHub repo is public.** `chitown034/Repo` answered without sign-in on 2026-10-23 (that is how the Drive
   sync fetches the pack). It holds no client files beyond `wiki/clients/index.md` (first names, by rule), but the
   brain, decisions and task prompts are readable by anyone. If you want it private: GitHub → Repo → Settings → Danger
   Zone → Change visibility → Private, then tell Claude (the Drive sync switches to a signed-in fetch). Your call.
1c. **Kapso on the Mac:** `claude` → `/mcp` → kapso → sign in (free sandbox); then
   `bash integrations/kapso/install-mac.sh keys --allow <your mobile>` (hidden prompt, Keychain only).
2. **Vanessa's iMessage line (30 seconds, from your phone):** Inkbox is reconnected. Send the text
   `connect @vanessa-shearrill` to **+1 650 484 9720** (tap: sms:[phone masked]?&body=connect%20%40vanessa-shearrill).
   After that, the "Text me this brief" button on the Command Deck works, and Vanessa can text you.
2a. **Morning iMessage + voice from Vanessa (Mac side):** claude.ai → Settings → Connectors → **Inkbox → Reconnect**; then in the
   runner task `vanessa-morning-brief-text` paste §8b at the start and §8 at the end (`integrations/mac-task-specs.md`).
   From then on, ~6:40 AM: one text covering all three dashboards and a voice note in her voice.
2b. **Zoho CRM (one checkbox, then tell Claude "Zoho done"):** Zoho CRM → ⚙ Setup → Security Control → Profiles →
   your profile (Administrator or yours) → Developer Permissions → tick **Zoho CRM API Access** → Save. Tested live
   2026-10-22 14:46 UTC: Composio's Zoho connection is active, Zoho answers 403 NO_PERMISSION until that box is ticked.
   If it still says 403 after the tick, Claude sends a fresh Composio reconnect link.
2c. **Lofty CRM:** nothing extra — the paste (step 7b) checks your Lofty key, asks for it once if it is missing
   (hidden, saved only on the Mac), and proves it works read-only; the Lofty sync resumes with the runner.
3. **Gondola (travel):** claude.ai → Settings → Connectors → Add custom connector → `Gondola`, URL
   `https://mcp.gondola.ai/mcp` → Connect and sign in.
3b. **Jarvis needs two things only you know:** the vault folder (`~/Shearrill-Vault`; if it lives only on the other Mac,
   see `docs/SECOND-MAC-SETUP.md` 6b for iCloud or a copy) and Vanessa's 8 voice clips (put them in `~/.cache/vanessa-voice`
   or tell Claude the folder). The REPORT's "Jarvis" rows say which of the two is missing.
4. **Orca and AnyDesk (the paste opens them):** Orca → Add Project → your Repo folder, then scan its pairing code with the
   Orca phone app. AnyDesk → System Settings → Privacy & Security → turn on Screen Recording and Accessibility for AnyDesk.
   Other computers: `integrations/anydesk/README.md`.
5. **WhatsApp triggers (2 minutes, in Pabbly):** connect.pabbly.com → your Kapso WhatsApp app → trigger "New Inbound
   WhatsApp Message" → copy the webhook URL → Kapso (app.kapso.ai) → WhatsApp → your number → Webhooks → Add webhook →
   paste it, kind Kapso events, tick whatsapp.message.received, any signing secret, Save → message your Kapso number
   from your phone → back in Pabbly click Capture Webhook Response. Same for "New Conversation" (tick
   whatsapp.conversation.created).
5b. **WhatsApp send step in Pabbly:** tell Claude "build the Pabbly send step" when you can type your own mobile number
   into Pabbly's test box (it sends one real test message to you only).
6. **Optional, 3 minutes — saves Claude allowance:** turn OFF these routines you made through the API (Claude cannot):
   - https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX · https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY · https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU
   (the Saturday Loop Engineering + Self-Test already covers them; full list in `docs/ROUTINE-BUDGET-2026-10-22.md`).
6b. **Two short lists only you know (tell Claude or your ISA):** "refi list: <first name>, <note rate>, <loan type>,
   <month closed>" for each past loan (feeds Monday's Refi Watch), and "sphere list: <first name>, <relation>,
   <birthday>, <home anniversary>" (feeds the monthly touches). Nothing is quoted or sent from either.
7. **Share the ISA Portal with your ISA/EA** (Share menu) — it now has today's list and a "Hand to Vanessa" box.

Claude already did (2026-10-22): one Vanessa queue every dashboard writes; push-buttons on the Command Deck (run the
cycle, triage inbox, recap meetings, draft follow-ups, TC intake); seven standing cross-functional pods; morning brief
across the three dashboards at 6:34 AM; cloud routine usage cut ~34%; backup moved after the weekly reset and re-run.

## Start here (2026-10-20) — one paste reconnects this Mac · about 15 minutes

- **Open Terminal and paste this one line, answer y.** Your Mac has been silent on the dashboard since 2026-10-13. The paste restarts the runner, installs Kapso (WhatsApp) and the Inkbox voice SDK, checks Jarvis and your key files, then asks for your mobile number and the Kapso key (Keychain only, hidden; Enter skips). It never signs in, pairs, sends or pays. Paste the REPORT it prints back to Claude.
   `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash connect-all.sh`
- **The six things only you can do** (the paste prints them again): (1) Kapso sign-in: run `claude`, type `/mcp`, choose kapso, sign in; then message (202) 474-5223 from your phone. (2) Vanessa's voice on iMessage: `bash integrations/voice-setup.sh <your Vanessa thread id>`, then paste section 8 of integrations/mac-task-specs.md into the runner task vanessa-morning-brief-text. (3) claude.ai → Settings → Connectors → Inkbox: Reconnect (also EVRoutes, Turo). (4) Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". (5) `bash integrations/cli-anything-harnesses/connect.sh` and sign in once to ShowingTime, Showami, homes.com. (6) Say "Composio links" to Claude for TikTok, GoHighLevel, Discord, HeyGen.
   - Open Connectors: https://claude.ai/settings/connectors
   - Open Zoho CRM: https://crm.zoho.com/
- **After the paste, in any Claude Code session in the Repo folder:** type `/paste` for this list, `/connections` for what is not connected and the fix, `/owner marketing` for who keeps a dashboard panel alive. (7) Pabbly: reply "yes, build the Kapso app", then build the six workflows in `integrations/pabbly/WORKFLOWS.md`.

## Start here (2026-10-14) — WhatsApp with Vanessa, two pastes on the Mac

Kapso gave Vanessa **(202) 474-5223**. In Terminal, in the Repo folder (`git pull` first):
1. `bash integrations/kapso/install-mac.sh install --apply` — installs the Kapso plugin and MCP for every Claude Code session.
2. `bash integrations/kapso/install-mac.sh keys --allow 1<your 10-digit mobile>` — stores your number as the only one Vanessa answers, then asks for the Kapso project API key (hidden prompt; from app.kapso.ai → your project → API keys).
3. Then `claude` → type `/mcp` → pick **kapso** → sign in once in the browser. Check with `bash integrations/kapso/install-mac.sh doctor`.
4. Save (202) 474-5223 in your phone as *Vanessa (WhatsApp)* and send her a message. Answer it from any Claude Code or Orca session with "answer my WhatsApp"; the unattended 5-minute reply task is `integrations/mac-task-specs.md` §5c (register it on the runner when you want her replying on her own).

## Start here (2026-10-13) — two things, 5 minutes

- **Mac, Terminal, in the Repo folder — stop the three Mac feed tasks that keep erasing the deck's fresh news:**
  `runnerctl pause openrouter-feeds-refresh && runnerctl pause feeds-weekly && runnerctl pause feeds-market-close && runnerctl list`
  (the cloud routines already write those feeds; the Mac copies were supposed to be paused on Oct 5 and were not).
- **Phone:** from tomorrow 6:48 AM a Vanessa push notification carries the morning brief (weather, needs-you,
  calendar, headlines, on this day, birthdays, Bears, market, rates). The Mac's 6:40 AM iMessage says "ok" but you
  did not receive it: open Messages → the [phone masked] / @jasmine thread; if nothing arrived today, in Terminal run
  `runnerctl run vanessa-morning-brief-text` and paste what it prints to Claude. To let cloud routines text you too,
  connect Inkbox once at https://claude.ai/customize/connectors.
- **One click, weather every day:** open https://claude.ai/code/routines/trig_01Y1zZ3bmawgi4Mw2jNw9ZFM and add the AccuWeather connector to that routine (Claude cannot attach connectors to a routine on this plan). Until then weather is refreshed only when you ask Claude in a chat.
- **One click:** the USC study planner failed Sunday on the usage cap — press Run now at
  https://claude.ai/code/routines/trig_01VkpVzzqPkGtXPS24E4JNKP.

## Start here (2026-10-12) — three pastes, then a short "only you" list

- **A. Mac 1, then Mac 2:** Terminal → `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash go.sh` → answer `y`. Does every safe step (brain, Agent OS, Laya, Orca check, browser hands, skill packs, Jarvis, events scan, health report) and prints a report to paste back to Claude.
- **B. Alienware:** PowerShell → `cd $HOME\Repo; git fetch origin; git checkout claude/stoic-cori-pvn3f8; git pull; powershell -ExecutionPolicy Bypass -File go.ps1` → answer `y`.
- **C. Only you:** pair Orca (link into the hidden prompt only), Zoho API tick, keys into `~/.config/*/.env`, sign in once to ShowingTime / Showami / homes.com / Strava, AnyDesk IDs into the Computer Hub card, phone health update + Orca app, one reply (LPT DRE, two posts, video replica, "defaults"), three short emails (Ticor, ARIVE, Zoho admin).

The 34 numbered steps below remain as the detailed reference.

1. **Switch off the duplicate weekly loops (they burned the usage allowance).** Claude already cut your routines from about 199 to 139 runs a week and moved three daily ones to the cheaper model (Oct 9). These three you created yourself, so only you can switch them off: each reads the whole dashboard every Sunday and repeats Saturday's loop. Open each link and turn the switch off. The last one is optional.
   - Weekly Loop Engineering QA: https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY
   - Weekly improvement loop: https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX
   - Weekly self-improvement loop: https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX
   - Weekly opportunity audit (optional): https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU
2. **Restart your health numbers (Apple Health).** The tiles are about 25 days old. Open the Claude app on your iPhone, say "update my health stats in Notion", and allow the Apple Health read and the Notion write once.

## 2 · One reply to Claude · 2 minutes (Copy, fill the blanks, send in this chat)

3. **Answer the open questions in one message.** Your personal DRE #01988316 is saved. Still needed: LPT Realty's own California DRE brokerage number and exact entity name (the two queued posts and the CRMLS application wait on them), and what kind of Zoho key you have (a Client ID + Client Secret from the Zoho API Console, or something else; never paste the key itself). Put 'no' for Plaid unless you want it. (Google Drive is done: Claude connected it read-only on 2026-10-09.)
   `LPT DRE: ______ (entity name: ______) · Zoho: client id+secret / other: ______ · Plaid: no`
   - California DRE: https://www.dre.ca.gov/
4. **Approve or decline the two queued posts.** After the reply above: Command Deck → Marketing panel → open each draft and its compliance review → set its stage to Approved or Declined.
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d

## 3 · Mac, one sitting · about 45 minutes (Terminal first; then one command does the rest and asks before every change)

5. **Open Terminal and find your Repo folder.** No web link can open Terminal on your Mac. Press Command + Space, type Terminal, press Return. Copy and run the line below; it prints the path of the folder that holds MAC-SETUP.sh (that is your Repo folder). If it prints nothing, run: git clone https://github.com/chitown034/Repo.git. Then type cd and a space, drag that folder from Finder into the window, press Return.
   `find ~ -maxdepth 5 -name MAC-SETUP.sh -not -path '*/node_modules/*' 2>/dev/null`
6. **Switch to the branch that holds today's files.** The new scripts are on the branch claude/stoic-cori-pvn3f8, not the repo's default branch, so a plain git pull misses them. If it complains about changes you made, stop and tell Claude; do not discard them. The last line should print the file name.
   `git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && ls mac-bootstrap.sh`
7. **Preview, then run the one command.** mac-bootstrap.sh replaces the old seven pastes: harness update, pausing the three duplicate Mac feed tasks, Opus 5.5, browser-use / OpenDesign / API Anything, WhatsApp (iPhone next to you for the QR code), the Second Brain, and the connection check. It asks yes/no before every change and Enter means no. Run the first line to see everything it would do, then the second. When it finishes, paste the MAC COMBINED REPORT block into this chat.
   `./mac-bootstrap.sh --dry-run
./mac-bootstrap.sh --also zoho,lofty,connections --with-claude`
8. **Fix the OmniRoute failover so it kicks in when Claude runs out.** OmniRoute itself is running, but the switch-over scripts were never installed, so nothing changes when you hit the limit. First the read-only check, which prints PASS / WARN / FAIL with the fix for each gap; then the installer, which asks yes/no before every change. Paste the doctor output back (it prints no secrets). The installer now also asks to turn on keep-going: start your sessions with claude-auto --keep-going, and when Claude runs out just type /exit and press Enter. The same conversation continues on OmniRoute's free models, then goes back to Claude once it resets. Client data never goes to the free route.
   `claude-auto --doctor
bash integrations/omniroute-failover/install-failover.sh --dry-run
bash integrations/omniroute-failover/install-failover.sh
claude-auto --doctor`
9. **Turn on remote control for Claude on each Mac (this computer first).** Run the first line once by hand: answer y to Enable Remote Control, accept the folder trust, then press Ctrl+C. Then the second line installs a LaunchAgent that keeps it running (asks first). The third line prints one report line: paste it into the Remote Control card on the Command Deck (Toolkit tab). Repeat on the other Mac. In Claude Desktop type /remote-control in the Code tab, or turn on Settings > Claude Code > Connect new sessions to Remote Control, and that session joins the same list at claude.ai/code and on your phone.
   `claude remote-control
bash integrations/remote-control/rc-agent.sh install
bash integrations/remote-control/rc-agent.sh report`
   - Open Command Deck: https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d
   - Open the sessions list: https://claude.ai/code
10. **Pair Orca between the two Macs (and the phone).** On Mac 1 run serve and keep that window open (it prints a pairing link). On Mac 2 run pair and paste the link at the hidden prompt, then do the reverse so each Mac can reach the other. A pairing link is a secret equal to control of that Mac's agents: pair only on your home network or your own private network, never paste a link into chat, the dashboard or the repo. Desktop control is never granted. Then run report and paste its line into the same card.
   `bash integrations/remote-control/orca-remote.sh serve
bash integrations/remote-control/orca-remote.sh pair
bash integrations/remote-control/orca-remote.sh report`
11. **Turn on Claude Mods (one command).** Five mods are built, checked and ready: a status line showing which AI route you are on, a Proceed/Cancel guard before any send, share or payment, /remember to save a rule into the brain, Blast Radius, and /replay to review Claude's edits. Run this in Terminal from your Repo folder, type y once, then open a new Claude Code session. To turn them all off later: add --off.
   `git pull && bash integrations/mods/install-mods.sh`
   - What each mod does: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/mods/RECOMMENDATIONS.md
11b. **Give Claude browser hands and a skill finder (5 minutes, new 2026-10-10).** Installs agent-browser and Playwright for Claude Code, copies the new skills, and ends with a self-test that types an address into a test page and clicks Search. It asks y/N before each step. Then copy the 3-line block it prints into Claude Desktop → Settings → Developer → Edit Config. Paste the last lines back here.
   `bash integrations/browser-agents/install.sh --dry-run
bash integrations/browser-agents/install.sh`
12. **Type your keys into the files (never into chat).** The command above creates empty ~/.config/zoho/.env and ~/.config/lofty/.env with only the variable NAMES. Open each with the line below, type the value after each equals sign, save. Zoho needs five: ZOHO_ACCOUNTS_URL, ZOHO_API_URL, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (the two URLs depend on your Zoho data centre: .com, .eu, .in...). If TextEdit shows a formatting bar choose Format → Make Plain Text before saving. Lofty's key is already working.
   `open -e ~/.config/zoho/.env`
13. **Pause the Discord poller until a bot token exists.** vanessa-discord-inbox runs every 5 minutes with no token, about 288 runs a day. Pause (do not delete) it: run the line below on the Mac.
   `runnerctl pause vanessa-discord-inbox && runnerctl list`
14. **Sign in by hand to ShowingTime, Showami and homes.com.** The connection check in the bootstrap tells you which of them needs a sign-in. Sign in once in the agent Chrome it opens. Agents never type your passwords. SkySlope and zipForms stay locked until compliance signs off.

## 4 · Accounts and settings · about 30 minutes (Sign-ins and permission ticks only you can do; say "done N" after each)

15. **Zoho: tick the API permission.** This is why Zoho returns 403, not a missing key. Zoho CRM → Setup → Security Control → Profiles → your profile → Developer Permissions → tick "Zoho CRM API Access". If your key is a Client ID + Secret, also create a Self Client in the Zoho API Console with scopes ZohoCRM.modules.ALL,ZohoCRM.settings.READ and generate the refresh token. Then say "Zoho done".
   - Open Zoho CRM: https://crm.zoho.com/
   - Zoho API Console: https://api-console.zoho.com/
16. **Composio sign-ins: GoHighLevel, Discord bot.** Google Drive no longer needs this: Claude reached your Drive Second Brain folder through the claude.ai connector. These two still read "initiated, no account". The links expire 10 minutes after they are made, so say "Composio links" when you sit down, then sign in to each. For GoHighLevel, also say what it is for.
17. **claude.ai connectors and Claude Desktop.** Strava and Eromify need you to sign in again (Strava is why the training tiles stopped). EVRoutes fails to connect (error 402) and PlayMCP never finished: reconnect them or remove them. In Claude Desktop → skills settings, upload integrations/claude-desktop/kevin-mentor.zip and delete the old cole-mentor skill.
   - Open Connectors: https://claude.ai/settings/connectors
18. **Cloud network access for the rate websites.** In a Claude Code cloud session: title bar → environment → Edit → Network access. Add these:
   `fred.stlouisfed.org www.freddiemac.com www.redfin.com`

## 5 · Applications and emails · 15 minutes (Drafts are in integrations/CONNECT-PLAN-2026-10-09.md section 6; nothing has been sent)

19. **Send three short messages.** (1) Ticor: ask your Ticor Title Sales Executive or Customer Service whether an API or bulk export of Ticor Property Data exists and on what terms. (2) CRMLS: your broker (LPT) applies for the RESO Web API data licence at licensing@crmls.org; there will be no scraper. (3) Dotloop: apply for developer / partner access at info.dotloop.com/developers. Each is your signature, so Claude only drafted them.
   - Open the drafts: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/CONNECT-PLAN-2026-10-09.md
   - Ticor Property Data: https://ticorpropertydata.com/
20. **Optional: switch on the free-then-paid failover.** Claude subscription first; when it runs out, OmniRoute free models take over at once; OpenRouter is the paid third tier, capped at $25 a month, and stays off until you do this. Create an OpenRouter key yourself, set the key's own credit limit to $25, load no more than $25, then follow the Three-tier failover steps. It returns to Claude by itself when the allowance resets.
   - Open the steps: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/omniroute-failover/README.md
   - OpenRouter: https://openrouter.ai/

## 6 · Decisions · one reply (Each defaults to no; nothing is spent without your yes)

21. **Decide the AI Steve video replica (plan is ready).** context.dev is connected. The weekly real-estate and loan-officer video plan is in integrations/ai-replica-studio/PLAN.md. To start Claude needs five answers: (1) which avatar provider, or none yet (HeyGen works through Composio but is paid and not connected; the CAM page was not applied to and its price is not published); (2) built-in voice or a cloned voice on your own ElevenLabs account; (3) platforms and cadence (assumed one of each a week to Facebook, Instagram, LinkedIn, YouTube); (4) LPT Realty's brokerage DRE number and name plus your personal NMLS ID for the disclosure line; (5) whether the three social timers run as a routine or through Buffer. You record your own consent and samples; nothing posts without your approval each week.
   `replica: provider ______ · voice ______ · cadence 1+1/week · LPT DRE ______ · NMLS ID ______ · timers routine/Buffer`
   - Read the plan: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/ai-replica-studio/PLAN.md
22. **Reply 'defaults' or change any line.** Google Drive: done, connected read-only (one file; Claude holds its catalogue, not its contents, until you say the notes can be indexed). Plaid: no (keys may cost). Terms-of-service reviews for Redfin market pages, lender rate pages and builder pages: Alexandra drafts, you decide each. SkySlope and zipForms: stay locked until compliance signs off. APInation: tell Claude what you want it to do before any paid use. Orca phone app: your call.
   `defaults: Drive notes indexed yes/no ___ · Plaid no · ToS reviews later · SkySlope/zipForms locked · APInation: ______`

## 7 · Verify the brain, Jarvis, Laya and Vanessa's voice · 3 minutes (Last, once the Mac steps above are done; nothing is changed except two local files)

23. **Check Jarvis, Laya and Vanessa's voice on your Mac.** One command checks Jarvis's memory, the real Laya model, the vault, Vanessa's recorded voice clips and the brain, and says the one thing to fix for each. It changes only a voice-profile copy in ~/.config/jarvis. Then the brain's own self-check runs. Paste the last lines back and Claude updates the dashboards.
   `cd ~/Projects/Repo 2>/dev/null || cd "$(dirname "$(find ~ -maxdepth 5 -name mac-bootstrap.sh 2>/dev/null | head -1)")"; git pull && bash integrations/jarvis/jarvis-setup.sh --apply; bin/brain loop | head -20`
   - What it checks: https://github.com/chitown034/Repo/blob/claude/stoic-cori-pvn3f8/integrations/jarvis/README.md

Reply "done N" (or "skip N") after each step and Claude keeps the dashboards in step.

## 8 · New this round (2026-10-11) · about 45 minutes (same as steps 24-32 on the Action Desk; each asks before it changes anything)

24. **Browser hands and skill finder (Mac).** `bash integrations/browser-agents/install.sh --dry-run` then without `--dry-run`.
25. **Skill packs (Mac).** `bash integrations/skill-packs/install-mac.sh --dry-run` then without. Registry of what was read and what is held: `integrations/skill-packs/REGISTRY-2026-10-11.md`.
26. **Alienware PC (Windows PowerShell).** `Set-ExecutionPolicy RemoteSigned -Scope Process`, then `.\integrations\alienware\alienware-setup.ps1 -Action Doctor`, then `-Action Install -DryRun`, then `-Action Install`. Never run on Windows yet: send any error word for word.
27. **AnyDesk on every computer and tablet.** Type each AnyDesk ID (not the password) into the Computer Hub card on the Command Deck. Set unattended-access passwords yourself inside AnyDesk.
28. **New Command Deck panels: published (2026-10-11).** Command Deck, Action Desk and 2nd Brain 4D are live. ISA Portal left alone (repo copy older than live); say "update the ISA portal" to add the animations.
29. **Ultimate Web Scraper connector (optional).** claude.ai > Settings > Connectors > Add custom connector > `https://ultimatewebscraper.com/claudemcp`. Unverified (unreachable from the sandbox): read its pricing and privacy first; never client data.
30. **ARIVE API email** and the Zoho / SkySlope / Dotloop / Ticor steps: `integrations/loan-stack/CONNECTIONS.md`.
31. **Held tools (default no):** Apify, vidIQ connection, OpenRouter for Jev, Remotion licence; Skool MCP not recommended.
32. **First real events scan and real data for the trading desk (optional).**
33. **Turn on the Agent OS on each computer.** Mac 1, Mac 2 and the Alienware, one paste each; steps in integrations/agent-os/README.md. Read-only by default; the warnings name what to install.
34. **Connect Orca and Laya on each Mac.** `bash integrations/agent-os/connect-orca-laya.sh --apply` (preview first without --apply). Then pair Orca yourself with the two commands it prints.
35. **OpenStock market viewer (optional).** `bash integrations/openstock/openstock.sh install --apply`, then a free Finnhub key into `~/Applications/OpenStock/.env`. Trading Desk panel has Open/Start.

### 1i. Fieldy meeting digests — your call (added 2026-10-23)

The daily "Fieldy → brain" task writes a digest of each recorded meeting (first names, Fieldy's summary, action items) to `memory/fieldy-meetings.md` in the repo. The repo is public today (step 1g). The digest never reaches the 6D page or Drive, but it is in the repo. Say "keep the Fieldy digest" or "make the repo private first" — until then the task runs and the file stays first-names-only.


---

<!-- source file: docs/inventory/agent-roster.md -->
# FILE: docs/inventory/agent-roster.md

# AI agent roster on the Mac (aiTeamRoster doc, generatedAt 2026-09-16T00:52:37+00:00, count 173; code-validator added 2026-10-12; seven desk seats added 2026-10-22 — not yet in the Mac's roster-tiers.json)

| slug | tier | lead | model | role |
|---|---|---|---|---|
| a11y-architect | 2 | ecc-accessibility-lead | sonnet | Accessibility Architect specializing in WCAG 2.2 compliance for Web and Native platforms. |
| access-auditor | 2 | ciso-elena | opus | Report under Elena (CISO): audits who and what can read or write each data store — dashboard db rules, connector grants, tokens in plaintext |
| ad-compliance-reviewer | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): reviews marketing copy, social posts, emails, ad text and webinar registration pages for mortgage/real- |
| agent-evaluator | 2 | caio-nadia | opus | Evaluates agent output against 5-axis quality rubric (accuracy, completeness, clarity, actionability, conciseness). |
| appraisal-manager | 2 | cco-alexandra | sonnet | Report under Alexandra (Compliance): manages the appraisal — ordering expectations under AMC rules, preparing the comparable support package |
| architect | 2 | cto-derek | opus | Software architecture specialist for system design, scalability, and technical decision-making. |
| automation-engineer | 2 | cto-derek | sonnet | Report under Derek (CTO): builds and repairs the automation layer — cloud routines (RemoteTrigger), desktop scheduled tasks, /loop prompts,  |
| bookkeeper | 2 | cfo-marcus | sonnet | Report under Marcus (CFO): categorizes transactions, drafts reconciliations, flags duplicates, subscriptions and anomalies, and prepares the |
| borrower-retention-agent | 2 | cro-victor | opus | Report under Victor (CRO): owns the relationship after funding — the post-close touch calendar, annual mortgage reviews, equity and PMI-remo |
| broker-coach-maxwell | 2 | vanessa-orchestrator | opus | Maxwell, Broker Mentor & Coach on Steven Shearrill's AI Team — a top-1%-in-the-nation California real estate broker, wholesale mortgage brok |
| build-error-resolver | 3 | — | sonnet | Build and TypeScript error resolution specialist. |
| buyer-matching-engine | 2 | cro-victor | sonnet | Report under Victor (CRO): runs the buyer side — the consultation that captures real criteria, the search strategy, property matching agains |
| buyers-agent-elite | 2 | cro-victor | sonnet | Report under Victor (CRO): the buyer-side representation practitioner — preps Steven or his showing agent to walk into a consultation, a tou |
| ca-loan-processor | 2 | cco-alexandra | sonnet | Top-1%-caliber mortgage Loan Processor — runs the actual file assembly and condition-clearing, not the coaching conversation. |
| ca-transaction-coordinator | 2 | cro-victor | opus | Top-1%-caliber California real estate Transaction Coordinator — runs the operational file, not the coaching conversation. |
| ca-underwriter | 2 | cco-alexandra | opus | Top-1%-caliber mortgage Underwriter's-eye analysis — reads a file the way DU/LPA and a manual underwriter actually would, and tells Steven e |
| caio-nadia | 1 | vanessa-orchestrator | opus | Nadia, Chief AI Officer on Steven Shearrill's AI Team — separating where AI genuinely helps a mortgage / real-estate / trading / nonprofit o |
| capability-engineer | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator, on the AI Agent Engineering Team: extends what the agents and skills can actually DO once their core rel |
| cco-alexandra | 1 | vanessa-orchestrator | opus | Alexandra, Chief Compliance Officer on Steven Shearrill's AI Team — TRID (LE 3 business days, CD 3 business days), RESPA §8, Reg Z LO comp a |
| cfo-marcus | 1 | vanessa-orchestrator | opus | Marcus, Chief Financial Officer on Steven Shearrill's AI Team — cash position, P&L, net worth, budget, liabilities, Road to a Million, deal  |
| chief-automation-strategist | 1 | vanessa-orchestrator | opus | Steven Shearrill's Chief Automation Strategist and AI Agent Orchestration Architect. |
| chief-of-staff | 3 | — | sonnet | Personal communication chief of staff that triages email, Slack, LINE, and Messenger. |
| ciso-elena | 1 | vanessa-orchestrator | opus | Elena, Chief Information Security Officer on Steven Shearrill's AI Team — data and cyber risk sized for a solo operator handling client PII  |
| client-concierge | 2 | cro-victor | sonnet | Report under Victor (CRO): runs the white-glove layer around a transaction — move coordination, utility and address-change checklists, home  |
| closing-coordinator | 2 | cro-victor | sonnet | Report under Victor (CRO): runs the file from clear-to-close to funded — CD timing, final figures reconciliation, signing logistics includin |
| cmo-sofia | 1 | vanessa-orchestrator | opus | Sofia, Chief Marketing Officer on Steven Shearrill's AI Team — brand voice, campaigns, content calendar, webinars (VA Loan Mastermind Live,  |
| code-architect | 3 | — | opus | Designs feature architectures by analyzing existing codebase patterns and conventions, then providing implementation blueprints with concret |
| code-explorer | 2 | cto-derek | sonnet | Deeply analyzes existing codebase features by tracing execution paths, mapping architecture layers, and documenting dependencies to inform n |
| code-reviewer | 3 | — | opus | Expert code review specialist. |
| code-simplifier | 3 | — | sonnet | Simplifies and refines code for clarity, consistency, and maintainability while preserving behavior. |
| code-validator | 2 | cto-derek | opus | Report under Derek (CTO): the code-validation gate — validates every code change a human or agent makes before it is called done: scripts/validate-code.sh, then the VibeBreaker 20-pass adversarial review of the diff; reports evidence, never patches. |
| comment-analyzer | 3 | — | opus | Analyze code comments for accuracy, completeness, maintainability, and comment rot risk. |
| commission-tracker | 2 | cfo-marcus | sonnet | Report under Marcus (CFO): tracks every dollar Steven is owed — real-estate commissions through the LPT split and cap, MLO compensation, ref |
| competitive-intelligence-analyst | 2 | cro-victor | opus | Report under Victor (CRO): benchmarks Steven against the agents, brokerages and lenders actually competing for his buyers — MLS production s |
| content-writer | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): writes finished posts, newsletters, follow-up sequences and listing one-pagers in Steven's brand voice for militar |
| conversation-analyzer | 3 | — | opus | Use this agent when analyzing conversation transcripts to find behaviors worth preventing with hooks. |
| cpp-build-resolver | 3 | — | sonnet | C++ build, CMake, and compilation error resolution specialist. |
| cpp-reviewer | 3 | — | opus | Expert C++ code reviewer specializing in memory safety, modern C++ idioms, concurrency, and performance. |
| credit-analyst | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): reads a credit report for mortgage purposes — tradeline analysis, score-band strategy, rapid-rescore ca |
| cro-victor | 1 | vanessa-orchestrator | opus | Victor, Chief Revenue Officer on Steven Shearrill's AI Team — pipeline math, speed-to-lead, conversion, follow-up cadence, agent and ISA per |
| csharp-reviewer | 3 | — | opus | Expert C# code reviewer specializing in .NET conventions, async patterns, security, nullable reference types, and performance. |
| cto-derek | 1 | vanessa-orchestrator | opus | Derek, Chief Technology Officer on Steven Shearrill's AI Team — automation health, cloud routines and desktop scheduled tasks, connectors (C |
| cto-innovator | 1 | vanessa-orchestrator | opus | Elon, the CTO Innovator on Steven Shearrill's AI Team — the inward architect and technical gatekeeper. |
| dart-build-resolver | 3 | — | sonnet | Dart/Flutter build, analysis, and dependency error resolution specialist. |
| data-steward | 2 | cto-derek | sonnet | Report under Derek (CTO): keeps the dashboards' data honest — feed freshness (which feeds are Due, what source refreshes each), drift betwee |
| database-reviewer | 3 | — | opus | PostgreSQL database specialist for query optimization, schema design, security, and performance. |
| deal-desk-analyst | 2 | cro-victor | opus | Report under Victor (CRO): prepares the negotiation memo for a real-estate offer or listing — comps context handed in, seller-credit room by |
| disruption-scout | 1 | vanessa-orchestrator | opus | Reports to Nadia (CAIO): the outward scanning sub-agent that tracks the external AI landscape week by week — new models, agent frameworks, o |
| django-build-resolver | 3 | — | sonnet | Django/Python build, migration, and dependency error resolution specialist. |
| django-reviewer | 3 | — | opus | Expert Django code reviewer specializing in ORM correctness, DRF patterns, migration safety, security misconfigurations, and production-grad |
| doc-updater | 3 | — | sonnet | Documentation and codemap specialist. |
| docs-lookup | 2 | caio-nadia | sonnet | When the user asks how to use a library, framework, or API or needs up-to-date code examples, use Context7 MCP to fetch current documentatio |
| document-intake-clerk | 2 | ca-transaction-coordinator | sonnet | Report under Carmen (CA TC, Victor's line): reads each new contract and disclosure package and enters its dates into tcDeals; flags every missing or conflicting date for Carmen. Drafts only — never signs or sends. |
| document-intelligence-agent | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): reads a loan file's documents — classifies, extracts the figures that matter, cross-checks them against |
| e2e-runner | 3 | — | sonnet | End-to-end testing specialist using Vercel Agent Browser (preferred) with Playwright fallback. |
| ecc-accessibility-lead | 2 | cto-derek | sonnet | ECC AI employee reporting to Derek (CTO). |
| ecc-agent-safety-officer | 2 | caio-nadia | sonnet | ECC AI employee reporting to Nadia (CAIO). |
| ecc-dependency-steward | 2 | ciso-elena | sonnet | ECC AI employee reporting to Elena (CISO). |
| ecc-observability-lead | 2 | cto-derek | sonnet | ECC AI employee reporting to Derek (CTO). |
| ecc-security-steward | 2 | ciso-elena | sonnet | ECC AI employee reporting to Elena (CISO). |
| ecc-standards-officer | 2 | cto-derek | opus | Reports under Derek (CTO): the authority on the ECC engineering standards installed at ~/.claude/rules/ecc/. |
| ecc-test-architect | 2 | cto-derek | sonnet | ECC AI employee reporting to Derek (CTO). |
| efficiency-engineer | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator, on the AI Agent Engineering Team: re-engineers workflows, skills, routines and dashboard code for speed  |
| escalation-recovery-agent | 2 | vanessa-orchestrator | sonnet | Reports to Vanessa: handles the file that has gone wrong — a blown closing date, a denied loan, a failed appraisal, an angry client or partn |
| fastapi-reviewer | 2 | cto-derek | opus | Reviews FastAPI applications for async correctness, dependency injection, Pydantic schemas, security, OpenAPI quality, testing, and producti |
| fitness-trainer | 2 | vanessa-orchestrator | sonnet | Strength and conditioning coach on Steven's Apple Health section — builds his progressive weekly training plan from his workout history, hea |
| flutter-reviewer | 3 | — | opus | Flutter and Dart code reviewer. |
| fsharp-reviewer | 3 | — | opus | Expert F# code reviewer specializing in functional idioms, type safety, pattern matching, computation expressions, and performance. |
| fundamental-analyst | 2 | portfolio-manager | opus | Step 3 of the AI Hedge Fund Team research committee. |
| gan-evaluator | 3 | — | sonnet | GAN Harness — Evaluator agent. |
| gan-generator | 3 | — | sonnet | GAN Harness — Generator agent. |
| gan-planner | 3 | — | sonnet | GAN Harness — Planner agent. |
| geo-aeo-optimizer | 2 | cmo-sofia | opus | Report under Sofia (CMO): optimises Steven's visibility inside AI answers — ChatGPT, Claude, Perplexity, Google AI Overviews and AI Mode — t |
| go-build-resolver | 3 | — | sonnet | Go build, vet, and compilation error resolution specialist. |
| go-reviewer | 3 | — | opus | Expert Go code reviewer specializing in idiomatic Go, concurrency patterns, error handling, and performance. |
| harmonyos-app-resolver | 3 | — | sonnet | HarmonyOS application development expert specializing in ArkTS and ArkUI. |
| harness-optimizer | 2 | caio-nadia | opus | Analyze and improve the local agent harness configuration for reliability, cost, and throughput. |
| health-coach-analyst | 2 | vanessa-orchestrator | opus | Health coach and analyst on Steven's Apple Health section — reads his metrics, trends, workouts and sleep from the apple-health MCP and his  |
| healthcare-reviewer | 3 | — | opus | Reviews healthcare application code for clinical safety, CDSS accuracy, PHI compliance, and medical data integrity. |
| homelab-architect | 3 | — | sonnet | Designs home and small-lab network plans from hardware inventory, goals, and operator experience level, with safe staged changes and rollbac |
| incentives-programs-scout | 2 | cfo-marcus | opus | Report under Marcus (CFO): finds and verifies incentives, rebates, grants, tax credits, down-payment assistance, veteran benefits and promot |
| inspection-repair-negotiator | 2 | cro-victor | sonnet | Report under Victor (CRO): runs the inspection period — coordinating inspections, reading reports for what is material versus cosmetic, buil |
| integration-engineer | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator, on the AI Agent Engineering Team: owns the stability of every plugin, connector, MCP server, bridge and  |
| investor-client-manager | 2 | cro-victor | sonnet | Report under Victor (CRO): serves investor clients — rental analysis with real cap rate, cash-on-cash and DSCR math, 1031 exchange timelines |
| java-build-resolver | 3 | — | sonnet | Java/Maven/Gradle build, compilation, and dependency error resolution specialist. |
| java-reviewer | 3 | — | opus | Expert Java code reviewer for Spring Boot and Quarkus projects. |
| kotlin-build-resolver | 3 | — | sonnet | Kotlin/Gradle build, compilation, and dependency error resolution specialist. |
| kotlin-reviewer | 3 | — | opus | Kotlin and Android/KMP code reviewer. |
| lead-triage-analyst | 2 | cro-victor | opus | Report under Victor (CRO): triages Lofty leads — new leads since a given time, first-response gaps against the 5-minute SLA, missin |
| listing-agent-elite | 2 | cro-victor | opus | Report under Victor (CRO): the seller-side representation practitioner — preps Steven to win the listing appointment and then run the listin |
| loan-servicing-transfer | 2 | cco-alexandra | sonnet | Report under Alexandra (Compliance): handles the post-funding period — servicing transfer notices and the 60-day grace period, first payment |
| loop-operator | 2 | caio-nadia | sonnet | Operate autonomous agent loops, monitor progress, and intervene safely when loops stall. |
| lpt-recruiting-downline | 2 | cro-victor | sonnet | Report under Victor (CRO): builds Steven's LPT Realty attraction and revenue-share organisation — recruiting pipeline, the value case for ag |
| luxury-market-specialist | 2 | cro-victor | opus | Report under Victor (CRO): handles the upper-tier property — pricing where comparables are thin, discreet and off-market marketing, jumbo an |
| market-scout | 2 | portfolio-manager | opus | First stop on the AI Hedge Fund Team research committee. |
| marketing-agent | 3 | — | opus | Marketing strategist and copywriter for campaign planning, audience research, positioning, copy creation, and content review. |
| mbs-market-intelligence | 2 | cfo-marcus | opus | Report under Marcus (CFO): tracks what actually moves mortgage rates — MBS coupon pricing, the 10-year, Fed policy and the economic calendar |
| meal-planner | 2 | vanessa-orchestrator | sonnet | Nutrition planner on Steven's Apple Health section — builds his weekly meal plan and grocery list from deck doc healthGoals and what his dat |
| meeting-scribe | 2 | vanessa-orchestrator | sonnet | Report under Vanessa: recaps Fieldy conversations and Zoom meetings — decisions, action items, open questions — and hands action items to vanessaQueue. Never sends a follow-up. |
| military-licensing-partnerships | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): tracks NMLS licensing and CE across Steven's states, researches requirements for target military market |
| military-relocation-specialist | 2 | cro-victor | opus | Report under Victor (CRO): owns the relocation client — PCS timelines and orders, BAH-versus-ownership analysis, base-area intelligence for  |
| mktg-affiliate-partnerships | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): hunts residual and affiliate income — products, tools, platforms and sponsorships Steven can credibly endorse to h |
| mktg-analytics-lead | 2 | cmo-sofia | opus | Report under Sofia (CMO): measures what marketing actually produced — source attribution across Lofty and Zoho, cost per lead, cost |
| mktg-brand-strategist | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): owns positioning, brand architecture and the message hierarchy across Steven's four brands — Patriot Pacific MLO,  |
| mktg-creative-designer | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): owns visual identity and creative direction across every asset — brand kit, templates, ad creative, listing collat |
| mktg-direct-mail-farming | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): runs geographic farming and direct mail — farm selection on turnover and absorption math, mail piece copy and cade |
| mktg-email-campaign-manager | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): owns email and SMS lifecycle — nurture sequences, database reactivation, newsletters, post-close campaigns and eve |
| mktg-listing-marketing-specialist | 2 | cmo-sofia | opus | Report under Sofia (CMO): builds the full marketing package for a listing or buyer campaign — MLS remarks, property one-pager, just-listed/j |
| mktg-paid-ads-manager | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): plans, drafts and analyses paid campaigns — Google Search/PMax, Meta, YouTube, LinkedIn — plus the nonprofit's Goo |
| mktg-pr-media-relations | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): earns media — podcast guesting, local press, HARO/Qwoted-style source requests, award and ranking submissions, spe |
| mktg-reputation-manager | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): runs reviews and reputation — Google Business Profile, Zillow, Experience.com, Facebook — the ask cadence at the r |
| mktg-social-media-manager | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): runs the platform-native social calendar (LinkedIn, Facebook, Instagram, YouTube, TikTok, Nextdoor) for military/v |
| mktg-video-producer | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): scripts and plans video — short-form (Reels/Shorts/TikTok), YouTube long-form, listing tours, client testimonials  |
| mle-reviewer | 3 | — | opus | Production machine-learning engineering reviewer for data contracts, feature pipelines, training reproducibility, offline/online evaluation, |
| modelmatch-partner-network | 2 | cro-victor | sonnet | Report under Victor (CRO): works the Model Match database (modelmatch.com) to find, rank and network with producing real estate agents — usi |
| mortgage-analytics-lead | 2 | cfo-marcus | opus | Report under Marcus (CFO): the numbers behind the lending business — pipeline by stage with real pull-through, cycle time by milestone, lead |
| mortgage-broker-elite | 2 | cro-victor | opus | Report under Victor (CRO): the senior mortgage authority on Steven's AI Team — a top-1%, 30-year wholesale/retail broker and former underwri |
| mortgage-guideline-agent | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): answers 'does this scenario fit, and under which rule' with the actual citation — agency guidelines (Fa |
| mortgage-intake-agent | 2 | cro-victor | sonnet | Report under Victor (CRO): takes a qualified lead to a complete, submission-ready application — the structured intake interview, the documen |
| mortgage-isa-ai | 2 | cro-victor | sonnet | Report under Victor (CRO): owns the first five minutes — drafts the instant response, the qualification script, VA eligibility pre-screening |
| mortgage-qa-auditor | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): pre- and post-close file audits — disclosure completeness and timing, fee tolerance and cures, signatur |
| network-architect | 3 | — | sonnet | Designs enterprise or multi-site network architecture from requirements, using existing network skills for focused routing, validation, auto |
| network-config-reviewer | 3 | — | opus | Reviews router and switch configurations for security, correctness, stale references, risky change-window commands, and missing operational  |
| network-troubleshooter | 3 | — | sonnet | Diagnoses network connectivity, routing, DNS, interface, and policy symptoms with a read-only OSI-layer workflow and evidence-backed root ca |
| new-construction-specialist | 2 | cro-victor | sonnet | Report under Victor (CRO): owns new-construction representation in Temecula, Murrieta, Menifee and Southwest Riverside County — builder ince |
| news-analyst | 2 | portfolio-manager | opus | Step 4 of the AI Hedge Fund Team research committee. |
| nonprofit-grant-writer | 2 | nonprofit-grants-lead | opus | Reports under nonprofit-grants-lead (Marcus/CFO line): writes the actual grant applications for Steven's 501(c)(3) — needs statement, progra |
| nonprofit-grants-lead | 2 | cfo-marcus | opus | Reports under Marcus (CFO): runs the Active Duty Veteran & Hometown Hero Homeowners Club, Inc. |
| open-house-captain | 2 | listing-agent-elite | sonnet | Report under Marguerite / Gwen (Victor's line): turns the open-house sign-in sheet into leads, thank-you drafts and an ISA call list. Drafts only — never sends or writes to the CRM. |
| opensource-forker | 3 | — | sonnet | Fork any project for open-sourcing. |
| opensource-packager | 3 | — | sonnet | Generate complete open-source packaging for a sanitized project. |
| opensource-sanitizer | 3 | — | sonnet | Verify an open-source fork is fully sanitized before release. |
| performance-optimizer | 3 | — | opus | Performance analysis and optimization specialist. |
| phishing-triage | 2 | ciso-elena | sonnet | Report under Elena (CISO): triages a suspicious email, text or call — wire-instruction changes, closing-fund requests, 'urgent' lender/escro |
| php-reviewer | 3 | — | opus | Expert PHP code reviewer specializing in PSR-12 compliance, PHP type system, Eloquent ORM patterns, security, and performance. |
| planner | 2 | cto-derek | sonnet | Expert planning specialist for complex features and refactoring. |
| portfolio-manager | 2 | vanessa-orchestrator | opus | Final step (7) of the AI Hedge Fund Team research committee. |
| pr-test-analyzer | 3 | — | opus | Review pull request test coverage quality and completeness, with emphasis on behavioral coverage and real bug prevention. |
| predictive-lead-mining | 2 | cro-victor | opus | Report under Victor (CRO): identifies likely future sellers from LAWFULLY available signals — public records (probate, trustee's deeds, tax  |
| premium-lead-partnerships | 2 | cro-victor | sonnet | Report under Victor (CRO): manages paid and referral lead sources — Zillow Flex, Opendoor, Realtor.com, OpenDoor/offerpad cash-offer alterna |
| python-reviewer | 3 | — | opus | Expert Python code reviewer specializing in PEP 8 compliance, Pythonic idioms, type hints, security, and performance. |
| pytorch-build-resolver | 3 | — | sonnet | PyTorch runtime, CUDA, and training error resolution specialist. |
| quant-analyst | 2 | portfolio-manager | opus | Step 5 of the AI Hedge Fund Team research committee. |
| rag-pipeline-reviewer | 3 | — | opus | Reviews RAG (Retrieval-Augmented Generation) pipelines for retrieval quality, chunking strategy, embedding choices, and evaluation coverage. |
| rate-pricing-optimizer | 2 | cro-victor | opus | Report under Victor (CRO): best-execution analysis across wholesale lenders — comparing rate sheets, LLPAs, lender credits and buydown struc |
| re-market-analytics | 2 | cfo-marcus | opus | Report under Marcus (CFO): produces the market intelligence behind pricing and listing presentations — absorption and months of inventory, m |
| react-build-resolver | 3 | — | sonnet | Diagnose and fix React build failures across Vite, webpack, Next.js, CRA, Parcel, esbuild, and Bun. |
| react-reviewer | 3 | — | opus | Expert React/JSX code reviewer specializing in hook correctness, render performance, server/client component boundaries, accessibility, and  |
| realtor-reciprocity-agent | 2 | cro-victor | opus | Report under Victor (CRO): tracks referrals sent and received with each realtor partner, scores the reciprocity balance, flags partners owed |
| refactor-cleaner | 3 | — | sonnet | Dead code cleanup and consolidation specialist. |
| refi-watch-analyst | 2 | cro-victor | sonnet | Report under Harrison (Victor's line): weekly rate-vs-note-rate prep list of past clients and borrowers above the market average — market average, not a quote. Never quotes, locks or messages a borrower. |
| refinance-hunter | 2 | cro-victor | opus | Report under Victor (CRO): scans the past-client database and pipeline for refinance opportunities — rate-and-term savings, PMI removal at 8 |
| reliability-engineer | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator, on the AI Agent Engineering Team: owns uptime and error-rate reduction across the agents, skills, routin |
| research-analyst | 2 | caio-nadia | opus | Report under Nadia (CAIO): multi-source research with graded sources (primary > official > reputable press > blogs), contradiction notes and |
| risk-manager | 2 | portfolio-manager | opus | Step 6 of the AI Hedge Fund Team research committee — the devil's advocate. |
| rust-build-resolver | 3 | — | sonnet | Rust build, compilation, and dependency error resolution specialist. |
| rust-reviewer | 3 | — | opus | Expert Rust code reviewer specializing in ownership, lifetimes, error handling, unsafe usage, and idiomatic patterns. |
| sandbox-qa | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator: runs the isolated test-and-compare step of the weekly self-improvement loop. |
| security-reviewer | 3 | — | opus | Security vulnerability detection and remediation specialist. |
| seo-specialist | 3 | — | sonnet | SEO specialist for technical SEO audits, on-page optimization, structured data, Core Web Vitals, and content/keyword mapping. |
| showing-coordinator | 2 | cro-victor | sonnet | Report under Victor (CRO): turns a client's showing plan from the Command Deck Showings tab (or a pasted list) into the complete coordinatio |
| silent-failure-hunter | 3 | — | opus | Review code for silent failures, swallowed errors, bad fallbacks, and missing error propagation. |
| spec-miner | 3 | — | sonnet | Extracts behavioral specs from existing codebases for OpenSpec. |
| sphere-nurture-coordinator | 2 | cmo-sofia | sonnet | Report under Sofia (CMO), with Wren: monthly past-client and sphere touch drafts — birthdays, home anniversaries, check-ins. Drafts only — never sends or writes to Lofty. |
| stress-test-engineer | 1 | vanessa-orchestrator | opus | Reports to Elon, the CTO Innovator, on the AI Agent Engineering Team: designs and runs structured load, edge-case, failure-injection, concur |
| swift-build-resolver | 3 | — | sonnet | Swift/Xcode build, compilation, and dependency error resolution specialist. |
| swift-reviewer | 3 | — | opus | Expert Swift code reviewer specializing in protocol-oriented design, value semantics, ARC memory management, Swift Concurrency, and idiomati |
| tax-deadline-analyst | 2 | cfo-marcus | opus | Report under Marcus (CFO): maintains the tax calendar (federal/CA estimated payments, entity filings, Statement of Information, BOI, 1099 se |
| tdd-guide | 3 | — | sonnet | Test-Driven Development specialist enforcing write-tests-first methodology. |
| technical-analyst | 2 | portfolio-manager | opus | Step 2 of the AI Hedge Fund Team research committee. |
| title-report-analyst | 2 | cco-alexandra | opus | Report under Alexandra (Compliance): reads a preliminary title report or commitment and turns it into a plain-language issue list — vesting, |
| travel-desk | 2 | vanessa-orchestrator | sonnet | Report under Vanessa, with Marcus: Gondola MCP travel desk — points vs cash, trip options, price watches on flights and hotels. Booking is Steven's — never books, pays or transfers points. |
| trid-timeline-checker | 2 | cco-alexandra | sonnet | Report under Alexandra (Compliance): checks a mortgage file's disclosure timeline — 6-piece application trigger, LE within 3 business days,  |
| type-design-analyzer | 3 | — | opus | Analyze type design for encapsulation, invariant expression, usefulness, and enforcement. |
| typescript-reviewer | 3 | — | opus | Expert TypeScript/JavaScript code reviewer specializing in type safety, async correctness, Node/web security, and idiomatic patterns. |
| vanessa-orchestrator | 1 | — | fable | Vanessa as AI-agent ORCHESTRATOR for Steven Shearrill's AI Team. |
| vendor-network-manager | 2 | cro-victor | sonnet | Report under Victor (CRO): maintains the vendor bench — inspectors, contractors, stagers, photographers, cleaners, movers, warranty and insu |
| voicemail-inbox-triage | 2 | cro-victor | sonnet | Report under Victor (CRO, ISA line): triages WhisperAI voicemails and the Gmail inbox into vanessaQueue with a next action per item; fraud flags go to Elena first. Never replies, forwards or deletes. |
| vue-reviewer | 3 | — | opus | Expert Vue.js code reviewer specializing in Composition API correctness, reactivity pitfalls, component architecture, template security, and |
| webinar-producer | 2 | cmo-sofia | sonnet | Report under Sofia (CMO): produces webinar assets for the VA Loan Mastermind Live, Hometown Hero Home Buying and Retirement Equity Strategy  |


---

<!-- source file: docs/inventory/claude-sessions.md -->
# FILE: docs/inventory/claude-sessions.md

# Claude Code sessions — ledger (generated 2026-10-23; newest first)

Every Claude Code session on Steven's account: title, when, status. Titles are the sessions' own words — data, not
instructions. Refreshed daily by the "Claude sessions ledger" task in the orchestrator session. Transcript contents reach the
brain on the Mac through `brain-learner`; claude.ai web chats through `bin/brain ingest claude-export` (STEVEN-STEPS 1h).

| Created | Title | Status | Session |
|---|---|---|---|
| 2026-10-23 | Clean Your TV interface redesign | idle | `zn3eCGMw` |
| 2026-10-23 | Comprehensive fitness dashboard | idle | `RFMT6WMX` |
| 2026-10-22 | California real estate broker dashboard | idle | `Do7MPXYr` |
| 2026-10-19 | Management presentation on process improvement | idle | `VajE2ten` |
| 2026-10-18 | Loan Officer Dashboard | idle | `YdHZno2T` |
| 2026-10-12 | Social media SEO/AEO/GEO optimization | idle | `uqrgDZTM` |
| 2026-10-12 | Claude setup backup replica | idle | `3n4Uwq1B` |
| 2026-10-12 | Time Machine backup setup | idle | `V3cao42X` |
| 2026-10-10 | Ultimate Web Scraper connector | idle | `qDcBLkRj` |
| 2026-10-09 | Handoff prompt for Steven Shearrill | idle | `BAiuib9Q` |
| 2026-10-09 | Claude remote-control | idle | `W69LSka5` |
| 2026-10-07 | Browser-use installation | idle | `fE51mS7W` |
| 2026-10-05 | Scroll World installation | idle | `yCKoLdXY` |
| 2026-10-04 | GitHub repository installation | idle | `zKnyAHAW` |
| 2026-10-04 | Grok bots dashboards | idle | `HFxdejBP` |
| 2026-10-04 | Mortgage leads CRM system | idle | `rFzKYj1e` |
| 2026-09-27 | Dashboard website content update | idle | `GF38McZU` |
| 2026-09-27 | Four interactive dashboards with daily updates | idle | `qX8fGcUa` |
| 2026-09-27 | Social SDK installation | idle | `pLQAvaX8` |
| 2026-09-22 | OpenBot installation | idle | `BKdx8VmW` |
| 2026-09-22 | Automation dashboard and AI agent audit | running | `nupjoLP1` |
| 2026-09-22 | OpenJarvis installation | idle | `Kc52UK34` |
| 2026-09-22 | OmniRoute fallback setup | idle | `Tkudh1Q9` |
| 2026-09-22 | Second brain optimization framework | idle | `hpBLaHzY` |
| 2026-09-22 | Bonsai demo installation | idle | `jv9Rfo7m` |
| 2026-09-22 | Orca installation | idle | `oAo3CKSZ` |
| 2026-09-22 | PrismML 27B parameter LLM | idle | `Q23Z2Pr4` |
| 2026-09-22 | Laya installation | idle | `ihK5YPXV` |
| 2026-09-16 | DeepSeek Harness and Omarchy setup | idle | `qPEccFem` |
| 2026-09-15 | Claude cookbooks installation | idle | `6PGWykv8` |
| 2026-09-15 | Codex plugin installation | idle | `8rq6jj29` |
| 2026-09-15 | Commit Claude Code token-optimization setup to fork | idle | `tbxtPjK4` |
| 2026-09-15 | Push token-optimization commit to fork (files embedded) | idle | `GgPSQyGF` |
| 2026-09-15 | Push token-optimization commit to fork | idle | `NbyrULg5` |
| 2026-09-15 | Install Perplexity Comet MCP and public APIs | idle | `YytLcJiK` |
| 2026-09-15 | Installing claude-video and Whisper | idle | `izUgByoA` |
| 2026-09-15 | Token optimization implementation | idle | `H9XHmZ9g` |
| 2026-09-13 | NAVWAR program manager dashboard | idle | `BiJe5uQv` |
| 2026-09-13 | CLI-Anything skills and MCPs installation | idle | `WTDr51GZ` |
| 2026-09-13 | Defense Industry Dashboard | idle | `2ekLzQPw` |
| 2026-09-13 | Military family office website | idle | `1aQxv4g3` |
| 2026-09-13 | Fix daysold_test 9-day stamp reading 8d | archived | `V9vyGsgN` |
| 2026-09-12 | Second Brain live check | archived | `yaXwV3WE` |
| 2026-09-12 | Alex honchar claude for life sync | archived | `ZMYLokZD` |
| 2026-09-12 | Bible reference guide interactive page | archived | `XfuAZW39` |
| 2026-09-12 | Open terminal | archived | `yCdgxjwq` |
| 2026-09-12 | Multiple repository installations | archived | `Hf6VXdH1` |
| 2026-09-12 | OpenTerminal installation | archived | `huxAd3Rr` |
| 2026-09-12 | Claude-fable-5.1 AI agents setup | archived | `8yCABGFo` |
| 2026-09-12 | Connect to NotebookLM as second brain | archived | `s49my8Df` |
| 2026-09-12 | Connect notebook LM as second brain | archived | `Hx2P4ioj` |
| 2026-09-11 | AI model generation with Eromify | archived | `UYDPUpBS` |
| 2026-09-11 | Install awesome-ai-tools-for-ui and ui-ux-pro-max-skill | archived | `8y92xFDz` |
| 2026-09-11 | Claude-cowork markdown file | archived | `xVsrkwdf` |
| 2026-09-11 | Claude-fable-5.1 markdown file | archived | `6DDy3GZZ` |
| 2026-09-11 | Free tools and projects | archived | `Ywzg8wQv` |
| 2026-09-11 | Install ponytail and agent-skills | archived | `CiuVVFdJ` |
| 2026-09-10 | Install linkedin_scraper and linkedin-mcp-server | archived | `hQBji1Ph` |
| 2026-09-10 | Gods-eye-view installation | archived | `jQK2Qrjj` |
| 2026-09-10 | Arcads Claude Code installation | archived | `UGSbEctc` |
| 2026-09-10 | TradingView Claude Code bridge | archived | `Hkse9v4j` |
| 2026-09-10 | LLM council skill integration | archived | `aea8NypR` |
| 2026-09-08 | Claude Desktop tools folder organization | archived | `1RCCecio` |
| 2026-09-08 | Heretic installation | archived | `Ny9QB6uf` |
| 2026-09-08 | Claude Apple Health integration | archived | `gp8FRXpw` |
| 2026-09-08 | Magica | archived | `AuY1BpjZ` |
| 2026-09-07 | Personal delegation and automation system | pending | `8yJjxU1u` |
| 2026-09-07 | AIHedgeFundTeam installation | archived | `EYostnhn` |
| 2026-09-07 | Kronos installation | archived | `c1Yrn2tf` |
| 2026-09-07 | Claude Code TradingView bridge setup | archived | `V5RbbjCA` |
| 2026-09-07 | Install Graphify | archived | `ZnA3fhou` |
| 2026-09-07 | Graphify installation | archived | `BXQMvdMu` |
| 2026-09-07 | Claude TradingView Desktop integration | archived | `94JviAe4` |
| 2026-09-07 | stevens-macbook-pro-local-logical-puffin | archived | `Apray1cC` |
| 2026-09-07 | Desktop skill files loop engineer approach | archived | `7JbrSuUC` |
| 2026-09-07 | Available skills inventory | archived | `zL1htXi8` |
| 2026-09-07 | Perplexity-via-Composio and Magica MCP connections | archived | `7d577xPF` |
| 2026-09-07 | stevensheard89e-luminous-newt | archived | `kJNJXxKy` |
| 2026-09-07 | stevens-macbook-pro-local-linked-nova | archived | `GePp1s74` |
| 2026-09-07 | Obsidian-skills installation | archived | `iq4MBj2R` |
| 2026-09-07 | Obsidian-skills installation | archived | `35kfX5Yz` |
| 2026-09-07 | Ruflo installation | archived | `nKwYHv7N` |
| 2026-09-07 | Ruflo installation | archived | `U7yHE16X` |
| 2026-09-07 | OmniRoute installation | archived | `vxpH5Uya` |
| 2026-09-07 | OmniRoute installation | archived | `28khFCP2` |
| 2026-09-07 | Claude-video installation | archived | `kFPqe6TT` |
| 2026-09-07 | claude-video installation | archived | `fgzigsWr` |
| 2026-09-07 | Heretic installation | archived | `2nqRqCSE` |
| 2026-09-07 | Heretic installation | archived | `m142hhJA` |
| 2026-09-07 | AI job search installation | archived | `JQeVQmRX` |
| 2026-09-07 | ai-job-search installation | archived | `Bhpn6Tvw` |
| 2026-09-07 | OpenJarvis installation | archived | `6uFCQgLX` |
| 2026-09-07 | OpenJarvis installation | archived | `sy2acrue` |
| 2026-09-07 | QR code scanning and pairing | archived | `hhdZEZRE` |
| 2026-09-06 | Agency: 147 Pre-Built Agents installation | archived | `iptTAATs` |
| 2026-09-06 | AIHedgeFundTeam setup | archived | `Cf1dPJ8d` |
| 2026-09-05 | stevens-macbook-pro-local-toasty-leaf | archived | `xiyP65bM` |
| 2026-09-04 | stevens-macbook-pro-local-linked-gosling | archived | `LhdQXgKF` |
| 2026-09-03 | Install freellmapi | archived | `yvasMriV` |
| 2026-09-03 | freellmapi installation | idle | `a6kHFqqF` |


---

<!-- source file: docs/inventory/cloud-routines-2026-10.md -->
# FILE: docs/inventory/cloud-routines-2026-10.md

# Cloud routines added or rewritten in October 2026 (agent-created, `meta_mcp`; editable by agents)

The 2026-09-22 listing is `cloud-routines.md`; this file carries what was created since. Same columns so
`bin/brain toolkit` reads both.

| Routine | Cron (UTC) | Enabled | Last run | Next | Created | id |
|---|---|---|---|---|---|---|
| Health daily sync — Apple Health (Drive export) + Strava → deck (6:15 AM PT; `appleHealth`, `stravaSnapshot`, `healthDriveSync`) | `CRON_TZ=America/Los_Angeles 15 6 * * *` | True | first run by hand 2026-10-23 | 2026-10-24 | 2026-10-23 | trig_015pqDNGrZVENHZEZR8JZYF5 |
| Vanessa — Chief of Staff daily cycle (weekdays 6:25 AM PT, parallel squads) | `CRON_TZ=America/Los_Angeles 25 6 * * 1-5` | True | — | 2026-10-21 | 2026-10-20 | trig_019whypw6EeNu2G8xxY5xE5N |
| Command Deck — daily freshness sweep (writer, Claude; once a day since 2026-10-22, per-key cadence) | `40 15 * * *` | True | SUCCEEDED @ 2026-10-20T15:40 | twice daily | 2026-10-12 | trig_01Y1zZ3bmawgi4Mw2jNw9ZFM |
| Command Deck — morning feeds (writer, Claude) | `5 13 * * *` | True | SUCCEEDED @ 2026-10-20T13:08 | daily | 2026-10-05 | trig_01BVuP52qPuqEvfvxL48YgZz |
| Command Deck — market close (writer, Claude) | `20 21 * * 1-5` | True | SUCCEEDED @ 2026-10-19T21:20 | weekdays | 2026-10-05 | trig_01LmhuxXi3waJWpZfqiCfgJH |
| VA Command Center — weekly avatar content drafts | `CRON_TZ=America/Los_Angeles 58 14 * * 0` | True | SUCCEEDED @ 2026-10-18T21:58 | Sunday | 2026-10-09 | trig_01916Qx1LASXu7MwP1ZKSWJD |
| Scrape queue runner | `CRON_TZ=America/Los_Angeles 7 9 * * *` | True | SUCCEEDED @ 2026-10-19T16:08 | daily | 2026-10-08 | trig_01CsARHDYnqZS8wVSornXoGH |
| AI twin autopilot (posts only approved items) | `CRON_TZ=America/Los_Angeles 57 7 * * *` | True | SUCCEEDED @ 2026-10-20T14:58 | daily | 2026-10-05 | trig_01JbMx3a3KA6cJv2zMdBAE6k |
| Attraction Command Center: daily cloud run | `CRON_TZ=America/Los_Angeles 40 6 * * 1-5` | True | SUCCEEDED @ 2026-10-20T13:40 | weekdays | 2026-10-05 | trig_01H7zYh3EteR8hJoeffebRWv |
| RoleCompass daily job hunt (v4) | `CRON_TZ=America/Los_Angeles 40 6 * * *` | True | SUCCEEDED @ 2026-10-20T13:40 | daily | 2026-10-05 | trig_01Sac7gQ2GdGdCYPti7JsrgB |
| Transaction & Showing desk — TC + showing assistant (weekdays 6:05 AM PT, before the cycle) | `CRON_TZ=America/Los_Angeles 5 6 * * 1-5` | True | SUCCEEDED @ 2026-10-22T14:10 | weekdays | 2026-10-22 | trig_011iofWVNizNQ1SNujNcp5tL |
| Vanessa — morning brief across the dashboards (6:34 AM PT; push + writes the iMessage/voice script; since 2026-10-23 e-mails the brief to Steven when the iMessage line is unlinked) | `CRON_TZ=America/Los_Angeles 34 6 * * *` | True | SUCCEEDED @ 2026-10-22T13:49 (as the 6:48 brief) | daily | 2026-10-13 | trig_01Q9VPMwrKwNUW3kZL54rKgy |
| Refi watch — weekly prep list (Mon 7:20 AM PT, drafts only) | `CRON_TZ=America/Los_Angeles 20 7 * * 1` | True | — | 2026-10-26 | 2026-10-22 | trig_014ipr6x9z35psmtHJCPVqj1 |
| Sphere & past-client touches — monthly drafts (day 11, 7:40 AM PT, drafts only) | `CRON_TZ=America/Los_Angeles 40 7 11 * *` | True | — | 2026-11-11 | 2026-10-22 | trig_01Pn8xLNKTVVFYjYTj8d8JTd |
| Weekly ecosystem backup — cloud writer (Sunday, after the allowance reset) | `7 21 * * 0` | True | SUCCEEDED @ 2026-10-22T14:16 (catch-up) | Sunday | 2026-09-22 | trig_01JcPh3AM2z21Bsv34SvSkqM |
| 6D Brain — daily rebuild and republish (3:30 AM PT, this session) | `CRON_TZ=America/Los_Angeles 30 3 * * *` | True | — | daily | 2026-10-21 | trig_01MQ7HRYTh27b8uUM4BtnFXE |
| Fieldy → brain (daily meeting digest; first names only) | `CRON_TZ=America/Los_Angeles 50 6 * * *` | True | ran 2026-10-23 (0 recordings) | daily | 2026-10-23 | trig_019KqDTnzqefUGApMscmswAJ |
| Presence audit — AI search visibility (monthly, Sofia) | `CRON_TZ=America/Los_Angeles 10 7 1 * *` | True | — | 2026-11-01 | 2026-10-23 | trig_01GCu51vT22M9nxAohu82cfa |
| Vanessa inbox sweep (cloud) — hourly fallback behind the Mac pollers, day and night since 2026-10-24 (hourly is the platform floor for a cloud routine): unanswered iMessages (Inkbox), Command Deck chat-box questions (vanessaChat), Discord #vanessa (Composio discordbot once connected); logs to agentInbox | `CRON_TZ=America/Los_Angeles 17 * * * *` | True | ran 2026-10-24 01:17 UTC | hourly, 24/7 | 2026-10-24 | trig_018cLszdipa7WAVt5nd8BuXT |
| Big moves — Vanessa's four courses of action (4 each: big moves · self-improvement/loop engineering · risks · opportunities) + questions block + top 10, learn, queue approved, org sync, 6D republish; also fired by the 6D Approve button (EXECUTE NOW mode, since 2026-10-23) | `CRON_TZ=America/Los_Angeles 5 6 * * *` | True | — | 2026-10-24 | 2026-10-23 | trig_014QQGp4WQfWGDVB827R4Qb9 |
| Claude sessions ledger (docs/inventory/claude-sessions.md, daily) | `CRON_TZ=America/Los_Angeles 52 3 * * *` | True | ran 2026-10-23 | daily | 2026-10-23 | trig_01THsaAdhiWX1zauBQX23LrX |
| Second Brain layers weekly sync (export → Drive SB Docs → Notion directory → layers report) | `CRON_TZ=America/Los_Angeles 45 14 * * 0` | True | — | 2026-10-26 | 2026-10-23 | trig_01MR463NSmSAcA84zJHjerUp |


---

<!-- source file: docs/inventory/cloud-routines.md -->
# FILE: docs/inventory/cloud-routines.md

# Cloud routines (claude.ai/code/routines) — live listing pulled 2026-09-22 08:09 UTC

| Routine | Cron (UTC) | Enabled | Last run | Next | Created | id |
|---|---|---|---|---|---|---|
| Account Health Check | `0 17 * * 1` | True | SUCCEEDED @ 2026-09-21T17:09 | 2026-09-28T17:01 | 2026-09-06 | trig_01286edKBozYKNuvZzKhwvVi |
| Books Reconciliation Reminder | `0 22 * * 5` | True | FAILED @ 2026-09-18T22:01 | 2026-09-25T22:00 | 2026-09-06 | trig_01ETFd8biiJjDxqL12qVJVqc |
| Command Deck & ISA Portal Weekly Loop Engineering QA | `0 16 * * 0` | True | FAILED @ 2026-09-20T16:06 | 2026-09-27T16:05 | 2026-09-07 | trig_013ocJfEDdmSAgDPVaiCzMZY |
| Command Deck Brief | `45 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:45 | 2026-09-22T13:45 | 2026-09-06 | trig_01JoMrjYotXAJfJ14MFFJMAf |
| Command Deck — AI Hedge Fund Team remote run (reads the ticker requested on the dashboard) | `0 12 * * 1` | True | SUCCEEDED @ 2026-09-21T12:05 | 2026-09-28T12:04 | 2026-09-07 | trig_01SfPuG5Lhi8EbBGc6q8NKqW |
| Command Deck — Econoday calendar refresh | `45 12 * * *` | True | SUCCEEDED @ 2026-09-21T12:46 | 2026-09-22T12:45 | 2026-08-29 | trig_013eacow5AcXCf346rB2ev6s |
| Command Deck — Elite Affluent Tracker weekly refresh | `0 16 * * 0` | True | FAILED @ 2026-09-20T16:09 | 2026-09-27T16:08 | 2026-08-31 | trig_01HfL39UYunpMm56NSJuh8LK |
| Command Deck — Elite Rewards-Optimization Scan | `0 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:18 | 2026-09-22T13:05 | 2026-08-30 | trig_01MoxrJsdS5ZZ7Yru21uLnJC |
| Command Deck — FERS engine + federal salary calculator annual refresh (GS/58 localities/VA/TSP) | `0 16 10 1 *` | True | SUCCEEDED @ 2026-09-13T21:34 | 2027-01-10T16:07 | 2026-09-07 | trig_01VTHBCjiWsE2MURQnwzEifW |
| Command Deck — News daily refresh | `0 14 * * *` | True | SUCCEEDED @ 2026-09-21T14:01 | 2026-09-22T14:00 | 2026-09-04 | trig_01NYWycyhzZGWtNfeavLGsuU |
| Command Deck — Next Big Moves weekly review | `0 15 * * 0` | True | FAILED @ 2026-09-20T15:07 | 2026-09-27T15:06 | 2026-08-31 | trig_01Lb3aYRQZSLsAkcnDpZ8zEL |
| Command Deck — On This Day & Birthdays daily midnight refresh | `0 7 * * *` | True | SUCCEEDED @ 2026-09-22T07:08 | 2026-09-23T07:02 | 2026-09-01 | trig_01FDN3HkHaW2SM1GrpSEzFg1 |
| Command Deck — Opportunity Radar research (daily 5am PT) | `0 12 * * *` | True | SUCCEEDED @ 2026-09-21T12:12 | 2026-09-22T12:02 | 2026-09-02 | trig_01Wus8zVhZNEs1hZUYNTFj3E |
| Command Deck — PE & Defense Innovation daily refresh | `0 14 * * *` | True | SUCCEEDED @ 2026-09-21T14:07 | 2026-09-22T14:05 | 2026-08-31 | trig_01KBb8qABK9HJXL5CuYQNWkR |
| Command Deck — Property Search & Tax-Data integrations health check (monthly) | `0 15 1 * *` | True | SUCCEEDED @ 2026-09-04T19:42 | 2026-10-01T15:05 | 2026-09-04 | trig_01TVFXodf4JhV9yp6oaYgYpK |
| Command Deck — Strava activity refresh | `0 3,15 * * *` | True | SUCCEEDED @ 2026-09-22T03:08 | 2026-09-22T15:08 | 2026-08-30 | trig_015Fm6K3R7yvyHv3SkPGXHwL |
| Command Deck — Trading strategy performance daily 3pm PST sync | `0 22 * * 1-5` | True | SUCCEEDED @ 2026-09-21T22:03 | 2026-09-22T22:07 | 2026-09-02 | trig_011CXFHCT3hou6uaCfb5rWkC |
| Command Deck — Travel & Experiences weekly refresh | `0 15 * * 1` | True | SUCCEEDED @ 2026-09-21T15:10 | 2026-09-28T15:05 | 2026-08-31 | trig_01Qgz9ZEvt2KYFqfAte8zVRi |
| Command Deck — Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT) | `0 23 * * 5` | True | FAILED @ 2026-09-18T23:03 | 2026-09-25T23:02 | 2026-09-08 | trig_01V6QrF6yENWiccduk94ubbs |
| Command Deck — Weather daily refresh | `0 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:02 | 2026-09-22T13:01 | 2026-09-04 | trig_01N2UuFmRj8VNpzke8Epdm4m |
| Command Deck — Weekly content edit reminder | `0 15 * * 1` | True | SUCCEEDED @ 2026-09-21T15:03 | 2026-09-28T15:01 | 2026-09-03 | trig_018RcDPPx35doBvNAxg8xTkQ |
| Command Deck — builder incentives refresh | `0 14 * * *` | True | SUCCEEDED @ 2026-09-21T14:00 | 2026-09-22T14:00 | 2026-08-29 | trig_01WkiZztThKWuATUCRwYP9fo |
| Command Deck — calendar refresh | `0 3,15 * * *` | True | SUCCEEDED @ 2026-09-22T03:07 | 2026-09-22T15:07 | 2026-08-31 | trig_011992fizYkQthCSRft4tqR1 |
| Command Deck — daily deals & hacks refresh | `0 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:14 | 2026-09-22T13:07 | 2026-08-29 | trig_015MZSefaw573ciFQSvoWDmZ |
| Command Deck — mortgage rates & market refresh | `15 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:16 | 2026-09-22T13:15 | 2026-08-29 | trig_017qftG3Aa7KDT7rCBSecp94 |
| Command Deck — top performers refresh | `30 13 * * *` | True | SUCCEEDED @ 2026-09-21T13:37 | 2026-09-22T13:36 | 2026-08-29 | trig_01XHhoPZpoxGcm2pcLD5DmQR |
| Command Deck — weather & news refresh | `0 1,5,13,17,21 * * *` | True | SUCCEEDED @ 2026-09-22T05:08 | 2026-09-22T13:06 | 2026-08-29 | trig_01LC6fUbVyaEF1nEFdGcQjU8 |
| Command Deck — weekly improvement loop (research → apply) | `0 16 * * 0` | True | FAILED @ 2026-09-20T16:06 | 2026-09-27T16:05 | 2026-08-29 | trig_013vYCzVa3vbHZ8BZZy6UBpX |
| Command Deck — weekly opportunity audit | `0 17 * * 0` | True | FAILED @ 2026-09-20T17:04 | 2026-09-27T17:04 | 2026-08-29 | trig_019NdM12eTVDHWy89Ch2sNtU |
| Command Deck — weekly self-improvement loop | `0 15 * * 0` | True | FAILED @ 2026-09-20T15:08 | 2026-09-27T15:07 | 2026-08-29 | trig_016qKE1TdRjzkpb2Yby8yWBX |
| Command Deck ↔ ISA Portal drift check (2x/day) | `0 2,14 * * *` | True | SUCCEEDED @ 2026-09-22T02:05 | 2026-09-22T14:07 | 2026-09-02 | trig_01PahyyhhmNzze1o1ujcGno2 |
| Command Deck ↔ ISA Portal — Pipeline Sync | `0 1,7,13,19 * * *` | True | SUCCEEDED @ 2026-09-22T07:08 | 2026-09-22T13:07 | 2026-08-30 | trig_018BSAYiYzvtyaUkpAY4SnqE |
| Content Calendar Review | `0 15 * * 1` | True | SUCCEEDED @ 2026-09-21T15:06 | 2026-09-28T15:04 | 2026-09-06 | trig_01QUMYcsP8UREwxzp41w4QJL |
| Financial Summary | `0 16 1 * *` | True |  @  | 2026-10-01T16:00 | 2026-09-06 | trig_01CAk1pekAM5AXRiwUxxdnru |
| Metrics Digest | `30 14 * * 1` | True | SUCCEEDED @ 2026-09-21T14:30 | 2026-09-28T14:30 | 2026-09-06 | trig_01SjkicmXr11d49QtmQ1H2wC |
| Morning Brief | `0 14 * * *` | True | SUCCEEDED @ 2026-09-21T14:09 | 2026-09-22T14:08 | 2026-09-06 | trig_01VYBYonPtRiKL3h3F6wTWuV |
| Ops Issue Review | `0 20 * * 5` | True | FAILED @ 2026-09-18T20:08 | 2026-09-25T20:07 | 2026-09-06 | trig_01JFtUymy9TXef3765urgZ36 |
| Project Risk Review | `0 21 * * 5` | True | FAILED @ 2026-09-18T21:07 | 2026-09-25T21:06 | 2026-09-06 | trig_01YHGFTYdWdVG5nFKCjmcd9M |
| R16 — Monthly marketing compliance sweep (Alexandra) | `0 16 1 * *` | True | SUCCEEDED @ 2026-09-13T23:45 | 2026-10-01T16:02 | 2026-09-09 | trig_01KDp9oB87M99NjUnyWiTbMd |
| R18 — Card credits and status deadlines (1st and 15th) | `0 15 1,15 * *` | True | SUCCEEDED @ 2026-09-15T15:01 | 2026-10-01T15:02 | 2026-09-09 | trig_0138GgRga2sggpEYbJapZnvN |
| R19 — USC study planner (Sunday evening) | `0 0 * * 1` | True | SUCCEEDED @ 2026-09-21T00:01 | 2026-09-28T00:00 | 2026-09-09 | trig_01VkpVzzqPkGtXPS24E4JNKP |
| Real Estate Weekly Brief | `0 15 * * 1` | True | ABANDONED @ 2026-09-21T15:08 | 2026-09-28T15:07 | 2026-09-07 | trig_01CjaMXrbMga1jPdJzUnwLUo |
| SEO Content Gap Audit | `0 17 1 * *` | True |  @  | 2026-10-01T17:06 | 2026-09-06 | trig_01FjDLMrJBa1dKEh7Nv7JJ4h |
| Social Calendar Planning | `30 15 * * 1` | True | SUCCEEDED @ 2026-09-21T15:31 | 2026-09-28T15:30 | 2026-09-06 | trig_01EivcMF7k68SHioBAdHGUPm |
| Weekly 1/5/10-Year Plan Review Reminder | `0 14 * * 1` | True | SUCCEEDED @ 2026-09-21T14:10 | 2026-09-28T14:08 | 2026-09-03 | trig_01W37dE7VHCqceffB159zNYr |
| Weekly dashboard refresh — Rent, Buy, or Wait | `0 15 * * 1` | True | ABANDONED @ 2026-09-21T15:08 | 2026-09-28T15:06 | 2026-09-07 | trig_01EBvRQ4Rv63EgrLihjNxwiG |
| Command Deck — On This Day & birthdays daily | `0 13 * * *` | False | SUCCEEDED @ 2026-09-04T13:01 | 2026-09-05T13:00 | 2026-08-31 | trig_0163ZLxLE9jaCcRBMJoHoTyL |
| Command Deck — Steve twin (works the twin queue, writes the brief) | `0 0,13,19 * * *` | False | ABANDONED @ 2026-09-09T00:06 | 2026-09-09T13:04 | 2026-09-07 | trig_0174717mnSfAk1LtQQVJhH7r |
| Command Deck ↔ ISA Portal comms bridge (hourly) | `7 * * * *` | False | SUCCEEDED @ 2026-09-09T02:07 | 2026-09-09T03:07 | 2026-09-07 | trig_01VpcvVPTrbdfvdbXn1mD7hB |
| Weekly Review (retired — replaced by desktop task r20-weekly-review-local) | `0 23 * * 5` | False | SUCCEEDED @ 2026-09-10T02:27 | 2026-09-11T23:01 | 2026-09-06 | trig_01LnPpmGfs4mQBfiVhe9dDs5 |


---

<!-- source file: docs/inventory/daily-updates.md -->
# FILE: docs/inventory/daily-updates.md

# Daily updates — what refreshes the three dashboards, and when (2026-10-23)

Steven, 2026-10-23: "ensure command deck, isa portal and 6d brain are updated daily." Every row below is a cloud routine on
his Claude subscription (ids in `cloud-routines-2026-10.md`) unless marked Mac. Times are Pacific. If a row's `last_run` is not
SUCCEEDED, the freshness sweep flags it and the Big-moves task raises a "Repair" move.

| Dashboard | What | When | Writer |
|---|---|---|---|
| Command Deck | morning feeds (headlines, on-this-day, Bears, opportunity radar) | 6:05 | cloud `morning feeds` |
| Command Deck | Four courses of action (16 moves) + questions + top 10 → `bigMoves` (items, coas, questions), `vanessaRecommendations` (lane field), `aiTeamOrg` | 6:05 | cloud `Big moves` |
| Command Deck | Chief-of-Staff cycle → `cosBrief`, `vanessaQueue` | 6:25 weekdays | cloud `daily cycle` |
| Command Deck | `morningBrief` + push (+ e-mail until iMessage is linked) | 6:34 | cloud `morning brief` |
| Command Deck | iMessage text + voice note (or e-mail with mp3) | 6:40 | Mac `vanessa-morning-brief-text`, `voice-reply-render` |
| Command Deck | weather & news, city and housing lists | 6:35 / evening | cloud `weather & news` |
| Command Deck | Apple Health tiles ← Health Auto Export files in Google Drive → `appleHealth`; Strava card ← Strava connector → `stravaSnapshot`; MyFitnessPal via Apple Health | 6:15 | cloud `Health daily sync` (`scripts/health-drive-sync.py`) |
| Command Deck | Fieldy meetings → `fieldyDesk`, `memory/fieldy-meetings.md` | 6:50 | cloud `Fieldy → brain` |
| Command Deck | freshness sweep (every stale key re-checked, per-key cadence) | 8:40 | cloud `freshness sweep` |
| Command Deck | market close | 14:20 weekdays | cloud `market close` |
| Command Deck | Lofty / Zoho pipeline, rates, calendar, Apple Health | 07:05 / 13:05 / 19:05 | Mac `fabric-deck-sync`, `lofty-crm-sync` |
| ISA Portal | `isaToday`, hand-offs, scorecard | 6:25 (inside the cycle) | cloud `daily cycle` |
| ISA Portal | housing-market lists, builder incentives, live feeds (mirror of the deck) | with each deck writer | the same cloud routines (MIRROR STEP) |
| 6D Brain | full rebuild from the repo (nodes, passages, layers, recs, Vanessa) | 3:30 | cloud `6D rebuild` |
| 6D Brain | four-lane panel + questions republish | 6:05 | cloud `Big moves` |
| 6D Brain | layers audit (`bin/brain layers`) | weekly Sun | cloud `layers` |
| Repo | sessions ledger, index, CI | daily / on push | cloud `sessions ledger`, GitHub Actions |

Checked 2026-10-23: every cloud routine's last run SUCCEEDED (pages 1–7 of the trigger list). The Mac side is the weak link
(`runnerStatus` v66 lists six tasks in error — `integrations/mac-task-specs.md` §9).

## Cloud routines not green on 2026-10-23 (read from the trigger list, all pages)

| Routine | Last run | Why | What happens |
|---|---|---|---|
| Things I Wish I Knew book — monthly (5th) | FAILED 2026-10-02 | usage limit reached that morning | re-runs 2026-11-05 by itself |
| Rent, Buy, or Wait — monthly (9th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-09 |
| Muster Point — monthly (8th) | FAILED 2026-10-02 | usage limit | re-runs 2026-11-08 |
| Nellis VA Webinar deck — monthly (7th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-07 |
| NAVWAR PM Deck — monthly (6th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-06 |
| Tech & AI Command Deck — monthly (3rd) | ABANDONED 2026-10-18 (manual re-fire) | session abandoned mid-run | re-runs 2026-11-03 |
| VA Command Center — monthly (4th) | ABANDONED 2026-10-18 (manual re-fire) | session abandoned mid-run | re-runs 2026-11-04 |
| Gridiron Codex — weekly Bears | ABANDONED 2026-10-20, now **disabled** | disabled 2026-10-22 | stays off unless Steven asks |

None of these feeds the three daily dashboards. They are heavy Opus research runs; firing all of them in one day is what tripped the
cap on Oct 1–2, so they were left on their own dates. Say "re-run the monthly refreshes" and they are fired one per hour.
Two guard routines are off by design (Strava wrapper guard, feed-freshness watchdog) — both replaced by the 15:40 UTC freshness sweep.


---

<!-- source file: docs/inventory/db-docs.md -->
# FILE: docs/inventory/db-docs.md

# Live artifact DB — collection `state` (161 docs exported 2026-09-22 ~08:10 UTC to scratchpad/db/state/<doc>.json)

| Doc | Bytes | Stamp |
|---|---|---|
| accounts | 1813 | (no stamp) |
| agentInbox | 12891 | updatedAt=2026-09-21T00:00:00Z |
| aiModels | 8341 | (no stamp) |
| aiNews | 3064 | (no stamp) |
| aiNewsResetToken | 38 | (no stamp) |
| aiTeamRoster | 56156 | generatedAt=2026-09-16T00:52:37+00:00 |
| annualTodo | 50 | (no stamp) |
| annualTodoExtra | 14 | (no stamp) |
| apexChat | 2989 | last.ts=2026-09-12T15:17:52.663Z |
| appleHealth | 22216 | syncedAt=2026-09-13T23:15:59Z |
| appointments | 1561 | last.date=2026-09-30 |
| appointmentsResetToken | 38 | (no stamp) |
| assetItems | 616 | (no stamp) |
| backupStatus | 1325 | syncedAt=2026-09-15T03:48:16Z |
| calendarSnapshot | 3960 | syncedAt=2026-09-21T19:26:51-07:00 |
| chatDiag | 968 | (no stamp) |
| ciLog | 21303 | last.date=2026-09-20 |
| ciLogResetToken | 44 | (no stamp) |
| city | 219 | (no stamp) |
| coachLog | 391 | last.ts=2026-09-10T13:46:35.795Z |
| coleChat | 14 | (no stamp) |
| councilLog | 14 | (no stamp) |
| councilPricing | 1272 | checkedAt=2026-09-16T03:41:49.841Z |
| cpiCycles | 1151 | (no stamp) |
| cpiOpportunityLog | 2025 | last.date=2026-09-22 |
| ctoLog | 1235 | last.ts=2026-09-11T12:28:57.410Z |
| dealChecklists | 14 | (no stamp) |
| dmaicProjects | 793 | (no stamp) |
| downtimeFound | 14 | (no stamp) |
| dreamFeatures | 1209 | (no stamp) |
| dreamProperties | 2859 | (no stamp) |
| editableOverrides | 14 | (no stamp) |
| eodRollup | 529 | syncedAt=2026-09-16T02:48:30.000Z |
| estateReview | 883 | (no stamp) |
| feasibilityChecks | 6611 | (no stamp) |
| fedSalaryCalc | 140 | (no stamp) |
| fersEngine | 660 | (no stamp) |
| foReviews | 147 | (no stamp) |
| goalCalories | 14 | (no stamp) |
| goalCarbs | 14 | (no stamp) |
| goalFat | 14 | (no stamp) |
| goalProtein | 14 | (no stamp) |
| grantPipeline | 447 | (no stamp) |
| healthAnalysis | 4111 | generatedAt=2026-09-13T01:08:00Z |
| healthInsight | 2024 | generatedAt=2026-09-13T23:36:09.179Z |
| healthMetrics | 3213 | last.date=-000060-01 |
| hfCommitteeMemo | 49132 | ranAt=2026-09-07T20:50:00-07:00 |
| hfMemoResetToken | 35 | (no stamp) |
| hfRequest | 926 | completedAt=2026-09-13T00:15:00.000Z |
| improvementProposals | 14 | (no stamp) |
| inboxTriage | 232 | syncedAt=2026-09-21T19:25:06-07:00 |
| inc-2ndpension | 13 | (no stamp) |
| inc-401k | 13 | (no stamp) |
| inc-capgains | 13 | (no stamp) |
| inc-dividends | 17 | (no stamp) |
| inc-federal-gs | 13 | (no stamp) |
| inc-flip | 13 | (no stamp) |
| inc-interest | 13 | (no stamp) |
| inc-mlo | 13 | (no stamp) |
| inc-navy | 19 | (no stamp) |
| inc-passive-other | 13 | (no stamp) |
| inc-post911 | 13 | (no stamp) |
| inc-realtor | 13 | (no stamp) |
| inc-rental | 17 | (no stamp) |
| inc-roth | 13 | (no stamp) |
| inc-royalty | 13 | (no stamp) |
| inc-sdira | 13 | (no stamp) |
| inc-ss | 18 | (no stamp) |
| inc-turo | 17 | (no stamp) |
| inc-usc-professor | 17 | (no stamp) |
| inc-va | 19 | (no stamp) |
| inc-w2-e3r | 18 | (no stamp) |
| inc-yield | 13 | (no stamp) |
| incentivePrograms | 82141 | updatedAt=2026-09-22T02:22:43Z |
| isaDailySchedule | 6029 | updatedAt=2026-09-10T07:40:12Z |
| isaKpi | 2203 | syncedAt=2026-09-13T17:24:00-07:00 |
| isaLine | 3887 | last.ts=2026-09-16T02:47:52.000Z |
| isaLineRead | 55 | (no stamp) |
| isaScorecard | 14 | (no stamp) |
| jamesChat | 7639 | last.ts=2026-09-12T15:04:26.199Z |
| kaizenBoard | 409 | (no stamp) |
| kanbanCards | 12102 | (no stamp) |
| kevinChat | 14 | (no stamp) |
| knowledgeFabric | 986 | syncedAt=2026-09-22T04:05:04Z |
| knowledgeGraph | 732 | syncedAt=2026-09-13T17:23:00-07:00 |
| leadResponse | 487 | syncedAt=2026-09-22T03:02:14Z |
| leadTriage | 1010 | ranAt=2026-09-21T18:33:00Z |
| liabilities | 632 | (no stamp) |
| licenseTracker | 2768 | (no stamp) |
| licenses | 1717 | (no stamp) |
| liveFeeds | 29185 | updatedAt=2026-09-22T08:05:35Z |
| localBridgeQueue | 3238 | updatedAt=2026-09-12T06:31:45Z |
| loopLog | 12402 | last.ts=2026-09-10T10:00:00Z |
| marketSnapshot | 4486 | (no stamp) |
| marketSnapshotResetToken | 44 | (no stamp) |
| marketingQueue | 29956 | last.ts=2026-09-13T16:34:55-07:00 |
| memberships | 8038 | (no stamp) |
| mtgGciDeals | 13 | (no stamp) |
| mtgGciPerDeal | 17 | (no stamp) |
| myCards | 1059 | (no stamp) |
| newsSnapshot | 14384 | syncedAt=2026-09-21 08:05 PM PDT |
| npFamilies | 13 | (no stamp) |
| npGrantFunding | 13 | (no stamp) |
| npHours | 13 | (no stamp) |
| openTerminalQueue | 2061 | updatedAt=2026-09-12T06:00:39Z |
| openTerminalSnapshot | 10450 | syncedAt=2026-09-13T22:47:04.496Z |
| openrouterCredits | 251 | checkedAt=2026-09-16T03:41:35.739Z |
| openrouterFeeds | 11219 | updatedAt=2026-09-13T22:51:28Z |
| peptideTracker | 778 | (no stamp) |
| pipeline | 14 | (no stamp) |
| plan10yr | 812 | (no stamp) |
| plan1yr | 834 | (no stamp) |
| plan5yr | 869 | (no stamp) |
| properties | 594 | (no stamp) |
| quickTasks | 96 | (no stamp) |
| ratesSnapshot | 4566 | syncedAt=2026-09-22T02:24:25Z |
| reGciDeals | 13 | (no stamp) |
| reGciPerDeal | 17 | (no stamp) |
| recruitPipeline | 14 | (no stamp) |
| referralPartners | 14 | (no stamp) |
| refiWatch | 14 | (no stamp) |
| reviewPipeline | 14 | (no stamp) |
| riskMonitor | 631 | syncedAt=2026-09-22T01:08:48-07:00 |
| routineHealth | 16735 | syncedAt=2026-09-22T00:57:57-07:00 |
| runnerProbe | 81 | probeAt=2026-09-15T02:57:23Z |
| runnerStatus | 13303 | syncedAt=2026-09-22T04:05:04Z |
| seccollapse.panel-nextmoves.replicate-ai-clone-brain-voice-image-vid | 17 | (no stamp) |
| seccollapse.panel-nonprofit.future-venture-military-family-office | 16 | (no stamp) |
| seccollapse.panel-quantvue.today-s-top-movers | 16 | (no stamp) |
| secondBrain | 104257 | syncedAt=2026-09-22T08:06:38+00:00 |
| sectionEdits | 207 | (no stamp) |
| showingRoute | 16 | (no stamp) |
| showingSchedule | 16 | (no stamp) |
| showingSyncRequests | 14 | (no stamp) |
| speakDiag | 4205 | (no stamp) |
| steveChat | 4890 | last.ts=2026-09-10T13:47:23.926Z |
| stlManual | 14 | (no stamp) |
| strategySnapshot | 6986 | syncedAt=2026-09-16T03:26:59Z |
| stravaSnapshot | 650 | syncedAt=2026-09-20T21:03:00Z |
| subscriptions | 14 | (no stamp) |
| supplementTracker | 1108 | (no stamp) |
| techStackExtra | 14 | (no stamp) |
| todoList | 67 | (no stamp) |
| toolkitSnapshot | 84621 | syncedAt=2026-09-16T00:52:24Z |
| tradingLogins | 1236 | (no stamp) |
| twinBrief | 1273 | ranAt=2026-09-22T02:24:35Z |
| twinLog | 1438 | last.ts=2026-09-22T02:24:35Z |
| twinQueue | 10637 | last.ts=2026-09-22T02:24:35Z |
| uscDeadlines | 887 | (no stamp) |
| uscSchedule | 136 | (no stamp) |
| vanessaBrief | 650 | ranAt=2026-09-21T19:21:00-07:00 |
| vanessaChat | 162 | last.ts=2026-09-13T01:19:47.823Z |
| vanessaRecommendations | 4662 | last.ts=2026-09-11T23:10:00Z |
| vanessaResearch | 327 | updatedAt=2026-09-12T05:49:14Z |
| vanessaRuns | 735 | last.ts=2026-09-11T23:10:00Z |
| voiceReplyQueue | 442 | (no stamp) |
| voiceReplyStatus | 161 | (no stamp) |
| voiceReply_teststeve01_0 | 144535 | (no stamp) |
| weatherSnapshot | 2425 | syncedAt=2026-09-21 08:05 PM PDT |
| webinarFunnel | 14 | (no stamp) |
| wellness | 72 | (no stamp) |


---

<!-- source file: docs/inventory/mac-runner-status.md -->
# FILE: docs/inventory/mac-runner-status.md

# Mac claude-runner task status (runnerStatus doc, syncedAt 2026-09-22T04:05:04Z, loggedIn=True, running=['fabric-deck-sync'], waiting=[])

| Task | Cron (Mac local, PT) | Enabled | Last end | Last status | Next slot |
|---|---|---|---|---|---|
| access-audit-monthly | `10 5 1 * *` | True | None | None | 2026-10-01T05:10:00 |
| automation-audit-quarterly | `30 3 1 1,4,7,10 *` | True | None | None | 2026-10-01T03:30:00 |
| automation-audit-weekly | `40 3 * * 6` | True | None | None | 2026-09-26T03:40:00 |
| brain-deck-sync | `20 7-22 * * *` | True | 2026-09-21T20:24:36 | ok | 2026-09-21T21:20:00 |
| brain-learn-daily | `50 22 * * *` | True | 2026-09-15T22:56:26 | ok | 2026-09-21T22:50:00 |
| brain-weekly-verify | `0 16 * * 0` | True | 2026-09-14T02:34:40 | ok | 2026-09-27T16:00:00 |
| calendar-daily-sync | `35 6,17 * * *` | True | 2026-09-21T19:29:35 | ok | 2026-09-22T06:35:00 |
| coach-weekly-recs | `10 6 * * 1` | True | None | None | 2026-09-28T06:10:00 |
| cpi-daily-scan | `30 22 * * *` | True | 2026-09-17T12:47:49 | error | 2026-09-21T22:30:00 |
| fabric-deck-sync | `5 7-21/2 * * *` | True | 2026-09-21T19:58:25 | error | 2026-09-22T07:05:00 |
| feeds-market-close | `15 22 * * 1-5` | True | 2026-09-15T22:19:23 | ok | 2026-09-21T22:15:00 |
| feeds-weekly | `40 21 * * *` | True | 2026-09-17T08:28:29 | limited | 2026-09-21T21:40:00 |
| health-coaching-weekly | `30 6 * * 0` | True | None | None | 2026-09-27T06:30:00 |
| health-full-analysis | `25 5 * * *` | True | 2026-09-17T17:02:05 | error | 2026-09-22T05:25:00 |
| incentives-daily-scan | `50 7 * * *` | True | 2026-09-21T19:23:47 | ok | 2026-09-22T07:50:00 |
| isa-comms-bridge-local | `37 7-21 * * *` | True | 2026-09-21T20:38:23 | ok | 2026-09-21T21:37:00-07:00 |
| lead-triage-daily | `33 11 * * 1-5` | True | 2026-09-21T19:20:32 | ok | 2026-09-22T11:33:00-07:00 |
| local-bridge-queue | `25 6-21 * * *` | True | 2026-09-21T20:25:40 | ok | 2026-09-21T21:25:00 |
| loop-engineering-weekly | `30 4 * * 6` | True | None | None | 2026-09-26T04:30:00 |
| month-end-close-prep | `50 4 28 * *` | True | None | None | 2026-09-28T04:50:00 |
| mortgage-desk-weekly | `5 6 * * 0` | True | None | None | 2026-09-27T06:05:00 |
| mortgage-rates-daily | `38 6,13 * * 1-5` | True | 2026-09-21T19:24:54 | ok | 2026-09-22T06:38:00 |
| nightly-self-test | `0 23 * * *` | True | 2026-09-15T23:32:27 | error | 2026-09-21T23:00:00 |
| openrouter-credits-refresh | `40 23 * * *` | True | 2026-09-15T23:42:28 | ok | 2026-09-21T23:40:00 |
| openrouter-feeds-refresh | `50 5 * * *` | True | 2026-09-17T19:04:11 | error | 2026-09-22T05:50:00 |
| openterminal-remote-queue | `45 6-21 * * *` | True | 2026-09-21T20:45:44 | ok | 2026-09-21T21:45:00 |
| ops-knowledge-graph | `45 5 * * 0` | True | None | None | 2026-09-27T05:45:00 |
| r1-morning-brief | `30 5 * * *` | True | 2026-09-17T17:02:05 | error | 2026-09-22T05:30:00 |
| r10-automation-health | `10 22 * * *` | True | 2026-09-17T08:28:29 | limited | 2026-09-21T22:10:00 |
| r11-isa-kpi-compile | `40 4 * * 0` | True | None | None | 2026-09-27T04:40:00-07:00 |
| r12-inbox-triage | `55 6,13 * * *` | True | 2026-09-21T19:26:05 | ok | 2026-09-22T06:55:00 |
| r13-appointment-prep | `50 6-19/2 * * *` | True | 2026-09-21T19:31:26 | ok | 2026-09-22T06:50:00 |
| r14-content-pipeline | `45 5 * * 2-5` | True | 2026-09-17T19:04:11 | error | 2026-09-22T05:45:00 |
| r17-trading-day-log | `40 22 * * 1-5` | True | 2026-09-17T12:47:49 | error | 2026-09-21T22:40:00 |
| r2-lead-response-watchdog | `10,40 7-19 * * *` | True | 2026-09-21T20:02:33 | ok | 2026-09-22T07:10:00-07:00 |
| r20-weekly-review-local | `50 23 * * 5` | True | None | None | 2026-09-25T23:50:00 |
| r3-eod-rollup | `45 22 * * *` | True | 2026-09-15T22:49:22 | ok | 2026-09-21T22:45:00 |
| r4-quantvue-sync | `20 23 * * 1-5` | True | 2026-09-15T23:27:43 | ok | 2026-09-21T23:20:00 |
| r5-rates-market-refresh | `5 5 * * 1` | True | None | None | 2026-09-28T05:05:00 |
| r6-weekly-backup | `0 5 * * 0` | True | None | None | 2026-09-27T05:00:00 |
| r7-plaid-balances | `55 5,22 * * *` | True | 2026-09-15T22:55:50 | ok | 2026-09-21T22:55:00 |
| r8-apple-health-snapshot | `10 5,21 * * *` | True | 2026-09-17T15:00:07 | error | 2026-09-21T21:10:00 |
| r9-feed-freshness-sweep | `0 4 * * 0` | True | None | None | 2026-09-27T04:00:00 |
| revenue-scan-weekly | `40 5 * * 0` | True | None | None | 2026-09-27T05:40:00 |
| showing-sync | `15 8,12,16 * * 1-6` | True | 2026-09-21T19:26:40 | ok | 2026-09-22T08:15:00-07:00 |
| skills-refresh-weekly | `0 7 * * 0` | True | None | None | 2026-09-27T07:00:00 |
| steve-twin-sweep | `55 12 * * 1-5` | True | 2026-09-21T19:27:15 | refused | 2026-09-22T12:55:00 |
| strava-daily-sync | `20 5 * * *` | True | 2026-09-17T15:00:07 | error | 2026-09-22T05:20:00 |
| toolkit-deck-sync | `15 6 * * *` | True | 2026-09-16T17:59:00 | limited | 2026-09-22T06:15:00 |
| vanessa-discord-inbox | `*/5 * * * *` | True | 2026-09-21T21:05:04 | no-work | 2026-09-21T21:10:00 |
| vanessa-imessage-inbox | `*/10 * * * *` | True | 2026-09-21T21:01:18 | ok | 2026-09-21T21:10:00 |
| vanessa-morning-brief-text | `40 6 * * *` | True | 2026-09-16T18:30:05 | limited | 2026-09-22T06:40:00 |
| vanessa-ops-review | `35 22 * * 5` | True | None | None | 2026-09-25T22:35:00 |
| vanessa-research-queue | `30 7-21 * * *` | True | 2026-09-21T20:31:03 | ok | 2026-09-21T21:30:00 |
| vanessa-significant-alerts | `0 11,15,19 * * *` | True | 2026-09-21T19:58:25 | error | 2026-09-22T11:00:00 |
| vanessa-sweep | `35 12 * * 1-5` | True | 2026-09-21T19:21:36 | ok | 2026-09-22T12:35:00 |
| voice-reply-render | `*/10 * * * *` | True | 2026-09-21T21:01:18 | ok | 2026-09-21T21:10:00 |
| weather-news-refresh | `5 8,20 * * *` | True | 2026-09-21T20:10:40 | ok | 2026-09-22T08:05:00 |
| weekly-self-update | `10 23 * * 5` | True | None | None | 2026-09-25T23:10:00 |


---

<!-- source file: docs/inventory/routine-health.md -->
# FILE: docs/inventory/routine-health.md

# Runner health — `runnerctl status` as pasted by Steven, 2026-10-23 12:33 PT (Mac 1)

**Headline: the runner is healthy and was never silent.** 54 tasks; 42 last ran `ok` (most of them today), 5 `error`, 4 `limited`
(the usage cap — not broken), 3 `off` (paused on purpose today), 0 never-run. The morning tasks all ran today: r1-morning-brief 05:37,
vanessa-morning-brief-text 06:53 (ok — the text did not arrive only because the iMessage line is not linked), health-full-analysis 05:27,
calendar-daily-sync 06:38, mortgage-rates-daily 06:41, lofty-crm-sync 07:48, brain-deck-sync hourly. The "silent since Oct 13" note
in connect-all step 2 was the connect script's reading, not the runner's: its restart was harmless but unneeded.

| Task | Last | Reading | Fix (integrations/mac-task-specs.md § 9) |
|---|---|---|---|
| `toolkit-deck-sync` (06:15 daily) | error 2026-10-23 06:25 | the one error from today; the deck's toolkit card is stale | timeout (exit 124 at 602 s, twice today): move the snapshot scripts to a pre-step, or raise the cap to 1200 s — spec § 9 |
| `nightly-self-test` (23:00) | error 2026-10-22 23:19 | tool refusal in the suite | 30-min timeouts + refusals + "no result in envelope": split the suite (spec § 9) |
| `brain-weekly-verify` · `health-coaching-weekly` · `skills-refresh-weekly` (Sundays) | error 2026-10-11 | hit the Sunday usage cap; have not run since | move to Monday (spec § 9), or run each once on a weekday: `runnerctl run <name>` |
| `r9-feed-freshness-sweep` | off (paused 2026-10-23) | superseded by the cloud freshness sweep | — |
| `r8-apple-health-snapshot` · `strava-daily-sync` | off (paused 2026-10-23) | superseded by the cloud Health daily sync | — |
| `access-audit-monthly` · `automation-audit-quarterly` · `ops-knowledge-graph` · `r20-weekly-review-local` | limited (Oct 1–11) | usage cap; next slots Nov 1 / Jan 1 / Sunday / Friday | leave |
| everything else (42 tasks) | ok | — | — |

Paused today with `runnerctl pause` (the verb `disable` does not exist). `vanessa-imessage-inbox` was running at the time of the paste.

---

# routineHealth doc (written by r10-automation-health, syncedAt 2026-09-22T00:57:57-07:00) — counts {"failed": 8, "late": 3, "neverRun": 13, "ok": 6, "producedNothing": 2, "stale": 0}

| Routine/task | Source | Cadence | Last run | Expected doc | Result |
|---|---|---|---|---|---|
| Cloud routines (RemoteTrigger) | cloud | — | None | None | not checked headless — RemoteTrigger is not available to the runner |
| r1-morning-brief | runner | daily 5:30am | 2026-09-17T17:02:05Z | twinBrief | failed: network/API unreachable at last recorded run (ERROR API Error: Can't reach the API server, 2026-09-17T17:02Z) — no successful r1 run logged since. Note: twinBrief is fresh, but its content (evening sweep, twinQueue items) matches steve-twin-sweep's output, not a morning brief — doc-to-task wiring should be confirmed with Derek. |
| r2-lead-response-watchdog | runner | every 30m, 7a-7:40p PT | 2026-09-21T20:02:33Z | leadResponse | failed: CRM API authentication rejected — the task has no working lead source. It must read **Lofty**, which is **not connected yet** (needs `LOFTY_API_KEY` in `~/.config/lofty/.env`). leadResponse doc correctly recorded status:failed, no leads fabricated. |
| r3-eod-rollup | runner | daily 10:20pm | 2026-09-15T22:49:22Z | eodRollup | late: no run recorded since 2026-09-15/16 — roughly 6 daily cycles missed; task is currently queued in the waiting backlog. |
| r4-quantvue-sync | runner | weekdays 11:20pm | 2026-09-15T23:27:43Z | strategySnapshot | late: no run since 2026-09-15/16 — 3 weekday cycles missed (17th,18th,19th); currently queued in the waiting backlog. |
| r5-rates-market-refresh | runner | Mon 5:05am | None | ratesSnapshot | never run — zero execution evidence under claude-runner since migration. The ratesSnapshot doc is actually being kept fresh by a separate task, mortgage-rates-daily (last ok 2026-09-21T19:24Z), not by r5 itself — doc-to-task wiring should be confirmed with Derek. |
| r6-weekly-backup | runner | Sun 5:00am | None | backupStatus | never run — zero execution evidence under claude-runner; missed its Sep 20 Sunday slot entirely. The doc's last verified/restore-tested backup is Sep 14, from before the Sep 13 runner migration — no confirmed backup has run under the new system. |
| r7-plaid-balances | runner | 2x daily 5:55am/10:55pm | 2026-09-15T22:55:50Z | plaidBalances | late: no run since 2026-09-15/16 (Plaid bridge remains unconfigured — no API keys added, an accepted/known state); currently queued in the waiting backlog (pool-full). |
| r8-apple-health-snapshot | runner | 2x daily 5:10am/9:10pm | 2026-09-21T21:12:38Z | appleHealth | RAN BUT PRODUCED NOTHING — run completed cleanly but the local ingest daemon on port 8765 is not responding; appleHealth doc is 9 days stale (last real ingest 2026-09-13). |
| r9-feed-freshness-sweep | runner | Sun 4:00am | None | feedFreshness | never run — doc has never existed. |
| r10-automation-health | runner | daily 10:10pm | 2026-09-22T07:57:00Z | routineHealth | ok (this run) — prior attempts were blocked by the weekly usage cap through 2026-09-17; this report completes the backlog. |
| r11-isa-kpi-compile | runner | Sun 4:40am | None | isaKpi / isaScorecard | never run — zero execution evidence under claude-runner. isaKpi is 8 days old (pre-migration); isaScorecard has never been filled in at all by the ISA. |
| r12-inbox-triage | runner | 2x daily 6:55am/1:55pm | 2026-09-21T19:26:05Z | inboxTriage | ok |
| r13-appointment-prep | runner | every 2h, 6a-7:50p PT | 2026-09-21T19:31:26Z | apptPrep | RAN BUT PRODUCED NOTHING — doc has never existed in either store. Every logged run reports 'no meeting, writing nothing'; cannot confirm the doc is ever written when a meeting IS found — worth Derek confirming the write path. |
| r14-content-pipeline | runner | Tue-Fri 5:45am | 2026-09-17T19:04:11Z | marketingQueue | failed: network/API unreachable at last recorded run (2026-09-17); marketingQueue last updated 2026-09-15 — 2 drafted posts still awaiting Steven's review. |
| r17-trading-day-log | runner | weekdays 10:40pm | 2026-09-17T12:47:49Z | riskMonitor | failed: network/API unreachable at last recorded run (2026-09-17); riskMonitor last real content from the Sep-15 close, accounts array still empty (no trading account data wired in). |
| r20-weekly-review-local | runner | Fri 11:50pm | None | weeklyReview | never run — doc has never existed. |
| isa-comms-bridge-local | both | hourly, 7:37a-9:37p PT | 2026-09-22T00:56:31-07:00 | isaLine / isaLineRead | ok — bridge itself ran clean moments ago and confirmed both stores already match. isaLine's own content is unchanged since 2026-09-16 because the ISA has posted nothing new since then — a separate, already-flagged issue (see twinBrief/vanessaBrief/cpiOpportunityLog). |
| weather-news-refresh | runner | 2x daily 8:05am/8:05pm | 2026-09-21T20:10:40Z | weatherSnapshot, newsSnapshot | ok |
| steve-twin-sweep | runner | weekdays 12:55pm | 2026-09-21T19:27:15Z | twinLog | failed: refused-tool: Bash (write access to ~/Shearrill-Vault) — vault step (B2) incomplete. twinLog/twinQueue otherwise wrote successfully to the Deck. Circuit breaker open until 2026-09-22T01:27:15Z. |
| showing-sync | runner | 3x Mon-Sat 8:15/12:15/4:15 PT | 2026-09-21T19:26:40Z | showingSyncRequests | ok — queue empty, scored status-only per spec. |
| lead-triage-daily | runner | weekdays 11:33am PT | 2026-09-21T19:20:32Z | leadTriage | failed: CRM API authentication rejected (same root cause as r2) — the task has no working lead source. It must read **Lofty**, which is **not connected yet**. leadTriage doc correctly recorded the failure honestly, no data fabricated. |
| coach-weekly-recs | runner | Mon 6:10am | None | coachLog | never run — the doc's single entry (2026-09-10) predates the runner and was written by hand in a chat session, not by this task. |
| vanessa-ops-review | runner | Fri 10:35pm | None | vanessaRuns | never run — doc's single entry (2026-09-11) is from the old cloud/desktop era; the cloud duplicate of this routine is separately stuck ABANDONED/requires_action per loopLog. |
| weekly-self-update | runner | Fri 11:10pm | None | improvementProposals | never run |
| loop-engineering-weekly | runner | Sat 4:30am | None | loopLog | never run — loopLog's 4 entries (through 2026-09-10) predate the runner; the cloud duplicate hit its rate limit then hung on a permission prompt for ciLog. |
| nightly-self-test | runner | daily 11:00pm | 2026-09-16T03:32:21Z | selfTest | failed: run timed out (exit 124) at 2026-09-16T03:32 — never completed; selfTest doc has never existed; currently queued in the waiting backlog. |
| ops-knowledge-graph | runner | Sun 5:45am | None | ~/Shearrill-Vault/60-Knowledge mtime | never run — no execution evidence under claude-runner. Separately, this run's own Read of that vault path was refused (outside this task's allow-list), so the filesystem mtime could not be independently verified either. |
| access-audit-monthly | runner | 1st 5:10am | None | twinQueue item 'Monthly access & credential audit' | never run — no matching twinQueue item found (8 items present, none matching). |
| month-end-close-prep | runner | 28th 4:50am | None | twinQueue item 'Month-end close prep' | never run — no matching twinQueue item found. |
| automation-audit-quarterly | runner | Jan/Apr/Jul/Oct 1st 3:30am | None | loopLog entry kind=quarterly-audit | never run — no matching loopLog entry found (5 entries present, none kind=quarterly-audit). |
| cpi-daily-scan | runner | daily 10:30pm | 2026-09-17T12:47:49Z | cpiOpportunityLog (execution-only) | failed: network/API unreachable at last recorded run (2026-09-17) — no successful run since 2026-09-16; currently queued in the waiting backlog for tonight's 10:30pm slot. |
| vanessa-sweep | runner | weekdays 12:35pm | 2026-09-21T19:21:36Z | vanessaBrief | ok |
| Mortgage lead flow (Zoho + ARIVE) | none | — | None | None | UNMONITORED — every speed-to-lead and KPI job is pointed at the real-estate CRM (Lofty) only; the mortgage system of record has no watchdog |


---

<!-- source file: routines/backup-watchdog-cloud.md -->
# FILE: routines/backup-watchdog-cloud.md

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
**Claude Sonnet 5** — a read-and-report seat. No sub-agents, no research, no web search.

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


---

<!-- source file: routines/events-weekly.md -->
# FILE: routines/events-weekly.md

# Routine spec — Weekly events scan → Travel tab (proposal; not installed anywhere)

**Written 2026-10-11.** Nothing runs this yet. A Mac runner task is a live task, so installing it is Steven's yes (HALT).

## What it does
1. `python3 integrations/events/events_scout.py --days 14` on a Mac with internet (the cloud sandbox reached none of the 36 sources). The free GitHub `events-scout` workflow makes the same report as an artifact every Sunday 06:37 UTC.
2. Writes the rows from `docs/reports/EVENTS.json` into the Command Deck document `eventsFeed` (array of `{day,date,name,venue,city,category,url}`), which the Travel tab's "Weekly events & networking" card already reads. With no document the card says "sources only".
3. Never RSVPs, registers, pays or messages anyone. Networking leads go to Victor as proposals.

## Schedule and model
Sunday 7:00 AM PT, headless, Sonnet 5 (it only formats data the script produced). Skip a week if the script reports zero reachable sources, and say so in `routineHealth` rather than writing an empty feed over a good one.

## Success condition
`eventsFeed` gained rows dated within 14 days, every row has an `https://` link, and the card badge reads "N events this scan".


---

<!-- source file: routines/fub-removal-2026-09-24.md -->
# FILE: routines/fub-removal-2026-09-24.md

# Follow Up Boss removed — what was done, and the three edits only Steven can make

**2026-09-24.** Steven: *"remove FUB aka Follow Up Boss from all routines, and everything. Lofty CRM
replaced it as my primary CRM for real estate. Zoho is my primary CRM for mortgages."* Recorded in
`context/decisions.md`.

## Done from the cloud session, and verified

| What | Before | After | Proof |
|---|---|---|---|
| **Composio connection** `follow_up_boss_many-weism` | ACTIVE, rejected key — the thing `r2-lead-response-watchdog` hit every night (exit 137, 8th time running) | **Removed.** Composio: *"No remaining accounts."* Nothing — no routine, no Mac task, no agent — can call it any more. Steven's Follow Up Boss account and data are untouched; only the link is gone | `COMPOSIO_MANAGE_CONNECTIONS` remove, 2026-09-24 |
| **Real Estate Weekly Brief** `trig_01CjaMXrbMga1jPdJzUnwLUo` (agent-created) | 6 mentions — all a guard telling it never to call the old CRM | **0.** The guard is kept in Lofty terms, plus the Composio trap below. Rest of the 6,426-char prompt byte-identical | live prompt re-read after `update_trigger`, 12:27 UTC |
| **`aiTeamRoster`** (Command Deck store) | two job descriptions: a CRO report that "triages Follow Up Boss leads"; marketing analytics "across Follow Up Boss and Zoho" | **Lofty** in both. v8 → v9 | read back: `{v}` shape, 0 mentions |
| **`secondBrain`** (Command Deck store) | the system-of-record entry: "Follow Up Boss for everything real estate", in three places plus its search terms | **Lofty**, with a note that the ISA SOP text itself still needs the same update. v38 → v39 | read back: `{v}` shape, 0 mentions |

Both store writes were made from disk with `file_path` and pinned with `if_version`, in one atomic
batch — nothing was retyped, and a concurrent change would have refused the write rather than been
overwritten.

### A trap worth knowing — Composio will hand you the wrong CRM

Asked for **Lofty**, Composio's tool search returned `FOLLOW_UP_BOSS_LIST_CALLS`. Asked for
**ShowingTime**, it returned `FOLLOW_UP_BOSS_LIST_APPOINTMENTS`. Asked for **homes.com**, it returned a
Zillow/Redfin scraper. It never says "I have nothing for that" — it offers the nearest thing it has.
**Composio has no Lofty, ShowingTime, Showami or homes.com toolkit.** Any agent that trusts that search
will believe it has connected Lofty while querying a different system. The Real Estate Weekly Brief now
carries this warning in its prompt. With the old connection removed, the specific danger is gone; the
behaviour is not.

## The three edits only Steven can make — routines created in the web UI

These three were made through the claude.ai web UI (`http_api`), and every agent attempt to change one
has been refused. Open each link, find the **old** text, replace it with the **new** text, save. Each
old string was checked against the live prompt on 2026-09-24 and occurs **exactly once**.

### 1. Vanessa orchestrated ops review — enabled, Fri 4 PM PT
https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs

| Old | New |
|---|---|
| `Dual CRM, never blended: Zoho CRM (+ARIVE) for mortgage, Follow Up Boss for real estate.` | `Dual CRM, never blended: Zoho CRM (+ARIVE) for mortgage, Lofty for real estate.` |

This one matters most: it tells the whole C-suite which CRM is real estate's every Friday.

### 2. Weekly self-improvement loop — enabled
https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX

| Old | New |
|---|---|
| `FUB import data (both dashboards)` | `Lofty import data (both dashboards)` |

### 3. Steve twin — currently DISABLED
https://claude.ai/code/routines/trig_0174717mnSfAk1LtQQVJhH7r

**Make these edits before you enable it** (runbook I4 asks you to re-enable it). As it stands it
describes the old CRM as your real-estate system and reads it through Composio.

| Old | New |
|---|---|
| `Dual-CRM operator, never blended: Zoho CRM + ARIVE = mortgage; Follow Up Boss = real estate.` | `Dual-CRM operator, never blended: Zoho CRM + ARIVE = mortgage; Lofty = real estate.` |
| `pushed to Calendar / Follow Up Boss / Showami` | `pushed to Calendar / Lofty / Showami` |
| `Composio (Follow Up Boss / Zoho CRM), Notion, Slack, Strava` | `Composio (Zoho CRM), Notion, Slack, Strava` |

**Leave one thing alone:** the showings shape in that prompt contains a field called `fub`
(`{id, name, fub, showings: …}`). That is a **data key**, not a CRM reference — the Command Deck stores
each client's CRM id under it. Renaming it in the prompt without migrating the stored data would break
the twin's reading of the showings. Whether to migrate the key is decision I5b; until then it stays.

## Still Steven's, on the Mac — runbook B4

Four Mac task prompts still target the old CRM: `lead-triage-daily`, `r2-lead-response-watchdog`,
`r11-isa-kpi-compile`, `showing-sync`. Replacement text: `docs/inventory/mac-task-descriptions.md`.
With the Composio connection gone they will now **fail immediately** ("no active connection") instead
of being killed after a timeout — faster and clearer, but still wrong until the prompts say Lofty. The
morning brief will keep reporting it until then.

## Left on purpose — records, not configuration

Changing these would falsify a record, or be overwritten by its own task within hours:

- **History.** Chat and message logs (`steveChat`, `jamesChat`, `isaLine`, `twinLog`, `agentInbox`,
  `ciLog`, `loopLog`, and the ISA Portal's `isaLine`) record what was actually said.
- **Dated measurements.** The ISA Portal's `isaKpi` is a 2026-09-13 measurement taken from the old CRM
  while it was the system of record. Relabelling those numbers "Lofty" would claim Lofty measured
  something it never did. It is replaced when `r11-isa-kpi-compile` is pointed at Lofty.
- **Mirrors of live state.** `toolkitSnapshot` describes what the Mac tasks do *today* — and today four
  of them still target the old CRM. It is accurate, and corrects itself after B4.
- **Task output.** `leadResponse`, `leadTriage`, `routineHealth` and the like are rewritten by their tasks.
- **Dated repo records.** Findings, cycle briefs and reports say the CRM *"was Follow Up Boss until
  2026-09-22"* — that is the record of the change itself.


---

<!-- source file: routines/isa-escalation-ladder.md -->
# FILE: routines/isa-escalation-ladder.md

# ISA line — reply check & escalation ladder (cloud)

`trig_01J9xuWgAuUCHATtpLivDkgp` · cron `30 14 * * 2-6` (weekdays 7:30 AM PT) · created 2026-09-22
· needs no connectors

## Why

The Mac task `r3-eod-rollup` posts "EOD summary not in yet — send it here when you get a
minute…" to the ISA line as if from Steven, verbatim, every evening it finds no summary. Between
2026-09-13 and 2026-09-22 it posted that five times and never once checked for a reply. No
ISA-authored message has ever appeared on the line. Repeating a message to nobody is noise that
hides the real signal: the seat may be empty.

## What it does

One decision per weekday morning: did the ISA answer, and if not, what is the next rung.

| Consecutive business days with an EOD request and no ISA reply | Action, at most once per streak |
| --- | --- |
| 0–1 | Nothing written. |
| 2 | One urgent line to Steven on the ISA line. |
| 3+ | One "ISA seat — decision needed" item in the twin queue (or adopt the one already there), then silence. |

A streak resets only when a message with `from: "isa"` appears. State lives in the `isaLadder`
document; every run logs one `{date, text}` row in `ciLog`.

## What it never does

Never posts a nudge. Never writes as Steven. Never contacts the ISA on any channel. Never edits or
deletes an existing message. Never names a client.

## What it cannot do

Switch off `r3-eod-rollup`. That is a Mac task, and only Steven can retime or disable it. Until he
does, r3 keeps posting the nudge and the ladder keeps counting it as a request.

## Related

- `docs/ISA-SEAT-DECISION.md` — the packet, four courses of action, and the outreach draft.
- The ISA Portal now carries a daily scorecard form whose "Send to Steven" posts the numbers on the
  line, which is the first thing that would count as an ISA-authored message.


---

<!-- source file: routines/parallel-csuite-task-cycle.md -->
# FILE: routines/parallel-csuite-task-cycle.md

# Routine spec — Parallel C-Suite Task Cycle

Drives the `vanessa-orchestrator` skill: intake → decompose → delegate → concurrent execution (≤8)
→ conflict resolution → QA → consolidate → report.

## Where it runs
**Mac runner (`claude-runner`) only.** An unattended cloud run cannot write the artifact DB — the
write parks on a permission prompt (confirmed three times, Sep 2026). The cloud twin
"Command Deck — Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT)"
(`0 23 * * 5` UTC) **FAILED 2026-09-18**; leave it report-only or disabled rather than running two
cycles that disagree.

## Schedule
| | Cron | Local (America/Los_Angeles) | UTC |
|---|---|---|---|
| Primary (Mac, local cron) | `35 22 * * 5` | **Fri 10:35 PM PT** | Sat 05:35 UTC (PDT, UTC−7) |
| On demand | — | Steven asks for a cycle | — |

Re-point the **existing** `vanessa-ops-review` task (enabled, **never run** as of 2026-09-22) at this
prompt. Do not create a second Friday task. Mac crons are local PT and do not drift at the
Nov 1 2026 PDT→PST change; the UTC column does.

## Models
| Layer | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 (masterminds) |
| Executive seats — Victor, Sofia, Marcus, Derek, Alexandra, Elena, Nadia, Elon | Claude Opus 5.5 |
| Reports / benches (tier 2–3) | Claude Sonnet 5 |
| Research wave | Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's Claude subscription (Perplexity removed 2026-10-05), ≤4 per wave |

Caps: **≤8 sub-agents in flight, ≤4 web-research sub-agents per wave.**

## Tools
- `Artifact` `read_db` / `write_db` against `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`.
- Sub-agent dispatch (the Mac agent roster: 172 agents, tiers/leads in `aiTeamRoster`).
- `WebSearch` / `WebFetch` (research wave, on Steven's Claude subscription). Calendar/Gmail/Notion/Slack
  connectors read-only in this cycle.
- No outbound messaging tool is enabled for this routine — drafts only.

## Prompt text (paste verbatim into the task)
```
Run the Parallel C-Suite Task Cycle using the vanessa-orchestrator skill. You are Vanessa
(Claude Fable 5.1), chairing.

1. Intake: this week's ask is the standing ops review unless a newer ask is in twinQueue with
   status "pending". Restate it in one line and name the decision it serves.
2. Read only what you need: vanessaRuns (last cycle), twinQueue, routineHealth, runnerStatus,
   loopLog, kanbanCards, leadTriage, leadResponse, isaKpi, calendarSnapshot.
3. Decompose into independently answerable tasks. Each task: owner seat, model tier, named input
   docs, output shape, done-condition, time box.
4. Dispatch in waves of at most 8, at most 4 web-research sub-agents per wave.
5. Stall policy: two retries, then re-route to the next-best seat, then a Needs-Steven packet.
   Never fabricate a seat's answer; never drop a task silently.
6. Resolve conflicts on the facts: a live doc with a stamp beats recollection. Alexandra
   (compliance) and Elena (security) hold a veto in their lanes. Money/risk tradeoffs go to Steven
   as four COAs, most conservative first.
7. QA every return: requested shape, a citation (doc + stamp, task name, or URL) for every number,
   no invented facts, no capability claimed live that the inventory does not prove, no secrets.
8. Consolidate into one synthesis: headline, what changed, decisions needed, owners, what is blocked.
9. Write: vanessaRuns (one entry), vanessaLog (one line, keep 200), vanessaRecommendations if COAs
   were produced, twinQueue packets for anything needing Steven. Read each doc before writing and
   append; use write_db db_op "set" with data {v: <whole doc>}.
10. Print the synthesis in the run output as well, so the cycle is readable even if a write fails.

Honest status rules: a task that exists is not a task that runs. Say "never run under the runner",
"last ok <date>", "failed <date>: <reason>". Lofty is the real-estate system of record (since
2026-09-22) and is **not connected yet** — no real-estate lead number is live, so say "not connected
yet"; Zoho is connected but every CRM call returns 403 Crm_Implied_Api_Access; You.com is retired;
Perplexity was removed 2026-10-05 (research runs on Claude WebSearch); there are no OpenRouter or
Plaid keys. Never send anything to a client, partner or the ISA.
```

## Success condition
A run is a **success** only when all of these hold:
1. `vanessaRuns` gained exactly one entry for this cycle with a non-empty `headline`, `agents[]` and
   `decisions[]`.
2. Every dispatched task ended in one of: answered-and-QA'd, re-routed-and-answered, or a
   `twinQueue` Needs-Steven packet. Zero silent drops.
3. Every number in the synthesis carries a source and a stamp.
4. Caps were respected (≤8 concurrent, ≤4 web-research sub-agents per wave).
5. The synthesis appears in the run output, not only in the DB.

**Failure** is any of: no `vanessaRuns` entry, a task with no outcome, an unsourced number, a
fabricated seat answer, or a write that parked on a permission prompt (which means it was run in the
cloud — re-run it on the Mac).

## First run
Run it once manually ("Run now") and confirm `vanessaRuns` gains an entry — `vanessa-ops-review` has
never run, so nothing about this schedule is proven until that happens.


---

<!-- source file: routines/pipeline-sync-live.md -->
# FILE: routines/pipeline-sync-live.md

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


---

<!-- source file: routines/strava-wrap-guard.md -->
# FILE: routines/strava-wrap-guard.md

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


---

<!-- source file: routines/weekly-loop.md -->
# FILE: routines/weekly-loop.md

# Routine spec — Weekly Loop (loop-engineering v2)

**Cloud loop routine moved 2026-10-09 (Steven): Sundays 1:05 PM Pacific** (`CRON_TZ=America/Los_Angeles 5 13 * * 0`, trigger `trig_01W1KHiBfVXZ5Xwd1aCFJM72`) — five minutes after the Sunday 20:00 UTC allowance reset while Daylight Time lasts (after Nov 1 the reset is noon PST, an hour earlier).

**Scout added 2026-10-09** — `integrations/scout/scout.py` (step 2b) scans the internet each week for new
repos, skills, MCP servers, upgrades, CLIs and free tools; the free GitHub `scout` workflow runs it Friday night.

Drives the `loop-engineering` skill and the sub-skills it calls: `prompt-master`,
`continuous-process-improvement`, `scale-growth-engine`, `stress-test-sweep`, `skills-refresh`, plus
Nadia's disruption brief and Elon's feasibility gate.

## Where it runs
**Mac runner (`claude-runner`)** — it must write `loopLog`, `trustLevels` and `selfTest`, and an
unattended cloud run's DB write parks on a permission prompt. The cloud routine
"Command Deck & ISA Portal Weekly Loop Engineering QA" (`0 16 * * 0` UTC, **FAILED 2026-09-20**) stays
**report-only QA**: it may read and report, it may not be the cycle of record.

## Schedule
| | Cron | Local (America/Los_Angeles) | UTC |
|---|---|---|---|
| Weekly cycle (Mac, existing task `loop-engineering-weekly`) | `30 4 * * 6` | **Sat 4:30 AM PT** | Sat 11:30 UTC (PDT) |
| Nightly self-test suite (Mac, existing task `nightly-self-test`) | `0 23 * * *` | **11:00 PM PT daily** | 06:00 UTC next day |
| Cloud QA (report-only, existing) | `0 16 * * 0` UTC | Sun 9:00 AM PT | Sun 16:00 UTC |

Status as of 2026-09-22: `loop-engineering-weekly` enabled, **never run**; `nightly-self-test`
**error — timeout, exit 124**, last end 2026-09-15. Fix the timeout before adding tests: every
registered self-test must be offline, dispatch no sub-agents, and finish in ≤60 s.

## Models
Vanessa chairs on **Claude Fable 5.1**; Elon (CTO Innovator), `sandbox-qa`, `stress-test-engineer`
and the prompt review run on **Claude Opus 5.5**; report/compile seats on **Claude Sonnet 5**;
research on **Claude web research** — Sonnet 5 with WebSearch/WebFetch on Steven's Claude subscription
(Perplexity removed 2026-10-05), ≤4 web-research sub-agents per wave. Sub-agent fan-out ≤8.

## Tools
- `Artifact` `read_db` / `write_db` against `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`.
- The runtime harness (pure-Node DOM shim) for `stress-test-sweep`; filesystem for the vault report.
- `WebSearch` / `WebFetch` (Claude, on Steven's subscription) for the disruption inputs. No messaging
  tools: this routine never sends.

## Prompt text (paste verbatim into the task)
```
Run the weekly loop with the loop-engineering skill. Continue the cycle numbering in loopLog
(cycles 1-5 ran Sep 9-10 2026).

1. Baseline: read loopLog, routineHealth, runnerStatus, selfTest, stressTestReport,
   cpiOpportunityLog, cpiCycles, scaleOpportunityLog, improvementProposals, auditFindings,
   twinQueue, toolkitSnapshot. Write the fact sheet: what ran, what failed, what produced nothing,
   what never ran - with dates.
2. Freeze the holdout: name ~20% of the items under test. Nothing in it is touched this cycle.
2b. Scout: run `python3 integrations/scout/scout.py --days 7`; Nadia grades the top 10 and every NEW
   business-lane item in docs/reports/SCOUT.md (ADOPT/PILOT/WATCH/IGNORE, dated sources), Elon gates
   feasibility and security; survivors go to improvementProposals. Never install, connect or pay.
2c. New hands (2026-10-10), proposal-only, stop before any submit/send/pay/sign: find-skills
   (`npx -y skills@1.7.2 find <topic>` once per open gap -> proposals for Elon/Elena/Steven);
   agent-browser or Playwright MCP (dogfood the Command Deck and ISA Portal read-only: snapshot every
   tab, list empty/stale/broken panels, screenshots into the report); web-design-guidelines (review
   the deck/portal HTML -> proposals); writing-guidelines (tighten the weekly report and brief before
   Steven reads it). Log which ran, or "not installed", in loopLog[].tools.
3. Collect proposals: prompt-master (<=5 prompt diffs, HITL gate), continuous-process-improvement
   (weekly deep pass), scale-growth-engine (ADR pass), stress-test-sweep (weekly sweep),
   skills-refresh (drift). Each proposal: target, change, hypothesis, measurement, risk, rollback.
4. Test each in the sandbox against fixtures - never live client, ISA or production data.
5. Compare before/after on the named metric AND the holdout. Promote only if the target improved and
   the holdout did not regress. Log every rejection with its reason.
6. Apply promoted changes at trust L1. Graduate trust only on seven consecutive correct runs;
   never promote straight to L3; one bad run resets the streak.
7. Self-heal only known, reversible breaks. Everything else goes to the triage inbox with the exact
   symptom and where it was seen. Never heal by deleting.
8. Write one loopLog entry for this cycle, mirror the trust map to trustLevels, write the weekly
   report to vault/40-Decisions/<date> loop cycle <n>.md, and the <=10-line brief for Steven.
   Mirror every needsSteven line to twinQueue as a needs-steven packet.
9. Print the brief in the run output too.

HALT (halt=true, escalate, do not work around): anything irreversible, outside scope, needing
credentials/permissions/money, or a human decision. Standing halts still in force: "ISA-line outbox
refactor - touches five tasks, changes what the ISA sees" and "skill prune - destructive".

Score on OUTPUT, not execution: a task that ran and wrote nothing is a failure. Never claim a
capability is live unless a doc, status or listing proves it.
```

### Nightly suite prompt (for `nightly-self-test`)
```
Run the registered self-test suite only - categories Functional, Integration, Orchestration,
Regression, BackupVerification, StressResilience. Every test is offline, dispatches no sub-agents,
and has a <=60 s budget; a test that cannot run reports Fail with "could not run: <why>", never a
silent pass. Write the selfTest doc {v:{ranAt, suite, counts{pass,fail,skipped}, rows[], healed[],
triage[]}} and print the counts. Heal only known, reversible breakage; everything else to triage.
```

## Success condition
1. `loopLog` gained exactly one entry for this cycle, with `holdout[]` non-empty and
   `proposed/tested/promoted/rejected/halted/healed` all populated.
2. Nothing in the holdout appears in `promoted` or `healed`.
3. Every promotion cites a before/after measurement; every rejection cites a reason.
4. `trustLevels` reflects the cycle, with no capability above L1 that lacks a 7-run streak.
5. The weekly report exists in the vault and the ≤10-line brief is in the run output.
6. Every `needsSteven` line has a matching `twinQueue` packet.

**Failure**: no `loopLog` entry, a promotion without a measurement, a holdout item that was touched,
a straight-to-L3 promotion, a halt that was worked around, or a self-test suite that timed out
(today's actual state — report it as a failure, do not skip it).

## First run
`loop-engineering-weekly` has never run. Run it once manually, confirm the `loopLog` entry appears
and the nightly suite completes inside its timeout, before trusting any of this schedule.
