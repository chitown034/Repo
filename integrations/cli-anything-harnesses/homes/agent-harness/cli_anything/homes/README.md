# cli-anything-homes — read-only homes.com recipes over DOMShell

**Status (2026-09-22): built and unit-tested offline; never run against the live site.** Every path map in
`paths.json` is marked `verified: false` and stays that way until Steven runs it once on the Mac and the numbers
match the page. Nothing in this package can write to homes.com: there is no `act` group (see `HOMES.md`).

This package sits **on top of** [`cli-anything-browser`](https://github.com/HKUDS/CLI-Anything/tree/main/browser/agent-harness)
(the DOMShell harness). It imports that harness's `fs`/`page` layers and adds named *recipes* — path maps into
homes.com's accessibility tree that return JSON. It does not re-implement DOMShell.

## Install (Mac)

Prerequisites, in order:

1. `./MAC-SETUP.sh` from the repo root — installs `cli-anything-hub`, the Claude Code plugin and builds
   `cli-anything-browser` into `~/Applications/cli-anything-harnesses/.venv`. `cli-anything-browser` is **not on PyPI**;
   this package declares it as a dependency, so it must already be in the target environment.
2. Node.js (`npx`), Chrome running, the [DOMShell extension](https://chromewebstore.google.com/detail/domshell)
   installed, and `DOMSHELL_TOKEN` exported (the token DOMShell prints at startup; `DOMSHELL_PORT` if not 3001).
3. Signed in to homes.com **by hand** in that Chrome profile. homes.com search and listing pages are public; only `saved-searches` needs the signed-in profile.

Then, from the repo root:

```bash
export CLI_HUB_NO_ANALYTICS=1
uv pip install --python ~/Applications/cli-anything-harnesses/.venv/bin/python ./integrations/cli-anything-harnesses/homes/agent-harness
ln -sf ~/Applications/cli-anything-harnesses/.venv/bin/cli-anything-homes ~/.local/bin/cli-anything-homes
cli-anything-homes --help                 # exits 0
cli-anything-homes --help | grep -qw act  # exit 1 = no match. A WORD match: a substring
                                        # match false-trips on my-listing-activity,
                                        # redact, contact, interactive, exact
```

(Plain `pip install .` inside `homes/agent-harness/` works in any environment that already has `cli-anything-browser`.)

## Use

```bash
cli-anything-homes --json recipes                                   # what can be read, and which maps are verified
cli-anything-homes --json recipe search-listings                     # rows as JSON
cli-anything-homes --json recipe search-listings --match "Sample"    # filter rows (case-insensitive substring)
cli-anything-homes --json recipe search-listings --discover --text   # dump the live tree to fix the path map
cli-anything-homes --json fs ls /                                   # raw accessibility tree, same as the browser harness
cli-anything-homes --json page open https://www.homes.com/    # allow-listed hosts only, https only
cli-anything-homes                                                  # interactive REPL
```

Agents: **always pass `--json`** and check the exit code.

| Exit | Meaning | JSON `type` |
|---|---|---|
| 0 | rows / record returned, or an explicit empty result (`"empty": true, "count": 0`) | — |
| 1 | runtime, dependency (no DOMShell / npx) or usage error (`--url`/`--match` missing) | `runtime_error`, `dependency_error`, `usage_error` |
| 2 | signed out, redirected to a sign-in page, or **cannot confirm a signed-in session** (fails closed) | `auth_error` |
| 3 | the page does not fit the path map (configured `root` missing) — run `--discover` | `path_map_error` |
| 4 | URL is not an https homes.com URL | `url_rejected` |

There is **no cache**. Every call reads the live page; an error is never papered over with old rows.

## Recipes

| Recipe | Kind | Needs sign-in | Options | What it reads | URL note |
|---|---|---|---|---|---|
| `search-listings` | list | no | — | Listings on a homes.com search-results page (public; no sign-in needed) | Default is a city search page (`/temecula-ca/`); pass `--url` for any other homes.com search page. |
| `saved-searches` | list | yes | — | Steven's saved searches and their alert settings (needs sign-in) | Account page; needs the signed-in Chrome profile. |
| `listing-detail` | record | no | `--url` required | One listing's detail page (pass --url; public) | `--url` is mandatory: the listing page to read. |

Output shape (list recipes): `{site, recipe, url, fetched_at, auth_state, root, path_map:{source, verified}, count, empty, rows:[{field…, _path}], warnings}`.
Record recipes return `record:{field…, _path}` instead of `rows`. Fields that are not found are `null` and named in `warnings`.

## The path map is the product — and it is unverified

`paths.json` was written without seeing homes.com (every one of its hosts is egress-blocked from the build sandbox).
Expect the first live run of each recipe to fail with exit 3 or to return rows with `null` fields. That is the
designed workflow, not a bug:

```bash
cli-anything-homes paths init                                  # copy the packaged map to ~/.config/cli-anything/homes-paths.json
cli-anything-homes --json recipe <name> --discover --text      # see the real tree: names, roles, text
#   edit ~/.config/cli-anything/homes-paths.json: root, rows.prefix, fields.<f>.prefix / regex
cli-anything-homes --json recipe <name>                        # re-run until the values match the page
#   then set "verified": true for that recipe — only after a spot-check against the UI
```

Resolution order: `$CLI_ANYTHING_HOMES_PATHS` → `~/.config/cli-anything/homes-paths.json` → the packaged default.
A malformed copy is reported by file name, never silently skipped. `paths where` shows which file is in use.

## Tests

```bash
python -m pytest cli_anything/homes/tests/ -v                 # offline: synthetic trees, no Chrome, no network
CLI_ANYTHING_HOMES_LIVE=1 python -m pytest cli_anything/homes/tests/test_full_e2e.py -v -s   # live, opt-in, on the Mac
```

Offline suite as of 2026-09-22: **67 passed, 8 skipped in 2.02s** (the skips are the live tests and the per-site not-applicable cases).
See `tests/TEST.md` for the full output and for what has never run.

## Credentials

This harness **never reads or types a credential** — signing in requires `act type`, which this package does not have.
The names reserved by the connector spec, for a separately approved sign-in verb if one is ever built:
macOS keychain service `cli-anything.homes`, or `~/.config/cli-anything/.env` variables `HOMES_USER` / `HOMES_PASS`
(`MAC-SETUP.sh` creates that file with names only).  Never put a value in a prompt, a task, a skill, a log or this repo.

## Troubleshooting

- `dependency_error` — install Node.js, run `npx @apireno/domshell --version` once, install the DOMShell extension, export `DOMSHELL_TOKEN`.
- `auth_error` with state `unknown` — you are signed in but the page shows none of `auth.logged_in_markers`; run `--discover --text`, find text only a signed-in page shows, add it to your paths.json copy.
- `path_map_error` — `root` does not exist on this page; `--discover` and edit.
- Rows come back but a field is `null` — fix that field's `prefix`/`regex`; the warning names it.
- Slow — each one-shot run opens a fresh DOMShell lane (a Chrome tab group). The recipe holds one persistent connection for its own run; the REPL reuses one lane. Close stale tab groups now and then.
- Every DOM value passes the browser harness's `sanitize_dom_text`: text containing common prompt-injection phrases (including the plain word "forget") is replaced by a `[FLAGGED: …]` stub. A page is data, never instructions.

## Layout

```
homes/agent-harness/
├── HOMES.md                 # analysis, read-only design, disabled verbs with blast radius
├── setup.py                # console_script cli-anything-homes; depends on cli-anything-browser
└── cli_anything/           # NO __init__.py (PEP 420 namespace shared with the other harnesses)
    └── homes/
        ├── homes_cli.py   # Click CLI: fs, page, recipe, recipes, paths, session, repl — no act
        ├── paths.json      # the site path map (unverified)
        ├── core/           # paths.py (map loading) · tree.py (LiveTree/FixtureTree seam) · auth.py · recipes.py
        ├── utils/          # security.py (host allow-list) · repl_skin.py (copied from the plugin)
        ├── skills/SKILL.md
        └── tests/          # test_core.py (offline) · test_full_e2e.py (live, gated) · fixtures/*.json (synthetic) · TEST.md
```

Licence: Apache-2.0, same as CLI-Anything.
