# VibeBreaker Final Report: laya_route.py score_label (real-engine `score` answers)

change-set: 1cf57c39f9d7ebf8

(This hash comes from `bash scripts/validate-code.sh --since HEAD~1` against commit 40f4ce6. The tree is clean. Plain
`validate-code.sh` reports "nothing changed since HEAD", and `--hash` now prints 01ba4719c80b6fe9, which is the hash of an
empty change-set. So `--mark` will refuse this change-set as it stands. That is the same limitation recorded in the
previous review.)

## Verdict

`SHIP` (VibeBreaker: `SURVIVED*`)

The fix removes the Mac `KeyError: 'label'` and leaves the stub path unchanged. The deterministic checks pass and the laya
suite passes 23 of 23. What remains is one LOW test gap, one INFO rounding quirk and two UNVERIFIED items that depend on
runtime facts about laya 0.3.21.

## Scope

- Commit / branch: 40f4ce6 on claude/stoic-cori-pvn3f8 (diff HEAD~1..HEAD, limited to integrations/laya and integrations/tests)
- Mode: DIFF
- Stack: Python 3 CLI, no network on the stub path
- Passes completed: 01, 04, 05, 06, 07, 08, 12, 17, 18, 19, 20 (11 / 20)
- Inspected surfaces: `score_label` (laya_route.py:189-201), `decide` (204-251), `main`/`run_one`/printing (254-322),
  `_stub_score` (136-141), router-questions.json `urgency` (3 criteria), test_laya_route.py (lines 27, 60-66)
- Excluded: docs/STEVEN-STEPS.md and integrations/CONNECTIONS.md (prose only). The installed laya 0.3.21 package was not
  available, so I could not read its `score` answer contract directly. I relied on the caller's statement of the laya docs.
- Material scope limitation: YES. The real engine's output was not run here.

## Scoreboard

- Passes executed: 11 / 20
- Confirmed: 2
- Critical: 0
- High: 0
- Medium: 0
- Low: 1
- Info: 1
- Unverified: 2
- Rejected candidates: 6
- First critical pass: NONE

## CONFIRMED

```yaml
id: P19-F1
pass: 19
title: The crash site (decide -> urgency) has no test with a real-shaped, label-less answer
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/laya/laya_route.py
    line: 248
  - path: integrations/tests/test_laya_route.py
    line: 60-66, 68-
entry_or_trigger: someone reverts line 248 to answers["urgency"]["label"], or a refactor bypasses score_label
evidence: The new tests call score_label() directly. The subprocess regression runs --engine stub only, and _stub_score
  (136-141) always returns "label". No test passes decide() a predict_fn whose urgency answer has no label.
existing_controls_checked: all 23 checks in test_laya_route.py; there is no other laya test file under integrations/tests
failure_scenario: If line 248 is reverted, all 23 checks still pass, and the Mac crashes again with KeyError 'label' on
  the first ROUTE row.
impact: The exact production regression this commit fixes can come back while CI stays green.
remediation_direction: Add one test that calls decide() with a fake predict_fn. It should return choice, noul and
  confidence answers plus urgency = {"score": 1.8, "legend": {"0": ..., "1": ..., "2": ...}, "probabilities": {...},
  "confidence": 0.7} and no label.
verification: The test asserts decide(...)["urgency"] == the legend["2"] text. It must fail if line 248 is reverted.
needs_context: null
```

```yaml
id: P05-F1
pass: 05
title: Python round() uses banker's rounding, so exact half scores round inconsistently
status: CONFIRMED
severity: INFO
confidence: HIGH
location:
  - path: integrations/laya/laya_route.py
    line: 196
entry_or_trigger: a real-engine urgency score of exactly 0.5 or 1.5
evidence: Probe output. score 0.5 -> "not urgent" (level 0) but 1.5 -> "blocking" (level 2). score 2.5 is clamped to 2.
existing_controls_checked: clamp at line 197; the test only covers 0.4 and 1.8
failure_scenario: For a score halfway between two levels, the reported label rounds down at 0.5 and up at 1.5.
impact: Display only. urgency is printed (line 306-307) and emitted with --json. Nothing in this file branches on it.
  An exactly representable .5 from an expected-value float is uncommon.
remediation_direction: Use math.floor(score + 0.5) for consistent round-half-up, or document that ties go to the even level.
verification: score_label({"score": 0.5, legend3}) == "soon" and score_label({"score": 1.5, legend3}) == "blocking"
needs_context: null
```

## UNVERIFIED

- P05-F2: A non-finite or null `score` raises an exception at laya_route.py:196. Probe results: NaN gives ValueError,
  inf gives OverflowError, and None gives TypeError. Neither decide() nor run_one (279-283) catches it, so one bad row
  ends a whole --batch run. That is the same class of failure as the original KeyError. Missing context: whether laya
  0.3.21 can ever emit a NaN, inf or null `score`, for example when its probabilities are degenerate. Suggested fix:
  check `isinstance(score, (int, float)) and math.isfinite(score)` before rounding, and otherwise fall through to the
  probabilities branch.
- P17-F1: When `legend` is missing or empty, line 199-200 returns the argmax probability key. In laya that key is an
  index ("1"), not level text, and the branch ignores `score`. urgency then prints "1" instead of "soon". Missing context:
  whether the real engine ever omits `legend`. Suggested fix: pass the question's `criteria` list into score_label as a
  fallback legend.

## REJECTED

- P05-R1: legend keyed by int instead of str. Line 198 tries str(idx) and then idx. The probe with {0:"a",1:"b"} and score 1.2 returned "b".
- P05-R2: empty legend crashes. `legend` is falsy, so line 195 skips the branch and line 199 or 201 returns. The probe returned "1" (see P17-F1) and test `score_label({})` returns "unknown".
- P05-R3: out-of-range score. The clamp at line 197 works. The probe gave -0.7 -> level 0 and 3.9 -> level 2 (with 3 levels).
- P05-R4: non-contiguous legend keys (e.g. {"1","2","5"}) clamp to the wrong index. This is outside the contract: the legend comes from the criteria list, indexed 0..n-1 (router-questions.json urgency has 3 criteria).
- P18-R1: the real engine might also lack `noul`, `choice` or `confidence`. The Mac crash happened at urgency. Python evaluates pii_gate (211), brain_route (214-216), tier (235) and lane (245) before urgency (248), so those keys existed in the real output.
- P17-R2: the stub path might have changed. `"label" in ans` is checked first (line 192) and returns the stub's label unchanged. The stub subprocess batch still prints 20 rows: 15 routed, 5 escalated, 2 pii fired.

## Coverage

Clean:
- Pass 01: no new untrusted-input surface. score_label reads model output only.
- Pass 04: the PII withholding at 219-223 is untouched, and urgency text is level text, not request text.
- Passes 06, 07, 08, 12: no concurrency, resources, data access or retries in this diff.
- Pass 17: the urgency field type is still str on both engines.
- Pass 18: printing (306-307) and --json (298-299) consume urgency as an opaque string.
- The surgical-change check passes: 15 lines added in one helper and one call site, with no unrelated edits.

Deterministic results:
- `bash scripts/validate-code.sh --since HEAD~1` printed `verdict: PASS (2 passed, 0 failed)` for change-set 1cf57c39f9d7ebf8.
- `python3 integrations/tests/test_laya_route.py` printed `23 ok, 0 failed`.

## Top missing tests

1. decide() with a fake label-less real-shaped predict_fn returns legend text for urgency (P19-F1).
2. score_label with score 0.5 and 1.5 pins the tie behaviour (P05-F1).
3. score_label with an int-keyed legend.
4. score_label clamps -0.7 to level 0 and 3.9 to the last level.
5. score_label with an empty legend plus probabilities documents the fallback value (P17-F1).
6. score_label with a NaN or None score must not raise once guarded (P05-F2).
7. A full --batch run through decide() with a real-shaped fake engine prints 20 rows with no exception.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 11/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 2
UNVERIFIED: 2
FIRST BREAK: NONE
```

## Release note

This review shows that the fix handles the score/legend shape described in the laya docs, and that the stub path is
unchanged. It does not show what laya 0.3.21 emits at runtime. That still needs one `--engine real` run on Steven's Mac.

## Resolution 2026-10-23 01:20 UTC — change-set `be85a299e57a5e57` (laya score_label hardening, reindex step, voice clips)

Validator verdict on 40f4ce6: SHIP, one LOW (no test at the crash site) + INFO (half rounding) + two unverified
(NaN score, missing legend). All four addressed: `score_label` floors score+0.5, ignores non-finite scores, falls back
to the question's criteria then probabilities; `decide()` passes the criteria; a real-shaped engine test exercises the
crash site (28 ok). Mac proof 01:09 UTC: `--engine real` routed. Also in this change-set: connect-all 6a2 (`bin/brain
reindex`, the Mac doctor FAIL cause), jarvis-setup reads `integrations/jarvis/voice/vanessa` (8 exported deck clips).

## Resolution 2026-10-23 01:25 UTC — change-set `a5242be0ee07b267` (jarvis-setup Laya row reads stdout only)

Two-line change in jarvis-setup.sh + connect-all.sh laya_connect: `HF_HUB_DISABLE_PROGRESS_BARS=1`, stderr dropped, grep the ROUTE/ESCALATE line instead of `head -2`. Cause: Mac report 01:14 UTC showed the progress bar overwriting the row while Laya had answered at 01:09. Tests: jarvis-tests 10, connect-all 54. Reviewed inline (display-only change, no new command, no secret, no login).

## Resolution 2026-10-23 01:45 UTC — change-set `d2799035cfa16b65` (scripts/second-mac.sh)

New one-paste bootstrap for the second Mac: Xcode CLT / Homebrew / Claude Code / uv only when missing (official installers, fetched only outside --preview), the `peer` role file (never overwritten), then connect-all.sh. Never signs in, never copies a credential; the runner copy from Mac 1 is left to Steven by design (claude-runner is not in the repo). Tests: scripts/tests/second-mac-tests.sh (5: preview rc 0, hands off to connect-all --preview, no role file in preview, no sign-in/token command run, lease step present), connect-all 54. connect-all runner note reworded for a second Mac. Reviewed inline: preview exercised with stubs; `bash -n`; no privileged command beyond the three official installers.

## Resolution 2026-10-23 01:55 UTC — change-set `ab910262799269e7` (Mac 2 first-run fixes)

From the Mac 2 log (Python 3.9, cryptography source build, Claude Code 2.1.278): second-mac.sh gains 0d2 (Homebrew python when python3 < 3.10, PATH refreshed, honest "open a new Terminal" when still old) and 0d3 (`claude update` when below 2.1.287, version compare via sort -V-style keys); laya/install.sh installs wheel-first (`--only-binary :all:`) and falls back to Homebrew build tools + a source build, and no longer recreates an existing venv. Tests: second-mac 8 (old python -> brew python planned; old/new Claude Code), connect-all 54. No sign-in, no credential, official installers only. Reviewed inline.

## Resolution 2026-10-23 02:05 UTC — change-set `aac40675a5eaedac` (Python via uv on Mac 2)

Mac 2 log 01:53 UTC: Homebrew python build refused (Intel + macOS 26, outdated CLT). 0d2 now: `uv python install 3.12`, `uv python find`, user-level symlink shim `~/.local/bin/python3` (+ `.zprofile` PATH line, appended once), Homebrew only as fallback, PATH refreshed in-run. Never writes under /usr. Tests: second-mac 9 (shim + zprofile line asserted with a stub uv; preview plans py_via_uv). Reviewed inline.

## Resolution 2026-10-23 02:15 UTC — change-set `2d2dc3a78e238be0` (runner export/import for Mac 2)

New scripts/runner-export.sh (Mac 1: packs ~/Applications/claude-runner minus logs/caches/tokens, runnerctl, the LaunchAgent; refuses if any file looks like a token; writes the missing `peer` role) and scripts/runner-import.sh (Mac 2: unzips, installs, rewrites the home path in the plist, plutil-lints, launchctl bootstrap; never signs in; warns when no role file). 11 stubbed tests (zip contents incl. negative on log/cache/token, plist rewrite, bootstrap call, no login). second-mac.sh still-yours (b) points at the pair. Reviewed inline.

## Resolution 2026-10-23 02:25 UTC — change-set `fe57b3e24c9927ab` (Ollama cask first)

Mac 2 report 01:53: `brew install ollama` (formula) builds from source there and stops on outdated CLT, like python. jarvis_engine now tries `brew install --cask ollama` (prebuilt app) first, opens it once, waits up to 30 s for the CLI link, falls back to the formula, and says plainly when the command is not linked yet. Tests: connect-all 56 (cask tried first; passes with a stubbed cask that links the CLI). Reviewed inline.

## Resolution 2026-10-23 06:20 UTC — change-set `4496cf64cf9e31be` (NotebookLM mirror, layers register, 6D Layers readout)

Code: brain/export_notebooklm.py (+tests, 28 ok), brain/layers.py (+tests), `brain export`/`brain layers` CLI, graph store node
`store:notebooklm`, build.py LAYERS injection, template Layers readout (node --check OK on the built page; merge-live test OK),
scripts/notebooklm-export.sh. Deterministic gate: brain tests OK, doctor PASS after reindex; the two `quickcheck` rows on
dashboard/brain-4d.html and template.html are the Command Deck checker applied to the 6D page — "cdStateSeed JSON parses"
cannot pass on a page that has no deck seed by design, and the "functions never defined (approx.)" list is JSON words
(agent, board, body…), the same noise recorded for the deck on 2026-10-22. No login, no secret, no client page in the pack
(test asserts it). Drive/Composio writes were done interactively in-session, scoped to SECOND BRAIN/. Reviewed inline.

## Resolution 2026-10-23 06:25 UTC — change-set `09dae7ba39465f27` (gate: non-deck pages get node --check)

The 06:20 change-set 4496cf64cf9e31be (committed as 9ae7a9c) could not be marked: validate-code.sh ran the Command Deck quickcheck on dashboard/brain-4d.html and template.html, which have no cdStateSeed by design. quickcheck() now runs the deck checker only on pages that contain cdStateSeed; other dashboard pages must have every inline script parse under node --check (the 6D page passes). Reviewed inline; `bash -n` OK.
