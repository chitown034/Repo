"""``brain doctor`` -- fail loudly when the catalogue and the tree disagree.

Checks, each one a hard failure (exit 1):

1. INDEX.md and brain/index.json exist and are byte-identical to a fresh
   rebuild of the tree (so nothing was added, removed or edited unindexed);
2. every path CLAUDE.md routes to exists (backticked repo paths, plus the
   project names listed in the projects row);
3. every line of INDEX.md points at a file that exists.
"""

from __future__ import annotations

import re
from pathlib import Path

from . import indexer


def routed_paths(root: Path) -> list[str]:
    p = root / "CLAUDE.md"
    if not p.is_file():
        return []
    text = p.read_text(encoding="utf-8")
    out: list[str] = []
    for raw in re.findall(r"`([^`\s]+)`", text):
        if "<" in raw:
            base = raw[: raw.index("<")]
            if "/" in base:
                out.append(base)
            # projects/<name>.md — the names are listed after the dash in that cell
            if raw.startswith("projects/"):
                m = re.search(r"`projects/<name>\.md`\s*[—-]\s*([a-z0-9, -]+)", text)
                if m:
                    out += [f"projects/{n.strip()}.md" for n in m.group(1).split(",") if n.strip()]
            continue
        if raw.endswith(".md") or ("/" in raw and not raw.startswith(("http", "~"))):
            out.append(raw)
    seen, uniq = set(), []
    for x in out:
        if x not in seen:
            seen.add(x)
            uniq.append(x)
    return uniq


def index_lines(root: Path) -> list[str]:
    p = root / indexer.INDEX_MD
    if not p.is_file():
        return []
    return re.findall(r"^- `([^`]+)`", p.read_text(encoding="utf-8"), re.M)


def run(root: Path | None = None) -> tuple[bool, list[str]]:
    root = Path(root) if root else indexer.repo_root()
    report: list[str] = []
    ok = True
    fresh = indexer.build(root)

    md, js = root / indexer.INDEX_MD, root / indexer.INDEX_JSON
    want_md, want_js = indexer.render_index_md(fresh), indexer.render_index_json(fresh)
    if not md.is_file() or not js.is_file():
        ok = False
        report.append("FAIL index: INDEX.md or brain/index.json is missing — run `bin/brain reindex`")
    else:
        have_md = md.read_text(encoding="utf-8")
        stale_md = have_md != want_md
        stale_js = js.read_text(encoding="utf-8") != want_js
        if stale_md or stale_js:
            ok = False
            listed = set(re.findall(r"^- `([^`]+)`", have_md, re.M))
            now = {f["path"] for f in fresh["files"]}
            detail = []
            if now - listed:
                detail.append("not in INDEX.md: " + ", ".join(sorted(now - listed)[:8]))
            if listed - now:
                detail.append("in INDEX.md but not indexable: " + ", ".join(sorted(listed - now)[:8]))
            if not detail:
                detail.append("a file's content, title or description changed since the last reindex")
            which = " and ".join(n for n, s in (("INDEX.md", stale_md), ("brain/index.json", stale_js)) if s)
            report.append(f"FAIL index: {which} stale vs the tree — " + "; ".join(detail)
                          + " — run `bin/brain reindex`")
        else:
            report.append(f"ok   index: INDEX.md + brain/index.json match the tree ({fresh['files_indexed']} files, "
                          f"{fresh['sections_indexed']} sections)")

    missing = [p for p in routed_paths(root) if not (root / p).exists()]
    if missing:
        ok = False
        report.append("FAIL router: CLAUDE.md routes to missing paths: " + ", ".join(missing))
    else:
        report.append(f"ok   router: all {len(routed_paths(root))} paths CLAUDE.md names exist")

    dangling = [p for p in index_lines(root) if not (root / p).is_file()]
    if dangling:
        ok = False
        report.append("FAIL links: INDEX.md lines point at missing files: " + ", ".join(dangling))
    else:
        report.append(f"ok   links: all {len(index_lines(root))} INDEX.md lines point at real files")

    report.append("doctor: " + ("PASS" if ok else "FAIL"))
    return ok, report
