"""Unit tests for cli-anything-zipforms — offline, mocked, synthetic.

No network, no Chrome, no DOMShell, no live site, no real transaction, client,
address, phone or email. Every fixture below is invented.

Run:
    python -m pytest cli_anything/zipforms/tests -v
"""

from __future__ import annotations

import datetime as dt
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

from cli_anything.zipforms.core import discover, paths as paths_mod, policy, recipes, target
from cli_anything.zipforms.utils import security
from cli_anything.zipforms.utils import zipforms_backend as backend
from cli_anything.zipforms import zipforms_cli

GATE = policy.ENV_VAR
PKG_DIR = Path(zipforms_cli.__file__).resolve().parent
NO_GATE = {GATE: None}          # CliRunner: None unsets the variable for the call
OPEN_GATE = {GATE: "2026-09-20"}


# ── Fixtures ─────────────────────────────────────────────────────
class FakeBackend:
    """Stands in for the DOMShell seam. Only the read-only surface exists here,
    so any write call the engine attempted would raise AttributeError."""

    def __init__(self, tree=None, grep_results=None, cat_results=None,
                 open_result=None, ls_errors=None, grep_errors=None):
        self.calls: list[tuple] = []
        self.tree = tree or {"/main": ["FORM-SAMPLE-1 Fixture Purchase Agreement",
                                       "FORM-SAMPLE-2 Fixture Disclosure Form"]}
        self.grep_results = grep_results or {}
        self.cat_results = cat_results or {}
        self.open_result = open_result
        self.ls_errors = ls_errors or {}
        self.grep_errors = grep_errors or {}

    def new_session(self):
        self.calls.append(("new_session",))
        return SimpleNamespace(working_dir="/", current_url="")

    def open_url(self, session, url):
        self.calls.append(("open_url", url))
        return self.open_result or {"output": "ok", "url": url}

    def ls(self, session, path=""):
        self.calls.append(("ls", path))
        if path in self.ls_errors:
            return {"error": self.ls_errors[path], "output": self.ls_errors[path]}
        names = self.tree.get(path, [])
        return {"entries": [{"name": n, "role": "", "path": n} for n in names], "raw": "\n".join(names)}

    def cat(self, session, path=""):
        self.calls.append(("cat", path))
        return self.cat_results.get(path, {"output": f"fixture text of {path}"})

    def grep(self, session, pattern, path=""):
        self.calls.append(("grep", pattern, path))
        if pattern in self.grep_errors:
            return {"error": self.grep_errors[pattern], "output": self.grep_errors[pattern]}
        return {"matches": self.grep_results.get(pattern, []), "raw": ""}


@pytest.fixture
def path_map():
    return paths_mod.load()


@pytest.fixture(autouse=True)
def _reset_cli_state():
    zipforms_cli._availability_cached = None
    zipforms_cli._json_output = False
    zipforms_cli._paths_override = None
    yield
    zipforms_cli._availability_cached = None


def _invoke(args, env):
    return CliRunner().invoke(zipforms_cli.cli, args, env=env)


# ── The ECC gate (core/policy.py) ────────────────────────────────
class TestGate:
    def test_unset_is_disabled_by_policy(self):
        gs = policy.check_gate(env={})
        assert not gs.ok
        assert gs.conn_state == "disabled-by-policy"
        assert gs.reviewed_at is None
        assert GATE in gs.reason and "F-S1-10" in gs.reason
        assert gs.fix

    def test_empty_string_is_unset(self):
        assert not policy.check_gate(env={GATE: "   "}).ok

    def test_garbage_is_not_a_date(self):
        gs = policy.check_gate(env={GATE: "yes"})
        assert not gs.ok and "not a date" in gs.reason

    def test_impossible_calendar_date_refused(self):
        gs = policy.check_gate(env={GATE: "2026-02-30"})
        assert not gs.ok and "not a real calendar date" in gs.reason

    def test_future_date_refused(self):
        gs = policy.check_gate(env={GATE: "2027-01-01"}, today=dt.date(2026, 9, 22))
        assert not gs.ok and "future" in gs.reason
        assert gs.conn_state == "disabled-by-policy"

    def test_past_date_opens_gate(self):
        gs = policy.check_gate(env={GATE: "2026-09-20"}, today=dt.date(2026, 9, 22))
        assert gs.ok and gs.reviewed_at == "2026-09-20"
        assert gs.conn_state == "gate-open" and "2 days ago" in gs.reason

    def test_today_opens_gate(self):
        gs = policy.check_gate(env={GATE: "2026-09-22"}, today=dt.date(2026, 9, 22))
        assert gs.ok

    def test_as_dict_uses_deck_vocabulary(self):
        d = policy.check_gate(env={}).as_dict()
        assert d["connState"] == "disabled-by-policy" and d["eccReviewedAt"] is None
        assert "conn_state" not in d and "reviewed_at" not in d


# ── The gate at the CLI boundary ─────────────────────────────────
class TestCLIGate:
    def test_recipe_refused_without_date_exit_3(self):
        with patch.object(backend, "is_available") as avail:
            r = _invoke(["recipe", "form-index"], env=NO_GATE)
        assert r.exit_code == policy.POLICY_EXIT_CODE == 3
        assert GATE in r.output and "disabled-by-policy" in r.output
        avail.assert_not_called()   # gate precedes the DOMShell check: no subprocess spawned

    def test_recipe_refused_json_shape(self):
        r = _invoke(["--json", "recipe", "form-detail", "--id", "F-1"], env=NO_GATE)
        assert r.exit_code == 3
        payload = json.loads(r.output)
        assert payload["type"] == "policy_gate"
        assert payload["connState"] == "disabled-by-policy"
        assert payload["eccReviewedAt"] is None
        assert payload["fix"]

    @pytest.mark.parametrize("args", [
        ["discover"], ["fs", "ls", "/"], ["fs", "cat", "/main"], ["fs", "grep", "x"],
        ["fs", "pwd"], ["page", "open", "https://www.zipformplus.com/"], ["page", "info"],
        ["page", "reload"], ["page", "back"], ["page", "forward"],
        ["recipe", "packet-index"],
        ["recipe", "form-detail", "--id", "F-1"],
    ])
    def test_every_live_command_is_gated(self, args):
        with patch.object(backend, "is_available") as avail:
            r = _invoke(args, env=NO_GATE)
        assert r.exit_code == 3, r.output
        avail.assert_not_called()

    def test_future_date_refused_at_cli(self):
        r = _invoke(["recipe", "form-index"], env={GATE: "2999-01-01"})
        assert r.exit_code == 3 and "future" in r.output

    def test_gate_open_but_domshell_missing_is_dependency_error(self):
        with patch.object(backend, "is_available", return_value=(False, "npx not found (fixture)")):
            r = _invoke(["--json", "recipe", "form-index"], env=OPEN_GATE)
        assert r.exit_code == 1
        assert json.loads(r.output)["type"] == "dependency_error"

    def test_gate_open_recipe_runs_through_mocked_seam(self):
        fake = FakeBackend()
        with patch.object(backend, "is_available", return_value=(True, "ok")), \
             patch.object(recipes, "backend", fake):
            r = _invoke(["--json", "recipe", "form-index"], env=OPEN_GATE)
        assert r.exit_code == 0, r.output
        payload = json.loads(r.output)
        assert payload["count"] == 2 and payload["verified"] is False
        assert payload["rows"][0]["name"].startswith("FORM-SAMPLE-1")

    def test_offline_commands_need_no_gate(self):
        for args in (["gate", "status"], ["verbs"], ["paths", "validate"], ["paths", "show"], ["--version"]):
            r = _invoke(args, env=NO_GATE)
            assert r.exit_code == 0, (args, r.output)

    def test_gate_status_json(self):
        r = _invoke(["--json", "gate", "status"], env=NO_GATE)
        d = json.loads(r.output)
        assert d["connState"] == "disabled-by-policy" and d["target"] == "zipForms"
        r = _invoke(["--json", "gate", "status"], env=OPEN_GATE)
        assert json.loads(r.output)["connState"] == "gate-open"


# ── No write surface, by construction ────────────────────────────
class TestNoWriteSurface:
    WRITE_NAMES = {"act", "click", "type", "submit", "send", "upload", "download",
                   "delete", "fill", "complete", "sign", "esign"}

    def test_no_act_group(self):
        assert "act" not in zipforms_cli.cli.commands

    def test_help_exit_0_and_no_act_word(self):
        r = _invoke(["--help"], env=NO_GATE)
        assert r.exit_code == 0
        assert re.search(r"\bact\b", r.output) is None, r.output
        assert re.search(r"^\s+act(\s|$)", r.output, re.M) is None

    def test_no_group_carries_a_write_subcommand(self):
        for gname, group in zipforms_cli.cli.commands.items():
            subs = set(getattr(group, "commands", {}).keys())
            assert not (subs & self.WRITE_NAMES), (gname, subs)
            r = _invoke([gname, "--help"], env=NO_GATE)
            assert r.exit_code == 0
            assert re.search(r"\bact\b", r.output) is None

    def test_seam_has_only_the_read_surface(self):
        public = {n for n in dir(backend) if not n.startswith("_") and callable(getattr(backend, n))}
        assert public <= set(backend.READ_ONLY_SURFACE), public - set(backend.READ_ONLY_SURFACE)
        for name in backend.FORBIDDEN_NAMES:
            assert not hasattr(backend, name), name

    def test_source_never_calls_browser_write_functions(self):
        pattern = re.compile(r"domshell_backend\.(click|type_text)|\.click\(|\.type_text\(|act_click|act_type")
        for py in PKG_DIR.rglob("*.py"):
            if py.name == "repl_skin.py" or "tests" in py.parts:
                continue
            assert not pattern.search(py.read_text(encoding="utf-8")), py

    def test_verbs_command_documents_the_absent_writes(self):
        r = _invoke(["--json", "verbs"], env=NO_GATE)
        d = json.loads(r.output)
        disabled = {v["verb"] for v in d["verbsDisabled"]}
        assert "packet send" in disabled and "form download" in disabled and "form fill" in disabled
        assert all(v["blast_radius"] for v in d["verbsDisabled"])
        assert d["readOnly"] is True
        assert not any(re.search(r"\bact\b", v) for v in d["verbsEnabled"])


# ── Recipes (core/recipes.py) through the mocked seam ────────────
class TestRecipes:
    def test_form_index_rows_and_calls(self, path_map):
        fake = FakeBackend()
        out = recipes.run("form-index", path_map, backend_mod=fake)
        assert out["count"] == 2 and out["verified"] is False and out["target"] == "zipForms"
        assert out["url"] == path_map["map"]["recipes"]["form-index"]["url"]
        assert ("open_url", out["url"]) in fake.calls
        greps = [c for c in fake.calls if c[0] == "grep"]
        assert [g[1] for g in greps] == path_map["map"]["login_markers"]
        assert ("ls", "/main") in fake.calls

    def test_logged_out_is_explicit_auth_error_with_no_rows(self, path_map):
        fake = FakeBackend(grep_results={"Sign In": ["/main/form/button[0]"]})
        out = recipes.run("form-index", path_map, backend_mod=fake)
        assert out["type"] == "auth_error" and out["rows"] == [] and out["count"] == 0
        assert "not authenticated" in out["error"]
        assert not any(c[0] == "ls" for c in fake.calls)   # never a partial result

    def test_auth_check_failure_returns_no_rows(self, path_map):
        fake = FakeBackend(grep_errors={"Sign In": "grep: boom (fixture)"})
        out = recipes.run("form-index", path_map, backend_mod=fake)
        assert out["type"] == "auth_check_failed" and out["rows"] == []

    def test_form_detail_reads_text_and_never_fills(self, path_map):
        fake = FakeBackend(cat_results={"/main": {"output": "Fixture form summary"}})
        out = recipes.run("form-detail", path_map, id="F-7", backend_mod=fake)
        assert out["url"].endswith("/F-7") or "/F-7/" in out["url"]
        assert out["text"] == "Fixture form summary"
        assert {c[0] for c in fake.calls} <= {"new_session", "open_url", "grep", "ls", "cat"}

    def test_packet_index_lists_names_only(self, path_map):
        fake = FakeBackend(tree={"/main": ["Fixture Listing Packet", "Fixture Buyer Packet"]})
        out = recipes.run("packet-index", path_map, backend_mod=fake)
        assert [r["name"] for r in out["rows"]] == ["Fixture Listing Packet", "Fixture Buyer Packet"]
        assert {c[0] for c in fake.calls} <= {"new_session", "open_url", "grep", "ls"}

    def test_navigation_error(self, path_map):
        fake = FakeBackend(open_result={"error": "open: timeout (fixture)", "output": ""})
        out = recipes.run("form-index", path_map, backend_mod=fake)
        assert out["type"] == "navigation_error" and out["rows"] == []

    def test_wrong_list_path_points_at_discover(self, path_map):
        fake = FakeBackend(ls_errors={"/main": "ls: main: No such directory"})
        out = recipes.run("packet-index", path_map, backend_mod=fake)
        assert out["type"] == "path_error" and "discover" in out["error"] and "paths.json" in out["error"]

    def test_id_required_and_sanitised(self, path_map):
        with pytest.raises(paths_mod.PathMapError):
            recipes.run("form-detail", path_map, backend_mod=FakeBackend())
        for bad in ("../x", "a/b", "x?y=1", "a b", "x" * 65):
            with pytest.raises(paths_mod.PathMapError):
                recipes.run("form-detail", path_map, id=bad, backend_mod=FakeBackend())

    def test_unknown_recipe(self, path_map):
        with pytest.raises(ValueError):
            recipes.run("packet-send", path_map, backend_mod=FakeBackend())

    def test_recipe_names_match_spec(self):
        assert set(target.RECIPES) == {"form-index", "form-detail", "packet-index"}


# ── URL allow-list (utils/security.py) and the seam's refusal ────
class TestSecurity:
    @pytest.mark.parametrize("url", ["https://www.zipformplus.com/", "https://transactions.lwolf.com/forms/F-1"])
    def test_allowed(self, url):
        assert security.validate_target_url(url) == (True, "")

    @pytest.mark.parametrize("url", [
        "http://www.zipformplus.com/", "https://example.com/", "https://www.zipformplus.com.evil.example/",
        "https://user:pw@www.zipformplus.com/", "javascript:alert(1)", "file:///etc/hosts",
        "https://www.zipformplus.com/\nls", "", "www.zipformplus.com",
    ])
    def test_refused(self, url):
        ok, msg = security.validate_target_url(url)
        assert not ok and msg

    def test_seam_refuses_before_touching_browser(self):
        with patch.object(backend, "_browser", side_effect=AssertionError("must not be reached")):
            res = backend.open_url(SimpleNamespace(), "https://example.com/")
        assert res["error"].startswith("refused")


# ── Path map (core/paths.py) ─────────────────────────────────────
class TestPathMap:
    def test_packaged_map_valid_and_unverified(self, path_map):
        assert paths_mod.validate(path_map["map"]) == []
        assert set(path_map["map"]["recipes"]) == set(target.RECIPES)
        assert path_map["map"]["verified"] is False
        assert all(s["verified"] is False for s in path_map["map"]["recipes"].values())
        assert "UNVERIFIED" in path_map["map"]["verified_note"]

    def test_override_precedence(self, tmp_path, path_map):
        f = tmp_path / "custom.json"
        f.write_text(json.dumps(path_map["map"]))
        assert paths_mod.resolve_file(None, env={}) == paths_mod.DEFAULT_FILE
        assert paths_mod.resolve_file(None, env={target.PATHS_ENV: str(f)}) == f
        assert paths_mod.resolve_file("/explicit.json", env={target.PATHS_ENV: str(f)}) == Path("/explicit.json")
        assert paths_mod.load(None, env={target.PATHS_ENV: str(f)})["source"] == str(f)

    def test_missing_and_broken_files(self, tmp_path):
        with pytest.raises(paths_mod.PathMapError):
            paths_mod.load(str(tmp_path / "nope.json"))
        bad = tmp_path / "bad.json"
        bad.write_text("{not json")
        with pytest.raises(paths_mod.PathMapError):
            paths_mod.load(str(bad))

    def test_validation_catches_bad_entries(self, path_map):
        data = json.loads(json.dumps(path_map["map"]))
        data["recipes"]["form-index"]["url"] = "https://example.com/x"
        data["recipes"]["form-detail"]["url"] = "https://www.zipformplus.com/forms"   # no {id}
        data["recipes"]["packet-index"]["list_path"] = "relative"
        errors = paths_mod.validate(data)
        assert any("outside allowed_url_prefixes" in e for e in errors)
        assert any("{id}" in e for e in errors)
        assert any("absolute tree path" in e for e in errors)
        data2 = json.loads(json.dumps(path_map["map"]))
        del data2["recipes"]["packet-index"]
        assert any("packet-index" in e and "missing" in e for e in paths_mod.validate(data2))

    def test_render_url(self):
        assert paths_mod.render_url("https://x/{id}/d", id="TX_1-a") == "https://x/TX_1-a/d"
        assert paths_mod.render_url("https://x/list") == "https://x/list"


# ── Discovery (core/discover.py) ─────────────────────────────────
class TestDiscover:
    TREE = {"/": ["main/", "nav/", "heading_1"], "/main": ["table/", "text_1"],
            "/main/table": ["row_1", "row_2"], "/nav": ["link_1"]}

    def test_walk_builds_paths_and_dir_flags(self):
        fake = FakeBackend(tree=self.TREE)
        out = discover.walk(SimpleNamespace(), "/", max_depth=3, max_nodes=400, backend_mod=fake)
        by_path = {n["path"]: n for n in out["nodes"]}
        assert by_path["/main"]["dir"] is True and by_path["/heading_1"]["dir"] is False
        assert "/main/table/row_2" in by_path and by_path["/main/table/row_2"]["depth"] == 3
        assert out["truncated"] is False and out["count"] == len(out["nodes"]) == 8
        assert {c[0] for c in fake.calls} == {"ls"}

    def test_depth_limit(self):
        out = discover.walk(SimpleNamespace(), "/", max_depth=1, backend_mod=FakeBackend(tree=self.TREE))
        assert {n["path"] for n in out["nodes"]} == {"/main", "/nav", "/heading_1"}

    def test_node_cap_truncates(self):
        out = discover.walk(SimpleNamespace(), "/", max_nodes=2, backend_mod=FakeBackend(tree=self.TREE))
        assert out["truncated"] is True and out["count"] == 2

    def test_subtree_error_is_recorded_not_fatal(self):
        fake = FakeBackend(tree=self.TREE, ls_errors={"/nav": "ls: nav: No such directory"})
        out = discover.walk(SimpleNamespace(), "/", backend_mod=fake)
        assert any(n.get("error") for n in out["nodes"]) and "/main/table/row_1" in {n["path"] for n in out["nodes"]}


# ── The seam binds to the real browser harness (mocked at its backend) ──
class TestSeamBinding:
    """Runs only where cli-anything-browser is installed; the real DOMShell
    backend is patched so nothing spawns npx or opens Chrome."""

    @pytest.fixture(autouse=True)
    def _need_browser(self):
        pytest.importorskip("cli_anything.browser.core.fs",
                            reason="cli-anything-browser not installed in this environment")

    def test_ls_delegates_to_browser_fs(self):
        sess = backend.new_session()
        with patch("cli_anything.browser.core.fs.backend.ls",
                   return_value={"entries": [{"name": "main/", "role": "", "path": "main/"}], "raw": "main/"}) as m:
            out = backend.ls(sess, "/main")
        m.assert_called_once_with("/main", use_daemon=False, session=sess)
        assert out["entries"][0]["name"] == "main/"

    def test_open_url_allowed_host_reaches_browser_page(self):
        sess = backend.new_session()
        with patch("cli_anything.browser.core.page.backend.open_url",
                   return_value={"output": "ok", "url": "https://www.zipformplus.com/"}) as m:
            out = backend.open_url(sess, "https://www.zipformplus.com/")
        m.assert_called_once()
        assert "error" not in out and sess.current_url == "https://www.zipformplus.com/"

    def test_grep_and_cat_delegate(self):
        sess = backend.new_session()
        with patch("cli_anything.browser.core.fs.backend.grep", return_value={"matches": [], "raw": ""}) as g, \
             patch("cli_anything.browser.core.fs.backend.cat", return_value={"output": "t"}) as c:
            backend.grep(sess, "Sign In", "/")
            backend.cat(sess, "/main")
        g.assert_called_once()
        c.assert_called_once_with("/main", use_daemon=False, session=sess)


# ── The installed command, as a subprocess ───────────────────────
def _resolve_cli(name: str) -> list[str]:
    exe = shutil.which(name) or (
        str(Path(sys.executable).parent / name) if (Path(sys.executable).parent / name).exists() else None)
    if exe:
        print(f"[_resolve_cli] Using installed command: {exe}")
        return [exe]
    if os.environ.get("CLI_ANYTHING_FORCE_INSTALLED") == "1":
        raise RuntimeError(f"{name} is not installed and CLI_ANYTHING_FORCE_INSTALLED=1")
    print(f"[_resolve_cli] Falling back to python -m cli_anything.zipforms")
    return [sys.executable, "-m", "cli_anything.zipforms"]


class TestInstalledCommand:
    CLI = _resolve_cli(target.CLI_NAME)

    def _run(self, args):
        env = {k: v for k, v in os.environ.items() if k != GATE}
        return subprocess.run(self.CLI + args, capture_output=True, text=True, env=env, timeout=60)

    def test_help_exit_0_no_act(self):
        r = self._run(["--help"])
        assert r.returncode == 0, r.stderr
        assert re.search(r"\bact\b", r.stdout) is None

    def test_gate_status_offline(self):
        r = self._run(["--json", "gate", "status"])
        assert r.returncode == 0 and json.loads(r.stdout)["connState"] == "disabled-by-policy"

    def test_recipe_refused_exit_3(self):
        r = self._run(["--json", "recipe", "form-index"])
        assert r.returncode == 3
        assert json.loads(r.stdout)["type"] == "policy_gate"
