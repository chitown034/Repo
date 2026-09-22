# Project — ISA Portal

**What.** A second published artifact, separate from the Command Deck: the working surface for the
human ISA / EA and for the mortgage-desk data that has to be shared rather than kept in the deck.
Linked from Command Deck Panel 22.

**Who uses it.** The human **ISA / EA**, Mon–Fri **12–4 PM PT**. Vanessa is the only AI voice that
talks to the ISA — no other seat contacts her directly.

## Status (2026-09-22) — honest

- The **cloud** hourly ISA comms bridge routine is **DISABLED**.
- The Mac task **`isa-comms-bridge-local`** runs hourly at :37, **7:37 AM–9:37 PM PT**; last ok
  **2026-09-21 20:38 PT**. It merges the shared message thread both ways. The window was narrowed
  from 24 h because overnight runs moved no messages.
- **The ISA has posted nothing since 2026-09-16.** The bridge running is not the same as traffic
  flowing; say both.
- `r11-isa-kpi-compile` (Sun 04:40 PT) has **never run under the runner**. It was built to turn
  Follow Up Boss events into KPI actuals and must be re-pointed at Lofty — see `context/decisions.md`.
- The `isaKpi` doc carries real KPI actuals stamped **2026-09-13**. Render or cite it with that date.

## Where the live data lives

`isaKpi`, `leadTriage`, `leadResponse`, `isaLine` (the shared thread), `showingSchedule`
(currently empty). Loan-program and lender-directory counts on the portal are drift-checked against
the Command Deck: **39 loan programs, 61 lenders**. If those two numbers disagree between the two
artifacts, that is the bug — do not "fix" one side by editing the other's count.

## Rules

- The playbook content is duplicated between the deck and the portal. A playbook fix must be applied
  to both, or it silently diverges.
- Nothing here contacts a client or a listing agent directly. Hand-offs land on the ISA line and
  reach the portal on the next bridge run.

## Update — 2026-09-22 (second pass)

- Published as **version 27**: You.com grant dropped, Follow Up Boss retired in favour of Lofty, the
  four sync-engine reliability fixes ported.
- **Daily scorecard form added** to the Virtual EA / ISA Operations panel. It writes `isaScorecard`
  rows in the Command Deck's own shape, and "Send to Steven" posts the day's numbers on the ISA line.
- **Sync is real now**: a cloud routine carries `reClients`, `pipeline`, `isaGradingScores`,
  `isaKpiSopActuals` and `isaScorecard` both ways four times a day and verifies by reading back.
  The ISA line still crosses on the Mac bridge (hourly 7:37 AM–9:37 PM PT).
- **The seat**: 9 messages on the line, all Steven → ISA; 0 ISA-authored, ever; scorecard never
  filled; last opened 2026-09-13. Decision packet: `docs/ISA-SEAT-DECISION.md`.
- Panels renumbered 01–14 top to bottom; reference panels carry a "Verified <date>" stamp.
