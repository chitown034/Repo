/* Outside-the-box qualifying strategies — structured for side-by-side comparison.
   Fields: problem (what it solves), mech (how it works), cost (who pays / how much), pay1 (year-1 payment effect),
   payLT (long-term cost effect), qual (qualifying effect), progs (program compatibility), cap (concession-cap treatment),
   time (how long to set up), risk (what can go wrong), best (best when), avoid (avoid when), docs (what's needed), cite (rule source). */
const ST = (id,t,tags,o)=>({id,t,tags,...o});
const STRATEGIES2 = [
ST("S01","Temporary 2-1 buydown funded by seller credit",["credit","lowpay","fthb","rate"],{
 problem:"Payment is too high in years 1–2 while the buyer's income is growing or they're absorbing moving costs.",
 mech:"Seller (or agent/builder) deposits a subsidy into an escrow account; the servicer draws from it so the borrower pays as if the rate were 2% lower in year 1 and 1% lower in year 2. The note rate never changes; the buyer qualifies at the note rate.",
 cost:"Seller-paid. ≈2.3% of the loan on a 2-1 at 6.5% ($400k → ≈$9,100). Counts against the seller-credit cap (VA: counts as a closing cost, not a 4% concession, when paid by seller to lender escrow — verify).",
 pay1:"−$500/mo on $400k @ 6.5% (year 1); −$257/mo year 2; full payment year 3+.",
 payLT:"No long-term saving; any unused subsidy is credited to the borrower at refinance/payoff.",
 qual:"None — borrower qualifies at the note rate (agency rule). Helps affordability, not approval.",
 progs:"VA, FHA, Conventional, USDA, most Jumbo. Not DSCR.",
 cap:"Inside the seller-credit cap (Conv 3/6/9%, FHA 6%, USDA 6%; VA: closing-cost bucket).",
 time:"1–2 days — lender buydown agreement + escrow at closing.",
 risk:"Seller may prefer a price cut; borrower must be able to afford the full payment by year 3; refinance before year 2 wastes the unused subsidy (it is refunded, not lost).",
 best:"Rates are elevated and expected to fall; seller has few offers; buyer expects raises.",
 avoid:"Buyer plans to refinance within a year; buyer can't afford the note-rate payment.",
 docs:["Buydown agreement","Escrow instructions","Updated LE/CD"],cite:"Fannie B2-1.4-04; VA Pamphlet 26-7 Ch. 8 (seller concessions); FHA 4000.1 II.A.4.d"}),
ST("S02","3-2-1 buydown (deeper, 3-year)",["credit","lowpay","rate","newbuild"],{
 problem:"Same as 2-1 but for a steeper 3-year ramp — typically builder-funded on new construction.",
 mech:"Subsidy covers 3% / 2% / 1% rate reductions in years 1–3.",cost:"≈4.5–5% of loan ($400k → ≈$18,600). Usually exceeds a resale seller's willingness; common from builders' in-house lenders.",
 pay1:"−$730/mo year 1 on $400k @ 6.5%; −$500 year 2; −$257 year 3.",payLT:"None; unused subsidy refunded.",qual:"None (qualify at note rate).",progs:"VA, FHA, Conv, USDA.",cap:"Inside cap; often pushes FHA to its 6% limit.",time:"1–2 days.",
 risk:"Builder may inflate price to fund it — check comps; payment jump in year 4.",best:"New construction with builder incentives; buyer with a known income ramp (residency → attending, enlisted → re-enlistment bonus).",avoid:"Resale with a tight seller; buyer with flat income.",
 docs:["Builder incentive addendum","Buydown agreement"],cite:"Same as S01"}),
ST("S03","Permanent rate buydown (discount points) with seller credit",["credit","rate","longhold"],{
 problem:"Buyer will hold the loan long enough that a lower rate for 30 years beats a 2-year subsidy.",
 mech:"Seller credit pays discount points; the note rate drops for the life of the loan.",cost:"≈1 point ≈ 0.25% rate (varies with the rate sheet). $400k: $4,000 per point.",
 pay1:"−$65/mo per 0.25% on $400k.",payLT:"Saves for the life of the loan; break-even typically 4–7 years.",qual:"Lower note rate lowers the qualifying payment → improves DTI (unlike temp buydowns).",
 progs:"All programs (VA: points are an allowable borrower/seller cost).",cap:"Inside cap (VA: unlimited seller-paid points outside the 4%).",time:"Lock desk — same day.",
 risk:"Refinancing or selling early forfeits the points; rate sheets with flat buy-down curves give poor value.",best:"Buyer keeps the loan 5+ years; DTI is tight; VA buyer (seller can pay unlimited points).",avoid:"Expected refi inside 3 years; the Market Intel lean says rates are falling.",
 docs:["Rate sheet / PPE screenshot","Points break-even calc"],cite:"Reg Z §1026.37 (LE points disclosure)"}),
ST("S04","Price reduction vs credit — the comparison",["credit","negotiate"],{
 problem:"Seller offers one or the other; the buyer needs to know which is worth more.",
 mech:"A $10k price cut saves ≈$63/mo at 6.5% and $10k×LTV in loan amount; a $10k credit can fund a 2-1 buydown (−$500/mo yr 1) or points (−$160/mo permanently) or cover closing costs (keeps cash in the bank).",
 cost:"Same $ to the seller; different value to the buyer.",pay1:"Price cut: small; credit → buydown: large; credit → points: medium.",payLT:"Price cut: modest; points: largest; buydown: none.",qual:"Price cut lowers loan amount & payment slightly; credit-to-points lowers payment more.",
 progs:"All.",cap:"Price cut never hits the cap; credits do.",time:"Negotiation.",risk:"Credit over the cap is forfeited — size it to the cap; appraisal must support the price with credits.",best:"Cash-tight buyer → closing-cost credit; payment-tight buyer → buydown/points; equity-focused buyer → price cut.",avoid:"Credit exceeds allowable cap (excess is lost).",
 docs:["Side-by-side table from the Temp buydown + Concession calculators"],cite:"Program concession caps (§16.1)"}),
ST("S05","Agent-paid buydown / commission credit",["credit","lowpay","negotiate"],{
 problem:"Seller won't budge but the listing or buyer's agent will contribute to make the deal work.",
 mech:"Agent credits part of commission toward closing costs or a buydown, disclosed on the CD; VA treats buyer-broker fees under its 2024 circular rules.",cost:"Agent-paid (typically 0.5–1% of price).",pay1:"Depends on use (buydown vs costs).",payLT:"—",qual:"None directly.",
 progs:"All; VA requires the fee to be reasonable/customary and not a concession tied to lender choice.",cap:"Interested-party contribution — counts inside the cap on Conv/FHA.",time:"Broker approval 1–3 days.",
 risk:"RESPA: never in exchange for lender referral; brokerage must approve; must be on the CD.",best:"Slow listing with a motivated agent; small gap to close the deal.",avoid:"Any linkage to Steven's own lending — keep roles separate and documented.",
 docs:["Broker-approved credit letter","CD line item"],cite:"RESPA §8; VA Circular 26-24-14 (buyer-broker fees) — verify current"}),
ST("S06","Layer DPA / silent second (CalHFA, NV Home Is Possible, IHDA, AZ HFA, FL Hometown Heroes)",["lowdown","fthb","dpa"],{
 problem:"Buyer is qualified but short on cash to close.",mech:"State/county program provides a second lien (deferred or amortizing) or grant for down payment/closing costs layered on an FHA/VA/Conv first.",
 cost:"Usually a slightly higher first-mortgage rate and/or a deferred second with simple interest; some are forgivable.",pay1:"Deferred second: $0; amortizing second: +$50–$150/mo.",payLT:"Second is repaid at sale/refi.",qual:"Amortizing second counts in DTI; income/price caps apply; homebuyer education required.",
 progs:"FHA, VA, Conv (HFA Preferred/Advantage), USDA.",cap:"Separate from the seller-credit cap.",time:"2–4 weeks — reserve funds early; approval lags the first.",risk:"Program funds run out; income cap exceeded by overtime; longer closing; CLTV limits.",best:"First-time buyer under the income cap with a stable job and thin savings.",avoid:"Jumbo; investment; buyer above the AMI cap; 21-day closing.",
 docs:["Program reservation","HBE certificate","Second-lien disclosures"],cite:"Program handbooks (verify current)"}),
ST("S07","House-hack a 2–4 unit (rental income to qualify)",["multi","fthb","investor"],{
 problem:"Buyer can't qualify for a single-family in a high-cost market but can afford a multi-unit with rent offsetting the payment.",
 mech:"Buy 2–4 units as owner-occupant; 75% (VA/Conv) of market rent from the non-occupied units counts as income (VA requires landlord experience or 6 months' reserves — verify; FHA uses 75% and may need self-sufficiency on 3–4 units).",
 cost:"Higher price; VA $0 down still applies; FHA 3.5%.",pay1:"Net housing cost can be lower than a SFR after rents.",payLT:"Builds a rental portfolio.",qual:"Materially improves DTI.",
 progs:"VA, FHA, Conv (5% down on 2-unit; 3–4 units need more), not USDA.",cap:"Standard.",time:"Appraisal needs 1007/rent schedule.",risk:"Vacancy; management burden; FHA self-sufficiency test on 3–4 units; VA reserves requirement.",best:"Young buyer, military (PCS later → keep as rental with second-tier entitlement), high-rent metros.",avoid:"Buyer unwilling to be a landlord; HOA/condo restrictions.",
 docs:["Appraisal 1007/1025","Leases if occupied","Reserves"],cite:"VA 26-7 Ch. 4 (rental income); FHA 4000.1 II.A.4.c; Fannie B3-3.1-08"}),
ST("S08","Run Bank Statement AND DSCR side by side",["selfemp","investor","nonqm"],{
 problem:"Self-employed borrower's tax returns understate real cash flow.",mech:"Qualify on 12/24 months of deposits (expense factor 10–50% by industry or CPA letter) OR, for a rental, on the property's rent ÷ PITIA.",
 cost:"Rate ≈ +0.75–2.0% vs agency; 10–25% down.",pay1:"Higher payment than agency.",payLT:"Refinance to agency once returns support it.",qual:"Often the difference between 'no' and 'yes'.",progs:"Non-QM only (Angel Oak, HomeXpress, LendSure, Acra, NewFi, 5th Street, Fund Loans…).",cap:"Lender-specific 2–6%.",time:"Bank-statement analysis 2–5 days.",
 risk:"NSFs and large irregular deposits kill the file; CPA letter needed for low expense factor; prepay penalties on DSCR.",best:"2+ years self-employed; deposits ≥ 1.5× tax-return income.",avoid:"Returns already support qualification (agency is cheaper); <12 months in business.",
 docs:["12–24 mo business statements","CPA letter","Business license"],cite:"Lender matrices — verify overlays"}),
ST("S09","1-year tax return / 12-month self-employment exception",["selfemp"],{
 problem:"Borrower hasn't been self-employed for 2 years.",mech:"DU/LPA may approve with 1 year of returns if the prior 2 years were in the same field at similar income; VA/FHA allow 12 months with a 2-year history in the occupation.",
 cost:"Agency pricing.",pay1:"Agency payment.",payLT:"—",qual:"Avoids Non-QM entirely.",progs:"Conv (DU/LPA), VA, FHA.",cap:"Standard.",time:"AUS run — same day.",risk:"AUS may still ask for 2 years; income must be stable.",best:"Recent W-2 → self-employed in the same trade.",avoid:"Career change; declining income.",
 docs:["1 year returns + YTD P&L","Prior W-2s in same field"],cite:"Fannie B3-3.2-01; VA 26-7 Ch. 4; FHA 4000.1 II.A.4.c"}),
ST("S10","Asset depletion / asset utilization",["retired","asset","nonqm"],{
 problem:"Asset-rich, income-light (retirees, trust beneficiaries, recently sold a business).",mech:"Liquid assets (after down payment & reserves) ÷ term (e.g. 360 months, or 84 on some Non-QM) = monthly qualifying income. Agency version: Fannie 'employment-related assets' (needs 70% of assets, age 62 or distributions).",
 cost:"Non-QM: +0.5–1.5% rate; agency version at agency pricing.",pay1:"—",payLT:"—",qual:"Creates income where none is documented.",progs:"Non-QM (LendSure, HomeXpress, Angel Oak), Fannie B3-3.1-09 (limited), some jumbo portfolio (Advancial).",cap:"Lender-specific.",time:"3–5 days.",
 risk:"Retirement accounts may be haircut 70%; large down payment reduces assets available.",best:"$500k+ liquid; retirees who don't want to draw income.",avoid:"Assets are mostly real estate equity.",
 docs:["2 months statements all accounts","Age/ownership proof"],cite:"Fannie B3-3.1-09; lender matrices"}),
ST("S11","Jumbo VA instead of conventional jumbo + MI",["vet","jumbo"],{
 problem:"Veteran buying above the county limit — conventional jumbo wants 10–20% down and 720+.",mech:"With full entitlement there is no VA loan limit; lenders offer VA jumbo to ~$2–3M at 0% down (some cap 0-down at $1.5–2M, then 89.99% LTV).",
 cost:"Funding fee 2.15–3.3% (financeable, waived with disability); no MI.",pay1:"Lower than conv jumbo with MI at the same price.",payLT:"No MI ever.",qual:"Residual income governs; no hard DTI cap.",progs:"VA only.",cap:"4% concessions + unlimited costs.",time:"Standard VA.",
 risk:"Fewer investors; appraisal/Tidewater on luxury homes; reserves often required above $1M.",best:"San Diego/coastal CA, NV officers and senior enlisted with full entitlement.",avoid:"Partial entitlement (down payment = 25% of the gap).",
 docs:["COE","Reserves"],cite:"Blue Water Navy Act 2019 (limits removed for full entitlement)"}),
ST("S12","VA: structure seller contributions outside the 4% cap",["vet","credit"],{
 problem:"Seller-paid items pushing against the VA 4% concession limit.",mech:"VA's 4% cap covers only 'concessions' (prepaids beyond normal, payoff of buyer debt, gifts, funding fee paid by seller counts). Closing costs, discount points and reasonable prepaids are NOT concessions and are unlimited.",
 cost:"Seller.",pay1:"Points → lower rate.",payLT:"—",qual:"Seller-paid debt payoff (inside 4%) can remove DTI-killing payments.",progs:"VA.",cap:"Two buckets.",time:"Contract drafting.",
 risk:"Lender miscounts buckets — review the CD; appraisal must support price.",best:"Every VA offer — write it into the purchase contract template.",avoid:"—",
 docs:["VA concession worksheet"],cite:"VA 26-7 Ch. 8, Topic 8"}),
ST("S13","Seller pays off buyer's debts (VA concession)",["vet","dti"],{
 problem:"VA buyer's DTI/residual is tight because of a car or card payment.",mech:"Within the 4% concession, the seller pays off the buyer's installment/revolving debt at closing — the payment disappears from DTI and residual.",cost:"Seller (within 4%).",pay1:"Removes the debt payment.",payLT:"Debt gone.",qual:"Directly fixes DTI/residual.",progs:"VA (unique).",cap:"Inside the 4%.",time:"Payoff letter at closing.",
 risk:"Must be real payoff via escrow; seller may balk.",best:"A $450 car payment is the only thing blocking residual income.",avoid:"Debt exceeds 4% of price.",
 docs:["Payoff statement","CD line item"],cite:"VA 26-7 Ch. 8"}),
ST("S14","Pay down revolving debt to a specific balance (not off) before closing",["dti","credit_gap","score"],{
 problem:"DTI or score is just short; limited cash.",mech:"Underwriter can exclude a debt paid to $0 (or ≤10 months remaining on installments, with conditions); score improves most when each card drops under 30% and aggregate under 10% — use the Credit Simulator + rapid rescore.",
 cost:"Borrower cash (reduces reserves).",pay1:"Removes payments from DTI.",payLT:"Less interest.",qual:"DTI and score both improve.",progs:"All; VA/FHA allow debts with <10 months remaining to be excluded if payment is small relative to income.",cap:"n/a",time:"Rapid rescore 3–5 business days.",
 risk:"Draining reserves can fail a reserves requirement; closing an account after paydown hurts utilization.",best:"Score within 10–20 points of a pricing tier; DTI within 3 points.",avoid:"Cash needed for closing.",
 docs:["Paydown confirmation","Rapid rescore order"],cite:"Fannie B3-6-02; VA 26-7 Ch. 4; FHA 4000.1 II.A.4.b"}),
ST("S15","Rapid rescore before quoting",["credit_gap","score"],{
 problem:"Report shows a balance or error already fixed; the score is a tier below reality.",mech:"Lender submits proof (paid balance, corrected tradeline) to bureaus via the credit vendor; updated in 3–5 days — vs 30 days for a consumer dispute.",cost:"$30–$150 per bureau per tradeline (lender-paid; Reg B prohibits charging the borrower in some cases — verify).",pay1:"Better pricing tier.",payLT:"Rate/LLPA/MI savings for the loan's life.",qual:"Can move 620→640→660→680 tiers.",progs:"All.",cap:"n/a",time:"3–5 business days.",
 risk:"Only works with documentation; cannot remove accurate negatives.",best:"After S14 paydowns; corrected limits; paid collections.",avoid:"When the item is accurate and unpaid.",
 docs:["Creditor letter / statement showing new balance"],cite:"Credit vendor rules"}),
ST("S16","Add as authorized user on a seasoned, low-utilization card",["credit_gap","thin","score"],{
 problem:"Thin file or score dragged by utilization; a relative has a 10-year clean card with low balance.",mech:"AU tradeline inherits the card's history; classic FICO counts AU accounts (with anti-abuse logic). Agency AUS accepts AU accounts but underwriter may require proof of payment to count toward tradelines.",
 cost:"$0.",pay1:"—",payLT:"—",qual:"Can add 10–30 points on thin files; helps the 3-tradeline requirement on manual underwrites only if lender allows.",progs:"All; FHA manual UW may exclude AU accounts from 'tradelines'.",cap:"n/a",time:"1–2 statement cycles to report.",
 risk:"If the primary user maxes the card or pays late, it hurts; removal later drops history.",best:"Young servicemember with 1–2 accounts.",avoid:"Primary cardholder is unreliable.",
 docs:["AU confirmation from issuer"],cite:"FICO AU policy; lender overlays"}),
ST("S17","Limited-review condo / warrantability workarounds",["condo"],{
 problem:"Condo project fails full review (owner-occupancy, litigation, reserves, commercial space).",mech:"Fannie/Freddie Limited Review applies at ≤90% LTV primary (75% second home/investment — verify) and skips most project criteria; VA/FHA need project approval (FHA single-unit approval available). Portfolio lenders (Advancial, FNBA) ignore project rules.",
 cost:"Portfolio: +0.5–1% rate.",pay1:"—",payLT:"—",qual:"Property eligibility, not borrower.",progs:"Conv (limited review), FHA SUA, VA (project must be approved — many are grandfathered), portfolio.",cap:"Standard.",time:"FHA SUA 2–4 weeks; VA approval 4–8 weeks.",
 risk:"Litigation/safety issues (post-Surfside) block everything; special assessments.",best:"Established projects with minor warrantability misses.",avoid:"Structural litigation, >35% commercial, single-entity >20%.",
 docs:["Condo questionnaire","HOA budget/reserves","Litigation disclosure"],cite:"Fannie B4-2.2; HUD 4000.1 II.A.8 (SUA); VA 26-7 Ch. 16"}),
ST("S18","Portfolio lender for manufactured, non-warrantable, unique property",["mfg","condo","unique"],{
 problem:"Property type keeps getting declined by agency investors.",mech:"Banks/CUs hold the loan: Advancial FCU, First National Bank of America, Provident; Triad for manufactured; Loan United/Windsor for FHA/VA manufactured with overlays removed.",cost:"+0.5–1.5% rate, often ARM.",pay1:"Higher.",payLT:"Refi later to agency if the property qualifies.",qual:"Property-driven.",progs:"Portfolio; VA/FHA manufactured (must be on permanent foundation, titled as real property).",cap:"Lender-specific.",time:"2–4 weeks.",
 risk:"Fewer options; balloon/ARM terms.",best:"Manufactured homes on owned land (common in rural NV/AZ), co-ops, log homes.",avoid:"Mobile home on leased land without a chattel program.",
 docs:["Foundation cert (HUD 7584)","Title elimination (ALTA 7)"],cite:"HUD 4000.1 II.A.8.i; VA 26-7 Ch. 12"}),
ST("S19","Bridge loan on the departing residence",["bridge","move-up"],{
 problem:"Buyer needs equity from the current home to buy the next one; contingent offers lose.",mech:"Short-term loan secured by the departing home (or both) funds the down payment; paid off at the old home's closing. Some programs exclude the departing PITI if listed and under contract (or with 30% equity — verify).",
 cost:"1–2 points + 8–12% interest for 2–6 months ($100k × 10% × 4 mo ≈ $3,300 + points).",pay1:"Carries two payments briefly (interest-only on bridge).",payLT:"None after payoff.",qual:"Must qualify with both payments unless the departing home is excluded.",progs:"Hard money / bank bridge (JCAP, PB Financial, TaliMar, Val-Chris, Kiavi) + agency first.",cap:"n/a",time:"5–10 days.",
 risk:"Old home doesn't sell → carrying costs; appraisal shortfalls.",best:"Equity ≥ 30%; strong local market; non-contingent offer needed to win.",avoid:"Thin equity; slow market; DTI can't carry both.",
 docs:["Equity analysis","Listing agreement"],cite:"Fannie B3-6-06 (departure residence)"}),
ST("S20","Physician / professional loan with a future contract",["physician","newjob"],{
 problem:"Resident → attending; no pay stubs yet; student debt.",mech:"Doctor programs (banks/CUs, some Non-QM) accept a signed contract starting ≤90 days out, exclude/IDR-count student loans, 0–10% down to $1M+ without MI.",cost:"Slightly above agency; no MI.",pay1:"—",payLT:"—",qual:"Income from the contract; student loans treated favorably.",progs:"Portfolio doctor loans; FHA also accepts future income ≤60 days (verify).",cap:"Lender-specific.",time:"2–3 weeks.",
 risk:"Contract contingencies (licensing) must be cleared; reserves until first paycheck.",best:"MD/DO/DDS/DMD/DPM/PharmD/DVM within 10 years of training.",avoid:"Contract >90 days out.",
 docs:["Executed contract","Diploma/license"],cite:"Lender program guides"}),
ST("S21","Fully underwritten pre-approval + clean contingency package",["compete","offer"],{
 problem:"Multiple-offer market; buyer loses to cash/stronger offers.",mech:"Underwriter-reviewed approval (TBD property) with appraisal gap coverage from documented funds, 17-day close, and a VA-specific 'what VA actually requires' letter to the listing agent dispelling myths (no repairs required except MPRs; seller doesn't pay buyer costs by rule).",
 cost:"$0 (time).",pay1:"—",payLT:"—",qual:"—",progs:"All; especially VA.",cap:"n/a",time:"3–5 days up front.",risk:"Appraisal gap needs cash; VA Tidewater on tight comps.",best:"Every purchase in CA/NV/AZ metros.",avoid:"—",
 docs:["TBD underwriting approval","Proof of funds for gap","Listing-agent VA fact sheet"],cite:"—"}),
ST("S22","DACA / ITIN / foreign-national program selection",["daca","foreign","itin"],{
 problem:"No SSN, no US credit, or DACA status.",mech:"FHA accepts DACA (since 2021); Conv (Fannie) accepts DACA with EAD; ITIN/foreign national via Non-QM (Champions, Quontic, FNBA, LendSure, Oaktree) at 20–30% down with alt-credit or foreign credit reports.",cost:"Non-QM +1–3%.",pay1:"—",payLT:"—",qual:"Program eligibility.",progs:"FHA/Conv (DACA), Non-QM (ITIN/FN).",cap:"Lender-specific.",time:"Standard; EAD must be valid ≥ closing date (ideally >90 days).",
 risk:"EAD expiring mid-process; FN requires US bank account & visa type eligibility.",best:"—",avoid:"EAD within 90 days of expiry without a renewal receipt.",
 docs:["EAD / ITIN letter / passport & visa","Foreign credit report or alt-credit"],cite:"HUD ML 2021-12; Fannie B2-2-02"}),
ST("S23","5/1 (or 5/6) ARM when the hold is under 7 years",["arm","shorthold","lowpay","vet"],{
 problem:"Payment at the 30-yr fixed rate is too high; buyer will PCS/sell/refi within 5–7 years.",mech:"Starting rate typically 0.5–1.0% below fixed for the first 5 years; VA/FHA hybrid ARMs cap at 1%/yr and 5% life; conventional 2/2/5 or 5/2/5. Qualify at the greater of note or fully-indexed rate (investor-specific).",cost:"Rate risk after year 5.",pay1:"−$150–$300/mo on $400–600k.",payLT:"Depends on index path; worst case = start + 5%.",qual:"Lower qualifying payment on VA/FHA ARMs (qualify at note rate on VA 5/1 — verify); conv may qualify at a higher rate.",progs:"VA (hybrid), FHA, Conv, Jumbo, DSCR.",cap:"Standard.",time:"Same as fixed.",
 risk:"Payment shock; fewer VA ARM investors; refi costs.",best:"Military families on 3–4 year tours; jumbo balances where the savings are largest.",avoid:"Forever home; buyer can't absorb the worst-case payment.",
 docs:["ARM disclosure / CHARM booklet","Worst-case payment calc"],cite:"VA 26-7 Ch. 7 (ARMs); HUD 4000.1 II.A.8.d"}),
ST("S24","VA IRRRL from an ARM or high rate (no appraisal, no income docs)",["vet","refi"],{
 problem:"Veteran has a VA loan at >6% or a VA ARM about to adjust.",mech:"Streamline refi: no appraisal/income verification typically; 0.5% funding fee; NTB: rate drop ≥0.5% (fixed→fixed), ≥2% (fixed→ARM) or ARM→fixed any rate; recoup fees ≤36 months; 210 days + 6 payments seasoning.",cost:"≈1–2% closing costs (financeable).",pay1:"Lower.",payLT:"Lower for life.",qual:"No DTI/residual on most IRRRLs.",progs:"VA.",cap:"n/a",time:"2–3 weeks.",
 risk:"Term reset; cash-out not allowed; must be current.",best:"Rate drop ≥0.5% and staying ≥ recoupment period.",avoid:"Leaving within the recoupment window.",
 docs:["Note + payment history","NTB/recoupment worksheet"],cite:"38 U.S.C. §3709; VA Circular 26-19-22 (verify current)"}),
ST("S25","Non-taxable income gross-up (BAH/BAS, VA disability, SS, child support)",["vet","dti","income"],{
 problem:"DTI is tight and part of income is non-taxable.",mech:"Gross up non-taxable income by 25% (VA/FHA/Conv typical; VA allows the actual tax-bracket amount with documentation — verify) for DTI. Residual income uses net, so gross-up helps the ratio side only.",cost:"$0.",pay1:"—",payLT:"—",qual:"+25% on the non-taxable portion in DTI.",progs:"All (rules vary).",cap:"n/a",time:"Immediate.",risk:"Underwriter must document non-taxable status (LES, award letter).",best:"Enlisted with large BAH; disabled veterans.",avoid:"—",
 docs:["LES","VA award letter","SSA letter"],cite:"VA 26-7 Ch. 4 (gross-up); Fannie B3-3.1-01; HUD 4000.1 II.A.4.c"}),
ST("S26","Exclude installment debts with ≤10 months remaining / co-signed debts paid by others",["dti"],{
 problem:"Car or loan with a few payments left is inflating DTI.",mech:"Agency and VA/FHA allow exclusion of installment debts with ≤10 months remaining (payment must not materially affect ability to pay — VA uses judgment, FHA requires cumulative payments ≤5% of income); co-signed debts excluded with 12 months of proof the other party pays.",cost:"$0.",pay1:"—",payLT:"—",qual:"Removes payments from DTI.",progs:"All.",cap:"n/a",time:"Immediate with documentation.",risk:"Revolving accounts don't qualify; underwriter discretion.",best:"Auto loans ending within 10 months; parent co-signed student loans.",avoid:"Large payments relative to income.",
 docs:["Account statements","12 months of other party's payments"],cite:"Fannie B3-6-05; VA 26-7 Ch. 4; HUD 4000.1 II.A.4.b"}),
ST("S27","Lender-paid or single-premium MI vs monthly MI (conventional)",["conv","lowpay"],{
 problem:"Monthly PMI hurts the payment/DTI on a <20% down conventional loan.",mech:"Lender-paid MI (higher rate, no monthly MI), single-premium paid by seller credit, or split premium — compare total cost over the expected hold.",cost:"LPMI: +0.25–0.5% rate; single: 1–3% of loan (seller can pay).",pay1:"Lower than monthly MI.",payLT:"LPMI never cancels; monthly MI cancels at 78–80%.",qual:"Lower qualifying payment with LPMI/single.",progs:"Conventional.",cap:"Single premium paid by seller counts inside the cap.",time:"Pricing.",risk:"LPMI can't be cancelled — bad for long holds with fast appreciation.",best:"Short-to-mid hold; seller credit available.",avoid:"Long hold with rapid appreciation (monthly MI cancels).",
 docs:["MI quote comparison"],cite:"HPA; MI company rate cards"}),
ST("S28","Assumable VA/FHA loan with a second-lien or seller carryback for the gap",["vet","assume","rate"],{
 problem:"Seller has a 2.75–3.5% VA/FHA loan; buyer wants it but the equity gap is large.",mech:"Buyer assumes the low-rate loan (VA: buyer need not be a veteran but the seller's entitlement stays tied unless the buyer substitutes); gap covered by cash, a HELOC/second from Spring EQ/Symmetry (if allowed), or seller financing.",cost:"Assumption fee ≤$300 + VA 0.5% funding fee; second-lien rate 8–10%.",pay1:"Blended payment far below a new loan.",payLT:"Keeps the low rate for the remaining term.",qual:"Servicer underwrites the buyer (credit/income); 45–90+ day process.",progs:"VA, FHA (USDA rarely).",cap:"n/a",time:"60–120 days (servicer).",risk:"Servicer delays; seller's entitlement remains tied if buyer isn't a substituting veteran; second-lien availability.",best:"Seller note rate ≤4%, gap ≤25% of price.",avoid:"Fast closing needed; large gap with no second-lien source.",
 docs:["Servicer assumption package","Gap financing approval"],cite:"VA 26-7 Ch. 5 (assumptions); HUD 4000.1 III.A.3.c"}),
ST("S29","HELOC/HELOAN instead of cash-out refi to protect a low first-mortgage rate",["owner","equity","consolidat"],{
 problem:"Homeowner at 3% needs cash (debt consolidation, down payment on next home).",mech:"Second lien from Spring EQ/Symmetry keeps the first intact; run the Debt Consolidation calculator in both modes.",cost:"HELOC prime+margin (variable) or fixed HELOAN 8–10%; low closing costs.",pay1:"Lower blended than a full cash-out at 6.5%+.",payLT:"Pay the second off faster.",qual:"CLTV ≤80–90%; DTI ≤43–45%.",progs:"HELOC/HELOAN.",cap:"n/a",time:"2–3 weeks.",risk:"Variable rate; two payments.",best:"First-mortgage rate < current rates by 1.5%+.",avoid:"First mortgage already at/above market (then cash-out).",
 docs:["First-mortgage statement","Income docs"],cite:"—"}),
ST("S30","Reverse mortgage (HECM / HECM-for-purchase) for 62+",["age62","reverse"],{
 problem:"Retiree can't qualify on income but has equity; or wants to buy with no monthly mortgage payment.",mech:"HECM eliminates P&I (taxes/insurance still due); HECM-for-purchase funds ~40–60% of price with no payments. Financial assessment and counseling replace DTI.",cost:"Upfront MIP 2% + annual 0.5%; origination fee; counseling.",pay1:"$0 P&I.",payLT:"Balance grows; heirs sell or refinance.",qual:"Age/equity based; residual income via financial assessment.",progs:"HECM (FAR, Longbridge, Mutual of Omaha, TMAC; Liberty ⚠️).",cap:"n/a (seller concessions limited on H4P — verify)",time:"30–45 days + counseling.",risk:"Heir expectations; non-borrowing spouse protections; property charge defaults.",best:"62+ equity-rich, income-light.",avoid:"Short expected stay; heirs want the home free and clear.",
 docs:["Counseling certificate","Financial assessment docs"],cite:"HUD HECM Handbook 4235.1 / ML 2014-21+"}),
ST("S31","Builder incentive + preferred-lender match",["newbuild","credit"],{
 problem:"Builder offers $15–30k only with its in-house lender.",mech:"Get the builder's lender's LE, then ask Patriot Pacific to match or beat net cost; many builders allow outside lenders with a reduced incentive — compare the net.",cost:"—",pay1:"—",payLT:"—",qual:"—",progs:"All.",cap:"Builder credits count inside caps.",time:"Negotiation.",risk:"Builder lender rate lock games; losing the incentive.",best:"New construction in Vegas/Phoenix/Riverside.",avoid:"—",
 docs:["Competing LEs"],cite:"RESPA §9 (can't require a lender), §8"}),
ST("S32","Gift of equity from a family seller",["family","lowdown"],{
 problem:"Buying from parents/relatives below market.",mech:"Difference between appraised value and price is a gift of equity → counts as down payment (Conv/FHA/VA allow with gift letter; FHA 15% identity-of-interest rule has family exceptions).",cost:"$0 cash.",pay1:"Lower loan amount.",payLT:"—",qual:"Covers down payment & can eliminate MI.",progs:"Conv, FHA, VA.",cap:"n/a",time:"Appraisal.",risk:"Tax implications for the donor (gift tax reporting); non-arm's-length scrutiny.",best:"Parents downsizing; grandparents' home.",avoid:"Donor needs the cash.",
 docs:["Gift-of-equity letter","Appraisal"],cite:"Fannie B3-4.3-05; HUD 4000.1 II.A.4.d"}),
];
/* Compact comparison fields in display order */
const STRAT_FIELDS=[["problem","Problem it solves"],["mech","How it works"],["cost","Cost / who pays"],["pay1","Year-1 payment effect"],["payLT","Long-term cost"],["qual","Qualifying effect"],["progs","Programs"],["cap","Seller-credit cap treatment"],["time","Time to set up"],["risk","Risks / what breaks it"],["best","Best when"],["avoid","Avoid when"],["docs","Documents"],["cite","Rule source"]];
