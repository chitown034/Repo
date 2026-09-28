# cli-anything-dotloop — GET-only REST harness for the dotloop Public API v2

A CLI-Anything harness for **dotloop**, one of the nine systems on Steven's 2026-09-27 connect
list. It is a REST client, not a browser wrapper. **GET only** — no POST, PUT, PATCH or DELETE
exists in this package, and a test greps for them. Because of that, both OAuth exchanges happen
*outside* the package (`../../tools/exchange-auth-code.sh` for the one-time consent,
`../../tools/mint-access-token.sh` for the repeatable refresh) and the CLI only ever receives a
short-lived token through `DOTLOOP_ACCESS_TOKEN`. Nothing stores a token.

**What is confirmed, and how.** Base URL (`https://api-gateway.dotloop.com/public/v2`), the OAuth
2.0 3-legged flow (`https://auth.dotloop.com/oauth/authorize` -> `.../oauth/token`), the Bearer
auth header, and the documented rate limit (100 requests/minute/user) come from the third-party
API profile at `github.com/api-evangelist/dotloop`, read **2026-09-27**. dotloop's own developer
docs (`dotloop.github.io/public-api/`) could not be read directly this round — every attempt (that
host, and a CRMLS-terms attempt in the same session) hit this sandbox's egress proxy, the same
restriction `publicfeeds/PUBLICFEEDS.md` already records against Redfin, Veterans United, Navy
Federal and three builder sites. Endpoint paths below follow the resource names both sources
agree on (account, profile, loop, loop-detail, participant, document, activity); exact
query-parameter names for filtering/sorting/paging a loop list are **not guessed** — pass them
through with `--param key=value` in dotloop's own spelling.

**Status: built and unit-tested offline. Never run against dotloop — no account, no credential,
no live call, anywhere this was built.**

## Install

```bash
VENV="$HOME/Applications/cli-anything-harnesses/.venv"
"$VENV/bin/pip" install integrations/cli-anything-harnesses/dotloop/agent-harness
"$VENV/bin/cli-anything-dotloop" --help
```

## Configure (names only — never paste a value into a prompt)

`~/.config/dotloop/.env` on the Mac, `chmod 600`:

```
DOTLOOP_AUTH_URL=https://auth.dotloop.com
DOTLOOP_API_URL=https://api-gateway.dotloop.com/public/v2
DOTLOOP_CLIENT_ID=
DOTLOOP_CLIENT_SECRET=
DOTLOOP_REFRESH_TOKEN=
DOTLOOP_REDIRECT_URI=                         # only needed for the one-time exchange, below
```

`DOTLOOP_CLIENT_ID`/`DOTLOOP_CLIENT_SECRET`/`DOTLOOP_REDIRECT_URI` come from registering an app at
dotloop's developer portal — Steven's step. `DOTLOOP_REFRESH_TOKEN` exists only after the
one-time authorization-code consent:

```bash
integrations/cli-anything-harnesses/dotloop/tools/exchange-auth-code.sh url        # open this in a browser, sign in, approve
integrations/cli-anything-harnesses/dotloop/tools/exchange-auth-code.sh exchange <code>   # paste the code dotloop redirected back with
```

— also Steven's step (see `../DOTLOOP.md`). Then, whenever the access token expires:

```bash
export DOTLOOP_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/dotloop/tools/mint-access-token.sh)"
```

A missing file, an empty variable or a missing `DOTLOOP_ACCESS_TOKEN` -> `not configured`, exit 5,
naming what is missing. Never a stack trace, never an empty "success".

## Commands

| Command | What it does | Exit on 403 |
|---|---|---|
| `config check` | Which variables are set — names only, offline | — |
| `selftest` | `GET /account` -> `status` `ok` / `blocked` / `error` / `not-configured` | 4 |
| `account` | `GET /account` | 4 |
| `profiles list` / `profiles get ID` | `GET /profile[/{id}]` | 4 |
| `loops list PROFILE_ID [--param k=v]` / `loops get PROFILE_ID LOOP_ID` / `loops detail PROFILE_ID LOOP_ID` | `GET /profile/{id}/loop...` | 4 |
| `participants list PROFILE_ID LOOP_ID` | `GET .../participant` | 4 |
| `documents list PROFILE_ID LOOP_ID` | `GET .../document` | 4 |
| `activity list PROFILE_ID LOOP_ID` | `GET .../activity` | 4 |
| `repl` | Interactive session (default when no subcommand) | — |

Global flags: `--json` (always, from an agent), `--full` (do not redact email/phone/address —
redacted by default), `--raw` (include the untouched body).

Exit codes: `0` ok - `1` API, transport or argument error - `2` usage - `4` forbidden - `5` not
configured.

## Tests

```bash
python -m pytest cli_anything/dotloop/tests -v
```

Offline: `requests.get` is patched at the backend; every record, id and token is invented.
`tests/TEST.md` separates what ran from what has never run.
