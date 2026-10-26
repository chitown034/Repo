# Claude Code mods for Steven's VANESSA setup

Three mods (function-hook plugins) that keep the automation safe and one keystroke away:

- **vanessa-hq** — a VANESSA HQ pane beside the chat (dashboards, one-press workflows, scheduled tasks, recent runs), slash commands `/vanessa`, `/morning-launch`, `/lender-digest`, `/lender-shop`, `/deal-intake`, `/squad`, `/zoho`, `/research`, `/book-consult`, `/global-week`, `/brand-check`, `/consult-prep`, `/sync-dashboards`, `/dash-status`, a status line, and Steven's standing rules added to every turn (merge onto live dashboards, keep PPFC data out of this public repo, drafts-only, LO comp rule, work in parallel).
- **drafts-only-guard** — blocks connector tools that send, forward, reply, post, trash or delete; `/allow-send [n]` lets the next n through. Tested in `tests/guard.test.ts`.
- **public-repo-guard** — refuses `git commit` / `git push` in `/home/user/Repo` when PPFC Trainual data would land in this public repo.

Load one in Claude Code with `claude --plugin-dir mods/<name>` (or copy it into a session's mods folder). Check with `claude plugin validate mods/<name>`.

## Brain 6D uses a shared database

Brain 6D keeps its frequently-added content (VANESSA pages, Encyclopedia/search entries, AI seats, build-log lines) in the artifact's shared database (collections `brain_pages`, `brain_enc`, `brain_seats`, `brain_log`). Sessions and mods add to it with the `ArtifactData` tool instead of republishing the whole page, so parallel sessions can no longer overwrite each other. The page merges the database into its built-in content on load and live; the built-in copy is the fallback. Never republish the whole page just to add content. Schema and exact calls: `vanessa/docs-brain6d-db.md`.
