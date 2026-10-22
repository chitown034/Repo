# Mac: make the ISA KPI numbers real, and keep the content pipeline honest — one paste (2026-10-08)

Steven, 2026-10-08: *"fix anything not working to include ISA kpi and content pipeline automations"*.

**What the cloud found (read from the live databases 2026-10-08 16:48 UTC).**
- Lofty is connected and `lofty-crm-sync` runs (`ok`, 54 leads, stage totals) — but every run says
  `firstResponse not computable: lofty_list_leads returns no lead id field … sample=0`. Without a lead id the
  timeline cannot be followed, so **speed to lead, the ISA's headline KPI, has never been measured**.
  Per Lofty's developer docs (summarised by a web search; the docs host is blocked from the cloud): lead ids are
  64-bit integers (must stay strings), and `/v1.0/leads/{id}/activities` is *site* activity only — calls, texts
  and emails are in `/v2.0/leads/{id}/activities`. The repo's Lofty harness and skill used v1.0; both are fixed in
  this change (`lofty-cli leads timeline <id> --v2`, ids returned as strings).
- `r11-isa-kpi-compile` (Sun 04:40 PT) last ran 2026-10-04 and was refused; the `isaKpi` document it wrote blames
  the retired CRM and a Lofty permission gate. Its live prompt and tool permissions live only on this Mac.
- The content pipeline itself works: `r14-content-pipeline` queued a compliance-reviewed draft at 05:50 PT today
  (`content-2026-10-08-veteran-equity`). Two drafts now wait on **you** (see the report block's last section).

Run `git pull` first (it brings the fixed harness, skill and this file), then reinstall the harness so
`--v2` exists: `./MAC-SETUP.sh --only cli-anything-harnesses`. Then paste everything between the two lines below
into Claude Code on the Mac, in the Repo folder. *Nothing in this file has run on a Mac yet.*

---- PASTE FROM HERE ----
You are fixing two things on this Mac for Steven: the ISA KPI numbers, and a check of the content pipeline.
Read-only wherever you can; ask Steven before you change any live task prompt or tool permission; never touch a
client-facing system (no CRM writes, no email, no calendar invites); never print a key value, and never print a
lead's name, phone, email or address. Lead ids are not printed either: print field NAMES and value TYPES only.

SECTION A - Lofty first response (lofty-crm-sync)
A1. Confirm the harness has --v2: lofty-cli leads timeline --help (or cli-anything-lofty if lofty-cli is not on
    PATH). If it does not, say so and stop this section; Steven re-runs MAC-SETUP.sh --only cli-anything-harnesses.
A2. Probe, three leads only: lofty-cli --json --raw leads list --page-size 3 . Report: the NAME of the field that
    holds a lead's id, its created-at field name, and whether the id arrives as a string or a number. Then take
    the first lead's id and run lofty-cli --json --raw leads timeline <thatId> --v2 . Report: the field names on an
    activity row, the field that says call / text / email, the field that says inbound / outbound, the time field,
    and the distinct VALUES of those two kind/direction fields across the rows you saw. If the v2 call returns 404
    or an empty list for all three, say so plainly - do not guess another endpoint.
A3. Write what you found into the "Verified field map" at the bottom of .claude/skills/lofty-crm-sync/SKILL.md in
    this checkout (dated, with the number of leads and activities you saw). Do not commit or push; the cloud
    session carries it into the repo from your report.
A4. Ask Steven to run lofty-crm-sync once (or run it, if the runner allows), then read state/loftyLeads: report
    status, leads, firstResponse.medianMin, firstResponse.over5, firstResponse.sample. If the lofty MCP list still
    has no id field, the task must take lead rows from lofty-cli (see the skill); if its live prompt does not say
    so, show Steven the exact sentence to add (from the skill's step 2) and apply it the way section 2.4 of
    integrations/mac-fix-all-2026-10-05.md does (desktop Scheduled section, or give the click path - never guess a
    file path).

SECTION B - r11-isa-kpi-compile (Sun 04:40 PT, last refused 2026-10-04)
B1. Read its live prompt and its last log. Report in one line each: (a) does the prompt still name the retired CRM
    (/v1/people, a Composio CRM call)? (b) does the log show a Lofty tool permission refusal ("Claude requested
    permissions ... you haven't granted it yet")? (c) which tools does lofty-crm-sync, which works, have allowed
    that r11 lacks?
B2. Propose (do not apply until Steven says yes) this prompt, and the tool list copied from lofty-crm-sync
    (read-only lofty verbs plus Artifact read/write on collection state; no web tools):
      [begin prompt] Use the lofty-crm-sync skill's rules. Read state/loftyLeads, state/leadTriage and
       state/isaKpi. If loftyLeads.status is not exactly 'ok', write isaKpi.metrics with every actual set to
       'not measured - Lofty not connected' and stop. Otherwise write isaKpi in its existing shape
       {metrics:[{name,actual,target,sample,note}], syncedAt, weekEnding} with source 'Lofty via lofty-bridge':
       (1) Speed to lead: loftyLeads.firstResponse.medianMin and sample; if sample is 0 or medianMin is null,
       actual 'not measured - no lead timelines yet' and say why in note. (2) Leads with a future task assigned,
       (3) Overdue tasks, (4) Appointments set in window, (5) Stage changes in window: only if a Lofty verb
       returns them; otherwise 'not measured - Lofty bridge exposes no tasks/appointments' (name the missing verb).
       (6) ISA self-report vs CRM delta: 'no self-report on file' unless isaLine holds one. Never carry an old
       number forward, never invent one, never report another system's figure as Lofty's. weekEnding is the
       Sunday just ended, syncedAt is now in UTC. [end prompt]
B3. After Steven's yes, apply it by the same route as A4, then run the task once by hand and report isaKpi.syncedAt,
    each metric's actual, and the task's lastStatus. A "refused" again means a permission is still missing: name it.

SECTION C - the other three Lofty prompts (report only)
C1. For lead-triage-daily, r2-lead-response-watchdog and showing-sync: read each live prompt and report whether it
    still names the retired CRM (/v1/people, followupboss, a Composio CRM call). Fix none; Steven decides.

SECTION D - content pipeline (r14-content-pipeline, Tue-Fri 05:45 PT)
D1. Confirm it is enabled, its next slot, and that today's run succeeded (it queued content-2026-10-08-veteran-equity
    at 05:50 PT). If lastStatus is 'limited', say so: that is the usage cap, not a defect.
D2. Read its live prompt. Report whether it (a) reads state/marketingQueue before drafting and skips any topic
    already present under any status; (b) only APPENDS rows and never edits or deletes one; (c) leaves status
    alone after writing 'awaiting Steven'. The deck now lets Steven set a draft to Approved or Declined, so (a)
    and (b) matter. If one is missing, propose the one sentence to add; apply only on Steven's yes (route as A4).

SECTION E - report. End with exactly this block, filled in, for Steven to paste back to the cloud session:
=== MAC ISA-KPI REPORT ===
lofty id field: <name, string|number> | lead created field: <name> | activity kind field: <name = values> | direction field: <name = values> | time field: <name>
v2 timeline: <worked | 404 | empty>   lofty-crm-sync after fix: status=<..> median=<..> over5=<..> sample=<..>
r11: names retired CRM=<y/n> | permission refusal=<y/n> | missing tools=<list> | prompt applied=<y/n> | last run after fix: <status>, isaKpi.syncedAt=<..>
other prompts naming retired CRM: lead-triage-daily=<y/n> r2-lead-response-watchdog=<y/n> showing-sync=<y/n>
r14: enabled=<y/n> lastStatus=<..> reads-queue-first=<y/n> append-only=<y/n> leaves-status=<y/n>
left for Steven's hands: <list or none>
---- PASTE TO HERE ----

## After you paste the report back
Paste the report block into the cloud session. It then commits the verified field map into the skill, and turns
the Sunday `r11` run into a real KPI refresh. Until the field map exists, nothing computes speed to lead — by
design: a made-up number on the ISA scorecard would be worse than "not measured".
