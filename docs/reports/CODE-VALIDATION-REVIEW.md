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

# VibeBreaker Review — 2026-10-13, round 5 (presence text-paced talk)

change-set: acb685d0a4a595cc

## Verdict

`SURVIVED*` (gate verdict: **FIX FIRST**). There are no critical or high findings. One MEDIUM is confirmed, and it is in the behaviour Steven asked for. While a long reply's text talk is still running, the presence overrides "Thinking…" for the next question and then drops it to "Standing by" while that question is still in flight.

## Scope

- Change-set: acb685d0a4a595cc (`dashboard/wave2/splice-presence-texttalk.py`, new). `git status` also shows `docs/reports/CODE-VALIDATION.md`, which validate-code.sh generates.
- Deterministic checks: `verdict: PASS (1 passed, 0 failed)` (py_compile only; no test exists for the splice).
- Mode: DIFF. Passes run on the Python splice: 01, 04, 05, 19. Passes run on the inserted dashboard JS: 01, 04, 05, 17, 19. Pass 20 ran last.
- Inspected in place in `/tmp/claude-0/deck-r7.html` (the applied copy, published as v195): the inserted block at 27124-27150, the hooks at 27070, 27394, 27481 and 27379, and the code it interacts with. That code is playRealClipEntry (26782), stopTalkingLoop/TALK_LOOP (26815), deliveryAnimStart/End (26836-26895), playFlaggedThen/playOpenerThen (26972), playTalkingLoop (26987), createPresence (27089), the chatSetThinking wrapper (27367), the steveSetSpeaking wrapper (27380), voiceReplyRequest, voiceStop (27479) and playVoiceReply, plus the Vanessa send path (25818-25918) and the specialist factory send path (26454-26510).
- Evidence method: static trace, plus an in-memory node replay of the inserted block, extracted verbatim from the deck, against a stub presence (no files written). No browser run.
- Material scope limitation: NO. The deck file is outside the change-set hash. Only the splice is hashed.

## CONFIRMED

### P05-F1 — MEDIUM — the text-talk interval overrides "thinking" for the next question, then its end timer sets "idle" while that request is still in flight
- Location: dashboard/wave2/splice-presence-texttalk.py:45 (interval: `if (p.get() !== "speaking" && !presenceAudioLive(who)) p.set("speaking")`) and :46-52 (end timer `if (p.get() === "speaking") p.set("idle")`). These are deck-r7.html:27141-27148.
- Trigger: Vanessa or Steve gives a reply longer than about 62 words. The talking loop is capped at 25 s (400 ms/word) and the text talk at 45 s (380 ms/word), so stopTalkingLoop clears TALK_LOOP while the text talk is still running. Steven sends a follow-up inside that window. A bank-clip reply (playRealClipFor) has no TALK_LOOP at all, so the window there is the whole text-talk duration after the clip ends.
- Bad state: chatSetThinking(on) sets "thinking" (deck 25818 → wrapper 27367). Within 230 ms the interval sets it back to "speaking" and the face nods. When the old timer ends, the state goes to "idle"/"Standing by" while the request is still pending. Then chatSetThinking(off) does nothing because the state is no longer "thinking". Replayed with the extracted block: t=300 ms state=thinking → t=600 ms state=speaking → after the timer ends, state=idle with the request still in flight.
- Fix proof: the interval re-asserts only from a state this talk owns, never from "thinking"/"listening". Alternatively, the send path (chatSetThinking on) calls presenceTextTalkStop(who). Test: start a text talk, set "thinking", then assert the state is still "thinking" after 600 ms and after the talk's end time.

### P05-F2 — LOW — after an audio handler ends the turn, the interval puts the label back to "Speaking" but not the banner or Steve's avatar ring
- Location: splice :45 (deck 27141), interacting with playRealClipEntry `done` (deck 26788-26797) and stopTalkingLoop (deck 26816-26828).
- Trigger: a bank-clip reply whose clip is shorter than the text talk, or a reply over about 62 words whose talking loop hits the 25 s cap.
- Bad state: the handler sets "idle", removes the banner and calls steveSetSpeaking(false). Within 230 ms the interval sets "speaking" again with no banner and no `speaking` class on steveAvatarWrap. The indicators disagree, and the state flaps idle→speaking, until the text-talk end restores consistency. The end timer then cleans up all three, so nothing stays stuck.
- Fix proof: let the interval re-raise through the same path as the start (banner + steveSetSpeaking). Alternatively, end the text talk when an audio handler ends the turn. Test: in a headless run, end the clip and assert that `data-state`, `#vanessaSpeaking.on` and `#steveAvatarWrap.speaking` agree at every 230 ms sample.

### P01-F1 — INFO — `sub1` cannot detect a duplicated anchor
- Location: splice :19-23. `re.subn(..., count=1)` returns at most 1, so `n != 1` only catches a missing anchor and never a duplicate one.
- Evidence: all five anchors occur exactly once in deck-r7.html today (grep -c = 1 each). Nothing is mis-spliced now. A future second copy of an anchor would patch the first copy silently.
- Fix proof: count with `len(re.findall(pat, t))` before substituting, and abort when the count is not 1.

### P17-F1 — INFO — `window.cdSpeak` ships to production and drives the real voice queue
- Location: splice :69-70 (deck 27379).
- Evidence: cdSpeak calls vanessaSpeak/steveSpeak → voiceReplyRequest → `lsSet("voiceReplyQueue")` → syncKeyToDb (deck 7856-7858). In the published deck, any caller of the hook (texttalk-test.mjs pointed at the live page, or a console) therefore queues a real voice-reply-render job on the Mac. Only same-origin script can reach it, and that script already has the same power, so there is no privilege gain. The deck already exposes window.cdVoiceOnDoc and similar hooks.
- Decision for Steven: keep the hook, or gate it behind a test flag. Run the Playwright check only against a local copy.

## UNVERIFIED

- None.

## REJECTED (pass 20)

- Timer leak on a second reply: presenceTextTalk calls presenceTextTalkStop before it arms new timers (splice :38), and only one entry exists per `who`. Clean.
- voiceStop ordering: presenceTextTalkStop runs before the idle reset (deck 27481). Placing it after `if (!id) return` is correct because the only re-raise risk is a live VOICE_PLAYING. Clean.
- "Stuck in speaking on an empty reply" (stop old talk, then `words==0` return): this already happens without the change. With empty text, playOpenerThen → playFlaggedThen sets "speaking" and hands off to playTalkingLoop(""), which returns false, so nothing resets the state (deck 26972-26987). The splice adds nothing to that path. It is out of scope for this change-set, and a separate fix is worth considering.
- Regex escaping: `js.replace("\\","\\\\")` protects `/\s+/` in the replacement, and the applied deck shows `/\s+/` intact (27135). Clean.
- Idempotence: MARK is checked first (:15). The assert at :73 fails before the write at :74 if the KAPSO anchor is missing, so a partial write is impossible. Clean.

## Coverage

The splice script was read in full. In the inserted JS: presenceTextTalkStop, presenceAudioLive (typeof guards for the TDZ-free `var` globals) and presenceTextTalk (word count, clamp, banner and Steve ring). Also covered: both speak hooks wrapped in try/catch with speakRecord, the voiceStop hook, and the interactions with the bank clip, opener/ack/closer, talking loop, delivery animation, full voice-reply playback and the chatSetThinking wrapper.

## Top missing tests (pass 19)

1. Follow-up during a text talk: set "thinking" mid-talk, then assert it survives the interval and the end timer (P05-F1).
2. Indicator agreement after a bank clip ends early: `data-state`, banner and Steve's ring agree (P05-F2).
3. A second reply 1 s into the first: exactly one interval stays alive (count TEXT_TALK entries and nods per second).
4. voiceStop during a text talk with VOICE_PLAYING set ends in "idle", and "speaking" is never re-raised afterwards.
5. A splice unit test: run on a fixture with each anchor duplicated, missing and already-marked, and assert an abort with no file write.

# VibeBreaker Re-validation — 2026-10-13, round 6 (presence text-paced talk, after round-5 fixes)

change-set: 5610f4b4e5b4500b

## Verdict

**PASS** (`SURVIVED`). All three round-5 findings are confirmed fixed with concrete inputs, and nothing regressed. There are no new CONFIRMED findings. P17-F1 (`window.cdSpeak` in production) remains INFO and is Steven's call; it is unchanged by design.

## Scope

- Change-set 5610f4b4e5b4500b. `bash scripts/validate-code.sh` gave `verdict: PASS (2 passed, 0 failed)` (py_compile on the splice, plus brain doctor). Its file list also covers the doc edits in context/decisions.md, docs/NEEDS-STEVEN.md, docs/STEVEN-STEPS.md, memory.md, routines/cloud-routine-repairs.md and wiki/dashboard-ops/freshness-routines.md. Those are prose and were not reviewed in this narrow pass.
- Code under review: `dashboard/wave2/splice-presence-texttalk.py` (86 lines, read in full). The applied copy is `/tmp/claude-0/deck-r7.html` (v196), lines 27124-27160. That block is byte-identical to the splice's `js` block. The presence state machine at createPresence (27089) has only four states: idle, listening, thinking and speaking.
- Evidence:
  - (a) A node replay of the `js` block, extracted verbatim from the splice, with a fake clock and a stub presence, banner and steveSetSpeaking. Eight scenarios.
  - (b) The splice run against three fixture files in the scratchpad: a clean anchor set, a duplicated anchor and a missing anchor, plus a re-run on the clean fixture.
  - (c) The caller's Playwright proof `texttalk-test.mjs`, re-run against deck-r7.html.
  - No repo file was written except this report.

## Round-5 findings — status

### P05-F1 (MEDIUM) — FIXED
- Location: splice :47-51. The interval reads `s`. If it is "thinking" or "listening", the interval calls presenceTextTalkStop, removes the banner, calls `steveSetSpeaking(false)` and returns. It never re-sets the state.
- Proof:
  - Vanessa, 100-word reply (38 s talk), `set("thinking")` at 0.8 s. At 1.4 s the state is `thinking`, the banner is off and 0 timers remain. After +40 s the state is still `thinking`, because the end timer was cleared and so cannot drop it to idle.
  - Steve, `set("listening")` at 0.8 s. The state is `listening`, the banner is off, the ring is false and 0 timers remain.
  - Edge case: "thinking" set 10 ms before the end timer fires, with no tick in between. The end timer only idles from "speaking", so the state stays `thinking` and the banner is off.
  - Headless run: `vThink600:"thinking"`, `bannerThink:false`, 0 page errors.

### P05-F2 (LOW) — FIXED
- Location: splice :52-54. The re-raise now sets the state, the banner and Steve's ring together, and only when `!presenceAudioLive(who)`.
- Proof:
  - Steve mid-talk, with an audio handler simulated to end the turn (idle, banner off, ring off). After one tick: `speaking`, banner=true, ring=true. At the end: `idle`, banner=false, ring=false, 0 timers.
  - With VOICE_PLAYING set and the state idle, there is no re-raise: the state stays `idle`.

### P01-F1 (INFO) — FIXED
- Location: splice :19-24. `len(re.findall(...))` must equal 1.
- Proof on fixtures:
  - Duplicated presenceWireInput anchor: `ABORT: anchor presenceWireInput anchor (matched 2, need exactly 1)`, exit 1, file unchanged.
  - Missing voiceStop anchor: `matched 0`, exit 1, file unchanged.
  - Clean fixture: `ok`, and each hook is inserted once with `/\s+/` intact.
  - Re-run on the clean fixture: `ABORT: already applied`, exit 1.

## Regression checks (pass 20 — all REJECTED as defects)

- Timer leak: after a second reply 1 s into a first, exactly 2 timers are live (one interval and one end timeout), and the nod rate is 4/s, not doubled. Every scenario ends with 0 timers.
- Yield, then a new reply: the talk yields to thinking, the state is reset to idle, and a new presenceTextTalk runs. The state is `speaking` with the banner on, and it ends `idle` with 0 timers.
- voiceStop path: presenceTextTalkStop followed by idle. The state stays `idle` and 0 timers remain.
- End timer while audio is live: the banner is left on for the audio handlers to clear (by design, splice :59). Not a defect.
- Yield while a voice reply is still audible: the banner and ring go off while the state shows "thinking". The indicators agree with the state. Not a defect.
- Idempotence: MARK is checked first (:15). Every sub1 aborts before the single write (:85). Confirmed on fixtures.

## Observation (outside this change-set, not a finding)

In the headless run, the deck's own opener→closer audio chain set Vanessa back to "speaking" about 2 s after the synthetic `set("thinking")` (`v2:"speaking"`). The text talk had already stopped at that point, so this behaviour is the existing audio pipeline, not the splice. Whether a real follow-up during an opener or closer clip should pre-empt the clip is a separate question for the presence/audio code.

## Top missing tests (pass 19)

1. Commit the fixture test for the splice (duplicate, missing, already-marked → abort, no write) next to the splice. Today it exists only as a validator scratch run.
2. Commit the node fake-clock replay (thinking/listening yield, re-raise agreement, second-reply timer count) so the round-5 fixes are guarded by a test that does not depend on deck-r7.html.
3. A real-send headless test: chatSetThinking(on) during a long reply's text talk, then chatSetThinking(off), and assert the state goes thinking → idle with no "speaking" in between from the text talk.

# VibeBreaker Review — 2026-10-14 (Palm Springs travel card + Job Command Center, deck v197)

change-set: e2a4c0bbe958505e

(The first deterministic run this session reported change-set 381edf9a1e04ac16 for the splice alone. memory.md and context/decisions.md then joined the working tree. The current hash is e2a4c0bbe958505e: `validate-code.sh` reports PASS (2 passed, 0 failed), covering py_compile and brain doctor.)

## Verdict

**FIX FIRST.** There is one MEDIUM finding. Six multi-day events carry only their start date, so the deck hides them as "passed" while they are still running. There are two LOW findings. The splice mechanics are clean: unique anchors, idempotent, a single atomic write, and no regression elsewhere.

## Scope

- Files: dashboard/wave2/splice-travel-palmsprings.py (new, untracked). The doc-only diffs (memory.md, context/decisions.md, brain/index.json) were read for claims and not reviewed as code.
- Applied output: /tmp/claude-0/deck-r7.html. The deck's own travelEndDate / travelStatus / renderTravelPage (deck-r7 lines ~20923-21092) were read.
- Passes: 01, 04, 05, 17, 19, 20.
- Method: I rebuilt the pre-splice deck in memory by reversing the 7 edits in deck-r7. The script then ran in memory with `open` patched, and its output **reproduced deck-r7.html exactly** (4,695,322 chars). A second run gave `ABORT: already applied`. The deck's own travelEndDate ran in node on all 29 Date strings. The caller's headless ps-test.mjs re-ran with 29 rows, the card present, the link correct and 0 page errors.

## CONFIRMED

### P04-F1 (MEDIUM): multi-day events use the start date, so they are auto-hidden while still running
- Location: splice :36 (Modernism Week, "Oct 15, 2026", runs to Oct 18), :38 (Randy Rainbow, "Oct 16", shows Oct 16-18), :42 (Firebirds, "Oct 23", home dates Oct 23/28/30), :49 (Pride, "Nov 6", festival Nov 6-8 with the parade Sun Nov 8), :56 (Acrisure Series, "Nov 21", runs Nov 21-26 with Gonzaga-MSU on Nov 26), :62 (Tamale Festival, Dec 5-6).
- Trigger: the deck is opened on 2026-11-07 or 2026-11-08.
- Bad state: travelEndDate("Nov 6, 2026") gives Nov 6 23:59, so travelStatus is "passed". The Pride row disappears on parade day unless "Show passed events" is on. The same happens to Modernism Week on Oct 16-18 and to the Acrisure Series on Nov 22-26.
- Spec: every other city writes multi-day runs as ranges ("Oct 16–18, 2026", "Nov 21–22, 2026", "Dec 3–12, 2026"). The parser resolves a range to its last day. decisions.md (2026-10-14) itself says "Pride Nov 6-8" and "Tamale Festival Dec 5-6".
- Fix proof: change the Date cells to "Oct 15–18, 2026", "Oct 16–18, 2026", "Oct 23–30, 2026" (or one row per game), "Nov 6–8, 2026", "Nov 21–26, 2026" and "Dec 5–6, 2026". Then assert in node that travelEndDate returns the last day for each.

### P04-F2 (LOW): a time written as "N PM" with no minutes is read as a day of the month
- Location: splice :48 ("Nov 5, 2026, 7 PM" resolves to **Nov 7**), :50 ("Nov 7, 2026, 8 AM" resolves to **Nov 8**), :62 ("Dec 5, 2026, 10 AM" resolves to **Dec 10**). In :52 ("Nov 13, 2026, 8 PM") the result is right only because 13 > 8.
- Trigger: the deck is opened on 2026-11-06.
- Bad state: the Rita Moreno row (Nov 5) still shows as upcoming with a "today" badge. Before the event, the "in Nd" countdown is 2 days long for that row and 5 days long for the Tamale row.
- Cause: the deck's travelEndDate strips only `\d{1,2}:\d{2}\s*(am|pm)` and then takes the largest 1-31 number. This parser defect is **pre-existing**: existing rows "Dec 4, 2026, 7 PM" and "Nov 12, 2026, 7 PM" are mis-dated the same way. So the new rows "parse like existing rows", and both are wrong. This change adds three more instances.
- Fix proof: drop the time from the Date cell, write "7:00 PM", or (deck-side, outside this splice) widen the strip to `\d{1,2}(:\d{2})?\s*(am|pm)`. The node replay should then give Nov 5, Nov 7 and Dec 6.

### P05-F1 (LOW): the stamp now says every event row was re-researched on 2026-10-14
- Location: splice :69. The prepend makes TRAVEL_SYNCED_AT start "2026-10-14 — …". renderTravelPage then prints "event, sports and entertainment rows were re-researched " + TRAVEL_SYNCED_AT.slice(0, 10), which gives **2026-10-14**. S.TRAVEL (deck ~24042) also feeds the freshness board.
- Trigger: any page load.
- Bad state: the panel note and the freshness board claim that every city's event rows were re-researched on 10-14. Only the 29 Palm Springs rows were. The others date from the 10-11 research pass and the 10-12 re-check.
- Pass 20: the 2026-10-12 stamp used the same prepend pattern, so this is an established convention. It still makes a false freshness claim, so it is kept at LOW.
- Fix proof: one of two options. Keep the date-leading stamp only for whole-panel refreshes and put the Palm Springs note after it. Or make the note's wording not depend on slice(0, 10).

## UNVERIFIED (NEEDS-CONTEXT)
- Job card :75-76 claims "daily 6:40 AM PT" and the routine name "RoleCompass daily job hunt (v4)". The repo has no routine record of either. Only decisions.md, written in this same change, repeats them. The scheduled-task list is needed to confirm.
- Row facts (dates, venues, prices) come from WebSearch snippets and cannot be checked offline. The rows say so themselves.

## REJECTED (pass 20)
- Raw `&` in rows (:37, :55, :61): in HTML, an `&` followed by a space is not a character reference. 12 existing travel rows do the same, and the rows render correctly.
- Quotes, `<` and `>`: there are none in the rows. All 29 rows parse in node as arrays of exactly 4 strings. The apostrophe in "Steven's" sits inside a Python triple-quoted string and HTML text, so it is safe.
- Backslash and group references in re.sub replacements (:32, :67, :80): the inserted text has no backslashes, and `.replace("\\","\\\\")` is correct anyway.
- Anchor uniqueness: on the pre-splice deck, each of the 6 sub1 patterns matched exactly once, and the KAPSO marker exists once. The city-defs anchor matches only when New Braunfels is the last entry, which it is.
- Idempotence and atomicity: MARK is checked first (:13). Every sub1 aborts before the single write (:84). The re-run aborted with no write.
- Regression: the replay reproduced deck-r7 exactly, so only the 7 intended edits exist. The other 11 city arrays and defs are unchanged. The Job card id is unique. Its link matches the existing pages-menu item "Job Machine — Ultimate Job Search Dashboard", so the card's "also in the pages menu" claim is true.
- "Through Dec 30, 2026" and "Through May 27, 2027" parse to Dec 30 2026 and May 27 2027, the same as existing "Through …" rows.
- Firebirds "home games": the text is in the Name column, not the Date column, so the row is not made evergreen. That is correct.

## Coverage (clean on inspection)
| Surface | Result |
|---|---|
| Anchors and abort behaviour (sub1, MARK, KAPSO marker) | clean |
| Card HTML (travel card, Job card) | clean; well-formed, unique ids |
| TRAVEL_PALMSPRINGS shape | clean; 29 rows × 4 strings |
| TRAVEL_CITY_DEFS entry | clean |
| Coverage-note edit | clean |
| Date parsing | P04-F1, P04-F2 |
| Sync stamp | P05-F1 |
| Headless render | 29 rows, 0 page errors |

## Top missing tests (pass 19)
1. A node test that runs the deck's travelEndDate on every TRAVEL_* Date cell and asserts the intended last day. It would have caught F1 and F2, including the pre-existing "7 PM" rows.
2. Commit the splice fixture test (duplicate anchor, missing anchor, already marked: abort with no write) next to the splice.
3. A parser unit test for "N PM", "N:MM PM", "N:MMPM" and ranges with an en dash or a hyphen.

# VibeBreaker Re-validation — 2026-10-14 (Palm Springs splice, round 2, deck v198)

change-set: f3862aa2e09e6894

`bash scripts/validate-code.sh` on 2026-10-14T15:55:21Z reports "verdict: PASS (2 passed, 0 failed)", covering py_compile and brain doctor. The change-set is splice-travel-palmsprings.py, memory.md and context/decisions.md. The previous round's change-set was e2a4c0bbe958505e (FIX FIRST).

## Verdict

**SHIP.** All three round-1 findings are fixed. No new findings.

## Method
- Rebuilt the pre-splice deck from /tmp/claude-0/deck-r7.html by reversing the edits one by one: the mark, the travel card, the 29 rows, the city def, the synced-at stamp, the parser line, the coverage note and the Job card. Each reversal matched exactly once.
- Ran the script in memory with `open` patched (no write) on that rebuild. Its output **reproduced deck-r7.html exactly** (4,695,431 chars). A second run gave `ABORT: already applied` and left the text unchanged.
- Ran the deck's own travelEndDate in node from deck-r7, old regex against new, on every row of all 12 TRAVEL_* city arrays (203 rows, 29 of them Palm Springs).

## Round-1 findings, re-checked
| Finding | Status | Evidence |
|---|---|---|
| P04-F1 MEDIUM, multi-day rows resolved to their start date (splice :36, :38, :42, :49, :56, :62) | FIXED | The rows now give Oct 18, Oct 18, Oct 30, Nov 8, Nov 26 and Dec 6. |
| P04-F2 LOW, "N PM" read as a day of the month (:48, :50, :52) | FIXED | The rows are now "7:00 PM", "8:00 AM" and "8:00 PM", giving Nov 5, Nov 7 and Nov 13. Separately, deck step 4 (:72-73) widens the strip to `/\d{1,2}(:\d{2})?\s*(am|pm)\b/ig`. |
| P05-F1 LOW, the stamp claimed every row was re-researched on 10-14 (:69) | FIXED | TRAVEL_SYNCED_AT starts "2026-10-12 — Palm Springs / Palm Desert card added 2026-10-14 …", so `.slice(0,10)` gives 2026-10-12. |

## Regression replay (rows whose end date moved, old parser → new)
- TRAVEL_TEMECULA "De Portola Wine Trail Harvest Celebration", "Nov 8, 2026, 10 AM": Nov 10 → **Nov 8** (a correction).
- TRAVEL_TEMECULA "Santa's Electric Light Parade", "Dec 4, 2026, 7 PM": Dec 7 → **Dec 4** (a correction).
- The other 201 rows have the same end date under both parsers. That includes every "N:MM PM", "N:MMPM", multi-date list ("Oct 2, 3, … 17, 2026, 8:00 PM" gives Oct 17) and "Oct 23 & 24, 2026, 8:00 PM" (gives Oct 24) row.
- Edge probes: `\b` stops a false strip on words that start with "am" or "pm" ("10 Amphitheater" stays as it is). Ranges and comma lists are untouched.

## Findings
None CONFIRMED.

## Carried forward (unchanged, NEEDS-CONTEXT, not a defect)
- Job card :79-80 says "daily 6:40 AM PT" and names the routine "RoleCompass daily job hunt (v4)". There is still no routine record in the repo to confirm either.

## Top missing tests (pass 19)
1. Commit the node travelEndDate replay over every TRAVEL_* Date cell, with expected last days, as a deck test. Include the two corrected Temecula rows.
2. Commit the splice fixture test (duplicate anchor, missing anchor, already marked: abort with no write).

# VibeBreaker Review — 2026-10-14 (Kapso `install-mac.sh keys --allow`)

change-set: fc3fe2698bea8c6e

`bash scripts/validate-code.sh` at 2026-10-14T15:58:55Z reported "verdict: PASS (3 passed, 0 failed)" (bash -n, shellcheck, brain doctor). `--hash` returns fc3fe2698bea8c6e. The change-set contains integrations/kapso/install-mac.sh (the only code), README.md, the whatsapp-kapso SKILL.md, REMOTE-ACCESS.md, docs/STEVEN-STEPS.md and memory.md. Passes run (shell): 01, 04, 05, 11, 14, 19, 20.

## Verdict

**FIX FIRST.** One MEDIUM finding: the new subcommand prints the full allow-listed number on one path, which breaks its own "last 4 only" contract. The other two findings are LOW. `doctor` and `install` are unchanged. Exit codes are correct. The script is bash 3.2 clean.

## Evidence
- `shellcheck -S warning` (0.11.0) returned 0 with no output. bash -n passed. Kapso unit tests (`cd integrations/kapso/tests && python3 -m unittest -q`): 16 run, OK.
- The diff touches only the header comment (:7-11), the new `keys)` case (:78-90) and the `*)` usage line (:92). The `install` (:39-58) and `doctor` (:59-77) bodies are byte-identical to HEAD.
- The `keys` branch was exercised against a stub `security` on PATH that logs argv. All 12 cases behaved as follows:
  - `2024745223` stores `12024745223` with `-U`, then the prompt runs. Exit 0.
  - `"+1 (202) 474-5223"` stores `12024745223`. Exit 0.
  - With an existing `kapso` item, it is kept and nothing prompts. Exit 0.
  - A cancelled prompt exits 1. A failed `kapso-allow` write exits 1.
  - 9 digits, no `--allow`, empty `$3` and unquoted `202 474 5223` all print usage and exit 2. An unknown subcommand prints usage and exits 2.
- The key prompt `security add-generic-password -a "$USER" -s kapso -w` puts `-w` last with no value. Per security(1) that prompts, and the key is never placed in argv.
- `-U` means "update item if it already exists". Without it, a re-run would fail with a duplicate-item error. That is correct for `kapso-allow` and correctly omitted for `kapso`, which is guarded by `find-generic-password` first.
- `${ALLOW#"${ALLOW%????}"}` gives exactly the last 4 digits. Length is at least 10 by then, so it is safe.
- No bash-4 constructs (`${v,,}`, `[[`, arrays, `declare -A`, `mapfile`). `set -u` is safe because `${3:-}` is used.
- Consumers `kapso-fetch.py` :50/:176 and `kapso-send.py` :55 compare `digits(kapso-allow)` to the WhatsApp sender id. The stored `1XXXXXXXXXX` form matches that format.

## CONFIRMED

**P05-F1 MEDIUM: full number echoed (integrations/kapso/install-mac.sh:81)**
- Trigger: `keys --allow` with a number that does not start with 1, e.g. `keys --allow "(619) 555-1234"`, the shape the README's `<digits>` invites.
- Bad state: `say "  (added the US country code: $ALLOW)"` prints all 11 digits of Steven's mobile to the terminal, to its scrollback and to any Orca or Claude Code session transcript that ran it. The spec, and the line after it, promise only the last 4.
- Fix proof: rerun the stub harness with a 10-digit input. The output must contain no run of more than 4 consecutive digits from the number (e.g. print `(added the US country code 1)`).

**P04-F1 LOW: non-US or over-long input is silently corrupted (install-mac.sh:80-81)**
- Trigger: an input of 11 or more digits that does not start with 1, e.g. `442071234567`, gets a `1` prepended and is stored as `1442071234567`. Any length at or above 10 is accepted (e.g. 16 digits).
- Bad state: the allow-list holds a number that cannot match any sender, so Vanessa silently answers no one. This fails closed, so it is not a security issue, but it gives a false "set" confirmation.
- Fix proof: accept only 10 digits (then prefix 1) or 11 digits starting with 1. Anything else exits 2. Harness cases 442071234567 and 1202474522377777 must exit 2.

**P14-F1 LOW: stale header claim (install-mac.sh:17-18)**
- The header still says "Nothing here signs in, sends a message or stores a key: … the API key goes into the macOS Keychain item "kapso" by Steven's own hand". `keys` now stores both Keychain items, prompted by this script.
- Fix proof: reword the header to say the script stores the items only via the `keys` subcommand, typed by Steven.

## UNVERIFIED (NEEDS-CONTEXT, not defects)
- On-Mac runtime: whether the hidden `-w` prompt still reaches the user with stdout sent to /dev/null (:87). security(1) reads via the tty, so this is expected but not run here (no macOS). Proof: one run on the Mac.

## REJECTED
- "The number is on the command line (`-w "$ALLOW"`, visible in ps)." Rejected: the spec chose this, the value is not a secret, and the API key never goes through argv.
- "`$3` misread given FLAG=$2." Rejected: verified that `$2` must be `--allow` and `$3` holds the digits. A missing or split value prints usage and exits 2.
- "A 10-digit US number starting with 1 is not prefixed." Rejected: NANP area codes never start with 1.

## Steven decides
- The allow-list must be **his own mobile**, not Vanessa's (202) 474-5223. If he types Vanessa's number, she answers no one. STEVEN-STEPS step 2 says "your 10-digit mobile", which is correct.

## Top missing tests (pass 19)
1. Commit the stub-`security` harness as `integrations/kapso/tests/test_install_keys.sh`. Cover the 12 cases above and assert stdout never holds more than 4 digits of the number.
2. A length or format table test: 10 digits, 11 starting with 1, 11 not starting with 1, 12+, and fewer than 10.
3. A test asserting the API key never appears in argv: every stubbed `add-generic-password -s kapso` call must end with a bare `-w`.

# VibeBreaker Re-validation — 2026-10-14 (Kapso `install-mac.sh keys`, narrow)

change-set: 0a0d4a615902a9fc

`bash scripts/validate-code.sh` at 2026-10-14T16:09:03Z reported "verdict: PASS (3 passed, 0 failed)" (bash -n, shellcheck, brain doctor). `--hash` returns 0a0d4a615902a9fc. This supersedes the review of fc3fe2698bea8c6e above. It is a narrow re-run of passes 04, 05, 14, 19 and 20 against the three fixes and the new `USER` default, on integrations/kapso/install-mac.sh only.

## Verdict

**SHIP.** All three earlier findings are closed. No new findings.

## Evidence
- A stub `security` on PATH logged argv, with `USER` unset (`env -u USER`). The script ran under `set -u` and resolved the account via `id -un`.
  - `"(619) 555-1234"` stored `16195551234` with `-U`. Output: "(added the US country code 1)" and "...1234". Exit 0.
  - `16195551234`, `1-619-555-1234` and `"+1 619 555 1234"` each stored `16195551234`. Exit 0.
  - `442071234567` (12 digits), `26195551234` (11 digits, not starting with 1), `12345` and empty input each exited 2 with a count-only message. No `security` call was made.
  - A missing `--allow` prints usage and exits 2.
  - Re-run with the `kapso` item present (stub `find` returns 0): the key is kept, there is no prompt and no `add ... -s kapso` call. Exit 0.
  - The key call is `add-generic-password -a <user> -s kapso -w`, with a bare `-w` and no value in argv.
- In every case, the longest run of digits on stdout or stderr was 4.
- `git diff HEAD` on the script touches only the header (:7-11, :17-18), `USER=` (:21), the `keys)` case (:79-95) and the usage line (:97). The `install` and `doctor` bodies are byte-identical. `install` preview still runs. Kapso unit tests: 16, OK.

## Closed
- P05-F1 MEDIUM :81, now :83. Prints only "(added the US country code 1)".
- P04-F1 LOW :80-81, now :82-86. Accepts only 10 digits, or 11 starting with 1. Anything else exits 2.
- P14-F1 LOW :17-18. The header now states that `keys` writes the two Keychain items and prints at most 4 digits.

## CONFIRMED
None.

## UNVERIFIED (NEEDS-CONTEXT, not defects)
- Carried forward: on a real Mac, does the hidden `-w` prompt reach the user with stdout sent to /dev/null (:92)? Proof: one run on the Mac.

## Top missing tests (pass 19)
1. Commit the stub-`security` harness as `integrations/kapso/tests/test_install_keys.sh`. It should cover the cases above, including `USER` unset and an existing `kapso` item, and assert that no output line holds more than 4 consecutive digits.

# VibeBreaker Review — 2026-10-14 (Las Vegas travel splice, deck v199)

change-set: d751b99eebbf7442

`bash scripts/validate-code.sh` at 2026-10-14T23:42:20Z reported "verdict: PASS (2 passed, 0 failed)" (py_compile dashboard/wave2/splice-travel-vegas.py, brain doctor). `--hash` returns d751b99eebbf7442. Files in the change-set: dashboard/wave2/splice-travel-vegas.py (new), context/decisions.md, memory.md. brain/index.json is regenerated and outside the hash. The spliced deck working copy was also reviewed: /tmp/claude-0/deck-r7.html against /tmp/claude-0/deck-r7.bak.html.

## Verdict

**FIX FIRST.** There are three LOW findings and nothing blocks the deck from loading. The Tim McGraw row stays on the page until Nov 23, which is 16 days after the run ends. Two record lines are also wrong: the "30 rows" count and a duplicated memory line.

## Scope
- Passes run: 01, 04, 05, 14, 17, 19, 20 (Python splice + dashboard data rows). 06/07/08/12/18 have no surface here: it is a one-shot, single-file text splice with no I/O beyond one file read and one write, no concurrency and no network.
- Evidence harness: TRAVEL_VEGAS, TV_MONTHS and `travelEndDate` were extracted verbatim from the spliced deck and run in node over all 55 rows. The scratch file is in the session scratchpad and nothing in the repo or the deck was written.
- `dashboard/tests/quickcheck.py /tmp/claude-0/deck-r7.html` reported 11 PASS and the 1 known FAIL ("functions called but never defined", a false positive on `$` amounts). This splice adds `$60`, `$162` and `$168` to that false-positive list.

## CONFIRMED

```yaml
id: P04-F1
pass: 04
title: Cross-month Date "Oct 23 – Nov 7, 2026" resolves to Nov 23, not Nov 7
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/wave2/splice-travel-vegas.py
    line: 56
  - path: /tmp/claude-0/deck-r7.html (function travelEndDate)
    line: 20957-20990
entry_or_trigger: panel render -> travelStatus(r[2]) (deck :21088) -> travelEndDate("Oct 23 – Nov 7, 2026")
evidence: The range regex /(\d{1,2})\s*[–—-]\s*(\d{1,2})/ needs digits on both sides of the dash and does not match "23 – Nov 7". The code falls back to the largest day number (max(23, 7) = 23) with the last month name (nov). The node harness printed `25 "Oct 23 – Nov 7, 2026" Mon Nov 23 2026`.
existing_controls_checked: Every other new Date string was run through the harness. 24 of them return null (evergreen). "Nov 19–21, 2026" returns Nov 21, as intended. The single dates return their own day. The only other cross-month string in the deck, "Sep 19–Oct 31, 2026" (:20734), resolves correctly, but only because 31 > 19.
failure_scenario: From Nov 8 to Nov 23, 2026, the Tim McGraw Colosseum run shows as "upcoming" on the Las Vegas card although it has ended.
impact: Steven sees a stale event for 16 days. This is informational only: no booking and no money involved.
remediation_direction: Either give the row a Date string the parser reads correctly (only the end month and day, e.g. "Through Nov 7, 2026"; the Details already carry "2026-10-23 to 2026-11-07"), or teach travelEndDate the "Mon D – Mon D" form.
verification: The node harness asserts travelEndDate(<new Tim McGraw Date>) is Nov 7 2026 23:59:59, while "Nov 19–21, 2026" still gives Nov 21 and "Sep 19–Oct 31, 2026" still gives Oct 31.
needs_context: null
```

```yaml
id: P14-F1
pass: 14
title: The splice adds 31 rows; the deck stamp and decisions.md say 30
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: dashboard/wave2/splice-travel-vegas.py
    line: 31-61, 71
  - path: context/decisions.md
    line: 500
entry_or_trigger: TRAVEL_SYNCED_AT note shown on the Travel panel; decisions record
evidence: The rows literal holds 31 rows (:31-61), and decisions.md itself lists 5 Cirque + 7 nightclubs + 7 dayclubs + 5 shows + 7 dated events = 31. The pre-splice TRAVEL_VEGAS has 25 rows and the spliced one has 55 (25 - 1 + 31). The stamp (:71) and decisions.md (:500) say "30 rows".
existing_controls_checked: diff of the deck copies (31 added row lines + 1 comment line, 1 row removed)
failure_scenario: The visible sync note and the decision record misstate the change. A later reconciliation that counts rows against the record will not match.
impact: Record accuracy only.
remediation_direction: Change "30 rows" to "31 rows" in the script stamp, the deck copy and decisions.md.
verification: `grep -c "31 rows" ` hits the stamp and decisions.md, and the harness row-count delta is 31.
needs_context: null
```

```yaml
id: P14-F2
pass: 14
title: memory.md gains two lines for the same fact, one with a doubled date
status: CONFIRMED
severity: LOW
confidence: HIGH
location:
  - path: memory.md
    line: 104-105
entry_or_trigger: bin/brain recall over memory.md
evidence: Line 104 "- 2026-10-14 — Deck v199: the Las Vegas travel card now lists ..." and line 105 "- 2026-10-14 — 2026-10-14 Deck v199: Las Vegas travel card lists ..." record the same event.
existing_controls_checked: brain doctor PASS (it does not check for duplicates)
failure_scenario: Recall can return either line. Line 105 carries a malformed doubled date stamp, and the file rule is "one dated line each".
impact: Brain hygiene only.
remediation_direction: Keep one line (104 is the complete one) and regenerate the index.
verification: grep -c "Deck v199" memory.md == 1; brain doctor PASS.
needs_context: null
```

## UNVERIFIED (NEEDS-CONTEXT, not defects)
- The factual accuracy of the venue, schedule and date facts. They are WebSearch snippets, each row names its source, and verifying them is outside a code review.

## REJECTED
- P01-C1 — Curly “O” quotes break the JS string — The script holds literal U+201C/U+201D characters, not `\u` escapes (grep: the only backslashes in the file are at :64, :67 and :71). `new Function(block)` parses the spliced TRAVEL_VEGAS, and `node --check` passes on the inline script.
- P01-C2 — `rows.replace("\\","\\\\")` corrupts re.sub output — rows contains no backslash, so the replace is a no-op. The doubling is also the correct escape for a re.sub replacement string, and the deck diff shows the rows byte-for-byte as written.
- P04-C1 — The summary-row delete regex can eat an adjacent line — `[^\n]*\n` cannot cross a newline, the pattern is anchored on the exact 4-space prefix and title, and sub1 requires exactly one match. The diff removes exactly one line (bak :20888).
- P04-C2 — The TRAVEL_SYNCED_AT prefix moves the leading date — the group `\1` re-emits "2026-10-12 — " first. The diff shows the stamp still starts with 2026-10-12.
- P04-C3 — Re-run double-inserts — the MARK appears once in the spliced deck and the script aborts if MARK is present (:16-17).
- P05-C1 — PII or secret in the rows — a scan of the TRAVEL_VEGAS block found 0 emails, 0 phone patterns and 0 key/token/secret/password strings. The rows hold only public venues and events.
- P17-C1 — "Seasonal" dayclub rows stay visible after the season closes — this is the documented intent (decisions.md: the rows use "Seasonal" so the filter keeps them, and the Details say the season closes mid/late Oct). It is a design choice, not a defect.

## Coverage (inspected, clean)
- splice-travel-vegas.py: anchors (:64, :67, :70) are each guarded by sub1's findall==1; the second-run guard works; it does a single read and a single write; it has no network access and no secrets.
- Deck diff: 39 lines, three hunks only (stamp, insert, one delete). No other region changed.
- The 31 new rows have 4 fields each, and travelEndDate output was checked for every row. 24 are evergreen. The others are F1 Nov 21, Weezer Oct 23, Jonas Nov 28, TSO and Rife Dec 4, BSB Dec 26 (all correct) and Tim McGraw (P04-F1).
- No duplicate of the pre-existing rows (indices 31-54 listed: Metallica, Eagles, LISA, NHL/NFL, NFR, NKOTB, Doja Cat, Mob Museum, AREA15, Absinthe, restaurants).
- decisions.md entry: dated, verbatim request, owner/status present.

## Top missing tests (pass 19)
1. A node test over every TRAVEL_* Date string. It asserts that travelEndDate returns the end of the stated run for cross-month ranges ("Oct 23 – Nov 7, 2026" gives Nov 7, and "Sep 19–Oct 31, 2026" gives Oct 31).
2. A splice dry-run test on a fixture deck that asserts rows added == the count written in the stamp, and that the summary-row deletion removes exactly one line.
3. A brain doctor check that flags duplicate memory.md lines and doubled date prefixes ("- D — D ").

# VibeBreaker Re-validation — 2026-10-14 (Las Vegas travel splice, narrow)

change-set: f163efe15c89ca93

`--hash` printed f163efe15c89ca93. The coordinator said this hash differs from 8e47e2ad1607ed3c only by one line added to context/decisions.md (the deck was republished as v200). `bash scripts/validate-code.sh` then reported "verdict: FAIL (1 passed, 1 failed)": py_compile PASS, brain doctor FAIL with "index: brain/index.json stale vs the tree … run `bin/brain reindex`". This section supersedes the review of d751b99eebbf7442 above. It re-runs passes 04, 14, 19 and 20 against the three fixes only.

## Verdict

**FIX FIRST.** All three code and record findings are closed. The one open item is the stale brain index (P00-F1), and the deterministic gate fails until the index is rebuilt. `bin/brain reindex` is expected to clear it, because brain/index.json is excluded from the change-set and the hash should not move. If validate-code.sh then PASSES on f163efe15c89ca93, this review is SHIP with no further findings.

## Closed
- P04-F1. The script's row at :56 and the deck copy both carry "Through Nov 7, 2026". In node, the deck's own travelEndDate returns Sat Nov 07 2026 23:59:59 for the live row. "Nov 19–21, 2026" still returns Nov 21, "Sep 19–Oct 31, 2026" still returns Oct 31, and "Nightly" still returns null. The deck has 0 hits for "Oct 23 – Nov 7, 2026".
- P14-F1. "31 rows" now appears in the script stamp (:71), the deck stamp and context/decisions.md:500. The deck has 0 hits for "30 rows, WebSearch". TRAVEL_VEGAS still has 55 rows.
- P14-F2. `grep -c "Deck v199" memory.md` = 1, and the doubled-date line is gone.

## CONFIRMED
- P00-F1 (CRITICAL by rule: a deterministic check fails). brain/index.json is stale against the tree after the decisions.md v200 line was added, and brain doctor fails. To clear it: run `bin/brain reindex`, then `bash scripts/validate-code.sh` should print "verdict: PASS" with change-set f163efe15c89ca93. The defect is a missing regeneration, not code.

## Coverage
- The deck diff against /tmp/claude-0/deck-r7.bak.html is still exactly 35 changed lines: the stamp, 32 inserted lines and 1 deleted line. No other region changed. Quickcheck shows only the known `$`-amount false-positive FAIL.

# Review — change-set 7a028b6f540200e3 (2026-10-22, desk seats + skills pack)

Diff: brain/agentos.py (ALIASES for 7 desk seats; SEAT_OF_LEAD + chief-of-staff pin), brain/bench/routes.json (+3 cases),
regenerated integrations/agent-os/agents.json + 7 agent files, wiki seat/pod tables, 11 new skills.
Deterministic: validate-code.sh PASS (6/6); brain unittests 99 OK; os check 180/180, manifest current; orgcheck 38/38.

## CONFIRMED → fixed
- F1. `chief-of-staff` (no lead in the roster) was silently re-laned Vanessa → "Voicemail & Inbox Triage" by the new lane
  word row, and its agent file regenerated. Fix: `SEAT_OF_LEAD["chief-of-staff"] = "Vanessa"` (brain/agentos.py:49).
  Proof: manifest vs HEAD shows only the 7 new slugs and no lane change on any existing slug.

## Clean
- No alias collisions; the three new SEAT_OF_LEAD keys move no existing agent; each new route case leads for a real
  keyword match (the refi case wakes 9 seats — noisy but correct).
