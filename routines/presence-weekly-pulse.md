# Routine spec — Presence weekly pulse (proposal; not installed anywhere)

**Nothing runs this on Claude yet.** The free, model-free half already runs: the GitHub workflow
`.github/workflows/presence-pulse.yml` executes `projects/aeo-presence/scripts/pulse.mjs` on every push to the kit and
every Monday 13:10 UTC (6:10 AM PT) and uploads `PRESENCE-PULSE.md` as an artifact. Installing the Claude half below is a
live routine, so it is **Steven's yes** (HALT); the budget line is in `docs/ROUTINE-BUDGET-2026-10-22.md` terms.

## What the Claude half adds
The pulse's queue (`data/presence-queue.json`) written into `vanessaQueue` so the 6:25 AM Chief-of-Staff cycle works it
with the rest of the day, the Citation Auditor's 8-listing read-only sweep, and the three answer-block drafts for the week.

| | Value |
|---|---|
| Name | Presence — weekly pulse + citation sweep (Mon 7:50 AM PT, drafts only) |
| Cron | `CRON_TZ=America/Los_Angeles 50 7 * * 1` (after the 7:20 refi watch; before the ISA's noon start) |
| Model | Sonnet 5 (report tier) — the pulse itself is zero-token; the sweep and drafts are Sonnet |
| Skills | `presence-pulse`, `citation-sweep`; answer blocks per `docs/09-aeo-answer-engineering.md` |
| Writes | `vanessaQueue` (≤ 12 items, deduplicated on `task`), `data/citations-nap.csv`, `data/geo-activity-log.csv`, `docs/reports/PRESENCE-PULSE.md` |
| Reads | the kit, the public directory pages (read-only), `vanessaQueue` |
| Budget | +1 run/week, Sonnet-sized; the GitHub half costs no allowance |
| HALT | never edits a profile, site, DNS or account; never posts; never emails a directory |
| Needs connectors | none (WebFetch/WebSearch only) |

## Prompt (for `create_trigger`, once Steven says yes)
> You are the Presence Pod's Monday run. In the repo on this branch: `node projects/aeo-presence/scripts/pulse.mjs`.
> Follow `.claude/skills/presence-pulse/SKILL.md` and `.claude/skills/citation-sweep/SKILL.md`: queue the pulse items
> into `vanessaQueue` (read first, `if_version`, dedupe on task), sweep the 8 oldest-checked directories read-only and
> record their status, draft the week's three answer blocks (Alexandra's checklist in `docs/13`), commit the data and
> report files, and end with ≤ 8 lines for Steven. Drafts only. Never post, deploy, submit, create an account or pay.

## Proof it ran
`docs/reports/PRESENCE-PULSE.md` carries today's date; `data/citations-nap.csv` has 8 rows with today's `last_checked`;
`vanessaQueue` holds the items with `from: "presence-pulse"`.
