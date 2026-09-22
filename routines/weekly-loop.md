# Routine spec — Weekly Loop (loop-engineering v2)

Drives the `loop-engineering` skill and the sub-skills it calls: `prompt-master`,
`continuous-process-improvement`, `scale-growth-engine`, `stress-test-sweep`, `skills-refresh`, plus
Nadia's disruption brief and Elon's feasibility gate.

## Where it runs
**Mac runner (`claude-runner`)** — it must write `loopLog`, `trustLevels` and `selfTest`, and an
unattended cloud run's DB write parks on a permission prompt. The cloud routine
"Command Deck & ISA Portal Weekly Loop Engineering QA" (`0 16 * * 0` UTC, **FAILED 2026-09-20**) stays
**report-only QA**: it may read and report, it may not be the cycle of record.

## Schedule
| | Cron | Local (America/Los_Angeles) | UTC |
|---|---|---|---|
| Weekly cycle (Mac, existing task `loop-engineering-weekly`) | `30 4 * * 6` | **Sat 4:30 AM PT** | Sat 11:30 UTC (PDT) |
| Nightly self-test suite (Mac, existing task `nightly-self-test`) | `0 23 * * *` | **11:00 PM PT daily** | 06:00 UTC next day |
| Cloud QA (report-only, existing) | `0 16 * * 0` UTC | Sun 9:00 AM PT | Sun 16:00 UTC |

Status as of 2026-09-22: `loop-engineering-weekly` enabled, **never run**; `nightly-self-test`
**error — timeout, exit 124**, last end 2026-09-15. Fix the timeout before adding tests: every
registered self-test must be offline, dispatch no sub-agents, and finish in ≤60 s.

## Models
Vanessa chairs on **Claude Fable 5.1**; Elon (CTO Innovator), `sandbox-qa`, `stress-test-engineer`
and the prompt review run on **Claude Opus 5**; report/compile seats on **Claude Sonnet 5**;
research on **Perplexity** (≤4 per wave). Sub-agent fan-out ≤8.

## Tools
- `Artifact` `read_db` / `write_db` against `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`.
- The runtime harness (pure-Node DOM shim) for `stress-test-sweep`; filesystem for the vault report.
- Perplexity MCP for the disruption inputs. No messaging tools: this routine never sends.

## Prompt text (paste verbatim into the task)
```
Run the weekly loop with the loop-engineering skill. Continue the cycle numbering in loopLog
(cycles 1-5 ran Sep 9-10 2026).

1. Baseline: read loopLog, routineHealth, runnerStatus, selfTest, stressTestReport,
   cpiOpportunityLog, cpiCycles, scaleOpportunityLog, improvementProposals, auditFindings,
   twinQueue, toolkitSnapshot. Write the fact sheet: what ran, what failed, what produced nothing,
   what never ran - with dates.
2. Freeze the holdout: name ~20% of the items under test. Nothing in it is touched this cycle.
3. Collect proposals: prompt-master (<=5 prompt diffs, HITL gate), continuous-process-improvement
   (weekly deep pass), scale-growth-engine (ADR pass), stress-test-sweep (weekly sweep),
   skills-refresh (drift). Each proposal: target, change, hypothesis, measurement, risk, rollback.
4. Test each in the sandbox against fixtures - never live client, ISA or production data.
5. Compare before/after on the named metric AND the holdout. Promote only if the target improved and
   the holdout did not regress. Log every rejection with its reason.
6. Apply promoted changes at trust L1. Graduate trust only on seven consecutive correct runs;
   never promote straight to L3; one bad run resets the streak.
7. Self-heal only known, reversible breaks. Everything else goes to the triage inbox with the exact
   symptom and where it was seen. Never heal by deleting.
8. Write one loopLog entry for this cycle, mirror the trust map to trustLevels, write the weekly
   report to vault/40-Decisions/<date> loop cycle <n>.md, and the <=10-line brief for Steven.
   Mirror every needsSteven line to twinQueue as a needs-steven packet.
9. Print the brief in the run output too.

HALT (halt=true, escalate, do not work around): anything irreversible, outside scope, needing
credentials/permissions/money, or a human decision. Standing halts still in force: "ISA-line outbox
refactor - touches five tasks, changes what the ISA sees" and "skill prune - destructive".

Score on OUTPUT, not execution: a task that ran and wrote nothing is a failure. Never claim a
capability is live unless a doc, status or listing proves it.
```

### Nightly suite prompt (for `nightly-self-test`)
```
Run the registered self-test suite only - categories Functional, Integration, Orchestration,
Regression, BackupVerification, StressResilience. Every test is offline, dispatches no sub-agents,
and has a <=60 s budget; a test that cannot run reports Fail with "could not run: <why>", never a
silent pass. Write the selfTest doc {v:{ranAt, suite, counts{pass,fail,skipped}, rows[], healed[],
triage[]}} and print the counts. Heal only known, reversible breakage; everything else to triage.
```

## Success condition
1. `loopLog` gained exactly one entry for this cycle, with `holdout[]` non-empty and
   `proposed/tested/promoted/rejected/halted/healed` all populated.
2. Nothing in the holdout appears in `promoted` or `healed`.
3. Every promotion cites a before/after measurement; every rejection cites a reason.
4. `trustLevels` reflects the cycle, with no capability above L1 that lacks a 7-run streak.
5. The weekly report exists in the vault and the ≤10-line brief is in the run output.
6. Every `needsSteven` line has a matching `twinQueue` packet.

**Failure**: no `loopLog` entry, a promotion without a measurement, a holdout item that was touched,
a straight-to-L3 promotion, a halt that was worked around, or a self-test suite that timed out
(today's actual state — report it as a failure, do not skip it).

## First run
`loop-engineering-weekly` has never run. Run it once manually, confirm the `loopLog` entry appears
and the nightly suite completes inside its timeout, before trusting any of this schedule.
