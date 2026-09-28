# Panel id → what it shows → which docs feed it

Panel id → what it shows → which docs feed it. **Status: thin stub — this round's reading did not
open the deck's full panel source, so this page names only what is already documented elsewhere in
the repo rather than guess at the rest.**

## What is actually known, 2026-09-28

| Panel | Shows | Fed by | Source |
|---|---|---|---|
| **38 — Toolkit & Remote Access** | The "Devices" card: which Macs are synced, and their heartbeat | `macHeartbeat.<machineId>`, written by `claude-auto` on every lease check | `REMOTE-ACCESS.md` |

The deck's structural markers (`PAGE_DEFS`, `panelStampRegistry`, the `<!-- PANEL: MASTER PLAN -->`
comment) are named as **never-touch** boundaries in `projects/command-deck.md`, which is the
project-status file for the deck as a whole and the right leaf for "is the deck healthy", not this
page. `dashboard/panel-orchestration.html` and `dashboard/panel-orchestration.js` in this repo are
the orchestration-panel source; a full id-by-id map would come from reading those plus the deck's
live source, which this round did not do — token cost for a page few questions need. Ask
`projects/command-deck.md` first; escalate to reading the live deck only for a named, specific panel.
