/* VANESSA 3.0 command dashboard — vanilla JS, no build step. Demo data is simulated until Supabase/n8n are connected (Settings). */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>(n<0?"−":"")+"$"+Math.abs(Math.round(n)).toLocaleString();
const money2=n=>(n<0?"−":"")+"$"+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=(n,d=2)=>(n*100).toFixed(d)+"%";
const store={get(k,d){try{const v=localStorage.getItem("vanessa."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("vanessa."+k,JSON.stringify(v))}catch(e){}}};
const settings=Object.assign({sbUrl:"",sbKey:"",n8n:"",refiRate:6.0,alertTicks:25,alertBp:7,partnerSla:7,brief:true},store.get("settings",{}));
let approvals=store.get("approvals",APPROVALS.map(a=>({...a,decision:null})));
let tasks=store.get("tasks",TASKS.map(t=>({...t,done:false})));
let pipeline=store.get("pipeline",PIPELINE);
let agents=(()=>{const st=store.get("agents",[]);return AGENTS.map(a=>{const x=st.find(y=>y.n===a.n);return {...a,on:x?x.on:a.on}})})();
let integ=store.get("integ",INTEGRATIONS.map(i=>({...i})));
let market=JSON.parse(JSON.stringify(MARKET)), report=JSON.parse(JSON.stringify(HOME_REPORT));

function toast(msg,ms=3200){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),ms)}
function animateNum(el,to,{fmt=n=>Math.round(n).toLocaleString(),ms=900}={}){if(matchMedia("(prefers-reduced-motion: reduce)").matches){el.textContent=fmt(to);return}const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(to*e);if(k<1)requestAnimationFrame(f)})(t0)}
function tween(from,to,ms,cb){const t0=performance.now();const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;(function f(t){const k=reduce?1:Math.min(1,(t-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cb(from.map((v,i)=>v+(to[i]-v)*e));if(k<1)requestAnimationFrame(f)})(t0)}
function copy(text){navigator.clipboard?.writeText(text).then(()=>toast("Copied to clipboard"),()=>toast("Copy blocked by browser — select and copy manually"))}
async function sb(path,opt={}){ // Supabase REST helper (only when configured)
  if(!settings.sbUrl||!settings.sbKey) throw new Error("Add your Supabase URL + anon key in Settings first.");
  const r=await fetch(settings.sbUrl.replace(/\/$/,"")+path,{...opt,headers:{apikey:settings.sbKey,Authorization:"Bearer "+settings.sbKey,"Content-Type":"application/json",...(opt.headers||{})}});
  if(!r.ok) throw new Error("Supabase "+r.status+": "+(await r.text()).slice(0,160)); return r.json();
}
async function runRpc(kind,inputs){ return sb("/rest/v1/rpc/run_calc",{method:"POST",body:JSON.stringify({kind,inputs})}); }

/* ---------- svg helpers ---------- */
const scale=(v,a,b,c,d)=>c+(v-a)*(d-c)/((b-a)||1);
function path(vals,w,h,{min=Math.min(...vals),max=Math.max(...vals),pl=34,pr=8,pt=10,pb=22}={}){return vals.map((v,i)=>(i?"L":"M")+(pl+scale(i,0,vals.length-1,0,w-pl-pr)).toFixed(1)+" "+(pt+scale(v,min,max,h-pt-pb,0)).toFixed(1)).join(" ")}
function drawIn(svg){$$("path.draw",svg).forEach(p=>{const L=p.getTotalLength();p.style.transition="none";p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition="stroke-dashoffset 1.6s ease";p.style.strokeDashoffset=0})}

/* ---------- navigation ---------- */
const PAGES=[
 ["Operate",[["today","Today"],["vanessa","Vanessa — Chief of Staff"],["market","Market Intel"],["report","Home Report"],["pipeline","Pipeline"],["refi","Refi Hunter"],["ops","Seminars · Referrals · Compliance"]]],
 ["Loan Intelligence",[["scenario","Scenario Builder"],["va","VA Toolkit"],["strategies","Qualifying Strategies"],["credit","Credit Simulator"],["letters","Letter Desk"],["programs","Programs & Rules"],["coach","AI Loan Coach"],["lenders","Lender Directory"],["calc","Calculators"],["scenarios","Scenario Library"],["scripts","Script Library"],["docproc","Document Processor"]]],
 ["Growth & Ops",[["bizdev","Partner Targets"],["automation","Automation Center"],["process","Loan Process Map"],["toolkit","LO Toolkit & Improvement"],["delegation","Delegation Map (MLO-minimal)"],["opscmd","Ops Command"],["wealth","Wealth & Debt"],["scale","Scale Engine (1,000 loans)"],["marketing","Marketing Plan"],["mkttools","Marketing Toolkit"],["isa","EA / ISA Ops"],["isaportal","ISA Portal"],["zoho","Zoho CRM"]]],
 ["System",[["agents","AI Agents"],["workflows","Workflows"],["integrations","Integrations"],["prompts","Claude Build Prompts"],["settings","Settings"]]]];
const TITLES=Object.fromEntries(PAGES.flatMap(s=>s[1]));
function buildNav(){ $("#nav").innerHTML=PAGES.map(([sec,items])=>`<div class="sec">${sec}</div>`+items.map(([id,t])=>`<button data-p="${id}">${esc(t)}${id==="today"?`<span class="badge" id="apbadge"></span>`:""}</button>`).join("")).join("");
  $$("#nav button").forEach(b=>b.onclick=()=>{location.hash=b.dataset.p}); }
let cleanups=[];
function route(){ cleanups.forEach(f=>f());cleanups=[]; const id=(location.hash||"#today").slice(1); const pg=PAGE[id]?id:"today";
  $$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.p===pg)); $("#title").textContent=TITLES[pg];
  const v=$("#view"); v.innerHTML=PAGE[pg].html(); PAGE[pg].mount?.(v); updateBadge(); window.scrollTo(0,0); }
function updateBadge(){const n=approvals.filter(a=>!a.decision).length;const b=$("#apbadge");if(b){b.textContent=n;b.classList.toggle("hide",!n)}}
const persist=()=>{store.set("approvals",approvals);store.set("tasks",tasks);store.set("pipeline",pipeline);store.set("agents",agents);store.set("integ",integ)};

/* ---------- ticker + clock ---------- */
function paintTicker(){const m=market, c=v=>v>=0?"up":"dn", s=v=>(v>=0?"+":"")+v;
  $("#ticker").innerHTML=`<span>UMBS 5.5 <b>${m.umbs.price.toFixed(2)}</b> <span class="${c(m.umbs.ticks)}">${s(m.umbs.ticks)}t</span></span><span>10y <b>${m.y10.toFixed(2)}%</b> <span class="${c(-m.y10chg)}">${s(m.y10chg)}bp</span></span><span>PMMS30 <b>${m.pmms30.toFixed(2)}%</b></span><span>VA par <b>${m.vapar30.toFixed(3)}%</b></span>`}
function tickMarket(){ const d=(Math.random()-.5)*.06; market.umbs.price=+(market.umbs.price+d).toFixed(2); market.umbs.ticks=Math.round((market.umbs.price-101.16)*100); market.y10=+(market.y10-d*.12).toFixed(3); market.y10chg=Math.round((market.y10-4.10)*100); paintTicker(); document.dispatchEvent(new Event("market:tick")); }
function clock(){const d=new Date();$("#clock").textContent=d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})+" · simulated feed"}

/* ---------- brief generator ---------- */
function brief(edition){
  const m=market,r=report,rt=MARKET.umbs.ticks,ry=MARKET.y10,rb=MARKET.y10chg,pend=approvals.filter(a=>!a.decision).length;
  const lockSig=r.signals.filter(s=>s.locks).sort((a,b)=>b.str-a.str).slice(0,3);
  const nxt=m.calendar.filter(e=>e.imp>=4)[0]||m.calendar[0];
  const head={am:"GOOD MORNING STEVEN",mid:"MIDDAY PULSE",eod:"EOD WRAP"}[edition];
  const when={am:"6:30am PT",mid:"12:00pm PT",eod:"5:30pm PT"}[edition];
  const lock=m.pipelineLocks??2;
  return `${head} — ${when}
MARKET (MBS Highway Home Report · ${r.edition} edition): UMBS 5.5 ${rt>=0?"+":""}${rt} ticks · 10y ${ry.toFixed(2)}% (${rb>=0?"+":""}${rb}bp) · Lean: ${r.lean} (${Math.round(r.conf*100)}%)
 Why: ${r.headline}
 Lock-relevant signals:
${lockSig.map(s=>`  • ${s.label}: ${s.value} [${s.dir}, ${s.str}/5]`).join("\n")}
 Next event: ${nxt.t} — ${nxt.e}
${edition==="mid"?"DELTA since AM: UMBS "+(rt>=0?"+":"")+rt+" ticks; no new lock-relevant signals.\n":""}${edition==="eod"?"TOMORROW: "+m.calendar.slice(0,2).map(e=>e.t+" "+e.e).join("; ")+"\n":""}TODAY: 10am Las Vegas VA class (42 registered, 3 partners confirmed).
APPROVALS (${pend}): ${approvals.filter(a=>!a.decision).slice(0,3).map(a=>a.type).join(", ")||"none"}.
HOT LEADS (≥70): ${Object.values(pipeline).flat().filter(l=>l.s>=70).length} — call by 12:30.
REFERRALS: 1 SLA breach (AZ partner, 8 days no update).
LOCKS: ${lock} expiring <72h.
TALKING POINT FOR AGENTS: "Rates eased slightly this week; Friday's PCE print is the next big catalyst."
— Internal lean only. Consumer-facing versions go through Compliance (HR4) first.`;
}

/* =================== PAGES =================== */
const PAGE={};

PAGE.today={ html:()=>`
<div class="grid g6" id="kpis">${KPIS.map((k,i)=>`<div class="card kpi" style="animation-delay:${i*60}ms"><div class="k">${k.k}</div><div class="v" data-v="${k.v}" data-f="${k.fmt}">0</div><div class="d">${k.d}</div></div>`).join("")}</div>
<div class="card" style="margin-top:14px"><div class="row sm"><b>Quick tools:</b><a href="#va">VA funding fee</a><a href="#va" onclick="store.set('vtab','res')">Residual income</a><a href="#va" onclick="store.set('vtab','irrrl')">IRRRL tester</a><a href="#credit">Credit simulator</a><a href="#letters">Letter Desk</a><a href="#strategies">Strategies</a><a href="#calc">Calculators</a><a href="#zoho">Zoho sync</a></div></div>
<div class="grid g3"><div class="card"><h3>Pipeline by stage <span class="sub">count</span></h3><svg id="tpipe" width="100%"></svg></div><div class="card"><h3>Leads — last 30 days <span class="sub">sample</span></h3><svg id="tlead" width="100%" style="height:70px"></svg><div class="row sm"><span class="sp mut">daily new leads</span><b id="tleadsum"></b></div></div><div class="card"><h3>Volume by program <span class="sub">active files</span></h3><div class="row"><svg id="tprog" style="width:120px;height:120px"></svg><div id="tproglegend" class="sm"></div></div></div></div>
<div class="grid g21">
  <div class="card"><h3>Daily brief <span class="sub">includes MBS Highway Home Report signals</span></h3>
    <div class="row"><select id="bed"><option value="am">Morning 6:30am</option><option value="mid">Midday 12:00</option><option value="eod">EOD 5:30pm</option></select><span class="sp"></span><button class="btn ghost sm" id="bcopy">Copy</button><button class="btn sm" id="bsend">Send via n8n (W22)</button></div>
    <pre class="code" id="btxt"></pre></div>
  <div class="card"><h3>Home Report — lock-relevant <span class="sub" id="hrAsOf"></span></h3><div id="hrMini"></div><a href="#report">Open full Home Report →</a></div>
</div>
<div class="grid g2">
  <div class="card"><h3>Approvals queue <span class="sub">human-in-the-loop · Compliance gate W24</span></h3><div id="aps"></div></div>
  <div class="card"><h3>Top tasks</h3><div id="tks"></div></div>
</div>
<div class="grid g2">
  <div class="card"><h3>Rate pulse</h3><div id="pulse"></div></div>
  <div class="card"><h3>Agent activity <span class="sub">live feed</span></h3><div id="feed" style="max-height:230px;overflow:auto"></div></div>
</div>`,
 mount(v){
  $$("#kpis .v").forEach(el=>{const f=el.dataset.f,t=+el.dataset.v;animateNum(el,t,{fmt:f==="pct"?n=>Math.round(n)+"%":f==="$m"?n=>"$"+n.toFixed(1)+"M":undefined})});
  const paintBrief=()=>$("#btxt").textContent=brief($("#bed").value); $("#bed").onchange=paintBrief; paintBrief();
  $("#bcopy").onclick=()=>copy($("#btxt").textContent);
  $("#bsend").onclick=()=>fireWorkflow("W22",{edition:$("#bed").value,text:$("#btxt").textContent});
  const mini=()=>{$("#hrAsOf").textContent=market.asOf;$("#hrMini").innerHTML=report.signals.filter(s=>s.locks).sort((a,b)=>b.str-a.str).slice(0,4).map(s=>sigRow(s)).join("")+`<div class="row" style="margin-top:8px"><span class="tag ${report.lean==="lock"?"warn":"good"}">Lean: ${report.lean}</span><span class="mut sm">${Math.round(report.conf*100)}% confidence</span></div>`}; mini();
  const aps=()=>{ $("#aps").innerHTML=approvals.map(a=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><div class="sp"><b>${esc(a.type)}</b> — ${esc(a.who)}<div class="mut sm">${esc(a.agent)} · ${esc(a.note)}</div></div>
     <span class="tag ${a.status==="PASS"?"good":a.status==="FIX"?"warn":"bad"}">${a.status}</span>
     ${a.decision?`<span class="tag ${a.decision==="approved"?"good":"bad"}">${a.decision}</span>`:`<button class="btn good sm" data-a="${a.id}" data-d="approved">Approve</button><button class="btn ghost sm" data-a="${a.id}" data-d="rejected">Reject</button>`}</div>`).join("");
     $$("#aps button").forEach(b=>b.onclick=()=>{const a=approvals.find(x=>x.id==b.dataset.a); if(a.status==="BLOCK"&&b.dataset.d==="approved")return toast("Compliance BLOCK — cannot approve"); a.decision=b.dataset.d;persist();aps();updateBadge();toast(`${a.type}: ${a.decision} (logged to audit_log)`)}) }; aps();
  const tks=()=>{$("#tks").innerHTML=tasks.map((t,i)=>`<label class="chk" style="padding:6px 0;border-bottom:1px solid var(--line)"><input type="checkbox" data-i="${i}" ${t.done?"checked":""}><span class="sp" style="${t.done?"text-decoration:line-through;opacity:.5":""}">${esc(t.t)}</span><span class="tag ${t.p==="high"?"bad":t.p==="med"?"warn":""}">${t.p}</span></label>`).join(""); $$("#tks input").forEach(c=>c.onchange=()=>{tasks[c.dataset.i].done=c.checked;persist();tks()})}; tks();
  const pulse=()=>{const m=market;$("#pulse").innerHTML=[["UMBS 5.5",m.umbs.price.toFixed(2),m.umbs.ticks],["10-yr",m.y10.toFixed(2)+"%",m.y10chg],["2-yr",m.y2.toFixed(2)+"%",-2],["30-yr",m.y30.toFixed(2)+"%",-3],["Mortgage spread",(m.pmms30-m.y10).toFixed(2),0]].map(([k,v,d])=>`<div class="row" style="padding:5px 0"><span class="sp">${k}</span><b class="mono">${v}</b><span class="${d>=0?"up":"dn"} mono" style="width:56px;text-align:right">${d>0?"+":""}${d}${k==="UMBS 5.5"?"t":k==="Mortgage spread"?"":"bp"}</span></div>`).join("")}; pulse();
  const tick=()=>{pulse();paintBrief()}; document.addEventListener("market:tick",tick); cleanups.push(()=>document.removeEventListener("market:tick",tick));
  barChart($("#tpipe"),Object.entries(pipeline).map(([k,v])=>({l:k,v:v.length})),{h:160,fmt:v=>v});
  const leadsSeries=[4,6,5,8,7,9,6,10,8,11,9,12,10,9,13,11,14,12,10,15,13,12,16,14,13,17,15,14,18,16]; sparkline($("#tlead"),leadsSeries,{w:300,h:60}); $("#tleadsum").textContent=leadsSeries.reduce((a,b)=>a+b,0)+" leads";
  const progCounts={}; Object.values(pipeline).flat().forEach(l=>{const k=/VA/.test(l.p)?"VA":/FHA/.test(l.p)?"FHA":/DSCR/.test(l.p)?"DSCR":/Jumbo/.test(l.p)?"Jumbo":"Conv";progCounts[k]=(progCounts[k]||0)+1}); const pitems=Object.entries(progCounts).map(([l,v],i)=>({l,v,c:PAL[i]})); donut($("#tprog"),pitems); $("#tproglegend").innerHTML=pitems.map(p=>`<div><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p.c};margin-right:6px"></span>${p.l} <b>${p.v}</b></div>`).join("");
  const feed=$("#feed"); const lines=agents.filter(a=>a.on).map(a=>`${a.name}: ${a.last}`); let n=0;
  const add=()=>{const d=document.createElement("div");d.className="sig";d.style.gridTemplateColumns="60px 1fr";d.innerHTML=`<span class="mut mono sm">${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span><span>${esc(lines[n++%lines.length])}</span>`;feed.prepend(d);while(feed.children.length>12)feed.lastChild.remove()};
  for(let i=0;i<5;i++)add(); const iv=setInterval(add,4500); cleanups.push(()=>clearInterval(iv));
 }};

function sigRow(s,i=0){const col=s.dir==="bullish"?"up":s.dir==="bearish"?"dn":"mut",arrow=s.dir==="bullish"?"▲":s.dir==="bearish"?"▼":"●";
  return `<div class="sig" style="animation-delay:${i*70}ms"><span class="${col}" title="${s.dir}: bullish = rates down">${arrow}</span><div><b>${esc(s.label)}</b>${s.locks?` <span class="tag warn">lock-relevant</span>`:""}<div class="mut sm">${esc(s.value)} · ${esc(s.kind)}</div></div><div style="width:70px"><div class="bar"><i style="width:${s.str*20}%"></i></div></div></div>`}

PAGE.market={ html:()=>`
<div class="card"><h3>Today's story <span class="sub">${esc(market.asOf)}</span></h3>
  <p style="font-size:16px;margin:0 0 6px"><b>${esc(report.headline)}</b></p><div class="row"><span class="tag">UMBS 5.5 ${market.umbs.ticks>=0?"+":""}${market.umbs.ticks} ticks</span><span class="tag">10y ${market.y10.toFixed(2)}% (${market.y10chg}bp)</span><span class="tag ${report.lean==="lock"?"warn":"good"}">Lean: ${report.lean} · ${Math.round(report.conf*100)}%</span><span class="tag">Internal only — consumer text needs Compliance PASS</span></div></div>
<div class="grid g3">
  <div class="card"><h3>Bond price ↔ yield seesaw</h3><svg viewBox="0 0 300 170" id="saw" width="100%"><g id="beam" style="transform-origin:150px 120px;transition:transform 1.2s cubic-bezier(.3,1.6,.5,1)"><rect x="30" y="112" width="240" height="8" rx="4" fill="var(--acc)"/><rect x="40" y="62" width="70" height="46" rx="8" fill="var(--chip)" stroke="var(--acc)"/><text x="75" y="82" text-anchor="middle">Bond price</text><text x="75" y="98" text-anchor="middle" id="sawP" style="fill:var(--ink);font-weight:700;font-size:13px"></text><rect x="190" y="62" width="70" height="46" rx="8" fill="var(--panel2)" stroke="var(--acc2)"/><text x="225" y="82" text-anchor="middle">10y yield</text><text x="225" y="98" text-anchor="middle" id="sawY" style="fill:var(--ink);font-weight:700;font-size:13px"></text></g><path d="M150 120 L125 160 L175 160 Z" fill="var(--line)"/></svg><div class="mut sm">When yields fall, bond prices rise — mortgage rates follow with a lag.</div></div>
  <div class="card"><h3>Mortgage spread gauge</h3><svg viewBox="0 0 300 170" id="gauge" width="100%"><path d="M30 140 A120 120 0 0 1 270 140" fill="none" stroke="var(--line)" stroke-width="16" stroke-linecap="round"/><path id="garc" d="M30 140 A120 120 0 0 1 270 140" fill="none" stroke="var(--acc2)" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/><g id="needle" style="transform-origin:150px 140px;transition:transform 1.3s cubic-bezier(.3,1.4,.5,1);transform:rotate(-90deg)"><line x1="150" y1="140" x2="150" y2="48" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></g><circle cx="150" cy="140" r="7" fill="var(--ink)"/><text x="30" y="160">1.5</text><text x="150" y="30" text-anchor="middle">~1.7 long-run avg</text><text x="262" y="160">3.0</text></svg><div class="row"><b id="sprd" style="font-size:22px"></b><span class="mut sm">30-yr PMMS − 10-yr Treasury (pts). Widened to ~2.5–3 in 2023.</span></div></div>
  <div class="card"><h3>Payment-impact slider</h3><div class="mut sm">Rate change on a $400k 30-yr loan</div><input type="range" id="pay" min="-100" max="100" value="-12" step="1"><div class="row"><b id="payR" style="font-size:22px"></b><span class="sp"></span><b id="payP" style="font-size:22px"></b></div><div class="mut sm" id="payD"></div><div class="mut sm" style="margin-top:8px">Baseline: today's VA par ${market.vapar30.toFixed(3)}%. Illustrative P&amp;I only (no escrow/fees); not a rate quote.</div></div>
</div>
<div class="grid g21">
  <div class="card"><h3>UMBS 5.5 intraday <span class="sub">support/resistance bands</span><button class="btn ghost sm" id="replay" style="margin-left:8px">Replay</button></h3><svg viewBox="0 0 640 220" id="umbs" width="100%"></svg></div>
  <div class="card"><h3>Why rates moved</h3><div id="story"></div><div class="row" style="margin-top:8px"><button class="btn ghost sm" id="sprev">◀</button><button class="btn sm" id="snext">Next ▶</button><button class="btn ghost sm" id="sauto">Auto-play</button><span class="mut sm" id="sct"></span></div></div>
</div>
<div class="grid g21">
  <div class="card"><h3>Yield-curve morph <span class="sub"><select id="cmp" style="width:auto;display:inline-block"><option value="week">vs 1 week ago</option><option value="month">vs 1 month ago</option><option value="year">vs 1 year ago</option></select></span></h3><svg viewBox="0 0 640 230" id="curve" width="100%"></svg><div class="row sm"><span class="tag">Today</span><span class="tag warn">Comparison</span><span class="mut">2s10s: <b id="c2s10"></b></span></div></div>
  <div class="card"><h3>Economic calendar ticker</h3>${market.calendar.map(e=>`<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="mono sm" style="width:92px">${e.t}</span><span class="sp">${e.e}</span><span>${"●".repeat(e.imp)}<span class="mut">${"●".repeat(5-e.imp)}</span></span></div>`).join("")}</div>
</div>
<div class="card"><h3>10-yr vs 30-yr mortgage spread history <span class="sub">sample</span></h3><svg viewBox="0 0 900 140" id="sprhist" width="100%"></svg></div>`,
 mount(){
  const saw=()=>{const tilt=Math.max(-18,Math.min(18,market.y10chg*-3.5)); $("#beam").style.transform=`rotate(${tilt}deg)`; $("#sawP").textContent=market.umbs.price.toFixed(2); $("#sawY").textContent=market.y10.toFixed(2)+"%"};
  const gauge=()=>{const sp=market.pmms30-market.y10, k=Math.max(0,Math.min(1,(sp-1.5)/1.5)); $("#needle").style.transform=`rotate(${-90+k*180}deg)`; $("#garc").style.transition="stroke-dasharray 1.3s ease";$("#garc").setAttribute("stroke-dasharray",`${k*100} 100`); $("#sprd").textContent=sp.toFixed(2)+" pts"};
  setTimeout(()=>{saw();gauge()},80); const tk=()=>{saw();gauge()}; document.addEventListener("market:tick",tk); cleanups.push(()=>document.removeEventListener("market:tick",tk));
  const pay=()=>{const d=+$("#pay").value/100*1, r=market.vapar30+d, b=pmt(400000,market.vapar30/100,360), p=pmt(400000,r/100,360);$("#payR").textContent=r.toFixed(3)+"%";$("#payP").textContent=money2(p);$("#payD").textContent=`${p-b>=0?"+":""}${money2(p-b)}/mo vs today (${d>=0?"+":""}${(d).toFixed(2)} pts)`}; $("#pay").oninput=pay; pay();
  const draw=()=>{const w=640,h=220,v=market.intraday,min=100.85,max=101.42,svg=$("#umbs");
    const y=x=>10+scale(x,min,max,h-32,0);
    svg.innerHTML=`<rect x="34" y="${y(market.resistance)}" width="598" height="${y(market.resistance+.0)-y(market.resistance)+10}" fill="var(--bad)" opacity=".12" style="animation:rise .8s .5s both"/><line x1="34" x2="632" y1="${y(market.resistance)}" y2="${y(market.resistance)}" stroke="var(--bad)" stroke-dasharray="4 4"/><text x="38" y="${y(market.resistance)-4}">Resistance ${market.resistance}</text>
    <rect x="34" y="${y(market.support)-10}" width="598" height="10" fill="var(--good)" opacity=".15" style="animation:rise .8s .7s both"/><line x1="34" x2="632" y1="${y(market.support)}" y2="${y(market.support)}" stroke="var(--good)" stroke-dasharray="4 4"/><text x="38" y="${y(market.support)+12}">Support ${market.support}</text>
    ${[101.0,101.2,101.4].map(g=>`<line class="axis" x1="34" x2="632" y1="${y(g)}" y2="${y(g)}" opacity=".5"/><text x="2" y="${y(g)+4}">${g.toFixed(1)}</text>`).join("")}
    <path class="draw" d="${path(v,w,h,{min,max,pb:22})}" fill="none" stroke="var(--acc)" stroke-width="2.6" stroke-linejoin="round"/>
    ${["6:30","8:30","10:30","12:30","2:00"].map((t,i)=>`<text x="${40+i*140}" y="212">${t} PT</text>`).join("")}`; drawIn(svg)}; draw(); $("#replay").onclick=draw;
  let si=0,timer=null; const story=()=>{const s=market.stories[si];$("#story").innerHTML=`<div class="tag">Step ${si+1}: ${esc(s.step)}</div><h4 style="margin:8px 0 4px">${esc(s.title)}</h4><p class="mut" style="margin:0;animation:rise .4s both">${esc(s.body)}</p>`;$("#sct").textContent=`${si+1}/${market.stories.length}`};
  story(); $("#snext").onclick=()=>{si=(si+1)%market.stories.length;story()}; $("#sprev").onclick=()=>{si=(si+market.stories.length-1)%market.stories.length;story()};
  $("#sauto").onclick=()=>{if(timer){clearInterval(timer);timer=null;$("#sauto").textContent="Auto-play"}else{timer=setInterval(()=>{si=(si+1)%market.stories.length;story()},2600);$("#sauto").textContent="Pause"}}; cleanups.push(()=>clearInterval(timer));
  let curCmp=market.curve.today.slice(),curTo=market.curve.week; const cv=$("#curve");
  const drawCurve=(cmp)=>{if(!cv.isConnected)return;const w=640,h=230,all=[...market.curve.today,...cmp],min=Math.min(...all)-.1,max=Math.max(...all)+.1,o={min,max,pb:26};
    cv.innerHTML=`${[3.6,4.0,4.4,4.8].map(g=>`<line class="axis" x1="34" x2="632" y1="${10+scale(g,min,max,h-36,0)}" y2="${10+scale(g,min,max,h-36,0)}" opacity=".5"/><text x="2" y="${14+scale(g,min,max,h-36,0)}">${g.toFixed(1)}%</text>`).join("")}${market.curve.labels.map((l,i)=>`<text x="${34+scale(i,0,10,0,598)-8}" y="224">${l}</text>`).join("")}<path d="${path(cmp,w,h,o)}" fill="none" stroke="var(--warn)" stroke-width="2.4" stroke-dasharray="6 4"/><path d="${path(market.curve.today,w,h,o)}" fill="none" stroke="var(--acc)" stroke-width="2.8"/>`;
    $("#c2s10").textContent=((market.curve.today[8]-market.curve.today[4])*100).toFixed(0)+" bp"};
  drawCurve(curCmp); $("#cmp").onchange=e=>{const to=market.curve[e.target.value];tween(curCmp,to,900,v=>{curCmp=v;drawCurve(v)})}; tween(curCmp,market.curve.week,900,v=>{curCmp=v;drawCurve(v)});
  const sh=market.spreadHist,sv=$("#sprhist"),min=1.4,max=3.1; sv.innerHTML=`<line class="axis" x1="34" x2="890" y1="${10+scale(1.7,min,max,100,0)}" y2="${10+scale(1.7,min,max,100,0)}" stroke-dasharray="4 4"/><text x="2" y="${14+scale(1.7,min,max,100,0)}">1.7</text><path class="draw" d="${path(sh,900,140,{min,max,pb:26})}" fill="none" stroke="var(--acc2)" stroke-width="2.6"/>`; drawIn(sv);
 }};

PAGE.report={ html:()=>`
<div class="card"><h3>MBS Highway Home Report — ${esc(report.edition)} edition <span class="sub">${esc(market.asOf)}</span></h3>
  <p style="font-size:16px;margin:0 0 8px"><b>${esc(report.headline)}</b></p>
  <div class="row"><span class="tag ${report.lean==="lock"?"warn":"good"}">Lean: ${report.lean}</span><span class="tag">${Math.round(report.conf*100)}% confidence</span><span class="tag" id="alertLvl"></span><span class="sp"></span>
  <button class="btn ghost sm" id="sync">Sync from Supabase</button><button class="btn sm" id="hrrun">Run HR1→HR7 now</button></div>
  <div class="steps" id="hrsteps">${WORKFLOWS.filter(w=>w.cat==="Home Report").map(w=>`<span class="step" data-id="${w.id}">${w.id} ${esc(w.name)}</span>`).join("")}</div></div>
<div class="grid g21">
  <div class="card"><h3>Signals <span class="sub"><select id="fk" style="width:auto;display:inline-block"><option value="">All kinds</option>${["trend","support","resistance","momentum","bollinger","stochastic","calendar","auction","fed","alert","commentary"].map(k=>`<option>${k}</option>`).join("")}</select> <select id="fd" style="width:auto;display:inline-block"><option value="">Any direction</option><option value="bullish">Bullish (rates ↓)</option><option value="bearish">Bearish (rates ↑)</option><option value="neutral">Neutral</option></select> <label class="chk" style="display:inline-flex"><input type="checkbox" id="fl"> lock-relevant</label></span></h3><div id="sigs"></div></div>
  <div class="card"><h3>Signal balance</h3><svg viewBox="0 0 300 160" id="bal" width="100%"></svg><div class="mut sm" id="balT"></div><hr style="border:0;border-top:1px solid var(--line);margin:12px 0"><h3>Compliance &amp; use</h3><p class="mut sm" style="margin:0">Signals are <b>internal</b> decision support. Consumer-facing content is generated as <code>consumer_safe_version</code>, gated by Compliance (HR4) and requires Steven's approval. Store only what your MBS Highway subscription allows; never automate a vendor login.</p></div>
</div>
<div class="card"><h3>Paste a Home Report <span class="sub">fallback when email/API isn't available — parsed by HR2</span></h3><textarea id="paste" rows="5" placeholder="Paste Home Report text here…"></textarea><div class="row" style="margin-top:8px"><button class="btn sm" id="parse">Extract signals (local heuristic preview)</button><span class="mut sm">Production extraction uses Claude with the strict JSON schema in prompt P2. This preview uses keyword rules only.</span></div><div id="parsed"></div></div>
<div class="card"><h3>Where these signals flow</h3><div class="row sm">${["Gmail label MBSH/HomeReport","→ HR1 ingest","→ HR2 Claude extraction (JSON schema)","→ mbsh_signals","→ HR3 lean + explain","→ HR4 Compliance","→ HR5 alerts","→ HR6 Morning/Midday/EOD brief","→ HR7 dashboard"].map(x=>`<span class="tag">${x}</span>`).join("")}</div></div>`,
 mount(){
  const lvl=()=>{const lk=report.signals.filter(s=>s.locks).length;const l=(Math.abs(market.umbs.ticks)>=settings.alertTicks||Math.abs(market.y10chg)>=settings.alertBp)?"rate_alert":lk>=2?"watch":"normal";const el=$("#alertLvl");if(!el)return;el.textContent="alert level: "+l;el.className="tag "+(l==="rate_alert"?"bad":l==="watch"?"warn":"good")}; lvl();
  const list=()=>{const k=$("#fk").value,d=$("#fd").value,l=$("#fl").checked; const rows=report.signals.filter(s=>(!k||s.kind===k)&&(!d||s.dir===d)&&(!l||s.locks)); $("#sigs").innerHTML=rows.map(sigRow).join("")||`<div class="mut">No signals match.</div>`;
    const b=report.signals.filter(s=>s.dir==="bullish").reduce((a,s)=>a+s.str,0),r=report.signals.filter(s=>s.dir==="bearish").reduce((a,s)=>a+s.str,0),t=b+r||1;
    $("#bal").innerHTML=`<rect x="20" y="50" width="260" height="22" rx="11" fill="var(--panel2)"/><rect x="20" y="50" width="0" height="22" rx="11" fill="var(--good)"><animate attributeName="width" to="${260*b/t}" dur=".9s" fill="freeze"/></rect><text x="20" y="42">Bullish (rates ↓) ${b}</text><text x="280" y="42" text-anchor="end">Bearish (rates ↑) ${r}</text><text x="150" y="110" text-anchor="middle" style="font-size:20px;font-weight:700;fill:var(--ink)">${b>r?"Bond-friendly":b<r?"Cautious":"Balanced"}</text><text x="150" y="130" text-anchor="middle">${report.signals.filter(s=>s.locks).length} lock-relevant signals</text>`;$("#balT").textContent="Strength-weighted tally of signal directions."}; ["fk","fd","fl"].forEach(i=>$("#"+i).onchange=list); list();
  const dm=()=>lvl(); document.addEventListener("market:tick",dm); cleanups.push(()=>document.removeEventListener("market:tick",dm));
  $("#hrrun").onclick=async()=>{const ids=$$("#hrsteps .step");ids.forEach(s=>s.className="step");for(const s of ids){s.classList.add("run");await new Promise(r=>setTimeout(r,520));s.classList.replace("run","done")}
    if(settings.n8n){try{await fetch(settings.n8n.replace(/\/$/,"")+"/webhook/home-report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({report})});toast("Posted to n8n /webhook/home-report")}catch(e){toast("n8n unreachable — simulated run only")}}else toast("Simulated run (set n8n URL in Settings to fire the real webhook)")};
  $("#sync").onclick=async()=>{try{const r=await sb("/rest/v1/v_home_report_signals?select=*&order=report_date.desc&limit=1");if(!r.length)return toast("No Home Reports in Supabase yet");const x=r[0];
      report={edition:x.edition,headline:x.headline||report.headline,lean:x.lock_lean||"neutral",conf:+x.lean_confidence||0,signals:(x.signals||[]).map(s=>({kind:s.kind,label:s.label,value:s.value,dir:s.direction||"neutral",str:s.strength||1,locks:!!s.affects_locks}))};
      if(x.umbs_change_ticks!=null)market.umbs.ticks=+x.umbs_change_ticks; if(x.ust10y_change_bp!=null)market.y10chg=+x.ust10y_change_bp; market.asOf=x.report_date+" · "+x.edition+" edition (Supabase)"; toast("Synced from Supabase"); route()}catch(e){toast(e.message,5000)}};
  $("#parse").onclick=()=>{const t=$("#paste").value; if(!t.trim())return toast("Paste some text first");
    const out=[],add=(kind,label,value,dir,str,locks)=>out.push({kind,label,value,dir,str,locks});
    (t.match(/resistance[^\d]{0,12}(\d{2,3}\.\d{1,3})/gi)||[]).forEach(m=>add("resistance","Resistance",m.match(/\d{2,3}\.\d{1,3}/)[0],"bearish",4,true));
    (t.match(/support[^\d]{0,12}(\d{2,3}\.\d{1,3})/gi)||[]).forEach(m=>add("support","Support",m.match(/\d{2,3}\.\d{1,3}/)[0],"bullish",3,true));
    if(/overbought/i.test(t))add("momentum","Stochastics","Overbought","bearish",2,false); if(/oversold/i.test(t))add("momentum","Stochastics","Oversold","bullish",2,false);
    if(/\b(CPI|PCE|NFP|payrolls|jobs report|FOMC)\b/i.test(t))add("calendar","Event risk",(t.match(/\b(CPI|PCE|NFP|payrolls|jobs report|FOMC)\b/i)||[])[0],"neutral",5,true);
    if(/auction/i.test(t))add("auction","Treasury auction","Mentioned","neutral",3,false);
    $("#parsed").innerHTML=out.length?`<div style="margin-top:10px">${out.map(sigRow).join("")}</div><div class="row" style="margin-top:8px"><button class="btn good sm" id="useP">Use these signals</button></div>`:`<div class="mut" style="margin-top:8px">No known patterns found — production HR2 (Claude) handles free-form text.</div>`;
    $("#useP")&&($("#useP").onclick=()=>{report.signals=out;list();toast("Preview signals loaded")})};
 }};

/* ---------- workflow runner (shared) ---------- */
async function fireWorkflow(id,payload){
  const w=WORKFLOWS.find(x=>x.id===id); if(w?.hitl) toast(`${id}: human approval required before external send — queued in approvals`);
  if(settings.n8n){ try{ const r=await fetch(settings.n8n.replace(/\/$/,"")+"/webhook/"+id.toLowerCase(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload||{})}); toast(`n8n ${id}: HTTP ${r.status}`); }catch(e){ toast(`n8n unreachable (${id}) — ran as simulation`) } }
  else toast(`${id} simulated. Add your n8n URL in Settings to fire the real webhook.`);
}

/* =================== LOAN INTELLIGENCE =================== */
const sel=(id,label,opts,val)=>`<div><label for="${id}">${label}</label><select id="${id}">${opts.map(o=>{const [v,t]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${v==val?"selected":""}>${esc(t)}</option>`}).join("")}</select></div>`;
const numf=(id,label,val,step="any",extra="")=>`<div><label for="${id}">${label}</label><input type="number" id="${id}" value="${val}" step="${step}" ${extra}></div>`;
const chkf=(id,label,on)=>`<label class="chk"><input type="checkbox" id="${id}" ${on?"checked":""}>${label}</label>`;

PAGE.scenario={ html:()=>`
<div class="card"><h3>Loan scenario builder <span class="sub">rules as of ${RULES_AS_OF} · verify overlays with live investor matrices</span></h3>
<div class="form">
  ${sel("fico","Credit score band",["<580","580-619","620-659","660-679","680-719","720-759","760+"],"720-759")}
  ${sel("income","Income type",[["w2","W-2 / salaried"],["selfemp","Self-employed"],["1099","1099 contractor"],["retired","Retired / pension"],["asset","Asset-rich, income-light"],["foreign","Foreign / no US income"]],"w2")}
  ${sel("occ","Occupancy",[["primary","Primary residence"],["second","Second home"],["investment","Investment"]],"primary")}
  ${numf("price","Purchase price ($)",650000,1000)}
  ${sel("down","Down payment",[["0","0%"],["3","3%"],["3.5","3.5%"],["5","5%"],["10","10%"],["15","15%"],["20","20%"],["25","25%+"]],"5")}
  ${sel("area","Area loan limit",[["baseline","Baseline $832,750"],["sandiego","San Diego $1,104,000"],["high","High-cost ceiling $1,249,125"]],"baseline")}
  ${sel("property","Property type",[["sfr","Single-family"],["condo","Condo (warrantable)"],["condo-nw","Condo (non-warrantable)"],["multi","2–4 unit"],["mfg","Manufactured home"],["rural","Rural (USDA-eligible)"]],"sfr")}
  ${sel("state","State",["CA","NV","AZ","IL","FL","Other"],"CA")}
  ${sel("dti","Est. back-end DTI",[["36","≤36%"],["43","37–43%"],["47","44–50%"],["52",">50%"]],"43")}
  <div class="wide row" style="gap:18px">${chkf("vet","Veteran / active duty / surviving spouse",true)}${chkf("wantCredit","Wants seller credit toward costs",true)}${chkf("bk","Recent bankruptcy / foreclosure")}${chkf("foreign","Foreign national / ITIN / DACA")}${chkf("foreignDaca","…DACA")}${chkf("physician","Physician / dentist")}${chkf("bridge","Needs to buy before selling")}${chkf("age62","62+, wants to eliminate mortgage payment")}${chkf("owner","Owns home with equity")}${chkf("dpa","Needs down-payment assistance")}${chkf("compete","Competitive multi-offer market")}</div>
  <div class="wide row" style="gap:18px;padding:8px 10px;border:1px dashed var(--line);border-radius:8px"><b class="sm">5/1 ARM triggers:</b>${chkf("shortHold","Expects to sell/refi within ~7 years",true)}${chkf("lowPay","Wants lowest starting payment")}</div>
</div><div class="row" style="margin-top:12px"><button class="btn" id="go">Generate recommendation</button><button class="btn ghost" id="save">Save scenario to Supabase</button><span class="mut sm">Hard-coded lender niches come from the 61-lender directory.</span></div></div>
<div id="rec"></div>`,
 mount(){
  const read=()=>({fico:$("#fico").value,income:$("#income").value,occ:$("#occ").value,price:+$("#price").value||0,downPct:+$("#down").value,area:$("#area").value,property:$("#property").value,state:$("#state").value,dti:+$("#dti").value,
    ...Object.fromEntries(["vet","wantCredit","bk","foreign","foreignDaca","physician","bridge","age62","owner","dpa","compete","shortHold","lowPay"].map(k=>[k,$("#"+k).checked]))});
  const run=()=>{const s=read(),r=recommend(s); $("#rec").innerHTML=`
  <div class="grid g4"><div class="card kpi"><div class="k">Loan amount</div><div class="v">${money(r.loan)}</div></div><div class="card kpi"><div class="k">LTV</div><div class="v">${r.ltv.toFixed(1)}%</div></div><div class="card kpi"><div class="k">Area limit</div><div class="v">${money(r.limit)}</div></div><div class="card kpi"><div class="k">Loan type</div><div class="v" style="font-size:20px">${r.isJumbo?"Jumbo (non-conforming)":"Conforming / agency"}</div></div></div>
  <div class="grid g21"><div class="card"><h3>Recommended loan paths</h3>${r.options.length?r.options.slice(0,6).map((o,i)=>`<div class="rec" style="animation-delay:${i*90}ms"><h4>${i+1}. ${esc(o.p.name)} <span class="score">fit ${o.score}</span><span class="tag">${esc(o.p.fixedArm)}</span></h4>
     <div class="bar" style="margin:4px 0 6px"><i style="width:${o.score}%"></i></div>
     <ul style="margin:0 0 4px 18px;padding:0">${o.why.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${o.warn.map(x=>`<div class="tag warn" style="display:block;margin-top:4px;white-space:normal">⚠ ${esc(x)}</div>`).join("")}
     <div class="mut sm" style="margin-top:6px"><b>Min credit:</b> ${esc(o.p.minFico)} · <b>Down:</b> ${esc(o.p.down)} · <b>MI/fee:</b> ${esc(o.p.mi)}</div>
     ${s.wantCredit?`<div class="mut sm"><b>Seller credit:</b> ${esc(o.p.seller)}</div>`:""}</div>`).join(""):`<div class="mut">No program fits these inputs — open the Get-Well plan workflow (GW1) and revisit after credit/asset changes.</div>`}
     ${r.notes.map(n=>`<div class="tag warn" style="display:block;white-space:normal;margin-top:6px">${esc(n)}</div>`).join("")}
     ${r.options.some(o=>o.p.cat==="ARM")?`<div class="row" style="margin-top:10px"><a class="btn ghost sm" href="#calc" id="toArm">Compare 5/1 ARM vs fixed →</a></div>`:""}</div>
  <div class="card"><h3>Matched lenders <span class="sub">by niche</span></h3>${r.lenders.map(e=>`<div style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${esc(e.l.name)}</b><div class="mut sm">${esc(e.l.spec)}</div><div>${[...e.pids].map(p=>`<span class="tag">${esc(PROGRAMS.find(x=>x.id===p).name)}</span>`).join("")}</div>${e.l.flag?`<div class="tag warn" style="white-space:normal">${esc(e.l.flag)}</div>`:""}</div>`).join("")||`<div class="mut">No lender niche matched.</div>`}<div class="mut sm" style="margin-top:8px">Overlay specifics (credit/LTV cutoffs) live in broker-portal guideline sheets — confirm before quoting.</div></div></div>
  <div class="card"><h3>Strategy notes for this client</h3><div class="grid g2" style="margin-top:0">${r.strategies.map(x=>`<div style="border:1px solid var(--line);border-radius:10px;padding:10px"><b>${esc(x.t)}</b><div class="mut sm">${esc(x.x)}</div></div>`).join("")||`<div class="mut">No special strategies triggered.</div>`}</div></div>`;
  $("#toArm")&&($("#toArm").onclick=()=>{store.set("calcTab","arm");const loan=s.price*(1-s.downPct/100);store.set("armLoan",Math.round(loan))})};
  $("#go").onclick=run; run();
  $("#save").onclick=async()=>{try{await sb("/rest/v1/scenario_runs",{method:"POST",body:JSON.stringify({inputs:read()}),headers:{Prefer:"return=minimal"}});toast("Saved to scenario_runs")}catch(e){toast(e.message,5000)}};
 }};

PAGE.programs={ html:()=>`
<div class="card"><h3>Loan programs &amp; guidelines <span class="sub">Researched ${RULES_AS_OF} — agency-sourced where federally backed; DSCR/Non-QM/Jumbo/HELOC/ARM ranges are lender-typical, not fixed rules</span></h3>
<div class="row" style="margin-bottom:8px"><select id="pcat" style="width:auto"><option value="">All categories</option>${[...new Set(PROGRAMS.map(p=>p.cat))].map(c=>`<option>${c}</option>`).join("")}</select><input type="text" id="psearch" placeholder="Search programs…" style="max-width:260px"></div>
<div style="overflow:auto"><table id="ptbl"></table></div></div>
<div class="grid g2">
 <div class="card"><h3>2026 limits &amp; confirmations</h3><table><tbody>
  <tr><td>Conforming baseline / ceiling</td><td><b>${money(LIMITS.baseline)}</b> / <b>${money(LIMITS.ceiling)}</b> <span class="tag good">confirmed</span></td></tr>
  <tr><td>San Diego / Riverside</td><td>${money(LIMITS.sandiego)} / ${money(LIMITS.baseline)}</td></tr>
  <tr><td>FHA floor / ceiling</td><td>${money(LIMITS.fhaFloor)} / ${money(LIMITS.fhaCeiling)} <span class="tag good">confirmed</span></td></tr>
  <tr><td>FHA annual MIP</td><td>Unchanged since ML 2023-05 <span class="tag good">confirmed</span></td></tr>
  <tr><td>VA funding fee</td><td>2.15% first / 3.30% subsequent (&lt;5% down); IRRRL 0.50% <span class="tag good">confirmed</span></td></tr>
  <tr><td>USDA guarantee fee FY2027</td><td>1% / 0.35% <span class="tag warn">unconfirmed</span></td></tr>
  <tr><td>FHFA 2027 limits</td><td>Not announced — expected late November <span class="tag warn">pending</span></td></tr></tbody></table></div>
 <div class="card"><h3>Seller credit quick reference</h3><div style="overflow:auto;max-height:340px"><table><thead><tr><th>Loan type</th><th>Max</th><th>Notes</th></tr></thead><tbody>${SELLER_CREDITS.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="mut">${esc(r[2])}</td></tr>`).join("")}</tbody></table></div></div>
</div>
<div class="card"><h3>Outside-the-box qualifying strategies</h3><p class="sm">${STRATEGIES2.length} strategies with cost, payment, qualifying and program effects, plus a side-by-side comparison — <a href="#strategies">open Qualifying Strategies →</a></p></div>`,
 mount(){ const draw=()=>{const c=$("#pcat").value,q=$("#psearch").value.toLowerCase(); const rows=PROGRAMS.filter(p=>(!c||p.cat===c)&&(!q||JSON.stringify(p).toLowerCase().includes(q)));
  $("#ptbl").innerHTML=`<thead><tr><th>Program</th><th>Min credit</th><th>Down</th><th>Max DTI</th><th>MI / funding fee</th><th>Best for</th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${esc(p.name)}</b><div><span class="tag ${p.cat==="ARM"?"warn":""}">${p.cat}</span><span class="tag">${esc(p.fixedArm)}</span></div></td><td>${esc(p.minFico)}</td><td>${esc(p.down)}</td><td>${esc(p.dti)}</td><td class="mut">${esc(p.mi)}</td><td>${esc(p.best)}</td></tr>`).join("")}</tbody>`}; ["pcat","psearch"].forEach(i=>$("#"+i).oninput=draw); draw(); }};

PAGE.lenders={ html:()=>{const specs=["agency","va","fha","usda","conv","jumbo","nonqm","bank","dscr","fnfl","foreign","itin","reverse","heloc","hard","bridge","comm","dpa","port","mfg","ag","reno","calvet","lowfico","condo","asset"];
 return `<div class="card"><h3>Lender directory <span class="sub">61 approved lenders · 21 spot-checked Sep 2026 — 17 confirmed, 3 flagged, 1 unverifiable</span></h3>
 <div class="row"><input type="text" id="lq" placeholder="Search lender or specialty…" style="max-width:280px"><select id="lt" style="width:auto"><option value="">All niches</option>${specs.map(s=>`<option>${s}</option>`).join("")}</select><label class="chk"><input type="checkbox" id="lf"> only ⚠️ flagged</label><span class="sp"></span><span class="mut" id="lc"></span></div>
 <svg id="lniche" width="100%" style="margin-top:8px"></svg><div style="overflow:auto;max-height:70vh;margin-top:8px"><table><thead><tr><th>#</th><th>Lender</th><th>Specialty / niche</th><th>Niche tags</th></tr></thead><tbody id="lb"></tbody></table></div></div>`},
 mount(){ const draw=()=>{const q=$("#lq").value.toLowerCase(),t=$("#lt").value,f=$("#lf").checked; const rows=LENDERS.filter(l=>(!q||(l.name+l.spec).toLowerCase().includes(q))&&(!t||l.tags.includes(t))&&(!f||l.flag));
  $("#lc").textContent=rows.length+" shown"; $("#lb").innerHTML=rows.map(l=>`<tr><td>${l.n}</td><td><b>${esc(l.name)}</b>${l.flag?`<div class="tag warn" style="white-space:normal;margin-top:4px">${esc(l.flag)}</div>`:""}</td><td>${esc(l.spec)}</td><td>${l.tags.map(x=>`<span class="tag">${x}</span>`).join("")}</td></tr>`).join("")}; ["lq","lt","lf"].forEach(i=>$("#"+i).oninput=draw); draw(); const cnt={}; LENDERS.forEach(l=>l.tags.forEach(t=>cnt[t]=(cnt[t]||0)+1)); barChart($("#lniche"),Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([l,v])=>({l,v})),{h:140,fmt:v=>v}); }};

/* =================== CALCULATORS =================== */
PAGE.calc={ html:()=>`
<div class="tabs" id="ctabs">${[["bvr","Buy vs Rent"],["debt","Debt Consolidation"],["arm","5/1 ARM vs Fixed"],["buydown","Temp Buydown"],["conc","Concession Cap"]].map(([k,t])=>`<button data-t="${k}">${t}</button>`).join("")}</div>
<div id="cbody"></div>`,
 mount(){
  const tabs=$$("#ctabs button"); const show=k=>{store.set("calcTab",k);tabs.forEach(b=>b.classList.toggle("on",b.dataset.t===k));$("#cbody").innerHTML=CALCS[k].html();CALCS[k].mount()}; tabs.forEach(b=>b.onclick=()=>show(b.dataset.t)); show(store.get("calcTab","bvr"));
 }};
const rpcBtn=(kind)=>`<button class="btn ghost sm" id="rpc">Run in Supabase (run_calc)</button>`;
function lineChart(el,series,{w=640,h=240,fmt=v=>money(v),xl=i=>i+1}={}){const all=series.flatMap(s=>s.v),min=Math.min(...all),max=Math.max(...all),n=series[0].v.length;
  el.innerHTML=`${[0,.25,.5,.75,1].map(k=>{const v=min+(max-min)*k,y=10+scale(v,min,max,h-32,0);return `<line class="axis" x1="44" x2="${w-6}" y1="${y}" y2="${y}" opacity=".5"/><text x="2" y="${y+4}">${fmt(v)}</text>`}).join("")}${series.map(s=>`<path class="draw" d="${path(s.v,w,h,{min,max,pl:44,pb:22})}" fill="none" stroke="${s.c}" stroke-width="2.6" ${s.d?'stroke-dasharray="6 4"':""}/>`).join("")}${series[0].v.map((_,i)=>i%Math.ceil(n/10)===0?`<text x="${44+scale(i,0,n-1,0,w-50)-4}" y="${h-4}">${xl(i)}</text>`:"").join("")}${series.map((s,i)=>`<text x="${60+(i%3)*190}" y="${12+Math.floor(i/3)*14}" style="fill:${s.c};font-weight:700">● ${s.n}</text>`).join("")}`; drawIn(el)}
const val=(id)=>+$("#"+id).value;
const CALCS={
 bvr:{ html:()=>`<div class="grid g12"><div class="card"><h3>Buy versus rent ${rpcBtn()}</h3><div class="form" style="grid-template-columns:1fr 1fr">
   ${numf("b_price","Price",600000,1000)}${numf("b_down","Down %",10,.5)}${numf("b_rate","Rate %",6.5,.125)}${numf("b_term","Term (yrs)",30,5)}
   ${numf("b_tax","Prop. tax %/yr",1.25,.05)}${numf("b_ins","Insurance $/yr",1800,100)}${numf("b_hoa","HOA $/mo",0,25)}${numf("b_maint","Maintenance %/yr",1,.1)}
   ${numf("b_app","Appreciation %/yr",3.5,.25)}${numf("b_rent","Rent $/mo",3200,50)}${numf("b_rg","Rent growth %",3.5,.25)}${numf("b_ri","Renter's ins. $/yr",200,25)}
   ${numf("b_inv","Invest return %",6,.25)}${numf("b_cc","Buyer closing %",3,.25)}${numf("b_sell","Selling cost %",6,.25)}${numf("b_h","Horizon (yrs)",10,1)}
   <div class="wide row">${chkf("b_item","Itemizes (mortgage-interest + tax benefit)")}${numf("b_mt","Marginal tax %",24,1)}</div></div></div>
  <div><div class="card"><h3>Net worth: buy vs rent</h3><svg viewBox="0 0 640 240" id="bch" width="100%"></svg></div><div class="grid g4" id="bk"></div><div class="card"><div id="bsens"></div><p class="mut sm" style="margin:8px 0 0">Illustrative estimate, not a loan offer or financial advice. The renter invests the down payment, closing costs and every month's cost difference; the buyer's equity is net of selling costs. Same math as <code>calc_buy_vs_rent()</code> in Supabase.</p></div></div></div>`,
  mount(){ const inp=(over={})=>({price:val("b_price"),downPct:val("b_down")/100,rate:val("b_rate")/100,termYears:val("b_term"),taxRate:val("b_tax")/100,insurance:val("b_ins"),hoa:val("b_hoa"),maintPct:val("b_maint")/100,appreciation:val("b_app")/100,rent:val("b_rent"),rentGrowth:val("b_rg")/100,rentersIns:val("b_ri"),invest:val("b_inv")/100,closingPct:val("b_cc")/100,sellPct:val("b_sell")/100,horizon:Math.max(1,Math.min(40,val("b_h"))),marginal:val("b_mt")/100,itemize:$("#b_item").checked,...over});
   const go=()=>{const i=inp(),r=buyVsRent(i); lineChart($("#bch"),[{n:"Buyer",v:r.rows.map(x=>x.buyer),c:"var(--acc)"},{n:"Renter",v:r.rows.map(x=>x.renter),c:"var(--warn)",d:1}]);
     $("#bk").innerHTML=[["Monthly P&I",money2(r.pi)],["Break-even",r.breakeven?"Year "+r.breakeven:"Not within horizon"],[`Winner @ yr ${i.horizon}`,r.winner==="buy"?"Buy":"Rent"],["Advantage",money(r.adv)]].map(([k,v])=>`<div class="card kpi"><div class="k">${k}</div><div class="v" style="font-size:20px">${v}</div></div>`).join("");
     const apps=[-.02,0,.02].map(d=>i.appreciation+d),invs=[-.02,0,.02].map(d=>i.invest+d); $("#bsens").innerHTML=`<b>Sensitivity — buyer advantage at horizon</b><table><thead><tr><th>Appreciation ↓ / Invest →</th>${invs.map(v=>`<th>${(v*100).toFixed(1)}%</th>`).join("")}</tr></thead><tbody>${apps.map(a=>`<tr><td>${(a*100).toFixed(1)}%</td>${invs.map(v=>{const q=buyVsRent(inp({appreciation:a,invest:v}));const last=q.rows[q.rows.length-1];const d=last.buyer-last.renter;return `<td class="${d>=0?"up":"dn"}">${d>=0?"Buy +":"Rent +"}${money(Math.abs(d)).replace("$","$")}</td>`}).join("")}</tr>`).join("")}</tbody></table>`};
   $$("#cbody input").forEach(e=>e.oninput=go); go();
   $("#rpc").onclick=async()=>{try{const i=inp(),r=await runRpc("buy_vs_rent",{price:i.price,down_pct:i.downPct,rate:i.rate,term_years:i.termYears,property_tax_rate:i.taxRate,insurance_annual:i.insurance,hoa_monthly:i.hoa,maintenance_pct:i.maintPct,appreciation:i.appreciation,rent_monthly:i.rent,rent_growth:i.rentGrowth,renters_insurance_annual:i.rentersIns,invest_return:i.invest,closing_cost_pct:i.closingPct,selling_cost_pct:i.sellPct,horizon_years:i.horizon,marginal_tax_rate:i.marginal,itemizes:i.itemize}); toast(`Supabase: P&I ${money2(r.monthly_pi)}, break-even yr ${r.breakeven_year??"n/a"}, winner ${r.winner_at_horizon}`,6000)}catch(e){toast(e.message,6000)}} }},
 debt:{ html:()=>`<div class="grid g12"><div class="card"><h3>Debt consolidation ${rpcBtn()}</h3><div id="drows"></div><button class="btn ghost sm" id="dadd">+ Add debt</button>
   <div class="form" style="grid-template-columns:1fr 1fr;margin-top:12px">${sel("d_mode","Strategy",[["heloan","HELOAN (2nd lien, fixed)"],["heloc","HELOC (2nd lien)"],["cashout_refi","Cash-out refinance (replaces 1st)"]],"heloan")}${numf("d_rate","New rate %",9.5,.125)}${numf("d_term","New term (yrs)",10,1)}${numf("d_cc","Closing cost % of debt",3,.25)}${numf("d_hv","Home value $",500000,5000)}${numf("d_cltv","Max CLTV %",80,1)}${numf("d_fb","1st mortgage balance $",300000,1000)}${numf("d_fr","1st mortgage rate %",3.25,.125)}${numf("d_fp","1st mortgage P&I $/mo",1650,10)}</div></div>
   <div><div id="dk" class="grid g4" style="margin-top:0"></div><div class="card"><h3>Monthly payment: before vs after</h3><svg viewBox="0 0 640 200" id="dch" width="100%"></svg></div><div class="card"><h3>Warnings</h3><div id="dw"></div></div></div></div>`,
  mount(){ let debts=store.get("debts",[{name:"Visa",balance:12000,rate:24,payment:360},{name:"Store card",balance:4200,rate:27.99,payment:130},{name:"Auto loan",balance:18000,rate:9,payment:450}]);
   const rows=()=>{$("#drows").innerHTML=`<table><thead><tr><th>Debt</th><th>Balance</th><th>APR %</th><th>Pmt/mo</th><th></th></tr></thead><tbody>${debts.map((d,i)=>`<tr><td><input type="text" data-i="${i}" data-k="name" value="${esc(d.name)}"></td><td><input type="number" data-i="${i}" data-k="balance" value="${d.balance}"></td><td><input type="number" step=".01" data-i="${i}" data-k="rate" value="${d.rate}"></td><td><input type="number" data-i="${i}" data-k="payment" value="${d.payment}"></td><td><button class="btn ghost sm" data-del="${i}">✕</button></td></tr>`).join("")}</tbody></table>`;
     $$("#drows input").forEach(e=>e.oninput=()=>{debts[e.dataset.i][e.dataset.k]=e.dataset.k==="name"?e.value:+e.value;store.set("debts",debts);go()}); $$("#drows [data-del]").forEach(b=>b.onclick=()=>{debts.splice(b.dataset.del,1);rows();go()})};
   const inp=()=>({debts:debts.map(d=>({...d,rate:d.rate/100})),mode:$("#d_mode").value,newRate:val("d_rate")/100,newTerm:val("d_term"),closingPct:val("d_cc")/100,homeValue:val("d_hv"),maxCltv:val("d_cltv")/100,firstBal:val("d_fb"),firstRate:val("d_fr")/100,firstPay:val("d_fp")});
   const go=()=>{const i=inp(),r=debtConsolidation(i); if(r.error){$("#dk").innerHTML=`<div class="card">${r.error}</div>`;return}
     $("#dk").innerHTML=[["Debt rolled in",money(r.tb)],["Weighted APR",pct(r.wr,2)],["New payment",money2(r.newPay)],["Cash-flow change",(r.save>=0?"+":"")+money2(r.save)+"/mo"],["Break-even",r.be?r.be.toFixed(1)+" mo":"n/a"],["Interest left (now)",money(r.ci)],["New-loan interest",money(r.newInt)],["Lifetime Δ",(r.delta>=0?"saves ":"costs ")+money(Math.abs(r.delta))],["CLTV",r.cltv?pct(r.cltv,1):"—"]].map(([k,v])=>`<div class="card kpi"><div class="k">${k}</div><div class="v" style="font-size:18px">${v}</div></div>`).join("");
     const before=i.mode==="cashout_refi"?r.tp+i.firstPay:r.tp, after=i.mode==="cashout_refi"?r.newPay:r.newPay, max=Math.max(before,after)*1.1;
     $("#dch").innerHTML=[["Before",before,"var(--warn)"],["After",after,"var(--good)"]].map(([l,v,c],k)=>`<text x="2" y="${52+k*70}">${l}</text><rect x="70" y="${34+k*70}" height="34" rx="6" fill="${c}" width="0"><animate attributeName="width" to="${scale(v,0,max,0,540)}" dur=".8s" fill="freeze"/></rect><text x="${78+scale(v,0,max,0,540)}" y="${56+k*70}" style="fill:var(--ink);font-weight:700">${money2(v)}</text>`).join("");
     $("#dw").innerHTML=r.warn.map(w=>`<div class="tag warn" style="display:block;white-space:normal;margin-bottom:6px">⚠ ${esc(w)}</div>`).join("")+`<p class="mut sm">Illustrative only — verify with live pricing/underwriting. DTI after payoff is calculated in the Deal Structurer. Same math as <code>calc_debt_consolidation()</code>.</p>`};
   rows(); $$("#cbody input[type=number],#cbody select").forEach(e=>{if(!e.closest("#drows"))e.oninput=go}); $("#d_mode").onchange=go; $("#dadd").onclick=()=>{debts.push({name:"New debt",balance:5000,rate:19,payment:150});rows();go()}; go();
   $("#rpc").onclick=async()=>{try{const i=inp(),r=await runRpc("debt_consolidation",{debts:i.debts,mode:i.mode,new_rate:i.newRate,new_term_years:i.newTerm,closing_cost_pct:i.closingPct,existing_first_balance:i.firstBal,existing_first_rate:i.firstRate,existing_first_payment:i.firstPay,home_value:i.homeValue,max_cltv:i.maxCltv});toast(`Supabase: new pmt ${money2(r.new_payment)}, cash-flow ${money2(r.monthly_cash_flow_change)}/mo, break-even ${r.breakeven_months} mo`,6000)}catch(e){toast(e.message,6000)}} }},
 arm:{ html:()=>`<div class="grid g12"><div class="card"><h3>5/1 ARM vs fixed ${rpcBtn()}</h3><div class="form" style="grid-template-columns:1fr 1fr">
   ${numf("a_loan","Loan amount $",store.get("armLoan",400000),1000)}${numf("a_term","Term (yrs)",30,5)}${numf("a_fr","Fixed rate %",6.75,.125)}${numf("a_ar","ARM start rate %",5.9,.125)}${numf("a_idx","Index (SOFR) %",4.0,.05)}${numf("a_mg","Margin %",2.75,.125)}
   ${numf("a_ci","Initial cap (pts)",2,.5)}${numf("a_cp","Periodic cap (pts)",2,.5)}${numf("a_cl","Lifetime cap (pts)",5,.5)}${numf("a_h","Horizon (yrs)",10,1)}</div>
   <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-preset="conv">Conv 2/2/5</button><button class="btn ghost sm" data-preset="fha">FHA/VA 1/1/5</button><button class="btn ghost sm" data-preset="jumbo">Jumbo 5/2/5</button></div></div>
   <div><div id="ak" class="grid g4" style="margin-top:0"></div><div class="card"><h3>Monthly payment by year</h3><svg viewBox="0 0 640 240" id="ach" width="100%"></svg></div><div class="card"><div id="at"></div></div></div></div>`,
  mount(){ const inp=()=>({loan:val("a_loan"),term:val("a_term"),fixedRate:val("a_fr")/100,armRate:val("a_ar")/100,index:val("a_idx")/100,margin:val("a_mg")/100,capInit:val("a_ci")/100,capPer:val("a_cp")/100,capLife:val("a_cl")/100,fixedYrs:5,horizon:Math.max(6,val("a_h"))});
   const go=()=>{const i=inp(),r=armVsFixed(i);
     $("#ak").innerHTML=[["Fixed payment",money2(r.fp)],["ARM yrs 1–5",money2(r.ap)],["Initial savings",money2(r.saveInit)+"/mo"],["Fully-indexed rate",pct(r.fully,2)],["Balance at reset",money(r.balReset)],["Worst-case rate",pct(r.worstRate,2)],["Worst-case payment",money2(r.worstPay)],["Payment shock",(r.shock>=0?"+":"")+money2(r.shock)]].map(([k,v],n)=>`<div class="card kpi"><div class="k">${k}</div><div class="v" style="font-size:18px;${n>=5?"color:var(--warn)":""}">${v}</div></div>`).join("");
     lineChart($("#ach"),[{n:"Fixed",v:r.rows.map(x=>x.fp),c:"var(--warn)",d:1},{n:"5/1 ARM",v:r.rows.map(x=>x.pay),c:"var(--acc)"}],{fmt:v=>"$"+Math.round(v).toLocaleString()});
     const be=r.rows.find(x=>x.sav<=0); $("#at").innerHTML=`<table><thead><tr><th>Year</th><th>ARM rate</th><th>ARM pmt</th><th>Fixed pmt</th><th>Cumulative savings vs fixed</th><th>ARM balance</th></tr></thead><tbody>${r.rows.map(x=>`<tr><td>${x.year}</td><td>${pct(x.rate,3)}</td><td>${money(x.pay)}</td><td>${money(x.fp)}</td><td class="${x.sav>=0?"up":"dn"}">${money(x.sav)}</td><td>${money(x.bal)}</td></tr>`).join("")}</tbody></table>
     <p class="mut sm" style="margin:8px 0 0">${be?`ARM's cumulative advantage turns negative in year ${be.year}.`:"ARM stays ahead of fixed across this horizon at the assumed index."} Qualify at the greater of note rate or fully-indexed rate per investor guidelines. New agency ARMs are SOFR-based — a 5/6 ARM resets every 6 months after year 5 (this model resets annually). ARM disclosures (CHARM booklet) required with any consumer payment content. Same math as <code>calc_arm_vs_fixed()</code>.</p>`};
   $$("#cbody input").forEach(e=>e.oninput=go); go();
   $$("[data-preset]").forEach(b=>b.onclick=()=>{const p={conv:[2,2,5],fha:[1,1,5],jumbo:[5,2,5]}[b.dataset.preset];$("#a_ci").value=p[0];$("#a_cp").value=p[1];$("#a_cl").value=p[2];go()});
   $("#rpc").onclick=async()=>{try{const i=inp(),r=await runRpc("arm_vs_fixed",{loan:i.loan,fixed_rate:i.fixedRate,arm_start_rate:i.armRate,arm_index:i.index,arm_margin:i.margin,term_years:i.term});toast(`Supabase: fixed ${money2(r.fixed_payment)}, ARM ${money2(r.arm_initial_payment)}, worst ${money2(r.worst_case_payment)}`,6000)}catch(e){toast(e.message,6000)}} }},
 buydown:{ html:()=>`<div class="grid g12"><div class="card"><h3>Temporary buydown</h3><div class="form" style="grid-template-columns:1fr 1fr">${numf("t_loan","Loan $",400000,1000)}${numf("t_rate","Note rate %",6.5,.125)}${sel("t_type","Type",["3-2-1","2-1","1-0","1-1"],"2-1")}${numf("t_term","Term (yrs)",30,5)}</div></div><div><div class="card"><div id="tb"></div></div></div></div>`,
  mount(){ const go=()=>{const r=buydown(val("t_loan"),val("t_rate"),$("#t_type").value,val("t_term")); $("#tb").innerHTML=`<table><thead><tr><th>Year</th><th>Rate</th><th>P&amp;I</th><th>Saves/mo</th></tr></thead><tbody>${r.yrs.map(y=>`<tr><td>${y.year}</td><td>${y.rate.toFixed(3)}%</td><td>${money2(y.pay)}</td><td class="up">${money2(y.save)}</td></tr>`).join("")}<tr><td>Yr ${r.yrs.length+1}+</td><td>${val("t_rate").toFixed(3)}%</td><td>${money2(r.base)}</td><td>—</td></tr></tbody></table><div class="row" style="margin-top:10px"><span class="tag warn">Subsidy escrow ≈ ${money(r.cost)} (${r.pct.toFixed(2)}% of loan)</span><span class="mut sm">Funded by seller credit / agent-paid; check the concession cap. Formula: Σ(P&amp;I at note rate − P&amp;I at bought-down rate) × 12.</span></div>`}; $$("#cbody input,#cbody select").forEach(e=>e.oninput=go); go(); }},
 conc:{ html:()=>`<div class="grid g12"><div class="card"><h3>Concession cap checker</h3><div class="form" style="grid-template-columns:1fr 1fr">${sel("c_prog","Program",[["conv","Conventional"],["fha","FHA"],["va","VA"],["usda","USDA"]],"conv")}${numf("c_price","Price / value $",600000,1000)}${numf("c_ltv","LTV %",95,1)}${sel("c_occ","Occupancy",["primary","investment"],"primary")}${numf("c_costs","Seller-paid closing costs & prepaids $",12000,500)}${numf("c_pts","Seller-paid discount points $",0,500)}${numf("c_buy","Temp buydown subsidy $",9100,100)}${numf("c_conc","VA true concessions (debt payoff/cash to vet) $",0,500)}</div></div><div class="card"><div id="cr"></div></div></div>`,
  mount(){ const go=()=>{const p=$("#c_prog").value,price=val("c_price"),ltv=val("c_ltv"),inv=$("#c_occ").value==="investment",cost=val("c_costs"),pts=val("c_pts"),bd=val("c_buy"),vc=val("c_conc");
     let cap,capAmt,used,note,lines=[];
     if(p==="conv"){cap=inv?2:ltv<=75?9:ltv<=90?6:3;capAmt=price*cap/100;used=cost+pts+bd;note=`Conventional: ${cap}% at ${ltv}% LTV${inv?" (investment)":""}`;}
     else if(p==="fha"){cap=6;capAmt=price*.06;used=cost+pts+bd;note="FHA: 6% — closing costs & prepaids only, never toward down payment or reserves";}
     else if(p==="usda"){cap=6;capAmt=price*.06;used=cost+pts+bd;note="USDA: 6% toward closing costs/prepaids";}
     else{cap=4;capAmt=price*.04;used=vc;note="VA: 4% cap applies to TRUE concessions only; closing costs, prepaids and discount points are separately unlimited";lines.push(["Costs/prepaids/points (outside the 4%)",cost+pts+bd,"unlimited"]);}
     lines.unshift([p==="va"?"VA true concessions":"Total seller-paid items",used,capAmt]); const over=used-capAmt;
     $("#cr").innerHTML=`<div class="tag ${over>0?"bad":"good"}" style="font-size:14px">${over>0?"OVER CAP by "+money(over):"Within cap — "+money(-over)+" room"}</div><p class="mut">${note}</p><table><thead><tr><th>Bucket</th><th>Used</th><th>Allowed</th></tr></thead><tbody>${lines.map(l=>`<tr><td>${l[0]}</td><td>${money(l[1])}</td><td>${typeof l[2]==="number"?money(l[2]):l[2]}</td></tr>`).join("")}</tbody></table><div class="bar" style="margin-top:10px"><i style="width:${Math.min(100,used/(capAmt||1)*100)}%;${over>0?"background:var(--bad)":""}"></i></div><p class="mut sm">Starting rule set from program_rules (${RULES_AS_OF}); investors add overlays — confirm with the lender's matrix.</p>`}; $$("#cbody input,#cbody select").forEach(e=>e.oninput=go); go(); }},
};

/* =================== OPERATE =================== */
PAGE.pipeline={ html:()=>`<div class="card"><h3>Leads &amp; pipeline <span class="sub">drag cards between stages · lead score from W4 · saved locally</span></h3><div class="kan" id="kan"></div></div>
 <div class="card"><h3>Conversion funnel <span class="sub">files by stage</span></h3><svg id="pfun" width="100%"></svg></div><div class="grid g3"><div class="card kpi"><div class="k">Total pipeline</div><div class="v" id="ptot">—</div></div><div class="card kpi"><div class="k">Leads ≥70 (hot)</div><div class="v" id="phot">—</div></div><div class="card kpi"><div class="k">5/1 ARM scenarios open</div><div class="v" id="parm">—</div></div></div>`,
 mount(){ const val$=v=>v.endsWith("M")?parseFloat(v.slice(1))*1e6:parseFloat(v.slice(1))*1e3;
  const draw=()=>{ $("#kan").innerHTML=Object.entries(pipeline).map(([st,ls])=>`<div class="col" data-st="${st}"><h4>${st}<span>${ls.length}</span></h4>${ls.map((l,i)=>`<div class="lead" draggable="true" data-st="${st}" data-i="${i}"><b>${esc(l.n)}</b><div class="mut sm">${esc(l.p)} · ${esc(l.v)}</div><div class="bar" style="margin-top:6px"><i style="width:${l.s}%;${l.s>=70?"":"background:var(--mut)"}"></i></div></div>`).join("")}</div>`).join("");
   const all=Object.values(pipeline).flat(); $("#ptot").textContent="$"+(all.reduce((a,l)=>a+val$(l.v),0)/1e6).toFixed(2)+"M"; $("#phot").textContent=all.filter(l=>l.s>=70).length; $("#parm").textContent=all.filter(l=>/ARM/.test(l.p)).length;
   barChart($("#pfun"),Object.entries(pipeline).map(([k,v],i)=>({l:k,v:v.length,c:PAL[i]})),{h:170,fmt:v=>v,horizontal:true});
   $$(".lead").forEach(el=>{el.ondragstart=e=>e.dataTransfer.setData("text/plain",el.dataset.st+"|"+el.dataset.i)}); $$(".col").forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add("over")};c.ondragleave=()=>c.classList.remove("over");c.ondrop=e=>{e.preventDefault();c.classList.remove("over");const [s,i]=e.dataTransfer.getData("text/plain").split("|");if(s===c.dataset.st)return;const [l]=pipeline[s].splice(+i,1);pipeline[c.dataset.st].push(l);persist();draw();toast(`${l.n} → ${c.dataset.st} (W19 milestone update queued)`)}})}; draw(); }};

PAGE.refi={ html:()=>`<div class="card"><h3>VA Refi Hunter queue <span class="sub">trigger ≥0.75% strong / ≥0.50% minimum · current IRRRL assumed par ${market.vapar30.toFixed(3)}%</span></h3><div class="row"><label class="chk"><input type="checkbox" id="rhide"> hide estimated-rate files</label><span class="sp"></span><button class="btn sm" id="rerun">Re-run all (W16)</button></div>
 <table id="rt"></table></div><div class="grid g2"><div class="card"><h3>Monthly savings by borrower</h3><svg id="rch" width="100%"></svg></div><div class="card"><h3>Queue mix</h3><div class="row"><svg id="rdon" style="width:130px;height:130px"></svg><div id="rdl" class="sm"></div></div></div></div><div class="card"><h3>Compliant letter skeleton</h3><pre class="code">Hi [Name], I'm Steven Shearrill, a Navy veteran and mortgage loan originator (NMLS #) with Patriot Pacific Financial Corp (NMLS #). Public records indicate you may have a VA-guaranteed loan recorded in [Month Year]. If your current rate is above today's market, a VA Interest Rate Reduction Refinance may lower your payment. This is not a notice from the VA or your servicer. No obligation. [Equal Housing Opportunity]</pre><div class="mut sm">No specific rate/payment unless full Reg Z disclosures are included. Estimated rates never appear as stated rates.</div></div>`,
 mount(){ const draw=()=>{const h=$("#rhide").checked; $("#rt").innerHTML=`<thead><tr><th>Borrower</th><th>Rate basis</th><th>Current</th><th>Target</th><th>Δ</th><th>Savings/mo</th><th>Recoup</th><th>NTB</th><th>Score</th><th></th></tr></thead><tbody>${REFI.filter(r=>!h||r.basis==="stated").sort((a,b)=>b.score-a.score).map(r=>{const d=r.cur-r.tgt;return `<tr><td><b>${esc(r.n)}</b><div class="mut sm">${esc(r.city)}</div></td><td><span class="tag ${r.basis==="stated"?"good":"warn"}">${r.basis}</span></td><td>${r.cur.toFixed(3)}%</td><td>${r.tgt.toFixed(3)}%</td><td class="${d>=.75?"up":d>=.5?"":"dn"}">${d.toFixed(3)}</td><td>${money(r.sav)}</td><td>${r.recoup} mo</td><td>${r.ntb?"✔":"✘"}</td><td style="width:90px"><div class="bar"><i style="width:${r.score}%"></i></div></td><td><button class="btn sm" data-n="${esc(r.n)}">Draft letter</button></td></tr>`}).join("")}</tbody>`;
   $$("#rt button").forEach(b=>b.onclick=()=>{approvals.unshift({id:Date.now(),type:"Refi letter",who:b.dataset.n,agent:"Refi Hunter",note:"Drafted from queue — pending Compliance",status:"PASS",decision:null});persist();updateBadge();toast("Draft sent to approvals queue (W15 → W24)")})}; barChart($("#rch"),REFI.slice().sort((a,b)=>b.sav-a.sav).map(r=>({l:r.n.split(" ")[0],v:r.sav,c:r.ntb?"var(--acc)":"var(--mut)"})),{h:180,fmt:v=>"$"+v}); const rmix=[{l:"Stated rate",v:REFI.filter(r=>r.basis==="stated").length,c:"var(--good)"},{l:"Estimated rate",v:REFI.filter(r=>r.basis==="estimated").length,c:"var(--warn)"}]; donut($("#rdon"),rmix); $("#rdl").innerHTML=rmix.map(p=>`<div><span style="display:inline-block;width:10px;height:10px;background:${p.c};margin-right:6px;border-radius:2px"></span>${p.l} <b>${p.v}</b></div>`).join("")+`<div class="mut" style="margin-top:6px">NTB pass: ${REFI.filter(r=>r.ntb).length}/${REFI.length}</div>`;
   $("#rhide").onchange=draw; draw(); $("#rerun").onclick=()=>fireWorkflow("W16",{}); }};

PAGE.ops={ html:()=>`<div class="tabs" id="otabs">${Object.keys(OPS).map(k=>`<button data-t="${k}">${k}</button>`).join("")}</div><div class="card" style="margin-top:14px"><div style="overflow:auto"><table id="otbl"></table></div></div>`,
 mount(){ const show=k=>{ $$("#otabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===k)); const o=OPS[k]; $("#otbl").innerHTML=`<thead><tr>${o.cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${o.rows.map(r=>`<tr>${r.map(c=>`<td>${/^(BLOCK|Breach|FIX)/.test(c)?`<span class="tag bad">${esc(c)}</span>`:/^(PASS|OK)/.test(c)?`<span class="tag good">${esc(c)}</span>`:esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`}; $$("#otabs button").forEach(b=>b.onclick=()=>show(b.dataset.t)); show("Seminars"); }};

/* =================== SYSTEM =================== */
PAGE.agents={ html:()=>`<div class="grid g21"><div class="card"><h3>Ask VANESSA <span class="sub">orchestrator routes to the right agent</span></h3>
 <div class="row"><input type="text" id="ask" placeholder="e.g. What does the Home Report say about locking today?" style="flex:1"><button class="btn" id="askgo">Route</button></div><div id="ans"></div></div>
 <div class="card"><h3>Guardrails (all agents)</h3><ul class="sm" style="margin:0 0 0 18px;padding:0;color:var(--mut)"><li>Nothing consumer-facing sends without an approval item</li><li>RESPA §8: no value for loan referrals; 25% fees are Realtor-to-Realtor only</li><li>Cite guideline section + effective date; say "verify current version"</li><li>Every action logged to audit_log</li><li>Estimated rates never shown as stated</li></ul></div></div>
 <div class="grid g3" id="agrid"></div>`,
 mount(){ const draw=()=>{$("#agrid").innerHTML=agents.map((a,i)=>`<div class="card"><h3>${a.n}. ${esc(a.name)}<span class="sub"><button class="sw ${a.on?"on":""}" data-i="${i}" role="switch" aria-checked="${a.on}" aria-label="Toggle ${esc(a.name)}"></button></span></h3><div class="mut sm">${esc(a.desc)}</div><div class="sm" style="margin-top:8px"><span class="tag ${a.on?"good":""}">${a.on?"running":"paused"}</span> ${esc(a.last)}</div></div>`).join(""); $$(".sw").forEach(b=>b.onclick=()=>{agents[b.dataset.i].on=!agents[b.dataset.i].on;persist();draw()})}; draw();
  const go=()=>{const q=$("#ask").value.trim(); if(!q)return; const hit=ROUTES.find(r=>r[0].test(q)); const agent=hit?hit[1]:"VANESSA (orchestrator) — no specific route; I'll ask a clarifying question";
   const extra=/home report|lock|float/i.test(q)?`<p>Home Report (${esc(report.edition)}): <b>${esc(report.headline)}</b>. Lean <b>${report.lean}</b> (${Math.round(report.conf*100)}%). Resistance 101.34 tested twice; PCE Fri 8:30 ET is event risk. <span class="mut">Internal guidance only.</span></p>`:/5\/1|arm/i.test(q)?`<p>Open <a href="#calc" onclick="store.set('calcTab','arm')">Calculators → 5/1 ARM vs Fixed</a> to see worst-case payment before recommending.</p>`:/rent|buy/i.test(q)?`<p>Open <a href="#calc" onclick="store.set('calcTab','bvr')">Calculators → Buy vs Rent</a>.</p>`:"";
   $("#ans").innerHTML=`<div class="rec"><h4>Routed to ${esc(agent)}</h4>${extra}<div class="mut sm">Output format: Summary → Details → Next actions (owner, due) → Risks. In production this calls the Claude API with the agent's project instructions.</div></div>`}; $("#askgo").onclick=go; $("#ask").onkeydown=e=>{if(e.key==="Enter")go()}; }};

PAGE.workflows={ html:()=>`<div class="card"><h3>Workflow catalog <span class="sub">${WORKFLOWS.length} here · full v3 catalog is 93 (blueprint §21.2) · n8n primary</span></h3>
 <div class="row"><select id="wc" style="width:auto"><option value="">All categories</option>${[...new Set(WORKFLOWS.map(w=>w.cat))].map(c=>`<option>${c}</option>`).join("")}</select><label class="chk"><input type="checkbox" id="wh"> needs human approval</label><input type="text" id="wq" placeholder="Search…" style="max-width:240px"><span class="sp"></span><span class="mut" id="wcount"></span></div></div><div id="wl"></div>`,
 mount(){ const draw=()=>{const c=$("#wc").value,h=$("#wh").checked,q=$("#wq").value.toLowerCase(); const rows=WORKFLOWS.filter(w=>(!c||w.cat===c)&&(!h||w.hitl)&&(!q||JSON.stringify(w).toLowerCase().includes(q))); $("#wcount").textContent=rows.length+" shown";
  $("#wl").innerHTML=rows.map(w=>`<details ${/^(HR|CALC)/.test(w.id)?"open":""}><summary>${w.id} — ${esc(w.name)} <span class="tag">${w.cat}</span>${w.hitl?`<span class="tag warn">human approval</span>`:""}${/^(HR|CALC)/.test(w.id)?`<span class="tag good">new</span>`:""}</summary><div class="mut sm">Trigger: ${esc(w.trigger)}</div><div class="steps" data-w="${w.id}">${w.steps.map(s=>`<span class="step">${esc(s)}</span>`).join("")}</div><div class="row" style="margin-top:8px"><button class="btn sm" data-run="${w.id}">▶ Run</button></div></details>`).join("");
  $$("[data-run]").forEach(b=>b.onclick=async()=>{const id=b.dataset.run,st=$$(`[data-w="${id}"] .step`);st.forEach(s=>s.className="step");for(const s of st){s.classList.add("run");await new Promise(r=>setTimeout(r,420));s.classList.replace("run","done")} fireWorkflow(id,{})})}; ["wc","wh","wq"].forEach(i=>$("#"+i).oninput=draw); draw(); }};

PAGE.integrations={ html:()=>`<div class="card"><h3>Integrations <span class="sub">toggle to mark connected · real credentials live in n8n / Supabase secrets, never in this page</span></h3><div class="grid g3" id="ig" style="margin-top:0"></div></div>
 <div class="card"><h3>Architecture</h3><svg viewBox="0 0 900 250" width="100%" id="arch"></svg></div>`,
 mount(){ const draw=()=>{$("#ig").innerHTML=integ.map((i,k)=>`<div class="card" style="box-shadow:none"><h3>${esc(i.n)}<span class="sub"><button class="sw ${i.ok?"on":""}" data-k="${k}" role="switch" aria-checked="${i.ok}" aria-label="Toggle ${esc(i.n)}"></button></span></h3><div class="sm">${esc(i.p)}</div><div class="mut sm">${esc(i.c)}</div><div style="margin-top:6px"><span class="tag ${i.ok?"good":"warn"}">${i.ok?"connected":"not connected"}</span>${i.key?`<button class="btn ghost sm" data-test="${i.key}">Test</button>`:""}</div></div>`).join(""); $$(".sw").forEach(b=>b.onclick=()=>{integ[b.dataset.k].ok=!integ[b.dataset.k].ok;persist();draw()});
   $$("[data-test]").forEach(b=>b.onclick=async()=>{try{if(b.dataset.test==="supabase"){await sb("/rest/v1/mbsh_home_reports?select=id&limit=1");toast("Supabase reachable")}else{if(!settings.n8n)throw new Error("Set n8n URL in Settings");const r=await fetch(settings.n8n.replace(/\/$/,"")+"/healthz");toast("n8n HTTP "+r.status)}}catch(e){toast(e.message,5000)}})}; draw();
  const layers=[["INTERFACE","Dashboard · Claude Projects · SMS/Slack brief · Voice"],["AGENTS (Claude)","VANESSA + 18 agents (Market Intel, Home Report Analyst, Rent/Buy & Debt Advisor…)"],["WORKFLOWS","n8n · Make/Pabbly backups · Claude API · cron"],["DATA","Supabase/Postgres · Follow Up Boss · ARIVE · pgvector · Drive"],["EXTERNAL","MBS Highway Home Report · Treasury/FRED · PMMS · ModelMatch · Title data · Zoom · Twilio"]];
  $("#arch").innerHTML=layers.map(([t,d],i)=>`<g style="animation:rise .5s ${i*.12}s both"><rect x="20" y="${12+i*46}" width="860" height="38" rx="9" fill="var(--panel2)" stroke="var(--line)"/><text x="34" y="${36+i*46}" style="fill:var(--acc);font-weight:700">${t}</text><text x="200" y="${36+i*46}" style="fill:var(--ink)">${d}</text></g>`).join("");
 }};

PAGE.prompts={ html:()=>`<div class="card"><h3>Claude build prompts <span class="sub">paste into Claude Code in order · also exported to docs/CLAUDE_BUILD_PROMPTS.md</span></h3>
 <div class="row"><select id="pg" style="width:auto"><option value="">All groups</option>${[...new Set(PROMPTS.map(p=>p.group))].map(g=>`<option>${g}</option>`).join("")}</select><input type="text" id="pq" placeholder="Search prompts…" style="max-width:260px"><button class="btn ghost sm" id="pall">Copy all</button></div></div><div id="pl"></div>`,
 mount(){ const draw=()=>{const g=$("#pg").value,q=$("#pq").value.toLowerCase(); $("#pl").innerHTML=PROMPTS.filter(p=>(!g||p.group===g)&&(!q||(p.title+p.body).toLowerCase().includes(q))).map(p=>`<details ${p.featured?"open":""}><summary>${p.id} — ${esc(p.title)} ${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}${p.featured?`<span class="tag good">requested</span>`:""}</summary><pre class="code">${esc(p.body)}</pre><button class="btn sm" data-c="${p.id}">Copy prompt</button></details>`).join(""); $$("[data-c]").forEach(b=>b.onclick=()=>copy(PROMPTS.find(p=>p.id===b.dataset.c).body))}; ["pg","pq"].forEach(i=>$("#"+i).oninput=draw); draw(); $("#pall").onclick=()=>copy(PROMPTS.map(p=>`## ${p.id} — ${p.title}\n${p.body}`).join("\n\n")); }};

PAGE.settings={ html:()=>`<div class="grid g2"><div class="card"><h3>Connections</h3><div class="form" style="grid-template-columns:1fr">
 <div><label>Supabase URL</label><input type="text" id="s_url" value="${esc(settings.sbUrl)}" placeholder="https://xxxx.supabase.co"></div>
 <div><label>Supabase anon key (RLS-protected; do not use the service key here)</label><input type="password" id="s_key" value="${esc(settings.sbKey)}"></div>
 <div><label>n8n base URL</label><input type="text" id="s_n8n" value="${esc(settings.n8n)}" placeholder="https://n8n.yourdomain.com"></div></div>
 <p class="mut sm">Stored in this browser's localStorage only. With these set, Home Report "Sync", the calculators' "Run in Supabase" and workflow ▶ buttons call your real endpoints.</p></div>
 <div class="card"><h3>Thresholds</h3><div class="form" style="grid-template-columns:1fr 1fr">${numf("s_refi","Refi rate trigger %",settings.refiRate,.125)}${numf("s_ticks","Rate alert: UMBS ticks",settings.alertTicks,1)}${numf("s_bp","Rate alert: 10y bp",settings.alertBp,1)}${numf("s_sla","Partner SLA (days)",settings.partnerSla,1)}</div></div></div>
 <div class="row" style="margin-top:14px"><button class="btn" id="ssave">Save</button><button class="btn ghost" id="sreset">Reset demo data</button></div>`,
 mount(){ $("#ssave").onclick=()=>{Object.assign(settings,{sbUrl:$("#s_url").value.trim(),sbKey:$("#s_key").value.trim(),n8n:$("#s_n8n").value.trim(),refiRate:val("s_refi"),alertTicks:val("s_ticks"),alertBp:val("s_bp"),partnerSla:val("s_sla")});store.set("settings",settings);toast("Settings saved")};
  $("#sreset").onclick=()=>{["approvals","tasks","pipeline","agents","integ","debts"].forEach(k=>{try{localStorage.removeItem("vanessa."+k)}catch(e){}});toast("Demo data reset — reloading");setTimeout(()=>location.reload(),600)}; }};

/* ---------- boot ---------- */
function setTheme(t){document.documentElement.dataset.theme=t;store.set("theme",t)}
const th=store.get("theme",null); if(th)setTheme(th);
$("#theme").onclick=()=>setTheme((document.documentElement.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))==="dark"?"light":"dark");
function boot(){ buildNav(); paintTicker(); clock(); setInterval(clock,30000); setInterval(tickMarket,4000); addEventListener("hashchange",route); route(); }
