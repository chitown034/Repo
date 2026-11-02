// nichedeep1.js - Loan Niche Encyclopedia deep extensions for the 'Jumbo & portfolio' and 'Non-QM' groups (keys match nichelib2.js).
// Market ranges are typical and lender-specific; anything marked (verify) must be confirmed against current lender matrices and law. No rate quotes. Updated 2026-11.
window.NICHE_DEEP=Object.assign(window.NICHE_DEEP||{},{
 "b_prime_jumbo": {
  "matrix": [
   [
    "Min FICO",
    "680-700 floor; 720-740+ for best tiers and >80% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "80-90% to ~$1.5M; 70-80% to $2.5-3M; 60-70% above (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "Typically 5-10 pts below purchase max (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-75%; cash-in-hand caps often $500K-$1M (lender-specific)"
   ],
   [
    "Loan amount range",
    "Above county conforming/high-balance limit (2026 baseline $832,750 - verify county) up to ~$3-5M; larger by exception"
   ],
   [
    "Max DTI",
    "43% common; 45-50% with strong FICO/reserves (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months PITIA standard; 12-24+ months over $2M or for multiple REO (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "BK/FC/SS/DIL typically 7 years; some allow 4 with lower LTV (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable condo, 2-4 unit (lower LTV); rural/acreage limited"
   ],
   [
    "Occupancy",
    "Primary, second home; investment at reduced LTV where offered"
   ],
   [
    "Prepayment penalty (investor)",
    "Rare on consumer jumbo; QM prepay limits apply to owner-occupied"
   ],
   [
    "Interest-only",
    "Separate IO jumbo product; usually 10-yr IO with lower LTV"
   ],
   [
    "Typical pricing vs agency",
    "Can price at or even inside conforming for top-tier borrowers; widens fast with risk layering (lender-specific)"
   ],
   [
    "States",
    "CA, IL, NV, FL, AZ all broadly available; FL condo and coastal insurance add scrutiny (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm loan amount vs the 2026 county limit for the subject county (San Diego and Riverside differ) and decide jumbo vs high-balance vs piggyback",
   "Pull tri-merge; use middle score of lowest-scoring borrower and check for recent inquiries or new debts",
   "Run DU/LP for documentation guidance only if the investor allows AUS-based jumbo; otherwise manual UW to investor guide",
   "Calculate qualifying income with full 2-year history; self-employed need 2 years personal and business returns plus YTD P&L",
   "Analyze large deposits and source all funds to close and reserves for 60 days",
   "Compute reserves by account type: retirement usually at 60-70% of vested balance, stocks at 70-100% per investor",
   "Order full appraisal; expect a second appraisal above ~$1.5-2M or when LTV is high (lender-specific)",
   "Review appraisal for unique-property issues: acreage, ADUs, view premiums, comps older than 6 months",
   "Underwrite DTI including all REO, HELOC payments at full draw where required, and installment debts over 10 months",
   "Clear title, HOA questionnaire if condo, and insurance (wildfire/flood availability in CA hill and coastal zones)",
   "Final VOE within 10 business days and tax transcripts (4506-C) for all income years used",
   "CD issued 3 business days before consummation; confirm ATR/QM status (most jumbos are QM general or ATR-in-full)"
  ],
  "incomeExample": {
   "title": "W-2 plus bonus borrower, San Diego jumbo purchase",
   "steps": [
    "1. Base salary $210,000 / 12 = $17,500/mo",
    "2. Bonus: 2024 $40,000, 2025 $48,000, YTD on pace; 2-yr avg = $44,000 / 12 = $3,667/mo",
    "3. Total qualifying income = $21,167/mo",
    "4. Proposed PITIA on $1,360,000 loan (illustrative): P&I $8,600 + tax $1,060 + HOI $290 + HOA $0 = $9,950",
    "5. Other debts: auto $650 + student loan $350 = $1,000",
    "6. Back-end DTI = ($9,950 + $1,000) / $21,167 = 51.7% - over a 43-45% cap",
    "7. Restructure: add co-borrower spouse income $6,500/mo -> $10,950 / $27,667 = 39.6%",
    "8. Reserves at 12 months PITIA = $119,400 required; borrower has $310,000 in 401k x 60% = $186,000 usable"
   ],
   "result": "Qualifies at ~39.6% DTI with spouse on loan; reserves exceed 12 months (illustrative)."
  },
  "scenarios": [
   {
    "t": "Move-up buyer in Carmel Valley",
    "who": "Daniel, 41, software engineering manager, San Diego",
    "situation": "Daniel and his wife are buying a $1.7M home with 20% down. Both are W-2; Daniel also has RSUs vesting quarterly with 18 months of history at his current employer. They want to keep their current townhome as a rental. Their combined base salary is $310K.",
    "structure": "Prime jumbo 80% LTV, full doc; base plus 2-year bonus average; RSUs counted only if the investor accepts the vesting history and continuance (often 2 years), otherwise used as reserves; departing-residence rent offsets its PITIA with lease and deposit.",
    "numbers": "Illustrative: $1.36M loan; departing residence rent $4,800 x 75% = $3,600 vs its PITIA $3,300 -> +$300 net; RSUs at 60% count toward reserves.",
    "why": "The loan is far above the San Diego high-balance limit, so agency would require a large second lien or much more cash. Prime jumbo pricing for strong W-2 borrowers can be close to conforming. Keeping the townhome builds long-term wealth without hurting DTI.",
    "alternatives": "A high-balance conforming first plus a piggyback HELOC was considered, but blended cost and qualifying the HELOC at full draw hurt DTI. Selling the townhome first was considered but would require temporary housing.",
    "watch": "Signed lease and security deposit for the departing residence; RSU vesting schedule; 6-12 months reserves for each financed property; second appraisal if the investor requires it at this loan size."
   },
   {
    "t": "Veteran comparing VA jumbo with prime jumbo",
    "who": "Marcus, 38, Navy officer separating to a defense-contractor role, Coronado",
    "situation": "Marcus has full VA entitlement and $300K saved. He is buying a $1.4M home. His contractor offer letter starts 45 days after closing. He has a 20% VA disability rating pending finalization.",
    "structure": "Side-by-side: VA no-limit loan with full entitlement (funding fee exempt only if the rating is finalized before closing) vs prime jumbo 80%; confirm the jumbo investor's offer-letter rule (start before first payment, often within 60 days).",
    "numbers": "Illustrative: VA $1.4M with $0 down vs jumbo $1.12M with $280K down; compare total cost including funding fee and the opportunity cost of $280K.",
    "why": "If the disability rating finalizes, VA's fee exemption and zero down are hard to beat. Prime jumbo preserves his entitlement for a future move and keeps his VA eligibility flexible. Showing both lets him choose on total cost, not on what pays Steven more.",
    "alternatives": "VA jumbo was a strong option and may win if he is fee-exempt. A conforming loan plus second was considered but adds complexity at this price point.",
    "watch": "Offer-letter start date vs investor rules; residual-income test for VA; disability rating letter before closing for fee exemption."
   },
   {
    "t": "Self-employed dentist with an income dip",
    "who": "Priya, 46, dentist and S-corp owner, Temecula",
    "situation": "Priya's K-1 plus W-2 from her S-corp shows stable income over 2 years, but 2025 income dipped 8% because of a large equipment purchase. She wants a $1.25M purchase with 15% down. She has 3 years of personal and business returns.",
    "structure": "Full-doc prime jumbo 85% LTV if offered (lender-specific); Form 1084-style cash-flow analysis adding back depreciation and Section 179; business liquidity test for using business funds.",
    "numbers": "Illustrative: 2024 $380K, 2025 $350K; add-back depreciation $60K/yr -> qualifying ~$34K/mo; DTI 33%.",
    "why": "Full-doc pricing is meaningfully better than bank-statement non-QM for a borrower who can document. The add-backs explain the dip. 85% LTV saves cash she needs in the practice.",
    "alternatives": "A bank-statement non-QM program was considered but costs more for the same outcome. A portfolio bank was considered but required moving business deposits.",
    "watch": "Declining income trend must be explained by the one-time purchase; business liquidity test; 12 months reserves at 85% LTV."
   },
   {
    "t": "Divorce equity buyout",
    "who": "Laura, 52, nurse practitioner, Chula Vista",
    "situation": "Laura must buy out her ex-husband under the divorce decree. The home is worth $1.5M with $600K owed. She needs $350K to pay him. Her income is $210K.",
    "structure": "Equity buyout treated as rate/term where investor allows under the decree; jumbo 63% LTV.",
    "numbers": "Illustrative: $950K new loan / $1.5M = 63% LTV; DTI 39%.",
    "why": "Equity-buyout treatment often prices better than cash-out. Low LTV earns top pricing tiers. The decree documents the buyout amount.",
    "alternatives": "A cash-out jumbo was considered but has higher pricing and lower caps. A HELOC was considered but insufficient for $350K.",
    "watch": "Final decree with buyout terms; spousal support paid or received; title transfer at closing."
   },
   {
    "t": "Relocating executive with unsold home",
    "who": "Ken, 55, VP of operations, Henderson NV to Del Mar",
    "situation": "Ken is relocating with a $2.3M purchase. His Nevada home has not sold. He has $900K in brokerage assets and $450K salary.",
    "structure": "Prime jumbo 70% LTV at the $2.3M tier; qualify carrying both payments or with signed sale contract; reserves from brokerage at 70%.",
    "numbers": "Illustrative: $1.61M loan; both PITIAs $14,500 vs $38K/mo income = 38% DTI.",
    "why": "Jumbo handles the loan size agency can't. Carrying both payments avoids sale contingencies. His brokerage supports reserves.",
    "alternatives": "A bridge loan was considered but expensive. Asset depletion was considered but unnecessary with strong W-2.",
    "watch": "Second appraisal at this loan amount; relocation package docs; reserves for both properties."
   },
   {
    "t": "Second home in Palm Desert",
    "who": "Carla, 49, attorney partner, Chicago IL",
    "situation": "Carla wants a $1.1M second home in Palm Desert. She is a K-1 partner with 3 years at the firm. She has $1.5M liquid.",
    "structure": "Prime jumbo second home 80% LTV; K-1 income with partnership returns; reserves 12 months each property.",
    "numbers": "Illustrative: $880K loan; DTI 32% including Chicago residence.",
    "why": "Jumbo second-home pricing is close to primary for strong files. Her liquidity exceeds reserve requirements. K-1 history is stable.",
    "alternatives": "DSCR was considered but not applicable for personal-use second home. Cash was considered but she prefers liquidity.",
    "watch": "Second-home occupancy certification; no rental agreements; distance from primary."
   },
   {
    "t": "High-income first-time buyer with limited cash",
    "who": "Ethan, 33, biotech scientist, Sorrento Valley",
    "situation": "Ethan earns $260K as a senior scientist and has $180K saved. He wants a $1.15M condo in a warrantable building near his lab with 10% down. His parents may gift $40K. He has no other debts.",
    "structure": "90% LTV jumbo where offered (often 740+ FICO, max $1.5M, warrantable condo only) or 80/10/10 piggyback (lender-specific).",
    "numbers": "Illustrative: $1.035M loan; 12 months reserves about $95K - tight after down payment and closing costs.",
    "why": "Higher-LTV jumbo avoids PMI and piggyback complexity. Strong income supports DTI. Warrantable condo qualifies.",
    "alternatives": "Conventional high-balance with PMI was considered but the loan exceeds the limit. FHA was considered but its limit is too low.",
    "watch": "Condo must pass warrantable review with an HOA budget funding reserves at 10%+; 12 months reserves must remain after down payment and costs; any family gift needs a signed gift letter and transfer trail before closing."
   }
  ],
  "qa": [
   {
    "q": "When should I use a piggyback instead of a jumbo?",
    "a": "When the loan is only slightly above the county limit, a conforming first at the limit plus a second may cost less overall. Compare blended cost, DTI including the second, and the borrower's plan to pay down the second."
   },
   {
    "q": "Can RSUs count as income?",
    "a": "Some investors allow RSUs with a 2-year vesting history and documented continuance, usually averaged and discounted for stock volatility. Others count them only as reserves (lender-specific)."
   },
   {
    "q": "How are retirement assets counted for reserves?",
    "a": "Typically 60-70% of vested balance net of loans. Some investors allow full value if the borrower is over 59.5 (lender-specific)."
   },
   {
    "q": "Is a jumbo a QM?",
    "a": "It can be general QM if APR is within QM price thresholds and points and fees are under 3%. Many investors still underwrite with a DTI cap and full documentation."
   },
   {
    "q": "When is a second appraisal required?",
    "a": "Usually above $1.5-2M loan amount or at high LTV, with the lower value used (lender-specific). Budget time and cost for it."
   },
   {
    "q": "Does a jumbo need tax transcripts?",
    "a": "Yes, nearly always for every year of income used. Many investors require them even for W-2-only borrowers."
   },
   {
    "q": "How are HELOCs on other properties treated?",
    "a": "Payment at full draw or a fixed percentage of the limit is often used even with zero balance (lender-specific). Closing unused HELOCs can help DTI."
   },
   {
    "q": "Can gift funds be used?",
    "a": "Often yes after a minimum borrower contribution (e.g., 5-10%). Some programs bar gifts for reserves (lender-specific)."
   },
   {
    "q": "What about wildfire-zone insurance?",
    "a": "Insurance must be bound before clear-to-close. FAIR Plan plus a difference-in-conditions policy is often accepted in California, but confirm with the investor."
   },
   {
    "q": "How long are credit documents good?",
    "a": "Usually 90-120 days for credit, income and assets on jumbo, and about 120 days for the appraisal (lender-specific). Plan timelines on long escrows."
   }
  ],
  "aeQuestions": [
   "What is your maximum LTV by loan-amount tier and FICO band, and where do second-appraisal triggers start?",
   "Do you accept AUS-based documentation (DU/LP Approve-Ineligible due to loan amount) or require full manual UW?",
   "How do you count RSUs, bonus and commission with less than 2 years at the current employer?",
   "What reserve percentage do you apply to retirement and brokerage assets?",
   "Do you allow offer-letter employment and what is the start-date window?",
   "Are there county or property overlays (acreage, ADUs, wildfire zones, condos with litigation)?",
   "What is your current loan-amount tier structure and the FICO/LTV grid for each tier?",
   "Do you allow departing-residence rental income with a lease only, or do you require 2 months of receipt?",
   "Will you accept FAIR Plan plus DIC insurance in high wildfire-risk California zones?"
  ],
  "redFlags": [
   "Large unexplained deposits or cash that cannot be sourced 60 days",
   "Gift funds from an interested party disguised as family",
   "Income docs that do not match tax transcripts",
   "Occupancy story inconsistent (primary purchase while owning a nicer nearby home)",
   "Appraisal comps reaching far outside the neighborhood to hit value",
   "Undisclosed HELOC or new debt appearing on credit refresh",
   "Insurance unavailable or cancelled in high wildfire zone"
  ],
  "pricing": "Prime jumbo pricing depends on FICO, LTV tier, loan-amount tier, DTI, reserves depth, property type (2-4 units and condos cost more) and occupancy. Strong files sometimes price near or below conforming because investors compete for low-risk balances. Relationship pricing that requires moving assets to the lender can lower rate but must be weighed against the borrower's freedom to move money. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Partner with relocation and corporate HR teams (biotech, defense contractors) for move-up buyers",
   "Agents listing homes above the county conforming limit in Carmel Valley, Del Mar, La Jolla, Temecula wine country",
   "CPA and financial-planner referrals for RSU/K-1 earners",
   "Educational content: jumbo vs piggyback vs VA jumbo for high-income veterans",
   "Past-client equity review for those who could buy out or move up"
  ],
  "checklist": [
   "2026 county conforming limit confirmed for subject county",
   "Tri-merge with middle scores and inquiry letters",
   "2 years W-2/1040s and 4506-C transcripts",
   "30 days paystubs and written VOE for bonus/commission",
   "2-3 months asset statements, all pages; large deposits sourced",
   "Reserves calc by asset type",
   "Appraisal(s) and review for unique property issues",
   "Insurance binder with wildfire/flood coverage confirmed",
   "HOA docs if condo/PUD",
   "QM/ATR determination and points-and-fees test",
   "Departing-residence lease, deposit and PITIA documented if keeping it as a rental",
   "Second-appraisal requirement checked against loan amount and LTV",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_jumbo_io": {
  "matrix": [
   [
    "Min FICO",
    "700-720 typical; 740+ for highest LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-75% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-70% (lender-specific)"
   ],
   [
    "Loan amount range",
    "Above conforming limit to $3-5M+"
   ],
   [
    "Max DTI",
    "43-45% calculated on fully amortizing payment over the remaining term after IO (verify)"
   ],
   [
    "Reserves",
    "12-24 months PITIA; more above $2M (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "4-7 years (lender-specific)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable condo; 2-4 limited"
   ],
   [
    "Occupancy",
    "Primary and second home; investment on some portfolio programs"
   ],
   [
    "Prepayment penalty (investor)",
    "Usually none on owner-occupied; IO is a non-QM feature"
   ],
   [
    "Interest-only",
    "5-10 years IO then amortizes over remaining 20-25 years"
   ],
   [
    "Typical pricing vs agency",
    "Priced above amortizing jumbo; IO add-on is a pricing adjuster (lender-specific)"
   ],
   [
    "States",
    "Available in CA, IL, NV, FL, AZ via non-QM and portfolio lenders (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm the borrower understands IO is non-QM because payments do not reduce principal (12 CFR 1026.43(e)(2))",
   "Document a reasoned financial purpose: cash flow timing, variable compensation, investment strategy",
   "Qualify on the fully amortizing payment over the remaining term (e.g., 30-yr loan with 10-yr IO -> 20-yr amortization)",
   "Verify liquidity: IO lenders look for deep reserves and post-close liquidity",
   "Run ATR 8-factor analysis and document it",
   "Check payment shock at recast and present both payments in writing",
   "Review any ARM features: index, margin, caps, first adjustment",
   "Appraisal and second appraisal per loan size",
   "Verify no negative amortization or balloon",
   "Ensure HPML status is tested; escrow if HPML",
   "Deliver ARM disclosures (CHARM) if ARM",
   "Confirm CD reflects IO period and the payment change"
  ],
  "incomeExample": {
   "title": "Qualifying payment on 30-year loan with 10-year IO",
   "steps": [
    "1. Loan amount $2,000,000 (illustrative)",
    "2. IO payment shown to borrower (illustrative note rate) = interest only, ~$11,700/mo",
    "3. Qualifying payment = amortizing over remaining 20 years at the qualifying rate (illustrative) = ~$14,300/mo",
    "4. Add taxes $2,100 + insurance $450 = qualifying PITIA $16,850",
    "5. Borrower income: base $40,000/mo + 2-yr avg bonus $10,000/mo = $50,000",
    "6. Other debt $1,800/mo",
    "7. DTI = ($16,850 + $1,800) / $50,000 = 37.3%"
   ],
   "result": "Qualifies on the amortizing payment at 37.3% DTI; borrower must understand ~$2,600/mo increase at year 11 (illustrative)."
  },
  "scenarios": [
   {
    "t": "Bonus-heavy executive",
    "who": "Andrew, 47, investment banker, La Jolla",
    "situation": "Andrew's base salary is $300K but his annual bonus has averaged $500K over 3 years, paid each February. He is buying a $2.6M home and wants lower fixed monthly obligations. He plans to pay down principal after each bonus. He has $1.2M in liquid assets.",
    "structure": "Jumbo IO 10-year, 75% LTV, full doc with 2-year bonus average; qualify on the amortizing payment over the remaining 20 years; documented annual curtailment plan.",
    "numbers": "Illustrative: $1.95M loan; IO payment roughly $2,500/mo lower than amortizing; a $150K curtailment each February lowers the eventual recast payment.",
    "why": "IO matches cash flow that arrives once a year. He still qualifies on the full amortizing payment, so the loan meets ATR. Curtailments give him the discipline of amortizing with more flexibility.",
    "alternatives": "An amortizing jumbo was considered and would also qualify, but it ties up cash between bonuses. A pledged-asset line was considered but exposes him to margin calls.",
    "watch": "Bonus continuance letter from employer; 18 months reserves; recast shock at year 11 if he doesn't curtail; IO is non-QM so no prepay penalty on this owner-occupied loan."
   },
   {
    "t": "Early-career anesthesiologist investing aggressively",
    "who": "Elena, 36, anesthesiologist, Phoenix AZ",
    "situation": "Elena is 2 years out of training earning $450K. She wants a $1.3M home and to max out retirement accounts and pay down $300K of student loans fast. She has 20% down. Her student loans are on a documented repayment plan.",
    "structure": "Compare physician jumbo (amortizing, lower down payment) with IO jumbo 80% LTV; qualify on amortizing payment either way.",
    "numbers": "Illustrative: $1.04M loan; IO saves about $1,800/mo vs amortizing in early years.",
    "why": "IO frees cash for student-loan payoff and retirement contributions during peak earning years. Qualifying on the amortizing payment confirms she can afford it later. She already has 20% down, so the physician program's main advantage is smaller.",
    "alternatives": "A physician loan was considered; it wins if she wants to keep more cash and accept amortizing payments. A standard amortizing jumbo was considered but limits her payoff strategy.",
    "watch": "Student-loan payment method and 2026 federal repayment changes; recast in year 11; disciplined use of the savings."
   },
   {
    "t": "Luxury rental cash-out",
    "who": "Tom, 58, retired executive, Scottsdale AZ",
    "situation": "Tom owns a $2.4M vacation rental free and clear. He wants a cash-out IO loan to fund another purchase. Rental income is seasonal but strong, averaging $9,000 net per month over 24 months.",
    "structure": "Portfolio or non-QM IO investment loan, 60% LTV, DSCR on net STR income or full doc; prepay per Arizona rules (verify).",
    "numbers": "Illustrative: $1.44M loan; STR net $9,000/mo vs IO PITIA (illustrative) $8,500 -> DSCR 1.06.",
    "why": "IO improves DSCR on an investment property. Cash-out funds the next purchase without selling. 60% LTV keeps pricing reasonable.",
    "alternatives": "An amortizing DSCR loan was considered but its ratio fell below 1.00. A bridge loan was considered but is short-term and expensive.",
    "watch": "24 months of STR statements must support the net income used; confirm Arizona prepay structure in writing (verify); summer occupancy dips must be covered by reserves."
   },
   {
    "t": "Seasonal wedding venue owner",
    "who": "Rachel, 44, wedding venue owner, Temecula",
    "situation": "Rachel's income is concentrated May-October. She wants lower fixed obligations in winter. Her bank statements show strong annual deposits and she is buying a $1.2M home.",
    "structure": "Bank statement IO non-QM 75% LTV; qualify on amortizing; reserves cover the off-season.",
    "numbers": "Illustrative: 24-month deposits averaged; IO saves about $700/mo during winter months.",
    "why": "IO smooths the cash-flow mismatch. Bank statements capture her real revenue. Qualifying on amortizing satisfies ATR.",
    "alternatives": "A full-doc jumbo was considered but tax returns show depressed income. An amortizing bank-statement loan was considered but tightens winter cash flow.",
    "watch": "Seasonality explanation; 12 months reserves through the off-season; recast."
   },
   {
    "t": "Divorce transition with temporary support",
    "who": "Greg, 51, surgeon, Las Vegas NV",
    "situation": "Greg is keeping the marital home and pays $6,000/mo in support that ends in 30 months. He needs to buy out his ex-spouse. He wants lower payments until support ends.",
    "structure": "Jumbo IO 7-year, rate/term buyout under the decree; qualify on amortizing including support.",
    "numbers": "Illustrative: support $6,000/mo; DTI 44% on amortizing payment with support included.",
    "why": "IO bridges a known temporary obligation. He still qualifies on the full payment. The decree supports rate/term treatment.",
    "alternatives": "An amortizing jumbo was considered but DTI was tight. Selling the home was considered but he wants stability for his children.",
    "watch": "Support order must show the end date; the decree must award the home to Greg and document the buyout; he must still qualify on the amortizing payment including support."
   },
   {
    "t": "Pre-retiree buying before selling",
    "who": "Linda, 63, CFO near retirement, Carlsbad",
    "situation": "Linda will sell her current home in 18 months when her youngest graduates. She wants to buy a $1.6M home now with IO to keep payments low until the sale. She expects $800K net proceeds.",
    "structure": "Jumbo IO 75% LTV with documented plan to pay down after sale; qualify on both payments.",
    "numbers": "Illustrative: $1.2M loan; expected $800K curtailment after sale.",
    "why": "Avoids bridge-loan cost. IO keeps the carrying cost of two homes manageable. Her income covers both payments on paper.",
    "alternatives": "A bridge loan was considered but costly. A HELOC on the departing home was considered but short-term.",
    "watch": "Recast option availability; reserves; retirement timing affects income continuance."
   }
  ],
  "qa": [
   {
    "q": "Is a jumbo IO loan QM?",
    "a": "No. Interest-only features make it non-QM, so the lender must satisfy ATR in full."
   },
   {
    "q": "What payment do we qualify on?",
    "a": "The fully amortizing payment over the term remaining after the IO period. For ARMs, it is the greater of note or fully indexed rate."
   },
   {
    "q": "Can borrowers pay principal during IO?",
    "a": "Usually yes without penalty. The IO payment then recalculates on the lower balance (lender-specific)."
   },
   {
    "q": "Is there a prepay penalty on owner-occupied IO?",
    "a": "No. Non-QM consumer loans generally cannot carry prepayment penalties under 1026.43(g)."
   },
   {
    "q": "Does IO affect HPML status?",
    "a": "HPML depends on APR vs APOR, not IO itself. If the loan is HPML, escrow and HPML appraisal rules apply."
   },
   {
    "q": "Are recast options available?",
    "a": "Some notes allow a recast after a large curtailment. Confirm the terms and fee in the note."
   },
   {
    "q": "How do IO ARMs adjust?",
    "a": "They adjust using index plus margin, subject to caps. Disclose the worst-case payment."
   },
   {
    "q": "What disclosures matter?",
    "a": "The LE/CD projected payments table shows the IO period and payment change. ARM disclosures and CA MLDS apply where required."
   }
  ],
  "aeQuestions": [
   "Do you qualify on the amortizing payment at note rate or fully indexed rate?",
   "What is the IO adjuster by LTV and loan size?",
   "Is a recast feature available and at what cost?",
   "What liquidity/reserve thresholds apply?",
   "Can investment properties use IO and is DSCR calculated on IO payment?",
   "What are ARM caps and margin?",
   "What IO periods (5, 7, 10 years) do you offer at each LTV and loan-amount tier?",
   "Do you allow recast after curtailment, and at what fee?",
   "What liquidity or post-close reserve minimum applies to IO jumbo loans?"
  ],
  "redFlags": [
   "Borrower cannot articulate why IO fits their finances",
   "No reserves to absorb payment shock",
   "Income declining with no plan for recast",
   "Using IO to stretch into a home the borrower cannot afford amortizing",
   "Undisclosed debt",
   "Misrepresented occupancy"
  ],
  "pricing": "IO pricing adds an adjuster on top of base jumbo pricing; size depends on LTV, FICO and loan amount. Fixed-period ARMs with IO may price differently than fixed IO. Compare total interest paid during the IO period and expected payment at recast, not only the starting payment. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "CPAs and wealth managers advising executives with variable compensation",
   "Financial planners discussing liquidity and investing",
   "Medical professional groups",
   "Luxury listing agents",
   "Educational seminars on cash-flow mortgages"
  ],
  "checklist": [
   "IO disclosure and payment shock worksheet signed",
   "ATR documentation",
   "Amortizing qualifying payment calc",
   "Reserve verification",
   "ARM disclosures if ARM",
   "Second appraisal if required",
   "Income documentation per program",
   "Insurance and taxes verified",
   "Explanation of purpose",
   "Recast feature confirmed in note",
   "Side-by-side IO vs amortizing payment schedule signed by borrower",
   "Curtailment or exit plan documented in the file",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_portfolio_bank": {
  "matrix": [
   [
    "Min FICO",
    "No hard floor at some banks; 680-720 typical, credit-committee driven (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-90%; higher with deposit relationship or pledged assets (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-75%; cash-out purpose may be questioned by committee (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$500K to $10M+; many banks want $1M+ to justify relationship (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50%, or global debt-service coverage of 1.25x+ for business owners (lender-specific)"
   ],
   [
    "Reserves",
    "Often expressed as post-close liquidity (e.g., 12-24 months PITIA or a % of loan) and/or deposits held at the bank (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "Case-by-case with narrative; 2-4 years with strong liquidity at some banks (verify)"
   ],
   [
    "Property types",
    "SFR, acreage/estate, non-warrantable condo, co-op (NY-style rare in CA), 2-4 unit; mixed-use via commercial desk"
   ],
   [
    "Occupancy",
    "Primary, second, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "Common on investor/commercial notes (step-down or yield maintenance); consumer owner-occupied limits apply"
   ],
   [
    "Interest-only",
    "Frequently available, often on 5/1, 7/1, 10/1 ARMs"
   ],
   [
    "Typical pricing vs agency",
    "Relationship-dependent: can be competitive with deposit/AUM discounts; ARMs most common (lender-specific)"
   ],
   [
    "States",
    "Usually limited to branch footprint; CA banks may not lend in FL/IL (verify)"
   ]
  ],
  "walkthrough": [
   "Pre-screen bank appetite: footprint, minimum loan size, collateral it will hold, and whether it accepts broker submissions",
   "Clarify relationship terms in writing: minimum deposits or AUM, how long they must stay, and the pricing consequence if moved",
   "Collect a signed personal financial statement (PFS) and schedule of real estate owned with debt and cash flow",
   "Build a global cash-flow analysis: personal plus each business entity (K-1s, 1120-S, 1065) and contingent liabilities like guarantees",
   "Write a credit memo/narrative for committee: strengths, weaknesses, mitigants, exit strategy",
   "Discuss ARM structure: index, margin, caps, fixed period, and whether IO is offered",
   "Bank orders appraisal from its panel; unique properties may need a specialist appraiser and longer turn time",
   "Committee presentation and decision; capture any counter-structure (lower LTV, extra collateral, deposit requirement)",
   "Issue commitment letter; review covenants (deposit maintenance, annual financial statements on larger loans)",
   "Clear conditions; for consumer loans, TRID LE/CD timing still applies even though the bank is portfolio",
   "Confirm ATR/QM status: may be general QM, small-creditor QM (1026.43(e)(5)) or non-QM",
   "Close; calendar post-close relationship obligations and rate step-ups if deposits fall"
  ],
  "incomeExample": {
   "title": "Global cash flow for business-owner borrower",
   "steps": [
    "1. Salary from own S-corp (W-2) = $180,000",
    "2. K-1 ordinary income (borrower 100%) = $220,000",
    "3. Add back business depreciation and amortization = $40,000",
    "4. Subtract business debt service not already in the P&L (equipment note principal) = $30,000",
    "5. Global annual cash flow = $410,000 -> $34,167/mo",
    "6. Proposed PITIA (illustrative) = $12,000; personal debts = $2,000",
    "7. Personal DTI = $14,000 / $34,167 = 41.0%",
    "8. Bank also tests global DSCR: $410,000 / (annual personal + business debt $168,000 + $30,000) = 2.07x"
   ],
   "result": "41% DTI and ~2.1x global coverage support committee approval (illustrative)."
  },
  "scenarios": [
   {
    "t": "Equestrian estate on acreage",
    "who": "Michael, 60, retired tech founder, Rancho Santa Fe",
    "situation": "Michael is buying a $3M property on 8 acres with barns and an arena. Most secondary-market investors cap acreage and dislike agricultural improvements. His income is mostly portfolio distributions. He already banks with a regional bank's private-banking group.",
    "structure": "Portfolio bank 65% LTV 7/1 ARM; qualify on documented distributions plus liquidity; bank-ordered specialist appraisal.",
    "numbers": "Illustrative: $1.95M loan; $4M liquid post-close, roughly 200 months of PITIA reserves.",
    "why": "The bank holds the loan on its balance sheet and can approve acreage and outbuildings an investor won't. His existing relationship gives committee context. Distributions plus liquidity show ability to repay.",
    "alternatives": "A prime jumbo was considered but acreage exceeds investor guidelines. An asset-depletion non-QM loan was considered and is workable, but priced above the relationship offer.",
    "watch": "Appraisal comps for equestrian properties; well and septic inspections; wildfire insurance availability before commitment."
   },
   {
    "t": "High-net-worth widow with dividend income",
    "who": "Susan, 67, retired, La Jolla",
    "situation": "Susan inherited a $5M brokerage portfolio and wants a $2M home without selling large positions and triggering capital gains. Her documented income is dividends and Social Security. She prefers one relationship manager for everything.",
    "structure": "Portfolio loan 75% LTV using the bank's asset-based method; relationship discount if assets move, shown alongside non-relationship options.",
    "numbers": "Illustrative: $1.5M loan; dividends plus Social Security alone give 72% DTI, so the bank's asset-based method is used.",
    "why": "The bank can blend relationship assets into the credit decision. It avoids a taxable sale. One relationship manager suits her preferences.",
    "alternatives": "Asset-depletion non-QM was considered and is a solid fallback. A pledged-asset line was considered but carries margin-call risk.",
    "watch": "Moving assets is her choice - document that alternatives were shown; relationship pricing step-ups if assets move later."
   },
   {
    "t": "Contractor with complex returns needing speed",
    "who": "Jorge, 45, construction company owner, Escondido",
    "situation": "Jorge's 1120-S shows depreciation-heavy years and a large equipment purchase. He has a 21-day purchase contract on a $1.1M home. His business has a line of credit with a community bank that knows his cash flow.",
    "structure": "Portfolio 80% LTV 10/1 ARM with global cash flow; committee fast-tracked because of the existing relationship.",
    "numbers": "Illustrative: $880K loan; global DSCR about 1.8x.",
    "why": "The existing relationship shortens credit analysis. The bank tolerates depreciation-heavy returns with global cash flow. Speed matches his contract.",
    "alternatives": "A bank-statement non-QM loan was considered but costs more. A full-doc jumbo was considered but needs 2 years of steady returns.",
    "watch": "Cross-default clauses with the business line; personal guarantee implications; committee date vs contract."
   },
   {
    "t": "Mixed-use storefront and apartment",
    "who": "Hannah, 39, cafe owner, Encinitas",
    "situation": "Hannah wants to buy the $1.6M building her cafe leases: ground-floor retail plus a 2-bed apartment she will live in. Commercial square footage exceeds agency mixed-use limits. Her cafe has 4 years of returns.",
    "structure": "Bank commercial or mixed-use program 70-75% LTV, 25-year amortization, possible 5-year reset.",
    "numbers": "Illustrative: $1.15M loan; owner-user rent to her business counted carefully.",
    "why": "Agency mixed-use rules fail; a bank underwrites the whole building. Owning removes rent risk for her cafe. Owner-occupancy of the apartment helps.",
    "alternatives": "SBA 504 was considered but slower. A DSCR 5-8 loan was considered but is a residential product.",
    "watch": "Commercial loan balloon or reset; zoning; environmental Phase I."
   },
   {
    "t": "Condo with construction-defect litigation",
    "who": "Victor, 52, attorney, Downtown San Diego",
    "situation": "Victor is buying a $900K high-rise unit. The HOA is suing the developer over window leaks. Fannie and Freddie treat it as ineligible. The bank can read the litigation and decide.",
    "structure": "Portfolio 70% LTV after the bank reviews the complaint, HOA attorney letter and reserves.",
    "numbers": "Illustrative: $630K loan; DTI 32%.",
    "why": "The bank reviews actual risk rather than applying a blanket rule. Insurance covers defense costs. Low LTV mitigates collateral risk.",
    "alternatives": "A non-QM non-warrantable condo program was considered and workable at higher price. Waiting for the lawsuit to end was considered but could take years.",
    "watch": "Special assessment risk; insurance coverage; scope of defects."
   },
   {
    "t": "New practice partner with short history",
    "who": "Natalie, 34, physician partner, Henderson NV",
    "situation": "Natalie bought into a group practice 8 months ago. Her K-1 history is short but her partnership agreement guarantees a draw of $28K/mo. She wants 15% down on a $1M home. The practice banks with a Nevada bank.",
    "structure": "Portfolio 85% LTV using partnership agreement and guaranteed draw; compared with physician program.",
    "numbers": "Illustrative: $850K loan; guaranteed draw $28K/mo.",
    "why": "The bank accepts short partnership history with the relationship. Guaranteed draw gives verifiable income. Practice banking relationship supports pricing.",
    "alternatives": "A physician loan was considered and may allow higher LTV. A full-doc jumbo was considered but needs 2 years of K-1s.",
    "watch": "Buy-in loan payments in DTI; partnership agreement terms; draw guarantee duration."
   },
   {
    "t": "Investor with 12 financed properties",
    "who": "Raymond, 56, landlord, Chula Vista",
    "situation": "Raymond has hit agency financed-property limits with 12 properties. He has strong rents and deposits at a local bank. He wants a blanket refinance of three duplexes worth $3.3M.",
    "structure": "Bank portfolio blanket loan with release clauses, 70% LTV, prepay step-down.",
    "numbers": "Illustrative: $2.3M loan; DSCR 1.35x.",
    "why": "A blanket loan consolidates three properties into one note. Agency won't finance beyond 10 properties. The bank values his deposits.",
    "alternatives": "Individual DSCR loans were considered but mean more closings and fees. A commercial bridge was considered but short term.",
    "watch": "Release-price provisions; prepay terms; cross-collateralization."
   }
  ],
  "qa": [
   {
    "q": "Why does a portfolio bank say yes when investors say no?",
    "a": "It keeps the loan on its own balance sheet, so its credit policy replaces secondary-market guidelines. Committee can weigh the whole relationship."
   },
   {
    "q": "Is a relationship-pricing requirement legal?",
    "a": "Yes if clearly disclosed. Document that the borrower was offered comparable non-relationship options and chose freely."
   },
   {
    "q": "How is broker compensation handled?",
    "a": "Some banks have wholesale channels with lender-paid comp; others require borrower-paid comp. Either way, comp cannot drive the lender choice under 1026.36."
   },
   {
    "q": "Are bank portfolio loans QM?",
    "a": "They can be general QM, small-creditor QM, or non-QM. Ask the bank how it classifies each loan."
   },
   {
    "q": "Can a portfolio bank do IO on a primary?",
    "a": "Often yes, but IO makes it non-QM. The bank must document ATR."
   },
   {
    "q": "What is a deposit covenant?",
    "a": "A condition requiring the borrower to keep a minimum balance. Falling below can trigger a rate increase, so read the note."
   },
   {
    "q": "How long do committees take?",
    "a": "From days to a few weeks. Build it into the contract timeline."
   },
   {
    "q": "Do banks allow non-warrantable condos?",
    "a": "Many do after reviewing budget, litigation and investor concentration. Policies vary by bank."
   },
   {
    "q": "Is TRID still required?",
    "a": "Yes for consumer-purpose loans. Business-purpose loans follow different disclosure rules, and CA MLDS may apply."
   },
   {
    "q": "Can a bank lend in another state?",
    "a": "Usually only within its footprint. Confirm before submitting a property outside the bank's area."
   }
  ],
  "aeQuestions": [
   "What is your lending footprint and minimum loan size for broker submissions?",
   "Exactly what relationship requirements apply, for how long, and what happens to the rate if deposits move?",
   "How does credit committee view acreage, mixed-use, or litigation condos?",
   "What ARM structures, caps and IO options are available?",
   "Is the loan QM, small-creditor QM or non-QM, and how do you document ATR?",
   "What is the committee calendar and typical time from submission to commitment?",
   "Will you show me the rate with and without the relationship requirement so the borrower can compare?",
   "What covenants (deposit minimums, annual financials) carry over after closing?",
   "Do you lend on acreage, mixed-use or litigation condos, and what LTV applies?"
  ],
  "redFlags": [
   "Borrower refuses a personal financial statement or hides contingent liabilities",
   "Relationship requirements not disclosed to borrower in writing",
   "Business guarantees or litigation surfaced late",
   "Cross-default or cross-collateral terms the borrower does not understand",
   "Collateral the bank will not value (unpermitted structures)",
   "Deposits shuffled between accounts to manufacture liquidity"
  ],
  "pricing": "Portfolio pricing reflects the bank's cost of funds, ARM fixed period, LTV, loan size and the total relationship (deposits, AUM, business accounts). Relationship discounts can be meaningful but carry an opportunity cost if the borrower would earn more or keep flexibility elsewhere. Compare covenant-driven rate step-ups and prepay terms on investor notes, not just the start rate. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Private-banking and business-banking officers who need a mortgage partner",
   "Wealth managers and family offices",
   "CPAs with business-owner clients whose returns show heavy depreciation",
   "Estate and equestrian property listing agents",
   "Commercial brokers with owner-user mixed-use buyers",
   "Investors who have hit agency financed-property limits"
  ],
  "checklist": [
   "Signed personal financial statement and REO schedule",
   "Global cash-flow worksheet",
   "2-3 years personal and business returns",
   "Relationship terms letter",
   "Credit narrative/committee memo",
   "Bank-ordered appraisal",
   "Commitment letter and covenants reviewed with borrower",
   "Entity docs for any guarantor entities",
   "Insurance and flood/wildfire coverage",
   "QM/ATR status documented",
   "Relationship terms letter signed with with-and-without relationship pricing shown",
   "Post-close covenant calendar given to borrower",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_physician": {
  "matrix": [
   [
    "Min FICO",
    "680-700 floor; 720-740+ for 100% LTV or larger loans (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "100% to ~$750K-$1M; 95% to ~$1.5M; 90% to $2M; lower above (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "90-95% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "Often not allowed, or 75-80% (lender-specific)"
   ],
   [
    "Loan amount range",
    "Conforming through ~$2-3M; no PMI on most programs"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "0-6 months for residents/new attendings; 6-12 months on larger loans (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "Typically 4-7 years; some exclude recent events entirely (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable condo; 2-unit limited; no investment"
   ],
   [
    "Occupancy",
    "Primary residence only"
   ],
   [
    "Prepayment penalty (investor)",
    "N/A (owner-occupied consumer loan)"
   ],
   [
    "Interest-only",
    "Rare; some portfolio banks offer IO ARMs (verify)"
   ],
   [
    "Typical pricing vs agency",
    "Near conforming-plus-PMI all-in; ARMs often cheapest (lender-specific)"
   ],
   [
    "States",
    "Many programs are bank-footprint limited; confirm CA/AZ/NV/IL/FL availability (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm degree eligibility (MD, DO common; DDS/DMD, DPM, DVM, PharmD, CRNA, PA vary by lender)",
   "Verify license status or residency/fellowship enrollment; some allow closing before state license with contract",
   "Review employment contract: guaranteed base, start date (often within 60-120 days of closing), non-contingent except licensing/credentialing",
   "Calculate income from guaranteed base only; production/RVU bonuses need history",
   "Determine student-loan treatment: excluded if deferred/forbearance 12+ months, or actual IDR payment, or 0.5-1% of balance (lender-specific)",
   "Check for the 2026 federal repayment changes (RAP replaces some IDR plans for new loans after 7/1/2026) - confirm the payment used will remain valid (verify)",
   "Pull credit; review medical-school-era credit cards and private refinanced loans (cannot be deferred)",
   "Verify funds; gifts often allowed for full down payment and closing",
   "Appraisal; condos must be warrantable on most programs",
   "Calculate DTI including spouse debts if community property state and FHA-like rules apply (lender-specific)",
   "Reserves; some programs require proof of pre-start cash to cover payments before first paycheck",
   "Before funding: confirm contract still valid and start date unchanged"
  ],
  "incomeExample": {
   "title": "Student-loan treatment changes the answer",
   "steps": [
    "1. Contract base salary $320,000 / 12 = $26,667/mo",
    "2. Federal student loans $400,000; documented IDR payment $2,200/mo (illustrative)",
    "3. Conventional fallback if no documented payment: 1% x $400,000 = $4,000/mo (agency standard is 0.5-1% depending on program - verify)",
    "4. Proposed PITIA on $1.1M physician loan (illustrative) = $7,800/mo",
    "5. Other debts: auto $500",
    "6. DTI using IDR payment = ($7,800 + $500 + $2,200) / $26,667 = 39.4%",
    "7. DTI using 1% rule = ($7,800 + $500 + $4,000) / $26,667 = 46.1%",
    "8. If loans deferred 12+ months past closing and the program excludes them: ($7,800 + $500) / $26,667 = 31.1%"
   ],
   "result": "Same borrower ranges from 31% to 46% DTI depending on program rules - the student-loan treatment is the deciding factor (illustrative)."
  },
  "scenarios": [
   {
    "t": "Resident moving to attending job",
    "who": "Jason, 31, emergency physician, Temecula",
    "situation": "Jason finishes residency in June and signs a contract with a Riverside County hospital starting August 1. He has $350K federal loans in forbearance. He has $40K saved and wants to buy a $900K home before starting. His wife is a teacher earning $60K.",
    "structure": "Physician 95% LTV, close in July on contract income; deferred loans treated per program; wife on loan to strengthen DTI.",
    "numbers": "Illustrative: $855K loan, no PMI; reserves of $15K cover payments until first paycheck.",
    "why": "Physician programs avoid PMI at 5% down and accept contract income before the first paycheck. Conventional would count student loans and add PMI. Closing before the job starts lets him settle in.",
    "alternatives": "Conventional 5% down was considered but adds PMI and counts full student-loan payments. FHA was considered but its loan limit and MIP made it worse.",
    "watch": "Contract must be non-contingent; start date within program window; license or credentialing letter before closing."
   },
   {
    "t": "Associate dentist on production pay",
    "who": "Maya, 29, associate dentist, Chula Vista",
    "situation": "Maya earns a guaranteed daily minimum plus a percentage of collections. She has $250K loans on IDR at $900/mo. She wants an $800K condo. She has 7 months at the practice.",
    "structure": "Dental-eligible physician program 95% LTV; qualify on guaranteed minimum only until she has 2 years of production history.",
    "numbers": "Illustrative: guaranteed $600/day x 4 days x 48 weeks = $115,200/yr = $9,600/mo.",
    "why": "The lender accepts short history with a contract. The guaranteed minimum is verifiable income. No PMI keeps the payment affordable.",
    "alternatives": "Conventional was considered but needs 2 years of variable-pay history. FHA was considered but condo approval and MIP were issues.",
    "watch": "Condo warrantability; production pay excluded until 2-year history; IDR payment documentation."
   },
   {
    "t": "Veteran physician compares VA",
    "who": "David, 40, VA hospital physician and Army veteran, Riverside",
    "situation": "David has full VA entitlement and a 30% disability rating. He is buying a $950K home and wants zero down. His income is $310K.",
    "structure": "VA with funding fee exemption likely beats a physician loan; Steven shows both side by side.",
    "numbers": "Illustrative: VA $950K with no funding fee (exempt); physician 100% may not reach $950K.",
    "why": "VA likely has the lowest total cost given the exemption. Zero down preserves his savings. Comparing both shows him the real cost difference.",
    "alternatives": "A physician loan was kept as backup if appraisal or condo issues arise. Conventional was considered but needs PMI.",
    "watch": "Disability rating letter; VA residual income; appraisal Tidewater process."
   },
   {
    "t": "Fellow relocating cross-country",
    "who": "Sophia, 34, cardiology fellow, Chicago IL",
    "situation": "Sophia is moving to San Diego for a $450K attending role. She wants 10% down on a $1.3M home. She has $500K in student loans.",
    "structure": "Physician jumbo 90% LTV with contract income; loans at IDR payment or excluded per program.",
    "numbers": "Illustrative: $1.17M loan, no PMI; DTI 38% with IDR payment.",
    "why": "Avoids a 20% jumbo down payment. Contract income is accepted before her start date. Student-loan treatment keeps DTI in range.",
    "alternatives": "A prime jumbo was considered but needs 20% down. A piggyback was considered but costs more overall.",
    "watch": "Relocation timing; California license issuance; IDR recertification."
   },
   {
    "t": "Practice-owner orthopedist",
    "who": "Ahmed, 45, orthopedic surgeon and practice owner, Phoenix AZ",
    "situation": "Ahmed owns his practice with 2 years of returns. He wants 10% down on $1.6M. He has large business debt that the practice pays.",
    "structure": "Physician jumbo 90% with business returns where allowed; global cash flow.",
    "numbers": "Illustrative: $1.44M loan; income $650K/yr.",
    "why": "High LTV without PMI. Business returns show strong income. Physician programs often accept self-employed doctors with 2 years.",
    "alternatives": "A full-doc prime jumbo was considered but needs 20% down. A bank-statement program was considered but unnecessary.",
    "watch": "Business debt guarantees; declining income; practice liquidity."
   },
   {
    "t": "Veterinarian first home",
    "who": "Kelly, 33, veterinarian (DVM), Henderson NV",
    "situation": "Kelly works for a veterinary hospital earning $130K. She has $200K student loans. She wants a $600K home with 3% down.",
    "structure": "Physician program if DVM eligible (lender-specific); else conventional 97% with PMI.",
    "numbers": "Illustrative: $582K loan at 97% LTV.",
    "why": "No PMI if eligible. Student-loan treatment may help DTI. Low down payment preserves savings.",
    "alternatives": "FHA was considered but MIP is costly. Conventional 97% was considered but adds PMI.",
    "watch": "Confirm in writing that DVM is on the lender's eligible list; document the student-loan payment from the servicer; DTI must stay under the cap with that payment."
   },
   {
    "t": "Physician couple in a community-property state",
    "who": "Raj and Ana, 36 and 35, hospitalist and pediatrician, Las Vegas NV",
    "situation": "Both have student loans totaling $600K. They want a $1.2M home with 5% down. Nevada community property rules may affect debt treatment on some programs.",
    "structure": "Physician 95% with both on loan; IDR payments documented.",
    "numbers": "Illustrative: $1.14M loan; combined income $520K.",
    "why": "No PMI on a high-LTV jumbo. Both incomes count. IDR payments keep DTI manageable.",
    "alternatives": "Conventional was considered but PMI and full payments hurt. A jumbo with 20% down was considered but they lack cash.",
    "watch": "IDR recertification dates; community property rules; reserves."
   }
  ],
  "qa": [
   {
    "q": "Which degrees qualify?",
    "a": "Typically MD and DO; DDS/DMD often; DPM, DVM, PharmD, CRNA, PA and OD vary by lender. Check the lender's current list."
   },
   {
    "q": "How are deferred student loans treated?",
    "a": "Some programs exclude loans deferred 12+ months past closing. Others use the IDR payment or 0.5-1% of the balance (lender-specific)."
   },
   {
    "q": "What changed for student loans in 2026?",
    "a": "Federal law created the RAP plan for new loans after July 1, 2026 and limited IBR for some borrowers; SAVE ended. Verify each borrower's current payment."
   },
   {
    "q": "Can a resident qualify?",
    "a": "Yes with contract or residency income. Some programs allow closing before start with reserves."
   },
   {
    "q": "Is PMI required?",
    "a": "Typically no, even at 95-100% LTV. That is the main benefit."
   },
   {
    "q": "Can it be used for a second home?",
    "a": "Generally no. Physician programs are for primary residences."
   },
   {
    "q": "Are gift funds allowed?",
    "a": "Usually yes. Confirm gift rules with the lender."
   },
   {
    "q": "Are physician loans QM?",
    "a": "Many are QM. Some are non-QM portfolio loans."
   },
   {
    "q": "What if the contract start date is delayed?",
    "a": "The loan may need re-approval. Confirm the program's start window."
   },
   {
    "q": "Can a 1099 physician qualify?",
    "a": "Some programs allow it with history (lender-specific). Locum physicians often need 2 years."
   }
  ],
  "aeQuestions": [
   "Which degrees are eligible and is license required before closing?",
   "How do you treat deferred, IDR and RAP student loan payments?",
   "What is the maximum LTV by loan size and FICO?",
   "What contract start window do you allow?",
   "Are reserves required before first paycheck?",
   "Do you allow 1099 or locum physicians?",
   "Do you close before the license is issued if the contract is signed?",
   "How do you treat RAP or IBR payments under the 2026 federal changes?",
   "What is the maximum loan amount at 100%, 95% and 90% LTV?"
  ],
  "redFlags": [
   "Contract contingent on items beyond licensing/credentialing",
   "License application denied or delayed",
   "Student loans in default or collections",
   "Undisclosed private student loans",
   "Occupancy misrepresentation",
   "Gift from interested party"
  ],
  "pricing": "Physician pricing depends on LTV, loan size, FICO and ARM vs fixed. Programs avoid PMI but may carry a modest rate premium versus conventional. Compare total monthly payment including PMI alternatives and total closing costs. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Residency and fellowship programs (graduation season)",
   "Hospital HR onboarding",
   "Dental and veterinary school alumni groups",
   "Physician financial planners",
   "Medical associations and veteran physician groups"
  ],
  "checklist": [
   "Employment contract",
   "License or residency verification",
   "Student loan statements and IDR documentation",
   "Credit",
   "Assets and gift letters",
   "Appraisal",
   "DTI calc",
   "Reserves",
   "Final VOE",
   "Start date confirmation",
   "Student-loan servicer letter showing current payment or deferment end date",
   "Contract start date confirmed within program window before closing",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_professional": {
  "matrix": [
   [
    "Min FICO",
    "700-720; 740+ for the highest LTV tiers (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "90-97% depending on profession and loan size; 100% rare outside physicians (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "85-90% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "Often not allowed, or 70-80% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $1-1.5M; non-physician caps usually lower than physician caps (lender-specific)"
   ],
   [
    "Max DTI",
    "43-45%; up to 50% with reserves (lender-specific)"
   ],
   [
    "Reserves",
    "2-12 months scaled to loan size (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "4-7 years typical (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable condo; 2-unit at some banks"
   ],
   [
    "Occupancy",
    "Primary residence only"
   ],
   [
    "Prepayment penalty (investor)",
    "N/A (owner-occupied)"
   ],
   [
    "Interest-only",
    "Rare (verify)"
   ],
   [
    "Typical pricing vs agency",
    "Roughly comparable to conventional-plus-PMI all-in; often bank portfolio ARMs (lender-specific)"
   ],
   [
    "States",
    "Mostly bank-footprint programs; confirm CA/NV/AZ/IL/FL availability before quoting (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm the profession is on that lender's current list - attorneys (JD + bar admission), CPAs, pharmacists (PharmD), CRNAs, PAs, NPs, optometrists, sometimes engineers (PE), architects or RNs; lists differ lender to lender",
   "Verify active license through the licensing board (State Bar of California, CA Board of Accountancy, CA Board of Pharmacy, BRN, NV/AZ/IL/FL equivalents) and save a dated printout",
   "Classify career stage: new grad with offer letter, early-career (under 10 years from licensure), or established - some programs only serve early-career",
   "For new attorneys, confirm bar passage and admission date; most programs will not close on a pending bar result",
   "Calculate income from guaranteed base; bonuses, overtime or 1099 per-diem need a 2-year history",
   "Decide student-loan treatment: some programs give non-physician professions the same deferment/IDR flexibility, others apply agency rules (0.5-1% or documented payment) - lender-specific",
   "For partners (law/CPA firms), review the partnership agreement for capital-account buy-in notes and capital calls; include note payments in DTI",
   "Verify funds; gifts commonly allowed for down payment",
   "Appraisal; confirm condo warrantability (most professional programs exclude non-warrantable)",
   "Compute DTI and reserves; confirm no PMI on the program",
   "Re-verify license status and employment within 10 days of funding"
  ],
  "incomeExample": {
   "title": "First-year associate attorney, 5% down",
   "steps": [
    "1. Offer letter base salary $225,000 / 12 = $18,750/mo (illustrative)",
    "2. Bar admission verified on the State Bar website",
    "3. Federal student loans $210,000; documented IDR payment $1,400/mo",
    "4. Purchase $750,000; 95% LTV loan $712,500; PITIA (illustrative) $5,200/mo",
    "5. Other debt: card minimums $300/mo",
    "6. DTI = ($5,200 + $1,400 + $300) / $18,750 = 36.8%",
    "7. Reserves required 3 months PITIA = $15,600; verified $22,000 after down payment and costs",
    "8. Comparison: conventional 95% would add monthly PMI (illustrative ~$250-400) and may count the loans at 0.5-1% if IDR not documented"
   ],
   "result": "Qualifies at ~37% DTI with no PMI under a professional program (illustrative)."
  },
  "scenarios": [
   {
    "t": "First-year associate attorney buying a condo",
    "who": "Alexis, 27, associate attorney, Downtown San Diego",
    "situation": "Alexis passed the California bar and was admitted in December, then started at a firm in January. She has $210K in federal student loans on IDR and $45K saved from a signing bonus. She wants a $750K condo near the courthouse.",
    "structure": "Professional program 95% LTV if attorneys are eligible; warrantable condo only; IDR payment documented with servicer letter.",
    "numbers": "Illustrative: $712,500 loan; DTI about 36.8%; no PMI.",
    "why": "The program accepts a 2-month job history backed by a license and offer letter. Avoiding PMI at 5% down lowers her monthly cost. Her income trajectory is predictable.",
    "alternatives": "Conventional 95% with PMI was considered but costs more monthly. FHA was considered but the building isn't FHA-approved and MIP lasts the life of the loan.",
    "watch": "Condo warrantability; bar admission proof; firm offer letter must be non-contingent."
   },
   {
    "t": "CPA manager with a variable bonus",
    "who": "Ben, 32, CPA audit manager, Temecula",
    "situation": "Ben has held a CPA license for 6 years and works at a large firm. He wants 5% down on an $820K home. His annual bonus ranges from $10K to $20K.",
    "structure": "Professional loan 95% where CPAs are eligible; base salary plus 2-year bonus average.",
    "numbers": "Illustrative: base $140K + bonus avg $15K = $12,917/mo; PITIA (illustrative) $5,700 -> housing ratio 44%.",
    "why": "No PMI keeps total payment within the DTI cap. His license and tenure support continuance. 5% down preserves savings.",
    "alternatives": "Conventional 95% was considered but PMI pushes DTI over the cap. CalHFA was considered but his income is likely over its limit (verify).",
    "watch": "Bonus variance; Riverside County loan limit; low other debt needed."
   },
   {
    "t": "Pharmacist transferring from Illinois",
    "who": "Chloe, 30, pharmacist (PharmD), Naperville IL to Murrieta CA",
    "situation": "Chloe is transferring with her pharmacy chain to a Murrieta store and already has her California license. She wants to buy within 60 days of starting. She has $25K saved and parents willing to gift $15K.",
    "structure": "Professional loan 95-97% if pharmacists eligible (lender-specific); gift allowed; transfer letter covers continuity.",
    "numbers": "Illustrative: $650K purchase; 97% loan $630,500.",
    "why": "Low down payment without PMI. The transfer letter shows continuous employment. Gift funds cover closing costs.",
    "alternatives": "Conventional 97% was considered but adds PMI. FHA was considered but MIP is costly.",
    "watch": "California Board of Pharmacy license printout before closing; employer transfer letter showing start date and salary; gift letter plus parents' bank statement showing the $15K transfer."
   },
   {
    "t": "Nurse anesthetist and veteran",
    "who": "Jamal, 35, CRNA, Henderson NV",
    "situation": "Jamal earns about $230K including overtime. He is an Air Force veteran with full entitlement. He wants a $700K home.",
    "structure": "Compare VA (zero down; funding fee unless exempt) with professional program 90-95%.",
    "numbers": "Illustrative: VA $700K vs professional 95% $665K; compare funding fee vs program cost.",
    "why": "VA usually wins for veterans with entitlement. A professional loan is a backup if entitlement is tied up. Showing both lets him choose on total cost.",
    "alternatives": "VA was chosen if funding-fee exempt. Conventional with PMI was considered but costs more.",
    "watch": "Two-year overtime history on the VOE; Certificate of Eligibility showing full entitlement; disability rating letter if claiming a funding-fee exemption."
   },
   {
    "t": "Licensed professional engineer",
    "who": "Lisa, 29, professional engineer, San Diego",
    "situation": "Lisa holds a PE license and works at a defense contractor. Only some professional programs include engineers. She has 6% saved for a $700K home and wants to avoid PMI.",
    "structure": "Professional loan where PE eligible (lender-specific); otherwise conventional 95% with PMI.",
    "numbers": "Illustrative: $665K loan; PMI avoided saves an estimated $200-300/mo.",
    "why": "No PMI if eligible. Her license and employer are stable. 5% down preserves her savings.",
    "alternatives": "Conventional 95% was considered but has PMI. FHA was considered but MIP is costly.",
    "watch": "Eligibility list confirmation; condo warrantability if applicable; DTI."
   },
   {
    "t": "Nurse practitioner with per-diem 1099 shifts",
    "who": "Maria, 38, nurse practitioner, Phoenix AZ",
    "situation": "Maria earns W-2 income at a clinic and 1099 per-diem shifts at an urgent care. The 1099 income has 14 months of history. She wants 5% down on a $520K home.",
    "structure": "Professional loan using W-2 only until 1099 reaches 2 years.",
    "numbers": "Illustrative: W-2 $120K qualifies; 1099 $30K excluded.",
    "why": "No PMI. W-2 alone qualifies. Excluding the 1099 keeps the file clean.",
    "alternatives": "Conventional was considered but adds PMI. A 1099 program was considered but needs 2 years.",
    "watch": "1099 income excluded until it has 2 years of history; any business expenses must not run through personal accounts used for reserves; DTI on W-2 alone must be under the cap."
   }
  ],
  "qa": [
   {
    "q": "Which professions usually qualify?",
    "a": "Attorneys, CPAs, pharmacists, CRNAs, PAs, NPs and optometrists are common. Engineers, architects and RNs appear on some lists; always check the lender's current list."
   },
   {
    "q": "Does a new attorney need to pass the bar first?",
    "a": "Almost always yes. Admission must be verifiable before closing."
   },
   {
    "q": "Do professional programs treat student loans like physician programs?",
    "a": "Only if the lender says so. Many apply agency rules to non-physicians (lender-specific)."
   },
   {
    "q": "Is PMI waived?",
    "a": "Typically yes on professional programs. That is their main benefit."
   },
   {
    "q": "Can partners in a law firm use the program?",
    "a": "Yes with K-1 history. Include capital-account buy-in notes in DTI."
   },
   {
    "q": "Can it be a second home?",
    "a": "No. Professional programs are for primary residences."
   },
   {
    "q": "Are these loans QM?",
    "a": "Usually QM when DTI and fees meet QM tests. Some are non-QM portfolio loans."
   },
   {
    "q": "Can gifts be used?",
    "a": "Usually for down payment and closing costs (lender-specific). Document the donor and transfer."
   }
  ],
  "aeQuestions": [
   "Which professions are eligible and is a minimum years-since-licensure required?",
   "Is the license required before closing or can a pending license close?",
   "How do you treat student loans for non-physician professions?",
   "What are LTV caps by loan size?",
   "Do you allow 1099 or per-diem income?",
   "What states and counties are in your footprint?",
   "Is there a years-since-licensure limit (for example under 10 years)?",
   "Do you include engineers, architects or RNs on your eligible list?",
   "Do you require the license before closing or allow pending licensure?"
  ],
  "redFlags": [
   "License suspended, lapsed or not verifiable",
   "Offer letter with contingencies beyond licensing",
   "Undisclosed private student loans",
   "Occupancy misrepresentation",
   "Gift funds from interested party",
   "Bar exam not passed at closing"
  ],
  "pricing": "Pricing depends on profession, LTV, loan size, FICO and ARM vs fixed. Programs avoid PMI but may carry a modest rate premium. Compare the total monthly payment and closing costs against conventional with PMI. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Bar associations and new-admittee events",
   "CPA societies",
   "Pharmacy associations",
   "Nursing and CRNA associations",
   "Law firm and hospital HR onboarding",
   "Graduate school alumni groups"
  ],
  "checklist": [
   "License verification printout",
   "Offer letter or contract",
   "Student loan statements with documented payment",
   "Credit",
   "Assets and gift letters",
   "Appraisal",
   "DTI calc",
   "Reserves",
   "Partnership agreement if partner",
   "Final VOE and license re-check",
   "State licensing-board printout dated within 10 days of closing",
   "Profession confirmed on lender's current eligible list",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_nonwarrantable_condo": {
  "matrix": [
   [
    "Min FICO",
    "660-700; 720+ for the top LTV tier (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "75-85% primary; 70-80% second home; 70-75% investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "65-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "43-50% full doc or alt-doc; DSCR 1.00+ for investors (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months; more for investment or larger loans (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years non-QM (verify)"
   ],
   [
    "Property types",
    "Condos failing agency warrantability: single-entity ownership above limits, investor concentration, litigation, commercial space over 35%, low reserves, hotel-like services, new projects with low presales"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "Common on investor DSCR where the state allows; none on owner-occupied non-QM consumer loans"
   ],
   [
    "Interest-only",
    "Often available"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; non-warrantable adjuster plus non-QM pricing (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, IL common; FL heavy scrutiny post-Surfside (SIRS and milestone inspections) (verify)"
   ]
  ],
  "walkthrough": [
   "Order the HOA questionnaire early and identify the exact reason the project is non-warrantable",
   "Collect budget, reserve study, last 12 months of minutes, special-assessment history, and litigation documents",
   "Classify litigation: construction-defect or structural is most serious; minor slip-and-fall may be allowed",
   "For Florida, confirm milestone inspections and structural integrity reserve study (SIRS) compliance",
   "Measure investor concentration and single-entity ownership against the lender's limits",
   "Calculate commercial space percentage and confirm residential character",
   "Review master insurance, fidelity coverage and HO-6 walls-in coverage",
   "Check for pending special assessments and add to DTI if borrower-paid",
   "Underwrite the borrower via full doc, bank statement or DSCR as appropriate",
   "Appraisal with recent comps from the same building",
   "Submit project to the lender's condo review desk",
   "Clear title and HOA payoff/estoppel",
   "Close and fund"
  ],
  "incomeExample": {
   "title": "DSCR on a non-warrantable investor condo",
   "steps": [
    "1. Market rent (1007) $3,200/mo",
    "2. P&I (illustrative) $2,000",
    "3. Property tax $450",
    "4. HO-6 insurance $50",
    "5. HOA dues $650 (high dues are typical in amenity-heavy buildings)",
    "6. PITIA = $3,150",
    "7. DSCR = $3,200 / $3,150 = 1.02"
   ],
   "result": "Meets a 1.00 DSCR minimum, but a $100 HOA increase would drop below - reserves and rent stability matter (illustrative)."
  },
  "scenarios": [
   {
    "t": "Downtown high-rise with heavy investor ownership",
    "who": "Ryan, 33, software developer, Downtown San Diego",
    "situation": "Ryan wants a $700K unit in a building where about 60% of units are rentals. Agency review fails on investor concentration, and the building lacks FHA approval. He has 15% down and W-2 income of $165K.",
    "structure": "Non-QM non-warrantable condo program 85% LTV, full-doc income, 6 months reserves.",
    "numbers": "Illustrative: $595K loan; DTI 39%.",
    "why": "Agency will not buy the loan, but the non-QM program accepts investor concentration. Full-doc income earns better pricing within non-QM. His DTI and reserves are strong.",
    "alternatives": "Looking for a different building was considered, but Ryan prefers this location. FHA single-unit approval was considered but the building doesn't qualify.",
    "watch": "HOA reserves under 10% of budget; pending dues increase; rental restrictions."
   },
   {
    "t": "Florida beachfront after structural rules",
    "who": "Joan, 61, retiree, Fort Lauderdale FL",
    "situation": "Joan is buying a $500K beachfront condo. The building completed its milestone inspection and has a scheduled special assessment for concrete restoration. Agency lenders decline it pending repairs.",
    "structure": "Non-QM lender willing after reviewing SIRS and assessment schedule; 70% LTV; assessment added to DTI.",
    "numbers": "Illustrative: $350K loan; assessment $400/mo added to housing expense.",
    "why": "Agency is ineligible while critical repairs are pending. Non-QM reviews the actual repair plan. Including the assessment in DTI keeps the file honest.",
    "alternatives": "A cash purchase was considered but she lacks liquidity. A different building was considered but most beachfront buildings face similar assessments.",
    "watch": "Assessment amount and schedule must be in writing and included in DTI; master insurance renewal quote reviewed; milestone report reviewed for additional repairs."
   },
   {
    "t": "Condo with construction-defect lawsuit",
    "who": "Victor, 52, attorney, Downtown San Diego",
    "situation": "The HOA is suing the developer over window leaks. Insurance covers the defense. Victor has strong income and wants a $900K unit.",
    "structure": "Non-QM non-warrantable 75% LTV after litigation review; portfolio bank option compared.",
    "numbers": "Illustrative: $675K loan; DTI 33%.",
    "why": "Agency is ineligible due to litigation. Non-QM reviews scope and insurance coverage. Low LTV mitigates risk.",
    "alternatives": "A portfolio bank was considered; Steven chose the best total cost. Waiting for litigation to settle was considered but could take years.",
    "watch": "HOA attorney letter on litigation scope and expected cost; insurance carrier confirmation of defense coverage; reserves sufficient to avoid special assessments."
   },
   {
    "t": "Las Vegas building with a rental desk",
    "who": "Derek, 40, casino operations manager, Las Vegas NV",
    "situation": "Derek wants a condo in a building with an on-site rental desk offering daily rentals, though owners are not required to participate. Agency review flags hotel-like services. It doesn't meet condotel criteria. He will live there.",
    "structure": "Non-warrantable condo program 80% LTV primary, full doc.",
    "numbers": "Illustrative: $400K purchase; $320K loan; DTI 37%.",
    "why": "Agency is ineligible due to hotel-like services. Condotel programs cost more and aren't required. Full doc earns better pricing.",
    "alternatives": "A condotel program was considered but is unnecessary and pricier. A nearby warrantable condo was considered but lacked amenities he wanted.",
    "watch": "Rental desk agreement; HOA reserves; percentage of units in rental program."
   },
   {
    "t": "Chicago building with ground-floor retail",
    "who": "Tina, 37, teacher, Chicago IL",
    "situation": "Tina wants a unit in a mixed-use building with 40% commercial space. Agency limits commercial space to about 35%. FHA also declines the project. She has 20% down.",
    "structure": "Non-QM non-warrantable condo 80% LTV, full doc.",
    "numbers": "Illustrative: $350K purchase; $280K loan.",
    "why": "Only non-warrantable programs accept the commercial percentage. Full doc keeps pricing reasonable. 20% down avoids PMI questions.",
    "alternatives": "FHA was considered but the project is ineligible. Conventional was considered but also ineligible.",
    "watch": "Commercial tenants' health; HOA budget reliance on commercial dues."
   },
   {
    "t": "Phoenix new-construction project",
    "who": "Omar, 45, electrical contractor, Phoenix AZ",
    "situation": "Omar is buying in a new condo project only 35% sold, with the developer still controlling the HOA. Agency presale requirements aren't met. He wants to lock in pre-construction pricing.",
    "structure": "Non-QM new-construction condo 75% LTV with condo review of budget and developer control.",
    "numbers": "Illustrative: $450K purchase; $337,500 loan.",
    "why": "Agency won't approve until presales rise. Non-QM allows him to buy at today's price. 75% LTV keeps risk moderate.",
    "alternatives": "Waiting for presales was considered but risked losing the unit and price. A resale condo was considered but cost more.",
    "watch": "Developer budget must be reviewed for underfunded reserves; date of HOA turnover to owners; risk of assessments once owners control the HOA."
   }
  ],
  "qa": [
   {
    "q": "What makes a condo non-warrantable?",
    "a": "Common causes include investor concentration, single-entity ownership, litigation, commercial space over limits, insufficient reserves, hotel-like services, or new projects with low presales. The HOA questionnaire identifies which applies."
   },
   {
    "q": "Can FHA be used?",
    "a": "Only if the project is FHA-approved or qualifies for single-unit approval. Many non-warrantable buildings also fail FHA review."
   },
   {
    "q": "How is pricing affected?",
    "a": "Non-warrantable adjusters stack on non-QM pricing. Lower LTV and higher FICO reduce the impact."
   },
   {
    "q": "What about Florida?",
    "a": "Post-Surfside rules require milestone inspections and structural integrity reserve studies. Many buildings are ineligible until compliant."
   },
   {
    "q": "Can investors use DSCR?",
    "a": "Yes on many programs. The HOA dues often make DSCR harder to reach."
   },
   {
    "q": "Is litigation always disqualifying?",
    "a": "No. Structural or defect litigation is most serious; minor slip-and-fall claims may be allowed."
   },
   {
    "q": "What reserves are typical?",
    "a": "Typically 6-12 months. Investment properties may require more."
   },
   {
    "q": "What insurance is required?",
    "a": "Master policy, HO-6 walls-in coverage and fidelity coverage. Florida and California coastal buildings may have high deductibles."
   }
  ],
  "aeQuestions": [
   "Which warrantability failures do you accept?",
   "What is the max LTV by occupancy?",
   "How do you review litigation?",
   "What are your Florida structural requirements?",
   "What are your investor-concentration limits?",
   "What is the condo review fee and timeline?",
   "Which warrantability failures do you accept and which are hard stops?",
   "How do you review Florida milestone and SIRS compliance?",
   "Do you charge a condo review fee and how long does review take?"
  ],
  "redFlags": [
   "Undisclosed special assessments",
   "Structural litigation",
   "HOA insolvency or delinquency spike",
   "Insurance lapses",
   "Fraudulent HOA documents",
   "Occupancy misrepresentation"
  ],
  "pricing": "Pricing depends on LTV, FICO, occupancy and condo type adjusters. Compare total cost including condo review fees. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Downtown condo listing agents",
   "HOA management companies",
   "Florida coastal agents",
   "Investor groups",
   "Real estate attorneys"
  ],
  "checklist": [
   "HOA questionnaire",
   "Budget and reserve study",
   "Minutes",
   "Litigation documents",
   "Master and HO-6 insurance",
   "Appraisal",
   "Condo approval",
   "Income docs",
   "Reserves",
   "Special assessment disclosure",
   "Exact non-warrantable reason documented from HOA questionnaire",
   "Special assessment amount and schedule included in DTI",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_condotel": {
  "matrix": [
   [
    "Min FICO",
    "680-720; 740 for top LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "60-75%; second home usually 5 pts above investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "60-70% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "50-65% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$100K-$150K minimum to ~$1.5-2M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "43-50% full/alt doc, or DSCR 1.00+ on net rental-pool income (lender-specific)"
   ],
   [
    "Reserves",
    "12 months+; some 18-24 months for investment (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "Units in hotel-condo projects with front desk, daily rentals, housekeeping or rental pool; min ~400-500 sq ft; full kitchen often required, kitchenette may be ineligible (lender-specific)"
   ],
   [
    "Occupancy",
    "Second home or investment; primary rarely allowed"
   ],
   [
    "Prepayment penalty (investor)",
    "Common on investor DSCR where state law allows; none on consumer second home non-QM"
   ],
   [
    "Interest-only",
    "Some programs, lower LTV (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Meaningfully above agency second-home pricing; condotel adjuster plus non-QM (lender-specific)"
   ],
   [
    "States",
    "FL (Orlando, Miami, Gulf), NV (Las Vegas Strip), AZ (Scottsdale), CA resort coastal areas (verify each project)"
   ]
  ],
  "walkthrough": [
   "Confirm it is truly a condotel: hotel brand management, front desk, daily/weekly rentals, mandatory or voluntary rental pool - this decides program",
   "Pull the rental-management agreement: revenue split, mandatory participation, owner-use blackout dates, furniture package refresh fees",
   "Measure the unit: under ~400-500 sq ft or no full kitchen (stove/oven, refrigerator, sink) knocks out many lenders",
   "Request hotel/HOA budget, reserve study and occupancy/ADR history from management",
   "Get 12-24 months of unit-level owner statements to support rental income",
   "Confirm master insurance (hurricane/windstorm in FL, wildfire in CA) and owner contents/HO-6 needs",
   "Order appraisal from an appraiser with condotel experience - comps must be other condotel sales",
   "Underwrite borrower: full doc/alt doc DTI, or DSCR using net owner income after rental-pool split and fees",
   "Check for pending FF&E (furniture) assessments and add to expenses",
   "Submit project to lender condo review; many keep an approved/declined project list",
   "Disclose resale/liquidity risk to the borrower in writing",
   "Close with business-purpose or second-home occupancy certification as applicable"
  ],
  "incomeExample": {
   "title": "Condotel DSCR on net rental-pool income",
   "steps": [
    "1. Unit gross revenue last 12 months (owner statement) = $48,000",
    "2. Rental-pool split to hotel 40% = $19,200",
    "3. Owner-paid expenses not in PITIA (reservation fees, FF&E reserve) = $2,400/yr",
    "4. Net owner income = $48,000 - $19,200 - $2,400 = $26,400 / 12 = $2,200/mo",
    "5. PITIA (illustrative): P&I $1,450 + tax $310 + HO-6 $40 + HOA $500 = $2,300",
    "6. DSCR = $2,200 / $2,300 = 0.96 - below 1.00",
    "7. Restructure: reduce LTV from 70% to 60% -> P&I ~$1,240 -> PITIA $2,090 -> DSCR 1.05"
   ],
   "result": "Deal works at 60% LTV with DSCR ~1.05; at 70% it fails (illustrative)."
  },
  "scenarios": [
   {
    "t": "Strip condotel for part-time use",
    "who": "Paul, 50, dentist, Phoenix AZ",
    "situation": "Paul wants a 550 sq ft unit in a Las Vegas Strip hotel-condo to use about six weekends a year and rent the rest through the hotel. The hotel keeps 50% of room revenue under its rental-pool agreement. The unit has a kitchenette rather than a full kitchen. His practice income is $420K documented on returns.",
    "structure": "Condotel investment 65% LTV qualified on full-doc practice income rather than DSCR, because the 50% revenue split makes DSCR thin; confirm with the AE that a kitchenette is acceptable before ordering the appraisal.",
    "numbers": "Illustrative: $450K purchase; $292,500 loan; owner net $3,000/mo in strong months and $1,200 in slow months vs PITIA (illustrative) $2,700.",
    "why": "Agency loans exclude condotels entirely, so a condotel program is the only financed route. Qualifying on his practice income avoids depending on volatile rental-pool revenue. 65% LTV keeps him inside the tier most condotel lenders allow for small units.",
    "alternatives": "Paying cash was considered but would drain his practice reserves. A traditional Strip-area condo without hotel services was considered, but he wants the hotel amenities and rental program.",
    "watch": "Kitchenette may fail the lender's kitchen rule - confirm in writing first; owner-use blackout dates in the rental agreement; resale liquidity of small units."
   },
   {
    "t": "Miami Beach hotel residence",
    "who": "Sara, 42, attorney (law-firm partner), Chicago IL",
    "situation": "Sara wants a $600K hotel-residence unit in Miami Beach as a winter getaway. She will use it about 4 weeks a year and put it in the rental program otherwise. Windstorm insurance costs at the building have doubled in two years, raising HOA dues. Her K-1 income is $380K.",
    "structure": "Condotel second home 65% LTV with full-doc K-1 income; 12 months reserves; HOA budget and Florida SIRS/milestone status reviewed.",
    "numbers": "Illustrative: $390K loan; HOA $1,100/mo including master windstorm; PITIA (illustrative) $4,100; DTI with Chicago home 34%.",
    "why": "Condotel programs are the only financing available for this hotel project. Qualifying on her income lets her keep the unit even in weak rental seasons. Second-home occupancy matches her real usage.",
    "alternatives": "A non-hotel condo nearby was considered, but she values the hotel services. Cash was considered but she prefers to keep liquidity in her firm capital account.",
    "watch": "Insurance-driven special assessments; Florida structural compliance; hurricane deductibles; 4-week personal use must match second-home certification."
   },
   {
    "t": "Coastal resort unit with mandatory rental",
    "who": "Kevin, 55, operations executive, Temecula",
    "situation": "Kevin wants an $800K unit at a coastal Southern California resort that requires owners to place units in the managed rental program. Owner use is capped at 60 nights a year. He plans to hold 10+ years. His W-2 income is $260K.",
    "structure": "Condotel investment 70% LTV; full doc chosen because rental-pool net income is slightly below PITIA; 12 months reserves.",
    "numbers": "Illustrative: $560K loan; owner net $3,400/mo vs PITIA (illustrative) $3,500 -> DSCR 0.97, so full doc used; DTI 36%.",
    "why": "Only condotel programs finance mandatory-rental projects. Full-doc qualification avoids a sub-1.00 DSCR tier. His long hold reduces the importance of resale liquidity.",
    "alternatives": "DSCR on a single-family STR elsewhere was considered, but he wants resort services and no self-management. A second-home loan was not possible because mandatory rental makes it investment use.",
    "watch": "Mandatory rental agreement terms; CA coastal insurance; lender's minimum unit size."
   },
   {
    "t": "Scottsdale resort unit with seasonal income",
    "who": "Amy, 47, physician, Henderson NV",
    "situation": "Amy wants a $500K Scottsdale resort unit for winter golf weeks. Rental income is strong January-April and weak in summer. She has W-2 income of $350K. She wants predictable approval regardless of seasonality.",
    "structure": "Condotel second home 65% LTV, full doc; rental income not used to qualify.",
    "numbers": "Illustrative: $325K loan; PITIA (illustrative) $2,600; DTI 28%.",
    "why": "Qualifying on salary removes the seasonality risk from underwriting. Condotel programs are the only route for this project. Her low DTI earns better pricing tiers.",
    "alternatives": "A single-family STR was considered but would require self-management. Cash was considered but she prefers liquidity.",
    "watch": "Summer revenue dip; resort HOA reserve health; owner-use limits."
   },
   {
    "t": "Orlando theme-park investor",
    "who": "Luis, 38, engineer, Orlando FL",
    "situation": "Luis wants a $350K condotel unit near the parks as a pure investment. He owns two other rentals. He wants to qualify without using his W-2. The hotel provides 24 months of owner statements.",
    "structure": "Condotel DSCR 65% LTV on net owner statements; 3-year step-down prepay where allowed.",
    "numbers": "Illustrative: $227,500 loan; net owner income $2,100 vs PITIA (illustrative) $1,900 -> DSCR 1.11.",
    "why": "DSCR keeps his personal DTI free for future purchases. Owner statements give lenders real history. Condotel financing is the only option for this project.",
    "alternatives": "A single-family STR was considered but requires more management. A conventional investment loan isn't available for condotels.",
    "watch": "Project must be on lender's approved list; occupancy history; Florida insurance."
   },
   {
    "t": "Lake Tahoe ski condotel",
    "who": "Grace, 60, retired executive, Reno NV",
    "situation": "Grace wants a $700K ski-resort condotel unit near Lake Tahoe. Her income is pension and investment distributions. She wants low monthly obligations.",
    "structure": "Condotel 60% LTV full doc with pension and asset income.",
    "numbers": "Illustrative: $420K loan; PITIA (illustrative) $3,400; DTI 30%.",
    "why": "Low LTV reduces pricing adjusters. Full doc avoids reliance on seasonal ski revenue. Condotel financing is the only route for this project.",
    "alternatives": "Cash was considered but would reduce liquidity. A non-hotel condo was considered but she wants ski-in services.",
    "watch": "Snow-season dependence; resort financial health; HOA reserves."
   }
  ],
  "qa": [
   {
    "q": "How do I tell a condotel from a non-warrantable condo?",
    "a": "Condotels have hotel-brand management, front desk, daily rentals, rental pool and housekeeping. A condo with only a rental desk may be non-warrantable rather than a condotel; the lender's condo review decides."
   },
   {
    "q": "Can a condotel be a primary residence?",
    "a": "Rarely. Most programs limit condotels to second home or investment because hotel operations and rental pools conflict with full-time occupancy."
   },
   {
    "q": "How is condotel rental income documented?",
    "a": "Owner statements from the hotel's management company for 12-24 months are preferred. Appraiser rent estimates are less reliable for condotels."
   },
   {
    "q": "Why does unit size matter?",
    "a": "Small units resell poorly, so lenders set minimum square footage, often 400-500 sq ft (lender-specific). Units below the minimum may be ineligible regardless of borrower strength."
   },
   {
    "q": "Is a kitchenette enough?",
    "a": "Often not. Many lenders require a full kitchen with stove/oven, refrigerator and sink; confirm with the AE before ordering an appraisal."
   },
   {
    "q": "What about mandatory rental pools?",
    "a": "Some lenders decline mandatory pools or heavy owner-use limits. Read the rental agreement before submitting the file."
   },
   {
    "q": "Is a prepayment penalty allowed?",
    "a": "On business-purpose investment loans where state law allows. Consumer second-home non-QM loans generally cannot carry prepayment penalties."
   },
   {
    "q": "What reserves are typical?",
    "a": "Usually 12 months or more, sometimes 18-24 months for investment (lender-specific). Reserves offset the thin resale market and rental-pool volatility."
   }
  ],
  "aeQuestions": [
   "Is this project on your approved or declined condotel list?",
   "What minimum unit size and kitchen requirements apply?",
   "Do you accept mandatory rental pools and owner-use limits?",
   "How do you calculate DSCR - gross or net of rental-pool split?",
   "What max LTV for second home vs investment?",
   "What reserves are required?",
   "Is this specific project on your approved, limited or declined condotel list?",
   "Do you calculate DSCR on gross revenue or net of the rental-pool split and fees?",
   "Do you accept mandatory rental pools and owner-use caps?"
  ],
  "redFlags": [
   "Hotel brand leaving or management in dispute",
   "Rental agreement with very restrictive owner use",
   "Unit under minimum size or no kitchen",
   "Hotel or HOA financial distress",
   "Insurance gaps or rapid premium spikes",
   "Pending FF&E or structural assessments not disclosed"
  ],
  "pricing": "Condotel pricing reflects collateral risk and limited resale liquidity; LTV and occupancy type drive adjusters. Compare total cost including condo review fees and expected assessments. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Resort-area listing agents (Las Vegas, Orlando, Miami, Scottsdale)",
   "Hotel residence sales offices",
   "Vacation investors and STR groups",
   "CPAs advising second-home buyers",
   "Physician and executive clients seeking vacation property"
  ],
  "checklist": [
   "Rental-management agreement",
   "Unit size/kitchen verification",
   "Hotel/HOA budget and reserves",
   "Owner statements 12-24 months",
   "Master and HO-6 insurance",
   "Condotel appraisal",
   "Income docs or DSCR worksheet",
   "Reserves",
   "Lender condo review approval",
   "Occupancy certification",
   "Hotel rental-management agreement reviewed for mandatory participation and owner-use limits",
   "Unit square footage and kitchen confirmed against lender minimums",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_coop": {
  "matrix": [
   [
    "Min FICO",
    "680-720 (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "75-90% lender max, but co-op boards often require 20-25%+ down regardless"
   ],
   [
    "Max LTV rate/term",
    "75-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "Often limited by board and lender (lender-specific)"
   ],
   [
    "Loan amount range",
    "Varies by market; many Chicago/Florida co-ops are under $500K"
   ],
   [
    "Max DTI",
    "Lender 43-45% plus board's own debt-to-income test (often 25-35%)"
   ],
   [
    "Reserves",
    "Board often requires 12-24 months post-close liquidity"
   ],
   [
    "Credit-event seasoning",
    "Lender rules plus board scrutiny (verify)"
   ],
   [
    "Property types",
    "Cooperative shares with proprietary lease; Fannie-eligible co-op projects or portfolio lenders"
   ],
   [
    "Occupancy",
    "Primary mostly; boards restrict sublets"
   ],
   [
    "Prepayment penalty (investor)",
    "Rare"
   ],
   [
    "Interest-only",
    "Rare"
   ],
   [
    "Typical pricing vs agency",
    "Similar to conventional when project is Fannie-eligible; portfolio pricing otherwise (lender-specific)"
   ],
   [
    "States",
    "Rare in CA/AZ/NV; present in Chicago (IL) and parts of Florida (verify lender coverage)"
   ]
  ],
  "walkthrough": [
   "Confirm the co-op project meets lender eligibility (Fannie co-op project review or portfolio lender approval)",
   "Obtain co-op corporation financials and underlying blanket mortgage details",
   "Prepare the board package: financial statement, tax returns, references, interview",
   "Obtain the Aztech-style recognition agreement signed by the co-op",
   "Review proprietary lease and bylaws for sublet and transfer restrictions",
   "Obtain stock certificate and assignment documents",
   "Verify maintenance fees (include property taxes and underlying mortgage share)",
   "Appraisal with co-op comps",
   "Underwrite borrower: DTI includes maintenance",
   "Board approval",
   "Close: lender takes security interest in shares and lease (UCC-1 filing)"
  ],
  "incomeExample": {
   "title": "Co-op DTI including maintenance",
   "steps": [
    "1. Borrower income $15,000/mo",
    "2. Loan P&I (illustrative) $3,500",
    "3. Monthly maintenance $1,200 (includes building taxes and share of underlying mortgage)",
    "4. HO-6 insurance $50",
    "5. Other debts $500",
    "6. DTI = ($3,500 + $1,200 + $50 + $500) / $15,000 = 35%",
    "7. Board test example: housing (P&I + maintenance) / income = $4,700 / $15,000 = 31% - board cap 30% may require more down"
   ],
   "result": "Lender approves at 35% DTI but board may require a larger down payment (illustrative)."
  },
  "scenarios": [
   {
    "t": "Hyde Park co-op with an aging underlying mortgage",
    "who": "Ellen, 45, university professor, Chicago IL",
    "situation": "Ellen is buying a 2-bedroom co-op in Hyde Park for $300K. The board requires 20% down, 12 months of post-close liquidity and an in-person interview. The building's blanket (underlying) mortgage matures in 4 years and the board has not yet arranged a refinance. Her income is a stable university salary of $132K.",
    "structure": "Co-op share loan at 80% LTV through a lender that finances Chicago co-ops; recognition agreement executed by the co-op; lender reviews building financials and the underlying-mortgage refinance plan before approval.",
    "numbers": "Illustrative: $240K loan; P&I (illustrative) $1,650 + maintenance $1,050 (includes taxes and her share of the blanket loan) + HO-6 $35 = $2,735; DTI with $300 other debt = $3,035 / $11,000 = 27.6%.",
    "why": "Co-op shares are personal property, so ordinary mortgage programs that require real-property title do not apply. A lender with a co-op program can take a security interest in the shares and proprietary lease. Her low DTI also satisfies the board's own housing-ratio test, which is often stricter than the lender's.",
    "alternatives": "A condo in the same neighborhood was considered, but comparable condos cost about 25% more per square foot. Paying cash was considered and rejected because it would leave her below the board's liquidity requirement.",
    "watch": "Board approval must arrive before the loan commitment expires; a balloon or refinance of the blanket mortgage could raise maintenance - get the board's written plan; recognition agreement must be signed before closing."
   },
   {
    "t": "Miami co-op for a retiree",
    "who": "Harold, 70, retired engineer, Miami FL",
    "situation": "Harold wants to downsize into a $250K co-op unit in a 1970s Miami building. The board requires 25% down, two years of tax returns and proof of 24 months of post-close liquidity. His income is a pension of $3,800 and Social Security of $2,600. The building completed its milestone inspection and is funding its structural reserve study.",
    "structure": "Co-op loan 75% LTV with a lender that finances Florida co-ops; Florida milestone inspection and SIRS status reviewed; recognition agreement executed.",
    "numbers": "Illustrative: $187,500 loan; P&I (illustrative) $1,300 + maintenance $1,100 + HO-6 $45 = $2,445; DTI = $2,445 / $6,400 = 38%.",
    "why": "The board's 25% down requirement matches what a co-op lender would accept, so financing preserves his liquidity. Very few lenders finance Florida co-op shares, so using a co-op specialist is the only realistic financed path. Fixed income is stable and easy to document.",
    "alternatives": "A cash purchase was rejected because it would leave him below the board's 24-month liquidity rule. A nearby condo was considered, but its pending special assessment for concrete restoration was larger than this building's.",
    "watch": "Pending or future special assessments tied to Florida structural rules; maintenance increases from insurance costs; board approval timing."
   },
   {
    "t": "Rare San Diego co-op",
    "who": "Nina, 35, ER nurse, San Diego",
    "situation": "Nina found a cooperative apartment in a 1960s building near Balboa Park listed at $500K, well below nearby condos. Few California lenders finance co-op shares, and her credit union declined. The board requires a financial statement, references and an interview. Her W-2 income including shift differentials is $145K.",
    "structure": "Portfolio lender that finances co-ops in California (verify availability); 80% LTV; base plus 2-year average of shift differentials; recognition agreement.",
    "numbers": "Illustrative: $400K loan; P&I (illustrative) $2,750 + maintenance $650 + HO-6 $30 = $3,430; DTI with $400 debts = 31.7%.",
    "why": "The co-op price discount makes this her most affordable path into ownership near work. A portfolio lender can approve share-loan collateral that agency programs rarely cover in California. Her stable nursing income supports both the lender's and the board's ratios.",
    "alternatives": "A condo nearby was considered but costs about $120K more. FHA was considered but the building is not on any approved co-op list, so it was not workable (verify).",
    "watch": "Lender availability and appetite; underlying building mortgage health; resale liquidity - fewer buyers can finance co-ops."
   },
   {
    "t": "Investor blocked by sublet rules",
    "who": "Sam, 50, rental investor, Chicago IL",
    "situation": "Sam wants to buy a co-op in Lakeview and rent it out. The proprietary lease prohibits subletting for the first 2 years and caps sublets at 1 year in any 5 after that. He owns four DSCR-financed rentals. He assumed a DSCR loan would work.",
    "structure": "Steven explains co-ops generally cannot be financed or operated as rentals under these bylaws and redirects to a condo or 2-4 unit DSCR purchase.",
    "numbers": "Illustrative: comparable Lakeview condo $320K at 75% LTV; rent $2,300 vs PITIA $2,150 -> DSCR 1.07.",
    "why": "Financing a co-op he cannot legally rent would violate the board's rules and misstate occupancy. A condo or small multifamily matches his business plan. DSCR programs require the property to be legally rentable.",
    "alternatives": "A condo with rental allowed fits his plan. A 2-4 unit in the same neighborhood offers higher DSCR and was also considered.",
    "watch": "Read condo rental caps before offering; DSCR minimum; confirm the alternative property's HOA rules."
   },
   {
    "t": "Relocating executive in Streeterville",
    "who": "Jill, 40, marketing executive, Los Angeles to Chicago",
    "situation": "Jill is relocating for a new role with a $210K base salary and found a co-op near her office for $400K. The board requires 25% down and 18 months of post-close liquidity. Her start date is 30 days before the planned closing. She is selling her LA condo.",
    "structure": "Co-op loan 75% LTV using offer letter with start before closing; board package prepared alongside the loan application.",
    "numbers": "Illustrative: $300K loan; P&I (illustrative) $2,050 + maintenance $1,400 = $3,450; DTI = $3,450 + $600 debts / $17,500 = 23%.",
    "why": "A co-op lender accepts the share structure while her strong income easily meets board ratios. Preparing the board package in parallel avoids losing the unit to timing. 25% down matches the board's minimum, so she keeps liquidity for the move.",
    "alternatives": "A condo was considered but closing costs and HOA dues were higher. Renting first was considered but she wanted to stop paying rent in a high-cost market.",
    "watch": "Board approval vs relocation date; proof of LA sale proceeds; offer letter start date confirmed."
   },
   {
    "t": "Senior co-op purchase",
    "who": "Frank, 68, retired postal worker, Chicago IL",
    "situation": "Frank is buying a unit in a 55+ co-op for $200K. The board requires age verification, income proof and an interview. His income is a federal pension of $3,200 and Social Security of $2,100. Maintenance covers taxes, heat and building insurance.",
    "structure": "Co-op loan 70% LTV; DTI includes full maintenance; board package filed alongside the loan.",
    "numbers": "Illustrative: $140K loan; P&I (illustrative) $950 + maintenance $850 + HO-6 $25 = $1,825; DTI = $1,825 / $5,300 = 34%.",
    "why": "Financing preserves his savings for health costs. A co-op lender handles share collateral. His fixed income is fully documentable.",
    "alternatives": "A cash purchase was considered but would use most of his savings. A senior rental community was considered but costs more monthly over time.",
    "watch": "Age restriction compliance; board approval; maintenance increases."
   }
  ],
  "qa": [
   {
    "q": "What exactly is the borrower buying in a co-op?",
    "a": "Shares in a cooperative corporation that owns the building, plus a proprietary lease giving the right to occupy a unit. There is no deed to real property, which is why standard mortgage programs need special co-op procedures."
   },
   {
    "q": "Who has to approve the purchase?",
    "a": "Both the lender and the co-op board. The board can reject buyers for financial reasons and often applies its own debt-to-income and post-close liquidity tests that are stricter than the lender's."
   },
   {
    "q": "What is a recognition agreement?",
    "a": "A three-party agreement among lender, borrower and co-op in which the co-op recognizes the lender's security interest in the shares and lease. It gives the lender notice of maintenance defaults and the ability to cure. Without it most lenders will not close."
   },
   {
    "q": "Does maintenance include property taxes?",
    "a": "Usually yes. Maintenance typically includes real estate taxes, the unit's share of the building's underlying mortgage, building insurance and operating costs, so the full maintenance amount goes into DTI."
   },
   {
    "q": "Can a co-op be rented out?",
    "a": "Often only with board approval and within strict limits. Many bylaws ban sublets for a period after purchase. That makes co-ops a poor fit for investors or DSCR financing."
   },
   {
    "q": "Why are co-ops rare in California, Arizona and Nevada?",
    "a": "Very few co-op buildings exist there, so few lenders keep co-op programs. Chicago and parts of Florida have more co-op stock and more lenders."
   },
   {
    "q": "How is the loan secured?",
    "a": "By a pledge of the shares and an assignment of the proprietary lease, perfected with a UCC-1 filing. A lien search on the shares replaces the usual title search."
   },
   {
    "q": "What happens if the building's underlying mortgage has problems?",
    "a": "A blanket-mortgage default or a costly refinance can raise maintenance or threaten the building. Lenders review building financials and the underlying loan's terms and maturity."
   }
  ],
  "aeQuestions": [
   "Do you lend on co-ops in this state?",
   "Board package requirements?",
   "Recognition agreement form?",
   "Max LTV?",
   "Reserves?",
   "Turn time?",
   "Do you require Fannie co-op project eligibility or will you portfolio the share loan?",
   "What form of recognition agreement do you require, and will you accept the co-op's standard form?",
   "How do you treat the underlying blanket mortgage's maturity and the building's reserves?"
  ],
  "redFlags": [
   "Board rejection",
   "Underlying mortgage maturing without refinance plan",
   "Building financial distress",
   "Sublet violations",
   "Missing recognition agreement",
   "Fraudulent board docs"
  ],
  "pricing": "Pricing similar to conventional with possible co-op adjusters. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Chicago agents",
   "Florida agents",
   "Co-op boards",
   "Estate attorneys",
   "Senior housing"
  ],
  "checklist": [
   "Board package",
   "Recognition agreement",
   "Proprietary lease",
   "Stock certificate",
   "Building financials",
   "Appraisal",
   "Income docs",
   "Credit",
   "Reserves",
   "UCC filings",
   "Lien search on shares and UCC-1 filing ready for closing",
   "Board approval letter dated before loan commitment expiry",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_bank_statement": {
  "matrix": [
   [
    "Min FICO",
    "620-660 floor; 680-720+ for 85-90% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "85-90% primary at top FICO; 80% second home; 75-80% investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "80-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "70-80%; cash-out caps by loan size (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $3-4M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50%; some to 55% with residual income and reserves (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months by LTV/loan size; cash-out proceeds often eligible (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "BK/FC/SS 2-4 years standard; 1-day-out programs at lower LTV (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo (warrantable and some non-warrantable), 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "Allowed on investment where state law permits; not on owner-occupied non-QM consumer loans"
   ],
   [
    "Interest-only",
    "Often available, 10-yr IO, lower LTV (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; 24 months and lower DTI price better than 12 months (lender-specific)"
   ],
   [
    "States",
    "Widely available CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm 2+ years self-employment (CPA letter, business license, SOS filing) - some allow 1 year with prior same-line experience",
   "Choose personal vs business statements and 12 vs 24 months by comparing which produces stronger, more stable income",
   "Collect all pages of every statement; confirm account ownership and borrower's ownership percentage",
   "Exclude non-business deposits: transfers between accounts, loan proceeds, refunds, gifts, cash advances, insurance claims",
   "Flag large deposits (often over 50% of average monthly income) and document with invoices or contracts",
   "Apply expense factor: standard 50% or industry table; lower factor needs CPA/EA expense letter or third-party P&L (lender-specific)",
   "Multiply eligible deposits by ownership percentage and by (1 - expense factor); divide by months",
   "Check trend: declining months 7-12 vs 1-6 may require using the lower period",
   "Review NSFs/overdrafts - more than a few in 12 months may require explanation or disqualify",
   "Verify business existence within 10-30 days of closing (CPA, license, internet/phone search)",
   "Compute DTI using qualifying income; confirm reserves",
   "Document ATR reasoning: the lender is relying on deposits rather than tax returns"
  ],
  "incomeExample": {
   "title": "24-month business bank statement income",
   "steps": [
    "1. Total deposits over 24 months = $1,080,000",
    "2. Less ineligible: transfers from personal $40,000, SBA loan proceeds $60,000 = $100,000",
    "3. Eligible deposits = $980,000",
    "4. Borrower owns 100% of the business",
    "5. Expense factor (standard) 50% -> $490,000 net; CPA letter supports 35% -> $637,000 (lender-specific)",
    "6. Using 50%: $490,000 / 24 = $20,417/mo",
    "7. Proposed PITIA (illustrative) $8,200 + other debts $1,500 = $9,700",
    "8. DTI = $9,700 / $20,417 = 47.5%; with 35% CPA factor: $26,542/mo -> 36.5%"
   ],
   "result": "Qualifies under 50% DTI either way; CPA expense letter improves DTI materially (illustrative)."
  },
  "scenarios": [
   {
    "t": "Contractor with heavy write-offs",
    "who": "Carlos, 44, general contractor, Escondido",
    "situation": "Carlos's tax returns show $68K net after depreciation and vehicle write-offs, but his business deposits average $65K a month. He wants to buy a $950K home with 15% down. His CPA can provide an expense-ratio letter. He has 9 years in business.",
    "structure": "24-month business bank statement program 85% LTV; CPA letter supporting a 40% expense factor; 6 months reserves.",
    "numbers": "Illustrative: eligible deposits $1.56M x 60% / 24 = $39,000/mo; PITIA (illustrative) $6,600 + $1,800 debts -> DTI about 22%.",
    "why": "His tax returns cannot support the loan, but his deposits clearly can. A CPA-supported expense factor reflects his true margins instead of a blanket 50%. Long business history supports continuance under ATR.",
    "alternatives": "Full-doc conventional was considered but taxable income is far too low. A DSCR loan was considered but it is only for investment property, not a primary residence.",
    "watch": "Large deposits over 50% of monthly average need invoices; contractor license verified on CSLB; months 13-24 vs 1-12 trend must not be declining."
   },
   {
    "t": "Realtor with lumpy commissions",
    "who": "Jenna, 39, real estate agent, Temecula",
    "situation": "Jenna's commission income is irregular with big months in spring and summer. She files as a sole proprietor and writes off marketing heavily. Her commissions go into a personal account separate from a small business account for expenses. She wants to buy a $780K home.",
    "structure": "12-month personal bank statement program 80% LTV (if her best year is the most recent); compare with 1099-only.",
    "numbers": "Illustrative: 12 months personal deposits $210,000 / 12 = $17,500/mo (some lenders use 100% of personal deposits when business expenses run through a separate account - verify).",
    "why": "Bank statements capture actual deposits rather than taxed net. Using personal statements may avoid the expense factor. Her recent year is her strongest.",
    "alternatives": "A 1099-only program was compared; bank statement won because of larger personal deposits. Full doc was rejected because of write-offs.",
    "watch": "Seasonality; commission advances are not income; transfers between accounts excluded."
   },
   {
    "t": "Food-truck owner with cash deposits",
    "who": "Luis, 36, food truck owner, Chula Vista",
    "situation": "Luis runs two food trucks and deposits cash daily into his business account. He has 3 years of business history and county health permits. He wants a $650K townhome with 20% down.",
    "structure": "24-month business statements 80% LTV; food-service expense factor per lender table (often higher than 50%).",
    "numbers": "Illustrative: deposits $720K x 30% net (70% expense) / 24 = $9,000/mo; PITIA (illustrative) $3,900 -> DTI 43%.",
    "why": "Cash-heavy businesses are poorly reflected on tax returns. Consistent daily deposits support stable income. Industry expense factors keep the calculation conservative.",
    "alternatives": "FHA was considered but tax returns are too low. A P&L program was considered but he doesn't have a CPA-prepared P&L.",
    "watch": "Cash deposits must be consistent; health permits; truck loans in DTI."
   },
   {
    "t": "Agency owner with retained earnings",
    "who": "Monique, 41, marketing agency owner, Las Vegas NV",
    "situation": "Monique's S-corp pays her a modest W-2 and retains earnings for growth. Her K-1 is also low. Business deposits are strong and consistent. She wants a $1.2M home.",
    "structure": "24-month business bank statements 80% LTV; CPA letter on ownership and expense factor.",
    "numbers": "Illustrative: deposits $2.4M x 50% / 24 = $50,000/mo at 100% ownership.",
    "why": "Retained earnings aren't visible on her W-2 or K-1. Bank statements show business cash flow. 24 months smooths client timing.",
    "alternatives": "Full doc was considered but K-1 is low due to reinvestment. A P&L program was considered but bank statements were already organized.",
    "watch": "Business account commingling; CPA letter; client concentration."
   },
   {
    "t": "Veteran-owned landscaping business",
    "who": "Tyrone, 47, landscaping company owner and Marine veteran, Oceanside",
    "situation": "Tyrone's tax returns show low net due to equipment depreciation. He has full VA entitlement, but VA requires tax-return income. His business deposits are strong. He wants a $900K home.",
    "structure": "Bank statement 85% LTV vs VA full doc comparison.",
    "numbers": "Illustrative: deposits $1.4M x 50% / 24 = $29,167/mo.",
    "why": "Bank statement qualifies where VA can't use deposits. 85% LTV preserves cash for his business. Steven shows both options so he chooses on total cost.",
    "alternatives": "VA was considered but returns are too low. A conventional full-doc loan was considered but has the same problem.",
    "watch": "Winter months with lower deposits must not show a declining trend; payroll is an expense the factor must cover; equipment loans personally guaranteed go into DTI."
   },
   {
    "t": "Dentist with new practice",
    "who": "Sanjay, 38, dentist and new practice owner, Phoenix AZ",
    "situation": "Sanjay bought his practice 14 months ago. Tax returns only show 1 year as owner, though he worked 6 years as an associate. He wants a $700K home.",
    "structure": "12-month business statements with prior employment as a dentist (1-year allowed by some lenders).",
    "numbers": "Illustrative: $900K deposits x 40% / 12 = $30,000/mo.",
    "why": "Short return history is offset by deposits and prior same-field employment. Bank statements show current cash flow. Lender accepts 1-year self-employment with history.",
    "alternatives": "A physician loan was considered but requires 2 years for self-employed. Full doc was considered but only 1 year of returns.",
    "watch": "Practice acquisition debt in DTI; continuity of patient base; expense factor."
   }
  ],
  "qa": [
   {
    "q": "What expense factor applies?",
    "a": "A standard 50% is common; lower factors require a CPA/EA letter or P&L support. Some lenders use industry tables (lender-specific)."
   },
   {
    "q": "Personal or business statements?",
    "a": "Personal statements may use 100% of eligible deposits if business expenses run through a separate account. Business statements apply an expense factor (lender-specific)."
   },
   {
    "q": "How are large deposits treated?",
    "a": "Deposits over about 50% of average monthly income usually must be sourced. Unsourced deposits may be excluded."
   },
   {
    "q": "Can I mix 12 and 24 months?",
    "a": "No, pick one per lender guideline. 24 months may smooth seasonality."
   },
   {
    "q": "Are transfers counted?",
    "a": "No. Inter-account transfers, loan proceeds and refunds are excluded."
   },
   {
    "q": "What about NSFs?",
    "a": "Excess NSFs, often 3+ in 12 months, need explanation. Some lenders disqualify the file."
   },
   {
    "q": "Is it QM?",
    "a": "No, it's non-QM. The lender must document ATR."
   },
   {
    "q": "Can business funds be used for down payment?",
    "a": "Often yes with a CPA letter that withdrawal won't harm the business. Some lenders require a cash-flow analysis."
   },
   {
    "q": "Is a prepay penalty allowed?",
    "a": "Only on business-purpose investment loans where state law allows. Owner-occupied non-QM loans cannot carry one."
   },
   {
    "q": "What about declining income?",
    "a": "A declining trend requires explanation. The lender may use the lower period."
   }
  ],
  "aeQuestions": [
   "What expense factor do you use, and what documentation lowers it?",
   "Do you allow personal statements at 100% with separate business account?",
   "What is your large-deposit threshold?",
   "How do you treat declining deposit trends?",
   "Do you allow 12 months with 1-year self-employment?",
   "What are LTV caps by FICO and loan size?",
   "Do you allow 100% of personal-account deposits when business expenses run through a separate account?",
   "Do you have industry-specific expense factors (food service, trucking, contractors)?",
   "How many NSFs or overdrafts are allowed in the statement period?"
  ],
  "redFlags": [
   "Deposits round-tripped between accounts",
   "Statements with edited fonts or misaligned numbers",
   "Business not verifiable online or with licensing",
   "Large unexplained cash deposits",
   "Borrower ownership less than claimed",
   "Declining deposits without explanation",
   "NSFs or overdrafts frequent"
  ],
  "pricing": "Pricing depends on FICO, LTV, 12 vs 24 months, DTI, reserves and occupancy. Lower expense factors improve qualification but not price. IO and cash-out add adjusters. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "CPAs serving self-employed clients",
   "Contractor associations",
   "Real estate agents (self-employed themselves)",
   "Business banking contacts",
   "Small-business networking groups",
   "Veteran-owned business associations"
  ],
  "checklist": [
   "12 or 24 months bank statements, all pages",
   "CPA letter for business existence and expense factor",
   "Business license/SOS filing",
   "Ownership percentage documentation",
   "Large deposit explanations",
   "NSF explanations",
   "Income calculation worksheet",
   "Credit",
   "Reserves",
   "Appraisal",
   "Deposit worksheet excluding transfers, loan proceeds and refunds",
   "Business existence verified within 30 days of closing",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_1099": {
  "matrix": [
   [
    "Min FICO",
    "620-660 floor; 700+ for 85-90% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "80-90% primary; 75-80% investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "75-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "70-80% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $3M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months by LTV and loan size (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years standard (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On business-purpose investment loans where state law allows"
   ],
   [
    "Interest-only",
    "Often available at lower LTV (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; similar band to bank-statement programs (lender-specific)"
   ],
   [
    "States",
    "Widely available in CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm the borrower is a true independent contractor (1099-NEC/1099-MISC) and not also a business owner with employees - if they own a business, bank statement or P&L may fit better",
   "Collect 1099s for 1 or 2 years per program; 2 years with same payer or same line of work is standard",
   "Obtain YTD evidence: payer statements, YTD earnings summary, or bank statements showing deposits from the payer",
   "Pull IRS wage-and-income transcripts (via 4506-C) to confirm the 1099s were actually filed - many lenders require this",
   "Apply the program expense factor to gross 1099 income (often a fixed 10%, sometimes 0-20% or a CPA-supported factor - lender-specific)",
   "Average over 12 or 24 months; if income is declining, use the lower recent figure",
   "Confirm payer relationship and continuance with written VOE, contract, or agency letter",
   "Check for gaps between contracts (travel nurses, locums) and document explanations",
   "Verify the borrower is not related to the payer (related-party 1099 is a fraud red flag)",
   "Compute DTI and reserves",
   "Document ATR reasoning for non-QM"
  ],
  "incomeExample": {
   "title": "Travel nurse with two years of 1099s",
   "steps": [
    "1. 2024 1099 total (two agencies) = $180,000",
    "2. 2025 1099 total = $195,000",
    "3. YTD 2026 through September = $150,000 (on pace for $200,000)",
    "4. Two-year average = ($180,000 + $195,000) / 2 = $187,500",
    "5. Expense factor 10% (lender-specific) -> $168,750 net",
    "6. Monthly qualifying income = $14,063",
    "7. Proposed PITIA (illustrative) $5,500 + auto and card debt $800 = $6,300",
    "8. DTI = $6,300 / $14,063 = 44.8%"
   ],
   "result": "Qualifies under a 45-50% DTI cap using 1099 gross less a fixed factor - her tax return net (after per-diem and travel deductions) would not (illustrative)."
  },
  "scenarios": [
   {
    "t": "Travel nurse between assignments",
    "who": "Kayla, 31, travel ICU nurse, San Diego",
    "situation": "Kayla works 13-week contracts paid on 1099 through two staffing agencies. Her Schedule C deducts travel, temporary housing and licensing costs, so her taxable net is far below her gross. She has 2 years of history with one 3-week gap between contracts. She wants a $725K townhome with 10% down.",
    "structure": "1099-only program 90% LTV if her FICO supports it, otherwise 85%; 2-year average of gross 1099s less a fixed 10% expense factor; agency VOE plus signed next-assignment letter.",
    "numbers": "Illustrative: $187,500 avg x 90% = $168,750 / 12 = $14,063/mo; PITIA (illustrative) $5,500 + $800 debts -> DTI 44.8%.",
    "why": "The program uses 1099 gross less a fixed factor, so her legitimate travel deductions don't erase her qualifying income. Two agencies and continuous contracts show stable demand for her specialty. 10% down keeps her savings intact for reserves.",
    "alternatives": "Full-doc conventional was considered, but Schedule C net is too low to qualify. A bank-statement program was considered, but her deposits mix in housing-stipend reimbursements that would need to be backed out, so 1099 is cleaner.",
    "watch": "Letter explaining the 3-week gap; next contract signed before closing; stipends excluded from income; IRS transcripts must show both agencies' 1099s."
   },
   {
    "t": "Rideshare driver who built a small fleet",
    "who": "Ahmed, 42, rideshare fleet operator, Las Vegas NV",
    "situation": "Ahmed started as a driver and now also leases three cars to other drivers. Most income still arrives as platform 1099-NECs and 1099-Ks. His returns show heavy vehicle depreciation. He wants a $480K home with 15% down.",
    "structure": "1099-only 85% LTV using platform 1099s; confirm the lender accepts 1099-K income; lease income excluded unless separately documented.",
    "numbers": "Illustrative: 1099 avg $120,000 x 90% / 12 = $9,000/mo vs bank-statement option $300,000 x 50% / 24 = $6,250/mo; PITIA (illustrative) $3,000 -> DTI 40% on 1099 path.",
    "why": "The 1099 calculation produces higher qualifying income than a bank-statement expense factor here. Platform 1099s are third-party documents, which underwriters trust. It avoids explaining depreciation-heavy returns.",
    "alternatives": "A 24-month bank-statement program was considered but yields $2,750/mo less income. Full doc was rejected because depreciation drives net income too low.",
    "watch": "Platform dependency and deactivation risk; 1099-K acceptance varies by lender; car-lease payments must be in DTI if personally guaranteed."
   },
   {
    "t": "Independent insurance agent with renewals",
    "who": "Linda, 50, independent insurance agent, Phoenix AZ",
    "situation": "Linda is paid new-business commissions plus renewal residuals on 1099 from one carrier. She has 8 years with the carrier and a renewal book that pays monthly. Her expenses are modest. She wants a $520K home with 20% down.",
    "structure": "1099-only 80% LTV on a 24-month average; carrier contract and production report support continuance.",
    "numbers": "Illustrative: $200,000 avg x 90% / 12 = $15,000/mo; PITIA (illustrative) $3,300 -> DTI 27%.",
    "why": "Renewal commissions provide a stable base, and the program reads them directly from 1099s. Simple documentation shortens processing. 20% down avoids mortgage insurance considerations entirely.",
    "alternatives": "Full doc was considered and may price similarly; Steven compared both and chose the lower total cost. Bank statement was considered but adds deposit analysis without improving income.",
    "watch": "Carrier contract renewal and book ownership terms; any chargeback provisions; transcripts confirming 1099s."
   },
   {
    "t": "IT consultant with a single client",
    "who": "Mark, 45, IT consultant, Chicago IL",
    "situation": "Mark has billed one client on 1099 for 3 years under an annually renewed contract. His Schedule C deducts a home office and equipment. He wants a $650K home in Naperville with 15% down.",
    "structure": "1099-only 85% LTV; client contract and written confirmation of renewal; 6 months reserves to offset single-client risk.",
    "numbers": "Illustrative: $250,000 x 90% / 12 = $18,750/mo; PITIA (illustrative) $4,300 + $500 debts -> DTI 25.6%.",
    "why": "1099 gross less a fixed factor qualifies him easily. Strong reserves mitigate single-client concentration. The program avoids Schedule C deduction issues.",
    "alternatives": "Full doc was considered; it works but at lower qualifying income. A WVOE program was not available since he is not an employee.",
    "watch": "Single-client concentration; contract renewal date relative to closing; non-compete or termination clauses."
   },
   {
    "t": "Real estate agent with brokerage 1099",
    "who": "Jenna, 39, real estate agent, Temecula",
    "situation": "Jenna receives a 1099 from her brokerage each year. Her Schedule C shows large marketing write-offs. YTD sales are on pace with last year. She wants a $780K home.",
    "structure": "1099-only 80% LTV vs 12-month bank statement comparison; YTD commission statement from the brokerage.",
    "numbers": "Illustrative: $150,000 x 90% / 12 = $11,250/mo; PITIA (illustrative) $4,900 -> DTI 47%.",
    "why": "1099 documentation is simpler than analyzing commission deposits. It avoids Schedule C deductions. Her brokerage can verify YTD production directly.",
    "alternatives": "A bank-statement program was considered and gave a similar result, so the simpler documentation won. Full doc was rejected due to write-offs.",
    "watch": "Seasonal market slowdowns; YTD pace must support the average; DTI near cap."
   },
   {
    "t": "Locum tenens physician",
    "who": "Raj, 40, locum hospitalist, Orlando FL",
    "situation": "Raj works through a staffing agency on 1099 for 2 years, covering shifts in three hospitals. Many physician programs require W-2 or an employment contract. He wants a $900K home with 15% down.",
    "structure": "1099-only 85% LTV; agency contract and 24 months of 1099s; IRS transcripts confirm.",
    "numbers": "Illustrative: $350,000 x 90% / 12 = $26,250/mo; PITIA (illustrative) $6,200 -> DTI 26%.",
    "why": "His 1099 income is high and documented by a third party. Physician programs often exclude locum 1099 income. The 1099 program qualifies him without employer contract.",
    "alternatives": "A physician loan was considered but most exclude locum 1099 income (lender-specific). Full doc was considered but Schedule C deductions reduce income.",
    "watch": "Agency contract continuity; credentialing at hospitals; transcripts."
   }
  ],
  "qa": [
   {
    "q": "How many years of 1099s are needed?",
    "a": "Usually 2 years, ideally with the same payer or in the same line of work. Some programs accept 1 year with documented prior experience in the same field (lender-specific)."
   },
   {
    "q": "What expense factor is applied?",
    "a": "Many lenders use a fixed 10% factor against gross 1099 income. Others use 0-20% or a CPA-supported factor (lender-specific)."
   },
   {
    "q": "Can multiple payers be combined?",
    "a": "Yes, each payer's 1099 and YTD earnings are documented and summed. Gaps between payers need explanation."
   },
   {
    "q": "Is YTD proof required?",
    "a": "Yes. Payer statements, a YTD earnings summary, or bank deposits from the payer typically satisfy it."
   },
   {
    "q": "Is a 1099 program QM?",
    "a": "No. It is non-QM, so the lender documents ATR without the QM presumption."
   },
   {
    "q": "Can it be used for investment purchases?",
    "a": "Yes on most programs, with business-purpose certification. LTV caps are usually lower for investment."
   },
   {
    "q": "Are IRS transcripts required?",
    "a": "Many lenders pull wage-and-income transcripts to confirm the 1099s were filed. Mismatches are a fraud flag."
   },
   {
    "q": "How is declining income handled?",
    "a": "The lender uses the lower or most recent figure and asks for an explanation. A steep decline may disqualify the file."
   },
   {
    "q": "Are 1099-Ks accepted?",
    "a": "Some lenders accept 1099-K platform income; others require 1099-NEC or 1099-MISC (lender-specific). Platform fees and refunds may need to be netted out."
   }
  ],
  "aeQuestions": [
   "What expense factor do you apply to 1099 income?",
   "Do you require 1 or 2 years, and same payer?",
   "What YTD documentation is required?",
   "Do you accept 1099-K income?",
   "What are LTV caps by FICO?",
   "Do you require IRS transcripts?",
   "Do you accept 1099-K income, and how do you treat platform fees and refunds?",
   "Do you require a payer VOE or contract in addition to 1099s?",
   "Do you pull wage-and-income transcripts on every 1099 file?"
  ],
  "redFlags": [
   "1099s not on IRS transcripts",
   "Payer is a related party or borrower-owned entity",
   "Declining income without explanation",
   "Unexplained gaps between contracts",
   "Payer not verifiable",
   "Occupancy misrepresentation"
  ],
  "pricing": "Pricing is similar to bank statement programs: FICO, LTV, DTI, reserves, occupancy and loan size drive adjusters. IO and cash-out add cost. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Travel nurse staffing agencies and nurse communities",
   "Real estate brokerages",
   "Independent insurance agency networks",
   "Consultant and freelancer groups",
   "Locum staffing agencies",
   "Gig-economy driver communities"
  ],
  "checklist": [
   "1099s for required years",
   "YTD earnings evidence",
   "IRS wage-and-income transcripts",
   "Payer VOE or contract",
   "Gap letters if applicable",
   "Income calculation worksheet",
   "Credit",
   "Reserves",
   "Appraisal",
   "ATR documentation",
   "IRS wage-and-income transcript matches every 1099 used",
   "Letter of explanation for any contract gap over 30 days",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_pl_only": {
  "matrix": [
   [
    "Min FICO",
    "660-680 floor; 700+ for 80-85% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "80-85% primary; 75% investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "75-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "70-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment where state law allows"
   ],
   [
    "Interest-only",
    "Some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above bank-statement pricing on many rate sheets due to thinner documentation (lender-specific)"
   ],
   [
    "States",
    "Available CA, NV, AZ, FL, IL with licensed preparer requirement (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm 2 years self-employment and borrower ownership percentage (usually 25%+ or 100% per program)",
   "Obtain a 12 or 24-month P&L prepared and signed by a CPA, EA, or licensed tax preparer (PTIN) - not borrower-prepared on most programs",
   "Verify the preparer's license (CA Board of Accountancy lookup, IRS EA/PTIN directory) and that the preparer is not related to the borrower",
   "Get the preparer's attestation letter: they prepared the borrower's most recent return and have no financial interest",
   "Some programs require 2-3 months of business bank statements to support the P&L revenue (deposits must reasonably match - often within 10-25%)",
   "Use net income from the P&L, multiplied by ownership percentage",
   "Compare P&L to bank statement deposits; large gaps require explanation",
   "Verify business existence (license, SOS, website)",
   "Compute DTI and reserves",
   "Document ATR"
  ],
  "incomeExample": {
   "title": "CPA-prepared 12-month P&L with bank-statement check",
   "steps": [
    "1. P&L gross revenue 12 months = $840,000",
    "2. P&L expenses = $470,000",
    "3. Net income = $370,000",
    "4. Borrower ownership 100% -> $370,000 / 12 = $30,833/mo",
    "5. Supporting check: last 2 months business deposits = $142,000 = $71,000/mo vs P&L avg revenue $70,000/mo - consistent",
    "6. Proposed PITIA (illustrative) $11,200 + other debt $1,800 = $13,000",
    "7. DTI = $13,000 / $30,833 = 42.2%"
   ],
   "result": "Qualifies at ~42% DTI; deposit check corroborates the P&L (illustrative)."
  },
  "scenarios": [
   {
    "t": "Restaurant owner with a strong recent year",
    "who": "Gina, 48, restaurant owner, Little Italy San Diego",
    "situation": "Gina's 2024 return shows a loss from a remodel, but 2025 and YTD 2026 are strong. Her CPA prepares her returns and keeps her books monthly. She wants a $1.1M home with 20% down. Restaurant bank statements are messy because of cash and card settlements.",
    "structure": "12-month CPA-prepared P&L program 80% LTV; 2 months of business statements to corroborate revenue; CPA license verified and preparer attestation in file.",
    "numbers": "Illustrative: P&L net $370K x 100% / 12 = $30,833/mo; PITIA (illustrative) $11,200 + $1,800 debts -> DTI about 42%.",
    "why": "A 12-month P&L avoids the depressed 2024 return that would sink a 2-year full-doc average. Clean CPA books are faster than analyzing card-settlement deposits. Her current earnings clearly support the payment.",
    "alternatives": "A 12-month bank-statement program was considered but the restaurant expense factor would cut income further. Full doc was rejected because the 2024 loss drags down the average.",
    "watch": "Deposit-to-P&L variance must be within lender tolerance; CPA must not be related; seasonality in the restaurant's slow months."
   },
   {
    "t": "Partner in a small engineering firm",
    "who": "Derek, 52, engineering firm co-owner (40%), Phoenix AZ",
    "situation": "Derek owns 40% of an S-corp. The firm reinvested heavily, so K-1 distributions are uneven. His CPA prepares a 24-month P&L. He wants a $750K home.",
    "structure": "24-month P&L 80% LTV; income = net x 40%.",
    "numbers": "Illustrative: 24-month net $1.2M x 40% / 24 = $20,000/mo.",
    "why": "The P&L reflects his share of current earnings rather than distributions. A 24-month view smooths project timing. CPA preparation satisfies the program.",
    "alternatives": "Full doc was considered but is depressed by reinvestment. A bank-statement program was considered but the account is shared with partners.",
    "watch": "Ownership percentage; partner consent for business funds; firm debt."
   },
   {
    "t": "E-commerce seller with platform payouts",
    "who": "Tina, 34, online store owner, Henderson NV",
    "situation": "Tina sells home goods across three marketplaces and her own site. Payouts arrive net of platform fees and returns, which makes bank-statement analysis messy. Her enrolled agent keeps monthly books and prepares her returns.",
    "structure": "12-month EA-prepared P&L 80% LTV; 2 months business statements to corroborate; inventory financing in DTI.",
    "numbers": "Illustrative: P&L net $180,000 / 12 = $15,000/mo; PITIA (illustrative) $3,600 + inventory line $900 -> DTI 30%.",
    "why": "Clean books from an EA give a clearer picture than netting platform deposits. The EA's attestation satisfies the program. DTI is comfortable.",
    "alternatives": "A bank-statement program was considered but payout netting distorts deposits. Full doc was considered but deductions lower income.",
    "watch": "Inventory line of credit; seasonal Q4 spike; platform account suspension risk."
   },
   {
    "t": "Two-location salon owner",
    "who": "Maria, 45, salon owner, Chicago IL",
    "situation": "Maria owns two salons with booth-rent and service revenue. Her CPA prepares quarterly P&Ls. She wants to refinance her home to a fixed rate.",
    "structure": "24-month CPA P&L 75% rate/term; ownership 100%.",
    "numbers": "Illustrative: net $210,000 / 12 = $17,500/mo.",
    "why": "Simple documentation avoids cash-tip complexity. 24 months shows stability. CPA prepares books regularly.",
    "alternatives": "A bank-statement program was considered but cash tips and booth rent complicate deposits. Full doc was considered but deductions lower income.",
    "watch": "Cash deposits must reconcile to the P&L; both salon leases should run at least 12 months past closing; stylist turnover can reduce booth-rent revenue."
   },
   {
    "t": "Florida pool contractor",
    "who": "Jake, 50, pool contractor, Tampa FL",
    "situation": "Jake's returns show heavy depreciation on trucks and equipment. His CPA prepares a 12-month P&L showing strong 2026 revenue. He wants an $850K home.",
    "structure": "12-month CPA P&L 80% LTV with supporting bank statements.",
    "numbers": "Illustrative: net $300,000 / 12 = $25,000/mo.",
    "why": "Returns understate cash flow due to depreciation. The P&L is simpler than add-back analysis. Supporting statements corroborate revenue.",
    "alternatives": "Full doc with add-backs was compared; P&L was simpler. A bank-statement program was considered but costs similar.",
    "watch": "Hurricane-season revenue dips; contractor license; equipment loans."
   },
   {
    "t": "Winery consultant in Temecula",
    "who": "Paula, 55, consultant, Temecula",
    "situation": "Paula consults for Temecula Valley wineries and receives a mix of checks and ACH. Her CPA prepares a P&L showing $150K net. She wants to buy a $700K home.",
    "structure": "12-month CPA P&L 80% LTV.",
    "numbers": "Illustrative: $12,500/mo; PITIA (illustrative) $4,300 -> DTI 38%.",
    "why": "Straightforward documentation fits her simple business. The CPA can attest to the P&L. DTI is comfortable.",
    "alternatives": "A 1099 program was considered but not all clients issue 1099s. Full doc was considered but deductions lower income.",
    "watch": "Client concentration; CPA independence; P&L-to-deposit variance."
   }
  ],
  "qa": [
   {
    "q": "Who can prepare the P&L?",
    "a": "A CPA, EA or licensed tax preparer, per program. Borrower-prepared P&Ls are usually not allowed (lender-specific)."
   },
   {
    "q": "Are supporting bank statements required?",
    "a": "Many programs require 2-3 months of business statements to corroborate P&L revenue. Deposits should reasonably match."
   },
   {
    "q": "What if deposits don't match the P&L?",
    "a": "Variance beyond the lender's tolerance requires an explanation. It may push the file to a different program."
   },
   {
    "q": "Is it QM?",
    "a": "No. P&L-only is non-QM, so ATR must be documented."
   },
   {
    "q": "12 or 24 months?",
    "a": "Lender-specific. 24 months smooths seasonality and may price better."
   },
   {
    "q": "Can the preparer be a relative?",
    "a": "No. The preparer must be independent with no financial interest in the business."
   },
   {
    "q": "Can it be used for investment purchases?",
    "a": "Yes on most programs. Investment LTV caps are usually lower."
   },
   {
    "q": "Is an audited P&L required?",
    "a": "No. A prepared and signed P&L suffices on most programs."
   }
  ],
  "aeQuestions": [
   "Who may prepare the P&L?",
   "Are supporting bank statements required?",
   "What variance tolerance between deposits and P&L revenue?",
   "12 or 24 months?",
   "LTV caps?",
   "Do you require preparer attestation language?",
   "What variance between P&L revenue and bank deposits do you tolerate?",
   "What attestation language must the preparer sign?",
   "Do you allow EAs and PTIN-only preparers or only CPAs?"
  ],
  "redFlags": [
   "Preparer license not verifiable",
   "Preparer related to borrower",
   "P&L revenue far above deposits",
   "Round numbers or templated P&L",
   "Business not verifiable",
   "Borrower-prepared P&L passed off as CPA-prepared"
  ],
  "pricing": "P&L-only pricing can be slightly higher than bank statement due to thinner documentation; FICO, LTV, DTI and occupancy drive adjusters. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "CPAs and EAs with small-business clients",
   "Restaurant and salon owner groups",
   "E-commerce seller communities",
   "Contractor associations",
   "Chambers of commerce"
  ],
  "checklist": [
   "Signed CPA/EA P&L",
   "Preparer license verification",
   "Preparer attestation letter",
   "Supporting bank statements",
   "Ownership documentation",
   "Business verification",
   "Income calc",
   "Credit",
   "Reserves",
   "Appraisal",
   "Preparer license or PTIN verified and independence confirmed",
   "P&L revenue vs supporting deposits variance calculated",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_asset_depletion": {
  "matrix": [
   [
    "Min FICO",
    "660-700 floor; 720+ for 80% LTV or $2M+ (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-70%; some prohibit cash-out with pure depletion (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $3-5M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% using depletion income plus any documented income (lender-specific)"
   ],
   [
    "Reserves",
    "Required reserves are usually carved out before dividing; some programs allow overlap (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On business-purpose investment loans where state law allows"
   ],
   [
    "Interest-only",
    "Often available"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; some agency/jumbo programs have narrower asset-based options (verify)"
   ],
   [
    "States",
    "Widely available CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Inventory every eligible asset with 2-3 months of complete statements: checking, savings, money market, brokerage, vested retirement, sometimes trust assets with full access",
   "Exclude ineligible assets: business accounts (often), 529 plans, assets pledged or margined, unvested RSUs, crypto not converted and seasoned (lender-specific)",
   "Apply haircuts: cash 100%; stocks/bonds/mutual funds 70-100%; retirement 60-70% if under 59.5, 70-100% if over (lender-specific)",
   "Net out margin loans and 401k loans",
   "Subtract funds to close (down payment, closing costs) and required reserves from the eligible total",
   "Divide net eligible assets by the program divisor (commonly 60, 84, 120 or 360 months - lender-specific)",
   "Add documented income (Social Security, pension, part-time W-2) if available",
   "Source any large deposits in the statement period",
   "Confirm borrower has unrestricted access to assets (trust certification if held in trust)",
   "Compute DTI; check residual income if the lender requires",
   "Document ATR and the borrower's plan to fund payments",
   "Close and fund"
  ],
  "incomeExample": {
   "title": "Retired couple using depletion plus Social Security",
   "steps": [
    "1. Brokerage $2,400,000 x 70% haircut = $1,680,000",
    "2. IRA $1,000,000 x 100% (borrowers over 59.5) = $1,000,000",
    "3. Checking/savings $200,000 x 100% = $200,000",
    "4. Total eligible = $2,880,000",
    "5. Less funds to close $450,000 and 12 months reserves $120,000 = $2,310,000",
    "6. Divide by 84 months (lender-specific divisor) = $27,500/mo",
    "7. Add Social Security for both spouses $3,200 = $30,700/mo",
    "8. PITIA (illustrative) $9,800 + auto lease $500 = $10,300 -> DTI = 33.6%"
   ],
   "result": "Qualifies at ~34% DTI without selling the brokerage portfolio; a 360-month divisor would yield only $6,417 + $3,200 and fail - divisor choice is decisive (illustrative)."
  },
  "scenarios": [
   {
    "t": "Retired couple downsizing to Carlsbad",
    "who": "Robert, 68, retired engineer, Carlsbad",
    "situation": "Robert and his wife sold their engineering firm five years ago and live on Social Security and portfolio withdrawals. They have about $3.6M across brokerage, IRAs and cash. They want a $1.6M single-level home without realizing more capital gains. Their tax returns show modest income.",
    "structure": "Asset depletion 70-75% LTV, 84-month divisor if available; reserves carved out first; Social Security added.",
    "numbers": "Illustrative: about $30,700/mo qualifying income vs about $10,300 obligations -> DTI about 34%.",
    "why": "Assets qualify them without selling positions and triggering capital gains. Their returns understate their real ability to pay. A short divisor makes the math work.",
    "alternatives": "A cash purchase was considered but would trigger large capital gains. Full doc was considered but returns show low income; a portfolio bank asset-based option was also compared.",
    "watch": "Haircut assumptions; IRA access; ATR documentation of how payments will be funded."
   },
   {
    "t": "Tech founder after acquisition",
    "who": "Nina, 39, startup founder after acquisition, San Diego",
    "situation": "Nina's startup was acquired 8 months ago and she received $5M after taxes. She is between ventures with no W-2. She wants a $2.2M home with 25% down. The acquisition proceeds sit in a money-market account.",
    "structure": "Asset depletion 75% LTV; acquisition proceeds sourced with closing statement.",
    "numbers": "Illustrative: eligible $5M - $650K to close - $150K reserves = $4.2M / 84 = $50,000/mo.",
    "why": "Assets are her clear strength while she has no current income. Sourcing the deposit with closing documents satisfies underwriting. 25% down keeps pricing reasonable.",
    "alternatives": "A bank-statement program was considered but she has no ongoing business. Full doc was considered but she has no current income.",
    "watch": "Large-deposit sourcing; any remaining tax liability reserved; future income plans."
   },
   {
    "t": "Widow with inherited trust",
    "who": "Susan, 67, widow, La Jolla",
    "situation": "Susan inherited $2M in a trust from her husband. Her own income is Social Security of $2,800/mo. She wants to buy a $1.2M condo. The trust gives her full access as trustee.",
    "structure": "Asset depletion 75% LTV with trust certification confirming access.",
    "numbers": "Illustrative: $2M x 85% average haircut = $1.7M - $350K to close = $1.35M / 84 = $16,071 + $2,800.",
    "why": "No job income is needed. Trust certification confirms her access. Depletion income easily covers payments.",
    "alternatives": "A portfolio bank was considered and may offer relationship pricing. A cash purchase was considered but would reduce liquidity.",
    "watch": "Trust certification must show she is trustee with full access; probate must be closed or assets distributed; condo HOA must pass the lender's project review."
   },
   {
    "t": "Retired physician buying a second home",
    "who": "Frank, 72, retired physician, Scottsdale AZ",
    "situation": "Frank has $4M in IRAs and takes required minimum distributions. He wants a $1.5M second home in Coronado. His RMD income alone would not qualify him for both homes.",
    "structure": "Asset depletion second home 75% LTV; IRA counted at 100% because he is over 59.5.",
    "numbers": "Illustrative: $4M / 84 = $47,600/mo.",
    "why": "Depletion income supports both homes. IRA access over 59.5 avoids haircuts. It avoids a large taxable IRA withdrawal.",
    "alternatives": "A cash purchase was considered but would require a large taxable IRA withdrawal. Full doc was considered but RMD income is too low.",
    "watch": "Second-home certification and no rental agreements; 2 months of complete IRA statements; tax advisor input on RMDs before relying on depletion income."
   },
   {
    "t": "Early retiree under 59.5",
    "who": "Lisa, 52, early retiree, Henderson NV",
    "situation": "Lisa retired at 50 with $2.5M in brokerage and 401k. She wants a $900K home. Her retirement accounts face a haircut because she is under 59.5.",
    "structure": "Asset depletion 75% LTV; retirement at 60-70% haircut.",
    "numbers": "Illustrative: brokerage $1.5M x 70% + 401k $1M x 60% = $1.65M - $250K = $1.4M / 84 = $16,667/mo.",
    "why": "She has no earned income, so depletion is the path. Even with haircuts, assets support the payment. Depletion avoids early withdrawals.",
    "alternatives": "Full doc was considered but she has no income. A cash purchase was considered but would reduce liquidity.",
    "watch": "Under-59.5 haircut; early-withdrawal penalties; market volatility."
   },
   {
    "t": "Crypto investor converting to cash",
    "who": "Mike, 35, investor, Miami FL",
    "situation": "Mike has $3M in crypto and converted $1.5M to USD in a bank account 3 months ago. He wants a $1M condo. Lenders generally do not count unconverted crypto.",
    "structure": "Asset depletion 70% LTV using converted and seasoned USD only (lender-specific).",
    "numbers": "Illustrative: $1.5M - $350K = $1.15M / 84 = $13,690/mo.",
    "why": "Converted funds qualify without traditional income. Seasoned USD satisfies sourcing. It avoids selling more crypto.",
    "alternatives": "A bank-statement program was considered but he has no business. Full doc was considered but he has no W-2.",
    "watch": "Crypto conversion seasoning; exchange statements as source; condo review."
   }
  ],
  "qa": [
   {
    "q": "What divisor is used?",
    "a": "Programs use 60, 84, 120 or 360 months. The divisor dramatically changes qualifying income (lender-specific)."
   },
   {
    "q": "What haircuts apply?",
    "a": "Cash 100%, stocks and bonds 70-100%, retirement 60-70% under 59.5 and higher over 59.5 (lender-specific). Margin loans are subtracted."
   },
   {
    "q": "Can reserves overlap with depletion assets?",
    "a": "Usually reserves are carved out first. Some programs allow overlap (lender-specific)."
   },
   {
    "q": "Can crypto be used?",
    "a": "Usually only after conversion to USD and seasoning. Exchange statements are needed as the source (lender-specific)."
   },
   {
    "q": "Is there an agency equivalent?",
    "a": "Agency programs have narrow asset-as-income options. Non-QM depletion is broader (verify)."
   },
   {
    "q": "Can it be used for investment purchases?",
    "a": "Yes on many programs. LTV caps are usually lower."
   },
   {
    "q": "Is it QM?",
    "a": "Typically non-QM. The lender documents ATR."
   },
   {
    "q": "Can depletion be combined with other income?",
    "a": "Yes, Social Security, pension or W-2 can be added. This often improves DTI."
   },
   {
    "q": "Are trust assets eligible?",
    "a": "Yes if the borrower has full, unrestricted access. A trust certification is required (lender-specific)."
   }
  ],
  "aeQuestions": [
   "What divisor do you use and does it vary by age or LTV?",
   "What haircuts apply by asset type and age?",
   "Are reserves carved out or allowed to overlap?",
   "Do you accept crypto and with what seasoning?",
   "What are LTV caps by loan size?",
   "Can depletion be combined with W-2 or Social Security?",
   "Do you require reserves on top of depletion assets for second homes and investment properties?",
   "Do you carve out reserves first or allow overlap with depletion assets?",
   "How do you treat crypto, margin loans and 401k loans?"
  ],
  "redFlags": [
   "Assets borrowed or pledged as collateral elsewhere",
   "Recently deposited funds without source",
   "Assets not in borrower's name",
   "Assets transferred from third party shortly before application",
   "Restricted trust assets",
   "Occupancy misrepresentation"
  ],
  "pricing": "Pricing depends on LTV, FICO, loan size, divisor program and occupancy. A shorter divisor may carry higher pricing; compare total cost. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Wealth managers and RIAs",
   "Estate attorneys and trust officers",
   "Retirement planners",
   "Business brokers (post-sale owners)",
   "CPAs with high-net-worth retirees",
   "Retiree communities and downsizing seminars"
  ],
  "checklist": [
   "2-3 months complete asset statements",
   "Haircut and depletion calculation worksheet",
   "Large deposit sourcing",
   "Trust certification if applicable",
   "Other income documentation",
   "Credit",
   "Reserves carve-out",
   "Appraisal",
   "ATR documentation",
   "Occupancy certification",
   "Depletion worksheet showing haircuts, carve-outs and divisor",
   "Access confirmation for trust or retirement assets",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_wvoe": {
  "matrix": [
   [
    "Min FICO",
    "660-680 floor; 700+ for 80% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "75-80% primary; 70-75% second/investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "65-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment where state law allows"
   ],
   [
    "Interest-only",
    "Some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above full-doc agency; similar to other alt-doc (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm the borrower is a W-2 employee and not related to the employer or an owner (25%+ owners are ineligible on most programs)",
   "Order the Fannie Form 1005 (or lender form) directly from HR/payroll - never through the borrower",
   "Verify the HR contact independently: company website, phone directory, Secretary of State, LinkedIn; call the main switchboard",
   "Collect 2 years employment history with no unexplained gaps",
   "Obtain 1-2 recent paystubs or bank statements showing payroll deposits as corroboration (lender-specific)",
   "Use base income from the WVOE; overtime, bonus and commission need 2-year history on the form",
   "Run a verbal VOE within 10 days of closing",
   "Some programs prohibit tax transcripts being pulled at all; others pull and ignore - know why the borrower wants WVOE",
   "Compute DTI and reserves",
   "Document ATR reasoning"
  ],
  "incomeExample": {
   "title": "WVOE income with variable pay",
   "steps": [
    "1. WVOE base salary $96,000/yr = $8,000/mo",
    "2. Overtime: 2024 $18,000, 2025 $22,000, YTD 2026 $17,000 (9 months) - 2-yr avg $20,000 = $1,667/mo",
    "3. Total qualifying = $9,667/mo",
    "4. Paystub/bank deposits corroborate net pay consistent with WVOE",
    "5. PITIA (illustrative) $3,800 + debts $600 = $4,400",
    "6. DTI = $4,400 / $9,667 = 45.5%"
   ],
   "result": "Qualifies under a 50% cap using WVOE income (illustrative)."
  },
  "scenarios": [
   {
    "t": "Employee with side-business losses",
    "who": "Mike, 46, outside sales rep (W-2), Temecula",
    "situation": "Mike earns a $96K base plus overtime as a W-2 outside sales rep. His last two returns include a Schedule C side business that lost $18K a year, plus large unreimbursed expenses. Under full doc those losses would reduce his qualifying income. He wants a $720K home with 20% down.",
    "structure": "WVOE-only 80% LTV; Form 1005 sent directly to HR; 2 recent paystubs corroborate; verbal VOE within 10 days of closing.",
    "numbers": "Illustrative: base $8,000 + 2-yr OT avg $1,667 = $9,667/mo; PITIA (illustrative) $3,800 + $600 debts -> DTI 45.5%.",
    "why": "WVOE programs qualify on employer-verified wages and do not deduct the side-business losses. His employment is long-term and easy to verify. 80% LTV keeps him in a reasonable pricing tier.",
    "alternatives": "Full-doc conventional was considered, but the Schedule C losses push DTI over 50%. Closing the side business and waiting 1-2 years was considered but delays the purchase.",
    "watch": "Confirm he has no ownership interest in his employer; side business must not be the source of funds; verbal VOE before funding."
   },
   {
    "t": "Divorce delayed tax filing",
    "who": "Jessica, 38, hospital administrator, Las Vegas NV",
    "situation": "Jessica's latest return is on extension while her divorce settlement finalizes. Her W-2 job has been stable for 9 years at $110K base. She needs to buy before her lease ends in 60 days. The decree is final; only the tax filing is pending.",
    "structure": "WVOE-only 75% LTV; final divorce decree in file for support obligations; extension (Form 4868) in file.",
    "numbers": "Illustrative: $9,167/mo income; PITIA (illustrative) $3,000; DTI 33%.",
    "why": "WVOE does not need the unfiled return, so she can close before the lease ends. Her long tenure makes employer verification simple. The decree shows no support she must pay.",
    "alternatives": "Full-doc conventional was considered but would wait for transcripts of the current year. Renting month-to-month was considered but costs more.",
    "watch": "Any IRS balance due on the extension; decree terms; verbal VOE."
   },
   {
    "t": "H-1B engineer with one filed return",
    "who": "Ravi, 34, software engineer (H-1B), Phoenix AZ",
    "situation": "Ravi has 2 years of US W-2 income but only one filed US return because he arrived mid-year. His employer's HR completes VOEs routinely. He wants a $500K home with 20% down. His visa was recently extended for 3 years.",
    "structure": "WVOE-only 80% LTV with non-permanent-resident documentation (visa, I-797) per lender rules; paystubs corroborate.",
    "numbers": "Illustrative: base $150,000 / 12 = $12,500; PITIA (illustrative) $3,200 -> DTI 30%.",
    "why": "WVOE avoids the short US return history. His visa status and employer are easy to verify. He keeps his savings rather than putting more down.",
    "alternatives": "Conventional full doc was considered and may be possible with lender overlays. FHA is not available to non-permanent residents since ML 2025-09.",
    "watch": "Visa validity; continuance of employment; lender non-permanent-resident overlay."
   },
   {
    "t": "Office manager at a small company",
    "who": "Teresa, 42, office manager, Chicago IL",
    "situation": "Teresa works for a 12-person company where the owner signs payroll and is the only HR contact. She is not related to the owner. She earns $70K and wants a $280K condo.",
    "structure": "WVOE 75% LTV with independent verification of the owner's identity and business (SOS, website, phone directory); paystubs corroborate.",
    "numbers": "Illustrative: $5,833/mo; PITIA (illustrative) $2,100; DTI 40%.",
    "why": "WVOE simplifies documentation for a steady employee. Independent verification controls the small-employer fraud risk. Her low payment ratio keeps the file clean.",
    "alternatives": "Full doc was also possible but required returns she has not organized. FHA was considered but the condo is not FHA-approved.",
    "watch": "Related-party screening; owner-signed VOE must be verified independently; condo eligibility."
   },
   {
    "t": "Restaurant GM with tips and bonus",
    "who": "Andre, 37, restaurant general manager, Miami FL",
    "situation": "Andre's W-2 includes reported tips and quarterly bonuses. His itemized deductions complicate returns. He wants a $400K condo with 20% down. He has 4 years with the same restaurant group.",
    "structure": "WVOE 80% LTV with 2-year bonus history on the form; paystubs show tips.",
    "numbers": "Illustrative: base $65,000 + bonus $20,000 avg = $7,083/mo; PITIA (illustrative) $2,700; DTI 43%.",
    "why": "WVOE shows each income component clearly. His tenure supports continuance. 80% LTV avoids PMI.",
    "alternatives": "Full doc was considered but itemized deductions complicate review. FHA was considered but the condo is not FHA-approved.",
    "watch": "Tips must appear on paystubs and the WVOE consistently across 2 years; condo must pass the lender project review; Florida HOA insurance increases can raise dues before closing."
   },
   {
    "t": "Contractor employee buying a second home",
    "who": "Bill, 50, defense contractor program manager and Army veteran, San Diego",
    "situation": "Bill wants a $500K second home in Lake Havasu. VA loans are for primary residences only. His W-2 income is $140K.",
    "structure": "WVOE 75% second home; second-home occupancy certification.",
    "numbers": "Illustrative: $11,667/mo; PITIA second home (illustrative) $2,800 + primary $3,400 -> DTI 53% - too high, so 70% LTV chosen -> DTI 49%.",
    "why": "WVOE allows quick documentation. Second-home occupancy is allowed. Lower LTV keeps DTI under the cap.",
    "alternatives": "Conventional second home full doc was considered. VA was not eligible for a second home.",
    "watch": "Second home must be a reasonable distance from his primary and not rented full-time; DTI must stay under the cap including both housing payments; verbal VOE before funding."
   }
  ],
  "qa": [
   {
    "q": "Who completes the WVOE?",
    "a": "The employer's HR or payroll department, sent directly to the lender or broker. It must never pass through the borrower's hands."
   },
   {
    "q": "Can a business owner use a WVOE program?",
    "a": "No. Owners (often 25% or more) and relatives of owners are ineligible because they could complete their own verification."
   },
   {
    "q": "Are paystubs required?",
    "a": "Many programs require 1-2 recent paystubs or bank statements showing payroll deposits to corroborate the WVOE (lender-specific). Deposits that don't match the reported net pay are a red flag."
   },
   {
    "q": "Are tax returns used?",
    "a": "Many WVOE programs do not use returns at all, and some do not pull transcripts. Confirm the lender policy before submitting, because a transcript showing different income can still create a conflict the underwriter must resolve."
   },
   {
    "q": "Can overtime or bonus count?",
    "a": "Yes, when the WVOE shows a 2-year history of that pay type. The lender averages it and uses the lower figure if YTD is trending down."
   },
   {
    "q": "Is it QM?",
    "a": "No. WVOE-only is non-QM, so the lender must document the ATR factors without the QM presumption."
   },
   {
    "q": "What is the main fraud risk?",
    "a": "Fabricated employers or HR contacts. Always verify the employer and HR contact independently through the company website, Secretary of State records and a call to the main switchboard."
   },
   {
    "q": "Can it be used for investment purchases?",
    "a": "Yes on most programs, with a business-purpose and non-owner-occupancy certification. Investment LTV caps are usually 5-10 points lower than primary."
   }
  ],
  "aeQuestions": [
   "Which WVOE form do you accept?",
   "Do you require paystubs or bank statements to corroborate?",
   "How do you verify the HR contact?",
   "What ownership/relation limits apply?",
   "What are LTV caps?",
   "Do you pull tax transcripts?",
   "Which WVOE form do you accept (Fannie 1005 or your own), and must it come directly from HR?",
   "Do you pull IRS transcripts at all on WVOE files?",
   "Do you accept WVOE for non-permanent residents and what visa documents do you require?"
  ],
  "redFlags": [
   "HR contact email on a free domain",
   "Employer not verifiable online",
   "Borrower is related to employer",
   "Paystub deposits not matching WVOE",
   "WVOE returned via borrower",
   "Recent job changes without explanation"
  ],
  "pricing": "Pricing depends on FICO, LTV, DTI and occupancy; WVOE often prices in line with other alt-doc programs. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Employees with complex returns",
   "Divorce attorneys (borrowers awaiting returns)",
   "HR directors",
   "CPAs",
   "Sales professionals"
  ],
  "checklist": [
   "WVOE form from HR",
   "HR contact verification",
   "Paystubs or bank statements",
   "Verbal VOE",
   "Credit",
   "Reserves",
   "Appraisal",
   "Income calc",
   "ATR",
   "Occupancy cert",
   "Independent verification of employer and HR contact (website, SOS, switchboard call) documented",
   "Confirmation borrower holds no ownership and no family relation to employer",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_dscr": {
  "matrix": [
   [
    "Min FICO",
    "620-660 floor; 700-720+ for 80% LTV and sub-1.00 DSCR (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "75-80% at DSCR 1.00+; 70-75% at DSCR under 1.00 (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "75-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "70-75%; lower for first-time investors or DSCR under 1.00 (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$75K-$100K minimum to $2-3M+ (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "No personal DTI; DSCR minimum 1.00-1.25 standard, 0.75 or no-ratio at reduced LTV (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months PITIA of subject; extra for each financed REO on some programs; cash-out often eligible (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "BK/FC/SS 2-4 years; shorter at lower LTV (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable and non-warrantable condo, 2-4 unit; rural and acreage restricted"
   ],
   [
    "Occupancy",
    "Investment only; business-purpose and non-owner-occupancy certifications required"
   ],
   [
    "Prepayment penalty (investor)",
    "3-5 year step-down (5/4/3/2/1 or 3/2/1) or fixed %; buydown to no-prepay costs price; IL individual borrowers restricted (entity vesting often used), and AK, KS, MI, MN, NM, OH, RI and others have limits - lender state matrices govern (verify)"
   ],
   [
    "Interest-only",
    "Common, 10-yr IO; DSCR may be calculated on IO payment at some lenders (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above agency investment pricing; first-time investor, low DSCR, short prepay and small loan size each add cost (lender-specific)"
   ],
   [
    "States",
    "All five of Steven's states; CA DRE business-purpose loans may require MLDS (RE 882) (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm business purpose and that no borrower or relative will occupy; get signed business-purpose and occupancy certifications",
   "Decide vesting: individual or LLC/corporation; LLC requires articles, operating agreement, EIN, good standing and personal guaranty",
   "Determine experienced vs first-time investor (many lenders define experience as owning/managing a rental 12+ months in last 3 years)",
   "Pull credit for all guarantors; mid score of the primary guarantor usually used",
   "Order appraisal with Form 1007 rent schedule (1-unit) or 1025 (2-4 units)",
   "Determine qualifying rent: lower of lease and market rent, or lease up to 110-120% of market with 2-3 months receipt (lender-specific)",
   "Calculate PITIA: P&I (or IO payment if allowed), taxes, insurance, flood, HOA",
   "Compute DSCR = qualifying rent / PITIA",
   "Select prepay structure that fits the investor's hold plan and the state rules",
   "Verify reserves and funds to close",
   "Review title for vesting and existing liens; for refinances, check seasoning (often 6-12 months for cash-out on appraised value)",
   "Business-purpose loans are exempt from TRID and ATR; CA MLDS and broker disclosures still apply (verify)",
   "Close with entity signature blocks and personal guaranty"
  ],
  "incomeExample": {
   "title": "DSCR calculation on a Temecula rental",
   "steps": [
    "1. Market rent from 1007 = $3,400/mo; signed lease $3,500 - use lower = $3,400",
    "2. Purchase $640,000; 75% LTV loan $480,000",
    "3. P&I (illustrative) = $3,100",
    "4. Taxes (about 1.1% Riverside County plus Mello-Roos/CFD where applicable) = $680",
    "5. Insurance = $160; HOA = $85",
    "6. PITIA = $3,100 + $680 + $160 + $85 = $4,025",
    "7. DSCR = $3,400 / $4,025 = 0.84 - below 1.00",
    "8. Option A: 70% LTV -> loan $448,000 -> P&I ~$2,895 -> PITIA $3,820 -> DSCR 0.89",
    "9. Option B: 10-yr IO (if lender calculates on IO) -> IO payment ~$2,700 -> PITIA $3,625 -> DSCR 0.94; still needs sub-1.00 program",
    "10. Option C: different property with lower CFD tax"
   ],
   "result": "In Temecula, Mello-Roos taxes often push DSCR under 1.00; Steven compares sub-1.00 programs, larger down payment, or IO before the investor writes the offer (illustrative)."
  },
  "scenarios": [
   {
    "t": "First-time investor buying in Temecula",
    "who": "Brandon, 34, firefighter, Murrieta",
    "situation": "Brandon owns his home and wants to buy his first rental in Temecula. His W-2 income is strong but he wants to scale with DSCR so future purchases don't load his DTI. The target house has Mello-Roos. He has no landlord history.",
    "structure": "DSCR 75% LTV first-time investor tier; compare to conventional investment full doc; run DSCR before he writes offers.",
    "numbers": "Illustrative: DSCR 0.84 at 75% LTV; conventional investment uses 75% of rent as income against his DTI.",
    "why": "DSCR keeps future DTI capacity open and allows LLC vesting. Running the ratio before offers avoids surprises. Comparing with conventional ensures he pays the lowest total cost.",
    "alternatives": "Conventional investment was considered and may be cheaper for the first property. A larger down payment was considered to raise DSCR.",
    "watch": "First-time investor overlays; Mello-Roos taxes lowering DSCR; reserves."
   },
   {
    "t": "Investor at the agency 10-property limit",
    "who": "Patricia, 51, investor, Chula Vista",
    "situation": "Patricia owns 10 financed rentals and can't get another agency loan. She wants to buy a $750K duplex in National City. She vests in an LLC.",
    "structure": "DSCR 2-unit 75% LTV LLC vesting with personal guaranty; 5-year step-down prepay.",
    "numbers": "Illustrative: rent $2,400 x 2 = $4,800; PITIA (illustrative) $4,100 -> DSCR 1.17.",
    "why": "DSCR has no financed-property cap. The duplex's rent covers the payment. LLC vesting protects her liability.",
    "alternatives": "A portfolio bank blanket loan was considered. A conventional loan was not possible beyond 10 properties.",
    "watch": "LLC articles, operating agreement, EIN and good standing; reserves meeting per-property requirements across all 11 financed rentals; prepay term matching her hold plan."
   },
   {
    "t": "Illinois investor needing prepay flexibility",
    "who": "Marcus, 40, IT manager, Naperville IL",
    "situation": "Marcus wants to buy a $500K 3-flat in Chicago. He expects to refinance in 2 years. Illinois restricts prepayment penalties for individual borrowers.",
    "structure": "DSCR 75% LTV; vest in LLC to allow prepay where lender permits, or buy out prepay; compare total cost over a 2-year hold.",
    "numbers": "Illustrative: no-prepay pricing vs 3-year prepay plus expected refinance cost.",
    "why": "It allows a flexible exit. Comparing both structures shows the cheapest total cost for his 2-year plan. LLC vesting may open prepay options.",
    "alternatives": "Conventional was considered but DTI limits apply. A bank portfolio loan was considered but required full financials.",
    "watch": "Illinois prepay rules (verify); entity vesting costs; refinance timing."
   },
   {
    "t": "Cash-out to fund the next purchase",
    "who": "Kim, 47, nurse, Henderson NV",
    "situation": "Kim owns a free-and-clear rental worth $500K. She wants $350K cash to buy another property. Her W-2 income would make a conventional cash-out tight. The rental has a 2-year lease history.",
    "structure": "DSCR cash-out 70% LTV.",
    "numbers": "Illustrative: $350K loan; rent $2,600 vs PITIA (illustrative) $2,500 -> DSCR 1.04.",
    "why": "No personal income documentation is needed. Cash-out funds the next purchase. Lease history supports rent.",
    "alternatives": "A HELOC was considered but has a variable rate. A conventional cash-out was considered but DTI was tight.",
    "watch": "Title ownership seasoning (often 6 months) for cash-out; reserves after cash-out; DSCR of 1.04 leaves little margin if taxes or insurance rise."
   },
   {
    "t": "BRRRR refinance",
    "who": "Jose, 36, contractor, Phoenix AZ",
    "situation": "Jose bought a distressed house for $280K cash, renovated for $60K, and it now appraises at $450K. He wants to pull cash out. He has owned it 7 months.",
    "structure": "DSCR cash-out 75% LTV on appraised value after 6-month seasoning (lender-specific).",
    "numbers": "Illustrative: $337,500 loan; rent $2,300 vs PITIA (illustrative) $2,200.",
    "why": "It recovers capital for the next deal. Appraised value after renovation is used. DSCR avoids DTI.",
    "alternatives": "Hard money was considered but expensive. A conventional cash-out was considered but seasoning rules were stricter.",
    "watch": "Six-month seasoning measured to the note date; receipts and permits for $60K of renovations; appraisal comps must support the $450K value."
   },
   {
    "t": "Tampa rental with rising insurance",
    "who": "Diane, 55, retired school administrator, Tampa FL",
    "situation": "Diane wants a 3-bed rental in Tampa as part of her retirement plan. Premiums in her target zip code have roughly doubled, and the house sits in a flood zone. Her retirement income is modest on paper.",
    "structure": "DSCR 75% LTV; bound insurance quote (wind and flood) before the offer.",
    "numbers": "Illustrative: rent $2,500 vs PITIA $2,450 -> DSCR 1.02.",
    "why": "DSCR ignores her personal DTI. Real insurance quotes make PITIA accurate. Her rental plan supports retirement.",
    "alternatives": "Conventional investment was considered but DTI was tight. A cash purchase was considered but would consume liquidity.",
    "watch": "Insurance renewals can push DSCR under 1.00 after closing; flood elevation certificate; reserves."
   },
   {
    "t": "Marine veteran adding a first rental",
    "who": "Antonio, 44, Marine veteran and logistics supervisor, Oceanside",
    "situation": "Antonio has a VA loan on his Oceanside home and wants to keep that low payment. He wants to buy a rental in Vista. Adding a rental at full DTI would limit future borrowing. He has $160K saved.",
    "structure": "DSCR 75% LTV, first-time investor tier; compared to conventional investment.",
    "numbers": "Illustrative: $700K purchase; rent $3,000 vs PITIA $2,850 -> DSCR 1.05.",
    "why": "DSCR keeps his DTI clean for a future move-up. VA can't be used for pure investment. Comparing options ensures lowest total cost.",
    "alternatives": "Conventional investment was considered and may price better. VA second use was considered but requires owner occupancy.",
    "watch": "First-time investor reserves; keeping VA loan current; landlord insurance."
   }
  ],
  "qa": [
   {
    "q": "How is DSCR calculated?",
    "a": "Qualifying rent divided by PITIA (principal, interest, taxes, insurance, HOA, flood). Some lenders use IO payment on IO loans."
   },
   {
    "q": "Which rent is used?",
    "a": "Usually the lower of lease or market rent, or lease up to a percentage of market with receipts (lender-specific). Vacant purchases use the 1007."
   },
   {
    "q": "Can the borrower occupy the property?",
    "a": "No. It must be investment only; misrepresentation is fraud."
   },
   {
    "q": "Is a DSCR loan subject to TRID or ATR?",
    "a": "Business-purpose loans are generally exempt. CA MLDS and state broker rules may still apply."
   },
   {
    "q": "What prepay structures are common?",
    "a": "3-5 year step-down or fixed percentage. Buying it out raises pricing (lender-specific)."
   },
   {
    "q": "What about Illinois prepay rules?",
    "a": "Illinois restricts prepay penalties for individual borrowers; entity vesting is common (verify). Confirm with the lender's state matrix."
   },
   {
    "q": "Can DSCR be under 1.00?",
    "a": "Some programs allow 0.75 or no-ratio at reduced LTV. Pricing is higher."
   },
   {
    "q": "Is LLC vesting required?",
    "a": "Not required, but often optional. LLC vesting requires entity docs and a personal guaranty."
   },
   {
    "q": "Can short-term rental income be used?",
    "a": "Yes, through a separate STR program. Standard DSCR uses long-term rent."
   },
   {
    "q": "How long must I own before cash-out?",
    "a": "Often 6-12 months seasoning for appraised value (lender-specific). Earlier cash-out may be limited to purchase price plus documented improvements."
   }
  ],
  "aeQuestions": [
   "What is your minimum DSCR by LTV and FICO?",
   "How do you treat first-time investors?",
   "What prepay structures are allowed in this state?",
   "Do you calculate DSCR on IO payment?",
   "What reserves are required per property?",
   "What is the cash-out seasoning requirement?",
   "What is your first-time-investor definition and overlays?",
   "Which states restrict prepay on your matrix and what entity rules apply?",
   "Do you use lease rent above market with receipts, and up to what percentage?"
  ],
  "redFlags": [
   "Borrower intends to occupy",
   "Lease is fabricated or with related party",
   "Rent schedule inflated by appraiser pressure",
   "Entity documents incomplete",
   "Undisclosed financed properties",
   "Straw buyer"
  ],
  "pricing": "DSCR pricing depends on FICO, LTV, DSCR ratio, prepay term, IO, loan size, property type and investor experience. Shorter or no prepay costs more; sub-1.00 DSCR and small loans add cost. Compare total cost over the investor's expected hold period. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Real estate investor meetups",
   "Property managers",
   "Investor-friendly agents",
   "1031 exchange intermediaries",
   "Online investor communities",
   "CPAs serving landlords",
   "Veteran investor groups"
  ],
  "checklist": [
   "Business-purpose and occupancy certifications",
   "Entity documents and personal guaranty",
   "Appraisal with rent schedule",
   "Lease agreement",
   "DSCR calculation worksheet",
   "Prepay disclosure",
   "Reserves",
   "Insurance and flood",
   "Title and vesting",
   "Credit",
   "DSCR calculated with bound insurance quote, not an estimate",
   "Prepay term matched to investor's hold plan in writing",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_dscr_str": {
  "matrix": [
   [
    "Min FICO",
    "660-680 floor; 700+ for 75-80% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-75% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "65-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$100K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "DSCR 1.00-1.25 on STR income; some apply 20-25% vacancy/expense haircut (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, condo (where STR allowed), 2-4 unit; condotels separate"
   ],
   [
    "Occupancy",
    "Investment only"
   ],
   [
    "Prepayment penalty (investor)",
    "Step-down common; state rules apply (verify)"
   ],
   [
    "Interest-only",
    "Some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above long-term DSCR pricing (lender-specific)"
   ],
   [
    "States",
    "Local STR ordinances vary: San Diego tiered licensing, Temecula permits, Las Vegas restrictions, Scottsdale/Phoenix permits, Florida HOA bans (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm local STR legality and permit availability (San Diego STRO license tiers, Clark County/Las Vegas rules, Scottsdale permit, HOA rules)",
   "Determine income source: 12-month STR history (platform statements), market data report (AirDNA or similar), or 1007 long-term rent fallback (lender-specific)",
   "Apply lender's haircut to gross STR revenue for vacancy/management (often 20-25%)",
   "Calculate PITIA including higher STR insurance",
   "Compute DSCR",
   "Verify property is furnished and listing-ready",
   "Check HOA bylaws",
   "Appraisal with 1007 and STR addendum if available",
   "Business-purpose and occupancy certifications",
   "Prepay structure selection",
   "Reserves",
   "Close"
  ],
  "incomeExample": {
   "title": "STR DSCR using market data report",
   "steps": [
    "1. AirDNA-style projected annual gross revenue = $96,000",
    "2. Lender haircut 25% (vacancy/management) = $72,000 net",
    "3. Monthly qualifying = $6,000",
    "4. PITIA (illustrative): P&I $4,200 + taxes $700 + STR insurance $350 + HOA $0 = $5,250",
    "5. DSCR = $6,000 / $5,250 = 1.14"
   ],
   "result": "Qualifies at 1.14 DSCR; long-term rent fallback ($3,800) would fail at 0.72 (illustrative)."
  },
  "scenarios": [
   {
    "t": "Mission Beach vacation rental",
    "who": "Kyle, 38, software engineer, San Diego",
    "situation": "Kyle wants to buy a $1.8M Mission Beach property whose seller holds a San Diego short-term rental license. Long-term rents would not cover the payment. The seller has 3 years of platform history. Mission Beach licenses are handled under a separate cap from the rest of the city.",
    "structure": "DSCR STR 75% LTV using the seller's 12-month platform history; confirm license transferability or new-license availability under the city ordinance before relying on STR income (verify).",
    "numbers": "Illustrative: gross $120K x 75% = $90K / 12 = $7,500 vs PITIA (illustrative) $6,800 -> DSCR 1.10; long-term rent $4,400 -> 0.65.",
    "why": "STR income qualifies where long-term rent cannot. Documented platform history is stronger than a projection. Confirming the license first keeps the file honest.",
    "alternatives": "Long-term DSCR was considered but fails at 0.65. A second-home loan was considered but he will rent it most of the year, so that occupancy would be inaccurate.",
    "watch": "License transfer rules; STR liability insurance; prepay vs his 5-year hold plan."
   },
   {
    "t": "Joshua Tree desert cabin",
    "who": "Amanda, 41, ICU nurse, Temecula",
    "situation": "Amanda wants a 2-bed cabin near Joshua Tree National Park to run as a vacation rental. San Bernardino County requires an STR permit and caps occupancy. The seller has only 7 months of booking history. Long-term rent would be about $1,700.",
    "structure": "DSCR STR 75% LTV using a market-data report (lender-specific); county permit confirmed before CTC.",
    "numbers": "Illustrative: projected gross $70,000 x 75% = $52,500 / 12 = $4,375 vs PITIA $3,300 -> DSCR 1.33.",
    "why": "Only STR income supports the payment. A market report bridges the short history. The county permit makes the income legal.",
    "alternatives": "A second-home conventional loan was considered but she won't use it enough to certify second-home occupancy. Long-term DSCR was considered but fails badly.",
    "watch": "Permit timing; summer heat seasonality; STR liability insurance."
   },
   {
    "t": "Scottsdale STR with city license",
    "who": "Ryan, 45, operations executive, Phoenix AZ",
    "situation": "Ryan is buying a 4-bed pool home in Scottsdale to run on STR platforms. Scottsdale requires a city STR license and Arizona requires TPT tax registration. He has run one STR before for 2 years.",
    "structure": "DSCR STR 75% LTV, experienced-investor tier; market-data report plus his STR history.",
    "numbers": "Illustrative: projected gross $90,000 x 75% = $67,500 / 12 = $5,625 vs PITIA $5,000 -> DSCR 1.13.",
    "why": "STR revenue far exceeds long-term rent in winter season. His experience unlocks better terms. Licensing is straightforward.",
    "alternatives": "Long-term DSCR was considered but rent $3,800 gives 0.76. Conventional investment was considered but would count against DTI.",
    "watch": "City license and TPT registration; HOA STR rules; summer occupancy dip."
   },
   {
    "t": "Las Vegas STR legality check",
    "who": "Tom, 50, investor, Henderson NV",
    "situation": "Tom wants to buy a house in Las Vegas to run as an STR. Clark County and the City of Las Vegas heavily restrict non-owner-occupied STRs with distance and licensing limits. A competing lender told him STR income would be fine.",
    "structure": "Steven checks local legality first; if an STR license can't be obtained, he structures as long-term DSCR.",
    "numbers": "Illustrative: long-term rent $2,300 vs PITIA $2,200 -> DSCR 1.05.",
    "why": "Qualifying on income that is illegal to earn would be misrepresentation. Long-term DSCR keeps the file clean. The property still cash-flows.",
    "alternatives": "DSCR STR was considered but isn't viable if unlicensable. Buying in a different jurisdiction was considered.",
    "watch": "Local ordinance changes; HOA rules; business plan must fit legal use."
   },
   {
    "t": "Orlando resort-community STR",
    "who": "Jasmine, 36, teacher, Chicago IL",
    "situation": "Jasmine wants a townhome in a Kissimmee resort community zoned for short-term rentals. The HOA permits nightly rentals and includes a management desk. She has never owned a rental.",
    "structure": "DSCR STR 70-75% LTV, first-time investor tier; 12-month history from seller's management company.",
    "numbers": "Illustrative: gross $80,000 x 75% = $60,000 / 12 = $5,000 vs PITIA $3,600 -> DSCR 1.39.",
    "why": "STR zoning makes nightly income legitimate. Management history documents revenue. Strong DSCR offsets first-time investor overlays.",
    "alternatives": "A condotel program was considered but the project isn't a condotel. Long-term DSCR was considered but gives a lower ratio.",
    "watch": "Florida insurance premiums; HOA fees; first-time investor overlays."
   },
   {
    "t": "Big Bear mountain cabin",
    "who": "Greg, 52, engineer, Carlsbad",
    "situation": "Greg wants a Big Bear cabin to rent short-term with occasional family use. Big Bear Lake requires a vacation rental permit. Winter and summer peaks drive revenue.",
    "structure": "DSCR STR 70% LTV; investment occupancy with limited personal use per lender rules.",
    "numbers": "Illustrative: gross $60,000 x 75% = $45,000 / 12 = $3,750 vs PITIA $3,200 -> DSCR 1.17.",
    "why": "STR income qualifies where long-term rent doesn't. The permit makes income legal. Limited personal use is allowed.",
    "alternatives": "A second-home loan was considered but he intends mostly rental. Long-term DSCR was considered but fails.",
    "watch": "Personal use must stay within lender limits for an investment loan; Big Bear vacation rental permit renewed annually; insurance must cover snow load and liability for guests."
   }
  ],
  "qa": [
   {
    "q": "How is STR income documented?",
    "a": "Depending on the lender: 12-month platform or management statements, a third-party market-data report, or the 1007 long-term rent as a fallback. History is stronger than projections."
   },
   {
    "q": "What haircut is applied?",
    "a": "Commonly 20-25% off gross STR revenue for vacancy and management. Market-data projections may get larger haircuts (lender-specific)."
   },
   {
    "q": "Do I need to confirm the STR is legal?",
    "a": "Yes. Verify the city/county ordinance, permit availability or transferability, and HOA rules before relying on STR income."
   },
   {
    "q": "Can the borrower use the property personally?",
    "a": "Investment loans limit personal use. Heavy personal use points to a second-home loan instead (lender-specific)."
   },
   {
    "q": "Is TRID required?",
    "a": "Business-purpose loans are generally exempt from TRID and ATR. CA MLDS and state broker disclosures can still apply."
   },
   {
    "q": "What insurance is required?",
    "a": "STR-specific coverage with liability. Standard landlord policies may exclude nightly rentals."
   },
   {
    "q": "How is seasonality handled?",
    "a": "Lenders use annualized revenue. Extremely seasonal markets may get larger haircuts."
   },
   {
    "q": "Can a seller's STR history be used?",
    "a": "Some lenders accept prior-owner history from management or platform statements (lender-specific). Confirm before relying on it."
   }
  ],
  "aeQuestions": [
   "Which STR income sources do you accept?",
   "What haircut applies?",
   "Do you require permits?",
   "Min DSCR?",
   "LTV caps?",
   "Reserves?",
   "Which STR income sources do you accept and which market-data vendors?",
   "Do you require the STR permit or license before closing?",
   "What haircut do you apply to gross STR revenue?"
  ],
  "redFlags": [
   "STR illegal locally",
   "HOA bans STR",
   "Inflated STR projections",
   "Borrower intends to occupy",
   "Insurance gaps",
   "Fake platform statements"
  ],
  "pricing": "STR pricing above long-term DSCR; LTV, FICO, DSCR, prepay drive adjusters. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "STR investor groups",
   "Vacation rental managers",
   "Resort agents",
   "AirDNA users",
   "CPAs"
  ],
  "checklist": [
   "STR permit",
   "Income documentation",
   "DSCR worksheet",
   "Insurance",
   "HOA docs",
   "Appraisal",
   "Business-purpose cert",
   "Entity docs",
   "Reserves",
   "Prepay disclosure",
   "Local STR ordinance and permit status documented with source and date",
   "STR-specific liability insurance binder",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_dscr_5to8": {
  "matrix": [
   [
    "Min FICO",
    "660-700 floor; 700-720+ for 75% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-75%; experienced investors only at many lenders (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-75% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "65-70% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$400K to $3-5M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "DSCR 1.20-1.25 typical, sometimes 1.10-1.15 at lower LTV; net operating income after vacancy, management and reserves for replacement (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months PITIA; some require capex reserve (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "3-4 years (verify)"
   ],
   [
    "Property types",
    "5-8 residential units; some allow mixed-use with limited commercial (lender-specific)"
   ],
   [
    "Occupancy",
    "Investment; LLC vesting standard"
   ],
   [
    "Prepayment penalty (investor)",
    "3-5 year step-down or yield maintenance-style; state limits (verify)"
   ],
   [
    "Interest-only",
    "Some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above 1-4 DSCR; often 30-yr fixed or 5/6 ARM with 30-yr amortization (lender-specific)"
   ],
   [
    "States",
    "CA, IL (Chicago 6-flats), AZ, NV, FL; local rent control (CA AB 1482, LA/SF ordinances) affects rent assumptions (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm 5-8 residential units and experience requirement (often owned/managed income property 2+ years)",
   "Collect rent roll and leases for every unit; reconcile to bank deposits for 3-12 months",
   "Obtain trailing 12-month operating statement (T-12) with taxes, insurance, utilities, repairs",
   "Order commercial-style or 5+ unit residential appraisal (Form 71A-type narrative or lender format)",
   "Build underwritten NOI: lower of actual or market rent, vacancy 5-10%, management 5-8%, replacement reserves $250-300/unit (lender-specific)",
   "Calculate debt service and DSCR = NOI / annual debt service",
   "Review rent control and just-cause rules (CA AB 1482 caps annual increases)",
   "Environmental questionnaire or Phase I if mixed-use",
   "Insurance including liability per unit",
   "Entity docs and personal guaranty",
   "Prepay structure",
   "Close"
  ],
  "incomeExample": {
   "title": "5-unit DSCR on NOI basis",
   "steps": [
    "1. Gross scheduled rent 5 units x $2,200 = $11,000/mo = $132,000/yr",
    "2. Vacancy 5% = $6,600 -> EGI $125,400",
    "3. Expenses: taxes $14,000, insurance $6,000, utilities $4,800, repairs $5,000, management 6% $7,524, reserves $1,500 = $38,824",
    "4. NOI = $86,576",
    "5. Annual debt service (illustrative) on $1.05M loan = $78,000",
    "6. DSCR = $86,576 / $78,000 = 1.11 - below 1.20",
    "7. Reduce loan to $950K -> debt service $70,600 -> DSCR 1.23"
   ],
   "result": "Deal works at lower leverage; at 75% LTV it misses 1.20 (illustrative)."
  },
  "scenarios": [
   {
    "t": "North Park 6-unit under rent caps",
    "who": "Elena, 48, investor, San Diego",
    "situation": "Elena owns four 1-4 unit rentals and wants a $2.1M 6-unit building in North Park. In-place rents are below market because California's AB 1482 caps annual increases for long-term tenants. She wants to vest in her existing LLC. She has 12 months of reserves across her portfolio.",
    "structure": "DSCR 5-8 at 70% LTV; NOI underwritten on actual in-place rents from the rent roll and T-12; LLC vesting with personal guaranty; 5-year step-down prepay for best pricing.",
    "numbers": "Illustrative: gross rents $156,000 - 5% vacancy - expenses $40,000 = NOI $108,200; annual debt service (illustrative) $89,000 -> DSCR 1.22.",
    "why": "Agency financing stops at 4 units, so a 5-8 program or commercial loan is required. The DSCR 5-8 program uses a residential-style process with faster closing than a bank commercial loan. Underwriting on in-place rents means the deal works even if rent growth is slow.",
    "alternatives": "A local bank commercial loan was considered but required a 1.30 DSCR and a 5-year balloon. A bridge loan to renovate and re-tenant was considered but is not legal under just-cause rules for occupied units.",
    "watch": "AB 1482 limits rent increases - no pro-forma rents; unpermitted units would kill the deal; insurance and liability for 6 units; prepay if she refinances within 5 years."
   },
   {
    "t": "Logan Square 6-flat",
    "who": "Darnell, 42, general contractor, Chicago IL",
    "situation": "Darnell owns two 2-flats and wants a $1.1M 6-flat in Logan Square that he will renovate unit by unit as leases turn over. Current rents are below market due to long-term tenants. He may refinance after renovations in about 3 years.",
    "structure": "DSCR 5-8 at 70% LTV on actual in-place rents; vest in an LLC so prepay structures are permitted under Illinois rules (verify); 3-year step-down prepay.",
    "numbers": "Illustrative: in-place NOI $90,000 vs annual debt service (illustrative) $76,000 -> DSCR 1.18; post-renovation NOI target $115,000.",
    "why": "Agency financing stops at 4 units. DSCR 5-8 avoids full commercial underwriting and global cash-flow analysis. The 3-year prepay matches his refinance timeline.",
    "alternatives": "A local bank commercial loan was considered but required more covenants and a shorter balloon. Hard money was rejected as too costly for a 3-year hold.",
    "watch": "Renovation permits; Chicago rent and tenant ordinances; prepay if refinancing early; DSCR minimum may be 1.20 at some lenders."
   },
   {
    "t": "Phoenix 8-unit near ASU",
    "who": "Sam, 55, experienced investor, Phoenix AZ",
    "situation": "Sam has owned rentals for 15 years and wants a $1.8M 8-unit near ASU. The seller's T-12 shows 92% occupancy. He wants to keep cash for interior upgrades. Student-housing demand is seasonal.",
    "structure": "DSCR 5-8 75% LTV, experienced-investor tier; 5-year step-down prepay; capex reserve held separately.",
    "numbers": "Illustrative: NOI $130,000 vs annual debt service (illustrative) $105,000 -> DSCR 1.24.",
    "why": "His experience unlocks the higher LTV tier. The program is faster than commercial underwriting. Keeping cash for upgrades supports rent growth.",
    "alternatives": "A commercial bank loan was considered but requires more covenants and annual financial reporting. A 1031 exchange into a larger asset was considered but timing didn't fit.",
    "watch": "Student-housing vacancy in summer; deferred maintenance; insurance."
   },
   {
    "t": "Las Vegas fourplex plus casita",
    "who": "Maria, 39, nurse, Las Vegas NV",
    "situation": "Maria's target is a fourplex with a permitted casita - 5 units total, which takes it out of agency eligibility. She owns one rental and was surprised her conventional lender declined. The casita is legally permitted and rented.",
    "structure": "DSCR 5-8 70% LTV; confirm casita is permitted as a legal unit; experience requirement may need exception (lender-specific).",
    "numbers": "Illustrative: NOI $62,000 vs debt service (illustrative) $50,000 -> DSCR 1.24.",
    "why": "5 units exceed agency's 1-4 definition. A 5-8 program finances the whole property as one loan. Her strong rent coverage supports approval.",
    "alternatives": "Removing the casita from unit count was considered but impossible since it is a legal unit. A commercial bank loan was considered but required more experience.",
    "watch": "Permit history; investor experience requirement; landlord insurance."
   },
   {
    "t": "Tampa 5-unit with insurance pressure",
    "who": "John, 60, retiree, Tampa FL",
    "situation": "John wants a $900K 5-unit near downtown Tampa. Florida insurance costs are high and rising. He has strong reserves and 20 years of landlord experience.",
    "structure": "DSCR 5-8 70% LTV with conservative expense assumptions; bound insurance quote before contract.",
    "numbers": "Illustrative: NOI $70,000 after $14,000 insurance vs debt service (illustrative) $57,000 -> DSCR 1.23.",
    "why": "Agency can't finance 5+ units. The DSCR program's conservative underwriting protects him from overpaying. His reserves offset insurance volatility.",
    "alternatives": "A commercial bank loan was considered but slower. A smaller 4-unit property was considered but offered less cash flow.",
    "watch": "Insurance renewal increases can drop DSCR below 1.20; flood zone determination and policy; wind mitigation inspection to lower premiums."
   },
   {
    "t": "Temecula 5-unit with vacancy",
    "who": "Sean, 50, investor, Temecula",
    "situation": "Sean wants a $1.2M 5-unit property near Old Town Temecula. The rent roll shows one vacant unit. He has 10 years of landlord history.",
    "structure": "DSCR 5-8 70% LTV; vacant unit underwritten at market rent with vacancy factor (lender-specific).",
    "numbers": "Illustrative: NOI $78,000 vs debt service (illustrative) $64,000 -> DSCR 1.22.",
    "why": "Agency can't finance 5+ units. His experience satisfies program requirements. The vacancy factor already accounts for lease-up risk.",
    "alternatives": "A commercial bank loan was considered but requires more documentation. A bridge loan was considered but costlier.",
    "watch": "Lease-up of vacant unit; rent roll reconciliation; Mello-Roos taxes."
   }
  ],
  "qa": [
   {
    "q": "Why is 5-8 unit financing different from 1-4 unit DSCR?",
    "a": "Properties with 5+ units are commercial-style collateral. Lenders underwrite net operating income from a rent roll and T-12 rather than a simple rent/PITIA ratio."
   },
   {
    "q": "How is NOI calculated?",
    "a": "Effective gross income (scheduled rents less vacancy) minus operating expenses such as taxes, insurance, owner-paid utilities, repairs, management and replacement reserves. Debt service is not an operating expense."
   },
   {
    "q": "What DSCR minimum is typical?",
    "a": "Commonly 1.20-1.25, sometimes 1.10-1.15 at lower LTV (lender-specific). Lenders apply it to underwritten NOI, not seller pro-forma."
   },
   {
    "q": "Is investor experience required?",
    "a": "Often yes. Many lenders require prior ownership or management of income property, sometimes 2+ years."
   },
   {
    "q": "How does rent control affect underwriting?",
    "a": "In California, AB 1482 and local ordinances cap increases, so lenders use in-place rents. Pro-forma rent growth is rarely credited."
   },
   {
    "q": "What appraisal is used?",
    "a": "A 5+ unit residential income or narrative commercial appraisal with an income approach. Expect longer turn times and higher fees."
   },
   {
    "q": "Is LLC vesting typical?",
    "a": "Yes, with a personal guaranty from the principals. Entity documents and good standing are required."
   },
   {
    "q": "What prepay structures are common?",
    "a": "3-5 year step-down, sometimes yield-maintenance-style (lender-specific). State limits apply."
   }
  ],
  "aeQuestions": [
   "Min DSCR?",
   "Experience?",
   "NOI calc?",
   "Prepay?",
   "LTV?",
   "Mixed-use?",
   "What vacancy, management and replacement-reserve assumptions do you apply to NOI?",
   "Do you accept rent-controlled in-place rents and how do you treat below-market units?",
   "What investor-experience requirement applies and can it be waived?"
  ],
  "redFlags": [
   "Rent roll fabricated",
   "Units unpermitted",
   "Deferred maintenance",
   "Rent control violations",
   "Environmental issues",
   "Occupancy"
  ],
  "pricing": "Pricing depends on DSCR, LTV, prepay, experience. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Multifamily brokers",
   "Property managers",
   "Investor groups",
   "1031 intermediaries",
   "CPAs"
  ],
  "checklist": [
   "Rent roll",
   "Leases",
   "T-12",
   "Appraisal",
   "NOI calc",
   "Entity docs",
   "Insurance",
   "Prepay",
   "Reserves",
   "Credit",
   "Rent roll reconciled to bank deposits for 3-12 months",
   "Permit history confirming legal unit count",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_no_ratio": {
  "matrix": [
   [
    "Min FICO",
    "680-700 floor; 720+ for 70-75% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "65-75% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "65-70% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-65% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $1.5-2M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "No DTI and no DSCR minimum (rent may be below PITIA); some lenders still require a 1007 (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months+; deeper reserves are the main compensating factor (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "3-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Investment only (business purpose)"
   ],
   [
    "Prepayment penalty (investor)",
    "Common step-down where state allows; IL individual limits (verify)"
   ],
   [
    "Interest-only",
    "Rare or lower LTV (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Among the most expensive DSCR variants (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm business purpose and investment occupancy with signed certifications",
   "Explain why no-ratio fits: rent unknown (vacant/renovation), rent far below PITIA in high-price areas, or appreciation play",
   "Pull credit; strong FICO is a core requirement",
   "Verify funds to close plus elevated reserves",
   "Order appraisal (1007 may be ordered but not used to qualify)",
   "Document the investor's exit strategy and carry plan in a borrower letter (best practice even though not ATR)",
   "Select prepay structure",
   "Vesting: individual or LLC with personal guaranty",
   "Review title and liens",
   "Close with CA MLDS/business-purpose disclosures as applicable"
  ],
  "incomeExample": {
   "title": "Negative carry an investor must fund",
   "steps": [
    "1. La Jolla condo purchase $1,200,000; 65% LTV loan $780,000",
    "2. Expected rent $4,800/mo",
    "3. PITIA (illustrative): P&I $5,100 + tax $1,250 + insurance $120 + HOA $650 = $7,120",
    "4. Monthly shortfall = $7,120 - $4,800 = $2,320",
    "5. Annual negative carry = $27,840",
    "6. Lender reserves 12 months PITIA = $85,440 required",
    "7. Borrower liquid after close = $310,000 -> covers ~11 years of shortfall"
   ],
   "result": "Rent covers only 0.67 of PITIA; no-ratio approves on LTV, credit and reserves, but the investor must accept and fund the negative carry (illustrative)."
  },
  "scenarios": [
   {
    "t": "Coastal appreciation play",
    "who": "Gordon, 58, retired executive, La Jolla",
    "situation": "Gordon wants a $1.2M La Jolla condo to rent long-term and hold for appreciation. Market rent covers only about two-thirds of PITIA. He has $2M in liquid assets but complex income from partnerships he prefers not to document. He understands he will fund a monthly shortfall.",
    "structure": "No-ratio investment 65% LTV, 12 months reserves, 3-year step-down prepay; signed negative-carry acknowledgement and written hold strategy.",
    "numbers": "Illustrative: rent $4,800 vs PITIA (illustrative) $7,120 -> shortfall $2,320/mo, or $27,840/yr; liquidity after close $310K covers about 11 years.",
    "why": "DSCR programs need at least 0.75-1.00 coverage, and this property is at 0.67. No-ratio approves on LTV, credit and reserves instead. His liquidity makes the negative carry a deliberate choice rather than a risk to repayment.",
    "alternatives": "An asset-depletion investment loan was considered but requires full asset documentation and still prices higher. A cash purchase was considered but he wants leverage to keep capital invested.",
    "watch": "Negative carry acknowledgement; HOA reserve health and special assessments; prepay if he sells within 3 years."
   },
   {
    "t": "Vacant property needing rehab",
    "who": "Jason, 39, contractor, Escondido",
    "situation": "Jason is buying a vacant $550K house he will renovate and then rent. There is no lease, and the appraiser's rent estimate is speculative until work is done. He does not want hard money. He has $260K liquid.",
    "structure": "No-ratio 65% LTV purchase; plan to refinance into standard DSCR after rehab and lease-up; 9 months reserves.",
    "numbers": "Illustrative: $357,500 loan; PITIA (illustrative) $3,000; renovation budget $60K from cash.",
    "why": "No lease is required, so he can close before renovation. The rate is far lower than hard money. A later DSCR refinance becomes possible once rent is proven.",
    "alternatives": "Hard money was considered but costs much more and has a short term. A DSCR loan was considered but the as-is rent estimate gave too low a ratio.",
    "watch": "Prepay penalty if refinancing within 2-3 years; renovation permits; rehab budget overruns."
   },
   {
    "t": "Scottsdale luxury rental with thin rent",
    "who": "Erin, 50, anesthesiologist, Scottsdale AZ",
    "situation": "Erin wants a $1.3M luxury home to rent long-term. Rent covers about 70% of PITIA. Her income is strong but she does not want the rental to affect her DTI for a future home purchase. She has $600K liquid.",
    "structure": "No-ratio 70% LTV investment; 12 months reserves; 3-year prepay.",
    "numbers": "Illustrative: rent $6,000 vs PITIA (illustrative) $8,500 -> $2,500/mo negative carry.",
    "why": "DSCR under 0.75 fails most programs. No-ratio relies on LTV and reserves. Keeping it off her DTI preserves her primary-residence borrowing capacity.",
    "alternatives": "A full-doc conventional investment loan was considered but would hit her DTI. A DSCR 0.75 program was considered but her ratio is below it.",
    "watch": "She must fund $2,500/mo negative carry from verified liquidity; appreciation is not guaranteed; prepay term must match her hold plan."
   },
   {
    "t": "Naples condo with high HOA",
    "who": "Paul, 62, retired executive, Naples FL",
    "situation": "Paul wants a $650K Gulf-view condo rental with $1,400/mo HOA dues. DSCR falls below 0.75 because of the dues and insurance. He has substantial liquid assets. The building has completed its Florida structural inspection.",
    "structure": "No-ratio 65% LTV with 12+ months reserves; condo review including SIRS status.",
    "numbers": "Illustrative: rent $3,000 vs PITIA (illustrative) $4,200 -> $1,200/mo negative carry.",
    "why": "DSCR programs fail at this ratio. No-ratio uses his liquidity as the compensating factor. He wants leverage for estate planning reasons.",
    "alternatives": "A cash purchase was considered but he prefers leverage. A DSCR loan at a lower LTV was considered but still fails coverage.",
    "watch": "HOA dues increases; Florida structural rules; special assessments."
   },
   {
    "t": "Lincoln Park LLC rental",
    "who": "Andre, 45, entrepreneur, Chicago IL",
    "situation": "Andre wants a $700K Lincoln Park rental vested in his LLC. Rent covers about 80% of PITIA. His income is complex and he prefers not to document it. He plans to hold 7+ years.",
    "structure": "No-ratio 65% LTV with LLC vesting; prepay per Illinois entity rules (verify); 12 months reserves.",
    "numbers": "Illustrative: rent $3,600 vs PITIA (illustrative) $4,500 -> $900/mo negative carry.",
    "why": "DSCR program minimums are not met. LLC vesting supports liability protection and prepay options. No-ratio avoids documenting complex income.",
    "alternatives": "A DSCR 0.75 program was considered side by side and may price better if he can reduce LTV. A bank portfolio loan was considered but requires full financials.",
    "watch": "Illinois prepay rules for entity vs individual borrowers (verify); LLC docs and personal guaranty; $900/mo negative carry funded from verified liquidity."
   },
   {
    "t": "Henderson new-build lease-up",
    "who": "Mia, 37, investor, Henderson NV",
    "situation": "Mia is buying a $450K new-construction rental with no lease yet. She expects lease-up within 60 days. Builder incentives require closing within 30 days. She owns three other rentals.",
    "structure": "No-ratio 70% LTV; refinance into DSCR later if beneficial; 9 months reserves.",
    "numbers": "Illustrative: $315K loan; expected rent $2,400 vs PITIA (illustrative) $2,350.",
    "why": "No lease is required to close on the builder timeline. Her experience mitigates lease-up risk. A later DSCR refinance is optional.",
    "alternatives": "A DSCR loan using market rent was considered and may also work; no-ratio was simpler given timing. A conventional investment loan was considered but would add to her DTI.",
    "watch": "Lease-up risk; prepay if refinancing early; builder incentive deadlines."
   }
  ],
  "qa": [
   {
    "q": "What is a no-ratio loan?",
    "a": "A business-purpose investor loan that does not calculate DTI or DSCR. It relies on LTV, credit and reserves instead."
   },
   {
    "q": "Why use no-ratio instead of DSCR?",
    "a": "When rent won't reach the program's DSCR minimum or there is no lease yet. It is also used when the investor prefers not to document income."
   },
   {
    "q": "Can a no-ratio loan be used for owner-occupied property?",
    "a": "No. It is investment only, and misrepresenting occupancy is mortgage fraud."
   },
   {
    "q": "How does pricing compare?",
    "a": "No-ratio sits at the top of DSCR-family pricing (lender-specific). Lower LTV and stronger FICO help."
   },
   {
    "q": "Is a rent schedule required?",
    "a": "Some lenders still order a 1007 even though it is not used to qualify. It documents market rent for the file."
   },
   {
    "q": "What reserves are typical?",
    "a": "Usually 6-12 months or more. Reserves are the main compensating factor."
   },
   {
    "q": "Are prepayment penalties common?",
    "a": "Yes, step-down structures are common where state law allows. Illinois restricts prepay for individual borrowers (verify)."
   },
   {
    "q": "Can it be refinanced into DSCR later?",
    "a": "Yes, once rent supports the program's DSCR minimum. Watch the prepay period."
   }
  ],
  "aeQuestions": [
   "Max LTV by FICO for no-ratio?",
   "Do you require a 1007?",
   "What reserves?",
   "Prepay options in this state?",
   "Is IO available?",
   "Is LLC vesting required?",
   "What is your maximum LTV for no-ratio by FICO band?",
   "Do you require a signed negative-carry or exit-strategy letter?",
   "Do you order a 1007 even though it is not used to qualify?"
  ],
  "redFlags": [
   "Borrower intends to occupy",
   "No liquidity to fund negative carry",
   "Straw buyer",
   "Fake leases",
   "Undisclosed debts",
   "Speculative flipping without plan"
  ],
  "pricing": "No-ratio sits at the top of DSCR pricing grids: LTV, FICO, prepay term and loan size drive adjusters. Compare against a 0.75 DSCR program and full-doc investment options. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Coastal luxury investor agents",
   "Contractors who rehab and rent",
   "Wealth managers with real estate clients",
   "Investor clubs",
   "1031 exchange intermediaries"
  ],
  "checklist": [
   "Business-purpose and occupancy certifications",
   "Credit",
   "Assets and reserves",
   "Appraisal",
   "Negative carry acknowledgement",
   "Exit strategy letter",
   "Entity docs",
   "Prepay disclosure",
   "Title",
   "Insurance",
   "Liquidity verified to cover at least 12 months of projected negative carry",
   "Prepay term compared in writing against the investor's hold or refinance plan",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_credit_event": {
  "matrix": [
   [
    "Min FICO",
    "No minimum or 500-580 on 1-day-out tiers; 620-660 typical (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "65-80% depending on seasoning: 0-12 months ~65-70%, 12-24 months ~75-80%, 24-48 months up to 85% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "60-75% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "55-70%; cash-out to pay off BK trustee needs court approval (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$100K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months; more at lower seasoning (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "BK7/BK13 discharge, FC, SS, DIL, loan mod: 1 day to 48 months by tier (lender-specific); agency needs 2-7 years"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment where state allows"
   ],
   [
    "Interest-only",
    "Rare (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Significantly above agency; improves with each seasoning tier (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Identify every credit event and its exact date: BK filing, discharge or dismissal, foreclosure sale date, short sale closing, DIL recording, mod date",
   "Pull bankruptcy docket (PACER) and discharge order; for BK13 in progress, trustee approval to incur debt",
   "Pull foreclosure/short-sale settlement documents and recorded deeds",
   "Determine seasoning tier from the lender's matrix (measured from discharge/completion date to note date)",
   "Review mortgage history: 0x30 in last 12 months often required; housing late counts drive tier",
   "Get a letter of explanation tied to the event (job loss, medical, divorce) and evidence of re-established credit",
   "Underwrite income: full doc, bank statement, or DSCR as appropriate",
   "Check judgments, liens and child-support arrears",
   "Verify reserves",
   "Compute DTI",
   "Document ATR including how the cause of the event has resolved",
   "Close"
  ],
  "incomeExample": {
   "title": "Seasoning tier choice changes LTV",
   "steps": [
    "1. Short sale closed 14 months ago",
    "2. Lender matrix: 12-24 months seasoning -> max 75% LTV; 24+ months -> 85% (lender-specific)",
    "3. Purchase $700,000; 75% LTV loan $525,000; down payment $175,000",
    "4. Waiting 10 more months -> 85% LTV loan $595,000; down payment $105,000",
    "5. Borrower has $190,000 liquid; reserves required 6 months PITIA ~$24,000",
    "6. Buying now: $175,000 down + $15,000 costs + $24,000 reserves = $214,000 needed -> short by $24,000",
    "7. Options: wait 10 months for the 85% tier (needs ~$105,000 + $15,000 + $26,000 reserves = ~$146,000) or add a documented $25,000 gift now (lender-specific gift rules)"
   ],
   "result": "Borrower is short now; waiting 10 months or using a gift solves it (illustrative)."
  },
  "scenarios": [
   {
    "t": "Post-divorce short sale",
    "who": "Rachel, 42, nurse, Temecula",
    "situation": "Rachel's divorce forced a short sale 14 months ago. Her credit is rebuilt to 680 with no lates since. She wants to buy a $700K home and has $190K liquid. Agency requires 4 years after short sale (2 with extenuating circumstances).",
    "structure": "Credit-event program 12-24 month tier at 75% LTV; or wait until 24 months for an 85% tier.",
    "numbers": "Illustrative: buying now needs ~$214K vs $190K available; waiting 10 months needs ~$146K.",
    "why": "Agency's waiting period is too long for her plans. The credit-event tier lets her buy if she adds a gift. Waiting 10 months improves LTV and pricing.",
    "alternatives": "FHA was considered (3 years after short sale) but is still 22 months away. Waiting 10 months for the next tier was presented as the lower-cost option.",
    "watch": "Funds to close; extenuating-circumstances documentation; no new derogatory credit."
   },
   {
    "t": "Business failure bankruptcy",
    "who": "Mark, 51, restaurant general manager, Chula Vista",
    "situation": "Mark filed Chapter 7 after his own restaurant closed, and the discharge entered 9 months ago. He now earns a stable W-2 salary as a GM. His credit score has recovered to 640. He wants to buy a $600K townhome.",
    "structure": "Credit-event 0-12 month tier, 65-70% LTV, full doc; 6 months reserves; letter of explanation.",
    "numbers": "Illustrative: $405K loan at 67.5% LTV; down payment $195K from savings and documented gift.",
    "why": "Agency requires 4 years after Chapter 7. This program closes now. Full doc earns better pricing within the tier.",
    "alternatives": "Waiting 15 months for a cheaper tier was considered. FHA was considered (2 years after discharge) but is 15 months away.",
    "watch": "Large down payment; refinance plan once seasoning improves; pricing at the shortest tier."
   },
   {
    "t": "Foreclosure after a medical crisis",
    "who": "Linda, 55, elementary teacher, Phoenix AZ",
    "situation": "Linda lost her home to foreclosure 30 months ago after a cancer diagnosis and months of unpaid leave. She has returned to full-time teaching and her credit is back to 690. She has $90K saved. Agency requires 7 years after foreclosure (3 with extenuating circumstances).",
    "structure": "Credit-event 24-48 month tier 80% LTV full doc; medical documentation as extenuating support.",
    "numbers": "Illustrative: $400K purchase; $320K loan; DTI 38%.",
    "why": "Better LTV than shorter tiers. She doesn't wait 4+ more years. Full doc pricing helps.",
    "alternatives": "FHA (3 years after foreclosure) was considered and is 6 months away; Steven compared both. Agency with extenuating circumstances was considered but documentation was incomplete.",
    "watch": "Extenuating documentation; reserves; pricing vs FHA in 6 months."
   },
   {
    "t": "Chapter 13 refinance with trustee approval",
    "who": "Jerome, 46, diesel mechanic, Las Vegas NV",
    "situation": "Jerome is in year 3 of a 5-year Chapter 13 plan with perfect payments. He wants to refinance to pay off the plan early and lower monthly obligations. His home has substantial equity.",
    "structure": "Credit-event cash-out 70% LTV with written trustee/court approval; plan payoff at closing.",
    "numbers": "Illustrative: $480K value; $336K loan pays $230K mortgage and $60K plan balance.",
    "why": "Non-QM accepts in-plan refinances with court approval. Paying off the plan improves cash flow. Equity supports the loan.",
    "alternatives": "FHA was considered but plan terms may restrict. Waiting for plan completion was considered but takes 2 more years.",
    "watch": "Bankruptcy court and trustee approval before closing; plan payoff letter from trustee; trustee fees and remaining plan balance in closing figures."
   },
   {
    "t": "Loan modification 10 months ago",
    "who": "Tasha, 40, hospital administrator, Chicago IL",
    "situation": "Tasha's lender modified her mortgage after a temporary income loss 10 months ago. Her income has fully recovered. She wants to refinance into a better structure.",
    "structure": "Credit-event 75% LTV rate/term; document modification terms and recovery.",
    "numbers": "Illustrative: $320K value; $240K loan.",
    "why": "Agency may treat the mod as a credit event with a waiting period. Non-QM accepts it sooner. Recovery is documented.",
    "alternatives": "Waiting for agency seasoning was considered. Keeping the modified loan was considered but terms are unfavorable.",
    "watch": "Modification agreement terms (principal forgiveness, deferred balance); 0x30 payment history since the mod; documentation that income has fully recovered."
   },
   {
    "t": "Investor with prior rental foreclosure",
    "who": "Victor, 49, investor, Orlando FL",
    "situation": "Victor lost a rental to foreclosure 18 months ago during a tenant eviction dispute. His other rentals are current. He wants a DSCR loan on a new rental.",
    "structure": "DSCR credit-event tier 70% LTV.",
    "numbers": "Illustrative: rent $2,300 vs PITIA $2,150 -> DSCR 1.07.",
    "why": "Agency requires 7 years after foreclosure. DSCR credit-event tiers accept 18 months. His other rentals show management ability.",
    "alternatives": "Hard money was considered but expensive. Waiting was considered but delays his plan.",
    "watch": "Seasoning measured from foreclosure sale date to note date; letter explaining the tenant dispute; reserves across all rentals."
   }
  ],
  "qa": [
   {
    "q": "How is seasoning measured?",
    "a": "From the discharge, dismissal, completion or recording date to the note date (lender-specific). Use the exact date from the court or recorded document."
   },
   {
    "q": "Can a borrower qualify one day out of bankruptcy?",
    "a": "Some programs allow it at low LTV with large reserves. Pricing is highest at that tier."
   },
   {
    "q": "What does agency require?",
    "a": "Fannie: Chapter 7 BK 4 years, foreclosure 7 years, short sale/DIL 4 years; FHA: BK7 2 years, foreclosure 3 years (verify current). Extenuating circumstances can shorten some waits."
   },
   {
    "q": "Do extenuating circumstances help?",
    "a": "Agency may shorten waits with documentation of a non-recurring event beyond the borrower's control. Non-QM still uses its own tiers."
   },
   {
    "q": "Is a letter of explanation required?",
    "a": "Yes. It should tie to the event and show how the cause has resolved."
   },
   {
    "q": "What about recent mortgage lates?",
    "a": "Recent 30-day lates may disqualify or reduce LTV. Many programs require 0x30 in the last 12 months."
   },
   {
    "q": "Is it QM?",
    "a": "Typically non-QM. The lender documents ATR."
   },
   {
    "q": "Can the borrower refinance later?",
    "a": "Yes, once seasoning meets agency guidelines. Plan the refinance path at application."
   }
  ],
  "aeQuestions": [
   "What seasoning tiers and LTV caps?",
   "Do you allow 1-day-out?",
   "How do you measure seasoning?",
   "Mortgage late tolerance?",
   "Reserves?",
   "DSCR combined with credit event?",
   "What seasoning tiers and LTV caps apply, and do you allow 1-day-out?",
   "Do you measure seasoning to application or note date?",
   "How many recent mortgage lates are allowed at each tier?"
  ],
  "redFlags": [
   "Undisclosed bankruptcy",
   "Recent new delinquencies",
   "Judgments or liens",
   "Fraudulent credit repair",
   "Hidden debts",
   "Occupancy fraud"
  ],
  "pricing": "Pricing improves with each seasoning tier; FICO, LTV, reserves and occupancy drive adjusters. Plan a refinance path to agency once seasoning matures. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Bankruptcy attorneys (post-discharge education)",
   "Divorce attorneys",
   "Credit counselors",
   "Real estate agents with rebuild clients",
   "Veteran service organizations"
  ],
  "checklist": [
   "BK docket and discharge",
   "Foreclosure/short sale docs",
   "Letter of explanation",
   "Credit",
   "Mortgage history",
   "Income docs",
   "Reserves",
   "Appraisal",
   "Trustee approval if BK13",
   "ATR",
   "Seasoning calculation with exact event date and note date",
   "Credit-event refinance-path plan documented",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_foreign_national": {
  "matrix": [
   [
    "Min FICO",
    "Often no US score required; if a US score exists, 660-700+ may be used for better tiers (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "60-75%; DSCR foreign national often 70% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "60-70% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "50-65% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $2-3M (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "Full-doc foreign income with CPA letter and DTI 43-50%, or DSCR 1.00+ (lender-specific)"
   ],
   [
    "Reserves",
    "12 months+ held in US accounts by closing at many lenders (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "International credit report or reference letters; US events per matrix (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, warrantable/non-warrantable condo, 2-4 unit; condotel separate"
   ],
   [
    "Occupancy",
    "Second home or investment; primary not allowed for non-residents"
   ],
   [
    "Prepayment penalty (investor)",
    "Common on DSCR investment where state allows"
   ],
   [
    "Interest-only",
    "Available on some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Well above agency; agency/FHA not available to non-resident aliens (lender-specific)"
   ],
   [
    "States",
    "FL (Miami, Orlando) is the largest market; CA, NV, AZ, IL available (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm status: non-resident alien with valid passport and visa or ESTA/visa waiver entry - not a US resident",
   "Screen for OFAC/sanctions and country restrictions (lender lists of ineligible countries)",
   "Collect passport, visa/I-94 or ESTA, and a foreign address",
   "Obtain international credit report or 2-3 credit reference letters from foreign banks (translated)",
   "Choose qualification path: foreign income (employer letter or CPA letter, translated and converted to USD) or DSCR",
   "Document funds to close and reserves; trace international wires; funds often must be in a US account 10-30 days before closing (lender-specific)",
   "Verify AML/source-of-funds: no cash, no crypto unless converted and seasoned (lender-specific)",
   "Order appraisal with 1007 if DSCR",
   "Vesting: individual or US LLC; FIRPTA implications on future sale explained (refer to tax advisor)",
   "Obtain US ITIN or proceed without (lender-specific)",
   "Close via remote online notary or US consulate apostille as allowed",
   "Insurance and property management plan for remote ownership"
  ],
  "incomeExample": {
   "title": "Foreign national DSCR with reserves",
   "steps": [
    "1. Orlando condo purchase $400,000; 70% LTV loan $280,000",
    "2. Market rent $2,600",
    "3. PITIA (illustrative): P&I $2,000 + tax $500 + insurance $150 + HOA $300 = $2,950",
    "4. DSCR = $2,600 / $2,950 = 0.88 - below 1.00",
    "5. Reduce LTV to 60%: loan $240,000, P&I ~$1,715 -> PITIA $2,665 -> DSCR 0.98",
    "6. Reserves 12 months PITIA = ~$32,000 in a US account",
    "7. Funds to close: $160,000 down + $12,000 costs + $32,000 reserves = $204,000 wired and seasoned"
   ],
   "result": "Needs ~60% LTV or a sub-1.00 program; total funds required ~$204,000 (illustrative)."
  },
  "scenarios": [
   {
    "t": "Mexican business owner buying in San Diego",
    "who": "Alejandro, 52, manufacturing company owner, Tijuana, Baja California",
    "situation": "Alejandro wants an $800K condo in Downtown San Diego for family visits and occasional rental. He has a B1/B2 visa and travels across the border weekly. His income is documented in Mexican pesos with a CPA letter and bank statements. He will wire funds from a Mexican bank.",
    "structure": "Foreign national second home 65% LTV with foreign income converted at a current exchange rate; 12 months reserves seasoned in a US account; OFAC and source-of-funds review.",
    "numbers": "Illustrative: $520K loan; PITIA (illustrative) $4,600; income converted to USD $28K/mo -> DTI 16%.",
    "why": "Agency and FHA loans are unavailable to non-resident aliens. A foreign national program accepts his peso income with CPA support. Second-home use matches his real plan.",
    "alternatives": "A cash purchase was considered but would tie up business capital. A DSCR foreign national loan was considered but he wants personal use, which conflicts with investment certification.",
    "watch": "Peso exchange-rate swings; wire tracing from the Mexican bank; condo warrantability."
   },
   {
    "t": "Canadian snowbird buying in Scottsdale",
    "who": "Margaret, 63, retired, Toronto ON (buying in Scottsdale AZ)",
    "situation": "Margaret spends winters in Arizona and wants a $550K Scottsdale condo she will rent out the rest of the year. She has a Canadian credit bureau report and pension income in Canadian dollars. She does not have an SSN or ITIN.",
    "structure": "Foreign national DSCR 70% LTV or second home with foreign income (lender-specific); funds wired to a US account and seasoned.",
    "numbers": "Illustrative: $385K loan; rent $3,200 vs PITIA $3,100 -> DSCR 1.03.",
    "why": "Agency is unavailable to non-residents. Her Canadian credit report substitutes for a US score. DSCR avoids converting her pension income.",
    "alternatives": "A cash purchase was considered but she prefers leverage. A Canadian bank cross-border mortgage was considered but options were limited.",
    "watch": "Occupancy days vs investment certification; FIRPTA on future sale; currency risk."
   },
   {
    "t": "Brazilian physician buying an Orlando STR",
    "who": "Rafael, 45, physician, Sao Paulo",
    "situation": "Rafael wants a $450K vacation-rental home in a resort community near Orlando. His income is in Brazilian reais. He visits the US annually on a B1/B2 visa.",
    "structure": "Foreign national DSCR STR 70% LTV (lender-specific); international credit reference letters translated.",
    "numbers": "Illustrative: $315K loan; STR net $3,800 vs PITIA $3,000.",
    "why": "Agency is unavailable. STR income supports DSCR. Reference letters replace US credit.",
    "alternatives": "A cash purchase was considered but currency conversion rates were unfavorable. A long-term rental was considered but income is lower.",
    "watch": "Real-to-dollar conversion at current rate with cushion for volatility; resort community STR zoning confirmed; complete wire trail from Brazilian bank to US account."
   },
   {
    "t": "French executive buying in Miami",
    "who": "Sophie, 50, executive, Paris",
    "situation": "Sophie wants a $900K Miami condo for personal use several months a year. Her salary is documented by her employer. She has strong euro savings.",
    "structure": "Foreign national second home 65% LTV with foreign income and employer letter.",
    "numbers": "Illustrative: $585K loan; DTI 25%.",
    "why": "Agency is unavailable. Her documented income qualifies. Personal use matches second-home rules.",
    "alternatives": "A cash purchase was considered but she wants liquidity. A DSCR loan was considered but she won't rent it.",
    "watch": "Condo project review including Florida milestone and SIRS status; master insurance and hurricane deductibles; second-home occupancy certification."
   },
   {
    "t": "Chinese entrepreneur near family",
    "who": "Wei, 48, entrepreneur, Shanghai",
    "situation": "Wei wants a $1.2M rental property near his daughter's university in Southern California. Funds must move under China's capital controls. He has documented business ownership.",
    "structure": "Foreign national DSCR 65% LTV with rigorous source-of-funds documentation.",
    "numbers": "Illustrative: $780K loan; rent $5,200 vs PITIA $5,000.",
    "why": "Agency is unavailable. DSCR avoids foreign-income analysis. Rigorous sourcing satisfies AML rules.",
    "alternatives": "A cash purchase was considered but capital controls limit transfers. Buying in his daughter's name was considered but she lacks income.",
    "watch": "Source of funds; third-party transfers are prohibited; daughter occupancy would change occupancy type."
   },
   {
    "t": "UK investor buying in Henderson",
    "who": "James, 55, investor, London",
    "situation": "James wants a $400K long-term rental in Henderson. He will use a local property manager. He plans to vest in a US LLC.",
    "structure": "Foreign national DSCR 70% LTV with US LLC vesting.",
    "numbers": "Illustrative: $280K loan; rent $2,400 vs PITIA $2,300.",
    "why": "Agency is unavailable. DSCR avoids UK income analysis. LLC vesting provides liability protection.",
    "alternatives": "A cash purchase was considered but he prefers leverage. A UK lender was considered but they don't lend on US property.",
    "watch": "Signed property management agreement; FIRPTA explained by a tax advisor; LLC formation, EIN and good standing before closing."
   }
  ],
  "qa": [
   {
    "q": "Who counts as a foreign national borrower?",
    "a": "A non-resident alien who lives outside the US. Residents on visas (H-1B, L-1, etc.) use non-permanent-resident programs instead."
   },
   {
    "q": "Is a US credit score required?",
    "a": "Usually not. International credit reports or reference letters may substitute (lender-specific)."
   },
   {
    "q": "Can they buy a primary residence?",
    "a": "No. Foreign national programs are for second homes or investment only."
   },
   {
    "q": "How are funds verified?",
    "a": "Foreign bank statements, translated, plus wire tracing into a US account. Lenders often require seasoning of 10-30 days."
   },
   {
    "q": "What is FIRPTA?",
    "a": "A US tax withholding on future sales by foreign persons. Refer the buyer to a tax advisor."
   },
   {
    "q": "Is an ITIN required?",
    "a": "Lender-specific. Some require it, some don't."
   },
   {
    "q": "Can they vest in an LLC?",
    "a": "Often yes, with a personal guaranty. The LLC needs an EIN and good standing."
   },
   {
    "q": "Which countries are ineligible?",
    "a": "OFAC-sanctioned countries and lender-restricted lists. Check the lender's current list."
   }
  ],
  "aeQuestions": [
   "Which countries are ineligible?",
   "Do you require a US account and seasoning period?",
   "Do you accept foreign income or only DSCR?",
   "Max LTV and reserves?",
   "Is an ITIN required?",
   "Closing logistics: apostille or remote notary?",
   "What is your current ineligible-country list?",
   "How long must funds season in a US account before closing?",
   "Do you accept foreign income or only DSCR qualification?"
  ],
  "redFlags": [
   "Sanctioned country",
   "Untraceable funds",
   "Third-party wires",
   "Fraudulent foreign documents",
   "Borrower actually resides in US",
   "Cash deposits"
  ],
  "pricing": "Foreign national pricing is well above agency; LTV, DSCR, reserves and documentation path drive cost. Compare total cost including wire and translation fees. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "International agents",
   "Immigration attorneys",
   "Foreign chambers of commerce",
   "Developers selling to international buyers",
   "Cross-border CPAs"
  ],
  "checklist": [
   "Passport and visa",
   "International credit report",
   "Foreign income docs translated",
   "Source-of-funds tracing",
   "US account statements",
   "OFAC check",
   "Appraisal",
   "Entity docs",
   "Closing logistics",
   "Insurance",
   "OFAC screening result for all borrowers and guarantors",
   "Wire-trace chain from foreign account to US account",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_itin": {
  "matrix": [
   [
    "Min FICO",
    "620-660 with a score; some allow no-score with alternative tradelines at lower LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "75-85% primary; 70-75% investment (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-80% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "65-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$100K to $1.5-2M (lender-specific)"
   ],
   [
    "Max DTI",
    "43-50% (lender-specific)"
   ],
   [
    "Reserves",
    "3-6 months typical; more at higher LTV (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second, investment (lender-specific)"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment where state allows"
   ],
   [
    "Interest-only",
    "Rare (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; FHA, VA, USDA, Fannie and Freddie require SSN - ITIN-only borrowers are excluded (verify)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL all active ITIN markets (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm valid ITIN letter (CP565) and that it is not expired (ITINs not used on a return for 3 years expire)",
   "Obtain unexpired government photo ID (passport, consular ID/matricula where allowed)",
   "Credit: pull tri-merge on ITIN; if thin, gather 2-3 alternative tradelines (rent, utilities, phone) with 12-month history",
   "Income: 2 years tax returns filed with ITIN plus W-2/1099 or bank statements (lender-specific)",
   "For W-2 employees with mismatched SSN on W-2, follow lender policy strictly - often ineligible",
   "Verify funds to close; gifts may be restricted (lender-specific)",
   "Document ATR",
   "Appraisal",
   "Compute DTI",
   "Close"
  ],
  "incomeExample": {
   "title": "ITIN borrower down payment and reserves",
   "steps": [
    "1. Purchase $550,000 in Chula Vista",
    "2. Max LTV 80% (lender-specific) -> loan $440,000; down $110,000",
    "3. Closing costs $14,000",
    "4. Reserves 6 months PITIA (illustrative PITIA $3,600) = $21,600",
    "5. Total cash needed = $145,600",
    "6. Income: Schedule C bakery $78,000 + spouse W-2 $42,000 = $120,000 / 12 = $10,000",
    "7. DTI = ($3,600 + $500 debts) / $10,000 = 41%"
   ],
   "result": "Qualifies at 41% DTI; must document $145,600 funds (illustrative)."
  },
  "scenarios": [
   {
    "t": "Bakery-owner family in Chula Vista",
    "who": "Rosa, 45, bakery owner, Chula Vista",
    "situation": "Rosa and her husband have filed taxes with ITINs for 6 years. Rosa's bakery shows $78K net on Schedule C, and her husband earns $42K on W-2 at a warehouse. They have a 700 score on their ITIN credit reports and $150K saved. They want a $550K home.",
    "structure": "ITIN program 80% LTV full doc with 2 years returns; 6 months reserves.",
    "numbers": "Illustrative: $145,600 cash needed; DTI 41%.",
    "why": "FHA, Fannie and Freddie require SSNs, so the ITIN program is the financed path. Their tax history documents income. Savings cover cash needs.",
    "alternatives": "Renting was considered. FHA was considered but is not available.",
    "watch": "Funds sourcing for bakery cash deposits; ITIN expiration; gift rules."
   },
   {
    "t": "Framer buying in Phoenix",
    "who": "Miguel, 38, framing crew lead, Phoenix AZ",
    "situation": "Miguel has filed taxes with his ITIN for 5 years and is paid on 1099 by two builders. His credit report on ITIN shows a 660 score. He wants a $350K starter home and has saved $60K.",
    "structure": "ITIN program 85% LTV with 2 years returns and 1099s; 3 months reserves.",
    "numbers": "Illustrative: $297,500 loan; DTI 50% - at the cap, so reduce price or add co-borrower.",
    "why": "FHA, Fannie and Freddie are unavailable without an SSN. ITIN programs accept 1099 history. Lowering price keeps DTI safe.",
    "alternatives": "Renting was considered since rent is near the payment. A co-borrower was considered to lower DTI.",
    "watch": "DTI tight; builder-income continuity; ITIN expiration check."
   },
   {
    "t": "Las Vegas landscaper with bank statements",
    "who": "Juan, 50, landscaping business owner, Las Vegas NV",
    "situation": "Juan runs a landscaping crew and deposits customer payments into a business account. His ITIN tax returns show heavy deductions. He wants a $400K home.",
    "structure": "ITIN bank-statement program 80% LTV, 24 months business statements (lender-specific).",
    "numbers": "Illustrative: deposits $480K x 50% / 24 = $10,000/mo.",
    "why": "Bank statements show actual cash flow. Agency is unavailable. Deductions don't reduce bank-statement income.",
    "alternatives": "ITIN full doc was considered but returns are too low. Renting was considered.",
    "watch": "Cash deposits must be consistent month to month; Las Vegas business license; ITIN must be unexpired."
   },
   {
    "t": "Chicago restaurant cook",
    "who": "Ana, 35, line cook, Chicago IL",
    "situation": "Ana has worked at the same restaurant for 6 years, paid on W-2 with her ITIN. Her credit is thin. She wants a $300K condo in Pilsen.",
    "structure": "ITIN full doc 80% LTV with alternative tradelines.",
    "numbers": "Illustrative: income $48,000 / 12 = $4,000; PITIA $1,800 -> DTI 45%.",
    "why": "Agency is unavailable. Alternative tradelines establish credit. Long job tenure supports ATR.",
    "alternatives": "Renting was considered. A cheaper home was considered to lower DTI.",
    "watch": "Thin credit; condo eligibility; employer W-2 name matching ITIN."
   },
   {
    "t": "Miami housekeeper with 1099 income",
    "who": "Maria, 42, independent housekeeper, Miami FL",
    "situation": "Maria cleans homes for 12 regular clients and some pay via 1099. She files with ITIN. She wants a $350K townhome with 20% down.",
    "structure": "ITIN program 80% LTV using tax returns.",
    "numbers": "Illustrative: Schedule C net $55,000 / 12 = $4,583.",
    "why": "Agency is unavailable. Tax returns document her income. 20% down meets program requirements.",
    "alternatives": "Renting was considered. A bank-statement ITIN program was considered but returns were simpler.",
    "watch": "Cash income must appear on filed returns; Florida insurance quote bound before closing; 3-6 months reserves verified."
   },
   {
    "t": "Temecula business owner buying a rental",
    "who": "Carlos, 48, auto shop owner, Temecula",
    "situation": "Carlos owns his home and wants a $500K rental. He has an ITIN and strong credit. He doesn't want the rental to affect his DTI.",
    "structure": "ITIN DSCR 75% LTV (lender-specific).",
    "numbers": "Illustrative: rent $2,800 vs PITIA $2,700 -> DSCR 1.04.",
    "why": "Agency is unavailable. DSCR keeps DTI separate. His credit supports pricing.",
    "alternatives": "A cash purchase was considered to preserve liquidity. ITIN full doc was considered but would count the rental in DTI.",
    "watch": "DSCR availability for ITIN varies; reserves; landlord insurance."
   }
  ],
  "qa": [
   {
    "q": "Can ITIN borrowers get FHA loans?",
    "a": "No. FHA requires an SSN, and since FHA case numbers assigned on or after May 25, 2025 (ML 2025-09), non-permanent residents are also ineligible."
   },
   {
    "q": "Can they get Fannie Mae or Freddie Mac loans?",
    "a": "No. Agency loans require a valid SSN."
   },
   {
    "q": "What down payment is typical?",
    "a": "Generally 15-25% (lender-specific). Higher LTV may require stronger credit."
   },
   {
    "q": "How is credit established?",
    "a": "An ITIN-based tri-merge if available, otherwise alternative tradelines with 12-month history. Rent, utilities and phone are common."
   },
   {
    "q": "Are gifts allowed?",
    "a": "Lender-specific. Some limit gift amounts or donors."
   },
   {
    "q": "What if the ITIN has expired?",
    "a": "It must be renewed before closing. ITINs not used on a return for 3 consecutive years expire."
   },
   {
    "q": "Is ITIN lending legal?",
    "a": "Yes. Lenders may lend to ITIN holders who meet program rules and pass identity and AML checks."
   },
   {
    "q": "Is it QM?",
    "a": "No, typically non-QM. The lender documents ATR."
   }
  ],
  "aeQuestions": [
   "Do you accept no-score borrowers?",
   "Max LTV?",
   "Gift policy?",
   "Income docs?",
   "Reserves?",
   "Matricula ID?",
   "Do you accept consular IDs (matricula) or only passports?",
   "Do you allow alternative tradelines in place of a credit score?",
   "What gift and down-payment-source rules apply to ITIN borrowers?"
  ],
  "redFlags": [
   "Mismatched SSN on W-2",
   "Expired ITIN",
   "Untraceable cash",
   "Straw buyer",
   "Fake IDs",
   "Occupancy fraud"
  ],
  "pricing": "Pricing above agency; FICO, LTV and docs drive cost. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Spanish-language community events",
   "Tax preparers serving ITIN filers",
   "Churches",
   "Hispanic chambers",
   "Real estate agents"
  ],
  "checklist": [
   "ITIN letter",
   "Photo ID",
   "Credit",
   "Tax returns",
   "Income docs",
   "Assets",
   "Reserves",
   "Appraisal",
   "ATR",
   "Occupancy cert",
   "IRS ITIN assignment letter (CP565) and expiration check",
   "Tax returns filed under the ITIN for each year used",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_daca": {
  "matrix": [
   [
    "Min FICO",
    "620-680 depending on path (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "Conventional up to 95-97% if lender treats DACA as eligible with SSN and EAD (verify current Fannie/Freddie and lender overlays); non-QM 80-90% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "Conventional per agency; non-QM 75-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "Conventional 80%; non-QM 70-75% (lender-specific)"
   ],
   [
    "Loan amount range",
    "Conforming/high-balance via agency; non-QM to ~$2M (lender-specific)"
   ],
   [
    "Max DTI",
    "Agency per AUS up to 50%; non-QM 43-50%"
   ],
   [
    "Reserves",
    "Per AUS or 3-6 months non-QM (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "Agency or non-QM rules (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary mostly; second/investment on some non-QM"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment non-QM where allowed"
   ],
   [
    "Interest-only",
    "Non-QM only, rare"
   ],
   [
    "Typical pricing vs agency",
    "Agency pricing if eligible; non-QM above agency"
   ],
   [
    "States",
    "CA, IL, NV, AZ, FL (verify)"
   ]
  ],
  "walkthrough": [
   "Confirm DACA status: EAD card category C33 and approval notice (I-797); check expiration and renewal filing (I-821D/I-765 pending receipt)",
   "FHA: since FHA case numbers on/after May 25, 2025 (ML 2025-09), non-permanent residents including DACA are ineligible - do not quote FHA",
   "Conventional: confirm the lender's current overlay on DACA under Fannie/Freddie non-citizen guidance; many lenders follow agency legal-presence rules, some overlay it out (verify each lender)",
   "If conventional unavailable, route to non-QM program that accepts DACA with SSN/EAD",
   "Verify SSN and that the borrower has filed taxes",
   "Income: full doc W-2/1099 or alt doc",
   "Credit: standard tri-merge",
   "EAD expiring within 6-12 months: lender may require renewal receipt (lender-specific)",
   "Verify funds; gifts per program",
   "Appraisal",
   "DTI and reserves",
   "Close"
  ],
  "incomeExample": {
   "title": "DACA borrower conventional vs non-QM down payment",
   "steps": [
    "1. Purchase $600,000 in Escondido",
    "2. Conventional 95% LTV (if eligible) -> down $30,000; PMI applies",
    "3. Non-QM 85% LTV -> down $90,000",
    "4. Borrower W-2 income $95,000 = $7,917/mo",
    "5. PITIA conventional (illustrative) $4,100 incl PMI; DTI with $400 debts = 56.8% - too high",
    "6. PITIA non-QM 85% (illustrative) $4,000; DTI = 55.6% - too high",
    "7. Add co-borrower spouse $45,000 -> $11,667/mo -> conventional DTI 38.6%"
   ],
   "result": "Needs co-borrower either way; conventional (if eligible) needs far less cash (illustrative)."
  },
  "scenarios": [
   {
    "t": "DACA recipient nurse",
    "who": "Daniela, 29, registered nurse, Escondido",
    "situation": "Daniela has held DACA since 2013, and her EAD is valid for 18 more months. She has an SSN and 4 years of W-2 history. She wants a $600K townhome with her husband, a US citizen earning $45K. Her own income is $95K.",
    "structure": "Conventional 95% if the lender allows DACA under agency legal-presence guidance (verify); fallback non-QM 85%; husband on loan.",
    "numbers": "Illustrative: combined $11,667/mo; conventional PITIA (illustrative) $4,100 incl PMI -> DTI 38.6%.",
    "why": "FHA is no longer available since 2025, but conventional may be. Adding her husband brings DTI into range. Conventional needs far less cash than non-QM.",
    "alternatives": "FHA was considered but is ineligible after ML 2025-09. Non-QM 85% was kept as fallback if lender overlays block DACA.",
    "watch": "EAD expiration within 18 months; lender overlays; condo or PUD review."
   },
   {
    "t": "DACA teacher in Chicago",
    "who": "Luis, 31, middle-school teacher, Chicago IL",
    "situation": "Luis has held DACA since 2014 and has an SSN, 6 years of W-2 teaching income, and a 720 score. He wants a $350K condo. His prior lender quoted FHA, which is no longer available to him.",
    "structure": "Conventional 95% if the lender currently accepts DACA (verify); otherwise non-QM 85-90%.",
    "numbers": "Illustrative: conventional $332,500 loan vs non-QM $297,500 - difference in cash needed $35,000.",
    "why": "FHA is ineligible since ML 2025-09, but conventional may still be open. His credit and tenure support approval. Conventional costs less.",
    "alternatives": "FHA was considered but is ineligible. An ITIN program was considered but unnecessary since he has an SSN.",
    "watch": "Condo must pass project review; EAD must be valid through closing; written confirmation of the lender's DACA policy."
   },
   {
    "t": "DACA engineer with strong credit",
    "who": "Karla, 33, civil engineer, Phoenix AZ",
    "situation": "Karla has a PE license, 8 years of W-2 history, and DACA renewed last year. She wants a $450K home with 10% down. She is comparing lenders.",
    "structure": "Conventional 90% where lender accepts DACA (verify); non-QM fallback.",
    "numbers": "Illustrative: $405,000 loan; PMI applies on conventional.",
    "why": "Conventional pricing beats non-QM if eligible. Her credit and income are strong. Shopping eligibility, not comp, protects her.",
    "alternatives": "Non-QM was considered but costs more. FHA was considered but is ineligible.",
    "watch": "Confirm lender DACA overlay in writing; EAD renewal filed well before expiration; PMI cost included in DTI."
   },
   {
    "t": "DACA auto shop owner",
    "who": "Jose, 35, auto repair shop owner, Las Vegas NV",
    "situation": "Jose owns a small auto shop with DACA status and an SSN. His tax returns show low net after depreciation. He wants a $400K home.",
    "structure": "Non-QM bank statement 85% LTV accepting DACA (lender-specific).",
    "numbers": "Illustrative: deposits $600K x 50% / 24 = $12,500/mo.",
    "why": "Returns are too low for conventional, but bank statements work. Non-QM accepts DACA. Deposits show real cash flow.",
    "alternatives": "Conventional full doc was considered but returns are low. FHA was considered but ineligible.",
    "watch": "24 months of business deposits with no declining trend; EAD renewal filed before expiration; shop lease running at least 12 months past closing."
   },
   {
    "t": "Couple both with DACA",
    "who": "Ana and Pedro, 30 and 31, dental assistant and electrician, Miami FL",
    "situation": "Both have DACA and SSNs. Combined W-2 income is $105K. They want a $380K townhome with 10% down.",
    "structure": "Conventional 90% if eligible (verify) or non-QM 85%; both EADs must be current.",
    "numbers": "Illustrative: $342,000 loan; DTI 42%.",
    "why": "FHA is ineligible after ML 2025-09; conventional may still be available. Both incomes qualify. Lower down payment preserves savings.",
    "alternatives": "Non-QM was considered as fallback with higher cost. FHA was considered but is ineligible.",
    "watch": "Both EADs valid through closing; lender DACA overlay confirmed for both borrowers; Florida insurance quote bound before closing."
   },
   {
    "t": "DACA renewal pending",
    "who": "Sofia, 28, staff accountant, Temecula",
    "situation": "Sofia's EAD expires in 4 months and she filed renewal 2 months ago. She wants to close in 45 days. Her income is $78K.",
    "structure": "Lender-specific: some accept the renewal receipt (I-797C) with current EAD; others require approval.",
    "numbers": "Illustrative: $500K purchase, 90% LTV.",
    "why": "Conventional may work with the receipt. Choosing a lender with a renewal-receipt policy avoids delay. Her income supports the loan.",
    "alternatives": "Waiting for renewal approval was considered but risks losing the house. FHA was considered but is ineligible.",
    "watch": "Renewal processing time; lender policy; EAD validity at closing."
   }
  ],
  "qa": [
   {
    "q": "Can DACA recipients get FHA loans now?",
    "a": "No. Under ML 2025-09, non-permanent residents including DACA are ineligible for FHA case numbers assigned on or after May 25, 2025."
   },
   {
    "q": "Can they get conventional loans?",
    "a": "Possibly. Fannie/Freddie non-citizen guidance has allowed DACA with lawful-presence documentation, but lender overlays vary and policy may change - verify with each lender before quoting."
   },
   {
    "q": "What documents prove DACA status?",
    "a": "EAD with category C33 and the I-797 approval notice. Keep copies of renewal receipts if applicable."
   },
   {
    "q": "What if the EAD expires soon?",
    "a": "Lenders may require the renewal receipt or approval. Policies vary."
   },
   {
    "q": "Can DACA borrowers use non-QM?",
    "a": "Yes, many non-QM programs accept DACA. Pricing is higher than conventional."
   },
   {
    "q": "Can they use VA?",
    "a": "Only if they are veterans, which is rare. VA requires eligible service."
   },
   {
    "q": "Do they need ITIN programs?",
    "a": "Usually not, since DACA recipients typically have SSNs. ITIN programs are for borrowers without SSNs."
   },
   {
    "q": "Are gifts allowed?",
    "a": "Per program rules. Document the donor and transfer."
   }
  ],
  "aeQuestions": [
   "Do you currently allow DACA on conventional loans?",
   "What EAD expiration requirement?",
   "Non-QM DACA LTV caps?",
   "Gift policy?",
   "Reserves?",
   "Income docs?",
   "Do you currently allow DACA on conventional loans, and has your overlay changed this year?",
   "Do you accept an I-797C renewal receipt with an EAD expiring within 6 months?",
   "What non-QM LTV caps apply to DACA borrowers?"
  ],
  "redFlags": [
   "Expired EAD without renewal",
   "Misrepresented status",
   "Fake documents",
   "Straw buyer",
   "Untraceable funds",
   "Occupancy fraud"
  ],
  "pricing": "Pricing depends on path: conventional pricing if eligible, otherwise non-QM pricing. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Immigrant advocacy organizations",
   "DACA support groups",
   "Bilingual community events",
   "Employers with DACA staff",
   "Immigration attorneys"
  ],
  "checklist": [
   "EAD C33 and I-797",
   "SSN verification",
   "Income docs",
   "Credit",
   "Assets",
   "Appraisal",
   "Lender overlay confirmation",
   "Renewal receipt if near expiry",
   "DTI",
   "ATR",
   "EAD (C33) and I-797 copies with expiration date calendared",
   "Written confirmation of lender's current DACA policy",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_io_nonqm": {
  "matrix": [
   [
    "Min FICO",
    "680-700 floor; 720+ for 75-80% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "70-80%; usually 5-10 pts below the same program without IO (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "70-75% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "60-70% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K-$250K minimum to $3M+ (lender-specific)"
   ],
   [
    "Max DTI / DSCR min",
    "Consumer: 43-50% on the fully amortizing payment; DSCR investor: some lenders calculate on the IO payment, others on amortizing (lender-specific)"
   ],
   [
    "Reserves",
    "6-12 months; more with IO than the same loan amortizing (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "2-4 years; IO often unavailable on short-seasoning tiers (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo, 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On business-purpose investment where state law allows; none on owner-occupied non-QM consumer loans (1026.43(g))"
   ],
   [
    "Interest-only",
    "5, 7 or 10-year IO; 30-yr and 40-yr terms (40-yr = 10 IO + 30 amortizing) on some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "IO adjuster stacks on base non-QM pricing (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL (verify); CA MLDS disclosure for broker-arranged business-purpose loans"
   ]
  ],
  "walkthrough": [
   "Classify the loan: consumer (owner-occupied/second home - ATR applies) or business-purpose investment (ATR generally does not apply)",
   "Document why IO fits: variable income timing, investment cash-flow strategy, planned sale or refinance, retirement liquidity",
   "For consumer loans, qualify on the fully amortizing payment over the remaining term after IO at the greater of note or fully indexed rate (ARMs)",
   "For DSCR, ask whether DSCR is computed on IO PITIA or amortizing - many lenders allow IO for DSCR, which can rescue a thin ratio",
   "Check that the underlying doc type (bank statement, asset depletion, DSCR) allows IO and at what LTV",
   "Present a side-by-side payment schedule: IO years, recast payment, and total interest",
   "Run ATR 8 factors and residual-income sanity check for consumer loans",
   "Confirm reserves meet the higher IO requirement",
   "Check HPML: if APR exceeds APOR thresholds, escrow and HPML appraisal rules apply",
   "ARM disclosures (CHARM booklet, program disclosure) if ARM",
   "Confirm no negative amortization or balloon in the note",
   "Verify CD projected payments table shows the IO-to-amortizing change"
  ],
  "incomeExample": {
   "title": "40-year term with 10-year IO: what qualifies vs what is paid",
   "steps": [
    "1. Loan amount $600,000 (owner-occupied, bank-statement income)",
    "2. IO payment during years 1-10 (illustrative) = $3,500/mo",
    "3. Amortizing payment years 11-40 over 30 years (illustrative) = $4,000/mo",
    "4. Qualifying uses $4,000 (fully amortizing over remaining term)",
    "5. Taxes and insurance $700; other debts $800",
    "6. Qualifying income (24-mo bank statement) $12,000/mo",
    "7. DTI = ($4,000 + $700 + $800) / $12,000 = 45.8%",
    "8. If the same borrower bought an investment and DSCR is calculated on IO: rent $4,400 / ($3,500 + $700) = 1.05 vs amortizing 0.94"
   ],
   "result": "Consumer loan qualifies on the higher payment at 45.8%; on an investor DSCR loan, IO-based calculation turns a 0.94 into a 1.05 (illustrative)."
  },
  "scenarios": [
   {
    "t": "Seasonal venue owner smoothing cash flow",
    "who": "Rachel, 44, wedding venue owner, Temecula",
    "situation": "Rachel's revenue is concentrated May through October. Her 24-month bank statements qualify her comfortably on the amortizing payment. She wants lower fixed costs during winter and plans to make lump-sum principal payments each fall. She is buying a $800K home.",
    "structure": "24-month bank statement with 10-yr IO, 75% LTV, owner-occupied; qualify on amortizing payment; document curtailment plan.",
    "numbers": "Illustrative: IO saves about $500/mo early; fall curtailment of $30,000 lowers recast payment.",
    "why": "IO matches her business cycle while she still qualifies under ATR. Curtailments reduce recast shock. No prepay penalty on owner-occupied non-QM.",
    "alternatives": "An amortizing bank-statement loan was considered but tightens winter cash flow. A HELOC for winter was considered but has variable cost.",
    "watch": "Payment rises at year 11 unless she curtails; reserves must cover winter months; IO is non-QM, so no prepay penalty, but recast fees may apply."
   },
   {
    "t": "Investor rescuing a thin DSCR",
    "who": "Tom, 40, investor, Phoenix AZ",
    "situation": "Tom is buying a $500K rental where rent is $3,000. Amortizing PITIA is $3,150 (DSCR 0.95). His lender calculates DSCR on IO payment for IO loans. He plans a 7-year hold.",
    "structure": "DSCR with 10-yr IO, 75% LTV; IO PITIA $2,800.",
    "numbers": "Illustrative: rent $3,000 / IO PITIA $2,800 = 1.07.",
    "why": "IO avoids the sub-1.00 pricing tier. Cash flow improves. Recast falls after his planned sale.",
    "alternatives": "A larger down payment was considered but would reduce capital for the next deal. A sub-1.00 DSCR program was considered but priced higher.",
    "watch": "Payment rises at year 11 when IO ends; rent must grow to cover the amortizing payment; prepay term must match his 7-year plan."
   },
   {
    "t": "Retiree preserving liquidity",
    "who": "Linda, 66, retired executive, Carlsbad",
    "situation": "Linda qualifies with asset depletion. She wants the lowest payment to keep liquidity for travel and grandchildren's education. She expects to downsize again in 8-10 years.",
    "structure": "Asset depletion IO 70% LTV, 10-yr IO; qualify on amortizing.",
    "numbers": "Illustrative: IO payment $4,000 vs amortizing $4,800.",
    "why": "IO aligns with her expected hold period. She still qualifies on the full payment. Liquidity is preserved.",
    "alternatives": "A cash purchase was considered but reduces liquidity. An amortizing loan was considered but has a higher payment.",
    "watch": "Sale should occur before IO ends; home values may not rise; asset depletion income depends on portfolio values staying near current levels."
   },
   {
    "t": "Investor planning a 3-year hold",
    "who": "Sam, 38, investor, Las Vegas NV",
    "situation": "Sam is buying a $450K rental to hold 3 years then sell. He wants maximum cash flow during the hold. He has 4 other rentals.",
    "structure": "DSCR IO 75% LTV with 3-year step-down prepay matched to plan.",
    "numbers": "Illustrative: rent $2,600 vs IO PITIA $2,300 = 1.13.",
    "why": "IO maximizes cash flow during the hold. Prepay matches his exit. DSCR passes comfortably.",
    "alternatives": "Hard money was considered but costs more. An amortizing DSCR loan was considered but gives lower cash flow.",
    "watch": "Selling before prepay ends triggers penalty; market timing; vacancy."
   },
   {
    "t": "Physician directing cash to investments",
    "who": "Ana, 37, physician, Chicago IL",
    "situation": "Ana earns well and wants to put cash into retirement accounts rather than principal. She is buying a $900K home in the suburbs. She has 20% down.",
    "structure": "Full-doc IO non-QM 80% LTV; compared with physician loan.",
    "numbers": "Illustrative: IO payment about $900/mo lower.",
    "why": "IO gives cash flexibility. She qualifies on the full payment. Comparing with a physician loan ensures lowest cost.",
    "alternatives": "A physician loan was considered and is amortizing only; chosen if lower total cost. An amortizing jumbo was considered too.",
    "watch": "The monthly savings must actually go into retirement accounts; payment rises when IO ends; IO non-QM pricing must be compared to the physician loan total cost."
   },
   {
    "t": "Orlando investor squeezed by insurance",
    "who": "Mike, 50, small-business owner and investor, Orlando FL",
    "situation": "Mike owns four rentals and is buying a fifth. Florida insurance increases pushed the amortizing DSCR on the new property to 0.92. His lender calculates DSCR on IO PITIA for IO loans.",
    "structure": "DSCR with 10-yr IO, 70% LTV; prepay 3-year step-down.",
    "numbers": "Illustrative: rent $2,500 vs IO PITIA $2,350 -> DSCR 1.06.",
    "why": "IO keeps him above 1.00 without a sub-1.00 tier. Cash flow improves. His experience supports approval.",
    "alternatives": "A larger down payment was considered but slows his acquisitions. A sub-1.00 program was considered but priced higher.",
    "watch": "Payment rises at year 11; Florida insurance increases can drop DSCR; rent growth must keep pace."
   }
  ],
  "qa": [
   {
    "q": "Is an interest-only loan QM?",
    "a": "No. Under 1026.43(e)(2) a QM cannot have interest-only payments, so an owner-occupied IO loan is non-QM. The lender must document all eight ATR factors."
   },
   {
    "q": "What payment is used to qualify owner-occupied IO loans?",
    "a": "The fully amortizing payment over the term remaining after the IO period. For ARMs it is calculated at the greater of the note rate or fully indexed rate."
   },
   {
    "q": "Is DSCR calculated on the IO payment?",
    "a": "It is lender-specific: some lenders use IO PITIA, others use the amortizing payment. Ask before structuring, because it can move a 0.95 ratio to above 1.00."
   },
   {
    "q": "Are prepayment penalties allowed on IO loans?",
    "a": "Only on business-purpose investment loans where state law allows. Non-QM consumer loans generally cannot carry prepayment penalties under 1026.43(g)."
   },
   {
    "q": "What happens when the IO period ends?",
    "a": "The payment recasts to fully amortize the balance over the remaining term. On a 30-year loan with 10 years IO, the balance amortizes over 20 years, so the jump can be large."
   },
   {
    "q": "Can borrowers pay extra principal during IO?",
    "a": "Usually yes, without penalty on consumer loans. The next IO payment drops because interest is charged on a lower balance."
   },
   {
    "q": "What is a 40-year IO loan?",
    "a": "Typically 10 years interest-only followed by 30 years amortizing (lender-specific). It lowers the recast payment compared with a 30-year IO loan."
   },
   {
    "q": "What disclosures matter?",
    "a": "The LE and CD projected-payments table must show the IO period and the payment change. ARM disclosures apply to IO ARMs, and the CA MLDS applies to broker-arranged loans where required."
   }
  ],
  "aeQuestions": [
   "Do you calculate DSCR on IO or amortizing payment?",
   "What is the IO pricing adjuster by LTV?",
   "Do you offer 40-year IO terms?",
   "Is a recast available after curtailment?",
   "What are LTV caps for IO vs non-IO?",
   "What reserves apply to IO loans?",
   "Do you calculate DSCR on the IO payment or the amortizing payment?",
   "Do you offer 40-year terms with 10-year IO, and at what LTV?",
   "Do you allow IO on bank-statement and asset-depletion files, and at what LTV cap?"
  ],
  "redFlags": [
   "No reserves to absorb recast payment",
   "Borrower doesn't understand IO",
   "Declining income",
   "Occupancy misrepresentation",
   "Undisclosed debt",
   "Using IO to stretch beyond affordability"
  ],
  "pricing": "IO adds an adjuster on top of base program pricing that grows with LTV and lower FICO. Compare total interest paid over the IO period and the recast payment, not just the start payment. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Real estate investors seeking cash flow",
   "Self-employed borrowers with seasonal income",
   "CPAs and financial planners",
   "Retirees seeking liquidity",
   "Investor-friendly agents"
  ],
  "checklist": [
   "IO disclosure and payment schedule signed",
   "ATR documentation (consumer loans)",
   "Qualifying payment calculation",
   "Reserves",
   "Appraisal",
   "Income docs",
   "Credit",
   "Prepay disclosure (investor)",
   "ARM disclosures if applicable",
   "Insurance",
   "Payment schedule showing IO years and recast payment signed",
   "Documented reason IO fits the borrower's finances",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 },
 "b_atr_full_doc": {
  "matrix": [
   [
    "Min FICO",
    "620-660 floor; 700+ for 85-90% LTV (lender-specific)"
   ],
   [
    "Max LTV purchase",
    "80-90% (lender-specific)"
   ],
   [
    "Max LTV rate/term",
    "80-85% (lender-specific)"
   ],
   [
    "Max LTV cash-out",
    "70-80% (lender-specific)"
   ],
   [
    "Loan amount range",
    "~$150K to $3M (lender-specific)"
   ],
   [
    "Max DTI",
    "50-55%; some to 60% with residual income and reserves (lender-specific)"
   ],
   [
    "Reserves",
    "3-12 months; more at higher DTI (lender-specific)"
   ],
   [
    "Credit-event seasoning",
    "Shorter than agency: often 1-2 years after BK/FC with full doc (verify)"
   ],
   [
    "Property types",
    "SFR, PUD, condo (including some non-warrantable), 2-4 unit"
   ],
   [
    "Occupancy",
    "Primary, second home, investment"
   ],
   [
    "Prepayment penalty (investor)",
    "On investment where state law allows; none on owner-occupied non-QM"
   ],
   [
    "Interest-only",
    "Available on some programs (lender-specific)"
   ],
   [
    "Typical pricing vs agency",
    "Above agency; often the cheapest non-QM tier because income is fully documented (lender-specific)"
   ],
   [
    "States",
    "CA, NV, AZ, FL, IL (verify)"
   ]
  ],
  "walkthrough": [
   "Document why the file is non-QM: DTI above AUS approval, credit event inside agency waiting period, loan feature (IO), or price above QM threshold",
   "Collect agency-style full documentation: paystubs, W-2s, 2 years returns, transcripts, VOE",
   "Calculate income using agency methods (Fannie 1084-style for self-employed)",
   "Compute DTI; identify compensating factors (reserves, residual income, low payment shock)",
   "Run residual-income test (often lender-specific minimum by household size, similar to VA tables)",
   "Review credit history; document any credit events with explanation",
   "Verify assets and reserves",
   "Document all 8 ATR factors (income, employment, payment, simultaneous loans, other obligations, DTI/residual, credit history, mortgage-related obligations)",
   "Appraisal",
   "Disclose non-QM status and loan terms clearly",
   "Close"
  ],
  "incomeExample": {
   "title": "55% DTI with residual income test",
   "steps": [
    "1. Household gross income: borrower $7,000 + spouse $3,000 = $10,000/mo",
    "2. Proposed PITIA (illustrative) $4,200",
    "3. Other debts: student loans $700 + auto $600 = $1,300",
    "4. DTI = ($4,200 + $1,300) / $10,000 = 55%",
    "5. Estimated taxes and withholdings $2,000",
    "6. Residual income = $10,000 - $2,000 - $5,500 = $2,500/mo",
    "7. Lender residual minimum for family of 4 (lender-specific) = $2,000 -> passes",
    "8. Reserves: 6 months PITIA = $25,200; verified $40,000"
   ],
   "result": "Qualifies at 55% DTI because residual income and reserves offset the ratio (illustrative)."
  },
  "scenarios": [
   {
    "t": "Teacher couple with student loans",
    "who": "Maria, 40, middle-school teacher, Chula Vista",
    "situation": "Maria and her husband, a school counselor, have stable W-2 income totaling $120K. Their federal student loans are on standard repayment at $1,100/mo. DU returns Refer/Approve-Ineligible at 54% DTI. They have $40K in reserves and want a $650K townhome with 15% down.",
    "structure": "ATR-in-full non-QM 85% LTV at 54% DTI with a residual-income test; 6 months reserves; full agency-style documentation including transcripts.",
    "numbers": "Illustrative: income $10,000/mo; PITIA (illustrative) $4,200 + debts $1,300 -> DTI 55%; residual ~$2,500 vs lender minimum $2,000 for a family of four.",
    "why": "Agency AUS won't approve over 50%, but this program accepts higher DTI when residual income and reserves are strong. Full documentation earns the best pricing tier in non-QM. Their public-sector jobs are highly stable, which supports ATR.",
    "alternatives": "FHA was considered but its AUS also struggled at this DTI and adds mortgage insurance. CalHFA was considered but has DTI caps too; waiting to pay down loans was considered but rents are rising.",
    "watch": "Payment shock from current rent of $3,000; any change to student-loan repayment under 2026 federal rules; residual income must be recalculated if taxes change."
   },
   {
    "t": "Mechanic 18 months after bankruptcy",
    "who": "John, 45, auto mechanic, Phoenix AZ",
    "situation": "John filed Chapter 7 after a medical crisis and was discharged 18 months ago. He has 10 years with the same dealership and rebuilt credit to 660. Agency requires 4 years after Chapter 7 (2 with extenuating circumstances). He wants a $400K home with 20% down.",
    "structure": "ATR full-doc credit-event tier 80% LTV; discharge papers and medical documentation in file; 6 months reserves.",
    "numbers": "Illustrative: $320K loan; DTI 42%.",
    "why": "Full documentation earns better pricing than alt-doc credit-event programs. His long job tenure supports ATR. 18 months seasoning qualifies on many full-doc non-QM matrices.",
    "alternatives": "FHA was considered (2 years after BK7) but is still 6 months away. Waiting was considered but rents are rising.",
    "watch": "Seasoning measured to note date; letter of explanation; no new derogatory credit."
   },
   {
    "t": "Nurse supporting a large family",
    "who": "Ana, 38, registered nurse, Las Vegas NV",
    "situation": "Ana supports four children with stable hospital income of $105K plus child support received of $1,200/mo. Her DTI is 52% on a $450K purchase. Her income has increased each of the last three years.",
    "structure": "ATR full doc 85% LTV with residual income; child support documented by decree and 12 months receipt.",
    "numbers": "Illustrative: income $9,950/mo; residual $2,800 vs lender minimum $2,400 for a family of five.",
    "why": "Agency caps DTI around 50%. Full doc with residual income captures her true ability to repay. Child support with continuance strengthens income.",
    "alternatives": "FHA was considered but DTI and MIP made it costlier. A smaller home was considered but wouldn't fit her family.",
    "watch": "Child-care costs not in DTI; child support continuance at least 3 years; payment shock."
   },
   {
    "t": "Contractor with equipment loans",
    "who": "Tom, 50, general contractor, Temecula",
    "situation": "Tom's tax returns support $160K income, but personal guarantees on equipment loans push DTI to 53%. The business pays those loans directly. He wants a $750K home with 20% down.",
    "structure": "ATR full doc 80% LTV; exclude business-paid debt with 12 months proof of business payment (lender-specific).",
    "numbers": "Illustrative: DTI drops from 53% to 44% after exclusion.",
    "why": "Full documentation earns better pricing than bank-statement programs. Excluding business-paid debt reflects his real obligations. Strong returns satisfy ATR.",
    "alternatives": "A bank-statement program was considered but costs more. Agency was considered but DU didn't approve the debt exclusion.",
    "watch": "Business-paid debt documentation; business cash flow analysis; declining income."
   },
   {
    "t": "Investor with Schedule E losses",
    "who": "Sam, 55, rental investor, Chicago IL",
    "situation": "Sam owns 6 rentals, and depreciation and repairs create paper losses on Schedule E. His personal DTI is 52% after rental losses. He wants to buy a new $600K primary residence.",
    "structure": "ATR full doc 80% LTV with rental income calculated per lender method (add back depreciation).",
    "numbers": "Illustrative: adding back $40K depreciation lifts income and drops DTI from 52% to 47%.",
    "why": "Agency DTI limits block approval. Full doc with add-backs reflects real cash flow. It prices better than alt-doc programs.",
    "alternatives": "DSCR was considered but only works for investment property. A bank statement program was considered but his income is better on returns.",
    "watch": "Depreciation add-backs per lender method; vacancy factor on rental income; reserves for each of his 6 rentals."
   },
   {
    "t": "Retiree with pension and Social Security",
    "who": "Linda, 66, retired teacher, Orlando FL",
    "situation": "Linda's pension and Social Security total $5,500/mo. Her DTI is 52% on a $300K condo purchase. She has $80K in reserves.",
    "structure": "ATR full doc 80% LTV with residual income.",
    "numbers": "Illustrative: residual $2,200/mo.",
    "why": "Agency DTI limits block approval. Full doc with residual income shows ability to repay. Reserves strengthen the file.",
    "alternatives": "Asset depletion was considered but her assets aren't large enough. A smaller condo was considered but she prefers this building.",
    "watch": "Pension and Social Security are fixed and must cover HOA increases; Florida milestone and SIRS compliance; residual income above lender minimum."
   }
  ],
  "qa": [
   {
    "q": "What is ATR-in-full?",
    "a": "A non-QM loan with full documentation where the lender satisfies Ability-to-Repay without the QM presumption. It often allows higher DTI or shorter credit-event seasoning."
   },
   {
    "q": "What residual income is required?",
    "a": "Lender-specific tables by household size, often modeled on VA residual income. Residual is income left after taxes and all monthly obligations."
   },
   {
    "q": "What DTI is allowed?",
    "a": "Usually 50-55%, sometimes 60% with strong reserves and residual income (lender-specific). Compensating factors must be documented."
   },
   {
    "q": "Is ATR-in-full QM?",
    "a": "No. It is non-QM, so the lender documents all eight ATR factors."
   },
   {
    "q": "Can credit-event seasoning be shorter?",
    "a": "Yes, often 1-2 years after BK or foreclosure with full doc. Agency waiting periods are longer."
   },
   {
    "q": "Can it have a prepayment penalty?",
    "a": "Only on business-purpose investment loans where state law allows. Owner-occupied non-QM consumer loans cannot carry prepayment penalties."
   },
   {
    "q": "Is IO available?",
    "a": "Some programs offer IO. IO adds pricing and requires qualifying on the amortizing payment."
   },
   {
    "q": "Why choose full-doc non-QM over bank statement?",
    "a": "Pricing is usually better because income is fully verified. It also avoids expense factors."
   }
  ],
  "aeQuestions": [
   "What is your DTI max and compensating factors?",
   "What residual-income table do you use?",
   "What credit-event seasoning applies?",
   "What are LTV caps?",
   "What reserves are required?",
   "Is IO available?",
   "What residual-income table and household-size minimums do you use?",
   "How do you treat business-paid debt and Schedule E add-backs?",
   "Which credit-event seasoning tiers apply with full documentation?"
  ],
  "redFlags": [
   "Income documentation inconsistent with transcripts",
   "Undisclosed debts",
   "Occupancy misrepresentation",
   "Borrower stretching beyond affordability",
   "Insufficient residual income",
   "Declining income trend"
  ],
  "pricing": "ATR full-doc pricing depends on FICO, LTV, DTI, credit history and reserves. It is often the cheapest non-QM tier but still above agency. Steven compares offers on total cost over the borrower's realistic hold period (rate, points, lender fees, prepayment exposure, required reserves), not the headline rate. Broker compensation must never drive the lender or program choice: under the LO Comp Rule (12 CFR 1026.36(d)/(e)) compensation cannot vary with loan terms and the anti-steering safe harbor calls for presenting the lowest-rate, lowest-total-cost and no-risky-feature options the borrower likely qualifies for; Steven applies the same standard on business-purpose loans where Reg Z may not technically apply.",
  "marketing": [
   "Agents with buyers who got AUS Refer",
   "Credit counselors",
   "Employers with stable workforces (schools, hospitals)",
   "CPAs",
   "Veteran groups"
  ],
  "checklist": [
   "Full income docs and transcripts",
   "DTI and residual income calc",
   "ATR factor documentation",
   "Credit and explanations",
   "Assets and reserves",
   "Appraisal",
   "Non-QM disclosure",
   "Occupancy certification",
   "VOE",
   "Insurance",
   "Residual income worksheet by household size",
   "Written reason the loan is non-QM (DTI, seasoning or feature)",
   "NMLS IDs (company 1921615, LO 2449246) and CA DRE 01988316 correct on application and disclosures",
   "Anti-steering file note: comparable options shown, including lowest-rate and lowest-total-cost options the borrower likely qualifies for"
  ],
  "updated": "2026-11"
 }
});
