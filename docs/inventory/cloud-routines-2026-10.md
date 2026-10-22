# Cloud routines added or rewritten in October 2026 (agent-created, `meta_mcp`; editable by agents)

The 2026-09-22 listing is `cloud-routines.md`; this file carries what was created since. Same columns so
`bin/brain toolkit` reads both.

| Routine | Cron (UTC) | Enabled | Last run | Next | Created | id |
|---|---|---|---|---|---|---|
| Vanessa — Chief of Staff daily cycle (weekdays 6:25 AM PT, parallel squads) | `CRON_TZ=America/Los_Angeles 25 6 * * 1-5` | True | — | 2026-10-21 | 2026-10-20 | trig_019whypw6EeNu2G8xxY5xE5N |
| Vanessa — morning brief to Steven's phone (cloud push, 6:48 AM PT; reads the daily cycle) | `CRON_TZ=America/Los_Angeles 48 6 * * *` | True | SUCCEEDED @ 2026-10-20T13:49 | daily | 2026-10-13 | trig_01Q9VPMwrKwNUW3kZL54rKgy |
| Command Deck — daily freshness sweep (writer, Claude) | `40 3,15 * * *` | True | SUCCEEDED @ 2026-10-20T15:40 | twice daily | 2026-10-12 | trig_01Y1zZ3bmawgi4Mw2jNw9ZFM |
| Command Deck — morning feeds (writer, Claude) | `5 13 * * *` | True | SUCCEEDED @ 2026-10-20T13:08 | daily | 2026-10-05 | trig_01BVuP52qPuqEvfvxL48YgZz |
| Command Deck — market close (writer, Claude) | `20 21 * * 1-5` | True | SUCCEEDED @ 2026-10-19T21:20 | weekdays | 2026-10-05 | trig_01LmhuxXi3waJWpZfqiCfgJH |
| VA Command Center — weekly avatar content drafts | `CRON_TZ=America/Los_Angeles 58 14 * * 0` | True | SUCCEEDED @ 2026-10-18T21:58 | Sunday | 2026-10-09 | trig_01916Qx1LASXu7MwP1ZKSWJD |
| Scrape queue runner | `CRON_TZ=America/Los_Angeles 7 9 * * *` | True | SUCCEEDED @ 2026-10-19T16:08 | daily | 2026-10-08 | trig_01CsARHDYnqZS8wVSornXoGH |
| AI twin autopilot (posts only approved items) | `CRON_TZ=America/Los_Angeles 57 7 * * *` | True | SUCCEEDED @ 2026-10-20T14:58 | daily | 2026-10-05 | trig_01JbMx3a3KA6cJv2zMdBAE6k |
| Attraction Command Center: daily cloud run | `CRON_TZ=America/Los_Angeles 40 6 * * 1-5` | True | SUCCEEDED @ 2026-10-20T13:40 | weekdays | 2026-10-05 | trig_01H7zYh3EteR8hJoeffebRWv |
| RoleCompass daily job hunt (v4) | `CRON_TZ=America/Los_Angeles 40 6 * * *` | True | SUCCEEDED @ 2026-10-20T13:40 | daily | 2026-10-05 | trig_01Sac7gQ2GdGdCYPti7JsrgB |
| Transaction & Showing desk — TC + showing assistant (weekdays 7:10 AM PT) | `CRON_TZ=America/Los_Angeles 10 7 * * 1-5` | True | — | 2026-10-22 | 2026-10-22 | trig_011iofWVNizNQ1SNujNcp5tL |
| 6D Brain — daily rebuild and republish (3:30 AM PT, this session) | `CRON_TZ=America/Los_Angeles 30 3 * * *` | True | — | daily | 2026-10-21 | trig_01MQ7HRYTh27b8uUM4BtnFXE |
