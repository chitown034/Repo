---
name: "cli-anything-zoho"
description: "GET-only CLI for Zoho CRM v8: leads list, lead get, deals list, module fields, selftest. Read-only by construction; reports the 403 NO_PERMISSION block as a profile permission not granted (a Zoho-side setting, not a credential problem) with the click path, and never retries into it."
---

# cli-anything-zoho

Reads Zoho CRM over REST with a one-hour access token in `ZOHO_ACCESS_TOKEN`, minted outside this
package from `~/.config/zoho/.env`. Cannot create, update or delete a record: the package contains
no HTTP method but GET.

## Installation

```bash
pip install integrations/cli-anything-harnesses/zoho/agent-harness
export ZOHO_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh)"
cli-anything-zoho --json selftest
```

## Commands

- `config check` — offline; names of the five file variables and the token variable, never values
- `selftest` — one Leads record; `status` is `ok`, `blocked` (the 403 profile block), `error` or
  `not-configured`, in the `zohoSync` vocabulary the sync skill writes
- `leads list [--all] [--fields a,b] [--per-page N] [--page-token T] [--max-pages N]`
- `leads get ID` · `deals list …` · `deals get ID`
- `fields MODULE` — field metadata (`api_name`, `field_label`, `data_type`, …)

Flags: `--json`, `--full` (show contact fields; redacted by default), `--raw` (include the body).

## Agent guidance

- Always `--json`. Exit **4** with `type: profile_permission_denied` means the profile toggle is
  off: report the `error` and `fix` verbatim and **stop**. Do not retry, do not try another
  credential, do not try Composio instead — it is the same block on the far side. Only Steven can
  flip the toggle (Setup → Security Control → Profiles → Developer Permissions → Zoho CRM API
  Access).
- Exit 5 = not configured; the message names the variable. Exit 1 `auth_error` with
  `zohoCode: INVALID_TOKEN` = the hour is up; re-mint.
- Never invent a lead, a deal, a stage count or a dollar total. A blocked connection produces
  the fix text, not numbers; the deck's Sep 14 paste stays labelled as a paste.
- Stage values are Zoho's own picklist text; mapping onto the deck's 14 stages (unknown →
  `UnAccounted`) is the sync task's job, not this CLI's.
- No phone, email or SSN leaves the CLI into the deck, a record, the vector index or the graph.

## Examples

```bash
cli-anything-zoho --json config check
cli-anything-zoho --json selftest
cli-anything-zoho --json leads list --per-page 50
cli-anything-zoho --json deals list --all --max-pages 5
cli-anything-zoho --json fields Deals
```
