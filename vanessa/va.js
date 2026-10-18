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
