# LOFTY.md — analysis, SOP and the honest state of this harness

Written 2026-09-22 by H2 (Integration Engineer). Read with `CLAUDE.md`'s HALT list.

## What this is, and what it is not

`cli-anything-lofty` is a CLI-Anything harness in the HARNESS.md package shape (namespace package
`cli_anything.lofty`, console script `cli-anything-lofty`, Click + REPL, `--json` everywhere) whose
backend is Lofty's **REST Open API**, not a browser. This is deliberate and matches S1's standing
call: Lofty has a documented API (`api.lofty.com/v1.0`, `Authorization: token <key>`), and
`lofty-bridge` MCP + `lofty-cli` are already installed and connected on the Mac. A DOMShell wrapper
would be more fragile, break on any UI change and need a logged-in session instead of a key.

**`lofty-bridge` remains the primary Lofty path.** This package is the CLI-Anything-shaped front to
the same API — the same key file, the same endpoints — for agents and shell scripts that want a
command rather than an MCP call. It is not a second credential location and not a second source of
truth.

## Read-only by construction

- The only HTTP call site is `requests.get` in `utils/lofty_backend.py`. No POST, PUT, PATCH or
  DELETE, no `requests.Session`, no `urllib`, no `httpx` appear anywhere in the package.
  `tests/test_core.py::TestGetOnly` greps every source file for those and fails the build if one
  appears.
- The write verbs the connectors skill lists for Lofty — `lead create / update / stage change`,
  `note add / task create`, `text send / email send` — are therefore not "disabled"; they are
  impossible from this package. Their blast radius, for the record: a corrupted system of record
  and a corrupted speed-to-lead metric; a polluted record Steven and the ISA both read; outbound
  consumer messaging with TCPA/consent exposure that reaches a client. Each is an L2 proposal, not
  built, and would need a different package.

## Recipes (from the connectors spec)

| Recipe | Endpoint | Notes |
|---|---|---|
| `me` | `GET /v1.0/me` | The self-test the `lofty-crm-sync` skill specifies: 200 → the key works |
| `leads list` | `GET /v1.0/leads` | One page; `--param` passes any extra query parameter |
| `leads get ID` | `GET /v1.0/leads/{id}` | Id is validated as a plain identifier before any request |
| `leads stage-totals` | pages of `GET /v1.0/leads` | Counts per Lofty stage, Lofty's own names, frequency order; `truncated` when `--max-pages` is hit |
| `leads timeline ID` | `GET /v1.0/leads/{id}/activities` | Coverage caveat carried in the output: contact made outside Lofty is invisible here |

## Credentials — names only

`~/.config/lofty/.env`, variable `LOFTY_API_KEY`, generated at Lofty → Settings → Integrations →
API (`CONNECTIONS.md` rule 5: one location, named after the tool that reads it). `LOFTY_API_KEY`
in the process environment is the cloud fallback the sync skill documents. `LOFTY_ENV_FILE`
overrides the file location (tests, odd layouts); `LOFTY_API_URL` overrides the base URL.

A missing file, a missing variable or an empty value yields `not configured`, exit **5**, naming
`LOFTY_API_KEY` and the file — never a stack trace and never an empty success. The key is never
printed; if a server ever echoes it back inside an error body, the backend redacts it before the
message is built (tested).

## Error contract

| Condition | `type` | Exit | Behaviour |
|---|---|---|---|
| no key | `not_configured` | 5 | names the variable and file; no request made |
| 401 / 403 | `auth_error` | 1 | verbatim snippet, key redacted; no second credential tried |
| 404 | `not_found` | 1 | |
| 429 | `rate_limited` | 1 | reported, **never retried** — the account is Steven's licence |
| 5xx / non-JSON | `upstream_error` | 1 | |
| DNS / TLS / timeout | `transport_error` | 1 | |

## What is unverified — say it plainly

Nothing in this package has ever been run against Lofty. `LOFTY_API_KEY` has never existed in any
environment this was built or reviewed in, and no Lofty pull has ever succeeded through the bridge
either (CONNECTIONS.md, 2026-09-22). Concretely unverified:

- **Pagination parameter names.** `core/leads.py` sends `pageNum` / `pageSize` (one place,
  `PAGINATION`). If Lofty uses other names the API will ignore or reject them; `--param k=v`
  passes the right ones through until the constant is corrected.
- **Response envelope.** `extract_rows` accepts a bare list or the first list under `leads`,
  `activities`, `data`, `items`, `records`, `results`, `list` (also one level under `data`).
  `--raw` prints the untouched body; `bodyKeys` is always reported.
- **The stage field.** Auto-detected among `stage`, `leadStage`, `stageName`, `pipelineStage`,
  `status`; `--stage-field` overrides.

First live run, on the Mac: `config check` → `me` → `--raw leads list --page-size 5` → read the
shape → correct `PAGINATION` / `STAGE_KEYS` if needed → `stage-totals`.

## PII

Contact fields (phone, email, address, street, ssn, mobile, cell, zip, fax) are redacted in the
CLI's output by default; `--full` shows them for a human at the terminal. Nothing from this CLI is
to be written to the deck beyond first name + last initial, stage and dates; nothing enters the
vector index or the knowledge graph.

## HALT conditions

Any write to Lofty requested; the key missing or rejected (report, do not try another credential
or another CRM); a lead set that drops by more than half against the last good run (report before
anyone overwrites good numbers); any Lofty figure presented as another CRM's or vice versa.
