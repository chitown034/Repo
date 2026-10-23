# VibeBreaker Final Report: big moves (brain/recs.py, 6D panel, org sync) + re-check of the four-repo fixes

change-set: 46dedb8f6dbccb36

(From `bash scripts/validate-code.sh` at 2026-10-23T17:03:23Z on the uncommitted tree: `verdict: PASS (18 passed, 0 failed)`;
`--hash` re-run before writing: 46dedb8f6dbccb36. `cd brain/tests && python3 -m unittest -q`: `Ran 123 tests ... OK`.
`bash connect-all-tests.sh`: `connect-all tests: 84 passed, 0 failed`.)

**The tree moved during this review.** Gate runs gave 744af5c07a9565dc (16:57:56, `verdict: FAIL (17 passed, 1 failed)`; the
failing row was overwritten by the next run before it could be read), then b7f395de75cbddb0 (16:58:48, PASS), then
46dedb8f6dbccb36 (17:03:23, PASS). In between, `docs/STEVEN-STEPS.md`, `docs/inventory/cloud-routines-2026-10.md` (16:58:02),
`memory.md` (16:58:48) and `wiki/ai-team/toolkit.md` (16:59:20) were rewritten by someone other than this reviewer. This
review covers 46dedb8f6dbccb36. Any later edit means a new gate run and a new review before `--mark`.

## Verdict

`FIX BEFORE SHIP` (repo verdict: FIX FIRST). No critical or high defect, and all five earlier findings are fixed. But the
feature's main promise, a priority order Steven can act on, does not hold yet. Today's top 10 has six Steven items tied
at 1.7 and listed alphabetically. One of Steven's steps (Arive) is missing. A declined move comes back the next day
under a twin id.

## Scope

- Branch: claude/stoic-cori-pvn3f8, uncommitted tree. Mode: DIFF.
- Stack: Python 3 stdlib (brain/), bash (connect-all*.sh, install-mac.sh), static HTML + claude.ai db capability (6D Brain), Markdown.
- Passes: 01, 04, 05, 06, 07, 08, 11, 12, 14, 17, 18, 19, 20.
- Inspected: brain/recs.py, brain/tests/test_recs.py, brain/__main__.py (recs, org), brain/toolkit.py, brain/graph.py,
  brain/tests/test_toolkit.py, dashboard/brain-4d/build.py, dashboard/brain-4d/template.html (bm panel), connect-all.sh 6g +
  tests, integrations/skill-packs/install-mac.sh tail, .claude/skills/pr-lens/{SKILL,VENDORED}.md, CLAUDE.md row,
  wiki/ai-team/cross-functional.md, second-brain-layers.md, docs/inventory/org-chart.json, docs/reports/BIG-MOVES.md,
  brain/recs/big-moves.json; db contract artifact-capabilities/0.2.89/db.d.ts, claude.d.ts, user.d.ts; the Big-moves
  scheduled task prompt (trig_014QQGp4WQfWGDVB827R4Qb9, read-only get).
- Probes: every write went to temp dirs or to the scratchpad (recs.LEDGER/WEIGHTS pointed at scratchpad/recsprobe). The
  Playwright harness `smoke-bm.js` was re-run, and a new `smoke-bm2.js` (scratchpad) covers six db stubs.
- Material scope limitation: NO.

## Scoreboard

- Passes executed: 13 / 20 (diff-applicable set)
- Confirmed: 10 (Critical 0, High 0, Medium 3, Low 7, Info 0)
- Unverified: 2
- Rejected candidates: 9
- First critical pass: NONE

## Earlier review (267198e4d842179a): all five fixes confirmed

1. `mods()` is now an alias of `plugins()` (brain/toolkit.py:198-200). `KINDS` (toolkit.py:203) has no "mod". The test
   asserts that no name is counted twice and that the graph has no "mod" lobe (test_toolkit.py:26-27, 39). In
   `dashboard/brain-4d.html`, the count of `"mod:` is 0. `bin/brain toolkit` prints "7 Claude mods (plugins)".
2. pr-lens SKILL.md pins `@coldtea/pr-lens-cli@0.13.2` (lines 10, 17, 18) and carries a "HALT before any upload" section
   (line 33). The npm registry shows `latest: 0.13.2`, published 2026-10-17. VENDORED.md records the pin and the HALT
   section, but its next sentence still says `@latest` (P05-F7, Low).
3. `_register()` downgrades an "ok" status that mentions 403, needs sign-in, until, blocked, not yet or refused
   (toolkit.py:181-182). The test asserts that Composio (cloud) and kapso are in "attention".
4. The archify block is the last thing in install-mac.sh. The `.zprofile` line is appended only when
   `npx skills add` succeeds and the grep finds no existing line. The newline guard
   (`tail -c 1` → "" when the file ends in \n) is correct.
5. No regression: connect-all 6g plus 5 new tests pass, and the 123 unit tests pass. The build.py `start > len(lines)`
   guard skips a stale section and does not crash.

## CONFIRMED

```yaml
id: P05-F1
pass: 05
title: STEVEN-STEPS extractor merges step c and d; the Arive step disappears and its text is filed under "TidyCal token"
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/recs.py
    line: 116
  - path: docs/STEVEN-STEPS.md
    line: 50
entry_or_trigger: any bin/brain recs run on today's docs/STEVEN-STEPS.md
evidence: the regex only starts an item at "^- **<letter>. ". Line 50 is "- **c. TidyCal token** (above). **d. Arive** →
  Settings …", so _steven_steps() returns 10 items, a b c e f g h i j k. There is no "d". bm_4aaed5dca1 "TidyCal token"
  has why = "(above). **d. Arive** → Settings → Integrations → Generate (Client ID, Secret, API Key; ne…", with the raw
  markdown left in.
existing_controls_checked: the test fixture has one item per line, so it never meets this case.
failure_scenario: Steven approves "TidyCal token" and is handed the Arive instructions. Saying "done c" also closes
  Arive. "done d" matches no move.
impact: a Steven-only revenue step (Arive LOS) is missing from the HITL list, and another step shows the wrong plan.
remediation_direction: start an item at any "**<letter>. " (not only at line start), or put d on its own line in the
  doc and add a check that the letters run a..k with no gap.
verification: a test on a fixture with "- **c. X** (above). **d. Y** → z" asserting four items, with d titled "Y".
```

```yaml
id: P06-F2
pass: 06
title: one real-world action is three or four moves with different ids; declining one brings back its twin the next day
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/recs.py
    line: 54, 120, 141-145
entry_or_trigger: Steven declines "Lofty API key" (steven-steps) on the 6D panel
evidence: candidates() dedupes on id = sha1(category|key). The same Lofty action arrives as "step:b"/steven,
  "api:Lofty (developer.lofty.com)"/connect and "connector:Lofty"/connect. Probe with the ledger in the scratchpad:
  after that decline, top() on 2026-10-24 ranks "Connect Lofty (developer.lofty.com)" #3 (score 1.6), and
  "Connect Lofty" #22. Zoho has four twins (step b, api Zoho CRM, connector Zoho CRM, mcp Composio).
existing_controls_checked: the decline lowers the weight only for the declined item's category ("steven"); the twins
  are in category "connect" and keep weight 1.0.
failure_scenario: Steven says no to Lofty, and the next morning the list asks him about Lofty again.
impact: a HITL decline does not hold, and the list fills with repeats instead of different moves.
remediation_direction: give each move one subject key (e.g. a normalised tool name), shared by its steven-steps,
  api, connector and mcp rows, and dedupe on it, keeping the highest-scoring row; or snooze by subject.
verification: test that declining the steven-steps Lofty move hides every candidate whose subject is Lofty for 30 days.
```

```yaml
id: P07-F3
pass: 07
title: "priority" among Steven's items is alphabetical; every steven-steps move gets the same constants
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: brain/recs.py
    line: 120, 238, 250
entry_or_trigger: today's bin/brain recs --write (docs/reports/BIG-MOVES.md, brain/recs/big-moves.json)
evidence: _steven_steps() hard-codes impact 4, effort 2, confidence 0.85 → score 1.7 for all ten items. The tie-break is
  the title, so ranks 1-6 are AnyDesk, Being found by AI search, Drips and texts, Lofty API key, MBS Highway, Orca
  pairing: alphabetical. With the 60% cap, ranks 7-10 are four "Guard <page> with a gold question" items
  (impact 1, score 0.9), while Steven-only API moves at 1.6 drop out.
existing_controls_checked: test_top_ten checks that the list is sorted by score, which a full tie satisfies trivially.
failure_scenario: Steven reads "#1 AnyDesk" as the most valuable thing to do today. It is first only because of the
  letter A.
impact: the "by priority, with the value of acting" requirement (Steven, 2026-10-23) is not met for the largest group
  of moves.
remediation_direction: score each step on its own terms (what it unblocks, e.g. how many toolkit items or pages wait
  on it; revenue lanes higher), or carry impact/effort in the STEVEN-STEPS line, and break ties on something other than
  the title.
verification: a test asserting that the steven-steps scores are not all equal on the real file, and that Lofty or Zoho
  (revenue unblockers) outrank AnyDesk.
```

```yaml
id: P04-F4
pass: 04
title: a learn() input without "at" is counted again on every later day; a same-day change of mind is dropped
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: brain/recs.py
    line: 189-192
entry_or_trigger: bin/brain recs learn d.json, where d.json has no "at", run on two days (or approve and then decline on one day)
evidence: probe on a temp root. The same {"id":"bm_a","decision":"approved"} fed on 10-23, 10-24 and 10-25 gives
  added 1, 1, 1 and an ops weight of 1.331. [{approved},{declined}] for one id on one day gives added 1; only "approved"
  is kept.
existing_controls_checked: the 6D page and the deck always send a full ISO timestamp (template.html:767; the scheduled
  task maps the deck's ts), so the scheduled task does not hit this today. Hand-written or agent-written files do.
failure_scenario: an agent re-feeds yesterday's decisions file, and the weights move again.
impact: the learned weights drift away from what Steven actually decided.
remediation_direction: refuse a decision without "at" (or default it to the file's mtime and the item's index), and
  dedupe on (id, at, decision).
verification: test that the same no-"at" file learned on two days adds 1 row in total.
```

```yaml
id: P04-F5
pass: 04
title: a declined/done row with a non-ISO "at" is hidden for ever; a non-object ledger line crashes top() and learn()
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: brain/recs.py
    line: 227-231, 165-168, 176, 206-207, 157
entry_or_trigger: ledger row {"decision":"declined","at":"Oct 23"}; or a ledger line "5"; or weights.json holding a non-number
evidence: learn() stores "at" exactly as given. In top(), date.fromisoformat raises ValueError, and the except branch
  runs `continue`, so the item never comes back (the docstring promises 30 days). read_ledger accepts any JSON value,
  and decisions_by_id then raises TypeError "'int' object is not subscriptable" (probe). load_weights float(v) raises
  on a non-number extra key.
existing_controls_checked: none. The ledger is append-only, and a hand edit or a merge conflict can leave a bad line.
failure_scenario: one bad line in brain/recs/ledger.jsonl and `bin/brain recs` exits with a traceback; the 6:05 AM task fails.
impact: availability of the daily list; a declined item disappears for good.
remediation_direction: on a ValueError, treat the row as not snoozed; read_ledger keeps only dicts that have id and
  decision; load_weights skips values that are not numbers.
verification: test with a ledger line "5" and a row with at="Oct 23", asserting that top() returns and still lists the item.
```

```yaml
id: P08-F6
pass: 08
title: a signals file that is not a list of objects crashes bin/brain recs; a string "plan" becomes one step per character
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: brain/recs.py
    line: 128-133
entry_or_trigger: bin/brain recs --write --signals s.json, where s.json is {"items":[...]} or ["x"]; or a signal with "plan":"call them"
evidence: probe. _signal_candidates(["x"]) and _signal_candidates({"items":[...]}) raise AttributeError "'str' object
  has no attribute 'get'". s.get runs before the try, and the except only catches KeyError/TypeError/ValueError.
  {"plan":"call them"} gives plan ['c','a','l','l',' ','t'].
existing_controls_checked: the test covers a dict without "key" only.
failure_scenario: the scheduled task writes signals.json in the wrong shape, and the whole big-moves run fails at step 4.
impact: no list that day (the scheduled task says nothing unless a step fails twice).
remediation_direction: skip any s that is not a dict, accept {"items":[...]}, and wrap a str plan as [plan].
verification: test that a signals list of ["x", {"key":"k","title":"t","plan":"p"}] yields one candidate with plan ["p"].
```

```yaml
id: P17-F7
pass: 17
title: one db document with a whitespace decision breaks the whole "Vanessa recommends" panel
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/brain-4d/template.html
    line: 752, 779-782
entry_or_trigger: page db doc recs/<id> with decision "approved later" (any viewer at interact can write the shared recs collection)
evidence: smoke-bm2.js (scratchpad) case spaceDecision. The pageerror is "InvalidCharacterError: Failed to execute 'add'
  on 'DOMTokenList'", and only 1 of the 10 items renders. The catch calls bmRender() again, which throws again.
existing_controls_checked: text goes through mk()/textContent, so XSS is clean: an `at` of "<img onerror>" renders as text.
failure_scenario: a deck sync or agent writes a free-text decision, and the panel goes empty for every viewer.
impact: the HITL surface is unusable until the doc is fixed.
remediation_direction: only add the class when st is approved, declined or later; otherwise ignore the value.
verification: extend smoke-bm2.js. The spaceDecision case must render 10 items with no pageerror.
```

```yaml
id: P19-F8
pass: 19
title: two recs tests read the live repo's ledger and weights, so Steven's own declines can fail CI
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: brain/tests/test_recs.py
    line: 22-23, 36-37
entry_or_trigger: brain/recs/weights.json committed with revenue < 0.378 (about 6 revenue declines at ×0.85)
evidence: test_signals asserts that the refi signal (5×0.9/1×w = 4.5w) is #1, ahead of steven-steps at 1.7×w_steven.
  test_top_ten needs ≥10 non-snoozed candidates in the real tree. Both call recs.top(ROOT, ...), which reads
  ROOT/brain/recs/ledger.jsonl and weights.json.
existing_controls_checked: the learning tests use temp roots; these two do not.
failure_scenario: after a week of real use, the brain unit tests fail and validate-code.sh reports FAIL on an
  unrelated change.
impact: false red gate.
remediation_direction: point recs.LEDGER and recs.WEIGHTS at a temp dir in setUp (the module constants already
  accept absolute paths).
verification: the tests pass with a weights.json of {"revenue":0.3,"steven":2.0} in the real tree.
```

```yaml
id: P06-F9
pass: 06
title: the executor classifier marks openflowkit as Steven-only because its desc says "no key"
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: brain/recs.py
    line: 53
entry_or_trigger: toolkit mcp row openflowkit (state pending)
evidence: the substring regex finds "key" in "…no key) arch…". The probe shows the match is "key@o, no key) arch". The
  move "Connect openflowkit" is executor steven. connect-all 6g registers it with no sign-in.
existing_controls_checked: none. "rep" and "sign" are bare substrings too.
failure_scenario: a move Vanessa could run once Steven has run the connect-all paste is listed as "only you can do this".
impact: wrong owner on a small number of moves.
remediation_direction: match whole words and skip negated phrases ("no key"), or carry the executor in the register row.
verification: test that the openflowkit mcp candidate has executor "vanessa" (or "mac").
```

```yaml
id: P05-F10
pass: 05
title: two doc lines contradict the fixes they describe
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: .claude/skills/pr-lens/VENDORED.md
    line: 1
  - path: wiki/ai-team/second-brain-layers.md
    line: (added "Registers the 6D Brain draws as lobes" bullet)
evidence: VENDORED.md says "pinned to @0.13.2 (was @latest)" and, in the next sentence, "The skill runs
  `npx @coldtea/pr-lens-cli@latest` on demand". The layers bullet lists "skills, plugins, Claude mods
  (`integrations/mods/`)" as separate registers, while toolkit.py now treats them as one (mods() = plugins()).
existing_controls_checked: brain doctor does not check prose.
failure_scenario: a reader or agent follows "@latest", or counts mods twice again.
impact: documentation drift on the two items the last review fixed.
remediation_direction: change "@latest" to "@0.13.2" in VENDORED.md, and say "Claude mods (plugins, `integrations/mods/`)".
verification: grep -n "@latest" .claude/skills/pr-lens/ returns nothing.
```

## UNVERIFIED

- U1: the FAIL at 16:57:56 (change-set 744af5c07a9565dc). Which row failed is unknown: CODE-VALIDATION.md was
  overwritten by the next run. Two later runs passed. A concurrent doc edit during the run (STEVEN-STEPS.md at
  16:58:02, which brain doctor/index checks read) is likely but not proved. To decide it: re-run with the tree frozen.
- U2: whether the live 6D artifact (VoWHW4YuKUCyNqGZMikEv8) declares the `db` and `user` capabilities. The scheduled
  task says it declares "sample, db and user", but this review did not read the artifact's manifest. Without db, the
  buttons are correctly disabled (smoke: nodb, dbnull → disabled true).

## REJECTED

- R1 db call shapes. `db.collection("recs").get()` → `snap.docs[]`, `d.id`, and `d.data()` match db.d.ts (QuerySnapshot,
  DocumentSnapshot). `doc("recs/"+id).set(obj)` is 2 segments, an even count, and `bm_<10 hex>` uses only allowed characters.
- R2 XSS. Every RECS/db string goes through mk() → textContent (template.html:661). The smoke test with
  at="<img src=x onerror=…>" renders it as text.
- R3 buttons without db. They are disabled (`b.disabled = !bmDb`), and the note says "open this page in claude.ai".
  `claude.use()` resolves null and does not reject (claude.d.ts:38-44).
- R4 candidates() on a bare repo. It returns 0 candidates, and top() returns [] with no exception (probe on an empty temp dir).
- R5 id stability. sha1(category|key)[:10] is deterministic, and the toolkit and loop keys are stable names. (The
  letter-keyed steven-steps id is reused if a later round re-letters a..k. That is noted under P06-F2's remedy, not a
  separate defect today.)
- R6 weight math. ×1.1 is capped at 2.0 and ×0.85 floored at 0.3 (recs.py:196-199). The test runs 28 decisions each way.
- R7 writes outside brain/recs and docs/reports. write() and learn() touch only OUT_JSON, OUT_MD, LEDGER and WEIGHTS
  under root, and `org` prints to stdout. org-chart.json equals `bin/brain org` apart from "generated" (39 seats).
- R8 privacy. BIG-MOVES.md, big-moves.json and org-chart.json contain no phone or e-mail patterns. wiki/clients holds
  only index.md, and no client name appears. Signals are written by the scheduled task, whose prompt says "first names
  only". The phone number in memory.md is on a line that already existed.
- R9 build.py stale-section guard: `start > len(lines)` → `continue`. When the index is older, the end is clamped by
  the slice, so it cannot crash. The 6D page tests pass.

## Coverage (inspected and clean)

brain/__main__.py recs/org argument parsing (learn without a file → rc 2); toolkit.py `_register`/mcps/apis/KINDS/format and
write_page; graph.py mcp/api lobes; build.py RECS injection via j() (script-safe escaping); template.html bm panel layout at
390 px (scrollWidth 390, no horizontal scroll); smoke-bm.js (approve → set recs/bm_ad2f80fbb8 approved, class approved,
state text) and smoke-bm2.js (declined doc from db → li.declined + "declined · 2026-10-22"; no db → disabled; XSS → text);
connect-all.sh 6g openflowkit_mcp plus its 5 tests; install-mac.sh archify tail; CLAUDE.md routing row; cross-functional.md
paragraph.

## Top missing tests (pass 19)

1. STEVEN-STEPS with two items on one line (c+d) → four items, d present (P05-F1).
2. Decline the steven-steps Lofty move → no Lofty candidate from api/connector/mcp for 30 days (P06-F2).
3. Real-file steven-steps scores are not all equal; a revenue unblocker outranks AnyDesk (P07-F3).
4. The same no-"at" decision file learned on two days → one ledger row (P04-F4).
5. A ledger line "5" and a declined row with at="Oct 23" → top() returns, and the item still shows (P04-F5).
6. Signals given as an object or a str, or with a str plan → no crash, plan wrapped (P08-F6).
7. smoke-bm2 spaceDecision → 10 items, no pageerror (P17-F7).
8. test_recs isolated from the live ledger and weights (P19-F8).
9. learn() approve then decline with distinct ISO "at" on one day → decisions_by_id returns declined, and top() hides it.
10. The 60% cap with n=1 and n=3 → the list length equals n and no executor exceeds max(1, int(0.6n)) when enough of the other executor exists.

## Share card

```text
VIBE//BREAKER

VERDICT: FIX BEFORE SHIP
PASSES: 13/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 10
UNVERIFIED: 2
FIRST BREAK: NONE
```

## Release note

This review showed: the deterministic gate passes on 46dedb8f6dbccb36, 123 unit tests and 84 connect-all tests pass, all
five earlier findings are fixed, and the 6D panel's db usage matches the contract and is XSS-safe. Proven defects: the
ranking is alphabetical among tied Steven items, one step is missing, declines do not hold across twin moves, and some
inputs crash the code. It did not show the live artifact's capability manifest, the 6:05 AM scheduled task running end
to end, or the Mac-side archify install.

change-set: bd4299d7b7e56598
## Orchestrator response (2026-10-23 17:45 UTC) — recs findings applied (reviewed 46dedb8f6dbccb36 → bd4299d7b7e56598)

MEDIUM Arive step missing — fixed: c and d split onto their own lines in STEVEN-STEPS; test asserts all 11 steps incl. Arive.
MEDIUM a decline does not hold — fixed: every move carries a topic (lofty, zoho, tidycal…); a declined/done move snoozes every move on that topic for 30 days; test.
MEDIUM Steven's items alphabetical — fixed: STEP_VALUE table scores each sign-in by what it unblocks (Lofty/Zoho/drips 5:1 … Pivo 1:2); test asserts Lofty outranks AnyDesk.
LOW timestamp-less decisions — fixed: the same decision on the same day counts once however it is fed; test.
LOW bad ledger data — fixed: non-object lines skipped; a bad date reads as today (hidden only today); test.
LOW signals shape — fixed: wrapped object / non-dict entries / string plan handled; test.
LOW bad decision value empties the panel — fixed: only approved/declined/later/done are honoured; smoke-bm2 harness.
LOW tests touching the real ledger — fixed: setUp redirects WEIGHTS/LEDGER to a temp dir.
LOW openflowkit marked Steven-only — fixed: "no key" stripped before the key-word match; `\bkey\b`.
LOW doc contradictions — fixed (VENDORED.md version, layers bullet wording).
Steven's decisions noted by the validator (ranking weights, topic-wide declines, the 60% cap) are defaults he can change by saying so; recorded here, not asked.
