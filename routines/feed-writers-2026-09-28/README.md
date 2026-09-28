# Feed writers — Steven's "make them update the dashboard" (2026-09-28)

Steven chose, 2026-09-28: *"Make them update the dashboard"* — every cloud routine that researches a dashboard
feed should end by **writing** its document, not by printing JSON nobody applies. The ten prompts in this folder
do that. **None is live yet**, for three reasons measured today:

1. **The platform refuses agent edits to routines made in the web UI** ("Agents can only update routines they
   created"). All ten feed routines were made in the web UI, so only Steven can paste these prompts in.
2. **Routines created by an agent cannot reach the dashboard's database today.** A new writer routine ran
   (07:38 UTC) and a one-line write probe ran (07:41 UTC); neither wrote anything — their sessions had no
   database tool. The last successful cloud write was the feed-freshness watchdog, 2026-09-24 16:30 UTC.
   Both test routines were deleted.
3. **Whether a web-UI routine can write is untested.** A one-run test on one of Steven's routines was refused by
   the session's safety check (it would modify a shared resource), so that test is Steven's to run.

## What Steven does — about 5 minutes, test first

1. Open **claude.ai/code/routines** → **Command Deck — weather & news refresh** → replace its prompt with
   `01-weather-news.prompt.txt` → save → **Run now**.
2. When it finishes, open the Command Deck: the weather card's stamp should read **today**.
   - **It does** → paste the other nine the same way (table below), then switch off the four duplicates.
   - **It does not** → stop; cloud routines cannot write on this account right now. The Mac runner is the
     working writer path: `docs/NEEDS-STEVEN.md` items 63 and 72 (`runnerctl status` → `runnerctl logs
     fabric-deck-sync` → `runnerctl restart`).

| File | Paste into the routine named | Schedule (unchanged) |
|---|---|---|
| `01-weather-news.prompt.txt` | Command Deck — weather & news refresh | 5× a day |
| `02-mortgage-rates-market.prompt.txt` | Command Deck — mortgage rates & market refresh (writes both dashboards) | daily |
| `03-strava.prompt.txt` | Command Deck — Strava activity refresh | 2× a day |
| `04-econoday.prompt.txt` | Command Deck — Econoday calendar refresh | daily |
| `05-top-performers.prompt.txt` | Command Deck — top performers refresh | daily |
| `06-builder-incentives.prompt.txt` | Command Deck — builder incentives refresh | daily |
| `07-pe-defense.prompt.txt` | Command Deck — PE & Defense Innovation daily refresh | daily |
| `08-elite-rewards-scan.prompt.txt` | Command Deck — Elite Rewards-Optimization Scan | daily |
| `09-elite-affluent.prompt.txt` | Command Deck — Elite Affluent Tracker weekly refresh | weekly |
| `10-calendar.prompt.txt` | Command Deck — calendar refresh (copy the calendar-id table from its old prompt; the repo copy has the ids removed) | 2× a day |

**Switch off after step 2 succeeds** (duplicates of the writers above): *Command Deck — Weather daily refresh*,
*Command Deck — News daily refresh*, and the research-only *Command Deck ↔ ISA Portal — Pipeline Sync* (keep
*Pipeline Sync (live, writes)*).

## What changed from the old prompts

- Each ends with a WRITE STEP: read the document and its version, research, then write it pinned to that
  version (a conflict re-reads and retries once). A document whose research failed is not written — an old
  document beats a guessed one.
- The six writers that share the `liveFeeds` document send **only their own entry** with `update` — a deep merge,
  measured on this database 2026-09-28 — never the whole document.
- Weather and news cover the 7 and 10 cities the live documents hold. Rates target the real `ratesSnapshot` shape
  on both dashboards. The legacy CRM calendar is labelled "Legacy CRM".
- FRED, Freddie Mac and Redfin are blocked by the cloud environment's network policy, so the rates writer falls
  back to web search until those domains are allowed (`docs/NEEDS-STEVEN.md` item 74).
- The old prompts, unchanged, are the undo record (kept in the integrator's scratch copy of all 66 routines).
