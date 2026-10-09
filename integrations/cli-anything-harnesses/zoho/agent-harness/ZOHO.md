# ZOHO.md — analysis, SOP and the honest state of this harness

Written 2026-09-22 by H2 (Integration Engineer). Read with `CLAUDE.md`'s HALT list: an API
permission or account change is a HALT, and the one thing this harness needs is exactly that.

## What this is

`cli-anything-zoho` is a CLI-Anything harness in the HARNESS.md package shape (namespace package
`cli_anything.zoho`, console script `cli-anything-zoho`, Click + REPL, `--json` everywhere) whose
backend is the **Zoho CRM REST API v8**, not a browser. Zoho has a real API; the deck's
`zoho-crm-sync` skill already specifies the direct-REST path from the Mac, and this package is that
path as a command: same credential file, same endpoints, same self-test, same status vocabulary.

Composio (`zoho_talite-spike`) remains the primary transport for the sync task. This CLI exists for
agents and shell scripts, and to make the block below unmistakable from a terminal.

## The known blocker, and how the harness surfaces it

Every Zoho CRM call today returns **HTTP 403 `NO_PERMISSION`, details
`Crm_Implied_Api_Access`** — reproduced on `ZOHO_LIST_LEADS` and `ZOHO_LIST_DEALS` at 08:17 UTC
and re-probed at 13:35 UTC on 2026-09-22, on an ACTIVE connection. The cause is the profile-level
**"Zoho CRM API Access"** toggle being off for the user who authorised the token. No credential
fixes it; only the toggle does.

`utils/zoho_backend.py::_handle` maps that exact case — HTTP 403 with `code == "NO_PERMISSION"`,
or any 403 whose body mentions `Crm_Implied_Api_Access` — to `ProfilePermissionDenied`:

- message: **"profile permission not granted — this is a Zoho-side setting, not a credential
  problem"**, followed by Zoho's verbatim code, message and details;
- `fix`: "Zoho CRM → Setup → Security Control → Profiles → the connected user's profile →
  Developer Permissions → enable 'Zoho CRM API Access'. Then re-run one Leads call
  (`cli-anything-zoho selftest`). If the token was authorised through Composio, re-authorise that
  connection once so the new permission is picked up. No credential fixes this; only the toggle
  does.";
- exit code **4**, distinct from every other failure;
- `selftest` renders it as `status: "blocked"`, `httpCode: 403`, the `fix` string — the
  `zohoSync` shape the sync skill writes;
- **never retried**: one `requests.get` per call, asserted by the tests for every recipe.

A 403 with any other code is a plain `auth_error`, not the profile message (tested), so the
harness cannot cry "profile" at an unrelated refusal.

## GET-only by construction — and the one consequence

The only HTTP call site is `requests.get` in `utils/zoho_backend.py`. No POST, PUT, PATCH or
DELETE, no `requests.Session`, no `urllib`, no `httpx` appear anywhere in the package;
`tests/test_core.py::TestGetOnly` greps every source file and fails the build if one appears. The
Zoho write verbs (record create/update/delete, stage change, note add) are impossible from this
package, not "disabled"; write-back stays an L2 proposal.

**The consequence:** the OAuth refresh-token grant is a **POST** by specification (RFC 6749 §6),
so this package cannot mint its own access token. The decision, stated plainly rather than hidden:

- `integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh` — **outside the pip
  package** — reads the five variables from `~/.config/zoho/.env`, POSTs the refresh grant to the
  accounts server (never to the CRM), and prints the one-hour access token to stdout. It never
  prints the secret or the refresh token and never writes a file.
- The CLI receives that token as `ZOHO_ACCESS_TOKEN` in its environment and stores nothing,
  which is what the sync skill demands ("access tokens last one hour; never store one").
- The `zoho-crm-sync` Mac task already performs the same exchange as its step 1, so the task can
  simply export the token and call this CLI.

The helper is syntax-checked (`bash -n`) and has never run; no Zoho credential exists anywhere
this was built.

## Recipes (from the connectors brief)

| Recipe | Endpoint | Notes |
|---|---|---|
| `selftest` | `GET /crm/v8/Leads?per_page=1&fields=…` | The sync skill's self-test, mapped to `ok` / `blocked` / `error` / `not-configured` |
| `leads list` | `GET /crm/v8/Leads` | Default fields `Last_Name,Company,Lead_Status,Lead_Source,Created_Time,Modified_Time`; `--all` follows `page_token` up to `--max-pages` |
| `leads get ID` | `GET /crm/v8/Leads/{id}` | Ids validated as digits before any request |
| `deals list` / `deals get ID` | `GET /crm/v8/Deals…` | Default fields `Deal_Name,Amount,Stage,Closing_Date,Lead_Source,Modified_Time` |
| `fields MODULE` | `GET /crm/v8/settings/fields?module=…` | Needs `ZohoCRM.settings.READ` |

Stage mapping onto the deck's 14 `ZH_STAGES` (unknown → `UnAccounted`) is deliberately **not** in
this CLI; it is the sync task's rule and belongs in one place.

## Credentials — names only

`~/.config/zoho/.env`, `chmod 600`: `ZOHO_ACCOUNTS_URL`, `ZOHO_API_URL`, `ZOHO_CLIENT_ID`,
`ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`; scopes `ZohoCRM.modules.ALL,ZohoCRM.settings.READ`.
Plus `ZOHO_ACCESS_TOKEN` in the process environment for the hour. `ZOHO_ENV_FILE` overrides the
file location (tests). Missing file → `not configured` naming all five; an empty variable → named;
missing token → named, with the minting instruction. Exit **5**, no request made, no stack trace.
If a server ever echoes the token inside an error body, it is redacted before the message is
built (tested).

## Error contract

| Condition | `type` | Exit | Behaviour |
|---|---|---|---|
| file / variable / token missing | `not_configured` | 5 | names it; no request |
| 403 `NO_PERMISSION` / `Crm_Implied_Api_Access` | `profile_permission_denied` | 4 | the message and click path above; never retried |
| 401 `INVALID_TOKEN` | `auth_error` | 1 | "invalid or expired … mint one" |
| 401 `OAUTH_SCOPE_MISMATCH` | `auth_error` | 1 | names the required scopes |
| other 401 / 403 | `auth_error` | 1 | verbatim code + message |
| 404 / `INVALID_MODULE` | `not_found` | 1 | |
| 429 | `rate_limited` | 1 | reported, never retried |
| 5xx / non-JSON / other 4xx | `upstream_error` | 1 | |
| DNS / TLS / timeout | `transport_error` | 1 | |

## What is unverified — say it plainly

Nothing in this package has ever been run against Zoho; no credential exists in any environment
this was built in. The v8 request shapes (`fields`, `per_page`, `page_token`,
`info.more_records`, `info.next_page_token`, `settings/fields?module=`) follow Zoho's published v8
contract as the sync skill records it, but the first live call is the proof. The 403 body used in
the tests is the shape recorded on 2026-09-22; if Zoho ever changes it, the text fallback
(`Crm_Implied_Api_Access` anywhere in the body) still maps.

First live run, on the Mac, **after Steven flips the toggle**: `config check` → mint the token →
`selftest` → `leads list --per-page 5`. Before the toggle, the honest expected result of `selftest`
is exit 4, `status: blocked`.

## PII

Default field sets carry no contact fields. Anything that looks like email, phone, mobile,
street, fax, zip, ssn or address is redacted in output by default; `--full` shows it to a human at
the terminal. Name + stage + dates is all that reaches the deck; nothing enters the vector index
or the knowledge graph.

## HALT conditions

Any write to Zoho requested; the profile permission still absent after 7 consecutive days (a
Needs-Steven packet, per the sync skill); a pull returning fewer than half the leads of the last
successful run; Composio or the token reporting revoked/expired (report, stop, escalate).
