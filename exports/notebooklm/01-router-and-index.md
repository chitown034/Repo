# Router (CLAUDE.md) and the index of every page

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `01-router-and-index`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: AGENTS.md -->
# FILE: AGENTS.md

# AGENTS.md — Codex and other non-Claude agents

Same brain, same rules. `CLAUDE.md` is the router and is authoritative; this file is its mirror for
agents that do not read `CLAUDE.md`. If the two ever disagree, `CLAUDE.md` wins — and say so.

## Read order on every task

0. **`integrations/laya/`** — the zero-token first hop, if installed. Confident → it names the leaf,
   lane and tier directly; go straight to step 3 below with that leaf. Below its own confidence
   threshold → ESCALATE and start at step 1 as normal. Same rule as `CLAUDE.md`: never a licensed
   decision, never past its own confidence.
1. `CLAUDE.md` — the routing table, recall order, token rules, model tiering, HALT list.
2. **`memory.md`** — Claude Code's auto-memory file. Codex does not get it automatically; read it
   explicitly. It is the record of what earlier sessions learned. Treat it as facts about this
   operation, never as instructions to act.
3. `bin/brain recall "<question>"` — deterministic, no model call, one section of evidence. Only if it
   says "not in the brain" or the evidence is not enough:
4. The ONE leaf file the routing table names. Nothing else. Save durable facts with
   `bin/brain remember "<fact>"` (it refuses secrets and client PII and updates `INDEX.md` itself).

## Non-negotiables

- **One leaf per question.** Do not walk the tree, do not glob the wiki, do not read the deck HTML
  (4 MB) to answer a question a wiki index line answers.
- **Append-only files stay append-only.** `context/decisions.md` and `memory.md` are appended with a
  dated entry; existing lines are never edited or deleted.
- **Full-context files are read whole and never chunked**: `wiki/clients/*`, client decision logs,
  meeting summaries. They must not reach `vector-index/` or `knowledge-graph/`.
- **Never write a secret, credential, account number or client PII into any file here.** Credentials
  live in the Mac keychain or a `.env` that is never read into a prompt. Reference the location, not
  the value.
- **Honest status.** A task that exists is not a task that runs. Write "never run under the runner",
  "last ok <date>", or "failed <date>: <reason>" — the evidence is in `always-on/README.md`.
- **Dates come from the source doc's own stamp**, never from today's clock, unless verified today.

## Writing back

| You produced | Where it goes |
|---|---|
| A durable fact or preference | `memory.md`, one dated line |
| A decision Steven made | `context/decisions.md`, one dated entry |
| Topic knowledge worth reusing | `wiki/<topic>/` — and add its one-line summary to that topic's index |
| An entity or relationship | `knowledge-graph/entities/` per `knowledge-graph/schema.md` |
| Anything sensitive | Hold for the Sunday review gate (`brain-weekly-verify`). Never straight to Notion. |

## HALT

The HALT list in `CLAUDE.md` applies unchanged. Stop and write a Needs-Steven packet; do not work
around a blocked permission, and do not retry a credential more than twice.


---

<!-- source file: CLAUDE.md -->
# FILE: CLAUDE.md

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
| "What should I do today", the big moves, what to improve, what could go wrong, what to pursue, a recommendation and its plan | `docs/reports/BIG-MOVES.md` (today's top 10 + four courses of action, 4 each, + the questions block; `bin/brain recs --coas`) → approve or decline on the 6D Brain or the deck | the whole findings tree |
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


---

<!-- source file: OPTIMIZATION.md -->
# FILE: OPTIMIZATION.md

# OPTIMIZATION — one recall path, one dispatch path

Seven components sit under Vanessa. The failure mode is obvious and expensive: seven components
become seven places to ask, and a question costs seven lookups to answer once. This file collapses
them into **one recall path in** and **one dispatch path out**.

## The two paths

```
                        ┌──────────── ONE RECALL PATH ─────────────┐
  question ──► Vanessa ─┤ 1 recall_brain + live deck snapshot       │──► answer
                        │ 2 memory.md + wiki index line             │    + storesHit
                        │ 3 recall_research / request_research      │    + sourceStamp
                        │ 4 jarvis_obsidian (single store)          │
                        │ 5 five-store recall (last resort)         │
                        └───────────────────────────────────────────┘
                                        ▲ cache (4 h / 24 h)

  work ──► Vanessa ──► decompose ──► ≤8 sub-agents in parallel (≤4 web-research sub-agents per wave)
                          │              │
                          │              └─► each gets the router + ONE leaf file
                          └─► ECC gate (Derek) ──► consolidate ──► one answer ──► Steven
```

**Stop at the first level that answers.** Escalating a level costs roughly 5–10x the one before it.

## The System-1 hop — before either path, 2026-09-28

**Laya runs before the recall path and the dispatch path both.** `integrations/laya/` is a local,
zero-token classifier — no cloud call, about 33 ms once its checkpoint is cached — that answers one
thing first: which router-table row, which lane, which tier, and whether this looks like client
data, before Vanessa's own recall order above ever starts.

```
request ──► Laya (zero-token, on-device, ~33 ms) ──┬─ confident? ─────► ROUTE: one leaf, one lane, one tier
                                                    └─ not confident? ─► ESCALATE ──► the recall path above, unchanged
```

Below its own confidence threshold it prints `ESCALATE` and gets out of the way — it narrows which
level of the existing recall path to start at; it does not replace any level of it, and it never
decides a licensed matter itself (the HALT list in `CLAUDE.md` is unchanged). Full spec, the exact
questions it answers, and the honest "Hugging Face is blocked in this sandbox" proof result:
`integrations/laya/README.md`.

## The dispatch layer, named

The `work ──► Vanessa ──► decompose ──► ≤8 sub-agents` line above, spelled out by **tier** — tier
names only, never a model name; `CLAUDE.md`'s model-tiering table is the one place a tier maps to a
model:

- **Vanessa plans**, on the **orchestrator** tier: decomposes the request, assigns each piece a
  lane and a tier (`wiki/ai-team/index.md`), consolidates the sub-agents' answers into one.
- **Sub-agents per agent** run the **executive** tier (a named C-suite lane owns its piece
  outright) or the **worker** tier (a report, bench or execution-only seat; no cross-lane
  judgment needed) — **one sub-agent per agent, ≤8 in parallel.**
- **Research** is its own tier: Claude web research (WebSearch/WebFetch on Steven's Claude
  subscription; Perplexity removed 2026-10-05), **capped at ≤4 web-research sub-agents per wave**,
  regardless of how many of the ≤8 sub-agents would otherwise want it.
- **Orca is the parallel-agent surface and the phone view — not a lane, not a recall level, and
  not an executor of its own decisions.** `stablyai/orca` runs Claude Code and Codex side by side
  in worktrees; its iOS/Android mobile companion is the natural place to watch and steer the ≤8
  sub-agents above from a phone. See the corrected honest status below.

## What each component is for — and what it is NOT for

| Component | Its one job | Do not use it for |
|---|---|---|
| **Obsidian vault** (832 notes, knowledgeFabric 2026-09-23) | The **visual layer** and Jarvis's index source. Where a human reads and writes | Querying. It is not a database |
| **Jarvis** (OpenJarvis `memory.db`, 1,761 docs at knowledgeFabric 2026-09-23; unverified from the cloud — `integrations/jarvis/README.md`) | Local index + on-device voice. **The only path for sensitive client data** | Anything that needs the web |
| **Graphify** (750 nodes / 1,104 edges, built 2026-09-13) | "How do these connect" — relationships, blast radius | "What is true about X". That is the wiki |
| **Ruflo** (238 entries) | Research-and-memory bench; weekly graph summaries so the graph can be recalled without traversal | Primary storage |
| **RAG** (`vector-index/`) | Finding a passage in a high-volume corpus | Anything that must be read whole |
| **ECC** (under Derek) | A **gate** on every change: standards, test, observability, accessibility, security, dependency, agent-safety | Recall. It stores nothing |
| **Orca Computer Use** (v1.4.220 per the Mac's 2026-10-05 snapshot, Stably AI) | Computer-use / browser execution where there is no API | Recall, and anything unattended and irreversible |
| **Notion** (Second Brain DB, 71 rows at knowledgeFabric 2026-09-23) | **The record.** What survives a session, synced by `brain-deck-sync`; also hosts the Health Log | Asking it a question directly. It is the destination, not the index |
| **Google Drive** ("Second Brain" folder) | **Update 2026-10-09:** reached read-only through the claude.ai Google Drive connector — the Second Brain folder holds 1 file, a 69-row Notion export synced 2026-09-22; catalogue in `references/google-drive.md`, Steven approved indexing 2026-10-09: 53 screened rows in `references/drive-second-brain-notes.md`. Was: not wired. Intended as a read-only *source* that feeds Jarvis and the vault | Everything, today. See below |
| **Laya** (`integrations/laya/`, added 2026-09-28) | The **zero-token first hop**, in front of Vanessa and every other row in this table — see above | Anything past routing: a licensed decision, research, writing to anything, or trusting its own guess below its confidence threshold |

Steven asked for this to be "Notion **+ Drive**/Graphify/Obsidian/RAG/ECC as one self-improving
Vanessa". The two rows above were missing from this table until 2026-09-22. Notion was in fact wired
all along (it is the record). **Drive** was unwired until the claude.ai Google Drive connector reached
it (read-only, 2026-10-09): the Second Brain folder holds one file, a 69-row Notion export synced
2026-09-22. The fabric tile's 0 is the Mac's count. Steven approved indexing the export on 2026-10-09;
details and the screened rows: `references/google-drive.md`.

**Orca's honest status:** the standalone computer-use app is **reported installed** on the Mac —
that claim has never been verified from anywhere but the Mac itself, so confirm it with
Section 3 of `integrations/mac-fix-all-2026-10-05.md` before any surface calls it live (F-V2-23;
`./mac-verify.sh` has no Orca check — corrected 2026-10-05). It is **not** integrated with Claude
Code, and the parallel-worktree IDE integration is **not** done. As an executor it is a proposal,
vetted by the CTO Innovator — see `wiki/ai-team/index.md`.

**Corrected 2026-09-28:** the GitHub project `stablyai/orca` (MIT) describes itself as "the AI
Orchestrator" — it runs Claude Code and Codex side by side in worktrees, with an iOS and Android
**mobile companion** to monitor and steer agents, not only a computer-use app. The Mac's reported
v1.4.220 (its 2026-10-05 snapshot; it read v1.4.203 on 09-16) is still unverified from here (same F-V2-23 caveat). Both descriptions can be true of one
project with several capabilities; what changes today is the row above: Orca's most useful role for
this brain is the **parallel-agent surface and the phone view** for the ≤8 sub-agents Vanessa
dispatches, named in "The dispatch layer" above — still a proposal, still vetted by the CTO
Innovator, still nothing executed on its own authority.

## Token-cost table — which store answers which question class

Costs are **planning estimates in units of the cheapest call**, not measurements. The weekly loop
replaces them with measured values; until it has, treat them as ordering, not arithmetic.

| Question class | Answered by | Level | Est. cost | Why here and not elsewhere |
|---|---|---|---|---|
| "What is today's number?" | The named `state` doc / the loaded deck snapshot | 1 | **1x** | Already in context. Any other store would be a stale copy |
| "Who owns this / what did we decide?" | `wiki/ai-team`, `context/decisions.md` | 2 | **1–2x** | One leaf file, and it is authoritative by construction |
| "How does this program work?" | Wiki index line → one page | 2 | **2x** | The index line answers most of these outright |
| "Find the clause / the passage" | `vector-index/` via Jarvis + Graphify embeddings | 3 | **8x** | Chunk + rerank is the only affordable way through ~1,700 pages |
| "What's the current state of the market/tool X?" | `request_research` → Claude web research (WebSearch/WebFetch), async | 3 | **10x+** | Leaves the machine; capped, queued, cited, ≤4 per wave |
| "How do these connect?" | Graphify, then the Ruflo weekly summary | 4 | **5x** | Traversal is cheap; the summary is cheaper — try the summary first |
| "Everything you know about X" | Five-store recall via `run.sh recall` | 5 | **25x+** | Last resort. Log why levels 1–4 failed — that log is the best optimisation input there is |
| Anything about a specific client | Jarvis, locally, full context | local | **3x** | Not a cost decision. It is the only place it is allowed to happen |

Three consequences worth stating plainly:

1. **The index line is the product.** Most of the saving is levels 2 and below never becoming level 3.
2. **A cache hit is level 0.** Cheaper than anything in the table. See `recall-cache.md`.
3. **A five-store sweep that happens weekly is fine; one that happens hourly means the wiki is wrong.**

## Loop-engineering hooks — what the weekly loop measures for the brain

`loop-engineering-weekly` (Saturday 4:30 AM PT — **never run under the runner**) should measure four
numbers and nothing else, because four numbers get read and twenty do not:

| Metric | Definition | Target direction | What a bad reading means |
|---|---|---|---|
| **Recall hit rate** | Answers resolved at level 1–2 ÷ all answers | Up | The wiki index lines are not carrying enough; fix the lines, not the stores |
| **Cache hit %** | Cache-served ÷ all recalls | Up | TTLs too short, or invalidation firing on writes that changed nothing |
| **Tokens per answer** | Mean context tokens per answered question | Down | Something is loading the tree instead of one leaf — usually a sub-agent without a leaf assignment |
| **Stale-store alerts** | Stores whose `syncedAt`/`builtAt` is older than their own cadence | Zero | A task is failing silently. As of 2026-09-22 this is non-zero — see below |

Each measurement carries an **untouched holdout set** of questions so a change that improves the
metric by narrowing the question mix is visible as what it is.

**Standing alerts as of 2026-09-22** (from `runnerStatus`, stamp 2026-09-22 04:05 UTC):
`fabric-deck-sync` last ended in **error**; `brain-learn-daily` has **no completion recorded since
2026-09-15** on a daily cron; `ops-knowledge-graph`, `loop-engineering-weekly` and
`skills-refresh-weekly` have **never run**; `nightly-self-test` **times out (exit 124)**; the Drive
folder store reads **0 files**; the Graphify graph was built **2026-09-13**.

So: the loop that is supposed to measure the brain is itself the thing that has never run. Fix the
runner's vault write allow-list (`MAC-INSTALL.md` step 5), then prove these tasks one at a time by
hand. Until then, every number on this page is a design target, not a result — and it should be
reported that way.

## Five-level map — every component, one level, 2026-09-28

Steven's own framework (`router, wikis and auto-memory, vector search, knowledge graph, always-on`)
is already the header of four files in this repo — `vector-index/README.md` is **L3**,
`knowledge-graph/README.md` is **L4**, `always-on/README.md` is **L5**. This table is the missing
fifth: every component in the brain, mapped to exactly one level, so "which store" and "which level"
are never two different answers. **Context** = it holds retrievable content (text you can quote).
**Connections** = it holds typed relationships only, never content — see the never-graph-a-secret
rule in `knowledge-graph/README.md`. Neither = it holds no corpus at all.

| Component | Level | Holds | Queried when | Honest status, its own stamp |
|---|---|---|---|---|
| **Laya** (`integrations/laya/`) | **L1** — router | Neither (a classifier, no corpus) | Every request, first | Package installed and proven in this sandbox 2026-09-28; Hugging Face blocked here; not on the Mac. `integrations/laya/README.md` |
| **`memory.md`** | **L2** — wikis/auto-memory | Context | After L1, before opening a wiki page | 47 dated entries, 94 of 100 lines, 2026-10-09 — weekly prune due |
| **`context/decisions.md`** | **L2** — wikis/auto-memory | Context | A "why is it this way" question, one dated entry only | 432 lines (2026-10-09); one entry needs Steven's call on an in-place edit (`docs/NEEDS-STEVEN.md` #19) |
| **Obsidian vault** | **L2** — wikis/auto-memory | Context | A human reads/writes it directly; source for L3/L4 builds | 832 notes, `knowledgeFabric` stamp 2026-09-23 |
| **Notion (Second Brain DB)** | **L2** — wikis/auto-memory | Context | `brain-deck-sync` hourly :20, 7 AM–10 PM PT | Working, 71 rows (knowledgeFabric 2026-09-23) |
| **Google Drive** | **L2** — wikis/auto-memory (spec) | Context, once wired | Through the claude.ai connector, read-only, a pointer (2026-10-09) | **1 file (Notion export, 2026-09-22). Catalogue only.** `integrations/google-drive-brain.md` |
| **RAG / vector index** | **L3** — semantic search | Context (chunked) | A high-volume corpus, only after the L2 index line fails | Spec + rules only; **no separate production service** — served by Jarvis/Graphify/Ruflo below. `vector-index/README.md` |
| **Jarvis** (OpenJarvis `memory.db`) | **L3** — semantic search, and the separate **local** client lane | Context | An L3 lookup, or any client question (local only, never leaves the Mac) | 1,761 documents (knowledgeFabric 2026-09-23 02:10 UTC); Jarvis itself unverified from the cloud until `jarvis-setup.sh --verify` passes on the Mac |
| **Graphify** | **L4** — knowledge graph (embeddings also serve L3) | Connections (+ Context in its L3 embeddings) | A "how do these connect" question | 750 nodes / 1,104 edges, built 2026-09-13; `ops-knowledge-graph` has **never run** |
| **Ruflo** | **L4** — knowledge graph (weekly summary; also an L3 server) | Context (a summary *of* Connections) | Before traversing Graphify directly — try the summary first | 238 entries |
| **ECC** | Not a recall level — a **gate** on the dispatch path | Neither | Every change, not a question | Reviews standards/test/observability/accessibility/security/dependency/agent-safety; under Derek |
| **Orca** | Not a recall level — a **dispatch-path surface** (parallel agents, phone view) | Neither | Never for recall; only to watch/steer sub-agents | Reported v1.4.220 (Mac snapshot 2026-10-05), unverified from here; proposal only, vetted by the CTO Innovator |
| **OmniRoute** | Not a recall level — the **local dispatch gateway** for the local tier (the research tier left it 2026-10-05: Perplexity removed, research runs on the subscription, direct) | Neither | Never for recall; routes a PII-fired request to its `local` combo (`integrations/omniroute/README.md`) | Scripts built 2026-09-28, proved against stand-ins only; not configured on the Mac |
| **Bonsai 27B** | Not a recall level — the **local tier's model**, behind OmniRoute's `local` combo | Context (a client-data request's local-only answer) | A PII-fired request only — never anything else, never a cloud fallback | Apache-2.0 (PrismML); not installed; the local route stays off until the Mac proof passes (NEEDS-STEVEN 75) |

## Token rules — the zero-token hop first

1. **Level 0, before Level 1: Laya.** A request that Laya can answer with confidence never reaches
   Vanessa's own recall order at all — zero tokens, on-device, about 33 ms. Everything below is
   unchanged for what Laya escalates.
2. **One leaf file per question** (`CLAUDE.md`'s own rule) — Laya's job is picking that one leaf,
   not reading more of the tree once it is picked.
3. **The index line is still the product** at L2 — Laya routing to a wiki topic does not license
   opening the page when the index line already answers it.
4. **Tier, never model.** Every rule and every repository file names `orchestrator` / `executive` /
   `worker` / `research`, never a model — `CLAUDE.md`'s model-tiering table is the one place a tier
   resolves to a model, and it is not committed reasoning for this file to repeat.
5. **Escalating a level still costs roughly 5–10x the one before it** (unchanged from above) —
   Laya sits in front of that ladder, it does not change its rungs.


---

<!-- source file: README.md -->
# FILE: README.md

# Command Deck — AI ecosystem, second brain, and loop engineering

This repository is the source of truth for Steven Shearrill's AI operation: the second brain that
every agent reads, the skills that do the work, the integration specs for each outside system, and
the dashboard code and tests that keep the Command Deck honest.

It is a working brain, not documentation about one. `CLAUDE.md` loads automatically in every Claude
Code session in this directory and routes the agent to exactly one leaf file per question.

## Layout

| Path | What it is |
|---|---|
| `CLAUDE.md` | Level 1 router. Routing table, recall order, token rules, model tiering, HALT list. Read in full; nothing else is read until it says so. |
| `AGENTS.md` | The same rules for Codex and other non-Claude agents, which do not read `CLAUDE.md` automatically. |
| `context/` | `about-me.md` (always-true background) and `decisions.md` (append-only, dated). |
| `projects/` | One file per ongoing project, with status and where its live data actually lives. |
| `wiki/` | Level 2 topic wikis, each an index of one-line summaries. `wiki/clients/` is full-context and never chunked. |
| `references/` | Source documents and external systems. |
| `memory.md` | Claude Code auto-memory. Enable with `/memory`. |
| `vector-index/` | Level 3. What gets chunked and embedded, and the rule for what must never be. |
| `knowledge-graph/` | Level 4. Entities, typed relationships, and the never-graph-a-secret rule. |
| `always-on/` | Level 5. What runs when, on which machine, and whether it actually ran. |
| `recall-cache.md` | Cache TTLs, so a repeated question costs one lookup instead of five stores. |
| `REMOTE-ACCESS.md` | Every live path to this system from a phone or another machine. |
| `OPTIMIZATION.md` | How Orca, Jarvis, Ruflo, Graphify, Obsidian, RAG and ECC resolve into one recall path and one dispatch path under Vanessa. |
| `MAC-INSTALL.md` | Laying this tree onto the Mac, enabling auto-memory, opening the vault in Obsidian. |
| `.claude/skills/` | The installable skills: orchestration, backup, improvement, scale, loop engineering, stress testing, and the four integration syncs. |
| `integrations/` | Connection status per outside system, the Apple Health recipe, and the exact Mac task definitions. |
| `routines/` | Cloud routine and scheduled task specs, with cron in both Pacific and UTC. |
| `dashboard/` | The Orchestration and Loop Engineering panel source, plus the test harness. |
| `docs/` | The cycle's audit, stress test report, disruption brief, and the ecosystem inventory it was all built from. |

## The test gate

Nothing reaches the published dashboard without passing both:

```bash
python3 dashboard/tests/quickcheck.py <deck.html>        # syntax, seed JSON, duplicate ids, tag balance
node    dashboard/tests/runtime-harness.js <deck.html>   # executes the whole page under a DOM shim
```

The harness exists because the dashboard is one large immediately-invoked function: a load-time throw
kills every render after it, the page still opens, and the cards simply sit empty. `node --check`
passes on that file because the syntax is valid. Only executing it catches the failure.

## Two rules that matter more than the rest

**Output, not execution.** A scheduled task counts as working only when the document it owns actually
got fresher. "The task ran" is not the measure, and a green badge over a document nobody wrote is the
failure this whole system is built to prevent.

**A cloud routine can write; what it cannot do is carry a connector.** The old rule here said an
unattended cloud routine "parks on an approval nobody is there to give". That was true when it was
last tested on 2026-09-04 and is false now: a probe routine fired with nobody present at
**2026-09-22 09:05:56Z** and left the `cloudWriteProbe` document behind, and four cloud writers have
since run on it — the weekly backup, the live Pipeline Sync, the ISA escalation ladder and the feed
freshness watchdog, whose `feedFreshness` document was written at 2026-09-23T00:50Z. Do not refuse a
cloud write on the old rule's authority. What still pins work to the Mac is different and narrower:
an agent-created routine carries **no connectors** (Zoho, Lofty, Gmail, Calendar, Strava, Notion run
where the credentials live), and anything needing local files, the local model or the keychain.
Write-up: `docs/CLOUD-WRITE-ARCHITECTURE.md`; the standing version of this rule lives in
`wiki/dashboard-ops/index.md`.


---

<!-- source file: REMOTE-ACCESS.md -->
# FILE: REMOTE-ACCESS.md

# Remote access — every live path

How Steven reaches the brain, and how the brain reaches him, from anywhere, on **either Mac**. Each
row says what it can actually do: "connected" and "can write" are not the same thing.

## The paths

| Path | What it is | Can it write? |
|---|---|---|
| **Vanessa Live** | A Claude Code session on a Mac with **Remote Control**, driven from claude.ai or the phone app. Full tool access, as that Mac | **Yes** — full, as Steven's machine |
| **Command Deck** | The published artifact, on any device with his login | Yes, interactively (a human is present to approve) |
| **iMessage** | `[phone masked]`, via Inkbox. `vanessa-imessage-inbox` polls every 10 min; `voice-reply-render` renders replies in-persona | Reads and replies; queues work |
| **Discord `#vanessa`** | Via the local bot + Inkbox. `vanessa-discord-inbox` every 5 min | Reads and replies |
| **WhatsApp** | **(202) 474-5223** — Vanessa's Kapso number (WhatsApp Business Cloud API, sandbox, assigned 2026-10-14). Phase 1: she reads and answers **only Steven's own number** (Keychain item `kapso-allow`); live in any Claude Code/Orca session with the `kapso` MCP, unattended by `vanessa-whatsapp-inbox` (§5c) once registered. Rules: `.claude/skills/whatsapp-kapso`, `integrations/kapso/README.md` | Reads and replies (Steven only) |
| **Cloud routines** | `claude.ai/code/routines` — **57 total, 53 enabled** (counted 2026-09-23) | **Yes, unattended — proven 2026-09-22** (below). No MCP connectors when an agent creates the routine |
| **Orca mobile companion** (added 2026-09-28, **unverified — not installed**) | `stablyai/orca`'s iOS/Android app: watches and steers the Claude Code / Codex sub-agents Orca runs side by side in worktrees on a Mac | Steers/interrupts the agents Orca is running, on that Mac's authority — **not proven from here; see below for what Steven does** |
| **Local Bridge queue** | `localBridgeQueue` doc → `local-bridge-queue` task (hourly :25, 6 AM–9 PM PT) → `~/Applications/local-bridge/run.sh` | **Read-only verbs**, enforced by an allow-list |
| **Research queue** | `vanessaResearch` doc → `vanessa-research-queue` (hourly :30, 7:30 AM–9:30 PM PT) | Writes answers back to the doc |
| **Push / text** | `vanessa-significant-alerts` (11 AM, 3 PM, 7 PM PT) and the morning text | Outbound only |

## Which path for which job

- **"Answer me"** → iMessage or Discord. Cheapest, already running.
- **"Look something up I cannot see"** → Local Bridge queue (read-only) or the research queue.
- **"Do something on a Mac"** → **Vanessa Live.** The only path with real write access to files.
- **"Run this while I sleep"** → a **cloud routine** if it needs only the web and the artifact DB; a
  `claude-runner` task on the PRIMARY Mac if it needs a local file, a local model, DuckDB, a logged-in desktop app, the Keychain, or an MCP connector.
- **"Watch or steer several sub-agents at once, from my phone"** → the **Orca mobile companion**,
  once installed — see below. Until then, use Vanessa Live or the Command Deck to check on them.

## Orca mobile companion — unverified until Steven installs it

`integrations/CONNECTIONS.md` already carries Orca as **reported installed on the Mac, unverified
from the cloud** (F-V2-23). What is new here is the **mobile companion**: `stablyai/orca` (MIT)
describes itself as "the AI Orchestrator" — it runs Claude Code and Codex side by side in worktrees,
with an iOS and Android app to monitor and steer those agents. That would make it the natural phone
surface for the `≤8` parallel sub-agents Vanessa dispatches (`OPTIMIZATION.md`'s dispatch layer) —
**if** it is actually installed and paired, which nothing from this sandbox can confirm.

**What Steven does, to turn this from a proposal into a live path:**
1. Confirm Orca itself is really installed and current on the Mac — Section 3 of the Mac paste-in
   `integrations/mac-fix-all-2026-10-05.md` reads the installed app, compares it with the latest
   release and updates it on Steven's yes. (`./mac-verify.sh` has no Orca check — corrected
   2026-10-05.) F-V2-23 is still open; the Mac's own snapshot (2026-10-05 13:16 UTC) reports v1.4.220, updated 2026-10-04 (it read v1.4.203 on
   2026-09-16), and that has never been confirmed from
   anywhere but the Mac.
2. Install the iOS or Android Orca app from the project's own release channel
   (`github.com/stablyai/orca` — see `references/index.md`), and pair it to that Mac.
3. Confirm from the app that it actually sees a running Claude Code / Codex worktree session before
   anyone calls this path "connected" anywhere in this repo.

Until step 3 is done and reported, this path stays a proposal — same standing as the rest of Orca's
row in `integrations/CONNECTIONS.md` — vetted by the CTO Innovator, nothing executed on its own
authority.

**Cloud side (measured 2026-10-05):** every cloud Claude Code session builds the Orca CLI from
`stablyai/orca` main through `.claude/hooks/session-start.sh` (v1.4.214 that day — a source-tree
version, not a release). In the cloud `orca status` reports no app and no runtime, as expected. The
CLI can attach a session to a remote Orca runtime with `orca environment add --pairing-code …`; that
would let cloud sessions reach the agents on Steven's Mac, so it is his call (Elena reviews first)
and it has not been done.

## Using the brain remotely

From the phone or claude.ai, through a **Vanessa Live / Remote Control** session on a Mac: ask
naturally. That session runs `bin/brain recall "<the question>"` first — it is the cheapest level in
the recall order (`CLAUDE.md`) and answers most questions from the router without opening a second
file — then escalates per the recall order (memory + wiki index → research queue → `jarvis_obsidian` →
five-store sweep) only if `recall` comes back `file:null` or its evidence is not enough.

`bin/brain remember "<fact>" [--topic X]` works the same way from anywhere: it writes to whichever
Mac's clone the session is running on, and that Mac's next `scripts/brain-sync.sh` run — daily, or
sooner by hand — carries it to the other Mac by ordinary `git pull --rebase --autostash`. There is no
separate remote-memory path; it is the same brain, one commit later.

**Cloud sessions** (`claude.ai/code`, no Mac involved) can also clone this repo directly and run
`bin/brain` from the checkout — recall and remember both work there exactly as on a Mac, since the CLI
is repo-root-relative. What a cloud session cannot do is reach a Mac-local credential, a local model, or
Jarvis — sensitive/client answers still stay on a Mac (see "Honest limits" below).

## The correction — cloud routines CAN write the artifact DB

This file used to say, under "Honest limits": *"Cloud routines cannot write to the artifact DB
unattended. Anything that must persist runs on the Mac."* **That line was wrong**, and it is why
~50 feeds were pinned to one laptop. It was true when written (last tested 2026-09-04) and was never re-tested after Claude Code 2.1.277 (2026-09-18) changed the behaviour. A one-shot probe routine fired at **09:05 UTC on 2026-09-22** with nobody present and left the `cloudWriteProbe` document in the Command Deck store — version 1, `updatedAt 2026-09-22T09:05:56Z`, `result: "write succeeded unattended"`. It did not exist before that firing; re-read from the store 2026-09-22. Write-up: `docs/CLOUD-WRITE-ARCHITECTURE.md`.

**What did not change: the credential path.** A routine an agent creates stores **no MCP connectors**. Zoho, Lofty, Gmail, Calendar, Strava, Notion and Inkbox still run where those credentials live — on a Mac, or in a routine Steven creates in the web interface himself.

## Both Macs — what the second machine needs

Both are private claude.ai artifacts, so any device on Steven's login opens them and sees the same data. Reading is already solved; nothing to install. Three levels:

| Level | What Mac #2 needs | Proof it worked |
|---|---|---|
| **(i) Read the dashboards** | The claude.ai login. Nothing else | The sync badge reads **"Synced across devices"**, and the **Devices** card in Toolkit & Remote Access (panel 38) lists both Macs |
| **(ii) Drive Vanessa** | Claude Code installed and `/login`-ed · a clone of this repo · the MCP servers the work needs (15 configured on Mac #1) · the `~/.config/**/.env` files, by variable name only | `claude mcp list` shows them connected; one routing-table question opens exactly one leaf file |
| **(iii) Run the scheduled tasks — on BOTH Macs** | Everything in (ii), plus `claude-runner` with the 59 tasks, the `claude-auto` launcher, and **one line in `~/.config/claude-runner/role`: `peer`** on both machines — see the lease below | `runnerctl status` lists the tasks on both; whichever Mac does **not** currently hold the lease exits **75** on a manual run with `standby: lease held by <other Mac>` and writes nothing; `claude-auto --take-lease` / `--release-lease` move the lease between them on demand, no waiting |

*Corrected 2026-09-24 (R6):* level (iii) used to mean "install the tasks and leave them lease-blocked
forever on one Mac." **Goal now: two equal Macs — both run the schedule, both can take over.** Level (iii) is
complete only once **both** Macs are `peer`, both have the schedule enabled, and a failover has actually been
proved — the runbook in `docs/SECOND-MAC-SETUP.md` ends on exactly that proof.

**The "same information" half** — repo parity, role, lease verdict, and counts of MCP servers, plugins,
skills and runner tasks, on one screen — is `integrations/mac-sync/mac-sync.sh status`. `pull`/`export`/`diff`
keep the two Macs' config in sync without ever committing a secret or a task prompt. Full reference:
`integrations/mac-sync/README.md`. Your vault (`~/Shearrill-Vault`) is a separate question from the git repo —
see `docs/SECOND-MAC-SETUP.md` -> *Your vault on both Macs*.

Step by step: `docs/SECOND-MAC-SETUP.md`.

## Primary / standby — one writer, enforced

*Corrected 2026-09-24 (R6):* this section used to make PRIMARY a fixed, human-assigned role — one Mac
permanently trusted to keep working when the check can't complete, the other permanently not. Steven's
words were **"both of my MacBooks... equally have control of this dashboard setup infrastructure"**, and a
fixed primary is not equal control, it is a favourite with a name. Both Macs now run the role **`peer`**:
symmetric, no permanently-favoured machine. The fix is **sticky leadership, not an open or closed default** —
whichever Mac most recently, provably held the lease keeps working through a blip *of its own*, and the other
Mac, which was not holding it, still defers on a blip of its own. `primary` and `standby` keep working exactly
as documented below, as **legacy values** nothing that reads them today has to change for — the installer
just no longer writes either one.

Two Macs running the same 59 tasks would double-write the same documents: duplicate `ciLog` rows, `isaLine`
messages sent twice, churn on `sectionEdits` (already at version 3104). Make it a lease, not a convention.

Lease document: `taskLease` in the Command Deck store (`1624daae-d683-405a-971d-c5828dce0f8d`), `{v:{holder, hostname, acquiredAt, expiresAt}}` — **unchanged shape**, peer included. `holder` is a short stable id per machine; `hostname` is `scutil --get ComputerName`, for humans. TTL **90 minutes**. The first real run on a Mac creates it; never seed it from the cloud.

**Where the check actually runs, since 2026-09-22: in the launcher, not in 59 prompts.** This file used to say "put this at the top of every task prompt". That was correct and it was never going to happen — editing 59 live task prompts is a HALT an agent cannot perform and a chore that does not finish, so Mac #2 stayed off. `integrations/omniroute-failover/claude-auto.sh` is already the one launcher in front of every `claude-runner` task: it already takes `--task NAME`, already decides whether a task may run, and already defers with exit 75. The same five steps — same document, same TTL, same `if_version` pin, same step-4 re-read — run there, once, for every task, on **either** Mac. **Steven's whole remaining job per Mac is one line in a file, and it is the SAME line on both:**

```bash
mkdir -p ~/.config/claude-runner && printf 'peer\n' > ~/.config/claude-runner/role   # the SAME word on both Macs
claude-auto --lease-check                                                            # prove it, on each Mac
```

**Already on `primary` or `standby`? One line changes it — R6, 2026-09-24:**
```bash
printf 'peer\n' > ~/.config/claude-runner/role
```
That is the whole migration. The lease document, the decision cache and everything else about the mechanism
are unchanged; `peer` just reads the same `taskLease` the old roles did. `mac-verify.sh` reports the new word
as an ordinary role, not a problem.

Absent or unreadable, the role reads as **standby** — the safe direction for a freshly imaged Mac. The role decides one thing only: what happens when the check itself cannot complete. It never overrides a conclusive answer (`HELD`/`ACQUIRED`/`FOREIGN`/`RACE` behave identically on every role):
- **`peer`** (both Macs) is **sticky**: fails OPEN only if *this* Mac held the lease at *its own* last real check and that lease has not yet expired; otherwise fails CLOSED, same as standby. Leadership follows the lease, not a file — there is no permanent primary. Exact rule and why: `integrations/omniroute-failover/README.md` → *Peer — sticky leadership*.
- **`primary`** (legacy) fails OPEN unconditionally — a blip must never stop all the automation; the 90-minute TTL exists so it can work through one.
- **`standby`** (legacy, and the default for an absent role file) fails CLOSED unconditionally — a standby that guesses is the double-write this prevents.

A live foreign lease defers on **every** role. The decision is cached for 30 minutes, so the real check costs about 48 `claude -p` turns a day rather than one per task invocation (733 of those a day across the 59 crons). Mechanism, precedence against the PII gate, and the executed tests: `integrations/omniroute-failover/README.md` → *The task lease*.

**Explicit control, no waiting on a check, from either Mac — R6, 2026-09-24:**
```bash
claude-auto --take-lease       # immediate takeover: writes with NO if_version, reads it back, busts this Mac's cache
claude-auto --release-lease    # hand back now: expiresAt = now, pinned, only if this Mac holds it; busts the cache
```
Both print one clear line (`TOOK the lease — holder=… expires=…` / `RELEASED the lease — it is free as of …`).
This is the one-command version of the manual promotion prompt below, for any Mac running `claude-auto`.

**Per-Mac status, both Macs, every conclusive check — R6, 2026-09-24.** `claude-auto` also writes this Mac's
own `macHeartbeat.<machineId>` document in the same turn as the lease check: role, verdict, lease holder and
expiry, `claudeAutoVersion`, a runner task count when `runnerctl` is on `PATH`, repo branch/behind/ahead when
`CLAUDE_RUNNER_REPO_DIR` is set. Best effort — it can never block or fail the task it rides along with. Shape
and what is null and why: `integrations/omniroute-failover/README.md` → *The per-Mac heartbeat*. For the
"same information" half — repo parity, MCP/plugin/skill/runner-task counts, `.env` variable names, all on one
screen for either Mac — see `integrations/mac-sync/mac-sync.sh status` (`integrations/mac-sync/README.md`).

**The block below stays the fallback** for any writer that does **not** go through `claude-auto` — a cloud routine, a hand-run Claude Code session, a future task runner. Paste it at the top of that writer's prompt, before any work:

```
LEASE CHECK — first, and do nothing else if it fails.  MY_ID = "<this Mac's id>"  # different on each Mac
1. ArtifactData get state/taskLease on artifact 1624daae-d683-405a-971d-c5828dce0f8d.
2. If it exists AND v.holder != MY_ID AND v.expiresAt > now(UTC):
      print "standby: lease held by " + v.holder; EXIT 0, write nothing. (Success, not failure.)
3. Else acquire/renew: ArtifactData set state/taskLease
      data = {"v":{"holder":MY_ID,"hostname":"<scutil --get ComputerName>",
                   "acquiredAt":"<now ISO-8601 Z>","expiresAt":"<now+90min ISO-8601 Z>"}}
      if_version = <the version from step 1>    # omit ONLY if the document did not exist
   A refused write means the other Mac moved first -> EXIT 0, write nothing.
4. Re-read state/taskLease. If v.holder != MY_ID -> EXIT 0.  # both-created-it-at-once race
5. Only now do the task's real work.
```

The `if_version` pin is what makes this a lease and not a hope: a write pinned to a version that has already moved is refused and writes nothing; step 4 covers the one case a pin cannot. The launcher's gate is the same five steps and preserves both semantics. **Promote the standby — one command,** pasted into Claude Code on the Mac taking over (unchanged, and it still works on its own — this is exactly what `claude-auto --take-lease` now automates for a Mac that has the launcher):

```
Take the task lease: ArtifactData set state/taskLease on artifact 1624daae-d683-405a-971d-c5828dce0f8d to
{"v":{"holder":"<this Mac's id>","hostname":"<scutil --get ComputerName>","acquiredAt":"<now Z>","expiresAt":"<now+90m Z>"}}
with no if_version, then read it back and show me the holder.
```

The old primary's next run reads a lease it does not hold and exits quietly. Nothing to turn off, nothing double-writes in between; hand back by running the same line on the other Mac, or `claude-auto --release-lease` there.

**On `peer`, the role file itself never needs to flip** — both Macs stay `peer` permanently; only the lease document moves, via `--take-lease`/`--release-lease` or the prompt above, and either one busts the local decision cache immediately (no 30-minute wait). The paragraph below is for the **legacy** `primary`/`standby` pair only, where the role file *is* the thing that flips:

```bash
printf 'primary\n' > ~/.config/claude-runner/role    # legacy only — on the Mac taking over
printf 'standby\n' > ~/.config/claude-runner/role    # legacy only — on the Mac handing over
```

Skip it and both legacy Macs still converge, but for up to 30 minutes the old primary can keep running on a cached decision — a bounded overlap, not a silent one: `claude-auto --status` shows the cached verdict and its age on both machines.

## What should move to the cloud now, and what cannot

**Move — web plus the artifact DB, no credential, no local file.** The feeds that died when one laptop slept: `openrouter-feeds-refresh` (error since 2026-09-17), `feeds-weekly` and `feeds-market-close` (stale since 2026-09-17/15), `weather-news-refresh`, `r5-rates-market-refresh` and `r9-feed-freshness-sweep` (**never run**), `r1-morning-brief`, `r3-eod-rollup`, `r10-automation-health`, the ISA comms bridge, and the weekly backup — which **already moved** and took the 2026-09-22 backup with no laptop involved.

**Cannot move, by reason.** *Local files or a local daemon:* Apple Health ingest (Health Auto Export on `:8765` + DuckDB), `r7-plaid-balances`, `openterminal-remote-queue`, `toolkit-deck-sync` and `nightly-self-test` (they measure the machine they run on). *Vault files and the local model:* `local-bridge-queue`, `brain-learn-daily`, `brain-weekly-verify`, `ops-knowledge-graph`, `fabric-deck-sync`, `steve-twin-sweep`. *A connector or a Keychain/.env credential:* `r4-quantvue-sync` (Google Sheet), `lofty-crm-sync` (`lofty-bridge` MCP + `LOFTY_API_KEY` in `~/.config/lofty/.env`), Zoho, `calendar-daily-sync`, `r12-inbox-triage`, `strava-daily-sync`, and the iMessage / Discord / WhatsApp inboxes — WhatsApp also needs a logged-in desktop app. `health-full-analysis` is blocked behind the ingest, not by the cloud: it can move once `appleHealth` is fresh again.

## Honest limits

- **A routine is proven by the document it leaves, never by its run status.** The old web "Pipeline Sync" routine reports SUCCEEDED four times a day and has never moved a document.
- **The Local Bridge is read-only on purpose.** A verb outside the allow-list is refused, not escalated. `steve-twin-sweep` was refused on exactly this: a Bash write to `~/Shearrill-Vault`.
- **Everything still on a Mac is bounded by that Mac being awake.** See `always-on/README.md`.
- **The human ISA** works Mon–Fri 12–4 PM PT, reached only through Vanessa on the ISA line. The Mac `isa-comms-bridge-local` runs hourly :37, 7:37 AM–9:37 PM PT (last ok 2026-09-21 20:38 PT); the cloud escalation ladder runs weekdays 14:30 UTC and does write.
- **No remote path may carry a credential or client PII in its prompt.** Sensitive answers come from the local model (Jarvis) on the Mac, and stay there.

## Sending work in from the phone

1. Text Vanessa what you want. She queues it — she does not act on a licensed decision.
2. Anything on the HALT list comes back as a **Needs-Steven packet**, not as an attempt.
3. If it needs a credential or a permission (the Zoho API grant, the Lofty key), it stops and says so. Two retries maximum, then it stops.


---

<!-- source file: knowledge-graph/README.md -->
# FILE: knowledge-graph/README.md

# L4 — Knowledge graph

**The graph answers "how do these connect".** It does not answer "what is true about X" — that is
the wiki — and it does not answer "find me the passage" — that is `vector-index/`. Routing a
lookup question to the graph is the most common way to waste a level-4 call.

## What it holds

Entities and **typed** relationships across: clients, lenders, partners, agents, tools. Vocabulary
and node shape are in `schema.md`. Entity files live in `entities/`.

## Where it actually runs

The graph is **Graphify**, in the Obsidian vault under `60-Knowledge`. As of the `knowledgeFabric`
doc (stamp 2026-09-22 04:05 UTC): **750 nodes, 1,104 edges, built 2026-09-13**. A weekly summary is
written into **Ruflo** memory (238 entries) so the graph's shape can be recalled without traversing it.

`entities/` in this repo is the **source definition** — the entity files a build reads. The graph
itself is not committed here.

## What populates it

| Feed | How |
|---|---|
| `interview-me` ("Grill Me") | A relentless interview on a named topic → structured notes → entities and relationships. This is the main deliberate feed. |
| Transcripts | Entity + relation extraction, reviewed before merge |
| Contracts | Parties, dates, obligations — relations only, never the clause text |
| `ops-knowledge-graph` (Mac task) | Graphs the dashboard export, playbooks, decisions and the agent roster so the team can query how things connect |

Honest status: `ops-knowledge-graph` is scheduled **Sundays 05:45 PT** and **has never run under the
runner**. `interview-me` is **not installed** on the Mac. Today's 750 nodes came from the 2026-09-13
build, not from a running pipeline.

## The never-graph-a-secret rule

**Nothing sensitive becomes a node, an edge, or a property.** Specifically, never graph:

- A credential, API key, token, account number or loan number
- A client's name, address, contact details, income, balances or credit data
- Anything from `wiki/clients/**`
- Anything a `sensitivity` flag marks, anywhere upstream

The reason is structural, not procedural: a graph is built to be traversed and summarized, so a
secret in it leaks through every path that touches it, and a summary of a summary carries it
somewhere nobody is checking. **Sensitive client data is answered by the local model (Jarvis) only.**

When a relationship genuinely needs a sensitive endpoint, store the **relationship** and a **stable
opaque label** for the endpoint, and keep the identity in the full-context client page on the Mac.
The graph may know "a VA purchase file is blocked on an appraisal"; it may not know whose.

## Review gate

Anything the graph learns that is flagged sensitive waits for **`brain-weekly-verify`** — the Sunday
review list where Steven approves or rejects. Never straight to Notion, never straight to a node.


---

<!-- source file: knowledge-graph/schema.md -->
# FILE: knowledge-graph/schema.md

# Knowledge graph — schema

Small, closed vocabularies. A graph with an open vocabulary is a graph nobody can query.
Adding a type or a relation is a deliberate change to this file, not something a run invents.

## Entity types

| Type | Is | Key |
|---|---|---|
| `Person` | A named human in the business network — partner, lender rep, agent, vendor | label |
| `Client` | A borrower or buyer/seller. **Opaque label only** — see the never-graph-a-secret rule | opaque label |
| `Org` | Lender, brokerage, title, escrow, builder, vendor, nonprofit funder | name |
| `Agent` | An AI seat in the team (Vanessa, an executive, a report, a bench) | seat name |
| `Tool` | An MCP server, connector, skill, CLI or app | tool name |
| `Task` | A Mac scheduled task or a cloud routine | task name |
| `Doc` | A `state` DB document, or a registered source in `references/` | doc key |
| `Program` | A loan program | program name |
| `Property` | A property, by market area — never a client's address | area + label |
| `Topic` | A wiki topic or subject area | topic slug |
| `Decision` | A dated entry in `context/decisions.md` | date + slug |

## Relationship vocabulary

Typed, directed, and written `SUBJECT --REL--> OBJECT`.

| Relation | From → To | Means |
|---|---|---|
| `OWNS` | Agent → Task / Doc / Topic | This seat is accountable for it |
| `REPORTS_TO` | Agent → Agent | Org-chart line |
| `USES` | Agent / Task → Tool | Runtime dependency |
| `WRITES` | Task → Doc | This task produces that document |
| `READS` | Doc / Agent → Doc | Consumption, for blast-radius questions |
| `REPLACED_BY` | Tool → Tool | A retired tool → the tool that took over from it |
| `BLOCKED_BY` | Task / Doc → Decision / Tool | Why something is not running |
| `WORKS_WITH` | Person → Org | Affiliation |
| `REFERRED_BY` | Client → Person / Org | Lead source, opaque on the client side |
| `OFFERS` | Org → Program | Lender offers a program |
| `ELIGIBLE_FOR` | Client → Program | **Opaque client label only** |
| `LOCATED_IN` | Property / Org → Topic(market area) | Geography |
| `DECIDED` | Decision → anything | A dated decision that changed a thing |
| `SUPERSEDES` | Decision → Decision | Reversal chain |

## Node shape

```yaml
id: tool.lofty-bridge          # type.slug — stable, lowercase
type: Tool
label: lofty-bridge
sensitivity: public            # public | internal | sensitive
source: context/decisions.md#2026-09-22-lofty
asOf: 2026-09-22
props: {}                      # small scalars only — never a document body
edges: []                      # a Tool node's only outbound relation is REPLACED_BY,
                               # written on the RETIRED tool's node, pointing at its
                               # successor — so the successor's own node carries none
```

## Rules

1. **`sensitivity: sensitive` never reaches the graph build.** The builder drops it and logs the drop.
2. **Every node carries `source` and `asOf`.** A node without provenance is deleted, not trusted.
3. **No document bodies in `props`.** Scalars and short labels only; the body stays in its store.
4. **No new type or relation without editing this file** in the same change.
5. **Ids are stable.** Rename the `label`, never the `id` — an id change silently orphans edges.
6. Contradicting edges are kept, both dated, and raised to the Sunday review. The graph records
   disagreement; it does not resolve it on its own.


---

<!-- source file: recall-cache.md -->
# FILE: recall-cache.md

# Recall cache — TTL rules

The cache is the cheapest part of the brain. A repeated question that hits cache costs one lookup
instead of a store sweep, and most questions in a working day are repeats.

## The entry

```json
{ "answer": "...", "storesHit": ["memory", "wiki/dashboard-ops"], "ts": "2026-09-22T08:30:00Z",
  "sourceStamp": "2026-09-21T20:24:36-07:00", "level": 2 }
```

- **`ts`** — when *this answer* was cached.
- **`sourceStamp`** — the underlying document's own stamp. These are different things, and confusing
  them is how a five-day-old number gets reported as fresh.
- **`level`** — which recall level produced it. Used to measure whether the ladder is working.

## TTL

| Store class | TTL | Why |
|---|---|---|
| Volatile — deck `state` docs, rates, calendar, weather, leads, runner status | **4 h** | A sync runs at least twice a day; four hours is the longest a number can be wrong without anyone noticing |
| Stable — Obsidian vault, Graphify graph, Ruflo summaries | **24 h** | Rebuilt daily at most; the graph's last build was 2026-09-13 |
| Repo files — wiki, context, projects, references | Until the file changes | They change by commit, not by clock |
| Research answers (level 3, Claude web research) | **24 h**, and always cited | A cited answer can be re-checked; an uncited one cannot |
| Client / full-context pages | **Not cached** | They are read whole, on the Mac, each time |

## The rules

1. **Never serve past TTL silently.** Either refresh, or answer and say the age:
   *"as of the 2026-09-21 20:24 PT sync — 12 hours old."*
2. **Report `sourceStamp`, not `ts`, and never today's date** unless the fact was verified today.
3. **A stale-store answer is still better than a guess** — serve it, label it, and raise the staleness.
4. **Invalidate on write.** Any task that writes a doc invalidates every cache entry whose
   `storesHit` includes it. A cache that outlives its source is worse than no cache.
5. **Cache the miss too.** "Not in the brain" is an expensive thing to rediscover five times.
6. **Never cache anything sensitive.** Client pages and anything flagged `sensitive` are out.
7. **A cache hit still names its sources.** `storesHit` goes into the answer, so a wrong answer can
   be traced to the store that produced it.

## Staleness thresholds worth alerting on

| Signal | Threshold |
|---|---|
| A deck doc older than twice its task's cadence | Alert |
| A task with **no completion recorded** for longer than its cadence | Alert — e.g. `brain-weekly-verify`, last end 2026-09-14 on a Sunday cron, so the 09-20 gate never ran (`runnerStatus`, 2026-09-23 02:10 UTC) |
| A task that reports **ok** while the document it owns has not moved | Alert — the silent no-write success, and the one this table used to miss. `openrouter-feeds-refresh` read `ok` on 2026-09-22 while `openrouterFeeds` had been frozen since 2026-09-13 (`feedFreshness`, 2026-09-23 00:50 UTC). Judge the doc stamp, never the task status |
| A vector index whose `builtAt` predates its source's stamp | Alert — the confident-and-wrong failure mode |
| A store the fabric count says is at **0** | Alert — e.g. the Drive folder, 0 files |

`brain-weekly-verify` raises these on Sunday. The weekly loop measures **cache hit %** and
**tokens per answer** against them — see `OPTIMIZATION.md`.


---

<!-- source file: vector-index/README.md -->
# FILE: vector-index/README.md

# L3 — Semantic search

**Semantic search is for high-volume corpora only.** It is level 3 of the recall order, not level 1.
If the wiki index line answers the question, this layer costs tokens and adds risk for nothing.

## What gets chunked

| Corpus | Why it qualifies |
|---|---|
| Call transcripts | High volume, repetitive, a retrieved passage still means what it said |
| Disclosure libraries | Large, clause-shaped, a clause is self-contained |
| Compliance rule sets (TRID / RESPA / Reg Z, agency guidelines) | Large, cited by clause, exact wording matters |
| Playbook bodies (~1,700 pages across four playbooks) | Far too large to read whole; chapter-shaped |
| Long research outputs and meeting *recordings* (not summaries) | Volume, and nobody re-reads them whole |

## What NEVER gets chunked

**Never vectorize a document that must be read whole.** Concretely:

- `wiki/clients/**` — every client page, no exceptions
- Client decision logs
- Meeting summaries (the summary is already the compression; chunking it compresses a compression)
- `context/decisions.md` — an entry out of sequence reads as current policy when it is not
- Anything containing a credential, account number, address or borrower identity

A file that must be read whole is marked **FULL CONTEXT** on line 2. The indexer skips those files;
if the marker is missing and the file is in `wiki/clients/`, the path rule wins.

## Chunking

- **Target 600–800 tokens per chunk, ~15% overlap.** Small enough that a hit is precise, large
  enough that a clause keeps its conditions.
- **Split on structure first** — heading, clause, speaker turn, Q&A pair — and only fall back to a
  token window when the document has no structure. A clause split mid-condition is worse than no hit.
- **Carry metadata on every chunk**: source id, edition/version, date, section path, and a
  `sensitivity` flag. Without the date, a retrieved 2024 guideline looks exactly like a 2026 one.

## Embedding and retrieval

- **Embedding model: whatever the local Jarvis/OpenJarvis stack already runs.** Sensitive and
  high-volume corpora stay on the Mac, so the embedding model must be local — that constraint decides
  the choice, not the leaderboard. Record the model name and dimension in the index manifest, because
  changing either means a full re-embed.
- **Hybrid search, always.** Dense vectors for paraphrase, BM25/keyword for the exact token — program
  names, clause numbers, lender names and NMLS-style identifiers are precisely where dense retrieval
  is weakest.
- **Rerank the top ~30 down to the top ~5** with a cross-encoder before anything reaches a prompt.
  The rerank is what makes a small, cheap context window sufficient.
- **Always return the citation** — source, edition, date, section. An uncited chunk may not be quoted.

## Who serves it today — honest

| Component | Role | Status 2026-09-23 |
|---|---|---|
| Jarvis (OpenJarvis `memory.db`) | Local index and on-device voice | **1,761 documents** (knowledgeFabric 2026-09-23 02:10 UTC; unverified from the cloud) |
| Graphify embeddings | Embeddings alongside the graph in `vault/60-Knowledge` | Graph built 2026-09-13 |
| Ruflo | Research-and-memory bench; weekly graph summaries | **238 entries** |

Counts are from the `knowledgeFabric` doc, stamp 2026-09-23 02:10 UTC. **There is no separate
production vector service in this repo** — this directory is the specification and the rules; the
serving is done by the three components above, on the Mac. Do not describe it as more than that.

## Freshness

Re-embed on change, not on a schedule. A corpus whose source changed and whose index did not is the
one failure mode that produces a confident, cited, wrong answer. The index manifest records
`{corpus, docs, chunks, model, dim, builtAt}`; `brain-weekly-verify` checks `builtAt` against the
source's own stamp and raises a stale-store alert. See `always-on/README.md`.
