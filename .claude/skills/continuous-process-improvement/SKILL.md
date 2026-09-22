---
name: continuous-process-improvement
description: "The CPI engine (v2): a cheap daily OBSERVE/IDENTIFY scan and a weekly deep RECOMMEND/IMPLANT/MEASURE pass that turns observed friction in Steven's operation into logged, measured improvements. Low-risk, high-confidence fixes are implanted by the Engineering Team; everything else is a recommendation. Use for the daily CPI scan, the weekly CPI review, or when Steven asks what is wasting his time."
---

# continuous-process-improvement v2 — OBSERVE → IDENTIFY → RECOMMEND → IMPLANT → MEASURE

Seat: daily scan is an execution seat — **Claude Sonnet 5**, no sub-agents. The weekly deep pass is a
judgment seat — **Claude Opus 5** — chaired by Vanessa (Claude Fable 5.1); IMPLANT work is done by
the AI Agent Engineering Team under Elon (CTO Innovator).

## Trigger
- **Daily light** — Mac task `cpi-daily-scan`, cron `30 22 * * *` = 10:30 PM PT. Status 2026-09-22:
  enabled, last end 2026-09-17, **error**. Cheap: OBSERVE + IDENTIFY only, no sub-agents, no
  implants, ≤1 new opportunity logged per run unless the evidence is overwhelming.
- **Weekly deep** — inside `loop-engineering-weekly` (Sat 4:30 AM PT). Full five phases.
- On demand when Steven says "what's wasting my time" or after any incident.

## Inputs (evidence only — every opportunity cites one)
`isaLine`, `leadTriage`, `leadResponse`, `isaKpi`, `routineHealth`, `runnerStatus`, `twinLog`,
`twinQueue`, `agentInbox`, `inboxTriage`, `calendarSnapshot`, `kanbanCards`, `ciLog`, `selfTest`,
`loopLog`, and the previous `cpiOpportunityLog` / `cpiCycles`.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db`, `db_op:"get"`, `collection:"state"`, `doc_id`; `write_db`, `db_op:"set"` (not `update` —
it fails on a doc that does not exist) with `data:{v:<whole doc>}`. Always read the log first and
append; the log is append-only. Docs are `{v:…}` except `stravaSnapshot`.

## Procedure
1. **OBSERVE.** Read the inputs for the window (24 h daily, 7 days weekly). Look for: repeated manual
   steps, repeated messages with no reply, work that waited on a human, a task that ran and produced
   nothing, a number a human re-typed, a decision that needed information it did not have.
2. **IDENTIFY.** Write the opportunity as *a specific thing that happened*, with the doc id, message
   id or task name and timestamp as `evidence`. No generic advice. If two runs found the same thing,
   update the existing entry instead of logging a duplicate.
3. **RECOMMEND.** For each: the change, the expected saving (minutes/week or errors/week, with the
   arithmetic), complexity `S|M|L`, the owner seat, and the measurement that will prove it.
4. **IMPLANT** — weekly only, and only when **all** of these hold: low risk (reversible, no client or
   ISA-visible change, no credential, no spend), high confidence (the evidence is unambiguous and the
   fix is understood), and an Engineering Team owner exists (Reliability / Efficiency / Capability /
   Integration Engineer). Implanted changes go through the loop's test-and-compare gate
   (`sandbox-qa`) and start at trust **L1**. Anything else stays `status:"Recommended"`.
5. **MEASURE.** Next cycle, re-read the named measurement, set `measured` to the observed value
   (never the estimate), and roll `cumulativeSaved`. An improvement that cannot be measured is not
   closed — it goes back to `Recommended` with the reason.

## Outputs (exact shapes)
`cpiOpportunityLog` — append-only; existing entries carry `{date, evidence, id, opportunity, status}`
and keep working. New entries use the full shape:
```json
{"v":[{"id":"cpi-<YYYYMMDD>-<nn>","date":"YYYY-MM-DD","opportunity":"<specific, one line>",
 "evidence":"<doc/message/task id + timestamp>","expectedSaving":"<n min/week | n errors/week + how>",
 "complexity":"S|M|L","status":"Proposed|Recommended|Implanted|Measured|Rejected",
 "measured":"<observed value + the date it was read, or null>","cumulativeSaved":"<running total>"}]}
```
`cpiCycles` — the improvement board the deck renders; append/update one row per item in flight:
`{title, baseline, target, actual, phase:"Plan|Do|Check|Verified", impact:1-5, effort:1-5, started:"YYYY-MM-DD"}`.
Weekly return block for the loop: `{cpi:{observed:n, identified:n, recommended:n, implanted:n,
measured:n, cumulativeSaved:"<total>", rejected:[{id,why}]}}`.

## Guardrails
- Every opportunity cites evidence that exists. No opportunity invented from a hunch.
- `expectedSaving` shows its arithmetic; `measured` is only ever an observed number.
- Never implant anything that touches what the ISA, a client or a partner sees, needs a credential,
  costs money, or cannot be rolled back in one step.
- Never implant on a daily run. Daily is OBSERVE + IDENTIFY, full stop.
- Never close an item because it "looks done" — it closes on a measurement.
- Do not log an opportunity whose real cause is an outage (that is a Reliability finding); route it
  and say so. Example from this cycle: the FUB/Composio key rejection (`cpi-20260922-01`) is an
  integration failure — the CPI item is the *missed detection*, not the key.
- No secrets, client names, or account numbers in any log entry.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** Concretely: an implant that would change the ISA outbox (standing halt: "ISA-line outbox
refactor — touches five tasks, changes what the ISA sees"); any prune or deletion (standing halt:
"skill prune — destructive"); anything needing a new connector grant, an API permission (e.g. the
Zoho `Crm_Implied_Api_Access` fix, which only Steven can do in Zoho Setup) or a paid tool; an
opportunity whose fix is a policy choice about how Steven works.

Packet → `twinQueue`: `{id:"tw_<epoch-ms>", ts:"<ISO>", from:"vanessa", priority:"p2",
status:"needs-steven", task:"<one line>", note:"<opportunity · evidence · options · recommendation>"}`.

## Logging
- `cpiOpportunityLog` — one entry per opportunity, per run; status transitions update in place.
- `cpiCycles` — one row per item in flight; `phase` advances only on evidence.
- Weekly: the return block lands in the cycle's `loopLog` entry (written by `loop-engineering`).
- `ciLog` `{date, text}` only when an implant actually changed the dashboard.

## Self-test (`selftest:continuous-process-improvement`, nightly suite, Functional)
Offline, ≤30 s, no sub-agents (the nightly suite fails on timeout today, exit 124, last error
2026-09-15).
1. Read `cpiOpportunityLog`; assert it parses, is an array, and every entry has `id`, `date`,
   `opportunity`, `evidence`, `status`. The three live entries (2026-09-13, 2026-09-14, 2026-09-22)
   must survive a read-modify-write round trip unchanged.
2. Duplicate guard: feed an opportunity identical to an existing one; assert it updates rather than
   appends.
3. Evidence guard: feed an opportunity with `evidence:""`; assert it is refused.
4. Implant gate: feed a candidate flagged `touchesISA:true`; assert it cannot reach
   `status:"Implanted"` and produces a HALT packet in memory instead.
5. Shape: build one full entry and one `cpiCycles` row; assert every key above is present. Write
   nothing to the deck.
Report `{id:"selftest:continuous-process-improvement", category:"Functional", result, detail}` into `selfTest`.
