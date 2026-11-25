/* app92: Real Closing Disclosure, field by field (v144) — LE & CD Decoder tab "Real CD — every field".
   Shows the official CFPB sample Closing Disclosure (form H-25(B), fixed-rate purchase; public-domain federal model form) as page
   images with a hotspot over every field (cdmap.js, placed from the PDF's own text coordinates by scripts/build-cdmap.py).
   Tap any field → what it is · this sample's number and where it comes from · the rule (TRID / RESPA / HPA / ECOA / CA) · how to
   say it to the borrower (copy) · what to check against the Loan Estimate. Walk-through mode steps through all fields in reading
   order; "Copy full borrower walkthrough" exports every script. Agent tool: cd_field_explain. */
let cdrPage=1,cdrSel=null,cdrQ="";
const cdrF=()=>((window.CD_MAP||{}).fields||[]);
const cdrById=id=>cdrF().find(f=>f.id===id);
const CDR_PG=["Page 1 — Loan terms, payments, costs at closing","Page 2 — Closing cost details","Page 3 — Cash to close & summaries","Page 4 — Loan disclosures & escrow","Page 5 — Loan calculations, other disclosures, contacts"];
const CDR_CSS=`.cdr-wrap{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;margin-top:16px;align-items:start}
.cdr-doc{position:relative;width:100%;border-radius:10px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.12);background:#fff}
.cdr-doc img{display:block;width:100%;height:auto;user-select:none}
.cdr-hs{position:absolute;border-radius:4px;cursor:pointer;background:rgba(0,122,255,.06);outline:1px solid rgba(0,122,255,.22);transition:background .15s,outline-color .15s}
.cdr-hs:hover{background:rgba(0,122,255,.16);outline-color:rgba(0,122,255,.6)}
.cdr-hs.on{background:rgba(255,159,10,.22);outline:2px solid #ff9f0a;z-index:2}
.cdr-hs:focus-visible{outline:2px solid var(--acc)}
.cdr-panel{position:sticky;top:86px}
.cdr-panel h4{margin:12px 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--mut)}
.cdr-panel p{margin:0;line-height:1.5}
.cdr-say{background:color-mix(in srgb,var(--acc) 9%,transparent);border-left:3px solid var(--acc);padding:10px 12px;border-radius:8px;font-size:14px}
.cdr-val{font-variant-numeric:tabular-nums;font-weight:600}
.cdr-list{max-height:280px;overflow:auto;margin-top:8px}.cdr-list button{display:block;width:100%;text-align:left;border:0;background:none;padding:6px 8px;border-radius:8px;cursor:pointer;color:inherit;font:inherit;font-size:13px}
.cdr-list button:hover{background:var(--sel,rgba(0,0,0,.05))}.cdr-list button.on{background:var(--chip);color:var(--acc);font-weight:600}
.cdr-tabs{display:flex;gap:6px;flex-wrap:wrap}
@media(max-width:900px){.cdr-wrap{grid-template-columns:1fr}.cdr-panel{position:static}}`;
{const st=document.createElement("style");st.textContent=CDR_CSS;document.head.appendChild(st)}
function cdrPanel(f){if(!f)return`<div class="card cdr-panel"><h3 style="margin:0">Tap any field on the form</h3><p class="mut" style="margin-top:6px">Every box on the Closing Disclosure is clickable. You'll see what it is, where the number comes from, the rule behind it, exactly how to explain it to your borrower, and what to check against the Loan Estimate.</p><div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" id="cdr_start">Walk me through every field</button><button class="btn ghost" id="cdr_all">Copy full borrower walkthrough</button></div>${cdrListHtml()}</div>`;
 const F=cdrF(),i=F.indexOf(f);
 return`<div class="card cdr-panel" aria-live="polite"><div class="row" style="gap:8px;align-items:flex-start"><div class="sp"><span class="tag">Page ${f.p} · ${i+1} of ${F.length}</span><h3 style="margin:6px 0 0">${esc(f.t)}</h3>${f.v?`<div class="cdr-val" style="margin-top:4px">${esc(f.v)}</div>`:""}</div></div>
 <h4>What it is</h4><p>${esc(f.what)}</p>
 ${f.rule?`<h4>The rule</h4><p>${esc(f.rule)}</p>`:""}
 <h4>Say it to your borrower</h4><div class="cdr-say">${esc(f.say)}</div>
 ${f.check?`<h4>Check before closing</h4><p>${esc(f.check)}</p>`:""}
 <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn ghost sm" id="cdr_prev" ${i?"":"disabled"} aria-label="Previous field">‹ Previous</button><button class="btn sm" id="cdr_next" ${i<F.length-1?"":"disabled"} aria-label="Next field">Next ›</button><button class="btn ghost sm" id="cdr_cp">Copy script</button><button class="btn ghost sm" id="cdr_x">All fields</button></div></div>`}
function cdrListHtml(){const F=cdrF().filter(f=>f.p===cdrPage&&(!cdrQ||(f.t+" "+f.what+" "+f.v).toLowerCase().includes(cdrQ)));return`<input id="cdr_q" type="search" placeholder="Find a field (e.g., prepaid interest, APR, seller credit)" value="${esc(cdrQ)}" style="margin-top:12px"><div class="cdr-list" role="list">${F.map(f=>`<button data-f="${f.id}" class="${cdrSel===f.id?"on":""}">${esc(f.t)}</button>`).join("")||'<p class="mut sm" style="padding:6px 8px">No match on this page.</p>'}</div>`}
function cdrHtml(){const M=window.CD_MAP;if(!M)return`<div class="card"><p class="mut">The Closing Disclosure images aren't loaded.</p></div>`;const sel=cdrSel&&cdrById(cdrSel);if(sel)cdrPage=sel.p;
 const hs=cdrF().filter(f=>f.p===cdrPage).slice().sort((a,b)=>b.b[2]*b.b[3]-a.b[2]*a.b[3]).map(f=>`<div class="cdr-hs${cdrSel===f.id?" on":""}" role="button" tabindex="0" aria-label="${esc(f.t)}" title="${esc(f.t)}" data-f="${f.id}" style="left:${f.b[0]}%;top:${f.b[1]}%;width:${f.b[2]}%;height:${f.b[3]}%"></div>`).join("");
 return`<div class="card"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:center"><div class="sp"><h3 style="margin:0">A real Closing Disclosure, field by field</h3><p class="mut sm" style="margin:4px 0 0">The CFPB's official sample: ${esc(M.form)}. a $180,000 purchase, $162,000 fixed-rate loan at 3.875% with mortgage insurance. Names and numbers are the government's sample, not a real borrower. ${cdrF().length} fields explained.</p></div>
 <a class="btn ghost sm" href="${esc(M.src)}" target="_blank" rel="noopener">Official PDF</a></div>
 <div class="cdr-tabs" role="tablist" style="margin-top:10px">${CDR_PG.map((t,i)=>`<button role="tab" aria-selected="${cdrPage===i+1}" class="btn sm ${cdrPage===i+1?"":"ghost"} cdr_pg" data-p="${i+1}" title="${esc(t)}">Page ${i+1}</button>`).join("")}<span class="mut sm" style="align-self:center;margin-left:6px">${esc(CDR_PG[cdrPage-1].split(" — ")[1])}</span></div></div>
 <div class="cdr-wrap"><div><div class="cdr-doc" id="cdr_doc"><img src="${esc(M.pages[cdrPage-1])}" alt="Closing Disclosure ${esc(CDR_PG[cdrPage-1])}" width="1105" height="1430">${hs}</div><p class="mut sm" style="margin:8px 2px 0">Tap a highlighted box. Use ← → to move field to field.</p></div><div id="cdr_side">${cdrPanel(sel)}</div></div>`}
function cdrGo(id,scroll){cdrSel=id;try{route()}catch(e){}if(scroll){const p=$("#cdr_side");const h=$(".cdr-hs.on");if(innerWidth<=900&&p)p.scrollIntoView({behavior:"smooth",block:"start"});else if(h)h.scrollIntoView({behavior:"smooth",block:"center"})}}
function cdrAll(){return"HOW TO WALK YOUR BORROWER THROUGH THE CLOSING DISCLOSURE\n(CFPB sample H-25(B); replace the sample numbers with your borrower's)\n\n"+cdrF().map((f,i)=>`${i+1}. ${f.t} (page ${f.p})${f.v?" — "+f.v:""}\n   Say: ${f.say.replace(/^"|"$/g,"")}${f.check?"\n   Check: "+f.check:""}`).join("\n\n")+"\n\nSteven Shearrill · NMLS 2449246 · CA DRE 01988316 · Patriot Pacific Financial Corp NMLS 1921615"}
let cdrKey=null;
function cdrMount(){$$(".cdr_pg").forEach(b=>b.onclick=()=>{cdrPage=+b.dataset.p;cdrSel=null;try{route()}catch(e){}});
 $$(".cdr-hs").forEach(h=>{h.onclick=()=>cdrGo(h.dataset.f,true);h.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cdrGo(h.dataset.f,true)}}});
 $$(".cdr-list button[data-f]").forEach(b=>b.onclick=()=>cdrGo(b.dataset.f,true));
 const q=$("#cdr_q");if(q){q.oninput=()=>{cdrQ=q.value.trim().toLowerCase();const l=$(".cdr-list");if(l){const tmp=document.createElement("div");tmp.innerHTML=cdrListHtml();l.replaceWith(tmp.querySelector(".cdr-list"));$$(".cdr-list button[data-f]").forEach(b=>b.onclick=()=>cdrGo(b.dataset.f,true))}}}
 const F=cdrF(),i=F.findIndex(f=>f.id===cdrSel);
 const go=k=>{const n=F[i+k];if(n)cdrGo(n.id,true)};
 const p=$("#cdr_prev"),n=$("#cdr_next");if(p)p.onclick=()=>go(-1);if(n)n.onclick=()=>go(1);
 const c=$("#cdr_cp");if(c)c.onclick=()=>{const f=F[i];copy(f.say.replace(/^"|"$/g,""));toast("Script copied")};
 const x=$("#cdr_x");if(x)x.onclick=()=>{cdrSel=null;try{route()}catch(e){}};
 const s=$("#cdr_start");if(s)s.onclick=()=>cdrGo(F[0].id,true);
 const a=$("#cdr_all");if(a)a.onclick=()=>{copy(cdrAll());toast(`Copied all ${F.length} field scripts`)};
 if(cdrKey)document.removeEventListener("keydown",cdrKey);cdrKey=e=>{if(location.hash!=="#lecd"||ldTab!=="cdreal")return;if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||""))return;if(e.key==="ArrowRight"){e.preventDefault();const j=F.findIndex(f=>f.id===cdrSel);const t=F[j+1]||F[0];cdrGo(t.id,true)}else if(e.key==="ArrowLeft"){e.preventDefault();const j=F.findIndex(f=>f.id===cdrSel);if(j>0)cdrGo(F[j-1].id,true)}else if(e.key==="Escape"&&cdrSel){cdrSel=null;try{route()}catch(e2){}}};document.addEventListener("keydown",cdrKey)}
if(typeof ldMount==="function"){const m0=ldMount;ldMount=function(){m0.apply(this,arguments);if(ldTab==="cdreal")cdrMount()}}
if(typeof TITLES!=="undefined"&&typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^(closing disclosure|real cd|explain (the )?cd|cd walkthrough|walk through closing disclosure)/i,{hash:"lecd"}]);
if(typeof PB_TOOLS==="function"){const t0=PB_TOOLS;PB_TOOLS=()=>[...t0(),{name:"cd_field_explain",description:"Explain any field on the Closing Disclosure (official CFPB sample H-25(B)): what it is, the sample value, the rule (TRID/RESPA/HPA/ECOA/CA), how to explain it to a borrower, and what to check against the Loan Estimate. Pass query (e.g. 'prepaid interest', 'APR', 'aggregate adjustment', 'seller credits') or page (1-5) for every field on that page.",inputSchema:{type:"object",properties:{query:{type:"string"},page:{type:"number"}}},execute:async i=>{i=i||{};const q=String(i.query||"").toLowerCase();let F=cdrF();if(i.page)F=F.filter(f=>f.p===+i.page);if(q)F=F.filter(f=>(f.t+" "+f.what+" "+f.v+" "+f.rule).toLowerCase().includes(q));return{count:F.length,fields:F.slice(0,i.page?60:8).map(f=>({page:f.p,field:f.t,sample:f.v,what:f.what,rule:f.rule,say:f.say,check:f.check})),source:(window.CD_MAP||{}).src}}}]}
