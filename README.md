# Command Deck — AI ecosystem, second brain, and loop engineering

This repository is the source of truth for Steven Shearrill's AI operation: the second brain that
every agent reads, the skills that do the work, the integration specs for each outside system, and
the dashboard code and tests that keep the Command Deck honest.

It is a working brain, not documentation about one. `CLAUDE.md` loads automatically in every Claude
Code session in this directory and routes the agent to exactly one leaf file per question.

## Layout

| Path | What it is |
|---|---|
| `CLAUDE.md` | Level 1 router. Routing table, recall order, token rules, model tiering, HALT list. Read in full; nothing else is read until it says so. |
| `AGENTS.md` | The same rules for Codex and other non-Claude agents, which do not read `CLAUDE.md` automatically. |
| `context/` | `about-me.md` (always-true background) and `decisions.md` (append-only, dated). |
| `projects/` | One file per ongoing project, with status and where its live data actually lives. |
| `wiki/` | Level 2 topic wikis, each an index of one-line summaries. `wiki/clients/` is full-context and never chunked. |
| `references/` | Source documents and external systems. |
| `memory.md` | Claude Code auto-memory. Enable with `/memory`. |
| `vector-index/` | Level 3. What gets chunked and embedded, and the rule for what must never be. |
| `knowledge-graph/` | Level 4. Entities, typed relationships, and the never-graph-a-secret rule. |
| `always-on/` | Level 5. What runs when, on which machine, and whether it actually ran. |
| `recall-cache.md` | Cache TTLs, so a repeated question costs one lookup instead of five stores. |
| `REMOTE-ACCESS.md` | Every live path to this system from a phone or another machine. |
| `OPTIMIZATION.md` | How Orca, Jarvis, Ruflo, Graphify, Obsidian, RAG and ECC resolve into one recall path and one dispatch path under Vanessa. |
| `MAC-INSTALL.md` | Laying this tree onto the Mac, enabling auto-memory, opening the vault in Obsidian. |
| `.claude/skills/` | The installable skills: orchestration, backup, improvement, scale, loop engineering, stress testing, and the four integration syncs. |
| `integrations/` | Connection status per outside system, the Apple Health recipe, and the exact Mac task definitions. |
| `routines/` | Cloud routine and scheduled task specs, with cron in both Pacific and UTC. |
| `dashboard/` | The Orchestration and Loop Engineering panel source, plus the test harness. |
| `docs/` | The cycle's audit, stress test report, disruption brief, and the ecosystem inventory it was all built from. |

## The test gate

Nothing reaches the published dashboard without passing both:

```bash
python3 dashboard/tests/quickcheck.py <deck.html>        # syntax, seed JSON, duplicate ids, tag balance
node    dashboard/tests/runtime-harness.js <deck.html>   # executes the whole page under a DOM shim
```

The harness exists because the dashboard is one large immediately-invoked function: a load-time throw
kills every render after it, the page still opens, and the cards simply sit empty. `node --check`
passes on that file because the syntax is valid. Only executing it catches the failure.

## Two rules that matter more than the rest

**Output, not execution.** A scheduled task counts as working only when the document it owns actually
got fresher. "The task ran" is not the measure, and a green badge over a document nobody wrote is the
failure this whole system is built to prevent.

**A cloud routine can write; what it cannot do is carry a connector.** The old rule here said an
unattended cloud routine "parks on an approval nobody is there to give". That was true when it was
last tested on 2026-09-04 and is false now: a probe routine fired with nobody present at
**2026-09-22 09:05:56Z** and left the `cloudWriteProbe` document behind, and four cloud writers have
since run on it — the weekly backup, the live Pipeline Sync, the ISA escalation ladder and the feed
freshness watchdog, whose `feedFreshness` document was written at 2026-09-23T00:50Z. Do not refuse a
cloud write on the old rule's authority. What still pins work to the Mac is different and narrower:
an agent-created routine carries **no connectors** (Zoho, Lofty, Gmail, Calendar, Strava, Notion run
where the credentials live), and anything needing local files, the local model or the keychain.
Write-up: `docs/CLOUD-WRITE-ARCHITECTURE.md`; the standing version of this rule lives in
`wiki/dashboard-ops/index.md`.
