# E2 — Markets · Cycle 6 report
Baseline 2026-09-12 · verified 2026-09-22 · branch `e2-markets` · commit `5e727d3`
Regions: panel-apex, panel-quantvue, panel-hedgefund, panel-openterminal + the markets JS named in BRIEF §7.
Gate: `quickcheck.py` — every line PASS except the known false-positive undefined-function line; diffed against the
base deck's 674 false positives, **zero new names introduced**. `node --check` clean. All new element ids exist.

## What changed (10 edits, 178 insertions / 49 deletions, all inside E2's regions)

| # | Area | Change |
|---|---|---|
| 1 | STRATEGY seed | Re-baked from `strategySnapshot` (2026-09-16T03:26Z): 28 live rows replace the 6-row 2026-09-07 hand read. `renderStrategyTables()` now prefers a newer doc on the device; `MAX_YTD` recomputed per render; r4-quantvue-sync's 7 drawdown flags rendered in a new `strategyFlagsNote`. |
| 2 | STRATEGY columns | The sync carries percentages only, so **Sim size** and **BT / fwd P&L** render an em dash rather than repeating a 15-day-old figure. The diversified-stacks table is left at the 2026-09-07 hand read and now says so — the sync does not read that section of the sheet at all. |
| 3 | ECONODAY | Re-baked from `liveFeeds.econodayLiveList` (2026-09-20). 8 released rows carry **actuals**: FOMC hiked 25bp 12–0 to 3.75–4.00% on Sep 16, retail sales +1.2%, starts −2.6%, claims 196K, UMich 47.8. Sep 21–25 week ahead added. FOMC remaining list corrected to Oct 27–28 / Dec 8–9. PCE shows the Sep 26-vs-Sep 30 source conflict instead of picking one. |
| 4 | Session read | Undated Aug-28 copy (Nasdaq 26,402) replaced by the stamped Sep 21 close (Nasdaq record 27,122.09) and now re-renders from `topPerformersLiveList` with the feed's own citations. |
| 5 | Hedge fund — tool bug | Agent prompts told all 7 agents to call `search_market_data`, **a tool that has not existed since 2026-09-11**; the declared tool is `dashboard_market_data`. Renamed at all 5 sites. |
| 6 | Hedge fund — copy | "Each agent can search the live web" corrected: the Mac path searches, the in-page path reads this deck's documents plus what Steven pastes. |
| 7 | Hedge fund — Remote Run | Mac path listed first as the one that works. Cloud path carries a red **Known broken** badge with the exact 2026-09-13 AAPL failure (egress blocked to Yahoo/stooq/sec.gov/apple.com/macrotrends), and states the Sep 21 SUCCEEDED run wrote no memo. `hfReqStatus` now tells a failed request to re-run on the Mac. |
| 8 | Risk monitor | New `riskMonitorNote` reads the previously **orphaned** `riskMonitor` doc: r17-trading-day-log last ran 2026-09-17 and errored, 0 accounts, 0 recorded daily-loss figures, last three sessions listed. |
| 9 | OpenTerminal | Staleness badge reads the age in days (red past 72h) and says `snapshot.sh` is hand-run, not scheduled. The console card names `openterminal-remote-queue` with its real hourly 6:45 AM–9:45 PM PT window and last clean run. |
| 10 | Sector fallback | Hard-coded "9 of 11 … As of 4:15pm EDT, Sep 2, 2026" replaced by counts derived from the document and the document's own `asOf`. |

Verified in a Node DOM shim against the live docs, an empty store and malformed docs — no throws in
`renderStrategyTables`, `renderRiskMonitor`, `renderEconoday` or `renderSessionRead`.

## Not re-baked, and why
- **TOP_PERFORMERS** (F-E2-15) — `topPerformersLiveList` is an index/mover narrative, a different shape from the four
  stocks/ETF/dividend/fund tables. Not re-bakeable. Row-level source dates retained; stamp text clarified.
- **OpenTerminal** — no baked seed exists (`OPENTERMINAL_SEED_STAMP = null`, doc-only by design). Nothing to re-bake.
- **TV_INTEGRATION_SYNCED_AT** — 2026-09-07 is the real setup date; reference stamp, left alone.
- **Prop-firm automation callout** — already dated Sep 2026 and hedged. No change.
- **STACKS** — the live doc has no stacks section; seed kept, now labelled as the 2026-09-07 hand read.

## You.com (RETIRED rule)
Nothing to retire in E2's regions. No call site, credit, button or `you-*` name in panels 10–13 or the markets JS.
The file's four remaining mentions are comments recording the 2026-09-11 removal (lines 7777, 23926) and CI-log
history (18146, 18154), both protected. The in-page hedge-fund and TradingView-Analyzer runners use `window.claude`
sampling, not a search connector — no button silently fails.

## Needs Steven (halt = true)
1. **F-E2-09 — cloud egress for the hedge-fund committee.** The AAPL remote run failed 2026-09-13 because the cloud
   session could not reach Yahoo Finance, stooq, sec.gov, apple.com or macrotrends. Until that is opened, the committee
   is Mac-only and the card now says so. Decision: open egress, or retire the cloud routine and keep `/ai-hedge-fund-team`.
2. **F-E2-11 — the daily trading log.** `r17-trading-day-log` has been failing since 2026-09-17 and `riskMonitor.accounts`
   has never held anything. Making the log real needs Steven to decide whether the 69 futures / 45+ forex prop accounts
   get wired in (credentials and a data path per firm), plus Derek repairing the task.
3. **F-E2-18 — Apex skill naming.** The card still hedges that `apex-trader` "hasn't reliably stayed installed". The skill
   is present today; the inventory has no history on its reliability, so the hedge was left rather than overwritten.

## For the integrator (cross-region)
- **F-E2-12** — the sector fallback note I edited sits inside `renderMarketSnapshot` (~line 20965 base), the function
  whose `MARKET_SNAPSHOT_DEFAULT` seed E1 owns. My edit touches only the sector `<p>`. Merge E1's seed and this note together.
- **F-E2-15** — the structural fix (a second note element so the live feed stops stamping the static Top-performer
  tables) needs one `<p>` in panel-personalaccounts ~line 3153. That markup is E3's.
- **F-E2-16** — `FRESH_FEEDERS` (~19761, E1's) credits `feeds-market-close` with writing `topPerformersLiveList`;
  the feed's own `source` says a Perplexity/claude-code session wrote it at 2026-09-22 08:05 UTC while that task last
  ended 2026-09-15. Also: `mac-runner-status` says r4-quantvue-sync is "ok" while `routineHealth` says "late, 3 cycles
  missed". Both are doc-to-task wiring questions for Derek.
- **F-E2-19** — extending r4-quantvue-sync to capture the sheet's sim-size and BT/fwd P&L columns and the
  diversified-stacks section would remove the em dashes and unfreeze the stacks table. No new credential needed.

## Findings
19 findings in `audit/findings-E2.json` (F-E2-01 … F-E2-19): 8 P1, 8 P2, 3 P3 · 2 halts ·
resolutions — 7 Fixed, 3 Improved, 3 Escalated, 6 Open.
