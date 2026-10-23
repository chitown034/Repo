# The second brain's layers — what lives where, how it syncs, how to tell it is even (2026-10-23)

Steven's rule (2026-10-23): "ensure all data syncs evenly across all layers — Notion, Google Drive, NotebookLM and
more". Even means **every layer is inside its own cadence**, measured from the stamp its own sync writes, never from
today's date. `bin/brain layers` prints the register; `bin/brain layers --write` rewrites `docs/reports/LAYERS.md`.

## One job per layer

| Layer | Job | Writes | Reads | Cadence |
|---|---|---|---|---|
| **Repo** (GitHub + both Macs) | the record: every page, rule, skill, script | Claude Code sessions, cloud routines, the Macs (never force) | everything else | continuous; Macs pull every 30 min |
| **Recall index** (`bin/brain`) | zero-token answers, level 1 | `bin/brain reindex` (daily rebuild, `connect-all` 6a2) | Vanessa, every session | daily |
| **Command Deck DB** | live operational state (queue, desks, briefs, lists) | routines, Mac tasks, deck buttons | the three dashboards, routines | continuous |
| **6D Brain page** | the map: every node and link, including the stores below | 3:30 AM PT rebuild + merge-live | Steven, the org chart | daily |
| **Jarvis** (Mac) | local recall over the vault, her voice; level 5 | `openjarvis` runner task, `jarvis-setup.sh` | Mac sessions only | 2 days |
| **Notion Second Brain** | operational memory: decisions, lessons, the layer directory | `brain-learn-daily`; the weekly sync refreshes the directory page | Steven, Vanessa (Notion MCP) | weekly |
| **Google Drive `SECOND BRAIN/`** | the shared knowledge layer and the off-GitHub redundant copy: 13 `SB` Google Docs + Steven's own folders (Inbox, Reference Sources, Approved Playbooks, Research Briefs, Decisions and Lessons, Archive) | weekly sync rewrites the 13 Docs; Steven drops originals in his folders | NotebookLM, Claude (Drive connector), Steven | weekly |
| **NotebookLM** | source-grounded research over the same Docs; level 4 when the repo and the Mac are unreachable | Google auto-syncs the Docs | Steven (and Claude, through a research brief he pastes) | follows Drive |
| Vector index · knowledge graph | high-volume corpora · relationships | spec only until a corpus is loaded | — | 30 days |

What flows where: **repo → index, 6D, Drive Docs → NotebookLM**; **deck DB → briefs → repo (cosBrief, memory)**;
**NotebookLM brief → Claude → Notion decision → repo `context/decisions.md`** (the approval gate: nothing an AI
produced becomes a "fact" in the repo without Steven's yes).

## Capabilities (2026-10-23)

- `bin/brain export notebooklm` — the pack (13 masked bundles, no client pages, the 6D map as text).
- `bin/brain layers [--write] [--json]` — the register above with last-sync stamps and verdicts.
- `bin/brain ingest claude-export <conversations.json>` — Steven's claude.ai chats (his words only, masked) → `memory/claude-chats.md`;
  the daily "Claude sessions ledger" task → `docs/inventory/claude-sessions.md` (every Claude Code session, title/date/status).
- **Fieldy → brain** (daily 6:50 AM PT task in the orchestrator session): yesterday's recorded conversations → `memory/fieldy-meetings.md`
  (date, title, first names, Fieldy's summary, action items) and a `fieldyDesk` doc on the Command Deck; the `meeting-recap-to-crm` skill turns one into a recap.
- **Ask Vanessa on the 6D Brain** (2026-10-23): an AI chat inside the page (claude.ai `sample` capability, the viewer's own
  Claude usage, allowed once per view). Vanessa answers from the passages the page's zero-token search ranks for the
  question, cites each page with its own date, says "not in the brain" when nothing matches, and keeps the HALT list
  (no rate quote, eligibility call, legal read or client send). Her portrait and presence states (listening, reading,
  speaking) are the Command Deck's; "Read her answers aloud" uses the device's own voice. Outside claude.ai the chat is hidden.
- **Presence audit** (monthly, 1st at 7:10 AM PT, Sofia): the AI-search prompt set by WebSearch → `docs/reports/PRESENCE.md` + the deck `presenceAudit` doc; rules in `wiki/real-estate-playbooks/ai-search-visibility.md`.
- **Registers the 6D Brain draws as lobes** (2026-10-23): skills, Claude mods (the plugins in `integrations/mods/`), connectors (`integrations/CONNECTIONS.md`), MCP servers (`integrations/MCP-SERVERS.md`), APIs with where each key lives (`integrations/APIS.md`), cloud routines, Mac tasks — `bin/brain toolkit` counts them; add a row to a register and the next rebuild draws it.
- **Vanessa recommends — four courses of action, 4 each, plus the questions block** (2026-10-23 evening; `bin/brain recs --coas`): big-move · improve (loop engineering, from `brain/loop.py` history, the decision ledger and `integrations/scout/seen.json`) · risk · opportunity, one scored pool, `coa_of()` decides the lane. Earlier the same day: the daily top 10 big moves — `bin/brain recs` scores every open item the brain can see
  (unconnected tools, stale layers, loop gaps, Steven's open steps, live deck signals) by impact × confidence ÷ effort ×
  a learned category weight; `--write` → `docs/reports/BIG-MOVES.md` + `brain/recs/big-moves.json`. HITL: approve /
  decline / later on the 6D Brain (page database) or the Command Deck's Recommendations card; the **Big moves** task
  (daily 6:05 AM PT) reads both, learns (`brain/recs/ledger.jsonl`, `weights.json`), queues approved Vanessa-items for
  the 6:25 cycle, writes the deck docs `bigMoves` and `aiTeamOrg`, and republishes the 6D Brain.
- `bin/brain links` — every front door with its URL (deck, ISA Portal, 6D, Action Desk, Bot Crew, repo, Drive SECOND BRAIN,
  NotebookLM, Notion database + layer directory, the 13 SB Docs). The 6D Brain embeds the same list: "Open the brain"
  panel, an open link per layer, and clickable store nodes (Drive, NotebookLM, Notion, Command Deck).
- Weekly sync task **NotebookLM mirror weekly sync** (Sun 2:45 PM PT, after the allowance reset): export → commit →
  rewrite changed Docs → stamp `drive-manifest.json` → refresh the Notion directory page → `layers --write`.
- CLAUDE.md recall level 4 and a routing row for the mirror; 6D store node `store:notebooklm`.
- NotebookLM notebooks (Steven's three, from his plan): **Mortgage Reference Library**, **AI Automation and VANESSA**,
  **Business Operating Playbooks** — which Doc goes in which is in `integrations/notebooklm/drive-manifest.json`.

## Rules

1. Client pages never leave the Mac and the repo's `wiki/clients/` (they are not in the pack, Drive or NotebookLM).
2. Drive writes are limited to `SECOND BRAIN/` (Steven's 2026-10-23 instruction); the rest of Drive stays read-only.
3. A NotebookLM answer is an intermediate: for anything licensed or consequential, read the page it cites.
4. State the age of every fact as the layer's own stamp. A stale layer says so (`bin/brain layers`).
5. The community NotebookLM MCP connector (`notebooklm-mcp-cli`) stays opt-in on the Mac: it stores browser session
   material; `integrations/notebooklm/README.md` has the gated steps if Steven chooses it.

## What "the most powerful second brain" means here, and what is next (2026-10-23)

Live now: zero-token recall (`bin/brain recall`, 1,257 sections), the 6D Brain with a Layers readout, one Vanessa queue
every dashboard writes, push-buttons, 46 skills, seven pods, two Macs on one schedule, Jarvis + Laya on-device, the brain
mirrored to Drive and NotebookLM with a weekly sync, Notion holding the layer directory, a validator gate on every code
change. Next, each one Steven's yes because it spends, signs in or installs: (1) Notion **Decisions** and **Actions**
databases fed by `context/decisions.md` and the Vanessa queue (approval gate stays); (2) the first vector-index corpus
(Fieldy transcripts, once recordings exist); (3) NotebookLM research briefs landing in `03 Research Briefs` and read by
`bin/brain ask`; (4) the community NotebookLM MCP on one Mac, non-sensitive notebook only; (5) a Drive copy of the 6D
page itself (redundancy of the map, not only the data). Each becomes a dated entry here when done.
