# AI Team org chart

The full seat map behind Vanessa: Steven at the top, then Steve (digital twin) / Vanessa (Chief of Staff) / the human ISA, then eight executives each with their own named reports and ruflo benches, then the mentor seats on call through Vanessa.

## The shape

```
Steven (Principal)
├─ Steve — digital twin, Tier-1 work
├─ Vanessa — Chief of Staff / COO / orchestrator, council chair
│   ├─ Jarvis — on-device voice + local index (verify: integrations/jarvis/jarvis-setup.sh; voice = Vanessa's recorded Magica set)
│   ├─ Laya — zero-token on-device first hop that routes every request (integrations/laya/)
│   ├─ Knowledge fabric — Second Brain · vault · Jarvis · Graphify · Ruflo, one recall (+ Notion record, Google Drive mirror read-only)
│   ├─ Brain loop — self-check that finds unanswered questions and drift (`bin/brain loop`)
│   └─ Juliet — Escalation & Service Recovery
├─ ISA / EA (human) — Mon–Fri 12–4 PM
└─ Executives (report to Vanessa, ≤8 dispatched in parallel):
    ├─ Marcus (CFO) — Nathan, Bianca, Dov, Anita, Paloma, Grace, Alan, Hazel, Corinne + ruflo cost-analyst bench
    ├─ Sofia (CMO) — 14 named marketing reports + ruflo audio bench
    ├─ Derek (CTO) — Sam, Naomi, Integration Engineer + 5 ECC officers + Ivan, Lena, Grace, Raj, Tomas
    │   + code-review / build-fix / code-quality / infrastructure benches (56 agents)
    ├─ Alexandra (CCO) — Lucia, Bennett, Fern, Clay, Odette, Gus, Imani, Roland, Diane, Walter, Denise, Howard
    ├─ Nadia (CAIO, proposal-only) — Leah, Disruption Scout, Yuki, Hana, Felix, Nora, Ezra + research bench
    ├─ Victor (CRO) — Harrison, Gwen, Marguerite + 19 named reports + Carmen
    ├─ Elena (CISO) — Omar, Renee, Ruth, Dev + ruflo security bench
    └─ Elon (CTO Innovator, proposal-only) — the AI Agent Engineering Team: stress-test, reliability,
       efficiency, capability, integration engineers + sandbox QA + chief automation strategist
```

## The named seats worth knowing by name

- **Harrison** — Elite Mortgage Broker, the senior mortgage authority across six standing lanes (VA purchase, VA IRRRL, conventional/high-balance, FHA, self-employed/non-QM, jumbo/portfolio). Preparation and analysis only — the licensed act stays Steven's.
- **Gwen** (Buyer's Agent) and **Marguerite** (Listing Agent) — prep Steven or the showing agent for the appointment itself; neither represents anyone directly. See `wiki/real-estate-playbooks/buyer-process.md` and `listing-process.md`.
- **Carmen** (CA Transaction Coordinator) and **Denise** (CA Loan Processor) / **Howard** (CA Underwriter) — run the operational file day to day on both sides of a deal; see `wiki/real-estate-playbooks/transaction-stages.md`.
- **Lucia** (Guideline & Program Eligibility) — the seat that separates agency rule from investor overlay; see `wiki/mortgage-programs/program-selection.md`.
- **Walter** (TRID Timeline Checker) — per-file LE/CD clocks; see `wiki/mortgage-programs/disclosure-timing.md`.
- **Rosa** (Military & Corporate Relocation) — see `wiki/real-estate-playbooks/military-relocation.md`.
- **Wren** / **Garrett** — referral reciprocity and LPT recruiting; see `wiki/real-estate-playbooks/referral-reciprocity.md`.

## What "bench" means

A bench row (e.g. "ruflo · 21 employees" under Derek's engineering bench) stands for a group of specialized ruflo agents invoked **by name** when needed — it is not a headcount to add to named seats without noting which is which. The deck's own renderer counts named seats and bench-standing-for-agents separately rather than blending them into one impressive total; this wiki does the same and does not restate either number as a fact to maintain — read the live count off the deck's AI Team panel.

## Proposal-only seats

Nadia (CAIO) and Elon (CTO Innovator) never ship a change themselves — Nadia scans outward and writes the weekly Disruption Brief (replace/upgrade/adopt, graded ADOPT/PILOT/WATCH/IGNORE); Elon vets every item for feasibility, integration cost and security risk before it can enter the test queue. Both report to Steven, cc Vanessa. The LLM Council and the digital twin are proposal-only in the same sense — see `wiki/ai-team/tool-integration-status.md` for what that means for Orca, Laya, and 77skills specifically.

## See also

- `wiki/ai-team/model-tiering-dispatch.md` — which model each layer of this chart runs on, and the parallel-dispatch limits.
- `wiki/ai-team/tool-integration-status.md` — connector, skill, and proposed-tool status by seat.
- `wiki/ai-team/mentors-and-benches.md` — Maxwell, Apex, James, Kevin and what a "bench" actually is.

Source: Command Deck, `ORG_CHART` / `AI_TEAM_ORG` data (AI Team panel), toolkit snapshot referenced 2026-09-16. Tree last updated 2026-10-09 (Laya, Brain loop, Google Drive mirror, Jarvis verify script). `bin/brain orgcheck` proves every seat above resolves to a brain page.
