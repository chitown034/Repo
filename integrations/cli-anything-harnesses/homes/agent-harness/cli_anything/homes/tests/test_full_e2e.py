"""LIVE tests for cli-anything-homes — never run in the build sandbox.

These require, on the Mac: Chrome running with the DOMShell extension, Node/npx,
``DOMSHELL_TOKEN`` exported, and Steven signed in to homes.com in that
Chrome profile. They read the real site (read-only) and are gated behind an
explicit opt-in so an unattended ``pytest`` can never touch a live portal:

    CLI_ANYTHING_HOMES_LIVE=1 python -m pytest cli_anything/homes/tests/test_full_e2e.py -v -s

When the gate is set the tests do NOT degrade gracefully: a missing DOMShell or a
signed-out session is a failure, because that is exactly what they exist to detect.
Until they have been run and their output pasted into TEST.md, every path map in
paths.json stays ``verified: false``.
"""

from __future__ import annotations

import json
import os
import subprocess

import pytest

from cli_anything.homes import CLI_NAME
from cli_anything.homes.core import paths as paths_mod

LIVE = os.environ.get("CLI_ANYTHING_HOMES_LIVE", "").strip() == "1"

pytestmark = pytest.mark.skipif(
    not LIVE,
    reason="live homes.com tests are opt-in: set CLI_ANYTHING_HOMES_LIVE=1 on the Mac with DOMShell running and a signed-in session",
)

PM = paths_mod.load_default_path_map()
RECIPES = sorted(PM["recipes"])


def _run(args):
    return subprocess.run([CLI_NAME, "--json", *args], capture_output=True, text=True)


class TestLiveReadOnly:
    def test_domshell_is_available(self):
        from cli_anything.browser.utils.domshell_backend import is_available
        ok, msg = is_available()
        assert ok, msg

    @pytest.mark.parametrize("name", RECIPES)
    def test_recipe_returns_rows_or_explicit_empty(self, name):
        cfg = PM["recipes"][name]
        if cfg.get("url_required") or cfg.get("requires_match"):
            pytest.skip(f"{name} needs --url/--match: run it by hand and paste the output into TEST.md")
        result = _run(["recipe", name])
        data = json.loads(result.stdout)
        print(f"\n  {name}: exit={result.returncode} -> {json.dumps(data)[:600]}")
        assert result.returncode == 0, data          # an auth_error here means: sign in, then re-run
        if cfg["kind"] == "list":
            assert data["count"] >= 1 or data["empty"] is True
        else:
            assert data["record"]

    @pytest.mark.parametrize("name", RECIPES)
    def test_discover_dumps_live_tree(self, name):
        cfg = PM["recipes"][name]
        if cfg.get("url_required"):
            pytest.skip(f"{name} needs --url")
        result = _run(["recipe", name, "--discover"])
        data = json.loads(result.stdout)
        print(f"\n  {name} discover: root_found={data.get('root_found')} auth={data.get('auth')}")
        assert result.returncode == 0
        assert data["tree"]
