# Decisions — append-only, dated

One entry per decision. **Append, never edit and never delete.** A reversal is a new entry that
names the entry it reverses. Format: `## YYYY-MM-DD — <decision>` then Decision / Why / Owner /
Status. Read the entry you need, not the file.

Seeded 2026-09-22 with the decisions made in Loop Cycle 6. Everything before that date lives in the
deck's CI log and the loop log; this file starts here on purpose.

---

## 2026-09-22 — Follow Up Boss is retired; Lofty is the real-estate CRM

- **Decision.** Follow Up Boss is replaced by **Lofty** (formerly Chime) as the real-estate CRM.
  Every FUB dependency is retired. History stays honest: where a number came from FUB, it is
  labelled "was Follow Up Boss until 2026-09-22".
- **Why.** The Mac tasks `r2-lead-response-watchdog` and `lead-triage-daily` have logged
  "Invalid API Key or authentication credentials" since 2026-09-16, even though Composio still
  reports the FUB connection ACTIVE.
- **How Lofty is reached.** The Mac has `lofty-bridge` (read-only MCP over Lofty's REST API; key
  expected in `~/.config/lofty/.env`, obtained at Lofty → Settings → Integrations → API) and
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
