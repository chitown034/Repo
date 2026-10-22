# Every dashboard feed on the Claude subscription (2026-10-05)

Steven, 2026-10-05: *"Replace and update all feeds to come from my Claude subscription and remove feeds from
Perplexity API"*, *"remove everything running on Perplexity and replace with Claude subscription"*, *"find a
solution for the weather news and everything requiring updates"*.

Every research feed the Command Deck shows is now written by an agent-created **cloud routine**. These run on
Steven's Claude subscription, research with Claude's own WebSearch only, read the clock with `date -u`, and
write through ArtifactData. They don't depend on the Mac being awake. Before this, the Mac's three feed tasks
tried Perplexity first; it was out of credit (`401 insufficient_quota`) and they fell back to Claude anyway.

| Routine (trigger id) | Writes | Runs (UTC) | Replaces |
|---|---|---|---|
| morning feeds (writer, Claude) `trig_01BVuP52qPuqEvfvxL48YgZz` — `11-morning-feeds` | `topHeadlinesList`, `aiNewsList`, `onThisDayHistoryList`, `onThisDayBirthdayList`, `bearsLiveNews`, `oppRadarLiveList` | 12:20 all six · 00:20 radar + headlines | Mac `openrouter-feeds-refresh` |
| market close (writer, Claude) `trig_01LmhuxXi3waJWpZfqiCfgJH` — `12-market-close` | `mktMoversList`, `mktSectorList` | 21:20 weekdays | Mac `feeds-market-close` |
| weather & news (writer) `trig_017MzzeaebbUsMLcSPVpEKeG` — `../feed-writers-2026-09-28/01` | `newsSnapshot`; 10 × `newsLocalList_<slug>`; 3 × `marketUpdateLiveList_<slug>`, also copied to the ISA Portal; weather only when stale and Open-Meteo is reachable | 13:35 full · 01:35 news only | news half of Mac `weather-news-refresh`, city news of `feeds-weekly` |
| Econoday note `trig_01Kz8PfWLGmiN44NjyiqCyjp` — `../feed-writers-2026-09-28/04` | `econodayLiveList` | 12:35 (before the 6 AM PT session) | Mac `openrouter-feeds-refresh` |
| top performers · builder incentives · PE & Defense · Elite Rewards scan (2026-09-28 writers) | their own notes (the builder note also copied to the ISA Portal) | 13:26 · 13:53 · 13:47 · 12:56 | Mac `feeds-weekly` |
| Elite Affluent note (weekly) `trig_01LkHGJWWeSzeh3SyoARN59A` | `eliteAffluentLiveList` | Sun 15:51 (the card now allows 192 h) | Mac `feeds-weekly` |

**Weather** is the one feed the cloud can't reach yet, for two reasons. The environment's network policy
blocks every weather API. And attaching a connector to an agent-created routine is refused: "the connectors
parameter is not available for this organization". Until that changes, the Mac's `weather-news-refresh` keeps
weather current twice a day from wttr.in, which is a free weather site, not Perplexity. Two permanent cloud
paths, both Steven's to switch on:

1. **Allow `api.open-meteo.com` and `api.weather.gov`** in the cloud environment's network settings
   (`docs/NEEDS-STEVEN.md` item 74). The news routine above then refreshes weather itself whenever the Mac
   has missed a run.
2. Or create a routine in the claude.ai routines UI **with the AccuWeather connector attached**, and paste
   `13-weather-accuweather.prompt.txt` into it. Routines Steven makes in the UI can carry connectors.

**The ISA Portal mirrors these notes** (Steven, 2026-10-05: *"ensure ISA portal also is update and
mirrors command deck and only uses Claude subscription for feeds"*). No page can read another page's
store, so the two writers whose notes the ISA Portal shows copy them there themselves. Right after its
Command Deck write, the builder-incentives writer (`trig_01CGCPAiVa5CyCKP7szMuUtS`) and the morning run
of weather & news each send the identical entries, with the same `checkedAt`, to the ISA Portal's own
`liveFeeds` document. That document is `{v: {feeds: {...}}}` in the ISA store; it was created on
2026-10-05 with that day's four notes. They use a pinned `update`, never `set`, and never create the
document. The ISA page (v39) prints each note with its sources and its checked time. A note past its
budget says so: 192 h for the builder note, as on the deck, and 30 h for the market notes. A new copy
redraws in place instead of reloading the page. Rates and market figures already reach both pages
through `ratesSnapshot`.

**Mortgage rates** stay on the Mac's `mortgage-rates-daily` and `r5-rates-market-refresh`. They read FRED /
Optimal Blue directly and never used Perplexity.

**The Mac's half**: pause the three replaced tasks, trim `weather-news-refresh` to weather, switch the
runner's research provider to Claude only, and remove the Perplexity MCP server. All of it is one paste-in:
`integrations/mac-claude-only.md`.
