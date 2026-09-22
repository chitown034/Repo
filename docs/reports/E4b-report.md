# E4b — Real estate (panel-property minus E4a's two cards, panel-showings, panel-easop minus the connectivity card, panel-practice)

Branch `e4b-realestate` · worktree `scratchpad/wt-e4b-realestate/command-deck.html`
Baseline 2026-09-12 · verified 2026-09-22 · 21 findings (`audit/findings-E4b.json`, F-E4b-01 … F-E4b-21), 4 with `halt: true`.

## 1. Rates seed re-baked from `ratesSnapshot`

`db/state/ratesSnapshot.json` (`syncedAt 2026-09-22T02:24:25Z`, written by **mortgage-rates-daily**, Optimal Blue via FRED, index date Sep 18 2026) carries six programs. All six were re-baked into `MORTGAGE_RATES`; their APRs were dropped for the same reason the live merge drops them (an APR computed against 6.84% is wrong printed beside 7.038%), and each row got its own `asOf` and FRED series source.

| row | was | now |
|---|---|---|
| Conventional 30-yr fixed | 6.84% (Bankrate, Sep 7) | **7.038%** (OBMMIC30YF, Sep 18) |
| Conventional 15-yr fixed | 6.22% | **6.257%** (OBMMIC15YF) |
| VA 30-yr fixed | 6.125% (Veterans United, Sep 9) | **6.751%** (OBMMIVA30YF) |
| FHA 30-yr fixed | 6.48% | **6.799%** (OBMMIFHA30YF) |
| Jumbo 30-yr fixed | 6.88% | **7.032%** (OBMMIJUMBO30YF) |
| USDA 30-yr fixed | *absent from the seed* | **6.71%** (OBMMIUSDA30YF) — added |

**Rows the document does not carry, left untouched** (F-E4b-20): VA 30-yr refinance 6.25% (Veterans United, Sep 9), VA 15-yr fixed 5.50% (Navy Federal / Veterans United, Sep 2), Jumbo 15-yr fixed 6.29% (Bankrate, Sep 2). Each now says "not carried by the daily feed" in its own source cell. FRED publishes no Optimal Blue series for these three — they need a second source added to `mortgage-rates-daily`, a weekly hand-check task, or removal.

`MORTGAGE_RATES_SYNCED_AT` now reads `2026-09-22 02:24 UTC — 6 of 9 rows re-baked from ratesSnapshot …`.
`LOAN_PROGRAMS` = **39**, `LENDER_DIRECTORY` = **61** — parsed before and after, unchanged (F-E4b-13).
`MARKET_UPDATES` / `MARKET_SYNCED_AT` were left as reference per the brief (F-E4b-17).

Verified with a Node harness that runs the real `applyRatesDoc` / `applyMarketsDoc` against the real document: 6 live rows, 3 seed rows, no orphan USDA row.

## 2. Two real bugs on client-facing numbers

- **F-E4b-02 (P1).** `ratesSnapshot` writes `yoy` as a display string (`"+5.7%"`), and `applyMarketsDoc` fed it to `marketNum()` → `Number("+5.7%")` → `NaN` → `null`. Year-over-year had therefore **never** refreshed: San Diego sat on the Sep 7 seed's +2.4% while the document said +5.7%. Median price and DOM merged fine, so the card looked healthy. Fixed by stripping sign/percent furniture before the band check. San Diego now merges 961,781 / DOM 28 / **+5.7%** / 3 months supply, and Murrieta is appended as a third market.
- **F-E4b-06 (P1).** `renderLeadTriage` rendered a failed run identically to a clean one — green badge "ran 2026-09-21…", four zero tiles — while the `leadTriage` document's own honest failure note ("Invalid API Key or authentication credentials…") was never printed. Badge is now red "run failed", the task's own note is shown, and the tiles are labelled empty-not-zero.

## 3. Task attribution corrected (F-E4b-03)

Six user-visible strings and three comments credited **r5-rates-market-refresh**, which per `routine-health.md` has **never run** under claude-runner. The actual writer is **mortgage-rates-daily** (`38 6,13 * * 1-5`, last ok 2026-09-21 19:24Z). Corrected everywhere in my regions, including the wrong cron (6:40/1:40 → 6:38/1:38 PT) and the advice to "press Run now" on a task that has never produced anything. `lead-triage-daily` was likewise dated 11:40 AM against a runner cron of `33 11 * * 1-5` → now 11:33 AM.

**Outside my regions, routed (F-E4b-04):** `OUTPUT_WATCH` line 18892 watches `ratesSnapshot` under `task:"r5-rates-market-refresh"` — the wrong task, so a real outage would never flag; `FRESH_FEEDERS` line 19753 repeats the r5 claim; line 19762 credits `feeds-weekly` with a daily 9:40 PM write of `builderIncentiveLiveList` that it has not made since 2026-09-17 (F-E4b-12 — the current feed's own source field says a Claude session wrote it).

## 4. You.com RETIRED rule applied (F-E4b-09, F-E4b-10)

Both live-search buttons in the Property search strategy tool were You.com-era features. They did not fail silently, but they dead-ended on a refusal. Applied **option (a)**: each now composes a self-contained question from the form and writes it into the same `vanessaResearch` document the chat personas use (with a duplicate guard), re-renders the Vanessa queue, and reports "Queued — not answered yet", naming `vanessa-research-queue` (hourly at :30, 7:30 AM – 9:30 PM PT, last ok 2026-09-21 20:31) as what answers it. Labels are now **"Queue research (answered by Vanessa) · similar properties"** and **"… · tax record"**.

The tax card's copy — "Claude searches the live web … prioritizing Zillow/Redfin/PropertyShark … to compute a rate and $ estimate" — described a capability that has not existed since the You.com call sites were stripped on 2026-09-11. Rewritten, along with the similar-properties paragraph. A pre-existing "Riverside County **County**" duplication was fixed on the way through (F-E4b-15). No button in my regions fails silently.

## 5. Follow Up Boss → Lofty (F-E4b-05)

Every FUB reference in my regions now names Lofty with honest history: the tool quick-link row (with the "Composio has no Lofty toolkit / lofty-bridge / key pending" truth on the row), the Realtor Playbook pipeline and TC-handoff steps, the showings client card and its link field, the capacity-audit method row, the ISA KPI system-of-record sentence, the SOP technology-stack directory row, and the showings integrations table (green "Composio connected" → red "Not connected — Lofty sync pending", with the exact unlock conditions). JS identifiers and the `"fub"` sync-target id were deliberately left intact — that id is `showing-sync`'s contract — but the queue now *labels* it "CRM (not writing — Lofty re-point pending)". F-E4b-21 lists every remaining FUB line file-wide with its number for routing.

## 6. New: the measured ISA numbers are finally on the page (F-E4b-08)

The `isaKpi` document is the only measured ISA data on the deck and nothing read it; the card showed SOP targets beside a hand-typed Actual column. Added `renderIsaKpiDoc()` + an `isaKpiDocBlock` table under the ISA KPI scorecard card that prints the document verbatim — each metric's own "no data" string, sample size and coverage caveat — with a note giving its stamp (week ending 2026-09-13), that it was measured against Follow Up Boss and is the *last FUB* figures, that **r11-isa-kpi-compile has never run**, and that the `isaScorecard` store its delta needs is empty.

## 7. Needs Steven (halt = true)

1. **F-E4b-18 / F-E4b-07 — the Lofty key.** Lofty Settings → Integrations → API, key into `~/.config/lofty/.env` on the Mac, run `lofty-crm-sync` once, then re-point `showing-sync` off its `"fub"` leg. Nothing about this is doable from the cloud, and `lofty-bridge` is read-only, so no showing has been written to a CRM record since 2026-09-16.
2. **F-E4b-19 — the ISA measurement loop.** The 4:10 PM daily scorecard has never been filled in (`isaScorecard` empty), so the self-report delta can never compute; `r11-isa-kpi-compile` needs one proving run.
3. **F-E4b-14 — licence dates.** Every row in the `licenses` store is undated except the Q3 push, so no alert can fire. The deck already holds NMLS 2026-12-31 and CA Broker 2028-07-16 in `licenseTracker`; I put that cross-reference in the card copy rather than writing his dates for him. The 2022 Toyota Sienna registration (2026-09-27, 5 days out) lives only in `licenseTracker` and raises no licence alert at all.

## 8. Gate

`python3 tests/quickcheck.py` — PASS on every line except the known false-positive "called but never defined" line, which reports exactly the same `$10B`-style names as before my changes. Diffing the candidate set against my own `HEAD` (not `scratchpad/deck/`, which the integrator is actively updating) shows **zero** new names introduced. `node --check` on the extracted inline script: OK. Every element id referenced by new JS (`isaKpiDocBlock`, `isaKpiDocNote`) exists exactly once. Four Node harnesses exercised the changed render paths against the real exported documents.

**Nothing unfinished in my regions.** Not touched, by assignment: the Follow Up Boss import card and the Zoho card in panel-property (E4a), the connectivity card at the end of panel-easop (E4a), the three "Follow Up Boss import" label lines, `OUTPUT_WATCH`, `FRESH_FEEDERS`, `PAGE_DEFS`, `panelStampRegistry` and the footer.
