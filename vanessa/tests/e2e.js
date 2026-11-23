/* VANESSA end-to-end checks (Playwright, synthetic data only — no real contacts, no live AI or connector calls).
   node vanessa/tests/e2e.js http://localhost:8765/vanessa-dashboard.html
   Serve vanessa/dist (or a merged live copy) first, e.g.  cd vanessa/dist && python3 -m http.server 8765
   Claude sampling and connector calls are replaced by in-page stubs; every assertion prints PASS/FAIL. */
const {chromium}=require("playwright");
const URL=process.argv[2]||"http://localhost:8765/vanessa-dashboard.html";
let pass=0,fail=0;const ok=(c,msg)=>{c?pass++:fail++;console.log((c?"PASS ":"FAIL ")+msg)};
const STUB=`(()=>{window.__prompts=[];window.__mode="ok";window.__n=0;pbCall=async(srv,tool,args)=>({data:{results:[{response:{successful:true,data:{}}}]}});
 window.claude={use:async()=>{const f=async()=>({text:"x"});f.limits=async()=>({tools:{}});f.json=async(pr)=>{window.__n++;window.__prompts.push(pr);
  if(window.__mode==="transient"&&window.__n%2===1)throw{code:"overloaded",message:"overloaded"};if(window.__mode==="fail")throw{code:"invalid_request",message:"bad"};
  const a=(pr.match(/You are the "([^"]+)"/)||[])[1];
  if(/improve one AI agent/.test(pr))return{rules:["Keep texts under 40 words","No exclamation marks"],summary:"shorter"};
  if(a==="List Building")return{what:"Fit score",human:"Confirm",list:[{name:"Maria",type:"veteran",score:88,why:"VA",source:"lead",next:"call"}]};
  if(a==="Meeting Booking")return{what:"Booking reply",human:"Pick times",stage:"new lead",stage_why:"fresh",times:["Tue 10am"],drafts:[{channel:"email",subject:"Times",body:"Rates are 5.875% today. Guaranteed approval!"}]};
  if(a==="Personalization Research")return{what:"Brief",human:"Review",brief:"VA-heavy brokerage",fit:"VA",openers:["a","b"]};
  return{what:"Follow-up",human:"Review",stage:"warm",stage_why:"x",drafts:[{channel:"text",body:"Hi Maria, here is the VA video. Steven Shearrill · NMLS 2449246 · CA DRE #01988316"}]}};return f}};_pbSample=undefined;
 if(typeof cwAsk==="function")cwAsk=async()=>({text:"research",cites:[]});
 ["lw_state","st_queue","st_log","lw_ai_day","hx_traces","hx_day","hx_brk","hx_fb","st_lessons","hx_cfg","hx_rjwhy","sb_prospects","sb_cfg"].forEach(k=>store.set(k,/queue|log|traces|fb|prospects/.test(k)?[]:{}));store.set("lw_installed",0)})()`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:1000}});const errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
 await p.goto(URL);await p.waitForTimeout(2500);
 /* pages render */
 for(const h of["today","licmap","worksheets","skilltree","aiorg","leadflow","sellbird","agenteng","callcenter","market"]){await p.evaluate(h=>location.hash="#"+h,h);await p.waitForTimeout(500);ok(await p.evaluate(()=>document.body.innerText.length>800),"page renders: "+h)}
 ok(await p.evaluate(()=>!!(cwAsk.__cc&&lrfRefresh.__cc&&nwFetch.__cc&&trSweep.__cc)),"Claude Code feed wraps research, rates, news and the reg sweep");
 await p.evaluate(STUB);
 /* harness */
 const H=await p.evaluate(async()=>{const st=hxSelfTest();const r={st:st.filter(x=>!x.ok).map(x=>x.n+": "+x.why)};
  await stRun("followup","thread",{state:"CA"});r.wrapped=!!(_pbSample&&_pbSample.__hx);const t=store.get("hx_traces",[])[0];r.trace=t&&t.label==="Follow-Up Drafting"&&t.ok;
  window.__mode="transient";window.__n=0;await pbJson('You are the "Retry" agent');r.retry=store.get("hx_traces",[])[0].retries===1;window.__mode="ok";
  store.set("hx_cfg",{paused:true});try{await pbJson("x");r.pause=false}catch(e){r.pause=e.code==="paused"}store.set("hx_cfg",{});
  window.__mode="fail";for(let i=0;i<4;i++){try{await pbJson('You are the "Flaky" agent')}catch(e){}}try{await pbJson('You are the "Flaky" agent')}catch(e){r.brk=e.code==="breaker_open"}window.__mode="ok";
  r.schemas=PB_TOOLS().every(t=>t.inputSchema&&t.inputSchema.type==="object");return r});
 ok(!H.st.length,"guardrail self-tests all pass"+(H.st.length?" — "+H.st.join(" | "):""));ok(H.wrapped&&H.trace,"harness wraps and traces agent calls");ok(H.retry,"harness retries a transient error");ok(H.pause,"kill switch blocks AI");ok(H.brk,"circuit breaker opens after repeated failures");ok(H.schemas,"every agent tool has an object input schema");
 /* lead workflow */
 const W=await p.evaluate(async()=>{store.set("hx_brk",{});const now=Date.now();store.set("ld_leads",[{id:"La",name:"Maria Test",phone:"760-555-0101",email:"maria@example.com",state:"CA",ts:now-6e5,mil:"Yes"},{id:"Lb",name:"Tom Test",phone:"512-555-0102",email:"tom@example.com",state:"TX",ts:now-5e5},{id:"Lc",name:"Old Test",phone:"760-555-0103",state:"CA",ts:now-20*864e5},{id:"Ld",name:"No Test",phone:"760-555-0104",state:"CA",ts:now-3e5,outcome:"Not interested"}]);
  await lwTick(true);const q1=stQ().length;await lwTick(true);const S=lwS();const book=stQ().find(x=>x.k==="booking");return{dup:stQ().length===q1,st:[S.La.stage,S.Lb.stage,S.Lc.stage,S.Ld.stage],bookFail:book&&book.pass===false,cover:omData().filter(n=>n.kind==="job"&&n.live).length}});
 ok(W.dup,"autopilot doesn't duplicate on a second pass");ok(W.st.join()==="Contacting,Referred out,Nurture,Parked","lead stages route correctly ("+W.st.join(", ")+")");ok(W.bookFail,"non-compliant booking draft fails its checks");ok(W.cover===22,"22/22 SkillTree Sales jobs covered ("+W.cover+")");
 /* learning loop */
 const Lp=await p.evaluate(async()=>{const it=await stRun("followup","Lead A",{state:"CA"});const Q=stQ();const x=Q.find(y=>y.id===it.id);x.out.drafts[0].body="Edited by Steven";x.edited=1;stSetQ(Q);await stApprove(it.id,"board");
  const it2=await stRun("followup","Lead B",{state:"CA"});const W=store.get("hx_rjwhy",{});W[it2.id]="too pushy";store.set("hx_rjwhy",W);const Q2=stQ();Q2.find(y=>y.id===it2.id).status="rejected";stSetQ(Q2);
  hxFbScan();const fb=store.get("hx_fb",[]);await hxLearn("followup",true);window.__prompts=[];await stRun("followup","Lead C",{state:"CA"});return{fb:fb.length>=2&&fb.some(f=>f.why==="too pushy")&&fb.some(f=>f.edited),inj:window.__prompts.some(pr=>/LESSONS FROM STEVEN/.test(pr))}});
 ok(Lp.fb,"feedback loop captures edits and rejection reasons");ok(Lp.inj,"learned lessons are injected into the agent's next run");
 /* graph */
 const G=await p.evaluate(()=>{const g=hxGraph();return{n:g.N.size,e:g.E.length,route:hxRoute("insurance closing").length}});ok(G.n>300&&G.e>300,"agent graph built ("+G.n+" nodes, "+G.e+" links)");ok(G.route>0,"graph routing answers 'who handles…'");
 await p.evaluate(()=>{location.hash="#agenteng";hxTab="graph"});await p.waitForTimeout(400);await p.evaluate(()=>route());await p.waitForTimeout(1500);ok(await p.evaluate(()=>!!hxG&&hxG.P.length>10),"graph canvas animates");
 /* sellbird */
 const SB=await p.evaluate(()=>{const y=sbYaml();return{appr:/require_approval:\s*true/.test(y),book:/partner-intro/.test(y),prompt:/-b claude\/focused-bardeen-klwryi/.test(SB_MAC_PROMPT)}});ok(SB.appr&&SB.book,"Sellbird config keeps approval on and has the partner booking link");ok(SB.prompt,"Mac setup prompt clones the right branch");
 /* LE & CD decoder */
 const LD=await p.evaluate(()=>{const a=ldAnalyze(LD_SAMPLES.a),b=ldAnalyze(LD_SAMPLES.b);const fl=x=>x.flags.map(f=>f[0]+":"+f[1]).join(" | ");
  return{aJ:Math.round(a.J),aC:Math.round(a.ctc),bC:Math.round(b.ctc*100)/100,bPI:Math.round(b.piCalc*100)/100,aFl:fl(a),bFl:fl(b),lines:LD_LE.length+LD_CD.length,fees:LD_FEES.length,qm:ldQmLimit(400000)}});
 ok(LD.aJ===19120&&LD.aC===16357,"Sample A (FHA LE) totals match the document: J $19,120, cash to close $16,357");
 ok(LD.bC===120056.18,"Sample B (conventional worksheet) cash to close matches $120,056.18 ("+LD.bC+")");
 ok(LD.bPI===2590.66,"Sample B P&I recalculates to $2,590.66 ("+LD.bPI+")");
 ok(/UFMIP/.test(LD.aFl)&&/ok:FHA UFMIP/.test(LD.aFl),"FHA UFMIP checked at 1.75% of base loan");
 ok(/ok:Prepaid interest/.test(LD.aFl)&&/360-day year/.test(LD.bFl),"prepaid interest recomputed (Sample A 365-day; Sample B detected as a 360-day year)");
 ok(/warn:Discount points/.test(LD.bFl)&&/fee worksheet, not a Loan Estimate/.test(LD.bFl),"Sample B flags 1.833 points and 'worksheet is not an LE'");
 ok(/ok:Seller credit/.test(LD.bFl),"seller credit checked against the conventional LTV limit");
 ok(LD.lines>=30&&LD.fees>=25&&LD.qm===12000,"LE/CD line library ("+LD.lines+" lines, "+LD.fees+" fees) and QM 3% limit");
 for(const t of["le","cd","fees","points","conc","dec","tol"]){await p.evaluate(t=>{location.hash="#lecd";ldTab=t},t);await p.evaluate(()=>route());await p.waitForTimeout(250);ok(await p.evaluate(()=>document.body.innerText.length>1500),"LE & CD tab renders: "+t)}
 await p.evaluate(()=>{ldTab="le";route()});await p.waitForTimeout(300);await p.click('.ld_l[data-id="A-points"]');ok(/Break-even|break-even/.test(await p.textContent("#ld_det")),"tapping a line on the LE shows its explanation");
 /* Claude Code feed (db stub) */
 const CC=await p.evaluate(async()=>{const docs={},subs={},added=[];const mk=path=>({onSnapshot:(fn)=>{(subs[path]=subs[path]||[]).push(fn);if(docs[path])fn({exists:true,data:()=>docs[path]});return()=>{}},get:async()=>({exists:!!docs[path],data:()=>docs[path]})});
  const ls=[];const snap=()=>({docs:added.map((d,i)=>({id:"r"+(i+1),data:()=>d}))});const fakeDb={doc:mk,collection:(c)=>({add:async(d)=>{added.push(d);ls.forEach(f=>f(snap()));return{id:"r"+added.length}},orderBy:()=>({limit:()=>({onSnapshot:(fn)=>{ls.push(fn);fn(snap());return()=>{}}})})})};
  const prevUse=window.claude&&window.claude.use;window.claude={use:async(n)=>n==="db"?fakeDb:(prevUse?prevUse(n):null)};ccDb=null;ccSubs=false;
  const now=Date.now();docs["ccfeed/rates"]={at:now,umbs:100.5,ticks:-4,coupon:"UMBS 5.5",y10:4.11,y10bp:2,pmms:6.21,pmmsWeek:"2026-11-20",vapar:5.9,asof:"2026-11-23 10:00 ET",sources:["https://example.com/a"]};
  docs["ccfeed/news"]={at:now,items:[{topic:"rates",h:"Test headline",why:"x",date:"2026-11-22",url:"https://example.com/n",source:"Ex"}]};
  docs["ccfeed/regs"]={at:now,items:[{d:"2026-11-20",t:"Test rule ZZ unique",who:"CFPB",lvl:"federal",status:"final",what:"w",impact:"i",action:"a",url:"https://example.com/r"}]};
  store.set("cc_regs_at",0);await ccSubscribe();await new Promise(r=>setTimeout(r,50));
  const q=store.get("lrf_quote",{});const nw=store.get("nw_cache",{});const reg=store.get("reg_live",[]);
  const lr=await lrfRefresh(false);
  const qa=await ccAsk("What is the FHA MIP?",false);
  return{rates:/^Claude Code/.test(q.src)&&q.umbs===100.5,news:nw.via==="Claude Code"&&nw.items.length===1,regs:reg.some(r=>r.t==="Test rule ZZ unique"),lr:!!lr&&/^Claude Code/.test(lr.src),queued:!!qa.id&&added.length===1&&added[0].status==="pending",tools:PB_TOOLS().filter(t=>/^claude_code/.test(t.name)).length}});
 ok(CC.rates&&CC.lr,"rates ticker reads the Claude Code feed");ok(CC.news,"Headline News reads the Claude Code feed");ok(CC.regs,"regulatory tracker merges Claude Code items");ok(CC.queued,"research questions queue for Claude Code when set to Claude Code");ok(CC.tools===2,"Claude Code agent tools registered");
 await p.evaluate(()=>{location.hash="#ccresearch"});await p.waitForTimeout(400);ok(await p.evaluate(()=>document.body.innerText.includes("Research inbox")&&document.body.innerText.includes("What is the FHA MIP?")),"Claude Code Research page shows the queued question");
 /* layout */
 await p.setViewportSize({width:390,height:800});for(const h of["leadflow","agenteng","sellbird","lecd","ccresearch"]){await p.evaluate(h=>location.hash="#"+h,h);await p.waitForTimeout(500);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"no sideways scroll on a phone: "+h)}
 ok(!errs.length,"no page or console errors"+(errs.length?" — "+errs.slice(0,3).join(" | "):""));
 console.log(`\n${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0)})();
