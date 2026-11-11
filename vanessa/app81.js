/* app81: SkillTree agents installed in the AI Call Center ISA — the six agents from Steven's SkillTree "AI workforce plan" (Mortgage Broker):
   Proposal Generation, Follow-Up Drafting, Meeting Booking (Deals) · Personalization Research, List Building, Cold Email Drafting (Sales).
   Each follows its SKILL.md: read the context file + voice file first, read the whole thread (never the last message alone), name the stage
   (new lead / warm / went quiet / ready to buy) and why, draft the next move in Steven's voice using only facts from the context files,
   flag anything uncertain, log every run, and queue the draft for approval. Drafts only: approving makes a Gmail DRAFT, a board card or an
   ISA call draft — nothing is sent, posted, booked or dialed from here. Mortgage compliance layered on top (no rate/APR/payment/fee unless it is
   in the context file or the input; NMLS/DRE on written drafts; out-of-state routing; TCPA/DNC; LO Comp Rule — never steer by compensation). */
const ST_CTX_KEY="st_ctx",ST_Q="st_queue",ST_LOG="st_log";
const ST_CTX_DEF={
 voice:{f:"voice.md",n:"Voice",t:`# voice.md — how Steven writes
- Retired Navy Chief. Direct, warm, plain English. Short sentences, one idea per line. No hype, no exclamation-mark spam.
- Leads with what the client gets, then the one next step. Ends with a clear ask (a time, a document, a yes/no).
- Uses first names. Says "I" not "we" unless it's the Patriot Pacific team.
- Signs: Steven Shearrill · Mortgage Broker · NMLS 2449246 · CA DRE #01988316 · Patriot Pacific Financial Corp, NMLS 1921615
- Never: slang, emojis in email (one is fine in a text), pressure, "act now", rate promises.

## Three real examples (paste real messages here — they beat any description)
1. [paste a real follow-up text or email Steven sent]
2. [paste a real reply to a new lead]
3. [paste a real note to a realtor partner]`},
 pricing:{f:"deals/pricing.md",n:"Pricing & proposal structure",t:`# deals/pricing.md — what a proposal may contain
## Rules
- Never state a rate, APR, payment, points or fee unless it is written in the input (current lender rate sheet, Loan Estimate or Steven's notes). Otherwise write [rate from today's rate sheet] and flag it.
- Advertised terms trigger Reg Z disclosures — if a payment or rate appears, the APR and terms must appear too.
- Options are compared on borrower outcome (cash to close, payment, total cost, fit). Never on what Patriot Pacific earns (LO Comp Rule, 12 CFR 1026.36(e)).
## Proposal structure (in this order)
1. Your situation — 2-3 lines, their words.
2. Your goal — one line.
3. Options (2-3) — program, why it fits, key trade-off. Numbers only from the rate sheet / LE in the input.
4. Estimated cash to close and what's in it (from the LE when available).
5. What I need from you — documents checklist.
6. Next step and timeline — one clear ask.
7. Disclosures: "This is not a commitment to lend. Rates and terms are subject to change and credit approval." + NMLS/DRE line.
## Fees we can name (fill)
- Appraisal: [fill] · Credit report: [fill] · Lender fees: per lender LE · Broker compensation: per Loan Estimate (do not state here)`},
 cadence:{f:"deals/follow-up-cadence.md",n:"Follow-up cadence",t:`# deals/follow-up-cadence.md
- New web lead: call within 5 minutes (ISA speed-to-lead), text + email same hour.
- No reply: day 1 text, day 2 email, day 4 call, day 7 text, day 14 email with something useful (VA video, guide), day 30 check-in, then monthly market note.
- After a consult with no decision: day 2 recap email, day 5 call, day 10 "anything I can answer?", then monthly.
- Pre-approved, not under contract: weekly touch; tell the agent partner when anything changes.
- Went quiet after docs request: day 2 reminder with the exact missing list, day 5 call, day 10 last nudge then park.
- Stop immediately on "stop", "not interested", DNC, or opt-out. Texts only with consent. Calls 8am–9pm the lead's local time (TCPA), honor state rules.
- Every nudge adds value (a link, an answer, a number from the file) — never "just checking in".
- Links: apply https://1921615.my1003app.com/2449246/register?time=1722983493450 · VA videos https://valoaneducator.tv/stevenshearrill-2449246 · guide https://patriotpacific.com/stevenshearrill/`},
 booking:{f:"deals/booking-rules.md",n:"Booking rules",t:`# deals/booking-rules.md
- Consult types: 15-min intro call (phone), 30-min strategy consult (Zoom or phone), 45-min reverse-mortgage consult (spouse/family welcome).
- Hours: Mon–Fri 9:00–6:00 PT, Sat 10:00–2:00 PT. No Sundays. Leave 15 min between calls.
- Offer exactly 2–3 specific times in the lead's time zone, or the booking link: [paste TidyCal link].
- Confirm: name, best phone, property state, purchase or refi. Out-of-state (not CA, IL, NV, FL, AZ) → referral form + Charles's link, do not book a loan consult with Steven.
- Never book on the lead's behalf — the draft offers times; Steven or the lead confirms.`},
 icp:{f:"sales/icp.md",n:"Ideal customer (ICP)",t:`# sales/icp.md — who Steven serves
- Veterans, active duty, Guard/Reserve, surviving spouses — VA purchase, IRRRL, VA cash-out (San Diego & Riverside counties first).
- First-time buyers in San Diego / Temecula / Murrieta — FHA, conventional, CalHFA/DPA.
- Self-employed and 1099 borrowers — bank-statement, P&L, DSCR (non-QM).
- Homeowners 62+ — reverse mortgage / HECM for purchase.
- Investors — DSCR, cash-out.
- Realtor partners — buyer agents who work with veterans and first-time buyers.
- Licensed states: CA, IL, NV, FL, AZ (Steven). Patriot Pacific is licensed in 43 states + DC — other states go to the referral form.
- Fit signals: PCS orders, separation date, new job, rent ≥ $2,500, lease ending, baby/marriage, equity + high-rate debt, retirement.
- Sources already in use: Speed-to-Lead leads, Zoho CRM, GoHighLevel, open-house sign-ins, VA associations and veteran events, past clients, realtor referrals. [add others]`},
 offer:{f:"sales/offer.md",n:"Offer",t:`# sales/offer.md
- Who: Steven Shearrill, retired Navy Chief, mortgage broker at Patriot Pacific Financial Corp — shops many wholesale lenders for one borrower.
- What: VA, FHA, conventional, jumbo, non-QM (bank statement, DSCR, ITIN), reverse/HECM, refinance and cash-out.
- Why him: veteran helping veterans; broker access instead of one bank's menu; plain-English guidance start to finish.
- Free: 15-minute consult, pre-approval, VA entitlement check, rent-vs-buy and payment scenarios.
- Call to action: one link or one time — apply https://1921615.my1003app.com/2449246/register?time=1722983493450 or a 15-min call.
- Proof: [paste a review or two]
- Never: guaranteed approval, "lowest rate", rate quotes in cold outreach, government-affiliation implications for VA.`}};
const stCtx=()=>{const s=store.get(ST_CTX_KEY,{});const o={};Object.keys(ST_CTX_DEF).forEach(k=>o[k]=typeof s[k]==="string"&&s[k].trim()?s[k]:ST_CTX_DEF[k].t);return o};
const ST_AGENTS=[
 {k:"proposal",n:"Proposal Generation",cat:"Deals",ic:"📄",hrs:1.5,ctx:"pricing",rep:"writing proposals and quotes",reads:"Google Drive and Notion, plus the call transcript, your pricing file and past proposals",out:"a full proposal draft in your structure",inp:"Paste the call transcript or consult notes, plus any rate sheet / Loan Estimate figures",mode:"thread"},
 {k:"followup",n:"Follow-Up Drafting",cat:"Deals",ic:"🔁",hrs:1.5,ctx:"cadence",rep:"chasing people who went quiet",reads:"Gmail, WhatsApp and GoHighLevel, plus the last exchange and your follow-up cadence",out:"the next nudge, drafted and queued for your approval",inp:"Paste the whole thread (or pick an ISA call / lead below)",mode:"thread"},
 {k:"booking",n:"Meeting Booking",cat:"Deals",ic:"📅",hrs:1.5,ctx:"booking",rep:"replying to leads and booking calls",reads:"Gmail, Instagram and WhatsApp, plus the thread, your calendar rules and your offer file",out:"a drafted reply with times, ready to send",inp:"Paste the lead's message / thread",mode:"thread"},
 {k:"research",n:"Personalization Research",cat:"Sales",ic:"🔎",hrs:1.5,ctx:"icp",rep:"researching prospects before I reach out",reads:"LinkedIn, GoHighLevel and Notion, plus the prospect's site, socials and recent news",out:"a one-paragraph brief and two personal openers",inp:"Prospect name, company, website or profile URL, anything you know",mode:"prospect"},
 {k:"list",n:"List Building",cat:"Sales",ic:"🧾",hrs:1.5,ctx:"icp",rep:"building lead lists",reads:"GoHighLevel, LinkedIn and Notion, plus your ideal-customer file and the sources you already use",out:"a scored list with the reason each one fits",inp:"Paste names/rows to score, or describe the list you want (e.g. 'buyer agents in Temecula who work with veterans')",mode:"list"},
 {k:"cold",n:"Cold Email Drafting",cat:"Sales",ic:"✉️",hrs:1.5,ctx:"offer",rep:"writing cold emails or DMs",reads:"Gmail, LinkedIn and Instagram, plus your offer file, your voice file and the prospect's site",out:"a first-pass email or DM per prospect, in your voice",inp:"One prospect per line: name — company/site — what you know",mode:"prospect"}];
const stA=k=>ST_AGENTS.find(a=>a.k===k)||{k:"job",n:"SkillTree job",ic:"🌳",cat:"Sales",hrs:0,ctx:"icp",rep:"",out:"a first-pass draft",reads:"",inp:"",mode:"prospect"};
const stQ=()=>store.get(ST_Q,[]),stSetQ=q=>store.set(ST_Q,q.slice(0,200));
const stLogAdd=e=>{const L=store.get(ST_LOG,[]);L.unshift(e);store.set(ST_LOG,L.slice(0,300))};
const ST_RULES=`MORTGAGE COMPLIANCE (always):
- Drafts only. Never say a message was sent, a call booked or an application taken.
- No rate, APR, payment, points or fee unless it appears in the INPUT or CONTEXT — otherwise write [from today's rate sheet] and add a flag. If a rate or payment appears, include "APR and terms subject to change and credit approval".
- Never recommend or rank a lender or product by what the broker earns (LO Comp Rule, 12 CFR 1026.36(e)).
- Written drafts end with: Steven Shearrill · NMLS 2449246 · CA DRE #01988316 · Patriot Pacific Financial Corp, NMLS 1921615.
- Steven is licensed only in CA, IL, NV, FL, AZ. If the property state is anything else, do not draft a loan pitch or book a consult — draft a short note pointing to the Out-of-State Referral form https://patriotpacific.com/... (use exactly: https://patriotpacificmlo.com/out-of-state-referral/) and flag it.
- Respect opt-outs/DNC; texts only with consent; no calls outside 8am–9pm the lead's local time. No "guaranteed approval", "lowest rate", or anything implying VA/government affiliation.
- Use only facts from CONTEXT and INPUT. If it isn't written down, put it in "questions" instead of guessing. Never invent a price, date, time or promise.`;
const ST_SHAPE={
 proposal:'{"what":"one line: what this is","human":"one line: what needs a human","stage":"new lead|warm|went quiet|ready to buy","stage_why":"...","drafts":[{"channel":"email","subject":"...","body":"full proposal in the pricing.md structure"}],"flags":["..."],"questions":["..."]}',
 followup:'{"what":"...","human":"...","stage":"new lead|warm|went quiet|ready to buy","stage_why":"...","cadence_step":"which step of the cadence this is and when the next one is due","drafts":[{"channel":"text|email|call script","subject":"(email only)","body":"..."}],"flags":["..."],"questions":["..."]}',
 booking:'{"what":"...","human":"...","stage":"...","stage_why":"...","times":["2-3 specific proposed times with time zone, from the booking rules"],"drafts":[{"channel":"email|text","subject":"...","body":"reply offering those times or the booking link"}],"flags":["..."],"questions":["..."]}',
 research:'{"what":"...","human":"...","brief":"one paragraph: what they do, one recent signal, one likely pain, why they fit the ICP","fit":"one line: why this prospect fits, approvable in five seconds","openers":["opener 1","opener 2"],"sources":["urls used"],"flags":["..."],"questions":["..."]}',
 list:'{"what":"...","human":"...","list":[{"name":"...","type":"veteran|first-time buyer|self-employed|62+|investor|realtor partner|other","score":0,"why":"one line why it fits the ICP","source":"where it came from","next":"suggested first touch"}],"flags":["..."],"questions":["..."]}',
 cold:'{"what":"...","human":"...","drafts":[{"prospect":"name","channel":"email|LinkedIn DM|Instagram DM","subject":"(email only)","body":"short first-pass message in Steven\'s voice","fit":"one line why they fit"}],"flags":["..."],"questions":["..."]}'};
async function stRun(k,input,o){o=o||{};const a=stA(k),C=stCtx();let research=null;
 if(o.live&&(a.mode==="prospect"||a.mode==="list")&&typeof cwAsk==="function"){o.prog&&o.prog("Researching live (Claude + Google)…");
  try{research=await cwAsk(a.mode==="list"?`Find real, publicly listed candidates for this lead list for a California mortgage broker (Temecula / San Diego area). Request: ${input}\nReturn names, organization, public website or profile URL, and one public signal for each. No personal phone numbers or home addresses.`:`Research this prospect for a mortgage broker's personalized outreach: ${input}\nReport: what they do/sell, one recent public signal (news, post, listing, award) with date, one likely pain a mortgage broker could help with. Public business information only.`,{prog:o.prog})}catch(e){research={text:"(live research failed: "+((e&&e.message)||e)+")",cites:[]}}}
 o.prog&&o.prog(`${a.n} is drafting…`);
 const steps=a.cat==="Deals"?`1. Read the CONTEXT files, then the full thread/transcript in INPUT. Never answer from the last message alone.\n2. Identify the stage: new lead, warm, went quiet, ready to buy. Say which and why.\n3. Draft the next move in Steven's voice, using only prices and terms from the context file.\n4. Flag anything you are not sure of instead of guessing. Never invent a price, date or promise.`:`1. Read the CONTEXT file and the voice file first.\n2. Read everything provided about the prospect(s). Pull three specifics: what they do/sell, one recent signal, one likely pain.\n3. Draft in Steven's voice. Short. One idea per line. No opener fluff.\n4. Add a one-line note explaining why each prospect fits, so Steven can approve in five seconds.`;
 const prompt=`You are the "${a.n}" agent (${a.cat}) in Steven Shearrill's AI Call Center ISA. Steven is a mortgage broker; you take the first pass at ${a.rep} so he approves instead of produces. Output: ${a.out}.\n\nSTEPS\n${steps}\n\n${ST_RULES}\n\nCONTEXT — voice.md\n${C.voice}\n\nCONTEXT — ${ST_CTX_DEF[a.ctx].f}\n${C[a.ctx]}${a.k==="booking"?"\n\nCONTEXT — sales/offer.md\n"+C.offer:""}\n\nToday: ${new Date().toLocaleString("en-US",{timeZone:"America/Los_Angeles"})} PT.${o.state?"\nProperty/lead state: "+o.state:""}\n\nINPUT\n${String(input).slice(0,12000)}${research?"\n\nLIVE RESEARCH (Claude + Google; cite only what is here)\n"+String(research.text).slice(0,6000)+"\nSources: "+(research.cites||[]).slice(0,8).join(" "):""}\n\nReply with ONLY JSON shaped like: ${ST_SHAPE[a.k]}`;
 const out=await pbJson(prompt,"default");
 if(o.state&&typeof oosRoute==="function"){const r=oosRoute(o.state);if(r.who!=="steven"){out.flags=(out.flags||[]).concat("Out-of-state ("+r.st+"): "+r.label)}}
 if(research&&research.cites&&!out.sources)out.sources=research.cites.slice(0,8);
 const item={id:"ST"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),k,at:Date.now(),input:String(input).slice(0,4000),meta:o.meta||{},state:o.state||"",out,status:"pending"};
 const Q=stQ();Q.unshift(item);stSetQ(Q);
 stLogAdd({at:item.at,k,id:item.id,input:String(input).slice(0,200),output:String(out.what||"")+" — "+String(out.human||""),questions:(out.questions||[]).slice(0,6),flags:(out.flags||[]).length,auto:!!o.auto});
 return item}
/* approve: Gmail DRAFT (never send) / ISA call draft / board card */
async function stApprove(id,how){const Q=stQ();const it=Q.find(x=>x.id===id);if(!it)return;const d=(it.out.drafts||[])[0]||{};let msg="";
 if(how==="gmail"){const to=String(it.meta.email||prompt("Email address for the draft (a Gmail DRAFT is created — nothing is sent):","")||"").trim();if(!to)return;await pbCall("Gmail","create_draft",{to:[to],subject:String(d.subject||stA(it.k).n).slice(0,150),body:String(d.body||it.out.brief||"")});msg="Gmail draft created — review and send it yourself"}
 else if(how==="isa"&&typeof acDraft==="function"){const ph=it.meta.phone||prompt("Phone for the ISA call draft (it still needs your approval on the Command tab):","");if(!ph)return;acDraft({name:it.meta.name||"",phone:ph,email:it.meta.email||"",state:it.state||"",src:"SkillTree · "+stA(it.k).n,notes:String(d.body||"").slice(0,300),camp:it.k==="booking"?"speed":"nurture"});msg="Added to the ISA queue as a draft — approve it on the Command tab"}
 else{boardAdd({t:`${stA(it.k).ic} ${stA(it.k).n}: ${it.meta.name||String(it.out.what||"").slice(0,60)}`,d:[it.out.what,it.out.human,...(it.out.drafts||[]).map(x=>`[${x.channel}] ${x.subject?x.subject+" — ":""}${x.body}`),it.out.brief||"",...(it.out.flags||[]).map(f=>"⚠️ "+f)].filter(Boolean).join("\n\n").slice(0,4000),col:"todo"});msg="On the board"}
 it.status="approved";it.how=how;it.done=Date.now();stSetQ(Q);toast(msg,5000)}
/* ---- UI ---- */
let stSel="followup",stView="map";
const stText=it=>{const o=it.out||{};return[`${o.what||""}\n${o.human||""}`,o.stage?`Stage: ${o.stage} — ${o.stage_why||""}`:"",o.cadence_step?`Cadence: ${o.cadence_step}`:"",o.brief?`Brief: ${o.brief}`:"",o.fit?`Fit: ${o.fit}`:"",...(o.openers||[]).map((x,i)=>`Opener ${i+1}: ${x}`),...(o.times||[]).map(t=>"Time: "+t),...(o.drafts||[]).map(d=>`--- ${d.prospect?d.prospect+" · ":""}${d.channel||""}${d.subject?" · "+d.subject:""}\n${d.body||""}${d.fit?"\n(fit: "+d.fit+")":""}`),...(o.list||[]).map(r=>`${r.score} · ${r.name} (${r.type}) — ${r.why} [${r.source}] → ${r.next}`),...(o.flags||[]).map(f=>"⚠️ "+f),...(o.questions||[]).map(q=>"❓ "+q),...(o.sources||[]).map(u=>"Source: "+u)].filter(Boolean).join("\n")};
function stItemHtml(it){const a=stA(it.k),o=it.out||{};return`<div class="card" style="margin:0 0 8px;border-left:4px solid ${it.status==="pending"?"#6b46c1":"var(--good,#2e9e5b)"}">
 <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><b class="sp">${a.ic} ${esc(it.meta.job||a.n)}${it.meta.name?" · "+esc(it.meta.name):""}</b><span class="sm mut">${new Date(it.at).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}${it.status!=="pending"?" · approved → "+esc(it.how||""):""}</span></div>
 <div class="sm" style="margin:4px 0"><b>${esc(o.what||"")}</b><br><span style="color:#b7791f">${esc(o.human||"")}</span>${o.stage?`<br>Stage: <b>${esc(o.stage)}</b> — ${esc(o.stage_why||"")}`:""}</div>
 <pre class="sm" style="white-space:pre-wrap;max-height:320px;overflow:auto;background:var(--panel2,#f0f2f5);padding:8px;border-radius:6px;margin:4px 0">${esc(stText(it).split("\n").slice(o.stage?3:2).join("\n"))}</pre>
 <div class="row" style="gap:6px;flex-wrap:wrap">${it.status==="pending"?`<button class="btn sm st_ap" data-id="${it.id}" data-h="gmail">Approve → Gmail draft</button>${["followup","booking"].includes(it.k)?`<button class="btn ghost sm st_ap" data-id="${it.id}" data-h="isa">Approve → ISA call draft</button>`:""}<button class="btn ghost sm st_ap" data-id="${it.id}" data-h="board">Approve → Board</button><button class="btn ghost sm st_rj" data-id="${it.id}">Reject</button>`:""}<button class="btn ghost sm st_cp" data-id="${it.id}">Copy</button></div></div>`}
function stPickSrc(){const Q=typeof acQ==="function"?acQ().filter(e=>e.res||e.ai).slice(0,40):[];const L=(store.get("ld_leads",[])||[]).slice(0,60);
 return`<select id="st_src" style="width:auto;max-width:100%"><option value="">…or load from an ISA call / lead</option>${Q.length?`<optgroup label="ISA calls (with results)">${Q.map(e=>`<option value="ac:${esc(e.id)}">${esc(e.name||e.phone)} · ${esc((typeof acCamp==="function"?acCamp(e.camp).n:e.camp)||"")}</option>`).join("")}</optgroup>`:""}${L.length?`<optgroup label="Speed-to-Lead leads">${L.map(l=>`<option value="ld:${esc(l.id)}">${esc(l.name||l.email||l.phone||"lead")}${l.state?" · "+esc(l.state):""}</option>`).join("")}</optgroup>`:""}</select>`}
function stSrcLoad(v){if(!v)return null;const [t,id]=[v.slice(0,2),v.slice(3)];
 if(t==="ac"){const e=acQ().find(x=>x.id===id);if(!e)return null;const r=e.res||{},ai=e.ai||{};return{meta:{name:e.name,phone:e.phone,email:e.email},state:e.state||"",text:`Lead: ${e.name||""} · ${e.phone||""} · ${e.email||""} · state ${e.state||"?"}\nSource: ${e.src||""}\nNotes: ${e.notes||""}\nCampaign: ${e.camp}\nCall status: ${e.st} · answered by ${r.answeredBy||"?"}\nCall summary: ${ai.summary||r.summary||""}\nTimeline: ${ai.timeline||""} · Purpose: ${ai.purpose||""} · Next: ${ai.next_action||""}\nTranscript:\n${String(r.transcript||"").slice(0,8000)}`}}
 const l=(store.get("ld_leads",[])||[]).find(x=>x.id===id);if(!l)return null;return{meta:{name:l.name,phone:l.phone,email:l.email},state:l.state||"",text:`Lead record:\n${JSON.stringify(l,null,1).slice(0,6000)}`}}
const stHtml=()=>{const a=stA(stSel),Q=stQ(),P=Q.filter(x=>x.status==="pending"),L=store.get(ST_LOG,[]);const wk=L.filter(x=>Date.now()-x.at<7*864e5).length;
 const tabs=[["map","🌌 AI Org Map"],["agents","Agents"],["queue",`Approval queue (${P.length})`],["context","Context files"],["log","Run log"]];
 const head=`<div class="card" style="border-left:4px solid #6b46c1"><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><div class="sp"><b>🌳 SkillTree agents</b> <span class="sm mut">6 agents from your SkillTree plan · Deals + Sales · ≈ 9 hrs/wk back · drafts only — you approve what goes out</span></div><span class="sm">${wk} run(s) this week · ${P.length} waiting</span></div><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${tabs.map(t=>`<button class="btn ${stView===t[0]?"":"ghost "}sm st_v" data-v="${t[0]}">${esc(t[1])}</button>`).join("")}</div></div>`;
 if(stView==="map"&&typeof omHtml==="function")return head+omHtml("st");
 if(stView==="queue")return head+(P.length?P.map(stItemHtml).join(""):`<div class="card mut">Nothing waiting. Run an agent or turn on the daily follow-up sweep.</div>`)+(Q.filter(x=>x.status!=="pending").length?`<details class="card"><summary class="sm">Approved / rejected (${Q.filter(x=>x.status!=="pending").length})</summary>${Q.filter(x=>x.status!=="pending").slice(0,30).map(stItemHtml).join("")}</details>`:"");
 if(stView==="context"){const C=stCtx();return head+`<div class="card"><p class="sm mut" style="margin:0 0 6px">Every agent reads its context file and <b>voice.md</b> before writing a word. Pre-filled for Steven; fill the [fill] blanks and paste three real messages into voice.md. Saved in this browser. Comp terms stay out of these files.</p>${Object.keys(ST_CTX_DEF).map(k=>`<details class="card" style="margin:0 0 6px"${k==="voice"?" open":""}><summary><b>${esc(ST_CTX_DEF[k].f)}</b> <span class="sm mut">${esc(ST_CTX_DEF[k].n)} · read by ${esc(ST_AGENTS.filter(a=>a.ctx===k).map(a=>a.n).join(", ")||"all agents")}</span></summary><textarea class="st_ctx" data-k="${k}" rows="12" style="width:100%;font:12px ui-monospace,monospace">${esc(C[k])}</textarea><div class="row" style="gap:6px"><button class="btn ghost sm st_rs" data-k="${k}">Reset to starter</button><button class="btn ghost sm st_dl" data-k="${k}">Download .md</button></div></details>`).join("")}<button class="btn" id="st_csave">Save context files</button></div>`}
 if(stView==="log")return head+`<div class="card"><table class="sm"><thead><tr><th>When</th><th>Agent</th><th>Input</th><th>Output</th><th>Open questions</th></tr></thead><tbody>${L.slice(0,80).map(x=>`<tr><td>${new Date(x.at).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}${x.auto?" · auto":""}</td><td>${esc(stA(x.k).n)}</td><td>${esc(x.input)}</td><td>${esc(x.output)}${x.flags?` · ⚠️${x.flags}`:""}</td><td>${esc((x.questions||[]).join(" · "))}</td></tr>`).join("")||'<tr><td colspan="5" class="mut">No runs yet.</td></tr>'}</tbody></table><button class="btn ghost sm" id="st_logdl">Download log (CSV)</button></div>`;
 return head+`<div class="grid g3">${ST_AGENTS.map((x,i)=>`<button class="card st_pick" data-k="${x.k}" style="text-align:left;cursor:pointer;margin:0;border:${x.k===stSel?"2px solid #6b46c1":"1px solid var(--line,#dfe3e9)"}"><div class="sm mut">${i+1} · ${x.cat} · ≈ ${x.hrs} hrs/wk back</div><b>${x.ic} ${esc(x.n)}</b><div class="sm">Hands you ${esc(x.out)}.</div><div class="sm mut">Starts from ${esc(ST_CTX_DEF[x.ctx].f)} + voice.md</div></button>`).join("")}</div>
 <div class="card"><h3 style="margin:0">${a.ic} ${esc(a.n)} <span class="sub">because you said "${esc(a.rep)}"</span></h3><div class="sm mut" style="margin:2px 0 8px">Reads ${esc(a.reads)}. Hands you ${esc(a.out)}. Nothing goes out without you.</div>
 ${a.mode==="thread"?`<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px">${stPickSrc()}</div>`:""}<textarea id="st_in" rows="8" style="width:100%" placeholder="${esc(a.inp)}"></textarea>
 <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px"><input id="st_name" placeholder="Name (optional)" style="max-width:180px"><input id="st_email" placeholder="Email (for a Gmail draft)" style="max-width:220px"><input id="st_phone" placeholder="Phone (for an ISA call draft)" style="max-width:170px"><input id="st_state" placeholder="State" maxlength="2" style="max-width:70px">${a.mode!=="thread"?`<label class="sm"><input type="checkbox" id="st_live" checked> research live (Claude + Google)</label>`:""}<button class="btn" id="st_go">Run ${esc(a.n)}</button></div><div id="st_out" style="margin-top:8px"></div></div>
 <div class="card sm mut">Guardrails on every run: drafts only (approving makes a Gmail <b>draft</b>, an ISA call <b>draft</b> or a board card), only facts from the context files and input, no rates/fees unless they're in the input, NMLS/DRE line on written drafts, out-of-state leads routed to the referral form, opt-outs and calling hours honored, never steer by compensation. Every run is logged with its open questions. Daily 9:15 follow-up sweep: ${store.get("st_sweep",true)?"<b>on</b>":"off"} <button class="btn ghost sm" id="st_sw">${store.get("st_sweep",true)?"Turn off":"Turn on"}</button></div>`};
function stMount(){const R=()=>{const v=$("#ac_view");if(v&&typeof acTab!=="undefined"&&acTab==="skilltree"){v.innerHTML=stHtml();stMount()}else if($("#st_page")){$("#st_page").innerHTML=stHtml();stMount()}};
 $$(".st_v").forEach(b=>b.onclick=()=>{stView=b.dataset.v;R()});$$(".st_pick").forEach(b=>b.onclick=()=>{stSel=b.dataset.k;stView="agents";R()});
 const sw=$("#st_sw");if(sw)sw.onclick=()=>{store.set("st_sweep",!store.get("st_sweep",true));R()};
 const src=$("#st_src");if(src)src.onchange=()=>{const s=stSrcLoad(src.value);if(!s)return;$("#st_in").value=s.text;$("#st_name").value=s.meta.name||"";$("#st_email").value=s.meta.email||"";$("#st_phone").value=s.meta.phone||"";$("#st_state").value=s.state||""};
 const go=$("#st_go");if(go)go.onclick=async()=>{const inp=$("#st_in").value.trim();if(!inp){toast("Paste the thread, transcript or prospect first");return}const out=$("#st_out");go.disabled=true;
  try{const it=await stRun(stSel,inp,{live:!!($("#st_live")&&$("#st_live").checked),state:$("#st_state").value.trim().toUpperCase(),meta:{name:$("#st_name").value.trim(),email:$("#st_email").value.trim(),phone:$("#st_phone").value.trim()},prog:m=>{out.innerHTML=`<div class="sm mut">${esc(m)}</div>`}});out.innerHTML=stItemHtml(it);stWire(out,R)}
  catch(e){out.innerHTML=`<div class="sm" style="color:var(--bad)">${esc(e&&e.code==="not_granted"?"Claude isn't available in this view — open VANESSA inside claude.ai.":(e&&e.message)||String(e))}</div>`}finally{go.disabled=false}};
 $$(".st_ctx").length&&($("#st_csave").onclick=()=>{const o={};$$(".st_ctx").forEach(t=>o[t.dataset.k]=t.value);store.set(ST_CTX_KEY,o);toast("Context files saved")});
 $$(".st_rs").forEach(b=>b.onclick=()=>{const t=document.querySelector(`.st_ctx[data-k="${b.dataset.k}"]`);if(t)t.value=ST_CTX_DEF[b.dataset.k].t});
 $$(".st_dl").forEach(b=>b.onclick=()=>{const t=document.querySelector(`.st_ctx[data-k="${b.dataset.k}"]`);saveFile(ST_CTX_DEF[b.dataset.k].f.split("/").pop(),t?t.value:"","text/markdown")});
 const ld=$("#st_logdl");if(ld)ld.onclick=()=>{const L=store.get(ST_LOG,[]);saveFile("skilltree-run-log.csv",[["date","agent","input","output","open questions","auto"],...L.map(x=>[new Date(x.at).toISOString(),stA(x.k).n,x.input,x.output,(x.questions||[]).join(" | "),x.auto?"yes":""])].map(r=>r.map(c=>`"${String(c==null?"":c).replace(/"/g,'""')}"`).join(",")).join("\n"),"text/csv")};
 if(stView==="map"&&typeof omMount==="function")omMount("st",R);
 stWire(document,R)}
function stWire(root,R){root.querySelectorAll(".st_ap").forEach(b=>b.onclick=async()=>{b.disabled=true;try{await stApprove(b.dataset.id,b.dataset.h);R&&R()}catch(e){toast(typeof cxErr==="function"?cxErr(e):String((e&&e.message)||e),6000);b.disabled=false}});
 root.querySelectorAll(".st_rj").forEach(b=>b.onclick=()=>{const Q=stQ();const it=Q.find(x=>x.id===b.dataset.id);if(it){it.status="rejected";it.how="rejected";stSetQ(Q)}R&&R()});
 root.querySelectorAll(".st_cp").forEach(b=>b.onclick=()=>{const it=stQ().find(x=>x.id===b.dataset.id);if(it){copy(stText(it));toast("Copied")}})}
/* install inside the ISA */
if(typeof AC_TABS!=="undefined"&&!AC_TABS.some(t=>t[0]==="skilltree")){const i=AC_TABS.findIndex(t=>t[0]==="cmd");AC_TABS.splice(i>=0?i+1:AC_TABS.length,0,["skilltree","🌳 SkillTree Agents",()=>stHtml(),()=>stMount()])}
PAGE.skilltree={html:()=>`<div id="st_page">${stHtml()}</div>`,mount(){stMount()}};
if(typeof TITLES!=="undefined")TITLES.skilltree="🌳 SkillTree Agents (ISA)";
if(typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^(skill ?tree|proposal generation|follow.?up draft|meeting booking|personali[sz]ation research|list building|cold (email|dm))/i,{hash:"skilltree"}]);
{const O=PAGES.find(p=>p[0]==="Operate")||PAGES[0];if(O&&!O[1].some(x=>x[0]==="skilltree")){const i=O[1].findIndex(x=>x[0]==="callcenter");O[1].splice(i>=0?i+1:O[1].length,0,["skilltree","🌳 SkillTree Agents (ISA)"])}}
/* seats, coverage, scheduler, tools */
if(typeof AI_SEATS!=="undefined"&&Array.isArray(AI_SEATS))ST_AGENTS.forEach(a=>{const n=a.n+" Agent";if(!AI_SEATS.some(s=>s.n===n))AI_SEATS.push({n,r:`SkillTree ${a.cat} agent in the AI Call Center ISA: takes the first pass at ${a.rep}; hands Steven ${a.out}. Reads ${ST_CTX_DEF[a.ctx].f} + voice.md. Drafts only.`,a:"VANESSA › AI Call Center ISA › SkillTree Agents",b:"Vanessa",t:"sales",parent:"AI Call Center ISA"})});
if(typeof CV_PROCS!=="undefined"&&Array.isArray(CV_PROCS)&&!CV_PROCS.some(r=>r[1]==="SkillTree ISA agents (proposal, follow-up, booking, research, lists, cold outreach)"))CV_PROCS.push([2,"SkillTree ISA agents (proposal, follow-up, booking, research, lists, cold outreach)","skilltree callcenter","Follow-Up Drafting Agent","Vanessa","On demand + daily 9:15 follow-up sweep","Six SkillTree agents draft proposals, follow-ups, booking replies, prospect briefs, scored lists and cold outreach from the context files; approval queue → Gmail draft / ISA call draft / board","Steven approves every draft"]);
async function stSweep(){if(!store.get("st_sweep",true))return"sweep is off";const Q=typeof acQ==="function"?acQ():[];const done=new Set(stQ().map(x=>x.meta&&x.meta.src).filter(Boolean));const cut=Date.now()-2*864e5;
 const C=Q.filter(e=>(e.res||e.ai)&&(e.done||e.created||0)<cut&&!done.has("ac:"+e.id)&&!/opt.?out|dnc|not interested/i.test(JSON.stringify(e.ai||{})+(e.st||""))&&!["cancelled"].includes(e.st)).slice(0,5);let n=0;
 for(const e of C){const s=stSrcLoad("ac:"+e.id);if(!s)continue;try{const it=await stRun("followup",s.text,{state:s.state,meta:Object.assign({src:"ac:"+e.id},s.meta),auto:true});n++}catch(err){if(err&&err.code==="not_granted")break}}
 return n+" follow-up draft(s) waiting for approval"}
if(typeof AP_JOBS!=="undefined"&&!AP_JOBS.some(j=>j.k==="skilltreesweep"))AP_JOBS.push({k:"skilltreesweep",n:"SkillTree follow-up sweep (ISA calls gone quiet → drafts)",seat:"Follow-Up Drafting Agent",cad:"daily",at:9,needs:()=>typeof pbSampleFn==="function",run:stSweep});
if(typeof PB_TOOLS==="function"){const t0=PB_TOOLS;PB_TOOLS=()=>[...t0(),
 {name:"skilltree_run",description:"Run one of Steven's six SkillTree ISA agents (proposal, followup, booking, research, list, cold) on a thread, transcript or prospect. Returns the draft with stage, flags and open questions, and puts it in the approval queue. Drafts only — nothing is sent.",inputSchema:{type:"object",properties:{agent:{type:"string",enum:ST_AGENTS.map(a=>a.k)},input:{type:"string"},state:{type:"string"},name:{type:"string"},email:{type:"string"},live_research:{type:"boolean"}},required:["agent","input"]},execute:async i=>{const it=await stRun(i.agent,i.input,{live:!!i.live_research,state:String(i.state||"").toUpperCase(),meta:{name:i.name||"",email:i.email||""}});return{id:it.id,agent:stA(it.k).n,out:it.out,status:"pending approval in VANESSA › AI Call Center ISA › SkillTree Agents"}}},
 {name:"skilltree_queue",description:"List SkillTree agent drafts waiting for Steven's approval.",inputSchema:{type:"object",properties:{}},execute:()=>stQ().filter(x=>x.status==="pending").slice(0,30).map(x=>({id:x.id,agent:stA(x.k).n,name:x.meta.name||"",what:x.out.what,human:x.out.human,at:new Date(x.at).toISOString()}))}]}
