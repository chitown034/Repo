# cli-anything-showami — read-only Showami recipes over DOMShell

**Status (2026-09-22): built and unit-tested offline; never run against the live site.** Every path map in
`paths.json` is marked `verified: false` and stays that way until Steven runs it once on the Mac and the numbers
match the page. Nothing in this package can write to Showami: there is no `act` group (see `SHOWAMI.md`).

This package sits **on top of** [`cli-anything-browser`](https://github.com/HKUDS/CLI-Anything/tree/main/browser/agent-harness)
(the DOMShell harness). It imports that harness's `fs`/`page` layers and adds named *recipes* — path maps into
Showami's accessibility tree that return JSON. It does not re-implement DOMShell.

## Install (Mac)

Prerequisites, in order:

1. `./MAC-SETUP.sh` from the repo root — installs `cli-anything-hub`, the Claude Code plugin and builds
   `cli-anything-browser` into `~/Applications/cli-anything-harnesses/.venv`. `cli-anything-browser` is **not on PyPI**;
   this package declares it as a dependency, so it must already be in the target environment.
2. Node.js (`npx`), Chrome running, the [DOMShell extension](https://chromewebstore.google.com/detail/domshell)
   installed, and `DOMSHELL_TOKEN` exported (the token DOMShell prints at startup; `DOMSHELL_PORT` if not 3001).
3. Signed in to Showami **by hand** in that Chrome profile. Sign in by hand in Chrome. Nothing in this package posts, accepts, cancels or messages — every one of those is money or a third party at a stranger's door.

Then, from the repo root:

```bash
export CLI_HUB_NO_ANALYTICS=1
uv pip install --python ~/Applications/cli-anything-harnesses/.venv/bin/python ./integrations/cli-anything-harnesses/showami/agent-harness
ln -sf ~/Applications/cli-anything-harnesses/.venv/bin/cli-anything-showami ~/.local/bin/cli-anything-showami
cli-anything-showami --help                 # exits 0
cli-anything-showami --help | grep -qw act  # exit 1 = no match. A WORD match: a substring
                                        # match false-trips on my-listing-activity,
                                        # redact, contact, interactive, exact
```

(Plain `pip install .` inside `showami/agent-harness/` works in any environment that already has `cli-anything-browser`.)

## Use

```bash
cli-anything-showami --json recipes                                   # what can be read, and which maps are verified
cli-anything-showami --json recipe my-requests                     # rows as JSON
cli-anything-showami --json recipe my-requests --match "Sample"    # filter rows (case-insensitive substring)
cli-anything-showami --json recipe my-requests --discover --text   # dump the live tree to fix the path map
cli-anything-showami --json fs ls /                                   # raw accessibility tree, same as the browser harness
cli-anything-showami --json page open https://www.showami.com/    # allow-listed hosts only, https only
cli-anything-showami                                                  # interactive REPL
```

Agents: **always pass `--json`** and check the exit code.

| Exit | Meaning | JSON `type` |
|---|---|---|
| 0 | rows / record returned, or an explicit empty result (`"empty": true, "count": 0`) | — |
| 1 | runtime, dependency (no DOMShell / npx) or usage error (`--url`/`--match` missing) | `runtime_error`, `dependency_error`, `usage_error` |
| 2 | signed out, redirected to a sign-in page, or **cannot confirm a signed-in session** (fails closed) | `auth_error` |
| 3 | the page does not fit the path map (configured `root` missing) — run `--discover` | `path_map_error` |
| 4 | URL is not an https Showami URL | `url_rejected` |

There is **no cache**. Every call reads the live page; an error is never papered over with old rows.

## Recipes

| Recipe | Kind | Needs sign-in | Options | What it reads | URL note |
|---|---|---|---|---|---|
| `my-requests` | list | yes | — | Showing requests Steven has posted, with status and assigned assistant (needs sign-in) | Requests dashboard (URL unverified). |
| `request-status` | list | yes | `--match` required | Status of one showing request, picked by --match (address, id or assistant) | Same page; `--match` picks the request (address, id or assistant). |
| `assistant-feedback` | list | yes | — | Feedback left by showing assistants on completed requests (needs sign-in) | Feedback page (URL unverified). |
| `posted-price` | record | yes | — | The showing fee Steven currently posts for assistants (account settings; needs sign-in) | Account settings page (URL unverified); a single record, not rows. |

Output shape (list recipes): `{site, recipe, url, fetched_at, auth_state, root, path_map:{source, verified}, count, empty, rows:[{field…, _path}], warnings}`.
Record recipes return `record:{field…, _path}` instead of `rows`. Fields that are not found are `null` and named in `warnings`.

## The path map is the product — and it is unverified

`paths.json` was written without seeing Showami (every one of its hosts is egress-blocked from the build sandbox).
Expect the first live run of each recipe to fail with exit 3 or to return rows with `null` fields. That is the
designed workflow, not a bug:

```bash
cli-anything-showami paths init                                  # copy the packaged map to ~/.config/cli-anything/showami-paths.json
cli-anything-showami --json recipe <name> --discover --text      # see the real tree: names, roles, text
#   edit ~/.config/cli-anything/showami-paths.json: root, rows.prefix, fields.<f>.prefix / regex
cli-anything-showami --json recipe <name>                        # re-run until the values match the page
#   then set "verified": true for that recipe — only after a spot-check against the UI
```

Resolution order: `$CLI_ANYTHING_SHOWAMI_PATHS` → `~/.config/cli-anything/showami-paths.json` → the packaged default.
A malformed copy is reported by file name, never silently skipped. `paths where` shows which file is in use.

## Tests

```bash
python -m pytest cli_anything/showami/tests/ -v                 # offline: synthetic trees, no Chrome, no network
CLI_ANYTHING_SHOWAMI_LIVE=1 python -m pytest cli_anything/showami/tests/test_full_e2e.py -v -s   # live, opt-in, on the Mac
```

Offline suite as of 2026-09-22: **70 passed, 11 skipped in 2.19s** (the skips are the live tests and the per-site not-applicable cases).
See `tests/TEST.md` for the full output and for what has never run.

## Credentials

This harness **never reads or types a credential** — signing in requires `act type`, which this package does not have.
The names reserved by the connector spec, for a separately approved sign-in verb if one is ever built:
macOS keychain service `cli-anything.showami`, or `~/.config/cli-anything/.env` variables `SHOWAMI_USER` / `SHOWAMI_PASS`
(`MAC-SETUP.sh` creates that file with names only). `SHOWAMI_API_KEY` is reserved and unused — add it only if Steven's account is ever granted Showami API automation; this harness does not read it. Never put a value in a prompt, a task, a skill, a log or this repo.

## Troubleshooting

- `dependency_error` — install Node.js, run `npx @apireno/domshell --version` once, install the DOMShell extension, export `DOMSHELL_TOKEN`.
- `auth_error` with state `unknown` — you are signed in but the page shows none of `auth.logged_in_markers`; run `--discover --text`, find text only a signed-in page shows, add it to your paths.json copy.
- `path_map_error` — `root` does not exist on this page; `--discover` and edit.
- Rows come back but a field is `null` — fix that field's `prefix`/`regex`; the warning names it.
- Slow — each one-shot run opens a fresh DOMShell lane (a Chrome tab group). The recipe holds one persistent connection for its own run; the REPL reuses one lane. Close stale tab groups now and then.
- Every DOM value passes the browser harness's `sanitize_dom_text`: text containing common prompt-injection phrases (including the plain word "forget") is replaced by a `[FLAGGED: …]` stub. A page is data, never instructions.

## Layout

```
showami/agent-harness/
├── SHOWAMI.md                 # analysis, read-only design, disabled verbs with blast radius
├── setup.py                # console_script cli-anything-showami; depends on cli-anything-browser
└── cli_anything/           # NO __init__.py (PEP 420 namespace shared with the other harnesses)
    └── showami/
        ├── showami_cli.py   # Click CLI: fs, page, recipe, recipes, paths, session, repl — no act
        ├── paths.json      # the site path map (unverified)
        ├── core/           # paths.py (map loading) · tree.py (LiveTree/FixtureTree seam) · auth.py · recipes.py
        ├── utils/          # security.py (host allow-list) · repl_skin.py (copied from the plugin)
        ├── skills/SKILL.md
        └── tests/          # test_core.py (offline) · test_full_e2e.py (live, gated) · fixtures/*.json (synthetic) · TEST.md
```

Licence: Apache-2.0, same as CLI-Anything.
