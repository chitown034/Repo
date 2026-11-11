/* app82: AI Org Map — Steven's whole AI workforce as a living, rotating constellation in the style of his SkillTree plan.
   7 departments (Sales, Deals, Marketing, Operations, Intelligence, Customer, Back Office) ring a swirling core; every VANESSA AI seat
   is a node on its department's branches, linked to the real agent (click → who it is, what it runs, its page, run it). The 22 SkillTree
   Sales jobs are mapped onto the agents that cover them; uncovered jobs can be run once with Claude. The map rotates continuously, nodes
   drift and pulse, lit = live agent; ‹ › swing a department to the top; hover pauses; Directory lists everything with search. */
const OM_DEPTS=[
 {k:"sales",n:"SALES",tag:"targeting · outreach · sequencing",c:"#f4a261",re:/\b(lead|prospect|outreach|isa\b|cold|list build|speed.to.lead|call center|campaign|referral partner|realtor partner|farm|door|open.house|recruit|sphere|sales)/i},
 {k:"deals",n:"DEALS",tag:"replies · calls · closing · pipeline",c:"#e76f51",re:/\b(proposal|follow.?up|booking|consult|pipeline|closing|deal|scenario|pricing|lender match|quote|pre.?approv|loan officer|structur|offer|negotiat|escrow|contract)/i},
 {k:"marketing",n:"MARKETING",tag:"content · brand · distribution",c:"#9b5de5",re:/\b(content|brand|social|video|aeo|seo|ads?\b|newsletter|marketing|instagram|youtube|linkedin|podcast|blog|creative|copy|canva|press)/i},
 {k:"operations",n:"OPERATIONS",tag:"onboarding · builds · client ops",c:"#2ec4b6",re:/\b(processor|processing|file|loan step|onboard|automation|workflow|ops\b|operations|scheduler|coverage|condition|document|doc\b|underwrit|appraisal|title|disclos|tracker|inbox|calendar|chief of staff|orchestrat)/i},
 {k:"intel",n:"INTELLIGENCE",tag:"companies · people · markets",c:"#4cc9f0",re:/\b(research|market|news|regulat|intel|data|analyt|rates?\b|lender intel|guideline|watch|monitor|forecast|economi|trend)/i},
 {k:"customer",n:"CUSTOMER",tag:"support · success · community",c:"#f15bb5",re:/\b(client|journey|review|service|past client|borrower|servicing|support|success|community|retention|anniversar|gift|referral|concierge|veteran)/i},
 {k:"back",n:"BACK OFFICE",tag:"money in · books · office · people",c:"#e9c46a",re:/\b(compliance|finance|books|bookkeep|license|licens|hr\b|admin|money|comp\b|accounting|tax|ce\b|training|audit|legal|insurance|budget|payroll|expense|mentor)/i}];
const OM_COVER={"ICP Definition": "List Building Agent", "Market Mapping": "Bianca", "Trigger Detection": "PCS Relocation Specialist", "Lookalike Modeling": "Priya", "Database Mining": "GHL Inbox Agent", "Web & Maps Scraping": "Property Intel Agent", "Social Mining": "Tariq", "List Building": "List Building Agent", "Contact Enrichment": null, "Email Verification": null, "Account Enrichment": "Wren", "Fit Scoring": "Priya", "Personalization Research": "Personalization Research Agent", "Cold Email Drafting": "Cold Email Drafting Agent", "LinkedIn Messaging": "Cold Email Drafting Agent", "Proof Matching": "Delia", "Cold-Call Scripting": "Role-Play Coach", "Video Prospecting": "Rico", "Campaign Orchestration": "Nadine", "Campaign Launch": "Kenji", "Deliverability": "Call QA & TCPA Monitor", "Send Optimization": null};
const OM_SALES_JOBS=[
 ["ICP Definition","AUTO","Define who to target: segments, fit signals, disqualifiers — writes sales/icp.md.",null,/list build|icp|ideal/i],
 ["Market Mapping","AUTO","Map the market: counties, segments, partner landscape and where the volume is.",null,/market|farm|territor/i],
 ["Trigger Detection","ASSIST","Spot buying triggers: PCS orders, separations, lease ends, rate drops, new listings, life events.",null,/trigger|refi watch|rate.?drop|alert|signal/i],
 ["Lookalike Modeling","ASSIST","Find more people like your best closed clients.",null,/lookalike|past client|sphere/i],
 ["Database Mining","AUTO","Mine the CRM and past clients for dormant opportunities.",null,/database|crm|zoho|reactivat|dormant|past client/i],
 ["Web & Maps Scraping","AUTO","Pull public business listings (realtors, builders, CPAs, VA orgs) from web and maps.",null,/maps|scrap|directory|association/i],
 ["Social Mining","AUTO","Find prospects and signals on Instagram, LinkedIn, Facebook groups.",null,/social|instagram|facebook|linkedin/i],
 ["List Building","AUTO","A scored list with the reason each one fits.","list",/list build/i],
 ["Contact Enrichment","AUTO","Fill in emails, phones, brokerage, license and socials for each contact.",null,/enrich|contact/i],
 ["Email Verification","AUTO","Check emails are valid before outreach to protect deliverability.",null,/verif|deliverab/i],
 ["Account Enrichment","AUTO","Enrich partner accounts: brokerage size, production, specialties.",null,/realtor partner|brokerage|partner/i],
 ["Fit Scoring","AUTO","Score each prospect against the ICP with a one-line reason.","list",/scor|fit|triage/i],
 ["Personalization Research","AUTO","A one-paragraph brief and two personal openers.","research",/personali[sz]ation research/i],
 ["Cold Email Drafting","AUTO","A first-pass email or DM per prospect, in your voice.","cold",/cold email/i],
 ["LinkedIn Messaging","AUTO","Connection notes and DMs for LinkedIn, in your voice.","cold",/linkedin/i],
 ["Proof Matching","AUTO","Match the right review, case or result to each prospect.",null,/review|testimonial|proof|case stud/i],
 ["Cold-Call Scripting","AUTO","Call scripts and objection handling for the ISA and live calls.",null,/script|role.?play|objection|call center|isa/i],
 ["Video Prospecting","AUTO","Short personal video scripts for prospects and partners.",null,/video/i],
 ["Campaign Orchestration","AUTO","Sequence touches across call, text, email and social.",null,/campaign|sequence|cadence|drip/i],
 ["Campaign Launch","AUTO","Launch approved campaigns with compliance gates.",null,/launch|campaign|autopilot/i],
 ["Deliverability","ASSIST","Keep email and texting deliverable: domains, opt-outs, consent, A2P.",null,/deliverab|a2p|consent|opt.?out|dnc/i],
 ["Send Optimization","AUTO","Pick the best time and channel for each touch.",null,/send time|optimi|best time|timing/i]];
/* ---- data: seats → departments, jobs → seats ---- */
function omHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)/4294967296}
function omData(){const seats=(typeof AI_SEATS!=="undefined"&&Array.isArray(AI_SEATS)?AI_SEATS:[]).filter(s=>s&&s.n);const nodes=[];const seen=new Set();
 const sk=s=>s.n+"|"+(s.r||"").slice(0,40);
 seats.forEach(s=>{if(seen.has(sk(s)))return;seen.add(sk(s));const txt=`${s.n} ${s.r||""} ${s.a||""} ${(s.squads||[]).join(" ")}`;let d=null;
  if(/SkillTree (Deals)/.test(s.r||""))d="deals";else if(/SkillTree (Sales)/.test(s.r||""))d="sales";
  if(!d){let best=null,bs=0;OM_DEPTS.forEach(D=>{const m=(txt.match(new RegExp(D.re.source,"gi"))||[]).length;if(m>bs){bs=m;best=D.k}});d=best||(s.t==="compliance"||s.t==="training"||s.t==="mentor"?"back":"operations")}
  nodes.push({id:"s:"+sk(s),kind:"seat",n:s.n,d,seat:s,live:true,core:["twin","coo","exec"].includes(s.t)})});
 OM_SALES_JOBS.forEach(j=>{const ag=j[3]?seats.find(s=>s.n===(typeof ST_AGENTS!=="undefined"&&(ST_AGENTS.find(a=>a.k===j[3])||{}).n)+" Agent"):null;
  const want=OM_COVER[j[0]];const cov=ag||(want?seats.find(s=>s.n===want):null);nodes.push({id:"j:"+j[0],kind:"job",n:j[0],d:"sales",job:j,tag:j[1],agentK:j[3],cover:cov||null,live:!!cov})});
 return nodes}
/* ---- layout: department hubs on a ring, nodes on short branching chains ---- */
function omLayout(nodes){const L={};const W=2*Math.PI/OM_DEPTS.length;OM_DEPTS.forEach((D,i)=>{const list=nodes.filter(n=>n.d===D.k).sort((a,b)=>(b.kind==="job")-(a.kind==="job")||omHash(a.id)-omHash(b.id));const base=-Math.PI/2+i*W;
  const nb=Math.max(4,Math.min(13,Math.ceil(Math.sqrt(list.length*1.6))));const steps=Math.max(1,Math.ceil(list.length/nb));
  list.forEach((n,j)=>{const b=j%nb,step=Math.floor(j/nb);const spread=nb>1?(b-(nb-1)/2)/(nb-1):0;const ang=base+spread*W*.82+(omHash(n.id+"a")-.5)*.05+(step%2?.012:-.012);
   const r=.25+.58*((step+.6+(omHash(n.id+"r")-.5)*.5)/(steps+.6));n.base=base;n.ang=ang;n.r=Math.min(.86,r);n.br=b;n.step=step;n.ph=omHash(n.id+"p")*Math.PI*2;n.sz=n.core?5:n.kind==="job"?3.6:2.3+omHash(n.id+"s")*1.4});
  L[D.k]={base,list,nb}});return L}
let omState=null;
function omHtml(where){const N=omData();const live=N.filter(n=>n.live).length;const jobs=N.filter(n=>n.kind==="job");
 return`<style>.omx .btn,.omx a.btn{background:#2b3240!important;color:#e8eef7!important;border:1px solid #3d4658!important}.omx .btn:hover{background:#364056!important}</style><div class="card omx" style="padding:0;overflow:hidden;background:#1d222c;border:1px solid #2b3240;color:#dfe6f0">
 <div class="row" style="gap:10px;flex-wrap:wrap;align-items:center;padding:10px 14px;border-bottom:1px solid #2b3240"><div class="sp"><b style="letter-spacing:.12em">🌌 YOUR AI ORG</b> <span class="sm" style="color:#9aa7b8">${N.length} agents & jobs · ${live} live · ${OM_DEPTS.length} departments · linked to your VANESSA agents</span></div>
 <button class="btn ghost sm om_b" data-a="play" style="color:#dfe6f0;border-color:#3a4354">⏸ Pause</button><button class="btn ghost sm om_b" data-a="dir" style="color:#dfe6f0;border-color:#3a4354">☰ Directory</button><button class="btn ghost sm om_b" data-a="full" style="color:#dfe6f0;border-color:#3a4354">⛶ Full screen</button></div>
 <div style="position:relative" id="om_wrap_${where}"><canvas id="om_cv_${where}" style="display:block;width:100%;height:min(680px,92vw);cursor:grab;touch-action:none" aria-label="Animated map of Steven's AI agents by department. Use the Directory for a list."></canvas>
 <button class="om_b" data-a="prev" aria-label="Previous department" style="position:absolute;left:10px;bottom:12px;background:#2b3240;color:#fff;border:0;border-radius:50%;width:38px;height:38px;font-size:20px;cursor:pointer">‹</button><button class="om_b" data-a="next" aria-label="Next department" style="position:absolute;right:10px;bottom:12px;background:#2b3240;color:#fff;border:0;border-radius:50%;width:38px;height:38px;font-size:20px;cursor:pointer">›</button>
 <div id="om_tip_${where}" style="position:absolute;pointer-events:none;background:#2b3240;color:#fff;font:600 12px system-ui;padding:5px 9px;border-radius:6px;display:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.4)"></div>
 <div id="om_dir_${where}" style="position:absolute;top:0;right:0;bottom:0;width:min(340px,92%);background:#161a22;border-left:1px solid #2b3240;overflow:auto;display:none;padding:12px"></div></div>
 <div id="om_det_${where}" style="padding:10px 14px;border-top:1px solid #2b3240;min-height:44px" class="sm"><span style="color:#9aa7b8">Click any glowing node to open that agent. Drag to spin; ‹ › bring a department to the top. Sales: ${jobs.filter(j=>j.live).length} of ${jobs.length} SkillTree jobs covered by your agents.</span></div></div>`}
function omDirHtml(N,q){q=(q||"").toLowerCase();return`<div style="font:700 11px system-ui;letter-spacing:.18em;color:#9aa7b8;margin-bottom:8px">DIRECTORY <button class="om_b" data-a="dir" style="float:right;background:none;border:0;color:#9aa7b8;cursor:pointer;font-size:16px">×</button></div>
 <div style="display:flex;gap:16px;margin-bottom:8px"><div><div style="font:700 22px system-ui">${N.length}</div><div style="font-size:10px;color:#9aa7b8;letter-spacing:.1em">AGENTS & JOBS</div></div><div><div style="font:700 22px system-ui">${N.filter(n=>n.live).length}</div><div style="font-size:10px;color:#9aa7b8;letter-spacing:.1em">LIVE</div></div><div><div style="font:700 22px system-ui">${OM_DEPTS.length}</div><div style="font-size:10px;color:#9aa7b8;letter-spacing:.1em">DEPARTMENTS</div></div></div>
 <input class="om_q" placeholder="Search agents and jobs…" value="${esc(q)}" style="width:100%;background:#1d222c;border:1px solid #3a4354;color:#fff;border-radius:8px;padding:7px 9px;margin-bottom:8px">
 ${OM_DEPTS.map(D=>{const L=N.filter(n=>n.d===D.k&&(!q||(n.n+" "+((n.seat||{}).r||"")).toLowerCase().includes(q)));if(!L.length)return"";return`<div style="margin:10px 0 4px;font-weight:700"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${D.c};margin-right:6px"></span>${D.n.charAt(0)+D.n.slice(1).toLowerCase()} <span style="float:right;color:#9aa7b8">${L.length}</span></div>${L.map(n=>`<div class="om_di" data-id="${esc(n.id)}" style="display:flex;gap:8px;align-items:center;padding:4px 6px 4px 14px;border-radius:6px;cursor:pointer"><span style="width:6px;height:6px;border-radius:50%;background:${n.live?"#5be38d":"#59606e"}"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.n)}</span><span style="font-size:10px;letter-spacing:.08em;color:#9aa7b8">${n.kind==="job"?(n.live?"LIVE":n.tag):"AGENT"}</span></div>`).join("")}`}).join("")}`}
function omPageFor(s){if(!s)return"";const a=String(s.a||"");const m=a.match(/VANESSA\s*›\s*([^·(;]+)/);if(!m)return"";const want=m[1].trim().toLowerCase().replace(/[^\w ]/g,"").trim();
 for(const k in (typeof TITLES!=="undefined"?TITLES:{})){const t=String(TITLES[k]).toLowerCase().replace(/[^\w ]/g,"").trim();if(t&&(t===want||t.startsWith(want.slice(0,18))||want.startsWith(t.slice(0,18))))return k}
 for(const g of PAGES)for(const x of g[1]){const t=String(x[1]).toLowerCase().replace(/[^\w ]/g,"").trim();if(t&&(t.startsWith(want.slice(0,16))||want.startsWith(t.slice(0,16))))return x[0]}return""}
function omDetail(n,where){const el=$("#om_det_"+where);if(!el||!n)return;const D=OM_DEPTS.find(d=>d.k===n.d);let h="";
 if(n.kind==="seat"){const s=n.seat,pg=omPageFor(s);const stk=(typeof ST_AGENTS!=="undefined"?ST_AGENTS:[]).find(a=>a.n+" Agent"===s.n);
  h=`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><span style="width:10px;height:10px;border-radius:50%;background:${D.c};display:inline-block"></span><b style="font-size:14px">${esc(s.n)}</b><span style="color:#9aa7b8">${esc(D.n)} · ${s.t==="human"?"human":"AI agent"}${s.b?" · backup "+esc(s.b):""}${s.parent?" · under "+esc(s.parent):""}</span></div><div style="margin:4px 0;color:#dfe6f0">${esc(s.r||"")}</div>${s.a?`<div style="color:#9aa7b8">${esc(String(s.a).slice(0,300))}</div>`:""}
  <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${pg?`<a class="btn sm" href="#${esc(pg)}">Open ${esc(String(TITLES[pg]||pg).replace(/^\S+\s/,""))}</a>`:""}${stk?`<button class="btn sm om_run" data-k="${stk.k}">Run ${esc(stk.n)}</button>`:""}<a class="btn ghost sm" href="#aiteam" style="color:#dfe6f0">AI team roster</a></div>`}
 else{const j=n.job,c=n.cover;h=`<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><span style="width:10px;height:10px;border-radius:50%;background:${D.c};display:inline-block"></span><b style="font-size:14px">${esc(j[0])}</b><span style="color:#9aa7b8">SkillTree Sales job · ${esc(j[1])} · ${c?"<span style='color:#5be38d'>covered by your agent "+esc(c.n)+"</span>":"not yet covered by an agent"}</span></div><div style="margin:4px 0">${esc(j[2])}</div>
  <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${n.agentK?`<button class="btn sm om_run" data-k="${n.agentK}">Run ${esc((ST_AGENTS.find(a=>a.k===n.agentK)||{}).n||"")}</button>`:`<button class="btn sm om_job" data-j="${esc(j[0])}">Run this job with Claude</button>`}${c&&omPageFor(c)?`<a class="btn ghost sm" href="#${esc(omPageFor(c))}" style="color:#dfe6f0">Open ${esc(c.n)}'s desk</a>`:""}</div><div id="om_jout_${where}" style="margin-top:6px"></div>`}
 el.innerHTML=h;
 el.querySelectorAll(".om_run").forEach(b=>b.onclick=()=>{if(typeof stSel!=="undefined"){stSel=b.dataset.k;stView="agents"}if(location.hash.replace("#","")==="callcenter"&&typeof acRender==="function"){acTab="skilltree";acRender()}else location.hash="#skilltree";setTimeout(()=>{if(typeof route==="function"&&location.hash==="#skilltree")route()},30)});
 el.querySelectorAll(".om_job").forEach(b=>b.onclick=async()=>{const j=OM_SALES_JOBS.find(x=>x[0]===b.dataset.j);const what=prompt(`${j[0]}: what should it work on? (e.g. a segment, a list of names, a market)`,"");if(!what)return;const o=$("#om_jout_"+where);o.innerHTML='<span style="color:#9aa7b8">Claude is working…</span>';
  try{const it=await omRunJob(j,what);o.innerHTML=`<span style="color:#5be38d">Drafted: ${esc(it.out.what||"")}</span> — waiting in the SkillTree approval queue.`}catch(e){o.innerHTML=`<span style="color:#ff8a8a">${esc(e&&e.code==="not_granted"?"Claude isn't available in this view — open VANESSA inside claude.ai.":(e&&e.message)||String(e))}</span>`}})}
async function omRunJob(j,what){const C=typeof stCtx==="function"?stCtx():{};const live=typeof cwAsk==="function"&&/scrap|mining|mapping|enrich|trigger|market/i.test(j[0])?await cwAsk(`${j[0]} for a California mortgage broker (Temecula/San Diego; licensed CA, IL, NV, FL, AZ): ${what}. Public business information only — no personal phone numbers or home addresses.`).catch(()=>null):null;
 const out=await pbJson(`You are the SkillTree "${j[0]}" job in Steven Shearrill's AI Call Center ISA (mortgage broker). Job: ${j[2]}\nRequest: ${what}\n\n${typeof ST_RULES!=="undefined"?ST_RULES:""}\n\nCONTEXT — sales/icp.md\n${C.icp||""}\n\nCONTEXT — voice.md\n${C.voice||""}${live?"\n\nLIVE RESEARCH (Claude + Google)\n"+String(live.text).slice(0,5000)+"\nSources: "+(live.cites||[]).slice(0,8).join(" "):""}\n\nReply with ONLY JSON: {"what":"one line: what this is","human":"one line: what needs a human","result":"the work product (lists as lines, scripts as text)","flags":["..."],"questions":["..."],"sources":["urls"]}`,"default");
 out.drafts=[{channel:"note",subject:j[0],body:String(out.result||"")}];const item={id:"ST"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),k:"job",at:Date.now(),input:what,meta:{job:j[0]},state:"",out,status:"pending"};
 if(typeof stQ==="function"){const Q=stQ();Q.unshift(item);stSetQ(Q);stLogAdd({at:item.at,k:"job",id:item.id,input:(j[0]+": "+what).slice(0,200),output:String(out.what||"")+" — "+String(out.human||""),questions:(out.questions||[]).slice(0,6),flags:(out.flags||[]).length})}return item}
/* ---- animation ---- */
function omMount(where){const cv=$("#om_cv_"+where);if(!cv)return;if(omState&&omState.raf)cancelAnimationFrame(omState.raf);
 const N=omData(),L=omLayout(N);const RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 const S=omState={raf:0,rot:0,target:null,play:!RM,hover:null,sel:null,focus:null,drag:null,vel:0,t0:performance.now(),where,N,L};
 const parts=Array.from({length:260},(_,i)=>({a:omHash("p"+i)*Math.PI*2,r:Math.pow(omHash("q"+i),.7)*.17,s:.2+omHash("v"+i)*.9,c:OM_DEPTS[i%7].c,z:.6+omHash("z"+i)*1.4}));
 const ctx=cv.getContext("2d");let W=0,H=0,DPR=1;
 const size=()=>{const r=cv.getBoundingClientRect();DPR=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)};size();
 const ro=window.ResizeObserver?new ResizeObserver(size):null;ro&&ro.observe(cv);
 const P=(n,t)=>{const R=Math.min(W,H)*.47,cx=W/2,cy=H/2+8;const wob=Math.sin(t*.0009+n.ph)*.012,a=n.ang+S.rot+Math.cos(t*.0007+n.ph)*.018;return[cx+Math.cos(a)*(n.r+wob)*R,cy+Math.sin(a)*(n.r+wob)*R]};
 const hubP=(D,t)=>{const R=Math.min(W,H)*.47,cx=W/2,cy=H/2+8;const a=L[D.k].base+S.rot;return[cx+Math.cos(a)*.17*R,cy+Math.sin(a)*.17*R]};
 const deptAt=()=>{let best=null,bd=9;OM_DEPTS.forEach(D=>{let a=((L[D.k].base+S.rot)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);const d=Math.abs(a-1.5*Math.PI);if(d<bd){bd=d;best=D.k}});return best};
 function frame(t){if(!cv.isConnected){ro&&ro.disconnect();return}
  const dt=Math.min(50,t-(S.last||t));S.last=t;
  if(S.target!=null){const d=S.target-S.rot;S.rot+=d*Math.min(1,dt*.006);if(Math.abs(d)<.002){S.rot=S.target;S.target=null}}
  else if(S.drag==null){if(Math.abs(S.vel)>.00001){S.rot+=S.vel*dt;S.vel*=.94}else if(S.play&&!S.hover)S.rot+=dt*.000055}
  S.focus=deptAt();
  ctx.clearRect(0,0,W,H);
  // dotted backdrop
  ctx.fillStyle="rgba(255,255,255,.035)";for(let x=10;x<W;x+=22)for(let y=10;y<H;y+=22)ctx.fillRect(x,y,1.2,1.2);
  const cx=W/2,cy=H/2+8,R=Math.min(W,H)*.47;
  // core swirl
  parts.forEach(p=>{const a=p.a+t*.00012*p.s*(S.play?1:.15);const rr=p.r*R*.7*(1+.06*Math.sin(t*.001*p.s+p.a));ctx.globalAlpha=.55;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,p.z*.9,0,7);ctx.fill()});ctx.globalAlpha=1;
  // department labels (upright text), hubs and branches
  OM_DEPTS.forEach(D=>{const on=S.focus===D.k||(S.hover&&S.hover.d===D.k)||(S.sel&&S.sel.d===D.k);const a=L[D.k].base+S.rot;const fs=Math.max(12,Math.min(24,W/36));const lw=fs*D.n.length*.62;const lx=Math.max(lw/2+6,Math.min(W-lw/2-6,cx+Math.cos(a)*R*1.0)),ly=Math.max(fs+4,Math.min(H-22,cy+Math.sin(a)*R*.98));
   ctx.textAlign="center";ctx.font=`${on?600:400} ${fs}px Georgia, 'Times New Roman', serif`;ctx.fillStyle=on?D.c:"rgba(200,210,225,.28)";ctx.save();ctx.letterSpacing="4px";ctx.fillText(D.n,lx,ly);ctx.restore();
   ctx.font="10px system-ui";ctx.fillStyle=on?"rgba(220,230,240,.75)":"rgba(200,210,225,.2)";ctx.fillText(D.tag,lx,ly+16);
   const [hx,hy]=hubP(D,t);const list=L[D.k].list;
   // chains: hub → step0 of each branch → step1 …
   ctx.lineWidth=1;for(let b=0;b<L[D.k].nb;b++){const ch=list.filter(n=>n.br===b).sort((x,y)=>x.step-y.step);let px=hx,py=hy;ch.forEach(n=>{const [x,y]=P(n,t);ctx.strokeStyle=on?(n.live?D.c+"aa":"rgba(200,210,225,.25)"):"rgba(200,210,225,.10)";ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();px=x;py=y})}
   ctx.beginPath();ctx.arc(hx,hy,15,0,7);ctx.fillStyle="#1d222c";ctx.fill();ctx.strokeStyle=on?D.c:"rgba(200,210,225,.25)";ctx.lineWidth=on?2:1;ctx.stroke();if(on){ctx.globalAlpha=.25+.15*Math.sin(t*.003);ctx.beginPath();ctx.arc(hx,hy,22,0,7);ctx.strokeStyle=D.c;ctx.stroke();ctx.globalAlpha=1}
   ctx.font="12px system-ui";ctx.fillStyle=on?D.c:"rgba(200,210,225,.4)";ctx.fillText(String(list.length),hx,hy+4)});
  // nodes
  N.forEach(n=>{const D=OM_DEPTS.find(d=>d.k===n.d);const on=S.focus===n.d||(S.hover&&S.hover.d===n.d)||(S.sel&&S.sel.d===n.d);const [x,y]=P(n,t);n._x=x;n._y=y;
   const pulse=n.live?1+.25*Math.sin(t*.004+n.ph):1;const r=n.sz*pulse*(S.hover===n||S.sel===n?1.8:1);
   if(n.live&&on){ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(x,y,r*3,0,7);ctx.fillStyle=D.c;ctx.fill();ctx.globalAlpha=1}
   ctx.beginPath();ctx.arc(x,y,r,0,7);if(n.live){ctx.fillStyle=on?"#f6f8ff":"rgba(220,228,240,.45)";ctx.fill()}else{ctx.strokeStyle=on?"rgba(220,228,240,.8)":"rgba(200,210,225,.3)";ctx.lineWidth=1.2;ctx.stroke()}
   if(n.kind==="job"&&on){ctx.strokeStyle=D.c;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r+3,0,7);ctx.stroke()}
   if(S.sel===n){ctx.strokeStyle=D.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+7+2*Math.sin(t*.006),0,7);ctx.stroke()}});
  S.raf=requestAnimationFrame(frame)}
 S.raf=requestAnimationFrame(frame);
 const tip=$("#om_tip_"+where);const pick=(ex,ey)=>{let best=null,bd=14*14;N.forEach(n=>{const dx=n._x-ex,dy=n._y-ey,d=dx*dx+dy*dy;if(d<bd){bd=d;best=n}});return best};
 const rel=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
 cv.onpointermove=e=>{const [x,y]=rel(e);if(S.drag!=null){const a=Math.atan2(y-(H/2+8),x-W/2);let d=a-S.drag;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;S.rot+=d;S.vel=d/16;S.drag=a;return}
  const n=pick(x,y);S.hover=n;cv.style.cursor=n?"pointer":"grab";if(n){tip.style.display="block";tip.textContent=n.n+(n.kind==="job"?` · ${n.live?"covered by "+n.cover.n:n.tag}`:"");tip.style.left=Math.min(W-tip.offsetWidth-6,Math.max(6,x-tip.offsetWidth/2))+"px";tip.style.top=Math.max(4,y-38)+"px"}else tip.style.display="none"};
 cv.onpointerleave=()=>{S.hover=null;tip.style.display="none";S.drag=null};
 cv.onpointerdown=e=>{const [x,y]=rel(e);const n=pick(x,y);if(n){S.sel=n;omDetail(n,where);return}S.drag=Math.atan2(y-(H/2+8),x-W/2);S.target=null;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);cv.style.cursor="grabbing"};
 cv.onpointerup=()=>{S.drag=null;cv.style.cursor="grab"};
 const turn=dir=>{const i=OM_DEPTS.findIndex(d=>d.k===S.focus);const D=OM_DEPTS[(i+dir+OM_DEPTS.length)%OM_DEPTS.length];let tgt=1.5*Math.PI-L[D.k].base;while(tgt-S.rot>Math.PI)tgt-=2*Math.PI;while(tgt-S.rot<-Math.PI)tgt+=2*Math.PI;S.target=tgt;S.vel=0};
 const dir=$("#om_dir_"+where);const paintDir=q=>{dir.innerHTML=omDirHtml(N,q);const qi=dir.querySelector(".om_q");qi.oninput=()=>{const v=qi.value,pos=qi.selectionStart;paintDir(v);const n2=dir.querySelector(".om_q");n2.focus();n2.setSelectionRange(pos,pos)};dir.querySelectorAll(".om_b").forEach(b=>b.onclick=()=>{dir.style.display="none"});
  dir.querySelectorAll(".om_di").forEach(r=>{r.onmouseenter=()=>r.style.background="#222836";r.onmouseleave=()=>r.style.background="";r.onclick=()=>{const n=N.find(x=>x.id===r.dataset.id);if(!n)return;S.sel=n;omDetail(n,where);let tgt=1.5*Math.PI-n.ang;while(tgt-S.rot>Math.PI)tgt-=2*Math.PI;while(tgt-S.rot<-Math.PI)tgt+=2*Math.PI;S.target=tgt}})};
 const root=cv.closest(".card");root.querySelectorAll(".om_b").forEach(b=>b.onclick=()=>{const a=b.dataset.a;
  if(a==="prev")turn(-1);else if(a==="next")turn(1);
  else if(a==="play"){S.play=!S.play;b.textContent=S.play?"⏸ Pause":"▶ Play"}
  else if(a==="dir"){const v=dir.style.display==="none";dir.style.display=v?"block":"none";if(v)paintDir("")}
  else if(a==="full"){const w=$("#om_wrap_"+where);if(document.fullscreenElement)document.exitFullscreen();else(root.requestFullscreen?root.requestFullscreen():null)}});
 const pb=root.querySelector('.om_b[data-a="play"]');if(pb)pb.textContent=S.play?"⏸ Pause":"▶ Play"}
/* standalone page + nav + tool */
PAGE.aiorg={html:()=>omHtml("pg"),mount(){omMount("pg")}};
if(typeof TITLES!=="undefined")TITLES.aiorg="🌌 AI Org Map";
if(typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^(ai org|org map|skill ?tree map|constellation|agent map|my ai agents map)/i,{hash:"aiorg"}]);
{const G=PAGES.find(p=>p[0]==="AI Team & Bridges")||PAGES[0];if(G&&!G[1].some(x=>x[0]==="aiorg"))G[1].unshift(["aiorg","🌌 AI Org Map"])}
if(typeof PB_TOOLS==="function"){const t0=PB_TOOLS;PB_TOOLS=()=>[...t0(),{name:"ai_org_map",description:"Steven's AI workforce by SkillTree department (Sales, Deals, Marketing, Operations, Intelligence, Customer, Back Office): agent counts, and which of the 22 SkillTree Sales jobs are covered by which agent.",inputSchema:{type:"object",properties:{}},execute:()=>{const N=omData();return{departments:OM_DEPTS.map(D=>({dept:D.n,agents:N.filter(n=>n.d===D.k&&n.kind==="seat").length})),sales_jobs:N.filter(n=>n.kind==="job").map(n=>({job:n.n,tag:n.tag,covered_by:n.cover?n.cover.n:null}))}}}]}
