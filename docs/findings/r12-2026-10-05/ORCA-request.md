# Steven's request, 2026-10-05 (verbatim, pasted from the deck's own notes)

ensure everything is working and connected to include: Orca — reported on the Mac as Orca Computer Use; unverified from here, phone companion not paired

Reported on the Mac (toolkit snapshot 2026-09-16, status RUN, never confirmed from anywhere but the Mac itself — ./mac-verify.sh would confirm it, F-V2-23 still open): Orca Computer Use v1.4.203 by Stably AI, bundle com.stablyai.orca — a computer-use / browser-automation desktop app. It is not integrated with Claude Code: no MCP server exposes it, no agent calls it, nothing on this page can drive it. Corrected 2026-09-28: the same GitHub project, stablyai/orca (MIT), also describes itself as "the AI Orchestrator" — Claude Code and Codex side by side in worktrees, with an iOS/Android mobile companion to monitor and steer agents. Earlier builds treated that as a separate, unrelated product; both descriptions can be true of one project with several capabilities, and neither the parallel-worktree integration nor the mobile pairing has been done.

Where it fits: the parallel-agent surface and phone view for the ≤8 sub-agents Vanessa dispatches (org chart above) — watch/steer them from a phone once installed and paired, still a proposal. Separately, a proposed Anything / Orca computer-use executor seat under Elon for sites without APIs (homes.com, SkySlope, zipForms) — proposal only, vetted by the CTO Innovator for fit, integration cost and real-vs-hyped value, and by Elena for the risk a logged-in browser under an agent carries, before it enters any test queue. The CLI-Anything DOMShell path is the alternative executor for the same sites. Orca is still not a knowledge-fabric member and does not belong in recall. Say the word once it is verified and paired, and this note, the org chart node and the Agents row flip from proposal to confirmed.

Notes / knowledge graph

Graphify is installed as a Claude Code skill (~/.claude/skills/graphify) — run /graphify <folder> --obsidian in a Claude Code session to turn any folder of notes, docs, or code into an Obsidian vault plus an interactive knowledge-graph HTML and a plain-language GRAPH_REPORT.md. The operation's graph in vault/60-Knowledge was last built 2026-09-13 (750 nodes / 1,104 edges at the 2026-09-22 fabric count); the Sunday ops-knowledge-graph rebuild has never run under claude-runner. Vault link pending — the "doc link" in the original request wasn't a URL this page could read; paste the Obsidian vault path or shared doc URL and it will be linked here.

# Integrator's reading
- Orca and the graph rebuild live on Steven's Mac; no cloud session can reach either. "Working and
  connected" here means: one Mac paste-in that verifies Orca (./mac-verify.sh, version vs the latest
  stablyai/orca release), updates it if behind, walks Steven through the phone pairing (only his hands
  can scan/enter the code), rebuilds the ops graph, and reports back — plus deck text that tells the
  truth until then and flips to "confirmed" only on the Mac's report.
- Measured today: `ops-knowledge-graph` is no longer "never run" — it ran 2026-10-04 15:28 PT and ended
  "no-work"; the graph doc is still the 2026-09-13 build (750 nodes / 1,104 edges, fabric count today).
