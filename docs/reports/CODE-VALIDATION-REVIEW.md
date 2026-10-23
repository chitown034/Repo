# VibeBreaker Final Report: "Ask Vanessa" AI chat on the 6D Brain

change-set: 9e189531d5ea6c80

(From `bash scripts/validate-code.sh` at 2026-10-23T14:10:16Z on the uncommitted tree over HEAD 7effc30, branch
claude/stoic-cori-pvn3f8. Any edit to a hashed file changes the id; `brain/index.json` and `INDEX.md` are excluded from
the hash, so `bin/brain reindex` alone does not change it.)

## Verdict

`FIX FIRST` (VibeBreaker: `BROKEN` by the repo's gate rule — the deterministic gate fails)

Gate verdict line: `verdict: FAIL (3 passed, 1 failed)` — `brain doctor` fails because `brain/index.json` is stale after
the edit to `wiki/ai-team/second-brain-layers.md`. The chat code itself works on the happy path and on every single-call
failure path, but a second question sent with Enter while one is in flight starts a second call, and a failure of the
first then deletes the wrong turn, leaving the chat history paired wrongly.

## Scope

- Commit / branch: uncommitted working tree on claude/stoic-cori-pvn3f8, base 7effc30
- Mode: DIFF. Dashboard HTML + inline JS: 01, 04, 05, 06, 07, 08, 12, 17, 18, 19; Python (build.py): 01, 04, 05, 19; then 20
- Stack: static HTML + inline JS (6D Brain), Python 3 stdlib (build.py), claude.ai `sample` capability (contract
  sample.d.ts 0.2.89)
- Files: .gitattributes, dashboard/brain-4d/template.html, dashboard/brain-4d/build.py, dashboard/brain-4d.html (built),
  dashboard/brain-4d/vanessa.jpg, wiki/ai-team/second-brain-layers.md
- Excluded: the claude.ai viewer runtime itself (stubbed), speechSynthesis with real voices (headless Chromium has none)
- Material scope limitation: YES — real `sample` runtime and real TTS were stubbed/unavailable

## Scoreboard

- Passes executed: 11 / 20 (DIFF)
- Confirmed: 3 (Critical 1 — the gate rule, High 0, Medium 1, Low 1)
- Unverified: 2
- Rejected candidates: 4
- First critical pass: P00 (deterministic gate)

## CONFIRMED

```yaml
id: P00-F1
pass: 00
title: Deterministic gate fails - brain index stale after the wiki edit
status: CONFIRMED
severity: CRITICAL   # by the repo rule: a failing gate is P00-F1 CRITICAL; the underlying defect is a missing reindex
confidence: HIGH
location:
  - path: wiki/ai-team/second-brain-layers.md
    line: 33-37
  - path: brain/index.json
    line: n/a
entry_or_trigger: bash scripts/validate-code.sh -> bin/brain doctor
evidence: "FAIL index: brain/index.json stale vs the tree ... run `bin/brain reindex`"; verdict: FAIL (3 passed, 1 failed)
existing_controls_checked: router, links, layout checks all ok
failure_scenario: bin/brain recall serves the old index for the layers page; the new "Ask Vanessa" layer line is not recallable; --mark is blocked
impact: brain recall freshness; the change cannot be marked validated
remediation_direction: run bin/brain reindex
verification: bash scripts/validate-code.sh prints "PASS brain doctor" and verdict PASS
needs_context: null
```

```yaml
id: P07-F1
pass: 07 (concurrency / re-entrancy)
title: Enter key bypasses the disabled Send button; overlapping vanAsk calls corrupt vanTurns
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 774 (no in-flight guard), 782 (vanCtl overwritten), 791-793 (pop()/finally act on shared state), 796 (keydown -> requestSubmit)
entry_or_trigger: type a question, press Enter; while "Reading the brain", type another and press Enter
evidence: >
  vanAsk only checks `!vanSample || !question`. The Send button is disabled but the keydown handler calls
  form.requestSubmit(), which fires submit regardless. Headless repro (stub: call 1 fails after 600 ms with no text,
  call 2 answers "slow"): 2 sample calls made; final vanTurns = ["user: Question: first q", "assistant: slow"] -
  call 1's catch popped the SECOND question's user turn, so the failed first question is now paired with the answer
  to the second. Call 1's finally also sets vanCtl = null and hides Stop while call 2 is still running.
existing_controls_checked: vanSend.disabled (does not stop requestSubmit); the contract permits consecutive user turns, so the fault is mis-pairing, not an invalid request
failure_scenario: every later answer is generated over a history that says question 1 was answered with question 2's answer; Stop cannot cancel the live call; usage is spent twice
impact: wrong context for Vanessa's later answers in that chat; viewer's Claude usage
remediation_direction: return early from vanAsk (or the submit handler) while vanCtl is set; or abort the previous call and remove that call's own turn by identity, not pop()
verification: in the stub harness, press Enter twice during a slow call -> exactly one sample call; or, if superseding, vanTurns never contains a user turn whose next assistant turn answers a different question
needs_context: null
```

```yaml
id: P06-F1
pass: 06 (error handling)
title: capability_disabled / capability_removed shown as "Connection hiccup. Ask again." instead of hiding the chat
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 792
entry_or_trigger: sample() rejects {code: "capability_disabled"} (granted but unusable in this view) or "capability_removed"
evidence: only not_granted / sampling_disabled / not_declared hide the form; the contract lists capability_disabled and capability_removed in the same "hide the feature for this view, never re-ask" group. Stub repro: form stays visible, bubble reads "Connection hiccup. Ask again."
existing_controls_checked: VAN_COPY map, unknown-code fallback to upstream_error
failure_scenario: viewer retries a call that can never succeed in this view; each retry fails the same way
impact: misleading copy, wasted clicks; no data harm
remediation_direction: add the two codes to the hide branch
verification: stub rejecting capability_disabled -> #vanForm hidden, #vanOff shown
needs_context: null
```

## UNVERIFIED

- P17-U1 — `speechSynthesis.cancel()` at the start of vanAsk (and in vanSay) may fire the previous utterance's
  onend/onerror asynchronously, whose handler calls `vanState("idle", "")` and sets `vanUtter = null` after the new
  state was set (template.html, vanSay `u.onend = u.onerror`). Needs a browser with real voices to see whether the
  "thinking" caption is clobbered. Cosmetic at most.
- P05-U1 — whether the published 6D artifact declares `capabilities: {sample: {}}`. Without it `use("sample")` returns
  null and the chat stays hidden (handled correctly). Needs the publish call / artifact manifest.

## REJECTED

- Turns ending on assistant or with empty content — every failure path tested (cancelled with/without text, upstream
  error with "" and with text, refused, capability_disabled) left the next call starting and ending on `user` with
  non-empty content; empty `e.text` pops; partial `e.text` on cancel becomes the assistant turn.
- Data-URI breaking the style attribute / CSS url() — the inlined value contains only `data:image/jpeg;base64,` plus
  [A-Za-z0-9+/=]; no quote, paren or space. Computed background-image resolves in both places (smoke).
- build.py conditional-expression precedence — `"data:..." + b64(read) if exists else ""` parses as
  `(prefix + b64) if exists else ""`; read_bytes is not evaluated when the file is absent.
- Trimming `vanTurns` to 8 drops the rules turn — the rules turn is prepended per call, not stored; after 7 asks the
  call still starts with VAN_RULES (15.4 KB, far under 256 KiB).

## Coverage (inspected and clean)

- Gate: quickcheck of template and built page (all inline scripts parse via node --check), py_compile build.py.
- `node smoke.js` re-run: no page errors, SEC 1256, askRender/vanAsk functions, photo data URI, state idle -> listening.
- Extended stub harness (scratchpad smoke-van.js, `window.claude` injected via addInitScript): form shows and #vanOff
  hides once `use` resolves; a `.msg.van` bubble reads "hi"; presence states listening -> thinking -> speaking -> idle;
  "Pages read" links are REPO + SEC path (3 GitHub links); without `window.claude` the form stays hidden and the
  note shows.
- Call shape: `[{role:"user", content:VAN_RULES}, ...turns]`, `cache:false`, no tools, `signal` = AbortController.signal,
  onText assigns `text` (not +=). Matches sample.d.ts.
- vanGround with stopwords only ("the of and is a"): no exception; turn carries "(no passage matched — answer \"not in
  the brain\" ...)".
- Privacy: the composite turn holds only the question, SEC passages (already masked / excluded) and the node's title and
  date for those same pages; no layer URLs, LINKS or DB data. VAN_RULES has no phone or e-mail (regex check); it names
  the public NMLS id only.
- XSS: chat text goes through mk() -> textContent and out.textContent; links set href = REPO + path only.
- CSS: `#vanForm[hidden]` computes display:none; `.msg.van::before` shows the portrait; under reduced motion the breath,
  ring and equalizer animations compute to `none`.
- Built page matches template: the Ask Vanessa JS block is byte-identical; no `/*VANESSA_PHOTO*/` placeholder left.
- `python3 -B -m unittest dashboard/brain-4d/test_build_passages.py`: 2 tests OK. Note: the gate does not run this test
  (it only runs brain/ unit tests); it was run by hand here.
- .gitattributes `*.jpg binary` applies (git check-attr). The gate's "ignored null byte" warning comes from the shebang
  probe reading the JPEG; harmless.

## Top missing tests (pass 19)

1. Enter pressed twice during an in-flight call -> one sample call (or a clean supersede), vanTurns pairs intact.
2. Every failure code (cancelled +/- text, upstream_error "" / text, refused, rate_limited) -> next call input starts and
   ends on user, no empty content.
3. capability_disabled / capability_removed / not_granted -> #vanForm hidden, #vanOff shown.
4. build.py: no `/*VANESSA_PHOTO*/` left in the built page and every inlined data URI matches `^data:image/jpeg;base64,[A-Za-z0-9+/=]+$`.
5. build.py with vanessa.jpg absent -> page builds, `url()` empty, no exception.
6. Composite turn privacy: the user turn contains no string from LINKS / layer URLs and no phone/e-mail pattern.
7. Stopword-only question -> the "no passage matched" text is sent.
8. vanTurns after 10 asks: call input <= 9 turns and starts with VAN_RULES.
9. Clear during an in-flight call -> no exception, next call well-formed.
10. Gate wiring: validate-code.sh runs dashboard/brain-4d/test_*.py when dashboard/brain-4d/ changes.

## Share card

```text
VIBE//BREAKER

VERDICT: FIX FIRST (gate FAIL)
PASSES: 11/20 (DIFF)
CRITICAL: 1 (gate)
HIGH: 0
CONFIRMED: 3
UNVERIFIED: 2
FIRST BREAK: P00
```

## Release note

Demonstrated with a stubbed `sample` runtime in headless Chromium, not the live claude.ai viewer, and without real
text-to-speech voices. Not demonstrated: the published artifact's capability declaration, or answer quality.

## Orchestrator response (2026-10-23 14:20 UTC) — Vanessa chat change-set, fix-up (now b0084f31667b22e6)

1. P00-F1 stale index — fixed: reindexed; the gate passes 7/0.
2. P07-F1 overlapping calls — fixed: `vanAsk` and the submit handler return while `vanCtl` is set, so one call at a time; turns stay paired.
3. P06-F1 hide codes — fixed: `capability_disabled` and `capability_removed` hide the form like `not_granted`.
Also: the gate now runs the 6D page tests (test_build_passages, test_merge_live) whenever dashboard/brain-4d changes; validate-gate-tests tolerates a bare mark commit at HEAD.
Steven's decisions noted by the validator: the page was republished with the `sample` capability on his request ("add an ai chatbot with vanessa into the 6d 2nd brain"); the chat spends the viewer's own Claude usage and asks once per view.
