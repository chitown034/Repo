#!/usr/bin/env python3
"""Build dashboard/brain-4d.html (Brain 6D) from the brain itself: `python3 dashboard/brain-4d/build.py`.
Embeds `bin/brain graph`, the last `bin/brain loop` run, the seat lens table (wiki/ai-team/cross-functional.md,
'Lane keywords', third column), agents-per-seat (integrations/agent-os/agents.json, laya.lane) and the
A-Z encyclopedia (brain/index.json + backlinks from the graph links) into template.html. Rerun after reindex."""
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from brain import graph, loop  # noqa: E402


def seat_table(root):
    """Seat -> 'starts from' prefixes, in table order, from the Lane keywords table (3rd column)."""
    text = (root / "wiki/ai-team/cross-functional.md").read_text(encoding="utf-8")
    sec = text.split("## Lane keywords", 1)[1].split("\n## ", 1)[0]
    rows = []
    for line in sec.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if line.startswith("|") and len(cells) == 3 and cells[0] not in ("Seat",) and not set(cells[0]) <= set("-: "):
            rows.append((cells[0], re.findall(r"`([^`]+)`", cells[2])))
    return rows


def agents_per_seat(root):
    p = root / "integrations/agent-os/agents.json"
    counts = {}
    for a in json.loads(p.read_text(encoding="utf-8")).get("agents", []):
        lane = (a.get("laya") or {}).get("lane")
        if lane:
            counts[lane] = counts.get(lane, 0) + 1
    return counts


def encyclopedia(root, g):
    idx = json.loads((root / "brain/index.json").read_text(encoding="utf-8"))
    ids = {n["id"] for n in g["nodes"]}
    back = {}
    for l in g["links"]:
        if l["s"] in ids and l["t"] in ids and not l["s"].startswith("store:") and not l["t"].startswith("store:"):
            back.setdefault(l["t"], set()).add(l["s"])
            back.setdefault(l["s"], set()).add(l["t"])
    out = []
    for f in idx["files"]:
        if f["path"] not in ids:
            continue
        heads, seen = [], set()
        for lvl, h in f.get("headings", [])[1:]:
            if lvl <= 3 and h not in seen:
                seen.add(h)
                heads.append(h)
        out.append({"id": f["path"], "t": f.get("title") or f["path"], "d": f.get("description") or "",
                    "h": heads[:10], "b": sorted(back.get(f["path"], []))})
    out.sort(key=lambda e: (re.sub(r"[^a-z0-9]", "", e["t"].lower()) or "~", e["id"]))
    return out


g = graph.build(ROOT)
last = loop.last_run(ROOT) or {"bench_correct": 0, "bench_total": 0, "org_covered": 0, "org_total": 0, "jarvis": "unverified"}
counts = agents_per_seat(ROOT)
rows = seat_table(ROOT)
seats = [{"n": "Vanessa", "a": counts.get("Vanessa", 0), "s": []}] + [{"n": n, "a": counts.get(n, 0), "s": s} for n, s in rows if n != "Vanessa"]
enc = encyclopedia(ROOT, g)

def j(o):
    return json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

tpl = (ROOT / "dashboard/brain-4d/template.html").read_text(encoding="utf-8")
out = tpl.replace("/*DATA*/null", j(g), 1)
out = out.replace("/*LOOP*/null", json.dumps({k: last.get(k) for k in ("bench_correct", "bench_total", "org_covered", "org_total", "jarvis", "ts")}), 1)
out = out.replace("/*SEATS*/null", j(seats), 1).replace("/*ENC*/null", j(enc), 1)
out = out.replace("/*BUILD*/null", json.dumps(date.today().isoformat()), 1)
(ROOT / "dashboard/brain-4d.html").write_text(out, encoding="utf-8")
print(f"wrote dashboard/brain-4d.html: {len(g['nodes'])} nodes, {len(g['links'])} links, {len(seats)} seats, {len(enc)} encyclopedia entries, {len(out):,} bytes")
