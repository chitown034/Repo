---
name: stress-test-sweep
description: "Structured stress sweep of the Command Deck and the automation layer — Volume, Edge, FailureInjection, Concurrency and BackupRecovery — that finds where things break under load or bad data, routes each weakness to the Reliability, Efficiency, Capability or Integration Engineer, and closes nothing until it passes the same test again. Use for the weekly stress pass, before a risky change, or when Steven asks what would break under 10x."
---

# stress-test-sweep — find the break, route it, re-test it

Seat: `stress-test-engineer` (tier 1, Opus 5) under Elon, the CTO Innovator. Vanessa (Claude Fable
5.1) chairs the cycle that consumes the report. Fixes are made by other engineers — **this skill does
not fix the thing it broke.**

## Trigger
- Weekly, inside `loop-engineering-weekly` (Mac, cron `30 4 * * 6` = Sat 4:30 AM PT).
- Before any risky change: a deck republish, a store migration, a new connector, a doc-shape change.
- On demand: "what breaks at 10x", or after an incident, to reproduce it.

## Inputs
- The deck file under test (the published artifact's HTML, or a worktree copy) and the runtime
  harness (a pure-Node DOM shim — no jsdom, nothing installed).
- A full doc export of `collection:"state"` (161 docs at 2026-09-22) for fixtures and restore tests.
- `OUTPUT_WATCH` (the deck's watched-doc list), plus `zohoLeads`, `zohoSync`, `loftyLeads`,
  `routineHealth`, `backupStatus`, `twinQueue`, `vanessaRecommendations`, `calendarSnapshot`,
  `weatherSnapshot`, `stravaSnapshot` (**no `v` wrapper** — the known shape bug; it must be in every
  Edge run).
- Previous `stressTestReport` for the retest list.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db`, `db_op:"list"`/`"get"`, `collection:"state"`; `write_db`, `db_op:"set"` (not `update`),
`data:{v:<whole doc>}` for `stressTestReport`. **Never write a test fixture into the live store** —
fixtures live in the harness's shimmed `localStorage`, never in the artifact DB.

## Procedure
1. **Baseline first.** Run the harness on the unmodified file and record exceptions, containers
   rendered and duration. A sweep without a clean baseline measures nothing.
2. **Volume.** Seed oversized state and measure render time and throws: `routineHealth` 5,000 rows,
   `kanbanCards` 2,000, `isaLine` 10,000 messages, `liveFeeds` 50 feeds × 200 citations. Record the
   first container that fails to render and the duration curve.
3. **Edge.** For every watched doc plus the list above, inject `null`, `[]`, `{}`, `"string"`,
   wrong-typed fields, and a row that is a number. Record every throw with the **function name and
   line**. A doc that renders an honest empty state is a Pass; a doc that throws or silently renders
   stale data is a Fail.
4. **FailureInjection.** Run with the host bridge present but its call throwing; with
   `localStorage.setItem` throwing (quota); with the seed JSON removed; with a doc stamp in the
   future. The page must still render and **say what is missing** — a silent blank is a Fail.
5. **Concurrency.** Apply a burst of 200 doc changes, including two conflicting `isaLine` arrays, and
   verify merge idempotence: applying the same burst twice produces the same state.
6. **BackupRecovery.** Restore the full export into the shim under the page's storage prefix, run the
   page, and count: docs restored, parse failures, docs missing `v` (expect the `stravaSnapshot`
   exception), and watched containers rendered.
7. **Route every weakness.** One row per finding, with the owning engineer:
   - crash, throw, unhandled empty state, flaky render → **Reliability Engineer**
   - slow render, O(n²) loop, oversized payload, token waste → **Efficiency Engineer**
   - missing capability, no honest empty state to show, shape needs extending → **Capability Engineer**
   - connector, MCP, bridge, doc-shape contract with an external system → **Integration Engineer**
8. **Re-test, never assume.** A weakness is `Resolved` only after **the same test** passes on the
   fixed file. Until then it is `Monitoring` (fix applied, retest pending) or `Open`.

## Outputs (exact shapes)
`stressTestReport`:
```json
{"v":{"ranAt":"<ISO>","target":"<file or artifact version>","harness":"<runtime harness id>",
 "baseline":{"exceptions":0,"containersRendered":0,"durationMs":0},
 "counts":{"pass":0,"fail":0,"degraded":0},
 "rows":[{"capability":"<what was tested>",
   "testType":"Volume|Edge|FailureInjection|Concurrency|BackupRecovery|Functional|Regression",
   "result":"Pass|Fail|Degraded","weakness":"<symptom + function/line>",
   "engineer":"Reliability|Efficiency|Capability|Integration","fixApplied":"",
   "retest":"Pending|Pass|Fail","status":"Resolved|Monitoring|Escalated|Open"}]}}
```
Restore-test record (BackupRecovery rows also write this to disk next to the backup):
`{"at":"<ISO>","docs":0,"sizeBytes":0,"parseFailures":0,"missingV":["stravaSnapshot"],
"containersRendered":0,"verdict":"pass|fail"}`
Return block for the loop: `{stress:{rows:n, fail:n, degraded:n, routed:{reliability:n, efficiency:n,
capability:n, integration:n}, stillOpen:[{capability, why}]}}`.

## Guardrails
- **Never fix the deck yourself.** Report the exact function and line so the owning engineer can.
- Never run a destructive test against live data, the live store, a connector that sends messages, or
  anything client-facing. Fixtures and the shim only.
- Never write fixtures, seeded volume or injected failures into the artifact DB.
- Never mark a row `Resolved` on a fix alone — only on a passing retest of the same test.
- Never report a Pass for a test that could not run; `result:"Fail", weakness:"could not run: <why>"`.
- Keep each test bounded and deterministic; record `durationMs` so the nightly budget stays honest.
- No secrets in fixtures or the report; redact any value that looks like a key or a token.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** For this skill, halt and escalate when:
- a test would send, post or write to a real person, client, the ISA, or a live CRM;
- a test needs a credential, a paid API, or a permission grant that does not exist;
- the sweep finds a **security** weakness (a secret in a file, an endpoint that reads local files) —
  stop, do not publish the detail in the deck, and hand it to Elena (CISO) as P1;
- a test would modify or delete live data, or the only way to reproduce is against production;
- the same weakness fails its retest twice — stop re-testing and escalate with both results.

Packet → `twinQueue`: `{id:"tw_<epoch-ms>", ts:"<ISO>", from:"vanessa", priority:"p1|p2",
status:"needs-steven", task:"<one line>", note:"<test · symptom · blast radius · recommendation>"}`.

## Logging
- `stressTestReport` — one document per sweep (replaced each sweep; rows carry the history of each
  capability through `retest`/`status`).
- Unresolved rows are mirrored into the cycle's `loopLog.triage` by `loop-engineering`.
- `ciLog` `{date, text}` only when a sweep result changed what the dashboard says.
- Security findings: `twinQueue` P1 to Steven plus a note to Elena — never the detail in `ciLog`.

## Self-test (`selftest:stress-test-sweep`, nightly suite, StressResilience)
A miniature sweep, offline, ≤60 s, no sub-agents — the nightly suite already fails on timeout
(exit 124, last error 2026-09-15), so this is the small version, not the weekly one.
1. Harness sanity: run the shim against the current file; assert it loads with zero exceptions and
   renders at least one watched container. Any exception is a Fail with the function name.
2. Edge mini-set: inject `null`, `[]` and `"string"` into three watched docs; assert no throw and an
   honest empty state in each.
3. `stravaSnapshot` shape bug: inject the no-`v` document; assert the page reports it rather than
   rendering stale numbers as if they were current.
4. Quota injection: make `localStorage.setItem` throw once; assert the page still renders and says so.
5. Report shape: build one `stressTestReport` row; assert `testType`, `result`, `engineer` and
   `status` are all from their allowed sets. Write nothing to the deck.
Report `{id:"selftest:stress-test-sweep", category:"StressResilience", result, detail}` into `selfTest`.
