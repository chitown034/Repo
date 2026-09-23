# Needs Steven — R2 append (2026-09-23)

Written by the Findings Closer after re-verifying every recorded-open finding against the repo as it
stands, the live artifact store and the live routine listing. **Reads only** — no artifact-database
write, no routine created, updated, fired or deleted, no credential touched, nothing spent.

This file does three things, in this order, because the first is the one that saves Steven a trip:

1. **Corrections to `docs/NEEDS-STEVEN.md` items 0–48** — what is already done, what is wrong in its
   detail, and what is new. The published runbook (`docs/SETUP-RUNBOOK.md`) was built on those items
   as they stood before this pass.
2. **New HALT rows** that are not on the list at all.
3. **Hand-backs** — exact replacement lines for files this seat may not edit, each with a content
   anchor rather than a line number.

**No item is renumbered by this file.** Items are named by their existing number and their substance.

Every timestamp below is the stamp of the thing it describes, not today's clock. The three live reads
behind this file: routine listing **2026-09-23 03:05 UTC**, `state` collection listing and document
reads **2026-09-23 03:10 UTC**, `runnerStatus` **at its own 2026-09-23 02:10 UTC stamp**.

---

## 1. Corrections to items 0–48

### 1a. Already done, or never real — do not spend a Mac trip on these

**Item 2 — the nine dead cloud routines. The free test you were told to wait for has already run, and
it passed.** Item 2 said: *"Project Risk Review's 18:06Z firing today is the free test — if it dies
again in under ~30 s the outage is live … if it runs, drop it."* It ran. **Project Risk Review
reports SUCCEEDED, fired 2026-09-22T18:07.** The startup outage is not live, so the instruction to
treat the four `http_api` routines as urgently yours is withdrawn. What is *actually* still failing is
a stable set of nine, and it has not grown since 2026-09-20:

| Routine | Last run | Created via |
|---|---|---|
| Command Deck — Vanessa orchestrated ops review | FAILED 2026-09-18T23:03 | `http_api` |
| Ops Issue Review | FAILED 2026-09-18T20:08 | `meta_mcp` |
| Books Reconciliation Reminder | FAILED 2026-09-18T22:01 | `meta_mcp` |
| Command Deck — weekly self-improvement loop | FAILED 2026-09-20T15:08 | `http_api` |
| Command Deck — Next Big Moves weekly review | FAILED 2026-09-20T15:07 | `http_api` |
| Command Deck & ISA Portal Weekly Loop Engineering QA | FAILED 2026-09-20T16:06 | `http_api` |
| Command Deck — weekly improvement loop | FAILED 2026-09-20T16:06 | `http_api` |
| Command Deck — Elite Affluent Tracker weekly refresh | FAILED 2026-09-20T16:09 | `http_api` |
| Command Deck — weekly opportunity audit | FAILED 2026-09-20T17:04 | `http_api` |

Plus two ABANDONED on 2026-09-21 (Real Estate Weekly Brief, Rent-Buy-or-Wait), which item 16 already
covers. Seven of the nine are `http_api`, so those seven are genuinely only yours; **two are
`meta_mcp`** (Ops Issue Review, Books Reconciliation Reminder) and an agent could be authorised to
retire or re-point them without you. That is a smaller ask than item 2 currently makes.

**Item 18 — the weekly backup.** Still correct, and now with the number that was missing: the backup
document reads `weeksKept: 1` beside `status: GREEN`, and its own note says *"still the only backup
date on record"*. So the decision is unchanged but the evidence is thinner than "GREEN" suggests —
worth knowing before you disable `r6-weekly-backup`.

**Item 42 — the runner allow-list. Half of it is closed.** It names two tasks refused writes to the
vault. `steve-twin-sweep` is **no longer refused** — `runnerStatus` reads `ok`, last end 2026-09-22
13:10. `ops-knowledge-graph` has **still never run**, and `knowledgeGraph` has not moved off its
2026-09-13 build. So this is now one task, not two.

**Item 26 — see §1b. It is still real, but its wording understates it.**

### 1b. Wrong in its detail — the item stands, the detail does not

**Item 26 — "Client identifiers in the audit corpus".** The item reads as though this is about files.
One of the three things it names is **a document the published dashboard renders**, and that is the
half that matters. Verified 2026-09-23:

- `docs/MASTER-FINDINGS.md` — **clean.** X2's redaction held.
- `docs/data/auditFindings.json` (the repo twin) — **clean.** Its only two initial-plus-surname
  matches are a homebuilder's company name, not a person.
- **The live `auditFindings` document in the Command Deck's store — NOT clean.** Version 3, 288,849
  bytes, `syncedAt 2026-09-22`. It still carries **two client identifiers in initial-plus-surname
  form, each paired with a loan amount and a pipeline stage**, inside finding descriptions. It was
  seeded into the store so the deck could render it, so it is readable by anyone who can open the
  artifact and it travels into every published version and every weekly backup — exactly the two
  consequences you already accepted for the lead board, on data you did **not** exempt.
- `docs/findings/findings-E12.json` still carries the same two rows.

**The redaction reached the repo and did not reach the published store.** Nothing here reproduces a
name, an initial, a surname or an amount. This is the third surface of the class already disclosed to
you (the deck's own `cdStateSeed`/`PROPERTIES_DEFAULT`, and the ISA Portal's `pipeline`/`reClients`),
and it is the only one of the three that is a *rendered audit document* rather than a data card.

**Item 12 — `isaLadder.updatedAt`. The diagnosis is right; here is the proof it was missing.** The
document body reads `updatedAt 2026-09-22T14:30:00Z`, which is **exactly the cron slot**
(`30 14 * * 2-6`). The run actually fired at **14:33:39Z** and the database envelope's own
`updatedAt` is **14:35:53Z**. So the field is the slot time, three to six minutes before anything was
written. Note the trap for whoever checks this next: a freshness sweep reading the *envelope* sees a
healthy stamp and passes it. Only the body is wrong.

**Item 1 — the Strava wrapper.** Still live and still time-boxed, with one thing added since the item
was written: a cloud routine, **Command Deck — Strava wrapper guard** (`47 12 * * *`, enabled,
created 2026-09-22 23:27 UTC), now stands behind the Mac task and repairs a bare write 27 minutes
after it fires. It has **never run** — its first firing is **2026-09-23 12:47 UTC**. As of the
2026-09-23 03:10 UTC read `stravaSnapshot` is still correctly wrapped at version 9. So the deadline
in item 1 is a deadline for the *cause*, not for the document: if you miss it, the guard should catch
it, and 12:47 UTC today is the first time anyone will know whether the guard works.

**Item 37 — the 59-vs-60 task count is answered.** `runnerStatus` lists **59** tasks (`v.tasks`, at
its 2026-09-23 02:10 UTC stamp). The repo now says 59 and names the document as the authority. There
is nothing left to reconcile unless the runner itself disagrees when you look at it.

**Item 5 and item 6 — both still exactly right, and both now have an honest document behind them.**
`zohoSync` exists at version 1 carrying the 403 `Crm_Implied_Api_Access` block and the click path;
`loftyLeads` exists at version 1 carrying "no sync has yet written this document". Neither invents a
number. `zohoLeads` and `zohoDeals` still do not exist at all.

### 1c. New — needs your hands, your account or a licensed call, and is not on the list

**N1. `openrouterFeeds` has been frozen since 2026-09-13 while the task that writes it reports `ok`.**
This is the successor to the old "openrouter-feeds-refresh is in error" findings, and it is worse than
they were. The task stopped erroring and started *succeeding without writing*: `runnerStatus` reads
`lastStatus ok`, last end 2026-09-22T05:59:38, while the first `feedFreshness` sweep (2026-09-23
00:50 UTC) puts the document at **~218 hours old**. A failing task is visible; a silent no-write
success is not. The prompt is on your Mac. **Ask a Mac session why a successful run wrote nothing**,
and treat any "the task is green" answer about a feed as unproven until the document's stamp moves.

**N2. `brain-weekly-verify` missed the Sunday gate and no finding covers it.** Last completion
2026-09-14 on a `0 16 * * 0` cron, so the 2026-09-20 slot passed with nothing run. It is not in the
never-run set and not in the error set, which is why it fell between every audit. It is the gate this
brain's own rules make responsible for promoting memory lines and triaging the Second Brain inbox —
54 of 70 rows of which were still sitting in Inbox at the last count. **Press Run now on it once**,
the same way as item 43.

**N3. The eight `~/.cli-anything-*/history` paths need a home in your backup and encryption scope.**
Each harness REPL writes plaintext command history, and those commands carry URLs that carry MLS
numbers, listing addresses and portal paths. Hardening made them 0700/0600 instead of 0755/0644, but
they still exist in plaintext and nothing enumerates them as a place client data lives. **Confirm the
eight paths are inside the encrypted, sensitive-tier backup scope and outside the vector index and the
knowledge graph** — this is a HALT the moment any of that history is ever moved.

---

## 2. Hand-backs — exact replacements for files this seat may not edit

Each is given as a **content anchor** plus the replacement, because line numbers drift.

### H1. `.claude/skills/ai-ecosystem-backup/SKILL.md` — carries the disproved cloud-write rule

*Anchor:* the sentence beginning **"Runs on the **Mac runner only**: a cloud routine cannot write the
artifact DB"** near the top of the file.

*Replace with:*

> Runs on the **Mac runner only** — not because a cloud routine cannot write the artifact DB (that was
> disproved on 2026-09-22; see `docs/CLOUD-WRITE-ARCHITECTURE.md`), but because a backup reads local
> files and the Mac keychain, and an agent-created routine carries no connectors.

### H2. `.claude/skills/scale-growth-engine/SKILL.md` — same claim

*Anchor:* **"From a cloud routine the write parks on a permission prompt — report, let"**

*Replace the clause with:* `From a cloud routine the write now succeeds (proven 2026-09-22), but an agent-created routine carries no connectors — so report, let`

### H3. `.claude/skills/skills-refresh/SKILL.md` — same claim

*Anchor:* **"From a cloud routine the write parks on a permission prompt — report in the"**

*Replace the clause with:* `From a cloud routine the write now succeeds (proven 2026-09-22), but an agent-created routine carries no connectors — so report in the`

> Why this matters more than a stale sentence usually does: a skill that tells an agent a write is
> impossible will stop it attempting one that now works, and the agent will report the refusal as a
> fact about the system.

### H4. `mac-verify.sh` — five advisory tools have an installer line and no presence check

*Anchor:* the existing Strix line, **`if have strix; then ok "strix (optional)"`**

*Add, in the same shape, immediately after it,* one line per advisory-only tool so `--only <name>` and
the checker agree about reality:

```sh
for _t in ponytail screenshot-to-code claude-code-setup prompts-chat; do
  if have "$_t"; then ok "$_t (optional)" "$(ver "$_t" --version)"
  else info "$_t (optional)" "not installed — advisory only"; fi
done
```

No installer should be added for the four policy or value holds — that is Steven's decision, not a
script's. This only makes the absence *visible*.

### H5. *(withdrawn)* `always-on/README.md` feed-freshness row

Closed by another seat at commit `39a7344` while this file was being written. The row now reads
"working — proven twice, re-verified 2026-09-23 03:00 UTC" and independently names `openrouterFeeds`
as the worst offender. Nothing owed.

---

## 3. What this pass did not touch

No artifact-database write of any kind. No routine created, updated, fired or deleted. No live Mac
task, system prompt or published artifact edited. No credential read, written or guessed — every
credential in this file is named by its location and variable name only. No client name, surname,
initial, account number or loan amount written into any file.
