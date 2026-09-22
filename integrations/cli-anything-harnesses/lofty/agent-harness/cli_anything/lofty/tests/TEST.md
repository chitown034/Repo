# TEST.md — cli-anything-lofty

Two halves, kept apart on purpose: **what ran** (offline, mocked HTTP, synthetic) and **what has
never run** (anything that would touch Lofty).

## Part 1 — Test plan

All tests live in `test_core.py`. No network and no real API call: `requests.get` is patched at
the backend (`cli_anything.lofty.utils.lofty_backend.requests.get`) or the recipe layer is fed a
fake getter. Every lead, stage, name and id is invented (`Fixture Alpha`, `L-1`,
`fixture-alpha@example.invalid`); the fixture key is `fixture-key-not-real-0000`.

| Class | What it proves |
|---|---|
| `TestGetOnly` | Greps every package source file: no `requests.post/put/patch/delete/request/Session`, no `.post(`/`.put(`/`.patch(`/`.delete(`, no `method=`, no `"POST"`/`"PUT"`/`"PATCH"`/`"DELETE"` literal, no `urllib`/`http.client`/`httpx`/`urlopen`; the only `requests.` names used are `get` and `RequestException`; `--help` exits 0 |
| `TestConfig` | Missing file → exit **5**, `type: not_configured`, names `LOFTY_API_KEY` and `~/.config/lofty/.env`, no request made, no traceback; empty `LOFTY_API_KEY=` → same, worded "is empty in"; text mode is one `Error:` line; file key wins, environment variable is the fallback; `config check` never prints the value and names `lofty-bridge` as the primary path; the `.env` parser handles comments, `export`, quotes |
| `TestBackend` | `Authorization: token <key>` to `https://api.lofty.com/v1.0/me` with the timeout; 401/403 → `auth_error` with the key **redacted** even when the server echoes it; 429 reported once, never retried; 404/5xx/3xx/non-JSON/204 mapped; transport exceptions structured |
| `TestRecipes` | `extract_rows` over bare lists, `leads`, nested `data.items`, empties; `leads list` sends `pageNum`/`pageSize` plus `--param` pass-through; `stage-totals` pages until a short page, counts Lofty's own stage names in frequency order, flags `truncated` at `--max-pages`; stage auto-detection incl. `{name: …}` objects; `timeline`/`get` hit `leads/{id}/activities` and `leads/{id}`; bad ids refused before any request |
| `TestRedaction` | phone/email/address redacted recursively without mutating input; CLI redacts by default, `--full --raw` shows contact fields and the body |
| `TestCLI` | `me` → identity; 401 → exit 1 `auth_error`, key never in output; 429 → one call; `stage-totals` end to end over two mocked pages; bad `--param` and bad id are structured errors with no request |
| `TestInstalledCommand` | The installed console script (`CLI_ANYTHING_FORCE_INSTALLED=1`): `--help` exit 0; `config check` offline → `configured: false`; `leads list` with no key → exit 5, no traceback |

## Part 2 — What ran (2026-09-22, throwaway venv `/tmp/h2-venv`, Python 3.11.15)

Install: `pip install .` from `integrations/cli-anything-harnesses/lofty/agent-harness` → `cli-anything-lofty 0.1.0`.
`cli-anything-lofty --help` → exit 0.

```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-9.1.1, pluggy-1.6.0 -- /tmp/h2-venv/bin/python
rootdir: /tmp
plugins: anyio-4.15.1
collecting ... collected 37 items

test_core.py::TestGetOnly::test_no_write_method_anywhere_in_package PASSED [  2%]
test_core.py::TestGetOnly::test_only_requests_get_is_used PASSED [  5%]
test_core.py::TestGetOnly::test_help_exit_0 PASSED [  8%]
test_core.py::TestConfig::test_missing_file_is_not_configured_named_variable_no_traceback PASSED [ 10%]
test_core.py::TestConfig::test_empty_key_in_file_is_not_configured PASSED [ 13%]
test_core.py::TestConfig::test_not_configured_text_mode_is_one_line PASSED [ 16%]
test_core.py::TestConfig::test_file_key_wins_then_environment_fallback PASSED [ 18%]
test_core.py::TestConfig::test_config_check_never_prints_the_value PASSED [ 21%]
test_core.py::TestConfig::test_env_file_parser PASSED [ 24%]
test_core.py::TestBackend::test_get_sends_token_header_to_v1_url PASSED [ 27%]
test_core.py::TestBackend::test_401_and_403_are_auth_errors_with_key_redacted PASSED [ 29%]
test_core.py::TestBackend::test_429_is_reported_not_retried PASSED [ 32%]
test_core.py::TestBackend::test_other_statuses[404-NotFound] PASSED [ 35%]
test_core.py::TestBackend::test_other_statuses[500-UpstreamError] PASSED [ 37%]
test_core.py::TestBackend::test_other_statuses[503-UpstreamError] PASSED [ 40%]
test_core.py::TestBackend::test_other_statuses[302-UpstreamError] PASSED [ 43%]
test_core.py::TestBackend::test_non_json_200_is_upstream_error PASSED [ 45%]
test_core.py::TestBackend::test_204_is_empty PASSED [ 48%]
test_core.py::TestBackend::test_transport_error_is_structured PASSED [ 51%]
test_core.py::TestRecipes::test_extract_rows_shapes PASSED [ 54%]
test_core.py::TestRecipes::test_list_leads_params_and_rows PASSED [ 56%]
test_core.py::TestRecipes::test_stage_totals_pages_and_stops PASSED [ 59%]
test_core.py::TestRecipes::test_stage_totals_truncation_flag PASSED [ 62%]
test_core.py::TestRecipes::test_stage_detection PASSED [ 64%]
test_core.py::TestRecipes::test_timeline_and_get_lead_paths PASSED [ 67%]
test_core.py::TestRecipes::test_bad_ids_refused_before_any_request PASSED [ 70%]
test_core.py::TestRedaction::test_contact_fields_redacted_recursively PASSED [ 72%]
test_core.py::TestRedaction::test_cli_redacts_by_default_and_full_shows PASSED [ 75%]
test_core.py::TestCLI::test_me_ok PASSED [ 78%]
test_core.py::TestCLI::test_auth_error_exit_1_key_never_shown PASSED [ 81%]
test_core.py::TestCLI::test_rate_limited_once PASSED [ 83%]
test_core.py::TestCLI::test_stage_totals_cli PASSED [ 86%]
test_core.py::TestCLI::test_bad_param_is_usage_level_error PASSED [ 89%]
test_core.py::TestCLI::test_bad_id_no_request PASSED [ 91%]
test_core.py::TestInstalledCommand::test_help_exit_0 PASSED [ 94%]
test_core.py::TestInstalledCommand::test_config_check_offline PASSED [ 97%]
test_core.py::TestInstalledCommand::test_not_configured_exit_5_no_traceback PASSED [100%]

============================== 37 passed in 0.82s ==============================
```

37 passed, 0 failed, 0 skipped, 0.82 s. Deterministic; no network.

## Part 3 — What has NEVER run

- Nothing has ever touched Lofty. `LOFTY_API_KEY` has never existed in any environment this was
  built or reviewed in, and no Lofty pull has ever succeeded through the bridge either.
- Therefore unverified: the pagination parameter names (`pageNum`/`pageSize`), the response
  envelope (`extract_rows` is tolerant; `--raw` shows the body), the stage field name, and whether
  `GET /v1.0/me` returns an identity object in the shape the skill assumes.
- The REPL has not been driven interactively (prompt-toolkit needs a TTY).
- No `loftyLeads` / `loftySyncLog` write has been made; this CLI writes no deck document.
