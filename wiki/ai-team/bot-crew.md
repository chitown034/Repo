# The Bot Crew — the 355-agent chat surface that mirrors the org chart

The Bot Crew (https://claude.ai/artifact/B8BPDvyE55p8hT7PTyKbjG) is Steven's in-Claude agent page: every seat on
`wiki/ai-team/org-chart.md` has a chat card there, plus the specialist groups that roll up under each executive.
It sits under Vanessa as a surface, not a new seat. Last aligned with the org chart 2026-10-22 (wave 6).

## What is on it (2026-10-22)

| Part | Count | Notes |
|---|---|---|
| Executive team and mentors | 13 | Vanessa (Chief of Staff, first card) · Marcus · Victor · Sofia · Derek · Alexandra · Nadia · Elena · Elon · Maxwell · Apex · James · Kevin |
| Named seats and desk group | 21 | Harrison, Gwen, Marguerite, Carmen, Denise, Howard, Lucia, Walter, Rosa, Wren, Garrett, Juliet, Winston, Beatrice + the seven desk seats (`desk-seats.md`) |
| CA broker and C.A.R. forms group | 8 | Forms Tutor, Form Selector, purchase-agreement walkthrough, disclosure package, deadline calculator, broker file review, DRE tracker, new-agent forms coach |
| Specialist groups | 308 | 31 groups (personal life, real estate, lending, veterans, recruiting, content, nonprofit, book, trading, education, MBSE/DAU, AI ops) |
| Original agents | 5 | Lucy, Riley, Jeffrey, Karen, Hermela |
| Total | 355 | |

**Workflows (23):** 12 multi-agent runs (inbox to action, new lead, loan milestone, realtor partners, recruiting,
content week, webinar, weekly CEO review, listing launch, closing, trading day, DAWIA study) and the 8 standing pods
from the org chart as runnable workflows — Deal, Lead, Listing, Mortgage, Growth, Money, Ops, Client Care — plus three
org-level runs: the Chief of Staff daily cycle (Automation / AI team / ISA / Steven buckets, ≤3 Needs-Steven), the
mentor council (Maxwell, James, Kevin, then Vanessa's call) and new-tool vetting (Nadia grades → Elon → Elena → Derek's
pilot plan; nothing installs without Steven). Each pod
runs its seats in order, Alexandra gates anything client-facing, Vanessa consolidates last. "Schedule in Claude" turns
any workflow into a scheduled-task prompt (nothing is scheduled until Steven creates it).

**AI org chart panel:** Vanessa → executives (with their named seats and the crew groups that roll up to them) →
mentors → pods. Group roll-up: Vanessa p14 p1 p2 p3 p5 p8 p10 c9 · Marcus p4 c8 · Victor c1–c6 c11 c12 · Sofia c7 c13
c14 p12 · Derek p9 c15 · Alexandra x2 · Nadia c10 p7 · Apex p13 · Kevin p6 p11.

**Orchestration:** Vanessa (and the Command center group) can `consult_agent` any card and `start_workflow`; join rules
are the same as `cross-functional.md` (client-facing → Alexandra; credentials/fraud → Elena; automation → Derek;
money → Marcus; loan mechanics → Harrison; transactions → Carmen; new tools → Elon).

**Live tools:** 20 connectors read through the page (Gmail, Google Calendar, Google Drive, Notion, Fieldy, You.com,
Slack, Expedia, WhisperAI, Canva, Context7, Claude Code Remote repos, Strava, CarGurus, Rome2Rio, Groupon, Trip
Logistics, Zoom, Turo, Vanguard Advisor Tools). Anything that writes — a Gmail draft, a calendar event, a Notion
page — waits on an approval card. Nothing sends.

**Resource library:** official sources each group checks first (VA M26-7, CFPB TRID, Reg Z / Reg X, NMLS, HUD fair
housing, C.A.R. Forms Tutor, DRE, Google Ad Grants policies, DAU, GI Bill tool, USAJOBS, CME NQ, BLS, NinjaTrader,
Claude docs, Pabbly, Turo). Steven's own dashboard links are owner-only (`ownerseed/links`).

**Owner seed:** Steven's profile and links sit in the page's owner-only store (`ownerseed`), so viewers of a shared
link never see them.

## Rules the page keeps

- Draft-only. No card sends, books, pays, quotes, signs or writes to a client-facing system.
- Kevin is an original fictional composite (`.claude/skills/kevin-mentor`); he replaced Cole on the crew on 2026-10-22,
  keeping Cole's card id so old notes carry over.
- Elon and Nadia are proposal-only; Apex is paper-only; Harrison and the Mortgage Pod never quote ("market average,
  not a quote").

## Where the build lives

Built from session scratch files (`assemble.py` + `wave4.js` / `wave5.js` / `wave6.js`), not from this repo. A change to a
seat here should be mirrored on the crew page in its next wave.
