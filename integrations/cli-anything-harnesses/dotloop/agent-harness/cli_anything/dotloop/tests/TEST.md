# TEST.md — cli-anything-dotloop

Two halves, kept apart on purpose: **what ran** (offline, mocked HTTP, synthetic) and **what has
never run** (anything that would touch dotloop, including both token scripts).

## Part 1 — Test plan

All tests live in `test_core.py`. No network and no real API call: `requests.get` is patched at
the backend (`cli_anything.dotloop.utils.dotloop_backend.requests.get`) or the recipe layer is fed
a fake getter. Every record, name, id and token is invented (`Fixture Account`, `111111`,
`buyer@example.invalid`); the fixture credentials are fakes. The 403 body used is a plausible
OAuth-style shape, not a vendor-confirmed one — see the note in `TestForbidden` and in
`dotloop_backend.py`'s module docstring: no live dotloop error body has ever been observed.

| Class | What it proves |
|---|---|
| `TestGetOnly` | Greps every package source file: no `requests.post/put/patch/delete/request/Session`, no `.post(`/`.put(`/`.patch(`/`.delete(`, no `method=`, no `"POST"`/`"PUT"`/`"PATCH"`/`"DELETE"` literal, no `urllib`/`http.client`/`httpx`/`urlopen`; only `requests.get` and `requests.RequestException` are used; no shell script inside the package; both out-of-package helpers (`tools/mint-access-token.sh`, `tools/exchange-auth-code.sh`) pass `bash -n`, POST only to `oauth/token`, and never echo the client secret or refresh token; `--help` exits 0 and carries no bare word `act` |
| `TestConfig` | Missing file → exit **5**, `type: not_configured`, names all five file variables, no request, no traceback; an empty variable is named; missing `DOTLOOP_ACCESS_TOKEN` → exit 5 naming it and the mint helper; `config check` reports names only — no secret appears in output |
| `TestForbidden` | For every recipe: a 403 body → exit **4**, `type: forbidden`, `fix` names the OAuth-scope check and `exchange-auth-code.sh`, **exactly one** `requests.get` call (never retried), the raw body is passed through under `details` rather than parsed for a specific vendor code; `selftest` → `status: blocked`, `httpCode: 403`; text mode prints reason and fix |
| `TestBackend` | `Authorization: Bearer <token>` sent to `{api_url}/{path}` with params and timeout; a 204/empty body → `{}`; 401 says expired and points at the mint helper; the token is **redacted** even when a server echoes it back in an error body; 404/429/5xx/other 4xx mapped with one call each; transport exceptions structured |
| `TestRecipes` | `_rows()` unwraps a bare JSON array, unwraps a `data`-keyed dict, and falls back to a one-item list for anything else (with `raw` always the untouched body); `get_loop`/`get_loop_detail`/`list_participants` hit the right paths; bad profile/loop ids are refused before any request; `account_get`/`selftest` round-trip |
| `TestCLI` | `participants list` redacts `email`/`phone` by default and `--full --raw` shows them; `selftest` `ok` on 200 and `error` on 503; redaction never mutates input; bad id → structured error, no request; `loops list --param k=v` passes filter/sort names through untouched, exactly as the README says this CLI does not guess dotloop's own query-parameter names |
| `TestInstalledCommand` | The installed console script (`CLI_ANYTHING_FORCE_INSTALLED=1` if forcing it): `--help` exit 0; `config check` offline → `configured: false`; `selftest` with nothing configured → exit 5, `status: not-configured`, no traceback |

## Part 2 — What ran (2026-09-27, throwaway venv, Python 3.11.15)

```
pip install integrations/cli-anything-harnesses/dotloop/agent-harness   # exit 0, cli-anything-dotloop 0.1.0
cli-anything-dotloop --help                                              # exit 0
CLI_ANYTHING_REPO_ROOT=<repo worktree> python -m pytest cli_anything/dotloop/tests -v
```

```
============================== 43 passed in 0.69s ==============================
```

Every test class above ran and passed; no skips. One test bug was found and fixed during this same
pass (`TestBackend::test_token_never_leaks_into_errors` had a dead `pytest.raises` block that
asserted nothing) — fixed in the test, not the code, and the full 43 re-run green afterward, the
same discipline `cli-anything-zoho`'s own TEST.md records for itself.

Deterministic; no network; `requests.get` never called with a real host.

## Part 3 — What has NEVER run

- Nothing has ever touched dotloop. No dotloop app registration, client id/secret, or account
  exists in any environment this was built in.
- `tools/mint-access-token.sh` and `tools/exchange-auth-code.sh` have been syntax-checked
  (`bash -n`) only. Neither has ever made a real HTTP request.
- The one-time authorization-code consent (a browser sign-in Steven must do) has never happened,
  so `DOTLOOP_REFRESH_TOKEN` has never existed anywhere this was built.
- dotloop's own developer docs (`dotloop.github.io/public-api/`) were never read directly — every
  attempt in this session hit the sandbox's egress proxy. The base URL, OAuth endpoints, Bearer
  scheme and rate limit come from a third-party profile (`github.com/api-evangelist/dotloop`,
  read 2026-09-27); the exact list-response envelope, the exact 403/401 error-body shape, and the
  exact loop-list filter/sort query-parameter names are **not confirmed** — see the honesty notes
  in `dotloop_backend.py` and `core/loops.py`. The first live call is the real proof, not this
  package's tests.
- The REPL has not been driven interactively (prompt-toolkit needs a TTY).
- No deck document is written by this CLI; it has no sync-skill counterpart yet.
