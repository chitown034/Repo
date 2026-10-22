# Master Findings Table — Cycle 6

**Baseline:** 2026-09-12 04:47 UTC · **Audited and remediated:** 2026-09-22 · **Findings:** 285 (cycle 6) + 313 (2026-09-22 engineering pass, folded in below) = 598

Every row below was produced by an engineer working one named region of the ecosystem, and is
traceable to a live document, a scheduled task, or a dated external source. A row marked
Escalated is waiting on Steven and says why in its halt reason.

The cycle-6 rows were re-adjudicated on 2026-09-22 by X2: 37 rows changed (listed under
*Earlier findings changed by the 2026-09-22 pass* in the dated section at the end). Statuses in this
part are current; the 2026-09-22 section carries the new rows and their own totals.

## Totals (cycle 6 rows)

| By priority | | By resolution | | By owner | |
|---|---|---|---|---|---|
| P1 | 94 | Open | 106 | Reliability Engineer | 67 |
| P2 | 132 | Fixed | 104 | Integration Engineer | 53 |
| P3 | 59 | Escalated | 42 | Steven | 46 |
|  |  | Implemented | 21 | Capability Engineer | 36 |
|  |  | Improved | 12 | Vanessa | 33 |
|  |  |  |  | CTO Innovator | 23 |
|  |  |  |  | Efficiency Engineer | 15 |
|  |  |  |  | Stress Test Engineer | 6 |
|  |  |  |  | CAIO | 3 |
|  |  |  |  | Victor | 2 |
|  |  |  |  | CRO | 1 |

## Halted — waiting on Steven (47)

- **F-E1-13** — The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through  
  *Re-pointing r2-lead-response-watchdog, lead-triage-daily, r11-isa-kpi-compile and showing-sync from Follow Up Boss to Lofty needs a Mac-side task edit plus the LOFTY_API_KEY in ~/.config/lofty/.env, which cannot be reached or verified from the cloud.*
- **F-E1-18** — The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only becau  
  *Diagnosing and re-running a failing Mac runner task needs access to the Mac and its task logs; a scheduled run that dies on a permission prompt can only be cleared by Steven pressing Run now once in the desktop app.*
- **F-E11A-02** — Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cro  
  *Changing the backup cron and moving the backup root are Steven's decisions; pruning or moving existing backup folders is irreversible.*
- **F-E12-04** — The portal pinned Steven's Follow Up Boss calling number and lead-forwarding email as the numbers to use for every real-estate lead. With FUB retired, whether that number now route  
  *Only Steven knows whether the (619) 651-9845 line and steven.shearrill@followupboss.me were migrated to Lofty. The human ISA is told to use them on every lead call.*
- **F-E12-05** — Zoho remains the system of record for mortgage, but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (re-verified 2026-09-22 08:17 UTC). Several places on the p  
  *Fix is Zoho-side and only Steven can do it: Zoho CRM -> Setup -> Security Control -> Profiles -> the connected user's profile -> enable 'Zoho CRM API Access'.*
- **F-E12-15** — The ISA line works, and it is the only thing that crosses: isa-comms-bridge-local on Steven's Mac, hourly 7:37 AM - 9:37 PM PT, last ok 2026-09-21 8:38 PM PT. Both copies of the th  
  *Steven has to decide whether to accept a Mac-only bridge or fund a path that survives his Mac being asleep.*
- **F-E12-22** — Lofty is the CRM of record from 2026-09-22 but no loftyLeads document has ever been written. The Mac has the lofty-bridge MCP server and lofty-cli; the API key (Lofty -> Settings -  
  *The API key lives on Steven's Mac and only he can add it. Until then there are no live real-estate lead numbers on either dashboard.*
- **F-E2-09** — The Remote Run card presented the cloud routine as the primary working path. The live hfRequest doc says otherwise: AAPL, requested 2026-09-11, started 2026-09-13, status failed at  
  *Restoring the committee's cloud path needs network egress opened for the cloud routine environment (Yahoo Finance, stooq, sec.gov, apple.com, macrotrends) - an infrastructure/permission decision outside an engineer's scope. Until then the honest position, now on the card, is Mac-only.*
- **F-E2-11** — The Risk monitor card offered two number inputs and nothing else. It never read the riskMonitor document at all - the deck stores riskDailyLossTriggered and riskAccountsBlown as se  
  *Making the daily trading log real needs Steven to decide whether the 69 futures / 45+ forex prop accounts get wired into riskMonitor.accounts (credentials and a data path per firm), and Derek to repair r17-trading-day-log. Neither is an in-page change.*
- **F-E4a-02** — No loftyLeads document exists in the live store (checked against all 161 exported docs, 2026-09-22 08:10 UTC) and no lofty-crm-sync task exists under claude-runner. The Mac has lof  
  *Needs the Lofty API key (Lofty → Settings → Integrations → API) placed in ~/.config/lofty/.env on the Mac. A credential cannot be obtained or verified from this sandbox.*
- **F-E4a-04** — The Composio Zoho connection is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION: Crm_Implied_Api_Access — re-verified 2026-09-22 08:17 UTC against ZOH  
  *Requires a permission change inside Steven's Zoho CRM admin console. Not doable from the deck, Composio or this sandbox.*
- **F-E4b-07** — The Showings integrations table listed Follow Up Boss as green / 'Composio connected' and claimed confirmed showings are logged on the client's CRM record by the sync task. That ha  
  *Needs Steven: the Lofty API key at ~/.config/lofty/.env (Lofty Settings -> Integrations -> API), then showing-sync re-pointed off the 'fub' leg. No credential can be obtained or installed from the cloud.*
- **F-E4b-18** — Everything E4b rewrote to say 'Lofty' now depends on a Lofty connection that does not yet write. Composio has no Lofty toolkit; the Mac has lofty-bridge (read-only MCP over Lofty's  
  *Needs Steven: obtain the Lofty API key (Lofty Settings -> Integrations -> API), place it in ~/.config/lofty/.env on the Mac, and run lofty-crm-sync once. Nothing about this can be done from the cloud, and no write path to Lofty exists today.*
- **F-E4b-19** — The ISA measurement loop is broken at every link and the deck previously showed none of it. r11-isa-kpi-compile (Sun 4:40 AM PT) has never run under claude-runner. The isaKpi docum  
  *Needs Steven / the human ISA: the daily 4:10 PM scorecard has never been filled in, so no self-report delta can ever be computed. Plus r11-isa-kpi-compile must be proven with one manual run.*
- **F-E5-02** — Root cause of F-E5-01 is at the WRITER, and it is outside this deck. Whatever wrote stravaSnapshot on 2026-09-20 (via string: 'claude-code-session (Strava connector, direct read)')  
  *Only Steven can edit the Mac task prompt. Paste routines/mac-task-repairs.md §1 over strava-daily-sync before 2026-09-23 12:20 UTC or the v9 repair is overwritten.*
- **F-E5-08** — The Apple Health card described a working pipeline ('The R8 sync writes this card's snapshot at 5:10 AM and 9:10 PM'). Truth on 2026-09-22: the ingest daemon (LaunchAgent, port 876  
  *Restarting the LaunchAgent ingest daemon on the Mac is outside the deck and cannot be done from the cloud.*
- **F-E5-11** — The replacement route for the dead daemon is described on the card as what it is: spec written 2026-09-22, first phone run pending. Claude iOS reads Apple Health on the phone, writ  
  *Needs Steven to run the phone loop once and approve the Notion write; nothing about it can be proved from the cloud.*
- **F-E6-07** — Baseline 2026-09-12 · verified 2026-09-22 — The ISA has posted nothing on the line since 2026-09-16; r3 keeps requesting the EOD summary; isaScorecard never filled. The bridge is h  
  *human staffing/communication decision — not fixable from the deck*
- **F-E6-13** — Baseline 2026-09-12 · verified 2026-09-22 — Every Zoho call returns 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC). Only Steven can fix: Zoho CRM → Setup   
  *needs Steven's Zoho admin action*
- **F-E6-14** — Baseline 2026-09-12 · verified 2026-09-22 — lofty MCP shows connected in the 2026-09-16 snapshot, but whether the API key is present in ~/.config/lofty/.env cannot be verified from  
  *credential + first run on the Mac*
- **F-E8-01** — Speed-to-lead and lead triage have been blind since 2026-09-16: leadResponse doc status=failed, staleSince 2026-09-16T02:42:40Z, failedAt 2026-09-22T03:02:14Z ('Invalid API Key or   
  *Needs the Lofty API key in ~/.config/lofty/.env on the Mac (Lofty Settings → Integrations → API) and a first 'Run now' — both Steven-only.*
- **F-E8-02** — Composio connection zoho_talite-spike is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC on ZOHO  
  *Zoho-side profile permission (Setup → Security Control → Profiles → enable 'Zoho CRM API Access') can only be changed by Steven.*
- **F-E8-06** — isaLine (8 messages) contains only Command-Deck-originated messages; the export has no ISA-authored message at all, isaLineRead.isa = 2026-09-13T22:11:56Z is the last time the ISA   
  *Whether the ISA seat is filled, replaced or paused is a human staffing decision.*
- **F-E8-65** — loopLog cycles 4–5 (F-024) proved that scheduled tasks only fire when the app is up; the headless claude-runner now reports loggedIn=true but 20 tasks still have no run and several  
  *Installing a LaunchAgent on the Mac is Steven's action.*
- **F-E8-72** — kanban k1 'Screen & onboard ISA (Executive Assistant) candidates' (p2, backlog, no due date); vanessaRecommendations vr-1757631000000-isa (2026-09-11, pending): 'fill it or reassig  
  *Staffing decision — human only.*
- **F-INT-03** — The Zoho connection is ACTIVE (Composio account created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION with detail Crm_Implied_Api_Access. Verified today against bot  
  *Needs an account permission only Steven can grant: Zoho CRM, Setup, Security Control, Profiles, the connected user's profile, enable 'Zoho CRM API Access'.*
- **F-INT-05** — Composio disclosed a security incident on 2026-05-21: roughly 5,241 API keys and 5,001 GitHub OAuth tokens exfiltrated through a compromised employee OAuth token. Composio is the p  
  *Credential rotation and re-authorization are account actions only Steven can take. Worth doing before, not after, the Zoho API permission is granted.*
- **F-E1-20** — The live calendarSnapshot (2026-09-21 19:26 PT) reports two of the nine tracked Google calendars unreadable: the Patriot Pacific work calendar shares free/busy only so no event tit  
  *Changing Google Calendar sharing on sshearrill@patriotpacific.com from free/busy to full detail, and repairing the SPACE CA calendar subscription, are account-permission changes only Steven can make.*
- **F-E11A-06** — The Mac still carries the fub-followups skill (a Follow Up Boss template library) after Follow Up Boss was retired 2026-09-22 in favour of Lofty. skills-refresh flags it as needing  
  *Pruning or replacing an installed skill is destructive (standing loop halt: 'skill prune — destructive').*
- **F-E12-21** — The ISA's self-grades and KPI actuals are written to isaGradingScores and isaKpiSopActuals. Neither document exists on the ISA Portal store or on Command Deck - checked both on 202  
  *Needs a decision on whether the ISA's self-grades should reach Steven automatically, and a task to carry them if so.*
- **F-E3-06** — Baseline 2026-09-12 · verified 2026-09-22. Per brief §2 there are no Plaid API keys, and the 161-doc live export contains no plaidBalances document at all — it has never been writt  
  *Live balances need Plaid Production credentials — money and a vendor account. Steven only: dashboard.plaid.com → Team Settings → Keys, then ~/Applications/plaid-bridge/.env.*
- **F-E4a-12** — CLI-Anything is installed on the Mac as a Claude Code plugin (toolbox status RUN, commands only, no hooks), but its hub carries no CRM or real-estate entry (README checked 2026-09-  
  *Installation and credential entry must happen in a Claude session on Steven's Mac; ECC security review is required before any non-read-only action is enabled.*
- **F-E4b-14** — licenseAlerts() is correct (expired, 7, 30 and 60-day tiers all handled and an expired row is labelled 'expired N days ago', not 'due'), but it only fires on rows that carry a date  
  *Needs Steven: only he can confirm the real renewal dates from the source documents. Writing them from a second store would be a guess on a licensing surface.*
- **F-E5-12** — Mentor naming drift, kept per instruction and logged for Steven. The deck's mentor is Kevin (panel-kevin, kevinChat, panel title 'Kevin — High-Value Man Mentor'); the installed Cla  
  *Renaming a skill or a dashboard seat is a human naming decision, and merging the two chat documents would overwrite one of them.*
- **F-E6-09** — Baseline 2026-09-12 · verified 2026-09-22 — Last run 2026-09-21 was refused its vault step: Bash write to ~/Shearrill-Vault is not on the task allow-list (routineHealth). Queue/bri  
  *permission change on the Mac runner allow-list*
- **F-E6-21** — Baseline 2026-09-12 · verified 2026-09-22 — 'Three more queued, not installed' → interview-me, prompt-master, skills-refresh (plus lofty-crm-sync, zoho-crm-sync, cli-anything-conne  
  *Mac install needs a Claude Code session on the Mac (Steven)*
- **F-E8-08** — appleHealth syncedAt 2026-09-13T23:15:59Z (9 days stale); r8-apple-health-snapshot 'RAN BUT PRODUCED NOTHING — ingest daemon on port 8765 not responding'; health-full-analysis erro  
  *The first 'update my health stats' run on the phone and the Notion Health Log database creation are Steven's actions.*
- **F-E8-52** — steve-twin-sweep (weekdays 12:55 PT) last status 'refused: Bash (write access to ~/Shearrill-Vault) — vault step (B2) incomplete; circuit breaker open until 2026-09-22T01:27Z'; the  
  *Changing the runner's allow-list is a Mac-side security change Steven must approve.*
- **F-E8-54** — The AI employee skill toolkit card says the three are 'queued this cycle, not installed yet'. This cycle E11a writes interview-me and prompt-master as repo skills (SCRATCH/repo-out  
  *Installing skills on the Mac requires Steven to run the install prompt.*
- **F-E8-58** — toolkit index (2026-09-16): 'cli-anything (HKUDS, MIT) Claude Code plugin … generates agent-friendly CLIs … Commands only, no hooks' is already installed on the Mac; the hub has no  
  *Installing on the Mac and logging into vendor sites are Steven's actions; ToS acceptance is a human decision.*
- **F-E8-59** — Composio connected apps: api_ninjas, discord, follow_up_boss, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho. Follow Up Boss is retire  
  *Revoking credentials in Composio/FUB is Steven's action.*
- **F-E3-12** — Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned, NOT edited (panel-aiteam belongs to E6). openrouterCredits reads {state:'no_key', ok:false, checkedAt 2026-09-16} an  
  *Outside-model council seats need an OpenRouter API key and a funded balance — credentials plus money, Steven's call. Nothing in the deck should imply they can run until then.*
- **F-E4a-13** — Composio still lists follow_up_boss among the twelve connected apps and reports it ACTIVE, even though its credentials have been rejected since 2026-09-16 and the product is retire  
  *Disconnecting a Composio app is an account-level action on Steven's claude.ai/Composio account and is irreversible without re-authorisation.*
- **F-E6-30** — Baseline 2026-09-12 · verified 2026-09-22 — Deck mentor is 'Kevin' (panel-kevin, kevinChat); the Claude Desktop skill is cole-mentor ('Cole'). Kept Kevin on the deck; noted on his   
  *naming decision*
- **F-E8-21** — The deck's mentor seat is 'Kevin' (panel-kevin, kevinChat, 25 'Kevin' lines; 0 'cole-mentor'); the claude.ai Desktop skill is cole-mentor ('Cole … High-Value Man Mentor'). Per §2 t  
  *Naming decision belongs to Steven.*
- **F-E8-43** — subscriptions doc is [] and the card says 'Once the Plaid bridge is linked, the monthly audit fills this'; Plaid has no keys and Composio has no Plaid. actual-budget is installed o  
  *Bank CSV exports (or Plaid production keys) can only be produced by Steven.*
- **F-E8-44** — panel-mind: 'synced from Canvas calendar, 2026-08-28' — a one-time manual sync; uscDeadlines is a hand-kept list (Week 4 Sep 23/27, final Oct 19). R19 USC study planner (cloud, Sun  
  *The Canvas iCal URL must be copied from Steven's USC account.*

## Every finding

| ID | Category | Finding | Pri | Eff | Status | Resolution | Test | Resolved | Owner |
|---|---|---|---|---|---|---|---|---|---|
| F-E1-01 | Stale Content | The Data-freshness card asserted 'Scheduler verified Sep 7, 2026: all 20 cloud routines enabled, and every dashboard feed ran on schedule today.' The live routine listing (pulled 2026-09-22 08:09 UTC) shows 50 routines, 46 enabled, 10 FA... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-13 | Plugin/Integration | The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through Composio'. Follow Up Boss was retired 2026-09-22 in favo... | P1 | M | Broken | Escalated | Pass — repo mirrors of the four task prompts rewritten around Lofty by F-L3-06; the live Mac prompts and LOFTY_API_KEY remain Steven's (keyfile step added by F-V1-02). | 2026-09-22 | Integration Engineer |
| F-E1-14 | Routine | The backup card's copy-prompt targeted ~/Applications/command-deck-backups with a 12-week retention, and its empty state described the weekly task as though it worked. The truth: r6-weekly-backup (Sundays 5:00 AM PT) has NEVER RUN under ... | P1 | S | Resolved | Fixed | Pass — superseded: the cloud backup writer (F-INT-07) took the 2026-09-22 backup; backupStatus lastBackup 2026-09-22, verified true (14:37 UTC export). r6-weekly-backup itself still never ran; whether to disable it is F-E11A-02. Card copy was fixed on 2026-09-22. | 2026-09-22 | Steven |
| F-E1-18 | Routine | The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only because a Claude session filled them by hand - every one of th... | P1 | M | Broken | Escalated | Pending | — | Steven |
| F-E11A-02 | Routine | Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cron 0 5 * * 0 (Sun 5:00 AM PT), has NEVER run under claude-... | P1 | S | Broken | Escalated | Fail — still Steven's: the cloud writer (Sun 11:00 UTC, 8-week prune) now takes the backup; decide whether that schedule and root replace the spec and whether r6 is disabled. | — | Steven |
| F-E11A-03 | Routine | Every skill written this cycle registers a nightly self-test, but nightly-self-test itself is in error — timeout, exit 124, last end 2026-09-15 — and loopLog cycle 3 records that no selfTest doc has ever been confirmed written. Each self... | P1 | M | Broken | Open | Fail | — | Reliability Engineer |
| F-E12-01 | Plugin/Integration | You.com was retired 2026-09-22. All 8 references in the file were in-page live-search paths: 2 callTool sites in the property listing search, 1 in the AI-directed comparable search, 1 in the tax-record search, 1 watchTool subscription, a... | P1 | L | Broken | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-03 | Stale Content | The card was titled 'Real estate - Follow Up Boss (live)' and described a live Composio pull. The FUB API key had been rejecting every call since 2026-09-16 and Steven retired FUB on 2026-09-22, so FUB_SYNC_AT 2026-09-07, FUB_STAGE_TOTAL... | P1 | L | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-04 | Current State | The portal pinned Steven's Follow Up Boss calling number and lead-forwarding email as the numbers to use for every real-estate lead. With FUB retired, whether that number now routes through Lofty cannot be verified from here, and the for... | P1 | S | Broken | Escalated | Pending — same question carried by F-L2-08 and F-L3-12; the portal now tells the ISA to confirm with Steven before using the line. | — | Steven |
| F-E12-05 | Plugin/Integration | Zoho remains the system of record for mortgage, but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (re-verified 2026-09-22 08:17 UTC). Several places on the page implied the ISA could see live Zoho data. | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E12-06 | Bug | take() returned early on !m.id, so any ISA-line message without an id was dropped silently on both sides of the merge. This is the human ISA's only written channel to Steven. | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-07 | Bug | lsSetLocal had an empty catch, so a full or blocked browser store looked exactly like a successful save: the panel re-rendered from the in-memory value, the sync pill read normally, and what the ISA typed was gone on reload. | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-08 | Bug | A document arriving without a {v: ...} wrapper was skipped outright, so it never reached the device and a restore silently lost it. Command Deck writes stravaSnapshot in exactly that shape. | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-10 | Routine | The routine runs four times a day and reports SUCCESS every time, but it has never synced anything: an unattended cloud run cannot write an artifact database - the write parks on a permission prompt. Reading both stores on 2026-09-22 pro... | P1 | M | Resolved | Fixed | Pass — root cause found in the routine's own prompt, which opens "RESEARCH-ONLY MODE" and forbids writing. It compared cdStateSeed blobs, both {}, so equal seeds meant success forever. Replaced by trig_01M5zR1Po44gnHvTwA9ogZaB, which reads and writes the live databases with ArtifactData and verifies by reading back. | 2026-09-22 | CTO Innovator |
| F-E12-11 | Current State | Read live on 2026-09-22: this portal's pipeline document holds 2 mortgage deals [client identifiers withheld by X2 — the source row quoted initial-plus-surname names with loan amounts and stages]. Command Deck's pipeline document is an e... | P1 | S | Resolved | Fixed | Pass — pipeline written to Command Deck (version 4) matching the portal, and a cloud routine now keeps it that way four times a day. | 2026-09-22 | Steven |
| F-E12-12 | Current State | This portal holds 2 real-estate clients [client identifiers withheld by X2 — the source row quoted initial-plus-surname names with roles and stages]. On Command Deck the reClients document does not exist at all - it has never been create... | P1 | S | Resolved | Fixed | Pass — reClients created on Command Deck (version 1) and carried by the same cloud sync routine. | 2026-09-22 | Steven |
| F-E12-13 | Stale Content | The card stated 'The bridge carries changes both ways on the hour, merging by row, so a status you set here shows up on his side.' Verified false: nothing carries showings. The integration table also claimed a green 'Live' status for Ste... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-15 | Routine | The ISA line works, and it is the only thing that crosses: isa-comms-bridge-local on Steven's Mac, hourly 7:37 AM - 9:37 PM PT, last ok 2026-09-21 8:38 PM PT. Both copies of the thread held the same 9 messages on 2026-09-22. The hourly C... | P1 | M | Broken | Escalated | Pass — F-M4-05/06 changed the deck's guidance: re-enabling the hourly cloud bridge is now the recommended move since cloud writes work (F-INT-08); enabling it is a routine change (Steven or a web-UI-created routine). | — | CTO Innovator |
| F-E12-16 | Stale Content | The rate table was a 2026-09-07/09-10 Bankrate and Veterans United snapshot, 12 days old, while Command Deck's ratesSnapshot document (2026-09-22 02:24 UTC, written daily by mortgage-rates-daily) carried fresher Optimal Blue figures. | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-22 | Plugin/Integration | Lofty is the CRM of record from 2026-09-22 but no loftyLeads document has ever been written. The Mac has the lofty-bridge MCP server and lofty-cli; the API key (Lofty -> Settings -> Integrations -> API) and one proving run are outstandin... | P1 | M | Missing | Escalated | Pending — loftyLeads exists in the 14:37 export with status not-configured (syncedAt 2026-09-22T08:45:00Z); still no key. | — | Steven |
| F-E12-23 | Plugin/Integration | The artifact's published capabilities are {"db":{},"mcp":{"servers":[{"server":"You.com","tools":["you-search"]}]},"sample":{}}. No code in the file uses the mcp capability any more, so the declaration grants a retired connector for noth... | P1 | S | Resolved | Fixed | Pass — ISA Portal republished as version 27 on 2026-09-22 with capabilities {db, sample}. The You.com mcp grant is gone and zero call sites remain. | 2026-09-22 | Steven |
| F-E2-01 | Stale Content | The visible strategy tables were a hard-coded 2026-09-07 hand read (6 strategies + 9 stacks) while the live strategySnapshot doc, written 2026-09-16T03:26Z, carried 28 individual strategies with materially different figures (e.g. Q ORB N... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E2-02 | Bug | The deck claimed in its freshness copy that 'the page prefers that document over its baked-in seed' for strategySnapshot. That was false for the visible tables: only the Vanessa/hedge-fund chat-context helpers (marketContextText, dashboa... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E2-04 | Stale Content | The calendar showed five already-released events as pending consensus, including the Sep 15-16 FOMC as 'hike risk live' when the meeting had already delivered a 25bp hike, and retail sales as 'roughly flat to +0.4%' when the actual was +... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E2-06 | Stale Content | An undated paragraph described an Aug 28, 2026 session ('Nasdaq slid 0.52% to 26,402.42 ... September hike odds jumped to 57%'). By 2026-09-22 it was flatly contradicted by the live feeds: the Fed had already hiked on Sep 16, and the Nas... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E2-07 | Bug | All seven agent prompts instructed the model to 'Use the search_market_data tool'. That tool no longer exists: when the in-page search connector was retired on 2026-09-11 the tool was renamed dashboard_market_data, and the prompts were n... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E2-08 | Stale Content | The card said 'Each agent can search the live web for market data, news, and macro context' and 'it gathers data from public web search'. Neither is true of the in-page runner: a published artifact cannot call any external host and the s... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E2-09 | Plugin/Integration | The Remote Run card presented the cloud routine as the primary working path. The live hfRequest doc says otherwise: AAPL, requested 2026-09-11, started 2026-09-13, status failed at 2026-09-13T00:15Z - cloud egress was blocked to every pr... | P1 | M | Broken | Escalated | Fail | 2026-09-22 | Steven |
| F-E2-11 | Bug | The Risk monitor card offered two number inputs and nothing else. It never read the riskMonitor document at all - the deck stores riskDailyLossTriggered and riskAccountsBlown as separate local docs, while r17-trading-day-log writes riskM... | P1 | M | Broken | Improved | Pass | 2026-09-22 | Steven |
| F-E3-02 | Bug | Baseline 2026-09-12 · verified 2026-09-22. 30 of the 50 rows in the 2026 tax calendar are already in the past, but a passed row was only dimmed to 45% opacity and kept its original type badge — so passed EXECUTION WINDOW rows (Jun 15 CA ... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-03 | Bug | Baseline 2026-09-12 · verified 2026-09-22. The payment tracker listed Q1 Apr 15 2026, Q2 Jun 15 2026 and Q3 Sep 15 2026 as plain due dates with no indication they had passed — Q3 went by 7 days ago. A missed estimated payment accrues pen... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-04 | Bug | Baseline 2026-09-12 · verified 2026-09-22. Membership expiry was rendered as a bare editable text box with no status at all, so Enterprise Plus Platinum (stored expiry '2/28/2026', lapsed 206 days ago) looked exactly like a current statu... | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Steven |
| F-E4a-01 | Stale Content | The real-estate CRM card was titled "Real estate — Follow Up Boss (live)" and printed a 6,460-contact stage board from two arrays frozen at the 2026-09-07 hand pull. Steven retired Follow Up Boss for Lofty on 2026-09-22, and FUB's Compos... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-02 | Plugin/Integration | No loftyLeads document exists in the live store (checked against all 161 exported docs, 2026-09-22 08:10 UTC) and no lofty-crm-sync task exists under claude-runner. The Mac has lofty-bridge (toolbox status RUN, `claude mcp` shows server ... | P1 | M | Missing | Escalated | Pending — loftyLeads doc now exists with status not-configured (14:37 export); the key is still missing. | — | Steven |
| F-E4a-03 | Bug | The Zoho card's status badge was a hard-coded red "API blocked" span in static HTML. It would have gone on reading "API blocked" on the day the Zoho permission landed and the board filled with live leads — the single most misleading stat... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-04 | Plugin/Integration | The Composio Zoho connection is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION: Crm_Implied_Api_Access — re-verified 2026-09-22 08:17 UTC against ZOHO_LIST_LEADS and ZOHO_LIST_DEALS. The fix is entirely Zoh... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-E4a-08 | Bug | The freshness registry's "Follow Up Boss import" row read leadTriage.ranAt. Since 2026-09-16 every lead-triage-daily run has failed authentication and written leadTriage with source "unavailable" and null metrics — but it still stamps ra... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E4a-09 | Stale Content | The card claimed "Already connected, live, and proven this session: Zoho CRM and Follow Up Boss (via Composio — FUB fully working...)". FUB has been rejecting authentication since 2026-09-16 and was retired on 2026-09-22, and Zoho has ne... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E4a-10 | Automation Opportunity | Four claude-runner tasks still read Follow Up Boss through Composio and must be re-pointed at Lofty. r2-lead-response-watchdog (cron `10,40 7-19 * * *`, last ran 2026-09-21T20:02:33, writes leadResponse — currently status:failed, "Invali... | P1 | M | Recommended | Open | Pending | — | CTO Innovator |
| F-E4a-14 | Stale Content | After E4a's edits, 37 source lines outside E4a's regions still name Follow Up Boss or FUB — 28 "Follow Up Boss" and 16 "FUB" occurrences. Distribution: panel-aiteam 11, panel-showings 7, panel-easop 7, panel-property 3, panel-masterplan ... | P1 | M | Stale | Open | Pending | — | Vanessa |
| F-E4a-16 | ISA Coverage | routine-health.md records the mortgage system of record as UNMONITORED: every speed-to-lead, lead-triage and KPI job on the Mac reads the real-estate CRM only, so a mortgage lead can sit past the 5-minute standard with nothing watching. ... | P1 | M | Missing | Open | Fail | — | CRO |
| F-E4b-01 | Stale Content | The baked rate seed was 12-15 days old on a licensed MLO's client-facing surface: 30-yr conventional 6.84%, VA 6.125%, FHA 6.48%, jumbo 6.88%, stamped '2026-09-10 - VA rows re-verified today'. The live ratesSnapshot document (syncedAt 20... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E4b-02 | Bug | ratesSnapshot writes yoy as a display string ('+5.7%', '-3.7%'), but applyMarketsDoc fed it straight into marketNum(), which does Number('+5.7%') -> NaN -> null. The year-over-year figure therefore never refreshed once since the merge wa... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E4b-05 | Stale Content | Steven retired Follow Up Boss for Lofty on 2026-09-22. Every Follow Up Boss reference inside E4b's regions was rewritten to Lofty with honest history rather than erased: the real-estate tool quick-link row (now Lofty, with the Composio-h... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E4b-06 | Bug | The leadTriage document records its own failure honestly (source:'unavailable', note: 'Follow Up Boss pull failed at the first call: composio proxy to /v1/people returned Invalid API Key...'), and the page threw all of it away. A failed ... | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E4b-07 | Plugin/Integration | The Showings integrations table listed Follow Up Boss as green / 'Composio connected' and claimed confirmed showings are logged on the client's CRM record by the sync task. That has not been true since 2026-09-16 (FUB auth failures) and ... | P1 | M | Broken | Escalated | Pass | 2026-09-22 | Steven |
| F-E4b-10 | Stale Content | The tax card told the reader 'Claude searches the live web (by address and, if entered, APN) ... prioritizing Zillow/Redfin/PropertyShark ... then combines that with this dashboard's own researched community tax-rate data', and the simil... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E4b-18 | Plugin/Integration | Everything E4b rewrote to say 'Lofty' now depends on a Lofty connection that does not yet write. Composio has no Lofty toolkit; the Mac has lofty-bridge (read-only MCP over Lofty's REST API) and lofty-cli, with the API key expected in ~/... | P1 | L | Missing | Escalated | Pending | 2026-09-22 | Steven |
| F-E4b-19 | ISA Coverage | The ISA measurement loop is broken at every link and the deck previously showed none of it. r11-isa-kpi-compile (Sun 4:40 AM PT) has never run under claude-runner. The isaKpi document it would refresh is from 2026-09-13 and its own notes... | P1 | M | Broken | Escalated | Pass | 2026-09-22 | Victor |
| F-E5-01 | Bug | CONFIRMED shape bug. Every document in collection `state` is stored as {v:...} except stravaSnapshot, whose top-level keys are activities/syncedAt/via. applyRemoteSnapshot() at the sync layer returns early on `if (!data // typeof data !=... | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-02 | Bug | Root cause of F-E5-01 is at the WRITER, and it is outside this deck. Whatever wrote stravaSnapshot on 2026-09-20 (via string: 'claude-code-session (Strava connector, direct read)') set the document body directly instead of {v:{...}} — th... | P1 | S | Broken | Escalated | Pending — writer identified 2026-09-22 as the Mac task strava-daily-sync (F-M5-01, cron 20 5 * * * PT = 12:20 UTC); paste-ready corrected prompt in routines/mac-task-repairs.md §1 (F-W2-01). Only Steven can apply it, before 2026-09-23 12:20 UTC. | — | Integration Engineer |
| F-E5-07 | Stale Content | Card said 'refreshed twice daily by an automated routine' and 'refreshes twice daily'. Neither holds: the Mac task strava-daily-sync has status error with its last run 2026-09-17 (mac-runner-status.md), and the cloud routine 'Command Dec... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E5-08 | Current State | The Apple Health card described a working pipeline ('The R8 sync writes this card's snapshot at 5:10 AM and 9:10 PM'). Truth on 2026-09-22: the ingest daemon (LaunchAgent, port 8765) is not responding; appleHealth's last real ingest is 2... | P1 | S | Broken | Escalated | Pending — decision packet: routines/mac-task-repairs.md §3 (F-W2-03) recommends retiring r8 and using the Notion phone route (F-M6-15). | 2026-09-22 | Steven |
| F-E5-11 | Automation Opportunity | The replacement route for the dead daemon is described on the card as what it is: spec written 2026-09-22, first phone run pending. Claude iOS reads Apple Health on the phone, writes the day's stats into a Notion Health Log database (Not... | P1 | M | Recommended | Open | Pending | — | Steven |
| F-E5-14 | Bug | Two writers, two shapes, and the renderer only knew one. A hand-added idea is {text, status:'Idea'/'Filmed'/'Editing'/'Posted'}; r14-content-pipeline writes {id, topic, body, channel, variants, complianceNotes, status:'awaiting Steven', ... | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-18 | Stale Content | The Automate card claimed '15 recurring cloud routines already run this dashboard ... That's real automation already in place — not aspirational', and listed weeklies that have since broken. Replaced with the 2026-09-22 truth from the li... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E5-21 | Bug | The Elite rewards scan badge rendered a fixed green 'Synced 2026-09-07' — a fifteen-day-old curated scan of card offers, status matches, expiring credits and SUB deadlines presented as fresh. Offers and deadlines are exactly the class of... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E6-06 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Said 'Honest status (Sep 7, 2026)': cloud hourly bridge parked on approval, local 10-min loop as the path. Truth: cloud routine DISABLED (last run 2026-09-09); Mac task isa-comms-bridge-local h... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-07 | ISA Coverage | Baseline 2026-09-12 · verified 2026-09-22 — The ISA has posted nothing on the line since 2026-09-16; r3 keeps requesting the EOD summary; isaScorecard never filled. The bridge is healthy — the gap is human. | P1 | S | Broken | Escalated | Pending — decision packet docs/ISA-SEAT-DECISION.md: pick a COA by Fri 2026-09-25; the escalation ladder routine runs weekdays (F-M5-12). | — | Steven |
| F-E6-10 | Orchestrator Agent | Baseline 2026-09-12 · verified 2026-09-22 — Model tiering per Steven 2026-09-22 added: legend under the chart, Vanessa role/agent text 'Claude Fable 5.1 masterminds', exec group label 'judgment seats on Opus 5', MODEL_BADGE extended with... | P1 | M | New | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-12 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — Added a lane node (role '0 agents of its own' so seat counts stay honest): Lofty (lofty-bridge MCP + lofty-cli, key/first sync pending), Zoho (Composio, 403 NO_PERMISSION), CLI-Anything wrapper... | P1 | S | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E6-13 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — Every Zoho call returns 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC). Only Steven can fix: Zoho CRM → Setup → Security Control → Profiles → connected profile → enabl... | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E6-14 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — lofty MCP shows connected in the 2026-09-16 snapshot, but whether the API key is present in ~/.config/lofty/.env cannot be verified from the cloud; first sync has not run; loftyLeads doc does n... | P1 | S | Missing | Escalated | Pending | — | Steven |
| F-E6-15 | Current State | Baseline 2026-09-12 · verified 2026-09-22 — Added 'Second Brain — five levels, one Vanessa' after the org chart: L1–L5 table (level · what · where · owner · status) in the canonical §3 words, remote/live-access line, ECC-as-gate line; re... | P1 | M | New | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-17 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Rows claimed Composio → Follow Up Boss, GoHighLevel pending, Canva connected, cloud Steve twin/ISA bridge running, Desktop tasks at old times, skills list without this cycle's additions, agents... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E6-20 | Routine | Baseline 2026-09-12 · verified 2026-09-22 — None of the weekly/monthly runner slots that the AI Team panel depends on has ever run under claude-runner (runnerStatus 2026-09-22); their cloud duplicates FAILED Sep 18–20. The panel now says... | P1 | M | Broken | Open | Pending | — | Reliability Engineer |
| F-E7-01 | Bug | A SYNCHRONOUS throw from window.claude.use kills the entire dashboard. `(function initSync(){ ... window.claude.use("db").then(...).catch(...) })()` guards only the PROMISE; the call itself is unguarded, so a throw propagates out of the ... | P1 | S | Resolved | Fixed | Pass — deck edfa24a (2026-09-22 09:17 UTC): window.claude.use('db') wrapped in try/catch and falls back to local-only (command-deck.html ~7577); full sweep 62 tests, 0 failures. | 2026-09-22 | Reliability Engineer |
| F-E7-03 | Bug | stravaSnapshot is the only one of the 161 exported documents with no `v` wrapper (top-level activities/syncedAt/via). applyRemoteSnapshot rejects any doc without `v` (`if (!data // typeof data !== "object" // !("v" in data)) return;`), s... | P1 | S | Resolved | Fixed | Pass — at the document: rewritten as {v:{…}} by F-FR2-14 (state/stravaSnapshot v9, 13:05 UTC), read back wrapped by F-M5-02, F-M6-13, F-W2-01 and in the 14:37 UTC export. The writer still emits the bare shape (F-W2-01, deadline 2026-09-23 12:20 UTC). | 2026-09-22 | Integration Engineer |
| F-E8-01 | Current State | Speed-to-lead and lead triage have been blind since 2026-09-16: leadResponse doc status=failed, staleSince 2026-09-16T02:42:40Z, failedAt 2026-09-22T03:02:14Z ('Invalid API Key or authentication credentials'); leadTriage ranAt 2026-09-21... | P1 | M | Broken | Escalated | Pending — same as F-E1-13: LOFTY_API_KEY into ~/.config/lofty/.env (MAC-SETUP.sh now creates the empty file, F-V1-02), then the four Mac task prompts (F-L3-06). | — | Integration Engineer |
| F-E8-02 | Current State | Composio connection zoho_talite-spike is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC on ZOHO_LIST_LEADS and ZOHO_LIST_DEALS). zohoSync and zohoDeals ... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-E8-03 | Current State | runnerStatus (syncedAt 2026-09-22T04:05:04Z, loggedIn=true): 11 tasks in error (cpi-daily-scan, fabric-deck-sync, health-full-analysis, nightly-self-test exit 124, openrouter-feeds-refresh, r1-morning-brief 'API unreachable' 2026-09-17, ... | P1 | L | Broken | Open | Fail | — | Reliability Engineer |
| F-E8-05 | Current State | backupStatus: last verified backup 2026-09-14 at ~/AI-Ecosystem-Backups/2026-09-14 (7,931 docs, 109,378,368 bytes, integrityCheck pass, restore test 13/13 on 2026-09-15), weeksKept 3, sameDiskOnly true. r6-weekly-backup (Sun 05:00) has n... | P1 | M | Resolved | Fixed | Pass — superseded by the cloud backup writer (F-INT-07); the backup path/cron decision remains F-E11A-02. | 2026-09-22 | Reliability Engineer |
| F-E8-06 | Current State | isaLine (8 messages) contains only Command-Deck-originated messages; the export has no ISA-authored message at all, isaLineRead.isa = 2026-09-13T22:11:56Z is the last time the ISA read the line, isaScorecard is an empty array (never fill... | P1 | M | Broken | Escalated | Pending — same packet as F-E6-07. | — | Steven |
| F-E8-22 | Stale Content | Base deck (commit 5fbe844): 32 lines contain 'Follow Up Boss' and 32 'FUB' (brief counts 35/22 occurrences), 0 contain 'Lofty'. Outside E4a/E4b/E6 regions they include panel-showings ('Contact details stay in Follow Up Boss (the real-est... | P1 | M | Stale | Open | Pending | — | Integration Engineer |
| F-E8-25 | Bug | nightly-self-test timed out (exit 124) at 2026-09-16T03:32Z and has not completed since; the selfTest doc has never existed. loopLog cycle 4 (F-029) made /dashboard-selftest (jsdom) the 'P1-never-a-proposal gate' inside this task, so the... | P1 | M | Broken | Open | Fail | — | Stress Test Engineer |
| F-E8-29 | Bug | stravaSnapshot (syncedAt 2026-09-20T21:03:00Z) is the only doc of 161 without the {v:…} wrapper (top-level activities/syncedAt/via), so applyRemoteSnapshot ignores it and the Strava card renders the baked seed. Recorded here for the audi... | P1 | S | Resolved | Fixed | Pass — same fix as F-E7-03: document v9 wrapped (F-FR2-14); writer fix pending under F-W2-01. | 2026-09-22 | Integration Engineer |
| F-E8-33 | Routine | Trigger: every 30 min 07:10–19:40 PT weekdays (same slots as r2) plus 11:30 PT before the ISA huddle. Action: lofty-bridge MCP → loftyLeads {syncedAt, source:'Lofty via lofty-bridge MCP (Mac)', status, stageTotals, newLeads90d, firstResp... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-34 | Routine | Because an unattended cloud write parks on a permission prompt (§2), the 4x-daily Zoho sync that writes zohoSync/zohoLeads/zohoDeals must run on the Mac runner (07:05, 11:05, 15:05, 19:05 PT); the cloud routine (0 */6 UTC) only performs ... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-35 | Routine | Trigger: cloud, Mondays 15:00 UTC (08:00 PT) after the Sunday 00:00 PT backup slot. Action: read_db backupStatus (reads do not need approval), compare lastBackup and history[-1].integrityCheck against the 8-day / pass thresholds, then fi... | P1 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-36 | Routine | The Composio/FUB key was rejected from 2026-09-16 and surfaced only on 2026-09-22 as a twinQueue decision item. Trigger: cloud, daily 13:30 UTC. Action: read_db leadResponse, leadTriage, zohoSync, loftyLeads, strategySnapshot, calendarSn... | P1 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-38 | Routine | The cloud 'Pipeline Sync' (0 1,7,13,19 UTC) SUCCEEDED every run through 2026-09-22T07:08Z, yet the deck's pipeline doc is [] and reClients does not exist, while the ISA Portal holds real records ('2 loans, $835K; 2 RE clients' — vanessaR... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-41 | Automation Opportunity | The SOP standard is 'under 5 minutes (auto-text within 60 sec)' (panel-property line 413) and kanban kr4 is p1, but the only watchdog (r2) polls every 30 minutes and is broken. Once loftyLeads exists: poll Lofty every 5 minutes during 07... | P1 | M | Recommended | Open | Pending | — | Vanessa |
| F-E8-64 | Orchestrator Agent | vanessaRuns has one entry (2026-09-11, source cloud). The cloud 'Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT)' FAILED 2026-09-18 (its prompt calls write_db, which parks); the Mac vanessa-ops-review (Fri 22:35 PT) ha... | P1 | M | Broken | Open | Fail — the 'write_db parks' explanation is disproved (F-INT-08). F-W2-07 measured this routine dying 5.7 s after firing on 2026-09-18 — a startup failure shared by nine routines, not its prompt. created_via http_api: only Steven can edit it (link in routines/mac-task-repairs.md §7). | — | Vanessa |
| F-E8-65 | Orchestrator Agent | loopLog cycles 4–5 (F-024) proved that scheduled tasks only fire when the app is up; the headless claude-runner now reports loggedIn=true but 20 tasks still have no run and several daily tasks sit 'late'. The toolkit index lists task-wat... | P1 | S | Recommended | Escalated | Pending | — | Reliability Engineer |
| F-E8-66 | Orchestrator Agent | aiTeamRoster.owners.mortgage-pipeline-watchdog (SCALE-05, named 2026-09-13): consolidatedBy cco-alexandra, escalation mortgage-broker-elite — but no Mac task or routine implements it and routineHealth's last row says the Zoho + ARIVE flo... | P1 | M | Missing | Open | Pending | — | Integration Engineer |
| F-E8-68 | ISA Coverage | Present: Steven↔ISA thread (isaLine + isa-comms-bridge-local hourly 07:37–21:37 PT, last ok 2026-09-21 20:38 PT; cloud hourly bridge disabled); Vanessa/Steve drafts on the line (Draft · Vanessa / Draft · Steve buttons); daily playbook (i... | P1 | M | Missing | Open | Fail | — | Vanessa |
| F-E8-72 | ISA Coverage | kanban k1 'Screen & onboard ISA (Executive Assistant) candidates' (p2, backlog, no due date); vanessaRecommendations vr-1757631000000-isa (2026-09-11, pending): 'fill it or reassign the theme-day call load'; feasibilityChecks: 'ISA/EA hi... | P1 | S | Missing | Escalated | Pending — same packet as F-E6-07. | — | Steven |
| F-INT-02 | Routine | Thirteen of fifty cloud routines failed or hung on their last run. Every failure died 5 to 10 seconds after firing, and all of them fall inside two crowded windows: Friday 20:00-23:00 UTC (4 routines, all failed) and Sunday 15:00-17:00 U... | P1 | S | Broken | Fixed | Pending | 2026-09-22 | Reliability Engineer |
| F-INT-03 | Plugin/Integration | The Zoho connection is ACTIVE (Composio account created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION with detail Crm_Implied_Api_Access. Verified today against both ZOHO_LIST_LEADS and ZOHO_LIST_DEALS. The dashboard's Zo... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-INT-04 | Plugin/Integration | Follow Up Boss is retired as the real-estate CRM and replaced by Lofty (Steven's decision, 2026-09-22). Follow Up Boss had in any case been rejecting its API key on every call since 2026-09-16, so the speed-to-lead and lead-triage number... | P1 | M | Missing | Implemented | Pending | 2026-09-22 | Integration Engineer |
| F-INT-05 | Plugin/Integration | Composio disclosed a security incident on 2026-05-21: roughly 5,241 API keys and 5,001 GitHub OAuth tokens exfiltrated through a compromised employee OAuth token. Composio is the path that currently carries Zoho, Gmail, GitHub, Google Ad... | P1 | S | New | Escalated | Pending | — | Steven |
| F-INT-06 | Orchestrator Agent | The ecosystem had no surface showing the machinery that governs it: no master findings table, no stress test report, no scale log, no trust levels, no weekly brief, and no statement of the halt conditions. Every prior cycle's findings li... | P1 | L | Missing | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-INT-07 | Current State | The weekly backup has never run under the Mac's claude-runner. It missed its 2026-09-20 Sunday slot entirely. The last verified backup is 2026-09-14 (7,931 documents, 109 MB, integrity pass, restore test 13 of 13 on 2026-09-15) and reten... | P1 | M | Resolved | Fixed | Pass — a cloud backup routine ran unattended on 2026-09-22 and backed up 170 of 170 Command Deck documents and 13 of 13 ISA Portal documents, verifying doc count, full id coverage and byte-identical spot checks. backupStatus reads GREEN, verified true, consecutiveFailures 0. | 2026-09-22 | Reliability Engineer |
| F-INT-10 | Unlisted Capability | The knowledge stack existed as five separate stores (Notion, the Obsidian vault, Jarvis, Graphify, Ruflo) with a recall order described in prose on the Toolkit panel, but no files a Claude Code session actually loads and no routing rules... | P1 | L | Missing | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-E1-02 | Stale Content | The baked weather seed was 2026-09-07 10:05 AM PDT (Temecula 77F, heat alerts, Hurricane Marie surf alert) while the live weatherSnapshot doc carried 2026-09-21 08:05 PM PDT. Any device without the stored doc saw two-week-old conditions ... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-03 | Stale Content | News seeds were dated 2026-09-07 (5 global headlines, 11 city lists) while newsSnapshot carried 2026-09-21 08:05 PM PDT for the same 11 cities. Re-baked both arrays and the stamp from the live doc, keeping the seed's exact row shape {tit... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-04 | Bug | The 'On this day' card renders entries for the day the feed was WRITTEN but labelled them only with a 'Synced <date>' stamp. With the feed last written 2026-09-20 and the seed dated 2026-09-07, the card showed another calendar day's hist... | P2 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-06 | Stale Content | The market snapshot seed was the Sep 4 close with an asOf line predicting 'a Fed HIKE at the Sep 15-16 FOMC'. The live marketSnapshot doc carries the Sep 18 close, which records that the hike happened (to 3.75-4.00% on Sep 16). Re-baked ... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-07 | Bug | Three places told the user a different weather cadence from the one the Mac runner actually uses. The runner cron is `5 8,20 * * *` (8:05 AM / 8:05 PM PT, twice daily); the page said '5:45 AM / 10:45 PM PT' in the card note, 'Weather + n... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-08 | Bug | Four strings claimed calendar-daily-sync runs three times a day at 6:25 AM / 12:25 PM / 5:25 PM PT. The runner cron is `35 6,17 * * *` - two runs, 6:35 AM and 5:35 PM PT (last ok 2026-09-21 7:29 PM PT). The freshness board already said '... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-09 | Bug | The Output Watch attributed the ratesSnapshot document to r5-rates-market-refresh with a 200h window. r5 has NEVER RUN under the runner (cron `5 5 * * 1`, next slot 2026-09-28). The document is actually written by mortgage-rates-daily (c... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-10 | Bug | knowledgeFabric is written by fabric-deck-sync, which runs every two hours from 7 AM to 9 PM PT, but its staleness window was 200 hours. The same task's other row (runnerStatus) uses 3 hours. An 8-day window on an 8-times-daily task mean... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-11 | Plugin/Integration | Added the two CRM sync documents to the Output Watch per the cycle spec: loftyLeads (lofty-crm-sync, 14h) and zohoSync (zoho-crm-sync cloud 4x daily, 14h). Neither document exists in the 161-doc export, so both render as a red 'Never pro... | P2 | S | Missing | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E1-12 | Stale Content | Every FRESH_FEEDERS entry described its writing task in the present tense as though it ran. Against inventory/mac-runner-status.md nine of them are not running: openrouter-feeds-refresh (error since 2026-09-17, 5 feeds), feeds-weekly (li... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-15 | Stale Content | The Master Plan callout listed the DC trip (Sept 14-17) as 'one week out', the Sep 15-16 FOMC as carrying 'a live hike risk', and the Q3 licensing window as 'about three weeks out'. On 2026-09-22 two of those are in the past and the thir... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-16 | Bug | Some static HTML carries literal backslash-u escape sequences instead of the characters they encode, so the browser prints '\u2014' as text. The Master Plan panel note was one; I replaced it with a real em dash. 17 more lines are affecte... | P2 | S | Broken | Escalated | Pending | 2026-09-22 | Capability Engineer |
| F-E1-19 | Automation Opportunity | feeds-market-close last completed 2026-09-15 and feeds-weekly has been 'limited' since 2026-09-17 although both are enabled with next slots in the past - the runner only executes while the Mac is awake. Meanwhile the cloud routines that ... | P2 | L | Recommended | Open | Pending | — | CTO Innovator |
| F-E1-20 | Current State | The live calendarSnapshot (2026-09-21 19:26 PT) reports two of the nine tracked Google calendars unreadable: the Patriot Pacific work calendar shares free/busy only so no event titles reach the deck, and the SPACE CA agent calendar retur... | P2 | S | Broken | Escalated | Pending | 2026-09-22 | Steven |
| F-E11A-01 | Skill | Nine orchestration skills written as repo skills this cycle: interview-me, prompt-master, skills-refresh, vanessa-orchestrator v2, ai-ecosystem-backup v2, continuous-process-improvement v2, scale-growth-engine, loop-engineering v2, stres... | P2 | M | New | Implemented | Pending | 2026-09-22 | Capability Engineer |
| F-E11A-04 | Orchestrator Agent | The Parallel C-Suite Task Cycle has two competing homes: the Mac task vanessa-ops-review (Fri 10:35 PM PT, enabled, never run) and the cloud routine 'Vanessa orchestrated ops review' (Fri 23:00 UTC, FAILED 2026-09-18), which cannot write... | P2 | S | Recommended | Open | Pending | — | CTO Innovator |
| F-E11A-05 | Current State | Five documents these skills write have no proven shape in the live store: improvementProposals is an empty array (never written), and trustLevels, selfTest, skillsAudit and scaleOpportunityLog do not exist in the 161-doc export. Shapes w... | P2 | S | New | Open | Pending | — | Capability Engineer |
| F-E11A-06 | Skill | The Mac still carries the fub-followups skill (a Follow Up Boss template library) after Follow Up Boss was retired 2026-09-22 in favour of Lofty. skills-refresh flags it as needing a port to Lofty rather than reporting it healthy; deleti... | P2 | M | Stale | Open | Pending — same item as F-L1-05 / F-L3-02: the fub-followups folder rename is a Mac action. | — | Steven |
| F-E12-02 | Bug | The market-update and builder-incentive cards said their headline lists 'refresh automatically'. They were fed by a You.com watch subscription; with the connector gone the promise stayed and the list stayed empty. | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-09 | Bug | A replayed identical snapshot, or one whose local write failed, could report changed and ride the 30-second reload throttle in a loop. | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-17 | Stale Content | The market snapshot was the 2026-09-07 pull with San Diego on the July 2026 period, while the same ratesSnapshot document carried August county figures and a Murrieta market this portal did not track. | P2 | M | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-18 | Stale Content | The note blamed 'the daily cloud routine that used to refresh this was retired after repeated rate limits'. In fact a builder-incentive scan does still run daily - incentives-daily-scan on Steven's Mac, last ok 2026-09-22 - it simply wri... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-20 | Automation Opportunity | A measured isaKpi document (week ending 2026-09-13, written by the r11 task) exists in this portal's store AND on Command Deck, and the two copies are byte-identical. No code on this page reads it: the KPI scorecard shows SOP targets aga... | P2 | M | Missing | Open | Pass | 2026-09-22 | Capability Engineer |
| F-E12-21 | ISA Coverage | The ISA's self-grades and KPI actuals are written to isaGradingScores and isaKpiSopActuals. Neither document exists on the ISA Portal store or on Command Deck - checked both on 2026-09-22. Steven cannot see the ISA's self-assessment at a... | P2 | M | Missing | Escalated | Pending — the carrier now exists: the Pipeline Sync (live) routine syncs isaGradingScores and isaKpiSopActuals both ways (F-M5-12); the decision whether they reach Steven automatically is still open. | — | Steven |
| F-E12-24 | Automation Opportunity | Queued research is written to this portal's vanessaResearch document. The vanessa-research-queue task on the Mac reads Command Deck's store, not this one, so the document alone would never be answered. Every queued item is therefore ALSO... | P2 | M | Recommended | Open | Pass | 2026-09-22 | Integration Engineer |
| F-E2-03 | Routine | r4-quantvue-sync (cron 20 23 * * 1-5) last ended 2026-09-15T23:27:43 and routineHealth marks it late with 3 weekday cycles missed (17th, 18th, 19th), currently sitting in the waiting backlog. The cloud routine that covers the same job re... | P2 | S | Broken | Escalated | Fail | — | Reliability Engineer |
| F-E2-05 | Routine | The Econoday card advertised a healthy 'daily feed task, 5:50 AM PT'. That task is openrouter-feeds-refresh (cron 50 5 * * *), whose last end was 2026-09-17T19:04:11 with status error. The econodayLiveList entry that is actually on the d... | P2 | S | Broken | Escalated | Fail | — | Reliability Engineer |
| F-E2-12 | Stale Content | The sector list appended a hard-coded sentence: '9 of 11 S&P sectors were higher; Materials and Communication Services weren't in this pull - not listed rather than guessed at. As of 4:15pm EDT, Sep 2, 2026.' It is invisible whenever liv... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E2-13 | Current State | The tape is openTerminalSnapshot syncedAt 2026-09-13T22:47:04Z, via 'snapshot.sh (hand-run on the Mac)' - 9 days old at audit time - while openterminal-daemon reports status RUN. There is no baked seed (OPENTERMINAL_SEED_STAMP is null, b... | P2 | S | Stale | Improved | Pass | 2026-09-22 | Integration Engineer |
| F-E2-15 | Stale Content | The four Top-performer tables (stocks, ETFs, dividends, mutual funds) are a 2026-09-07 research pass with Sep 4 session data. They cannot be re-baked from topPerformersLiveList: that feed is an index/mover narrative (checked 2026-09-22),... | P2 | S | Stale | Open | Pending | — | Efficiency Engineer |
| F-E2-16 | Current State | Two wiring claims outside E2's editable regions do not match the evidence. (1) FRESH_FEEDERS says 'The feeds-market-close runner task writes topPerformersLiveList into liveFeeds on weekdays at 10:15 PM' - but feeds-market-close last ende... | P2 | S | Stale | Open | Pending | — | CTO Innovator |
| F-E2-19 | Automation Opportunity | strategySnapshot carries only {name, ytdPct, mtdPct} per strategy. The sheet also has the sim-size column (4x max drawdown) and a BT/fwd P&L column, and a whole diversified-stacks section (Ratio Tiers A-D, Equal Weighted Tiers 1-5) that ... | P2 | M | Missing | Open | Pending | — | Integration Engineer |
| F-E3-01 | Bug | Baseline 2026-09-12 · verified 2026-09-22. Three literal \u2019 escape sequences sat in plain HTML text, so the card rendered "didn\u2019t find a reliable exact estimate" verbatim to Steven instead of a typographic apostrophe. JS-style e... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-05 | Bug | Baseline 2026-09-12 · verified 2026-09-22. A single null or non-object row in the memberships array threw TypeError "Cannot read properties of null (reading 'cat')" at escAttr(m.cat) and killed the whole card. Reproduced against the unto... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-06 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Per brief §2 there are no Plaid API keys, and the 161-doc live export contains no plaidBalances document at all — it has never been written. The status strip nevertheless showed an amber 'Plaid ... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Steven |
| F-E3-07 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. The live subscriptions document is {"v":[]} — empty. Both the card copy and the empty state promised that 'the monthly Plaid audit fills this once the bridge is linked', which implies a running ... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Steven |
| F-E3-08 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. The card opened with 'Auto-generated weekly'. Per brief §2 the cloud routine 'weekly opportunity audit' is in the last-run-FAILED set (Sep 18–20), and the only entry in the log is dated 2026-09-... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-09 | Bug | Baseline 2026-09-12 · verified 2026-09-22. The card told Steven it compared against 'your real ~$2.4M net worth (this dashboard)', but the eligibility test actually used a frozen constant of $2,430,212 while renderGlobalNetWorth computes... | P2 | M | Broken | Fixed | Pass | 2026-09-22 | Efficiency Engineer |
| F-E3-14 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Out of my regions — routing list for the integrator per §7. Two Follow Up Boss references survive in the EA/ISA start-of-day checklist: line 14006 'Review Zoho CRM new mortgage leads … then FUB ... | P2 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E3-16 | Current State | Baseline 2026-09-12 · verified 2026-09-22. All seven beneficiary rows (TSP, Schwab Roth IRA, the Self-Directed Roth IRAs, Principal 401(k), SEP IRA, life insurance, will/trust) have an empty 'verified' date in the live document. The page... | P2 | S | Missing | Open | Pass | — | Steven |
| F-E4a-05 | Routine | §2 of the brief says a cloud routine re-tests Zoho every few hours and writes zohoSync. No zohoSync document exists in the 161-doc export, so either the routine has never run or its artifact-DB write parked on a permission prompt (the kn... | P2 | S | Missing | Improved | Pending — a zohoSync document now exists (status blocked, checkedAt 2026-09-22T08:17:00Z, written by the audit session's own test); no Zoho re-test routine appears in the 2026-09-22 routine listing (F-X2-10), so the 'every few hours' claim has no routine behind it. | — | CTO Innovator |
| F-E4a-06 | Unlisted Capability | The deck had no mortgage-deal view at all: the Zoho card mirrored Leads only, so dollar pipeline, closing dates and deal owners were invisible even though ZOHO_LIST_DEALS is part of the same blocked connection. Added #zhDealsCard — stage... | P2 | M | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-07 | Stale Content | The board said "Moves are saved on this dashboard only — Zoho is not updated until its API access is granted" and "Deck only — it is NOT created in Zoho until API access is granted". Both implied that granting API access would start push... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-11 | Bug | The speed-to-lead empty state hard-codes "reading Follow Up Boss through Composio and writing the leadResponse document", and the card sub-title hard-codes "median time from a Follow Up Boss lead arriving". §4 requires the page to displa... | P2 | S | Broken | Open | Fail | — | Integration Engineer |
| F-E4a-12 | Plugin/Integration | CLI-Anything is installed on the Mac as a Claude Code plugin (toolbox status RUN, commands only, no hooks), but its hub carries no CRM or real-estate entry (README checked 2026-09-22; clianything.cc is egress-blocked from this sandbox), ... | P2 | L | Recommended | Escalated | Pending — install is now scripted (F-S1-18, MAC-SETUP.sh --only cli-anything); generation on the Mac and the ECC review remain Steven's. | — | Steven |
| F-E4b-03 | Stale Content | Six user-visible strings and three code comments credited r5-rates-market-refresh with writing the rates and market figures. Per inventory/routine-health.md r5 has NEVER run under claude-runner (zero execution evidence, next slot Mon 202... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E4b-04 | Stale Content | Two freshness-board entries outside my regions still carry the same wrong attribution fixed in F-E4b-03. OUTPUT_WATCH has {doc:'ratesSnapshot', label:'Rates & market', task:'r5-rates-market-refresh', hrs:200} - the doc is written by mort... | P2 | S | Stale | Open | Pending | 2026-09-22 | Integration Engineer |
| F-E4b-08 | Current State | The isaKpi document is the only place on the deck holding MEASURED ISA numbers, and nothing rendered it. The ISA KPI scorecard card showed SOP targets beside a free-text Actual column typed in by hand, which read like a measured scorecar... | P2 | M | Missing | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E4b-09 | Bug | Both live-search buttons in the Property search strategy tool were You.com-era features whose call sites had already been stripped. They did not fail silently, but they dead-ended: every click printed a refusal and offered nothing. Appli... | P2 | M | Broken | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-E4b-11 | Bug | renderBuilderIncentives wrote the seed's provenance ('Snapshot researched 2026-09-07') into builderIncentiveSyncNote, and orPaintFeed later overwrote that same element with the LIVE feed's stamp. On any synced device the three hand-resea... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Efficiency Engineer |
| F-E4b-14 | Current State | licenseAlerts() is correct (expired, 7, 30 and 60-day tiers all handled and an expired row is labelled 'expired N days ago', not 'due'), but it only fires on rows that carry a date. In the live licenses document every row's due is blank ... | P2 | S | Missing | Escalated | Pass | 2026-09-22 | Steven |
| F-E4b-16 | Current State | Every store behind Practice Trackers and the Showings panel is empty in the 2026-09-22 export: showingSchedule null, showingSyncRequests [], refiWatch [], recruitPipeline [], reviewPipeline [], referralPartners [], webinarFunnel [], deal... | P2 | S | New | Open | Pass | 2026-09-22 | Victor |
| F-E4b-20 | Automation Opportunity | Three rate rows on a licensed MLO's client-facing card are not covered by any feed: VA 30-yr refinance (Veterans United, Sep 9), VA 15-yr fixed (Navy Federal / Veterans United, Sep 2) and Jumbo 15-yr fixed (Bankrate, Sep 2) - 13 to 20 da... | P2 | M | Recommended | Open | Pending | 2026-09-22 | Integration Engineer |
| F-E4b-21 | Stale Content | File-wide inventory after E4b's pass, for whoever owns each region. E4a's cards: 2462-2472 (the Live CRM import card and its ids). E5/E6/E1 panels: 4629 (twin task placeholder), 4744 and 4747 (Derek/Victor AI-team rows), 4983 and 4988 (E... | P2 | M | Stale | Open | Pending | 2026-09-22 | Integration Engineer |
| F-E5-03 | Stale Content | Seed was STRAVA_SYNC_AT="2026-09-07" with 2 activities; the live stravaSnapshot document (syncedAt 2026-09-20T21:03:00Z) is newer and carries 3. Re-baked per brief rule 5.4 from scratchpad/db/state/stravaSnapshot.json, keeping the array-... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-04 | Bug | The 30-day activity count was a hard-coded constant (2). A count relative to 'today' baked into a published file is wrong the day after it is written — as of 2026-09-22 the truth was 3. Now derived at render from the rows' own dates via ... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-05 | Bug | The chart read column 3 of each row as distance and labelled the axis 'mi'. Column 3 is moving time in the live document ('4:05' plotted as 4 miles) and was kcal in the old seed ('494 kcal' plotted as 494 miles, setting the whole axis). ... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-06 | Bug | The table header (Date / Activity / Type / Distance / Moving time) had one more column than the document contract the page itself documents in code ([date, activity, distance, moving time, note]), so every live row was shifted: 'Weight T... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-09 | Bug | The export-age badge was coloured green whenever a last_received string existed, regardless of age — so a nine-day-old export displayed as green 'Last export received 2026-09-13 14:30 UTC'. Now coloured by the age of the data (green unde... | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-12 | Skill | Mentor naming drift, kept per instruction and logged for Steven. The deck's mentor is Kevin (panel-kevin, kevinChat, panel title 'Kevin — High-Value Man Mentor'); the installed Claude Desktop skill is cole-mentor ('Cole'). The card made ... | P2 | S | New | Escalated | Pass | 2026-09-22 | Steven |
| F-E5-15 | Current State | Source disagreement, reported rather than resolved. routineHealth (written by r10-automation-health, 2026-09-22T00:57 PT) states 'marketingQueue last updated 2026-09-15 — 2 drafted posts still awaiting Steven's review'. The exported mark... | P2 | S | New | Open | Pending | — | CTO Innovator |
| F-E5-16 | Stale Content | MARKETING_SYNCED_AT was a hand-typed 2026-09-07 and the note admitted it was unverified. Re-baked to 2026-09-21 against the live cloud-routine listing (pulled 2026-09-22 08:09 UTC): 'Content Calendar Review' SUCCEEDED 2026-09-21 15:06 UT... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-17 | Stale Content | The COA block said 'Synced 2026-09-07 · reviewed weekly', which was true of the schedule and false of the record: the weekly cloud routine that refreshes these COAs FAILED its last run on 2026-09-20 15:07 UTC. The stamp now reads as a la... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-19 | Stale Content | Both notes said 'Claude session research pass (no standing routine)'. A standing routine does exist for each, but it refreshes the LIVE list further down, not the curated set the note sits under: 'Command Deck — Opportunity Radar researc... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-20 | Stale Content | The note correctly said the curated set is seeded and only the live list is refreshed by a task, but did not say that the task is failing: 'Command Deck — Elite Affluent Tracker weekly refresh' FAILED its last run on 2026-09-20 16:09 UTC... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-25 | Stale Content | The Replicate card said 'Brain: live — the steve-twin skill plus this dashboard's state, working today.' The Mac task steve-twin-sweep ran on 2026-09-21 19:27 UTC and was REFUSED mid-run — Bash write access to ~/Shearrill-Vault is not on... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Steven |
| F-E5-27 | Routine | Health-and-fitness automation is the weakest cluster on the runner and none of it is visible from one place. As of 2026-09-22: strava-daily-sync error (last run 2026-09-17), r8-apple-health-snapshot runs and produces nothing (daemon down... | P2 | M | Missing | Open | Pending | — | Integration Engineer |
| F-E6-01 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Reach badge and chat bar said 'Routes to 7 specialists'; the team is 8 executives (incl. CTO Innovator) + 4 mentors, and no model tiering was stated. | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-03 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Card said 'a Claude Code session on the Mac answers it with live web'; the answerer is the vanessa-research-queue task (hourly :30, 7:30–21:30 PT, last ok 2026-09-21 8:31 PM PT) on the Claude s... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-05 | Bug | Baseline 2026-09-12 · verified 2026-09-22 — Hard-coded '12 live MCP servers … 169 agents'; toolkitSnapshot (2026-09-16) says 15 MCP / 172 agents / 60 tasks. | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-08 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Card claimed the cloud twin routine delivers packs by push/Gmail draft and pauses for Approve. Truth: cloud twin DISABLED (abandoned 2026-09-09); steve-twin-sweep runs on the Mac weekdays 12:55... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-09 | Routine | Baseline 2026-09-12 · verified 2026-09-22 — Last run 2026-09-21 was refused its vault step: Bash write to ~/Shearrill-Vault is not on the task allow-list (routineHealth). Queue/brief still wrote. | P2 | S | Broken | Escalated | Pending | — | Steven |
| F-E6-11 | Orchestrator Agent | Baseline 2026-09-12 · verified 2026-09-22 — Wording refreshed: Nadia = outward disruptor, weekly Disruption Brief (replace/upgrade/adopt · ADOPT/PILOT/WATCH/IGNORE), proposal-only, reports to Steven cc Vanessa, hands every item to the CT... | P2 | S | New | Implemented | Pass | 2026-09-22 | CAIO |
| F-E6-16 | Current State | Baseline 2026-09-12 · verified 2026-09-22 — Added 'Model & token discipline': tiering, ≤8 parallel / ≤4 Perplexity per wave, the 5-step recall order, cache TTL 4 h / 24 h, OpenRouter no key, You.com retired. | P2 | S | New | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-18 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Cadences (6:30/12:30/5:30 twin, 11:40 triage, Fri 3/4 PM review/self-update, Mon 7 AM coach, 28th, 1st) replaced with the runner crons and never-run/last-ok status; Steven/Victor/ISA tools → Lo... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E6-19 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Said Fri 4:00 PM desktop task. Truth: runner slot Fri 11:10 PM PT, never run; improvementProposals empty; cloud weekly self-improvement loop FAILED Sep 20. | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-21 | Skill | Baseline 2026-09-12 · verified 2026-09-22 — 'Three more queued, not installed' → interview-me, prompt-master, skills-refresh (plus lofty-crm-sync, zoho-crm-sync, cli-anything-connectors, apple-health-notion, loop-engineering v2, vanessa-... | P2 | S | New | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-E6-22 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — Card said 'Not installed yet' and described the stablyai/orca worktree IDE with an unverified brew command. Truth (toolkitSnapshot): Orca Computer Use v1.4.203 (com.stablyai.orca) installed, st... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E6-25 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Console said '10 min once the bridge runner is installed'; Second Brain said Drive read twice a day; five-level paragraph and token-discipline paragraph predated the canonical §3 wording; Orca ... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-26 | Routine | Baseline 2026-09-12 · verified 2026-09-22 — Last ok 2026-09-15 — no run logged for six daily slots although runnerStatus shows it enabled; the Drive folder it reads holds 0 files. | P2 | S | Broken | Open | Pending | — | Reliability Engineer |
| F-E6-27 | Routine | Baseline 2026-09-12 · verified 2026-09-22 — Never run under the runner; the Graphify graph is from 2026-09-13 (750 nodes / 1,104 edges). L4 is 9 days stale. | P2 | S | Broken | Open | Pending | — | Reliability Engineer |
| F-E7-02 | Bug | `var cites = (d.citations // []).filter(...)` assumes liveFeeds.feeds[x].citations is an array. A feed document whose citations field is an object, a number or a string throws "(d.citations // []).filter is not a function" and safeRun bl... | P2 | S | Resolved | Fixed | Pass — deck 109d9d5 (12:59 UTC): a non-array citations field is replaced with [] at the document boundary and recorded with lsShapeWarn (~22854-22856). | 2026-09-22 | Reliability Engineer |
| F-E7-04 | Bug | renderIsaLine does `wrap.innerHTML = msgs.map(isaLineMsgHtml).join("")` with no display cap. ISA_LINE_MAX (300) is applied ONLY inside isaLineMergeArrays, so any isaLine document written directly by a task — or restored from a larger sto... | P2 | S | Resolved | Fixed | Pass — deck 109d9d5: renderIsaLine renders only the last ISA_LINE_MAX messages and says how many are held back (~26195-26197). | 2026-09-22 | Efficiency Engineer |
| F-E7-05 | Bug | take() returns early on `!m.id`, so any relayed message without an id is discarded with no record anywhere — not a console warning, not SHAPE_MISMATCH, not the Ops Radar. Measured in the concurrency burst: 2 id-less messages sent, 2 drop... | P2 | S | Resolved | Fixed | Pass — deck b63ff97 (08:56 UTC): id-less messages get a deterministic noid-<hash> instead of being dropped (~26096-26100); the same fix as F-E12-06 on the portal. Was never marked in the table. | 2026-09-22 | Reliability Engineer |
| F-E7-06 | Bug | A failing localStorage WRITE is completely invisible. lsSetLocal's catch is empty and LS_UNAVAILABLE is only ever set from a failing READ inside lsGetSeeded, so with setItem throwing the page still rendered all 318 containers, raised 0 c... | P2 | S | Resolved | Fixed | Pass — deck b63ff97: lsSetLocal records LS_WRITE_FAILURES and warns instead of an empty catch (~6979-6985); same fix as F-E12-07. Was never marked in the table. | 2026-09-22 | Reliability Engineer |
| F-E7-09 | Current State | While dbReady is false, any key that already has a queued local write is skipped entirely ("local is newer; it flushes next"). The isaLine branch itself calls syncKeyToDb, so in local-only mode the FIRST isaLine change queues a pending w... | P2 | M | New | Open | Fail | — | Reliability Engineer |
| F-E7-10 | Current State | The four volume payloads together are 5.02 MB — about 1.0x the ~5 MB localStorage budget a browser gives one origin — and the page took 7215 ms to render them against a 1070 ms baseline. Nothing in the page measures its own storage footp... | P2 | M | Resolved | Implemented | Pass — deck 109d9d5: LS_FOOTPRINT_WARN_BYTES (4 MB) + lsFootprintAlerts() (~6997-7012) and the isaLine display cap (F-E7-04); a cap on routineHealth rows was not verified by X2. | 2026-09-22 | Efficiency Engineer |
| F-E7-11 | Current State | 2 of the 26 watched documents do not exist in the 161-document export at all: revenueScan, healthCoaching. Their owning tasks have never written them, so no backup can restore them and the Output-watch board is correct to say "never prod... | P2 | M | Missing | Escalated | Pass | — | Integration Engineer |
| F-E7-12 | Routine | r6-weekly-backup has never run under the runner and missed its 2026-09-20 slot; backupStatus still reports the 2026-09-14 backup. This cycle produced a verified bundle as a rehearsal of Steven's spec: 161 documents plus the deck, 4.71 MB... | P2 | S | Resolved | Fixed | Pass — superseded by the cloud backup writer (F-INT-07): backupStatus lastBackup 2026-09-22, verified true, consecutiveFailures 0. 'Run now' on r6 is no longer required; disabling r6 is the remaining decision (F-E11A-02). | 2026-09-22 | Steven |
| F-E7-13 | Automation Opportunity | The deck has no automated runtime gate. quickcheck.py is static only and cannot see a function that is called but no longer defined — the exact bug that blanked Market Snapshot on 2026-09-03. tests/runtime-harness.js now executes the who... | P2 | S | Recommended | Implemented | Pass | 2026-09-22 | CTO Innovator |
| F-E8-04 | Current State | 50 routines, 46 enabled; research-only by design because an unattended write to the artifact DB parks on a permission prompt (confirmed three times, quoted in the 'weekly improvement loop' prompt). Last run FAILED Sep 18–20 for 10 routin... | P2 | M | Broken | Open | Fail | — | CTO Innovator |
| F-E8-07 | Current State | twinQueue holds 10 items: 5 completed (4 on 2026-09-22T02:24:35Z by steve-twin-sweep), 5 standing pending (recruiting drafts Tue, decision memos monthly, reading digests Thu, USC drafts Sun, client-text drafts daily), 1 p1 needs-steven. ... | P2 | S | Missing | Open | Fail | — | Capability Engineer |
| F-E8-08 | Current State | appleHealth syncedAt 2026-09-13T23:15:59Z (9 days stale); r8-apple-health-snapshot 'RAN BUT PRODUCED NOTHING — ingest daemon on port 8765 not responding'; health-full-analysis error since 2026-09-17; healthInsight (2026-09-13) already fl... | P2 | M | Broken | Escalated | Pending — same as F-E5-08 / F-W2-03 / F-M6-15: one phone run plus the r8 decision. | — | Integration Engineer |
| F-E8-09 | Current State | knowledgeFabric (2026-09-22T04:05:04Z): Second Brain 68 rows, vault 831 notes, Jarvis 1,760 documents, graph 750 nodes / 1,104 edges (knowledgeGraph built 2026-09-13, 69 communities, 397 isolated nodes, 'the Sunday backup never ran'), Ru... | P2 | M | Stale | Open | Pending | — | Capability Engineer |
| F-E8-11 | Current State | agentInbox (2026-09-21): iMessage LIVE (+16193687141 verified, 17 inbound ids handled; morning brief and voice notes delivered Sep 12–15), Discord 'awaiting bot token — channel reserved as #vanessa' with discord_channel_id null (vanessa-... | P2 | S | Broken | Open | Fail | — | Integration Engineer |
| F-E8-12 | Current State | cpiOpportunityLog has 3 entries, all status Proposed (cpi-20260913-01 empty ISA scorecard; cpi-20260914-01 verbatim EOD nudge; cpi-20260922-01 FUB break undetected for 5 days). cpiCycles has 4 (3 Verified, 'Speed-to-lead response time' s... | P2 | M | Stale | Open | Fail | — | Efficiency Engineer |
| F-E8-13 | Current State | scaleOpportunityLog does not exist in the export although the scale-growth-engine skill is listed RUN in the toolkit index. The only Scale artefacts are two owner entries inside aiTeamRoster.owners (SCALE-04 agent-handoff-graph → owner c... | P2 | M | Missing | Open | Fail | — | Efficiency Engineer |
| F-E8-14 | Stale Content | panel-brief says 'Scheduler verified Sep 7, 2026: all 20 cloud routines enabled, and every dashboard feed … ran on schedule today.' Live listing 2026-09-22: 50 routines, 46 enabled, 10 FAILED Sep 18–20, 2 ABANDONED Sep 21. [Baseline 2026... | P2 | S | Stale | Open | Pending | — | Reliability Engineer |
| F-E8-15 | Stale Content | panel-vanessa: 'Routes to 7 specialists' / '7 specialists on call' while the roster shows 8 executives (Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon) plus 4 mentors (Apex, James, Kevin, Maxwell); Discord row reads 'Live — ... | P2 | S | Stale | Open | Pending | — | Capability Engineer |
| F-E8-16 | Stale Content | panel-easop: 'Already connected, live, and proven this session: Zoho CRM and Follow Up Boss (via Composio — FUB fully working …)' and 'The lead-triage-daily desktop task (11:40 AM, Mon–Fri …) reads Follow Up Boss'. Facts: FUB auth has fa... | P2 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E8-18 | Stale Content | kanbanCards recurring rows disagree with mac-runner-status.md: kr2 'vanessa-sweep, 5:35 AM / 12:35 / 5:35' (cron 35 12 * * 1-5 = once, 12:35); kr3 'steve-twin-sweep, 6:40 AM / 12:40 / 5:40' (cron 55 12 * * 1-5 = once, 12:55); kr5 'lead-t... | P2 | S | Stale | Open | Pending | — | Reliability Engineer |
| F-E8-20 | Stale Content | panel-wellness: 'The R8 sync writes this card's snapshot at 5:10 AM and 9:10 PM' and 'Scheduled full analysis — daily 5:25 AM, from the Mac'. r8 writes nothing (daemon down since 2026-09-13) and health-full-analysis has been in error sin... | P2 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E8-23 | Bug | Four OUTPUT_WATCH rows watch a doc that the named task does not write: {isaScorecard ← r11-isa-kpi-compile} (r11 writes isaKpi; isaScorecard is the ISA's own input, so this row can never go green), {cpiCycles ← cpi-daily-scan} (the task ... | P2 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E8-24 | Bug | routineHealth: r13 'RAN BUT PRODUCED NOTHING — doc apptPrep has never existed in either store; every logged run reports no meeting, writing nothing'. calendarSnapshot (2026-09-21) and twinQueue tw_1790043875002 show real meetings inside ... | P2 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E8-26 | Bug | r3 posts 'EOD summary not in yet — send it here when you get a minute…' verbatim with no check for a reply and no escalation: isaLine ids cd-r3-20260913053530, cd-r3-20260915022515, cd-r3-1789440369, cd-r3-1789526872 (two on 2026-09-15 w... | P2 | S | Broken | Open | Fail | — | Efficiency Engineer |
| F-E8-27 | Bug | r17's description: 'Asks for the day's daily-loss-limit triggers and account status, then computes drawdown…' — a headless runner task cannot receive an answer, so riskMonitor.days carries 'not recorded' (Sep 12, 14, 15) and 'awaiting en... | P2 | M | Broken | Open | Fail | — | Efficiency Engineer |
| F-E8-30 | Bug | Books Reconciliation Reminder, Ops Issue Review and Project Risk Review (all FAILED 2026-09-18) are boilerplate prompts that read a vault at /home/claude/vault (Finance/Books/, Ops/Issues/, Projects/, _memory/Business.md) which does not ... | P2 | S | Broken | Open | Pending | — | CTO Innovator |
| F-E8-31 | Routine | cloud-routines.json: every routine, including 'Command Deck — Weather daily refresh', is granted 8–11 connectors (Canva, Slack, You_com, Strava, Eromify, Notion, Claude_Code_Remote, Gmail, Context7, Google_Calendar, Composio); only 'Stra... | P2 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-32 | Routine | Candidates grounded in cloud-routines.md: Steve twin cloud (disabled, ABANDONED 2026-09-09 — superseded by steve-twin-sweep), ISA comms bridge hourly (disabled — superseded by isa-comms-bridge-local), Weekly Review (disabled, retired), R... | P2 | S | Recommended | Open | Pending | — | CTO Innovator |
| F-E8-37 | Routine | Replace the verbatim nudge in r3 with: 16:30 PT — if no ISA-authored isaLine message since 12:00 PT, send one nudge; second consecutive miss — mark Urgent and push to Steven via vanessa-significant-alerts; third — create a twinQueue need... | P2 | S | Recommended | Open | Pending | — | Vanessa |
| F-E8-39 | Routine | Never run under the runner (runnerStatus lastEnd null): automation-audit-weekly (Sat 03:40), loop-engineering-weekly (Sat 04:30), r9 (Sun 04:00), r11 (Sun 04:40), r6 (Sun 05:00), revenue-scan-weekly (05:40), ops-knowledge-graph (05:45), ... | P2 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-40 | Routine | Three producers overlap: r1-morning-brief (Mac 05:30, error since 2026-09-17 'API unreachable'), vanessa-morning-brief-text (Mac 06:40, limited since 2026-09-16), and the cloud 'Morning Brief' + 'Command Deck Brief' routines (14:00 / 13:... | P2 | S | Recommended | Open | Pending | — | Vanessa |
| F-E8-45 | Automation Opportunity | licenseTracker: 2022 Toyota Sienna registration expires 2026-09-27 (5 days), NMLS 2026-12-31, California CCW 2027-01-31; six rows have blank expiry (Clear, Arizona CCW, Lincoln registration, NAUI/PADI, Patriot Pacific advisor). vanessa-s... | P2 | S | Recommended | Open | Pending | — | Vanessa |
| F-E8-49 | Automation Opportunity | r4-quantvue-sync already reads the live QuantVue Google Sheet (strategySnapshot 2026-09-16, flags for strategies under −4% MTD) but r17 interviews a human (F-E8-27). Action: r17 computes the 6–10% high-water-mark drawdown from the same s... | P2 | M | Recommended | Open | Pending | — | Efficiency Engineer |
| F-E8-50 | Automation Opportunity | secondBrain: 54 of 70 rows are still 'Inbox' (15 Active); brain-weekly-verify (the Sunday review gate) last ran 2026-09-14 and brain-learn-daily last ran 2026-09-15. Trigger: Sunday 16:00 (existing slot); action: group Inbox rows by type... | P2 | S | Recommended | Open | Pending | — | Capability Engineer |
| F-E8-51 | AI Clone | L3 (owns end-to-end, grounded in tasks that run ok): answer the research queue (vanessa-research-queue hourly 07:30–21:30 PT, ok), refresh feeds (weather-news-refresh, mortgage-rates-daily, incentives-daily-scan, calendar-daily-sync — al... | P2 | M | Recommended | Open | Pending | — | Vanessa |
| F-E8-52 | AI Clone | steve-twin-sweep (weekdays 12:55 PT) last status 'refused: Bash (write access to ~/Shearrill-Vault) — vault step (B2) incomplete; circuit breaker open until 2026-09-22T01:27Z'; the cloud Steve twin routine is disabled/ABANDONED since 202... | P2 | S | Broken | Escalated | Fail | — | Integration Engineer |
| F-E8-54 | Skill | The AI employee skill toolkit card says the three are 'queued this cycle, not installed yet'. This cycle E11a writes interview-me and prompt-master as repo skills (SCRATCH/repo-out/.claude/skills/) and skills-refresh exists as the Sunday... | P2 | S | Missing | Open | Pending | — | Capability Engineer |
| F-E8-55 | Skill | toolkit index: fub-followups — 'Rewritten client follow-up library for Follow Up Boss — texts, emails, VA/military sequences, cadences + audit of the 393 inherited templates'. With FUB retired the library's send/merge fields target the w... | P2 | M | Recommended | Open | Pending | — | Capability Engineer |
| F-E8-56 | Skill | scale-growth-engine is listed RUN in the toolkit index but scaleOpportunityLog has never been written; loop-engineering is not present as a skill and loop-engineering-weekly (Sat 04:30) has never run; loopLog's five entries (cycles 1–5, ... | P2 | M | Missing | Open | Pending | — | CTO Innovator |
| F-E8-57 | Skill | dashboard-selftest (jsdom) is the toolkit's only runtime regression check and the task that runs it times out (F-E8-25). E7 builds SCRATCH/tests/runtime-harness.js (pure Node, no jsdom) this cycle. Recommend the harness becomes the skill... | P2 | S | Recommended | Open | Pending | — | Stress Test Engineer |
| F-E8-58 | Plugin/Integration | toolkit index (2026-09-16): 'cli-anything (HKUDS, MIT) Claude Code plugin … generates agent-friendly CLIs … Commands only, no hooks' is already installed on the Mac; the hub has no CRM or real-estate entries (README checked 2026-09-22). ... | P2 | L | Recommended | Open | Pending — see F-S1-07/F-S1-18: install scripted, generation manual; DOMShell risk (F-S1-06) and Alexandra's terms gate (F-FR5b-11) precede any wrapper. | — | Integration Engineer |
| F-E8-59 | Plugin/Integration | Composio connected apps: api_ninjas, discord, follow_up_boss, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho. Follow Up Boss is retired 2026-09-22 but its connection still says ACTIVE with a ... | P2 | S | Recommended | Escalated | Pending — same as F-E4a-13 / F-L3-07. | — | Integration Engineer |
| F-E8-60 | Plugin/Integration | toolkit index: 'claude-auto: Claude subscription first; when its limit is hit, Claude Code runs on FREE providers via OmniRoute (loopback :20128, combo free-only) with a client-data guard hook'; 'free-claude-code … routing the official C... | P2 | S | Recommended | Open | Fail — replacement launcher written (F-FR5b-05/06) but its PII gate fails open on argument order, default and name matching (F-V2-07..09); do not close until the widened canary (F-V2-20) passes on the Mac. | — | Integration Engineer |
| F-E8-61 | Plugin/Integration | toolkit index on the same Mac that holds Zoho/Lofty client data and the ops vault: watermarks-remover ('installed as Claude plugin w/ auto-clean PostToolUse hook + LaunchAgent service'), heretic ('automatic censorship removal for transfo... | P2 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-67 | Orchestrator Agent | escalation-recovery-agent (tier 2, Vanessa) 'handles the file that has gone wrong — a blown closing date, a denied loan…'; loop-operator (Nadia) 'intervenes safely when loops stall'; reliability-engineer 'owns uptime and error-rate reduc... | P2 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-69 | ISA Coverage | isaLineRead.isa = 2026-09-13T22:11:56Z — the ISA has not opened the line in 9 days, while the bridge 'pushes a phone notification for anything new from the ISA' (to Steven only). The Portal has no push to the ISA; Inkbox SMS is not provi... | P2 | S | Missing | Open | Fail | — | Vanessa |
| F-E8-70 | ISA Coverage | isaScorecard is [] (deck says 'Due 4:10 PM each shift day'); isaKpi metric 'ISA self-report vs FUB delta' = 'no self-report on file'; r11-isa-kpi-compile (Sun 04:40) never ran under the runner; OUTPUT_WATCH wires isaScorecard to r11 (F-E... | P2 | S | Missing | Open | Fail | — | Capability Engineer |
| F-E8-71 | ISA Coverage | Standing twin task tw_1788922006_standing_client_texts drafts 'the follow-up, confirmation, check-in or review-request text the ISA sends under her own name … no rate or payment or eligibility language'; the marketing calendar states 'Al... | P2 | S | Missing | Open | Pending | — | Vanessa |
| F-E8-73 | Unlisted Capability | Fresh-session cloud routines can end with a push and/or email notification (create_trigger notifications {push,email}); none of the 50 routines' outputs are delivered anywhere today, and the deck's copy assumes cloud routines are useless... | P2 | S | Recommended | Open | Pending | — | CTO Innovator |
| F-INT-08 | Current State | Every prior cycle concluded that an unattended cloud routine cannot write the artifact database because the write parks on a permission prompt. The conclusion was never re-tested after the platform changed, yet the whole architecture res... | P2 | S | Resolved | Implemented | PASS — the one-shot probe routine fired unattended at 2026-09-22 09:05 UTC and the cloudWriteProbe document exists at version 1, updatedAt 09:05:56Z, with result "write succeeded unattended". No permission prompt, no human present. The five-cycle assumption is false: a cloud routine CAN write this artifact database. | 2026-09-22 | Integration Engineer |
| F-INT-09 | Skill | Three skills had been listed on the dashboard as queued since 2026-09-07 and never built: interview-me, prompt-master and skills-refresh. The orchestration, backup, improvement, scale, loop and stress-test skills existed only as prose in... | P2 | L | Missing | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-E1-05 | Stale Content | The Bears tracker still showed preseason state ('2-1 (preseason) - regular season opens Sun Sep 13', 'Regular season not yet started (NFC North 0-0-0)', a Sep 7 injury report) and its stat tile was labelled '2025 record'. The liveFeeds b... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-17 | Stale Content | The referral blueprint and webinar marketing stack still named Follow Up Boss as the CRM. Steven replaced Follow Up Boss with Lofty on 2026-09-22. These are plan text rather than a number sourced from FUB, so the lines now name Lofty and... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E1-21 | Current State | Reviewed the whole panel for stale claims as assigned. It carries no dated assertions, no capability claims and no references to retired systems: every tracker renders from its own document (dmaicProjects, kaizenBoard, downtimeFound, cpi... | P3 | S | New | Open | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-14 | Stale Content | The panel stamp tooltip still claimed the sync-status panel 'updates automatically via the twice-daily drift check'. No drift check has ever run. | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-19 | Stale Content | Program facts are dated 2026-09-07 and nothing refreshes them. No newer live document exists on either store, so the seed was left alone per the re-bake rule. | P3 | S | Stale | Open | Pass | 2026-09-22 | Capability Engineer |
| F-E12-25 | Bug | quickcheck.py reports three failures on this file that were all present at the base commit: a duplicate-id hit on the JS template string "' + id + '", an unbalanced <div> count of open 1 / close 0, and a called-but-undefined list of 145 ... | P3 | S | New | Open | Pass | 2026-09-22 | Stress Test Engineer |
| F-E2-10 | Stale Content | The committee memo card is still the 2026-09-07 AAPL run (ranAt 2026-09-07T20:50:00-07:00). No later run has written a memo - the only attempt since failed on 2026-09-13. The card's own badges stamp the run date honestly, but the surroun... | P3 | S | Stale | Improved | Pass | 2026-09-22 | Vanessa |
| F-E2-14 | Automation Opportunity | The Mac task openterminal-remote-queue (cron 45 6-21 * * *, last end 2026-09-21T20:45:44, status ok) already works the deck's queue hourly, but the panel never named it, so a queued lookup looked like it needed Steven to go and ask. Sepa... | P3 | S | Recommended | Improved | Pass | 2026-09-22 | Integration Engineer |
| F-E2-17 | Current State | Verification, no change needed. There is no You.com call site, credit, button or you-* tool name anywhere in panel-apex, panel-quantvue, panel-hedgefund, panel-openterminal or the JS E2 owns. The file's only four You.com mentions are at ... | P3 | S | New | Open | Pass | 2026-09-22 | Vanessa |
| F-E2-18 | Skill | The Apex card says the dedicated apex-trader skill 'exists but hasn't reliably stayed installed on Desktop', which is why vanessa-broker carries Apex's persona as a fallback. The skill is present in this session's skill roster. The brief... | P3 | S | New | Open | Pending | — | Steven |
| F-E3-10 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned: the licence & credential tracker already sorts by expiry and flags EXPIRED in red for any past date, red ≤30 days, amber ≤90 days, green beyond. Against today no row is expi... | P3 | S | New | Improved | Pass | 2026-09-22 | Steven |
| F-E3-11 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned and left unchanged: the VA table is stamped 'Effective Dec 1, 2025 (2.8% COLA)' and its 100%-plus-SMC-K figure ($4,078.45/mo, $48,941.40/yr) reconciles exactly with the Milit... | P3 | S | New | Improved | Pass | 2026-09-22 | Capability Engineer |
| F-E3-12 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned, NOT edited (panel-aiteam belongs to E6). openrouterCredits reads {state:'no_key', ok:false, checkedAt 2026-09-16} and councilPricing carries a real 2026-09-16 price table fo... | P3 | S | New | Open | Pass | — | Steven |
| F-E3-13 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Out of my regions — routing to the integrator. The chamber & association table prints its third column as raw text ('Active', 'Expires 2028-08', 'Renews 2027-07-06', 'Renews 2027-07-04') with no... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E3-15 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Out of my regions — routing to the integrator. The DMAIC Define-phase note for 'Speed-to-lead response time' reads 'needs a real timestamp-to-first-contact metric pulled from FUB/Zoho before thi... | P3 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E3-17 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Ownership overlap flagged, deliberately NOT edited. The Top performers card is physically inside panel-personalaccounts (my HTML region) but its data is TOP_PERFORMERS / liveFeeds.topPerformersL... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E4a-13 | Current State | Composio still lists follow_up_boss among the twelve connected apps and reports it ACTIVE, even though its credentials have been rejected since 2026-09-16 and the product is retired as of 2026-09-22. Composio has no Lofty toolkit at all ... | P3 | S | Recommended | Open | Pending — the inventory row was removed from integrations/CONNECTIONS.md by F-L3-07; the connection and key are still Steven's to delete/revoke. | — | Steven |
| F-E4a-15 | Current State | Per the editing rules the ids fubSyncNote, fubStageStats, fubNewCount, fubNewLeadRows and the identifiers FUB_SYNC_AT, FUB_STAGE_TOTALS, FUB_NEW_LEADS_90D were kept rather than renamed; they now live inside the collapsed retired-history ... | P3 | S | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E4b-12 | Stale Content | builderIncentiveLiveList is stamped 2026-09-22T07:58:23Z but its own source field says 'Web research (WebSearch/WebFetch) -- Perplexity MCP connection failed (CONNECT_TIMEOUT), Sep 22, 2026' - i.e. a Claude session wrote it, not the feed... | P3 | S | Stale | Open | Pending | 2026-09-22 | Integration Engineer |
| F-E4b-13 | Current State | Verified by parsing the array literals before and after this cycle's edits: LOAN_PROGRAMS = 39 entries, LENDER_DIRECTORY = 61 entries, both unchanged. The card subs that advertise '39 programs' and '61 approved lenders' are therefore sti... | P3 | S | New | Improved | Pass | 2026-09-22 | Stress Test Engineer |
| F-E4b-15 | Bug | COUNTY_BY_CITY values already end in 'County' ('Riverside County'), and the handler appended another one, producing 'Riverside County County assessor'. Pre-existing; inherited into the new copy and fixed in both places on the way through. | P3 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E4b-17 | Current State | Per the brief, MARKET_SYNCED_AT was treated as reference and the seed values were left alone (Redfin's July 2026 period is still the latest published for Temecula/Murrieta). With the yoy bug fixed (F-E4b-02) the live document now fully o... | P3 | S | New | Open | Pass | 2026-09-22 | Integration Engineer |
| F-E5-10 | Stale Content | The note said 'N metrics, N nights of sleep, N workouts in the last 14 days', which reads as the 14 days ending today. It is the 14-day window that ended when the snapshot was taken. Now names that end date and appends 'this snapshot is ... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-13 | Stale Content | The Kevin avatar SVG drew the letter 'C' (Cole) on a card titled Kevin; changed to 'K' (the gradient id kevinAvatarGrad is unchanged). Residual Cole/kevin-mentor naming outside E5's regions, for the integrator to route: the HTML comment ... | P3 | S | Stale | Improved | Pass | 2026-09-22 | Capability Engineer |
| F-E5-22 | Current State | Verified as asked: the passed-event logic is correct and needed no change. Extracted travelEndDate/travelStatus and ran them under Node against the real seed strings. 'Sep 19, 2026, 8:00 PM' -> passed, 'Sep 18, 2026, 6:30 PM' -> passed, ... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-23 | Current State | Verified, no re-bake needed: USC_DEADLINES_DEFAULT is byte-for-byte the same nine rows as the live uscDeadlines document, including Week 4 Discussion 2026-09-23, Week 4 Assignment & Participation 2026-09-27 and the Week 8 Final Assessmen... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E5-24 | Current State | Verified, no change needed. grantPipeline is genuinely live: the page reads the document through lsGetSeeded and the baked default is identical to the exported document (PenFed Foundation — Military Heroes Program 'Researching partnershi... | P3 | S | New | Improved | Pass | 2026-09-22 | Stress Test Engineer |
| F-E5-26 | Current State | Swept all twelve E5 panels and every E5 JS block for You.com call sites, you-* tool names and You.com credit per the brief's retirement rule. Result: none. The only You.com string inside an E5 region is a code comment in ahRefreshFromMac... | P3 | S | New | Improved | Pass | 2026-09-22 | Integration Engineer |
| F-E6-02 | Current State | Baseline 2026-09-12 · verified 2026-09-22 — Table lacked the Inkbox task names/last-poll stamps and the two §3 remote paths (Vanessa Live, Local Bridge queue). | P3 | S | Missing | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-04 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — The live doc's own note (written by the task) says the queue runs 6:20 AM / 12:20 PM / 5:20 PM; the runner cron is hourly 7:30–21:30 PT. Page text corrected; the doc note is the task's to fix. | P3 | S | Stale | Open | Pending | — | Reliability Engineer |
| F-E6-23 | Unlisted Capability | Baseline 2026-09-12 · verified 2026-09-22 — An executor seat under Elon for API-less sites (homes.com, SkySlope, zipForms) using Orca Computer Use or CLI-Anything DOMShell — proposal only, L1, needs CTO Innovator feasibility + Elena's re... | P3 | L | Recommended | Open | Pending | — | CTO Innovator |
| F-E6-24 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — '~113 agents' → 172 (roster 2026-09-16); '37 scheduled tasks' → 60. | P3 | S | Stale | Fixed | Pass | 2026-09-22 | CAIO |
| F-E6-28 | Bug | Baseline 2026-09-12 · verified 2026-09-22 — Credited the fabric snapshot to ops-knowledge-graph; the writer is fabric-deck-sync (doc source field). | P3 | S | Broken | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-29 | Bug | Baseline 2026-09-12 · verified 2026-09-22 — Four HTML text nodes in my regions rendered a literal backslash-u2014 instead of an em dash (lines 1360, 1364, 4587, 4591 of the base). Fixed in-region; 14 more remain elsewhere in body markup ... | P3 | S | Broken | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-30 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Deck mentor is 'Kevin' (panel-kevin, kevinChat); the Claude Desktop skill is cole-mentor ('Cole'). Kept Kevin on the deck; noted on his org-chart seat. Rename the skill or the seat — Steven's c... | P3 | S | Stale | Escalated | Pending | — | Steven |
| F-E6-31 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Badges said 'Opus researches'; seat detail said seven executives. | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E7-07 | Bug | 6 element ids are looked up by the script and exist nowhere in the 25,595-line pinned baseline (git 5fbe844): vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so no... | P3 | M | Missing | Improved | Fail — deck 109d9d5 added the isaPbTracker/isaPbVip markup (4368-4369) and removed the two voice toggles (25132); vanessaMicBtn and steveMicBtn are still looked up (25136-25137) and absent — the harness still reports 2 missing ids after the W1 merge (F-FR5b-14). | — | Capability Engineer |
| F-E7-08 | Bug | renderTravelPage reads $("travelVisibleCount") at html:17776, one line before renderTravelFilters() (html:17778) creates that span at html:17719. On the first paint the element does not exist yet, the `if (cnt)` guard swallows it, and th... | P3 | S | Resolved | Fixed | Pass — deck 109d9d5: renderTravelFilters() now runs before the travelVisibleCount read (~19051-19052). | 2026-09-22 | Reliability Engineer |
| F-E7-14 | Bug | renderPanelStamps is the single slowest render on a clean baseline (44 ms of a 1070 ms page) and it is re-run on a 400 ms debounce after EVERY recordSectionEdit, i.e. after every keystroke-driven save. Under the routineHealth volume payl... | P3 | M | New | Open | Fail | — | Efficiency Engineer |
| F-E7-15 | Current State | The harness runs the script under a DOM shim, not a browser. It proves: the script reaches its last line, which container ids receive innerHTML, which $() targets are missing, which renderers throw and on which document shape, and how lo... | P3 | S | New | Implemented | Pass | 2026-09-22 | Stress Test Engineer |
| F-E8-10 | Current State | aiTeamRoster (2026-09-16): 172 agents — tier 1: 17, tier 2: 96, tier 3: 59 (60 with no lead, by-name only); models opus 93 / sonnet 78 / fable 1 (vanessa-orchestrator); dispatch rules maxParallel 8, maxPerplexityPerWave 4, hardCap 12. Le... | P3 | S | New | Open | Pass | — | Vanessa |
| F-E8-17 | Stale Content | panel-aiteam: Local Bridge copy says '12 live MCP servers … the 169 agents' (toolkitSnapshot 2026-09-16 counts: mcpServers 15, agents 172, tasks 60); Orca card says 'Not installed yet … brew install --cask stablyai/orca/orca' although th... | P3 | S | Stale | Open | Pending | — | Capability Engineer |
| F-E8-19 | Stale Content | panel-nextmoves lists '15 recurring cloud routines already run this dashboard … weekly Six Sigma process review, weekly self-improvement loop, weekly Elite Affluent Tracker' as 'real automation already in place'. On 2026-09-22 the weekly... | P3 | S | Stale | Open | Pending | — | Efficiency Engineer |
| F-E8-21 | Stale Content | The deck's mentor seat is 'Kevin' (panel-kevin, kevinChat, 25 'Kevin' lines; 0 'cole-mentor'); the claude.ai Desktop skill is cole-mentor ('Cole … High-Value Man Mentor'). Per §2 the deck keeps Kevin and the drift is Steven's call. [Base... | P3 | S | Stale | Escalated | Pending | — | Steven |
| F-E8-28 | Bug | r7 reports lastStatus 'ok' (2026-09-15) while the Plaid bridge has no API keys ('quietly writes nothing until Steven…', FRESH_FEEDERS) and plaidBalances has never existed. routineHealth marks it 'late'; OUTPUT_WATCH has no plaidBalances ... | P3 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E8-42 | Automation Opportunity | twinQueue tw_1790043875002 shows the twin scanning Slack '#lo-scenario-help and DMs from the last ~30 hours' by hand on 2026-09-21; r12-inbox-triage (ok, window 'is:unread newer_than:1d', counts skip 1) covers Gmail only. Slack is a conn... | P3 | S | Recommended | Open | Pending | — | Efficiency Engineer |
| F-E8-43 | Automation Opportunity | subscriptions doc is [] and the card says 'Once the Plaid bridge is linked, the monthly audit fills this'; Plaid has no keys and Composio has no Plaid. actual-budget is installed on the Mac (status RUN, 'no free automatic bank sync — imp... | P3 | M | Recommended | Escalated | Pending | — | Steven |
| F-E8-44 | Automation Opportunity | panel-mind: 'synced from Canvas calendar, 2026-08-28' — a one-time manual sync; uscDeadlines is a hand-kept list (Week 4 Sep 23/27, final Oct 19). R19 USC study planner (cloud, Sunday) SUCCEEDED 2026-09-21 and the twin's standing 'USC dr... | P3 | S | Recommended | Escalated | Pending | — | Steven |
| F-E8-46 | Automation Opportunity | showing-sync runs 3x daily Mon–Sat (08:15/12:15/16:15 PT) and every recorded run found an empty queue (showingSyncRequests [], showingSchedule null; twinQueue tw_1790043875000 'no client showings are currently tracked'). Trigger: local-b... | P3 | S | Recommended | Open | Pending | — | Efficiency Engineer |
| F-E8-47 | Automation Opportunity | marketingQueue holds item content-2026-09-13-va-myths with status 'awaiting Steven' since 2026-09-13 (routineHealth: '2 drafted posts still awaiting Steven's review'); r14 has been in error since 2026-09-17. The cloud 'Weekly content edi... | P3 | S | Recommended | Open | Pending | — | Vanessa |
| F-E8-48 | Automation Opportunity | grantPipeline has 3 rows (PenFed Foundation, California GrantWatch, Grants.gov) with amount 0 and blank deadlines; plan1yr flags the first real grant may need two years of Form 990s. nonprofit-grants-lead and nonprofit-grant-writer agent... | P3 | S | Recommended | Open | Pending | — | Vanessa |
| F-E8-53 | AI Clone | panel-aiteam/nextmoves: 'Outbound voice agent (phone) … Would need Retell AI or Bland AI + Steven's own account — Not started'. Voice/video/image clones are live (8 clips each, Magica). California requires a bot to identify itself; an AI... | P3 | L | Recommended | Open | Pending | — | CAIO |
| F-E8-62 | Plugin/Integration | agentInbox: email is 'jasmine@inkboxmail.com (Inkbox identity, NOT Steven's address)' — the deck already warns 'wrong for clients'; iMessage inbound questions were addressed to 'Jasmine' once ('Jasmine what are conventional rates'); SMS ... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-63 | Plugin/Integration | Ground truth: Canva needs_reconnect; Microsoft 365 not connected while panel-tools links seven OneNote notebooks via OneDrive web; Plaid has no keys and no Composio toolkit; Health Data Avatar, BlackRock Advisor Center and PlayMCP (conne... | P3 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E8-74 | Unlisted Capability | toolkit index: health-export-mcp ('Zero-dep Apple Health MCP for the MetricBridge iOS app (iCloud folder)'), apple-health-xml-mcp ('Momentum … over export.xml; empty until an export is imported'), apple-health-parser and healthai — all p... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-75 | Unlisted Capability | toolkit index: apination-bridge ('MCP bridge to API Nation: trigger workflows, read pushed webhook events into a local inbox', RUN, MCP connected), n8n v2.39.0 built from source on :5678, langflow on :7860. Reasoning: Lofty and Zoho supp... | P3 | M | Recommended | Open | Pending | — | CTO Innovator |
| F-E8-76 | Unlisted Capability | toolkit index: quill ('Local meeting recorder: mic and system audio as two tracks … on-device'), whisper (installed via uv), parrot dictation. r13 pushes a pre-meeting brief; nothing captures the meeting afterwards. Reasoning: a post-mee... | P3 | M | Recommended | Open | Pending | — | Capability Engineer |
| F-E8-77 | Unlisted Capability | The Local Bridge (read-only, allow-listed; localBridgeQueue proved lb1–lb4 on 2026-09-12 and refused a prompt-injection verb lb5) exposes backup, mcp, tasks, health, jarvis-ask, obsidian-note and graph-explain. panel-opsradar's 'Copy bac... | P3 | S | Recommended | Open | Pending | — | Efficiency Engineer |
| F-INT-01 | Bug | The published file closes itself three times: </body></html> appears three times at the end of the document. Harmless in a browser, but it means an earlier edit appended rather than replaced, and any tool that reads to the first </html> ... | P3 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |

## Before and after, for every remediated row

**F-E1-01 — Stale Content**  
Before: Scheduler verified Sep 7, 2026: all 20 cloud routines enabled, and every dashboard feed (weather, news, morning brief, drift check) ran on schedule today.  
After: Scheduler verified Sep 22, 2026: 46 of 50 cloud routines are enabled, 10 of them FAILED their last run (Sep 18-20) and 2 more were ABANDONED Sep 21; the daily feed routines did succeed on schedule. Per-routine detail is in Ops Radar - this row list is not the whole scheduler.  

**F-E1-13 — Plugin/Integration**  
Before: 'median time from a Follow Up Boss lead arriving ... Filled by the lead-response watchdog'  
After: 'median time from a Lofty lead arriving ... Lofty replaced Follow Up Boss on 2026-09-22 ... Filled by r2-lead-response-watchdog once it is re-pointed at Lofty - it has been logging "Invalid API Key" against Follow Up Boss since 2026-09-16.'  

**F-E1-14 — Routine**  
Before: copy-prompt: '~/Applications/command-deck-backups/YYYY-MM-DD/, keep the last 12 weeks'; card showed 'Last backup 2026-09-14 / 3 wk' with no mention that the scheduled task has never run  
After: copy-prompt carries the full spec; card appends 'written by a Claude session. The scheduled owner r6-weekly-backup (Sundays 5:00 AM PT) has NEVER RUN under the runner and missed its 2026-09-20 slot ... Same-disk copy only - no off-device replica.'  

**F-E1-18 — Routine**  
Before: Page presented these as 'written by the daily feed task at 5:50 AM PT'  
After: Page names the task, its error state and the fact that recent fills came from Claude sessions; the underlying task is unfixed  

**F-E11A-02 — Routine**  
Before: last verified backup 2026-09-14 (7,931 docs, 109 MB, integrity pass, restore test 13/13 on 2026-09-15), weeksKept 3, task never run  
After: ai-ecosystem-backup v2 specifies the canonical root, 8-week prune, integrity check, single retry and two-failure escalation; cron re-point to 0 0 * * 0 and the root move are Steven's call  

**F-E11A-03 — Routine**  
Before: nightly-self-test error (timeout) since 2026-09-15; no selfTest doc in the 161-doc export  
After: self-test suite categories, per-test budget and the selfTest doc shape specified; the timeout fix is a Reliability Engineer task  

**F-E12-01 — Plugin/Integration**  
Before: Three buttons called mcp.callTool('You.com','you-search'); a fourth path opened a 6-hourly watchTool subscription. With the connector retired the calls reject and the lists stay empty under live-data copy.  
After: wireLivePropertySearch, renderAiFitRecommendation and wireLiveNewsList removed. The three buttons now read 'Queue research (answered by Vanessa)', 'Queue a comparable-property search' and 'Queue a tax-record lookup'; each writes an item to the vanessaResearch document and posts a #research message on the ISA line. The two watch-driven feeds carry plain text naming the task that actually refreshes them.  

**F-E12-03 — Stale Content**  
Before: 'Synced 2026-09-07 - 6,460 total contacts in FUB - same live pull as Command Deck'.  
After: New live card reads the loftyLeads document with an explicit 'Awaiting first Lofty sync' state that never borrows the FUB numbers; handles not-configured / error / ok and renders stage totals, 90-day leads and speed-to-lead. The FUB numbers are kept in a collapsed block labelled 'Last Follow Up Boss import - 2026-09-07 (retired, kept as history)' and were not relabelled.  

**F-E12-04 — Current State**  
Before: 'Use it for every real-estate lead call and text so the activity logs in FUB.'  
After: Both tiles amber-flagged with the retirement date and an instruction to confirm the Lofty calling number and forwarding address with Steven before use.  

**F-E12-05 — Plugin/Integration**  
Before: Zoho card mentioned the error but the KPI card, the SOP checklist and the personas still implied live Zoho visibility.  
After: Zoho card rewritten with the verified date, an explicit 'there is no live Zoho data anywhere on this portal', and the exact fix path. The KPI card, the start-of-day checklist, the capacity-audit row and both AI personas now say the API is blocked.  

**F-E12-06 — Bug**  
Before: Unit test against the base commit: merging a 1-message array with a 2-message array containing the same id-less message returned 1 message - one was lost with nothing logged.  
After: An id-less message gets a deterministic id hashed from ts|from|text, so identical relays still collapse to one row and a genuinely new message survives; lsShapeWarn records it. Same test now returns 2 messages and 2 distinct id-less messages stay distinct.  

**F-E12-07 — Bug**  
Before: Unit test with a localStorage whose setItem throws QuotaExceededError: the write silently vanished and nothing was recorded.  
After: lsSetLocal returns true/false, records every failure in LS_WRITE_FAILURES, and renderIsaStateWarnings surfaces the list in the Sync status panel naming the keys that were not saved. Verified: returns false and records {key:'pipeline', error:'QuotaExceededError'}.  

**F-E12-08 — Bug**  
Before: Unit test against the base commit: a no-v document left the local store completely empty - the document was lost with nothing logged.  
After: The whole document is accepted as the value and lsShapeWarn records the shape so the writer gets fixed. Verified: the document is now stored and one shape warning is recorded.  

**F-E12-10 — Routine**  
Before: No mention on the page; the routine's green tick was the only signal anyone had.  
After: A replacement routine that actually writes. The old one is created via the web interface so an agent cannot disable it; Steven must turn it off.  

**F-E12-11 — Current State**  
Before: The page implied pipeline edits reached Command Deck.  
After: trig_01M5zR1Po44gnHvTwA9ogZaB syncs pipeline both directions on the live databases, merges rather than overwrites, and verifies by reading back.  

**F-E12-12 — Current State**  
Before: The page implied client-stage changes reached Command Deck.  
After: Same routine as F-E12-11. The document now exists on both stores instead of only on the portal.  

**F-E12-13 — Stale Content**  
Before: Green 'Live' badge and hourly two-way sync copy.  
After: Card says the schedule stays in this portal's store, that the claim was never true, and to post anything Steven needs on the ISA line. The Command Deck integration row is now a red 'Not synced' with what would be required.  

**F-E12-15 — Routine**  
Before: The page said messages crossed 'every 10 minutes while his Claude Code loop is on, hourly by cloud routine once he has approved its write'.  
After: Every bridge string now names the Mac task, its hours, the Mac-awake condition and the disabled cloud routine, and tells the ISA to call or text when a message has not turned green.  

**F-E12-16 — Stale Content**  
Before: Conventional 30 6.84%/6.90 APR, VA 30 6.125%, FHA 30 6.48%, Jumbo 30 6.88%, no USDA row.  
After: Re-baked from the document: Conventional 30 7.038, Conventional 15 6.257, VA 30 6.751, FHA 30 6.799, USDA 30 6.71 (new), Jumbo 30 7.032, all Sep 18 Optimal Blue via FRED, plus 4 benchmark rows (PMMS 30 6.95, PMMS 15 6.26, 10-yr Treasury 5.01, MND top-tier 7.19). APR shows '-' on re-baked rows because the document publishes no APR and an APR from a different pull must not sit beside a new rate. Three rows the document lacks (VA 30-yr refinance, VA 15-yr fixed, Jumbo 15-yr fixed) are kept at their  

**F-E12-22 — Plugin/Integration**  
Before: No Lofty support on the page at all.  
After: The card reads loftyLeads and states exactly this while it is absent, telling the ISA to work real-estate leads in Lofty itself rather than from this page.  

**F-E12-23 — Plugin/Integration**  
Before: mcp/You.com declared and used by 6 call sites.  
After: The published declaration now matches what the page actually uses.  

**F-E2-01 — Stale Content**  
Before: STRATEGY_SYNCED_AT "2026-09-07"; STRATEGIES = 6 rows with size/ytd/month/pnl from a hand read; the doc was never read by the tables.  
After: STRATEGY_SYNCED_AT "2026-09-16 (03:26 UTC ...)"; STRATEGIES = the doc's 28 rows; renderStrategyTables() prefers lsGet('strategySnapshot'); Sim size and BT/fwd P&L render an em dash because the sync carries percentages only.  

**F-E2-02 — Bug**  
Before: buildRows(STRATEGIES,'strategyRows') called once at module scope with no document read.  
After: renderStrategyTables() reads the doc, falls back to the seed, recomputes MAX_YTD, and is wrapped in safeRun. Verified in a Node shim against the live doc, an empty store and a malformed doc - no throws.  

**F-E2-04 — Stale Content**  
Before: 8 rows, ECONODAY_SYNCED_AT '2026-09-07'; FOMC remaining list still contained 'Sep 15-16'.  
After: 15 rows, 8 marked RELEASED with actuals (FOMC 12-0 to 3.75-4.00%, retail sales +1.2%, starts -2.6%, claims 196K, UMich 47.8); ECONODAY_FOMC_REMAINING_2026 = Oct 27-28, Dec 8-9, with the Sep hike stated in the note. Release clock times left as an em dash on new rows rather than assumed.  

**F-E2-06 — Stale Content**  
Before: Undated Aug 28 copy with Aug 27/28 Yahoo and CNBC links.  
After: Stamped Sep 21 close baked in, and renderSessionRead() replaces it with liveFeeds.topPerformersLiveList's own text, citations and checkedAt when a feed has reached the device.  

**F-E2-07 — Bug**  
Before: 5 prompt sites referencing search_market_data; the only declared tool is dashboard_market_data.  
After: All 5 renamed; the Market Scout prompt also now states that the tool returns only this dashboard's documents and that anything missing must be written 'NOT AVAILABLE - verify manually'.  

**F-E2-08 — Stale Content**  
Before: Blanket claim of live web search for every agent.  
After: Separates the Mac path (real web + filings) from the in-page path (this deck's documents plus what Steven pastes); the 'Run the committee' card says the paste is the only outside fact the in-page committee gets.  

**F-E2-09 — Plugin/Integration**  
Before: '1 - From here: ... A cloud routine picks up the pending request, runs all seven roles with primary-source verification, writes the memo back here, and pushes a notification.'  
After: The Mac path is listed first as the one that works; the cloud path carries a red 'Known broken' badge with the exact 2026-09-13 failure, the blocked hosts, and the fact that the Sep 21 SUCCEEDED run wrote no memo. hfReqStatus now tells a failed request to re-run on the Mac.  

**F-E2-11 — Bug**  
Before: Two unexplained inputs; riskMonitor orphaned; no statement anywhere that the daily log had stopped.  
After: A new riskMonitorNote reads the doc and states: the boxes are hand-entered, r17-trading-day-log last ran 2026-09-17 and errored, the doc carries 0 accounts and 0 recorded daily-loss figures, plus the last three session rows. Renders safely with the doc absent or malformed.  

**F-E3-02 — Bug**  
Before: days<0 rows dimmed only; badgeCls = row[3]==="EXECUTION WINDOW" ? "amber" : "gray"; no passed label.  
After: passed rows carry a gray 'passed' chip in the Date cell and their type badge is forced gray. Runtime check: 50 rows render, 30 marked passed, 0 passed rows retain an amber badge, 'Upcoming only' still yields 20.  

**F-E3-03 — Bug**  
Before: quarters = [["Q1","Apr 15, 2026"],…]; tdDue.textContent = q[1];  
After: each quarter carries an ISO date; the Due cell shows a gray 'passed' chip when the date is behind today and an amber 'Nd left' chip inside 30 days. No amounts, inputs or stored qetPaid values touched.  

**F-E3-04 — Bug**  
Before: Enterprise Plus · expires '2/28/2026' · no badge, no note, indistinguishable from 'Annual'.  
After: new membershipExpiryNote() reads the free-text expiry through extractIsoDate: past → red EXPIRED + 'lapsed Feb 28, 2026 · 206 days ago'; ≤90 days → amber 'Nd left'; else green 'current through <date>'; unparseable ('Annual', 'TBD', 'Card-tied', '—') → nothing. Updates live as the field is edited. Runtime: 32 rows, 1 EXPIRED, 3 current.  

**F-E4a-01 — Stale Content**  
Before: Card title "Real estate — Follow Up Boss (live)"; "Pulled by hand Sep 7 ... 6,460 total contacts" presented as the current real-estate pipeline.  
After: Card title "Live CRM import — Lofty (real estate)", gray "Awaiting first sync" badge, explicit awaiting-first-sync paragraph naming lofty-bridge/lofty-cli and the pending API key; FUB numbers survive only inside a collapsed retired block.  

**F-E4a-02 — Plugin/Integration**  
Before: No Lofty path on the page at all; the real-estate pipeline was FUB-only.  
After: Card + copy-prompt button render the honest not-configured state and hand Steven the exact prompt to run the first sync from a Claude session on the Mac.  

**F-E4a-03 — Bug**  
Before: <span class="badge red" id="zhApiBadge">API blocked</span> — static, unconditional.  
After: Badge class and text derived from zohoSync.status; new #zhBlockedNote carries the error and the Zoho-side fix path. Verified across ok / blocked / absent / null / [] / {} / string / wrong-typed doc states.  

**F-E4a-04 — Plugin/Integration**  
Before: Failure described only in a static tooltip and a card-sub paragraph; no document, no re-test, no visible recovery path.  
After: Badge, #zhBlockedNote and the connectivity card all carry the exact error and the exact fix; a copy-prompt button runs the sync and writes zohoSync the moment the permission lands.  

**F-E4a-08 — Bug**  
Before: Failed FUB runs stamped the freshness board as a successful import via leadTriage.ranAt; the row was dated 2026-09-07 from FUB_SYNC_AT.  
After: Row is "Lofty CRM import", tracks loftyLeads.syncedAt, and flags as never-refreshed while no document exists.  

**F-E4a-09 — Stale Content**  
Before: "FUB fully working"; no mention of Lofty, CLI-Anything, Orca, the Canva/M365/PlayMCP gaps or You.com's retirement.  
After: Eight fact-checked bullets plus three data-copy prompt buttons (run the Lofty sync, run the Zoho sync, install CLI-Anything wrappers).  

**F-E4a-10 — Automation Opportunity**  
Before: Four tasks pointed at a retired, auth-failing CRM; two of them failing silently into honest-but-empty documents.  
After: Rewiring list handed to Derek's automation-engineer with crons, doc keys, last-run state and the required source strings (see E4a-report.md §4).  

**F-E4a-14 — Stale Content**  
Before: 42 "Follow Up Boss" and 32 "FUB" raw matches file-wide before E4a's edits; 4 of the FUB matches are incidental substrings inside base64 media blobs (lines 845, 6678, 22971, 22982) and must not be touched.  
After: E4a's own regions are clean; the remaining 37 lines are routed with line number, panel/construct and owning engineer (E1, E4b or E6).  

**F-E4a-16 — ISA Coverage**  
Before: No monitoring on the mortgage pipeline; no deck surface showing that the gap exists.  
After: The new Zoho deals table plus the dynamic zohoSync badge make the gap visible; the watchdog itself is blocked on the Zoho permission.  

**F-E4b-01 — Stale Content**  
Before: MORTGAGE_RATES_SYNCED_AT = '2026-09-10 - VA rows re-verified today...'; Conventional 30-yr 6.84% / VA 30-yr 6.125% / FHA 6.48% / Jumbo 7-yr 6.88%; 8 rows, no USDA.  
After: MORTGAGE_RATES_SYNCED_AT = '2026-09-22 02:24 UTC - 6 of 9 rows re-baked from ratesSnapshot (mortgage-rates-daily; Optimal Blue via FRED, index date Sep 18, 2026)...'; Conventional 30-yr 7.038% / 15-yr 6.257% / VA 30-yr 6.751% / FHA 6.799% / USDA 6.71% / Jumbo 7.032%; 9 rows. Node harness against the real doc: 6 live, 3 seed, no duplicate USDA row.  

**F-E4b-02 — Bug**  
Before: San Diego priceChangeYoy 2.4 (Sep 7 seed) with a 2026-09-22 stamp above it; liveFields never contained priceChangeYoy.  
After: San Diego 961,781 / DOM 28 / +5.7% / 3 months supply, all four in liveFields; Temecula +2.0%; Murrieta -3.7%. Verified by running the real merge under Node against db/state/ratesSnapshot.json.  

**F-E4b-05 — Stale Content**  
Before: 12 'Follow Up Boss'/'FUB' strings in E4b's regions presented FUB as the current, working real-estate system of record.  
After: Lofty named as system of record since 2026-09-22 everywhere, with 'Follow Up Boss until then' kept wherever a number or a saved link came from FUB. Remaining FUB strings in E4b's regions are history statements or JS identifiers only.  

**F-E4b-06 — Bug**  
Before: badge 'ran 2026-09-21T18:33:00Z' class 'badge green'; four zero tiles; lt.note never rendered; copy claimed a working FUB read at 11:40 AM.  
After: badge 'run failed 2026-09-21T18:33:00Z' class 'badge red'; the doc's own failure note printed above the (empty) sections; copy dated at 11:33 AM with the auth failure and the Lofty dependency. Verified under Node against db/state/leadTriage.json.  

**F-E4b-07 — Plugin/Integration**  
Before: 'Follow Up Boss ... green / Composio connected ... Verified on the first sync run'; queue rows read 'targets: gcal, fub'.  
After: 'Lofty (was Follow Up Boss until 2026-09-22) ... red / Not connected - Lofty sync pending'; queue rows read 'targets: Google Calendar, CRM (not writing - Lofty re-point pending)'.  

**F-E4b-10 — Stale Content**  
Before: 'Claude searches the live web ... prioritizing Zillow/Redfin/PropertyShark ... to compute a rate and $ estimate for a buyer at that price.'  
After: 'Nothing on this page searches the web either: an artifact has no outbound network path at all, and the You.com connection this card used to lean on was retired on 2026-09-22. What the button does instead is real: ...'  

**F-E4b-18 — Plugin/Integration**  
Before: Follow Up Boss named as connected and working.  
After: Lofty named with 'API key + first sync still pending' / 'Not connected - Lofty sync pending' wherever the connection is claimed.  

**F-E4b-19 — ISA Coverage**  
Before: No measured ISA figure appeared anywhere on the deck.  
After: The measured figures and their caveats are on the card, under a note naming r11 as never-run and isaScorecard as empty.  

**F-E5-01 — Bug**  
Before: lsGet("stravaSnapshot") returned the raw doc; code required __sd.activities at the top level, and applyRemoteSnapshot never stored it at all — card always rendered the baked 2026-09-07 seed.  
After: stravaDoc() unwraps either shape; card renders the live document the moment it arrives by any route (corrected writer, restore, or a later engine fix).  

**F-E5-02 — Bug**  
Before: stravaSnapshot stored as {activities,syncedAt,via} — dropped by the sync engine.  
After: Reader now tolerates it; the writer still produces a shape the engine rejects, so cross-device sync of this doc is still broken.  

**F-E5-07 — Stale Content**  
Before: 'Pulled directly from your connected Strava account, refreshed twice daily by an automated routine.'  
After: Names the failing task, the research-only cloud routine, and states that the figures carry the date they were actually read.  

**F-E5-08 — Current State**  
Before: Card read as a live pipeline; tiles looked populated with no indication they were nine days old.  
After: Card opens with 'This pipeline is down as of 2026-09-22', names the daemon, the Sep 13 last ingest and the writes-nothing r8 run; the sync note now names the window end date and the snapshot's age in days.  

**F-E5-11 — Automation Opportunity**  
Before: Card described only the broken Health Auto Export chain.  
After: Card carries the replacement route, explicitly labelled as a plan and not a feed, with the daily phone loop written out.  

**F-E5-14 — Bug**  
Before: One queue row reading '—' with a dropdown silently showing 'Idea'.  
After: Row reads 'VA Loan Myths That Stop Veterans From Buying a Home · awaiting Steven · multi (social/blog, LinkedIn, short-form video) · drafted 2026-09-13', with the full draft and Alexandra's compliance verdict one click away.  

**F-E5-18 — Stale Content**  
Before: '15 recurring cloud routines already run this dashboard ... not aspirational.'  
After: 50/46 enabled, the daily cadence named as working, the ten Sep 18-20 failures and two abandonments named, and the research-only constraint stated.  

**F-E5-21 — Bug**  
Before: green 'Synced 2026-09-07'.  
After: red 'Last full scan 2026-09-07 · 15d ago' plus an explicit unconfirmed warning.  

**F-E6-06 — Stale Content**  
Before: Sep 7 text + 'needs a one-time approval' bullet  
After: Sep 22 text; bullet 'disabled since 2026-09-09'  

**F-E6-07 — ISA Coverage**  
Before: last ISA message 2026-09-16  
After: page states it plainly; needs Steven to raise it with the ISA  

**F-E6-10 — Orchestrator Agent**  
Before: badges only when aiTeamRoster present; no Perplexity marker  
After: Node smoke test: tree renders 124 nodes, 59 Opus / 50 Sonnet / 3 Perplexity badges, fallback fable/opus with roster absent, no throws  

**F-E6-12 — Plugin/Integration**  
Before: no connector lane on the chart  
After: lane rendered under Derek (smoke test confirms), agent 'integration-engineer · lofty-crm-sync · zoho-crm-sync · cli-anything-connectors'  

**F-E6-13 — Plugin/Integration**  
Before: API blocked  
After: stated on the chart lane and toolbox; zoho-crm-sync fills zohoLeads/zohoDeals once granted  

**F-E6-14 — Plugin/Integration**  
Before: no loftyLeads doc  
After: chart/toolbox say 'API key + first sync pending'; needs Steven: Lofty Settings → Integrations → API, then run lofty-crm-sync once  

**F-E6-15 — Current State**  
Before: five-level mapping existed only as a paragraph on the Toolkit tab  
After: card renders: 68 rows · 831 notes / 1,760 docs · 238 entries / 750 nodes · 1,104 edges; L5 '3 of 7 last ran ok'  

**F-E6-17 — Stale Content**  
Before: Sep 7-era rows  
After: Connectors (Zoho blocked, Lofty via Mac, FUB + You.com retired, Canva needs reconnect, not-connected list), 15 MCP servers, runner tasks with never-run/error honesty, cloud routines 46/50 with disabled/failed/abandoned lists, skills (Mac-present vs written-this-cycle), agents (172, tiers, models, leads, Orca executor as proposal), surfaces  

**F-E6-20 — Routine**  
Before: cards implied they run  
After: cards say never run  

**F-E7-01 — Bug**  
Before: window.claude.use("db").then(function (api) { ... }).catch(function () { setSyncStatus("Local only (this device)", "off"); });  
After: try { window.claude.use("db").then(...).catch(...); } catch (e) { setSyncStatus("Local only (this device)", "off"); }  

**F-E7-03 — Bug**  
Before: db doc stravaSnapshot = {activities, syncedAt, via}  → skipped by applyRemoteSnapshot; 160/161 docs restore  
After: either the writing task wraps it as {v:{...}}, or the page accepts both shapes on read (lsGet fallback) — E5 owns the page-side half of this  

**F-E8-01 — Current State**  
Before: r2-lead-response-watchdog (every 30 min 7–19 PT) and lead-triage-daily (11:33 PT) both read FUB via Composio and both fail; the Mac's lofty-bridge MCP shows connected but its API key cannot be verified from the cloud.  
After: E4a rebuilds the card on loftyLeads; E11b specs lofty-crm-sync; r2 / lead-triage-daily / r11 / showing-sync must be re-pointed to Lofty (see F-E8-33).  

**F-E8-02 — Current State**  
Before: Zoho board = manual paste; 'Deck only — NOT created in Zoho' copy; no speed-to-lead or KPI job touches Zoho.  
After: Zoho profile gets 'Zoho CRM API Access'; zoho-crm-sync writes zohoSync/zohoLeads/zohoDeals 4x daily; Zoho watchdog under Alexandra/Victor (F-E8-66).  

**F-E8-03 — Current State**  
Before: Deck copy in several panels still describes these tasks as running on schedule.  
After: Reliability Engineer owns a task-by-task recovery list; every panel that names a task shows 'last ok <date>' or 'failed <date>: <reason>' (editing rule §5.5).  

**F-E8-05 — Current State**  
Before: 8 days without a verified backup; retention 3 weeks; single disk.  
After: ai-ecosystem-backup v2 (E11a) at Documents/AI-Ecosystem-Backups/YYYY-MM-DD, Sunday 00:00, 8 weeks, plus the cloud backup watchdog (F-E8-35).  

**F-E8-06 — Current State**  
Before: Every ISA-facing automation (r2, r3, r11, coach-weekly-recs, showing-sync hand-offs) assumes a working ISA who reads and replies; none of them detects that she does not.  
After: Escalation ladder on the nudge (F-E8-37); ISA-side notification (F-E8-69); Steven decides whether the seat is filled, reassigned or paused (F-E8-72).  

**F-E8-22 — Stale Content**  
Before: The retired CRM is still the named system of record in eight panels and six Mac tasks.  
After: Every occurrence becomes Lofty with honest history ('was Follow Up Boss until 2026-09-22'); Mac task prompts and the two agents re-pointed (F-E8-33); the FUB calling number's fate is a Steven decision (port to Lofty or keep).  

**F-E8-25 — Bug**  
Before: Regression gate absent; the deck's in-page self-check only runs in a browser.  
After: E7's pure-Node runtime-harness.js becomes the fast gate (no jsdom, sub-minute) and nightly-self-test calls it with a 10-minute timeout; selfTest doc written on every run.  

**F-E8-29 — Bug**  
Before: Live Strava data never reaches the card.  
After: Page accepts both shapes (E5); writer emits {v:{…}} (Integration Engineer).  

**F-E8-33 — Routine**  
Before: Four Mac tasks and two agents (lead-triage-analyst, mktg-analytics-lead) still name Follow Up Boss.  
After: One doc, one writer, four readers; OUTPUT_WATCH row {loftyLeads, 'Lofty CRM import', lofty-crm-sync, 14 h}.  

**F-E8-34 — Routine**  
Before: No task touches Zoho; the deck's mortgage board is a Sep 14 paste.  
After: zohoSync doc drives the card badge (E4a); zohoDeals table live; mortgage pipeline monitored (F-E8-66).  

**F-E8-35 — Routine**  
Before: A missed backup is only discovered by reading the Ops Radar card.  
After: Backup silence becomes a phone notification within 8 hours of the missed slot.  

**F-E8-36 — Routine**  
Before: Five days of silent breakage.  
After: ≤24 h detection, two independent paths (cloud notification, Mac iMessage).  

**F-E8-38 — Routine**  
Before: Steven's dashboard does not show his real pipeline; post-close ticklers (twinQueue tw_1790043875001) cannot run.  
After: One Mac writer at 07:25/13:25/19:25 PT; cloud routine kept as the 2x/day drift auditor.  

**F-E8-41 — Automation Opportunity**  
Before: 30-minute poll against a 5-minute SLA; drafts never produced because FUB was unreadable.  
After: 5-minute detection during the shift; draft-in-bell inside 3 minutes; median first-response measured daily.  

**F-E8-64 — Orchestrator Agent**  
Before: The one weekly synthesis Steven is supposed to read on Friday 16:30 has happened once.  
After: Mac task runs Fri 15:30 PT (inside the ISA/runner window) with ≤8 parallel sub-agents, ≤4 Perplexity per wave; success = vanessaRuns entry + twinQueue decisions every Friday; cloud routine disabled.  

**F-E8-65 — Orchestrator Agent**  
Before: The watchdog that would catch a stalled runner is not installed.  
After: LaunchAgent installed; watchdog.json mirrored into runnerStatus by fabric-deck-sync; Ops Radar shows 'runner heartbeat <n> min ago'.  

**F-E8-66 — Orchestrator Agent**  
Before: Named owner, zero coverage.  
After: zoho-crm-sync (F-E8-34) + a weekly 'mortgage-desk-weekly' pass (Sun 06:05, never run) that reads zohoDeals for stale stages and TRID clocks (trid-timeline-checker).  

**F-E8-68 — ISA Coverage**  
Before: Six of the intended hand-off/monitoring/QA layers have no evidence of working.  
After: Table 8 of E8-report.md; each missing layer mapped to a task with a success criterion.  

**F-E8-72 — ISA Coverage**  
Before: Five weekday ISA rows on the board with no evidence of a working shift since 2026-09-13.  
After: Steven picks one of Vanessa's COAs (manual audit / fill now / two-week sprint / overhaul); the board's ISA rows are hidden or reassigned until then.  

**F-INT-02 — Routine**  
Before: Fri 20:00/21:00/22:00 and Sun 15:00/15:00/16:00/16:00/17:00 UTC, plus 10 routines in the Mon 15:00 hour  
After: Destaggered to one per hour across Mon-Thu; a single consolidated Weekly Loop Engineering + Self-Test routine created for Saturday 13:00 UTC; six UI-created routines listed for Steven to retime or disable by hand  

**F-INT-03 — Plugin/Integration**  
Before: Static red 'API blocked' badge with no live check and no stated fix  
After: A live zohoSync document records the exact error, the tested tools, the timestamp and the one-line fix; the dashboard badge now reads that document instead of a hardcoded label; a sync task fills zohoLeads and zohoDeals the moment the permission lands  

**F-INT-04 — Plugin/Integration**  
Before: A Follow Up Boss import card showing stage totals and 90-day leads from a 2026-09-07 pull, with no indication the source had been dead since 2026-09-16  
After: A loftyLeads document, a lofty-crm-sync skill and Mac task spec, the dashboard card re-pointed at Lofty with an honest not-yet-configured state, and the retired Follow Up Boss numbers preserved as dated history rather than relabelled  

**F-INT-05 — Plugin/Integration**  
Before: No record of the incident anywhere in the ecosystem; twelve apps connected through a single custody path  
After: Flagged in the CAIO brief with dated sources and carried into the findings table; recommended actions are to rotate the Composio API key, re-authorize GitHub, enable IP allowlisting, and move Zoho onto its own official connector with Composio as fallback  

**F-INT-06 — Orchestrator Agent**  
Before: loopLog written by cycles 1 to 5, read by no panel; cpiOpportunityLog written daily, rendered nowhere  
After: Panel 39, Orchestration and Loop Engineering, on its own page: cycle tiles, master findings table with filters, stress test report, CPI log, scale log, trust gate with the halt conditions, weekly brief, a roadmap derived from the open findings so the two can never disagree, a text architecture diagram, and four copyable templates. Verified by the runtime harness: 10 containers render, 0 exceptions.  

**F-INT-07 — Current State**  
Before: r6-weekly-backup scheduled Sunday 5:00 AM, zero execution evidence, no watchdog  
After: trig_01JcPh3AM2z21Bsv34SvSkqM, Sundays 11:00 UTC, 8-week rolling retention, escalates on the ISA line after two consecutive failures. It runs in the cloud, so a closed laptop no longer means no backup.  

**F-INT-10 — Unlisted Capability**  
Before: A prose description of a five-level framework, with the levels mapped to tools but not to files  
After: The repository is the brain: CLAUDE.md routes to exactly one leaf per question, AGENTS.md mirrors it for Codex, and context, projects, wiki, references, memory, vector-index, knowledge-graph and always-on carry the five levels with the Mac stores named as their backing services  

**F-E1-02 — Stale Content**  
Before: WEATHER_SYNCED_AT = "2026-09-07 10:05 AM PDT", 7 cities with Sep 7 temps and two active alerts  
After: WEATHER_SYNCED_AT = "2026-09-21 08:05 PM PDT", 7 cities re-baked verbatim from db/state/weatherSnapshot.json (no alerts on that write)  

**F-E1-03 — Stale Content**  
Before: NEWS_SYNCED_AT = "2026-09-07"; Labor Day / Sep 3-7 headlines in every city card  
After: NEWS_SYNCED_AT = "2026-09-21 08:05 PM PDT"; 5 global + 11 city lists re-baked from db/state/newsSnapshot.json  

**F-E1-04 — Bug**  
Before: note = 'Synced 2026-09-20 - daily feed task, 5:50 AM PT' above September 7 history entries  
After: note = 'Entries for September 20 - NOT September 22; this feed has not refreshed since. - synced 2026-09-20 - the scheduled writer is openrouter-feeds-refresh (5:50 AM PT), in error since 2026-09-17; the last fill came from a Claude research session.'  

**F-E1-06 — Stale Content**  
Before: asOf 'Sep 4, 2026 close ... lifted odds of a Fed HIKE at the Sep 15-16 FOMC'  
After: asOf 'Sep 18, 2026 close ... first full session after the Fed's Sep 16 rate hike to 3.75-4.00%'  

**F-E1-07 — Bug**  
Before: weather-news-refresh task (5:45 AM / 10:45 PM PT) / 'Weather + news refresh (3x/day)' (6 AM / 12 PM / 6 PM PT)  
After: weather-news-refresh task (8:05 AM / 8:05 PM PT, twice daily), cron cited in the comment  

**F-E1-08 — Bug**  
Before: calendar-daily-sync task (6:25 AM / 12:25 PM / 5:25 PM PT) x4  
After: calendar-daily-sync task (6:35 AM / 5:35 PM PT) x4, cron cited in the comment  

**F-E1-09 — Bug**  
Before: {doc:'ratesSnapshot', task:'r5-rates-market-refresh', hrs:200}  
After: {doc:'ratesSnapshot', task:'mortgage-rates-daily (r5-rates-market-refresh has never run)', hrs:80}  

**F-E1-10 — Bug**  
Before: {doc:'knowledgeFabric', task:'fabric-deck-sync', hrs:200}  
After: {doc:'knowledgeFabric', task:'fabric-deck-sync', hrs:14} (covers the 9 PM to 7 AM overnight gap, flags a missed day)  

**F-E1-11 — Plugin/Integration**  
Before: 26 watched documents; no CRM sync rows  
After: 28 watched documents including loftyLeads and zohoSync, both reporting 'Never produced output'  

**F-E1-12 — Stale Content**  
Before: e.g. 'The openrouter-feeds-refresh runner task writes topHeadlinesList into liveFeeds daily at 5:50 AM'  
After: e.g. 'The openrouter-feeds-refresh runner task (status: error since 2026-09-17 - the recent fills in liveFeeds came from Claude research sessions, not from this task) writes topHeadlinesList ...'  

**F-E1-15 — Stale Content**  
Before: 'DC trip (Sept 14-17, one week out), the Sep 15-16 FOMC with a live hike risk ... about three weeks out.' / 'As of Mon, Sep 7, 2026 - live-data sync'  
After: 'Inside the next 30 days (as of Tue, Sep 22, 2026) - foot doctor Fri Sept 25, and the Q3 2026 licensing window (TX/VA/NC), which closes Wed Sept 30. Already passed: the DC trip (Sept 14-17) and the Sep 15-16 FOMC - the Fed hiked to 3.75-4.00% on Sep 16.' / 'Plan reviewed Tue, Sep 22, 2026 - the to-do state syncs across devices; the plan text itself changes only when Steven changes it'  

**F-E1-16 — Bug**  
Before: 'As of Mon, Sep 7, 2026 \u2014 live-data sync' rendered literally in the Master Plan header  
After: Real em dash in panel-masterplan; the other 17 lines listed above are left for their owning engineers  

**F-E1-19 — Automation Opportunity**  
Before: Feeds silently go stale whenever the Mac sleeps through a task window; the page could not tell the difference between 'nothing happened' and 'the machine was off'  
After: FRESH_FEEDERS now says 'it only runs while the Mac is awake' for feeds-market-close; the architectural fix is not built  

**F-E1-20 — Current State**  
Before: Tracked-calendar table showed the Follow Up Boss row as plain 'Full access' with no hint it is dead  
After: Row reads 'Full access - legacy calendar created by Follow Up Boss, which was retired 2026-09-22 in favour of Lofty; it returned no events on the last sync and should not be expected to fill again'  

**F-E11A-01 — Skill**  
Before: interview-me, prompt-master, vanessa-orchestrator, loop-engineering, scale-growth-engine absent from the Mac toolkit snapshot; skills-refresh existed only as a Sunday task  
After: SKILL.md written for all nine with trigger, inputs, procedure, doc shapes, guardrails, HALT, logging and a nightly self-test  

**F-E11A-04 — Orchestrator Agent**  
Before: two Friday ops reviews, neither producing a vanessaRuns entry since 2026-09-11  
After: routines/parallel-csuite-task-cycle.md: one Mac task of record, caps 8 sub-agents / 4 Perplexity, stall policy 2 retries then re-route then Needs-Steven  

**F-E11A-05 — Current State**  
Before: no shape of record for five docs the orchestration skills depend on  
After: shapes specified in the skills; integrator to confirm the render code agrees  

**F-E11A-06 — Skill**  
Before: fub-followups present in the toolkit snapshot, described as a live template library  
After: flagged for porting by skills-refresh; no prune performed  

**F-E12-02 — Bug**  
Before: Two <ul> elements and copy claiming automatic refresh.  
After: Elements removed. The market card now states that medians/DOM/YoY come from the ratesSnapshot document written by mortgage-rates-daily on Steven's Mac and were copied here by hand; the builder card names incentives-daily-scan and says plainly that it writes to Command Deck's store, which this page cannot read.  

**F-E12-09 — Bug**  
Before: changed was set whenever the JSON differed, without checking that the local write had actually landed.  
After: changed is set only when the value genuinely differs AND lsSetLocal reports the write landed. Verified: first write true, identical replay false, blocked-store write false.  

**F-E12-17 — Stale Content**  
Before: San Diego $937,251 / 29 DOM / +2.4% (Jul 2026); two markets; no Murrieta.  
After: San Diego County re-baked to $961,781 / 28 DOM / +5.7% (Aug 2026); Temecula confirmed unchanged against the document; Murrieta added at $659,670 / 44 DOM / -3.7% with its missing sale-to-list left blank rather than guessed. Active-listing counts and sale-to-list ratios stay the older manual pulls and are dated in place.  

**F-E12-18 — Stale Content**  
Before: Snapshot researched 2026-09-02 with an inaccurate explanation and a You.com live list beneath it.  
After: Note states the snapshot's age from the date, names incentives-daily-scan and explains why its output does not reach this card, and points at the research queue.  

**F-E12-20 — Automation Opportunity**  
Before: No reference to the document anywhere in the file.  
After: KPI card now says the document exists, matches Steven's copy, and is not rendered - with an invitation to have it wired in. Wiring it is a small, well-scoped follow-up.  

**F-E12-21 — ISA Coverage**  
Before: The page implied the grading table 'mirrors the Command Deck exactly'.  
After: Named in the drift table as NOT synced, with the plain statement that he cannot see her self-grades.  

**F-E12-24 — Automation Opportunity**  
Before: No research queue existed on this portal.  
After: queueResearch writes the document and relays on the ISA line, and says in the confirmation text which of the two succeeded. The durable fix is to point vanessa-research-queue at both stores.  

**F-E2-03 — Routine**  
Before: Nothing on the deck said the sync had stalled; the stamp came from the doc, which simply stopped moving.  
After: STRATEGY_SYNCED_AT now states the stall and the cloud routine's inability to write. Clearing the runner backlog is a Mac-side fix for Derek.  

**F-E2-05 — Routine**  
Before: 'Synced <date> - daily feed task, 5:50 AM PT.'  
After: Names the task, states it has been erroring since 2026-09-17, and says the list was last filled by a Claude session on Sep 20. The task itself needs repair on the Mac.  

**F-E2-12 — Stale Content**  
Before: Hard-coded counts and a hard-coded Sep 2, 2026 timestamp.  
After: Counts derived from data.sectors and the date from the document's own asOf, with a line saying this is the fallback view that a liveFeeds sector read replaces.  

**F-E2-13 — Current State**  
Before: Badge read 'Snapshot > 24h old' whether it was 25 hours or 9 days.  
After: Badge reads the age in days (red past 72h) and states that snapshot.sh is hand-run, not scheduled.  

**F-E2-15 — Stale Content**  
Before: TOP_PERFORMERS_SYNCED_AT '2026-09-07'; one note element shared by a Sep 7 table block and a Sep 22 feed.  
After: Stamp text and the note now say the tables are a Sep 7 research pass and each row carries its own source date. The structural fix - a second note element so the live feed stops stamping the static tables - sits in panel-personalaccounts markup (E3's region) and was not made.  

**F-E2-16 — Current State**  
Before: FRESH_FEEDERS (base file ~line 19761) credits feeds-market-close with a feed a Claude session actually wrote.  
After: Not changed - FRESH_FEEDERS is E1's region. Listed here so the integrator can route it.  

**F-E2-19 — Automation Opportunity**  
Before: Sync writes percentages only; sim size and P&L were carried by a hand read that is now 15 days old.  
After: Deck shows an honest em dash instead of an old figure. The durable fix is on the Mac task, not in the page.  

**F-E3-01 — Bug**  
Before: Fill in the value column yourself for the properties below — didn\u2019t find a reliable exact estimate to pre-fill and won\u2019t guess at your own home\u2019s equity.  
After: Fill in the value column yourself for the properties below — didn’t find a reliable exact estimate to pre-fill and won’t guess at your own home’s equity.  

**F-E3-05 — Bug**  
Before: base deck: renderMemberships([null, {…}]) throws and the card renders nothing.  
After: both renderers filter to rows that are truthy objects first, matching renderLicenseTracker. Runtime: junk rows now render without throwing.  

**F-E3-06 — Stale Content**  
Before: amber badge 'Plaid bridge — no snapshot yet' + 'Balances appear here after the bridge is set up on the Mac and the refresh prompt has run once'.  
After: gray badge 'Plaid bridge — not configured' + 'No Plaid API keys are on file and no plaidBalances document has ever been written; checked 2026-09-22, so every balance below is the manual figure you typed into Accounts.' The honest-status card now also states that the Mac bridge cannot run without keys and that every figure in the panel is hand-entered.  

**F-E3-07 — Stale Content**  
Before: 'Once the Plaid bridge is linked, the monthly audit fills this from real transactions; until then, add what you know.' / 'Nothing tracked. The monthly Plaid audit fills this once the bridge is linked.'  
After: Both now state that the subscriptions document is empty as of 2026-09-22, that no Plaid API keys are on file, that nothing is being audited automatically, and that the list is hand-entered — with the Plaid path stated as conditional, not pending.  

**F-E3-08 — Stale Content**  
Before: 'Auto-generated weekly, screened through a 3-question filter…'  
After: Opens with the screening filter, then: 'Status 2026-09-22: the cloud routine that writes this ("weekly opportunity audit") FAILED its last scheduled run, so nothing has been added since the entry below — read the log as current to its own date, not to this week.'  

**F-E3-09 — Bug**  
Before: var YOUR_ESTIMATED_NET_WORTH = 2430212; used directly for the clears/below test and the shortfall figure.  
After: new feoNetWorth() reproduces renderGlobalNetWorth's formula (accounts + property value − property debt − non-mortgage liabilities) from the live docs, falling back to the frozen constant inside try/catch if the docs are junk. Runtime: returns 2440211.86 against the live export, 2430212 when handed null/garbage docs, no NaN in the rendered rows. Card copy no longer quotes a hardcoded figure. No account balance or property value was altered.  

**F-E3-14 — Stale Content**  
Before: '… then FUB for real estate' / 'Check inbound channels: FUB Phone, …'  
After: Should become Lofty, with the history kept honest ('was Follow Up Boss until 2026-09-22').  

**F-E3-16 — Current State**  
Before: —  
After: No edit required; the deck already says it. Flagged so it reaches Steven rather than sitting in a card he may not open. A beneficiary designation overrides the will, so an out-of-date one silently undoes the family-office estate work.  

**F-E4a-05 — Routine**  
Before: No visibility — the page asserted the block as a permanent fact with no notion of when it was last tested.  
After: Absent doc renders as gray "Never checked" plus "no scheduled task has ever recorded a Zoho API attempt".  

**F-E4a-06 — Unlisted Capability**  
Before: No deals surface anywhere on the deck.  
After: Stage-count tiles, total amount and a 7-column deal table; empty and malformed-doc states verified not to throw and not to invent a total.  

**F-E4a-07 — Stale Content**  
Before: "Zoho is not updated until its API access is granted" / "NOT created in Zoho until API access is granted".  
After: System-of-record statement plus an explicit "the next sync overwrites it" warning and the L2 write-back note.  

**F-E4a-11 — Bug**  
Before: Hard-coded "Follow Up Boss" in both the card copy and the JS empty state.  
After: Not changed by E4a — listed for the integrator with line numbers.  

**F-E4a-12 — Plugin/Integration**  
Before: No mention of CLI-Anything, homes.com, SkySlope or zipForms anywhere on the connectivity card.  
After: Dedicated bullet plus a data-copy button carrying the full read-only-first install prompt, credential rule (keychain/.env, never in a prompt) and the ECC security-review gate.  

**F-E4b-03 — Stale Content**  
Before: 'written by r5-rates-market-refresh, not pulled by this page'; 'r5-rates-market-refresh (Mon 5:07 AM PT) writes the live rows'; 'Added by r5-rates-market-refresh'.  
After: Credits mortgage-rates-daily (weekdays 6:38 AM / 1:38 PM PT) as the writer, names ratesSnapshot as the document, and states plainly that r5-rates-market-refresh has never run under claude-runner.  

**F-E4b-04 — Stale Content**  
Before: OUTPUT_WATCH line 18892 task:'r5-rates-market-refresh'; FRESH_FEEDERS line 19753 credits r5.  
After: Not changed - outside E4b's assigned regions. Recommend task:'mortgage-rates-daily' and a line saying r5 has never run.  

**F-E4b-08 — Current State**  
Before: isaKpi doc existed in the store and was never read by any render function; the card's Actual column was hand-typed and undated.  
After: isaKpiDocBlock renders 6 measured metrics + header row with the doc's own stamp and caveats; the SOP card's sub now says plainly which column is a target and which is hand-typed. Verified under Node against db/state/isaKpi.json.  

**F-E4b-09 — Bug**  
Before: 'Where to search for similar properties' and 'Search tax record' both printed a refusal and returned nothing actionable.  
After: Both write a vanessaResearch item (askedBy 'Property search tool'), re-render the Vanessa queue, and report 'Queued - not answered yet'. Duplicate clicks report the original queue time instead of queueing twice. Verified under Node.  

**F-E4b-11 — Bug**  
Before: Sep 7 area paragraphs under a note reading 'Builder incentives via ... updated 1h ago'; the seed's own date was erased at render time.  
After: 'The three area write-ups below are a hand snapshot from 2026-09-07 and do not refresh...' printed inside the card body above the rows; the live list underneath keeps its own stamp.  

**F-E4b-14 — Current State**  
Before: 'Dates start blank on purpose - fill each one from the source document rather than trusting a guess.' with no hint that the deck already holds two of them.  
After: Same, plus: 'the credential tracker carries NMLS to 2026-12-31 and the CA Real Estate Broker license to 2028-07-16. Until a row has a date, it raises no alert at all.'  

**F-E4b-16 — Current State**  
Before: 10 empty stores behind 12 cards.  
After: Unchanged - recorded as current state, not patched over.  

**F-E4b-20 — Automation Opportunity**  
Before: Three hand-checked rows looked identical to fed rows.  
After: Each says 'not carried by the daily feed' with its own hand-check date; a task change is still needed to actually keep them current.  

**F-E4b-21 — Stale Content**  
Before: 35 'Follow Up Boss' and 22 'FUB' occurrences file-wide at the start of the cycle.  
After: E4b's regions cleared; the lines above listed with numbers so the integrator can route each one.  

**F-E5-03 — Stale Content**  
Before: STRAVA_SYNC_AT = "2026-09-07"; 2 rows, newest 2026-08-31.  
After: STRAVA_SYNC_AT = "2026-09-20"; 3 rows, newest 2026-09-12; provenance string carried in STRAVA_SYNC_VIA.  

**F-E5-04 — Bug**  
Before: var STRAVA_LAST_30D_COUNT = 2; printed verbatim.  
After: Computed from the rendered rows each time; 3 with the current data.  

**F-E5-05 — Bug**  
Before: Axis read '494.0 mi' for a set of weight-training sessions with no distance at all.  
After: Reads the distance column; prints 'No distance recorded on these N activities — strength sessions post without one' when there is nothing to plot. Verified under the DOM shim: a row with a real distance (12.4 mi) draws the full chart.  

**F-E5-06 — Bug**  
Before: Five headers, six meanings — every live-document row displayed one column to the left of its true heading.  
After: Header matches the document's own column order; the 'Notes' column now carries the calorie/achievement text it always held.  

**F-E5-09 — Bug**  
Before: green badge, no age.  
After: red badge reading 'Last export received 2026-09-13 14:30 UTC · 9d ago' with the current data.  

**F-E5-12 — Skill**  
Before: 'Reachable here, or via the kevin-mentor skill on Claude Desktop — both read/write the same shared thread.'  
After: States the Desktop skill is installed as cole-mentor ('Cole') writing to a separate coleChat thread, that the two are not one conversation today, and that the name is Steven's call.  

**F-E5-15 — Current State**  
Before: Panel claimed nothing either way; the brief and routineHealth both said 2 drafts.  
After: Panel states the queue's own count and its own newest date; the discrepancy is logged instead of being papered over.  

**F-E5-16 — Stale Content**  
Before: 'Last recorded run ... 2026-09-07. That date was entered by hand ... treat it as unverified.'  
After: Verified 2026-09-21 run dates for both routines, the research-only caveat, the queue's own newest date, and r14's failure since 2026-09-17.  

**F-E5-17 — Stale Content**  
Before: 'Synced 2026-09-07 · reviewed weekly — Sep 7 review: ...'  
After: 'Last actual review 2026-09-07 ... The weekly cloud routine ... FAILED its last run on 2026-09-20 16:09 UTC — nothing below has been re-checked since Sep 7.'  

**F-E5-19 — Stale Content**  
Before: 'Refreshed 2026-09-07 · Claude session research pass (no standing routine)' on both cards.  
After: Curated-vs-live separated, each with the correct routine name and last-success timestamp.  

**F-E5-20 — Stale Content**  
Before: No mention that the refreshing task had failed.  
After: Names the routine, the FAILED status and the 2026-09-20 date.  

**F-E5-25 — Stale Content**  
Before: 'Brain: live — the steve-twin skill plus this dashboard's state, working today.'  
After: 'Brain: built, but degraded as of 2026-09-22 ...' naming the refused vault write, the disabled cloud routine and what still works.  

**F-E5-27 — Routine**  
Before: Five health tasks failing, producing nothing or never run, with no stated order of repair.  
After: Ordered repair plan tied to the two writer fixes that unblock the rest.  

**F-E6-01 — Stale Content**  
Before: 'Routes to 7 specialists' · '7 specialists on call'  
After: 'Routes to 8 executives + 4 mentors' badge, 'Claude Fable 5.1 · masterminds' badge, tiering sentence (Fable/Opus/Sonnet/Perplexity, ≤8 parallel, ≤4 Perplexity per wave)  

**F-E6-03 — Stale Content**  
Before: 'a Claude Code session … live web, Perplexity' · badge 'Awaiting Claude Code'  
After: Task name, cadence, last-ok stamp, subscription WebSearch/WebFetch + Perplexity ≤4/wave, 'You.com was retired 2026-09-22'; badge 'Queued — answered by Vanessa (hourly task)'  

**F-E6-05 — Bug**  
Before: static 12 / 169  
After: spans lbMcpCount/lbAgentCount/lbTaskCount + lbCountsStamp filled by renderLocalBridgeCounts() from toolkitSnapshot.counts (safeRun; printed 15/172/60 fallback)  

**F-E6-08 — Stale Content**  
Before: cloud-routine narrative; 'every FUB lead'  
After: Mac task narrative with last-run refusal; 'every Lofty lead'  

**F-E6-09 — Routine**  
Before: refused-tool: Bash (write ~/Shearrill-Vault)  
After: card says so; fix = Steven adds the path to the runner allow-list or drops step B2  

**F-E6-11 — Orchestrator Agent**  
Before: generic CAIO/CTO-Innovator text  
After: §7(b) wording in both structures  

**F-E6-16 — Current State**  
Before: recall order only on Toolkit tab, 3 steps  
After: canonical 5-step order on the AI Team tab  

**F-E6-18 — Stale Content**  
Before: aspirational schedule  
After: schedule labelled as slots that have not run where true  

**F-E6-19 — Stale Content**  
Before: 'Every Friday at 4:00 PM … desktop task'  
After: honest status paragraph with next slot 2026-09-25  

**F-E6-21 — Skill**  
Before: 'not installed yet' + build prompt  
After: 'written this cycle — repo skills, Mac install pending' + install prompt  

**F-E6-22 — Plugin/Integration**  
Before: 'Not installed yet' + brew install  
After: installed-app truth, no install command, executor seat as a proposal vetted by CTO Innovator + Elena  

**F-E6-25 — Stale Content**  
Before: old cadences/wording  
After: local-bridge-queue hourly 6:25–21:25 (ok 8:25 PM PT); brain-deck-sync hourly + brain-learn-daily 10:50 PM (last ok 2026-09-15, Drive folder 0 files) + brain-weekly-verify Sun 4 PM; canonical L1–L5 paragraph; 5-step recall order + tiering; live-paths line under Vanessa Live  

**F-E6-26 — Routine**  
Before: last ok 2026-09-15  
After: Toolkit + L5 rows state it  

**F-E6-27 — Routine**  
Before: graph 2026-09-13  
After: stated on L4 row, Notes card, fabric node  

**F-E7-02 — Bug**  
Before: var cites = (d.citations || []).filter(function (c) { return c && c.url; }).slice(0, 5);  
After: var cites = docRows(d.citations).filter(function (c) { return c && c.url; }).slice(0, 5);  

**F-E7-04 — Bug**  
Before: wrap.innerHTML = msgs.map(isaLineMsgHtml).join("");  // harness milliseconds are relative, not browser timings — the unbounded write SIZE is the durable finding  
After: render the last ISA_LINE_MAX messages and say how many older ones are held back  

**F-E7-05 — Bug**  
Before: if (!m || typeof m !== "object" || !m.id) return;  
After: if (!m || typeof m !== "object") return; var key = m.id || (String(m.ts) + "|" + String(m.origin));  

**F-E7-06 — Bug**  
Before: function lsSetLocal(key, value) { try { localStorage.setItem(...); } catch (e) {} }  
After: catch (e) { LS_WRITE_FAILED = true; } plus an Ops Radar alert alongside localStorageUnavailableAlerts()  

**F-E7-09 — Current State**  
Before: second and later isaLine snapshots dropped in local-only mode  
After: exempt the merge-on-read keys (isaLine, isaLineRead) from the pendingDbWrites skip, since they merge rather than overwrite  

**F-E7-10 — Current State**  
Before: no storage-budget instrumentation anywhere on the page  
After: a size check in the freshness board (sum of prefixed keys vs 5 MB) and a hard cap on the three unbounded lists (isaLine, liveFeeds citations, routineHealth rows)  

**F-E7-11 — Current State**  
Before: watched documents with no writer output: revenueScan, healthCoaching; every document the edge sweep read that is absent from the export: revenueScan, healthCoaching, zohoLeads  
After: either run the owning task once to prove it, or take the row off OUTPUT_WATCH — a watch that can never go green is noise  

**F-E7-12 — Routine**  
Before: last verified backup 2026-09-14; r6-weekly-backup never run under claude-runner  
After: scratchpad/backup/2026-09-22/{state/*.json, command-deck.html, manifest.json} + restore-test.json, integrity pass  

**F-E7-13 — Automation Opportunity**  
Before: static checks only; runtime regressions found by Steven noticing a blank card  
After: node tests/runtime-harness.js <file> — exit 0 when the script runs to completion, exit 2 when it halts; 318 containers is the baseline to diff against. tests/harness-selftest.js proves the harness catches that exact bug class before anyone trusts its PASS (6/6, it reconstructs the 2026-09-03 failure and reports `updateHeaderClock is not defined @ html:18204`).  

**F-E8-04 — Current State**  
Before: The weekly self-improvement layer in the cloud has produced nothing usable since Sep 13; the Mac duplicates (loop-engineering-weekly, weekly-self-update, vanessa-ops-review) have never run.  
After: Cloud keeps read-only research + notifications; every writing loop moves to the Mac runner (F-E8-35, F-E8-36, F-E8-38, F-E8-64).  

**F-E8-07 — Current State**  
Before: vanessa-sweep runs ok (last 2026-09-21T19:21Z) but has never had work; vanessaBrief.didForYou is [] and needsSteven is [].  
After: Create vanessaQueue with the twinQueue shape, seed it from the kanban Vanessa rows (kr26–kr28), and make the deck's 'Queue it' for Vanessa write to it.  

**F-E8-08 — Current State**  
Before: Card text still describes the daemon pipeline as live with 5:10 AM / 9:10 PM writes.  
After: Card says 'daemon down since 2026-09-13; Notion recipe spec written, first phone run pending'; health-notion-sync Mac task writes the same appleHealth shape from Notion.  

**F-E8-09 — Current State**  
Before: L4/L5 of the five-level brain refresh only when a human runs them; 77% of Second Brain rows are un-triaged Inbox.  
After: ops-knowledge-graph proven on Sep 27; brain-weekly-verify Sunday gate produces the Inbox triage list; Drive folder populated or the L2 'Drive' store dropped from the counts.  

**F-E8-11 — Current State**  
Before: Deck reach table says Discord is 'Live — post in #vanessa'.  
After: Discord row shows 'relay bot installed; bot token pending (Steven)'; email row keeps the 'not for clients' warning; SMS stays 'not available'.  

**F-E8-12 — Current State**  
Before: The CPI engine exists as a skill (status RUN in the toolkit index) but its two feeders are down.  
After: Table 24 of E8-report.md seeds 12 opportunities with the v2 log shape {id,date,opportunity,evidence,expectedSaving,complexity,status,measured,cumulativeSaved}; cpi-daily-scan recovers with the runner fix.  

**F-E8-13 — Current State**  
Before: No Scale Opportunity Log, no Growth Roadmap, no capacity metric before/after.  
After: Table 25 of E8-report.md seeds 12 ADR opportunities in the v2 shape {id,date,opportunity,lens,status,capacityImpact,cumulativeCapacityUnlocked}; the integrator writes scaleOpportunityLog.  

**F-E8-14 — Stale Content**  
Before: 'all 20 cloud routines enabled'  
After: '46 of 50 cloud routines enabled; 10 failed their last run Sep 18–20; 2 abandoned — see Ops Radar' (E1 assignment).  

**F-E8-15 — Stale Content**  
Before: Routes to 7 specialists; Discord Live.  
After: 8 executives + 4 mentors; Discord 'relay bot installed, token pending'. (E6 assignment.)  

**F-E8-16 — Stale Content**  
Before: FUB fully working; 11:40 AM.  
After: Zoho connected/API blocked + fix; Lofty via Mac bridge, key pending; FUB retired 2026-09-22; lead-triage-daily 11:33 AM PT re-pointed to Lofty (E4a/E4b assignment).  

**F-E8-18 — Stale Content**  
Before: Seven recurring cards carry wrong times or a retired CRM.  
After: Times rebuilt from the runner crons; kr23 says Lofty (real estate) + Zoho/ARIVE (mortgage). Because kanbanCards is a live doc, the fix is a doc update, not only a seed edit.  

**F-E8-20 — Stale Content**  
Before: Live pipeline claimed.  
After: 'Daemon not responding; last real ingest 2026-09-13; Notion recipe spec written, first phone run pending' (E5 assignment).  

**F-E8-23 — Bug**  
Before: Automation-health board reports stale/absent for docs that are fresh, and fresh for docs no task writes.  
After: Rows re-pointed: isaKpi ← r11, cpiOpportunityLog ← cpi-daily-scan, ratesSnapshot ← mortgage-rates-daily, twinBrief ← steve-twin-sweep; add loftyLeads/zohoSync (E1) and plaidBalances (status not-configured).  

**F-E8-24 — Bug**  
Before: No pre-meeting brief has ever been pushed by r13; the twin drafts them by hand in the evening sweep instead.  
After: Reliability Engineer traces the calendarSnapshot → r13 match (calendar id / timezone) and proves one apptPrep write on the next real meeting.  

**F-E8-26 — Bug**  
Before: Identical nudge, unbounded repeats, no reply detection.  
After: Reply-check + ladder (F-E8-37); a second identical send within 24 h is suppressed.  

**F-E8-27 — Bug**  
Before: A task that interviews a human runs unattended and produces nothing.  
After: r17 reads a source (the QuantVue Google Sheet r4 already reads, or a Tradovate/TradeSyncer CSV export folder) and only asks Steven — by iMessage via vanessa-significant-alerts — when the source is missing (F-E8-49).  

**F-E8-30 — Bug**  
Before: Nine failing routines, three of them structurally unable to succeed.  
After: Disable the three vault-template routines (or re-point them at Notion/the deck docs), retire Real Estate Weekly Brief, re-run one weekly loop after removing You_com from its grants and record the cause.  

**F-E8-31 — Routine**  
Before: Research routines hold write-capable connectors they never use.  
After: Each routine's grant trimmed to what its prompt calls (weather/news: none or Context7; calendar: Google_Calendar; Strava: Strava; CRM tests: Composio only); You_com and Canva removed everywhere.  

**F-E8-32 — Routine**  
Before: 46 enabled routines, at least 6 of which cannot succeed as written.  
After: Delete or disable the six; move Rent-Buy-Wait to a Monday Mac task using the skill; enabled count reflects only routines that can succeed.  

**F-E8-37 — Routine**  
Before: Four identical nudges, no escalation.  
After: Bounded nudges with a visible ladder.  

**F-E8-39 — Routine**  
Before: 20 tasks 'exist' but have never proven they run.  
After: A checklist with expected doc per task (routineHealth already names them) reviewed on 2026-09-28 and 2026-10-02.  

**F-E8-40 — Routine**  
Before: Two Mac briefs failing, two cloud briefs succeeding into nothing.  
After: One brief, two delivery paths, honest 'source: cloud fallback' stamp.  

**F-E8-45 — Automation Opportunity**  
Before: Expiry alerts fire only inside the page (60/30/7 days) — nobody is paged.  
After: Phone alert at 14 days; blank expiries surfaced as a Sunday to-do.  

**F-E8-49 — Automation Opportunity**  
Before: riskMonitor: accounts [], every day 'not recorded'.  
After: Daily rows populated from the sheet; blown/dllTriggers real or explicitly null with reason.  

**F-E8-50 — Automation Opportunity**  
Before: 77% of rows un-triaged.  
After: Weekly review list; Active share rising week over week (measured by fabric-deck-sync).  

**F-E8-51 — AI Clone**  
Before: Trust levels implicit in task prompts; no single table.  
After: Table 3 of E8-report.md; trustLevels doc written by the integrator.  

**F-E8-52 — AI Clone**  
Before: Twin completes deck writes, fails every vault write.  
After: Either allow-list ~/Shearrill-Vault/40-Decisions and 00-Inbox for the task, or route vault writes through the obsidian-note bridge verb.  

**F-E8-54 — Skill**  
Before: Three skills exist only as files in the scratch repo.  
After: Mac install prompt (E6) executed by Steven; skills-refresh-weekly's first run (2026-09-27) confirms they load.  

**F-E8-55 — Skill**  
Before: Template library bound to a retired CRM.  
After: lofty-followups: same sequences, Lofty merge fields and stage names; ad-compliance-reviewer pass before use.  

**F-E8-56 — Skill**  
Before: Self-improvement loop exists on paper.  
After: First Saturday run 2026-09-26 writes loopLog cycle 7 and scaleOpportunityLog; trust-graduation gate (7 consecutive correct runs) recorded.  

**F-E8-57 — Skill**  
Before: One slow gate, currently not completing.  
After: Two-tier gate; nightly run under 2 minutes; selfTest doc written.  

**F-E8-58 — Plugin/Integration**  
Before: No path to those three systems; the connectivity card lists them as 'need a direct vendor API agreement'.  
After: E11b's cli-anything-connectors skill + install prompt; wrappers enabled one at a time after review.  

**F-E8-59 — Plugin/Integration**  
Before: Twelve apps connected, one dead, no per-app usage map.  
After: App → consumer map in CONNECTIONS.md (E11b); FUB revoked; first access audit 2026-10-01.  

**F-E8-60 — Plugin/Integration**  
Before: Fallback to external free models with one hook as the safeguard.  
After: Fallback order for business sessions: Jarvis (local) only; free external providers reserved for non-client coding sessions; guard hook tested by the security-steward with a PII canary.  

**F-E8-61 — Plugin/Integration**  
Before: Security-research tooling and business tooling share one account, one hook chain and one LaunchAgent set.  
After: Move the OSINT/uncensoring set to a separate macOS user or disable their hooks/LaunchAgents in the business profile; ecc-security-steward signs off; documented in the access audit.  

**F-E8-67 — Orchestrator Agent**  
Before: Incidents surface as twinQueue decision items or not at all.  
After: reliability-engineer is the incident commander: every status=failed doc opens an incident row (in routineHealth) with owner, first-seen, last-seen, next action; closed only when the doc goes green.  

**F-E8-69 — ISA Coverage**  
Before: Messages to the ISA are written into a thread she does not open.  
After: ISA receives a daily 12:00 PT digest by the channel she actually uses (Steven's choice: Gmail draft he forwards, or a Portal bell + email); isaLineRead.isa freshness shown on the ISA line card.  

**F-E8-70 — ISA Coverage**  
Before: A weekly KPI comparison with no self-report and no CRM read.  
After: Portal-side scorecard form writes isaScorecard directly (bridge carries it); r11 reads loftyLeads + zohoDeals; first real comparison Sunday 2026-09-27.  

**F-E8-71 — ISA Coverage**  
Before: Compliance relies on the draft prompt's wording.  
After: ad-compliance-reviewer pass (Reg Z trigger terms, NMLS, Equal Housing) on every ISA draft before it reaches the bell; sent-text log from Lofty's activity timeline.  

**F-E8-73 — Unlisted Capability**  
Before: Cloud runs 'SUCCEED' into a session nobody reads.  
After: Every research routine that matters carries notifications; the Mac runner stays the only unattended writer (rule for CLAUDE.md router).  

**F-INT-08 — Current State**  
Before: An assumption repeated across five loop cycles, last tested 2026-09-04  
After: Settled by measurement, not assumption. Cloud routines are writers. The Mac-only-writer constraint that shaped every routine prompt in this ecosystem is lifted, and the feeder tasks that currently exist only on the Mac can be rebuilt as cloud routines that survive a closed laptop.  

**F-INT-09 — Skill**  
Before: Six skills named on the AI Team panel with no file behind them; three queued and never started  
After: Twelve skill files in the repository under .claude/skills, each with trigger, procedure, exact output document shapes, guardrails, halt conditions, logging and a self-test the nightly suite can run  

**F-E1-05 — Stale Content**  
Before: record '2-1 (preseason)', standings all 0-0-0, tile labelled '2025 record'  
After: record '1-1 - lost 9-3 to Minnesota at Soldier Field, Sun Sep 20', Bears 1-1 / Vikings 2-0 / Packers and Lions blank, tile labelled '2026 record'  

**F-E1-17 — Stale Content**  
Before: 'Tech: Follow Up Boss / Sierra Interactive CRM ...' and 'Stack: WebinarJam/Zoom - Follow Up Boss/HubSpot ...'  
After: 'Tech: Lofty CRM (replaced Follow Up Boss on 2026-09-22) / Sierra Interactive ...' and 'Stack: WebinarJam/Zoom - Lofty (replaced Follow Up Boss 2026-09-22)/HubSpot ...'  

**F-E1-21 — Current State**  
Before: n/a - inspection only  
After: n/a - no edit required  

**F-E12-14 — Stale Content**  
Before: 'updates automatically via the twice-daily drift check, see below'.  
After: 'Sync map, verified 2026-09-22 by reading both stores. No drift check runs on its own - the table is updated by hand when someone re-checks.'  

**F-E12-19 — Stale Content**  
Before: 'Researched 2026-09-07' with no statement about refresh.  
After: Note adds the computed age and 'No task or routine refreshes this table - it moves only when someone re-researches it in a Claude session.' Values unchanged.  

**F-E12-25 — Bug**  
Before: Base commit 508ebae: same three failures, 145 undefined names.  
After: After this work: same three failures, 137 undefined names, zero NEW names versus the base commit (checked by set difference). No real duplicate id exists in the static markup - verified separately. The runtime harness is a clean PASS: 0 exceptions, 0 safeRun failures, 0 missing ids, 48 containers rendered.  

**F-E2-10 — Stale Content**  
Before: Closing note described only the Sep 7 verification win.  
After: Closing note adds: 'The memo card above is still that Sep 7 run: no later run has written a memo.'  

**F-E2-14 — Automation Opportunity**  
Before: 'Queue a lookup here and a Claude Code session on the Mac runs it' - no task, no cadence, no last-run evidence.  
After: Names openterminal-remote-queue, its hourly 6:45 AM - 9:45 PM PT window and its last clean run, so a queued lookup carries an expected turnaround. The snapshot task is a recommendation only - nothing can be installed on the Mac from here.  

**F-E2-17 — Current State**  
Before: n/a - checked rather than changed.  
After: Connector-list and retirement copy for You.com lives outside E2's regions (E6 owns the connector table).  

**F-E2-18 — Skill**  
Before: 'the dedicated apex-trader skill exists but hasn't reliably stayed installed on Desktop'  
After: Unchanged. If Steven confirms it now stays installed, the sentence should become a plain statement and the vanessa-broker fallback kept as a fallback.  

**F-E3-10 — Current State**  
Before: —  
After: Verified correct; no edit required. Steven owns the five blank expiry dates.  

**F-E3-11 — Current State**  
Before: —  
After: No edit required. Next natural refresh is the Dec 1, 2026 VA COLA and the January OPM tables.  

**F-E3-12 — Current State**  
Before: —  
After: No edit made. Left for E6/the integrator to keep as-is.  

**F-E3-13 — Stale Content**  
Before: plain text status column, no expiry evaluation.  
After: Recommend reusing the new membershipExpiryNote() helper (defined in the memberships block) so the association table flags a lapse the same way.  

**F-E3-15 — Stale Content**  
Before: '… pulled from FUB/Zoho before this can move to Measure.'  
After: Recommend 'pulled from Lofty (lofty-bridge) once the API key lands; Zoho CRM is API-blocked and Follow Up Boss was retired 2026-09-22' — applied to the live dmaicProjects doc, not just the seed.  

**F-E3-17 — Current State**  
Before: 'Snapshot — refreshed automatically once a day' (undated).  
After: Should carry the liveFeeds topPerformersLiveList checkedAt stamp and the real task name, per E2's assignment.  

**F-E4a-13 — Current State**  
Before: Deck implied a healthy Composio→FUB path.  
After: Connectivity card states the connection still reports ACTIVE while failing authentication, and that every FUB dependency is being retired.  

**F-E4a-15 — Current State**  
Before: n/a  
After: Old identifiers retained and documented in a block comment above FUB_SYNC_AT; new Lofty identifiers added alongside.  

**F-E4b-12 — Stale Content**  
Before: FRESH_FEEDERS credits feeds-weekly with a daily 9:40 PM write it has not made since 2026-09-17.  
After: Not changed - outside E4b's regions. Recommend naming the Claude-session fallback and feeds-weekly's 'limited' status.  

**F-E4b-13 — Current State**  
Before: 39 / 61  
After: 39 / 61 (unchanged; confirmed by literal parse, not by reading the card copy)  

**F-E4b-15 — Bug**  
Before: 'Pull the record from the Riverside County County assessor'  
After: 'Riverside County treasurer-tax-collector link below' / 'County of record: Riverside County, CA.'  

**F-E4b-17 — Current State**  
Before: Seed San Diego $937,251 / DOM 29 / +2.4%; Temecula $739,630 / DOM 37 / +2.0%; no Murrieta.  
After: Seed unchanged per brief; merged view now correct on any synced device. Decision recorded for the integrator.  

**F-E5-10 — Stale Content**  
Before: '11 metrics, 0 nights of sleep, 3 workouts in the last 14 days · 19 export batches received.'  
After: '... in the 14 days ending 2026-09-13 · 19 export batches received · this snapshot is 9 days old, not today's data.'  

**F-E5-13 — Stale Content**  
Before: Avatar glyph 'C' on the Kevin card.  
After: Avatar glyph 'K'; two non-visible Cole/kevin-mentor strings listed for the integrator.  

**F-E5-22 — Current State**  
Before: 'Synced 2026-09-03 · N showing ...' — read as though the listings were synced by something.  
After: 'Listings researched 2026-09-03 and baked into this page ... the weekly cloud routine ... writes no document this page reads, so nothing here has been re-verified since 2026-09-03.'  

**F-E5-23 — Current State**  
Before: 'synced from Canvas calendar, 2026-08-28'.  
After: 'deadlines synced from the Canvas calendar on 2026-08-28 and unchanged since. The weekly cloud routine R19 ... writes no deadline document, so re-check Canvas before the Week 4 dates.'  

**F-E5-24 — Current State**  
Before: n/a — verification only.  
After: Confirmed live; no edit made.  

**F-E5-26 — Current State**  
Before: n/a — audit only.  
After: Zero You.com call sites or credits in E5 regions; no button left that silently fails.  

**F-E6-02 — Current State**  
Before: 5 rows, no task names  
After: iMessage/Discord rows carry vanessa-imessage-inbox (10 min, ok 2026-09-21 9:01 PM PT) and vanessa-discord-inbox (5 min); new rows Vanessa Live (manual start, Mac awake) and Local Bridge queue (hourly 6 AM–9 PM PT, ok 8:25 PM PT)  

**F-E6-04 — Stale Content**  
Before: note: '6:20 AM / 12:20 PM / 5:20 PM'  
After: page says hourly; doc note still stale  

**F-E6-23 — Unlisted Capability**  
Before: not listed  
After: listed as proposal in the Agents row and Orca card  

**F-E6-24 — Stale Content**  
Before: 113 / 37  
After: 172 / 60  

**F-E6-28 — Bug**  
Before: 'the ops-knowledge-graph task writes it after each Sunday rebuild'  
After: 'the fabric-deck-sync task writes it every two hours, 7 AM–9 PM PT'  

**F-E6-29 — Bug**  
Before: '\\u2014' visible on screen  
After: em dash  

**F-E6-30 — Stale Content**  
Before: Kevin vs cole-mentor  
After: Kevin kept; drift recorded on the seat  

**F-E6-31 — Stale Content**  
Before: 'Fable masterminds · Opus researches · Sonnet executes'; 'seven executives'  
After: 'Fable 5.1 masterminds · Opus 5 judges · Sonnet 5 executes · Perplexity researches'; 'eight executives (including the CTO Innovator)'  

**F-E7-07 — Bug**  
Before: vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip — referenced, never present  
After: either add the markup or delete the dead wiring; the harness's missingIds list is the regression test  

**F-E7-08 — Bug**  
Before: var cnt = $("travelVisibleCount"); if (cnt) cnt.textContent = shown + " shown"; renderTravelFilters();  
After: renderTravelFilters(); then read and fill travelVisibleCount  

**F-E7-14 — Bug**  
Before: full re-walk of every panel stamp on a 400 ms debounce after each edit  
After: stamp only the panel whose key changed  

**F-E7-15 — Current State**  
Before: no runtime coverage statement anywhere  
After: tests/stress-report.md documents the scope and the exact rerun commands  

**F-E8-10 — Current State**  
Before: Model tiering is already pinned per agent (loopLog cycle 5 F-033); Steven's 2026-09-22 tiering (Fable 5.1 masterminds / Opus 5 executives / Sonnet 5 execution / Perplexity research) matches the roster except that executive seats are labelled 'opus' without a version.  
After: E6 shows the tiering on the org chart; no roster change needed this cycle.  

**F-E8-17 — Stale Content**  
Before: 12 MCP / 169 agents; Orca not installed; cloud twin routine picks up the queue.  
After: Counts derived from toolkitSnapshot at render time; Orca reconciled honestly; twin queue worked by steve-twin-sweep weekdays 12:55 PT (E6 assignment).  

**F-E8-19 — Stale Content**  
Before: 'real automation already in place — not aspirational'  
After: Inventory rewritten from cloud-routines.md and routineHealth with last-run status per routine (E5 assignment).  

**F-E8-21 — Stale Content**  
Before: Two names for one seat across surfaces.  
After: Steven renames either the skill (cole-mentor → kevin-mentor) or the seat.  

**F-E8-28 — Bug**  
Before: Green status for a task that cannot do its job.  
After: r7 writes plaidBalances {status:'not-configured', checkedAt} and the board shows it grey; no key = no green.  

**F-E8-42 — Automation Opportunity**  
Before: Slack read only when the twin remembers.  
After: Slack in the same triage doc; nothing is sent.  

**F-E8-43 — Automation Opportunity**  
Before: Subscriptions unknown; Plaid blocked.  
After: CSV-driven monthly audit until Plaid keys exist.  

**F-E8-44 — Automation Opportunity**  
Before: Manual Canvas → deck copy.  
After: Canvas iCal in calendarSnapshot; uscDeadlines derived.  

**F-E8-46 — Automation Opportunity**  
Before: Fixed 3x/day runs on an empty queue.  
After: Runs only when there is a request; status doc still written daily.  

**F-E8-47 — Automation Opportunity**  
Before: Approval only from the deck; drafts age for 9 days.  
After: Approve/decline from the phone thread; audit line in marketingQueue.  

**F-E8-48 — Automation Opportunity**  
Before: Pipeline rows without dates or amounts.  
After: Dated, scored prospects monthly; eligibility gaps named.  

**F-E8-53 — AI Clone**  
Before: Listed as a future build with no gate.  
After: Explicit 'not this quarter' with the two preconditions (measured speed-to-lead, ISA seat decision) written on the card.  

**F-E8-62 — Plugin/Integration**  
Before: Two names (Vanessa/Jasmine), two numbers, one live channel.  
After: One identity name on the channel; allow-list trimmed to numbers that exist; 'not for clients' rule in CONNECTIONS.md.  

**F-E8-63 — Plugin/Integration**  
Before: Connector lists mix connected, reconnect-needed and never-connected.  
After: Every connector list carries one of: connected / needs reconnect (Canva) / not connected / retired (You.com 2026-09-22).  

**F-E8-74 — Unlisted Capability**  
Before: One dead pipeline, two manual imports.  
After: apple-health-notion (E11b) primary; health-export-mcp documented as the optional second source; daemon retired from the card.  

**F-E8-75 — Unlisted Capability**  
Before: All CRM monitoring is cron polling.  
After: One webhook pilot (Lofty new-lead) into the apination inbox after ecc-security-steward review.  

**F-E8-76 — Unlisted Capability**  
Before: Meeting outcomes live in Steven's head.  
After: Opt-in per meeting; transcript summarised by the twin into a CRM note draft and the vault's 70-Briefs.  

**F-E8-77 — Unlisted Capability**  
Before: Copy-a-prompt buttons where a queued verb exists.  
After: Buttons queue the bridge verb and show the result row; prompt copy stays as fallback.  

**F-INT-01 — Bug**  
Before: </script>\n</body></html>\n</body></html>\n</body></html>  
After: </script>\n</body>\n</html>  

## By category

- Stale Content: 70
- Bug: 58
- Current State: 49
- Routine: 26
- Plugin/Integration: 25
- Automation Opportunity: 19
- Skill: 10
- ISA Coverage: 9
- Orchestrator Agent: 8
- Unlisted Capability: 8
- AI Clone: 3

---

## 2026-09-22 — "Fix everything" engineering pass (folded in by X2)

**Folded in at 2026-09-22 15:21 UTC:** `findings-FR1.json`, `findings-FR2.json`, `findings-FR3.json`, `findings-FR4.json`, `findings-FR5a.json`, `findings-FR5b.json`, `findings-M1.json`, `findings-M2.json`, `findings-M3.json`, `findings-M4.json`, `findings-M5.json`, `findings-M6.json`, `findings-L1.json`, `findings-L2.json`, `findings-L3.json`, `findings-S1.json`, `findings-V1.json`, `findings-V2.json`, `findings-W1.json`, `findings-W2.json`, `findings-X2.json` — **313 rows.** Twenty engineers worked the deck (scratchpad deck repo, master `ee42e30`), the ISA Portal
(scratchpad portal repo, master `cf89bab`), the brain repo (`claude/stoic-cori-pvn3f8`) and the Command Deck store
(read by X2 from the 14:37 UTC export under `scratchpad/all/state`). Deck and portal commit ids below refer to those two
scratchpad repositories; brain commit ids refer to this repository.

**How the two schemas were folded.** Cycle-schema files (FR1–FR4, FR5a, FR5b) keep every field their engineer wrote.
Flat-schema files (`{id, severity, area, finding, evidence, fix, halt}`) are mapped as: Category ← `area`; Finding ← `finding`;
Pri ← `severity` (critical/high → P1, medium → P2, low/info → P3 — the original word is kept in the JSON twin as `severity`);
Eff ← not recorded (—); `halt` ← the engineer's own flag, never changed. **Status, Resolution, Test, Resolved and Owner for
flat rows were adjudicated by X2 against the tree**: a row is *Fixed* or *Implemented* only where X2 could point at the fix
(a commit, a file line, a store version — named in the *X2 verification* line of the evidence section and in the JSON `fixRef`);
*Documented* records a verdict or a test result; *Recommended* awaits a decision; *Escalated* is used only where the engineer
set `halt: true`; everything else is *Open*, and says so.

**In one line:** 145 rows fixed or implemented today with the fix located; 59 halted for Steven; 168 not resolved (open, escalated, recommended, or a recorded verdict). Contradictions between engineers are recorded as F-X2-03…07 and F-X2-18, not resolved by picking a side.

### Totals (2026-09-22 rows)

| By priority | | By resolution | | By owner | |
|---|---|---|---|---|---|
| P1 | 82 | Fixed | 124 | Steven | 44 |
| P2 | 132 | Open | 55 | M4 | 25 |
| P3 | 99 | Documented | 51 | Integration Engineer | 19 |
|  |  | Escalated | 45 | FR2 (Life & Wealth freshness) | 15 |
|  |  | Implemented | 21 | W1 | 15 |
|  |  | Improved | 9 | M6 | 15 |
|  |  | Recommended | 8 | Integration Engineer (FR5b's failover) | 12 |
|  |  |  |  | FR3 | 10 |
|  |  |  |  | integrator | 9 |
|  |  |  |  | L2 | 8 |
|  |  |  |  | S1 | 8 |
|  |  |  |  | V1 | 8 |
|  |  |  |  | X2 | 8 |
|  |  |  |  | M1 | 7 |
|  |  |  |  | M3 | 7 |
|  |  |  |  | V2 | 7 |
|  |  |  |  | L1 | 6 |
|  |  |  |  | L3 | 6 |
|  |  |  |  | V1 (mac-verify.sh owner) | 6 |
|  |  |  |  | FR4 | 5 |
|  |  |  |  | Steven (decision) | 5 |
|  |  |  |  | FR1 | 4 |
|  |  |  |  | M2 | 4 |
|  |  |  |  | M5 | 4 |
|  |  |  |  | W2 | 3 |
|  |  |  |  | Steven / next Mac session | 3 |
|  |  |  |  | Steven (first run on the Mac) | 2 |
|  |  |  |  | Derek (CTO lane) | 2 |
|  |  |  |  | W2 + integrator | 2 |
|  |  |  |  | coordinator | 2 |
|  |  |  |  | FR1 (spot-check: Steven / Mac session) | 1 |
|  |  |  |  | ecc-security-steward | 1 |
|  |  |  |  | Steven (ECC review sign-off date) | 1 |
|  |  |  |  | Steven (wire or drop) | 1 |
|  |  |  |  | Steven (key value) | 1 |
|  |  |  |  | Steven (funded account, optional) | 1 |
|  |  |  |  | Steven (http_api routine) | 1 |
|  |  |  |  | Steven (the four http_api links) / next natural firings | 1 |
|  |  |  |  | Steven / next Mac session (CRMLS IDX count) | 1 |
|  |  |  |  | FR1 (follow-up: Steven / Mac session) | 1 |
|  |  |  |  | Derek (CTO lane) / Steven on the Mac | 1 |
|  |  |  |  | Derek (CTO lane) / Steven (egress allow-list is an account/infra decision) | 1 |
|  |  |  |  | CTO Innovator / Steven (egress allow-list) | 1 |
|  |  |  |  | FR4 / daily feed task | 1 |
|  |  |  |  | integrator / Derek (CTO lane) / Steven (egress or search budget is an account setting) | 1 |
|  |  |  |  | Alexandra (Compliance) | 1 |
|  |  |  |  | Elena (CISO) | 1 |
|  |  |  |  | Steven (with F-L1-04 / F-L2-03) | 1 |
|  |  |  |  | M1 + M4 | 1 |
|  |  |  |  | M2 + integrator | 1 |
|  |  |  |  | Integration Engineer (FR5b) | 1 |
|  |  |  |  | Alexandra drafts, Steven decides | 1 |
|  |  |  |  | FR2 | 1 |
|  |  |  |  | unrecorded | 1 |
|  |  |  |  | Steven (decide: paste §6 yourself or authorise an agent — F-W2-06 says meta_mcp) | 1 |
|  |  |  |  | Integration Engineer (README cases); Steven (runs the widened canary before the runner is re-pointed) | 1 |
|  |  |  |  | X1 | 1 |
|  |  |  |  | Steven (one-line decision; Branch A recommended) | 1 |
|  |  |  |  | coordinator (agent may apply per W2 — contradicts F-M5-07) or Steven | 1 |
|  |  |  |  | next Top Performers research pass (Mac) | 1 |
|  |  |  |  | mortgage-rates-daily (claude-runner) | 1 |
|  |  |  |  | Integrator | 1 |
|  |  |  |  | Derek (CTO) / Steven | 1 |
|  |  |  |  | weather-news-refresh Mac task / FR4 | 1 |
|  |  |  |  | FR1 / next market refresh | 1 |
|  |  |  |  | daily feed task | 1 |
|  |  |  |  | Reliability Engineer | 1 |
|  |  |  |  | L1 (label); Steven (Google-side rename, optional) | 1 |
|  |  |  |  | re-check after the first phone run (F-M6-15) | 1 |
|  |  |  |  | CTO Innovator (routine spec owner) | 1 |
|  |  |  |  | next freshness audit (someone who checks panel-tools) | 1 |
|  |  |  |  | W2 (check for feedFreshness after 16:12Z) | 1 |

By original severity (flat-schema rows): (cycle schema) 84, medium 74, high 48, low 33, P2 27, P1 17, info 15, P3 12, critical 3.

### Earlier findings changed by the 2026-09-22 pass (37)

| Earlier id | Change | Resolved by / evidence |
|---|---|---|
| F-E1-13 | note added; status unchanged | Pass — repo mirrors of the four task prompts rewritten around Lofty by F-L3-06; the live Mac prompts and LOFTY_API_KEY remain Steven's (keyfile step added by F-V1-02). |
| F-E1-14 | Escalated → Fixed (2026-09-22) | Pass — superseded: the cloud backup writer (F-INT-07) took the 2026-09-22 backup; backupStatus lastBackup 2026-09-22, verified true (14:37 UTC export). r6-weekly-backup itself still never ran; whether to disable it is F-E11A-02. Card copy was fixed on 2026-09-22. |
| F-E11A-02 | note added; status unchanged | Fail — still Steven's: the cloud writer (Sun 11:00 UTC, 8-week prune) now takes the backup; decide whether that schedule and root replace the spec and whether r6 is disabled. |
| F-E12-04 | note added; status unchanged | Pending — same question carried by F-L2-08 and F-L3-12; the portal now tells the ISA to confirm with Steven before using the line. |
| F-E12-11 | description redacted (client identifiers withheld) | Read live on 2026-09-22: this portal's pipeline document holds 2 mortgage deals [client identifiers withheld by X2 — the source row quoted initial-plus-surname names with loan amounts and stages]. Command Deck's pipeline document is an empty list, version 3, untouched since 2026-09-12. |
| F-E12-12 | description redacted (client identifiers withheld) | This portal holds 2 real-estate clients [client identifiers withheld by X2 — the source row quoted initial-plus-surname names with roles and stages]. On Command Deck the reClients document does not exist at all - it has never been created there. |
| F-E12-15 | note added; status unchanged | Pass — F-M4-05/06 changed the deck's guidance: re-enabling the hourly cloud bridge is now the recommended move since cloud writes work (F-INT-08); enabling it is a routine change (Steven or a web-UI-created routine). |
| F-E12-22 | note added; status unchanged | Pending — loftyLeads exists in the 14:37 export with status not-configured (syncedAt 2026-09-22T08:45:00Z); still no key. |
| F-E4a-02 | note added; status unchanged | Pending — loftyLeads doc now exists with status not-configured (14:37 export); the key is still missing. |
| F-E5-02 | note added; status unchanged | Pending — writer identified 2026-09-22 as the Mac task strava-daily-sync (F-M5-01, cron 20 5 * * * PT = 12:20 UTC); paste-ready corrected prompt in routines/mac-task-repairs.md §1 (F-W2-01). Only Steven can apply it, before 2026-09-23 12:20 UTC. |
| F-E5-08 | note added; status unchanged | Pending — decision packet: routines/mac-task-repairs.md §3 (F-W2-03) recommends retiring r8 and using the Notion phone route (F-M6-15). |
| F-E6-07 | note added; status unchanged | Pending — decision packet docs/ISA-SEAT-DECISION.md: pick a COA by Fri 2026-09-25; the escalation ladder routine runs weekdays (F-M5-12). |
| F-E7-01 | Open → Fixed (2026-09-22) | Pass — deck edfa24a (2026-09-22 09:17 UTC): window.claude.use('db') wrapped in try/catch and falls back to local-only (command-deck.html ~7577); full sweep 62 tests, 0 failures. |
| F-E7-03 | Open → Fixed (2026-09-22) | Pass — at the document: rewritten as {v:{…}} by F-FR2-14 (state/stravaSnapshot v9, 13:05 UTC), read back wrapped by F-M5-02, F-M6-13, F-W2-01 and in the 14:37 UTC export. The writer still emits the bare shape (F-W2-01, deadline 2026-09-23 12:20 UTC). |
| F-E8-01 | note added; status unchanged | Pending — same as F-E1-13: LOFTY_API_KEY into ~/.config/lofty/.env (MAC-SETUP.sh now creates the empty file, F-V1-02), then the four Mac task prompts (F-L3-06). |
| F-E8-05 | Escalated → Fixed (2026-09-22) | Pass — superseded by the cloud backup writer (F-INT-07); the backup path/cron decision remains F-E11A-02. |
| F-E8-06 | note added; status unchanged | Pending — same packet as F-E6-07. |
| F-E8-29 | Open → Fixed (2026-09-22) | Pass — same fix as F-E7-03: document v9 wrapped (F-FR2-14); writer fix pending under F-W2-01. |
| F-E8-64 | note added; status unchanged | Fail — the 'write_db parks' explanation is disproved (F-INT-08). F-W2-07 measured this routine dying 5.7 s after firing on 2026-09-18 — a startup failure shared by nine routines, not its prompt. created_via http_api: only Steven can edit it (link in routines/mac-task-repairs.md §7). |
| F-E8-72 | note added; status unchanged | Pending — same packet as F-E6-07. |
| F-E11A-06 | note added; status unchanged | Pending — same item as F-L1-05 / F-L3-02: the fub-followups folder rename is a Mac action. |
| F-E12-21 | note added; status unchanged | Pending — the carrier now exists: the Pipeline Sync (live) routine syncs isaGradingScores and isaKpiSopActuals both ways (F-M5-12); the decision whether they reach Steven automatically is still open. |
| F-E4a-05 | Open → Improved | Pending — a zohoSync document now exists (status blocked, checkedAt 2026-09-22T08:17:00Z, written by the audit session's own test); no Zoho re-test routine appears in the 2026-09-22 routine listing (F-X2-10), so the 'every few hours' claim has no routine behind it. |
| F-E4a-12 | note added; status unchanged | Pending — install is now scripted (F-S1-18, MAC-SETUP.sh --only cli-anything); generation on the Mac and the ECC review remain Steven's. |
| F-E7-02 | Open → Fixed (2026-09-22) | Pass — deck 109d9d5 (12:59 UTC): a non-array citations field is replaced with [] at the document boundary and recorded with lsShapeWarn (~22854-22856). |
| F-E7-04 | Open → Fixed (2026-09-22) | Pass — deck 109d9d5: renderIsaLine renders only the last ISA_LINE_MAX messages and says how many are held back (~26195-26197). |
| F-E7-05 | Open → Fixed (2026-09-22) | Pass — deck b63ff97 (08:56 UTC): id-less messages get a deterministic noid-<hash> instead of being dropped (~26096-26100); the same fix as F-E12-06 on the portal. Was never marked in the table. |
| F-E7-06 | Open → Fixed (2026-09-22) | Pass — deck b63ff97: lsSetLocal records LS_WRITE_FAILURES and warns instead of an empty catch (~6979-6985); same fix as F-E12-07. Was never marked in the table. |
| F-E7-10 | Recommended → Implemented (2026-09-22) | Pass — deck 109d9d5: LS_FOOTPRINT_WARN_BYTES (4 MB) + lsFootprintAlerts() (~6997-7012) and the isaLine display cap (F-E7-04); a cap on routineHealth rows was not verified by X2. |
| F-E7-12 | Escalated → Fixed (2026-09-22) | Pass — superseded by the cloud backup writer (F-INT-07): backupStatus lastBackup 2026-09-22, verified true, consecutiveFailures 0. 'Run now' on r6 is no longer required; disabling r6 is the remaining decision (F-E11A-02). |
| F-E8-08 | note added; status unchanged | Pending — same as F-E5-08 / F-W2-03 / F-M6-15: one phone run plus the r8 decision. |
| F-E8-58 | note added; status unchanged | Pending — see F-S1-07/F-S1-18: install scripted, generation manual; DOMShell risk (F-S1-06) and Alexandra's terms gate (F-FR5b-11) precede any wrapper. |
| F-E8-59 | note added; status unchanged | Pending — same as F-E4a-13 / F-L3-07. |
| F-E8-60 | note added; status unchanged | Fail — replacement launcher written (F-FR5b-05/06) but its PII gate fails open on argument order, default and name matching (F-V2-07..09); do not close until the widened canary (F-V2-20) passes on the Mac. |
| F-E4a-13 | note added; status unchanged | Pending — the inventory row was removed from integrations/CONNECTIONS.md by F-L3-07; the connection and key are still Steven's to delete/revoke. |
| F-E7-07 | Open → Improved | Fail — deck 109d9d5 added the isaPbTracker/isaPbVip markup (4368-4369) and removed the two voice toggles (25132); vanessaMicBtn and steveMicBtn are still looked up (25136-25137) and absent — the harness still reports 2 missing ids after the W1 merge (F-FR5b-14). |
| F-E7-08 | Open → Fixed (2026-09-22) | Pass — deck 109d9d5: renderTravelFilters() now runs before the travelVisibleCount read (~19051-19052). |

### Halted — waiting on Steven (2026-09-22 rows, 59)

- **F-FR2-15** — Something wrote stravaSnapshot UNWRAPPED at 2026-09-22T12:32:36Z (version 7: one activity, syncedAt 12:32:14Z, no via) — 18 minutes before this pass started. The document is now co  
  *Writer identified after this row was written: the Mac task strava-daily-sync (F-M5-01). Its prompt lives on the Mac; paste-ready fix in routines/mac-task-repairs.md §1, deadline 2026-09-23 12:20 UTC (F-W2-01).*
- **F-FR5b-06** — While routed to free providers no client PII, loan-file text, CRM record, ISA-line content, credit or health data may leave the Mac. Written into the launcher as a mode flag every   
  *The canary must be run on the Mac by Steven with the security steward before the runner is pointed at claude-auto.*
- **F-L3-06** — Three files under docs/inventory are stamped mirrors of live Mac documents: agent-roster.md (aiTeamRoster, generatedAt 2026-09-16), mac-task-descriptions.md (toolkitSnapshot, synce  
  *Rewritten around Lofty with an explicit "not connected yet — needs LOFTY_API_KEY in ~/.config/lofty/.env" on every task entry, so the repo never claims a live Lofty feed. Editing the live prompts is a HALT: Steven applies them on the Mac, then the next snapshot re-syncs this repo.*
- **F-L3-12** — An existing open finding records a calling number and a forwarding email address on the retired CRM's own domain that the human ISA is instructed to use on every lead call. Whether  
  *Not touched — it is a dated finding and the values are contact details. HALT: Steven confirms whether the line and the forwarding address moved to Lofty before any ISA-facing text is changed.*
- **F-M1-05** — There is no mechanism preventing two Macs from running the same 59 claude-runner tasks at once. Both would write the same documents: duplicate ciLog rows, isaLine messages sent twi  
  *REMOTE-ACCESS.md now specifies a PRIMARY/STANDBY lease: a taskLease doc {v:{holder, hostname, acquiredAt, expiresAt}} with a 90-minute TTL, a copyable five-step LEASE CHECK for the top of every task prompt that pins its write with if_version and re-reads to close the both-created-it-at-once race, an*
- **F-M3-03** — The installer never prompts for, echoes, logs or stores a secret value. Where a tool needs a key it creates ~/.config/<tool>/.env under umask 077, chmod 600, containing the variabl  
  *Steven fills the four values by hand, then `omniroute providers add <id> --credential-env <NAME>` per FR5b. No value ever enters this repo, a prompt, or a task.*
- **F-M3-09** — The inventory records an existing claude-auto on the Mac with an unverified client-data guard hook (F-E8-60), and FR5b's design replaces it rather than running beside it. MAC-SETUP  
  *Steven diffs the two, replaces the old launcher himself, then runs the PII canary with the security steward before the runner is pointed at it.*
- **F-M3-10** — Reported as NEEDS-STEVEN and never performed: installing Homebrew (the script refuses to pipe a network installer into a shell); `graphify install --platform claude` (it appends to  
  *Steven works the NEEDS-STEVEN list the installer prints, in order, then re-runs mac-verify.sh.*
- **F-M5-01** — The writer corrupting stravaSnapshot is the Mac runner task strava-daily-sync. It writes the document body bare ({activities,syncedAt,via}) instead of {v:{...}}. The live cloud rou  
  *Correct the strava-daily-sync task prompt on the Mac to write data:{v:{activities,syncedAt,via}} rather than the bare body. Repo-side specs that taught the bare shape have been corrected (F-M5-04). Confirm on the Mac with: claude-runner task show strava-daily-sync (or the task's prompt file) and loo*
- **F-M5-08** — The old web-created Pipeline Sync routine is still running and still lying. It fired again at 13:08 UTC today and reported SUCCEEDED, having synced nothing - its own prompt is RESE  
  *Steven disables it at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE. Recorded in always-on/README.md.*
- **F-S1-05** — CLI-Hub's telemetry is opt-OUT. cli_hub/analytics.py ships a PostHog project token and fires on install, uninstall, launch and every 'cli-hub call'. The payload carries the machine  
  *CLI_HUB_NO_ANALYTICS=1 set in the runner's shell profile BEFORE the first cli-hub command, not typed once per session. Added as an explicit Env row in mac-task-specs.md section 4, as the first line of the install block in SKILL.md, and as a visible note on the deck card.*
- **F-S1-06** — The read path for all five web targets is DOMShell, a third-party Chrome extension with page-content access, driving a Chrome session already logged into Lofty, SkySlope and zipFor  
  *Named explicitly in the skill's security section, in mac-task-specs.md section 4, and on the deck card — as a risk for Steven to accept deliberately, not as a footnote. It is part of what the ECC security review has to weigh before SkySlope and zipForms are built at all.*
- **F-S1-07** — CLI-Anything is not installed on Steven's Mac and cannot be installed from a cloud session. It was installed and exercised once in a throwaway cloud sandbox (cli-anything-hub 0.4.1  
  *The deliverable is a specification plus a dashboard surface that reports the real state, not a connection. The deck card's default with no document is 'not-installed', and it distinguishes the sandbox proof from the Mac's state in so many words.*
- **F-S1-08** — Every outward ShowingTime verb writes to a client-facing system, which is on CLAUDE.md's HALT list. showing request sends an appointment request to a listing agent and through them  
  *Specified and NOT built. On the browser path every one of these is an 'act click'/'act type' underneath, and the task's Bash allow-list denies 'act' outright, so the denial is mechanical rather than a request to behave. Each verb needs Steven's written approval for that one verb on that one target b*
- **F-S1-09** — Posting a Showami request hires a licensed person and charges Steven's card — the first line of the HALT list (spends money) and a third party dispatched to a stranger's door, twic  
  *Specified and NOT built; same 'act' denial as F-S1-08. The existing manual Open Showami / Copy Showami request buttons in the route card are deliberately left in place — copy-paste keeps a human between Steven and a booking, and it is the only path that functions today.*
- **F-S1-10** — SkySlope and zipForms touch legally binding documents. esign send is a signature request to a client or co-op agent — a licensed act, unrecallable once opened; packet send delivers  
  *Both are steps 4 and 5 in the build order, gated on an ECC security review WITH A SIGN-OFF DATE. The deck card enforces this rather than just describing it: a status document claiming read-only-live for either target without an eccReviewedAt date is clamped back to disabled-by-policy and the row say*
- **F-S1-11** — Building a CLI-Anything browser wrapper for Lofty would be strictly worse than what already exists. Lofty has a documented REST API (api.lofty.com/v1.0, Authorization: token <key>)  
  *The skill carries an explicit blockquote: the API stays the recommendation, and a CLI-Anything wrapper is a fallback only for something the API is demonstrably shown not to expose — nothing is known to be missing yet. Lofty is listed in the build order as 'not a CLI-Anything target'. Its deck row re*
- **F-V1-01** — Steven asked for the second brain to be optimised 'with Notion + Drive'. Notion was wired; Google Drive never was, and nothing in the repo said so. There is no Drive connector, no   
  *Path B or C needs a new Google OAuth grant on Steven's account — a credential and an account change, two HALT rows. Nothing was granted, installed or connected. The choice between wiring it and dropping it is Steven's.*
- **F-V1-02** — Steven asked to 'setup lofty/zipforms/skyslope/zoho/homes.com using anything cli'. S1's answer for Lofty was correct and stands — Lofty is NOT a CLI-Anything target because it has   
  *Generating the Lofty API key is a credential action on a client-facing CRM. The script creates an empty file and nothing else; the value and the first lofty-crm-sync run are Steven's.*
- **F-V1-03** — Steven asked for the Higgsfield API and named it alongside a third-party test client. That repo is REFUSED, correctly and permanently, because it commits a live-looking credential.  
  *A funded Higgsfield account and both key values — a spend decision and a credential. Nothing was purchased, called or configured.*
- **F-W2-01** — strava-daily-sync writes its document body bare instead of {v:<value>}, and re-breaks the hand repair on every run. The next run is a hard deadline: cron '20 5 * * *' Mac-local PT   
  *Paste-ready corrected prompt written to routines/mac-task-repairs.md section 1, stating the wrapper contract with a worked CORRECT/WRONG example pair per the ciLog {date,text} precedent, specifying 'set' rather than 'update' so no stray top-level key can survive, a read-back assertion, and a UTC-clo*
- **F-W2-02** — PREMISE OVERTURNED BY THE STORE. runnerStatus did not stop being written at 04:05 UTC - it is alive and was written at ~14:06 UTC today. What is broken is the timestamp inside it:   
  *Cheapest-first diagnostic sequence written to routines/mac-task-repairs.md section 2: (1) free re-read comparing v.syncedAt to the document's own server updatedAt, (2) launchctl list for the runner, (3) grep the fabric writer for a 'date' call building syncedAt - the bug is 'date +%Y-%m-%dT%H:%M:%SZ*
- **F-W2-04** — TWO BRIEFED ITEMS ARE ONE SUBJECT. r4-quantvue-sync writes strategySnapshot - there is no missing QuantVue document and none was ever expected - and it is 'refused', not silent. It  
  *The question the brief said might need putting to Steven does not need putting - the repo settles it. routines/mac-task-repairs.md section 4 gives the paste that pulls the task's allow-list and the refused tool or path out of the log, so the fix is named rather than guessed. Likely the outbound fetc*
- **F-W2-05** — The strategy cycle is trig_011CXFHCT3hou6uaCfb5rWkC, and it is the research-only-prompt pattern confirmed by its own text: it SUCCEEDS on schedule and has no write step at all. str  
  *Full corrected prompt written to routines/mac-task-repairs.md section 5 - writes strategySnapshot in the shape the live document already uses (asOf, flags, history, sourceUrl, strategies as {name, mtdPct, ytdPct}, syncedAt), states the {v:<value>} contract with a CORRECT/WRONG example pair, pins the*
- **F-X2-09** — The master table and its data twin carried initial-plus-surname client identifiers with loan amounts and stages (F-E12-11, F-E12-12), and findings-L1.json quotes one lead's first n  
  *Redacted in the regenerated docs/MASTER-FINDINGS.md and docs/data/auditFindings.json in this pass. Not edited: the source rows in findings-E12.json and findings-L1.json (dated records) and the live auditFindings document in the Command Deck store (seeded 09:51 UTC, 285 rows) — Steven or the coordina*
- **F-FR5a-01** — Local context-compression proxy for Claude Code (headroom wrap claude / headroom proxy :8787 / MCP mode). Verified in the sandbox: pip install headroom-ai exit 0, headroom --versio  
  *Mac action: install and wrap a live Claude Code session; routes API traffic through a local proxy*
- **F-FR5a-02** — The brain's L4 knowledge graph tool. Real install path confirmed: pipx install graphifyy && graphify install writes ~/.claude/skills/graphify/SKILL.md + references/ and appends to   
  *Mac action: install; the README fix is an edit to a brain file the Integration Engineer can draft but Steven owns*
- **F-FR5a-03** — Local-first token/cost tracker that reads ~/.claude/projects/ session logs and 40 other tools; codeburn overview / web / menubar / budget / optimize (finds re-read files and ghost   
  *Mac action: install; reads local session logs that contain conversation text*
- **F-FR5b-01** — Both clients cloned and read in full 2026-09-22. whatsapp-cli (MIT, Python) reads the WhatsApp desktop app's local ChatStorage.sqlite read-only and sends via the whatsapp:// URL sc  
  *Needs Steven: a dedicated WhatsApp number (never the client-facing one), linking it in the WhatsApp desktop app on the Mac, granting Full Disk Access and Accessibility, and running the task once by hand.*
- **F-FR5b-05** — Design and scripts for Steven's requirement ('switch to the OmniRoute free LLM models when subscription runs out and back when it refreshes'). Detection = a failed subscription run  
  *Needs Steven on the Mac: OmniRoute dashboard password and API key into ~/.config/omniroute/.env, free provider keys added with omniroute providers add --credential-env, scripts copied, LaunchAgent loaded.*
- **F-FR5b-11** — Their terms may forbid automated access and two of them hold legally binding documents. No Scrapling/Scrapegraph-ai wrapper or CLI-Anything wrapper may be enabled against them unti  
  *Legal/terms interpretation — Alexandra drafts, Steven decides, before any wrapper is enabled.*
- **F-L1-04** — The showings feature stores a per-client CRM link on the property name 'fub' inside the persisted 'showingSchedule' store, mirrors it as 'clientFub' into 'showingSyncRequests', and  
  *Kept the keys. Renaming them would orphan every saved client CRM link and break the showing-sync task's target contract. Everything user-visible around them was fixed instead: the target label already reads 'CRM (not writing - Lofty re-point pending)', the input at line 4301 is labelled 'Lofty lead *
- **F-L1-05** — The deck names a Mac skill directory 'fub-followups'. That is the real on-disk name of an installed skill, and the deck's job in that table is to report what is actually installed   
  *Kept the directory name, removed the 'Follow Up Boss template library' expansion. It now reads 'fub-followups (legacy follow-up template library still under its old directory name on the Mac - rename and port to Lofty)'. Renaming the directory is a change on Steven's Mac, outside this file and outsi*
- **F-L2-03** — Five 'fub' identifiers survive in the showings block and were deliberately NOT renamed: the c.fub client property, the shNewClientFub input id that reads it, clientFub in the queue  
  *Kept per FUB-POLICY.md identifier rule ('a localStorage key that carries saved state must NOT be renamed silently - keep the key, rename everything user-visible, and report it'). Needs Steven: renaming "fub" -> "lofty" as a sync target must be done together with the Mac showing-sync task and a migra*
- **F-L3-02** — `fub-followups` is the real folder name of a skill installed on Steven's Mac (a 393-template client follow-up library). The skills-refresh skill matches it on disk by that exact na  
  *Identifier kept in all four places; every descriptive clause around it rewritten to drop the vendor name and to say it needs porting to Lofty. Renaming the folder is a Mac-side action only Steven can take; the repo should be updated in the same pass if he does.*
- **F-L3-07** — Composio still carries the retired real-estate CRM connection, reported ACTIVE, with an API key that the vendor rejects. That is a dangling credential on the same transport that ca  
  *The vendor's own row removed from CONNECTIONS.md and the slug dropped from the connected-apps list, replaced with "plus one retired legacy-CRM connection Steven can delete at his convenience" so the inventory stays accurate. Disconnecting it and revoking the key are account-level actions — HALT, Ste*
- **F-M1-06** — Roughly a dozen feeds that only need the web and the artifact DB are still pinned to the Mac, and several have never run at all. They are the visible symptom of F-M1-01.  
  *REMOTE-ACCESS.md now names which feeds should move and which cannot, grouped by the actual blocker (local file or daemon, vault files plus the local model, or a connector/Keychain credential). Moving them means creating or editing routines, which an agent may not do.*
- **F-M3-11** — MAC-SETUP.sh installs scrapling and scrapegraphai but points them at nothing. Both steps print the standing gate: Alexandra's written terms + robots.txt check on every target befor  
  *Compliance interpretation is Alexandra's draft and Steven's decision — unchanged by this work.*
- **F-M5-05** — There was no detector for a bare-value write. Two counters already existed and both were calibrated to EXPECT the defect, so a genuine regression would have read as normal.  
  *DONE for the weekly pair: both now expect zero and must name any offending doc id by output. PROPOSED, needs Steven, for same-day coverage: the 'Pipeline Sync (live, writes)' routine (trig_01M5zR1Po44gnHvTwA9ogZaB) already reads the DB at 04/10/16/22 UTC - add one ArtifactData list of 'state' plus a*
- **F-M5-07** — The ISA escalation ladder's proof-of-life field is stamped in the FUTURE. isaLadder.updatedAt reads 2026-09-22T14:35:00Z; the audit ran at 13:32 UTC and the routine last fired 12:5  
  *Correct the routine to stamp updatedAt with the actual write time. Routine edit - Steven's, not an agent's. The run itself was genuine: two isa-ladder rows are in ciLog and the ladder state is coherent.*
- **F-M6-15** — Three things this chain needs are outside what I may do, and none of them were done: the Mac task health-notion-sync is not created, scheduled or enabled; no document in the Comman  
  *Everything is delivered as written spec plus skill, ready to install. The deck's honest line until the first run exists is 'Health Log created and empty — awaiting Steven's first phone run'. Registration steps and the prove-it run are in integrations/mac-task-specs.md §3 and the registration checkli*
- **F-S1-15** — ShowingTime is reached through MLS single sign-on in many markets, CRMLS included, and MFA is common on SkySlope and zipForms. A browser harness that meets a second factor will eit  
  *Kept and made specific: 'MFA/SSO is a HALT, not a puzzle. ShowingTime is MLS-SSO'd in many markets (CRMLS included).' The step-2/3 install prompt tells Steven to stop and say so rather than work around it.*
- **F-V2-05** — find-skills/SKILL.md instructs the agent to install third-party skills globally with confirmations suppressed: `npx skills add <owner/repo@skill> -g -y`. That is unvetted third-par  
  *Add a local note under the provenance header binding Step 6 to the HALT list: search and recommend freely, but any actual `skills add` is a Needs-Steven packet, never an agent action. Not applied — it edits vendored upstream text beyond a broken reference, so Steven should call it.*
- **F-V2-20** — The failover acceptance test only exercises the argument order that passes. README.md:112's PII canary runs `claude-auto --force free --task lofty-crm-sync -p '...'`, which is exac  
  *Add canary cases to the README for: claude args before --task; no --task at all; and a task name not in DEFAULT_PII_TASKS. Each must exit 75 with zero requests reaching :20128 before the runner is pointed at claude-auto.*
- **F-W2-03** — r8-apple-health-snapshot is not erroring as the register recorded - it reports 'ok' twice a day and writes nothing, which is worse, because nothing flags it. The Apple Health inges  
  *One-line decision with a recommendation and the exact action for each branch, in routines/mac-task-repairs.md section 3. Recommended Branch A: disable r8 and health-full-analysis, do the one phone run, verify via healthNotionSync.status leaving 'awaiting-first-phone-run'. Branch B: restart the Healt*
- **F-W2-08** — Real Estate Weekly Brief cannot work as an agent-created routine at all, for two independent reasons, and no prompt rewrite can fix either. It is a decision, not a repair.  
  *Presented as a Steven decision in routines/mac-task-repairs.md section 7: recreate it through the web interface once Lofty is connected, because web-created routines carry connectors, or retire it. Deliberately did NOT write a corrected prompt, because a corrected prompt would still have no connecto*
- **F-W2-09** — Ops Issue Review, Project Risk Review and Books Reconciliation Reminder are stock business-assistant templates aimed at a business that is not Steven's. Even a successful run produ  
  *Recorded in routines/mac-task-repairs.md section 7 as latent defect (a), to be dealt with only AFTER the run failure in F-W2-07 is cleared - there is no point correcting a prompt that is not executing. Retiring Books Reconciliation is the honest call and is stated as such. Deliberately did not inven*
- **F-W2-10** — The old Pipeline Sync routine cannot be disabled by any agent - confirmed for the third time on 2026-09-22 - and it keeps writing a green row for work it is not doing. Steven click  
  *One click, link given in routines/mac-task-repairs.md section 8 and in always-on/README.md. Recorded as the reason routine status cannot be used as evidence anywhere in the register.*
- **F-X2-05** — F-M5-07 says correcting the ISA ladder's stamp is a routine edit that is Steven's; F-W2-06 says the routine was created via meta_mcp so an agent may apply it without Steven. Neithe  
  *Steven decides in one line: paste §6 himself, or authorise the coordinator to apply it (the engagement rule forbade routine edits to every engineer today).*
- **F-FR5a-04** — Lazy-senior-dev ruleset injected on every prompt and every subagent by two Node lifecycle hooks; /ponytail lite|full|ultra|off and review/audit/debt/gain commands. Optional: overla  
  *Mac action: installs hooks that run on every prompt of every Claude Code session (live-behaviour change)*
- **F-FR5a-05** — Two-process web app (FastAPI backend :7001 + Vite frontend :5173, or docker-compose) that turns screenshots/mockups/Figma/recordings into HTML-Tailwind/React. Occasional use for a   
  *Needs a provider API key (spend) and a Mac install*
- **F-FR5a-09** — Read-only codebase analysis that recommends hooks, skills, MCP servers, subagents and slash commands. Sandbox: /plugin marketplace add anthropics/claude-plugins-official and /plugi  
  *Mac action: plugin install into the live Claude Code user scope*
- **F-FR5a-10** — Autonomous AI penetration-testing agent (code, web apps, APIs) running in a Docker sandbox; requires Python >=3.12 and a running Docker daemon. Sandbox: pip on Python 3.11 refused;  
  *Needs an LLM API key (spend), Docker on the Mac, and a written authorization decision for every target*
- **F-FR5a-11** — Installs and health-checks upstream CLIs (twitter-cli, rdt-cli, yt-dlp, OpenCLI, Jina reader, Exa) so an agent can read X, Reddit, YouTube, LinkedIn, Instagram, Facebook, RSS and a  
  *Drives logged-in social accounts (cookies/sessions) and needs a Mac install and a dedicated browser profile decision*
- **F-FR5a-12** — Open prompt library with a TUI, an MCP server and a Claude Code plugin (/prompts.chat:prompts, /prompts.chat:skills, two agents, discovery skills). Sandbox: plugin install verified  
  *Mac action: plugin/MCP install that talks to a remote service*
- **F-FR5a-15** — Boots a virtual iPhone on Apple Silicon (macOS 15+, Xcode + iOS SDK) from Apple's PCC research VM images: downloads and patches IPSW, DFU restore, custom firmware, then screenshots  
  *Would require disabling SIP/AMFI on the production Mac; CISO objection; decision is Steven's*
- **F-FR5a-16** — Hosted/self-hostable MCP server exposing 500+ pay-per-call tools (search, crypto/DeFi data, paid reports, utilities) settled in USDC over x402/MPP or by card (claude mcp add agent4  
  *Spends money by design (per-call USDC or card from an agent); HALT list first line*
- **F-FR5a-17** — A Python library, not an agent tool: small Hugging Face encoder checkpoints (ModernBERT-large 421M / mmBERT-base 322M) that answer typed questions (choice, score, noul = calibrated  
  *Mac action with 1-2 GB of model downloads; any fine-tuning on client data is PII leaving the local model*
- **F-L1-08** — A tracked Google calendar was named after the CRM that created it: 'Follow Up Boss (appointments & tasks)'.  
  *Relabelled 'Legacy CRM calendar (appointments & tasks)' with the note 'a legacy calendar created by the real-estate CRM that Lofty replaced on 2026-09-22; it returned no events on the last sync'. The calendar's actual Google id is unchanged - it is the real address the link resolves to. Renaming the*

### Every finding (2026-09-22 rows)

| ID | Category | Finding | Pri | Eff | Status | Resolution | Test | Resolved | Owner |
|---|---|---|---|---|---|---|---|---|---|
| F-FR1-01 | freshness | Local market snapshot seed was frozen at the Sep 7 hand pull while the live ratesSnapshot document (v9, syncedAt 2026-09-22T02:24:25Z) carried Redfin's August 2026 San Diego County figures and a Murrieta row the seed never had. Re-baked ... | P1 | S | done | Fixed | Pass | 2026-09-22 | FR1 |
| F-FR1-03 | freshness | Every one of the eight rows re-checked against agency, primary or lender-typical sources on 2026-09-22. No figure was contradicted: VA funding fee 2.15% / 3.30% / 1.50% / 1.25%; FHA 2026 limits $541,287 / $1,249,125 with UFMIP 1.75% and ... | P1 | S | done | Fixed | Pass | 2026-09-22 | FR1 |
| F-FR1-09 | freshness | The three rows the daily feed does not carry were 13–20 days stale. Re-baked from the lenders' own rate pages as indexed by search on 2026-09-22 (veteransunited.com, navyfederal.org and bankrate.com are all blocked by this session's egre... | P1 | S | done — spot-check from the Mac recommended | Fixed | Pass | 2026-09-22 | FR1 (spot-check: Steven / Mac session) |
| F-FR2-14 | Bug | The stravaSnapshot document was the one document in collection state stored without the {v:…} wrapper. Read at version 7 (unwrapped, one activity, no via, updatedAt 2026-09-22T12:32:36Z), then written with if_version 7 as {v:{activities:... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-15 | Bug | Something wrote stravaSnapshot UNWRAPPED at 2026-09-22T12:32:36Z (version 7: one activity, syncedAt 12:32:14Z, no via) — 18 minutes before this pass started. The document is now corrected (F-FR2-14), but the writer that produced v7 still... | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-FR3-01 | Stale Content | Stamp was 2026-09-07 and no row carried a source URL. Every one of the 8 rows was re-checked today against 2026 agency-citing sources via WebSearch (direct fetches of va.gov, hud.gov, fhfa.gov and rd.usda.gov are blocked by this session'... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-02 | Stale Content | Both area summaries were a 2026-09-02 snapshot (cached NewHomeSource count, an August national rate-gap claim). Rewritten from the builders' own pages read through Perplexity sonar-pro with domain filters (8 Perplexity calls in the whole... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-03 | Stale Content | The three rows the Command Deck's ratesSnapshot document does not carry were 13-20 days old, and the VA 15-yr row (5.50% / 6.196% APR, labelled 'verified Sep 2') is byte-for-byte Navy Federal's Jan 8, 2026 sheet - a stale figure under a ... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-06 | Stale Content | Only the four rows flagged 'verified Sep 2026' plus Loan United were touched; the array still parses to 61 on this file and on deck/command-deck.html. Change Wholesale: the old note ('lost its Treasury CDFI designation per 2024 reporting... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR4-01 | Freshness | All 7 cities refreshed by hand (Mac task 8:05 AM PT had not run). temp/feelsLike/condition = API Ninjas live observation 13:07 UTC by lat/lon; high/low = today's max / tonight's min from the API Ninjas 3-hourly forecast in each city's lo... | P1 | M | Closed | Fixed | Pass | 2026-09-22 | FR4 |
| F-FR4-04 | Freshness | Global list replaced with 6 Reuters items published Sep 22, 2026 (Greenland deal; Trump UNGA live; Tehran hints at Hormuz talks; Rubio on meeting Iran; DeepSeek to brief UN Security Council; Reuters/Ipsos approval 32%). Items are real in... | P1 | S | Closed | Fixed | Pass | 2026-09-22 | FR4 |
| F-FR4-06 | Freshness | Moved from the Sep 18 close to the Mon Sep 21, 2026 close. Indices from AP (confirmed by stockmarketwatch/eOption): Dow 52,048.83 +366.19 +0.71%; S&P 500 7,764.70 +114.20 +1.49%; Nasdaq 27,122.09 +599.55 +2.26% (record). Movers: Intel +1... | P1 | M | Closed | Fixed | Pass | 2026-09-22 | FR4 |
| F-FR4-08 | Freshness | Replaced the Sep 7 'frontier week' set with 8 items sourced today: Grok 4.7 (Sep 21; Decrypt/LLM Stats/IT Brief), DeepSeek to brief the UN Security Council (Reuters exclusive Sep 22) + V4.1 Flash specs (DataCamp), Cohere-Aleph Alpha defi... | P1 | M | Closed | Fixed | Pass | 2026-09-22 | FR4 |
| F-FR5b-06 | Plugin/Integration | While routed to free providers no client PII, loan-file text, CRM record, ISA-line content, credit or health data may leave the Mac. Written into the launcher as a mode flag every task can read (VANESSA_ROUTE_MODE, VANESSA_PII_OK, ~/.con... | P1 | S | New | Implemented | Pending | 2026-09-22 | ecc-security-steward |
| F-L1-01 | Live CRM import / Lending & Real Estate | A frozen 90-day Follow Up Boss lead card was still rendered inside the Lofty card: a collapsed <details id="loftyLegacyFub"> holding stage totals (6,460 contacts) and 39 named lead rows from a 2026-09-07 pull, plus the copy 'Follow Up Bo... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | L1 |
| F-L1-03 | Automation narratives (lead triage / lead response / ISA KPI / showings) | Four task narratives were written around the dead Follow Up Boss credential ('logged Invalid API Key since 2026-09-16', 'has to be re-pointed'), which both names the retired CRM and describes the wrong next action. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | L1 |
| F-L2-01 | privacy / client PII in published source | The frozen Follow Up Boss import card shipped 39 real client identities in the page source and rendered them into the DOM: first name + last initial, CRM stage, lead source and created date, in FUB_NEW_LEADS_90D. An earlier pass had alre... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | L2 |
| F-L3-01 | Standing rules / prose | The brain carried a standing rule telling every surface to label legacy CRM numbers as having come from the retired vendor "until 2026-09-22" and to keep a collapsed history block on the deck. Steven's instruction of 2026-09-22 — remove ... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | L3 |
| F-L3-06 | Repo mirrors vs. live Mac state | Three files under docs/inventory are stamped mirrors of live Mac documents: agent-roster.md (aiTeamRoster, generatedAt 2026-09-16), mac-task-descriptions.md (toolkitSnapshot, syncedAt 2026-09-16) and routine-health.md (routineHealth, syn... | P1 | — | Stale | Escalated | Pending | — | Steven |
| F-L3-12 | ISA operations | An existing open finding records a calling number and a forwarding email address on the retired CRM's own domain that the human ISA is instructed to use on every lead call. Whether they were migrated to Lofty is unknown, and only Steven ... | P1 | — | Current | Escalated | Pending | — | Steven |
| F-M1-01 | docs/remote-access | REMOTE-ACCESS.md asserted under 'Honest limits' that cloud routines cannot write the artifact DB unattended. That claim is false as of 2026-09-22 and is the stated reason ~50 feeds were pinned to one Mac. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M1 |
| F-M1-02 | deck/sync | hlPrefs (health-lab metric, compare, day range, auto-interpret toggle) is a user preference but was written with lsSetLocal, so it never left the browser that set it. Confirmed absent from the live store: a 172-document listing of 'state... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M1 |
| F-M1-05 | ops/scheduling | There is no mechanism preventing two Macs from running the same 59 claude-runner tasks at once. Both would write the same documents: duplicate ciLog rows, isaLine messages sent twice, and doubled feed writes. | P1 | — | Missing | Escalated | Pending | — | Steven |
| F-M2-01 | command-deck.html — PANEL_VERIFIED_AT (line ~21303) + the cfg.kind==="ref" br... | The map was a bare date per panel for all 33 panels and the renderer turned every one into a badge reading "Verified <relative>" with the tooltip "Reference material, last verified end to end on 2026-09-22". No engineer claimed a verifie... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M2 |
| F-M2-02 | command-deck.html — panelStampRegistry() vs PANEL_VERIFIED_AT | PANEL_VERIFIED_AT is read ONLY by the cfg.kind==="ref" branch, and only three of the deck's 39 panels are kind:"ref" — panel-hedgefund, panel-tools and panel-tax. panel-tools has no map entry. So exactly TWO of the 33 entries (panel-hedg... | P1 | — | Verified | Documented | Pass | 2026-09-22 | W1 |
| F-M3-02 | Safety — refused installs | Seven items are refused by name with a one-line reason at the top of MAC-SETUP.sh, and a runtime guard aborts the whole script (exit 3) if any command it is about to run matches one — so a later edit cannot quietly re-add them. Refused: ... | P1 | — | New | Implemented | Pass | 2026-09-22 | M3 |
| F-M3-03 | Safety — credentials | The installer never prompts for, echoes, logs or stores a secret value. Where a tool needs a key it creates ~/.config/<tool>/.env under umask 077, chmod 600, containing the variable NAMES with empty values and a comment per name saying w... | P1 | — | New | Implemented | Pass | 2026-09-22 | Steven |
| F-M3-05 | Testing honesty — what has never been executed | Neither script has ever run on macOS. Never executed anywhere: every `brew install` line (no Homebrew in the sandbox); `pipx install graphifyy` (no pipx); `uv tool install strix-agent`; `scrapling install` and `playwright install chromiu... | P1 | — | New | Documented | Pending | — | Steven (first run on the Mac) |
| F-M3-06 | Bug found and fixed during testing | The first version of run()/run_sh() captured the command's exit status with `_rc=$?` after an `if cmd; then ... fi`. That reads the *if statement's* status, which is 0 on the else branch, so every failure returned 0 and was reported as I... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M3 |
| F-M3-09 | HALT — the Mac already runs an older claude-auto | The inventory records an existing claude-auto on the Mac with an unverified client-data guard hook (F-E8-60), and FR5b's design replaces it rather than running beside it. MAC-SETUP.sh will not do that replacement: if ~/.local/bin/claude-... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-M3-10 | HALT — what the script will never do | Reported as NEEDS-STEVEN and never performed: installing Homebrew (the script refuses to pipe a network installer into a shell); `graphify install --platform claude` (it appends to ~/.claude/CLAUDE.md — a live-prompt edit); `headroom wra... | P1 | — | Recommended | Escalated | Pending | — | Steven |
| F-M4-01 | panel-vanessa (COMMAND) line 1358 - Reach Vanessa via table | The src-note under the Reach/channels table said 'WhatsApp was removed from this list ... Discord replaces it as the third channel', directly contradicting the WhatsApp row FR5b added to the table immediately above it (badge: spec writte... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-04 | panel-wellness (HEALTH) line 3833 - Strava/Fitbod card | 'the twice-daily cloud routine ... is research-only - its dashboard write parks on a permission prompt.' False as of 2026-09-22, and it converts a real routine failure into an accepted limitation. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-05 | panel-aiteam line 4625 - ISA line / comms bridge 'Honest status' | 'the hourly cloud routine ... is disabled - an unattended cloud run's database write parks on a permission prompt (confirmed three times)'. The belief that justified disabling it has been disproved. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-06 | panel-aiteam line 4627 - ISA bridge bullet list | 'Re-enable it only if the platform starts honoring an unattended write approval' - the platform already does, so this instruction now steers work away from a path that works, onto the Mac task and its 7:37 AM-9:37 PM window. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-09 | panel-nextmoves line 5977 - '50 cloud routines exist' paragraph | 'A further constraint applies to all of them: a cloud routine is research-only by design - an unattended run's write to this dashboard parks on a permission prompt (confirmed three times)'. This is the single most load-bearing statement ... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-11 | panel-orchestration line 6745 - architecture rules list | 'Writes happen on the Mac. An unattended cloud routine cannot reliably write this page's database or republish the page; both park on an approval nobody is there to give.' This is the rule other panels cite, and it is the one actively st... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-15 | panel-aiteam shared toolbox table (AI_TEAM_TOOLBOX, 'Cloud routines' row, now... | '50 routines, 46 enabled - research-only by design: an unattended run's artifact-DB write parks on a permission prompt (confirmed three times).' This row is the roster's canonical statement of the rule. | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M5-01 | Artifact DB / stravaSnapshot writer | The writer corrupting stravaSnapshot is the Mac runner task strava-daily-sync. It writes the document body bare ({activities,syncedAt,via}) instead of {v:{...}}. The live cloud routine 'Command Deck - Strava activity refresh' (trig_015Fm... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-M5-02 | Artifact DB / stravaSnapshot state | stravaSnapshot is currently CORRECT: version 9, wrapped as {v:{activities,syncedAt,via}}, 3 activities, syncedAt 2026-09-22T13:05:00Z, via 'FR2 freshness pass (Strava connector, direct read)', doc updatedAt 2026-09-22T13:12:15Z. FR2's re... | P1 | — | Verified | Documented | Pass | 2026-09-22 | M5 |
| F-M5-04 | Specs / knowledge base | ROOT CAUSE OF RECURRENCE: the brain documented the bare shape as CORRECT, in ten places. Every agent that loaded one of these was told 'Docs are {v:...} except stravaSnapshot'. memory.md filed it as 'a correction that must not be repeate... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M5 |
| F-M5-06 | always-on register / runnerStatus | The register's own status source is stale and UNDERSTATES the runner. runnerStatus.syncedAt is 2026-09-22T04:05:04Z and its newest task end is 2026-09-21 21:05 PT, yet vanessa-discord-inbox runs every 5 minutes - so the doc stopped being... | P1 | — | Superseded | Documented | Fail | — | W2 |
| F-M5-08 | Cloud routines / lying green row | The old web-created Pipeline Sync routine is still running and still lying. It fired again at 13:08 UTC today and reported SUCCEEDED, having synced nothing - its own prompt is RESEARCH-ONLY and it compares cdStateSeed blobs that are both... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-M6-01 | health-notion-sync / status doc naming | Both the Mac task spec and the apple-health-notion skill told the task to write a status doc named `appleHealthSync`. That document does not exist in the Command Deck DB, and it is not what the deck card reads. The live card `#healthNoti... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-02 | Notion Health Log schema / row key | The spec's property table named `Date` as the row key and did not list the `Day` property at all. The real database has both: `Day` is the Title property carrying `YYYY-MM-DD` and described in Notion as 'the row key'; `Date` is a separat... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-05 | appleHealth merge / undocumented keys | The live `appleHealth` document carries three top-level keys that neither the spec nor the skill documented: `dailyDays` (integer), `records` (object) and `sources` (array of {metric, source, n, first_at, last_at}). A writer that emits o... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-06 | appleHealth merge / daemon-only metric keys | The merge rule protected `daily` days, `sleep` nights and `workouts`, but not the metric keys themselves. Five of the eleven metric keys in the live doc can never be supplied by the Notion Health Log: headphone_audio_exposure, walking_as... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-S1-05 | security/cli-anything-install | CLI-Hub's telemetry is opt-OUT. cli_hub/analytics.py ships a PostHog project token and fires on install, uninstall, launch and every 'cli-hub call'. The payload carries the machine's hostname, the CLI name, the hub version, and which age... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-S1-06 | security/domshell | The read path for all five web targets is DOMShell, a third-party Chrome extension with page-content access, driving a Chrome session already logged into Lofty, SkySlope and zipForms. That extension can see everything those sessions can ... | P1 | — | Recommended | Escalated | Pending | — | Steven |
| F-S1-07 | integrations/cli-anything | CLI-Anything is not installed on Steven's Mac and cannot be installed from a cloud session. It was installed and exercised once in a throwaway cloud sandbox (cli-anything-hub 0.4.1 from PyPI; cli-anything-browser built from browser/agent... | P1 | — | Missing | Escalated | Pending | — | Steven |
| F-S1-08 | safety/showingtime | Every outward ShowingTime verb writes to a client-facing system, which is on CLAUDE.md's HALT list. showing request sends an appointment request to a listing agent and through them a seller; showing confirm commits a seller to letting pe... | P1 | — | Recommended | Escalated | Pending | — | Steven |
| F-S1-09 | safety/showami | Posting a Showami request hires a licensed person and charges Steven's card — the first line of the HALT list (spends money) and a third party dispatched to a stranger's door, twice over. bid accept/assign makes the same commitment one c... | P1 | — | Recommended | Escalated | Pending | — | Steven |
| F-S1-10 | safety/skyslope-zipforms | SkySlope and zipForms touch legally binding documents. esign send is a signature request to a client or co-op agent — a licensed act, unrecallable once opened; packet send delivers a contract packet to the other side; form fill writes co... | P1 | — | Recommended | Escalated | Pending | — | Steven (ECC review sign-off date) |
| F-S1-11 | integrations/lofty | Building a CLI-Anything browser wrapper for Lofty would be strictly worse than what already exists. Lofty has a documented REST API (api.lofty.com/v1.0, Authorization: token <key>) and lofty-bridge MCP plus lofty-cli are already installe... | P1 | — | Missing | Escalated | Pending | — | Steven |
| F-S1-13 | command-deck/robustness | A status card driven by a scheduled-task document is exactly the shape that caused the 2026-09-03 regression the db IIFE comment records, where one bad document blanked the whole dashboard. A card whose rows come FROM the document can al... | P1 | — | New | Implemented | Pass | 2026-09-22 | S1 |
| F-S1-14 | command-deck/tripwire | Nothing on the deck would have noticed if something on the Mac quietly enabled an outward verb on one of these wrappers. A status card that only reports connection state cannot tell the difference between a safe connector and an unsafe one. | P1 | — | New | Implemented | Pass | 2026-09-22 | S1 |
| F-S1-18 | docs/accuracy | The claim that the CLI-Anything install is interactive was wrong, and it is the single sentence that kept the whole install manual. `claude plugin marketplace add HKUDS/CLI-Anything` and `claude plugin install cli-anything@cli-anything` ... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | S1 |
| F-V1-01 | Reconciliation — never addressed: Google Drive | Steven asked for the second brain to be optimised 'with Notion + Drive'. Notion was wired; Google Drive never was, and nothing in the repo said so. There is no Drive connector, no Drive MCP server, no CLI, no key file and no entry in OPT... | P1 | — | Missing | Escalated | Pending | — | Steven (wire or drop) |
| F-V1-02 | Reconciliation — half-done: Lofty | Steven asked to 'setup lofty/zipforms/skyslope/zoho/homes.com using anything cli'. S1's answer for Lofty was correct and stands — Lofty is NOT a CLI-Anything target because it has a documented REST API and lofty-bridge MCP plus lofty-cli... | P1 | — | New | Implemented | Pass | 2026-09-22 | Steven (key value) |
| F-V1-03 | Reconciliation — refused by association: Higgsfield API | Steven asked for the Higgsfield API and named it alongside a third-party test client. That repo is REFUSED, correctly and permanently, because it commits a live-looking credential. But the refusal was allowed to swallow the whole request... | P1 | — | New | Implemented | Pass | 2026-09-22 | Steven (funded account, optional) |
| F-V1-07 | Wrong reason recorded — plugin advisories rested on a false premise | Three steps (claude-code-setup, ponytail, prompts-chat) were held as advisory partly on the belief that Claude Code plugin installs are interactive and cannot run unattended. That belief is false — F-S1-18 had already disproven it for CL... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | V1 |
| F-V1-10 | Testing honesty — what has and has not been executed | Reported explicitly so it is not inferred. EXECUTED in this session: bash -n and shellcheck 0.11.0 on both scripts (clean, before and after); ./MAC-SETUP.sh --dry-run end to end, exit 0, 22 steps; --dry-run --only for each new step; --on... | P1 | — | New | Documented | Pending | — | Steven (first run on the Mac) |
| F-V2-07 | omniroute failover | The PII gate can be bypassed by argument order. claude-auto.sh's option loop breaks at the first non-option argument, so any invocation that puts claude's own arguments before `--task` never parses the task name, leaving is_pii=0 and rou... | P1 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-08 | omniroute failover | The PII gate is fail-OPEN by default. With no `--task` and no `--pii`, is_pii stays 0 and the invocation is routed to the free provider. A gate whose default is 'not client data' is the wrong default for a launcher that fronts a mortgage... | P1 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-09 | omniroute failover | PII task matching is exact-string against a hardcoded space-delimited list, so any client-data task whose name is not byte-identical to an entry routes to a free provider. Every new or renamed client task fails open until someone remembe... | P1 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-10 | omniroute failover | The usage-limit regex has a wide false-positive surface and will flip a healthy subscription onto a free model. The `[^0-9]429[^0-9]` branch matches a mortgage loan amount; `resets? (at/in) ` and `limit (has been )?reached` match ordinar... | P1 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-11 | omniroute failover | Switch-back can strand the session on a free model permanently, with no alarm. If the probe command itself fails for any reason other than a limit match (CLI flag drift, `claude` not on PATH, a login expiry), probe.sh takes its 'inconclu... | P1 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-24 | mac-verify.sh (for V1) | mac-verify.sh cannot detect a broken skill. Its vendored-skills check tests only that SKILL.md EXISTS. A SKILL.md with unparseable YAML, a `name` that does not match its directory, an empty description or a dead reference is reported as ... | P1 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-V2-25 | mac-verify.sh (for V1) | mac-verify.sh reports a DRIFTED claude-auto as 'ok'. When the installed launcher differs from the repo copy it prints an ok line with an advisory, counts it toward N_OK, and does not stop the run exiting 0. The launcher is the component ... | P1 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-V2-26 | mac-verify.sh (for V1) | mac-verify.sh reports the stranded state as healthy. If $HOME/.config/omniroute/state/mode reads 'free-fallback' — meaning the Mac is running every non-PII task on free third-party providers — it prints 'ok  omniroute route mode  free-fa... | P1 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-W1-02 | renderPanelStamps() selector | panel-vanessa could never render a stamp: renderPanelStamps() selects '.panel[data-page]' and that section is '<section class="panel panel-pinned" id="panel-vanessa">' with no data-page. ROOT CAUSE is the selector, NOT the missing attrib... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-03 | panelStampRegistry() — panel-vanessa | panel-vanessa had no panelStampRegistry() entry, so once the selector was corrected it would have fallen to the !cfg branch and rendered the same misleading badge as panel-toolkit. Two of the 40 panels were unregistered: panel-vanessa an... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-04 | panelStampRegistry() — panel-toolkit | panel-toolkit was the one section with no registry entry, so it fell to the !cfg branch and rendered a dash badge coloured st-you — the colour reserved for sections Steven maintains by hand. panel-toolkit is not hand-maintained: it is fe... | P1 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W2-01 | Mac task / stravaSnapshot writer | strava-daily-sync writes its document body bare instead of {v:<value>}, and re-breaks the hand repair on every run. The next run is a hard deadline: cron '20 5 * * *' Mac-local PT = 12:20 UTC, so the repair dies at 2026-09-23T12:20Z unle... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-W2-02 | Mac runner / timestamp correctness | PREMISE OVERTURNED BY THE STORE. runnerStatus did not stop being written at 04:05 UTC - it is alive and was written at ~14:06 UTC today. What is broken is the timestamp inside it: the runner stamps Mac-local Pacific wall-clock time and a... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-W2-04 | Mac task / r4-quantvue-sync | TWO BRIEFED ITEMS ARE ONE SUBJECT. r4-quantvue-sync writes strategySnapshot - there is no missing QuantVue document and none was ever expected - and it is 'refused', not silent. It runs on schedule and a tool or path is being denied by t... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-W2-05 | Cloud routine / strategySnapshot | The strategy cycle is trig_011CXFHCT3hou6uaCfb5rWkC, and it is the research-only-prompt pattern confirmed by its own text: it SUCCEEDS on schedule and has no write step at all. strategySnapshot therefore has TWO broken writers - the Mac ... | P1 | — | Broken | Escalated | Pending | — | Steven (http_api routine) |
| F-W2-07 | Cloud routines / nine failures | The nine FAILED and ABANDONED routines share ONE cause and it is not their prompts: none of them reached its prompt. Rewriting five prompts would have fixed nothing. Measured before writing any correction, as instructed. | P1 | — | Broken | Open | Pending | — | Steven (the four http_api links) / next natural firings |
| F-X2-01 | consolidation / audit corpus | Fifteen findings files (about 250 rows) in two schemas were never merged, so the master table and its data twin still showed cycle 6 only (285 rows) and contradicted their own appendix: eleven earlier rows had been fixed on the deck betw... | P1 | — | New | Implemented | Pass | 2026-09-22 | X2 |
| F-X2-02 | privacy / repo mirror of the ISA Portal | The brain repo's tracked copy of the portal, dashboard/isa/isa-portal.html, is the pre-fix file: it still ships the frozen 39-row lead card (FUB_NEW_LEADS_90D, 5 references), the drift-table client rows with names and loan amounts (line ... | P1 | — | Broken | Open | Fail | — | integrator |
| F-X2-03 | contradiction / runner status | F-M5-06 (13:32 UTC) concluded runnerStatus stopped being written at 04:05 UTC and understated the runner. F-W2-02 (14:05 UTC) read the store and found the document alive (v8, written ~14:06 UTC) with its writer stamp in Pacific time plus... | P1 | — | Verified | Documented | Pass | 2026-09-22 | X2 |
| F-X2-09 | PII in the audit corpus | The master table and its data twin carried initial-plus-surname client identifiers with loan amounts and stages (F-E12-11, F-E12-12), and findings-L1.json quotes one lead's first name and initial as an example row. The cycle brief bars c... | P1 | — | Broken | Escalated | Pending | — | Steven |
| F-FR1-02 | freshness | Active-listing counts (San Diego city 2,218; Temecula 458; both as of 2026-09-04, CRMLS / Cotality Trestle IDX) could not be re-verified today: the IDX pull needs the Mac, and redfin.com, realtor.com and rockethomes.com are blocked or re... | P2 | S | open — needs a Mac session | Open | Pass | — | Steven / next Mac session (CRMLS IDX count) |
| F-FR1-04 | freshness | All three area write-ups (Temecula; Murrieta / Menifee / Winchester; San Diego) rewritten with what was actually found on 2026-09-22, dated and sourced. NewHomeSource and every builder site named in the brief (lennar.com, kbhome.com, drh... | P2 | M | done — direct page check still owed from the Mac | Improved | Pass | 2026-09-22 | FR1 (follow-up: Steven / Mac session) |
| F-FR1-07 | freshness | The stamp dates a hand verification of the CDP helper and the tradingview-mcp bridge against TradingView Desktop 3.4.0 (Sep 7). Evidence gathered today: TradingView's Desktop release notes list a 3.4.1 hotfix build dated Sep 8, 2026 (tra... | P2 | S | open — needs a hand run on the Mac | Open | Pass | — | Derek (CTO lane) / Steven on the Mac |
| F-FR1-11 | tooling | A cloud freshness pass cannot open the primary pages this panel depends on: the egress proxy blocks redfin.com, realtor.com (also blocks the search crawler), va.gov, hud.gov, veteransunited.com, navyfederal.org, bankrate.com, stockanalys... | P2 | M | escalated | Escalated | Pending | — | Derek (CTO lane) / Steven (egress allow-list is an account/infra decision) |
| F-FR2-01 | Stale Content | The On This Day card carried September 20's entries (stamp 2026-09-20) on September 22. Re-researched today: six Sep 22 events and nine Sep 22 birthdays, each row citing the dated source. The stamp is a real ISO instant (2026-09-22T13:07... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-02 | Stale Content | The tracker was stamped 2026-09-20 with two blank NFC North rows and an undated 'Week 3 MNF' next game. Re-verified today against ESPN final-score pages for every division game: the Sep 20–21 games were WEEK 2 (the assignment called them... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-03 | Stale Content | Week of Sep 21–25 re-verified row by row. Released: CFNAI Aug −0.04 (Jul revised +0.08). Two Sep 20 feed errors corrected: Existing-Home Sales (Aug) had already been released Sep 10 (3.98M SAAR, −2.0% m/m), not Sep 25; the PCE date is Se... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-04 | Stale Content | Full re-scan of the curated rewards tables. Correction: the Sep 7 scan's 'Amex → Virgin Atlantic +30% still active' row was wrong — that offer expired Jul 31, 2026; a new +40% bonus runs Sep 1–30 (labelled 'expired' + replaced, not silen... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-08 | Stale Content | Every COA was re-read against weeklyBrief.json (cycle 6) and MASTER-FINDINGS.md. Facts revised: the ISA decision's context now records the silent ISA line (no ISA-authored message since Sep 16, scorecard never filled, seat carried as a h... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-09 | Stale Content | Every SWOT item and every risk-register entry was re-read against today's record and revised where contradicted: strengths no longer claim '15 routines' or 'continuously verified'; weaknesses now say the ISA seat may be empty, both CRMs ... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-10 | Stale Content | Listings re-researched for Sep 22 → mid-October in the nine city tables the panel has. Passed events were removed and replaced with dated, sourced upcoming ones (e.g. Miramar Air Show Sep 25–27, Ohana Festival Sep 25–27, Pacific Airshow ... | P2 | M | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-12 | Stale Content | Seed re-baked from a direct read of the Strava connector (mcp Strava list_activities, 10 most recent). The three 2026 activities are unchanged since the Sep 20 read (no activity since Sep 12); the next older activity is Sep 21, 2025, del... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-16 | Stale Content | The strategy tables are doc-driven by the Mac task r4-quantvue-sync, which cannot be run from this session, so the figures were deliberately left as the Sep 16 document and the stamp keeps its 2026-09-16 date. The copy was corrected agai... | P2 | S | Stale | Improved | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-18 | Current State | WebFetch was refused for every external domain tried in this pass (~55 domains: va.gov, benefits.va.gov, espn.com, nfl.com, foxsports.com, wikipedia.org, history.com, philadelphiafed.org, chicagofed.org, newyorkfed.org, tradingeconomics.... | P2 | S | Current | Open | Pending | — | CTO Innovator / Steven (egress allow-list) |
| F-FR3-04 | Retired System Reference | The CRM row named Lofty only by way of Follow Up Boss and pointed at www.lofty.com; there was no dated history line for the retired system. Relabelled to 'Lofty (formerly Chime)' at https://lofty.com and added a 'Follow Up Boss - retired... | P2 | S | Retired reference | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-07 | Drift Check | Deliberately untouched. Parsed the array literals on this file and on deck/command-deck.html before and after the edits: LOAN_PROGRAMS = 39 and LENDER_DIRECTORY = 61 on both, so the integrator's drift check still passes. | P2 | S | Verified unchanged | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-09 | Stale Content | Copy said 'only ~6 weeks left before quarter-end'. Q3 closes 2026-09-30; on 2026-09-22 that is 8 days. Rewritten with the date it is true on. | P2 | S | Stale | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-10 | Misattribution | The card's note claimed 'a builder-incentive scan does still run daily - the incentives-daily-scan task'. The exported incentivePrograms document that task writes (updatedAt 2026-09-22T02:22:43Z, 66 items) is down-payment-assistance, uti... | P2 | S | Wrong attribution | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-11 | PII Hygiene | The drift table's pipeline and reClients cells carry initial-plus-surname style names with loan amounts and stages. Whether these are seeded samples or real clients cannot be told from the file, and the cycle brief bars client names anyw... | P2 | S | Resolved | Fixed | Pass — portal commit a22a346 (13:21 UTC): DRIFT_ROWS' pipeline and reClients cells are computed by driftLocalSummary() (row count + stages, no names or amounts); verified on portal master lines 1969-1980. The brain repo's tracked copy dashboard/isa/isa-portal.html is still the pre-fix file (F-X2-02). | 2026-09-22 | integrator |
| F-FR4-05 | Freshness | Eleven cities kept. New Sep 22 headlines written for Temecula (1), San Diego (1 + 2 new Sep 21 primary-source rows), Chicago (2), Las Vegas (4), Washington DC (1), Riverside (2), Orange County (1 + 1 existing Sep 22). Los Angeles: no Sep... | P2 | M | Open | Improved | Pass | 2026-09-22 | FR4 / daily feed task |
| F-FR4-10 | Tooling | WebSearch budget was already exhausted (200/200) before FR4's first news query; the egress proxy blocks every weather and news domain tried (forecast.weather.gov, api.weather.gov, wttr.in, accuweather, patch.com, apnews, bbc, cnbc, benzi... | P2 | M | Open | Escalated | Pending | — | integrator / Derek (CTO lane) / Steven (egress or search budget is an account setting) |
| F-FR5a-01 | Plugin/Integration | Local context-compression proxy for Claude Code (headroom wrap claude / headroom proxy :8787 / MCP mode). Verified in the sandbox: pip install headroom-ai exit 0, headroom --version 0.38.0. Mac install is uv tool install --python 3.13 "h... | P2 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-02 | Plugin/Integration | The brain's L4 knowledge graph tool. Real install path confirmed: pipx install graphifyy && graphify install writes ~/.claude/skills/graphify/SKILL.md + references/ and appends to ~/.claude/CLAUDE.md (user file, not the repo router); /gr... | P2 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-03 | Plugin/Integration | Local-first token/cost tracker that reads ~/.claude/projects/ session logs and 40 other tools; codeburn overview / web / menubar / budget / optimize (finds re-read files and ghost skills in ~/.claude/). Gives the brain the 'cost of a rec... | P2 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-06 | Plugin/Integration | Six of the 25 vendored into .claude/skills/ with provenance and MIT license headers, upstream text unmodified: code-review-and-quality, git-workflow-and-versioning, source-driven-development, documentation-and-adrs, security-and-hardenin... | P2 | S | Implemented | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5a-14 | Plugin/Integration | Upstream CLAUDE.md (think before coding, simplicity first, surgical changes, goal-driven execution) vendored as .claude/skills/karpathy-coding-principles/SKILL.md with generated frontmatter, provenance and MIT line; upstream text verbati... | P2 | S | Implemented | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-01 | Plugin/Integration | Both clients cloned and read in full 2026-09-22. whatsapp-cli (MIT, Python) reads the WhatsApp desktop app's local ChatStorage.sqlite read-only and sends via the whatsapp:// URL scheme + System Events; it exposes --json, monitor since <t... | P2 | M | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-03 | Plugin/Integration | Reads are read-only SQLite (sqlite3 'file:…?mode=ro') and work headless with Full Disk Access; sends open whatsapp://send?… and press Return through System Events, which requires an awake Mac, a logged-in GUI session and Accessibility pe... | P2 | S | New | Documented | Pending | 2026-09-22 | Integration Engineer |
| F-FR5b-05 | Plugin/Integration | Design and scripts for Steven's requirement ('switch to the OmniRoute free LLM models when subscription runs out and back when it refreshes'). Detection = a failed subscription run (exit≠0 or is_error:true) whose output matches a usage-l... | P2 | M | New | Implemented | Pending | 2026-09-22 | Integration Engineer |
| F-FR5b-11 | Compliance | Their terms may forbid automated access and two of them hold legally binding documents. No Scrapling/Scrapegraph-ai wrapper or CLI-Anything wrapper may be enabled against them until Alexandra (Compliance) confirms the terms and robots.tx... | P2 | S | New | Open | Pending | 2026-09-22 | Alexandra (Compliance) |
| F-FR5b-12 | Security | The repository commits a .env with two live-looking values, names HF_API_KEY_ID and HF_API_KEY_SECRET, and its README admits the service account 'was still active when I copied this'. That is a third party's credential: never use it, nev... | P2 | S | New | Documented | Pass | 2026-09-22 | Elena (CISO) |
| F-L1-02 | Data handling / PII | Removing the frozen lead card also removed 39 client name records (first name + last initial), their lead stage, lead source and creation date from the deck's HTML. That is client PII that was sitting in a published artifact. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | L1 |
| F-L1-04 | Identifiers - saved state, deliberately NOT renamed | The showings feature stores a per-client CRM link on the property name 'fub' inside the persisted 'showingSchedule' store, mirrors it as 'clientFub' into 'showingSyncRequests', and uses the string id "fub" as a showing-sync target. Both ... | P2 | — | Current | Escalated | Pending | — | Steven |
| F-L1-05 | AI Team toolkit / CRM & Connectors lane | The deck names a Mac skill directory 'fub-followups'. That is the real on-disk name of an installed skill, and the deck's job in that table is to report what is actually installed - skills-refresh audits the table against the machine. | P2 | — | Current | Escalated | Pending | — | Steven |
| F-L2-02 | test invariant / container count | Harness container count moved 49 -> 47. It is not drift: the only two lost ids are fubStageStats and fubNewLeadRows, the two innerHTML targets inside the frozen Follow Up Boss import card that FUB-POLICY.md orders removed. The brief pred... | P2 | — | Verified | Documented | Pass | 2026-09-22 | L2 |
| F-L2-03 | identifiers carrying saved state / external contract | Five 'fub' identifiers survive in the showings block and were deliberately NOT renamed: the c.fub client property, the shNewClientFub input id that reads it, clientFub in the queued sync payload, and the literal sync-target id "fub" in t... | P2 | — | Current | Escalated | Pending | — | Steven |
| F-L2-04 | scope deviation - panel verification stamp | The brief said not to change ISA_PANEL_VERIFIED_AT. One entry's note string was changed anyway, because it is rendered user-visible prose that named Follow Up Boss, and because after the TECH_STACK edit the sentence also became factually... | P2 | — | Verified | Documented | Pass | 2026-09-22 | L2 |
| F-L2-06 | honesty - no substituted numbers | Removing the FUB material deleted real figures (6,460 contacts across 14 stages, 39 new leads in 90 days, a 2026-09-07 pull date). None was relabelled as a Lofty figure and no Lofty number was invented anywhere, because there is no Lofty... | P2 | — | Verified | Documented | Pass | 2026-09-22 | L2 |
| F-L3-02 | Identifier — Mac skill folder | `fub-followups` is the real folder name of a skill installed on Steven's Mac (a 393-template client follow-up library). The skills-refresh skill matches it on disk by that exact name, so renaming it in the repo would make the weekly skil... | P2 | — | Current | Escalated | Pending | — | Steven |
| F-L3-03 | Identifier — dashboard element ids and seed constants | The live dashboards carry element ids and seed constants built on the old CRM name: `fubNewLeadRows`, `fubStageStats`, `fubNewCount`, `fubSyncNote`, `FUB_SYNC_AT`, `FUB_STAGE_TOTALS`, `FUB_NEW_LEADS_*`, `FUB_STAGE_TOTAL`, `FUB_RETIRED_AT... | P2 | — | Current | Open | Pending | — | Steven (with F-L1-04 / F-L2-03) |
| F-L3-04 | Audit trail | The dated audit corpus — findings files, the master findings table and its DB twin, the engineers' cycle reports, the engineering brief, the CI/loop/opportunity logs, the routine and inventory snapshots, and the research brief's data twi... | P2 | — | Current | Open | Pending | — | Steven (decision) |
| F-L3-05 | Decision log | `context/decisions.md` declares itself append-only — "Append, never edit and never delete. A reversal is a new entry that names the entry it reverses." Complying with Steven's instruction required rewriting the 2026-09-22 CRM entry in pl... | P2 | — | Current | Open | Pending | — | Steven (decision) |
| F-L3-07 | Integrations / credential hygiene | Composio still carries the retired real-estate CRM connection, reported ACTIVE, with an API key that the vendor rejects. That is a dangling credential on the same transport that carries Zoho, Gmail and GitHub. | P2 | — | Current | Escalated | Pending | — | Steven |
| F-L3-10 | Search coverage | The assigned grep pattern `follow[ -]?up ?boss/\bFUB\b` does not match the fully hyphenated spelling `follow-up-boss`, because it allows a space but not a hyphen before "boss". One real hit was found only after widening the pattern, and ... | P2 | — | Verified | Documented | Pass | 2026-09-22 | L3 |
| F-L3-11 | Knowledge graph | The old CRM was never an entity type or a relationship in knowledge-graph/schema.md — it appeared only as an illustrative example on the REPLACED_BY row and as an example node id in the sample YAML. Nothing in this repo could be orphaned... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | L3 |
| F-L3-13 | Mac task specs | The registration checklist told the integrator to re-point four tasks off the retired CRM and onto Lofty without stating that Lofty has no credential installed, so a task could be registered and then report an empty number as if it were ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | L3 |
| F-M1-03 | deck/observability | The deck had no way to show which machines were attached or when the machine that feeds the Mac-written documents last did anything. A sleeping Mac was indistinguishable from a working one, which is how r8-apple-health-snapshot (error si... | P2 | — | New | Implemented | Pass | 2026-09-22 | M1 |
| F-M1-04 | deck/sync | A synced document that every tab on every device touches becomes a write amplifier and, worse, a reload source: applyRemoteSnapshot counts any remote key change as 'changed' and reloads the page (throttled to once per 30s). An hourly ros... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M1 |
| F-M1-06 | ops/scheduling | Roughly a dozen feeds that only need the web and the artifact DB are still pinned to the Mac, and several have never run at all. They are the visible symptom of F-M1-01. | P2 | — | Recommended | Escalated | Pending | — | Steven |
| F-M1-10 | deck/content-integrity | The deck states the now-false 'cloud routines are research-only / an unattended write parks on a permission prompt' claim in four places. One is inside panel-toolkit and was mine to fix; two remain outside any assigned region. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M1 + M4 |
| F-M2-03 | command-deck.html — renderPanelStamps() selector vs <section class="panel pan... | renderPanelStamps() walks document.querySelectorAll(".panel[data-page]"). The panel-vanessa section is pinned and carries no data-page attribute, so it is never visited and can never receive a stamp — yet it has held a PANEL_VERIFIED_AT ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-M2-04 | command-deck.html — panel-toolkit (section at line 6612) | panel-toolkit has a PANEL_VERIFIED_AT entry but NO entry in panelStampRegistry(), so it falls to the '!cfg' branch and renders a dash badge with class st-you. st-you is the colour reserved for sections the reader maintains by hand, which... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-M2-05 | command-deck.html renderPanelStamps() ref branch — and the identical code in ... | The schema's published renderer reads 'var vAt = vCfg ? vCfg.at : null'. If an entry is left as a bare date string from the old map, '.at' resolves to String.prototype.at — a real method since ES2022 — which is truthy. The badge then ren... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M2 + integrator |
| F-M2-06 | command-deck.html — panel-aiteam, card 'Automation & live-data connectivity —... | The card sub read 'Verified 2026-09-22. Every line below is a checked fact, not a plan. Baseline 2026-09-12 · verified 2026-09-22.' Its own list contradicts it: the Lofty line says 'Whether that key is actually present cannot be verified... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M2 |
| F-M3-04 | Correctness — Python version gates | Every version gate FR5a/FR5b found is enforced by pinning the interpreter rather than by hoping: whatsapp-cli and the scrapers venv are built with `uv venv --python 3.12` (whatsapp-cli is a SyntaxError on 3.11 despite its README's '3.10+... | P2 | — | Verified | Implemented | Pass | 2026-09-22 | M3 |
| F-M3-07 | Bug found and fixed during testing — mac-verify.sh | The file-mode check originally tried BSD `stat -f '%OLp'` first with a GNU `stat -c '%a'` fallback. On Linux `stat -f` means 'file SYSTEM status' and SUCCEEDS, so the fallback never fired and a filesystem report was printed where a permi... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M3 |
| F-M3-08 | OmniRoute failover — install shape | FR5b's README says to copy claude-auto.sh and probe.sh to ~/.local/bin, but then drives the launcher as the command `claude-auto` while the probe LaunchAgent plist names `$HOME/.local/bin/probe.sh`. A verbatim copy of both would leave `c... | P2 | — | Open | Open | Pending | — | Integration Engineer (FR5b) |
| F-M3-11 | HALT — legal gate before any scraper runs | MAC-SETUP.sh installs scrapling and scrapegraphai but points them at nothing. Both steps print the standing gate: Alexandra's written terms + robots.txt check on every target before a wrapper is enabled, homes.com / SkySlope / zipForms n... | P2 | — | Recommended | Escalated | Pending | — | Alexandra drafts, Steven decides |
| F-M3-12 | mac-verify.sh — scope and exit semantics | Read-only checker: prerequisites and their versions, the nine vendored skills, every tool MAC-SETUP.sh installs with its version, the whatsapp-cli and scrapers venv interpreter versions, the scrapling fetchers import and the scrapegrapha... | P2 | — | New | Implemented | Pass | 2026-09-22 | M3 |
| F-M4-02 | panel-openterminal (MARKETS) line 2236 - 'Why the terminal itself is not embe... | Cited 'the same wall that blocks inbound WhatsApp' as an example of the artifact CSP/sandbox barrier. Two things wrong: the sandbox was never what blocked WhatsApp (no supported API was), and once whatsapp-cli lands, inbound WhatsApp arr... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-03 | panel-personalaccounts (WEALTH) line 3252 - Plaid refresh steps | 'Cloud routines cannot do this step (their database writes park on a permission prompt).' The conclusion is right, the stated reason is now false. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-07 | panel-aiteam line 4701 - Steve twin card | 'The cloud routine Command Deck - Steve twin is disabled: its last run was abandoned 2026-09-09 on the unattended-write permission prompt' - true as dated history, but left standing it reads as a permanent block. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-08 | panel-aiteam line 4742 - 'Remote / live access to the same brain' list | Described claude.ai/code routines as '(cloud, research-only by design)'. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-10 | panel-marketing line 6333 - video content queue card | '(routines can't modify the dashboard unattended, and no video-editing capability exists in this toolset)'. The first clause is false; the second is true. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-12 | panel-marketing JS - source comment lines 19418-19419 and the rendered market... | Comment: 'Both are cloud routines, so neither can write this dashboard unattended'. Rendered copy: 'They are research-only: a cloud run cannot write this dashboard unattended, so nothing they produce lands in the queue by itself.' | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-13 | freshness board 'who writes this' map, line 20799 - 'AI Hedge Fund memo' | 'It was previously a cloud routine, and cloud routines cannot write this dashboard's store unattended, so that path is not a confirmed source either.' This contradicts the deck itself, not just the new finding: panel-hedgefund line 2035 ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-16 | panel-aiteam roster - Derek (CTO) tool chips, now line 25905 | Derek's tool list claimed 'CLI-Anything (installed on the Mac; wrappers pending)'. Three other places in the same file say the opposite. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-17 | EA/ISA start-of-day checklist (SOD_ITEMS), line 14759 | Live checklist copy told the ISA to review 'Zoho CRM ... then FUB for real estate'. Follow Up Boss was retired 2026-09-22 and its Composio credentials have been failing authentication since 2026-09-16. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-18 | EA/ISA start-of-day checklist (SOD_ITEMS), line 14760 | 'Check inbound channels: FUB Phone, Zoho telephony/SMS, ...' - same retired system. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-19 | EA/ISA 90-day onboarding, Days 1-30 (ONBOARD_PHASES), line 14972 | 'Audit Zoho CRM and FUB, calendars, active loans, ...' - instructs a future hire to audit a retired CRM. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-20 | panel-wellness (HEALTH) line 3567 - Apple Health card title | Title read 'Apple Health - every category, fed by Health Auto Export' while the card's own first paragraph (line 3569) says 'This pipeline is down as of 2026-09-22' and the next (3571) describes the Notion replacement route. The title as... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-21 | panel-wellness (HEALTH) line 3689 - Health metrics log card | '...to pull weight, resting HR, sleep hours and steps for the last 14 days from the Mac's Health Auto Export database'. The button does not read the Mac at all. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-22 | health coaching freshness banner, renderHealthCoaching fallback, line 16100 | The stale-data nudge read 'no new export since. Open Health Auto Export on your iPhone to resume.' - it sends Steven to the dead path, and contradicts the broken-pipeline nudge one line above it which correctly says 'This is not your pho... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-24 | LEFT ALONE - STRATEGY_SYNCED_AT constant, line 8263 (panel-quantvue data) | The constant's string value ends '...The cloud routine "Trading strategy performance daily 3pm PST sync" reports SUCCEEDED Sep 21 but an unattended cloud run cannot write to this deck's database, so it changed nothing.' That reason is fa... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | FR2 |
| F-M4-25 | LEFT ALONE - panel-toolkit line 6643 | 'claude.ai/code routines (cloud, research-only by design)' - the same stale claim I fixed at line 4742, in the twin sentence inside panel-toolkit. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M1 |
| F-M4-27 | FLAGGED, NOT CHANGED - panel-aiteam line 4529 (Zoho connector bullet) | 'A cloud routine re-tests every few hours and writes the zohoSync document; the moment the permission lands, zohoLeads and zohoDeals fill on their own.' Not a contradiction after my fixes (the write half is now fine), but the read half m... | P2 | — | Open | Open | Pending | — | Derek (CTO lane) |
| F-M5-03 | Artifact DB / marketingQueue shape | Full sweep of collection 'state' (172 documents) found exactly ONE document whose top level is not a single 'v' key: marketingQueue. It carries BOTH 'v' (3 rows, current, newest 2026-09-22) and an orphaned 'data' subtree holding {'v': 2 ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | unrecorded |
| F-M5-05 | Guards / standing check | There was no detector for a bare-value write. Two counters already existed and both were calibrated to EXPECT the defect, so a genuine regression would have read as normal. | P2 | — | Recommended | Escalated | Pending | — | Steven |
| F-M5-07 | Cloud routine / isaLadder | The ISA escalation ladder's proof-of-life field is stamped in the FUTURE. isaLadder.updatedAt reads 2026-09-22T14:35:00Z; the audit ran at 13:32 UTC and the routine last fired 12:59Z. A proof-of-life stamp that runs ahead of the clock ca... | P2 | — | Broken | Escalated | Pending | — | Steven (decide: paste §6 yourself or authorise an agent — F-W2-06 says meta_mcp) |
| F-M5-09 | always-on register / silent tasks | Four scheduled things run or are scheduled and leave no output. Confirmed from the documents, not re-derived: r8-apple-health-snapshot (appleHealth frozen at 2026-09-13T23:15:59Z across ~18 slots), health-full-analysis (healthAnalysis ge... | P2 | — | Superseded | Documented | Pass | 2026-09-22 | W2 |
| F-M5-11 | always-on register / internal contradiction | The register contradicted itself about cloud writes. One paragraph said 'Cloud routines are not a fallback ... research-only by design'; the section directly below listed three cloud routines that write the DB. A reader acting on the fir... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M5 |
| F-M5-12 | Cloud writers / verification | All three cloud writer routines created this session are still writing, confirmed by output rather than status. One caveat worth recording: isaScorecard is [] on both artifacts - the Pipeline Sync is honest (the sides match) but that key... | P2 | — | Verified | Documented | Pass | 2026-09-22 | M5 |
| F-M6-03 | Notion Health Log schema / missing property | The spec's table omitted the `Notes` rich-text property, which exists in the real database ('anything the phone flagged'). With `Day` and `Notes` both missing, the spec's table could not reconcile with the 23-property count that `healthN... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-07 | appleHealth merge / timestamp formats | The merge tie-break is 'the newer latest_at wins', but the doc's timestamps are not ISO: `latest_at`, `workouts[].start` and `workouts[].start_local` are 'YYYY-MM-DD HH:MM:SS' (space, no T, no Z), `earliest` is a bare date, `meta.last_re... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-09 | healthNotionSync / status vocabulary | The skill allowed four status values (ok, stale, not-configured, error). The deck card renders six: ok, stale, not-configured, error, awaiting-first-phone-run, not-created. The two missing values are exactly the two states the system is ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-10 | health-notion-sync / tool allow-list | The task's tool allow-list named three Notion read verbs but did not exclude the write verbs, and 'read-only' appeared only in prose. A runner with the Notion connector attached has the write verbs available unless the allow-list denies ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-14 | health-notion-sync / empty-read behaviour | The old spec branched only on connector failure vs success, so an empty Health Log (zero rows — the actual state today) fell through into the build-and-write path with no rows behind it. Nothing said what to write when Notion succeeds bu... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-15 | HALT / scope of this engagement | Three things this chain needs are outside what I may do, and none of them were done: the Mac task health-notion-sync is not created, scheduled or enabled; no document in the Command Deck DB was written or modified; and the first phone ru... | P2 | — | Missing | Escalated | Pending | — | Steven |
| F-M6-16 | documentation honesty / what is live | The spec's header said 'spec written, first phone run pending. Nothing below is live yet.' That is now wrong in both directions: the Notion database and the deck card are real, while the sync and the data are not. A single blanket senten... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-S1-01 | integration-research/showingtime | ShowingTime (ShowingTime+, Zillow Group) exposes no appointment API an individual broker associate can obtain. The documented APIs under the brand are Bridge Interactive / Bridge Listing Output, RESO Web API listing-DATA feeds licensed t... | P2 | — | New | Documented | Pass | 2026-09-22 | S1 |
| F-S1-02 | integration-research/showami | Showami does have an API, marketed as 'API Automation' within its Brokerage and Enterprise solutions: roster sync plus a 'Create Showing(s)' endpoint that submits showing requests from a CRM or back-office system. It is not presented as ... | P2 | — | New | Documented | Pass | 2026-09-22 | S1 |
| F-S1-03 | research-evidence-quality | Every primary source for both services is egress-blocked from this sandbox: showami.com, www.showami.com, blog.showami.com, support.showami.com, showingtime.com and showingtimemls.uservoice.com all returned EGRESS_BLOCKED. Findings F-S1-... | P2 | — | New | Documented | Pass | 2026-09-22 | S1 |
| F-S1-04 | command-deck/panel-showings | The pre-existing SH_INTEGRATIONS table in panel-showings asserts of Showami: 'A Showami brokerage account with API access (their API left beta in 2025).' I could not verify that the API left beta in 2025, or in any year. It is a dated fa... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | integrator |
| F-S1-15 | safety/authentication | ShowingTime is reached through MLS single sign-on in many markets, CRMLS included, and MFA is common on SkySlope and zipForms. A browser harness that meets a second factor will either stall or be tempted to automate around it. | P2 | — | Recommended | Escalated | Pending | — | Steven |
| F-S1-19 | docs/accuracy | integrations/CONNECTIONS.md line 16 still carries the superseded instruction as Steven's one-line action for CLI-Anything: 'On the Mac in Claude Code run /plugin marketplace add HKUDS/CLI-Anything then /plugin install cli-anything (and p... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | V1 |
| F-S1-20 | mac-setup | MAC-SETUP.sh has no CLI-Anything step, so the now-scriptable install has nowhere to live and stays manual by default. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | integrator |
| F-V1-04 | Reconciliation — untraceable verdict: tashfeenahmed/freellmapi | This item looked silently dropped because its verdict existed in exactly one place nobody would look: a single table row inside integrations/omniroute-failover/README.md line 97. It was absent from MAC-INSTALL-comms-data.md's summary tab... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | V1 |
| F-V1-05 | Reconciliation — confirmed dead: cheahjs/free-llm-api-resources | Independently re-verified today: the repository returns HTTP 404. It is gone, not merely unreachable from this sandbox — the earlier finding F-FR5b-08 was right. It was wanted only as a catalogue of free tiers, and that need is covered t... | P2 | — | Verified | Documented | Pass | 2026-09-22 | V1 |
| F-V1-06 | Verified, not assumed — the three free-key sources | bytez.com, openrouter.ai/models?q=free and build.nvidia.com/models remain egress-blocked, so no page was read and no limit or price is claimed from one. The question that matters is whether Steven only has to paste values, and the answer... | P2 | — | Verified | Documented | Pass | 2026-09-22 | V1 |
| F-V1-08 | Stale instruction never applied — F-S1-19 | F-S1-19 recorded that integrations/CONNECTIONS.md still carried the superseded manual instruction for CLI-Anything, supplied the exact replacement text, and handed it to the coordinator rather than applying it. It was never applied. The ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | V1 |
| F-V1-09 | mac-verify.sh did not check the newest step | MAC-SETUP.sh's cli-anything step installs three separate halves — the pip hub, the Claude Code plugin and the browser harness — and mac-verify.sh checked none of them. A step that cannot be verified is a step that can silently not be the... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | V1 |
| F-V2-02 | vendored skills | Eleven relative references pointed at `.claude/references/security-checklist.md` and `.claude/references/performance-checklist.md`, neither of which existed anywhere on disk. Two header notes said 'not vendored', but the inline 'See Also... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | V2 |
| F-V2-05 | injection surface | find-skills/SKILL.md instructs the agent to install third-party skills globally with confirmations suppressed: `npx skills add <owner/repo@skill> -g -y`. That is unvetted third-party code, installed at user level on the same machine that... | P2 | — | Recommended | Escalated | Pending | — | Steven |
| F-V2-12 | omniroute failover | A second permanent-strand path: the reset epoch parsed from a limit message is written to state with no sanity clamp. A far-future value silences the probe forever, because probe.sh waits while reset_at is in the future and claude-auto o... | P2 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-13 | omniroute failover | The redaction function used before writing to limit-samples.log misses the credential shapes this system actually uses. It only redacts a secret preceded by sk/key/token/Bearer AND a hyphen, underscore or space, so `NAME=value`, `name: v... | P2 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-14 | omniroute failover | limit-samples.log is an ungated sink for task output. On a detected limit it appends up to 300 bytes of the failing task's own stdout and stderr — and the tasks most likely to fail are the client-data ones. Combined with F-V2-13 that fil... | P2 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-15 | omniroute failover | claude-auto.sh's chmod-600 check on the .env uses a BSD-first stat fallback that is wrong on Linux, and the correct implementation already exists elsewhere in this repo. On GNU coreutils `stat -f` means 'file SYSTEM status': it prints a ... | P2 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-18 | omniroute failover | route.env is SOURCED (`. "$ROUTE"`) on every invocation, but the state directory holding it is created with the default umask and its mode is never checked. Anything that can write route.env gets arbitrary code execution in the launcher ... | P2 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-20 | unsupported claims | The failover acceptance test only exercises the argument order that passes. README.md:112's PII canary runs `claude-auto --force free --task lofty-crm-sync -p '...'`, which is exactly the one ordering the gate handles correctly — it woul... | P2 | — | Recommended | Escalated | Pending | — | Integration Engineer (README cases); Steven (runs the widened canary before the runner is re-pointed) |
| F-V2-21 | unsupported claims | integrations/CONNECTIONS.md:45 states flatly that 'Client-data tasks defer (exit 75) while on free providers'. That is presented as behaviour, in the same cell that honestly says the scripts were 'syntax-checked, not executed'. It is fal... | P2 | — | Stale | Open | Pending | — | Integration Engineer |
| F-V2-27 | mac-verify.sh (for V1) | mac-verify.sh cannot distinguish an installed-but-broken tool from a healthy one. check_cmd reports ok with whatever the version command's first stdout line is, discarding its exit status, so a binary that exists but fails to run yields ... | P2 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-V2-28 | mac-verify.sh (for V1) | The MCP check counts lines rather than servers, so an error message or an empty-state message is reported as a successful listing. | P2 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-W1-01 | PANEL_VERIFIED_AT / panelStampRegistry() | PANEL_VERIFIED_AT carries 33 entries in a {at, scope, note} schema but is read ONLY by the cfg.kind === 'ref' branch of renderPanelStamps(). Exactly three panels are kind:'ref' (panel-hedgefund, panel-tools, panel-tax) and only two of th... | P2 | — | Verified | Documented | Pass | 2026-09-22 | W1 |
| F-W1-05 | renderPanelStamps() !cfg fallback | The unregistered-panel fallback did 'cls += " st-you"; txt = "—"', borrowing the hand-maintained colour for any panel missing a registry entry, and telling the next engineer nothing about why. Latent for every panel added in future. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-06 | execSyncRegistry() freshness board | add("Top performers", TOP_PERFORMERS_SYNCED_AT, "panel-quantvue") — but all four top-performer tables live in panel-personalaccounts. The board's jump link landed on the wrong panel, on a different tab. CONFIRMED. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-07 | execSyncRegistry() freshness board | add("Bears tracker", BEARS_SYNCED_AT, "panel-brief") — but the Chicago Bears card is inside panel-news. CONFIRMED. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-08 | execSyncRegistry() freshness board | add("AI news", feedStampIso("aiNewsList"), "panel-tools", 2) — the panel is wrong (the card is in panel-pedefense). The reported second half of this bug — that the STAMP SOURCE is also wrong and should read the refreshed aiNews document ... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-W1-10 | panelStampRegistry() — panel-aiteam (NOT FIXED, reported) | panel-aiteam's registry keys include 'vanessaChat' and 'vanessaRecommendations', but NEITHER card is in that panel any more — both live in panel-vanessa. panel-aiteam can therefore take its 'You last edited' date from an edit made in a d... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | X1 |
| F-W2-03 | Mac task / r8-apple-health-snapshot | r8-apple-health-snapshot is not erroring as the register recorded - it reports 'ok' twice a day and writes nothing, which is worse, because nothing flags it. The Apple Health ingest daemon is down and the replacement Notion phone route i... | P2 | — | Broken | Escalated | Pending | — | Steven (one-line decision; Branch A recommended) |
| F-W2-06 | Cloud routine / isaLadder proof-of-life | isaLadder.updatedAt stamps a scheduled slot time, never the actual write time. Caught across two consecutive versions in one afternoon, which pins the rule exactly: it is always a slot, sometimes ahead of the clock and sometimes behind i... | P2 | — | Broken | Open | Pending | — | coordinator (agent may apply per W2 — contradicts F-M5-07) or Steven |
| F-W2-08 | Cloud routine / Real Estate Weekly Brief | Real Estate Weekly Brief cannot work as an agent-created routine at all, for two independent reasons, and no prompt rewrite can fix either. It is a decision, not a repair. | P2 | — | Broken | Escalated | Pending | — | Steven (decision) |
| F-W2-09 | Cloud routines / stock templates | Ops Issue Review, Project Risk Review and Books Reconciliation Reminder are stock business-assistant templates aimed at a business that is not Steven's. Even a successful run produces nothing and leaves no document, so they are the resea... | P2 | — | Recommended | Escalated | Pending | — | Steven (decision) |
| F-W2-10 | Cloud routines / lying green row | The old Pipeline Sync routine cannot be disabled by any agent - confirmed for the third time on 2026-09-22 - and it keeps writing a green row for work it is not doing. Steven clicks it or it does not stop. | P2 | — | Broken | Escalated | Pending | — | Steven |
| F-W2-14 | wiki/dashboard-ops / stale standing fact | wiki/dashboard-ops/index.md still asserts the belief that was disproved on 2026-09-22, and it is the page the router sends every agent to for any question about a deck panel, DB doc, Mac task or cloud routine. An agent loading it would r... | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | integrator |
| F-X2-04 | contradiction / r4-quantvue-sync and r8 | F-M5-09 recorded r4-quantvue-sync as 'silent — no QuantVue document exists in state, nothing to check it against' and r8-apple-health-snapshot as running while writing nothing; F-W2-04 shows r4 writes strategySnapshot (mac-task-descripti... | P2 | — | Verified | Documented | Pass | 2026-09-22 | X2 |
| F-X2-05 | contradiction / who may fix isaLadder.updatedAt | F-M5-07 says correcting the ISA ladder's stamp is a routine edit that is Steven's; F-W2-06 says the routine was created via meta_mcp so an agent may apply it without Steven. Neither applied it; the stamp still reads a slot time (2026-09-... | P2 | — | Recommended | Escalated | Pending | — | Steven |
| F-X2-06 | contradiction / rate as-of dates on deck vs portal | FR1 and FR3 re-baked the same three hand-checked rates from the same lender pages through different channels. The deck now dates the Navy Federal VA 15-yr and jumbo 15-yr rows 'Sep 20, 2026' (F-FR1-09) while the portal dates identical fi... | P2 | — | Broken | Open | Pending | — | Steven / next Mac session |
| F-X2-07 | contradiction / Meritage builder incentive | The deck's builder-incentive copy (F-FR1-04) carries a current-looking Meritage offer (2.99% / 3.99% / 4.99%, 5.546% APR via MTH Mortgage, 'no window shown'); the portal's (F-FR3-02) says the Meritage SoCal page is the October 2024 event... | P2 | — | Broken | Open | Pending | — | Steven / next Mac session |
| F-X2-10 | unbacked claim / Zoho re-test routine | The deck (panel-aiteam Zoho bullet, F-M4-27), context/decisions.md and the engineering brief all say 'a cloud routine re-tests every few hours and writes zohoSync'. The 50-routine listing pulled 2026-09-22 08:09 UTC contains no such rout... | P2 | — | Broken | Open | Pending | — | Derek (CTO lane) |
| F-X2-12 | master table / superseded halts | Four halted rows asked Steven to press 'Run now' on r6-weekly-backup (F-E1-14, F-E11A-02, F-E7-12, F-E8-05) while F-INT-07 recorded the cloud backup writer taking a verified 2026-09-22 backup. The table was contradicting its own appendix. | P2 | — | Resolved | Fixed | Pass | 2026-09-22 | X2 |
| F-X2-15 | evidence gap / published versions | The tree records the deck as 'published as v143' (deck 8136b9f, 12:46 UTC) and the portal as 'version 27' (F-E12 close), but nothing records a republish after the later merges (deck master ee42e30 at 14:54 UTC; portal master cf89bab at 1... | P2 | — | Recommended | Recommended | Pending | — | integrator |
| F-X2-19 | OmniRoute failover / blocked install | Three deliverables tell Steven to install and use the OmniRoute failover (F-FR5b-05, F-FR5b-06, F-M3-03/09 and the MAC-SETUP.sh omniroute step) while F-V2-07..18, written later, prove its PII gate fails open by argument order, by default... | P2 | — | Broken | Open | Pending | — | Integration Engineer |
| F-FR1-05 | freshness | Stocks table re-baked to the Monday 2026-09-21 close: GRAL +33.68%, PLBL +15.40%, FSLY +14.92% (Yahoo Finance top-gainers module at the close; FSLY's 27.42 = Sep 18 close 23.86 + 3.56, which pins the session), INTC +12.14% and META +11.4... | P3 | S | done | Fixed | Pass | 2026-09-22 | FR1 |
| F-FR1-06 | freshness | The ETF table could not be re-sourced today: its basis (Yahoo Finance top-performing ETF screen, 52-week change) is blocked from this session, etf.com is blocked, and the only etf.com list reachable through Perplexity's index is the June... | P3 | S | open — next pass from the Mac, where the Yahoo screen is ... | Open | Pass | — | next Top Performers research pass (Mac) |
| F-FR1-08 | freshness | Left at 2026-09-07 on purpose: the live hfCommitteeMemo document (v100) is still the AAPL run with ranAt 2026-09-07T20:50:00-07:00, and hfRequest shows the only later attempt (requested 2026-09-11) aborted on 2026-09-13 because the cloud... | P3 | S | done — memo itself still needs a Mac run (/ai-hedge-fund-... | Improved | Pass | 2026-09-22 | FR1 |
| F-FR1-10 | freshness | Deliberately left. Verified against the live ratesSnapshot document (v9, syncedAt 2026-09-22T02:24:25Z, via mortgage-rates-daily): the seed values match the document exactly (7.038 / 6.257 / 6.751 / 6.799 / 6.71 / 7.032, Optimal Blue via... | P3 | S | verified, unchanged | Fixed | Pass | 2026-09-22 | mortgage-rates-daily (claude-runner) |
| F-FR2-05 | Stale Content | Curated set seeded Sep 4. Four sourced rows added at the top of the empires table (Roger Federer — Forbes 2026 debut, ~3% On stake; Lionel Messi — Forbes Jun 5, 2026, Inter Miami equity option; Forbes Celebrity Billionaires 2026 list sta... | P3 | S | Stale | Improved | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-06 | Stale Content | Curated set rewritten Sep 7. Four rows added at the top of PE_MOVES (AEVEX–BlackSea up to $650M, closing Sep 2026; NP Aerospace closed Iten Defense Sep 10; Lockheed JATM production deal, Sep 2026; Crunchbase defense-tech funding stat $14... | P3 | S | Stale | Improved | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-07 | Stale Content | Curated radar rewritten Sep 7. Four items added at the top (found 2026-09-22): NMLS 2026 renewal window Nov 1 with the SMART CE deadline Dec 5 (corrects the Dec 4 recorded Sep 3); Lofty AI Sales Agent ~$60/month per 200 leads as a text-f... | P3 | S | Stale | Improved | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-11 | Current State | Verified that the VA compensation table (effective Dec 1, 2025, 2.8% COLA) is still the current schedule on 2026-09-22 — the next change is Dec 1, 2026 with the SSA COLA announced in October. va.gov (and benefits.va.gov) are egress-block... | P3 | S | Current | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-13 | Stale Content | Zones re-read from the Strava connector (mcp Strava get_athlete_zones): HR zone 2 118–146 bpm (source MaxHeartRateFromAge), FTP 133 W estimated (EstimatedFtpFromPower), fastest-5k prediction 30m 47s estimated (PerformancePredictions). Ev... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | FR2 (Life & Wealth freshness) |
| F-FR2-17 | Missing | Chicago and New Braunfels, TX are footprint cities in the assignment, but panel-travel has no table (no travelChicagoRows / travelNewBraunfelsRows container) for either, and adding ids is outside a freshness engineer's remit. Deliberatel... | P3 | S | Missing | Open | Pending | — | Integrator |
| F-FR3-05 | Retired System Reference | Checked for 'then FUB for real estate', 'FUB Phone' and 'Audit Zoho CRM and FUB'. All three constants already read Lofty in this worktree (SOD: '... then Lofty for real estate'; EOD/SOD inbound channels: 'the CRM calling line'; onboardin... | P3 | S | Verified - already Lofty | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-08 | Freshness Stamp | Confirmed what it stamps: the hand-read of both artifact databases' 'state' collection that DRIFT_ROWS summarises (isaLine, pipeline, reClients, ratesSnapshot, isaDailySchedule/isaKpi, grading docs, showing docs) - not the LOAN_PROGRAMS/... | P3 | S | Left as is - already today | Fixed | Pass | 2026-09-22 | FR3 |
| F-FR3-12 | Process | Every direct fetch from this session (WebFetch and curl alike) was refused by the egress proxy with a 403 on CONNECT for all 12 hosts tried (va.gov, hud.gov, fhfa.gov, rd.usda.gov, fred.stlouisfed.org, freddiemac.com, bankrate.com, veter... | P3 | S | Open | Open | Pass | — | Derek (CTO) / Steven |
| F-FR4-02 | Freshness | Alert field: Chicago's Beach Hazards Statement verified on an NWS page dated today. Temecula/San Diego/Los Angeles/Las Vegas: NWS zone pages retrieved today show no Hazardous Weather Conditions section (alert left empty on positive evide... | P3 | S | Open | Open | Pending | — | weather-news-refresh Mac task / FR4 |
| F-FR4-03 | Accuracy | High/low come from one consistent live point-forecast source (API Ninjas 3-hourly). NWS zone ranges differ by 2-5F in three cities: Temecula NWS 83-88/59-65 vs 82/68; San Diego coast NWS 76-80 vs 82; Las Vegas NWS 86-90 (west side) vs 93... | P3 | S | Open | Improved | Pass | 2026-09-22 | FR4 |
| F-FR4-07 | Accuracy | Sector closes are single-sourced (Strategitz newsletter); cvj.ai reports XLK +2.4% / XLC +3.84% and Investopedia gave intraday +2.1% / +4.1%. Benzinga's leading/lagging page is egress-blocked. Arm's move differs by outlet (Yahoo ticker +... | P3 | S | Open | Open | Pending | — | FR1 / next market refresh |
| F-FR4-09 | Consistency | The AI news card lives in panel-pedefense (HTML line ~5787) but the freshness board files its row under panel-tools, so its 'last refreshed' row points at the wrong panel. Also the board stamps AI news from liveFeeds.aiNewsList.checkedAt... | P3 | S | Improved | Improved | Pass — panel half fixed by F-W1-08 (deck master, merge aa00d3b: AI news → panel-pedefense). The stamp-source half was deliberately NOT applied: W1 showed the aiNews doc has no parseable date and the feed stamp is what is on screen (F-X2-18). | 2026-09-22 | W1 |
| F-FR4-11 | Data quality | Pre-existing rows that could not be refreshed today still point some Menifee/San Diego/LA items at Patch daily-digest pages of other towns (e.g. Menifee rows -> an Oceanside/Camp Pendleton digest; San Diego 'Bluff collapse' -> a Patch AM... | P3 | S | Open | Open | Pending | — | daily feed task |
| F-FR5a-04 | Plugin/Integration | Lazy-senior-dev ruleset injected on every prompt and every subagent by two Node lifecycle hooks; /ponytail lite/full/ultra/off and review/audit/debt/gain commands. Optional: overlaps the vendored Karpathy principles and its subagent inje... | P3 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-05 | Plugin/Integration | Two-process web app (FastAPI backend :7001 + Vite frontend :5173, or docker-compose) that turns screenshots/mockups/Figma/recordings into HTML-Tailwind/React. Occasional use for a landing page or deck panel from a Canva mock; the hosted ... | P3 | M | Recommended | Open | Pending | 2026-09-22 | Steven |
| F-FR5a-07 | Plugin/Integration | Vendored at .claude/skills/find-skills/SKILL.md, byte-identical to upstream (verified against npx skills add vercel-labs/skills@find-skills -g -y in a fake HOME). Teaches the team to search skills.sh / npx skills find before building. Ne... | P3 | S | Implemented | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5a-08 | Plugin/Integration | Vendored at .claude/skills/apple-design/SKILL.md, byte-identical to upstream. Apple's fluid-interface, materials, typography and reduced-motion guidance translated to the web; the reference for polishing Command Deck sheets, drawers and ... | P3 | S | Implemented | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5a-09 | Plugin/Integration | Read-only codebase analysis that recommends hooks, skills, MCP servers, subagents and slash commands. Sandbox: /plugin marketplace add anthropics/claude-plugins-official and /plugin install claude-code-setup@claude-plugins-official succe... | P3 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-10 | Plugin/Integration | Autonomous AI penetration-testing agent (code, web apps, APIs) running in a Docker sandbox; requires Python >=3.12 and a running Docker daemon. Sandbox: pip on Python 3.11 refused; uv venv --python 3.12 + uv pip install strix-agent insta... | P3 | M | Recommended | Escalated | Pending | 2026-09-22 | Steven |
| F-FR5a-11 | Plugin/Integration | Installs and health-checks upstream CLIs (twitter-cli, rdt-cli, yt-dlp, OpenCLI, Jina reader, Exa) so an agent can read X, Reddit, YouTube, LinkedIn, Instagram, Facebook, RSS and any page. Sandbox: pip install git+https://github.com/Pann... | P3 | M | Recommended | Escalated | Pass | 2026-09-22 | Steven |
| F-FR5a-12 | Plugin/Integration | Open prompt library with a TUI, an MCP server and a Claude Code plugin (/prompts.chat:prompts, /prompts.chat:skills, two agents, discovery skills). Sandbox: plugin install verified against a fake HOME, npm package 0.1.1 runs. Low value: ... | P3 | S | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5a-13 | Plugin/Integration | A directory of open-source alternatives to commercial software, per Steven's description. Egress-blocked from the sandbox (curl 000, WebFetch EGRESS_BLOCKED) and the session's WebSearch budget was already exhausted, so the site itself co... | P3 | S | Implemented | Implemented | Pending | 2026-09-22 | Integration Engineer |
| F-FR5a-15 | Plugin/Integration | Boots a virtual iPhone on Apple Silicon (macOS 15+, Xcode + iOS SDK) from Apple's PCC research VM images: downloads and patches IPSW, DFU restore, custom firmware, then screenshots/touch/keys over a control socket; brew install zqxwce/ta... | P3 | S | Recommended | Escalated | Pending | 2026-09-22 | Steven |
| F-FR5a-16 | Plugin/Integration | Hosted/self-hostable MCP server exposing 500+ pay-per-call tools (search, crypto/DeFi data, paid reports, utilities) settled in USDC over x402/MPP or by card (claude mcp add agent402 -- npx -y agent402-mcp; FREE_MODE=true npm start to se... | P3 | S | Recommended | Escalated | Pending | 2026-09-22 | Steven |
| F-FR5a-17 | Plugin/Integration | A Python library, not an agent tool: small Hugging Face encoder checkpoints (ModernBERT-large 421M / mmBERT-base 322M) that answer typed questions (choice, score, noul = calibrated yes/no) over an email, ticket or JSON in one forward pas... | P3 | L | Recommended | Open | Pass | 2026-09-22 | Steven |
| F-FR5b-02 | Plugin/Integration | README says Python 3.10+, but agent-harness/whatsapp_cli/whatsapp_cli.py:1232 uses a backslash inside an f-string expression, which is Python 3.12+ syntax. Verified: pip install into a 3.11 venv succeeds but `whatsapp-cli --help` fails w... | P3 | S | New | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-04 | Stale Content | The WhatsApp row was added exactly as instructed ('spec written 2026-09-22 · Mac install pending · not yet live'). The paragraph directly under the table still says 'WhatsApp was removed from this list rather than left showing not connec... | P3 | S | Resolved | Fixed | Pass — rewritten by F-M4-01; deck master has 0 hits for 'Discord replaces it as the third channel' and the whatsapp-cli row and prose agree. | 2026-09-22 | M4 |
| F-FR5b-07 | Plugin/Integration | A fetched README summary claimed OmniRoute reads OPENROUTER_API_KEY-style environment variables; a grep of the 3.8.50 source and docs found no such reader (only its own OMNIROUTE_API_KEY, telemetry TTLs and OAuth client ids). Keys enter ... | P3 | S | New | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-08 | Current State | bytez.com/models, openrouter.ai/models?q=free, build.nvidia.com/models, support.claude.com and docs.higgsfield.ai are EGRESS_BLOCKED from the sandbox; github.com/cheahjs/free-llm-api-resources returned HTTP 404; the session's WebSearch b... | P3 | S | New | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-09 | Plugin/Integration | `pip install scrapling` (exit 0) installs the parser only: `from scrapling.fetchers import Fetcher` fails with ModuleNotFoundError: curl_cffi. `pip install "scrapling[fetchers]"` (exit 0, curl_cffi 0.16.3) fixes it, as the README's insta... | P3 | S | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-10 | Plugin/Integration | On Python 3.11 PyPI resolves scrapegraphai 1.76.0 (install exit 0) which imports `ChatOllama` from langchain_community — removed in langchain-community 0.4.2, the version 1.76.0 itself requires — so a fresh 3.11 install is broken today (... | P3 | S | Broken | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-13 | Plugin/Integration | Read in full (last commit 2026-07-05): a Claude Code plugin marketplace (body/mind/work/lifestyle/relationships) of SKILL.md files, JSON schemas and cadence reviews on a Mac + Obsidian vault. Body data comes from Oura, Garmin and Withing... | P3 | S | New | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-FR5b-14 | Bug | node tests/runtime-harness.js on the edited copy: ok:true, 0 exceptions, 0 safeRun failures, 337 containers rendered, 0 shape mismatches. It reports two missingIds — vanessaMicBtn and steveMicBtn (1 lookup each) — and the identical two a... | P3 | S | New | Open | Pass | 2026-09-22 | Reliability Engineer |
| F-FR5b-15 | Plugin/Integration | `GOPATH=/tmp/fr5b-go go install github.com/normen/whatscli@latest` → exit 0, 30 MB binary (whatsmeow 2026-07-30 snapshot). Builds fine; rejected for the Vanessa channel because it has no non-interactive mode (README: 'No automation of me... | P3 | S | New | Documented | Pass | 2026-09-22 | Integration Engineer |
| F-L1-06 | Continuous-improvement log (dated audit record) | One CI log entry dated 2026-09-07 records a live Follow Up Boss pull ('stage counts, 39 contacts created in 90 days') as part of that day's freshness sweep. It is a dated record of what was done at the time. | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | integrator |
| F-L1-07 | ISA KPI scorecard - provenance of a dated figure | The isaKpi source note asserted the figures were 'the last Follow Up Boss figures, not Lofty figures'. The figures are real and their provenance is real, but the note named the retired CRM. | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | L1 |
| F-L1-08 | Google Calendar directory | A tracked Google calendar was named after the CRM that created it: 'Follow Up Boss (appointments & tasks)'. | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | L1 (label); Steven (Google-side rename, optional) |
| F-L1-09 | Embedded assets | The brief named three base64 blob lines (845, 1366, 4643). There are in fact 22 base64 payloads across 12 lines that contain 'fub'/'FUB' by chance - lines 24004-24022 are the Vanessa/Steve avatar video and audio blobs. A global search-an... | P3 | — | Verified | Documented | Pass | 2026-09-22 | L1 |
| F-L1-10 | Verification | Harness, base64 integrity and re-grep all clean. | P3 | — | Verified | Documented | Pass | 2026-09-22 | L1 |
| F-L2-05 | element id rename | The stat-row id fubKeyNumbers was renamed to leadIntakeNumbers. This was safe to do: the string appeared exactly once in the whole file - the HTML attribute itself - so no JS, CSS or harness probe reads it. It is not a document key or a ... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | L2 |
| F-L2-07 | removed FUB-only row | The 'Lead-forwarding email (Follow Up Boss - retired)' stat existed only to display a followupboss.me address. It was removed rather than relabelled, and replaced with an honest line telling the ISA that no Lofty forwarding address is kn... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | L2 |
| F-L2-08 | unverifiable live fact kept with a warning | The lead-facing calling number (619) 651-9845 was added in September 2026 as the number leads see. Whether it still routes anywhere useful now that the old CRM is gone cannot be checked from this page. The number was kept (it is Steven's... | P3 | — | Current | Open | Pending | — | Steven |
| F-L2-09 | base64 / false-positive check | This file contains no base64 or data-URI asset blobs, so none of the 51 pattern hits was an accidental letter match. Every hit was real prose or real code and every one was adjudicated individually. The longest lines in the file (2,098-4... | P3 | — | Verified | Documented | Pass | 2026-09-22 | L2 |
| F-L2-10 | self-inflicted defect, caught and fixed | The first rewrite of the Live CRM Import empty-state put an unescaped apostrophe ('another CRM's numbers') inside a single-quoted JavaScript string, which broke the whole inline script with SyntaxError: missing ) after argument list. The... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | L2 |
| F-L3-08 | Research citations | docs/CAIO-DISRUPTION-BRIEF.md was rewritten around Lofty, but its data twin docs/data/caio-brief.json still carries the vendor name inside external source titles and source URLs (a RISMedia article title, a vendor developer-docs URL). A ... | P3 | — | Current | Open | Pending | — | Steven (decision) |
| F-L3-09 | False positive — do not touch | docs/inventory/cloud-routines.md line 31 contains the cloud trigger id `trig_01LC6fUbVyaEF1nEFdGcQjU8`, which matches the search pattern on the letters "fUb" by chance. It is the identity of a live routine (Command Deck weather & news re... | P3 | — | Verified | Documented | Pass | 2026-09-22 | L3 |
| F-L3-14 | Other engineers' files | The five files flagged as in-flight with another engineer — MAC-INSTALL.md, MAC-SETUP.sh, mac-verify.sh, REMOTE-ACCESS.md, docs/SECOND-MAC-SETUP.md — were checked with the widened pattern and are already clean. They already name Lofty an... | P3 | — | Verified | Documented | Pass | 2026-09-22 | L3 |
| F-M1-07 | deck/observability | A device's roster entry can only record a Mac-fed write that went through the page. A scheduled task writing straight to the artifact DB carries no device identity, so the 'feeds Mac documents' marker is a floor, not a census. | P3 | — | Verified | Documented | Pass | 2026-09-22 | M1 |
| F-M1-08 | test/coverage | The runtime harness cannot exercise the roster's write path: DEV_SETTLE_MS is 2.5 s of real time and a full harness run finishes in about 1.2 s, so devTouch always returns early under test. | P3 | — | Verified | Documented | Pass | 2026-09-22 | M1 |
| F-M1-09 | docs/second-mac | The task count for Mac #1's runner disagrees between two live documents, so a second-Mac setup copying 'the task set' has no single number to check against. | P3 | — | Current | Open | Pending | — | Steven / next Mac session |
| F-M2-07 | command-deck.html — execSyncRegistry() panel attributions (lines ~21571 and ~... | Two freshness-board rows name the wrong panel, so the board's jump-to-panel link lands somewhere the feed is not. add("Top performers", TOP_PERFORMERS_SYNCED_AT, "panel-quantvue") — but topStocksRows / topEtfsRows / topDividendRows / top... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | W1 |
| F-M2-08 | command-deck.html — PANEL_VERIFIED_AT coverage | Seven of the 39 panel sections have no PANEL_VERIFIED_AT entry: panel-james, panel-pto, panel-work, panel-tools, panel-kanban, panel-pedefense and panel-dreamempire. One of them, panel-pedefense, was demonstrably re-sourced today (PE_MOV... | P3 | — | Superseded | Documented | Pass | 2026-09-22 | W1 |
| F-M2-09 | command-deck.html — over-claim sweep (strings asserting verification or fresh... | Swept for 'verified', 'end to end', 'as of', 'live', 'up to date', 'current', 'checked', 'All N fresh' and every one of the 98 occurrences of 2026-09-22. Two over-claims found and fixed (F-M2-01, F-M2-06). Everything else checked out: th... | P3 | — | Verified | Documented | Pass | 2026-09-22 | M2 |
| F-M2-10 | command-deck.html — tests | Harness clean after the change, with containers unchanged at 337 as required, and the renderer degrades correctly on malformed map entries. | P3 | — | Verified | Documented | Pass | 2026-09-22 | M2 |
| F-M3-01 | Build/Release — MAC-SETUP.sh | The two hand-written runbooks (MAC-INSTALL-tooling.md / FR5a, MAC-INSTALL-comms-data.md / FR5b) now have one executable form: MAC-SETUP.sh, an idempotent installer grouped in FR5a's own order of operations (prerequisites, then the brain'... | P3 | — | New | Implemented | Pass | 2026-09-22 | M3 |
| F-M3-13 | PATH — npm globals and ~/.local/bin | FR5b's LaunchAgent plist puts $HOME/.npm-global/bin on PATH, i.e. this Mac uses a custom npm prefix; uv tool and pipx shims land in ~/.local/bin. Both are commonly absent from a non-login shell's PATH, which made presence checks re-insta... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M3 |
| F-M4-14 | execSyncRegistry source comment, line 21536 (weather/news feed registry) | 'Cloud routines were ruled out - their db writes park on a permission prompt (see CI log).' Not rendered, but it is the reasoning a future engineer inherits for these feeds. | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-23 | renderAiNews, line 22224 (now 22225) | A leftover You.com-era string, 'Connecting to live search for today's AI news', assigned and then immediately overwritten on the next line by the truthful 'this page makes no live calls of its own'. Never seen by a user, but it is a fals... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M4 |
| F-M4-26 | LEFT ALONE - CI_LOG_DEFAULT entries, lines 19105-19115, and the same narrativ... | Several dated kaizen-log entries record the now-disproved belief ('cloud routines cannot do it anyway'; 'An unattended cloud sandbox has nobody to approve that, so the run hangs. Third confirmation.'). | P3 | — | Verified | Documented | Pass | 2026-09-22 | M4 |
| F-M4-28 | FLAGGED, NOT CHANGED - renderHealthCoaching broken-pipeline nudge, line 16099 | 'The ingest watcher on this Mac has stopped - nothing new will arrive until it is running again.' Accurate for the Health Auto Export chain today, but it becomes false once the Notion phone path fills appleHealth, which bypasses the watc... | P3 | — | Open | Open | Pending | — | re-check after the first phone run (F-M6-15) |
| F-M5-10 | Routine spec drift | routines/backup-watchdog-cloud.md carries a stale honest-baseline block that now inverts the correct operational call. It says to expect lastBackup 2026-09-14 and 'If it returns CURRENT, the watchdog is wrong - check it before trusting i... | P3 | — | Stale | Open | Pending | — | CTO Innovator (routine spec owner) |
| F-M6-04 | Notion Health Log schema / Source options | The spec described the `Source` select as having a single option `claude-ios`. The real select carries three: `claude-ios`, `health-auto-export`, `manual`. Minor, but a sync that filters rows on Source would have dropped the other two si... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-08 | appleHealth / history range stated imprecisely | Both files described the history to be preserved as 'the Sep 6-13 daemon history'. The `daily` buckets actually run 2026-09-06 through 2026-09-12 (7 days); 2026-09-13 is the value of `meta.last_received`, not a day with daily buckets. An... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-11 | health-notion-sync / freshness watch | No OUTPUT_WATCH row existed for this task, so a silently dead sync would not have been flagged. The obvious threshold to copy from the neighbouring tasks (14 h) is exactly the task's own widest inter-run gap (07:45 -> 21:45 = 14 h), whic... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-12 | deck / 'via' badge label | The spec's 'one known display nit' paragraph claimed notion-health-log would render as 'via Claude session' until someone added the label. The label has since been added, so the paragraph was stale documentation asserting a live defect t... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | M6 |
| F-M6-13 | Command Deck DB / stravaSnapshot wrapper | Checked the reported bare-value bug in stravaSnapshot. As the document stands now it is correctly wrapped: top level is `v`, and `v` is an object with keys activities / syncedAt / via. The bug is not present in the current version; no re... | P3 | — | Verified | Documented | Pass | 2026-09-22 | M6 |
| F-S1-12 | command-deck/document-shape | The cliAnythingStatus document does not exist in the artifact store. A read of artifact 1624daae-d683-405a-971d-c5828dce0f8d, collection state, doc_id cliAnythingStatus returned 'No document'. Nothing has ever written it. | P3 | — | New | Implemented | Pass | 2026-09-22 | S1 |
| F-S1-16 | repo-convention | .claude/skills/cli-anything-connectors/SKILL.md is 207 lines, over the repo's ~200-line skill convention. Most skills run 110-165; the largest comparable domain skill, apple-health-notion, is 205. | P3 | — | Verified | Documented | Pass | 2026-09-22 | S1 |
| F-S1-17 | credential-location/consistency | Two different credential locations are now named for Showami. The pre-existing SH_INTEGRATIONS row in panel-showings says 'Put the key in ~/.config/showing-sync/.env'; the skill standardises browser-harness credentials on the macOS keych... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | W2 + integrator |
| F-V1-11 | REFUSED list — reviewed, unchanged | All seven refusals were re-read against their stated reasons and all seven stand: vphone-cli (SIP/AMFI relaxation on the Mac holding the keychain and client files), Agent402 (spends money per call by design), the whole addyosmani/agent-s... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V1 |
| F-V2-01 | vendored skills | All nine vendored skills load. YAML frontmatter parses for all nine, `name` matches the directory name in all nine, `description` is present and non-empty in all nine (237-581 chars, all well under the loader limit). A fresh session woul... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-V2-03 | vendored skills | All fifteen anchor links from security-and-hardening/SKILL.md into references/hardening-patterns.md resolve to real headings. No dead anchors. | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-V2-04 | injection surface | apple-design/SKILL.md carries the only output-controlling directive among the nine: on first invocation it tells the agent to 'respond only with' a fixed blurb and 'Do not provide any other information until the user asks a question.' Be... | P3 | — | Recommended | Recommended | Pending | — | Integration Engineer |
| F-V2-06 | injection surface | Injection scan of all nine is otherwise CLEAN — checked, not assumed. No 'MUST USE' frontmatter (the pattern that got Agent Reach excluded), no instruction to ignore prior context, override the router, expand scope, suppress disclosure t... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-V2-16 | omniroute failover | `--task` or `--force` as the final argument crashes with a raw bash error instead of the script's own usage message, because `set -u` is active and `$2` is unbound. | P3 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-17 | omniroute failover | probe.sh is located as `$(dirname "$0")/probe.sh` from the launcher, so a symlink install (rather than the documented copy) breaks self-recovery silently. The README does specify copying both files into the same directory, and the Launch... | P3 | — | Broken | Open | Fail | — | Integration Engineer (FR5b's failover) |
| F-V2-19 | omniroute failover | Three things in the failover scripts were tested and are GENUINELY CORRECT. (1) The subscription credential really is kept off the proxy. (2) The switch-back success condition really does match today's Claude Code output. (3) The probe r... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-V2-22 | unsupported claims | The install documentation's version and provenance claims hold up on a 10-of-10 sample — a genuinely good result, checked rather than assumed. The tooling runbooks are also unusually well-hedged, consistently labelling sandbox results as... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-V2-23 | unsupported claims | One documented status claim is UNVERIFIABLE from this sandbox and should be labelled rather than trusted or deleted: CONNECTIONS.md:42 'Orca Computer Use v1.4.203 ... Installed on the Mac'. There is no Mac here and no inventory artefact ... | P3 | — | Recommended | Recommended | Pending | — | Integration Engineer |
| F-V2-29 | mac-verify.sh (for V1) | A placeholder credential passes as a real one. check_env_file tests only that something non-whitespace follows the `=`, so a skeleton value left in place reads as 'set'. | P3 | — | Broken | Open | Fail | — | V1 (mac-verify.sh owner) |
| F-V2-30 | mac-verify.sh (for V1) | What mac-verify.sh gets RIGHT, tested against a deliberately broken environment: it never prints a credential value; it reports missing tools as FAIL; it reports a wrong-mode .env as FAIL with the exact mode and the fix command; it repor... | P3 | — | Verified | Documented | Pass | 2026-09-22 | V2 |
| F-W1-09 | execSyncRegistry() freshness board — full sweep | Swept all 28 board rows by resolving each row's DOM render target to the <section class="panel" id="..."> line range that contains it. Exactly three rows were wrong — the three already reported (F-W1-06/07/08). NO ADDITIONAL wrong-panel ... | P3 | — | Verified | Documented | Pass | 2026-09-22 | W1 |
| F-W1-11 | PANEL_VERIFIED_AT coverage gap (NOT FIXED, by design) | panel-tools is kind:'ref' — so it DOES read PANEL_VERIFIED_AT — but has no row in the map. It therefore renders the dateless 'Reference' badge, which is exactly the over-claim the map's own header comment says the map was created to elim... | P3 | — | Recommended | Recommended | Pending | — | next freshness audit (someone who checks panel-tools) |
| F-W1-12 | Freshness board jump links (PRE-EXISTING, NOT FIXED) | The board renders its jump links as plain anchors, '<a href="#" + r.panel + ">', and the deck has no hashchange / anchor-interception handler anywhere. A row naming a panel on another tab therefore anchors to an element that switchPage()... | P3 | — | Recommended | Recommended | Pending | — | integrator |
| F-W2-11 | Credential location / Showami | Showami's credential location was stated two ways. Reconciled on ~/.config/cli-anything/.env (macOS keychain preferred), because that is the only path any executable asserts and because the credential is a CLI-Anything browser-harness lo... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | W2 + integrator |
| F-W2-12 | integrations/CONNECTIONS.md line 16 | The superseded manual CLI-Anything install instruction had already been corrected by another engineer mid-session; one concrete requirement was still missing from it. | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | W2 |
| F-W2-13 | always-on register / new cloud writer | The new feed-freshness watchdog exists and is scheduled, and has left no document yet. Recorded as unproven rather than working, as instructed. | P3 | — | New | Documented | Pending | — | W2 (check for feedFreshness after 16:12Z) |
| F-X2-08 | duplicate work / program facts | F-FR1-03 (deck) and F-FR3-01 (portal) re-verified the same eight PROGRAM_FACTS rows independently and added different clauses (the portal adds USDA county caps and the five Mortgagee Letters; both added IRRRL/OBBBA wording). The deck-por... | P3 | — | Recommended | Recommended | Pending | — | integrator |
| F-X2-11 | unrecorded DB write | F-M5-03 found marketingQueue carrying an orphaned top-level 'data' key at ~13:32 UTC and said the removal write was Steven's or the caller's. The 14:37 UTC store export shows the document with a single 'v' key — the orphan is gone — but ... | P3 | — | Recommended | Recommended | Pending | — | coordinator |
| F-X2-13 | stale cross-claim / F-E8-64 | F-E8-64 explained the failed 'Vanessa orchestrated ops review' routine by 'its prompt calls write_db, which parks'. F-INT-08 disproved the premise and F-W2-07 measured the run dying 5.7 s after firing on 2026-09-18, a startup failure sha... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | X2 |
| F-X2-14 | stale cross-claim / F-M1-10 and F-M4-24/25 | Engineers working parallel branches each reported the other's region unfixed: F-M1-10 left lines 5977 and the AI_TEAM_TOOLBOX row 'without an owner' (M4 fixed both: F-M4-09, F-M4-15); F-M4-24 reported the STRATEGY_SYNCED_AT parenthetical... | P3 | — | Resolved | Fixed | Pass | 2026-09-22 | X2 |
| F-X2-16 | count check / dated FUB references | F-L3-04 listed per-file counts of retired-CRM references left in dated audit records; the coordinator cites 395. X2's recount at ~15:00 UTC with the widened pattern over docs/ (excluding today's sweep files, which describe the sweep itse... | P3 | — | Verified | Documented | Pass | 2026-09-22 | X2 |
| F-X2-17 | process / unrecorded routine creation | Five cloud routines were created during the day (write probe, weekly backup writer, Pipeline Sync live, ISA escalation ladder, feed-freshness watchdog) and appear only in always-on/README.md, routines/*.md and CLOUD-WRITE-ARCHITECTURE.md... | P3 | — | Recommended | Recommended | Pending | — | coordinator |
| F-X2-18 | disagreement / AI-news freshness stamp source | F-FR4-09 asked that the freshness board read the aiNews document's asOf instead of the liveFeeds stamp; F-W1-08 refused on evidence (the aiNews doc has no syncedAt and a prose asOf that execIsoOf() cannot parse, so the change would have ... | P3 | — | Verified | Documented | Pass | 2026-09-22 | X2 |

### Evidence and fix, for every 2026-09-22 row

Cycle-schema rows show the engineer's Before/After; flat-schema rows show the engineer's Evidence/Fix. The *X2 verification*
line is where X2 found the fix (or why the row is not closed).

**F-FR1-01 — freshness**  
Before: MARKET_SYNCED_AT = "2026-09-07 10:05 AM PDT (Redfin re-checked — July 2026 is still the latest published period; active-listing counts as of Sep 4)"; San Diego $937,251 / +2.4% / 29d / 99.5%; Temecula $739,630 / +2.0% / 37d / 99.6%; no Murrieta entry  
After: MARKET_SYNCED_AT = "2026-09-22 13:20 UTC — re-baked from the ratesSnapshot document …"; San Diego $961,781 / +5.7% / 28d / 99.2% (https://www.redfin.com/blog/san-diego-county-ca-housing-market-august-2026/); Temecula unchanged (https://redfin.com/city/19701/CA/Temecula/housing-market); Murrieta $659,670 / -3.7% / 44d (https://www.redfin.com/city/12866/CA/Murrieta/housing-market); document: artifact 1624daae… state/ratesSnapshot v9  
X2 verification: Fixed — deck master: MARKET_SYNCED_AT = "2026-09-22 …"; deck 705dcf6 (merge fr1-markets)  

**F-FR1-03 — freshness**  
Before: PROGRAM_FACTS_SYNCED_AT = "2026-09-07"; VA row: no IRRRL fee, 'Deductible again on Schedule A for tax year 2026', ROAD Act 'now requires' URLA language; sources were short names without URLs  
After: PROGRAM_FACTS_SYNCED_AT = "2026-09-22 13:10 UTC — every row re-checked …"; sources: https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026 · https://www.hud.gov/news/hud-no-25-145 · https://www.hud.gov/sites/dfiles/hudclips/documents/2025-23hsgml.pdf · https://www.rd.usda.gov/media/file/download/usda-rd-sfh-guarantee-loan-program-101-jan-2026.pdf · https://www.veteransunited.com/valoans/va-funding-fee/ · https://www.military.com/va-loans/rates/claim-va-fundin  
X2 verification: Fixed — deck master: PROGRAM_FACTS_SYNCED_AT = "2026-09-22 …"; deck 705dcf6 (merge fr1-markets) — the portal's copy was re-verified separately by F-FR3-01 (F-X2-08)  

**F-FR1-09 — freshness**  
Before: MORTGAGE_RATES_SYNCED_AT = "2026-09-22 02:24 UTC — 6 of 9 rows re-baked from ratesSnapshot … VA 30-yr refinance, VA 15-yr and Jumbo 15-yr … still carry their own Sep 9 / Sep 2 hand-check dates"; rows 6.25 / null, 5.50 / 6.196, 6.29 / 6.36  
After: MORTGAGE_RATES_SYNCED_AT = "2026-09-22 13:30 UTC — 6 of 9 rows re-baked from ratesSnapshot … The three rows that feed does not carry were re-verified by hand 2026-09-22 …"; rows 6.50 / null (asOf Sep 21, 2026), 5.75 / 6.409 (asOf Sep 20, 2026), 6.50 / 6.74 (asOf Sep 20, 2026) — https://www.veteransunited.com/refinance/ · https://www.navyfederal.org/loans-cards/mortgage/mortgage-rates.html · https://www.bankrate.com/mortgages/jumbo-loan-rates/  
X2 verification: Fixed — deck master: MORTGAGE_RATES_SYNCED_AT = "2026-09-22 13:30 …"; VA 30-yr refinance APR later filled from FR3's read (deck c29b00f); the two passes date the same Navy Federal page Sep 20 vs Sep 22 (F-X2-06)  

**F-FR2-14 — Bug**  
Before: state/stravaSnapshot v7 = {activities:[["Sep 12",…]], syncedAt:"2026-09-22T12:32:14Z"} — no v wrapper, no via, one row.  
After: state/stravaSnapshot v9 = {v:{activities:[Sep 12, Aug 31, Aug 30 rows], syncedAt:"2026-09-22T13:05:00Z", via:"FR2 freshness pass (Strava connector, direct read)"}}. Evidence: ArtifactData get/set/update results on https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d, 2026-09-22 13:05 UTC.  
X2 verification: Fixed — artifact DB state/stravaSnapshot v9 (ArtifactData set/update 13:05 UTC); wrapped in the 14:37 UTC export; closes F-E7-03 / F-E8-29 at the document  

**F-FR2-15 — Bug**  
Before: stravaSnapshot v7 written unwrapped at 2026-09-22T12:32:36Z by an unidentified writer.  
After: Document corrected to the wrapped shape at v9; writer unidentified. Next step: list the Mac runner tasks and cloud routines that mention stravaSnapshot (candidates: a Strava sync task or routine created since Sep 20), fix its write to {v:{…}}, and verify by reading the document back after its next run. Evidence: ArtifactData get result at 12:5x UTC showing version 7 / updatedAt 2026-09-22T12:32:36.82046Z.  
X2 verification: Escalated — identification by F-M5-01; fix pending (F-W2-01)  

**F-FR3-01 — Stale Content**  
Before: PROGRAM_FACTS_SYNCED_AT = "2026-09-07"; sources named without URLs; VA mi lacked IRRRL/cash-out tiers; non-QM reserves 6-12 mo.  
After: PROGRAM_FACTS_SYNCED_AT = "2026-09-22 13:00 UTC - every row re-checked ..."; per-row URLs: https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/ , https://news.va.gov/145096/borrowers-can-deduct-funding-fees/ , https://bipartisanpolicy.org/explainer/whats-in-the-21st-century-road-to-housing-act/ , https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026 , https://www.jvmlending.com/blog/california-conforming-loan-limits/ , https://www.  
X2 verification: Fixed — portal master: PROGRAM_FACTS_SYNCED_AT = "2026-09-22 13:00 …"; portal 9338b34 (merge fr3-portal)  

**F-FR3-02 — Stale Content**  
Before: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-02"; Temecula summary sourced to NewHomeSource (cached) / Trulia; San Diego summary sourced to AnnieMac / CFA Institute.  
After: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-22 13:05 UTC - WebSearch + Perplexity ..."; https://www.drhorton.com/california/inland-empire/menifee/spring-creek , https://www.drhorton.com/california/inland-empire/winchester/juniper-at-canterwood , https://www.drhorton.com/california/san-diego/escondido/tesoro-square , https://www.lennar.com/new-homes/california/inland-empire/promo/inllen_fss26 , https://www.lennar.com/new-homes/california/san-diego/promo/sdglen_fss26 , https://www.richmondamerican.com/  
X2 verification: Fixed — portal master: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-22 13:05 …"; portal 9338b34 (merge fr3-portal) — Meritage statement contradicts F-FR1-04 (F-X2-07)  

**F-FR3-03 — Stale Content**  
Before: VA 30-yr refinance 6.25% / - (Veterans United, Sep 9); VA 15-yr fixed 5.50% / 6.196% (Navy Federal / Veterans United, verified Sep 2); Jumbo 15-yr fixed 6.29% / 6.36% (Bankrate, verified Sep 2); stamp ended at "...rate week ending Sep 18, 2026".  
After: VA 30-yr refinance 6.50% / 6.822% APR - Veterans United "valid as of Sep 21st, 04:05 PM CST" https://www.veteransunited.com/va-loans/va-mortgage-rates/ ; VA 15-yr fixed 5.75% / 6.409% APR - Navy Federal "Rates as of Sep 22, 2026 ET" (0.250 pts + 1.00% origination; Veterans United cross-check 5.990% / 6.735%) https://www.navyfederal.org/loans-cards/mortgage/mortgage-rates.html ; Jumbo 15-yr fixed 6.50% / 6.740% APR - Navy Federal "Rates as of Sep 22, 2026 ET" (0.500 pts). MORTGAGE_RATES_SYNCED_AT  
X2 verification: Fixed — portal master: 'Rates as of Sep 22, 2026 ET' (2 hits), 6.822 APR; portal 9338b34 (merge fr3-portal) — date split with F-FR1-09 (F-X2-06)  

**F-FR3-06 — Stale Content**  
Before: Four notes stamped 'verified Sep 2026'; Loan United 'licensed 41 states'.  
After: Each note now says 'verified 2026-09-22' with the finding. Sources: https://www.housingwire.com/articles/change-lending-and-u-s-treasury-settle-lawsuit-over-cdfi-certification/ , https://www.thechangecompany.com/post/united-states-treasury-cdfi-fund-renews-change-lendings-cdfi-certification , https://www.changewholesale.com/post/cdfi-fact-sheet , https://www.kingsmortgage.com/ , https://www.housingwire.com/articles/onity-sells-reverse-mortgage-business-foa/ , https://reverse.mortgage/liberty-rev  
X2 verification: Fixed — portal master: lender notes 'verified 2026-09-22', Loan United '24 states/jurisdictions', Onity/FAR note; portal 9338b34 (merge fr3-portal)  

**F-FR4-01 — Freshness**  
Before: syncedAt 2026-09-21 08:05 PM PDT; Temecula 62F Clear H75/L58; Chicago 62F Overcast H63/L57; Las Vegas 83F H83/L73; source wttr.in (scheduled refresh)  
After: syncedAt 2026-09-22 06:20 AM PDT; Temecula 66F Partly cloudy H82/L68; San Diego 68F Overcast H82/L70; Los Angeles 64F Clear H84/L70; Chicago 57F Overcast H63/L57 + Beach Hazards Statement; Las Vegas 66F Clear H93/L72; Washington 59F Overcast H64/L55; New Braunfels 75F Clear H95/L75. Evidence: API_NINJAS_GET_WEATHER / _FORECAST via Composio (lat/lon); NWS https://forecast.weather.gov/MapClick.php?zoneid=CAZ048 (Inland Empire: Tue highs 83-88, lows 59-65), ?zoneid=CAZ043 (SD coast: highs 76-80 coa  
X2 verification: Fixed — state/weatherSnapshot syncedAt '2026-09-22 06:20 AM PDT' in the 14:37 export; deck seed via deck 07041b3 (merge fr4-daily)  

**F-FR4-04 — Freshness**  
Before: syncedAt 2026-09-21 08:05 PM PDT; 5 items dated Sep 21/22 (Iranian airlines, United Russia, UK-Saudi, Greenland bases, China expels generals)  
After: syncedAt 2026-09-22 06:20 AM PDT; https://www.reuters.com/world/europe/trump-denmark-greenland-sign-deal-bid-end-arctic-standoff-2026-09-22/ ; https://www.reuters.com/live/live-trump-address-un-general-assembly-world-leaders-grapple-with-iran-ukraine-2026-09-22/ ; https://www.thestar.com.my/news/world/2026/09/22/tehran-hints-at-hormuz-talks-with-us-as-leaders-gather-at-un ; https://www.investing.com/news/world-news/us-open-to-meeting-iran-at-un-no-meeting-scheduled-yet-rubio-says-4910520 ; https  
X2 verification: Fixed — state/newsSnapshot syncedAt '2026-09-22 06:20 AM PDT' in the 14:37 export; deck 07041b3 (merge fr4-daily)  

**F-FR4-06 — Freshness**  
Before: asOf 'Sep 18, 2026 close (Dow -95.40 / Nasdaq +104.25 / S&P +12.74) ...' (doc updatedAt 2026-09-20T22:20Z)  
After: asOf 'Sep 21, 2026 close (Dow +366.19 / Nasdaq +599.55 / S&P +114.20) ... Manually refreshed 2026-09-22 13:10 UTC'. Sources: https://apnews.com/article/wall-street-stocks-dow-nasdaq-3cb34d37f609dde5fb94d695e9665869 ; https://wtop.com/national/2026/09/how-major-us-stock-indexes-fared-monday-9-21-2026 ; https://www.reuters.com/world/china/global-markets-global-markets-2026-09-21/ ; https://finance.yahoo.com/markets/stocks/articles/markets-news-sept-21-2026-110314466.html ; https://www.kiplinger.co  
X2 verification: Fixed — state/marketSnapshot asOf 'Sep 21, 2026 close …' in the 14:37 export; deck seed 'Sep 21, 2026 close' (8 hits); deck 07041b3 (merge fr4-daily)  

**F-FR4-08 — Freshness**  
Before: asOf 'Sourced Sep 7, 2026 — four frontier labs shipped inside one 72-hour window (Sep 1-3)' (doc updatedAt 2026-09-20T21:29Z)  
After: asOf 'Sourced Sep 22, 2026 — ... (manual refresh 13:20 UTC via Perplexity + GitHub)'. Sources: https://decrypt.co/378824/xai-launches-grok-4-7 ; https://llm-stats.com/blog/research/grok-4-7-launch ; https://www.investing.com/news/world-news/exclusivedeepseek-to-brief-un-security-council-on-ai-this-week-sources-say-4910133 ; https://www.datacamp.com/blog/deepseek-v4-1-flash-vs-gemini-3-8-flash ; https://www.reuters.com/legal/transactional/cohere-aleph-alpha-combine-target-enterprise-ai-market-202  
X2 verification: Fixed — state/aiNews asOf 'Sourced Sep 22, 2026 …' in the 14:37 export; deck seed (1 hit); deck 07041b3 (merge fr4-daily)  

**F-FR5b-06 — Plugin/Integration**  
Before: One untested hook stood between client data and free third-party providers.  
After: Launcher-level gate plus a canary test; F-E8-60 can be closed only after both canary halves pass on the Mac.  
X2 verification: Implemented — mode flag + canary written (c3c9de3); F-V2-20 shows the canary covers only the passing argument order — widen it before it counts  

**F-L1-01 — Live CRM import / Lending & Real Estate**  
Evidence: wt-l1-fub/command-deck.html branch point lines 2487-2504 (HTML) and 10901-10976 (JS: FUB_SYNC_AT, FUB_STAGE_TOTALS, FUB_NEW_LEADS_90D, renderFubImport, safeRun).  
Fix: Removed the whole card and its JS. The Lofty card above it already carries the honest empty state: 'Awaiting the first Lofty sync ... No Lofty lead has been imported, so this card shows no counts rather than a guess - there is no real-estate lead data on this page to show.' No figure was substituted. Container count 338 -> 336 (fubStageStats, fubNewLeadRows were the only removed ids that received innerHTML).  
X2 verification: Fixed — deck master: 0 hits loftyLegacyFub / FUB_NEW_LEADS_90D; deck 1a24db0 (merge l1-fub) + 4902159  

**F-L1-03 — Automation narratives (lead triage / lead response / ISA KPI / showings)**  
Evidence: Branch-point lines 4407, 6513, 19977, 26488 (plus 4532, 18337).  
Fix: Rewritten around what must happen now: each task must read Lofty through the Mac's lofty-bridge, which needs Steven's Lofty API key at ~/.config/lofty/.env as LOFTY_API_KEY. The dead credential is not narrated. No key value was written anywhere - only the path and the variable name, which were already on the page.  
X2 verification: Fixed — deck master: 0 hits 'Follow Up Boss' / 'followupboss'; narratives read Lofty + LOFTY_API_KEY path  

**F-L2-01 — privacy / client PII in published source**  
Evidence: Pre-edit isa-portal.html lines 2138-2177 (var FUB_NEW_LEADS_90D = [...39 rows...]); rendered to the DOM at line 2192 via $("fubNewLeadRows").innerHTML. Contrast renderReClients() at pre-edit line 2274 which is deliberately seeded empty for this exact reason.  
Fix: Removed with the whole FUB-only card (policy row: 'the frozen 90-day FUB lead card' -> remove). Post-edit scan for name literals matching '["Firstname L.",' returns 0, and the file now contains 0 email addresses of any kind.  
X2 verification: Fixed — portal master: 0 hits FUB_NEW_LEADS_90D / fubNewLeadRows; portal cf89bab (merge l2-fub) — NOTE the brain repo's tracked copy dashboard/isa/isa-portal.html is still the pre-fix file (F-X2-02)  

**F-L3-01 — Standing rules / prose**  
Evidence: wiki/dashboard-ops/index.md:37-38; context/decisions.md:12-16; .claude/skills/lofty-crm-sync/SKILL.md:80-81,98-99; .claude/skills/vanessa-orchestrator/SKILL.md:104; routines/parallel-csuite-task-cycle.md:65; integrations/CONNECTIONS.md:23.  
Fix: Rule removed in all five places and replaced with: Lofty is the real-estate system of record since 2026-09-22 and is not connected yet; surfaces show "not connected yet", never another system's figure under a Lofty label. No number was relabelled.  
X2 verification: Fixed — brain c440f1f: rule removed in five places; wiki/dashboard-ops reads 'not connected yet'  

**F-L3-06 — Repo mirrors vs. live Mac state**  
Evidence: docs/inventory/agent-roster.md:91,104 (lead-triage-analyst, mktg-analytics-lead); docs/inventory/mac-task-descriptions.md:19,32,37,48 (lead-triage-daily, r11-isa-kpi-compile, r2-lead-response-watchdog, showing-sync); docs/inventory/routine-health.md:7,26,38.  
Fix: Rewritten around Lofty with an explicit "not connected yet — needs LOFTY_API_KEY in ~/.config/lofty/.env" on every task entry, so the repo never claims a live Lofty feed. Editing the live prompts is a HALT: Steven applies them on the Mac, then the next snapshot re-syncs this repo.  
X2 verification: Escalated — repo mirrors rewritten (c440f1f); the live prompts on the Mac still name the old CRM until Steven edits them  

**F-L3-12 — ISA operations**  
Evidence: Carried as F-E12-04 in docs/findings/findings-E12.json:60-76 and in docs/data/auditFindings.json:152,159 (values not repeated here). Also docs/reports/E12-isa-portal.md:129.  
Fix: Not touched — it is a dated finding and the values are contact details. HALT: Steven confirms whether the line and the forwarding address moved to Lofty before any ISA-facing text is changed.  
X2 verification: Escalated — same as F-E12-04: confirm the lead line and forwarding address moved to Lofty  

**F-M1-01 — docs/remote-access**  
Evidence: Read the Command Deck store directly (artifact 1624daae-d683-405a-971d-c5828dce0f8d, collection 'state'): doc 'cloudWriteProbe' exists at version 1, updatedAt 2026-09-22T09:05:56.233291Z, value {result: 'write succeeded unattended'}. Version 1 means a first write, not an overwrite. Corroborated by docs/CLOUD-WRITE-ARCHITECTURE.md and always-on/README.md.  
Fix: REMOTE-ACCESS.md rewritten: the claim is corrected in a named section that says the old line was wrong, when it was last true (2026-09-04), what changed (Claude Code 2.1.277, 2026-09-18) and what still does not (an agent-created routine stores no MCP connectors).  
X2 verification: Fixed — brain d64ff61: REMOTE-ACCESS.md lines 30-32 name the old claim, when it was last true (2026-09-04) and the 09:05Z probe  

**F-M1-02 — deck/sync**  
Evidence: command-deck.html line 25068 (pre-change): hlSetPref used lsSetLocal. Four call sites (hlMetric change, hlCompare change, hl-range buttons, hlAutoToggle change). ArtifactData list of collection 'state' returned 172 docs, none named hlPrefs.  
Fix: hlSetPref now uses lsSet. Nothing depends on hlPrefs being device-local: hlAutoMaybe's once-per-sync guard is hlAutoTried, which stays device-local, and no panel stamp reads hlPrefs. Added hlPrefs to NO_EDIT_STAMP_KEYS so a dropdown change does not also churn sectionEdits (already at version 3104).  
X2 verification: Fixed — deck master 25525: hlSetPref writes with lsSet; deck e0da920 (merge m1-multimac)  

**F-M1-05 — ops/scheduling**  
Evidence: runnerStatus doc (syncedAt 2026-09-22T04:05:04Z) lists 59 tasks, all enabled, with no host field and no lease check in any task. No taskLease document exists in the 172-doc listing of 'state'.  
Fix: REMOTE-ACCESS.md now specifies a PRIMARY/STANDBY lease: a taskLease doc {v:{holder, hostname, acquiredAt, expiresAt}} with a 90-minute TTL, a copyable five-step LEASE CHECK for the top of every task prompt that pins its write with if_version and re-reads to close the both-created-it-at-once race, and a one-command promotion for the standby. NOT IMPLEMENTED: creating the taskLease doc and editing the 59 live task prompts are Steven's, not an agent's.  
X2 verification: Escalated — spec only: REMOTE-ACCESS.md lines 52-71 (taskLease doc + LEASE CHECK); taskLease ABSENT in the 14:37 UTC export  

**F-M2-01 — command-deck.html — PANEL_VERIFIED_AT (line ~21303) + the cfg.kind==="ref" branch of renderPanelStamps()**  
Evidence: FR1-report.md, 'Verified today (end to end)': 'No whole panel qualifies: panel-property, panel-quantvue and panel-hedgefund all contain cards outside this assignment'. FR2-report.md: 'Verified panels (fully re-verified end to end today): none. ... please do not stamp a whole panel "Verified 2026-09-22" from it.' FR3-report.md, 'Verified panels': 'None end-to-end — I re-verified constants and cards, not whole panels, and will not claim otherwise.'  
Fix: Rewrote PANEL_VERIFIED_AT to the STAMP-SCHEMA.md {at, scope, note} shape and the renderer to the three-way form copied from isaPanelStampRegistry() in isa/isa-portal.html. Result across the 33 entries: 0 full, 12 part, 21 review. Every 'part' note names the cards that were re-sourced AND what was left on an older date. 'review' gets no colour class (only st-fresh/st-live/st-stale/st-warn/st-you exist); 'part' under 30 days gets st-fresh.  
X2 verification: Fixed — deck master: PANEL_VERIFIED_AT in {at, scope, note} form — 12 'part', 21 'review', 0 'full'; deck 28945dd (merge m2-stamps)  

**F-M2-02 — command-deck.html — panelStampRegistry() vs PANEL_VERIFIED_AT**  
Evidence: grep of command-deck.html: PANEL_VERIFIED_AT appears at its definition and at exactly one read site inside the ref branch. panelStampRegistry() marks only panel-hedgefund, panel-tools and panel-tax as kind:"ref". Runtime probe (harness, console.warn inside the renderer) printed exactly three ref-branch rows: panel-hedgefund 'Part-checked today', panel-tax 'Reviewed today', panel-tools 'Reference'.  
Fix: Reported, not changed. Making the other 31 entries visible means changing each panel's kind in panelStampRegistry(), which changes what the badge means for user-maintained and document-fed panels — out of my region and a design call for the integrator/Steven. The map is now correct whichever way that call goes.  
X2 verification: Documented — settled by F-W1-01: the design is correct; neither widening nor pruning applied; contract comment rewritten (deck aa00d3b)  

**F-M3-02 — Safety — refused installs**  
Evidence: `--only vphone-cli` exits 2 with the reason and does nothing. A tampered copy of the script with `run git clone https://github.com/framepipe-dev/media-inference-worker` injected into the codeburn step aborted at exit 3 naming the item and the reason, in --dry-run, before printing the command. mac-verify.sh separately reports FAIL if any refused item is found present on the machine.  
Fix: None needed. Anyone wanting one of these removes it from REFUSED_LIST and REFUSED_GUARDS deliberately, with Steven.  
X2 verification: Implemented — MAC-SETUP.sh REFUSED_LIST + runtime guard; re-verified unchanged by F-V1-11  

**F-M3-03 — Safety — credentials**  
Evidence: Real run created /tmp/m3-home/.config/omniroute/.env, mode 600, holding exactly OMNIROUTE_API_KEY=, OPENROUTER_API_KEY=, NVIDIA_API_KEY=, BYTEZ_API_KEY= with hint comments and no values. Second run: 'exists — left untouched, mode set to 600'. mac-verify.sh reports the same four names as 'no value yet' without reading them.  
Fix: Steven fills the four values by hand, then `omniroute providers add <id> --credential-env <NAME>` per FR5b. No value ever enters this repo, a prompt, or a task.  
X2 verification: Implemented — installer creates ~/.config/omniroute/.env with four NAMES; the values are Steven's (see also F-V2-07..15 before the failover is used)  

**F-M3-05 — Testing honesty — what has never been executed**  
Evidence: `playwright install chromium` DID run for real and failed (the sandbox proxy blocks the browser download); the step correctly reported FAILED and the script exited 1, so the failure path is exercised. Static scan for bash-4-only constructs (declare -A, mapfile/readarray, ${x^^}/${x,,}, &>>, ;;&, local -n, wait -n, =~, arrays, ${x:off:len}) returns zero hits in executable lines of both files; the only matches are the words inside the header comment. shellcheck -s bash is clean on both. Everything  
Fix: Steven runs `./MAC-SETUP.sh --dry-run` on the Mac and reads it before the first real run, then runs it once with `--only` on a single cheap step (codeburn) before the full pass. Report anything that behaves differently and this file gets a second row.  
X2 verification: Documented — disclosure: never executed on macOS; F-V1-10 repeats it after V1's changes  

**F-M3-06 — Bug found and fixed during testing**  
Evidence: Log line '2026-09-22T13:36:43 RUN npm install -g codeburn / npm error code SELF_SIGNED_CERT_IN_CHAIN / EXIT 0'. After the fix, with the proxy CA supplied, the same step installed codeburn 0.9.25 and omniroute 3.8.50 for real and reported 'already present' on the re-run.  
Fix: Fixed in MAC-SETUP.sh. The TLS failure itself was a sandbox artifact (the agent proxy), not something Steven's Mac will see.  
X2 verification: Fixed — MAC-SETUP.sh run()/run_sh() capture the command's own exit status; binaries verified present before 'installed'  

**F-M3-09 — HALT — the Mac already runs an older claude-auto**  
Evidence: The step's cmp branch; not exercised in the sandbox (no pre-existing claude-auto there) — this is one of the untested branches in F-M3-05.  
Fix: Steven diffs the two, replaces the old launcher himself, then runs the PII canary with the security steward before the runner is pointed at it.  
X2 verification: Escalated — installer refuses to replace a differing ~/.local/bin/claude-auto; diff + PII canary are Steven's — and the canary must be widened first (F-V2-20)  

**F-M3-10 — HALT — what the script will never do**  
Evidence: The --dry-run transcript lists 16 NEEDS-STEVEN items across the default run. No launchctl, no `claude plugin`, no `claude mcp add`, no task write and no artifact DB call appears anywhere in either script (grep).  
Fix: Steven works the NEEDS-STEVEN list the installer prints, in order, then re-runs mac-verify.sh.  
X2 verification: Escalated — the installer's own NEEDS-STEVEN list (16 items in the dry-run transcript)  

**F-M4-01 — panel-vanessa (COMMAND) line 1358 - Reach Vanessa via table**  
Evidence: FR5b's row read from their worktree: `git -C .../deck` + wt-fr5b-comms working tree line 1353, 'WhatsApp ... via whatsapp-cli (marcelrgberger) reading the WhatsApp desktop app on this Mac'. The prose is the stale side: it was written when the row was deleted, and was never revisited when the row came back.  
Fix: Rewrote the prose to match the row: WhatsApp is a spec, not a feed; personal WhatsApp still has no supported API and the Business Cloud API still needs a Meta Business account, verification and a separate number (both unchanged and kept); the chosen route drives the WhatsApp desktop app through marcelrgberger/whatsapp-cli, CLI only, plugin skill deliberately not installed; normen/whatscli evaluated and rejected, quoting its README ('No automation of messages, no sending of messages through shell  
X2 verification: Fixed — deck master: 0 hits for 'Discord replaces it as the third channel'; whatsapp-cli row and prose agree; closes F-FR5b-04; deck eaa2292 (merge m4-vanessa)  

**F-M4-04 — panel-wellness (HEALTH) line 3833 - Strava/Fitbod card**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md (cloudWriteProbe, 2026-09-22T09:05:56Z). The observable fact - the routine reports SUCCEEDED while the card's figures do not move - is unchanged and is kept.  
Fix: Rewrote to: the routine reports success while writing nothing here; the old permission-prompt explanation was disproved on 2026-09-22; this is now an unexplained routine failure to chase, not a platform limit.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-05 — panel-aiteam line 4625 - ISA line / comms bridge 'Honest status'**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md names this case directly: 'The ISA comms bridge can run in the cloud. The hourly cloud bridge was disabled precisely because it was thought unable to write. That reasoning no longer holds.'  
Fix: Kept the fact (disabled, last run 2026-09-09) and rewrote the justification: it was switched off on a belief that was disproved on 2026-09-22, so re-enabling it is an open action rather than a dead end.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-06 — panel-aiteam line 4627 - ISA bridge bullet list**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md, consequence 1 and 3: feeder tasks no longer need a laptop awake; the ISA bridge specifically can move to the cloud.  
Fix: Kept the dated history of why it was disabled, added that the block was disproved on 2026-09-22 with no prompt at all, and changed the guidance to: re-enabling it is now the recommended move, because it would carry the line outside the Mac window and while the Mac is asleep.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-09 — panel-nextmoves line 5977 - '50 cloud routines exist' paragraph**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md, including the output-not-execution consequence ('A cloud routine that succeeded but left its document untouched is now a failure, not an accepted limitation').  
Fix: Kept the true half (judge a routine by whether its document moved, not by its status), removed the 'research-only by design' framing, recorded that the permission-prompt explanation was disproved on 2026-09-22, and stated that 'succeeded but wrote nothing' is now a defect to fix.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-11 — panel-orchestration line 6745 - architecture rules list**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md ('The Mac-only-writer constraint is lifted. It was the single largest structural limitation in this ecosystem, and it was wrong.'). Note the probe covered the artifact DB write only - republish was not re-tested.  
Fix: Rewrote to 'Writes no longer have to happen on the Mac', stated the probe result, named what still pins work to the Mac (connectors - a routine created by an agent carries none, so Zoho/Lofty/Gmail/GitHub work runs where the credentials live - plus anything touching the local filesystem), and explicitly marked republish-the-page as UNPROVEN rather than claiming it works.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-15 — panel-aiteam shared toolbox table (AI_TEAM_TOOLBOX, 'Cloud routines' row, now line 25923)**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md.  
Fix: Row now states that an unattended run CAN write this deck's artifact database (probe, 2026-09-22), that the 'research-only by design' rule is retired, and that what an agent-created routine still lacks is connectors - so Zoho/Lofty/Gmail/GitHub work stays on the Mac. The per-routine Disabled / Failed / Abandoned / Succeeded lists were left untouched.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M5-01 — Artifact DB / stravaSnapshot writer**  
Evidence: (1) strava-daily-sync cron is '20 5 * * *' Mac-local PT = 12:20 UTC (runnerStatus.tasks); FR2's corrupt v7 was written 12:32 UTC - a 12-minute run. (2) It is the only writer of this doc named anywhere in the brain: docs/inventory/mac-task-descriptions.md:51 'Pulls recent Strava activities through the connector and writes the stravaSnapshot document'. (3) The cloud routine's own prompt is RESEARCH-ONLY - 'Do NOT call Edit, Write, or Bash with any write/copy/redirect operation at any point', outpu  
Fix: Correct the strava-daily-sync task prompt on the Mac to write data:{v:{activities,syncedAt,via}} rather than the bare body. Repo-side specs that taught the bare shape have been corrected (F-M5-04). Confirm on the Mac with: claude-runner task show strava-daily-sync (or the task's prompt file) and look for a write_db/ArtifactData set whose data is the body rather than {v: body}.  
X2 verification: Escalated — writer = Mac task strava-daily-sync; paste-ready prompt in routines/mac-task-repairs.md §1 (brain 2cb4ae6); deadline 2026-09-23 12:20 UTC (F-W2-01)  

**F-M5-02 — Artifact DB / stravaSnapshot state**  
Evidence: ArtifactData get, artifact 1624daae-d683-405a-971d-c5828dce0f8d, collection state, doc_id stravaSnapshot, read 2026-09-22 ~13:32 UTC. The next strava-daily-sync slot is 05:20 PT tomorrow (12:20 UTC 2026-09-23); the repair is expected to survive until then and be overwritten at it.  
Fix: No DB action taken - M5 is read-only on the DB by instruction. Fix the writer before the next 12:20 UTC slot or the repair is lost.  
X2 verification: Documented — stravaSnapshot v9 wrapped; 14:37 UTC export top level ['v'], syncedAt 2026-09-22T13:05:00Z  

**F-M5-04 — Specs / knowledge base**  
Evidence: grep -rn stravaSnapshot across the tree: .claude/skills/{scale-growth-engine,skills-refresh,vanessa-orchestrator,continuous-process-improvement,interview-me,ai-ecosystem-backup,stress-test-sweep}/SKILL.md, projects/command-deck.md:26 and :42, memory.md:18, integrations/CONNECTIONS.md:29, docs/ENGINEERING-BRIEF.md:14.  
Fix: DONE. All ten corrected to state the wrapper contract explicitly with an example - 'Every doc is {v:<value>} - no exceptions: send data:{v:<whole doc>}, never the bare value; a top level that is not a single v key is a bug to fix, not a shape to copy' - following the ciLog {date,text} precedent. The stress-test-sweep Edge fixture is KEPT (a reader must survive a bare doc) but relabelled synthetic, and its expectation flipped from missingV:['stravaSnapshot'] to missingV:[].  
X2 verification: Fixed — brain a389666: wrapper contract stated in all ten places; stress-test-sweep expects missingV []  

**F-M5-06 — always-on register / runnerStatus**  
Evidence: toolkitSnapshot.syncedAt 2026-09-22T13:15:45Z vs toolkit-deck-sync slot 06:15 PT = 13:15 UTC (exact match), while runnerStatus records it 'limited, 2026-09-16 17:59'. knowledgeFabric.syncedAt 2026-09-22T04:05:04Z vs fabric-deck-sync's 21:05 PT slot, while runnerStatus records it 'error'. Both wrote, then logged badly or were never re-logged.  
Fix: DONE - always-on/README.md now carries a blockquote under Status source stating that runnerStatus is stale, showing the two proofs, and instructing readers to treat every 'Last end' as a floor. Separately, why runnerStatus stopped being written at 04:05Z needs checking on the Mac.  
X2 verification: Documented — premise overturned by F-W2-02: runnerStatus is alive; its stamp is Pacific time with a Z. always-on/README.md corrected (brain 2cb4ae6)  

**F-M5-08 — Cloud routines / lying green row**  
Evidence: trig_018BSAYiYzvtyaUkpAY4SnqE, cron '0 1,7,13,19 * * *', last_run SUCCEEDED fired_at 2026-09-22T13:08:44Z. Superseded by trig_01M5zR1Po44gnHvTwA9ogZaB at 04/10/16/22 UTC, which genuinely writes.  
Fix: Steven disables it at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE. Recorded in always-on/README.md.  
X2 verification: Escalated — one click: https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE; disable refused to agents three times (F-W2-10)  

**F-M6-01 — health-notion-sync / status doc naming**  
Evidence: ArtifactData get state/appleHealthSync on artifact 1624daae-d683-405a-971d-c5828dce0f8d -> 'No document "appleHealthSync" in collection "state"'. ArtifactData get state/healthNotionSync -> exists, version 1, status 'awaiting-first-phone-run'.  
Fix: Renamed the status doc to `healthNotionSync` in integrations/mac-task-specs.md §3 and in .claude/skills/apple-health-notion/SKILL.md, with the exact field list (rows, lastRowDate, lastSyncAt, status) the card renders. Zero references to `appleHealthSync` remain in the repo.  
X2 verification: Fixed — specs and skill write healthNotionSync (0 refs to appleHealthSync in the repo); deck 7cf849c removed the dead appleHealthSync branch  

**F-M6-02 — Notion Health Log schema / row key**  
Evidence: notion-fetch bc71c45aac934a4f8aeddc54345136ef -> schema shows {"Day":{"description":"YYYY-MM-DD, the row key","type":"title"}} and {"Date":{"description":"the calendar day this row covers","type":"date"}}.  
Fix: Added `Day` (Title, the row key) as the first row of the property table in both integrations/apple-health-dashboard.md and the skill, with `Date` documented as the sort/filter copy and the stated fallback if a title is blank. Stage A now says rows are keyed on the `Day` title.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-05 — appleHealth merge / undocumented keys**  
Evidence: ArtifactData get state/appleHealth (version 11) -> top-level keys under `v`: daily, dailyDays, meta, metrics, read, records, sleep, sources, syncedAt, via, workouts.  
Fix: Documented all three in the spec's shapes list and in the skill's merge step: carry `records` forward untouched, append to `sources` rather than replacing it, and recompute `dailyDays` from the merged `daily`. Both appear in the §3 wrapper example so the writer cannot miss them.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-06 — appleHealth merge / daemon-only metric keys**  
Evidence: Live appleHealth metric keys (11): blood_oxygen_saturation, body_temperature, flights_climbed, headphone_audio_exposure, heart_rate_variability, step_count, walking_asymmetry_percentage, walking_double_support_percentage, walking_running_distance, walking_speed, walking_step_length. The Notion mapping supplies 12 keys, none of which are the five listed.  
Fix: The merge rule in both files now names those five keys explicitly as must-survive, alongside the per-day / per-night / per-workout rules, and the §3 prompt repeats them inline so the runner sees them without opening the spec.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-S1-05 — security/cli-anything-install**  
Evidence: Source read in the cloned repo, 2026-09-22, during the sandbox install of cli-anything-hub 0.4.1.  
Fix: CLI_HUB_NO_ANALYTICS=1 set in the runner's shell profile BEFORE the first cli-hub command, not typed once per session. Added as an explicit Env row in mac-task-specs.md section 4, as the first line of the install block in SKILL.md, and as a visible note on the deck card.  
X2 verification: Escalated — repo side done: mac-task-specs.md §4 Env row, SKILL.md first install line, deck card note, mac-verify.sh lines 160-162, CONNECTIONS.md line 16 (F-W2-12); the shell-profile export itself is Steven's  

**F-S1-06 — security/domshell**  
Evidence: cli-anything-browser built from browser/agent-harness/ and exercised in the sandbox 2026-09-22; DOMShell is installed from the Chrome Web Store and maps Chrome's accessibility tree to a virtual filesystem.  
Fix: Named explicitly in the skill's security section, in mac-task-specs.md section 4, and on the deck card — as a risk for Steven to accept deliberately, not as a footnote. It is part of what the ECC security review has to weigh before SkySlope and zipForms are built at all.  
X2 verification: Escalated — risk named in skill, specs §4 and the deck card; acceptance is Steven's, before SkySlope/zipForms are built  

**F-S1-07 — integrations/cli-anything**  
Evidence: Sandbox install 2026-09-22; repo wrapper-directory listing; integrations/CONNECTIONS.md line 16 ('Not installed. Spec written this cycle.'), verified 2026-09-22.  
Fix: The deliverable is a specification plus a dashboard surface that reports the real state, not a connection. The deck card's default with no document is 'not-installed', and it distinguishes the sandbox proof from the Mac's state in so many words.  
X2 verification: Escalated — nothing installed on the Mac; install now scripted (F-S1-18, MAC-SETUP.sh --only cli-anything); generation (/cli-anything) is the interactive step  

**F-S1-08 — safety/showingtime**  
Evidence: Blast-radius table in .claude/skills/cli-anything-connectors/SKILL.md. Not implemented anywhere.  
Fix: Specified and NOT built. On the browser path every one of these is an 'act click'/'act type' underneath, and the task's Bash allow-list denies 'act' outright, so the denial is mechanical rather than a request to behave. Each verb needs Steven's written approval for that one verb on that one target before it exists.  
X2 verification: Escalated — not built; 'act' denied in the task allow-list; each outward verb needs written approval  

**F-S1-09 — safety/showami**  
Evidence: Blast-radius table in SKILL.md. Not implemented anywhere.  
Fix: Specified and NOT built; same 'act' denial as F-S1-08. The existing manual Open Showami / Copy Showami request buttons in the route card are deliberately left in place — copy-paste keeps a human between Steven and a booking, and it is the only path that functions today.  
X2 verification: Escalated — not built; manual Open/Copy Showami buttons kept  

**F-S1-10 — safety/skyslope-zipforms**  
Evidence: Blast-radius table in SKILL.md; the pre-existing stop-before rule in mac-task-specs.md section 4.  
Fix: Both are steps 4 and 5 in the build order, gated on an ECC security review WITH A SIGN-OFF DATE. The deck card enforces this rather than just describing it: a status document claiming read-only-live for either target without an eccReviewedAt date is clamped back to disabled-by-policy and the row says 'Document claimed more than it evidenced — held back'. Verified in harness STATE 3.  
X2 verification: Escalated — deck card clamps a read-only-live claim without eccReviewedAt back to disabled-by-policy (harness STATE 3)  

**F-S1-11 — integrations/lofty**  
Evidence: integrations/CONNECTIONS.md line 14, verified 2026-09-22: 'Bridge and CLI installed (status RUN, MCP server lofty connected). API key presence unverified from the cloud — no successful pull yet.'  
Fix: The skill carries an explicit blockquote: the API stays the recommendation, and a CLI-Anything wrapper is a fallback only for something the API is demonstrably shown not to expose — nothing is known to be missing yet. Lofty is listed in the build order as 'not a CLI-Anything target'. Its deck row reads installed-untested (NOT read-only-live: no pull has ever succeeded, so 'live' is a claim the evidence does not support, and NOT not-installed, which would be wrong because the bridge and CLI are i  
X2 verification: Escalated — Lofty stays on the REST API (not a CLI-Anything target); LOFTY_API_KEY missing — keyfile step added by F-V1-02  

**F-S1-13 — command-deck/robustness**  
Evidence: The db IIFE render-isolation comment in command-deck.html and the 2026-09-11 note about a document that threw 'items.filter is not a function' and took out every later panel including the freshness board.  
Fix: The page owns the row list; the document owns only the state. Six rows are baked into CC_TARGETS, so a missing, string, array, null, truncated or wrong-typed document can change what a row SAYS but can never remove a row, empty the table or invent a seventh target. Reads go through lsGet (which swallows a throwing localStorage) and the renderer is registered through safeRun. Eight malformed shapes tested: string, array, null, wrong-typed fields, junk rows inside the wrappers array, unparseable t  
X2 verification: Implemented — deck master: CC_TARGETS + cliAnythingStatus renderer (5 refs), eight malformed shapes PASS; deck 19f8a7f (merge s1-showings)  

**F-S1-14 — command-deck/tripwire**  
Evidence: Designed and tested this pass; no prior surface existed.  
Fix: Any verb in verbsEnabled matching an outward pattern (including 'act', which IS the write surface on the browser path) forces that row's state to error, turns the row badge and the card badge red, and replaces the headline with 'STOP. The status document reports an outward verb as enabled ...'. readOnly:false does the same. Verified: injecting verbsEnabled ['fs cat','act click','showing post'] produced badge [badge red] 'Write verb enabled — review now' and ccState-showami 'error'.  
X2 verification: Implemented — deck master: outward-verb tripwire (badge red 'Write verb enabled — review now')  

**F-S1-18 — docs/accuracy**  
Evidence: Measured 2026-09-22 in a throwaway HOME: 'Successfully added marketplace: cli-anything (declared in user settings)' and 'Successfully installed plugin: cli-anything@cli-anything (scope: user)'. The plugin ships exactly five commands: /cli-anything, :list, :refine, :test, :validate.  
Fix: integrations/mac-task-specs.md section 4 retitled 'install is SCRIPTABLE, only generation is Steven's', the false paragraph replaced with the correction and the measured transcript, and the four-step sequence written out. SKILL.md's install section rewritten the same way. The deck card's homes.com action now reads 'Run ./MAC-SETUP.sh ...' instead of a list of commands to type.  
X2 verification: Fixed — integrations/mac-task-specs.md §4 retitled 'install is SCRIPTABLE, only generation is Steven's' (brain 034de67)  

**F-V1-01 — Reconciliation — never addressed: Google Drive**  
Evidence: Exhaustive grep of the tree for drive/gdrive/googleapis/rclone returned no integration, only claims: always-on/README.md line 22 and docs/inventory/mac-task-descriptions.md lines 7 and 198 describe the Drive hop; wiki/dashboard-ops/index.md line 44 and findings-E8.json 'Drive folder 0 files'; recall-cache.md line 48 already lists a 0-count Drive folder as an ALERT condition, so it has been firing. integrations/CONNECTIONS.md had no Drive row at all — neither connected nor not-connected. OPTIMIZA  
Fix: Wrote integrations/google-drive-brain.md: states plainly that it was never addressed, sets out the decision Steven owes (wire it, or drop the Drive line from the fabric counts — a 0-file store is a false green), and specs the shape if wired: read-only L2 SOURCE feeding Jarvis and the vault, never a sixth store to query, three candidate paths cheapest-first (Google Drive for Desktop's existing local mount, then rclone read-only, then a Drive MCP/Composio toolkit), credential location ~/.config/gd  
X2 verification: Escalated — integrations/google-drive-brain.md, OPTIMIZATION.md rows, CONNECTIONS.md Drive row (brain 525e653); nothing granted or connected  

**F-V1-02 — Reconciliation — half-done: Lofty**  
Evidence: grep -n 'ensure_env_file' MAC-SETUP.sh returned exactly three call sites (omniroute, cli-anything, strix), none for lofty; grep for lofty in mac-verify.sh returned nothing. docs/SECOND-MAC-SETUP.md line ~118 lists ~/.config/lofty/.env / LOFTY_API_KEY as a file to create 'by hand'.  
Fix: Added a lofty-keyfile step to MAC-SETUP.sh (STEPS_FR5B) that creates ~/.config/lofty/.env at chmod 600 with LOFTY_API_KEY as an empty NAME, restates that Lofty stays on the REST API and must not get a CLI-Anything wrapper, and reports the key value as NEEDS-STEVEN. Added check_env_file lofty LOFTY_API_KEY to mac-verify.sh. Executed for real under HOME=/tmp/v1-home: file created mode 600 holding the name only, second run reported 'already present', verifier reported 'ok lofty/.env mode 600' and '  
X2 verification: Implemented — MAC-SETUP.sh lofty-keyfile step + mac-verify.sh check_env_file lofty (brain 525e653); executed in a throwaway HOME  

**F-V1-03 — Reconciliation — refused by association: Higgsfield API**  
Evidence: MAC-SETUP.sh step groups contained no higgsfield entry; the only in-repo references were the REFUSED_LIST line, two REFUSED_GUARDS globs and the runbook section. docs/SECOND-MAC-SETUP.md line 121 lists ~/.config/higgsfield/.env with HF_API_KEY_ID and HF_API_KEY_SECRET as expected on a second Mac, with nothing creating it.  
Fix: Added an on-a-named-need higgsfield step to MAC-SETUP.sh. Without --only it prints FR5b's unchanged business verdict (no use today — paid account Steven does not have). With --only higgsfield it creates ~/.config/higgsfield/.env at chmod 600 with HF_API_KEY_ID and HF_API_KEY_SECRET as empty NAMES and calls nothing. The step never references the refused repo in any executed command, and the runtime guard is untouched. Added a correction paragraph to MAC-INSTALL-comms-data.md section 4 stating the  
X2 verification: Implemented — MAC-SETUP.sh on-demand higgsfield step; MAC-INSTALL-comms-data.md §4 correction (brain 525e653)  

**F-V1-07 — Wrong reason recorded — plugin advisories rested on a false premise**  
Evidence: claude plugin marketplace add <owner/repo> -> 'Successfully added marketplace' and claude plugin install <name>@<marketplace> -> 'Successfully installed plugin', both non-interactive, exit 0 (re-confirmed by the caller today; measured 2026-09-22 in a throwaway HOME per F-S1-18). MAC-SETUP.sh's cli-anything step already calls both through run(). The old claude-code-setup advisory read 'A plugin install lands in your live Claude Code user scope — yours to approve, not a script's.'  
Fix: Added a plugin_advisory() helper carrying the correction in a comment block and printing, after every plugin block, 'Technically scriptable: both claude plugin commands run non-interactively (verified 2026-09-22, exit 0). It stays manual for the reason above, not because a script could not do it.' Then rewrote each reason to state its real, separate ground: ponytail = POLICY, the strongest hold — its two Node hooks fire on every prompt of every session and inject into every subagent, so it chang  
X2 verification: Fixed — MAC-SETUP.sh plugin_advisory() (line ~178) with each hold's real ground  

**F-V1-10 — Testing honesty — what has and has not been executed**  
Evidence: Session transcript. The real run was confined to a throwaway HOME under /tmp and both the venv used for shellcheck and that HOME were deleted afterwards; the freellmapi clone (27 MB) was deleted after reading.  
Fix: No fix — this is the disclosure. The first real run on the Mac should be ./MAC-SETUP.sh --dry-run, read in full, then ./MAC-SETUP.sh, then ./mac-verify.sh.  
X2 verification: Documented — disclosure: neither script has run on a Mac  

**F-V2-07 — omniroute failover**  
Evidence: claude-auto.sh:36-41 (`*) break ;;`). Executed in a throwaway config: `claude-auto --task lofty-crm-sync -p hello` correctly printed 'client-data task deferred ... never on a free provider (exit 75)'. The same task as `claude-auto -p hello --task lofty-crm-sync` fell through to route_omni with the FREE model and only stopped at the OmniRoute /healthz check because the base URL was pointed at a dead port. Its own log line records the bypass: 'omniroute /healthz failed' with no task name, versus '  
Fix: Parse all options before the first claude argument, or require the documented `--` separator and refuse to run without it. Strongest fix: make the gate fail CLOSED (see F-V2-08).  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-08 — omniroute failover**  
Evidence: claude-auto.sh:43-49 (`is_pii=0` initialised, only raised by an explicit flag or an exact list hit). Executed: `claude-auto -p hello` (no --task) proceeded to the free route; log line 'defer task=?' appears only in the --pii case. README.md:104 says 'Runner tasks pass --task <name>' but nothing enforces it.  
Fix: Default is_pii=1 and require an explicit `--no-pii` (or a task name on a non-PII allowlist) to route to a free provider. Deferring a safe task costs a retry; leaking a client record does not undo.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-09 — omniroute failover**  
Evidence: claude-auto.sh:24 (DEFAULT_PII_TASKS) and :47-48 (`case " $list " in *" $TASK "*`). Executed: `--task lofty-crm-sync-v2` was treated as non-PII and routed to the free model.  
Fix: Match by prefix or pattern as well as exact name, and invert the default per F-V2-08 so an unknown task name is treated as client data rather than as safe.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-10 — omniroute failover**  
Evidence: claude-auto.sh:23 and :98 (`cat "$tmp" "$tmp.err" | grep -qiE "$LIMIT_RE"`), probe.sh:12 and :37. Executed against sample strings: 'Loan amount $429,000 on the subject property' MATCHES; 'Comp at 429, Elm Street' MATCHES; 'HTTP 200 OK, 429 ms elapsed' MATCHES; 'Property tax resets at the start of the fiscal year' MATCHES; 'The escrow limit has been reached for this account' MATCHES; 'Index 429 of 5000 rows processed' MATCHES. Each would flip mode to free-fallback whenever the run also exits non-  
Fix: Match only against the error envelope (the JSON `result`/`error` field when --output-format json is in use), anchor the 429 branch to an HTTP status context rather than a bare number, and drop the bare `resets at|in` branch. The README already flags that the real limit wording was never confirmed; until it is, narrow rather than broaden.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-11 — omniroute failover**  
Evidence: probe.sh:42-45 (`write_route "$mode" ... "probe-unknown rc=$rc"` — mode unchanged) and claude-auto.sh:62 (`probe.sh --now >/dev/null 2>&1 || true`). Executed with a stub `claude` that exits 2: three consecutive probe runs, mode stayed free-fallback every time, probe.log recorded only 'probe inconclusive (rc=2) — mode kept: free-fallback', and `claude-auto --status` showed reason='probe-unknown rc=2' with nothing surfacing it. Note the README asserts the opposite: 'a stopped LaunchAgent cannot st  
Fix: Count consecutive inconclusive probes and, past a threshold (say 4, i.e. one hour), either fail back to plain `claude` or raise a Needs-Steven packet. Log the probe's exit status in claude-auto instead of discarding it.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-24 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:96-102 (`[ -f "$REPO_DIR/.claude/skills/$s/SKILL.md" ]`). Executed against a fake repo where security-and-hardening/SKILL.md was replaced with invalid YAML and `name: TOTALLY-WRONG-NAME`: PyYAML refuses it ('while parsing a flow sequence') so no session could load it, yet mac-verify.sh printed 'ok    vendored skills            all nine present'.  
Fix: For V1: parse the frontmatter (awk the block between the --- fences), assert `name` equals the directory name, assert `description` is non-empty, and resolve every `](...)` / backticked relative path in the body. Nine skills, all local, no network — this is cheap and it is the difference between 'the file is there' and 'a session can load it'.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-V2-25 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:129-130 — the else branch of the `cmp -s` test calls `ok`, not `bad` or `need`. Executed: a two-line stub that merely echoes TAMPERED was installed at $HOME/.local/bin/claude-auto and mac-verify printed 'ok    claude-auto    installed (differs from the repo copy — diff it before trusting it)'.  
Fix: For V1: make the differs-from-repo branch `need` (or `bad`), so it lands in the summary and blocks exit 0. An advisory nobody reads inside an 'ok' line is not a check.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-V2-26 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:133-135 — `ok` with the mode string, whatever the mode is. Executed with state/mode seeded to 'free-fallback': 'ok    omniroute route mode       free-fallback', contributing to N_OK.  
Fix: For V1: `ok` only for mode=subscription. Anything else should be `need` with the age of state/route.env's `since` field, e.g. 'on free-fallback for 3h — the probe has not restored the subscription'. Cross-reference F-V2-11: the strand is silent at the script level too, so mac-verify is the only place it could surface.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-W1-02 — renderPanelStamps() selector**  
Evidence: switchPage() (L7891) only ever touches '.panel[data-page]', so a panel without one is never hidden. Adding data-page would have hidden the panel on 14 of 15 tabs and enrolled it in PANEL_NAV, buildToc, the section slider and panel counts. Baseline dump: '#panel-vanessa .panel-stamp ** NO SUCH ELEMENT **'. Selector safety verified: '.panel' matches exactly 40 elements (39 '<section class="panel">' + 1 '<section class="panel panel-pinned">') and nothing else; all 40 carry the .panel-head the rende  
Fix: Changed the one selector in renderPanelStamps() from '.panel[data-page]' to '.panel'. The other seven '.panel[data-page]' call sites are genuinely page-partition logic and were left untouched. After: '#panel-vanessa .panel-stamp [panel-stamp] "Not edited yet"'.  
X2 verification: Fixed — deck master: renderPanelStamps() selects '.panel' (grep 1 hit); panel-vanessa renders 'Not edited yet'; deck aa00d3b (merge w1-stamps)  

**F-W1-03 — panelStampRegistry() — panel-vanessa**  
Evidence: 38 registry entries vs 40 panel sections. panel-vanessa's data is the shared thread in the 'vanessaChat' document (lsGetSeeded('vanessaChat', []) at L23012; markup #vanessaChatBox at L1365 inside panel-vanessa), structurally identical to panel-apex/apexChat, panel-james/jamesChat, panel-kevin/kevinChat.  
Fix: Added "panel-vanessa": { kind: "you", keys: ["vanessaChat"] }. Proven wired to the correct key by injecting sectionEdits {vanessaChat: 2026-09-20, apexChat: 2026-09-21}: panel-vanessa rendered '[st-you] You · 2d ago' and panel-apex '[st-you] You · yesterday' — independent, not cross-reading; panel-james (untouched key) stayed 'Not edited yet'.  
X2 verification: Fixed — deck master line 21740: "panel-vanessa": { kind: "you", keys: ["vanessaChat"] }; deck aa00d3b (merge w1-stamps)  

**F-W1-04 — panelStampRegistry() — panel-toolkit**  
Evidence: Baseline dump: '#panel-toolkit .panel-stamp [panel-stamp st-you] "—"'. renderToolkitInventory() at L9867 reads lsGet('toolkitSnapshot') and prints 'Synced <syncedAt> from the Mac's tool index' into #tkInvStamp.  
Fix: Gave it a registry entry rather than only patching the fallback, because the 2026-09-22 audit had ALREADY recorded {at:'2026-09-22', scope:'review'} for panel-toolkit in PANEL_VERIFIED_AT — the entry existed and simply was not connected, so this asserts no new fact. Chose kind:'ref' over 'synced'/'live': the panel is predominantly a directory of links and copyable commands (like panel-tools, also 'ref'), there is no TOOLKIT_SYNCED_AT constant and no 'Toolkit inventory' label in LIVE_FEED_ISO, an  
X2 verification: Fixed — deck master: panel-toolkit registered kind ref → 'Reviewed today'; deck aa00d3b (merge w1-stamps)  

**F-W2-01 — Mac task / stravaSnapshot writer**  
Evidence: Live read 2026-09-22 ~14:05 UTC: state/stravaSnapshot is version 9 and CORRECT - {v:{activities:[3 rows], syncedAt:'2026-09-22T13:05:00Z', via:'FR2 freshness pass (Strava connector, direct read)'}}, document updatedAt 2026-09-22T13:12:15.87374Z. The repair is holding only because no 05:20 PT slot has run since it was made. Live runnerStatus entry: {cron:'20 5 * * *', enabled:true, lastEnd:'2026-09-22T05:32:45', lastStatus:'ok', nextSlot:'2026-09-23T05:20:00'} - it reports ok while writing a corr  
Fix: Paste-ready corrected prompt written to routines/mac-task-repairs.md section 1, stating the wrapper contract with a worked CORRECT/WRONG example pair per the ciLog {date,text} precedent, specifying 'set' rather than 'update' so no stray top-level key can survive, a read-back assertion, and a UTC-clock requirement for syncedAt. One-line verification for Steven included. An agent may not edit a Mac task.  
X2 verification: Escalated — routines/mac-task-repairs.md §1 (brain 2cb4ae6) — paste before 2026-09-23 12:20 UTC; live stravaSnapshot v9 still correct in the 14:37 export  

**F-W2-02 — Mac runner / timestamp correctness**  
Evidence: runnerStatus v8 and knowledgeFabric v7 carry the IDENTICAL writer stamp '2026-09-22T07:06:12Z' - one run.sh fabric pass wrote both (knowledgeFabric.v.source = 'fabric-deck-sync (claude-runner, hourly) via run.sh fabric'). The server recorded that same knowledgeFabric write at updatedAt '2026-09-22T14:07:22.431452Z'. Delta = 7h01m10s = the PDT offset. runnerStatus.v.loggedIn true, v.running ['fabric-deck-sync'], newest lastEnd 'vanessa-discord-inbox 2026-09-22T07:05:00' (PT) = 14:05 UTC, one minu  
Fix: Cheapest-first diagnostic sequence written to routines/mac-task-repairs.md section 2: (1) free re-read comparing v.syncedAt to the document's own server updatedAt, (2) launchctl list for the runner, (3) grep the fabric writer for a 'date' call building syncedAt - the bug is 'date +%Y-%m-%dT%H:%M:%SZ' (local with a hardcoded Z), the fix is 'date -u', (4) LaunchAgent TZ, (5) log pull. always-on/README.md corrected. Could not establish the fabric runner's script path from the repo; the grep searche  
X2 verification: Escalated — diagnostic sequence in routines/mac-task-repairs.md §2; always-on/README.md corrected (2cb4ae6); overturns F-M5-06  

**F-W2-04 — Mac task / r4-quantvue-sync**  
Evidence: docs/inventory/mac-task-descriptions.md:40 - 'r4-quantvue-sync - Re-reads the live QuantVue Google Sheet, writes strategySnapshot, and flags any strategy under -4% month to date.' Live runnerStatus: {cron:'20 23 * * 1-5', enabled:true, lastEnd:'2026-09-22T01:19:43', lastStatus:'refused', nextSlot:'2026-09-22T23:20:00'}. 'refused' is defined in wiki/dashboard-ops/index.md as a tool or path not on the allow-list. A full listing of collection 'state' (173 documents, 2026-09-22 ~14:20 UTC) contains   
Fix: The question the brief said might need putting to Steven does not need putting - the repo settles it. routines/mac-task-repairs.md section 4 gives the paste that pulls the task's allow-list and the refused tool or path out of the log, so the fix is named rather than guessed. Likely the outbound fetch of the Google Sheets CSV export; the prompt itself needs no change.  
X2 verification: Escalated — routines/mac-task-repairs.md §4 (paste on the Mac); overturns F-M5-09's 'no QuantVue doc' reading  

**F-W2-05 — Cloud routine / strategySnapshot**  
Evidence: trig_011CXFHCT3hou6uaCfb5rWkC 'Command Deck - Trading strategy performance daily 3pm PST sync', cron '0 22 * * 1-5', created_via http_api, last_run SUCCEEDED fired_at 2026-09-21T22:03:34.746187115Z - while strategySnapshot.syncedAt is still 2026-09-16T03:26:59Z. Its prompt: 'This is an UNATTENDED cloud run - a human applies your findings afterward. Do NOT use Edit, Write, or Bash. Do NOT call Artifact with action publish. Your only job is to fetch real data and report it.' and 'Output your findi  
Fix: Full corrected prompt written to routines/mac-task-repairs.md section 5 - writes strategySnapshot in the shape the live document already uses (asOf, flags, history, sourceUrl, strategies as {name, mtdPct, ytdPct}, syncedAt), states the {v:<value>} contract with a CORRECT/WRONG example pair, pins the write with if_version, requires a read-back, logs one {date,text} ciLog row, and keeps the do-not-fabricate rule for real trading data. Created via http_api, so ONLY STEVEN can apply it. Recommendati  
X2 verification: Escalated — corrected prompt in routines/mac-task-repairs.md §5; strategySnapshot syncedAt still 2026-09-16 in the 14:37 export  

**F-W2-07 — Cloud routines / nine failures**  
Evidence: Four http_api FAILED with run durations 5.7s (trig_01V6QrF6yENWiccduk94ubbs, 2026-09-18T23:03:02->23:03:08), 6.0s (trig_013ocJfEDdmSAgDPVaiCzMZY, 2026-09-20T16:06:19->16:06:25), 5.5s (trig_01Lb3aYRQZSLsAkcnDpZ8zEL, 15:07:39->15:07:44), 5.5s (trig_01HfL39UYunpMm56NSJuh8LK, 16:09:32->16:09:37). Three meta_mcp FAILED at 9.8s, 10.5s, 9.6s - and despite Monday, Tuesday and Wednesday crons respectively, ALL THREE last ran on Friday 2026-09-18 within two hours (20:08, 21:07, 22:01). Two ABANDONED runs   
Fix: routines/mac-task-repairs.md section 7 recommends NOT rewriting nine prompts and instead using the next natural firing as a free test - Project Risk Review fires 2026-09-22T18:06Z, the soonest. Pass/fail criterion given: longer than ~30s means the outage is over; another ~10s death means it is live and reproducible on demand, which is a better bug report than nine guesses. The four http_api links are listed for Steven.  
X2 verification: Open — routines/mac-task-repairs.md §7: do not rewrite nine prompts; Project Risk Review fires 2026-09-22T18:06Z as the free test; F-E8-64 annotated  

**F-X2-01 — consolidation / audit corpus**  
Evidence: docs/MASTER-FINDINGS.md at 09:51 UTC vs deck commits b63ff97, edfa24a, 109d9d5 and the store export at 14:37 UTC (backupStatus lastBackup 2026-09-22).  
Fix: Done in this pass: docs/MASTER-FINDINGS.md regenerated with the row updates and a dated 2026-09-22 section; docs/data/auditFindings.json regenerated to match; docs/NEEDS-STEVEN.md written.  
X2 verification: Implemented  

**F-X2-02 — privacy / repo mirror of the ISA Portal**  
Evidence: grep on /home/user/Repo/dashboard/isa/isa-portal.html: FUB_NEW_LEADS_90D 5 hits, 1 email literal, names in DRIFT_ROWS; the same greps on scratchpad/isa/isa-portal.html: 0, 0, driftLocalSummary().  
Fix: Integrator copies the portal master (cf89bab) over dashboard/isa/isa-portal.html and commits it; X2 did not edit it (outside the allowed files). Until then the git history carries client identifiers — Steven decides whether the earlier commits need rewriting.  
X2 verification: Open  

**F-X2-03 — contradiction / runner status**  
Evidence: findings-M5.json F-M5-06 vs findings-W2.json F-W2-02; always-on/README.md corrected block; 14:37 export runnerStatus syncedAt 2026-09-22T07:06:12Z.  
Fix: F-M5-06 marked Superseded. The timestamp defect itself is F-W2-02 (Steven, runbook §2).  
X2 verification: Documented  

**F-X2-09 — PII in the audit corpus**  
Evidence: docs/MASTER-FINDINGS.md lines 146-147 (before this pass); docs/data/auditFindings.json lines 257/274; docs/findings/findings-E12.json lines ~197/216; docs/findings/findings-L1.json line 16.  
Fix: Redacted in the regenerated docs/MASTER-FINDINGS.md and docs/data/auditFindings.json in this pass. Not edited: the source rows in findings-E12.json and findings-L1.json (dated records) and the live auditFindings document in the Command Deck store (seeded 09:51 UTC, 285 rows) — Steven or the coordinator decides whether to purge those and republish the doc.  
X2 verification: Escalated  

**F-FR1-02 — freshness**  
Before: activeListings 2,218 (San Diego city) and 458 (Temecula), activeListingsAsOf 2026-09-04, presented without a staleness note  
After: Same counts and dates, each note now ends 'NOT re-verified 2026-09-22 — the CRMLS IDX pull needs the Mac and redfin.com/realtor.com are unreachable from this session'; San Diego note adds Redfin county-wide Aug 2026: 8,709 (-5.6% YoY) — https://www.redfin.com/blog/san-diego-county-ca-housing-market-august-2026/  
X2 verification: Open  

**F-FR1-04 — freshness**  
Before: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-07"; Temecula summary from a Sep 7 NewHomeSource read (7 builders / 29 communities), Murrieta summary 'blocked this pass', San Diego summary on Aug 2026 builder-lender rate data  
After: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-22 13:45 UTC — search-indexed builder and NewHomeSource pages plus dated primary releases …"; sources: https://www.newhomesource.com/communities/ca/riverside-san-bernardino-area/temecula?hotdeals=true · https://www.meritagehomes.com/promotion/9507613 · https://www.taylormorrison.com/ca/southern-california/temecula/sage-at-elderberry-park · https://www.drhorton.com/california/inland-empire/winchester/juniper-at-canterwood · https://www.kbhome.com/special-rat  
X2 verification: Improved — deck master: BUILDER_INCENTIVE_SYNCED_AT = "2026-09-22 …"; deck 705dcf6 (merge fr1-markets) — Meritage statement contradicts F-FR3-02 (F-X2-07)  

**F-FR1-07 — freshness**  
Before: TV_INTEGRATION_SYNCED_AT = "2026-09-07"  
After: TV_INTEGRATION_SYNCED_AT = "2026-09-07 — not re-verified 2026-09-22: TradingView's Desktop release notes list a 3.4.1 hotfix build (Sep 8, 2026) …" — https://www.tradingview.com/support/solutions/43000673888-tradingview-desktop-releases-and-release-notes/ ; artifact DB state/toolkitSnapshot syncedAt 2026-09-16T00:52:24Z  
X2 verification: Open  

**F-FR1-11 — tooling**  
Before: Brief assumed WebFetch of lender and market pages  
After: Documented block list above; proxy status endpoint reports 'enabled: true, selective: false' — see /root/.ccr/README.md in the session  
X2 verification: Escalated  

**F-FR2-01 — Stale Content**  
Before: ON_THIS_DAY_SYNCED_AT = "2026-09-20"; 6 Sep 20 events (Magellan 1519 … Bush 2001), 7 Sep 20 birthdays (Dewar … Phillip Phillips); card note said 'Entries for September 20 — NOT September 22'.  
After: ON_THIS_DAY_SYNCED_AT = "2026-09-22T13:07:00Z"; events 1776 Nathan Hale, 1862 preliminary Emancipation Proclamation, 1888 National Geographic, 1975 Sara Jane Moore, 1980 Iran–Iraq War, 1994 Friends premiere; birthdays Faraday 1791, Lasorda 1927, Nick Cave 1957, Joan Jett 1958, Bocelli 1958, Baio 1960, Bonnie Hunt 1961, Billie Piper 1982, Tom Felton 1987. Sources: https://www.upi.com/Top_News/2026/09/22/On-This-Day-Friends-premieres-begins-10-year-run/9441790043009 · https://www.upi.com/Entertain  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-02 — Stale Content**  
Before: BEARS_SYNCED_AT = "2026-09-20"; standings Bears 1-1, Vikings 2-0, Packers —, Lions —; nextGame 'vs Philadelphia Eagles — Week 3 Monday Night Football' with no date.  
After: BEARS_SYNCED_AT = "2026-09-22 13:07 UTC — WebSearch (ESPN …)"; Vikings 2-0, Bears 1-1, Packers 1-1, Lions 1-1; next game Mon Sep 28, 5:15 PM PT, Soldier Field; injury: Williams week-to-week hamstring pull, Monday tests showed no major damage. Sources: https://www.espn.com/nfl/game/_/gameId/401872963/eagles-bears · https://www.espn.com/nfl/game/_/gameId/401872927/packers-vikings · https://www.espn.com/nfl/game/_/gameId/401872923/saints-lions · https://www.espn.com/nfl/game/_/gameId/401872661/bear  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-03 — Stale Content**  
Before: ECONODAY_SYNCED_AT = "2026-09-20 (econodayLiveList — …)"; Sep 21–25 rows read 'Week-ahead item listed by the Sep 20 feed'; Fri Sep 25 listed Existing Home Sales; PCE row said 'SOURCES DISAGREE Sep 26 / Sep 30'.  
After: ECONODAY_SYNCED_AT = "2026-09-22 13:07 UTC — WebSearch (BLS/BEA/Census release schedules, NAR/HousingWire, Chicago Fed via Benzinga, TradingEconomics, Kiplinger week-ahead)". Sources: https://www.benzinga.com/markets/market-summary/26/09/61895280/dow-surges-over-200-points-chicago-fed-activity-index-falls-in-august · https://www.housingwire.com/articles/existing-home-sales-august-2026/ · https://www.bea.gov/news/2026/personal-income-and-outlays-july-2026 · https://www.bls.gov/schedule/2026/09_sc  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-04 — Stale Content**  
Before: ELIT_SCAN_SYNCED_AT = "2026-09-07"; Virgin Atlantic +30% listed active; Hyatt CSR grandfathering 'confirm'; no Caesars Diamond match; no $250 Select Hotels credit; local deals listed passed Sep 12/19 events.  
After: ELIT_SCAN_SYNCED_AT = "2026-09-22" (note copy carries 13:09 UTC + sources). Sources: https://awardwallet.com/news/amex-membership-rewards/virgin-atlantic-transfer-bonus/ · https://awardtravelfinder.com/transfer-bonuses/amex-membership-rewards · https://upgradedpoints.com/news/chase-aeroplan-transfer-bonus/ · https://awardwallet.com/news/amex-membership-rewards/hilton-transfer-bonus/ · https://frequentmiler.com/chase-slashes-hyatt-transfer-ratio-to-43/ · https://upgradedpoints.com/news/chase-sapp  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-08 — Stale Content**  
Before: NEXT_MOVES_SYNCED_AT = "2026-09-07"; ISA 'why' cited 20 recurring cloud routines; note said 'nothing below has been re-checked since Sep 7'.  
After: NEXT_MOVES_SYNCED_AT = "2026-09-22 13:10 UTC — every COA re-read against weeklyBrief.json (cycle 6) and MASTER-FINDINGS.md by the FR2 freshness pass; facts revised where today's record contradicted them, recommendations unchanged". Evidence: scratchpad/audit/weeklyBrief.json (halted list, engineering, backup, trust sections) and scratchpad/audit/MASTER-FINDINGS.md rows F-E8-06, F-E8-04, F-E12-10, F-INT-08, F-E4a-04, F-E4a-02, F-E12-22.  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-09 — Stale Content**  
Before: SWOT_SYNCED_AT = "2026-09-03"; SMART deadline Dec 4; '15 real recurring cloud automation routines'; Sniper −3.62%/−$2,897; Hyatt 4:3 listed as a threat to Steven; no Composio-incident or backup item.  
After: SWOT_SYNCED_AT = "2026-09-22 13:10 UTC — every item re-read against weeklyBrief.json (cycle 6) and MASTER-FINDINGS.md by the FR2 freshness pass; items revised where today's record contradicted them". Evidence: weeklyBrief.json (caio, engineering, backup, halted), MASTER-FINDINGS.md F-E8-06 / F-E8-04 / F-E12-10 / F-INT-08 / F-INT-05 / F-E1-14 / F-E7-12 / F-E4a-10 / F-E8-59, the deck's own STRATEGIES seed (Sep 16), https://www.globenewswire.com/news-release/2026/09/03/3356225/0/en/what-are-the-202  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-10 — Stale Content**  
Before: TRAVEL_SYNCED_AT = "2026-09-03"; 27 rows dated before Sep 22 (auto-hidden as passed); Mulaney listed at Pechanga Theater; Peltzer 'Sep 15-30'.  
After: TRAVEL_SYNCED_AT = "2026-09-22 13:12 UTC — WebSearch (…)". Sources: https://miramarairshow.com/ · https://www.ohanafest.com/ · https://pacificairshowusa.com/ · https://newportbeachfilmfest.com/ · https://temeculagreekfest.com/ · https://www.bayfestsd.com/ · https://www.metallica.com/tour/ · https://www.sofistadium.com/news/detail/due-to-unprecedented-demand-jay-z-adds-second-sofi-stadium-show-on-october-24 · https://www.ticketmaster.com/keith-sweat-temecula-california-10-08-2026/event/0A0064C3D2  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-12 — Stale Content**  
Before: STRAVA_SYNC_AT = "2026-09-20"; via 'Claude Code session, Strava connector direct read — re-verified against the live account'.  
After: STRAVA_SYNC_AT = "2026-09-22"; STRAVA_SYNC_VIA = "FR2 freshness pass 2026-09-22 13:07 UTC — Strava connector direct read (list_activities); no activity logged since Sep 12"; rows unchanged (Sep 12 / Aug 31 / Aug 30 weight training). Evidence: mcp__Strava__list_activities result 2026-09-22 (activity ids 20151883225, 19985289879, 19969138236).  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-16 — Stale Content**  
Before: STRATEGY_SYNCED_AT copy: '3 weekday cycles missed … an unattended cloud run cannot write to this deck's database, so it changed nothing.'  
After: STRATEGY_SYNCED_AT = "2026-09-16 (03:26 UTC — … Not refreshed since: as of the 2026-09-22 05:35 PT freshness pass the task has missed four weekday cycles (Sep 16–21) … the figures below are still that Sep 16 document, not re-verified today. The cloud routine … reported SUCCEEDED on Sep 21 but changed nothing: the research-only pattern found in F-E12-10 … the Sep 22 probe (F-INT-08) showed an unattended cloud routine CAN write this database, so the fix is that routine's prompt.)". Evidence: MASTE  
X2 verification: Improved — deck master line 8538 (STRATEGY_SYNCED_AT copy); also closes F-M4-24; deck 7f67a19 (merge fr2-life)  

**F-FR2-18 — Current State**  
Before: Assumed WebFetch usable for issuer/agency pages.  
After: All fetches blocked; research completed via WebSearch only. Evidence: curl $HTTPS_PROXY/__agentproxy/status recentRelayFailures (connect_rejected, 403) at 12:52–13:10 UTC.  
X2 verification: Open  

**F-FR3-04 — Retired System Reference**  
Before: ["Lofty (real-estate CRM of record since 2026-09-22 - replaced Follow Up Boss)", "https://www.lofty.com", "4.1, 4.4"]  
After: ["Lofty (formerly Chime) - real-estate CRM of record since 2026-09-22", "https://lofty.com", "4.1, 4.4"] + ["Follow Up Boss - retired 2026-09-22 (history only: replaced by Lofty; its API key had been failing since 2026-09-16 - do not log or look up leads here)", "https://followupboss.com", "4.1, 4.4 - retired ..."]  
X2 verification: Fixed — portal master: 'Lofty (formerly Chime)' (4 hits); the retired-vendor history row FR3 added was removed again by F-L2 under FUB-POLICY (0 hits 'Follow Up Boss')  

**F-FR3-07 — Drift Check**  
Before: 39 / 61 on both files  
After: 39 / 61 on both files (fr3-count-arrays.js, 2026-09-22)  
X2 verification: Fixed — portal master parses LOAN_PROGRAMS 39 / LENDER_DIRECTORY 61 (X2 re-count)  

**F-FR3-09 — Stale Content**  
Before: Q3 2026 (TX, VA, NC) is the active window right now - only ~6 weeks left before quarter-end. Top near-term priority.  
After: Q3 2026 (TX, VA, NC) is the active window right now - as of 2026-09-22 only 8 days are left before it closes on 2026-09-30. Top near-term priority; anything not filed by then rolls into the Q4 window with FL, GA, WA.  
X2 verification: Fixed — portal master: 'only 8 days are left' (1 hit)  

**F-FR3-10 — Misattribution**  
Before: 'A builder-incentive scan does still run daily - the incentives-daily-scan task on Steven's Mac (last ok 2026-09-22) - but it writes to Command Deck's store ...'  
After: 'No task tracks builder buydowns: the incentives-daily-scan task ... writes an incentivePrograms document of down-payment-assistance, utility, tax and veteran programs ... (last written 2026-09-22 02:22 UTC) - useful, but not builder incentives ...' (db/state/incentivePrograms.json)  
X2 verification: Fixed — portal master: 'No task tracks builder buydowns' (1 hit)  

**F-FR3-11 — PII Hygiene**  
Before: Names present in DRIFT_ROWS  
After: Untouched - integrator to decide  
X2 verification: Fixed — portal a22a346  

**F-FR4-05 — Freshness**  
Before: all 11 cities dated Sep 19-21 (2026-09-21 08:05 PM PDT write)  
After: 8/11 cities carry at least one Sep 22, 2026 row; Murrieta/Menifee/New Braunfels unchanged (old dates kept). Evidence URLs are in fr4work/news.json; e.g. https://voiceofsandiego.org/2026/09/22/sheriff-replacing-old-vista-jail-will-improve-inmate-safety/ ; https://www.fox5vegas.com/2026/09/22/one-person-hospitalized-suspect-sought-after-northwest-las-vegas-shooting/ ; https://www.fox5dc.com/news/shooting-outside-northeast-dc-whole-foods-prompts-concerns-customers-neighbors ; https://ground.news/ar  
X2 verification: Improved  

**F-FR4-10 — Tooling**  
Before: assignment assumed WebSearch/WebFetch  
After: documented; consider raising CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION or allow-listing weather.gov/apnews for freshness sessions  
X2 verification: Escalated  

**F-FR5a-01 — Plugin/Integration**  
Before: Not installed; no compression layer; token spend unmeasured  
After: Sandbox: headroom-ai 0.38.0 installed and runs. Mac: pending. Runbook MAC-INSTALL-tooling.md §1 (keys: none; HEADROOM_BEACON telemetry switch)  
X2 verification: Open  

**F-FR5a-02 — Plugin/Integration**  
Before: knowledge-graph/README.md: no install path; entities/ and schema.md described as build inputs  
After: Sandbox: graphifyy 0.9.65 installed, graphify install --platform claude verified against a fake HOME. Mac: pending. README corrections listed in MAC-INSTALL-tooling.md §2; never run /graphify over wiki/clients/  
X2 verification: Open  

**F-FR5a-03 — Plugin/Integration**  
Before: No measurement of Claude Code token spend per seat or per project  
After: Sandbox: codeburn 0.9.25 installed and runs. Mac: brew install codeburn pending; keep share/devices off, optimize --apply only after --dry-run  
X2 verification: Open  

**F-FR5a-06 — Plugin/Integration**  
Before: No review, git, research, ADR, security or debugging discipline skills in the repo  
After: Six skills vendored under .claude/skills/<name>/SKILL.md; 19 listed as available-not-vendored in MAC-INSTALL-tooling.md §6  
X2 verification: Implemented — brain c3c9de3: six skills vendored; F-V2-01 proves all nine load  

**F-FR5a-14 — Plugin/Integration**  
Before: No surgical-change discipline codified for agents editing the deck and skills  
After: karpathy-coding-principles skill vendored; router untouched  
X2 verification: Implemented — brain c3c9de3: .claude/skills/karpathy-coding-principles  

**F-FR5b-01 — Plugin/Integration**  
Before: No WhatsApp path; the deck's note says WhatsApp was removed because personal accounts have no supported API.  
After: whatsapp-cli recommended with reasons; spec, install, security section and deck row written; nothing installed or live.  
X2 verification: Implemented — brain c3c9de3: mac-task-specs.md §5, MAC-INSTALL-comms-data.md §1, CONNECTIONS.md + REMOTE-ACCESS.md rows; deck row via deck c11d5fc (merge fr5b-comms)  

**F-FR5b-03 — Plugin/Integration**  
Before: —  
After: Send-failure handling and the auto-reply exclusion written into mac-task-specs.md §5.  
X2 verification: Documented  

**F-FR5b-05 — Plugin/Integration**  
Before: An older claude-auto on the Mac with an unverified guard hook (F-E8-60).  
After: Replacement launcher + probe + README written; syntax-checked; not executed on a Mac.  
X2 verification: Implemented — brain c3c9de3: integrations/omniroute-failover/ — BUT F-V2-07..18 found the PII gate fails open and two permanent-strand paths; hold the install until fixed  

**F-FR5b-11 — Compliance**  
Before: —  
After: Terms gate written into MAC-INSTALL-comms-data.md §3 and echoed in cli-anything-connectors' rule.  
X2 verification: Open  

**F-FR5b-12 — Security**  
Before: Tool listed for evaluation.  
After: Do-not-use note and one-line verdict in MAC-INSTALL-comms-data.md §4; nothing installed.  
X2 verification: Documented  

**F-L1-02 — Data handling / PII**  
Evidence: Branch-point lines 10917-10955, e.g. ['Patrick S.', 'Spoke with Customer', 3, 'Zillow Preferred', '2026-09-04'].  
Fix: Gone with the card. Flagging it because it is a privacy improvement Steven should know about, and because the same 39 rows may still exist in deck backups and in the artifact DB. Steven's call whether to purge those too.  
X2 verification: Fixed — removed with the card (deck master); the same 39 rows may persist in deck backups and the live auditFindings/DB — Steven's purge call (NEEDS-STEVEN)  

**F-L1-04 — Identifiers - saved state, deliberately NOT renamed**  
Evidence: Post-edit lines 26414, 26420, 26475, 26512, 26570, 26583, 26584; persistence at lines 6948/6998/26434-26435 (lsGet / lsSet / shState / shSave).  
Fix: Kept the keys. Renaming them would orphan every saved client CRM link and break the showing-sync task's target contract. Everything user-visible around them was fixed instead: the target label already reads 'CRM (not writing - Lofty re-point pending)', the input at line 4301 is labelled 'Lofty lead link', and the code comment now records WHY the id is frozen. Needs Steven's word plus a coordinated task change to rename properly.  
X2 verification: Escalated — kept: c.fub / clientFub / "fub" sync-target id (deck master lines ~26765-27037); rename needs a migration plus a showing-sync task change  

**F-L1-05 — AI Team toolkit / CRM & Connectors lane**  
Evidence: Post-edit lines 26027 and 26082.  
Fix: Kept the directory name, removed the 'Follow Up Boss template library' expansion. It now reads 'fub-followups (legacy follow-up template library still under its old directory name on the Mac - rename and port to Lofty)'. Renaming the directory is a change on Steven's Mac, outside this file and outside my authority.  
X2 verification: Escalated — fub-followups is the on-disk skill folder name; renamed nothing; rename is a Mac action (also F-L3-02, F-E11A-06)  

**F-L2-02 — test invariant / container count**  
Evidence: Baseline containersRendered (49) minus final (47) = exactly ["fubNewLeadRows","fubStageStats"]; added = []. exceptions 0, safeRunFailures 0, shapeMismatch 0, missingIds 0, verdict PASS both runs.  
Fix: No fix - the count change is the intended effect of the policy-mandated removal. Flagged so the coordinator can update the expected-container number for this branch to 47.  
X2 verification: Documented — container count 49 → 47 by design; coordinator to set the expected number to 47  

**F-L2-03 — identifiers carrying saved state / external contract**  
Evidence: isa-portal.html lines 4494, 4531, 4589, 4602, 4603. Nothing in the file reads targets back, so the only consumer is external. All associated user-visible text already reads Lofty/CRM: the input placeholder is 'Lofty lead link (optional)', the client row link renders 'CRM record', the copy-out text reads '(CRM link: ...)'.  
Fix: Kept per FUB-POLICY.md identifier rule ('a localStorage key that carries saved state must NOT be renamed silently - keep the key, rename everything user-visible, and report it'). Needs Steven: renaming "fub" -> "lofty" as a sync target must be done together with the Mac showing-sync task and a migration for already-queued requests.  
X2 verification: Escalated — same saved-state identifiers as F-L1-04; rename needs the showing-sync task + a queued-request migration  

**F-L2-04 — scope deviation - panel verification stamp**  
Evidence: panel-isa-easop note: was 'Re-sourced today: the Lofty and Follow Up Boss rows of the tech stack.' now 'Re-sourced today: the Lofty row of the tech stack.' Every at: and scope: value in ISA_PANEL_VERIFIED_AT is byte-identical before and after (diff of all 'at: "...", scope: "..."' pairs is empty), the panel-stamp renderer is untouched, and the stamp still renders 'Part-checked today'.  
Fix: Prose-only change, no date, scope, id or renderer touched. Raised here so the coordinator can revert it on request.  
X2 verification: Documented — one ISA_PANEL_VERIFIED_AT note string changed (prose only); revertable on request  

**F-L2-06 — honesty - no substituted numbers**  
Evidence: Every site that used to quote a FUB figure now says not-connected-yet: the Live CRM Import card ('there are no Lofty numbers to show, and this card will not borrow numbers from another CRM to look populated'), the new lead-forwarding line ('not connected yet... the Lofty API key is not installed'), and the chat portal-context string ('Lofty is not connected yet - the API key is not installed - so there is no real-estate lead count to quote. Say so rather than giving a number.').  
Fix: No figure substituted anywhere. loftyStageStats renders empty and loftyNewCount renders 0, which is the true state.  
X2 verification: Documented — no figure substituted; Lofty cells render empty/0  

**F-L3-02 — Identifier — Mac skill folder**  
Evidence: projects/ai-team.md:34; docs/inventory/mac-task-descriptions.md:127; .claude/skills/skills-refresh/SKILL.md:50; .claude/skills/lofty-crm-sync/SKILL.md:93.  
Fix: Identifier kept in all four places; every descriptive clause around it rewritten to drop the vendor name and to say it needs porting to Lofty. Renaming the folder is a Mac-side action only Steven can take; the repo should be updated in the same pass if he does.  
X2 verification: Escalated — folder rename on the Mac; repo to follow in the same pass  

**F-L3-03 — Identifier — dashboard element ids and seed constants**  
Evidence: Outside my scope: dashboard/isa/isa-portal.html (50 hits) and command-deck.html. Echoed inside my scope only in dated test snapshots: docs/data/restore-test.json:123-124; docs/data/stressTestReport.json:888-889,4330-4331.  
Fix: Not renamed. These belong to the two dashboard engineers; the snapshots that echo them are dated records. Any rename must be done in the dashboard and the harness together, then the snapshots re-taken rather than edited.  
X2 verification: Open — dashboard ids/seed constants deliberately not renamed; snapshots are dated records  

**F-L3-04 — Audit trail**  
Evidence: Left untouched, with per-file line lists, in the hand-back report. Totals: docs/MASTER-FINDINGS.md 79, docs/data/auditFindings.json 61, docs/reports/E4a-report.md 48, docs/findings/findings-E8.json 28, docs/ENGINEERING-BRIEF.md 25, docs/findings/findings-E4a.json 23, docs/findings/findings-E4b.json 16, docs/data/findings-E4b.json 16, docs/reports/E8-report.md 13, docs/data/caio-brief.json 12, plus 16 smaller files.  
Fix: Left in place per the category ruling. Purging them is Steven's call; if he says purge, they should be deleted or re-generated as a set, not edited row by row, so the finding ids stay consistent across files.  
X2 verification: Open — left in place; X2 recount 2026-09-22 ~15:00 UTC: 392 lines / 716 occurrences in 33 files under docs/ (widened pattern, today's sweep files excluded) — purge as a set or leave  

**F-L3-05 — Decision log**  
Evidence: context/decisions.md:3-4 (the rule) and the rewritten entry now headed "## 2026-09-22 — Lofty is the real-estate CRM".  
Fix: Entry rewritten in place: same date, same owner, same status, decision restated around Lofty with an explicit "no Lofty number is live" clause and the key path `~/.config/lofty/.env` / `LOFTY_API_KEY`. Flagged here so Steven knows a dated decision entry was edited rather than superseded.  
X2 verification: Open — context/decisions.md 2026-09-22 CRM entry rewritten in place against the file's own append-only rule (brain c440f1f)  

**F-L3-07 — Integrations / credential hygiene**  
Evidence: integrations/CONNECTIONS.md (the dedicated row, now removed, and the Composio connected-apps list); pre-existing findings F-E4a-13 and F-E8-59 carry the same item.  
Fix: The vendor's own row removed from CONNECTIONS.md and the slug dropped from the connected-apps list, replaced with "plus one retired legacy-CRM connection Steven can delete at his convenience" so the inventory stays accurate. Disconnecting it and revoking the key are account-level actions — HALT, Steven only.  
X2 verification: Escalated — CONNECTIONS.md row/slug removed (c440f1f); disconnecting the Composio connection and revoking its key are account actions  

**F-L3-10 — Search coverage**  
Evidence: knowledge-graph/schema.md:54 (`to: tool.follow-up-boss`) — invisible to the assigned pattern. Widened pattern used for verification: `follow[ ._-]?up[ ._-]?boss|\bFUB\b|fub[A-Za-z_]|followupboss`.  
Fix: Widened pattern used for the whole sweep and for the final account. Anyone re-checking this work should use the widened pattern, not the original.  
X2 verification: Documented — widened pattern adopted by the coordinator (deck 4902159 body)  

**F-L3-11 — Knowledge graph**  
Evidence: knowledge-graph/schema.md:33,54; knowledge-graph/entities/ contains only .gitkeep; knowledge-graph/README.md ("the graph itself is not committed here"; ops-knowledge-graph has never run under the runner).  
Fix: REPLACED_BY kept as a general relation with a vendor-neutral definition; the sample node's example edge replaced with `edges: []` plus a note that REPLACED_BY is written on the retired tool's node. The old example also pointed the wrong way (successor REPLACED_BY predecessor); that is corrected. A `tool.follow-up-boss` node may still exist in the live Graphify graph on the Mac — outside this repo, and only a rebuild after Steven's vault edit will clear it.  
X2 verification: Fixed — knowledge-graph/schema.md line 53: edges: [] with the REPLACED_BY note (c440f1f)  

**F-L3-13 — Mac task specs**  
Evidence: integrations/mac-task-specs.md:264 (before); the lofty-crm-sync prompt at line 34 already forbade reporting another system's number as Lofty.  
Fix: Checklist item rewritten: point the four tasks at Lofty as their lead source, state the key path `~/.config/lofty/.env` / `LOFTY_API_KEY`, and state that until the key is there the tasks have no lead source and must report "not connected yet", not a number.  
X2 verification: Fixed — integrations/mac-task-specs.md line 353: 'not connected yet — the key goes in ~/.config/lofty/.env as LOFTY_API_KEY'  

**F-M1-03 — deck/observability**  
Evidence: No deviceId or deviceRoster document in the 172-doc listing of 'state'; no device-related element id anywhere in command-deck.html before this change.  
Fix: Added a device roster: a random per-browser-profile deviceId kept device-local, a synced deviceRoster doc {v:{devices:{<id>:{label, platform, firstSeen, lastSeen, lastWrite, lastMacFed}}}} capped at 12 devices by least-recently-seen, and a card in panel-toolkit under 'Remote access to your Claude dashboard' with inline rename, relative last-seen, and an amber flag when a device has not written for 48h AND it is the last device to have written a Mac-fed document.  
X2 verification: Implemented — deck master: deviceRoster (8 refs); a deviceRoster document exists in the 14:37 UTC store export, so the merged page has run in a browser; deck e0da920 (merge m1-multimac)  

**F-M1-04 — deck/sync**  
Evidence: command-deck.html applyRemoteSnapshot: 'if (key !== "sectionEdits") changed = true;' followed by location.reload() on the changed path. sectionEdits is at version 3104 and fersEngine at 2338 in the live store, so amplification on this page is measured, not hypothetical.  
Fix: deviceRoster is excluded from the reload path alongside sectionEdits and re-renders its own card directly. Writes are throttled to one per device per hour, persisted in the document's own lastSeen stamp so the throttle survives reloads and extra tabs, re-entrancy guarded (lsSet -> syncKeyToDb -> devNoteWrite -> devTouch is a cycle), and suppressed for the first 2.5s of a page's life so a tab cannot clobber the other Mac's entry before the first remote snapshot lands.  
X2 verification: Fixed — deck master: deviceRoster excluded from the reload path, hourly throttle, 2.5 s settle; deck e0da920 (merge m1-multimac)  

**F-M1-06 — ops/scheduling**  
Evidence: runnerStatus 2026-09-22T04:05:04Z: openrouter-feeds-refresh error (last end 2026-09-17), feeds-weekly limited (2026-09-17), feeds-market-close last ok 2026-09-15, r5-rates-market-refresh and r9-feed-freshness-sweep have no lastEnd at all, r1-morning-brief error, r10-automation-health limited. always-on/README.md records the weekly backup already moved to a cloud writer and took the 2026-09-22 backup.  
Fix: REMOTE-ACCESS.md now names which feeds should move and which cannot, grouped by the actual blocker (local file or daemon, vault files plus the local model, or a connector/Keychain credential). Moving them means creating or editing routines, which an agent may not do.  
X2 verification: Escalated — REMOTE-ACCESS.md names the feeds to move; moving them is a routine create/edit  

**F-M1-10 — deck/content-integrity**  
Evidence: command-deck.html (branch m1-multimac): line 6643 in panel-toolkit (fixed here); line 4742 (M4's region, fixed on deck master, not on this branch); line 5977 in panel-nextmoves — 'research-only by design — an unattended run's write to this dashboard parks on a permission prompt (confirmed three times)'; line 26199 in AI_TEAM_TOOLBOX, rendered into panel-aiteam — '50 routines, 46 enabled — research-only by design: an unattended run's artifact-DB write parks on a permission prompt (confirmed three  
Fix: Line 6643 now reads 'claude.ai/code routines (cloud; since 2026-09-22 known to write this deck's store unattended, but they carry no connectors)', matching M4's wording at 4742. Lines 5977 and 26199 are NOT fixed — outside panel-toolkit and outside my brief. They need an owner.  
X2 verification: Fixed — line 6643 by M1; the two it left (5977, AI_TEAM_TOOLBOX row) fixed by F-M4-09 and F-M4-15 — deck master ee42e30 has 'research-only by design' only in the sentence retiring the rule  

**F-M2-03 — command-deck.html — renderPanelStamps() selector vs <section class="panel panel-pinned" id="panel-vanessa"> (line 1334)**  
Evidence: Line 1334 reads '<section class="panel panel-pinned" id="panel-vanessa">' with no data-page; every other panel section carries data-page. renderPanelStamps() selector is '.panel[data-page]'.  
Fix: Entry kept and set to scope 'review' (true for what the audit did), and the map's header comment now states that an entry for a non-ref panel is inert. Adding data-page to panel-vanessa would change layout/paging behaviour and is out of my region.  
X2 verification: Fixed — F-W1-02 root-caused the selector, not the attribute: renderPanelStamps() now walks '.panel' — deck master (merge aa00d3b); panel-vanessa renders 'Not edited yet'  

**F-M2-04 — command-deck.html — panel-toolkit (section at line 6612)**  
Evidence: panelStampRegistry() returns 38 keys; the file has 39 panel sections. Diffing the two sets leaves panel-toolkit as the only section with no cfg. The renderer's first branch is 'if (!cfg) { cls += " st-you"; txt = "—"; }'.  
Fix: Reported, not changed — adding a registry entry decides what kind of thing the toolkit panel is, which is the integrator's call, and the map entry (now 'review') is already correct for whatever kind is chosen.  
X2 verification: Fixed — F-W1-04/05: panel-toolkit registered (kind ref → 'Reviewed today') and the !cfg fallback no longer borrows st-you — deck master (merge aa00d3b)  

**F-M2-05 — command-deck.html renderPanelStamps() ref branch — and the identical code in isa/isa-portal.html isaPanelStampRegistry()'s renderer**  
Evidence: Injected '"panel-tax": "2026-09-22"' (bare string) into a copy and ran the harness with a probe in the renderer: STAMPROW|panel-tax|panel-stamp|Reviewed |Read and stamp-resolved on function at() { [native code] }; …  
Fix: Fixed on the deck: 'var vAt = (vCfg && typeof vCfg.at === "string") ? vCfg.at : null'. Behaviour is byte-identical for every well-formed entry; only malformed entries change, and they now fall back to 'Reference'. Re-tested: bare string → Reference, object with no at → Reference, object with at but no scope → 'Reviewed 1mo ago' with no colour class. THE SAME BUG IS STILL LIVE IN isa/isa-portal.html — I was scoped to command-deck.html only and did not touch it. Integrator should apply the same on  
X2 verification: Fixed — deck: typeof vCfg.at guard (cff5ad2 via 28945dd); portal: same guard in commit ce74010 — both halves fixed  

**F-M2-06 — command-deck.html — panel-aiteam, card 'Automation & live-data connectivity — honest status', <p id="crmConnectivity"> (line 4527)**  
Evidence: Same card, lines 4530 and 4533 of command-deck.html, quoted above. The blanket 'Every line below is a checked fact' is falsified by two of its own eight bullets.  
Fix: Rewritten to: 'Baseline 2026-09-12 · re-checked 2026-09-22, in part. What was actually re-checked on 2026-09-22 is named in the line that carries it — the Zoho 403 at 08:17 UTC and the CLI-Anything hub README. The rest is carried from the 2026-09-12 baseline, and the lines that could not be checked from a cloud session say so in their own words: whether the Lofty API key is on the Mac is unconfirmed, and nothing has been installed there. Status, not a plan — but not a fresh end-to-end check eith  
X2 verification: Fixed — deck master: crmConnectivity sub reads 're-checked 2026-09-22, in part'  

**F-M3-04 — Correctness — Python version gates**  
Evidence: Real run: whatsapp-cli venv is CPython 3.12.11 and `whatsapp-cli --help` exits 0; the scrapers venv is 3.12, `from scrapling.fetchers import Fetcher` succeeds on scrapling 0.4.15, and `uv pip install scrapegraphai` into that 3.12 venv resolved 2.2.4 — exactly FR5b's recorded result. The rejection branches (scrapegraphai 1.x, a 3.11 venv, a bare scrapling without curl_cffi) were not triggered in the sandbox; they are reasoned from FR5b's results, not executed.  
Fix: None. If a gate ever fires on the Mac the step fails loudly with its reason and the rest of the run continues.  
X2 verification: Implemented — interpreter pins in MAC-SETUP.sh (uv --python 3.12 / 3.13); scrapling[fetchers] import check  

**F-M3-07 — Bug found and fixed during testing — mac-verify.sh**  
Evidence: Before: 'FAIL omniroute/.env mode   File: "/...env" ID: 493ea71b... Blocks: Total: 66053021'. After: 'ok omniroute/.env mode 600'.  
Fix: Fixed. The BSD branch is still the untested one on the Mac (F-M3-05).  
X2 verification: Fixed — mac-verify.sh filemode() GNU-first with octal validation; heredoc loop — F-V2-30 confirms the trap is handled  

**F-M3-08 — OmniRoute failover — install shape**  
Evidence: integrations/omniroute-failover/README.md 'Install on the Mac' steps 3 and 4. Real run produced ~/.local/bin/claude-auto and ~/.local/bin/probe.sh, both byte-identical to the repo copies (cmp) and executable.  
Fix: FR5b may want to state the two target names in its README step 3.  
X2 verification: Open — integrations/omniroute-failover/README.md step 3 (line 104) still says copy both files; the claude-auto vs claude-auto.sh target name is stated only in MAC-SETUP.sh  

**F-M3-11 — HALT — legal gate before any scraper runs**  
Evidence: The two step bodies; the NEEDS-STEVEN lines in the dry-run transcript.  
Fix: Compliance interpretation is Alexandra's draft and Steven's decision — unchanged by this work.  
X2 verification: Escalated — same gate as F-FR5b-11; printed by the scrapling/scrapegraphai steps  

**F-M3-12 — mac-verify.sh — scope and exit semantics**  
Evidence: Run against a mostly-empty throwaway HOME: 17 ok, 5 FAIL, 6 NEEDS, exit 1, with each item named. A checksum of that HOME excluding those two tools' own caches is identical before and after the run.  
Fix: Run it after every MAC-SETUP.sh pass and any time something looks wrong.  
X2 verification: Implemented — mac-verify.sh (brain d64ff61); six gaps found later by F-V2-24..29 — a sound script with additions owed  

**F-M4-02 — panel-openterminal (MARKETS) line 2236 - 'Why the terminal itself is not embedded here' callout**  
Evidence: Contradicts the Reach table (lines 1349-1355 plus FR5b's incoming WhatsApp row): iMessage and Discord are relayed by Mac poll tasks writing this deck's store, and are green. The CSP claim itself is true and is corroborated elsewhere (line 5814, the OpenRouter meter cannot call openrouter.ai from the page).  
Fix: Kept the CSP/127.0.0.1 explanation and the non-Claude Council seats, swapped the WhatsApp example for the OpenRouter meter, and added an explicit sentence that inbound WhatsApp is NOT an instance of this wall - it would arrive through a Mac relay, and its row is a spec waiting on a Mac install.  
X2 verification: Fixed — deck master: 0 hits for 'the same wall that blocks inbound WhatsApp'; deck eaa2292 (merge m4-vanessa)  

**F-M4-03 — panel-personalaccounts (WEALTH) line 3252 - Plaid refresh steps**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md - cloudWriteProbe wrote document version 1 unattended at 2026-09-22T09:05:56Z, no prompt. The real reason a routine cannot do the Plaid step is stated two paragraphs up on line 3247: the plaid-bridge service and its keys are local to the Mac.  
Fix: Kept the conclusion, replaced the reason with the credential/local-service one and noted explicitly that the database write is not the obstacle.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-07 — panel-aiteam line 4701 - Steve twin card**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md; the same doc's 'What does not change' section keeps the connector caveat, which matters here because the twin's Gmail-draft step needs a connector.  
Fix: Left the dated history untouched and appended: that prompt is no longer the blocker (proved 2026-09-22), so the routine can be re-enabled; its Gmail step still needs a connector the routine itself has to carry.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-08 — panel-aiteam line 4742 - 'Remote / live access to the same brain' list**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md retires 'research-only by design'; the surviving limit is connectors, not writes.  
Fix: Changed to '(cloud; since 2026-09-22 they are known to write this deck's store unattended, but they carry no connectors)'.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-10 — panel-marketing line 6333 - video content queue card**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md.  
Fix: Kept the video-editing limit, and recast the queue half as a build item rather than a limit, noting that an unattended routine writing this dashboard has been known to work since 2026-09-22.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-12 — panel-marketing JS - source comment lines 19418-19419 and the rendered marketingSyncNote at line 19434**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md. The observable fact (nothing has landed in the queue) is unchanged.  
Fix: Both now say the routines have landed nothing in the queue, that an unattended cloud write is known to work since 2026-09-22, and that a routine succeeding without moving a document is a defect rather than a platform limit. The comment was changed alongside the copy it justifies so the two do not disagree.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-13 — freshness board 'who writes this' map, line 20799 - 'AI Hedge Fund memo'**  
Evidence: Intra-file contradiction with line 2035, plus docs/CLOUD-WRITE-ARCHITECTURE.md.  
Fix: Re-pointed the explanation at the real cause recorded on line 2035 (blocked egress; SUCCEEDED with no memo) and stated that the database write is not the obstacle.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-16 — panel-aiteam roster - Derek (CTO) tool chips, now line 25905**  
Evidence: Line 4533: 'Spec written this cycle; nothing has been installed on the Mac - that has to happen in a session on the machine.' Line 25978 (CRM & Connectors): 'spec written 2026-09-22, Mac install pending'. Line 25923 skills list: 'Mac install pending'. Three to one, and the three carry the dated detail, so 'installed' is the stale side.  
Fix: Changed the chip to 'CLI-Anything (spec written 2026-09-22; not installed on the Mac yet, wrappers pending)'.  
X2 verification: Fixed — deck master: 0 hits for 'CLI-Anything (installed on the Mac'; deck eaa2292 (merge m4-vanessa)  

**F-M4-17 — EA/ISA start-of-day checklist (SOD_ITEMS), line 14759**  
Evidence: Lines 2258, 4531, 6512 and the rest of the Lofty pass; the checklist is forward-looking instruction, not a dated history constant. Checked renderFlatChecklist (line 15876): tick state is keyed by array index, so changing the text does not lose a tick.  
Fix: 'then Lofty for real estate'.  
X2 verification: Fixed — deck master: 'then Lofty for real estate' (1 hit), 0 hits for 'Follow Up Boss'; deck eaa2292 (merge m4-vanessa)  

**F-M4-18 — EA/ISA start-of-day checklist (SOD_ITEMS), line 14760**  
Evidence: As F-M4-17.  
Fix: Replaced 'FUB Phone' with 'Lofty'. Deliberately did not name a Lofty phone/dialer product feature, because nothing in this file or the engagement establishes one.  
X2 verification: Fixed — deck master: 0 hits for 'FUB Phone'; deck eaa2292 (merge m4-vanessa)  

**F-M4-19 — EA/ISA 90-day onboarding, Days 1-30 (ONBOARD_PHASES), line 14972**  
Evidence: As F-M4-17.  
Fix: 'Audit Zoho CRM and Lofty, ...'.  
X2 verification: Fixed — deck master: 'Audit Zoho CRM and Lofty' (1 hit); deck eaa2292 (merge m4-vanessa)  

**F-M4-20 — panel-wellness (HEALTH) line 3567 - Apple Health card title**  
Evidence: Lines 3569 and 3571 in the same card; the healthNotionCard added directly above it at 3546.  
Fix: Title now reads 'Apple Health - every category (Health Auto Export chain, down since 2026-09-13)'. Element id appleHealthCard untouched.  
X2 verification: Fixed — deck master: 'Health Auto Export chain, down since' (1 hit); deck eaa2292 (merge m4-vanessa)  

**F-M4-21 — panel-wellness (HEALTH) line 3689 - Health metrics log card**  
Evidence: ahFillHealthLog (line 24997) calls ahSnapshot() - it reads the appleHealth document already on the deck. The claim is wrong today and would be wrong again once the Notion path fills that document.  
Fix: Now says it pulls out of the appleHealth snapshot the deck already holds, makes no live read of its own, and that you get whatever last filled that snapshot - the Health Auto Export chain up to 2026-09-13, or the Notion phone path once it runs.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-22 — health coaching freshness banner, renderHealthCoaching fallback, line 16100**  
Evidence: Line 3569 (ingest daemon on :8765 not responding, last real ingest 2026-09-13) and 3571 / 3562 (the Notion phone path is the replacement: open Claude on the iPhone and say 'update my health stats').  
Fix: Fallback now points at the Notion phone path. Only the default string changed; fr.nudge from the document still wins, and the broken-watcher branch at 16099 was left alone because it is still accurate for the ingest watcher.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-24 — LEFT ALONE - STRATEGY_SYNCED_AT constant, line 8263 (panel-quantvue data)**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md. The observable part (strategySnapshot has not moved since 2026-09-16 03:26 UTC, 3 weekday cycles missed) is correct.  
Fix: NOT CHANGED. My brief forbids changing any *_SYNCED_AT constant value, and several stamps are parse-sensitive. Needs the owner of that constant to rewrite the parenthetical to: routine reports SUCCEEDED but strategySnapshot has not moved, which is now an unexplained failure rather than a platform limit.  
X2 verification: Fixed — already rewritten by F-FR2-16 on the fr2-life branch; deck master line 8538 carries FR2's text (merge 7f67a19 landed before m4's) — M4 read a pre-merge base  

**F-M4-25 — LEFT ALONE - panel-toolkit line 6643**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md; identical wording to line 4742.  
Fix: NOT CHANGED - panel-toolkit is M1's. Hand to M1: apply the same wording used at line 4742.  
X2 verification: Fixed — fixed by F-M1-10 on panel-toolkit line 6643; deck e0da920 (merge m1-multimac)  

**F-M4-27 — FLAGGED, NOT CHANGED - panel-aiteam line 4529 (Zoho connector bullet)**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md, 'What does not change': a routine created by an agent stores no MCP connectors, so anything needing Zoho credentials has to run where they live; only a routine created in the web interface carries connectors. Whether this particular routine was created in the web interface cannot be determined from this file.  
Fix: NOT CHANGED - I cannot tell which side is true. Derek / the integration lane should confirm how that routine was created. If it was agent-created, it cannot reach Zoho and the card's promise that the board 'goes green without anyone pasting anything' is false. The rest of the Zoho copy in the file is already correct: the block is a profile permission (HTTP 403 NO_PERMISSION Crm_Implied_Api_Access), Steven-only, Zoho-side - not a missing credential. I found no place still blaming a missing key or  
X2 verification: Open — unresolved: no Zoho re-test routine appears in the 2026-09-22 routine listing (see F-X2-10); the zohoSync doc in the 14:37 export was checked at 08:17Z by a session, not a routine  

**F-M5-03 — Artifact DB / marketingQueue shape**  
Evidence: ArtifactData list on collection 'state' with out_dir, 172 files written to disk and each inspected; 171 have top-level keys exactly ['v'], marketingQueue has ['data','v']. v != data.v; len(v)=3, len(data.v)=2; data.v is a stale prefix of v missing the 2026-09-22 row.  
Fix: Remove the orphaned 'data' key with an ArtifactData update setting data:{'__delete__':true} pinned to the version last read. Content loss risk is nil - data.v is a strict stale subset of v. Steven or the caller makes the write; M5 may not.  
X2 verification: Fixed — the 14:37 UTC store export shows marketingQueue with top level ['v'] only — the orphaned data key is gone; no finding or commit records the write (F-X2-11)  

**F-M5-05 — Guards / standing check**  
Evidence: ai-ecosystem-backup SKILL.md step 6 integrity check accepted 'stravaSnapshot as the known exception'; stress-test-sweep BackupRecovery step 6 said 'docs missing v (expect the stravaSnapshot exception)' and its restore-test record template hardcoded missingV:['stravaSnapshot'].  
Fix: DONE for the weekly pair: both now expect zero and must name any offending doc id by output. PROPOSED, needs Steven, for same-day coverage: the 'Pipeline Sync (live, writes)' routine (trig_01M5zR1Po44gnHvTwA9ogZaB) already reads the DB at 04/10/16/22 UTC - add one ArtifactData list of 'state' plus an assertion that every doc's top level is a single 'v' key, and a ciLog row naming any offender. Catches a bare write within 6 hours for the cost of one read. An agent may not edit a routine.  
X2 verification: Escalated — weekly pair done (a389666); the same-day assertion needs an edit to the Pipeline Sync (live) routine  

**F-M5-07 — Cloud routine / isaLadder**  
Evidence: isaLadder doc: rung 'halted', packetId tw_isa_seat_20260922, updatedAt 2026-09-22T14:35:00Z. Live trigger trig_01J9xuWgAuUCHATtpLivDkgp: last_run fired_at 2026-09-22T12:59:13Z, finished 13:03:09Z, next_run_at 14:33:01Z. Wall clock at audit: 2026-09-22T13:32Z. The stamp appears to have been taken from the next scheduled slot rather than the write time.  
Fix: Correct the routine to stamp updatedAt with the actual write time. Routine edit - Steven's, not an agent's. The run itself was genuine: two isa-ladder rows are in ciLog and the ladder state is coherent.  
X2 verification: Escalated — corrected line in routines/mac-task-repairs.md §6; not applied by anyone; ownership contradicts F-W2-06 (F-X2-05)  

**F-M5-09 — always-on register / silent tasks**  
Evidence: Stamps read from the 172-doc state export taken 2026-09-22 ~13:32 UTC.  
Fix: DONE - always-on/README.md gains a 'Runs, reports success, writes nothing' table naming each with its document and verdict, so none of them is left green.  
X2 verification: Documented — table rewritten by F-W2-03/04 (brain 2cb4ae6): r8 reports ok not error; r4 writes strategySnapshot and is refused, not silent  

**F-M5-11 — always-on register / internal contradiction**  
Evidence: always-on/README.md 'The uptime bound' vs 'Cloud routines that WRITE'. Settled by docs/CLOUD-WRITE-ARCHITECTURE.md and the cloudWriteProbe doc: {'by':'cloud routine write probe','probeAt':'2026-09-22T00:00:00Z','result':'write succeeded unattended'}.  
Fix: DONE - the paragraph now states cloud routines are a partial fallback as of 2026-09-22, cites the probe, and says everything not in the writers table is still bounded by the Mac.  
X2 verification: Fixed — always-on/README.md 'The uptime bound' paragraph (brain a389666)  

**F-M5-12 — Cloud writers / verification**  
Evidence: Weekly ecosystem backup - cloud writer (trig_01JcPh3AM2z21Bsv34SvSkqM) ran 09:35:35Z; backupStatus lastBackup 2026-09-22, verified true, 170 Command Deck + 13 ISA Portal docs; two 'weekly-ecosystem-backup - ok' rows in ciLog. Pipeline Sync live (trig_01M5zR1Po44gnHvTwA9ogZaB) ran 10:09:51Z; reClients and pipeline hold 2 rows each; three 'pipeline-sync - ok' rows in ciLog. ISA ladder (trig_01J9xuWgAuUCHATtpLivDkgp) ran 12:59:13Z; isaLadder.rung 'halted'; two 'isa-ladder - halted' rows in ciLog. A  
Fix: None needed beyond F-M5-07's stamp correction.  
X2 verification: Documented — three cloud writers proven by output; isaScorecard [] on both sides (14:37 export agrees)  

**F-M6-03 — Notion Health Log schema / missing property**  
Evidence: notion-fetch schema includes {"Notes":{"description":"anything the phone flagged","type":"text"}}; full schema enumerates exactly 23 properties.  
Fix: Added `Notes` to the property table in both files, explicitly marked not-mapped / never-parsed / never-analysed, so it cannot become a back door for medical interpretation. The table now lists all 23.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-07 — appleHealth merge / timestamp formats**  
Evidence: Live doc samples: latest_at '2026-09-10 16:10:00', earliest '2026-09-06', workouts[0].start '2026-08-30 20:24:15', meta.last_received '2026-09-13 14:30:40.789561', syncedAt '2026-09-13T23:15:59Z'.  
Fix: Documented the exact per-field formats in both files with an explicit 'do not fix these into ISO' note, and changed the tie-break wording to compare latest_at as a parsed timestamp rather than as a string.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-09 — healthNotionSync / status vocabulary**  
Evidence: Live healthNotionSync doc carries status 'awaiting-first-phone-run', a value the skill's own enum did not permit.  
Fix: Both files now carry the exact six-value set with a line for when each applies, and the skill's self-test asserts every status written is one of the six.  
X2 verification: Fixed — skill line 142: six-value status set incl. awaiting-first-phone-run / not-created  

**F-M6-10 — health-notion-sync / tool allow-list**  
Evidence: integrations/mac-task-specs.md §3 before this change: 'Tools | Notion connector (notion-query-data-sources, notion-fetch, notion-search) ...' with no exclusion clause.  
Fix: §3 now names notion-create-pages, notion-update-page, notion-create-database, notion-update-data-source and notion-create-comment as explicitly not allow-listed, adds 'no Bash' to the deny list, scopes Artifact write_db to the three named docs, and the prompt itself restates that Notion is read-only. The skill separates Stage A (phone, writes) from Stage B (Mac task, read-only).  
X2 verification: Fixed — specs §3 names the five Notion write verbs as not allow-listed, no Bash  

**F-M6-14 — health-notion-sync / empty-read behaviour**  
Evidence: Read-only rows query on data source af1ceecf-fd60-4d95-b0e9-61fa0f49c9c4 -> {"results":[],"has_more":false}. healthNotionSync.rows = 0.  
Fix: Added an explicit zero-rows branch (status awaiting-first-phone-run, rows 0, lastRowDate null, stop, appleHealth untouched, empty is not an error) and a standing rule in both files: if Notion supplied no row the doc does not already have, write nothing to appleHealth — not even a re-stamped copy; only healthNotionSync moves. A day with no row is a gap, never backfilled, never carried forward, never stamped.  
X2 verification: Fixed — specs lines 168-170: zero-rows branch; appleHealth untouched when Notion returns nothing new  

**F-M6-15 — HALT / scope of this engagement**  
Evidence: Engagement constraints: no routine create/update/fire/delete, no artifact DB writes, HALT on credential or account changes. My DB access this session was read-only (get on appleHealth, healthNotionSync, stravaSnapshot, appleHealthSync, healthSyncLog); my Notion access was read-only (fetch + rows query).  
Fix: Everything is delivered as written spec plus skill, ready to install. The deck's honest line until the first run exists is 'Health Log created and empty — awaiting Steven's first phone run'. Registration steps and the prove-it run are in integrations/mac-task-specs.md §3 and the registration checklist.  
X2 verification: Escalated — task not created; no DB write; first phone run + Notion/Apple Health permission grants are Steven's; healthNotionSync status awaiting-first-phone-run, rows 0 (14:37 export)  

**F-M6-16 — documentation honesty / what is live**  
Evidence: Verified live: database bc71c45aac934a4f8aeddc54345136ef with 23 properties and 0 rows; healthNotionSync doc at version 1. Verified not live: no health-notion-sync task, and appleHealth still at via 'scheduled-sync' / read 'daemon' with meta.last_received 2026-09-13.  
Fix: Replaced the header with a seven-row 'What is live, precisely' table stating the state of each piece, closing on 'The database and the card are real; the sync and the data are not.' The 'Source, honestly' section was left byte-identical, including the statement that the Redfield article was never read.  
X2 verification: Fixed — specs header replaced by the 'What is live, precisely' table (grep: present)  

**F-S1-01 — integration-research/showingtime**  
Evidence: WebSearch 2026-09-22, two queries. showingtime.com/solutions/data-distribution (RESO Web API, MLS data distribution); showingtimemls.uservoice.com integrations knowledgebase; zillowgroup.com/developers/mls-broker-data. Primary pages could not be fetched (see F-S1-03). Matches the pre-existing claim in the deck's SH_INTEGRATIONS table and in the skill's prior text.  
Fix: Design the ShowingTime wrapper as a CLI-Anything DOMShell browser harness against Steven's own logged-in session, read-only. Stated as 'no agent-level API found', not as 'no API exists'. Written into .claude/skills/cli-anything-connectors/SKILL.md and into the deck card's ShowingTime row.  
X2 verification: Documented — brain 034de67: cli-anything-connectors SKILL.md; deck card ShowingTime row  

**F-S1-02 — integration-research/showami**  
Evidence: WebSearch 2026-09-22, two queries, returning blog.showami.com/automated-showings-how-to-automate-showing-requests-with-showamis-api/ and showami.com/brokerage-solution + www.showami.com/enterprise-solution. All four hosts are egress-blocked (F-S1-03), so this rests on search-result summaries, not primary pages.  
Fix: Do not assume an API. Spec the Showami wrapper as DOMShell read-only against the logged-in session. If Steven's account is ever granted API automation, the only endpoint it is known to carry is the one verb that must stay disabled (post a showing = spend money + hire a person). SHOWAMI_API_KEY is reserved in the skill by name only and left unused.  
X2 verification: Documented — same; SHOWAMI_API_KEY reserved by name only  

**F-S1-03 — research-evidence-quality**  
Evidence: WebFetch attempts 2026-09-22: 4 distinct hosts, all EGRESS_BLOCKED by the network egress proxy.  
Fix: State the evidence limit rather than asserting certainty; both the skill and the report say 'could not determine from primary sources'. Worth one line in memory.md alongside the clianything.cc entry so the next agent does not spend calls on it. I did not edit memory.md (not my assigned region).  
X2 verification: Documented — evidence limit stated in skill and report; suggested memory.md line not added (memory.md still has no entries)  

**F-S1-04 — command-deck/panel-showings**  
Evidence: command-deck.html, SH_INTEGRATIONS row 2 (Showami), unchanged by me. Search results confirm an API exists but say nothing about a beta exit date.  
Fix: Either source the claim or soften it to 'Showami markets API automation as part of its brokerage/enterprise solution; availability for a solo account is unconfirmed'. I deliberately did not edit it: I cannot prove the replacement is more true than the original, and the brief told me not to remove existing working content. Flagged for whoever can ask Showami directly.  
X2 verification: Fixed — deck ee42e30: the Showami row no longer claims 'API left beta in 2025'; it states what was found and that posting spends money  

**F-S1-15 — safety/authentication**  
Evidence: CRMLS lists ShowingTime as an MLS-provided solution; the skill's pre-existing guardrail already said MFA/SSO is a HALT.  
Fix: Kept and made specific: 'MFA/SSO is a HALT, not a puzzle. ShowingTime is MLS-SSO'd in many markets (CRMLS included).' The step-2/3 install prompt tells Steven to stop and say so rather than work around it.  
X2 verification: Escalated — MFA/SSO is a HALT in the skill's install prompt  

**F-S1-19 — docs/accuracy**  
Evidence: integrations/CONNECTIONS.md line 16, 'The four that need Steven today' table, baseline 2026-09-12 / verified 2026-09-22.  
Fix: Replace that cell with: 'Run ./MAC-SETUP.sh (hub, plugin and browser harness install non-interactively), install the DOMShell Chrome extension and sign in, then say "generate the homes.com wrapper" — generation is the only interactive step.' I did not edit CONNECTIONS.md: it is outside my three assigned deliverables and another engineer is removing Follow Up Boss references from this repo in the same cycle. Handed to the coordinator with the exact replacement text.  
X2 verification: Fixed — applied by F-V1-08: integrations/CONNECTIONS.md line 16 (brain 525e653)  

**F-S1-20 — mac-setup**  
Evidence: MAC-SETUP.sh step groups: STEPS_PREREQ / STEPS_BRAIN / STEPS_FR5A / STEPS_FR5B / STEPS_ONDEMAND — no cli-anything entry.  
Fix: Exact block supplied in the hand-back, written to the file's own idiom (should_run / header / have / run / run_sh / installed / skipped / failed / needs_steven), adding 'cli-anything' to STEPS_FR5B. I did not edit MAC-SETUP.sh: it is not in my worktree, it is another engineer's file with a REFUSED list enforced in code, and they tested it line by line. The coordinator applies it.  
X2 verification: Fixed — MAC-SETUP.sh cli-anything step (lines ~527-561, STEPS_FR5B) — brain 034de67 'the install automated'  

**F-V1-04 — Reconciliation — untraceable verdict: tashfeenahmed/freellmapi**  
Evidence: Re-verified by cloning the repo (shallow, 27 MB, deleted afterwards): live, MIT, actively maintained. It aggregates ~34 providers' free tiers behind one OpenAI-compatible /v1 endpoint with its own router, failover and per-key quota tracking; keys enter through its own dashboard on :3001 into an encrypted store (docker/README.md lines 3, 17, 26, 78); desktop apps; USD 19/yr for the live catalogue, free installs get a 30-day-old snapshot. It is therefore a competitor to OmniRoute, not a source of   
Fix: Declined, and made findable three ways. (1) A DECLINED_LIST was added to MAC-SETUP.sh — printed by --list, and `--only freellmapi` now exits 2 with the full reason instead of 'unknown step'. (2) MAC-INSTALL-comms-data.md gained a summary-table row and a section 6 with the evaluation. (3) The reconciliation table in MAC-INSTALL.md. Reason for declining: OmniRoute already holds that seat, and two routers would mean two egress surfaces to audit for client data against one PII canary. Kept: its publ  
X2 verification: Fixed — MAC-SETUP.sh DECLINED_LIST (line 51); --only freellmapi exits 2 with the reason  

**F-V1-05 — Reconciliation — confirmed dead: cheahjs/free-llm-api-resources**  
Evidence: WebFetch of https://github.com/cheahjs/free-llm-api-resources returned HTTP 404 Not Found on 2026-09-22. Plain curl through the agent proxy returns 403 for every github.com URL including ones that certainly exist, so curl alone cannot distinguish a dead repo from a blocked one — the WebFetch result is the load-bearing evidence. Coverage: OmniRoute ships docs/reference/FREE_TIERS.md (audited 2026-09-03), and freellmapi.co/models is a live second opinion.  
Fix: Recorded as DECLINED in MAC-SETUP.sh with the reason and both replacement catalogues, so --only free-llm-api-resources answers instead of erroring. Re-verification paragraph added to MAC-INSTALL-comms-data.md's unreachable-sources section.  
X2 verification: Documented — WebFetch 404 re-confirmed; DECLINED with replacement catalogues  

**F-V1-06 — Verified, not assumed — the three free-key sources**  
Evidence: MAC-SETUP.sh's omniroute step calls ensure_env_file with OMNIROUTE_API_KEY, OPENROUTER_API_KEY, NVIDIA_API_KEY and BYTEZ_API_KEY plus a where-to-get-it hint each; ./MAC-SETUP.sh --dry-run printed all four under 'MISSING KEY VALUES (names only)'. mac-verify.sh line ~169 checks the same four by name and reports 'no value yet' per name. The identical ensure_env_file code path was executed for real under HOME=/tmp/v1-home by the new lofty and higgsfield steps: files created at mode 600 containing NA  
Fix: No change needed to the wiring — it was already correct. Documented the verification in MAC-INSTALL-comms-data.md so it is not re-litigated. Not executed anywhere: the omniroute step's own npm install -g omniroute and its .env creation were not run for real in this session (only dry-run), because the step also installs a package.  
X2 verification: Documented — four key NAMES wired and checked; values are Steven's  

**F-V1-08 — Stale instruction never applied — F-S1-19**  
Evidence: integrations/CONNECTIONS.md, CLI-Anything row of 'The four that need Steven today', read 2026-09-22. F-S1-19's own fix field: 'I did not edit CONNECTIONS.md ... Handed to the coordinator with the exact replacement text.'  
Fix: Applied the handed-over text. The status cell now reads 'Not installed on the Mac, but no longer manual' and names F-S1-18; the action cell reads 'Run ./MAC-SETUP.sh (hub, plugin and browser harness install non-interactively), install the DOMShell Chrome extension and sign in, then say generate the homes.com wrapper — generation is the only interactive step.' F-S1-19 can be closed.  
X2 verification: Fixed — integrations/CONNECTIONS.md line 16 (brain 525e653); closes F-S1-19  

**F-V1-09 — mac-verify.sh did not check the newest step**  
Evidence: grep for cli-anything, cli-hub, lofty and higgsfield in mac-verify.sh returned nothing before this change.  
Fix: Added a CLI-Anything block to mac-verify.sh: cli-hub presence and version, the cli-anything-browser harness at ~/Applications/CLI-Anything/.venv/bin/, the plugin via claude plugin list, and a NEED if CLI_HUB_NO_ANALYTICS is not set in the checking shell, naming F-S1-05. Added conditional env-file checks for cli-anything and higgsfield. bash -n and shellcheck 0.11.0 clean.  
X2 verification: Fixed — mac-verify.sh CLI-Anything block (lines ~158-164) + env-file checks (525e653)  

**F-V2-02 — vendored skills**  
Evidence: Dead links: code-review-and-quality/SKILL.md:354,355; security-and-hardening/SKILL.md:122,143,169; security-and-hardening/references/hardening-patterns.md:5,9,208 (plus the two header notes). `ls .claude/references` -> No such file or directory; repo-wide find for security-checklist.md / performance-checklist.md returned nothing. Fetched both from https://raw.githubusercontent.com/addyosmani/agent-skills/main/references/ (HTTP 200, 14360 and 13139 bytes); upstream LICENSE fetched and verified MI  
Fix: DONE. Vendored to .claude/references/security-checklist.md and .claude/references/performance-checklist.md with provenance headers matching the repo convention. All five link classes now resolve (verified by path test from each referring file). The two header notes in code-review-and-quality/SKILL.md:7 and security-and-hardening/SKILL.md:7 were rewritten to say the targets are now vendored. Both anchors used by the skills (#owasp-top-10-quick-reference, #destructive-path-operations) exist in the  
X2 verification: Fixed — brain aa3b734: .claude/references/security-checklist.md + performance-checklist.md vendored; header notes rewritten  

**F-V2-05 — injection surface**  
Evidence: find-skills/SKILL.md:102 (`npx skills add <owner/repo@skill> -g -y`, with the text 'The -g flag installs globally (user-level) and -y skips confirmation prompts'), reached from Step 6 'Offer to Install'. Mitigating: Step 4 of the same skill does require install-count, source-reputation and star checks before recommending.  
Fix: Add a local note under the provenance header binding Step 6 to the HALT list: search and recommend freely, but any actual `skills add` is a Needs-Steven packet, never an agent action. Not applied — it edits vendored upstream text beyond a broken reference, so Steven should call it.  
X2 verification: Escalated — find-skills Step 6 (-g -y) conflicts with the HALT list; binding note is Steven's call (unvetted code install)  

**F-V2-12 — omniroute failover**  
Evidence: claude-auto.sh:99-100 and probe.sh:38-40 (epoch taken verbatim, `[ -n "$epoch" ] || epoch=0`, no upper bound). Executed with reset_at seeded to 4102444800 (2100-01-01): a LaunchAgent-style `probe.sh` run exited 0 having logged only 'waiting: mode=free-fallback reset_at=4102444800', and claude-auto.sh:61's re-probe gate (`reset_at <= now`) never opens. The parser `grep -oE '\|[0-9]{10}'` correctly reads the real Claude Code format 'usage limit reached|<epoch>' (verified) but also matches a compac  
Fix: Clamp the parsed epoch: reject anything more than ~24h ahead of now or earlier than now, falling back to 0 (which makes the next probe run immediately).  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-13 — omniroute failover**  
Evidence: claude-auto.sh:28 and probe.sh:16, regex `(sk|key|token|Bearer)[-_ ][A-Za-z0-9_-]{6,}` — the delimiter class excludes `=`, `:` and `"`. Executed against fake placeholder values: `OMNIROUTE_API_KEY=<value>` NOT redacted; `Invalid token: <value>` NOT redacted; `{"api_key":"<value>"}` NOT redacted; `x-api-key: <value>` NOT redacted. Only `ANTHROPIC_AUTH_TOKEN=sk-ant-<value>` and `Authorization: Bearer <value>` were redacted.  
Fix: Widen the delimiter class to `[-_ =:\"']` and add a catch-all for long high-entropy runs following any *KEY/*TOKEN/*SECRET identifier. No real credential was used in this test and none is recorded here.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-14 — omniroute failover**  
Evidence: claude-auto.sh:101 and probe.sh:44 (`cat "$tmp" "$tmp.err" | redact` appended to $SAMPLES); claude-auto.sh:14 `mkdir -p "$STATE"` with no mode, versus :71-72 which does enforce 600 on the .env. Observed in the strand test: limit-samples.log accumulated one entry per failed probe with no cap.  
Fix: Create $STATE with mode 700 and the log with 600, cap or rotate the file, and skip the sample entirely when is_pii=1.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-15 — omniroute failover**  
Evidence: claude-auto.sh:71 `p=$(stat -f %Lp "$f" 2>/dev/null || stat -c %a "$f" 2>/dev/null)`. Executed on this Linux host against a genuinely chmod-600 file: the script printed 'must be chmod 600 (is <multi-line filesystem report> 600)' and exited 78. mac-verify.sh:45-55 documents this exact trap ('on Linux `stat -f` means "file SYSTEM status" and succeeds with the wrong output') and implements it correctly as filemode() — GNU first, validated as octal, BSD as fallback. Fails closed, so it is an availab  
Fix: Reuse mac-verify.sh's filemode() shape: assign from one stat, validate the result is octal, only then try the other form. Note the README's claim that 'the launcher's stat -f, env -u and mktemp forms are the macOS ones with GNU fallbacks' is wrong for stat.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-18 — omniroute failover**  
Evidence: claude-auto.sh:14 `mkdir -p "$STATE"` (no mode), :29 `. "$ROUTE"`, probe.sh:8,17 the same. Mitigation verified present: :31 `tr -c 'A-Za-z0-9 _.:=-' '_'` strips quotes and metacharacters from the reason string before it is written, so a crafted limit message cannot inject shell into the sourced file.  
Fix: `mkdir -p -m 700 "$STATE"`, and refuse to source route.env if it is group- or world-writable. Better still, parse the six known keys with grep/cut instead of sourcing.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-20 — unsupported claims**  
Evidence: README.md:112 step 1 (and step 2, which delegates the no-task case to 'the existing guard hook' whose coverage F-E8-60 says was never verified). Executed both orderings; only the documented one defers.  
Fix: Add canary cases to the README for: claude args before --task; no --task at all; and a task name not in DEFAULT_PII_TASKS. Each must exit 75 with zero requests reaching :20128 before the runner is pointed at claude-auto.  
X2 verification: Escalated — README.md:112 canary covers only the passing argument order  

**F-V2-21 — unsupported claims**  
Evidence: See F-V2-07/08/09 for the executed counter-examples. The surrounding claims in that same row are accurate and well-hedged; this one sentence is the outlier.  
Fix: Reword to the tested truth: 'Client-data tasks defer (exit 75) only when --task names a listed task AND appears before the claude arguments; otherwise they route to the free provider (F-V2-07..09).' Then fix the script and restore the claim.  
X2 verification: Open — integrations/CONNECTIONS.md line 45 still asserts 'Client-data tasks defer (exit 75)'; false for three of four invocation patterns  

**F-V2-27 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:60-72, specifically :63 `ok "$_label" "$("$_p" "$@" 2>/dev/null | head -1 ...)"` — no exit-status test, stderr discarded. Executed with a graphify stub that exits 1: 'ok    graphify' with an empty version field.  
Fix: For V1: capture the exit status and treat non-zero, or empty output, as `bad "<label>" "on PATH but --version failed"`.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-V2-28 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:197-205 — `mcp=$(claude mcp list 2>&1)` merges stderr, then `n=$(grep -c .)` and `ok "claude mcp list" "$n line(s) returned"` for any non-empty output. Executed: with no servers configured, the output 'No MCP servers configured. Use `claude mcp add` to add a server.' was reported as 'ok  claude mcp list  1 line(s) returned'.  
Fix: For V1: keep stderr separate, test the exit status, and treat 'No MCP servers configured' as `need` rather than ok. The agent402 refusal check below it is good and should stay.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-W1-01 — PANEL_VERIFIED_AT / panelStampRegistry()**  
Evidence: Cross-reference of 40 panel sections vs 38 registry entries vs 33 map entries. Live map consumers: panel-hedgefund -> 'Part-checked today' (st-fresh); panel-tax -> 'Reviewed today'. Every other panel's baseline stamp is data-derived and unaffected by the map, e.g. panel-quantvue '[st-warn] Seed · 6d ago', panel-marketing '[st-fresh] Seed · yesterday', panel-brief 'Published seed · today'.  
Fix: NO DATA CHANGE. Neither candidate fix is right. (a) Widening: converting a 'you'/'live'/'synced' panel to 'ref' would swap a self-correcting, data-derived date for a hand-typed one AND destroy its staleness colour, because scope:'review' is deliberately given no colour class — panel-quantvue's amber 'Seed · 6d ago' would become a flat, never-ageing 'Reviewed today'. That is the precise failure the stamp system exists to prevent. (b) Pruning: the 31 inert entries are the audit record of the 2026-  
X2 verification: Documented — no data change; contract comment rewritten — deck master (merge aa00d3b)  

**F-W1-05 — renderPanelStamps() !cfg fallback**  
Evidence: Reproduced on a throwaway copy with panel-toolkit's new entry removed: before the fallback fix it rendered '[panel-stamp st-you] "—"'.  
Fix: Fixed BOTH the registry entry (F-W1-04) and the fallback, because they are independent defects: the entry fixes panel-toolkit, the fallback fixes the next panel added without one. Dropped st-you (no colour class at all — an unregistered panel has earned none) and replaced the dash with 'Unregistered' plus a title naming panelStampRegistry() as the place to fix it. Verified on the same throwaway copy: '[panel-stamp] "Unregistered"', while genuinely hand-maintained panel-kanban still correctly rea  
X2 verification: Fixed — deck master: !cfg fallback renders 'Unregistered' with no colour class (grep 1 hit); deck aa00d3b (merge w1-stamps)  

**F-W1-06 — execSyncRegistry() freshness board**  
Evidence: #topPerformersSyncNote is at L3177, inside panel-personalaccounts (L3073-3249), not panel-quantvue (L1610-1982). The OR_FEEDS registry pairs list 'topPerformersLiveList' with note 'topPerformersSyncNote'. Located by line range, not by name.  
Fix: Changed the panel argument to "panel-personalaccounts". Stamp source (TOP_PERFORMERS_SYNCED_AT) unchanged.  
X2 verification: Fixed — deck master: add("Top performers", …, "panel-personalaccounts") (grep 1 hit); deck aa00d3b (merge w1-stamps)  

**F-W1-07 — execSyncRegistry() freshness board**  
Evidence: #bearsSyncNote is at L1559, inside panel-news (L1516-1578), not panel-brief (L1407-1515). OR_FEEDS pairs 'bearsLiveNews' with note 'bearsSyncNote'.  
Fix: Changed the panel argument to "panel-news". Stamp source (BEARS_SYNCED_AT) unchanged.  
X2 verification: Fixed — deck master: Bears tracker → panel-news; deck aa00d3b (merge w1-stamps)  

**F-W1-08 — execSyncRegistry() freshness board**  
Evidence: PANEL: #aiNewsList (L5804) and #aiNewsHonestyNote (L5805) are inside panel-pedefense (L5753-5831), not panel-tools (L4185-4284). STAMP SOURCE: renderOrFeeds() repaints #aiNewsList from liveFeeds whenever that feed carries text or citations, so feedStampIso('aiNewsList') is the timestamp of what is actually on screen; the live store has liveFeeds.feeds.aiNewsList.checkedAt = '2026-09-20T20:33:06Z', a real ISO instant from the daily feed task. The aiNews document is NOT a usable substitute: db/sta  
Fix: Changed the panel argument to "panel-pedefense" only. Left feedStampIso("aiNewsList") and the threshold of 2 exactly as they were, and recorded the reasoning in a comment so the next engineer does not 'fix' it back.  
X2 verification: Fixed — deck master: AI news → panel-pedefense, stamp source unchanged by evidence; deck aa00d3b (merge w1-stamps)  

**F-W1-10 — panelStampRegistry() — panel-aiteam (NOT FIXED, reported)**  
Evidence: sed over panel-aiteam's full range (L4543-4866) returns ZERO 'vanessa*' element ids. #vanessaChatBox is at L1365 and #vanessaRecRows at L1401, both inside panel-vanessa (L1334-1406). panel-aiteam says so itself at L4829: 'Vanessa's chat, her reach table, and her recommendations now sit at the very top of the dashboard... <a href="#panel-vanessa">Jump to Vanessa</a>'.  
Fix: NOT APPLIED — deliberately out of scope. Removing those two keys changes panel-aiteam's stamp behaviour, and panel-aiteam is not one of the four assigned bugs nor a board row. Recommended for a follow-up: drop 'vanessaChat' and 'vanessaRecommendations' from panel-aiteam's keys, leaving its 16 other keys intact. Low risk (both panels currently read 'Not edited yet' in the harness), but it is a visible-behaviour change on an unassigned panel and should be someone's explicit call.  
X2 verification: Fixed — deck d46b372 (x1-sweep, 14:50 UTC): vanessaChat and vanessaRecommendations dropped from panel-aiteam's keys — on the path to master ee42e30  

**F-W2-03 — Mac task / r8-apple-health-snapshot**  
Evidence: appleHealth is version 11; its newest source row ends last_at '2026-09-13 00:00:00' (metric step_count, source iPhone) - 9 days stale. Live runnerStatus: {cron:'10 5,21 * * *', enabled:true, lastEnd:'2026-09-22T05:12:04', lastStatus:'ok'}. healthNotionSync v2 = {createdAt:'2026-09-22T13:18:32Z', createdBy:'cloud session (Notion connector)', lastRowDate:null, lastSyncAt:null, status:'awaiting-first-phone-run'}. healthAnalysis is frozen behind it, its dataGaps opening 'No sleep data - nothing is w  
Fix: One-line decision with a recommendation and the exact action for each branch, in routines/mac-task-repairs.md section 3. Recommended Branch A: disable r8 and health-full-analysis, do the one phone run, verify via healthNotionSync.status leaving 'awaiting-first-phone-run'. Branch B: restart the Health Auto Export daemon on :8765 and verify appleHealth gains a stamp newer than 2026-09-13 within one slot. A is recommended because B restores a dependency on a local daemon that already failed silentl  
X2 verification: Escalated — routines/mac-task-repairs.md §3; healthNotionSync awaiting-first-phone-run, rows 0 (14:37 export)  

**F-W2-06 — Cloud routine / isaLadder proof-of-life**  
Evidence: v2: v.updatedAt '2026-09-22T14:35:00Z' against server updatedAt '2026-09-22T13:03:31.012869Z' - 1h31m IN THE FUTURE, the next slot. v3: v.updatedAt '2026-09-22T14:30:00Z' against server updatedAt '2026-09-22T14:35:53.018253Z' - 5m53s early, this slot's nominal time. Trigger trig_01J9xuWgAuUCHATtpLivDkgp, cron '30 14 * * 2-6', last fired 2026-09-22T14:33:39.942415796Z, finished 14:35:57.379677Z. The runs are genuine - ladder state is coherent (rung 'halted', consecutiveMisses 3, packetId tw_isa_s  
Fix: Corrected line written to routines/mac-task-repairs.md section 6, requiring the actual UTC time at the moment of the write, naming both wrong values explicitly so neither can be reintroduced, and giving the check (v.updatedAt within a minute or two of the document's own server updatedAt, never ahead of it). Created via meta_mcp, so an agent may apply it - this one does not need Steven.  
X2 verification: Open — corrected line in routines/mac-task-repairs.md §6; not applied; isaLadder.updatedAt 2026-09-22T14:30:00Z in the 14:37 export (a slot time)  

**F-W2-08 — Cloud routine / Real Estate Weekly Brief**  
Evidence: trig_01CjaMXrbMga1jPdJzUnwLUo, created_via meta_mcp. Its body calls FOLLOW_UP_BOSS_LIST_APPOINTMENTS, Google Calendar list_events/search_events and Gmail search_threads. docs/CLOUD-WRITE-ARCHITECTURE.md: 'a routine created by an agent stores no MCP connectors, so anything needing Zoho, Lofty, Gmail or GitHub credentials still has to run where those credentials live.' Separately it targets Follow Up Boss, which wiki/dashboard-ops/index.md records as superseded - Lofty is the real-estate system of  
Fix: Presented as a Steven decision in routines/mac-task-repairs.md section 7: recreate it through the web interface once Lofty is connected, because web-created routines carry connectors, or retire it. Deliberately did NOT write a corrected prompt, because a corrected prompt would still have no connectors and would be a plausible-looking non-fix.  
X2 verification: Escalated — routines/mac-task-repairs.md §7: recreate in the web UI once Lofty is connected, or retire  

**F-W2-09 — Cloud routines / stock templates**  
Evidence: All three prompts read '/home/claude/vault' and directories Ops/Issues/, Ops/Processes/, Projects/, Finance/Books/, and all three test whether _memory/Business.md still says 'onboarding not yet completed'. None of those exists in this ecosystem. All three end 'Present ... as your reply' - no document is written, so no run is verifiable by output. A full 173-document listing of collection 'state' contains no ledger, books or finance document for Books Reconciliation to reconcile.  
Fix: Recorded in routines/mac-task-repairs.md section 7 as latent defect (a), to be dealt with only AFTER the run failure in F-W2-07 is cleared - there is no point correcting a prompt that is not executing. Retiring Books Reconciliation is the honest call and is stated as such. Deliberately did not invent a subsystem for these three to read.  
X2 verification: Escalated — routines/mac-task-repairs.md §7 latent defect (a): retire the three stock templates  

**F-W2-10 — Cloud routines / lying green row**  
Evidence: trig_018BSAYiYzvtyaUkpAY4SnqE, cron '0 1,7,13,19 * * *', created_via http_api. Fired again 2026-09-22T13:08:44.728942737Z, ran 1m31s, reported SUCCEEDED, moved nothing. A disable was retried by the coordinator the same afternoon and refused with 'this routine was created via http_api, not by an agent'. Superseded by trig_01M5zR1Po44gnHvTwA9ogZaB at 04/10/16/22 UTC, which genuinely writes and is working.  
Fix: One click, link given in routines/mac-task-repairs.md section 8 and in always-on/README.md. Recorded as the reason routine status cannot be used as evidence anywhere in the register.  
X2 verification: Escalated — one click; same item as F-M5-08  

**F-W2-14 — wiki/dashboard-ops / stale standing fact**  
Evidence: wiki/dashboard-ops/index.md, 'Standing facts (2026-09-22)': 'Cloud routines are research-only by design. An unattended cloud run's artifact-DB write parks on a permission prompt - confirmed three times. A cloud routine that succeeded may have written nothing; check the doc stamp.' The first two sentences are false as of cloudWriteProbe v1 (docs/CLOUD-WRITE-ARCHITECTURE.md); only the third still holds. The same page's 'Where a status comes from' table also still reads 'Did a backup happen? backup  
Fix: NOT APPLIED - flagged rather than edited. It is outside the region I was assigned and the same page is cited by other in-flight work; always-on/README.md already carries the corrected version of both facts. Whoever owns the wiki should replace the research-only assertion with a pointer to docs/CLOUD-WRITE-ARCHITECTURE.md and refresh the backup line.  
X2 verification: Fixed — brain f4b0186 (14:53 UTC): wiki/dashboard-ops/index.md standing facts rewritten around cloudWriteProbe; backup line refreshed  

**F-X2-04 — contradiction / r4-quantvue-sync and r8**  
Evidence: findings-M5.json F-M5-09; findings-W2.json F-W2-03/04; docs/inventory/mac-task-descriptions.md line 40.  
Fix: F-M5-09 marked Superseded; the register table already carries W2's reading. Actions are F-W2-03 (decision) and F-W2-04 (paste), both Steven's.  
X2 verification: Documented  

**F-X2-05 — contradiction / who may fix isaLadder.updatedAt**  
Evidence: findings-M5.json F-M5-07 halt true; findings-W2.json F-W2-06 halt false; routines/mac-task-repairs.md §6.  
Fix: Steven decides in one line: paste §6 himself, or authorise the coordinator to apply it (the engagement rule forbade routine edits to every engineer today).  
X2 verification: Escalated  

**F-X2-06 — contradiction / rate as-of dates on deck vs portal**  
Evidence: deck master lines 9192/9196 asOf 'Sep 20, 2026'; portal master 'Rates as of Sep 22, 2026 ET' (2 hits); deck c29b00f body.  
Fix: One 30-second look at navyfederal.org from the Mac (F-FR1-09's own recommendation) settles which date the page shows; then align the other artifact.  
X2 verification: Open  

**F-X2-07 — contradiction / Meritage builder incentive**  
Evidence: findings-FR1.json F-FR1-04; findings-FR3.json F-FR3-02; portal master contains 'Oct 2024' (1 hit) and 'Meritage' (3 hits).  
Fix: Open the Meritage promotion page from the Mac on the next builder-incentive hand check and make the two artifacts agree; until then the ISA should not quote the Meritage rate.  
X2 verification: Open  

**F-X2-10 — unbacked claim / Zoho re-test routine**  
Evidence: docs/inventory/cloud-routines.md (50 rows, none Zoho); scratchpad/all/state/zohoSync.json checkedAt 2026-09-22T08:17:00Z, status blocked; context/decisions.md Zoho entry 'A cloud routine re-tests every few hours'.  
Fix: Derek's lane confirms whether the routine exists (it would have to be web-created to carry the Composio connector); if it does not, correct the deck bullet and decisions.md to 'no automatic re-test; the board fills after the next manual sync'.  
X2 verification: Open  

**F-X2-12 — master table / superseded halts**  
Evidence: docs/MASTER-FINDINGS.md halted list (09:51 UTC) vs F-INT-07 Fixed; 14:37 export backupStatus lastBackup 2026-09-22 verified true.  
Fix: Done: F-E1-14, F-E7-12, F-E8-05 marked Fixed (superseded) with the evidence; F-E11A-02 kept Escalated as the one remaining decision (cron/root, and whether r6 is disabled).  
X2 verification: Fixed  

**F-X2-15 — evidence gap / published versions**  
Evidence: Artifact list (Command Deck, ISA Portal: updated 2026-09-22); scratchpad/all/state/deviceRoster.json present; git log bodies of both scratchpad repos.  
Fix: The integrator records the published version number in projects/command-deck.md and projects/isa-portal.md at every republish (the caller's 'deck v145 / portal v30' can be confirmed there); X2 could not verify those numbers from the tree.  
X2 verification: Recommended  

**F-X2-19 — OmniRoute failover / blocked install**  
Evidence: findings-V2.json F-V2-07..18 (executed reproductions); MAC-INSTALL-comms-data.md §2 and integrations/omniroute-failover/README.md unchanged after aa3b734; CONNECTIONS.md line 45 (F-V2-21).  
Fix: Until F-V2-07..18 are fixed and the widened canary (F-V2-20) passes on the Mac: do not run MAC-SETUP.sh's omniroute step against the runner, do not replace the existing claude-auto, and keep the runner on plain claude. NEEDS-STEVEN says so in one line.  
X2 verification: Open  

**F-FR1-05 — freshness**  
Before: TOP_PERFORMERS_SYNCED_AT = "2026-09-07 (research pass for the four tables …)"; stocks IMRN / CDTG / NRSN / NWGL / GPRO (Sep 4 session); dividends ET 6.32 / PFE 6.05 / T 4.32 / F 4.10 / CVX 3.42 (MarketBeat Sep 7)  
After: TOP_PERFORMERS_SYNCED_AT = "2026-09-22 13:50 UTC — stocks table re-baked to the Mon Sep 21, 2026 close …"; sources: https://finance.yahoo.com/markets/stocks/gainers/ · https://finance.yahoo.com/markets/world-indices/articles/major-us-stock-indexes-fared-203454849.html · https://finance.yahoo.com/markets/stocks/articles/arm-surges-13-meta-muse-152410038.html · https://www.reuters.com/business/wall-st-futures-rise-ai-stocks-gain-oil-prices-slide-2026-09-21/ · https://www.marketbeat.com/stocks/NYSE  
X2 verification: Fixed — deck master: TOP_PERFORMERS_SYNCED_AT = "2026-09-22 …"; deck 705dcf6 (merge fr1-markets)  

**F-FR1-06 — freshness**  
Before: IVOG 18.71 / SPYM 18.49 / IVV 18.41 / ILCB 18.23 / BBUS 17.88 — 'Yahoo Finance top-performing ETF screen (52-week change, Sep 7)'  
After: Same rows; source now 'Yahoo Finance top-performing ETF screen (52-week change, Sep 7) — not re-verified 2026-09-22, the screen is blocked from this session' — https://finance.yahoo.com/markets/etfs/top-performing/ (blocked); https://www.etf.com/sections/features/best-performing-etfs-2026-0 (undated in the index)  
X2 verification: Open  

**F-FR1-08 — freshness**  
Before: HF_MEMO_SYNCED_AT = "2026-09-07"; card copy: 'The memo card above is still that Sep 7 run: no later run has written a memo.'  
After: HF_MEMO_SYNCED_AT unchanged ("2026-09-07"); card copy adds 'The only later attempt — a remote run requested Sep 11, 2026 — was aborted on Sep 13 … as of 2026-09-22 the Sep 7, 2026 AAPL run is the only committee memo on record.' Evidence: artifact DB state/hfCommitteeMemo (ranAt 2026-09-07T20:50:00-07:00), state/hfRequest (status failed, completedAt 2026-09-13T00:15:00Z)  
X2 verification: Improved — deck master: 'is the only committee memo on record' (1 hit); deck 705dcf6 (merge fr1-markets)  

**F-FR1-10 — freshness**  
Before: Six rows with asOf Sep 18, 2026 from the document  
After: Unchanged — artifact 1624daae… state/ratesSnapshot v9 (https://fred.stlouisfed.org/series/OBMMIC30YF and siblings)  
X2 verification: Fixed — ratesSnapshot v9 matches the seed; nothing changed  

**F-FR2-05 — Stale Content**  
Before: ELITE_AFFLUENT_SYNCED_AT = "2026-09-04"; 15 rows.  
After: ELITE_AFFLUENT_SYNCED_AT = "2026-09-22 13:10 UTC — WebSearch (…); four rows added at the top of the empires table, the rest carried from Sep 4 unchanged"; 19 rows. Sources: https://www.atptour.com/en/news/federer-forbes-list-march-2026 · https://www.sgieurope.com/athlete-economy/federer-from-champion-to-billionaire-investor/120059.article · https://www.forbes.com/sites/hanktucker/2026/06/05/how-lionel-messi-became-a-billionaire/ · https://sports.yahoo.com/articles/lionel-messi-joins-inter-miami-  
X2 verification: Improved — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-06 — Stale Content**  
Before: PEDEFENSE_SYNCED_AT = "2026-09-07"; Blackstone/Thoma Bravo row read 'Portfolio pressure' (Apr 2026); Anduril row had no Series H.  
After: PEDEFENSE_SYNCED_AT = "2026-09-22 13:10 UTC — WebSearch (Breaking Defense, Joint Forces News, TechCrunch/Bloomberg/Anduril PR, Crunchbase News, Medallia PR); four rows added at the top, two existing rows updated, the rest carried from Sep 7 unchanged". Sources: https://breakingdefense.com/2026/08/aevex-to-acquire-blacksea-technologies-for-up-to-650m/ · https://www.joint-forces.com/world-news/defence-news/94139-acquisition-of-iten-defense-by-np-aerospace · https://breakingdefense.com/2026/09/lock  
X2 verification: Improved — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-07 — Stale Content**  
Before: OPP_RADAR_SYNCED_AT = "2026-09-07"; 13 items, newest found 2026-09-07.  
After: OPP_RADAR_SYNCED_AT = "2026-09-22 13:10 UTC — WebSearch (NMLS renewal overview + 24hourEDU via GlobeNewswire, Luxury Presence on Lofty pricing, VA Loan Network, Breaking Defense); four items added at the top, the rest carried from Sep 1–7 unchanged"; 17 items. Sources: https://www.globenewswire.com/news-release/2026/09/03/3356225/0/en/what-are-the-2026-nmls-ce-deadlines-for-mlos-24houredu-releases-pre-approved-online-self-paced-courses.html · https://mortgage.nationwidelicensingsystem.org/knowle  
X2 verification: Improved — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-11 — Current State**  
Before: VA_COMP_SYNCED_AT = "2026-09-07".  
After: VA_COMP_SYNCED_AT = "2026-09-22 13:07 UTC — VA.gov veteran-rates table (effective Dec 1, 2025, 2.8% COLA) confirmed still current; va.gov is egress-blocked … mirrors … all match". Sources: https://www.va.gov/disability/compensation-rates/veteran-rates/ (reference, unreachable from the sandbox) · https://valoannetwork.com/va-disability-rates/ · https://vetcalc.org/calculators/va-disability-rates/ · https://home.army.mil/rheinland-pfalz/1617/6589/6831/2026_VA_Disability_Rates.pdf · https://www.aaf  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-13 — Stale Content**  
Before: STRAVA_ZONES_SYNC_AT = "2026-09-04".  
After: STRAVA_ZONES_SYNC_AT = "2026-09-22 13:07 UTC — Strava connector direct read (get_athlete_zones), FR2 freshness pass; every value unchanged since the 2026-09-04 read". Evidence: mcp__Strava__get_athlete_zones result 2026-09-22.  
X2 verification: Fixed — deck master carries the 2026-09-22 stamp for this constant; deck 7f67a19 (merge fr2-life)  

**F-FR2-17 — Missing**  
Before: Nine city tables (Temecula, Pechanga, Murrieta, Menifee, San Diego, OC, Riverside, LA, Las Vegas).  
After: Unchanged; comment added at TRAVEL_SYNCED_AT explaining the omission.  
X2 verification: Open — still open: 0 hits for travelChicagoRows on deck master  

**F-FR3-05 — Retired System Reference**  
Before: (already) '... then Lofty for real estate', 'Audit Zoho CRM and Lofty'  
After: unchanged - deliberately left  
X2 verification: Fixed  

**F-FR3-08 — Freshness Stamp**  
Before: DRIFT_CHECKED_AT = "2026-09-22"  
After: unchanged  
X2 verification: Fixed  

**F-FR3-12 — Process**  
Before: Direct page fetches expected  
After: WebSearch + 8 Perplexity calls (max 2 in flight); stamps name the channel  
X2 verification: Open  

**F-FR4-02 — Freshness**  
Before: alert '' for all 7 cities (2026-09-21 08:05 PM PDT)  
After: alert 'Beach Hazards Statement (NWS, until Sep 23 7 PM CDT)' for Chicago; '' elsewhere; DC + NB not positively verified 2026-09-22 — no fresh NWS zone page reachable; the 8:05 PM PT Mac task (open egress) should re-check  
X2 verification: Open  

**F-FR4-03 — Accuracy**  
Before: high/low from wttr.in scheduled refresh (Sep 21)  
After: high/low from API Ninjas point forecast; NWS ranges cited in F-FR4-01  
X2 verification: Improved  

**F-FR4-07 — Accuracy**  
Before: sectors from Benzinga (Sep 18)  
After: sectors from Strategitz with caveat; re-verify from an exchange/AP source on the next market refresh  
X2 verification: Open  

**F-FR4-09 — Consistency**  
Before: add('AI news', feedStampIso('aiNewsList'), 'panel-tools', 2)  
After: unchanged; integrator to re-point to panel-pedefense and consider reading aiNews.asOf  
X2 verification: Improved — deck aa00d3b (panel arg only)  

**F-FR4-11 — Data quality**  
Before: same  
After: unchanged; the daily feed task should write per-article URLs  
X2 verification: Open  

**F-FR5a-04 — Plugin/Integration**  
Before: Not installed  
After: Sandbox: plugin 4.10.0 installs cleanly. Mac: optional; install only if bloat persists after the Karpathy skill, and scope subagent injection  
X2 verification: Open  

**F-FR5a-05 — Plugin/Integration**  
Before: Not installed  
After: Runbook MAC-INSTALL-tooling.md §5; keys by name: one of OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY, optional REPLICATE_API_KEY in backend/.env; never upload documents carrying client PII  
X2 verification: Open  

**F-FR5a-07 — Plugin/Integration**  
Before: No standard way to look for an existing skill before building one  
After: find-skills vendored with provenance + MIT line; npx skills CLI verified at 1.7.0  
X2 verification: Implemented — brain c3c9de3: .claude/skills/find-skills; F-V2-05 flags its -g -y install step  

**F-FR5a-08 — Plugin/Integration**  
Before: No design reference for deck motion and materials  
After: apple-design vendored with provenance + MIT line  
X2 verification: Implemented — brain c3c9de3: .claude/skills/apple-design  

**F-FR5a-09 — Plugin/Integration**  
Before: Not installed  
After: Install commands verified; Mac run pending; recommendations to be packaged as Needs-Steven before applying  
X2 verification: Open  

**F-FR5a-10 — Plugin/Integration**  
Before: Not installed; no pentest of the ISA portal  
After: Install path verified on Python 3.12; run needs STRIX_LLM + LLM_API_KEY (or Strix Cloud login), Docker Desktop, and Steven's authorization of the target  
X2 verification: Escalated  

**F-FR5a-11 — Plugin/Integration**  
Before: Not installed  
After: Runbook MAC-INSTALL-tooling.md §11 with Elena's rules: dedicated Chrome profile or burner account, cookies only in ~/.agent-reach/, read-only, never client data; keys by name TWITTER_AUTH_TOKEN, TWITTER_CT0, Reddit login, optional Exa key  
X2 verification: Escalated  

**F-FR5a-12 — Plugin/Integration**  
Before: Not installed  
After: Optional; commands verified; no keys to read (prompts.chat API key only to save); never improve a prompt containing client detail through its MCP  
X2 verification: Open  

**F-FR5a-13 — Plugin/Integration**  
Before: Not recorded anywhere in the brain  
After: Reference row added; verify the description on the Mac when a SaaS renewal comes up  
X2 verification: Implemented — brain c3c9de3: references/index.md row; MAC-INSTALL-tooling.md §13  

**F-FR5a-15 — Plugin/Integration**  
Before: Unknown tool on Steven's list  
After: Do not install: relaxing SIP/AMFI on the Mac that holds the keychain, CRM keys and client files is a security regression (Elena); no Health use  
X2 verification: Escalated  

**F-FR5a-16 — Plugin/Integration**  
Before: Unknown tool on Steven's list  
After: Do not install; if ever reconsidered, free tier only and never with a wallet or STRIPE_SECRET_KEY / AGENT402_CREDITS_KEY on the Mac  
X2 verification: Escalated  

**F-FR5a-17 — Plugin/Integration**  
Before: Unknown tool on Steven's list  
After: Sandbox: pip install laya exit 0 -> laya 0.3.5, torch 2.14.0+cu130, transformers 5.17.0, import ok; no checkpoint downloaded; Linux pulled ~9 GB of CUDA wheels (a Mac gets the smaller CPU/MPS build). Mac: not recommended now; runbook MAC-INSTALL-tooling.md §17  
X2 verification: Open  

**F-FR5b-02 — Plugin/Integration**  
Before: Install instructions would have used the Mac's default python3 (3.9) or 3.11 and failed at first run.  
After: Install pinned to Python 3.12 via uv in MAC-INSTALL-comms-data.md §1.  
X2 verification: Documented  

**F-FR5b-04 — Stale Content**  
Before: Row added; contradictory paragraph remains.  
After: Paragraph to be reworded by the panel-vanessa owner in the same edit that flips the row to live.  
X2 verification: Fixed — F-M4-01 via deck eaa2292 (merge m4-vanessa)  

**F-FR5b-07 — Plugin/Integration**  
Before: Would have documented env vars OmniRoute ignores.  
After: README and MAC-INSTALL-comms-data.md §2 name the real path.  
X2 verification: Documented  

**F-FR5b-08 — Current State**  
Before: —  
After: Unreachable list recorded in MAC-INSTALL-comms-data.md; no limits or prices invented.  
X2 verification: Documented  

**F-FR5b-09 — Plugin/Integration**  
Before: —  
After: Install command, offline-verified example and the terms gate in MAC-INSTALL-comms-data.md §3.  
X2 verification: Implemented — brain c3c9de3: MAC-INSTALL-comms-data.md §3  

**F-FR5b-10 — Plugin/Integration**  
Before: A 3.11 install would fail at import with no obvious cause.  
After: Install pinned to Python >=3.12 + playwright install, LLM = local ollama/llama3.1:8b (Jarvis).  
X2 verification: Documented  

**F-FR5b-13 — Plugin/Integration**  
Before: —  
After: 'Alternative source' section added to integrations/apple-health-dashboard.md; the skill untouched.  
X2 verification: Documented  

**F-FR5b-14 — Bug**  
Before: missingIds: vanessaMicBtn, steveMicBtn (baseline)  
After: unchanged by this edit; flagged.  
X2 verification: Open — still open: harness after the W1 merge (14:43 UTC) reports missing ids 2 [vanessaMicBtn, steveMicBtn]; deck master line 25136-25137 still looks them up  

**F-FR5b-15 — Plugin/Integration**  
Before: —  
After: Documented as evaluated/rejected in MAC-INSTALL-comms-data.md §1.  
X2 verification: Documented  

**F-L1-06 — Continuous-improvement log (dated audit record)**  
Evidence: Post-edit line 19141, inside CI_LOG_DEFAULT.  
Fix: Left in place per the FUB-POLICY ruling on dated audit records - rewriting it would falsify an audit trail. It IS rendered on the deck, so Steven will still see the words 'Follow Up Boss' there. Offer to purge it on his word.  
X2 verification: Fixed — deck 4902159 removed the vendor name from the dated 2026-09-07 CI-log entry; fact, date and count kept  

**F-L1-07 — ISA KPI scorecard - provenance of a dated figure**  
Evidence: Branch-point line 14984 -> post-edit line 14897.  
Fix: Re-worded to 'These figures predate Lofty becoming the real-estate system of record on 2026-09-22 - they are not Lofty figures, and nothing has measured the ISA since.' Keeps the honest warning that they are not Lofty data without naming the old CRM and without relabelling anything. Judgment call: this is a dated figure, not a dated audit record, so the policy's 'live prose' rule applied.  
X2 verification: Fixed — isaKpi source note re-worded (deck master)  

**F-L1-08 — Google Calendar directory**  
Evidence: Branch-point line 16692 -> post-edit line 16605.  
Fix: Relabelled 'Legacy CRM calendar (appointments & tasks)' with the note 'a legacy calendar created by the real-estate CRM that Lofty replaced on 2026-09-22; it returned no events on the last sync'. The calendar's actual Google id is unchanged - it is the real address the link resolves to. Renaming the calendar in Google itself is an account change and was not attempted.  
X2 verification: Fixed — deck label 'Legacy CRM calendar'; the calendar's Google id unchanged  

**F-L1-09 — Embedded assets**  
Evidence: 34 of the 47 remaining regex matches live inside those 22 payloads.  
Fix: No blind replace was run. Every edit was an asserted exact-string match. All 22 payloads verified byte-identical after the edit: combined sha256 faa6a45edbdae457bdc949e248541c1c667193e66d73420733306a6b61e6d240, 1,716,832 bytes, unchanged.  
X2 verification: Documented — 22 base64 payloads byte-identical (sha256 recorded)  

**F-L1-10 — Verification**  
Evidence: runtime-harness: PASS, 0 exceptions, 0 safeRun failures, 0 shape warnings, 336 containers (338 at branch point), missing ids 2 (vanessaMicBtn, steveMicBtn - unchanged). Lofty card exercised on all three branches (no doc / status ok / status not-configured) - PASS each time. 6/6 harness self-tests pass. 46 prose edits + 2 block removals, all asserted.  
Fix: No follow-up needed. 47 regex matches remain: 34 in base64, 13 accounted for individually (1 dated CI-log entry, 2 fub-followups skill-name mentions, 10 saved-state identifiers).  
X2 verification: Documented — harness PASS 336 containers; 47 residual regex hits accounted for  

**F-L2-05 — element id rename**  
Evidence: Pre-edit grep for 'fubKeyNumbers' returned 1 hit (line 535, the attribute). Post-edit element-id inventory diff shows only the five fub* ids gone and leadIntakeNumbers added; no other id changed. missingIds remains 0.  
Fix: Renamed; the row was also narrowed from 2 columns to 1 because it now holds a single stat.  
X2 verification: Fixed — portal master: leadIntakeNumbers (1 hit)  

**F-L2-07 — removed FUB-only row**  
Evidence: That address was the only email address in the entire file; the file now contains zero email-address literals. Rendered replacement reads: 'Lead-forwarding address - not connected yet. This portal has no Lofty lead-forwarding address on file and cannot look one up: the Lofty API key is not installed...'  
Fix: Stat removed, honest src-note added in the same card. The card is not left empty - the calling-number stat remains.  
X2 verification: Fixed — portal master: 0 email-address literals  

**F-L2-08 — unverifiable live fact kept with a warning**  
Evidence: Rendered: 'Calling number on file - the lead-facing line ... Added Sep 8, 2026 as Steven's lead-facing calling line - the number leads see, ringing both the CRM and him. Whether it now routes through Lofty is not something this page can verify. Ask Steven on the ISA line before you use it for a lead call or text, and never a personal cell either way.'  
Fix: Copy de-FUBbed, warning kept. Needs Steven to confirm where this number actually rings today.  
X2 verification: Open — the lead-facing line's routing cannot be verified from the page (same question as F-E12-04 / F-L3-12)  

**F-L2-09 — base64 / false-positive check**  
Evidence: grep for 'base64' returns 0 hits; the five lines over 2,000 characters are 3150, 3151, 3240, 3806 and 3862, all readable text. No blind global replace was run - every edit was an asserted exact-match on a unique string or line range, and the script aborts if any anchor matches a different number of times than expected.  
Fix: No action needed; recorded so the coordinator does not have to re-check.  
X2 verification: Documented  

**F-L2-10 — self-inflicted defect, caught and fixed**  
Evidence: Harness run 2 failed to parse at isa-portal.html:2136 before any verdict was produced. Rewritten without the apostrophe ('will not borrow numbers from another CRM to look populated'); the inline script now parses and the harness returns PASS with 0 exceptions.  
Fix: Fixed and re-verified. Recorded because it is the reason the harness was run more than once on this branch.  
X2 verification: Fixed — inline script parses; harness PASS  

**F-L3-08 — Research citations**  
Evidence: docs/data/caio-brief.json:48,626-628,637-638,642-643,662,963,1308,1685. The key `caioBrief` is referenced only by docs/inventory/loopLog.json — no panel in this repo renders it.  
Fix: Left untouched. If Steven wants it gone, the honest move is to drop those evidence rows entirely rather than rewrite the source titles; the brief's conclusions already stand without them.  
X2 verification: Open — docs/data/caio-brief.json citation titles/URLs left; drop the evidence rows or leave  

**F-L3-09 — False positive — do not touch**  
Evidence: docs/inventory/cloud-routines.md:31.  
Fix: Not touched, and must never be. Same class as the base64 blobs in the deck: match on real prose only, never a blind global replace.  
X2 verification: Documented — trig_01LC6fUbVyaEF1nEFdGcQjU8 is a routine id — never touch  

**F-L3-14 — Other engineers' files**  
Evidence: Zero hits in all five under `follow[ ._-]?up[ ._-]?boss|\bFUB\b|fub[A-Za-z_]|followupboss`; MAC-INSTALL.md:118, REMOTE-ACCESS.md:82, docs/SECOND-MAC-SETUP.md:119 already carry the correct Lofty key path.  
Fix: Nothing to hand over. Not edited.  
X2 verification: Documented  

**F-M1-07 — deck/observability**  
Evidence: Mac tasks write the store through Claude Code tool calls, not through the deck page; nothing in the write path carries a browser deviceId.  
Fix: Documented in the code comment at DEV_MAC_FED_KEYS and in the card's own source note, so the marker is never read as authoritative. The honest cross-check remains the freshness board, which reads each document's own stamp.  
X2 verification: Documented — deck master: DEV_MAC_FED_KEYS comment (2 refs)  

**F-M1-08 — test/coverage**  
Evidence: tests/dom-shim.js uses the real Date.now() and schedules timers without a fake clock (win.setTimeout -> schedule(fn, ms)). Harness duration 1156 ms against a 2500 ms settle gate.  
Fix: Added a 31-assertion unit test at scratchpad/m1-roster-unit.js that loads the roster block in a vm with stubbed lsGet/lsSet/$/safeRun and drives the throttle, the prune, the rename, the amber rule, the re-entrancy cycle and seven malformed-document shapes. All pass. The harness still covers the page-level guarantee (0 exceptions, 338 containers) under every malformed input.  
X2 verification: Documented — scratchpad/m1-roster-unit.js (31 assertions) — NOT in the deck repo tests/ directory  

**F-M1-09 — docs/second-mac**  
Evidence: runnerStatus (syncedAt 2026-09-22T04:05:04Z) carries 59 task entries; toolkitSnapshot (syncedAt 2026-09-22T13:15:45Z) reports counts.tasks = 60; always-on/README.md says 60.  
Fix: docs/SECOND-MAC-SETUP.md names both numbers and says to reconcile against the runner on Mac #1 rather than against either document. Not resolved here: the discrepancy needs a look at the runner itself, which is on the Mac.  
X2 verification: Open — docs/SECOND-MAC-SETUP.md step 11 names both numbers (59 vs 60); only the runner on Mac #1 can settle it  

**F-M2-07 — command-deck.html — execSyncRegistry() panel attributions (lines ~21571 and ~21578)**  
Evidence: Section-boundary scan of command-deck.html: panel-personalaccounts spans lines 3090–3265 and contains all four top-performer tbodies; panel-news spans 1515–1575 and contains the Chicago Bears card; panel-quantvue spans 1609–1979 and panel-brief 1406–1512, neither of which contains them.  
Fix: Reported, not changed — the ledger belongs to the freshness engineers' region, not the stamp map. I used the true section boundaries (not the ledger) when deciding which panel each re-sourced card sits in, so the scopes in PANEL_VERIFIED_AT are unaffected: the Top performers work counts toward panel-personalaccounts and the Bears work toward panel-news.  
X2 verification: Fixed — F-W1-06/07: Top performers → panel-personalaccounts, Bears → panel-news — deck master (merge aa00d3b)  

**F-M2-08 — command-deck.html — PANEL_VERIFIED_AT coverage**  
Evidence: FR2-report.md constants table, PEDEFENSE_SYNCED_AT row: 'Added AEVEX–BlackSea (≤$650M, closing Sep), NP Aerospace–Iten (closed Sep 10), Lockheed JATM production deal, Crunchbase $14.6B YTD stat; updated Medallia … and Anduril …'. peMovesRows (line 5778) and defenseDisruptorRows (line 5799) are both inside panel-pedefense (5757–5833).  
Fix: Not added. The brief scoped me to the 33 existing entries, and all seven of these panels are kind 'you'/'live'/'synced' or absent from the registry, so an entry would be inert today (see F-M2-02). Flagged for the integrator to add if panel kinds change.  
X2 verification: Documented — F-W1-01 ruled that entries for non-ref panels are inert and must not be added with borrowed dates; panel-tools recorded as a named gap (F-W1-11)  

**F-M2-09 — command-deck.html — over-claim sweep (strings asserting verification or freshness)**  
Evidence: Greps recorded in the run: 'up to date|up-to-date' 0 hits; '[Aa]ll .{0,20}fresh' 0 hits; per-row provenance at line 9085 ('var prov = r.live ? badge green Live : badge gray Seed') and line 9131; line 1430 freshness card copy; line 10725 'No Plaid API keys are on file … checked 2026-09-22'.  
Fix: Two fixed, the rest left alone as correct. Two borderline items left deliberately: CI_LOG_DEFAULT's dated 2026-09-07 entries say 'Verified end to end: the first message (Steven → ISA) was carried into the ISA Portal's store' and 'verified by hand today against va.gov'. Both are narrow, specific claims inside a changelog whose entries carry their own date, so 'today' reads as the entry's date; neither asserts anything about the present. FR2 independently re-confirmed the VA.gov figures on 2026-09  
X2 verification: Documented — over-claim sweep; two fixed (F-M2-01, F-M2-06)  

**F-M2-10 — command-deck.html — tests**  
Evidence: node tests/runtime-harness.js wt-m2-stamps/command-deck.html → verdict PASS · top level ran to completion · 0 exceptions · 0 safeRun failures · 0 shape warnings · 337 containers · missing ids 2 [vanessaMicBtn, steveMicBtn] (same as baseline, outside this region). node --check on the extracted inline script: OK. Malformed-injection run (bare string, object with no at, object with at but no scope): top level completed, 0 exceptions, 0 safeRun failures, 0 shape warnings, 337 containers; badges read  
Fix: No fix needed — this row records the test result. Container count was required to stay at 337 and did; the two missing ids are the pre-existing baseline pair and are outside this region.  
X2 verification: Documented — harness PASS, 337 containers on the m2 branch  

**F-M3-01 — Build/Release — MAC-SETUP.sh**  
Evidence: bash -n clean; shellcheck 0.11.0.1 clean on both scripts; `./MAC-SETUP.sh --dry-run` ran end to end in the sandbox and printed every command; a real run under HOME=/tmp/m3-home installed headroom-ai 0.38.0, whatsapp-cli 1.0.0 on CPython 3.12.11, scrapling 0.4.15 with working fetchers, the scrapers venv, the omniroute .env skeleton and both failover scripts, exit 0; a second identical run reported INSTALLED: none.  
Fix: Steven runs `./MAC-SETUP.sh --dry-run` first, reads it, then `./MAC-SETUP.sh`. Linked from MAC-INSTALL.md §9.  
X2 verification: Implemented — brain d64ff61: MAC-SETUP.sh (now 24 steps after V1's additions in 525e653); linked from MAC-INSTALL.md  

**F-M3-13 — PATH — npm globals and ~/.local/bin**  
Evidence: First sandbox re-run re-ran `npm install -g codeburn` because the npm-global bin was not on PATH; after the fix the second run of the same steps reported 'already present codeburn 0.9.25 / omniroute 3.8.50'.  
Fix: Steven adds ~/.local/bin to ~/.zprofile himself if the installer reports it missing.  
X2 verification: Fixed — both scripts look in ~/.local/bin and npm root -g; 'installed but not on PATH' reported as NEEDS-STEVEN  

**F-M4-14 — execSyncRegistry source comment, line 21536 (weather/news feed registry)**  
Evidence: docs/CLOUD-WRITE-ARCHITECTURE.md.  
Fix: Comment now records that the ruling-out rested on a belief disproved 2026-09-22, and that a cloud writer is an option for these feeds again. No code changed.  
X2 verification: Fixed — deck master ee42e30: 0 hits for 'cannot write to this deck'; 'parks on a permission prompt' survives only inside the two sentences saying it was disproved; deck eaa2292 (merge m4-vanessa)  

**F-M4-23 — renderAiNews, line 22224 (now 22225)**  
Evidence: wireLiveAiNews at 22227-22231 overwrites it synchronously; You.com retired 2026-09-22 and the in-page search connector was removed 2026-09-11 (lines 4535, 25019).  
Fix: Changed to 'Reading the stored AI-news feed...'. No logic changed.  
X2 verification: Fixed — deck master: 'Reading the stored AI-news feed' (1 hit); deck eaa2292 (merge m4-vanessa)  

**F-M4-26 — LEFT ALONE - CI_LOG_DEFAULT entries, lines 19105-19115, and the same narrative inside the cdStateSeed JSON at line 6957**  
Evidence: They are dated 2026-09-07 through 2026-09-11 and are a log of what was found and believed on those dates. Rewriting them would falsify the record, and the cdStateSeed copy is seeded document data, not prose.  
Fix: NOT CHANGED, deliberately. If the log should carry the correction, it belongs as a NEW dated 2026-09-22 entry written by whoever owns the CI log - not as an edit to the old ones.  
X2 verification: Documented — dated CI-log entries deliberately left; a 2026-09-22 correction entry belongs to the ciLog owner  

**F-M4-28 — FLAGGED, NOT CHANGED - renderHealthCoaching broken-pipeline nudge, line 16099**  
Evidence: Lines 3562 and 3571 describe the Notion route; line 3569 confirms the watcher is down. Whether healthCoaching.freshness.pipeline will still be written as 'broken' once the Notion path runs cannot be determined from this file.  
Fix: NOT CHANGED. Re-check after the first phone run lands.  
X2 verification: Open  

**F-M5-10 — Routine spec drift**  
Evidence: routines/backup-watchdog-cloud.md 'Expected first result (honest baseline, 2026-09-22)'; backupStatus now reads lastBackup 2026-09-22, verified true, consecutiveFailures 0, weeksKept 1. The watchdog itself (trig_01PhgrwpwaQ9vLvFxQPrPJ6W, cron '30 17 * * 0') has never run; first firing Sun 2026-09-27 17:35Z.  
Fix: Update that block to the 2026-09-22 baseline. NOT changed by M5 - it is another engineer's routine spec and outside the wrapper defect; flagged rather than edited to avoid clashing with in-flight work.  
X2 verification: Open — routines/backup-watchdog-cloud.md line 75 still expects lastBackup 2026-09-14  

**F-M6-04 — Notion Health Log schema / Source options**  
Evidence: notion-fetch schema -> Source.options = [claude-ios (blue), health-auto-export (gray), manual (yellow)]; "VO2 Max".description = 'mL/min/kg, latest reading'.  
Fix: Both corrected to match the real database in integrations/apple-health-dashboard.md and the skill. The sync does not filter on Source; it is recorded as provenance only.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-08 — appleHealth / history range stated imprecisely**  
Evidence: Union of day keys across all `daily` metrics: 2026-09-06 .. 2026-09-12 (7 days); dailyDays = 7; meta.last_received = '2026-09-13 14:30:40.789561'.  
Fix: Both files now say `daily` days 2026-09-06 -> 2026-09-12, with meta.last_received 2026-09-13 called out separately. The §3 acceptance check tests for the Sep 6-12 days specifically.  
X2 verification: Fixed — brain a389666: integrations/mac-task-specs.md §3 + .claude/skills/apple-health-notion/SKILL.md + integrations/apple-health-dashboard.md  

**F-M6-11 — health-notion-sync / freshness watch**  
Evidence: Registration checklist item 2 listed watch rows for loftyLeads and zohoSync only. Cron 45 7,21 * * * gives gaps of 14 h and 10 h.  
Fix: Added {doc:'healthNotionSync', label:'Apple Health via Notion', task:'health-notion-sync', hrs:16} to §3 and to the registration checklist, with the 14 h / 16 h arithmetic shown so the next editor does not 'tidy' it back to 14.  
X2 verification: Fixed — specs lines 94 and 350: OUTPUT_WATCH healthNotionSync hrs:16 with the 14 h/16 h arithmetic  

**F-M6-12 — deck / 'via' badge label**  
Evidence: Engagement brief records the via badge now labelling notion-health-log and scheduled-sync properly; the deck HTML is a published artifact, not a file in this repo, and was not edited by me.  
Fix: Paragraph rewritten to record that the labels were added on 2026-09-22 and that both values now render as themselves, keeping the standing rule that the doc key is not to be renamed to game the badge, and noting that any future `via` value needs its own label or falls back to 'Claude session'.  
X2 verification: Fixed — specs paragraph rewritten; deck 88beda7 added the notion-health-log and scheduled-sync labels  

**F-M6-13 — Command Deck DB / stravaSnapshot wrapper**  
Evidence: ArtifactData get state/stravaSnapshot (version 9) -> top-level keys ['v'], type of v = dict.  
Fix: No change to the document (I make no DB writes). The `{v: ...}` wrapper is now stated explicitly, with a worked example, in both integrations/mac-task-specs.md §3 and the skill, citing the stravaSnapshot bare-value bug as the reason.  
X2 verification: Documented — stravaSnapshot v9 read wrapped; contract now stated in specs and skill  

**F-S1-12 — command-deck/document-shape**  
Evidence: ArtifactData get, 2026-09-22. The deck HTML contained zero references to cliAnythingStatus before this change.  
Fix: Designed for its absence, and extended the shape already specified in the skill rather than inventing a parallel document: added connState (the deck's five-value vocabulary), verbsEnabled, verbsDisabled, lastCheckedAt, eccReviewedAt and action to each wrapper entry, keeping the existing checkedAt/installed/hubVersion/wrappers/name/target/mode/status/readOnly/lastRun/error/note fields untouched. I did not write the document — writing to the artifact DB is out of scope for this task.  
X2 verification: Implemented — shape extended in the skill; cliAnythingStatus ABSENT in the 14:37 export (expected until the Mac task runs)  

**F-S1-16 — repo-convention**  
Evidence: wc -l across .claude/skills/*/SKILL.md.  
Fix: Accepted and declared rather than fixed by cutting. The scope doubled from three targets to six, and the brief required each disabled write verb to carry its blast radius so the approval decision is informed rather than blind — that table alone is 23 rows. I trimmed the Alternative-executor section to claw back a line; further cuts would have to remove either a target or a blast radius, and neither is the right trade.  
X2 verification: Documented — 207-line skill accepted and declared  

**F-S1-17 — credential-location/consistency**  
Evidence: command-deck.html SH_INTEGRATIONS (unchanged) vs the credentials section of .claude/skills/cli-anything-connectors/SKILL.md.  
Fix: Reconcile on one location before either path is built. I did not change the existing deck row: it belongs to the showing-sync task's own design, not to the CLI-Anything path, and editing it would change behaviour another owner may depend on. No secret exists in either location today, so this is cheap to fix now and expensive later.  
X2 verification: Fixed — reconciled on ~/.config/cli-anything/.env by F-W2-11 (CONNECTIONS.md rule 5 + skill, brain 2cb4ae6); the last dissenting carrier — the deck's SH_INTEGRATIONS row — fixed in deck ee42e30  

**F-V1-11 — REFUSED list — reviewed, unchanged**  
Evidence: REFUSED_LIST and REFUSED_GUARDS in MAC-SETUP.sh unchanged by this session; --only vphone-cli still exits 2 with its reason; the new higgsfield step references the refused repo in no executed command.  
Fix: None. Recorded so the next reconciliation does not re-open them.  
X2 verification: Documented — seven refusals stand  

**F-V2-01 — vendored skills**  
Evidence: PyYAML parse of each SKILL.md frontmatter: 9/9 parse=OK, name_match=True, desc_nonempty=True. Independently corroborated by this session's own available-skills listing, which reproduces all nine descriptions verbatim (the harness lists a skill only if its frontmatter parsed). End-to-end load proved by invoking `karpathy-coding-principles` via the Skill tool: body returned intact, including its provenance note.  
Fix: None needed.  
X2 verification: Documented — nine skills load (PyYAML + Skill-tool invocation)  

**F-V2-03 — vendored skills**  
Evidence: Extracted the 15 distinct `#anchor` targets from SKILL.md and slugified every heading in hardening-patterns.md; `comm -23` of referenced-vs-present returned empty.  
Fix: None needed.  
X2 verification: Documented  

**F-V2-04 — injection surface**  
Evidence: apple-design/SKILL.md:12 and :16.  
Fix: Leave the upstream text intact, but consider a one-line local note under the provenance header saying the gag applies only to a bare invocation. Low priority; no action taken (out of scope for a reference fix).  
X2 verification: Recommended — apple-design gag idiom; local note not added  

**F-V2-06 — injection surface**  
Evidence: grep over all nine for ignore-previous / disregard / MUST USE / always-use / override / regardless-of / do-not-tell-the-user / bypass / expand-scope / exfiltrate / pipe-to-shell / base64 -d returned only source-driven-development/SKILL.md:112,116 (instructing the agent to REJECT injected directives in fetched docs) and security-and-hardening/SKILL.md:51,162,199 (OWASP LLM01 guidance). Network/exec scan found no shell-exec instructions outside find-skills (F-V2-05) and inert `npm install` / `npx   
Fix: None needed.  
X2 verification: Documented — injection scan clean  

**F-V2-16 — omniroute failover**  
Evidence: claude-auto.sh:38-39 with :11 `set -u`. Executed: `claude-auto --task` -> 'claude-auto.sh: line 38: $2: unbound variable', exit 1; `claude-auto --force` -> same at line 39. Fails closed. Contrast :56, which does emit a proper usage message for a bad --force VALUE.  
Fix: Guard with `[ $# -ge 2 ] || { echo usage >&2; exit 64; }` before consuming $2.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-17 — omniroute failover**  
Evidence: claude-auto.sh:62; README.md:104 ('Copy claude-auto.sh and probe.sh to ~/.local/bin/') and :105 (EnvironmentVariables.PATH includes $HOME/.npm-global/bin, /opt/homebrew/bin, /usr/local/bin). Combined with F-V2-11, a missing probe.sh is indistinguishable from an inconclusive probe.  
Fix: Resolve the script directory through a realpath/symlink-resolving idiom, and log when the probe binary cannot be found instead of discarding the error.  
X2 verification: Open — reproduced by execution in brain aa3b734's session; no fix committed — do not point the runner at claude-auto until fixed  

**F-V2-19 — omniroute failover**  
Evidence: (1) claude-auto.sh:83 `unset ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN` before exec, and probe.sh:31 `env -u ANTHROPIC_BASE_URL -u ANTHROPIC_AUTH_TOKEN -u ANTHROPIC_API_KEY`; no credential is echoed or logged anywhere in either script (the log lines carry route, model, task, pii and headless only). (2) Ran probe.sh's exact command against the real CLI (claude 2.1.278): it returned JSON containing `"is_error":false`, and probe.sh:34's regex `"is_error": ?false` matched it — the optional-space for  
Fix: None needed. Recorded so the working parts are not re-litigated.  
X2 verification: Documented — three failover properties confirmed correct  

**F-V2-22 — unsupported claims**  
Evidence: Checked against the live registries with no installs: PyPI headroom-ai 0.38.0, graphifyy 0.9.65, scrapling 0.4.15, scrapegraphai 2.2.4, strix-agent 1.6.2, laya 0.3.5 — all six claimed versions exist and are in fact the current latest. npm omniroute 3.8.50, codeburn 0.9.25, prompts.chat 0.1.1, agent402-mcp 0.13.3 — all four exist. `claude --version` -> 2.1.278, exactly as MAC-INSTALL-tooling.md:85 claims. MAC-INSTALL-tooling.md:20's '6 vendored' for addyosmani and :28's karpathy entry both match   
Fix: None needed.  
X2 verification: Documented — 10-of-10 version/provenance claims hold  

**F-V2-23 — unsupported claims**  
Evidence: integrations/CONNECTIONS.md:42. github.com HTML is blocked by this sandbox's egress proxy for all repositories (a known-good control URL also returned 403), so even indirect corroboration was unavailable.  
Fix: Mark it '(unverified from the cloud sandbox — confirm on the Mac with mac-verify.sh)'. Do not delete the claim.  
X2 verification: Recommended — label the Orca 'Installed on the Mac' claim as unverified from the cloud  

**F-V2-29 — mac-verify.sh (for V1)**  
Evidence: mac-verify.sh:182 `grep -q "^[[:space:]]*${_n}=[^[:space:]]"`. Executed with NVIDIA_API_KEY set to the literal string 'changeme': 'ok      NVIDIA_API_KEY             set'. The genuinely-empty case is handled correctly ('no value yet').  
Fix: For V1: also treat obvious placeholders (changeme, xxx, TODO, <...>, the skeleton's own default) as `need`. Do not print the value when doing so.  
X2 verification: Open — reproduced by execution against a broken throwaway HOME; not fixed  

**F-V2-30 — mac-verify.sh (for V1)**  
Evidence: Ran the script against a throwaway HOME seeded with: no tools installed, a 644 .env containing distinctive canary values, an empty key, a placeholder key, a tampered claude-auto, a stranded route mode and a broken graphify. Result: 'ok 19  FAIL 7  NEEDS-STEVEN 5  info 6', exit 1. Grep of the full output for the canary values and for 'changeme' returned nothing — names and 'set' only. Wrong mode surfaced as 'FAIL  omniroute/.env  mode 644 — must be 600 (chmod 600 ...)'. Missing tools surfaced as   
Fix: None needed. The four gaps above (F-V2-24..29) are additions to a sound script, not a rewrite.  
X2 verification: Documented — what mac-verify.sh gets right  

**F-W1-09 — execSyncRegistry() freshness board — full sweep**  
Evidence: Verified correct by line range: Weather->panel-brief, News->panel-news, On This Day->panel-brief (#onThisDaySyncNote), QuantVue strategy->panel-quantvue (#strategySyncNote), Econoday->panel-quantvue, Mortgage rates->panel-property (#mortgageRatesSyncNote), Local market->panel-property (#marketUpdateSyncNote), Loan program facts->panel-property, Lofty CRM import->panel-property (#loftyCrmCard L2465), Builder incentives->panel-property, Strava->panel-wellness, Google Calendar->panel-appointments (  
Fix: None needed beyond F-W1-06/07/08.  
X2 verification: Documented — 28-row board sweep; exactly three wrong rows, all fixed  

**F-W1-11 — PANEL_VERIFIED_AT coverage gap (NOT FIXED, by design)**  
Evidence: Baseline and after dump both: '#panel-tools .panel-stamp [panel-stamp] "Reference"'. panel-tools is one of only three kind:'ref' panels and the only one with no map entry.  
Fix: NOT APPLIED, deliberately. Adding an entry means asserting a verification date, which is a FACT — and I did not review panel-tools' content, so any date I wrote would be fabricated. Copying 2026-09-22 from its neighbours would be precisely the over-claim the map exists to prevent. Recorded as a named known gap in the map's header comment for the next freshness audit, which must supply a real date from someone who actually checked it.  
X2 verification: Recommended — named gap in the map's header comment; no date fabricated  

**F-W1-12 — Freshness board jump links (PRE-EXISTING, NOT FIXED)**  
Evidence: grep for hashchange | location.hash | gotoPanel | jumpToPanel | revealPanel returns no hits. Row renderer at L21147. Tab arithmetic: 28 rows, 5 same-tab (daily), 23 cross-tab.  
Fix: NOT APPLIED — out of scope and pre-existing, affecting ~23 rows independently of my change. Note this does not argue against F-W1-06/07/08: pointing a link at the panel that actually contains the card is correct regardless, and cross-tab rows were already the overwhelming norm. Recommended follow-up: intercept clicks on the board's panel anchors, call switchPage(panel.dataset.page) first, then scroll — which would also make the pre-existing 23 work.  
X2 verification: Recommended — pre-existing: board jump links do not switch tabs (23 of 28 rows cross-tab)  

**F-W2-11 — Credential location / Showami**  
Evidence: MAC-SETUP.sh calls 'ensure_env_file cli-anything' which creates $HOME/.config/<tool>/.env and seeds SHOWAMI_USER and SHOWAMI_PASS; mac-verify.sh:191 checks $HOME/.config/cli-anything/.env for HOMES_USER, SHOWINGTIME_USER and SHOWAMI_USER; .claude/skills/cli-anything-connectors/SKILL.md already named the same path. The competing '~/.config/showing-sync/.env' is asserted only on the deck's SH_INTEGRATIONS row (F-S1-17) - nothing in the repo creates or reads it. Code beats prose, and three of four   
Fix: APPLIED. integrations/CONNECTIONS.md rule 5 now carries the decision, the rule 'one location per secret, named after the tool that reads it', and the explicit statement that the showing-sync path is superseded. .claude/skills/cli-anything-connectors/SKILL.md gains a matching line. NOT APPLIED and cannot be by an agent: the deck's SH_INTEGRATIONS row itself lives in command-deck.html, which is not in this repo and is on the do-not-edit list - it remains the one dissenting carrier and is Steven's   
X2 verification: Fixed — integrations/CONNECTIONS.md rule 5 + cli-anything-connectors SKILL.md (brain 2cb4ae6); deck SH_INTEGRATIONS row fixed in deck ee42e30 — no dissenting carrier remains  

**F-W2-12 — integrations/CONNECTIONS.md line 16**  
Evidence: Line 16 now reads 'Not installed on the Mac, but no longer manual ... (MAC-SETUP.sh --only cli-anything). The earlier claim that the install is interactive was wrong (F-S1-18)' with generation named as the only interactive step. But MAC-SETUP.sh itself raises needs_steven: 'Put export CLI_HUB_NO_ANALYTICS=1 in your shell profile AND in the cli-anything runner task's env - this script only covers its own run.' That requirement appeared nowhere in the row.  
Fix: APPLIED, surgically - the env-var requirement added to the row's action cell, the other engineer's corrected wording left intact rather than rewritten, to avoid clashing with in-flight work. MAC-SETUP.sh was read, never edited, per instruction.  
X2 verification: Fixed — integrations/CONNECTIONS.md line 16 now carries the CLI_HUB_NO_ANALYTICS=1 requirement (grep 1 hit)  

**F-W2-13 — always-on register / new cloud writer**  
Evidence: Live trigger list: 'Command Deck - Feed freshness watchdog (cloud writer, daily 16:12 UTC)', cron '12 16 * * *', last_run NEVER. A full 173-document listing of collection 'state' taken 2026-09-22 ~14:20 UTC contains no feedFreshness document. First firing 2026-09-22T16:12Z.  
Fix: APPLIED - added to the cloud-writers table in always-on/README.md as unproven, with the reason it exists (r9-feed-freshness-sweep never ran and five feeds rotted unnoticed) and the instruction to check for the feedFreshness document after 16:12Z rather than the routine's status.  
X2 verification: Documented — always-on/README.md cloud-writers table; feedFreshness ABSENT in the 14:37 export  

**F-X2-08 — duplicate work / program facts**  
Evidence: findings-FR1.json F-FR1-03 after-text vs findings-FR3.json F-FR3-01 after-text; projects/isa-portal.md drift rule (counts only).  
Fix: Make the deck the source of truth for PROGRAM_FACTS and have the portal copy it, or extend the drift check to a text hash of the two arrays.  
X2 verification: Recommended  

**F-X2-11 — unrecorded DB write**  
Evidence: findings-M5.json F-M5-03; scratchpad/all/state/marketingQueue.json top-level keys ['v'].  
Fix: Whoever made the write should add the row to ciLog ({date,text}); going forward every store write by a session leaves a ciLog row, as the cloud writers already do.  
X2 verification: Recommended  

**F-X2-13 — stale cross-claim / F-E8-64**  
Evidence: findings-E8.json F-E8-64; findings-W2.json F-W2-07 timing table.  
Fix: Done: F-E8-64 annotated; it stays Open as one of the four http_api routines only Steven can edit.  
X2 verification: Fixed  

**F-X2-14 — stale cross-claim / F-M1-10 and F-M4-24/25**  
Evidence: deck master ee42e30: 'research-only by design' only in the retiring sentence; line 8538 carries FR2's text; line 6643 carries M4's wording.  
Fix: Done: rows cross-referenced and marked Fixed with the id of the fix.  
X2 verification: Fixed  

**F-X2-16 — count check / dated FUB references**  
Evidence: grep -r -c -i -E 'follow[ ._-]?up[ ._-]?boss|\bFUB\b|fub[A-Za-z_]|followupboss' over docs/ (per-file list in X2's hand-back).  
Fix: None needed; the purge-or-leave decision is Steven's (NEEDS-STEVEN). If purged, regenerate the set together, never row by row (F-L3-04).  
X2 verification: Documented  

**F-X2-17 — process / unrecorded routine creation**  
Evidence: docs/inventory/cloud-routines.md (50 rows); always-on/README.md cloud-writers table (trig_01JcPh3AM2z21Bsv34SvSkqM, trig_01M5zR1Po44gnHvTwA9ogZaB, trig_01J9xuWgAuUCHATtpLivDkgp, trig_01PhgrwpwaQ9vLvFxQPrPJ6W, feed-freshness watchdog).  
Fix: Re-pull the routine listing into docs/inventory/cloud-routines.md and add one row per created routine to the next findings file (id, created_via, verified-by-output plan).  
X2 verification: Recommended  

**F-X2-18 — disagreement / AI-news freshness stamp source**  
Evidence: findings-FR4.json F-FR4-09; findings-W1.json F-W1-08; scratchpad/all/state/aiNews.json keys ['asOf','items'].  
Fix: None; the panel half is fixed (deck aa00d3b). If the daily feed task ever writes a parseable syncedAt into aiNews, revisit.  
X2 verification: Documented  

### By category (2026-09-22 rows)

- Plugin/Integration: 27
- Stale Content: 19
- omniroute failover: 13
- freshness: 10
- mac-verify.sh (for V1): 7
- Freshness: 6
- unsupported claims: 4
- Bug: 3
- Current State: 3
- vendored skills: 3
- injection surface: 3
- execSyncRegistry() freshness board: 3
- deck/sync: 2
- ops/scheduling: 2
- Cloud routines / lying green row: 2
- docs/accuracy: 2
- Retired System Reference: 2
- deck/observability: 2
- Accuracy: 2
- Live CRM import / Lending & Real Estate: 1
- Automation narratives (lead triage / lead response / ISA KPI / showings): 1
- privacy / client PII in published source: 1
- Standing rules / prose: 1
- Repo mirrors vs. live Mac state: 1
- ISA operations: 1
- docs/remote-access: 1
- command-deck.html — PANEL_VERIFIED_AT (line ~21303) + the cfg.kind==="ref" branch of renderPanelStamps(): 1
- command-deck.html — panelStampRegistry() vs PANEL_VERIFIED_AT: 1
- Safety — refused installs: 1
- Safety — credentials: 1
- Testing honesty — what has never been executed: 1
- Bug found and fixed during testing: 1
- HALT — the Mac already runs an older claude-auto: 1
- HALT — what the script will never do: 1
- panel-vanessa (COMMAND) line 1358 - Reach Vanessa via table: 1
- panel-wellness (HEALTH) line 3833 - Strava/Fitbod card: 1
- panel-aiteam line 4625 - ISA line / comms bridge 'Honest status': 1
- panel-aiteam line 4627 - ISA bridge bullet list: 1
- panel-nextmoves line 5977 - '50 cloud routines exist' paragraph: 1
- panel-orchestration line 6745 - architecture rules list: 1
- panel-aiteam shared toolbox table (AI_TEAM_TOOLBOX, 'Cloud routines' row, now line 25923): 1
- Artifact DB / stravaSnapshot writer: 1
- Artifact DB / stravaSnapshot state: 1
- Specs / knowledge base: 1
- always-on register / runnerStatus: 1
- health-notion-sync / status doc naming: 1
- Notion Health Log schema / row key: 1
- appleHealth merge / undocumented keys: 1
- appleHealth merge / daemon-only metric keys: 1
- security/cli-anything-install: 1
- security/domshell: 1
- integrations/cli-anything: 1
- safety/showingtime: 1
- safety/showami: 1
- safety/skyslope-zipforms: 1
- integrations/lofty: 1
- command-deck/robustness: 1
- command-deck/tripwire: 1
- Reconciliation — never addressed: Google Drive: 1
- Reconciliation — half-done: Lofty: 1
- Reconciliation — refused by association: Higgsfield API: 1
- Wrong reason recorded — plugin advisories rested on a false premise: 1
- Testing honesty — what has and has not been executed: 1
- renderPanelStamps() selector: 1
- panelStampRegistry() — panel-vanessa: 1
- panelStampRegistry() — panel-toolkit: 1
- Mac task / stravaSnapshot writer: 1
- Mac runner / timestamp correctness: 1
- Mac task / r4-quantvue-sync: 1
- Cloud routine / strategySnapshot: 1
- Cloud routines / nine failures: 1
- consolidation / audit corpus: 1
- privacy / repo mirror of the ISA Portal: 1
- contradiction / runner status: 1
- PII in the audit corpus: 1
- tooling: 1
- Drift Check: 1
- Misattribution: 1
- PII Hygiene: 1
- Tooling: 1
- Compliance: 1
- Security: 1
- Data handling / PII: 1
- Identifiers - saved state, deliberately NOT renamed: 1
- AI Team toolkit / CRM & Connectors lane: 1
- test invariant / container count: 1
- identifiers carrying saved state / external contract: 1
- scope deviation - panel verification stamp: 1
- honesty - no substituted numbers: 1
- Identifier — Mac skill folder: 1
- Identifier — dashboard element ids and seed constants: 1
- Audit trail: 1
- Decision log: 1
- Integrations / credential hygiene: 1
- Search coverage: 1
- Knowledge graph: 1
- Mac task specs: 1
- deck/content-integrity: 1
- command-deck.html — renderPanelStamps() selector vs <section class="panel panel-pinned" id="panel-vanessa"> (line 1334): 1
- command-deck.html — panel-toolkit (section at line 6612): 1
- command-deck.html renderPanelStamps() ref branch — and the identical code in isa/isa-portal.html isaPanelStampRegistry()'s renderer: 1
- command-deck.html — panel-aiteam, card 'Automation & live-data connectivity — honest status', <p id="crmConnectivity"> (line 4527): 1
- Correctness — Python version gates: 1
- Bug found and fixed during testing — mac-verify.sh: 1
- OmniRoute failover — install shape: 1
- HALT — legal gate before any scraper runs: 1
- mac-verify.sh — scope and exit semantics: 1
- panel-openterminal (MARKETS) line 2236 - 'Why the terminal itself is not embedded here' callout: 1
- panel-personalaccounts (WEALTH) line 3252 - Plaid refresh steps: 1
- panel-aiteam line 4701 - Steve twin card: 1
- panel-aiteam line 4742 - 'Remote / live access to the same brain' list: 1
- panel-marketing line 6333 - video content queue card: 1
- panel-marketing JS - source comment lines 19418-19419 and the rendered marketingSyncNote at line 19434: 1
- freshness board 'who writes this' map, line 20799 - 'AI Hedge Fund memo': 1
- panel-aiteam roster - Derek (CTO) tool chips, now line 25905: 1
- EA/ISA start-of-day checklist (SOD_ITEMS), line 14759: 1
- EA/ISA start-of-day checklist (SOD_ITEMS), line 14760: 1
- EA/ISA 90-day onboarding, Days 1-30 (ONBOARD_PHASES), line 14972: 1
- panel-wellness (HEALTH) line 3567 - Apple Health card title: 1
- panel-wellness (HEALTH) line 3689 - Health metrics log card: 1
- health coaching freshness banner, renderHealthCoaching fallback, line 16100: 1
- LEFT ALONE - STRATEGY_SYNCED_AT constant, line 8263 (panel-quantvue data): 1
- LEFT ALONE - panel-toolkit line 6643: 1
- FLAGGED, NOT CHANGED - panel-aiteam line 4529 (Zoho connector bullet): 1
- Artifact DB / marketingQueue shape: 1
- Guards / standing check: 1
- Cloud routine / isaLadder: 1
- always-on register / silent tasks: 1
- always-on register / internal contradiction: 1
- Cloud writers / verification: 1
- Notion Health Log schema / missing property: 1
- appleHealth merge / timestamp formats: 1
- healthNotionSync / status vocabulary: 1
- health-notion-sync / tool allow-list: 1
- health-notion-sync / empty-read behaviour: 1
- HALT / scope of this engagement: 1
- documentation honesty / what is live: 1
- integration-research/showingtime: 1
- integration-research/showami: 1
- research-evidence-quality: 1
- command-deck/panel-showings: 1
- safety/authentication: 1
- mac-setup: 1
- Reconciliation — untraceable verdict: tashfeenahmed/freellmapi: 1
- Reconciliation — confirmed dead: cheahjs/free-llm-api-resources: 1
- Verified, not assumed — the three free-key sources: 1
- Stale instruction never applied — F-S1-19: 1
- mac-verify.sh did not check the newest step: 1
- PANEL_VERIFIED_AT / panelStampRegistry(): 1
- renderPanelStamps() !cfg fallback: 1
- panelStampRegistry() — panel-aiteam (NOT FIXED, reported): 1
- Mac task / r8-apple-health-snapshot: 1
- Cloud routine / isaLadder proof-of-life: 1
- Cloud routine / Real Estate Weekly Brief: 1
- Cloud routines / stock templates: 1
- wiki/dashboard-ops / stale standing fact: 1
- contradiction / r4-quantvue-sync and r8: 1
- contradiction / who may fix isaLadder.updatedAt: 1
- contradiction / rate as-of dates on deck vs portal: 1
- contradiction / Meritage builder incentive: 1
- unbacked claim / Zoho re-test routine: 1
- master table / superseded halts: 1
- evidence gap / published versions: 1
- OmniRoute failover / blocked install: 1
- Missing: 1
- Freshness Stamp: 1
- Process: 1
- Consistency: 1
- Data quality: 1
- Continuous-improvement log (dated audit record): 1
- ISA KPI scorecard - provenance of a dated figure: 1
- Google Calendar directory: 1
- Embedded assets: 1
- Verification: 1
- element id rename: 1
- removed FUB-only row: 1
- unverifiable live fact kept with a warning: 1
- base64 / false-positive check: 1
- self-inflicted defect, caught and fixed: 1
- Research citations: 1
- False positive — do not touch: 1
- Other engineers' files: 1
- test/coverage: 1
- docs/second-mac: 1
- command-deck.html — execSyncRegistry() panel attributions (lines ~21571 and ~21578): 1
- command-deck.html — PANEL_VERIFIED_AT coverage: 1
- command-deck.html — over-claim sweep (strings asserting verification or freshness): 1
- command-deck.html — tests: 1
- Build/Release — MAC-SETUP.sh: 1
- PATH — npm globals and ~/.local/bin: 1
- execSyncRegistry source comment, line 21536 (weather/news feed registry): 1
- renderAiNews, line 22224 (now 22225): 1
- LEFT ALONE - CI_LOG_DEFAULT entries, lines 19105-19115, and the same narrative inside the cdStateSeed JSON at line 6957: 1
- FLAGGED, NOT CHANGED - renderHealthCoaching broken-pipeline nudge, line 16099: 1
- Routine spec drift: 1
- Notion Health Log schema / Source options: 1
- appleHealth / history range stated imprecisely: 1
- health-notion-sync / freshness watch: 1
- deck / 'via' badge label: 1
- Command Deck DB / stravaSnapshot wrapper: 1
- command-deck/document-shape: 1
- repo-convention: 1
- credential-location/consistency: 1
- REFUSED list — reviewed, unchanged: 1
- execSyncRegistry() freshness board — full sweep: 1
- PANEL_VERIFIED_AT coverage gap (NOT FIXED, by design): 1
- Freshness board jump links (PRE-EXISTING, NOT FIXED): 1
- Credential location / Showami: 1
- integrations/CONNECTIONS.md line 16: 1
- always-on register / new cloud writer: 1
- duplicate work / program facts: 1
- unrecorded DB write: 1
- stale cross-claim / F-E8-64: 1
- stale cross-claim / F-M1-10 and F-M4-24/25: 1
- count check / dated FUB references: 1
- process / unrecorded routine creation: 1
- disagreement / AI-news freshness stamp source: 1

