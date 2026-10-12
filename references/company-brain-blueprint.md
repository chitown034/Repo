# Company Brain Blueprint (AI Horizon / @gobi_automates) — mapped onto Steven's second brain

**Source:** `Company_Brain_Blueprint_AI_Horizon.docx` in Steven's Google Drive (read through the Drive connector 2026-10-12; a
public course flyer, not client material). Its one-sentence architecture: *files are the source of truth; a vector database
retrieves meaning; an entity graph captures relationships; a cache keeps high-value context close; agents execute on top.*
It ends with a paid community link (skool.com "AI Horizon") — **not joined; spending is Steven's call (HALT).**

## Layer by layer — what the blueprint asks for and what this brain already has

| Blueprint layer | What it asks for | This brain, as of 2026-10-12 | Gap |
|---|---|---|---|
| 1. Files as source of truth | A readable folder tree per department; repeatable jobs as workflow files | `wiki/`, `projects/`, `context/`, `memory.md`; 29 skills in `.claude/skills/` plus 172 agent files in `integrations/agent-os/agents/`; CLAUDE.md routes to one leaf | Department folders are by *topic* (mortgage, real-estate, ai-team, dashboard-ops), not by seat; fine — the dispatch planner maps seat → folder |
| 2. Vector database | Chunk + embed documents; retrieve passages | `vector-index/README.md` is a **spec**: which corpora qualify (transcripts, disclosures, playbook bodies) and which never do (`wiki/clients/**`, decisions.md, anything with PII). Not built. Level 3 of recall, by design | **Open.** Build only for the four playbooks (~1,700 pages) first; never client pages |
| 3. Entity graph | People, projects, tools, clients, decisions as typed relationships | Graphify in the Obsidian vault (750 nodes / 1,104 edges, built 2026-09-13); schema and entity stubs in `knowledge-graph/`; `bin/brain graph` draws the page-level graph the 6D view shows | Running on the Mac, stale (Sept 13); weekly Ruflo summary is the cheap read |
| 4. Context cache | Brand rules, current projects, offers, constraints, agent instructions kept warm | `recall-cache.md` (TTL 4 h / 24 h), `memory.md` (100-line cap), `INDEX.md` one line per page, Laya's zero-token routing | Matches; the cache is the brain's cheapest level and is enforced |
| 5. Agent runtime | Specialised agents retrieve shared context, call tools, write outcomes back | Agent OS: `bin/brain ask` (retrieve, auto-escalate), `bin/brain route` (lead + joins + gates + HALT), `bin/brain os run` → Orca sessions, `bin/brain remember` (write back) | Matches. The blueprint's "124 workers, one brain" is this repo's "172 seats, one router" |

## The blueprint's agent loop, as it runs here

| Blueprint step | Here |
|---|---|
| 1 Receive task | `bin/brain route "<task>"` names the lead seat, who joins, the gates and any HALT |
| 2 Read workflow file | the seat's starting page (`wiki/ai-team/cross-functional.md` "Starts from") or a skill |
| 3 Retrieve company context | `bin/brain ask` — level 1 one section, level 2 several, level 3 queue research |
| 4 Resolve related entities | `bin/brain related`, the 6D seat lens, Graphify summary via Ruflo |
| 5 Use cached high-value context | `memory.md`, `recall-cache.md`, INDEX line |
| 6 Call tools | the capability matrix (`wiki/ai-team/capability-matrix.md`): browser hands, loan agents, scout, trading desk |
| 7 Produce output | through the gates: Alexandra (client-facing), ECC (changes), Vanessa last |
| 8 Write the outcome back | `bin/brain remember "<fact>"` — index updated in the same step; the secret guard refuses keys |

## The "build challenge", answered for one department

The blueprint says: prove it with one department and one agent before building the whole brain. The department here is
**Sofia's growth/marketing lane**, because it has the clearest repeatable jobs and the most workflow files already.

| # | Challenge step | Status here |
|---|---|---|
| 1 | Choose one department | Sofia (CMO): content, campaigns, social |
| 2 | 10 repeatable workflow files | 50 marketing skills (coreyhaines, drafts only) + Instagram/LinkedIn/YouTube packs + humanizer, all in `install-mac.sh`; `skills-refresh` audits them weekly |
| 3 | Index the files into a vector DB | **not done** — and not needed for skills (they are short); the playbooks are the first real candidate |
| 4 | Extract entities and relationships | Graphify (Mac) + `bin/brain graph`; marketing entities (channels, offers, partners) are thin — a `knowledge-graph/entities/` pass is the gap |
| 5 | Cache frequently reused context | brand facts live in `context/about-me.md` and the deck's bio cards; a one-page `wiki/real-estate-playbooks/brand-voice.md` would close it |
| 6 | One agent with shared memory and tools | `claude --agent cmo-sofia` (generated file) + the gates; Orca shows it |
| 7 | Run one real task end to end | **waiting on the Mac** (paste A) |
| 8 | Write the outcome back | `bin/brain remember`, then the weekly loop re-tests |

## What this brain does differently, on purpose

- **Clients are never vectorised or graphed** (CLAUDE.md HALT; `vector-index/README.md`). The blueprint has no such rule; a
  mortgage broker's brain must.
- **One leaf per question, cache before store, store before sweep** — the blueprint's "cache" layer is this brain's whole
  token discipline, measured every loop (`docs/reports/BRAIN-LOOP.md`).
- **Proposal-only seats and licensed decisions stop at a Needs-Steven packet** — the blueprint's step 7 "produce output" has
  no gate; here Alexandra and Vanessa are gates by rule.

Register line: `references/index.md`. Owner: Nadia (AI tooling) with Elon for anything built from it.
