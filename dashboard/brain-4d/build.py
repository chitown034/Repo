#!/usr/bin/env python3
"""Build dashboard/brain-4d.html from the brain itself: `python3 dashboard/brain-4d/build.py`.
Embeds `bin/brain graph` and the last `bin/brain loop` run into template.html. Rerun after reindex."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from brain import graph, loop  # noqa: E402

g = graph.build(ROOT)
last = loop.last_run(ROOT) or {"bench_correct": 0, "bench_total": 0, "org_covered": 0, "org_total": 0, "jarvis": "unverified"}
tpl = (ROOT / "dashboard/brain-4d/template.html").read_text(encoding="utf-8")
out = tpl.replace("/*DATA*/null", json.dumps(g, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"), 1)
out = out.replace("/*LOOP*/null", json.dumps({k: last.get(k) for k in ("bench_correct", "bench_total", "org_covered", "org_total", "jarvis", "ts")}), 1)
(ROOT / "dashboard/brain-4d.html").write_text(out, encoding="utf-8")
print(f"wrote dashboard/brain-4d.html: {len(g['nodes'])} nodes, {len(g['links'])} links, {len(out):,} bytes")
