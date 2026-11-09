#!/usr/bin/env python3
"""Scan ClearanceJobs public search pages and write a CSV that RoleCompass imports.

ClearanceJobs is the one job board this cloud environment can reach, so this
scan runs anywhere (cloud session, scheduled task, or your Mac). No login,
no API key: it reads the public location and category listing pages, which
is what the Sentinel ClearanceJobs feed already does daily.

Output columns match RoleCompass → Jobs → "Import JobSpy results":
lane, site, title, company, location, date_posted, job_type, is_remote,
interval, min_amount, max_amount, job_url_direct, job_url, description.

Lanes come from jobspy/lanes.json (one per RoleCompass search profile); a
listing is kept when its title matches a lane's titles or keywords and
does not match the lane's excluded titles. --all keeps every listing.

Examples:
    python3 scanners/clearancejobs_scan.py
    python3 scanners/clearancejobs_scan.py --max-age-days 14 -o cj.csv
    python3 scanners/clearancejobs_scan.py --locations san-diego-ca --all
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
UA = "Mozilla/5.0 (compatible; RoleCompassScan/1.0; personal job search)"
BASE = "https://www.clearancejobs.com/"
# Category slugs on ClearanceJobs that hold program-management, acquisition,
# finance, logistics and engineering-management postings.
DEFAULT_CATEGORIES = ["management", "finance", "logistics", "intelligence",
                      "engineering-systems", "it-software", "security"]
DEFAULT_LOCATIONS = ["san-diego-ca", "remote"]
COLUMNS = ["lane", "site", "title", "company", "location", "date_posted", "job_type",
           "is_remote", "interval", "min_amount", "max_amount", "job_url_direct",
           "job_url", "description"]
STOP = {"and", "or", "the", "of", "in", "a", "an", "for", "to", "senior", "sr", "lead",
        "principal", "staff", "ii", "iii", "iv", "1", "2", "3", "4", "specialist",
        "support", "assistant", "deputy", "junior", "jr", "i"}


def txt(x: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()


def fetch(path: str) -> str:
    req = urllib.request.Request(BASE + path, headers={"User-Agent": UA, "Accept": "text/html"})
    err: Exception | None = None
    for _ in range(2):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # retry once, then give up on this page
            err = e
            time.sleep(3)
    raise err  # type: ignore[misc]


def parse(page: str) -> list[dict]:
    out = []
    for p in page.split('<div class="job-search-list-item-v2">')[1:]:
        m = re.search(r'<a class="job-search-list-item-v2__title" href="/jobs/(\d{5,9})/([^"?]*)\?source=([a-z_]+)"[^>]*>([\s\S]*?)</a>', p)
        if not m or m.group(3) == "promoted_slots":
            continue
        comp = re.search(r'class="job-search-list-item-v2__company"[^>]*>([\s\S]*?)</(?:a|span)>', p)
        loc = re.search(r'class="job-search-list-item-v2__location"[^>]*>([\s\S]*?)</span>', p)
        tags = [txt(t) for t in re.findall(r'<span class="job-search-list-item-v2__tag[^"]*">([\s\S]*?)</span>', p)]
        prev = re.search(r'class="job-search-list-item-v2__preview"[^>]*>([\s\S]*?)</div>', p)
        b = p.find("__bottom")
        bottom = txt(p[b:b + 800]) if b >= 0 else ""
        posted = re.search(r"Posted (today|yesterday|over (\d+) months? ago|(\d+) (hour|day|week|month)s? ago)", bottom, re.I)
        out.append(dict(
            jid=m.group(1), slug=m.group(2), title=txt(m.group(4)),
            company=txt(comp.group(1)) if comp else "",
            location=txt(loc.group(1)) if loc else "",
            tags=tags, snippet=txt(prev.group(1))[:600] if prev else "", posted=posted,
        ))
    return out


def posted_date(m: re.Match | None, today: dt.date) -> str:
    if not m:
        return ""
    w = m.group(1).lower()
    if w == "today":
        d = 0
    elif w == "yesterday":
        d = 1
    elif w.startswith("over"):
        d = 30 * int(m.group(2)) + 15
    else:
        n = int(m.group(3))
        d = {"hour": 0, "day": n, "week": 7 * n, "month": 30 * n}[m.group(4).lower()]
    return (today - dt.timedelta(days=d)).isoformat()


def salary(tags: list[str]) -> tuple[str, str, str]:
    s = next((t for t in tags if "$" in t), None)
    if not s:
        return "", "", ""
    nums = [n.replace(",", "") for n in re.findall(r"\$([\d,]+)", s)]
    interval = "hourly" if re.search(r"/\s*h(ou)?r", s) else "yearly"
    lo = nums[0] if nums else ""
    hi = nums[1] if len(nums) > 1 else lo
    return interval, lo, hi


def clearance(tags: list[str]) -> str:
    for t in tags:
        if "$" in t or "yrs" in t.lower():
            continue
        return t
    return ""


def words(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9+/&-]+", s.lower()) if w not in STOP and len(w) > 1}


def lane_matcher(lane: dict):
    """Return a function listing -> True when the listing fits this lane."""
    title_sets = []
    for t in lane.get("titles", []):
        ws = words(re.sub(r"\(.*?\)", "", t))
        if ws:
            title_sets.append(ws)
    kws = [k.lower() for k in lane.get("keywords", []) if len(k) >= 4]
    excl = [x.lower() for x in lane.get("excludedTitles", [])]

    def match(title: str, snippet: str) -> bool:
        tl = title.lower()
        if any(x in tl for x in excl) or NOISE.search(tl):
            return False
        tw = words(title)
        if any(ts <= tw for ts in title_sets):
            return True
        if any(k in tl for k in kws):
            return True
        # keywords in the description count only for program-office style titles
        return bool(ROLE.search(tl)) and any(k in snippet.lower() for k in kws)
    return match


ROLE = re.compile(r"program|project|analyst|scheduler|acquisition|manager|director|lead|pm\b|apm\b")
NOISE = re.compile(r"\bintern\b|internship|software engineer|developer|technician|administrative assistant|foia")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--lanes", help="comma-separated lane ids (default: all active)")
    p.add_argument("--lanes-file", default=str(HERE.parent / "jobspy" / "lanes.json"))
    p.add_argument("--locations", default=",".join(DEFAULT_LOCATIONS), help="ClearanceJobs location slugs")
    p.add_argument("--categories", default=",".join(DEFAULT_CATEGORIES))
    p.add_argument("--max-age-days", type=int, default=45)
    p.add_argument("--all", action="store_true", help="keep every listing, not only lane matches")
    p.add_argument("-o", "--out", default=f"clearancejobs_{dt.date.today():%Y-%m-%d}.csv")
    args = p.parse_args()

    lanes = json.loads(Path(args.lanes_file).read_text())["lanes"]
    want = {x.strip() for x in args.lanes.split(",")} if args.lanes else None
    lanes = [l for l in lanes if (l["id"] in want if want else l.get("active", True))]
    lanes.sort(key=lambda l: l.get("priority") != "primary")
    matchers = [(l["id"], lane_matcher(l)) for l in lanes]

    today = dt.date.today()
    seen: dict[str, dict] = {}
    pages = errors = 0
    for loc in [x.strip() for x in args.locations.split(",") if x.strip()]:
        paths = [f"jobs/{loc}"] + [f"jobs/{c.strip()}/{loc}" for c in args.categories.split(",") if c.strip()]
        for path in paths:
            try:
                rows = parse(fetch(path))
                pages += 1
            except Exception as e:
                errors += 1
                print(f"  ! {path}: {e.__class__.__name__}", file=sys.stderr)
                continue
            for r in rows:
                seen.setdefault(r["jid"], r)
            print(f"  {len(rows):>3}  {path}")
            time.sleep(1.2)

    out = []
    for r in seen.values():
        date = posted_date(r["posted"], today)
        if date and (today - dt.date.fromisoformat(date)).days > args.max_age_days:
            continue
        lane = next((lid for lid, m in matchers if m(r["title"], r["snippet"])), "")
        if not lane and not args.all:
            continue
        interval, lo, hi = salary(r["tags"])
        loc = r["location"]
        remote = bool(re.search(r"remote", loc, re.I))
        desc = f"{r['snippet']} | Clearance: {clearance(r['tags']) or 'not stated'} | Tags: {', '.join(r['tags'])}"
        out.append(dict(lane=lane, site="clearancejobs", title=r["title"], company=r["company"], location=loc,
                        date_posted=date, job_type="", is_remote=str(remote), interval=interval,
                        min_amount=lo, max_amount=hi, job_url_direct="",
                        job_url=f"https://www.clearancejobs.com/jobs/{r['jid']}/{r['slug']}", description=desc))
    out.sort(key=lambda x: x["date_posted"], reverse=True)
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(out)
    print(f"\n{len(seen)} listings read from {pages} pages ({errors} errors); {len(out)} kept → {args.out}")
    print("In RoleCompass: Jobs → Import JobSpy results → choose this file.")
    return 0 if pages else 1


if __name__ == "__main__":
    sys.exit(main())
