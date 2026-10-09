# OpenDesign — design workspace driven by Claude Code (added 2026-10-08)

Steven, 2026-10-08: *"also install https://github.com/nexu-io/open-design.git"*.

**What it is.** An open-source (Apache 2.0) design workspace: you write a brief, pick a template and a design
system, and a coding agent — Claude Code here — builds the prototype, deck or page, with live preview. It runs as a
local daemon plus a web app on your own Mac (127.0.0.1 only). Version **0.23.1**, pinned to commit `53231d4`.

**Where it stands (2026-10-08).**

| Place | State |
|---|---|
| Cloud sandbox | Installed with Node 24.21 and pnpm 10.33.2 and started: daemon `/api/health` answered `ok`, the web app returned 200, and Claude Code showed as an available engine. pnpm skipped native build scripts that upstream does not allow-list (node-pty and others); the daemon and web app ran without them. |
| Steven's Mac | **Not installed yet — one command, below.** Nothing here has run on a Mac. |

## Steven: one command on the Mac

    git pull && bash integrations/open-design/install-mac.sh

It installs Node 24 through `fnm` (your other Node stays as it is), downloads OpenDesign to
`~/Applications/open-design`, installs it, and runs a health check. Then:

    bash integrations/open-design/install-mac.sh start      # prints the web address to open
    bash integrations/open-design/install-mac.sh stop

On first load choose **Don't share** on the privacy banner and pick **Claude Code** as the engine.
Undo: `rm -rf ~/Applications/open-design`.

## Rules

1. **Built from source, analytics off.** Upstream's PRIVACY.md: builds without its telemetry credentials send
   no analytics. Still answer *Don't share* on the banner.
2. **No paid plans.** OpenDesign Go and OpenDesign Cloud are paid accounts — HALT (spends money); never sign up.
3. **No client data in briefs.** Designs go through Claude Code to the cloud model; keep client names, loan
   figures and addresses out. Marketing pieces go to Sofia, compliance review to Alexandra, before any use.
4. **Nothing published from it** to a client-facing place without Steven's approval.

Owner: Derek (automation). Upstream: <https://github.com/nexu-io/open-design>.
