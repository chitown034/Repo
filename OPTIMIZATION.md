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

  work ──► Vanessa ──► decompose ──► ≤8 sub-agents in parallel (≤4 Perplexity per wave)
                          │              │
                          │              └─► each gets the router + ONE leaf file
                          └─► ECC gate (Derek) ──► consolidate ──► one answer ──► Steven
```

**Stop at the first level that answers.** Escalating a level costs roughly 5–10x the one before it.

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

Steven asked for this to be "Notion **+ Drive**/Graphify/Obsidian/RAG/ECC as one self-improving
Vanessa". The two rows above were missing from this table until 2026-09-22. Notion was in fact wired
all along (it is the record); **Drive never was.** Two tasks claim to read a Drive folder, and the
fabric tile has counted **0 files** in it every time it has been sampled — a store on the deck that
nothing can reach. Decide it, do not leave it: `integrations/google-drive-brain.md`.

**Orca's honest status:** the standalone computer-use app **is installed** on the Mac. It is **not**
integrated with Claude Code, and the parallel-worktree IDE integration is **not** done. As an
executor it is a proposal, vetted by the CTO Innovator — see `wiki/ai-team/index.md`.

## Token-cost table — which store answers which question class

Costs are **planning estimates in units of the cheapest call**, not measurements. The weekly loop
replaces them with measured values; until it has, treat them as ordering, not arithmetic.

| Question class | Answered by | Level | Est. cost | Why here and not elsewhere |
|---|---|---|---|---|
| "What is today's number?" | The named `state` doc / the loaded deck snapshot | 1 | **1x** | Already in context. Any other store would be a stale copy |
| "Who owns this / what did we decide?" | `wiki/ai-team`, `context/decisions.md` | 2 | **1–2x** | One leaf file, and it is authoritative by construction |
| "How does this program work?" | Wiki index line → one page | 2 | **2x** | The index line answers most of these outright |
| "Find the clause / the passage" | `vector-index/` via Jarvis + Graphify embeddings | 3 | **8x** | Chunk + rerank is the only affordable way through ~1,700 pages |
| "What's the current state of the market/tool X?" | `request_research` → Perplexity, async | 3 | **10x+** | Leaves the machine; capped, queued, cited, ≤4 per wave |
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
