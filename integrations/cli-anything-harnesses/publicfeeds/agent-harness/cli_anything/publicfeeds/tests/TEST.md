# TEST.md — cli-anything-publicfeeds

## Part 1 — Test plan (written before the code)

### Inventory

- `test_core.py` — offline unit + CLI tests, synthetic trees, no Chrome, no network, no live site.
  There is no `test_full_e2e.py`: every recipe here is also gated on a terms-of-service review that
  has never been recorded (see `PUBLICFEEDS.md`), so an opt-in live suite would have nothing it is
  allowed to run against even on the Mac, until Steven records at least one group's date.
- `fixtures/*.json` — 12 entirely synthetic accessibility trees: 8 one-per-recipe (invented prices,
  rates, community names, dates — e.g. `4127 Sample Grove`-style addresses do not appear here since
  these pages are not listings, but the same invented-data discipline applies: no real MLS number, no
  real advertised rate, no real client) plus 4 shared structural fixtures (`empty`, `no-rows`,
  `no-root`, `login-redirect`).

### Unit / CLI plan (`test_core.py`)

| Area | What is asserted |
|---|---|
| Help surface | `--help` exits 0; `act` appears in **no** help page at any level; no command named `act`/`click`/`type`; **no `fs`/`page`/`session` group exists at all** (narrower than `cli-anything-homes` by design); package source never references `backend.click`/`type_text`; every spec recipe is a subcommand |
| No write verbs (schema) | no recipe name, field name or `kind` in `paths.json` looks like a write verb (reuses the Command Deck's own `verbsEnabled` tripwire pattern); every recipe's `description` is free of the standalone word `act`; every recipe names exactly one known `policy_group` |
| URL allow-list | rejects off-site, suffix/prefix look-alikes, `http://` downgrade, userinfo, `javascript:`, `file:`, scheme-less, empty; accepts every one of the package's 6 allow-listed hosts and their subdomains; `recipe --url` rejects before the browser seam is touched |
| Recipes vs fixtures | every recipe parses its fixture into the expected rows/record (values computed from the real `paths.json` regexes against the fixture text, not hand-typed, so the fixture and the engine cannot silently disagree); `--json` output parses and carries `policyGate`; human output prints the UNVERIFIED banner |
| Auth | **no recipe requires sign-in** (every page is public) — the marker-based checks `cli-anything-homes` runs do not apply here; the `login_url_fragments` redirect check still fires unconditionally regardless of `requires_auth`, exercised against an arbitrary recipe; CLI exit 2 with no `rows`/`record`/`count` key; two consecutive runs read two different trees (no cache) |
| **Policy gate** | unset env var, malformed date, future date all block; a valid past date opens exactly that one group and no other (`test_groups_are_independent`); the CLI refuses with **exit 3** and `type:"policy_gate"` before ever touching the browser seam (`tree.opened == []`); `--discover` is gated the same as a normal run; `gate status` reports all three groups; an open gate does not bypass a broken path map (still exit 4, `path_map_error`) |
| Empty vs path map | root present + nothing listed -> exit 0 `empty:true`; root present + no row-like children -> exit 0 with a warning naming the unmatched children; root missing -> **exit 4** `path_map_error` with a `--discover` hint (shifted from `cli-anything-homes`'s exit 3, which this package uses for the policy gate instead — see `publicfeeds_cli.py`'s exit-code table) |
| Path map | packaged map validates; every recipe is `verified:false`; env override wins; malformed override is named, not skipped; `paths init` writes only a local copy and never overwrites |
| Entry parser | the three DOMShell line shapes; indented dumps keep the shallowest level |
| Installed command | `_resolve_cli("cli-anything-publicfeeds")` subprocess: `--help` exit 0 and no `act` token; `recipes --json` and `gate status --json` and `paths where --json` all parse without DOMShell; `--version` |

### No live plan

Deliberately absent — see Inventory above. The first opt-in live test file for this package is future
work, written once at least one `CLI_ANYTHING_TOS_REVIEWED_<GROUP>` date actually exists.

## Part 2 — Results

### `pip install .` (throwaway venv, browser installed first — same prerequisite `cli-anything-homes` documents)

```
Building cli-anything-publicfeeds @ .../integrations/cli-anything-harnesses/publicfeeds/agent-harness
      Built cli-anything-publicfeeds @ .../integrations/cli-anything-harnesses/publicfeeds/agent-harness
Installed 1 package in 2ms
 + cli-anything-publicfeeds==0.1.0 (...)
```

### `cli-anything-publicfeeds --help` (exit 0; the token `act` is absent)

```
Usage: cli-anything-publicfeeds [OPTIONS] [COMMAND] [ARGS]...

  Public real-estate & lender research pages — read-only, per-group gated.

  Three unrelated page categories, one CLI: Redfin market pages (marketpages),
  lender-advertised-rate pages (lenderrates), builder incentive pages
  (builderpages). Each has its own CLI_ANYTHING_TOS_REVIEWED_<GROUP> gate —
  see `gate status`. Nothing here can click or type, and there is no raw
  `fs`/`page` group either; the only live-touching command is `recipe <name>`,
  always through the gate.

Options:
  --json     Output as JSON (agents: always pass this)
  --version  Show the version and exit.
  --help     Show this message and exit.

Commands:
  gate     Terms-of-service review gates, one per policy group (offline).
  paths    Inspect or initialise the editable path map (a local file;...
  recipe   Run one named read recipe (rows/record as JSON with --json).
  recipes  List the read recipes in the effective path map, with each...
  repl     Start the interactive REPL session.
```

**F-R6-01, found and fixed in this round:** the first draft of this CLI's own docstring read "No
`act` group..." — the literal word "act", inside a sentence explaining that it is absent, still
matches `--help | grep -qw act`. Reworded to "Nothing here can click or type" throughout. The same
trap this repo already documents for recipe names (`my-listing-activity`) applies to prose too.

### `cli-anything-publicfeeds --json gate status` (no env vars set)

```json
{
  "marketpages":  {"ok": false, "connState": "disabled-by-policy", ...},
  "lenderrates":  {"ok": false, "connState": "disabled-by-policy", ...},
  "builderpages": {"ok": false, "connState": "disabled-by-policy", ...}
}
```

### `python -m pytest cli_anything/publicfeeds/tests/ -v` (2026-09-24)

```
============================= 117 passed in 2.17s ==============================
```

Zero skips (there is no live suite to skip — see Part 1) and zero failures. Full suite, alongside the
eight pre-existing packages this round did not modify, run together in one shared venv (proves the
PEP 420 namespace still works with a ninth portion installed):

```
750 passed, 42 skipped in 9.75s
```

All 42 skips belong to the eight pre-existing packages (live-opt-in tests and per-site not-applicable
cases already documented in each package's own `TEST.md`); none belongs to `publicfeeds`.

### Coverage notes

- The fixtures prove the recipe *engine* parses a tree of the expected shape, and that the real
  `paths.json` regexes actually match the text they claim to — every fixture's `expect` block was
  computed by running those exact regexes against the fixture text, not hand-typed. They prove
  nothing about any of the six real hosts' real tree, URLs or DOMShell's real `ls` format — see the
  "honest limit" section of `PUBLICFEEDS.md`.
- `repl_skin.py` is a verbatim copy (same file `cli-anything-homes` ships) and is excluded from the
  source scan, same as upstream.
- The policy-gate tests are the one genuinely new class of test in this package versus the six it
  templates from — `core/policy.py` has no upstream or sibling-package equivalent to compare against
  beyond `cli_anything.skyslope.core.policy`, which this module's docstring credits directly.

## Part 3 — What has NEVER run

- **Anything live.** No recipe has touched any of the six hosts. No path map is verified. No URL in
  `paths.json` is confirmed — including the two (`san-diego-county-market`, `lennar-san-diego-promo`)
  known to go stale on a schedule, and `richmond-american-sommers-bend`'s URL, which is a guess.
- **Every one of the three terms-of-service reviews.** No group's `CLI_ANYTHING_TOS_REVIEWED_<GROUP>`
  has ever held a real date outside a test's `monkeypatch`.
- DOMShell's real `ls`/`cat` text through `parse_entries` on any of these six hosts — only the three
  shapes from the upstream test suite, same limitation `cli-anything-homes` documents.
- macOS specifics: `~/.cli-anything-publicfeeds/history` permissions, `posture.sh`'s handling of a
  ninth history directory (code-reviewed, not observed).
- `/cli-anything:validate` and `:test` — this package was written by hand, not generated, same as the
  other seven.
- The ECC-style security review this package's own `PUBLICFEEDS.md` describes what it would cover.
- `cli-anything-feeds` (`mac-task-specs.md` §7), the task that maps this CLI's output into the
  Command Deck's documents — specified, never run.
