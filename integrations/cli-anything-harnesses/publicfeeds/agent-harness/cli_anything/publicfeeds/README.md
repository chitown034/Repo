# cli-anything-publicfeeds — read-only market/rate/builder-page recipes over DOMShell

**Status (2026-09-24): built and unit-tested offline; never run against any live site; every one of the
three policy gates is closed.** All 8 recipes in `paths.json` are `verified: false`, and every recipe
also refuses to run (exit 3) until its `policy_group`'s terms-of-service review has a date — see
`PUBLICFEEDS.md`. Nothing in this package can write anywhere: there is no `act` group and, unlike
`cli-anything-homes`, no raw `fs`/`page` group either (see PUBLICFEEDS.md for why).

This package sits **on top of** [`cli-anything-browser`](https://github.com/HKUDS/CLI-Anything/tree/main/browser/agent-harness)
(the DOMShell harness), the same way `cli-anything-homes` does. It adds named *recipes* — path maps into
a page's accessibility tree that return JSON — for three unrelated categories of public page the Command
Deck depends on and that have no Composio toolkit and no usable API: Redfin market pages, lender-advertised
rate pages, and builder incentive pages.

## Install (Mac)

Same prerequisites as every other harness in this repo:

1. `./MAC-SETUP.sh` from the repo root — installs `cli-anything-hub`, the Claude Code plugin, the vendored
   `cli-anything-browser`, and this package, into one venv.
2. Node.js (`npx`), Chrome running, the [DOMShell extension](https://chromewebstore.google.com/detail/domshell)
   installed, and `DOMSHELL_TOKEN` exported.
3. **No sign-in needed for any recipe here** — every page this package reads is public.

Then, from the repo root (also covered by `MAC-SETUP.sh --only cli-anything-harnesses`):

```bash
export CLI_HUB_NO_ANALYTICS=1
uv pip install --python ~/Applications/cli-anything-harnesses/.venv/bin/python ./integrations/cli-anything-harnesses/publicfeeds/agent-harness
ln -sf ~/Applications/cli-anything-harnesses/.venv/bin/cli-anything-publicfeeds ~/.local/bin/cli-anything-publicfeeds
cli-anything-publicfeeds --help                 # exits 0
cli-anything-publicfeeds --help | grep -qw act  # exit 1 = no match (word match, not substring)
```

## Before running any recipe: the gate

```bash
cli-anything-publicfeeds --json gate status
```

Every group prints `disabled-by-policy` until Steven records that group's terms-of-service/robots.txt
answer. Nothing here opens a live page before then — the gate is checked before the DOMShell dependency
check, so a closed gate never even tries to reach Chrome.

## Use (once a group's gate is open)

```bash
cli-anything-publicfeeds --json recipes                                        # what can be read, gate state per recipe
cli-anything-publicfeeds --json recipe temecula-market                          # record as JSON
cli-anything-publicfeeds --json recipe temecula-market --discover --text        # dump the live tree to fix the path map
cli-anything-publicfeeds --json recipe veterans-united-va-rates                 # rows as JSON
cli-anything-publicfeeds                                                        # interactive REPL
```

Agents: **always pass `--json`** and check the exit code.

| Exit | Meaning | JSON `type` |
|---|---|---|
| 0 | rows / record returned, or an explicit empty result (`"empty": true, "count": 0`) | — |
| 1 | runtime, dependency (no DOMShell / npx) or usage error | `runtime_error`, `dependency_error`, `usage_error` |
| 2 | redirected to a sign-in page, or otherwise cannot confirm the page is what it should be (fails closed) | `auth_error` |
| 3 | **that recipe's policy group is disabled-by-policy** — run `gate status`, get the review, set the env var | `policy_gate` |
| 4 | the page does not fit the path map (configured `root` missing) — run `--discover` | `path_map_error` |
| 5 | URL is not on this package's allow-listed hosts, or not https | `url_rejected` |

There is **no cache**. Every call reads the live page; an error is never papered over with old rows.

## Recipes

| Recipe | Kind | Policy group | Writes into | URL note |
|---|---|---|---|---|
| `temecula-market` | record | marketpages | `ratesSnapshot.markets[]` | Stable `/city/19701/...` URL |
| `murrieta-market` | record | marketpages | `ratesSnapshot.markets[]` | Stable `/city/12866/...` URL |
| `san-diego-county-market` | record | marketpages | `ratesSnapshot.markets[]` | **Monthly blog-post URL — re-point every month** |
| `veterans-united-va-rates` | list | lenderrates | `ratesSnapshot.rates[]` | Public VA rate table |
| `navy-federal-rates` | list | lenderrates | `ratesSnapshot.rates[]` | Public mortgage rate table |
| `drhorton-menifee-spring-creek` | record | builderpages | `liveFeeds.feeds.builderIncentiveLiveList` | One named community |
| `lennar-san-diego-promo` | record | builderpages | `liveFeeds.feeds.builderIncentiveLiveList` | **Seasonal promo-slug URL — re-point each campaign** |
| `richmond-american-sommers-bend` | record | builderpages | `liveFeeds.feeds.builderIncentiveLiveList` | **URL is a guess (the site homepage) — find the real community page with `--discover` first** |

None of the raw extracted field names (`medianPrice`, `program`, `rate_terms`, …) is the exact shape the
Command Deck's documents expect — mapping this package's output into `ratesSnapshot` / `liveFeeds`'
`{v:{...}}` shape, with a `source: "cli-anything:<target>"` stamp, is the `cli-anything-feeds` Mac task's
job (`integrations/mac-task-specs.md`), not this CLI's.

## The path map is the product — and it is unverified

`paths.json` was written without seeing any of these six hosts (all egress-blocked from the build
sandbox). Expect the first live run of each recipe to fail with exit 4 or to return a record/rows with
`null` fields. That is the designed workflow:

```bash
cli-anything-publicfeeds paths init                                       # copy the packaged map for editing
cli-anything-publicfeeds --json recipe <name> --discover --text           # see the real tree: names, roles, text
#   edit ~/.config/cli-anything/publicfeeds-paths.json: root, rows.prefix, fields.<f>.prefix / regex
cli-anything-publicfeeds --json recipe <name>                             # re-run until the values match the page
#   then set "verified": true for that recipe — only after a spot-check against the UI
```

## Tests

```bash
python -m pytest cli_anything/publicfeeds/tests/ -v
```

See `tests/TEST.md` for the full output and for what has never run (everything live, by construction —
every gate is closed and no host has ever been reached).

## Layout

```
publicfeeds/agent-harness/
├── PUBLICFEEDS.md            # analysis, the three ToS questions, disabled verbs, design notes
├── setup.py
└── cli_anything/             # NO __init__.py (PEP 420 namespace shared with the other harnesses)
    └── publicfeeds/
        ├── publicfeeds_cli.py   # Click CLI: gate, recipe, recipes, paths, repl — no act, no fs, no page
        ├── paths.json           # the 8-recipe path map (unverified)
        ├── core/                # paths.py · tree.py (LiveTree/FixtureTree seam) · auth.py · recipes.py
        │                        # · target.py (the 3 policy groups) · policy.py (the gate)
        ├── utils/               # security.py (host allow-list) · repl_skin.py (copied from the plugin)
        └── tests/               # test_core.py (offline) · fixtures/*.json (synthetic) · TEST.md
```

Licence: Apache-2.0, same as CLI-Anything.
