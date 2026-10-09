"""Principle 4 -- keep a small index of everything.

Builds two artefacts from the tree, deterministically (no timestamps, no
mtimes, sorted everything, so the same tree always produces byte-identical
output and ``brain doctor`` can diff them):

* ``INDEX.md``          one line per memory/knowledge file: path, title, one
                        sentence. Small enough for a human or a model to scan.
* ``brain/index.json``  the machine companion: per-file keywords (tf-idf
                        selected, with counts), headings, byte size, content
                        hash, plus the corpus df table and CLAUDE.md's routing
                        table. Recall scores candidates from this alone and
                        never opens a file to rank it.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
from collections import Counter
from pathlib import Path

from .text import headings, sections, strip_md, tokenize

INDEX_MD = "INDEX.md"
INDEX_JSON = "brain/index.json"
DESC_MAX = 120
KEYWORDS_PER_FILE = 16

# What is a memory/knowledge file. Order is the order INDEX.md groups them in.
INCLUDE_ROOT_FILES = [
    "CLAUDE.md", "AGENTS.md", "README.md", "memory.md", "recall-cache.md",
    "OPTIMIZATION.md", "REMOTE-ACCESS.md", "MAC-INSTALL.md",
    "MAC-INSTALL-tooling.md", "MAC-INSTALL-comms-data.md",
]
INCLUDE_TREES = [  # (dir, recursive)
    ("context", True), ("projects", True), ("wiki", True), ("references", True),
    ("memory", True), ("knowledge-graph", True), ("vector-index", True),
    ("always-on", True), ("routines", False), ("docs", False),
    ("docs/inventory", False), ("integrations", False),
]
INCLUDE_EXTRA_GLOBS = ["integrations/*/README.md"]
# Never indexed, whatever the rules above say.
EXCLUDE = {"INDEX.md", "docs/reports/BRAIN-BENCH.md"}
EXCLUDE_PREFIXES = ("docs/findings/", "docs/data/", "docs/reports/", ".claude/",
                    "dashboard/", "brain/", "integrations/cli-anything-harnesses/")

# Authority prior. CLAUDE.md's routed leaves are authoritative by construction;
# runbooks and audit records are dated evidence of what was true once.
PRIOR_RULES = [
    ("references/drive-second-brain-notes.md", 0.55),  # a dated copy of Notion rows: never outranks a current leaf
    ("docs/inventory/", 0.7),
    ("docs/", 0.8),
    ("routines/", 0.85),
    ("integrations/", 0.8),
    ("MAC-INSTALL", 0.75),
    ("README.md", 0.85),
    ("AGENTS.md", 0.8),
]


def repo_root() -> Path:
    env = os.environ.get("BRAIN_ROOT")
    if env:
        return Path(env).resolve()
    return Path(__file__).resolve().parent.parent


def prior_for(path: str) -> float:
    for prefix, w in PRIOR_RULES:
        if path.startswith(prefix):
            return w
    return 1.0


def list_files(root: Path) -> list[str]:
    found: set[str] = set()
    for name in INCLUDE_ROOT_FILES:
        if (root / name).is_file():
            found.add(name)
    for d, recursive in INCLUDE_TREES:
        base = root / d
        if not base.is_dir():
            continue
        it = base.rglob("*.md") if recursive else base.glob("*.md")
        for p in it:
            if p.is_file():
                found.add(p.relative_to(root).as_posix())
    for g in INCLUDE_EXTRA_GLOBS:
        for p in root.glob(g):
            if p.is_file():
                found.add(p.relative_to(root).as_posix())
    out = [f for f in found if f not in EXCLUDE and not f.startswith(EXCLUDE_PREFIXES)]
    return sorted(out, key=_sort_key)


def _sort_key(path: str):
    order = [n for n in INCLUDE_ROOT_FILES] + [d + "/" for d, _ in INCLUDE_TREES]
    top = path if "/" not in path else path.split("/")[0] + "/"
    if path.startswith("docs/inventory/"):
        top = "docs/inventory/"
    try:
        rank = order.index(top)
    except ValueError:
        rank = len(order)
    return (rank, path)


# ---------------------------------------------------------------- per file

def _frontmatter(lines: list[str]) -> tuple[dict, int]:
    if not lines or lines[0].strip() != "---":
        return {}, 0
    meta = {}
    for i in range(1, min(len(lines), 60)):
        if lines[i].strip() == "---":
            return meta, i + 1
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", lines[i])
        if m:
            meta[m.group(1).lower()] = m.group(2).strip().strip("'\"")
    return {}, 0


_SENT_END = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9*`\"(\[])")


def first_sentence(par: str) -> str:
    # A leading bold label ("**What.** Steven's dashboard...") is not a sentence.
    par = re.sub(r"^\*\*[^*]{1,24}[.:]\*\*\s+", "", par.strip())
    text = strip_md(par)
    parts = _SENT_END.split(text)
    s = parts[0].strip()
    # "One page." says nothing on its own -- take sentences until it does.
    k = 1
    while len(s) < 40 and k < len(parts):
        s = s + " " + parts[k].strip()
        k += 1
    if len(s) > DESC_MAX:
        cut = s[: DESC_MAX - 1]
        if " " in cut[60:]:
            cut = cut[: cut.rfind(" ")]
        s = cut.rstrip(" ,;:—-") + "…"
    return s


def describe(text: str, path: str) -> tuple[str, str]:
    """(title, description), deterministically, from the file alone."""
    lines = text.splitlines()
    meta, start = _frontmatter(lines)
    title = meta.get("title", "")
    h1_at = None
    if not title:
        for i in range(start, len(lines)):
            m = re.match(r"^#\s+(.+?)\s*#*\s*$", lines[i])
            if m:
                title, h1_at = strip_md(m.group(1)), i
                break
    if not title:
        title = Path(path).stem
    if meta.get("description"):
        return title, first_sentence(meta["description"])
    i = (h1_at + 1) if h1_at is not None else start
    in_fence = False
    par: list[str] = []
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith(("```", "~~~")):
            in_fence = not in_fence
            if par:
                break
            i += 1
            continue
        if in_fence:
            i += 1
            continue
        if not s:
            if par:
                break
            i += 1
            continue
        if s.startswith(("#", "|", "---", "<!--", "***")):
            if par:
                break
            i += 1
            continue
        s = re.sub(r"^>\s?", "", s)
        s = re.sub(r"^[-*+]\s+", "", s)
        par.append(s)
        i += 1
    desc = first_sentence(" ".join(par)) if par else ""
    return title, desc or title


def analyse(root: Path, path: str) -> dict:
    raw = (root / path).read_bytes()
    text = raw.decode("utf-8", errors="replace")
    lines = text.splitlines()
    title, desc = describe(text, path)
    hs = headings(lines)
    secs = []
    ntok = 0
    tf_all: Counter = Counter()
    for sec in sections(text):
        toks = tokenize("\n".join(sec["lines"]))
        ntok += len(toks)
        tf = Counter(toks)
        tf_all.update(tf)
        secs.append({"title": sec["title"], "line": sec["start"] + 1, "ntok": len(toks), "_tf": tf})
    stem_path = re.sub(r"\.md$", "", path)
    return {
        "path": path,
        "title": title,
        "description": desc,
        "bytes": len(raw),
        "lines": len(lines),
        "hash": hashlib.sha256(raw).hexdigest()[:16],
        "ntok": ntok,
        "_tf": tf_all,
        "_secs": secs,
        "title_terms": sorted(set(tokenize(title))),
        "desc_terms": sorted(set(tokenize(desc))),
        "path_terms": sorted(set(tokenize(stem_path.replace("/", " / ")))),
        "heading_terms": sorted({t for _, lvl, h in hs if lvl > 1 for t in tokenize(h)}),
        "headings": [[lvl, h] for _, lvl, h in hs][:80],
    }


# ---------------------------------------------------------------- routes

def parse_routes(root: Path) -> list[dict]:
    """CLAUDE.md's routing table -> [{class, terms, load, never}]."""
    p = root / "CLAUDE.md"
    if not p.is_file():
        return []
    routes = []
    in_table = False
    for line in p.read_text(encoding="utf-8").splitlines():
        if line.startswith("## Routing table"):
            in_table = True
            continue
        if in_table and line.startswith("## "):
            break
        if not (in_table and line.startswith("|")):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 2 or cells[0].startswith("---") or cells[0] == "Question class":
            continue
        routes.append({
            "class": strip_md(cells[0]),
            "terms": sorted(set(tokenize(cells[0]))),
            "load": route_prefixes(cells[1]),
            "never": route_prefixes(cells[2]) if len(cells) > 2 else [],
        })
    return routes


def route_prefixes(cell: str) -> list[str]:
    out = []
    for p in re.findall(r"`([^`]+)`", cell):
        p = p.strip()
        if "<" in p:
            p = p[: p.index("<")]
        if p.endswith("/index.md"):
            p = p[: -len("index.md")]
        out.append(p)
    # The "never load" column names places in words ("wiki, projects").
    bare = [("mortgage wiki", "wiki/mortgage-programs/"), ("vector index", "vector-index/"),
            ("knowledge graph", "knowledge-graph/"), ("playbooks", "wiki/real-estate-playbooks/"),
            ("always-on", "always-on/"), ("projects", "projects/"), ("wiki", "wiki/")]
    low = cell.lower()
    if "`" not in cell:
        for k, v in bare:
            pat = r"(?<![\w-])" + re.escape(k) + r"(?![\w-])"
            if re.search(pat, low):
                out.append(v)
                low = re.sub(pat, " ", low)
    return sorted(set(out))


# ---------------------------------------------------------------- build

def idf(df: int, n: int) -> float:
    return math.log(1.0 + (n - df + 0.5) / (df + 0.5))


def build(root: Path | None = None) -> dict:
    """Walk the tree and build the index dict (see module docstring).

    Section postings: every heading-delimited section of every file is stored
    as ``[title, first_line, ntok, codes]`` where each code is
    ``term_id * 4 + min(tf, 3)`` against the sorted ``vocab`` list. That lets
    recall rank a file by its best *passage* without opening it. ``df`` counts
    sections (not files) containing each term, parallel to ``vocab``."""
    root = Path(root) if root else repo_root()
    files = [analyse(root, p) for p in list_files(root)]
    sec_df: Counter = Counter()
    vocab_set: set[str] = set()
    n_sec = 0
    for f in files:
        for sec in f["_secs"]:
            sec_df.update(sec["_tf"].keys())
            n_sec += 1
        vocab_set.update(f["_tf"])
        for field in ("title_terms", "heading_terms", "path_terms", "desc_terms"):
            vocab_set.update(f[field])
    vocab = sorted(vocab_set)
    ids = {t: i for i, t in enumerate(vocab)}
    for f in files:
        tf = f.pop("_tf")
        ranked = sorted(tf.items(), key=lambda kv: (-(kv[1] * idf(sec_df[kv[0]], n_sec)), kv[0]))
        f["keywords"] = [t for t, _ in ranked[:KEYWORDS_PER_FILE]]
        f["sections"] = [
            [sec["title"], sec["line"], sec["ntok"],
             sorted(ids[t] * 4 + min(c, 3) for t, c in sec["_tf"].items())]
            for sec in f.pop("_secs")
        ]
    avg = (sum(sec[2] for f in files for sec in f["sections"]) / n_sec) if n_sec else 0.0
    return {
        "version": 2,
        "files_indexed": len(files),
        "sections_indexed": n_sec,
        "avg_sec_ntok": round(avg, 2),
        "vocab": vocab,
        "df": [sec_df[t] for t in vocab],
        "routes": parse_routes(root),
        "files": files,
    }


def render_index_md(index: dict) -> str:
    files = index["files"]
    out = [
        "# INDEX — one line per memory and knowledge file",
        "",
        "Generated by `bin/brain reindex` (and by every `bin/brain remember`) — do not edit by hand.",
        f"{len(files)} files. Each line: `path` — title — its first sentence. "
        "Machine companion: `brain/index.json`. Routing rules stay in `CLAUDE.md`.",
    ]
    group = None
    for f in files:
        p = f["path"]
        g = "(root)" if "/" not in p else ("docs/inventory/" if p.startswith("docs/inventory/")
                                           else p.split("/")[0] + "/")
        if g != group:
            out += ["", f"## {g}", ""]
            group = g
        title = f["title"].replace("\n", " ")
        if len(title) > 90:
            title = title[:89].rstrip() + "…"
        desc = f["description"].replace("\n", " ")
        line = f"- `{p}` — {title}"
        if desc and desc != title:
            line += f" — {desc}"
        out.append(line)
    return "\n".join(out) + "\n"


def render_index_json(index: dict) -> str:
    """Deterministic JSON, one file entry per line so a git diff stays local."""
    head = {k: v for k, v in index.items() if k != "files"}
    body = json.dumps(head, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    rows = [json.dumps(f, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
            for f in index["files"]]
    return body[:-1] + ',\n"files":[\n' + ",\n".join(rows) + "\n]}\n"


def write(root: Path | None = None, index: dict | None = None) -> dict:
    root = Path(root) if root else repo_root()
    index = index or build(root)
    (root / "brain").mkdir(exist_ok=True)
    _atomic_write(root / INDEX_MD, render_index_md(index))
    _atomic_write(root / INDEX_JSON, render_index_json(index))
    return index


def _atomic_write(path: Path, content: str) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(content, encoding="utf-8")
    os.replace(tmp, path)


def load(root: Path | None = None) -> dict:
    root = Path(root) if root else repo_root()
    p = root / INDEX_JSON
    if p.is_file():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            pass
    return build(root)
