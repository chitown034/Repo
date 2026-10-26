/* app63: Lender Match Pro — per-column lender drop-downs in the side-by-side. Every one of the 10 columns gets a select listing every lender
   that offers the chosen loan type (eligible, conditional and ineligible, grouped), so any lender can be swapped in without the ranking
   checkboxes; plus "Add lender" and "Reset to top 10" controls. Selections persist in lm_sel (same store the checkboxes use). */
function lmxPicks(R){const sel=store.get("lm_sel",[]).map(String);const auto=R.filter(r=>r.status!=="Ineligible").slice(0,10);return(sel.length?sel.map(n=>R.find(r=>String(r.x.n)===n)).filter(Boolean):auto).slice(0,10)}
function lmxOptions(R,cur,exclude){const g={Eligible:[],Conditional:[],Ineligible:[]};R.forEach(r=>g[r.status].push(r));return Object.entries(g).filter(e=>e[1].length).map(([k,L])=>`<optgroup label="${k} (${L.length})">${L.map(r=>`<option value="${r.x.n}"${String(r.x.n)===String(cur)?" selected":""}${exclude.has(String(r.x.n))&&String(r.x.n)!==String(cur)?" disabled":""}>${esc(r.x.name)} · ${r.score}</option>`).join("")}</optgroup>`).join("")}
if(typeof lmCompare==="function"){const c2=lmCompare;lmCompare=function(R,p){let h=c2(R,p);const pick=lmxPicks(R);if(!pick.length)return h;const chosen=new Set(pick.map(r=>String(r.x.n)));
 /* header row: replace each lender name cell with a select */
 const cells=pick.map((r,i)=>`<td style="min-width:190px;vertical-align:top"><select class="lmx-col" data-i="${i}" style="width:100%;font-weight:600">${lmxOptions(R,r.x.n,chosen)}</select><div class="mut sm">${esc(String(r.x.status||"").slice(0,40))}</div><button class="btn ghost sm lmx-rm" data-i="${i}" title="Remove column">✕</button></td>`).join("");
 h=h.replace(/<tr><td class="mut"[^>]*><b>Lender<\/b><\/td>[\s\S]*?<\/tr>/,`<tr><td class="mut" style="position:sticky;left:0;background:var(--card,#fff);min-width:150px"><b>Lender</b><div class="sm mut">pick any lender per column</div></td>${cells}</tr>`);
 /* controls above the table */
 const add=pick.length<10?`<select id="lmx_add" style="width:auto;max-width:260px"><option value="">+ Add lender to compare…</option>${lmxOptions(R,"",chosen)}</select>`:`<span class="sm mut">10 columns (max)</span>`;
 h=h.replace('<button class="btn ghost sm" id="lm_clrsel">Auto top 10</button>',`${add}<button class="btn ghost sm" id="lm_clrsel">Reset to top 10</button><button class="btn ghost sm" id="lmx_all">All eligible (first 10)</button>`);return h}}
document.addEventListener("change",e=>{const t=e.target;if(!t||!t.classList)return;const RP=window._LE_RP||{};const R=RP.R;if(!R)return;
 if(t.classList.contains("lmx-col")){const pick=lmxPicks(R).map(r=>String(r.x.n));pick[+t.dataset.i]=t.value;store.set("lm_sel",[...new Set(pick)]);const g=document.getElementById("lm_go");if(g)g.click()}
 if(t.id==="lmx_add"&&t.value){const pick=lmxPicks(R).map(r=>String(r.x.n));if(!pick.includes(t.value))pick.push(t.value);store.set("lm_sel",pick.slice(0,10));const g=document.getElementById("lm_go");if(g)g.click()}});
document.addEventListener("click",e=>{const t=e.target;if(!t||!t.classList)return;const RP=window._LE_RP||{};const R=RP.R;if(!R)return;
 if(t.classList.contains("lmx-rm")){const pick=lmxPicks(R).map(r=>String(r.x.n));pick.splice(+t.dataset.i,1);store.set("lm_sel",pick);const g=document.getElementById("lm_go");if(g)g.click()}
 if(t.id==="lmx_all"){store.set("lm_sel",R.filter(r=>r.status!=="Ineligible").slice(0,10).map(r=>String(r.x.n)));const g=document.getElementById("lm_go");if(g)g.click()}});
