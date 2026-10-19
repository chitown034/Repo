/* VA Toolkit — calculators and reference data for VA loans. Figures from VA Pamphlet 26-7 and 38 U.S.C. §3729 as of the
   2026 research pass; residual income tables are the long-standing Ch. 4 tables (verify the current version before quoting). */
const VA = {
  basicEntitlement:36000,
  fundingFee:{ // 2026 schedule (in effect since Apr 7 2023)
    purchase:[{maxDown:0.05,first:2.15,sub:3.30},{maxDown:0.10,first:1.50,sub:1.50},{maxDown:1,first:1.25,sub:1.25}],
    cashout:{first:2.15,sub:3.30}, irrrl:0.50, nadl:1.25, assumption:0.50,
    exempt:["Receiving VA disability compensation (any %)","Eligible for compensation but receiving retirement/active-duty pay instead","Rated eligible for compensation from a pre-discharge exam","Purple Heart recipient on active duty","Surviving spouse of a veteran who died in service or from a service-connected disability (or was totally disabled)"],
  },
  // Residual income: loan amounts ≥ $80,000, by region and family size (Pamphlet 26-7 Ch. 4). +$80 per member over 5, max +7.
  residual:{ Northeast:[450,755,909,1025,1062], Midwest:[441,738,889,1003,1039], South:[441,738,889,1003,1039], West:[491,823,990,1117,1158] },
  residualUnder80k:{ Northeast:[390,654,788,888,921], Midwest:[382,641,772,868,902], South:[382,641,772,868,902], West:[425,713,859,967,1004] },
  regionOf:{CA:"West",NV:"West",AZ:"West",WA:"West",OR:"West",CO:"West",UT:"West",ID:"West",MT:"West",WY:"West",NM:"West",AK:"West",HI:"West",
    IL:"Midwest",IN:"Midwest",IA:"Midwest",KS:"Midwest",MI:"Midwest",MN:"Midwest",MO:"Midwest",NE:"Midwest",ND:"Midwest",OH:"Midwest",SD:"Midwest",WI:"Midwest",
    FL:"South",TX:"South",GA:"South",NC:"South",SC:"South",VA:"South",TN:"South",AL:"South",MS:"South",LA:"South",AR:"South",OK:"South",KY:"South",WV:"South",MD:"South",DE:"South",DC:"South",
    NY:"Northeast",NJ:"Northeast",PA:"Northeast",CT:"Northeast",MA:"Northeast",RI:"Northeast",VT:"Northeast",NH:"Northeast",ME:"Northeast"},
  maintPerSqft:0.14, // monthly maintenance & utilities factor (verify current)
  taxBrackets:[[11925,0.10],[48475,0.12],[103350,0.22],[197300,0.24],[250525,0.32],[626350,0.35],[Infinity,0.37]], // 2025 single — estimate only
  ficaRate:0.0765,
  allowableFees:["1% flat origination fee (or itemized lender fees up to 1%)","Discount points","Appraisal and compliance inspections (VA-set fee)","Credit report","Title examination and title insurance","Recording fees and taxes","Prepaid taxes, insurance and HOA","Hazard/flood insurance","Survey (if required)","Well/septic inspections","VA funding fee","Flood zone determination","Express mail (refinances only, when needed to protect the lock)"],
  nonAllowable:["Attorney fees (other than title work)","Brokerage fees / lender's commission (when the 1% flat fee is charged)","Prepayment penalties on the old loan","HUD/FHA inspection fees for builders","Loan closing/settlement fee (if the 1% is charged)","Document preparation fees","Underwriting / processing / application fees","Notary, escrow, tax service, postage (inside the 1%)","Pest inspection on purchases (payable by the veteran in some states — verify; always allowed on refis)","Interest rate lock-in fees"],
  mprs:["Safe, structurally sound, sanitary","Working heating, electrical, plumbing, water heater","Roof with remaining life (no active leaks)","No lead-based paint hazards (pre-1978: peeling paint must be addressed)","Safe water supply and sewage disposal (well/septic tests when applicable)","Crawl space/attic access and ventilation","No wood-destroying insect damage (termite report where customary)","Adequate access from a public or permanent easement road","Mechanical systems functioning","Manufactured homes: permanent foundation, HUD tags, titled as real property"],
  docs:{
    "VA purchase":["Certificate of Eligibility (COE) via WebLGY","DD-214 (veterans) / Statement of Service (active duty) / NGB-22 & points statement (Guard/Reserve)","2 most recent LES or pay stubs","2 years W-2s (and 1099s/returns if self-employed or rental income)","2 months bank statements (all pages)","Government photo ID","VA disability award letter (if applicable — also for funding-fee exemption)","PCS orders (if relocating)","Child support/alimony orders (if any)","Divorce decree (if applicable)","Explanation letters as needed (LOE library)","Purchase contract with VA escape clause","Specific POA + alive-and-well (if deployed)","Landlord contact / rental history (manual UW)"],
    "VA IRRRL":["Current note & mortgage statement","Payment history (210 days / 6 payments seasoning)","COE (prior VA loan)","Government ID","Net tangible benefit & recoupment worksheet","Homeowner's insurance","No appraisal or income docs on most IRRRLs (lender overlays may ask for a credit score)"],
    "VA cash-out (Type I / Type II)":["Everything in VA purchase","Appraisal (full)","Payoff statements","Net tangible benefit certification (1 of 8 NTBs)","Loan comparison disclosure","Seasoning: 210 days & 6 payments on loan being refinanced"],
    "FHA":["COE not needed","2 yrs W-2s/returns, 30 days pay stubs","2 months bank statements","Photo ID + SSN card","Gift letter (if gift)","CAIVRS clearance","Landlord VOR (manual UW)"],
    "Conventional":["Same income/asset docs as FHA","PMI quote (if >80% LTV)","HOA docs (condo)","Rental income: leases + Schedule E"],
  },
  nellisBAH:{"E-1–E-3":[2050,1700],"E-4":[2070,1730],"E-5":[2220,1860],"E-6":[2490,2040],"E-7":[2610,2190],"E-8":[2760,2340],"E-9":[2880,2490],"O-1":[2200,1800],"O-2":[2400,2000],"O-3":[2700,2250],"O-4":[3000,2600],"O-5":[3200,2800]}, // planning estimates (MHA NV361) — verify at defensetravel.dod.mil
};
/* Funding fee % for a purchase */
function vaFundingFee(down,subsequent,exempt,type="purchase"){
  if(exempt) return 0;
  if(type==="irrrl") return VA.fundingFee.irrrl; if(type==="cashout") return subsequent?VA.fundingFee.cashout.sub:VA.fundingFee.cashout.first;
  const t=VA.fundingFee.purchase.find(t=>down<t.maxDown)||VA.fundingFee.purchase[2]; return subsequent?t.sub:t.first;
}
/* Entitlement: full → no down payment required (lender limits). Partial → 25% guaranty must be covered by remaining entitlement + down payment. */
function vaEntitlement(price,countyLimit,usedEntitlement,fullEntitlement){
  if(fullEntitlement) return {maxNoDown:Infinity,down:0,guaranty:price*0.25,remaining:price*0.25,note:"Full entitlement — VA guarantees 25% of any loan amount; no VA loan limit (lender limits apply)."};
  const remaining=Math.max(0,countyLimit*0.25-usedEntitlement);
  const maxNoDown=remaining*4;
  const down=Math.max(0,price*0.25-remaining);
  return {maxNoDown,down,guaranty:remaining,remaining,note:`Remaining entitlement ${Math.round(remaining).toLocaleString()} → up to $${Math.round(maxNoDown).toLocaleString()} with $0 down; above that the veteran covers 25% of the difference.`};
}
/* Residual income */
function vaResidual(i){
  const region=VA.regionOf[i.state]||"West"; const table=i.loan>=80000?VA.residual:VA.residualUnder80k;
  const fam=Math.max(1,Math.min(7,i.family)); let req=table[region][Math.min(fam,5)-1]+(fam>5?(fam-5)*80:0);
  const grossAnnual=i.grossMonthly*12, taxable=Math.max(0,grossAnnual-i.nonTaxableMonthly*12);
  let fed=0,prev=0; for(const [cap,rate] of VA.taxBrackets){const amt=Math.min(taxable,cap)-prev; if(amt>0) fed+=amt*rate; prev=cap; if(taxable<=cap) break;}
  fed=Math.max(0,fed-(i.standardDeductionEst||3000)); // crude: standard deduction reduces tax; underwriters use actual withholding from the LES/pay stub
  const fica=taxable*VA.ficaRate, stateTax=taxable*(i.stateTaxRate||0);
  const taxesMonthly=(fed+fica+stateTax)/12;
  const maint=i.sqft*VA.maintPerSqft;
  const net=i.grossMonthly-taxesMonthly-i.piti-i.hoa-maint-i.otherDebts-i.childcare-i.childSupport;
  const dti=(i.piti+i.hoa+i.otherDebts+i.childSupport)/i.grossMonthly;
  const needs120=dti>0.41; const reqAdj=needs120?req*1.2:req;
  return {region,req,reqAdj,needs120,net,pass:net>=reqAdj,dti,taxesMonthly,maint,cushion:net-reqAdj};
}
/* IRRRL tests */
function irrrlTest(i){
  const out=[];
  const seasoned=i.monthsSinceFirstPayment>=7&&i.paymentsMade>=6&&i.daysSinceFirstDue>=210; out.push(["Seasoning: 210 days from first payment due AND 6 monthly payments",seasoned]);
  let ntb=false,why="";
  if(i.oldType==="arm"&&i.newType==="fixed"){ntb=true;why="ARM → fixed: any rate qualifies";}
  else if(i.oldType==="fixed"&&i.newType==="fixed"){ntb=(i.oldRate-i.newRate)>=0.5;why="Fixed → fixed needs ≥0.50% reduction";}
  else if(i.oldType==="fixed"&&i.newType==="arm"){ntb=(i.oldRate-i.newRate)>=2.0;why="Fixed → ARM needs ≥2.00% reduction";}
  else {ntb=(i.oldRate-i.newRate)>=0.5;why="ARM → ARM: ≥0.50% reduction (verify)";}
  out.push(["Net tangible benefit — "+why,ntb]);
  const monthlySave=i.oldPI-i.newPI; const recoup=monthlySave>0?i.closingCosts/monthlySave:Infinity; out.push([`Recoupment ≤ 36 months (fees ÷ monthly savings = ${isFinite(recoup)?recoup.toFixed(1):"∞"} mo; excludes funding fee, prepaids, escrows)`,recoup<=36]);
  out.push(["Current on the existing loan (no 30-day lates in last 12 months — one allowed with LOE on some overlays)",!i.lates12]);
  out.push(["Loan term may not exceed old term + 10 years, max 30 years",i.newTerm<=Math.min(30,i.oldTerm+10)]);
  out.push(["Previously occupied as the veteran's home (occupancy certification)",!!i.occupiedBefore]);
  return {tests:out,pass:out.every(t=>t[1]),recoup,monthlySave};
}
/* COE / eligibility quick check (simplified; VA makes the final determination) */
function vaEligibility(i){
  const r=[];
  if(i.branch==="guard"||i.branch==="reserve"){ r.push(["6 years in Selected Reserve/Guard (honorable) OR 90 days active duty (Title 10) with 30 consecutive during wartime OR disability discharge", i.years>=6||i.activeDays>=90]); r.push(["Guard: 90 days Title 32 with 30 consecutive (2021 law)", i.title32Days>=90]); }
  else if(i.status==="active"){ r.push(["Currently on active duty ≥ 90 continuous days", i.activeDays>=90]); }
  else { r.push(["Wartime: 90 days active (or any with service-connected discharge)", i.activeDays>=90]); r.push(["Peacetime (post-1980 enlisted / 1981 officer): 24 continuous months or full period called (≥181 days)", i.activeDays>=181]); }
  r.push(["Discharge other than dishonorable (OTH may need VA character-of-service review)", i.discharge!=="dishonorable"]);
  if(i.spouse) r.push(["Surviving spouse: veteran died in service/from service-connected disability, or MIA/POW ≥90 days; not remarried (or remarried after 57)", true]);
  return {checks:r,likely:r.every(x=>x[1])};
}
/* ---- Tough-file VA strategies: how to approve the files most lenders miss (Pamphlet 26-7 Ch. 4 unless noted; verify current) ---- */
const VA_TOUGH=[
 {id:"T01",t:"Qualify on residual income, not DTI",fix:["highdti"],how:"VA has no DTI cap. A 50–60% DTI is approvable when residual income is at or above the regional table (120% of table if DTI > 41%) and the file has compensating factors. Underwrite the residual worksheet first; present DTI second.",cite:"26-7 Ch.4 §9–10",who:"Any VA lender without a DTI overlay (Freedom, UWM, Mortgage Solutions Financial, Loan United — verify)"},
 {id:"T02",t:"Stack VA compensating factors on the 26-6393",fix:["highdti","lowresidual"],how:"Document each: excellent long-term credit, conservative use of credit, minimal consumer debt, long employment, significant liquid assets, sizable down payment, existing equity, little or no payment shock, military benefits, high residual income, low DTI, tax credits for childcare, tax benefits of ownership. Write them on the loan analysis, not in a side note.",cite:"26-7 Ch.4 §10",who:"All"},
 {id:"T03",t:"Payment-shock narrative",fix:["highdti","lowresidual"],how:"Show current rent vs proposed PITI. A veteran paying $2,800 rent moving to a $2,950 PITI has ~5% shock — a strong factor even at 55% DTI.",cite:"26-7 Ch.4 §10",who:"All"},
 {id:"T04",t:"Gross-up non-taxable income 25% (or actual bracket)",fix:["highdti"],how:"BAH, BAS, VA disability, SS, child support: gross up 25% for DTI (VA permits the actual tax-rate percentage with documentation). Residual uses net — so the gross-up helps the ratio side.",cite:"26-7 Ch.4 §2",who:"All"},
 {id:"T05",t:"Residual boost: correct the family size and the maintenance factor",fix:["lowresidual"],how:"Family size excludes a non-purchasing spouse ONLY if they have adequate income (document); children for whom support is paid by allotment are still counted unless… verify; square footage drives $0.14/sq ft maintenance — use the appraisal's GLA, not the listing's.",cite:"26-7 Ch.4 §9",who:"All"},
 {id:"T06",t:"Exclude installment debts with ≤10 months left",fix:["highdti"],how:"Car, furniture, personal loans with ≤10 payments remaining may be excluded when the payment doesn't materially affect ability to pay — justify on the analysis.",cite:"26-7 Ch.4 §5",who:"All"},
 {id:"T07",t:"Seller pays off the veteran's debts inside the 4% concession",fix:["highdti","lowresidual"],how:"The 4% concession bucket may pay off a $450 car payment or card balances at closing — removes the payment from DTI AND residual. Closing costs/prepaids/points sit outside the 4%.",cite:"26-7 Ch.8 Topic 8",who:"All"},
 {id:"T08",t:"Student loans: deferred ≥12 months past closing = excluded",fix:["highdti"],how:"Federal loans deferred 12+ months beyond closing are excluded; otherwise use the credit-report payment or 5% ÷ 12 of the balance. Get the servicer letter.",cite:"VA Circular 26-17-02 (verify)",who:"All"},
 {id:"T09",t:"Co-signed debt paid by another for 12 months → excluded",fix:["highdti"],how:"12 months of cancelled checks from the other party.",cite:"26-7 Ch.4 §5",who:"All"},
 {id:"T10",t:"Departing residence: 75% of rent offsets PITI (with lease + deposit)",fix:["highdti"],how:"PCS or move-up: a signed lease and proof of the security deposit lets 75% of rent offset the old PITI (some lenders want 6 months' reserves or equity — compare overlays).",cite:"26-7 Ch.4 §2",who:"Lenders without the 25% equity overlay"},
 {id:"T11",t:"Part-time, second-job or overtime income with <2 years",fix:["highdti"],how:"VA allows income with 12 months' history when it's likely to continue and the employer confirms; use a VOE with the continuance question answered.",cite:"26-7 Ch.4 §2",who:"Manual UW-capable lenders"},
 {id:"T12",t:"ETS within 12 months — three ways to document",fix:["eligibility"],how:"Re-enlistment statement from the CO, a civilian job offer, or retirement pay — any one works (LOE L62). Don't let an AUS refer kill the file.",cite:"26-7 Ch.4 §2",who:"All"},
 {id:"T13",t:"No-overlay / 500–580 FICO lenders",fix:["lowfico"],how:"VA sets no minimum score. Loan United (to 500, manual UW), Mortgage Solutions Financial (manual), Freedom (VA focus), plus brokers' no-overlay investors — the file needs 12 months clean housing history and residual.",cite:"Lender matrices",who:"Loan United, Mortgage Solutions Financial, Freedom, others — verify"},
 {id:"T14",t:"CalVet for California veterans with low scores or unique property",fix:["lowfico","property"],how:"CalVet Home Loans (CA Dept. of Veterans Affairs) underwrites in-house, is more flexible on credit and property types (mobile homes in parks, farms), and offers its own insurance package. Rates/fees differ — compare. Eligibility is broader than VA for some wartime service.",cite:"CalVet program guide (verify current)",who:"CalVet (directory #9)"},
 {id:"T15",t:"Manual underwrite with non-traditional credit",fix:["lowfico","thin"],how:"No score or thin file: 12 months of rent, utilities, insurance, phone (3 sources, one housing). VA manual underwriting is routine — AUS 'refer' is not a denial.",cite:"26-7 Ch.4 §7",who:"Manual UW lenders"},
 {id:"T16",t:"Rapid rescore + paydown to cross the overlay line",fix:["lowfico"],how:"Pay revolving to <30% (then <10%), rescore in 3–5 days; often +20–40 points — enough to move from a 580 overlay lender to a mainstream VA lender with better pricing.",cite:"Credit Simulator",who:"All"},
 {id:"T17",t:"Deployment/PCS lates: SCRA + goodwill + LOE",fix:["lates"],how:"Lates during deployment are explainable (LOE L58) and sometimes SCRA violations (D27). VA allows satisfactory credit with a reasonable explanation; 12 months clean since is the usual bar.",cite:"26-7 Ch.4 §7",who:"All"},
 {id:"T18",t:"Bankruptcy/foreclosure seasoning — VA's shorter clocks",fix:["derog"],how:"Chapter 7: 2 years from discharge (1 year with extenuating circumstances + clean since). Chapter 13: 12 months of on-time plan payments + trustee OK. Foreclosure/short sale: 2 years (1 with extenuating). Entitlement used on a foreclosed VA loan stays charged until the VA is repaid — use remaining entitlement math.",cite:"26-7 Ch.4 §7",who:"All"},
 {id:"T19",t:"CAIVRS hit → repayment plan or waiver, then re-check",fix:["derog"],how:"VA debt (overpayment, prior claim) on CAIVRS must be paid or on an approved repayment plan; VA Debt Management Center can waive in hardship. Re-run CAIVRS after (LOE L67).",cite:"26-7 Ch.4 §7",who:"All"},
 {id:"T20",t:"Second-tier (remaining) entitlement — buy again while keeping the first VA home",fix:["eligibility"],how:"Remaining entitlement = 25% × county limit − entitlement in use; the veteran covers 25% of any amount above 4× remaining. Often a small down payment — not a denial. Entitlement calculator.",cite:"38 U.S.C. §3703; 26-7 Ch.2",who:"All"},
 {id:"T21",t:"One-time restoration of entitlement without selling",fix:["eligibility"],how:"If the prior VA loan is paid off (refinanced to conventional) but the home is kept, the veteran may restore entitlement once. File VA Form 26-1880 with the payoff.",cite:"26-7 Ch.2",who:"All"},
 {id:"T22",t:"Joint loan with a non-veteran, non-spouse (VA guarantees the veteran's half)",fix:["highdti"],how:"A veteran + unmarried partner/relative can take a VA joint loan: VA guarantees only the veteran's portion, so the lender requires ~12.5% down on the non-veteran half. Prior approval from VA is needed.",cite:"26-7 Ch.7",who:"Lenders doing VA joint loans (fewer)"},
 {id:"T23",t:"Tidewater: win the value before the NOV",fix:["appraisal"],how:"When the appraiser invokes Tidewater, you have 2 business days: deliver 3–5 comps, pending sales, and cost-of-upgrades; after the NOV, request a Reconsideration of Value through the lender. (LOE L80)",cite:"VA Circular 26-22-xx ROV (verify)",who:"All"},
 {id:"T24",t:"MPR repairs: escrow holdback or seller/agent-funded fixes",fix:["property"],how:"Peeling paint, missing handrails, broken windows: have the seller fix, or use a repair escrow (1.5× cost) when weather delays; lender-approved. Don't let a $400 repair kill a VA deal.",cite:"26-7 Ch.12",who:"Lenders allowing escrow holdbacks"},
 {id:"T25",t:"VA renovation (Alteration & Repair) loan for the fixer",fix:["property"],how:"Finance up to ~$50k (lender-specific) of repairs into the VA purchase so the home meets MPRs after closing; or VA EEM up to $6k for energy improvements.",cite:"26-7 Ch.7",who:"REMN, Plaza, select VA reno lenders"},
 {id:"T26",t:"Non-purchasing spouse debts in community-property states — exclude the right ones",fix:["highdti"],how:"In CA/NV/AZ/TX/WA etc. the NPS's debts count, BUT debts incurred before marriage, or by court order assigned to the NPS, can be excluded with documentation. Pull the NPS report early.",cite:"26-7 Ch.4 §5; state law",who:"All"},
 {id:"T27",t:"Child support/alimony and allotments — count the right family size and payments",fix:["lowresidual"],how:"Support paid by allotment doesn't hit the credit report — disclose it (LOE L83). Children not in the household 50%+ may be excluded from family size with documentation.",cite:"26-7 Ch.4 §9",who:"All"},
 {id:"T28",t:"IRRRL with no score / lates — streamline the refi",fix:["lowfico","lates"],how:"IRRRL requires no appraisal/income on most lender programs; one 30-day late in 12 months is often acceptable with an LOE (Loan United: no-FICO IRRRL). Reduces payment and residual pressure.",cite:"38 U.S.C. §3709",who:"Loan United, Freedom, others"},
 {id:"T29",t:"Temporary buydown funded by seller to fix YEAR-1 cash flow (not qualification)",fix:["lowresidual"],how:"Residual/DTI are computed at the note rate, but a 2-1 buydown lowers real payments in years 1–2 — pair with T07 (debt payoff) for the qualifying side.",cite:"26-7 Ch.8",who:"All"},
 {id:"T30",t:"Assumption of an existing VA loan at 2–3% (the ultimate DTI fix)",fix:["highdti","lowresidual"],how:"A 2.75% assumed payment can be $800/mo lower than a new loan — the DTI problem disappears. Buyer need not be a veteran (seller's entitlement stays tied unless substituted).",cite:"26-7 Ch.5",who:"Servicer-driven"},
 {id:"T31",t:"Disability rating pending → close with fee, refund later; permanent rating → exemption + gross-up",fix:["eligibility","highdti"],how:"Pay the funding fee at closing, refund if the effective date precedes closing (LOE L78). A rating also means non-taxable income to gross up (T04).",cite:"38 U.S.C. §3729",who:"All"},
 {id:"T32",t:"Use the VA 'alive and well' + specific POA to close while deployed",fix:["eligibility"],how:"Don't postpone closing for a deployment: VA-specific POA naming property/price/terms, commanding officer's alive-and-well letter within days of closing, spouse occupies (LOE L57/L81).",cite:"26-7 Ch.9",who:"All"},
];
function toughRank(i){ const fixes=[]; if(i.dti>41)fixes.push("highdti"); if(i.residualPct<100)fixes.push("lowresidual"); if(i.fico<620)fixes.push("lowfico"); if(i.thin)fixes.push("thin"); if(i.lates)fixes.push("lates"); if(i.derog)fixes.push("derog"); if(i.entitlement)fixes.push("eligibility"); if(i.appraisal)fixes.push("appraisal"); if(i.property)fixes.push("property");
  return {fixes,strategies:VA_TOUGH.map(s=>({s,score:s.fix.filter(f=>fixes.includes(f)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)}; }
