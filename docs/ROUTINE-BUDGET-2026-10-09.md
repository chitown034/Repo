# Routine budget — 2026-10-09

Steven: "ensure all sections of the dashboards that require updates are on routines and nothing is stale and
working efficiently and updated reasonably without burning all of my tokens."

## What was wrong

25 of 49 enabled cloud routines had failed their last run with **USAGE_LIMIT_REACHED** — the weekly Claude allowance
was spent. Scheduled routines were firing about **199 times a week**; 35 of those runs were on Opus 5.5.
Several daily writers fed cards that the deck itself treats as fresh for 8 days (`staleHrs: 192`).

## Freshness (computed in code, 2026-10-09 ~18:30 UTC, `scripts/feed_freshness.py`)

17 fresh · 2 late (weather, news — the 13:35 run hit the usage limit) · 3 stale, all waiting on Steven
(appleHealth: phone recipe; zohoSync: Zoho permission; knowledgeGraph: Mac task never run) · 1 waiting
(healthNotionSync) · 2 with no standard stamp (leadTriage, vanessaBrief carry `ranAt`).

## Changes made (each reversible; old schedule shown)

| Routine | Was | Now | Runs/week |
|---|---|---|---|
| Elite Rewards scan note | `56 12 * * *` | `56 12 * * 1` | 7 → 1 |
| PE & Defense notes | `47 13 * * *` | `47 13 * * 1,4` | 7 → 2 |
| Builder incentives note | `53 13 * * *` | `53 13 * * 3` | 7 → 1 |
| Top performers note (market-close recap) | `26 13 * * *` | `26 13 * * 2-6` (after each weekday close) | 7 → 5 |
| Scrape queue runner (jobs are Daily/Weekly with a 20 h window) | `7 9,13,17 * * *` PT | `7 9 * * *` PT | 21 → 7 |
| Pipeline sync, Deck ↔ ISA (ISA works Mon–Fri 12–4 PT) | `0 4,10,16,22 * * *` | `0 15,20,23 * * 1-5` | 28 → 15 |
| AI twin autopilot (Opus) | `57 7,17 * * *` PT | `57 7 * * *` PT | 14 → 7 |
| Morning feeds (now always the full morning run) | `20 0,12 * * *` | `20 12 * * *` | 14 → 7 |

**About 199 → 139 runs a week (−30%).** Command Deck v186 moved two "stale" thresholds to match: Opportunity radar
18 → 30 h, Top performers 30 → 80 h (covers the weekend). Nothing else on the page changed.

## Needs Steven (agents cannot change routines he created)

Switch off three duplicate Sunday loops; each reads the whole 4.5 MB deck, and Saturday's
"Weekly Loop Engineering + Self-Test" plus the free GitHub `brain-loop` check already cover them:
- https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY (Weekly Loop Engineering QA, Sun 16:00)
- https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX (weekly improvement loop, Sun 16:00)
- https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX (weekly self-improvement loop, Sun 15:00)

Optional, his call (a model change is his decision): move the daily Opus routines — AI twin autopilot, Attraction
Command Center, RoleCompass — to Sonnet. They follow fixed checklists; that is about 19 Opus runs a week.
