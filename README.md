# Repo

Steven's working repo: the router into his Second Brain for remote Claude Code and Codex sessions, plus the tools installed through it.

## Start here
`CLAUDE.md` (Claude Code) and `AGENTS.md` (Codex) load automatically and route to everything else:

| Path | What |
|---|---|
| `context/about-me.md` | Always-true background, standing rules, systems of record |
| `context/decisions.md` | Dated decision log and open items |
| `wiki/index.md`, `wiki/ai-team.md` | Concept index and the AI Team (org chart, models, knowledge fabric) |
| `projects/` | One file per ongoing project |
| `memory.md` | Auto-memory (enable with `/memory` in the CLI) |
| `.claude/skills/` | Project skills: `interview-me`, `prompt-optimizer` (alias prompt-master), `skills-refresh` |
| `reports/skills-refresh/` | Weekly report-only skill audits |

The system of record is the Second Brain database in Notion; this repo only routes to it.

## Installs
See `projects/installs.md`: Codex plugin and Orca CLI hook (`.claude/`), `laya` (`requirements.txt`), and `securo/` (vendored self-hosted finance app — `cd securo && docker compose up --build`, then http://localhost:3000; keep real `.env` files and `secrets/` out of the repo).
