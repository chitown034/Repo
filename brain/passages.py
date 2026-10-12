"""``brain passages`` -- level 3 of the recall order, in plain code: passage retrieval inside big documents.

``recall`` returns one section of one file. A 500 KB findings table or a 60 KB runbook has sections too long or too many
for that to land on the sentence that answers. This module chunks every indexed file over BIG_BYTES into overlapping
windows of WINDOW lines, scores each window with the same stemmed keywords and idf the index uses (sparse vectors --
the "vector database" of the Company Brain Blueprint without a model, an embedding service or a server), and returns
the top passages with file and line numbers. ``brain ask`` escalates here when one section and a pack both come back
weak, before it says "queue research".

Rules that hold (CLAUDE.md, vector-index/README.md): ``wiki/clients/**`` and ``context/decisions.md`` are never chunked;
the chunk cache in brain/state/ is gitignored and rebuilt when a file's hash changes.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from . import indexer, recall as recall_mod, text

BIG_BYTES = 24_000
WINDOW = 40
STEP = 20
CACHE = "brain/state/passages.json"
NEVER = ("wiki/clients/", "context/decisions.md")


def _chunks(path: Path, rel: str):
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    for start in range(0, max(1, len(lines) - WINDOW + 1), STEP):
        body = lines[start:start + WINDOW]
        if sum(len(x) for x in body) < 80:
            continue
        toks = text.tokenize("\n".join(body))
        tf: dict[str, int] = {}
        for t in toks:
            tf[t] = tf.get(t, 0) + 1
        yield {"file": rel, "start": start + 1, "end": start + len(body), "ntok": len(toks), "tf": tf}


def build(root: Path, index: dict | None = None) -> dict:
    index = index if index is not None else indexer.load(root)
    cache_p = root / CACHE
    cache = {}
    if cache_p.is_file():
        try:
            cache = json.loads(cache_p.read_text(encoding="utf-8"))
        except ValueError:
            cache = {}
    out, changed = {}, False
    for f in index["files"]:
        rel = f["path"]
        if f.get("bytes", 0) < BIG_BYTES or rel.startswith(NEVER) or rel in NEVER:
            continue
        h = f.get("hash")
        if rel in cache and cache[rel].get("hash") == h:
            out[rel] = cache[rel]; continue
        out[rel] = {"hash": h, "chunks": list(_chunks(root / rel, rel))}; changed = True
    if changed or set(out) != set(cache):
        cache_p.parent.mkdir(parents=True, exist_ok=True)
        cache_p.write_text(json.dumps(out), encoding="utf-8")
    return out


def search(root: Path, question: str, top: int = 3, index: dict | None = None) -> list[dict]:
    index = index if index is not None else indexer.load(root)
    q = recall_mod.Query(question, index)
    if not q.groups:
        return []
    store = build(root, index)
    avg = max(1.0, sum(c["ntok"] for v in store.values() for c in v["chunks"]) / max(1, sum(len(v["chunks"]) for v in store.values())))
    scored = []
    for rel, v in store.items():
        for c in v["chunks"]:
            s, hit = 0.0, 0
            norm = 1.2 * (1 - 0.75 + 0.75 * c["ntok"] / avg)
            for g in q.groups:
                best = 0.0
                for term, w, _tid, idf in g["variants"]:
                    tf = c["tf"].get(term, 0)
                    if tf:
                        best = max(best, w * idf * (tf * 2.2 / (tf + norm)))
                if best:
                    s += best; hit += 1
            if hit:
                cov = hit / len(q.groups)
                scored.append((s * (0.3 + 0.7 * cov), cov, c))
    scored.sort(key=lambda x: -x[0])
    out = []
    for s, cov, c in scored[:top]:
        lines = (root / c["file"]).read_text(encoding="utf-8", errors="replace").splitlines()[c["start"] - 1:c["end"]]
        out.append({"file": c["file"], "lines": f"{c['start']}-{c['end']}", "score": round(s, 2), "coverage": round(cov, 2),
                    "text": "\n".join(x for x in lines if x.strip())[:1800]})
    return out


def format_passages(ps: list[dict]) -> str:
    if not ps:
        return "no passage in the big documents matches (wiki/clients and decisions.md are never searched here)"
    return "\n\n".join(f"[{p['file']} lines {p['lines']} · coverage {p['coverage']}]\n{p['text']}" for p in ps)
