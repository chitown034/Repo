# Measured facts — 2026-10-05, 18:05–18:20 UTC (integrator)

Ground truth for this round. Each line carries its own stamp. Do not re-measure what is here unless
your lane says so. Steven's request (2026-10-05): *"look for everything throughout the dashboard that
is stale, not working, not connected and have engineers fix them"*, and *"ensure everything is working
and connected to include: Orca … Notes / knowledge graph …"* (his full Orca/graph text: `ORCA.md`).

SCRATCH = /tmp/claude-0/-home-user-Repo/b13c2454-73f6-56a0-bac6-c201ba53a4a7/scratchpad

## Artifacts and copies
- Command Deck — https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d — live v171
  (version 1791221722-89b7, published 2026-10-05 17:35 UTC). Master: `SCRATCH/deck/command-deck.html`
  (git repo, HEAD 832f186 == live). 29,100 lines, ~4.4 MB. NEVER Read it whole — Grep, then Read with
  offset/limit. Never edit the master; copy it into your lane folder.
- ISA Portal — https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041 — live v39
  (1791223160-c08a, ~18:00 UTC today). Copy: `/home/user/Repo/dashboard/isa/isa-portal.html` (== live).
- Read-only DB dumps taken 18:05 UTC: `SCRATCH/deckdb-1805/state/*.json` (182 docs) and
  `SCRATCH/isadb-1805/state/*.json` (15 docs). `doc-ages.txt` (this folder) = each doc's newest stamp.
- Routine list exports (JSON, one line): enabled `…/tool-results/mcp-Claude_Code_Remote-list_triggers-1791223365665.txt`,
  disabled `…/tool-results/mcp-Claude_Code_Remote-list_triggers-1791223772951.txt`, both under
  `/root/.claude/projects/-home-user-Repo/b13c2454-73f6-56a0-bac6-c201ba53a4a7/`. Each row has
  `id, name, cron_expression, created_via (meta_mcp = agent-made, editable by agents; http_api = Steven's,
  agents cannot edit), last_run{status,fired_at}, derived_state.prompt`.

## Usage — the binding constraint
Weekly allowance at `allowed_warning`; resets 2026-10-11 20:00 UTC (Sun 1 PM PT). If it runs out,
every routine, every Mac task and Steven's own Claude stop until then (it happened Oct 1–4). Be frugal:
targeted reads, capped searches, no full-file reads of the deck.

## claude.ai connectors (ListConnectors, 18:12 UTC)
- Connected: AccuWeather, Canva, CarGurus, Composio, Context7, Expedia, Gmail, Google Calendar,
  Google Drive, Groupon, Inkbox, Notion, Pabbly Connect Integration Builder, Rome2Rio, Slack, Strava,
  Trip Logistics Assistant, Uber Eats, Vanguard Advisor Tools, WhisperAI, Zoom, You.com (connected but
  0 credits; retired 2026-09-22).
- Needs reconnect (Steven, claude.ai → Settings → Connectors): Eromify, EVRoutes, Turo.
- Connect started, never finished: BlackRock Advisor Center, Health Data Avatar (HDA), Microsoft 365,
  PlayMCP, Similarweb.

## Composio (last measured 2026-09-24 — NEEDS-STEVEN 55–57)
- Zoho CRM: connection ACTIVE, every CRM call `403 NO_PERMISSION` (needs Steven's profile checkbox).
  `zohoSync` doc: status "blocked", checkedAt 2026-09-22.
- GoHighLevel, Google Drive (Composio side), Discord bot: sign-ins initiated, no account.
- perplexityai: connected, unused since 2026-10-05 (Perplexity removed).

## Lofty
`loftyLeads` status "not-configured" (syncedAt 2026-09-22). Mac `lofty-crm-sync` "refused" 2026-10-05
07:47 PT. No API key installed (NEEDS-STEVEN 6).

## Mac runner (`runnerStatus`: Mac clock 2026-10-05 09:05 PT; syncedAt 16:07 UTC)
60 tasks: 38 ok · 9 limited · 5 refused · 2 no-work · 1 error · 5 never run.
- error: `vanessa-morning-brief-text` (06:51 PT) — but `agentInbox` shows the brief + voice note WAS sent
  via iMessage at 13:49 UTC.
- refused: `brain-learn-daily` (10-04 23:18), `lofty-crm-sync` (10-05 07:47), `openterminal-remote-queue`
  (hourly; 10-05 08:46), `r11-isa-kpi-compile` (10-04 14:57), `r6-weekly-backup` (10-04 15:03).
- limited (last ran Sep 30–Oct 1, the usage lockout; next slots this week): access-audit-monthly,
  automation-audit-quarterly, feeds-market-close, lead-triage-daily, r14-content-pipeline,
  r17-trading-day-log, r4-quantvue-sync, steve-twin-sweep, vanessa-sweep.
- no-work: `ops-knowledge-graph` (10-04 15:28), `vanessa-discord-inbox` (every 5 min; no Discord token).
- never run: automation-audit-weekly, loop-engineering-weekly, r20-weekly-review-local,
  vanessa-ops-review, weekly-self-update (Fri/Sat slots; first due Oct 9–10).
- `researchProvider`: "claude-fallback" — Perplexity still tried first (401). Steven has not yet run
  `/home/user/Repo/integrations/mac-claude-only.md`.
- `r3-eod-rollup` (ok) writes `eodRollup` with speedToLeadStatus "NO DATA — composio proxy to /v1/people
  exited 137 (killed)… 8th consecutive occurrence, stale since 2026-09-23" — it still calls the retired
  CRM's endpoint.

## Cloud routines (list exports above): 65 enabled, 17 disabled
- 30 enabled routines show last run FAILED/PENDING; nearly all failed at startup Sep 29–Oct 4 on the
  usage limit (verified on samples: "You've hit your weekly limit" / "session limit"). Sunday weeklies
  rerun Oct 11; the 13 monthlies will not rerun until November unless fired: Things I Wish I Knew book,
  Monthly state market refresh — Rent/Buy/Wait, Muster Point, Tech & AI Command Deck, Nellis VA Webinar,
  Sentinel, VA Command Center, NAVWAR PM Deck, R18 Card credits (also runs the 15th), R16 marketing
  compliance, SEO Content Gap Audit, Financial Summary, Property Search & Tax-Data integrations health.
- R19 USC study planner failed 2026-10-05 00:14 UTC on the 5-hour session limit.
- Waiting for Steven's approval (SESSION_STATUS_REQUIRES_ACTION, Cowork sessions): Real Estate Weekly
  Brief (fired 16:43 UTC), Weekly dashboard refresh — Rent/Buy/Wait (fired 17:37 UTC).
- Research-only (end with JSON nobody applies; Steven's http_api routines): Command Deck — Strava activity
  refresh (2×/day), calendar refresh (2×/day), mortgage rates & market refresh (daily), Trading strategy
  performance daily (weekdays). The Mac writes stravaSnapshot / calendarSnapshot / ratesSnapshot itself.
- Backup: the weekly cloud backup failed Sep 27 and Oct 4 (limit); last backup on record 2026-09-22. The
  integrator fired an on-demand backup at 18:14 UTC (result pending).
- ISA escalation ladder failed Oct 3 (limit); Elite Affluent writer failed Oct 4 (limit); market-close
  writer's first run is tonight 21:20 UTC.
- Disabled: hourly cloud ISA comms bridge (trig_01VpcvVPTrbdfvdbXn1mD7hB), Steve twin
  (trig_0174717mnSfAk1LtQQVJhH7r), Ops Issue Review, Books Reconciliation, old Weekly Review, the ten old
  feed routines (Steven switched them off 2026-10-05), old Pipeline Sync.
- Still enabled, flagged for retirement in NEEDS-STEVEN 16: Project Risk Review (stock template).
- Three routines name `claude-opus-5`: Monthly state market refresh, Muster Point, Weekly dashboard
  refresh — Rent/Buy/Wait.

## Feed freshness (`feedFreshness`, cloud watchdog, 16:14 UTC)
14 fresh · 9 stale · 3 unknown. Stale: appleHealth (Sep 13), knowledgeGraph (Sep 13), backupStatus
(Sep 22), loftyLeads (Sep 22), zohoSync (Sep 22), leadResponse (Sep 23), leadTriage (Sep 23),
vanessaBrief (Sep 23; written by Mac `vanessa-sweep`, limited since Oct 1), isaLadder (Sep 24).
Unknown: marketSnapshot, aiNews (free-text asOf only), healthNotionSync (never synced; status
"awaiting-first-phone-run"). All Claude-written `liveFeeds` entries are fresh today.

## Other stale docs (`doc-ages.txt`)
hfCommitteeMemo 28 d, ctoLog 24 d, vanessaRuns 24 d, openTerminalQueue 23 d, healthAnalysis /
healthInsight 22 d, auditFindings 13 d, riskMonitor 13 d, trustLevels 13 d, weeklyBrief 13 d,
scaleOpportunityLog 13 d, marketingQueue 12 d, twinLog / twinQueue 12 d (Steve twin disabled),
stressTestReport 11 d, realEstateBrief 7 d. Chat histories (steveChat, apexChat, jamesChat,
vanessaChat…) age only because nobody chatted — not defects.

## Knowledge fabric (`knowledgeFabric`, 16:07 UTC)
Second Brain 80 rows · Vault 839 notes · Jarvis 1,773 docs · Graph 750 nodes / 1,104 edges (built
2026-09-13; Mac `ops-knowledge-graph` ended "no-work" 10-04) · Ruflo 238 · Drive folder 0 files (never
wired, NEEDS-STEVEN 15). `knowledgeGraph.vaultPath` = `~/Documents/Shearrill-Vault/60-Knowledge`.

## ISA seat / people
ISA line: 14 messages — 13 from Steven, 1 from the team, 0 from an ISA (seat unfilled, NEEDS-STEVEN 3).

## USC deadlines doc
9 rows: Weeks 1–4 (all past) and the Week 8 final (Oct 19). Weeks 5–7 are missing. Never invent dates.

## Rules for every engineer (non-negotiable)
- Read `/home/user/Repo/CLAUDE.md` (the router) and this file. Work only in your lane.
- Never invent a fact, figure, date, name or URL. A new figure needs a real source URL and its date; if
  you cannot verify something, label it honestly ("not verified", with the old date) — don't guess.
- Never publish an artifact, never write an artifact database, never edit or fire a routine, never
  commit or push git. You produce files; the integrator applies, verifies and publishes.
- HALT anything that needs a credential, spends money, is a licensed/legal call, or writes to a
  client-facing system — list it for Steven instead.
- Client names, loan amounts or contact details never go into any file you write.
- Deck/portal edits: write a Python script with the Write tool (not a Bash heredoc — the Bash tool turns
  `\uXXXX` into the character). Each change = exact-string replace with `assert s.count(old) == 1`.
  Match the surrounding JS string style (the deck writes `—` escapes inside JS strings). Test on a
  copy: run the script, extract the main `<script>` block(s) and `node --check` them, confirm
  `cdStateSeed` JSON still parses. Report the test result.
