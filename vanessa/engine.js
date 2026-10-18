/* Pure calculators (mirror supabase/001_calculators_and_home_report.sql) + loan recommendation engine. */
const pmt=(P,r,n)=>n<=0?0:r===0?P/n:P*(r/12)/(1-Math.pow(1+r/12,-n));
const balAfter=(P,r,n,k)=>r===0?P-P/n*k:P*Math.pow(1+r/12,k)-pmt(P,r,n)*(Math.pow(1+r/12,k)-1)/(r/12);

function buyVsRent(i){
  const loan=i.price*(1-i.downPct), down=i.price*i.downPct, closing=i.price*i.closingPct, pi=pmt(loan,i.rate,i.termYears*12);
  let home=i.price, rent=i.rent, bal=loan, port=down+closing, mr=Math.pow(1+i.invest,1/12)-1, be=null, rows=[], bnw=0, rnw=0, own=0;
  for(let y=1;y<=i.horizon;y++){
    let intY=0,prinY=0;
    for(let m=0;m<12;m++){
      const mi=bal*i.rate/12; intY+=mi; prinY+=pi-mi; bal-=pi-mi;
      const tax=home*i.taxRate/12, maint=i.price*i.maintPct/12, ins=i.insurance/12;
      const ben=i.itemize?(mi+tax)*i.marginal:0;
      own=pi+tax+ins+i.hoa+maint-ben;
      port=port*(1+mr)+(own-(rent+i.rentersIns/12));
    }
    home*=1+i.appreciation; rent*=1+i.rentGrowth;
    bnw=home*(1-i.sellPct)-bal; rnw=port;
    if(be===null&&bnw>=rnw) be=y;
    rows.push({year:y,home,bal,buyer:bnw,renter:rnw,own,rent:rent/(1+i.rentGrowth),intY,prinY});
  }
  return {loan,down,closing,pi,breakeven:be,winner:bnw>=rnw?"buy":"rent",adv:Math.abs(bnw-rnw),rows};
}

function debtConsolidation(i){
  let tb=0,tp=0,wr=0,ci=0,warn=[];
  i.debts.forEach(d=>{
    tb+=d.balance;tp+=d.payment;wr+=d.balance*d.rate;
    let mo;
    if(d.rate>0&&d.payment>d.balance*d.rate/12) mo=-Math.log(1-(d.rate/12*d.balance)/d.payment)/Math.log(1+d.rate/12);
    else{mo=d.rate===0?d.balance/Math.max(d.payment,1):600; warn.push(`Payment on "${d.name||"debt"}" barely covers interest.`);}
    ci+=Math.max(d.payment*mo-d.balance,0);
  });
  if(!tb) return {error:"Add at least one debt."};
  wr/=tb;
  const closing=tb*i.closingPct, cash=i.mode==="cashout_refi";
  const newAmt=cash?i.firstBal+tb+closing:tb+closing, newPay=pmt(newAmt,i.newRate,i.newTerm*12);
  const save=cash?(i.firstPay+tp)-newPay:tp-newPay, newInt=newPay*i.newTerm*12-newAmt;
  const be=save>0?closing/save:null, cltv=i.homeValue>0?(i.firstBal+tb+closing)/i.homeValue:null;
  // longest current payoff for the "longer term" warning
  const maxCur=Math.max(...i.debts.map(d=>d.rate>0&&d.payment>d.balance*d.rate/12?-Math.log(1-(d.rate/12*d.balance)/d.payment)/Math.log(1+d.rate/12):600));
  if(cltv!==null&&cltv>i.maxCltv) warn.push(`CLTV ${(cltv*100).toFixed(1)}% exceeds the ${Math.round(i.maxCltv*100)}% cap — reduce the debts rolled in.`);
  if(i.newTerm*12>maxCur*1.5) warn.push("Longer term lowers the payment but can raise total interest — check lifetime cost.");
  if(cash&&i.firstRate>0&&i.newRate>i.firstRate) warn.push(`Cash-out refi replaces a ${(i.firstRate*100).toFixed(3)}% first mortgage with ${(i.newRate*100).toFixed(3)}% — consider a HELOC/HELOAN instead.`);
  warn.push("Unsecured debt becomes debt secured by the home — missed payments risk foreclosure.");
  return {tb,tp,wr,closing,newAmt,newPay,save,be,ci,newInt,delta:ci-newInt,cltv,warn};
}

function armVsFixed(i){
  const n=i.term*12, fp=pmt(i.loan,i.fixedRate,n), ap=pmt(i.loan,i.armRate,n), fix=i.fixedYrs||5;
  let bal=i.loan,rate=i.armRate,pay=ap,bf=i.loan,pa=0,pf=0,rows=[];
  for(let m=1;m<=Math.min(n,i.horizon*12);m++){
    if(m>fix*12&&((m-1-fix*12)%12===0)){
      const target=i.index+i.margin;
      let r=m===fix*12+1?Math.min(target,i.armRate+i.capInit):Math.min(Math.max(target,rate-i.capPer),rate+i.capPer);
      rate=Math.min(r,i.armRate+i.capLife); pay=pmt(bal,rate,n-m+1);
    }
    bal+=bal*rate/12-pay; bf+=bf*i.fixedRate/12-fp; pa+=pay; pf+=fp;
    if(m%12===0) rows.push({year:m/12,rate,pay,fp,sav:pf-pa,bal,bf});
  }
  const worstRate=i.armRate+i.capLife, worstPay=pmt(balAfter(i.loan,i.armRate,n,fix*12),worstRate,n-fix*12);
  return {fp,ap,saveInit:fp-ap,fully:i.index+i.margin,balReset:balAfter(i.loan,i.armRate,n,fix*12),worstRate,worstPay,shock:worstPay-ap,rows};
}

/* Temporary buydown: subsidy = Σ(payment at note rate − payment at bought-down rate) × 12 */
function buydown(loan,note,type,term){
  const steps={"3-2-1":[3,2,1],"2-1":[2,1],"1-0":[1],"1-1":[1]}[type]; const base=pmt(loan,note/100,term*12);
  const yrs=steps.map((d,k)=>{const p=pmt(loan,(note-d)/100,term*12);return{year:k+1,rate:note-d,pay:p,save:base-p};});
  const cost=yrs.reduce((s,y)=>s+y.save*12,0);
  return {base,yrs,cost,pct:cost/loan*100};
}

/* ---------------- Loan recommendation engine ---------------- */
const FICO_MID={"<580":560,"580-619":600,"620-659":640,"660-679":670,"680-719":700,"720-759":740,"760+":780};
const fmt$=n=>"$"+Math.round(n).toLocaleString();

function recommend(s){
  const fico=FICO_MID[s.fico], loan=s.price*(1-s.downPct/100), ltv=100-s.downPct;
  const limit=s.area==="sandiego"?LIMITS.sandiego:s.area==="high"?LIMITS.ceiling:LIMITS.baseline;
  const isJumbo=loan>limit, out=[], notes=[];
  const add=(id,score,why,warn)=>{ const p=PROGRAMS.find(p=>p.id===id); out.push({p,score:Math.max(1,Math.min(99,Math.round(score))),why,warn:warn||[]}); };
  const primary=s.occ==="primary", inv=s.occ==="investment", w2=s.income==="w2";
  const docIssue=["asset","foreign"].includes(s.income);
  const selfDoc=["selfemp","1099"].includes(s.income); // agency paths need 2 yrs of returns

  // ---- VA
  if(s.vet&&!inv&&s.property!=="mfg"){
    let sc=88+(s.downPct===0?4:0)-(fico<620?8:0)-(s.dti>50?10:0); const why=["Veteran/active-duty eligibility → $0 down, no monthly MI at any credit tier"], warn=[];
    if(s.wantCredit) why.push("Seller can pay unlimited true closing costs + 4% concessions");
    if(isJumbo) {why.push(`Loan ${fmt$(loan)} exceeds the ${fmt$(limit)} area limit — Jumbo VA (to ~$3M, up to 89.99% LTV) avoids conventional jumbo MI`); sc-=3;}
    if(fico<620) warn.push("Most lenders overlay a 620 floor; Loan United / Mortgage Solutions can manual-underwrite lower");
    if(s.dti>50) warn.push("Residual income must support DTI >50% — run the residual table");
    if(w2||s.income==="retired") add("va",sc,why,warn); else add("va",sc-12,why.concat("Self-employed/1099 files need 2-yr documentation"),warn);
  }
  // ---- FHA
  if(!inv&&s.property!=="mfg-land"){
    let sc=60; const why=[],warn=[];
    if(fico>=580&&s.downPct>=3.5){why.push("3.5% down available at 580+"); sc+=14;} else if(fico<580&&s.downPct>=10){why.push("500–579 allowed with 10% down"); sc+=8;} else {warn.push("Down payment below FHA minimum for this score"); sc-=40;}
    if(fico<660){sc+=14; why.push("FHA often prices best below ~680");} else sc-=8;
    if(s.dti>45) {why.push("Compensating-factor DTI up to ~50–56.9%"); sc+=6;}
    if(s.bk){why.push("Shorter post-BK/FC waits than conventional (verify seasoning)"); sc+=8;}
    if(s.wantCredit) why.push("Seller can pay up to 6% of costs/prepaids");
    if(s.property==="multi"&&primary) {why.push("House-hack: 2–4 units with rental income counted"); sc+=6;}
    if(selfDoc){sc-=6;warn.push("Self-employed: needs 2 years of tax returns (net income after write-offs) — compare Bank Statement");}
    if(isJumbo||loan>LIMITS.fhaCeiling) {warn.push("Above the FHA area limit"); sc-=70;}
    if(!docIssue&&sc>5) add("fha",sc,why,warn);
  }
  // ---- Conventional
  if(!inv||s.property==="multi"){
    if(!isJumbo&&!docIssue){
      let sc=55; const why=[],warn=[];
      if(fico>=720){sc+=26;why.push("720+ credit earns best LLPA/MI pricing");} else if(fico>=680){sc+=18;why.push("680+ credit — usually lowest all-in cost");} else if(fico>=620){sc+=4;warn.push("Sub-680: PMI and LLPAs can make FHA cheaper — compare");} else sc-=45;
      if(s.downPct>=20){sc+=10;why.push("20% down → no PMI");} else if(s.downPct>=5){sc+=2;why.push("PMI auto-terminates at 78%");} else if(s.downPct>=3){why.push("3% down via HomeReady/Home Possible/FTHB");} else sc-=45;
      if(s.dti>45) {sc-=10;warn.push("DTI above 45% needs strong compensating factors");}
      if(s.wantCredit) why.push(s.downPct>=25?"Up to 9% seller credit at ≤75% LTV":s.downPct>=10?"Up to 6% seller credit (75.01–90% LTV)":"Up to 3% seller credit (>90% LTV)");
      if(selfDoc){sc-=6;warn.push("Self-employed: 2 years of returns; income = net after write-offs. 1-yr exception may apply");}
      if(s.bk) {sc-=20;warn.push("Longer BK/FC waiting periods than FHA/VA");}
      add("conv",sc,why,warn);
    }
  }
  // ---- USDA
  if(!inv&&primary&&s.property==="rural"&&s.downPct===0&&fico>=580){
    let sc=70+(fico>=640?10:-5); add("usda",sc,["Rural-eligible property + $0 down","1% guarantee fee (financeable) + 0.35% annual","Income must be under the local 2026 cap (~$122,800 for 1–4 in most counties)"],fico<640?["Manual underwrite path for 580–639"]:[]);
  }
  // ---- Jumbo
  if(isJumbo&&!inv&&!docIssue&&!(s.vet&&primary)){ /* jumbo VA handled in VA block */
    let sc=60+(fico>=740?18:fico>=720?12:fico>=700?4:-30)+(s.downPct>=20?10:s.downPct>=10?0:-25)-(s.dti>43?12:0);
    add("jumbo",sc,[`Loan ${fmt$(loan)} is above the ${fmt$(limit)} area limit`,"Expect 6–12 months PITI reserves"],s.downPct<20?["20%+ down usually required above $1.5M"]:[]);
  }
  // ---- Non-QM paths
  if(inv){
    add("dscr",78+(fico>=700?8:fico>=660?0:-14)+(s.downPct>=25?6:s.downPct>=20?2:-18),["Qualifies on property cash flow, not personal DTI","DSCR ≥1.00 (1.25+ for best pricing)","No tax returns needed"],s.downPct<20?["20–25% minimum down typical"]:[]);
  }
  if(["selfemp","1099"].includes(s.income)){
    add("bank",80+(fico>=680?6:fico>=620?0:-20)+(s.downPct>=20?6:s.downPct>=10?-2:-30),["12–24 months of bank statements qualify income","Self-employed returns often understate cash flow","Compare 12- vs 24-month and CPA-letter expense factor"],["Run 1-yr tax-return exception and agency path first — cheaper if it works"]);
  }
  if(s.income==="retired"||s.income==="asset"){
    add("asset",74+(s.downPct>=20?6:-10),["Liquid assets ÷ 360 months counted as income","Ideal for retirees / trust beneficiaries"],[]);
  }
  if(s.foreign){
    add("foreign",86+(s.downPct>=25?5:-12),["Foreign national / ITIN / DACA programs accept alt-credit","Confirm EAD expiry vs closing for DACA"],["Expect 25–30% down"]);
  }
  if(s.age62){
    add("reverse",72,["62+ — eliminate monthly mortgage payment","HECM-for-purchase or refi of existing mortgage","Financial assessment replaces DTI"],["Counseling required; protect heirs' expectations"]);
  }
  if(s.bridge){
    add("bridge",70,["Bridge against departing home's equity enables a non-contingent offer","Pay off at old-home closing"],["Higher rate + points; budget carrying cost for both homes"]);
  }
  if(s.owner){
    add("heloc",66,["Tap equity without touching a low first-mortgage rate","Good for renovation, consolidation, or a 2nd-property down payment"],["Keep 15–20% equity; variable rate risk"]);
  }

  // ---- 5/1 ARM variants (only shown when hold/budget goals fit)
  const armFit=s.shortHold||s.lowPay;
  if(armFit){
    const boost=(s.shortHold?10:0)+(s.lowPay?6:0);
    out.filter(o=>["va","fha","conv","jumbo","dscr","bank"].includes(o.p.id)).forEach(o=>{
      const map={va:"arm_va",fha:"arm_fha",conv:"arm_conv",jumbo:"arm_jumbo",dscr:"arm_nonqm",bank:"arm_nonqm"}; const id=map[o.p.id];
      if(out.some(x=>x.p.id===id)) return;
      const base=o.score-8+boost, why=[`Same eligibility as ${o.p.name} with a lower starting rate`,s.shortHold?"Short expected hold (<7 yrs) captures the rate savings before the first adjustment":"Lower starting payment improves cash flow"];
      const warn=["Qualify at the greater of note rate or fully-indexed rate; show worst-case payment at the lifetime cap",id==="arm_va"?"Fewer VA ARM investors than fixed — confirm availability":"Have an exit plan (refi/sale) before month 60"];
      add(id,base,why,warn);
    });
  }
  out.sort((a,b)=>b.score-a.score);

  // ---- lenders
  const lenders=(out.slice(0,3).flatMap(o=>{
    const tags=PROGRAM_LENDER_TAGS[o.p.id]||[];
    return LENDERS.filter(l=>l.tags.some(t=>tags.includes(t))).map(l=>({l,pid:o.p.id,hits:l.tags.filter(t=>tags.includes(t)).length}));
  }));
  const bag=new Map();
  lenders.forEach(({l,pid,hits})=>{ const e=bag.get(l.n)||{l,hits:0,pids:new Set()}; e.hits+=hits; e.pids.add(pid); bag.set(l.n,e); });
  if(s.fico==="<580"||s.fico==="580-619") bag.forEach(e=>{ if(e.l.tags.includes("lowfico")) e.hits+=3; });
  if(s.property==="mfg") bag.forEach(e=>{ if(e.l.tags.includes("mfg")) e.hits+=3; });
  if(s.property==="condo-nw") bag.forEach(e=>{ if(e.l.tags.includes("condo")) e.hits+=3; });
  if(s.vet&&s.state==="CA") bag.forEach(e=>{ if(e.l.tags.includes("calvet")) e.hits+=2; });
  if(s.dpa) bag.forEach(e=>{ if(e.l.tags.includes("dpa")) e.hits+=3; });
  const matched=[...bag.values()].sort((a,b)=>b.hits-a.hits||a.l.n-b.l.n).slice(0,10);

  // ---- strategy notes
  const tags=new Set();
  if(s.vet) tags.add("vet"); if(isJumbo) tags.add("jumbo"); if(s.wantCredit) tags.add("credit"); if(s.dpa||s.downPct<5) {tags.add("lowdown");tags.add("fthb");}
  if(["selfemp","1099"].includes(s.income)) tags.add("selfemp"); if(inv) tags.add("investor"); if(s.income==="retired"||s.income==="asset") {tags.add("retired");tags.add("asset");}
  if(s.property==="multi") tags.add("multi"); if(s.property==="condo-nw") tags.add("condo"); if(s.property==="mfg") tags.add("mfg"); if(s.bridge) tags.add("bridge");
  if(s.physician) tags.add("physician"); if(s.fico==="620-659"||s.fico==="660-679") tags.add("credit_gap"); if(s.foreignDaca) tags.add("daca"); if(s.compete) tags.add("compete");
  if(s.shortHold) {tags.add("arm");tags.add("shorthold");} if(s.lowPay) {tags.add("lowpay");tags.add("arm");}
  const strat=STRATEGIES.filter(x=>x.tags.some(t=>tags.has(t))).slice(0,8);

  if(s.bk) notes.push("Recent BK/FC: confirm seasoning — VA/FHA are typically shortest; consider the Get-Well plan if not yet eligible.");
  if(s.physician) notes.push("Physician: route to doctor-loan programs on the Non-QM / portfolio lenders; signed contract can count as income.");
  if(s.dti>50) notes.push("DTI >50%: pay down debt via Score Simulator + Debt Consolidation calculator, or use VA residual income.");
  return {loan,ltv,limit,isJumbo,options:out,lenders:matched,strategies:strat,notes};
}
if(typeof module!=="undefined") module.exports={pmt,balAfter,buyVsRent,debtConsolidation,armVsFixed,buydown,recommend};
