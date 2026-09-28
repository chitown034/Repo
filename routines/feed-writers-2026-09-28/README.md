# Feed writers — Steven's "make them update the dashboard" (2026-09-28)

Steven chose, 2026-09-28: *"Make them update the dashboard"* — every cloud routine that researches a dashboard
feed should end by **writing** its document, not by printing JSON nobody applies. The ten prompts in this folder
do that. **Status, corrected the same morning (08:20 UTC):**

- **Routines an agent creates CAN write the dashboard.** The first writer (created 07:38 UTC) wrote
  `weatherSnapshot` and `newsSnapshot` at 07:43 UTC — five minutes after its session *looked* idle. The
  integrator checked too early, read it as a failure and deleted it; that was wrong. (A one-line probe
  routine genuinely wrote nothing.) Lesson: check a routine's document after it finishes, not its session.
- **Its weather was wrong in a way the prompt must prevent:** at ~1 AM PT it wrote daytime "current"
  temperatures from yesterday's search snippets. The integrator overwrote both documents from AccuWeather
  (current conditions + today's forecast) and dated news, and recreated the writer with two rules: a current
  reading must be stamped within 2 hours (else the city is left out), and news dates must be exact.
- **The platform refuses agent edits to routines made in the web UI**, so the integrator recreated the
  writers as new routines (names end in "(writer)") and Steven switches the old ones off.

## What Steven does — about 5 minutes

1. Open **claude.ai/code/routines** and switch **off** these research-only routines (their writers now
   exist): *Command Deck — weather & news refresh*, *Econoday calendar refresh*, *top performers refresh*,
   *builder incentives refresh*, *PE & Defense Innovation daily refresh*, *Elite Rewards-Optimization Scan*,
   *Elite Affluent Tracker weekly refresh*, and the three duplicates: *Weather daily refresh*, *News daily
   refresh*, and the research-only *Command Deck ↔ ISA Portal — Pipeline Sync* (keep *Pipeline Sync (live,
   writes)*).
2. **Strava and calendar** need their connectors, which only your own routines carry: paste
   `03-strava.prompt.txt` into *Command Deck — Strava activity refresh* and `10-calendar.prompt.txt` into
   *Command Deck — calendar refresh* (copy the calendar-id table from its old prompt; the repo copy has the
   ids removed).
3. **Rates** (`02-mortgage-rates-market.prompt.txt`) waits until FRED, Freddie Mac and Redfin are allowed in
   the cloud environment (`docs/NEEDS-STEVEN.md` item 74) — without them it can only carry old numbers forward.

| Writer created 2026-09-28 (agent-owned) | Writes | Schedule (UTC) |
|---|---|---|
| Command Deck — weather & news (writer) | `weatherSnapshot`, `newsSnapshot` | 00:52, 13:52, 19:52 |
| Command Deck — Econoday note (writer) | `liveFeeds.feeds.econodayLiveList` | 12:44 |
| Command Deck — top performers note (writer) | `liveFeeds.feeds.topPerformersLiveList` | 13:26 |
| Command Deck — builder incentives note (writer) | `liveFeeds.feeds.builderIncentiveLiveList` | 13:53 |
| Command Deck — PE & Defense notes (writer) | `liveFeeds.feeds.pedefenseLiveList`, `defenseUpdatesList` | 13:47 |
| Command Deck — Elite Rewards scan note (writer) | `liveFeeds.feeds.elitScanLiveList` | 12:56 |
| Command Deck — Elite Affluent note (writer, weekly) | `liveFeeds.feeds.eliteAffluentLiveList` | Sun 15:51 |

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
