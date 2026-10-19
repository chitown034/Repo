/* ===== Global search block: searches every page, tool, Q&A, guideline, strategy, scenario, script, letter, course lesson, assistance program and tax rule; deep-links into the right page/tab with the query prefilled. Shortcut: "/" ===== */
const SEARCH_ROUTES=[
 [/^VA Q&A/, {hash:"va",tab:["vtab","qa"],input:"qa_q"}],
 [/^(FHA|Conventional|USDA|Jumbo|Non-QM|DSCR|Foreign national|ITIN|Reverse|HELOC|Construction|Renovation|Manufactured|DPA|Refinance|General|Agents & partners|First-time buyer) Q&A/, {hash:"programs",input:"lq_q",pre:(src)=>store.set("lqp","")}],
 [/^VA course/, {hash:"va",tab:["vtab","course"],input:"vc_q"}],
 [/^VA tricks|^VA tough-file/, {hash:"va",tab:["vtab","tough"]}],
 [/^VA compensating factor|^VA stable income/, {hash:"va",tab:["vtab","comp"],input:"si_q"}],
 [/^VA rental income|^VA joint loans/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","rent"]}],
 [/^VA disabled veterans/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","dis"]}],
 [/^Disabled-veteran property tax|^Disabled-veteran tax county rules/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","tax"],input:"vt_q"}],
 [/^Property tax basics/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","asr"]}],
 [/^VA EEM/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","eem"]}],
 [/^VA construction/, {hash:"va",tab:["vtab","deep"],sub:["vdtab","otc"]}],
 [/^UW discretion/, {hash:"uwadv"}],
 [/^DPA |^CA (state|regional|utilities|rent)|^Federal |^Nonprofit /, {hash:"assist",input:"as_q"}],
 [/^Strategy /, {hash:"strategies",input:"sq"}],
 [/^LOE |^Dispute /, {hash:"letters",input:"lq"}],
 [/^Scenario /, {hash:"scenarios",input:"sl_q"}],
 [/^Script /, {hash:"scripts",input:"sp_q"}],
 [/^Program table|^Guideline|^Seller credit/, {hash:"programs",input:"gd_q"}],
 [/^Wealth /, {hash:"wealth"}],
 [/^Lender /, {hash:"lenders"}],
 [/^Military pay/, {hash:"va",tab:["vtab","pay"]}],
 [/^Calculator /, {hash:"calc"}],
 [/^Page /, {}],
];
let _searchIndex=null;
function searchIndex(){if(_searchIndex)return _searchIndex;const out=[];
 PAGES.forEach(([sec,items])=>items.forEach(([id,t])=>out.push({src:`Page — ${sec}`,t,hash:id})));
 if(typeof CALCS!=="undefined")Object.entries(CALCS).forEach(([k,c])=>out.push({src:`Calculator — ${c.t||k}`,t:(c.d||c.t||k)+"",hash:"calc",calc:k}));
 if(typeof SCENARIOS!=="undefined")SCENARIOS.forEach(s=>out.push({src:`Scenario ${s.id} — ${s.t}`,t:`${s.profile} ${(s.issues||[]).join(" ")} ${(s.tags||[]).join(" ")}`}));
 if(typeof SCRIPTS!=="undefined")SCRIPTS.forEach(s=>out.push({src:`Script ${s.id} — ${s.t}`,t:`${s.when} ${s.goal}`}));
 coachCorpus().forEach(c=>out.push(c));
 _searchIndex=out;return out}
function globalSearch(q,n=40){const words=q.toLowerCase().split(/[^a-z0-9%$]+/).filter(w=>w.length>1);if(!words.length)return[];const phrase=q.toLowerCase();
 return searchIndex().map(c=>{const s=(c.src+" "+c.t).toLowerCase();let sc=0;words.forEach(w=>{if(s.includes(w))sc+=w.length>5?2:1;if(c.src.toLowerCase().includes(w))sc+=3});if(s.includes(phrase))sc+=6;if(/^Page/.test(c.src)&&sc)sc+=4;return {c,sc}}).filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,n).map(x=>x.c)}
function searchRoute(c){if(c.hash)return {hash:c.hash,calc:c.calc};for(const [re,r] of SEARCH_ROUTES)if(re.test(c.src))return r;return {hash:"coach"}}
function searchOpen(c,q){const r=searchRoute(c);if(r.pre)r.pre(c.src);if(r.tab)store.set(r.tab[0],r.tab[1]);if(r.sub)store.set(r.sub[0],r.sub[1]);if(r.calc)store.set("calcTab",r.calc);
 const target=r.hash||"coach";if(target==="coach"&&!c.hash){store.set("coachHist",[...store.get("coachHist",[]),`${c.src}: ${c.t.slice(0,300)} — explain and cite.`])}
 const go=()=>{if(!r.input)return;let tries=0;const tick=()=>{const e=$("#"+r.input);if(e){e.value=q;e.dispatchEvent(new Event("input"));e.dispatchEvent(new Event("change"));e.scrollIntoView({behavior:"smooth",block:"center"})}else if(tries++<20)setTimeout(tick,60)};setTimeout(tick,50)};
 if(location.hash==="#"+target){route();go()}else{location.hash=target;setTimeout(go,80)}
 const p=$("#gs_panel");if(p)p.classList.add("hide")}
document.addEventListener("DOMContentLoaded",()=>{const hdr=document.querySelector("header.top");if(!hdr||$("#gs_box"))return;
 const box=document.createElement("div");box.id="gs_box";box.className="gs";box.innerHTML=`<input id="gs_q" type="search" placeholder="Search everything… (press /)" autocomplete="off"><div id="gs_panel" class="gs-panel hide"></div>`;hdr.insertBefore(box,hdr.querySelector(".ticker"));
 const inp=$("#gs_q"),panel=$("#gs_panel");let sel=-1,rows=[];
 const draw=()=>{const q=inp.value.trim();if(q.length<2){panel.classList.add("hide");return}rows=globalSearch(q);sel=-1;
  if(!rows.length){panel.innerHTML=`<div class="gs-row mut">No matches — <button class="btn ghost sm" data-gs-coach>Ask the Coach</button></div>`;panel.classList.remove("hide");panel.querySelector("[data-gs-coach]").onclick=()=>{store.set("coachHist",[...store.get("coachHist",[]),q]);location.hash="coach";panel.classList.add("hide")};return}
  const groups={};rows.forEach((c,i)=>{const g=c.src.split(/ — |:/)[0].replace(/\s\w+$/,m=>/Q&A|course|tricks|factor|income|loans|veterans|tax|basics|EEM|construction|discretion|credit|pay/.test(m)?m:"").trim();(groups[g]=groups[g]||[]).push([c,i])});
  panel.innerHTML=`<div class="gs-head mut sm">${rows.length} results · ↑↓ to move · Enter to open · Esc to close</div>`+Object.entries(groups).map(([g,items])=>`<div class="gs-group">${esc(g)}</div>`+items.map(([c,i])=>`<div class="gs-row" data-i="${i}"><b>${esc(c.hash?c.t:c.src)}</b><span class="mut">${esc(c.hash?("Open "+c.src.replace(/^Page — /,"")+" › "+c.t):c.t.slice(0,140)+(c.t.length>140?"…":""))}</span></div>`).join("")).join("")+`<div class="gs-row"><button class="btn ghost sm" data-gs-coach>Ask the Coach: "${esc(q.slice(0,60))}"</button></div>`;
  panel.classList.remove("hide");$$("#gs_panel .gs-row[data-i]").forEach(r=>r.onclick=()=>searchOpen(rows[+r.dataset.i],q));panel.querySelector("[data-gs-coach]").onclick=()=>{store.set("coachHist",[...store.get("coachHist",[]),q]);location.hash="coach";panel.classList.add("hide")}};
 let t;inp.oninput=()=>{clearTimeout(t);t=setTimeout(draw,120)};inp.onfocus=()=>{if(inp.value.trim().length>=2)panel.classList.remove("hide")};
 inp.onkeydown=e=>{const items=$$("#gs_panel .gs-row[data-i]");if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(items.length-1,sel+1)}else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1)}else if(e.key==="Enter"){e.preventDefault();if(sel>=0&&items[sel])items[sel].click();else if(items[0])items[0].click();return}else if(e.key==="Escape"){panel.classList.add("hide");inp.blur();return}else return;items.forEach((r,i)=>r.classList.toggle("on",i===sel));if(items[sel])items[sel].scrollIntoView({block:"nearest"})};
 document.addEventListener("keydown",e=>{if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();inp.focus();inp.select()}});
 document.addEventListener("click",e=>{if(!box.contains(e.target))panel.classList.add("hide")});
 addEventListener("hashchange",()=>panel.classList.add("hide"));});

