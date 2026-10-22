"""Unit tests for cli-anything-dotloop — offline, mocked HTTP, synthetic data.

No network and no real API call: ``requests.get`` is patched at the backend. Every record, name,
id and token below is invented; the fixture credentials are fakes.

Run:
    python -m pytest cli_anything/dotloop/tests -v
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from click.testing import CliRunner

from cli_anything.dotloop import dotloop_cli
from cli_anything.dotloop.core import loops, redact
from cli_anything.dotloop.utils import dotloop_backend as backend

PKG_DIR = Path(dotloop_cli.__file__).resolve().parent
FAKE_TOKEN = "fixture-token-not-real-0000"
GET = "cli_anything.dotloop.utils.dotloop_backend.requests.get"

ACCOUNT_200 = {"id": 9000001, "name": "Fixture Account", "email": "fixture-account@example.invalid"}
PROFILE_LIST_200 = [{"id": 111111, "name": "Fixture Brokerage", "default": True}]
LOOP_LIST_200 = {"data": [
    {"id": 222222, "name": "123 Fixture St, Example CA", "status": "PRE_OFFER",
     "transactionType": "PURCHASE_OFFER"},
]}
PARTICIPANT_LIST_200 = {"data": [
    {"id": 333331, "fullName": "Fixture Buyer", "email": "buyer@example.invalid",
     "phone": "000-000-0001", "role": "BUYER"},
    {"id": 333332, "fullName": "Fixture Agent", "role": "BUYING_AGENT"},
]}
# The exact shape of a real dotloop 403 body has never been observed (no live call, ever). This
# is a plausible OAuth-style body used only to prove the CLI's *generic* handling, not to assert
# a vendor-confirmed code the way the zoho harness does with Zoho's re-probed NO_PERMISSION.
FORBIDDEN_403 = {"error": "insufficient_scope", "message": "the token does not grant this scope"}


def _resp(status, body=None, text=None):
    payload = text if text is not None else (json.dumps(body) if body is not None else "")
    def _json():
        return json.loads(payload)
    return SimpleNamespace(status_code=status, text=payload, json=_json, headers={})


def _env_file(tmp_path, **overrides):
    values = {"DOTLOOP_AUTH_URL": "https://auth.dotloop.com",
              "DOTLOOP_API_URL": "https://api-gateway.dotloop.com/public/v2",
              "DOTLOOP_CLIENT_ID": "fixture-client-id", "DOTLOOP_CLIENT_SECRET": "fixture-client-secret",
              "DOTLOOP_REFRESH_TOKEN": "fixture-refresh-token"}
    values.update(overrides)
    f = tmp_path / "dotloop.env"
    f.write_text("# fixture\n" + "".join(f"{k}={v}\n" for k, v in values.items()))
    return f


@pytest.fixture
def cfg_env(tmp_path):
    return {backend.ENV_FILE_VAR: str(_env_file(tmp_path)), backend.TOKEN_VAR: FAKE_TOKEN,
            "HOME": str(tmp_path)}


@pytest.fixture(autouse=True)
def _reset_cli_state():
    dotloop_cli._json_output = dotloop_cli._full_output = dotloop_cli._raw_output = False
    yield


def _invoke(args, env):
    return CliRunner().invoke(dotloop_cli.cli, args, env=env)


# ── GET only, by construction ────────────────────────────────────
class TestGetOnly:
    FORBIDDEN = re.compile(
        r"requests\.(post|put|patch|delete|request|Session)\b|\.(post|put|patch|delete)\(|"
        r"\bmethod\s*=|[\"'](POST|PUT|PATCH|DELETE)[\"']|urllib\.request|http\.client|httpx|urlopen|Request\(")

    def _sources(self):
        return [p for p in PKG_DIR.rglob("*.py") if "tests" not in p.parts and p.name != "repl_skin.py"]

    def test_no_write_method_anywhere_in_package(self):
        for py in self._sources():
            src = py.read_text(encoding="utf-8")
            m = self.FORBIDDEN.search(src)
            assert m is None, f"{py}: {m.group(0)!r}"

    def test_only_requests_get_is_used(self):
        used = set()
        for py in self._sources():
            used |= set(re.findall(r"\brequests\.(\w+)", py.read_text(encoding="utf-8")))
        assert used <= {"get", "RequestException"}, used
        assert "get" in used

    def test_token_minting_is_outside_the_package(self):
        assert not list(PKG_DIR.rglob("*.sh"))
        candidates = [PKG_DIR.parents[2] / "tools" / "mint-access-token.sh",
                      Path(os.environ.get("CLI_ANYTHING_REPO_ROOT", "/nonexistent"))
                      / "integrations/cli-anything-harnesses/dotloop/tools/mint-access-token.sh"]
        helper = next((c for c in candidates if c.exists()), None)
        if helper is None:
            pytest.skip("helper lives in the repo checkout; set CLI_ANYTHING_REPO_ROOT to find it from site-packages")
        assert subprocess.run(["bash", "-n", str(helper)], capture_output=True).returncode == 0
        src = helper.read_text()
        assert "oauth/token" in src and "-X POST" in src
        assert not re.search(r"echo .*\$(DOTLOOP_)?(CLIENT_SECRET|REFRESH_TOKEN)", src)

    def test_auth_code_exchange_is_also_outside_the_package(self):
        candidates = [PKG_DIR.parents[2] / "tools" / "exchange-auth-code.sh",
                      Path(os.environ.get("CLI_ANYTHING_REPO_ROOT", "/nonexistent"))
                      / "integrations/cli-anything-harnesses/dotloop/tools/exchange-auth-code.sh"]
        helper = next((c for c in candidates if c.exists()), None)
        if helper is None:
            pytest.skip("helper lives in the repo checkout; set CLI_ANYTHING_REPO_ROOT to find it from site-packages")
        assert subprocess.run(["bash", "-n", str(helper)], capture_output=True).returncode == 0
        src = helper.read_text()
        assert "authorization_code" in src and "-X POST" in src
        assert not re.search(r"echo .*\$(DOTLOOP_)?(CLIENT_SECRET|REFRESH_TOKEN)", src)

    def test_help_exit_0(self):
        r = _invoke(["--help"], env={})
        assert r.exit_code == 0 and "GET-only" in r.output

    def test_no_act_verb_in_help(self):
        r = _invoke(["--help"], env={})
        assert not re.search(r"\bact\b", r.output)


# ── Configuration ────────────────────────────────────────────────
class TestConfig:
    def test_missing_file_names_the_five_variables_exit_5(self, tmp_path):
        env = {backend.ENV_FILE_VAR: str(tmp_path / "missing.env"), backend.TOKEN_VAR: None, "HOME": str(tmp_path)}
        with patch(GET) as get:
            r = _invoke(["--json", "loops", "list", "111111"], env=env)
        assert r.exit_code == backend.NOT_CONFIGURED_EXIT == 5
        get.assert_not_called()
        d = json.loads(r.output)
        assert d["type"] == "not_configured"
        for v in backend.FILE_VARS:
            assert v in d["error"]
        assert "Traceback" not in r.output

    def test_empty_variable_in_file_named(self, tmp_path):
        f = _env_file(tmp_path, DOTLOOP_REFRESH_TOKEN="")
        env = {backend.ENV_FILE_VAR: str(f), backend.TOKEN_VAR: FAKE_TOKEN, "HOME": str(tmp_path)}
        r = _invoke(["--json", "profiles", "list"], env=env)
        assert r.exit_code == 5 and "DOTLOOP_REFRESH_TOKEN empty" in json.loads(r.output)["error"]

    def test_missing_access_token_points_at_the_mint_helper(self, tmp_path):
        env = {backend.ENV_FILE_VAR: str(_env_file(tmp_path)), backend.TOKEN_VAR: None, "HOME": str(tmp_path)}
        with patch(GET) as get:
            r = _invoke(["--json", "selftest"], env=env)
        assert r.exit_code == 5
        get.assert_not_called()
        d = json.loads(r.output)
        assert d["status"] == "not-configured" and "DOTLOOP_ACCESS_TOKEN" in d["error"]
        assert "mint-access-token.sh" in d["error"]

    def test_config_check_names_only(self, cfg_env):
        r = _invoke(["--json", "config", "check"], env=cfg_env)
        assert r.exit_code == 0
        d = json.loads(r.output)
        assert d["configured"] is True and all(d["fileVariables"].values())
        assert d["accessTokenInEnvironment"] is True
        for secret in ("fixture-client-secret", "fixture-refresh-token", FAKE_TOKEN):
            assert secret not in r.output

    def test_config_check_not_configured(self, tmp_path):
        env = {backend.ENV_FILE_VAR: str(tmp_path / "none.env"), backend.TOKEN_VAR: None, "HOME": str(tmp_path)}
        d = json.loads(_invoke(["--json", "config", "check"], env=env).output)
        assert d["configured"] is False and d["envFileExists"] is False


# ── The 403 mapping (generic — no vendor code has ever been confirmed live) ─
class TestForbidden:
    @pytest.mark.parametrize("args", [
        ["profiles", "list"], ["loops", "list", "111111"], ["loops", "get", "111111", "222222"],
        ["participants", "list", "111111", "222222"], ["documents", "list", "111111", "222222"],
        ["activity", "list", "111111", "222222"],
    ])
    def test_every_recipe_maps_403_to_forbidden_exit_4_no_retry(self, args, cfg_env):
        with patch(GET, return_value=_resp(403, FORBIDDEN_403)) as get:
            r = _invoke(["--json"] + args, env=cfg_env)
        assert r.exit_code == backend.FORBIDDEN_EXIT == 4, r.output
        assert get.call_count == 1                     # never retried into the block
        d = json.loads(r.output)
        assert d["type"] == "forbidden" and d["httpStatus"] == 403
        assert "OAuth scopes" in d["fix"] and "exchange-auth-code.sh" in d["fix"]
        assert d["details"] == FORBIDDEN_403
        assert "rows" not in d

    def test_selftest_maps_to_blocked(self, cfg_env):
        with patch(GET, return_value=_resp(403, FORBIDDEN_403)) as get:
            r = _invoke(["--json", "selftest"], env=cfg_env)
        assert r.exit_code == 4 and get.call_count == 1
        d = json.loads(r.output)
        assert d["status"] == "blocked" and d["httpCode"] == 403

    def test_text_mode_prints_reason_and_fix(self, cfg_env):
        with patch(GET, return_value=_resp(403, FORBIDDEN_403)):
            r = _invoke(["profiles", "list"], env=cfg_env)
        assert r.exit_code == 4 and "forbidden" in r.output and "Fix: Check the OAuth scopes" in r.output


# ── The HTTP layer ───────────────────────────────────────────────
class TestBackend:
    def _cfg(self):
        return backend.Config(api_url="https://api-gateway.dotloop.com/public/v2",
                               access_token=FAKE_TOKEN, env_file="fixture")

    def test_get_sends_bearer_header_to_the_configured_url(self):
        with patch(GET, return_value=_resp(200, PROFILE_LIST_200)) as get:
            body = backend.get(self._cfg(), "profile", {"foo": "bar"})
        assert body == PROFILE_LIST_200
        args, kwargs = get.call_args
        assert args[0] == "https://api-gateway.dotloop.com/public/v2/profile"
        assert kwargs["headers"]["Authorization"] == f"Bearer {FAKE_TOKEN}"
        assert kwargs["params"] == {"foo": "bar"} and kwargs["timeout"] == backend.TIMEOUT_SECONDS

    def test_204_is_an_empty_body(self):
        with patch(GET, return_value=_resp(204, text="")):
            assert backend.get(self._cfg(), "profile") == {}

    def test_401_says_expired_and_points_at_mint(self):
        with patch(GET, return_value=_resp(401, {"error": "invalid_token"})):
            with pytest.raises(backend.AuthError) as ei:
                backend.get(self._cfg(), "account")
        assert "expired" in str(ei.value) and "mint-access-token.sh" in str(ei.value)

    def test_token_never_leaks_into_errors(self):
        with patch(GET, return_value=_resp(401, text=f"bad token {FAKE_TOKEN}")):
            with pytest.raises(backend.AuthError) as ei:
                backend.get(self._cfg(), "account")
        assert FAKE_TOKEN not in str(ei.value)
        with patch(GET, return_value=_resp(500, text=f"upstream saw {FAKE_TOKEN}")):
            with pytest.raises(backend.UpstreamError) as ei:
                backend.get(self._cfg(), "account")
        assert FAKE_TOKEN not in str(ei.value) and "[redacted]" in str(ei.value)

    @pytest.mark.parametrize("status,body,exc", [
        (404, {"error": "not_found"}, backend.NotFound),
        (429, None, backend.RateLimited),
        (500, None, backend.UpstreamError),
        (400, {"error": "bad_request"}, backend.UpstreamError),
    ])
    def test_other_statuses(self, status, body, exc):
        with patch(GET, return_value=_resp(status, body, text=None if body else "x")) as get:
            with pytest.raises(exc):
                backend.get(self._cfg(), "account")
        assert get.call_count == 1

    def test_transport_error_is_structured(self):
        import requests
        with patch(GET, side_effect=requests.ConnectionError("boom")):
            with pytest.raises(backend.TransportError) as ei:
                backend.get(self._cfg(), "account")
        assert "ConnectionError" in str(ei.value)


# ── Recipes ──────────────────────────────────────────────────────
class TestRecipes:
    def test_list_profiles_unwraps_a_bare_array(self):
        out = loops.list_profiles(lambda path, params: PROFILE_LIST_200)
        assert out["count"] == 1 and out["rows"] == PROFILE_LIST_200

    def test_list_loops_unwraps_a_data_key(self):
        seen = []
        def get(path, params):
            seen.append((path, params)); return LOOP_LIST_200
        out = loops.list_loops(get, "111111", {"batch_size": "50"})
        assert seen == [("profile/111111/loop", {"batch_size": "50"})]
        assert out["count"] == 1 and out["rows"] == LOOP_LIST_200["data"]

    def test_rows_falls_back_to_single_item_for_a_plain_object(self):
        assert loops._rows({"id": 1, "name": "x"}) == [{"id": 1, "name": "x"}]
        assert loops._rows(None) == [] and loops._rows({}) == []

    def test_get_loop_and_detail_and_participants_hit_the_right_paths(self):
        calls = []
        def get(path, params):
            calls.append(path)
            if path.endswith("/loop-detail"):
                return {"squareFeet": 1800}
            if path.endswith("/participant"):
                return PARTICIPANT_LIST_200
            return {"id": 222222, "name": "Fixture Loop"}
        rec = loops.get_loop(get, "111111", "222222")
        det = loops.get_loop_detail(get, "111111", "222222")
        parts = loops.list_participants(get, "111111", "222222")
        assert calls == ["profile/111111/loop/222222", "profile/111111/loop/222222/loop-detail",
                          "profile/111111/loop/222222/participant"]
        assert rec["loop"]["name"] == "Fixture Loop"
        assert det["detail"]["squareFeet"] == 1800
        assert parts["count"] == 2

    def test_bad_ids_refused_before_any_request(self):
        def get(path, params):
            raise AssertionError("must not be called")
        for bad in ("", "abc", "1/2", "x" * 30):
            with pytest.raises(ValueError):
                loops.get_profile(get, bad)
            with pytest.raises(ValueError):
                loops.list_loops(get, bad)
            with pytest.raises(ValueError):
                loops.get_loop(get, "111111", bad)
            with pytest.raises(ValueError):
                loops.list_participants(get, "111111", bad)

    def test_account_get_and_selftest(self):
        out = loops.account_get(lambda path, params: ACCOUNT_200)
        assert out["account"] == ACCOUNT_200
        st = loops.selftest(lambda path, params: ACCOUNT_200)
        assert st["status"] == "ok" and st["httpCode"] == 200 and st["account"] == ACCOUNT_200


# ── Redaction and CLI happy paths ────────────────────────────────
class TestCLI:
    def test_participants_list_redacts_by_default_full_shows(self, cfg_env):
        with patch(GET, return_value=_resp(200, PARTICIPANT_LIST_200)):
            r = _invoke(["--json", "participants", "list", "111111", "222222"], env=cfg_env)
            assert r.exit_code == 0, r.output
            d = json.loads(r.output)
            assert d["rows"][0]["email"] == "[redacted]" and d["rows"][0]["phone"] == "[redacted]"
            assert d["rows"][0]["fullName"] == "Fixture Buyer" and "raw" not in d
            assert "example.invalid" not in r.output
            r = _invoke(["--json", "--full", "--raw", "participants", "list", "111111", "222222"], env=cfg_env)
            d = json.loads(r.output)
            assert d["rows"][0]["email"].endswith("example.invalid") and "raw" in d

    def test_selftest_ok(self, cfg_env):
        with patch(GET, return_value=_resp(200, ACCOUNT_200)):
            r = _invoke(["--json", "selftest"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 0 and d["status"] == "ok" and d["source"] == loops.SOURCE

    def test_selftest_error_status(self, cfg_env):
        with patch(GET, return_value=_resp(503, text="down")):
            r = _invoke(["--json", "selftest"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 1 and d["status"] == "error" and d["httpCode"] == 503

    def test_redact_module_never_mutates_input(self):
        before = json.dumps(PARTICIPANT_LIST_200)
        out = redact.redact(PARTICIPANT_LIST_200)
        assert out["data"][0]["phone"] == "[redacted]"
        assert json.dumps(PARTICIPANT_LIST_200) == before

    def test_bad_id_no_request(self, cfg_env):
        with patch(GET) as get:
            r = _invoke(["--json", "loops", "get", "111111", "not-an-id"], env=cfg_env)
        assert r.exit_code == 1 and json.loads(r.output)["type"] == "ValueError"
        get.assert_not_called()

    def test_loops_list_passes_through_params_untouched(self, cfg_env):
        with patch(GET, return_value=_resp(200, LOOP_LIST_200)) as get:
            r = _invoke(["--json", "loops", "list", "111111", "--param", "status=PRE_OFFER",
                         "--param", "batch_size=10"], env=cfg_env)
        assert r.exit_code == 0
        assert get.call_args.kwargs["params"] == {"status": "PRE_OFFER", "batch_size": "10"}


# ── The installed command, as a subprocess ───────────────────────
def _resolve_cli(name: str) -> list[str]:
    exe = shutil.which(name) or (
        str(Path(sys.executable).parent / name) if (Path(sys.executable).parent / name).exists() else None)
    if exe:
        print(f"[_resolve_cli] Using installed command: {exe}")
        return [exe]
    if os.environ.get("CLI_ANYTHING_FORCE_INSTALLED") == "1":
        raise RuntimeError(f"{name} is not installed and CLI_ANYTHING_FORCE_INSTALLED=1")
    print("[_resolve_cli] Falling back to python -m cli_anything.dotloop")
    return [sys.executable, "-m", "cli_anything.dotloop"]


class TestInstalledCommand:
    CLI = _resolve_cli("cli-anything-dotloop")

    def _run(self, args, tmp_path):
        env = {k: v for k, v in os.environ.items() if k not in (backend.TOKEN_VAR, backend.ENV_FILE_VAR)}
        env["HOME"] = str(tmp_path)
        env[backend.ENV_FILE_VAR] = str(tmp_path / "missing.env")
        return subprocess.run(self.CLI + args, capture_output=True, text=True, env=env, timeout=60)

    def test_help_exit_0(self, tmp_path):
        r = self._run(["--help"], tmp_path)
        assert r.returncode == 0, r.stderr

    def test_config_check_offline(self, tmp_path):
        r = self._run(["--json", "config", "check"], tmp_path)
        assert r.returncode == 0 and json.loads(r.stdout)["configured"] is False

    def test_not_configured_exit_5_no_traceback(self, tmp_path):
        r = self._run(["--json", "selftest"], tmp_path)
        assert r.returncode == 5 and json.loads(r.stdout)["status"] == "not-configured"
        assert "Traceback" not in r.stderr
