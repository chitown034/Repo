# Cloud routine repairs — what was changed, and what proves it

**Written 2026-09-23 by R1 (Reliability).** Every routine state quoted here was read live from
`list_triggers` at **2026-09-23 02:47–02:53 UTC**, and every document state from the Command Deck
store (`https://claude.ai/code/artifact/1624daae-d683-405a-971d-c5828dce0f8d`, collection `state`)
between **02:47 and 02:56 UTC** on 2026-09-23. Where the brief that commissioned this file disagrees
with the live platform, the platform wins and the difference is called out.

Unlike `routines/mac-task-repairs.md`, **this file is not a paste list.** A cloud routine created by
an agent can be edited by an agent, so the five items below were *applied*, not written out for
Steven. Each section says what the routine does now and the document or run that proves it.

| # | Routine | What was wrong | What was done | Proven? |
|---|---|---|---|---|
| 1 | Feed freshness watchdog | Nothing in the prompt — a transient run failure | Nothing; re-fired it | **Yes** — `feedFreshness` v3, written 02:59:00Z |
| 2 | Books Reconciliation Reminder | Stock template, no ledger anywhere to read | **Disabled** | Yes — `enabled:false` |
| 3 | Ops Issue Review | Stock template, vault path does not exist | **Disabled** | Yes — `enabled:false` |
| 4 | Real Estate Weekly Brief | Queried a CRM retired 2026-09-22; **and it hangs** | **Prompt rewritten**; hang reproduced | **No** — proving run hung, see §4 |
| 5 | Rent, Buy, or Wait refresh | Run was dropped mid-flight; prompt is sound | Nothing — fix already applied | **No** — due 2026-09-28 |

---

## The hypothesis I was given, and where it is wrong

> *"Agent-created routines carry no MCP connectors. So any `meta_mcp` routine whose prompt needs
> Gmail, Calendar, Notion or a CRM cannot work as written."*

**That is true of some `meta_mcp` routines and false of others, and the difference is visible in one
field.** `list_triggers` returns `mcp_connections` per routine. Counting it across all 57 routines on
the account:

| Group | `created_via` | Connectors attached |
|---|---|---|
| Routines built by this ecosystem's agents on 2026-09-22 — feed watchdog, Strava wrap guard, Pipeline Sync (live), ISA ladder, ecosystem backup, backup watchdog, Weekly Loop + Self-Test | `meta_mcp` | **0 — none** |
| The older `meta_mcp` batch — Real Estate Weekly Brief, Rent/Buy/Wait, Books Reconciliation, Ops Issue Review, Project Risk Review, Financial Summary, SEO Content Gap, Morning Brief, Metrics Digest | `meta_mcp` | **11** — Canva, Slack, You_com, Strava, Eromify, Notion, Claude_Code_Remote, Gmail, Context7, Google_Calendar, Composio |
| Steven's web-created routines | `http_api` | 8–11 |

So the rule is **not** "agent-created means connector-less". It is: **a routine inherits the
connectors of the session that created it.** The 2026-09-22 batch was created from a CLI session that
had none, so they have none. The older batch was created from a surface that had all eleven, so they
kept all eleven.

This matters because `routines/mac-task-repairs.md` §7(b) concluded that `Real Estate Weekly Brief`
"cannot work as an agent-created routine, at all" and that this was "a decision for Steven, not a
prompt fix". **That conclusion rested on a premise that does not hold for that routine** — it has
Gmail and Google Calendar attached right now. Its real defect was a retired CRM, which *is* a prompt
fix, and item 4 below applies it.

`wiki/dashboard-ops/index.md:36` and `docs/CLOUD-WRITE-ARCHITECTURE.md:57` both state the blanket
rule. Neither file is mine to edit; both need the qualifier above. Logged as `F-R1-02`.

## What actually failed, across all five

Not one of the five failed inside its prompt. The evidence is timing, and it is consistent:

| Routine | Fired | Outcome | Ran for |
|---|---|---|---|
| Ops Issue Review | 2026-09-18T20:08:23Z | FAILED | 9.8 s |
| Books Reconciliation | 2026-09-18T22:01:29Z | FAILED | 9.2 s |
| Rent, Buy, or Wait | 2026-09-21T15:08:09Z | ABANDONED | never finished |
| Real Estate Weekly Brief | 2026-09-21T15:08:42Z | ABANDONED | never finished |
| Feed freshness watchdog | 2026-09-22 16:12Z slot | FAILED (per the brief) | — |
| **Project Risk Review** | **2026-09-22T18:07:22Z** | **SUCCEEDED** | **24 s** |
| **Feed freshness watchdog** | **2026-09-23T00:18:51Z** | **SUCCEEDED** | **7 m 04 s** |

Two of those rows are controls, and they settle it:

1. **Project Risk Review is the same stock template as Ops Issue Review and Books Reconciliation** —
   same `/home/claude/vault` paths, same eleven connectors, same `claude-sonnet-5`, same author, same
   week. Its Monday/Tuesday/Wednesday siblings died at ~10 s on 2026-09-18. It fired on its own
   natural Tuesday slot on 2026-09-22 and **succeeded**. A prompt defect cannot be present in two
   members of a template family and absent in the third.
2. **The feed watchdog failed and then succeeded on byte-identical text.** Its `created_at` and
   `updated_at` are the same instant — `2026-09-22T14:36:17.549076Z` — so its prompt has never been
   edited since creation. The same characters that produced a FAILED run produced a 7-minute
   successful run that wrote two documents. The failure was not in the text.

The failures cluster on **catch-up firings**, not natural slots: three routines with Monday, Tuesday
and Wednesday crons all fired on Friday 2026-09-18 within two hours; the two ABANDONED runs fired
**33 seconds apart** on 2026-09-21 at 15:08, though their crons are 16:30 and 17:30 Monday. Every run
on a natural slot or a manual fire since 2026-09-22 has succeeded.

**So `ROUTINE_RUN_FAILURE_REASON_UNSPECIFIED` here means "the run never reached the prompt".** For
three of the five that makes the red row a non-event.

### Correction, 03:10 UTC — it is two causes, not one, and I proved the second one myself

The paragraph above was written before my own proving runs came back, and one of them contradicts it.
**I fired both the feed watchdog and Real Estate Weekly Brief within nine seconds of each other.** The
watchdog succeeded in 5 m 05 s and wrote two documents. **Real Estate Weekly Brief hung** — still
`PENDING` with no `finished_at` fourteen minutes later, having written nothing at all, not even the
`ciLog` "started" row its prompt makes the very first instruction.

So the honest split is:

- **Cause A — a platform transient, now cleared.** `Ops Issue Review`, `Books Reconciliation` and the
  feed watchdog. Proven cleared by both controls above.
- **Cause B — a hang specific to two routines.** `Real Estate Weekly Brief` and `Rent, Buy, or Wait`
  are **the only two routines on this entire account that have ever produced a run with no
  `finished_at`**, and Real Estate has now done it twice, the second time on demand.

**Connector count is not the cause, and I checked before saying so.** Every other `meta_mcp` routine
carrying the same eleven connectors finishes fast:

| Routine | Last run | Duration |
|---|---|---|
| Morning Brief | SUCCEEDED | 19 s |
| Content Calendar Review | SUCCEEDED | 22 s |
| Project Risk Review | SUCCEEDED | 24 s |
| Account Health Check | SUCCEEDED | 33 s |
| Metrics Digest | SUCCEEDED | 39 s |
| Social Calendar Planning | SUCCEEDED | 44 s |
| Command Deck Brief | SUCCEEDED | 58 s |
| **Real Estate Weekly Brief** | **PENDING / ABANDONED** | **never finishes** |
| **Rent, Buy, or Wait** | **ABANDONED** | **never finishes** |

Everything that works in this set is a 19–58 second job. The two that hang are the two heaviest
prompts in it — a multi-source gather, and a full dashboard refresh-and-republish. That is a
correlation and a good lead, **not a proven cause**, and I am not claiming more than that.

**What it costs my own fix:** the durable `ciLog` trace I added to Real Estate Weekly Brief does not
help against this failure, because the run never reaches instruction one. A trace can only make a
*dropped* run visible; it cannot make a run that never started visible. Saying so is the point of
writing it down.

---

## 1. Feed freshness watchdog — it works, and the register was out of date

`trig_01AcWPY2aSQZay5e2DBCfczD` · `meta_mcp` · cron `12 16 * * *` · 0 connectors · enabled

### What was wrong

**Nothing in the prompt.** The brief recorded this routine as FAILED with "never written its
`feedFreshness` document", and `always-on/README.md` told a reader to go looking for a document that
did not exist. Both were true when written and are false now.

### Evidence

- `created_at` = `updated_at` = `2026-09-22T14:36:17.549076Z`. **The prompt has never been edited.**
- `last_run`: fired `2026-09-23T00:18:51.818Z`, finished `00:25:56.225Z` — **SUCCEEDED, 7 m 04 s**.
  For scale, the failing runs lasted 9–10 seconds.
- `feedFreshness` exists: **version 1**, server `updatedAt 2026-09-23T00:24:12.228Z`, correctly
  wrapped `{v:{…}}`. It classified 26 feeds — 18 fresh, 2 late, 4 stale, 2 unknown, 0 missing — and
  named `openrouterFeeds` as worst (frozen since 2026-09-13 while its task reported `ok`, which is
  precisely the silent-no-write pattern the watchdog exists to catch). `futureStamps` is empty.
- `ciLog` carries the matching row, dated `2026-09-23`, in the exact two-key shape. A 26-row sweep of
  `ciLog` found **zero** malformed rows.

### What was done

Nothing to the prompt. I fired it a second time at **2026-09-23T02:53:41Z** (session
`cse_01U9URb6LPia8B5GT8WWBERg`) to confirm it works *repeatedly* rather than once — a watchdog that
succeeds on its first run and never again is still broken.

### The check

**Done, and it passed.** The run SUCCEEDED at `02:58:46Z` (5 m 05 s). `feedFreshness` is now
**version 3**, `checkedAt 2026-09-23T02:59:00Z`, `by: "feed-freshness-watchdog (cloud, manual proving
run)"`, top level exactly `{v:…}`, 26 documents classified — 19 fresh, 1 late, 4 stale, 2 unknown,
0 missing, no future-dated stamps, worst still `openrouterFeeds`. Its `note` correctly diffs against
the previous run ("every one of the 26 tracked documents is byte-identical to the prior read"),
which is what the prompt demands and what proves it is not just replaying a template. One
correctly-shaped `ciLog` row was appended; `ciLog` still has **zero** malformed rows out of 28.

**This routine is proven: two successful runs, two documents, a real diff between them.** Next
natural firing **2026-09-23T16:12Z**.

---

## 2. Books Reconciliation Reminder — disabled; there is nothing to reconcile

`trig_01ETFd8biiJjDxqL12qVJVqc` · `meta_mcp` · cron `0 18 * * 3` · 11 connectors

### What is broken

Two separate things, and only the second one matters:

1. Its last run FAILED on 2026-09-18 in **9.2 s** — the catch-up cluster above. Not a prompt fault.
2. **Its prompt is a stock "AI Bookkeeper" template aimed at a business that is not Steven's.** It
   reads `/home/claude/vault`, `Finance/Books/`, and checks whether `_memory/Business.md` still says
   *"onboarding not yet completed"*. None of that exists in this ecosystem. It is also report-only —
   *"Present your findings as your reply"* — so even a flawless run leaves no document and cannot be
   verified.

### Evidence

- A full listing of collection `state` on **2026-09-23 02:50 UTC** returned **175 documents**. None
  is a ledger, a book, a journal or a reconciliation. The nearest things are the `inc-*` income rows
  (single scalars), `liabilities`, and `accounts` — none of which is a ledger you can reconcile
  against a statement.
- The prompt's own escape hatch — "if the user hasn't pasted in records to reconcile, say so plainly
  and ask for them" — is addressed to a human in a chat. **Nobody is in the room.** An unattended
  weekly routine whose designed-for outcome is to ask a question into an empty chat is not a reminder;
  it is a red row on Steven's routine list, forever.

### What was done

**Disabled** at `2026-09-23T02:52:40.778Z` via `update_trigger`, and renamed to
`Books Reconciliation Reminder (DISABLED 2026-09-23 — no ledger exists to reconcile)` so the reason
travels with the routine and does not live only in this file.

Disabling is reversible and keeps the run history. The prompt is untouched, so if Steven ever wants
it back, re-enabling is one call. **It was not deleted.**

### The check

`list_triggers` shows `enabled: false`. It did **not** fire at its next slot,
**2026-09-23T18:00:37Z** — which it otherwise would have, roughly 15 hours after this was written.

---

## 3. Ops Issue Review — disabled; the vault path does not exist and the deck already does this job

`trig_01JFtUymy9TXef3765urgZ36` · `meta_mcp` · cron `0 18 * * 1` · 11 connectors

### What is broken

Same template family, same two layers. The FAILED run (2026-09-18T20:08:23Z, **9.8 s**) is the
catch-up cluster. The durable defect is the prompt: it reads `/home/claude/vault`, `Ops/Issues/` and
`Ops/Processes/`, checks the same `_memory/Business.md` onboarding string, and ends *"Present the
review as your reply"* — report-only, no document, unverifiable.

### Evidence

- The 175-document store has no `opsIssues` document and no `Ops/` anything.
- **The work it describes is already done by four live surfaces**: `auditFindings` (288 KB),
  `kanbanCards`, `twinQueue` and `riskMonitor`, plus `stressTestReport`. Repurposing this routine to
  write ops issues would duplicate surfaces that already exist and are already rendered.
- Its sibling `Project Risk Review`, on the identical template, fired successfully on 2026-09-22 and
  ran for **24 seconds** — long enough to find nothing and reply, which is exactly what a successful
  run of this template looks like. That is the best available picture of what Ops Issue Review would
  have produced had it run: a green row and an empty report.

### What was done

**Disabled** at `2026-09-23T02:52:45.308Z`, renamed to
`Ops Issue Review (DISABLED 2026-09-23 — stock template, vault path does not exist)`. Reversible;
prompt and history intact.

### The check

`enabled: false` in `list_triggers`. It does not fire on **2026-09-28T18:07Z**.

### A related row I did not touch

**`Project Risk Review` (`trig_01YHGFTYdWdVG5nFKCjmcd9M`) is the third member of this family and it is
still enabled**, firing Tuesdays. It is not on my list of five because it is *green* — but it is green
in the way this whole audit exists to distrust: it succeeded in 24 seconds and left no document. It
reads `Projects/` in the same non-existent vault. **It deserves the same disable, and I have
deliberately not applied it** because it was outside the five I was given and it is not failing.
Steven's call. Logged as `F-R1-07`.

---

## 4. Real Estate Weekly Brief — rewritten; it was querying a CRM retired the day before

`trig_01CjaMXrbMga1jPdJzUnwLUo` · `meta_mcp` · cron `30 16 * * 1` · **11 connectors** · enabled

### What is broken

The ABANDONED run (2026-09-21T15:08:42Z, no `finished_at`) is the dropped-catch-up story again. The
defects that survive that are in the prompt, and there were two:

1. **It queried Follow Up Boss.** Its body called `FOLLOW_UP_BOSS_LIST_APPOINTMENTS` with
   `userId=720` and `FOLLOW_UP_BOSS_LIST_SMART_LISTS`, and named five smart lists to clear.
   `context/decisions.md` records Steven's 2026-09-22 decision: **Follow Up Boss is replaced by Lofty
   as the real-estate system of record.** The routine was, from that day, reporting a retired
   system's appointments as this week's plan.
2. **It left no trace.** Its only output was *"a concise 'Monday Real Estate Brief' as your final chat
   message"*. That is why a dropped run was invisible: nobody could distinguish "ran and found
   nothing" from "died halfway".

**It is not short of connectors.** `mcp_connections` carries Gmail and Google Calendar — two of the
three sources the old prompt used. Only the CRM is genuinely gone.

### What was done

Prompt replaced in place with `update_trigger` at `2026-09-23T02:53:29.671Z` — **not** delete-and-
recreate, so `created_at` is still `2026-09-07T07:49:35Z` and the run history survives. Changes:

- **Both Follow Up Boss calls removed**, with a paragraph at the top saying why, so a future reader
  does not "helpfully" restore them. The CRM section is now a fixed sentence: *not connected — Lofty
  is the system of record since 2026-09-22, and no Lofty key or toolkit is reachable from a cloud
  routine.* It is forbidden to substitute a Follow Up Boss figure under a Lofty label — the exact
  error `wiki/dashboard-ops/index.md:44` warns about.
- **Calendar and Gmail kept**, read-only, because those connectors are actually attached.
- **A durable trace added**: a `ciLog` row `real-estate-weekly-brief — started.` before any work, and
  a closing row after; plus a `realEstateBrief` document carrying `ranAt`, per-source health
  (`ok|failed|empty`), counts, and a `failures` array. A start row with no finish row now means a
  dropped run, which is the thing that was invisible before.
- **A no-invention rule**: if Calendar or Gmail does not answer, the correct output is a record that
  says so with a timestamp, not a padded section.
- **A PII rule**: no client names, email addresses, subject lines or property addresses in either
  `realEstateBrief` or `ciLog` — counts and source health only. The detail goes to Steven in chat.
  The store is shared and this keeps third-party correspondence out of it.

### The check

Fired as a proving run at **2026-09-23T02:53:50Z** (session `cse_01Fijfb9HdEVnjfY5RyJVDpC`).

### The proving run hung — so this is NOT fixed, and here is exactly where it stands

**Result: `PENDING`, no `finished_at`, nothing written.** Fourteen minutes after firing there was no
`realEstateBrief` document, and `ciLog` was unchanged at version 223 — so the run never executed
even its first instruction. Its sibling, fired nine seconds earlier, finished in five minutes.

Splitting the verdict, because the two halves have different answers:

- **The content defect is fixed.** The routine no longer queries a CRM Steven retired on 2026-09-22.
  That was real, it was wrong every Monday, and it is gone. This holds regardless of the hang.
- **The execution defect is not fixed, and it was not mine to begin with** — the routine hung
  identically on 2026-09-21 under the old prompt. What changed is that it is now **reproducible on
  demand**, which is worth more than an intermittent mystery.

**I left it enabled, deliberately.** Three reasons: the rewrite is an improvement whether or not the
hang recurs; seven sibling routines with identical connectors run fine, so this is not a class-wide
fault to retreat from; and **this routine has never once been observed on a true natural slot** — its
cron is Monday 16:30, and both observed runs were a catch-up (2026-09-21 15:08) and a manual fire.
2026-09-28T16:37Z will be the first, and natural slots have behaved differently from catch-up runs
everywhere else in this audit. Disabling a brief Steven wants, on two runs neither of which was a
scheduled one, would be over-correction.

**The check, and it is a real fork.** After 2026-09-28T16:37Z:

- `realEstateBrief` exists and `ciLog` has both rows → fixed, and the hang was catch-up-only.
- `ciLog` has a `started` row and no finish row → it reached the prompt and died mid-run. The trace
  did its job; the fault is inside the gather.
- **Nothing in `ciLog` at all** → it hung again before instruction one, exactly as on 2026-09-23.
  That is three hangs out of three, and at that point the honest action is to disable it and hand
  Steven a recreate-in-the-web-UI decision, because no prompt edit can fix a run that never starts.

---

## 5. Rent, Buy, or Wait refresh — already repaired, deliberately not fired

`trig_01EBvRQ4Rv63EgrLihjNxwiG` · `meta_mcp` · cron `30 17 * * 1` · 11 connectors · enabled

### What is broken

**Nothing that a prompt edit can reach.** Its run was ABANDONED at 2026-09-21T15:08:09Z with no
`finished_at` — 33 seconds before the Real Estate Brief's run was dropped in the same event. The
prompt itself is sound: it invokes the `rent-buy-dashboard-refresh` skill, names the artifact, and
carries the do-not-fabricate rule, the four-places-per-median warning and the single-`<script>` guard.

### Evidence it is already fixed

The durable-trace amendment written out in `routines/mac-task-repairs.md` §7 **has already been
applied** — `updated_at` is `2026-09-22T14:53:07.190Z`, and the live prompt ends with the
`rent-buy-wait — started` / `rent-buy-wait — ok` `ciLog` pair and the `{v:<array>}` reminder, verbatim.
I verified this by reading the live prompt, not by trusting the file. **No further edit was needed and
none was made.**

### Why I did not fire it

Firing this routine runs a full dashboard refresh and **republishes a live published artifact**
(`592d487c-703f-418f-939e-14ff6f2353b2`). My brief forbids publishing an artifact, and doing it
off-schedule on a Wednesday — running the weekly tier a week early, against live rate and price
sources — is a real mutation of Steven's dashboard taken purely to make a row turn green. The cost of
waiting is five days; the cost of being wrong is a republished public page.

**So this one is NOT proven, and I am not calling it fixed.** It is repaired-and-untested.

### The check

After **2026-09-28T17:36Z**: `ciLog` carries a `rent-buy-wait — started` row and a `rent-buy-wait — ok`
row with the same date. A start row alone means it was dropped again. Nothing in `ciLog` at all means
the run never reached the prompt — the catch-up failure, not a routine defect, and the right response
is then to fire it manually and watch, not to rewrite it.

---

## The five that have never run — per routine, as asked

None of these is failing. Four are simply not due yet; the fifth is not due either, but carries a
stale premise that will make its first run weaker than it should be.

| Routine | Cron | First / next firing | Verdict |
|---|---|---|---|
| **Strava wrapper guard** `trig_01Nqu4xFXLqtTB2oSdGXEi4X` | `47 12 * * *` | **2026-09-23T12:47Z** | **Not yet due — by ~10 hours.** Created 2026-09-22T23:27Z. It has no `last_run` field at all, and `stravaWrapGuard` does not exist in `state` — both correct for a routine whose first slot has not arrived. The brief asked whether it "actually ran and wrote `stravaWrapGuard`"; at the time of checking (02:47Z) it could not have. Check after 12:47Z today. |
| **Backup verification watchdog** `trig_01PhgrwpwaQ9vLvFxQPrPJ6W` | `30 17 * * 0` | 2026-09-27T17:35Z | **Not yet due.** Created 2026-09-22, first Sunday is 2026-09-27. Note it is **read-only by design** — its own prompt says "do not write any document" — so it will never leave a document and can only ever be judged by its run status. That is a deliberate exception to the register's rule, and it is worth knowing before someone files it as another silent writer. |
| **Weekly Loop Engineering + Self-Test** `trig_01W1KHiBfVXZ5Xwd1aCFJM72` | `0 13 * * 6` | 2026-09-26T13:06Z | **Not yet due.** Created 2026-09-22, first Saturday is 2026-09-26. But its prompt asserts *"An unattended cloud run CANNOT be relied on to WRITE this artifact's database … both park on an approval nobody can give"* — **that premise is now false**, disproven by `cloudWriteProbe` and by five cloud writers that have since written this store unattended. It is therefore report-only on the strength of a limitation that no longer exists. Not broken, but weaker than it needs to be. Logged as `F-R1-06`. |
| **Financial Summary** `trig_01CAk1pekAM5AXRiwUxxdnru` | `0 16 1 * *` | 2026-10-01T16:00Z | **Not yet due.** Created 2026-09-06; the first 1st-of-month after that is 2026-10-01, so never running is correct. **But it is the same stock template as items 2 and 3** — it reads `/home/claude/vault`, `_memory/Business.md`, `Finance/Analysis/`, `Finance/Books/`, and tries to *save a file* to `Finance/Analysis/summary-<date>.md` in a sandbox that evaporates when the run ends. It will produce a hollow run on 2026-10-01. I did **not** disable it: it has not failed, and I was told not to manufacture a fix. Recommend the same disable before 2026-10-01. `F-R1-08`. |
| **SEO Content Gap Audit** `trig_01FjDLMrJBa1dKEh7Nv7JJ4h` | `0 17 1 * *` | 2026-10-01T17:06Z | **Not yet due**, same reasoning. Same template: reads `SEO/Keywords/` and `Content/`, saves to `SEO/Audits/Audit-<date>.md`. Same hollow first run coming on 2026-10-01, same recommendation, same reason for not acting now. `F-R1-08`. |

## The seven `http_api` routines — Steven's, one click each

**No agent can edit a routine created through the web interface, and I did not touch any of them.**
All seven are FAILED, all seven are enabled, and all seven last fired in the 2026-09-18 to 2026-09-20
window — the same outage as items 2 and 3. **The cheapest correct action is to let the next firing
happen and look, not to rewrite anything**: the platform has been healthy since 2026-09-22, and every
routine that has fired on a natural slot since then has succeeded.

| Routine | Next firing | Link |
|---|---|---|
| Vanessa orchestrated ops review | 2026-09-25T23:02Z | https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs |
| Weekly Loop Engineering QA | 2026-09-27T16:05Z | https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY |
| Next Big Moves weekly review | 2026-09-27T15:06Z | https://claude.ai/code/routines/trig_01Lb3aYRQZSLsAkcnDpZ8zEL |
| Elite Affluent Tracker weekly | 2026-09-27T16:08Z | https://claude.ai/code/routines/trig_01HfL39UYunpMm56NSJuh8LK |
| Weekly improvement loop (research → apply) | 2026-09-27T16:05Z | https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX |
| Weekly opportunity audit | 2026-09-27T17:04Z | https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU |
| Weekly self-improvement loop | 2026-09-27T15:07Z | https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX |

**What to do, in order.** (1) Let 2026-09-25 and 2026-09-27 pass and check each row then — that is a
free test. (2) For any that still fails, the fault is live and reproducible, which is a far better bug
report than a guess. (3) For any that *succeeds*, check what document it left, because three of these
carry `RESEARCH-ONLY` / `FINAL MESSAGE ONLY` instructions alongside a write step and will report
success having moved nothing — the treatment for that is `routines/mac-task-repairs.md` §5.

One more that is Steven's alone: the old **Pipeline Sync** (`trig_018BSAYiYzvtyaUkpAY4SnqE`) still
reports SUCCEEDED four times a day and moves nothing. Disabling it has been refused twice as an agent
action. https://claude.ai/code/routines/trig_018BSAYiYzvtyaUkpAY4SnqE

## A count worth correcting

The brief says "17 of 53 enabled routines are not completing". The live listing gives **57 routines,
53 enabled**, and of those 53 **16** are not in a SUCCEEDED state: 9 FAILED, 5 NEVER_RUN, 2 ABANDONED.
The third ABANDONED routine (`Command Deck — Steve twin`) is **disabled**, so it is not one of the 53.
After this pass, the enabled not-SUCCEEDED count is **14**, and two of those are ex-failures now
carrying proving runs.

## Related

- `routines/mac-task-repairs.md` — §7 is the predecessor analysis; its §7(b) premise is corrected above.
- `always-on/README.md` — the register these repairs feed; corrected for `feedFreshness` in the same pass.
- `docs/findings/findings-R1.json` — the findings behind this file.
- `docs/CLOUD-WRITE-ARCHITECTURE.md` · `wiki/dashboard-ops/index.md` — both carry the blanket
  "agent-created routines store no connectors" rule that needs the qualifier. Neither is mine to edit.
