# Skill-pack imports (77skills.ai and similar)

## Status

77skills.ai sells a $77 pack of 77 business-skill `SKILL.md` folders. **Not purchased.** This is
the safe import path for whenever Steven drops the ZIP in — the importer and this doc are ready
before the pack exists in this repo.

## The flow

```
python3 integrations/skill-packs/import_pack.py <zip-or-dir> --pack 77skills
```

1. **Dry run (default).** Finds every `SKILL.md` in the pack, validates its frontmatter (`name`
   + `description` present), checks its name against every skill already under
   `.claude/skills/*/SKILL.md`, and scans every other file in that skill's folder for anything
   that needs a security review before it runs on Steven's machine: a script extension
   (`.sh`/`.py`/`.js`/`.applescript`), a shebang line, `curl|wget` piped straight to a shell, a
   network call, an `rm -rf` pattern, or a path under `~/.ssh` or `~/.aws`. Nothing is copied.
   It also flags an unusually long `description` (over 600 characters) as a token-cost warning —
   not a security issue, so it doesn't block anything.
2. **Read the report.** Printed to the terminal and written to
   `integrations/skill-packs/reports/<pack>-<date>.md`: which skills are clean, which are
   blocked and why, which descriptions are oversized.
3. **`--apply`.** Re-run with `--apply` to copy ONLY the clean skills to
   `.claude/skills-staged/<pack>/<name>/` — a staging area, never the live `.claude/skills/`.
   A blocked skill is never copied, `--apply` or not.
4. **Promotion is a human step.** ECC (Elena) security review, then Steven's go-ahead, one skill
   at a time, before anything moves from `.claude/skills-staged/` into `.claude/skills/`. This
   script never does that move itself.

## Why not load all 77 at once

Every skill's `description` sits in every session's context whether or not that skill is ever
used — that's how Claude Code decides which skill to invoke. 77 extra descriptions is 77 extra
line items paid on every single session, every single question, forever. At roughly **30-60
tokens per description** (the range this task itself was scoped with), 77 skills costs
**~2,300-4,600 tokens of standing context** before a single one of them does any work — repeated
on every turn of every session, not a one-time cost.

Steven's actual lanes are narrow: mortgage/real-estate sales, marketing, finance ops. A generic
77-skill business pack likely has a handful that fit and dozens that don't (HR onboarding, legal
ops, e-commerce, and so on, if the pack is as broad as "77 business skills" suggests). The
recommended path is **promote only the handful that match those three lanes**, leave the rest
staged (or delete them from staging), and re-run the importer against a trimmed selection if
Steven wants to reconsider later. Staged-but-unpromoted skills cost nothing — only what's under
`.claude/skills/` is ever loaded into a session.

## Self-test (not committed)

The importer was exercised against a temporary fake pack with three skills — one clean, one with
a `install.sh` containing a shebang, a `curl | bash` pipe and an `rm -rf`, and one whose `name`
collided with this repo's existing `git-workflow-and-versioning` skill — run in dry-run mode.
It correctly found 1 clean / 2 blocked, with the exact reasons above attached to each blocked
skill, and copied nothing. The fake pack and its test report were deleted afterward; they never
lived in this repo. See the task's final report for the captured output.

## Files

- `import_pack.py` — the importer (stdlib only).
- `reports/` — dated reports land here after each run (`.gitkeep` holds the empty directory).
