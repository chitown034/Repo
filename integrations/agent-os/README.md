# Agent OS — turn it on for Mac 1, Mac 2 and the Alienware

Every roster agent (172) reachable through **Laya** (lane), **Jarvis** (recall) and **Orca** (launch), run as one
operating system the way the org chart describes. Design and commands: `wiki/ai-team/agent-os.md`.
Built 2026-10-12 in the cloud sandbox. **Not yet run on any of your computers** — these installers are read-only by
default and were tested here only against a throwaway home folder.

## On each Mac (do this on Mac 1, then on Mac 2)

1. Open **Terminal** (Cmd+Space, type Terminal, Enter).
2. Paste, press Enter:
   `cd ~/Repo && git fetch origin && git checkout claude/stoic-cori-pvn3f8 && git pull && bash integrations/agent-os/install-mac.sh --apply`
   (If your repo folder is somewhere else, `cd` into it first.)
3. Read the result. `WARN` lines each name the one command that fixes them (install Laya, install Orca, pair Jarvis).
   `FAIL` means a missing basic (Claude Code, Python 3.10+). Nothing is installed, paired or logged in for you.
4. Pair the two Macs and the phone in Orca once: `bash integrations/remote-control/orca-remote.sh serve`
   (the pairing link is a secret — never paste it into a chat or file).

## Connect Orca and Laya (each Mac)

`bash integrations/agent-os/connect-orca-laya.sh` shows what it would do; add `--apply` to do it. It installs Laya if
missing, registers Laya with Claude Code (`claude mcp add laya`), runs one routing test, checks Orca and prints the
two pairing commands. Pairing itself is yours: the link is a secret you paste only into the hidden prompt.

## On the Alienware PC

1. Open **PowerShell** (Start menu, type PowerShell, Enter). If you have not run `integrations\alienware\alienware-setup.ps1` yet, run it first (Ollama, Bonsai, Orca, Laya).
2. Paste, press Enter:
   `cd $HOME\Repo; git fetch origin; git checkout claude/stoic-cori-pvn3f8; git pull; powershell -ExecutionPolicy Bypass -File integrations\agent-os\install-alienware.ps1 -Apply`
3. Read the result the same way. The script never changes the execution policy and never installs anything.

## Use it (any of the three)

`brain os run "prepare a VA loan scenario in Temecula"` prints the Laya lane, the Jarvis recall line and one
`claude --agent <slug>` line per agent to paste into its own Orca worktree (at most 8 at once), then the gates.
`brain os check` is the health test; `bin/brain loop` runs it weekly and flags any agent that drops out.

## What it will not do

Install, log in, pair or spend; send anything to a client; decide a licensed matter; edit a live prompt or task.
The Windows script was only syntax-checked here, never executed on Windows.
