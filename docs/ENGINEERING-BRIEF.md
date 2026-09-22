# COMMAND DECK — ENGINEERING BRIEF (Cycle 6, executed 2026-09-22)

You are one engineer on a parallel team refreshing Steven Shearrill's "Command Deck" — a single-file
(4 MB, ~25.6k lines) personal/business dashboard published as a claude.ai artifact
(https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d). Read this whole file first,
then your own section at the bottom. Nothing you write may claim a capability is live unless the
inventory below proves it. Never invent a number, headline, name, date or status.

## 0. Paths
- SCRATCH = /tmp/claude-0/-home-user-Repo/b13c2454-73f6-56a0-bac6-c201ba53a4a7/scratchpad
- Base deck (read-only reference): SCRATCH/deck/command-deck.html   (git master, commit 5fbe844)
- YOUR worktree (edit here only): SCRATCH/wt-<your id>/command-deck.html  (git branch <your id>)
- Live DB export (161 docs, collection `state`, pulled 2026-09-22 ~08:10 UTC): SCRATCH/db/state/<doc>.json
  Every doc is `{"v": ...}` — no exceptions. (stravaSnapshot was bare until 2026-09-22; it is now wrapped.
  A doc whose top level is not a single `v` key is a writer bug — report it, never copy the shape.)
- Inventory: SCRATCH/inventory/{cloud-routines.md, mac-runner-status.md, routine-health.md,
  mac-task-descriptions.md, db-docs.md, agent-roster.md, loopLog.json, cpiOpportunityLog.json, backupStatus.json}
- Static gate: `python3 SCRATCH/tests/quickcheck.py <file>` (the "called-but-undefined" check has known
  false positives from `$10B`-style strings; treat only NEW names you introduced as failures).
- Findings output: SCRATCH/audit/findings-<your id>.json (schema in §6). Reports: SCRATCH/audit/<your id>-report.md

## 1. Dates (use exactly these)
- Environment clock now: Tue 2026-09-22 ≈ 08:30 UTC (Tue Sep 22, 01:30 AM PT). Steven is in America/Los_Angeles.
- Audit baseline per Steven's instruction: Sat 2026-09-12 04:47 UTC. Label findings "Baseline 2026-09-12 · verified 2026-09-22".
- Deck's last build stamp: 2026-09-15 02:19 PT (footer). Latest CI-log entry: 2026-09-20. Loop log cycles 1–5 ran Sep 9–10. This session is Loop Cycle 6.
- When you update an "as of" string, use the underlying live doc's own stamp (inventory/db-docs.md), never today's date unless you verified the fact today.

## 2. Ground truth (verified live this session unless noted)
CONNECTORS (claude.ai org): connected+enabled — Composio, Context7, Eromify, Gmail, Google Calendar, Inkbox, Notion, Slack, Strava, You.com.
  Not connected — Canva (needs_reconnect), BlackRock Advisor Center, Health Data Avatar (HDA), Microsoft 365, PlayMCP (connect_incomplete).
COMPOSIO apps connected: api_ninjas, discord, follow_up_boss, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho.
ZOHO CRM: Composio connection ACTIVE (account zoho_talite-spike, created 2026-09-21). BUT every CRM call returns
  HTTP 403 NO_PERMISSION `Crm_Implied_Api_Access` (verified 2026-09-22 08:17 UTC on ZOHO_LIST_LEADS and ZOHO_LIST_DEALS).
  Fix is Zoho-side, Steven only: Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → enable
  "Zoho CRM API Access". Until then the dashboard's Zoho data stays the Sep 14 paste. A cloud routine will re-test every
  few hours and write `zohoSync`; the moment the permission lands, `zohoLeads` and `zohoDeals` fill automatically.
LOFTY (formerly Chime) — Steven's decision 2026-09-22: Follow Up Boss is REPLACED by Lofty as the real-estate CRM.
  Composio has NO Lofty toolkit (searched). The Mac already has `lofty-bridge` (read-only MCP over Lofty's REST API,
  key expected in ~/.config/lofty/.env, obtained at Lofty Settings → Integrations → API; toolbox status RUN; `claude mcp`
  shows server "lofty" connected) and `lofty-cli` (npm @loftyai/lofty-cli; `lofty-cli auth status`). Official docs:
  developer.lofty.com and api.lofty.com/docs; `/v1.0/leads` accepts `Authorization: token <API_KEY>`. Whether the key is
  actually present in the .env cannot be verified from the cloud; a Local Bridge `mcp`/`toolbox lofty` request is queued.
FOLLOW UP BOSS: Composio says ACTIVE, but the Mac tasks r2-lead-response-watchdog and lead-triage-daily have logged
  "Invalid API Key or authentication credentials" since 2026-09-16. Now moot — retire every FUB dependency, keep history honest
  (say "was Follow Up Boss until 2026-09-22" where a number came from FUB).
CLI-ANYTHING (HKUDS/CLI-Anything, Apache-2.0): `pip install cli-anything-hub`; `cli-hub list|search <q>|install <name>|launch <name>`;
  Claude Code: `/plugin marketplace add HKUDS/CLI-Anything` then `/plugin install cli-anything`; `/cli-anything <path-or-repo>` generates
  `cli-anything-<software>` with `--json`; web apps without APIs go through its DOMShell MCP / Playwright path. Hub has no CRM or
  real-estate entries (README checked 2026-09-22; clianything.cc is egress-blocked from this sandbox). Steven wants connections for
  homes.com, SkySlope, zipForms (Lone Wolf), Zoho and Lofty through it — spec + install prompt; nothing can be installed on the Mac from here.
  SUPERSEDED 2026-09-22 (F-H1-10): the spec is written AND seven read-only harness packages are pre-built in
  integrations/cli-anything-harnesses/ — homes, showingtime, showami, skyslope, zipforms, lofty, zoho — installed with `pip install .`.
  Generation (/cli-anything) is now only for a NEW target. cli-anything-browser is not on PyPI and is vendored in this repo (F-H1-02).
  No path map is verified and no harness has ever made a live call (F-H1-01, F-H2b-13).
APPLE HEALTH: existing pipeline Health Auto Export → ingest daemon (LaunchAgent :8765) → DuckDB → apple-health MCP. The daemon is NOT
  responding; `appleHealth` doc last real ingest 2026-09-13 (9 days stale); r8-apple-health-snapshot runs and writes nothing.
  Steven wants the Substack recipe (Jenna Redfield, "I Built an Automated Health Dashboard in Claude (Apple Health Sync) Using Notion Data",
  2026-06-30): the Claude iOS app reads Apple Health directly on the phone → Claude writes the day's stats into Notion databases →
  dashboards read Notion. Daily loop: open Claude on the phone → "update my health stats" → approve → Notion. Notion is connected.
MAC RUNNER (claude-runner, headless, pre-approved tools, 60 tasks) — statuses in inventory/mac-runner-status.md and routine-health.md.
  As of 2026-09-22: error — cpi-daily-scan, fabric-deck-sync, health-full-analysis, nightly-self-test (timeout exit 124),
  openrouter-feeds-refresh, r1-morning-brief (API unreachable 2026-09-17), r14-content-pipeline, r17-trading-day-log,
  r8-apple-health-snapshot (daemon), strava-daily-sync, vanessa-significant-alerts; refused — steve-twin-sweep (Bash write to
  ~/Shearrill-Vault not allow-listed); limited — feeds-weekly, r10-automation-health, toolkit-deck-sync, vanessa-morning-brief-text;
  never run (weekly/monthly slots not yet proven) — r6-weekly-backup (missed Sep 20), loop-engineering-weekly, weekly-self-update,
  vanessa-ops-review, r5, r9, r11, r20, coach-weekly-recs, ops-knowledge-graph, skills-refresh-weekly, revenue-scan-weekly,
  mortgage-desk-weekly, health-coaching-weekly, month-end-close-prep, access-audit-monthly, automation-audit-weekly/quarterly.
  ok — brain-deck-sync, calendar-daily-sync, incentives-daily-scan, isa-comms-bridge-local, lead-triage-daily (ran, but FUB auth failed),
  local-bridge-queue, mortgage-rates-daily, r12-inbox-triage, r13-appointment-prep, r2 (ran, FUB auth failed), showing-sync,
  vanessa-imessage-inbox, vanessa-research-queue, vanessa-sweep, voice-reply-render, weather-news-refresh, r7 (no Plaid keys).
CLOUD ROUTINES (claude.ai/code/routines): 50 total, 46 enabled; research-only by design — an unattended cloud run's artifact-DB
  write parks on a permission prompt (confirmed three times). Last-run FAILED (Sep 18–20): Books Reconciliation Reminder,
  Weekly Loop Engineering QA, Elite Affluent weekly, Next Big Moves weekly, Vanessa orchestrated ops review, weekly improvement loop,
  weekly opportunity audit, weekly self-improvement loop, Ops Issue Review, Project Risk Review. ABANDONED Sep 21: Real Estate
  Weekly Brief, Rent-Buy-Wait refresh. Disabled: On This Day daily (duplicate), Steve twin cloud, ISA comms bridge hourly, Weekly Review.
  Everything else SUCCEEDED on schedule through Sep 21–22 (weather/news 5x daily, calendar & Strava 2x, rates, feeds, briefs).
BACKUPS: `backupStatus` — last verified backup 2026-09-14 at ~/AI-Ecosystem-Backups/2026-09-14 (7,931 docs across both stores,
  109 MB, integrity pass, restore test 13/13 on 2026-09-15), weeksKept 3. r6-weekly-backup has never run under the runner. Target spec
  (Steven): Documents/AI-Ecosystem-Backups/YYYY-MM-DD, every Sunday 00:00 local, rolling 8 weeks, integrity check, auto-retry once,
  escalate after two failures, log every run.
KNOWLEDGE FABRIC (fabric-deck-sync 2026-09-22): Second Brain (Notion) 68 rows · vault 831 notes · Jarvis 1,760 docs ·
  Graphify graph 750 nodes / 1,104 edges (built 2026-09-13) · Ruflo 238 entries · Drive folder 0 files.
AGENTS on the Mac: 172 (tier 1: 17, tier 2: 96, tier 3: 59); leads: cro-victor 27, vanessa-orchestrator 22, cmo-sofia 15,
  cco-alexandra 12, cto-derek 10, cfo-marcus 8, caio-nadia 6, portfolio-manager 6, ciso-elena 4. Present: cto-innovator,
  stress-test-engineer, reliability-engineer, efficiency-engineer, capability-engineer, integration-engineer, sandbox-qa,
  chief-automation-strategist, disruption-scout, loop-operator, harness-optimizer, agent-evaluator, escalation-recovery-agent.
MAC SKILLS present (toolkitSnapshot): continuous-process-improvement, automation-audit, automation-audit-ops, ai-ecosystem-backup,
  deck-backup, fub-followups (FUB template library — needs porting to Lofty). NOT present: interview-me, prompt-master,
  vanessa-orchestrator (exists as agent + Mac skill per CI log 2026-09-08 but not in the snapshot's 1,400 names), loop-engineering,
  scale-growth-engine. skills-refresh exists as a weekly TASK (Sun 7:00 AM, never run), not as a skill.
ORCA: the Mac has "Orca Computer Use" v1.4.203 (Stably AI, com.stablyai.orca) installed — a standalone computer-use/browser-automation
  desktop app, NOT integrated with Claude Code. The deck's card still says "Not installed yet" and describes the stablyai/orca
  parallel-worktree IDE. Reconcile honestly (installed: the computer-use app; the IDE integration is not done).
MODEL TIERING (Steven 2026-09-22): Claude Fable 5.1 masterminds — Vanessa (orchestration, council chair, final synthesis);
  Claude Opus 5 for executive/judgment seats; Claude Sonnet 5 for execution/report seats; Perplexity (Composio perplexityai
  or the local perplexity MCP) does research heavy lifting. Vanessa dispatches sub-agents per agent, ≤8 parallel, ≤4 Perplexity per wave.
MENTOR NAMING: the deck's mentor is "Kevin" (panel-kevin, kevinChat); the claude.ai Desktop skill is `cole-mentor` ("Cole"). Keep
  Kevin on the deck; record the drift as a finding for Steven (rename the skill or the seat — his call).
YOU.COM — RETIRED (Steven 2026-09-22: "you.com connection is replaced by the Claude subscription connection"; its free tier returned
  "limit exceeded" at 08:40 UTC today). Research now runs ONLY on the Claude subscription: WebSearch/WebFetch inside scheduled tasks (Mac runner)
  and cloud routines, and Perplexity for deep research. RULE FOR EVERY ENGINEER: any in-page code path or copy that calls or credits You.com
  (weather overlay, property search strategy live listings, similar-property search, tax-record search, on-this-day, "live You.com pull", the
  `you-*` tool names, "13 interactive You.com call sites") becomes one of: (a) a queued research request written to the `vanessaResearch` doc
  (answered hourly 7:30–21:30 PT by the vanessa-research-queue task) with the button relabelled "Queue research (answered by Vanessa)", or
  (b) plain text stating the feed is refreshed by the named scheduled task. Connector lists show "You.com — retired 2026-09-22". Never leave a
  button that silently fails. OpenRouter: no API key (council outside-model seats unpriced/unused). Plaid: no keys.

## 3. Second Brain — the five-level mapping (canonical; every engineer uses the same words)
- L1 Router: repo CLAUDE.md + AGENTS.md (routing rules only) → context/about-me.md, context/decisions.md (append-only, dated),
  projects/<name>.md; on the Mac the same role is played by the vanessa-orchestrator system prompt + roster-tiers.json.
- L2 Wikis + auto-memory: wiki/<topic>/index.md (mortgage-programs, real-estate-playbooks, ai-team, dashboard-ops, clients/<client>.md
  kept as FULL-CONTEXT markdown), references/, memory.md (Claude Code auto-memory, /memory on; AGENTS.md tells Codex to read it too).
  Obsidian vault = the visual layer and Jarvis's index source; Notion Second Brain DB = the record (brain-deck-sync twice daily).
- L3 Semantic search — high-volume only: call transcripts, disclosure libraries, compliance rule sets, transcripts → vector-index/
  (chunk → embed → hybrid search → rerank) served by Jarvis (OpenJarvis memory.db) + Graphify embeddings + the ruflo research-&-memory
  bench. Never vectorize documents that must be read whole (client decision logs, meeting summaries).
- L4 Knowledge graph: knowledge-graph/ entities + typed relationships (clients, lenders, partners, agents, tools) → Graphify graph in
  vault/60-Knowledge (750 nodes) → weekly summary into Ruflo memory; populated by interview-me (Grill Me) + transcripts/contracts;
  never-graph-a-secret rule; sensitive client data → local model (Jarvis) only.
- L5 Always-on: ops-knowledge-graph (Sun) · brain-deck-sync (hourly 7–22) · brain-learn-daily · brain-weekly-verify (Sunday review gate —
  sensitive items wait for Steven) · fabric-deck-sync; runs under claude-runner; loop-engineering-weekly + nightly-self-test keep it
  self-improving; bounded by the Mac being awake.
- Recall order (token discipline): 1 recall_brain + live deck snapshot (already loaded) → 2 memory.md + wiki index → 3 recall_research /
  request_research (Perplexity, capped, async) → 4 jarvis_obsidian single-store → 5 five-store recall. Cache {answer, storesHit, ts}:
  4 h for volatile stores, 24 h for vault/graph; never serve past TTL silently.
- Remote/live access: Vanessa Live (Claude Code session on the Mac with Remote Control → claude.ai or the phone app), Command Deck on any
  device, iMessage +1 650-484-9720 and Discord #vanessa via Inkbox/bot, claude.ai/code routines (cloud), Local Bridge queue (read-only verbs).
- ECC (engineering-standards package under Derek: standards, test, observability, accessibility, security, dependency, agent-safety
  officers) reviews every change; it is a gate, not a store.

## 4. New / changed DB documents (code to these exact shapes)
- `zohoSync`  {v:{checkedAt, status:"ok"|"blocked"|"error", error:string|null, source:"Zoho CRM via Composio (account zoho_talite-spike)",
   leads:number|null, deals:number|null, fix:"Zoho CRM → Setup → Security Control → Profiles → enable 'Zoho CRM API Access'"}}
- `zohoLeads` (existing shape, now live-written): {v:{syncedAt, source, counts:{<stage>:n}, leads:[{id,name,stage,created,modified,
   leadSource?,leadOwner?,local?}]}} — stage names must be the 14 in ZH_STAGES; unknown Zoho statuses map to "UnAccounted".
- `zohoDeals` (new): {v:{syncedAt, source, counts:{<stage>:n}, totalAmount, deals:[{id,name,stage,amount,closingDate,leadSource,owner,modified}]}}
- `loftyLeads` (new, replaces the FUB seed): {v:{syncedAt, source:"Lofty via lofty-bridge MCP (Mac)"|"Lofty REST API (cloud)",
   status:"ok"|"not-configured"|"error", error, stageTotals:[[stage,n]], newLeads90d:[{name,stage,ageDays,source,created}],
   firstResponse:{medianMin,over5,sample}}}
- `leadTriage` / `leadResponse` / `isaKpi` keep their shapes; their `source` string becomes "Lofty via lofty-bridge" once the Mac tasks are
   re-pointed (the page must display the doc's own `source`, never a hard-coded CRM name).
- `auditFindings`, `stressTestReport`, `scaleOpportunityLog`, `trustLevels`, `weeklyBrief` — written by the integrator (not you).

## 5. Editing rules (all engineers)
1. Edit ONLY inside your assigned regions (§7). Locate by element id / marker text, not line number. Minimal diffs: no reflowing,
   no reformatting, no renaming of ids, JS identifiers, doc keys or CSS classes unless your section says so.
2. Never rewrite the whole file. Use python string replacement (assert exactly one match), sed with anchored patterns, or the Edit tool.
3. Do NOT touch: the footer build stamp, `var PAGE_DEFS`, `function panelStampRegistry`, the `<!-- PANEL: MASTER PLAN -->` comment line,
   the final `</script>` line, `var OUTPUT_WATCH` (E1 only), the three "Follow Up Boss import" label lines (E4a only).
4. Re-baking a seed: when a `*_SYNCED_AT` constant + seed array duplicates a live doc that is NEWER, rebuild the seed from
   SCRATCH/db/state/<doc>.json keeping the seed's exact structure and set the constant to the doc's stamp (keep "YYYY-MM-DD" first).
   If the live doc is older or empty, leave the seed and say so in your report. Verify the render code's expectations before changing shape.
5. Honest status ethos: a task "exists" ≠ "runs"; say "never run under the runner", "last ok <date>", "failed <date>: <reason>".
6. Before committing: `python3 SCRATCH/tests/quickcheck.py <your file>` must show PASS on every line except the known-false-positive
   undefined-function line; extract the inline script and `node --check` it; grep that every element id your JS references exists.
7. Commit on your branch: `git -C SCRATCH/wt-<id> add -A && git -C SCRATCH/wt-<id> commit -m "<id>: <summary>"`. Do not merge.
8. Do not spend time reading regions outside yours; the file is huge. Extract your regions with sed -n / python slicing.
9. Findings JSON (§6) is mandatory even if you changed nothing. Report ≤ 400 words at the end: what changed, findings count,
   anything needing Steven, commit hash, and any region you could NOT finish.

## 6. Findings schema — SCRATCH/audit/findings-<id>.json = array of
{"id":"F-<ID>-01","category":"Current State|Automation Opportunity|AI Clone|Skill|Routine|Plugin/Integration|Orchestrator Agent|ISA Coverage|Unlisted Capability|Stale Content|Bug",
 "panel":"panel-x","system":"<what it touches>","description":"...","priority":"P1|P2|P3","effort":"S|M|L",
 "status":"New|Broken|Missing|Recommended|Stale","resolution":"Improved|Implemented|Fixed|Escalated|Open",
 "testResult":"Pass|Fail|Pending","before":"...","after":"...","dateResolved":"2026-09-22|null","owner":"Vanessa|CAIO|CTO Innovator|Stress Test Engineer|Reliability Engineer|Efficiency Engineer|Capability Engineer|Integration Engineer|Steven",
 "trustLevel":"L1|L2|L3|n/a","halt":false|true,"haltReason":"..."}
Escalate (halt=true) anything irreversible, outside scope, needing credentials/permissions/money, or a human decision.

## 7. Assignments (regions by panel id; base line numbers are a hint only)
### E1 — daily-ops (worktree wt-e1-daily, branch e1-daily) — model Opus
Panels: panel-brief (1404–1513), panel-news (1513–1576), panel-appointments (3326–3386), panel-pto (3386–3428), panel-tools (4141–4241),
panel-masterplan (4770–5054), panel-kanban (5998–6048), panel-processexcellence (6048–6199), panel-opsradar (6407–6437).
JS: WEATHER_SNAPSHOT/WEATHER_SYNCED_AT, news seeds/NEWS_SYNCED_AT, ON_THIS_DAY seeds, BEARS seeds, CAL seeds/CAL_SEED_SYNCED_AT,
market snapshot seed (MARKET_SNAPSHOT / marketSnapshot doc), `var FRESH_FEEDERS`, `function execSyncRegistry` (not the FUB label line),
`var OUTPUT_WATCH`, CI_LOG_DEFAULT untouched. Known stale: panel-brief text "Scheduler verified Sep 7, 2026: all 20 cloud routines
enabled…" → replace with the Sep 22 truth (46 of 50 enabled; 10 failed their last run Sep 18–20; 2 abandoned; point to Ops Radar).
Re-bake weather (weatherSnapshot 2026-09-21 8:05 PM PDT), news (newsSnapshot 2026-09-21), market (marketSnapshot Sep 18 close),
calendar (calendarSnapshot 2026-09-21), on-this-day/bears/top-headlines from liveFeeds (each feed is {checkedAt, text, citations, source, model} —
inspect before mapping). Ops Radar: "Follow Up Boss lead arriving" → Lofty; backup card copy-prompt → the §2 backup spec (Documents/
AI-Ecosystem-Backups, 8 weeks, integrity, retry, escalate). OUTPUT_WATCH: add {doc:"loftyLeads", label:"Lofty CRM import", task:"lofty-crm-sync", hrs:14}
and {doc:"zohoSync", label:"Zoho CRM sync", task:"zoho-crm-sync (cloud, 4x daily)", hrs:14}; correct any row whose task/cadence disagrees with
inventory/mac-runner-status.md. FRESH_FEEDERS: correct task names/times to the runner crons. Process Excellence: nothing structural; check stale claims.

### E2 — markets (wt-e2-markets) — Opus
Panels: panel-apex (1576–1607), panel-quantvue (1607–1978), panel-hedgefund (1978–2143), panel-openterminal (2143–2238).
JS: STRATEGY seeds/STRATEGY_SYNCED_AT (strategySnapshot 2026-09-16 is newer → re-bake), ECONODAY (liveFeeds econodayLiveList 2026-09-20),
TOP_PERFORMERS (liveFeeds topPerformersLiveList 2026-09-22), HF memo (hfCommitteeMemo still Sep 7; hfRequest AAPL FAILED 2026-09-13:
cloud egress blocked to Yahoo/SEC — the Remote Run card must show that failure honestly and recommend the Mac runner path; the cloud
routine "AI Hedge Fund Team remote run" SUCCEEDED Sep 21 but wrote no memo), OPENTERMINAL seed (openTerminalSnapshot 2026-09-13),
TV_INTEGRATION (reference), prop-firm callout (dated Sep 2026, fine), market movers/sector lists (liveFeeds mktMoversList/mktSectorList 2026-09-22).
r17-trading-day-log failed since Sep 17; riskMonitor accounts array empty — say so where the deck claims a daily log.

### E3 — wealth (wt-e3-wealth) — Opus
Panels: panel-james (3018–3049), panel-personalaccounts (3049–3226), panel-tax (3226–3326), panel-familyoffice (3990–4141),
panel-income (5217–5564), panel-assets (6199–6224), panel-housekeeping (6492–6511). JS: tax calendar arrays (rows dated before
2026-09-22 must render as passed, not upcoming — fix the display logic if needed, never delete rows), FERS/VA comp text (fine, Dec 1 2025 table),
Plaid section text (no keys — honest), memberships/myCards/licenses seeds (Enterprise Plus "2/28/2026" and any other passed expiry → the page
must flag expired, not upcoming; do not change Steven's data values), council pricing note (OpenRouter no key). Money Housekeeping: subscriptions
empty (say so). Do not alter account balances or property values.

### E4a — CRM integration (wt-e4a-crm) — Opus  ← Lofty + Zoho
Regions: the "LIVE CRM IMPORT — FOLLOW UP BOSS" card in panel-property (HTML ids fubSyncNote/fubStageStats/fubNewCount/fubNewLeadRows, ~2455–2478)
and its JS block (`/* ===== LIVE CRM IMPORT — FOLLOW UP BOSS` … through the render function that fills those ids, ~10368–10480);
the Zoho card (`id="zohoLeadsCard"` ~2478–2530) and its JS (`var ZH_STAGES` … `renderZohoBoard` and helpers, ~15284–15400);
the "Automation & live-data connectivity — honest status" card at the end of panel-easop (~4440–4470); the three JS lines carrying the
label "Follow Up Boss import" (LIVE_FEED_ISO ~7608, FRESH_FEEDERS ~19759, execSyncRegistry add() ~20539) — rename the label to
"Lofty CRM import" in all three and point the feeder text at the lofty-crm-sync task; any other "Follow Up Boss"/"FUB" text in
panel-property and panel-easop (there are 35 "Follow Up Boss" and 22 "FUB" occurrences file-wide — handle only those in your regions;
list the rest with line numbers in your report so the integrator can route them). Keep JS identifiers (FUB_SYNC_AT etc.) but you may add
new ones (LOFTY_*). Build: (1) the card becomes "Live CRM import — Lofty (real estate)": reads `loftyLeads` doc via lsGet; if absent,
show an explicit "awaiting first Lofty sync — the Mac's lofty-bridge is installed; API key + first run pending" state (do NOT present the
old FUB numbers as Lofty; you may keep them in a collapsed "last Follow Up Boss import, 2026-09-07 — retired" block). (2) Zoho card: the
red "API blocked" badge becomes dynamic from `zohoSync` (green "Live via Composio · synced <time>" when status ok; red with the exact error
and the fix text when blocked; gray "never checked" when absent); `renderZohoBoard` keeps reading `zohoLeads`; add a small "Mortgage pipeline —
Zoho deals" table reading `zohoDeals` (stage counts, total amount, top 20 by modified) with the same honest empty state; update the
"Deck only — NOT created in Zoho until API access is granted" copy to say Zoho is the system of record and the next sync overwrites a
stage moved here (write-back is an L2 proposal, not built). (3) Connectivity card: rewrite the status paragraphs to §2 facts: Zoho
(connected, API blocked, fix), Lofty (Mac bridge + CLI, key pending), Follow Up Boss (retired 2026-09-22), Composio catalog note, CLI-Anything
path for homes.com / SkySlope / zipForms (spec written this cycle, install on the Mac pending, DOMShell browser path for sites without APIs),
Strava/Notion/Calendar (connected). Add copy-prompt buttons (data-copy) with the exact prompts for: "run the Lofty sync now",
"run the Zoho sync now", "install CLI-Anything wrappers" (prompt text: read SCRATCH/repo-out/ if present, else write a precise prompt yourself).
Findings: include the doc-to-task rewiring list for Derek's automation-engineer (r2, lead-triage-daily, r11, showing-sync → Lofty).

### E4b — real estate (wt-e4b-realestate) — Opus
Panels: panel-property EXCEPT the two cards E4a owns (rates card, market snapshot, program facts, builder incentives, lender directory,
Mello-Roos, community ranking, property search strategy, refi watch), panel-showings (4241–4294), panel-easop EXCEPT the connectivity card
(4294–4440), panel-practice (6437–6492). JS: MORTGAGE_RATES seeds/MORTGAGE_RATES_SYNCED_AT (ratesSnapshot 2026-09-22 02:24Z is newer → re-bake
the rows the doc carries; keep any row the doc lacks and say which), MARKET_SYNCED_AT (Redfin July 2026 latest — reference), PROGRAM_FACTS
(reference), BUILDER_INCENTIVE seeds (liveFeeds builderIncentiveLiveList 2026-09-22), LOAN_PROGRAMS/LENDER_DIRECTORY (counts must stay 39/61 —
the drift-check routine compares them to the ISA Portal), ISA scorecard/KPI cards (isaKpi doc 2026-09-13 carries real KPI actuals — render or
link them honestly), showings (showingSchedule empty), licenses (Sienna registration 2026-09-27, NMLS 2026-12-31). Every "Follow Up Boss" in
your regions → Lofty with honest history. Any "Zoho CRM is system of record for mortgage" statements stay true.

### E5 — life (wt-e5-life) — Opus
Panels: panel-work (3428–3457), panel-kevin (3457–3487), panel-wellness (3487–3905), panel-mind (3905–3990), panel-loyalty (5054–5217),
panel-nonprofit (5564–5656), panel-pedefense (5656–5735), panel-eliteaffluent (5735–5852), panel-nextmoves (5852–5942), panel-travel (5942–5998),
panel-marketing (6224–6300), panel-dreamempire (6300–6407). JS: STRAVA seeds/STRAVA_SYNC_AT (stravaSnapshot 2026-09-20 — BUT the doc has no
`v` wrapper, so applyRemoteSnapshot ignores it: confirm, then make the page accept both shapes (lsGet fallback) and record the bug, P1),
Apple Health card text (daemon down, 9 days stale — the card must say so and describe the new Notion-based recipe from §2 as "spec written,
first phone run pending"), ELIT_SCAN/PEDEFENSE/ELITE_AFFLUENT/OPP_RADAR seeds from liveFeeds (2026-09-22 stamps), NEXT_MOVES (cloud weekly
review FAILED Sep 20 → stamp honest), SWOT (Sep 3), TRAVEL seeds (events on Sep 18/19 are passed — verify the tv-passed logic hides them),
MARKETING_SYNCED_AT (marketingQueue 2026-09-13; Monday content routines SUCCEEDED Sep 21; r14 failed since Sep 17 — 2 drafts awaiting review),
USC deadlines (Week 4 Sep 23/27, final Oct 19), Kevin card (keep Kevin; note cole-mentor drift in findings). Nonprofit: grantPipeline live.

### E6 — AI team + Vanessa + Toolkit (wt-e6-aiteam) — default model  ← org chart
Panels: panel-vanessa (1334–1404), panel-aiteam (4470–4770), panel-toolkit (6511–6629, NOT the footer). JS: ORG_CHART (~24812), AI_TEAM_ORG and
AI_TEAM_TOOLBOX (~24700+), renderRoster/council/twin/local-bridge text, Local Bridge card counts (derive "15 MCP servers · 172 agents · 60 tasks"
from the toolkitSnapshot doc at render time: counts.mcpServers/agents/tasks), ISA line "Honest status (Sep 7, 2026)" → Sep 22 truth (cloud hourly
bridge DISABLED; Mac isa-comms-bridge-local hourly 7:37–21:37 PT, last ok 2026-09-21 20:38 PT; ISA has posted nothing since 2026-09-16), twin queue
text (cloud twin routine DISABLED/ABANDONED; steve-twin-sweep on the Mac weekdays 12:55 PM PT, last run refused a vault write), weekly self-update
card (runner slot Fri 11:10 PM PT, never run; improvementProposals empty), AI employee skill toolkit ("Three more queued": interview-me and
prompt-master are now INSTALLED as repo skills this cycle (SCRATCH/repo-out/.claude/skills/), skills-refresh exists as the Sunday task + a repo
skill; Mac install prompt provided), Orca card (§2 truth), Vanessa reach table ("Routes to 7 specialists" → 8 executives + 4 mentors; Inkbox
channels connected), Vanessa research queue note (vanessa-research-queue task hourly 7:30–21:30 PT, ok). ORG CHART UPDATE (Steven's explicit ask):
(a) model tiering badges/text per §2 — Vanessa "Claude Fable 5.1 · masterminds", executives "Opus 5", reports/benches "Sonnet 5", research
"Perplexity"; (b) Nadia (CAIO, outward disruptor) and Elon (CTO Innovator, inward architect) with the AI Agent Engineering Team already exist —
keep, refresh wording to: CAIO weekly Disruption Brief (replace/upgrade/adopt), proposal-only, reports to Steven cc Vanessa; CTO Innovator vets every
CAIO item, manages the Engineering Team, reports to Steven cc Vanessa and CAIO; (c) add under Derek: "Integration Engineer" is under Elon already —
add "CRM & Connectors: Lofty (lofty-bridge MCP), Zoho (Composio, API-blocked), CLI-Anything wrappers (homes.com, SkySlope, zipForms) — Integration
Engineer owns"; (d) add a "Second Brain — five levels, one Vanessa" card (§3 mapping as a compact table: level · what · where it lives · owner · status)
placed after the org chart; (e) add a "Model & token discipline" line (recall order, sub-agent fan-out ≤8, ≤4 Perplexity per wave); (f) AI_TEAM_TOOLBOX
rows: Connectors (Zoho blocked, Lofty via Mac, FUB retired, Canva needs reconnect), Cloud routines (Steve twin + ISA bridge disabled), Skills (add
interview-me · prompt-master · skills-refresh · lofty-crm-sync · zoho-crm-sync · cli-anything-connectors · apple-health-notion · loop-engineering v2),
Agents (add "Anything/Orca computer-use executor — proposal, vetted by CTO Innovator"). Keep Kevin as the mentor name. Every "Follow Up Boss" in your
regions → Lofty. Do not touch panelStampRegistry or the footer.

### E7 — Stress Test Engineer (no deck edits; writes SCRATCH/tests/ and SCRATCH/backup/) — Opus
Build `SCRATCH/tests/runtime-harness.js`: a pure-Node DOM shim (no jsdom is installed; do not npm install anything) sufficient to execute the
deck's inline script end-to-end: window/document with getElementById/querySelector(All)/createElement/addEventListener/innerHTML setter that
records writes per id, localStorage/sessionStorage, navigator, location, Intl/Date, setTimeout stubs (run synchronously or skipped), matchMedia,
requestAnimationFrame, speechSynthesis stub, canvas getContext stub, MutationObserver/IntersectionObserver stubs, window.claude undefined (local mode).
Output: JSON {exceptions:[{where, message}], containersRendered:[ids with innerHTML set], safeRunFailures:[...], durationMs}. Run it on
SCRATCH/deck/command-deck.html (baseline) and later on any file path given. Then the STRESS SWEEP (write SCRATCH/tests/stress-report.json, rows
{capability, testType:"Volume|Edge|FailureInjection|Concurrency|BackupRecovery|Functional|Regression", result:"Pass|Fail|Degraded", weakness,
engineer, fixApplied:"", retest:"Pending", status:"Resolved|Monitoring|Escalated|Open"}): (a) Volume — seed localStorage with routineHealth of
5,000 rows, kanbanCards 2,000, isaLine 10,000 messages, liveFeeds 50 feeds × 200 citations; measure render time and whether any render throws;
(b) Edge — for each doc in `var OUTPUT_WATCH` plus zohoLeads, routineHealth, backupStatus, twinQueue, vanessaRecommendations, calendarSnapshot,
weatherSnapshot, stravaSnapshot (no-v shape) inject null / [] / {} / "string" / wrong-typed fields / a row that is a number; record every throw
with the function name; (c) Failure injection — run with window.claude present but `use` throwing, with localStorage.setItem throwing (quota),
and with the seed JSON removed; confirm the page still renders and reports honestly rather than silently; (d) Concurrency — call
applyRemoteSnapshot (or its equivalent) with a burst of 200 doc changes including conflicting isaLine arrays; verify merge idempotence;
(e) Backup/recovery — restore all 161 exported docs (SCRATCH/db/state) into the shim's localStorage under the page's LS_PREFIX, run the page,
count docs restored, verify every doc parses, has `v` (note the exceptions), and that the 26 OUTPUT_WATCH containers rendered; write
SCRATCH/backup/restore-test.json {at, docs, sizeBytes, parseFailures, missingV, containersRendered, verdict}; also produce the backup bundle
SCRATCH/backup/2026-09-22/{state/*.json, command-deck.html, manifest.json (sha256 per file, sizes, doc count)}. Report weaknesses with the exact
function and line so a Reliability Engineer can fix them; do not fix the deck yourself.

### E8 — Auditor (Phase 1 items 2–9 + item 23 gap analysis + CPI/Scale seeds) — default model
Inputs: this brief, inventory/*, the panel texts (extract with sed from the base deck; strip tags), loopLog.json, cpiOpportunityLog.json.
Produce SCRATCH/audit/findings-E8.json (ids F-E8-nn) and SCRATCH/audit/E8-report.md with these tables: (2) Automation opportunities — personal /
business / communication / data: trigger · action · tool required · est. time saved per week · Finding ID; (3) AI clone (Vanessa expanded task list) —
tasks she owns end-to-end (L3), drafts for approval (L2), report-only (L1), new integrations/permissions needed, escalation rules; (4) Skills to add —
ranked impact vs effort; (5) Routines to build — daily/weekly/monthly with trigger + success criteria; (6) Plugins/integrations — with security/permission
notes (Elena's lens); (7) Orchestrator agents to incorporate; (8) ISA coverage map — every hand-off/monitoring/QA layer between Steven, Vanessa,
Steve, the executives, the engineering team and the human ISA, and where it is missing; (9) Unlisted-but-recommended capabilities with reasoning;
(23) Missing C-suite / supporting AI employees (Executive Assistant, Research, Data Analyst, Content, Legal/Compliance, Customer Success, CAIO Scout,
Backup/Ops sub-agent…) — role, reporting line, interface with the orchestration skill (check the 172-agent roster first; do not propose one that exists);
(24) 10+ CPI opportunities (idea, expected savings, complexity, IMPLANT-eligible?); (25) 10+ Scale/ADR opportunities (lens Automate/Delegate/Replicate,
capacity impact, delegate target with reasoning, replication template). Ground every row in a fact from the inventory or the deck; cite the doc/task/routine.

### E9 — CAIO disruption scan (Nadia) — default model
WebSearch-driven (US-only tool; say when you cannot verify). Produce SCRATCH/audit/caio-brief.md + caio-brief.json: dated (Sep 2026) citations only.
Sections: Disruption scanning (models — Claude Fable/Mythos 5.1, Opus 5, Sonnet 5, GPT-5.x/6, Gemini 3.x, Grok 4.x, Llama 4; agent frameworks; MCP and
Claude Code routines/desktop scheduled tasks; computer-use agents incl. Orca and CLI-Anything), Obsolescence flags against the current stack (ruflo,
OpenJarvis, Composio, Inkbox, Magica, You.com (retired), OpenRouter, Perplexity, Health Auto Export daemon, Follow Up Boss → Lofty), Competitive/capability gap
analysis for a solo VA-loan MLO + broker in Temecula/San Diego (Lofty AI, Zoho Zia, ARIVE, Zillow/Realtor.com AI, homes.com), and the weekly Disruptive
Recommendation Brief: ≥8 items each ADOPT / PILOT / WATCH / IGNORE with replace/upgrade/adopt verdict, expected value, risk, and a hand-off line
"→ CTO Innovator feasibility" (fit, integration cost, security risk, real-vs-hyped). Proposal-only. Trust level L1.

### E10 — Second Brain architect (writes SCRATCH/repo-out/brain/) — Opus
Implement §3 as files a Claude Code project loads: CLAUDE.md (router only, ≤120 lines: routing rules, recall order, token rules, model tiering,
sub-agent dispatch, HALT conditions), AGENTS.md (same for Codex + "read memory.md"), context/about-me.md (from the deck's real bio: retired Navy Chief,
Broker Associate LPT Realty, MLO Patriot Pacific NMLS 1921615, CA/NV/AZ/FL/IL, Temecula/San Diego, VA specialist; no secrets), context/decisions.md
(seed with the dated decisions from this cycle: FUB→Lofty 2026-09-22, Zoho API fix owner, model tiering, backup spec, Apple Health Notion recipe),
projects/{command-deck.md, isa-portal.md, ai-team.md, nonprofit.md, usc-pjmt-530.md} (status + where the live data lives), wiki/index.md + wiki/
{mortgage-programs, real-estate-playbooks, ai-team, dashboard-ops, clients}/index.md (stubs with routing + what belongs there + full-context rule),
references/index.md, memory.md (empty scaffold + instructions), vector-index/README.md (what gets chunked, chunk size, embedding model choice,
hybrid+rerank, the "never vectorize full-context docs" rule, how Jarvis/Graphify/ruflo serve it today), knowledge-graph/{README.md, schema.md,
entities/.gitkeep} (entity types, relationship vocabulary, never-graph-a-secret, interview-me feed), always-on/README.md (the L5 task map with
crons from inventory, the Sunday review gate, runner uptime bound), recall-cache.md (TTL rules), REMOTE-ACCESS.md (every live path from §3),
and MAC-INSTALL.md (exact steps to lay the same tree into ~/Shearrill-Vault or the Claude Code project on the Mac, plus `/memory` enable, AGENTS.md
duplication, Obsidian open). Also OPTIMIZATION.md: how Orca (computer-use executor), Jarvis (local voice + index), Ruflo (bench + memory), Graphify,
Obsidian, RAG and ECC each plug into Vanessa as ONE recall + ONE dispatch path, with a token-cost table (which store answers which question class and
why), and the loop-engineering hooks (what the weekly loop measures for the brain: recall hit rate, cache hit %, tokens per answer, stale-store alerts).
Keep it efficient: no file over 200 lines; no secrets, account numbers or client PII anywhere.

### E11a — Orchestration skills engineer (writes SCRATCH/repo-out/.claude/skills/) — Opus
Write complete SKILL.md files (frontmatter name/description, then procedure, inputs, outputs, guardrails, HALT conditions, logging, self-test):
`interview-me` (relentless Grill Me interview on a named topic → structured notes → vault 60-Knowledge / knowledge-graph entities; sensitive → Sunday
review; never straight to Notion), `prompt-master` (once per loop cycle reviews the orchestrator's + executives' system prompts against measured
outcomes; proposes diffs through the weekly-self-update HITL gate; never edits live prompts), `skills-refresh` (diffs installed skills vs the AI Team
table, frontmatter validity, dead paths; reports, never reinstalls), `vanessa-orchestrator` v2 (C-Suite Delegation & Parallel Execution: intake →
decompose → delegate → CONCURRENT execution ≤8 → conflict resolution → QA → consolidate → report; model tiering Fable/Opus/Sonnet/Perplexity;
fallback when an agent stalls (2 retries, then re-route, then Needs-Steven packet); the "Parallel C-Suite Task Cycle" routine spec), `ai-ecosystem-backup`
v2 (the §2 spec exactly: Sunday 00:00 local, Documents/AI-Ecosystem-Backups/YYYY-MM-DD, scope = both artifact stores + Claude Desktop config (settings,
installed skills/extensions, memory/context files, connector/MCP configs with secrets redacted) + Master Findings Table + latest Weekly Report; 8-week
rolling prune; integrity = non-empty, readable, expected structure; log {timestamp, size, contents, verification}; retry once; escalate on 2 failures
via twinQueue Needs-Steven + push), `continuous-process-improvement` v2 (daily light / weekly deep; OBSERVE→IDENTIFY→RECOMMEND→IMPLANT (Engineering
Team, low-risk/high-confidence only)→MEASURE; CPI Opportunity Log shape {id,date,opportunity,evidence,expectedSaving,complexity,status,measured,
cumulativeSaved}), `scale-growth-engine` (ADR weekly; Automate-for-5x/10x → Delegate (exact target + reasoning; HALT without a confirmed receiving
owner) → Replicate (templates); metrics throughput/cost-per-output/tasks-per-hour before/after; Scale Opportunity Log shape {id,date,opportunity,lens,
status,capacityImpact,cumulativeCapacityUnlocked}; Growth Roadmap), `loop-engineering` v2 (Goal→Loop→Routine per agent/skill/routine; propose→test→compare→
promote/reject→log; untouched holdout set; trust-graduation L1→L2→L3 with a 7-consecutive-correct-runs gate, never straight to L3; self-test suite
categories Functional/Integration/Orchestration/Regression/BackupVerification/StressResilience; self-heal → Triage inbox; the HALT list verbatim
from Steven's spec; weekly report + brief templates), `stress-test-sweep` (Volume/Edge/FailureInjection/Concurrency/BackupRecovery; route weaknesses to
Reliability/Efficiency/Capability/Integration; nothing resolved until it passes the same test; report shape). Also SCRATCH/repo-out/routines/
{parallel-csuite-task-cycle.md, weekly-loop.md, backup-watchdog-cloud.md} with cron (PT and UTC), model, tools, prompt text, success condition.

### E11b — Integration skills engineer (writes SCRATCH/repo-out/.claude/skills/ and SCRATCH/repo-out/integrations/) — Opus
The Substack article is egress-blocked and You.com is retired: use the §2 summary plus WebSearch snippets (query the exact title) and say so. Write:
`apple-health-notion` skill + integrations/apple-health-dashboard.md (the recipe adapted to Steven: Claude iOS app → Apple Health read → Notion
"Health Log" database schema (date, steps, active energy, resting HR, HRV, sleep total/stages, weight, workouts, VO2max, mindfulness) → the Command
Deck's appleHealth doc written by a Mac task `health-notion-sync` (reads Notion via connector, writes the same snapshot shape the tiles already render —
read the appleHealth doc in SCRATCH/db/state to match keys) → the existing tiles; daily phone routine text; what happens to the dead ingest daemon
(keep as optional second source; fix = phone automation URL); privacy notes), `lofty-crm-sync` (Mac task: lofty MCP → loftyLeads doc shape from §4;
speed-to-lead from Lofty activity timeline; re-point r2/lead-triage-daily/r11/showing-sync; cloud variant if LOFTY_API_KEY is set in the environment,
else honest not-configured), `zoho-crm-sync` (Composio ZOHO_LIST_LEADS/ZOHO_LIST_DEALS → zohoLeads/zohoDeals/zohoSync exactly per §4; stage mapping to
ZH_STAGES; preserve `local:true` deck-only leads; the NO_PERMISSION self-test + fix text; 4x daily), `cli-anything-connectors` (install CLI-Anything
per §2; generate wrappers for homes.com (listing search/saved searches — DOMShell path, no API), SkySlope (transactions/documents — DOMShell unless the
partner API is granted), zipForms/Lone Wolf Transactions (forms — DOMShell), Zoho (prefer the official REST via the Composio path; CLI as fallback),
Lofty (prefer lofty-cli/bridge; CLI-Anything wrapper optional); read-only first; credentials in the Mac keychain/.env never in prompts; ECC security
review before enabling; Orca Computer Use as the alternative executor), and integrations/CONNECTIONS.md — one table: system · path · status today ·
what Steven must do (one line) · trust level. Also integrations/mac-task-specs.md: exact task definitions (name, cron PT, tools, prompt) for
lofty-crm-sync, zoho-crm-sync, health-notion-sync, cli-anything-install, with "Run now once to prove it" notes.
