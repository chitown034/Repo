#!/usr/bin/env python3
"""Search LinkedIn Jobs with your own logged-in session and write a RoleCompass CSV.

Uses joeyism/linkedin_scraper (Playwright). Runs on your Mac only: it needs a
browser and a saved LinkedIn session (linkedin/create_session.py makes one),
and the Claude cloud environment cannot reach linkedin.com.

Each lane's titles are searched in each lane location, then every result's
posting page is opened for title, company, location, date and description.
That is one page load per job, so keep --per-query small (default 8) and
expect LinkedIn to throttle long runs. Automated reading of LinkedIn with a
logged-in account is against LinkedIn's terms and can get the account
restricted: run it occasionally, at human pace, on an account you accept
that risk for.

Output columns match RoleCompass → Jobs → "Import JobSpy results".

Examples:
    python3 linkedin/linkedin_scan.py --lanes navwar-pss,defense-tpm
    python3 linkedin/linkedin_scan.py --per-query 5 --max-titles 2 -o li.csv
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import datetime as dt
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
COLUMNS = ["lane", "site", "title", "company", "location", "date_posted", "job_type",
           "is_remote", "interval", "min_amount", "max_amount", "job_url_direct",
           "job_url", "description"]
LOCATION_MAP = {
    "san diego": "San Diego, California, United States",
    "san diego county": "San Diego, California, United States",
    "socal": "San Diego, California, United States",
    "temecula / socal hybrid": "Temecula, California, United States",
    "temecula / murrieta": "Temecula, California, United States",
    "poway / rancho bernardo": "San Diego, California, United States",
    "orange county": "Irvine, California, United States",
    "coronado": "San Diego, California, United States",
}


def rel_date(s: str | None, today: dt.date) -> str:
    """'3 days ago' / '2 weeks ago' / 'Reposted 1 month ago' -> ISO date."""
    if not s:
        return ""
    m = re.search(r"(\d+)\s*(hour|day|week|month)", s.lower())
    if not m:
        return ""
    n = int(m.group(1))
    days = {"hour": 0, "day": n, "week": 7 * n, "month": 30 * n}[m.group(2)]
    return (today - dt.timedelta(days=days)).isoformat()


def lane_searches(lane: dict) -> tuple[list[str], list[str]]:
    titles = list(dict.fromkeys(re.sub(r"\s*\(.*?\)", "", t).strip() for t in lane.get("titles", []) if t))
    places = []
    for loc in lane.get("locations", []):
        key = loc.strip().lower()
        if key.startswith("remote"):
            places.append("United States")  # LinkedIn has no "remote" location; filter below
        else:
            places.append(LOCATION_MAP.get(key, loc))
    return titles, list(dict.fromkeys(places))


async def run(args) -> int:
    try:
        from linkedin_scraper.core.browser import BrowserManager
        from linkedin_scraper.scrapers.job import JobScraper
        from linkedin_scraper.scrapers.job_search import JobSearchScraper
    except ImportError:
        print("Install first:  pip install -r linkedin/requirements.txt && playwright install chromium", file=sys.stderr)
        return 2
    if not Path(args.session).exists():
        print(f"No session file at {args.session}. Run:  python3 linkedin/create_session.py", file=sys.stderr)
        return 2

    lanes = json.loads(Path(args.lanes_file).read_text())["lanes"]
    want = {x.strip() for x in args.lanes.split(",")} if args.lanes else None
    lanes = [l for l in lanes if (l["id"] in want if want else l.get("active", True))]
    today = dt.date.today()
    rows: dict[str, dict] = {}

    async with BrowserManager(headless=not args.headful) as browser:
        await browser.load_session(args.session)
        search = JobSearchScraper(browser.page)
        detail = JobScraper(browser.page)
        for lane in lanes:
            titles, places = lane_searches(lane)
            if args.max_titles:
                titles = titles[: args.max_titles]
            excl = [x.lower() for x in lane.get("excludedTitles", [])]
            print(f"[{lane['id']}] {lane['name']}")
            for term in titles:
                for place in places:
                    try:
                        urls = await search.search(keywords=term, location=place, limit=args.per_query)
                    except Exception as e:
                        print(f"  ! {term} @ {place}: {e}", file=sys.stderr)
                        continue
                    new = [u for u in urls if u not in rows]
                    print(f"  {len(urls):>3} ({len(new)} new)  {term} @ {place}")
                    for url in new:
                        try:
                            job = await detail.scrape(url)
                        except Exception as e:
                            print(f"  ! {url}: {e}", file=sys.stderr)
                            continue
                        title = job.job_title or ""
                        if not title or any(x in title.lower() for x in excl):
                            continue
                        loc = job.location or ""
                        rows[url] = dict(
                            lane=lane["id"], site="linkedin", title=title, company=job.company or "",
                            location=loc, date_posted=rel_date(job.posted_date, today), job_type="",
                            is_remote=str(bool(re.search(r"remote", loc + " " + (job.job_description or "")[:400], re.I))),
                            interval="", min_amount="", max_amount="", job_url_direct="", job_url=url,
                            description=(job.job_description or "")[:6000])
                        await asyncio.sleep(args.pause)
    out = list(rows.values())
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(out)
    print(f"\nWrote {len(out)} postings to {args.out}. In RoleCompass: Jobs → Import JobSpy results → choose this file.")
    return 0 if out else 1


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--lanes", help="comma-separated lane ids (default: all active)")
    p.add_argument("--lanes-file", default=str(HERE.parent / "jobspy" / "lanes.json"))
    p.add_argument("--session", default=str(HERE / "linkedin_session.json"))
    p.add_argument("--per-query", type=int, default=8, help="job pages opened per search")
    p.add_argument("--max-titles", type=int, default=0, help="cap titles per lane (0 = all)")
    p.add_argument("--pause", type=float, default=3.0, help="seconds between job pages")
    p.add_argument("--headful", action="store_true", help="show the browser window")
    p.add_argument("-o", "--out", default=f"linkedin_{dt.date.today():%Y-%m-%d}.csv")
    return asyncio.run(run(p.parse_args()))


if __name__ == "__main__":
    sys.exit(main())
