# TEST.md — cli-anything-zoho

Two halves, kept apart on purpose: **what ran** (offline, mocked HTTP, synthetic) and **what has
never run** (anything that would touch Zoho, including the token helper).

## Part 1 — Test plan

All tests live in `test_core.py`. No network and no real API call: `requests.get` is patched at
the backend (`cli_anything.zoho.utils.zoho_backend.requests.get`) or the recipe layer is fed a
fake getter. Every record, name and id is invented (`Fixture Alpha`, `100000000000000001`,
`fixture-alpha@example.invalid`); the fixture credentials are fakes. The 403 body used is the exact
shape Zoho returned on 2026-09-22: `{"code":"NO_PERMISSION","details":{"permissions":
["Crm_Implied_Api_Access"]},"message":"permission denied","status":"error"}`.

| Class | What it proves |
|---|---|
| `TestGetOnly` | Greps every package source file: no `requests.post/put/patch/delete/request/Session`, no `.post(`/`.put(`/`.patch(`/`.delete(`, no `method=`, no `"POST"`/`"PUT"`/`"PATCH"`/`"DELETE"` literal, no `urllib`/`http.client`/`httpx`/`urlopen`; only `requests.get` and `requests.RequestException` are used; no shell script inside the package; the out-of-package helper `tools/mint-access-token.sh` passes `bash -n`, POSTs only to `oauth/v2/token`, and never echoes the secret or refresh token; `--help` exits 0 |
| `TestConfig` | Missing file → exit **5**, `type: not_configured`, names all five file variables, no request, no traceback; an empty variable is named; missing `ZOHO_ACCESS_TOKEN` → exit 5 naming it and the mint helper ("never mints"); `config check` reports names only — no secret appears in output |
| `TestProfilePermission` | For `leads list`, `deals list`, `fields Leads`, `leads get`, `deals get`: a 403 `NO_PERMISSION` body → exit **4**, `type: profile_permission_denied`, error starts with **"profile permission not granted — this is a Zoho-side setting, not a credential problem"**, `zohoCode`/`details` verbatim, `fix` carries "Setup → Security Control → Profiles" and "Zoho CRM API Access", **exactly one** `requests.get` (never retried), no rows; `selftest` → `status: blocked`, `httpCode: 403`, the exact `fix` string, `per_page=1` with the default fields; text mode prints reason and fix; a non-JSON 403 mentioning `Crm_Implied_Api_Access` still maps; a 403 with another code is a plain `auth_error` without the profile message |
| `TestBackend` | `Authorization: Zoho-oauthtoken <token>` to `https://www.zohoapis.com/crm/v8/Leads` with params and timeout; 204 → empty page; 401 `INVALID_TOKEN` says expired and points at the helper; 401 `OAUTH_SCOPE_MISMATCH` names the scopes; the token is **redacted** even when a server echoes it; 404/`INVALID_MODULE`/429/5xx/other 4xx mapped with one call each; transport exceptions structured |
| `TestRecipes` | Default fields and `per_page` sent; `--all` follows `page_token` and stops at `more_records: false`; `--max-pages` flags `truncated` and keeps `nextPageToken`; `get` and `fields` hit `Leads/{id}` and `settings/fields?module=`; bad modules and non-numeric ids refused before any request; `per_page` clamped to 200 |
| `TestCLI` | `leads list` redacts `Email`/`Mobile` by default and `--full --raw` shows them; `selftest` `ok` on 200 and `error` on 503; redaction never mutates input; bad id → structured error, no request |
| `TestInstalledCommand` | The installed console script (`CLI_ANYTHING_FORCE_INSTALLED=1`): `--help` exit 0; `config check` offline → `configured: false`; `selftest` with nothing configured → exit 5, `status: not-configured`, no traceback |

## Part 2 — What ran (2026-09-22, throwaway venv `/tmp/h2-venv`, Python 3.11.15)

Install: `pip install .` from `integrations/cli-anything-harnesses/zoho/agent-harness` → `cli-anything-zoho 0.1.0`.
`cli-anything-zoho --help` → exit 0. Run with `CLI_ANYTHING_REPO_ROOT=/home/user/Repo` so the
helper-script test finds `tools/mint-access-token.sh` from site-packages.

```
============================= test session starts ==============================
platform linux -- Python 3.11.15, pytest-9.1.1, pluggy-1.6.0 -- /tmp/h2-venv/bin/python
rootdir: /tmp
plugins: anyio-4.15.1
collecting ... collected 43 items

test_core.py::TestGetOnly::test_no_write_method_anywhere_in_package PASSED [  2%]
test_core.py::TestGetOnly::test_only_requests_get_is_used PASSED [  4%]
test_core.py::TestGetOnly::test_token_minting_is_outside_the_package PASSED [  6%]
test_core.py::TestGetOnly::test_help_exit_0 PASSED [  9%]
test_core.py::TestConfig::test_missing_file_names_the_five_variables_exit_5 PASSED [ 11%]
test_core.py::TestConfig::test_empty_variable_in_file_named PASSED [ 13%]
test_core.py::TestConfig::test_missing_access_token_points_at_the_mint_helper PASSED [ 16%]
test_core.py::TestConfig::test_config_check_names_only PASSED [ 18%]
test_core.py::TestConfig::test_config_check_not_configured PASSED [ 20%]
test_core.py::TestProfilePermission::test_every_recipe_maps_403_no_permission_exit_4_no_retry[args0] PASSED [ 23%]
test_core.py::TestProfilePermission::test_every_recipe_maps_403_no_permission_exit_4_no_retry[args1] PASSED [ 25%]
test_core.py::TestProfilePermission::test_every_recipe_maps_403_no_permission_exit_4_no_retry[args2] PASSED [ 27%]
test_core.py::TestProfilePermission::test_every_recipe_maps_403_no_permission_exit_4_no_retry[args3] PASSED [ 30%]
test_core.py::TestProfilePermission::test_every_recipe_maps_403_no_permission_exit_4_no_retry[args4] PASSED [ 32%]
test_core.py::TestProfilePermission::test_selftest_maps_to_blocked_with_exact_fix PASSED [ 34%]
test_core.py::TestProfilePermission::test_text_mode_prints_reason_and_fix PASSED [ 37%]
test_core.py::TestProfilePermission::test_non_json_403_mentioning_the_permission_still_maps PASSED [ 39%]
test_core.py::TestProfilePermission::test_other_403_is_a_plain_auth_error_not_the_profile_message PASSED [ 41%]
test_core.py::TestBackend::test_get_sends_oauthtoken_header_to_v8_url PASSED [ 44%]
test_core.py::TestBackend::test_204_is_an_empty_page PASSED [ 46%]
test_core.py::TestBackend::test_401_invalid_token_says_expired_and_mint PASSED [ 48%]
test_core.py::TestBackend::test_401_scope_mismatch_names_scopes PASSED [ 51%]
test_core.py::TestBackend::test_token_never_leaks_into_errors PASSED [ 53%]
test_core.py::TestBackend::test_other_statuses[404-body0-NotFound] PASSED [ 55%]
test_core.py::TestBackend::test_other_statuses[400-body1-NotFound] PASSED [ 58%]
test_core.py::TestBackend::test_other_statuses[429-None-RateLimited] PASSED [ 60%]
test_core.py::TestBackend::test_other_statuses[500-None-UpstreamError] PASSED [ 62%]
test_core.py::TestBackend::test_other_statuses[400-body4-UpstreamError] PASSED [ 65%]
test_core.py::TestBackend::test_transport_error_is_structured PASSED [ 67%]
test_core.py::TestRecipes::test_list_defaults_and_rows PASSED [ 69%]
test_core.py::TestRecipes::test_all_pages_follow_page_token_and_stop PASSED [ 72%]
test_core.py::TestRecipes::test_all_pages_max_pages_truncates PASSED [ 74%]
test_core.py::TestRecipes::test_get_record_and_fields_paths PASSED [ 76%]
test_core.py::TestRecipes::test_bad_module_and_id_refused_before_any_request PASSED [ 79%]
test_core.py::TestRecipes::test_per_page_clamped PASSED [ 81%]
test_core.py::TestCLI::test_leads_list_redacts_by_default_full_shows PASSED [ 83%]
test_core.py::TestCLI::test_selftest_ok PASSED [ 86%]
test_core.py::TestCLI::test_selftest_error_status PASSED [ 88%]
test_core.py::TestCLI::test_redact_module_untouched_input PASSED [ 90%]
test_core.py::TestCLI::test_bad_id_no_request PASSED [ 93%]
test_core.py::TestInstalledCommand::test_help_exit_0 PASSED [ 95%]
test_core.py::TestInstalledCommand::test_config_check_offline PASSED [ 97%]
test_core.py::TestInstalledCommand::test_not_configured_exit_5_no_traceback PASSED [100%]

============================== 43 passed in 0.84s ==============================
```

Deterministic; no network. (A first run had one failure in a test fixture — the fake getter matched
`settings/fields` as a record path — fixed in the test, not the code, and re-run in full.)

## Part 3 — What has NEVER run

- Nothing has ever touched Zoho. No Zoho credential exists in any environment this was built in.
  The v8 request contract (`fields`, `per_page`, `page_token`, `info.*`, `settings/fields`) is as
  the sync skill records it; the first live call is the proof.
- `tools/mint-access-token.sh` has been syntax-checked (`bash -n`) only. It has never minted a
  token.
- The expected live result **before** Steven flips the profile toggle is exit 4, `status: blocked`.
  That outcome has been simulated with the recorded 403 body, not observed through this CLI.
- The REPL has not been driven interactively (prompt-toolkit needs a TTY).
- No `zohoSync` / `zohoLeads` / `zohoDeals` / `zohoSyncLog` write has been made; this CLI writes
  no deck document.
