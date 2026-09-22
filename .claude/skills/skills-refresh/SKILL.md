---
name: skills-refresh
description: "Report-only audit of every SKILL.md reachable from this session: name/folder mismatches, dead file paths, oversize prompts, missing or overlong frontmatter, written as a dated markdown report with proposed fixes for a human to approve. Use for the weekly skills refresh, before adding a skill, or when a skill misfires. Never edits a skill."
---

# skills-refresh

The remote-session counterpart of the Mac's `skills-refresh-weekly` (Sunday, report-only; approved for the live schedule 2026-09-22). It keeps the skill tree honest by reporting, never by changing anything.

## Run
```bash
python3 .claude/skills/skills-refresh/audit.py \
  --roots .claude/skills ~/.claude/skills \
  --max-kb 16 \
  --out reports/skills-refresh/$(date -u +%F).md
```
Without `--out` it prints to stdout. Exit code is always 0.

## What it checks
| Finding | Why it matters |
|---|---|
| `name-mismatch` | frontmatter `name` differs from the folder: the skill triggers under one name and is filed under another (the Mac audit found 73) |
| `dead-path` | a file the SKILL.md points to inside its own folder that does not exist (219 on the Mac) |
| `oversize` | SKILL.md above the size cap; a long prompt costs tokens on every trigger (218 on the Mac) |
| `missing-frontmatter`, `missing-name`, `missing-description`, `long-description` | the skill cannot be routed, or its description will not trigger cleanly |

## After the run
1. Read the report. For each finding propose the smallest fix: rename the folder or the frontmatter; fix or drop the reference; move long material into `references/` and link it.
2. Present the proposals. Apply nothing without approval; approved fixes are ordinary edits in a normal session, one skill at a time, then re-run.
3. The report file is the record. Add a line to `context/decisions.md` only if a decision was taken.

## Scope
Roots default to the project's `.claude/skills` and `~/.claude/skills` (on remote sessions that includes the account's synced skills). The Mac's 169-agent skill tree is out of reach from here; that is the Mac task's job.
