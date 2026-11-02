# Automation optimization — 2026-11-02 (CPI weekly deep pass)

Steven, 2026-11-02: *"optimize all workflows, automations, cross functional tasks and so forth to automate as much as
possible especially with AI agents and add intergrations"*. Evidence read 2026-11-02 ~22:30 UTC: every cloud routine
(`list_triggers`, paged to the end), the Command Deck health docs, `bin/brain coverage`, `docs/AUTOMATION-MAP-2026-10-26.md`.
Nothing live was changed before Steven's yes — editing a live task is on the HALT list.

## The headline

The system does not lack automation. It has about **100 scheduled tasks** (68 recurring + 22 one-shot enabled, ~40 disabled)
and **61 Mac tasks**, and it is now **failing from its own weight**: 11 routines failed on the usage limit between 10-30 and
11-01, 6 monthly refreshes were abandoned, and the one session that carries 8 daily routines is at 788k of 1M tokens of
context, starting its runs 8–47 minutes late. More automation added on top would fail the same way. The optimization is
**fewer, sturdier routines**, each with one owner, then the new integrations on that base.

## Findings (evidence → fix)

| # | Finding | Evidence | Fix | Who |
|---|---|---|---|---|
| F1 | 8 routines (Big moves, 6D rebuild, layers sync, Fieldy, **Health 6:15**, hourly inbox sweep, sessions ledger, presence audit) all queue into one persistent session; a "SUCCEEDED" there means *delivered*, not *done* (finished 7–20 ms after firing) | session_01AycAMV 788k/1M context, usage `allowed_warning`; 11-02 starts +8/+37/+47 min late; the same failure parked Health 10-27→10-31 | Re-create each as a **fresh-session** routine with the connectors it needs, then disable the bound copy | Steven's yes → Claude |
| F2 | 22 "Log Zoho email to notes" one-shots + the daily VA-class notes task drive **Chrome on Zoho** and are bound to a session in a failed state | session_012MKDSG `status_bucket FAILED`, weekly limit hit; first one fires **2026-11-04 14:30Z** | Replace all 23 with **one weekly fresh-session routine** on the claude.ai **Zoho CRM connector** (read emails, write the "Email sent" note) — works the day the Zoho permission is ticked; until then it logs "blocked" instead of failing silently | Steven's yes + the Zoho tick |
| F3 | Duplicate jobs burn the allowance | 4 morning briefs (Hearth XpDNW, Vanessa 6:34 Q9VPM, Morning Launch LLpqK, Command Deck Brief JoMrj) + a Mac text; market recap ×3 (R1UfT, LmhuxX, freshness sweep step 3); Bears news ×5; ops review ×2 (V6QrF + Mac `vanessa-ops-review`); the 3 Sunday improvement loops the 10-20 map already asked to switch off (016qKE, 013vYC, W1KHi) | Keep one of each: Vanessa 6:34 (deck) + Hearth (phone); market close R1UfT; Bears in morning feeds only; ops review in the cloud; one Sunday loop (the weekly loop) | Steven's yes → Claude |
| F4 | Usage-limit failures | 016UF8, 015LRf, 011hRs, V6QrF (10-30); 0138Gg, KDp9o, TVFXo, 013ocJ, 019NdM, 013vYC, 016qKE (11-01) | F3's retirements free the headroom; move report-only seats to Sonnet per the model-tiering table | follows F3 |
| F5 | Monthly refreshes abandoned / never succeeded | HXTDA, RA64q, RsFft, VWeeh, RpEqU, ArqD9 ABANDONED (10-18/10-25); JvvDE never completed | Re-fire each once after F3 frees headroom; JvvDE gets its prompt read for the failure first | Claude after F3 |
| F6 | Two deck panels have no writer | `bin/brain coverage`: `inboxDesk` (Inbox & Meetings card), `tradingDeskReport` | inbox-triage agent writes `inboxDesk` from the hourly sweep (drafts only); trading desk weekly paper run spec for the Mac | Claude (spec) |
| F7 | Client phone numbers sit in a deck doc | `agentInbox` 2026-11-02 14:48Z: 17 of 18 items carry phone-number-like strings, against the no-PII rule | Redact to first names in place; stop the writer copying numbers | **Steven's yes** (touches client data) |
| F8 | Mac tasks refused / timing out | runnerStatus 11-02 21:06Z: `vanessa-sweep`, `brain-weekly-verify`, `health-coaching-weekly`, `mortgage-desk-weekly`, `r14-content-pipeline` (since 10-27), `vanessa-ops-review`, `weekly-self-update` refused; `ops-knowledge-graph` exit 124 | Needs the Mac (`connect-all.sh` REPORT); ops review retires under F3 | Steven runs one paste |
| F9 | The repo's routine docs no longer match reality | 23 live routines documented nowhere; 7 retired ids still listed; schedules drifted (Pipeline Sync, backup, brief, freshness sweep) | Regenerate `docs/inventory/cloud-routines` from `list_triggers` after F1–F3 land | Claude |
| F10 | The improvement loop proposes and never closes | `cpiOpportunityLog` 25 items, all "Proposed", stamp 10-30; `cpiCycles` speed-to-lead in "Plan" since 09-03 | This pass logs F1–F9 as Recommended with a measurement each; the Sunday loop measures them | Claude |
| F11 | The coverage register said Zoho had no writer | `brain/coverage/writers.json` zoho* rows "retired" while the Zoho CRM feed routine (QRFyr) has written `zohoSync` 4×/day since 11-01 | **Fixed in this commit**: rows now name the routine and the 403 block | done |

## Integrations — what to add, in order

1. **Zoho CRM connector** (claude.ai) — already connected and tested 4×/day; blocked only by the profile permission
   (`Crm_Implied_RetriveFor_ZohoMcp`). The day it is ticked: `zohoLeads`/`zohoDeals` fill on both dashboards, F2's routine
   replaces 23 Chrome tasks, and the mortgage lead flow (UNMONITORED in `routineHealth`) gets a monitor.
2. **Fieldy → CRM notes** (connector live): meeting promises into the chief-of-staff's Monday brief — already in the
   `meeting-recap-to-crm` skill; it needs F1's fresh-session move to stop running late.
3. **Lofty API key** and **iMessage link** — unchanged Steven steps (BIG-MOVES #1, #3); Lofty's newest lead is 08-21.
4. Not added: anything paid (Arive Pro, OpenRouter credits) or new account grants — HALT list.

## Measurements (closing condition for each)

- F1: start lag of the 8 routines ≤ 5 min for 7 days; Health tiles never > 30 h stale.
- F2/F3/F4: usage-limit failures per week 11 → 0 for two weeks.
- F5: 7 monthly refreshes with a successful run by 2026-12-01.
- F6: `bin/brain coverage` gaps 2 → 0.
- F7: `agentInbox` phone-like strings 17 → 0, stays 0.

## What was done after Steven's yes (2026-11-02, ~22:45–23:00 UTC)

Steven approved all four routine changes in chat and chose to leave the `agentInbox` phone numbers as they are (F7 closed
as "Steven's decision: leave").

| Item | Result |
|---|---|
| F3 retire duplicates | Most "duplicates" are not: each is the only writer of something. **Kept:** Morning Launch (`trig_01LLpqKxbAXmEQzG6iStS7a3`, the only Gmail-draft brief), market close (`trig_01LmhuxXi3waJWpZfqiCfgJH`, only writer of the movers/sector lists), the four Gridiron Codex tasks (they write their own artifact). **True duplicates, NOT disabled — blocked:** Command Deck Brief `trig_01JoMrjYotXAJfJ14MFFJMAf` (the auto-mode classifier refused), the two Sunday loops `trig_016qKE1TdRjzkpb2Yby8yWBX` and `trig_013vYCzVa3vbHZ8BZZy6UBpX` (created through the HTTP API; an agent can only change tasks it created). **Steven:** switch these three off at claude.ai/code/routines (saves 9 runs/week). |
| F5 monthlies | Re-fired once each at 22:47–22:48Z: HXTDA, RA64q, RsFft, VWeeh, RpEqU, ArqD9 and JvvDE (its only failure was the usage limit, not its prompt). |
| F1 move the 8 bound routines | **Not possible from Claude.** `create_trigger` refuses the `connectors` parameter for this organization, and a fresh run cannot push to chitown034/Repo (403 "not in this session's authorized repository set"). Tasks made in the claude.ai routines screen DO carry connectors (seen on `trig_01UiJfB8tvbxrAJCZDQhJTUp`: 29 attached). The 8 bound copies are untouched and still running. Four standalone fresh-session prompts are saved, disabled, for Steven to copy in the UI: Health `trig_015zgRj52iyQCgWSTKxALyqo`, 6D rebuild `trig_01JRH9xmg3nWQ9PBmFJhPxCi`, Big moves `trig_01AvXB4fpnnvZ6Qsog1KKTjN`, Presence `trig_01XaNSambPsvMorrobVL83sU`. The 6D test run published v99 and wrote `brain6dStatus` (normal outputs). |
| F2 Zoho Chrome tasks | New weekly task `trig_01VAGtRqjLsfKxfh1FXSM9Xf` (Mon 7:43 AM PT, fresh session) carries the whole 22-email schedule (`integrations/zoho-email-log/`); the 22 one-shots bound to the failed session are disabled. It has **no Zoho connector** (same `connectors` refusal), so until Steven attaches "Zoho CRM" to it in the routines screen it writes `zohoEmailLog` status "error" with a backlog — no email goes unlogged. The daily VA-class notes task `trig_01UiJfB8tvbxrAJCZDQhJTUp` was disabled by the agent and **re-enabled by Claude**: it was working (Chrome, all connectors) and also logs calls, which the weekly task does not. |
| New fix | 6D Brain Approve button fired the Big moves task retired on 10-25 (`trig_014QQGp4WQfWGDVB827R4Qb9`); now fires the live `trig_01XwFre24w9aKq5oVRq1FQ8s` (`dashboard/brain-4d/template.html`, 6D v100). |

### What only Steven can do now (each is one screen in claude.ai → Code → Routines)

1. Switch off the three true duplicates (Command Deck Brief, the two Sunday loops).
2. Attach the **Zoho CRM** connector to "Zoho email log — weekly (connector)", and tick the Zoho profile permission
   (`Crm_Implied_RetriveFor_ZohoMcp`) — that one tick turns on both dashboards' Zoho feed too.
3. For the overloaded session: copy the four saved prompts into new "new session each run" routines with the repo
   (push access) and their connectors attached, then switch off the bound copies — Health first.

Notes after review: the plain `bin/brain coverage` no longer lists the Zoho docs (they now have a named writer); with the
deck export (`--db`) `zohoLeads`/`zohoDeals` still show as stale gaps until Zoho allows reads, and `zohoSync` carries the
403 on the deck. The weekly Zoho task and the daily Chrome task never log the same email twice: the weekly one skips any
email already in a "Follow-up log <date>" note (prompt updated 22:55Z).
