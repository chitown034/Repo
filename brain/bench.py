"""Principle 5 -- make it prove itself.

Runs every gold question three ways and measures what each hands the model:

brain    ``recall()``: one index read, one file opened, one section returned
         (+ at most one pointer hop). One Bash call.
default  a fresh Claude Code session with no brain: grep every markdown file
         for the question's keywords, then Read the top 8 files by match
         count, in full (capped like the Read tool: 2,000 lines / ~25k tokens
         per file). 1 grep + up to 8 Read calls.
router   CLAUDE.md read whole, then the ONE leaf its routing table names, read
         whole (hand-labelled per question as ``router_leaf``). If CLAUDE.md
         already holds the answer the leaf is skipped. 1-2 Read calls.

Tokens are estimated as characters / 4 for all three -- an estimate, not a
tokenizer count, applied identically. Wall time is the deterministic code
path only; it excludes model turns, which dominate real sessions (see the
"tool calls" column for how many round trips each path costs).
"""

from __future__ import annotations

import json
import time
from datetime import date
from pathlib import Path

from . import indexer
from .recall import contains_phrase, est_tokens, recall
from .text import keywords

QUESTIONS = "brain/bench/questions.json"
REPORT = "docs/reports/BRAIN-BENCH.md"
DEFAULT_TOP_FILES = 8
READ_MAX_LINES = 2000
READ_MAX_CHARS = 100_000          # ~25k tokens, the Read tool's per-call ceiling
GREP_SKIP_DIRS = {".git", "brain", "node_modules", "__pycache__"}
GREP_SKIP_FILES = {"INDEX.md", "docs/reports/BRAIN-BENCH.md"}


def load_questions(root: Path) -> list[dict]:
    return json.loads((root / QUESTIONS).read_text(encoding="utf-8"))["questions"]


def _accepted(q: dict) -> set[str]:
    return ({q["expected_file"]} | set(q.get("alt_files") or [])) if q["expected_file"] else set()


# ------------------------------------------------------------------ baselines

def _all_markdown(root: Path) -> list[Path]:
    out = []
    for p in root.rglob("*.md"):
        rel = p.relative_to(root).as_posix()
        if set(p.relative_to(root).parts[:-1]) & GREP_SKIP_DIRS or rel in GREP_SKIP_FILES:
            continue
        if p.is_file():
            out.append(p)
    return sorted(out)


def _read_like_tool(p: Path) -> str:
    text = p.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines(keepends=True)[:READ_MAX_LINES]
    return "".join(lines)[:READ_MAX_CHARS]


def default_session(question: str, root: Path) -> dict:
    t0 = time.perf_counter()
    pats = [s.lower() for _, s in keywords(question) if len(s) >= 3]
    scan_bytes = 0
    hits = []
    for p in _all_markdown(root):
        raw = p.read_bytes()
        scan_bytes += len(raw)
        low = raw.decode("utf-8", errors="replace").lower()
        lines = sum(1 for line in low.splitlines() if any(k in line for k in pats))
        if lines:
            distinct = sum(1 for k in pats if k in low)
            hits.append((distinct, lines, p.relative_to(root).as_posix(), p))
    hits.sort(key=lambda h: (-h[0], -h[1], h[2]))
    grep_out = "\n".join(f"{h[2]}:{h[1]}" for h in hits)
    read = {}
    for _, _, rel, p in hits[:DEFAULT_TOP_FILES]:
        read[rel] = _read_like_tool(p)
    ctx = grep_out + "".join(read.values())
    return {"files": list(read), "content": read, "tokens": est_tokens(ctx),
            "disk_bytes": scan_bytes, "ms": (time.perf_counter() - t0) * 1000,
            "calls": 1 + len(read)}


def router_only(q: dict, root: Path) -> dict:
    t0 = time.perf_counter()
    read = {"CLAUDE.md": (root / "CLAUDE.md").read_text(encoding="utf-8")}
    leaf = q.get("router_leaf")
    in_router = q["expected_phrase"] and contains_phrase(read["CLAUDE.md"], q["expected_phrase"])
    if leaf and not in_router and (root / leaf).is_file():
        read[leaf] = (root / leaf).read_text(encoding="utf-8")
    ctx = "".join(read.values())
    return {"files": list(read), "content": read, "tokens": est_tokens(ctx),
            "disk_bytes": len(ctx.encode("utf-8")), "ms": (time.perf_counter() - t0) * 1000,
            "calls": len(read)}


def _correct_read(q: dict, run: dict) -> bool | None:
    if q["expected_file"] is None:
        return None                     # a baseline cannot refuse; the model would have to
    ok = _accepted(q)
    return any(f in ok and contains_phrase(run["content"][f], q["expected_phrase"]) for f in run["files"])


def _correct_brain(q: dict, r: dict) -> bool:
    if q["expected_file"] is None:
        return r["file"] is None
    ok = _accepted(q)
    return (r["file"] in ok or r["pointer_file"] in ok) and contains_phrase(r["evidence"], q["expected_phrase"])


# ------------------------------------------------------------------ run

def run(root: Path | None = None) -> dict:
    root = Path(root) if root else indexer.repo_root()
    index_bytes = (root / indexer.INDEX_JSON).stat().st_size if (root / indexer.INDEX_JSON).is_file() else 0
    rows = []
    for q in load_questions(root):
        r = recall(q["question"], root=root)       # loads index.json from disk each time
        b = {"file": r["file"], "section": r["section"], "pointer_file": r["pointer_file"],
             "tokens": r["est_tokens"], "disk_bytes": r["bytes_read"] + index_bytes, "ms": r["ms"],
             "calls": 1, "confidence": r["confidence"], "correct": _correct_brain(q, r)}
        d = default_session(q["question"], root)
        d["correct"] = _correct_read(q, d)
        ro = router_only(q, root)
        ro["correct"] = _correct_read(q, ro)
        rows.append({"q": q, "brain": b, "default": d, "router": ro})
    return {"rows": rows, "totals": totals(rows), "index_bytes": index_bytes}


def totals(rows: list[dict]) -> dict:
    out = {}
    answerable = [r for r in rows if r["q"]["expected_file"]]
    refusals = [r for r in rows if not r["q"]["expected_file"]]
    for m in ("brain", "default", "router"):
        out[m] = {
            "tokens": sum(r[m]["tokens"] for r in rows),
            "tokens_answerable": sum(r[m]["tokens"] for r in answerable),
            "disk_bytes": sum(r[m]["disk_bytes"] for r in rows),
            "ms": round(sum(r[m]["ms"] for r in rows), 1),
            "calls": sum(r[m]["calls"] for r in rows),
            "correct": sum(1 for r in answerable if r[m]["correct"]),
            "answerable": len(answerable),
            "refusals_correct": (sum(1 for r in refusals if r[m]["correct"])
                                 if m == "brain" else None),
            "refusals": len(refusals),
        }
    return out


# ------------------------------------------------------------------ report

def _mark(v):
    return "n/a" if v is None else ("✅" if v else "❌")


def render(res: dict) -> str:
    rows, t = res["rows"], res["totals"]
    b, d, ro = t["brain"], t["default"], t["router"]
    L = [
        "# Brain bench — brain path vs a default session vs router-only",
        "",
        f"Generated by `bin/brain bench --write` on {date.today().isoformat()}. "
        f"{len(rows)} questions ({b['answerable']} answerable, {b['refusals']} that are not in the brain), "
        "gold answers in `brain/bench/questions.json`.",
        "",
        "**How it is measured.** *Tokens* = characters handed to the model ÷ 4 — an estimate, "
        "applied identically to all three paths, not a tokenizer count. *ms* = the deterministic code "
        "path only (no model turns). *Calls* = tool round trips a session would make. A path is "
        "*correct* when the expected file (or a file stating the same fact) is in what it read AND the "
        "expected phrase is in the text the model actually receives.",
        "",
        "- **brain** — `bin/brain recall`: keywords → score all files from `brain/index.json` → open one "
        "file → best section (≤60 lines) → at most one pointer hop.",
        f"- **default** — no brain: grep all markdown for the keywords, Read the top {DEFAULT_TOP_FILES} "
        "files by match count in full (Read-tool caps: 2,000 lines / ~25k tokens per file).",
        "- **router** — `CLAUDE.md` whole + the one leaf its routing table names, whole "
        "(leaf skipped if `CLAUDE.md` already holds the answer).",
        "",
        "## Totals",
        "",
        "| Path | Est. tokens to model | Mean / question | Tool calls | Code ms (total) | Correct (answerable) | Refusals correct |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    n = len(rows)
    for name, m in (("brain", b), ("default session", d), ("router only", ro)):
        ref = f"{m['refusals_correct']}/{m['refusals']}" if m["refusals_correct"] is not None else "n/a — model must decide"
        L.append(f"| {name} | {m['tokens']:,} | {m['tokens'] // n:,} | {m['calls']} | {m['ms']:,} | "
                 f"{m['correct']}/{m['answerable']} | {ref} |")
    L += ["", "## Per question", "",
          "| # | Kind | Question | Brain answer (file § section) | Brain tok | ✓ | Default tok | ✓ | Router tok | ✓ |",
          "|---|---|---|---|---:|:-:|---:|:-:|---:|:-:|"]
    for r in rows:
        q, br = r["q"], r["brain"]
        where = "not in the brain" if br["file"] is None else f"`{br['file']}` § {br['section']}"
        if br["pointer_file"]:
            where += f" → `{br['pointer_file']}`"
        where = where.replace("|", "/")
        L.append(f"| {q['id']} | {q['kind']} | {q['question']} | {where} | {br['tokens']:,} | {_mark(br['correct'])} | "
                 f"{r['default']['tokens']:,} | {_mark(r['default']['correct'])} | "
                 f"{r['router']['tokens']:,} | {_mark(r['router']['correct'])} |")
    L += ["", "## Verdict", "", verdict(res), ""]
    return "\n".join(L)


def verdict(res: dict) -> str:
    rows, t = res["rows"], res["totals"]
    b, d, ro = t["brain"], t["default"], t["router"]
    ratio_d = d["tokens"] / b["tokens"] if b["tokens"] else float("inf")
    ratio_r = ro["tokens"] / b["tokens"] if b["tokens"] else float("inf")
    claude_rows = [r for r in rows if r["q"]["kind"] == "claude"]
    brain_claude_tok = sum(r["brain"]["tokens"] for r in claude_rows)
    wrong_brain = [r["q"]["id"] for r in rows if r["brain"]["correct"] is False]
    wrong_router = [r["q"]["id"] for r in rows if r["router"]["correct"] is False]
    wrong_default = [r["q"]["id"] for r in rows if r["default"]["correct"] is False]
    hops = [r["q"]["id"] for r in rows if r["brain"]["pointer_file"]]
    win = b["correct"] >= max(d["correct"], ro["correct"]) and ratio_d >= 5
    parts = [
        ("**The brain path wins.** " if win else "**The brain path does not clearly win yet.** ")
        + f"Across {len(rows)} questions it handed the model {b['tokens']:,} estimated tokens, against "
        f"{d['tokens']:,} for a default session ({ratio_d:.0f}× more) and {ro['tokens']:,} for router-only "
        f"({ratio_r:.1f}× more), and it answered {b['correct']}/{b['answerable']} correctly against "
        f"{d['correct']}/{d['answerable']} and {ro['correct']}/{ro['answerable']}. "
        f"It refused {b['refusals_correct']}/{b['refusals']} out-of-brain questions itself; the baselines "
        "cannot refuse — they hand the model files and the model has to notice the answer is absent, "
        "after paying for the read.",
        f"**Where the default is just as good.** The {len(claude_rows)} `claude` questions are facts already in "
        "`CLAUDE.md`, which Claude Code loads into every session before the first question. For those the "
        f"marginal cost of the router path is zero, and the brain's {brain_claude_tok:,} tokens are pure overhead. "
        "The guide says so too: the brain pays off on facts buried in leaves and docs, not on facts the router "
        "already carries. (In real sessions `CLAUDE.md`'s ~1.4k tokens are paid by all three paths; this "
        "table charges it only to router-only, where it is the method.)",
        "**Where the brain is weaker.** It returns one section of one file. A question whose answer spans "
        "two sections, or needs a comparison across files, gets half the evidence — the router path, which "
        "reads the whole leaf, is safer there, at 5–10× the tokens. "
        + (f"Brain misses this run: {', '.join(wrong_brain)}. " if wrong_brain else "No brain misses this run. ")
        + (f"Router-only misses: {', '.join(wrong_router)} (the routed leaf does not hold the answer — "
           "a real model would then escalate, paying again). " if wrong_router else "")
        + (f"Default misses: {', '.join(wrong_default)} (grep ranked the right file below the top "
           f"{DEFAULT_TOP_FILES} or the Read cap cut it). " if wrong_default else ""),
        (f"Pointer hops taken: {', '.join(hops)}. " if hops else "No pointer hop was needed this run. ")
        + f"The brain's code also reads `brain/index.json` ({res['index_bytes']:,} bytes) on every call; "
        "the model never sees it, so it is disk I/O, not tokens. Code time is milliseconds for every path; "
        "the real wall-clock difference is model round trips — 1 call for the brain, 1–2 for router-only, "
        "up to 9 for a default session.",
    ]
    return "\n\n".join(parts)


def main(root: Path | None = None, write: bool = False) -> int:
    root = Path(root) if root else indexer.repo_root()
    res = run(root)
    text = render(res)
    if write:
        out = root / REPORT
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(f"wrote {REPORT}")
    print(text)
    t = res["totals"]
    return 0 if t["brain"]["correct"] >= max(t["default"]["correct"], t["router"]["correct"]) else 1
