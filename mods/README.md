# Claude Code mods for Steven's VANESSA setup

Three mods (function-hook plugins) that keep the automation safe and one keystroke away:

- **vanessa-hq** — a VANESSA HQ pane beside the chat (dashboards, one-press workflows, scheduled tasks, recent runs), slash commands `/vanessa`, `/morning`, `/lender-digest`, `/lender-shop`, `/deal-intake`, `/squad`, `/sync-dashboards`, `/dash-status`, a status line, and Steven's standing rules added to every turn (merge onto live dashboards, keep PPFC data out of this public repo, drafts-only, LO comp rule, work in parallel).
- **drafts-only-guard** — blocks connector tools that send, forward, reply, post, trash or delete; `/allow-send [n]` lets the next n through. Tested in `tests/guard.test.ts`.
- **public-repo-guard** — refuses `git commit` / `git push` in `/home/user/Repo` when PPFC Trainual data would land in this public repo.

Load one in Claude Code with `claude --plugin-dir mods/<name>` (or copy it into a session's mods folder). Check with `claude plugin validate mods/<name>`.
