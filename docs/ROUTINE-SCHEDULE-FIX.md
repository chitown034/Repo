# Cloud routine schedule — the collision fix

**Date:** 2026-09-22 · **Owner:** Reliability Engineer · **Finding:** F-INT-02 (P1, effort S)

## What was wrong

Thirteen of the fifty cloud routines had a failed or abandoned last run. The pattern is not random
and it is not the routines' logic:

| Window (UTC) | Routines firing | Outcome |
|---|---|---|
| Fri 2026-09-18, 20:00–23:00 | 4 | all 4 FAILED |
| Sun 2026-09-20, 15:00–17:00 | 6 | all 6 FAILED |
| Mon 2026-09-21, 15:00 | 10 share this hour | 2 ABANDONED |

Every failed run died **5 to 10 seconds after firing** — too fast to be the task's own work. Runs in
the uncontended daily hours (12:00, 13:00, 14:00 UTC) succeeded on the same days. The `routineHealth`
document had already recorded the same signature on the Mac side: *"prior attempts were blocked by
the weekly usage cap through 2026-09-17."*

So the cause is contention, not code: too many routines firing into the same window, at the end of
the weekly quota cycle, competing for the same capacity. Three of the six Sunday routines were also
doing substantially the same job — a weekly improvement loop, under three different names.

## What was changed (2026-09-22)

Destaggered, one routine per hour, and moved the heavy weekly work off the Friday-night and
Sunday-afternoon pileups:

| Routine | Was (UTC) | Now (UTC) | Now (PT) |
|---|---|---|---|
| Ops Issue Review | Fri 20:00 | Mon 18:00 | Mon 11:00 AM |
| Project Risk Review | Fri 21:00 | Tue 18:00 | Tue 11:00 AM |
| Books Reconciliation Reminder | Fri 22:00 | Wed 18:00 | Wed 11:00 AM |
| Real Estate Weekly Brief | Mon 15:00 | Mon 16:30 | Mon 9:30 AM |
| Rent, Buy or Wait refresh | Mon 15:00 | Mon 17:30 | Mon 10:30 AM |

Two routines were created to own work nothing reliably did:

| Routine | Schedule | What it does |
|---|---|---|
| Weekly Loop Engineering + Self-Test | Sat 13:00 UTC · 6:00 AM PT | The Phase 7 cycle: output-not-execution scoring, stale sweep, six self-test categories, CPI and scale proposals, trust gates, halt flags, and the weekly brief. |
| Backup verification watchdog | Sun 17:30 UTC · 10:30 AM PT | Reads `backupStatus`, counts the live store for comparison, and escalates when the backup is missing, late or unverified. Makes silence impossible. Placed after the backup window and clear of the 16:00 UTC slot where three routines failed on 2026-09-20. |

A one-shot probe was also fired to re-test, on today's platform, whether an unattended cloud routine
can write the artifact database at all. The answer decides where every future write belongs.

## What Steven has to change by hand

Six routines were created through the claude.ai web interface rather than by an agent, and the
platform only lets an agent edit routines it created itself. These still collide on Sunday:

| Routine | Current (UTC) | Recommended | Why |
|---|---|---|---|
| Weekly Loop Engineering QA | Sun 16:00 | **Disable** | Superseded by the consolidated Saturday loop above. |
| weekly self-improvement loop | Sun 15:00 | **Disable** | Same job as the above, under a third name. |
| weekly improvement loop (research → apply) | Sun 16:00 | **Disable** | Same job again. Its stale-data-first rotation is folded into the Saturday loop. |
| weekly opportunity audit | Sun 17:00 | Move to **Tue 14:00** | Genuinely different job — strategic opportunities, not QA. Keep it, just not in the pileup. |
| Elite Affluent Tracker weekly refresh | Sun 16:00 | Move to **Wed 16:00** | Feed refresh, no reason to sit in the loop window. |
| Next Big Moves weekly review | Sun 15:00 | Move to **Thu 16:00** | Same. |

Open each at `claude.ai/code/routines`, change the schedule or the enabled switch, and Sunday stops
being a traffic jam. Nothing else about them needs to change.

## The rule this establishes

No more than two cloud routines per UTC hour, and nothing heavy on Friday evening or Sunday
afternoon, which is where this account's weekly quota runs thinnest. The weekly loop checks this
against the live listing each cycle and flags any new collision as a finding.
