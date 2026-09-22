# Mac runner task specs — the five new integration tasks

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
| **Cron (PT)** | `45 7,21 * * *` — 07:45 and 21:45 daily. `:45` collides with nothing in the slot-hygiene list above |
| **Cron (UTC)** | `45 14 * * *` and `45 4 * * *` (PDT = UTC−7; 21:45 PT lands the next UTC day) |
| **Model** | Sonnet 5 (execution seat — this task computes, it does not judge) |
| **Skill** | `apple-health-notion` |
| **Tools** | Notion connector, **read verbs only**: `notion-query-data-sources`, `notion-fetch`, `notion-search`. **Explicitly not allow-listed:** `notion-create-pages`, `notion-update-page`, `notion-create-database`, `notion-update-data-source`, `notion-create-comment` — this task has no reason to write to Notion and must not be able to. · `Artifact` `read_db` + `write_db` on artifact `1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`, limited to the three docs below · **no** WebSearch, **no** WebFetch, **no** Bash |
| **Reads** | Notion data source `af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4` (database `bc71c45aac934a4f8aeddc54345136ef`, "Health Log", 23 properties) · deck doc `appleHealth` |
| **Writes** | `healthNotionSync` **every run** · `appleHealth` **only when Notion returned at least one row the doc does not already have** · a run line into `healthSyncLog` |
| **Freshness** | `OUTPUT_WATCH {doc:"healthNotionSync", label:"Apple Health via Notion", task:"health-notion-sync", hrs:16}` — the widest gap between runs is 07:45→21:45 = 14 h, so 16 h leaves 2 h of margin and does not flap |
| **Privacy** | Health data. Stays in Steven's private Notion workspace and this deck doc. Never into the knowledge graph, the vector index, a shared or published page, a research prompt or an outside-model call. **No medical interpretation anywhere in this path — numbers only.** The `Notes` property is never parsed |

**The mapping — these key names are not negotiable.** They are what `AH_LABELS` / `AH_PRIORITY`
already know; a key that is not on this list does not render.

| Notion property | `appleHealth` key | Where it lands |
|---|---|---|
| Day *(title)* / Date | — | the `daily` day key, `YYYY-MM-DD`, `America/Los_Angeles` |
| Steps | `step_count` | `metrics` + `daily` (cumulative) |
| Active Energy | `active_energy` | `metrics` + `daily` (cumulative) |
| Exercise Minutes | `apple_exercise_time` | `metrics` + `daily` (cumulative) |
| Flights Climbed | `flights_climbed` | `metrics` + `daily` (cumulative) |
| Walk+Run Distance | `walking_running_distance` | `metrics` + `daily` (cumulative) |
| Weight | `weight_body_mass` | `metrics` + `daily` (point value) |
| Resting HR | `resting_heart_rate` | `metrics` + `daily` (point value) |
| HRV | `heart_rate_variability` | `metrics` + `daily` (point value) |
| VO2 Max | `vo2_max` | `metrics` + `daily` (point value) |
| Blood Oxygen | `blood_oxygen_saturation` | `metrics` + `daily` (point value) |
| Body Temperature | `body_temperature` | `metrics` + `daily` (point value) |
| Mindful Minutes | `mindful_minutes` | `metrics` + `daily` (cumulative) |
| Sleep Total / Deep / REM / Core / Awake / In Bed | — | one `sleep[]` row: `{night, in_bed_min, asleep_min, core_min, deep_min, rem_min, awake_min}` |
| Workouts *(JSON text)* | — | `workouts[]` rows, each with a stable `id` |
| Notes, Source | — | **not mapped.** Never parsed, never rendered |

**Every document in this DB is wrapped in `{v: …}`. A bare value is a bug** — one was found in
`stravaSnapshot` on 2026-09-22. Write exactly this shape, `write_db` **set**:

```jsonc
// collection "state", doc "appleHealth"   — <n> marks a real number; no real value belongs in this repo
{ "v": {
    "metrics":   { "step_count": { "metric":"step_count", "unit":"count", "latest":<n>,
                                   "latest_at":"2026-09-22 23:59:00", "earliest":"2026-09-16",
                                   "avg7":<n>, "min7":<n>, "max7":<n>, "sum7":<n>, "n7":<n>, "days7":<n>,
                                   "pavg7":null, "psum7":null, "pdays7":null, "samples":<n> } },
    "daily":     { "step_count": { "2026-09-22": { "sum":<n>,"avg":<n>,"min":<n>,"max":<n>,"last":<n>,"n":1 } } },
    "dailyDays": <n>,                       // recomputed from the MERGED daily, not from Notion alone
    "sleep":     [ { "night":"2026-09-22", "in_bed_min":<n>, "asleep_min":<n>, "core_min":<n>,
                     "deep_min":<n>, "rem_min":<n>, "awake_min":<n> } ],
    "workouts":  [ { "id":"<uuid>", "type":"<type>", "start":"2026-09-22 06:10:00",
                     "start_local":"2026-09-21 23:10:00", "minutes":<n>, "kcal":<n>, "km":<n>,
                     "avg_hr":<n>, "max_hr":<n>, "source":"claude-ios" } ],
    "records":   {},                        // carried forward untouched
    "sources":   [ { "metric":"step_count","source":"claude-ios","n":<n>,
                     "first_at":"2026-09-22 00:00:00","last_at":"2026-09-22 23:59:00" } ],
    "meta":      { "last_received":"2026-09-22 23:59:00.000000", "ingests":<n>, "db_now":"<now>" },
    "syncedAt":  "2026-09-22T14:45:00Z",    // the only ISO-with-Z field
    "via":       "notion-health-log",
    "read":      "notion"
} }
```

```jsonc
// collection "state", doc "healthNotionSync"  — written EVERY run, success or failure
{ "v": { "checkedAt":"<iso>", "status":"ok", "rows":<n>, "lastRowDate":"2026-09-22",
         "lastSyncAt":"<iso>", "error":null, "databaseId":"bc71c45aac934a4f8aeddc54345136ef",
         "dataSourceId":"af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4",
         "databaseUrl":"https://app.notion.com/p/bc71c45aac934a4f8aeddc54345136ef",
         "title":"Health Log", "properties":23, "macTask":"health-notion-sync",
         "phonePrompt":"Update my health stats in Notion",
         "spec":"integrations/apple-health-dashboard.md" } }
```

`status` is **exactly one of** `ok` · `stale` · `not-configured` · `error` ·
`awaiting-first-phone-run` · `not-created`. That set is what the deck's `#healthNotionCard`
(`renderHealthNotionStatus()`) renders; any other string is an unrendered card. Which to use:
`not-created` the database is gone · `not-configured` the connector is not connected or not
authorised · `error` the query threw, with the verbatim error in `error` · `awaiting-first-phone-run`
the query worked and returned **zero** rows (today's state) · `stale` rows exist but the newest is
older than 48 h · `ok` rows exist and the newest is within 48 h.

**Prompt**
> Use the `apple-health-notion` skill. **Self-test first:** query data source
> `af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4` ("Health Log") for the single most recent row, sorted by
> `Date` descending. If the connector fails or the database is not found, write `healthNotionSync`
> with the right status from the six-value set, the verbatim error, and stop — **leave `appleHealth`
> exactly as it is.** If the query succeeds but returns zero rows, write `healthNotionSync` with
> `status:"awaiting-first-phone-run"`, `rows:0`, `lastRowDate:null`, and stop — do not touch
> `appleHealth`. Notion is **read-only** to you: do not create, update or comment on anything there.
> Otherwise: read the last 90 days of rows, read the existing `appleHealth` doc with `read_db`, and
> build the snapshot in the exact shape above, using only the mapped metric keys — `step_count`,
> `active_energy`, `apple_exercise_time`, `flights_climbed`, `walking_running_distance`,
> `weight_body_mass`, `resting_heart_rate`, `heart_rate_variability`, `vo2_max`,
> `blood_oxygen_saturation`, `body_temperature`, `mindful_minutes`. Nothing else renders; do not
> invent a key. **Merge, never clobber:** keep every `daily` day, every `sleep` night (by `night`)
> and every `workout` (by `id`) already in the doc that Notion did not supply, and keep every metric
> key Notion cannot supply — `headphone_audio_exposure`, `walking_asymmetry_percentage`,
> `walking_double_support_percentage`, `walking_speed`, `walking_step_length` — plus `records` and
> `sources`. For a metric present in both, the entry with the newer `latest_at` wins, compared as a
> parsed timestamp, not as a string. The daemon's 2026-09-06 → 2026-09-12 history must still be on
> the tiles when you are done. Recompute `dailyDays` from the merged `daily`. An empty Notion
> property is an **empty value, never a zero**; a day with no row is a gap, not a zero — never
> backfill it, never carry a value forward into it, never stamp a day that has no data. If Notion
> returned no row the doc does not already have, write **nothing** to `appleHealth` — not even a
> re-stamped copy — and say so. Every write is `{v: …}` wrapped; a bare value is a bug. Then write
> `healthNotionSync` with `rows`, `lastRowDate`, `lastSyncAt` and the status, and append the run line
> to `healthSyncLog`. Reply in one line: status, rows, metrics, days, nights, workouts, newest
> Health Log date.

**Run now once to prove it:** run manually right after Steven's first phone sync. Expect
`healthNotionSync.status === "ok"` with a non-zero `rows`, the Apple Health tiles showing that day,
and the "Last export received" badge off 2026-09-13 — **and** the Sep 6–12 daemon days still
present. If the daemon history vanished, the merge is wrong: roll back and fix it before enabling
the task. Until that run exists the honest deck line is "Health Log created and empty — awaiting
Steven's first phone run". Leave `r8-apple-health-snapshot` enabled as the optional second source,
described on the deck as "runs on schedule, writes nothing since 2026-09-17 — daemon down".

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

## 5. `vanessa-whatsapp-inbox` — NEW (spec 2026-09-22 · not installed · not live)

| | |
|---|---|
| **Cron (PT)** | `4-59/10 * * * *` — :04, :14, :24, :34, :44, :54. Checked against all 60 tasks in `docs/inventory/mac-runner-status.md`: nothing else holds those minutes (iMessage inbox is `*/10` at :00, Discord `*/5`) |
| **Cron (UTC)** | same minutes, every hour |
| **Model** | Same seat as `vanessa-imessage-inbox` — Vanessa answers, so Fable 5.1 per the 2026-09-22 tiering; execution sub-steps on Sonnet 5 |
| **Skill / handler** | **The same inbound handler the iMessage task uses**: `vanessa-orchestrator` intake → answer as Vanessa with the AI team → HALT list → `agentInbox` log. Only the transport differs. Never `whatsapp-cli monitor auto-reply` — it calls `claude -p` itself and bypasses the handler, the HALT list and the log |
| **Tools** | `Bash` allow-listed to exactly `whatsapp-cli --json session status`, `whatsapp-cli --json monitor since <ts> --chat <name>`, `whatsapp-cli --json message get <name> --after <iso>`, `whatsapp-cli message send <name> <text>` · `Artifact` `read_db` + `write_db`, collection `state` · otherwise identical to `vanessa-imessage-inbox` |
| **Reads** | `whatsappInboxState` `{v:{chatName, allowFrom:"<the allow-listed sender JID>", lastSeenTime, lastSeenPk, pending:[{id,text,attempts}]}}`, then `monitor since <lastSeenTime>` filtered to `is_from_me:false` **and** `sender == allowFrom` |
| **Writes** | `agentInbox` (merge, keep the newest 200): inbound `{id, channel:"whatsapp", direction:"inbound", from:"steven (allow-listed)", askedAt, question, status}`, outbound `{id, channel:"whatsapp", direction:"outbound", to:"steven", sentAt, text, agents, status}` — the shapes the iMessage task already writes, no phone number in the doc; `channels.whatsapp` status string; `whatsappInboxState` |
| **Freshness** | `OUTPUT_WATCH {doc:"whatsappInboxState", label:"WhatsApp inbox", task:"vanessa-whatsapp-inbox", hrs:1}` |
| **Route gate** | If `VANESSA_PII_OK` is `0` (subscription limited, free route — `integrations/omniroute-failover/README.md`), reply only "Vanessa is on the free route until the subscription resets; I will answer then", log it, stop |

**Prompt**
> Self-test first: `whatsapp-cli --json session status`. On any error write `agentInbox.channels.whatsapp = "error — <verbatim>"` and stop. Read `whatsappInboxState`; run `whatsapp-cli --json monitor since <lastSeenTime> --chat "<chatName>"`; keep only rows with `is_from_me:false` and `sender == allowFrom` — log anything else as `ignored — not allow-listed` and never reply to it. For each kept message do exactly what `vanessa-imessage-inbox` does with an iMessage from Steven: answer as Vanessa with the AI team; a HALT-list item (licensed decision, client send, credential, money) becomes a Needs-Steven packet, not an attempt; queue what you cannot answer to `vanessaResearch`. Reply with `whatsapp-cli message send "<chatName>" "<text>"` in parts of at most 1,500 characters. If the send exits non-zero (no GUI session, screen locked), keep the reply in `pending` as `status:"draft — send pending"`, retry on the next three polls, then mark it `failed` and tell Steven on iMessage that a WhatsApp reply is waiting. Advance `lastSeenTime`/`lastSeenPk`, write the docs, reply in one line: read, answered, pending, ignored.

**Why sends can fail while reads never do:** `message send` opens `whatsapp://send?…` in the WhatsApp desktop app and presses Return through System Events — it needs the Mac awake, a logged-in GUI session and Accessibility permission for the runner's shell. Reads are plain read-only SQLite (`mode=ro` in the source) and work headless with Full Disk Access. Voice notes (`message send-file` fed by `voice-reply-render`) are phase 2, unverified.

**Run now once to prove it:** after `MAC-INSTALL-comms-data.md §1`, text the dedicated number from Steven's phone, run the task by hand, and expect one inbound and one outbound `channel:"whatsapp"` item in `agentInbox`. Create the task **disabled**; enable it only after that run exists.

---

## Registration checklist (whoever adds these to the runner)
1. Add each task with the cron above; confirm no minute collides with an existing task.
2. Add `OUTPUT_WATCH` rows: `{doc:"loftyLeads", label:"Lofty CRM import", task:"lofty-crm-sync", hrs:14}`,
   `{doc:"zohoSync", label:"Zoho CRM sync", task:"zoho-crm-sync", hrs:14}` and
   `{doc:"healthNotionSync", label:"Apple Health via Notion", task:"health-notion-sync", hrs:16}`.
3. Re-point `r2-lead-response-watchdog`, `lead-triage-daily`, `r11-isa-kpi-compile` and
   `showing-sync` off Follow Up Boss and onto Lofty (see `lofty-crm-sync/SKILL.md`).
4. Run each new task **once, manually**, and record the result. A task that "exists" has not run.
5. Only after 7 consecutive correct runs does a task graduate L1 → L2.
6. WhatsApp: add the `whatsappInboxState` watch row above; the task stays disabled until Steven's first manual run and the dedicated number exist.
