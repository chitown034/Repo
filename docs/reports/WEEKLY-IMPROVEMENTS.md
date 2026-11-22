# Weekly improvements — harness, graph and loop engineering

Run: 2026-11-22T20:20:00Z · 0.8 s · `bin/brain weekly --write`. Plain code, no model calls. Each proposal is carried into the 6D Brain's Self-improvement lane by `bin/brain recs`; nothing here edits a live prompt or task.

| Lens | Score | Last week | What it measures |
|---|---|---|---|
| Harness engineering | 59/100 | 59 | the scaffolding agents run inside: routines, Mac tasks, skills, hooks, router, connectors |
| Graph engineering | 82/100 | 82 | the shape of the knowledge: 6D Brain graph edges, islands, dead links, undated pages |
| Loop engineering | 50/100 | 50 | whether the system gets better: loop run history, trend, regressions, untested pages |

## Harness engineering

| Metric | Value |
|---|---|
| routines | 72 |
| routines failing | 10 |
| mac tasks | 60 |
| mac tasks failing | 0 |
| connectors | 64 |
| connectors reconnect | 1 |
| connectors attention | 47 |
| skills | 49 |
| skills no frontmatter | 0 |
| hooks missing | 0 |
| router ok | True |
| doctor ok | True |
| kill switch | off |
| breakers open | 0 |
| traced runs 7d | 3 |
| traced failures 7d | 0 |
| retry policy | 2 retries → re-route → Needs-Steven |
| budget | ≤8 parallel · cap 12 · ≤4 web/wave |
| self tests | doctor PASS · gold 30/31 · routing 23/23 |

Proposals:

1. **Repair 10 cloud routine(s) whose last run failed** — failing: Books Reconciliation Reminder; Command Deck & ISA Portal Weekly Loop Engineering QA; Command Deck — Elite Affluent Tracker weekly refresh; Command Deck — Next Big Moves weekly review
   - read each routine's last run (list_triggers)
   - fix the prompt's broken step or retire the routine
   - record it in docs/inventory/cloud-routines.md
2. **Reconnect 1 connector(s)** — needs sign-in: EVRoutes · Turo connectors
   - Steven: claude.ai Settings → Connectors → reconnect
   - next 6D rebuild re-checks

## Graph engineering

| Metric | Value |
|---|---|
| nodes | 788 |
| links | 1031 |
| file nodes | 164 |
| orphans | 0 |
| components | 1 |
| largest component | 164 |
| dead links | 0 |
| undated pages | 17 |
| idle agents | 159 |
| agents pending install | 122 |
| single points of failure | 1 |

Proposals:

1. **Back up 1 single point(s) of failure in the map** — removing one cuts part of the map off: store:vanessa (cuts 8)
   - give each a second path: a backup seat, a second connector, or a link from another hub
   - bin/brain weekly → count falls
2. **Put 159 idle agent(s) to work or park them** — no routine, Mac task, pod, skill or trace calls: a11y-architect, ad-compliance-reviewer, appraisal-manager, borrower-retention-agent, broker-coach-maxwell
   - give each a pod or a routine step, or mark it parked in its manifest
   - bin/brain weekly → idle falls
3. **Date-stamp 17 wiki/project/context page(s)** — a page without a date cannot say how fresh it is: context/banned-words.md, wiki/clients/index.md, wiki/dashboard-ops/panel-map.md
   - add 'as of YYYY-MM-DD' to each page's header
   - bin/brain reindex

## Loop engineering

| Metric | Value |
|---|---|
| runs last 7 days | 4 |
| bench | 30/31 |
| bench trend 7d | 0 |
| route | 23/23 |
| tune proposals | 2 |
| untested wiki pages | 32 |
| stale pages | 20 |
| gaps | 1 |
| decisions learned 30d | 8 |
| rejections 30d | 0 |
| weights moved | 2 |
| synonyms learned | 0 |
| edits captured 30d | 0 |
| automation loops | 135 |
| loops ok | 46 |
| loops failing | 10 |
| loops unknown | 75 |

Proposals:

1. **Monitor 75 automation loop(s) with no known last run** — a loop nobody can see is a loop that can fail silently
   - add bin/brain harness trace <name> ok|fail as the loop's last step
   - or record its last run in docs/inventory
2. **Teach the agents from Steven's edits** — rejections feed the recommendation weights, but edits to drafts are not captured yet
   - when Steven edits a draft, save the before/after as a lesson: bin/brain remember "edit lesson: …"
   - bin/brain weekly → edits captured rises
3. **Fix the 1 gold question(s) the brain misses** — bench 30/31, trend +0 this week
   - bin/brain loop → the failing questions
   - write the answer into the routed page; reindex; re-run
4. **Judge 2 tune proposal(s) — promote or reject** — the loop proposes, nobody decides: proposals pile up
   - docs/reports/BRAIN-LOOP.md → Next fixes
   - promote the ones the holdout passes; log the rest as rejected
5. **Guard 32 wiki page(s) with gold questions** — untested: wiki/ai-team/toolkit.md, wiki/ai-team/agency-teams.md, wiki/ai-team/bot-crew.md
   - one question per page in brain/bench/questions.json
   - bin/brain loop → count rises
