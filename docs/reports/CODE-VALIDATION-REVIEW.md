# VibeBreaker Final Report

change-set: b611f1467889a3e3

## Verdict

`SURVIVED*` (gate verdict: **FIX FIRST**)

No critical or high finding. Two MEDIUM findings break promises the change makes in writing. First, "numbers masked to their last four digits" fails when a contact's name is a phone number. Second, "`doctor --write` writes the document by hand" is false, because `--write` only prints. Four LOW findings and five UNVERIFIED items remain.

## Scope

- Commit / branch: working tree vs HEAD (uncommitted + untracked), change-set b611f1467889a3e3
- Mode: DIFF
- Stack: bash 3.2 (installer, go.sh), Python 3 stdlib (kapso-fetch.py, splice), deck JavaScript injected by the splice
- Passes completed: 01, 04, 05, 11, 14, 17, 19, 20
- Inspected surfaces: integrations/kapso/install-mac.sh, integrations/kapso/kapso-fetch.py, integrations/kapso/tests/test_kapso_fetch.py, dashboard/wave2/splice-kapso.py (HTML + injected JS), go.sh step 11 and its `step()` helper, scripts/setup-health.sh line added, integrations/mac-task-specs.md §5b, .claude/skills/whatsapp-kapso/SKILL.md, integrations/kapso/README.md
- Excluded / unavailable context: the live Command Deck HTML (not in the repo: `docRows`, `chatEsc`, `orStampText`, `safeRun`, the `data-copy` handler); the Kapso Platform API reference; the gokapso/agent-plugins plugin manifest at a6cbfe9; how Orca launches `claude`; the Mac runner's environment. Doc-only diffs (INDEX, brain index, reports, memory, wiki) were not reviewed as code.
- Material scope limitation: YES. The API response shape and the deck helpers were never observed live.

Deterministic checks: `verdict: PASS (10 passed, 0 failed)` for change-set b611f1467889a3e3.
Unit tests (`cd integrations/kapso/tests && python3 -m unittest -q`): `Ran 4 tests in 0.001s` / `OK`.
Crafted-response probes were run in memory only (`python3 -I -`). Nothing was written.

## Scoreboard

- Passes executed: 8 / 20 (DIFF mode)
- Confirmed: 6
- Critical: 0
- High: 0
- Medium: 2
- Low: 4
- Info: 0
- Unverified: 5
- Rejected candidates: 9
- First critical pass: NONE

## CONFIRMED

```yaml
id: P04-F1
pass: 04
title: Contact label passes a phone-number-shaped name through unmasked
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: integrations/kapso/kapso-fetch.py
    line: 56-60
entry_or_trigger: kapso-inbox-sync / doctor --summary|--write -> build() -> label(conv)
evidence: label() returns the first whitespace token of contact_name/profile_name/name and calls mask() only when that token is empty. In the probe, contact_name "+19515550199" gave contact "+19515550199", and profile_name "19515550123 Jane" gave "19515550123".
existing_controls_checked: mask() is applied only to the phone_number fallback. The test covers only "Steven Shearrill" and a missing name. The deck chatEsc escapes the value but does not mask it.
failure_scenario: A WhatsApp contact has no profile name, so Kapso or the sender's profile carries the number as the name. The full number goes into the whatsappKapso document (the shared deck DB), onto the card, and into the --summary/--json stdout.
impact: A client's phone number reaches the deck. This breaks the "masked numbers" promise in README, SKILL.md and the §5b spec, and it bears on the HALT rule about client PII. Phase 1 (Steven only) limits who is exposed today.
remediation_direction: Mask any label token that holds 4 or more digits, or that matches a phone pattern, before it leaves label().
verification: Unit test where contact_name is "+19515550199" and another where profile_name is "19515550123 Jane". Assert that neither digit run appears in json.dumps(doc) and that contact matches "…0199"/"…0123".
needs_context: null
```

```yaml
id: P17-F1
pass: 17
title: "--write" never writes; the deck, README and skill say "doctor --write" writes the document
status: CONFIRMED
severity: MEDIUM
confidence: HIGH
location:
  - path: integrations/kapso/kapso-fetch.py
    line: 12-13, 100-102
  - path: integrations/kapso/install-mac.sh
    line: 7-8, 49
  - path: dashboard/wave2/splice-kapso.py
    line: 37, 50
  - path: integrations/kapso/README.md
    line: 33-34
entry_or_trigger: Steven follows the card's own instruction, "run bash integrations/kapso/install-mac.sh doctor --write"
evidence: The --write branch prints the same JSON as --json and sends a note to stderr. No code path looks for or calls a bin/brain deck writer, even though the docstring claims it does. The §5b task that would write the document is marked "not installed".
existing_controls_checked: None. No caller consumes the --write stdout.
failure_scenario: The key is in the Keychain and Steven runs doctor --write. The terminal fills with JSON, but the whatsappKapso document never reaches the DB. The card stays "No whatsappKapso document yet", and OUTPUT_WATCH flags it as stale.
impact: The card's only documented manual path to life does nothing until a Mac task is registered.
remediation_direction: Either implement the write (the deck writer the docstring names) or change every "--write writes" claim to "prints the document for ArtifactData".
verification: After doctor --write on a configured Mac, ArtifactData get state/whatsappKapso returns a document with the new syncedAt. Alternatively, a grep shows no doc still claims that --write writes.
needs_context: null
```

```yaml
id: P05-F1
pass: 05
title: Malformed API responses crash the fetcher instead of producing the error document
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/kapso/kapso-fetch.py
    line: 47, 79-88
entry_or_trigger: build() with a response whose data list holds a non-dict, a body that breaks off mid-read, or a non-ASCII digit in unread_count
evidence: Probes gave AttributeError ("'str' object has no attribute 'get'") for data ["x"] or [None], http.client.IncompleteRead for a truncated body, and ValueError for unread_count "²" (str.isdigit() is True but int() fails). None of these sit in the except tuple at line 76, and the loops at 79-88 run outside the try.
existing_controls_checked: The except at 73-78 covers HTTPError, URLError, OSError, ValueError and RuntimeError, but only around the two get() calls.
failure_scenario: The process exits 1 with a traceback and prints nothing on stdout. The §5b prompt says "still write the document (the card must show the error)", but there is no document to write, so the card goes silently stale.
impact: Bad upstream data shows up as staleness, not as a red error badge.
remediation_direction: Wrap build's parse loop, skip non-dict rows, use an int-safe unread parse, and add http.client.HTTPException to the caught set.
verification: Tests feed data ["x"], [None], unread "²" and an opener whose read() raises IncompleteRead. Each must return a document whose status starts with "error" or that skips the bad row.
needs_context: null
```

```yaml
id: P17-F2
pass: 17
title: "connected" fails open and sandbox detection is a substring match over the whole record
status: CONFIRMED
severity: LOW
confidence: MEDIUM
location:
  - path: integrations/kapso/kapso-fetch.py
    line: 81, 83
entry_or_trigger: phone_numbers record shapes
evidence: In the probe, a record with neither "connected" nor "status" gave connected True, and connected "false" (a string) also gave True. A business number carrying "sandbox_eligible": false was classified kind "sandbox". The deck's `n.connected ?` repeats the truthy test.
existing_controls_checked: None. The test only sends status "connected" with sandbox True.
failure_scenario: Kapso returns a number without a status field, or with a string boolean. The card shows a green "connected" for a number that is not connected, or a business number shows as sandbox, which hides that Phase 2 is live.
impact: The card misreports state. Replies are unaffected, because the skill checks the phase through the plugin's status tool.
remediation_direction: Default to not connected, accept only explicit true/"connected"/"active", and decide sandbox from a named field.
verification: Tests: a record with no status gives connected False, "connected":"false" gives False, and a business record with a sandbox_* false field gives kind "business".
needs_context: Kapso phone_numbers schema (UNVERIFIED-1) to know which field is authoritative.
```

```yaml
id: P04-F2
pass: 04
title: An API key containing CR/LF is echoed into the status, stdout and deck document
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/kapso/kapso-fetch.py
    line: 31-33, 45, 77
entry_or_trigger: KAPSO_API_KEY set with an embedded or trailing CR, e.g. export KAPSO_API_KEY="$(pbpaste)" from a CRLF clipboard. Command substitution strips only trailing \n.
evidence: The probe gave status "error — Invalid header value b'secretKEY123\r'". http.client's ValueError quotes the header value, and line 77 copies str(e) into the status, which --json/--summary print and the task writes to the deck.
existing_controls_checked: The Keychain path strips the value (line 37), so the production path is not affected. The env path is not stripped.
failure_scenario: Someone tests by hand with the env var and a pasted key. The key appears in the terminal and, if written, in the shared deck DB.
impact: Credential disclosure, limited to the env-var path.
remediation_direction: Strip and validate the env key, and never put str(e) from the request into the status (map it to a fixed message).
verification: Test that build("abc\r") returns a status not containing "abc".
needs_context: null
```

```yaml
id: P05-F2
pass: 05
title: install --apply reports success when every claude command fails
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: integrations/kapso/install-mac.sh
    line: 18, 29-33, 41
  - path: go.sh
    line: 33-34, 46
entry_or_trigger: go.sh step 11 with no network, or with the marketplace/plugin name rejected
evidence: do_ runs "$@" and its status is never checked, and there is no set -e, so the script falls through to exit 0. go.sh step() counts exit 0 as "done" and adds the "Kapso: run claude, /mcp ..." note to NEEDS only on failure.
existing_controls_checked: doctor would show "not installed" afterwards, but only if someone runs it.
failure_scenario: `claude plugin install kapso@kapso` fails. go.sh prints "done" for step 11, and the report lists it under Done with no Needs-you line.
impact: Steven is told WhatsApp is installed when it is not.
remediation_direction: Have do_ record failures and exit non-zero at the end in APPLY mode, or re-check has_plugin/has_mcp after applying.
verification: Run install --apply with a stub `claude` on PATH that exits 1. Assert a non-zero exit and that go.sh lists step 11 under "did not finish".
needs_context: null
```

## UNVERIFIED

- **U1 — Kapso API contract.** The paths `/platform/v1/whatsapp/phone_numbers` and `/whatsapp/conversations?status=active&limit=25`, the `X-API-Key` header, the field names, and whether `data` is a list. To decide it, I need the Kapso Platform API reference (or the plugin's reference docs at gokapso/agent-plugins a6cbfe9). The probe showed that a dict-shaped `data` (for example `{"items":[...]}`) silently gives "no number connected yet".
- **U2 — Duplicate MCP server.** The README says the plugin ships "an MCP config pointing at the hosted server", and the installer also runs `claude mcp add --scope user kapso`. That may produce two kapso servers and two sign-ins, and `has_mcp` may or may not see the plugin's server. The marketplace name `kapso` in `kapso@kapso` is also unchecked. To decide it, I need the plugin's `.claude-plugin/marketplace.json`, `plugin.json` and `.mcp.json`.
- **U3 — Scope for Orca sessions.** `--scope user` is the right choice for `claude --agent <seat>` started in arbitrary Orca worktrees: local scope is per project path, and project scope needs a `.mcp.json` and approval. This holds only if Orca runs `claude` as the same macOS user with the same HOME and no `CLAUDE_CONFIG_DIR` override. Orca's launch configuration is not in the repo.
- **U4 — Deck helpers.** `docRows`, `chatEsc`, `orStampText`, `lsGet` (does it unwrap `{v:…}`?), and the `safeRun(label, fn)` argument order live in the deck HTML, which is not in the repo. The isa-portal copies differ: its `safeRun` is `(fn, label)`. The splice anchors on the deck's own `safeRun("renderAgentInbox", renderAgentInbox)`, which suggests label-first, but that is not proven.
- **U5 — Keychain lookup under the runner.** `security find-generic-password -a "$USER"` runs with `os.environ.get("USER","")`. If the Mac task runner's environment has no USER, the lookup uses an empty account. The runner's environment is not in the repo.

## REJECTED

- P01 HTML injection via contact_name/label/kind/lastDirection — every interpolated field goes through chatEsc(String(...)), badges use textContent, and classes are constants — splice-kapso.py:47, 59, 63
- P01 `status` as an object/array — the `typeof d.status !== "string"` guard takes the not-configured branch and nothing throws — splice-kapso.py:48
- P01 `numbers`/`conversations` not arrays — both go through docRows, the deck's existing document-boundary helper (docs/findings/findings-R5.json:258); kapso-fetch.py:79/84 also guard with isinstance
- P04 message body leak — only whitelisted fields are copied, json.dumps(n) feeds only a substring test, and the test asserts "SECRET BODY" is absent — kapso-fetch.py:79-88, test_kapso_fetch.py:41
- P04 installer stores a key — it only prints the `security add-generic-password ... -w` command for Steven; doctor checks that the item exists without -w — install-mac.sh:40, 47
- P04 key or number on stdout in normal paths — the key is never printed (the only exception is P04-F2), --summary prints masked numbers only; P04-F1 is the exception for labels — kapso-fetch.py:104-107
- P11 timeouts — urlopen gets timeout=20, and socket timeouts are OSError (TimeoutError), which line 76 catches; the subprocess gets timeout=10 — kapso-fetch.py:36, 46
- P11 oversized response — the read is unbounded, but the source is Kapso over TLS with the https-only guard, and there is no adversarial trigger inside the trust boundary — kapso-fetch.py:43, 47
- P14 KAPSO_API_BASE_URL redirection — https-only is enforced, and the variable is set by the operator — kapso-fetch.py:26, 43

## Coverage

Clean on inspection:
- Splice atomicity: all substitutions happen in memory; the file is written only after every anchor matches once and the marker is placed (splice-kapso.py:14-18, 73-75). A re-run aborts on the marker.
- Regex replacement escaping: backslashes are doubled before re.sub (lines 41, 68), and the `\"` in the JS comes out intact.
- Freshness watch row: hrs 1 against a 10-minute cron.
- go.sh step 11 is consistent with the steps around it. setup-health.sh adds the kapso tests.
- shellcheck and bash -n pass on install-mac.sh and go.sh. py_compile passes on all three Python files.
- The installer's preview mode changes nothing (do_ prints WOULD). The installer never signs in or sends.
- The https-only guard is tested (test_insecure_host_refused). HTTPError gives a status, not a raise (tested).

## Top 10 missing tests

1. contact_name "+19515550199" → no 7+ digit run in json.dumps(doc), contact "…0199" (P04-F1).
2. profile_name "19515550123 Jane" → contact masked (P04-F1).
3. data ["x"] / [None] for both endpoints → build returns a doc and does not raise (P05-F1).
4. opener whose read() raises http.client.IncompleteRead → status starts with "error" (P05-F1).
5. unread_count "²", -1, True, "3" → no raise, unread 0/0/0/3 (P05-F1).
6. phone record with no status/connected → connected False, and `"connected":"false"` → False (P17-F2).
7. business record with a `sandbox_eligible:false` field → kind "business" (P17-F2).
8. build("abc\r") → "abc" not in the status (P04-F2).
9. install-mac.sh install --apply with a failing stub `claude` → exit ≠ 0 (P05-F2).
10. Run the splice on a fixture deck: anchors match once, a second run aborts, and renderKapsoCard in a JS harness (dashboard/tests/runtime-harness.js) renders `<img onerror>` in contact as text with status {} → gray badge.

## Share card

```text
VIBE//BREAKER

VERDICT: SURVIVED*
PASSES: 8/20
CRITICAL: 0
HIGH: 0
CONFIRMED: 6
UNVERIFIED: 5
FIRST BREAK: NONE
```

## Release note

This audit shows the following. The deterministic checks pass. The four unit tests pass. The deck renderer escapes every field. No key or message body leaves the fetcher on its normal paths. It does not show that the Kapso API returns the shape the fetcher expects, that the plugin and the user-scope registration do not collide, or that the deck helpers behave as assumed. None of these were observable from this container.

---

# VibeBreaker Review — 2026-10-13, round 3 (Kapso)

change-set: d607a195a0045b27

## Verdict

**FIX FIRST** — 0 critical, 0 high, 2 medium, 3 low. Both fences hold. Every round-2 fix was confirmed with a concrete input. Two medium defects remain in the unattended reply path (§5c). Neither can reach anyone but Steven.

Deterministic checks: `verdict: PASS (14 passed, 0 failed)` for change-set d607a195a0045b27.
Unit tests (`python3 -m unittest discover -s integrations/kapso/tests -v`): `Ran 14 tests` / `OK`.
Probes were run in memory with fake openers. Nothing was sent and no source file was edited.

## Round-2 fixes — re-probed

| Item | Probe | Result |
|---|---|---|
| M1 number-as-name | label() on "951-555-1234", "(951) 555-1234" (no phone_number), "+1 951 555 1234", "Steven 9515551234", Arabic-Indic digits | all masked to "…1234" — FIXED |
| L4 status/kind | {"display_name":"Sandbox Realty","status":"connected"} → kind business; {"type":"sandbox","status":"pending"} → not connected; status from connected rows only | FIXED |
| N1 phone-number-id | send(..., "") with a connected sandbox row → POST to /pn-sandbox/; no numbers → "error — no sending number"; §5c allow-list now names --phone-number-id | FIXED (but see P01-F1) |
| N2 empty --since | inbound("", now=05:00) drops a 01:00 message | FIXED |
| N3 body-less text | text {"body":null}, text null with body null → skipped, no "None" | FIXED |
| N4 doctor --json | `install-mac.sh doctor --json` piped to json.load → parses | FIXED |
| Hardening | "../evil" id refused; META_GRAPH_VERSION checked | PARTIAL (see P04-F1) |
| NEEDS-CONTEXT outbound/epoch | direction:"outbound" and from_me rows skipped; 10-digit epoch converted | FIXED for seconds (see P05-F1) |

## Fences — re-probed

- Send fence: "+1 (415) 555-0123", "1951555019" (one digit short) and "119515550199" (one digit long) were each refused before any network call. The payload `to` is always the allow-listed number, never the argument. HOLDS.
- Read fence: a different sender with a future timestamp is counted in `ignored` and its text is never returned. A missing `from` falls back to `phone_number`, which matches only on Steven's digits. HOLDS.

## CONFIRMED

### P01-F1 — MEDIUM — the unattended reply has no recipient to send to
- Location: integrations/kapso/kapso-fetch.py:180-181 (inbound output fields); integrations/mac-task-specs.md:491 (§5c prompt `--to <the message's sender digits>`)
- Trigger: any inbound message from Steven, handled by vanessa-whatsapp-inbox.
- Bad state: each message in inbound() output carries only `id`, `at`, `text` and `phone_number_id`. It has no sender. The task's tools cannot read Keychain `kapso-allow`, so it cannot build `--to`. Every unattended reply is either refused, or sent to digits the model guessed. The fence holds, so this fails closed, but round-2 N1 ("unattended sends always fail") remains true by a different route.
- Fix proof: either (a) kapso-send.py defaults `--to` to the allow-listed number when it is omitted, or (b) inbound() returns the sender digits, which are Steven's own and the only ones it ever returns. Add a test that builds the §5c command from inbound() output and gets status "sent".

### P04-F2 — MEDIUM — the reply text is put in shell double quotes, so `$` amounts are corrupted
- Location: integrations/mac-task-specs.md:491 (`--text "<reply>"`); .claude/skills/whatsapp-kapso/SKILL.md:44 (same pattern)
- Trigger: a Vanessa reply that contains "$450,000" or a backtick.
- Bad state: `bash -c 'echo "The price is $450,000"'` prints "The price is 50,000". Bash expands `$4` to an empty string, and backticks or `$(...)` would run a command inside the allow-listed Bash call. Steven gets wrong dollar figures in a mortgage/real-estate context.
- Fix proof: pass the text on stdin or in a file (`--text-file -`), or require single quotes with `'` escaped as `'\''`. Add a test that main() receives "$450,000" byte-for-byte.

### P05-F1 — LOW — a millisecond-epoch timestamp crashes --inbound
- Location: integrations/kapso/kapso-fetch.py:143-144 (iso), called at :168 outside any try
- Trigger: a message whose timestamp is "1791882000000" (13 digits).
- Bad state: `ValueError: year 58752 is out of range`. The script prints a traceback and no JSON, which breaks the module's own "a document is always produced" contract (line 15). The §5c task cannot write an error status.
- Fix proof: guard the conversion (ms → /1000, and catch ValueError/OverflowError/OSError, then skip). Add a test for a 13-digit timestamp and for "99999999999999999999".

### P04-F1 — LOW (hardening) — SAFE_ID accepts "." and ".."
- Location: integrations/kapso/kapso-fetch.py:33; used at integrations/kapso/kapso-send.py:61-64
- Trigger: a phone_number_id of ".." (from message data or KAPSO_PHONE_NUMBER_ID), or META_GRAPH_VERSION="..".
- Bad state: the request URL becomes `https://api.kapso.ai/meta/whatsapp/v24.0/../messages` (observed). The recipient is still the allow-listed number, so this does not break the fence.
- Fix proof: require at least one alphanumeric and reject dot-only ids (for example `^(?!\.+$)[A-Za-z0-9._-]{1,64}$`). Test ".." → "refusing an unsafe".

### P17-F1 — LOW — the skill and the spec disagree on the --since cursor
- Location: .claude/skills/whatsapp-kapso/SKILL.md:41 (`--since <last syncedAt>`) vs integrations/mac-task-specs.md:489/491 (`lastSeenAt`)
- Trigger: Steven sends at 10:03, kapso-inbox-sync writes syncedAt 10:04, and a session following the skill polls with since=10:04.
- Bad state: the 10:03 message is never returned or answered.
- Fix proof: change the skill to `whatsappInboxState.v.lastSeenAt`, so one cursor is used everywhere.

## UNVERIFIED (NEEDS-CONTEXT)

- Timestamps with a timezone offset ("2026-10-13T02:00:00-07:00") or as float epochs are truncated or compared as strings and silently dropped (probed). Whether Kapso ever sends these depends on the Kapso Platform API reference, which is not in the repo.
- Whether the Claude Code Bash allow-list on the Mac runner blocks `$(...)` inside an allow-listed command. This decides whether P04-F2 can also execute commands, or only corrupts text.
- `limit=50` with no paging: a burst of more than 50 inbound messages from all senders in one poll window could push Steven's message out of the page.

## REJECTED (pass 20)

- The label "951-555 Bob" → "951-555" leaks 6 digits. The conversation row shows no other part of the number, so the number cannot be rebuilt. Not a defect.
- `[ "$KAPSO" = 1 ] && run ...` in validate-code.sh: the script runs with `set -u` only, not `-e`, so a false test does not abort it.
- Arabic-Indic digits in the name are counted by str.isdigit and masked.

## Coverage (clean on inspection)

- scripts/validate-code.sh: the KAPSO flag triggers on integrations/kapso/*.py, including tests/ (the case `*` matches `/`), and an OK/FAILED grep reads the unittest result. scripts/setup-health.sh: the kapso test line. go.sh: step 11.
- install-mac.sh: `doctor --json` execs the fetcher only (clean JSON), preview prints WOULD, and the exit code is propagated.
- kapso-fetch.py build(): every error path returns a document, the key is scrubbed, https is enforced, and unread counts are safe_int.
- kapso-send.py: key, allow-list, recipient, empty text and https are all checked before the network call. The payload `to` is the allow-listed number.
- splice-kapso.py: unchanged from round 2, and its clean findings stand.

## Top missing tests (pass 19)

1. A §5c round-trip: inbound() output → send() command → "sent" (P01-F1).
2. "$450,000" and a backtick text arrive byte-for-byte through main() (P04-F2).
3. 13-digit and overflow timestamps → no raise, message skipped or converted (P05-F1).
4. phone_number_id ".." and "." → refused (P04-F1).
5. An offset-timezone timestamp compared correctly against a UTC since (needs the API reference first).

# VibeBreaker Review — 2026-10-13, round 4 (Kapso, narrow)

change-set: 45ad899d39584e14

## Verdict

SHIP (PASS). `bash scripts/validate-code.sh` → `verdict: PASS (14 passed, 0 failed)`, kapso unit tests included.
All five round-3 findings (d607a195a0045b27) are closed. One new LOW finding, recommended but not blocking.
Scope: the five round-3 fixes plus one re-probe of the send fence. Passes run: 01, 04, 05, 17, 19, 20.

## Round-3 findings — re-checked

- P01-F1 (MEDIUM) CLOSED. integrations/kapso/kapso-send.py:66 sets the payload `to` to `allow` on every path. `--to` is optional, and a mismatched `--to` is refused before the network call (:55-56). inbound() now emits `phone_number_id` (integrations/kapso/kapso-fetch.py:184-185), and the §5c command consumes it.
- P04-F2 (MEDIUM) CLOSED. `--text -` reads stdin (kapso-send.py:84-85). integrations/mac-task-specs.md:484/491 and .claude/skills/whatsapp-kapso/SKILL.md:44-45 use a single-quoted heredoc, so `$450,000`, backticks and `$(...)` arrive as literal text (probed). One residual edge remains: see P04-F3.
- P05-F1 (LOW) CLOSED. integrations/kapso/kapso-fetch.py:140-149: "1700000000000" → 2023-11-14T22:13:20, and a 20-digit value → "" (no raise). The message is then skipped at :173.
- P04-F1 (LOW) CLOSED. integrations/kapso/kapso-fetch.py:33: ".", ".." and "-" are refused; "a.b" is accepted.
- P17-F1 (LOW) CLOSED. The skill (SKILL.md:41) and the spec (mac-task-specs.md:485-491) both use `whatsappInboxState.v.lastSeenAt`.

## Send-fence re-probe

Can any argv or stdin make the POST body's "to" differ from the allow-list? No. The body is built at kapso-send.py:66 from `allow` only. `allow` = digits(KAPSO_ALLOW_FROM or Keychain "kapso-allow") (kapso-fetch.py:49-50), which neither argv nor stdin reaches.
Probes run through send() with a capturing opener:
- `to` = "" → body to = allow, sent
- `to` = "+1 (555) 123-4567" (same digits) → body to = allow, sent
- `to` = "5551234567x" → refused, no request made
main() pairs argv positionally (`dict(zip(argv[1::2], argv[2::2]))`), so a misaligned argv can only change the text or the id, never the recipient.

## CONFIRMED

### P04-F3 — LOW — a reply line equal to the heredoc delimiter ends the heredoc early, and the lines after it run as shell
- Location: integrations/mac-task-specs.md:484 and :491, and .claude/skills/whatsapp-kapso/SKILL.md:44-45 (the fixed delimiter `<<'REPLY'`)
- Trigger: the generated reply contains a line that is exactly `REPLY`. For example, Steven's message asks Vanessa to quote text containing that line.
- Bad state: the heredoc stops at that line. kapso-send.py sends only the text before it, and bash runs each later line of the reply as a command. Probed: `cat <<'REPLY'` / `x` / `REPLY` / `echo SHELL-RAN-THIS` / `REPLY` printed SHELL-RAN-THIS. The sender is allow-listed to Steven only, and the generated text would need that exact line, so the likelihood is low.
- Fix proof: in §5c and the skill, add "if the reply contains a line equal to the delimiter, reword it or use a delimiter not present in the text (for example `REPLY_<message id>`)". Alternatively, write the reply to a scratch file and pass it on stdin with `< file`. A spec-level check: grep that the delimiter rule is stated in both places.

## UNVERIFIED (NEEDS-CONTEXT)

- Whether the Mac runner's Bash allow-list ("exactly python3 … kapso-send.py --text - …") evaluates the trailing lines of a heredoc command separately and denies them. If it does, P04-F3 reduces to a truncated reply. This is runtime behaviour on the Mac and is not in the repo.
- Carried over from round 3: offset-timezone and float timestamps, and `limit=50` with no paging. Both need the Kapso API reference.

## REJECTED (pass 20)

- SAFE_ID `$` accepts a trailing newline ("123\n"). urllib raises InvalidURL, which is a ValueError, and kapso-send.py:74 catches it as a clean error. There is no bad state.
- Duplicate `--to` flags: the last one wins at argv parse, but the body never uses `to`, so this is not a fence break.

## Coverage (clean on inspection)

- kapso-send.py full file. kapso-fetch.py SAFE_ID, iso(), allow_from(), digits(), inbound() and main().
- mac-task-specs.md §5c command and cursor lines. SKILL.md recall and send lines.
- validate-code.sh output (14/14) and the new stdin test (tests/test_kapso_fetch.py:167-174).

## Top missing tests (pass 19)

1. A spec or skill check that the heredoc delimiter rule is stated (P04-F3).
2. inbound() → main() round-trip: the message's phone_number_id is passed to kapso-send and the body to = allow (only send() is unit-covered with a mocked id today).

# Addendum — 2026-10-13, round 4 delta (docs only)

change-set: 5219ca0048b7e17c · verdict: PASS (carried from round 4, change-set 45ad899d39584e14)

The only difference from 45ad899d39584e14 is the fix the round-4 validator asked for on its LOW P04-F3: two
sentences in `integrations/mac-task-specs.md` §5c and `.claude/skills/whatsapp-kapso/SKILL.md` naming a
per-message heredoc delimiter (`REPLY_<message id>`) and the rule that a reply may never contain that line. No
code or test changed; `bash scripts/validate-code.sh` PASS (14 checks, 16 Kapso tests). Written by the session,
not the validator, because the delta is prose.
