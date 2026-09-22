---
name: apple-health-notion
description: "Keep Steven's Command Deck Apple Health tiles alive through the phone instead of the dead Mac ingest daemon — Claude iOS reads Apple Health, writes a Notion Health Log row, and the health-notion-sync Mac task turns those rows into the appleHealth doc the tiles already render. Use when Steven asks to update/refresh his health stats, set up the Notion health dashboard, or when the Apple Health card is stale."
---

# apple-health-notion — Apple Health → Claude iOS → Notion → Command Deck

Status today (verified 2026-09-22): the old pipeline (Health Auto Export → LaunchAgent :8765 →
DuckDB → apple-health MCP) is **down**. The `appleHealth` doc's last real ingest is
`meta.last_received = 2026-09-13 14:30:40`, `syncedAt 2026-09-13T23:15:59Z` — 9 days stale.
`r8-apple-health-snapshot` (cron `10 5,21 * * *`) runs and writes nothing; last status **error**
2026-09-17.

**What exists now, precisely.** The Notion database is **real and empty**: "Health Log", database
`bc71c45aac934a4f8aeddc54345136ef`, data source `af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4`,
`https://app.notion.com/p/bc71c45aac934a4f8aeddc54345136ef`, 23 properties, Steven's **private**
workspace, zero rows on a read-only query 2026-09-22. The deck card `#healthNotionCard` is live off
the `healthNotionSync` doc. The Mac task is **spec only** and has never run. **The database and the
card are live; the sync and the data are not** — do not call this skill's output live until the
first phone run has happened.

Source note: the recipe this adapts (Jenna Redfield, "I Built an Automated Health Dashboard in
Claude (Apple Health Sync) Using Notion Data", The Optimization Toolbox, 2026-06-30) is
**egress-blocked from this sandbox** — `jennaredfield.substack.com` returns EGRESS_BLOCKED, verified
2026-09-22. The shape below comes from the engineering brief's summary plus web-search snippets of
that exact title; no line of the article was read. Say that if asked to cite it.

## Inputs
- iPhone: Claude iOS app, signed into Steven's account, with Apple Health read permission granted.
- Notion connector (connected + enabled on the claude.ai org). **Stage A (the phone) writes**:
  `notion-create-pages`, `notion-update-page`. **Stage B (the Mac task) is read-only**:
  `notion-query-data-sources`, `notion-fetch`, `notion-search` — and nothing else. The database
  already exists, so `notion-create-database` is not needed again by either stage.
- Command Deck artifact `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`, doc `appleHealth`.

## Outputs
- Notion **Health Log** rows (one page per day) — Stage A only; the database already exists.
- Deck `appleHealth`, in the **exact** shape `ahSnapshot()` / `renderAppleHealth()` read; deck
  `healthNotionSync`, the status the card renders; a run line in `healthSyncLog` (see Logging).

## Notion "Health Log" schema — read back from the live database 2026-09-22, never rename a property
| Notion property | Type | Unit written | → appleHealth metric key |
|---|---|---|---|
| **Day** | **Title** | YYYY-MM-DD, America/Los_Angeles | **the row key** and the `daily` day key |
| Date | Date | the same calendar day | sort/filter key; fall back to it if `Day` is blank |
| Steps | Number | count | `step_count` |
| Active Energy | Number | kcal | `active_energy` |
| Exercise Minutes | Number | min | `apple_exercise_time` |
| Flights Climbed | Number | count | `flights_climbed` |
| Walk+Run Distance | Number | mi | `walking_running_distance` |
| Resting HR | Number | bpm | `resting_heart_rate` |
| HRV | Number | ms | `heart_rate_variability` |
| VO2 Max | Number | mL/min/kg | `vo2_max` |
| Blood Oxygen | Number | % | `blood_oxygen_saturation` |
| Body Temperature | Number | degF | `body_temperature` |
| Weight | Number | lb | `weight_body_mass` |
| Mindful Minutes | Number | min | `mindful_minutes` |
| Sleep Total | Number | min | `sleep[].asleep_min` |
| Sleep Deep / Sleep REM / Sleep Core / Sleep Awake / Sleep In Bed | Number | min | `sleep[].deep_min` / `rem_min` / `core_min` / `awake_min` / `in_bed_min` |
| Workouts | Rich text (JSON array) | — | `workouts[]` rows |
| **Notes** | Rich text | — | **not mapped.** Never parsed, never rendered, never analysed |
| Source | Select | `claude-ios` \| `health-auto-export` \| `manual` | provenance only |

`Workouts` holds a JSON array of `{type, start_local, minutes, kcal, avg_hr, max_hr, source}`.
Leave a property **empty** when the phone has no value. Never write a zero to stand in for "unknown".
In SQL mode the date property is only reachable as `"date:Date:start"` / `"date:Date:end"` /
`"date:Date:is_datetime"`; `Date` by its plain name is not queryable. Rows mode sorts on `Date`.

## Procedure

### Stage A — the phone (Steven, ~20 seconds a day)
1. Open Claude on the iPhone.
2. Say: *"Update my health stats in Notion."*
3. Approve the Apple Health read prompt and the Notion write prompt.
4. Claude reads yesterday's and today's Apple Health values and appends/updates one Health Log row
   per date, keyed on the `Day` title (`YYYY-MM-DD`), with `Source: claude-ios`. If a metric is
   unavailable on the phone, it leaves the property empty and says which.

A skipped day writes no row and is never invented — see the closing block.

### Stage B — the Mac task `health-notion-sync` (automatic, twice daily)
1. **Self-test before anything else.** Query data source `af1ceecf-…` for the last 1 row, sorted by
   `Date` descending. Notion is **read-only** in this stage — never create, update or comment there.
   - Connector unreachable or unauthorised → status doc `not-configured` / `error`, stop.
     Do not touch `appleHealth`.
   - Database not found → status doc `not-created`, stop.
   - **Zero rows** (today's state) → status doc `awaiting-first-phone-run`, `rows:0`,
     `lastRowDate:null`, stop. Do not touch `appleHealth`, and do not treat empty as an error.
   - Newest row older than 48 h → `status:"stale"`, sync what exists, and say how old it is.
2. Read the last 90 days of Health Log rows (`notion-query-data-sources`, sorted by Date desc).
3. Read the existing `appleHealth` doc (`read_db` get, collection `state`).
4. Build the snapshot **in the deck's shape**:
   - `daily[<metric>][<YYYY-MM-DD>] = {sum, avg, min, max, last, n}` — for a once-a-day Notion value
     all five are that value and `n:1`.
   - `metrics[<metric>] = {metric, unit, latest, latest_at, avg7, min7, max7, sum7, n7, days7,
     pavg7, psum7, pdays7, samples, earliest}` computed over the last 7 days and the 7 days before
     that. `pavg7/psum7/pdays7` are `null` when the prior window has no rows — the tiles print
     "flat vs prior week" only when both exist, so a null is correct, a zero is a lie.
   - `sleep[] = {night, in_bed_min, asleep_min, core_min, deep_min, rem_min, awake_min}` sorted by
     `night` ascending. `workouts[]` sorted by `start` ascending, each with a stable `id`.
   - `meta = {last_received: <newest Health Log row's Date>, ingests: <rows synced>, db_now: <now>}`.
   - `syncedAt: <ISO now>`, `via: "notion-health-log"`, `read: "notion"`.
5. **Merge, never clobber.** Keep every `daily` day, `sleep` night (by `night`) and `workout`
   (by `id`) already in the doc that Notion did not supply; for a metric present in both, keep the
   entry with the newer `latest_at`, **compared as a parsed timestamp, not as a string**. Also keep:
   - the five metric keys Notion can never supply — `headphone_audio_exposure`,
     `walking_asymmetry_percentage`, `walking_double_support_percentage`, `walking_speed`,
     `walking_step_length`. Rebuilding `metrics` from Notion alone erases them.
   - `records` (object) and `sources` (array of `{metric, source, n, first_at, last_at}`) — two keys
     the live doc carries that a naive writer drops. Append to `sources`; do not replace it.
   - `dailyDays` — recompute it from the **merged** `daily`, not from Notion's days.

   The daemon's `daily` days **2026-09-06 → 2026-09-12** and its 3 workouts must still be there
   afterwards. If they are not, the merge is wrong — stop and fix it, do not ship it.

   **Formats, as the doc actually stores them** (do not "fix" these into ISO): `latest_at`,
   `workouts[].start`, `workouts[].start_local` are `"YYYY-MM-DD HH:MM:SS"`; `earliest` is
   `"YYYY-MM-DD"`; `meta.last_received` is `"YYYY-MM-DD HH:MM:SS.ffffff"`; only `syncedAt` is ISO-Z.
6. **If Notion supplied no row the doc does not already have, write nothing to `appleHealth`** — not
   even a re-stamped copy of itself. Only `healthNotionSync` moves. A day with no row is a gap:
   never backfill it, never carry a value forward into it, never stamp a day that has no data.
7. Otherwise write it back: `write_db` **set** (not update), collection `state`, doc `appleHealth`.
   **Every document in this DB is wrapped in `{v: …}`; a bare value is a bug** — one was found in
   `stravaSnapshot` on 2026-09-22. So:
   `{"v": {"metrics":{…}, "daily":{…}, "dailyDays":<n>, "sleep":[…], "workouts":[…], "records":{…},
   "sources":[…], "meta":{…}, "syncedAt":"<iso>", "via":"notion-health-log", "read":"notion"}}`
   — `{"metrics":{…}, …}` without the `v` wrapper is the bug, not a shortcut.
8. Write `healthNotionSync` (below) every run, then report one line: status, rows, metrics, days,
   nights, workouts, newest Health Log date.

### The status doc the deck card renders — write it every run
Doc `healthNotionSync`, also `{v: …}` wrapped:

```jsonc
{ "v": { "checkedAt":"<iso>", "status":"ok", "rows":<n>, "lastRowDate":"YYYY-MM-DD",
         "lastSyncAt":"<iso>", "error":null, "macTask":"health-notion-sync",
         /* carried forward unchanged: databaseId, dataSourceId, databaseUrl, title,
            properties: 23, phonePrompt, spec */ } }
```

`status` is **exactly one of** `ok` · `stale` · `not-configured` · `error` ·
`awaiting-first-phone-run` · `not-created`. That is the set `renderHealthNotionStatus()` knows;
anything else renders as nothing. `rows`, `lastRowDate` and `lastSyncAt` move every run.
On any failure, leave `appleHealth` exactly as it was — a tile showing 9-day-old data with an honest
"stale" badge beats a fresh-looking lie.

## The dead daemon — keep it, don't trust it
Leave Health Auto Export → :8765 → DuckDB installed as an **optional second source**; it is not a
dependency here. The failure to chase, if Steven wants it back, is the phone automation's POST URL —
a Reliability Engineer ticket, not a blocker for this skill.

## Guardrails
- Never invent, round-trip-estimate or carry forward a health value. Missing = empty = "—" on the tile.
- Never write `appleHealth` from a failed or empty Notion read.
- Stage B is **read-only against Notion**. It never creates, updates, comments on or deletes anything
  in the workspace, and it never writes a health value into a repo file.
- Every deck write is `{v: …}` wrapped. Check the wrapper before every `write_db`.
- No medical interpretation in this skill. Numbers only; `health-full-analysis` does analysis.
- Health data is personal. Keep it in Steven's own **private** Notion workspace and the Command Deck
  doc; never into the knowledge graph, never into the vector index, never into a shared or published
  page, never into a research prompt, never into an outside-model call.
- No API keys or tokens in prompts, task text or logs.

## HALT conditions (stop, write the status doc, ask Steven)
- The Health Log database (id above) cannot be found. It existed on 2026-09-22 — write
  `status:"not-created"` and ask Steven. Do not silently recreate it; a second Health Log splits the
  history and may land outside his private workspace.
- The connector asks for a permission Steven has not already granted.
- A Health Log row contains a value that is physically implausible (e.g. resting HR < 25 or > 200) —
  sync the rest, flag that field, do not silently drop or "correct" it.
- Anything that would delete existing `appleHealth` history.

## Logging
Append `{ts, task:"health-notion-sync", rows, newestRow, metrics, nights, workouts, status, error}`
to doc `healthSyncLog` (`read_db` get → treat missing as `[]` → `write_db` **set**), keep the last 200.

## Self-test (run after any change to this skill)
1. Query Health Log for 1 row → expect a row or an explicit "not found".
2. Build the snapshot from a 3-day fixture and assert: the payload's **top level is exactly `{v}`**,
   `metrics` non-empty, every `daily` key is `YYYY-MM-DD`, `sleep`/`workouts` are arrays of objects,
   `meta.last_received` is a date string.
3. Assert the merge kept a pre-existing day, a pre-existing workout `id`, the five daemon-only
   metric keys, and `records` / `sources`, none of which the fixture supplies.
4. Dry run with the Notion read forced to fail → assert `appleHealth` is untouched and
   `healthNotionSync.status === "error"` with the verbatim error.
5. Dry run with Notion returning zero rows → assert `appleHealth` untouched and
   `healthNotionSync.status === "awaiting-first-phone-run"`, `rows: 0`.
6. Assert every status written is one of the six allowed values, and that no Notion write verb was
   called in Stage B.

## The block Steven reads once

> **On your iPhone, once a day, about 20 seconds:**
> 1. Open **Claude**.
> 2. Say: **"Update my health stats in Notion."**
> 3. Approve the two prompts — the **Apple Health read**, then the **Notion write**.
>
> First time only, you will be asked to grant the permissions; after that it just runs.
> The Mac picks the rows up at 07:45 and 21:45 and the deck refreshes.
>
> **Skip a day and nothing breaks.** The tiles keep showing your last real day with its honest age
> ("3 days ago"), never a filled-in guess. Pick it up again whenever — the missed day stays blank
> rather than being invented.

Nothing in this chain can run until that first approval exists.
