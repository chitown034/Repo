# Projects and their status

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `03-projects`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: projects/ai-team.md -->
# FILE: projects/ai-team.md

# Project — AI Team

**What.** The org of AI seats that runs behind Vanessa: on the Mac, **172 agents** (tier 1: 17,
tier 2: 96, tier 3: 59), **15 MCP servers** (`toolkitSnapshot`, synced 2026-09-16 00:52 UTC);
**59 scheduled tasks** (`runnerStatus` 2026-09-23 02:10 UTC). Full seat-by-seat detail is in `wiki/ai-team/index.md` — do not read the
roster dump to answer a "who owns X" question.

## The shape

- **Steven** — principal. Every licensed decision.
- **Vanessa** — Chief of Staff / COO, orchestrator, single point of contact, council chair.
- **Steve** — Steven's digital twin, Tier-1 work.
- **Executives:** Marcus (CFO) · Sofia (CMO) · Derek (CTO) · Alexandra (CCO) · Nadia (CAIO) ·
  Victor (CRO) · Elena (CISO) · Elon (CTO Innovator).
- **Mentors:** Maxwell (broker coach) · Apex (trade advisor) · James (wealth / family office) ·
  **Kevin** (personal development — one name everywhere since 2026-10-07; skill `kevin-mentor`).
- **Human:** ISA / EA, Mon–Fri 12–4 PM PT.

Lead agents by fan-out: cro-victor 27 · vanessa-orchestrator 22 · cmo-sofia 15 · cco-alexandra 12 ·
cto-derek 10 · cfo-marcus 8 · caio-nadia 6 · portfolio-manager 6 · ciso-elena 4.

## The engineering loop (under Elon, vetted before anything ships)

Stress Test · Reliability · Efficiency · Capability · Integration engineers, plus Sandbox QA and the
Chief Automation Strategist. **ECC** (standards, test, observability, accessibility, security,
dependency and agent-safety officers, under Derek) reviews every change — it is a **gate, not a store**.
Nadia scans outward and proposes; Elon vets inward and decides feasibility; both are proposal-only and
report to Steven cc Vanessa.

## Status (2026-09-22) — honest

- Model tiering is decided and recorded (`context/decisions.md`), not yet enforced by tooling.
- **Skills present on the Mac:** continuous-process-improvement, automation-audit, automation-audit-ops,
  ai-ecosystem-backup, deck-backup, `fub-followups` (legacy template library — needs porting to
  Lofty; the folder name on the Mac is left as-is until Steven renames the skill there).
  **Not present:** interview-me, prompt-master, vanessa-orchestrator (it exists as an agent,
  and the CI log records a Mac skill on 2026-09-08, but it is not in the snapshot's 1,400 names),
  loop-engineering, scale-growth-engine. `skills-refresh` exists as a **Sunday task that has never run**,
  not as a skill.
- `weekly-self-update` (Fri 23:10 PT) has **never run**; `improvementProposals` is empty.
- `steve-twin-sweep` (weekdays 12:55 PM PT) last **refused**: a Bash write to `~/Shearrill-Vault` is
  not on the runner's allow-list. The cloud Steve-twin routine is disabled.


---

<!-- source file: projects/command-deck.md -->
# FILE: projects/command-deck.md

# Project — Command Deck

**What.** Steven's single-file personal/business dashboard, published as a claude.ai artifact.
~4 MB, ~25.6k lines, one HTML file with an inline script and a seed JSON block.

**Status (2026-09-22).** Live. Last build stamp in the footer: 2026-09-15 02:19 PT. Latest CI-log
entry 2026-09-20. This cycle is Loop Cycle 6.

## Where the live data lives

Not in this repo. The deck reads an **artifact database, collection `state`** — **175 documents** at
a read on 2026-09-23 03:10 UTC (the 2026-09-22 08:10 UTC export that most of this cycle's audit was
written against held 161; anything quoting 161 is an artefact of that export, not a current count).
Ask the doc, never the page source, for a current number.

| Question | Doc |
|---|---|
| Weather / news / feeds | `weatherSnapshot`, `newsSnapshot`, `liveFeeds` |
| Calendar (next 7 days) | `calendarSnapshot` |
| Mortgage rates | `ratesSnapshot` |
| Markets, strategies | `marketSnapshot`, `strategySnapshot`, `openTerminalSnapshot` |
| Real-estate CRM leads | `loftyLeads` (written by lofty-crm-sync since 2026-10-07 — 54 leads, stage totals; firstResponse not computable until the lead id is resolved), `leadTriage`, `leadResponse` |
| Mortgage CRM | `zohoSync` (exists at v1, body is the 403 `NO_PERMISSION` block); `zohoLeads` and `zohoDeals` **do not exist** — the Deals module has never been read |
| Health | `appleHealth` (last real ingest 2026-09-13), `healthAnalysis` |
| Knowledge stores | `knowledgeFabric`, `secondBrain`, `toolkitSnapshot` |
| Automation truth | `runnerStatus`, `routineHealth`, `ciLog`, `backupStatus` |

Every doc is `{"v": ...}` — **no exceptions.** Write `data:{v:<whole doc>}`, never the bare value.
`stravaSnapshot` was written bare (top-level `activities`/`syncedAt`/`via`) until 2026-09-22, when it
was repaired to `{v:{activities,syncedAt,via}}`. Readers still accept both shapes defensively, but a
doc whose top level is not a single `v` key is a **writer bug to fix**, not a shape to reproduce.

## Rules for working on it

- Edit only an assigned region. Locate by element id or marker text, never by line number.
- Never touch the footer build stamp, `var PAGE_DEFS`, `function panelStampRegistry`, the
  `<!-- PANEL: MASTER PLAN -->` marker, or the final `</script>` line.
- A seed array plus its `*_SYNCED_AT` constant is a fallback. Re-bake it from the live doc **only**
  when the doc is newer, keeping the seed's exact structure.
- Validate before commit: the static quickcheck, `node --check` on the extracted inline script, and
  a grep that every element id the JS references exists.

## Known open items (listed 2026-09-22 · re-verified 2026-09-23 03:10 UTC)

- `stravaSnapshot`: the document was repaired to `{v:…}` on 2026-09-22 and **is still wrapped** at
  version 9 (`syncedAt 2026-09-22T13:05:00Z`). The Mac task `strava-daily-sync` (`20 5 * * *` PT)
  still writes it bare and its prompt is on the Mac, so only Steven can fix the cause. A cloud
  routine, *Command Deck — Strava wrapper guard* (`47 12 * * *`, enabled, created 2026-09-22
  23:27 UTC), now stands behind it and repairs a bare write 27 minutes after the task fires; it has
  **never run** — its first firing is 2026-09-23 12:47 UTC.
- `openrouterFeeds` is frozen at 2026-09-13 while its writer `openrouter-feeds-refresh` reports
  `ok` — a silent no-write success, found by the first `feedFreshness` sweep (2026-09-23 00:50 UTC).
  Four documents are stale by that sweep: `appleHealth`, `strategySnapshot`, `openrouterFeeds`,
  `knowledgeGraph`.
- Still broken on the runner at the 2026-09-23 02:10 UTC `runnerStatus`: `nightly-self-test`
  (error), and `r4-quantvue-sync`, `lead-triage-daily`, `feeds-weekly` (refused). 18 weekly/monthly
  slots have still never run.
- The Orca card says "Not installed yet". The stack reports "Orca Computer Use" v1.4.220 (Mac snapshot 2026-10-05; v1.4.203 on 09-16) (Stably AI)
  installed on the Mac as a standalone computer-use app, with the IDE/worktree integration **not**
  done — but that install has never been verified from anywhere but the Mac (`./mac-verify.sh`).
- **Closed since this list was written:** `r17-trading-day-log` is no longer failing (`ok`,
  last end 2026-09-22); and the old line here — "cloud routines cannot write to the artifact DB
  unattended" — is **disproved**, see `README.md` and `docs/CLOUD-WRITE-ARCHITECTURE.md`.

## Status (2026-10-22) — version 230 (list intake forms, tools per seat, Text me the brief, Zoom recaps)

Published as **version 224** on 2026-10-22 (session note; the footer stamp is not re-read here). What this
version carries, all drafts-only (`wiki/ai-team/push-button-system.md`, `context/decisions.md` 2026-10-22):

- **One Vanessa queue** — `vanessaQueue`, written by "Hand to Vanessa" on kanban, lead and deal rows, Vanessa's
  `queue_task` tool, `/queue`, the ISA Portal's outbox and the routines; worked first by the 6:25 AM cycle.
- **Push-buttons on the Vanessa panel** — Today from Vanessa (`cosBrief`), Run cycle now, TC desk + intake form
  (`tcDeals`), Draft follow-ups, Triage inbox and Recap meetings (Gmail / Fieldy / Zoom through the page's own
  connectors, writing `inboxDesk`), Text me this brief (Inkbox, Steven's own mobile only, number in localStorage).
- **Morning brief** read from `morningBrief` (6:34 AM PT, three dashboards) — the same text the Mac sends by
  iMessage and voice at 6:40.
- **Refi list and sphere list forms** writing `refiWatchList` and `sphereList`; cards for `refiWatchDesk` and
  `sphereTouches` (both routines live, first runs 2026-10-26 and 2026-11-11 — nothing has run yet).
- **WhatsApp — Kapso** card (`whatsappKapso`), Zoom beside Fieldy in the meeting recap, Gondola travel desk through
  connect-all 4b.
- Freshness sweep once a day (15:40 UTC) with per-key cadence; routine usage cut about 34%; backup moved to Sunday
  21:07 UTC after the allowance reset.
- Still open from the earlier lists: the Mac runner silent 2026-10-13 → the 2026-10-22 paste restarts it; Zoho waits
  on the API tick; Strava guard disabled until the Mac task runs again.


---

<!-- source file: projects/isa-portal.md -->
# FILE: projects/isa-portal.md

# Project — ISA Portal

**What.** A second published artifact, separate from the Command Deck: the working surface for the
human ISA / EA and for the mortgage-desk data that has to be shared rather than kept in the deck.
Linked from Command Deck Panel 22.

**Who uses it.** The human **ISA / EA**, Mon–Fri **12–4 PM PT**. Vanessa is the only AI voice that
talks to the ISA — no other seat contacts her directly.

## Status (2026-09-22) — honest

- The **cloud** hourly ISA comms bridge routine is **DISABLED**.
- The Mac task **`isa-comms-bridge-local`** runs hourly at :37, **7:37 AM–9:37 PM PT**; last ok
  **2026-09-21 20:38 PT**. It merges the shared message thread both ways. The window was narrowed
  from 24 h because overnight runs moved no messages.
- **The ISA has posted nothing since 2026-09-16.** The bridge running is not the same as traffic
  flowing; say both.
- `r11-isa-kpi-compile` (Sun 04:40 PT) last ran 2026-10-04 and was refused. It must turn **Lofty**
  events into KPI actuals; **Lofty is live since 2026-10-07** (54 leads), but its lead list carries no
  lead id, so speed to lead is not measurable yet — see `integrations/mac-fix-isa-kpi-2026-10-08.md`.
- The `isaKpi` doc holds **no measured actuals**: since 2026-10-08 every metric reads "not measured yet" with its real reason (the older 2026-09-13 actuals were overwritten by failure text on 2026-10-04). Speed to lead waits on the Mac probe in `integrations/mac-fix-isa-kpi-2026-10-08.md`.

## Where the live data lives

`isaKpi`, `leadTriage`, `leadResponse`, `isaLine` (the shared thread), `showingSchedule`
(currently empty). Loan-program and lender-directory counts on the portal are drift-checked against
the Command Deck: **39 loan programs, 61 lenders**. If those two numbers disagree between the two
artifacts, that is the bug — do not "fix" one side by editing the other's count.

## Rules

- The playbook content is duplicated between the deck and the portal. A playbook fix must be applied
  to both, or it silently diverges.
- Nothing here contacts a client or a listing agent directly. Hand-offs land on the ISA line and
  reach the portal on the next bridge run.

## Update — 2026-09-22 (second pass)

- Published as **version 27**: You.com grant dropped, **Lofty** set as the real-estate system of
  record, the four sync-engine reliability fixes ported.
- **Daily scorecard form added** to the Virtual EA / ISA Operations panel. It writes `isaScorecard`
  rows in the Command Deck's own shape, and "Send to Steven" posts the day's numbers on the ISA line.
- **Sync is real now**: a cloud routine carries `reClients`, `pipeline`, `isaGradingScores`,
  `isaKpiSopActuals` and `isaScorecard` both ways four times a day and verifies by reading back.
  The ISA line still crosses on the Mac bridge (hourly 7:37 AM–9:37 PM PT).
- **The seat**: 9 messages on the line, all Steven → ISA; 0 ISA-authored, ever; scorecard never
  filled; last opened 2026-09-13. Decision packet: `docs/ISA-SEAT-DECISION.md`.
- Panels renumbered 01–14 top to bottom; reference panels carry a "Verified <date>" stamp.

## Status (2026-10-22) — version 48 (refi and sphere list intake; another session added a Capability Pack section)

Published as **version 46** on 2026-10-22 (session note). What this version carries
(`wiki/ai-team/push-button-system.md`, `context/decisions.md` 2026-10-22):

- **Panel 01 opens with "Today from Vanessa"** — `isaToday`, copied each weekday from `cosBrief.isaInstructions`
  with the ISA's step-by-step drafts and four standing duties, for the 12 PM huddle.
- **"Hand to Vanessa" box** — writes `vanessaOutbox`; the 6:25 AM cycle moves pending items to the deck's
  `vanessaQueue` and marks them `moved`. Vanessa is still the only AI voice that talks to the ISA.
- **Two intake forms, being added 2026-10-22** — the refi list and the sphere list, written to `listOutbox`
  (`{refi: [...], sphere: [...]}`, rows `pending` → `moved`); the cycle appends them to the deck's
  `refiWatchList.v.clients` / `sphereList.v.people`. First names only; the note rate is the one figure.
- **Rates and feeds re-mirrored** from the deck (the Mac rates task silent since 2026-10-13); the freshness sweep
  keeps `ratesSnapshot` / `liveFeeds` here in step with the deck once a day.
- `tcDeals` intake stays the ISA's one manual step for the Transaction & Showing desk: enter each new deal's dates
  from the RPA; a date the document does not state is a flag, not a guess.
- Docs an automation may write here: `isaToday`, `vanessaOutbox` status, `listOutbox` status, plus `isaKpi` and
  the five Pipeline Sync docs (`wiki/dashboard-ops/db-docs.md`).
- Steven's step: share the portal with the ISA/EA (`docs/STEVEN-STEPS.md` 7). The seat packet
  (`docs/ISA-SEAT-DECISION.md`) is still open.


---

<!-- source file: projects/nonprofit.md -->
# FILE: projects/nonprofit.md

# Project — Active Duty Veteran & Hometown Hero Homeowners Club, Inc.

**What.** Steven's 501(c)(3). Mission: getting active-duty, veteran and hometown-hero families into
homes. Tracked on the Command Deck's Nonprofit & Future Ventures panel (Panel 31).

## Status (2026-09-22) — honest, from the deck's own counters

| Metric | Value |
|---|---|
| Families housed (cumulative) | 0 |
| Grant funding secured YTD | $0 |
| Volunteer hours YTD | 0 |
| Google Ad Grant | $10,000/month (the grant allowance, not money raised) |

These are real zeros, not missing data. The organisation is in its build-out phase. Do not present
the $10,000 Ad Grant as revenue.

## Grant pipeline (live doc: `grantPipeline`)

| Funder | Status |
|---|---|
| PenFed Foundation — Military Heroes Program | Researching partnership |
| California GrantWatch | Building eligible-grant pipeline |
| Grants.gov (federal) | Not started |

No amounts and no deadlines are recorded yet on any of the three.

## Who works it

**Paloma** — grant writer (501(c)(3)), under Marcus. **Corinne** — nonprofit & grants lead.
**Hazel** — incentives & programs scout, feeds the `incentives-daily-scan` task (daily 7:50 AM PT,
last ok 2026-09-21).

## Open work

- Website redesign — tracked on the deck as its own artifact.
- Google Ad Grant setup for the $10K/month webinar plan (kanban, priority 3, no due date).
- The grant pipeline needs amounts and deadlines before it can be scheduled against.

## Where the live data lives

`grantPipeline`, `npFamilies`, `npGrantFunding`, `npHours` in the deck's `state` collection.
Never hand-type these numbers into a document — read the doc.


---

<!-- source file: projects/usc-pjmt-530.md -->
# FILE: projects/usc-pjmt-530.md

# Project — USC, PJMT 530

**What.** Steven's current course in the **USC MS Project Management** program. Year 2 of 2,
expected graduation **August 2027**. Deadlines are synced from the Canvas calendar (last sync
recorded on the deck: 2026-08-28).

**Live classroom.** Wednesdays 5:30–7:00 PM PT (Zoom).

## Deadlines (live doc: `uscDeadlines`)

| Item | Due |
|---|---|
| Week 1 — Discussion | 2026-09-02 |
| Week 1 — Assignment & Participation | 2026-09-06 |
| Week 2 — Discussion | 2026-09-09 |
| Week 2 — Assignment & Participation | 2026-09-13 |
| Week 3 — Discussion | 2026-09-16 |
| Week 3 — Assignment & Participation | 2026-09-20 |
| **Week 4 — Discussion** | **2026-09-23** |
| **Week 4 — Assignment & Participation** | **2026-09-27** |
| **Week 8 — Final Assessment** | **2026-10-19** |

As of 2026-09-22, Weeks 1–3 have passed; the next two deadlines are **tomorrow (Sep 23)** and
**Sep 27**. Rows dated before today must render as passed, not upcoming.

## Why it is in the brain

- It competes for the same calendar as the loan desk. Any capacity planning that ignores a Wednesday
  evening class or a Sunday assignment deadline is wrong.
- The MS PM track plus the Chicago Booth CAIO program (starts Sep 2027) is the stated path to the
  CAIO/consulting line of business — it is a business project, not only schoolwork.

## Where the live data lives

`uscDeadlines` and `uscSchedule` in the deck's `state` collection, plus `calendarSnapshot` for the
week's actual calendar. Read the doc; do not re-type the table.
