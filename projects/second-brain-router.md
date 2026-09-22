# Second-brain router (this repo)

**Status 2026-09-22:** built on `claude/admiring-planck-u1qu64`; needs a merge into the default branch to auto-load for every session.

## What it is
The five-level framework's Level 1 (router: `CLAUDE.md` / `AGENTS.md`, `context/`, `projects/`) and Level 2 (wiki: `wiki/`, `memory.md`) for any Claude Code or Codex session on this repo, wired to the Second Brain in Notion as the system of record. Levels 3–5 (Jarvis vector search, Graphify knowledge graph, skills-refresh-weekly governance loop) already run on the Mac and are documented in `wiki/ai-team.md`, not rebuilt here.

## Why
A remote session on this repo had no routing at all; the Second Brain was only found by searching Notion on a hunch. The framework's failure mode exactly: the agent asking for context it should already know.

## Pieces
- Router: `CLAUDE.md` (canonical), `AGENTS.md` (Codex mirror).
- Context: `context/about-me.md`, `context/decisions.md`.
- Wiki: `wiki/index.md`, `wiki/ai-team.md`. Auto-memory: `memory.md` (enable with `/memory`).
- Skills: `.claude/skills/interview-me`, `.claude/skills/prompt-optimizer`, `.claude/skills/skills-refresh` (+ `audit.py`).
- Loop: weekly report-only skills-refresh Routine → `reports/skills-refresh/<date>.md`; proposals need a human before anything changes.

## Next
1. Merge this branch into the default branch so the router loads automatically.
2. Save the three `.skill` files to the profile so they follow Steven into every session, not just this repo.
3. Run `/memory` once in the CLI to switch on auto-memory.
