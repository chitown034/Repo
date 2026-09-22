# Second Brain — L1 Router

Read this file in full. Read nothing else until the routing table sends you there.
This file routes; it holds no knowledge. Everything below is a rule, not a fact.

Principal: Steven Shearrill — Broker Associate (LPT Realty) · MLO, Patriot Pacific Financial
(NMLS 1921615) · retired Navy Chief. Bio in `context/about-me.md`.
On the Mac this router's job is done by the vanessa-orchestrator system prompt + roster-tiers.json.

## Routing table — load exactly ONE leaf, then answer

| Question class | Load | Never load for this |
|---|---|---|
| Who Steven is, licences, states, credentials | `context/about-me.md` | wiki, projects |
| "Why is it this way", a past call, a standing rule | `context/decisions.md` (find the dated entry, read that entry) | the whole file |
| Status of a named project | `projects/<name>.md` — command-deck, isa-portal, ai-team, nonprofit, usc-pjmt-530 | the deck HTML |
| Loan program, guideline, VA mechanics, eligibility | `wiki/mortgage-programs/index.md` → one named page | playbooks |
| Listing, buyer, transaction or showing process | `wiki/real-estate-playbooks/index.md` → one named page | mortgage wiki |
| Who on the AI team owns X, seat/model/trust level | `wiki/ai-team/index.md` | the 172-agent roster dump |
| A deck panel, DB doc, Mac task or cloud routine | `wiki/dashboard-ops/index.md` | always-on (unless it is a schedule question) |
| A specific client | `wiki/clients/<client>.md` — FULL CONTEXT, read whole | vector index, knowledge graph |
| A source document, playbook PDF, external system | `references/index.md` | anything else |
| Something learned in an earlier session | `memory.md` | wiki |
| A high-volume corpus (transcripts, disclosure libraries, rule sets) | `vector-index/README.md` | full-context docs |
| "How do these connect" — entities, relationships | `knowledge-graph/README.md` | vector index |
| What runs when, and whether it actually ran | `always-on/README.md` | projects |
| Reaching Steven, or running something live/remote | `REMOTE-ACCESS.md` | always-on |
| Cost or freshness of a recall | `recall-cache.md`, then `OPTIMIZATION.md` | — |
| A live number (rate, balance, lead count, health stat) | The Command Deck snapshot already in context, or the named DB doc | any wiki page |

If two rows could fit, take the one named first and say which file you used.
If nothing fits, say "not in the brain" and offer to queue research. Do not fill the gap from memory.

## Recall order — stop at the first level that answers

1. `recall_brain` + the live deck snapshot already loaded.
2. `memory.md` + the wiki **index line**. Open the page only if the index line is not enough.
3. `recall_research` / `request_research` — Perplexity, capped, async. Queued requests are answered by
   the `vanessa-research-queue` Mac task, hourly at :30, 7:30 AM–9:30 PM PT.
4. `jarvis_obsidian` — one store.
5. Five-store recall (Second Brain · vault · Jarvis · Graphify · Ruflo) — last resort; log why levels 1–4 failed.

Cache every answer as `{answer, storesHit, ts}`. TTL: 4 h volatile stores, 24 h vault/graph.
Never serve a cached answer past its TTL without saying its age. Rules: `recall-cache.md`.

## Token rules

- One leaf file per question. Come back to this router, not to the tree.
- Quote at most ~10 lines out of a full-context file; summarize the rest in your own words.
- Never paste a whole wiki page, roster or DB doc into an answer.
- Prefer the index line over the page, the page over the store, the store over a five-store sweep.
- Escalating a level costs roughly 5–10x the previous one. Say out loud when you escalate and why.
- State the age of every fact you report. "As of <the doc's own stamp>", never today's date by default.

## Model tiering (Steven's decision, 2026-09-22)

| Seat | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 masterminds |
| Executives (Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon) | Claude Opus 5 |
| Reports, benches, execution and report-only seats | Claude Sonnet 5 |
| Research heavy lifting | Perplexity (Composio `perplexityai`, or the local perplexity MCP) |

## Sub-agent dispatch

- Vanessa dispatches one sub-agent per agent. **≤8 in parallel. ≤4 Perplexity per wave.**
- A sub-agent that stalls: 2 retries → re-route to another seat → Needs-Steven packet. Never a third retry.
- Every sub-agent gets the router and its ONE leaf file — never the tree.
- Proposal-only seats (Nadia/CAIO, Elon/CTO Innovator, the council, the twin) return proposals, not changes.

## HALT — stop, write a Needs-Steven packet, do not proceed

- Anything irreversible, or anything that spends money.
- Anything needing a credential, an API permission or an account change (e.g. the Zoho API grant).
- Any licensed decision: rate quote, eligibility call, negotiation, signature, or a send to a client.
- Any legal or compliance interpretation (Alexandra drafts, Steven decides).
- Client PII leaving the local model, or entering the vector index or the knowledge graph.
- Editing a live system prompt, a live task, or a published artifact outside an assigned region.
- Writing to a client-facing system (CRM, calendar invite to a third party, email send).
- A store that is past TTL and cannot be refreshed — report the staleness instead of guessing.
