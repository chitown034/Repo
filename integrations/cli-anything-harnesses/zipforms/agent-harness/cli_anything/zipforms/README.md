# cli-anything-zipforms — read-only, ECC-gated zipForms harness

A CLI-Anything harness for **zipForms / Lone Wolf Transactions (zipForm Edition)** built on
`cli-anything-browser` (DOMShell). It reads; it cannot write. There is no `act` group — nothing
here can fill, click, type, download, send or sign — and every command that touches the live site
is refused unless the ECC security review has a sign-off date in `CLI_ANYTHING_ECC_REVIEWED_AT`.

**Status: built and unit-tested offline. Never run against zipForms.** The path map is a
best-effort guess (see `ZIPFORMS.md`).

## Prerequisites (hard, in this order)

1. Python 3.10+.
2. **`cli-anything-browser`** — not on PyPI. Built from the CLI-Anything clone; on the Mac
   `MAC-SETUP.sh` puts it in `$HOME/Applications/CLI-Anything/.venv`. Install this harness into
   that same venv.
3. Node/npx, Chrome and the DOMShell extension, with `DOMSHELL_TOKEN` (and `DOMSHELL_PORT`) set
   as the browser harness documents. Chrome must already be signed in to zipForms.
4. The ECC review sign-off date: `export CLI_ANYTHING_ECC_REVIEWED_AT=YYYY-MM-DD`. Without it
   every live command exits 3 with the reason.

## Install

```bash
VENV="$HOME/Applications/CLI-Anything/.venv"
"$VENV/bin/pip" install "$HOME/Applications/CLI-Anything/browser/agent-harness"   # if not already built
"$VENV/bin/pip" install integrations/cli-anything-harnesses/zipforms/agent-harness
"$VENV/bin/cli-anything-zipforms" --help
```

## Commands

| Group | Commands | Touches the site? |
|---|---|---|
| `gate status` | Is the ECC gate open, and why not | no |
| `verbs` | Read verbs that exist; write verbs deliberately absent, with blast radius | no |
| `paths show` / `paths validate` | The path map and its offline schema check | no |
| `recipe form-index` | List forms (names only) | yes — gated |
| `recipe form-detail --id ID` | One form's on-screen summary; never fills | yes — gated |
| `recipe packet-index` | List packets (names only); never sends | yes — gated |
| `discover [--url URL]` | Dump the live tree (bounded) to correct `paths.json` | yes — gated |
| `fs ls\|cat\|grep\|pwd` | Raw accessibility-tree reads | yes — gated |
| `page open\|info\|reload\|back\|forward` | Navigation; `open` accepts allow-listed hosts only | yes — gated |
| `repl` | Interactive session (default when no subcommand) | — |

Always pass `--json` from an agent. Exit codes: `0` ok · `1` runtime/dependency/recipe error ·
`2` usage · `3` disabled-by-policy (gate closed).

## First live run (on the Mac, after the ECC sign-off)

```bash
export CLI_ANYTHING_ECC_REVIEWED_AT=2026-MM-DD          # the real sign-off date
cli-anything-zipforms --json gate status
cli-anything-zipforms --json discover --url https://www.zipformplus.com/ --max-depth 3
# edit cli_anything/zipforms/paths.json (or a copy passed with --paths / $CLI_ANYTHING_ZIPFORMS_PATHS)
cli-anything-zipforms paths validate
cli-anything-zipforms --json recipe form-index
```

## Tests

```bash
python -m pytest cli_anything/zipforms/tests -v
```

Offline: DOMShell is mocked at the harness seam, fixtures are synthetic. `tests/TEST.md` separates
what ran from what has never run.
