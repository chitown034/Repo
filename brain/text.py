"""Tokenising, stemming and markdown helpers shared by every brain module.

Pure functions, stdlib only. Everything that scores (the indexer, recall, the
benchmark's grep baseline) goes through the same tokenize() so a word means
the same thing everywhere.
"""

from __future__ import annotations

import re

from .stopwords import STOPWORDS
from .synonyms import GROUPS

WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['_\-.][A-Za-z0-9]+)*")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
FENCE_RE = re.compile(r"^\s*(```|~~~)")


def stem(word: str) -> str:
    """A deliberately tiny suffix stripper (plurals, -ing, -ed, trailing e)."""
    w = word
    if len(w) <= 3 or w.isdigit():
        return w
    if w.endswith("'s"):
        w = w[:-2]
    if w.endswith("ies") and len(w) > 4:
        w = w[:-3] + "y"
    elif w.endswith("sses"):
        w = w[:-2]
    elif w.endswith("s") and not w.endswith(("ss", "us", "is")) and len(w) > 3:
        w = w[:-1]
    stripped = False
    if w.endswith("ing") and len(w) > 5:
        w, stripped = w[:-3], True
    elif w.endswith("ed") and len(w) > 4:
        w, stripped = w[:-2], True
    if stripped and len(w) > 3 and w[-1] == w[-2] and w[-1] not in "lsz" and w[-1].isalpha():
        w = w[:-1]                       # running -> run, stopped -> stop
    if w.endswith("e") and len(w) > 3:
        w = w[:-1]                       # fire / fired / firing -> fir
    return w


def _keep(tok: str) -> bool:
    if tok in STOPWORDS:
        return False
    if len(tok) < 2:
        return False
    return True


def tokenize(text: str) -> list[str]:
    """Lower-case, split, drop stopwords, stem. Joined identifiers
    (``brain-weekly-verify``, ``isa_line``, ``decisions.md``) yield the whole
    compound as one token *and* each part."""
    out: list[str] = []
    for m in WORD_RE.finditer(text.lower()):
        raw = m.group(0)
        if raw.endswith("'s"):
            raw = raw[:-2]
        parts = re.split(r"['_\-.]", raw)
        if len(parts) > 1:
            compound = stem(raw)
            if compound not in STOPWORDS and len(compound) >= 3:
                out.append(compound)
            for p in parts:
                if _keep(p):
                    out.append(stem(p))
        else:
            if _keep(raw):
                out.append(stem(raw))
    return out


def keywords(question: str) -> list[tuple[str, str]]:
    """Question -> ordered, de-duplicated (surface, stem) pairs."""
    seen: set[str] = set()
    out: list[tuple[str, str]] = []
    for m in WORD_RE.finditer(question.lower()):
        raw = m.group(0)
        if raw.endswith("'s"):
            raw = raw[:-2]
        parts = re.split(r"['_\-.]", raw)
        if len(parts) > 1:
            c = stem(raw)
            if c not in seen and raw not in STOPWORDS:
                seen.add(c)
                out.append((raw, c))
            continue
        if not _keep(raw):
            continue
        s = stem(raw)
        if s in seen:
            continue
        seen.add(s)
        out.append((raw, s))
    return out


def _build_synonyms() -> dict[str, set[str]]:
    table: dict[str, set[str]] = {}
    for group in GROUPS:
        stems = set()
        for w in group:
            toks = tokenize(w)
            stems.update(toks[:1] if toks else [])
        for s in stems:
            table.setdefault(s, set()).update(stems - {s})
    return table


SYNONYMS = _build_synonyms()


def strip_md(s: str) -> str:
    """Markdown inline formatting -> plain text (for titles/descriptions)."""
    s = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("__", "").replace("`", "")
    s = re.sub(r"(?<![\w*])\*(?!\s)([^*]+?)\*(?!\w)", r"\1", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()


def norm_for_match(s: str) -> str:
    """Normalise text for phrase matching: no markdown emphasis, collapsed space."""
    s = s.replace("**", "").replace("`", "").replace("__", "")
    return re.sub(r"\s+", " ", s).strip().lower()


def headings(lines: list[str]) -> list[tuple[int, int, str]]:
    """(line_index, level, text) for every ATX heading outside code fences."""
    out = []
    in_fence = False
    for i, line in enumerate(lines):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = HEADING_RE.match(line)
        if m:
            out.append((i, len(m.group(1)), strip_md(m.group(2))))
    return out


def sections(text: str) -> list[dict]:
    """Split markdown into flat sections, one per heading (plus a preamble).

    A heading with no body of its own (immediately followed by a sub-heading)
    is folded into the next section so no section is an empty title."""
    lines = text.splitlines()
    if lines and lines[0].strip() == "---":            # YAML frontmatter is metadata, not a section
        for i in range(1, min(len(lines), 60)):
            if lines[i].strip() == "---":
                lines = [""] * (i + 1) + lines[i + 1:]
                break
    hs = headings(lines)
    bounds = []
    if not hs or hs[0][0] > 0:
        bounds.append((0, 0, "(top)"))
    for i, lvl, t in hs:
        bounds.append((i, lvl, t))
    raw = []
    for n, (start, lvl, title) in enumerate(bounds):
        end = bounds[n + 1][0] if n + 1 < len(bounds) else len(lines)
        raw.append({"start": start, "end": end, "level": lvl, "title": title,
                    "lines": lines[start:end]})
    out: list[dict] = []
    carry = None
    for n, sec in enumerate(raw):
        body = sec["lines"][1:] if sec["level"] else sec["lines"]
        empty_body = not any(l.strip() for l in body)
        if carry is not None:
            sec = dict(sec)
            sec["lines"] = carry["lines"] + sec["lines"]
            sec["start"] = carry["start"]
            sec["title"] = carry["title"] + " › " + sec["title"]
            carry = None
        if sec["level"] == 1 and empty_body:
            continue                                   # a bare H1 is a file title, not a section
        if sec["level"] and empty_body and n < len(raw) - 1:
            carry = sec
            continue
        if not any(l.strip() for l in sec["lines"]):
            continue
        out.append(sec)
    if carry is not None:
        out.append(carry)
    return out
