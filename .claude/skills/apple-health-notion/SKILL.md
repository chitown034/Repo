---
name: apple-health-notion
description: "Keep Steven's Command Deck Apple Health tiles alive through the phone instead of the dead Mac ingest daemon — Claude iOS reads Apple Health, writes a Notion Health Log row, and the health-notion-sync Mac task turns those rows into the appleHealth doc the tiles already render. Use when Steven asks to update/refresh his health stats, set up the Notion health dashboard, or when the Apple Health card is stale."
---

# apple-health-notion — Apple Health → Claude iOS → Notion → Command Deck

Status today (verified 2026-09-22): the old pipeline (Health Auto Export → LaunchAgent :8765 →
DuckDB → apple-health MCP) is **down**. The `appleHealth` doc's last real ingest is
`meta.last_received = 2026-09-13 14:30:40`, `syncedAt 2026-09-13T23:15:59Z` — 9 days stale.
`r8-apple-health-snapshot` (cron `10 5,21 * * *`) runs and writes nothing; last status **error**
2026-09-17. Do not describe this skill's output as "live" until the first phone run has happened.

Source note: the recipe this adapts (Jenna Redfield, "I Built an Automated Health Dashboard in
Claude (Apple Health Sync) Using Notion Data", The Optimization Toolbox, 2026-06-30) is
**egress-blocked from this sandbox** — `jennaredfield.substack.com` returns EGRESS_BLOCKED, verified
2026-09-22. The shape below comes from the engineering brief's summary plus web-search snippets of
that exact title; no line of the article was read. Say that if asked to cite it.

## Inputs
- iPhone: Claude iOS app, signed into Steven's account, with Apple Health read permission granted.
- Notion connector (connected + enabled on the claude.ai org): `notion-create-database`,
  `notion-create-pages`, `notion-query-data-sources`, `notion-fetch`.
- Command Deck artifact `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`, doc `appleHealth`.

## Outputs
- Notion database **Health Log** (one page per day).
- Command Deck `appleHealth` doc, in the **exact** shape `ahSnapshot()` / `renderAppleHealth()` read.
- `health-notion-sync` run log line (see Logging).

## Notion "Health Log" schema (create once, then never rename a property)
| Notion property | Type | Unit written | → appleHealth metric key |
|---|---|---|---|
| Date | Date (title or date) | YYYY-MM-DD, America/Los_Angeles | the `daily` day key |
| Steps | Number | count | `step_count` |
| Active Energy | Number | kcal | `active_energy` |
| Exercise Minutes | Number | min | `apple_exercise_time` |
| Flights Climbed | Number | count | `flights_climbed` |
| Walk+Run Distance | Number | mi | `walking_running_distance` |
| Resting HR | Number | bpm | `resting_heart_rate` |
| HRV | Number | ms | `heart_rate_variability` |
| VO2 Max | Number | mL/min·kg | `vo2_max` |
| Blood Oxygen | Number | % | `blood_oxygen_saturation` |
| Body Temperature | Number | degF | `body_temperature` |
| Weight | Number | lb | `weight_body_mass` |
| Mindful Minutes | Number | min | `mindful_minutes` |
| Sleep Total | Number | min | `sleep[].asleep_min` |
| Sleep Deep / REM / Core / Awake / In Bed | Number | min | `sleep[].deep_min` / `rem_min` / `core_min` / `awake_min` / `in_bed_min` |
| Workouts | Rich text (JSON array) | — | `workouts[]` rows |
| Source | Select | `claude-ios` | provenance only |

`Workouts` holds a JSON array of `{type, start_local, minutes, kcal, avg_hr, max_hr, source}`.
Leave a property **empty** when the phone has no value. Never write a zero to stand in for "unknown".

## Procedure

### Stage A — the phone (Steven, ~20 seconds a day)
1. Open Claude on the iPhone.
2. Say: *"Update my health stats in Notion."*
3. Approve the Apple Health read prompt and the Notion write prompt.
4. Claude reads yesterday's and today's Apple Health values and appends/updates one Health Log row
   per date. If a metric is unavailable on the phone, it leaves the property empty and says which.

### Stage B — the Mac task `health-notion-sync` (automatic, twice daily)
1. **Self-test before anything else.** Query the Health Log data source for the last 1 row.
   - Notion connector unreachable, or the database is not found → write the honest status doc
     (below) and stop. Do not touch `appleHealth`.
   - Query succeeds but the newest row is older than 48 h → still write the status doc with
     `status:"stale"`, sync what exists, and say how old it is.
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
   entry with the newer `latest_at`. The dead daemon's Sep 6–13 history stays visible.
6. Write it back: `write_db` **set** (not update), collection `state`, doc `appleHealth`, `{v: snapshot}`.
7. Report one line: metrics, days, nights, workouts, and the newest Health Log date.

### Honest status on failure (write this, never a fabricated snapshot)
Write doc `appleHealthSync` = `{v:{checkedAt, status:"ok"|"stale"|"not-configured"|"error",
error:string|null, source:"Notion Health Log via connector", rows:number|null, newestRow:string|null,
fix:"Open Claude on the iPhone and say 'update my health stats in Notion'"}}` and leave `appleHealth`
exactly as it was. A tile showing 9-day-old data with an honest "stale" badge beats a fresh-looking lie.

## The dead daemon — keep it, don't trust it
Leave Health Auto Export → :8765 → DuckDB installed as an **optional second source**. It is not the
fix and it is not a dependency of this skill. If Steven wants it back, the failure to chase is the
phone automation's POST URL (the Mac's LAN address changed or the LaunchAgent is not listening on
8765) — that is a separate ticket, owned by the Reliability Engineer, not a blocker here.

## Guardrails
- Never invent, round-trip-estimate or carry forward a health value. Missing = empty = "—" on the tile.
- Never write `appleHealth` from a failed or empty Notion read.
- No medical interpretation in this skill. Numbers only; `health-full-analysis` does analysis.
- Health data is personal. Keep it in Steven's own Notion workspace and the Command Deck doc; never
  into the knowledge graph, never into a shared/public page, never into a research prompt.
- No API keys or tokens in prompts, task text or logs.

## HALT conditions (stop, write the status doc, ask Steven)
- The Notion Health Log database does not exist and creating one would land outside Steven's private
  workspace.
- The connector asks for a permission Steven has not already granted.
- A Health Log row contains a value that is physically implausible (e.g. resting HR < 25 or > 200) —
  sync the rest, flag that field, do not silently drop or "correct" it.
- Anything that would delete existing `appleHealth` history.

## Logging
Append `{ts, task:"health-notion-sync", rows, newestRow, metrics, nights, workouts, status, error}`
to doc `healthSyncLog` (`read_db` get → treat missing as `[]` → `write_db` **set**), keep the last 200.

## Self-test (run after any change to this skill)
1. Query Health Log for 1 row → expect a row or an explicit "not found".
2. Build the snapshot from a 3-day fixture and assert: `metrics` non-empty, every `daily` key is
   `YYYY-MM-DD`, `sleep`/`workouts` are arrays of objects, `meta.last_received` is a date string.
3. Assert the merge kept a pre-existing day the fixture lacked.
4. Dry run with the Notion read forced to fail → assert `appleHealth` is untouched and
   `appleHealthSync.status === "error"`.

## The one line Steven has to do
**Open Claude on your iPhone, say "update my health stats in Notion", and approve the Apple Health
read + Notion write prompts once.** Nothing in this chain can run until that first approval exists.
