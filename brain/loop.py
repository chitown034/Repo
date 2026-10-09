"""Loop engineering for the brain -- the brain measures itself and says what to fix next.

``brain gaps``      what was asked and not answered (from the local recall log)
``brain orgcheck``  does every seat on the org chart resolve to something in the brain, and is Jarvis verified
``brain pack``      several sections under a token budget -- one paste for any platform
``brain loop``      reindex -> doctor -> bench -> gaps -> orgcheck, one report, compared with the last run

Plain code, standard library, no model calls. The recall log holds keywords only, never the
sentence asked, lives in brain/state/ (gitignored) and is skipped for anything the secret
guard in remember.py would refuse.
"""

from __future__ import annotations

import json
import os
import re
import time
from datetime import date, datetime, timezone
from pathlib import Path

from . import doctor, indexer, recall as recall_mod, remember

STATE_DIR = "brain/state"
LOG = f"{STATE_DIR}/recall-log.jsonl"
JARVIS_STATUS = f"{STATE_DIR}/jarvis-status.json"
HISTORY = "brain/loop-history.jsonl"
REPORT = "docs/reports/BRAIN-LOOP.md"
LOW_CONFIDENCE = 0.35
JARVIS_FRESH_HOURS = 36


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ------------------------------------------------------------------ recall log

def log_recall(root: Path, res: dict) -> bool:
    """Append one keywords-only line. Returns False when logging is off or the query looks sensitive."""
    if os.environ.get("BRAIN_NOLOG") == "1":
        return False
    try:
        remember.guard(res.get("query", ""))
    except remember.Refused:
        return False
    d = root / STATE_DIR
    try:
        d.mkdir(parents=True, exist_ok=True)
        line = {"ts": _now(), "kw": sorted(res.get("keywords") or [])[:12], "file": res.get("file"),
                "conf": round(float(res.get("confidence") or 0), 2)}
        with (root / LOG).open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(line, ensure_ascii=False) + "\n")
        return True
    except OSError:
        return False


def read_log(root: Path) -> list[dict]:
    p = root / LOG
    if not p.is_file():
        return []
    out = []
    for raw in p.read_text(encoding="utf-8").splitlines():
        try:
            out.append(json.loads(raw))
        except ValueError:
            continue
    return out


def gaps(root: Path, min_count: int = 1, limit: int = 15) -> list[dict]:
    """Questions the brain could not answer well, most-asked first, each with the nearest files."""
    groups: dict[tuple, dict] = {}
    for e in read_log(root):
        miss = e.get("file") is None or float(e.get("conf") or 0) < LOW_CONFIDENCE
        if not miss or not e.get("kw"):
            continue
        g = groups.setdefault(tuple(e["kw"]), {"keywords": list(e["kw"]), "count": 0, "last": e.get("ts"),
                                               "state": "not in the brain" if e.get("file") is None else "low confidence"})
        g["count"] += 1
        g["last"] = max(g["last"] or "", e.get("ts") or "")
    out = [g for g in groups.values() if g["count"] >= min_count]
    out.sort(key=lambda g: (-g["count"], g["last"] or ""))
    out = out[:limit]
    if out:
        try:
            ix = indexer.load(root)
            for g in out:
                ranked, _q = recall_mod.rank(" ".join(g["keywords"]), ix, root)
                g["nearest"] = [f["path"] for _s, _c, f in ranked[:3]]
        except Exception:  # noqa: BLE001 -- suggestions are a bonus
            pass
    for g in out:
        g["action"] = ("`bin/brain remember` the answer once Steven gives it, or queue research"
                       if g["state"] == "not in the brain" else
                       "add the missing wording to the nearest page or a synonym in brain/synonyms.py")
    return out


# ------------------------------------------------------------------ org chart coverage

SEAT_SECTIONS = ("The named seats worth knowing by name",)


def org_seats(root: Path) -> list[dict]:
    """Seats named in wiki/ai-team/org-chart.md: the tree (tree-drawing lines) and the bold named seats."""
    p = root / "wiki/ai-team/org-chart.md"
    if not p.is_file():
        return []
    text = p.read_text(encoding="utf-8")
    seats: list[dict] = []
    seen: set[str] = set()

    def add(name: str, role: str, kind: str) -> None:
        name = name.strip()
        key = name.lower()
        if name and key not in seen:
            seen.add(key)
            seats.append({"name": name, "role": role.strip(), "kind": kind})

    for m in re.finditer(r"^[│\s]*[├└]─\s*(.+)$", text, re.M):
        line = m.group(1).strip()
        mm = re.match(r"([A-Z][A-Za-z/ .&-]+?)\s*(?:\(([^)]+)\))?\s*[—-]\s*(.*)", line)
        if mm:
            add(mm.group(1), (mm.group(2) or "") + " " + mm.group(3)[:60], "tree")
    for m in re.finditer(r"^- \*\*([^*]+)\*\*(?:\s*/\s*\*\*([^*]+)\*\*)?\s*\(([^)]+)\)", text, re.M):
        add(m.group(1), m.group(3), "named")
        if m.group(2):
            add(m.group(2), m.group(3), "named")
    return seats


def seat_check(root: Path, ix: dict, seat: dict) -> dict:
    name = seat["name"]
    res = recall_mod.recall(f"{name} {seat['role']}"[:120], root=root, index=ix)
    ev = (res.get("evidence") or "") + " " + (res.get("file") or "")
    base = name.split("/")[0].split("(")[0].strip().lower()
    hit = bool(res.get("file")) and base.split(" ")[0] in ev.lower()
    return {**seat, "covered": hit, "file": res.get("file"), "section": res.get("section")}


def jarvis_status(root: Path, now: float | None = None) -> dict:
    """Read the status file the Mac script writes. The cloud cannot see Jarvis, so no file = unverified."""
    p = root / JARVIS_STATUS
    if not p.is_file():
        return {"state": "unverified",
                "detail": "Jarvis lives on the Mac. Run `bash integrations/jarvis/jarvis-setup.sh --verify` there and "
                          "commit nothing: the status file stays local."}
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
        ts = datetime.strptime(d["checked"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).timestamp()
    except (ValueError, KeyError, OSError):
        return {"state": "unverified", "detail": "status file unreadable; rerun --verify on the Mac"}
    age_h = ((now or time.time()) - ts) / 3600
    if age_h > JARVIS_FRESH_HOURS:
        return {"state": "stale", "detail": f"last verified {age_h:.0f} h ago ({d['checked']}); past the {JARVIS_FRESH_HOURS} h limit",
                "docs": d.get("documents")}
    return {"state": "ok" if d.get("ok") else "failing", "detail": d.get("summary", ""), "docs": d.get("documents"),
            "checked": d["checked"]}


def orgcheck(root: Path) -> dict:
    ix = indexer.load(root)
    seats = [seat_check(root, ix, s) for s in org_seats(root)]
    covered = sum(1 for s in seats if s["covered"])
    return {"seats": seats, "covered": covered, "total": len(seats), "jarvis": jarvis_status(root)}


def format_orgcheck(r: dict) -> str:
    out = [f"org chart coverage: {r['covered']}/{r['total']} seats resolve to a brain page"]
    for s in r["seats"]:
        mark = "ok  " if s["covered"] else "MISS"
        where = f"{s['file']} § {s['section']}" if s["file"] else "not in the brain"
        out.append(f"  {mark} {s['name']:<28} {where}")
    j = r["jarvis"]
    out.append(f"jarvis: {j['state']} — {j['detail']}")
    return "\n".join(out)


# ------------------------------------------------------------------ context pack

def pack(root: Path, question: str, budget_tokens: int = 900, max_sections: int = 5) -> dict:
    """Best section from each of the top files, stopped by a token budget. One paste works on any platform."""
    ix = indexer.load(root)
    ranked, q = recall_mod.rank(question, ix, root)
    parts, used = [], 0
    if ranked and ranked[0][0] >= recall_mod.MIN_FILE_SCORE:
        floor = ranked[0][0] * 0.35
        for s, _c, f in ranked[: max_sections * 2]:
            if s < floor or len(parts) >= max_sections:
                break
            try:
                text = (root / f["path"]).read_text(encoding="utf-8")
            except OSError:
                continue
            sec, _sc = recall_mod.best_section(text, q, recall_mod._ident(f))
            if not sec:
                continue
            body = "\n".join(sec["lines"]).strip()
            cost = recall_mod.est_tokens(body) + 12
            if used + cost > budget_tokens and parts:
                continue
            if cost > budget_tokens:
                body = body[: budget_tokens * 4]
                cost = budget_tokens
            parts.append({"file": f["path"], "section": sec["title"], "text": body, "tokens": cost})
            used += cost
    return {"query": question, "budget": budget_tokens, "used": used, "parts": parts}


def format_pack(p: dict) -> str:
    if not p["parts"]:
        return recall_mod.NOT_IN_BRAIN
    out = [f"<!-- brain pack: {len(p['parts'])} sections, ~{p['used']} tokens of {p['budget']} -->"]
    for x in p["parts"]:
        out.append(f"### {x['file']} § {x['section']}\n{x['text']}\n")
    return "\n".join(out)


# ------------------------------------------------------------------ the loop

def _bench_summary(root: Path) -> dict:
    """Run the gold questions through recall only (no report written) and count correct hits."""
    from . import bench
    qf = root / bench.QUESTIONS
    items = json.loads(qf.read_text(encoding="utf-8")).get("questions", []) if qf.is_file() else []
    ix = indexer.load(root)
    answerable = [q for q in items if isinstance(q, dict) and q.get("expected_phrase")]
    ok = 0
    misses = []
    for q in answerable:
        r = recall_mod.recall(q["question"], root=root, index=ix)
        files = [q.get("expected_file")] + list(q.get("alt_files") or [])
        if recall_mod.contains_phrase(r["evidence"], q["expected_phrase"]) and (r["file"] in files or r["pointer_file"] in files):
            ok += 1
        else:
            misses.append(q["question"][:80])
    return {"answerable": len(answerable), "correct": ok, "misses": misses}


def last_run(root: Path) -> dict | None:
    p = root / HISTORY
    if not p.is_file():
        return None
    lines = [ln for ln in p.read_text(encoding="utf-8").splitlines() if ln.strip()]
    try:
        return json.loads(lines[-1]) if lines else None
    except ValueError:
        return None


def run_loop(root: Path, write: bool = True) -> tuple[bool, str]:
    t0 = time.perf_counter()
    indexer.write(root)
    ok_doc, doc_report = doctor.run(root)
    bench = _bench_summary(root)
    gp = gaps(root)
    org = orgcheck(root)
    st = stale(root)
    prev = last_run(root)
    cur = {"ts": _now(), "doctor": ok_doc, "bench_correct": bench["correct"], "bench_total": bench["answerable"],
           "org_covered": org["covered"], "org_total": org["total"], "gaps": len(gp), "stale_pages": len(st), "jarvis": org["jarvis"]["state"]}
    regress = []
    if prev:
        if cur["bench_correct"] < prev.get("bench_correct", 0):
            regress.append(f"bench correct fell {prev['bench_correct']} -> {cur['bench_correct']}")
        if cur["org_covered"] < prev.get("org_covered", 0):
            regress.append(f"org coverage fell {prev['org_covered']} -> {cur['org_covered']}")
    if not ok_doc:
        regress.append("doctor failed")
    # next actions, ranked
    todo: list[str] = []
    for m in bench["misses"][:5]:
        todo.append(f"gold question no longer answered: {m}")
    for s in org["seats"]:
        if not s["covered"]:
            todo.append(f"org seat '{s['name']}' has no brain page — add a line to wiki/ai-team/")
    for g in gp[:5]:
        todo.append(f"asked {g['count']}x, {g['state']}: {' '.join(g['keywords'])} — {g['action']}")
    for x in st[:5]:
        todo.append(f"stale page: {x['file']} — newest date stamp {x['newest_stamp']} ({x['age_days']} days); re-check its live facts")
    if org["jarvis"]["state"] != "ok":
        todo.append(f"Jarvis is {org['jarvis']['state']} — {org['jarvis']['detail']}")
    lines = [
        "# Brain loop report", "",
        f"Run: {cur['ts']} · {time.perf_counter() - t0:.1f} s · generated by `bin/brain loop`. "
        "Plain code, no model calls.", "",
        "| Check | Result | Last run |", "|---|---|---|",
        f"| doctor | {'PASS' if ok_doc else 'FAIL'} | {('PASS' if prev.get('doctor') else 'FAIL') if prev else '—'} |",
        f"| gold questions answered | {cur['bench_correct']}/{cur['bench_total']} | "
        f"{str(prev.get('bench_correct')) + '/' + str(prev.get('bench_total')) if prev else '—'} |",
        f"| org seats resolving | {cur['org_covered']}/{cur['org_total']} | "
        f"{str(prev.get('org_covered')) + '/' + str(prev.get('org_total')) if prev else '—'} |",
        f"| open gaps in the recall log | {cur['gaps']} | {prev.get('gaps', '—') if prev else '—'} |",
        f"| pages with live-sounding facts older than 21 days | {cur['stale_pages']} | {prev.get('stale_pages', '—') if prev else '—'} |",
        f"| Jarvis | {cur['jarvis']} | {prev.get('jarvis', '—') if prev else '—'} |", "",
    ]
    lines.append("## Regressions" if regress else "## Regressions\n\nNone.")
    lines += [f"- {r}" for r in regress]
    lines += ["", "## Next fixes, in order", ""]
    lines += [f"{i}. {t}" for i, t in enumerate(todo, 1)] or ["Nothing open."]
    lines += ["", "## Doctor", "", "```", *doc_report, "```", ""]
    text = "\n".join(lines)
    if write:
        (root / REPORT).parent.mkdir(parents=True, exist_ok=True)
        (root / REPORT).write_text(text, encoding="utf-8")
        with (root / HISTORY).open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(cur) + "\n")
    return (not regress), text


# ------------------------------------------------------------------ freshness and links

DATE_RE = re.compile(r"\b(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b")
VOLATILE = re.compile(r"\b(status|live|count|currently|today|as of|running|connected|installed)\b", re.I)
STALE_SKIP = ("docs/reports/", "docs/findings/", "memory", "context/decisions.md", "INDEX.md", "brain/")


def stale(root: Path, days: int = 21, today: date | None = None, limit: int = 20) -> list[dict]:
    """Pages that state live-sounding facts but whose newest date stamp is older than `days`.
    Dated logs (memory, decisions, reports) are records of their day and are skipped."""
    today = today or date.today()
    out = []
    for f in indexer.load(root)["files"]:
        p = f["path"]
        if p.startswith(STALE_SKIP) or not p.endswith(".md"):
            continue
        try:
            text = (root / p).read_text(encoding="utf-8")
        except OSError:
            continue
        dates = []
        for y, m, d in DATE_RE.findall(text):
            try:
                dt = date(int(y), int(m), int(d))
            except ValueError:
                continue
            if dt <= today:
                dates.append(dt)
        if not dates or not VOLATILE.search(text):
            continue
        newest = max(dates)
        age = (today - newest).days
        if age > days:
            out.append({"file": p, "newest_stamp": newest.isoformat(), "age_days": age})
    out.sort(key=lambda x: -x["age_days"])
    return out[:limit]


def related(root: Path, target: str, limit: int = 5) -> list[dict]:
    """Pages that share the most distinctive keywords with `target` (a path, or a question)."""
    ix = indexer.load(root)
    files = ix["files"]
    by = {f["path"]: f for f in files}
    if target in by:
        base = set(by[target].get("keywords") or [])
        skip = target
    else:
        res = recall_mod.recall(target, root=root, index=ix)
        if not res["file"]:
            return []
        base, skip = set(by[res["file"]].get("keywords") or []), res["file"]
        out0 = [{"file": skip, "shared": len(base), "why": "the page recall answers from"}]
    df: dict[str, int] = {}
    for f in files:
        for k in f.get("keywords") or []:
            df[k] = df.get(k, 0) + 1
    scored = []
    for f in files:
        if f["path"] == skip:
            continue
        common = base & set(f.get("keywords") or [])
        if not common:
            continue
        w = sum(1.0 / df[k] for k in common)
        scored.append((w, f["path"], sorted(common, key=lambda k: df[k])[:5]))
    scored.sort(key=lambda x: (-x[0], x[1]))
    out = [{"file": p, "score": round(w, 3), "shared": ", ".join(c)} for w, p, c in scored[:limit]]
    return (out0 + out) if target not in by else out
