#!/usr/bin/env python3
"""Carry nodes, links and colours that only exist on the live Brain 6D page into a fresh build.

    python3 dashboard/brain-4d/merge-live.py <saved live page> dashboard/brain-4d.html

Another session can publish its own nodes (e.g. the VANESSA 3.0 "vanessa:*" lobe, 2026-10-22) between our
rebuilds; a plain rebuild would drop them. This keeps the fresh build and adds back every live-only node, every
live link whose two ends exist after the merge, and any colour key the build lacks. Plain code, no model call.
"""
import json
import re
import sys


def grab(page: str, name: str):
    m = re.search(r"(?m)^const " + name + r" = (.*);\s*$", page)
    return (json.loads(m.group(1)), m) if m else (None, None)


def main(live_path: str, out_path: str) -> int:
    live, mine = open(live_path, encoding="utf-8").read(), open(out_path, encoding="utf-8").read()
    lg, _ = grab(live, "G")
    mg, mm = grab(mine, "G")
    if not lg or not mg:
        print("merge-live: could not find const G on one of the pages; nothing merged")
        return 1
    have = {n["id"] for n in mg["nodes"]}
    added = [n for n in lg["nodes"] if n["id"] not in have]
    mg["nodes"] += added
    have |= {n["id"] for n in added}
    seen = {(l["s"], l["t"]) for l in mg["links"]}
    links = [l for l in lg["links"] if l["s"] in have and l["t"] in have and (l["s"], l["t"]) not in seen]
    mg["links"] += links
    mine = mine[:mm.start(1)] + json.dumps(mg, ensure_ascii=False, separators=(",", ":")) + mine[mm.end(1):]
    hl = re.search(r"const HUE = \{([^}]*)\}", live)
    hm = re.search(r"const HUE = \{([^}]*)\}", mine)
    hues = 0
    if hl and hm:
        mine_keys = set(re.findall(r"(\w+):", hm.group(1)))
        extra = [kv for kv in re.findall(r'(\w+:"#[0-9a-fA-F]{3,8}")', hl.group(1)) if kv.split(":")[0] not in mine_keys]
        if extra:
            hues = len(extra)
            mine = mine[:hm.end(1)] + ", " + ", ".join(extra) + mine[hm.end(1):]
    open(out_path, "w", encoding="utf-8").write(mine)
    print(f"merge-live: +{len(added)} live-only nodes, +{len(links)} links, +{hues} colours -> {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]) if len(sys.argv) == 3 else 2)
