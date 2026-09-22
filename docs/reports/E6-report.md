# E6 report — AI Team + Vanessa + Toolkit (branch e6-aiteam, commit 4223413)

Baseline 2026-09-12 · verified 2026-09-22. Worktree: scratchpad/wt-e6-aiteam/command-deck.html (+25.7 KB, 61 hunks, 162+/82-).

## What changed
- **Org chart (Steven's ask):** model-tiering legend under the chart; Vanessa "Claude Fable 5.1 masterminds"; exec label "dispatched in parallel (≤8) · judgment seats on Opus 5"; `MODEL_BADGE` gained `perplexity`; `modelOf()` falls back to `ORG_MODEL_SEED` (the 9 seats whose roster model is verified: 1 fable + 8 opus) when the roster doc is absent; `research:true` → Perplexity badge (Leah, Disruption Scout, research bench). Nadia/Elon wording per §7(b). New **CRM & Connectors** lane under Derek (Lofty bridge, Zoho blocked, CLI-Anything wrappers; Integration Engineer owns; "0 agents of its own" keeps seat counts honest).
- **New cards after the chart:** `secondBrainLevelsCard` (L1–L5 table in the canonical §3 words; `renderSecondBrainLevels()` fills counts from `knowledgeFabric` and the L5 row from `runnerStatus`, safeRun, tolerant of missing docs) and `modelDisciplineCard` (tiering, ≤8/≤4, 5-step recall order, cache TTLs).
- **Local Bridge card:** 15 MCP · 172 agents · 60 tasks now rendered from `toolkitSnapshot.counts` (`renderLocalBridgeCounts()`), printed fallback = 2026-09-16 snapshot.
- **Honest status rewrites:** ISA line (cloud bridge disabled 2026-09-09; Mac task hourly 7:37–21:37 PT, ok 2026-09-21 8:38 PM; ISA silent since 09-16), twin queue (cloud twin abandoned; steve-twin-sweep 12:55 PM refused its vault write), weekly self-update (Fri 11:10 PM, never run, proposals empty), skill toolkit ("written this cycle — repo skills, Mac install pending" + install prompt), Orca (Computer Use v1.4.203 installed; IDE integration not done; executor = proposal), Graphify note.
- **AI_TEAM_TOOLBOX** all 7 rows rewritten (Zoho blocked, Lofty via Mac, FUB + You.com retired, Canva reconnect, 46/50 cloud routines with disabled/failed lists, skills present vs written-this-cycle, 172 agents with tiers/models/leads). **AI_TEAM_FLOWS** cadences → runner crons with never-run honesty. Every Follow Up Boss in my regions → Lofty with history.
- **Vanessa panel:** "Routes to 8 executives + 4 mentors", tiering sentence, Inkbox task stamps, Vanessa Live + Local Bridge rows, research card → vanessa-research-queue hourly (You.com retired); JS badge "Queued — answered by Vanessa (hourly task)".
- **Toolkit:** console cadence (local-bridge-queue hourly 6:25–21:25), Second Brain card (brain-deck-sync/brain-learn-daily/brain-weekly-verify with last-ok), canonical five-level + token-discipline paragraphs, Orca bullet, live-paths line, fabric empty-state credits fabric-deck-sync. Fixed 4 literal `—` escapes rendering as text.

## Gate
quickcheck: PASS on every line except the known false-positive "called but never defined" line; the 18 "new" names it lists (cli, ruflo, zipForms, masterminds…) are prose words followed by "(" inside string literals. `node --check` OK. Node smoke test of ORG_CHART + all renderers against the live docs: no throws; 124 nodes, badges 59 Opus / 50 Sonnet / 3 Perplexity / Vanessa Fable. Footer, PAGE_DEFS, panelStampRegistry, OUTPUT_WATCH, MASTER PLAN marker untouched (diff-checked).

## Needs Steven (halt=true)
1. Zoho: enable "Zoho CRM API Access" on the connected profile (F-E6-13).
2. Lofty: confirm API key in ~/.config/lofty/.env and run lofty-crm-sync once (F-E6-14).
3. steve-twin-sweep: allow Bash write to ~/Shearrill-Vault on the runner, or drop step B2 (F-E6-09).
4. Install the Loop Cycle 6 skills on the Mac (copy-prompt on the toolkit card) (F-E6-21).
5. ISA silent since 2026-09-16 (F-E6-07). 6. Kevin vs cole-mentor naming (F-E6-30).

## For the integrator
- 14 literal `—` escapes remain in body markup outside my regions (grep `\\u2014` in lines < 6635).
- Seat-count quirk (pre-existing): roster "in total" counts Steven as a seat (225) while the chart badge says 224 under him.
- vanessaResearch doc `note` (task-written) still says 6:20/12:20/17:20.

Findings: 31 (F-E6-01…31): 19 fixed/implemented, 6 escalated (halt), 6 open. Nothing in my regions left unfinished.
