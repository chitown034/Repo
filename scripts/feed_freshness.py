#!/usr/bin/env python3
"""Zero-token feed freshness for the Command Deck.

    python3 -I scripts/feed_freshness.py <dump dir of collection "state"> [--out feedFreshness.json] [--now ISO]

Reads the JSON files ArtifactData `list ... out_dir` writes (one per document, {v: ...} inside), applies the
watchdog's rules in plain code and prints a table (and writes the `feedFreshness` document body with --out).
A routine that uses this spends its tokens on two tool calls instead of reasoning over 25 documents.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# doc -> expected cadence in hours (fresh while age <= cadence; late < 72 h; stale >= 72 h)
CADENCE = {
    "weatherSnapshot": 14, "newsSnapshot": 14, "aiNews": 26, "ratesSnapshot": 26, "calendarSnapshot": 14,
    "appleHealth": 30, "stravaSnapshot": 30, "strategySnapshot": 30, "liveFeeds": 30, "loftyLeads": 30,
    "zohoSync": 30, "leadResponse": 30, "leadTriage": 30, "runnerStatus": 6, "routineHealth": 30,
    "backupStatus": 24 * 8, "toolkitSnapshot": 24 * 8, "secondBrain": 30, "knowledgeFabric": 30,
    "knowledgeGraph": 24 * 8, "healthNotionSync": 30, "isaLadder": 30, "twinBrief": 30, "vanessaBrief": 30,
    "marketSnapshot": None,
}
STAMP_KEYS = ("syncedAt", "checkedAt", "updatedAt", "generatedAt", "lastSyncAt", "writtenAt", "asOfIso", "ts", "at")


def parse(s):
    if not isinstance(s, str):
        return None
    s = s.strip().replace("Z", "+00:00")
    for fmt in (None, "%Y-%m-%d"):
        try:
            d = datetime.fromisoformat(s) if fmt is None else datetime.strptime(s[:10], fmt)
            return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def find_stamp(v):
    if not isinstance(v, dict):
        return None, None
    for k in STAMP_KEYS:
        d = parse(v.get(k))
        if d:
            return k, d
    meta = v.get("meta")
    if isinstance(meta, dict):
        d = parse(meta.get("last_received"))
        if d:
            return "meta.last_received", d
    return None, None


def sessions_behind(asof: datetime, now: datetime) -> int:
    d, n = now, 0
    last = now if now.hour >= 21 else now - timedelta(days=1)
    day = last.date()
    while day.weekday() >= 5:
        day -= timedelta(days=1)
    while day > asof.date():
        if day.weekday() < 5:
            n += 1
        day -= timedelta(days=1)
    return n


def classify(name, v, now):
    row = {"doc": name, "state": "unknown", "stampField": None, "stamp": None, "ageHours": None}
    if v is None:
        row["state"] = "missing"
        return row
    if name == "liveFeeds":
        feeds = (v or {}).get("feeds") or {}
        stamps = [(k, parse((e or {}).get("checkedAt"))) for k, e in feeds.items() if isinstance(e, dict)]
        stamps = [(k, d) for k, d in stamps if d]
        if not stamps:
            return row
        newest = max(d for _, d in stamps)
        ok, od = min(stamps, key=lambda x: x[1])
        row.update(stampField="feeds.*.checkedAt (newest)", stamp=newest.isoformat(),
                   note=f"oldest entry {ok}: {round((now - od).total_seconds() / 3600)} h")
        d = newest
    elif name == "marketSnapshot":
        m = re.search(r"(\w{3,9}\.? \d{1,2}, 20\d\d|20\d\d-\d\d-\d\d)", str((v or {}).get("asOf", "")))
        if not m:
            return row
        txt = m.group(1)
        d = parse(txt) or datetime.strptime(txt.replace(".", ""), "%b %d, %Y").replace(tzinfo=timezone.utc)
        behind = sessions_behind(d, now)
        row.update(stampField="v.asOf (date in text)", stamp=d.date().isoformat(), ageHours=round((now - d).total_seconds() / 3600, 1))
        row["state"] = "fresh" if behind == 0 else "late" if behind == 1 else "stale"
        return row
    elif name == "aiNews":
        return row  # judged through liveFeeds.feeds.aiNewsList by the caller
    elif name == "healthNotionSync" and (v.get("status") == "awaiting-first-phone-run" or v.get("lastSyncAt") is None):
        row.update(state="waiting", note="waiting on Steven's first phone run")
        return row
    else:
        k, d = find_stamp(v)
        if not d:
            if isinstance(v, dict) and "wait" in str(v.get("status", "")).lower():
                row.update(state="waiting", note=str(v.get("status"))[:80])
            return row
        row.update(stampField=k, stamp=d.isoformat())
    age = (now - d).total_seconds() / 3600
    row["ageHours"] = round(age, 1)
    if age < -0.1:
        row["state"] = "future"
        return row
    cad = CADENCE.get(name) or 30
    row["state"] = "fresh" if age <= cad else "late" if age < 72 else "stale"
    return row


def main(argv):
    dump = Path(argv[1])
    now = parse(argv[argv.index("--now") + 1]) if "--now" in argv else datetime.now(timezone.utc)
    docs = {}
    for name in CADENCE:
        p = dump / f"{name}.json"
        if p.is_file():
            raw = json.loads(p.read_text())
            raw = raw.get("data", raw) if isinstance(raw, dict) and "data" in raw and "v" not in raw else raw
            docs[name] = raw.get("v") if isinstance(raw, dict) else None
        else:
            docs[name] = None
    rows = [classify(n, docs[n], now) for n in CADENCE]
    lf = (docs.get("liveFeeds") or {}).get("feeds", {}).get("aiNewsList") if docs.get("liveFeeds") else None
    for r in rows:
        if r["doc"] == "aiNews" and isinstance(lf, dict):
            r.update(classify("x", {"checkedAt": lf.get("checkedAt")}, now), doc="aiNews", stampField="liveFeeds.feeds.aiNewsList.checkedAt")
    counts = {s: sum(1 for r in rows if r["state"] == s) for s in ("fresh", "late", "stale", "missing", "unknown", "waiting")}
    future = [r["doc"] for r in rows if r["state"] == "future"]
    worst = max((r for r in rows if r["state"] in ("late", "stale") and r["ageHours"] is not None), key=lambda r: r["ageHours"], default=None)
    for r in rows:
        print(f"{r['state']:<8} {str(r['ageHours'] if r['ageHours'] is not None else '-'):>7} h  {r['doc']:<18} {r.get('stampField') or ''} {r.get('note', '')}")
    print("counts:", counts, "future:", future, "worst:", worst and worst["doc"])
    if "--out" in argv:
        body = {"v": {"checkedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "by": "feed-freshness (scripts/feed_freshness.py)",
                      "counts": counts, "worst": worst and worst["doc"], "futureStamps": future, "docs": rows,
                      "note": f"{counts['fresh']} fresh, {counts['late']} late, {counts['stale']} stale; computed in code."}}
        Path(argv[argv.index("--out") + 1]).write_text(json.dumps(body, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
