# Daily updates — what refreshes the three dashboards, and when (2026-10-23)

Steven, 2026-10-23: "ensure command deck, isa portal and 6d brain are updated daily." Every row below is a cloud routine on
his Claude subscription (ids in `cloud-routines-2026-10.md`) unless marked Mac. Times are Pacific. If a row's `last_run` is not
SUCCEEDED, the freshness sweep flags it and the Big-moves task raises a "Repair" move.

| Dashboard | What | When | Writer |
|---|---|---|---|
| Command Deck | morning feeds (headlines, on-this-day, Bears, opportunity radar) | 6:05 | cloud `morning feeds` |
| Command Deck | Four courses of action (16 moves) + questions + top 10 → `bigMoves` (items, coas, questions), `vanessaRecommendations` (lane field), `aiTeamOrg` | 6:05 | cloud `Big moves` |
| Command Deck | Chief-of-Staff cycle → `cosBrief`, `vanessaQueue` | 6:25 weekdays | cloud `daily cycle` |
| Command Deck | `morningBrief` + push (+ e-mail until iMessage is linked) | 6:34 | cloud `morning brief` |
| Command Deck | iMessage text + voice note (or e-mail with mp3) | 6:40 | Mac `vanessa-morning-brief-text`, `voice-reply-render` |
| Command Deck | weather & news, city and housing lists | 6:35 / evening | cloud `weather & news` |
| Command Deck | Apple Health tiles ← Health Auto Export files in Google Drive → `appleHealth`; Strava card ← Strava connector → `stravaSnapshot`; MyFitnessPal via Apple Health | 6:15 | cloud `Health daily sync` (`scripts/health-drive-sync.py`) |
| Command Deck | Fieldy meetings → `fieldyDesk`, `memory/fieldy-meetings.md` | 6:50 | cloud `Fieldy → brain` |
| Command Deck | freshness sweep (every stale key re-checked, per-key cadence) | 8:40 | cloud `freshness sweep` |
| Command Deck | market close | 14:20 weekdays | cloud `market close` |
| Command Deck | Lofty / Zoho pipeline, rates, calendar, Apple Health | 07:05 / 13:05 / 19:05 | Mac `fabric-deck-sync`, `lofty-crm-sync` |
| ISA Portal | `isaToday`, hand-offs, scorecard | 6:25 (inside the cycle) | cloud `daily cycle` |
| ISA Portal | housing-market lists, builder incentives, live feeds (mirror of the deck) | with each deck writer | the same cloud routines (MIRROR STEP) |
| 6D Brain | full rebuild from the repo (nodes, passages, layers, recs, Vanessa) | 3:30 | cloud `6D rebuild` |
| 6D Brain | four-lane panel + questions republish | 6:05 | cloud `Big moves` |
| 6D Brain | layers audit (`bin/brain layers`) | weekly Sun | cloud `layers` |
| Repo | sessions ledger, index, CI | daily / on push | cloud `sessions ledger`, GitHub Actions |

Checked 2026-10-23: every cloud routine's last run SUCCEEDED (pages 1–7 of the trigger list). The Mac side is the weak link
(`runnerStatus` v66 lists six tasks in error — `integrations/mac-task-specs.md` §9).

## Cloud routines not green on 2026-10-23 (read from the trigger list, all pages)

| Routine | Last run | Why | What happens |
|---|---|---|---|
| Things I Wish I Knew book — monthly (5th) | FAILED 2026-10-02 | usage limit reached that morning | re-runs 2026-11-05 by itself |
| Rent, Buy, or Wait — monthly (9th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-09 |
| Muster Point — monthly (8th) | FAILED 2026-10-02 | usage limit | re-runs 2026-11-08 |
| Nellis VA Webinar deck — monthly (7th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-07 |
| NAVWAR PM Deck — monthly (6th) | FAILED 2026-10-01 | usage limit | re-runs 2026-11-06 |
| Tech & AI Command Deck — monthly (3rd) | ABANDONED 2026-10-18 (manual re-fire) | session abandoned mid-run | re-runs 2026-11-03 |
| VA Command Center — monthly (4th) | ABANDONED 2026-10-18 (manual re-fire) | session abandoned mid-run | re-runs 2026-11-04 |
| Gridiron Codex — weekly Bears | ABANDONED 2026-10-20, now **disabled** | disabled 2026-10-22 | stays off unless Steven asks |

None of these feeds the three daily dashboards. They are heavy Opus research runs; firing all of them in one day is what tripped the
cap on Oct 1–2, so they were left on their own dates. Say "re-run the monthly refreshes" and they are fired one per hour.
Two guard routines are off by design (Strava wrapper guard, feed-freshness watchdog) — both replaced by the 15:40 UTC freshness sweep.

## Process coverage (2026-10-26)

The document-level version of this table is the process-coverage register: `bin/brain coverage --db <export> --write`
→ `docs/inventory/process-coverage.md` (gaps first, owner seat per row), the `processCoverage` deck document and the live
Process coverage card in Orchestration. The freshness sweep reads it (STEP 1b). The Big-moves routine's "Refresh <doc>"
step should take its stale list from `bin/brain coverage --db <export> --json` (its `gaps`) instead of this table once
that routine's session adopts the step — its prompt can only be edited from the conversation it posts into.

