# Routine spec — Weekly events scan → Travel tab (proposal; not installed anywhere)

**Written 2026-10-11.** Nothing runs this yet. A Mac runner task is a live task, so installing it is Steven's yes (HALT).

## What it does
1. `python3 integrations/events/events_scout.py --days 14` on a Mac with internet (the cloud sandbox reached none of the 36 sources). The free GitHub `events-scout` workflow makes the same report as an artifact every Sunday 06:37 UTC.
2. Writes the rows from `docs/reports/EVENTS.json` into the Command Deck document `eventsFeed` (array of `{day,date,name,venue,city,category,url}`), which the Travel tab's "Weekly events & networking" card already reads. With no document the card says "sources only".
3. Never RSVPs, registers, pays or messages anyone. Networking leads go to Victor as proposals.

## Schedule and model
Sunday 7:00 AM PT, headless, Sonnet 5 (it only formats data the script produced). Skip a week if the script reports zero reachable sources, and say so in `routineHealth` rather than writing an empty feed over a good one.

## Success condition
`eventsFeed` gained rows dated within 14 days, every row has an `https://` link, and the card badge reads "N events this scan".
