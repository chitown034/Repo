# VibeBreaker Final Report — commit 277849b (Command Deck DB stamp)

change-set: 05a239ac3f94dba8

Reviewer: code-validator (did not write this code). Date: 2026-11-02. Mode: DIFF.

## Verdict

**FIX FIRST** (VibeBreaker: `FIX BEFORE SHIP`) — one confirmed HIGH: the new stamp treats the Big-moves report date as proof
the deck was written, but that file is written by plain local code that writes nothing to the deck, and running it clears the
"deck stale" alarm by itself.

## Scope

- Commit / branch: 277849b on claude/stoic-cori-pvn3f8 (worktree wt-stoic); `validate-code.sh --since 277849b~1`
- Deterministic gate: `verdict: PASS (5 passed, 0 failed)` (change-set 05a239ac3f94dba8)
- Mode: DIFF. Stack: Python 3 stdlib (`brain/`), unittest.
- Passes completed: 01, 04, 05, 06, 07, 08, 12, 17, 18, 19, 20
- Inspected surfaces: `brain/layers.py` (`_deck_last`, `collect`, `_iso`, `_json`, `_grep`), `brain/tests/test_layers.py`
  (new and the four deleted tests), `brain/recs.py` (`write`, `_layer_candidates`), `projects/command-deck.md` diff,
  `brain/coverage/writers.json`, `docs/inventory/process-coverage.json`, `wiki/ai-team/second-brain-layers.md`, git history
  of `docs/reports/BIG-MOVES.md`.
- Excluded: docs-only files in the commit (LAYERS.md, CONNECTIONS.md, notebooklm README, index.json) — no code.
- Unavailable context: the live Command Deck ArtifactData stamps for `bigMoves` / `aiTeamOrg` after 2026-10-26, and the
  cloud "Big moves" routine prompt (which step order it uses, and whether it commits the report when its deck writes fail).
- Material scope limitation: YES (runtime deck state not visible from the repo).

## Scoreboard

- Passes executed: 11 / 20 (DIFF)
- Confirmed: 3 — Critical 0 · High 1 · Medium 1 · Low 1 · Info 0
- Unverified: 1 · Rejected candidates: 2 · First critical pass: NONE

## CONFIRMED

```yaml
id: P05-F1
pass: 05
title: Big-moves report date is accepted as proof of a deck write; the report is written by code that never touches the deck, so the stale-deck alarm clears itself
status: CONFIRMED
severity: HIGH
confidence: HIGH
location:
  - path: brain/layers.py
    line: 49-61 (_deck_last, line 60 reads BIG-MOVES.md)
  - path: brain/recs.py
    line: 88-98 (_layer_candidates reads layers.collect), 475-510 (write: files only, no deck write)
entry_or_trigger: any `bin/brain recs --write` (attended session, Mac, or the cloud routine whose later deck-write step fails)
evidence: recs.write() writes only brain/recs/big-moves.json and docs/reports/BIG-MOVES.md with today's date in the title; it performs no
  ArtifactData write. _deck_last takes max() over sources, so that title date alone makes the deck layer "fresh" for ~2 days
  (cadence 1 d, fresh if age <= 2). recs._layer_candidates turns a stale deck layer into "Resync the Command Deck DB layer".
existing_controls_checked: docstring says the routine writes the deck "in the same run" — not enforced by any code; layers.py module
  docstring promises "every stamp comes from a file the layer's own sync writes", which this source breaks. No writer of
  brain/state/deck-sync.json exists, so there is no independent check.
failure_scenario: Reproduced in a temp tree (status note 2026-10-22, today 2026-11-02): layers deck verdict = stale and recs.top contains
  "Resync the Command Deck DB layer"; after recs.write(root) the deck verdict = fresh and the recommendation is gone. The same happens
  when the Big-moves routine commits the report but its deck writes fail. Both 2026-10-31 and 2026-11-01 Big-moves commits
  (e1a7ea2 19:03Z, 6e7e5ec 20:19Z) are off the 6:05 AM PT schedule and carry the same Claude-Session as this fix, so the
  stamp this fix relies on can come from an attended session.
impact: LAYERS.md, "even: yes", the 6D Brain and Vanessa's top 10 can show the deck healthy while its docs are not updating; the one
  automatic signal that would flag it is suppressed by the act of generating the report.
remediation_direction: read a deck-native stamp (the docs' own ranAt/syncedAt, e.g. via docs/inventory/process-coverage.json from
  `bin/brain coverage`, or a deck-sync.json that only the deck-write step stamps after a confirmed write); keep BIG-MOVES only as
  a "report ran" signal, not "deck written".
verification: test — tree with only BIG-MOVES.md dated today and no deck-written stamp: deck verdict must NOT be "fresh"; test —
  recs.write() on a stale-deck tree must leave the deck verdict and the resync recommendation unchanged.
needs_context: null
```

```yaml
id: P19-F1
pass: 19
title: Four passing tests of collect/format_rows/write/fieldy/drive were deleted, not kept beside the new ones
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/tests/test_layers.py
    line: whole file (removed LayerTests: test_every_layer_has_a_verdict, test_stamps_come_from_files_not_today, test_format_and_write, test_fieldy_row_reads_no_recordings_until_a_day_heading_exists)
entry_or_trigger: any future change to layers.collect / format_rows / write, the drive stamp or the fieldy row
evidence: the 277849b~1 test file, run unchanged against the new layers.py, passes 4/4 — nothing required removing them. After the
  commit only test_links.py touches collect() (key lookup); no test checks verdicts, LAYERS.md output, the drive stamp or fieldy.
  The new tests call _deck_last directly; nothing checks that collect()'s deck row uses it.
existing_controls_checked: test_links.py, test_recs.py, test_coverage.py searched for collect/format_rows/write coverage.
failure_scenario: a regression in the fieldy "Last checked" rule, the drive manifest stamp, or LAYERS.md formatting now passes the
  gate silently. Not a surgical change (Karpathy principles; backend-folder-structure: a service without a test is unfinished).
impact: the layers report's other ten rows lose their regression net.
remediation_direction: restore the four LayerTests next to DeckStampTests.
verification: brain/tests/test_layers.py runs 8+ tests, including the old four, and passes.
needs_context: null
```

```yaml
id: P04-F1
pass: 04
title: deck-sync.json has no writer, and a malformed one crashes the whole layers report and recs
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: brain/layers.py
    line: 59 (_json(...).get), _iso 19-23
entry_or_trigger: any writer stamping brain/state/deck-sync.json as non-object JSON, or an impossible date
evidence: probe — body `[]` or `"x"` raises AttributeError ('list' object has no attribute 'get'); `{"lastWrite":"2026-13-40"}` raises
  ValueError in _iso. collect() has no guard, so `bin/brain layers` and recs (which calls collect) fail. No file in the repo writes
  deck-sync.json today ("any writer may stamp it" is aspirational), so this source currently always yields None.
existing_controls_checked: _json catches parse errors only, not wrong types; _iso does not validate ranges (pre-existing for all sources).
failure_scenario: a future Mac task writes `[]` or a bad date → layers report and the daily top 10 both raise.
impact: limited; trigger needs a buggy future writer.
remediation_direction: accept only a dict and a valid date; treat anything else as no stamp.
verification: tests with `[]`, `"x"`, `{"lastWrite": 5}` and `{"lastWrite":"2026-13-40"}` each return None from _deck_last.
needs_context: null
```

## UNVERIFIED

- Whether the deck docs `bigMoves` / `aiTeamOrg` were actually written on 2026-10-27..11-01. Needs the live ArtifactData stamps
  (`ranAt`) — the last committed snapshot, docs/inventory/process-coverage.json (2026-10-26), shows bigMoves fresh at
  2026-10-26T13:21Z, nothing later. The commit's own new status note (2026-11-02, "daily writers still running") is hand-written
  and by itself makes the layer fresh until 2026-11-04 regardless of the code change.

## REJECTED

- Future-dated status note reads fresh (negative age) — pre-existing behavior of the old one-liner, not introduced here — layers.py 111.
- BIG-MOVES date uses the runner's local date.today() — at most one day off, inside the 1.5-day slack — recs.py 476.

## Coverage (inspected and clean)

- `_deck_last` regex for status notes is identical to the previous inline expression; ISO-with-time `lastWrite` parses correctly;
  empty tree returns None; max() over None-filtered list is safe.
- `collect()` deck row wiring change (line 77) is a straight substitution; other rows unchanged.
- No writes, network, subprocess or secrets added. Deterministic gate passed (py_compile, unit tests, layout, doctor).

## Top missing tests (pass 19)

1. BIG-MOVES.md dated today but no deck-written stamp → deck verdict is not "fresh" (P05-F1).
2. recs.write() on a stale-deck tree leaves "Resync the Command Deck DB layer" in recs.top (P05-F1).
3. collect()'s deck row equals _deck_last(root) (wiring).
4. Restore test_every_layer_has_a_verdict (P19-F1).
5. Restore test_stamps_come_from_files_not_today (drive stamp, vector spec-only).
6. Restore test_format_and_write (LAYERS.md body).
7. Restore the fieldy "Last checked" test.
8. Malformed deck-sync.json (`[]`, bad date) → None, no exception (P04-F1).

## Release note

Demonstrated: the new stamp returns the newest of three sources and passes its tests; the Big-moves source can mark the deck fresh
without any deck write, reproduced in code. Not demonstrated: the live deck's actual write times.
I did not run either installer. The caller's throwaway-HOME results are the caller's. I did not run any agent live, and I
did not read the live ~/.claude/agents on either Mac. The Reg Z wording in P14-F2 is the regulation text as I know it;
Alexandra confirms.

---

change-set: f1e43c4712e41b70

Addendum to the code-validator review of change-set c101a968e0458a2c (verdict FIX FIRST). Each CONFIRMED finding:
- **P14-F1 (MEDIUM) — fixed.** hook-writer's disclosure lines now carry DRE #01988316 and Equal Housing Opportunity on
  both, name Patriot Pacific Financial Corp with its company NMLS #1921615, and leave Steven's personal NMLS ID as a
  `[your NMLS ID]` placeholder (not in the brain; question raised to Steven). Source cited:
  `wiki/real-estate-playbooks/ai-search-visibility.md` § Compliance flags.
- **P14-F2 (LOW) — fixed.** Rule 2 now names all four 12 CFR 1026.24(d) trigger terms (down payment, number of
  payments/repayment period, payment amount, finance charge), APR for any rate, and routes final wording to Alexandra.
- **P05-F1 (LOW) — fixed.** chief-of-staff maps route display names through `named_seats` in agents.json (roster →
  slug; skill → use the skill) and never invents a subagent_type. Checked: Harrison → {agent: vanessa-broker, via: skill}.
- **P04-F1 (LOW) — fixed.** The installer now WARNs when a real file of the same name blocks a hand-written agent.
  Tested with a throwaway HOME holding a real chief-of-staff.md: WARN printed, file kept, other 5 linked.
- **P11-F1 (LOW) — fixed.** `copyskills` now compares the clone's HEAD with the reviewed sha and asks before copying if
  upstream moved; `plug` keeps the existing printed-label pattern (Claude Code's marketplace cannot pin a commit). The
  registry's GSAP row no longer calls gsap-skills unreviewed.
- **P05-F2 (INFO) — answered, not changed.** A `tools:` allowlist needs the exact connector tool names on each Mac
  (claude.ai connector names differ by install); a wrong name would leave the agent with no Gmail at all. The never-send
  rules stay prompt-level, same as every roster seat, and Gmail drafts still need Steven to press Send.
- **Client data on a cloud model** — chief-of-staff's line now restates CLAUDE.md (client details never copied to any
  store; client-data questions that need a model go to the local tier). Whether reading client email through the Gmail
  connector counts as "PII leaving the local model" is Steven's (and Alexandra's) ruling; raised to him.
`scripts/validate-code.sh`: PASS (9 passed, 0 failed); shellcheck clean on both installers at the default level.

---

# VibeBreaker review: Apple Health cloud-sync heartbeat (splice-health-sync.py) + docs (2026-10-31)

change-set: b25eb075ea5fe77f

Reviewer: code-validator, 2026-10-31. `bash scripts/validate-code.sh --hash` printed `b25eb075ea5fe77f`, the hash the caller
named. `bash scripts/validate-code.sh` printed `verdict: PASS (2 passed, 0 failed)` (py_compile on the splice, brain
doctor). No deck HTML is in the repo diff, so the script ran no quickcheck. I ran `dashboard/tests/quickcheck.py` by hand on
both `/tmp/claude-0/deck-live.html` (v258) and `/tmp/claude-0/deck-r13.html` (spliced). Results are below. Mode: DIFF.
I ran passes 01, 04, 05, 06, 07, 08, 12, 17, 18 and 19 on the Python splice. I ran 01, 04, 05, 17 and 19 on the deck code
it injects, which I read in the spliced copy. I ran 17 and 18 as a consistency read of the docs against the live routine.
Pass 20 ran last. Read-only: I did not run the splice. I did not open the health JSON files. I read the two routines'
stored prompts with `get_trigger`, and nothing else from the live store.

## Verdict

`FIX FIRST` (VibeBreaker: SURVIVED*). There are no CRITICAL, HIGH or MEDIUM findings. One LOW is confirmed: the new
"cloud sync silent" alert never reaches the exception report when the `appleHealth` snapshot is missing. The card line,
the escaping, the anchors and the routine field contract all hold. This is not 20/20 CLEAN because the run was in DIFF mode.
Steven may ship it as it is and fix the LOW next; that choice is his.

## CONFIRMED

```yaml
id: P05-F1
pass: 05
title: healthDriveSync alert is skipped whenever ahSnapshot() returns null (early return above it)
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/wave2/splice-health-sync.py
    line: 90-103 (alert inserted after the `age > 3` line)
  - path: /tmp/claude-0/deck-r13.html (deck v259 copy)
    line: 28582-28597 (appleHealthAlerts; early `return out` at 28586, new block at 28590-28592)
entry_or_trigger: computeExecExceptions / bell -> appleHealthAlerts() while state/appleHealth is absent or has no `metrics`
evidence: appleHealthAlerts runs `if (!snap) { out.push(<setup info>); return out; }` before the splice's insertion point,
  so the healthDriveSync checks run only when an appleHealth snapshot with `metrics` exists.
existing_controls_checked: ahSnapshot() (28381) returns null for a missing doc or one without metrics; the card line
  (ahDriveSyncRender) is called inside renderAppleHealth before any snapshot check, so the card itself is correct.
failure_scenario: appleHealth is missing or malformed (fresh browser before hydration, a failed routine write, a restore)
  and healthDriveSync.ranAt is 72 h old -> the exception report shows only the info-level "finish the Health Auto Export
  setup" row, with no warn/critical "Health cloud sync silent 3 days". The brief says the alert is appended when
  healthDriveSync is missing or older than 30 h. That is false on this path.
impact: The exception report under-reports a dead routine in the exact case where the tiles are also empty. The card line
  still shows it. Low.
remediation_direction: evaluate the healthDriveSync block before the `if (!snap)` early return (or in its own try).
verification: seed localStorage with no appleHealth and healthDriveSync {ranAt: now-72h, status:"ok"}; assert
  appleHealthAlerts() contains {sev:"critical", title:"Health cloud sync silent 3 days"}; with no healthDriveSync either,
  assert the "has never reported" warn row is present alongside the setup info row.
needs_context: null
```

```yaml
id: P17-F1
pass: 17
title: The spec doc under-describes the healthDriveSync shape the deck now reads
status: CONFIRMED
severity: INFO
confidence: HIGH
location:
  - path: integrations/apple-health-dashboard.md
    line: 29
  - path: dashboard/wave2/splice-health-sync.py
    line: 15, 73-76
entry_or_trigger: a future edit of the routine made from the doc the routine names as its `spec`
evidence: line 29 lists `healthDriveSync {ranAt, status, files, newestSample, days}`. The live routine's PART C
  (trig_01YPmyQiy1SMzFfr1SzEoLoe, read with get_trigger) also writes newestFile, strava, by, error and spec. The splice reads
  newestFile, strava and error.
existing_controls_checked: the routine prompt matches the splice today, and every optional field is guarded, so nothing
  breaks if one is missing.
failure_scenario: none today. If the routine were rewritten from line 29, the "newest export", Strava and error segments
  would disappear from the card without any error.
impact: maintainability only.
remediation_direction: list the full field set on line 29.
verification: grep line 29 for newestFile, strava and error.
needs_context: null
```

## UNVERIFIED

None.

## REJECTED

- P18-C1 (field-name mismatch: the splice reads `newestFile`/`strava`/`error`, but the doc lists `newestSample`): rejected.
  The live routine prompt PART C writes `newestFile`, `newestSample`, `days:<dailyDays>`, `strava` and `error`
  (get_trigger trig_01YPmyQiy1SMzFfr1SzEoLoe). Kept only as P17-F1 (INFO, doc drift).
- P01-C1 (routine text reaching HTML): rejected. The card uses `textContent` only (deck-r13 28533-28537). The alert
  title/sub, including `String(ds.ranAt).slice(0,10)`, go through `chatEsc` in both renderers (deck-r13 23641, 25111).
- P01-C2 (the DOTALL step-3 span could eat a different region): rejected for every deck that exists. On v258 the span is
  2236 chars and holds exactly 3 `<p>`, ending at the single `id="ahSyncNote"`. `sub1` needs exactly one match, and the
  `<head>` marker aborts a second run (v259 carries it). The remaining risk is that the lazy `.*?` has no size or
  paragraph-count bound. On an unmarked deck where `ahSyncNote` had moved below other markup, the span would remove that
  markup while still counting 1 match. No such deck exists, so this is not a defect. A one-line `assert span.count("<p ")
  == 3` would close it.
- P05-C2 (non-ISO `ranAt` makes the card show the raw string but the alert say "never reported"): rejected. The routine
  writes `ranAt:<ISO now>` (PART C), so the trigger is outside the producer contract.
- P05-C3 (the alert ignores `status:"error"` on a fresh run): rejected as out of the stated spec. The brief scopes the
  alert to silence (missing or >30 h). A failing-but-running routine already surfaces through the existing "export
  stalled" alert once `meta.last_received` passes 2 days, and through the amber card line.
- P06/P12-C1 (stale ageH while the page stays open): rejected. A remote doc change reloads the page
  (applyRemoteSnapshot -> `changed` -> throttled `location.reload()`), and renderAppleHealth re-runs on load.
- P06-C2 (`var ds`/`dsMs`/`dsH` or `ahDriveSyncRender` colliding with existing names): rejected. `ahDriveSync`
  appears 4 times in the spliced deck, all from this splice. The vars are function-scoped inside appleHealthAlerts.

## Coverage (inspected, clean)

- Splice anchors: I counted all seven read-only on v258 and got 1 each. On the spliced copy the badge, stale-copy,
  no-snapshot and age-sub anchors count 0, and the marker is present, so a re-run aborts before any `sub1`. The `panel`
  value comes from the deck itself (`panel-wellness`). Replacements are lambdas, so backslash and group escapes cannot occur.
- Deck code: `lsGet(key, null)` has a shape guard (8254), and `$`, `chatFmtTs` and `chatEsc` exist. The card call is
  wrapped in try/catch. Colour thresholds (60 h negative, 30 h warning, else ok -> positive) match the brief. The 30 h
  threshold matches `brain/coverage/writers.json` cadenceHours 30. Severity strings `warn`/`critical` are in the sort map.
- Quickcheck: v258 shows 4 FAIL rows (div 1322/1321, section 26/24, 2 inline scripts, the known "$10B…"
  never-defined false positive) and 9 PASS. The spliced copy's sorted PASS/FAIL set is byte-identical to v258's, so the splice
  adds no new quickcheck failure.
- Docs: the trigger id correction is verified live. trig_015pq… is disabled and named "[retired 2026-10-25]".
  trig_01YPmy… is enabled, bound to session_01AycAMVzfi1LGgfCMEbs3PD, and last fired 2026-10-30T13:20Z with delivery
  SUCCEEDED, which fits "fired but the session did not work it". The decisions entry, the memory line and the INDEX
  line contain no health values, only counts and versions. That fits the routine's "health data stays in the health docs"
  rule.
- Not in the diff, outside scope: `wiki/dashboard-ops/db-docs.md`, `integrations/CONNECTIONS.md` and
  `docs/inventory/cloud-routines-2026-10.md` still name the old routine and trigger id.

## Top missing tests (pass 19)

1. appleHealthAlerts with no appleHealth and stale healthDriveSync -> the critical "silent" row is present (P05-F1).
2. appleHealthAlerts at ranAt now-29h / now-31h / now-61h -> none / warn "1 day" / critical "2 days".
3. ahDriveSyncRender with status "error" and ranAt now-2h -> warning colour, text contains "error: <msg>".
4. ahDriveSyncRender with healthDriveSync = null, = [] and = {} -> the "never reported" text, no throw.
5. ahDriveSyncRender with newestFile/strava/error containing `<img onerror>` -> rendered as literal text (no element created).
6. Splice on a deck with the marker -> exit "already applied", file byte-identical.
7. Splice on a deck missing any one anchor -> abort naming that anchor, file byte-identical (no partial write).
8. Splice stale-copy span -> exactly 3 `<p>` removed and `#ahSyncNote` retained.
9. Exception-report dedupe: the drive-sync alert appears once in the bell even though appleHealthAlerts is folded in twice.

## Not demonstrated

I did not run the splice, Playwright or the runtime harness. The caller's 390 px renders and the three seeded states are
the caller's evidence. I did not read deck v259 as published, only the local copy /tmp/claude-0/deck-r13.html.

---

change-set: 0531c7c1483bf815

Addendum to the code-validator review of change-set b25eb075ea5fe77f (verdict FIX FIRST, one LOW + one INFO).
- **P05-F1 (LOW) — fixed.** The healthDriveSync alert block now sits at the top of `appleHealthAlerts`, in its own try,
  before the `if (!snap)` early return. Proof (Playwright on the re-spliced copy, rendered `.er-title` rows only, script
  text excluded): no appleHealth + stale status → "Health cloud sync silent 3 days" AND the setup row; no appleHealth +
  no status doc → "Health cloud sync has never reported" AND the setup row; appleHealth + fresh status → neither. 0 page
  errors in all three. Published as deck v260 (v259 carried the first placement for about seven minutes).
- **P17-F1 (INFO) — fixed.** `integrations/apple-health-dashboard.md` line 29 lists the full field set the routine writes
  and the six the deck reads. The validator's side note is also taken: the retired trigger id in
  `docs/inventory/cloud-routines-2026-10.md` now names the live one (the other two files it listed no longer contain it).
- **Anchor risk (not filed) — closed.** The DOTALL step now aborts unless the matched span holds exactly three `<p ` tags.
  Re-applied to the v258 copy: byte-identical to the published v260 file.
`scripts/validate-code.sh` PASS; runtime harness PASS; quickcheck FAIL set identical to v258.

---

# VibeBreaker review: lease_gate double-checked locking (claude-auto.sh) (2026-10-31)

change-set: e533237275f8604f

## Verdict

**SHIP** (VibeBreaker: SURVIVED*). One INFO finding (a comment the change made inaccurate), no defects. The race theory
matches the code and the new branch closes it; its guards are the same as the existing wait-loop reuse path.

## Scope

- Diff: `integrations/omniroute-failover/claude-auto.sh` +9 lines, lines 610-618 of `lease_gate()`. The other modified files
  (`brain/loop-history.jsonl`, `docs/reports/BRAIN-LOOP.md`, `docs/reports/CODE-VALIDATION.md`, `docs/reports/ENCYCLOPEDIA.md`)
  are generated reports, not code. I did not review them.
- Mode: shell. Passes 01, 04, 05, 11, 14, 19, 20.
- Read: `read_lease_cache`/`write_lease_cache`/`lease_unlock` (316-335), `peer_sticky` (439-444), `lease_check_now` (524-550),
  `lease_gate` (552-652), `--lease-check` (970-985), the cache wipes at 1005/1025, the caller at 1055, and test C6 plus the
  `slow` stub in `lease-tests.sh`.
- Material scope limitation: NO. I could not reproduce the CI failure (see Not demonstrated).

## Evidence

- `bash scripts/validate-code.sh`: `verdict: PASS (2 passed, 0 failed)` (bash -n, shellcheck), change-set e533237275f8604f.
- `lease-tests.sh` x4: `pass 158   FAIL 0` each time. C6 showed `ok ... (1)`.
- `failover-tests.sh`: `pass 265   FAIL 0`.

## Questions asked by the caller

1. **Race theory is sound.** C6 starts with no cache, so B's `c0_checked` is 0. The stub check takes 3 s (`slow`), and A
   runs `write_lease_cache` and then `lease_unlock` straight after it. Before the change, B's wait loop ran only when
   `mkdir` FAILED. So if B's top-of-function `read_lease_cache` came before A's write (or B read the file while `>`
   had truncated it but not yet written it), and B's `mkdir` came after A's `rmdir`, B got the lock and paid for a second check.
   Under the lock, A's write is already complete, so the re-read sees `checked_at` >= 1 > 0 and reuses it. I found no
   other path that gives nleases=2. The stale-lock removal needs a lock older than `LEASE_TIMEOUT+60`. A wait-loop
   timeout returns without checking.
2. **The early return can't reuse an answer it shouldn't, given the guards that apply here.**
   - Different ROLE: guarded by `c_role = ROLE`. This is the same guard as the wait loop at 590.
   - `c_checked` in the future: the top path rejects it (`c_checked <= _t`), so `c0_checked` = that future value. Only a write
     with a strictly greater stamp passes `-gt`. Every writer stamps `now()`, so a wall-clock rollback can't produce one.
     Safe without the explicit `<= _t` guard.
   - TTL: a stamp newer than `c0_checked` was written after this invocation's own top read, so it is as old as this
     invocation's own wait. TTL adds nothing.
   - FOREIGN expiry: not applied, the same as the wait-loop path. Trigger: during a burst, the check returns FOREIGN with no
     `expires` (LEASE_EXP `-`) or with a lease that ends within seconds. Result: B defers. A, the invocation that made
     the check, also defers on that same answer. So B's outcome matches the one paid check, and the next invocation
     re-checks through the top path. This fits the gate's design ("59 tasks firing together pay for one"), so I did not file it.
     If wanted, one shared helper could apply the FOREIGN-expiry test to both reuse paths (590 and 613). That is a choice
     for Steven, not a defect.
   - `--lease-check` (975-978) writes without the lock. A fresh write from it passes `-gt` and is reused. It is a real check,
     so this is correct.
3. **Trap and return codes match.** `lease_unlock` runs `rmdir`, sets `LOCKHELD=0` and resets `trap - EXIT INT TERM`. 609 is the
   only trap in the file, so resetting it clears nothing else. The new branch returns 0 for `run` and 1 for `defer`, the same as
   the top path and the wait-loop path. It sets `LEASE_SEEN_HOLDER` and `LEASE_WHY`, and those are the only outputs the
   caller at 1055 reads.

## CONFIRMED

```
id: P04-F1
title: Sticky-leadership comment now misdescribes where c_verdict/c_holder/c_expires/c_fails come from
status: CONFIRMED
severity: INFO
confidence: HIGH
location:
  - path: integrations/omniroute-failover/claude-auto.sh
    line: 634-637 (comment), 612 (the new read)
entry_or_trigger: lease_gate; the double-check does not fire (no newer same-role cache), then the check is inconclusive
evidence: the new read_lease_cache at 612 overwrites every c_* global. The comment says they are "still whatever
  read_lease_cache() found on disk at the TOP of this function". That is now false whenever the file changed between
  the two reads without passing the 613 test. Example: --take-lease/--release-lease run `rm -f "$LEASE_CACHE"` (1005, 1025).
existing_controls_checked: the wait loop (589) already re-read before the peer_sticky at 599, so that path was already
  inexact. No test covers peer-sticky after a cache wipe that lands mid-gate.
failure_scenario: a peer gate's top read sees HELD by this Mac. Then --release-lease wipes the cache. The gate takes the lock,
  the re-read gives c_verdict='', and the check is inconclusive. The peer now fails CLOSED. Before this change it failed OPEN
  on the sticky HELD it had read. The new behaviour is the safer one, because the lease was just released. But the comment
  says the opposite, and no test pins it.
impact: a future maintainer reasoning about the sticky rule from the comment. No runtime harm found.
remediation_direction: reword the comment to say the values come from the read under the lock (612).
verification: a lease-tests case: role peer, cache HELD by me, wipe the cache between the gate's top read and its lock
  (see missing test 2), STUB_LEASE=fail. Expect RC 75 and "PEER fails CLOSED".
needs_context: null
```

## UNVERIFIED

- That this race is what caused the two CI failures on e92674d. The code allows it and nothing else gives nleases=2, but I
  have no CI log beyond the assertion line.

## REJECTED

- FOREIGN-expired reuse on the new path: matches A's own outcome and the wait loop (590). Not a bad state (see question 2).
- Future `c_checked` reuse: needs a write stamped above an already-future `c0_checked`. Writers stamp `now()` (621, 630, 639,
  643, 647, 978).
- Cross-ROLE reuse: blocked at 613 by `c_role = ROLE`.
- Trap leak or double rmdir: `lease_unlock` is idempotent (`LOCKHELD` guard, 335). Later paths call it only when the branch
  was not taken.
- Same-second stamp (`c_checked == c0_checked`) makes B re-check: this only costs an extra check and is never wrong. C6 starts with no cache, so it can't hit this.

## Coverage (inspected, clean)

- Return-code and output-variable contract of all four `lease_gate` exits against the caller at 1055.
- Lock lifecycle: acquire (580/586), the stale removal (582-585), the new release (614), the existing releases (622, 630,
  639, 643, 647).
- `read_lease_cache` trust gate (`route_file_trusted`, 319-322) still applies to the new read. A world-writable cache is
  dropped and the branch is not taken (C5 still passes).
- shellcheck clean. POSIX-only constructs.

## Top missing tests (pass 19)

1. Deterministic C6. Put a `mkdir` shim on the test PATH. On `*/lease.lock`, it first writes a fresh mode-600 `lease.env`
   (decision=run, role=primary, checked_at=now), then calls the real mkdir. Run one invocation with no prior cache and
   expect `nleases` = 0 and a log line containing "checked just before this one". Before this change it gives 1. This
   removes the dependence on CI scheduling.
2. The same shim with role=peer, the prior cache HELD by me, the shim deleting `lease.env` instead, and STUB_LEASE=fail.
   Expect RC 75 and "PEER fails CLOSED" (P04-F1).
3. The same shim writing role=standby while the role file says primary. Expect the double-check NOT to fire and a real
   check to run (`nleases` = 1).
4. The same shim writing FOREIGN with `expires_iso=-`. Expect RC 75 with zero checks. This pins the chosen behaviour from question 2.

## Not demonstrated

I could not reproduce the original CI failure. My 4 runs, and the caller's 6, are not evidence that the race existed.
They show only that the change does not break the existing 158+265 assertions. I did not run C6 under a CPU load or in a loop.

---

change-set: 8a699e2e6856a0c0

Addendum to the code-validator review of change-set e533237275f8604f (verdict SHIP, one INFO).
- **P04-F1 (INFO) — fixed.** The sticky-leadership comment in `claude-auto.sh` now says the c_* values come from the
  double-check read under the lock, and that a cache wiped by --take-lease/--release-lease meanwhile makes a peer fail CLOSED.
- **Main missing test — added, as the validator specified.** `lease-tests.sh` C6b puts a `mkdir` shim on PATH that writes a
  fresh `lease.env` at the moment `lease.lock` is created. With the fix: 0 lease checks, rc 0, log "checked just before
  this one"; a fresh answer for a different role still triggers a real check (1). Against the pre-fix gate
  (`git show HEAD:…/claude-auto.sh`) the same test FAILS (expected 0, got 1; log line absent), so the race the CI hit is now
  reproduced deterministically and closed. Suite: 162/162 (was 158). shellcheck clean on both files.

---

# VibeBreaker review: Claude Duet seat + lane rows/aliases for the five hand-written agents (2026-11-02)

change-set: 4d188cc725cfa26d

## Verdict

**FIX FIRST** (template: FIX BEFORE SHIP). The deterministic checks pass, but the new lane word `hook` sends ordinary
engineering requests to the marketing Hook Writer as lead and re-lanes two engineering agents into it. `front door` and
the `hook-writer` compliance gate have related, smaller problems.

## Scope

- Change-set reviewed: this session's unstaged changes only (`git diff HEAD --` brain/agentos.py,
  wiki/ai-team/{cross-functional,desk-seats,org-chart,index}.md, docs/inventory/org-chart.json, integrations/agent-os/,
  context/decisions.md, memory.md). The staged merge of origin/claude/stoic-cori-pvn3f8 was already reviewed and was not reviewed again.
- Mode: diff review. Stack: Python 3 stdlib (brain/agentos.py, brain/route.py read-only), Markdown rule tables, JSON.
- Passes run: 01, 04, 05, 06, 07, 08, 12, 17, 18, 19, 20 (Python + routing data).
- Method: the baseline is the merged index (`git checkout-index -a` into the scratchpad). `brain.route.route()` ran on 24
  ordinary requests against the baseline and against the working tree, and the results were compared.
- Material scope limitation: NO.

## Deterministic checks

`verdict: PASS (19 passed, 0 failed)`. Also re-run on their own: `python3 -m unittest discover -s brain/tests -q` (160 OK),
`bin/brain doctor` (PASS), `bin/brain os check` (185/185 reachable, manifest current).

## Scoreboard

Passes executed 11/20 (the ones that apply) · Confirmed 4 · Critical 0 · High 1 · Medium 2 · Low 1 · Unverified 0 · Rejected 4 · First break: pass 04.

## CONFIRMED

```yaml
id: P04-F1
pass: 04
title: Lane word "hook" sends engineering requests to the marketing Hook Writer seat and re-lanes two engineering agents
status: CONFIRMED
severity: HIGH
confidence: HIGH
location:
  - path: wiki/ai-team/cross-functional.md
    line: "| Hook Writer | hook, hooks, caption, ... |"
  - path: integrations/agent-os/agents.json   (react-reviewer, conversation-analyzer: lane Vanessa -> Hook Writer)
  - path: integrations/agent-os/agents/react-reviewer.md, integrations/agent-os/agents/conversation-analyzer.md
trigger: |
  route("fix the stop hook in claude code"), route("the session start hook is failing"),
  route("install a git pre-commit hook"), route("review my react hooks")
bad_state: |
  Baseline: lead Vanessa, no seats. Now: lead "Hook Writer" alone, a Sonnet copywriting seat whose start page is
  wiki/ai-team/five-agents.md. In this repo "hook" means the Stop/SessionStart hooks of the code-validation gate.
  entry() routes the role text of bench agents that have no lead, so react-reviewer ("hook correctness") and
  conversation-analyzer ("preventing with hooks") are now in lane Hook Writer. Their generated agent files tell them
  to start from five-agents.md instead of CLAUDE.md. Both are engineering seats; react-reviewer still carries the ECC toolkit.
fix_proof: |
  Drop the bare "hook"/"hooks" (keep "hook ideas", "reel hook", "video hook", "3 hooks" or similar), then
  `bin/brain os write`. Proof: the four requests above go back to Vanessa (or Derek). react-reviewer and
  conversation-analyzer are back in lane Vanessa in agents.json. "write a hook for a listing reel" still includes Hook Writer.
```

```yaml
id: P04-F2
pass: 04
title: Chief of Staff lane word "front door" puts the Chief of Staff into listing-prep requests
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: wiki/ai-team/cross-functional.md
    line: "| Chief of Staff | ..., front door, run the specialists |"
trigger: route("paint the front door before listing photos"), route("stage the front door for the listing shoot")
bad_state: |
  Baseline wave: Marguerite, Sofia, Bianca, Carmen. Now "Chief of Staff" is added as the second seat. That seat fans out
  every specialist, so a staging question turns into a whole-team brief and takes one of the 8 wave slots.
fix_proof: Remove "front door" (it describes the seat; it is not something Steven would ask for). Proof: both requests match the baseline seat list again.
```

```yaml
id: P05-F1
pass: 05
title: hook-writer lost its Alexandra compliance gate in the manifest
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/agentos.py   entry(): gates = Alexandra only if seat in ("Alexandra","Victor","Sofia","Harrison")
  - path: integrations/agent-os/agents.json   hook-writer.guard.gates ["Alexandra","Vanessa"] -> ["Vanessa"]
trigger: bin/brain os show hook-writer (or Laya/Jarvis reading the manifest)
bad_state: |
  Before this change hook-writer sat in lane Sofia and its gates were Alexandra then Vanessa. The new lane "Hook Writer"
  is not in the hard-coded gate tuple, so Alexandra is dropped. .claude/agents/hook-writer.md says
  "Alexandra (ad-compliance-reviewer) confirms the final wording", and its output is public ad copy under Reg Z and Fair Housing.
  Also: route("write 3 hooks for my reel") lists only the Vanessa gate. The baseline did the same through Tariq, so that
  part is not new; the manifest gate is the regression.
fix_proof: Add "Hook Writer" to the Alexandra tuple in entry(), or pin hook-writer via SEAT_OF_LEAD -> "Sofia"; `bin/brain os write`. Proof: os show hook-writer gates == ["Alexandra","Vanessa"]; a unit test asserting it.
```

```yaml
id: P07-F1
pass: 07
title: Two of the five agents sit in a different lane from the one the planner sends their requests to
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/agent-os/agents.json   calendar-prep.laya.lane = "Voicemail & Inbox Triage"; inbox-triage.laya.lane = "Voicemail & Inbox Triage"
  - path: brain/agentos.py   SEAT_OF_LEAD (only chief-of-staff pinned)
trigger: bin/brain os show calendar-prep  vs  bin/brain route "prep my meeting with a lender"
bad_state: |
  The planner names lane "Calendar Prep" (starts from five-agents.md). The manifest puts the calendar-prep agent in lane
  "Voicemail & Inbox Triage" (starts from desk-seats.md), so Laya gives two answers for the same agent. Related:
  route("draft replies to my unread email") dispatches both "Inbox Triage" and "Voicemail & Inbox Triage" in the
  same wave, which gives two drafts of the same inbox. That is the kind of double pass the Duet decision rules out.
fix_proof: Pin the five slugs in SEAT_OF_LEAD to their own lane names (chief-of-staff stays Vanessa), then `os write`. Proof: os show lane == the route() lead for each agent's own keyword.
```

## REJECTED

- C1: "check competitor rates" adds Competitor Watch next to Harrison. Rejected: this is the intended join, and Harrison still leads.
- C2: "prep my meeting with a lender" / "meeting prep for the closing" now led by Calendar Prep. Rejected: meeting prep is that seat's job. Victor, Carmen and Harrison still join the closing request.
- C3: "always-on agent" / "approve on phone" now go to Claude Duet. Rejected as a defect: the baseline had no seat for them
  (lead Vanessa), and CLAUDE.md row "What runs when" still routes always-on questions to always-on/README.md. Noted as a watch item.
- C4: Claude Duet has no ALIASES entry, so plan_launch prints "(run through its lead; no separate agent file)". Rejected: the decision says Duet is an app, not an agent, so the launch sheet's wording is accurate.

## Coverage (inspected, clean)

- brain/agentos.py ALIASES: all five slugs exist in the roster; `named_seats_unresolved` is empty; the Python compiles; 160 unit tests pass.
- Claude Duet lane row, desk-seats section, index row, decisions entry, memory line: consistent with each other (Opus 5.5, research preview, waitlist is Steven's step, HALT-aligned approvals). No client PII and no credential appear.
- docs/inventory/org-chart.json parses (validate-code json PASS); doctor index/router/links/layout PASS.
- Baseline vs now on 24 requests: rate-lock HALT still fires; Regina still leads "what changed in the market this week"; Listing Pod and Lead Pod membership is unchanged.

## Top missing tests (pass 19)

1. route("fix the stop hook in claude code").lead != "Hook Writer", and the same for "review my react hooks". Fails today (P04-F1).
2. route("stage the front door for the listing shoot") contains no "Chief of Staff" seat (P04-F2).
3. build(): hook-writer guard.gates contains "Alexandra" (P05-F1).
4. For each of the five slugs, build() laya.lane == route(<that lane's first keyword>).lead (P07-F1).
5. A table-driven regression: for N ordinary requests, the seat set equals a recorded baseline. Any new lane word that
   adds a seat to an unrelated request then fails visibly. This would have caught F1 and F2.
6. No new lane row can re-lane an agent that matches ENGINEER_SLUG into a non-engineering seat.

## Not demonstrated

I did not exercise Laya on the Mac or the deck roster (aiTeamRoster v29 / aiTeamOrg v12). The Duet product facts are
taken from the page as written and were not checked against the vendor.

### Addendum — change-set: 68f1a82fb79faaeb (follow-up to 4d188cc725cfa26d)

All four findings fixed by the author: (1) Hook Writer keywords are phrases (write a hook, reel hook, video hook, post hook,
3 hooks, hook ideas) — the four engineering "hook" requests route to Vanessa again and react-reviewer / conversation-analyzer
are back in lane Vanessa; (2) "front door" removed — listing-staging requests give the base seat list; (3) "Hook Writer"
added to the Alexandra-gate list — `os show hook-writer` gates = [Alexandra, Vanessa]; (4) the five agents pinned in
SEAT_OF_LEAD, and the duplicate Inbox Triage lane row (and its alias) removed so inbox-triage lives in Voicemail & Inbox
Triage only. New tests: brain/tests/test_route_baseline.py (proven to fail with the bare "hook" keyword restored) and
test_agentos.test_five_agents_lane_and_gates. brain unit tests OK; validate-code PASS (21/21).

### Addendum — change-set: d740e35be5071e38

Docs-only follow-up to 68f1a82fb79faaeb: the lane count in context/decisions.md and memory.md corrected to 70 after the validator fixes, the index rebuilt to match. No code changed.

# VibeBreaker review: Steven's personal NMLS #2449246 filled in (docs only) (2026-11-02)

change-set: e5a3b7607055ed6c

## Verdict

`FIX FIRST` (verdict scale: SHIP / FIX FIRST / NEEDS-CONTEXT). The number is correct and consistent everywhere it was written,
and the legal claim matches what the repo already quotes. But two "still needs your NMLS" prompts Steven will see were left
behind, one drip footer still puts the company NMLS in his personal slot, and one memory line states a broader rule than
the hook-writer follows. All four are LOW and take minutes to fix.

## Scope

- Change-set: e5a3b7607055ed6c (uncommitted, `git diff HEAD`): .claude/agents/hook-writer.md, context/about-me.md,
  context/decisions.md, docs/HANDOFF-NEW-CHAT.md, docs/STEVEN-STEPS.md, integrations/ai-replica-studio/PLAN.md, memory.md.
  brain/index.json and docs/reports/CODE-VALIDATION.md are generated and are not part of the change-set.
- Mode: docs/prompt only, no executable code. Passes run: 01 (intent vs. change), 19 (missing checks), 20 (disproof). Code passes did not apply.
- `bash scripts/validate-code.sh`: `verdict: PASS (1 passed, 0 failed)` (brain doctor).
- Material scope limitation: NO. The statute text was not checked against the official code. The check was against what the repo quotes, as asked.

## Scoreboard

Confirmed 4 (LOW 4) · Info 1 · Rejected 4 · First critical pass: NONE

## CONFIRMED

```yaml
id: P01-F1
pass: 01
title: Replica reply template still asks Steven for his NMLS ID
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: docs/STEVEN-STEPS.md
    line: 356
trigger: Steven copies the item 21 reply line as instructed
bad_state: "`... LPT DRE ______ · NMLS ID ______ · ...`" asks for a number that line 355 (same item, edited in this change) now says is on file
fix_proof: grep -n "NMLS ID ______" docs/STEVEN-STEPS.md returns nothing
```

```yaml
id: P01-F2
pass: 01
title: Action Desk copy of item 21 not updated
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/action-desk.html
    line: 515
  - path: dashboard/action-desk.html
    line: 517
trigger: Steven opens the Action Desk (the dashboard copy of STEVEN-STEPS item 21)
bad_state: it still reads "(4) LPT Realty's brokerage DRE number and name plus your personal NMLS ID for the disclosure line" and the copy button holds "NMLS ID ______"
fix_proof: grep -c "personal NMLS ID\|NMLS ID ______" dashboard/action-desk.html returns 0; dashboard quickcheck still passes
```

```yaml
id: P01-F3
pass: 01
title: Drip/text footer puts the company NMLS in Steven's personal slot (pre-existing; now resolvable)
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: wiki/real-estate-playbooks/drip-and-text-follow-up.md
    line: 56-57
trigger: a drafter builds a drip/text template from the "Footer for every template" line
bad_state: "`Steven Shearrill · LPT Realty · DRE #____ · NMLS #1921615 · Patriot Pacific Financial NMLS #____`" shows Patriot Pacific's company NMLS as Steven's and leaves Patriot's blank. The personal NMLS (2449246) and personal DRE (01988316) are both known now
fix_proof: the footer reads DRE #01988316 · NMLS #2449246 · Patriot Pacific Financial Corp NMLS #1921615 (to match hook-writer.md:24), with no "#____" left except the LPT brokerage DRE if that is meant
note: this line was not part of the diff. It falls under "no leftover placeholder anywhere it matters", and drafts still pass Alexandra's gate and Steven's send.
```

```yaml
id: P01-F4
pass: 01
title: memory.md states a rule wider than the hook-writer applies
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: memory.md
    line: 124
  - path: .claude/agents/hook-writer.md
    line: 26
trigger: an agent answers "what goes on an ad" from memory.md (recall level 2)
bad_state: memory.md says DRE and personal NMLS "go on every ad with Patriot Pacific's company NMLS #1921615", but the hook-writer real-estate line has no company NMLS. The repo only quotes the company ID as required on mortgage ads (B&P 10236.4)
fix_proof: memory.md line says the company NMLS #1921615 goes on mortgage ads only, matching hook-writer.md lines 24 and 26
```

## INFO

- P01-I1: the repo already holds a candidate LPT Realty broker DRE. `dashboard/brain-4d.html` graph node "LPT Realty broker info
  — CA DRE #02248983, designated officer Kim McKeag" (from VANESSA v81 › C.A.R.). PLAN.md, decisions.md, STEVEN-STEPS.md and
  HANDOFF still call it missing. It is not verified here, so only Steven can confirm it before it goes on an ad.

## REJECTED

- Legal citation overstated: rejected. hook-writer.md:28 ("also an MLO, so his personal NMLS ... per B&P 10140.6(b)") matches
  PLAN.md:42 ("Where the licensee is also an MLO the NMLS unique identifier is required too (B&P 10140.6 ...)") and
  wiki/real-estate-playbooks/drip-and-text-follow-up.md:53. decisions.md:866 says the same and no more.
- Number inconsistency: rejected. Every occurrence of the personal NMLS in the repo is 2449246, including the earlier,
  independent dashboard/isa/isa-portal.html:3170 (valoaneducator.tv/stevenshearrill-2449246) and
  references/drive-second-brain-notes.md:169. Every occurrence of Steven's DRE is 01988316.
- Leftover `[your NMLS ID]`: rejected. `git grep "your NMLS"` returns no hits.
- Stale copies in exports/notebooklm/: rejected. That mirror is rewritten weekly (integrations/notebooklm/README.md) and is not a source.

## Coverage (inspected, clean)

All seven changed files were read line by line in the diff. hook-writer.md (both disclosure lines; the mortgage line keeps
company NMLS #1921615 and Equal Housing), about-me.md, decisions.md (append-only, new dated entry at the bottom),
HANDOFF-NEW-CHAT.md, PLAN.md (both spots) and STEVEN-STEPS.md line 355 are clean. A repo-wide grep for NMLS/DRE numbers and placeholders found nothing else.

## Top missing tests (pass 19)

1. A brain doctor or lint check that fails when a disclosure line in .claude/agents/*.md or wiki/real-estate-playbooks/*.md
   contains `#____`, `[your`, or an NMLS other than 2449246 / 1921615 in Steven's or Patriot's slot.
2. A check that the Action Desk item text matches docs/STEVEN-STEPS.md for the same step number. It would have caught P01-F2.

## Not demonstrated

Whether B&P 10140.6(b) actually requires the NMLS ID on a pure listing ad was not checked against the official code.
Alexandra drafts and Steven decides (HALT: legal interpretation).

### Addendum — change-set: e5f8b0d076fdbe04 (follow-up to e5a3b7607055ed6c)

All four LOW findings fixed by the author: P01-F1/F2 the copy-reply line in docs/STEVEN-STEPS.md and dashboard/action-desk.html no longer asks for the NMLS ID, and item 21 in the Action Desk says it is on file; P01-F3 the drip footer reads DRE #01988316 · NMLS #2449246 · Patriot Pacific Financial Corp NMLS #1921615, company NMLS on mortgage templates only; P01-F4 the memory line limits the company NMLS to mortgage ads. Greps for `NMLS ID ______`, `personal NMLS ID`, `#____` and `[your NMLS` return nothing in those files. LPT DRE #02248983 seen in the 6D Brain is left for Steven to confirm.

# VibeBreaker review: Zoho coverage rows, 6D Big-moves trigger id, automation-optimization docs (2026-11-02)

change-set: 6d5974c523b4c3ea

## Verdict

`FIX BEFORE SHIP` (FIX FIRST). The code change works: the 6D trigger id is correct, the tests pass, and the docs contain no PII. Two of the brief's stated claims do not hold. The Zoho email-log README says a live task is disabled when it is enabled, and the zoho* rows no longer appear in the default `bin/brain coverage` output. Both fixes are text-only.

## Scope

- Commit / branch: uncommitted on top of HEAD. The tracked diff covers writers.json, template.html, brain-4d.html, decisions.md and memory.md, plus INDEX.md, brain/index.json and CODE-VALIDATION.md, which are generated. The untracked files are docs/reports/AUTOMATION-OPTIMIZATION-2026-11-02.md, integrations/zoho-email-log/{README,SCHEDULE}.md
- Mode: proportionate. JSON register, one JS constant, docs.
- Passes completed: 01, 04, 05, 17, 19, 20
- Evidence: `bash scripts/validate-code.sh` gave `verdict: PASS (5 passed, 0 failed)`. `python3 -m unittest discover -s brain/tests -q` ran 163 tests, OK. Read-only `get_trigger` on 01XwFre, 014QQGp, 01QRFyr, 01VAGt, 01UiJfB8, 018ZJ, 011xpW, 01JoMrj, 016qKE and 01AvXB. `list_triggers enabled=true recurring=false` returned 0 enabled one-shots.
- Material scope limitation: NO. Deck docs (zohoSync history, 6D v100) were not read. See UNVERIFIED.

## Scoreboard

- Confirmed: 3 (Medium 1, Low 2) · Unverified: 1 · Rejected: 4

## CONFIRMED

**P05-F1 · MEDIUM · integrations/zoho-email-log/README.md:147 and :173 (also SCHEDULE.md:117-119)**
- Claim: the README says the daily task "Zoho VA class follow-up notes" `trig_01UiJfB8tvbxrAJCZDQhJTUp` was replaced and moved from enabled to disabled. SCHEDULE.md says it "ran until 2027-01-05" in the past tense.
- Evidence: `get_trigger` returns `"enabled":true` with updated_at 2026-11-02T22:51:18Z. AUTOMATION-OPTIMIZATION-2026-11-02.md:60 itself says it was "re-enabled by Claude". The two committed files contradict each other, and the README describes a change that was reversed.
- Trigger: anyone, or the cloud-routines inventory regen (F9), reads the README as the record.
- Bad state: they believe the daily Chrome task is off. It is live, and it writes notes nightly.
- Fix proof: README :147 and the :173 row say "kept enabled (re-enabled 22:51Z; it also logs calls)". SCHEDULE.md :117 says "runs until 2027-01-05".

**P01-F2 · LOW · brain/coverage/writers.json zohoSync/zohoLeads/zohoDeals (behavior in brain/coverage.py:179-202)**
- Claim: the intent was to keep these rows visible in `bin/brain coverage`.
- Evidence: under HEAD, kind "retired" with a note set gap=True. Default `bin/brain coverage` listed 5 gaps, including zohoLeads, zohoSync and zohoDeals. This was recomputed with HEAD's writers.json. Now kind "cloud" without `--db` gives status "unchecked" and gap=False. The output says "2 gaps" and names no zoho row. The `--json` output carries only counts and gaps, so the rows are not shown there either.
- With `--db` and a deck export: zohoLeads and zohoDeals stay "stale", because the feed routine's blocked branch says "Do NOT touch zohoLeads or zohoDeals". Their 8 h cadence makes them gaps again, so the deck-side view still shows them.
- Trigger: running `bin/brain coverage` locally.
- Bad state: the Zoho block disappears from the CLI gap list. The report's F6 measurement "gaps 2 → 0" can then read as done while Zoho data is still the Sep 14 paste.
- Fix proof: either accept this and say so in the report, or add a test that asserts zohoLeads is a gap under a `--db` fixture with a stale stamp.
- test_coverage.py still passes; its assertions are kind-generic.

**P17-F3 · LOW · dashboard/brain-4d.html (G constant)**
- Evidence: the rebuilt page has `"files":168`, but INDEX.md now says 169 files. `grep -c zoho-email-log dashboard/brain-4d.html` returns 0. The page was built before the reindex that added the new README.
- Bad state: the 6D graph and search miss integrations/zoho-email-log/README.md until the next rebuild.
- Fix proof: rerun `python3 dashboard/brain-4d/build.py` after the reindex, and G.files reads 169.
- The 3:30 AM rebuild fixes this on its own if the change is not re-run.

## UNVERIFIED

- writers.json zohoSync note says the feed was "re-tested 2026-11-02 19:42 UTC" and "writes the status every run". The trigger's last_fired_at is 19:42:03Z, which matches. But last_run finished 9 ms after firing, which is the "delivered, not done" pattern the report's own F1 describes. Proving the status is written needs a read of the Command Deck `state/zohoSync` history.

## REJECTED

- BM_TRIGGER wrong: rejected. trig_01XwFre24w9aKq5oVRq1FQ8s is enabled, named "Big moves — …", cron 6:05 AM PT. trig_014QQGp4WQfWGDVB827R4Qb9 is disabled and named "[retired 2026-10-25 …]". Both copies of template.html:772 and brain-4d.html carry the new id.
- 22 one-shots still enabled: rejected. The first (018ZJ) and last (011xpW) are disabled, and `list_triggers enabled=true recurring=false` returns none.
- "True duplicates NOT disabled" overstated: rejected. 01JoMrj and 016qKE are both enabled. 016qKE has `created_via: http_api`, as the report says.
- PII in committed files: rejected. A phone and e-mail regex over the new files and the diffs returns no hits. SCHEDULE.md names tags and templates only.

## Coverage (inspected, clean)

- writers.json: valid JSON. The trailing newline was added. The kind value is in coverage.KINDS.
- decisions.md: the new dated entry is append-only.
- memory.md: one dated line.
- Weekly task 01VAGt matches the README: Mon 7:43 PT, fresh session, push on, no connectors, first run 11-09.
- Saved fresh-session Big moves 01AvXB is disabled, as stated.
- QRFyr cron 05:41/11:41/16:41/21:41 PT matches the writers.json text.

## Top missing tests (pass 19)

1. test_coverage: with a `--db` fixture whose zohoLeads stamp is older than 12 h and kind "cloud", assert status "stale" and gap True.
2. A doc-lint check that every `trig_…` id with a stated state in integrations/*/README.md matches `list_triggers` output. It would have caught P05-F1.
3. validate-code.sh: when INDEX.md changed, assert brain-4d.html G.files equals INDEX's file count.

## Not demonstrated

- Live overlap: the daily Chrome task 01UiJfB8 and the weekly connector task 01VAGt both cover CLASS leads.
- The weekly task's B4 dedupe only looks for "Email sent - <date>". The daily task's notes are titled "Follow-up log <date>".
- Once the Zoho connector is attached and the permission is granted, the same email may be logged twice. This is a live-prompt question for Steven, not part of this diff.

### Addendum — change-set: 7b33b658534678ce (follow-up to 6d5974c523b4c3ea)

F1 fixed: integrations/zoho-email-log/README.md and SCHEDULE.md now say the daily Chrome task trig_01UiJfB8tvbxrAJCZDQhJTUp was re-enabled 22:51Z and stays on; the live weekly prompt (trig_01VAGtRqjLsfKxfh1FXSM9Xf, updated 22:55Z) and the README copy both skip any email already in a "Follow-up log <date>" note, so the two never double-log. F2 answered: the report now states that plain `bin/brain coverage` no longer lists the Zoho docs and that `--db` still shows zohoLeads/zohoDeals stale. F3 accepted: dashboard/brain-4d.html is one indexed file behind; the 3:30 AM rebuild picks it up, no republish for one README.
