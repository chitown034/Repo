"""The path map — where each recipe looks in the accessibility tree.

Shipped as ``paths.json`` beside this package; overridable with ``--paths FILE``
or the ``CLI_ANYTHING_SKYSLOPE_PATHS`` environment variable. Every entry is
best-effort and UNVERIFIED until the first live run — the site is egress-blocked
from the sandbox this was written in. ``discover`` dumps the live tree so the
map can be corrected by hand and re-validated offline with ``paths validate``.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Mapping, Optional

from cli_anything.skyslope.core import target

DEFAULT_FILE = Path(__file__).resolve().parent.parent / "paths.json"
REQUIRED_TOP = ("target", "allowed_url_prefixes", "login_markers", "recipes")
REQUIRED_RECIPE = ("url", "list_path")
_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


class PathMapError(ValueError):
    """The path map is missing, unreadable or fails validation."""


def resolve_file(explicit: Optional[str] = None,
                 env: Optional[Mapping[str, str]] = None) -> Path:
    env = os.environ if env is None else env
    if explicit:
        return Path(explicit)
    if env.get(target.PATHS_ENV):
        return Path(env[target.PATHS_ENV])
    return DEFAULT_FILE


def load(explicit: Optional[str] = None,
         env: Optional[Mapping[str, str]] = None) -> dict:
    """Load and validate the map. Returns ``{"source": <file>, "map": <data>}``."""
    f = resolve_file(explicit, env)
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise PathMapError(f"path map not found: {f}") from None
    except json.JSONDecodeError as e:
        raise PathMapError(f"path map {f} is not valid JSON: {e}") from None
    errors = validate(data)
    if errors:
        raise PathMapError(f"path map {f} is invalid: " + "; ".join(errors))
    return {"source": str(f), "map": data}


def validate(data) -> list[str]:
    """Offline schema check. Returns a list of problems; empty means valid."""
    errors: list[str] = []
    if not isinstance(data, dict):
        return ["top level must be an object"]
    for k in REQUIRED_TOP:
        if k not in data:
            errors.append(f"missing key {k!r}")
    recipes = data.get("recipes")
    if not isinstance(recipes, dict):
        errors.append("'recipes' must be an object")
        return errors
    prefixes = data.get("allowed_url_prefixes") or []
    for name in target.RECIPES:
        if name not in recipes:
            errors.append(f"recipe {name!r} missing from map")
    for name, spec in recipes.items():
        if not isinstance(spec, dict):
            errors.append(f"recipe {name!r} must be an object")
            continue
        for k in REQUIRED_RECIPE:
            if not spec.get(k):
                errors.append(f"recipe {name!r} missing {k!r}")
        url = spec.get("url") or ""
        if url and not any(url.startswith(p) for p in prefixes):
            errors.append(f"recipe {name!r} url is outside allowed_url_prefixes")
        if target.RECIPES.get(name, {}).get("needs_id") and "{id}" not in url:
            errors.append(f"recipe {name!r} needs an id but its url has no {{id}} placeholder")
        for k in ("list_path", "read_path", "auth_check_path"):
            v = spec.get(k)
            if v is not None and (not isinstance(v, str) or not v.startswith("/")):
                errors.append(f"recipe {name!r}: {k} must be an absolute tree path")
    return errors


def recipe_spec(data: dict, name: str) -> dict:
    try:
        return data["recipes"][name]
    except KeyError:
        raise PathMapError(f"recipe {name!r} is not in the path map") from None


def render_url(template: str, id: Optional[str] = None) -> str:
    """Substitute ``{id}``. Ids are plain identifiers only — nothing that could
    change the path or the host."""
    if "{id}" not in template:
        return template
    if not id:
        raise PathMapError("this recipe needs an id")
    if not _ID_RE.match(id):
        raise PathMapError(
            f"id {id!r} is not a plain identifier (letters, digits, - and _ only, max 64)")
    return template.replace("{id}", id)
