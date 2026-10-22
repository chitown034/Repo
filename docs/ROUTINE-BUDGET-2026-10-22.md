# Routine budget — 2026-10-22

Steven (2026-10-22): "streamline efficiencies… fix anything not working." The weekly Claude allowance is the
binding limit: 14 routines failed on `USAGE_LIMIT_REACHED` this month (the allowance resets about Sunday 20:00 UTC).
The 2026-10-09 cuts (`docs/ROUTINE-BUDGET-2026-10-09.md`) had come undone: the five research-note writers were back
to daily (changed 2026-10-12), and the freshness sweep re-researched any key older than 26 hours.

## Runs per week (scheduled cloud routines, enabled, as listed 2026-10-22 ~14:30 UTC)

| | Runs/week |
|---|---|
| Before (54 recurring routines; monthlies counted as 0.23/week) | **≈ 202** |
| After the changes below | **≈ 133 (−34%)** |
| After Steven also does the "Steven only" list below | **≈ 127 (−37%)** |

Opus runs a week are unchanged (about 9 plus the monthlies). See the model note at the end.

## Changed (all routines created via `meta_mcp`; each reversible: set the old schedule back or `enabled=true`)

| Routine | Id | Old schedule | New schedule / state | Runs/wk | Why |
|---|---|---|---|---|---|
| Elite Rewards scan note (writer) | trig_017E4o86FsKSBpyzp9VonXG8 | `56 12 * * *` | `56 12 * * 1` (Mon); renamed "weekly Mon" | 7 → 1 | Back to the 10-09 budget; the card is weekly material |
| PE & Defense notes (writer) | trig_01LB6aBYyDa8ApbwASpSqStQ | `47 13 * * *` | `47 13 * * 1,4` (Mon, Thu); renamed | 7 → 2 | Back to the 10-09 budget |
| Builder incentives note (writer) | trig_01CGCPAiVa5CyCKP7szMuUtS | `53 13 * * *` | `53 13 * * 1,4` (Mon, Thu); renamed | 7 → 2 | The ISA Portal shows it, so twice a week rather than the 10-09 once |
| Elite Affluent note (writer) | trig_01LkHGJWWeSzeh3SyoARN59A | `51 15 * * *` | `51 15 * * 1` (Mon); renamed | 7 → 1 | Weekly material |
| Econoday note (writer) | trig_01Kz8PfWLGmiN44NjyiqCyjp | `35 12 * * *` | `35 12 * * 1,4` (Mon, Thu); renamed | 7 → 2 | Note covers the next 2–3 weeks of releases |
| Weekend Builds dashboards refresh | trig_01EumN8gNtiq7HFKnhFoyU44 | `CRON_TZ=America/Los_Angeles 50 6 * * *` | `CRON_TZ=America/Los_Angeles 50 6 * * 1,4`; renamed (was "Daily refresh: …") | 7 → 2 | Three side-project dashboards; daily is more than they need |
| RoleCompass job hunt (v4) | trig_01Sac7gQ2GdGdCYPti7JsrgB | `CRON_TZ=America/Los_Angeles 40 6 * * *` | `CRON_TZ=America/Los_Angeles 40 6 * * 1,3,5`; renamed | 7 → 3 | Its prompt already searches since `lastRefresh` with a 1-day overlap, so nothing is missed |
| Command Deck — daily freshness sweep | trig_01Y1zZ3bmawgi4Mw2jNw9ZFM | `40 3,15 * * *` | `40 15 * * *`, and the STEP 4 staleness rule now follows each key's cadence (below) | 14 → 7 | The 03:40 run mostly re-researched keys that the morning writers refresh hours later. Without the cadence rule the sweep would refill the weekly keys every day and undo the cuts above |
| Feed freshness watchdog | trig_01AcWPY2aSQZay5e2DBCfczD | `12 16 * * *` | **disabled** | 7 → 0 | A second writer of `feedFreshness`; the sweep owns that document and runs 32 minutes earlier |
| Strava wrapper guard | trig_01Nqu4xFXLqtTB2oSdGXEi4X | `47 12 * * *` | **disabled** | 7 → 0 | Guards the Mac task `strava-daily-sync`, frozen since 10-13. Turn it back on when that Mac task runs again |
| Transaction & Showing desk | trig_011iofWVNizNQ1SNujNcp5tL | `CRON_TZ=America/Los_Angeles 10 7 * * 1-5` | `CRON_TZ=America/Los_Angeles 5 6 * * 1-5`; renamed "(weekdays 6:05 AM PT)" | 5 → 5 | Now runs before the 6:25 AM daily cycle, so the cycle reads today's `tcDesk` and not yesterday's |
| Weather & news (writer) | trig_017MzzeaebbUsMLcSPVpEKeG | `35 1,13 * * *` | `35 13 * * *` (morning only) | 14 → 7 | The evening run refreshed only `newsSnapshot`; the morning run does news plus the city and housing lists |
| Pipeline Sync (live, writes) | trig_01M5zR1Po44gnHvTwA9ogZaB | `0 15,20,23 * * 1-5` | `7 20,23 * * 1-5` | 15 → 10 | The ISA works noon–4 PM PT (19–23 UTC). The 15 UTC run fell before her shift; the 20 and 23 UTC runs cover mid-shift and end of shift |
| Tech & AI Command Deck — monthly | trig_01RsFftt7y4myjmEDqoe1EbS | `0 14 1 * *` | `17 14 3 * *` | — | Spreads the monthly Opus jobs off days 1–2 |
| VA Command Center — monthly | trig_01RpEqUFbqaPDguF2ku6PEmv | `0 15 1 * *` | `23 15 4 * *` | — | Same |
| Things I Wish I Knew book — monthly | trig_01HXTDADHyGpghP9MMUgmCBM | `CRON_TZ=America/Los_Angeles 51 8 2 * *` | `CRON_TZ=America/Los_Angeles 51 8 5 * *` | — | Same |
| NAVWAR PM Deck — monthly | trig_01ArqD9f1QVCQwEDVthncB3b | `CRON_TZ=America/Los_Angeles 52 8 1 * *` | `CRON_TZ=America/Los_Angeles 52 9 6 * *` | — | Same |
| Nellis VA Webinar — monthly | trig_01VWeehgtJYJX5vVDa5reSGE | `CRON_TZ=America/Los_Angeles 49 6 1 * *` | `CRON_TZ=America/Los_Angeles 49 7 7 * *` | — | Same |
| Muster Point — monthly | trig_01RA64qRFH7B4ZYuTAzg7e2B | `0 14 2 * *` | `13 16 8 * *` | — | Same |
| Rent, Buy, or Wait — monthly state refresh | trig_01JvvDEbVqzusqzc6dcWdTtH | `0 15 1 * *` | `41 15 9 * *` | — | Same |
| Sentinel monthly figures refresh | trig_01RJJZeocYiNhyDRAAxHm9SW | `7 14 2 * *` | `7 17 10 * *` | — | Same |

The eight monthly jobs (six on Opus) all fired on the 1st and 2nd, the days the allowance was already spent. They now
run one a day, days 3–10, at different hours. Nothing is lost: each still runs once a month.

### Freshness sweep: the cadence rule (the only prompt change)

The first sentence of STEP 4 used to read "For every key in liveFeeds.feeds whose checkedAt is older than 26 hours".
It now says a key is stale only past its cadence limit:

- `elitScanLiveList`, `eliteAffluentLiveList` (weekly) — 8 days (192 h)
- `pedefenseLiveList`, `defenseUpdatesList`, `builderIncentiveLiveList`, `econodayLiveList` (Mon + Thu) — 4 days (96 h)
- `mktMoversList`, `mktSectorList`, `topPerformersLiveList` (weekday close) — 80 h, which matches the deck's own top-performers
  threshold. STEP 3 still catches a missed close.
- every other key — 26 h, as before.

The rest of the prompt is unchanged, word for word. The Weekend Builds dashboards write no `liveFeeds` keys, so the
rule needs no entry for them. The DAILY-KEY RULE still names a "03:40 run". That run no longer exists, so the sentence
is now inert.

### Left as is (checked)

- Top performers note (`26 13 * * 2-6`), morning feeds, market close, morning brief, the daily Chief of Staff cycle,
  Attraction Command Center, AI twin autopilot, Scrape queue runner, Command Deck Brief, ISA ladder, the 6D Brain
  daily rebuild, and the Sunday backup and backup watchdog.
- The one-shot "Monthly refresh pass 3" (fires 2026-10-25 20:10 UTC). It names the monthlies by id, so the new days
  do not affect it.

### Small follow-ups (wording only, not changed)

- The RoleCompass and Weekend Builds prompts still set `nextRefresh` to "tomorrow". The NAVWAR prompt writes
  `cadence: "Monthly, 1st of each month"`, and the Nellis prompt sets "next refresh = the 1st of next month". The
  dashboards will show the wrong next date until those lines are edited.
- The daily-cycle prompt (trig_019whypw6EeNu2G8xxY5xE5N) still describes `tcDesk` as written at "7:10 AM PT".
- The "Weekly Loop Engineering + Self-Test" routine (trig_01W1KHiBfVXZ5Xwd1aCFJM72) runs **Sunday** 13:05 PT
  (`CRON_TZ=America/Los_Angeles 5 13 * * 0`), not Saturday.

## Steven only (created via API — agents cannot change these)

Open each link and set what is shown. About 6 runs a week, plus one unattended publish removed.

| Routine | Link | Change |
|---|---|---|
| Command Deck — weekly self-improvement loop (Sun 15:00 UTC) | https://claude.ai/code/routines/trig_016qKE1TdRjzkpb2Yby8yWBX | **Disable.** The Sunday Loop Engineering + Self-Test covers it |
| Command Deck — weekly improvement loop (Sun 16:00 UTC) | https://claude.ai/code/routines/trig_013vYCzVa3vbHZ8BZZy6UBpX | **Disable.** Same; each run reads the whole 4.5 MB deck |
| Command Deck & ISA Portal Weekly Loop Engineering QA (Sun 16:00 UTC) | https://claude.ai/code/routines/trig_013ocJfEDdmSAgDPVaiCzMZY | **Disable.** Same |
| Command Deck — weekly opportunity audit (Sun 17:00 UTC) | https://claude.ai/code/routines/trig_019NdM12eTVDHWy89Ch2sNtU | **Disable.** It edits and **republishes the Command Deck unattended** (HALT: a live artifact changed outside an assigned region), and the Sunday cycle covers it |
| Vanessa orchestrated Weekly Ops Review (Fri 23:00 UTC) | https://claude.ai/code/routines/trig_01V6QrF6yENWiccduk94ubbs | **Keep, but fix the prompt.** It still says "Follow Up Boss for real estate"; Lofty replaced it on 2026-09-22 (read `loftyLeads`). Or disable it if the weekday daily cycle is enough |
| Weekly 1/5/10-Year Plan Review Reminder (Mon 14:00 UTC) | https://claude.ai/code/routines/trig_01W37dE7VHCqceffB159zNYr | **Disable** and add a recurring Google Calendar reminder (Mon 7:00 AM PT). A whole session just to send one push notification |
| Command Deck — Weekly content edit reminder (Mon 15:00 UTC) | https://claude.ai/code/routines/trig_018RcDPPx35doBvNAxg8xTkQ | **Disable** and add a recurring Google Calendar reminder (Mon 8:00 AM PT) |

Optional: R16 marketing compliance (trig_01KDp9oB87M99NjUnyWiTbMd, `0 16 1 * *`), R18 card credits
(trig_0138GgRga2sggpEYbJapZnvN, `0 15 1,15 * *`) and the Property Search health check (trig_01TVFXodf4JhV9yp6oaYgYpK,
`0 15 1 * *`) also land on the 1st. Moving them to the 11th, 16th and 12th (for example `17 16 11 * *`,
`43 15 12 * *`, and `9 15 1,16 * *` for R18) would finish clearing that day.

## Recommendation only — model changes need Steven's own words

These run on `claude-opus-5-5` and follow fixed checklists. Moving them to Sonnet would cut Opus use further, but it
is Steven's call, as it was on 2026-10-09:

- Gridiron Codex – game-day scores (trig_012AgCktxWx94zsNqcxb96p1): 3 runs every Sunday
- Gridiron Codex – prime-time scores (trig_011hRsg6AHMgSmRgtEZovQNm): Mon and Thu
- Gridiron Codex – weekly Bears analysis (trig_01TYxX2H8oeAp5tiThEGTTi3): Tue. Its last run was ABANDONED on 10-20
- Weekly Rent, Buy, or Wait refresh (trig_01EBvRQ4Rv63EgrLihjNxwiG): Mon. Its last run was ABANDONED on 10-19

That is about 7 Opus runs a week. Say "yes, Sonnet" for any of them and it is a one-field change.
