# Computer Hub — reaching every computer

Written 2026-10-11. Steven's computers: **Mac 1**, **Mac 2**, the **Alienware PC**, plus a tablet and phone. Each gets the same three doors.

| Door | What it gives | How | Where it lives |
|---|---|---|---|
| Claude Remote Control | The Claude Code session on that computer appears in the session list at claude.ai/code and on the phone | `claude remote-control`, then `rc-agent.sh install` (Mac) | `integrations/remote-control/` |
| Orca | All the AI agents on that computer, paired over a private network | `orca-remote.sh serve` / `pair` (Mac), `alienware-setup.ps1 -Action OrcaServe` / `OrcaPair` (Windows) | `integrations/remote-control/`, `integrations/alienware/` |
| AnyDesk | The whole screen, keyboard and mouse | AnyDesk app on each device; ID saved in the Computer Hub card; `integrations/anydesk/anydesk-links.py` | `integrations/anydesk/` |

The dashboard card is Panel 40 on Toolkit & Remote Access. Ticks and AnyDesk IDs stay in that browser only.

## Alienware PC (Windows) — local AI
`integrations/alienware/alienware-setup.ps1` checks and installs, asking y/N before each change: Orca, Laya (`laya[serve,mcp]` 0.3.21 in its own venv), Bonsai 2 27B through PrismML's own Bonsai-demo (pinned commit), optional Ollama with the community `MichelRosselli/bonsai-27b` upload (unverified), AnyDesk and Tailscale. `-Action Doctor` is read-only; `-Action Report` prints one status line for the dashboard. It has **never run on Windows** — first run is the real test.
Bonsai 2 needs PrismML's llama.cpp fork; stock Ollama may not run it. The local tier (Bonsai) is for client-data requests only and never falls back to a cloud model.

## Rules
- A pairing link or an AnyDesk password is full control of that computer. Never paste one into chat, the dashboard, a note or the repo.
- Pair Orca only over the home network or Tailscale; desktop control is never granted through Orca.
- AnyDesk's unattended-access password is a credential: Steven sets it himself. Its paid REST API needs his licence and credentials (Needs-Steven).
- An agent reached through any door follows the HALT list: no sends, spending, signing or account changes without Steven.

## See also
`wiki/ai-team/tool-integration-status.md`, `REMOTE-ACCESS.md`, `integrations/alienware/README.md`, `integrations/anydesk/README.md`.

## Remote access from anywhere — AnyDesk (added 2026-10-12)

Panel 40 opens with a "Remote access — every computer" card: one Connect button per computer, driven by the AnyDesk IDs saved in each device card. IDs are stored in the deck's shared store (`anydeskIds`) so the phone, tablet and both Macs see the same list; an ID is an address, never a secret. The password stays inside AnyDesk on the computer being reached (Settings → Security → unattended access, set on that machine). Source: `dashboard/wave2/splice-anydesk.py`; local tool `integrations/anydesk/anydesk-links.py`.
