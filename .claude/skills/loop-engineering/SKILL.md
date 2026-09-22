---
name: loop-engineering
description: "The weekly self-improvement cycle (v2): every agent, skill and routine gets a Goal, a Loop and a Routine; changes are proposed, tested against an untouched holdout, compared, then promoted or rejected and logged; trust graduates L1 to L2 to L3 only on seven consecutive correct runs. Use for the weekly loop, the nightly self-test suite, or when Steven asks whether the system is actually getting better."
---

# loop-engineering v2 — propose → test → compare → promote/reject → log

Seat: Vanessa (Claude Fable 5.1) chairs; Elon, the CTO Innovator (Opus 5), runs the gate;
`sandbox-qa` runs the isolated test-and-compare; the Engineering Team (Reliability, Efficiency,
Capability, Integration, Stress Test) does the work; report seats run on Sonnet 5.

## Trigger
- **Weekly** — Mac task `loop-engineering-weekly`, cron `30 4 * * 6` = **Sat 4:30 AM PT**; enabled,
  **never run** as of 2026-09-22. The cloud twin "Weekly Loop Engineering QA" (`0 16 * * 0` UTC)
  **FAILED 2026-09-20** and cannot write the DB unattended — it is report-only QA.
- **Nightly** — `nightly-self-test`, cron `0 23 * * *` = 11:00 PM PT; **error (timeout, exit 124)**,
  last end 2026-09-15. It runs the self-test suite only, not the full cycle.
- On demand when Steven asks for a loop cycle. Cycle numbering continues the `loopLog` (cycles 1–5
  ran Sep 9–10, 2026; the exported log carries four entries — 1, 3, 4, 5 — cycle 2 is referenced
  inside cycle 3 but was never logged; this session is cycle 6).

## Inputs
`loopLog` (previous cycles, trust levels, open halts, triage), `routineHealth`, `runnerStatus`,
`selfTest`, `stressTestReport`, `cpiOpportunityLog`/`cpiCycles`, `scaleOpportunityLog`,
`improvementProposals`, `auditFindings`, `twinQueue`, `aiTeamRoster`, `toolkitSnapshot`, plus the
sub-skills this cycle calls: `prompt-master`, `continuous-process-improvement`,
`scale-growth-engine`, `stress-test-sweep`, `skills-refresh`, and Nadia's disruption brief.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db`, `db_op:"get"`, `collection:"state"`, `doc_id`; `write_db`, `db_op:"set"` (not `update` —
it fails when the doc does not exist), `data:{v:<whole doc>}`. Read `loopLog` before writing and
append one entry per cycle. **`loop-engineering` is the only writer of `loopLog`.**

## Goal → Loop → Routine (every agent, skill and routine has all three)
- **Goal** — one sentence, measurable, with the metric and where it is read.
- **Loop** — what is measured each cycle, the threshold that means "working", and what happens when
  it is missed.
- **Routine** — the concrete schedule that runs it (task name + cron, PT), or `none — on demand`.
An item with no Goal/Loop/Routine is not improved this cycle; it gets one written first.

## Procedure
1. **Baseline.** Read the inputs. Build the cycle's fact sheet: what ran, what failed, what produced
   nothing, what never ran. Honest labels only: "never run under the runner", "last ok <date>",
   "failed <date>: <reason>".
2. **Hold out.** Freeze an **untouched holdout set** before any change: ~20% of the items under test
   (named in the cycle entry), selected for coverage, not convenience. Nothing in the holdout is
   edited, tuned or fixed this cycle. It exists to detect improvements that only move the items you
   were looking at.
3. **Propose.** Collect candidate changes from the sub-skills (prompt diffs, CPI implants, ADR items,
   stress-test fixes, skill drift). Each proposal: target, change, hypothesis, measurement, risk,
   rollback.
4. **Test in isolation.** `sandbox-qa` runs each proposal in a sandbox against fixtures — never
   against live client, ISA or production data.
5. **Compare.** Before/after on the named metric, plus the holdout. Promote only when the target
   improved **and** the holdout did not regress. A change that improves the target and degrades the
   holdout is rejected and logged as such.
6. **Promote or reject.** Promoted changes are applied by the owning engineer at trust **L1** and
   enter the graduation ladder. Rejected changes are logged with the reason so the next cycle does
   not re-propose them blind.
7. **Self-heal, then triage.** A break with a known, reversible fix (a stale stamp, a wrong task
   name, a missing container guard) is healed and counted in `healed`. Anything else — an unknown
   cause, a credential failure, a pre-existing failing test — goes to the **Triage inbox**
   (`loopLog[].triage`) with the exact symptom and where it was seen. Never heal by deleting.
8. **Write the cycle entry, the weekly report and the brief.**

## Trust graduation (L1 → L2 → L3)
- **L1 — report only.** Output is read by a human before anything acts on it.
- **L2 — draft/propose.** May prepare the change or the message; a human approves the send/apply.
- **L3 — act.** May act unattended inside its stated scope.
- Promotion requires **seven consecutive correct runs** at the current level, each one countable in a
  log (a run that produced nothing does not count, and a run nobody checked does not count).
  **Never promote straight to L3.** One incorrect run resets the streak to zero.
- Client-facing sends, credential handling, money, deletions and anything the ISA sees stay at **L2
  permanently** unless Steven says otherwise in writing.
- Record per capability: `{level, streak, lastCorrectRun, evidence}`.

## Self-test suite (categories the nightly run executes)
`Functional` · `Integration` · `Orchestration` · `Regression` · `BackupVerification` ·
`StressResilience`. Each registered test is `{id:"selftest:<skill>", category, target, result, detail,
durationMs}`. Budget: the whole suite under the task's timeout — today `nightly-self-test` fails on
**timeout (exit 124)**, so each test is bounded (≤60 s), offline, and dispatches no sub-agents until
that is fixed. A test that cannot run reports `result:"Fail", detail:"could not run: <why>"` — never
a silent pass.

## Outputs (exact shapes)
`loopLog` — append one entry per cycle, keeping the live shape:
```json
{"v":[{"cycle":6,"ts":"<ISO>","agents":0,"proposed":0,"tested":0,"promoted":0,"rejected":0,
 "halted":0,"halts":["<one line each>"],"healed":0,
 "triage":["<symptom + where seen>"],"needsSteven":["<one line each>"],
 "findings":["<F-id or one line>"],
 "trustLevels":{"<capability>":"L1|L2|L3 + streak note"},
 "report":"<where the weekly report lives>","vaultNote":"40-Decisions/<date> loop cycle <n>.md",
 "holdout":["<item>"],"kind":"full|verification-only"}]}
```
`trustLevels` (deck doc, mirror of the cycle's map for the dashboard):
`{"v":{"<capability>":{"level":"L1|L2|L3","streak":0,"lastCorrectRun":"<ISO|null>","evidence":"<where counted>"}}}`
`selfTest` (written by the nightly run):
`{"v":{"ranAt":"<ISO>","suite":"nightly","counts":{"pass":0,"fail":0,"skipped":0},
"rows":[{"id":"","category":"","target":"","result":"Pass|Fail|Skipped","detail":"","durationMs":0}],
"healed":[],"triage":[]}}`

### Weekly report template (`vault/40-Decisions/<date> loop cycle <n>.md`)
```markdown
# Loop Cycle <n> — <date>
Baseline: <what ran / failed / never ran, with dates>
Holdout: <items frozen this cycle>
Proposed <n> · Tested <n> · Promoted <n> · Rejected <n> · Healed <n> · Halted <n>
## Promoted        (change · metric before → after · holdout effect · trust level)
## Rejected        (change · why · do not re-propose unless <condition>)
## Healed          (what broke · fix · how it was verified)
## Triage inbox    (symptom · where seen · owner)
## Trust ladder    (capability · level · streak /7)
## Needs Steven    (one line each, mirrored to twinQueue)
```
### Brief template (what Steven reads — ≤10 lines)
```markdown
Loop cycle <n>, <date>. <one-line headline>.
Better: <≤3 measured improvements>
Worse/blocked: <≤3, with the reason>
Needs you: <≤3, each a decision with a recommendation>
Trust changes: <capability L1→L2, streak n/7>
Next cycle: <the one thing>
```

## Guardrails
- Do not change anything in the holdout set, and do not re-select the holdout after seeing results.
- Do not promote on a single run, on an unmeasured metric, or past a failed holdout.
- Never test against live client, ISA or production data; fixtures only.
- Never heal by deleting, pruning or disabling something to make a test pass.
- One cycle entry per cycle; never rewrite a past entry (corrections go in the new entry).
- Never claim a task "works" because it ran — score on **output**, the way `r10-automation-health`
  does. A task that ran and wrote nothing is a failure.
- No secrets in the log, the report or the brief.

## HALT conditions (verbatim rule, then the standing list)
Escalate — halt = true — **"anything irreversible, outside scope, needing credentials/permissions/
money, or a human decision."**
Standing halts carried forward from the loop log, still in force:
- **"ISA-line outbox refactor — touches five tasks, changes what the ISA sees"**
- **"skill prune — destructive"**
Also halt on: any client-facing send; any credential rotation or permission grant (e.g. Zoho's
`Crm_Implied_Api_Access`, which only Steven can enable); any spend; any store migration, bulk
overwrite or deletion; any promotion straight to L3; any change to what the human ISA is asked to do.
Every halt is counted in `halted`, named in `halts[]`, and mirrored to `twinQueue` as
`{id:"tw_<epoch-ms>", ts, from:"vanessa", priority:"p1|p2", status:"needs-steven", task, note}`.

## Logging
`loopLog` (one entry per cycle — the only writer) · `trustLevels` (mirror) · `selfTest` (nightly) ·
`twinQueue` (escalations) · vault weekly report + dated decision note · `ciLog` `{date, text}` only
when the cycle changed the dashboard.

## Self-test (`selftest:loop-engineering`, nightly suite, Regression)
Offline, ≤60 s, no sub-agents.
1. `loopLog` round trip: read, append a synthetic cycle in memory, assert the four logged cycles
   (1, 3, 4, 5) are unchanged and every key above is present. Do not write.
2. Holdout integrity: with a fixture cycle, assert no holdout item appears in `promoted` or `healed`.
3. Trust ladder: feed 6 correct runs → still L1; the 7th → L2; then one incorrect run → streak 0 and
   the level does not rise. Assert a direct L1→L3 jump is refused.
4. Halt wiring: feed a proposal tagged `touchesISA` and one tagged `deletesSkill`; both must produce
   the verbatim standing halt lines and a `twinQueue` packet in memory.
5. Suite registry: assert every category above has at least one registered test id, and that each
   registered test declares a time budget ≤60 s.
Report `{id:"selftest:loop-engineering", category:"Regression", result, detail}` into `selfTest`.
