# E8 — Auditor report (Chief Automation Strategist Phase 1 items 2–9, item 23, CPI/Scale seeds)

**Label:** Baseline 2026-09-12 · verified 2026-09-22 (Loop Cycle 6). **Findings file:** `SCRATCH/audit/findings-E8.json` (77 findings, ids F-E8-01…77; 19 P1 / 40 P2 / 18 P3; 14 halted for Steven). **Sources:** BRIEF.md §2, `inventory/*` (cloud-routines, mac-runner-status, routine-health, mac-task-descriptions, db-docs, agent-roster, loopLog, cpiOpportunityLog, backupStatus), the 161-doc `db/state` export (2026-09-22 ~08:10 UTC), and panel texts extracted from `deck/command-deck.html` (commit 5fbe844) by the §7 line ranges. No deck edits were made by E8.

Conventions: "est." time-saved figures are estimates derived from the cited cadence, not measurements — the CPI log's `measured` field is where the real number goes. Trust levels: L1 report-only, L2 draft-for-approval, L3 owns end-to-end. "Never run" means no `lastEnd` under claude-runner (runnerStatus 2026-09-22T04:05:04Z).

---

## (2) Automation opportunities

| # | Area | Trigger | Action | Tool required | Est. time saved / week | Finding |
|---|---|---|---|---|---|---|
| 1 | Business | New lead in `loftyLeads` (poll every 5 min, 07:00–19:00 PT) | Steve drafts the first text into the ISA-line bell; ISA sends; median first-response logged | lofty-bridge MCP (key pending), steve-twin, isaLine | ~1.25 h (ISA's 12:10–12:25 triage block ×5) + the daily manual check the twin does now | F-E8-41, F-E8-33 |
| 2 | Business / data | Zoho profile gets "Zoho CRM API Access" | zoho-crm-sync (Mac, 4×/day) writes zohoSync/zohoLeads/zohoDeals; badge goes green | Composio ZOHO_LIST_LEADS/DEALS | ~1 h (the manual kanban paste, "Refresh from Zoho (paste)") | F-E8-34, F-E8-02 |
| 3 | Business / data | Cloud Pipeline Sync reports a Portal↔Deck mismatch | Mac writer fills `pipeline` / `reClients` from the ISA Portal so post-close ticklers can run | isa-comms-bridge-local pattern, ArtifactData | ~0.5 h + unblocks tw_1790043875001 (post-close ticklers) | F-E8-38 |
| 4 | Data (ops) | Monday 08:00 PT | Cloud backup watchdog reads `backupStatus`, notifies if >8 days or integrity ≠ pass | Routine notifications (push/email) | ~0.25 h of checking; avoids silent data loss | F-E8-35, F-E8-05 |
| 5 | Data (ops) | Daily 06:30 PT | Connector-health watchdog: any doc with status failed/blocked or stamp >2× cadence → phone | read_db + notifications; vanessa-significant-alerts twin | ~0.5 h; cuts detection from 5 days (cpi-20260922-01) to ≤24 h | F-E8-36 |
| 6 | Communication | ISA has posted nothing by 16:30 PT | Bounded nudge ladder (1 nudge → Urgent to Steven → twinQueue needs-steven), never verbatim twice | r3-eod-rollup, vanessa-significant-alerts | Removes 4 no-op nudges/week; surfaces the seat problem once | F-E8-37, F-E8-26 |
| 7 | Communication | r12-inbox-triage slots (06:55 / 13:55 PT) | Add Slack #lo-scenario-help + DMs to the same skip/info/meeting/action triage | Slack connector (connected) | ~0.8 h (the manual scan the twin did 2026-09-21) | F-E8-42 |
| 8 | Communication | Steven replies "approve <id>" on iMessage | vanessa-imessage-inbox flips `marketingQueue` status; approved piece to the ISA 2:15 block | Inkbox iMessage (live) | ~0.3 h; ends 9-day-old drafts | F-E8-47 |
| 9 | Personal | Daily 07:00 PT | Licence/registration/membership expiry inside 14 days → text (Sienna reg. 2026-09-27; NMLS 2026-12-31; CCW 2027-01-31) | licenseTracker/licenses/memberships docs, Inkbox | ~0.2 h + late-fee avoidance | F-E8-45 |
| 10 | Personal | calendar-daily-sync (06:35 / 17:35 PT) | Canvas iCal as a sixth calendar; `uscDeadlines` derived (Week 4 Sep 23/27, final Oct 19) | Google Calendar connector + Canvas iCal URL (Steven) | ~0.25 h | F-E8-44 |
| 11 | Personal / data | month-end-close-prep (28th, never run) | Bookkeeper categorises a CSV drop into `subscriptions` with keep/renegotiate/cancel | actual-budget (installed), bank CSV (Steven) — Plaid has no keys | ~0.25 h (1 h/month) | F-E8-43 |
| 12 | Data | Weekday 22:40 PT | r17 computes drawdown from the QuantVue sheet r4 already reads instead of asking a human | Google Sheets via Composio (r4 path) | ~0.4 h and a real daily log (riskMonitor is empty) | F-E8-49, F-E8-27 |
| 13 | Data | Sunday 16:00 (brain-weekly-verify slot) | Second Brain inbox triage list: 54 of 70 rows are still Inbox | notion-brain MCP, brain-weekly-verify | ~0.5 h | F-E8-50 |
| 14 | Data (efficiency) | local-bridge hourly pass | Run showing-sync only when `showingSyncRequests` is non-empty (18 empty runs/week today) | local-bridge-queue | Runner pool capacity, not Steven's time | F-E8-46 |
| 15 | Business | Monthly, cloud research-only | Grant deadlines/eligibility for the nonprofit into `vanessaResearch` for the grants lead | WebSearch + notifications; nonprofit-grants-lead | ~0.5 h (2 h/month) | F-E8-48 |
| 16 | Health | Daily phone routine ("update my health stats") | Claude iOS → Notion Health Log → `health-notion-sync` → appleHealth tiles (daemon dead since 2026-09-13) | Notion connector (connected), apple-health-notion skill (E11b) | Restores 3 coaching seats' input; ~0.3 h of manual CSV imports | F-E8-08 |

---

## (3) AI clone — Vanessa's expanded task list (F-E8-51)

**L3 — owns end-to-end (each grounded in a task whose last run is ok):**

| Task | Evidence it works today | Integration | Escalation rule |
|---|---|---|---|
| Answer the research queue hourly 07:30–21:30 PT | vanessa-research-queue last ok 2026-09-21 20:31 | Perplexity MCP (Mac), WebSearch | Pending answers are labelled pending; never invented |
| Refresh feeds, rates, calendar, incentives | weather-news-refresh, mortgage-rates-daily, calendar-daily-sync, incentives-daily-scan all ok 2026-09-21 | Google Calendar connector, FRED/Optimal Blue feed | Stale >2× cadence → connector watchdog (F-E8-36) |
| Carry the ISA line both ways | isa-comms-bridge-local ok 2026-09-21 20:38 PT | ISA Portal store | Urgent flag → Steven's phone |
| Answer Steven on iMessage | vanessa-imessage-inbox ok; 17 items handled | Inkbox iMessage | Says plainly when a tool is unavailable (agentInbox 2026-09-15 examples) |
| Sweep her queue and write vanessaBrief | vanessa-sweep ok 2026-09-21 12:35 | `vanessaQueue` (doc missing — F-E8-07) | Needs-Steven list in the brief |
| Generate 4-COA recommendations | vanessaRecommendations (4 pending) | Deck snapshot | Nothing executes on approval without a human |

**L2 — drafts for approval:**

| Task | Where the draft lands | Gate | Finding |
|---|---|---|---|
| ISA client texts (follow-up, confirmation, 30/60/90 check-ins, review asks) | ISA-line bell, draftedBy steve | ISA sends; add ad-compliance-reviewer pass | F-E8-71 |
| Recruiting outreach (LPT candidates, out-of-state referral agents, 25% model) | twinQueue Tue standing task | Human sends | F-E8-07 |
| USC discussion/assignment drafts | twinQueue Sun standing task | Steven submits | F-E8-44 |
| Decision memos (4 COAs) for Next Big Moves | twinQueue monthly + vault 40-Decisions | Vault write currently refused | F-E8-52 |
| Content drafts (r14) and the weekly marketing calendar | marketingQueue | Alexandra check; posting Tier 3 | F-E8-47 |
| Gmail reply drafts (r12 "never sends") | Gmail Drafts | Steven sends | F-E8-42 |
| Zoho stage write-back from the deck board | proposal only | Zoho is system of record; not built | F-E8-34 |
| Backup run, vault notes, pipeline fill | Mac tasks | Reliability Engineer verifies output doc | F-E8-05, F-E8-38 |

**L1 — report only:** CAIO Disruption Brief (E9), council verdicts, Next Big Moves COAs, Friday ops review, CPI/Scale logs, health coaching brief, connector/backup watchdog verdicts.

**New integrations / permissions needed (all Steven):** Lofty API key in `~/.config/lofty/.env`; Zoho "CRM API Access" on the connected profile; Discord bot token; Slack read for r12; Plaid production keys (or CSV drops); runner allow-list for `~/Shearrill-Vault/40-Decisions` and `00-Inbox` (or use the `obsidian-note` bridge verb); Canvas iCal URL.

**Escalation rules (from the E11a v2 spec and the twin's existing packet format):** anything needing licence, signature, money, a live-system change or a commitment to a real person → `twinQueue` needs-steven p1 packet (DECISION NEEDED / EFFECT / WHAT I'D NEED / RECOMMENDATION, as in tw_1790043875003); an agent that stalls → 2 retries → re-route → packet; trust graduation L1→L2→L3 only after 7 consecutive correct runs, never straight to L3.

---

## (4) Skills to add — ranked impact vs effort

| Rank | Skill | Impact | Effort | Status today | Finding |
|---|---|---|---|---|---|
| 1 | `lofty-crm-sync` (Mac task + skill; re-points r2, lead-triage-daily, r11, showing-sync) | Very high — restores speed-to-lead visibility, the #1 non-negotiable | M | Spec by E11b this cycle; key unverified | F-E8-33 |
| 2 | `zoho-crm-sync` | Very high — mortgage system of record finally monitored | M | Spec by E11b; blocked on Zoho permission | F-E8-34 |
| 3 | `ai-ecosystem-backup` v2 (Sunday 00:00, Documents/…, 8 weeks, retry, escalate) | High — last verified backup 2026-09-14 | S | Skill exists (RUN); r6 never run; path mismatch | F-E8-05 |
| 4 | `loop-engineering` v2 + `continuous-process-improvement` v2 + `scale-growth-engine` output | High — the self-improvement layer has produced nothing since Sep 10 | M | Repo skills this cycle; loop-engineering-weekly never run | F-E8-56, F-E8-12, F-E8-13 |
| 5 | `stress-test-sweep` + pure-Node harness gate in nightly-self-test | High — no regression gate is running | S | E7 builds the harness | F-E8-57, F-E8-25 |
| 6 | `apple-health-notion` + `health-notion-sync` task | Medium-high — 9-day-stale health data, 3 coaching seats idle | M | SKILL.md in repo-out; phone run pending | F-E8-08 |
| 7 | `vanessa-orchestrator` v2 (parallel C-suite cycle) | High — Friday ops review has run once | M | Repo skill this cycle; Mac task never run | F-E8-64 |
| 8 | `lofty-followups` (port of fub-followups, 393 templates) | Medium | M | fub-followups exists | F-E8-55 |
| 9 | `interview-me`, `prompt-master`, `skills-refresh` on the Mac | Medium (L4 graph population; prompt hygiene) | S | Repo skills; not installed | F-E8-54 |
| 10 | `cli-anything-connectors` (homes.com, SkySlope, zipForms) | Medium; security-gated | L | Plugin on the Mac; wrappers not generated | F-E8-58 |
| 11 | `isa-escalation-ladder` (r3 rewrite) | Medium | S | — | F-E8-37 |
| 12 | `connector-watchdog` / `backup-watchdog` (cloud, notifications) | High for the cost | S | — | F-E8-35, F-E8-36 |

---

## (5) Routines to build — with trigger and success criteria

| Cadence | Routine | Where | Trigger (PT) | Success criterion | Finding |
|---|---|---|---|---|---|
| Every 5–30 min | lofty-crm-sync | Mac runner | 07:10–19:40 weekdays (30 min) + 5-min poll during the ISA shift | `loftyLeads.status="ok"`, syncedAt <60 min, firstResponse computed | F-E8-33, F-E8-41 |
| 4× daily | zoho-crm-sync (writer) | Mac runner | 07:05 / 11:05 / 15:05 / 19:05 | `zohoSync.status` "ok" within one cycle of the Zoho fix; stages ⊆ ZH_STAGES | F-E8-34 |
| 4× daily | zoho self-test (read-only) | Cloud | 0 */6 UTC | Notification only on a status change | F-E8-34 |
| Daily | connector-health watchdog | Cloud + Mac twin | 13:30 UTC / 06:30 PT | Failed doc → phone within 24 h | F-E8-36 |
| Daily | Morning brief with cloud fallback | Mac (twinBrief) → cloud notification if absent by 06:45 | 05:30 / 06:45 | Exactly one brief delivered daily; source stamped | F-E8-40 |
| Daily | ISA EOD ladder | Mac (r3) | 16:30 | Never two identical nudges in 24 h; ladder state visible | F-E8-37 |
| Daily | Licence/registration alert | Mac (vanessa-significant-alerts) | 07:00 | Any expiry ≤14 days texted once | F-E8-45 |
| Daily | Health Notion sync | Mac (health-notion-sync) after the phone routine | 06:00 | appleHealth.syncedAt = today | F-E8-08 |
| Weekdays | Trading day log from source | Mac (r17) | 22:40 | riskMonitor.days row for every trading day, no "awaiting entry" | F-E8-49 |
| 3× daily → on demand | Pipeline fill from the ISA Portal | Mac | 07:25 / 13:25 / 19:25 | `pipeline`, `reClients` non-empty; drift check reports 0 mismatch | F-E8-38 |
| Weekly | Backup watchdog | Cloud | Mon 15:00 UTC | Alert when lastBackup >8 days or integrity ≠ pass | F-E8-35 |
| Weekly | Parallel C-suite ops review | Mac (vanessa-ops-review, retimed) | Fri 15:30 | vanessaRuns entry + twinQueue decisions every Friday | F-E8-64 |
| Weekly | Second Brain inbox triage | Mac (brain-weekly-verify) | Sun 16:00 | Review list ≤10 lines; Inbox share falls | F-E8-50 |
| Weekly | First-run proof review (Cycle 7) | Human + loop-engineering-weekly | Sat 04:30 → checklist 2026-09-28 | Every never-run task has its expected doc present or an incident row | F-E8-39 |
| Monthly | Grant deadline research | Cloud (notifications) | 1st, 16:00 UTC | Dated, scored prospects into vanessaResearch | F-E8-48 |
| Monthly | Subscription audit from CSV | Mac (month-end-close-prep) | 28th 04:50 | `subscriptions` non-empty with verdicts | F-E8-43 |
| Monthly | Access & credential audit | Mac (access-audit-monthly, first slot Oct 1) | 1st 05:10 | twinQueue item "Monthly access & credential audit" exists | F-E8-39, F-E8-59 |
| Retire | Books/Ops/Risk vault-template routines, Real Estate Weekly Brief (FUB userId 720), cloud Steve twin, cloud ISA bridge | Cloud | — | Enabled count only counts routines that can succeed | F-E8-30, F-E8-32 |

---

## (6) Plugins / integrations — with Elena's security and permission notes

| Integration | Status 2026-09-22 (source) | Trust | Elena's note | Finding |
|---|---|---|---|---|
| Lofty (lofty-bridge MCP, lofty-cli) | Installed, `lofty` MCP connected (toolkit 09-16); API key presence unverifiable from cloud; deck has 0 mentions | L2 | Read-only bridge first; key in `~/.config/lofty/.env` 0600; write-back needs its own review | F-E8-01, F-E8-33 |
| Zoho CRM via Composio | ACTIVE connection, 403 NO_PERMISSION on every call | L2 | Grant the minimum Zoho profile scope (Leads/Deals read) when enabling API access; no delete scope | F-E8-02, F-E8-34 |
| Follow Up Boss via Composio | Retired 2026-09-22; connection still ACTIVE with a rejected key since 09-16 | — | Revoke the Composio connection and the FUB-side API key (dangling credential); decide the (619) 651-9845 number's fate | F-E8-59, F-E8-22 |
| Composio (12 apps) | Connected: api_ninjas, discord, follow_up_boss, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho | mixed | Per-app consumer map; googleads/youtube/gmail only in the routines that use them | F-E8-59 |
| Cloud routine connector grants | 49 of 50 routines granted 8–11 connectors incl. retired You_com and needs-reconnect Canva | — | Least privilege: trim each grant to the prompt's calls | F-E8-31 |
| Inkbox (iMessage/email/SMS) | iMessage live; email = jasmine@inkboxmail.com (Inkbox identity); SMS unavailable; 2nd number never seen | L3 (Steven↔Vanessa only) | Never client-facing; one identity name; trim the allow-list | F-E8-62, F-E8-11 |
| Discord relay bot | Installed on the Mac; bot token pending; channel id null | L2 | Fail-closed allow-list already noted; keep the guild private | F-E8-11, F-E8-15 |
| CLI-Anything + DOMShell/Playwright (homes.com, SkySlope, zipForms) | Plugin installed on the Mac (toolkit 09-16); no wrappers; no vendor APIs | L1 → L2 per wrapper | Read-only verbs; dedicated browser profile; no page dumps leave the Mac; ToS check by Alexandra; ecc-security-steward sign-off before the runner may call any wrapper | F-E8-58 |
| Orca Computer Use v1.4.203 | Installed as a standalone app; not integrated with Claude Code; deck says "not installed" | L1 (proposal) | Any executor with screen control needs the same review as a wrapper; CTO Innovator vets | F-E8-17 |
| apination-bridge / n8n / langflow | Present, RUN, localhost | L1 | Keep bound to localhost; no public tunnel without review | F-E8-75 |
| claude-fallback / omniroute / free-claude-code / freellmapi | Present; subscription-first, free providers on limit; one "client-data guard hook" | — | Business sessions fall back to Jarvis (local) only; PII canary test of the hook | F-E8-60 |
| OSINT / watermarks-remover (PostToolUse hook + LaunchAgent) / heretic / linkedin-scraper | Present on the PII Mac | — | Segregate to another macOS user or disable hooks in the business profile | F-E8-61 |
| Strava (connector + Mac task) | Cloud routine SUCCEEDED 2026-09-22; Mac strava-daily-sync in error; doc lacks `v` | L3 | none | F-E8-29 |
| Notion (connector, notion-brain MCP read-only) | Connected; Second Brain 70 rows | L3 read / L2 write | Health Log database holds health data — keep it in Steven's private workspace | F-E8-08, F-E8-09 |
| Google Calendar / Gmail | Connected; calendar-daily-sync ok; r12 drafts only | L3 read / L2 draft | Gmail send stays human | F-E8-42 |
| Plaid | No keys; no Composio toolkit; bridge being built | — | Access tokens 0600 on the Mac; never in the deck | F-E8-28, F-E8-43 |
| Canva / M365 (OneNote) / HDA / BlackRock / PlayMCP | needs_reconnect / not connected / not connected / not connected / connect_incomplete | — | Show honestly; reconnect Canva only if Sofia's designer needs it this quarter | F-E8-63 |
| OpenRouter | No key; council outside seats unpriced (estimate $0.09/run) | — | Optional; if enabled, key in `~/.config/openrouter/.env` 0600 | F-E8-60 |
| You.com | Retired 2026-09-22 ("limit exceeded" 08:40 UTC) | — | Remove from all routine grants; relabel every in-page call site (§2 rule) | F-E8-31 |

---

## (7) Orchestrator agents to incorporate

| Agent / role | Exists? (roster 172) | What changes | Finding |
|---|---|---|---|
| vanessa-orchestrator v2 (parallel C-suite cycle, ≤8 parallel, ≤4 Perplexity/wave, 2 retries → re-route → packet) | Yes (fable, tier 1) — v2 skill written this cycle | Run the Friday review on the Mac inside the runner window; disable the cloud duplicate | F-E8-64 |
| reliability-engineer as incident commander | Yes (tier 1, Elon) | Owns every status=failed doc as an incident row (owner, first-seen, last-seen, next action) | F-E8-67 |
| mortgage-pipeline-watchdog (SCALE-05 owner: cco-alexandra; escalation mortgage-broker-elite) | Owner named in roster metadata, no task | Implemented by zoho-crm-sync + mortgage-desk-weekly (Sun 06:05, never run) | F-E8-66 |
| task-watchdog (no-LLM LaunchAgent) | Tool present, LaunchAgent not installed | Install; heartbeat mirrored into runnerStatus | F-E8-65 |
| loop-operator + harness-optimizer (Nadia) | Yes | Feed them the runner's `waiting`/`backoffUntil` and the first-run proof checklist | F-E8-39 |
| chief-automation-strategist | Yes | Owns this findings table via automation-audit-weekly (Sat 03:40, never run) | F-E8-39 |
| ecc-security-steward + access-auditor (Elena) | Yes | Gate CLI-Anything wrappers, fallback routing, OSINT segregation; first access audit Oct 1 | F-E8-58, F-E8-60, F-E8-61 |
| "Anything/Orca computer-use executor" | Not on the roster | Proposal only, vetted by CTO Innovator (E6 adds the row) | F-E8-17 |

---

## (8) ISA coverage map — every hand-off, monitoring and QA layer

| Layer | Between | Mechanism | Status 2026-09-22 | Missing / fix |
|---|---|---|---|---|
| Two-way thread | Steven ↔ human ISA | isaLine + isa-comms-bridge-local (hourly 07:37–21:37 PT) | Bridge ok (2026-09-21 20:38 PT); no ISA-authored message in the export; ISA last read 2026-09-13 | ISA-side notification/digest (F-E8-69) |
| Drafted replies | Vanessa/Steve → Steven → ISA | "Draft · Vanessa / Draft · Steve", "Send as … (approved by me)" | Live in the page | Compliance pass on ISA client texts (F-E8-71) |
| Daily playbook | Vanessa → ISA | isaDailySchedule (theme days, hourly blocks, VIP-50) | Doc 2026-09-10; ISA Portal renders it | none |
| Lead hand-off / speed-to-lead | CRM → ISA → Steven | r2 watchdog (30 min), lead-triage-daily 11:33, ISA-line summary | Broken since 09-16 (FUB); Lofty not wired | lofty-crm-sync + 5-min poll (F-E8-33, F-E8-41) |
| First-text drafts | Steve → ISA bell | twinQueue standing daily task | Pending since 2026-09-09 (no lead source) | unblocked by Lofty |
| EOD summary | ISA → Steven (r3 nudge, twin synthesis) | r3-eod-rollup 22:45, twin EOD synthesis | 4 verbatim nudges; 0 summaries since 09-13; twin reports "no summary" honestly | escalation ladder (F-E8-37) |
| Self-report scorecard | ISA → Portal → r11 | isaScorecard (4:10 PM) | Empty forever; r11 never run; OUTPUT_WATCH mis-wired | Portal form write path (F-E8-70); r11 first run 09-27 |
| Weekly KPI actuals | CRM → ISA Portal | r11-isa-kpi-compile (Sun 04:40) | One hand run 2026-09-13 with "no data" on 4/6 metrics | Lofty + Zoho sources (F-E8-70) |
| Showings coordination | Steven → ISA → Showami/ShowingTime | "Send to ISA", showing-sync 3×/day | Queue always empty; showingSchedule null | event-driven runs (F-E8-46); confirm the ISA keeps the schedule |
| Coaching | Maxwell → Steven/ISA | coach-weekly-recs Mon 06:10 | Never run (coachLog single hand entry 09-10) | first-run proof 09-28 (F-E8-39) |
| Weekly review | Vanessa (C-suite) → Steven | vanessa-ops-review Fri; cloud duplicate | Never run / FAILED 09-18; vanessaRuns single entry 09-11 | Mac task Fri 15:30 (F-E8-64) |
| Grading & onboarding | Steven → ISA | ISA performance grading (avg "—"), 90-day plan 0/18, RACI template | Never filled | Depends on the seat decision (F-E8-72) |
| Engineering QA | Engineering Team → every change | ECC gate; nightly-self-test; automation-audit-weekly | self-test timing out; weekly audit never run | harness gate (F-E8-57) |
| Escalation to Steven | any layer → phone | vanessa-significant-alerts (error), bridge push, twinQueue needs-steven | Only the twinQueue path works | connector watchdog + alerts repair (F-E8-36) |
| The seat itself | Steven → human ISA | kanban k1 (backlog, p2) | Unfilled per Vanessa's 2026-09-11 recommendation, still pending | Steven's decision (F-E8-72) |

Summary of missing layers (F-E8-68): (a) acknowledgement/reply detection, (b) CRM-side ISA activity monitor, (c) ISA-side alerting, (d) compliance QA on ISA texts, (e) scorecard write path, (f) a human in the seat.

---

## (9) Unlisted-but-recommended capabilities, with reasoning

| Capability | Where it already exists | Why it matters | Finding |
|---|---|---|---|
| Routine notifications (push/email) on fresh-session cloud routines | Platform feature; unused by all 50 routines | Turns "research-only" cloud runs into delivered verdicts without any artifact write | F-E8-73 |
| health-export-mcp / apple-health-xml-mcp / apple-health-parser | On the Mac, MCPs connected | Optional second health source beside the Notion recipe; the daemon can be retired | F-E8-74 |
| Webhooks via apination-bridge / n8n | On the Mac, RUN | Event-driven lead detection instead of 30-minute polling; fewer LLM runs | F-E8-75 |
| quill + whisper + parrot | On the Mac, RUN | Post-meeting transcript → CRM note draft (L2), opt-in per meeting | F-E8-76 |
| Local Bridge verbs (backup, health, obsidian-note, jarvis-ask) | Proven 2026-09-12 (lb1–lb4), injection refused (lb5) | Replace copy-a-prompt buttons; a sanctioned vault write path for the twin | F-E8-77, F-E8-52 |
| task-watchdog (no-LLM) | Tool present, LaunchAgent template not installed | Catches hung/no-output runs, stale backups, silent vault independently of the LLM pool | F-E8-65 |
| E7 pure-Node runtime harness | Built this cycle | Sub-minute regression gate the timing-out jsdom task cannot provide | F-E8-57 |
| actual-budget | Installed, RUN | Subscriptions/money housekeeping without Plaid | F-E8-43 |

---

## (23) Missing C-suite / supporting AI employees (checked against the 172-agent roster)

Exists already — not proposed again: research (research-analyst under Nadia), data analysis (data-steward, mortgage-analytics-lead, mktg-analytics-lead, re-market-analytics), content (content-writer + 14 Sofia reports), compliance (cco-alexandra + 12 reports incl. ad-compliance-reviewer, trid-timeline-checker, mortgage-qa-auditor), customer success (client-concierge, borrower-retention-agent, escalation-recovery-agent), CAIO scout (disruption-scout), backup/ops (automation-engineer, reliability-engineer, loop-operator, access-auditor), ISA AI (mortgage-isa-ai, lead-triage-analyst, showing-coordinator), coaching (broker-coach-maxwell), health (health-coach-analyst, fitness-trainer, meal-planner), nonprofit (nonprofit-grants-lead, nonprofit-grant-writer), bookkeeping/tax (bookkeeper, commission-tracker, tax-deadline-analyst).

| Proposed role | Gap evidence | Reporting line | Interface with the orchestration skill |
|---|---|---|---|
| Executive Assistant (Steven-specific; the only "chief-of-staff" is a generic tier-3 email/Slack/LINE triager) | r13 apptPrep never written; USC deadlines hand-kept; licence expiries unpaged; travel/PTO panels manual | Vanessa (tier 1) | Owns calendar/prep/deadline packets; writes apptPrep, uscDeadlines, expiry alerts; L2 for anything sent |
| Incident Commander (system, not file) | FUB 5 days, health daemon 9 days, backup 8 days undetected | Reliability Engineer → CTO Innovator | Opens/closes incident rows in routineHealth; triggers connector/backup watchdogs; posts needs-Steven packets |
| Trading Journal Analyst | riskMonitor accounts [] / "awaiting entry"; r17 interviews a human; hedge-fund seats are research, not journaling | portfolio-manager (Marcus line) | Reads the QuantVue sheet / exports; writes riskMonitor; L1 report to Apex desk |
| Second Brain Librarian | 54/70 Inbox rows; ops-knowledge-graph never run; Drive folder 0 files; no 'brain/notion/knowledge' agent | Capability Engineer (Elon) | Runs the Sunday triage list, graph rebuild request, interview-me feed; never graphs a secret |
| Legal counsel (contracts/entities; distinct from mortgage compliance) | 0 'legal'/'attorney' agents; feasibilityChecks and Dream Empire cards repeatedly say "needs a CA-licensed tax attorney/CPA"; family-office structures (plan5yr) | cco-alexandra (Compliance) | L1 only: issue-spotting memos; always ends with "licensed counsel required" |
| Family-office / wealth seat as an agent (James exists only as a Desktop skill + deck chat) | 0 'wealth'/'family' roster agents; foReviews, estateReview docs hand-kept | cfo-marcus | Same persona as james-wealth skill; L1 audits of the six layers; no execution |
| Travel & Experiences coordinator | Travel panel weekly refresh is research-only; Delegate section names "travel/experience planning" as not yet delegated | Executive Assistant | L2 itineraries; bookings stay human |
| Human-ISA Success Manager (AI) | ISA silent since 09-13 with no detection; grading/onboarding panels empty | cro-victor | Owns the ladder, scorecard write path, coaching digest to the ISA; escalates to Steven |

---

## (24) CPI opportunities (≥10) — v2 log shape seeds

| id | opportunity | evidence | expectedSaving (est.) | complexity | IMPLANT-eligible? |
|---|---|---|---|---|---|
| cpi-20260922-02 | Bounded ISA nudge ladder instead of verbatim repeats | isaLine cd-r3-* ×4 (Sep 13–16); cpi-20260914-01 | 4 no-op sends/week; one real escalation | Low | Yes (low-risk, high-confidence) |
| cpi-20260922-03 | Connector-health watchdog with ≤24 h detection | leadResponse staleSince 09-16 → noticed 09-22 | 5 days of blind pipeline per incident | Low | Yes |
| cpi-20260922-04 | Cloud backup watchdog via notifications | backupStatus 09-14; r6 never run; lb2 "no backup directory" | Detection ≤8 h after a missed Sunday | Low | Yes |
| cpi-20260922-05 | Event-driven showing-sync | showingSyncRequests [] on every run; 18 runs/week | ~18 LLM runs/week; pool slots | Low | Yes |
| cpi-20260922-06 | OUTPUT_WATCH re-wiring (4 rows) | routineHealth notes on r1/r5/r11; cpiCycles vs cpiOpportunityLog | False stale/fresh readings removed | Low | Yes (E1 region) |
| cpi-20260922-07 | r7 honest "not-configured" state | r7 "ok" with no keys; plaidBalances absent | Ends a false-green | Low | Yes |
| cpi-20260922-08 | r17 reads the QuantVue sheet instead of asking a human | riskMonitor "awaiting entry"; r17 description | ~5 min/day + a real log | Medium | Yes after one supervised run |
| cpi-20260922-09 | Trim connector grants on all 50 routines | cloud-routines.json conns | Attack surface; fewer permission prompts | Low | Yes |
| cpi-20260922-10 | Retire six dead cloud routines | FAILED/ABANDONED list | Ops Radar count becomes truthful | Low | Yes |
| cpi-20260922-11 | Morning brief: one writer + cloud fallback | r1 error 09-17, vanessa-morning-brief-text limited, cloud briefs undelivered | Brief delivered daily | Medium | Yes |
| cpi-20260922-12 | Pipeline/reClients filled from the ISA Portal | pipeline [], reClients absent vs Portal "2 loans $835K" | Post-close ticklers + true pipeline view | Medium | No — needs Steven's confirmation of the Portal as source of truth |
| cpi-20260922-13 | Second Brain inbox triage list | 54/70 Inbox rows | ~30 min/week | Low | Yes (review list only; status changes wait for Steven) |
| cpi-20260922-14 | Slack scan inside r12 | twin's manual Slack scan 09-21 | ~10 min/day | Low | Yes |

Cumulative `measured` and `cumulativeSaved` stay 0 until cpi-daily-scan runs again (error since 2026-09-17).

---

## (25) Scale / ADR opportunities (≥10)

| id | opportunity | lens | capacityImpact | delegate target + reasoning | replication template |
|---|---|---|---|---|---|
| scale-20260922-01 | Speed-to-lead on Lofty with 5-min detection and drafted first text | Automate | 5×: every new lead gets a first touch inside the SLA without Steven | ISA sends (human); Steve drafts — the standing task already exists | "new-record → draft → bell" pattern reusable for Zoho leads and showing confirmations |
| scale-20260922-02 | Zoho + Lofty as two monitored systems of record | Automate | Removes the manual paste; two CRMs, one doc shape each | Integration Engineer builds; Alexandra owns mortgage watchdog (SCALE-05 owner already named) | `<crm>-crm-sync` task spec (E11b mac-task-specs.md) |
| scale-20260922-03 | Friday parallel C-suite ops review on the Mac | Automate + Delegate | One brief replaces five separate reads for Steven | Vanessa (confirmed owner: kanban kr15, vanessaRuns) | parallel-csuite-task-cycle.md (E11a) — reuse for the Monday dispatch (kr26) and midweek check (kr27) |
| scale-20260922-04 | Human-ISA success layer (ladder, digest, scorecard path) | Delegate | Restores the 12–4 PM shift as a delegated unit | Victor (CRO) — owns ISA performance per roster; HALT until Steven confirms the seat (F-E8-72) | ISA Portal + isaLine kit reusable for a second ISA or a showing assistant |
| scale-20260922-05 | Executive Assistant agent for prep/deadlines/expiries | Delegate | Frees the 05:00–05:30 prime block and the Sunday review from bookkeeping | Vanessa dispatches; no confirmed receiving owner yet → HALT per scale-growth-engine rule | EA packet template (calendar + deadlines + expiries) |
| scale-20260922-06 | Cloud research routines + notifications as the delivery tier | Automate | 46 enabled routines start producing delivered outputs | CTO Innovator | Prompt suffix "end with a ≤120-word verdict; notifications on" |
| scale-20260922-07 | Event-driven runner dispatch (webhooks, non-empty queues) | Automate | Runner pool capacity for the 20 never-run weekly tasks | Reliability Engineer | local-bridge "check then dispatch" wrapper |
| scale-20260922-08 | fub-followups → lofty-followups template library | Replicate | 393 templates reusable across leads without rewriting | Sofia's mktg-email-campaign-manager (existing owner of lifecycle sequences) | Merge-field map per CRM |
| scale-20260922-09 | Parallel engineering worktrees (this cycle's E1–E11 pattern) for every deck refresh | Replicate | 11 regions edited in one cycle instead of serial sessions | CTO Innovator; sandbox-qa compares | BRIEF.md §5–§7 as the template; quickcheck + harness as gates |
| scale-20260922-10 | Backup v2 with cloud watchdog | Automate | Zero manual verification; 8-week retention | Reliability Engineer | ai-ecosystem-backup v2 (E11a) |
| scale-20260922-11 | Second Brain five-level router (E10 files) laid onto the Mac | Replicate | One recall order for every agent; cache TTL cuts Mac-side turns | Capability Engineer | CLAUDE.md/AGENTS.md router + MAC-INSTALL.md |
| scale-20260922-12 | CLI-Anything wrapper factory for API-less vendor sites | Automate (gated) | Lifts homes.com / SkySlope / zipForms lookups off Steven | Integration Engineer; ecc-security-steward gate; Alexandra ToS check → HALT until both sign | cli-anything-connectors skill (E11b) |

Metrics to record before/after each: throughput (leads touched/day, briefs delivered/week), cost-per-output (LLM runs per delivered doc — showing-sync today 18/0), tasks-per-hour of runner pool. `cumulativeCapacityUnlocked` starts at 0 — no Scale item has been measured.

---

## Routing table — findings not cited in the numbered tables

| Finding | What | Route to |
|---|---|---|
| F-E8-04 | Cloud routine status baseline (46/50 enabled, 10 FAILED, 2 ABANDONED, 4 disabled) | CTO Innovator; E1 for the Ops Radar copy |
| F-E8-10 | Roster/model-tiering baseline (172 agents; opus 93 / sonnet 78 / fable 1; maxParallel 8) | E6 org chart — no roster change |
| F-E8-14 | panel-brief "all 20 cloud routines enabled" | E1 |
| F-E8-16 | panel-easop "FUB fully working", lead-triage 11:40 → 11:33, capacity-audit row | E4a / E4b |
| F-E8-18 | kanbanCards recurring rows vs runner crons; kr23 FUB → Lofty (live doc, not only a seed) | E1 + integrator (doc update) |
| F-E8-19 | panel-nextmoves ADR inventory lists failed routines as "real automation" | E5 |
| F-E8-20 | panel-wellness Apple Health R8 pipeline claim | E5 |
| F-E8-21 | Kevin (deck) vs cole-mentor (Desktop skill) naming drift | Steven |
| F-E8-23 | OUTPUT_WATCH rows mis-wired (isaScorecard/r11, cpiCycles/cpi-daily-scan, ratesSnapshot/r5, twinBrief/r1) | E1 |
| F-E8-24 | r13-appointment-prep never writes apptPrep despite real meetings | Reliability Engineer |
| F-E8-53 | Outbound voice agent (Retell/Bland) — keep as L1 proposal, IGNORE this quarter | CAIO / E5 card copy |

---

## Summary — highest-priority findings (≤400 words)

The dashboard's real-estate lead flow has been blind since 2026-09-16 (F-E8-01): both Follow Up Boss readers fail on a rejected key, Steven has retired FUB for Lofty, and the Lofty bridge on the Mac has an unverified key and no `loftyLeads` doc — the base deck contains zero mentions of Lofty and 32 lines of FUB. The mortgage system of record is unmonitored too (F-E8-02): Zoho's Composio connection answers 403 on every call until Steven enables "Zoho CRM API Access". Speed-to-lead, the first non-negotiable, therefore has no measurement path on either side.

The human ISA layer is silent (F-E8-06, F-E8-72): no ISA-authored message exists in the export, the ISA last read the line on 2026-09-13, the scorecard has never been filled, and r3 sent the same nudge four times without noticing. Every ISA automation assumes a working seat; none detects its absence. This is a staffing decision only Steven can make.

Operational safety nets are down: the last verified backup is 2026-09-14 and r6 has never run under the runner while the doc path and the target spec disagree (F-E8-05); nightly-self-test times out so no regression gate protects six parallel engineers (F-E8-25); 11 runner tasks are in error and 20 weekly/monthly tasks have never fired (F-E8-03, F-E8-39); the cloud's ten failing weekly loops include three template routines that read a vault that does not exist (F-E8-30).

Two cheap, high-value fixes need no new credentials: a cloud backup watchdog and a connector-health watchdog that deliver through Routine notifications (F-E8-35, F-E8-36, F-E8-73) — the FUB break would have been paged within a day instead of surfacing five days later as a twinQueue item.

Security (Elena): 49 of 50 cloud routines hold 8–11 connectors including the retired You.com (F-E8-31); the FUB credential dangles in Composio (F-E8-59); free-provider fallback routing and OSINT/de-watermarking hooks share the Mac that holds client PII (F-E8-60, F-E8-61); CLI-Anything wrappers for homes.com/SkySlope/zipForms must stay read-only behind an ECC review and a ToS check (F-E8-58).

Steven-only actions (halt=true, 14 findings): Lofty API key, Zoho profile permission, ISA seat decision, backup first run and path, phone health routine, vault allow-list, Composio/FUB revocations, LaunchAgent install, CLI-Anything install and ToS, Mac skill install, Canvas iCal, bank CSVs, mentor naming.

E8 changed nothing on the deck: 77 findings (19 P1, 40 P2, 18 P3); the 9 stale-content items are routed to E1, E4a, E5, E6 and the integrator in the routing table above.
