# E1 — daily-ops · Cycle 6 report
Baseline 2026-09-12 · verified 2026-09-22 · branch `e1-daily` · commit `0f56e42`
Worktree: `scratchpad/wt-e1-daily/command-deck.html` · 177 insertions / 151 deletions, one file.

## Scope covered
Panels: panel-brief, panel-news, panel-appointments, panel-pto, panel-tools, panel-masterplan,
panel-kanban, panel-processexcellence, panel-opsradar.
JS: WEATHER_*, NEWS_*, ON_THIS_DAY_*, BEARS_*, CAL_*/TRACKED_CALENDARS, MARKET_SNAPSHOT_DEFAULT,
FRESH_FEEDERS, execSyncRegistry (comment only), OUTPUT_WATCH.
Untouched as instructed: footer build stamp, `PAGE_DEFS`, `panelStampRegistry`, the
`<!-- PANEL: MASTER PLAN -->` marker, the final `</script>`, `CI_LOG_DEFAULT`, and the three
"Follow Up Boss import" label lines (E4a's). Verified by grepping the diff.

## Seeds re-baked (from `scratchpad/db/state` only — nothing invented)
| Seed | Was | Now | Source doc |
|---|---|---|---|
| `WEATHER_SNAPSHOT` / `WEATHER_SYNCED_AT` | 2026-09-07 10:05 AM PDT | 2026-09-21 08:05 PM PDT, 7 cities | `weatherSnapshot` |
| `NEWS_GLOBAL` / `NEWS_LOCAL` / `NEWS_SYNCED_AT` | 2026-09-07 | 2026-09-21 08:05 PM PDT, 5 global + 11 cities | `newsSnapshot` |
| `MARKET_SNAPSHOT_DEFAULT` | Sep 4 close | Sep 18 close (3 indices, 7 movers, 5 sectors, 6 sources) | `marketSnapshot` |
| `ON_THIS_DAY_HISTORY` / `_BIRTHDAYS` | 2026-09-07 | 2026-09-20 (6 + 7 rows) | `liveFeeds.onThisDay*List` |
| `BEARS_DATA` / `BEARS_NFC_NORTH_STANDINGS` | Sep 7 preseason | Sep 20 (Bears 1-1) | `liveFeeds.bearsLiveNews` |
| `CAL_UPCOMING` | empty by design | left empty | `calendarSnapshot` read live at render |

Not re-baked and why: `CAL_UPCOMING` has no seed on purpose (rendering last week's meetings as
upcoming is worse than an empty panel) and `renderCalUpcoming` already reads `calendarSnapshot`
directly. `CI_LOG_DEFAULT` was out of scope.

Two honesty constraints applied while re-baking:
- The on-this-day and bears feeds are dated **Sep 20**, not today. Rather than present them as
  today's, `renderOnThisDay` now names the calendar day the entries cover and flags when that is
  not today (new helper `onThisDayCoversText`).
- The bears feed confirms only Chicago 1-1 and Minnesota 2-0. Green Bay and Detroit are rendered
  blank in the standings table instead of being guessed or left at 0-0-0.

## Cadence and attribution corrections (against `inventory/mac-runner-status.md`)
- weather-news-refresh: page said 5:45 AM / 10:45 PM and "3x/day (6/12/6)". Cron is `5 8,20 * * *`
  → 8:05 AM / 8:05 PM PT, twice daily. Three strings fixed.
- calendar-daily-sync: page said three runs at 6:25 / 12:25 / 5:25 PM. Cron is `35 6,17 * * *`
  → 6:35 AM / 5:35 PM PT. Four strings fixed.
- `OUTPUT_WATCH` ratesSnapshot: credited to r5-rates-market-refresh (never run) → re-pointed to
  mortgage-rates-daily, window 200h → 80h.
- `OUTPUT_WATCH` knowledgeFabric: 200h window on a task that runs every 2h → 14h.
- `OUTPUT_WATCH` additions: `loftyLeads` (lofty-crm-sync, 14h) and `zohoSync`
  (zoho-crm-sync cloud 4x daily, 14h). Neither doc exists yet, so both show
  "Never produced output" — the honest state, and the signal when the first sync lands.
- `FRESH_FEEDERS`: the crons and times were already right; what was wrong was the present tense.
  Nine entries now carry the writing task's real status (openrouter-feeds-refresh error since
  2026-09-17, feeds-weekly limited, feeds-market-close last completed 2026-09-15, strava-daily-sync
  error, r8 blocked on the dead ingest daemon, r14 error, r5/r9/r20 never run).

## Ops Radar
- Speed-to-lead now measures a **Lofty** lead, keeps the Follow Up Boss history explicit
  (retired 2026-09-22; r2 has logged "Invalid API Key" since 2026-09-16) and states the metric
  cannot fill until the watchdog is re-pointed at the lofty-bridge MCP.
- Backup copy-prompt rewritten to Steven's spec: `Documents/AI-Ecosystem-Backups/YYYY-MM-DD`,
  Sundays 00:00 local, rolling 8 weeks, integrity check, one retry, escalate after two failures,
  log every run. The card now says the 2026-09-14 figures came from a Claude session, that
  r6-weekly-backup has never run and missed its Sep 20 slot, and that the copy is same-disk only.

## Gate
`python3 tests/quickcheck.py wt-e1-daily/command-deck.html` — PASS on every line except the known
false-positive "functions called but never defined", whose output is byte-identical to the
pre-edit baseline. A candidate-set diff against the baseline file shows the only names E1 added to
that list are `backup`, `crash`, `pause`, `watchdog`, `wildfire` — all plain words inside re-baked
headline and market-snapshot strings, the same class as `$10B`. The only new function definition is
`onThisDayCoversText`, which is defined. `node --check` on the extracted inline script passes, all
39 panels carry a title, no duplicate ids, tag counts unchanged, and every element id referenced by
the code I touched exists. Each re-baked seed was additionally evaluated in Node to confirm shape.

## Needs Steven (halt = true)
1. **Backup (F-E1-14)** — r6-weekly-backup has never run. A scheduled run dies on its first
   permission prompt, so only he can open it in the desktop app and press Run now once. Until then
   the entire dashboard has one 8-day-old, same-disk copy.
2. **Feed task (F-E1-18)** — openrouter-feeds-refresh has been failing since 2026-09-17; six daily
   feeds are alive only because a Claude session filled them by hand.
3. **CRM rewiring (F-E1-13)** — r2-lead-response-watchdog, lead-triage-daily, r11-isa-kpi-compile
   and showing-sync all still point at Follow Up Boss and need the Lofty key in
   `~/.config/lofty/.env` plus a Mac-side task edit. For Derek's Integration Engineer.
4. **Calendars (F-E1-20)** — the Patriot Pacific work calendar shares free/busy only (no titles
   reach the deck) and the SPACE CA calendar errors on every read.

## For the integrator
17 lines outside my regions still render literal `\uXXXX` escapes as text (F-E1-16): 582, 1360,
1364, 1808, 1812, 1817, 1821, 2441, 2933, 4587, 4591, 5156, 5743, 5795, 5797, 5807, 6207 — line
numbers against the E1 worktree at `0f56e42`.

## Nothing unfinished
Every assigned panel and JS region was inspected. panel-pto, panel-tools and panel-kanban needed no
change; panel-processexcellence was reviewed in full and carries no stale claim (F-E1-21).
