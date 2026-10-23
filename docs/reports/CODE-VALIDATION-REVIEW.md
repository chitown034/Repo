# VibeBreaker Final Report: connect-all round 2 fix-up (second pass) + action-desk step D

change-set: 098ea402f7120e2e

(From `bash scripts/validate-code.sh` at 2026-10-23T14:40:11Z on the uncommitted tree, branch claude/stoic-cori-pvn3f8.
Gate line: `verdict: PASS (6 passed, 0 failed)`. `bash connect-all-tests.sh`: `connect-all tests: 73 passed, 0 failed`.)
The first-pass review of change-set d8614738c163c002 and the orchestrator's response are kept below, unchanged.

Late change: at 14:40:26-14:40:37 UTC, after the gate ran, two one-line doc edits landed - a new routing row in
`CLAUDE.md` (marketing: drip, text follow-up, AI search -> the two new playbooks) and a "Presence audit" bullet in
`wiki/ai-team/second-brain-layers.md`. `validate-code.sh --hash` now prints `3dfdbb4f5136318d`. Both lines were read
for this review: no credential, phone or e-mail; they point at files that exist. The files reviewed below are unchanged
since the gate run (mtimes 14:37-14:39). So this review covers change-set: 3dfdbb4f5136318d as well, provided nothing
else moves; rerun the gate before `--mark`. The `CLAUDE.md` row edits the L1 router, which Steven may want to see.

## Verdict

`SHIP` (VibeBreaker: `SURVIVED*` - no critical, high or medium finding; two LOW findings, one unverified item)

All five first-pass fixes hold on repro. The remaining confirmed issues are LOW: the token character check is a
denylist that lets `|`, `<`, `>`, `(`, `)` and tab through to a file that is later sourced by `sh`, and step D's
"done" styling follows only its last checkbox. P01-F1 is a two-line change worth making before Steven's first real run.

## Scope

- Commit / branch: uncommitted working tree on claude/stoic-cori-pvn3f8
- Mode: DIFF (second pass on connect-all; first pass on dashboard/action-desk.html and the docs)
- Stack: bash (macOS /bin/bash 3.2 target), POSIX sh subshell, curl 8.5.0; static HTML + inline JS
- Passes completed: 01, 04, 05, 11, 14, 17, 19, 20
- Inspected surfaces: `connect-all.sh` 40-46 (`step`), 145-153 (kapso_keys prompts), 362-424 (7b, 7c, 7d);
  `connect-all-tests.sh` 1-25, 176-202; `integrations/cli-anything-harnesses/connect.sh` (prompts and exits);
  `dashboard/action-desk.html` 252-282 (step D) and 612-640 (tick and copy script); new/changed docs listed in Coverage
- Excluded / unavailable context: macOS /bin/bash 3.2 (not in the sandbox; bash 5.2.21 and dash used); TidyCal's real
  token format and API (not reachable from the sandbox); a real terminal (`/dev/tty` cannot be opened in the sandbox)
- Material scope limitation: NO for the verdict; YES for the TidyCal token format (see UNVERIFIED)

## Scoreboard

- Passes executed: 8 / 20 (DIFF mode)
- Confirmed: 2
- Critical: 0
- High: 0
- Medium: 0
- Low: 2
- Info: 2 (notes, not defects)
- Unverified: 1
- Rejected candidates: 5
- First critical pass: NONE

## First-pass fixes - verification

| # | First-pass finding | Holds? | Evidence |
|---|---|---|---|
| 1 | Prompts swallowed by `$LOG` | YES | `connect-all.sh:148,151,365-366,393-394` write prompt and post-read newline to `/dev/tty`; `step` (line 44) redirects only stdout/stderr. Test `connect-all-tests.sh:192` would have failed on the old `printf` to stdout. |
| 2 | Refused token kept forever | YES | `connect-all.sh:403` removes `.env` on 401/403 regardless of `fresh`; `:405` removes only when `fresh=1`; `:404` keeps on 404 (message says so); 200 keeps. Tests at `connect-all-tests.sh:187-190`. Paths 404/5xx/000 checked by reading only (see note under Coverage). |
| 3 | Step 7d always "done" | YES | `cah_connect` (`connect-all.sh:415-421`) returns 1 naming missing wrappers, 0 only when all four `cli-anything-*` binaries are executable; `connect.sh`'s own exit code is ignored by design and it has no prompts (`grep read` finds none). Tests at `connect-all-tests.sh:199,201`. |
| 4 | Token on curl's argv | YES | Repro with a recording curl wrapper: argv was `-s -K - -o /dev/null -w %{http_code} <url>`, no token. Local HTTP server received `Authorization: Bearer abc.DEF-123_x` and `Accept: application/json`; `200`/`401` returned correctly; unreachable host gave `000`. `printf` is a shell builtin in dash and bash (no argv exposure); `TIDYCAL_TOKEN` is not exported, so curl's environment does not carry it. |
| 5 | Dead `CONNECT_ALL_YES` | n/a | Not in this diff; `CONNECT_ALL_YES` is still read at `connect-all.sh:35` and set at `:60` (it is live, not dead). |
| (a) | Character guard `*[\'\"\\\$\`\ \;\&]*` | YES, as written | Well-formed: ran under bash 5.2 and dash. Rejects space, `'`, `"`, `$`, backtick, `\`, `;`, `&`; accepts `abc.DEF-123_x` and `eyJhbGciOi.J9-x_Y`. Not run on bash 3.2 (unavailable); the pattern uses only POSIX bracket syntax with backslash-escaped members. But see P01-F1: it is a denylist. |
| (e) | New route for the token to `$LOG` / screen | NONE found | Read with `stty -echo` from `/dev/tty`; never echoed; `grep -q` is quiet; `sh -c ... 2>/dev/null` hides curl's stderr; guard message does not print the key; test `connect-all-tests.sh:183` asserts the value is absent from captured output. |

## CONFIRMED

```yaml
id: P01-F1
pass: 01
title: Token guard is a denylist; |, <, >, (, ) and tab pass and are then executed when the .env is sourced
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: connect-all.sh
    line: 396 (guard), 388 (`. "$1"` in tidycal_check)
entry_or_trigger: connect-all step 7c, Steven pastes a token containing | < > ( ) or a tab
evidence: >
  Ran the guard: 'a|b', 'a<b', 'a>b', 'a(b' and 'a<TAB>b' are ACCEPTED. The token is saved verbatim as
  TIDYCAL_TOKEN=<key> and tidycal_check sources it with sh. Repro: a file holding `TIDYCAL_TOKEN=abc|echo INJECTED`
  printed INJECTED and left TIDYCAL_TOKEN empty; `TIDYCAL_TOKEN=abc>FILE` created FILE in the current directory
  (the repo, for connect-all).
existing_controls_checked: the case guard (blocks quote, space, $, backtick, backslash, ;, &); hidden read; chmod 600
failure_scenario: >
  A token with `|` (or a paste with a stray `>`) is saved; sourcing runs the text after it as a command or creates a
  file, the bearer is sent empty, TidyCal answers 401, the .env is deleted and Steven is told to make a new token -
  which fails the same way if the format itself contains `|`.
impact: Steven only (self-typed input); stray file or command on his Mac; possible permanent "refused" loop
remediation_direction: >
  Allowlist instead of denylist, matching the message: case "$key" in *[!A-Za-z0-9._-]*) reject ;; esac - or stop
  sourcing the file and read the value with sed -n 's/^TIDYCAL_TOKEN=//p'.
verification: >
  Add tests that feed 'a|b', 'a>b' and 'a b' through the prompt path and assert "not saved" and no .env; keep
  'abc.DEF-123_x' accepted.
```

```yaml
id: P17-F1
pass: 17
title: Step D's "done" styling follows only its last checkbox (sD5)
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/action-desk.html
    line: 621 (paint), 256-282 (sD1-sD5 in one .step)
entry_or_trigger: Steven ticks boxes in step D
evidence: >
  paint() runs step.classList.toggle('done', b.checked) for every box in document order; with five boxes in the same
  .step, the last one (sD5) decides. Steps 0 and A already have two boxes each, so the pattern pre-exists; step D
  makes it visible.
existing_controls_checked: the counter (n of total) and the group badges count every box correctly; ids are unique
failure_scenario: >
  Tick only "The eleven done" (sD5): all of step D is greyed and struck through while Mac 1, Mac 2, Alienware and
  tablet are unticked. Tick sD1-sD4 but not sD5: D shows not done.
impact: Display only; a half-finished step can look finished
remediation_direction: mark a step done only when every tick box inside it is checked
verification: >
  In a browser test, tick sD5 alone and assert step D lacks .done; tick sD1-sD5 and assert it has .done.
```

## UNVERIFIED

- P01-U1 - TidyCal token format. The guard message asserts tokens are "letters, digits, . - _ only". If TidyCal issues
  `id|secret` style tokens (Laravel Sanctum format), P01-F1 becomes MEDIUM: every valid token is mangled by sourcing,
  refused with 401 and deleted. Needs: one real TidyCal token's character set (not its value), from Mac 1's first run or
  tidycal.com/developer/docs.

## REJECTED

- P04-C1 - token reaches `$LOG` via curl stderr - `sh -c ... 2>/dev/null` at `connect-all.sh:388`, and the config
  line is on curl's stdin only.
- P05-C1 - `stty -echo` acting on a pipe so the token echoes - stdin of every step is the terminal; no piped
  invocation of connect-all found; the `exec` at `:60` keeps stdin.
- P11-C1 - curl config `header = "..."` mis-parsed - repro against a local server delivered both headers exactly.
- P05-C2 - 7d prompts swallowed like finding 1 - `connect.sh` has no `read` or prompt.
- P04-C2 - phone number added in docs - the only number in the diff and new files is (202) 474-5223, the Kapso number
  already in HEAD (`.claude/skills/whatsapp-kapso/SKILL.md`, `REMOTE-ACCESS.md`).

## Coverage

- `dashboard/action-desk.html`: inline script extracted and passed `node --check`; one `<script>` block. All six
  `data-copy` values in step D equal their visible `<code>` text after HTML-unescaping. Ids sD1-sD5 are new and the
  page has no duplicate ids; tick state keys by id in `actionDesk.v7`, so the new boxes start unticked and are counted.
  No e-mail, phone number or secret pattern in step D. Outbound links are github.com/chitown034/Repo, tidycal.com,
  crm.zoho.com, claude.ai/install.ps1 (Windows installer paste).
- Docs skimmed for credentials and phone numbers: docs/STEVEN-STEPS.md, integrations/CONNECTIONS.md,
  integrations/anydesk/README.md, integrations/{arive,mbs-highway,pivo,ticor,tidycal}/README.md,
  wiki/real-estate-playbooks/{ai-search-visibility,drip-and-text-follow-up,index}.md, wiki/ai-team/toolkit.md,
  docs/reports/LAYERS.md. No key, token, client id, password, e-mail address or JWT. Only phone number: the Kapso one.
  NMLS 1921615 appears (public licence id, already in CLAUDE.md); DRE number left as `____`.
- kapso_keys and lofty_connect prompt redirects: clean.
- Note: a fake-tty run of tidycal_connect's 404/5xx/000 paths was blocked by the sandbox's removal guard (the function
  contains `rm -f "$env"`); those branches were verified by reading lines 400-406 only.

## Top missing tests (pass 19)

1. Token with `|`, `>` or a tab is refused before saving (P01-F1).
2. 404 with a fresh token: rc 1, `.env` kept, message names the endpoint.
3. 500 / `000` with a fresh token: `.env` removed; with an existing token: `.env` kept.
4. 403 removes `.env` the same as 401.
5. 7d actually invokes `connect.sh`: in the sandbox `</dev/tty` fails, so the stub never runs and the two 7d tests pass
   on the wrapper check alone; assert `stub-connect` reached the log (run with a fake tty or a stdin override).
6. Step D shows done only when sD1-sD5 are all ticked (P17-F1).
7. Copy-button text equals visible `<code>` text, page-wide (a quickcheck rule).

## Notes for the caller (not findings in this change-set)

- INFO: `scripts/validate-code.sh:57` accepts `--mark` if the hash appears anywhere in this file. The orchestrator's
  response heading already named `098ea402f7120e2e` before this review existed, so the gate would have accepted a mark
  without a validator review. Out of this diff; worth a separate fix (match only a leading `change-set: <hash>` line).
- INFO: on a first-run 5xx/`000` the token is discarded (`connect-all.sh:405`) but the message only says "check the
  network and rerun"; adding "the token was not kept, paste it again" would save a surprise.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED* (SHIP)
PASSES: 8/20 (DIFF)
CONFIRMED: 2 (0 critical, 0 high, 0 medium, 2 low)
FIRST-PASS FIXES: 5/5 hold
```

---

# Previous review (change-set d8614738c163c002) and orchestrator response

# VibeBreaker Final Report: connect-all 7c TidyCal + 7d CLI-Anything sites

change-set: d8614738c163c002

(From `bash scripts/validate-code.sh` at 2026-10-23T14:34:31Z on the uncommitted tree over HEAD 1024ed5, branch
claude/stoic-cori-pvn3f8. Files in the change-set: `connect-all.sh`, `connect-all-tests.sh`.)

Note: while this review ran, other files were added or changed in the tree (docs/STEVEN-STEPS.md,
integrations/CONNECTIONS.md, integrations/anydesk/README.md, integrations/tidycal/, integrations/arive/, integrations/mbs-highway/,
integrations/pivo/, integrations/ticor/, two new wiki/real-estate-playbooks pages). `validate-code.sh --hash` now prints
`056ef84213d6cd8a`. Those files were NOT reviewed here; the two scripts above are unchanged since the review.

## Verdict

`FIX FIRST` (VibeBreaker: `SURVIVED*` - no critical or high finding; three confirmed MEDIUM findings and unverified items remain)

Gate verdict line: `verdict: PASS (2 passed, 0 failed)` (bash -n on both files only; the gate does not run the test suite).
`bash connect-all-tests.sh` run separately: `connect-all tests: 67 passed, 0 failed`. The code is correct on the stubbed
paths, but on the real first run Steven never sees the token prompt (it goes into the log), and once a bad token is saved,
the "make a new token and rerun" advice can never work because the rerun does not ask again. Both sit on the only path
the feature exists for, and both fixes are small - hence FIX FIRST, not a severity upgrade.

## Scope

- Commit / branch: uncommitted working tree on claude/stoic-cori-pvn3f8, base 1024ed5
- Mode: DIFF
- Stack: bash (macOS /bin/bash 3.2 target), POSIX sh subshell, curl
- Passes completed: 01, 04, 05, 11, 14, 19, 20 (shell-script set)
- Inspected surfaces: `connect-all.sh` lines 30-45 (`say`, `step`), 357-415 (7, 7b, 7c, 7d, 8), 421-445 (report);
  `connect-all-tests.sh` 1-25, 176-188; `integrations/cli-anything-harnesses/connect.sh` (whole, the 7d callee);
  `MAC-SETUP.sh` (prompts/exit paths only); `scripts/second-mac.sh` (how connect-all is invoked)
- Excluded / unavailable context: TidyCal's official API docs (sandbox proxy returned 403 for tidycal.com,
  help.tidycal.com, pipedream.com; only web-search snippets were available); a real macOS terminal
- Material scope limitation: YES - the TidyCal endpoint, plan behaviour and token format could not be read from the vendor

## Scoreboard

- Passes executed: 7 / 20 (DIFF mode, shell set)
- Confirmed: 5
- Critical: 0
- High: 0
- Medium: 3
- Low: 1
- Info: 1
- Unverified: 3
- Rejected candidates: 7
- First critical pass: NONE

## CONFIRMED

```yaml
id: P01-F1
pass: 01
title: 7c token prompt is written into the log file, not the terminal - the step looks frozen
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: connect-all.sh
    line: 390-391 (prompt printf, read </dev/tty)
  - path: connect-all.sh
    line: 43 (step runs "$@" >>"$LOG" 2>&1)
entry_or_trigger: first run of connect-all.sh on a Mac with no ~/.config/tidycal/.env
evidence: tidycal_connect runs inside step, whose stdout and stderr go to $LOG. The prompt printf goes to stdout, so it
  lands in the log; read waits on /dev/tty. Reproduced with the same say/step shape in a scratch script - the terminal
  showed only "== 7c ==" and the prompt text appeared only in the log.
existing_controls_checked: none route the prompt to /dev/tty. Same root cause pre-exists in lofty_connect (365-366) and
  kapso_keys (148-149) - not part of this change-set, but the new step copies it.
failure_scenario: Steven pastes connect-all, sees "== 7c TidyCal ... ==" and a silent cursor. He waits (blocks forever),
  presses Enter (skip -> FAIL), or pastes blind (works, but nothing told him to).
impact: the one interactive thing step 7c asks for is invisible; "simple copy and paste" breaks at this step.
remediation_direction: send the prompt (and the trailing newline after read) to /dev/tty, e.g. printf ... >/dev/tty.
verification: a test that runs step "x" "" tidycal_connect with no .env and asserts the prompt text is NOT in $LOG
  (or a grep that the prompt printf line ends in >/dev/tty).
needs_context: null
```

```yaml
id: P04-F1
pass: 04
title: after a refused (401/403) token, "make a new token and rerun" cannot work - the rerun never asks again
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: connect-all.sh
    line: 389 (prompt only if .env lacks TIDYCAL_TOKEN=.+)
  - path: connect-all.sh
    line: 399 and 404 ("make a new token in TidyCal and rerun" / "rerun connect-all and paste it when asked")
entry_or_trigger: a token is saved and TidyCal answers 401/403 (mistyped, truncated, revoked or rotated token)
evidence: the bad token is written to ~/.config/tidycal/.env before the check (393). Next run, the guard at 389 sees a
  non-empty TIDYCAL_TOKEN= line and skips the prompt, goes straight to the same 401.
existing_controls_checked: nothing deletes, renames or re-prompts on 401/403; the report line 5b only covers "skipped".
failure_scenario: run 1 saves a bad token -> 401 "make a new token and rerun". Steven makes one, reruns -> no prompt,
  401 again, forever, until he finds and edits ~/.config/tidycal/.env by hand (never named in the message).
impact: the documented recovery path is a dead loop.
remediation_direction: on 401/403, either re-prompt (overwrite) or say the exact file to remove
  (rm ~/.config/tidycal/.env) in both the message and the step's needs-you note.
verification: test with .env holding a bad token and a curl stub returning 401: the output must name the file to
  remove, or a second call fed a new token on the prompt must rewrite .env.
needs_context: null
```

```yaml
id: P05-F1
pass: 05
title: 7d always reports "done", and its sign-in guidance only reaches the log; report line 5 points at it
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: connect-all.sh
    line: 409-411 (cah_connect under step)
  - path: connect-all.sh
    line: 439 ("Sign in ... where step 7d said so")
  - path: integrations/cli-anything-harnesses/connect.sh
    line: 31 (set -uo pipefail, no -e), 71 (MAC-SETUP failure not propagated), 203 (ends with say "Done.")
entry_or_trigger: any connect-all run where the harness install or posture check fails, and every run for the guidance
evidence: connect.sh has no non-zero exit on any failure path (only a missing /dev/tty can fail cah_connect), so step 7d
  always lands in "Done". Its section 4 list of sites needing sign-in goes to $LOG (step redirect), not the screen.
existing_controls_checked: report line 440 also prints "bash integrations/cli-anything-harnesses/connect.sh", which
  shows the same text on screen if run by hand - that is the limiting factor on severity.
failure_scenario: MAC-SETUP.sh fails partway -> the report says "7d ... done" and line 5 tells Steven to sign in "where
  step 7d said so", text he never saw.
impact: a false PASS in the final report and a pointer to invisible output.
remediation_direction: make cah_connect return non-zero when the harnesses are still missing or posture fails (e.g. check
  the console scripts after the run), and reword line 5 to "the log / rerun connect.sh shows which site", or tee 7d's
  section 4 to the terminal.
verification: stub connect.sh (or MAC-SETUP.sh) to fail, assert 7d lands in FAIL; assert report line 5 does not refer
  to text that only exists in $LOG.
needs_context: null
```

```yaml
id: P11-F1
pass: 11
title: TidyCal token is passed on curl's command line, readable by ps while the call runs
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: connect-all.sh
    line: 396 (-H "Authorization: Bearer $TIDYCAL_TOKEN")
entry_or_trigger: any other local account or process listing processes during the ~1 s request
evidence: the expanded header is an argv element of curl; macOS ps -ww shows other users' process arguments.
existing_controls_checked: the token never reaches $LOG or the terminal (curl -s, -o /dev/null, -w only http_code,
  2>/dev/null; test at connect-all-tests.sh:182 passes). The exposure is argv only.
failure_scenario: a second user or a background agent on the Mac running ps at that moment reads the bearer token.
impact: limited - single-user Mac, short window - but it is a credential in argv.
remediation_direction: hand curl the header on stdin, e.g. printf 'header = "Authorization: Bearer %s"\n' ... | curl -K - ...
  (printf is a builtin, so the value never appears in argv).
verification: a curl stub that records "$@" must not contain the token (today connect-all-tests.sh's curl.calls does).
needs_context: null
```

```yaml
id: P14-F1
pass: 14
title: CONNECT_ALL_YES=1 in cah_connect is read by nothing
status: CONFIRMED
severity: INFO
confidence: HIGH
location:
  - path: connect-all.sh
    line: 409
entry_or_trigger: step 7d
evidence: grep finds CONNECT_ALL_YES only in connect-all.sh and scripts/second-mac.sh; connect.sh and MAC-SETUP.sh never
  read it, and neither has a [y/N] prompt.
existing_controls_checked: n/a
failure_scenario: none today; it implies a consent bypass that does not exist.
impact: reader confusion only.
remediation_direction: drop it (Karpathy: surgical changes).
verification: n/a
needs_context: null
```

## UNVERIFIED

- **U1 - TidyCal endpoint, header and menu path.** Web search confirms the base `https://tidycal.com/api` and a personal
  token sent as `Authorization: Bearer`; a third-party CLI exposes "booking-types list", consistent with
  `/api/booking-types`. The official API reference could not be fetched (sandbox 403), so the exact path is not proven.
  The script's menu path "Settings -> Integrations -> API" differs from a third-party guide (Odoo connector) that says
  "Settings -> API & Webhooks". Needs: TidyCal's API docs page, or one real 200 from Steven's Mac.
- **U2 - free plan.** Search results say API access is not on TidyCal's Free plan. If his plan is Free and TidyCal answers
  403, line 399 tells him to make a new token, which will not help. Needs: Steven's plan, and the status TidyCal returns
  for a Free-plan token.
- **U3 - token format.** Sourcing `TIDYCAL_TOKEN=<value>` through `sh -c '. "$1"'` was tested in dash: a value with a
  space, `;`, `&` truncates (the rest runs as a command, its error swallowed by 2>/dev/null); `'` or `"` is a syntax error;
  `$VAR`, backticks and `\` are expanded/executed. A JWT/base64url token (letters, digits, `.`, `-`, `_`) is safe. Also,
  macOS canonical tty input caps a typed/pasted line at 1024 bytes (MAX_CANON), so a token longer than 1023 characters
  would be truncated by `read` and then 401. Needs: TidyCal's token character set and length.

## REJECTED

- P11-C1 token leak via `set -x` - no `set -x`/xtrace anywhere in connect-all.sh (grep) - connect-all.sh:16 is `set -u` only.
- P11-C2 token leak via curl `-w`/error text - `-w "%{http_code}"` only, `-s`, `-o /dev/null`, and `2>/dev/null` on the
  substitution; sh's own error lines (U3) are also swallowed there - connect-all.sh:396.
- P01-C1 bash 3.2 incompatibility - no mapfile, `declare -A`, `${x^^}`, `&>>`; `local`, `trap -`, `${code:-none}`, `case`
  are 3.2-safe - connect-all.sh:387-401, 409.
- P04-C1 return codes mis-feed PASS/FAIL - 200 -> 0, skip/401/403/other -> 1; step maps rc to PASS/FAIL + note; tests
  181 and 185 prove both - connect-all.sh:392-400, 43-44.
- P04-C2 echo left off after Ctrl-C - the INT/TERM trap runs `stty echo`; Ctrl-C then behaves as a skip (the main shell
  continues) rather than an abort, same as 7b - connect-all.sh:391. Not verified on a real macOS tty.
- P04-C3 stty acts on stdin while read uses /dev/tty - only matters when stdin is not the terminal; every documented
  invocation (`bash connect-all.sh`, scripts/second-mac.sh:78) keeps stdin on the tty.
- P05-C1 "Still yours" numbering - 5, 5b, 6, 6b follows the existing "6b" convention - connect-all.sh:439-444.

## Coverage

| Surface | Result |
|---|---|
| `tidycal_connect` write path: mkdir, umask 077 subshell, chmod 600, key cleared | clean |
| token never in $LOG/terminal on the 200 and 401 paths | clean (test 182; prompt path untested, see P01-F1) |
| `tidycal_connect` return codes -> step PASS/FAIL/NEEDS | clean |
| bash 3.2 constructs in the diff | clean |
| `cah_connect` `</dev/tty` under step (same as `mods_install`) | works; output to log (P05-F1) |
| `connect.sh` exit paths | always 0 (P05-F1) |
| report lines 5/5b numbering | clean |
| `connect-all-tests.sh` FUNCS extraction and 5 new tests | clean, 67/67 |

## Top 10 missing tests

1. No .env, prompt path: assert the prompt text does not land in $LOG (P01-F1).
2. Prompt path with a typed token on stdin (feed via a fake tty or a test hook): .env is created mode 600 with exactly
   `TIDYCAL_TOKEN=<value>` and the value is not in $T/out.
3. Bad token saved + 401: the message names `~/.config/tidycal/.env` or the rerun re-prompts (P04-F1).
4. 403 path: rc 1 and the "make a new token" message (only 401 is tested).
5. curl stub prints `000`/nothing (network down): rc 1 and "not reachable (HTTP 000|none)".
6. curl stub that records argv: the token must not appear in argv (P11-F1).
7. Enter at the prompt: rc 1, "skipped", no .env created.
8. 7d with connect.sh/MAC-SETUP stubbed to fail: lands in FAIL (P05-F1).
9. .env containing a token with a space or quote: either rejected at save time or sourced intact (U3).
10. Gate: `scripts/validate-code.sh` runs `connect-all-tests.sh` when connect-all*.sh is in the change-set (today it runs
    only `bash -n`).

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED* (repo verdict FIX FIRST)
PASSES: 7/20 (DIFF, shell set)
CRITICAL: 0
HIGH: 0
CONFIRMED: 5
UNVERIFIED: 3
FIRST BREAK: NONE
```

## Release note

Demonstrated: syntax, the 67 stubbed tests, the step wrapper's redirect of the 7c prompt (scratch reproduction), and
sourcing behaviour for special characters (dash). Not demonstrated: a real TidyCal call, the vendor's documented path,
plan behaviour or token format, and behaviour in a real macOS Terminal.

## Orchestrator response (2026-10-23 15:00 UTC) — connect-all round 2 fix-up (change-set 098ea402f7120e2e)

1. MEDIUM prompt swallowed by the log — fixed: the TidyCal, Lofty and Kapso prompts (and the newline after read) go to /dev/tty; test "prompt never lands in captured output".
2. MEDIUM refused token kept forever — fixed: 401/403 deletes the .env and says it was not kept; the next run asks again; a first-run network failure also discards it; 404 is reported as an endpoint question; tests.
3. MEDIUM step 7d always "done" — fixed: cah_connect checks the four wrapper binaries after connect.sh and fails naming the missing ones; report line 5 reworded; two tests.
4. LOW token on curl's command line — fixed: header passed on stdin with `curl -K -`; test asserts the token is absent from argv and present on stdin.
5. INFO dead CONNECT_ALL_YES — dropped.
Token characters: a token holding a quote, space or shell character is refused before saving (TidyCal tokens are letters, digits, . - _). Endpoint and plan: the README says the first real run on Mac 1 confirms /api/booking-types; the menu path now reads Integrations → Automations/Advanced → API → Manage API keys.
Also in this change-set (not reviewed by the first pass): dashboard/action-desk.html step D (static HTML + copy buttons, node --check passes), docs (STEVEN-STEPS round 2, CONNECTIONS, AnyDesk README, five integration READMEs, two playbooks), toolkit/index regeneration, the rebuilt 6D page.

change-set: b54bd02a675192b3
## Orchestrator response (2026-10-23 15:15 UTC) — second-pass LOW findings applied (reviewed code 098ea402f7120e2e / 3dfdbb4f5136318d → b54bd02a675192b3)

1. P01-F1 LOW denylist → allowlist `*[!A-Za-z0-9._-]*`; a first-run network failure now says the token was not kept; five bad-token tests (a|b, a>b, a b, a;b, a'b) and one good-token test, as the validator prescribed. 79/79.
2. P17-F1 LOW Action Desk `paint()` marks a step done only when every box in it is ticked (node --check ok).
3. Out-of-scope note taken: `--mark` now requires the hash on a review line (`change-set: <hash>` or a heading), not anywhere in prose; validate-gate tests 4/4.
