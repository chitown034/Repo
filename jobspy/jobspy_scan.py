#!/usr/bin/env python3
"""Sweep job boards with JobSpy and write a CSV that RoleCompass imports.

RoleCompass (Jobs -> "Import JobSpy results") reads these columns:
lane, site, title, company, location, date_posted, job_type, is_remote,
interval, min_amount, max_amount, job_url_direct, job_url, description.

Lanes come from lanes.json (one per RoleCompass search profile), so each row
is tagged with the profile it belongs to.

Examples:
    python3 jobspy_scan.py                         # all active lanes, last 72h
    python3 jobspy_scan.py --lanes navwar-pss,defense-tpm --hours-old 24
    python3 jobspy_scan.py --sites indeed,linkedin --per-query 25 -o scan.csv
    python3 jobspy_scan.py --proxies user:pass@host:port   # if a board blocks you
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import date
from pathlib import Path

import pandas as pd
from jobspy import scrape_jobs

HERE = Path(__file__).resolve().parent
DEFAULT_SITES = ["indeed", "linkedin", "zip_recruiter", "google"]
COLUMNS = [
    "lane", "site", "title", "company", "location", "date_posted", "job_type",
    "is_remote", "interval", "min_amount", "max_amount", "job_url_direct",
    "job_url", "description",
]

# RoleCompass location labels -> a place JobSpy can search around.
LOCATION_MAP = {
    "san diego": "San Diego, CA",
    "san diego county": "San Diego, CA",
    "socal": "San Diego, CA",
    "temecula / socal hybrid": "Temecula, CA",
    "temecula / murrieta": "Temecula, CA",
    "poway / rancho bernardo": "Poway, CA",
    "orange county": "Irvine, CA",
    "coronado": "Coronado, CA",
}


def clean_title(t: str) -> str:
    """'Program Manager (GS-0340)' -> 'Program Manager'."""
    return re.sub(r"\s*\(.*?\)", "", t).strip()


def lane_searches(lane: dict) -> tuple[list[str], list[str], bool]:
    titles = list(dict.fromkeys(clean_title(t) for t in lane.get("titles", []) if t))
    places, remote = [], False
    for loc in lane.get("locations", []):
        key = loc.strip().lower()
        if key.startswith("remote"):
            remote = True
        elif key in LOCATION_MAP:
            places.append(LOCATION_MAP[key])
        elif key:
            places.append(loc)
    return titles, list(dict.fromkeys(places)), remote


def run_one(sites, term, location, remote, args) -> pd.DataFrame:
    where = "remote" if remote else location
    kw = dict(
        site_name=sites,
        search_term=term,
        google_search_term=f"{term} jobs {'remote' if remote else 'near ' + location}"
        f" since {max(1, args.hours_old // 24)} days ago",
        location=None if remote else location,
        distance=args.distance,
        is_remote=remote,
        results_wanted=args.per_query,
        hours_old=args.hours_old,
        country_indeed="USA",
        description_format="markdown",
        fetch_description=args.fetch_description,
        verbose=0,
    )
    if args.proxies:
        kw["proxies"] = args.proxies.split(",")
    try:
        df = scrape_jobs(**kw)
    except Exception as e:  # one bad board or query shouldn't sink the sweep
        print(f"  ! {term} @ {where}: {e}", file=sys.stderr)
        return pd.DataFrame()
    for site, err in (getattr(df, "attrs", {}) or {}).get("errors", {}).items():
        print(f"  ! {site} ({term} @ {where}): {err}", file=sys.stderr)
    print(f"  {len(df):>3}  {term} @ {where}")
    return df


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--lanes", help="comma-separated lane ids (default: all active)")
    p.add_argument("--lanes-file", default=str(HERE / "lanes.json"))
    p.add_argument("--sites", default=",".join(DEFAULT_SITES),
                   help="indeed,linkedin,zip_recruiter,glassdoor,google")
    p.add_argument("--hours-old", type=int, default=72)
    p.add_argument("--per-query", type=int, default=15, help="results per site per search")
    p.add_argument("--distance", type=int, default=50, help="miles")
    p.add_argument("--max-titles", type=int, default=0, help="cap titles per lane (0 = all)")
    p.add_argument("--fetch-description", action="store_true",
                   help="fetch full descriptions (slower; better scoring in RoleCompass)")
    p.add_argument("--proxies", help="comma-separated user:pass@host:port")
    p.add_argument("-o", "--out", default=f"jobspy_{date.today():%Y-%m-%d}.csv")
    args = p.parse_args()

    lanes = json.loads(Path(args.lanes_file).read_text())["lanes"]
    want = {x.strip() for x in args.lanes.split(",")} if args.lanes else None
    lanes = [l for l in lanes if (l["id"] in want if want else l.get("active", True))]
    if not lanes:
        print("No matching lanes in", args.lanes_file, file=sys.stderr)
        return 2
    sites = [s.strip() for s in args.sites.split(",") if s.strip()]

    frames = []
    for lane in lanes:
        titles, places, remote = lane_searches(lane)
        if args.max_titles:
            titles = titles[: args.max_titles]
        excl = [x.lower() for x in lane.get("excludedTitles", [])]
        print(f"[{lane['id']}] {lane['name']}")
        for term in titles:
            runs = [(pl, False) for pl in places] + ([(None, True)] if remote else [])
            for place, is_remote in runs:
                df = run_one(sites, term, place, is_remote, args)
                if df.empty:
                    continue
                if excl:
                    df = df[~df["title"].fillna("").str.lower().apply(lambda t: any(e in t for e in excl))]
                df = df.assign(lane=lane["id"])
                frames.append(df)
                time.sleep(1)  # be polite; LinkedIn and Glassdoor rate-limit bursts

    if not frames:
        print("No postings found (or every board blocked the request).", file=sys.stderr)
        return 1
    out = pd.concat(frames, ignore_index=True)
    out = out.drop_duplicates(subset=["job_url"]).drop_duplicates(subset=["company", "title", "location"])
    for c in COLUMNS:
        if c not in out.columns:
            out[c] = None
    out = out[COLUMNS]
    out.to_csv(args.out, index=False)
    print(f"\nWrote {len(out)} postings to {args.out}. "
          "In RoleCompass: Jobs -> Import JobSpy results -> choose this file.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
