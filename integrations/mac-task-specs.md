# Mac runner task specs — the four new integration tasks

**Baseline 2026-09-12 · verified 2026-09-22.** For `claude-runner` (headless, pre-approved tools,
60 tasks today). Cron is **Mac local / Pacific**, as the runner stores it; UTC is given for anyone
reading from the cloud. September 2026 is PDT = UTC−7.

Slot hygiene: `brain-deck-sync` occupies `:20` of every hour 07–22, `r2-lead-response-watchdog`
holds `:10` and `:40` of 07–19, `lead-triage-daily` holds 11:33 weekdays, `showing-sync` holds
08:15/12:15/16:15. The minutes below avoid all of them.

Every task ends by writing its honest status doc. **A task that cannot reach its system writes the
failure and stops — it never writes a number it did not receive.**

---

## 1. `lofty-crm-sync` — NEW

| | |
|---|---|
| **Cron (PT)** | `5 7,13,19 * * *` — 07:05, 13:05, 19:05 daily |
| **Cron (UTC)** | `5 14,20 * * *` and `5 2 * * *` |
| **Model** | Sonnet 5 (execution seat) |
| **Skill** | `lofty-crm-sync` |
| **Tools** | MCP server `lofty` (lofty-bridge, read-only verbs only) · `Bash` limited to allow-listed `lofty-cli auth status` / read subcommands · `Artifact` `read_db` + `write_db` on artifact `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state` · **no** WebSearch, **no** WebFetch |
| **Writes** | `loftyLeads`, and on success `leadTriage` / `leadResponse` / `isaKpi` with `source:"Lofty via lofty-bridge"`; run line into `loftySyncLog` |
| **Freshness** | `OUTPUT_WATCH` threshold 14 h — three runs a day clears it with margin |

**Prompt**
> Use the `lofty-crm-sync` skill. First self-test the connection: call the `lofty` MCP server's
> status verb (fall back to `GET /v1.0/me` with the bridge's key if the server exposes it). If the
> self-test does not return 200, write the `loftyLeads` doc with `status:"not-configured"` or
> `status:"error"`, the verbatim error, empty `stageTotals`, `newLeads90d: []` and
> `firstResponse:{medianMin:null,over5:null,sample:0}`, log it, and stop — do not touch
> `leadTriage`, `leadResponse` or `isaKpi`, and do not report any Follow Up Boss number as Lofty.
> On a 200: pull stage totals and leads created in the last 90 days, pull each of those leads'
> activity timeline (cap 200 leads; say so if you truncate), compute median first-response minutes
> and the count over the 5-minute standard, and write `loftyLeads` in the exact §4 shape with
> `source:"Lofty via lofty-bridge MCP (Mac)"`. Carry first name + last initial only — no phone,
> email or address. Then update `leadTriage`, `leadResponse` and `isaKpi` keeping their existing
> shapes, setting only `source` and the freshly measured values. Reply in one line: leads, stages,
> median minutes, sample size.

**Run now once to prove it:** after the API key is in `~/.config/lofty/.env`, run this task manually
and check that `loftyLeads.status === "ok"` with a non-empty `stageTotals`. Until that run exists,
the deck must say "awaiting first Lofty sync — bridge installed, API key + first run pending".

---

## 2. `zoho-crm-sync` — NEW

| | |
|---|---|
| **Cron (PT)** | `50 6,11,16,21 * * *` — 4× daily |
| **Cron (UTC)** | `50 13,18,23 * * *` and `50 4 * * *` |
| **Model** | Sonnet 5 |
| **Skill** | `zoho-crm-sync` |
| **Tools** | Composio execute (`ZOHO_LIST_LEADS`, `ZOHO_LIST_DEALS`, connection `zoho_talite-spike`) · `Artifact` `read_db` + `write_db`, collection `state` · no WebSearch/WebFetch |
| **Writes** | `zohoSync` every run; `zohoLeads` + `zohoDeals` only on a 200; run line into `zohoSyncLog` |

**Prompt**
> Use the `zoho-crm-sync` skill. Self-test first: call `ZOHO_LIST_LEADS` with page size 1. If it
> returns HTTP 403 `NO_PERMISSION` / `Crm_Implied_Api_Access`, write `zohoSync` with
> `status:"blocked"`, the verbatim error, `leads:null`, `deals:null` and
> `fix:"Zoho CRM → Setup → Security Control → Profiles → enable 'Zoho CRM API Access'"`, then stop —
> leave `zohoLeads` and `zohoDeals` exactly as they are (the Sep 14 paste is honest history, a
> fabricated board is not). On a 200: page through leads and deals, map every `Lead_Status` onto the
> 14 `ZH_STAGES` (unmatched → `"UnAccounted"`, and log the raw value), carry forward every existing
> lead marked `local:true` that Zoho did not return with `local:true` intact, recompute `counts` over
> the merged array, and write `zohoLeads`, `zohoDeals` and `zohoSync` in the exact §4 shapes. Reply
> in one line: status, leads, deals, total amount, any unmapped stage names.

**Cloud variant, honestly:** a cloud routine can re-test Zoho on the same cadence, but an unattended
cloud run's artifact-DB write **parks on a permission prompt** — confirmed three times. So the cloud
routine is a re-test-and-report only; **the Mac task is the writer.** Do not schedule the cloud
routine and then describe the board as self-updating from the cloud.

**Run now once to prove it:** run manually the moment Steven enables Zoho CRM API Access. Expect
`zohoSync.status === "ok"` and a `zohoLeads.counts` that matches the Zoho kanban column counts.
Until then the correct run result is `status:"blocked"` — that is the task working, not failing.

---

## 3. `health-notion-sync` — NEW

| | |
|---|---|
| **Cron (PT)** | `45 7,21 * * *` — 07:45 and 21:45 daily |
| **Cron (UTC)** | `45 14 * * *` and `45 4 * * *` |
| **Model** | Sonnet 5 |
| **Skill** | `apple-health-notion` |
| **Tools** | Notion connector (`notion-query-data-sources`, `notion-fetch`, `notion-search`) · `Artifact` `read_db` + `write_db`, collection `state` · no WebSearch/WebFetch |
| **Writes** | `appleHealth` (merged), `appleHealthSync` (status), `healthSyncLog` |

**Prompt**
> Use the `apple-health-notion` skill. Self-test first: query the Notion "Health Log" data source
> for the most recent row. If the database is missing or the connector fails, write
> `appleHealthSync` with the status and the verbatim error and stop — leave `appleHealth` untouched.
> Otherwise read the last 90 days of rows, read the existing `appleHealth` doc, and build the
> snapshot in the exact shape the tiles parse: `metrics[key] = {metric, unit, latest, latest_at,
> avg7, min7, max7, sum7, n7, days7, pavg7, psum7, pdays7, samples, earliest}`,
> `daily[key][YYYY-MM-DD] = {sum, avg, min, max, last, n}`, `sleep[] = {night, in_bed_min,
> asleep_min, core_min, deep_min, rem_min, awake_min}`, `workouts[] = {id, type, start, start_local,
> minutes, kcal, km, avg_hr, max_hr, source}`, `meta = {last_received, ingests, db_now}`,
> `via:"notion-health-log"`, `read:"notion"`. Use the metric keys in
> `integrations/apple-health-dashboard.md` — `step_count`, `active_energy`, `apple_exercise_time`,
> `flights_climbed`, `walking_running_distance`, `weight_body_mass`, `resting_heart_rate`,
> `heart_rate_variability`, `vo2_max`, `blood_oxygen_saturation`, `body_temperature`,
> `mindful_minutes` — nothing else renders. Merge, never clobber: keep every day, night and workout
> already in the doc that Notion did not supply. An empty Notion property is an empty value, never a
> zero. Write with `write_db` **set**. Reply in one line: metrics, days, nights, workouts, newest
> Health Log date.

**Run now once to prove it:** run manually right after Steven's first phone sync. Expect the Apple
Health tiles to show today's date and the "Last export received" badge to move off 2026-09-13.
Leave `r8-apple-health-snapshot` enabled as the optional second source, described on the deck as
"runs on schedule, writes nothing since 2026-09-17 — daemon down".

---

## 4. `cli-anything-install` — ONE-SHOT, Steven-run

| | |
|---|---|
| **Cron (PT)** | none — **on demand.** Create it disabled; delete it after a successful install |
| **Model** | Opus 5 (judgment: it installs software and reviews security) |
| **Skill** | `cli-anything-connectors` |
| **Tools** | `Bash` (`pip install cli-anything-hub`, `cli-hub …`) · Claude Code plugin commands · `Artifact` `write_db` for `cliAnythingStatus` |

**This one cannot run headless.** `/plugin marketplace add` and `/plugin install` are interactive
Claude Code commands and the generation step asks questions. Steven runs it in an interactive
session on the Mac; the runner's only job afterwards is the weekly validation pass.

**Prompt (Steven pastes this into Claude Code on the Mac)**
> Use the `cli-anything-connectors` skill. Install CLI-Anything: `pip install cli-anything-hub`,
> then `/plugin marketplace add HKUDS/CLI-Anything` and `/plugin install cli-anything`. Verify with
> `cli-hub list`. Then generate the **homes.com** wrapper first (lowest risk, public data) with
> `/cli-anything`, run `/cli-anything:validate` and `/cli-anything:test` on it, and confirm
> `cli-anything-homes search --city Temecula --json` returns parseable JSON. Read-only verbs only —
> no write, submit, send, sign or delete verb on any target without my explicit written approval for
> that verb. Credentials go in the macOS keychain or a `.env` the harness reads itself, never into a
> prompt or a log. Then write `cliAnythingStatus` to the Command Deck with the real per-wrapper
> status, and stop before SkySlope and zipForms — those touch legally binding documents and need the
> ECC security review first. Tell me in one line what installed and what passed its tests.

**Follow-on task (only after the install succeeds):** `cli-anything-validate`, Sundays
`30 8 * * 0` PT (`30 15 * * 0` UTC), Sonnet 5 — re-runs `/cli-anything:validate` on every generated
wrapper and updates `cliAnythingStatus`. A wrapper whose output starts contradicting the UI gets
`status:"failed"` and is disabled, not patched quietly.

---

## Registration checklist (whoever adds these to the runner)
1. Add each task with the cron above; confirm no minute collides with an existing task.
2. Add `OUTPUT_WATCH` rows: `{doc:"loftyLeads", label:"Lofty CRM import", task:"lofty-crm-sync", hrs:14}`
   and `{doc:"zohoSync", label:"Zoho CRM sync", task:"zoho-crm-sync", hrs:14}`.
3. Re-point `r2-lead-response-watchdog`, `lead-triage-daily`, `r11-isa-kpi-compile` and
   `showing-sync` off Follow Up Boss and onto Lofty (see `lofty-crm-sync/SKILL.md`).
4. Run each new task **once, manually**, and record the result. A task that "exists" has not run.
5. Only after 7 consecutive correct runs does a task graduate L1 → L2.
