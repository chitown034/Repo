"""Process coverage register for the Command Deck (2026-10-26).

Every document the deck reads, who writes it, how often it should move, which AI seat owns it, and — given a
database export — whether it actually moved. Plain code, no model call. Steven, 2026-10-26: "ensure all data is live
and synced and look for gaps in the process to automate and have an AI agent facilitate complete coverage".

Inputs
  brain/coverage/writers.json          curated: doc -> {kind, writer, cadenceHours, owner, pod, note}
  docs/inventory/deck-doc-panels.json  scanned from the live deck (``--scan <deck.html>``): doc -> tab, panel, funcs
  <db dir>/state/<doc>.json            optional ArtifactData export (``--db``); gives the live stamp and size

Statuses: fresh · stale · never written · broken writer · queue-driven · manual · derived · retired · no writer.
A GAP is any automated document that is stale, never written, has no writer, or whose writer is retired or broken.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

KINDS = {"cloud": "cloud routine", "mac": "Mac task", "ci": "GitHub Action", "session": "session pass", "deck": "the page itself",
         "user": "Steven types it", "derived": "deck UI state", "retired": "retired", "none": "no writer"}
STAMP_KEYS = ("syncedAt", "checkedAt", "ranAt", "updatedAt", "generatedAt", "generated", "builtAt", "asOf", "writtenAt", "refreshedAt", "lastBackup", "date")
TAB_ORDER = ["Daily Ops", "Markets & Trading", "Family Office & Wealth", "Lending & Real Estate", "Showings", "AI Team", "Career & Education",
             "Health & Wellness", "Rewards & Ventures", "PE & Defense Innovation", "Elite Affluent Tracker", "Next Big Moves",
             "Travel & Experiences", "Toolkit & Remote Access", "Orchestration & Loop", ""]
TAB_NAMES = {"daily": "Daily Ops", "markets": "Markets & Trading", "wealth": "Family Office & Wealth", "realestate": "Lending & Real Estate",
             "showings": "Showings", "aiteam": "AI Team", "career": "Career & Education", "health": "Health & Wellness",
             "rewards": "Rewards & Ventures", "pedefense": "PE & Defense Innovation", "eliteaffluent": "Elite Affluent Tracker",
             "nextmoves": "Next Big Moves", "travel": "Travel & Experiences", "toolkit": "Toolkit & Remote Access", "orchestration": "Orchestration & Loop"}


def _json(p: Path):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def parse_stamp(s) -> datetime | None:
    """ISO stamps (with Z, offset, or none), the Mac's "2026-10-26 08:05 AM PDT", and "Fri Oct 23, 2026 close (...)"."""
    if not isinstance(s, str) or not s.strip():
        return None
    s = s.strip()
    m = re.match(r"(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s*(PDT|PST)?", s, re.I)
    if m:
        h = int(m.group(2)) % 12 + (12 if m.group(4).upper() == "PM" else 0)
        off = 8 if (m.group(5) or "PDT").upper() == "PST" else 7
        return datetime.fromisoformat(m.group(1) + "T%02d:%s:00+00:00" % (h, m.group(3))) + timedelta(hours=off)
    m = re.match(r"(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(Z|[+-]\d{2}:?\d{2})?", s)
    if m:
        iso = m.group(1) + "T" + m.group(2) + ":" + (m.group(3) or "00")
        tz = m.group(4) or "Z"
        if tz == "Z":
            tz = "+00:00"
        elif ":" not in tz:
            tz = tz[:3] + ":" + tz[3:]
        try:
            return datetime.fromisoformat(iso + tz).astimezone(timezone.utc)
        except ValueError:
            return None
    m = re.match(r"^(\d{4}-\d{2}-\d{2})$", s)
    if m:
        return datetime.fromisoformat(s + "T12:00:00+00:00")
    m = re.search(r"(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?\s*([A-Z][a-z]{2}) (\d{1,2}), (\d{4})", s)
    if m:
        try:
            return datetime.strptime("%s %s %s" % (m.group(1), m.group(2), m.group(3)), "%b %d %Y").replace(hour=21, tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


FUTURE_SKEW = timedelta(hours=48)


def doc_stamp(body, now: datetime | None = None) -> tuple[datetime | None, str]:
    """The freshest stamp a document carries: the first known key on v that parses, else the newest date in the first 20 kB.
    A key stamp in the future is returned as is (the caller flags it); body dates in the future (renewal dates, expiry
    years, plan horizons) are never write stamps and are ignored."""
    now = now or datetime.now(timezone.utc)
    v = body.get("v", body) if isinstance(body, dict) else body
    if isinstance(v, dict):
        for k in STAMP_KEYS:
            d = parse_stamp(v.get(k))
            if d:
                return d, k
    text = json.dumps(v)[:20000]
    found = re.findall(r"20\d\d-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:\.\d+)?(?:Z|[+-]\d\d:?\d\d)?", text) or re.findall(r"\b20\d\d-\d\d-\d\d\b", text)
    best = None
    for s in found:
        d = parse_stamp(s)
        if d and d <= now + FUTURE_SKEW and (best is None or d > best):
            best = d
    if best:
        return best, "newest date in the body"
    return None, ""


def is_empty(body) -> bool:
    v = body.get("v", body) if isinstance(body, dict) else body
    return v is None or v == [] or v == {} or v == ""


def writers(root: Path) -> dict:
    return _json(root / "brain" / "coverage" / "writers.json") or {}


def panels(root: Path) -> dict:
    d = _json(root / "docs" / "inventory" / "deck-doc-panels.json") or {}
    return d.get("docs", {})


def scan_deck(html: str) -> dict:
    """doc -> {tab, panel, funcs} from a Command Deck HTML export (no model call)."""
    import collections
    secs = [(m.start(), m.group(1)) for m in re.finditer(r'<section[^>]*data-page="([^"]+)"', html)] + [(len(html), "END")]
    id2 = {}
    for (a, pg), (b, _) in zip(secs, secs[1:]):
        body = html[a:b]
        t = re.search(r'class="panel-title">([^<]+)<', body)
        title = t.group(1).replace("&amp;", "&") if t else ""
        for i in re.findall(r'\sid="([A-Za-z0-9_-]+)"', body):
            id2.setdefault(i, (pg, title))
    pos = [(m.start(), m.group(1)) for m in re.finditer(r"function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{", html)] + [(len(html), "END")]
    out: dict = {}
    for (a, n), (b, _) in zip(pos, pos[1:]):
        body = html[a:b]
        docs = set(re.findall(r"""lsGet(?:Seeded)?\(\s*["']([A-Za-z0-9_]+)["']""", body))
        if not docs:
            continue
        ids = set(re.findall(r"""\$\(\s*["']([A-Za-z0-9_-]+)["']""", body)) | set(re.findall(r"""getElementById\(\s*["']([A-Za-z0-9_-]+)["']""", body))
        hits = collections.Counter(id2[i] for i in ids if i in id2)
        for d in docs:
            o = out.setdefault(d, {"tab": "", "panel": "", "funcs": []})
            o["funcs"].append(n)
            if hits and not o["tab"]:
                (pg, title), _ = hits.most_common(1)[0]
                o["tab"], o["panel"] = TAB_NAMES.get(pg, pg), title
    for o in out.values():
        o["funcs"] = sorted(set(o["funcs"]))[:6]
    return dict(sorted(out.items()))


def read_db(db: Path | None, now: datetime | None = None) -> dict:
    """doc -> (stamp, key, bytes, empty) from an ArtifactData export directory (state/<doc>.json)."""
    out = {}
    now = now or datetime.now(timezone.utc)
    if not db:
        return out
    base = db / "state" if (db / "state").is_dir() else db
    files = sorted(base.glob("*.json"))
    if not base.is_dir() or not files:
        raise SystemExit("coverage: no ArtifactData export at %s (expected state/<doc>.json files) — refusing to score every document as never written" % db)
    for p in files:
        body = _json(p)
        if body is None:
            continue
        d, k = doc_stamp(body, now)
        out[p.stem] = (d, k, p.stat().st_size, is_empty(body))
    return out


def _hours(now: datetime, d: datetime | None) -> float | None:
    return None if d is None else round((now - d).total_seconds() / 3600, 1)


def collect(root: Path, db: Path | None = None, now: datetime | None = None) -> list[dict]:
    now = now or datetime.now(timezone.utc)
    W, P, DB = writers(root), panels(root), read_db(db, now)
    rows = []
    for doc in sorted(set(W) | set(P)):
        w = W.get(doc) or {"kind": "none", "writer": "not in brain/coverage/writers.json", "cadenceHours": None, "owner": "", "pod": "", "note": ""}
        p = P.get(doc) or {"tab": "", "panel": "", "funcs": []}
        stamp, key, size, empty = DB.get(doc, (None, "", None, True))
        age = _hours(now, stamp)
        kind, cad = w["kind"], w.get("cadenceHours")
        automated = kind in ("cloud", "mac", "ci", "deck")
        if kind == "derived":
            status = "derived"
        elif kind in ("user", "session"):                       # the same rule as the deck card: Steven's or a session's, never a gap
            status = "manual" if (db is None or (size and not empty)) else "never typed"
        elif kind == "retired":
            status = "retired"
        elif kind == "none":
            status = "no writer"
        elif db is None:
            status = "unchecked"
        elif size is None:
            status = "never written"
        elif not automated or cad is None:
            status = "queue-driven"
        elif age is None:
            status = "no stamp"
        elif age < -1:
            status = "future stamp"
        elif age <= cad * 1.5:
            status = "fresh"
        else:
            status = "stale"
        gap = status in ("stale", "never written", "no writer", "no stamp", "future stamp") or (kind == "retired" and bool(w.get("note")))
        rows.append({"doc": doc, "tab": p["tab"], "panel": p["panel"], "kind": kind, "writer": w["writer"], "cadenceHours": cad,
                     "owner": w["owner"], "pod": w["pod"], "note": w.get("note", ""), "stamp": stamp.strftime("%Y-%m-%dT%H:%MZ") if stamp else None,
                     "stampKey": key, "ageHours": age, "bytes": size, "status": status, "gap": gap, "readBy": p["funcs"]})
    rows.sort(key=lambda r: (TAB_ORDER.index(r["tab"]) if r["tab"] in TAB_ORDER else 99, r["panel"], r["doc"]))
    return rows


def counts(rows: list[dict]) -> dict:
    c: dict = {}
    for r in rows:
        c[r["status"]] = c.get(r["status"], 0) + 1
    c["gaps"] = sum(1 for r in rows if r["gap"])
    c["docs"] = len(rows)
    c["automated"] = sum(1 for r in rows if r["kind"] in ("cloud", "mac", "ci", "deck"))
    return c


def gaps(rows: list[dict]) -> list[dict]:
    order = {"no writer": 0, "never written": 1, "stale": 2, "no stamp": 3, "future stamp": 3, "retired": 4}
    return sorted([r for r in rows if r["gap"]], key=lambda r: (order.get(r["status"], 9), -(r["ageHours"] or 0)))


def format_rows(rows: list[dict], db_note: str = "") -> str:
    c = counts(rows)
    out = ["# Process coverage — every Command Deck document, its writer, its owner, and whether it moved",
           "",
           "Generated by `bin/brain coverage --write` (plain code, no model call). Writers: `brain/coverage/writers.json`. Panels: "
           "`docs/inventory/deck-doc-panels.json` (scanned from the live deck). Live stamps: " + (db_note or "no database export given — statuses unchecked") + ".",
           "",
           "| Count | |", "|---|---|"]
    for k in ("docs", "automated", "fresh", "stale", "never written", "no writer", "queue-driven", "manual", "derived", "retired", "gaps"):
        if k in c:
            out.append("| %s | %d |" % (k, c[k]))
    g = gaps(rows)
    out += ["", "## Gaps — automated documents that did not move, have no writer, or whose writer is retired (%d)" % len(g), "",
            "| Doc | Panel | Status | Age | Writer | Owner | Fix |", "|---|---|---|---|---|---|---|"]
    for r in g:
        age = "—" if r["ageHours"] is None else ("%dh" % r["ageHours"] if r["ageHours"] < 72 else "%dd" % (r["ageHours"] // 24))
        out.append("| `%s` | %s | %s | %s | %s | %s | %s |" % (r["doc"], r["panel"] or r["tab"] or "—", r["status"], age, r["writer"].replace("|", "/"), r["owner"], (r["note"] or "—").replace("|", "/")))
    out += ["", "## Every document, by tab", ""]
    cur = None
    for r in rows:
        if r["tab"] != cur:
            cur = r["tab"]
            out += ["", "### " + (cur or "Read by code, not by a panel (state, queues, markers)"), "", "| Doc | Panel | Writer | Cadence | Owner | Pod | Last stamp | Status |", "|---|---|---|---|---|---|---|---|"]
        cad = "—" if r["cadenceHours"] is None else "%dh" % r["cadenceHours"]
        out.append("| `%s` | %s | %s: %s | %s | %s | %s | %s | %s |" % (r["doc"], r["panel"] or "—", KINDS.get(r["kind"], r["kind"]), r["writer"].replace("|", "/"), cad, r["owner"] or "—", r["pod"] or "—", r["stamp"] or "—", r["status"] + (" **GAP**" if r["gap"] else "")))
    return "\n".join(out) + "\n"


def deck_doc(rows: list[dict], now: datetime | None = None) -> dict:
    """The processCoverage document the deck's card reads: the register minus the live status (the page computes that from each doc's own stamp)."""
    now = now or datetime.now(timezone.utc)
    return {"v": {"generatedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "by": "bin/brain coverage (Nova — Coverage & Process Auditor)",
                  "source": "brain/coverage/writers.json + docs/inventory/deck-doc-panels.json",
                  "docs": [{"doc": r["doc"], "tab": r["tab"], "panel": r["panel"], "kind": r["kind"], "writer": r["writer"], "cadenceHours": r["cadenceHours"],
                            "owner": r["owner"], "pod": r["pod"], "note": r["note"]} for r in rows],
                  "counts": {k: v for k, v in counts(rows).items() if k in ("docs", "automated", "manual", "derived", "retired", "no writer")}}}


def write(root: Path, rows: list[dict], db_note: str = "") -> Path:
    p = root / "docs" / "inventory" / "process-coverage.md"
    p.write_text(format_rows(rows, db_note), encoding="utf-8")
    (root / "docs" / "inventory" / "process-coverage.json").write_text(json.dumps({"rows": rows, "counts": counts(rows)}, indent=1), encoding="utf-8")
    return p
