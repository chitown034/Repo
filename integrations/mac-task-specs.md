# Mac runner task specs — the five new integration tasks

**Baseline 2026-09-12 · verified 2026-09-22.** For `claude-runner` (headless, pre-approved tools,
**59** tasks at the 2026-09-23 count — the live runnerStatus doc, syncedAt 2026-09-22T20:10:15Z, holds 59; "60" was stale). Cron is **Mac local / Pacific**, as the runner stores it; UTC is given for anyone
reading from the cloud. September 2026 is PDT = UTC−7.

> **Re-read 2026-09-23 (R3).** The **count is still 59** and every one of the five task names below is
> still absent from it, so the specs are still specs. The `syncedAt` quoted above has moved on, though:
> the live document now stamps `2026-09-23T02:10:00Z` (version 12), and its `updatedAt` is
> `2026-09-22T19:05:47`. Quote the count, not that stamp — it advances on every sync.
> `docs/inventory/mac-runner-status.md` is an older copy of the same document (`syncedAt`
> `2026-09-22T04:05:04Z`); where the two differ, the live one wins. On everything checked here they
> agree: identical 59 names, identical crons, the same 18 tasks with `lastEnd: null`.

Slot hygiene: `brain-deck-sync` occupies `:20` of every hour 07–22, `r2-lead-response-watchdog`
holds `:10` and `:40` of 07–19, `lead-triage-daily` holds 11:33 weekdays, `showing-sync` holds
08:15/12:15/16:15. The minutes below avoid all of them.

> **Correction 2026-09-23 (R3) — that four-task list is not the whole of what holds a minute, and the
> proposed slots were checked only against it.** Re-derived by expanding every one of the 59 live crons
> (`runnerStatus`, read 2026-09-23, `syncedAt` `2026-09-23T02:10:00Z`) and intersecting minute **and**
> hour. The four rows above are correct and nothing below collides with them. But four more recurring
> tasks hold minutes this list never mentioned — `fabric-deck-sync` `:05` of the odd hours 07–21,
> `r13-appointment-prep` `:50` of the even hours 06–18, `openterminal-remote-queue` `:45` of 06–21,
> `local-bridge-queue` `:25` of 06–21, `vanessa-research-queue` `:30` of 07–21, `isa-comms-bridge-local`
> `:37` of 07–21 — and three of the five specs below land on one:
>
> | Spec | Proposed (PT) | Lands on | Which slots |
> |---|---|---|---|
> | §1 `lofty-crm-sync` | `5 7,13,19 * * *` | `fabric-deck-sync` (`5 7-21/2 * * *`) | **all three** — 07:05, 13:05, 19:05 |
> | §2 `zoho-crm-sync` | `50 6,11,16,21 * * *` | `r13-appointment-prep` (`50 6-19/2 * * *`) | 06:50 and 16:50 (11:50, 21:50 are clear) |
> | §3 `health-notion-sync` | `45 7,21 * * *` | `openterminal-remote-queue` (`45 6-21 * * *`) | **both** — 07:45 and 21:45 |
> | §4 follow-on `cli-anything-validate` | `30 8 * * 0` | `vanessa-research-queue` (`30 7-21 * * *`) | Sunday 08:30 |
> | §5 `vanessa-whatsapp-inbox` | `4-59/10 * * * *` | nothing | **clear — the §5 claim re-verified and holds** |
>
> The `*/5` and `*/10` pollers (`vanessa-discord-inbox`, `vanessa-imessage-inbox`, `voice-reply-render`)
> overlap almost everything by construction and are not counted as collisions here.
>
> **Whether this matters is Steven's call, and it is not a blocker.** The runner's own document carries
> `running` and `waiting` arrays, so a second task due on the same minute queues rather than fails —
> that is read off the document's shape, not from runner source or a live observation, and it has not
> been tested. What *is* wrong is the sentence above promising the minutes avoid the occupants, and the
> Registration checklist's step 1 telling whoever registers them to "confirm no minute collides with an
> existing task": follow step 1 tonight and you will find three collisions and no guidance. Clear
> alternatives, if you want them: §1 → `7 7,13,19`, §2 → `52 6,11,16,21`, §3 → `47 7,21`,
> §4 follow-on → `32 8 * * 0`. Each moves 2 minutes, leaves every UTC line and every freshness
> calculation below unchanged, and lands on a minute no live task holds.

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
> `leadTriage`, `leadResponse` or `isaKpi`, and never report another system's number as Lofty.
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

> **Correction 2026-09-23 (R3) — there is no Sep 14 paste left to leave alone.** The prompt above tells
> the task to preserve `zohoLeads` and `zohoDeals`. Both are **absent from the live store**: a full
> listing of collection `state` on 2026-09-23 returned **175 documents** and neither is among them
> (`zohoSync` *is*, version 1, still `status:"blocked"` with the 403 of 2026-09-22T08:17Z). So on a 403
> the instruction is a no-op — harmless, and still the right instinct — but on the first 200 the task
> is **creating** those two documents, not merging into them, and "carry forward every existing lead
> marked `local:true`" will find nothing to carry. Whoever runs it the day the profile toggle lands
> should expect a fresh board, and should not read an empty carry-forward as a merge that went wrong.
> Same footing, checked the same way: `loftySyncLog`, `zohoSyncLog`, `healthSyncLog`, `cliAnythingLog`
> and `whatsappInboxState` are all absent too — correct, since no task has ever run to append a line.
> Present and matching their specs: `loftyLeads` (v1, error state), `healthNotionSync`
> (v2, `status:"awaiting-first-phone-run"`, one of the six legal values), `appleHealth`, `leadTriage`,
> `leadResponse`, `isaKpi`, `agentInbox`, `voiceReplyQueue`, `voiceReplyStatus`.

**Cloud variant, honestly:** a cloud routine can re-test Zoho on the same cadence, but it still must
not be the writer — and the reason changed on 2026-09-22. The old reason given here, that an
unattended cloud write "parks on a permission prompt", is **disproved** (`cloudWriteProbe`,
`docs/CLOUD-WRITE-ARCHITECTURE.md`). The reason that survives is narrower and decisive for this
task: an **agent-created routine carries no connectors**, so a cloud run cannot reach Zoho through
Composio at all. So the cloud routine is a re-test-and-report only; **the Mac task is the writer.**
Do not schedule the cloud routine and then describe the board as self-updating from the cloud.

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

## 4. `cli-anything-install` — install is SCRIPTABLE, and the seven wrappers are pre-built

| | |
|---|---|
| **Cron (PT)** | none — **on demand.** The install half is a `MAC-SETUP.sh` step; this task covers the path-map half (`--discover` + edit, per recipe). Create it disabled; delete it after the maps are verified |
| **Model** | Opus 5 (judgment: it installs software and reviews security) |
| **Skill** | `cli-anything-connectors` |
| **Tools** | `Bash` (`pip install cli-anything-hub`, `cli-hub …`, `cli-anything-browser …`, `cli-anything-<target> --json …`) · Claude Code plugin commands (new targets only) · `Artifact` `write_db` for `cliAnythingStatus` |
| **Env** | `CLI_HUB_NO_ANALYTICS=1` in the runner's shell profile, set **before the first command** |

**Correction 1, 2026-09-22 — the install is NOT interactive.** This spec previously said
`/plugin marketplace add` and `/plugin install` are interactive Claude Code commands and that the
whole thing had to be run by hand. That was wrong, and it is the sentence that kept this manual.
Both work from the CLI, non-interactively, exit 0, in a throwaway HOME:

```
claude plugin marketplace add HKUDS/CLI-Anything
  → "Successfully added marketplace: cli-anything (declared in user settings)"
claude plugin install cli-anything@cli-anything
  → "Successfully installed plugin: cli-anything@cli-anything (scope: user)"
```

So `pip install cli-anything-hub`, both plugin commands and the `browser` harness build are all
**script-installable** and belong in `MAC-SETUP.sh` as an ordinary step. The plugin ships exactly
five commands: `/cli-anything`, `/cli-anything:list`, `:refine`, `:test`, `:validate`.

**Correction 2, 2026-09-22 — generation is no longer needed for these targets (F-H1-10).** Seven
read-only harness packages are **pre-built in the repo**, at
`integrations/cli-anything-harnesses/{homes,showingtime,showami,skyslope,zipforms,lofty,zoho}/agent-harness/`,
and install with `pip install .` (F-H2b-01…13). `/cli-anything` stays the path for a **new** target
— it needs the app open in front of it and asks questions — but nothing in this spec is generated
any more. `cli-anything-browser` itself is **not on PyPI** (F-H1-02): it is vendored in this repo at
`integrations/cli-anything-harnesses/browser/agent-harness/` (Apache-2.0, unmodified, provenance in
its `VENDORED.md`), and the upstream CLI-Anything checkout stays only for the hub and the Claude
Code plugin. `MAC-SETUP.sh --only cli-anything-harnesses` installs all eight into
`~/Applications/cli-anything-harnesses/.venv` in **one** uv command, **browser first** — the five web
packages import `cli_anything.browser` at module level and pin a distribution PyPI does not have, so
resolving them separately fails outright and a venv without it fails at `--help` rather than at call
time (F-H2b-03). Console scripts are symlinked into `~/.local/bin`.

**What replaces generation is the path map.** Every recipe in all five browser packages ships
`verified: false` — 18 of them — because no site has ever been reached from the build sandbox, and
not one of the seven has ever made a live call (F-H1-01, F-H2b-13). The per-recipe
`--discover` → edit `paths.json` → re-run → spot-check loop **is** the work, and it is Steven's:
it needs the site on screen.

**Where Steven's involvement actually begins:**
1. `./MAC-SETUP.sh` — hub, plugin, the vendored browser harness and the seven packages, all
   automatic, `CLI_HUB_NO_ANALYTICS=1` set. **Not his.** (`--only cli-anything-harnesses` for just
   the eight.) `DOMSHELL_TOKEN` is his — it is a credential the script never touches, and it reaches
   `domshell-proxy` in **argv**, visible in `ps` to anything running as the same user; the proxy has
   no env fallback, so no wrapper can move it (F-P1-03, open).

   **Env block for any task that drives the browser harness:**
   ```
   CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true
   CLI_ANYTHING_DOMSHELL_PIN_DIR=$HOME/Applications/cli-anything-harnesses/domshell-pin
   PATH=<repo>/integrations/cli-anything-harnesses/browser/runtime/bin:$PATH
   ```
   Command is `<repo>/integrations/cli-anything-harnesses/browser/runtime/run-browser-harness.sh …`,
   **never `cli-anything-browser` directly.** The SSRF flag is read at import time, so a task that
   execs the binary directly gets blocking OFF — along with an unpinned `npx` fetch and a
   world-readable command history.
2. Chrome plus the DOMShell extension, and signing in to the target by hand. **His, unavoidable**
   (the harnesses cannot sign in: signing in needs `act type`, which does not exist — F-H1-08).
3. `--discover` once per recipe, then edit `~/.config/cli-anything/<site>-paths.json` until the
   values match the screen, then `verified: true`. **His, one per recipe, the site in front of him.**
4. The read-only allow-list; and for SkySlope and zipForms the ECC sign-off date first.

The runner's only job afterwards is the weekly validation pass.

**Verified 2026-09-22, in a cloud sandbox that installs nothing on the Mac:** `cli-anything-hub`
**0.4.1** installs clean from PyPI; both `claude plugin` commands above run non-interactively;
`pip install .` in the vendored `browser/agent-harness/` builds `cli-anything-browser`, which drives the **DOMShell** Chrome extension against a live logged-in
Chrome session (needs Node/npx, Chrome running, the extension from the Web Store, `DOMSHELL_TOKEN`
exported). Of **83 wrapper directories upstream, none** is a real-estate, CRM, Lofty, ShowingTime,
Showami, zipForms, SkySlope or homes.com entry, and `clianything.cc` is egress-blocked, so **none
can be downloaded** — which is why the seven were built into this repo instead. Two security facts for the runbook: CLI-Hub's telemetry is
**opt-out** (PostHog token, reports hostname + CLI + hub version + which agent tool is running, on
install/uninstall/launch/every call — hence the `Env` row above), and **DOMShell is a third-party
extension with page-content access** on a Chrome logged into Lofty, SkySlope and zipForms.

### Bring-up order, and the gates between the steps

All seven are built. What is ordered here is **installing, signing in and verifying the path map**
— no longer generating anything.

| # | Target | Gate before it starts | Why it sits here |
|---|---|---|---|
| 1 | **homes.com** | `./MAC-SETUP.sh` done, DOMShell installed, signed in | Public read-only data. Lowest blast radius; it proves the toolchain — and the path-map loop — before anything with consequences is attempted |
| 2 | **ShowingTime** | step 1 green | Read-only only. Every outward verb requests or confirms an appointment with **another agent or a seller** — writing to a client-facing system, HALT |
| 3 | **Showami** | step 1 green | Read-only only. Posting a request **hires a licensed person and spends money** — the first line of the HALT list, twice over |
| — | **Lofty** | `LOFTY_API_KEY` in `~/.config/lofty/.env` | **Not a browser target.** It has a documented REST API and the bridge + CLI are installed; see §1. `cli-anything-lofty` is a GET-only REST front to that same API and key file — `lofty-bridge` stays primary. No browser wrapper was built |
| — | **Zoho CRM** | the profile toggle (§2) | **Not a browser target.** `cli-anything-zoho` is a GET-only REST front to CRM v8; every call exits 4 with the profile-permission fix until Steven sets the toggle (F-H2b-02) |
| 4 | **SkySlope** | **ECC security review, with a sign-off date** | Legally binding transaction documents. Gate holds even after CLI-Anything installs |
| 5 | **zipForms / Lone Wolf** | **ECC security review, with a sign-off date** | Contract forms. A wrong one sent or signed is not recoverable |

**The one control that makes steps 2 and 3 safe.** `cli-anything-browser` splits cleanly: `fs
ls|cd|cat|grep|pwd`, `page info|back|forward|reload` and `session status` only read; **`act click`
and `act type` are the entire write surface.** Every disabled verb — showing request, showing
confirm, Showami post, e-sign send — is an `act` call underneath, so denying `act` denies all of
them at once. Carry that as a literal **Bash allow-list on the task**, not as an instruction to
behave. `page open` is allowed but URL-allow-listed per target: a crafted URL can itself perform an
action on some sites.

**Prompt (Steven pastes this into Claude Code on the Mac — step 3, after `./MAC-SETUP.sh`)**
> Use the `cli-anything-connectors` skill. `./MAC-SETUP.sh` has already installed the hub, the
> Claude Code plugin, the vendored `cli-anything-browser` and the seven harness packages, with
> `CLI_HUB_NO_ANALYTICS=1` set — confirm with `cli-hub list` and `cli-anything-homes --help`
> (the eight live in `~/Applications/cli-anything-harnesses/.venv`, symlinked into `~/.local/bin`),
> and if either fails, say so and stop rather than installing anything by
> hand. **Do not generate anything** — homes.com, ShowingTime, Showami, SkySlope, zipForms, Lofty
> and Zoho are pre-built packages; `/cli-anything` is only for a target we do not have. I have
> installed the DOMShell Chrome extension and I am signed in to homes.com.
> Then bring up **homes.com** first (lowest risk, public data): `cli-anything-homes --json recipes`,
> then for each of `search-listings`, `saved-searches` and `listing-detail` run
> `cli-anything-homes --json recipe <name> --discover --text`, edit
> `~/.config/cli-anything/homes-paths.json` (`paths init` first) until the rows and fields match
> what the page shows me, re-run without `--discover`, and paste me the JSON. **Every path map ships
> `verified: false` and none has ever seen the live site** — do not set `verified: true` on a map
> until its numbers match the screen, and do not let any number out of an unverified map drive a
> decision. Read-only verbs only — no write, submit, send, sign or delete verb on any target without
> my explicit written approval for that verb; confirm with a **word** match,
> `cli-anything-homes --help | grep -qw act` must find nothing (a substring match false-trips on
> names like `my-listing-activity`). Credentials go in the macOS keychain or a `.env` the harness
> reads itself, never into a prompt or a log; the harness cannot sign in and must not be asked to.
> Then write `cliAnythingStatus` to the Command Deck with the real per-wrapper status, and stop
> before SkySlope and zipForms — those touch legally binding documents, need the ECC security review
> first, and refuse to run at all until `CLI_ANYTHING_ECC_REVIEWED_AT` holds its sign-off date. Tell
> me in one line what installed, which maps now match the screen, and what you could not prove.

**Prompt (steps 2 and 3 — the showing wrappers; only after step 1 is green)**
> Use the `cli-anything-connectors` skill. homes.com is installed and its maps now match the
> screen, so now bring up the two showing packages, one at a time — **they are already built, do
> not generate anything**: **`cli-anything-showingtime`** with the recipes `todays-showings`,
> `showing-status`, `feedback-inbox`, `my-listing-activity`; then **`cli-anything-showami`** with
> `my-requests`, `request-status`, `assistant-feedback`, `posted-price`. Both drive DOMShell against
> my already-logged-in Chrome — if either login needs MFA, SSO or a CAPTCHA, stop and tell me, do
> not automate around it; the harnesses cannot sign in and must not be asked to.
> **They are read-only by construction:** only `fs ls|cd|cat|grep|pwd`, `page
> info|back|forward|reload`, `session status`, and `page open` restricted to the URL prefixes for
> that one site. `act click` and `act type` do not exist in either package — confirm it with a
> **word** match, `cli-anything-showingtime --help | grep -qw act` (and the same for showami) must
> find nothing, and treat a hit as a failed build. A substring match is wrong here and false-trips
> on `my-listing-activity`. Neither
> wrapper may request, confirm, cancel or reschedule a showing, submit feedback, post a Showami
> job, accept a bid or message a showing agent: those send a request to another agent, commit a
> seller, or hire a person and spend my money, and every one of them needs my written approval for
> that specific verb before it exists. Then, **per recipe**, run `--discover --text`, edit
> `~/.config/cli-anything/<site>-paths.json` until it matches the page, and prove three things per
> wrapper and paste me the output — (a) a read
> recipe returns parseable JSON or an explicit empty-result object, (b) with Chrome logged out it
> returns an explicit auth error rather than a stale or cached result, (c) the rows it returns match
> what the site shows me on screen right now. Only then set that map's `verified: true`. Update
> `cliAnythingStatus`: `connState`
> `"read-only-live"` only with a real `lastRun`, otherwise `"installed-untested"`; list the read
> verbs in `verbsEnabled` and every verb above in `verbsDisabled`; never put an outward verb in
> `verbsEnabled` — the Showings panel treats that as a tripwire and turns red. Log every run to
> `cliAnythingLog` with arguments redacted and no credential or cookie. Then stop: SkySlope and
> zipForms are not part of this and stay gated on the ECC security review. One line back: what
> installed, which maps you verified against the screen, what you could not prove.

**Follow-on task (only after the install succeeds):** `cli-anything-validate`, Sundays
`30 8 * * 0` PT (`30 15 * * 0` UTC), Sonnet 5 — re-runs each installed package's own suite
(`python -m pytest cli_anything/<target>/tests`) plus one read recipe per target, and updates
`cliAnythingStatus`; `/cli-anything:validate` applies only to a wrapper that was generated. A
wrapper whose output starts contradicting the UI gets
`status:"failed"` and is disabled, not patched quietly. It also re-asserts the read-only build: if
`<cli> --help | grep -qw act` ever matches — a **word** match, never a substring — that wrapper is
disabled the same run and escalated.

**Run now once to prove it:** after `./MAC-SETUP.sh`, run `cli-anything-browser session status` and one
homes.com read recipe by hand and keep the output. Until that exists the honest deck line is
"CLI-Anything packages built, nothing installed on the Mac, no path map verified, no live call ever
made". The `cliAnythingStatus` document has **never been written**, so the connector card correctly
says nothing has ever checked any of this on the Mac — and it must keep saying that until a task on
the Mac looks. A cloud session writing it would stamp a `checkedAt` that claims an inspection nobody
made. Shape: `docs/data/cliAnythingStatus.doc.json` (template). The task that fills it:
`routines/mac-task-repairs.md` §9 (`cli-anything-status`).

---

## 5. `vanessa-whatsapp-inbox` — NEW (spec 2026-09-22 · not installed · not live)

| | |
|---|---|
| **Cron (PT)** | `4-59/10 * * * *` — :04, :14, :24, :34, :44, :54. Checked against all **59** tasks in the live `runnerStatus` doc (the repo snapshot in `docs/inventory/mac-runner-status.md` is older): nothing else holds those minutes (iMessage inbox is `*/10` at :00, Discord `*/5`) |
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

**Run now once to prove it:** **Superseded 2026-09-23 — Steven chose his OWN personal WhatsApp in a message-yourself thread; see `integrations/mac-task-specs.md` §5a and `context/decisions.md`.** Follow §5a's version of this step — message the **self-chat** from Steven's phone, run the task by hand, and expect one inbound and one outbound `channel:"whatsapp"` item in `agentInbox`. Create the task **disabled**; enable it only after that run exists.

---

## Registration checklist (whoever adds these to the runner)
1. Add each task with the cron above; confirm no minute collides with an existing task. **Read the
   2026-09-23 correction at the top of this file before you do — three of the five crons as written
   collide with a live task, and the two-minute alternatives there are already checked clear.** This
   step is the reason the collision matters: done honestly, it stops you.
2. Add `OUTPUT_WATCH` rows: `{doc:"loftyLeads", label:"Lofty CRM import", task:"lofty-crm-sync", hrs:14}`,
   `{doc:"zohoSync", label:"Zoho CRM sync", task:"zoho-crm-sync", hrs:14}` and
   `{doc:"healthNotionSync", label:"Apple Health via Notion", task:"health-notion-sync", hrs:16}`.
3. Point `r2-lead-response-watchdog`, `lead-triage-daily`, `r11-isa-kpi-compile` and
   `showing-sync` at **Lofty** as their lead source (see `lofty-crm-sync/SKILL.md`). Lofty is not
   connected yet — the key goes in `~/.config/lofty/.env` as `LOFTY_API_KEY`; until it is there
   these tasks have no lead source and must report "not connected yet", not a number.
4. Run each new task **once, manually**, and record the result. A task that "exists" has not run.
5. Only after 7 consecutive correct runs does a task graduate L1 → L2.
6. WhatsApp: add the `whatsappInboxState` watch row above; the task stays disabled until Steven's first manual run exists. **Build §5a, not §5** — he chose his own number in a message-yourself thread on 2026-09-23, and §5's `is_from_me:false` filter cannot run there at all. Run `integrations/whatsapp-selfchat-setup.sh "<his number>"` first; it settles §5a's one unmeasured assumption and prints the seed document.

**Re-checked against live state 2026-09-23 (R3) and still true — no action:** the five task names below
are absent from the 59 (`runnerStatus`); `cliAnythingStatus` has never been written (absent from a
175-document listing of collection `state`, so §4's deck line stands); `voiceReplyQueue` still holds
exactly **one** item, `id: teststeve01`, `ts: 2026-09-12T22:01:44Z`, so §6's "one test item since
2026-09-12" is literally accurate a week on; `voice-reply-render` and `vanessa-imessage-inbox` are both
live at `*/10 * * * *` with `lastStatus: "ok"` as §6 says; the four slot-hygiene occupants and every UTC
conversion in §§1–4 re-derived correct (PDT = UTC−7, including the two that cross midnight); §1's 14 h
and §3's 16 h freshness thresholds both clear their widest run gap (12 h and 14 h) with margin. What was
**not** re-checked here: any prompt text — those live only on Steven's Mac — and anything needing a live
Mac, since nothing in this repo has ever run on one.

---

## 5a. `vanessa-whatsapp-inbox` — SELF-CHAT MODE (Steven's decision, 2026-09-23)

**Supersedes the transport half of §5. Everything else in §5 — the handler, the HALT list, the
`agentInbox` shapes, the route gate, the model seat — is unchanged.**

Steven chose to link **his own personal WhatsApp** rather than a dedicated number, after being told
what it costs. He reaches Vanessa in his **own "Message Yourself" thread**: he types there, she
answers there. This file is the amendment that makes that work, because §5 as written **cannot** run
in a self-chat — and the reason it cannot is also the reason this mode needs a circuit breaker.

### The two things that change, and why

**1. `is_from_me` stops discriminating.** §5 keeps only rows with `is_from_me: false`. In a
note-to-self thread there is no other party — *every* message is from Steven, so that filter drops
all of them and Vanessa never answers. The filter must invert.

**2. Which means Vanessa's own replies look exactly like Steven's messages.** She sends as him, into
the same thread, and they come back on the next poll carrying `is_from_me: true` and
`sender == allowFrom` just like his. Left alone, she answers her own reply, then answers that, and
the only thing that stops it is a WhatsApp rate limit on **his personal number**.

So this mode is not "§5 with a flag flipped". It is §5 with the sender check replaced by an
**authorship marker**, plus a breaker that bounds the damage if the marker ever fails.

### Before anything depends on it — settle the assumption (Steven, one command)

The `is_from_me`-is-always-true claim is reasoned from WhatsApp's data model, **not measured** — no
self-chat has ever been read by this tooling, and it cannot be from a cloud session. Settle it first:

```bash
whatsapp-cli --json chat find "<your own number>"      # the self-chat's name/JID
whatsapp-cli --json message get "<that chat>" --after 2026-09-01T00:00:00Z | head -40
```

Read `is_from_me` on the rows. **All `true`** → this amendment is correct, build it. **Anything that
distinguishes the two sides** (a `device_id`, a `from_device`, a differing `sender`) → say so; that
field is a better discriminator than a text marker and this amendment gets simpler, not harder.

### The marker

Every outbound Vanessa sends in this thread begins with, exactly:

```
[V] 
```

A three-character ASCII sentinel and one space. Chosen because it survives WhatsApp's own text
handling, is visible to Steven so he can see at a glance which side wrote what, and is not something
he would type by accident. **If Steven types a message starting with `[V] `, it is ignored** — that
is the documented cost of the marker, and it is why the marker is not a lone word like "Vanessa".

### Reads — replaces §5's Reads row

`whatsappInboxState` gains three fields:

```
{v:{
  chatName,                      // the self-chat, from `chat find`
  allowFrom,                     // Steven's own JID — still checked, still not sufficient alone
  selfChat: true,                // this mode is on; absent or false means §5 applies unchanged
  lastSeenTime, lastSeenPk,      // unchanged
  pending: [{id,text,attempts}], // unchanged
  recentOutbound: [<last 20 outbound texts, newest first>],   // NEW — echo detection
  sentToday: {date:"YYYY-MM-DD", count:<int>}                 // NEW — the circuit breaker
}}
```

Run `monitor since <lastSeenTime> --chat "<chatName>"` as before, then keep a row **only if all five
hold**:

1. `sender == allowFrom` — unchanged from §5, and still first.
2. `is_from_me == true` — **inverted** from §5. In a self-chat this is what Steven's messages look like.
3. `pk > lastSeenPk` — strictly greater. Never `>=`, or the last message is reprocessed every poll.
4. `text` does **not** start with `[V] `.
5. `text` does not exactly match any entry in `recentOutbound`.

Anything failing 4 or 5 is logged as `ignored — own reply` and **never** answered. Anything failing 1
is logged as `ignored — not allow-listed`, as in §5.

### The circuit breaker — three layers, and the point of each

A marker is a *correctness* control. These are *blast-radius* controls, and they exist because layer
one is new code that has never run against a real thread.

**Layer 1 — per-poll cap.** Answer at most **3** kept messages in one poll. If more arrived, answer
the **newest 3** and log the rest as `skipped — per-poll cap`. A runaway loop then costs 3 messages
per 10 minutes, not an unbounded burst.

**Layer 2 — daily send ceiling.** Before every send, increment `sentToday`. Roll it over when
`date` is not today. **At 20, stop sending for the rest of the day**, write
`agentInbox.channels.whatsapp = "send ceiling reached — see whatsappInboxState.sentToday"`, and tell
Steven **on iMessage**, not on WhatsApp. Twenty is roughly twice a heavy day of real use and far
below anything WhatsApp would act on, so if the ceiling is ever hit the correct reading is **a bug,
not a busy day**.

**Layer 3 — advance the cursor before the next read, including over Vanessa's own sends.** After
sending, re-read the thread's newest `pk` and set `lastSeenPk` to it, so her own outbound is already
behind the cursor when the next poll starts. The marker should catch it anyway; this is the belt to
its braces. `lastSeenPk` is **monotonic** — never write a value lower than the stored one, whatever
the read returns.

Each layer is independent. Two would have to fail together before a loop reaches Steven's phone more
than three times.

### Sends — replaces §5's send line

```
whatsapp-cli message send "<chatName>" "[V] <text>"
```

Parts of at most 1,500 characters as in §5, and **the marker leads every part**, not just the first —
a continuation that arrives without it is indistinguishable from a new message from Steven. Append
each part's exact sent text to `recentOutbound` (keep 20, newest first) **before** the next send, so
echo detection cannot miss a part that lands out of order.

Failure handling is §5's, unchanged: a non-zero exit (no GUI session, screen locked) keeps the reply
in `pending` as `status:"draft — send pending"`, retries on the next three polls, then marks it
`failed` and tells Steven on iMessage.

### Paste-ready prompt — replaces §5's Prompt in full

> Self-test first: `whatsapp-cli --json session status`. On any error, write
> `agentInbox.channels.whatsapp = "error — <verbatim>"` and stop.
>
> Read `whatsappInboxState`. If `selfChat` is not `true`, stop and report that this prompt is the
> self-chat prompt but the state document is not in self-chat mode — do not guess which is right.
>
> Roll `sentToday` over if its `date` is not today's. **If `sentToday.count >= 20`, send nothing for
> the rest of the day**: write `agentInbox.channels.whatsapp = "send ceiling reached — see
> whatsappInboxState.sentToday"`, tell Steven on iMessage (not on WhatsApp), and stop. A ceiling hit
> is a bug, not a busy day.
>
> Run `whatsapp-cli --json monitor since <lastSeenTime> --chat "<chatName>"`. Keep a row only if ALL
> of: `sender == allowFrom`; `is_from_me == true`; `pk > lastSeenPk` (strictly); `text` does not start
> with `[V] `; and `text` does not exactly match any entry in `recentOutbound`. Log a row failing the
> last two as `ignored — own reply` and one failing the first as `ignored — not allow-listed`. Never
> reply to either.
>
> **Answer at most the newest 3 kept messages**; log any others as `skipped — per-poll cap`.
>
> For each, do exactly what `vanessa-imessage-inbox` does with an iMessage from Steven: answer as
> Vanessa with the AI team; a HALT-list item (licensed decision, client send, credential, money)
> becomes a Needs-Steven packet, not an attempt; queue what you cannot answer to `vanessaResearch`.
>
> Reply with `whatsapp-cli message send "<chatName>" "[V] <text>"` in parts of at most 1,500
> characters, **the `[V] ` marker leading every part**. Before each send, append that part's exact
> sent text to `recentOutbound` (keep the newest 20) and increment `sentToday.count`. If a send exits
> non-zero, keep the reply in `pending` as `status:"draft — send pending"`, retry on the next three
> polls, then mark it `failed` and tell Steven on iMessage.
>
> After sending, re-read the thread's newest `pk` and set `lastSeenPk` to it so your own outbound is
> behind the cursor. `lastSeenPk` is **monotonic — never write a value lower than the stored one.**
> Advance `lastSeenTime` the same way. Write `agentInbox` (merge, newest 200) and
> `whatsappInboxState`. Reply in one line: read, answered, pending, ignored, skipped, sentToday.

### What this mode does not change

- **The HALT list.** A licensed decision, a client send, a credential or anything that spends money
  is a Needs-Steven packet, exactly as in §5.
- **No group chats. No `monitor auto-reply`** — it shells out to `claude -p` on its own and bypasses
  the handler, the HALT list and the log.
- **No `export`** into the vault, the brain, the vector index or the knowledge graph.
- **The task is created disabled** and enabled only after one successful manual run.

### The cost Steven accepted, recorded here so it is not rediscovered as a finding

Reading a self-chat needs **Full Disk Access**, which is an OS-level grant, not a per-chat one.
`ChatStorage.sqlite` is his **entire personal WhatsApp history in plaintext SQLite**, and once
Terminal and the runner's launchd context hold FDA, anything running as him on that Mac can read all
of it. The `--chat` scoping above is enforced *inside the tool*; it does not narrow what the OS
opened. If clients ever message him on WhatsApp, that history includes client PII — a compliance
surface for an MLO, not only a privacy one.

He was told this before choosing, and chose it. **It is not a finding and not an open item.** Two
things that reduce it, both his to do and neither a blocker:

- **Audit what else already holds Full Disk Access** on that Mac before granting it to two more
  things (System Settings → Privacy & Security → Full Disk Access). The OSINT tooling F-E8-61 flagged
  is the specific worry.
- **FileVault on**, so the history is not readable from the disk at rest.

**Send-side risk is close to nil in this mode**, and that is worth stating because it is the fear
this design usually attracts: every outbound goes to his own note-to-self thread. WhatsApp's
automated-messaging enforcement targets unsolicited outbound *to other people*. Nothing here ever
messages anyone but himself.

---

*Written 2026-09-23 after Steven chose "personal WhatsApp, message-yourself" over a dedicated number.
Nothing in this file has run. The `is_from_me` assumption is reasoned, not measured — the probe at the
top of this section is the first thing to do, and it may simplify everything below it.*

---

## 6. `voice-reply-render` + `vanessa-imessage-inbox` — AMENDMENTS so Vanessa speaks off the dashboard

Both tasks already exist, are installed, and run `*/10 * * * *` with `lastStatus ok`. Neither is
being replaced. Each gets one block appended to its existing prompt. Background, the live-document
evidence and the rules are in `integrations/vanessa-voice-everywhere.md` — read it before pasting.

**Why:** `voiceReplyQueue` is written by the Command Deck page and by nothing else, so Vanessa only
ever speaks while Steven is at the dashboard. On iMessage she answers in text, silently. The queue
has held one test item since 2026-09-12 for exactly this reason.

### 6a. Append to `vanessa-imessage-inbox`

> **After your text reply has been sent — never before, and never instead — consider queuing it to
> be spoken.** The text reply is the answer and must go out first; voice is additive and must never
> block, delay or replace it. If anything below is in doubt, send the text and queue nothing.
>
> Queue it only if ALL of these hold:
> - the spoken text is **40–700 characters** after stripping markdown, links and code;
> - it is **not** a HALT answer (Needs-Steven packet, rate quote, eligibility call, negotiation,
>   signature, legal or compliance interpretation) — those are read and kept, not heard once;
> - it names **no client, address, loan amount or account number**. Audio of client data crossing a
>   third-party messaging API is a disclosure the text reply is not. If it does, queue nothing and
>   log `voice-skipped — client data` in your run note;
> - the thread is **Steven's own number**. Never a client, never a group, never an unknown number.
>
> To queue: read `voiceReplyQueue` from `https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`,
> collection `state`, append ONE item to `items`, keep the newest 10, write the whole document back
> as `data:{v:{items:[…]}}` pinned with `if_version`. Every document in this store is `{v:<value>}` —
> no exceptions; a top level that is not a single `v` key is a bug to fix, not a shape to copy.
>
> ```
> {id: "i" + <base36 ms> + <4 random base36>,   // "i" marks an iMessage-originated item
>  who: "Vanessa",                               // or "Steve" if the twin answered
>  text: "<the spoken text, 40–700 chars>",
>  ts: "<actual UTC now, ISO-8601 with Z>",
>  channel: "imessage",
>  deliver: "imessage",
>  replyTo: "<the conversation_id you just replied on>"}
> ```
>
> Never write any other key of `voiceReplyQueue`, and never remove an existing item other than by
> the newest-10 trim.

### 6b. Append to `voice-reply-render` — REWRITTEN 2026-09-24 (the first version cannot work)

> **Why this was rewritten.** The first 6b told the task to put the MP3's base64 straight into
> `inkbox_media_stage`. Measured 2026-09-24 against the only real clip in the store
> (`voiceReply_teststeve01_0`, 27 s, 108,284 bytes): that is **144,380 base64 characters and
> 135,424 tokens**. No model emits that in one tool call, and at ~270K tokens per voice note it
> would be unaffordable if one could. Both engineers who tested the staging path (P5, R4) stopped
> at a 1,532-byte prefix for this reason and neither claimed a full clip — the first 6b was never
> tested end to end, and it was put on Steven's runbook anyway. It is superseded in full.
>
> **The rule now: the model decides what to voice; a script moves the bytes.** The model never
> sees the audio. `integrations/vanessa-voice-send.py` does the move with the Inkbox Python SDK
> 0.7.7 (MIT), using calls read from the SDK's own source: `upload_imessage_media(content=bytes)`
> returns an **Inkbox-hosted** `media_url`, and `send_imessage(conversation_id=, media_urls=[url])`
> replies into the thread. Inkbox hosting the file itself is what makes this work: R4 found on
> 2026-09-23 that Inkbox cannot fetch a private claude.ai URL, but it can fetch its own.
> Tested 55/55 against the real SDK code path with a local stand-in server, on the real clip and on
> a synthesized one (`integrations/tests/test_vanessa_voice_send.py`). **Never run against live
> Inkbox** — inkbox.ai is egress-blocked from the cloud sandbox and there is no key there.

**Prerequisites (Steven, once):** an Inkbox API key in `~/.inkbox/config` as `api_key = …`
(`chmod 600`; the SDK reads that file because launchd jobs do not inherit shell variables), the SDK
installed by `./MAC-SETUP.sh --only inkbox-voice`, and the Vanessa thread's conversation UUID in
`~/.config/inkbox/voice-allow`, one per line. The script refuses to send anywhere not in that file,
before any network call — a queue item is shared-store data, the allow file is local to the Mac.

**Paste this, replacing the first 6b in full:**

> **Deliver the audio when the queue item asks for it.** After you have written all
> `voiceReply_<id>_<n>` parts and set `voiceReplyStatus.items[<id>].status = "ready"`, look at the
> queue item's `deliver` field. If it is absent or null, stop — the dashboard plays it, exactly as
> today. That path is unchanged.
>
> If `deliver` is `"imessage"`:
> 1. **Save the parts to disk without reading them.** For each part, call the Artifact database
>    `get` for `voiceReply_<id>_<n>` with `out_dir` = `~/.cache/vanessa-voice/<id>`. The tool writes
>    the file; you only see its path. **Never put the audio field into any tool call yourself.**
> 2. **Run the delivery script once:**
>    `~/Applications/inkbox-voice/.venv/bin/python <repo>/integrations/vanessa-voice-send.py
>    --conversation-id <replyTo> --parts "~/.cache/vanessa-voice/<id>/state/voiceReply_<id>_*.json"`
> 3. **Read its one line of JSON** and record it on the status document, whether it worked or not:
>    `voiceReplyStatus.items[<id>].delivered = {channel: "imessage", at: "<actual UTC now>",
>    ok: <its ok>, bytes: <its bytes>, error: <its error, verbatim, or null>}`.
> 4. Delete `~/.cache/vanessa-voice/<id>` whatever happened.
>
> Its exit codes: 0 sent · 2 bad arguments · 3 bad or incomplete parts · 4 over the 10 MiB cap ·
> 5 conversation not allow-listed · 6 Inkbox refused or failed · 7 SDK not installed. **Do not run
> it twice for one item** — the script makes exactly one send attempt, and a duplicated voice note
> is worse than a missing one. A 5 or a 7 is a setup problem: say so in `ciLog` in plain words.
>
> Delivery failure is never silent and never fatal: leave `status: "ready"` alone so the dashboard
> can still play it, and carry on to the next item.
>
> `deliver` values other than `"imessage"` are not implemented here. Record
> `delivered: {channel: <value>, ok: false, error: "channel not implemented"}` and move on.

### 6c. Append to `voice-reply-render` — the email path (NEW 2026-09-23, R4)

> **DO NOT PASTE AS WRITTEN — same defect as the first 6b (found 2026-09-24).** Step 2 below puts
> "standard base64 of the MP3 bytes" into `inkbox_email_attachment_upload`. It checks that against
> the 1 MiB MCP request limit, which a 27-second clip does fit — but not against the model, which
> would have to emit that base64 itself: **~135,000 tokens for one 27-second clip.** The staging proof
> behind this section used a 1,532-byte prefix, which is why it looked fine. The fix is the 6b
> pattern: `ArtifactData get` + `out_dir` to disk, then a script that uploads the bytes with the
> Inkbox SDK so the model never touches them. Not built yet, because nothing reads the mailbox and
> Steven has not decided he wants it (runbook G3). Build it when he does; until then this section is
> a design record, not a paste.

**Read this before pasting.** Email is the second channel on which Vanessa can genuinely speak, and
the staging call was proven on 2026-09-23: `inkbox_email_attachment_upload` accepted real clip bytes
as `audio/mpeg` and returned a handle. **But nothing writes an email queue item today, because there
is no email inbox task** — `vanessa-imessage-inbox`, `vanessa-discord-inbox` and
`vanessa-whatsapp-inbox` exist; there is no `vanessa-email-inbox`, and nothing in the repo reads the
`jasmine@inkboxmail.com` mailbox. So pasting this block is safe and correct and changes nothing
until that task exists. Creating it is Steven's call — see `docs/NEEDS-STEVEN-R4.append.md`.

> **If `deliver` is `"email"`:** the reply is answered in text first, exactly as on every other
> channel, and the clip is attached to that reply. Do this only after `voiceReplyStatus.items[<id>]
> .status = "ready"`, and only for a thread Steven himself is on — the same allow-list rule as
> iMessage, and never a client, a group or an unknown address.
>
> 1. **Concatenate the parts into ONE clip**, as for iMessage. One attachment per reply.
> 2. Stage it: `inkbox_email_attachment_upload` with `filename: "vanessa-reply.mp3"` and
>    `source: {kind: "base64", content_type: "audio/mpeg", data: <standard base64 of the MP3 bytes>}`.
>    Same base64 rules as §6b — **no data-URI prefix**, no URL-safe alphabet, `=` padding present.
>    Inline base64 is bounded by "the whole MCP request must stay under 1 MiB"; a 27-second clip is
>    about 141 KiB of base64, so a reply at the spec's 700-character ceiling is nowhere near it.
> 3. **Verify the staged file, which you CAN do on this channel.** The response is
>    `{media_handle, filename, content_hash, content_type, size_bytes, expires_at}`, and unlike the
>    iMessage path `content_hash` here is a **real SHA-256 of the file bytes** — measured, not
>    assumed. Check `content_hash` against your own sha256 of the clip AND `size_bytes` against your
>    byte count. If either differs, the staged file is not your clip: record the error and do not
>    send. The handle is short-lived (`expires_at` comes back the same run) — **stage and send in
>    one run**, never across polls.
> 4. Send it: `inkbox_email_reply` with the item's `replyTo` as `message_id`, the original sender in
>    `approved_recipients.to`, `reply_all: false`, your text body, and
>    `attachments: [{media_handle, filename, content_hash, content_type}]` — all four fields copied
>    verbatim from the staging response. Never `reply_all` and never a `cc` or `bcc` you were not
>    given.
> 5. Record the outcome exactly as §6b does:
>    `voiceReplyStatus.items[<id>].delivered = {channel: "email", at: "<actual UTC now>", ok: <bool>, error: "<verbatim, or null>"}`.
>
> Same failure rules as §6b: never silent, never fatal, never more than one retry, and `status`
> stays `"ready"` so the dashboard can still play the clip.

### 6d. Append to `voice-reply-render` — the link path for Discord and WhatsApp (NEW 2026-09-23, R4)

**Read this before pasting, because it is easy to oversell.** This does **not** make Vanessa speak
on Discord or WhatsApp. Neither channel can carry an audio file and neither ever will — that is
settled in `vanessa-voice-everywhere.md` and nothing found on 2026-09-23 changed it. What this does
is give a text reply on those channels a URL that Steven can tap to hear her. **The URL is private:
it opens only in a browser already signed in to Steven's own account** — two unauthenticated
fetchers were refused on 2026-09-23 — so it is useful to Steven and useless to anyone else, which
is correct, because Steven is the only permitted recipient. Neither channel is connected today, so
this block is inert until one of them is. Paste §6c first.

> **If `deliver` is `"discord"` or `"whatsapp"`:** do not attempt to send audio. There is no media
> send path on either channel. Instead publish the clip where a link can reach it, and let the inbox
> task put that link in its text reply.
>
> 1. **Concatenate the parts into ONE clip**, as for iMessage.
> 2. Write it to the relay artifact `https://claude.ai/artifact/EJnetbUCFscnDsDWFdp9Ti`, collection
>    `clip`, document `<the queue item id>`, as
>    `data:{v:{id, who, ts, durationSec, bytes, contentType:"audio/mpeg", text, audio}}` where
>    `audio` is **standard base64 with no data-URI prefix** — same rule as every other channel.
>    Pin the write with `if_version` when you are overwriting a document you read.
> 3. Write the pointer: `clip/newest` = `{v:{id: "<the same id>", ts: "<actual UTC now>"}}`.
> 4. **Prune in the same run.** List the `clip` collection and delete every clip document except the
>    newest 10, leaving `clip/newest` alone. Ten matches the cap `voiceReplyQueue` already keeps, so
>    a clip lives exactly as long as the queue item that made it. At about 145 KB a document that is
>    ~1.45 MB at rest. Do not create a new artifact per reply — one artifact, written often.
> 5. Record the outcome, and put the link in it so the inbox task can read it back:
>    `voiceReplyStatus.items[<id>].delivered = {channel: <value>, at: "<actual UTC now>", ok: <bool>,
>    link: "https://claude.ai/artifact/EJnetbUCFscnDsDWFdp9Ti#<the queue item id>", error: "<verbatim, or null>"}`.
>
> The inbox task appends that `link` to its text reply, in Steven's own words, e.g. `Heard version:
> <link>`. It must say nothing that implies she spoke on the channel, and it must never send the
> link to anyone but Steven.
>
> **What is not proven and must not be claimed:** that a signed-in browser plays the page. The bytes
> were verified present, byte-identical and private on 2026-09-23; no browser was available, so page
> load and playback were never observed. The first real tap is what settles it.

### What proves it worked

Text Vanessa something that takes more than a sentence. Within ~20 minutes: a text reply, then her
voice on the same thread. If only the text arrives, read `state/voiceReplyStatus` — `status` says
whether it rendered, `delivered.ok` says whether it sent, and `delivered.error` says which failed.

For §6c, the same test by email once an email inbox task exists: a written reply, with
`vanessa-reply.mp3` attached. `delivered.channel` reads `"email"`, and a `content_hash` mismatch is
the one failure that is the renderer's own fault rather than the channel's — it means the staged
file was not the clip, and the send was correctly refused.

For §6d there is nothing to hear. The proof is that `delivered.link` is present and that tapping it
in a signed-in browser plays the clip. If it asks for a sign-in instead, that is the design working,
not a fault — the link is private, and nobody but Steven can open it.
