# ISA line — reply check & escalation ladder (cloud)

`trig_01J9xuWgAuUCHATtpLivDkgp` · cron `30 14 * * 2-6` (weekdays 7:30 AM PT) · created 2026-09-22
· needs no connectors

## Why

The Mac task `r3-eod-rollup` posts "EOD summary not in yet — send it here when you get a
minute…" to the ISA line as if from Steven, verbatim, every evening it finds no summary. Between
2026-09-13 and 2026-09-22 it posted that five times and never once checked for a reply. No
ISA-authored message has ever appeared on the line. Repeating a message to nobody is noise that
hides the real signal: the seat may be empty.

## What it does

One decision per weekday morning: did the ISA answer, and if not, what is the next rung.

| Consecutive business days with an EOD request and no ISA reply | Action, at most once per streak |
| --- | --- |
| 0–1 | Nothing written. |
| 2 | One urgent line to Steven on the ISA line. |
| 3+ | One "ISA seat — decision needed" item in the twin queue (or adopt the one already there), then silence. |

A streak resets only when a message with `from: "isa"` appears. State lives in the `isaLadder`
document; every run logs one `{date, text}` row in `ciLog`.

## What it never does

Never posts a nudge. Never writes as Steven. Never contacts the ISA on any channel. Never edits or
deletes an existing message. Never names a client.

## What it cannot do

Switch off `r3-eod-rollup`. That is a Mac task, and only Steven can retime or disable it. Until he
does, r3 keeps posting the nudge and the ladder keeps counting it as a request.

## Related

- `docs/ISA-SEAT-DECISION.md` — the packet, four courses of action, and the outreach draft.
- The ISA Portal now carries a daily scorecard form whose "Send to Steven" posts the numbers on the
  line, which is the first thing that would count as an ISA-authored message.
