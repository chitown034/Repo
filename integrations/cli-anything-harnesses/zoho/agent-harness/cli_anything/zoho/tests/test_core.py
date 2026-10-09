"""Unit tests for cli-anything-zoho — offline, mocked HTTP, synthetic data.

No network and no real API call: ``requests.get`` is patched at the backend.
Every record, name and id below is invented; the fixture credentials are fakes.

Run:
    python -m pytest cli_anything/zoho/tests -v
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

from cli_anything.zoho import zoho_cli
from cli_anything.zoho.core import crm, redact
from cli_anything.zoho.utils import zoho_backend as backend

PKG_DIR = Path(zoho_cli.__file__).resolve().parent
FAKE_TOKEN = "fixture-token-not-real-0000"
GET = "cli_anything.zoho.utils.zoho_backend.requests.get"

# The exact body Zoho returns today (re-probed 2026-09-22 13:35 UTC) when the profile toggle is off.
NO_PERMISSION_403 = {"code": "NO_PERMISSION", "details": {"permissions": ["Crm_Implied_Api_Access"]},
                     "message": "permission denied", "status": "error"}
LEADS_200 = {"data": [
    {"id": "100000000000000001", "Last_Name": "Fixture Alpha", "Company": "Example Co", "Lead_Status": "NEW",
     "Lead_Source": "Fixture", "Email": "fixture-alpha@example.invalid", "Phone": "000-000-0001",
     "Created_Time": "2026-09-01T00:00:00+00:00", "Modified_Time": "2026-09-02T00:00:00+00:00"},
    {"id": "100000000000000002", "Last_Name": "Fixture Beta", "Lead_Status": "Contact Established",
     "Mobile": "000-000-0002"},
], "info": {"per_page": 200, "count": 2, "page": 1, "more_records": False}}


def _resp(status, body=None, text=None):
    payload = text if text is not None else (json.dumps(body) if body is not None else "")
    def _json():
        return json.loads(payload)
    return SimpleNamespace(status_code=status, text=payload, json=_json, headers={})


def _env_file(tmp_path, **overrides):
    values = {"ZOHO_ACCOUNTS_URL": "https://accounts.zoho.com", "ZOHO_API_URL": "https://www.zohoapis.com",
              "ZOHO_CLIENT_ID": "fixture-client-id", "ZOHO_CLIENT_SECRET": "fixture-client-secret",
              "ZOHO_REFRESH_TOKEN": "fixture-refresh-token"}
    values.update(overrides)
    f = tmp_path / "zoho.env"
    f.write_text("# fixture\n" + "".join(f"{k}={v}\n" for k, v in values.items()))
    return f


@pytest.fixture
def cfg_env(tmp_path):
    return {backend.ENV_FILE_VAR: str(_env_file(tmp_path)), backend.TOKEN_VAR: FAKE_TOKEN, "HOME": str(tmp_path)}


@pytest.fixture(autouse=True)
def _reset_cli_state():
    zoho_cli._json_output = zoho_cli._full_output = zoho_cli._raw_output = False
    yield


def _invoke(args, env):
    return CliRunner().invoke(zoho_cli.cli, args, env=env)


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
                      / "integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh"]
        helper = next((c for c in candidates if c.exists()), None)
        if helper is None:
            pytest.skip("helper lives in the repo checkout; set CLI_ANYTHING_REPO_ROOT to find it from site-packages")
        assert subprocess.run(["bash", "-n", str(helper)], capture_output=True).returncode == 0
        src = helper.read_text()
        assert "oauth/v2/token" in src and "-X POST" in src
        assert not re.search(r"echo .*\$(ZOHO_)?(CLIENT_SECRET|REFRESH_TOKEN)", src)

    def test_help_exit_0(self):
        r = _invoke(["--help"], env={})
        assert r.exit_code == 0 and "GET-only" in r.output


# ── Configuration ────────────────────────────────────────────────
class TestConfig:
    def test_missing_file_names_the_five_variables_exit_5(self, tmp_path):
        env = {backend.ENV_FILE_VAR: str(tmp_path / "missing.env"), backend.TOKEN_VAR: None, "HOME": str(tmp_path)}
        with patch(GET) as get:
            r = _invoke(["--json", "leads", "list"], env=env)
        assert r.exit_code == backend.NOT_CONFIGURED_EXIT == 5
        get.assert_not_called()
        d = json.loads(r.output)
        assert d["type"] == "not_configured"
        for v in backend.FILE_VARS:
            assert v in d["error"]
        assert "Traceback" not in r.output

    def test_empty_variable_in_file_named(self, tmp_path):
        f = _env_file(tmp_path, ZOHO_REFRESH_TOKEN="")
        env = {backend.ENV_FILE_VAR: str(f), backend.TOKEN_VAR: FAKE_TOKEN, "HOME": str(tmp_path)}
        r = _invoke(["--json", "deals", "list"], env=env)
        assert r.exit_code == 5 and "ZOHO_REFRESH_TOKEN empty" in json.loads(r.output)["error"]

    def test_missing_access_token_points_at_the_mint_helper(self, tmp_path):
        env = {backend.ENV_FILE_VAR: str(_env_file(tmp_path)), backend.TOKEN_VAR: None, "HOME": str(tmp_path)}
        with patch(GET) as get:
            r = _invoke(["--json", "selftest"], env=env)
        assert r.exit_code == 5
        get.assert_not_called()
        d = json.loads(r.output)
        assert d["status"] == "not-configured" and "ZOHO_ACCESS_TOKEN" in d["error"]
        assert "mint-access-token.sh" in d["error"] and "never mints" in d["error"]

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


# ── The 403 profile-permission mapping ───────────────────────────
class TestProfilePermission:
    EXPECTED = "profile permission not granted — this is a Zoho-side setting, not a credential problem"

    @pytest.mark.parametrize("args", [
        ["leads", "list"], ["deals", "list"], ["fields", "Leads"],
        ["leads", "get", "100000000000000001"], ["deals", "get", "100000000000000001"],
    ])
    def test_every_recipe_maps_403_no_permission_exit_4_no_retry(self, args, cfg_env):
        with patch(GET, return_value=_resp(403, NO_PERMISSION_403)) as get:
            r = _invoke(["--json"] + args, env=cfg_env)
        assert r.exit_code == backend.PROFILE_PERMISSION_EXIT == 4, r.output
        assert get.call_count == 1                     # never retried into the block
        d = json.loads(r.output)
        assert d["type"] == "profile_permission_denied" and d["httpStatus"] == 403
        assert d["error"].startswith(self.EXPECTED)
        assert d["zohoCode"] == "NO_PERMISSION"
        assert d["details"] == {"permissions": ["Crm_Implied_Api_Access"]}
        assert "Setup → Security Control → Profiles" in d["fix"] and "Zoho CRM API Access" in d["fix"]
        assert "rows" not in d

    def test_selftest_maps_to_blocked_with_exact_fix(self, cfg_env):
        with patch(GET, return_value=_resp(403, NO_PERMISSION_403)) as get:
            r = _invoke(["--json", "selftest"], env=cfg_env)
        assert r.exit_code == 4 and get.call_count == 1
        d = json.loads(r.output)
        assert d["status"] == "blocked" and d["httpCode"] == 403 and d["leads"] is None
        assert d["fix"] == backend.PROFILE_FIX and d["error"].startswith(self.EXPECTED)
        assert get.call_args.kwargs["params"] == {"per_page": 1, "fields": crm.default_fields("Leads")}

    def test_text_mode_prints_reason_and_fix(self, cfg_env):
        with patch(GET, return_value=_resp(403, NO_PERMISSION_403)):
            r = _invoke(["leads", "list"], env=cfg_env)
        assert r.exit_code == 4 and self.EXPECTED in r.output and "Fix: Zoho CRM → Setup" in r.output

    def test_non_json_403_mentioning_the_permission_still_maps(self, cfg_env):
        with patch(GET, return_value=_resp(403, text="<html>Crm_Implied_Api_Access</html>")):
            r = _invoke(["--json", "leads", "list"], env=cfg_env)
        assert r.exit_code == 4 and json.loads(r.output)["type"] == "profile_permission_denied"

    def test_other_403_is_a_plain_auth_error_not_the_profile_message(self, cfg_env):
        with patch(GET, return_value=_resp(403, {"code": "INVALID_REQUEST", "message": "x", "status": "error"})):
            r = _invoke(["--json", "leads", "list"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 1 and d["type"] == "auth_error" and self.EXPECTED not in d["error"]


# ── The HTTP layer ───────────────────────────────────────────────
class TestBackend:
    def _cfg(self):
        return backend.Config(api_url="https://www.zohoapis.com", access_token=FAKE_TOKEN, env_file="fixture")

    def test_get_sends_oauthtoken_header_to_v8_url(self):
        with patch(GET, return_value=_resp(200, LEADS_200)) as get:
            body = backend.get(self._cfg(), "Leads", {"per_page": 2})
        assert body["info"]["count"] == 2
        args, kwargs = get.call_args
        assert args[0] == "https://www.zohoapis.com/crm/v8/Leads"
        assert kwargs["headers"]["Authorization"] == f"Zoho-oauthtoken {FAKE_TOKEN}"
        assert kwargs["params"] == {"per_page": 2} and kwargs["timeout"] == backend.TIMEOUT_SECONDS

    def test_204_is_an_empty_page(self):
        with patch(GET, return_value=_resp(204, text="")):
            assert backend.get(self._cfg(), "Leads") == {"data": [], "info": {"more_records": False}}

    def test_401_invalid_token_says_expired_and_mint(self):
        with patch(GET, return_value=_resp(401, {"code": "INVALID_TOKEN", "message": "invalid oauth token", "status": "error"})):
            with pytest.raises(backend.AuthError) as ei:
                backend.get(self._cfg(), "Leads")
        assert "expired" in str(ei.value) and "mint-access-token.sh" in str(ei.value) and ei.value.code == "INVALID_TOKEN"

    def test_401_scope_mismatch_names_scopes(self):
        with patch(GET, return_value=_resp(401, {"code": "OAUTH_SCOPE_MISMATCH", "message": "x", "status": "error"})):
            with pytest.raises(backend.AuthError) as ei:
                backend.get(self._cfg(), "Leads")
        assert backend.SCOPES in str(ei.value)

    def test_token_never_leaks_into_errors(self):
        with patch(GET, return_value=_resp(401, text=f"bad token {FAKE_TOKEN}")):
            with pytest.raises(backend.AuthError) as ei:
                backend.get(self._cfg(), "Leads")
        assert FAKE_TOKEN not in str(ei.value) and "[redacted]" in str(ei.value)

    @pytest.mark.parametrize("status,body,exc", [
        (404, {"code": "INVALID_URL_PATTERN", "message": "x"}, backend.NotFound),
        (400, {"code": "INVALID_MODULE", "message": "x"}, backend.NotFound),
        (429, None, backend.RateLimited),
        (500, None, backend.UpstreamError),
        (400, {"code": "REQUIRED_PARAM_MISSING", "message": "fields"}, backend.UpstreamError),
    ])
    def test_other_statuses(self, status, body, exc):
        with patch(GET, return_value=_resp(status, body, text=None if body else "x")) as get:
            with pytest.raises(exc):
                backend.get(self._cfg(), "Leads")
        assert get.call_count == 1

    def test_transport_error_is_structured(self):
        import requests
        with patch(GET, side_effect=requests.ConnectionError("boom")):
            with pytest.raises(backend.TransportError) as ei:
                backend.get(self._cfg(), "Leads")
        assert "ConnectionError" in str(ei.value)


# ── Recipes ──────────────────────────────────────────────────────
class TestRecipes:
    def test_list_defaults_and_rows(self):
        calls = []
        def get(path, params):
            calls.append((path, params)); return LEADS_200
        out = crm.list_records(get, "Leads")
        assert calls == [("Leads", {"per_page": 200, "fields": crm.default_fields("Leads")})]
        assert out["count"] == 2 and out["moreRecords"] is False and out["nextPageToken"] is None

    def test_all_pages_follow_page_token_and_stop(self):
        pages = {None: {"data": [{"id": "1"}], "info": {"more_records": True, "next_page_token": "t2"}},
                 "t2": {"data": [{"id": "2"}], "info": {"more_records": False}}}
        seen = []
        def get(path, params):
            seen.append(params.get("page_token")); return pages[params.get("page_token")]
        out = crm.list_records(get, "Deals", all_pages=True)
        assert seen == [None, "t2"] and out["count"] == 2 and out["pages"] == 2 and out["truncated"] is False

    def test_all_pages_max_pages_truncates(self):
        def get(path, params):
            return {"data": [{"id": "x"}], "info": {"more_records": True, "next_page_token": "again"}}
        out = crm.list_records(get, "Leads", all_pages=True, max_pages=3)
        assert out["pages"] == 3 and out["truncated"] is True and out["nextPageToken"] == "again"

    def test_get_record_and_fields_paths(self):
        calls = []
        def get(path, params):
            calls.append((path, params))
            return {"data": [{"id": "100000000000000001", "Last_Name": "Fixture"}]} if path.startswith("Leads/") else \
                   {"fields": [{"api_name": "Last_Name", "field_label": "Last Name", "data_type": "text", "custom_field": False, "read_only": False, "noise": 1}]}
        rec = crm.get_record(get, "Leads", "100000000000000001")
        fl = crm.module_fields(get, "Leads")
        assert calls == [("Leads/100000000000000001", None), ("settings/fields", {"module": "Leads"})]
        assert rec["record"]["Last_Name"] == "Fixture" and fl["fields"] == [
            {"api_name": "Last_Name", "field_label": "Last Name", "data_type": "text", "custom_field": False, "read_only": False}]

    def test_bad_module_and_id_refused_before_any_request(self):
        def get(path, params):
            raise AssertionError("must not be called")
        for bad in ("", "Leads/x", "../x", "a b"):
            with pytest.raises(ValueError):
                crm.list_records(get, bad)
        for bad in ("", "abc", "1/2", "x" * 30):
            with pytest.raises(ValueError):
                crm.get_record(get, "Leads", bad)

    def test_per_page_clamped(self):
        seen = {}
        def get(path, params):
            seen.update(params); return {"data": [], "info": {}}
        crm.list_records(get, "Leads", per_page=5000)
        assert seen["per_page"] == 200


# ── Redaction and CLI happy paths ────────────────────────────────
class TestCLI:
    def test_leads_list_redacts_by_default_full_shows(self, cfg_env):
        with patch(GET, return_value=_resp(200, LEADS_200)):
            r = _invoke(["--json", "leads", "list"], env=cfg_env)
            assert r.exit_code == 0, r.output
            d = json.loads(r.output)
            assert d["rows"][0]["Email"] == "[redacted]" and d["rows"][1]["Mobile"] == "[redacted]"
            assert d["rows"][0]["Last_Name"] == "Fixture Alpha" and "raw" not in d
            assert "example.invalid" not in r.output
            r = _invoke(["--json", "--full", "--raw", "leads", "list"], env=cfg_env)
            d = json.loads(r.output)
            assert d["rows"][0]["Email"].endswith("example.invalid") and "raw" in d

    def test_selftest_ok(self, cfg_env):
        with patch(GET, return_value=_resp(200, LEADS_200)):
            r = _invoke(["--json", "selftest"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 0 and d["status"] == "ok" and d["httpCode"] == 200 and d["source"] == crm.SOURCE

    def test_selftest_error_status(self, cfg_env):
        with patch(GET, return_value=_resp(503, text="down")):
            r = _invoke(["--json", "selftest"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 1 and d["status"] == "error" and d["httpCode"] == 503

    def test_redact_module_untouched_input(self):
        out = redact.redact(LEADS_200)
        assert out["data"][0]["Phone"] == "[redacted]" and LEADS_200["data"][0]["Phone"] == "000-000-0001"

    def test_bad_id_no_request(self, cfg_env):
        with patch(GET) as get:
            r = _invoke(["--json", "leads", "get", "not-an-id"], env=cfg_env)
        assert r.exit_code == 1 and json.loads(r.output)["type"] == "ValueError"
        get.assert_not_called()


# ── The installed command, as a subprocess ───────────────────────
def _resolve_cli(name: str) -> list[str]:
    exe = shutil.which(name) or (
        str(Path(sys.executable).parent / name) if (Path(sys.executable).parent / name).exists() else None)
    if exe:
        print(f"[_resolve_cli] Using installed command: {exe}")
        return [exe]
    if os.environ.get("CLI_ANYTHING_FORCE_INSTALLED") == "1":
        raise RuntimeError(f"{name} is not installed and CLI_ANYTHING_FORCE_INSTALLED=1")
    print("[_resolve_cli] Falling back to python -m cli_anything.zoho")
    return [sys.executable, "-m", "cli_anything.zoho"]


class TestInstalledCommand:
    CLI = _resolve_cli("cli-anything-zoho")

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
