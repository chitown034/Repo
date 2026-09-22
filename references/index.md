# References — the register of source documents

This is a **register, not a library.** It records what a source is, where it lives and how current it
is. It never holds the content. A page here is a pointer plus enough description that a router can
decide whether opening the source is worth the tokens.

## Playbooks (digitised, 2026.1 editions, ~1,700 pages combined)

| Source | Pages | What it decides |
|---|---|---|
| The Ultimate Mortgage Broker SOP | 221 | The ARIVE-platform loan flow, end to end |
| The VA Loan Mastery Playbook | 362 | VA deal structuring — the core of the book of business |
| The Complete Loan Programs Mastery Playbook | 526 | Program-selection decision trees |
| The Ultimate Realtor Playbook | 602 | The SPACE / LPT operating manual |

Only extracted content is on the deck. These are the **primary** source for any program or process
question — cite the playbook and the chapter, and say when you are working from the deck's extract
rather than the full document.

## Live systems (pointers, not stores)

| System | What it is | Where its state is reported |
|---|---|---|
| Command Deck | The dashboard artifact | `projects/command-deck.md` |
| ISA Portal | The ISA-facing artifact | `projects/isa-portal.md` |
| Obsidian vault | Visual layer + Jarvis's index source (`50-AI-Team`, `60-Knowledge`, `70-Briefs`) | `OPTIMIZATION.md` |
| Notion Second Brain DB | **The record.** Synced by `brain-deck-sync` | `always-on/README.md` |
| Jarvis (OpenJarvis `memory.db`) | Local index + on-device voice | `vector-index/README.md` |
| Graphify | The knowledge graph in `vault/60-Knowledge` | `knowledge-graph/README.md` |
| Ruflo | Research-and-memory bench; weekly graph summaries | `OPTIMIZATION.md` |

## External directories (pointers only)

| Source | What it is | How current | Why you would open it |
|---|---|---|---|
| openalternative.co/alternatives/ | A public directory of open-source alternatives to commercial software (Steven's description; site egress-blocked from the cloud on 2026-09-22, not yet read) | Live site, unverified | When a paid SaaS comes up for renewal, or CTO Innovator wants a self-hosted option. Nothing to install. |

## Registering a source

One row, four facts: **what it is · where it lives · how current · why you would open it.** If you
cannot write the last one in a clause, it does not need registering.

## Rules

- **No content is copied here.** A register that grows content becomes a fourth copy to maintain.
- **No credentials, no URLs with tokens, no account identifiers.** Name the system; the key lives in
  the Mac keychain or a `.env` that is never read into a prompt.
- **Version and date everything.** "2026.1 edition" and "synced 2026-08-28" are part of the fact.
- A source that nothing has opened in a quarter gets a note, not a deletion — knowing something is
  unused is itself useful to the weekly loop.
