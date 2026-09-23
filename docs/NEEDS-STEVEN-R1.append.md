# Needs Steven — R1 append (cloud routines, 2026-09-23 ~03:05 UTC)

From the R1 reliability pass over the failing cloud routines. Full write-up with the evidence for
each line: `routines/cloud-routine-repairs.md`. Findings: `docs/findings/findings-R1.json`.

**Most of that pass needed nothing from Steven** — a `meta_mcp` routine is agent-editable, so the
five assigned routines were diagnosed and repaired in place. What is below is only what an agent
genuinely cannot do, plus two decisions and one correction to the record.

---

## Nothing in the existing runbook changes

I checked all six H-section and I-section items against the live platform. **Every one is still
correct, still needed, and still Steven's alone** — all four routine IDs named there are
`created_via: http_api`, which no agent can edit, fire or disable:

| Runbook item | Live check, 2026-09-23 03:03 UTC | Still needed? |
|---|---|---|
| Paste §1 over `strava-daily-sync` before 12:20 UTC | Mac task; unchanged by this pass | **Yes — deadline stands** |
| Click-disable `trig_018BSAYiYzvtyaUkpAY4SnqE` | `http_api`, **still enabled**; fired again 2026-09-23T01:07:54Z and reported SUCCEEDED having moved nothing — a fifth confirmation | **Yes** |
| Paste §5 over `trig_011CXFHCT3hou6uaCfb5rWkC` | `http_api`, enabled, SUCCEEDED 2026-09-22T22:08:18Z, next 2026-09-23T22:07Z | **Yes** |
| Run now on `revenue-scan-weekly`, `health-coaching-weekly` | Mac tasks; unchanged by this pass | **Yes** |
| Paste §2 for the `date -u` fix | Mac task; unchanged by this pass | **Yes** |
| Enable `trig_01VpcvVPTrbdfvdbXn1mD7hB` (ISA bridge) and `trig_0174717mnSfAk1LtQQVJhH7r` (Steve twin) | Both `http_api`, both confirmed `enabled: false` | **Yes** |

One refinement, not a change: the new **Strava wrapper guard** (`trig_01Nqu4xFXLqtTB2oSdGXEi4X`,
first fire 2026-09-23T12:47Z) re-wraps `stravaSnapshot` if `strava-daily-sync` writes it bare again
at 12:20Z. So missing the paste deadline now costs a re-broken document for 27 minutes rather than
until someone notices. **The paste is still the only permanent fix** — the guard is a net, not a
repair.

---

## 1. Seven web-created routines are failing, and only you can see inside them

**What:** seven enabled `http_api` routines are FAILED. All last fired 2026-09-18 to 2026-09-20 —
the same transient that took down the agent-created ones, which has since cleared.

**Why only you:** no agent can edit, fire or disable a routine created in the web UI. I did not
touch any of them.

**The exact action — and it is a look, not a paste.** Do nothing before 2026-09-25. Let these fire
on their own and then check each row:

| Routine | Next firing |
|---|---|
| Vanessa orchestrated ops review (`trig_01V6QrF6yENWiccduk94ubbs`) | 2026-09-25T23:02Z |
| Next Big Moves weekly review (`trig_01Lb3aYRQZSLsAkcnDpZ8zEL`) | 2026-09-27T15:06Z |
| Weekly self-improvement loop (`trig_016qKE1TdRjzkpb2Yby8yWBX`) | 2026-09-27T15:07Z |
| Weekly improvement loop (`trig_013vYCzVa3vbHZ8BZZy6UBpX`) | 2026-09-27T16:05Z |
| Weekly Loop Engineering QA (`trig_013ocJfEDdmSAgDPVaiCzMZY`) | 2026-09-27T16:05Z |
| Elite Affluent Tracker weekly (`trig_01HfL39UYunpMm56NSJuh8LK`) | 2026-09-27T16:08Z |
| Weekly opportunity audit (`trig_019NdM12eTVDHWy89Ch2sNtU`) | 2026-09-27T17:04Z |

Then: anything that **still fails** is live and reproducible on demand, which is a far better bug
report than seven guesses. Anything that **succeeds** needs its *output* checked rather than its
status — three of the seven carry `RESEARCH-ONLY` / `FINAL MESSAGE ONLY` instructions alongside a
write step, so they will report success having moved nothing. Treatment for that is
`routines/mac-task-repairs.md` §5.

**Do not rewrite seven prompts before 2026-09-27.** There is no point correcting a prompt that is
not executing, and the evidence says they now will.

## 2. Decision — three more stock templates that will run hollow

Not failing, so I deliberately left them alone. All three are the same "AI business assistant"
template as the two I disabled: they read a `/home/claude/vault` that does not exist, and they are
report-only, so a perfect run leaves no document.

- **`Project Risk Review`** (`trig_01YHGFTYdWdVG5nFKCjmcd9M`) — fires Tuesdays. It is **green**: it
  succeeded on 2026-09-22 in 24 seconds and wrote nothing. Next 2026-09-29T18:07Z.
- **`Financial Summary`** (`trig_01CAk1pekAM5AXRiwUxxdnru`) — first ever firing 2026-10-01T16:00Z.
- **`SEO Content Gap Audit`** (`trig_01FjDLMrJBa1dKEh7Nv7JJ4h`) — first ever firing 2026-10-01T17:06Z.

**This is one decision, not three chores, and it does not need your hands** — all three are
`meta_mcp`, so an agent can disable them in one call each the moment you say so, exactly as was done
for `Books Reconciliation Reminder` and `Ops Issue Review`. Disabling is reversible and keeps the
prompt and the run history.

**Say either "retire them" or "repurpose them".** Repurposing means pointing them at real deck
documents — but `auditFindings`, `kanbanCards`, `twinQueue`, `riskMonitor` and `stressTestReport`
already cover this ground, so that is a scoping conversation, not a prompt edit.

## 3. Correction to the record — the connector rule is not what the docs say

**Not an action, but it will cause wrong decisions if it stands.** Three places in the repo state as
a blanket rule that *"a routine created by an agent stores no MCP connectors"*
(`wiki/dashboard-ops/index.md:36`, `docs/CLOUD-WRITE-ARCHITECTURE.md:57`, and the reasoning in
`routines/mac-task-repairs.md` §7(b)).

**That is false as stated.** A routine inherits the connectors of the session that created it. Read
live across all 57 routines on 2026-09-23: the `meta_mcp` routines built by CLI agents on 2026-09-22
carry `mcp_connections: []`, but the older `meta_mcp` batch — Real Estate Weekly Brief, Rent/Buy/Wait,
Books Reconciliation, Ops Issue Review, Project Risk Review, Financial Summary, SEO Content Gap,
Morning Brief, Metrics Digest — each carry **eleven**, including Gmail and Google Calendar.

**What it changed here:** §7(b) concluded that `Real Estate Weekly Brief` "cannot work as an
agent-created routine, at all" and escalated it to you as a recreate-in-the-web-UI decision. It has
Gmail and Calendar attached right now. **That decision was not needed** — its real defect was that it
queried Follow Up Boss, retired 2026-09-22, and that is an ordinary prompt fix, now applied.

The rule to use instead: **check `mcp_connections` in `list_triggers` rather than inferring from
`created_via`.** None of those three files is in R1's ownership, so none was edited.
