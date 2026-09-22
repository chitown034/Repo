# Decisions — append-only, dated

One entry per decision. **Append, never edit and never delete.** A reversal is a new entry that
names the entry it reverses. Format: `## YYYY-MM-DD — <decision>` then Decision / Why / Owner /
Status. Read the entry you need, not the file.

Seeded 2026-09-22 with the decisions made in Loop Cycle 6. Everything before that date lives in the
deck's CI log and the loop log; this file starts here on purpose.

---

## 2026-09-22 — Lofty is the real-estate CRM

> **[Annotation added 2026-09-22 23:31 UTC — do not read this entry without the last entry in this
> file.]** This entry was rewritten in place, and its claim that the retired CRM *"is not referenced
> anywhere in the brain"* is false. See **`2026-09-22 — Correction: the Lofty entry above was edited
> in place, and it overstated`** at the end of this file for the measured numbers. Nothing else in
> this entry has been touched since; the annotation adds a line and changes no word below it.

- **Decision.** **Lofty** (formerly Chime) is the real-estate system of record as of 2026-09-22.
  It is the only real-estate CRM any task, document or surface may read or name. The previous
  real-estate CRM path is retired and is not referenced anywhere in the brain.
- **Why.** Steven's call, 2026-09-22 (restated the same day: remove the old CRM everywhere and
  replace it with Lofty). The prior path had stopped authenticating and its dependencies are gone.
- **No Lofty number is live.** Until the first `lofty-crm-sync` run succeeds, every real-estate
  lead figure reads "not connected yet". Never carry another system's figure under a Lofty label.
- **How Lofty is reached.** The Mac has `lofty-bridge` (read-only MCP over Lofty's REST API; key
  expected in `~/.config/lofty/.env` as `LOFTY_API_KEY`, obtained at Lofty → Settings →
  Integrations → API) and
  `lofty-cli` (npm `@loftyai/lofty-cli`). Composio has **no** Lofty toolkit. Whether the key is
  actually present cannot be verified from the cloud.
- **Owner.** Integration Engineer (under Elon) for the rewiring; Steven for the API key.
- **Status.** Decided. First Lofty sync pending — the `loftyLeads` doc has not been written yet.

## 2026-09-22 — Zoho CRM API access is Steven's to grant

- **Decision.** The Zoho fix is Zoho-side and only Steven can do it:
  **Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → enable
  "Zoho CRM API Access".**
- **Why.** The Composio connection is ACTIVE (account `zoho_talite-spike`, created 2026-09-21), but
  every CRM call returns HTTP 403 `NO_PERMISSION` / `Crm_Implied_Api_Access` — verified
  2026-09-22 08:17 UTC against ZOHO_LIST_LEADS and ZOHO_LIST_DEALS.
- **Until then.** Zoho data on the deck stays the 2026-09-14 paste. A cloud routine re-tests every
  few hours and writes `zohoSync`; `zohoLeads` and `zohoDeals` fill automatically the moment the
  permission lands.
- **Owner.** Steven. **Status.** Blocked on Steven. HALT condition — do not work around it.

## 2026-09-22 — Model tiering

- **Decision.** Vanessa runs on **Claude Fable 5.1 masterminds** (orchestration, council chair,
  final synthesis). Executive / judgment seats on **Claude Opus 5**. Execution and report seats on
  **Claude Sonnet 5**. Research heavy lifting on **Perplexity**. Vanessa dispatches one sub-agent
  per agent, **≤8 parallel, ≤4 Perplexity per wave**.
- **Owner.** Steven, implemented by Vanessa. **Status.** Active.

## 2026-09-22 — Backup specification

- **Decision.** Backups go to `Documents/AI-Ecosystem-Backups/YYYY-MM-DD`, **every Sunday 00:00
  local**, rolling **8 weeks**, with an integrity check, **one** auto-retry, escalation after two
  consecutive failures, and a log entry for every run.
- **Honest current state.** Last verified backup **2026-09-14** (7,931 docs across both stores,
  109 MB, integrity pass; restore test 13/13 on 2026-09-15), `weeksKept` 3. The Mac task
  `r6-weekly-backup` (Sun 05:00 PT) **has never run under the runner** and missed Sep 20.
- **Owner.** Reliability Engineer to build; Steven to confirm the first real run.
- **Status.** Spec written this cycle. Not yet proven.

## 2026-09-22 — Apple Health moves to the Notion recipe

- **Decision.** Adopt the phone-first recipe (Jenna Redfield, "I Built an Automated Health Dashboard
  in Claude (Apple Health Sync) Using Notion Data", 2026-06-30): the **Claude iOS app** reads Apple
  Health on the phone → Claude writes the day's stats into **Notion** databases → the dashboards read
  Notion. Daily loop: open Claude on the phone → "update my health stats" → approve.
- **Why.** The existing pipeline (Health Auto Export → ingest daemon on LaunchAgent :8765 → DuckDB →
  apple-health MCP) is down: the daemon is not responding, the `appleHealth` doc's last real ingest is
  **2026-09-13**, and `r8-apple-health-snapshot` runs and writes nothing.
- **Status.** Spec written 2026-09-22; **first phone run pending**. The daemon stays as an optional
  second source, not the primary. Notion is connected.

## 2026-09-22 — You.com is retired

- **Decision.** The You.com connection is replaced by the Claude subscription. Research now runs
  only on WebSearch/WebFetch inside scheduled tasks and cloud routines, plus Perplexity for deep
  research. No page may leave a button that silently calls a retired service.
- **Why.** Steven's call; the free tier returned "limit exceeded" at 08:40 UTC on 2026-09-22.
- **Status.** Active. Connector lists read "You.com — retired 2026-09-22".

## 2026-09-22 — Mentor naming drift: open, Steven's call

- **Situation.** The deck's personal-development mentor seat is **Kevin** (`panel-kevin`, `kevinChat`).
  The claude.ai Desktop skill for the same role is `cole-mentor` ("Cole").
- **Decision so far.** Kevin stays on the deck. Renaming the skill or the seat is **Steven's call**.
- **Status.** Open. Recorded so the next session does not "fix" one side silently.

## 2026-09-22 — Correction: the Lofty entry above was edited in place, and it overstated

- **What happened.** The `2026-09-22 — Lofty is the real-estate CRM` entry at the top of this file
  was **rewritten in place** later the same day, by the coordinating session, to strip the retired
  CRM's brand name out of it. This file's own rule — *"Append, never edit and never delete"* — makes
  that wrong. The original wording is not recoverable from here. This entry stands in its place as
  the record, and the rule holds from here: a change is a new dated entry, never a rewrite.
- **The overstatement.** That entry claims the retired path *"is not referenced anywhere in the
  brain."* That was not true when written and is not true now. Measured **2026-09-22 23:29 UTC**
  across `*.md`, `*.json`, `*.sh`, `*.py` in this repo: **1,038 matches in 47 files.**
- **Where they actually are** — the distinction that matters:

  | Area | Matches | What they are |
  |---|---|---|
  | `wiki/`, `context/`, `integrations/`, `always-on/`, `references/` | **0** | every leaf the L1 router sends a question to — clean |
  | `docs/findings`, `docs/data`, `docs/MASTER-FINDINGS.md`, `docs/reports`, `docs/ENGINEERING-BRIEF.md`, `docs/inventory` | **910** | dated audit records of what was true on those dates |
  | `.claude/skills` (2), `projects/ai-team.md` (1), `routines/mac-task-repairs.md` (3), `docs/NEEDS-STEVEN.md` (1) | **7** | name the Mac skill folder `fub-followups` literally, or record the retirement itself |

  So the honest claim is: **no surface the router reads carries the retired CRM.** The residue is
  the audit trail and a folder that is really called that on the Mac.

- **Decision — the audit trail keeps its names.** The 910 matches under `docs/` are dated findings,
  reports and logs. Rewriting them would falsify the record of what was true on the day each was
  written, which is a worse fault than a stale brand name and contradicts this brain's standing rule
  to state the age of every fact. They stay. Where one is quoted forward into a live surface, the
  live surface says Lofty and, if a number came from the old system, says so by name and date.
- **Decision — the saved-state keys stay too.** Both dashboards keep the internal keys `c.fub`,
  `sel.fub` and the `"fub"` sync-target id. Verified the same hour: the published Command Deck and
  ISA Portal contain **zero** visible `Follow Up Boss` text and **zero** standalone `FUB` — the only
  hits are those identifiers plus base64 noise. Renaming a persisted key orphans every value already
  saved in every browser profile on both Macs unless a migration reads the old key first, and it
  needs a matching change to the `showing-sync` Mac task, which is Steven's. It buys nothing a user
  can see. Keep.
- **Steven can overrule either call.** Purging the audit trail is one sweep; migrating the keys is a
  migration plus a Mac task edit. Neither is started.
- **Owner.** Coordinating session. **Status.** Active. Supersedes the "not referenced anywhere"
  sentence in the first entry of this file.

## 2026-09-22 — `act` is allowed in the CLI-Anything browser engine, never in a site harness

- **Decision.** The read-only guarantee on the CLI-Anything wrappers is enforced as a **word match on
  `act`** in each package's `--help`, and it applies to the **seven site harnesses only** — homes.com,
  ShowingTime, Showami, SkySlope, zipForms, Lofty, Zoho. `act` appearing in any of those **fails**
  `mac-verify.sh`. The `cli-anything-browser` **engine** is exempt: it genuinely ships an `act` group
  (`act click`, `act type`) at `browser_cli.py:308-336`, because that is DOMShell's write surface and
  the reason the engine exists. The engine instead **reports its `act` group by name on every run**,
  as an information line.
- **Why not simply fail the engine too.** A check that is red forever is a check everyone learns to
  scroll past, and it would take the seven real checks down with it. Naming the write surface out
  loud on every run keeps it visible without training Steven to ignore the verifier.
- **Why a word match and not a substring.** Measured against all eight real `--help` outputs on
  2026-09-22: a bare `grep -q act` matches **all seven** site harnesses — `interactive` everywhere,
  `action` in SkySlope and zipForms, `redact`/`redacted` in Lofty and Zoho. `grep -qw act` is the
  version that means what it says.
- **What the guarantee actually rests on.** Denying `act` denies every outward verb on all five web
  targets at once: every showing request, every Showami booking, every e-sign send is an
  `act click`/`act type` underneath. `page open` stays allowed but URL-allow-listed, because a
  crafted URL can itself perform an action on some sites.
- **Owner.** Build Engineer proposed; coordinating session confirmed. **Status.** Active, implemented
  in `mac-verify.sh` 2026-09-22 and proven on all five branches (ok · engine-info · `act` on a site
  harness ⇒ FAIL · `--help` non-zero ⇒ FAIL · missing ⇒ FAIL). Never run on macOS — see the
  verification caveats in `docs/findings/findings-P1.json`.

## 2026-09-22 — CLI-Anything is Apache 2.0, and `setup.py` saying MIT does not change that

- **Decision.** Upstream HKUDS/CLI-Anything is governed by **Apache License 2.0**. Its
  `browser/agent-harness/setup.py:29` declares `license="MIT"` with an OSI MIT classifier; that
  string is **wrong and is left exactly as upstream wrote it**, because the vendored tree is
  unmodified and a provenance record that quietly "corrects" upstream is no longer a provenance
  record.
- **Why Apache governs.** The repository's own `LICENSE` file is 201 lines of verbatim Apache 2.0,
  `README.md` and `cli_anything/browser/README.md` both agree, and Apache is the stricter of the two
  on attribution — so it is also the safe reading if the ambiguity is ever tested.
- **What compliance required.** `LICENSE` vendored beside the tree byte-identical to upstream; no
  NOTICE file exists upstream, so there is none to carry; no upstream file modified, so §4(b)
  modified-file notices did not arise **at the time of vendoring**. If any file is later patched,
  §4(b) applies and `VENDORED.md` must stop claiming the tree is unmodified.
- **Owner.** Build Engineer. **Status.** Active. Upstream commit `34f5195`, fetched 2026-09-22.
