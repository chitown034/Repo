# Routine spec — Parallel C-Suite Task Cycle

Drives the `vanessa-orchestrator` skill: intake → decompose → delegate → concurrent execution (≤8)
→ conflict resolution → QA → consolidate → report.

## Where it runs
**Mac runner (`claude-runner`) only.** An unattended cloud run cannot write the artifact DB — the
write parks on a permission prompt (confirmed three times, Sep 2026). The cloud twin
"Command Deck — Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT)"
(`0 23 * * 5` UTC) **FAILED 2026-09-18**; leave it report-only or disabled rather than running two
cycles that disagree.

## Schedule
| | Cron | Local (America/Los_Angeles) | UTC |
|---|---|---|---|
| Primary (Mac, local cron) | `35 22 * * 5` | **Fri 10:35 PM PT** | Sat 05:35 UTC (PDT, UTC−7) |
| On demand | — | Steven asks for a cycle | — |

Re-point the **existing** `vanessa-ops-review` task (enabled, **never run** as of 2026-09-22) at this
prompt. Do not create a second Friday task. Mac crons are local PT and do not drift at the
Nov 1 2026 PDT→PST change; the UTC column does.

## Models
| Layer | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 (masterminds) |
| Executive seats — Victor, Sofia, Marcus, Derek, Alexandra, Elena, Nadia, Elon | Claude Opus 5 |
| Reports / benches (tier 2–3) | Claude Sonnet 5 |
| Research wave | Perplexity (Composio `perplexityai` or the local `perplexity` MCP), ≤4 per wave |

Caps: **≤8 sub-agents in flight, ≤4 Perplexity calls per wave.**

## Tools
- `Artifact` `read_db` / `write_db` against `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`.
- Sub-agent dispatch (the Mac agent roster: 172 agents, tiers/leads in `aiTeamRoster`).
- Perplexity MCP (research wave). Calendar/Gmail/Notion/Slack connectors read-only in this cycle.
- No outbound messaging tool is enabled for this routine — drafts only.

## Prompt text (paste verbatim into the task)
```
Run the Parallel C-Suite Task Cycle using the vanessa-orchestrator skill. You are Vanessa
(Claude Fable 5.1), chairing.

1. Intake: this week's ask is the standing ops review unless a newer ask is in twinQueue with
   status "pending". Restate it in one line and name the decision it serves.
2. Read only what you need: vanessaRuns (last cycle), twinQueue, routineHealth, runnerStatus,
   loopLog, kanbanCards, leadTriage, leadResponse, isaKpi, calendarSnapshot.
3. Decompose into independently answerable tasks. Each task: owner seat, model tier, named input
   docs, output shape, done-condition, time box.
4. Dispatch in waves of at most 8, at most 4 Perplexity research calls per wave.
5. Stall policy: two retries, then re-route to the next-best seat, then a Needs-Steven packet.
   Never fabricate a seat's answer; never drop a task silently.
6. Resolve conflicts on the facts: a live doc with a stamp beats recollection. Alexandra
   (compliance) and Elena (security) hold a veto in their lanes. Money/risk tradeoffs go to Steven
   as four COAs, most conservative first.
7. QA every return: requested shape, a citation (doc + stamp, task name, or URL) for every number,
   no invented facts, no capability claimed live that the inventory does not prove, no secrets.
8. Consolidate into one synthesis: headline, what changed, decisions needed, owners, what is blocked.
9. Write: vanessaRuns (one entry), vanessaLog (one line, keep 200), vanessaRecommendations if COAs
   were produced, twinQueue packets for anything needing Steven. Read each doc before writing and
   append; use write_db db_op "set" with data {v: <whole doc>}.
10. Print the synthesis in the run output as well, so the cycle is readable even if a write fails.

Honest status rules: a task that exists is not a task that runs. Say "never run under the runner",
"last ok <date>", "failed <date>: <reason>". Follow Up Boss is retired (2026-09-22, replaced by
Lofty); Zoho is connected but every CRM call returns 403 Crm_Implied_Api_Access; You.com is retired;
there are no OpenRouter or Plaid keys. Never send anything to a client, partner or the ISA.
```

## Success condition
A run is a **success** only when all of these hold:
1. `vanessaRuns` gained exactly one entry for this cycle with a non-empty `headline`, `agents[]` and
   `decisions[]`.
2. Every dispatched task ended in one of: answered-and-QA'd, re-routed-and-answered, or a
   `twinQueue` Needs-Steven packet. Zero silent drops.
3. Every number in the synthesis carries a source and a stamp.
4. Caps were respected (≤8 concurrent, ≤4 Perplexity per wave).
5. The synthesis appears in the run output, not only in the DB.

**Failure** is any of: no `vanessaRuns` entry, a task with no outcome, an unsourced number, a
fabricated seat answer, or a write that parked on a permission prompt (which means it was run in the
cloud — re-run it on the Mac).

## First run
Run it once manually ("Run now") and confirm `vanessaRuns` gains an entry — `vanessa-ops-review` has
never run, so nothing about this schedule is proven until that happens.
