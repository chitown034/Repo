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

## Tools and candidates (2026-09-28)

Same four facts as any other row here — **no content copied, pointers only.**

| Source | What it is | How current | Why you would open it |
|---|---|---|---|
| **Laya** | `integrations/laya/` in this repo (the built package); upstream `github.com/NandhaKishorM/laya` (Apache-2.0, Convai Innovations), docs at `nandhakishorm.github.io/laya`, model `convaiinnovations/laya` on Hugging Face | 0.3.21, cloned `$S/r11/laya` 2026-09-28; **installed and proven in the R11 sandbox only — not on the Mac.** Hugging Face is blocked from this sandbox; see `integrations/laya/README.md` | Before changing `router-questions.json` or `laya_route.py`, or before running `integrations/laya/install.sh` on the Mac |
| **Orca** | `github.com/stablyai/orca` (MIT) — "the AI Orchestrator": runs Claude Code and Codex side by side in worktrees, with an iOS/Android **mobile companion** to monitor and steer agents | Mac reports **v1.4.220 — unverified from the cloud** (its own 2026-10-05 snapshot; v1.4.203 on 2026-09-16) (F-V2-23; confirm with Section 3 of `integrations/mac-fix-all-2026-10-05.md` — `./mac-verify.sh` has no Orca check) | Before wiring the mobile companion as the phone view for parallel sub-agents — see `OPTIMIZATION.md`'s dispatch layer and `REMOTE-ACCESS.md` |
| **77 Skills** (77skills.ai) | 77 business-principle skills as Markdown, packaged for Claude Code; **one-time purchase, no subscription** | **Candidate only, 2026-09-28.** `77skills.ai` is egress-blocked from this sandbox — not read, contents unverified | Only after Steven decides to buy it (**HALT: spends money**); then `skills-refresh` plus an ECC security review, before anything from it is enabled |

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
