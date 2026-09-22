"""``discover`` — dump the live accessibility tree so the unverified path map can
be corrected. Bounded by depth and node count; read-only (``ls`` only)."""

from __future__ import annotations

from cli_anything.skyslope.core import target
from cli_anything.skyslope.utils import skyslope_backend as backend


def walk(session, root: str = "/", max_depth: int = 3, max_nodes: int = 400, *,
         backend_mod=None) -> dict:
    backend_mod = backend_mod or backend   # resolved at call time, see recipes.run
    nodes: list[dict] = []
    truncated = False
    queue = [(root, 0)]
    while queue:
        path, depth = queue.pop(0)
        res = backend_mod.ls(session, path)
        if not isinstance(res, dict) or "error" in res:
            nodes.append({"path": path, "depth": depth, "error": (res or {}).get("error")})
            continue
        for entry in res.get("entries", []):
            name = (entry.get("name") or "").strip()
            if not name:
                continue
            is_dir = name.endswith("/")
            bare = name.rstrip("/")
            child = ("/" + bare) if path == "/" else (path.rstrip("/") + "/" + bare)
            nodes.append({"path": child, "name": bare, "dir": is_dir, "depth": depth + 1})
            if len(nodes) >= max_nodes:
                truncated = True
                queue.clear()
                break
            if is_dir and depth + 1 < max_depth:
                queue.append((child, depth + 1))
    return {
        "target": target.NAME, "root": root, "count": len(nodes), "nodes": nodes,
        "truncated": truncated, "maxDepth": max_depth, "maxNodes": max_nodes,
        "note": ("Directory entries carry a trailing '/' in DOMShell's ls output. Copy the "
                 "paths you need into paths.json list_path / read_path, then run "
                 "`paths validate`."),
    }
