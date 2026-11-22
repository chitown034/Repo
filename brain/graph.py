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

from . import indexer, toolkit
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
    ("store:drive", "Google Drive", "SECOND BRAIN/: the 13 SB Docs (weekly rewrite) + Steven's own folders; read-only elsewhere", ["references/google-drive.md", "references/drive-second-brain-notes.md", "integrations/google-drive-brain.md"]),
    ("store:jarvis", "Jarvis", "On-device index + voice (Mac)", ["integrations/jarvis/README.md", "vector-index/README.md"]),
    ("store:laya", "Laya", "Zero-token first hop that routes requests", ["integrations/laya/README.md", "CLAUDE.md"]),
    ("store:vault", "Obsidian vault", "Visual layer, Jarvis's source", ["OPTIMIZATION.md", "MAC-INSTALL.md"]),
    ("store:graphify", "Graphify", "Knowledge graph build", ["knowledge-graph/README.md"]),
    ("store:ruflo", "Ruflo", "Research and memory bench", ["wiki/ai-team/mentors-and-benches.md"]),
    ("store:omniroute", "OmniRoute", "Failover when Claude runs out", ["integrations/omniroute/README.md", "integrations/omniroute-failover/README.md"]),
    ("store:deck", "Command Deck", "The live dashboard", ["projects/command-deck.md", "wiki/dashboard-ops/index.md"]),
    ("store:notebooklm", "NotebookLM mirror", "The brain as 13 Google Docs in Drive/SECOND BRAIN, rewritten weekly; redundant copy + source-grounded Q&A", ["integrations/notebooklm/README.md", "references/index.md"]),
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
    from . import links as links_mod
    store_url = links_mod.for_store(root)
    for sid, label, what, attach in STORES:
        nodes.append({"id": sid, "t": label, "d": what, "g": "store", "gl": "Live stores", "lv": 0, "s": 0, "a": None, "z": None, "u": store_url.get(sid)})
        for p in attach:
            if p in ids:
                links.append({"s": sid, "t": p, "w": 1.0, "k": "store"})
    for sid, *_ in STORES[1:]:
        links.append({"s": "store:vanessa", "t": sid, "w": 1.0, "k": "store"})
    # the toolkit: skills, plugins, connectors, routines and Mac tasks as their own lobes (2026-10-20)
    home = {"skill": "wiki/ai-team/toolkit.md", "plugin": "integrations/mods/RECOMMENDATIONS.md",
            "connector": "integrations/CONNECTIONS.md", "routine": "always-on/README.md", "mactask": "wiki/dashboard-ops/task-catalog.md",
            "mcp": "integrations/MCP-SERVERS.md", "api": "integrations/APIS.md"}
    labels = {"skill": "Skills", "plugin": "Claude mods", "connector": "Connectors", "routine": "Cloud routines", "mactask": "Mac tasks",
              "mcp": "MCP servers", "api": "APIs"}
    for it in toolkit.inventory(root)["items"]:
        nid = f"{it['kind']}:{it['name']}"
        if nid in ids:
            continue
        ids.add(nid)
        d = it["desc"]
        if it["kind"] in ("connector", "mcp", "api"):
            d = f"[{it['state']}] {d}"
        nodes.append({"id": nid, "t": it["name"][:90], "d": (f"{it['seat']} · " + d)[:180], "g": it["kind"], "gl": labels[it["kind"]],
                      "lv": 1, "s": 0, "a": None, "z": None, "seat": it["seat"], "state": it.get("state")})
        tgt = home[it["kind"]]
        if tgt in ids:
            links.append({"s": nid, "t": tgt, "w": 0.6, "k": "tool"})
        if it["seat"] == "Vanessa":
            links.append({"s": "store:vanessa", "t": nid, "w": 0.4, "k": "tool"})
    # standing cross-functional pods (2026-10-22): one node per pod, linked to the rules page and to Vanessa
    from . import route as route_mod
    for name, words, members, delivers in route_mod.load_rules(root).get("pods", []):
        nid = "pod:" + name
        if nid in ids:
            continue
        ids.add(nid)
        nodes.append({"id": nid, "t": name, "d": (", ".join(members) + " · " + delivers)[:180], "g": "pod", "gl": "Pods",
                      "lv": 1, "s": 0, "a": None, "z": None, "seat": ", ".join(members)})
        if "wiki/ai-team/cross-functional.md" in ids:
            links.append({"s": nid, "t": "wiki/ai-team/cross-functional.md", "w": 0.8, "k": "pod"})
        links.append({"s": "store:vanessa", "t": nid, "w": 0.6, "k": "pod"})
    # The Agency squads (2026-11-22, "update brain and ai org charts"): one node per department squad under its executive,
    # linked to the squad page and to Vanessa, so the 6D org chart matches the deck's aiTeamOrg.agency.
    try:
        from . import agency as agency_mod
        squads = agency_mod.summary(root).get("squads", [])
    except Exception:  # noqa: BLE001 — a broken roster must not take the whole graph down
        squads = []
    for sq in squads:
        nid = "squad:" + sq["department"]
        if nid in ids or not sq.get("active"):
            continue
        ids.add(nid)
        nodes.append({"id": nid, "t": f"{sq['department']} squad ({sq['active']} agents, lead {sq['lead']})", "g": "squad", "gl": "Agency squads",
                      "d": (", ".join(sq.get("members", [])))[:180], "lv": 1, "s": 0, "a": None, "z": None, "seat": sq["lead"]})
        if "wiki/ai-team/agency-teams.md" in ids:
            links.append({"s": nid, "t": "wiki/ai-team/agency-teams.md", "w": 0.8, "k": "squad"})
        links.append({"s": "store:vanessa", "t": nid, "w": 0.6, "k": "squad"})
    # Every AI agent (2026-11-22, "ai agents update on 6d brain too"): one node per agent under its seat -- the 185 in the
    # agent OS manifest by their Laya lane, the Agency's active agents under their department squad.
    def seat_node(name: str) -> str:
        sid = "seat:" + name
        if sid not in ids:
            ids.add(sid)
            nodes.append({"id": sid, "t": name, "d": f"{name}'s seat: the agents that report to {name}", "g": "seat", "gl": "Seats",
                          "lv": 1, "s": 0, "a": None, "z": None, "seat": name})
            links.append({"s": "store:vanessa", "t": sid, "w": 0.7, "k": "seat"})
        return sid
    try:
        manifest = json.loads((root / "integrations/agent-os/agents.json").read_text(encoding="utf-8")).get("agents", [])
    except (OSError, ValueError, AttributeError):
        manifest = []
    for a in manifest if isinstance(manifest, list) else []:
        slug, lane = str(a.get("slug") or ""), str((a.get("laya") or {}).get("lane") or "Vanessa")
        nid = "agent:" + slug
        if not slug or nid in ids:
            continue
        ids.add(nid)
        nodes.append({"id": nid, "t": slug[:90], "d": f"{a.get('model', '')} · tier {a.get('tier', '')} · {a.get('role', '')}"[:180], "g": "agent",
                      "gl": "AI agents", "lv": 2, "s": 0, "a": None, "z": None, "seat": lane})
        links.append({"s": seat_node(lane), "t": nid, "w": 0.5, "k": "agent"})
    try:
        roster = json.loads((root / "integrations/agency-agents/roster.json").read_text(encoding="utf-8")).get("agents", [])
    except (OSError, ValueError, AttributeError):
        roster = []
    for a in roster if isinstance(roster, list) else []:
        if a.get("status") != "active" or not a.get("installAs"):
            continue
        nid = "agent:" + a["installAs"]
        if nid in ids:
            continue
        ids.add(nid)
        nodes.append({"id": nid, "t": str(a.get("name", a["installAs"]))[:90], "d": f"Opus 5.5 · {a.get('department', '')} squad · {a.get('description', '')}"[:180],
                      "g": "agent", "gl": "AI agents", "lv": 2, "s": 0, "a": None, "z": None, "seat": a.get("lead", "")})
        squad = "squad:" + str(a.get("department", ""))
        links.append({"s": squad if squad in ids else seat_node(str(a.get("lead") or "Vanessa")), "t": nid, "w": 0.5, "k": "agent"})
    for sq in squads:
        if "squad:" + sq["department"] in ids:
            links.append({"s": seat_node(sq["lead"]), "t": "squad:" + sq["department"], "w": 0.7, "k": "squad"})
    # Harness, graph and loop engineering (2026-11-22): three nodes carrying this week's scores from brain/weekly.json.
    try:
        from . import weekly as weekly_mod
        wk = weekly_mod.load(root) or {}
    except Exception:  # noqa: BLE001
        wk = {}
    for lens in wk.get("lenses", []) if isinstance(wk, dict) and isinstance(wk.get("lenses"), list) else []:
        if not isinstance(lens, dict) or not lens.get("key"):
            continue
        nid = "eng:" + str(lens["key"])
        if nid in ids:
            continue
        ids.add(nid)
        props = [p.get("title", "") for p in lens.get("proposals", []) if isinstance(p, dict)][:2]
        nodes.append({"id": nid, "t": f"{lens.get('label')} — {lens.get('score')}/100", "g": "eng", "gl": "Engineering",
                      "d": (f"{lens.get('about', '')} · week of {wk.get('date', '')} · next: " + "; ".join(props))[:180], "lv": 1, "s": 0, "a": None, "z": None})
        links.append({"s": "store:vanessa", "t": nid, "w": 0.8, "k": "eng"})
        if "docs/reports/WEEKLY-IMPROVEMENTS.md" in ids:
            links.append({"s": nid, "t": "docs/reports/WEEKLY-IMPROVEMENTS.md", "w": 0.9, "k": "eng"})
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
