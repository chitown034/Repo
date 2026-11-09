# ClearanceJobs scan

`clearancejobs_scan.py` reads ClearanceJobs' public search pages (San Diego and remote, across the management, finance, logistics, intelligence, systems-engineering, software and security categories), keeps postings that match a RoleCompass lane (`jobspy/lanes.json`), and writes a CSV in the same format as the JobSpy scan.

No login and no API key. Unlike the other job boards, ClearanceJobs is reachable from the Claude cloud environment, so this scan also runs in a cloud session or scheduled task, not only on your Mac.

```bash
python3 scanners/clearancejobs_scan.py                  # San Diego + remote, last 45 days
python3 scanners/clearancejobs_scan.py --max-age-days 14 --lanes navwar-pss
python3 scanners/clearancejobs_scan.py --locations san-diego-ca --all   # every listing, no lane filter
```

Two ways into RoleCompass:
- **CSV:** Jobs → "Import job-board results" → choose the file.
- **Saved scan:** a cloud session converts the CSV rows and writes them to the dashboard database at `scans/clearancejobs` (`{source, syncedAt, count, rows:[{lane, site, title, company, location, date, remote, interval, min, max, url, desc}]}`). The Jobs page then shows a "ClearanceJobs scan" banner with **Review and score**, and the nav badge counts postings not yet on the board.

Matching is deliberately loose (a lane title's words in the posting title, or a lane keyword); Claude's scoring on import decides fit. Listings are aggregator copies: confirm at the employer before applying.
