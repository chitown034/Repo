# Public Feeds Harness: read-only recipes for market/rate/builder pages, gated by category

Written 2026-09-24 (round R6). **Nothing here has run against a live site, and every policy gate is
closed.** Read `cli_anything/publicfeeds/README.md` for install and use; this file records the
analysis, the design and what is deliberately absent.

## Purpose

Three categories of public page the Command Deck depends on have no Composio toolkit and no usable
API, and today are hand-carried or frozen (`integrations/CONNECTIONS.md` has the honest map and dates):

1. **Local market snapshots** (Redfin) — `r5-rates-market-refresh` has never run; San Diego/Temecula/
   Murrieta figures on the deck are a 2026-09-22 hand snapshot.
2. **Lender-advertised rate pages** (Veterans United, Navy Federal) — the daily FRED/Optimal Blue feed
   covers national-average rates, not these two lenders' own advertised VA/jumbo rates; those three
   rows on the deck are hand re-verified, most recently 2026-09-22.
3. **Builder incentive pages** (D.R. Horton, Lennar, Richmond American) — `feeds-weekly`'s
   `builderIncentiveLiveList` has been "limited" since 2026-09-17, filled by ad hoc Claude research
   sessions rather than a real per-community pull; the deck's hand-typed `BUILDER_INCENTIVES` prose
   block explicitly "does not refresh".

The only path for any of these is the browser: DOMShell exposes Chrome's accessibility tree as a
virtual filesystem, `cli-anything-browser` wraps DOMShell, and this package wraps *that* with 8 named
read recipes across the three categories. `cli-anything-homes` is the template this package follows;
see its `HOMES.md` for the base architecture.

## Why one package, not three

The engine (`core/recipes.py`, `core/tree.py`, `core/auth.py`, `core/paths.py`) is identical for all
three categories — open an allow-listed URL, walk the tree, extract fields by prefix/regex — so
duplicating it into three near-identical packages would be three copies of the same code with three
times the chance of the copies drifting apart. What genuinely differs per category is **whose terms of
service govern it**, so that is what stays separated: each category is its own `policy_group`
(`core/target.py`) with its **own** `CLI_ANYTHING_TOS_REVIEWED_<GROUP>` gate (`core/policy.py`).
Clearing the market-pages question can never quietly enable the builder-pages question.

## Architecture

```
cli-anything-publicfeeds recipe <name> --json
        │
        ▼
publicfeeds_cli.py   gate FIRST (policy.check_gate(recipe's policy_group)) — exit 3 if closed,
        │             before DOMShell is even checked for
        ▼
core/recipes.py      path map (paths.json) → open URL → auth check → root → rows/record → fields → JSON
        │                                    (allow-listed)  (fails closed)
        ▼
core/tree.py         TreeSource seam: LiveTree (Chrome via the browser harness) | FixtureTree (tests)
        │
        ▼
cli_anything.browser.core.fs / .page      ← cli-anything-browser, unchanged, imported not copied
        │
        ▼
cli_anything.browser.utils.domshell_backend → npx @apireno/domshell (MCP, stdio) → Chrome + DOMShell extension
```

Four read operations cross the seam: `open`, `ls`, `cat`, `grep`. That is the whole surface, and unlike
`cli-anything-homes` this package does not even expose a raw `fs`/`page` group at the CLI level —
every live-touching command is a single named `recipe`, so the gate check always knows which group it
is checking. (`gate status` and `paths show/where/init` are offline and ungated.)

## Read-only by construction

- Has **no `act` group** — not disabled, absent. `publicfeeds_cli.py` defines `gate`, `recipe`,
  `recipes`, `paths`, `repl` and nothing else.
- Never imports `domshell_backend.click` or `type_text`.
- Asserts, in `test_act_absent_from_every_help_page` and a schema test over `paths.json` itself
  (`tests/test_core.py::TestNoWriteVerbs`), that no write-verb token appears in any `--help` page or in
  any recipe's name, description or field name.
- Allow-lists `page open` (reachable only through `recipe --url`, since there is no standalone `page`
  group) to the union of all six hosts across the three groups. A crafted URL can perform an action on
  some sites; the allow-list is what keeps "read-only" true at the navigation layer.
- Every recipe additionally sits behind its category's terms-of-service gate — closed by default.

## The three terms-of-service questions — recorded, not decided

**Alexandra drafts, Steven decides (per `CLAUDE.md`'s HALT list). This package will not open any of
these hosts until each one's question below has a written answer and a date in the matching env var.**

| Group | `CLI_ANYTHING_TOS_REVIEWED_<GROUP>` | Hosts | The question |
|---|---|---|---|
| `marketpages` | `CLI_ANYTHING_TOS_REVIEWED_MARKETPAGES` | redfin.com | Does Redfin's Terms of Use permit read-only, low-frequency, non-cached automated access to `/city/` and `/county/` housing-market pages for a single licensed agent's own reference, and does redfin.com's robots.txt allow those paths for a generic user agent? |
| `lenderrates` | `CLI_ANYTHING_TOS_REVIEWED_LENDERRATES` | veteransunited.com, navyfederal.org | Do Veterans United's and Navy Federal's website terms permit automated, read-only retrieval of their publicly posted rate tables (no account, no quote submitted), and does each robots.txt allow the rate-page path? |
| `builderpages` | `CLI_ANYTHING_TOS_REVIEWED_BUILDERPAGES` | drhorton.com, lennar.com, richmondamerican.com | Do D.R. Horton's, Lennar's and Richmond American's website terms permit automated, read-only retrieval of their public community/promo pages, and does each robots.txt allow the specific paths this package reads? |

Setting the variable without the review "just to make a command run" is exactly the failure mode
`core/policy.py`'s gate exists to prevent — the same pattern SkySlope and zipForms already use for
`CLI_ANYTHING_ECC_REVIEWED_AT`, generalised to three independent groups.

**Known overlap, flagged rather than silently duplicated:** `MAC-INSTALL-comms-data.md` §3 already
scopes Scrapling + Scrapegraph-ai for "a builder's current-incentives page," gated on the same kind of
terms review, for the same `incentives-daily-scan` lane — which in practice writes a *different*
document (`incentivePrograms`: DPA/utility/tax/veteran programs, not builder buydowns;
`docs/MASTER-FINDINGS.md` line ~2654). So today **nothing** actually pulls builder pages on a schedule
either way. Steven should pick one tool as the standard for builder pages rather than clear ToS
reviews for both against the same three sites — see the `needs-steven` line in this round's hand-back.

## Recipes (all `--json`)

| Recipe | Kind | Policy group | What it reads | URL note |
|---|---|---|---|---|
| `temecula-market` | record | marketpages | Redfin's Temecula, CA market page | Stable `/city/19701/...` URL |
| `murrieta-market` | record | marketpages | Redfin's Murrieta, CA market page | Stable `/city/12866/...` URL |
| `san-diego-county-market` | record | marketpages | Redfin's San Diego County market update | **Monthly blog-post slug — re-point every month** |
| `veterans-united-va-rates` | list | lenderrates | Veterans United's published VA rate table | Public, no quote requested |
| `navy-federal-rates` | list | lenderrates | Navy Federal's published mortgage rate table | Public, no quote requested |
| `drhorton-menifee-spring-creek` | record | builderpages | D.R. Horton's Spring Creek (Menifee) community page | One named community |
| `lennar-san-diego-promo` | record | builderpages | Lennar's San Diego seasonal promo page | **Seasonal slug ("fss26") — re-point each campaign** |
| `richmond-american-sommers-bend` | record | builderpages | Richmond American — intended: Sommers Bend (Temecula) | **URL is a guess (site homepage) — the real community page has never been found; `--discover` first** |

### Field resolution, per recipe (from `paths.json`)

**Market recipes** (`temecula-market`, `murrieta-market`, `san-diego-county-market`) — root `['/main']`, depth 2:

| Field | How it is found | Feeds into `ratesSnapshot.markets[]` as |
|---|---|---|
| `medianPrice` | regex `Median (Sale )?Price...\$([\d,]+)` | `medianPrice` |
| `dom` | regex `(\d+)\s*(Median )?Days? on Market` | `dom` |
| `yoy` | regex `([+-]?\d+(\.\d+)?%)\s*(YoY\|year.over.year\|vs last year)` | `yoy` (kept as the display string; the deck strips the sign/percent itself) |
| `monthsSupply` | regex `([\d.]+)\s*[Mm]onths? of [Ss]upply` | `monthsSupply` |
| `asOf` | regex on "data as of" / "period ending" phrasing | `asOf` |

**Lender recipes** (`veterans-united-va-rates`, `navy-federal-rates`) — root `['/main']`, rows
`['row','listitem','group']`, depth 1:

| Field | How it is found | Feeds into `ratesSnapshot.rates[]` as |
|---|---|---|
| `program` | first `heading`/`link`/`cell` child | `program` |
| `rate` | regex `([\d.]+)\s*%` | `rate` |
| `apr` | regex `([\d.]+)\s*%\s*APR` | (not carried into `ratesSnapshot.rates[]` today — that shape has no `apr` field; kept in the raw recipe output for the record) |
| `asOf` | regex on "rates as of" / "valid as of" phrasing | `asOf` |

**Builder recipes** (`drhorton-menifee-spring-creek`, `lennar-san-diego-promo`,
`richmond-american-sommers-bend`) — root `['/main']`, depth 2:

| Field | How it is found | Feeds into `liveFeeds.feeds.builderIncentiveLiveList` as |
|---|---|---|
| `headline` | first `heading` child | part of the assembled `text` |
| `priceFrom` | regex `from \$([\d,]+[KkMm]?)` | part of the assembled `text` |
| `rate_terms` | regex for a rate/APR/"year N" phrase | part of the assembled `text` |
| `expires` | regex for a "through"/"expires"/"contracts by" phrase | part of the assembled `text` |
| `description` | first `paragraph`/`text` child | part of the assembled `text` |

`prefix`/`role` lists are priority-ordered; a field with only `regex` searches the row's/record's whole
text. **None of these raw field names is the exact `liveFeeds`/`ratesSnapshot` shape** — the
`cli-anything-feeds` Mac task assembles the final document write from a recipe's raw output; this
package's job stops at "here is what the page said."

## The honest limit: every path map is unverified, on top of every gate being closed

All six hosts are egress-blocked from the sandbox this was built in, so:

- every recipe carries `"verified": false` and the CLI prints `[path map UNVERIFIED until first live run]`;
- `--discover [--text] [--depth N]` dumps the live tree once its group's gate is open;
- the map is a JSON file Steven edits (`paths init` → `~/.config/cli-anything/publicfeeds-paths.json`);
- **the URLs themselves are best-effort guesses beyond the two stable Redfin city pages** — the San
  Diego County and Lennar recipes point at URLs that are known to go stale on a predictable schedule
  (monthly, seasonally), and the Richmond American recipe's URL is a guess Steven must correct before
  the recipe is worth running at all. Selectors unverified — `--discover` on the Mac is the only way to
  correct any of it, and that is true even after a gate opens.

## Specified, disabled, and why — the blast radius of each write verb

None of these is built, and building any of them is out of scope for this package by design (it reads
public marketing/rate pages; there is nothing here for a write verb to legitimately do). Documented so
"absent" reads as "decided":

| Disabled verb | What it would do |
|---|---|
| `save-search create` / `rate-quote request` / `contact-agent send` (any of these three site families) | Submits Steven's (or a client's) information to a third party. Cannot be unsent. |
| `act click` / `act type` | The entire DOMShell write surface. Absent from this harness, not switched off. |

## Credentials

**This harness needs none.** Every one of the 8 recipes reads a public page — no recipe here has
`requires_auth: true`. `auth.py`'s login-redirect check still fires unconditionally (a site could add a
paywall later), so the engine fails closed if any of these hosts ever redirects to a sign-in page; there
is simply no credential to reserve a keychain entry for today.

## Validation before it is trusted (from the connector spec, `.claude/skills/cli-anything-connectors/SKILL.md`)

1. `cli-anything-publicfeeds --help | grep -qw act` finds nothing (exit 1) — a **word** match, done,
   mechanical, in the test suite.
2. A named read recipe returns parseable JSON with a row/record, or an explicit empty-result object —
   done offline against synthetic trees; not yet live (every gate is closed and no host has been reached).
3. Every recipe refuses with exit 3 (`policy_gate`) until its group's env var holds a real date — done,
   mechanical, in the test suite.
4. Spot-check: its numbers match the UI — **never run.** Gated on the Mac, Chrome, DOMShell, and now
   also on the terms-of-service review landing first.
5. No credential, cookie or full client record in `cliAnythingLog` — the harness logs nothing itself
   (there is nothing to log); the `cli-anything-feeds` task that calls it owns that log.
6. **ECC-style security review** (Elena's lens), same three questions SkySlope's review answers, before
   any group's gate opens: what it can reach (one allow-listed host family per group, https only, no
   sign-in), what it stores (nothing — no cache, `paths init` writes a local config file only), what a
   prompt-injected page could make it do (return flagged/truncated text via the inherited
   `sanitize_dom_text` guard; there is no verb to redirect toward).

## Known limitations

- Per-call cost and connection reuse: identical to `cli-anything-homes` (see its `HOMES.md`).
- Regex-based field extraction on a page never seen is a guess by construction; expect `null` fields
  and a `warnings` array on the first live run of every recipe, even after its gate opens.
- The `san-diego-county-market` and `lennar-san-diego-promo` recipes' default URLs are known to expire
  on a predictable schedule (monthly / seasonally) — this is called out in `paths.json`'s own
  `description` for each, not just here, so it survives a `paths init` copy.
- `sanitize_dom_text` flags the plain word "forget", "disregard" and similar — ordinary marketing and
  market-report copy is expected to trip it sometimes; the flagged value becomes a `[FLAGGED …]` stub,
  never silently dropped.
