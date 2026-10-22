# AI Team org chart

The full seat map behind Vanessa: Steven at the top, then Steve (digital twin) / Vanessa (Chief of Staff) / the human ISA, then eight executives each with their own named reports and ruflo benches, then the mentor seats on call through Vanessa.

## The shape

```
Steven (Principal)
├─ Steve — digital twin, Tier-1 work
├─ Vanessa — Chief of Staff / COO / orchestrator, council chair — the 80/20 rule (Steven, 2026-10-20):
│   │   AI, automations, Steve, Vanessa and the ISA/EA handle 80%; Steven personally does only the 20% on the HALT list
│   ├─ Daily Chief-of-Staff cycle — cloud routine, weekdays 6:25 AM PT: backlog → Automation / AI team / ISA-EA /
│   │   Steven buckets → ≤8 cross-functional squads in parallel (lane leads below, Alexandra on any client/ad draft,
│   │   Elena on anything that smells like fraud) → QA → `cosBrief` (≤3 Needs-Steven), `twinQueue`, `vanessaRuns`
│   │   (docs/AUTOMATION-MAP-2026-10-20.md)
│   ├─ Morning brief to Steven's phone — 6:40 AM iMessage text (Mac `vanessa-morning-brief-text`), 6:48 AM Claude-app
│   │   push (cloud, reads `cosBrief`), then her recorded voice as a voice note on the same thread (Mac
│   │   `voice-reply-render` → `vanessa-voice-send.py`; spec `integrations/mac-task-specs.md` §7)
│   ├─ Jarvis — on-device voice + local index (verify: integrations/jarvis/jarvis-setup.sh; voice = Vanessa's recorded Magica set)
│   ├─ Laya — zero-token on-device first hop (proposed; Mac install unverified, routing logic proven on the stub only — integrations/laya/)
│   ├─ Knowledge fabric — Second Brain · vault · Jarvis · Graphify · Ruflo, one recall (+ Notion record, Google Drive mirror read-only)
│   ├─ Brain loop — self-check that finds unanswered questions, drift, wrong routing and untested pages (`bin/brain loop`)
│   ├─ Browser hands + skill finder — `agent-browser`, Playwright MCP, `find-skills` (any seat asks Vanessa; Integration Engineer owns, Elena gates; stop before submit/send/pay) — `integrations/browser-agents/`
│   ├─ Computer Hub — Claude Remote Control + Orca + AnyDesk on Mac 1, Mac 2, the Alienware PC, tablet and phone (`wiki/ai-team/computer-hub.md`)
│   ├─ Weekly scout — `integrations/scout/scout.py` → `docs/reports/SCOUT.md`: new repos, skills, MCP servers, upgrades, CLIs, free tools (Disruption Scout → Nadia grades → Elon gates → Steven approves)
│   ├─ Agent OS — `bin/brain os`: all 172 roster agents reachable via Laya lane, Jarvis recall and an Orca launch command (`wiki/ai-team/agent-os.md`)
│   ├─ Dispatch planner — `bin/brain route`: lead seat, cross-functional joins, ≤8-wide parallel waves, gates, HALTs (rules: `wiki/ai-team/cross-functional.md`)
│   ├─ Broker Command Center — realtor/broker OS (https://claude.ai/artifact/XFx2H7cf8mnS8e8hjFzxNg), connected 2026-10-22
│   ├─ The Bot Crew — 355 chat agents mirroring this chart: 13 executive/mentor cards, 21 named + desk seats, 8 pods and
│   │   15 workflows runnable, an org-chart panel, 20 live connectors behind approval cards (https://claude.ai/artifact/B8BPDvyE55p8hT7PTyKbjG; `wiki/ai-team/bot-crew.md`, 2026-10-22)
│   ├─ Travel Desk — Gondola MCP: points vs cash, trips, price watches; Marcus costs each trip; booking is Steven's (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
│   ├─ Meeting Scribe — Fieldy/Zoom recaps: decisions, action items → `vanessaQueue`; drafts only (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
│   └─ Juliet — Escalation & Service Recovery
├─ ISA / EA (human) — Mon–Fri 12–4 PM; the ISA Portal opens with "Today from Vanessa" (`isaToday`, copied from
│   `cosBrief.isaInstructions` by the daily cycle, weekdays 6:25 AM PT, since 2026-10-22)
│   (sends showing confirmations, chases escrow/lender items, enters each new deal's dates into the TC intake)
├─ Transaction & Showing desk — cloud routine, weekdays 6:05 AM PT (before the cycle), under Victor: the transaction coordinator
│   (timelines, checklists, deadline alerts, reminder drafts) and the showing assistant (prep, route, confirmation
│   drafts, feedback forms); Alexandra gates every draft; writes `tcDesk`
└─ Executives (report to Vanessa, ≤8 dispatched in parallel, formed into cross-functional squads by the daily cycle):
    ├─ Marcus (CFO) — Nathan, Bianca, Maya (four-county market & schools data, new 2026-10-22), Dov, Anita, Paloma, Grace, Alan, Hazel, Corinne + ruflo cost-analyst bench
    ├─ Sofia (CMO) — 14 named marketing reports + ruflo audio bench
    │   ├─ Sphere Nurture Coordinator — monthly past-client/sphere touch drafts, birthdays and anniversaries, with Wren; drafts only (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    ├─ Derek (CTO) — Sam, Naomi, Integration Engineer (owns OmniRoute failover + `claude-auto --keep-going`, and the browser tools: agent-browser, Playwright MCP) + 5 ECC officers + Ivan, Lena, Grace, Raj, Tomas, Owen (Broker Command Center Autopilot) and Rafael (Workflow Studio), both new 2026-10-22
    │   + code-validator (the code-validation gate, 2026-10-12: validate-code.sh + VibeBreaker 20-pass review of every code change — a different agent than the author)
    │   + code-review / build-fix / code-quality / infrastructure benches (56 agents)
    ├─ Alexandra (CCO) — Lucia, Bennett, Fern, Clay, Odette, Gus, Imani, Roland, Diane, Walter, Denise, Howard, Beatrice (DRE broker supervision) and Winston (C.A.R. forms + file QA), both new 2026-10-22
    ├─ Nadia (CAIO, proposal-only) — Leah, Disruption Scout (runs `integrations/scout/scout.py` weekly), Yuki, Hana, Felix, Nora, Ezra + research bench
    ├─ Victor (CRO) — Harrison, Gwen, Marguerite + 19 named reports + Carmen + the Transaction & Showing desk routine
    │   + Tax Assessor Agent and Loan Pricing Prep Agent (prep only; `wiki/mortgage-programs/loan-task-agents.md`)
    │   + Paula (probate/trust/distressed), Riley (professional alliances), Ingrid (Academy), Celeste (Coach HQ), Lenora (knowledge librarian) — new 2026-10-22, Broker Command Center
    │   ├─ Refi Watch Analyst — under Harrison: weekly rate-vs-note-rate prep list, "market average, not a quote" (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   ├─ Voicemail & Inbox Triage — ISA line: WhisperAI voicemails and Gmail triaged into `vanessaQueue`; fraud flags to Elena (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   ├─ Document Intake Clerk — under Carmen: contract and disclosure dates into `tcDeals`, missing-date flags (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   └─ Open House Captain — under Marguerite/Gwen: sign-in sheet → leads, thank-you drafts, ISA call list (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    ├─ Elena (CISO) — Omar, Renee, Ruth, Dev + ruflo security bench
    └─ Elon (CTO Innovator, proposal-only) — the AI Agent Engineering Team: stress-test, reliability,
       efficiency, capability, integration engineers + sandbox QA + chief automation strategist
```

## Standing pods — cross-functional teams that work in parallel (2026-10-22)

Steven: "ensure AI agents work cross-functional as teams and in parallel when needed." Eight standing pods sit across
the executive lines; `bin/brain route` wakes a whole pod in one parallel wave (≤8 seats) and Vanessa's daily cycle
forms its squads from them. Gates run after the wave: Alexandra on anything client-facing, ECC + the code validator
on any change, Vanessa last. Rules and wake words: `wiki/ai-team/cross-functional.md` § Pods.

| Pod | Seats (parallel) | Delivers |
|---|---|---|
| Deal Pod | Victor · Carmen · Showing Coordinator · Harrison · Document Intake Clerk · Alexandra | timelines, due-in-7, checklists, contract/disclosure dates into `tcDeals`, reminder drafts, loan milestones |
| Lead Pod | Victor · Gwen · Sofia · Voicemail & Inbox Triage · Alexandra | ISA call list, voicemail/inbox triage into `vanessaQueue`, follow-up and nurture drafts |
| Listing Pod | Marguerite · Sofia · Bianca · Alexandra | CMA prep, launch checklist, remarks, seller report |
| Mortgage Pod | Harrison · Denise · Howard · Walter · Lucia · Refi Watch Analyst · Alexandra | scenario prep, conditions, TRID clock, weekly refi watch list — never a quote |
| Growth Pod | Sofia · Victor · Marcus · Alexandra | content week, campaigns, cost/revenue read |
| Money Pod | Marcus · Nathan · Anita · James | numbers with sources, deadlines, commissions |
| Ops Pod | Derek · Elena · Elon · Nadia | fix plan, security check, feasibility, Steven's one paste |
| Client Care Pod | Sofia · Sphere Nurture Coordinator · Open House Captain · Wren · Victor · Alexandra | sphere touch drafts, open-house sign-in → leads, thank-you drafts, ISA call list, review/referral asks |

**One Vanessa, one queue (2026-10-22).** Every surface hands work to `vanessaQueue` on the Command Deck: deck buttons
("Hand to Vanessa" on kanban, lead and deal rows), Vanessa's own `queue_task` tool in chat, `/queue` in Claude Code,
the ISA Portal's "Hand to Vanessa" box (via its `vanessaOutbox`, moved in each morning) and the routines. The 6:25 AM
daily cycle works the queue first, marks each item done / needs-Steven with where the draft is, and folds the rest
into the ≤3 Needs-you items.

## What the desks run on (2026-10-22, evening)

| Desk seat | Routine / button | Reads | Writes | Steven's step |
|---|---|---|---|---|
| Refi Watch Analyst | Mon 7:20 AM PT `trig_014ipr6x9z35psmtHJCPVqj1`; `refi-watch` skill | `ratesSnapshot`, `refiWatchList` | `refiWatchDesk`, `vanessaQueue` | keeps the refi list (deck form, ISA Portal form, or "refi list: …" to Claude) |
| Sphere Nurture Coordinator | 11th 7:40 AM PT `trig_01Pn8xLNKTVVFYjYTj8d8JTd`; `past-client-nurture` | `sphereList`, housing feeds | `sphereTouches`, `marketingQueue`, `vanessaQueue` | approves the drafts; the ISA sends |
| Voicemail & Inbox Triage | deck "Triage my inbox" (Gmail as the viewer); `voicemail-to-lead` (WhisperAI) | Gmail, recording links | `inboxDesk`, `vanessaQueue`, Gmail drafts | clicks "Save draft in Gmail"; sends himself |
| Document Intake Clerk | `tc-doc-intake`; deck TC intake form | Drive / Gmail attachments | `tcDeals` | confirms dates the document does not state |
| Open House Captain | `open-house-follow-up`; Pabbly workflow 9 | sign-in export | `vanessaQueue`, Gmail drafts | approves thank-yous; the ISA calls |
| Travel Desk | Gondola MCP (`connect-all` 4b; claude.ai custom connector) | Gondola | trip options, price watches | books, pays, transfers points |
| Meeting Scribe | deck "Recap my meetings" (Fieldy + Zoom as the viewer); `meeting-recap-to-crm` | Fieldy, Zoom | `inboxDesk.meetings`, `vanessaQueue`, Gmail drafts | records with the pendant / Zoom AI Companion |

The ISA Portal carries the same two lists as intake forms (`listOutbox`); the 6:25 cycle moves pending rows to the
deck and marks them "moved". Inkbox (reconnected 2026-10-22) gives Vanessa an email address and an iMessage line;
the deck's "Text me this brief" sends the morning brief to Steven's own mobile only.

## Tools per seat (skills · plugins · connectors · routines · Mac tasks)

`wiki/ai-team/toolkit.md` is the register — regenerated by `bin/brain toolkit --write` (zero tokens) from
`.claude/skills`, `integrations/mods`, `integrations/CONNECTIONS.md`, `docs/inventory/cloud-routines*.md` and
`docs/inventory/mac-task-descriptions.md`. On 2026-10-20: 24 skills · 3 plugins · 15 connectors · 60 cloud routines ·
60 Mac tasks; Apex, James and Nadia have no tool of their own (they answer through Vanessa's recall). `bin/brain owner
"<panel>"` says who keeps a Command Deck panel alive and what stays Steven's. The 3D brain shows the same five as lobes.

## The named seats worth knowing by name

- **Harrison** — Elite Mortgage Broker, the senior mortgage authority across six standing lanes (VA purchase, VA IRRRL, conventional/high-balance, FHA, self-employed/non-QM, jumbo/portfolio). Preparation and analysis only — the licensed act stays Steven's.
- **Gwen** (Buyer's Agent) and **Marguerite** (Listing Agent) — prep Steven or the showing agent for the appointment itself; neither represents anyone directly. See `wiki/real-estate-playbooks/buyer-process.md` and `listing-process.md`.
- **Carmen** (CA Transaction Coordinator) and **Denise** (CA Loan Processor) / **Howard** (CA Underwriter) — run the operational file day to day on both sides of a deal; see `wiki/real-estate-playbooks/transaction-stages.md`.
- **Lucia** (Guideline & Program Eligibility) — the seat that separates agency rule from investor overlay; see `wiki/mortgage-programs/program-selection.md`.
- **Walter** (TRID Timeline Checker) — per-file LE/CD clocks; see `wiki/mortgage-programs/disclosure-timing.md`.
- **Rosa** (Military & Corporate Relocation) — see `wiki/real-estate-playbooks/military-relocation.md`.
- **Disruption Scout** (under Nadia) — runs the weekly internet scout (`integrations/scout/scout.py`): GitHub, the official MCP registry, npm, Hacker News and releases of tools already in the stack. Its shortlist feeds Nadia's weekly brief; Elon gates every ADOPT/PILOT; nothing installs without Steven. See `wiki/ai-team/tool-integration-status.md`.
- **Wren** / **Garrett** — referral reciprocity and LPT recruiting; see `wiki/real-estate-playbooks/referral-reciprocity.md`.
- **Desk seats (2026-10-22)** — Refi Watch Analyst, Sphere Nurture Coordinator, Voicemail & Inbox Triage, Document Intake Clerk, Open House Captain, Travel Desk, Meeting Scribe: Sonnet 5 report seats, drafts only; see `wiki/ai-team/desk-seats.md`.

## What "bench" means

A bench row (e.g. "ruflo · 21 employees" under Derek's engineering bench) stands for a group of specialized ruflo agents invoked **by name** when needed — it is not a headcount to add to named seats without noting which is which. The deck's own renderer counts named seats and bench-standing-for-agents separately rather than blending them into one impressive total; this wiki does the same and does not restate either number as a fact to maintain — read the live count off the deck's AI Team panel.

## How the seats work together

Every request runs the same pattern, and `bin/brain route "<request>"` prints it: Vanessa picks the **lead** (the seat
whose lane words match most), the **joins** come along by rule (client-facing → Alexandra; credentials/data → Elena;
automation → Derek; money → Marcus; loan mechanics → Harrison; transactions → Carmen; new tools → Elon), all of them run
**in parallel** (≤8 a wave, ≤4 web research), then the **gates** run in order — Alexandra's compliance review, the ECC
review of any change, and Vanessa last, consolidating one answer. A HALT word (send, quote, pay, delete, credential,
legal) lets the prep run but holds the final step for Steven. Rules: `wiki/ai-team/cross-functional.md`.

## What every seat can now do (2026-10-10)

Any seat can, through Vanessa: **find a skill** for the task (`find-skills`, `npx skills find`), **use a browser** to read
and fill websites (`agent-browser` from Claude Code, Playwright MCP from Claude Desktop), and have UI or copy reviewed
(`web-design-guidelines`, `writing-guidelines`). Examples: Victor reads a lead's public listing history; Gwen pulls
showing slots; Sofia checks a post's landing page; Derek dogfoods the Command Deck; Nadia tries a new tool's demo. Every
click that submits, sends, pays or signs stops for Steven. `bin/brain route` brings in Elena when a request touches a website.

## Added 2026-10-11

- **Trading Research Desk** (under Apex, paper mode only) — Idea, Builder, Backtester, Paper Trader and Memory agents plus a Risk Manager and a Regime Analyst; out-of-sample testing, fees and slippage, memory that never deletes a failure. `integrations/trading-desk/`.
- **Tax Assessor Agent** and **Loan Pricing Prep Agent** (under Victor/Harrison) — public county records and scenario worksheets; never a quote or an eligibility decision.
- **Reverse-engineering gate** (REA, under Elon with Elena and Alexandra) — owned or licensed software only.
- **Events scout** — weekly events and networking by city for the Travel tab; networking leads go to Victor as proposals. `wiki/events-networking/index.md`.
- **Computer Hub** and the **Alienware local-AI tier** (Laya, Bonsai 2 27B) — `wiki/ai-team/computer-hub.md`.
- **Third-party skill packs** — Sofia's content skills, `/watch`, vidIQ and more, installed by Steven on the Mac. `wiki/ai-team/third-party-packs.md`.

## Proposal-only seats

Nadia (CAIO) and Elon (CTO Innovator) never ship a change themselves — Nadia scans outward and writes the weekly Disruption Brief (replace/upgrade/adopt, graded ADOPT/PILOT/WATCH/IGNORE); Elon vets every item for feasibility, integration cost and security risk before it can enter the test queue. Both report to Steven, cc Vanessa. The LLM Council and the digital twin are proposal-only in the same sense — see `wiki/ai-team/tool-integration-status.md` for what that means for Orca, Laya, and 77skills specifically.

## See also

- `wiki/ai-team/model-tiering-dispatch.md` — which model each layer of this chart runs on, and the parallel-dispatch limits.
- `wiki/ai-team/tool-integration-status.md` — connector, skill, and proposed-tool status by seat.
- `wiki/ai-team/mentors-and-benches.md` — Maxwell, Apex, James, Kevin and what a "bench" actually is.
- `wiki/ai-team/bot-crew.md` — The Bot Crew: every seat above as a chat card, pods as runnable workflows.

Source: Command Deck, `ORG_CHART` / `AI_TEAM_ORG` data (AI Team panel), toolkit snapshot referenced 2026-09-16. Tree last updated 2026-10-09 (Laya, Brain loop, Google Drive mirror, Jarvis verify script; dispatch planner, keep-going failover and weekly scout added the same day; browser control + skill finder 2026-10-10; trading desk, loan-task agents, events scout, Computer Hub, third-party packs 2026-10-11; Broker Command Center seats, the ISA's "Today from Vanessa" list and the Transaction & Showing desk node 2026-10-22; seven desk seats and the Client Care Pod 2026-10-22; The Bot Crew surface under Vanessa 2026-10-22). `bin/brain orgcheck` proves every seat above resolves to a brain page.
