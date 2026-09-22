# Master Findings Table — Cycle 6

**Baseline:** 2026-09-12 04:47 UTC · **Audited and remediated:** 2026-09-22 · **Findings:** 285

Every row below was produced by an engineer working one named region of the ecosystem, and is
traceable to a live document, a scheduled task, or a dated external source. A row marked
Escalated is waiting on Steven and says why in its halt reason.

## Totals

| By priority | | By resolution | | By owner | |
|---|---|---|---|---|---|
| P1 | 94 | Open | 117 | Reliability Engineer | 67 |
| P2 | 132 | Fixed | 88 | Integration Engineer | 53 |
| P3 | 59 | Escalated | 48 | Steven | 46 |
|  |  | Implemented | 21 | Capability Engineer | 36 |
|  |  | Improved | 10 | Vanessa | 33 |
|  |  | Recommended | 1 | CTO Innovator | 23 |
|  |  |  |  | Efficiency Engineer | 15 |
|  |  |  |  | Stress Test Engineer | 6 |
|  |  |  |  | CAIO | 3 |
|  |  |  |  | Victor | 2 |
|  |  |  |  | CRO | 1 |

## Halted — waiting on Steven (54)

- **F-E1-13** — The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through  
  *Re-pointing r2-lead-response-watchdog, lead-triage-daily, r11-isa-kpi-compile and showing-sync from Follow Up Boss to Lofty needs a Mac-side task edit plus the LOFTY_API_KEY in ~/.config/lofty/.env, which cannot be reached or verified from the cloud.*
- **F-E1-14** — The backup card's copy-prompt targeted ~/Applications/command-deck-backups with a 12-week retention, and its empty state described the weekly task as though it worked. The truth: r  
  *A scheduled task that has never run dies on its first permission prompt; only Steven can open r6-weekly-backup in the desktop app and press Run now once to approve its tools. Months of hand-entered data currently have one same-disk copy, 8 days old.*
- **F-E1-18** — The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only becau  
  *Diagnosing and re-running a failing Mac runner task needs access to the Mac and its task logs; a scheduled run that dies on a permission prompt can only be cleared by Steven pressing Run now once in the desktop app.*
- **F-E11A-02** — Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cro  
  *Changing the backup cron and moving the backup root are Steven's decisions; pruning or moving existing backup folders is irreversible.*
- **F-E12-04** — The portal pinned Steven's Follow Up Boss calling number and lead-forwarding email as the numbers to use for every real-estate lead. With FUB retired, whether that number now route  
  *Only Steven knows whether the (619) 651-9845 line and steven.shearrill@followupboss.me were migrated to Lofty. The human ISA is told to use them on every lead call.*
- **F-E12-05** — Zoho remains the system of record for mortgage, but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (re-verified 2026-09-22 08:17 UTC). Several places on the p  
  *Fix is Zoho-side and only Steven can do it: Zoho CRM -> Setup -> Security Control -> Profiles -> the connected user's profile -> enable 'Zoho CRM API Access'.*
- **F-E12-10** — The routine runs four times a day and reports SUCCESS every time, but it has never synced anything: an unattended cloud run cannot write an artifact database - the write parks on a  
  *The routine cannot be fixed in the cloud. It needs replacing with a Mac task (the isa-comms-bridge-local pattern), or disabling so it stops reporting a green tick for work it cannot do.*
- **F-E12-11** — Read live on 2026-09-22: this portal's pipeline document holds 2 mortgage deals (R. Alvarez $480,000 Underwriting; T. Nguyen $355,000 Clear to close). Command Deck's pipeline docum  
  *Closing it needs a write to Command Deck's store, which the publishing engineer performs; keeping it closed needs a Mac task.*
- **F-E12-12** — This portal holds 2 real-estate clients (J. Whitfield, buyer, Active search; M. Delgado, seller, Consult scheduled). On Command Deck the reClients document does not exist at all -   
  *Same as F-E12-11: needs a write to the other store plus a task to keep it carried.*
- **F-E12-15** — The ISA line works, and it is the only thing that crosses: isa-comms-bridge-local on Steven's Mac, hourly 7:37 AM - 9:37 PM PT, last ok 2026-09-21 8:38 PM PT. Both copies of the th  
  *Steven has to decide whether to accept a Mac-only bridge or fund a path that survives his Mac being asleep.*
- **F-E12-22** — Lofty is the CRM of record from 2026-09-22 but no loftyLeads document has ever been written. The Mac has the lofty-bridge MCP server and lofty-cli; the API key (Lofty -> Settings -  
  *The API key lives on Steven's Mac and only he can add it. Until then there are no live real-estate lead numbers on either dashboard.*
- **F-E12-23** — The artifact's published capabilities are {"db":{},"mcp":{"servers":[{"server":"You.com","tools":["you-search"]}]},"sample":{}}. No code in the file uses the mcp capability any mor  
  *Republishing is the caller's step; the page cannot change its own capability declaration.*
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
  *Requires changing a Mac task / cloud routine outside the deck, or changing the shared sync engine — neither is in E5's scope.*
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
- **F-E8-05** — backupStatus: last verified backup 2026-09-14 at ~/AI-Ecosystem-Backups/2026-09-14 (7,931 docs, 109,378,368 bytes, integrityCheck pass, restore test 13/13 on 2026-09-15), weeksKept  
  *First run of r6 under the runner ('Run now') and the backup path change happen on the Mac — Steven must trigger them.*
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
- **F-E7-12** — r6-weekly-backup has never run under the runner and missed its 2026-09-20 slot; backupStatus still reports the 2026-09-14 backup. This cycle produced a verified bundle as a rehears  
  *A scheduled task cannot approve its own tool prompts. Steven must open r6-weekly-backup in the desktop app's Scheduled section and press Run now once, approving each tool, before the weekly backup can be called live.*
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
| F-E1-13 | Plugin/Integration | The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through Composio'. Follow Up Boss was retired 2026-09-22 in favo... | P1 | M | Broken | Escalated | Pending | 2026-09-22 | Integration Engineer |
| F-E1-14 | Routine | The backup card's copy-prompt targeted ~/Applications/command-deck-backups with a 12-week retention, and its empty state described the weekly task as though it worked. The truth: r6-weekly-backup (Sundays 5:00 AM PT) has NEVER RUN under ... | P1 | S | Broken | Escalated | Pending | 2026-09-22 | Steven |
| F-E1-18 | Routine | The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only because a Claude session filled them by hand - every one of th... | P1 | M | Broken | Escalated | Pending | — | Steven |
| F-E11A-02 | Routine | Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cron 0 5 * * 0 (Sun 5:00 AM PT), has NEVER run under claude-... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-E11A-03 | Routine | Every skill written this cycle registers a nightly self-test, but nightly-self-test itself is in error — timeout, exit 124, last end 2026-09-15 — and loopLog cycle 3 records that no selfTest doc has ever been confirmed written. Each self... | P1 | M | Broken | Open | Fail | — | Reliability Engineer |
| F-E12-01 | Plugin/Integration | You.com was retired 2026-09-22. All 8 references in the file were in-page live-search paths: 2 callTool sites in the property listing search, 1 in the AI-directed comparable search, 1 in the tax-record search, 1 watchTool subscription, a... | P1 | L | Broken | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-03 | Stale Content | The card was titled 'Real estate - Follow Up Boss (live)' and described a live Composio pull. The FUB API key had been rejecting every call since 2026-09-16 and Steven retired FUB on 2026-09-22, so FUB_SYNC_AT 2026-09-07, FUB_STAGE_TOTAL... | P1 | L | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-04 | Current State | The portal pinned Steven's Follow Up Boss calling number and lead-forwarding email as the numbers to use for every real-estate lead. With FUB retired, whether that number now routes through Lofty cannot be verified from here, and the for... | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E12-05 | Plugin/Integration | Zoho remains the system of record for mortgage, but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (re-verified 2026-09-22 08:17 UTC). Several places on the page implied the ISA could see live Zoho data. | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E12-06 | Bug | take() returned early on !m.id, so any ISA-line message without an id was dropped silently on both sides of the merge. This is the human ISA's only written channel to Steven. | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-07 | Bug | lsSetLocal had an empty catch, so a full or blocked browser store looked exactly like a successful save: the panel re-rendered from the in-memory value, the sync pill read normally, and what the ISA typed was gone on reload. | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-08 | Bug | A document arriving without a {v: ...} wrapper was skipped outright, so it never reached the device and a restore silently lost it. Command Deck writes stravaSnapshot in exactly that shape. | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-10 | Routine | The routine runs four times a day and reports SUCCESS every time, but it has never synced anything: an unattended cloud run cannot write an artifact database - the write parks on a permission prompt. Reading both stores on 2026-09-22 pro... | P1 | M | Broken | Escalated | Pass | — | CTO Innovator |
| F-E12-11 | Current State | Read live on 2026-09-22: this portal's pipeline document holds 2 mortgage deals (R. Alvarez $480,000 Underwriting; T. Nguyen $355,000 Clear to close). Command Deck's pipeline document is an empty list, version 3, untouched since 2026-09-... | P1 | S | Broken | Escalated | Pass | — | Steven |
| F-E12-12 | Current State | This portal holds 2 real-estate clients (J. Whitfield, buyer, Active search; M. Delgado, seller, Consult scheduled). On Command Deck the reClients document does not exist at all - it has never been created there. | P1 | S | Broken | Escalated | Pass | — | Steven |
| F-E12-13 | Stale Content | The card stated 'The bridge carries changes both ways on the hour, merging by row, so a status you set here shows up on his side.' Verified false: nothing carries showings. The integration table also claimed a green 'Live' status for Ste... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-15 | Routine | The ISA line works, and it is the only thing that crosses: isa-comms-bridge-local on Steven's Mac, hourly 7:37 AM - 9:37 PM PT, last ok 2026-09-21 8:38 PM PT. Both copies of the thread held the same 9 messages on 2026-09-22. The hourly C... | P1 | M | Broken | Escalated | Pass | — | CTO Innovator |
| F-E12-16 | Stale Content | The rate table was a 2026-09-07/09-10 Bankrate and Veterans United snapshot, 12 days old, while Command Deck's ratesSnapshot document (2026-09-22 02:24 UTC, written daily by mortgage-rates-daily) carried fresher Optimal Blue figures. | P1 | M | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-22 | Plugin/Integration | Lofty is the CRM of record from 2026-09-22 but no loftyLeads document has ever been written. The Mac has the lofty-bridge MCP server and lofty-cli; the API key (Lofty -> Settings -> Integrations -> API) and one proving run are outstandin... | P1 | M | Missing | Escalated | Pending | — | Steven |
| F-E12-23 | Plugin/Integration | The artifact's published capabilities are {"db":{},"mcp":{"servers":[{"server":"You.com","tools":["you-search"]}]},"sample":{}}. No code in the file uses the mcp capability any more, so the declaration grants a retired connector for noth... | P1 | S | Stale | Open | Pending | — | Steven |
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
| F-E4a-02 | Plugin/Integration | No loftyLeads document exists in the live store (checked against all 161 exported docs, 2026-09-22 08:10 UTC) and no lofty-crm-sync task exists under claude-runner. The Mac has lofty-bridge (toolbox status RUN, `claude mcp` shows server ... | P1 | M | Missing | Escalated | Pending | — | Steven |
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
| F-E5-02 | Bug | Root cause of F-E5-01 is at the WRITER, and it is outside this deck. Whatever wrote stravaSnapshot on 2026-09-20 (via string: 'claude-code-session (Strava connector, direct read)') set the document body directly instead of {v:{...}} — th... | P1 | S | Broken | Escalated | Pending | — | Integration Engineer |
| F-E5-07 | Stale Content | Card said 'refreshed twice daily by an automated routine' and 'refreshes twice daily'. Neither holds: the Mac task strava-daily-sync has status error with its last run 2026-09-17 (mac-runner-status.md), and the cloud routine 'Command Dec... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E5-08 | Current State | The Apple Health card described a working pipeline ('The R8 sync writes this card's snapshot at 5:10 AM and 9:10 PM'). Truth on 2026-09-22: the ingest daemon (LaunchAgent, port 8765) is not responding; appleHealth's last real ingest is 2... | P1 | S | Broken | Escalated | Pass | 2026-09-22 | Steven |
| F-E5-11 | Automation Opportunity | The replacement route for the dead daemon is described on the card as what it is: spec written 2026-09-22, first phone run pending. Claude iOS reads Apple Health on the phone, writes the day's stats into a Notion Health Log database (Not... | P1 | M | Recommended | Open | Pending | — | Steven |
| F-E5-14 | Bug | Two writers, two shapes, and the renderer only knew one. A hand-added idea is {text, status:'Idea'/'Filmed'/'Editing'/'Posted'}; r14-content-pipeline writes {id, topic, body, channel, variants, complianceNotes, status:'awaiting Steven', ... | P1 | M | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E5-18 | Stale Content | The Automate card claimed '15 recurring cloud routines already run this dashboard ... That's real automation already in place — not aspirational', and listed weeklies that have since broken. Replaced with the 2026-09-22 truth from the li... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E5-21 | Bug | The Elite rewards scan badge rendered a fixed green 'Synced 2026-09-07' — a fifteen-day-old curated scan of card offers, status matches, expiring credits and SUB deadlines presented as fresh. Offers and deadlines are exactly the class of... | P1 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E6-06 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Said 'Honest status (Sep 7, 2026)': cloud hourly bridge parked on approval, local 10-min loop as the path. Truth: cloud routine DISABLED (last run 2026-09-09); Mac task isa-comms-bridge-local h... | P1 | S | Stale | Fixed | Pass | 2026-09-22 | Vanessa |
| F-E6-07 | ISA Coverage | Baseline 2026-09-12 · verified 2026-09-22 — The ISA has posted nothing on the line since 2026-09-16; r3 keeps requesting the EOD summary; isaScorecard never filled. The bridge is healthy — the gap is human. | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E6-10 | Orchestrator Agent | Baseline 2026-09-12 · verified 2026-09-22 — Model tiering per Steven 2026-09-22 added: legend under the chart, Vanessa role/agent text 'Claude Fable 5.1 masterminds', exec group label 'judgment seats on Opus 5', MODEL_BADGE extended with... | P1 | M | New | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-12 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — Added a lane node (role '0 agents of its own' so seat counts stay honest): Lofty (lofty-bridge MCP + lofty-cli, key/first sync pending), Zoho (Composio, 403 NO_PERMISSION), CLI-Anything wrapper... | P1 | S | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E6-13 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — Every Zoho call returns 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC). Only Steven can fix: Zoho CRM → Setup → Security Control → Profiles → connected profile → enabl... | P1 | S | Broken | Escalated | Pending | — | Steven |
| F-E6-14 | Plugin/Integration | Baseline 2026-09-12 · verified 2026-09-22 — lofty MCP shows connected in the 2026-09-16 snapshot, but whether the API key is present in ~/.config/lofty/.env cannot be verified from the cloud; first sync has not run; loftyLeads doc does n... | P1 | S | Missing | Escalated | Pending | — | Steven |
| F-E6-15 | Current State | Baseline 2026-09-12 · verified 2026-09-22 — Added 'Second Brain — five levels, one Vanessa' after the org chart: L1–L5 table (level · what · where · owner · status) in the canonical §3 words, remote/live-access line, ECC-as-gate line; re... | P1 | M | New | Implemented | Pass | 2026-09-22 | Vanessa |
| F-E6-17 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22 — Rows claimed Composio → Follow Up Boss, GoHighLevel pending, Canva connected, cloud Steve twin/ISA bridge running, Desktop tasks at old times, skills list without this cycle's additions, agents... | P1 | M | Stale | Fixed | Pass | 2026-09-22 | CTO Innovator |
| F-E6-20 | Routine | Baseline 2026-09-12 · verified 2026-09-22 — None of the weekly/monthly runner slots that the AI Team panel depends on has ever run under claude-runner (runnerStatus 2026-09-22); their cloud duplicates FAILED Sep 18–20. The panel now says... | P1 | M | Broken | Open | Pending | — | Reliability Engineer |
| F-E7-01 | Bug | A SYNCHRONOUS throw from window.claude.use kills the entire dashboard. `(function initSync(){ ... window.claude.use("db").then(...).catch(...) })()` guards only the PROMISE; the call itself is unguarded, so a throw propagates out of the ... | P1 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E7-03 | Bug | stravaSnapshot is the only one of the 161 exported documents with no `v` wrapper (top-level activities/syncedAt/via). applyRemoteSnapshot rejects any doc without `v` (`if (!data // typeof data !== "object" // !("v" in data)) return;`), s... | P1 | S | Broken | Open | Fail | — | Integration Engineer |
| F-E8-01 | Current State | Speed-to-lead and lead triage have been blind since 2026-09-16: leadResponse doc status=failed, staleSince 2026-09-16T02:42:40Z, failedAt 2026-09-22T03:02:14Z ('Invalid API Key or authentication credentials'); leadTriage ranAt 2026-09-21... | P1 | M | Broken | Escalated | Fail | — | Integration Engineer |
| F-E8-02 | Current State | Composio connection zoho_talite-spike is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION Crm_Implied_Api_Access (verified 2026-09-22 08:17 UTC on ZOHO_LIST_LEADS and ZOHO_LIST_DEALS). zohoSync and zohoDeals ... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-E8-03 | Current State | runnerStatus (syncedAt 2026-09-22T04:05:04Z, loggedIn=true): 11 tasks in error (cpi-daily-scan, fabric-deck-sync, health-full-analysis, nightly-self-test exit 124, openrouter-feeds-refresh, r1-morning-brief 'API unreachable' 2026-09-17, ... | P1 | L | Broken | Open | Fail | — | Reliability Engineer |
| F-E8-05 | Current State | backupStatus: last verified backup 2026-09-14 at ~/AI-Ecosystem-Backups/2026-09-14 (7,931 docs, 109,378,368 bytes, integrityCheck pass, restore test 13/13 on 2026-09-15), weeksKept 3, sameDiskOnly true. r6-weekly-backup (Sun 05:00) has n... | P1 | M | Broken | Escalated | Fail | — | Reliability Engineer |
| F-E8-06 | Current State | isaLine (8 messages) contains only Command-Deck-originated messages; the export has no ISA-authored message at all, isaLineRead.isa = 2026-09-13T22:11:56Z is the last time the ISA read the line, isaScorecard is an empty array (never fill... | P1 | M | Broken | Escalated | Fail | — | Steven |
| F-E8-22 | Stale Content | Base deck (commit 5fbe844): 32 lines contain 'Follow Up Boss' and 32 'FUB' (brief counts 35/22 occurrences), 0 contain 'Lofty'. Outside E4a/E4b/E6 regions they include panel-showings ('Contact details stay in Follow Up Boss (the real-est... | P1 | M | Stale | Open | Pending | — | Integration Engineer |
| F-E8-25 | Bug | nightly-self-test timed out (exit 124) at 2026-09-16T03:32Z and has not completed since; the selfTest doc has never existed. loopLog cycle 4 (F-029) made /dashboard-selftest (jsdom) the 'P1-never-a-proposal gate' inside this task, so the... | P1 | M | Broken | Open | Fail | — | Stress Test Engineer |
| F-E8-29 | Bug | stravaSnapshot (syncedAt 2026-09-20T21:03:00Z) is the only doc of 161 without the {v:…} wrapper (top-level activities/syncedAt/via), so applyRemoteSnapshot ignores it and the Strava card renders the baked seed. Recorded here for the audi... | P1 | S | Broken | Open | Pending | — | Integration Engineer |
| F-E8-33 | Routine | Trigger: every 30 min 07:10–19:40 PT weekdays (same slots as r2) plus 11:30 PT before the ISA huddle. Action: lofty-bridge MCP → loftyLeads {syncedAt, source:'Lofty via lofty-bridge MCP (Mac)', status, stageTotals, newLeads90d, firstResp... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-34 | Routine | Because an unattended cloud write parks on a permission prompt (§2), the 4x-daily Zoho sync that writes zohoSync/zohoLeads/zohoDeals must run on the Mac runner (07:05, 11:05, 15:05, 19:05 PT); the cloud routine (0 */6 UTC) only performs ... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-35 | Routine | Trigger: cloud, Mondays 15:00 UTC (08:00 PT) after the Sunday 00:00 PT backup slot. Action: read_db backupStatus (reads do not need approval), compare lastBackup and history[-1].integrityCheck against the 8-day / pass thresholds, then fi... | P1 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-36 | Routine | The Composio/FUB key was rejected from 2026-09-16 and surfaced only on 2026-09-22 as a twinQueue decision item. Trigger: cloud, daily 13:30 UTC. Action: read_db leadResponse, leadTriage, zohoSync, loftyLeads, strategySnapshot, calendarSn... | P1 | S | Recommended | Open | Pending | — | Reliability Engineer |
| F-E8-38 | Routine | The cloud 'Pipeline Sync' (0 1,7,13,19 UTC) SUCCEEDED every run through 2026-09-22T07:08Z, yet the deck's pipeline doc is [] and reClients does not exist, while the ISA Portal holds real records ('2 loans, $835K; 2 RE clients' — vanessaR... | P1 | M | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-41 | Automation Opportunity | The SOP standard is 'under 5 minutes (auto-text within 60 sec)' (panel-property line 413) and kanban kr4 is p1, but the only watchdog (r2) polls every 30 minutes and is broken. Once loftyLeads exists: poll Lofty every 5 minutes during 07... | P1 | M | Recommended | Open | Pending | — | Vanessa |
| F-E8-64 | Orchestrator Agent | vanessaRuns has one entry (2026-09-11, source cloud). The cloud 'Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT)' FAILED 2026-09-18 (its prompt calls write_db, which parks); the Mac vanessa-ops-review (Fri 22:35 PT) ha... | P1 | M | Broken | Open | Fail | — | Vanessa |
| F-E8-65 | Orchestrator Agent | loopLog cycles 4–5 (F-024) proved that scheduled tasks only fire when the app is up; the headless claude-runner now reports loggedIn=true but 20 tasks still have no run and several daily tasks sit 'late'. The toolkit index lists task-wat... | P1 | S | Recommended | Escalated | Pending | — | Reliability Engineer |
| F-E8-66 | Orchestrator Agent | aiTeamRoster.owners.mortgage-pipeline-watchdog (SCALE-05, named 2026-09-13): consolidatedBy cco-alexandra, escalation mortgage-broker-elite — but no Mac task or routine implements it and routineHealth's last row says the Zoho + ARIVE flo... | P1 | M | Missing | Open | Pending | — | Integration Engineer |
| F-E8-68 | ISA Coverage | Present: Steven↔ISA thread (isaLine + isa-comms-bridge-local hourly 07:37–21:37 PT, last ok 2026-09-21 20:38 PT; cloud hourly bridge disabled); Vanessa/Steve drafts on the line (Draft · Vanessa / Draft · Steve buttons); daily playbook (i... | P1 | M | Missing | Open | Fail | — | Vanessa |
| F-E8-72 | ISA Coverage | kanban k1 'Screen & onboard ISA (Executive Assistant) candidates' (p2, backlog, no due date); vanessaRecommendations vr-1757631000000-isa (2026-09-11, pending): 'fill it or reassign the theme-day call load'; feasibilityChecks: 'ISA/EA hi... | P1 | S | Missing | Escalated | Fail | — | Steven |
| F-INT-02 | Routine | Thirteen of fifty cloud routines failed or hung on their last run. Every failure died 5 to 10 seconds after firing, and all of them fall inside two crowded windows: Friday 20:00-23:00 UTC (4 routines, all failed) and Sunday 15:00-17:00 U... | P1 | S | Broken | Fixed | Pending | 2026-09-22 | Reliability Engineer |
| F-INT-03 | Plugin/Integration | The Zoho connection is ACTIVE (Composio account created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION with detail Crm_Implied_Api_Access. Verified today against both ZOHO_LIST_LEADS and ZOHO_LIST_DEALS. The dashboard's Zo... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-INT-04 | Plugin/Integration | Follow Up Boss is retired as the real-estate CRM and replaced by Lofty (Steven's decision, 2026-09-22). Follow Up Boss had in any case been rejecting its API key on every call since 2026-09-16, so the speed-to-lead and lead-triage number... | P1 | M | Missing | Implemented | Pending | 2026-09-22 | Integration Engineer |
| F-INT-05 | Plugin/Integration | Composio disclosed a security incident on 2026-05-21: roughly 5,241 API keys and 5,001 GitHub OAuth tokens exfiltrated through a compromised employee OAuth token. Composio is the path that currently carries Zoho, Gmail, GitHub, Google Ad... | P1 | S | New | Escalated | Pending | — | Steven |
| F-INT-06 | Orchestrator Agent | The ecosystem had no surface showing the machinery that governs it: no master findings table, no stress test report, no scale log, no trust levels, no weekly brief, and no statement of the halt conditions. Every prior cycle's findings li... | P1 | L | Missing | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-INT-07 | Current State | The weekly backup has never run under the Mac's claude-runner. It missed its 2026-09-20 Sunday slot entirely. The last verified backup is 2026-09-14 (7,931 documents, 109 MB, integrity pass, restore test 13 of 13 on 2026-09-15) and reten... | P1 | M | Broken | Implemented | Pending | 2026-09-22 | Reliability Engineer |
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
| F-E11A-06 | Skill | The Mac still carries the fub-followups skill (a Follow Up Boss template library) after Follow Up Boss was retired 2026-09-22 in favour of Lofty. skills-refresh flags it as needing a port to Lofty rather than reporting it healthy; deleti... | P2 | M | Stale | Open | Pending | — | Steven |
| F-E12-02 | Bug | The market-update and builder-incentive cards said their headline lists 'refresh automatically'. They were fed by a You.com watch subscription; with the connector gone the promise stayed and the list stayed empty. | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E12-09 | Bug | A replayed identical snapshot, or one whose local write failed, could report changed and ride the 30-second reload throttle in a loop. | P2 | S | Broken | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E12-17 | Stale Content | The market snapshot was the 2026-09-07 pull with San Diego on the July 2026 period, while the same ratesSnapshot document carried August county figures and a Murrieta market this portal did not track. | P2 | M | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-18 | Stale Content | The note blamed 'the daily cloud routine that used to refresh this was retired after repeated rate limits'. In fact a builder-incentive scan does still run daily - incentives-daily-scan on Steven's Mac, last ok 2026-09-22 - it simply wri... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Capability Engineer |
| F-E12-20 | Automation Opportunity | A measured isaKpi document (week ending 2026-09-13, written by the r11 task) exists in this portal's store AND on Command Deck, and the two copies are byte-identical. No code on this page reads it: the KPI scorecard shows SOP targets aga... | P2 | M | Missing | Open | Pass | 2026-09-22 | Capability Engineer |
| F-E12-21 | ISA Coverage | The ISA's self-grades and KPI actuals are written to isaGradingScores and isaKpiSopActuals. Neither document exists on the ISA Portal store or on Command Deck - checked both on 2026-09-22. Steven cannot see the ISA's self-assessment at a... | P2 | M | Missing | Escalated | Pass | — | Steven |
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
| F-E4a-05 | Routine | §2 of the brief says a cloud routine re-tests Zoho every few hours and writes zohoSync. No zohoSync document exists in the 161-doc export, so either the routine has never run or its artifact-DB write parked on a permission prompt (the kn... | P2 | S | Missing | Open | Fail | — | CTO Innovator |
| F-E4a-06 | Unlisted Capability | The deck had no mortgage-deal view at all: the Zoho card mirrored Leads only, so dollar pipeline, closing dates and deal owners were invisible even though ZOHO_LIST_DEALS is part of the same blocked connection. Added #zhDealsCard — stage... | P2 | M | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-07 | Stale Content | The board said "Moves are saved on this dashboard only — Zoho is not updated until its API access is granted" and "Deck only — it is NOT created in Zoho until API access is granted". Both implied that granting API access would start push... | P2 | S | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E4a-11 | Bug | The speed-to-lead empty state hard-codes "reading Follow Up Boss through Composio and writing the leadResponse document", and the card sub-title hard-codes "median time from a Follow Up Boss lead arriving". §4 requires the page to displa... | P2 | S | Broken | Open | Fail | — | Integration Engineer |
| F-E4a-12 | Plugin/Integration | CLI-Anything is installed on the Mac as a Claude Code plugin (toolbox status RUN, commands only, no hooks), but its hub carries no CRM or real-estate entry (README checked 2026-09-22; clianything.cc is egress-blocked from this sandbox), ... | P2 | L | Recommended | Escalated | Pending | — | Steven |
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
| F-E7-02 | Bug | `var cites = (d.citations // []).filter(...)` assumes liveFeeds.feeds[x].citations is an array. A feed document whose citations field is an object, a number or a string throws "(d.citations // []).filter is not a function" and safeRun bl... | P2 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E7-04 | Bug | renderIsaLine does `wrap.innerHTML = msgs.map(isaLineMsgHtml).join("")` with no display cap. ISA_LINE_MAX (300) is applied ONLY inside isaLineMergeArrays, so any isaLine document written directly by a task — or restored from a larger sto... | P2 | S | Broken | Open | Fail | — | Efficiency Engineer |
| F-E7-05 | Bug | take() returns early on `!m.id`, so any relayed message without an id is discarded with no record anywhere — not a console warning, not SHAPE_MISMATCH, not the Ops Radar. Measured in the concurrency burst: 2 id-less messages sent, 2 drop... | P2 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E7-06 | Bug | A failing localStorage WRITE is completely invisible. lsSetLocal's catch is empty and LS_UNAVAILABLE is only ever set from a failing READ inside lsGetSeeded, so with setItem throwing the page still rendered all 318 containers, raised 0 c... | P2 | S | Broken | Open | Fail | — | Reliability Engineer |
| F-E7-09 | Current State | While dbReady is false, any key that already has a queued local write is skipped entirely ("local is newer; it flushes next"). The isaLine branch itself calls syncKeyToDb, so in local-only mode the FIRST isaLine change queues a pending w... | P2 | M | New | Open | Fail | — | Reliability Engineer |
| F-E7-10 | Current State | The four volume payloads together are 5.02 MB — about 1.0x the ~5 MB localStorage budget a browser gives one origin — and the page took 7215 ms to render them against a 1070 ms baseline. Nothing in the page measures its own storage footp... | P2 | M | New | Recommended | Fail | — | Efficiency Engineer |
| F-E7-11 | Current State | 2 of the 26 watched documents do not exist in the 161-document export at all: revenueScan, healthCoaching. Their owning tasks have never written them, so no backup can restore them and the Output-watch board is correct to say "never prod... | P2 | M | Missing | Escalated | Pass | — | Integration Engineer |
| F-E7-12 | Routine | r6-weekly-backup has never run under the runner and missed its 2026-09-20 slot; backupStatus still reports the 2026-09-14 backup. This cycle produced a verified bundle as a rehearsal of Steven's spec: 161 documents plus the deck, 4.71 MB... | P2 | S | Broken | Escalated | Pass | — | Steven |
| F-E7-13 | Automation Opportunity | The deck has no automated runtime gate. quickcheck.py is static only and cannot see a function that is called but no longer defined — the exact bug that blanked Market Snapshot on 2026-09-03. tests/runtime-harness.js now executes the who... | P2 | S | Recommended | Implemented | Pass | 2026-09-22 | CTO Innovator |
| F-E8-04 | Current State | 50 routines, 46 enabled; research-only by design because an unattended write to the artifact DB parks on a permission prompt (confirmed three times, quoted in the 'weekly improvement loop' prompt). Last run FAILED Sep 18–20 for 10 routin... | P2 | M | Broken | Open | Fail | — | CTO Innovator |
| F-E8-07 | Current State | twinQueue holds 10 items: 5 completed (4 on 2026-09-22T02:24:35Z by steve-twin-sweep), 5 standing pending (recruiting drafts Tue, decision memos monthly, reading digests Thu, USC drafts Sun, client-text drafts daily), 1 p1 needs-steven. ... | P2 | S | Missing | Open | Fail | — | Capability Engineer |
| F-E8-08 | Current State | appleHealth syncedAt 2026-09-13T23:15:59Z (9 days stale); r8-apple-health-snapshot 'RAN BUT PRODUCED NOTHING — ingest daemon on port 8765 not responding'; health-full-analysis error since 2026-09-17; healthInsight (2026-09-13) already fl... | P2 | M | Broken | Escalated | Pending | — | Integration Engineer |
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
| F-E8-58 | Plugin/Integration | toolkit index (2026-09-16): 'cli-anything (HKUDS, MIT) Claude Code plugin … generates agent-friendly CLIs … Commands only, no hooks' is already installed on the Mac; the hub has no CRM or real-estate entries (README checked 2026-09-22). ... | P2 | L | Recommended | Open | Pending | — | Integration Engineer |
| F-E8-59 | Plugin/Integration | Composio connected apps: api_ninjas, discord, follow_up_boss, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho. Follow Up Boss is retired 2026-09-22 but its connection still says ACTIVE with a ... | P2 | S | Recommended | Escalated | Pending | — | Integration Engineer |
| F-E8-60 | Plugin/Integration | toolkit index: 'claude-auto: Claude subscription first; when its limit is hit, Claude Code runs on FREE providers via OmniRoute (loopback :20128, combo free-only) with a client-data guard hook'; 'free-claude-code … routing the official C... | P2 | S | Recommended | Open | Pending | — | Integration Engineer |
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
| F-E4a-13 | Current State | Composio still lists follow_up_boss among the twelve connected apps and reports it ACTIVE, even though its credentials have been rejected since 2026-09-16 and the product is retired as of 2026-09-22. Composio has no Lofty toolkit at all ... | P3 | S | Recommended | Open | Pending | — | Steven |
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
| F-E7-07 | Bug | 6 element ids are looked up by the script and exist nowhere in the 25,595-line pinned baseline (git 5fbe844): vanessaVoiceToggle, steveVoiceToggle, vanessaMicBtn, steveMicBtn, isaPbTracker, isaPbVip. Every call site is null-guarded so no... | P3 | M | Missing | Open | Fail | — | Capability Engineer |
| F-E7-08 | Bug | renderTravelPage reads $("travelVisibleCount") at html:17776, one line before renderTravelFilters() (html:17778) creates that span at html:17719. On the first paint the element does not exist yet, the `if (cnt)` guard swallows it, and th... | P3 | S | Broken | Open | Fail | — | Reliability Engineer |
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
After: The Sync status panel names the routine and explains that its green tick means 'the routine finished', not 'the pipeline crossed', with the empty documents cited as proof.  

**F-E12-11 — Current State**  
Before: The page implied pipeline edits reached Command Deck.  
After: Named in the Sync status drift table with both sides' actual contents, and the exact value to write is in audit/E12-write-cd-pipeline.json.  

**F-E12-12 — Current State**  
Before: The page implied client-stage changes reached Command Deck.  
After: Named in the drift table; exact value in audit/E12-write-cd-reClients.json.  

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
After: Zero mcp call sites remain. Republish with {"db":{},"sample":{}} - db for cross-device sync and the ISA line, sample for the Vanessa and Steve chats, which are still live and still needed.  

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
After: An ai-ecosystem-backup skill to the full specification (scope, dated folders, 8-week rolling window, integrity check, restore test, retry once, escalate after two failures, log every run) plus a Sunday cloud watchdog that reads backupStatus, counts the live store for comparison, and escalates when the backup is missing, late or unverified  

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
