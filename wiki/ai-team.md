# The AI Team — org chart, models, knowledge fabric, channels

Everything here is sourced from the Second Brain rows linked at the end. The live roster is the Command Deck's AI Team tab (doc `aiTeamRoster`, refreshed by toolkit-deck-sync on the Mac).

## Org chart
- **Steven ← Vanessa** (`vanessa-orchestrator`): the only path to Steven and the only seat on Fable 5.1. She recalls the knowledge fabric once, decomposes the goal, briefs each work package, dispatches sub agents on their own models, waits, integrates, returns.
- **C-suite leads** report to Vanessa; agents report to a lead. Personas on file as skills: Nadia (CAIO), Marcus (CFO), Elena (CISO), Sofia (CMO), Alexandra (CCO, compliance), Victor (CRO), Derek (CTO). Standalone mentors: Apex (NQ/ES trading), Cole (personal development), James (wealth / family office). Vanessa also carries the mortgage and real-estate broker persona (`vanessa-broker`).
- **Roster (live, Command Deck `aiTeamRoster` v7, read 2026-09-22):** 172 agents — tier 1: 17 dispatched directly; tier 2: 96 pulled in by their leads; tier 3: 59 by name only. Leads: Vanessa, the seven C-suite seats, `portfolio-manager`, `ecc-accessibility-lead`, `nonprofit-grants-lead`. The 09-14 row recorded 169 (17 / 78 / 74); the roster has grown since. Fan-out governor `roster-tiers.json`: at most 8 in parallel, hard cap 12, at most 4 research-tool users per wave (Perplexity and WebSearch share one rate limit).
- **ECC** is a unit of AI employees inside the team (an accessibility lead, a standards officer, employees reporting to Derek and Elena); what the letters stand for is not recorded in the rows read here.

## Model policy (decided 2026-09-14; `lint_agents.py --models` runs nightly)
| Tier | Model | Who |
|---|---|---|
| Mastermind | Fable 5.1 | Vanessa only |
| Research and judgement | Opus 5 | C-suite, tier 1, any seat named research / analyst / analytics / scout / intelligence / underwriter / guideline / auditor / reviewer / hunter / mining / optimizer / market, plus eight promoted judgement seats |
| Execution | Sonnet 5 | Everyone else |

Counts on 2026-09-14: 1 Fable, 85 Opus, 86 Sonnet. Live roster on 2026-09-22: 1 Fable, 93 Opus, 78 Sonnet — every seat carries its model badge. Research runs on Perplexity with WebSearch/WebFetch as the named fallback. iMessage: Sonnet 5 answers simple texts, an Opus 5 specialist takes one-area expertise questions, Vanessa on Fable takes the hardest, escalating at most once; Discord stays on Sonnet.

## Dispatch rule (standing; one place, the vanessa-orchestrator skill)
Mastermind, do not labour · recall before you decompose · every package to a sub agent on its own model · research only to Perplexity seats · wave size from the roster governor · interview when ambiguous (`interview-me`) · prompt-optimizer pass on every brief · a spawned sub agent is never a finished package · wait, integrate, return.

## Knowledge fabric (Mac-side, one verb)
`~/Applications/local-bridge/run.sh recall "term"` (60 characters max) prints five labelled sections: Second Brain (Notion rows via `_Second Brain index.md` in the Drive folder), Obsidian vault notes, Jarvis semantic index (830 notes / 879 chunks), Graphify knowledge graph (750 nodes / 1,104 edges), Ruflo memory (namespace `vanessa-ops-graph`, needs Node 22). `--brief` costs about 146 tokens. Not reachable from a web session; here, search Notion.

## Channels
iMessage works (claude-runner task every 10 minutes). Discord needs a bot token. Email goes out via Inkbox from Inkbox's own address. WhatsApp is not possible. Scheduled tasks run through claude-runner on the Mac (`runnerctl login` is the only gate).

## Dashboard — the Command Deck
https://claude.ai/artifact/3jbdGMNFkGLEpJiZ3cTmZW — AI Team tab (doc `aiTeamRoster`), Toolkit tab knowledge-fabric tiles (doc `knowledgeFabric`), agent inbox (doc `agentInbox`). A published artifact cannot call out; its only live-data path is a database write it re-reads, so event-driven work runs on the Mac, not in the deck.

## Orca
Stably AI's Orca (stablyai/orca): installed on this repo's default branch through `.claude/hooks/session-start.sh` (PR #1). It runs parallel coding agents in isolated git worktrees; it is not a memory store and not part of the knowledge fabric.

## Security watch
Ruflo CVE-2026-59726 (CVSS 10.0; fixed in 3.16.3; AgentDB poisoning does not self-heal): confirm the Mac's Ruflo version and audit `vanessa-ops-graph`. https://app.notion.com/p/3e3c1760a74981f69109c89144557dd3

## Sources
- Dispatch rule — https://app.notion.com/p/3dcc1760a749817c9f67ca2fdb5e0e5e
- Model policy — https://app.notion.com/p/3dcc1760a7498103b5cdf9d01dbcae55
- Knowledge fabric and roster tiers — https://app.notion.com/p/3dbc1760a74981b49861f68aad5051de
- Org-chart mapping — https://app.notion.com/p/3d9c1760a74981ff8e7bf60fe5200181
- Channels — https://app.notion.com/p/3d9c1760a74981479305d2a06d7c835b
- Command Deck contents — https://app.notion.com/p/3d9c1760a74981d5ae0ff1e6af4e591b
