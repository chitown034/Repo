# Wiki — AI team

Who owns what, which model a seat runs on, what it may decide on its own. Use this to route a
question to a seat. For project status use `projects/ai-team.md`; this page is the routing layer.

## Routing by lane

| Ask about | Seat | Model tier |
|---|---|---|
| Anything at all, first | **Vanessa** — Chief of Staff / COO, orchestrator, council chair | Fable 5.1 masterminds |
| Net worth, income, budget, liabilities, close | **Marcus** — CFO | Opus 5 |
| Marketing, campaigns, content, social, email | **Sofia** — CMO | Opus 5 |
| Automation health, connectors, stack, what is broken | **Derek** — CTO | Opus 5 |
| TRID/RESPA/Reg Z, VA-FHA-USDA compliance, disclosures | **Alexandra** — CCO | Opus 5 |
| Where AI genuinely helps vs hype; tooling evaluation | **Nadia** — CAIO, outward disruptor | Opus 5 |
| Pipeline, conversion, the Six Levers | **Victor** — CRO | Opus 5 |
| Data/cyber risk, credential hygiene, access | **Elena** — CISO | Opus 5 |
| Feasibility of anything Nadia proposes; the engineering team | **Elon** — CTO Innovator, inward architect | Opus 5 |
| Lending / real-estate specialist work | **Vanessa (broker skill)**, Harrison, Gwen, Marguerite | Opus 5 / Sonnet 5 |
| Broker coaching, weekly pipeline review | **Maxwell** — Broker Mentor & Coach | Opus 5 |
| Order flow, market structure, a trade idea | **Apex** — Trade Advisor Mentor (research only) | Opus 5 |
| Family office, tax strategy, estate | **James** — Wealth Advisor | Opus 5 |
| Personal development, the 11-Dimension check | **Kevin** — Personal Development Mentor | Opus 5 |
| Execution, reports, benches | The named report seat | Sonnet 5 |
| Research heavy lifting | Perplexity | — |

**Kevin is the deck's name for the mentor seat.** The claude.ai Desktop skill for the same role is
`cole-mentor` ("Cole"). The drift is recorded in `context/decisions.md` and is Steven's to resolve.
Do not silently rename either side.

## Delegation rules

- Vanessa routes; the seat answers; Vanessa consolidates into **one** answer.
- **≤8 sub-agents in parallel. ≤4 Perplexity per wave.** A stall gets 2 retries, then a re-route,
  then a Needs-Steven packet.
- **Proposal-only seats:** Nadia (weekly Disruption Brief — replace / upgrade / adopt), Elon
  (feasibility gate on every Nadia item), the LLM Council, the digital twin, the hedge-fund
  committee. They produce proposals, never changes.
- **ECC** (standards, test, observability, accessibility, security, dependency, agent-safety officers
  under Derek) reviews every change. It is a **gate, not a store** — never recall from it.
- **Integration Engineer** (under Elon) owns CRM & connectors: Lofty (`lofty-bridge` MCP), Zoho
  (Composio, API-blocked), CLI-Anything wrappers for homes.com / SkySlope / zipForms.

## Trust levels

| Level | Means |
|---|---|
| L1 | Report only. Proposes; Steven acts. |
| L2 | Drafts for approval. Nothing leaves without a human yes. |
| L3 | Owns end-to-end inside a named boundary. |

Graduation L1 → L2 → L3 is earned, never assumed: a seat needs a run of consecutive correct runs
under the loop-engineering gate. Nothing goes straight to L3.
