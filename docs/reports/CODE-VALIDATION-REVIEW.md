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
