"""Offline tests for cli-anything-publicfeeds — synthetic trees, no network, no Chrome, no live site.

Every DOMShell-facing call goes through one seam (``publicfeeds_cli._live_source``),
which these tests replace with a ``FixtureTree`` built from ``tests/fixtures/*.json``.
The fixtures are entirely synthetic (invented prices, rates, communities, dates).

Unlike ``cli-anything-homes``, no recipe here has ``requires_auth: true`` (every page
is public), so the marker-based auth tests homes.com's suite runs do not apply — the
engine's ``login_url_fragments`` redirect check still fires unconditionally, and that
is what ``TestAuth`` below exercises instead.

What is asserted, per the connector spec's validation list, plus this package's own
policy-gate addition:
1. ``--help`` exits 0 and the verb ``act`` appears nowhere; no ``fs``/``page``/``act``
   group exists at all (narrower than homes.com by design — see PUBLICFEEDS.md); no
   recipe name, description or field name in paths.json contains a write-verb token.
2. Every recipe parses its fixture into >=1 row (or a record), matching the fixture's
   ``expect`` block; ``--json`` output parses.
3. Every recipe refuses with exit 3 (``policy_gate``) while its group's
   ``CLI_ANYTHING_TOS_REVIEWED_<GROUP>`` is unset, and runs once it holds a real,
   past-or-today date.
4. A redirect to a login URL yields an explicit ``auth_error`` (exit 2) even though no
   recipe requires sign-in — never a cached or empty "success".
5. The URL allow-list rejects off-site, non-https, userinfo and javascript: URLs.
6. Root present + nothing listed -> explicit empty-result object (exit 0);
   root missing -> ``path_map_error`` (exit 4) with a --discover hint.

Usage:
    python -m pytest cli_anything/publicfeeds/tests/test_core.py -v
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

from cli_anything.publicfeeds import CLI_NAME, SITE
from cli_anything.publicfeeds import publicfeeds_cli as cli_mod
from cli_anything.publicfeeds.core import paths as paths_mod
from cli_anything.publicfeeds.core import policy
from cli_anything.publicfeeds.core import recipes as recipes_mod
from cli_anything.publicfeeds.core import target
from cli_anything.publicfeeds.core.auth import AuthError
from cli_anything.publicfeeds.core.recipes import RecipeError
from cli_anything.publicfeeds.core.tree import FixtureTree, parse_entry, parse_entries
from cli_anything.publicfeeds.utils import security

HERE = Path(__file__).resolve().parent
FIXTURES = HERE / "fixtures"
PKG_DIR = HERE.parent
PM = paths_mod.load_default_path_map()
RECIPES = sorted(PM["recipes"])
HOSTS = PM["hosts"]
LIST_RECIPES = [r for r in RECIPES if PM["recipes"][r]["kind"] == "list"]
RECORD_RECIPES = [r for r in RECIPES if PM["recipes"][r]["kind"] == "record"]
FIRST_LIST_RECIPE = LIST_RECIPES[0]

# A date safely in the past, for tests that need an open gate but are not
# themselves testing the gate.
_OPEN_DATE = "2026-09-23"

# Write-verb tokens the Command Deck's own cliAnythingStatus tripwire tests
# verbsEnabled against (see docs/data/cliAnythingStatus.doc.json's `_clamps`
# note and .claude/skills/cli-anything-connectors/SKILL.md). Reused here so
# this package's schema test and the deck's own guard can never disagree.
_WRITE_VERB_RE = re.compile(
    r"(\bact\b|request|confirm|cancel|reschedul|post|accept|assign|book|hire|send|submit|"
    r"sign|upload|delete|creat|updat|fill|pay|invit|messag|click|type)", re.IGNORECASE,
)


def fixture(name: str) -> FixtureTree:
    return FixtureTree.load(FIXTURES / f"{name}.json", hosts=HOSTS)


def fixture_data(name: str) -> dict:
    return json.loads((FIXTURES / f"{name}.json").read_text())


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture(autouse=True)
def open_all_gates(monkeypatch):
    """Every functional test gets all three gates open by default.

    TestPolicyGate below overrides this per-test to exercise the closed and
    malformed states — monkeypatch is function-scoped, so its own calls
    inside a test body simply take precedence over this fixture's setenv.
    """
    for group in target.POLICY_GROUPS:
        monkeypatch.setenv(policy.env_var(group), _OPEN_DATE)


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


# ── 1. help surface: no act, no click, no type, no fs/page group at all ────

def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[A-Za-z][A-Za-z0-9_-]*", text.lower()))


def _walk_commands(cmd, prefix=""):
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

    def test_no_fs_or_page_group_exists(self):
        """Narrower than cli-anything-homes on purpose (see PUBLICFEEDS.md): every
        live-touching command is a single named `recipe`, so the policy gate always
        knows which group it is checking. There is nothing to gate a raw `fs`/`page`
        browse against."""
        assert "fs" not in cli_mod.cli.commands
        assert "page" not in cli_mod.cli.commands
        assert "session" not in cli_mod.cli.commands

    def test_top_level_groups_match_spec_allow_list(self):
        assert set(cli_mod.cli.commands) == {"gate", "recipe", "recipes", "paths", "repl"}
        assert set(cli_mod.cli.commands["gate"].commands) == {"status"}
        assert set(cli_mod.cli.commands["paths"].commands) == {"show", "where", "init"}

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
            if re.search(r"from cli_anything\.browser\.browser_cli import", src):
                offenders.append(f"{py.name}: imports browser_cli")
        assert not offenders, offenders

    def test_every_spec_recipe_is_a_subcommand(self):
        recipe_group = cli_mod.cli.commands["recipe"]
        assert set(recipe_group.commands) == set(RECIPES)


# ── schema: no write verb anywhere in the new recipes (deliverable 6) ──────

class TestNoWriteVerbs:
    """Deliverable: 'a test that asserts none [of the new recipes] has a write verb.'

    Scans paths.json itself (not just --help output) so a write verb hiding in a
    recipe's name, description or field name is caught even before the CLI is built
    from it. Uses the SAME pattern the Command Deck's cliAnythingStatus tripwire
    tests verbsEnabled against, so this package and the deck's own guard agree on
    what counts as a write verb.
    """

    @pytest.mark.parametrize("name", RECIPES)
    def test_recipe_name_has_no_write_verb(self, name):
        assert not _WRITE_VERB_RE.search(name), f"recipe name {name!r} looks like a write verb"

    @pytest.mark.parametrize("name", RECIPES)
    def test_recipe_description_has_no_act_token(self, name):
        """The word-match form of the repo's mechanical guarantee (SKILL.md point 1),
        applied to descriptions too: a recipe's own help text (built from its
        `description`, surfaced verbatim in `recipe <name> --help`) must not
        contain the standalone word "act". The broader write-verb pattern
        (_WRITE_VERB_RE) is intentionally NOT run against descriptions — it is
        meant for short verb-group tokens (paths.json recipe/field names, and
        the deck's own verbsEnabled), and false-trips on ordinary prose here
        ("no sign-in needed", "updated Sep 20") the same way a substring match
        false-trips on `my-listing-activity` (F-H1-04). Recipe names and field
        names ARE checked against the broader pattern below, which is where a
        real write verb would actually show up."""
        desc = PM["recipes"][name]["description"]
        tokens = set(re.findall(r"[A-Za-z][A-Za-z0-9_-]*", desc.lower()))
        assert "act" not in tokens, f"recipe {name!r} description contains the word 'act': {desc!r}"

    @pytest.mark.parametrize("name", RECIPES)
    def test_recipe_field_names_have_no_write_verb(self, name):
        cfg = PM["recipes"][name]
        field_names = list((cfg.get("fields") or {}).keys())
        for fname in field_names:
            assert not _WRITE_VERB_RE.search(fname), f"{name}.{fname} looks like a write verb"

    def test_no_recipe_kind_is_a_write_shape(self):
        assert all(PM["recipes"][n]["kind"] in ("list", "record") for n in RECIPES)

    def test_every_recipe_has_exactly_one_known_policy_group(self):
        for name in RECIPES:
            group = PM["recipes"][name].get("policy_group")
            assert group in target.POLICY_GROUPS, f"{name}: policy_group {group!r} not in target.POLICY_GROUPS"


# ── 4. URL allow-list ──────────────────────────────────────────────────

class TestAllowList:
    @pytest.mark.parametrize("url", [
        "https://evil.example/",
        "https://" + HOSTS[0] + ".evil.example/",
        "https://not-" + HOSTS[0] + "/",
        "http://" + HOSTS[0] + "/",
        "https://" + HOSTS[0] + "@evil.example/",
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

    @pytest.mark.parametrize("host", HOSTS)
    def test_accepts_every_allow_listed_host(self, host):
        ok, reason = security.validate_site_url(f"https://{host}/", HOSTS)
        assert ok, reason
        ok, reason = security.validate_site_url(f"https://www.{host}/some/page", HOSTS)
        assert ok, reason

    def test_recipe_url_option_is_allow_listed(self, runner, use_fixture):
        name = RECIPES[0]
        tree = use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name, "--url", "https://evil.example/x"])
        assert result.exit_code == cli_mod.EXIT_URL_REJECTED
        assert data["type"] == "url_rejected"
        assert tree.opened == []


# ── 2. every recipe against its fixture ────────────────────────────────

def _check_expect(values: dict, expected: dict):
    for key, want in expected.items():
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
        result = recipes_mod.run_recipe(tree, PM, name, path_map_source="test")
        assert result["recipe"] == name
        assert result["site"] == SITE
        assert result["auth_state"] == exp["auth_state"]
        assert result["path_map"]["verified"] is False  # honest until the first live run
        if exp["kind"] == "record":
            assert "record" in result
            _check_expect(result["record"], exp["record"])
        else:
            assert result["count"] == exp["count"] >= 1
            assert result["empty"] is False
            assert len(result["rows"]) == exp["count"]
            _check_expect(result["rows"][0], exp["row0"])
        assert not any("not found" in w for w in result["warnings"]), result["warnings"]
        json.dumps(result)

    @pytest.mark.parametrize("name", RECIPES)
    def test_cli_json_output_parses(self, name, runner, use_fixture):
        data = fixture_data(name)
        exp = data["expect"]
        tree = use_fixture(name)
        result, parsed = _invoke_json(runner, ["recipe", name])
        assert result.exit_code == 0, result.output
        assert parsed is not None, result.output
        assert parsed["recipe"] == name
        assert parsed["policyGate"]["connState"] == "gate-open"
        assert tree.opened, "recipe must open the page it reads"
        if exp["kind"] == "list":
            assert parsed["count"] == exp["count"]
        else:
            assert parsed["record"]

    @pytest.mark.parametrize("name", RECIPES)
    def test_cli_human_output(self, name, runner, use_fixture):
        use_fixture(name)
        result = runner.invoke(cli_mod.cli, ["recipe", name])
        assert result.exit_code == 0, result.output
        assert "UNVERIFIED" in result.output

    def test_unknown_recipe_is_a_usage_error(self, runner):
        result = runner.invoke(cli_mod.cli, ["--json", "recipe", "no-such-recipe"])
        assert result.exit_code != 0

    def test_recipes_list_matches_path_map(self, runner):
        result, data = _invoke_json(runner, ["recipes"])
        assert result.exit_code == 0
        assert {r["name"] for r in data["recipes"]} == set(RECIPES)
        assert all(r["verified"] is False for r in data["recipes"])
        assert all(r["gateOpen"] is True for r in data["recipes"])  # autouse fixture opened them


# ── 3. login redirect -> explicit auth error, never an empty success ───

class TestAuth:
    """No recipe here has requires_auth: true (every page is public), so the
    marker-based checks cli-anything-homes exercises do not apply — see the
    docstring at the top of this file. The redirect check is unconditional in
    core/auth.py, so it is exercised with an arbitrary recipe."""

    def test_engine_raises_on_login_redirect(self):
        tree = fixture("login-redirect")
        with pytest.raises(AuthError) as ei:
            recipes_mod.run_recipe(tree, PM, RECIPES[0])
        assert ei.value.state == "logged_out"

    def test_cli_login_redirect_is_exit_2(self, runner, use_fixture):
        use_fixture("login-redirect")
        result, data = _invoke_json(runner, ["recipe", RECIPES[0]])
        assert result.exit_code == cli_mod.EXIT_AUTH
        assert data["type"] == "auth_error"

    def test_every_recipe_is_public_no_sign_in(self):
        assert all(not PM["recipes"][n]["requires_auth"] for n in RECIPES)
        for name in RECIPES:
            assert fixture_data(name)["expect"]["auth_state"] == "not_required"

    def test_nothing_is_cached_between_runs(self, runner, use_fixture):
        """Two runs read two different trees - there is no cache layer to serve stale rows."""
        use_fixture(FIRST_LIST_RECIPE)
        r1, d1 = _invoke_json(runner, ["recipe", FIRST_LIST_RECIPE])
        assert d1["count"] >= 1
        use_fixture("login-redirect")
        r2, d2 = _invoke_json(runner, ["recipe", FIRST_LIST_RECIPE])
        assert r2.exit_code == cli_mod.EXIT_AUTH and "rows" not in d2


# ── policy gate ──────────────────────────────────────────────────────

class TestPolicyGate:
    def test_unset_env_var_is_blocked(self, monkeypatch):
        monkeypatch.delenv(policy.env_var("marketpages"), raising=False)
        gs = policy.check_gate("marketpages")
        assert gs.ok is False
        assert gs.conn_state == policy.STATE_BLOCKED

    def test_valid_past_date_opens_the_gate(self, monkeypatch):
        monkeypatch.setenv(policy.env_var("lenderrates"), "2020-01-01")
        gs = policy.check_gate("lenderrates")
        assert gs.ok is True
        assert gs.conn_state == policy.STATE_OPEN
        assert gs.reviewed_at == "2020-01-01"

    def test_future_date_is_blocked(self, monkeypatch):
        monkeypatch.setenv(policy.env_var("builderpages"), "2099-01-01")
        gs = policy.check_gate("builderpages")
        assert gs.ok is False

    def test_malformed_date_is_blocked(self, monkeypatch):
        monkeypatch.setenv(policy.env_var("marketpages"), "not-a-date")
        gs = policy.check_gate("marketpages")
        assert gs.ok is False

    def test_unknown_group_raises(self):
        with pytest.raises(ValueError):
            policy.check_gate("not-a-real-group")

    def test_groups_are_independent(self, monkeypatch):
        """Opening one group's gate must never open another's."""
        monkeypatch.setenv(policy.env_var("marketpages"), _OPEN_DATE)
        monkeypatch.delenv(policy.env_var("lenderrates"), raising=False)
        monkeypatch.delenv(policy.env_var("builderpages"), raising=False)
        assert policy.check_gate("marketpages").ok is True
        assert policy.check_gate("lenderrates").ok is False
        assert policy.check_gate("builderpages").ok is False

    def test_cli_refuses_with_exit_3_when_gate_closed(self, runner, use_fixture, monkeypatch):
        name = RECIPES[0]  # a marketpages recipe
        group = PM["recipes"][name]["policy_group"]
        monkeypatch.delenv(policy.env_var(group), raising=False)
        tree = use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name])
        assert result.exit_code == cli_mod.EXIT_POLICY_GATE == 3
        assert data["type"] == "policy_gate"
        assert data["connState"] == "disabled-by-policy"
        assert tree.opened == [], "a disabled-by-policy recipe must never open the page"

    def test_discover_is_also_gated(self, runner, use_fixture, monkeypatch):
        name = RECIPES[0]
        group = PM["recipes"][name]["policy_group"]
        monkeypatch.delenv(policy.env_var(group), raising=False)
        tree = use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name, "--discover"])
        assert result.exit_code == cli_mod.EXIT_POLICY_GATE
        assert tree.opened == []

    def test_gate_status_reports_all_three(self, runner, monkeypatch):
        for group in target.POLICY_GROUPS:
            monkeypatch.delenv(policy.env_var(group), raising=False)
        result, data = _invoke_json(runner, ["gate", "status"])
        assert result.exit_code == 0
        assert set(data) == set(target.POLICY_GROUPS)
        assert all(g["connState"] == "disabled-by-policy" for g in data.values())

    def test_setting_the_variable_does_not_bypass_recipe_correctness(self, runner, use_fixture, monkeypatch):
        """An open gate is necessary, not sufficient - the path map can still be wrong."""
        name = RECIPES[0]
        group = PM["recipes"][name]["policy_group"]
        monkeypatch.setenv(policy.env_var(group), _OPEN_DATE)
        use_fixture("no-root")
        result, data = _invoke_json(runner, ["recipe", name])
        assert result.exit_code == cli_mod.EXIT_PATH_MAP
        assert data["type"] == "path_map_error"


# ── 6. empty vs. path-map error ────────────────────────────────────────

class TestEmptyAndPathMap:
    def test_root_present_nothing_listed_is_explicit_empty(self, runner, use_fixture):
        use_fixture("empty")
        result, data = _invoke_json(runner, ["recipe", FIRST_LIST_RECIPE])
        assert result.exit_code == 0, result.output
        assert data["empty"] is True and data["count"] == 0 and data["rows"] == []

    def test_root_present_no_rows_warns(self, runner, use_fixture):
        use_fixture("no-rows")
        result, data = _invoke_json(runner, ["recipe", FIRST_LIST_RECIPE])
        assert result.exit_code == 0
        assert data["empty"] is True
        assert any("none matched rows selector" in w for w in data["warnings"])

    def test_root_missing_is_path_map_error(self, runner, use_fixture):
        use_fixture("no-root")
        result, data = _invoke_json(runner, ["recipe", RECIPES[0]])
        assert result.exit_code == cli_mod.EXIT_PATH_MAP == 4
        assert data["type"] == "path_map_error"
        assert "--discover" in data["hint"]

    def test_discover_dumps_tree(self, runner, use_fixture):
        name = FIRST_LIST_RECIPE
        use_fixture(name)
        result, data = _invoke_json(runner, ["recipe", name, "--discover", "--text"])
        assert result.exit_code == 0, result.output
        assert data["root_found"] == "/main"
        assert "how_to_fix" in data and "paths init" in data["how_to_fix"]
        assert data["policyGate"]["connState"] == "gate-open"


# ── path map loading and the tolerant entry parser (shared engine code) ─

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


class TestEntryParser:
    @pytest.mark.parametrize("line, name, is_dir", [
        ("button[0]", "button[0]", False),
        ("div/", "div", True),
        ("row_3/ [row]", "row_3", True),
        ("  link_1 [link] \"Sign Out\"", "link_1", False),
        ("heading_1", "heading_1", False),
    ])
    def test_parse_entry_shapes(self, line, name, is_dir):
        e = parse_entry(line)
        assert e["name"] == name and e["is_dir"] is is_dir

    def test_indented_dump_keeps_shallowest_level_only(self):
        entries = [{"name": "main/"}, {"name": "  heading_1"}, {"name": "  link_1"}, {"name": "footer/"}]
        assert [e["name"] for e in parse_entries(entries)] == ["main", "footer"]


# ── installed-command subprocess tests (HARNESS.md `_resolve_cli`) ─────

def _resolve_cli(name):
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
        """`recipes` is a local listing - it must work with no DOMShell installed."""
        result = self._run(["--json", "recipes"])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert {r["name"] for r in data["recipes"]} == set(RECIPES)

    def test_gate_status_json_without_domshell(self):
        result = self._run(["--json", "gate", "status"])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert set(data) == set(target.POLICY_GROUPS)

    def test_paths_where_json(self):
        result = self._run(["--json", "paths", "where"])
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert data["in_use"].endswith("paths.json")

    def test_version(self):
        result = self._run(["--version"])
        assert result.returncode == 0
        assert CLI_NAME in result.stdout
