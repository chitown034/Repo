# Apple Health → Claude iOS → Notion → Command Deck

**Baseline 2026-09-12 · verified 2026-09-22.** Owner: Integration Engineer (under CTO Innovator).

## What is live, precisely (2026-09-22)

| Piece | State |
|---|---|
| Notion database **Health Log** | **created and verified.** `https://app.notion.com/p/bc71c45aac934a4f8aeddc54345136ef` · database id `bc71c45aac934a4f8aeddc54345136ef` · data source `af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4` · 23 properties · Steven's **private** workspace |
| Rows in it | **zero.** Read back empty by a read-only query on 2026-09-22. No row exists until Steven runs the phone step |
| Deck card `#healthNotionCard` | **live** — `renderHealthNotionStatus()` renders it from the `healthNotionSync` doc |
| Deck doc `healthNotionSync` | **written** — carries the url + both ids, `rows: 0`, `status: "awaiting-first-phone-run"` |
| The "via" badge label | **done** — `notion-health-log` and `scheduled-sync` now render as themselves |
| Mac task `health-notion-sync` | **spec only.** Not installed, not scheduled, never run — `integrations/mac-task-specs.md` §3 |
| `appleHealth` doc (the twelve tiles) | **untouched — still the dead daemon's data.** `meta.last_received 2026-09-13 14:30:40`, `via:"scheduled-sync"`, `read:"daemon"`, 11 metric keys, `daily` days 2026-09-06 → 2026-09-12, 3 workouts, `sleep: []` |

**The database and the card are real; the sync and the data are not.** The tiles keep showing
2026-09-13 with an honest age until Steven's first phone run *and* the Mac task both exist.

## Source, honestly
The recipe this adapts is Jenna Redfield, *"I Built an Automated Health Dashboard in Claude (Apple
Health Sync) Using Notion Data"* (The Optimization Toolbox, 2026-06-30). **The article itself is
unreachable from here** — `jennaredfield.substack.com` is blocked by this sandbox's egress proxy
(EGRESS_BLOCKED, verified 2026-09-22), and You.com is retired as of 2026-09-22. What follows is
built from the engineering brief's summary of it plus WebSearch snippets for that exact title
(the search result confirms the flow: open Claude on the phone → ask it to update health stats →
approve → Claude sends the stats to Notion databases → dashboards read Notion). No line of the
article was read. There is also a YouTube walkthrough of the same title if Steven wants the video.

## Why we are replacing the pipeline, not repairing it
The existing chain is Health Auto Export (iPhone) → ingest daemon on the Mac (LaunchAgent, port
8765) → DuckDB → `apple-health` MCP → `r8-apple-health-snapshot` → `appleHealth` doc.

| Fact | Evidence |
|---|---|
| The daemon is not responding | Mac runner: `r8-apple-health-snapshot` (`10 5,21 * * *`) last status **error**, last end 2026-09-17 |
| The data is 9 days stale | `appleHealth.meta.last_received = 2026-09-13 14:30:40`; `syncedAt 2026-09-13T23:15:59Z` |
| The task runs and writes nothing | Runner shows it executing on schedule with no doc update |
| It depends on four things being up | phone automation → Drive → Mac awake → daemon listening → DuckDB |

The phone path depends on **one** thing: the phone. That is the whole argument.

## The chain
```
Apple Health (iPhone)
   └─ Claude iOS app reads it on-device, with Steven's permission
        └─ writes one row per day into Notion DB "Health Log"
             └─ Mac task health-notion-sync (Notion connector, read-only)
                  └─ Command Deck doc  appleHealth   {v:{metrics, daily, sleep, workouts, meta, …}}
                       └─ the twelve existing Health tiles (#ahGrid) — unchanged code
```
Nothing on the deck changes shape. `ahSnapshot()` / `renderAppleHealth()` keep reading the same doc;
only who fills it changes.

## Notion "Health Log" database — schema read back from the real database, 2026-09-22
One page per calendar day, `America/Los_Angeles`. It already exists (ids above); it was created
through the Notion connector inside Steven's private workspace. **The table below is the live
schema, read back out of data source `af1ceecf-…`, not the plan.** All 23 properties:

| Property | Type | Unit | Notes |
|---|---|---|---|
| **Day** | **Title** | — | `YYYY-MM-DD`. **This is the row key** — the title property, not `Date` |
| Date | Date | — | the calendar day the row covers; the sortable/filterable copy of `Day` |
| Steps | Number | count | day total |
| Active Energy | Number | kcal | day total |
| Exercise Minutes | Number | min | day total |
| Flights Climbed | Number | count | day total |
| Walk+Run Distance | Number | mi | day total |
| Resting HR | Number | bpm | daily value |
| HRV | Number | ms | SDNN, daily average |
| VO2 Max | Number | mL/min/kg | latest reading |
| Blood Oxygen | Number | % | daily average |
| Body Temperature | Number | degF | daily average |
| Weight | Number | lb | latest reading |
| Mindful Minutes | Number | min | day total |
| Sleep Total | Number | min | asleep minutes |
| Sleep Deep / Sleep REM / Sleep Core / Sleep Awake / Sleep In Bed | Number | min | five separate properties, those exact names |
| Workouts | Rich text | JSON | `[{type,start_local,minutes,kcal,avg_hr,max_hr,source}]` |
| Notes | Rich text | — | whatever the phone flagged. Numbers and flags only — **no medical interpretation** |
| Source | Select | — | `claude-ios` · `health-auto-export` · `manual` |

**Three things the real database says that the first draft of this table did not** (the real
database wins; this table has been corrected to match it):
1. The row key is the **`Day` title property**, not `Date`. `Date` exists as well — both are written,
   and the sync keys off `Day`, falling back to `Date` if a row's title is blank.
2. There is a **`Notes`** rich-text property. It is not mapped to any tile and is never parsed.
3. **`Source` has three options**, not one: `claude-ios`, `health-auto-export`, `manual`.

**Empty means unknown.** A metric the phone cannot read leaves the property blank. Never a zero.

Querying it in SQL mode: the date property is exposed as the expanded columns
`"date:Date:start"` / `"date:Date:end"` / `"date:Date:is_datetime"` — `Date` itself is not queryable
by its plain name. Rows mode sorts on `Date` normally.

## Mapping into the `appleHealth` doc (what the tiles actually read)
The tiles bucket metrics by regex into twelve categories and look up display labels by metric key,
so the **key names below are not negotiable** — they are what `AH_LABELS` / `AH_PRIORITY` already know.

| Notion property | `appleHealth` metric key | Category tile | Cumulative? |
|---|---|---|---|
| Steps | `step_count` | Activity | yes — needs a `daily` day total |
| Active Energy | `active_energy` | Activity | yes |
| Exercise Minutes | `apple_exercise_time` | Activity | yes |
| Flights Climbed | `flights_climbed` | Activity | yes |
| Walk+Run Distance | `walking_running_distance` | Activity | yes |
| Weight | `weight_body_mass` | Body Measurements | no |
| Resting HR | `resting_heart_rate` | Heart | no |
| HRV | `heart_rate_variability` | Heart | no |
| VO2 Max | `vo2_max` | Heart | no |
| Blood Oxygen | `blood_oxygen_saturation` | Respiratory | no |
| Body Temperature | `body_temperature` | Vitals | no |
| Mindful Minutes | `mindful_minutes` | Mindfulness | yes |
| Sleep * | `sleep[]` rows, not a metric | Sleep | — |
| Workouts | `workouts[]` rows | Activity | — |
| **Day** / **Date** | not a metric — the `daily` day key and each row's date | — | — |
| **Notes** | **not mapped.** Never parsed, never rendered, never analysed | — | — |
| **Source** | not mapped — provenance only | — | — |

Shapes, copied from what the page already parses:
- `metrics[key] = {metric, unit, latest, latest_at, avg7, min7, max7, sum7, n7, days7, pavg7, psum7,
  pdays7, samples, earliest}` — `pavg7/psum7/pdays7` are `null` when the prior 7-day window is empty
  (the tile then omits the "vs prior week" delta, which is the correct behaviour).
- `daily[key]["YYYY-MM-DD"] = {sum, avg, min, max, last, n}`.
- `sleep[] = {night, in_bed_min, asleep_min, core_min, deep_min, rem_min, awake_min}`, ascending by night.
- `workouts[] = {id, type, start, start_local, minutes, kcal, km, avg_hr, max_hr, source}`, ascending by start.
- `meta = {last_received, ingests, db_now}` — drives the "Last export received …" badge and the
  stale-health alert (warn past 2 days, critical past 7).
- `syncedAt` ISO, `via:"notion-health-log"`, `read:"notion"`.

**Three keys the live doc carries that this spec did not list** (read back 2026-09-22, doc version 11):
`dailyDays` (integer, currently `7` — the count of distinct days in `daily`), `records` (object,
currently `{}`) and `sources` (array of `{metric, source, n, first_at, last_at}`, currently 12 entries
naming the devices the daemon ingested from). A writer that emits only the documented keys
**silently deletes all three.** Carry them forward; recompute `dailyDays` from the merged `daily`; append to `sources`
rather than replacing it.

**Timestamp formats are not ISO and must not be "fixed" into ISO.** As the doc actually stores them:
`metrics[].latest_at`, `workouts[].start` and `workouts[].start_local` are `"YYYY-MM-DD HH:MM:SS"`
(a space, no `T`, no `Z`); `metrics[].earliest` is a bare `"YYYY-MM-DD"`; `meta.last_received` is
`"YYYY-MM-DD HH:MM:SS.ffffff"`; only `syncedAt` is ISO-with-`Z`. The merge tie-break compares
`latest_at` **as a parsed timestamp**, never as a raw string — mixing a space format and a `T`
format in one field makes a lexicographic compare quietly wrong.

**The display nit is fixed.** The "via" badge used to special-case only `mac-app` and `excel-import`,
so every other value rendered as "Claude session" and `notion-health-log` would have read "via Claude
session". **The labels were added on 2026-09-22** — `notion-health-log` and `scheduled-sync` now each
render as themselves. Nothing was renamed to game the badge: the doc key is still `via:"notion-health-log"`,
which is what the sync writes. Any *further* `via` value added later needs its own label or it falls
back to "Claude session" again.

## Merge rule (the daemon's history must survive)
`health-notion-sync` reads the existing doc first and keeps every `daily` day, `sleep` night (by
`night`) and `workout` (by `id`) that Notion did not supply. For a metric in both, the entry with
the newer `latest_at` wins (compared as a parsed timestamp — see the format note above).

What that has to protect, as the doc stands today: the `daily` days **2026-09-06 → 2026-09-12**
(`meta.last_received` is 2026-09-13; the daily buckets stop at the 12th), the 3 existing workouts by
their uppercase-UUID `id`, and the **five metric keys Notion can never supply** —
`headphone_audio_exposure`, `walking_asymmetry_percentage`, `walking_double_support_percentage`,
`walking_speed`, `walking_step_length`. Those five exist only because the daemon wrote them; a sync
that rebuilds `metrics` from Notion alone erases them. Plus `dailyDays`, `records` and `sources`.

If Notion returns **no new rows**, the correct action is to write nothing to `appleHealth` at all —
not a re-stamped copy of itself. Only `healthNotionSync` moves.

## Daily routine (Steven, ~20 seconds)
> **On the iPhone:**
> 1. Open **Claude**.
> 2. Say: **"Update my health stats in Notion."**
> 3. Approve the two prompts it shows you — the **Apple Health read**, then the **Notion write**.
>
> That is the whole job. You will not have to approve them again after the first time.

Twice a day (07:45 and 21:45 PT) the Mac task picks the rows up and the deck refreshes.

**If you skip a day, nothing breaks and nothing is invented.** The tiles keep showing the last real
day with its honest age on the badge — "2 days ago", "5 days ago" — and the stale-health alert warns
past 2 days and goes critical past 7. A skipped day is a *gap*, not a zero: no row is written for it,
no value is carried forward into it, and no day is ever stamped with data it does not have. Run the
phone step again whenever you like and the gap simply stays a gap while the new days fill in.

## What happens to the dead ingest daemon
Keep it installed as an **optional second source**. It is no longer the path and nothing depends on
it. If Steven wants it back, the thing to fix is the **phone automation's POST URL** — Health Auto
Export is almost certainly still posting to a Mac LAN address that changed, or the LaunchAgent is no
longer listening on 8765. That is a Reliability Engineer ticket, not a blocker for this recipe.
Meanwhile `r8-apple-health-snapshot` should be left enabled but described honestly on the deck:
"runs on schedule, writes nothing since 2026-09-17 — daemon down".

## Alternative source, evaluated 2026-09-22: `Rachnog/alex-honchar-claude-for-life`
Read in full (shallow clone, last commit 2026-07-05). It is a Claude Code plugin marketplace — body,
mind, work, lifestyle, relationships — of SKILL.md files plus JSON schemas and weekly-to-yearly cadence
reviews, run on a Mac against an Obsidian vault. **It never touches Apple Health**: body data comes from
Oura, Garmin and Withings MCP servers (grep of the repo: 27/34/22 mentions; zero for Apple Health,
HealthKit or Health Auto Export). So it is not a better path for the phone → Notion → deck chain above
and does not replace `apple-health-notion`. Complementary, narrowly: (1) `plugins/body/schemas/{sleep,
recovery,body-composition,diet,exercise,medical-checkups,cadence-review}.json` are a clean reference for
structuring `health-coaching-weekly` output; (2) if Steven ever wears a Garmin, Oura or Withings, its
MCP-first source is cleaner than Apple Health. The repo has **no LICENSE file** — ask the author before
copying a schema verbatim. Nothing was installed and nothing in this chain changed.

## Privacy
- Health data stays in Steven's **private** Notion workspace and his own Command Deck doc.
- Never into the knowledge graph, never into a shared or published page, never into a research
  prompt, never into an outside-model call.
- No medical interpretation in the sync path. Numbers only; `health-full-analysis` and
  `health-coaching-weekly` do analysis, and both are Steven's eyes only.
- The Health Data Avatar (HDA) connector is **not connected** — no third party sees any of this.

## The one line Steven has to do
**Open Claude on your iPhone, say "update my health stats in Notion", and approve the Apple Health
read + Notion write prompts once.**
