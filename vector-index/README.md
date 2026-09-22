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

| Component | Role | Status 2026-09-22 |
|---|---|---|
| Jarvis (OpenJarvis `memory.db`) | Local index and on-device voice | **1,760 documents** indexed |
| Graphify embeddings | Embeddings alongside the graph in `vault/60-Knowledge` | Graph built 2026-09-13 |
| Ruflo | Research-and-memory bench; weekly graph summaries | **238 entries** |

Counts are from the `knowledgeFabric` doc, stamp 2026-09-22 04:05 UTC. **There is no separate
production vector service in this repo** — this directory is the specification and the rules; the
serving is done by the three components above, on the Mac. Do not describe it as more than that.

## Freshness

Re-embed on change, not on a schedule. A corpus whose source changed and whose index did not is the
one failure mode that produces a confident, cited, wrong answer. The index manifest records
`{corpus, docs, chunks, model, dim, builtAt}`; `brain-weekly-verify` checks `builtAt` against the
source's own stamp and raises a stale-store alert. See `always-on/README.md`.
