# Dashboard operations: panels, DB docs, Mac tasks, routines

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `07-wiki-dashboard-ops`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: wiki/dashboard-ops/connections.md -->
# FILE: wiki/dashboard-ops/connections.md

# Is a connector, CRM or integration actually working

Is a connector, CRM or integration actually working right now, and what does Steven still need to
do about it. **The answer lives in one file — this page exists only so the dashboard-ops index has
a leaf to link to it.**

**Read `integrations/CONNECTIONS.md`.** Rule of that file, stated up front there: *"connected ≠
working."* Every row says what a run actually proved, never what a settings page claims, and names
the one thing Steven must do, in one line, per system.

Do not duplicate its rows here. That file is updated as connectors change; a second copy in the
wiki would drift the first time one of them did.

— 2026-09-28


---

<!-- source file: wiki/dashboard-ops/db-docs.md -->
# FILE: wiki/dashboard-ops/db-docs.md

# What each `state` doc means and who writes it

What each `state` doc means and who writes it. **Not full context — a pointer plus highlights.**

**Full inventory:** `docs/inventory/db-docs.md` — every doc name, byte size and stamp, **161 docs,
exported 2026-09-22 ~08:10 UTC.** That snapshot is already known to be behind the live count:
`wiki/dashboard-ops/index.md`'s own standing facts put it at **175** documents at the 2026-09-23
03:10 UTC read (174 earlier the same day). Read the inventory file for the full list; this page
does not repeat it.

**The one rule, restated:** every doc here is shaped `{v: <value>}`. A bare-body write
(`stravaSnapshot`, once; `marketingQueue`, still) is a defect, not a second valid shape — see
`always-on/README.md`.

## `liveFeeds` on both pages (2026-10-05)

| Doc | Means | Written by |
|---|---|---|
| `liveFeeds` (Command Deck) | `{v: {feeds: {<list id>: {checkedAt, citations, model, source, text}}}}` — one entry per live note on the deck, keyed by the list element's id | The Claude writer routines, each with a pinned `update` of its own keys only (`routines/feed-writers-2026-10-05/README.md`) |
| `liveFeeds` (ISA Portal) | The same shape, holding only `builderIncentiveLiveList` and the three `marketUpdateLiveList_<slug>` entries | The builder-incentives writer and the morning weather & news run, which copy their deck entries here byte for byte; created 2026-10-05 |

## Docs this round's reading actually surfaced, with what each one is (2026-09-28)

| Doc | Means | Written by |
|---|---|---|
| `runnerStatus` | Per-task last-end/last-status for all 59 Mac tasks under `claude-runner` | The runner itself, on every task completion |
| `knowledgeFabric` | Store counts: Second Brain rows, vault notes, Jarvis docs, graph nodes/edges, Ruflo entries, Drive files | `fabric-deck-sync`, every 2 h at :05, 7 AM–9 PM PT |
| `secondBrain` | Every Second Brain row copied out of Notion | `brain-deck-sync`, hourly :20, 7 AM–10 PM PT |
| `backupStatus` | Last backup date, verified flag, doc counts | The cloud weekly-backup writer, Sun 11:00 UTC (stages its export through files since 2026-10-05; `liveDocCount`, `consecutiveFailures`) |
| `marketSnapshot` | Index tiles (Dow, S&P 500, Nasdaq), fallback movers/sectors, `asOf` naming the session | The cloud market-close writer, weekdays 21:20 UTC (since 2026-10-05; the Mac's `feeds-market-close` before) |
| `taskLease` | Which Mac holds the one-writer lease, and until when | Either Mac's `claude-auto`, on a lease check/take/release |
| `cloudWriteProbe` | Proof that a cloud routine can write the DB unattended | A one-shot probe routine, fired 2026-09-22 |
| `feedFreshness` | Per-feed fresh/late/stale/unknown/missing verdict, 26 feeds | The feed-freshness watchdog, daily 16:12 UTC |
| `isaLadder` | The ISA line's reply-check and escalation state | The ISA escalation-ladder routine, weekdays 14:30 UTC |
| `appleHealth` | Apple Health vitals | Cloud routine "Apple Health — Drive export → deck sync" (6:15 AM PT) from the Health Auto Export files in Google Drive, `scripts/health-drive-sync.py`; status in `healthDriveSync`. Old `r8-apple-health-snapshot` to be disabled; `health-notion-sync` optional |
| `stravaSnapshot` | Latest Strava activity | `strava-daily-sync`, `20 5 * * *` PT — bare-write defect, see above |
| `loftyLeads` / `zohoLeads` / `zohoDeals` | Real-estate / mortgage pipeline | `lofty-crm-sync` / `zoho-crm-sync` skills — both blocked on a credential as of 2026-09-24 |
| `isaKpi` | ISA scorecard actuals | The live Pipeline Sync cloud routine, 04/10/16/22 UTC |
| `realEstateBrief` | Weekly Monday brief | The "Real Estate Weekly Brief" cloud routine — proving run has hung twice, see `always-on/README.md` |
| `strategySnapshot` | QuantVue-style strategy state | Contested by two writers, `r4-quantvue-sync` (refused) and a cloud routine (writes nothing) — see `always-on/README.md` |

Not a complete list — 14 of ~175. For anything else, read `docs/inventory/db-docs.md` for the name
and stamp, then the panel or task that names it.

## Push-button docs — the one queue, the desks and the ISA Portal lists (2026-10-22)

Added 2026-10-22 with the push-button system (`wiki/ai-team/push-button-system.md`). Shapes come from the
routine prompts and `.claude/skills/cos-daily-cycle`; where a shape is not written down here it says "see the
routine prompt" rather than guessing. Every doc is `{v: ...}`.

| Doc | Means | Written by |
|---|---|---|
| `vanessaQueue` | The single intake for Vanessa's team; append-only items, each at least `{task, priority, status: pending→done\|needs-steven, from, ref, note}` (other fields: see the routine prompt) | Deck buttons ("Hand to Vanessa"), Vanessa's `queue_task` tool, the `/queue` mod, the ISA `vanessaOutbox` move, the routines and skills; worked by the 6:25 AM cycle `trig_019whypw6EeNu2G8xxY5xE5N` |
| `cosBrief` | `{date, ranAt, needsSteven (≤3), delegated, drafts, isaInstructions, queuedForSteven, split{automation, aiTeam, isaEa, steven, stevenShare}, stale, headline}` — "Today from Vanessa" | The daily cycle, weekdays 6:25 AM PT, `set` once per run |
| `morningBrief` | `{date, ranAt, text, voiceScript, needsYou, dashboards{commandDeck, isaPortal, brokerCommandCenter}}` — the one brief the push, the iMessage and the voice note all read | Morning brief routine `trig_01Q9VPMwrKwNUW3kZL54rKgy`, daily 6:34 AM PT |
| `morningBriefStatus` | `{imessage: "sent", textSource: "morningBrief"\|"mac", voiceQueued, …}` — did the Mac actually send | Mac task `vanessa-morning-brief-text` (merge, §8/§8b) and the cloud brief (its own keys) |
| `inboxDesk` | Inbox triage groups and drafts; `meetings[]` with `recapped: true` once a recap exists (shape: see the deck page) | Deck buttons "Triage inbox" / "Recap meetings" with the viewer's connectors; `meeting-recap-to-crm` changes only `recapped` |
| `tcDeals` | The TC intake: per deal the dates the contract states (acceptance, EMD, contingencies, COE), side, client first name; a missing date is a flag, never a default | The ISA via the deck's TC intake form; `tc-doc-intake` skill (Document Intake Clerk) |
| `tcDesk` | Each open deal's timeline, checklist, due-in-7 and overdue items, reminder and confirmation drafts, ≤3 packets | Transaction & Showing desk `trig_011iofWVNizNQ1SNujNcp5tL`, weekdays 6:05 AM PT (first run 2026-10-22 14:10 UTC) |
| `refiWatch` | Steven's older hand-entered rate-watch rows (an array; Ops Radar panel, `p9RowList`); empty `[]` at 14 bytes in the 2026-09-22 export — the Monday routine never touches it | hand-entered on the deck |
| `refiWatchDesk` | The Monday routine's output: `{date, ranAt, marketAverage{thirty, fifteen, asOf, note:"market average, not a quote"}, listSize, flagged[{first, loanType, noteRate, spread, flag, next}], standing}` | Refi watch `trig_014ipr6x9z35psmtHJCPVqj1`, Mon 7:20 AM PT (first run 2026-10-26); the `refi-watch` skill attended |
| `refiWatchList` | `{clients: [{first, noteRate, loanType, closedMonth, note, ts, status}]}` — Steven's own list; the only source of a client's rate | Steven ("refi list: …"), the deck form, and the cycle moving `listOutbox.v.refi` rows in |
| `sphereTouches` | The month's touch list: who, which kind (market / anniversary / birthday / check-in), draft id, skipped-and-why | Sphere touches `trig_01Pn8xLNKTVVFYjYTj8d8JTd`, 11th 7:40 AM PT (first run 2026-11-11); `past-client-nurture` attended |
| `sphereList` | `{people: [{first, relation, lastTouch, birthdayMonthDay, homeAnniversaryMonthDay, note, ts, status}]}` — first names only | Steven ("sphere list: …"), the deck form, and the cycle moving `listOutbox.v.sphere` rows in |
| `whatsappKapso` (updated) | `{status, numbers[{label, masked, kind, connected}], conversations[{contact, lastAt, lastDirection, unread}], counts{active, unread}, syncedAt, via}` — masked numbers, never a message body; v5 showed …5223 / sign-in pending on 2026-10-14 | Mac task `kapso-inbox-sync` (`integrations/mac-task-specs.md` §5b), hourly watch |

### On the ISA Portal (its own `state`, artifact `9Jtqg2W1t98PfhNYHNTMDS`)

| Doc | Means | Written by |
|---|---|---|
| `isaToday` | "Today from Vanessa": `cosBrief.isaInstructions` plus the ISA's step-by-step drafts and four standing duties | The daily cycle, copied each weekday morning |
| `vanessaOutbox` | The ISA's "Hand to Vanessa" box — items `pending` until the cycle moves them to `vanessaQueue` and marks them `moved` | The ISA (portal form); status by the cycle |
| `listOutbox` | `{v: {refi: [{first, noteRate, loanType, closedMonth, note, ts, status}], sphere: [{first, relation, lastTouch, birthdayMonthDay, homeAnniversaryMonthDay, note, ts, status}]}}` — the two intake forms, being added 2026-10-22; the cycle appends pending rows to the deck's `refiWatchList.v.clients` / `sphereList.v.people` (de-duplicated by first name + month) and marks them `moved` | The ISA (portal forms); status by the cycle — one of the three ISA docs the cycle may write |

These, with `isaKpi` and the five Pipeline Sync docs, are the only ISA Portal docs an automation writes.
| `brain6dStatus` | `{v:{ranAt, nodes, links, encyclopedia, loop, published, by}}` — proof that the 6D Brain daily rebuild ran (3:30 AM PT, trig_01MQ7HRYTh27b8uUM4BtnFXE) | the rebuild routine, step 7 (2026-10-23) |


---

<!-- source file: wiki/dashboard-ops/freshness-routines.md -->
# FILE: wiki/dashboard-ops/freshness-routines.md

# Command Deck — freshness routines (who refreshes what, and how often)

As of 2026-10-12. Steven's rule (2026-10-12): every block refreshes at least once a day, more often
where the data moves faster; anything without today's date gets refreshed with sourced data or an
honest "cannot refresh from the cloud" stamp. Judge a block by the stamp on the card, never by this table.

## Cloud routines (Claude subscription, WebSearch only, ArtifactData writes; never publish/Edit)

| Block (doc / key) | Routine | Schedule (UTC) |
|---|---|---|
| Global + local news (`newsSnapshot`), city lists, housing lists | Command Deck — weather & news (writer) | 01:35 and 13:35 daily |
| Headlines, AI news, on-this-day, Bears news, opp radar (`liveFeeds`) | Command Deck — morning feeds (writer, Claude) | **13:05** daily (moved 2026-10-13 to land after the Mac's 12:50 UTC overwrite) |
| Morning brief to the phone (push; reads `twinBrief`, calendar, weather, the six morning keys, market, rates) | Vanessa — morning brief to Steven's phone (cloud) — `trig_01Q9VPMwrKwNUW3kZL54rKgy` | 13:48 daily (6:48 AM PT) |
| Econoday live note | Command Deck — Econoday note (writer) | 12:35 daily |
| Elite rewards scan note | Command Deck — Elite Rewards scan note (writer, **daily** since 2026-10-12, was Mondays) | 12:56 daily |
| Top performers / session read | Command Deck — top performers note (writer) | 13:26 Tue–Sat |
| PE & Defense + @DefenseUpdates notes | Command Deck — PE & Defense notes (writer, **daily** since 2026-10-12, was Mon/Thu) | 13:47 daily |
| Builder incentives note (+ ISA mirror) | Command Deck — builder incentives note (writer, **daily** since 2026-10-12, was Wednesdays) | 13:53 daily |
| Elite Affluent note | Command Deck — Elite Affluent note (writer, **daily** since 2026-10-12, was Sundays) | 15:51 daily |
| Market close (`marketSnapshot`, mkt movers/sectors) | Command Deck — market close (writer, Claude) | 21:20 Mon–Fri |
| **Safety net: every stale doc/key >26 h, market-close catch-up, ISA Portal mirror (4 liveFeeds keys + ratesSnapshot), `feedFreshness` report** | Command Deck — daily freshness sweep (writer, Claude) — `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` | 03:40 and 15:40 daily |

The sweep was created from a cloud session that holds no connector grants, so it runs **without** the
AccuWeather connector: its weather step skips itself and weather stays with the Mac task plus the
weather & news writer. To give it AccuWeather, recreate it from the claude.ai routines UI with that
connector attached (needs Steven; HALT: account change).

## ISA Portal mirror (https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041)

The ISA Portal reads the same live documents as the deck (`ratesSnapshot`, `liveFeeds`: builder note and
the three housing-market lists) and bakes its own fallback rows. Writers that mirror: weather & news
(morning run, market lists), builder incentives (its note), and the daily freshness sweep (all four keys
plus `ratesSnapshot` whenever the deck's copy is newer). Baked seeds are mirrored by a session pass:
`dashboard/wave2/refresh-stale-isa.py <isa> <deck> <ratesSnapshot.json> <date>` — last run 2026-10-12
(ISA v44: VA/FHA/jumbo and Benchmark rate rows, three builder write-ups, program-facts and market stamps).

## Mac tasks (the cloud cannot write these)

| Block | Mac task | Schedule (PT) |
|---|---|---|
| Weather (`weatherSnapshot`, wttr.in) | weather-news-refresh (did not write 2026-10-13; a session wrote v43 from AccuWeather) — the cloud sweep takes over once Steven adds the AccuWeather connector to it (NEEDS-STEVEN 102) | 8:05 AM / 8:05 PM |
| Mortgage rates + market stats (`ratesSnapshot`) | mortgage-rates-daily | daily (last write 2026-10-12 13:39 UTC) |
| Calendar (`calendarSnapshot`) | calendar-daily-sync | 6:35 AM / 5:35 PM |
| QuantVue strategy (`strategySnapshot`) | r4-quantvue-sync | last write 2026-10-09 |
| AI Hedge Fund memo (`hfCommitteeMemo`), marketing queue, weekly brief → Next Moves / SWOT, Apple Health, TV integration check | weekly loop / hand runs | stale: Sep 7 – Sep 22; needs the Mac |

## Baked seeds (HTML, refreshed by a session pass, not a routine)

Bears tracker tiles, top-performers tables, opportunity radar, builder write-ups, PE/defense and
affluent curated tables, VA comp table, loan program facts, elite-rewards tables, travel listings.
Last full pass: 2026-10-12 (`dashboard/wave2/refresh-stale.py` + `research-2026-10-12/`, deck v192).
Ask for "refresh stale deck blocks" to run the next pass; the script refuses to run twice on one deck.

## Known failure modes

**A Mac task overwrites `liveFeeds` wholesale (found 2026-10-13).** `openrouter-feeds-refresh` (5:50 AM PT),
`feeds-weekly` (9:40 PM PT) and `feeds-market-close` (10:15 PM PT weekdays) `set` the whole document from a
stale local copy with typed stamps, erasing the cloud writers' entries and pushing housing lists back days.
They were to be paused on 2026-10-05 (`integrations/mac-fix-all-2026-10-05.md` 1.1) and were not. Until Steven
pauses them, the sweep's CLOBBER GUARD refills what they erase and names them in `feedFreshness.note`, and
the morning feeds routine runs after the 12:50 UTC slot. Record: `routines/cloud-routine-repairs.md`, 2026-10-13.


Cloud runs fail with `USAGE_LIMIT_REACHED` when the subscription is capped (market close Oct 9,
top performers Oct 10, Elite Affluent Oct 11, Gridiron game-day Oct 12). The sweep exists to backfill
after such a miss; if the sweep itself hits the cap, the stamps on the cards stay honest.


---

<!-- source file: wiki/dashboard-ops/index.md -->
# FILE: wiki/dashboard-ops/index.md

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
- **Lofty is the real-estate system of record** (since 2026-09-22) and is **live since 2026-10-07**
  (lofty-bridge + lofty-cli on the Mac, key in place, 54 leads syncing; no Composio toolkit). Speed to
  lead is **not measurable yet** — the lead list returns no lead id
  (`integrations/mac-fix-isa-kpi-2026-10-08.md`). Never carry an old CRM's figure under a Lofty label.
- **Zoho is API-blocked** pending a permission only Steven can grant. Deck Zoho data is the Sep 14 paste.
- **You.com is retired.** No surface may call it. Research = Claude subscription (WebSearch/WebFetch); Perplexity removed 2026-10-05.
- **Knowledge fabric counts** (`knowledgeFabric`, its own stamp 2026-09-23 02:10 UTC): Second Brain 71
  rows · vault 832 notes · Jarvis 1,761 documents · graph 750 nodes / 1,104 edges · Ruflo 238 entries ·
  **Drive folder 0 files** (deck count; on 2026-10-09 the claude.ai connector found 1 file there — see `references/google-drive.md`). `fabric-deck-sync` has recovered — last completion ok 2026-09-22 17:08,
  and it was running again at the 02:10 stamp — so the earlier "ended in error" note is spent. Two
  counts on that row are still not what they look like: the **graph** figure is the 2026-09-13 build
  (`knowledgeGraph` has not moved since; `ops-knowledge-graph` has never run), and the **Drive**
  figure is the Mac's count (0), while the claude.ai connector (cloud sessions, read-only) finds 1
  file — the 69-row Notion export, synced 2026-09-22. Steven approved indexing it on 2026-10-09; see
  `references/google-drive.md`.

## Pages

**Status: written.** Each page describes categories and the operating rules, not a row-by-row live
table — a row-by-row table would drift the same day it was written. Ask the named doc for a current
count, per the "one rule" above.

| Page | One-line summary |
|---|---|
| `db-docs.md` | What the `state` collection's documents mean, the `{v:...}` shape rule, and which docs are known to carry a not-really-live body |
| `panel-map.md` | The deck's fifteen tabs and panels, and which docs feed the ones relevant to this repo's wikis |
| `task-catalog.md` | The Mac task rhythm under `claude-runner`, and how to read a task's status honestly |
| `freshness-routines.md` | Which routine refreshes each Command Deck block and how often (daily minimum since 2026-10-12), the sweep safety net, and what only the Mac can write |
| `routine-catalog.md` | Cloud routine categories, the disproved "can't write unattended" rule, and the connector-inheritance gotcha |
| `connections.md` | Is a connector, CRM or integration actually working — links to `integrations/CONNECTIONS.md` |

- `integrations/n8n/WORKFLOW-LIBRARY.md` — 2,061 ready-made n8n workflows as a read-only catalog (`workflow-library.sh find/show/stage`); staged inactive only, client-facing writes are Steven's switch (2026-10-12).


---

<!-- source file: wiki/dashboard-ops/panel-map.md -->
# FILE: wiki/dashboard-ops/panel-map.md

# Panel map

The Command Deck's fifteen tabs, what each one shows, and which documents feed it — use this to find where a live number would appear before going looking for it in the source.

## The fifteen tabs (page ids)

Daily Ops · Markets & Trading · Family Office & Wealth · **Lending & Real Estate** · **Showings** · **AI Team** · Career & Education · Health & Wellness · Rewards & Ventures · PE & Defense Innovation · Elite Affluent Tracker · Next Big Moves · Travel & Experiences · Toolkit & Remote Access · Orchestration & Loop.

Each tab is made of one or more named panels (HTML sections marked in the source with a `<!-- PANEL: ... -->` comment) — locate a panel by that marker text or its element id, never by line number, per `projects/command-deck.md`'s editing rule.

## Panels relevant to this repo's four wikis

| Panel | What it shows | Docs / data it reads |
|---|---|---|
| Accounts, Real Estate & Lending | Loan-program cards, VA scenario checklists, lender directory, real-estate transaction SOP, compliance quick-reference | `LOAN_PROGRAMS`, `LENDER_DIRECTORY` (in-page data, not a `state` doc), `ratesSnapshot` |
| Showings — schedule by client | Itinerary builder, route planner, ShowingTime/Showami request drafting | Client/showing records kept client-side; requests relay through the ISA line, never a doc read directly by a client |
| AI Team — employees, C-suite agents, digital twin, Vanessa | Org chart, model badges, toolbox card, roster table | `ORG_CHART` / `AI_TEAM_ORG` / `AI_TEAM_TOOLBOX` (in-page data), `aiTeamRoster`, `toolkitSnapshot` |
| Virtual EA / ISA Operations | ISA scorecard, lead triage, ISA line | `isaKpi`, `isaKpiSopActuals`, `isaGradingScores`, `isaLineRead`, `leadTriage`, `leadResponse` |
| Master Plan | Priorities, kanban, sprint tracking | `priorities`, `kanbanCards`, `todoList`, `sprintGoal`, `sprintDates`, `sprintVelocity` |
| Orchestration & Loop Engineering | Runner status, cloud routines, CI log, backup status | `runnerStatus`, `routineHealth`, `ciLog`/`ciLogResetToken`, `backupStatus`, `knowledgeFabric` |

## How to trace a panel to its data when this table doesn't have it

Search the deck source for the panel's element id (shown in its `<!-- PANEL: ... -->` marker or its `id="..."` attribute), then find the `lsGet("<docName>", ...)` calls inside the render function that fills that element — the doc name passed to `lsGet` is the `state` collection document that feeds it. This is Lena's (Code Explorer) lane when it needs doing live; see `wiki/ai-team/org-chart.md`.

## What this page cannot tell you

Whether a panel's number is **current** — that is a freshness question, answered by the doc's own stamp (`wiki/dashboard-ops/db-docs.md`), never by which panel displays it.

## See also

- `wiki/dashboard-ops/db-docs.md` — the documents themselves and their known freshness issues.
- `wiki/ai-team/org-chart.md` — the AI Team panel's content in full.

Source: Command Deck source, `PAGE_DEFS` array (the fifteen tabs) and the `<!-- PANEL: ... -->` markers throughout the document.


---

<!-- source file: wiki/dashboard-ops/routine-catalog.md -->
# FILE: wiki/dashboard-ops/routine-catalog.md

# Routine catalog

The cloud routines (claude.ai/code routines) — what they can and cannot write, and the specific belief about them that turned out to be wrong.

## What changed — read this before assuming a routine can't write

The old rule was "a cloud routine cannot write to the artifact database unattended — it parks on a permission prompt." That was true when last tested in early September 2026 and is **disproved now**: a probe routine wrote this deck's own artifact database with nobody present, and several cloud writers (weekly backup, live pipeline sync, the ISA escalation ladder, the feed-freshness watchdog among them) run on that finding today. **Do not refuse a cloud write on the authority of the old rule.**

## What still pins a routine to the Mac

Not the write capability — **connectors.** A routine created by an agent still lacks whatever connectors that creating session didn't have; anything needing Zoho, Lofty, Gmail, or GitHub credentials stays on the Mac task layer (`wiki/dashboard-ops/task-catalog.md`) until the routine itself is created from a session holding those connectors. **Check a routine's actual `mcp_connections`, never infer connector access from `created_via`** — routines created the same way have been observed with wildly different connector counts, because connectors are inherited from the session that created the routine, not from its type.

## Categories seen in practice

- **Daily research cadence — the layer that reliably holds:** weather & news (several times daily), calendar and Strava refresh, mortgage rates & market data, the Econoday economic calendar, top-performer and builder-incentive scans, opportunity-radar research, the weekday strategy sync.
- **Weekly review / self-improvement layer — the layer that has repeatedly failed:** the loop-engineering QA, the orchestrated ops review, the weekly self-improvement and weekly improvement loops, the weekly opportunity audit, ops/project issue reviews, the books-reconciliation reminder. Treat a "FAILED last run" status here as the norm to verify against, not the exception.
- **Disabled / abandoned:** routines superseded by a Mac-task equivalent, or abandoned when a dependency (e.g. the Steve-twin cloud path) was dropped.

## The one rule that matters most

**A routine reporting SUCCEEDED has not necessarily changed anything.** Judge every routine by whether its target document's own stamp moved (`wiki/dashboard-ops/db-docs.md`), never by the routine's own reported status — this is the same "task ok ≠ document written" rule that applies to Mac tasks, and it applies at least as strongly here because a routine's failure modes are less visible day to day.

## Where the live table actually is

Per-routine schedule, enabled/disabled state, and last-run status are read from the routines list and `routineHealth` at their own stamps — this page describes the categories and the two hard-won rules above, not a row-by-row table that would drift the same day it's written.

## See also

- `wiki/dashboard-ops/task-catalog.md` — the Mac-task equivalent, and the connector/credential line between the two.
- `wiki/dashboard-ops/db-docs.md` — how to verify a routine's claimed write.

Source: `projects/command-deck.md` ("Known open items") and `wiki/dashboard-ops/index.md` ("Standing facts"), describing the cloud-write-capability finding and the connector-inheritance rule.


---

<!-- source file: wiki/dashboard-ops/task-catalog.md -->
# FILE: wiki/dashboard-ops/task-catalog.md

# Task catalog

The Mac's scheduled tasks under `claude-runner` — headless, pre-approved tools — and how to read whether one actually did its job. For the status vocabulary itself see `wiki/dashboard-ops/index.md`'s "one rule."

## Daily rhythm (PT)

Weather + news refresh (morning and evening) · incentives scan · lead triage ahead of the ISA's noon huddle · Vanessa's sweep and Steve's sweep (weekdays, back to back) · showing sync (three times a day, Mon–Sat) · the ISA comms bridge (hourly through the workday) · the research queue (hourly through the workday) · brain-deck-sync (hourly through the workday) · the local-bridge queue (hourly) · the iMessage inbox check (every 10 minutes).

## Weekly / monthly / gated rhythm

Coach's weekly coaching recommendations (Monday) · Vanessa's ops review (Friday night, executives in parallel) · the engineering self-update loop (Friday night: audit → verify last week's builds → capped proposals, human-in-the-loop) · the week-in-review (Friday night) · loop-engineering-weekly (Saturday) · ops-knowledge-graph rebuild (Sunday) · skills-refresh (Sunday) · the weekly backup (Sunday) · access & credential audit (1st of the month) · month-end close prep (28th).

**Read this list as the schedule, not a record of what has run.** Several of these slots have a documented history of never completing under the runner — always check the current `runnerStatus` doc for the real per-task history before repeating a task's schedule as if it were a completion.

## How to read a task's status — never take "ok" at face value

Per `wiki/dashboard-ops/index.md`'s rule, every task's status is one of: `ok, last <date/time>` · `failed <date>: <reason>` · `limited` · `refused` (a tool or path was not on the runner's allow-list) · `never run under the runner`. A task reporting `ok` still needs its target document's own stamp checked (`wiki/dashboard-ops/db-docs.md`) — a silent no-write success is a documented failure mode here, not a hypothetical one.

## What pins a task to the Mac specifically

Anything needing local files, the local model, or the keychain must run under `claude-runner` on the Mac — it cannot run as a cloud routine. **If the Mac is asleep, none of this runs.** That is the single biggest availability risk in this whole automation layer; see `always-on/README.md` for the full picture.

## Where the live table actually is

The per-task cron expression, last-write target, and current status are read from `runnerStatus` at its own sync stamp — this page describes the categories and the rhythm, not a maintained row-by-row table, because that table drifts within the same day it's written. Ask the doc.

## See also

- `wiki/dashboard-ops/routine-catalog.md` — the cloud-side equivalent, and what a routine still cannot do that a Mac task can.
- `wiki/dashboard-ops/db-docs.md` — how to verify a task's claimed write actually happened.

Source: Command Deck, "Mac scheduled tasks" toolbox card (`AI_TEAM_TOOLBOX`) and `runnerStatus` doc structure as read via `projects/command-deck.md`.
