# TEST.md — cli-anything-showingtime

## Part 1 — Test plan (written before the code)

### Inventory

- `test_core.py` — offline unit + CLI tests, synthetic trees, no Chrome, no network, no live site.
- `test_full_e2e.py` — live read-only tests, **opt-in** via `CLI_ANYTHING_SHOWINGTIME_LIVE=1`; never run here.
- `fixtures/*.json` — 9 entirely synthetic accessibility trees (empty, feedback-inbox, logged-out, login-redirect, my-listing-activity, no-root, no-rows, showing-status, todays-showings).
  Invented addresses (`4127 Sample Grove Ct, Exampleton, CA 90000`), invented names (`Avery Fixture`), invented ids
  (`SYN-000001`, `#100001`). No real client, listing, agent, phone or e-mail.

### Unit / CLI plan (`test_core.py`)

| Area | What is asserted |
|---|---|
| Help surface | `--help` exits 0; the token `act` appears in **no** help page at any level; no command named `act`/`click`/`type`; `fs`/`page`/`session` expose exactly the spec's read verbs; package source never references `backend.click` / `type_text`; every spec recipe is a subcommand |
| URL allow-list | rejects off-site, suffix/prefix look-alikes, `http://` downgrade, userinfo, `javascript:`, `file:`, scheme-less, empty; accepts the site's hosts and subdomains; `page open` and `recipe --url` reject before the browser seam is touched |
| Recipes vs fixtures | every recipe parses its fixture into the expected rows/record (values from the fixture's `expect` block); `--json` output parses; human output prints the UNVERIFIED banner; `--match`/`--url` requirements enforced; unknown recipe is an error |
| Auth | login wall → `auth_error` (`logged_out`); redirect to a login URL → `auth_error`; no marker either way → `auth_error` (`unknown`, hint names the marker list); CLI exit 2 with **no** `rows`/`record`/`count` key; public recipes work signed out; two consecutive runs read two different trees (no cache) |
| Empty vs path map | root present + nothing listed → exit 0 `empty:true`; root present + no row-like children → exit 0 with a warning naming the unmatched children; root missing → exit 3 `path_map_error` with a `--discover` hint; `--discover` dumps the tree with text and reports auth instead of failing |
| Path map | packaged map validates; every recipe is `verified:false`; env override wins; malformed override is named, not skipped; `paths init` writes only a local copy and never overwrites |
| Entry parser | the three DOMShell line shapes; indented dumps keep the shallowest level; role from `[role]` or name prefix; prefix lists are priority-ordered; rows prefer list items over filter groups |
| Installed command | `_resolve_cli("cli-anything-showingtime")` subprocess: `--help` exit 0 and no `act` token; `recipes --json` and `paths where --json` parse without DOMShell; `--version` |

### Live plan (`test_full_e2e.py`, on the Mac only)

DOMShell available; every recipe without `--url`/`--match` returns ≥1 row or an explicit empty object (an
`auth_error` is a **failure**: sign in and re-run); `--discover` dumps the live tree for every recipe. Output is
printed with `-s` so it can be pasted below and the maps marked verified one by one.

## Part 2 — Results

### `pip install .` (throwaway venv `/tmp/h1-venv`, Python 3.11.15, 2026-09-22; `cli-anything-browser 1.0.0` and `mcp 0.9.1` already present)

```
Processing ./showingtime/agent-harness
  Installing build dependencies: started
  Installing build dependencies: finished with status 'done'
  Getting requirements to build wheel: started
  Getting requirements to build wheel: finished with status 'done'
  Preparing metadata (pyproject.toml): started
  Preparing metadata (pyproject.toml): finished with status 'done'
Requirement already satisfied: click<9.0,>=8.1 in /tmp/h1-venv/lib/python3.11/site-packages (from cli-anything-showingtime==0.1.0) (8.5.0)
Requirement already satisfied: prompt-toolkit<4.0,>=3.0 in /tmp/h1-venv/lib/python3.11/site-packages (from cli-anything-showingtime==0.1.0) (3.0.53)
Requirement already satisfied: cli-anything-browser>=1.0.0 in /tmp/h1-venv/lib/python3.11/site-packages (from cli-anything-showingtime==0.1.0) (1.0.0)
Requirement already satisfied: wcwidth>=0.1.4 in /tmp/h1-venv/lib/python3.11/site-packages (from prompt-toolkit<4.0,>=3.0->cli-anything-showingtime==0.1.0) (0.8.4)
Requirement already satisfied: mcp<1.0.0,>=0.1.0 in /tmp/h1-venv/lib/python3.11/site-packages (from cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.9.1)
Requirement already satisfied: anyio>=4.6 in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (4.15.1)
Requirement already satisfied: httpx in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.28.1)
Requirement already satisfied: httpx-sse in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.4.3)
Requirement already satisfied: pydantic>=2.0.0 in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (2.13.5)
Requirement already satisfied: sse-starlette in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (3.4.11)
Requirement already satisfied: starlette in /tmp/h1-venv/lib/python3.11/site-packages (from mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (1.6.0)
Requirement already satisfied: idna>=2.8 in /tmp/h1-venv/lib/python3.11/site-packages (from anyio>=4.6->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (3.20)
Requirement already satisfied: typing_extensions>=4.16.0 in /tmp/h1-venv/lib/python3.11/site-packages (from anyio>=4.6->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (4.16.0)
Requirement already satisfied: annotated-types>=0.6.0 in /tmp/h1-venv/lib/python3.11/site-packages (from pydantic>=2.0.0->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.8.0)
Requirement already satisfied: pydantic-core==2.46.5 in /tmp/h1-venv/lib/python3.11/site-packages (from pydantic>=2.0.0->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (2.46.5)
Requirement already satisfied: typing-inspection>=0.4.2 in /tmp/h1-venv/lib/python3.11/site-packages (from pydantic>=2.0.0->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.4.4)
Requirement already satisfied: certifi in /tmp/h1-venv/lib/python3.11/site-packages (from httpx->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (2026.7.22)
Requirement already satisfied: httpcore==1.* in /tmp/h1-venv/lib/python3.11/site-packages (from httpx->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (1.0.9)
Requirement already satisfied: h11>=0.16 in /tmp/h1-venv/lib/python3.11/site-packages (from httpcore==1.*->httpx->mcp<1.0.0,>=0.1.0->cli-anything-browser>=1.0.0->cli-anything-showingtime==0.1.0) (0.16.0)
Building wheels for collected packages: cli-anything-showingtime
  Building wheel for cli-anything-showingtime (pyproject.toml): started
  Building wheel for cli-anything-showingtime (pyproject.toml): finished with status 'done'
  Created wheel for cli-anything-showingtime: filename=cli_anything_showingtime-0.1.0-py3-none-any.whl size=63624 sha256=a5bf8e0a65fff111fca39f7333ce4cc4b2e56791312eb819a7031707f05ed6cf
  Stored in directory: /tmp/pip-ephem-wheel-cache-buemu1qd/wheels/ae/a5/82/e8ab7a39c565ef510a047ca12fffce3105bc7af03f4fe28d8b
Successfully built cli-anything-showingtime
Installing collected packages: cli-anything-showingtime
  Attempting uninstall: cli-anything-showingtime
    Found existing installation: cli-anything-showingtime 0.1.0
    Uninstalling cli-anything-showingtime-0.1.0:
      Successfully uninstalled cli-anything-showingtime-0.1.0
Successfully installed cli-anything-showingtime-0.1.0
```

### `cli-anything-showingtime --help` (exit 0; the token `act` is absent)

```
Usage: cli-anything-showingtime [OPTIONS] [COMMAND] [ARGS]...

  ShowingTime read-only CLI — named page recipes over the DOMShell browser
  harness.

  Reads the signed-in Chrome tab through cli-anything-browser. Only read verbs
  exist: fs (ls cd cat grep pwd), page (open info back forward reload; open is
  allow-listed to ShowingTime hosts), recipe <name>, recipes, paths, session
  status. Run without a subcommand to enter the REPL.

Options:
  --json     Output as JSON (agents: always pass this)
  --version  Show the version and exit.
  --help     Show this message and exit.

Commands:
  fs       Accessibility-tree navigation, read-only: ls, cd, cat, grep, pwd.
  page     Page navigation, read-only.
  paths    Inspect or initialise the editable path map (a local file;...
  recipe   Run one named read recipe (rows as JSON with --json).
  recipes  List the read recipes in the effective path map.
  repl     Start the interactive REPL session.
  session  Session state, read-only.
```

### `cli-anything-showingtime recipe --help`

```
Usage: cli-anything-showingtime recipe [OPTIONS] COMMAND [ARGS]...

  Run one named read recipe (rows as JSON with --json). --discover dumps the
  live tree.

Options:
  --help  Show this message and exit.

Commands:
  feedback-inbox       Showing feedback received on Steven's listings...
  my-listing-activity  Per-listing showing and feedback counts for...
  showing-status       Status of one appointment, picked by --match...
  todays-showings      Today's appointments on Steven's listings and for...
```

### `CLI_ANYTHING_FORCE_INSTALLED=1 python -m pytest cli_anything/showingtime/tests/ -v --tb=no -rs` (2026-09-22)

```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-9.1.1, pluggy-1.6.0 -- /tmp/h1-venv/bin/python
rootdir: /home/user/Repo/integrations/cli-anything-harnesses/showingtime/agent-harness
plugins: anyio-4.15.1
collecting ... collected 81 items

cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_help_exits_zero PASSED [  1%]
cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_act_absent_from_every_help_page PASSED [  2%]
cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_no_command_named_act_click_or_type PASSED [  3%]
cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_read_only_groups_match_spec_allow_list PASSED [  4%]
cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_source_never_references_write_backend PASSED [  6%]
cli_anything/showingtime/tests/test_core.py::TestHelpSurface::test_every_spec_recipe_is_a_subcommand PASSED [  7%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[https://evil.example/] PASSED [  8%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[https://showingtime.com.evil.example/] PASSED [  9%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[https://not-showingtime.com/] PASSED [ 11%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[http://showingtime.com/] PASSED [ 12%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[https://showingtime.com@evil.example/] PASSED [ 13%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[javascript:alert(1)] PASSED [ 14%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[file:///etc/passwd] PASSED [ 16%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[showingtime.com/no-scheme] PASSED [ 17%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_rejects[] PASSED [ 18%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_accepts_site_hosts[https://showingtime.com/] PASSED [ 19%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_accepts_site_hosts[https://www.showingtime.com/some/page?x=1] PASSED [ 20%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_accepts_site_hosts[https://app.showingtime.com/deep/path] PASSED [ 22%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_accepts_site_hosts[HTTPS://SHOWINGTIME.COM/] PASSED [ 23%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_page_open_rejects_off_site_before_touching_the_browser PASSED [ 24%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_page_open_accepts_site_url PASSED [ 25%]
cli_anything/showingtime/tests/test_core.py::TestAllowList::test_recipe_url_option_is_allow_listed PASSED [ 27%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_fixture_exists_and_is_synthetic[feedback-inbox] PASSED [ 28%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_fixture_exists_and_is_synthetic[my-listing-activity] PASSED [ 29%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_fixture_exists_and_is_synthetic[showing-status] PASSED [ 30%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_fixture_exists_and_is_synthetic[todays-showings] PASSED [ 32%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_engine_parses_fixture[feedback-inbox] PASSED [ 33%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_engine_parses_fixture[my-listing-activity] PASSED [ 34%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_engine_parses_fixture[showing-status] PASSED [ 35%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_engine_parses_fixture[todays-showings] PASSED [ 37%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_json_output_parses[feedback-inbox] PASSED [ 38%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_json_output_parses[my-listing-activity] PASSED [ 39%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_json_output_parses[showing-status] PASSED [ 40%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_json_output_parses[todays-showings] PASSED [ 41%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_human_output[feedback-inbox] PASSED [ 43%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_human_output[my-listing-activity] PASSED [ 44%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_human_output[showing-status] PASSED [ 45%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_cli_human_output[todays-showings] PASSED [ 46%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_match_requirement_is_enforced PASSED [ 48%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_url_required_is_enforced SKIPPED [ 49%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_unknown_recipe_is_a_usage_error PASSED [ 50%]
cli_anything/showingtime/tests/test_core.py::TestRecipesAgainstFixtures::test_recipes_list_matches_path_map PASSED [ 51%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_engine_raises_on_login_wall PASSED [ 53%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_engine_raises_on_login_redirect PASSED [ 54%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_engine_fails_closed_when_unsure PASSED [ 55%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_cli_logged_out_is_exit_2_with_no_rows PASSED [ 56%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_cli_login_redirect_is_exit_2 PASSED [ 58%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_public_recipe_does_not_need_sign_in SKIPPED [ 59%]
cli_anything/showingtime/tests/test_core.py::TestAuth::test_nothing_is_cached_between_runs PASSED [ 60%]
cli_anything/showingtime/tests/test_core.py::TestEmptyAndPathMap::test_root_present_nothing_listed_is_explicit_empty PASSED [ 61%]
cli_anything/showingtime/tests/test_core.py::TestEmptyAndPathMap::test_root_present_no_rows_warns PASSED [ 62%]
cli_anything/showingtime/tests/test_core.py::TestEmptyAndPathMap::test_root_missing_is_path_map_error PASSED [ 64%]
cli_anything/showingtime/tests/test_core.py::TestEmptyAndPathMap::test_discover_dumps_tree PASSED [ 65%]
cli_anything/showingtime/tests/test_core.py::TestEmptyAndPathMap::test_discover_reports_auth_instead_of_failing PASSED [ 66%]
cli_anything/showingtime/tests/test_core.py::TestPathMap::test_packaged_map_is_valid PASSED [ 67%]
cli_anything/showingtime/tests/test_core.py::TestPathMap::test_every_recipe_is_unverified_until_live PASSED [ 69%]
cli_anything/showingtime/tests/test_core.py::TestPathMap::test_env_override_wins PASSED [ 70%]
cli_anything/showingtime/tests/test_core.py::TestPathMap::test_malformed_override_is_named_not_skipped PASSED [ 71%]
cli_anything/showingtime/tests/test_core.py::TestPathMap::test_init_override_writes_local_copy_only PASSED [ 72%]
cli_anything/showingtime/tests/test_core.py::TestPriorityMatching::test_prefix_list_is_priority_ordered PASSED [ 74%]
cli_anything/showingtime/tests/test_core.py::TestPriorityMatching::test_rows_prefer_list_items_over_filter_groups PASSED [ 75%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_parse_entry_shapes[button[0]-button[0]-False] PASSED [ 76%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_parse_entry_shapes[div/-div-True] PASSED [ 77%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_parse_entry_shapes[listitem_3/ [listitem]-listitem_3-True] PASSED [ 79%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_parse_entry_shapes[  link_1 [link] "Sign Out"-link_1-False] PASSED [ 80%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_parse_entry_shapes[heading_1-heading_1-False] PASSED [ 81%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_indented_dump_keeps_shallowest_level_only PASSED [ 82%]
cli_anything/showingtime/tests/test_core.py::TestEntryParser::test_role_from_bracket_and_from_prefix PASSED [ 83%]
cli_anything/showingtime/tests/test_core.py::TestCLISubprocess::test_help PASSED [ 85%]
cli_anything/showingtime/tests/test_core.py::TestCLISubprocess::test_recipes_json_without_domshell PASSED [ 86%]
cli_anything/showingtime/tests/test_core.py::TestCLISubprocess::test_paths_where_json PASSED [ 87%]
cli_anything/showingtime/tests/test_core.py::TestCLISubprocess::test_version PASSED [ 88%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_domshell_is_available SKIPPED [ 90%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_recipe_returns_rows_or_explicit_empty[feedback-inbox] SKIPPED [ 91%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_recipe_returns_rows_or_explicit_empty[my-listing-activity] SKIPPED [ 92%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_recipe_returns_rows_or_explicit_empty[showing-status] SKIPPED [ 93%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_recipe_returns_rows_or_explicit_empty[todays-showings] SKIPPED [ 95%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_discover_dumps_live_tree[feedback-inbox] SKIPPED [ 96%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_discover_dumps_live_tree[my-listing-activity] SKIPPED [ 97%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_discover_dumps_live_tree[showing-status] SKIPPED [ 98%]
cli_anything/showingtime/tests/test_full_e2e.py::TestLiveReadOnly::test_discover_dumps_live_tree[todays-showings] SKIPPED [100%]

=========================== short test summary info ============================
SKIPPED [1] cli_anything/showingtime/tests/test_core.py:298: no recipe requires --url on this site
SKIPPED [1] cli_anything/showingtime/tests/test_core.py:358: every recipe on this site needs sign-in
SKIPPED [1] cli_anything/showingtime/tests/test_full_e2e.py:43: live ShowingTime tests are opt-in: set CLI_ANYTHING_SHOWINGTIME_LIVE=1 on the Mac with DOMShell running and a signed-in session
SKIPPED [4] cli_anything/showingtime/tests/test_full_e2e.py:48: live ShowingTime tests are opt-in: set CLI_ANYTHING_SHOWINGTIME_LIVE=1 on the Mac with DOMShell running and a signed-in session
SKIPPED [4] cli_anything/showingtime/tests/test_full_e2e.py:62: live ShowingTime tests are opt-in: set CLI_ANYTHING_SHOWINGTIME_LIVE=1 on the Mac with DOMShell running and a signed-in session
======================== 70 passed, 11 skipped in 2.03s ========================
```

**Summary: 70 passed, 11 skipped in 2.03s.** Every skip is listed with its reason above: the live module (gated) and the
per-site not-applicable cases.

### Coverage notes

- The fixtures prove the recipe *engine* parses a tree of the expected shape. They prove nothing about ShowingTime's
  real tree, URLs, marker text or DOMShell's real `ls` format.
- `LiveTree` (the only Chrome-facing class) is exercised only through the browser harness's own mocked tests
  upstream; here it is bypassed by the seam. Its `open/ls/cat/grep` are one-line delegations.
- `repl_skin.py` is a verbatim copy from the CLI-Anything plugin and is excluded from the source scan.

## Part 3 — What has NEVER run

- **Anything live.** No recipe has touched ShowingTime. No path map is verified. No URL in `paths.json` is confirmed.
- `test_full_e2e.py` — 0 runs. Needs the Mac, Chrome + DOMShell, `DOMSHELL_TOKEN`, a signed-in session and
  `CLI_ANYTHING_SHOWINGTIME_LIVE=1`.
- The auth markers (`Sign Out`, `My Account`, …) and login URL fragments against the real site.
- DOMShell's real `ls` / `cat` text through `parse_entries` — only the three shapes from the upstream test-suite.
- The recipe runner's persistent-connection path (`LiveTree.__enter__` → `start_daemon`) and its fallback.
- `/cli-anything:validate` and `/cli-anything:test` from the Claude Code plugin.
- The ECC security review.
- The spec's spot-check: "its numbers match the UI".
