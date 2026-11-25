/* app89: VANESSA design shell (v142) — Apple-style interface layer over every page.
   - Design tokens: SF system type, systemBlue/systemGreen palette, grouped backgrounds, 16–18px radii, soft shadows, translucent
     (vibrancy) sidebar and header, pill tags, quiet buttons with no underlines, focus rings. Light + dark.
   - Sidebar rebuilt from PAGES: Favorites (star any page), Recents, collapsible sections with counts; Today always first.
   - ⌘K / Ctrl+K command palette (Spotlight-style): every page + quick actions, arrow keys + Enter. "?" shows shortcuts.
   - Phone: bottom tab bar (Today · Pipeline · Search · Closings · More) and the sidebar as a slide-up sheet.
   - Today: greeting header with live glance tiles. First-run guided tour (replay from ⌘K).
   - Everything is gated by html.apple; "Classic look" (⌘K or Settings) switches back to the previous design. */
const AP_DEF_FAVS=["today","pipeline","scenario","closings","netsheet","loanlimits","lecd","market"];
const apOn=()=>store.get("ui_classic",0)!==1;
function apApply(){document.documentElement.classList.toggle("apple",apOn())}
apApply();
const AP_CSS=`
html.apple{--bg:#f5f5f7;--panel:#fff;--panel2:#f2f2f7;--ink:#1d1d1f;--mut:#6e6e73;--line:rgba(60,60,67,.13);--acc:#007aff;--acc2:#34c759;--warn:#c93400;--bad:#d70015;--good:#248a3d;--chip:rgba(0,122,255,.10);--shadow:0 1px 1px rgba(0,0,0,.03),0 4px 18px rgba(0,0,0,.05);--glass:rgba(246,246,248,.78);--sel:rgba(0,0,0,.06)}
html.apple[data-theme=dark]{--bg:#000;--panel:#1c1c1e;--panel2:#2c2c2e;--ink:#f5f5f7;--mut:#98989d;--line:rgba(84,84,88,.45);--acc:#0a84ff;--acc2:#30d158;--warn:#ff9f0a;--bad:#ff453a;--good:#30d158;--chip:rgba(10,132,255,.18);--shadow:0 1px 1px rgba(0,0,0,.4),0 6px 22px rgba(0,0,0,.35);--glass:rgba(28,28,30,.72);--sel:rgba(255,255,255,.08)}
@media(prefers-color-scheme:dark){html.apple:not([data-theme=light]){--bg:#000;--panel:#1c1c1e;--panel2:#2c2c2e;--ink:#f5f5f7;--mut:#98989d;--line:rgba(84,84,88,.45);--acc:#0a84ff;--acc2:#30d158;--warn:#ff9f0a;--bad:#ff453a;--good:#30d158;--chip:rgba(10,132,255,.18);--shadow:0 1px 1px rgba(0,0,0,.4),0 6px 22px rgba(0,0,0,.35);--glass:rgba(28,28,30,.72);--sel:rgba(255,255,255,.08)}}
html.apple body{font:14.5px/1.47 -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Segoe UI",system-ui,sans-serif;letter-spacing:-.006em;-webkit-font-smoothing:antialiased;grid-template-columns:260px 1fr}
html.apple aside{background:var(--glass);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-right:1px solid var(--line);padding:14px 10px 28px}
html.apple .brand{padding:6px 10px 10px}html.apple .logo{border-radius:10px;background:linear-gradient(160deg,#0a84ff,#5e5ce6)}
html.apple nav button{padding:6px 10px;border-radius:8px;color:var(--ink);font-size:13.5px;gap:8px;line-height:1.3}
html.apple nav button:hover{background:var(--sel)}
html.apple nav button.on{background:var(--acc);color:#fff;font-weight:500}
html.apple nav button.on .ap-star{color:#fff}
html.apple nav .badge{background:var(--bad)}
html.apple main{padding:0 28px 56px}
html.apple header.top{background:color-mix(in srgb,var(--bg) 78%,transparent);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--line);padding:16px 0 12px;margin:0 -28px;padding-left:28px;padding-right:28px}
html.apple header.top{row-gap:6px}html.apple header.top h1{order:9;flex:1 1 100%;font-size:30px;font-weight:700;letter-spacing:-.024em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
html.apple header.top .gs{flex:1 1 220px;max-width:360px}html.apple header.top .ticker{margin-left:auto}
html.apple input[type=date]{width:100%}html.apple label.sm>span.mut{display:block;margin-bottom:3px}
html.apple .ticker{font-size:12.5px;gap:14px}
html.apple .card{border:1px solid var(--line);border-radius:18px;padding:18px 20px;box-shadow:var(--shadow)}
html.apple .card .card{box-shadow:none;background:var(--panel2);border-color:transparent;border-radius:14px}
html.apple .card h3{font-size:15px;font-weight:600;letter-spacing:-.01em}
html.apple .btn{border-radius:10px;font-weight:500;padding:7px 14px;text-decoration:none!important;border:0;transition:transform .12s ease,filter .15s ease,background .15s}
html.apple .btn:hover{filter:brightness(1.06)}html.apple .btn:active{transform:scale(.97)}
html.apple .btn.sm{padding:4px 11px;border-radius:8px;font-size:12.5px}
html.apple .btn.ghost{background:var(--chip);color:var(--acc);border:0}
html.apple a.btn,html.apple a.btn *{text-decoration:none!important}
html.apple .tag{border-radius:99px;padding:2px 9px;font-weight:500}
html.apple input[type=number],html.apple input[type=text],html.apple input[type=password],html.apple input[type=search],html.apple input[type=date],html.apple input[type=email],html.apple input[type=tel],html.apple select,html.apple textarea{border-radius:10px;background:var(--panel2);border:1px solid transparent;padding:8px 10px;transition:box-shadow .15s,border-color .15s}
html.apple input:focus,html.apple select:focus,html.apple textarea:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 3px color-mix(in srgb,var(--acc) 28%,transparent)}
html.apple :focus-visible{outline:2px solid var(--acc);outline-offset:2px}
html.apple table th{font-weight:600;color:var(--mut);background:var(--panel)}html.apple tbody tr:hover{background:var(--sel)}
html.apple .kpi .v{font-weight:700;letter-spacing:-.02em}
html.apple ::selection{background:color-mix(in srgb,var(--acc) 30%,transparent)}
html.apple .grid{gap:16px}
html.apple .sp{min-width:0}html.apple #td_flow,html.apple .viz-flow{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
/* sidebar pieces */
.ap-find{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 8px;padding:7px 10px;border-radius:10px;border:0;background:var(--sel);color:var(--mut);cursor:pointer;font:inherit;font-size:13px}
.ap-find kbd,.ap-kbd{margin-left:auto;font:11px/1 -apple-system,system-ui;padding:3px 6px;border-radius:6px;background:var(--panel);border:1px solid var(--line);color:var(--mut)}
.ap-sec{display:flex;align-items:center;width:100%;gap:6px;background:none;border:0;padding:12px 10px 4px;font:600 11.5px/1 -apple-system,system-ui;color:var(--mut);cursor:pointer;letter-spacing:.01em}
.ap-sec .chev{transition:transform .2s;display:inline-block;font-size:10px}.ap-sec.shut .chev{transform:rotate(-90deg)}
.ap-sec .n{margin-left:auto;font-weight:500;opacity:.7}
.ap-grp{overflow:hidden}.ap-grp.shut{display:none}
nav button .ap-star{margin-left:auto;opacity:0;font-size:12px;color:var(--mut);padding:0 2px;border-radius:4px}
nav button:hover .ap-star,nav button .ap-star.on{opacity:1}nav button .ap-star.on{color:#ff9f0a}
nav button .badge+.ap-star{margin-left:4px}
/* palette */
.ap-scrim{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:90;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;animation:apfade .15s both}
@keyframes apfade{from{opacity:0}to{opacity:1}}
.ap-pal{width:min(640px,calc(100vw - 32px));background:var(--panel);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.3);border:1px solid var(--line);overflow:hidden;animation:appop .18s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes appop{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}
.ap-pal input{width:100%;border:0!important;background:transparent!important;font-size:19px!important;padding:16px 18px!important;box-shadow:none!important;border-bottom:1px solid var(--line)!important;border-radius:0!important}
.ap-list{max-height:52vh;overflow:auto;padding:6px}
.ap-it{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer}
.ap-it .k{font-size:11px;color:var(--mut);margin-left:auto}.ap-it.sel{background:var(--acc);color:#fff}.ap-it.sel .k{color:rgba(255,255,255,.8)}
.ap-h{font:600 11px/1 -apple-system,system-ui;color:var(--mut);padding:10px 12px 4px}
.ap-foot{display:flex;gap:14px;padding:8px 14px;border-top:1px solid var(--line);font-size:11.5px;color:var(--mut)}
/* hero */
.ap-hero{display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:14px;margin-top:18px}
.ap-hero .hi h2{font-size:26px;letter-spacing:-.02em;margin:0;font-weight:700}.ap-hero .hi p{margin:4px 0 0;color:var(--mut)}
.ap-tile{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:14px 16px;box-shadow:var(--shadow);text-decoration:none;color:inherit;display:block;transition:transform .15s}
.ap-tile:hover{transform:translateY(-2px)}.ap-tile .l{font-size:12px;color:var(--mut)}.ap-tile .v{font-size:24px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.ap-tile .s{font-size:11.5px;color:var(--mut)}
/* tab bar + sheet */
.ap-tabs{display:none}
@media(max-width:760px){
 html.apple body{grid-template-columns:1fr;padding-bottom:84px}
 html.apple aside{position:fixed;left:0;right:0;bottom:0;top:auto;height:78vh;z-index:80;transform:translateY(105%);transition:transform .28s cubic-bezier(.2,.9,.3,1);display:block;border-radius:18px 18px 0 0;border:1px solid var(--line);overflow:auto;padding:10px 12px 100px;background:var(--panel)}
 html.apple aside.open{transform:none;box-shadow:0 -20px 60px rgba(0,0,0,.25)}
 html.apple aside .brand{display:flex}html.apple nav{display:block}html.apple nav .sec{display:block}html.apple nav button{width:100%;white-space:normal;padding:10px 12px;font-size:15px}
 html.apple main{padding:0 16px 30px}html.apple header.top{margin:0 -16px;padding:10px 16px}html.apple header.top h1{font-size:26px;white-space:normal;order:-1}html.apple header.top .gs{flex:1 1 100%;max-width:none;order:10}html.apple header.top .ticker{margin-left:0;width:100%}html.apple header.top .live{font-size:11px}
 html.apple .ap-tabs{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:85;background:var(--glass);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-top:1px solid var(--line);padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}
 .ap-tabs button{flex:1;background:none;border:0;display:flex;flex-direction:column;align-items:center;gap:2px;font:500 10.5px/1.1 -apple-system,system-ui;color:var(--mut);padding:4px 0;cursor:pointer}
 .ap-tabs button svg{width:24px;height:24px}.ap-tabs button.on{color:var(--acc)}
 .ap-hero{grid-template-columns:1fr 1fr}.ap-hero .hi{grid-column:1/-1}
}
@media(min-width:761px) and (max-width:1100px){.ap-hero{grid-template-columns:repeat(2,1fr)}.ap-hero .hi{grid-column:1/-1}}
/* tour */
.ap-tour{position:fixed;z-index:95;max-width:320px;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.25);padding:14px 16px;animation:appop .2s both}
.ap-tour h4{margin:0 0 4px;font-size:15px}.ap-tour p{margin:0 0 10px;color:var(--mut);font-size:13px}
.ap-ring{position:fixed;z-index:94;border-radius:12px;box-shadow:0 0 0 4px var(--acc),0 0 0 9999px rgba(0,0,0,.25);pointer-events:none;transition:all .25s}
@media(prefers-reduced-motion:reduce){.ap-pal,.ap-scrim,.ap-tour,html.apple aside{animation:none!important;transition:none!important}}
`;
{const st=document.createElement("style");st.id="ap_css";st.textContent=AP_CSS;document.head.appendChild(st)}

/* ---------- navigation ---------- */
const apLabel=t=>String(t).replace(/^[\s\p{Extended_Pictographic}️‍]+/u,"").trim();
const apFavs=()=>store.get("nav_favs",AP_DEF_FAVS).filter(k=>PAGE[k]);
const apRecent=()=>store.get("nav_recent",[]).filter(k=>PAGE[k]);
const apTitle=k=>apLabel((typeof TITLES!=="undefined"&&TITLES[k])||(PAGES.flatMap(s=>s[1]).find(x=>x[0]===k)||[k,k])[1]);
function apItem(id,t,star=true){const fav=apFavs().includes(id);return`<button data-p="${id}" title="${esc(apLabel(t))}"><span class="ap-t">${esc(apLabel(t))}</span>${id==="today"?`<span class="badge" id="apbadge"></span>`:""}${star?`<span class="ap-star${fav?" on":""}" data-star="${id}" role="button" aria-label="${fav?"Remove from":"Add to"} Favorites" title="${fav?"Remove from":"Add to"} Favorites">${fav?"★":"☆"}</span>`:""}</button>`}
const apBuild0=buildNav;
buildNav=function(){
 if(!apOn()){apBuild0();return}
 const cur=(location.hash||"#today").slice(1),open=store.get("nav_open",{}),favs=apFavs(),rec=apRecent().filter(k=>!favs.includes(k)).slice(0,5);
 const secs=PAGES.map(([sec,items])=>{const it=items.filter(([id])=>id!=="today");const has=it.some(([id])=>id===cur);const isOpen=open[sec]!=null?open[sec]:has;return`<button class="ap-sec${isOpen?"":" shut"}" data-sec="${esc(sec)}" aria-expanded="${isOpen}"><span class="chev">▾</span>${esc(sec)}<span class="n">${it.length}</span></button><div class="ap-grp${isOpen?"":" shut"}">${it.map(([id,t])=>apItem(id,t)).join("")}</div>`}).join("");
 $("#nav").innerHTML=`<button class="ap-find" id="ap_find" type="button">⌕ Search pages & actions<kbd>⌘K</kbd></button>
  <button class="ap-sec" style="cursor:default">Favorites</button>${favs.map(k=>apItem(k,apTitle(k))).join("")}
  ${rec.length?`<button class="ap-sec" style="cursor:default">Recent</button>${rec.map(k=>apItem(k,apTitle(k),false)).join("")}`:""}${secs}`;
 $$("#nav button[data-p]").forEach(b=>b.onclick=e=>{const s=e.target.closest("[data-star]");if(s){e.stopPropagation();apToggleFav(s.dataset.star);return}location.hash=b.dataset.p;apSheet(false)});
 $$("#nav .ap-sec[data-sec]").forEach(b=>b.onclick=()=>{const o=store.get("nav_open",{});const g=b.nextElementSibling;const now=g.classList.toggle("shut");b.classList.toggle("shut",now);b.setAttribute("aria-expanded",!now);o[b.dataset.sec]=!now;store.set("nav_open",o)});
 $("#ap_find").onclick=()=>{apSheet(false);apPalette()};
 try{updateBadge()}catch(e){}
 $$("#nav button[data-p]").forEach(b=>b.classList.toggle("on",b.dataset.p===cur));
};
function apToggleFav(k){const f=apFavs();const i=f.indexOf(k);if(i>=0)f.splice(i,1);else f.push(k);store.set("nav_favs",f);buildNav();toast(i>=0?"Removed from Favorites":"Added to Favorites")}
addEventListener("hashchange",()=>{const k=(location.hash||"#today").slice(1);if(!PAGE[k])return;const r=apRecent().filter(x=>x!==k);r.unshift(k);store.set("nav_recent",r.slice(0,8));
 if(apOn()){const btn=$(`#nav .ap-grp button[data-p="${k}"]`);const g=btn&&btn.closest(".ap-grp");if(g&&g.classList.contains("shut")){g.classList.remove("shut");g.previousElementSibling.classList.remove("shut")}
  /* refresh the Recent list without losing scroll */const sc=$("aside")?$("aside").scrollTop:0;buildNav();if($("aside"))$("aside").scrollTop=sc}
 $$(".ap-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.tab===k))});

/* ---------- command palette ---------- */
const AP_ACTIONS=[
 {t:"New closing file",k:"Action",run:()=>{location.hash="closings";setTimeout(()=>{const n=$("#cl_name");if(n)n.focus()},300)}},
 {t:"Seller net sheet",k:"Action",run:()=>location.hash="netsheet"},
 {t:"Rent vs. buy",k:"Action",run:()=>location.hash="rentbuy"},
 {t:"Data freshness — what's current",k:"Action",run:()=>location.hash="freshness"},
 {t:"Toggle dark / light",k:"Action",run:()=>{const b=$("#theme");if(b)b.click()}},
 {t:"Take the tour",k:"Action",run:()=>apTour(0)},
 {t:"Keyboard shortcuts",k:"Action",run:()=>apKeys()},
 {t:"Switch to classic look",k:"Action",run:()=>{store.set("ui_classic",1);location.reload()},hide:()=>!apOn()},
 {t:"Switch to new look",k:"Action",run:()=>{store.set("ui_classic",0);location.reload()},hide:()=>apOn()},
];
function apAllPages(){const seen=new Set(),out=[];PAGES.forEach(([sec,items])=>items.forEach(([id,t])=>{if(!seen.has(id)&&PAGE[id]){seen.add(id);out.push({id,t:apLabel(t),sec})}}));Object.keys(PAGE).forEach(id=>{if(!seen.has(id)&&typeof TITLES!=="undefined"&&TITLES[id]){seen.add(id);out.push({id,t:apLabel(TITLES[id]),sec:"Pages"})}});return out}
function apScore(q,t){t=t.toLowerCase();if(!q)return 1;if(t.startsWith(q))return 100;const w=t.split(/[^a-z0-9]+/);if(w.some(x=>x.startsWith(q)))return 80;if(t.includes(q))return 60;let i=0;for(const c of t){if(c===q[i])i++;if(i===q.length)return 30}return 0}
function apPalette(){if($(".ap-scrim"))return;const sc=document.createElement("div");sc.className="ap-scrim";sc.innerHTML=`<div class="ap-pal" role="dialog" aria-label="Search pages and actions"><input id="ap_q" placeholder="Search pages and actions" autocomplete="off" aria-label="Search"><div class="ap-list" id="ap_list" role="listbox"></div><div class="ap-foot"><span>↑↓ move</span><span>↵ open</span><span>esc close</span><span style="margin-left:auto">${apAllPages().length} pages</span></div></div>`;document.body.appendChild(sc);
 const q=$("#ap_q"),L=$("#ap_list");let rows=[],sel=0;
 const draw=()=>{const v=q.value.trim().toLowerCase();const pages=apAllPages().map(p=>({...p,s:apScore(v,p.t)+(apFavs().includes(p.id)?5:0)})).filter(p=>p.s>0);const acts=AP_ACTIONS.filter(a=>!(a.hide&&a.hide())).map(a=>({...a,s:apScore(v,a.t)})).filter(a=>a.s>0);
  let pl;if(!v){const fav=apFavs(),rec=apRecent();pl=[...rec,...fav].filter((k,i,a)=>a.indexOf(k)===i).map(k=>pages.find(p=>p.id===k)).filter(Boolean).slice(0,8)}else pl=pages.sort((a,b)=>b.s-a.s).slice(0,12);
  const al=v?acts.sort((a,b)=>b.s-a.s).slice(0,5):acts.slice(0,4);
  rows=[...pl.map(p=>({t:p.t,k:p.sec,run:()=>location.hash=p.id})),...al];sel=Math.min(sel,Math.max(0,rows.length-1));
  L.innerHTML=(pl.length?`<div class="ap-h">${v?"Pages":"Recent & Favorites"}</div>`:"")+pl.map((p,i)=>`<div class="ap-it${i===sel?" sel":""}" data-i="${i}" role="option">${esc(p.t)}<span class="k">${esc(p.sec)}</span></div>`).join("")+(al.length?`<div class="ap-h">Actions</div>`:"")+al.map((a,j)=>{const i=pl.length+j;return`<div class="ap-it${i===sel?" sel":""}" data-i="${i}" role="option">${esc(a.t)}<span class="k">Action</span></div>`}).join("")+(rows.length?"":`<div class="ap-h">No matches. Try the global search (press /) for content inside pages.</div>`);
  $$(".ap-it",L).forEach(e=>{e.onmousemove=()=>{if(sel!==+e.dataset.i){sel=+e.dataset.i;$$(".ap-it",L).forEach(x=>x.classList.toggle("sel",+x.dataset.i===sel))}};e.onclick=()=>go(+e.dataset.i)})};
 const close=()=>{sc.remove();document.removeEventListener("keydown",kd,true)};
 const go=i=>{const r=rows[i];close();if(r)r.run()};
 const kd=e=>{if(e.key==="Escape"){e.preventDefault();close()}else if(e.key==="ArrowDown"){e.preventDefault();sel=Math.min(rows.length-1,sel+1);draw();($(".ap-it.sel",L)||{}).scrollIntoView?.({block:"nearest"})}else if(e.key==="ArrowUp"){e.preventDefault();sel=Math.max(0,sel-1);draw();($(".ap-it.sel",L)||{}).scrollIntoView?.({block:"nearest"})}else if(e.key==="Enter"){e.preventDefault();go(sel)}};
 document.addEventListener("keydown",kd,true);sc.onclick=e=>{if(e.target===sc)close()};q.oninput=()=>{sel=0;draw()};draw();q.focus()}
function apKeys(){const sc=document.createElement("div");sc.className="ap-scrim";sc.innerHTML=`<div class="ap-pal" style="padding:18px 20px"><h3 style="margin:0 0 10px">Keyboard shortcuts</h3>${[["⌘K or Ctrl+K","Search pages & actions"],["/","Search inside pages"],["?","This list"],["G then T","Today"],["G then P","Pipeline"],["G then C","Closings"],["Esc","Close"]].map(([k,d])=>`<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="ap-kbd" style="margin:0 12px 0 0;min-width:96px;text-align:center">${k}</span><span>${d}</span></div>`).join("")}</div>`;document.body.appendChild(sc);const c=e=>{if(e.type==="click"&&e.target!==sc)return;if(e.type==="keydown"&&e.key!=="Escape")return;sc.remove();document.removeEventListener("keydown",c,true)};sc.onclick=c;document.addEventListener("keydown",c,true)}
{let g=0;document.addEventListener("keydown",e=>{const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||"")||(e.target&&e.target.isContentEditable);
 if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey&&(e.key==="k"||e.key==="K")){e.preventDefault();apPalette();return}
 if(typing||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==="?"){e.preventDefault();apKeys();return}
 if(e.key==="g"||e.key==="G"){g=Date.now();return}
 if(Date.now()-g<1200){const m={t:"today",p:"pipeline",c:"closings",m:"market",l:"loanlimits"}[e.key.toLowerCase()];if(m&&PAGE[m]){e.preventDefault();location.hash=m}g=0}})}

/* ---------- phone tab bar + sheet ---------- */
const AP_ICON={today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',pipeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="9.75" y="4" width="4.5" height="11" rx="1.5"/><rect x="16" y="4" width="4.5" height="7" rx="1.5"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/></svg>',closings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M9.5 20v-5h5v5"/></svg>',more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></svg>'};
function apSheet(on){const a=$("aside");if(a)a.classList.toggle("open",!!on)}
function apTabs(){if($(".ap-tabs"))return;const t=document.createElement("div");t.className="ap-tabs";t.setAttribute("role","tablist");t.setAttribute("aria-label","Tabs");t.innerHTML=[["today","Today"],["pipeline","Pipeline"],["search","Search"],["closings","Closings"],["more","More"]].map(([k,l])=>`<button type="button" role="tab" data-tab="${k}" aria-label="${l}">${AP_ICON[k]}<span>${l}</span></button>`).join("");document.body.appendChild(t);
 $$("button",t).forEach(b=>b.onclick=()=>{const k=b.dataset.tab;if(k==="search"){apSheet(false);apPalette()}else if(k==="more"){apSheet(!$("aside").classList.contains("open"))}else{apSheet(false);location.hash=k}});
 const k=(location.hash||"#today").slice(1);$$("button",t).forEach(b=>b.classList.toggle("on",b.dataset.tab===k));
 document.addEventListener("click",e=>{const a=$("aside");if(a&&a.classList.contains("open")&&!a.contains(e.target)&&!e.target.closest(".ap-tabs"))apSheet(false)})}

/* ---------- Today hero ---------- */
function apGreet(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"}
function apHero(){const m=market,need=(()=>{try{return typeof apQueue==="function"?apQueue().length:approvals.filter(a=>!a.decision).length}catch(e){return 0}})();
 const cl=(()=>{try{return typeof dlUpcoming==="function"?dlUpcoming(7):[]}catch(e){return[]}})();
 const d=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
 return`<div class="ap-hero"><div class="hi"><h2>${apGreet()}, Steven</h2><p>${esc(d)} · ${need?`${need} item${need>1?"s":""} need${need>1?"":"s"} you`:"Nothing needs you right now"}</p><div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" onclick="apPalette()">Search ⌘K</button><a class="btn ghost sm" href="#closings">Closings</a><a class="btn ghost sm" href="#pipeline">Pipeline</a></div></div>
 <a class="ap-tile" href="#market"><div class="l">Freddie Mac 30-yr</div><div class="v">${(+m.pmms30).toFixed(2)}%</div><div class="s">${m.pmms15?`15-yr ${(+m.pmms15).toFixed(2)}% · `:""}weekly survey</div></a>
 <a class="ap-tile" href="#market"><div class="l">10-yr Treasury</div><div class="v">${(+m.y10).toFixed(2)}%</div><div class="s">${m.y10chg>=0?"+":""}${m.y10chg} bp · ${esc(m.umbs.coupon||"UMBS")} ${(+m.umbs.price).toFixed(2)}</div></a>
 <a class="ap-tile" href="#autopilot"><div class="l">Needs you</div><div class="v">${need}</div><div class="s">approvals & licensed decisions</div></a>
 <a class="ap-tile" href="#closings"><div class="l">Closings · next 7 days</div><div class="v">${cl.length}</div><div class="s">${cl[0]?esc(cl[0].label):"Add files to track deadlines"}</div></a></div>`}
if(PAGE.today){const h0=PAGE.today.html;PAGE.today.html=function(){const h=h0.apply(this,arguments);return apOn()?apHero()+h:h}}

/* ---------- guided tour ---------- */
const AP_TOUR=[
 {sel:"#ap_find",h:"Find anything",p:"Press ⌘K (Ctrl+K on Windows) from anywhere to jump to any of the dashboard's pages or run an action."},
 {sel:"#nav",h:"A calmer sidebar",p:"Sections fold away. Star (☆) any page to pin it under Favorites; pages you open show up under Recent."},
 {sel:".ap-hero",h:"Your day at a glance",p:"Rates, what needs you, and closings in the next 7 days. Tap a tile to open it."},
 {sel:"#ticker",h:"Market, honestly labeled",p:"The ticker shows the latest dated snapshot or the live feed; it never simulates prices."},
 {sel:"#theme",h:"Light, dark or classic",p:"Toggle the theme here. Prefer the previous design? Search “classic” in ⌘K."}];
function apTour(i){$$(".ap-tour,.ap-ring").forEach(e=>e.remove());if(i>=AP_TOUR.length){store.set("ui_tour",1);return}const s=AP_TOUR[i];let el=$(s.sel);if(!el||!el.getClientRects().length){apTour(i+1);return}el.scrollIntoView({block:"nearest"});const r=el.getBoundingClientRect();
 const ring=document.createElement("div");ring.className="ap-ring";Object.assign(ring.style,{left:r.left-4+"px",top:r.top-4+"px",width:Math.min(r.width,innerWidth-16)+8+"px",height:Math.min(r.height,innerHeight*.7)+8+"px"});document.body.appendChild(ring);
 const t=document.createElement("div");t.className="ap-tour";t.setAttribute("role","dialog");t.innerHTML=`<h4>${s.h}</h4><p>${s.p}</p><div class="row" style="gap:8px"><span class="mut sm">${i+1} of ${AP_TOUR.length}</span><span class="sp"></span><button class="btn ghost sm" id="apt_x">Skip</button><button class="btn sm" id="apt_n">${i+1<AP_TOUR.length?"Next":"Done"}</button></div>`;document.body.appendChild(t);
 const tw=Math.min(320,innerWidth-24);let left=r.right+14,top=r.top;if(left+tw>innerWidth-12){left=Math.max(12,Math.min(r.left,innerWidth-tw-12));top=r.bottom+14}if(top+170>innerHeight)top=Math.max(12,r.top-180);Object.assign(t.style,{left:left+"px",top:top+"px"});
 $("#apt_n").onclick=()=>apTour(i+1);$("#apt_x").onclick=()=>apTour(AP_TOUR.length)}

/* ---------- settings + boot ---------- */
if(PAGE.settings){const h0=PAGE.settings.html,m0=PAGE.settings.mount;PAGE.settings.html=function(){return`<div class="card"><h3>Appearance</h3><div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn ${apOn()?"":"ghost"} sm" id="ap_new">New look</button><button class="btn ${apOn()?"ghost":""} sm" id="ap_old">Classic look</button><button class="btn ghost sm" id="ap_tour">Take the tour</button><button class="btn ghost sm" id="ap_rf">Reset Favorites</button></div><p class="mut sm" style="margin:8px 0 0">Shortcuts: ⌘K search · ? help · G then T/P/C/M/L to jump.</p></div>`+h0.apply(this,arguments)};
 PAGE.settings.mount=function(v){m0&&m0.apply(this,arguments);$("#ap_new").onclick=()=>{store.set("ui_classic",0);location.reload()};$("#ap_old").onclick=()=>{store.set("ui_classic",1);location.reload()};$("#ap_tour").onclick=()=>apTour(0);$("#ap_rf").onclick=()=>{store.set("nav_favs",AP_DEF_FAVS);buildNav();toast("Favorites reset")}}}
document.addEventListener("DOMContentLoaded",()=>{});
setTimeout(()=>{if(!apOn())return;apTabs();try{buildNav()}catch(e){}
 const gs=$("#gs_q");if(gs&&!/⌘K/.test(gs.placeholder))gs.placeholder="Search inside pages (/)  ·  ⌘K for pages";
 if(!store.get("ui_tour",0)&&innerWidth>760&&!navigator.webdriver)setTimeout(()=>{if((location.hash||"#today")==="#today")apTour(0)},1400)},0);
if(typeof SEARCH_ROUTES!=="undefined")SEARCH_ROUTES.unshift([/^(classic look|new look|appearance|keyboard shortcuts|tour)/i,{hash:"settings"}]);
