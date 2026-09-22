# Apple Health → Claude iOS → Notion → Command Deck

**Baseline 2026-09-12 · verified 2026-09-22.** Owner: Integration Engineer (under CTO Innovator).
Status: **spec written, first phone run pending.** Nothing below is live yet.

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

## Notion "Health Log" database
One page per calendar day, `America/Los_Angeles`. Claude can create this itself via the Notion
connector (`notion-create-database`) inside Steven's private workspace — he does not have to build it.

| Property | Type | Unit | Notes |
|---|---|---|---|
| Date | Date | — | the row key; one row per day |
| Steps | Number | count | day total |
| Active Energy | Number | kcal | day total |
| Exercise Minutes | Number | min | day total |
| Flights Climbed | Number | count | day total |
| Walk+Run Distance | Number | mi | day total |
| Resting HR | Number | bpm | daily value |
| HRV | Number | ms | SDNN, daily average |
| VO2 Max | Number | mL/min·kg | latest reading |
| Blood Oxygen | Number | % | daily average |
| Body Temperature | Number | degF | daily average |
| Weight | Number | lb | latest reading |
| Mindful Minutes | Number | min | day total |
| Sleep Total | Number | min | asleep minutes |
| Sleep Deep / REM / Core / Awake / In Bed | Number | min | five separate properties |
| Workouts | Rich text | JSON | `[{type,start_local,minutes,kcal,avg_hr,max_hr,source}]` |
| Source | Select | — | `claude-ios` |

**Empty means unknown.** A metric the phone cannot read leaves the property blank. Never a zero.

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

**One known display nit, flagged rather than hidden:** the "via" badge only special-cases
`mac-app` and `excel-import`; any other value renders as "Claude session". `notion-health-log` will
therefore read "via Claude session" until someone adds the label. Honest, just imprecise — a P3 for
whoever owns panel-wellness. Do not change the doc key to game the badge.

## Merge rule (the daemon's history must survive)
`health-notion-sync` reads the existing doc first and keeps every `daily` day, `sleep` night (by
`night`) and `workout` (by `id`) that Notion did not supply. For a metric in both, the entry with
the newer `latest_at` wins. The Sep 6–13 daemon history stays on the tiles.

## Daily routine (Steven, ~20 seconds)
> Open Claude on the iPhone → **"Update my health stats in Notion."** → approve the Apple Health
> read and the Notion write → done.

Twice a day the Mac task picks it up and the deck refreshes. If the phone run is skipped, the tiles
show the last real day with an honest age, never a filled-in guess.

## What happens to the dead ingest daemon
Keep it installed as an **optional second source**. It is no longer the path and nothing depends on
it. If Steven wants it back, the thing to fix is the **phone automation's POST URL** — Health Auto
Export is almost certainly still posting to a Mac LAN address that changed, or the LaunchAgent is no
longer listening on 8765. That is a Reliability Engineer ticket, not a blocker for this recipe.
Meanwhile `r8-apple-health-snapshot` should be left enabled but described honestly on the deck:
"runs on schedule, writes nothing since 2026-09-17 — daemon down".

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
