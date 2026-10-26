/* app39: Lender Compare & Recommend — one scored view of every lender built from the directory (LENDERS), the public program research (LENDER_INFO) and, on the published page, PPFC Trainual company terms (PPFC_LENDERS: comp, LoanSifter, lock cutoff, AE). Recommender for a deal, sortable/filterable comparison table, best-lender-by-loan-type matrix, side-by-side compare, your own service ratings, CSV export. */
const LC_TYPES=[
 ["conv","Conventional",/conv|conforming|agency|fannie|freddie|homeready|home possible/i,"Price and LLPAs, overlays above agency (DTI, FICO), condo review speed, appraisal waivers, lock-extension cost."],
 ["fha","FHA",/\bFHA\b/i,"FICO floor (580 vs 620/640 overlays), manual-UW acceptance, 203(k) and streamline, DPA pairing, condo approvals, turn time."],
 ["va","VA",/\bVA\b|veteran/i,"FICO floor, IRRRL and cash-out (Type II) rules, residual-income overlays, jumbo VA, entitlement help, appraisal ROV support."],
 ["usda","USDA",/USDA|rural/i,"Whether they do USDA at all, GUS-only vs manual, turn time with the USDA final-approval queue."],
 ["jumbo","Jumbo",/jumbo|high.?balance|super/i,"Max loan, reserves, FICO/LTV grid, DTI cap, 2nd-home/investor allowance, ARM options."],
 ["nonqm","Non-QM (general)",/non.?qm|alt.?doc|expanded|prime|near.?prime/i,"Doc types offered, seasoning after credit events, reserves, prepay options, max LTV by FICO, rate-sheet spread."],
 ["bank","Bank statement",/bank.?stat/i,"12 vs 24 months, personal vs business, expense factor (flat 50% vs CPA letter), min FICO, max LTV, loan max."],
 ["p&l","P&L only",/p&l|profit/i,"CPA/EA/tax-preparer signoff rules, months of P&L, bank-statement support required or not, max LTV."],
 ["1099","1099 income",/1099/i,"Expense factor, 1 vs 2 years of 1099s, max LTV, eligible professions."],
 ["voe","WVOE only",/voe|written verification/i,"Who can sign the WVOE, family-owned businesses, max LTV, FICO."],
 ["asset","Asset depletion / qualifier",/asset/i,"Divisor (60/84/360 months), eligible accounts and haircuts, minimum assets, max LTV."],
 ["dscr","DSCR / investor",/dscr|investor|rental|debt service/i,"Min DSCR (1.0 vs 0.75 / no-ratio), STR/Airbnb income, entity vesting, 5–8 unit and mixed-use, prepay structure, cash-out LTV."],
 ["foreign","Foreign national",/foreign|non.?resident/i,"Visa and ID requirements, no-FICO allowance, reserves held in US, max LTV, translation rules."],
 ["itin","ITIN",/itin/i,"Tax-return vs bank-statement doc, max LTV, FICO or alt-credit, reserves."],
 ["heloc","HELOC / 2nd lien",/heloc|closed.?end|2nd lien|second lien|2nd mortgage|second mortgage|piggy/i,"Max CLTV, draw period and rate structure, standalone vs piggyback, AVM vs appraisal, max line."],
 ["reverse","Reverse / HECM",/reverse|hecm|proprietary/i,"HECM vs proprietary jumbo reverse, H4P purchase, broker comp on reverse, counseling coordination."],
 ["fnfl","Fix & flip",/fix|flip|rehab/i,"LTC and ARV caps, rehab draws and holdback, experience tiers, speed to close, points."],
 ["bridge","Bridge",/bridge/i,"Max CLTV across both homes, exit requirements, term, whether payment is counted."],
 ["hard","Hard money / private",/hard|private/i,"LTV on as-is value, speed, points and term, borrower-experience rules, licensing in your state."],
 ["comm","Commercial",/commercial|mixed|multifamily|5\+|sba/i,"Property types, DSCR minimum, recourse, prepay, loan size range."],
 ["construction","Construction / OTC",/construction|one.?time|otc|lot|build/i,"One-time-close vs two-time, builder approval, draw management, contingency, max LTV on cost."],
 ["reno","Renovation",/reno|203\s?k|homestyle|choicereno|rehab/i,"203(k) standard vs limited, HomeStyle, consultant rules, contractor approval, draw speed."],
 ["dpa","Down-payment assistance",/dpa|down.?payment|assist|chenoa|boost|hfa|calhfa/i,"Which DPA programs (CalHFA, Chenoa, proprietary), forgivable vs repayable, FICO floor, layering limits."],
 ["condo","Condo / non-warrantable",/condo|warrant|condotel/i,"Non-warrantable and condotel acceptance, single-entity limits, litigation and commercial-space rules."],
 ["mfg","Manufactured",/manufactured|mobile|mfg/i,"Single vs double-wide, land-home vs chattel, foundation certs, age of home."],
 ["lowfico","Low FICO / credit events",/low.?fico|manual|credit event|recent|5\d\d/i,"FICO floor, seasoning after BK/FC/SS, manual-UW willingness, max LTV at the floor."],
 ["construction_ag","Agricultural / land",/\bag\b|agricult|farm|ranch|acre|\bland\b/i,"Acreage limits, income from the farm, land value share, rural appraisals."],
 ["physician","Physician / professional",/physician|doctor|medical|professional/i,"Eligible degrees, student-loan treatment, 100% LTV limits, PMI waived, employment-contract closing."],
 ["tribal","HUD-184 / tribal",/184|tribal|native/i,"HUD-184 approval, eligible areas, trust vs fee land, tribal-lease steps."],
 ["hei","Home equity investment",/hei|equity investment|equity sharing|shared appreciation/i,"Investment % of value, max CLTV, term and buyout, fee, lien position, state availability."],
 ["buydown","Buydowns",/buydown|2-1|temporary/i,"2-1 / 1-0 buydown funding source (seller/builder/lender), qualification at note rate."]
].map(([k,n,re,why])=>({k:k==="construction_ag"?"ag":k,n,re,why}));
const LC_ST=["CA","IL","NV","FL","AZ"];
const lcPP=()=>typeof PPFC_LENDERS!=="undefined"?PPFC_LENDERS:[];
const lcRates=()=>store.get("lc_rate",{});
const lcPct=s=>{s=String(s||"");let m=s.match(/(\d+(?:\.\d+)?)\s*%/);if(m)return+m[1];m=s.match(/(\d{2,3})\s*bps/i);return m?+m[1]/100:null};
const lcMoney=s=>{const a=[...String(s||"").matchAll(/\$\s?(\d[\d,]*(?:\.\d+)?)\s*(mm|m|million|k)?/gi)].map(m=>{let v=parseFloat(m[1].replace(/,/g,""));const u=(m[2]||"").toLowerCase();if(u==="k")v*=1e3;else if(u)v*=1e6;return v});return a.length?Math.max(...a):null};
const lcFico=s=>{const a=(String(s||"").match(/\b([4-8]\d\d)\b/g)||[]).map(Number);return a.length?Math.min(...a):null};
const lcLtv=s=>{const a=(String(s||"").match(/(\d{2,3}(?:\.\d+)?)\s*%/g)||[]).map(parseFloat).filter(v=>v<=100);return a.length?Math.max(...a):null};
const lcDti=s=>{const a=(String(s||"").match(/(\d{2}(?:\.\d+)?)\s*%/g)||[]).map(parseFloat).filter(v=>v<=65);return a.length?Math.max(...a):null};
const lcHasType=(x,t)=>x.tags.includes(t.k)||x.programs.some(p=>t.re.test(p.p))||x.niches.some(n=>t.re.test(n));
function lcAll(){const D=typeof LENDERS!=="undefined"?LENDERS:[],I=window.LENDER_INFO||[],P=lcPP(),R=lcRates();
 const ns=[...new Set([...D.map(l=>l.n),...I.map(l=>l.n),...P.filter(p=>!p.noKb).map(p=>p.n)])];
 return ns.map(n=>{const d=D.find(l=>l.n===n)||{},i=I.find(l=>l.n===n)||{},p=P.find(l=>l.n===n&&!l.noKb)||{};
  const programs=(i.programs||[]).map(g=>({...g,_f:lcFico(g.fico),_l:lcLtv(g.ltv),_a:lcMoney(g.loan),_d:lcDti(g.dti)}));
  const tags=[...new Set([...(d.tags||[]),...(p.tags||[])])].filter(t=>t!=="exited");
  const status=i.status||(p.n?"PPFC approved (Trainual)":"Directory only");
  const exited=(d.tags||[]).includes("exited")||/exit|inactive|closed/i.test(status);
  const lpc=lcPct(p.comp),bpcOnly=/bpc only|borrower paid/i.test(p.comp||"");
  const max=(k)=>{const v=programs.map(g=>g[k]).filter(v=>v!=null);return v.length?Math.max(...v):null};
  const min=(k)=>{const v=programs.map(g=>g[k]).filter(v=>v!=null);return v.length?Math.min(...v):null};
  return {n,name:d.name||i.name||p.name||("#"+n),spec:d.spec||"",flag:d.flag||"",tags,status,exited,verified:/verified/i.test(status),
   comp:p.comp||"",lpc,bpcOnly,sifter:/^y/i.test(p.sifter||""),lock:p.lock||"",ae:p.ae||d.ae||"",email:p.email||d.email||"",phone:p.phone||d.phone||"",fha:p.fha||"",vaid:p.vaid||"",
   states:i.states||{},niches:i.niches||[],programs,cautions:i.cautions||[],highlights:i.highlights||[],portal:i.portal||"",nmls:i.nmls||p.nmls||"",
   maxLtv:max("_l"),minFico:min("_f"),maxLoan:max("_a"),maxDti:max("_d"),rate:R[n]||{},note:(store.get("lp_notes",{})[n]||"")}})}
/* LO Comp Rule (12 CFR 1026.36(e)): comp never weights the ranking (comp weight 0 everywhere); comp is shown as information only. */
const LC_PRI={bal:["Balanced",{fit:1,comp:0,svc:1,risk:1}],odds:["Best approval odds",{fit:2,comp:0,svc:.8,risk:1.4}],svc:["Speed & service",{fit:1,comp:0,svc:2.5,risk:1}]};
function lcScore(x,q){const t=LC_TYPES.find(y=>y.k===q.type),W=(LC_PRI[q.pri]||LC_PRI.bal)[1];const why=[],warn=[];let s=0;
 if(x.exited)return null;
 if(t&&!lcHasType(x,t))return null;
 if(q.state){const v=x.states[q.state];if(v==="No")return null;if(v==="Yes"){s+=8;why.push(`Licensed in ${q.state}`)}else{s-=4;warn.push(`${q.state} license not confirmed — check NMLS Consumer Access`)}}
 const P=t?x.programs.filter(g=>t.re.test(g.p)):x.programs;let fit=0;
 if(P.length){const ok=P.filter(g=>(!q.fico||g._f==null||g._f<=q.fico)&&(!q.ltv||g._l==null||g._l>=q.ltv)&&(!q.amt||g._a==null||g._a>=q.amt)&&(!q.dti||g._d==null||g._d>=q.dti));
  const known=ok.filter(g=>(q.fico&&g._f!=null)||(q.ltv&&g._l!=null)||(q.amt&&g._a!=null));
  if(known.length){fit=30;why.push(`Published guide fits: ${known[0].p}${known[0]._f?` (min FICO ${known[0]._f}`:" ("}${known[0]._l?`, LTV to ${known[0]._l}%`:""}${known[0]._a?`, to $${(known[0]._a/1e6).toFixed(2)}M`:""})`)}
  else if(ok.length){fit=14;why.push(`Offers ${ok[0].p} — limits not published, ask AE`)}
  else{fit=-25;const g=P[0];warn.push(`Outside published guide for ${g.p}${g._f&&q.fico&&g._f>q.fico?` (min FICO ${g._f})`:""}${g._l&&q.ltv&&g._l<q.ltv?` (max LTV ${g._l}%)`:""}${g._a&&q.amt&&g._a<q.amt?` (max $${(g._a/1e6).toFixed(2)}M)`:""}`)}}
 else if(t){fit=8;why.push(`Tagged for ${t.n} in the directory/Trainual — no published matrix`)}
 const spec=x.tags.length&&x.tags.length<=5&&t&&x.tags.includes(t.k);if(spec){fit+=6;why.push("Specialist lender for this product")}
 s+=fit*W.fit;
 let c=0;if(x.lpc!=null){c=(x.lpc-1.5)*14;why.push(`LPC ${x.lpc}%${x.comp&&!/^\d/.test(x.comp)?` (${x.comp.slice(0,40)})`:""}`)}else if(x.bpcOnly){c=-2;warn.push("Borrower-paid comp only")}else if(x.comp){warn.push(`Comp: ${x.comp.slice(0,60)}`)}
 s+=c*W.comp;
 let v=0;const r=x.rate;if(r.speed){v+=(r.speed-3)*6;why.push(`Your speed rating ${r.speed}/5`)}if(r.svc){v+=(r.svc-3)*6;why.push(`Your service rating ${r.svc}/5`)}if(x.sifter){v+=3;why.push("On LoanSifter")}if(x.ae){v+=4}else warn.push("No AE on file")
 s+=v*W.svc;
 let k=0;if(x.verified)k+=8;if(x.flag){k-=14;warn.push(x.flag.replace(/^[^\w]+/,"").slice(0,110))}if(x.cautions.length)k-=Math.min(12,x.cautions.length*3);if(r.avoid){k-=40;warn.push("You marked this lender 'avoid'")}if(r.fav){k+=10;why.push("On your favorites list")}
 s+=k*W.risk;
 return {x,s:Math.round(s),why,warn,P}}
const lcFmt$=v=>v==null?"—":v>=1e6?`$${(v/1e6).toFixed(v%1e6?2:0)}M`:`$${Math.round(v/1e3)}K`;
const lcSt=x=>LC_ST.map(s=>{const v=x.states[s];return `<span class="sm" title="${s}: ${v||"unknown"}">${s}${v==="Yes"?"✓":v==="No"?"✗":"?"}</span>`}).join(" ");
const lcTagSel=(id,all)=>`<select id="${id}"><option value="">${all}</option>${LC_TYPES.map(t=>`<option value="${t.k}">${esc(t.n)}</option>`).join("")}</select>`;
const lcStSel=id=>`<select id="${id}"><option value="">Any state</option>${LC_ST.map(s=>`<option>${s}</option>`).join("")}</select>`;
const lcCard=(r,i)=>`<div class="card" style="margin:8px 0;border-left:4px solid ${i===0?"var(--ok,#2e7d32)":i<3?"var(--accent,#c9a227)":"var(--line)"}"><div class="row" style="flex-wrap:wrap"><b>${i+1}. ${esc(r.x.name)}</b><span class="tag">score ${r.s}</span>${r.x.lpc!=null?`<span class="tag ok">LPC ${r.x.lpc}%</span>`:r.x.bpcOnly?'<span class="tag warn">BPC only</span>':""}${r.x.verified?'<span class="tag ok">wholesale verified</span>':""}<span class="sp"></span>${lcSt(r.x)}<button class="btn ghost sm lc-pick" data-n="${r.x.n}">+ compare</button><a class="btn ghost sm" href="#lprofiles" data-lpn="${r.x.n}">Profile</a></div>
 <div class="grid g2" style="margin-top:4px"><ul class="sm" style="margin:0 0 0 18px">${r.why.map(w=>`<li>✓ ${esc(w)}</li>`).join("")}</ul><ul class="sm" style="margin:0 0 0 18px">${r.warn.map(w=>`<li style="color:var(--bad,#b3261e)">⚠ ${esc(w)}</li>`).join("")}</ul></div>
 ${r.x.ae?`<div class="sm mut" style="margin-top:4px">AE: ${esc(r.x.ae)}${r.x.email?` · <a href="mailto:${esc(r.x.email)}">${esc(r.x.email)}</a>`:""}${r.x.phone?` · ${esc(r.x.phone)}`:""}${r.x.lock?` · lock cutoff ${esc(r.x.lock.slice(0,50))}`:""}</div>`:""}</div>`;
/* ---- tab: recommend ---- */
const lcRecHtml=()=>`<div class="card"><h4 style="margin:0 0 6px">Describe the deal — get a ranked lender shortlist</h4><div class="row" style="flex-wrap:wrap;gap:6px">${lcTagSel("lc_t","Any loan type")}${lcStSel("lc_s")}<input id="lc_f" type="number" placeholder="FICO" style="max-width:80px"><input id="lc_l" type="number" placeholder="LTV %" style="max-width:80px"><input id="lc_a" type="number" placeholder="Loan $" style="max-width:120px"><input id="lc_d" type="number" placeholder="DTI %" style="max-width:80px"><select id="lc_p">${Object.entries(LC_PRI).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("")}</select><button class="btn sm" id="lc_go">Recommend</button></div><p class="sm mut" id="lc_why" style="margin:6px 0 0"></p></div><div id="lc_out"></div>`;
function lcRecMount(){const sv=store.get("lc_q",{});["t","s","f","l","a","d","p"].forEach(k=>{if(sv[k]!=null)$("#lc_"+k).value=sv[k]});
 const go=()=>{const q={type:$("#lc_t").value,state:$("#lc_s").value,fico:+$("#lc_f").value||0,ltv:+$("#lc_l").value||0,amt:+$("#lc_a").value||0,dti:+$("#lc_d").value||0,pri:$("#lc_p").value};store.set("lc_q",{t:q.type,s:q.state,f:$("#lc_f").value,l:$("#lc_l").value,a:$("#lc_a").value,d:$("#lc_d").value,p:q.pri});
  const t=LC_TYPES.find(y=>y.k===q.type);$("#lc_why").innerHTML=t?`<b>What matters when picking a ${esc(t.n)} lender:</b> ${esc(t.why)}`:"Pick a loan type for product-specific ranking.";
  const R=lcAll().map(x=>lcScore(x,q)).filter(Boolean).sort((a,b)=>b.s-a.s);
  $("#lc_out").innerHTML=R.length?`<p class="sm mut">${R.length} lenders can be considered · top ${Math.min(12,R.length)} shown · scores weigh guide fit, comp, your ratings, licensing and cautions (${esc((LC_PRI[q.pri]||LC_PRI.bal)[0])} weighting).</p>${R.slice(0,12).map(lcCard).join("")}<p class="sm mut">Ranking is a starting point from published data and PPFC company terms — confirm price, overlays and comp with the AE before you pick. Never steer a borrower to a lender for higher comp (LO Comp Rule, 12 CFR 1026.36(e)): present the best-fit options.</p>`:'<div class="card mut">No lender fits — loosen the filters, or the deal may need a different program.</div>';
  lcBindPick()};
 $("#lc_go").onclick=go;["lc_t","lc_s","lc_p"].forEach(i=>$("#"+i).onchange=go);go()}
/* ---- tab: comparison table ---- */
const LC_COLS=[["name","Lender"],["status","Status"],["lpc","LPC %"],["types","Loan types"],["maxLtv","Max LTV"],["minFico","Min FICO"],["maxLoan","Max loan"],["maxDti","Max DTI"],["states","CA IL NV FL AZ"],["sifter","Sifter"],["rating","Your rating"],["risk","Cautions"]];
const lcTableHtml=()=>`<div class="card"><div class="row" style="flex-wrap:wrap;gap:6px"><input id="lt_q" placeholder="Search lender, niche, program, AE…" style="max-width:240px">${lcTagSel("lt_t","Any loan type")}${lcStSel("lt_s")}<input id="lt_c" type="number" step="0.125" placeholder="Min LPC %" style="max-width:100px"><input id="lt_f" type="number" placeholder="FICO ≥ min" style="max-width:100px"><select id="lt_v"><option value="">All statuses</option><option value="ok">Wholesale verified</option><option value="ae">Has AE on file</option><option value="sifter">On LoanSifter</option><option value="fav">My favorites</option></select><label class="sm"><input type="checkbox" id="lt_x"> show exited</label><span class="sp"></span><button class="btn ghost sm" id="lt_csv">Export CSV</button></div></div><div class="card" style="overflow:auto;padding:6px"><table class="sm" id="lt_tbl"></table></div>`;
function lcTableMount(){let sort=store.get("lt_sort",["lpc",-1]);
 const rows=()=>{const q=$("#lt_q").value.trim().toLowerCase(),t=LC_TYPES.find(y=>y.k===$("#lt_t").value),s=$("#lt_s").value,c=+$("#lt_c").value||0,f=+$("#lt_f").value||0,v=$("#lt_v").value,ex=$("#lt_x").checked;
  return lcAll().filter(x=>(ex||!x.exited)&&(!t||lcHasType(x,t))&&(!s||x.states[s]!=="No")&&(!c||(x.lpc!=null&&x.lpc>=c))&&(!f||x.minFico==null||x.minFico<=f)&&(v!=="ok"||x.verified)&&(v!=="ae"||x.ae)&&(v!=="sifter"||x.sifter)&&(v!=="fav"||x.rate.fav)&&(!q||JSON.stringify([x.name,x.spec,x.tags,x.niches,x.programs.map(p=>p.p),x.ae,x.comp,x.note]).toLowerCase().includes(q)))};
 const val=(x,k)=>k==="types"?x.tags.length:k==="states"?LC_ST.filter(s=>x.states[s]==="Yes").length:k==="sifter"?+x.sifter:k==="rating"?((x.rate.speed||0)+(x.rate.svc||0)):k==="risk"?x.cautions.length+(x.flag?2:0):k==="lpc"?(x.lpc??(x.bpcOnly?0:-1)):x[k];
 const draw=()=>{const R=rows().sort((a,b)=>{const A=val(a,sort[0]),B=val(b,sort[0]);if(A==null&&B==null)return 0;if(A==null)return 1;if(B==null)return -1;return(typeof A==="string"?A.localeCompare(B):A-B)*sort[1]});
  $("#lt_tbl").innerHTML=`<thead><tr><th></th>${LC_COLS.map(([k,h])=>`<th data-k="${k}" style="cursor:pointer;white-space:nowrap">${h}${sort[0]===k?(sort[1]>0?" ▲":" ▼"):""}</th>`).join("")}</tr></thead><tbody>${R.map(x=>`<tr${x.exited?' style="opacity:.55"':""}><td><input type="checkbox" class="lt-pick" data-n="${x.n}" ${lcPicked().includes(x.n)?"checked":""}></td><td><a href="#lprofiles" data-lpn="${x.n}"><b>${esc(x.name)}</b></a>${x.flag?` <span title="${esc(x.flag)}">⚠</span>`:""}${x.rate.fav?" ★":""}</td><td><span class="tag ${x.exited?"bad":x.verified?"ok":"warn"}" style="font-size:10px">${esc(x.status.split("—")[0].trim().slice(0,22))}</span></td><td title="${esc(x.comp)}">${x.lpc!=null?x.lpc+"%":x.bpcOnly?"BPC only":x.comp?"see note":"—"}</td><td title="${esc(x.tags.join(", "))}">${x.tags.slice(0,6).map(t=>esc((LC_TYPES.find(y=>y.k===t)||{n:t}).n)).join(", ")}${x.tags.length>6?` +${x.tags.length-6}`:""}</td><td>${x.maxLtv!=null?x.maxLtv+"%":"—"}</td><td>${x.minFico??"—"}</td><td>${lcFmt$(x.maxLoan)}</td><td>${x.maxDti!=null?x.maxDti+"%":"—"}</td><td style="white-space:nowrap">${lcSt(x)}</td><td>${x.sifter?"Y":""}</td><td>${x.rate.speed||x.rate.svc?`⚡${x.rate.speed||"-"} ☺${x.rate.svc||"-"}`:""}</td><td>${x.cautions.length+(x.flag?1:0)||""}</td></tr>`).join("")}</tbody>`;
  $$("#lt_tbl th[data-k]").forEach(h=>h.onclick=()=>{sort=[h.dataset.k,sort[0]===h.dataset.k?-sort[1]:-1];store.set("lt_sort",sort);draw()});
  $$(".lt-pick").forEach(b=>b.onchange=()=>{lcPickSet(+b.dataset.n,b.checked)});
  $("#lt_csv").onclick=()=>{const head=["#","Lender","Status","Comp","LPC %","Loan types","Max LTV","Min FICO","Max loan","Max DTI",...LC_ST,"LoanSifter","Lock cutoff","AE","AE email","AE phone","Cautions"];const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
   const csv=[head.map(q).join(","),...R.map(x=>[x.n,x.name,x.status,x.comp,x.lpc,x.tags.join("; "),x.maxLtv,x.minFico,x.maxLoan,x.maxDti,...LC_ST.map(s=>x.states[s]||"?"),x.sifter?"Y":"",x.lock,x.ae,x.email,x.phone,[x.flag,...x.cautions].filter(Boolean).join(" | ")].map(q).join(","))].join("\n");saveFile("lender-comparison.csv",new TextEncoder().encode(csv))}};
 ["lt_q","lt_c","lt_f"].forEach(i=>$("#"+i).oninput=draw);["lt_t","lt_s","lt_v","lt_x"].forEach(i=>$("#"+i).onchange=draw);draw()}
/* ---- tab: best-for matrix ---- */
const lcMatrixHtml=()=>`<div class="card"><div class="row" style="flex-wrap:wrap;gap:6px"><b class="sm">Best lenders by loan type</b>${lcStSel("lm_s")}<select id="lm_p">${Object.entries(LC_PRI).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("")}</select><span class="sm mut">Top 3 per type with no borrower numbers entered — run the Recommend tab for a specific deal.</span></div></div><div id="lm_out"></div>`;
function lcMatrixMount(){const draw=()=>{const s=$("#lm_s").value,p=$("#lm_p").value,A=lcAll();
 $("#lm_out").innerHTML=`<div class="grid g2">${LC_TYPES.map(t=>{const R=A.map(x=>lcScore(x,{type:t.k,state:s,pri:p})).filter(Boolean).sort((a,b)=>b.s-a.s);return `<div class="card" style="margin:0"><div class="row"><b>${esc(t.n)}</b><span class="sp"></span><span class="sm mut">${R.length} lenders</span></div>${R.slice(0,3).map((r,i)=>`<div class="sm" style="margin:4px 0">${["🥇","🥈","🥉"][i]} <a href="#lprofiles" data-lpn="${r.x.n}"><b>${esc(r.x.name)}</b></a>${r.x.lpc!=null?` · LPC ${r.x.lpc}%`:r.x.bpcOnly?" · BPC only":""}${r.warn.length?` <span class="mut" title="${esc(r.warn.join(" · "))}">⚠${r.warn.length}</span>`:""}<div class="mut" style="margin-left:22px">${esc((r.why.find(w=>!/^LPC|^Licensed|rating|LoanSifter|favorites/.test(w))||r.why[0]||"").slice(0,110))}</div></div>`).join("")||'<div class="sm mut">No lender tagged — ask your AEs.</div>'}<details class="sm" style="margin-top:4px"><summary class="mut">What to compare</summary>${esc(t.why)}</details></div>`}).join("")}</div>`};
 $("#lm_s").onchange=draw;$("#lm_p").onchange=draw;draw()}
/* ---- tab: side-by-side ---- */
const lcPicked=()=>store.get("lc_pick",[]);
const lcPickSet=(n,on)=>{let a=lcPicked().filter(x=>x!==n);if(on)a=[...a,n].slice(-4);store.set("lc_pick",a);toast(on?`Added to compare (${a.length}/4)`:"Removed from compare")};
function lcBindPick(){$$(".lc-pick").forEach(b=>b.onclick=()=>lcPickSet(+b.dataset.n,true))}
const lcSideHtml=()=>`<div class="card"><div class="row" style="flex-wrap:wrap;gap:6px"><b class="sm">Side-by-side (up to 4)</b><select id="ls_add"><option value="">+ add lender…</option>${lcAll().filter(x=>!x.exited).sort((a,b)=>a.name.localeCompare(b.name)).map(x=>`<option value="${x.n}">${esc(x.name)}</option>`).join("")}</select><button class="btn ghost sm" id="ls_clr">Clear</button></div></div><div id="ls_out"></div>`;
function lcSideMount(){const draw=()=>{const A=lcAll(),L=lcPicked().map(n=>A.find(x=>x.n===n)).filter(Boolean);if(!L.length){$("#ls_out").innerHTML='<div class="card mut">Pick lenders here, or tick them in the Compare table / “+ compare” on a recommendation.</div>';return}
 const row=(h,f)=>`<tr><td class="mut" style="white-space:nowrap">${h}</td>${L.map(x=>`<td>${f(x)}</td>`).join("")}</tr>`;
 $("#ls_out").innerHTML=`<div class="card" style="overflow:auto"><table class="sm"><thead><tr><th></th>${L.map(x=>`<th>${esc(x.name)} <button class="btn ghost sm ls-x" data-n="${x.n}">✕</button></th>`).join("")}</tr></thead><tbody>
 ${row("Status",x=>esc(x.status))}${row("Comp",x=>esc(x.comp||"—"))}${row("States",lcSt)}${row("NMLS",x=>esc(x.nmls||"—"))}${row("Loan types",x=>esc(x.tags.map(t=>(LC_TYPES.find(y=>y.k===t)||{n:t}).n).join(", ")))}
 ${row("Max LTV / min FICO",x=>`${x.maxLtv!=null?x.maxLtv+"%":"—"} / ${x.minFico??"—"}`)}${row("Max loan / DTI",x=>`${lcFmt$(x.maxLoan)} / ${x.maxDti!=null?x.maxDti+"%":"—"}`)}
 ${row("Programs",x=>x.programs.map(p=>`<div style="margin:2px 0"><b>${esc(p.p)}</b> <span class="mut">LTV ${esc(String(p.ltv).slice(0,40))} · FICO ${esc(String(p.fico).slice(0,30))} · ${esc(String(p.loan).slice(0,40))}</span></div>`).join("")||'<span class="mut">ask AE</span>')}
 ${row("LoanSifter / lock",x=>`${x.sifter?"Y":"—"} · ${esc(x.lock.slice(0,60)||"—")}`)}${row("FHA / VA ID",x=>`${esc(x.fha||"—")} / ${esc(x.vaid||"—")}`)}${row("AE",x=>x.ae?`${esc(x.ae)}<br>${esc(x.email)}<br>${esc(x.phone)}`:"—")}
 ${row("Highlights",x=>x.highlights.slice(0,4).map(h=>`• ${esc(h)}`).join("<br>")||"—")}${row("Cautions",x=>[x.flag,...x.cautions].filter(Boolean).slice(0,4).map(h=>`⚠ ${esc(h)}`).join("<br>")||"—")}${row("Your notes",x=>esc(x.note)||"—")}</tbody></table></div>`;
 $$(".ls-x").forEach(b=>b.onclick=()=>{lcPickSet(+b.dataset.n,false);draw()})};
 $("#ls_add").onchange=e=>{if(e.target.value){lcPickSet(+e.target.value,true);e.target.value="";draw()}};$("#ls_clr").onclick=()=>{store.set("lc_pick",[]);draw()};draw()}
/* ---- tab: my ratings ---- */
const lcRateHtml=()=>`<div class="card"><h4 style="margin:0 0 4px">Your lender scorecard</h4><p class="sm mut" style="margin:0">Rate turn time and AE service from your own files (1–5), star favorites, mark lenders to avoid. Ratings feed the recommender. Saved in this browser.</p><input id="lr_q" placeholder="Filter…" style="max-width:220px;margin-top:6px"></div><div class="card" style="overflow:auto"><table class="sm" id="lr_tbl"></table></div>`;
function lcRateMount(){const draw=()=>{const q=$("#lr_q").value.toLowerCase(),R=lcRates();const sel=(n,k)=>`<select class="lr-s" data-n="${n}" data-k="${k}"><option value="">–</option>${[1,2,3,4,5].map(v=>`<option ${R[n]&&R[n][k]==v?"selected":""}>${v}</option>`).join("")}</select>`;
 $("#lr_tbl").innerHTML=`<thead><tr><th>Lender</th><th>Speed</th><th>Service</th><th>★ Fav</th><th>Avoid</th></tr></thead><tbody>${lcAll().filter(x=>!x.exited&&(!q||x.name.toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name)).map(x=>`<tr><td>${esc(x.name)}</td><td>${sel(x.n,"speed")}</td><td>${sel(x.n,"svc")}</td><td><input type="checkbox" class="lr-c" data-n="${x.n}" data-k="fav" ${R[x.n]&&R[x.n].fav?"checked":""}></td><td><input type="checkbox" class="lr-c" data-n="${x.n}" data-k="avoid" ${R[x.n]&&R[x.n].avoid?"checked":""}></td></tr>`).join("")}</tbody>`;
 const put=(n,k,v)=>{const R=lcRates();R[n]=R[n]||{};R[n][k]=v;store.set("lc_rate",R)};
 $$(".lr-s").forEach(s=>s.onchange=()=>put(s.dataset.n,s.dataset.k,+s.value||0));$$(".lr-c").forEach(c=>c.onchange=()=>put(c.dataset.n,c.dataset.k,c.checked))};
 $("#lr_q").oninput=draw;draw()}
const LC_TABS=omTabs("lc_tab","lc","rec",[["rec","Recommend for a deal",lcRecHtml,lcRecMount],["tbl","Compare all lenders",lcTableHtml,lcTableMount],["mx","Best lender by loan type",lcMatrixHtml,lcMatrixMount],["side","Side-by-side",lcSideHtml,lcSideMount],["rate","My ratings",lcRateHtml,lcRateMount]]);
PAGE.lcompare={html:()=>{if(typeof lpStubs==="function")lpStubs();const A=lcAll(),act=A.filter(x=>!x.exited);return `<div class="card" style="border-left:4px solid var(--accent,#c9a227)"><h3 style="margin:0">Lender Compare &amp; Recommend <span class="sub">${act.length} active lenders · ${act.filter(x=>x.lpc!=null).length} with LPC on file · ${act.filter(x=>x.verified).length} wholesale verified · ${LC_TYPES.length} loan types · ${A.reduce((a,x)=>a+x.programs.length,0)} programs</span></h3><p class="sm mut" style="margin:6px 0 0">Combines your lender directory, public program research and PPFC company terms (comp, LoanSifter, lock cutoff, AE). Recommendations are for picking which AEs to call first — always confirm price and overlays, and choose on borrower fit, not comp.</p></div><style>#lc_body .row>select,#lc_body .row>input:not([type=checkbox]){width:auto;flex:0 1 auto}#lc_body .row>input[id$=_q]{min-width:200px}</style>${LC_TABS.wrap()}`},
 mount(){if(typeof lpStubs==="function")lpStubs();LC_TABS.run()}};
document.addEventListener("click",e=>{const a=e.target.closest("[data-lpn]");if(a)store.set("lp_cur",+a.dataset.lpn)},true);
{const l=PAGES.find(p=>p[0]==="Loan Intelligence");if(l&&!l[1].some(x=>x[0]==="lcompare")){const i=l[1].findIndex(x=>x[0]==="lprofiles");l[1].splice(i<0?l[1].length:i+1,0,["lcompare","Lender Compare & Recommend"])}}
{const c0=coachCorpus;coachCorpus=function(){const out=c0();LC_TYPES.forEach(t=>{const R=lcAll().map(x=>lcScore(x,{type:t.k,pri:"bal"})).filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,5);out.push({src:`Best lender for ${t.n}`,t:`What to compare: ${t.why} Top matches: ${R.map(r=>`${r.x.name}${r.x.lpc!=null?` (LPC ${r.x.lpc}%)`:""}`).join(", ")||"none tagged"}.`})});return out}}
if(typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^Best lender for /,{hash:"lcompare"}]);
