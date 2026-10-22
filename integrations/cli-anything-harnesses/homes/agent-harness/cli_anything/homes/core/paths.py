"""Path-map loading for the homes.com harness.

The *path map* (``paths.json``) is the only place site structure lives: which
URL a recipe opens, which host names are allowed, which accessibility-tree path
is the recipe's root, how rows and fields are recognised, and which text marks
a logged-in or logged-out page.

Resolution order (first hit wins):

1. ``$CLI_ANYTHING_HOMES_PATHS`` — an explicit file path.
2. ``~/.config/cli-anything/homes-paths.json`` — Steven's edited copy.
3. The packaged default next to this package (``cli_anything/homes/paths.json``).

The packaged default is **unverified until the first live run** (see
``verified`` per recipe). ``recipe <name> --discover`` dumps the live tree so the
map can be corrected without touching code; ``paths init`` copies the default to
location 2 for editing.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from cli_anything.homes import SITE

ENV_VAR = "CLI_ANYTHING_HOMES_PATHS"
PACKAGED_PATH = Path(__file__).resolve().parent.parent / "paths.json"

_REQUIRED_TOP = ("site", "hosts", "auth", "recipes")
_REQUIRED_RECIPE = ("kind", "description", "root")


def override_location() -> Path:
    """Where an edited path map is looked for (and written by ``paths init``)."""
    return Path(
        os.environ.get("XDG_CONFIG_HOME", str(Path.home() / ".config"))
    ) / "cli-anything" / f"{SITE}-paths.json"


def candidate_locations() -> list[Path]:
    """All locations in resolution order (env var first, packaged default last)."""
    out: list[Path] = []
    env = os.environ.get(ENV_VAR, "").strip()
    if env:
        out.append(Path(env).expanduser())
    out.append(override_location())
    out.append(PACKAGED_PATH)
    return out


def validate_path_map(pm: dict) -> list[str]:
    """Return a list of problems (empty means the map is usable)."""
    problems: list[str] = []
    if not isinstance(pm, dict):
        return ["path map must be a JSON object"]
    for key in _REQUIRED_TOP:
        if key not in pm:
            problems.append(f"missing top-level key '{key}'")
    if pm.get("site") != SITE:
        problems.append(f"'site' is {pm.get('site')!r}, expected {SITE!r}")
    hosts = pm.get("hosts")
    if not isinstance(hosts, list) or not hosts or not all(isinstance(h, str) for h in hosts):
        problems.append("'hosts' must be a non-empty list of host names")
    auth = pm.get("auth") or {}
    for key in ("logged_in_markers", "logged_out_markers", "login_url_fragments"):
        if not isinstance(auth.get(key), list):
            problems.append(f"'auth.{key}' must be a list")
    recipes = pm.get("recipes")
    if not isinstance(recipes, dict) or not recipes:
        problems.append("'recipes' must be a non-empty object")
        return problems
    for name, cfg in recipes.items():
        if not isinstance(cfg, dict):
            problems.append(f"recipe '{name}' must be an object")
            continue
        for key in _REQUIRED_RECIPE:
            if key not in cfg:
                problems.append(f"recipe '{name}' is missing '{key}'")
        if cfg.get("kind") not in ("list", "record"):
            problems.append(f"recipe '{name}': kind must be 'list' or 'record'")
        if cfg.get("kind") == "list" and not isinstance(cfg.get("fields"), dict):
            problems.append(f"recipe '{name}': list recipes need a 'fields' object")
        if cfg.get("url") is None and not cfg.get("url_required"):
            problems.append(f"recipe '{name}': needs 'url' or 'url_required': true")
    return problems


def load_path_map_from(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as fh:
        pm = json.load(fh)
    problems = validate_path_map(pm)
    if problems:
        raise ValueError(f"{path}: " + "; ".join(problems))
    return pm


def load_default_path_map() -> dict:
    """The packaged default, ignoring overrides (used by tests and ``paths init``)."""
    return load_path_map_from(PACKAGED_PATH)


def load_path_map() -> tuple[dict, str]:
    """Load the effective path map. Returns ``(map, source_path_as_str)``.

    A malformed override raises ``ValueError`` naming the file — it is never
    silently skipped, because a half-applied map would produce wrong numbers.
    """
    for cand in candidate_locations():
        if cand.is_file():
            return load_path_map_from(cand), str(cand)
    raise FileNotFoundError(f"no paths.json found; looked in {candidate_locations()}")


def init_override(force: bool = False) -> tuple[Path, bool]:
    """Copy the packaged default to :func:`override_location`.

    Returns ``(path, written)``. Never overwrites an existing file unless ``force``.
    This writes to the local config directory only — never to any web site.
    """
    dest = override_location()
    if dest.exists() and not force:
        return dest, False
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(PACKAGED_PATH, dest)
    try:
        os.chmod(dest, 0o600)
    except OSError:
        pass
    return dest, True
