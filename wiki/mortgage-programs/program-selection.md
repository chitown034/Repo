# Program selection

The decision tree across the deck's loan-program cards, grouped by category, so a scenario routes to the right program family before it routes to a specific lender.

## Start here: the default path

Run every borrower through **DU + LPA (dual AUS)** first under the Conforming category — it is the default best-rate option for a qualified W-2 or self-employed borrower with full documentation. Note the platform nuance: DU findings auto-release to the lender, but **LPA findings do not** — someone has to manually log into freddiemac.com and release them, or the lender never sees them. Only route to a niche category below once conforming is confirmed to not fit or not to be the best fit.

## Government programs — by borrower situation

- **VA** — active duty, veteran, or surviving spouse; zero down, best rate; qualifies on residual income alongside DTI. See `wiki/mortgage-programs/va-eligibility.md` and `va-affordability.md`.
- **FHA** — credit-challenged or higher-DTI borrowers, first-time buyers; down to very low FICO with manual underwrite and documented compensating factors. See `wiki/mortgage-programs/fha-usda.md`.
- **USDA** — a zero-down alternative to VA for non-veterans in rural/exurban areas; the property must clear the USDA eligibility map *before* taking the application. See `fha-usda.md`.
- **CalVet / CalHFA / DPA** — California-specific: CalVet is VA-eligible-only through the state's own underwriting; CalHFA pairs a first mortgage with a silent-second down-payment assistance loan; general DPA programs layer onto whichever first mortgage fits, gated by income/purchase-price limits that must clear before the first mortgage locks.

## Credit-and-income-shaped routes (Non-QM)

- **Bank Statement** — self-employed, 1099/gig-economy borrowers; qualifying income from 12–24 months of average deposits, less the lender's deemed-expense factor (commonly 50% unless a CPA letter documents a lower actual ratio).
- **DSCR** — investor qualifies off the property's rent, not personal DTI; no tax returns or employment verification; target DSCR ≥1.0–1.25 depending on lender/pricing tier.
- **I/O, 40-Year Terms, All-In-One** — payment-sensitive or high-cash-flow borrowers; confirm QM-exempt status and stress-test the payment jump at recast (I/O) before recommending.
- **No Income Verification** — asset-rich, income-complex borrowers (retirees on assets, foreign nationals, trust beneficiaries); expect a larger down payment and a rate premium — the most restrictive Non-QM category.
- **BK & FC (Credit Recovery)** — confirm the seasoning clock first: it varies by underlying program (FHA ~2yr post-Ch7, VA ~2yr FC/Ch7, Conventional ~4yr Ch7/2yr Ch13).

## Property-and-purpose-shaped routes

- **Jumbo & Jumbo VA** — high-balance/high-net-worth; Jumbo VA reaches ~90% LTV with no monthly MI up to roughly $3M, a strong fit for a veteran buyer in a high-cost market avoiding MI on a large loan.
- **Renovation (203(k) / HomeStyle/CHOICE)** — fixer-upper or distressed-property purchases; requires a consultant feasibility study and draw-schedule discipline regardless of FHA vs. conventional flavor.
- **Non-Warrantable Condo, Manufactured, Land/Ag (Land/Lot, Farm/Ranch, Hobby Farm)** — each routes to a lender that manually underwrites the specific property type rather than relying on standard agency project approval.
- **Investor / Commercial / Fix N Flip / Bridge / Hard Money** — the further from an owner-occupied 1–4 unit, the more the file moves from agency AUS toward negotiated, deal-by-deal underwriting.
- **Foreign National / ITIN / DACA** — driven by documentation status, not credit quality; DACA routes cleanly to FHA under 2021 HUD guidance with a valid, unexpired EAD.
- **Reverse** — 62+ homeowners, mandatory HUD-approved counseling before application; a strong fit inside the VA/military-retiree client base.

## See also

- `wiki/mortgage-programs/lender-directory-notes.md` — which lender actually carries the program you just picked.
- `wiki/mortgage-programs/disclosure-timing.md` — the TRID/RESPA clock that starts once the program is picked.

Source: Command Deck, "Loan Programs" card (the program-cards data and category filter) and the "ARIVE loan flow" SOP card (The Ultimate Mortgage Broker SOP).
