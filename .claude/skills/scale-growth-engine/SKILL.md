---
name: scale-growth-engine
description: "Weekly ADR pass — Automate, Delegate, Replicate — that finds what is capping Steven's capacity and converts it into logged, measured capacity: automate anything that must survive 5x/10x volume, delegate with a named receiving owner, replicate what works as a template. Use for the weekly scale review, capacity planning, or when Steven asks how to handle more volume without more hours."
---

# scale-growth-engine — Automate · Delegate · Replicate (weekly)

Seat: judgment — **Claude Opus 5**, chaired by Vanessa (Claude Fable 5.1). Research inputs come from
the Perplexity bench (≤4 per wave). Distinct from `continuous-process-improvement`: CPI removes waste
from what exists; this skill asks what breaks at 5x and what Steven should stop doing at all.

## Trigger
- Weekly, inside `loop-engineering-weekly` (Mac, cron `30 4 * * 6` = Sat 4:30 AM PT). One ADR pass
  per cycle.
- On demand: "how do I handle 3x the leads", a new channel opening, a hire/ISA change, or a
  capacity complaint ("I'm the bottleneck").

## Inputs
- Volume and throughput: `leadTriage`, `leadResponse`, `isaKpi`, `loftyLeads` (once Lofty syncs),
  `zohoSync`/`zohoLeads`/`zohoDeals`, `showingSchedule`, `marketingQueue`, `kanbanCards`,
  `calendarSnapshot` (where his hours actually go).
- Capacity and reliability: `routineHealth`, `runnerStatus`, `toolkitSnapshot.counts`,
  `aiTeamRoster` (172 agents — check before proposing a new one), `twinQueue`, `cpiOpportunityLog`.
- Prior: `scaleOpportunityLog`, the previous cycle's Growth Roadmap.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db`, `db_op:"get"`, `collection:"state"`, `doc_id`; `write_db`, `db_op:"set"` (not `update`),
`data:{v:<whole doc>}`. Read-then-append; the log is append-only. **Every doc is `{v:<value>}` — no exceptions:** send
`data:{v:<whole doc>}`, never the bare value. A top level that is not a single `v` key is a bug to
fix, not a shape to copy. From a cloud routine the write parks on a permission prompt — report, let
the Mac write.

## Procedure
1. **Measure the baseline.** For each workflow: throughput (units/week), cost per output (minutes or
   dollars), tasks per hour, and where the queue forms. Every number cites its doc and stamp. A
   workflow with no measurable baseline gets one this cycle and is not scored until it has one.
2. **Stress the number.** Ask what breaks at **5x** and at **10x** of today's volume — the queue, the
   human, the connector rate limit, the Mac being asleep. Name the first thing that breaks.
3. **Apply the lens, in order.**
   - **Automate** — only for work that must survive 5x/10x and is rule-shaped. Name the task or
     skill that would own it, its cadence, and the measurement.
   - **Delegate** — name the **exact receiving owner** (a named agent seat, the human ISA, a vendor,
     or Steven) and the reasoning: why that owner, what they need to receive it (inputs, access,
     standard of done), and the first hand-off date. **HALT without a confirmed receiving owner** —
     a delegation with no named, confirmed owner is not logged as a delegation.
   - **Replicate** — turn a proven one-off into a template (checklist, prompt, doc skeleton, task
     spec) and say where it lives so the next instance is a copy, not a re-invention.
4. **Score.** Capacity impact = the delta in units/week or hours/week returned to Steven, with the
   arithmetic shown. Rank by capacity impact ÷ effort.
5. **Roadmap.** Produce the Growth Roadmap: Now (this cycle) · Next (next 30 days) · Later (blocked,
   with the blocker named). Each item carries its lens, owner, measurement and blocker.
6. **Measure last cycle.** Re-read the measurement for every `Implemented` item, set `capacityImpact`
   to the observed value, and roll `cumulativeCapacityUnlocked`.

## Outputs (exact shapes)
`scaleOpportunityLog` (append-only):
```json
{"v":[{"id":"scale-<YYYYMMDD>-<nn>","date":"YYYY-MM-DD","opportunity":"<one line>",
 "lens":"Automate|Delegate|Replicate",
 "status":"Proposed|Approved|Implemented|Measured|Blocked|Rejected",
 "capacityImpact":"<observed or estimated units/hours per week + the arithmetic>",
 "cumulativeCapacityUnlocked":"<running total>",
 "owner":"<exact receiving owner>","reasoning":"<why this owner>","measurement":"<metric + where read>",
 "evidence":"<doc/task + stamp>","blocker":"<null or what is blocking>"}]}
```
Growth Roadmap — `vault/40-Decisions/<YYYY-MM-DD> growth roadmap.md`, sections Now / Next / Later,
each row `item · lens · owner · capacity impact · measurement · blocker`.
Return block for the loop: `{scale:{proposed:n, implemented:n, measured:n,
cumulativeCapacityUnlocked:"<total>", halted:[{id, why}]}}`.

## Guardrails
- Never propose scaling something that is broken — fix or retire it first (an automation that fails
  at 1x fails faster at 10x).
- Never log a delegation without a confirmed receiving owner; "the team" or "an agent" is not an owner.
- Never propose a new agent without checking the 172-agent roster first; prefer re-pointing an
  existing seat. New seats are proposals for Steven, not creations.
- Never count an estimate as capacity unlocked. `capacityImpact` turns into an observed number only
  after the measurement is read.
- Delegating to the human ISA must respect her actual hours and the standing boundary rules; it is a
  proposal to Steven, never a direct instruction to her.
- No client names, no account numbers, no credentials in the log or the roadmap.
- Honest status: say "never run under the runner", "last ok <date>", "failed <date>: <reason>" for
  anything you are counting on.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** For this skill, halt and write a packet when:
- **no confirmed receiving owner** exists for a delegation (the explicit rule above);
- the change costs money, needs a hire, a new subscription, or a vendor contract;
- it needs a credential or a permission grant (e.g. the Zoho API access only Steven can enable);
- it changes what a client, partner or the ISA sees, or changes the ISA's scope of work;
- it is irreversible (a migration, a store move, a data deletion) or outside this skill's scope.

Packet → `twinQueue`: `{id:"tw_<epoch-ms>", ts:"<ISO>", from:"vanessa", priority:"p2",
status:"needs-steven", task:"<one line>", note:"<opportunity · proposed owner · what you need from
Steven · recommendation>"}`.

## Logging
- `scaleOpportunityLog` — one entry per opportunity; status transitions update the same `id`.
- Growth Roadmap file — rewritten each cycle; the previous one stays in the vault, dated.
- Return block → the cycle's `loopLog` entry (written by `loop-engineering`, single-writer rule).
- `ciLog` `{date, text}` only when an implemented item changed the dashboard.

## Self-test (`selftest:scale-growth-engine`, nightly suite, Functional)
Offline, ≤30 s, no sub-agents, no network (the nightly suite fails on timeout today, exit 124, last
error 2026-09-15).
1. Read `scaleOpportunityLog`; if absent, Pass with `entries:0` and report "never written" — do not
   create it in the self-test.
2. Owner gate: feed a `Delegate` candidate with `owner:""` and one with `owner:"the team"`; both must
   HALT and produce a packet in memory. A candidate with `owner:"isa-comms (human ISA)"` passes.
3. Baseline gate: feed an opportunity with no `evidence`; assert it is refused.
4. Arithmetic: assert `cumulativeCapacityUnlocked` = sum of `capacityImpact` over `Measured` entries
   only (estimates excluded) on a three-row fixture.
5. Shape: build one full entry; assert every key above is present and `lens` is one of the three.
   Write nothing.
Report `{id:"selftest:scale-growth-engine", category:"Functional", result, detail}` into `selfTest`.
