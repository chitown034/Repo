---
name: send-optimization
description: A send schedule for every waiting draft in each lead's local time. Use when the operator asks when to send, or to schedule a batch of drafts.
---

# Send Optimization

**Category:** Sales · **Built for:** Mortgage Broker (Steven Shearrill) · closes a SkillTree Sales gap

## What it does
For each draft waiting for approval, picks the next good window in the lead's local time zone (from the property/lead state):
- Email: Tue–Thu around 9:00–10:30 am local (Mon/Fri if nothing sooner).
- Text or call: 10:00–11:30 am or 5:30–7:00 pm local; no Sundays; no Saturday evenings.
- Never outside 8 am–9 pm local (TCPA) and never to a lead who opted out.

## Steps
1. Read `vanessa/skilltree/context/deals/follow-up-cadence.md` for the cadence and channel rules.
2. For each waiting draft: lead state → time zone → next window by channel. Show local time and Pacific time.
3. Return the schedule with a two-line summary. Steven still sends each one.

## Guardrails
- Drafts only; never sends or schedules a send in a mail or SMS tool.
- In VANESSA this runs locally: SkillTree Agents › Send Optimization, and every draft in the Lead Workflow Autopilot gets a "Best send" time automatically.
