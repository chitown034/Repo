# Cloud routines added or rewritten in October 2026 (agent-created, `meta_mcp`; editable by agents)

The 2026-09-22 listing is `cloud-routines.md`; this file carries what was created since. Same columns so
`bin/brain toolkit` reads both.

| Routine | Cron (UTC) | Enabled | Last run | Next | Created | id |
|---|---|---|---|---|---|---|
| Vanessa — Chief of Staff daily cycle (weekdays 6:25 AM PT, parallel squads) | `CRON_TZ=America/Los_Angeles 25 6 * * 1-5` | True | — | 2026-10-21 | 2026-10-20 | trig_019whypw6EeNu2G8xxY5xE5N |
| Command Deck — daily freshness sweep (writer, Claude; once a day since 2026-10-22, per-key cadence) | `40 15 * * *` | True | SUCCEEDED @ 2026-10-20T15:40 | twice daily | 2026-10-12 | trig_01Y1zZ3bmawgi4Mw2jNw9ZFM |
| Command Deck — morning feeds (writer, Claude) | `5 13 * * *` | True | SUCCEEDED @ 2026-10-20T13:08 | daily | 2026-10-05 | trig_01BVuP52qPuqEvfvxL48YgZz |
| Command Deck — market close (writer, Claude) | `20 21 * * 1-5` | True | SUCCEEDED @ 2026-10-19T21:20 | weekdays | 2026-10-05 | trig_01LmhuxXi3waJWpZfqiCfgJH |
| VA Command Center — weekly avatar content drafts | `CRON_TZ=America/Los_Angeles 58 14 * * 0` | True | SUCCEEDED @ 2026-10-18T21:58 | Sunday | 2026-10-09 | trig_01916Qx1LASXu7MwP1ZKSWJD |
| Scrape queue runner | `CRON_TZ=America/Los_Angeles 7 9 * * *` | True | SUCCEEDED @ 2026-10-19T16:08 | daily | 2026-10-08 | trig_01CsARHDYnqZS8wVSornXoGH |
| AI twin autopilot (posts only approved items) | `CRON_TZ=America/Los_Angeles 57 7 * * *` | True | SUCCEEDED @ 2026-10-20T14:58 | daily | 2026-10-05 | trig_01JbMx3a3KA6cJv2zMdBAE6k |
| Attraction Command Center: daily cloud run | `CRON_TZ=America/Los_Angeles 40 6 * * 1-5` | True | SUCCEEDED @ 2026-10-20T13:40 | weekdays | 2026-10-05 | trig_01H7zYh3EteR8hJoeffebRWv |
| RoleCompass daily job hunt (v4) | `CRON_TZ=America/Los_Angeles 40 6 * * *` | True | SUCCEEDED @ 2026-10-20T13:40 | daily | 2026-10-05 | trig_01Sac7gQ2GdGdCYPti7JsrgB |
| Transaction & Showing desk — TC + showing assistant (weekdays 6:05 AM PT, before the cycle) | `CRON_TZ=America/Los_Angeles 5 6 * * 1-5` | True | SUCCEEDED @ 2026-10-22T14:10 | weekdays | 2026-10-22 | trig_011iofWVNizNQ1SNujNcp5tL |
| Vanessa — morning brief across the dashboards (6:34 AM PT; push + writes the iMessage/voice script; since 2026-10-23 e-mails the brief to Steven when the iMessage line is unlinked) | `CRON_TZ=America/Los_Angeles 34 6 * * *` | True | SUCCEEDED @ 2026-10-22T13:49 (as the 6:48 brief) | daily | 2026-10-13 | trig_01Q9VPMwrKwNUW3kZL54rKgy |
| Refi watch — weekly prep list (Mon 7:20 AM PT, drafts only) | `CRON_TZ=America/Los_Angeles 20 7 * * 1` | True | — | 2026-10-26 | 2026-10-22 | trig_014ipr6x9z35psmtHJCPVqj1 |
| Sphere & past-client touches — monthly drafts (day 11, 7:40 AM PT, drafts only) | `CRON_TZ=America/Los_Angeles 40 7 11 * *` | True | — | 2026-11-11 | 2026-10-22 | trig_01Pn8xLNKTVVFYjYTj8d8JTd |
| Weekly ecosystem backup — cloud writer (Sunday, after the allowance reset) | `7 21 * * 0` | True | SUCCEEDED @ 2026-10-22T14:16 (catch-up) | Sunday | 2026-09-22 | trig_01JcPh3AM2z21Bsv34SvSkqM |
| 6D Brain — daily rebuild and republish (3:30 AM PT, this session) | `CRON_TZ=America/Los_Angeles 30 3 * * *` | True | — | daily | 2026-10-21 | trig_01MQ7HRYTh27b8uUM4BtnFXE |
| Fieldy → brain (daily meeting digest; first names only) | `CRON_TZ=America/Los_Angeles 50 6 * * *` | True | ran 2026-10-23 (0 recordings) | daily | 2026-10-23 | trig_019KqDTnzqefUGApMscmswAJ |
| Presence audit — AI search visibility (monthly, Sofia) | `CRON_TZ=America/Los_Angeles 10 7 1 * *` | True | — | 2026-11-01 | 2026-10-23 | trig_01GCu51vT22M9nxAohu82cfa |
| Big moves — Vanessa's daily top 10, learn, queue approved, org sync, 6D republish; also fired by the 6D Approve button (EXECUTE NOW mode, since 2026-10-23) | `CRON_TZ=America/Los_Angeles 5 6 * * *` | True | — | 2026-10-24 | 2026-10-23 | trig_014QQGp4WQfWGDVB827R4Qb9 |
| Claude sessions ledger (docs/inventory/claude-sessions.md, daily) | `CRON_TZ=America/Los_Angeles 52 3 * * *` | True | ran 2026-10-23 | daily | 2026-10-23 | trig_01THsaAdhiWX1zauBQX23LrX |
| Second Brain layers weekly sync (export → Drive SB Docs → Notion directory → layers report) | `CRON_TZ=America/Los_Angeles 45 14 * * 0` | True | — | 2026-10-26 | 2026-10-23 | trig_01MR463NSmSAcA84zJHjerUp |
