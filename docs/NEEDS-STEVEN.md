# Needs Steven — the one list (2026-09-22)

Written 2026-09-22 ~15:15 UTC by X2 from all 610 findings (cycle 6 plus today's engineering pass;
the full table is `docs/MASTER-FINDINGS.md`). One line per item: **what** · why only you · the exact
action · the finding ids. Ordered by deadline first, then by how much each unblocks. Nothing on this
page can be done by an agent — every line needs a paste on the Mac, a click in claude.ai, a credential,
an account change, or a decision. The corrected prompts and the checks that prove them are already
written; each line names the file. Everything else from today is either done or queued to the
integrator.

## Disclosure — DECIDED 2026-09-23, kept here as the record

0. ✅ **RESOLVED BY STEVEN, 2026-09-23 — the 15 client names stay on the lead board, in full.**
   Asked to choose between label form (`J. Whitfield`), first-name-plus-last-initial and full names,
   he chose **full names**, and chose to recover exactly the 15 rows removed earlier that day rather
   than re-enter them, with Zoho filling in from here. Live in **Command Deck v151**; the artifact is
   private (`readable by only you`, confirmed at publish). Recorded as a dated entry in
   `context/decisions.md`, which also scopes it: a **name and a stage** is the whole of what was
   agreed — no address, loan amount, rate, credit detail, account number or document identifier joins
   them, and the label rule still governs every other surface, the ISA Portal included.
   **Nothing here needs doing.** Two consequences he accepted, recorded so they are not a surprise
   later: the names travel into every published artifact version and into the weekly deck backups
   under `Documents/AI-Ecosystem-Backups/`, and a version already published cannot be unpublished —
   an agent can delete a whole artifact but not one version of it. If the link is ever shared, the
   names go with it. The original finding, and the reasoning for the removal, are below, unchanged.

   <details><summary>The original disclosure, as written 2026-09-23 before the decision</summary>

   🔴 **15 named client leads were published in the Command Deck and are still in its version
   history.** Each was a real first+last name with a stage and two timestamps, pasted from the Zoho
   kanban on 2026-09-14 and baked into the page's own source as `ZH_SEED`. Because no `zohoLeads`
   document exists, the board fell back to that seed, so the names rendered for anyone who could
   open the artifact — and they sat in the page source whether the board was opened or not. This is
   the same defect already fixed in the ISA Portal; this panel was missed at the time.
   **Already done, no action needed:** the rows were removed and the deck republished as **v148** on
   2026-09-23, verified by re-reading the page; the aggregate stage counts were kept, because
   aggregates are safe to report where individuals are not. The `isaKpi` document, which also named
   a client in a rendered KPI note, was corrected in the store the same night (now version 2).
   **What is yours, and why only you:** (a) **decide what happens to versions v147 and earlier** —
   artifact version history is retained and still contains the names; an agent can delete the whole
   artifact but cannot remove one version, and deleting it would destroy the URL and the 174-document
   store, so this is a judgement call, not a chore; (b) **the weekly deck backups** under
   `Documents/AI-Ecosystem-Backups/` were taken while the seed was live and hold the same names —
   decide whether those are purged; (c) decide whether anyone outside you has ever had access to the
   artifact link, which determines whether this was an exposure or only a latent one.
   · F-P4-01.

   </details>

## Clocked — in deadline order

1. ⏱ **Before Wed 2026-09-23 12:20 UTC (05:20 PT)** — the Mac task `strava-daily-sync` writes `stravaSnapshot` without the `{v:…}` wrapper and will overwrite today's hand repair (document v9) on its next run · the task prompt lives only on your Mac · **paste** `routines/mac-task-repairs.md` §1 over the task's prompt, then after the 12:20 run ask a Mac session the one-line check in §1 · F-W2-01, F-M5-01, F-M5-02, F-FR2-15, F-E5-02, F-E7-03, F-E8-29.
2. ⏱ **Today 18:06 UTC, then 09-23 18:00, then 09-25 / 09-27** — nine cloud routines died 5–10 s after firing on 09-18/09-21 (one startup cause, not nine bad prompts); the four created via `http_api` (Vanessa ops review, Weekly Loop QA, Next Big Moves, Elite Affluent) can only be edited or disabled by you · **do nothing yet**: read `routines/mac-task-repairs.md` §7; Project Risk Review's 18:06Z firing today is the free test — if it dies again in under ~30 s the outage is live and the four links in §7 are yours to disable or re-create; if it runs, drop it · F-W2-07, F-E8-64, F-INT-02.
2a. ⏱ **Before Fri 2026-09-25 4 PM PT (23:00 UTC)** — three routines made in the claude.ai web UI still name the retired CRM, and the platform refuses every agent edit to them ("Agents can only update routines they created", 2026-09-24) · the Friday ops review is the one on the clock: at 4 PM it tells the whole C-suite that real estate runs on the old CRM · **open each link, replace the old text with the new, save** — five lines in all, exact text in `routines/fub-removal-2026-09-24.md`: ops review https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs (1 line) · weekly self-improvement loop https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX (1 line) · Steve twin https://claude.ai/code/routines/trig_0174717mnSfAk1LtQQVJhH7r (3 lines; disabled — edit it before item 17 turns it back on; leave its `fub` data key alone, item 21b) · Steven's instruction, 2026-09-24.
3. ⏱ **By Fri 2026-09-25** — the ISA seat: nine messages on the line, all yours, zero ISA-authored ever, scorecard never filled · a staffing decision · **send** the outreach draft in `docs/ISA-SEAT-DECISION.md`, **pick** a course of action (1–4; the packet recommends 1 today), and **retime or switch off** the Mac task `r3-eod-rollup` that posts the nudge as you · F-E6-07, F-E8-06, F-E8-72, F-E4b-19, F-FR2-08, F-E12-15.
4. ⏱ **2026-09-30** — business, not ecosystem: the Q3 multi-state licensing window (TX, VA, NC) closes; only the licensee can file · F-FR3-09. Later: NMLS renewal opens Nov 1 and the SMART CE deadline is **Dec 5** (today's pass corrected it from Dec 4) · F-FR2-07, F-FR2-09.

## One click or one paste — highest value first

5. **Zoho CRM API access** — every Zoho call returns 403 NO_PERMISSION, so the mortgage board has been the 09-14 paste for a week · only a Zoho admin can change a profile · **tick** Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → "Zoho CRM API Access" (do item 20a first) · it also gates the first live run of `cli-anything-zoho`, which exits 4 with this exact click path and never retries into the 403, and the token helper it needs cannot be run until the OAuth values exist either · F-E12-05, F-E4a-04, F-E6-13, F-E8-02, F-INT-03, F-M4-27, F-X2-10, F-H2b-02, F-H2b-07, F-H2b-13.
6. **Lofty API key** — no real-estate lead number exists anywhere until it does · a credential that must live on your Mac · Lofty → Settings → Integrations → API, **paste** the value into `~/.config/lofty/.env` as `LOFTY_API_KEY` (`MAC-SETUP.sh` creates the empty file, chmod 600), then **run** `lofty-crm-sync` once · the same key is the only thing gating the first live run of `cli-anything-lofty` (GET-only; `lofty-bridge` stays primary) · F-E4a-02, F-E12-22, F-E1-13, F-E4b-07, F-E4b-18, F-E6-14, F-E8-01, F-S1-11, F-V1-02, F-H2b-13.
7. **Old "Pipeline Sync" cloud routine** — reports SUCCEEDED four times a day and syncs nothing (its own prompt is research-only); created via `http_api`, so every agent attempt to disable it was refused (three times) · **click disable** at https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE · F-M5-08, F-W2-10, F-E12-10.
8. **Strategy-cycle routine** (`trig_011CXFHCT3hou6uaCfb5rWkC`, `http_api`) — succeeds every weekday and has no write step; `strategySnapshot` has been frozen since 09-16 · only you can edit it · **paste** `routines/mac-task-repairs.md` §5 over its prompt · F-W2-05, F-FR2-16, F-M4-24.
9. **`r4-quantvue-sync` is refused, not silent** — the other writer of `strategySnapshot`; the runner denies it a tool or path · the allow-list is on your Mac · **paste** the check in `routines/mac-task-repairs.md` §4 on the Mac and fix what it names; leave r4 disabled until one writer is chosen (item 8 first) · F-W2-04, F-M5-09.
10. **`runnerStatus` stamps are seven hours wrong** — the runner writes Pacific wall-clock time with a `Z`, which made a live Mac look dead for the whole audit · a Mac-side script · **paste** the diagnostic sequence in `routines/mac-task-repairs.md` §2 (the fix is `date -u`) · F-W2-02, F-M5-06, F-X2-03.
11. **`CLI_HUB_NO_ANALYTICS=1`** — CLI-Hub's telemetry is opt-out and reports this Mac's hostname on install and every call · your shell profile · **add** `export CLI_HUB_NO_ANALYTICS=1` to `~/.zprofile` (or `.zshrc`) and to the cli-anything runner task's env, before the first `cli-hub` command · F-S1-05, F-W2-12, F-V1-09.
12. **`isaLadder.updatedAt` stamps a slot time, never the write** — the ladder's only proof-of-life is worthless · one line: the routine was agent-created (`meta_mcp`), so either **paste** `routines/mac-task-repairs.md` §6 yourself or **say** "let the coordinator apply §6" (two engineers disagree on who may) · F-M5-07, F-W2-06, F-X2-05.
13. **Wrapper check inside Pipeline Sync (live)** — one extra `list` of `state` plus "every doc's top level is a single `v` key" in the routine that already reads the DB four times a day catches the next bare write within six hours · a routine edit · **paste** the sentence from `always-on/README.md` ("The standing check this needs") into `trig_01M5zR1Po44gnHvTwA9ogZaB`'s prompt, or authorise the coordinator · F-M5-05.

## Decisions — one line each

14. **Apple Health** — `r8-apple-health-snapshot` reports ok twice a day and writes nothing (the ingest daemon died 09-13); the Notion phone route is built, its database exists and is empty · **decide** Branch A (retire r8 and `health-full-analysis`, use the phone — recommended) or Branch B (restart the daemon) per `routines/mac-task-repairs.md` §3; then **do the first phone run** (open Claude on the iPhone, say "update my health stats", grant the Apple Health read and Notion write once) and **create and enable** the Mac task `health-notion-sync` from `integrations/mac-task-specs.md` §3 · F-W2-03, F-M6-15, F-E5-08, F-E5-11, F-E8-08, F-M4-28.
15. **Google Drive** — never wired: no connector, no key, no row anywhere, while two Mac tasks claim to read a Drive "Second Brain" folder and the fabric tile counts it at 0 files (a false green) · a Google OAuth grant is yours · **decide** wire it as a read-only source (`integrations/google-drive-brain.md`) or drop the Drive line from the counts · F-V1-01.
16. **Real Estate Weekly Brief** routine — *corrected 2026-09-24:* it does carry connectors (Google Calendar and Gmail; "agent-created carries none" was disproved), and it was rewritten 2026-09-23/24 so it no longer touches the retired CRM — it reports the CRM as "not connected" until Lofty has a key (item 6). What is still wrong: its proving run **hung** (PENDING, no `finished_at`, nothing written), the same way it hung on 09-21 · **decide** let Monday 16:30 be its last proving run and retire it if it hangs again, or retire it now; same call for the three stock templates (Ops Issue Review, Project Risk Review, Books Reconciliation) — recommended: retire the templates · F-W2-08, F-W2-09.
17. **Re-enable the hourly cloud ISA bridge and the Steve twin routine** — both were disabled on the belief, disproved today, that unattended cloud writes park on a prompt; the bridge would carry the ISA line outside the Mac's 7:37 AM–9:37 PM window · enabling a routine (the twin's Gmail step still needs a connector, so that one wants a web-UI-created routine) · **decide and enable** `trig_01VpcvVPTrbdfvdbXn1mD7hB` (bridge) and `trig_0174717mnSfAk1LtQQVJhH7r` (twin) · F-M4-05, F-M4-06, F-M4-07, F-E12-15, F-INT-08.
18. **Weekly backup** — the cloud writer took a verified backup today (Sundays 11:00 UTC, 8-week prune, cloud path); the Mac task `r6-weekly-backup` still has never run · **decide** that the cloud schedule and root replace the "Sunday 00:00 local, Documents/AI-Ecosystem-Backups" spec, and disable r6 (the old "press Run now" requests are superseded) · F-E11A-02 (F-E1-14, F-E7-12, F-E8-05 closed today).
19. **`context/decisions.md`** — the file declares itself append-only, but its 2026-09-22 CRM entry was rewritten in place to remove the old vendor's name · **decide** accept the rewrite, or restore the original and append a superseding entry · F-L3-05.
20. **Composio account** — (a) rotate the credentials and re-authorise after Composio's disclosed 2026-05-21 incident, before item 5; (b) ~~delete the retired real-estate CRM connection~~ **done 2026-09-24** — Composio reports no remaining accounts for it; what is left is revoking its API key inside that CRM's own settings · account actions · F-INT-05, F-L3-07, F-E4a-13, F-E8-59.
21. **Retired-CRM residue** (Lofty replaced it today): (a) **392 lines / 716 mentions** in 33 dated audit records under `docs/` (findings, master table, reports, logs; the coordinator's count was 395) — purge as a set or leave them as history; (b) the `fub` saved-state keys in both dashboards (`c.fub`, `clientFub`, the `"fub"` sync-target id) — keep, or authorise a migration plus the matching `showing-sync` task change; (c) the `fub-followups` skill folder on the Mac — rename and port to Lofty; (d) the legacy calendar's name inside Google; (e) the 39 lead rows that may persist in deck backups and the artifact DB — purge or keep · F-L3-04, F-X2-16, F-L1-04, F-L2-03, F-L3-03, F-L1-05, F-L3-02, F-E11A-06, F-L1-08, F-L1-02, F-L1-06.
22. **Lead line and forwarding address** — the ISA was told to use a calling line and a forwarding address that lived on the retired CRM; whether they route through Lofty now is unknown · **confirm** on the ISA line where that number rings today and what the forwarding address is now · F-E12-04, F-L2-08, F-L3-12.
23. **Mac task prompts → Lofty** — the repo mirrors of `lead-triage-daily`, `r2-lead-response-watchdog`, `r11-isa-kpi-compile` and `showing-sync` now say Lofty; the live prompts on the Mac still name the old CRM · **edit** the four prompts on the Mac (text in `docs/inventory/mac-task-descriptions.md`), after item 6 · F-L3-06, F-E1-13.
24. **ISA self-grades** — `isaGradingScores` / `isaKpiSopActuals` are now carried by the live sync but reach nobody · **decide** whether they come to you automatically · F-E12-21.
25. **ISA Portal access, if the seat is filled** — the portal is private by default and "has no push to her" · **share** https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041 with the ISA's login once item 3 settles · no finding records this step; it follows from the outreach draft in `docs/ISA-SEAT-DECISION.md` — verify before acting.
26. **Client identifiers in the audit corpus** — X2 redacted the master table and its data twin today; the source rows (`findings-E12.json`, `findings-L1.json`) and the live `auditFindings` document in the deck's store still carry them · **decide** purge (re-seed the document from the regenerated twin) · F-X2-09, F-FR3-11, F-L2-01.
27. **Mentor naming** — the deck says Kevin, the installed skill says Cole · **pick one** · F-E5-12, F-E6-30, F-E8-21.
28. **Licence renewal dates** — only you can confirm them from the source documents; writing them from a second store would be a guess on a licensing surface · F-E4b-14.
29. **OpenRouter council seats** — need an API key and a funded balance · **decide** fund them or leave the outside-model seats off · F-E3-12.
30. **Plaid / bank data** — Plaid production keys (money plus a vendor account) or a bank CSV export · F-E3-06, F-E8-43.
31. **Canvas iCal URL** for the USC deadlines, and **Google Calendar sharing** (the work calendar shares free/busy only; the SPACE CA subscription is broken) · account settings · F-E8-44, F-E1-20.
32. **Cloud egress for research sessions** — every freshness pass today ran blind (lender, agency, weather and news domains blocked; the WebSearch budget exhausted), so figures were baked from search-indexed copies · **decide** allow-list a handful of primary domains for cloud sessions, or keep those refreshes on the Mac tasks · F-FR1-11, F-FR4-10, F-FR2-18, F-FR3-12, F-E2-09.
33. **riskMonitor** — wire the prop-firm accounts (credentials and a data path per firm) or leave the daily trading log manual · F-E2-11.
34. **Optional tools** — each is an install or a spend on your Mac: Headroom, Graphify, CodeBurn, Claude Code Setup (first to promote), Ponytail (held on policy), prompts.chat (held on value), Screenshot-to-Code (needs a provider key), Strix (needs an LLM key, Docker and a written target authorisation), Agent-Reach (drives logged-in social accounts), Laya (not recommended), Higgsfield (a funded account); verdicts and commands are in `MAC-INSTALL-tooling.md` and `MAC-INSTALL-comms-data.md` · **confirm** the two refusals stay refused: vphone-cli (needs SIP/AMFI off on the Mac holding the keychain) and Agent402 (spends money by design); and **decide** whether find-skills' `-g -y` install step gets a HALT note · F-FR5a-01…05, F-FR5a-09…12, F-FR5a-15…17, F-V1-03, F-V1-07, F-V2-05.

## Mac session work — only you have the Mac

35. **Run the installer** — `./MAC-SETUP.sh --dry-run` and read it, then `./MAC-SETUP.sh --only codeburn` as the cheap first step, then `./MAC-SETUP.sh`, then `./mac-verify.sh`; neither script has ever run on macOS · then work the NEEDS-STEVEN list the installer prints (Homebrew, `graphify install`, `headroom wrap`, plugin installs, LaunchAgents, key values, `~/.local/bin` on PATH) · F-M3-01, F-M3-05, F-M3-10, F-M3-13, F-V1-10.
36. **Do NOT enable the OmniRoute failover yet** — its PII gate fails open (argument order, no `--task`, renamed client tasks) and two paths strand the Mac on free providers with no alarm; a rewrite is in the working tree, uncommitted, awaiting its findings file · **skip** the installer's `omniroute` step, do not replace the existing `claude-auto`, keep the runner on plain `claude`, and do not paste the four OmniRoute key values until the widened canary (`integrations/omniroute-failover/README.md`, "PII canary") passes with the security steward · F-V2-07…18, F-V2-20, F-FR5b-05, F-FR5b-06, F-M3-03, F-M3-09, F-E8-60, F-X2-19, F-X2-20.
37. **`taskLease` before Mac #2's runner is enabled** — nothing stops two Macs running the same 59 tasks and double-writing `ciLog`, `isaLine` and every feed · **create** the `taskLease` document and add the LEASE CHECK block from `REMOTE-ACCESS.md` to the top of every task prompt (Mac #2 as STANDBY, per `docs/SECOND-MAC-SETUP.md` steps 11–12); reconcile the 59-vs-60 task count against the runner on Mac #1 · F-M1-05, F-M1-09, F-M1-06.
38. **CLI-Anything** — the hub, plugin and the vendored browser harness are now a scripted step (item 35), and **seven** pre-built read-only packages exist — homes.com, ShowingTime, Showami, SkySlope, zipForms, Lofty, Zoho (`integrations/cli-anything-harnesses/`) · **nothing is generated any more**; `/cli-anything` is only for a target we do not have · your steps: install the DOMShell Chrome extension and **sign in by hand** (never through the tool; the harnesses cannot sign in, MFA/SSO is a HALT, and ShowingTime is MLS-SSO'd), **accept in writing** that DOMShell can see everything those signed-in sessions can, let `./MAC-SETUP.sh --only cli-anything-harnesses` install all eight into `~/Applications/cli-anything-harnesses/.venv` (browser first, one command), export `DOMSHELL_TOKEN` (a credential the script never touches) and `CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true` in the harness env, then run `--discover` once per recipe and edit your `paths.json` until the values match the screen — **all 18 browser recipes ship `verified: false` and no site has ever been reached**, so nothing they return may drive a decision before that spot-check; every outward verb (request, confirm, cancel, feedback, post, e-sign, send, fill) stays off until you approve it in writing, one verb at a time; then run the new `cli-anything-status` task once by hand (`routines/mac-task-repairs.md` §9) — the deck's connector card has never been told anything and only a Mac run may tell it · F-S1-06, F-S1-07, F-S1-08, F-S1-09, F-S1-15, F-S1-18, F-H1-01, F-H1-02, F-H1-08, F-H1-10, F-H1-11, F-H2b-03, F-H2b-13, F-M3-11, F-E4a-12, F-E8-58.
39. **ECC security review sign-off date** — SkySlope and zipForms are the two connectors that touch legally binding documents, and both harnesses refuse **every** live command (exit 3, `connState: disabled-by-policy`) until the review has a date; the deck's connector card clamps them to `disabled-by-policy` for the same reason · the review is Elena's lens but the sign-off is yours, and it is a licensed-risk decision · **hold** the ECC review (what each harness can reach, what it stores, what a prompt-injected page could make it do), then `export CLI_ANYTHING_ECC_REVIEWED_AT=YYYY-MM-DD` in the runner's env with that real date and record the same date as `eccReviewedAt` in `cliAnythingStatus`; do not set it to make a command run · F-S1-10, F-H2b-13, F-FR5b-11, F-M3-11.
40. **WhatsApp channel to Vanessa** — spec written (whatsapp-cli reading the WhatsApp desktop app) · **DECIDED 2026-09-23: his own number in a message-yourself thread, not a dedicated one** (`context/decisions.md`; the Full Disk Access cost was stated and accepted). Build **§5a**, not §5 — §5's `is_from_me:false` filter cannot run in a self-chat. Link it in WhatsApp desktop on the Mac, **audit the existing Full Disk Access list before adding to it**, grant FDA + Accessibility, run `integrations/whatsapp-selfchat-setup.sh "<your number>"` (settles §5a's one unmeasured assumption and prints the seed doc), then run the task once by hand · F-FR5b-01.
41. **Re-verify from the Mac what the cloud could not open** — the CRMLS active-listing counts (F-FR1-02), the ETF screen (F-FR1-06), TradingView 3.4.1 (F-FR1-07), a 30-second look at Navy Federal's rate page to settle whether the deck's "Sep 20" or the portal's "Sep 22" is right (F-FR1-09, F-FR3-03, F-X2-06), the Meritage promotion page the deck and portal describe differently (F-FR1-04, F-FR3-02, F-X2-07), and the NWS alerts for DC and New Braunfels (F-FR4-02).
42. **Runner allow-list and LaunchAgent** — `steve-twin-sweep` and `ops-knowledge-graph` are refused writes to `~/Shearrill-Vault`; widen the allow-list on the Mac; and install the runner's LaunchAgent so scheduled tasks fire without the desktop app open · F-E6-09, F-E8-52, F-E8-65.
43. **Two weekly tasks that have never written their document** — `revenue-scan-weekly` (Sun 05:40 PT) and `health-coaching-weekly` (Sun 06:30 PT) are both registered and enabled on the runner and both show `lastEnd: null`; `revenueScan` and `healthCoaching` do not exist in the store, which is the last Degraded row on the stress sweep — a document that was never written cannot be restored. Both were already registered at the 2026-09-16 toolkit sync, so the Sunday 2026-09-20 slots passed with nothing run: waiting for 09-27 will not fix it (F-E8-39’s "first slots fall 2026-09-25 to 2026-10-01" is wrong for these two) · **open the desktop app’s Scheduled section, press Run now on each, and approve every tool as it asks** — approvals from a Claude session do not transfer and a scheduled run cannot ask anyone — then **paste** `routines/mac-task-repairs.md` §10 and §11 over/onto the two prompts (each amendment is additive and names the document, its exact shape and the `{v:…}` wrapper; the live prompts are on your Mac and could not be read from the cloud). Health coaching is downstream of item 14 but worth running first: with the Apple Health ingest down, the correct result is a brief that says so, and the card has a banner built for it · F-P3-01, F-P3-02, F-P3-03, F-P3-05, F-E7-11, F-E8-39.

## Compliance — Alexandra drafts, you decide

44. Terms and robots.txt for homes.com, SkySlope and zipForms before any wrapper touches them (F-FR5b-11, F-M3-11); consent and disclosure review before any Lofty AI Sales Agent pilot (course of action 3 in the ISA packet, F-FR2-07).

## Resolved today — nothing to do, so older messages that asked can be ignored

- The weekly backup: taken and verified by the cloud writer on 2026-09-22 (`backupStatus` GREEN) — the "press Run now on r6" requests are superseded · F-INT-07.
- "Cloud routines cannot write the database": disproved by measurement at 09:05 UTC · F-INT-08; every deck, wiki and register statement of it was corrected today (F-M4-01…23, F-M5-11, F-W2-14).
- The ISA Portal sync false green: the live Pipeline Sync routine now writes and verifies both stores · F-E12-10, F-E12-11, F-E12-12 (the old routine still needs your click — item 7).
- `stravaSnapshot`: repaired to `{v:…}` at version 9 · F-FR2-14 — it holds only until item 1 is done.
- The client rows and the retired vendor's card are out of both dashboards' page source · F-L1-01, F-L2-01, F-FR3-11 (the repo's mirror copy of the portal is still the old file; the integrator replaces it — F-X2-02).

## Vanessa's voice off the dashboard — added 2026-09-22 by P5 (append-only block)

The iMessage half of `integrations/vanessa-voice-everywhere.md` was verified on 2026-09-22 without
sending anything: Inkbox accepts the encoding Seed Audio actually produces, and a 27-second clip is
**1 %** of the 10 MiB attachment cap. Nothing on the Mac was changed. These four lines are what is
left, and each one is yours.

45. **Paste the two prompt amendments** — `integrations/mac-task-specs.md` §6a into
    `vanessa-imessage-inbox` and §6b into `voice-reply-render` on the Mac. This is the whole change;
    everything below is a caveat on it. Before you paste §6b, read the one trap that is now proven:
    the store holds the audio as a **data URI** (`data:audio/mpeg;base64,…`), and `inkbox_media_stage`
    **rejects** that — verbatim `invalid_base64: … Remove the data URI prefix; supply only the
    base64-encoded file bytes.` The renderer must pass only what is after the comma. Two more
    measured facts for the same step: a staged handle **expires in about 45 minutes**, so stage and
    send inside one run; and `content_hash` is an opaque token, not a checksum you can recompute —
    the field to check against the file is `size_bytes` · F-P5-01, F-P5-02, F-P5-03.
46. **Discord voice — decide, or leave it off.** There is **no media send path in this system**:
    Inkbox exposes no Discord tool, Composio's only Discord send tool (`DISCORDBOT_CREATE_MESSAGE`)
    has no file or attachment parameter at all, and its toolkit is not connected. Making it possible
    means a Discord **bot token** with SEND_MESSAGES and ATTACH_FILES and a new `multipart/form-data`
    upload path — a credential and a new outbound write, so it needs you. Recommended: leave
    `deliver: "discord"` unimplemented; she already answers there in text · F-P5-04.
47. **WhatsApp voice — recommended answer is no.** Beyond the channel not being live (item 40),
    `whatsapp-cli` has **no attachment verb even once installed** — it sends by opening
    `whatsapp://send?phone=…&text=…` and pressing Return, and that URL carries a phone number and a
    text string and nothing else. Voice there would need GUI automation attaching a file in the
    desktop app: a new outward verb on a client-capable app, fragile, and a HALT on two rules.
    Recommended: keep WhatsApp text-only · F-P5-05.
48. **Inkbox identity is named `jasmine`, not Vanessa** — the connected identity is the agent handle
    `jasmine` at `jasmine@inkboxmail.com`, and the iMessage connect command is `connect @jasmine`.
    Cosmetic for delivery, but it is the name a recipient sees, and nothing in the repo said so.
    Related: **`phone.assigned` is false and `sms_available` is false**, so SMS is not a fallback if
    an iMessage attachment ever fails — the fallback is the text reply, which already happens.
    **Decide** whether the identity gets renamed; renaming it is an account change · F-P5-09.

*Still unverified after this pass, and only a real run can close it:* whether `inkbox_imessage_send`
accepts an audio handle **with no text**, whether the `conversation_id` the inbox replied on is the
same identifier the send call wants, and whether the **full** 108 KB clip stages (the prefix did;
the arithmetic says yes with 97x to spare). All three are answered by doing item 45 and texting her
one question · F-P5-01, F-P5-10.
