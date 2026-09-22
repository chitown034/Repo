# Master Findings Table — Cycle 6

**Baseline:** 2026-09-12 04:47 UTC · **Audited and remediated:** 2026-09-22 · **Findings:** 205

Every row below was produced by an engineer working one named region of the ecosystem, and is
traceable to a live document, a scheduled task, or a dated external source. A row marked
Escalated is waiting on Steven and says why in its halt reason.

## Totals

| By priority | | By resolution | | By owner | |
|---|---|---|---|---|---|
| P1 | 61 | Open | 91 | Reliability Engineer | 45 |
| P2 | 100 | Fixed | 61 | Integration Engineer | 39 |
| P3 | 44 | Escalated | 31 | Steven | 32 |
|  |  | Implemented | 17 | Vanessa | 27 |
|  |  | Improved | 5 | Capability Engineer | 27 |
|  |  |  |  | CTO Innovator | 18 |
|  |  |  |  | Efficiency Engineer | 10 |
|  |  |  |  | Stress Test Engineer | 3 |
|  |  |  |  | CAIO | 3 |
|  |  |  |  | CRO | 1 |

## Halted — waiting on Steven (38)

- **F-E1-13** — The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through  
  *Re-pointing r2-lead-response-watchdog, lead-triage-daily, r11-isa-kpi-compile and showing-sync from Follow Up Boss to Lofty needs a Mac-side task edit plus the LOFTY_API_KEY in ~/.config/lofty/.env, which cannot be reached or verified from the cloud.*
- **F-E1-14** — The backup card's copy-prompt targeted ~/Applications/command-deck-backups with a 12-week retention, and its empty state described the weekly task as though it worked. The truth: r  
  *A scheduled task that has never run dies on its first permission prompt; only Steven can open r6-weekly-backup in the desktop app and press Run now once to approve its tools. Months of hand-entered data currently have one same-disk copy, 8 days old.*
- **F-E1-18** — The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only becau  
  *Diagnosing and re-running a failing Mac runner task needs access to the Mac and its task logs; a scheduled run that dies on a permission prompt can only be cleared by Steven pressing Run now once in the desktop app.*
- **F-E11A-02** — Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cro  
  *Changing the backup cron and moving the backup root are Steven's decisions; pruning or moving existing backup folders is irreversible.*
- **F-E4a-02** — No loftyLeads document exists in the live store (checked against all 161 exported docs, 2026-09-22 08:10 UTC) and no lofty-crm-sync task exists under claude-runner. The Mac has lof  
  *Needs the Lofty API key (Lofty → Settings → Integrations → API) placed in ~/.config/lofty/.env on the Mac. A credential cannot be obtained or verified from this sandbox.*
- **F-E4a-04** — The Composio Zoho connection is ACTIVE (created 2026-09-21) but every CRM call returns HTTP 403 NO_PERMISSION: Crm_Implied_Api_Access — re-verified 2026-09-22 08:17 UTC against ZOH  
  *Requires a permission change inside Steven's Zoho CRM admin console. Not doable from the deck, Composio or this sandbox.*
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
- **F-E3-06** — Baseline 2026-09-12 · verified 2026-09-22. Per brief §2 there are no Plaid API keys, and the 161-doc live export contains no plaidBalances document at all — it has never been writt  
  *Live balances need Plaid Production credentials — money and a vendor account. Steven only: dashboard.plaid.com → Team Settings → Keys, then ~/Applications/plaid-bridge/.env.*
- **F-E4a-12** — CLI-Anything is installed on the Mac as a Claude Code plugin (toolbox status RUN, commands only, no hooks), but its hub carries no CRM or real-estate entry (README checked 2026-09-  
  *Installation and credential entry must happen in a Claude session on Steven's Mac; ECC security review is required before any non-read-only action is enabled.*
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
| F-E1-13 | Plugin/Integration | The speed-to-lead card measured 'time from a Follow Up Boss lead arriving to first contact' and its empty state said it fills once the watchdog runs 'reading Follow Up Boss through Composio'. Follow Up Boss was retired 2026-09-22 in favo... | P1 | M | Broken | Escalated | Pending | 2026-09-22 | Integration Engineer |
| F-E1-14 | Routine | The backup card's copy-prompt targeted ~/Applications/command-deck-backups with a 12-week retention, and its empty state described the weekly task as though it worked. The truth: r6-weekly-backup (Sundays 5:00 AM PT) has NEVER RUN under ... | P1 | S | Broken | Escalated | Pending | 2026-09-22 | Steven |
| F-E1-18 | Routine | The task that is supposed to write six of the dashboard's daily research feeds has been in error since 2026-09-17 (last end 2026-09-17T19:04:11). The feeds are not empty only because a Claude session filled them by hand - every one of th... | P1 | M | Broken | Escalated | Pending | — | Steven |
| F-E11A-02 | Routine | Backup spec vs reality drift: Steven's spec is Sunday 00:00 local into Documents/AI-Ecosystem-Backups/YYYY-MM-DD with an 8-week rolling window; the Mac task r6-weekly-backup is cron 0 5 * * 0 (Sun 5:00 AM PT), has NEVER run under claude-... | P1 | S | Broken | Escalated | Fail | — | Steven |
| F-E11A-03 | Routine | Every skill written this cycle registers a nightly self-test, but nightly-self-test itself is in error — timeout, exit 124, last end 2026-09-15 — and loopLog cycle 3 records that no selfTest doc has ever been confirmed written. Each self... | P1 | M | Broken | Open | Fail | — | Reliability Engineer |
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
| F-INT-08 | Current State | Every prior cycle concluded that an unattended cloud routine cannot write the artifact database because the write parks on a permission prompt. The conclusion was never re-tested after the platform changed, yet the whole architecture res... | P2 | S | New | Implemented | Pending | 2026-09-22 | Integration Engineer |
| F-INT-09 | Skill | Three skills had been listed on the dashboard as queued since 2026-09-07 and never built: interview-me, prompt-master and skills-refresh. The orchestration, backup, improvement, scale, loop and stress-test skills existed only as prose in... | P2 | L | Missing | Implemented | Pass | 2026-09-22 | Capability Engineer |
| F-E1-05 | Stale Content | The Bears tracker still showed preseason state ('2-1 (preseason) - regular season opens Sun Sep 13', 'Regular season not yet started (NFC North 0-0-0)', a Sep 7 injury report) and its stat tile was labelled '2025 record'. The liveFeeds b... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Reliability Engineer |
| F-E1-17 | Stale Content | The referral blueprint and webinar marketing stack still named Follow Up Boss as the CRM. Steven replaced Follow Up Boss with Lofty on 2026-09-22. These are plan text rather than a number sourced from FUB, so the lines now name Lofty and... | P3 | S | Stale | Fixed | Pass | 2026-09-22 | Integration Engineer |
| F-E1-21 | Current State | Reviewed the whole panel for stale claims as assigned. It carries no dated assertions, no capability claims and no references to retired systems: every tracker renders from its own document (dmaicProjects, kaizenBoard, downtimeFound, cpi... | P3 | S | New | Open | Pass | 2026-09-22 | Reliability Engineer |
| F-E3-10 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned: the licence & credential tracker already sorts by expiry and flags EXPIRED in red for any past date, red ≤30 days, amber ≤90 days, green beyond. Against today no row is expi... | P3 | S | New | Improved | Pass | 2026-09-22 | Steven |
| F-E3-11 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned and left unchanged: the VA table is stamped 'Effective Dec 1, 2025 (2.8% COLA)' and its 100%-plus-SMC-K figure ($4,078.45/mo, $48,941.40/yr) reconciles exactly with the Milit... | P3 | S | New | Improved | Pass | 2026-09-22 | Capability Engineer |
| F-E3-12 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Checked as assigned, NOT edited (panel-aiteam belongs to E6). openrouterCredits reads {state:'no_key', ok:false, checkedAt 2026-09-16} and councilPricing carries a real 2026-09-16 price table fo... | P3 | S | New | Open | Pass | — | Steven |
| F-E3-13 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Out of my regions — routing to the integrator. The chamber & association table prints its third column as raw text ('Active', 'Expires 2028-08', 'Renews 2027-07-06', 'Renews 2027-07-04') with no... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E3-15 | Stale Content | Baseline 2026-09-12 · verified 2026-09-22. Out of my regions — routing to the integrator. The DMAIC Define-phase note for 'Speed-to-lead response time' reads 'needs a real timestamp-to-first-contact metric pulled from FUB/Zoho before thi... | P3 | S | Stale | Open | Pending | — | Integration Engineer |
| F-E3-17 | Current State | Baseline 2026-09-12 · verified 2026-09-22. Ownership overlap flagged, deliberately NOT edited. The Top performers card is physically inside panel-personalaccounts (my HTML region) but its data is TOP_PERFORMERS / liveFeeds.topPerformersL... | P3 | S | Recommended | Open | Pending | — | Integration Engineer |
| F-E4a-13 | Current State | Composio still lists follow_up_boss among the twelve connected apps and reports it ACTIVE, even though its credentials have been rejected since 2026-09-16 and the product is retired as of 2026-09-22. Composio has no Lofty toolkit at all ... | P3 | S | Recommended | Open | Pending | — | Steven |
| F-E4a-15 | Current State | Per the editing rules the ids fubSyncNote, fubStageStats, fubNewCount, fubNewLeadRows and the identifiers FUB_SYNC_AT, FUB_STAGE_TOTALS, FUB_NEW_LEADS_90D were kept rather than renamed; they now live inside the collapsed retired-history ... | P3 | S | New | Implemented | Pass | 2026-09-22 | Integration Engineer |
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
After: A one-shot probe routine that attempts a single named write, reads it back, and reports true or false with the verbatim error. Whichever way it lands, the answer is recorded rather than assumed.  

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

- Stale Content: 49
- Bug: 35
- Current State: 34
- Routine: 21
- Plugin/Integration: 18
- Automation Opportunity: 13
- Skill: 9
- Orchestrator Agent: 8
- Unlisted Capability: 8
- ISA Coverage: 7
- AI Clone: 3
