"""The read recipes. One engine, driven by the path map; nothing here can write.

Each run: open the recipe URL (allow-listed hosts only) → check for a sign-in
page → ``ls`` the list path → optional ``cat`` / ``grep``. A logged-out session
is an explicit auth error with no rows — never a partial or cached result.
``document-index`` lists names; there is no download function anywhere to call.
"""

from __future__ import annotations

from typing import Any, Optional

from cli_anything.zipforms.core import paths as paths_mod
from cli_anything.zipforms.core import target
from cli_anything.zipforms.utils import zipforms_backend as backend


def _err(res: Any) -> bool:
    return not isinstance(res, dict) or "error" in res


def _error(kind: str, message: str, **extra) -> dict:
    out = {"error": message, "type": kind, "target": target.NAME, "rows": [], "count": 0}
    out.update(extra)
    return out


def run(name: str, path_map: dict, id: Optional[str] = None, *,
        backend_mod=None) -> dict:
    """Run one read recipe against the live tree via the backend seam.

    ``backend_mod`` is resolved at call time (not bound as a default) so a
    patched seam is honoured — by tests and by anyone wrapping the harness.
    """
    backend_mod = backend_mod or backend
    if name not in target.RECIPES:
        raise ValueError(f"unknown recipe {name!r}; known: {', '.join(target.RECIPES)}")
    spec = paths_mod.recipe_spec(path_map["map"], name)
    url = paths_mod.render_url(spec["url"], id=id)

    session = backend_mod.new_session()
    opened = backend_mod.open_url(session, url)
    if _err(opened):
        return _error("navigation_error", f"could not open {url}: {opened.get('error')}",
                      url=url, recipe=name)

    auth = _auth_check(backend_mod, session, path_map["map"].get("login_markers", []),
                       spec.get("auth_check_path") or "/")
    if auth:
        return dict(auth, url=url, recipe=name)

    listing = backend_mod.ls(session, spec["list_path"])
    if _err(listing):
        return _error(
            "path_error",
            f"list_path {spec['list_path']} failed: {listing.get('error')} — the map is "
            f"unverified; run `discover` and correct {path_map['source']}",
            url=url, recipe=name)

    rows = [{"name": e.get("name", ""), "path": e.get("path", "")}
            for e in listing.get("entries", []) if e.get("name")]
    out = {
        "recipe": name, "target": target.NAME, "url": url,
        "verified": bool(spec.get("verified", False)),
        "count": len(rows), "rows": rows,
        "pathMap": path_map["source"], "note": spec.get("note"),
    }
    if spec.get("read_path"):
        r = backend_mod.cat(session, spec["read_path"])
        out["text"] = None if _err(r) else r.get("output", "")
        if _err(r):
            out["textError"] = r.get("error")
    if spec.get("grep"):
        g = backend_mod.grep(session, spec["grep"], spec["list_path"])
        out["matches"] = [] if _err(g) else g.get("matches", [])
        if _err(g):
            out["matchesError"] = g.get("error")
    return out


def _auth_check(backend_mod, session, markers, at_path) -> Optional[dict]:
    """Explicit sign-in detection. Any marker match → auth error, no rows."""
    for marker in markers:
        res = backend_mod.grep(session, marker, at_path)
        if _err(res):
            return _error(
                "auth_check_failed",
                f"could not verify the Chrome session is signed in (grep {marker!r} at "
                f"{at_path} failed: {res.get('error')}); no rows returned")
        if res.get("matches"):
            return _error(
                "auth_error",
                f"not authenticated — the Chrome session shows a {target.NAME} sign-in "
                f"page (matched {marker!r}); no rows returned. Sign in to {target.NAME} "
                "in Chrome and run again.")
    return None
