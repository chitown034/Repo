# ISA seat — decision packet (2026-09-22)

**Status: NEEDS STEVEN.** Nothing below is a staffing decision made by an agent. It is the facts,
what was built so the decision is the only missing piece, four courses of action, and a
recommendation.

## Facts, read from the live documents at 12:50 UTC

| Signal | Value |
| --- | --- |
| ISA line opened | 2026-09-07 |
| Messages on the line | 9, all Steven → ISA |
| Of which the automated "EOD summary not in yet" request | 5 (13, 15, 15, 16 Sep and 08:11 UTC today) |
| Messages authored by the ISA | 0, ever |
| ISA last opened the line | 2026-09-13 |
| Daily 4:10 PM scorecard entries | 0 |
| Portal onboarding checklist | 0 of 6 |
| Kanban k1 "Screen & onboard ISA candidates" | backlog, no due date |
| Vanessa's standing recommendation (2026-09-11) | "seat unfilled — fill it or reassign the theme-day call load" |
| Feasibility check | "hire part-time / fractional first" |

Every ISA-coverage layer built this cycle is idle until a person is in the seat. During the
12–4 PM PT shift the 5-minute first-response standard has no owner and no measurement.

## Built today, so the decision is the only thing left

1. **Escalation ladder** — a cloud routine (`trig_01J9xuWgAuUCHATtpLivDkgp`, weekdays 7:30 AM PT)
   that replaces the verbatim nudge with one bounded escalation: two silent business days → one
   urgent line to Steven; three → one decision item in the twin queue; then silence until the ISA
   writes. It never posts as Steven and never contacts the ISA.
   *It cannot switch off the Mac task `r3-eod-rollup` that posts the nudge; that task is yours.*
2. **Scorecard write path** — the ISA Portal now has the daily scorecard form (same fields and row
   shape as the Command Deck card). "Send to Steven" posts the day's numbers on the ISA line, which
   is the first thing that would ever count as an ISA-authored message.
3. **Sync** — the 4x-daily Command Deck ↔ ISA Portal sync now carries `isaScorecard`.

## Courses of action, conservative → disruptive

| COA | What | Key trade-off |
| --- | --- | --- |
| 1 | Contact the current ISA directly today (draft below). If engaged, re-onboard on the portal with a two-week probation on the 4:10 PM scorecard. | Cheapest and fastest; may just confirm the seat is empty. |
| 2 | Replace with a fractional ISA through a staffing service on the existing spec (Mon–Fri 12–4 PM PT, theme days, scorecard). | Weeks to onboard; recurring cost; the same measurement gap until Lofty is keyed. |
| 3 | Hybrid: Lofty AI Sales Agent for 24/7 first touch (about $60/month per 200 leads) plus a fractional human for appointments. | Needs the Lofty API key first and Alexandra's consent/disclosure review before any outbound. |
| 4 | No human seat this quarter. Vanessa and the Steve twin run the ISA playbook at L2 (drafts only; Steven sends) until Lofty makes speed-to-lead measurable. Revisit in 30 days. | Steven stays the bottleneck on every send; the 5-minute standard is not met by a draft. |

**Recommendation.** COA 1 today. Two business days of silence after a direct message settles
whether the seat is occupied at all, and that answer changes which of 2, 3 and 4 is sane. Then
COA 3 if the Lofty key is in place, otherwise COA 2. Do not fund an AI agent before the key and
the consent review.

## Outreach draft — Steven sends this; no agent contacts the ISA

> Quick check-in. Our working tools are now on the ISA Portal — the shared line at the top is how
> we talk, and the daily scorecard form is a two-minute entry at the end of each shift.
>
> Two things by end of day tomorrow, please: (1) reply on the ISA line so I know you can see it,
> and (2) log yesterday's numbers in the scorecard form. If your hours or availability have
> changed, tell me straight — I would rather re-plan than guess.

Send it by text or email, whichever she actually reads; the portal has no push to her.

## What only Steven can do

- Send the outreach, and say on the line what came back.
- Pick a COA by Friday 2026-09-25.
- Switch off or retime the Mac task `r3-eod-rollup` so it stops posting the nudge as him.
