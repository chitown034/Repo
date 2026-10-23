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
