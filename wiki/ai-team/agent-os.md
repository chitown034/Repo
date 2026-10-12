# Agent OS — every agent through Laya, Jarvis and Orca

How the org chart works as an operating system: **Laya** picks the lane, **Jarvis** recalls first, **Orca** runs the
agents side by side, and the dispatch planner (`bin/brain route`) holds the rules. To run any agent: `bin/brain os run "<request>"`, then start each agent in its own Orca worktree with `claude --agent <slug>`. Written 2026-10-12.

## The four steps for any request

1. **Laya (first hop, zero tokens).** Confident → straight to the lane. Below its own threshold → ESCALATE to Vanessa.
   Laya never decides a licensed matter. Status: installed on the Mac per the 2026-10-05 toolkit snapshot, MCP server not registered, unverified from the cloud.
2. **Jarvis (recall first).** `bin/brain recall "<question>"` first; any client question stays on the local model (Jarvis/Bonsai), never the web.
3. **Orca (run the agents).** One Orca worktree per agent, at most 8 live at once, each started with `claude --agent <slug>`. Orca's phone app watches and steers the same sessions; pairing links never leave the device.
4. **Gates.** Alexandra reviews anything client-facing, ECC reviews any change, Vanessa consolidates last. HALT words stop the marked step for Steven.

## The commands (plain code, no model call)

| Command | What it does |
|---|---|
| `bin/brain os list [seat]` | every roster agent with its tier, model, Laya lane and Orca command |
| `bin/brain os show <slug>` | one agent: lane, starting page, recall line, launch command, guards |
| `bin/brain os run "<request>"` | the Laya → Jarvis → Orca launch sheet for a request, with HALTs and gates |
| `bin/brain os check` | exit 1 unless all roster agents are reachable and the manifest is current |
| `bin/brain os write` | rewrite `integrations/agent-os/agents.json` (the loop does this every run) |

## Coverage and limits

- **172 of 172** roster agents resolve to a lane, a recall line and a launch command (`bin/brain loop` checks this weekly).
- Named seats stored only as persona skills (Kevin, James, Apex, Harrison) launch as `/kevin-mentor`, `/james-wealth`, `/apex-trader`, `/vanessa-broker`.
- **Proposal-only** seats (Nadia, Elon, Disruption Scout, the council, the twin) return proposals, never changes.
- Nothing here starts Orca, Laya or Jarvis or sends anything. The commands are printed for the Mac, where those tools live.
- Orca's own CLI flags were not verified from the cloud; the launch line is the Claude Code command Orca runs inside a terminal.
- The living A–Z of every page, with backlinks, is `docs/reports/ENCYCLOPEDIA.md`, rewritten by `bin/brain encyclopedia` and every loop run.

See also `computer-hub.md` (the machines), `cross-functional.md` (the rules the planner follows), `org-chart.md`.
