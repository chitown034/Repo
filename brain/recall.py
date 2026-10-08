"""Principle 3 -- deterministic code before the model.

The retrieval ladder, all plain code, milliseconds, zero model calls:

1. strip the question to keywords (stopwords and filler dropped);
2. score every candidate from ``brain/index.json`` alone -- no file is opened
   to rank it (BM25 over stored term counts + path/title/heading/description
   boosts + CLAUDE.md's routing table + an authority prior);
3. open the top-scoring file (runners-up within 15% are opened by code too, at
   most three, so a near-tie is settled by the passage, not the file average);
4. split it by headings, score the sections -- with a bonus when one line or
   sentence holds the question's terms together -- and keep the best one
   (<= 60 lines, <= ~3.5k chars; a longer section is trimmed to its best window);
5. if that section mostly points somewhere else (a repo path like
   ``routines/mac-task-repairs.md``, or "item 5" of the same file), follow the
   pointer ONCE;
6. hand back question + evidence. If nothing clears the bar: file=None,
   "not in the brain" -- never a guess.
"""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
import time
from bisect import bisect_left
from pathlib import Path

from . import indexer
from .text import SYNONYMS, keywords, norm_for_match, sections, tokenize

K1, B = 1.2, 0.75
SYNONYM_WEIGHT = 0.4
FIELD_W = {"path_terms": 2.0, "title_terms": 1.5, "desc_terms": 0.8}
ROUTE_BOOST = 0.8        # x(1 + ROUTE_BOOST * row_match) for files under a matched row's leaf
NEVER_PENALTY = 0.75     # files under that row's "never load" column
LINE_CAP = 60
CHAR_CAP = 3500
MIN_FILE_SCORE = 1.0
MIN_COVERAGE = 0.5       # idf-weighted share of the question's keywords the evidence must hold
LAYA_TIMEOUT = 2.0
LAYA_BOOST = 0.5
FILE_TERM_WEIGHT = 0.3   # keywords already in the file's path/title, when ranking its sections
HEAD_W = 1.5             # a keyword in the section heading
SECOND_W = 0.15          # a file's second-best section adds a little
FIELD_SCALE = 0.5        # path/title/description matches, scaled by coverage
PROX_W = 1.5             # section bonus for one line/sentence holding the question's terms together
TIE_MARGIN = 0.85        # runner-up files within this share of the leader get their best section checked too
TIE_MAX = 3              # never check more than this many files (code reads; the model still sees one section)
SENT_SPLIT = re.compile(r"(?<=[.;!?])\s+(?=[A-Z0-9*`(])|\s·\s")   # a table row stays one unit


def logical_lines(lines: list[str]) -> list[str]:
    """Re-join hard-wrapped list items and paragraphs: an indented line that is
    not itself a list item or table row continues the line above it."""
    out: list[str] = []
    for line in lines:
        s = line.strip()
        if (out and s and line[:1].isspace() and not s.startswith(("|", "-", "*", "#"))
                and not re.match(r"\d+[.)]\s", s)):
            out[-1] += " " + s
        else:
            out.append(line)
    return out

NOT_IN_BRAIN = "not in the brain"


# ------------------------------------------------------------------ scoring

def _idf(df: int, n: int) -> float:
    return math.log(1.0 + (n - df + 0.5) / (df + 0.5))


class Query:
    """Keywords + synonyms, resolved once against the index vocabulary."""

    def __init__(self, question: str, index: dict):
        self.index = index
        vocab = index.get("_ids")
        if vocab is None:
            vocab = index["_ids"] = {t: i for i, t in enumerate(index["vocab"])}
        self.n = index["sections_indexed"] or 1
        self.avg = index["avg_sec_ntok"] or 1.0
        df = index["df"]
        self.groups = []
        for surface, stem in keywords(question):
            variants = []
            for term, w in [(stem, 1.0)] + [(x, SYNONYM_WEIGHT) for x in sorted(SYNONYMS.get(stem, ()))]:
                tid = vocab.get(term)
                variants.append((term, w, tid, _idf(df[tid] if tid is not None else 0, self.n)))
            self.groups.append({"surface": surface, "stem": stem, "idf": variants[0][3],
                                "variants": variants, "terms": {v[0] for v in variants}})
        self.total_idf = sum(g["idf"] for g in self.groups) or 1.0

    @property
    def keywords(self):
        return [g["surface"] for g in self.groups]

    def score_section(self, tf_of, ntok: int, head: set, ident: set) -> tuple[float, float]:
        """BM25 over one section, heading boost, then a coverage multiplier.

        ``tf_of(variant) -> int``. Keywords already in the file's path/title
        (``ident``) chose the file; inside it they count at FILE_TERM_WEIGHT."""
        norm = K1 * (1 - B + B * ntok / self.avg)
        score = hit = 0.0
        for g in self.groups:
            damp = FILE_TERM_WEIGHT if g["stem"] in ident else 1.0
            got = bool(g["terms"] & ident)
            for v in g["variants"]:
                c = tf_of(v)
                h = v[0] in head
                if c or h:
                    got = True
                    score += damp * v[1] * v[3] * (c * (K1 + 1) / (c + norm) + HEAD_W * h)
            if got:
                hit += g["idf"]
        cov = hit / self.total_idf
        return score * (0.2 + cov) ** 2, cov

    def coverage(self, text: str) -> float:
        terms = set(tokenize(text))
        hit = sum(g["idf"] for g in self.groups if g["terms"] & terms)
        return hit / self.total_idf


_TITLE_CACHE: dict[str, set] = {}


def _title_terms(title: str) -> set:
    t = _TITLE_CACHE.get(title)
    if t is None:
        t = _TITLE_CACHE[title] = set(tokenize(title))
    return t


def _ident(f: dict) -> set:
    return set(f.get("path_terms", ())) | set(f.get("title_terms", ()))


def _codes_tf(codes: list[int]):
    def tf_of(v):
        tid = v[2]
        if tid is None:
            return 0
        i = bisect_left(codes, tid * 4)
        if i < len(codes) and codes[i] >> 2 == tid:
            return codes[i] & 3
        return 0
    return tf_of


def score_file(f: dict, q: Query) -> tuple[float, float, int]:
    """(score, coverage, best section no.) from the index entry alone."""
    ident = _ident(f)
    scored = []
    for k, (title, _line, ntok, codes) in enumerate(f["sections"]):
        s, c = q.score_section(_codes_tf(codes), ntok, _title_terms(title), ident)
        if s > 0:
            scored.append((s, c, k))
    if not scored:
        return 0.0, 0.0, -1
    scored.sort(key=lambda x: (-x[0], x[2]))
    best, cov, k = scored[0]
    second = scored[1][0] if len(scored) > 1 else 0.0
    fields = 0.0
    for g in q.groups:
        for v in g["variants"]:
            for name, w in FIELD_W.items():
                if v[0] in f.get(name, ()):
                    fields += v[1] * v[3] * w
    return best + SECOND_W * second + fields * (0.2 + cov) ** 2 * FIELD_SCALE, cov, k


def _route_weights(q: Query, routes: list[dict]):
    """How strongly the question matches each CLAUDE.md routing row (0..1)."""
    out = []
    for r in routes:
        terms = set(r["terms"])
        m = sum(g["idf"] for g in q.groups if g["terms"] & terms)
        if m:
            out.append((m / q.total_idf, r))
    out.sort(key=lambda x: -x[0])
    return out[:2]


def _laya_hint(question: str, root: Path):
    """Optional: BRAIN_ROUTER=laya asks integrations/laya/laya_route.py for a
    path prefix. Any failure or a >2s wait is ignored silently."""
    if os.environ.get("BRAIN_ROUTER", "").lower() != "laya":
        return None
    script = root / "integrations" / "laya" / "laya_route.py"
    if not script.is_file():
        return None
    try:
        proc = subprocess.run(["python3", str(script), "--json", question], cwd=str(root),
                              capture_output=True, text=True, timeout=LAYA_TIMEOUT)
        if proc.returncode != 0:
            return None
        data = json.loads(proc.stdout.strip().splitlines()[-1])
        route, conf = data.get("route"), float(data.get("confidence", 0))
        if isinstance(route, str) and route and 0 < conf <= 1:
            return route.lstrip("./"), conf
    except Exception:  # noqa: BLE001 -- the hint is optional by contract
        return None
    return None


def rank(question: str, index: dict, root: Path | None = None) -> tuple[list, Query]:
    """Steps 1+2: keywords, then score every indexed file from the index alone."""
    root = Path(root) if root else indexer.repo_root()
    q = Query(question, index)
    if not q.groups:
        return [], q
    routes = _route_weights(q, index.get("routes", []))
    laya = _laya_hint(question, root)
    ranked = []
    for f in index["files"]:
        s, cov, _k = score_file(f, q)
        if s <= 0:
            continue
        s *= indexer.prior_for(f["path"])
        for w, r in routes:
            if any(f["path"].startswith(p) for p in r["load"]):
                s *= 1 + ROUTE_BOOST * w
            elif any(f["path"].startswith(p) for p in r["never"]):
                s *= 1 - (1 - NEVER_PENALTY) * w
        if laya and f["path"].startswith(laya[0]):
            s *= 1 + LAYA_BOOST * laya[1]
        ranked.append((s, cov, f))
    ranked.sort(key=lambda x: (-x[0], x[2]["path"]))
    return ranked, q


# ------------------------------------------------------------------ sections

def proximity(lines: list[str], q: Query) -> float:
    """Best idf-weighted share of the question's keywords found together in a
    single line or sentence -- a table row, a list item, one prose sentence."""
    best = 0.0
    for line in logical_lines(lines):
        for part in SENT_SPLIT.split(line):
            terms = set(tokenize(part))
            if not terms:
                continue
            hit = sum(g["idf"] for g in q.groups if g["terms"] & terms)
            best = max(best, hit / q.total_idf)
    return best


def best_section(text: str, q: Query, ident: set) -> tuple[dict | None, float]:
    """Step 4: split the opened file by headings, score each section the same
    way the index did (plus a proximity bonus), return the best one trimmed to
    the caps, with its score."""
    best, best_s = None, -1.0
    for sec in sections(text):
        toks = tokenize("\n".join(sec["lines"]))
        tf: dict[str, int] = {}
        for t in toks:
            tf[t] = tf.get(t, 0) + 1
        s, _c = q.score_section(lambda v: min(tf.get(v[0], 0), 3), len(toks),
                                _title_terms(sec["title"]), ident)
        if s > 0:
            s *= 1 + PROX_W * proximity(sec["lines"], q)
        if s > best_s:
            best, best_s = sec, s
    return (_trim(best, q), best_s) if best is not None else (None, 0.0)


def _trim(sec: dict, q: Query) -> dict:
    """Return the section whole if it fits the caps; otherwise the heading plus
    the contiguous window of lines that covers the most keywords (ties: the
    shorter window)."""
    lines = sec["lines"]
    if len(lines) <= LINE_CAP and sum(len(l) + 1 for l in lines) <= CHAR_CAP:
        return {**sec, "evidence": "\n".join(lines).strip("\n"), "trimmed": False}
    head, body = (lines[:1], lines[1:]) if sec["level"] else ([], lines)
    if not body:
        return {**sec, "evidence": "\n".join(head), "trimmed": False}
    line_terms = [set(tokenize(l)) for l in body]
    hits = [[i for i, g in enumerate(q.groups) if g["terms"] & lt] for lt in line_terms]
    max_lines = LINE_CAP - len(head) - 2
    max_chars = CHAR_CAP - sum(len(l) + 1 for l in head)
    best = None
    for i in range(len(body)):
        if not hits[i]:
            continue
        covered: set = set()
        chars = 0
        for j in range(i, min(len(body), i + max_lines)):
            chars += len(body[j]) + 1
            if chars > max_chars and j > i:
                break
            covered.update(hits[j])
            cov = sum(q.groups[k]["idf"] for k in covered)
            key = (round(cov, 6), -chars)
            if best is None or key > best[0]:
                best = (key, i, j)
    if best is None:
        lo, hi = 0, 0
    else:
        _, lo, hi = best
    # A table row without its header row is hard to read; pull the header in.
    lead: list[str] = []
    if lo > 0 and body[lo].lstrip().startswith("|"):
        k = lo
        while k > 0 and body[k - 1].lstrip().startswith("|"):
            k -= 1
        if k < lo:
            if k + 2 >= lo:
                lo = k
            else:
                lead = body[k:k + 2]
    if not lead and lo > 0:
        lead = ["…"]
    window = head + lead + body[lo:hi + 1] + (["…"] if hi + 1 < len(body) else [])
    return {**sec, "evidence": "\n".join(window).strip("\n"), "trimmed": True}


# ------------------------------------------------------------------ pointers

PATH_RE = re.compile(r"(?<![\w/.~-])((?:\.\./|\./)?(?:[\w.-]+/)*[\w.-]+\.md)(?:#[\w-]+)?")
POINTER_WORDS = re.compile(r"\b(see|lives? in|write-?up|full (?:write-?up|detail|reference|table|evidence)|"
                           r"details? in|runbook|step by step|spec(?:ified)? in|moved to|belongs in|"
                           r"is in|are in|documented in)\b|→|->", re.I)


def pointers(evidence: str, src: str, known: set[str]) -> list[str]:
    out = []
    base = Path(src).parent
    for m in PATH_RE.finditer(evidence):
        raw = m.group(1)
        cands = [raw.lstrip("./")] if not raw.startswith("..") else []
        cands.append(os.path.normpath((base / raw).as_posix()))
        for c in cands:
            c = c.replace("\\", "/")
            if c in known and c != src and c not in out:
                out.append(c)
                break
    return out


ITEM_REF = re.compile(r"\b(?:item|step)\s+(\d{1,3})\b(?![.\d])", re.I)


def item_pointer(sec_lines: list[str], text: str, q: Query) -> tuple[str, str] | None:
    """An in-document pointer: a line that answers only by saying "the fix is
    item 5" points at list item 5 of the same file. Returns (label, that item)."""
    here = "\n".join(sec_lines)
    for line in logical_lines(sec_lines):
        if not any(g["terms"] & set(tokenize(line)) for g in q.groups):
            continue
        for m in ITEM_REF.finditer(line):
            n = m.group(1)
            item = re.compile(r"^\s*(?:[-*]\s+)?\**" + n + r"[.)]\**\s")
            for cand in logical_lines(text.splitlines()):
                if item.match(cand) and cand.strip() not in here and q.coverage(cand) >= 0.3:
                    return "item " + n, cand.strip()
    return None


def _pointer_kind(sec_text: str, cov: float, has_pointer: bool) -> str | None:
    """'signpost' -- the section is essentially a pointer (short, names a path):
    always worth the one hop. 'weak' -- the section only partly answers and
    names a path: hop, but keep the hop only if the target answers better.
    None -- the section stands on its own."""
    if not has_pointer:
        return None
    body = [l for l in sec_text.splitlines()[1:] if l.strip()]
    if len(body) <= 4 or (POINTER_WORDS.search(sec_text) and len(body) <= 8):
        return "signpost"
    if cov < 0.999 and (len(body) <= 12 or cov < 0.5):
        return "weak"
    return None


# ------------------------------------------------------------------ the ladder

def recall(question: str, root: Path | str | None = None, index: dict | None = None,
           top: int = 0) -> dict:
    t0 = time.perf_counter()
    root = Path(root) if root else indexer.repo_root()
    index = index if index is not None else indexer.load(root)
    ranked, q = rank(question, index, root)
    by_path = {f["path"]: f for f in index["files"]}
    result = {
        "query": question,
        "keywords": q.keywords,
        "file": None, "section": None,
        "pointer_followed": False, "pointer_file": None,
        "evidence": "", "bytes_read": 0, "est_tokens": 0,
        "candidates_scored": len(index["files"]),
        "ms": 0.0, "confidence": 0.0,
    }
    if top:
        result["top"] = [{"file": f["path"], "score": round(s, 3), "coverage": round(c, 2)}
                         for s, c, f in ranked[:top]]

    def done(res):
        res["ms"] = round((time.perf_counter() - t0) * 1000, 2)
        return res

    if not ranked or ranked[0][0] < MIN_FILE_SCORE:
        result["evidence"] = NOT_IN_BRAIN
        return done(result)

    s1 = ranked[0][0]
    s2 = ranked[1][0] if len(ranked) > 1 else 0.0

    # Step 3: open the top file. Only when runners-up score within TIE_MARGIN
    # of it does the code also open them (at most TIE_MAX) and keep the file
    # whose best section is strongest -- a disk read, not model tokens; the
    # model still receives exactly one section.
    contenders = [r for r in ranked[:TIE_MAX] if r[0] >= s1 * TIE_MARGIN]
    choice = None
    for s, _c, f in contenders:
        raw = (root / f["path"]).read_bytes()
        result["bytes_read"] += len(raw)
        text = raw.decode("utf-8", errors="replace")
        sec, sec_s = best_section(text, q, _ident(f))
        if sec is None:
            continue
        combined = sec_s * math.sqrt(s / s1)
        if choice is None or combined > choice[0]:
            choice = (combined, f, sec, text)
    if choice is None:
        result["evidence"] = NOT_IN_BRAIN
        return done(result)
    _, f1, sec, f1_text = choice
    ev = sec["evidence"]
    cov = q.coverage(f1["path"] + "\n" + f1["title"] + "\n" + ev)
    parts = [(f1["path"], sec["title"], ev)]

    # Step 5: one pointer hop, only if the section mostly points elsewhere.
    sec_text = "\n".join(sec["lines"])
    targets = pointers(sec_text, f1["path"], set(by_path))
    kind = _pointer_kind(sec_text, cov, bool(targets))
    if kind:
        scored = []
        for t in targets:
            st, _ct, _k = score_file(by_path[t], q)
            if st > 0:
                scored.append((st, t))
        if scored:
            scored.sort(key=lambda x: (-x[0], x[1]))
            tpath = scored[0][1]
            traw = (root / tpath).read_bytes()
            result["bytes_read"] += len(traw)
            tf = by_path[tpath]
            tsec, _ts = best_section(traw.decode("utf-8", errors="replace"), q, _ident(tf))
            if tsec is not None:
                alone = q.coverage("\n".join([tpath, tf["title"], tsec["evidence"]]))
                both = q.coverage("\n".join([f1["path"], f1["title"], ev, tpath, tf["title"],
                                               tsec["evidence"]]))
                # A signpost's target is the answer; a weak section's target
                # must answer better on its own than the section did.
                if kind == "signpost" or alone > cov:
                    result["pointer_followed"] = True
                    result["pointer_file"] = tpath
                    parts.append((tpath, tsec["title"], tsec["evidence"]))
                    cov = max(cov, both)

    # The same one hop, inside the document: "the fix is item 5" -> item 5.
    if not result["pointer_followed"]:
        hop = item_pointer(ev.splitlines(), f1_text, q)
        if hop:
            result["pointer_followed"] = True
            result["pointer_file"] = f1["path"]
            parts.append((f1["path"], hop[0], hop[1]))
            cov = max(cov, q.coverage(ev + "\n" + hop[1]))

    margin = (s1 - s2) / s1 if s1 else 0.0
    result["confidence"] = round(min(1.0, cov * (0.7 + 0.3 * margin)), 2)
    if cov < MIN_COVERAGE:
        result["evidence"] = NOT_IN_BRAIN
        return done(result)

    result["file"], result["section"] = f1["path"], sec["title"]
    blocks = []
    for i, (p, title, text) in enumerate(parts):
        tag = ("[" if i == 0 else "[pointer → ") + p + " § " + title + "]"
        blocks.append(tag + "\n" + text)
    result["evidence"] = "\n\n".join(blocks)
    result["est_tokens"] = est_tokens(result["evidence"])
    return done(result)


def est_tokens(text: str) -> int:
    """chars / 4, rounded up -- an estimate, not a tokenizer count."""
    return (len(text) + 3) // 4


def contains_phrase(evidence: str, phrase) -> bool:
    """True if the evidence holds the phrase (or any phrase, given a list)."""
    phrases = [phrase] if isinstance(phrase, str) else list(phrase or [])
    ev = norm_for_match(evidence)
    return any(norm_for_match(p) in ev for p in phrases)


def format_human(r: dict) -> str:
    out = []
    if r["file"] is None:
        out.append(f"NOT IN THE BRAIN — nothing scored above the bar for: {', '.join(r['keywords']) or '(no keywords)'}")
        out.append("Say \"not in the brain\" and offer to queue research. Do not fill the gap from memory.")
    else:
        out.append(f"{r['file']} § {r['section']}")
        if r["pointer_followed"]:
            out.append(f"pointer followed → {r['pointer_file']}")
        out.append("")
        out.append(r["evidence"])
    out.append("")
    if r.get("top"):
        out.append("candidates (scored from brain/index.json, not opened):")
        for c in r["top"]:
            out.append(f"  {c['score']:8.3f}  cov {c['coverage']:.2f}  {c['file']}")
    out.append(f"keywords: {', '.join(r['keywords'])} · scored {r['candidates_scored']} files · "
               f"bytes read {r['bytes_read']:,} · est tokens {r['est_tokens']:,} (chars/4) · "
               f"{r['ms']} ms · confidence {r['confidence']}")
    return "\n".join(out)
