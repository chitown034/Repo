# cli-anything-lofty — GET-only REST harness for Lofty

A CLI-Anything harness for **Lofty** (formerly Chime), Steven's real-estate CRM. It is a REST
client, not a browser wrapper: Lofty has a documented Open API (`https://api.lofty.com/v1.0`,
`Authorization: token <key>`) and a browser path would be strictly worse. **GET only** — no
POST, PUT, PATCH or DELETE exists in this package, and a test greps for them.

**The `lofty-bridge` MCP on the Mac remains the primary Lofty path.** This CLI is the
CLI-Anything-shaped front to the same API for agents and shell scripts.

**Status: built and unit-tested offline. Never run against Lofty** — `LOFTY_API_KEY` has never
been present anywhere this was built, and no pull has ever succeeded through any path.

## Install

```bash
VENV="$HOME/Applications/cli-anything-harnesses/.venv"
"$VENV/bin/pip" install integrations/cli-anything-harnesses/lofty/agent-harness
"$VENV/bin/cli-anything-lofty" --help
```

## Configure (names only — never paste a value into a prompt)

`~/.config/lofty/.env` on the Mac, `chmod 600`:

```
LOFTY_API_KEY=            # Lofty → Settings → Integrations → API
```

`LOFTY_API_KEY` in the process environment is the documented cloud fallback. Missing or empty
either way → `not configured`, exit 5, naming the variable and the file. Never a stack trace,
never an empty "success".

## Commands

| Command | What it does | Network |
|---|---|---|
| `config check` | Is the key configured — names and locations only | no |
| `me` | `GET /v1.0/me` — the self-test that proves the key works | GET |
| `leads list [--page N] [--page-size N] [--param k=v]` | One page of `GET /v1.0/leads` | GET |
| `leads get ID` | `GET /v1.0/leads/{id}` | GET |
| `leads stage-totals [--max-pages N] [--stage-field F]` | Leads per Lofty stage across pages | GET |
| `leads timeline ID` | `GET /v1.0/leads/{id}/activities` | GET |
| `repl` | Interactive session (default when no subcommand) | — |

Global flags: `--json` (always, from an agent), `--full` (do not redact phone/email/address —
they are redacted by default), `--raw` (include the untouched response body — use it on the first
live run to see the real shape).

Exit codes: `0` ok · `1` API, transport or argument error · `2` usage · `5` not configured.

## What is unverified

The response shapes and the pagination parameter names (`pageNum` / `pageSize`) could not be
confirmed from the build sandbox. Row extraction is tolerant, `--param` passes anything through,
and `--raw` shows the body. See `LOFTY.md`.

## Tests

```bash
python -m pytest cli_anything/lofty/tests -v
```

Offline: `requests.get` is patched at the backend; every lead is invented. `tests/TEST.md`
separates what ran from what has never run.
