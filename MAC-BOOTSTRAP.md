# mac-bootstrap.sh — Steven's Mac setup in one command

Replaces the seven pastes of `integrations/mac-everything-2026-10-09.md`. Nothing here has run on a Mac yet.

## The one command

    cd ~/path/to/Repo && ./mac-bootstrap.sh            # start with: ./mac-bootstrap.sh --dry-run

It walks the phases below in order, asks yes/no before every consequential change (Enter = no), and ends with
one `=== MAC COMBINED REPORT <date> ===` block to paste back. Ctrl-C is safe; every phase can be repeated.

| # | Phase | What it does |
|---|---|---|
| 0 | preflight | Checks git, Homebrew, uv, Claude Code, Python 3.10+, runnerctl (only for the phases you selected); one-line fix for each gap |
| 1 | pull | `git pull --ff-only`; if it cannot fast-forward it stops with a plain message and changes nothing |
| 2 | harnesses | `./MAC-SETUP.sh --only cli-anything-harnesses`, then checks `lofty-cli leads timeline --help` lists `--v2` |
| 3 | runner | Asks, then **pauses** `openrouter-feeds-refresh`, `feeds-weekly`, `feeds-market-close`; shows `runnerctl list` |
| 4 | opus | Preview of the change list, asks, `--apply`, `--verify`; warns if `claude` is older than 2.1.280 |
| 5 | tools | browser-use, OpenDesign, API Anything: one yes/no each (two register an MCP server, one installs a skill) |
| 6 | whatsapp | Asks (iPhone next to you for the QR code), then `install-orca-whatsapp-laya.sh --skip-orca --skip-laya` |
| 7 | brain | `brain-sync --dry-run` preview, asks, real run; `doctor`; `bench --write`; Laya MCP (asks); brain-maintenance task **proposed only** |
| 8 | graph | Prints the one-line Claude Code instruction (not run by the script) |
| 9 | report | Prints and saves the report block |

Optional phases, off unless you ask (`--also zoho,lofty,connections`, or `--only`):

| # | Phase | What it does |
|---|---|---|
| 10 | zoho | Creates an **empty** `~/.config/zoho/.env` (mode 600) holding only the names `ZOHO_ACCOUNTS_URL ZOHO_API_URL ZOHO_CLIENT_ID ZOHO_CLIENT_SECRET ZOHO_REFRESH_TOKEN`, and prints guidance |
| 11 | lofty | Same for `~/.config/lofty/.env` with `LOFTY_API_KEY` (Lofty itself is already connected) |
| 12 | connections | Asks, then runs `integrations/cli-anything-harnesses/connect.sh` (homes.com, ShowingTime, Showami, SkySlope, zipForms status check; it never signs in) |

You type the key values into those files yourself, in a text editor. The script never asks for a value, never
reads one out, never prints one, and never rewrites a file that already exists.

## Flags

    --dry-run            print every command, change nothing (writes no log, no report file)
    --only <phase>       just that phase (name or number; repeatable or comma-separated)
    --skip <phase>       leave a phase out
    --also <phase>       add an optional phase (zoho, lofty, connections)
    --with-claude        after the report, offer to start Claude Code with the ISA-KPI paste block
                         from integrations/mac-fix-isa-kpi-2026-10-08.md as its first message
    --list / --help
    --yes-runner --yes-opus --yes-tools --yes-whatsapp --yes-brain --yes-laya --yes-claude --yes-connections
                         pre-answer ONE question. There is no blanket --yes.

Exit code: 0 nothing failed, 1 a phase failed, 2 usage error or a REFUSED name, 3 something forbidden was about to run.
Logs: `~/Library/Logs/vanessa-setup/bootstrap-<date>.log`; report: `bootstrap-<date>.txt` (a second run the same day gets `-2`).

## What it will never do

- log in to anything, run `runnerctl login` / `save-token`, or ask for a key value
- delete, add, edit or run a runner task (it only pauses the three named ones, after a yes)
- overwrite a hand-edited skill (brain-sync refuses; the bootstrap never runs its "replace" commands)
- run `brain-sync` for real if the Repo folder has diverged from the server (that script rebases)
- install anything on MAC-SETUP.sh's REFUSED list (same list, checked by the tests), `rm -rf`, or `sudo`
- touch a client-facing system, send anything, or spend money
- put a key, token, lead or client detail in the report (key-shaped strings are also redacted from the log)

## Tests

    ./mac-bootstrap-tests.sh        # 179 checks, stubbed git/brew/uv/runnerctl/claude/node, fake Repo folder
