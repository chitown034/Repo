# R10 — freshness: the whole dashboard current, nothing stale (2026-09-28)

Steven, 2026-09-28, verbatim: *"go through entire dashboard ensure all info is current and nothing is stale"*,
then *"have engineers fix anything stale or not working"*, then *"make sure entire dashboard is live and not
stale"*.

## 1. Why the dashboard went stale — three causes, measured

1. **The account's usage limits.** Cloud routines, Mac tasks, parallel engineers and Steven share one allowance.
   When it ran out, 34 of 66 routines failed their last run (Sep 24–28). The weekly allowance is at its warning
   level until 2026-10-04 20:00 UTC.
2. **Research-only cloud routines.** 19 enabled feed routines (~22.7 runs a day) researched and ended with JSON
   that nothing applied — they never wrote the dashboard. Steven chose to convert them to writers and cut the
   duplicates (decision entry 2026-09-28).
3. **The Mac runner's dashboard syncs.** The runner itself is alive (it sent Vanessa's brief at 01:19 UTC on
   2026-09-28), but its status report and the syncs it writes stopped 2026-09-23 7:05 PM PT, mid-way through
   `fabric-deck-sync` — see `docs/NEEDS-STEVEN.md` items 63 and 72.

## 2. What the engineers changed — `docs/findings/findings-R10.json` (106 rows)

The scanner flagged 493 dated lines (deck 405, ISA 88). The engineers worked the highest-risk ones in capped
queues; many flags were correct history and were left alone (`works`).

| Lane | Rows | Fixed | Works (left, correct or re-verified) |
|---|---|---|---|
| A — lending, tax, property; ISA mirrors | 45 | 13 | 32 |
| B — markets, wealth, rewards, PE & defense, career | 30 | 17 | 13 |
| C — daily ops, health, travel, orchestration | 31 | 19 | 12 |

Examples: hard-coded countdowns replaced by runtime ones (the ISA's Q3 licensing window, card-offer deadlines);
expired offers marked expired; rate-table rows and VA refinance figures re-sourced from the lenders' own pages
with their own dates; the market snapshot moved to the Sep 25 close; Econoday rows switched from consensus to
released actuals; a closed deal recorded as closed; "runner silent" wording corrected to "runner alive, its
dashboard sync failing" (8 lines). Every changed fact carries its source URL in the findings row. Nothing was
stamped with today's date unless it was re-sourced today.

## 3. One pre-existing bug fixed while gating

The ISA Portal halted entirely when the runtime's `claude.use("db")` threw synchronously (harness
`--inject claude:throwing`: FAIL on v35 too). It now falls back to local-only mode. All four harness variants
pass.

## 4. What is live

- **ISA Portal v36** — published 2026-09-28 (a copy is `dashboard/isa/isa-portal.html`).
- **Command Deck** — the R10 fixes are merged on the integrator's master; they publish with the AI Team page
  update as v158.

## 5. Not done in R10

- The ~390 remaining scanner flags were not individually reviewed.
- Rebuilding the feed documents by hand (weather, news, rates) was dropped in favour of the routine conversion,
  which makes the routines write them on schedule.
