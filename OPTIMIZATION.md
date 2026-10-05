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
| **Obsidian vault** (831 notes) | The **visual layer** and Jarvis's index source. Where a human reads and writes | Querying. It is not a database |
| **Jarvis** (OpenJarvis `memory.db`, 1,760 docs) | Local index + on-device voice. **The only path for sensitive client data** | Anything that needs the web |
| **Graphify** (750 nodes / 1,104 edges, built 2026-09-13) | "How do these connect" — relationships, blast radius | "What is true about X". That is the wiki |
| **Ruflo** (238 entries) | Research-and-memory bench; weekly graph summaries so the graph can be recalled without traversal | Primary storage |
| **RAG** (`vector-index/`) | Finding a passage in a high-volume corpus | Anything that must be read whole |
| **ECC** (under Derek) | A **gate** on every change: standards, test, observability, accessibility, security, dependency, agent-safety | Recall. It stores nothing |
| **Orca Computer Use** (v1.4.203, Stably AI) | Computer-use / browser execution where there is no API | Recall, and anything unattended and irreversible |
| **Notion** (Second Brain DB, 68–70 rows) | **The record.** What survives a session, synced by `brain-deck-sync`; also hosts the Health Log | Asking it a question directly. It is the destination, not the index |
| **Google Drive** ("Second Brain" folder) | **Nothing yet — not wired.** Intended as a read-only *source* that feeds Jarvis and the vault | Everything, today. See below |
| **Laya** (`integrations/laya/`, added 2026-09-28) | The **zero-token first hop**, in front of Vanessa and every other row in this table — see above | Anything past routing: a licensed decision, research, writing to anything, or trusting its own guess below its confidence threshold |

Steven asked for this to be "Notion **+ Drive**/Graphify/Obsidian/RAG/ECC as one self-improving
Vanessa". The two rows above were missing from this table until 2026-09-22. Notion was in fact wired
all along (it is the record); **Drive never was.** Two tasks claim to read a Drive folder, and the
fabric tile has counted **0 files** in it every time it has been sampled — a store on the deck that
nothing can reach. Decide it, do not leave it: `integrations/google-drive-brain.md`.

**Orca's honest status:** the standalone computer-use app is **reported installed** on the Mac —
that claim has never been verified from anywhere but the Mac itself, so confirm it with
Section 3 of `integrations/mac-fix-all-2026-10-05.md` before any surface calls it live (F-V2-23;
`./mac-verify.sh` has no Orca check — corrected 2026-10-05). It is **not** integrated with Claude
Code, and the parallel-worktree IDE integration is **not** done. As an executor it is a proposal,
vetted by the CTO Innovator — see `wiki/ai-team/index.md`.

**Corrected 2026-09-28:** the GitHub project `stablyai/orca` (MIT) describes itself as "the AI
Orchestrator" — it runs Claude Code and Codex side by side in worktrees, with an iOS and Android
**mobile companion** to monitor and steer agents, not only a computer-use app. The Mac's reported
v1.4.203 is still unverified from here (same F-V2-23 caveat). Both descriptions can be true of one
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
| **`memory.md`** | **L2** — wikis/auto-memory | Context | After L1, before opening a wiki page | 16 dated entries, cap 100 lines, 2026-09-28 |
| **`context/decisions.md`** | **L2** — wikis/auto-memory | Context | A "why is it this way" question, one dated entry only | 260 lines; one entry needs Steven's call on an in-place edit (`docs/NEEDS-STEVEN.md` #19) |
| **Obsidian vault** | **L2** — wikis/auto-memory | Context | A human reads/writes it directly; source for L3/L4 builds | 831–832 notes, `knowledgeFabric` stamp 2026-09-23 |
| **Notion (Second Brain DB)** | **L2** — wikis/auto-memory | Context | `brain-deck-sync` hourly :20, 7 AM–10 PM PT | Working, 68–71 rows |
| **Google Drive** | **L2** — wikis/auto-memory (spec) | Context, once wired | Never — no connector exists | **0 files, not wired.** `integrations/google-drive-brain.md` |
| **RAG / vector index** | **L3** — semantic search | Context (chunked) | A high-volume corpus, only after the L2 index line fails | Spec + rules only; **no separate production service** — served by Jarvis/Graphify/Ruflo below. `vector-index/README.md` |
| **Jarvis** (OpenJarvis `memory.db`) | **L3** — semantic search, and the separate **local** client lane | Context | An L3 lookup, or any client question (local only, never leaves the Mac) | 1,760–1,761 documents |
| **Graphify** | **L4** — knowledge graph (embeddings also serve L3) | Connections (+ Context in its L3 embeddings) | A "how do these connect" question | 750 nodes / 1,104 edges, built 2026-09-13; `ops-knowledge-graph` has **never run** |
| **Ruflo** | **L4** — knowledge graph (weekly summary; also an L3 server) | Context (a summary *of* Connections) | Before traversing Graphify directly — try the summary first | 238 entries |
| **ECC** | Not a recall level — a **gate** on the dispatch path | Neither | Every change, not a question | Reviews standards/test/observability/accessibility/security/dependency/agent-safety; under Derek |
| **Orca** | Not a recall level — a **dispatch-path surface** (parallel agents, phone view) | Neither | Never for recall; only to watch/steer sub-agents | Reported v1.4.203, unverified from here; proposal only, vetted by the CTO Innovator |
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
