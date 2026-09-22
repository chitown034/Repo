# Agents — Codex and other agents start here

This mirrors `CLAUDE.md` (canonical) so any agent gets the same router. Codex: also read `memory.md` for memories from earlier sessions before you start.

---

# Router — read this first, every session

This file routes; it does not hold knowledge. Follow the rule that matches and read only what it points to. If you catch yourself asking Steven for context you should already have, a routing rule below is missing: say so and propose the rule.

## Routing rules
- Steven, his businesses, how he works, standing rules → `context/about-me.md` (short, always true).
- Any decision already made, or before making a new one → `context/decisions.md` (dated log; append new decisions with the date), then the Second Brain below for the full record.
- The AI Team — Vanessa, the C-suite, the roster (172 agents live), model policy, dispatch rule, knowledge fabric, channels, Orca → `wiki/ai-team.md`. Concept index with links → `wiki/index.md`.
- Ongoing work → `projects/` (`projects/README.md` lists one file per project).
- Memories from earlier sessions → `memory.md` (Claude Code auto-memory writes here once `/memory` is enabled; Codex reads it too).
- Before dispatching work: `interview-me` on an ambiguous request, `prompt-optimizer` (alias prompt-master) on every brief, `skills-refresh` to audit skills (report-only). Project skills live in `.claude/skills/`.

## The Second Brain (Notion) is the system of record
- Database "Second Brain": https://app.notion.com/p/e767daccebf6434d828b5818414ef495 — data source `collection://8a8d48a6-41a9-4077-a08b-8c29c256dae0`. Search it with the Notion connector before answering anything about the business, the team, or the architecture. `Summary` is the retrieval field; `Type` is Note / Source / Decision / Process / Reference / Idea.
- Say plainly when the brain has nothing; never answer from general knowledge and imply it came from the brain.
- Capture rule: only what Steven confirms is durable goes into the brain. Fetched or generated content goes in the answer, not the brain.

## Full context beats chunks
For anything that needs the whole document — summarizing a call, a rule set in order, a contract — read the source whole. Semantic search (Notion search here; Jarvis, Ruflo and Graphify recall on the Mac) returns top matches, never the document.

## Not reachable from a remote session
Web sessions run in Steven's Claude Cloud. The Mac-side stack is out of reach: `~/Applications/local-bridge/run.sh recall`, Jarvis, Graphify, Ruflo (`vanessa-ops-graph`), the Obsidian vault, `~/.claude/skills/vanessa-orchestrator`, claude-runner scheduled tasks. From here the brain is Notion; do not fabricate the Mac stores.

## Standing rules (never override)
- The AI Team is draft-only: agents never send, sign, spend, book, trade or quote.
- Model policy: Vanessa alone on Fable 5.1 masterminds; research and judgement seats run Opus 5; everything else Sonnet 5; research goes only to Perplexity seats.
- Client and deal folders are counted, never named, in any phone-sized answer.
- Systems of record: CRM (Follow Up Boss, Zoho) for leads; ARIVE and Zoho for loan data; TransactionDesk for transaction documents; the calendar for availability; Notion for cross-system context, decisions, SOPs and dashboards — not for everything.

## Housekeeping
- `AGENTS.md` mirrors this file for Codex; this file is canonical — change both.
- On remote sessions `.claude/hooks/session-start.sh` builds the `orca` CLI (stablyai/orca) at start.
- `requirements.txt` (laya) and `securo/` (vendored app) are separate installs; see `README.md` and `projects/installs.md`.
