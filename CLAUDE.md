# Second Brain — L1 Router

Read this file in full. Read nothing else until the routing table sends you there.
This file routes; it holds no knowledge. Everything below is a rule, not a fact.

**Index first, files second.** Before opening any leaf, run `bin/brain recall "<question>"` — plain
code, no model call, returns one section (~200 tokens) or "not in the brain". Open the routed leaf only
if that is not enough. Every file has one line in `INDEX.md`. Save a durable fact with
`bin/brain remember "<fact>"` — it writes the memory and its index line in one step.

Principal: Steven Shearrill — Broker Associate (LPT Realty) · MLO, Patriot Pacific Financial
(NMLS 1921615) · retired Navy Chief. Bio in `context/about-me.md`.
On the Mac this router's job is done by the vanessa-orchestrator system prompt + roster-tiers.json.

## Routing table — load exactly ONE leaf, then answer

| Question class | Load | Never load for this |
|---|---|---|
| Any request, first — if `integrations/laya/` is installed and running | Laya's zero-token local classifier picks the row below by itself; confident → jump straight there. Below its own confidence threshold → continue down this table normally, top to bottom | Trusting Laya's guess below its own confidence threshold; skipping the HALT list because Laya routed the request |
| Who Steven is, licences, states, credentials | `context/about-me.md` | wiki, projects |
| "Why is it this way", a past call, a standing rule | `context/decisions.md` (find the dated entry, read that entry) | the whole file |
| Status of a named project | `projects/<name>.md` — command-deck, isa-portal, ai-team, nonprofit, usc-pjmt-530 | the deck HTML |
| Loan program, guideline, VA mechanics, eligibility | `wiki/mortgage-programs/index.md` → one named page | playbooks |
| Listing, buyer, transaction or showing process | `wiki/real-estate-playbooks/index.md` → one named page | mortgage wiki |
| "What should I do today", the big moves, a recommendation and its plan | `docs/reports/BIG-MOVES.md` (today's top 10, scored; `bin/brain recs`) → approve or decline on the 6D Brain or the deck | the whole findings tree |
| Marketing: drip campaigns, text follow-ups, being found by AI search / SEO | `wiki/real-estate-playbooks/index.md` → `wiki/real-estate-playbooks/drip-and-text-follow-up.md` or `wiki/real-estate-playbooks/ai-search-visibility.md` | mortgage wiki, the deck |
| Who on the AI team owns X, seat/model/trust level | `wiki/ai-team/index.md` | the 172-agent roster dump |
| Which layer holds what, how it syncs, is the brain "even" | `wiki/ai-team/second-brain-layers.md` → `bin/brain layers` | the stores themselves |
| "Open X" — the link to a dashboard, Drive, NotebookLM, Notion, the repo | `bin/brain links` (zero tokens; the 6D page shows the same list) | any wiki page |
| A deck panel, DB doc, Mac task or cloud routine | `wiki/dashboard-ops/index.md` | always-on (unless it is a schedule question) |
| A specific client | `wiki/clients/<client>.md` — FULL CONTEXT, read whole | vector index, knowledge graph |
| A source document, playbook PDF, external system | `references/index.md` | anything else |
| Something learned in an earlier session | `memory.md` | wiki |
| What was said, decided or promised in a recorded meeting | `memory/fieldy-meetings.md` (daily digest from Fieldy; first names only) → the Fieldy connector for the full recap | transcripts into the wiki |
| "What did I ask Claude about X", which session/chat did something | `docs/inventory/claude-sessions.md` (Claude Code sessions, daily) · `memory/claude-chats.md` (claude.ai chats, from his export) | transcripts |
| A high-volume corpus (transcripts, disclosure libraries, rule sets) | `vector-index/README.md` | full-context docs |
| "How do these connect" — entities, relationships | `knowledge-graph/README.md` | vector index |
| What runs when, and whether it actually ran | `always-on/README.md` | projects |
| Reaching Steven, or running something live/remote | `REMOTE-ACCESS.md` | always-on |
| Setting up or syncing the brain on a Mac | `docs/SECOND-MAC-SETUP.md` (§ 6c) → `scripts/brain-sync.sh` | always-on |
| Cost or freshness of a recall | `recall-cache.md`, then `OPTIMIZATION.md` | — |
| The repo and the Mac are unreachable, or a source-grounded research brief | NotebookLM mirror — `integrations/notebooklm/README.md` (the matching `SB` Doc, or the "Second Brain" notebook) | anything else as a first stop |
| A live number (rate, balance, lead count, health stat) | The Command Deck snapshot already in context, or the named DB doc | any wiki page |

If two rows could fit, take the one named first and say which file you used.
If nothing fits, say "not in the brain" and offer to queue research. Do not fill the gap from memory.

## Recall order — stop at the first level that answers

0. `integrations/laya/` — a zero-token, on-device first hop, if installed. Confident → route straight to
   the leaf/lane/tier it names. Below its own confidence threshold → say ESCALATE and fall through to
   level 1. Never a licensed decision, never past its own confidence — the levels below run unchanged
   for anything it escalates. Spec and proof: `integrations/laya/README.md`.
1. `bin/brain recall` (Claude Code / Codex) · `recall_brain` + the live deck snapshot (dashboard chat).
2. `memory.md` + the wiki **index line**. Open the page only if the index line is not enough.
3. `recall_research` / `request_research` — Claude web research (Sonnet 5 with WebSearch/WebFetch on
   Steven's Claude subscription; Perplexity removed 2026-10-05), capped, async. Queued requests are
   answered by the `vanessa-research-queue` Mac task, hourly at :30, 7:30 AM–9:30 PM PT.
4. NotebookLM mirror — the brain as 13 Google Docs in Drive `SECOND BRAIN/` (rewritten weekly, `integrations/notebooklm/README.md`).
   Redundancy, not a first stop: read the matching Doc when the repo, the Mac and the deck are all unreachable, or ask the
   "Second Brain" notebook for a source-grounded brief. Say "from the NotebookLM mirror, as of <its 00-START-HERE date>".
5. `jarvis_obsidian` — one store.
6. Five-store recall (Second Brain · vault · Jarvis · Graphify · Ruflo) — last resort; log why levels 1–4 failed.

Cache every answer as `{answer, storesHit, ts}`. TTL: 4 h volatile stores, 24 h vault/graph.
Never serve a cached answer past its TTL without saying its age. Rules: `recall-cache.md`.

## Token rules

- One leaf file per question. Come back to this router, not to the tree.
- Quote at most ~10 lines out of a full-context file; summarize the rest in your own words.
- Never paste a whole wiki page, roster or DB doc into an answer.
- Prefer the index line over the page, the page over the store, the store over a five-store sweep.
- Escalating a level costs roughly 5–10x the previous one. Say out loud when you escalate and why.
- State the age of every fact you report. "As of <the doc's own stamp>", never today's date by default.

## Model tiering (Steven's decisions, 2026-09-22; executives to Opus 5.5 on 2026-09-28; research to Claude on 2026-10-05)

| Seat | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 masterminds |
| Executives (Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon) | Claude Opus 5.5 |
| Reports, benches, execution and report-only seats | Claude Sonnet 5 |
| Research heavy lifting | Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's Claude subscription (Perplexity removed 2026-10-05) |
| Local tier — client-data (PII-gated) requests only, never a cloud fallback | Bonsai 27B via OmniRoute's `local` combo, on the Mac only — off until proven there (`integrations/omniroute/README.md`) |

## Sub-agent dispatch

- Vanessa dispatches one sub-agent per agent. **≤8 in parallel. ≤4 web-research sub-agents per wave.**
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
