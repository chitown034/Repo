# Command Deck — freshness routines (who refreshes what, and how often)

As of 2026-10-12. Steven's rule (2026-10-12): every block refreshes at least once a day, more often
where the data moves faster; anything without today's date gets refreshed with sourced data or an
honest "cannot refresh from the cloud" stamp. Judge a block by the stamp on the card, never by this table.

## Cloud routines (Claude subscription, WebSearch only, ArtifactData writes; never publish/Edit)

| Block (doc / key) | Routine | Schedule (UTC) |
|---|---|---|
| Global + local news (`newsSnapshot`), city lists, housing lists | Command Deck — weather & news (writer) | 01:35 and 13:35 daily |
| Headlines, AI news, on-this-day, Bears news, opp radar (`liveFeeds`) | Command Deck — morning feeds (writer, Claude) | **13:05** daily (moved 2026-10-13 to land after the Mac's 12:50 UTC overwrite) |
| Morning brief to the phone (push; reads `twinBrief`, calendar, weather, the six morning keys, market, rates) | Vanessa — morning brief to Steven's phone (cloud) — `trig_01Q9VPMwrKwNUW3kZL54rKgy` | 13:48 daily (6:48 AM PT) |
| Econoday live note | Command Deck — Econoday note (writer) | 12:35 daily |
| Elite rewards scan note | Command Deck — Elite Rewards scan note (writer, **daily** since 2026-10-12, was Mondays) | 12:56 daily |
| Top performers / session read | Command Deck — top performers note (writer) | 13:26 Tue–Sat |
| PE & Defense + @DefenseUpdates notes | Command Deck — PE & Defense notes (writer, **daily** since 2026-10-12, was Mon/Thu) | 13:47 daily |
| Builder incentives note (+ ISA mirror) | Command Deck — builder incentives note (writer, **daily** since 2026-10-12, was Wednesdays) | 13:53 daily |
| Elite Affluent note | Command Deck — Elite Affluent note (writer, **daily** since 2026-10-12, was Sundays) | 15:51 daily |
| Market close (`marketSnapshot`, mkt movers/sectors) | Command Deck — market close (writer, Claude) | 21:20 Mon–Fri |
| **Safety net: every stale doc/key >26 h, market-close catch-up, ISA Portal mirror (4 liveFeeds keys + ratesSnapshot), `feedFreshness` report** | Command Deck — daily freshness sweep (writer, Claude) — `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` | 03:40 and 15:40 daily |

The sweep was created from a cloud session that holds no connector grants, so it runs **without** the
AccuWeather connector: its weather step skips itself and weather stays with the Mac task plus the
weather & news writer. To give it AccuWeather, recreate it from the claude.ai routines UI with that
connector attached (needs Steven; HALT: account change).

## ISA Portal mirror (https://claude.ai/code/artifact/4348b34d-afa0-4d2e-8214-29b1319cf041)

The ISA Portal reads the same live documents as the deck (`ratesSnapshot`, `liveFeeds`: builder note and
the three housing-market lists) and bakes its own fallback rows. Writers that mirror: weather & news
(morning run, market lists), builder incentives (its note), and the daily freshness sweep (all four keys
plus `ratesSnapshot` whenever the deck's copy is newer). Baked seeds are mirrored by a session pass:
`dashboard/wave2/refresh-stale-isa.py <isa> <deck> <ratesSnapshot.json> <date>` — last run 2026-10-12
(ISA v44: VA/FHA/jumbo and Benchmark rate rows, three builder write-ups, program-facts and market stamps).

## Mac tasks (the cloud cannot write these)

| Block | Mac task | Schedule (PT) |
|---|---|---|
| Weather (`weatherSnapshot`, wttr.in) | weather-news-refresh (did not write 2026-10-13; a session wrote v43 from AccuWeather) — the cloud sweep takes over once Steven adds the AccuWeather connector to it (NEEDS-STEVEN 102) | 8:05 AM / 8:05 PM |
| Mortgage rates + market stats (`ratesSnapshot`) | mortgage-rates-daily | daily (last write 2026-10-12 13:39 UTC) |
| Calendar (`calendarSnapshot`) | calendar-daily-sync | 6:35 AM / 5:35 PM |
| QuantVue strategy (`strategySnapshot`) | r4-quantvue-sync | last write 2026-10-09 |
| AI Hedge Fund memo (`hfCommitteeMemo`), marketing queue, weekly brief → Next Moves / SWOT, Apple Health, TV integration check | weekly loop / hand runs | stale: Sep 7 – Sep 22; needs the Mac |

## Baked seeds (HTML, refreshed by a session pass, not a routine)

Bears tracker tiles, top-performers tables, opportunity radar, builder write-ups, PE/defense and
affluent curated tables, VA comp table, loan program facts, elite-rewards tables, travel listings.
Last full pass: 2026-10-12 (`dashboard/wave2/refresh-stale.py` + `research-2026-10-12/`, deck v192).
Ask for "refresh stale deck blocks" to run the next pass; the script refuses to run twice on one deck.

## Known failure modes

**A Mac task overwrites `liveFeeds` wholesale (found 2026-10-13).** `openrouter-feeds-refresh` (5:50 AM PT),
`feeds-weekly` (9:40 PM PT) and `feeds-market-close` (10:15 PM PT weekdays) `set` the whole document from a
stale local copy with typed stamps, erasing the cloud writers' entries and pushing housing lists back days.
They were to be paused on 2026-10-05 (`integrations/mac-fix-all-2026-10-05.md` 1.1) and were not. Until Steven
pauses them, the sweep's CLOBBER GUARD refills what they erase and names them in `feedFreshness.note`, and
the morning feeds routine runs after the 12:50 UTC slot. Record: `routines/cloud-routine-repairs.md`, 2026-10-13.


Cloud runs fail with `USAGE_LIMIT_REACHED` when the subscription is capped (market close Oct 9,
top performers Oct 10, Elite Affluent Oct 11, Gridiron game-day Oct 12). The sweep exists to backfill
after such a miss; if the sweep itself hits the cap, the stamps on the cards stay honest.
