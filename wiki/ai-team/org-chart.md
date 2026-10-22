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
│   └─ Juliet — Escalation & Service Recovery
├─ ISA / EA (human) — Mon–Fri 12–4 PM; the ISA Portal opens with "Today from Vanessa" (`isaToday`, copied from
│   `cosBrief.isaInstructions` by the daily cycle, weekdays 6:25 AM PT, since 2026-10-22)
│   (sends showing confirmations, chases escrow/lender items, enters each new deal's dates into the TC intake)
├─ Transaction & Showing desk — cloud routine, weekdays 7:10 AM PT, under Victor: the transaction coordinator
│   (timelines, checklists, deadline alerts, reminder drafts) and the showing assistant (prep, route, confirmation
│   drafts, feedback forms); Alexandra gates every draft; writes `tcDesk`
└─ Executives (report to Vanessa, ≤8 dispatched in parallel, formed into cross-functional squads by the daily cycle):
    ├─ Marcus (CFO) — Nathan, Bianca, Maya (four-county market & schools data, new 2026-10-22), Dov, Anita, Paloma, Grace, Alan, Hazel, Corinne + ruflo cost-analyst bench
    ├─ Sofia (CMO) — 14 named marketing reports + ruflo audio bench
    ├─ Derek (CTO) — Sam, Naomi, Integration Engineer (owns OmniRoute failover + `claude-auto --keep-going`, and the browser tools: agent-browser, Playwright MCP) + 5 ECC officers + Ivan, Lena, Grace, Raj, Tomas, Owen (Broker Command Center Autopilot) and Rafael (Workflow Studio), both new 2026-10-22
    │   + code-validator (the code-validation gate, 2026-10-12: validate-code.sh + VibeBreaker 20-pass review of every code change — a different agent than the author)
    │   + code-review / build-fix / code-quality / infrastructure benches (56 agents)
    ├─ Alexandra (CCO) — Lucia, Bennett, Fern, Clay, Odette, Gus, Imani, Roland, Diane, Walter, Denise, Howard, Beatrice (DRE broker supervision) and Winston (C.A.R. forms + file QA), both new 2026-10-22
    ├─ Nadia (CAIO, proposal-only) — Leah, Disruption Scout (runs `integrations/scout/scout.py` weekly), Yuki, Hana, Felix, Nora, Ezra + research bench
    ├─ Victor (CRO) — Harrison, Gwen, Marguerite + 19 named reports + Carmen + the Transaction & Showing desk routine
    │   + Tax Assessor Agent and Loan Pricing Prep Agent (prep only; `wiki/mortgage-programs/loan-task-agents.md`)
    │   + Paula (probate/trust/distressed), Riley (professional alliances), Ingrid (Academy), Celeste (Coach HQ), Lenora (knowledge librarian) — new 2026-10-22, Broker Command Center
    ├─ Elena (CISO) — Omar, Renee, Ruth, Dev + ruflo security bench
    └─ Elon (CTO Innovator, proposal-only) — the AI Agent Engineering Team: stress-test, reliability,
       efficiency, capability, integration engineers + sandbox QA + chief automation strategist
```

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

Source: Command Deck, `ORG_CHART` / `AI_TEAM_ORG` data (AI Team panel), toolkit snapshot referenced 2026-09-16. Tree last updated 2026-10-09 (Laya, Brain loop, Google Drive mirror, Jarvis verify script; dispatch planner, keep-going failover and weekly scout added the same day; browser control + skill finder 2026-10-10; trading desk, loan-task agents, events scout, Computer Hub, third-party packs 2026-10-11; Broker Command Center seats, the ISA's "Today from Vanessa" list and the Transaction & Showing desk node 2026-10-22). `bin/brain orgcheck` proves every seat above resolves to a brain page.
