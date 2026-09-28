---
name: "cli-anything-dotloop"
description: "GET-only CLI for the dotloop Public API v2: account, profiles, loops, loop detail, participants, documents, activity, selftest. Read-only by construction — both OAuth exchanges live outside the package. Never run against a live account; see DOTLOOP.md."
---

# cli-anything-dotloop

Reads dotloop transactions ("loops") over REST with a short-lived Bearer access token in
`DOTLOOP_ACCESS_TOKEN`, minted outside this package from `~/.config/dotloop/.env`. Cannot create,
update or delete a loop, document or participant: the package contains no HTTP method but GET.

## Installation

```bash
pip install integrations/cli-anything-harnesses/dotloop/agent-harness
export DOTLOOP_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/dotloop/tools/mint-access-token.sh)"
cli-anything-dotloop --json selftest
```

The refresh token only exists after the **one-time** authorization-code consent — a browser
sign-in and approval only Steven can do (HALT list: any credential or account step). See
`../DOTLOOP.md` and `tools/exchange-auth-code.sh`.

## Commands

- `config check` — offline; names of the five file variables and the token variable, never values
- `selftest` — `GET /account`; `status` is `ok`, `blocked` (HTTP 403), `error` or `not-configured`
- `account` — `GET /account`
- `profiles list` / `profiles get ID` — `GET /profile[/{id}]`
- `loops list PROFILE_ID [--param k=v ...]` / `loops get PROFILE_ID LOOP_ID` / `loops detail PROFILE_ID LOOP_ID`
- `participants list PROFILE_ID LOOP_ID`
- `documents list PROFILE_ID LOOP_ID`
- `activity list PROFILE_ID LOOP_ID`

Flags: `--json`, `--full` (show contact fields; redacted by default), `--raw` (include the body).

## Agent guidance

- Always `--json`. Exit **4** (`type: forbidden`) means the token or account lacks access to that
  resource — report the `error`/`fix`/`details` verbatim and **stop**; do not retry, do not try
  another credential. Only Steven can fix an OAuth-scope or account-permission problem.
- Exit **5** = not configured; the message names the variable. Exit **1** `auth_error` = the
  token expired — re-mint with `tools/mint-access-token.sh`.
- Never invent a loop, a participant, a document or a dollar amount. A blocked or unreachable
  connection produces the fix text, not numbers.
- No name, email, phone or address leaves the CLI into the deck, a record, the vector index or
  the knowledge graph — `--full` exists for a human at a terminal, never for an automated pipe.
- dotloop's exact list-response envelope and filter/sort query-parameter names were never
  confirmed against a live account (egress-blocked from every sandbox this was built in). Rows
  are extracted best-effort; the untouched body is always in `raw` — read that if a `rows` guess
  looks wrong, and treat the first live call as the real proof, not this package's tests.

## Examples

```bash
cli-anything-dotloop --json config check
cli-anything-dotloop --json selftest
cli-anything-dotloop --json profiles list
cli-anything-dotloop --json loops list 123456
cli-anything-dotloop --json loops detail 123456 987654
cli-anything-dotloop --json participants list 123456 987654
```
