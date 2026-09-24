"""Recipe engine: turn a path map + a TreeSource into rows of JSON.

A *recipe* is a named, read-only path map into one page of a public real-estate
or lender research site (market data, advertised rates, builder incentives)::

    "todays-showings": {
      "kind": "list",                    # "list" → rows[]; "record" → record{}
      "description": "...",
      "url": "https://…",                # default page; --url overrides (allow-listed)
      "url_required": false,             # true → --url is mandatory (e.g. a detail page)
      "requires_auth": true,             # fail closed unless a logged-in marker is found
      "requires_match": false,           # true → --match is mandatory (status look-ups)
      "root": ["/main", "/"],            # first path that exists wins
      "rows": {"prefix": ["listitem", "article", "row"], "role": []},
      "depth": 1,                        # how deep under a row to gather text
      "fields": {
        "address": {"prefix": ["link", "heading"], "index": 0},
        "price":   {"regex": "\\\\$[\\\\d,]+"},
        "beds":    {"regex": "(\\\\d+)\\\\s*(?:bd|bed)", "group": 1}
      },
      "verified": false                  # flipped by hand after a live spot-check
    }

Field resolution, per row: gather the row's descendant nodes to ``depth``
(``cat`` each), then for each field pick the ``index``-th node whose name (or
role) matches ``prefix``/``role`` and take its text — optionally narrowed by
``regex``. A field with only ``regex`` searches the row's whole text corpus.
Missing fields are ``null`` and counted in ``warnings``; they never abort a run.

``prefix`` and ``role`` lists are **priority-ordered**: the first entry that
matches anything wins (``["paragraph", "text"]`` means "the paragraph, or
failing that a text node"), and ``index`` counts within that winning group.
The same rule selects rows, so a page with both ``listitem_*`` rows and
``group_*`` filter widgets yields only the list items.

``root`` must name a specific container (``/main``); do not add ``/`` as a
fallback — a root that always exists can never report that the map no longer
fits the page, and that report (exit 3, "run --discover") is the point.

The engine does no caching of any kind: every call reads the live page.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Optional

from cli_anything.publicfeeds import SITE, __version__
from cli_anything.publicfeeds.utils.security import require_site_url

from .auth import check_auth
from .tree import TreeError, TreeSource, children, text_of

MAX_DISCOVER_NODES = 400


class RecipeError(RuntimeError):
    """A recipe could not run. ``kind`` is 'usage_error' or 'path_map_error'."""

    def __init__(self, message: str, kind: str = "path_map_error", hint: str = "") -> None:
        super().__init__(message)
        self.kind = kind
        self.hint = hint


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def list_recipes(pm: dict) -> list[dict]:
    out = []
    for name, cfg in (pm.get("recipes") or {}).items():
        out.append({
            "name": name,
            "kind": cfg.get("kind"),
            "description": cfg.get("description", ""),
            "url": cfg.get("url"),
            "url_required": bool(cfg.get("url_required")),
            "requires_auth": bool(cfg.get("requires_auth")),
            "requires_match": bool(cfg.get("requires_match")),
            "verified": bool(cfg.get("verified", False)),
        })
    return out


def _recipe_cfg(pm: dict, name: str) -> dict:
    cfg = (pm.get("recipes") or {}).get(name)
    if not cfg:
        raise RecipeError(
            f"unknown recipe '{name}'. Known: {', '.join(sorted(pm.get('recipes', {})))}",
            kind="usage_error",
        )
    return cfg


def _resolve_url(cfg: dict, pm: dict, url: Optional[str]) -> str:
    target = (url or "").strip() or cfg.get("url")
    if not target:
        raise RecipeError(
            "this recipe needs --url (a page on one of this package's allow-listed hosts)", kind="usage_error",
        )
    return require_site_url(target, pm.get("hosts", []))


def _by_priority(nodes: list[dict], prefixes: list[str], roles: list[str]) -> list[dict]:
    """Nodes matching the FIRST prefix (then the first role) that matches anything.

    Priority order is what a person editing paths.json expects:
    ``["heading", "link"]`` reads as "the heading, otherwise the link".
    """
    for p in prefixes or []:
        if not p:
            continue
        hits = [n for n in nodes if (n.get("name") or "").lower().startswith(p.lower())]
        if hits:
            return hits
    for r in roles or []:
        if not r:
            continue
        hits = [n for n in nodes if (n.get("role") or "").lower() == r.lower()]
        if hits:
            return hits
    return []


def _select_rows(entries: list[dict], rows_cfg: dict) -> list[dict]:
    rows_cfg = rows_cfg or {}
    prefixes = rows_cfg.get("prefix") or []
    roles = rows_cfg.get("role") or []
    if not prefixes and not roles:
        return [e for e in entries if e.get("is_dir")] or entries
    return _by_priority(entries, prefixes, roles)


def _gather(source: TreeSource, path: str, depth: int) -> list[dict]:
    """The node at ``path`` plus its descendants down to ``depth`` levels."""
    nodes: list[dict] = []

    def visit(p: str, entry: Optional[dict], level: int) -> None:
        node = {
            "path": p,
            "name": (entry or {}).get("name") or p.rsplit("/", 1)[-1],
            "role": (entry or {}).get("role", ""),
            "label": (entry or {}).get("label", ""),
            "text": text_of(source, p),
        }
        nodes.append(node)
        if level >= depth:
            return
        try:
            kids = children(source, p)
        except TreeError:
            return
        for kid in kids:
            visit(kid["path"], kid, level + 1)

    visit(path, None, 0)
    return nodes


def _extract_fields(fields_cfg: dict, nodes: list[dict]) -> tuple[dict, list[str]]:
    values: dict[str, Any] = {}
    missing: list[str] = []
    corpus = "\n".join(n["text"] for n in nodes if n.get("text"))
    corpus_with_labels = corpus + "\n" + "\n".join(n["label"] for n in nodes if n.get("label"))
    # nodes[0] is the row itself; matching by prefix looks at descendants first.
    descendants = nodes[1:] if len(nodes) > 1 else nodes

    for fname, spec in (fields_cfg or {}).items():
        spec = spec or {}
        prefixes = spec.get("prefix") or []
        roles = spec.get("role") or []
        regex = spec.get("regex")
        group = int(spec.get("group", 0) or 0)
        index = int(spec.get("index", 0) or 0)
        value: Optional[str] = None

        haystack: Optional[str] = None
        if prefixes or roles:
            cands = _by_priority(descendants, prefixes, roles)
            if 0 <= index < len(cands):
                node = cands[index]
                haystack = node["text"] or node["label"]
        else:
            haystack = corpus_with_labels

        if haystack is not None:
            if regex:
                try:
                    m = re.search(regex, haystack, re.IGNORECASE | re.MULTILINE)
                except re.error as e:
                    raise RecipeError(f"field '{fname}': bad regex {regex!r}: {e}")
                if m:
                    try:
                        value = m.group(group)
                    except IndexError:
                        value = m.group(0)
            else:
                value = haystack
        if value is not None:
            value = value.strip() or None
        values[fname] = value
        if value is None:
            missing.append(fname)
    return values, missing


def _prepare(source: TreeSource, pm: dict, name: str, url: Optional[str]) -> tuple[dict, str, str]:
    """Open the page (allow-listed) and run the auth check. Returns (cfg, landed_url, auth_state)."""
    cfg = _recipe_cfg(pm, name)
    target = _resolve_url(cfg, pm, url)
    opened = source.open(target)
    landed = ""
    if isinstance(opened, dict):
        landed = opened.get("url") or ""
    landed = landed or getattr(source, "current_url", "") or target
    state = check_auth(source, pm.get("auth") or {}, landed, bool(cfg.get("requires_auth")))
    return cfg, landed, state


def _find_root(source: TreeSource, cfg: dict) -> tuple[Optional[str], list[str]]:
    roots = cfg.get("root")
    if isinstance(roots, str):
        roots = [roots]
    tried: list[str] = []
    for r in roots or []:
        tried.append(r)
        try:
            children(source, r)
            return r, tried
        except TreeError:
            continue
    return None, tried


def run_recipe(
    source: TreeSource,
    pm: dict,
    name: str,
    *,
    url: Optional[str] = None,
    match: Optional[str] = None,
    max_rows: int = 50,
    path_map_source: str = "",
) -> dict:
    """Run one recipe and return the result dict (always JSON-serialisable)."""
    cfg, landed, auth_state = _prepare(source, pm, name, url)

    if cfg.get("requires_match") and not (match or "").strip():
        raise RecipeError(
            f"recipe '{name}' needs --match <text> (an address, a name, an id…) to pick the item to report on",
            kind="usage_error",
        )

    root, tried = _find_root(source, cfg)
    if root is None:
        raise RecipeError(
            f"none of the configured root paths {tried} exist on {landed}. The path map for "
            f"'{name}' does not fit this page (unverified maps are expected to need this fix once).",
            kind="path_map_error",
            hint=f"Run `cli-anything-{SITE} recipe {name} --discover --json` to see the real tree, "
                 f"then edit 'root' for '{name}' in your paths.json copy (`paths where`).",
        )

    warnings: list[str] = []
    result: dict[str, Any] = {
        "site": SITE,
        "harness_version": __version__,
        "recipe": name,
        "kind": cfg.get("kind"),
        "requested_url": url or cfg.get("url"),
        "url": landed,
        "fetched_at": _now(),
        "auth_state": auth_state,
        "root": root,
        "path_map": {"source": path_map_source, "verified": bool(cfg.get("verified", False))},
    }
    depth = int(cfg.get("depth", 1) or 0)

    if cfg.get("kind") == "record":
        nodes = _gather(source, root, max(depth, 1))
        record, missing = _extract_fields(cfg.get("fields") or {}, nodes)
        record["_path"] = root
        if missing:
            warnings.append(f"fields not found: {', '.join(missing)}")
        result.update({"record": record, "warnings": warnings})
        return result

    entries = children(source, root)
    selected = _select_rows(entries, cfg.get("rows") or {})
    truncated = len(selected) > max_rows
    selected = selected[:max_rows]

    rows: list[dict] = []
    missing_counts: dict[str, int] = {}
    for entry in selected:
        nodes = _gather(source, entry["path"], depth)
        values, missing = _extract_fields(cfg.get("fields") or {}, nodes)
        for m in missing:
            missing_counts[m] = missing_counts.get(m, 0) + 1
        values["_path"] = entry["path"]
        rows.append(values)

    if match:
        needle = match.lower()
        rows = [r for r in rows if any(isinstance(v, str) and needle in v.lower() for k, v in r.items() if k != "_path")]
        result["match"] = match

    for fname, n in missing_counts.items():
        warnings.append(f"field '{fname}' not found in {n} of {len(selected)} rows")
    if truncated:
        warnings.append(f"more than {max_rows} rows on the page; showing the first {max_rows} (raise --max-rows)")
    if entries and not selected:
        warnings.append(
            f"root {root} has {len(entries)} children but none matched rows selector "
            f"{cfg.get('rows')}; unmatched: {[e['name'] for e in entries][:20]}. "
            f"Run --discover and fix 'rows' if this page really has rows."
        )

    result.update({
        "count": len(rows),
        "empty": len(rows) == 0,
        "rows": rows,
        "warnings": warnings,
    })
    return result


def discover(
    source: TreeSource,
    pm: dict,
    name: str,
    *,
    url: Optional[str] = None,
    depth: int = 3,
    with_text: bool = False,
    override_path: str = "",
) -> dict:
    """Dump the live tree for a recipe so the path map can be corrected by hand.

    Auth is *reported*, not enforced, so a wrong marker list can be fixed too.
    """
    cfg = _recipe_cfg(pm, name)
    target = _resolve_url(cfg, pm, url)
    opened = source.open(target)
    landed = (opened.get("url") if isinstance(opened, dict) else "") or getattr(source, "current_url", "") or target

    auth_report: dict[str, Any]
    try:
        auth_report = {"state": check_auth(source, pm.get("auth") or {}, landed, True), "error": None}
    except Exception as e:  # AuthError — reported, not raised
        auth_report = {"state": getattr(e, "state", "unknown"), "error": str(e)}

    root, tried = _find_root(source, cfg)
    start = root or "/"
    budget = [MAX_DISCOVER_NODES]

    def dump(path: str, entry: Optional[dict], level: int) -> dict:
        node: dict[str, Any] = {
            "path": path,
            "name": (entry or {}).get("name") or path,
            "role": (entry or {}).get("role", ""),
        }
        if entry and entry.get("label"):
            node["label"] = entry["label"]
        if with_text:
            node["text"] = text_of(source, path)
        if level >= depth or budget[0] <= 0:
            return node
        try:
            kids = children(source, path)
        except TreeError as e:
            node["error"] = str(e)
            return node
        node["children"] = []
        for kid in kids:
            if budget[0] <= 0:
                node["truncated"] = True
                break
            budget[0] -= 1
            node["children"].append(dump(kid["path"], kid, level + 1))
        return node

    tree = dump(start, None, 0)
    return {
        "site": SITE,
        "recipe": name,
        "url": landed,
        "fetched_at": _now(),
        "auth": auth_report,
        "root_configured": cfg.get("root"),
        "root_found": root,
        "roots_tried": tried,
        "rows_selector": cfg.get("rows"),
        "fields": cfg.get("fields"),
        "depth": depth,
        "node_budget_left": budget[0],
        "tree": tree,
        "how_to_fix": (
            f"Copy the packaged map with `cli-anything-{SITE} paths init` (writes {override_path or '~/.config/cli-anything/' + SITE + '-paths.json'}), "
            f"then set recipes.{name}.root to the path that holds the rows, rows.prefix to the child-name prefix "
            f"you see here, and each field's prefix/regex to what the children actually contain. "
            f"Set verified:true only after the numbers match the page."
        ),
    }
