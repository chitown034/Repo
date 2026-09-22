---
name: lofty-crm-sync
description: "Sync Lofty (formerly Chime), Steven's real-estate CRM since 2026-09-22, into the Command Deck — writes the loftyLeads doc (stage totals, 90-day new leads, speed-to-lead) and points the lead-triage / lead-response / ISA-KPI docs at Lofty. Use when Steven asks to run the Lofty sync, refresh CRM numbers, check speed to lead, or when the Live CRM import card is empty."
---

# lofty-crm-sync — Lofty → Command Deck

Status today (verified 2026-09-22): **Lofty is Steven's real-estate system of record**, his call of
2026-09-22, and the only real-estate CRM this skill may name. Composio has **no Lofty toolkit**
(searched — there is none). The Mac has two paths:
`lofty-bridge` (local read-only MCP over Lofty's REST API, status RUN, `claude mcp` shows server
`lofty` connected) and `lofty-cli` (npm `@loftyai/lofty-cli`, status RUN). **Whether the API key is
actually present in `~/.config/lofty/.env` has not been verified from the cloud.** Until a run
proves it, every Lofty number on the deck is "awaiting first sync", not "live".

API facts used here (confirmed 2026-09-22 via developer.lofty.com / api.lofty.com/docs):
Lofty Open API, base `https://api.lofty.com`, two auth methods — API key (`Authorization: token
<apiKey>`) and OAuth 2.0 (Bearer, vendors approved on the Developer Platform). `GET /v1.0/me`
confirms a key works; `GET /v1.0/leads` lists leads; `GET /v1.0/leads/{id}/activities` returns a
lead's activity timeline. Some endpoints (e.g. published listings) are OAuth-only.

## Inputs
- **Mac path (preferred):** MCP server `lofty` (lofty-bridge), read-only. Key read from
  `~/.config/lofty/.env` by the bridge — the skill never reads or prints the key itself.
- **Cloud fallback:** `LOFTY_API_KEY` present in the environment → direct REST. If it is absent,
  this is **not** an error to work around: write `status:"not-configured"` and stop.
- Existing docs: `loftyLeads`, `leadTriage`, `leadResponse`, `isaKpi` (collection `state`).

## Outputs — `loftyLeads`, exactly this shape
```
{v:{ syncedAt, source:"Lofty via lofty-bridge MCP (Mac)" | "Lofty REST API (cloud)",
     status:"ok"|"not-configured"|"error", error: string|null,
     stageTotals: [[stage, n], ...],
     newLeads90d: [{name, stage, ageDays, source, created}, ...],
     firstResponse: {medianMin, over5, sample} }}
```
- `stageTotals` — Lofty's own stage names, in Lofty's own order. Do **not** remap them onto any
  other CRM's stage list; the card renders whatever the doc carries.
- `newLeads90d` — leads created in the last 90 days, newest first. `ageDays` is age **at pull time**.
  `name` is first name + last initial (the deck is shared on-screen); never a full contact record,
  never a phone number or email.
- `firstResponse` — from the activity timeline: minutes from lead `created` to the first outbound
  call/text/email logged in Lofty. `medianMin` over the sample, `over5` = count breaching the
  5-minute standard, `sample` = leads that actually had a timeline to measure.
  A lead with no logged contact is **excluded from the median and counted in `over5`** only if its
  age exceeds 5 minutes — and the coverage limit goes in the note: contact made outside Lofty is
  invisible to Lofty, so this reads "no contact logged", not "no contact happened".

## Procedure
1. **Self-test the connection first — always, before any read.**
   - Mac: call the `lofty` MCP server's status/ping verb. Cloud: `GET /v1.0/me` with
     `Authorization: token $LOFTY_API_KEY`.
   - 200 → continue. 401/403 → `status:"error"`, `error` = the verbatim message. No key / no server
     → `status:"not-configured"`, `error:"LOFTY_API_KEY not set — Lofty Settings → Integrations → API"`.
   - On anything but 200: write the `loftyLeads` doc with that status, an empty `stageTotals`,
     `newLeads90d: []`, `firstResponse:{medianMin:null,over5:null,sample:0}`, and **stop**.
2. Pull stage totals (`GET /v1.0/leads`, paginate, group by stage). Pull leads created in the last
   90 days. For each of those leads pull `/v1.0/leads/{id}/activities` (rate-limit friendly: batch,
   stop at 200 leads, and say in the note if you truncated).
3. Compute `firstResponse`. If fewer than 5 leads have a measurable timeline, still write the
   numbers but set the note to "sample too small (n=<k>) — raw value only", matching how `isaKpi`
   already phrases small samples.
4. **Preserve deck-only rows.** Read the existing `loftyLeads` doc first. Any `newLeads90d` row
   carrying `local:true` — a lead Steven typed onto the deck that was never created in Lofty — is
   carried into the new array unchanged, with `local:true` intact, and counted in `stageTotals`.
   The §4 shape does not list `local` because nothing has written one yet; honour the flag if it
   appears rather than silently dropping the row. A sync that deletes Steven's own entries is a
   data-loss bug, not a refresh.
5. `write_db` **set**, collection `state`, doc `loftyLeads`, `{v: <payload>}`.
6. **Re-point the three downstream docs** (same run, same honest rules):
   - `leadTriage` — keep its shape (`gaps, history[], metrics{medianFirstResponseMin, over5, total},
     missingNext[], newLeads, note, ranAt, source, suggested[], window`). Set
     `source:"Lofty via lofty-bridge"`. Its current contents are a **failure record**:
     `source:"unavailable"`, ranAt 2026-09-21T18:33Z, no working CRM credential. Replace it only
     with a successful Lofty pull; on failure write a new failure record naming **Lofty**.
   - `leadResponse` — keep its shape (`breaches, leads[], leadsChecked, medianMinutes, source,
     status, syncedAt, target:5, windowStart, failedAt, failureReason, staleSince`). Set
     `source:"Lofty via lofty-bridge"`. Its current `status:"failed"` stands until a Lofty run
     succeeds.
   - `isaKpi` — keep its shape (`metrics[{name, actual, target, sample, note}], syncedAt,
     weekEnding`). Every note must name **Lofty** and no other CRM. A row whose number did
     not come from Lofty is dropped, not relabelled — never present another system's figure as a
     Lofty figure; where there is no Lofty number, the note reads "not connected yet".
7. The deck must display each doc's own `source` string. Never hard-code a CRM name in the page.

## Task re-pointing (hand to Derek's automation-engineer)
| Task | Cron (PT) | Today | After |
|---|---|---|---|
| `r2-lead-response-watchdog` | `10,40 7-19 * * *` | ok, but no working CRM credential since 2026-09-16 | read Lofty timeline → `leadResponse` |
| `lead-triage-daily` | `33 11 * * 1-5` | ok, but no working CRM credential | read Lofty → `leadTriage` |
| `r11-isa-kpi-compile` | `40 4 * * 0` | never run | read Lofty → `isaKpi` |
| `showing-sync` | `15 8,12,16 * * 1-6` | ok | create Lofty appointments |
| `lofty-crm-sync` (new) | `5 7,13,19 * * *` | does not exist | writes `loftyLeads` |
The `fub-followups` Mac skill (legacy template library — folder name unchanged on the Mac) still
exists and needs porting to Lofty — separate ticket, not this skill's job.

## Guardrails
- **Never fabricate CRM data.** No lead, stage count, median or breach that did not come from a 200
  response this run. An empty CRM is a fact; an invented one is a fired-employee event.
- Never present another system's numbers as Lofty numbers, and never carry a legacy CRM import
  forward onto the deck. Where there is no Lofty number the surface says **"not connected yet"** —
  never a substituted figure.
- Read-only. This skill never creates, updates or deletes anything in Lofty.
- No API key in prompts, logs, task text, findings or the deck. The bridge holds it; you don't.
- No full contact details (phone, email, street address) leave Lofty into the deck.

## HALT conditions
- Any write to Lofty is requested → stop, escalate to Steven (write-back is an L2 proposal, not built).
- The key is missing or rejected → `not-configured` / `error`, stop. Do **not** try another
  credential, another account, or any other CRM connection.
- Lofty returns a lead set drastically smaller than the last successful run (>50% drop) → write the
  doc with `status:"error"`, note the drop, and ask Steven before overwriting the good numbers.

## Logging
Append `{ts, task:"lofty-crm-sync", path:"mcp"|"rest", status, leads, stages, sampled, error}` to
doc `loftySyncLog` (`read_db` get → missing means `[]` → `write_db` **set**); keep the last 200.

## Self-test
1. `GET /v1.0/me` (or MCP ping) → expect 200 with an account identity.
2. Pull 1 lead → assert `stageTotals` is `[[string, number], …]` and every `newLeads90d` row has all
   five keys.
3. Force the auth call to fail → assert the doc is written with `status:"error"`, an empty
   `stageTotals`, and that `leadTriage`/`leadResponse`/`isaKpi` were **not** touched.
4. Run twice in a row → assert idempotence (same stamps except `syncedAt`).

## The one line Steven has to do
**In Lofty go to Settings → Integrations → API, generate an API key, and put it in
`~/.config/lofty/.env` on the Mac as `LOFTY_API_KEY=…` — then run `lofty-crm-sync` once to prove it.**
