"""``brain graph`` -- the whole brain as nodes, links and dates, for any visualiser.

Nodes are indexed files (with their group, recall level, size and the first/newest date
stamp found in them) plus the live stores the brain points at. Links come from shared
distinctive keywords (the same measure ``brain related`` uses), plus fixed store links.
No content leaves: only titles, one-line descriptions and paths, all already in INDEX.md.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

from . import indexer
from .loop import DATE_RE

GROUPS = [  # (prefix, group id, label, recall level)
    ("CLAUDE.md", "router", "Router", 1), ("AGENTS.md", "router", "Router", 1), ("INDEX.md", "router", "Router", 1),
    ("README.md", "router", "Router", 1), ("recall-cache.md", "router", "Router", 1), ("OPTIMIZATION.md", "router", "Router", 1),
    ("context/", "context", "Who & why", 2), ("memory", "memory", "Memory", 2), ("projects/", "projects", "Projects", 2),
    ("wiki/mortgage-programs/", "mortgage", "Mortgage wiki", 2), ("wiki/real-estate-playbooks/", "realestate", "Real-estate wiki", 2),
    ("wiki/ai-team/", "aiteam", "AI team", 2), ("wiki/", "ops", "Dashboard ops", 2),
    ("vector-index/", "vector", "Vector search", 3), ("knowledge-graph/", "graph", "Knowledge graph", 4),
    ("always-on/", "alwayson", "Always-on", 5), ("routines/", "alwayson", "Always-on", 5),
    ("references/", "sources", "Sources", 2), ("integrations/", "integrations", "Integrations", 2),
    ("docs/", "loop", "Loop & findings", 5), ("brain/", "router", "Router", 1),
]
STORES = [  # id, label, what, files it attaches to (prefixes)
    ("store:vanessa", "Vanessa", "Chief of Staff — every recall answers through her", ["CLAUDE.md", "AGENTS.md", "projects/ai-team.md"]),
    ("store:notion", "Notion Second Brain", "The record (database)", ["references/index.md", "always-on/README.md"]),
    ("store:drive", "Google Drive", "Read-only mirror of the Notion rows", ["references/google-drive.md", "references/drive-second-brain-notes.md", "integrations/google-drive-brain.md"]),
    ("store:jarvis", "Jarvis", "On-device index + voice (Mac)", ["integrations/jarvis/README.md", "vector-index/README.md"]),
    ("store:laya", "Laya", "Zero-token first hop that routes requests", ["integrations/laya/README.md", "CLAUDE.md"]),
    ("store:vault", "Obsidian vault", "Visual layer, Jarvis's source", ["OPTIMIZATION.md", "MAC-INSTALL.md"]),
    ("store:graphify", "Graphify", "Knowledge graph build", ["knowledge-graph/README.md"]),
    ("store:ruflo", "Ruflo", "Research and memory bench", ["wiki/ai-team/mentors-and-benches.md"]),
    ("store:omniroute", "OmniRoute", "Failover when Claude runs out", ["integrations/omniroute/README.md", "integrations/omniroute-failover/README.md"]),
    ("store:deck", "Command Deck", "The live dashboard", ["projects/command-deck.md", "wiki/dashboard-ops/index.md"]),
]


def group_of(path: str) -> tuple[str, str, int]:
    for prefix, gid, label, lvl in GROUPS:
        if path.startswith(prefix):
            return gid, label, lvl
    return "other", "Other", 2


def _dates(text: str, today: date) -> list[str]:
    out = []
    for y, m, d in DATE_RE.findall(text):
        try:
            dt = date(int(y), int(m), int(d))
        except ValueError:
            continue
        if date(2026, 1, 1) <= dt <= today:
            out.append(dt.isoformat())
    return out


def build(root: Path, links_per_node: int = 3, today: date | None = None) -> dict:
    today = today or date.today()
    ix = indexer.load(root)
    files = ix["files"]
    df: dict[str, int] = {}
    for f in files:
        for k in f.get("keywords") or []:
            df[k] = df.get(k, 0) + 1
    nodes, ids = [], set()
    for f in files:
        p = f["path"]
        try:
            ds = _dates((root / p).read_text(encoding="utf-8"), today)
        except OSError:
            ds = []
        gid, glabel, lvl = group_of(p)
        nodes.append({"id": p, "t": (f.get("title") or p)[:90], "d": (f.get("description") or "")[:180], "g": gid,
                      "gl": glabel, "lv": lvl, "s": len(f.get("sections") or []),
                      "a": min(ds) if ds else None, "z": max(ds) if ds else None})
        ids.add(p)
    links, seen = [], set()
    kw = {f["path"]: set(f.get("keywords") or []) for f in files}
    for f in files:
        a = f["path"]
        scored = []
        for b, kb in kw.items():
            if b == a:
                continue
            common = kw[a] & kb
            if common:
                scored.append((sum(1.0 / df[k] for k in common), b))
        scored.sort(key=lambda x: (-x[0], x[1]))
        for w, b in scored[:links_per_node]:
            key = tuple(sorted((a, b)))
            if key not in seen and w > 0.15:
                seen.add(key)
                links.append({"s": a, "t": b, "w": round(w, 2)})
    for sid, label, what, attach in STORES:
        nodes.append({"id": sid, "t": label, "d": what, "g": "store", "gl": "Live stores", "lv": 0, "s": 0, "a": None, "z": None})
        for p in attach:
            if p in ids:
                links.append({"s": sid, "t": p, "w": 1.0, "k": "store"})
    for sid, *_ in STORES[1:]:
        links.append({"s": "store:vanessa", "t": sid, "w": 1.0, "k": "store"})
    return {"generated": today.isoformat(), "files": len(files),
            "sections": sum(n["s"] for n in nodes), "nodes": nodes, "links": links}


def main(root: Path, out: str | None = None) -> int:
    g = build(root)
    text = json.dumps(g, ensure_ascii=False, separators=(",", ":"))
    if out:
        Path(out).write_text(text, encoding="utf-8")
        print(f"wrote {out}: {len(g['nodes'])} nodes, {len(g['links'])} links")
    else:
        print(text)
    return 0
