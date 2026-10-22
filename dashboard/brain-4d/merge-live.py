#!/usr/bin/env python3
"""Carry nodes, links and colours that only exist on the live Brain 6D page into a fresh build.

    python3 dashboard/brain-4d/merge-live.py <saved live page> dashboard/brain-4d.html [--all]

Another session can publish its own nodes (e.g. the VANESSA 3.0 "vanessa:*" lobe, 2026-10-22) between our
rebuilds; a plain rebuild would drop them. This keeps the fresh build and adds back every live-only node, every
live link whose two ends exist after the merge, and any colour key the build lacks. Plain code, no model call.
--all also carries live-only nodes in the build's own families: use it when another session has published pages,
skills or routines from a branch this checkout has not merged yet (2026-10-22: the Attraction Command Center lobe),
so a rebuild here does not erase their work from the live page.
"""
import json
import re
import sys

# Node families the build itself produces. A live-only node in one of these was removed or renamed on purpose
# by the build (a deleted page, a retired routine), so it must stay gone; only foreign families (another
# session's lobe, e.g. "vanessa:") are carried over.
OWN_PREFIXES = ("store:", "skill:", "plugin:", "connector:", "routine:", "mactask:", "pod:")


def foreign(node_id: str) -> bool:
    if "/" in node_id or node_id.endswith(".md") or node_id.startswith(OWN_PREFIXES):
        return False
    return ":" in node_id


def grab(page: str, name: str):
    m = re.search(r"(?m)^const " + name + r" = (.*);\s*$", page)
    return (json.loads(m.group(1)), m) if m else (None, None)


def main(live_path: str, out_path: str, keep_all: bool = False) -> int:
    live, mine = open(live_path, encoding="utf-8").read(), open(out_path, encoding="utf-8").read()
    lg, _ = grab(live, "G")
    mg, mm = grab(mine, "G")
    if not lg or not mg:
        print("merge-live: could not find const G on one of the pages; nothing merged")
        return 1
    have = {n["id"] for n in mg["nodes"]}
    added = [n for n in lg["nodes"] if n["id"] not in have and (keep_all or foreign(n["id"]))]
    mg["nodes"] += added
    have |= {n["id"] for n in added}
    seen = {(l["s"], l["t"]) for l in mg["links"]}
    links = [l for l in lg["links"] if l["s"] in have and l["t"] in have and (l["s"], l["t"]) not in seen]
    mg["links"] += links
    mine = mine[:mm.start(1)] + json.dumps(mg, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + mine[mm.end(1):]
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
    args = [a for a in sys.argv[1:] if a != "--all"]
    sys.exit(main(args[0], args[1], "--all" in sys.argv[1:]) if len(args) == 2 else 2)
