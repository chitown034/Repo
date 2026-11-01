# Computer Hub — reaching every computer

Written 2026-10-11. Steven's computers: **Mac 1**, **Mac 2**, the **Alienware PC**, plus a tablet and phone. Each gets the same three doors.

| Door | What it gives | How | Where it lives |
|---|---|---|---|
| Claude Remote Control | The Claude Code session on that computer appears in the session list at claude.ai/code and on the phone | `claude remote-control`, then `rc-agent.sh install` (Mac) | `integrations/remote-control/` |
| Orca | All the AI agents on that computer, paired over a private network | `orca-remote.sh serve` / `pair` (Mac), `alienware-setup.ps1 -Action OrcaServe` / `OrcaPair` (Windows) | `integrations/remote-control/`, `integrations/alienware/` |
| AnyDesk | The whole screen, keyboard and mouse | Macs: `connect-all.sh` step 6d (official Homebrew cask, prints the ID); Alienware: one `winget` line; tablet/phone: App Store / Google Play — all in `integrations/anydesk/README.md`. ID saved in the Computer Hub card; `integrations/anydesk/anydesk-links.py` | `integrations/anydesk/` |

The dashboard card is Panel 40 on Toolkit & Remote Access. Ticks and AnyDesk IDs stay in that browser only.

## Alienware PC (Windows) — local AI
`integrations/alienware/alienware-setup.ps1` checks and installs, asking y/N before each change: Orca, Laya (`laya[serve,mcp]` 0.3.21 in its own venv), Bonsai 2 27B through PrismML's own Bonsai-demo (pinned commit), optional Ollama with the community `MichelRosselli/bonsai-27b` upload (unverified), AnyDesk and Tailscale. `-Action Doctor` is read-only; `-Action Report` prints one status line for the dashboard. It has **never run on Windows** — first run is the real test.
Bonsai 2 needs PrismML's llama.cpp fork; stock Ollama may not run it. The local tier (Bonsai) is for client-data requests only and never falls back to a cloud model.

## Connect status (2026-10-22)
`connect-all.sh` now does each Mac's safe half of all three doors in one paste: step 6c installs Orca (official tap `stablyai/orca/orca`) if missing and opens it on the Repo folder; step 6d installs AnyDesk (official cask) and reads the Mac's AnyDesk ID. Steven's half, printed in its report: Screen Recording + Accessibility for AnyDesk, an optional unattended-access password typed by him, and the one Orca phone-pairing scan. Nothing is "connected" until he has done those on each device.

## Rules
- A pairing link or an AnyDesk password is full control of that computer. Never paste one into chat, the dashboard, a note or the repo.
- Pair Orca only over the home network or Tailscale; desktop control is never granted through Orca.
- AnyDesk's unattended-access password is a credential: Steven sets it himself. Its paid REST API needs his licence and credentials (Needs-Steven).
- An agent reached through any door follows the HALT list: no sends, spending, signing or account changes without Steven.

## See also
`wiki/ai-team/tool-integration-status.md`, `REMOTE-ACCESS.md`, `integrations/alienware/README.md`, `integrations/anydesk/README.md`.

## Remote access from anywhere — AnyDesk (added 2026-10-12)

Panel 40 opens with a "Remote access — every computer" card: one Connect button per computer, driven by the AnyDesk IDs saved in each device card. IDs are stored in the deck's shared store (`anydeskIds`) so the phone, tablet and both Macs see the same list; an ID is an address, never a secret. The password stays inside AnyDesk on the computer being reached (Settings → Security → unattended access, set on that machine). Source: `dashboard/wave2/splice-anydesk.py`; local tool `integrations/anydesk/anydesk-links.py`.

## Violoop (proposal, 2026-11-01)

Steven asked for Violoop on the org chart. It is BVIO Technology's plug-in AI box: HDMI in (it reads the screen), USB
out (it types and clicks as a second user), an on-device 8B model, and a slot for a Claude, OpenAI or Gemini key for
heavier tasks; per press coverage, irreversible actions (send, pay, delete) need a physical button press. Kickstarter
pricing was reported at $399 early and $699 retail, shipping late 2026. What it would add here: control of a computer
that has no API and no browser path, from outside the OS, including the Alienware PC. What already covers most of that:
Claude Remote Control, Orca, AnyDesk, Claude for Chrome, agent-browser and Playwright (above and
`integrations/browser-agents/README.md`).

Status: **proposal only.** Not bought, not installed, nothing verified. Buying it is a spend (HALT); plugging it into a
machine that shows client data is a PII question (HALT). Order of events if Steven wants it: Elon grades fit against the
tools above; Elena lists what the box can see and where its traffic goes; Steven buys; first use on a machine with no
client data, with the local model only; a dated entry in `context/decisions.md` records the result.
