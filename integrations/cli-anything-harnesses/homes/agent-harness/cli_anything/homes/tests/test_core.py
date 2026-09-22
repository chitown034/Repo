"""Offline tests for cli-anything-homes — synthetic trees, no network, no Chrome, no live site.

Every DOMShell-facing call goes through one seam (``homes_cli._live_source``),
which these tests replace with a ``FixtureTree`` built from ``tests/fixtures/*.json``.
The fixtures are entirely synthetic (invented addresses, names, ids).

What is asserted, per the connector spec's validation list:
1. ``--help`` exits 0 and the verb ``act`` appears nowhere (token-level, so the
   spec recipe name ``my-listing-activity`` cannot mask a real ``act`` group), no
   command named act/click/type exists anywhere in the Click tree, and the
   package source never references the browser harness's click/type_text.
2. Every recipe parses its fixture into ≥1 row (or a record), matching the
   fixture's ``expect`` block; ``--json`` output parses.
3. A logged-out tree (login wall, or a redirect to a login URL) yields an
   explicit ``auth_error`` (exit 2) — never a cached or empty "success".
4. The URL allow-list rejects off-site, non-https, userinfo and javascript: URLs.
5. Root present + nothing listed → explicit empty-result object (exit 0);
   root missing → ``path_map_error`` (exit 3) with a --discover hint.

Usage:
    python -m pytest cli_anything/homes/tests/test_core.py -v
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import click
import pytest
from click.testing import CliRunner

from cli_anything.homes import CLI_NAME, SITE
from cli_anything.homes import homes_cli as cli_mod
from cli_anything.homes.core import paths as paths_mod
from cli_anything.homes.core import recipes as recipes_mod
from cli_anything.homes.core.auth import AuthError
from cli_anything.homes.core.recipes import RecipeError
from cli_anything.homes.core.tree import FixtureTree, parse_entry, parse_entries
from cli_anything.homes.utils import security

HERE = Path(__file__).resolve().parent
FIXTURES = HERE / "fixtures"
PKG_DIR = HERE.parent
PM = paths_mod.load_default_path_map()
RECIPES = sorted(PM["recipes"])
HOSTS = PM["hosts"]
LIST_RECIPES = [r for r in RECIPES if PM["recipes"][r]["kind"] == "list"]
FIRST_AUTH_RECIPE = next(r for r in RECIPES if PM["recipes"][r]["requires_auth"])
FIRST_LIST_AUTH_RECIPE = next(r for r in LIST_RECIPES if PM["recipes"][r]["requires_auth"])


def fixture(name: str) -> FixtureTree:
    return FixtureTree.load(FIXTURES / f"{name}.json", hosts=HOSTS)


def fixture_data(name: str) -> dict:
    return json.loads((FIXTURES / f"{name}.json").read_text())


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture
def use_fixture(monkeypatch):
    """Swap the live seam for a fixture tree; returns the tree for call inspection."""
    def _use(name: str) -> FixtureTree:
        tree = fixture(name)
        monkeypatch.setattr(cli_mod, "_live_source", lambda: tree)
        return tree
    return _use


def _invoke_json(runner, args):
    result = runner.invoke(cli_mod.cli, ["--json", *args])
    try:
        data = json.loads(result.output)
    except json.JSONDecodeError:
        data = None
    return result, data


# ── 1. help surface: no act, no click, no type ──────────────────────────

def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[A-Za-z][A-Za-z0-9_-]*", text.lower()))


def _walk_commands(cmd, prefix=""):
    """Yield (dotted_name, command) for every command in the Click tree."""
    yield prefix or "<root>", cmd
    if isinstance(cmd, click.Group):
        for name, sub in cmd.commands.items():
            yield from _walk_commands(sub, f"{prefix}.{name}" if prefix else name)


class TestHelpSurface:
    def test_help_exits_zero(self, runner):
        result = runner.invoke(cli_mod.cli, ["--help"])
        assert result.exit_code == 0, result.output
        assert "read-only" in result.output.lower()

    def test_act_absent_from_every_help_page(self, runner):
        """The spec's mechanical guarantee: `act` is not a word in any --help output."""
        pages = {"<root>": runner.invoke(cli_mod.cli, ["--help"]).output}
        for name, cmd in _walk_commands(cli_mod.cli):
            if name == "<root>":
                continue
            result = runner.invoke(cli_mod.cli, [*name.split("."), "--help"])
            assert result.exit_code == 0, f"{name} --help failed: {result.output}"
            pages[name] = result.output
        for name, text in pages.items():
            assert "act" not in _tokens(text), f"'act' appears in help of {name}:\n{text}"

    def test_no_command_named_act_click_or_type(self):
        names = {n.split(".")[-1] for n, _ in _walk_commands(cli_mod.cli)}
        assert not names & {"act", "click", "type"}, names
        assert "act" not in cli_mod.cli.commands

    def test_read_only_groups_match_spec_allow_list(self):
        """Exactly the spec's read verbs — nothing more on fs / page / session."""
        assert set(cli_mod.cli.commands["fs"].commands) == {"ls", "cd", "cat", "grep", "pwd"}
        assert set(cli_mod.cli.commands["page"].commands) == {"open", "info", "back", "forward", "reload"}
        assert set(cli_mod.cli.commands["session"].commands) == {"status"}
        assert "daemon-start" not in cli_mod.cli.commands["session"].commands

    def test_source_never_references_write_backend(self):
        """No module in this package touches the browser harness's write functions."""
        offenders = []
        for py in PKG_DIR.rglob("*.py"):
            if "tests" in py.parts or py.name == "repl_skin.py":
                continue
            src = py.read_text(encoding="utf-8")
            for needle in ("backend.click(", "type_text(", ".click(", "domshell_backend import click"):
                if needle in src:
                    offenders.append(f"{py.name}: {needle}")
            # The browser's `act` group must not be re-exported either.
            if re.search(r"from cli_anything\.browser\.browser_cli import", src):
                offenders.append(f"{py.name}: imports browser_cli")
        assert not offenders, offenders

    def test_every_spec_recipe_is_a_subcommand(self):
        recipe_group = cli_mod.cli.commands["recipe"]
        assert set(recipe_group.commands) == set(RECIPES)


# ── 4. URL allow-list ──────────────────────────────────────────────────

class TestAllowList:
    @pytest.mark.parametrize("url", [
        "https://evil.example/",
        "https://" + HOSTS[0] + ".evil.example/",      # suffix trick
        "https://not-" + HOSTS[0] + "/",               # prefix trick
        "http://" + HOSTS[0] + "/",                    # downgrade
        "https://" + HOSTS[0] + "@evil.example/",      # userinfo trick
        "javascript:alert(1)",
        "file:///etc/passwd",
        HOSTS[0] + "/no-scheme",
        "",
    ])
    def test_rejects(self, url):
        ok, reason = security.validate_site_url(url, HOSTS)
        assert not ok, url
        assert reason
        with pytest.raises(security.URLRejected):
            security.require_site_url(url, HOSTS)

    @pytest.mark.parametrize("url", [
        "https://" + HOSTS[0] + "/",
        "https://www." + HOSTS[0] + "/some/page?x=1",
        "https://app." + HOSTS[0] + "/deep/path",
        "HTTPS://" + HOSTS[0].upper() + "/",
    ])
    def test_accepts_site_hosts(self, url):
        ok, reason = security.validate_site_url(url, HOSTS)
        assert ok, reason

    def test_page_open_rejects_off_site_before_touching_the_browser(self, runner):
        with patch.object(cli_mod, "_live_source") as seam:
            result, data = _invoke_json(runner, ["page", "open", "https://evil.example/"])
        assert result.exit_code == cli_mod.EXIT_URL_REJECTED
        assert data["type"] == "url_rejected"
        seam.assert_not_called()

    def test_page_open_accepts_site_url(self, runner, use_fixture):
        tree = use_fixture(RECIPES[0])
        result, data = _invoke_json(runner, ["page", "open", "https://www." + HOSTS[0] + "/"])
        assert result.exit_code == 0, result.output
        assert tree.opened == ["https://www." + HOSTS[0] + "/"]

    def test_recipe_url_option_is_allow_listed(self, runner, use_fixture):
        tree = use_fixture(RECIPES[0])
        result, data = _invoke_json(runner, ["recipe", RECIPES[0], "--url", "https://evil.example/x"])
        assert result.exit_code == cli_mod.EXIT_URL_REJECTED
        assert data["type"] == "url_rejected"
        assert tree.opened == []


# ── 2. every recipe against its fixture ────────────────────────────────

def _check_expect(values: dict, expected: dict):
    for key, want in expected.items():
        if key.endswith("_contains"):
            field = key[: -len("_contains")]
            assert values.get(field) is not None, f"{field} missing: {values}"
            assert want.lower() in str(values[field]).lower(), f"{field}={values[field]!r} lacks {want!r}"
        else:
            assert values.get(key) == want, f"{key}={values.get(key)!r} != {want!r}"


class TestRecipesAgainstFixtures:
    @pytest.mark.parametrize("name", RECIPES)
    def test_fixture_exists_and_is_synthetic(self, name):
        data = fixture_data(name)
        assert "_synthetic" in data
        assert "expect" in data

    @pytest.mark.parametrize("name", RECIPES)
    def test_engine_parses_fixture(self, name):
        data = fixture_data(name)
        exp = data["expect"]
        tree = fixture(name)
        result = recipes_mod.run_recipe(
            tree, PM, name, url=data.get("url") if PM["recipes"][name].get("url_required") else None,
            match=exp.get("match"), path_map_source="test",
        )
        assert result["recipe"] == name
        assert result["site"] == SITE
        assert result["auth_state"] == exp["auth_state"]
        assert result["path_map"]["verified"] is False   # honest until the first live run
        if exp["kind"] == "record":
            assert "record" in result
            _check_expect(result["record"], exp["record"])
        else:
            assert result["count"] == exp["count"] >= 1
            assert result["empty"] is False
            assert len(result["rows"]) == exp["count"]
            _check_expect(result["rows"][0], exp["row0"])
        # Fields resolved, nothing was silently dropped
        assert not any("not found" in w for w in result["warnings"]), result["warnings"]
        json.dumps(result)

    @pytest.mark.parametrize("name", RECIPES)
    def test_cli_json_output_parses(self, name, runner, use_fixture):
        data = fixture_data(name)
        exp = data["expect"]
        tree = use_fixture(name)
        args = ["recipe", name]
        if PM["recipes"][name].get("url_required"):
            args += ["--url", data["url"]]
        if exp.get("match"):
            args += ["--match", exp["match"]]
        result, parsed = _invoke_json(runner, args)
        assert result.exit_code == 0, result.output
        assert parsed is not None, result.output
        assert parsed["recipe"] == name
        assert tree.opened, "recipe must open the page it reads"
        if exp["kind"] == "list":
            assert parsed["count"] == exp["count"]
        else:
            assert parsed["record"]

    @pytest.mark.parametrize("name", RECIPES)
    def test_cli_human_output(self, name, runner, use_fixture):
        data = fixture_data(name)
        exp = data["expect"]
        use_fixture(name)
        args = ["recipe", name]
        if PM["recipes"][name].get("url_required"):
            args += ["--url", data["url"]]
        if exp.get("match"):
            args += ["--match", exp["match"]]
        result = runner.invoke(cli_mod.cli, args)
        assert result.exit_code == 0, result.output
        assert "UNVERIFIED" in result.output

    def test_match_requirement_is_enforced(self, runner, use_fixture):
        needs_match = [r for r in RECIPES if PM["recipes"][r].get("requires_match")]
        if not needs_match:
            pytest.skip("no recipe requires --match on this site")
        name = needs_match[0]
        use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name])
        assert result.exit_code == cli_mod.EXIT_RUNTIME
        assert data["type"] == "usage_error"

    def test_url_required_is_enforced(self, runner, use_fixture):
        needs_url = [r for r in RECIPES if PM["recipes"][r].get("url_required")]
        if not needs_url:
            pytest.skip("no recipe requires --url on this site")
        name = needs_url[0]
        tree = use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name])
        assert result.exit_code == cli_mod.EXIT_RUNTIME
        assert data["type"] == "usage_error"
        assert tree.opened == []

    def test_unknown_recipe_is_a_usage_error(self, runner):
        result = runner.invoke(cli_mod.cli, ["--json", "recipe", "no-such-recipe"])
        assert result.exit_code != 0

    def test_recipes_list_matches_path_map(self, runner):
        result, data = _invoke_json(runner, ["recipes"])
        assert result.exit_code == 0
        assert {r["name"] for r in data["recipes"]} == set(RECIPES)
        assert all(r["verified"] is False for r in data["recipes"])


# ── 3. logged out → explicit auth error, never an empty success ────────

class TestAuth:
    def test_engine_raises_on_login_wall(self):
        tree = fixture("logged-out")
        with pytest.raises(AuthError) as ei:
            recipes_mod.run_recipe(tree, PM, FIRST_AUTH_RECIPE)
        assert ei.value.state == "logged_out"

    def test_engine_raises_on_login_redirect(self):
        tree = fixture("login-redirect")
        with pytest.raises(AuthError) as ei:
            recipes_mod.run_recipe(tree, PM, FIRST_AUTH_RECIPE)
        assert ei.value.state == "logged_out"

    def test_engine_fails_closed_when_unsure(self):
        """No logged-in marker AND no logged-out marker → still an error (state 'unknown')."""
        tree = fixture("no-root")   # signed-in nav present
        tree.root["children"][0]["children"] = [{"name": "link_1", "role": "link", "text": "Home"}]
        with pytest.raises(AuthError) as ei:
            recipes_mod.run_recipe(tree, PM, FIRST_AUTH_RECIPE)
        assert ei.value.state == "unknown"
        assert "logged_in_markers" in ei.value.hint

    def test_cli_logged_out_is_exit_2_with_no_rows(self, runner, use_fixture):
        use_fixture("logged-out")
        result, data = _invoke_json(runner, ["recipe", FIRST_AUTH_RECIPE])
        assert result.exit_code == cli_mod.EXIT_AUTH
        assert data["type"] == "auth_error"
        assert "rows" not in data and "record" not in data and "count" not in data
        assert "hint" in data

    def test_cli_login_redirect_is_exit_2(self, runner, use_fixture):
        use_fixture("login-redirect")
        result, data = _invoke_json(runner, ["recipe", FIRST_AUTH_RECIPE])
        assert result.exit_code == cli_mod.EXIT_AUTH
        assert data["type"] == "auth_error"

    def test_public_recipe_does_not_need_sign_in(self):
        public = [r for r in RECIPES if not PM["recipes"][r]["requires_auth"]]
        if not public:
            pytest.skip("every recipe on this site needs sign-in")
        name = public[0]
        data = fixture_data(name)
        assert data["expect"]["auth_state"] == "not_required"

    def test_nothing_is_cached_between_runs(self, runner, use_fixture):
        """Two runs read two different trees — there is no cache layer to serve stale rows."""
        use_fixture(FIRST_LIST_AUTH_RECIPE)
        r1, d1 = _invoke_json(runner, ["recipe", FIRST_LIST_AUTH_RECIPE] + (
            ["--match", fixture_data(FIRST_LIST_AUTH_RECIPE)["expect"].get("match")] if fixture_data(FIRST_LIST_AUTH_RECIPE)["expect"].get("match") else []))
        assert d1["count"] >= 1
        use_fixture("logged-out")
        r2, d2 = _invoke_json(runner, ["recipe", FIRST_LIST_AUTH_RECIPE])
        assert r2.exit_code == cli_mod.EXIT_AUTH and "rows" not in d2


# ── 5. empty vs. path-map error ────────────────────────────────────────

class TestEmptyAndPathMap:
    def test_root_present_nothing_listed_is_explicit_empty(self, runner, use_fixture):
        use_fixture("empty")
        args = ["recipe", FIRST_LIST_AUTH_RECIPE]
        if PM["recipes"][FIRST_LIST_AUTH_RECIPE].get("requires_match"):
            args += ["--match", "anything"]
        result, data = _invoke_json(runner, args)
        assert result.exit_code == 0, result.output
        assert data["empty"] is True and data["count"] == 0 and data["rows"] == []

    def test_root_present_no_rows_warns(self, runner, use_fixture):
        use_fixture("no-rows")
        args = ["recipe", FIRST_LIST_AUTH_RECIPE]
        if PM["recipes"][FIRST_LIST_AUTH_RECIPE].get("requires_match"):
            args += ["--match", "anything"]
        result, data = _invoke_json(runner, args)
        assert result.exit_code == 0
        assert data["empty"] is True
        assert any("none matched rows selector" in w for w in data["warnings"])

    def test_root_missing_is_path_map_error(self, runner, use_fixture):
        use_fixture("no-root")
        args = ["recipe", FIRST_LIST_AUTH_RECIPE]
        if PM["recipes"][FIRST_LIST_AUTH_RECIPE].get("requires_match"):
            args += ["--match", "anything"]
        result, data = _invoke_json(runner, args)
        assert result.exit_code == cli_mod.EXIT_PATH_MAP
        assert data["type"] == "path_map_error"
        assert "--discover" in data["hint"]

    def test_discover_dumps_tree(self, runner, use_fixture):
        name = FIRST_LIST_AUTH_RECIPE
        use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name, "--discover", "--text"])
        assert result.exit_code == 0, result.output
        assert data["root_found"] == "/main"
        tree = data["tree"]
        assert tree["path"] == "/main" and tree["children"], tree
        first_row = next(c for c in tree["children"] if c["name"] == "listitem_1")
        assert first_row["children"], "--discover must descend into rows"
        assert all("text" in c for c in first_row["children"]), "--text must include node text"
        assert "how_to_fix" in data and "paths init" in data["how_to_fix"]

    def test_discover_reports_auth_instead_of_failing(self, runner, use_fixture):
        use_fixture("logged-out")
        result, data = _invoke_json(runner, ["recipe", FIRST_AUTH_RECIPE, "--discover"])
        assert result.exit_code == 0, result.output
        assert data["auth"]["state"] == "logged_out"
        assert data["auth"]["error"]


# ── path map loading and the tolerant entry parser ─────────────────────

class TestPathMap:
    def test_packaged_map_is_valid(self):
        assert paths_mod.validate_path_map(PM) == []
        assert PM["site"] == SITE

    def test_every_recipe_is_unverified_until_live(self):
        assert all(cfg.get("verified") is False for cfg in PM["recipes"].values())

    def test_env_override_wins(self, tmp_path, monkeypatch):
        alt = tmp_path / "alt.json"
        pm = json.loads(json.dumps(PM))
        pm["recipes"][RECIPES[0]]["root"] = ["/region_9"]
        alt.write_text(json.dumps(pm))
        monkeypatch.setenv(paths_mod.ENV_VAR, str(alt))
        loaded, source = paths_mod.load_path_map()
        assert source == str(alt)
        assert loaded["recipes"][RECIPES[0]]["root"] == ["/region_9"]

    def test_malformed_override_is_named_not_skipped(self, tmp_path, monkeypatch):
        bad = tmp_path / "bad.json"
        bad.write_text('{"site": "other"}')
        monkeypatch.setenv(paths_mod.ENV_VAR, str(bad))
        with pytest.raises(ValueError) as ei:
            paths_mod.load_path_map()
        assert "bad.json" in str(ei.value)

    def test_init_override_writes_local_copy_only(self, tmp_path, monkeypatch):
        monkeypatch.setenv("XDG_CONFIG_HOME", str(tmp_path))
        monkeypatch.delenv(paths_mod.ENV_VAR, raising=False)
        dest, written = paths_mod.init_override()
        assert written and dest.is_file()
        assert dest == tmp_path / "cli-anything" / f"{SITE}-paths.json"
        dest2, written2 = paths_mod.init_override()
        assert dest2 == dest and written2 is False


class TestPriorityMatching:
    def test_prefix_list_is_priority_ordered(self):
        nodes = [{"name": "text_1", "role": "text"}, {"name": "paragraph_1", "role": "paragraph"}]
        assert recipes_mod._by_priority(nodes, ["paragraph", "text"], [])[0]["name"] == "paragraph_1"
        assert recipes_mod._by_priority(nodes, ["heading", "text"], [])[0]["name"] == "text_1"
        assert recipes_mod._by_priority(nodes, ["heading"], ["paragraph"])[0]["name"] == "paragraph_1"
        assert recipes_mod._by_priority(nodes, ["heading"], []) == []

    def test_rows_prefer_list_items_over_filter_groups(self):
        entries = [{"name": "group_1", "is_dir": True}, {"name": "listitem_1", "is_dir": True},
                   {"name": "listitem_2", "is_dir": True}]
        rows = recipes_mod._select_rows(entries, {"prefix": ["listitem", "group"]})
        assert [r["name"] for r in rows] == ["listitem_1", "listitem_2"]


class TestEntryParser:
    @pytest.mark.parametrize("line, name, is_dir", [
        ("button[0]", "button[0]", False),
        ("div/", "div", True),
        ("listitem_3/ [listitem]", "listitem_3", True),
        ("  link_1 [link] \"Sign Out\"", "link_1", False),
        ("heading_1", "heading_1", False),
    ])
    def test_parse_entry_shapes(self, line, name, is_dir):
        e = parse_entry(line)
        assert e["name"] == name and e["is_dir"] is is_dir

    def test_indented_dump_keeps_shallowest_level_only(self):
        entries = [{"name": "main/"}, {"name": "  heading_1"}, {"name": "  link_1"}, {"name": "footer/"}]
        assert [e["name"] for e in parse_entries(entries)] == ["main", "footer"]

    def test_role_from_bracket_and_from_prefix(self):
        assert parse_entry("x_1 [textbox]")["role"] == "textbox"
        assert parse_entry("heading_2")["role"] == "heading"


# ── installed-command subprocess tests (HARNESS.md `_resolve_cli`) ─────

def _resolve_cli(name):
    """Resolve installed CLI command; falls back to python -m for dev.

    Set env CLI_ANYTHING_FORCE_INSTALLED=1 to require the installed command.
    """
    force = os.environ.get("CLI_ANYTHING_FORCE_INSTALLED", "").strip() == "1"
    path = shutil.which(name)
    if path:
        print(f"[_resolve_cli] Using installed command: {path}")
        return [path]
    if force:
        raise RuntimeError(f"{name} not found in PATH. Install with: pip install .")
    module = name.replace("cli-anything-", "cli_anything.") + "." + name.split("-")[-1] + "_cli"
    print(f"[_resolve_cli] Falling back to: {sys.executable} -m {module}")
    return [sys.executable, "-m", module]


class TestCLISubprocess:
    CLI_BASE = _resolve_cli(CLI_NAME)

    def _run(self, args, check=False):
        env = dict(os.environ)
        env[paths_mod.ENV_VAR] = str(paths_mod.PACKAGED_PATH)
        return subprocess.run(self.CLI_BASE + args, capture_output=True, text=True, check=check, env=env)

    def test_help(self):
        result = self._run(["--help"])
        assert result.returncode == 0, result.stderr
        assert "act" not in _tokens(result.stdout)

    def test_recipes_json_without_domshell(self):
        """`recipes` is a local listing — it must work with no DOMShell installed."""
        result = self._run(["--json", "recipes"])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert {r["name"] for r in data["recipes"]} == set(RECIPES)

    def test_paths_where_json(self):
        result = self._run(["--json", "paths", "where"])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert data["in_use"].endswith("paths.json")

    def test_version(self):
        result = self._run(["--version"])
        assert result.returncode == 0
        assert CLI_NAME in result.stdout
