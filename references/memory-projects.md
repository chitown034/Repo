# Memory projects — what's proven, what to steal, what to skip

Principle 2 of Steven's guide: stand on proven shoulders before inventing a mechanism this repo
already needs. Four open-source memory/knowledge projects, read from their real README/code
(sources noted per project — one was read via the gist page's own rendering, not a raw fetch,
because `gist.githubusercontent.com` is egress-blocked from this session; the other three were
verified against a fresh `git clone --depth 1` of the actual repo, not a summarized fetch alone).
Context this maps against: the deterministic retrieval engine going into `brain/` in parallel
(keyword → INDEX.md score, no file opens → open one file → best section → one pointer hop → model
once, then `bin/brain remember` to write back) and the five levels this router (`CLAUDE.md`)
already defines: L1 router, L2 wiki + `memory.md`, L3 `vector-index/`, L4 `knowledge-graph/`,
L5 `always-on/`.

---

## 1. Karpathy's LLM wiki (gist, plain markdown)

**Read:** the gist's own page (rendered markdown), not the raw file — raw gist fetches are
blocked from this session, so treat this as read-but-not-quoted-verbatim.

**What it actually does:** no code at all — it's a pattern description. An LLM maintains a
small, hand-written-by-the-model wiki of markdown pages instead of re-retrieving raw source
documents every time. Three layers: **raw sources** (immutable, the LLM reads but never edits
them), **the wiki** (entity/concept pages the LLM writes and revises), and **the schema** (a
doc describing the wiki's own conventions). The workflow has three verbs: **ingest** (a new
source updates 10–15 existing pages and flags contradictions), **query** (answer from wiki
pages, cite them, and good answers can themselves become new pages), and **lint** (a periodic
pass for stale claims, orphan pages, missing cross-refs). The pitch: humans let wikis rot because
the bookkeeping is tedious; an LLM's bookkeeping cost is near zero, so knowledge compounds instead
of scattering across chat history.

**Steal:**
- The **ingest verb literally is `bin/brain remember`** — this repo already committed to the
  same shape (a session writes what it learned back into the wiki/memory, not just reads it).
  Make ingest explicitly rewrite 10–15 *existing* pages when relevant, not just append a new one —
  that's the compounding mechanism, not the appending.
- **Lint as a scheduled pass**, not a one-off: this repo has no periodic "find orphan wiki pages /
  stale claims / missing index lines" job. `brain-weekly-verify` (already named in `AGENTS.md`)
  is the natural home for it.

**Skip:** the gist has no retrieval engine, no scoring, no code — it's a philosophy of *what a
wiki is for*, not *how to search it fast*. This repo's `brain/` already goes further (deterministic
scoring before any file open). Don't import "the LLM decides what's relevant" as a replacement for
that determinism; use the gist only for the write-back shape.

**Maps to:** L2 (`wiki/` + `memory.md`) almost exactly — this repo's L2 already *is* Karpathy's
wiki layer. The gap is L2's lint/compounding discipline, not its existence.

---

## 2. qmd — Tobi Lütke (`github.com/tobi/qmd`, cloned and read `README.md` directly, 1383 lines)

**What it actually does:** a local, on-device hybrid search engine over markdown notes, meeting
transcripts and docs. Pipeline (its own README diagram): a query is expanded into typed
sub-queries — `lex` (BM25 keyword variants), `vec` (dense semantic variants), `hyde` (a
hypothetical-answer expansion) — routed so lexical expansions only ever hit BM25/FTS5 and
semantic expansions only ever hit the vector index, both run in parallel, fused with **Reciprocal
Rank Fusion**, then the top candidates go through an **LLM reranker**. All three models
(embedding, reranking, expansion) are local GGUF models via `node-llama-cpp` — nothing leaves the
machine. A distinctive feature: `qmd context add <collection> "<description>"` attaches
hand-written context to a whole collection or path, which every match under it returns alongside
the hit — the README calls this "the key feature… don't sleep on it," because it gives an LLM
caller the *scope* of a hit, not just its text.

**Steal:**
- **The `context add` idea** — a one-line, hand-written description attached to a directory/
  collection, returned with every hit from under it. This repo's `references/index.md` already
  does something close (one line per source), but `vector-index/` and `knowledge-graph/` don't
  yet attach a per-collection description to their own chunks; worth doing before either grows.
- **Typed query routing** (lexical → keyword engine, semantic → vector engine, never cross-fed)
  is the right shape for `brain/`'s "keyword → score from INDEX.md" step if a semantic layer is
  ever added on top of it — keep the two paths separate rather than blending them into one score.

**Skip:** the local-GGUF-model stack (embedding + reranker + expansion models, `node-llama-cpp`)
is real infrastructure to run and maintain — a bigger bet than this repo's `brain/` needs today,
which is deliberately zero-model until the last step ("model once"). RRF fusion across two engines
only pays for itself once there are two engines; don't build it speculatively.

**Maps to:** L3 (`vector-index/`) is qmd's whole territory. If `vector-index/` ever needs semantic
search over a large corpus, qmd's architecture (not necessarily its code) is the reference design.

---

## 3. gbrain — Garry Tan (`github.com/garrytan/gbrain`, cloned and read `README.md` directly,
455 lines)

**What it actually does:** a personal-agent memory system ("give the agent you already use a
memory you control"), Bun-based, **not** on npm (its README explicitly warns the npm package
named `gbrain` is unrelated). Two axes: "brains" (databases — PGLite/Postgres+pgvector) and
"sources" (repositories inside a brain). Two optional layers on top of plain keyword/semantic
retrieval: a **synthesis layer** that returns actual cited prose instead of a list of chunks —
its README's worked example answers "what do I need to know before my meeting with Alice" with a
paragraph, three open items, and a citation per claim, plus an explicit **gap-analysis line**
("nothing's been added to the brain about Alice since April 22 — she may have replied through a
channel the brain doesn't see") — and a **typed knowledge graph** used for relationship queries
("who works at acme-example?"). The self-cleaning claim in the task prompt is real: background
cron jobs run "deduplication, citation fixes, and contradiction detection" overnight, and trusted
local writes auto-extract graph edges without an LLM call.

**Steal:**
- **The gap-analysis line.** Every synthesized answer names what it does *not* know and why (a
  channel the brain doesn't see, a stale source) instead of silently answering from what it has.
  This repo's HALT rules already say "report staleness instead of guessing" — gbrain's move is to
  make that a *visible line in every answer*, not just a rule to remember. Cheap to adopt at L2/L4
  synthesis time.
- **Cited synthesis over raw chunks** is the difference between `brain/`'s "open one file → best
  section" step and something a person can actually read — worth keeping that step's *output*
  framed as an answer-with-citation, not a pasted section.

**Skip:** the whole database-and-cron-daemon architecture (PGLite/Postgres, 66 cron jobs, a
155,795-page production brain) is built for Garry Tan's scale and multi-agent sharing model. This
repo's HALT rules explicitly forbid an always-on daemon making unreviewed writes to shared state
("Editing a live system prompt, a live task… outside an assigned region") — gbrain's autonomous
overnight consolidation is the opposite trust model from this repo's L1→L2→L3 graduation rule.
Don't import the daemon; import the *shape* of what it produces.

**Maps to:** L4 (`knowledge-graph/`) for the typed-graph piece, and the synthesis layer maps
across L2–L4 wherever this repo answers instead of pointing.

---

## 4. Graphify — (`github.com/safishamsi/graphify`, cloned; resolves to the `Graphify-Labs/graphify`
README, read directly, 962 lines) — **already installed** as a Claude Code skill building Steven's
Obsidian vault's knowledge graph

**What it actually does:** `/graphify .` maps a project (code, docs, PDFs, images, video) into a
knowledge graph instead of a set of files to grep. Code is parsed with **tree-sitter AST** —
deterministic, no LLM, nothing leaves the machine; docs/PDFs/images/video get a semantic pass from
the calling assistant's own model. Every edge is tagged **`EXTRACTED`** (found directly in the
source) or **`INFERRED`** (resolved by graphify) — the README's own framing: "you can tell what
was read directly from what was inferred." Explicitly **not a vector index** — no embeddings, a
real graph you traverse (shortest-path queries between two concepts, `graphify explain "X"`).
Output is three files: `graph.html` (interactive, force-directed), `GRAPH_REPORT.md` (key
concepts, surprising connections, suggested questions), `graph.json` (queryable without
re-reading source files) — and the README claims 71.5x fewer tokens per query on larger corpora
versus reading raw files.

**Steal:**
- **`EXTRACTED` vs `INFERRED` edge tagging** is the single most portable idea here, and directly
  fixable in this repo's own `knowledge-graph/` today regardless of Graphify's code: any edge this
  repo's L4 records should say whether a source stated the relationship or an agent inferred it.
  Right now `knowledge-graph/schema.md` (not read in this pass — out of scope, but worth a follow-
  up check) should be checked for this distinction if it doesn't already have it.
- **The graph is already there in Graphify's own framing** — "notes already form a graph; use the
  links" (the task's own note). Since Graphify is already running against Steven's Obsidian vault
  producing `graph.json`, the practical move for `brain/`'s "one pointer hop" step is to let it
  *read* Graphify's existing `graph.json` for a cheap, deterministic hop between two named entities
  — no new extraction, just reusing an artifact this repo's toolchain already produces weekly.

**Skip:** don't stand up a second, competing graph builder inside `brain/` — Graphify already runs
this job for the vault. Re-implementing tree-sitter/NetworkX/Leiden extraction inside `brain/`
would duplicate what's already scheduled and maintained.

**Maps to:** L4 (`knowledge-graph/`) directly — Graphify is the working implementation of this
level for the vault side; `brain/`'s pointer-hop step should consume its output rather than
re-deriving it.

---

## One line per level

| Level | What's already proven elsewhere that applies |
|---|---|
| L1 router | None of the four touch this — it's this repo's own invention (a router that holds no facts). |
| L2 wiki + `memory.md` | Karpathy's ingest/query/lint verbs; gbrain's gap-analysis line on synthesis. |
| L3 `vector-index/` | qmd's typed-expansion, two-engines-never-cross-fed design, if/when this repo needs semantic search over volume. |
| L4 `knowledge-graph/` | Graphify's `EXTRACTED`/`INFERRED` tagging, and reusing its `graph.json` rather than re-building one; gbrain's typed-graph relationship queries as a longer-term stretch. |
| L5 `always-on/` | gbrain's cron-based self-cleaning is the cautionary example, not the model — this repo's trust-graduation rule (L1→L2→L3, 7 clean runs) is the deliberate opposite of gbrain's always-write daemon. |

**Honesty note:** all four sources were read from their actual README/gist content (three via a
fresh clone, one via the gist's rendered page since the raw file is egress-blocked). No claim
above is from training-data memory of these projects; where a repo redirected (`safishamsi/graphify`
resolves to `Graphify-Labs/graphify`'s content) that's noted rather than silently treated as the
same thing.
