"""``brain encyclopedia`` -- the living A-Z of the second brain, rebuilt from the index every loop run.

One entry per indexed page: title, one-line description, where it lives, its section headings, the pages that
link to it and the pages it links to (the same keyword links ``brain graph`` draws), and the newest date stamp.
Plain code, no model calls; only titles and descriptions already in INDEX.md leave the pages, so nothing new is exposed.
"""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

from . import graph, indexer

OUT = "docs/reports/ENCYCLOPEDIA.md"


def build(root: Path) -> str:
    g = graph.build(root)
    ix = indexer.load(root)
    heads = {f["path"]: [h[1] for h in f.get("headings", []) if h[0] == 2][:8] for f in ix["files"]}
    nodes = {n["id"]: n for n in g["nodes"] if not n["id"].startswith("store:")}
    out_l, in_l = defaultdict(set), defaultdict(set)
    for ln in g["links"]:
        if ln["s"] in nodes and ln["t"] in nodes:
            out_l[ln["s"]].add(ln["t"]); in_l[ln["t"]].add(ln["s"])
    letters = defaultdict(list)
    for pid, n in nodes.items():
        title = re.sub(r"^(Project|Wiki|Memory|Routine spec)\s*[—-]\s*", "", n["t"]).strip() or pid
        letters[(title[:1].upper() if title[:1].isalpha() else "#")].append((title.lower(), title, pid, n))
    lines = ["# Encyclopedia of the second brain", "",
             f"Generated {g['generated']} by `bin/brain encyclopedia` from `brain/index.json` — {len(nodes)} pages, "
             f"{sum(len(v) for v in out_l.values())} links. A living page: the weekly `bin/brain loop` rewrites it, "
             "so edit the source pages, never this file. Open a page with `bin/brain recall \"<title>\"`.", "",
             "Jump: " + " · ".join(f"[{c}](#{c.lower() if c != '#' else 'other'})" for c in sorted(letters)), ""]
    for c in sorted(letters):
        lines += [f"## {c if c != '#' else 'Other'}", ""]
        for _k, title, pid, n in sorted(letters[c]):
            stamp = n.get("z") or n.get("a") or "undated"
            lines.append(f"### {title}")
            lines.append(f"{n['d']}  ")
            lines.append(f"`{pid}` · {n['gl']} · newest date stamp {stamp}  ")
            if heads.get(pid):
                lines.append("Sections: " + "; ".join(heads[pid]) + "  ")
            if in_l[pid]:
                lines.append("Linked from: " + ", ".join(f"`{x}`" for x in sorted(in_l[pid])[:6]) + "  ")
            if out_l[pid]:
                lines.append("See also: " + ", ".join(f"`{x}`" for x in sorted(out_l[pid])[:6]))
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def write(root: Path) -> Path:
    p = root / OUT
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(build(root), encoding="utf-8")
    return p
