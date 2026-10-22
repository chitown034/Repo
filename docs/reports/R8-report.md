# R8 — interim: waves 1 and 2 of 3, 2026-09-24 to 2026-09-28

Steven, 2026-09-24, verbatim: *"Have 20 sub agents work to improve and add anything of value missing and ensure
user interface works and have engineers fix anything broken and test and fix when what's broke"*

Mid-round, verbatim: *"Add CAIO/CTO tools link to ops page of dashboard
https://claude.ai/artifact/3BYN1bPNEDfvRygveDDYdU"*

This report covers the two waves that are merged and published. Wave 3 (regression, honesty, security,
performance; four lanes) has not run yet.

## 1. What is live

| Page | Version | Published | What it carries |
|---|---|---|---|
| Command Deck | **v157** | 2026-09-28 | the CAIO / CTO tools card, the phone header fix, waves 1 and 2 |
| ISA Portal | **v35** | 2026-09-28 | U8 and V8 fixes; `code` wrapping at phone width |

- **CAIO / CTO tools** (`#caioCtoToolsCard`) is first under "Program dashboards" on Daily Ops, in the NQ / VA card
  pattern. Its note says the page's figures start from an example company profile, and that what you enter
  saves in the browser you use, not in the deck.
- Both publishes kept the live pages' own later changes:
  - **Deck:** another session had added `#brainEngineCard` to the live deck on 2026-09-28. It was merged in
    verbatim before publishing (commit 76d4d46).
  - **ISA Portal:** the live page was proved byte-identical to the previous publish, apart from its trailing
    newline.

## 2. Wave 1 — eight lanes, real-browser interface pass

**U1–U8:** chrome, daily, Vanessa/AI, markets, wealth and rewards, real estate, life and toolkit, and the ISA
Portal. Every lane drove its panels in real Chromium at 1440 px and 390 px.

- **Phone header.** At 390 px the sticky header sat over the page tabs and the section slider, so 1,371 of
  1,687 phone taps in the sweep landed on the header. Below 640 px it now scrolls with the page; desktop stays
  sticky. The bell menu, which ran 60 px off the left edge, now fits the screen.
- **Squeezed money tiles.** Inline `repeat(N,1fr)` overrides crammed stat rows into unreadable columns on
  phone, across wealth, markets, real estate, life and the ISA Portal. The overrides were removed, so the shared
  responsive rule applies.
- **Shared grids** can now shrink: `.card{min-width:0}` and the 860 px collapse at `minmax(0, 1fr)`. Tables
  scroll instead of widening the page.
- **Smaller fixes:**
  - Vanessa's recommendation cards lost their four COAs and rationale on one data shape; they are restored.
  - A pending-count badge on Vanessa's recommendations.
  - Sortable YTD and Month columns.
  - A live calendar count.
  - Row-count badges on the ISA Portal's client and pipeline lists.
  - ISA jump links no longer hide the target heading under the header.

## 3. Wave 2 — eight lanes, value added

| Lane | Added or fixed |
|---|---|
| V2 daily | "Waiting on Steven" card; the automation-health table stacks per routine on phone |
| V3 Vanessa/AI | a Copy button per recommendation; an owner filter and search on findings |
| V4 markets | NQ quick-links, with a note saying what they are; hedge-fund memo copy; a tax-deadline countdown; a market-hours note |
| V5 wealth | memberships sorted by expiry; row-count badges |
| V6 real estate | "Today & next 7 days" showings; "Next:" lines |
| V7 life/toolkit | a "Connections & sign-ins" card (16 rows) |
| V8 ISA | a "Start here" line for a new ISA; two clipped-price fixes at phone width |
| V1 chrome | stopped by the usage limit with nothing committed; the integrator applied its two main items (below) |

**Integrator fixes:**
- The card title row wraps at phone width.
- `code` wraps inside panels, on both pages.
- The automation-health list is capped at 200 drawn rows, failing and never-run first. The note says the full
  list is in `routineHealth`. The cap keeps the stress sweep at 56 Pass / 1 Degraded / 0 Fail after V2's
  stacked rows.

## 4. The test tool got stricter

`ui-browser.js` gained several checks this round:
- A **clipped** check for text cut off, spilling, squeezed, ellipsized or offscreen. The offscreen check treats
  the panel as a clipper, because `content-visibility` hides overflow from paint.
- Real panel screenshots.
- A settle wait before each click.
- An honest "closed `<details>`" reason in place of a false "covered".

The blank panel shots were the tool, not the page. A probe measured cold panels painting on the first frame
after an instant jump, so `.panel{content-visibility:auto}` stays.

## 5. Gates on the published build

- **quickcheck:** clean, apart from the known "never defined (approx.)" false positive.
- **Harness:** PASS with an empty store, the live 176-document store, `claude` throwing, and `setItemThrows`.
- **Real browser, both widths, light and dark:** 0 page errors, 0 console errors, 0 thrown clicks, 0 overflow,
  0 broken images.
- **Problems in the full sweep** fell from 73 to 52:
  - 47 clipped (43 offscreen, 1 cut, 3 spill), all pre-existing and mostly flex `simple-list` rows. They go to
    R9 lane F3.
  - 5 known false positives in the text check.
- **ISA Portal:** 111/111 clicks at both widths, light and dark, with 0 problems.
- **Stress:** 56 Pass / 1 Degraded / 0 Fail. The one Degraded row is three documents that were never written.
- **Privacy:** 0 client names in either build or in any hand-back.

## 6. Findings

**121 findings** are in `docs/findings/findings-R8.json`, with a `disposition` on every row that needed
follow-up:

| Verdict | Count |
|---|---|
| fixed | 33 |
| improved | 20 |
| tested and working | 44 |
| routed to the chrome lane or the integrator | 12 |
| proposals | 5 |
| not reached | 7 |

**Open for Steven:**
- **R8-V3-vanessa-ai-06.** Team decision messages addressed to Steven do not count in the ISA-line unread
  badge. Changing that changes what the bell counts, site-wide.

**Open engineering items:**
- R8-V8-isa-03: the in-page anchor offset in the ISA Portal.
- R8-V5-wealth-rewards-06: sort the grant pipeline by deadline.

The not-reached rows go to wave 3.

## 7. Next

1. **R9 features:** Steven asked on 2026-09-27 for five agents to add the "Intelligent Business Command Center"
   features. Five lanes (F1–F5) are defined in the R9 brief:
   - a loan-math workbench;
   - production and lead-ROI calculators;
   - a command palette and product tour;
   - an attention queue and a weekly CEO review;
   - advisor modes in Vanessa's chat.
2. **R9 connections:** OpenWA for WhatsApp; n8n and Pabbly routing for the nine systems; the CLI-Anything dotloop
   harness; the second-brain leaf pages.
3. **Wave 3** runs over the R9 result, then one final publish of both pages.

The usage limit stopped sub-agents three times this round. The next rounds run at most four at a time, and
commit early.
