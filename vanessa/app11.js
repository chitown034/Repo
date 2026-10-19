/* ===== Loan-type Q&A (FHA, conventional, USDA, jumbo, Non-QM, DSCR, FN/ITIN, reverse, HELOC, construction, manufactured, DPA, refinance, general, partners, FTHB)
   + program picker wizard + side-by-side comparison, wired into Programs & Rules and the Coach corpus ===== */
const LOAN_QA_PROGS=[...new Set(LOAN_QA.map(q=>q.prog))];
const LOAN_QA_TAB={html:()=>`<div class="card" id="lqa"><h3>Q&A by loan type <span class="sub">${LOAN_QA.length} questions across ${LOAN_QA_PROGS.length} loan types · VA has its own ${typeof VA_QA!=="undefined"?VA_QA.length:0}-question library in the VA section · verify dated figures</span></h3>
<div class="row">${sel("lq_p","Loan type",[["","All loan types"],...LOAN_QA_PROGS.map(p=>[p,`${p} (${LOAN_QA.filter(q=>q.prog===p).length})`])],store.get("lqp",""))}${sel("lq_c","Category",[["","All categories"]],"")}<input type="text" id="lq_q" placeholder="Search questions and answers…" style="max-width:300px"><span class="sp"></span><button class="btn ghost sm" id="lq_docx">⬇ Word</button><button class="btn ghost sm" id="lq_coach">Ask the Coach</button></div>
<div id="lq_cnt" class="mut sm" style="margin-top:6px"></div><div id="lq_list" style="margin-top:8px"></div></div>`,
 mount(){const cats=()=>{const p=$("#lq_p").value;const cs=[...new Set(LOAN_QA.filter(q=>!p||q.prog===p).map(q=>q.cat))];const cur=$("#lq_c").value;$("#lq_c").innerHTML=`<option value="">All categories</option>`+cs.map(c=>`<option ${c===cur?"selected":""}>${esc(c)}</option>`).join("")};
  const draw=()=>{const p=$("#lq_p").value,c=$("#lq_c").value,q=$("#lq_q").value.toLowerCase();store.set("lqp",p);const w=q.split(/\s+/).filter(Boolean);
   const rows=LOAN_QA.map((x,i)=>({x,i,s:w.length?w.filter(t=>(x.q+" "+x.a+" "+x.cat+" "+x.prog).toLowerCase().includes(t)).length:1})).filter(r=>r.s>0&&(!p||r.x.prog===p)&&(!c||r.x.cat===c)).sort((a,b)=>b.s-a.s||a.i-b.i);
   $("#lq_cnt").textContent=`${rows.length} of ${LOAN_QA.length}`;
   $("#lq_list").innerHTML=rows.slice(0,120).map(({x,i})=>`<details class="acc"><summary><b>${esc(x.q)}</b> <span class="tag">${esc(x.prog)}</span> <span class="tag">${esc(x.cat)}</span></summary><div class="sm" style="padding:6px 0 8px">${esc(x.a)}<div class="mut" style="margin-top:4px">Reference: ${esc(x.ref)}</div><button class="btn ghost sm" data-lqc="${i}" style="margin-top:4px">Copy</button> <button class="btn ghost sm" data-lqk="${i}">Ask the Coach</button></div></details>`).join("")+(rows.length>120?`<p class="mut sm">Showing 120 — refine your search.</p>`:"");
   $$("[data-lqc]").forEach(b=>b.onclick=()=>{const x=LOAN_QA[b.dataset.lqc];copy(`Q: ${x.q}\nA: ${x.a}\nRef: ${x.ref}`)});
   $$("[data-lqk]").forEach(b=>b.onclick=()=>{const x=LOAN_QA[b.dataset.lqk];store.set("coachHist",[...store.get("coachHist",[]),`${x.prog}: ${x.q} Go deeper than this summary: "${x.a.slice(0,160)}…"`]);location.hash="coach"})};
  $("#lq_p").onchange=()=>{cats();draw()};$("#lq_c").onchange=draw;$("#lq_q").oninput=draw;
  $("#lq_docx").onclick=()=>{const p=$("#lq_p").value;const set=LOAN_QA.filter(q=>!p||q.prog===p);saveFile(`${(p||"all-loan-types").toLowerCase().replace(/[^a-z0-9]+/g,"-")}-qa.docx`,docxBytes([{t:(p||"All loan types")+" — Q&A Library",h:1},...[...new Set(set.map(q=>q.prog))].flatMap(pr=>[{t:pr,h:2},...[...new Set(set.filter(q=>q.prog===pr).map(q=>q.cat))].flatMap(c=>[{t:c,b:1},...set.filter(q=>q.prog===pr&&q.cat===c).flatMap(q=>[{t:"Q: "+q.q,b:1},{t:q.a},{t:"Reference: "+q.ref}])])])]))};
  $("#lq_coach").onclick=()=>{const q=$("#lq_q").value.trim();if(q)store.set("coachHist",[...store.get("coachHist",[]),q]);location.hash="coach"};
  cats();draw()}};

/* ---- Program picker: answers → ranked programs with reasons ---- */
function pickPrograms(a){const out=[];const add=(id,score,why)=>{const p=PROGRAMS.find(x=>x.id===id);if(p)out.push({p,score,why})};
 const fico=+a.fico||0,down=+a.down||0,dti=+a.dti||0;const ami=a.ami==="le80",occ=a.occ,vet=a.vet==="y",units=+a.units||1,rural=a.rural==="y",doc=a.doc,amt=+a.amt||0;
 const hb=amt>LIMITS.baseline&&amt<=LIMITS.ceiling,jumbo=amt>LIMITS.ceiling;
 if(vet&&occ==="primary"&&doc==="full"){add("va",100-(fico<580?40:0),["$0 down, no MI, no DTI cap (residual income)",fico<620?"score below 620 needs a lender without overlays":"",jumbo?"VA jumbo: $0 down with full entitlement":"", "4% concessions can pay off debts"].filter(Boolean))}
 if(occ==="primary"&&doc==="full"&&!jumbo){
  if(rural&&!ami&&units===1)add("usda",88-(fico<640?20:0),["$0 down, 0.35% annual fee","household income must be ≤115% AMI","eligible rural address required"]);
  if(fico>=580||(fico>=500&&down>=10))add("fha",80-(fico>=700&&down>=5?20:0)-(units>2?5:0)+(dti>50?10:0),["3.5% down from 580","DTI to ~56.99% with AUS","MIP for life unless 10%+ down",units>1?"2–4 units allowed at 96.5%; self-sufficiency test on 3–4":""].filter(Boolean));
  if(fico>=620){const mi=down>=20?"no MI":"MI cancels at 78–80% LTV";if(ami)add("homeready",86,["3% down, reduced MI, LLPA waivers at ≤80% AMI","boarder/ADU income allowed",mi]);else add("conv",72+(fico>=700?12:0)+(down>=10?6:0)-(dti>50?30:0),["3–5% down",mi,dti>50?"DTI over 50% fails DU":"",fico<680&&down<10?"MI expensive under 680—compare FHA":""].filter(Boolean));
   if(!ami&&a.fthb==="y")add("homeone",70,["3% down FTHB, no income limit (Freddie)"]);
   if(hb)add("highbal",75,["above baseline limit—high-balance pricing","90% LTV max on 1-unit"]);}
  if(a.dpa==="y")add("dpa",68,["state/county DPA for down payment and costs","income/price limits; FTHB usually"]);
 }
 if(jumbo&&doc==="full"&&!vet)add("jumbo",78-(fico<700?30:0)-(down<10?20:0),["above county limit","typically 10–20% down, 700+ score, 6–12 months reserves"]);
 if(doc==="bank"||doc==="pl")add(doc==="bank"?"bank":"pl",80,["12–24 months statements or CPA P&L","2 years self-employed","10–20% down"]);
 if(doc==="assets")add("asset",76,["assets ÷ term = income","no employment needed"]);
 if(occ==="investment"){add("dscr",doc==="full"?70:92,["qualifies on rent ÷ PITIA","LLC vesting, no DTI","prepay penalty common"]);if(doc==="full"&&fico>=620)add("conv",78,["15–25% down investment","lower rate than DSCR; DTI applies","10-property cap"]);if(units>4)add("multifam",85,["5+ units is commercial/agency small balance"])}
 if(occ==="second"&&doc==="full"){add("conv",85,["10% down second home","no FHA/VA/USDA for second homes"]);if(jumbo)add("jumbo",75,["20–25% down second-home jumbo"])}
 if(a.itin==="y")out.length=0,add("itin",95,["no SSN—portfolio ITIN only","10–25% down, 2 years ITIN returns or statements"]);
 if(a.foreign==="y")out.length=0,add(occ==="investment"?"fndscr":"foreign",95,["passport/visa, 25–35% down from documented foreign funds","no U.S. credit required"]);
 if(a.age62==="y"&&occ==="primary")add(a.purchase==="y"?"hecmpurchase":"reverse",70,["62+: no monthly payment","counseling required"]);
 if(a.reno==="y"){add(vet?"vareno":"reno203k",74,["finance repairs in one loan"]);add("homestyle",70,["renovation up to 75% of as-completed value"])}
 if(a.credit_event==="y"&&(fico<620||a.seasoning==="lt2"))add("recentevent",65,["1 year after foreclosure/BK at reduced LTV","refinance to agency after seasoning"]);
 return out.sort((a,b)=>b.score-a.score).slice(0,6)}
const PROG_PICK_TAB={html:()=>`<div class="card" id="ppick"><h3>Program picker <span class="sub">answer 12 questions → ranked programs with reasons · then compare side by side · then Ask the Coach</span></h3>
<div class="grid g4">${numf("pp_fico","Middle credit score",680,1)}${numf("pp_down","Down payment %",5,0.5)}${numf("pp_dti","Back-end DTI %",45,1)}${numf("pp_amt","Loan amount",550000,1000)}
${sel("pp_occ","Occupancy",[["primary","Primary"],["second","Second home"],["investment","Investment"]],"primary")}${sel("pp_units","Units",[[1,"1"],[2,"2"],[3,"3"],[4,"4"],[5,"5+"]],1)}${sel("pp_doc","Income documentation",[["full","Full doc (W-2 / returns)"],["bank","Bank statements"],["pl","P&L / 1099 / WVOE"],["assets","Assets only"]],"full")}${sel("pp_vet","VA eligible?",[["n","No"],["y","Yes"]],"n")}
${sel("pp_ami","Household income vs AMI",[["gt80","Above 80% AMI"],["le80","≤80% AMI"]],"gt80")}${sel("pp_rural","USDA-eligible address?",[["n","No / unknown"],["y","Yes"]],"n")}${sel("pp_fthb","First-time buyer?",[["y","Yes"],["n","No"]],"y")}${sel("pp_dpa","Wants DPA?",[["n","No"],["y","Yes"]],"n")}
${sel("pp_itin","ITIN (no SSN)?",[["n","No"],["y","Yes"]],"n")}${sel("pp_foreign","Foreign national?",[["n","No"],["y","Yes"]],"n")}${sel("pp_age62","Borrower 62+ wanting no payment?",[["n","No"],["y","Yes"]],"n")}${sel("pp_reno","Renovation financing?",[["n","No"],["y","Yes"]],"n")}
${sel("pp_credit_event","Credit event < 4 yrs?",[["n","No"],["y","Yes"]],"n")}${sel("pp_seasoning","Seasoning since event",[["ge2","2+ years"],["lt2","Under 2 years"]],"ge2")}${sel("pp_purchase","Transaction",[["y","Purchase"],["n","Refinance"]],"y")}</div>
<div class="row" style="margin-top:8px"><button class="btn" id="pp_go">Rank programs</button><button class="btn ghost sm" id="pp_coach">Ask the Coach with these answers</button></div><div id="pp_out" style="margin-top:10px"></div></div>`,
 mount(){const read=()=>Object.fromEntries(["fico","down","dti","amt","occ","units","doc","vet","ami","rural","fthb","dpa","itin","foreign","age62","reno","credit_event","seasoning","purchase"].map(k=>[k,$("#pp_"+k).value]));
  const go=()=>{const a=read();store.set("ppick",a);const r=pickPrograms(a);$("#pp_out").innerHTML=r.length?`<div class="grid g2">${r.map((x,i)=>`<div class="card" style="margin:0"><b>#${i+1} ${esc(x.p.name)}</b> <span class="tag">${esc(x.p.cat)}</span> <span class="mut sm">fit ${Math.max(10,Math.min(100,Math.round(x.score)))}</span><ul class="sm" style="margin:4px 0 6px 18px">${x.why.map(w=>`<li>${esc(w)}</li>`).join("")}</ul><div class="sm mut">Min credit: ${esc(x.p.minFico)} · Down: ${esc(x.p.down)} · Seller: ${esc(x.p.seller)}</div><div class="row" style="margin-top:6px"><button class="btn ghost sm" data-ppg="${x.p.id}">Guidelines</button><button class="btn ghost sm" data-ppq="${x.p.id}">Q&A</button><button class="btn ghost sm" data-ppc="${x.p.id}">Add to compare</button></div></div>`).join("")}</div>`:`<p class="mut sm">No program fits those answers — Ask the Coach for a manual path.</p>`;
   const QMAP={va:"",fha:"FHA",conv:"Conventional",homeready:"Conventional",homeone:"Conventional",highbal:"Conventional",usda:"USDA",jumbo:"Jumbo",bank:"Non-QM",pl:"Non-QM",asset:"Non-QM",dscr:"DSCR",fndscr:"Foreign national",foreign:"Foreign national",itin:"ITIN",reverse:"Reverse",hecmpurchase:"Reverse",reno203k:"Renovation",homestyle:"Renovation",vareno:"Renovation",dpa:"DPA",recentevent:"Non-QM",multifam:"DSCR"};
   $$("[data-ppg]").forEach(b=>b.onclick=()=>{const gid=GUIDELINES.find(g=>g.id===b.dataset.ppg)?b.dataset.ppg:({homeready:"conv",homeone:"conv",highbal:"conv",bank:"nonqm",pl:"nonqm",asset:"nonqm",fndscr:"dscr"}[b.dataset.ppg]||"conv");store.set("gdp",gid);$("#gd_p").value=gid;$("#gd_p").dispatchEvent(new Event("change"));$("#guidecard").scrollIntoView({behavior:"smooth"})});
   $$("[data-ppq]").forEach(b=>b.onclick=()=>{const id=b.dataset.ppq;if(id==="va"){location.hash="va";return}store.set("lqp",QMAP[id]||"");$("#lq_p").value=QMAP[id]||"";$("#lq_p").dispatchEvent(new Event("change"));$("#lqa").scrollIntoView({behavior:"smooth"})});
   $$("[data-ppc]").forEach(b=>b.onclick=()=>{const cur=store.get("pcmp",[]);if(!cur.includes(b.dataset.ppc)&&cur.length<4)store.set("pcmp",[...cur,b.dataset.ppc]);PROG_CMP_TAB.draw();$("#pcmp").scrollIntoView({behavior:"smooth"});toast("Added to compare")})};
  const st=store.get("ppick");if(st)Object.entries(st).forEach(([k,v])=>{const e=$("#pp_"+k);if(e)e.value=v});
  $("#pp_go").onclick=go;$("#pp_coach").onclick=()=>{const a=read();store.set("coachHist",[...store.get("coachHist",[]),`Which loan program fits best and why? Score ${a.fico}, ${a.down}% down, DTI ${a.dti}%, loan ${money(+a.amt)}, ${a.occ}, ${a.units} unit(s), ${a.doc} documentation, VA eligible: ${a.vet}, AMI: ${a.ami}, USDA address: ${a.rural}, FTHB: ${a.fthb}, DPA: ${a.dpa}, ITIN: ${a.itin}, foreign national: ${a.foreign}, 62+: ${a.age62}, renovation: ${a.reno}, credit event: ${a.credit_event} (${a.seasoning}). Give the top 4 with reasons, costs and the fallback.`]);location.hash="coach"};
  if(st)go()}};

/* ---- Side-by-side comparison ---- */
const PROG_CMP_TAB={html:()=>`<div class="card" id="pcmp"><h3>Compare programs side by side <span class="sub">pick up to 4 · from the program table, the picker, or here</span></h3><div class="row">${sel("pc_add","Add program",[["",""],...PROGRAMS.map(p=>[p.id,p.name])],"")}<button class="btn ghost sm" id="pc_clear">Clear</button><span class="sp"></span><button class="btn ghost sm" id="pc_copy">Copy table</button><button class="btn ghost sm" id="pc_coach">Ask the Coach to pick</button></div><div id="pc_body" style="margin-top:8px;overflow:auto"></div></div>`,
 draw(){const ids=store.get("pcmp",[]),ps=ids.map(i=>PROGRAMS.find(p=>p.id===i)).filter(Boolean);if(!$("#pc_body"))return;if(!ps.length){$("#pc_body").innerHTML=`<p class="mut sm">Nothing selected yet.</p>`;return}
  const rows=[["Category","cat"],["Min credit","minFico"],["Down payment","down"],["DTI","dti"],["MI / fees","mi"],["Seller credits","seller"],["Best for","best"],["Fixed / ARM","fixedArm"]];
  $("#pc_body").innerHTML=`<table><thead><tr><th></th>${ps.map(p=>`<th>${esc(p.name)} <button class="btn ghost sm" data-pcx="${p.id}" title="remove">✕</button></th>`).join("")}</tr></thead><tbody>${rows.map(([l,k])=>`<tr><td><b>${l}</b></td>${ps.map(p=>`<td class="sm">${esc(p[k]||"—")}</td>`).join("")}</tr>`).join("")}<tr><td><b>Guideline sheet</b></td>${ps.map(p=>{const g=GUIDELINES.find(x=>x.id===p.id);return `<td class="sm">${g?esc(g.manual||g.name):"<span class='mut'>see nearest program</span>"}</td>`}).join("")}</tr></tbody></table>`;
  $$("[data-pcx]").forEach(b=>b.onclick=()=>{store.set("pcmp",store.get("pcmp",[]).filter(i=>i!==b.dataset.pcx));PROG_CMP_TAB.draw()})},
 mount(){$("#pc_add").onchange=()=>{const v=$("#pc_add").value;if(!v)return;const cur=store.get("pcmp",[]);if(!cur.includes(v)&&cur.length<4)store.set("pcmp",[...cur,v]);$("#pc_add").value="";PROG_CMP_TAB.draw()};
  $("#pc_clear").onclick=()=>{store.set("pcmp",[]);PROG_CMP_TAB.draw()};
  $("#pc_copy").onclick=()=>{const ps=store.get("pcmp",[]).map(i=>PROGRAMS.find(p=>p.id===i)).filter(Boolean);copy(ps.map(p=>`${p.name}\n  Min credit: ${p.minFico}\n  Down: ${p.down}\n  DTI: ${p.dti}\n  MI/fees: ${p.mi}\n  Seller: ${p.seller}\n  Best for: ${p.best}`).join("\n\n"))};
  $("#pc_coach").onclick=()=>{const ps=store.get("pcmp",[]).map(i=>PROGRAMS.find(p=>p.id===i)).filter(Boolean);store.set("coachHist",[...store.get("coachHist",[]),`Compare ${ps.map(p=>p.name).join(" vs ")} for a typical SoCal buyer: total cost over 5 and 10 years, qualifying differences, and when each wins.`]);location.hash="coach"};
  PROG_CMP_TAB.draw()}};

/* wire into Programs & Rules */
{const h0=PAGE.programs.html,m0=PAGE.programs.mount;
 PAGE.programs.html=()=>h0()+PROG_PICK_TAB.html()+PROG_CMP_TAB.html()+LOAN_QA_TAB.html();
 PAGE.programs.mount=function(v){m0?.call(this,v);PROG_PICK_TAB.mount();PROG_CMP_TAB.mount();LOAN_QA_TAB.mount();
  /* "compare" buttons in the program table */
  $$("#ptbl tr").forEach(tr=>{const td=tr.querySelector("td");if(!td||tr.querySelector("[data-pcadd]"))return;const name=td.textContent.trim();const p=PROGRAMS.find(x=>name.startsWith(x.name));if(!p)return;const b=document.createElement("button");b.className="btn ghost sm";b.dataset.pcadd=p.id;b.textContent="＋ compare";b.style.marginLeft="6px";b.onclick=()=>{const cur=store.get("pcmp",[]);if(!cur.includes(p.id)&&cur.length<4)store.set("pcmp",[...cur,p.id]);PROG_CMP_TAB.draw();toast("Added to compare")};td.appendChild(b)})}}

/* Coach corpus: all Q&A libraries become citable */
{const c0=coachCorpus;coachCorpus=function(){const out=c0();(typeof VA_QA!=="undefined"?VA_QA:[]).forEach(q=>out.push({src:`VA Q&A — ${q.cat}`,t:`Q: ${q.q} A: ${q.a} (${q.ref})`}));LOAN_QA.forEach(q=>out.push({src:`${q.prog} Q&A — ${q.cat}`,t:`Q: ${q.q} A: ${q.a} (${q.ref})`}));return out}}


