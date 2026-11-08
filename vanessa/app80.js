/* app80: Worksheets & Calculators — Steven Shearrill's Google Drive mortgage worksheets rebuilt as live calculators.
   Each calculator reproduces the source workbook's own inputs, formulas and lookup tables (cell references noted inline),
   so results match the spreadsheet. Sources (Drive folder 1y9x33fo14Q05-a8D43aG3mNby069Gc3B):
   VA-Residual-Income-Calculator.xlsx · VA_Residual_Income_Calculator.xls · FHA_Streamline-Max-Mtg-Worksheet___Net_Tangible.xlsx ·
   FHA-VA-Refinance-Streamline-Required-Wait-Period-Calculator.xlsx · VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls (7-tab NTB workbook) ·
   FHA_Minimum_Required_Investment_Calculator.xlsx · Income_Calculator_Worksheet.xlsx (W-2/YTD, Schedule C, 1065, 1120S, 1120, REO, Farm) ·
   VA_Net_Tangible_Comparison_Worksheet.pdf · VA_Tangible_Net_Benefit.pdf (Virginia § 6.2-1614(7)) · GUS_-_How_to_Run_-_Guide.pdf.
   Figures that may be dated (residual tables, mileage rates, $271,050 threshold, UFMIP dates) are kept exactly as in the worksheet and labeled. */
const WS80=(()=>{
const DRIVE=id=>`https://drive.google.com/file/d/${id}/view`;
const FOLDER="https://drive.google.com/drive/folders/1y9x33fo14Q05-a8D43aG3mNby069Gc3B";
const n=v=>{const x=parseFloat(String(v??"").replace(/[$,%\s]/g,""));return isFinite(x)?x:0};
const has=v=>String(v??"").trim()!=="";
const m2=x=>x==null||!isFinite(x)?"—":(x<0?"−":"")+"$"+Math.abs(x).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=(x,d=3)=>x==null||!isFinite(x)?"—":(+x).toFixed(d)+"%";
const nf=(x,d=2)=>x==null||!isFinite(x)?"—":(+x).toLocaleString(undefined,{maximumFractionDigits:d});
/* ---- Excel-compatible date helpers (UTC, no TZ drift) ---- */
const pd=s=>{if(!has(s))return null;const m=String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(Date.UTC(+m[1],m[2]-1,+m[3]));const d=new Date(s);return isNaN(d)?null:new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))};
const fd=d=>d?`${d.getUTCMonth()+1}/${d.getUTCDate()}/${d.getUTCFullYear()}`:"—";
const iso=d=>d?d.toISOString().slice(0,10):"";
const addD=(d,k)=>d?new Date(d.getTime()+k*864e5):null;
const dim=(y,m)=>new Date(Date.UTC(y,m+1,0)).getUTCDate();
const edate=(d,k)=>{if(!d)return null;const y=d.getUTCFullYear(),m=d.getUTCMonth()+k;const ty=y+Math.floor(m/12),tm=((m%12)+12)%12;return new Date(Date.UTC(ty,tm,Math.min(d.getUTCDate(),dim(ty,tm))))};
const days=(a,b)=>a&&b?Math.round((b-a)/864e5):null;
const datedifM=(a,b)=>{if(!a||!b||b<a)return null;let k=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();if(b.getUTCDate()<a.getUTCDate())k--;return k};
const serial=d=>d?Math.round((d-Date.UTC(1899,11,30))/864e5):0;
const ok=(c,t)=>[c,t];
const PF=(p,label)=>p==null?[null,label+": enter the fields"]:[p,label+": "+(p?"PASS":"FAIL")];

/* ================= TABLES (verbatim from the worksheets) ================= */
/* VA-Residual-Income-Calculator.xlsx — Charts + Data sheets (family 1–7; "below" ≤ $79,999, "above" ≥ $80,000) */
const RI_REGION={};
"AL AR DE DC FL GA KY LA MD MS NC OK PR SC TN TX VA WV".split(" ").forEach(s=>RI_REGION[s]="South");
"AK AZ CA CO HI ID MT NV NM OR UT WA WY".split(" ").forEach(s=>RI_REGION[s]="West");
"IL IN IA KS MI MN MO NE ND OH SD WI".split(" ").forEach(s=>RI_REGION[s]="Midwest");
"CT ME MA NH NJ NY PA RI VT".split(" ").forEach(s=>RI_REGION[s]="Northeast");
const RI_TABLE={below:{Northeast:[390,654,788,888,921,996,1071],Midwest:[382,641,772,868,902,977,1052],South:[382,641,772,868,902,977,1052],West:[425,713,859,976,1004,1079,1154]},
 above:{Northeast:[450,755,909,1025,1062,1142,1222],Midwest:[441,738,889,1003,1039,1119,1199],South:[441,738,889,1003,1039,1119,1199],West:[491,823,990,1117,1158,1238,1318]}};
const ST_NAMES={AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",PR:"Puerto Rico",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};
const riRequired=(st,fam,loan)=>{const reg=RI_REGION[st]||"West";const f=Math.max(1,Math.min(7,Math.round(n(fam))||1));const band=n(loan)>=80000?"above":"below";return{reg,band,fam:f,req:RI_TABLE[band][reg][f-1]}};
/* HUD FHA UFMIP refund schedule for streamline refinances (months 1–36: 80% stepping down 2%/month to 10%).
   NOT part of the Drive worksheet — supplemental; FHA Connection's Refinance Authorization is the authoritative refund. */
const UFMIP_REFUND=Array.from({length:36},(_,i)=>80-2*i);

/* ================= CALCULATORS ================= */
/* field: [id,label,type,default,opts]  type: num|pct|date|sel|chk|txt|h (section header)  */
const C=[];
const def=o=>{C.push(o);return o};

/* ---------- 1. VA Residual Income ---------- */
def({k:"va_residual",grp:"VA",t:"VA Residual Income Calculator",src:[["VA-Residual-Income-Calculator.xlsx","1sTedc-nfYKgNs_B0kWNzM65PVXCQnjQp"],["VA_Residual_Income_Calculator.xls (Pre-qual Worksheet)","1u1waqpD94s7Uc1LkyDQHk8cOlxFEESMD"]],
 verify:"VA Pamphlet 26-7 Ch. 4 §9 (residual income table, 41% ratio, 20% cushion). Table per worksheet (verify current).",
 f:[["h","Property & household"],["st","State","sel","AK",Object.keys(ST_NAMES).map(s=>[s,ST_NAMES[s]])],["fam","Family size (1–7; if more than 7, choose 7)","num",4],["loan","Mortgage amount","num",85000],
  ["sqft","Total square footage (× $0.14 maintenance/utilities)","num",2000],
  ["h","Monthly housing expense"],["pi","Principal & interest (leave blank to use rate/term factor)","num",1000],["rate","— or interest rate % (xls P&I chart factor)","pct",""],["term","— term (years)","sel","30",[["15","15"],["20","20"],["30","30"]]],
  ["tax","Property tax","num",200],["ins","Homeowners insurance","num",50],["hoa","Association / condo dues","num",50],["oh","Other housing","num",100],
  ["h","Monthly debts & obligations"],["auto","Auto","num",200],["rev","Revolving charge accounts","num",250],["inst","Installment loans","num",250],["cc","Child care","num",20],["od","Other (alimony/child support etc.)","num",100],
  ["h","Income & monthly taxes"],["gross","Gross monthly income","num",10000],["rloss","Rental income loss","num",1000],
  ["fed","Federal income tax","num",150],["sti","State income tax","num",100],["ss","Social Security / Medicare","num",30],["otax","Other taxes","num",25]],
 example:{st:"AK",fam:4,loan:85000,sqft:2000,pi:1000,tax:200,ins:50,hoa:50,oh:100,auto:200,rev:250,inst:250,cc:20,od:100,gross:10000,rloss:1000,fed:150,sti:100,ss:30,otax:25},
 expect:{"Actual residual income":6195,"Required residual income":1117},
 run(v){const maint=n(v.sqft)*0.14;let pi=n(v.pi),fac=null;
  if(!has(v.pi)&&has(v.rate)){const r=n(v.rate)/1200,N=n(v.term||30)*12;fac=r?Math.round(1000*r/(1-Math.pow(1+r,-N))*100)/100:Math.round(1000/N*100)/100;pi=n(v.loan)*fac/1000}
  const housing=pi+n(v.tax)+n(v.ins)+n(v.hoa)+n(v.oh),debts=n(v.auto)+n(v.rev)+n(v.inst)+n(v.cc)+n(v.od),taxes=n(v.fed)+n(v.sti)+n(v.ss)+n(v.otax);
  const inc=n(v.gross)-n(v.rloss);                                  // B37 = B35 − B36
  const actual=inc-(maint+housing+debts)-taxes;                      // B45 = B37 − SUM(B17:B32) − B40..B43
  const R=riRequired(v.st,v.fam,v.loan);
  const dti=n(v.gross)?(housing+debts)/n(v.gross)*100:null;          // xls D39 = ((2)+(3)) / (1)
  const pct=R.req?actual/R.req*100:null;
  return{out:[["Region (Charts sheet)",`${R.reg} · ${R.band==="above"?"loan ≥ $80,000":"loan ≤ $79,999"} · family ${R.fam}`],
   fac!=null?["P&I factor per $1,000 (xls P&I chart, 2 dp)",nf(fac)]:null,["Principal & interest used",m2(pi)],
   ["Maintenance/utilities (sq ft × .14)",m2(maint)],["Total housing expense",m2(housing)],["Total debts & obligations",m2(debts)],["Total monthly taxes",m2(taxes)],
   ["Monthly income (gross − rental loss)",m2(inc)],["Actual residual income",m2(actual),actual>=R.req?"good":"bad",actual],["Required residual income",m2(R.req),"",R.req],
   ["Residual as % of table",pct==null?"—":nf(pct,1)+"%"],["Debt-to-income ((housing + debts) ÷ gross)",dti==null?"—":nf(dti,2)+"%"],
   ["Residual needed at 120% (if DTI > 41%)",m2(R.req*1.2)]].filter(Boolean),
   flags:[ok(actual>R.req,`Actual residual ${m2(actual)} ${actual>R.req?">":"≤"} required ${m2(R.req)} (worksheet: "Actual residual should be greater than Required")`),
    dti==null?null:ok(dti<=41||actual>=R.req*1.2,dti<=41?`DTI ${nf(dti,1)}% within VA 41% guideline`:`DTI ${nf(dti,1)}% > 41% — residual must exceed the table by 20% (${m2(R.req*1.2)}) or other compensating factors documented`)].filter(Boolean),
   notes:["Count all household members regardless of relationship; dependents claimed on taxes count. Lender may omit members fully supported by verified income not used.","Child support is a liability; spousal support/alimony may be treated as a reduction in income. Tax-free income may be grossed up for DTI only.","The .xls Residual Chart lists West/family-4/under-$80k as $967 (typo); the .xlsx Data sheet and VA's table use $976 — this calculator uses $976."]}}});

/* ---------- 2. FHA Streamline 4000.1 Max Mortgage & NTB ---------- */
def({k:"fha_streamline",grp:"FHA",t:"FHA Streamline Max Mortgage & Net Tangible Benefit (4000.1)",src:[["FHA_Streamline-Max-Mtg-Worksheet___Net_Tangible.xlsx","182TzqI32YCaip0KwTokU6FFGaVXPriUK"]],
 verify:"HUD Handbook 4000.1 II.A.8.d (Streamline Refinance), current Mortgagee Letters for UFMIP/annual MIP and county limits. $271,050 threshold and UFMIP date logic per worksheet (verify current).",
 f:[["h","Dates & term"],["case","Case assignment date","date",""],["endorse","Previous case endorsement date","date",""],["newterm","Term of new loan (years)","num",30],
  ["h","Outstanding principal (per payoff)"],["upb","Outstanding principal balance (without interest)","num",200000],["int","Interest charge (no delinquent interest)","num",500],["mip2","Prorated annual MIP (up to 2 months)","num",300],
  ["refund","Minus UFMIP refund (netting authorization)","num",1000],["refmo","— helper: months since prior endorsement (HUD refund schedule)","num",""],["origufmip","— helper: prior UFMIP paid $","num",""],
  ["h","B. Maximum mortgage (only if total > $271,050)"],["limit","County loan limit","num",""],["origpb","Original principal balance of loan being refinanced","num",""],
  ["h","C. Program eligibility"],["note","Note date for current loan","date",""],["remyrs","Remaining term (years) of current loan","num",""],["fp","First payment date of current loan","date",""],
  ["h","D. Net tangible benefit — combined rate"],["ntype","Transaction type","sel","ff",[["ff","Fixed → Fixed (≥ 0.5 pt below)"],["arm","Any ARM → Fixed/ARM (no more than 2 pts above)"],["oneyr","1-yr ARM → Fixed / Hybrid ARM → Fixed (≥ 2 pts below)"],["hyb","1-yr/Hybrid ARM → ARM < 15 mo, Hybrid → ARM ≥ 15 mo (≥ 1 pt below)"]]],
  ["cr","Current interest rate %","pct",6.5],["cm","Current MIP rate %","pct",0.85],["nr","New interest rate %","pct",5.75],["nm","New MIP rate %","pct",0.55],
  ["h","— OR — Reduction in term"],["ct","Current term (years)","num",""],["nt","New term (years)","num",""],["tcr","Current interest rate %","pct",""],["tnr","New interest rate %","pct",""],["cpay","Current P&I + MIP payment","num",""],["npay","New P&I + MIP payment","num",""]],
 example:{upb:200000,int:500,mip2:300,refund:1000,newterm:30,cr:6.5,cm:0.85,nr:5.75,nm:0.55,ntype:"ff"},
 expect:{"Total mortgage amount":203296.5,"Upfront MIP (D26)":3496.5},
 run(v){const cs=serial(pd(v.case)),es=serial(pd(v.endorse));
  let refund=n(v.refund);const helper=has(v.refmo)&&has(v.origufmip)?(()=>{const m=Math.round(n(v.refmo));const p=m>=1&&m<=36?UFMIP_REFUND[m-1]:0;return{m,p,amt:n(v.origufmip)*p/100}})():null;
  if(!has(v.refund)&&helper)refund=helper.amt;
  const D16=n(v.upb)+n(v.int)+n(v.mip2),D22=D16-refund;
  const D25=cs<41008?0.0175:(cs>=41071&&es<=39964?0.0001:0.0175);   // =IF(D8<4/9/2012,1.75%,IF(AND(D8>=6/11/2012,D9<=5/31/2009),0.01%,1.75%))
  const D26=D22*D25,D28=refund>D26?D16/1.0001:D22,D29=D28*D25,D30=D28+D29;
  const over=D30>271050,D41=(D30>n(v.limit))&&(D30<n(v.origpb))?D30:n(v.origpb);
  const hud=has(v.limit)?(D30>n(v.limit)?Math.min(D30,n(v.origpb)||D30):D30):D30;
  const maxW=over?D41:D30;
  const note=pd(v.note),fp=pd(v.fp);
  const ccomb=n(v.cr)+n(v.cm),ncomb=n(v.nr)+n(v.nm),red=ccomb-ncomb;
  const rule={ff:[red>=0.5,"≥ 0.50 below"],arm:[-red<=2,"no more than 2.00 above"],oneyr:[red>=2,"≥ 2.00 below"],hyb:[red>=1,"≥ 1.00 below"]}[v.ntype]||[null,""];
  const termT=has(v.ct)&&has(v.nt)&&has(v.cpay)&&has(v.npay)?(n(v.nt)<n(v.ct)&&(!has(v.tnr)||n(v.tnr)<=n(v.tcr))&&n(v.npay)<=n(v.cpay)+50):null;
  return{out:[["Calculated outstanding principal balance (D16)",m2(D16)],["Base mortgage amount (D22 = D16 − refund)",m2(D22)],["Upfront MIP factor (D25)",(D25*100).toFixed(2)+"%"],["Upfront MIP (D26)",m2(D26),"",D26],
   ["New base mortgage amount (D28)",m2(D28)],["New UFMIP (D29)",m2(D29)],["Total mortgage amount",m2(D30),"",D30],
   ["Maximum mortgage per worksheet",over?m2(maxW)+" (Section B)":m2(maxW)+" (total ≤ $271,050)"],has(v.limit)?["HUD reading: ≤ county limit → total; above → capped at original principal",m2(hud)]:null,
   helper?["UFMIP refund helper (HUD schedule, not in worksheet)",`month ${helper.m}: ${helper.p}% × ${m2(n(v.origufmip))} = ${m2(helper.amt)}${has(v.refund)?" (refund field overrides)":" (used above)"}`]:null,
   ["Earliest case # assignment (note + 210 days)",note?fd(addD(note,210)):"—"],["Maximum term permitted (remaining + 12, ≤ 30)",has(v.remyrs)?Math.min(30,n(v.remyrs)+12)+" years":"—"],
   ["Earliest case # assignment (first payment + 6 months)",fp?fd(edate(fp,6)):"—"],
   ["Current combined rate",pc(ccomb)],["New combined rate",pc(ncomb)],["Reduction in combined rate (D61)",pc(red)]].filter(Boolean),
   flags:[D25===0.0001&&!has(v.endorse)?[false,"Previous endorsement date is blank — the worksheet formula then treats it as on/before 5/31/2009 and uses 0.01% UFMIP. Enter the endorsement date."]:D25===0.0001?[null,"Endorsed on/before 5/31/2009 with case assigned on/after 6/11/2012: worksheet applies the 0.01% UFMIP (and 0.55% annual MIP) streamline pricing — verify current"]:null,
    ok(rule[0],`Combined-rate NTB (${rule[1]}): ${pc(red)} reduction`),termT==null?null:ok(termT,"Term-reduction NTB: term reduced, rate not higher, new P&I+MIP ≤ current + $50"),
    has(v.newterm)&&has(v.remyrs)?ok(n(v.newterm)<=Math.min(30,n(v.remyrs)+12),`New term ${n(v.newterm)} yrs vs max ${Math.min(30,n(v.remyrs)+12)} yrs`):null,
    refund>D26?[null,"Refund exceeds new UFMIP — worksheet uses D16 ÷ 1.0001 as base; the excess is refunded by HUD directly to the borrower"]:null,
    over&&!has(v.limit)?[null,"Total exceeds $271,050 — complete Section B (county limit, original principal)"]:null,
    over&&has(v.limit)&&Math.abs(maxW-hud)>0.005?[false,`Worksheet Section B formula returns ${m2(maxW)} but HUD reading gives ${m2(hud)} — the sheet returns the original principal whenever total ≤ county limit; verify with your AE`]:null].filter(Boolean),
   notes:["Calculated outstanding principal may include servicer interest and up to 2 months prorated annual MIP; no delinquent interest, late charges, fees or escrow shortages.","If the borrower assumed the mortgage, six payments must have been made since the assumption at case assignment."]}}});

/* ---------- 3. FHA/VA Streamline wait period ---------- */
def({k:"streamline_wait",grp:"FHA",t:"FHA/VA Streamline Required Wait Period",src:[["FHA-VA-Refinance-Streamline-Required-Wait-Period-Calculator.xlsx","1m2JPQD31f3f3u-t1WdhK-pL8ziilqbi-"],["VA IRRRL tab of NTB workbook","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],
 verify:"HUD 4000.1 II.A.8.d.ii (seasoning); VA Circular 26-19-22 / Pamphlet 26-7 Ch. 6 (IRRRL seasoning: 210 days and 6 consecutive payments).",
 f:[["h","Existing loan"],["note","Date of note (closing)","date","2021-02-01"],["fp","First payment date","date","2021-03-01"],["h","Optional — proposed new loan"],["casedt","Planned FHA case # assignment date","date",""],["vanote","Planned VA IRRRL note date","date",""]],
 example:{note:"2021-02-01",fp:"2021-03-01"},expect:{"FHA case # assignment on or after":"9/2/2021"},
 run(v){const note=pd(v.note),fp=pd(v.fp);if(!note||!fp)return{out:[["Enter note date and first payment date",""]],flags:[]};
  const D9=addD(note,211),D10=edate(fp,6),D14=addD(D9>D10?D9:D10,1);   // D9 = note+210 +1 ; D10 = EDATE(fp,6) ; D14 = MAX +1 day
  const vaE=addD(fp,210),six=edate(fp,5);const cd=pd(v.casedt),vn=pd(v.vanote);
  return{out:[["(3) Note date + 210 days (+1 day buffer)",fd(D9)],["(2) First payment + 6 months",fd(D10)],["FHA case # assignment on or after",fd(D14),"good",fd(D14)],
   ["VA IRRRL: earliest note date (first payment due + 210 days)",fd(vaE)],["VA IRRRL: 6th consecutive payment due",fd(six)]],
   flags:[cd?ok(cd>=D14,`Planned case assignment ${fd(cd)} ${cd>=D14?"meets":"is before"} ${fd(D14)}`):null,vn?ok(days(fp,vn)>=210,`VA note ${fd(vn)}: ${days(fp,vn)} days after first payment due (need ≥ 210) and 6 payments made by then`):null].filter(Boolean),
   notes:["At case number assignment: 6 payments made on the FHA loan; 6 full months since first payment due; 210 days since closing; if assumed, 6 payments since assumption.","The worksheet adds 1 day to the assignment date to prevent early ordering issues."]}}});

/* ---------- 4. NTB workbook tabs ---------- */
const recoup=(costs,prev,prop)=>{const sav=prev-prop;const mo=sav!==0?costs/sav:null;return{sav,mo}};
def({k:"va_irrrl_ntb",grp:"VA",t:"VA IRRRL Net Tangible Benefit & Recoupment",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — VA IRRRL tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],
 verify:"38 U.S.C. 3709; VA Circular 26-19-22; Pamphlet 26-7 Ch. 6 (IRRRL NTB, 36-month recoupment, seasoning). Verify with your AE.",
 f:[["h","Loan comparison"],["ltype","Transaction","sel","ff",[["ff","Fixed → Fixed (≥ 0.50% lower)"],["farm","Fixed → ARM (≥ 2.00% lower)"],["other","ARM → Fixed / ARM → ARM / term reduction (recoupment only)"]]],
  ["cr","Current rate %","pct",6.75],["nr","New rate %","pct",5.875],["cpi","Current P&I","num",2594.39],["npi","New P&I","num",2366.15],["ct","Current term (months)","num",360],["nt","New term (months)","num",360],
  ["h","Seasoning"],["six","6 consecutive monthly payments made on loan being refinanced?","sel","Yes",[["Yes","Yes"],["No","No"]]],["pfp","Prior loan first payment due","date",""],["nnd","Note date of new loan","date",""],
  ["h","Recoupment (36 months)"],["cc","Closing costs (excl. funding fee, escrows, prepaids)","num",3500],["disc","Discount","num",0],["lc","Lender credit","num",0]],
 example:{ltype:"ff",cr:6.75,nr:5.875,cpi:2594.39,npi:2366.15,ct:360,nt:360,six:"Yes",cc:3500,disc:0,lc:0},expect:{"Total months to recoup":15.33},
 run(v){const rc=n(v.cr)-n(v.nr),pic=n(v.cpi)?(n(v.npi)-n(v.cpi))/n(v.cpi)*100:null;const K33=n(v.cc)+n(v.disc)-n(v.lc);const R=recoup(K33,n(v.cpi),n(v.npi));
  const pass=K33<=0||(K33>0&&R.mo!=null&&R.mo>=0&&R.mo<=36);const d=days(pd(v.pfp),pd(v.nnd));
  const rateT=v.ltype==="ff"?[rc>=0.5-1e-9,"Fixed→Fixed rate ≥ 0.50% lower"]:v.ltype==="farm"?[rc>=2-1e-9,"Fixed→ARM rate ≥ 2.00% lower (appraisal required if discount charged)"]:null;
  return{out:[["Rate change (R10)",pc(rc)],["P&I change (R11)",pic==null?"—":nf(pic,2)+"%"],["Term change (months)",nf(n(v.ct)-n(v.nt),0)],["Total cost of loan (K33)",m2(K33)],["Monthly savings (K37)",m2(R.sav)],["Total months to recoup",R.mo==null?"—":nf(R.mo,2),"",R.mo==null?null:Math.round(R.mo*100)/100]],
   flags:[ok(v.six!=="No","6 consecutive monthly payments made"),d==null?[null,"210 days: enter prior first-payment-due and new note date"]:ok(d>=210,`${d} days from prior first payment due to new note date (need ≥ 210)`),rateT?ok(rateT[0],rateT[1]+` — change ${pc(rc)}`):null,ok(pass,`Recoupment ${R.mo==null?(K33<=0?"n/a (no costs)":"no savings"):nf(R.mo,1)+" months"} — ${pass?"PASS":"FAIL"} (≤ 36)`)].filter(Boolean),
   notes:["Worksheet pass rule (K41): costs ≤ 0, or months to recoup between 0 and 36.","Loans with no closing costs (lender credit covers all) pass recoupment."]}}});

def({k:"va_cashout_ntb",grp:"VA",t:"VA Cash-Out NTB (Type I / Type II)",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — VA Cash Out tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],
 verify:"VA Circular 26-19-05; 38 CFR 36.4306; Pamphlet 26-7 Ch. 6. Verify with your AE.",
 f:[["h","Transaction"],["type","Cash-out type","sel","t2",[["t2","Type II (or Type I non-VA → VA)"],["t1","Type I VA → VA"]]],
  ["h","NTB options (one must be met for Type II / non-VA → VA)"],["cr","Current rate %","pct",""],["nr","New rate %","pct",""],["cpi","Current P&I","num",""],["npi","New P&I","num",""],
  ["armcp","ARM→ARM: current payment","num",""],["armnp","ARM→ARM: new payment","num",""],["armcm","ARM→ARM: max current rate %","pct",""],["armnm","ARM→ARM: max new rate %","pct",""],
  ["ri0","Monthly residual income at initial application","num",""],["ri1","Monthly residual income after refinance (26-6393 line 43)","num",""],
  ["cexp","Current expenses (P&I + MI + other debt)","num",""],["nexp","New expenses (P&I + MI + other debt)","num",""],["cty","Current term (remaining years)","num",""],["nty","New term (years)","num",""],
  ["mi","Eliminates monthly mortgage / guaranty insurance (A)","chk",""],["interim","Refinances interim construction/alteration/repair loan (F)","chk",""],["armfix","ARM → fully-amortizing fixed (H)","chk",""],["ltv","New loan amount ÷ value % (G: ≤ 90%)","pct",""],
  ["h","Type I VA → VA requirements"],["fixtype","Type I rate structure","sel","ff",[["ff","Fixed → Fixed (≥ 0.50% lower)"],["farm","Fixed → ARM (≥ 2.00% lower)"],["na","ARM → ARM/Fixed"]]],
  ["cc","Closing costs (excl. escrows, prepaids)","num",""],["disc","Discount","num",""],["ff","Funding fee","num",""],["lc","Lender credit","num",""],
  ["h","Seasoning (all VA cash-out)"],["six","6 consecutive payments made?","sel","Yes",[["Yes","Yes"],["No","No"]]],["pfp","Prior loan first payment due","date",""],["nnd","Note date of new loan","date",""]],
 example:{type:"t1",cr:7,nr:6.25,cpi:2661.21,npi:2462.87,cc:4000,disc:0,ff:0,lc:500,fixtype:"ff",six:"Yes"},expect:{"Months to recoup (K53)":17.65},
 run(v){const rc=n(v.cr)-n(v.nr),pic=n(v.cpi)?(n(v.npi)-n(v.cpi))/n(v.cpi)*100:null;const T=[];
  const B=has(v.cty)&&has(v.nty)?n(v.cty)-n(v.nty)>=1:null;const Cc=has(v.cr)&&has(v.nr)?rc>0:null;const Dd=has(v.cpi)&&has(v.npi)?n(v.npi)<n(v.cpi):null;
  const Darm=has(v.armcp)&&has(v.armnp)?(n(v.armnp)<n(v.armcp)&&(!has(v.armnm)||n(v.armnm)<=n(v.armcm))):null;
  const E=has(v.ri0)&&has(v.ri1)?n(v.ri0)-n(v.ri1)<0:null;const G=has(v.ltv)?n(v.ltv)<=90:null;
  const opts=[["A","Eliminates monthly MI/guaranty insurance",v.mi?true:null],["B","Term reduced ≥ 1 year",B],["C","Interest rate reduced",Cc],["D","P&I payment reduced",Dd],["D","ARM→ARM: payment reduced, max rate not higher",Darm],["E","Residual income increases",E],["F","Refinances interim construction loan",v.interim?true:null],["G","Loan ≤ 90% of value",G],["H","ARM → fixed",v.armfix?true:null]];
  const met=opts.filter(o=>o[2]===true);
  const K47=n(v.cc)+n(v.disc)+n(v.ff)-n(v.lc),K51=n(v.cpi)-n(v.npi),K53=K51?K47/K51:null;const d=days(pd(v.pfp),pd(v.nnd));
  const exp=has(v.cexp)&&has(v.nexp)?(n(v.nexp)-n(v.cexp)):null;
  const flags=[ok(met.length>0,`NTB options met: ${met.length?met.map(o=>o[0]+" — "+o[1]).join("; "):"none yet"}`)];
  if(v.type==="t1"){const rt=v.fixtype==="ff"?[rc>=0.5-1e-9,"Type I fixed→fixed rate ≥ 0.50% lower"]:v.fixtype==="farm"?[rc>=2-1e-9,"Type I fixed→ARM rate ≥ 2.00% lower (max 90% LTV if > 1% discount)"]:null;if(rt)flags.push(ok(rt[0],rt[1]+` — ${pc(rc)}`));flags.push(K53==null?[false,"Recoupment: no monthly savings — cannot recoup"]:ok(K53<=36,`Recoupment ${nf(K53,1)} months (≤ 36)`))}
  flags.push(ok(v.six!=="No","6 consecutive payments made"));flags.push(d==null?[null,"210 days: enter dates"]:ok(d>=210,`${d} days first payment due → new note (≥ 210)`));
  return{out:[["Rate change",has(v.cr)?pc(-rc):"—"],["P&I change",pic==null?"—":nf(pic,2)+"%"],["Expense change ($)",exp==null?"—":m2(exp)],["Total cost of loan (K47 incl. funding fee)",m2(K47)],["Monthly savings (K51)",m2(K51)],["Months to recoup (K53)",K53==null?"—":nf(K53,2),"",K53==null?null:Math.round(K53*100)/100]],flags}}});

def({k:"fha_ntb",grp:"FHA",t:"FHA Streamline NTB & Seasoning (lender tab)",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — FHA Streamline tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],
 verify:"HUD 4000.1 II.A.8.d.vi (NTB table) and seasoning. Verify with your AE.",
 f:[["h","No term reduction (or < 3 years)"],["prog","Program","sel","ff",[["ff","Fixed → Fixed (≥ 0.5 reduction)"],["two","Fixed→1-yr ARM / Hybrid / ARM ≥ 15 mo (≥ 2 reduction)"],["armfix","Any ARM → Fixed (≤ 2 increase)"],["one","ARM < 15 mo → 1-yr ARM etc. (≥ 1 reduction)"]]],["cc","Current note + MIP rate %","pct",""],["nc","New note + MIP rate %","pct",""],
  ["h","Term reduction of 3+ years"],["tr","Use term-reduction test","sel","no",[["no","No"],["fixed","Fixed → Fixed"],["arm","Any ARM → Fixed"]]],["rem","Remaining amortization (months) on current note","num",""],["newm","New amortization term (months)","num",""],["tcc","Current note + MIP rate %","pct",""],["tnc","New note + MIP rate %","pct",""],["cpm","Current PI & MIP","num",""],["npm","New PI & MIP","num",""],
  ["h","Remaining amortization helper"],["oclose","Original closing date","date",""],["oterm","Old term (months)","num",""],["lastpay","Date of last payment on current mortgage","date",""],
  ["h","Seasoning"],["pfp","Prior loan first payment date","date",""],["case","New FHA case assignment date","date",""],["pnote","Prior loan note date","date",""],["nfp","First payment date of new loan","date",""]],
 example:{prog:"ff",cc:7.35,nc:6.3,pfp:"2025-03-01",case:"2025-10-15",pnote:"2025-01-24",nfp:"2025-12-01"},expect:{"Combined rate change":"-1.050%"},
 run(v){const ch=has(v.cc)&&has(v.nc)?n(v.nc)-n(v.cc):null;
  const t={ff:[ch!=null&&ch<=-0.5,"≤ −0.50"],two:[ch!=null&&ch<=-2,"≤ −2.00"],armfix:[ch!=null&&ch<=2,"≤ +2.00"],one:[ch!=null&&ch<=-1,"≤ −1.00"]}[v.prog];
  const os=pd(v.oclose);const AA35=os?new Date(Date.UTC(os.getUTCFullYear(),os.getUTCMonth()+1,1)):null;const AA38=AA35&&pd(v.lastpay)?datedifM(AA35,pd(v.lastpay))+1:null;const remCalc=AA38!=null&&has(v.oterm)?n(v.oterm)-AA38:null;
  const fl=[ch==null?[null,"Combined-rate test: enter rates"]:ok(t[0],`Combined rate change ${pc(ch)} (${t[1]})`)];
  if(v.tr!=="no"){const R31=has(v.rem)&&has(v.newm)?!(36+n(v.newm)>n(v.rem)):null;const tch=has(v.tcc)&&has(v.tnc)?n(v.tnc)-n(v.tcc):null;const R33=tch==null?null:(v.tr==="fixed"?tch<0:tch<=2);const R34=has(v.cpm)&&has(v.npm)?!(n(v.npm)>50+n(v.cpm)):null;
   fl.push(PF(R31,"Term reduced ≥ 36 months"),PF(R33,v.tr==="fixed"?"Combined rate reduced":"Combined rate ≤ +2.00"),PF(R34,"New PI&MIP ≤ current + $50"),ok(R31&&R33&&R34,"NTB test met (term reduction)"))}
  const m6=datedifM(pd(v.pfp),pd(v.case)),d210=days(pd(v.pnote),pd(v.case)),fp210=days(pd(v.pfp),pd(v.nfp));
  fl.push(m6==null?[null,"6 months since first payment: enter dates"]:ok(m6>=6,`${m6} full months first payment → case assignment (≥ 6)`),d210==null?[null,"210 days from note: enter dates"]:ok(d210>=210,`${d210} days prior note → case assignment (≥ 210)`),fp210==null?[null,"210 days first payment → new first payment: enter dates"]:ok(fp210>=210,`${fp210} days prior first payment → new first payment (≥ 210)`));
  return{out:[["Combined rate change",ch==null?"—":pc(ch),"",ch==null?null:pc(ch)],["Payments made (helper AA38)",AA38==null?"—":AA38],["Remaining amortization (months)",remCalc==null?"—":remCalc]],flags:fl}}});

def({k:"generic_ntb",grp:"Conventional / Other",t:"Generic NTB Test (Conventional state, Non-Agency, FHA non-streamline, RD)",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — Generic NTB Test tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],
 verify:"Required for conventional loans in AR, CT, IL, MN, NC, NM, OH, WA plus state-specific NTB tests (CO, MA, MD, ME, RI, SC, VA, WV). Per lender worksheet — verify with your AE.",
 f:[["h","Rate / payment"],["cr","Current rate %","pct",""],["nr","New rate %","pct",""],["crm","Current rate + MI %","pct",""],["nrm","New rate + MI %","pct",""],["cpi","Current P&I","num",""],["npi","New P&I","num",""],["cpim","Current P&I + MI","num",""],["npim","New P&I + MI","num",""],
  ["h","Fixed → ARM / ARM → ARM"],["armt","ARM term","sel","7",[["5","5-year ARM (≥ 1.00 reduction)"],["7","7+ year ARM (≥ 0.50 reduction)"]]],["fr","Fixed rate %","pct",""],["ar","ARM rate %","pct",""],["acp","ARM→ARM current payment","num",""],["anp","ARM→ARM new payment","num",""],["acm","Max current rate %","pct",""],["anm","Max new rate %","pct",""],
  ["h","Expenses / term / cash-out"],["cexp","Current expenses (PI + MI + debt)","num",""],["nexp","New expenses (PI + MI + debt)","num",""],["ct","Current term (years)","num",""],["nt","New term (years)","num",""],["armtofix","Converting ARM to fully-amortizing fixed","chk",""],["cash","Cash out (incl. non-secured debt payoffs)","num",""],["costs","Closing costs (excl. prepaids)","num",""],["divorce","Divorce buyout","chk",""],
  ["h","FHA cash-out seasoning"],["six","6 consecutive payments made?","sel","",[["","—"],["Yes","Yes"],["No","No"]]],["pfp","Prior loan first payment due","date",""],["nfp","New loan first payment due","date",""]],
 example:{cr:7.5,nr:7.125,cpi:2097.65,npi:2021.16,cexp:3200,nexp:2800},expect:{},
 run(v){const F=[];const t=(c,cond,txt)=>{if(c)F.push(ok(cond,txt))};
  const rc=n(v.nr)-n(v.cr);t(has(v.cr)&&has(v.nr),rc<=-0.25,`Fixed→Fixed rate ${pc(rc)} (≤ −0.25)`);
  const rm=n(v.nrm)-n(v.crm);t(has(v.crm)&&has(v.nrm),rm<=-0.5,`Fixed→Fixed with MI ${pc(rm)} (≤ −0.50)`);
  const p=n(v.cpi)?(n(v.npi)-n(v.cpi))/n(v.cpi)*100:0;t(has(v.cpi)&&has(v.npi),p<=-5,`P&I change ${nf(p,2)}% (≤ −5%)`);
  const pm=n(v.cpim)?(n(v.npim)-n(v.cpim))/n(v.cpim)*100:0;t(has(v.cpim)&&has(v.npim),pm<=-5,`P&I + MI change ${nf(pm,2)}% (≤ −5%)`);
  const ar=n(v.ar)-n(v.fr);t(has(v.fr)&&has(v.ar),ar<=(v.armt==="5"?-1:-0.5),`Fixed→ARM ${pc(ar)} (${v.armt==="5"?"≤ −1.00":"≤ −0.50"})`);
  t(has(v.acp)&&has(v.anp),n(v.anp)<n(v.acp)&&(!has(v.anm)||n(v.anm)<=n(v.acm)),`ARM→ARM payment ${m2(n(v.anp)-n(v.acp))}, max rate not higher`);
  const ex=n(v.cexp)?(n(v.nexp)-n(v.cexp))/n(v.cexp)*100:0;t(has(v.cexp)&&has(v.nexp),ex<=-10,`Monthly expenses ${nf(ex,2)}% (≤ −10%)`);
  t(has(v.ct)&&has(v.nt),n(v.ct)-n(v.nt)>=5,`Term reduction ${n(v.ct)-n(v.nt)} years (≥ 5)`);
  if(v.armtofix)F.push(ok(true,"ARM → fully-amortizing fixed"));if(v.divorce)F.push(ok(true,"Divorce buyout"));
  t(has(v.cash)&&has(v.costs),n(v.cash)>n(v.costs)*1.25,`Cash out ${m2(n(v.cash))} vs 1.25 × costs ${m2(n(v.costs)*1.25)}`);
  if(v.six)F.push(ok(v.six==="Yes","FHA cash-out: 6 consecutive payments"));const d=days(pd(v.pfp),pd(v.nfp));if(d!=null)F.push(ok(d>=210,`FHA cash-out: ${d} days first payment → new first payment (≥ 210)`));
  const any=F.some(f=>f[0]===true);
  return{out:[["Benefits met",F.filter(f=>f[0]===true).length+" of "+F.length+" tested"],["Cash out must be more than (P36)",has(v.costs)?m2(n(v.costs)*1.25):"—"]],flags:[ok(any,any?"At least one benefit demonstrated":"No benefit demonstrated yet"),...F]}}});

def({k:"rd_streamline_assist",grp:"Conventional / Other",t:"USDA RD Streamline-Assist NTB",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — RD-Streamline Assist tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],verify:"USDA HB-1-3555 Ch. 6 (Streamlined-Assist refinance). Verify with your AE.",
 f:[["cr","Current rate %","pct",4.5],["nr","New rate %","pct",4.25],["cp","Current PITI (incl. annual fee)","num",1650],["np","New PITI (incl. annual fee)","num",1580]],example:{cr:4.5,nr:4.25,cp:1650,np:1580},expect:{"PITI reduction":70},
 run(v){const a=has(v.cr)&&has(v.nr)?n(v.cr)>=n(v.nr):null,r=n(v.cp)-n(v.np),b=has(v.cp)&&has(v.np)?r>=50:null;return{out:[["PITI reduction",m2(r),"",Math.round(r*100)/100]],flags:[PF(a,"New rate does not exceed current rate"),PF(b,`New PITI at least $50 less (${m2(r)})`)]}}});

def({k:"refinow_ntb",grp:"Conventional / Other",t:"Fannie RefiNow / Freddie Refi Possible NTB",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — RefiNow-RefiPossible tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],verify:"Fannie Mae B5-7-01 / Freddie Mac 4302 — programs may be retired or changed; verify current availability with your AE.",
 f:[["cr","Current rate %","pct",""],["nr","New rate %","pct",""],["cp","Current P&I + MI","num",""],["np","New P&I + MI","num",""]],example:{cr:6.5,nr:5.875,cp:1900,np:1780},expect:{},
 run(v){const rr=n(v.cr)-n(v.nr);const b=has(v.cp)&&has(v.np)?!(n(v.cp)-n(v.np)<0.01):null;   // S11 / S13
  return{out:[["Rate reduction",pc(rr)],["Payment reduction",m2(n(v.cp)-n(v.np))]],flags:[PF(has(v.cr)&&has(v.nr)?rr>=0.5-1e-9:null,"Rate reduced at least 50 bps"),PF(b,"P&I + MI reduced")]}}});

def({k:"blended_rate",grp:"Conventional / Other",t:"Blended Rate Calculator",src:[["VA_IRRRL_Net_Tangible_Benefit_Worksheet.xls — Blended Rate Calc tab","1BhIJ_QADjoQiwyPxhypYKzpPtfGZdZc5"]],verify:"Weighted-average rate for NTB comparisons when a 1st and 2nd are both being refinanced.",
 f:[["b1","1st lien balance","num",250000],["r1","1st lien rate %","pct",5],["b2","2nd lien balance","num",50000],["r2","2nd lien rate %","pct",10]],example:{b1:250000,r1:5,b2:50000,r2:10},expect:{"Blended rate":"5.833%"},
 run(v){const tb=n(v.b1)+n(v.b2),ti=n(v.b1)*n(v.r1)+n(v.b2)*n(v.r2);const br=tb?ti/tb:null;return{out:[["Total balance",m2(tb)],["Annual interest (balance × rate)",m2(ti/100)],["Blended rate",br==null?"—":pc(br),"",br==null?null:pc(br)]],flags:[]}}});

/* ---------- 5. FHA MRI ---------- */
def({k:"fha_mri",grp:"FHA",t:"FHA Minimum Required Investment (3.5%) & Wire Estimate",src:[["FHA_Minimum_Required_Investment_Calculator.xlsx","1X8dytPlseIAJwfbWBUgegNSgyfj8eHgi"]],
 verify:"HUD 4000.1 II.A.4.d (MRI = 3.5% of the lesser of price or appraised value; sources of funds). Verify with your AE.",
 f:[["h","New MRI"],["price","Sales price","num",400000],["fund","Funding requirement % (should remain 100%)","pct",100],["dp","Down payment % (MRI 3.5%)","pct",3.5],["loan","Loan amount (blank = price × (1 − down %))","num",""],
  ["emd","EMD","num",5000],["gift","Gift of equity / gift funds","num",0],["vpoc","Verified POC items (paid from liquid account)","num",500],["nvpoc","Non-verified POC items","num",0],["taxpr","Tax prorations (credit)","num",0],["payoff","Payoffs on a purchase","num",0],
  ["h","Closing costs & credits"],["cc","Closing costs (CD box J)","num",12000],["sc","Seller credit","num",6000],["rc","Realtor / other IPC credit","num",0],["k","Section K adjustments (excl. payoffs)","num",0],["l","Section L adjustments","num",0],["pr","Principal reduction","num",0],
  ["h","Wire breakdown (estimate)"],["wcomp","Origination/broker comp (lender paid)","num",""],["wlc","Lender credit (section J)","num",""],["wcure","Over tolerance / cure","num",""],["wpic","Prepaid interest (credit)","num",""],["wgrma","GRMA fee (added)","num",""],["wny","Lender-paid mtg taxes (NY)","num",""],
  ["wuw","Underwriting/commitment fee","num",""],["wdisc","Discount points","num",""],["wmip","FHA MIP","num",""],["wvaff","VA funding fee","num",""],["wusda","USDA guarantee fee","num",""],["wtx","TX attorney review fee","num",""],["wgrma2","GRMA fee (netted)","num",""],["wpi","Prepaid interest","num",""],["wesc","Impound/escrow deposit","num",""],["wpr","Principal reduction","num",""],["whold","Escrow holdback","num",""]],
 example:{price:400000,fund:100,dp:3.5,emd:5000,gift:0,vpoc:500,nvpoc:0,taxpr:0,payoff:0,cc:12000,sc:6000,rc:0,k:0,l:0,pr:0},expect:{"Minimum cash to close to meet MRI":8500,"Current cash to close":14500},
 run(v){const B2=n(v.price),B5=n(v.dp)/100,B7=has(v.loan)?n(v.loan):Math.round(B2*n(v.fund)/100*(1-B5)*100)/100;
  const B14=B2*B5-(n(v.emd)+n(v.gift)+n(v.vpoc)+n(v.taxpr)-n(v.payoff));                      // =B2*B5-(B8+B9+B10+B12-B13)
  const B22=n(v.cc)+n(v.k)-n(v.sc)-n(v.rc)-n(v.l);                                               // =B16+B19-B17-B18-B20
  const B23=B2+n(v.cc)-B7-n(v.emd)-n(v.gift)-n(v.vpoc)-n(v.nvpoc)-n(v.taxpr)+n(v.payoff)-n(v.sc)-n(v.rc)+n(v.k)+n(v.pr)-n(v.l);
  const B24=B23-B14,meets=B23>=B14;
  const added=["wcomp","wlc","wcure","wpic","wgrma","wny"].reduce((a,k)=>a+n(v[k]),0),withheld=["wuw","wdisc","wmip","wvaff","wusda","wtx","wgrma2","wpi","wesc","wpr","whold"].reduce((a,k)=>a+n(v[k]),0);
  return{out:[["MRI required (price × down %)",m2(B2*B5)],["Loan amount",m2(B7)],["Minimum cash to close to meet MRI",m2(B14),"",Math.round(B14*100)/100],["Closing costs net of credits (B22)",m2(B22),B22<0?"bad":"good"],["Current cash to close",m2(B23),"",Math.round(B23*100)/100],["Difference (cash to close − minimum)",m2(B24),B24>=0?"good":"bad"],
   ["Wire: loan amount + added − withheld",m2(B7+added-withheld)],["Wire: total added / total withheld",m2(added)+" / "+m2(withheld)]],
   flags:[ok(meets,`Does borrower meet MRI: ${meets?"Yes":"No"}`),ok(B22>=0,B22>=0?"Credits do not exceed closing costs":"Total credits exceed closing costs — excess credit; reduce credits or apply as principal reduction (manager approval)")],
   notes:["Borrower CANNOT receive cash back on a gift of equity.","Current cash to close should equal the CD cash to close if fields are filled correctly. A $0.00 difference is a pass."]}}});

/* ---------- 6. Income calculator workbook ---------- */
const payFreq=dd=>dd===6?"Weekly":dd===13?"Bi-Weekly":[12,14,15].includes(dd)?"Semi-Monthly":[27,28,29,30].includes(dd)?"Monthly":null;
const PER={Weekly:52,"Bi-Weekly":26,"Semi-Monthly":24,Monthly:12};
const ytdMonths=(end,hire)=>{if(!end)return 0;const f=d=>d.getUTCMonth()+d.getUTCDate()/dim(d.getUTCFullYear(),d.getUTCMonth());let m=f(end);if(hire&&hire.getUTCFullYear()===end.getUTCFullYear())m-=f(hire);return m};
const varAvg=(ytd,rec,prev,C20,man)=>{if(!C20&&!man)return null;if(man)return(rec+prev+ytd)/man;return rec>=prev?(rec+prev+ytd)/(24+C20):(rec+ytd)/(12+C20)};
def({k:"inc_w2",grp:"Income",t:"Income — W-2 / YTD (salary, hourly, OT, commission, tips, SS, mileage)",src:[["Income_Calculator_Worksheet.xlsx — YTD Time Calculator tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.1, Freddie 5303, FHA 4000.1 II.A.4.c, VA 26-7 Ch. 4. Worksheet rev. 2.17.2016 — the $0.22/mile add-back is per worksheet (verify current).",
 f:[["h","Pay period"],["start","Most recent pay period start date","date","2026-10-01"],["end","Most recent pay period end date","date","2026-10-14"],["hire","Hire date (only if hired this year)","date",""],["man","Optional: manual total months to average variable income (explain in notes)","num",""],
  ["h","Salary"],["sal","Pay period salary","num",3000],["salytd","Year-to-date from most recent paystub","num",60000],
  ["h","Hourly"],["hr","Hourly pay rate","num",""],["hrs","Average hours worked per week","num",""],
  ["h","Overtime"],["oty","OT YTD","num",""],["otr","WVOE OT most recent year","num",""],["otp","WVOE OT previous year","num",""],
  ["h","Commission"],["cmy","Commission YTD","num",""],["cmr","WVOE commission most recent year","num",""],["cmp","WVOE commission previous year","num",""],
  ["h","Tips"],["tpy","Tips YTD","num",""],["tpr","WVOE tips most recent year","num",""],["tpp","WVOE tips previous year","num",""],
  ["h","Secondary / seasonal"],["sey","Secondary YTD","num",""],["ser","Most recent year W-2","num",""],["sep","Previous year W-2","num",""],
  ["h","Social Security (gross-up) & 2106 mileage"],["ss20a","1040 line 20a/6a SS benefits (annual)","num",""],["ss20b","1040 line 20b/6b taxable amount","num",""],["miles","Business miles (Form 2106)","num",""]],
 example:{start:"2026-10-01",end:"2026-10-14",sal:3000,salytd:60000},expect:{"Monthly salary income":6348.12},
 run(v){const s=pd(v.start),e=pd(v.end);const dd=days(s,e);const fq=dd==null?null:payFreq(dd);const C20=ytdMonths(e,pd(v.hire));const man=n(v.man)||0;
  const cur=fq&&has(v.sal)?n(v.sal)*PER[fq]/12:null,ytd=C20?n(v.salytd)/C20:null;const sal=cur!=null&&ytd!=null?Math.min(cur,ytd):(cur??ytd);
  const hourly=n(v.hr)*n(v.hrs)*52/12;
  const ot=varAvg(n(v.oty),n(v.otr),n(v.otp),C20,man),cm=varAvg(n(v.cmy),n(v.cmr),n(v.cmp),C20,man),tp=varAvg(n(v.tpy),n(v.tpr),n(v.tpp),C20,man);
  const sug=(r,p)=>r<p?"12 mos + YTD (declining)":"24 mos + YTD";
  const sec=n(v.ser)>n(v.sep)?(n(v.ser)+n(v.sep))/24:n(v.ser)/12;const ss=((n(v.ss20a)-n(v.ss20b))*1.25+n(v.ss20b))/12;const mi=n(v.miles)*0.22/12;
  const parts=[["Monthly salary income",has(v.sal)||has(v.salytd)?sal:null],["Monthly hourly income",has(v.hr)?hourly:null],["Monthly overtime income",has(v.oty)||has(v.otr)?ot:null],["Monthly commission income",has(v.cmy)||has(v.cmr)?cm:null],["Monthly tip income",has(v.tpy)||has(v.tpr)?tp:null],["Monthly secondary/seasonal income",has(v.ser)?sec:null],["Monthly Social Security (grossed up)",has(v.ss20a)?ss:null],["Mileage add-back (1003 'Other income')",has(v.miles)?mi:null]];
  const tot=parts.reduce((a,p)=>a+(p[1]||0),0);
  return{out:[["Pay frequency (from period dates)",fq||(dd==null?"Enter dates":`${dd}-day period not recognized`)],["Months elapsed year-to-date (C20)",nf(C20,4)],["Salary — current average (C27)",cur==null?"—":m2(cur)],["Salary — YTD average (C28)",ytd==null?"—":m2(ytd)],
   ...parts.filter(p=>p[1]!=null).map(p=>[p[0],m2(p[1]),"",Math.round(p[1]*100)/100]),["Total of components above",m2(tot)],
   has(v.otr)?["OT averaging",man?`manual ${man} months`:sug(n(v.otr),n(v.otp))]:null,has(v.cmr)?["Commission averaging",man?`manual ${man} months`:sug(n(v.cmr),n(v.cmp))]:null,has(v.tpr)?["Tip averaging",man?`manual ${man} months`:sug(n(v.tpr),n(v.tpp))]:null].filter(Boolean),
   flags:[cur!=null&&ytd!=null?[cur<=ytd?true:null,cur>ytd?"YTD average is lower than current — worksheet uses the lower YTD figure unless you document why the current rate applies":"Current rate supported by YTD"]:null,
    ...[["OT",n(v.otr),n(v.otp)],["Commission",n(v.cmr),n(v.cmp)],["Tips",n(v.tpr),n(v.tpp)]].filter(x=>x[1]||x[2]).map(x=>x[1]<x[2]?[false,`${x[0]} declining year over year — using most recent year + YTD; underwriter must confirm stability`]:[true,`${x[0]} stable/increasing`])].filter(Boolean),
   notes:["Pay frequency: period length 7 days = weekly, 14 = bi-weekly, 13–16 = semi-monthly, 28–31 = monthly (worksheet uses end − start: 6, 13, 12/14/15, 27–30).","Variable income (OT/commission/tips): 24 months + YTD if the most recent year ≥ previous year, else 12 months + YTD.","Social Security gross-up: non-taxable portion × 125% + taxable portion, ÷ 12."]}}});

const avgRule=(cur,prev,hasPrev)=>{const declining=cur<=prev&&prev!==0;const twelve=(declining&&hasPrev)||prev===0;return{twelve,avg:twelve?cur/12:(cur+prev)/24,label:twelve?"12 Month Average":"24 Month Average"}};
def({k:"inc_schc",grp:"Income",t:"Income — Sole Proprietorship (Schedule C)",src:[["Income_Calculator_Worksheet.xlsx — Sole Proprietorship tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.2 / Form 1084; Freddie 5304; FHA 4000.1 II.A.4.c.x. Vehicle add-back rates ($0.285 recent / $0.29 previous per mile) are per worksheet (verify current IRS depreciation component).",
 f:[["h","Most recent year"],["np1","Net profit/loss (line 31)","num",72000],["dl1","Depletion (line 12)","num",0],["dp1","Depreciation (line 13)","num",6000],["mi1","Business use of vehicle — miles","num",0],["am1","Amortization (pg 2 Part V)","num",0],["bh1","Business use of home (line 30)","num",2400],["me1","Meals & entertainment (line 24b) — deducted","num",1200],
  ["h","Previous year"],["np2","Net profit/loss (line 31)","num",65000],["dl2","Depletion","num",0],["dp2","Depreciation","num",5500],["mi2","Business use of vehicle — miles","num",0],["am2","Amortization","num",0],["bh2","Business use of home","num",2400],["me2","Meals & entertainment — deducted","num",1000],
  ["months","Average over","sel","auto",[["auto","Auto (worksheet trend rule)"],["12","12 months (most recent)"],["24","24 months"]]]],
 example:{np1:72000,dl1:0,dp1:6000,mi1:0,am1:0,bh1:2400,me1:1200,np2:65000,dl2:0,dp2:5500,mi2:0,am2:0,bh2:2400,me2:1000,months:"auto"},expect:{"Average monthly income":6295.83},
 run(v){const y=i=>n(v["np"+i])+n(v["dl"+i])+n(v["dp"+i])+n(v["mi"+i])*(i===1?0.285:0.29)+n(v["am"+i])+n(v["bh"+i])-n(v["me"+i]);const G=y(1),I=y(2);
  const hasPrev=["np2","dl2","dp2","mi2","am2","bh2","me2"].some(k=>n(v[k])!==0);const A=avgRule(G,I,hasPrev);const use=v.months==="12"?{avg:G/12,label:"12 Month Average"}:v.months==="24"?{avg:(G+I)/24,label:"24 Month Average"}:A;
  return{out:[["Vehicle add-back (recent / previous)",m2(n(v.mi1)*0.285)+" / "+m2(n(v.mi2)*0.29)],["Yearly total — most recent",m2(G)],["Yearly total — previous",m2(I)],["12-month average",m2(G/12)],["24-month average",m2((G+I)/24)],["Averaging used",use.label],["Average monthly income",m2(use.avg),"",Math.round(use.avg*100)/100]],
   flags:[ok(!(G<I&&hasPrev),G<I&&hasPrev?"Income declining year over year — worksheet trend rule uses the 12-month (most recent) average":"Income stable or increasing")],notes:["Add-backs are optional — add back only when necessary. The worksheet's 'Average Monthly Income' cell divides both years by the selected months; this calculator applies the sheet's own 12/24 helper cells (Y13/Y14)."]}}});

const kInc=(v,i,pct,rows)=>rows.reduce((a,[k,s])=>a+n(v[k+i])*(s==="raw"?1:pct)*(s==="neg"?-1:1),0);
def({k:"inc_1065",grp:"Income",t:"Income — Partnership / LLC (K-1 / 1065)",src:[["Income_Calculator_Worksheet.xlsx — Partnership LLC tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.2-01 / Form 1084; Freddie 5304. Use business income only with documented ownership, access and liquidity, and positive trend.",
 f:[["h","Most recent year"],["own1","Year-end profit %","pct",50],["w21","W-2 wages (line 1 or 5)","num",0],["k11","K-1 ordinary income (line 1)","num",40000],["k21","K-1 net rental (lines 2 & 3, if recurring)","num",0],["gp1","Guaranteed payments (line 4, if recurring)","num",12000],
  ["oi1","1065: ordinary income from other partnerships (line 4) — negate","num",0],["nf1","1065: net farm profit (line 5) — negate","num",0],["g47971","1065: Form 4797 gain (line 6) — negate","num",0],["ot1","1065: other income (line 7) — negate","num",0],
  ["dp1","1065: depreciation (line 16c) — add","num",8000],["dl1","1065: depletion (line 17) — add","num",0],["od1","1065: other deductions (see notes) — add","num",0],["d88251","8825: depreciation (line 14) — add","num",0],["mn1","Sch L mortgages/notes < 1 yr (line 16 col D) — subtract","num",0],["te1","Sch M-1 travel & entertainment (line 4) — subtract","num",0],
  ["h","Previous year"],["own2","Year-end profit %","pct",50],["w22","W-2 wages","num",0],["k12","K-1 ordinary income","num",36000],["k22","K-1 net rental","num",0],["gp2","Guaranteed payments","num",12000],
  ["oi2","Ordinary income other partnerships — negate","num",0],["nf2","Net farm profit — negate","num",0],["g47972","Form 4797 gain — negate","num",0],["ot2","Other income — negate","num",0],["dp2","Depreciation — add","num",7000],["dl2","Depletion — add","num",0],["od2","Other deductions — add","num",0],["d88252","8825 depreciation — add","num",0],["mn2","Notes < 1 yr — subtract","num",0],["te2","Travel & entertainment — subtract","num",0]],
 example:{own1:50,w21:0,k11:40000,k21:0,gp1:12000,dp1:8000,own2:50,k12:36000,gp2:12000,dp2:7000},expect:{"Average monthly income":4479.17},
 run(v){const rows=[["oi","neg"],["nf","neg"],["g4797","neg"],["ot","neg"],["dp","add"],["dl","add"],["od","add"],["d8825","add"],["mn","neg"],["te","neg"]];
  const yr=i=>{const p=n(v["own"+i])/100;return n(v["w2"+i])+n(v["k1"+i])+n(v["k2"+i])+n(v["gp"+i])+kInc(v,i,p,rows)};const G=yr(1),I=yr(2);
  const bad=i=>n(v["own"+i])<=0||n(v["own"+i])>100;const hasPrev=n(v.w22)||n(v.k12)||n(v.k22)||n(v.gp2)||n(v.dp2)||n(v.dl2)||n(v.od2)||n(v.d88252)||n(v.mn2)||n(v.te2);const A=avgRule(G,I,!!hasPrev);
  return{out:[["Yearly total — most recent",m2(G)],["Yearly total — previous",m2(I)],["12 or 24 month average",A.label],["Average monthly income",m2(A.avg),"",Math.round(A.avg*100)/100]],flags:[ok(!bad(1)&&!bad(2),bad(1)||bad(2)?"Enter year-end profit % (0–100%) for each year":"Ownership % entered"),ok(!(G<=I&&I!==0&&hasPrev),G<=I&&I!==0?"Not increasing — worksheet uses 12-month (most recent) average":"Increasing — 24-month average")]}}});

def({k:"inc_1120s",grp:"Income",t:"Income — S-Corporation (K-1 / 1120S)",src:[["Income_Calculator_Worksheet.xlsx — S-Corporation tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.2-01 / Form 1084; Freddie 5304. Use business income only with documented ownership, access and liquidity.",
 f:[["h","Most recent year"],["own1","Ownership %","pct",100],["w21","W-2 wages from the S-corp","num",60000],["k11","K-1 ordinary income (line 1)","num",30000],["k21","K-1 net rental (lines 2 & 3, if recurring)","num",0],
  ["g47971","1120S Form 4797 gain (line 4) — negate","num",0],["ot1","1120S other income (line 5) — negate","num",0],["dp1","Depreciation (line 14) — add","num",5000],["dl1","Depletion (line 15) — add","num",0],["od1","Other deductions — add","num",0],["d88251","8825 depreciation — add","num",0],["mn1","Sch L notes < 1 yr (line 17 col D) — subtract","num",0],["te1","Sch M-1 travel & entertainment (line 3b) — subtract","num",0],
  ["h","Previous year"],["own2","Ownership %","pct",100],["w22","W-2 wages","num",60000],["k12","K-1 ordinary income","num",26000],["k22","K-1 net rental","num",0],["g47972","Form 4797 gain — negate","num",0],["ot2","Other income — negate","num",0],["dp2","Depreciation — add","num",5000],["dl2","Depletion — add","num",0],["od2","Other deductions — add","num",0],["d88252","8825 depreciation — add","num",0],["mn2","Notes < 1 yr — subtract","num",0],["te2","T&E — subtract","num",0]],
 example:{own1:100,w21:60000,k11:30000,dp1:5000,own2:100,w22:60000,k12:26000,dp2:5000},expect:{"Average monthly income":7750},
 run(v){const rows=[["g4797","neg"],["ot","neg"],["dp","add"],["dl","add"],["od","add"],["d8825","add"],["mn","neg"],["te","neg"]];const yr=i=>{const p=n(v["own"+i])/100;return n(v["w2"+i])+n(v["k1"+i])+n(v["k2"+i])+kInc(v,i,p,rows)};const G=yr(1),I=yr(2);
  const twelve=G===0||I===0;const avg=twelve?G/12:(G+I)/24;      // G28 =IF(OR(G26=0,I26=0),Y8,Y9)
  return{out:[["Yearly total — most recent",m2(G)],["Yearly total — previous",m2(I)],["12 or 24 month average",twelve?"12 Month Average":"24 Month Average"],["Average monthly income",m2(avg),"",Math.round(avg*100)/100]],
   flags:[ok(!(G<=I&&I!==0),G<=I&&I!==0?"Not increasing — the sheet's helper (X13) would use the 12-month average; its output cell still averages 24 months. Confirm with underwriter.":"Increasing year over year")]}}});

def({k:"inc_1120",grp:"Income",t:"Income — C-Corporation (1120)",src:[["Income_Calculator_Worksheet.xlsx — C-Corporation tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.2-01; corporate income usable only with 100% ownership and access (per worksheet notes). Verify with underwriter.",
 f:[["h","Most recent year"],["own1","Shareholder %","pct",100],["w21","W-2 wages","num",80000],["ti1","Taxable income (line 30)","num",20000],["cg1","Capital gain net income (line 8) — negate","num",0],["g47971","Form 4797 gain (line 9) — negate","num",0],["ot1","Other income (line 10) — negate","num",0],
  ["dp1","Depreciation (line 20) — add","num",4000],["dl1","Depletion (line 21) — add","num",0],["od1","Other deductions (line 26) — add","num",0],["nol1","NOL & special deductions (line 29c) — add","num",0],["tt1","Total tax (line 31) — subtract","num",4200],["mn1","Sch L notes < 1 yr — subtract","num",0],["te1","Sch M-1 T&E (line 5c) — subtract","num",0],["dv1","Dividends paid to borrower (Sch M-2 line 5) — subtract","num",0],["d88251","8825 depreciation — add","num",0],
  ["h","Previous year"],["own2","Shareholder %","pct",100],["w22","W-2 wages","num",80000],["ti2","Taxable income","num",18000],["cg2","Capital gain — negate","num",0],["g47972","4797 gain — negate","num",0],["ot2","Other income — negate","num",0],["dp2","Depreciation — add","num",4000],["dl2","Depletion — add","num",0],["od2","Other deductions — add","num",0],["nol2","NOL — add","num",0],["tt2","Total tax — subtract","num",3780],["mn2","Notes < 1 yr — subtract","num",0],["te2","T&E — subtract","num",0],["dv2","Dividends — subtract","num",0],["d88252","8825 depreciation — add","num",0]],
 example:{own1:100,w21:80000,ti1:20000,dp1:4000,tt1:4200,own2:100,w22:80000,ti2:18000,dp2:4000,tt2:3780},expect:{"Average monthly income":8250.83},
 run(v){const rows=[["ti","add"],["cg","neg"],["g4797","neg"],["ot","neg"],["dp","add"],["dl","add"],["od","add"],["nol","add"],["tt","neg"],["mn","neg"],["te","neg"],["dv","neg"],["d8825","add"]];
  const yr=i=>n(v["w2"+i])+kInc(v,i,n(v["own"+i])/100,rows);const G=yr(1),I=yr(2);const hasPrev=rows.some(([k])=>n(v[k+"2"]))||n(v.w22);const A=avgRule(G,I,!!hasPrev);
  return{out:[["Total yearly income — most recent",m2(G)],["Total yearly income — previous",m2(I)],["Business portion (excl. W-2) — recent / previous",m2(G-n(v.w21))+" / "+m2(I-n(v.w22))],["12 or 24 month average",A.label],["Average monthly income",m2(A.avg),"",Math.round(A.avg*100)/100]],
   flags:[ok(n(v.own1)===100||G-n(v.w21)<=0,n(v.own1)===100?"100% ownership — positive business income may be considered":"Positive corporate income requires 100% ownership and access (worksheet note)"),ok(!(G<=I&&I!==0&&hasPrev),G<=I&&I!==0?"Not increasing — 12-month average used":"Increasing — 24-month average")]}}});

def({k:"inc_reo",grp:"Income",t:"Income — REO / Rental (Schedule E)",src:[["Income_Calculator_Worksheet.xlsx — REO - Rent tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],
 verify:"Fannie B3-3.1-08 / Form 1038; Freddie 5306.1; FHA 4000.1 II.A.4.c.xii. Jumbo investors generally require a 2-year rental management history and 2-year average.",
 f:[["h","Most recent Schedule E"],["d1","Number of days owned during tax year","num",365],["r1","Rents received (line 3)","num",24000],["e1","Total expenses (line 20)","num",20000],["dp1","+ Depreciation/depletion (line 18)","num",5000],["in1","+ Insurance (line 9)","num",1000],["it1","+ Mortgage interest (line 12)","num",8000],["tx1","+ Taxes (line 16)","num",3000],["oe1","+ Eligible other (HOA, fire/theft) (line 19, itemized)","num",0],
  ["h","Previous Schedule E"],["d2","Number of days owned","num",365],["r2","Rents received","num",23000],["e2","Total expenses","num",19500],["dp2","+ Depreciation","num",5000],["in2","+ Insurance","num",950],["it2","+ Interest","num",8200],["tx2","+ Taxes","num",2900],["oe2","+ Eligible other","num",0],
  ["h","Current housing expense"],["pi","Current monthly P&I (blank if free & clear)","num",1200],["tih","Current monthly taxes, insurance & HOA","num",400],["req24","Lender requires 24-month average?","sel","Y",[["Y","Yes"],["N","No"]]]],
 example:{d1:365,r1:24000,e1:20000,dp1:5000,in1:1000,it1:8000,tx1:3000,oe1:0,d2:365,r2:23000,e2:19500,dp2:5000,in2:950,it2:8200,tx2:2900,oe2:0,pi:1200,tih:400,req24:"Y"},expect:{"Net monthly income (loss) — most recent":149.99},
 run(v){const yr=i=>n(v["r"+i])-n(v["e"+i])+n(v["dp"+i])+n(v["it"+i])+n(v["tx"+i])+n(v["in"+i])+n(v["oe"+i]);const mo=i=>n(v["d"+i])?yr(i)/(n(v["d"+i])/30.4165):null;
  const net=i=>mo(i)==null?null:mo(i)-(n(v.pi)+n(v.tih));const a=net(1),b=net(2);const two=a!=null&&b!=null?(a+b)/2:null;
  return{out:[["Gross yearly rental income — recent / previous",m2(yr(1))+" / "+m2(yr(2))],["Gross monthly rental income — recent / previous",m2(mo(1))+" / "+m2(mo(2))],["Net monthly income (loss) — most recent",m2(a),a>=0?"good":"bad",a==null?null:Math.round(a*100)/100],["Net monthly income (loss) — previous",m2(b)],["2-yr average net income/loss",v.req24==="Y"?m2(two):"N/A",two>=0?"good":"bad"]],
   flags:[a==null?[null,"Enter days owned"]:ok(a>=0,a>=0?"Positive net rental income":"Net rental loss — include as a liability")],notes:["Monthly = yearly ÷ (days owned ÷ 30.4165). Use for partial-year ownership, not partial-year rental (worksheet change log 8/25/2015)."]}}});

def({k:"inc_farm",grp:"Income",t:"Income — Farm (Schedule F)",src:[["Income_Calculator_Worksheet.xlsx — Farm tab","1Q38R4-B7a8Rvq5VOIIu3lI3YL0_avb12"]],verify:"Fannie B3-3.2; Freddie 5304. Add back depreciation/Section 179 only when necessary.",
 f:[["np1","Most recent: net farm profit/loss (line 34)","num",30000],["dp1","Most recent: depreciation & Sec. 179 (line 14)","num",6000],["np2","Previous: net farm profit/loss","num",28000],["dp2","Previous: depreciation & Sec. 179","num",6000]],
 example:{np1:30000,dp1:6000,np2:28000,dp2:6000},expect:{"Average monthly income":2916.67},
 run(v){const G=n(v.np1)+n(v.dp1),I=n(v.np2)+n(v.dp2);const A=avgRule(G,I,has(v.np2)||has(v.dp2));return{out:[["Yearly totals — recent / previous",m2(G)+" / "+m2(I)],["12 or 24 month average",A.label],["Average monthly income",m2(A.avg),"",Math.round(A.avg*100)/100]],flags:[ok(!(G<=I&&I!==0),G<=I&&I!==0?"Not increasing — 12-month average":"Increasing — 24-month average")]}}});

/* ---------- 7. VA cash-out comparison certification (PDF) ---------- */
const amort=(bal,rate,mo)=>{const r=rate/1200;return mo>0?(r?bal*r/(1-Math.pow(1+r,-mo)):bal/mo):0};
def({k:"va_cashout_compare",grp:"VA",t:"VA Cash-Out Refinance Comparison Certification",src:[["VA_Net_Tangible_Comparison_Worksheet.pdf","1vnJzYmmtjxD1oQKeyylUD2vQguZCN18s"]],
 verify:"VA Circular 26-19-05 / 38 CFR 36.4306(a): lender gives Sections I–II within 3 business days of application and IV–VI at closing; borrower signs both. Retain 2 years.",
 f:[["h","Existing loan"],["xlin","VA LIN / loan type","txt","FHA"],["xbal","Loan balance (incl. 2nd liens/HELOCs)","num",300000],["xpay","Monthly payment (P&I + MI)","num",2150],["xterm","Remaining term (months)","num",300],["xtype","Loan type","txt","Fixed"],["xrate","Interest rate %","pct",6.875],
  ["h","Proposed / new loan"],["pbal","Loan balance (incl. financed funding fee & costs)","num",380000],["ppay","Monthly payment (P&I + MI) — blank = amortize","num",""],["pterm","Term (months)","num",360],["ptype","Loan type","txt","Fixed"],["prate","Interest rate %","pct",6.25],
  ["h","Value & closing summary"],["val","Appraised / estimated value","num",500000],["cashd","Cash directly disbursed to borrower","num",50000],["payoffs","Payoffs disbursed (excl. mortgages)","num",20000],
  ["h","Net tangible benefits (check any that apply; others auto-detected)"],["nmi","Eliminates monthly mortgage / guaranty insurance","chk",""],["nri","Increases monthly residual income (38 CFR 36.4340(e))","chk",""],["nint","Refinances interim construction/alter/repair loan","chk",""],["narm","Refinances ARM to fixed","chk",""]],
 example:{xbal:300000,xpay:2150,xterm:300,xrate:6.875,pbal:380000,pterm:360,prate:6.25,val:500000,cashd:50000,payoffs:20000},expect:{},
 run(v){const pp=has(v.ppay)?n(v.ppay):amort(n(v.pbal),n(v.prate),n(v.pterm));const xt=n(v.xpay)*n(v.xterm),pt=pp*n(v.pterm);const V=n(v.val);
  const xl=V?n(v.xbal)/V*100:null,pl=V?n(v.pbal)/V*100:null;const row=(l,a,b,f)=>[l,`${f(a)} → ${f(b)} (impact ${f(b-a)})`];
  const B=[["MI eliminated",!!v.nmi],["Shorter term",n(v.pterm)<n(v.xterm)],["Lower rate",n(v.prate)<n(v.xrate)],["Lower payment",pp<n(v.xpay)],["Residual income increases",!!v.nri],["Refinances interim construction loan",!!v.nint],["Loan ≤ 90% of value",pl!=null&&pl<=90],["ARM → fixed",!!v.narm]];
  return{out:[row("Loan balance",n(v.xbal),n(v.pbal),m2),row("Monthly payment",n(v.xpay),pp,m2),row("Remaining term (months)",n(v.xterm),n(v.pterm),x=>nf(x,0)),row("Interest rate",n(v.xrate),n(v.prate),x=>pc(x)),
   row("Total of remaining scheduled payments",xt,pt,m2),["Loan-to-value",`${xl==null?"—":nf(xl,2)+"%"} → ${pl==null?"—":nf(pl,2)+"%"}`],row("Home equity remaining",V-n(v.xbal),V-n(v.pbal),m2),
   ["Cash directly disbursed",m2(n(v.cashd))],["Payoffs disbursed (excl. mortgages)",m2(n(v.payoffs))],["Increase in total paid over life of loan",m2(pt-xt),pt-xt>0?"bad":"good"]],
   flags:[ok(B.some(b=>b[1]),`Net tangible benefits met: ${B.filter(b=>b[1]).map(b=>b[0]).join("; ")||"none — at least one of eight required"}`)],
   notes:["Monthly payment = principal, interest and mortgage insurance. Total of remaining payments = payment × remaining term (estimate).","Initial disclosure may use estimated value; final disclosure must use the VA Notice of Value."]}}});

def({k:"virginia_tnb",grp:"State",t:"Virginia Tangible Net Benefit (Va. Code § 6.2-1614(7))",src:[["VA_Tangible_Net_Benefit.pdf","19MjbyGAZpMlpRCE6sBsLEU7bDGm9I-XO"]],
 verify:"This is the Commonwealth of Virginia state refinance TNB form (not a Veterans Affairs form). Only for Virginia properties — confirm licensing and lender requirements.",
 f:[["lender","Lender name","txt","Patriot Pacific Financial Corp"],["borr","Borrower name(s)","txt",""],["addr","Property address","txt",""],["h","Benefits (check every one that applies)"],
  ["b1","Cash-out to pay necessary expenses (medical, education, home improvement, other)","chk",""],["b1d","— uses of proceeds","txt",""],["b2","Cash in excess of costs and fees of the refinance","chk",""],["b3","Lower rate with same or reduced term","chk",""],["b4","Lower monthly payment with same or reduced term","chk",""],["b5","Shorter term with same or reduced rate","chk",""],
  ["b6","Consolidating high-rate debts into a single lower-rate loan","chk",""],["b6y","— new total payment lower than total of obligations financed (incl. points/fees)?","sel","",[["","—"],["Yes","Yes"],["No","No"]]],["b7","Making a balloon payment on an existing mortgage","chk",""],["b8","Avoiding foreclosure","chk",""],["b9","ARM → fixed rate","chk",""],["b9y","— borrower regards this as a financial benefit?","sel","",[["","—"],["Yes","Yes"],["No","No"]]],["b10","Remove mortgage insurance by lowering LTV","chk",""],["b11","Other (specify)","txt",""]],
 example:{lender:"Patriot Pacific Financial Corp",b3:true,b4:true},expect:{},
 run(v){const L=[["b1","Cash-out for necessary expenses"+(has(v.b1d)?` (${v.b1d})`:"")],["b2","Cash in excess of costs and fees"],["b3","Lower rate, same or reduced term"],["b4","Lower payment, same or reduced term"],["b5","Shorter term, same or reduced rate"],["b6","Debt consolidation"+(v.b6y?` — total payment lower: ${v.b6y}`:"")],["b7","Balloon payment"],["b8","Avoiding foreclosure"],["b9","ARM → fixed"+(v.b9y?` — borrower regards as benefit: ${v.b9y}`:"")],["b10","Remove MI by lowering LTV"]].filter(x=>v[x[0]]).map(x=>x[1]);if(has(v.b11))L.push("Other: "+v.b11);
  return{out:[["Lender",v.lender||"—"],["Borrower(s)",v.borr||"—"],["Property",v.addr||"—"],["Benefits checked",L.join("; ")||"—"]],flags:[ok(L.length>0,L.length?`${L.length} tangible net benefit(s) documented`:"Check at least one benefit"),v.b6&&v.b6y==="No"?[false,"Debt consolidation where the new payment is not lower — document why it is a benefit"]:null].filter(Boolean),notes:["Borrower certification: borrower affirms the tangible benefit was explained and confirms it (signature and date for each borrower)."]}}});

/* ================= GUS GUIDE CHECKLIST ================= */
const GUS=[["Before you start",["Confirm lender/broker GUS access & role (Lender Agent/Broker works on a specific approved lender's application)","Have the 1003 XML from the LOS ready, or plan manual entry (Home → New Application)","Help Desk: RD.HD@usda.gov · 1-800-457-3642 (option 2 at each prompt)"]],
 ["1 · Create or import the application",["Home → Import Application → upload/drag the XML; GUS matches on Lender Tax ID + Lender Loan Number (existing match = update)","If 'Lender Loan Number already exists' error, change the number or update the existing app","Or Home → New Application and complete every screen"]],
 ["2 · Eligibility screen",["Property Information → Check Property Eligibility (TBD street allowed); if 'Unknown', Display Property Map and fix address","Household Members: number in household; residents < 18, disabled, or full-time students; childcare, medical, disability expenses (deductions)","Monthly gross income for ALL adult household members (not just borrowers) + all other income → Check Income Eligibility"]],
 ["3 · Borrower Information",["Personal info, citizenship, marital status, current/mailing address","Housing history: years/months, own/rent, rent per month; add former address if < 2 years","Current employment (Years/Months; 12+ months auto-converts); self-employed (≥ 25% ownership): check box, ownership, monthly income/loss (minus for loss)","Previous employment if < 2 years; Income from Other Sources (alimony, retirement, etc.); add co-borrowers"]],
 ["4 · Assets & Liabilities",["Add each bank/retirement account (owner, type, balance); other assets (cash or market value)","Liabilities: type, creditor, unpaid balance, monthly payment; mark paid off at/before closing or omit with reason","Other liabilities/expenses (child support, alimony, job expenses)","Run CAIVRS for each borrower — number auto-populates"]],
 ["5 · Real Estate",["Add each owned property (value, status, monthly insurance/taxes/dues); check 'Subject property' for refinances","Retained investment property: enter monthly rent — GUS net = 75% of rent − PITIA (e.g., $2,250 × 75% − $250 = $1,437.50)","Add mortgage(s) under each property; add additional properties"]],
 ["6 · Loan & Property Information",["Loan amount (excluding upfront guarantee fee) and purpose; property value; occupancy; mixed-use","Other new mortgage loans on the property (creditor, lien type, payment, amount)","Gifts or grants: asset type, deposited/not deposited, source, amount"]],
 ["7 · Declarations / Demographics / Originator",["Answer declarations for every borrower; military service","Demographic information (ethnicity, race, sex, collection method)","Loan Originator: organization + originator NMLS (Steven: NMLS 2449246; Patriot Pacific Financial Corp NMLS 1921615)"]],
 ["8 · Lender Loan Information",["Lender loan number, title (name, fee simple/leasehold), mortgage terms (rate, term, buydown)","Review Total Proposed Monthly Payment (includes annual fee)","Qualifying the Borrower — lines A–G due from borrower; total mortgage loans; other credits"]],
 ["9 · Additional Data",["Appraisal, dwelling, special financing, RD 3555-21 fields; confirm the underwriting branch is authorized","Non-citizens: Immigration-Naturalization (SAVE) Initial Verification → Secondary/Third check if needed (up to 30 business days)"]],
 ["10 · Credit & Underwriting",["Request Credit Report and Underwriting Only — use ONCE (repeat use may trigger re-issue fees)","After that, use 'Request Underwriting Only (Preliminary)' for every re-run — any edit invalidates the prior recommendation","Broker: Release Control of Application to the Lender when ready — permanent; app becomes view-only","Lender: Request Final Underwriting and Submission to RD (requires complete credit for all borrowers, authorized branch, interfaces online, not INELIGIBLE); submission locks the file — use Recall Final Submission if changes are needed"]],
 ["11 · Read the findings",["ACCEPT — eligible for delivery with 3555-21, appraisal, flood cert","ACCEPT WITH FULL DOCUMENTATION — randomly selected; submit full file (HB-1-3555 Ch. 15)","REFER / REFER WITH CAUTION — manual underwrite before submitting full documentation","INELIGIBLE (1st position) — credit/capacity/collateral issue (e.g., SAM exclusion, ratios over thresholds, dwelling fails 4000.1 MPR); (2nd position) — property/income/loan/borrower program issue","Clear Lender's Required Conditions and RD's Required Conditions; review GUS/GLS data comparison; Print Sections for the file"]]];

/* ================= UI ================= */
let cur=null;
const S=k=>Object.assign({},...C.find(c=>c.k===k).f.filter(f=>f[0]!=="h").map(f=>({[f[0]]:f[3]})),store.get("ws80_"+k,{}));
const run=(k,inp)=>{const c=C.find(x=>x.k===k);const v=Object.assign({},...c.f.filter(f=>f[0]!=="h").map(f=>({[f[0]]:f[3]})),inp||{});return c.run(v)};
const fieldHtml=(f,v)=>{if(f[0]==="h")return`<div style="grid-column:1/-1;margin-top:6px"><b class="sm">${esc(f[1])}</b></div>`;const[id,l,t,,o]=f;const val=v[id]??"";
 if(t==="sel")return`<label class="sm">${esc(l)}<select data-w="${id}">${o.map(([a,b])=>`<option value="${esc(a)}"${String(val)===String(a)?" selected":""}>${esc(b)}</option>`).join("")}</select></label>`;
 if(t==="chk")return`<label class="sm" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-w="${id}"${val?" checked":""}> ${esc(l)}</label>`;
 return`<label class="sm">${esc(l)}<input data-w="${id}" type="${t==="date"?"date":t==="txt"?"text":"number"}"${t==="num"||t==="pct"?' step="any"':""} value="${esc(val)}"></label>`};
const read=()=>{const v={};$$("#ws_form [data-w]").forEach(e=>v[e.dataset.w]=e.type==="checkbox"?e.checked:e.value);return v};
const summary=(c,v,r)=>[`${c.t}`,`Source: ${c.src.map(s=>s[0]).join(" · ")}`,"",...c.f.filter(f=>f[0]!=="h"&&has(v[f[0]])&&v[f[0]]!==false).map(f=>`  ${f[1]}: ${f[2]==="chk"?"✔":v[f[0]]}`),"","RESULTS",...r.out.map(o=>`  ${o[0]}: ${o[1]}`),...(r.flags.length?["","CHECKS",...r.flags.map(f=>`  ${f[0]===true?"✔ PASS":f[0]===false?"✘ FAIL":"• NOTE"} — ${f[1]}`)]:[]),"",`Verify: ${c.verify}`,"Prepared by Steven Shearrill, NMLS 2449246 · CA DRE 01988316 · Patriot Pacific Financial Corp NMLS 1921615.",DISC].join("\n");
const DISC="Estimate for discussion only — not a loan approval, commitment, or Loan Estimate. Final figures depend on underwriting, the lender's guidelines and current agency rules.";
const printHtml=(c,v,r)=>`<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.t)}</title><style>body{font:13px/1.45 system-ui,sans-serif;margin:28px;color:#111}h2{margin:0 0 4px}table{border-collapse:collapse;width:100%;margin:10px 0}td{border:1px solid #ccc;padding:4px 8px}td:last-child{text-align:right;font-variant-numeric:tabular-nums}.p{color:#12805c}.f{color:#c62d3a}.sm{font-size:11px;color:#555}</style></head><body><h2>${esc(c.t)}</h2><div class="sm">Source: ${c.src.map(s=>esc(s[0])).join(" · ")} · ${new Date().toLocaleDateString()}</div>
<table>${c.f.filter(f=>f[0]!=="h"&&has(v[f[0]])&&v[f[0]]!==false).map(f=>`<tr><td>${esc(f[1])}</td><td>${f[2]==="chk"?"✔":esc(v[f[0]])}</td></tr>`).join("")}</table>
<table>${r.out.map(o=>`<tr><td><b>${esc(o[0])}</b></td><td><b>${esc(o[1])}</b></td></tr>`).join("")}</table>
${r.flags.map(f=>`<div class="${f[0]===true?"p":f[0]===false?"f":""}">${f[0]===true?"✔ PASS":f[0]===false?"✘ FAIL":"• NOTE"} — ${esc(f[1])}</div>`).join("")}
<p class="sm">Verify against: ${esc(c.verify)}</p><p class="sm">Steven Shearrill · NMLS 2449246 · CA DRE 01988316 · Patriot Pacific Financial Corp · NMLS 1921615</p><p class="sm">${esc(DISC)}</p></body></html>`;
const OVERLAP=[["va","VA Toolkit → Residual income & IRRRL tester (quick estimators)"],["docproc","Document Processor → Income calculators"],["aus","AUS Simulator (DU/LPA/TOTAL/GUS pre-flight)"],["vaguaranty","VA Guaranty & Entitlement"],["calc","Calculators"]].filter(x=>typeof PAGE!=="undefined"&&PAGE[x[0]]);
function draw(){const c=C.find(x=>x.k===cur);const box=$("#ws_main");if(!box)return;
 if(cur==="gus"){const done=store.get("ws80_gus",{});box.innerHTML=`<div class="card" style="border-left:4px solid #2f855a"><h3 style="margin:0">USDA GUS — How to Run (step-by-step checklist)</h3><p class="sm mut" style="margin:6px 0">Summarized from <a href="${DRIVE("1x6vZ7DyUNm9xn7I1irTAFUwfa7AwKRO2")}" target="_blank" rel="noopener">GUS_-_How_to_Run_-_Guide.pdf ↗</a>. Verify against the current USDA GUS User Guide and HB-1-3555.</p>
  <div class="row" style="gap:6px"><button class="btn ghost sm" id="ws_gcopy">Copy checklist</button><button class="btn ghost sm" id="ws_greset">Reset checks</button><button class="btn ghost sm" id="ws_gsave">Print / Save</button></div></div>
  ${GUS.map(([h,items],i)=>`<div class="card"><h4 style="margin:0 0 6px">${esc(h)}</h4>${items.map((t,j)=>`<label class="sm" style="display:flex;gap:8px;margin:4px 0"><input type="checkbox" data-g="${i}_${j}"${done[i+"_"+j]?" checked":""}> <span>${esc(t)}</span></label>`).join("")}</div>`).join("")}`;
  $$("#ws_main [data-g]").forEach(e=>e.onchange=()=>{const d=store.get("ws80_gus",{});d[e.dataset.g]=e.checked;store.set("ws80_gus",d)});
  const txt=()=>GUS.map(([h,it],i)=>h+"\n"+it.map((t,j)=>`  [${store.get("ws80_gus",{})[i+"_"+j]?"x":" "}] ${t}`).join("\n")).join("\n\n");
  $("#ws_gcopy").onclick=()=>copy("USDA GUS — How to Run\n\n"+txt());$("#ws_greset").onclick=()=>{store.set("ws80_gus",{});draw()};
  $("#ws_gsave").onclick=()=>saveFile("usda-gus-checklist.html",`<!doctype html><meta charset="utf-8"><title>USDA GUS checklist</title><pre style="font:13px/1.5 system-ui;white-space:pre-wrap">${esc(txt())}</pre>`);return}
 const v=S(cur);
 box.innerHTML=`<div class="card" style="border-left:4px solid #2b6cb0"><div class="row" style="flex-wrap:wrap;gap:8px;align-items:center"><h3 style="margin:0;flex:1">${esc(c.t)}</h3>${c.src.map(s=>`<a class="btn ghost sm" href="${DRIVE(s[1])}" target="_blank" rel="noopener">Open original in Drive ↗</a>`).filter((x,i,a)=>a.indexOf(x)===i).join("")}</div>
  <p class="sm mut" style="margin:6px 0 0">Source: ${c.src.map(s=>esc(s[0])).join(" · ")}</p></div>
  <div class="grid g2"><div class="card"><div id="ws_form" class="form" style="grid-template-columns:repeat(2,minmax(0,1fr))">${c.f.map(f=>fieldHtml(f,v)).join("")}</div>
   <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn ghost sm" id="ws_ex">Load worksheet example</button><button class="btn ghost sm" id="ws_clr">Reset</button></div></div>
  <div><div class="card"><h4 style="margin:0 0 6px">Results <span class="sub">live</span></h4><table class="sm"><tbody id="ws_out"></tbody></table><div id="ws_flags" style="margin-top:8px"></div>
   <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" id="ws_copy">Copy summary</button><button class="btn ghost sm" id="ws_print">Print</button><button class="btn ghost sm" id="ws_save">Save (.html)</button></div></div>
   <div class="card sm" id="ws_notes"></div></div></div>`;
 const go=()=>{const v=read();store.set("ws80_"+cur,v);let r;try{r=c.run(v)}catch(e){r={out:[["Error",String(e.message||e)]],flags:[]}}
  $("#ws_out").innerHTML=r.out.map(o=>`<tr><td>${esc(o[0])}</td><td style="text-align:right;font-variant-numeric:tabular-nums" class="${o[2]||""}"><b>${esc(o[1])}</b></td></tr>`).join("");
  $("#ws_flags").innerHTML=r.flags.map(f=>`<div class="sm" style="margin:3px 0"><span class="tag ${f[0]===true?"good":f[0]===false?"bad":"warn"}">${f[0]===true?"PASS":f[0]===false?"FAIL":"NOTE"}</span>${esc(f[1])}</div>`).join("");
  $("#ws_notes").innerHTML=`${(r.notes||[]).map(t=>`<p style="margin:0 0 6px">• ${esc(t)}</p>`).join("")}<p style="margin:0 0 6px"><b>Verify:</b> ${esc(c.verify)} Confirm with the current VA Pamphlet 26-7 / HUD 4000.1 / agency guide and your AE.</p><p class="mut" style="margin:0">${esc(DISC)}</p>`;
  return{v,r}};
 $$("#ws_form [data-w]").forEach(e=>{e.oninput=go;e.onchange=go});go();
 $("#ws_ex").onclick=()=>{const blank=Object.fromEntries(c.f.filter(f=>f[0]!=="h").map(f=>[f[0],f[2]==="chk"?false:(f[2]==="sel"?f[3]:"")]));store.set("ws80_"+cur,Object.assign(blank,c.example));draw()};
 $("#ws_clr").onclick=()=>{store.set("ws80_"+cur,{});draw()};
 $("#ws_copy").onclick=()=>{const{v,r}=go();copy(summary(c,v,r))};
 $("#ws_print").onclick=()=>{const{v,r}=go();const w=window.open("","_blank");if(!w)return toast("Pop-up blocked — use Save instead");w.document.write(printHtml(c,v,r));w.document.close();setTimeout(()=>w.print(),300)};
 $("#ws_save").onclick=()=>{const{v,r}=go();saveFile(`${c.k.replace(/_/g,"-")}-worksheet.html`,printHtml(c,v,r))}}
const GRPS=["VA","FHA","Income","Conventional / Other","State"];
PAGE.worksheets={html:()=>{cur=cur||store.get("ws80_cur","va_residual");
 return`<div class="card" style="border-left:4px solid var(--accent,#c9a227)"><div class="row" style="flex-wrap:wrap;gap:8px;align-items:center"><h3 style="margin:0;flex:1">🧮 Worksheets & Calculators <span class="sub">Steven's Drive worksheets rebuilt live — same inputs, formulas and lookup tables</span></h3><a class="btn ghost sm" href="${FOLDER}" target="_blank" rel="noopener">Drive folder ↗</a></div>
 <p class="sm mut" style="margin:6px 0 0">${esc(DISC)} Tables that may be dated are kept as in the worksheet and labeled “per worksheet (verify current)”.${OVERLAP.length?` Related: ${OVERLAP.map(o=>`<a href="#${o[0]}">${esc(o[1])}</a>`).join(" · ")}`:""}</p></div>
 <style>.ws80g{grid-template-columns:minmax(200px,260px) minmax(0,1fr)}#ws_form label{min-width:0;display:block}#ws_form input,#ws_form select{width:100%;max-width:100%;box-sizing:border-box}@media(max-width:760px){.ws80g{grid-template-columns:minmax(0,1fr)!important}#ws_form{grid-template-columns:minmax(0,1fr)!important}}</style><div class="grid ws80g"><div class="card" style="align-self:start">${GRPS.map(g=>`<div class="sm mut" style="margin:8px 0 4px"><b>${g}</b></div>`+C.filter(c=>c.grp===g).map(c=>`<button class="btn ${c.k===cur?"":"ghost"} sm" data-ws="${c.k}" style="display:block;width:100%;text-align:left;margin:3px 0;white-space:normal">${esc(c.t)}</button>`).join("")).join("")}
  <div class="sm mut" style="margin:8px 0 4px"><b>USDA</b></div><button class="btn ${cur==="gus"?"":"ghost"} sm" data-ws="gus" style="display:block;width:100%;text-align:left;white-space:normal">GUS — How to Run checklist</button></div>
 <div id="ws_main"></div></div>`},
 mount(){$$("[data-ws]").forEach(b=>b.onclick=()=>{cur=b.dataset.ws;store.set("ws80_cur",cur);$$("[data-ws]").forEach(x=>x.classList.toggle("ghost",x.dataset.ws!==cur));draw()});draw()}};
return{C,run,riRequired,UFMIP_REFUND,GUS,list:()=>C.map(c=>({key:c.k,title:c.t,fields:c.f.filter(f=>f[0]!=="h").map(f=>({id:f[0],label:f[1],type:f[2],default:f[3]}))})),select:k=>{cur=k}};
})();
{const G=PAGES.find(p=>p[0]==="Loan Intelligence")||PAGES[0];if(G&&!G[1].some(x=>x[0]==="worksheets")){const i=G[1].findIndex(x=>x[0]==="calc");G[1].splice(i>=0?i+1:G[1].length,0,["worksheets","Worksheets & Calculators"])}}
if(typeof TITLES!=="undefined")TITLES.worksheets="🧮 Worksheets & Calculators";
if(typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^(worksheet|residual income worksheet|streamline (max|worksheet|wait)|fha streamline max|ufmip refund|irrrl (ntb|net tangible|recoup)|net tangible benefit|ntb worksheet|minimum required investment|\bmri\b|income calculator|self[- ]employed income calc|schedule c calc|k-?1 calc|rental income calc|gus guide|how to run gus|blended rate|cash-?out comparison)/i,{hash:"worksheets"}]);
if(typeof PB_TOOLS==="function"){const t0=PB_TOOLS;PB_TOOLS=()=>[...t0(),{name:"worksheet_calc",description:"Run one of Steven's Drive worksheets (exact spreadsheet formulas/tables): "+WS80.C.map(c=>c.k).join(", ")+". Pass calculator (key) and inputs {fieldId:value} — omit calculator to list calculators and their fields. Rates are in percent (6.5 = 6.5%), dates YYYY-MM-DD. Returns results rows, pass/fail checks and the verify note. Estimates only.",
 inputSchema:{type:"object",properties:{calculator:{type:"string"},inputs:{type:"object"}}},
 execute:i=>{const k=i&&i.calculator;const c=WS80.C.find(x=>x.k===k);if(!c)return{calculators:WS80.list()};const r=WS80.run(k,i.inputs||{});return{calculator:k,title:c.t,source:c.src.map(s=>({file:s[0],url:`https://drive.google.com/file/d/${s[1]}/view`})),results:r.out.map(o=>({label:o[0],value:o[1]})),checks:r.flags.map(f=>({pass:f[0],text:f[1]})),notes:r.notes||[],verify:c.verify}}}]}
