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
| `appleHealth` | Apple Health vitals | Old: `r8-apple-health-snapshot` (writes nothing live — see `always-on/README.md`). New: `health-notion-sync`, spec only |
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
