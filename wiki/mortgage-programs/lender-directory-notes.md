# Lender directory notes

How the deck's lender directory groups in practice — by what each lender actually does well — plus the verification flags already found in the deck that a router should repeat rather than silently drop.

## Agency wholesale generalists

The broad Conv/FHA/VA/USDA broker-channel lenders: United Wholesale Mortgage (UWM, the #1 broker-channel lender by volume), PRMG, Equity Prime Mortgage, Freedom Mortgage (a VA & FHA powerhouse specifically), TPO Go, The Loan Store, Eleven Mortgage, eLend, Giant Lending, JMAC Lending, Kind Lending, Mortgage Solutions Financial (notable for manual-underwrite capability), NextRes (NewRez TPO), Orion Lending, Union Home Mortgage, Windsor Mortgage, AAA Lendings, Brokers Advantage. Price these first for any conforming, FHA, VA or USDA file per `wiki/mortgage-programs/program-selection.md` before routing to a niche lender.

## Non-QM specialists

Angel Oak (the pioneer — Bank Statement, 1099, DSCR, ATR-in-full), Acra Lending, Fund Loans, LendSure, HomeXpress Mortgage Corp, Oaktree Funding, NewFi Lending, 5th Street Capital, Mega Capital Funding, NewRez (Smart Series: SmartSelf, SmartEdge, SmartVest, SmartFunds), Quontic Bank, Change Wholesale, Champions Funding, First National Bank of America (also portfolio/alt-doc/foreign-national). Route here once the borrower's income or credit shape takes them out of agency AUS — see the Non-QM section of `program-selection.md`.

## Investor / DSCR / hard money

DSCR and fix-and-flip: Kiavi, RCN Capital, Velocity Mortgage Capital. Hard money / private / bridge: Anchor Loans, JCAP Private Lending, PB Financial Group, TaliMar Financial, Val-Chris Investments, Kennedy Funding (also commercial bridge). Commercial: Commercial Capital Bidco, Kennedy Funding, Velocity Mortgage Capital (also does small-balance commercial).

## Equity, reverse, and niche

- **2nd lien / HELOC**: Spring EQ, Symmetry Lending (piggyback structures too).
- **Reverse**: Finance of America Reverse, Liberty Reverse Mortgage, Longbridge Financial Reverse, Mutual of Omaha Reverse, TMAC Reverse — a strong fit inside the VA/military-retiree client base.
- **DPA / bond programs**: AHA/HOPER, Click N Close Mortgage.
- **Property-type niches**: Triad Financial Services and Windsor Mortgage (manufactured/mobile), United AG Lending (agricultural/rural), CALVET (CA veterans only, contract-of-sale structure, own underwriting — expect 60–75 days).
- **Foreign national / ITIN**: Champions Funding, LendSure, First National Bank of America.
- **Loan United**: FHA/VA down to 500 FICO with manual underwrite, no-FICO IRRRL/streamline, manufactured homes, licensed in 41 states.

## Verification flags carried from the deck — repeat these, do not drop them

- **Change Wholesale** — no longer carries a CDFI designation per 2024 reporting; don't repeat the "CDFI" label until confirmed directly with the lender.
- **Kings Mortgage Services** — public info shows a Visalia, CA operation with 5 CA branches; a national wholesale TPO channel could not be confirmed. Verify directly before relying on it.
- **Oval Mortgage** — no public wholesale site, NMLS record, or press coverage found. Do an NMLS Consumer Access lookup or call before using.
- **Liberty Reverse Mortgage** — parent Onity Group reportedly exiting reverse-mortgage origination. Confirm the lender is still active before sending a client here.

## What "overlay" means here

Every lender applies its own overlay on top of the agency or VA/FHA/USDA base guideline — always separate the two explicitly (Lucia's lane, `wiki/ai-team/org-chart.md`) rather than quoting an overlay as if it were the published guideline. Turn times and specific overlay details are not tracked in this wiki because they move faster than a wiki page can — check current status with the wholesale rep or account exec directly.

## See also

- `wiki/mortgage-programs/program-selection.md` — which category sends you to this directory.

Source: Command Deck, "Lender Directory" card, verified-status notes dated 2026-09.
