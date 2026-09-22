# cli-anything-zoho — GET-only REST harness for Zoho CRM

A CLI-Anything harness for **Zoho CRM**, Steven's mortgage system of record, over the v8 REST
API. It is a REST client, not a browser wrapper. **GET only** — no POST, PUT, PATCH or DELETE
exists in this package, and a test greps for them. Because of that, the OAuth access token is
minted *outside* the package (`../../tools/mint-access-token.sh`, a POST by specification) and
handed in as `ZOHO_ACCESS_TOKEN` for one hour. Nothing stores a token.

**The known blocker, surfaced by name.** Every Zoho CRM call today returns HTTP 403
`NO_PERMISSION` / `Crm_Implied_Api_Access` (re-probed 2026-09-22 13:35 UTC on an ACTIVE
connection) because the profile-level "Zoho CRM API Access" toggle is off. This CLI reports that
as **"profile permission not granted — this is a Zoho-side setting, not a credential problem"**,
with the click path, exit code 4, and never retries into it.

**Status: built and unit-tested offline. Never run against Zoho.**

## Install

```bash
VENV="$HOME/Applications/CLI-Anything/.venv"
"$VENV/bin/pip" install integrations/cli-anything-harnesses/zoho/agent-harness
"$VENV/bin/cli-anything-zoho" --help
```

## Configure (names only — never paste a value into a prompt)

`~/.config/zoho/.env` on the Mac, `chmod 600` (the layout the `zoho-crm-sync` skill documents):

```
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com   # .eu / .in / .com.au if the org lives elsewhere
ZOHO_API_URL=https://www.zohoapis.com
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=                           # scopes: ZohoCRM.modules.ALL,ZohoCRM.settings.READ
```

Then, once an hour, in the shell that will run the CLI:

```bash
export ZOHO_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh)"
```

A missing file, an empty variable or a missing `ZOHO_ACCESS_TOKEN` → `not configured`, exit 5,
naming what is missing. Never a stack trace, never an empty "success".

## Commands

| Command | What it does | Exit on the 403 block |
|---|---|---|
| `config check` | Which variables are set — names only, offline | — |
| `selftest` | The sync skill's self-test: one Leads record → `status` `ok` / `blocked` / `error` / `not-configured` | 4, `status: blocked`, exact `fix` |
| `leads list [--all] [--fields …] [--per-page N] [--page-token T]` | `GET /crm/v8/Leads` | 4 |
| `leads get ID` | `GET /crm/v8/Leads/{id}` | 4 |
| `deals list …` / `deals get ID` | `GET /crm/v8/Deals…` | 4 |
| `fields MODULE` | `GET /crm/v8/settings/fields?module=…` | 4 |
| `repl` | Interactive session (default when no subcommand) | — |

Global flags: `--json` (always, from an agent), `--full` (do not redact email/phone/address —
redacted by default; the default field sets do not request them at all), `--raw` (include the
untouched body).

Exit codes: `0` ok · `1` API, transport or argument error · `2` usage · `4` profile permission not
granted · `5` not configured.

## Tests

```bash
python -m pytest cli_anything/zoho/tests -v
```

Offline: `requests.get` is patched at the backend; every record is invented. `tests/TEST.md`
separates what ran from what has never run.
