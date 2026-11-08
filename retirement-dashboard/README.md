# Retirement Horizon

A single-file, offline-capable retirement, investment, tax, insurance and benefits planning dashboard. Open `index.html` in a browser. `dashboard.html` is the same page without the document wrapper (used for publishing as a claude.ai artifact).

## Tabs

| Tab | What it does |
| --- | --- |
| Overview | Year-by-year projection of every tax bucket, income sources vs. spending, taxes and IRMAA each year, Monte Carlo odds, action items, full ledger |
| Family office cockpit | Five lenses (as entered, survivor, crash, long-term care, longevity to 100); family balance sheet over time; cash-flow Sankey for any year; 8-factor risk radar; goals funded in priority order (essentials, taxes, lifestyle, wishes, legacy); liquidity ladder / bucket sizing; "how much do I need" by withdrawal rate; inflation purchasing power; two-generation legacy under the 10-year rule; holistic review of 14 planning areas |
| Portfolio & dividends | Editable holdings (mutual funds, ETFs, stocks, bonds, munis, REITs, cash) by account: expense ratio, income, tax drag, allocation, asset location, 30-year fee/tax cost, fund-by-fund recommendations; dividend portfolio calculator ($1M at 4% = $3,333/mo, raised with inflation) with four withdrawal methods, dividends vs. principal sold, 1,000-market Monte Carlo, real-history backtests for every start year 1996–2020, success-rate grid by rate × years, year-by-year table |
| Rental properties | IDEAL framework (Inflation, Depreciation, Equity, Appreciation, Leverage) for each property or the whole portfolio: rent/expense growth, vacancy, management and reserves, amortization and payoff jump, 27.5-year depreciation and tax shield, passive-loss rules, equity build-up chart, IDEAL return stack with return on equity, real rent vs. fixed payment, leverage curve (all-cash to 20% down), exit options (sell with recapture, 1031, cash-out refi, step-up, installment, DST), portfolio summary, pro forma; rental cash flow and taxable income flow into the retirement plan |
| Medicare & healthcare | Medigap G/N vs. Medicare Advantage vs. TRICARE For Life vs. retiree plan, by health level; yearly costs to the end of the plan with medical inflation; IRMAA tiers; ACA premium after subsidy before 65 with the 400% FPL cliff; enrollment deadlines for both spouses; option to add health costs to the plan |
| Advisor & war-game | Written assessment and scorecard, lever analysis (14 levers × 500 simulations), **200 scenarios × 4 courses of action** (5 market regimes × 4 lifespans × 10 life events = 800 plan runs), reverse-mortgage (HECM) analyzer, securities-based line of credit ("buy, borrow, die") analyzer, 30+ income and liquidity sources, advanced strategies, age-based action timeline, optional live Q&A assistant on claude.ai |
| Wealth & family office | Balance sheet, creditor-exposure map by state, estate projection (federal $15M exemption, Illinois/NY/MN estate tax, IRD, probate), recommended entity structure, protection/estate/heir treatment of every retirement vehicle, entities and trusts, family-office model and cost |
| Social Security | Benefit at every claiming age, breakeven date and age (with optional investing of early checks), cumulative chart, lifetime-value heatmap by age at death, spousal/survivor benefits, earnings test, 2026 rules |
| Pension | Benefit formula, payout options, implied interest rate of a lump-sum offer, depletion age, pension maximization |
| Annuities | SPIA/DIA pricing from mortality, payout by age, annuity vs. 4% rule, tax-deferral calculator, fixed vs. indexed annuity projector on 1996–2025 S&P 500 history, catalog of 14 annuity types |
| Accounts | Three-bucket mix, savings waterfall, 529 college calculator, directory of ~48 account types with 2026 limits |
| Taxes & strategy | Full retirement-year return, bracket fill, Social Security tax torpedo, Roth conversion test, Roth vs. traditional, 22 strategies, 2026 tables |
| Insurance | DIME needs, term + invest vs. whole life vs. IUL (illustrated, 4.5% stress, simulated market) vs. GUL to age 100, mortgage protection, final expense, proceeds duration, disability income gap, long-term care, umbrella, catalogs of life and other insurance, riders, 30-question Q&A |
| Disability & VA benefits | SSDI with family maximum and timeline, disability simulator (income and nest egg), VA combined-rating calculator with bilateral factor and 2026 rates, CRDP/CRSC, SSI estimate, 22 other benefits |
| Investing & risk | Monte Carlo fan chart, sequence-of-returns risk, ending-balance distribution, safe withdrawal rate by allocation, glide path, withdrawal strategies, investment vehicles |
| Spending leak | F.A.S.T. (fast food, alcohol, stimulants, treats) calculator and S&P 500 vs. IUL redirect on actual 1996–2025 returns |

Inputs save in the browser's local storage. Figures reflect 2026 IRS/SSA/VA numbers as published and are approximate; this is an educational model, not tax, legal or investment advice.
