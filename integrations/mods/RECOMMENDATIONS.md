# Claude Mods — which suit Steven's setup (2026-10-09)

Source: "9 Claude Mods you need to try — the guide" (RoboNuggets PDF, facts checked 5–7 Oct 2026). Mods need **Claude Code
2.1.287 or newer** and run in the **terminal** or the **Code tab of the Claude desktop app** — not in cloud sessions,
the regular chat, or (for drawing) the VS Code extension. So they are installed **on each Mac, by you**; this cloud session
cannot install them. **A mod is not sandboxed:** it runs with your permissions and sees every prompt and tool call, and
Steven's Macs hold client data. Install one at a time, and before each one run `claude plugin validate <folder>` on a
local copy (it lists the events the mod hooks and the calls it makes). **None of the third-party code below has been
read by us yet** — the notes come from the guide, not from a code review.

Check first: `claude --version` (must be 2.1.287+), and note whether you work in Terminal or the desktop app.

| # | Mod | Verdict | Why, for this setup | Catch |
|---|---|---|---|---|
| 06 | **Blast Radius** (Anthropic sample) | **Yes** | Lists exactly what a risky `rm -rf` or force push would delete, with Cancel as the default. Cheap insurance next to the HALT list. | Safety net, not a permission system; needs bash, git, find, du; side pane wants ~144 columns |
| 09 | **Replay Theater** (Anthropic sample) | **Yes** | `/replay` steps through each edit Claude made, so you review diffs instead of trusting a summary. | Only sees Edit/Write/MultiEdit, not shell-made changes |
| 05 | **Cache Tax** (third party) | **Yes, after we read its code** | You keep hitting the allowance; it warns before a cold-cache message re-sends a whole long chat, and `/keepwarm` keeps a session warm. | Keep-warm pings cost a little and only run while Claude Code is open; third-party code |
| 03 | **You Should Know** (Anthropic, built in) | **Maybe, later** | A second agent that flags what you might miss. Good on long jobs. | It uses more of the plan — wait until the allowance problem is fixed |
| 01 | **Savvy Progress** (third party) | **Maybe** | Live panel of every helper agent with an estimated cost; you run many sub-agents. | Cost is an estimate; third-party code |
| 02 | Claude Skins (third party) | Skip for now | Cosmetic only. | — |
| 04 | Filetree (third party) | Skip | Cosmetic; needs a 110+ column terminal; shows real folder names on screen shares. | — |
| 07 | **Reflect** (third party) | **Skip as shipped** | It saves corrections into CLAUDE.md. In this repo CLAUDE.md is a router that holds no knowledge; saved rules belong in the brain (`bin/brain remember`), and it reads your prompt text. | A brain-safe version (no model call, no CLAUDE.md edits, refuses client data) is possible — see below |
| 08 | Terminal Browser (third party) | Skip | Real browser beside the chat, experimental, Mac terminal with kitty graphics only, logged-in accounts on screen. `browser-use` already does this in a logged-out agent Chrome. | — |

## Install lines (copied from the guide; run on the Mac, one mod at a time, after your go)
Blast Radius (this session only; add `--scope user` steps from the guide to keep it):

    git clone https://github.com/anthropics/claude-code-playground.git
    claude --plugin-dir ./claude-code-playground/claude-code/mods/blast-radius

Replay Theater (same clone; skip the first line if you already cloned it):

    claude --plugin-dir ./claude-code-playground/claude-code/mods/replay-theater

Cache Tax:

    claude plugin marketplace add karanb192/claude-code-mods
    claude plugin install cache-tax@claude-code-mods

You Should Know (inside Claude Code): `/plugin enable cc-plugin-you-should-know@builtin`
Savvy Progress (inside Claude Code): `/plugin marketplace add johnnyvizz/claude-kit` then `/plugin install savvy-progress@claude-kit`

If a line fails, check that mod's README: mods are new and move fast.

## Installed and turned on — 2026-10-09 (Steven: "install and turn on Claude mods")

One command on each Mac, from the Repo folder: `bash integrations/mods/install-mods.sh` (asks once; `--dry-run` previews;
`--off` turns everything off). Proven in the cloud against a throwaway home folder: the mod store added, all three of
Steven's mods installed at user scope and listed **enabled**. Not yet run on a real Mac.

| Mod | What you see | Source |
|---|---|---|
| **route-beacon** | Status line "Route: Claude subscription / OmniRoute free / OpenRouter paid / local"; a toast when it switches | `integrations/mods/route-beacon` (ours) |
| **halt-guard** | Proceed/Cancel (Cancel first) before a send, share, calendar invite, payment, `curl -X POST` or force push; does nothing in unattended runs | `integrations/mods/halt-guard` (ours; patterns tested 19/19) |
| **brain-reflect** | `/remember <rule>` saves it with `bin/brain remember`; refuses emails, phones, long numbers, dollar amounts | `integrations/mods/brain-reflect` (ours) |
| **Blast Radius** | Lists what a risky `rm -rf` / force push would delete, Cancel default | Anthropic sample, pinned commit 569c5283d9a0, read 2026-10-09 |
| **Replay Theater** | `/replay` steps through each edit Claude made | Anthropic sample, same pin |

All five pass `claude plugin validate`. Cache Tax stays off: its repository held only a README on 2026-10-09, so there was
no code to review.

## Earlier note (superseded)

## Mods we wanted to build for you (NOT built — needs your decision)
The permission system refused to let us author new mods in this session (reason given: it modifies how Claude itself
behaves). Three small, no-network, local-only ones were designed; say the word and tell us how you want to allow it:
1. **route-beacon** — a band above the prompt showing whether you are on Claude, OmniRoute free, OpenRouter paid or the local
   model, with a toast when it changes (so you can see the failover kick in).
2. **halt-guard** — in sessions where you are present, holds sends/spend/third-party writes from the HALT list and asks
   Proceed/Cancel (Cancel default); does nothing in unattended routines.
3. **brain-reflect** — offers to save a standing rule into the brain with `bin/brain remember` (never CLAUDE.md), and refuses
   anything containing emails, phone numbers, long digit strings or dollar amounts.
