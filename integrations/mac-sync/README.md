# mac-sync — the "same information" half of two equal Macs

**Written 2026-09-24 (R6).** Steven, verbatim: *"Ensure both of my MacBooks can access the same information
and equally have control of this dashboard setup infrastructure."* The **lease**
(`integrations/omniroute-failover/claude-auto.sh` — `peer` role, `--take-lease`/`--release-lease`) is the
"equally have control" half. **This tool is the "same information" half**: a one-screen parity report, a
safe way to pull the brain repo, and names-only manifests either Mac can compare against the other's.

It is a plain bash script for Steven's own Macs. Nothing here is a cloud routine, an agent tool, or something
that runs unattended in this repo's sandbox — it is meant to be run, and scheduled, on the Mac itself.

## The four subcommands

```
mac-sync.sh status              # one-screen parity report for THIS Mac
mac-sync.sh pull                # git pull --rebase --autostash on the brain repo; refuses on a real conflict
mac-sync.sh export [--push]     # writes names-only manifests to mac-config/<machineId>/; commits locally;
                                 #   --push also pushes (the LaunchAgent uses this; a bare export never does)
mac-sync.sh diff [other-id]     # what THIS Mac lacks, vs the other Mac's last exported manifest
```

### `status`

```
$ integrations/mac-sync/mac-sync.sh status
mac-sync status — 2026-09-24T18:02:11Z — steves-macbook-pro

repo
  branch  main @ a1b2c3d
  behind  0   ahead  0
  dirty   0 file(s) not committed

role and lease
  role    peer (/Users/steven/.config/claude-runner/role)
  lease   ACQUIRED holder=steves-macbook-pro (cached, checked 4m ago)

vault (/Users/steven/Shearrill-Vault)
  sync    icloud

counts (this Mac)
  mcp-servers   15
  plugins       3
  skills        22
  runner-tasks  59

.env files (variable NAMES only — no value is ever read)
  omniroute/.env:OMNIROUTE_API_KEY
  omniroute/.env:OPENROUTER_API_KEY
  lofty/.env:LOFTY_API_KEY
```

**Expect:** `role` and `lease` match what `claude-auto --status` reports on the same Mac (this script mirrors
its exact role-file validation, so the two never disagree). `.env` lines are NAMES only — grep your own
output for a value and it will not be there; that is the point, not an accident.

**`skills` counts `~/.claude/skills`, the globally-installed set — not the 22 vendored in `.claude/skills/`
inside this repo.** The repo-vendored ones travel with git and are identical the instant both Macs are on
the same commit; they are not a sync problem. The globally-installed ones are exactly what can drift.

### `pull`

`git pull --rebase --autostash` on the brain repo, nothing more exotic. `--autostash` already carries a
plain dirty tree through the pull and restores it after — so this refuses only on a **real conflict** (the
rebase itself, or the autostash pop, hits overlapping edits), never merely because you have uncommitted work.

**Expect on success:** `mac-sync pull: pulled clean. <branch> @ <short-sha> (was <old-sha>)`, or `already up
to date` if there was nothing to pull.
**Expect on a real conflict:** exit 1, the conflict output, and the exact recovery commands (`git status`,
`git add`, `git rebase --continue` or `git rebase --abort`; if your own edits were auto-stashed and not
restored, `git stash list` / `git stash pop` too). Nothing is discarded — you always get your work back one
way or the other.

### `export`

Writes seven names-only manifest files plus `meta.txt` to `mac-config/<machineId>/` inside the repo, then
`git add`s and commits **that path only** — never `-A`. If nothing in the manifests changed since the last
export, it says so and makes **no** commit (`meta.txt` deliberately carries no live timestamp, so an
unchanged Mac produces an unchanged file, not a noise commit every run).

| File | What it names | Never |
|---|---|---|
| `mcp-servers.txt` | Server names from `claude mcp list` | a server's connection string or token |
| `plugins.txt` | Plugin identifiers from `claude plugin list` | — |
| `skills.txt` | Directory names under `~/.claude/skills` | any skill's body text |
| `runner-tasks.txt` | `name<TAB>cron<TAB>enabled`, from `runnerctl list` only | **a prompt — see below** |
| `launchagents.txt` | `com.stevenshearrill.*` labels from `launchctl list` | — |
| `env-vars.txt` | `relative/path/.env:VARNAME`, one per line | **a value, ever** |
| `tool-versions.txt` | `tool<TAB>version` for the CLIs this script already needs | — |
| `meta.txt` | This Mac's role and vault-sync method | a note, a path outside the vault's top level |

**Expect:** `mac-sync export: wrote mac-config/<id>/{...}.txt`, then either `committed locally (<sha>)` or
`no change since the last export — nothing to commit`, then `not pushed (pass --push, or 'git push'
yourself...)` **unless** you passed `--push`, in which case `pushed` (or a clear `push FAILED` line — your
local commit is never lost, only not yet visible to the other Mac).

**Why `export` does not push by default.** Writing files into the repo and committing them is local and
reversible. Pushing touches the shared remote both Macs — and anything else with a clone — read from. The
manual/interactive path stays conservative; the scheduled LaunchAgent below passes `--push` explicitly, so
automation is opt-in per invocation, not a default nobody chose.

### `diff`

Gathers **this Mac's live state** (the same lists `status` counts) and compares it against **the other Mac's
last exported manifest**, category by category, plus role and vault-sync method. Prints what this Mac
**lacks** — never the reverse, and never a full two-way diff dump.

**Expect, no gaps:** `mac-sync diff: no gaps found — this Mac has everything <other>'s last export listed`.
**Expect, a gap:** a `<category> — this Mac lacks:` block naming exactly what is missing, one per line.
**Expect, ambiguous:** if more than one other Mac has ever exported, it names them and asks you to pick one
(`mac-sync.sh diff <machine-id>`); if none has, it says so plainly rather than diffing against nothing.

## Runner task **definitions** (prompts) — manual, and why

This repo documents `claude-runner`'s **CLI surface** (`runnerctl status|list|run|dry|pause|resume|logs|
login|save-token|restart` — `docs/inventory/mac-task-descriptions.md`) and the **shape of its status output**
(`docs/inventory/mac-runner-status.md`, `runnerStatus`), but it does **not** document where or how
`claude-runner` physically stores a task's **prompt** — no file path, no database, no schema. Searching the
whole repo for it (2026-09-24) turns up only indirect references — e.g.
`docs/MASTER-FINDINGS.md`'s *"claude-runner task show strava-daily-sync (or the task's prompt file)"* — which
confirms a prompt lives *somewhere* claude-runner manages, and confirms nobody has written down where.

**That is why `export`'s `runner-tasks.txt` carries name, cron and enabled only, from `runnerctl list` —
never `runnerctl show`/`dry`/`logs`, which is where a prompt would actually appear.** Writing a script that
reads or writes task prompts without a documented, stable location to target would mean guessing at
`claude-runner`'s internals and risking exactly what `CLAUDE.md`'s HALT list forbids: **editing a live task**
based on a guess. So: **no scripted export/import of prompts. The exact manual steps instead:**

1. Run `mac-sync.sh diff` (after a `pull`) to see which task **names** the other Mac has that this one
   lacks — that is as far as automation safely goes.
2. For each missing task, check whether its prompt is already **version-controlled and paste-ready** in this
   repo: `integrations/mac-task-specs.md` and `routines/mac-task-repairs.md` carry exact, paste-ready prompt
   text for most of the 59 tasks, precisely because that text is operational (cron, tool calls, document
   shapes) and holds no client data — it was written to be copied, and copying it is not a guess.
3. For anything **not** covered by a repo spec (a task built ad hoc, directly in the runner UI or CLI, that
   never had its prompt written down anywhere else): open it on the Mac that has it (the desktop app's
   Scheduled section, or whatever `runnerctl`'s own inspection command shows you), read the prompt on
   screen, and type or paste it by hand into an identically-created task on the other Mac. Never pipe a
   prompt through a file this script writes, never commit one, and never let a task-creation step run
   unattended without you reading what it is about to create — the same rule that already governs every
   other live task edit in this codebase.
4. Re-run `mac-sync.sh export` on the Mac that now has the task, then `pull` + `diff` on the other — the gap
   should be gone from the **names** list, which is the only thing this tool ever claimed to prove.

If Steven wants a faster path than typing prompts twice: a **local bundle he AirDrops between the two Macs
himself** (never committed, never touching this repo, never leaving his own devices) is the one place a
"copy" step could legitimately live, since AirDrop is device-to-device with no third party and no git
history to leak a prompt into. This script does not build that bundle — it would need a real,
`claude-runner`-confirmed file location to zip up, which is exactly the fact this repo does not have. If that
location is ever documented (by Steven, from the actual Mac), a bundling step can be added here in an
afternoon; until then, guessing at it is worse than the manual steps above.

## Vault sync (`~/Shearrill-Vault`) — read-only detection, never note content

`status` and `diff` report how **this Mac's vault** is kept in step with the other one — `~/Shearrill-Vault`
by default (override with `MAC_SYNC_VAULT_DIR`), the same path `MAC-INSTALL.md` §0 and
`docs/SECOND-MAC-SETUP.md` use. Detection reads **paths and config file presence only** — it never opens,
greps or lists the contents of a note, and the one config file it does read
(`.obsidian/core-plugins.json`, an Obsidian-internal settings file, never a note) is checked for a single
plugin id, nothing else.

| Reports | Means |
|---|---|
| `no-vault` | Nothing at the vault path on this Mac at all |
| `local-only` | The vault exists but nothing below was detected — this Mac is the only copy |
| `icloud` | The vault (or a symlink to it) resolves inside `~/Library/Mobile Documents/` |
| `git` | The vault itself is a git repository |
| `obsidian-sync` | The Sync core plugin looks enabled (`.obsidian/core-plugins.json` or a `.obsidian/sync/` state dir) |
| combinations, e.g. `icloud+git` | More than one signal fired — reported together, never hiding one behind the other |

`diff` flags it whenever the two Macs' methods differ, or either one is `no-vault`/`local-only` while the
other has something — that is exactly the situation *"both Macs have the same information"* is not yet true
for the vault. **Deciding which method to use is Steven's call — it is not this script's to make, and one
option costs money.** The walkthrough and the decision itself: `docs/SECOND-MAC-SETUP.md` → *Your vault on
both Macs*.

## LaunchAgent templates — `pull` every 30 min, `export` daily

Two separate templates, not one: launchd runs a single job on a single cadence, and `pull`/30 min and
`export`/daily are genuinely different schedules, so forcing them into one job would mean the script itself
re-implementing scheduling logic launchd already does better.

- `com.stevenshearrill.mac-sync-pull.plist` — `StartInterval` 1800s (30 min), runs `mac-sync.sh pull`.
- `com.stevenshearrill.mac-sync-export.plist` — `StartCalendarInterval` 03:00 local, runs `mac-sync.sh export
  --push` (the push flag is set **only** in this scheduled copy — see *Why `export` does not push by
  default* above).

Both are templates: copy them out of the repo to `~/Library/LaunchAgents/`, then replace `__REPO_DIR__` (this
Mac's real checkout path) and `__HOME__` (your real home) — the full substitution command is in each
template's own header comment. **Never load the copy still inside the repo checkout** — edit the copy under
`~/Library/LaunchAgents/`, load that one.

```bash
mkdir -p ~/Library/Logs/mac-sync ~/Library/LaunchAgents
cd ~/Projects/second-brain   # or wherever this Mac's checkout actually is
for p in mac-sync-pull mac-sync-export; do
  cp "integrations/mac-sync/com.stevenshearrill.$p.plist" ~/Library/LaunchAgents/
  sed -i '' "s#__REPO_DIR__#$(pwd)#g; s#__HOME__#$HOME#g" ~/Library/LaunchAgents/com.stevenshearrill.$p.plist
  launchctl load ~/Library/LaunchAgents/com.stevenshearrill.$p.plist
done
```

**Expect:** `launchctl list | grep mac-sync` shows both labels; `~/Library/Logs/mac-sync/pull.log` gets a
line within 30 minutes (`RunAtLoad` also fires one immediately on load); `~/Library/Logs/mac-sync/export.log`
gets one right away too, ending `pushed` (or a clear `push FAILED` explaining what to check — nothing is
lost either way).

## Safety, restated

- **Names only, everywhere.** No `.env` value, no MCP connection string, no task prompt, no client name,
  phone number, loan amount or thread id ever lands in a manifest, a log line, or this script's own output.
- **`export` writes and commits locally by default.** Only the scheduled `export --push` pushes on its own;
  a person running `export` by hand always gets the conservative, local-only behavior.
- **`pull` never discards work.** It refuses on a real conflict rather than forcing anything, and tells you
  the exact commands to resolve it — the same discipline this repo's `git-workflow-and-versioning` skill
  already asks for.
- **Vault detection never reads a note.** Paths and config presence only, always.
