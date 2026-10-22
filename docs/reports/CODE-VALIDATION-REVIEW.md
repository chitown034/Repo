# VibeBreaker Final Report

change-set: 0c440a6c3ee4e1ef

## Verdict

`SURVIVED*` (gate verdict: **PASS / SHIP**). Code-validator, 2026-10-22. No critical, high or medium findings. Two LOW findings are confirmed, and each is a small fix.

## Scope

- Files: brain/toolkit.py, dashboard/brain-4d/{build.py, template.html, merge-live.py}, brain/tests/{test_quickcheck.py, test_agentos.py, test_toolkit.py}, dashboard/brain-4d/test_merge_live.py. Generated files were excluded.
- Passes: 01, 04, 05, 06, 07, 08, 12, 17, 18, 19, 20 (diff mode). Material scope limitation: NO.
- Deterministic checks: `verdict: PASS (12 passed, 0 failed)`. Brain unit tests: 112 OK. test_merge_live: 2 OK.

## CONFIRMED

**P19-F1 (LOW, HIGH confidence): test_quickcheck needs `node`.** Location: brain/tests/test_quickcheck.py:18 calls dashboard/tests/quickcheck.py, and quickcheck.py:24 runs `subprocess.run(["node", ...])` without catching FileNotFoundError. Reproduced by running the test with node removed from PATH: all 4 tests FAIL, because the output stops at the first check. The "brain unit tests" step, which used to be pure Python, then goes red for every brain change on a machine without Node. Verify the fix by making it skip cleanly (`skipUnless(shutil.which("node"))`) or by having quickcheck report a missing node as a single check.

**P05-F1 (LOW, MEDIUM confidence): build.py only catches ValueError.** Location: dashboard/brain-4d/build.py:131. brain/toolkit.py:269 and :272 index `a["slug"]` and `a["laya"]["lane"]` outside the guarded read. If one manifest agent has no `laya` block, seat_card_rows raises KeyError (reproduced) and the build stops. agents_per_seat (build.py:94) accepts that same manifest. All 180 agents currently have `laya`, so only a hand-edited or partly merged manifest triggers this. Verify the fix with a test that builds the cards from a manifest entry that has no `laya` and expects `cards == {}` or a row with a lane of 0.

## REJECTED

- XSS in the seat note: template.html:679-683 sets only textContent, and say() also uses textContent. SEATS is embedded with `</` escaped (build.py:142).
- merge-live arguments: a bare `--all` is always read as the flag (`./--all` works). Wrong argument counts exit 2 before anything is opened or written, as they did before this change. A typo such as `--al` gives FileNotFoundError with nothing written.
- The org-chart table is byte-identical to HEAD's seat_cards (2884 chars, compared directly).

## Coverage

Clean: the seat_card_rows/seat_cards split, the card fields, the `--all` filter and its link pass, and the new agentos tests.

## Top missing tests

1. A test_quickcheck run without node.
2. Cards built from a manifest entry with no `laya`.
3. The default merge-live mode still drops a renamed own-family page when `--all` is absent, and `--all` brings it back. This makes the trade-off explicit.
4. setSeat on a seat that has no `c`.

## Release note

This review covers the files above as they are on disk. It does not cover rendering in a browser.
