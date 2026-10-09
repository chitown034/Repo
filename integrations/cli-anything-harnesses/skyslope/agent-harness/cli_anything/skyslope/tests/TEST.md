# TEST.md — cli-anything-skyslope

Two halves, kept apart on purpose: **what ran** (offline, mocked, synthetic) and **what has never
run** (anything that would touch SkySlope, Chrome or DOMShell).

## Part 1 — Test plan

All tests live in `test_core.py`. No network, no Chrome, no DOMShell, no live site. DOMShell is
mocked at the harness's single seam (`utils/skyslope_backend.py`) or, for the seam-binding tests,
at the reference browser harness's own backend functions. Fixtures are invented: `TX-SAMPLE-1`,
`100 Example Way (fixture)`, `Fixture Disclosure.pdf`. No real client, listing, transaction, phone
or email appears anywhere.

| Class | What it proves |
|---|---|
| `TestGate` | `core/policy.py`: unset, blank, garbage, impossible date, future date → `disabled-by-policy`; past/today date → `gate-open`; dict uses the deck's `connState` / `eccReviewedAt` vocabulary |
| `TestCLIGate` | Every live command (all 4 recipes, `discover`, `fs *`, `page *`) exits **3** without the date, before the DOMShell probe is called; JSON refusal shape `type: policy_gate`; with the gate open and DOMShell missing → `dependency_error` exit 1; with the gate open and the seam mocked → rows; offline commands need no gate |
| `TestNoWriteSurface` | No command named `act`; `--help` exits 0 with no whole word `act`; no group carries a click/type/submit/send/upload/download/delete/fill/complete/sign subcommand; the seam's public surface is exactly the read-only list and has no click/type/download/upload; no source file calls the browser harness's `click`/`type_text`; `verbs` documents the absent writes with blast radius |
| `TestRecipes` | Engine over a fake seam: rows, URL, login-marker greps; logged-out → explicit `auth_error`, zero rows, `ls` never called; auth-check failure → no rows; `document-index` lists names via ls/grep/open only; detail text; checklist matches; navigation and wrong-path errors point at `discover`; ids required and sanitised; unknown recipe refused; recipe names match the spec |
| `TestSecurity` | Host allow-list: https + allow-listed host only; http, other hosts, look-alike hosts, embedded credentials, `javascript:`, `file:`, newlines, scheme-less all refused; the seam refuses before importing the browser harness |
| `TestPathMap` | Packaged `paths.json` validates and is marked unverified on every recipe; `--paths` beats `$CLI_ANYTHING_SKYSLOPE_PATHS` beats the packaged file; missing/broken files raise `PathMapError`; validation catches off-list URLs, missing `{id}`, relative tree paths and missing recipes |
| `TestDiscover` | Bounded walk: paths and dir flags, depth limit, node cap → `truncated`, subtree errors recorded not fatal; only `ls` is ever called |
| `TestSeamBinding` | With `cli-anything-browser` installed (it is, in the venv), the seam delegates to the real `fs`/`page` modules with the reference call signature; the real DOMShell backend is patched so nothing spawns |
| `TestInstalledCommand` | The installed console script (`CLI_ANYTHING_FORCE_INSTALLED=1`): `--help` exit 0, `gate status` offline, recipe refused exit 3 |

## Part 2 — What ran (2026-09-22, throwaway venv `/tmp/h2-venv`, Python 3.11.15)

Install: `pip install .` from `integrations/cli-anything-harnesses/skyslope/agent-harness` → `cli-anything-skyslope 0.1.0`.
`cli-anything-skyslope --help` → exit 0.

```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-9.1.1, pluggy-1.6.0 -- /tmp/h2-venv/bin/python
rootdir: /tmp
plugins: anyio-4.15.1
collecting ... collected 71 items

test_core.py::TestGate::test_unset_is_disabled_by_policy PASSED [  1%]
test_core.py::TestGate::test_empty_string_is_unset PASSED [  2%]
test_core.py::TestGate::test_garbage_is_not_a_date PASSED [  4%]
test_core.py::TestGate::test_impossible_calendar_date_refused PASSED [  5%]
test_core.py::TestGate::test_future_date_refused PASSED [  7%]
test_core.py::TestGate::test_past_date_opens_gate PASSED [  8%]
test_core.py::TestGate::test_today_opens_gate PASSED [  9%]
test_core.py::TestGate::test_as_dict_uses_deck_vocabulary PASSED [ 11%]
test_core.py::TestCLIGate::test_recipe_refused_without_date_exit_3 PASSED [ 12%]
test_core.py::TestCLIGate::test_recipe_refused_json_shape PASSED [ 14%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args0] PASSED [ 15%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args1] PASSED [ 16%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args2] PASSED [ 18%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args3] PASSED [ 19%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args4] PASSED [ 21%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args5] PASSED [ 22%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args6] PASSED [ 23%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args7] PASSED [ 25%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args8] PASSED [ 26%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args9] PASSED [ 28%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args10] PASSED [ 29%]
test_core.py::TestCLIGate::test_every_live_command_is_gated[args11] PASSED [ 30%]
test_core.py::TestCLIGate::test_future_date_refused_at_cli PASSED [ 32%]
test_core.py::TestCLIGate::test_gate_open_but_domshell_missing_is_dependency_error PASSED [ 33%]
test_core.py::TestCLIGate::test_gate_open_recipe_runs_through_mocked_seam PASSED [ 35%]
test_core.py::TestCLIGate::test_offline_commands_need_no_gate PASSED [ 36%]
test_core.py::TestCLIGate::test_gate_status_json PASSED [ 38%]
test_core.py::TestNoWriteSurface::test_no_act_group PASSED [ 39%]
test_core.py::TestNoWriteSurface::test_help_exit_0_and_no_act_word PASSED [ 40%]
test_core.py::TestNoWriteSurface::test_no_group_carries_a_write_subcommand PASSED [ 42%]
test_core.py::TestNoWriteSurface::test_seam_has_only_the_read_surface PASSED [ 43%]
test_core.py::TestNoWriteSurface::test_source_never_calls_browser_write_functions PASSED [ 45%]
test_core.py::TestNoWriteSurface::test_verbs_command_documents_the_absent_writes PASSED [ 46%]
test_core.py::TestRecipes::test_transactions_rows_and_calls PASSED [ 47%]
test_core.py::TestRecipes::test_logged_out_is_explicit_auth_error_with_no_rows PASSED [ 49%]
test_core.py::TestRecipes::test_auth_check_failure_returns_no_rows PASSED [ 50%]
test_core.py::TestRecipes::test_document_index_lists_names_and_never_downloads PASSED [ 52%]
test_core.py::TestRecipes::test_transaction_detail_reads_text PASSED [ 53%]
test_core.py::TestRecipes::test_checklist_status_reports_matches PASSED [ 54%]
test_core.py::TestRecipes::test_navigation_error PASSED [ 56%]
test_core.py::TestRecipes::test_wrong_list_path_points_at_discover PASSED [ 57%]
test_core.py::TestRecipes::test_id_required_and_sanitised PASSED [ 59%]
test_core.py::TestRecipes::test_unknown_recipe PASSED [ 60%]
test_core.py::TestRecipes::test_recipe_names_match_spec PASSED [ 61%]
test_core.py::TestSecurity::test_allowed[https://app.skyslope.com/] PASSED [ 63%]
test_core.py::TestSecurity::test_allowed[https://app.skyslope.com/transactions/TX-1] PASSED [ 64%]
test_core.py::TestSecurity::test_refused[http://app.skyslope.com/] PASSED [ 66%]
test_core.py::TestSecurity::test_refused[https://example.com/] PASSED [ 67%]
test_core.py::TestSecurity::test_refused[https://app.skyslope.com.evil.example/] PASSED [ 69%]
test_core.py::TestSecurity::test_refused[https://user:pw@app.skyslope.com/] PASSED [ 70%]
test_core.py::TestSecurity::test_refused[javascript:alert(1)] PASSED [ 71%]
test_core.py::TestSecurity::test_refused[file:///etc/hosts] PASSED [ 73%]
test_core.py::TestSecurity::test_refused[https://app.skyslope.com/\nls] PASSED [ 74%]
test_core.py::TestSecurity::test_refused[] PASSED [ 76%]
test_core.py::TestSecurity::test_refused[app.skyslope.com] PASSED [ 77%]
test_core.py::TestSecurity::test_seam_refuses_before_touching_browser PASSED [ 78%]
test_core.py::TestPathMap::test_packaged_map_valid_and_unverified PASSED [ 80%]
test_core.py::TestPathMap::test_override_precedence PASSED [ 81%]
test_core.py::TestPathMap::test_missing_and_broken_files PASSED [ 83%]
test_core.py::TestPathMap::test_validation_catches_bad_entries PASSED [ 84%]
test_core.py::TestPathMap::test_render_url PASSED [ 85%]
test_core.py::TestDiscover::test_walk_builds_paths_and_dir_flags PASSED [ 87%]
test_core.py::TestDiscover::test_depth_limit PASSED [ 88%]
test_core.py::TestDiscover::test_node_cap_truncates PASSED [ 90%]
test_core.py::TestDiscover::test_subtree_error_is_recorded_not_fatal PASSED [ 91%]
test_core.py::TestSeamBinding::test_ls_delegates_to_browser_fs PASSED [ 92%]
test_core.py::TestSeamBinding::test_open_url_allowed_host_reaches_browser_page PASSED [ 94%]
test_core.py::TestSeamBinding::test_grep_and_cat_delegate PASSED [ 95%]
test_core.py::TestInstalledCommand::test_help_exit_0_no_act PASSED [ 97%]
test_core.py::TestInstalledCommand::test_gate_status_offline PASSED [ 98%]
test_core.py::TestInstalledCommand::test_recipe_refused_exit_3 PASSED [100%]

============================== 71 passed in 0.71s ==============================
```

71 passed, 0 failed, 0 skipped, 0.71 s. Deterministic; no network.

## Part 3 — What has NEVER run

- Nothing has ever touched SkySlope. The site is egress-blocked from the build sandbox and the ECC
  gate is closed. Every URL, tree path, grep pattern and login marker in `paths.json` is a guess.
- No DOMShell MCP session has been opened by this package. One note for honesty: during a manual
  smoke run with the gate forced open, the reference harness's availability probe spawned
  `npx @apireno/domshell --version` once in the sandbox; the run then stopped at the missing
  `DOMSHELL_TOKEN` before any MCP connection. The test suite mocks that probe.
- `/cli-anything:validate` and `/cli-anything:test` (the plugin commands) have not been run; this
  package was written directly in the HARNESS.md shape rather than generated.
- Validation rules 2–4 and 7 of the connectors skill (a live recipe returning rows, logged-out
  behaviour live, rows matching the UI, the ECC review itself) are outstanding.
- No `cliAnythingStatus` or `cliAnythingLog` write has been made.

## Part 4 — Independent re-verification (H2b, 2026-09-22, venv `/tmp/h2b-venv`, Python 3.11.15)

Re-run from a clean throwaway venv: `pip install .` → `cli-anything-skyslope 0.1.0`;
`--help` → exit 0; `grep -w act` over that help output → **no match** (the substring occurs only in
"action group" and "interactive"); `68 passed, 3 skipped in 0.50s`.

**The 3 skips are `TestSeamBinding`**, which opens with
`pytest.importorskip("cli_anything.browser.core.fs", …)`. `cli-anything-browser` is not on PyPI and
is not vendored in this repo — `MAC-SETUP.sh` git-clones `HKUDS/CLI-Anything` and builds it on the
Mac — so without it those three skip rather than fail. Part 2's `71 passed, 0 skipped` and this
run's `68 passed, 3 skipped` are both correct for their environment; read the former as "with the
browser harness present".

Still true after the re-run: all 5 `paths.json` recipes carry `verified: false`, and Part 3 is
unchanged — no live SkySlope call has ever been made.
