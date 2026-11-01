#!/usr/bin/env python3
"""birthdays.py — who has a birthday today, the card for each, and the queue Steven posts from.

    python3 birthdays.py --csv birthdays.csv [--ics birthdays.ics] [--date 2026-11-01] [--out out] [--render]

Sources (both optional, both read-only):
  --csv   name,birthday,photo,channel,note   birthday = YYYY-MM-DD, MM-DD or MM/DD[/YYYY]
  --ics   the Facebook birthday calendar Steven exports himself (Birthday Calendar Exporter → birthday-calendar.ics,
          or any VEVENT list with SUMMARY "<Name>'s Birthday" and DTSTART;VALUE=DATE:YYYYMMDD)
Nothing here reads Facebook. Meta's terms forbid automated collection from the platform and the Graph API has not
exposed friends' birthdays since v2.0 (2014); the list is Steven's own export, refreshed by him.

Output (deterministic for a given date and list): <out>/<date>/<slug>.png per person (with --render, through render.js)
and <out>/<date>/queue.json: [{name, first, image, caption, channel, photo, note, status:"queued"}].
Stdlib only.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CHANNELS = ("personal", "page", "both")


def _clean_name(s: str) -> str:
    s = re.sub(r"\s+", " ", (s or "").strip())
    return re.sub(r"['’]s\s+[Bb]irthday$", "", s).strip()


def parse_birthday(text: str) -> tuple[int, int] | None:
    """'1980-11-01' | '11-01' | '11/01/1980' | '11/01' | '19801101' -> (month, day); None when unreadable."""
    t = (text or "").strip()
    if not t:
        return None
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", t)
    if m:
        return _md(int(m.group(2)), int(m.group(3)))
    m = re.fullmatch(r"(\d{1,2})-(\d{1,2})", t)
    if m:
        return _md(int(m.group(1)), int(m.group(2)))
    m = re.fullmatch(r"(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?", t)
    if m:
        return _md(int(m.group(1)), int(m.group(2)))
    m = re.fullmatch(r"(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?", t)
    if m:
        return _md(int(m.group(2)), int(m.group(3)))
    return None


def _md(month: int, day: int) -> tuple[int, int] | None:
    if 1 <= month <= 12 and 1 <= day <= 31:
        return (month, day)
    return None


def load_csv(path: Path) -> list[dict]:
    out: list[dict] = []
    with open(path, newline="", encoding="utf-8-sig") as fh:
        for row in csv.DictReader(fh):
            row = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
            md = parse_birthday(row.get("birthday") or row.get("date") or row.get("dob") or "")
            name = _clean_name(row.get("name") or " ".join(x for x in (row.get("first"), row.get("last")) if x))
            if not name or not md:
                continue
            channel = (row.get("channel") or "personal").lower()
            out.append({
                "name": name, "month": md[0], "day": md[1],
                "photo": row.get("photo") or None,
                "channel": channel if channel in CHANNELS else "personal",
                "note": row.get("note") or "", "source": "csv",
            })
    return out


def _unfold(lines: list[str]) -> list[str]:
    out: list[str] = []
    for ln in lines:
        if ln[:1] in (" ", "\t") and out:
            out[-1] += ln[1:]
        else:
            out.append(ln.rstrip("\r\n"))
    return out


def load_ics(path: Path) -> list[dict]:
    out: list[dict] = []
    cur: dict | None = None
    for ln in _unfold(open(path, encoding="utf-8", errors="replace").read().splitlines()):
        if ln == "BEGIN:VEVENT":
            cur = {}
        elif ln == "END:VEVENT" and cur is not None:
            md = parse_birthday(cur.get("DTSTART", ""))
            name = _clean_name(cur.get("SUMMARY", ""))
            if name and md:
                out.append({"name": name, "month": md[0], "day": md[1], "photo": None,
                            "channel": "personal", "note": cur.get("DESCRIPTION", "")[:120], "source": "ics"})
            cur = None
        elif cur is not None and ":" in ln:
            key, val = ln.split(":", 1)
            key = key.split(";", 1)[0].upper()
            cur[key] = val.replace("\\,", ",").replace("\\n", " ")
    return out


def due(records: list[dict], on: dt.date) -> list[dict]:
    """Everyone whose birthday is `on`. Feb 29 birthdays are celebrated on Feb 28 in a non-leap year. De-duplicated by name."""
    leap = on.year % 4 == 0 and (on.year % 100 != 0 or on.year % 400 == 0)
    seen: set[str] = set()
    out: list[dict] = []
    for r in records:
        m, d = r["month"], r["day"]
        if (m, d) == (2, 29) and not leap:
            m, d = 2, 28
        if (m, d) != (on.month, on.day):
            continue
        key = r["name"].casefold()
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return sorted(out, key=lambda r: r["name"].casefold())


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "card"


def caption_for(brand: dict, name: str) -> str:
    first = name.split()[0] if name.split() else name
    return (brand.get("caption") or "Happy Birthday, {first}!").format(first=first, name=name)


def build_queue(records: list[dict], on: dt.date, out_dir: Path, brand: dict) -> list[dict]:
    day_dir = out_dir / on.isoformat()
    queue: list[dict] = []
    for r in due(records, on):
        s = slug(r["name"])
        photo = r.get("photo")
        queue.append({
            "name": r["name"], "first": r["name"].split()[0], "date": on.isoformat(),
            "image": str(day_dir / f"{s}.png"), "photo": photo,
            "caption": caption_for(brand, r["name"]), "channel": r["channel"], "note": r.get("note", ""),
            "source": r.get("source", ""), "status": "queued",
        })
    return queue


def write_jobs(queue: list[dict], brand_path: Path) -> list[Path]:
    jobs: list[Path] = []
    for q in queue:
        img = Path(q["image"])
        img.parent.mkdir(parents=True, exist_ok=True)
        job = img.with_suffix(".job.json")
        # a missing photo renders the no-photo variant: never a stranger's picture, never a scraped one
        photo = q["photo"]
        if photo and not Path(photo).is_absolute():
            photo = str((HERE / photo).resolve()) if (HERE / photo).exists() else photo
        if photo and not Path(photo).exists():
            photo = None
        job.write_text(json.dumps({"name": q["name"], "photo": photo, "out": img.name,
                                   "brand": str(brand_path)}, indent=2), encoding="utf-8")
        jobs.append(job)
    return jobs


def render_jobs(jobs: list[Path]) -> list[tuple[Path, int]]:
    results = []
    for job in jobs:
        proc = subprocess.run(["node", str(HERE / "render.js"), str(job)], capture_output=True, text=True)
        if proc.returncode != 0:
            sys.stderr.write(proc.stderr)
        results.append((job, proc.returncode))
    return results


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--csv", type=Path, action="append", default=[])
    ap.add_argument("--ics", type=Path, action="append", default=[])
    ap.add_argument("--date", default=dt.date.today().isoformat(), help="YYYY-MM-DD (local date to run for)")
    ap.add_argument("--out", type=Path, default=HERE / "out")
    ap.add_argument("--brand", type=Path, default=HERE / "brand.json")
    ap.add_argument("--render", action="store_true", help="also render the PNGs through render.js (needs Playwright Chromium)")
    a = ap.parse_args(argv)
    on = dt.date.fromisoformat(a.date)
    brand = json.loads(a.brand.read_text(encoding="utf-8"))
    records: list[dict] = []
    for p in a.csv:
        records += load_csv(p)
    for p in a.ics:
        records += load_ics(p)
    queue = build_queue(records, on, a.out, brand)
    day_dir = a.out / on.isoformat()
    day_dir.mkdir(parents=True, exist_ok=True)
    jobs = write_jobs(queue, a.brand.resolve())
    if a.render:
        for job, rc in render_jobs(jobs):
            if rc != 0:
                for q in queue:
                    if Path(q["image"]).with_suffix(".job.json") == job:
                        q["status"] = "render-failed"
    (day_dir / "queue.json").write_text(json.dumps({"date": on.isoformat(), "count": len(queue),
                                                   "sources": len(records), "items": queue}, indent=2), encoding="utf-8")
    print(f"{on.isoformat()}: {len(queue)} birthday(s) out of {len(records)} people -> {day_dir / 'queue.json'}")
    for q in queue:
        print(f"  - {q['name']} [{q['channel']}] {q['status']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
