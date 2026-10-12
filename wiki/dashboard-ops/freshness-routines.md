# Command Deck — freshness routines (who refreshes what, and how often)

As of 2026-10-12. Steven's rule (2026-10-12): every block refreshes at least once a day, more often
where the data moves faster; anything without today's date gets refreshed with sourced data or an
honest "cannot refresh from the cloud" stamp. Judge a block by the stamp on the card, never by this table.

## Cloud routines (Claude subscription, WebSearch only, ArtifactData writes; never publish/Edit)

| Block (doc / key) | Routine | Schedule (UTC) |
|---|---|---|
| Global + local news (`newsSnapshot`), city lists, housing lists | Command Deck — weather & news (writer) | 01:35 and 13:35 daily |
| Headlines, AI news, on-this-day, Bears news, opp radar (`liveFeeds`) | Command Deck — morning feeds (writer, Claude) | 12:20 daily |
| Econoday live note | Command Deck — Econoday note (writer) | 12:35 daily |
| Elite rewards scan note | Command Deck — Elite Rewards scan note (writer, **daily** since 2026-10-12, was Mondays) | 12:56 daily |
| Top performers / session read | Command Deck — top performers note (writer) | 13:26 Tue–Sat |
| PE & Defense + @DefenseUpdates notes | Command Deck — PE & Defense notes (writer, **daily** since 2026-10-12, was Mon/Thu) | 13:47 daily |
| Builder incentives note (+ ISA mirror) | Command Deck — builder incentives note (writer, **daily** since 2026-10-12, was Wednesdays) | 13:53 daily |
| Elite Affluent note | Command Deck — Elite Affluent note (writer, **daily** since 2026-10-12, was Sundays) | 15:51 daily |
| Market close (`marketSnapshot`, mkt movers/sectors) | Command Deck — market close (writer, Claude) | 21:20 Mon–Fri |
| **Safety net: every stale doc/key >26 h, market-close catch-up, `feedFreshness` report** | Command Deck — daily freshness sweep (writer, Claude) — `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` | 03:40 and 15:40 daily |

The sweep was created from a cloud session that holds no connector grants, so it runs **without** the
AccuWeather connector: its weather step skips itself and weather stays with the Mac task plus the
weather & news writer. To give it AccuWeather, recreate it from the claude.ai routines UI with that
connector attached (needs Steven; HALT: account change).

## Mac tasks (the cloud cannot write these)

| Block | Mac task | Schedule (PT) |
|---|---|---|
| Weather (`weatherSnapshot`, wttr.in) | weather-news-refresh | 8:05 AM / 8:05 PM |
| Mortgage rates + market stats (`ratesSnapshot`) | mortgage-rates-daily | daily (last write 2026-10-12 13:39 UTC) |
| Calendar (`calendarSnapshot`) | calendar-daily-sync | 6:35 AM / 5:35 PM |
| QuantVue strategy (`strategySnapshot`) | r4-quantvue-sync | last write 2026-10-09 |
| AI Hedge Fund memo (`hfCommitteeMemo`), marketing queue, weekly brief → Next Moves / SWOT, Apple Health, TV integration check | weekly loop / hand runs | stale: Sep 7 – Sep 22; needs the Mac |

## Baked seeds (HTML, refreshed by a session pass, not a routine)

Bears tracker tiles, top-performers tables, opportunity radar, builder write-ups, PE/defense and
affluent curated tables, VA comp table, loan program facts, elite-rewards tables, travel listings.
Last full pass: 2026-10-12 (`dashboard/wave2/refresh-stale.py` + `research-2026-10-12/`, deck v192).
Ask for "refresh stale deck blocks" to run the next pass; the script refuses to run twice on one deck.

## Known failure mode

Cloud runs fail with `USAGE_LIMIT_REACHED` when the subscription is capped (market close Oct 9,
top performers Oct 10, Elite Affluent Oct 11, Gridiron game-day Oct 12). The sweep exists to backfill
after such a miss; if the sweep itself hits the cap, the stamps on the cards stay honest.
