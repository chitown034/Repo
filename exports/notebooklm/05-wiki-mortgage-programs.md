# Mortgage programs and guidelines (prep only, never a quote)

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `05-wiki-mortgage-programs`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: wiki/mortgage-programs/disclosure-timing.md -->
# FILE: wiki/mortgage-programs/disclosure-timing.md

# Disclosure timing — TRID, RESPA, Reg Z

The TRID/RESPA/Reg Z timing gates that govern every mortgage file, plus the parallel California real-estate disclosure clock. Alexandra's (CCO) lane — cite the section, don't guess it.

## The TRID clock (Reg Z §1026.19)

The **6-piece application trigger** — name, income, Social Security number, property address, estimated property value, and loan amount — starts the Loan Estimate clock the moment all six are collected. From there:

- **Loan Estimate (LE)**: must be delivered within **3 business days** of the 6-piece trigger (the desk's own target is same-day/within 24 hours, which is faster than the regulatory floor).
- **Closing Disclosure (CD)**: must be received at least **3 business days before consummation**. E-delivery without confirmed receipt adds **3 calendar days** to that count.
- **Changed circumstance**: any material change (loan amount, program, rate lock) triggers a re-disclosure — track it the same way as the original LE.

## Tolerance buckets

- **Zero-tolerance**: lender fees — 0% increase is permitted; any increase requires a lender credit to cure.
- **10% cumulative**: a basket of third-party fees the borrower cannot shop for.
- **Unlimited / good-faith**: prepaid interest, escrow deposits, and fees for services the borrower shopped for themselves.

## Reg Z LO compensation and anti-steering

- **No double-dipping**: an LO is paid **lender-paid OR borrower-paid, never both** on the same transaction, and compensation cannot vary by the loan's terms.
- **Anti-steering safe harbor**: present **3 distinct options** on every loan-level-priced-comp (LPC) transaction — lowest rate, lowest fees, and safest features (e.g. no negative amortization) — and document that presentation. This is also the anti-steering documentation requirement referenced in the pricing-comparison step of the loan flow.

## RESPA and ECOA

- **RESPA §8**: no fee or gift may be tied to a referral — anti-kickback and unearned-fee prohibitions carry criminal penalties. This is the rule that gates every affiliate/sponsorship and realtor-reciprocity arrangement (see `wiki/real-estate-playbooks/referral-reciprocity.md`) before money changes hands.
- **ECOA / Reg B**: an adverse-action notice is due within **30 days**, with specific reasons stated — an AUS output alone is not sufficient justification for a denial.

## California real-estate disclosures (the parallel clock)

Once a purchase contract is accepted, the California-side clock runs independently of TRID: **TDS/SPQ/NHD** (and related disclosures — Lead Paint, HOA docs, AVID, SBSA) are due within **7 days** of acceptance. See `wiki/real-estate-playbooks/transaction-stages.md` for how this clock nests inside the full six-phase closing checklist, including the earnest-money deposit deadline that sits even earlier in the sequence.

## VA-specific timing

**Tidewater**: on a low VA appraisal, the response window is **2 business days** from the Notice of Value concern, with 3+ comps ready to submit — see `wiki/mortgage-programs/va-eligibility.md`.

## See also

- `wiki/mortgage-programs/program-selection.md` — where this clock sits inside the loan flow.
- `wiki/real-estate-playbooks/transaction-stages.md` — the CA-side disclosure and closing deadlines this clock runs alongside.

Source: Command Deck, "Compliance quick-reference" card (The Ultimate Mortgage Broker SOP) and the VA scenario checklists (VA Loan Mastery Playbook, pp. 271–280).


---

<!-- source file: wiki/mortgage-programs/fha-usda.md -->
# FILE: wiki/mortgage-programs/fha-usda.md

# FHA and USDA

Where FHA and USDA beat VA for a given borrower, and the specific mechanics that make each one work.

## FHA

FHA's edge over VA is credit flexibility, not price: it accepts a FICO down to 500 (3.5% down at 580+, 10% down between 500–579), and runs the FHA TOTAL Scorecard first. Below 580 requires a **manual underwrite** with documented compensating factors (residual income, low DTI, reserves) — DTI can run as high as 56.9% with strong enough compensating factors. This makes FHA the right call for a first-time buyer, a credit-challenged borrower, or a higher-DTI household that VA's residual-income test would not otherwise clear (e.g., a non-veteran co-borrower situation).

Closing-cost structure: up to **6% of the sales price** toward closing costs and prepaids — never toward the down payment itself. That single 6% cap (vs. VA's 4%-plus-unlimited-actual-costs structure) is the number to check first when comparing FHA against VA for a veteran borrower who technically qualifies for both.

**No-FICO path**: FHA and VA both support a non-traditional credit underwrite using 3–4 alternative trade lines (rent, utilities, insurance, phone) with 12 months of history, manually underwritten — useful for young borrowers, cash-based households, and recent immigrants with no US credit file.

**DACA borrowers**: FHA explicitly allows DACA recipients (2021 HUD guidance) with a valid, unexpired EAD card treated as lawful residency — confirm the EAD is current and otherwise run the standard FHA doc package. This is usually the strongest program fit for a DACA borrower; the standard FHA 6% concession cap applies.

## USDA

USDA's single non-negotiable first step: **confirm the property address on the USDA eligibility map before taking the application.** A rural/exurban property that clears the map gets a genuine zero-down alternative to VA for a non-veteran buyer. USDA's cost structure replaces mortgage insurance with a **guarantee fee** — 1% upfront plus 0.35% annual — and allows up to 6% of the sales price in seller-paid closing costs.

## When each beats VA

- **FHA over VA**: a borrower below VA's practical residual-income comfort zone, or a household needing the more forgiving credit-score floor and documented compensating-factor path rather than a residual-income argument.
- **USDA over VA**: any non-veteran buyer in an eligible rural/exurban area wanting a genuine zero-down option — USDA is the non-veteran's VA-equivalent, not a fallback.
- **VA over both**: whenever the borrower is eligible — VA's rate and the 4%-plus-unlimited-actual-costs concession structure generally beat FHA's 6%-cap/MIP structure and USDA's guarantee-fee structure for an otherwise-qualified veteran. Run the comparison before defaulting to VA reflexively, though — see `wiki/mortgage-programs/program-selection.md`.

## See also

- `wiki/mortgage-programs/va-eligibility.md` / `va-affordability.md` — the VA comparison case.
- `wiki/mortgage-programs/disclosure-timing.md` — the LE/CD clock that applies identically across FHA, USDA and VA.
- `wiki/mortgage-programs/lender-directory-notes.md` — which lenders carry FHA/USDA on this desk (Freedom Mortgage, Equity Prime Mortgage, United Wholesale Mortgage, TPO Go).

Source: Command Deck, "Loan Programs" card (FHA, CalVet, CalHFA, USDA, No-FICO, DPA and DACA program entries).


---

<!-- source file: wiki/mortgage-programs/index.md -->
# FILE: wiki/mortgage-programs/index.md

# Wiki — Mortgage programs

Loan programs, guidelines, VA mechanics, eligibility, disclosure timing. Steven's lending side:
MLO with Patriot Pacific Financial (NMLS 1921615), personally licensed CA/NV/AZ/FL/IL.

**Status: written**, sourced from the Command Deck's loan-program cards, VA scenario
checklists, and compliance quick-reference card. Guideline specifics move faster than this wiki —
each page cites its deck card; verify against the current wholesale/agency guide before quoting a
borrower.

## Pages

| Page | One-line summary |
|---|---|
| `va-eligibility.md` | COE mechanics, entitlement tiers, funding-fee tiers/exemptions, restoration, second-tier (two-VA-loan) use |
| `va-affordability.md` | The Six-Step Pre-Approval Analysis, residual income vs. DTI, BAH/BAS 125% gross-up, family size |
| `program-selection.md` | Decision tree across the deck's loan-program categories, starting from dual-AUS conforming |
| `fha-usda.md` | FHA (500-FICO floor, 6% concession cap) and USDA (map-first, guarantee fee) — where each beats VA |
| `disclosure-timing.md` | TRID/RESPA/Reg Z clocks, tolerance buckets, anti-steering, CA disclosure clock, VA Tidewater — Alexandra's lane |
| `lender-directory-notes.md` | Lender directory grouped by what each lender is actually good for, plus live verification flags |
| `refi-review-prep.md` | Who could refi, as a prep list: `refiWatchList` fields, the 0.75 / 0.50 spread thresholds, the Monday routine, the VA IRRRL pointer, and Steven's licensed step — market average, not a quote (2026-10-22) |

## What belongs here

- How a program works, and how to choose between programs.
- Guideline mechanics that outlive any one file.
- Overlays and practical lender behaviour that the official guideline does not state.

## What does not

- **A borrower's situation.** That is a client page — `wiki/clients/`, full context.
- **Today's rates.** `ratesSnapshot` doc. Never a number typed into this wiki.
- **A compliance ruling.** Alexandra drafts, Steven decides. See the HALT list.
- Program and lender **counts**: 39 programs / 61 lenders are drift-checked between the deck and the
  ISA Portal. Do not restate them here as facts to be maintained in a third place.

## Full-context rule

Anything in this topic that reads as a rule set or a disclosure library is **safe to vectorize** —
it is high-volume, and a retrieved clause is still a clause. See `vector-index/README.md`.
Anything that reads as a decision about a person is not.


---

<!-- source file: wiki/mortgage-programs/lender-directory-notes.md -->
# FILE: wiki/mortgage-programs/lender-directory-notes.md

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


---

<!-- source file: wiki/mortgage-programs/loan-task-agents.md -->
# FILE: wiki/mortgage-programs/loan-task-agents.md

# Loan task agents

Written 2026-10-11. Three agent skills that prepare loan and real-estate work for Steven. They prepare; he decides.

## Tax assessor agent
Reads public San Diego and Riverside County records (assessor, recorder, treasurer-tax collector) with the read-only
browser tools and produces a one-page Property Tax Sheet: APN, assessed values, exemptions flag, special assessments
flag, an estimated annual tax with its formula, and a source line with the date retrieved. County URLs and field names are
marked verify except the well-known official domains, which are also marked verify-current. Exemptions such as disabled
veteran are flagged "verify eligibility with county; Steven decides". Tax advice goes to a CPA (Marcus frames it).

## Loan pricing prep agent
Builds the scenario worksheet from facts Steven supplies, computes P&I, PITI, LTV and DTI with shown formulas
(`scripts/amortize.py`, tested), and compares scenarios. Flags items for Lucia (eligibility), Walter (TRID timing)
and Alexandra (compliance). Rate and points are always "enter from lender sheet"; funding-fee and MI percents are inputs.

## The rules
- Never quote a rate, state eligibility as a decision, lock, or send. Those are Steven's (CLAUDE.md HALT).
- Public records only; no logins, orders or payments; client names never typed into a county search.
- Tax figures are estimates, not quotes.
- Reverse engineering (REA) is gated: allowed only for owned or licensed software and public behaviour; Elena and Alexandra join; nothing installs without Steven.

## See also
- `.claude/skills/tax-assessor-agent/SKILL.md`
- `.claude/skills/loan-pricing-agent/SKILL.md`
- `.claude/skills/reverse-engineering/SKILL.md`
- `integrations/loan-stack/CONNECTIONS.md` and `integrations/loan-stack/README.md`
- `wiki/mortgage-programs/va-eligibility.md`, `va-affordability.md`, `disclosure-timing.md`


---

<!-- source file: wiki/mortgage-programs/program-selection.md -->
# FILE: wiki/mortgage-programs/program-selection.md

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


---

<!-- source file: wiki/mortgage-programs/refi-review-prep.md -->
# FILE: wiki/mortgage-programs/refi-review-prep.md

# Refi review prep — who could refi, as a prep list (market average, not a quote)

How the Refi Watch works: the list Steven keeps, the market average it is compared with, the spread thresholds,
the Monday routine, the `refi-watch` skill, the VA IRRRL note, and the one step that is Steven's licensed act.
As of 2026-10-22. Sources: skill `.claude/skills/refi-watch` (2026-10-22), cloud routine
`trig_014ipr6x9z35psmtHJCPVqj1` (`docs/inventory/cloud-routines-2026-10.md`, `docs/AUTOMATION-MAP-2026-10-20.md`),
`wiki/ai-team/desk-seats.md` § Refi Watch Analyst, `wiki/ai-team/org-chart.md` § What the desks run on,
`.claude/skills/cos-daily-cycle` (the `listOutbox` → `refiWatchList` move).

**The label on everything:** *Market average from `ratesSnapshot` (<index date>). Not a quote, not a
pre-qualification, not an eligibility decision. Any rate for a specific client is Steven Shearrill's, MLO NMLS
1921615, after a full application.* Gap audit 2026-10-22: rate drops went unnoticed because nothing compared the
daily snapshot with the book.

## Who does what

| Role | Who |
|---|---|
| The Monday prep list: first name, program, note rate, market average, spread | Refi Watch Analyst (Sonnet 5 desk seat; Mortgage Pod) |
| Scenario prep for anyone Steven picks; the VA IRRRL lane | Harrison (Elite Mortgage Broker, under Victor) |
| The touch draft, if Steven wants one after the conversation | Sphere Nurture Coordinator + Alexandra |
| Keeps the list current | Steven (and the ISA, from the ISA Portal form) |
| The rate quote, the eligibility call, the savings figure, every client contact | **Steven only** (licensed) |

## Who could refi — the question this page answers

"Who could refi", "rates dropped — who do I call", "run the refi watch": the answer is a **prep list** of past
clients whose note rate sits above today's market average for the same program, ordered by spread. It is a list
of conversations worth having, for Steven alone. It is never a list of people who *can* refinance.

## The list — `refiWatchList` on the Command Deck

`refiWatchList` is `{v: {clients: [...]}}` in the deck's `state` collection. Each client (fields as the ISA
Portal's intake form writes them, 2026-10-22):

| Field | Means |
|---|---|
| `first` | First name only — no surname, no loan number, no address |
| `noteRate` | The rate on the client's current note, **typed by Steven** — the only source. The skill reads no loan file, no Zoho record, no Closing Disclosure |
| `loanType` | VA · FHA · conventional · jumbo · USDA · non-QM — picks the `ratesSnapshot` row to compare against |
| `closedMonth` | `YYYY-MM` the loan funded — drives the seasoning flag |
| `note` | One line (e.g. "wants to stay 10 years"); never a figure |
| `ts`, `status` | When written; `pending` → `moved` once the cycle copies an ISA Portal row in |

Ways in: Steven tells Claude "refi list: <first name>, <note rate>, <loan type>, <month closed>" (`docs/STEVEN-STEPS.md`
6b); the deck's own form; or the ISA Portal form, which writes `listOutbox.v.refi` — the 6:25 AM daily cycle appends
pending rows to `refiWatchList.v.clients` (de-duplicated by first name + month) and marks them `moved`. The note
rates stay on the list and in the session; `vanessaQueue` text carries first names, programs and the spread only.

## The comparison

1. Read `ratesSnapshot` (written daily by the Mac task `mortgage-rates-daily`; Optimal Blue via FRED). Note the
   product rows and the doc's `syncedAt` / index date. **Older than 80 hours, or `status` not ok → say so and stop.**
   A stale average is not a watch. (The Mac rates task has been silent since 2026-10-13 — the ISA Portal mirrors
   the deck's last copy; check the stamp before trusting it.)
2. For each client: `spread = note rate − market average for the same program`. Show the arithmetic.
3. Order by spread, group by program. Flag seasoning: funded < 210 days ago on VA, < 6 months on most programs →
   "seasoning — not yet".
4. Write `refiWatchDesk` (the week's list) and one `vanessaQueue` item per flag (or one table item in the attended
   skill) with `ref` = the exact `ratesSnapshot` stamp used.

### Spread thresholds — 0.75 and 0.50

| Threshold | Where it applies | As of |
|---|---|---|
| **0.75 point** or more | The Monday routine flags "worth a conversation" and queues a call-outline task per flag | 2026-10-22, `docs/AUTOMATION-MAP-2026-10-20.md` |
| **0.50 point** (default) | The attended `refi-watch` skill; Steven's own threshold was still pending on 2026-10-22, so until he sets one the skill lists **every positive spread** and lets him cut | 2026-10-22, the skill |

Steven's word settles it; until then the two numbers coexist and the page says which one produced a list.
"Worth a conversation" is the ceiling of the wording — never "qualifies", "eligible", "approved", "can refinance",
and never a dollar savings figure ("you'd save $212/month"). The spread in points is the whole output.

## VA IRRRL — Harrison's lane, pointer only

For a VA client the list says "IRRRL path — Harrison" and nothing more. What the brain holds today: the IRRRL
funding fee is **0.50%**, may be financed, due to the VA within 15 calendar days of closing
(`wiki/mortgage-programs/va-eligibility.md`); the 210-day seasoning flag above; residual-income mechanics in
`wiki/mortgage-programs/va-affordability.md`; and Loan United's no-FICO IRRRL / streamline note in
`lender-directory-notes.md`. The skill points at `wiki/mortgage-programs/va-irrrl.md`, which **does not exist yet**
(2026-10-22) — an open gap; until it is written, `va-eligibility.md` is the page. Whether a given client's IRRRL
works (net tangible benefit, recoupment, the 210-day / six-payment rule) is a Harrison scenario and then Steven's call.

## The Monday routine — `trig_014ipr6x9z35psmtHJCPVqj1`

"Refi watch — weekly prep list (Mon 7:20 AM PT, drafts only)". Cron `CRON_TZ=America/Los_Angeles 20 7 * * 1`,
created 2026-10-22, enabled, **first run 2026-10-26** — nothing has run yet. Reads `ratesSnapshot` and
`refiWatchList`; writes `refiWatchDesk` and `vanessaQueue`. The 6:25 AM cycle that follows on Tuesday folds the flags
into the ≤3 Needs-Steven items. Judge it by the `refiWatchDesk` stamp, not by "succeeded". The attended version is the
skill: "who could refi" in any session runs the same comparison on the list Steven types.

## Steven's licensed step

Everything above is preparation. The licensed step — his alone, NMLS 1921615 — is: deciding to call, the call
itself, any rate he mentions, any eligibility view, any savings number, a lock, and a full application. "What rate
would they get" is a quote: the answer is a Needs-Steven packet and the `loan-pricing-agent` worksheet he drives
himself. If he wants call scripts afterwards, that is a Harrison + Alexandra draft carrying the label above.

## HALT

- A client's rate came from anywhere but Steven's typed list → do not use it.
- `ratesSnapshot` stale or not ok → report staleness; no comparison.
- A quote, an eligibility word, a savings figure, or any message to a borrower → stop; packet.
- Handing the list to the ISA for calls → no; this list goes to Steven alone.

## See also

- `wiki/mortgage-programs/va-eligibility.md` · `va-affordability.md` — the VA mechanics behind the IRRRL note.
- `wiki/mortgage-programs/program-selection.md` — which `ratesSnapshot` row a loan type maps to.
- `wiki/real-estate-playbooks/sphere-nurture.md` — the care touches; a different list that never carries a rate.
- `wiki/ai-team/push-button-system.md` — the queue and the Monday slot in the daily schedule.


---

<!-- source file: wiki/mortgage-programs/va-affordability.md -->
# FILE: wiki/mortgage-programs/va-affordability.md

# VA affordability

How a VA file actually qualifies on residual income rather than DTI alone: the Six-Step Pre-Approval Analysis, BAH/BAS gross-up, family size, and the active-duty residual-income reduction.

## The Six-Step Pre-Approval Analysis

From the VA Loan Mastery Playbook — this is the deal-structuring sequence for every VA file, in this order, because residual income is the primary qualifying metric, not DTI:

1. **Eligibility** — pull the COE via WebLGY; confirm entitlement tier, funding-fee %, disability-exemption status (see `wiki/mortgage-programs/va-eligibility.md`).
2. **Income** — calculate effective income per source; gross up non-taxable income (BAH, BAS, other allowances) **125%** before running AUS.
3. **Residual income** — apply the region/family-size guideline table, apply the 5% active-duty reduction if applicable, compare actual to guideline, and document the result on VA Form 26-6393.
4. **Credit story** — identify disregardable medical collections at intake (not reduced to judgment), document the overlay-vs-VA distinction, and decide AUS vs. manual underwrite.
5. **Debt & exclusions** — apply exclusion rules: ex-spouse debt per divorce decree, deferred student loans, SCRA lease termination — then recompute DTI.
6. **Assets & funds to close** — confirm the $0 cash-to-close structure, the seller-concession buckets, and reserves as a compensating factor.

## Residual income mechanics

Residual income compares what a household has left after PITI, debts and taxes against a VA table keyed to region and family size. A borrower can exceed the standard 41% DTI guideline with strong residual income — DTI alone never disqualifies a VA file the way it can on conventional or FHA. The **5% active-duty reduction** applies to the residual-income guideline where applicable (military-facility/on-base circumstances) — confirm the exact trigger against the current VA Lender's Handbook table before applying it, since this is a guideline detail that can be updated.

Family size for the table includes all household members: children, dependent parents, and any non-obligated (non-purchasing) spouse — this drives which guideline row applies and is one of the first things to get right in intake.

## Seller concessions and closing costs

VA allows up to **4% of the lesser of purchase price or appraised value** in the concession bucket (prepaids, temporary buydown, funding fee, closing costs) — but unlimited actual closing costs, prepaids and discount points can be paid outside that 4% cap. This is a materially different structure from FHA's single 6% cap and is worth walking a first-time VA buyer through explicitly.

## Duty-station and BAH considerations

BAH and BAS are entered separately from base pay on the 1003 (never blended), then gross-up applies before AUS. Rosa (Military & Corporate Relocation, see `wiki/ai-team/org-chart.md`) runs the BAH-versus-ownership math and duty-station/base-area intelligence layer that sits alongside this affordability analysis for a PCS-timed purchase — see `wiki/real-estate-playbooks/military-relocation.md` for the transaction-side view.

## See also

- `wiki/mortgage-programs/va-eligibility.md` — COE, entitlement, funding fee.
- `wiki/mortgage-programs/program-selection.md` — when VA is not the best fit for a given borrower.
- `wiki/real-estate-playbooks/military-relocation.md` — PCS timing and the ownership-vs-rent question.

Source: Command Deck, "VA loan specialty — the Six-Step Pre-Approval Analysis" card and VA scenario checklist 1 (VA Loan Mastery Playbook, pp. 271–280).


---

<!-- source file: wiki/mortgage-programs/va-eligibility.md -->
# FILE: wiki/mortgage-programs/va-eligibility.md

# VA eligibility

VA entitlement, COE mechanics, restoration, second-tier (two-VA-loan) use, and funding-fee tiers and exemptions — the eligibility gate every VA scenario checklist runs first, before income or credit.

## Pulling the Certificate of Eligibility

Order the COE via WebLGY or ACE. Confirm three things before anything else moves forward: full entitlement (vs. remaining/partial), no prior VA use (or the exact prior-use code if there was one), and character of discharge (honorable, or general under honorable conditions). Check CAIVRS for any outstanding VA, FHA, USDA or federal debt in default — a hit there stops the file regardless of entitlement.

A 90-second ARIVE input-quality check runs before every VA AUS submission: loan type = VA · exemption flag matches the COE/26-8937 · first-use vs. subsequent-use matches the COE code · family size includes all dependents and any non-purchasing spouse · in a community-property state (AZ/CA/ID/LA/NV/NM/TX/WA/WI) the non-purchasing spouse's debts are entered · loan amount = base loan + financed funding fee.

## Funding fee tiers

- First-time use, 0% down: **2.15%**.
- Cash-out refinance (Type I and Type II — same fee since the VA's 2019 change): **2.15% first use / 3.30% subsequent use**.
- IRRRL: **0.50%**, may be financed into the new loan amount, due to the VA within 15 calendar days of closing.
- Disability-exemption status is checked at COE pull (request the VA award letter) — an exempt borrower pays no funding fee regardless of use count.
- Land ownership can count as an equivalent down payment for a funding-fee reduction on new construction if it drops LTV below the 5%/10% thresholds.

## Second-tier entitlement (two active VA loans)

Used when a veteran already has a VA loan on Property A (not sold or paid off) and is buying Property B as a new primary residence — a PCS move, job relocation, or family-size change, documented in the file. The math: **County limit − entitlement already used on Property A = available entitlement on Property B**. If the available entitlement covers 25% of the new purchase price, no down payment is required; if it falls short, the veteran pays 25% of the shortfall as a down payment.

Property A's existing PITI becomes a monthly debt obligation for DTI and residual income on the new file — this is the single most common underwriting error on two-VA-loan scenarios. If Property A will be rented, the rental income can offset its PITI with a current lease and a 30% vacancy/maintenance deduction; no landlord experience is required for VA. Document the PCS orders or new-duty-station letter in the file as the occupancy justification for Property B.

This is also the mechanism behind the VA house-hack strategy referenced in `wiki/real-estate-playbooks/military-relocation.md`: buy a 2–4 unit property, live in one unit, rent it out at the next PCS, restore or reuse entitlement, repeat at the next duty station.

## Restoration and assumption

Entitlement restores when the prior VA loan is paid in full (sale, refinance, or payoff) — restoration is not automatic on a short sale or foreclosure. On assumption (see the VA Loan Mastery Playbook's assumption chapter): a loan with a commitment date after March 1, 1988 requires servicer/VA approval; a pre-1988 loan is freely assumable with no funding fee. Pull COEs for both seller and buyer (if the buyer is also a veteran) as early as possible, and have the seller review VA Form 26-10291 (Entitlement Acknowledgement) before the purchase contract is signed — substitution of entitlement (SOE) to a veteran buyer with sufficient entitlement is the seller's best outcome, since it frees their entitlement for reuse.

## See also

- `wiki/mortgage-programs/va-affordability.md` — residual income, DTI treatment, the Six-Step Pre-Approval Analysis.
- `wiki/mortgage-programs/disclosure-timing.md` — TRID clock and VA Tidewater timing.
- `wiki/real-estate-playbooks/military-relocation.md` — PCS-driven use of second-tier entitlement.

Source: Command Deck, "VA loan specialty" and "VA scenario checklists" cards (VA Loan Mastery Playbook, pp. 271–280), scenarios 1, 3, 4 and 7.
