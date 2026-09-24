# R5 — eight engineers in parallel, 2026-09-24

Steven's instruction: *"Dispatch all engineers to work in parallel to solve all the tasks now and to fix
anything not working throughout dashboard."*

## What was dispatched

(Named R5 in the repo because R1–R4 were earlier rounds. In the scratch repositories the eight lane branches were `r3-<lane>`, so a few code comments in the published deck say `R3-<lane>`; they mean this round.)

The 108 findings that R2 left marked "scoped to command-deck.html or the published ISA Portal — owner:
whoever holds the deck this cycle" had never been checked against the real build. They were split
across eight lanes that could not collide:

- **Seven Command Deck lanes**, each owning a disjoint set of panels. Lane G owned the shared
  plumbing: sync, stamps, self-check and freshness board.
- **One ISA Portal lane.**

Each engineer had its own git worktree cut from the live build (`1790126022-dec8` for the deck,
`1790126193-8995` for the portal). The same gates ran after every commit: the static check, plus the
runtime harness on an empty store and on the full 175-document store snapshot. Every lane also swept
its own panels for anything else not working.

The seven deck branches merged with **no conflicts**. The ISA branch merged the same way.

## Results — 129 rows in `docs/findings/findings-R5.json`

| Verdict | Rows | Meaning |
|---|---|---|
| already-fixed | 63 | The defect is gone from the live build — later rounds fixed it. Each was verified against the code, not the finding text. |
| fixed | 37 | Changed this round: 24 by the lanes, 13 by the integrator (see below). |
| needs-steven | 21 | New automations, routine changes on the claude.ai account, and security or consent calls. Listed as items 49–54 in `docs/NEEDS-STEVEN.md`. None is a page defect. |
| not-reproducible | 4 | Tried and could not make it happen; the method is in each row. |
| already-closed | 1 | `trustLevels` v1 exists in the store. |
| deferred | 1 | F-E8-77: queue-first buttons need two new verbs on the Mac bridge first. |
| open | 1 | F-E8-07: `vanessa-sweep` is described as working a `vanessaQueue` document that does not exist. |
| declined | 1 | R5-E-aiteam-02: adding routine-written docs to a "you edited" stamp would claim edits Steven never made. |

### What changed on the Command Deck

- **Vanessa's "Reach her via" table** said Discord was live. `agentInbox` says the bot token is still
  pending and there is no channel id, so the row now says so.
- **The Session Read citations** could throw on a non-array shape and blank the source line. Now
  guarded, the same way as every other live list.
- **The Top performers attribution** now names the session that actually wrote the entry on screen.
- **The Top performers live note** has its own element, so the live feed no longer overwrites the
  static tables' honest stamp. Lane C built the element; the integrator repointed the feed at it.
- **The growth scorecard** read "the Six Levers" over five levers.
- **Kanban routine times** (kr2, kr3, kr5, kr8, kr9, kr11) were rebuilt from the runner's real crons in
  the page seed. The live `kanbanCards` document was also updated (v129 → v130), touching only those
  six rows' text and time, and only because each still held the old seed value.
- **The Apple Health card** no longer claims a twice-daily write from a daemon that has been down since
  2026-09-13.
- **Next Big Moves and the AI-team toolbox** now carry the dated 57 / 53 cloud-routine count, not the
  stale 50 / 46.
- **Chicago and New Braunfels** now have travel tables. Both are empty, and each says "No listings
  researched for this city yet"; nothing was invented to fill them.
- **The output watch list** now names the right documents:
  - `cpiOpportunityLog`, not `cpiCycles`;
  - `isaKpi`, not `isaScorecard`;
  - both writers of the morning brief;
  - new rows for `plaidBalances` and `apptPrep`.
- **A lead-triage failure note** that quotes the retired CRM is now marked as the old target.
- **Placeholders:** the onboarding placeholder now reads 0/17 to match its tracker.
- **The ISA line** now shows when the ISA last opened the thread and the escalation ladder's rung. The
  ladder's timestamp is labelled a schedule slot, because that is what it is.
- **Shared plumbing (lane G):**
  - Panel stamps redraw only the panel whose data changed, not all 40, after every save.
  - The self-check no longer calls a stale feed a display-blocking fault.
  - Freshness-board jump links now switch to the panel's tab first; 23 of the 28 rows used to go
    nowhere.
  - Panel-vanessa's stamp now tracks the recommendations card that moved there.
- **A code comment** used a real client's surname as its example. It now uses a placeholder. Both page
  sources were re-scanned against every client name in the store: 0 hits.

### What changed on the ISA Portal

- Literal `\uXXXX` escapes that printed as raw text were fixed in the Lender directory and the
  Recruiting card.
- Three places repeated the disproved "cloud routines can't write unattended" claim. All three are
  corrected.
- **Its Sync status panel was telling the ISA the wrong thing.** It said the ISA line was the only
  thing that reached Steven. It also said the pipeline, the client list and her self-grades were not
  synced. In fact, the **Pipeline Sync (live)** routine (`trig_01M5zR1Po44gnHvTwA9ogZaB`) carries
  five documents between the two stores, in both directions, four times a day:
  - `reClients`
  - `pipeline`
  - `isaScorecard`
  - `isaGradingScores`
  - `isaKpiSopActuals`

  Its own `ciLog` rows show it ran ok on 2026-09-23 and twice on 2026-09-24. Corrected everywhere
  the page said otherwise:
  - the hero line;
  - the Vanessa card;
  - the Sync status intro and the "What IS synced" table;
  - three drift rows;
  - a note telling the two same-named routines apart;
  - the showings and route-planner cards.

  The drift table's right-hand column is still the 2026-09-23 hand read, and the panel stamp says so.
- **Loan United's licence count.** The niche list said "Licensed in 41 states". The same page's
  lender row, verified 2026-09-22, says 24 states or jurisdictions. The niche list now matches it.
- Published as ISA Portal version 33. The integrator read all 4,874 lines of the live page first,
  as the publish gate requires. It was the same version the lane built on, so there was nothing to
  merge.

### Repo

- **`integrations/CONNECTIONS.md`:** Discord was listed as working. It now says not live, and the
  Inkbox identity carries the rule "Steven and Vanessa only, never clients".
- **`docs/NEEDS-STEVEN.md`:**
  - New clocked item 2a: three web-UI routines, five lines, before Friday 4 PM PT.
  - Items 16, 20(b) and 46 corrected.
  - New items 49–54.
- **`docs/SETUP-RUNBOOK.md` and the published runbook (v8):** new step H7.

## Gates on the merged build

- Static check: PASS. Its known false positive fails the same way on the base.
- Runtime harness: PASS in four configurations — empty store, full store, `window.claude.use`
  throwing, and `localStorage.setItem` throwing. Every run had 0 exceptions, 0 safeRun failures and
  0 missing ids.
- Stress sweep, run on the merged build against the 175-document store: **56 Pass, 1 Degraded,
  0 Fail** of 57. The last clean run was 54, 1 and 0 of 55; the two added tests come from the two
  documents newly watched.
  - The one Degraded row is the same class as before: watched documents that their Mac tasks have
    never written can't be restored.
  - Those are `revenueScan` and `healthCoaching` as before, plus `plaidBalances`, which is watched
    as of this round. `r7-plaid-balances` runs, but writes nothing until Plaid is wired.
  - The sweep measured `fb2a3c5`. The published build is `95b1a8c`, which differs by one code
    comment and was re-gated with the harness four ways.
- Published as Command Deck version 153.
- Store writes, each pinned with `if_version` and read back identical:
  - `kanbanCards` v129 → v130;
  - `stressTestReport` v6 → v7;
  - one row in `ciLog` (v232 → v233; relabelled from R3 to R5 in v234, and `stressTestReport` likewise in v8).
