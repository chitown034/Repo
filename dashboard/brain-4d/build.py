#!/usr/bin/env python3
"""Build dashboard/brain-4d.html (Brain 6D) from the brain itself: `python3 dashboard/brain-4d/build.py`.
Embeds `bin/brain graph`, the last `bin/brain loop` run, the seat lens table (wiki/ai-team/cross-functional.md,
'Lane keywords', third column), agents-per-seat (integrations/agent-os/agents.json, laya.lane) and the
A-Z encyclopedia (brain/index.json + backlinks from the graph links) and the 'Ask the brain' term index (brain/index.json
stemmed fields + df, synonyms, priors; lane keyword phrases from the same table's 2nd column) into template.html. Rerun after reindex."""
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from brain import graph, indexer, loop, stopwords, text  # noqa: E402


def seat_table(root):
    """Seat -> ('starts from' prefixes (3rd column), lane keyword phrases (2nd column)), in table order,
    from the Lane keywords table."""
    text = (root / "wiki/ai-team/cross-functional.md").read_text(encoding="utf-8")
    sec = text.split("## Lane keywords", 1)[1].split("\n## ", 1)[0]
    rows = []
    for line in sec.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if line.startswith("|") and len(cells) == 3 and cells[0] not in ("Seat",) and not set(cells[0]) <= set("-: "):
            words = [w.strip().lower() for w in cells[1].split(",") if w.strip()]
            rows.append((cells[0], re.findall(r"`([^`]+)`", cells[2]), words))
    return rows


ASK_FIELDS = ("keywords", "title_terms", "heading_terms", "desc_terms", "path_terms")
ASK_IDENT = ("title_terms", "path_terms")      # terms that earn the title/path bonus in the browser
ASK_BODY_TOP = 60                              # body terms per file (by summed section tf) beyond the fields above
ASK_BUDGET = 120_000                           # bytes; over it, body-only terms that occur in one file are dropped


def ask_index(root, idx, ids):
    """Compact term index for the in-page 'Ask the brain' recall: one vocab, per-file postings as vocab
    indices (the union of the already-stemmed index fields, plus the file's top body terms from its stored
    section term counts, listed separately so the page can weight them lower), ident = title/path term
    indices, df per term, the synonym table (brain/text.py) and the authority priors (brain/indexer.py)."""
    files = [f for f in idx["files"] if f["path"] in ids]
    vocab_in = idx["vocab"]
    rows = []
    for f in files:
        terms = set()
        for k in ASK_FIELDS:
            terms.update(f.get(k, ()))
        ident = set()
        for k in ASK_IDENT:
            ident.update(f.get(k, ()))
        tf = {}
        for _title, _line, _ntok, codes in f.get("sections", ()):
            for c in codes:
                t = vocab_in[c >> 2]
                tf[t] = tf.get(t, 0) + (c & 3)
        body = [t for t in sorted(tf, key=lambda t: (-tf[t], t)) if t not in terms][:ASK_BODY_TOP]
        rows.append((f["path"], terms, ident & terms, set(body)))

    def pack(rows):
        df = {}
        for _p, terms, _ident, body in rows:
            for t in terms | body:
                df[t] = df.get(t, 0) + 1
        vocab = sorted(df, key=lambda t: (-df[t], t))
        vid = {t: i for i, t in enumerate(vocab)}
        out_files = [{"p": p, "t": sorted(vid[t] for t in terms), "i": sorted(vid[t] for t in ident), "b": sorted(vid[t] for t in body)}
                     for p, terms, ident, body in rows]
        return df, vocab, vid, out_files

    def payload(rows):
        df, vocab, vid, out_files = pack(rows)
        syn = {}
        for s, others in text.SYNONYMS.items():
            if s in vid:
                keep = sorted(vid[o] for o in others if o in vid)
                if keep:
                    syn[vid[s]] = keep
        return df, {"n": len(files), "v": vocab, "df": [df[t] for t in vocab], "f": out_files, "syn": syn,
                    "prior": [list(r) for r in indexer.PRIOR_RULES], "stop": sorted(stopwords.STOPWORDS)}

    df, out = payload(rows)
    if len(json.dumps(out, separators=(",", ":"), ensure_ascii=False)) > ASK_BUDGET:   # drop body-only terms seen in one file
        rows = [(p, terms, ident, {t for t in body if df[t] > 1}) for p, terms, ident, body in rows]
        _df, out = payload(rows)
    return out


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
seats = [{"n": "Vanessa", "a": counts.get("Vanessa", 0), "s": [], "k": []}] + [{"n": n, "a": counts.get(n, 0), "s": s, "k": k} for n, s, k in rows if n != "Vanessa"]
enc = encyclopedia(ROOT, g)
ask = ask_index(ROOT, json.loads((ROOT / "brain/index.json").read_text(encoding="utf-8")), {n["id"] for n in g["nodes"]})

def j(o):
    # Inline-script safety (validator, 2026-10-23): "</", "<!--" and "<script" inside a script body change how the HTML
    # tokenizer finds the closing tag; escape the "<" of each so the embedded JSON can carry any page text.
    return (json.dumps(o, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
            .replace("<!--", "<\\!--").replace("<script", "<\\script").replace("<Script", "<\\Script"))

tpl = (ROOT / "dashboard/brain-4d/template.html").read_text(encoding="utf-8")
out = tpl.replace("/*DATA*/null", j(g), 1)
out = out.replace("/*LOOP*/null", json.dumps({k: last.get(k) for k in ("bench_correct", "bench_total", "org_covered", "org_total", "jarvis", "ts")}), 1)
out = out.replace("/*SEATS*/null", j(seats), 1).replace("/*ENC*/null", j(enc), 1)
ask_json = j(ask)
out = out.replace("/*ASK*/null", ask_json, 1)
out = out.replace("/*BUILD*/null", json.dumps(date.today().isoformat()), 1)
# the layers register (2026-10-23): every layer of the second brain with its own last-sync stamp and verdict
from brain import layers as _layers  # noqa: E402
out = out.replace("/*LAYERS*/null", j([{k: r.get(k) for k in ("key", "layer", "sync", "last", "age_days", "cadence_days", "verdict", "url")} for r in _layers.collect(ROOT)]), 1)
from brain import links as _links  # noqa: E402
# section passages (2026-10-23, Steven: "a search bar that can search for topics and get answers from my 2nd brain"):
# the first ~380 characters of every section of every non-client page, so the page can show the answer text itself.
PASSAGE_EXCLUDE = ("memory/fieldy-meetings.md", "memory/claude-chats.md")  # meeting + chat digests never reach the public page


def passages(root, idx, ids, cap=380):
    import re as _re
    from brain.export_notebooklm import mask  # phones / e-mails off the allow-list are masked, as in the NotebookLM pack
    out = []
    for f in idx["files"]:
        p = f["path"]
        if p not in ids or "/clients/" in p or p.startswith("clients/") or p in PASSAGE_EXCLUDE:
            continue
        try:
            lines = (root / p).read_text(encoding="utf-8", errors="replace").split("\n")
        except OSError:
            continue
        secs = f.get("sections") or []
        for i, sec in enumerate(secs):
            title, start = sec[0], sec[1]  # start is 1-based: the heading's line number, so lines[start:] is the body
            if start > len(lines):  # the index is older than the file (a report rewritten after the last reindex): skip the section
                continue
            if start >= 1 and not lines[start - 1].lstrip().startswith("#"):
                start -= 1  # the opening section has no heading line: keep its first line
            end = secs[i + 1][1] - 1 if i + 1 < len(secs) else len(lines)
            body = " ".join(l.strip() for l in lines[start:end] if l.strip() and not l.strip().startswith("|--"))
            body = _re.sub(r"[`*_>#]+", "", body); body = _re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", body); body = _re.sub(r"\s+", " ", body).strip()
            if len(body) < 40:
                continue
            out.append({"p": p, "h": mask(title[:90])[0], "x": mask(body[:cap] + ("…" if len(body) > cap else ""))[0]})
    return out
_idx_for_sec = json.loads((ROOT / "brain/index.json").read_text(encoding="utf-8"))
import base64 as _b64
_photo = ROOT / "dashboard/brain-4d/vanessa.jpg"  # Vanessa's face, the same portrait the Command Deck shows (resized to 360 px)
out = out.replace("/*VANESSA_PHOTO*/", "data:image/jpeg;base64," + _b64.b64encode(_photo.read_bytes()).decode("ascii") if _photo.exists() else "")
_bm = ROOT / "brain/recs/big-moves.json"  # Vanessa's top 10 big moves (bin/brain recs --write), 2026-10-23
out = out.replace("/*RECS*/null", j(json.loads(_bm.read_text(encoding="utf-8")) if _bm.exists() else None), 1)
out = out.replace("/*SEC*/null", j(passages(ROOT, _idx_for_sec, {n["id"] for n in g["nodes"]})), 1)
out = out.replace("/*LINKS*/null", j(_links.all_links(ROOT)), 1)
(ROOT / "dashboard/brain-4d.html").write_text(out, encoding="utf-8")
print(f"wrote dashboard/brain-4d.html: {len(g['nodes'])} nodes, {len(g['links'])} links, {len(seats)} seats, {len(enc)} encyclopedia entries, "
      f"ask index {len(ask['v'])} terms / {sum(len(f['t']) for f in ask['f'])} postings / {len(ask_json):,} bytes, {len(out):,} bytes")
