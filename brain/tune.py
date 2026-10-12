"""``brain tune`` -- the brain proposes its own improvements; a person approves them.

Reads the recall-log gaps and the gold-question misses, and for every asked keyword that is NOT in the index
vocabulary finds the nearest vocabulary terms (edit distance) and the pages they live in. The result is a
proposal file, ``brain/state/tune-proposals.json``, plus a short block in the loop report:

    "zoho" was asked 3x and never matched; nearest terms: "zoho-crm" (wiki/dashboard-ops/connections.md)
      -> add a synonym group in brain/synonyms.py, or write the word into that page

Nothing is edited automatically: ``synonyms.py`` and the wiki stay as they are until someone applies a proposal.
Plain code, standard library, no model calls. Keywords only -- the log never holds the sentence asked.
"""

from __future__ import annotations

import difflib
import json
from pathlib import Path

from . import indexer
from .loop import gaps

PROPOSALS = "brain/state/tune-proposals.json"
MAX_NEAREST = 3


def _vocab_pages(index: dict) -> dict[str, list[str]]:
    where: dict[str, list[str]] = {}
    for f in index["files"]:
        for t in set(f.get("keywords", [])) | set(f.get("title_terms", [])) | set(f.get("heading_terms", [])):
            where.setdefault(t, [])
            if len(where[t]) < 3:
                where[t].append(f["path"])
    return where


def proposals(root: Path) -> list[dict]:
    index = indexer.load(root)
    vocab = set(index.get("vocab", [])) or set(index.get("df", {}))
    where = _vocab_pages(index)
    out: list[dict] = []
    seen: set[str] = set()
    for g in gaps(root, limit=30):
        for kw in g["keywords"]:
            if kw in vocab or kw in seen or len(kw) < 3:
                continue
            seen.add(kw)
            near = difflib.get_close_matches(kw, list(vocab), n=MAX_NEAREST, cutoff=0.72)
            out.append({
                "asked": kw, "times": g["count"], "state": g["state"],
                "nearest": [{"term": n, "pages": where.get(n, [])[:2]} for n in near],
                "proposal": (f"add a synonym group {{'{kw}', '{near[0]}'}} to brain/synonyms.py" if near
                             else f"no close term in the brain: write a page or a memory line that uses '{kw}', or queue research"),
            })
    return out


def write(root: Path) -> Path:
    p = root / PROPOSALS
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps({"proposals": proposals(root)}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return p


def format_proposals(items: list[dict]) -> str:
    if not items:
        return "tune: no unmatched keywords in the recall log — nothing to propose"
    out = [f"tune: {len(items)} proposal(s), none applied (approve by editing brain/synonyms.py or the page):"]
    for it in items[:10]:
        near = ", ".join(f"\"{n['term']}\" ({', '.join(n['pages']) or 'no page'})" for n in it["nearest"]) or "none"
        out.append(f"  \"{it['asked']}\" asked {it['times']}x, {it['state']}; nearest: {near}")
        out.append(f"    -> {it['proposal']}")
    return "\n".join(out)
