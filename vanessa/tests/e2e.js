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
 /* layout */
 await p.setViewportSize({width:390,height:800});for(const h of["leadflow","agenteng","sellbird"]){await p.evaluate(h=>location.hash="#"+h,h);await p.waitForTimeout(500);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"no sideways scroll on a phone: "+h)}
 ok(!errs.length,"no page or console errors"+(errs.length?" — "+errs.slice(0,3).join(" | "):""));
 console.log(`\n${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0)})();
