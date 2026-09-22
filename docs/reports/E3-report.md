# E3 — Wealth · Command Deck Cycle 6

Baseline 2026-09-12 · verified 2026-09-22. Branch `e3-wealth`, worktree `SCRATCH/wt-e3-wealth`.
Regions: panel-james, panel-personalaccounts, panel-tax, panel-familyoffice, panel-income,
panel-assets, panel-housekeeping, plus the tax-calendar / memberships / myCards / licence-tracker /
Plaid / council-pricing JS named in §7.

## What changed (9 changes via 18 anchored replacements, 1 file, +65 / −15)

| # | Where | Change |
|---|---|---|
| 1 | panel-assets, itemized-assets card | Three literal `’` escapes sat in plain HTML and rendered verbatim ("didn’t find…"). Replaced with real apostrophes. |
| 2 | `renderTaxCalendar` | Passed rows were only dimmed and kept their original type badge, so passed EXECUTION WINDOW rows still read amber/act-now. Passed rows now carry a gray **passed** chip and a forced-gray type badge. No row deleted or re-dated. |
| 3 | `renderQet` payment tracker | Q1–Q3 2026 due dates showed with no indication they had gone by (Q3 was 7 days past). Each quarter gained an ISO date; the Due cell now shows **passed** or an amber "Nd left" inside 30 days. Amounts and stored `qetPaid` untouched. |
| 4 | `renderMemberships` | New `membershipExpiryNote()` reads the free-text expiry through `extractIsoDate` and prints red **EXPIRED** + "lapsed Feb 28, 2026 · 206 days ago" / amber "Nd left" / green "current through …". Unparseable values ("Annual", "TBD", "Card-tied", "—") print nothing. Updates live as the field is edited. **Steven's stored values were not changed** — Enterprise Plus still reads `2/28/2026`; the page now just says what that means. |
| 5 | `renderMemberships` + `renderMyCards` | Null-row guard, copying the one `renderLicenseTracker` already has. A single `null` row threw `TypeError: …reading 'cat'` and killed the card — reproduced against the untouched base deck, so pre-existing. |
| 6 | `renderPlaidStatus` + "Live account sync — honest status" | No Plaid keys (§2) and no `plaidBalances` doc in the 161-doc export — it has never been written. Amber "no snapshot yet" (reads as *imminent*) → gray "**not configured**" with the reason, and the honest-status card now says the Mac bridge cannot run without keys and every figure in the panel is hand-entered. |
| 7 | panel-housekeeping subscriptions | Live `subscriptions` doc is `{"v":[]}`. Card copy and empty state both promised "the monthly Plaid audit fills this once the bridge is linked". Both now state the doc is empty as of 2026-09-22, that no Plaid keys exist, that nothing is audited automatically, and that the list is hand-entered. |
| 8 | panel-familyoffice, weekly opportunity audit log | "Auto-generated weekly" → the screening filter plus "**Status 2026-09-22:** the cloud routine that writes this FAILED its last scheduled run, so nothing has been added since the entry below" (last entry 2026-09-13). |
| 9 | FEO strategy scorer FO01–FO12 | The card claimed it compared against "your real ~$2.4M net worth (this dashboard)" but tested against a frozen `YOUR_ESTIMATED_NET_WORTH = 2430212`, while the dashboard's own formula yields **$2,440,211.86** — a $9,999.86 drift that grows with every balance edit and skewed every "need $X more" figure. New `feoNetWorth()` reproduces `renderGlobalNetWorth`'s formula from the live docs, with the frozen constant kept as a try/catch fallback. Card copy no longer quotes a hardcoded figure. No balance or property value altered. |

## Verified, not changed
- **Licence & credential tracker** — already flags EXPIRED/≤30d/≤90d correctly; nothing expired today. Nearest: Toyota Sienna registration **2026-09-27 (5 days)**, then NMLS 2026-12-31. Five rows legitimately carry no expiry.
- **FERS / VA compensation** — Dec 1 2025 (2.8% COLA) table reconciles exactly with the $4,078.45/mo · $48,941.40/yr used in panel-personalaccounts, `inc-va`, and the VA-as-a-bond card; Navy $3,122.85/mo = 50% × $6,245.70. Left alone as the brief directs.
- **Council pricing / OpenRouter** — `openrouterCredits` = `state:"no_key"` (2026-09-16); `renderCouncilOutside` already says the outside seats cannot run at all. Honest as written, and it lives in panel-aiteam (E6) — not edited.
- **Account balances, property values, liabilities, income streams** — untouched, per §7.

## Needs Steven
1. **Enterprise Plus Platinum** — stored expiry `2/28/2026` lapsed 206 days ago. The deck now says so; only Steven knows whether it was renewed. (F-E3-04)
2. **Plaid** — no API keys; live balances are impossible until Production credentials exist (dashboard.plaid.com → Team Settings → Keys → `~/Applications/plaid-bridge/.env`). Money + vendor account. **HALT.** (F-E3-06)
3. **OpenRouter** — no key, so the council's non-Claude seats cannot run. **HALT.** (F-E3-12)
4. **Beneficiary designations** — all seven rows have never been verified. A designation overrides the will. (F-E3-16)
5. **Weekly opportunity audit + subscriptions** — both are blocked on infrastructure, not on content: the cloud routine's failure and the missing Plaid keys.

## Routed to the integrator (outside my regions)
- **F-E3-14** — base lines **14006–14007**, `SOD_ITEMS` (renders into `sodList`, panel-easop/E4b): "…then **FUB** for real estate" and "Check inbound channels: **FUB Phone**, Zoho telephony/SMS…". Follow Up Boss is retired 2026-09-22 and its key has failed since 2026-09-16 — the checklist tells Steven to check a dead system.
- **F-E3-15** — base line **18278** `dmaicProjects` seed d3 *and* the same string inside `cdStateSeed` at line **6633**, *and* the live `dmaicProjects` doc: "needs a real timestamp-to-first-contact metric pulled from **FUB/Zoho**". Neither source works today (FUB retired, Zoho 403 NO_PERMISSION). A page-only edit gets overwritten by the stored doc.
- **F-E3-13** — `MEMBERSHIP_ASSOC` (renders into `membershipAssocRows`, base line 4940, panel-masterplan/E1) evaluates no dates. Nothing is wrong today — all three dated rows are future — but it is the same blind spot Enterprise Plus fell into. The new `membershipExpiryNote()` helper is reusable.
- **F-E3-17** — the Top performers card sits in my HTML but its data (`TOP_PERFORMERS` / `liveFeeds.topPerformersLiveList`) belongs to E2. Left untouched; its sync note "refreshed automatically once a day" is undated and should carry E2's stamp.

## Gate
`python3 SCRATCH/tests/quickcheck.py wt-e3-wealth/command-deck.html` — every line PASS except the known
false-positive undefined-function line, and that line's name set is **byte-identical to the base deck**
(diffed programmatically: no new name added, none removed). `node --check` on the extracted inline
script: clean. Every element id the changed functions touch was confirmed present.

Targeted runtime harness (`/tmp/e3-smoke.js`, DOM shim + all 161 exported docs loaded as the store):
- tax calendar → 50 rows, 30 marked passed, **0** passed rows retaining an amber badge, "Upcoming only" → 20;
- `membershipExpiryNote` → `2/28/2026` EXPIRED (206 days), `Feb 28, 2027 (verify)` current, `Annual`/`TBD`/`null` empty;
- `renderMemberships` → 32 rows, exactly 1 EXPIRED, 3 current; survives null/garbage rows (base deck throws);
- `feoNetWorth()` → **2440211.86** against the live export, falls back to 2430212 on junk docs, no NaN rendered.

Nothing in my assignment was left unfinished.
