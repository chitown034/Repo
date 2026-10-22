# R7 — connect what can be connected, and an eight-lane audit, 2026-09-24

Steven's instruction, verbatim (sent twice): *"continue finishing what is not connected and connect them. have all
engineers working in pararrel and also audit entire dashboard to ensure everything is working and fix everything
broken"*

Mid-round, verbatim: *"Add the NQ trading playbook link at the top of trading and markets section"* — a link to
the NQ Range Desk artifact.

## 1. Connections — measured, not read from a status row

Every row below was measured on 2026-09-24 between 15:50 and 16:05 UTC, with one read-only call each. Nothing
was written to any system.

| Connection | Measured | What changed |
|---|---|---|
| Gmail, Google Calendar, Notion, Slack, Strava | answered | nothing to do |
| **Canva** | answered (`list-brand-kits`) | three deck rows and one portal row said "needs reconnect"; all corrected |
| **You.com** | answers, **balance 0 credits** | stays **retired** (Steven's 2026-09-22 decision); every line now says both halves |
| **Zoho** | connected, `ZOHO_GET_ZOHO_RECORDS` → **403 NO_PERMISSION** at 15:56 UTC | unchanged — only Steven's profile checkbox fixes it (NEEDS-STEVEN 5) |
| **GoHighLevel · Google Drive · Discord bot** | Composio `initiated`, no account | fresh sign-in links generated at ~15:57 UTC; they expire in ten minutes, so Steven asks for new ones when he sits down (NEEDS-STEVEN 55) |
| Follow Up Boss | no account | stays disconnected |
| Inkbox | email + iMessage, no phone number | no SMS or voice |
| Mac runner | `runnerStatus` last synced 02:06 UTC | about 14 hours stale at audit time (NEEDS-STEVEN 58) |

`integrations/CONNECTIONS.md` and `docs/NEEDS-STEVEN.md` (items 55–62) carry the same measurements.

## 2. The audit — eight lanes in parallel

Seven lanes split the Command Deck's 40 panels with no overlap. Lane G owned every shared helper and every
connection-status line, and applied the other lanes' `needs-G` rows. Lane H owned the ISA Portal. Every lane
rendered its panels against the live 176-document store and gated every commit.

**113 findings** (`docs/findings/findings-R7.json`):
- 31 fixed by the lanes;
- 11 fixed by lane G for other lanes;
- 67 tested and working;
- 1 already fixed;
- 3 for Steven.

### What was broken and is fixed

- **Timestamps were 7 hours off on any device not set to Pacific time.** Two shared formatters, used by every
  chat bubble and every sync note, had no time zone.
- **The alert bell and the freshness board disagreed** (4 stale versus 2). A code comment claimed they "can
  never disagree". The stat now reads "Feeds overdue" and explains the difference.
- **A deleted Google calendar was still counted.** Nine calendars became eight, and five business calendars
  became four.
- **The AI team roster counted Steven as an agent** (225, now 224). The Scale Opportunity Log's breakdown
  dropped two compound entries, so its line no longer summed to its badge.
- **Health metrics:** corrupted rows made "latest weight" read 938 lb. Rows with implausible dates are now
  ignored. The Notion health card no longer claims a Mac task runs that has not been scheduled.
- **An overdue USC deadline showed as "0d left"** (a −0 rounding bug).
- **Stale Follow Up Boss mentions** in stored task descriptions and a DMAIC note are now labelled as the
  retired CRM. The stored data is untouched.
- **The panel freshness registry tracked documents that do not exist** (panel-work, panel-mind), and missed
  two that panel-aiteam reads.
- **The dark theme** lacked one field-border colour.
- **ISA Portal:** the ISA's badge counted a team-to-Steven "needs a decision" message as her own pending
  decision. Its sync table re-measured three rows that had drifted.
- **The AI Hedge Fund paste box** claimed a blank input triggers a live web search. It cannot.

### Added

- **NQ trading playbook** — the first card at the top of Trading & Markets (panel-apex). It links the NQ
  Range Desk. It says its journal saves in that page, and that its prices are simulated. Lane C refused the
  mid-task relay of this request as unverifiable, which was the right caution; the integrator applied it.

### Integrator correction

Lanes G and H replaced "retired" with "connected but unfunded" for You.com, which dropped Steven's decision. The
portal also invented "reconnected", "Steven's subscription" and "until Steven funds it". All 18 lines now say:
retired 2026-09-22 by Steven's decision, and the connector still answers at 0 credits. The truth file the
lanes read was corrected so that the next round cannot repeat it.

### For Steven (3)

1. **Loan Scenario Builder:** for any FICO of 620 or higher, FHA always outscores Conventional by 2 points. The
   cause is a "specificity" bonus for how many occupancy types a program allows. That contradicts the panel's
   own text, which says Conventional suits 680+. How the tool ranks programs is a licensed-guidance call, so
   the formula was not changed.
2. **An old twin-queue packet** asks you to rotate the Follow Up Boss credential in Composio. That connection
   was removed today, so the packet can be marked handled.
3. **The News panel's "Other city" field** holds a pasted document link instead of a city name. Type a city.

## 3. Gates on the merged build

| Gate | Result |
|---|---|
| quickcheck | PASS, except the known dollar-amount false positive |
| Harness: empty store, live store (176/176), `claude` throwing, `setItemThrows` | PASS, PASS, PASS, PASS — 0 exceptions, 0 safeRun failures, 0 missing ids |
| ISA harness: empty and store (14/14), plus `node --check` | PASS |
| Real-browser sweep, deck, desktop | 16 pages; 652 clicks with 0 errors; 0 overflow; 0 console errors. The badText hits were findings-table quotes (false positives). |
| Real-browser sweep, ISA, desktop and phone | 111/111 clicks at each width, 0 errors, 0 overflow |
| Stress sweep | see §4 |
| Client-name scan of both sources | 0 hits |

**Found by the new real-browser tool:** at phone width, the deck's sticky header fills about 660 of 844 pixels.
It is fixed in R8 wave 1 (lane U1), not in this build.

## 4. Stress sweep and publish

- **Stress sweep on the merged build: 56 Pass · 1 Degraded · 0 Fail**, identical to the R6 baseline.
  - The one Degraded row is unchanged and on Steven's list: three watched documents (`revenueScan`,
    `plaidBalances`, `healthCoaching`) have never been written by their Mac tasks, so there is nothing to
    restore.
  - 176/176 documents restored with 0 exceptions.
- **Published 2026-09-24:** Command Deck **v155** and ISA Portal **v34**.
  - The service refused a normal publish until the live pages were re-read in full: 4.3 MB for the deck.
  - Both live pages were first diffed against the builds published last round (v154, v33) and found
    identical, so nothing could be lost. Steven then confirmed a force publish.
  - The deck publish warned about a `claude.use("mcp")` reference. It is a code comment, not a call.
- **The setup runbook is v9**, published the same day: two equal Macs, nine harnesses, `connect.sh`,
  the `publicfeeds` terms gates, and a note that the Drive sign-in is open.
