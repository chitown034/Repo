# dotloop Harness: a read-only REST recipe for transaction-management data

Written 2026-09-27 (round R9), from Steven's verbatim request to connect "...zip forms, skyslope,
dot loop." Nothing here has run against a live dotloop account. Read
`cli_anything/dotloop/README.md` for install and use; this file records the analysis, the design
and what is deliberately absent — the same shape `PUBLICFEEDS.md` and `ZOHO.md` use for their own
packages.

## Why REST, not the browser engine

Unlike homes.com/ShowingTime/Showami/SkySlope/zipForms (no usable API, so DOMShell drives the
browser), dotloop publishes a documented OAuth2-secured JSON REST API. That makes it the same
shape as Zoho and Lofty: a plain `requests`-based GET-only client, no Chrome, no DOMShell, no
`cli-anything-browser` dependency. `cli-anything-zoho` is the template this package follows.

## What is confirmed, what is not, and why that split matters

**Confirmed, from a source read this round (2026-09-27):** the base URL
(`https://api-gateway.dotloop.com/public/v2`), the OAuth 2.0 3-legged flow
(`https://auth.dotloop.com/oauth/authorize` → `.../oauth/token`), the `Authorization: Bearer …`
header, a documented rate limit of 100 requests/minute/user (429 past that), and the resource
list (account, profiles, loops, loop details, folders, documents, participants, tasks, activities,
contacts, loop templates, webhooks) — all via the third-party API profile at
`github.com/api-evangelist/dotloop`.

**Attempted and blocked, same session, same date:** `dotloop.github.io/public-api/` (dotloop's own
docs), egress-blocked by this sandbox's proxy. This is not new behaviour — `publicfeeds/
PUBLICFEEDS.md` already records the identical restriction against redfin.com, veteransunited.com,
navyfederal.org, and three builder sites; a CRMLS terms-of-use check attempted the same session hit
the same wall (`www.crmls.org`, `devdocs.crmls.org`, `go.crmls.org`, and a third-party mirror on
`pwr.net` were all blocked — see the CRMLS review note alongside this harness's sibling work).

**What that means for this package, concretely:**
- The exact JSON envelope a live list endpoint returns (a bare array? a `data` key? pagination
  metadata under what name?) is a best-effort guess (`core/loops.py::_rows`), not a confirmed
  contract. The untouched body is always kept under `raw` so nothing is lost if the guess is
  wrong — this package's job stops at "here is what dotloop said," the same limit
  `PUBLICFEEDS.md` states for its own regex-based field extraction.
- The exact 401/403 error-body shape is **not** matched the way `cli-anything-zoho` matches
  Zoho's re-probed `NO_PERMISSION`/`Crm_Implied_Api_Access` — that confirmation came from a live
  re-probe on an ACTIVE Zoho connection (2026-09-22); no such probe exists or can exist here
  without a credential. Error handling is therefore generic and HTTP-status-based
  (`Forbidden`/`AuthError`/`NotFound`/`RateLimited`/`UpstreamError`), and the raw body is always
  surfaced under `details` rather than parsed for a specific code this package cannot verify.
- Loop-list filtering/sorting/pagination query-parameter names are **not guessed**. `loops list`
  takes `--param key=value`, repeatable, and passes it straight through — the same discipline the
  Pabbly Connect Integration Builder's own rules describe for an unverifiable field mapping:
  never invent one.

## Architecture

```
cli-anything-dotloop <command> --json
        |
        v
dotloop_cli.py     load config (env file + DOTLOOP_ACCESS_TOKEN) -> call a recipe -> redact -> print
        |
        v
core/loops.py      the read recipes: account, profiles, loops, loop-detail, participants,
        |          documents, activity, selftest — id validation, best-effort row extraction
        v
utils/dotloop_backend.py   one requests.get per call, Bearer header, generic HTTP-status mapping
        |
        v
https://api-gateway.dotloop.com/public/v2/...   (never reached in this build — no credential)
```

## Read-only by construction

- Has **no write group** — no `create`, `update`, `delete`, `upload` or `act` command exists.
  `dotloop_cli.py` defines `config`, `selftest`, `account`, `profiles`, `loops`, `participants`,
  `documents`, `activity`, `repl` and nothing else.
- `tests/test_core.py::TestGetOnly` greps every package source file for any HTTP method but GET —
  the exact regex `cli-anything-zoho`'s own test uses — and asserts `--help` never carries the
  bare word `act`.
- Both OAuth exchanges (the one-time authorization-code consent, the repeatable refresh-token
  grant) live in `tools/`, outside the pip package, because both are POSTs by specification and
  this package's own tests would fail if a POST appeared inside it.

## Credentials — two separate steps, both Steven's

dotloop's OAuth is 3-legged (unlike Zoho's server-to-server refresh-only setup this repo already
has), so there are genuinely two steps, not one:

1. **One-time, interactive.** Register an app at dotloop's developer portal (client id, client
   secret, a redirect URI), then run `tools/exchange-auth-code.sh url`, open that URL in a
   browser, sign in to dotloop, approve access, and run
   `tools/exchange-auth-code.sh exchange <code>` with the code dotloop's redirect carried. This
   needs a real browser session and a real dotloop login — a HALT-list credential/account step
   (`CLAUDE.md`) no harness or cloud session can do. The result is `DOTLOOP_REFRESH_TOKEN`, saved
   into `~/.config/dotloop/.env` by hand.
2. **Repeatable, scriptable.** `tools/mint-access-token.sh` turns that refresh token into a
   short-lived access token whenever needed — the same shape as `cli-anything-zoho`'s
   `mint-access-token.sh`, and outside the package for the identical reason.

Neither script has ever run. No dotloop app, client id, secret, redirect URI or account exists in
any environment this was built in.

## Validation before it is trusted (from the connector spec pattern this repo already uses)

1. `cli-anything-dotloop --help | grep -qw act` finds nothing — done, mechanical, in
   `tests/test_core.py::TestGetOnly::test_no_act_verb_in_help`.
2. A named read recipe returns parseable JSON with a row/record, or an explicit empty-result
   object — done offline against synthetic bodies (`tests/test_core.py`); **never live**.
3. Every write HTTP method is absent from the package by construction, proven by a grep test —
   done.
4. Spot-check: its numbers match dotloop's own UI — **never run.** No account exists to check
   against.
5. No credential, cookie or client record ever appears in a log this harness writes — it logs
   nothing itself (there is nothing to log); a future sync task that calls it owns that log, the
   same split `cli-anything-zoho` and `cli-anything-lofty` already use.
6. **ECC-style security review** (Elena's lens), same three questions the browser-driven
   harnesses already answer, before this is enabled: what it can reach (one host,
   `api-gateway.dotloop.com`, HTTPS only, Bearer-token auth, GET only), what it stores (nothing —
   no cache, no local database; the `.env` file is the credential store every harness in this
   repo already uses), what a malicious response could make it do (nothing beyond mis-displaying
   a field — there is no write verb to redirect toward, and no shell/eval path in the response
   handling). **Not yet held** — record it the same way SkySlope/zipForms/publicfeeds gate on
   `CLI_ANYTHING_ECC_REVIEWED_AT`/`CLI_ANYTHING_TOS_REVIEWED_<GROUP>` before this harness is wired
   into a scheduled task.

## Known limitations

- Every response shape in `core/loops.py` is a best-effort guess pending the first live call —
  see "What is confirmed, what is not" above.
- No default PII-safe field selection at the request layer (unlike Zoho's `DEFAULT_FIELDS`,
  because dotloop's API does not appear to offer a sparse-fieldset query parameter the way Zoho
  CRM's `fields=` does) — protection is entirely at the output layer via `core/redact.py`, which
  reuses `cli-anything-zoho`'s exact hint list (`email`, `phone`, `mobile`, `street`, `fax`,
  `zip`, `ssn`, `address`) so every harness in this repo redacts the same way.
- No pagination convenience (`--all`/`--max-pages`, as Zoho's `leads list` has) because the exact
  paging parameter names are unconfirmed; `--param` exists instead so a user who knows dotloop's
  real parameter names (from its own docs, once reachable) can page by hand.
- Wired into `connect.sh`'s report loop the same way as the REST pair (lofty, zoho): listed in
  `CAH_PKGS` and in the "REST, not DOMShell" group (section 3) — proved with
  `bash -n connect.sh` and a `--dry-run` pass, R9 2026-09-27.
