## Orchestrator response (2026-10-23 19:05 UTC) — pass 3 verdict SHIP; the LOW applied (reviewed 96d0ee464204f7cd → 254097c175929cfc)

change-set: 254097c175929cfc

LOW P3-08-F1 backfill double count — fixed: `meta.sourceDays` keeps `_before_until` (the daemon's last_at day) and a backfilled day at or before it is not added to the daemon's count; test `test_backfill_of_a_daemon_day_does_not_double_count_the_source`. 8 tests OK, validate-code PASS (8).
Open question answered: the five daemon-only metrics now carry empty week windows (their latest/earliest kept) — honest, since they hold only September data.
Unverified (workout parser on a real export with workouts) stays open until the first export with a workout arrives; the parser is defensive (every field optional) and the test fixture has no workouts yet.

# VibeBreaker Final Report (pass 3): health-drive-sync.py pass-2 fixes re-verified

change-set: 96d0ee464204f7cd

(Run on the uncommitted tree on 2026-10-23, branch claude/stoic-cori-pvn3f8. `bash scripts/validate-code.sh` gave
`verdict: PASS (8 passed, 0 failed)`. `python3 -m unittest -q scripts.tests.test_health_drive_sync` ran 7 tests, OK. The `--hash`
re-run just before this file was written gave 96d0ee464204f7cd. The reviewer changed no source file. Probes wrote only to the
scratchpad (`p3/`), on the two real export files and the saved appleHealth doc, compared with booleans and counts only. No health
value is quoted here.)

## Verdict

`SURVIVED*` (repo verdict: **SHIP**). P2-06-F1, P2-08-F1 and U2-1 are fixed, and my own probes on the real files confirm it.
`meta.sourceDays` grows linearly, at about a quarter of the rate `daily` already grows, and an old doc migrates cleanly. What is
left is one LOW finding on a manual-backfill path the daily routine never takes, plus one UNVERIFIED item on the workout parser,
which the new BodyPark rows now depend on.

## Scope

- Diff mode, third pass. Passes 01, 04, 05, 06, 07, 08, 12, 17, 18, 19 and 20 on `scripts/health-drive-sync.py` (merge, window_stats,
  main) and `scripts/tests/test_health_drive_sync.py`. Pass 01 on the new BodyPark rows in `integrations/apple-health-dashboard.md`
  (lines 34-40), `integrations/CONNECTIONS.md` (line 26) and `docs/STEVEN-STEPS.md` click E.
- Still not available: the deck HTML that renders the tiles (no file in `dashboard/` reads `avg7`, `samples` or `sources[].n`), so
  I cannot verify how a null `avg7` renders. There is also no real Health Auto Export file with Workouts switched on.
- Material scope limitation: NO for the fixes, YES for U3-1.

## Scoreboard

Passes executed: 11 / 20 (diff mode) · Confirmed: 1 (Low 1) · Unverified: 1 · Rejected: 4 · First critical pass: NONE

## Pass-2 findings: re-verification

| Pass-2 id | Probe | Result |
|---|---|---|
| P2-06-F1 windows only for metrics in the day's file | (a) Real files: 2 of 12 metrics are in neither file (both daemon-only). (b) Synthetic: one point metric with 2+ week days is removed from the 10-22 file. I compare 10-21 then 10-22w against both in one run. | **FIXED.** (a) Both daemon-only metrics come out days7 0, avg7/pavg7 null, latest kept, samples = Σ daily n (unchanged from the daemon). (b) The dropped metric's whole metric object equals the one-run result (days7 1). Note: the caller said "five daemon-only metrics", but on these files it is two. |
| P2-08-F1 sources.n undercounts on a rewritten file | B2 (10-21 then 10-22) plus a fuller rewritten 10-22, where one metric gets twice the rows, compared with 10-21 + rewritten 10-22 in one run | **FIXED.** sources and metrics are equal to the one-run result, and ingests is equal. Re-feeding 10-22 onto its own output is idempotent (metrics, daily, sources, sleep, workouts, sourceDays). Split equals combined. |
| U2-1 no --existing silently rebuilds | `--existing` omitted | **FIXED.** rc 4 with a clear message. `--allow-empty-existing` alone gives rc 0. |

## meta.sourceDays: growth and migration

- Shape: one key per `metric|source` and one integer per local day, plus at most one `_before`. The key cannot collide, because
  metric names come from KNOWN and contain no `|`. Measured on the merged real doc: 10 keys, 26 entries, about 31 bytes per entry.
  `daily` costs about 135 bytes per metric-day. With one source per metric (true today, max 1 key per metric), sourceDays adds about
  23% to the growth daily already has. With the click-E "select all" (about 40 metrics, about 2 sources each), the projection is
  about 2.5 KB a day, or about 0.9 MB a year. That is the same linear, unpruned class as `daily`, not a new one. Both would need the
  same pruning rule if the ArtifactData document size limit is ever reached. That limit is not in the repo, and this is not a finding.
- Migration: the real daemon doc has no `meta.sourceDays`. For all 7 source rows the run touched, `_before == the daemon's n`, the new
  day keys are only 10-21 / 10-22, and `n == Σ sourceDays`. Sources the run did not touch are byte-unchanged. New source rows have no
  `_before`. A later run does not re-seed `_before`, because the seed happens only when the key is empty.

## CONFIRMED

```yaml
id: P3-08-F1
pass: 08
title: The first per-day count double-counts a day the daemon had already counted when a backfill export holds that day
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 279-283 (`if old and not sd: sd["_before"] = old.n` then `sd.update(per_day)`)
entry_or_trigger: >-
  The first run that touches a metric|source has an export containing a local day on or before the daemon's last_at for that
  source. Example: a manual Health Auto Export date-range export covering early September.
evidence: >-
  Probe: a one-sample file for blood_oxygen_saturation is dated the daemon's last_at day, with the daemon's own source string, and
  run onto the real doc. sources.n becomes the daemon n + 1, but that day was already inside the daemon n. The same run also
  replaces that day's daily bucket whole with the one-sample bucket (by design, "a day is replaced whole").
bad_state: sources[].n overstates by that day's daemon-counted samples, permanently (later runs never revisit _before).
disproof_attempt: >-
  The daily routine only feeds the newest files (10-21 onward, more than a month after the daemon's last day), so it cannot reach
  this. No file in dashboard/ reads sources[].n. Severity stays LOW, and the finding is non-blocking.
fix_direction: >-
  Either document "never backfill a pre-2026-09-13 day" in apple-health-dashboard.md, or seed _before only from samples whose
  day is not in per_day (the daemon doc does not keep per-day source counts, so the documentation route is the honest one).
proof_of_fix: >-
  A test that seeds a daemon source row, feeds a file holding a day <= its last_at, and asserts the documented behaviour
  (refusal, warning, or an unchanged n).
```

## UNVERIFIED

- **U3-1 (pass 04/07): workout field units and names against a real Health Auto Export workout.** `read_exports` treats a bare
  numeric `duration` as minutes and reads `activeEnergy` / `distance` / `heartRate` as `{qty, units}` dicts. Neither real file holds
  a `workouts` array, and the tests feed workouts only through the existing doc. The new BodyPark rows (apple-health-dashboard.md
  lines 34-40, CONNECTIONS.md line 26, STEVEN-STEPS click E) route ATOM sessions through exactly this path. Missing artifact: one
  real `HealthAutoExport-*.json` produced after click E with Workouts on. If HAE writes duration in seconds, every workout's
  `minutes` comes out 60x too large.

## REJECTED

- R3-1 window_stats crashes on a non-date day key: every daily key in the real doc matches YYYY-MM-DD, and the script writes only `%Y-%m-%d`.
- R3-2 a non-dict `meta.sourceDays` crashes the merge: only reachable by a hand-corrupted doc, since the script always writes a dict.
- R3-3 empty week windows for daemon-only metrics are a regression: this is the chosen behaviour (stale September figures shown as a week would be false), and latest/latest_at are kept.
- R3-4 BodyPark doc rows overclaim: they state "no API documented" and route through the Apple Health workout path, which the code does parse. Whether that path is correct is U3-1.

## Coverage (clean)

merge order (daily before ref_day, windows for every metric after the newer-wins update), the window boundary, `_before` seeding,
`n = Σ sourceDays`, idempotent re-feed, split = combined, a rewritten file, a metric absent from today's file, daemon-only metrics,
rc 4 / rc 0 for the existing-doc flags, untouched sources unchanged, meta.files / ingests counting once, and the three BodyPark doc rows.

## Top missing tests (pass 19)

1. A real-shape HAE workout (from a click-E export) gives the right minutes, kcal, km and avg_hr. This closes U3-1.
2. A backfill day <= the daemon's last_at gives the documented sources.n behaviour (P3-08-F1).
3. Migration: an old doc without sourceDays gives `_before == old n` and is seeded once across two runs.
4. A daemon-only metric gives days7 0, avg7 null, and latest/latest_at unchanged.
5. A multi-source metric (Watch + iPhone) gives separate sourceDays keys and per-source n summing correctly after a re-feed.

## Share card

```text
VIBE//BREAKER
VERDICT: SURVIVED*
PASSES: 11/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 1
UNVERIFIED: 1
FIRST BREAK: NONE
```

## Release note

Demonstrated: the three pass-2 fixes hold on the real files, sourceDays growth is linear and secondary to daily, and migration from
the daemon doc is clean. Not demonstrated: deck rendering of null week figures, and workout parsing against a real export.

---

# VibeBreaker Final Report (pass 2): health-drive-sync.py fixes re-verified

change-set: 2fb12036ba4a26c0

(Run on the uncommitted tree on 2026-10-23, branch claude/stoic-cori-pvn3f8. `bash scripts/validate-code.sh` gave
`verdict: PASS (8 passed, 0 failed)`. `python3 -m unittest -q scripts.tests.test_health_drive_sync brain.tests.test_recs` ran 14 tests, OK.
The `--hash` re-run just before this file was written gave 2fb12036ba4a26c0. The reviewer changed no source file. Probes wrote only
to the scratchpad (`cv2/`). The real export files and the pre-existing appleHealth doc were compared field by field with booleans
and counts only, and no health value is quoted here.)

## Verdict

`FIX BEFORE SHIP` (repo verdict: **FIX FIRST**, small). All four pass-1 findings are fixed, and my own probes confirm it on the real
files. One residual of the P06 fix is still open: the week figures are recomputed only for metrics this run's files contain AND
whose fresh `latest_at` wins. A metric sampled less than daily (weight, VO2 max, which STEVEN-STEPS click E switches on) keeps a
stale "7-day" window.

## Scope

- Diff mode, second pass. Passes 01, 04, 05, 06, 07, 08, 12, 17, 18, 19 and 20 on `scripts/health-drive-sync.py` and
  `scripts/tests/test_health_drive_sync.py`. Pass 01 on the changed doc rows (STEVEN-STEPS click E, mac-task-specs §9,
  cloud-routines inventory) and on `brain/tests/test_recs.py` (13 steps).
- Spec: `integrations/apple-health-dashboard.md` (shapes, "pavg7/psum7/pdays7 null when the prior window is empty", merge rule;
  the previous day's file "is sometimes rewritten").
- Not available (unchanged from pass 1): the deck HTML (which fields the tiles render, in particular `sources[].n`, `samples`,
  `avg7` for daemon-only keys), and the routine prompt for trig_015pqDNGrZVENHZEZR8JZYF5 (the exact command line it runs).
  Material scope limitation: NO for the confirmed finding, YES for U2-1.

## Scoreboard

Passes executed: 11 / 20 (diff mode) · Confirmed: 2 (Medium 1, Low 1) · Unverified: 1 · Rejected: 6 · First critical pass: NONE

## Pass-1 findings: re-verification

| Pass-1 id | Probe (real files unless noted) | Result |
|---|---|---|
| P06-F1 week stats from the run's files | 10-21 file onto the daemon doc, then the 10-22 file onto that output, vs. both files in one run | **FIXED.** All 13 metric fields (avg7…pdays7, samples, latest, latest_at, earliest) are equal for every metric. daily, sleep, workouts and sources are equal too. A 14-day fixture gives days7 7, pdays7 7, pavg7 non-null. The window boundary is (ref−7, ref], with ref−7 in the prior window. |
| P08-F1 counts not idempotent | the 10-22 file re-fed onto its own output; both files re-fed onto the combined output | **FIXED.** metrics, sources, daily and meta.ingests are byte-equal across each re-feed. `samples == Σ daily n` holds for every metric (the daemon doc already satisfied it, so there is no semantic jump). |
| P05-F1 missing --existing empties the doc | --existing missing, bad JSON, `[]`, `{"data":{"v":null}}`, `{"data":5}`, no `metrics`, `metrics` a list, a directory | **FIXED.** Each returns rc 4 and creates no --out. The real ArtifactData save parses (`{v:…}`), and daemon keys, daily days and workouts are all kept. |
| P01-F1 stray table row | `docs/inventory/cloud-routines-2026-10.md` | **FIXED.** One separator, directly under the header. |

## CONFIRMED

```yaml
id: P2-06-F1
pass: 06
title: Week figures are recomputed only for metrics the run's files contain and whose fresh latest_at wins; every other metric keeps a stale 7-day window
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 246-253 (window_stats is called only inside `for k, m in fresh_metrics.items()` and only on the newer-wins branch)
entry_or_trigger: >-
  (a) A metric sampled less than daily, such as weight_body_mass, vo2_max or body_fat_percentage (the click-E metrics), has no row in
  the files of a later run. (b) A run holds only an older or rewritten file (the 10-21 file after the 10-22 one), so the old
  latest_at wins.
evidence: >-
  Probe (a): run 1 is a 10-12 file with weight and steps. Run 2 is a 10-22 file with steps only, on top of run 1. weight comes out
  days7 1, n7 1, avg7 non-null. window_stats on the same merged daily at the ref day 10-22 gives days7 0, n7 0, pdays7 1. So
  "two sequential runs == one combined run", the invariant the new test asserts, fails for that metric: one run of both files gives
  the recomputed figures. Probe (b): the 10-22 file, then the 10-21 file alone. step_count daily holds 2 days and Σ daily n is 3,
  but the metric shows days7 1 and samples 1.
failure_scenario: >-
  A weight logged 9 days ago keeps showing a "7-day average" from 9 days ago, and days7/n7 never fall to 0. The "vs prior week"
  delta that the correct window would give (pdays7 1) never appears. After (b), samples and days7 contradict the doc's own daily.
impact: wrong 7-day figure and trend on low-frequency tiles. These are the metrics Steven is asked to turn on in click E.
remediation_direction: >-
  After the merge, run window_stats(k, daily[k], ref_day) for every metric key that has a daily entry, not only the fresh winners.
  The latest/latest_at tie-break stays as it is. Steven or Derek should decide whether the five daemon-only keys (September daily)
  get recomputed to null week figures or keep their frozen ones. The spec does not say.
verification: >-
  Test: file A (day D-10, weight + steps), then file B (day D, steps only) on A's output, gives the same weight_body_mass
  avg7/days7/n7/pdays7 as one run of A+B (days7 0, pdays7 per window). Test: B, then A alone on B's output, gives
  samples == Σ daily n and days7 == 2.
```

```yaml
id: P2-08-F1
pass: 08
title: sources[].n undercounts when the previous day's file is rewritten with rows earlier than the source's stored last_at
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 263-268 (new_n counts only dt > old last_at)
entry_or_trigger: >-
  The spec says the previous day's file is sometimes rewritten. The routine feeds it again with D's file, and the rewrite adds
  late-synced rows timed before the last_at that the earlier run stored.
evidence: >-
  Probe: run 1 is the 10-21 file with one row. Run 2 is the rewritten 10-21 file (an extra 07:00 row) plus 10-22, on run 1's
  output. sources n (iPhone) comes out 2. One combined run gives 3, and samples (Σ daily n) is 3 in both. Re-feeds are idempotent.
failure_scenario: >-
  sources[].n drifts below the true count, and one run of all files no longer equals sequential runs for sources. The metric
  fields are unaffected because daily days are replaced whole.
impact: provenance count only. Whether any tile renders sources[].n is NEEDS-CONTEXT (deck HTML not in repo).
remediation_direction: >-
  Derive n from data that is replaced whole, for example a per-source, per-day count kept beside daily. Or accept it as provenance,
  and say so in the docstring.
verification: the rewritten-D-1 sequence gives the same sources[].n as one combined run.
```

## UNVERIFIED

- **U2-1 — omitting `--existing` entirely still builds from empty with rc 0.** Probe: no `--existing` and no `--allow-empty-existing`
  gives rc 0 and writes --out. The help text for `--allow-empty-existing` reads as if starting fresh needs the flag. Deciding this
  needs the routine prompt of trig_015pqDNGrZVENHZEZR8JZYF5, to see whether its command always passes `--existing`. If the prompt
  can omit it, the same history loss as P05-F1 follows. A one-line guard would close it: require one of the two flags.

## REJECTED

- window_stats on daemon days missing min/max — handled (min7/max7 from the days that have them; None when none). No trigger in
  real data: all 61 daemon buckets carry {sum, avg, min, max, last, n} and the script always writes min/max.
- Metric whose merged daily is empty — window_stats returns nulls, n7 0, days7 0, samples 0, with no crash. Not reachable for a
  fresh metric anyway (fresh_daily always holds its days).
- Prior-week null rule — pdays7 0 → pavg7/psum7/pdays7 all null, as the spec says. The daemon doc stores pdays7 as null, not 0.
- Day with n>0 but sum null counted in samples but not in the window — no writer produces it, and the daemon doc has none.
- meta.files capped at 90 lets a >90-files-old re-feed count once more — only reachable by a manual backfill of a 3-month-old file.
  Not on the routine path.
- Step E re-letters STEVEN-STEPS ids — no. E is appended after D, and A–D keep their letters. test_recs expects 13.

## Coverage

Clean on probe or read: the exit codes 2/3/4 and the no-write on 4. ArtifactData shape unwrapping. The daemon's metric keys,
daily days, sleep nights, workouts, records and sources are kept on the real doc. dailyDays is recomputed. The windows are
cumulative per day and point per sample. The window boundaries, and the ref day as the newest merged day. Re-feeds are
idempotent for metrics, daily, sources and ingests. meta.files de-duplicates. The 7 refusal shapes. The doc rows (click E, the
mac-task-specs §9 disable line, the cloud-routines table). Not re-reviewed: `brain/links.py` and the remaining docs (unchanged
since pass 1, apart from the rows listed).

## Top missing tests (pass 19)

1. A low-frequency metric absent from the newest file: sequential runs give the same week figures as one combined run (P2-06-F1 a).
2. An older file fed alone after a newer one: samples == Σ daily n and days7 counts both days (P2-06-F1 b).
3. A rewritten D-1 file with an earlier row plus D's file: sources[].n equals the combined run (P2-08-F1).
4. A 14-day history plus one new file gives non-null pavg7/psum7/pdays7 (the probe passed, but no test pins it).
5. Each --existing refusal shape (bad JSON, `[]`, `{"data":{"v":null}}`, `metrics` not a dict) returns 4 with no --out. Only the
   missing path is tested.
6. Neither --existing nor --allow-empty-existing given: the rc that is wanted (U2-1).
7. The window boundary: a day at exactly ref−7 falls in the prior window, not the current one.
8. A point metric's avg7 is Σsum/Σn and not the mean of the daily averages (an unequal n per day).

## Share card

```text
VIBE//BREAKER

VERDICT: FIX BEFORE SHIP
PASSES: 11/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 2
UNVERIFIED: 1
FIRST BREAK: NONE
```

## Release note

Demonstrated: the four pass-1 fixes hold on the real 10-21/10-22 exports and the pre-existing doc. The new code introduced no
crash or data loss in the probed edges. Not demonstrated: how the deck renders these fields, and the routine's real command line.

---

# VibeBreaker Final Report: health-drive-sync.py (Health Auto Export → appleHealth) + links/docs

change-set: c3330a05859bbfac

(Run on the uncommitted tree at 2026-10-23, branch claude/stoic-cori-pvn3f8. `bash scripts/validate-code.sh` gave
`verdict: PASS (6 passed, 0 failed)`. The `--hash` re-run just before this file was written gave c3330a05859bbfac. The reviewer
changed no source file. Probes wrote only to the scratchpad (`cv/`). The health files were read for shape only, and no health
value is quoted here.)

## Verdict

`FIX BEFORE SHIP` (repo verdict: **FIX FIRST**). The deterministic checks pass, and the timezone handling, sleep-night keying,
tie-break and write scope are all correct. Two defects show up on the routine's normal daily path:
- The 7-day statistics are computed from the files given to one run, not from the merged history.
- A re-sync of the same file adds its counts a second time.
A third defect turns a failed read of the existing doc into a silent overwrite of the daemon's history.

## Scope

- Diff mode. Passes 01, 04, 05, 06, 07, 08, 12, 17, 18, 19 and 20 on `scripts/health-drive-sync.py`, `scripts/tests/test_health_drive_sync.py` and `brain/links.py`. Passes 01 and 19 on the doc rows.
- Spec used: `integrations/apple-health-dashboard.md` (shape, timestamp rules, "merge, never clobber", the "pavg7 is null only when the prior window is empty" rule) and `.claude/skills/apple-health-notion/SKILL.md` §4–5.
- Not available: the deck HTML (`AH_LABELS`, and which tiles render `samples` / `sources.n`) is not in the repo, and neither is the routine prompt (trig_015pqDNGrZVENHZEZR8JZYF5; triggers were not touched).

## Scoreboard

Passes executed: 11 / 20 (diff mode) · Confirmed: 4 (High 1, Medium 2, Low 1) · Unverified: 2 · Rejected: 5 · First critical pass: NONE

## CONFIRMED

```yaml
id: P06-F1
title: avg7/min7/max7/sum7/n7/days7 and pavg7/psum7/pdays7 come from the run's files only, not from the merged daily history
status: CONFIRMED
severity: HIGH
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 203-220 (build: w7/p7 built from `rows` = this run's samples)
  - path: scripts/health-drive-sync.py
    line: 233-238 (merge: the fresh metric replaces the old one whole)
entry_or_trigger: the daily routine, which feeds only the files modified since the last sync minus one day (1–2 files)
evidence: >-
  The stats are computed from `rows` (this run's samples) and never read the merged `daily`. Probe: run the 10-21 file, then
  the 10-22 file with the first output as --existing. step_count comes out as days7=1, n7=15. The same two files in one run
  give days7=2, n7=25, and avg7 differs. The merged daily holds both days.
failure_scenario: >-
  From the third daily run onward, every tile's "7-day" average covers at most 1–2 days. pdays7/pavg7/psum7 stay null forever,
  because a run never holds 8+ days of files, so the "vs prior week" delta goes away for good. The spec says null only when the
  prior window is empty.
impact: every Apple Health tile's 7-day figure and trend is wrong every day
remediation_direction: >-
  Compute the windows after the merge, from merged daily[k][day] {sum,n,min,max}. Cumulative: Σsum/days. Point: Σsum/Σn.
  min/max from the daily min/max. Window ending at the newest day key.
verification: >-
  Two sequential single-file runs give the same days7/n7/avg7 as one run of both files. A fixture with 14 days of daily
  plus one new file gives a non-null pavg7.
```

```yaml
id: P08-F1
title: Re-syncing the same export double-counts metrics.samples, sources[].n and meta.ingests (merge is not idempotent for counts)
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 237 (samples = fresh + old)
  - path: scripts/health-drive-sync.py
    line: 251 (n = old n + fresh n)
  - path: scripts/health-drive-sync.py
    line: 256 (ingests += len(paths))
entry_or_trigger: >-
  The routine re-downloads the previous day's file (it is rewritten, and the window is "since last sync minus one day"). Or
  any manual re-run on the same inputs.
evidence: >-
  Probe: the same two files, run twice in a chain. step_count.samples goes 1440 → 1465, 10 of 15 sources rows grow (3 of them
  exactly double), and ingests goes 21 → 23. daily, sleep, workouts and every other metric field are byte-identical across
  the two runs, so those parts are idempotent. The `>=` tie-break at line 235 lets the equal latest_at through to the
  addition.
failure_scenario: Each day's file is counted about twice, so samples and sources.n drift upward without bound. ingests counts files fed, not exports.
impact: provenance/count fields inflate; whether the deck shows them is NEEDS-CONTEXT (deck HTML not in repo)
remediation_direction: >-
  Make the counts a function of state, not of how many runs there were. Keep a per-(metric, source, local day) count map in
  meta, replaced per day like `daily`. Set samples = daemon base + Σ map, and sources.n the same way. Count distinct file
  names (or a sha1 of each file) for ingests.
verification: run the same file twice; assert the output is identical apart from syncedAt/db_now.
```

```yaml
id: P05-F1
title: A missing or unreadable --existing silently becomes {}, and the output (for an ArtifactData `set`) drops the daemon's history
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: scripts/health-drive-sync.py
    line: 289-295
entry_or_trigger: >-
  The routine's read of appleHealth fails or saves to another path, or the saved shape lacks `metrics`. A `data` that is not
  a dict also raises AttributeError (line 293).
evidence: >-
  Probe with --existing pointing at a file that does not exist: rc=0, no warning. The output has dailyDays 2 vs 7, workouts
  0 vs 3, and loses the September days, sources and the daemon-only metric keys.
failure_scenario: the routine `set`s that body, and the September history and workouts are deleted from the live doc
impact: irreversible loss of the daemon's history (it cannot be re-ingested, because the daemon is dead)
remediation_direction: >-
  If --existing is given and is missing, unparseable or has no `metrics`, exit non-zero and write nothing. Starting from empty
  should need an explicit flag.
verification: test that a non-existent --existing path returns non-zero and does not create --out
```

```yaml
id: P01-F1
title: Stray table separator row inserted mid-table
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: docs/inventory/cloud-routines-2026-10.md
    line: 9
evidence: A second `|---|...|` follows the new row, and line 7 is already the header separator. It renders as a row of dashes.
remediation_direction: delete line 9
verification: the rendered table has no dash row
```

## UNVERIFIED

- KNOWN == the deck's AH_LABELS (`health-drive-sync.py:33-44`). Missing: the deck HTML. Only the doc's mapping table could be compared.
- min7/max7 for cumulative metrics are hourly-aggregate min/max, not daily totals (`:210-214`). Missing: the daemon's definition, or the tile code that renders them.

## REJECTED

- Timezone math: `parse_hae_date` builds an aware datetime from the ±HHMM offset, and `utc_str` converts it. The test pins 15:00 -0700 → 22:00 UTC. The real newest sample converts across midnight correctly. Day keys use the sample's own local date. Clean.
- 7-day window anchored on the clock: no. It ends at `newest_all` (`:186, :203`).
- Sleep night keying: `start - 12h` in local time (`:131`). 22:00 and 01:00 starts both key to the evening date. sleepStart is present in the real rows. Clean.
- Tie-break as string: no. `parse_doc_ts` on both sides (`:235`) handles the space, .ffffff and ISO forms.
- NaN: `num` drops NaN (`:96`). `Infinity` would pass, but HAE writes plain numbers, so it is not reachable from the export. Rejected as not reachable.
- Writes outside --out: there is a single `open(a.out, "w")` (`:298`), and stdout carries counts and dates only. Clean.

## Coverage

These were clean:
- read_exports: bad JSON skipped, unknown keys skipped, Avg fallback, workouts id/units.
- merge: daily per-day replace, sleep by night, workouts by id, records carried forward, dailyDays recomputed, sources first/last as same-format strings.
- exit 2/3 paths write nothing.
- brain/links.py: three well-formed rows, brain tests pass.
- Doc rows in CONNECTIONS, db-docs, mac-task-specs §9, decisions, memory, INDEX and toolkit agree with the script.

## Top missing tests (pass 19)

1. Idempotency: the same file twice gives identical output apart from syncedAt/db_now (P08-F1).
2. Sequential runs give the same window stats as one combined run (P06-F1).
3. 14 days of existing daily plus one new file gives non-null pavg7/pdays7 (P06-F1).
4. A missing or malformed --existing returns non-zero and creates no --out (P05-F1).
5. Older export vs newer doc latest_at: the doc metric is kept and samples are unchanged.
6. A non -0700 offset (+0530, and -0800 across DST) gives the right UTC latest_at and the right local day key.
7. A workout with distance in mi, m and km, and a missing id, gives a stable id and the right km.
8. Sleep with only inBedStart, and with a 01:00 start, gives the right night.

## Share card

```text
VIBE//BREAKER
VERDICT: FIX BEFORE SHIP
PASSES: 11/20 (diff)
CONFIRMED: 4 (H1 M2 L1)
change-set: c3330a05859bbfac
```

---

## Orchestrator response (2026-10-23 18:25 UTC) — pass 3 verdict SHIP; the two LOW items applied (reviewed df78258a3a9e3257 → 8919bacd32270b20)

change-set: 8919bacd32270b20

LOW P07-F4 "Starting Vanessa…" not shown in flight — fixed: the note setter calls bmRender() when the note box is not drawn yet; smoke-bm4 every case keeps its note, no page errors.
LOW P05-F5 background `ollama serve` inherits fd 3 — fixed: `3>&-` on that start; 2c now writes the screen copy through a dup (`cat >&3`) and the log copy through `tee -a "$LOG"`, never reopening /dev/fd/3 (so no truncation question on either OS). connect-all-tests 107/107, validate-code PASS (12), brain tests 9/9.
Open for the Mac (unchanged, not blocking): runnerctl restart's fork behaviour; macOS bash 3.2 `return` inside the Ctrl-C trap (the `read || return 130` fallback covers it); BSD sed `I` flag (fails closed).

# VibeBreaker Final Report (pass 3): fixes for P07-F3, P19-F1, P05-F4, P04-F3, P17-F2, plus the fd-3 change

change-set: df78258a3a9e3257

(Run on the uncommitted tree at 2026-10-23T18:06Z, branch claude/stoic-cori-pvn3f8. `bash scripts/validate-code.sh` gave
`verdict: PASS (12 passed, 0 failed)`. The `--hash` re-run just before this file was written gave df78258a3a9e3257.
`bash connect-all-tests.sh` gave `107 passed, 0 failed`. `python3 -m unittest -v brain.tests.test_recs` gave `Ran 9 tests ... OK`,
and test_step_ids_follow_the_title_not_the_letter is in the list. The reviewer changed no source file. All probes wrote only
to the scratchpad.)

## Verdict

`SURVIVED*` (repo verdict: **SHIP**). All five fixes from pass 2 hold. There is no critical, high or medium finding, and the
deterministic checks pass. Two LOW findings remain, both small and neither blocking:
- P07-F4: the P07-F3 fix stops the "Starting Vanessa…" in-flight note from showing.
- P05-F5: `exec 3>&1` hands the screen fd to the `nohup ollama serve` fallback, so a piped run waits for Ollama to exit.

## Fix verification (previous findings)

| id | status | evidence |
|---|---|---|
| P07-F3 outcome note wiped | FIXED | bmRunNow's `note` setter writes bmState[c.id].note (template.html:883), and bmRender draws it as `div.meta.note` (775). smoke-bm4 was re-run on the built brain-4d.html. Every case ends with its own copy: nomcp, ok, not_in_manifest, approval_required, cancelled, server_unavailable, tool_error, doubleRapid (one set and one fire_trigger) and doubleLater. There were no page errors. In smoke-bm5, a Decline clears the note (bmState is replaced) and a re-Approve fires again and shows the note again. Later clears it. brain-4d.html matches the template (the `bmState[c.id].note` lines are at 775 and 883 in both). |
| P19-F1 dead test | FIXED | the method is inside class RecsTests. `-v` lists it, and the run gives Ran 9 tests OK. |
| P05-F4 2c not on screen | FIXED (terminal) | `exec 3>&1` at line 31. runner_logs tees to /dev/fd/3 (129-136), so inside step() the lines reach the screen once and $LOG once. The new step() test checks the task name and "error: boom" on stdout once, and the step under Did not finish. |
| P04-F3 Bearer leak | FIXED | the Bearer rule runs first (133). "Authorization: Bearer plainbear77" becomes "Authorization: Bearer ***", which the authorization rule then turns into "Authorization=*** ***". The fixture asserts plainbear77, xyz789, tok123, k123 and abc123secret are all absent. |
| P17-F2 copy | FIXED | template.html and brain-4d.html line 894 read "...then Decline and Approve again to start it now". smoke-bm5 shows that this path works: Decline, then Approve, gives a second fire_trigger. |

## fd-3 sweep (the `exec 3>&1` at script top)

- PREVIEW: clean. step() returns before it runs the command (44), and fd 3 is never written.
- Private-copy re-exec (line 21): clean. It runs before line 31, and the copy opens fd 3 itself.
- Step 1 re-exec `exec env CONNECT_ALL_COPY= ... bash connect-all.sh` (61): clean. fd 3 is inherited, and the new process runs `exec 3>&1` again, which points it at the same stdout. There is no leak and no double copy.
- Stdout closed at start: clean. `exec 3>&1` fails without -e, and runner_logs' probe `{ : >&3; }` falls back to /dev/stdout (129).
- 2b keep-awake: clean. `launchctl load` asks launchd to start caffeinate, and a launchd child does not inherit this shell's fds. The repo-sync agent (1b) is clean for the same reason.
- `open -a Ollama` / `brew services start ollama`: clean. Both start the process through LaunchServices or launchd.
- `(nohup ollama serve >/dev/null 2>&1 &)` (252): **P05-F5** below.

## CONFIRMED

```yaml
id: P07-F4
pass: 07
title: The P07-F3 setter writes the note only into an existing .meta.note, so "Starting Vanessa…" is never shown in flight
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 789
  - path: dashboard/brain-4d/template.html
    line: 775
  - path: dashboard/brain-4d/template.html
    line: 883
  - path: dashboard/brain-4d/template.html
    line: 886
entry_or_trigger: Approve with the mcp grant, while fire_trigger is in flight (seconds on the real connector)
evidence: bmDecide sets `bmState[c.id] = { decision, at }` and calls bmRender (789). There is no note yet, so no
  `.meta.note` div is drawn (775). bmRunNow's setter stores "Starting Vanessa…" in bmState, but its querySelector finds no
  `.meta.note` and writes nothing. smoke-bm5 at 150 ms in flight gives `notes: []` and only disabled buttons. Pass 2's
  smoke-bm5 showed "Starting Vanessa…" at that point. The final copy does appear when finally-bmRender runs.
existing_controls_checked: the live region says "Big move #N approved." and the buttons are disabled. Neither one says a
  start is under way.
failure_scenario: Steven approves a Vanessa move. For the seconds the connector takes, the card shows no status, and he may
  think the click did nothing.
impact: in-flight feedback lost (cosmetic or UX), no wrong state
remediation_direction: in the setter, call bmRender() when no .meta.note exists (bmState already holds the text). Or set
  bmState[c.id].note before the bmRender in bmDecide.
verification: smoke-bm5 "in-flight" snapshot shows notes ["Starting Vanessa…"]; smoke-bm4 end states unchanged
```

```yaml
id: P05-F5
pass: 05
title: exec 3>&1 is inherited by the `nohup ollama serve &` fallback, so a piped connect-all run does not end while Ollama runs
status: CONFIRMED
severity: LOW
confidence: MEDIUM (mechanism HIGH; the trigger needs stdout to be a pipe and the third Ollama fallback)
location:
  - path: connect-all.sh
    line: 31
  - path: connect-all.sh
    line: 252
entry_or_trigger: `bash connect-all.sh | tee …`, `$(bash connect-all.sh)`, or an agent's Bash tool running it, on a Mac
  where `ollama list` fails and both brew services and `open -a Ollama` fail (a CLI-only install)
evidence: nohup and the `( … & )` subshell close no fd above 2, so ollama serve holds fd 3, the pipe's write end. The probe
  scratchpad/fd3.sh (exec 3>&1, a step-style redirect, `(nohup sleep 4 >/dev/null 2>&1 &)`, piped to cat) takes 4 s, while
  fd3b.sh, which is the same without exec 3>&1, takes 0 s. Before this change-set, ollama serve held no copy of stdout.
existing_controls_checked: the documented path is a paste into Terminal, where fd 3 is the tty and nothing waits. /connect
  only previews, and PREVIEW never runs the step.
failure_scenario: an agent or a `| tee report.txt` runs the full paste on a Mac where only the nohup fallback starts Ollama.
  The script prints its REPORT, but the pipe stays open and the caller waits until its timeout, or until Ollama is quit.
impact: a hang or timeout of the caller; nothing is lost, and the REPORT is already printed
remediation_direction: close fd 3 for background starters: `(nohup ollama serve >/dev/null 2>&1 3>&- &)`. Or open fd 3 only
  around step 2c (`exec 3>&1` before it, `exec 3>&-` after).
verification: a connect-all-tests case that stubs ollama (list fails until a marker exists; serve sleeps 5) and stubs
  brew/open to fail. It runs jarvis_engine via step() piped to cat, and asserts it returns in under 2 s.
```

## UNVERIFIED / NEEDS-CONTEXT

- runnerctl restart (connect-all.sh:105). If it forks the runner directly rather than through launchd, that daemon also
  inherits fd 3 and P05-F5 applies to step 2 as well. To decide, I need runnerctl's restart implementation (it is on the Mac
  only).
- `tee /dev/fd/3` when stdout is a regular file (`bash connect-all.sh > out.txt`). On Linux, tee reopens the file with O_TRUNC.
  The probe scratchpad/fd3c.sh lost the two earlier lines, and the later output landed at a stale offset. macOS fdesc(5)
  documents open of /dev/fd/N as dup(), which would not truncate. The script is Mac-only (exits unless Darwin or
  GO_FORCE=1), so I have not confirmed it there. To decide, run fd3c.sh once on the Mac. `>&3` instead of `tee /dev/fd/3`
  avoids the question on both systems.

## REJECTED

- doubleLater approving two moves. The harness's `#bm > li .btn.primary` selector hits move #2 once #1's Approve is gone.
  That is a second, deliberate click on another card, not a double fire. Evidence: smoke-bm4 log, one set and one fire per id.
- mcpReject leaves Approve disabled. This was already rejected as R1 in pass 1 (it is the contract of use()), and nothing
  in this change-set touches it.
- `"Authorization=*** ***"` reads oddly. Nothing leaks, so it is not a defect.

## Coverage

connect-all.sh diff (2c runner_logs, 7e arive_keys, lofty/tidycal traps, REPORT A-D), connect-all-tests.sh diff (step()
test, Bearer fixture, arive interrupt), brain/tests/test_recs.py (9 tests), dashboard/brain-4d/template.html and
brain-4d.html bmRender/bmDecide/bmRunNow (765-900), smoke-bm4 (10 cases) and smoke-bm5 (approve/decline/re-approve/later),
fd-3 paths listed above. Passes: 01, 04, 05, 07, 11, 14, 17, 19, 20. The other files in the diff are unchanged since pass 2
and were not re-read.

## Top missing tests

1. smoke-bm5 in-flight: notes shows "Starting Vanessa…" while fire_trigger is pending (P07-F4).
2. connect-all-tests: jarvis_engine via step(), piped, with the nohup fallback stubbed, returns promptly (P05-F5).
3. connect-all-tests: step() with stdout redirected to a file keeps the pre-2c lines (the tee /dev/fd/3 truncation question).
4. smoke-bm4: a reload after an approve keeps the decision state. The note is in memory only, so assert that the state shows
   and the note does not.
5. recs: a move id that holds a `"` does not break the `li[data-id="…"]` selector (ids are slugs today, so assert the slug form).

## Share card

```text
VIBE//BREAKER
VERDICT: SURVIVED*   (repo: SHIP)
PASSES: 9/20 (diff-scoped, third pass)
CONFIRMED: 2 (LOW 2)   UNVERIFIED: 2   FIXES VERIFIED: 5/5
change-set: df78258a3a9e3257
```

---

# VibeBreaker Final Report (pass 2): fixes for P07-F1, P04-F1, P05-F1, P05-F2, P04-F2, P05-F3, P17-F1, P07-F2

change-set: ff13cb944f844c31

(Run on the uncommitted tree at 2026-10-23T18:01Z. `bash scripts/validate-code.sh` gave `verdict: PASS (12 passed, 0 failed)`.
The `--hash` re-run just before this file was written gave ff13cb944f844c31. `bash connect-all-tests.sh` gave
`103 passed, 0 failed`. `python3 -m unittest -v brain.tests.test_recs` gave **`Ran 8 tests ... OK`, not 9**: see P19-F1.
The reviewer changed no source file. All probes wrote only to the scratchpad.)

## Verdict

`SURVIVED*` (repo verdict: **FIX FIRST**). No critical or high defect, and the deterministic checks pass. Six of the eight
fixes hold. Two don't fully: P17-F1 (now invisible) and P05-F2 (the REPORT half). Two of the fixes added new defects:
- The P07-F1 fix (`finally { bmRender() }`) wipes every bmRunNow outcome note. Approve never says whether Vanessa
  started, failed or was not allowed.
- The P05-F1 proof test sits inside `if __name__ == "__main__":` and never runs.

## Fix verification (previous findings)

| id | status | evidence |
|---|---|---|
| P07-F1 double fire | FIXED | smoke-bm4/bm5: doubleRapid logs one `set` and one `fire_trigger`. A click during flight is ignored (buttons disabled). Approve is hidden once the move is approved. The `let bmBusy` (template.html:780) comes before the first `bmRender()` call (794), so there is no TDZ. Decline, then Later, after an Approve each saved, and re-Approve after a Decline fired once. No page errors. |
| P04-F1 Arive Ctrl-C | FIXED (bash 5.2) | ptyt2.py (rebuilt from the current arive_keys): Ctrl-C at prompt 1 and at prompt 2 each print "interrupted - nothing saved", give RC=130, write no `.env`, and the next command runs. The normal path saves the file. lofty/tidycal use the same pattern (connect-all.sh:403, 431). `step()` runs the function in the same shell (44), so `return` in the trap leaves the function there. |
| P05-F1 step ids | FIXED in code, test dead | the 12 current ids are unique. Run by hand, the fixture logic passes: re-lettering keeps the ids, and "A."/"a." give 3 distinct ids. But the test never runs (P19-F1). |
| P05-F2 2c to REPORT | PARTLY | 2c now lands under "Did not finish" with its note. The task names and tails still never reach the screen (P05-F4). |
| P04-F2 masking | PARTLY | JSON token, JSON api_key, sk- keys, `X-Api-Key:` and `password=` are masked. `Authorization: Bearer <non-sk token>` is not (P04-F3). |
| P05-F3 REPORT letters | FIXED | connect-all.sh:497-500 A iMessage / B Zoho / C Claim profiles / D AnyDesk. The old items 2, 4 and 5b are gone, and the tests grep all four. |
| P17-F1 mac copy | FIXED in code, never shown | the third branch exists (template.html:883, 888), but the note is erased before anyone sees it (P07-F3). |
| P07-F2 draft kept | FIXED | askVanessaButton returns before clearing vanQ when vanCtl is set, and shows a status (template.html:739). |

## CONFIRMED

```yaml
id: P07-F3
pass: 07
title: The finally-bmRender added for P07-F1 erases the bmRunNow outcome note; Approve never tells Steven what happened
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 790
  - path: dashboard/brain-4d/template.html
    line: 792
  - path: dashboard/brain-4d/template.html
    line: 881-882
entry_or_trigger: any Approve on the published page (with or without the mcp grant)
evidence: bmRunNow adds its note to the current <li> (881-882). When it returns, `finally { bmBusy = false; bmRender(); }`
  (792) runs `ol.replaceChildren()` and rebuilds every <li> without the note. smoke-bm4 checked no-mcp, ok,
  not_in_manifest, approval_required, cancelled, server_unavailable and tool_error, and each ended with notes: []. smoke-bm5
  shows "Starting Vanessa…" during flight and [] after. The only lasting signal is the live region, "Big move #1 approved.".
existing_controls_checked: bmState[c.id].fired is set on success but bmRender never draws it. The previous review's harness
  saw the notes, because there was no re-render after bmRunNow then.
failure_scenario: the page lacks the Claude Code Remote grant (U2). Steven approves "Connect openflowkit" and sees only
  "approved". The "not allowed for this page yet — allow the connector" copy flashes and is gone. He thinks Vanessa is on
  it now, but it waits until 6:05 AM. The P17-F1 "mac" copy is never seen either.
impact: the result of an execute action is hidden, and the P17-F1 fix does nothing the user can see
remediation_direction: keep the outcome in bmState (for example bmState[c.id].note) and have bmRender draw it. Or skip the
  final re-render when bmRunNow ran.
verification: smoke-bm4 run again: after the fire settles, each case's first <li> holds its own outcome copy
  (not_in_manifest gives the "not allowed" copy, executor "mac" gives the Mac-task copy)
```

```yaml
id: P19-F1
pass: 19
title: test_step_ids_follow_the_title_not_the_letter is defined inside `if __name__ == "__main__":` and never runs
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/tests/test_recs.py
    line: 120-133
entry_or_trigger: python3 -m unittest brain.tests.test_recs, the validate-code.sh "brain unit tests" check, or any CI run
evidence: line 120 is `if __name__ == "__main__":` and 121 is `unittest.main()`. The def at 123 is indented 4 spaces under
  that block, not under class RecsTests. `-v` lists 8 tests, and test_step_ids is not among them. The caller reported 9.
existing_controls_checked: the fixture logic, run by hand outside the suite, passes (ids are equal after re-lettering, and
  there are 3 distinct ids). So the code fix is right, but nothing guards it.
failure_scenario: someone reverts recs.py to `"step:" + letter`. Every check stays green, and the wrong-move-hidden bug
  (P05-F1) comes back unnoticed.
impact: the only proof of the P05-F1 fix is dead code; the gate's "brain unit tests" PASS overstates coverage
remediation_direction: move the method into class RecsTests (above the __main__ guard)
verification: `python3 -m unittest -v brain.tests.test_recs` lists test_step_ids_follow_the_title_not_the_letter and
  reports `Ran 9 tests`. With recs.py set back to the letter key, that test fails.
```

```yaml
id: P05-F4
pass: 05
title: Step 2c say()s the diagnosis inside step(), whose stdout goes to the log; nothing reaches the screen, and the log gets it twice
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 44
  - path: connect-all.sh
    line: 127
  - path: connect-all.sh
    line: 132-133
  - path: connect-all.sh
    line: 139
entry_or_trigger: connect-all on a Mac with a runner task in error
evidence: step() runs `"$@" >>"$LOG" 2>&1` (44). say() is `printf | tee -a "$LOG"`, so inside the step its stdout is
  $LOG too. The s2c harness used the real say/step/runner_logs and the 2c step line, with a stubbed runnerctl. On screen:
  only "did not finish (see …log)", the REPORT line, and the note "step 2c lists them above with their last log lines".
  In the log: every line twice, and no task name or tail anywhere on screen. connect-all-tests checks run_fn's stdout
  directly, not through step(), so it passes.
failure_scenario: Steven pastes "everything from REPORT down", as he is told. Claude sees that 2c did not finish and a note
  that says the tasks are "listed above", but no task name and no tail. A second paste of the log is still needed, which
  is what P05-F2 meant to remove.
remediation_direction: write the 2c lines to the terminal (for example `>/dev/tty`, or a saved fd 3 opened before step
  redirects), or carry them into NEEDS so the REPORT prints them
verification: a test that runs `step "2c …" … runner_logs` with a failing stub and asserts the task name and "error: boom"
  appear on stdout once, and once in $LOG
```

```yaml
id: P04-F3
pass: 04
title: 2c masking still leaves a standard "Authorization: Bearer <token>" value in clear unless the token starts with sk-
status: CONFIRMED
severity: LOW
confidence: HIGH (mechanism) / LOW (that runner logs hold such a header)
location:
  - path: connect-all.sh
    line: 133
evidence: the first rule matches "Authorization: " and takes the next non-space run, the word "Bearer", as the value. So
  "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig" comes out as "Authorization=*** eyJhbGciOiJIUzI1NiJ9.payload.sig".
  The Bearer rule then finds no "Bearer" left. 'authorization="Bearer ghp_abcdef123456"' leaks the same way. The test
  fixture only passes because its token is sk-ant-…, which the third rule catches.
failure_scenario: a runner log tail holds an HTTP debug header with a GitHub, Zoho or JWT bearer token. That token is
  written unmasked to the connect log, which Steven is told to paste to Claude.
remediation_direction: run the Bearer rule before the key/token/authorization rule, or let the first rule take an optional
  "Bearer " before the value
verification: add "Authorization: Bearer eyJabc.def.ghi" to the 2c fixture and assert "eyJabc" is not in $T/out
```

```yaml
id: P17-F2
pass: 17
title: The not_in_manifest copy says "allow the connector … and approve again", but a second Approve is refused and its button hidden
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 893
  - path: dashboard/brain-4d/template.html
    line: 775
  - path: dashboard/brain-4d/template.html
    line: 784
entry_or_trigger: Approve on a page without the Claude Code Remote grant, then following the copy's advice
evidence: bmRender leaves out the button for the stored decision (775: `if (st === dec) return`). bmDecide refuses
  approved→approved (784: "decline it first"). Only Decline and then Approve gets a second fire. It shows up once P07-F3
  is fixed.
failure_scenario: Steven allows the connector and looks for Approve. It is gone, and nothing says to Decline first.
remediation_direction: say "decline and approve again", or offer a "Start now" button when the move is approved but not
  fired
verification: a smoke case with not_in_manifest whose copy names a step that the page offers
```

## UNVERIFIED

- U1 (carried): what the Big-moves task trig_014QQGp4WQfWGDVB827R4Qb9 does with "EXECUTE NOW", including whether it
  de-duplicates by id. This review did not read the trigger.
- U2 (carried): the live page's mcp grant and the "Claude Code Remote" display name.
- U3 (carried): the BSD/macOS sed `I` substitute flag (connect-all.sh:133). GNU sed 4.x runs the expression as quoted:
  the `'"'"'` splices give `("|')?`, and the probe shows the masking works. On a sed without `I` the pipeline prints
  nothing, so nothing leaks. Needs `man sed` on the Mac.
- U4: macOS /bin/bash 3.2, and whether `return` inside an INT trap leaves the function there. Only bash 5.2 was run. Each
  `read … || { …; return 130; }` is a second exit if the trap only interrupts the read, but that is not shown on 3.2.

## REJECTED

- R1: TDZ on `bmBusy`. The declaration (780) comes before every top-level call path (bmRender at 794, the async init at
  804-805). Clicks happen only after load. Rejected.
- R2: bmRender re-entrancy. It is synchronous, rebuilds from bmState, and bmBusy blocks any second bmDecide. smoke-bm5 shows
  a Decline clicked during flight was a no-op. Rejected.
- R3: Decline or Later broken after Approve. smoke-bm5: approve, decline, approve, later each saved once, and re-approve
  fired once. Rejected.
- R4: "done <letter>" ambiguity between A-D and the carried list. The carried list is e-l now, so the plans say "done a…d"
  and "done e…l", and none repeats. Rejected (no trigger today).
- R5: task-name grep path traversal (now `[A-Za-z0-9_.-]`). `/` is still excluded. ".." can match the token, but the
  paths are "$logdir/../.log" and "$logdir/..", whose glob gives "$logdir/../*.log". That reads only a *.log tail one
  level up in claude-runner, through the masking. No write happens and it stays read-only. Rejected as a defect.

## Coverage

Found clean:
- validate-code.sh 12/12, and connect-all-tests 103/103.
- brain-4d.html is regenerated from the template (bmBusy appears there too). No page errors in the 390 px smoke runs.
- arive_keys on a pty (normal path, Ctrl-C at prompt 1 and at prompt 2). The lofty and tidycal prompts use the same
  construct.
- runner_logs: return codes are 1 when unhealthy, 0 when healthy, and 1 with no runnerctl.
- The REPORT A-D block matches docs/STEVEN-STEPS.md.
- recs: 12 unique step ids, keyed on title slugs, and letters lowered only for the "done x" copy.
- askVanessaButton: the vanCtl guard keeps the draft.

## Top missing tests (pass 19)

1. test_step_ids… actually runs (moved into RecsTests): `Ran 9 tests`. (P19-F1)
2. 6D Approve outcome note survives the final re-render, one case per callTool code and one for executor "mac". (P07-F3, P17-F1)
3. 2c through step(): the task name and tail on the screen once, and in $LOG once. (P05-F4)
4. Masking fixture with "Authorization: Bearer eyJ…" (no sk-). (P04-F3)
5. not_in_manifest, then the action its copy names, gives exactly one more fire. (P17-F2)
6. smoke-bm3.js is stale: it reads `.btn.primary` on the first <li>, which is now hidden after Approve. smoke-bm4.js is
   the fixed copy. Note that its doubleLater case clicks move #2's Approve, so it does not test a second Approve on move #1.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 13/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 5
UNVERIFIED: 4
FIRST BREAK: NONE
```

## Release note

This was exercised on Linux with bash 5.2, GNU sed and Chromium (Playwright), using stubbed claude.ai capabilities. It does
not show:
- what the Big-moves task does on EXECUTE NOW;
- the live page's mcp grant;
- macOS bash 3.2 or BSD sed.

---

# VibeBreaker Final Report: Approve = execute (6D Brain), ask-always-answers, connect-all 2c/7e, STEVEN-STEPS two-marker parser

change-set: 6837a9fe891b9f08

(From `bash scripts/validate-code.sh` at 2026-10-23T17:53Z on the uncommitted tree: `verdict: PASS (12 passed, 0 failed)`;
`--hash` re-run just before writing this file: 6837a9fe891b9f08. `python3 -m unittest -q brain.tests.test_recs`: `Ran 8 tests ... OK`.
`bash connect-all-tests.sh`: `connect-all tests: 94 passed, 0 failed`.)

The tree moved once during this review. The first gate run gave 0434becb21a5c3f4. The coordinator then reported a
template.html edit (askVanessaButton, Enter-asks-Vanessa, partial-match answers), and the gate gave 6837a9fe891b9f08. This
review covers 6837a9fe891b9f08, including that edit. The reviewer changed no source file. Any later edit needs a new gate
run and a new review before `--mark`.

## Verdict

`SURVIVED*` (repo verdict: FIX FIRST). No critical or high defect, and the deterministic checks pass. But three medium
defects hit the features this change adds:
- Approve can fire Vanessa's execution run more than once for the same move.
- A Ctrl-C at the new Arive prompt turns echo back on, so the next secrets are typed in clear text.
- Big-move ids for Steven's steps are keyed on the step letter, and this change re-letters every step. Every id now
  names a different item.

## Scope

- Branch: claude/stoic-cori-pvn3f8, uncommitted tree. Mode: DIFF.
- Stack: static HTML plus the claude.ai db/user/mcp/sample capabilities (6D Brain), bash (connect-all*.sh), Python 3 stdlib (brain/recs.py).
- Passes: 01, 04, 05, 06, 07, 08, 11, 12, 14, 17, 18, 19, 20.
- Inspected: dashboard/brain-4d/template.html (ask panel, askVanessaButton, the #q Enter key, the big-moves panel,
  bmDecide, bmRunNow, capability init), dashboard/brain-4d.html (generated; same code, the inline script parses),
  dashboard/action-desk.html (inline script parses), connect-all.sh (step(), 2c runner_logs, 7b/7c/7e prompts, REPORT block),
  connect-all-tests.sh, brain/recs.py (_id, rec, _steven_steps, top/decisions_by_id), brain/tests/test_recs.py,
  docs/STEVEN-STEPS.md (lines 36-55), context/decisions.md (2026-10-23 entry), docs/inventory/cloud-routines-2026-10.md,
  memory.md. Contracts: artifact-capabilities/0.2.89 mcp.d.ts (callTool, McpError codes, failure design) and claude.d.ts (use()).
- Probes (all writes went to the scratchpad):
  - smoke-bm3.js (Playwright, stubbed capabilities): no mcp, mcp ok, five error codes, two clicks, use("mcp") rejecting.
  - smoke-ask.js: five questions, covering a full match, a partial match, no match, stopwords only and an XSS string.
  - ptyt.py: drives the real arive_keys on a pseudo-terminal (normal input, then Ctrl-C at prompt 1 and at prompt 2).
  - A sed probe of the masking expression.
  - A timing probe of the _steven_steps regexes on adversarial input (200 KB and 1 MB).
- Not inspected: the Big-moves task prompt (trig_014QQGp4WQfWGDVB827R4Qb9). A read-only get_trigger was denied by the
  permission classifier. Also not inspected: the published artifact's capability manifest, and macOS /bin/bash 3.2 and
  BSD sed behaviour.
- Material scope limitation: YES. The other half of Approve, what the task does with "EXECUTE NOW", could not be read.

## Scoreboard

- Passes executed: 13 / 20 (diff-applicable set)
- Confirmed: 8 (Critical 0, High 0, Medium 3, Low 5, Info 0)
- Unverified: 4
- Rejected candidates: 6
- First critical pass: NONE

## CONFIRMED

```yaml
id: P07-F1
pass: 07
title: Approve fires fire_trigger "EXECUTE NOW" again on every click; no in-flight guard and no already-fired guard
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 775
  - path: dashboard/brain-4d/template.html
    line: 786
  - path: dashboard/brain-4d/template.html
    line: 875-889
entry_or_trigger: Approve clicked twice (a double-click, or again after a reload), on a move already approved
evidence: the Approve button is disabled only by !bmDb (line 775). bmDecide re-writes the doc and calls bmRunNow on every
  "approved" (line 786). bmState[c.id].fired is written (line 883) and never read. smoke-bm3.js "doubleRapid" (two clicks,
  no gap) and "doubleLater" (400 ms gap) each logged two db.set calls and two callTool("Claude Code Remote","fire_trigger")
  calls with the same text.
existing_controls_checked: vanAsk has a vanCtl guard, but bmDecide has none. The mcp.d.ts failure design says a write
  must not be re-issued without a fresh gesture, and fire_trigger is not idempotent. Whether the task de-duplicates is
  in the task prompt, which could not be read.
failure_scenario: Steven double-clicks Approve on "Connect openflowkit" (executor vanessa). Two EXECUTE NOW turns queue
  in the orchestrator session, and the plan can run twice. Both runs count against the routine allowance.
impact: duplicate execution of an approved plan; allowance spend
remediation_direction: disable the button while the decision is in flight. Skip bmRunNow when the stored decision is already
  "approved" (offer an explicit "Start again" instead). Or have the task ignore an id it has already executed.
verification: the smoke-bm3 doubleRapid and doubleLater cases log exactly one fire_trigger call
needs_context: the Big-moves task prompt, for whether it de-duplicates EXECUTE NOW by id
```

```yaml
id: P04-F1
pass: 04
title: Ctrl-C at an Arive hidden prompt does not abort; the trap restores echo and the next secrets are typed visibly and saved
status: CONFIRMED
severity: MEDIUM
confidence: HIGH (bash 5.2) / MEDIUM (macOS bash 3.2)
location:
  - path: connect-all.sh
    line: 451-454
entry_or_trigger: Steven presses Ctrl-C at "Arive Client ID" or "Arive Secret Key"
evidence: the trap 'stty echo 2>/dev/null' INT TERM handler restores echo but neither returns nor exits, and the read resumes.
  ptyt.py, driving the real function on a pty:
  - Ctrl-C at prompt 1: output "...skip all three: VISIBLECID ... Arive Secret Key: VISIBLESEC ... Arive API Key: VISIBLEKEY",
    then "Arive credentials saved", RC=0.
  - Ctrl-C at prompt 2: the secret and the API key were echoed, then saved.
existing_controls_checked: stty -echo is set once, before the first read. Nothing re-disables echo after the trap runs.
  The same trap pattern is in lofty_connect (399) and tidycal_connect (427), which were already there (one read each).
failure_scenario: Steven starts typing, thinks better of it and presses Ctrl-C, then pastes the values anyway. The Arive
  secret and API key appear in the Terminal window and its scrollback, which the REPORT copy instructions then sweep up.
impact: Arive LOS credentials shown on screen
remediation_direction: make the trap end the prompt: restore echo, clear the trap and return non-zero. Or re-run stty -echo
  before each read.
verification: the ptyt.py int1 and int2 cases show no typed value in the output, and no ~/.config/arive/.env is written
needs_context: confirm on the Mac's bash (bash --version; /bin/bash 3.2 may return from read instead of resuming)
```

```yaml
id: P05-F1
pass: 05
title: Step big-move ids are keyed on the step letter; this change re-letters every step, so every id now names a different move
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/recs.py
    line: 141-142
  - path: docs/STEVEN-STEPS.md
    line: 36-55
entry_or_trigger: any decision stored under an old step id: page db recs/<id>, brain/recs/ledger.jsonl, or "done <letter>"
evidence: id = sha1("steven|step:" + letter). In HEAD, a=Lofty, c=TidyCal, h=AnyDesk. Now a=iMessage, c=Claim profiles,
  e=Lofty, h=MBS Highway.
  - bm_9c4f4bcc3f was "Lofty API key" in HEAD big-moves.json and is "Link your iMessage line" now.
  - bm_4aaed5dca1 was "TidyCal token" and is "Claim your profiles for AI search" now.
  - top() applies decisions and 30-day snoozes by id (recs.py top / decisions_by_id). The page shows the stored state by id.
  Upper case is lowered, so a future carried list that starts at "a" would also share ids with the A-D clicks.
existing_controls_checked: brain/recs/ledger.jsonl does not exist yet, so the repo ledger holds no wrong decision today.
  The published page db could not be read.
failure_scenario: Steven declined "Lofty API key" on the published page today. Tomorrow "Link your iMessage line" is hidden
  for 30 days. If he approved it instead, the iMessage step shows "approved" and the 6:05 task learns the wrong category.
impact: wrong moves hidden or marked approved; the learned weights drift
remediation_direction: key steps on a stable slug of the title (or topic), not on the letter
verification: a test that re-letters a fixture STEVEN-STEPS.md and asserts each title keeps its id, and that "A." and "a."
  do not collide
needs_context: whether the published 6D page db already holds decisions under the old ids (ArtifactData list of recs)
```

```yaml
id: P05-F2
pass: 05
title: Step 2c output goes to the log, not the REPORT; and a run that finds failing tasks is listed under "Done"
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 44
  - path: connect-all.sh
    line: 118-135
  - path: dashboard/action-desk.html
    line: "step D 'Inside paste 1 now' note"
entry_or_trigger: connect-all on a Mac with a task in error
evidence: step() runs "$@" >>"$LOG" 2>&1 (line 44), and only Done / Did not finish reaches the REPORT. runner_logs returns 0
  after printing failing tasks (line 133). The step title says "last log lines into this report", and action-desk says
  "step 2c prints ... into the REPORT".
failure_scenario: Steven pastes "everything from REPORT down" as told. Claude sees "Done: 2c Runner tasks in error" and
  none of the diagnosis.
remediation_direction: return non-zero when bad tasks are found and give the step a needs-you note naming the log, or say()
  the tail directly
verification: a test that stubs a failing task and asserts the REPORT text holds the task name, not "Done: ... 2c"
```

```yaml
id: P04-F2
pass: 04
title: The 2c masking misses JSON-quoted and Bearer secrets
status: CONFIRMED
severity: LOW
confidence: HIGH (mechanism) / LOW (that the runner logs hold such lines)
location:
  - path: connect-all.sh
    line: 130
evidence: the sed probe left {"access_token":"tok123"}, {"api_key": "k123"} and "Authorization: Bearer sk-ant-xyz789"
  unmasked. key=, TOKEN=, password: and ?token= were masked.
failure_scenario: a runner log line carries a JSON token. It is written unmasked to the connect log, which step 2's
  note tells Steven to paste to Claude.
remediation_direction: widen the expression (an optional closing quote before [=: ], and Bearer/sk- forms), or drop the value tail
verification: add the three probe lines to the 2c test fixture and assert that none of the values appears in $T/out
```

```yaml
id: P05-F3
pass: 05
title: The REPORT "Still yours" A-D letters disagree with STEVEN-STEPS and the Action Desk; items 2 and 4 repeat A and B
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 490-494
  - path: connect-all.sh
    line: 502-506
  - path: docs/STEVEN-STEPS.md
    line: 37-43
evidence: the REPORT says C = Lofty key + TidyCal token and D = Claim profiles. STEVEN-STEPS and action-desk say
  C = Claim profiles and D = AnyDesk permissions. REPORT items 2 (iMessage) and 4 (Zoho) repeat A and B; 5b repeats part of C.
failure_scenario: Steven says "done C" after reading the REPORT, and Vanessa closes the AI-search step instead.
remediation_direction: use the same four letters as STEVEN-STEPS and drop the repeated numbered items
verification: a test that greps the REPORT block for the four titles in STEVEN-STEPS order
```

```yaml
id: P17-F1
pass: 17
title: Copy for executor "mac" (signals path) tells Steven the plan is standing by for him
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: dashboard/brain-4d/template.html
    line: 878
  - path: dashboard/brain-4d/template.html
    line: 882
evidence: the copy only branches on executor === "vanessa". Any other value, including "mac" (recs.py:10, reachable via
  --signals), gets "the plan is standing by for you".
remediation_direction: a third branch for "mac", matching the meta line at bmRender
verification: a smoke case with executor "mac" asserts the Mac-task copy
```

```yaml
id: P07-F2
pass: 07
title: The "Ask Vanessa this" button clears the chat draft even when the ask is dropped because she is mid-answer
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 739
evidence: the click handler sets $("vanQ").value = "" and then calls vanAsk(question). vanAsk returns at once when vanCtl
  is set (line 851), so the question is not asked, with no message, and the typed draft is lost.
remediation_direction: return early (or say "she is still answering") when vanCtl is set, before the draft is cleared
verification: stub sample with a pending stream, click the button, and assert that vanQ keeps its text and a status is shown
```

## UNVERIFIED

- U1: the Big-moves task's EXECUTE NOW mode (de-duplication, and that executor "steven" only records) needs the trigger
  prompt of trig_014QQGp4WQfWGDVB827R4Qb9 (read denied here).
- U2: that the published 6D artifact declares `mcp` with {server: "Claude Code Remote", tools: ["fire_trigger"]}, and that
  "Claude Code Remote" is the connector's exact display name. Needs the publish call's capabilities and a listTools() on
  the live page. If either is wrong, every Approve falls to the not_in_manifest copy (harmless, but it never executes).
- U3: macOS BSD sed support for the `I` flag in the 2c masking expression (connect-all.sh:130). Needs `man sed` on the Mac.
  If it is unsupported, sed errors and no tail is printed (no leak).
- U4: the runnerctl status line format. grep -oE '[a-z0-9][a-z0-9-]+' (connect-all.sh:126) finds no log for a task name
  with upper case or "_". Needs real `runnerctl status` output.

## REJECTED

- R1: use("mcp") rejecting breaks Approve (smoke-bm3 "mcpReject" shows Approve disabled). Rejected because the contract
  says use() resolves null and never rejects (claude.d.ts:8-11, 41-43).
- R2: an XSS from c.title or a question. The title goes only into callTool input text and mk() textContent. smoke-ask XSS
  question gave pwn=false, and smoke-bm2 earlier gave the same. Rejected.
- R3: a db write after the fire. smoke-bm3 logs "set" before "call" in every case, and bmRunNow runs only after the awaited
  set (template.html:785-786). Rejected.
- R4: prompt injection via the title in the fire text. The same title is already written to the page db the task reads
  (template.html:785), so this adds no new trust boundary. Rejected.
- R5: catastrophic backtracking in _steven_steps. A 200 KB unclosed item took 0.01 s, a 1 MB unterminated block 0.07 s,
  and 20 000 items 0.36 s. Rejected.
- R6: shell injection via task names in runner_logs. The names are limited to [a-z0-9-] and quoted, with no "/" or "."
  allowed, so there is no traversal. Rejected.

## Coverage

Found clean:
- 6D page with no mcp: Approve saves and shows the correct fallback copy.
- callTool codes: not_in_manifest and approval_required get the allow copy. cancelled, server_unavailable and tool_error
  each get their own copy, and none is retried automatically (this matches the mcp.d.ts write rule).
- The inline scripts of template.html, brain-4d.html and action-desk.html parse (node --check).
- The 390 px layout has no horizontal scroll.
- The ask panel:
  - a full match shows passages;
  - a partial match shows "Partial match — only X found (1 of 3 terms)" plus passages;
  - a question with no match or only stopwords says "not in the brain" and offers Ask Vanessa;
  - Enter falls back to opening the top hit when the chat is off.
- vanAsk keeps its single-flight guard.
- arive_keys normal path: the file is 0600, no value is echoed, the allowlist is applied before saving, and an existing
  file is not re-prompted.
- runner_logs is read-only, and there is no network call in 2c or 7e.
- recs: there are 12 items, ids are unique, TOPIC_WORDS puts imessage and drip first, and STEP_VALUE has imessage. A
  missing file returns [].

## Top 10 missing tests

1. 6D Approve twice (rapid, then after a reload with a stored "approved") → exactly one fire_trigger call. (P07-F1)
2. arive_keys on a pty with Ctrl-C at each prompt → no typed value in the output, no .env written. (P04-F1)
3. Re-lettered STEVEN-STEPS fixture → every title keeps its id, and "A."/"a." do not collide. (P05-F1)
4. connect-all with a stubbed failing runner task → the REPORT names it, and 2c is not under Done. (P05-F2)
5. 2c masking fixture with a JSON token, a JSON api_key and a Bearer token → none appears in the output. (P04-F2)
6. REPORT A-D titles equal STEVEN-STEPS A-D, in order. (P05-F3)
7. bmRunNow with executor "mac" → Mac-task copy. (P17-F1)
8. "Ask Vanessa this" clicked while a stream is pending → the draft is kept and a busy status is shown. (P07-F2)
9. Live-page check that listTools() lists "Claude Code Remote"/fire_trigger. (U2)
10. Approve when db.set rejects → no fire_trigger call, and the "Could not save" copy is shown (the current order already
    guarantees this; pin it).

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 13/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 8
UNVERIFIED: 4
FIRST BREAK: NONE
```

## Release note

This review shows what the stubbed-capability browser runs, the pty runs of the real arive_keys function, the sed and
regex probes, and the unit and connect-all suites (8 and 94 passing) exercised on Linux, bash 5.2 and Chromium. It does not
show:
- how the Big-moves task handles EXECUTE NOW;
- that the live page holds the mcp grant;
- how the change behaves on macOS bash 3.2 or BSD sed.
