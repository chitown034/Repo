# Model tiering and dispatch

Which model each seat runs on, and the rules that bound how many run at once — Steven's decision, recorded 2026-09-22.

## The tiering

| Seat | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 masterminds |
| Executives (Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon) | Claude Opus 5.5 (since 2026-09-28) |
| Reports, benches, execution and report-only seats | Claude Sonnet 5 |
| Research heavy lifting | Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's subscription (Perplexity removed 2026-10-05) |

The deck's own toolkit snapshot (2026-09-16) shows this roughly reflected in the live agent roster: 1 agent on Fable 5.1 (Vanessa), 93 on Opus 5 (the executives have since moved to Opus 5.5), 78 on Sonnet 5. Model tiering is **decided and recorded** but, as of the same snapshot, **not yet enforced by tooling** — a seat's actual runtime model can drift from this table until that enforcement is built. Check the live roster before assuming a seat is on the model this table says it should be.

## Dispatch rules

- Vanessa dispatches **one sub-agent per agent**. **≤8 in parallel. ≤4 web-research sub-agents per wave.**
- A sub-agent that stalls gets **2 retries**, then a **re-route** to another seat, then a **Needs-Steven packet**. Never a third retry.
- Every sub-agent gets the router (`CLAUDE.md`) and its **one** leaf file — never the whole wiki tree, and never the 172-agent roster dump.
- Vanessa routes; the seat answers; Vanessa consolidates into **one** answer back to Steven.

## Proposal-only seats

Nadia (CAIO), Elon (CTO Innovator), the LLM Council, the digital twin (Steve), and the hedge-fund committee are **proposal-only** by design: they return proposals, recommendations, or drafts — never a live change to a system, a send to a client, or a spend. This is a dispatch-level rule, not a per-request judgment call — treat any output from these seats as something that still needs Steven's yes.

## The engineering gate — ECC

**ECC** (standards, test, observability, accessibility, security, and dependency officers, plus the agent-safety officer, all under Derek/Nadia's reporting lines) reviews every change before it ships. It is explicitly a **gate, not a store** — never recall an answer from ECC the way you would from a wiki page or a knowledge store; it only ever returns BLOCK / FIX / NOTE against a specific proposed change, with the rule cited.

## Trust levels

| Level | Means |
|---|---|
| L1 | Report only. Proposes; Steven acts. |
| L2 | Drafts for approval. Nothing leaves without a human yes. |
| L3 | Owns end-to-end inside a named boundary. |

Graduation L1 → L2 → L3 is earned through a run of consecutive correct runs under the loop-engineering gate — nothing goes straight to L3, and no seat grants itself a graduation.

## See also

- `wiki/ai-team/org-chart.md` — the full seat map this tiering applies to.
- `wiki/ai-team/tool-integration-status.md` — connector and tool status per seat.
- `CLAUDE.md` — the HALT list (irreversible actions, money, credentials, licensed decisions) that bounds every seat regardless of trust level.

Source: Command Deck, model-tiering table and dispatch rules (AI Team panel); `context/decisions.md`, 2026-09-22 entry.
