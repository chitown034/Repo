---
name: prompt-master
description: "Once per loop cycle, reviews the orchestrator's and the executives' system prompts against measured outcomes — runs, failures, rework, escalations — and proposes at most five prompt diffs through the weekly-self-update human gate. Never edits a live prompt. Use when the weekly loop asks for the prompt review, or when Steven asks why an agent keeps getting something wrong."
---

# prompt-master — prompt review against measured outcomes

Seat: reports to the CTO Innovator (Elon) inside the weekly loop; Vanessa (Claude Fable 5.1) chairs
the cycle. Run this seat on **Claude Opus 5** — it is a judgment call, not a report.

## Trigger
- Once per loop cycle, called by `loop-engineering` (Mac task `loop-engineering-weekly`,
  cron `30 4 * * 6` = Sat 4:30 AM PT). One run per cycle — if a cycle already has a
  `promptReview` block, stop and say so.
- On demand when Steven asks "why does <seat> keep doing X?" — same procedure, one seat only.

## Inputs
- **Prompts (read-only)**: the agent definitions on the Mac (`~/.claude/agents/<slug>.md`) and the
  roster doc `aiTeamRoster` (161-doc export: 172 agents, generatedAt 2026-09-16). Seats in scope:
  `vanessa-orchestrator` plus the eight executives — `cro-victor`, `cmo-sofia`, `cfo-marcus`,
  `cto-derek`, `cco-alexandra`, `ciso-elena`, `caio-nadia`, `cto-innovator`.
- **Measured outcomes**: `loopLog` (cycles, promoted/rejected/halted, trustLevels), `routineHealth`
  (counts ok/failed/late/neverRun/producedNothing/stale), `vanessaRuns`, `vanessaRecommendations`,
  `cpiOpportunityLog`, `stressTestReport`, `selfTest`, `isaKpi`, `twinQueue` (needs-steven items).
- **Evaluator scores** when present: `agent-evaluator` (tier 2, under Nadia) scores output on
  accuracy, completeness, clarity, actionability, conciseness.

## Data access
`Artifact` tool against `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`:
`read_db` / `db_op:"get"` / `collection:"state"` / `doc_id`; `write_db` / `db_op:"set"` (not
`update` — it fails on a doc that does not exist) with `data:{v:<whole doc>}`. Read-modify-write,
always. An unattended cloud run's DB write parks on a permission prompt (confirmed three times,
Sep 2026) — from a cloud routine, print the proposals in the run output and let the Mac write them.

## Procedure
1. **Collect evidence per seat.** For each seat: runs in the cycle, failures with reasons, rework
   (a second pass on the same task), escalations raised, evaluator scores. A seat with zero runs
   gets `evidence:"no runs this cycle"` and is not diagnosed.
2. **Separate prompt faults from infrastructure faults.** A credential outage, a dead daemon, a
   missing API grant or a never-run task is **not** a prompt fault. Worked example from this cycle:
   `lead-triage-daily` and `r2-lead-response-watchdog` ran fine and failed on
   "Invalid API Key or authentication credentials" (since 2026-09-16) — that is an integration
   finding, not a prompt diff. Route those to the Integration or Reliability Engineer instead.
3. **Diagnose** each real prompt fault to one of: missing constraint, missing output shape, wrong
   altitude (too vague / too prescriptive), missing escalation rule, missing honesty rule, stale fact
   baked into the prompt.
4. **Write at most five diffs**, ranked by measured cost. Each diff carries a ≤10-line excerpt of the
   current text, the proposed replacement, the evidence, the expected effect, how it will be
   measured next cycle, the risk, and the rollback. A diff without a named measurement is not a diff.
5. **Submit to the human gate.** Append to `improvementProposals` with `status:"Proposed"`. The gate
   is `weekly-self-update` (Mac runner slot Fri 11:10 PM PT, cron `10 23 * * 5`, **never run** as of
   2026-09-22) — say so in the report rather than implying the gate is live.
6. **Never apply.** Applying an approved diff is the job of the Capability Engineer after Steven
   marks it `Approved`, and only then.

## Outputs (exact shapes)
`improvementProposals` (currently `{v:[]}` — empty, never written):
```json
{"v":[{"id":"pm-<YYYYMMDD>-<nn>","ts":"<ISO>","source":"prompt-master","seat":"cro-victor",
 "area":"system-prompt","evidence":"<measured fact + doc/task it came from>",
 "currentExcerpt":"<=10 lines","proposedExcerpt":"<=10 lines","expectedEffect":"<one line>",
 "measurement":"<metric + where it is read next cycle>","risk":"low|medium|high",
 "rollback":"<one line>","status":"Proposed","decidedBy":null,"decidedAt":null}]}
```
Return block to `loop-engineering` for the cycle entry:
`{promptReview:{seatsReviewed:n, proposals:n, infraRouted:[{seat, to, why}], skipped:[{seat,why}]}}`.

## Guardrails
- **Never edit a live prompt file, agent definition, or skill.** Propose text; do not write it.
- At most five proposals per cycle. If more are found, keep the top five and list the rest as
  `deferred` in the return block.
- Never propose a prompt change whose evidence is a single run, or whose evidence is an outage.
- Never propose loosening a guardrail, an escalation rule, or an honesty rule to raise throughput.
- Quote at most 10 lines of any prompt; never paste a whole prompt into the deck.
- No secrets in a proposal: no keys, tokens, phone numbers, account numbers, or client names.
- Do not re-run inside the same cycle; do not chain into `loop-engineering`.

## HALT conditions
Escalate **"anything irreversible, outside scope, needing credentials/permissions/money, or a human
decision."** For this skill specifically, halt and write a Needs-Steven packet when:
- a fix requires changing what the ISA, a client or a partner sees (per the standing loop halt
  "ISA-line outbox refactor — touches five tasks, changes what the ISA sees");
- a fix requires deleting or pruning skills, agents or tasks (the standing halt "skill prune —
  destructive");
- a fix needs a credential, a paid model, or a permission grant;
- the same proposal has been rejected in a previous cycle and nothing in the evidence changed.

Packet: append to `twinQueue` — `{id:"tw_<epoch-ms>", ts:<ISO>, from:"vanessa", priority:"p2",
status:"needs-steven", task:"<one line>", note:"<blocked on what, options, recommendation>"}`.

## Logging
- Proposals → `improvementProposals` (shape above), one entry per diff.
- Run record → the cycle's `loopLog` entry, via the return block; `prompt-master` does not write
  `loopLog` itself (single-writer rule: `loop-engineering` owns that doc).
- If a proposal is later marked `Applied`, the Capability Engineer adds the `ciLog` line
  (`{date, text}`), not this skill.

## Self-test (`selftest:prompt-master`, nightly suite, Functional)
Offline, ≤30 s, no sub-agents, no network — the nightly suite already fails on timeout (exit 124,
last error 2026-09-15), so keep it cheap.
1. Read `improvementProposals`; assert it parses and is an array (empty is a Pass, and the test
   reports `proposals:0` honestly rather than treating empty as broken).
2. Build one proposal object in memory; assert every key in the shape above is present, `status` is
   `"Proposed"`, and both excerpts are ≤10 lines. Do not write it.
3. Infrastructure-vs-prompt classifier: feed `"Invalid API Key or authentication credentials"` and
   `"the seat answered without the four COAs it is required to produce"`; expect `infra` then
   `prompt`. Any other result is a Fail.
4. Cycle-idempotence: with a stub `loopLog` whose newest entry already has `promptReview`, assert the
   skill refuses to produce a second review.
Report `{id:"selftest:prompt-master", category:"Functional", result, detail}` into `selfTest`.
