# homes.com Harness: read-only recipes over DOMShell

Written 2026-09-22. **Nothing here has run against the live site.** Read `README.md` for install and use; this file
records the analysis, the design and what is deliberately absent.

## Purpose

homes.com has no usable API for an individual agent (see `.claude/skills/cli-anything-connectors/SKILL.md`). The only
path is the browser: DOMShell exposes Chrome's accessibility tree as a virtual filesystem, `cli-anything-browser`
wraps DOMShell, and this package wraps *that* with 3 named read recipes:
`search-listings`, `saved-searches`, `listing-detail`.

## Architecture

```
cli-anything-homes recipe <name> --json
        │
        ▼
core/recipes.py     path map (paths.json) → open URL → auth check → root → rows → fields → JSON
        │                                   (allow-listed)  (fails closed)   (prefix / regex)
        ▼
core/tree.py        TreeSource seam: LiveTree (Chrome via the browser harness) | FixtureTree (tests)
        │
        ▼
cli_anything.browser.core.fs / .page      ← cli-anything-browser, unchanged, imported not copied
        │
        ▼
cli_anything.browser.utils.domshell_backend → npx @apireno/domshell (MCP, stdio) → Chrome + DOMShell extension
```

Four read operations cross the seam: `open`, `ls`, `cat`, `grep`. That is the whole surface.

## Read-only by construction

The browser harness's write surface is exactly two commands: `act click` and `act type`. This package:

- has **no `act` group** — not disabled, absent. `homes_cli.py` defines `fs`, `page`, `recipe`, `recipes`,
  `paths`, `session`, `repl` and nothing else;
- never imports `domshell_backend.click` or `type_text` (`tests/test_core.py::TestHelpSurface::test_source_never_references_write_backend` scans the package for both);
- asserts, in `test_act_absent_from_every_help_page`, that the token `act` appears in no `--help` page at any level
  (token-level, because the spec recipe name `my-listing-activity` contains the substring);
- exposes `session status` only — no `daemon-start`/`daemon-stop` (the recipe runner holds a process-local
  persistent connection for its own run and releases it; nothing outlives the process);
- allow-lists `page open` and every recipe URL to https on `homes.com` and every subdomain (`www.homes.com`).
  A crafted URL can perform an action on some sites; the allow-list is what keeps "read-only" true at the
  navigation layer.

Because signing in needs `act type`, **this harness cannot sign in**. Steven signs in by hand in the Chrome
profile DOMShell drives. homes.com search and listing pages are public; only `saved-searches` needs the signed-in profile.

## Recipes (all `--json`)

| Recipe | Kind | Needs sign-in | Options | What it reads | URL note |
|---|---|---|---|---|---|
| `search-listings` | list | no | — | Listings on a homes.com search-results page (public; no sign-in needed) | Default is a city search page (`/temecula-ca/`); pass `--url` for any other homes.com search page. |
| `saved-searches` | list | yes | — | Steven's saved searches and their alert settings (needs sign-in) | Account page; needs the signed-in Chrome profile. |
| `listing-detail` | record | no | `--url` required | One listing's detail page (pass --url; public) | `--url` is mandatory: the listing page to read. |

### Field resolution, per recipe (from `paths.json`)

**`search-listings`** — root `['/main']`, rows `['listitem', 'article', 'row', 'group']`, depth 1:

| Field | How it is found |
|---|---|
| `address` | child named `link` or `heading` |
| `price` | regex `\$[\d,]{4,}` |
| `beds` | regex `(\d+)\s*(?:bd|beds?)\b` group 1 |
| `baths` | regex `([\d.]+)\s*(?:ba|baths?)\b` group 1 |
| `sqft` | regex `([\d,]+)\s*(?:sq\.?\s?ft|sqft)` group 1 |
| `status` | regex `(New|Price Reduced|Open House|Pending|Contingent|Coming Soon|Under Contract)` |
| `listed_by` | regex `(?:Listed by|Listing (?:provided )?by|Courtesy of)\s*:?\s*([^\n]+)` group 1 |

**`saved-searches`** — root `['/main']`, rows `['listitem', 'article', 'row', 'group']`, depth 1:

| Field | How it is found |
|---|---|
| `name` | child named `heading` or `link` |
| `criteria` | regex `((?:\d+\+?\s*(?:bd|beds?)[^\n]*)|(?:\$[\d,]+\s*[-–]\s*\$[\d,]+[^\n]*))` |
| `frequency` | regex `(Instant|Daily|Weekly|Never|Off)` |
| `new_listings` | regex `(\d+)\s*new` group 1 |

**`listing-detail`** — root `['/main']`, depth 2:

| Field | How it is found |
|---|---|
| `address` | child named `heading` |
| `price` | regex `\$[\d,]{4,}` |
| `beds` | regex `(\d+)\s*(?:bd|beds?)\b` group 1 |
| `baths` | regex `([\d.]+)\s*(?:ba|baths?)\b` group 1 |
| `sqft` | regex `([\d,]+)\s*(?:sq\.?\s?ft|sqft)` group 1 |
| `status` | regex `(For Sale|Active|New|Price Reduced|Pending|Contingent|Coming Soon|Under Contract|Sold|Off Market)` |
| `mls_id` | regex `MLS\s*#?\s*:?\s*([A-Z0-9-]{4,})` group 1 |
| `days_on_market` | regex `(\d+)\s*days? on (?:market|homes\.com)` group 1 |
| `listed_by` | regex `(?:Listed by|Listing (?:provided )?by|Courtesy of)\s*:?\s*([^\n]+)` group 1 |
| `description` | child named `paragraph` or `text` |


`prefix`/`role` lists are priority-ordered (first entry that matches anything wins); `index` counts within the
winning group; a field with only `regex` searches the row's whole text.

## The honest limit: every path map is unverified

homes.com's hosts are egress-blocked from the sandbox this was built in, DOMShell's exact `ls` line format is only
loosely known (the upstream harness's own parser keeps "every line as the name"), and the site's tree changes when
the site changes. So:

- every recipe carries `"verified": false` and the CLI prints `[path map UNVERIFIED until first live run]`;
- the entry parser accepts the three line shapes seen in the upstream tests (`button[0]`, `name [role]`, indented);
- `--discover [--text] [--depth N]` dumps the live tree, reports auth state without enforcing it, and prints
  `how_to_fix`;
- the map is a JSON file Steven edits (`paths init` → `~/.config/cli-anything/homes-paths.json`); no code changes.

**How to fix one path** — run `cli-anything-homes --json recipe <name> --discover --text`, find the container that holds the
rows, set `root` to its path; set `rows.prefix` to the row children's name prefix; for each field set `prefix`
to the child that carries it (or a `regex` over the row text). Re-run until values match the page, then set
`verified: true`. Do not set it before the spot-check: silent scrape drift is the failure that poisons decisions.

## Specified, disabled, and why — the blast radius of each write verb

None of these is built. Each would need Steven's **written approval for that one verb on that one target**, and on
the browser path each is an `act` call, so all are denied by the allow-list. They are documented here so that
nobody mistakes "absent" for "forgotten".

| Disabled verb | What it would do, and how far the damage goes |
|---|---|
| `save-search create` | Writes to Steven's account and starts portal e-mail. Recoverable, annoying. |
| `contact-agent send` | **Sends a message to a third-party listing agent.** Client-facing; cannot be unsent. |

## Credentials — by name and location only

This harness reads no credential. The connector spec reserves, for a separately approved sign-in verb:
keychain service `cli-anything.homes` or `~/.config/cli-anything/.env` → `HOMES_USER` / `HOMES_PASS`. 
Never in a prompt, a task definition, a skill file, a log, a finding or the deck.

## Validation before it is trusted (from the connector spec)

1. `cli-anything-homes --help` exits 0, and `cli-anything-homes --help | grep -qw act` finds nothing (exit 1). A **word** match: a substring match false-trips on `my-listing-activity`, `redact`, `contact`, `interactive`, `exact` — **done, mechanical, in the test suite.**
2. A named read recipe returns parseable JSON with ≥1 row, or an explicit empty-result object — **done offline
   against synthetic trees; not yet live.**
3. Logged out → explicit auth error, never a partial or cached result — **done offline (login wall, login redirect,
   and the fail-closed "unknown" state); no cache exists.**
4. Spot-check: its numbers match the UI — **never run.** Gated on the Mac, Chrome, DOMShell and a signed-in session.
5. `/cli-anything:validate` and `:test` — **never run**; this package was built by hand from HARNESS.md, not generated.
6. No credential, cookie or full client record in `cliAnythingLog` — the harness logs nothing itself; the runner
   that calls it owns that log.
7. **ECC security review** (Elena's lens) before enabling — **not done.** What it can reach: homes.com hosts over
   https, read-only. What it stores: nothing (no cache; `paths init` writes a config file). What a prompt-injected
   page could make it do: return flagged/truncated text (`sanitize_dom_text`), nothing else — there is no verb to
   redirect.

## Known limitations

- Per-call cost: each row costs `1 + children` DOMShell calls at depth 1. The persistent connection inside a recipe
  run keeps that to ~100 ms a call; without it (fallback) it is one `npx` spawn per call.
- `cli-anything-browser` pins `mcp<1.0.0`, which resolves to `mcp 0.9.1` (Nov 2024). Upstream, not ours; noted in
  `docs/findings/findings-H1.json`.
- One-shot runs each open a new DOMShell lane (Chrome tab group). The REPL reuses one.
- `sanitize_dom_text` flags the plain word "forget", which real listing text contains; the value is replaced by a
  `[FLAGGED …]` stub rather than lost silently.
