# Project — Business Command Center

**What.** A third published artifact (https://claude.ai/artifact/MFxTdoS8mwiJLZQ8Sr2dE4), separate from the
Command Deck, the Broker Command Center and the ISA Portal: a working hub of 135 dashboard modules in 11 categories
for Steven's real estate, lending, veteran brand, recruiting, career, writing, trading and systems work. Built
2026-10-22. Each module is a tracker (records with status, priority, due date, notes), not a data feed.

## What it holds (2026-10-22)

- **Modules and categories:** 75 from Steven's original dashboard list plus 60 added (veteran brand and growth,
  agent attraction, career and education, writing and AI twin, trading and wealth, systems and intelligence, and
  extra executive, sales, property, loan and operations modules).
- **Signals engine:** overdue, due soon, blocked, stale and high-priority-without-date records, shown on Overview,
  Today and the left navigation. "Escalate overdue" edits only records on the page.
- **Live reads and drafts:** Google Calendar and Gmail on the Today view, recent Google Drive files, a Gmail draft
  composer (draft only) and a calendar time-blocker (private event, no invitations). All as the signed-in viewer.
- **AI agents (in page):** 26 seats from this org chart with persona prompts, plus mission control: Vanessa picks the
  lead seat and joins, runs up to 5 steps (6 when a pod is woken) and returns one brief. Each seat reads the open
  records in its own categories. Eight standing pods can be woken from the Org Chart view. Runs are logged.
- **Workflows:** 12 checklist templates with tracked runs; **Calculators:** 7; **Quick capture:** Claude sorts a
  pasted note into the right module and the user confirms; **Resources:** official links plus the user's own.
- **Automations tab:** 16 copy-ready scheduled-task prompts. None is scheduled yet; scheduling is Steven's yes.

## Where its data lives

The artifact's own cloud database: `records/<moduleId>` (rows with `c` values, `s` status 0-3, `p` priority 0-2, `d`
due date, `n` notes), `meta/log`, `meta/runs`, `meta/res` and `config/settings`. It does not read or write the
Command Deck's documents. A scheduled task can read `records` with the artifact data tool.

## Rules

- Every in-page seat drafts and recommends only. HALT items end in a Needs-Steven packet; nothing is sent, booked,
  quoted, signed or written to a client-facing system by the page.
- The in-page seats are personas built from this org chart. The full agent skills, the 172-agent roster and Orca are
  not changed by this page. The page runs its agents on the model the artifact is granted, not on the model tiers.
- Calculators and modules are illustrative. Rates, fees and rules must be verified on the official source.
- Live connectors ask the viewer's permission and stop the link being shared publicly.

## Status — honest

- Not yet exercised by a signed-in viewer end to end: the agents, quick capture, Drive list, Gmail draft and calendar
  event were built against tool schemas and tested only without Claude or connectors. Calendar and Drive list shapes
  were checked against real responses; Gmail search was checked earlier, Gmail draft was not run.
- The 2026-10-22 republish that adds the Org Chart view, pods and the 26-seat roster was blocked by the daily artifact
  publish limit; the file was saved and republishes after the UTC reset.

See `wiki/ai-team/org-chart.md` (where it sits), `wiki/ai-team/cross-functional.md` (pods) and
`projects/command-deck.md` (the deck this page does not touch).
