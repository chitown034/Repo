# JobSpy → RoleCompass

[JobSpy](https://github.com/speedyapply/JobSpy) scrapes Indeed, LinkedIn,
ZipRecruiter, Glassdoor and Google Jobs. `jobspy_scan.py` runs it once for each
RoleCompass search lane and writes a CSV that the dashboard imports.

## Run it (on your Mac)

```bash
pip install -r jobspy/requirements.txt
python3 jobspy/jobspy_scan.py                 # every active lane, last 72 hours
python3 jobspy/jobspy_scan.py --lanes navwar-pss,defense-tpm --hours-old 24 --fetch-description
```

Then open RoleCompass → **Jobs** → **Import JobSpy results** and choose the CSV.
The dashboard removes postings already on your board and skips anything on your
do-not-apply list. It then has Claude score the postings you tick and adds them
as *discovered*, *unverified* roles.

Useful flags: `--sites indeed,linkedin` · `--per-query 25` · `--max-titles 3` ·
`--proxies user:pass@host:port` (use this when LinkedIn returns 429) · `-o file.csv`.

## Lanes

`lanes.json` mirrors the dashboard's search profiles. Each lane has an `id`,
search `titles`, `locations` and `excludedTitles`. The `id` is written to every
row, so imported jobs land in the matching profile. Edit titles or locations here
to change what gets searched. Remote locations trigger a separate remote-only pass.

## Why it runs locally

Job boards block datacenter traffic, and the Claude cloud environment's network
policy refuses those hosts too. The script works there, but every board comes back
blocked. Run it from a home connection. For a hosted option, use the Apify actors
listed in RoleCompass → Resources → "Job data APIs" (from
[scraping-apis-for-devs](https://github.com/cporter202/scraping-apis-for-devs)).

## MCP server for Claude sessions

To give Claude Code sessions a job-search tool, add this server to `.mcp.json` (not committed yet): `{"mcpServers":{"jobspy":{"command":"uvx","args":["--from","python-jobspy[mcp]","mcp-jobspy"]}}}`. It registers JobSpy's own MCP server (`mcp-jobspy`).
Sessions opened in this repo can then run a
sweep conversationally.
