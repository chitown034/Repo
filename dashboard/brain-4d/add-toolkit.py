#!/usr/bin/env python3
"""Add the toolkit lobes (skills, plugins, connectors, routines, Mac tasks) to an already-built brain page.

The 6D page (Ask the brain, Encyclopedia, lenses) is built by the other branch's build.py; this branch's
`bin/brain toolkit` knows the tools. This script bridges them without a branch merge:

    python3 dashboard/brain-4d/add-toolkit.py <built-page.html> <out.html>

It parses the page's `const G = {...};` line, appends the toolkit nodes and links from `brain.graph.build`
(only ids the page does not already have), adds the five colours to `const HUE`, and writes the result.
Everything else on the page is left byte-for-byte as it was."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from brain import graph  # noqa: E402

KINDS = ("skill", "plugin", "connector", "routine", "mactask")
HUES = 'skill:"#ffe08a", plugin:"#c9f29b", connector:"#8ef0ff", routine:"#ffb3c7", mactask:"#d6c7ff", other:"#8f97ad" };'


def main(src: str, out: str) -> int:
    page = Path(src).read_text(encoding="utf-8")
    # the artifact service's read wrapper: a one-line head before the page, and </body></html> after it
    first, _, rest = page.partition("\n")
    if first.lower().startswith("<!doctype html><html><head><meta charset=utf8>"):
        page = rest
    if page.endswith("\n</body></html>") and page.count("</html>") == 1:
        page = page[: -len("\n</body></html>")]
    m = re.search(r"^const G = (\{.*?\});$", page, re.M)
    if not m:
        print("no `const G = {...};` line found", file=sys.stderr)
        return 1
    G = json.loads(m.group(1))
    have = {n["id"] for n in G["nodes"]}
    mine = graph.build(ROOT)
    added = 0
    for n in mine["nodes"]:
        if n["g"] in KINDS and n["id"] not in have:
            G["nodes"].append(n)
            have.add(n["id"])
            added += 1
    for l in mine["links"]:
        if l.get("k") == "tool" and l["s"] in have and l["t"] in have:
            G["links"].append(l)
    text = json.dumps(G, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    page = page[: m.start(1)] + text + page[m.end(1):]
    if 'mactask:"#d6c7ff"' not in page:
        page = page.replace('other:"#8f97ad" };', HUES, 1)
    Path(out).write_text(page, encoding="utf-8")
    print(f"wrote {out}: +{added} toolkit nodes, {len(G['nodes'])} nodes, {len(G['links'])} links, {len(page):,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
