/* Wealth-building strategies, debt-payoff strategies, credit-repair plan — data + simulations. Illustrative only; not financial advice. */
const WEALTH = [
 {id:"W01",t:"House-hack a 2–4 unit with VA $0 down",tags:["vet","starter"],how:"Buy a duplex–fourplex as owner-occupant; tenants cover most of the PITI. 75% of market rent counts toward qualifying. Move out after 12 months and repeat with second-tier entitlement or conventional.",sim:"housHack",risk:"Vacancy, management, FHA self-sufficiency test on 3–4 units.",best:"E-4 to O-3 on a 3–4 year tour; metros with strong rents."},
 {id:"W02",t:"PCS → rental portfolio (buy at each duty station)",tags:["vet","portfolio"],how:"Buy a primary at each PCS with VA (second-tier entitlement), keep the prior home as a rental when you move. 3 tours = 3 doors with little cash in.",sim:"baseline",risk:"Entitlement math (down payment on the 2nd/3rd), being a long-distance landlord, reserves requirements.",best:"Career military; markets near large installations."},
 {id:"W03",t:"Invest the difference (30-yr fixed + invest vs 15-yr)",tags:["allocation"],how:"Take the 30-year payment and invest the gap between it and a 15-year payment. If expected return > mortgage rate after tax, investing wins; else prepay.",sim:"invest",risk:"Market risk and discipline — the gap must actually be invested.",best:"Rate below ~5.5%, long horizon, maxing tax-advantaged accounts (TSP/401k match first)."},
 {id:"W04",t:"Extra principal / bi-weekly payments",tags:["paydown"],how:"One extra payment per year (bi-weekly) knocks ~4–5 years off a 30-year loan; a fixed extra $ per month compounds the effect. Recast (not refi) after a lump sum to lower the payment.",sim:"extra",risk:"Opportunity cost when rates are low; prepayment penalties on some Non-QM loans.",best:"Rate ≥ 6%; borrower who won't invest the difference anyway."},
 {id:"W05",t:"Equity recycling with a HELOC (BRRRR-lite)",tags:["portfolio","equity"],how:"Use a HELOC on the primary (keeps the low first-mortgage rate) for the down payment on a rental; refinance the rental at stabilized value to repay the HELOC; repeat.",sim:"baseline",risk:"Variable HELOC rate; two liens; DSCR/appraisal risk on the exit refi.",best:"≥30% equity, DSCR ≥1.2 rentals available (AZ/NV/IL secondary markets)."},
 {id:"W06",t:"Live-in flip (2-year capital gains exclusion)",tags:["equity","starter"],how:"Buy a dated home with VA/FHA 203(k) or conventional HomeStyle, renovate while living in it, sell after 2 years and exclude up to $250k/$500k of gain (IRC §121).",sim:"baseline",risk:"Renovation overruns; living in a project; market timing.",best:"Handy buyers; neighborhoods with a value ceiling above the purchase + reno cost."},
 {id:"W07",t:"Buy an assumable 2–3% VA/FHA loan",tags:["vet","rate"],how:"Assume a seller's low-rate loan (buyer need not be a veteran for VA assumption but the seller's entitlement stays tied unless substituted); cover the equity gap with cash or a second lien.",sim:"baseline",risk:"Servicer timelines 60–120 days; large equity gaps.",best:"Rates ≥ 6.5%; sellers who bought 2020–2022."},
 {id:"W08",t:"ADU / garage conversion for rental income",tags:["equity","income"],how:"Add an ADU (CA SB-9/ADU laws, NV/AZ ordinances) financed with a HELOC, renovation loan or cash-out; rent it. Conventional allows ADU rent to qualify on some programs.",sim:"baseline",risk:"Permits/cost ($120–250k in CA); appraisal may not capture full value.",best:"Large lots in high-rent coastal metros."},
 {id:"W09",t:"Rate-and-term refinance ladder (IRRRL when rates drop)",tags:["vet","rate"],how:"Set a rate-watch: refinance (IRRRL for VA at 0.5% fee, no appraisal) each time the drop ≥0.5–0.75% and recoupment ≤ 24–36 months; keep the original payoff date by paying the old payment.",sim:"refi",risk:"Resetting the term; closing costs eroding savings.",best:"Every VA borrower at 6%+ — the Refi Hunter watches for you."},
 {id:"W10",t:"Cash-out to invest — only when the spread is wide",tags:["allocation","equity"],how:"Compare after-tax mortgage cost vs expected return; keep LTV ≤ 70–80% and 12 months of reserves. VA cash-out to 90–100% LTV (lender overlays) is powerful but risky.",sim:"invest",risk:"Leverage amplifies losses; NTB rules on VA cash-out; payment shock.",best:"Rate ≤ 5%, diversified investments, stable income."},
 {id:"W11",t:"TSP/401(k) match first, then mortgage",tags:["allocation"],how:"Employer/BRS match is an immediate 100% return — never skip it to prepay a mortgage. Then compare prepay vs taxable investing.",sim:"invest",risk:"—",best:"Everyone with a match."},
 {id:"W12",t:"1031 exchange ladder for investors",tags:["portfolio"],how:"Sell an appreciated rental and exchange into a larger/multiple properties tax-deferred; combine with DSCR loans (no personal DTI).",sim:"baseline",risk:"45/180-day deadlines; qualified intermediary; boot.",best:"Investors with 2+ rentals and large unrealized gains."},
 {id:"W13",t:"Buy the first home with 3% / DPA, keep cash invested",tags:["starter","lowdown"],how:"Low-down programs (HomeReady, CalHFA, Hometown Heroes) preserve cash for emergency fund and investing; MI cancels at 78–80%.",sim:"baseline",risk:"PMI cost; slower equity.",best:"First-time buyers with strong income but thin savings."},
 {id:"W14",t:"Mortgage recast after a windfall",tags:["paydown"],how:"Apply a lump sum (bonus, sale proceeds, inheritance) and recast for a lower payment at the same rate (fee ~$250) — no refinance, no new rate.",sim:"extra",risk:"Servicer must allow recast (VA/FHA generally don't; conventional usually does).",best:"Conventional borrowers with a low rate and a lump sum."},
];
/* net-worth simulation: compares baseline vs strategy over N years */
function wealthSim(i){
  const n=i.years*12, r=i.rate/12, loan=i.price-i.down; const pay30=pmt(loan,i.rate,360), pay15=pmt(loan,i.rate,180);
  const mr=Math.pow(1+i.invest,1/12)-1, ar=Math.pow(1+i.appreciation,1/12)-1;
  const run=(cfg)=>{ let bal=loan, home=i.price, port=i.startInvest, rows=[], payment=cfg.pay, extra=cfg.extra||0, rent=cfg.rent||0, invMonthly=cfg.invMonthly||0, rentG=Math.pow(1+i.rentGrowth,1/12)-1;
    for(let m=1;m<=n;m++){ const int=bal*r; let prin=Math.min(bal,payment-int+extra); bal-=prin; if(bal<0.01)bal=0; home*=1+ar;
      const cash=invMonthly+rent-(cfg.rentCost||0)*rent; port=port*(1+mr)+Math.max(0,cash); rent*=1+rentG;
      if(m%12===0) rows.push({y:m/12,equity:home-bal,port,nw:home-bal+port,bal}); }
    return rows; };
  const gap=pay15-pay30;
  return {
    baseline:run({pay:pay30,invMonthly:i.monthlyInvest}),
    extra:run({pay:pay30,extra:i.extra,invMonthly:i.monthlyInvest}),
    invest:run({pay:pay30,invMonthly:i.monthlyInvest+i.extra}),
    fifteen:run({pay:pay15,invMonthly:Math.max(0,i.monthlyInvest-gap)}),
    housHack:run({pay:pay30,rent:i.rent,rentCost:0.35,invMonthly:i.monthlyInvest}),
    refi:(()=>{let bal=loan,home=i.price,port=i.startInvest,rows=[],rate=i.rate,payment=pay30;for(let m=1;m<=n;m++){if(m===i.refiMonth){rate=i.refiRate;bal+=i.refiCost;payment=pmt(bal,rate,360-m+1);}const int=bal*rate/12;const prin=Math.min(bal,payment-int+(m>=i.refiMonth?pay30-payment:0));bal-=prin;home*=1+ar;port=port*(1+mr)+i.monthlyInvest;if(m%12===0)rows.push({y:m/12,equity:home-bal,port,nw:home-bal+port,bal});}return rows})(),
    pay30,pay15,gap };
}
/* ---- debt payoff strategies ---- */
const DEBT_METHODS=[
 ["avalanche","Avalanche — highest APR first","Mathematically cheapest; minimums on all, extra to the highest rate."],
 ["snowball","Snowball — smallest balance first","Fastest wins; momentum. Costs a little more interest."],
 ["consolidation","Consolidation loan / HELOAN","Roll everything into one fixed payment at a lower rate (personal loan 9–15%, HELOAN 8–10%); run the Debt Consolidation calculator for CLTV."],
 ["transfer","0% balance transfer (18 mo, 3% fee)","Move card balances to a 0% promo; pay aggressively before the promo ends; fee added up front."],
 ["dmp","Debt management plan (nonprofit)","Creditors reduce APR to ~6–10% for a 3–5 year plan; closes the cards; allowed by VA/FHA after 12 on-time payments."],
 ["minimum","Minimums only (what not to do)","Baseline for comparison."],
];
function payoffSim(debts,extra,method,opts={}){
  let ds=debts.map(d=>({...d,bal:d.balance,apr:d.rate})); let months=0,interest=0,series=[],order=[];
  if(method==="consolidation"){const tot=ds.reduce((a,d)=>a+d.bal,0),rate=opts.consRate??0.095,term=opts.consTerm??60,fee=tot*(opts.consFee??0.03);let bal=tot+fee;const p=pmt(bal,rate,term)+extra;let m=0;series.push(bal);while(bal>0.01&&m<600){const i=bal*rate/12;interest+=i;bal=Math.max(0,bal+i-p);m++;series.push(bal)}return {months:m,interest:Math.round(interest+fee),series,payment:Math.round(p),order:["All debts → one loan"]};}
  if(method==="transfer"){ds=ds.map(d=>d.type==="revolving"?{...d,bal:d.bal*1.03,apr:0,promo:18,postApr:d.apr}:d)}
  if(method==="dmp"){ds=ds.map(d=>d.type==="revolving"?{...d,apr:Math.min(d.apr,0.08)}:d)}
  const totalMin=ds.reduce((a,d)=>a+d.payment,0); const budget=totalMin+(method==="minimum"?0:extra);
  series.push(ds.reduce((a,d)=>a+d.bal,0));
  while(ds.some(d=>d.bal>0.01)&&months<600){ months++; let avail=budget;
    ds.forEach(d=>{if(d.bal<=0)return; if(d.promo!==undefined){if(months>d.promo)d.apr=d.postApr}; const i=d.bal*d.apr/12; interest+=i; d.bal+=i;});
    ds.forEach(d=>{if(d.bal<=0)return;const p=Math.min(d.payment,d.bal);d.bal-=p;avail-=p;});
    const live=ds.filter(d=>d.bal>0.01); if(live.length&&avail>0){const sorted=live.slice().sort((a,b)=>method==="snowball"?a.bal-b.bal:b.apr-a.apr);let t=sorted[0];const p=Math.min(avail,t.bal);t.bal-=p;avail-=p;
      if(avail>0){for(const d of sorted.slice(1)){if(avail<=0)break;const q=Math.min(avail,d.bal);d.bal-=q;avail-=q}}}
    ds.forEach(d=>{if(d.bal<=0.01&&d.bal!==-1&&!order.includes(d.name)){order.push(d.name);d.bal=0}});
    series.push(ds.reduce((a,d)=>a+Math.max(0,d.bal),0)); }
  return {months,interest:Math.round(interest),series,payment:Math.round(budget),order};
}
/* ---- credit repair plan ---- */
const REPAIR_PHASES=[
 {day:0,t:"Pull all three reports + scores",items:["AnnualCreditReport.com (free weekly) or tri-merge through the lender","Identify every inaccurate, obsolete or unverifiable item","Run the Credit Simulator to set the target"]},
 {day:1,t:"Quick wins (days 1–14)",items:["Pay revolving balances under 30% (then 10%) — biggest, fastest lever","Ask issuers to report current balances early (statement date)","Become an authorized user on a seasoned, low-utilization card","Place a freeze/active-duty alert if deploying"]},
 {day:7,t:"Disputes & validation (days 7–45)",items:["Mail certified disputes for inaccurate items (Letter Desk D01–D22)","Send debt-validation to collectors contacting you (D29)","Goodwill letters for accurate isolated lates (D31)","Pay-for-delete offers in writing only (D30)"]},
 {day:30,t:"Rescore & re-check (days 30–60)",items:["Rapid rescore through the lender for paid-down balances (3–5 days)","Review dispute results; escalate with method-of-verification (D17) or CFPB (D25)","Re-run the simulator with updated balances"]},
 {day:60,t:"Build (days 60–180)",items:["Secured card or credit-builder loan if thin file","Keep utilization <10% at statement date","No new hard inquiries; no closing old cards","Medical collections: request removal under bureau policy (D19)"]},
 {day:180,t:"Pre-approval window",items:["Order a tri-merge 30 days before application","Final paydown to hit the pricing tier","Lock the program via the Scenario Builder"]},
];
