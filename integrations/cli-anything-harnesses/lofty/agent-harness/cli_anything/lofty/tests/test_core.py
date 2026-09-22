"""Unit tests for cli-anything-lofty — offline, mocked HTTP, synthetic data.

No network and no real API call: ``requests.get`` is patched at the backend.
Every lead, stage, name and id below is invented. The fixture key is a fake.

Run:
    python -m pytest cli_anything/lofty/tests -v
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

from cli_anything.lofty import lofty_cli
from cli_anything.lofty.core import leads, redact
from cli_anything.lofty.utils import lofty_backend as backend

PKG_DIR = Path(lofty_cli.__file__).resolve().parent
FAKE_KEY = "fixture-key-not-real-0000"
GET = "cli_anything.lofty.utils.lofty_backend.requests.get"


def _resp(status, body=None, text=None):
    """A fake requests.Response: status_code, text, json()."""
    payload = text if text is not None else (json.dumps(body) if body is not None else "")
    def _json():
        return json.loads(payload)
    return SimpleNamespace(status_code=status, text=payload, json=_json, headers={})


@pytest.fixture
def cfg_env(tmp_path):
    """A configured key file in a temp HOME; returns the CliRunner env."""
    f = tmp_path / "lofty.env"
    f.write_text(f"# fixture\nexport {backend.KEY_VAR}='{FAKE_KEY}'\n")
    return {backend.ENV_FILE_VAR: str(f), backend.KEY_VAR: None, "HOME": str(tmp_path)}


@pytest.fixture
def no_cfg_env(tmp_path):
    return {backend.ENV_FILE_VAR: str(tmp_path / "missing.env"), backend.KEY_VAR: None, "HOME": str(tmp_path)}


@pytest.fixture(autouse=True)
def _reset_cli_state():
    lofty_cli._json_output = lofty_cli._full_output = lofty_cli._raw_output = False
    yield


def _invoke(args, env):
    return CliRunner().invoke(lofty_cli.cli, args, env=env)


LEADS_PAGE_1 = {"leads": [
    {"id": "L-1", "firstName": "Fixture", "lastName": "Alpha", "stage": "New Lead",
     "email": "fixture-alpha@example.invalid", "phone": "000-000-0001", "address": {"street": "1 Example Way"}},
    {"id": "L-2", "firstName": "Fixture", "lastName": "Beta", "stage": "Contacted",
     "email": "fixture-beta@example.invalid", "phone": "000-000-0002"},
    {"id": "L-3", "firstName": "Fixture", "lastName": "Gamma", "stage": "New Lead"},
], "total": 4}
LEADS_PAGE_2 = {"leads": [{"id": "L-4", "firstName": "Fixture", "lastName": "Delta", "stage": "Appointment Set"}], "total": 4}


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

    def test_help_exit_0(self):
        r = _invoke(["--help"], env={})
        assert r.exit_code == 0 and "GET-only" in r.output


# ── Configuration ────────────────────────────────────────────────
class TestConfig:
    def test_missing_file_is_not_configured_named_variable_no_traceback(self, no_cfg_env):
        with patch(GET) as get:
            r = _invoke(["--json", "leads", "list"], env=no_cfg_env)
        assert r.exit_code == backend.NOT_CONFIGURED_EXIT == 5
        get.assert_not_called()
        d = json.loads(r.output)
        assert d["type"] == "not_configured" and d["variable"] == "LOFTY_API_KEY"
        assert "LOFTY_API_KEY" in d["error"] and "~/.config/lofty/.env" in d["error"]
        assert "Traceback" not in r.output and "rows" not in d

    def test_empty_key_in_file_is_not_configured(self, tmp_path):
        f = tmp_path / "lofty.env"
        f.write_text("LOFTY_API_KEY=\n")
        env = {backend.ENV_FILE_VAR: str(f), backend.KEY_VAR: None, "HOME": str(tmp_path)}
        with patch(GET) as get:
            r = _invoke(["--json", "me"], env=env)
        assert r.exit_code == 5 and "is empty in" in json.loads(r.output)["error"]
        get.assert_not_called()

    def test_not_configured_text_mode_is_one_line(self, no_cfg_env):
        r = _invoke(["leads", "stage-totals"], env=no_cfg_env)
        assert r.exit_code == 5 and r.output.startswith("Error: not configured: LOFTY_API_KEY")

    def test_file_key_wins_then_environment_fallback(self, tmp_path):
        f = tmp_path / "lofty.env"
        f.write_text(f"LOFTY_API_KEY=\"{FAKE_KEY}\"\n")
        cfg = backend.load_config(env={backend.ENV_FILE_VAR: str(f), "LOFTY_API_KEY": "other"})
        assert cfg.api_key == FAKE_KEY and cfg.source == str(f)
        cfg = backend.load_config(env={backend.ENV_FILE_VAR: str(tmp_path / "none.env"), "LOFTY_API_KEY": "envkey"})
        assert cfg.api_key == "envkey" and cfg.source == "environment variable LOFTY_API_KEY"

    def test_config_check_never_prints_the_value(self, cfg_env):
        r = _invoke(["--json", "config", "check"], env=cfg_env)
        assert r.exit_code == 0
        d = json.loads(r.output)
        assert d["configured"] is True and d["keyInFile"] is True and d["keyVariable"] == "LOFTY_API_KEY"
        assert FAKE_KEY not in r.output
        assert "lofty-bridge" in d["primaryPath"]

    def test_env_file_parser(self, tmp_path):
        f = tmp_path / "x.env"
        f.write_text("# c\n\nexport A='1'\nB=\"two\"\nC=three # not a comment\nbad line\n")
        assert backend.read_env_file(f) == {"A": "1", "B": "two", "C": "three # not a comment"}


# ── The HTTP layer ───────────────────────────────────────────────
class TestBackend:
    def _cfg(self):
        return backend.Config(api_key=FAKE_KEY, base_url=backend.BASE_URL, source="fixture")

    def test_get_sends_token_header_to_v1_url(self):
        with patch(GET, return_value=_resp(200, {"ok": True})) as get:
            body = backend.get(self._cfg(), "me")
        assert body == {"ok": True}
        args, kwargs = get.call_args
        assert args[0] == "https://api.lofty.com/v1.0/me"
        assert kwargs["headers"]["Authorization"] == f"token {FAKE_KEY}"
        assert kwargs["timeout"] == backend.TIMEOUT_SECONDS and kwargs["params"] is None

    def test_401_and_403_are_auth_errors_with_key_redacted(self):
        for status in (401, 403):
            with patch(GET, return_value=_resp(status, text=f"denied for {FAKE_KEY}")):
                with pytest.raises(backend.AuthError) as ei:
                    backend.get(self._cfg(), "leads")
            assert FAKE_KEY not in str(ei.value) and "[redacted]" in str(ei.value)
            assert ei.value.http_status == status

    def test_429_is_reported_not_retried(self):
        with patch(GET, return_value=_resp(429, text="slow down")) as get:
            with pytest.raises(backend.RateLimited):
                backend.get(self._cfg(), "leads")
        assert get.call_count == 1

    @pytest.mark.parametrize("status,exc", [(404, backend.NotFound), (500, backend.UpstreamError),
                                            (503, backend.UpstreamError), (302, backend.UpstreamError)])
    def test_other_statuses(self, status, exc):
        with patch(GET, return_value=_resp(status, text="x")):
            with pytest.raises(exc):
                backend.get(self._cfg(), "leads")

    def test_non_json_200_is_upstream_error(self):
        with patch(GET, return_value=_resp(200, text="<html>login</html>")):
            with pytest.raises(backend.UpstreamError):
                backend.get(self._cfg(), "leads")

    def test_204_is_empty(self):
        with patch(GET, return_value=_resp(204, text="")):
            assert backend.get(self._cfg(), "leads") == {}

    def test_transport_error_is_structured(self):
        import requests
        with patch(GET, side_effect=requests.ConnectionError("boom")):
            with pytest.raises(backend.TransportError) as ei:
                backend.get(self._cfg(), "leads")
        assert "ConnectionError" in str(ei.value)


# ── Recipes ──────────────────────────────────────────────────────
class TestRecipes:
    def test_extract_rows_shapes(self):
        assert leads.extract_rows([1, 2]) == [1, 2]
        assert leads.extract_rows({"leads": [1]}) == [1]
        assert leads.extract_rows({"data": {"items": [3]}}) == [3]
        assert leads.extract_rows({"data": {"total": 0}}) == []
        assert leads.extract_rows("nonsense") == []

    def test_list_leads_params_and_rows(self):
        calls = []
        def get(path, params):
            calls.append((path, params)); return LEADS_PAGE_1
        out = leads.list_leads(get, page=2, page_size=3, extra={"stage": "New Lead"})
        assert calls == [("leads", {"pageNum": 2, "pageSize": 3, "stage": "New Lead"})]
        assert out["count"] == 3 and out["bodyKeys"] == ["leads", "total"]

    def test_stage_totals_pages_and_stops(self):
        pages = {1: LEADS_PAGE_1, 2: LEADS_PAGE_2}
        calls = []
        def get(path, params):
            calls.append(params["pageNum"]); return pages[params["pageNum"]]
        out = leads.stage_totals(get, page_size=3, max_pages=10)
        assert calls == [1, 2] and out["leadsScanned"] == 4 and out["pages"] == 2
        assert out["stageTotals"] == [["New Lead", 2], ["Contacted", 1], ["Appointment Set", 1]]
        assert out["truncated"] is False

    def test_stage_totals_truncation_flag(self):
        def get(path, params):
            return {"leads": [{"id": "x", "stage": "S"}] * 3}
        out = leads.stage_totals(get, page_size=3, max_pages=2)
        assert out["truncated"] is True and out["pages"] == 2 and out["leadsScanned"] == 6

    def test_stage_detection(self):
        assert leads.stage_of({"leadStage": {"name": "Hot"}}) == "Hot"
        assert leads.stage_of({"foo": 1}) == "(no stage field)"
        assert leads.stage_of({"custom": "X"}, field="custom") == "X"

    def test_timeline_and_get_lead_paths(self):
        calls = []
        def get(path, params):
            calls.append(path); return {"activities": [{"type": "call", "at": "2026-09-01T00:00:00Z"}]}
        assert leads.timeline(get, "L-1")["count"] == 1
        leads.get_lead(get, "L-1")
        assert calls == ["leads/L-1/activities", "leads/L-1"]

    def test_bad_ids_refused_before_any_request(self):
        def get(path, params):
            raise AssertionError("must not be called")
        for bad in ("", "../x", "a/b", "x?y", "a b", "x" * 65):
            with pytest.raises(ValueError):
                leads.get_lead(get, bad)


# ── Redaction ────────────────────────────────────────────────────
class TestRedaction:
    def test_contact_fields_redacted_recursively(self):
        out = redact.redact(LEADS_PAGE_1)
        row = out["leads"][0]
        assert row["email"] == row["phone"] == row["address"] == "[redacted]"
        assert row["firstName"] == "Fixture" and row["stage"] == "New Lead"
        assert LEADS_PAGE_1["leads"][0]["email"].endswith("example.invalid")   # input untouched

    def test_cli_redacts_by_default_and_full_shows(self, cfg_env):
        with patch(GET, return_value=_resp(200, LEADS_PAGE_1)):
            r = _invoke(["--json", "leads", "list"], env=cfg_env)
            assert r.exit_code == 0, r.output
            assert "example.invalid" not in r.output and "[redacted]" in r.output
            assert "raw" not in json.loads(r.output)
            r = _invoke(["--json", "--full", "--raw", "leads", "list"], env=cfg_env)
            d = json.loads(r.output)
            assert d["rows"][0]["email"].endswith("example.invalid") and "raw" in d


# ── CLI end to end (mocked HTTP) ─────────────────────────────────
class TestCLI:
    def test_me_ok(self, cfg_env):
        with patch(GET, return_value=_resp(200, {"name": "Fixture Agent"})) as get:
            r = _invoke(["--json", "me"], env=cfg_env)
        assert r.exit_code == 0 and json.loads(r.output)["identity"]["name"] == "Fixture Agent"
        assert get.call_args.args[0].endswith("/v1.0/me")

    def test_auth_error_exit_1_key_never_shown(self, cfg_env):
        with patch(GET, return_value=_resp(401, text=f"bad key {FAKE_KEY}")):
            r = _invoke(["--json", "me"], env=cfg_env)
        assert r.exit_code == 1
        d = json.loads(r.output)
        assert d["type"] == "auth_error" and d["httpStatus"] == 401
        assert FAKE_KEY not in r.output and "Traceback" not in r.output

    def test_rate_limited_once(self, cfg_env):
        with patch(GET, return_value=_resp(429, text="later")) as get:
            r = _invoke(["--json", "leads", "stage-totals"], env=cfg_env)
        assert r.exit_code == 1 and json.loads(r.output)["type"] == "rate_limited"
        assert get.call_count == 1

    def test_stage_totals_cli(self, cfg_env):
        def fake_get(url, headers=None, params=None, timeout=None):
            return _resp(200, LEADS_PAGE_1 if params["pageNum"] == 1 else LEADS_PAGE_2)
        with patch(GET, side_effect=fake_get):
            r = _invoke(["--json", "leads", "stage-totals", "--page-size", "3"], env=cfg_env)
        d = json.loads(r.output)
        assert r.exit_code == 0 and d["stageTotals"][0] == ["New Lead", 2] and d["leadsScanned"] == 4

    def test_bad_param_is_usage_level_error(self, cfg_env):
        with patch(GET) as get:
            r = _invoke(["--json", "leads", "list", "--param", "novalue"], env=cfg_env)
        assert r.exit_code == 1 and json.loads(r.output)["type"] == "ValueError"
        get.assert_not_called()

    def test_bad_id_no_request(self, cfg_env):
        with patch(GET) as get:
            r = _invoke(["--json", "leads", "get", "../etc"], env=cfg_env)
        assert r.exit_code == 1
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
    print("[_resolve_cli] Falling back to python -m cli_anything.lofty")
    return [sys.executable, "-m", "cli_anything.lofty"]


class TestInstalledCommand:
    CLI = _resolve_cli("cli-anything-lofty")

    def _run(self, args, tmp_path):
        env = {k: v for k, v in os.environ.items() if k not in (backend.KEY_VAR, backend.ENV_FILE_VAR)}
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
        r = self._run(["--json", "leads", "list"], tmp_path)
        assert r.returncode == 5 and json.loads(r.stdout)["type"] == "not_configured"
        assert "Traceback" not in r.stderr
