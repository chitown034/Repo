# Automation map — who does what on the Command Deck (2026-10-26)

Carried forward from `docs/AUTOMATION-MAP-2026-10-20.md` (same columns, so `bin/brain owner` answers from this file) with the
2026-10-26 process-coverage pass: Nova (Coverage & Process Auditor) owns the document-level register and the live Process
coverage card; rows 15, 20, 33, 35, 39 and 41 changed. The document-level truth is `docs/inventory/process-coverage.md`
(`bin/brain coverage`), gaps first with their owner seats; this table stays panel-level.

Owners: **Routine** (claude.ai cloud routine), **Mac** (claude-runner task), **Vanessa** (daily Chief-of-Staff cycle), **Steve**
(digital twin), **ISA/EA** (human), **Nova** (coverage register + card), **Steven** (the HALT list in `CLAUDE.md`).

| # | Panel | Owner | Mechanism (what keeps it alive) | Steven's residual |
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
| 15 | Health & Wellness | Routine + Kevin | Cloud Health daily sync (6:15 AM PT: Apple Health Drive export + Strava → `appleHealth`, `stravaSnapshot`); `health-full-analysis` still reads the retired Notion path (`healthAnalysis` stale since Oct 8 — Sam repoints it) | Keep Health Auto Export running on the phone |
| 16 | Mind — USC | Routine | R19 USC planner (Sun evening) | Study |
| 17 | Family Office | Steven + James | Manual; James drafts reviews on request | Decide |
| 18 | Tools & Notebooks | Mac | `weekly-self-update` (never run under the runner) | — |
| 19 | Showings | Routine + Mac + ISA | Transaction & Showing desk (weekdays): prep, route, confirmation drafts, feedback form; `showing-sync` 3×/day from Lofty appointments; ISA sends confirmations | **Sign in once to ShowingTime / Showami** (step 14) |
| 20 | Virtual EA / ISA Operations | Routine + Mac + ISA + Voicemail & Inbox Triage | Pipeline Sync (KPI docs; `isaScorecard` empty until the ISA's first scored day), `lead-triage-daily`, `lofty-crm-sync`, `r2-lead-response-watchdog`, `r11-isa-kpi-compile`, `r12-inbox-triage`; the Inbox & Meetings card reads `inboxDesk`, which nothing writes yet (Nova gap) | Hire/onboard the ISA; Zoho API grant |
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
| 33 | Marketing & Content | Mac + Routine + Sofia/Alexandra | `r14-content-pipeline` (Tue–Fri) reports ok but `marketingQueue` has not moved since Oct 8 (Nova gap; Sofia/Sam); VA avatar drafts (Sun); AI twin autopilot posts only approved items; Alexandra's compliance line on every draft | Approve posts |
| 34 | Dream Future Empire | Steven | Manual | — |
| 35 | Ops Radar | Mac + Routine + Nova | `r10-automation-health`, backup writer (Sun), `r2` watchdog; the Process coverage card (Orchestration 39.0) scores every automated document from its own stamp | Read |
| 36 | Practice Trackers | Routine + ISA + Victor | Transaction & Showing desk reads the TC intake (`tcDeals`): timelines, checklists, deadline alerts, reminder drafts; ISA enters each new deal's dates from the RPA; `revenue-scan-weekly` / `mortgage-desk-weekly` (Mac, Sun) | Sign; approve client sends |
| 37 | Money Housekeeping | Steven + Grace | Manual subscriptions list; Grace flags anomalies at month-end (`month-end-close-prep`, 28th) | Cancel/keep |
| 38 | Toolkit & Remote Access | Mac | `toolkit-deck-sync`, `fabric-deck-sync` | Paste `rc-agent.sh report` once |
| 39 | Orchestration & Loop Engineering | Routine + Mac + Nova | **Process coverage card (39.0, live, no tokens)**; Saturday loop + self-test (cloud), `loop-engineering-weekly` (now writes only `loopLog` — its four companion docs are stale: Ezra), `cpi-daily-scan`; GitHub `brain-loop` on every push | Switch off the 3 duplicate Sunday loops |
| 40 | Computer Hub | Steven | Paste the two report lines (steps 9–10) | Once |
| 41 | Trading Research Desk | Apex + Mac | No writer today: `tradingDeskReport` never moves. Fix: a weekly Mac task running `integrations/trading-desk` (paper mode) — Nova's gap #1 | — |

## What changed on 2026-10-26

| Change | Where | Status |
|---|---|---|
| Process-coverage register: every deck document → writer, cadence, owner seat, pod | `brain/coverage/writers.json`, `bin/brain coverage`, `docs/inventory/process-coverage.md` | written; 266 rows, 26 gaps with owners |
| Live Process coverage card, first section of Orchestration & Loop Engineering; `processCoverage` deck document | Command Deck version 250 (artifact 3jbdGMNFkGLEpJiZ3cTmZW), `dashboard/wave2/splice-process-coverage.py` | published |
| Nova joins Derek's reports on the deck's org chart and in `wiki/ai-team/org-chart.md` | deck ORG_CHART, wiki | done |
| Freshness sweep STEP 1b: reads the register, reports gaps with owner seats into `feedFreshness.coverage` | `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` | prompt updated 18:51 UTC; first proof 2026-10-27 15:40 UTC |
| Big-moves "Cover <doc>" signals from `bin/brain coverage --json` | `trig_01XwFre24w9aKq5oVRq1FQ8s` | NOT applied — prompt bound to its own session; step written in `docs/inventory/daily-updates.md` for that session to adopt |
| CI green again: layers test reads the manifest date; index reindexed | `.github/workflows/brain-loop.yml`, `setup-health.yml` | passing on this commit |
