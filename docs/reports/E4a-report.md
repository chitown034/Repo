# E4a — CRM integration (Follow Up Boss → Lofty, Zoho live)

**Branch** `e4a-crm` · worktree `scratchpad/wt-e4a-crm/command-deck.html`
**Baseline 2026-09-12 · verified 2026-09-22** · Loop Cycle 6
**Findings:** 16 (`audit/findings-E4a.json`), 4 flagged `halt:true`

---

## 1. What changed

### 1.1 Live CRM import card → Lofty (panel-property)

| | Before | After |
|---|---|---|
| Title | "Real estate — Follow Up Boss (live)" | "Live CRM import — Lofty (real estate)" (`#loftyCrmCard`) |
| Data source | two frozen arrays, 2026-09-07 hand pull | `lsGet("loftyLeads", null)` |
| Empty state | none — the frozen numbers *were* the state | gray `#loftyStateBadge` "Awaiting first sync" + an explicit paragraph naming `lofty-bridge`, `lofty-cli` and the pending API key |
| FUB history | presented as current | collapsed `#loftyLegacyFub` — "Last Follow Up Boss import, 2026-09-07 — retired 2026-09-22 (history only)" |

New ids (all verified unique before use): `loftyCrmCard`, `loftyStateBadge`, `loftySyncNote`, `loftyStageStats`, `loftyFirstResp`, `loftyNewCount`, `loftyNewLeadRows`, `loftyLegacyFub`.
New JS: `LOFTY_SYNC_AT` (deliberately `null`), `LOFTY_STATUS_TEXT`, `crmStamp`, `crmText`, `loftyArr`, `loftyDoc`, `loftyEmptyState`, `renderLoftyImport` — wrapped as `safeRun("renderLoftyImport", …)`.
Existing `fub*` ids and `FUB_*` identifiers were **kept** per the editing rules and now fill the collapsed block; `renderFubImport`'s text was rewritten to "Frozen history … nothing will ever refresh these figures again … treat every number here as *was Follow Up Boss until 2026-09-22*".

Four states render correctly: **no doc** → awaiting first sync; **`status:"not-configured"`** → amber "Key pending" + the key path; **`status:"error"`** → red "Last sync failed" + the reported error; **`status:"ok"`** → green "Live · <time>", stage tiles, the 90-day table and the speed-to-lead line from `firstResponse` (or an explicit "not measured in this sync" when the timestamps are missing).

### 1.2 Zoho card (panel-property)

* `#zhApiBadge` is no longer a hard-coded red span. `renderZohoStatus()` reads `zohoSync`: green **Live via Composio · synced \<time\>** when `status:"ok"`, red with the exact error plus the Zoho-side fix when `blocked`/`error`, gray **Never checked** when the doc is absent. New `#zhBlockedNote` carries the error and fix text in full.
* New **Mortgage pipeline — Zoho deals** table (`#zhDealsCard`, `#zhDealsNote`, `#zhDealsStats`, `#zhDealsRows`) reading `zohoDeals` — stage counts, total amount, top 20 by `modified`. `renderZohoDeals()` falls back to summing `amount` when `totalAmount` is unusable, and never fabricates a total.
* `renderZohoBoard` still reads `zohoLeads`; `ZH_STAGES` untouched.
* Copy rewritten: `#zhHint` and the create-form note now say Zoho CRM is the system of record, a deck move is an annotation **the next sync overwrites**, and write-back is an **L2 proposal, not built**. The old "NOT created in Zoho until API access is granted" wording (which implied write-back would begin once access landed) is gone.
* Added a `data-copy` button carrying the full Zoho sync prompt (writes `zohoSync` / `zohoLeads` / `zohoDeals` to the §4 shapes, maps unknown statuses to `UnAccounted`, preserves `local:true` deck-only leads, and on 403 writes only `zohoSync` with `status:"blocked"`).

### 1.3 Connectivity card (end of panel-easop)

Rewritten to §2 facts: Zoho (connected / API blocked / exact fix path), Lofty (Mac bridge + CLI, key pending, no Composio toolkit), Follow Up Boss (retired 2026-09-22, the four Mac tasks still pointing at it named), the real Composio catalog, CLI-Anything for homes.com / SkySlope / zipForms (DOMShell path, hub has no CRM entries, nothing installed on the Mac), Orca as a candidate executor, the connected/not-connected connector lists, and **You.com — retired 2026-09-22**. The old claim "FUB fully working" is gone. Three `data-copy` prompt buttons added (Lofty sync, Zoho sync, CLI-Anything install) — they inherit the page's existing global `[data-copy]` handler, no new wiring.

### 1.4 The three "Follow Up Boss import" label lines

All three renamed to **"Lofty CRM import"** and pointed at `lofty-crm-sync`:

| Line | Construct | Change |
|---|---|---|
| 7653 | `LIVE_FEED_ISO` | now reads `loftyLeads.syncedAt` (was `leadTriage.ranAt`) |
| 19968 | `FRESH_FEEDERS` | note describes the `lofty-crm-sync` task and states plainly that it has never run |
| 20748 | `execSyncRegistry` `add()` | passes `LOFTY_SYNC_AT` (`null`) so the registry renders the honest "No date on record" row |

**This fixed a real bug (F-E4a-08):** `leadTriage.ranAt` is stamped even when the run *fails*. Every `lead-triage-daily` run since 2026-09-16 has failed authentication and written `source:"unavailable"` with null metrics — yet `ranAt` was 2026-09-21T18:33Z, so the freshness board was rendering a **failed** run as a fresh import.

---

## 2. Gate results

| Check | Result |
|---|---|
| `python3 tests/quickcheck.py` | PASS on every line except the known false-positive undefined-function line, which is **byte-identical to the baseline deck's** (`diff` clean) — no new names introduced |
| `node --check` on the extracted inline script | PASS (via quickcheck) |
| Element ids referenced by new JS | all 19 present exactly once; "no duplicate element ids" PASS |
| Full inline-script execution under `tests/dom-shim.js` (Node `vm`) | no top-level throw, 857 ms, no `RENDER_FAILURES` |
| Null / `[]` / `{}` / `"string"` / wrong-typed `loftyLeads`, `zohoSync`, `zohoDeals` | 8 injected cases, 0 failures, no throws, escaping verified (`<script>` and `&` escaped through `chatEsc`) |
| Forbidden regions | `git diff` touches none of: footer build stamp, `PAGE_DEFS`, `panelStampRegistry`, the MASTER PLAN comment, the final `</script>`, `OUTPUT_WATCH` |

Diff: **235 insertions, 26 deletions**, confined to 8 hunks — all inside the assigned regions.

---

## 3. Remaining "Follow Up Boss" / "FUB" occurrences OUTSIDE E4a's regions

| Line | Panel / construct | Owner | "Follow Up Boss" | "FUB" | Text (trimmed) |
|---|---|---|---|---|---|
| 2254 | panel-property | E4b | 1 | 0 | <tr><td><b>Follow Up Boss</b></td><td>Real-estate system of record — every lead, task, showing feedback</td><td><a href="https://app.followupboss.com/" tar |
| 2917 | panel-property | E4b | 0 | 1 | <p class="card-sub" style="margin-top:0;">From your own Realtor Playbook (SPACE/LPT operating manual). FUB pipeline: Lead → Hot Prospect → Nurture → Active |
| 2923 | panel-property | E4b | 0 | 1 | <li><b>Offer/contract → TC handoff</b> — signed offer moves to "Pending" in FUB, handed to Transaction Coordinator, who owns everything from here.</li> |
| 4288 | panel-showings | E4b | 1 | 1 | <div><p class="card-title">Clients</p><p class="card-sub">One row per active buyer. Contact details stay in Follow Up Boss (the real-estate system of recor |
| 4294 | panel-showings | E4b | 2 | 0 | <input type="text" id="shNewClientFub" aria-label="Follow Up Boss person link (optional)" placeholder="Follow Up Boss person link (optional)" autocomplete= |
| 4378 | panel-easop | E4b | 1 | 0 | <div><p class="card-title">Daily lead triage — speed-to-lead</p><p class="card-sub">The <code>lead-triage-daily</code> desktop task (11:40 AM, Mon–Fri, bef |
| 4411 | panel-easop | E4b | 0 | 1 | <tr><td>Pull Steven's calendar, past 7 days</td><td>Google Calendar × Zoho (mortgage) × FUB (real estate)</td><td>Raw hours by category</td></tr> |
| 4456 | panel-easop | E4b | 1 | 0 | <div><p class="card-title">ISA KPI scorecard — real estate &amp; mortgage</p><p class="card-sub">Pulled directly from the VA/ISA SOP, Section 16 — filtered |
| 4674 | panel-aiteam | E6 | 0 | 2 | <input type="text" id="twinTaskInput" aria-label="One line is enough — e.g. Draft follow-ups for every FUB lead with no next step" placeholder="One line is |
| 4789 | panel-aiteam | E6 | 1 | 0 | <tr><td><b>Derek</b> · CTO</td><td>Automation audit (what runs unattended vs. manual, next automation as 4 COAs) · Tool-stack review (Zoho + ARIVE, Follow  |
| 4792 | panel-aiteam | E6 | 1 | 0 | <tr><td><b>Victor</b> · CRO</td><td>Weekly pipeline review (stale stages, 30/60/90 closings) · Call-prep sheet for one lead · 5-minute response audit from  |
| 5028 | panel-masterplan | E1 | 1 | 0 | <li>Tech: Follow Up Boss / Sierra Interactive CRM, ReferralExchange/Airtable tracking, co-branded landing pages</li> |
| 5033 | panel-masterplan | E1 | 1 | 0 | <p class="card-sub">Stack: WebinarJam/Zoom · Follow Up Boss/HubSpot · ActiveCampaign · ClickFunnels/Unbounce · GTM+GA4 · CallRail · Smarsh/Global Relay (co |
| 6456 | panel-opsradar | E1 | 1 | 0 | <div class="card-title-row"><div><p class="card-title">Speed-to-lead</p><p class="card-sub" style="margin:0;">Your first SOP metric: median time from a Fol |
| 14105 | panel-easop — SOD_ITEMS (ISA start-of-day checklist) | E4b | 0 | 1 | "Review Zoho CRM new mortgage leads, hot leads, overdue tasks, appointment status, unassigned contacts — then FUB for real estate", |
| 14106 | panel-easop — SOD_ITEMS (ISA start-of-day checklist) | E4b | 0 | 1 | "Check inbound channels: FUB Phone, Zoho telephony/SMS, email, social DMs, portal dashboards, Slack, voicemail", |
| 14287 | panel-easop — ONBOARD_PHASES (ISA onboarding) | E4b | 0 | 1 | "Audit Zoho CRM and FUB, calendars, active loans, transactions, referrals, recruiting pipeline, campaigns, automation health", |
| 14354 | panel-easop — TECH_STACK seed → #techStackRows | E4b | 1 | 0 | ["Follow Up Boss","https://followupboss.com","4.1, 4.4"], |
| 15916 | panel-appointments — TRACKED_CALENDARS | E1 | 1 | 0 | ["Follow Up Boss (appointments &amp; tasks)", "7fe2cd2f185b5bf6205f4de2e5e162b421370c4dc9208b2161427c14b5f9e291@group.calendar.google.com", "https://calend |
| 18030 | panel-kanban — KANBAN_ROUTINES kr23 | E1 | 1 | 0 | { id: "kr23", text: "Dual-CRM hygiene pass \u2014 Follow Up Boss (real estate) and Zoho + ARIVE (mortgage): stale records, missing next task, duplicates, s |
| 18363 | panel-processexcellence — CI_LOG_DEFAULT 2026-09-07 entry (historical record — leave as written) | E1 | 1 | 0 | { date: "2026-09-07", text: "Freshness sweep + weather/news cadence. Steven asked for news and weather to refresh at least three times a day and on every b |
| 18437 | panel-processexcellence — DMAIC_DEFAULT d3 | E1 | 0 | 1 | { id: "d3", text: "Speed-to-lead response time", phase: "Define", note: "Define phase: no baseline measured yet — needs a real timestamp-to-first-contact m |
| 19050 | panel-opsradar — renderSpeedToLead empty state | E1 | 1 | 0 | body.innerHTML = '<div class="p9-empty"><b>Nothing measured yet</b>This fills automatically once the lead-response watchdog runs on the Mac (every 30 minut |
| 22205 | panel-vanessa — sendVanessaMessage system preamble | E6 | 2 | 0 | var systemPreamble = "You are Vanessa, Chief of Staff / Executive Assistant / COO for Steven Shearrill. WHO STEVEN IS — know this cold and never ask him to |
| 23848 | panel-aiteam — Steve twin systemPrompt | E6 | 1 | 0 | systemPrompt: "You are Steve — the digital twin of Steven Shearrill, speaking in the first person AS Steven, not as an assistant to him. HARD FACTS ABOUT Y |
| 24942 | panel-aiteam — isaLineDraft prompt | E6 | 1 | 0 | : "You are Vanessa, Chief of Staff / EA / COO for Steven Shearrill. You are drafting a reply, in Vanessa's voice, that Steven will read, edit and send to h |
| 24988 | panel-aiteam — AI_TEAM_ORG, Steven's tools | E6 | 1 | 0 | { name: "Steven", role: "Broker (LPT Realty) · MLO (Patriot Pacific) · Principal", owns: "Every licensed decision, rate quote, eligibility call, negotiatio |
| 24999 | panel-aiteam — AI_TEAM_ORG, Victor's tools | E6 | 1 | 0 | { name: "Victor", role: "Chief Revenue Officer", owns: "Pipeline math, speed-to-lead, conversion, follow-up cadence, ISA performance, the scorecard and the |
| 25008 | panel-aiteam — AI_TEAM_ORG, human ISA tools | E6 | 1 | 0 | { name: "ISA / EA (human)", role: "Inside Sales Agent · 12–4 PM Mon–Fri", owns: "First response, follow-up, qualification, appointment setting, confirmatio |
| 25011 | panel-aiteam — AI_TEAM_TOOLBOX, Connectors row | E6 | 1 | 0 | ["Connectors (claude.ai)", "Gmail (read + drafts) · Google Calendar (read) · Notion · Slack — Patriot Pacific workspace, read-only: the twin digests loan-f |
| 25048 | panel-aiteam — ORG_CHART, Nadine | E6 | 0 | 1 | { kind: "report", name: "Nadine", role: "Email & Lifecycle Campaigns", owns: "Nurture, reactivation, newsletters and post-close sequences across FUB and Zo |
| 25125 | panel-aiteam — ORG_CHART, Priya | E6 | 0 | 1 | { kind: "report", name: "Priya", role: "Lead Triage Analyst", owns: "New FUB leads, 5-minute-SLA gaps, missing next tasks, suggested next action, ISA-line  |
| 25346 | panel-showings — SH_INTEGRATIONS | E4b | 1 | 3 | ["Follow Up Boss", "Confirmed showings are logged on the client's FUB record as appointments/notes by the sync task.", ["green", "Composio connected"], "Ve |
| 25392 | panel-showings — renderShowings client row link | E4b | 1 | 0 | '<div style="flex:1;"><div class="er-title">' + chatEsc(c.name) + '</div><div class="er-sub">' + open + ' open showing' + (open === 1 ? "" : "s") + (c.fub  |
| 25487 | panel-showings — renderShowingSync copy text | E4b | 0 | 1 | var text = "Showing plan for " + sel.name + (sel.fub ? " (FUB: " + sel.fub + ")" : "") + " — please coordinate:\n" + open.map(function (x, i) { |
| 25490 | panel-showings — renderShowingSync copy text | E4b | 1 | 0 | }).join("\n") + "\nThen: confirm access, send the buyer the confirmation with times, and log feedback in Follow Up Boss with a dated next step. Mark each r |
| 25613 | panel-showings — srCopy itinerary text | E4b | 1 | 0 | "4) After each stop, log feedback in Follow Up Boss with a dated next step.\n\n" + srItineraryText(s); |

**37 lines outside E4a's regions carry the literal text; 28 "Follow Up Boss" + 16 "FUB" occurrences.**

Lower-case `fub` identifiers (data keys, not user-visible copy — renaming them would break stored `shClients` rows, so leave them):

| Line | Panel / construct | Owner | Text (trimmed) |
|---|---|---|---|
| 25429 | (JS/module scope) | ? | var s = shState(); var c = { id: shId("cl"), name: name, fub: ($("shNewClientFub").value \|\| "").trim(), showings: [] }; |
| 25430 | (JS/module scope) | ? | s.clients.push(c); s.selected = c.id; shSave(s); $("shNewClient").value = ""; $("shNewClientFub").value = ""; renderShowings(); |
| 25500 | (JS/module scope) | ? | var targets = ["gcal", "fub"]; if (x.method === "showami") targets.unshift("showami"); if (x.method === "showingtime") targets.unshift("showingtime"); |
| 25501 | (JS/module scope) | ? | reqs.push({ id: shId("sync"), ts: new Date().toISOString(), clientId: sel.id, clientName: sel.name, clientFub: sel.fub \|\| "", showingId: x.id, targets: tar |

Excluded as false positives (incidental `FUB` substring inside base64 media blobs — must NOT be edited): lines 845, 6678, 22971, 22982.

**Routing summary:** E4b owns 17 lines (panel-property 3, panel-showings 7, panel-easop 7) · E6 owns 12 (panel-aiteam 11, panel-vanessa 1) · E1 owns 8 (panel-masterplan 2, panel-opsradar 2, panel-processexcellence 2, panel-appointments 1, panel-kanban 1).

**Highest-consequence six** — these are not cosmetic; they are what the AI team is *told* the system of record is, so an agent reading them will keep routing real-estate work to a retired CRM:

* **22205** `sendVanessaMessage` system preamble — "Follow Up Boss is the system of record for every real-estate lead, contact and referral" (twice in the same prompt).
* **23848** Steve digital-twin `systemPrompt` — same statement, first person.
* **24942** `isaLineDraft` prompt — "dual-CRM, never blended (Zoho CRM + ARIVE for mortgage; Follow Up Boss for real estate)".
* **24988 / 24999 / 25008** `AI_TEAM_ORG` — Follow Up Boss listed in Steven's, Victor's and the human ISA's tool lists.
* **25011** `AI_TEAM_TOOLBOX` Connectors row — "Composio → Follow Up Boss, Zoho (pending Zoho API permission)".
* **25346** `SH_INTEGRATIONS` — the showing-sync integration row still claims a green "Composio connected" FUB status, which is false as of 2026-09-16.

**Leave as written:** line **18363** is the dated 2026-09-07 CI-log entry. It is a historical record of what happened that day and rewriting it would falsify the log.

**Do not touch:** lines **845, 6678, 22971, 22982** — `FUB` appears as an incidental substring inside base64 image/audio/video data URIs.

---

## 4. Mac task rewiring list — for Derek's automation-engineer

Source: `inventory/mac-runner-status.md`, `inventory/routine-health.md`, `inventory/mac-task-descriptions.md`, and the live docs in `db/state/`.

| # | Task | Cron (Mac clock) | Last run / state | Writes doc | Reads today | Re-point to | Required `source` string after rewiring |
|---|---|---|---|---|---|---|---|
| 1 | `r2-lead-response-watchdog` | `10,40 7-19 * * *` | 2026-09-21T20:02:33 — **ran, FUB auth failed**; `leadResponse` correctly holds `status:"failed"`, `failureReason:"Invalid API Key…"`, stale since 2026-09-16T02:42:40Z | `leadResponse` | Follow Up Boss via Composio | Lofty activity timeline via `lofty-bridge` MCP | `"Lofty via lofty-bridge"` |
| 2 | `lead-triage-daily` | `33 11 * * 1-5` | 2026-09-21T19:20:32 — **ran, FUB auth failed**; `leadTriage` holds `source:"unavailable"`, null metrics, and an honest no-findings note | `leadTriage` | Follow Up Boss `/v1/people` via Composio | Lofty leads + timeline via `lofty-bridge` | `"Lofty via lofty-bridge"` |
| 3 | `r11-isa-kpi-compile` | `40 4 * * 0` (Sun) | **NEVER RUN** under claude-runner — zero execution evidence; `isaKpi` is the 2026-09-13 pre-migration copy whose notes cite "calls/texts logged in FUB only" as a coverage limit | `isaKpi`, `isaScorecard` | Follow Up Boss events | Lofty events; keep Zoho for the mortgage rows | `"Lofty via lofty-bridge"` (real-estate rows) |
| 4 | `showing-sync` | `15 8,12,16 * * 1-6` | 2026-09-21T19:26:40 — **ok**, queue empty, status-only | `showingSyncRequests` | creates Google Calendar events **and Follow Up Boss appointments/notes** | Lofty appointments/notes | `"Lofty via lofty-bridge"` |

**New tasks to create** (specs owned by E11b; the deck is already coded to read their output):

| Task | Cron | Writes | Notes |
|---|---|---|---|
| `lofty-crm-sync` | proposed daily + midday; the deck's `OUTPUT_WATCH` row uses a 14 h threshold | `loftyLeads` (§4 shape) | Must write `status:"not-configured"` with the exact error when the key is missing rather than writing nothing — the card is built to render that state honestly |
| `zoho-crm-sync` | 4× daily | `zohoSync`, `zohoLeads`, `zohoDeals` (§4 shapes) | On 403 write **only** `zohoSync` with `status:"blocked"` + the exact error; never overwrite the 2026-09-14 paste with an empty board. Preserve `local:true` leads. Map unknown Zoho statuses to `UnAccounted` |

**Data-shape dependencies the rewiring must honour:**

1. `leadTriage`, `leadResponse` and `isaKpi` keep their existing shapes — only `source` changes. Per §4 the page must render **the doc's own `source`**, never a hard-coded CRM name. That is currently violated at line **19050** (`renderSpeedToLead` empty state) and line **6456** (card sub-title) — both outside E4a's regions, both logged as **F-E4a-11** for E1/the integrator.
2. `loftyLeads.stageTotals` is `[[stage, n]]` (array of pairs), **not** an object — `renderLoftyImport` filters on `Array.isArray(r) && r.length >= 2`.
3. `zohoDeals.deals[].amount` may be absent; the renderer prints `—` rather than `$0` for an unreadable amount, and only falls back to summing when `totalAmount` itself is non-finite.
4. The `shClients` store carries a lower-case `fub` field per client (the person-link URL). Renaming that key would orphan every saved client row — leave the key, relabel only the visible text at lines 4288 / 4294.

**Blocked on Steven before any of this can be proven:** the Lofty API key in `~/.config/lofty/.env` (F-E4a-02) and the Zoho profile permission (F-E4a-04).

---

## 5. Needs-Steven (halt = true)

| Finding | What Steven must do | Why nobody else can |
|---|---|---|
| **F-E4a-04** | Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → enable **"Zoho CRM API Access"** | Admin permission inside his Zoho tenant. Verified still failing 2026-09-22 08:17 UTC on `ZOHO_LIST_LEADS` and `ZOHO_LIST_DEALS`. This also gates the mortgage-side ISA watchdog (F-E4a-16) |
| **F-E4a-02** | Put the Lofty API key (Lofty → Settings → Integrations → API) in `~/.config/lofty/.env` on the Mac, then run the Lofty sync prompt once | A credential; its presence cannot even be *checked* from the cloud. A Local Bridge `mcp`/`toolbox lofty` request is queued |
| **F-E4a-12** | Run the CLI-Anything install prompt in a Claude session on the Mac; ECC security review before anything beyond read-only is enabled | Nothing can be installed on the Mac from here; the hub has no CRM/real-estate packages, so the wrappers must be generated locally |
| **F-E4a-13** | Once the first Lofty sync is proven, disconnect the `follow_up_boss` Composio app | Account-level, irreversible without re-authorisation. It currently still reports ACTIVE while rejecting every call |

---

## 6. Not finished / deliberately out of scope

* The 37 lines in §3 are **not** edited — they sit in E1's, E4b's and E6's worktrees. Editing them here would have produced cross-worktree conflicts for the integrator. They are routed instead, per the brief's "list the rest with line numbers so the integrator can route them".
* `renderSpeedToLead` (line 19050) and the Speed-to-lead card copy (line 6456) still hard-code a CRM name in violation of §4's "display the doc's own `source`" rule — logged as **F-E4a-11**, owner E1/Integration Engineer.
* No `loftyLeads`, `zohoSync` or `zohoDeals` document was seeded into `db/state/` — the deck must show the real (empty) state, and seeding one would have been fabrication.
* `zohoLeads` was left at its 2026-09-14 paste: per editing rule 4, the live doc is not newer (there is no live doc at all), so the seed stands.
