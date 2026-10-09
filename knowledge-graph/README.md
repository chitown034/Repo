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
