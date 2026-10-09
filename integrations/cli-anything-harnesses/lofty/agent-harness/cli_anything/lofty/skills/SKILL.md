---
name: "cli-anything-lofty"
description: "GET-only CLI for Lofty CRM's Open API: leads list, lead get, stage totals, activity timeline. Read-only by construction (no write HTTP method exists). lofty-bridge on the Mac remains the primary path."
---

# cli-anything-lofty

Reads Lofty through its Open API with the key in `~/.config/lofty/.env` (`LOFTY_API_KEY`).
Cannot create, update or delete anything: the package contains no HTTP method but GET.

## Installation

```bash
pip install integrations/cli-anything-harnesses/lofty/agent-harness
cli-anything-lofty --help
```

## Commands

- `config check` — offline; is `LOFTY_API_KEY` configured (never the value)
- `me` — `GET /v1.0/me`, the self-test
- `leads list [--page N] [--page-size N] [--param k=v]`
- `leads get ID`
- `leads stage-totals [--max-pages N] [--stage-field F]`
- `leads timeline ID`

Flags: `--json`, `--full` (show contact fields; redacted by default), `--raw` (include the body).

## Agent guidance

- Always `--json`. Run `config check` first; `configured: false` means stop and report
  "not connected yet" — never substitute another CRM's numbers, never invent a lead.
- Exit 5 = not configured (names the variable). Exit 1 with `type: auth_error` = the key was
  rejected: report it, do not try another credential.
- `stageTotals` are Lofty's own stage names in Lofty's own order; never remap them.
- `truncated: true` means `--max-pages` was hit; say so rather than presenting a partial total.
- No phone, email or street address leaves the CLI into a deck, a record, the vector index or
  the knowledge graph. Names on the deck are first name + last initial.
- The `lofty-bridge` MCP is the primary path on the Mac; use this CLI when a shell command is
  what the task needs.

## Examples

```bash
cli-anything-lofty --json config check
cli-anything-lofty --json me
cli-anything-lofty --json leads stage-totals --max-pages 5
cli-anything-lofty --json --raw leads list --page-size 5     # first live run: see the real shape
```
