(function(){
"use strict";
const L = window.LEX || {};
["dict","thes","rhymes","idioms","wordorigins","roots","loans","ency","almanac","anniv"].forEach(k=>{ if(!Array.isArray(L[k])) L[k]=[]; });

/* ---------- helpers ---------- */
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rich = s => esc(s).replace(/&lt;i&gt;/g,"<i>").replace(/&lt;\/i&gt;/g,"</i>");
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"'").trim();
const fmtN = n => n.toLocaleString("en-US");
const uniqBy = (arr,f)=>{const s=new Set();return arr.filter(x=>{const k=f(x);if(s.has(k))return false;s.add(k);return true;});};
const store = {
  get(k,d){ try{ const v=localStorage.getItem("lex27:"+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem("lex27:"+k,JSON.stringify(v)); }catch(e){} }
};
function hl(text,q){ const t=esc(text); if(!q) return t; const i=norm(text).indexOf(norm(q)); if(i<0) return t;
  return esc(text.slice(0,i))+"<mark>"+esc(text.slice(i,i+q.length))+"</mark>"+esc(text.slice(i+q.length)); }
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),1800); }
function hash32(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }

/* ---------- data prep & indexes ---------- */
L.dict = uniqBy(L.dict.filter(x=>x&&x.w), x=>norm(x.w)).sort((a,b)=>norm(a.w).localeCompare(norm(b.w)));
L.thes = uniqBy(L.thes.filter(x=>x&&x.w), x=>norm(x.w)+"|"+x.pos).sort((a,b)=>norm(a.w).localeCompare(norm(b.w)));
L.ency = uniqBy(L.ency.filter(x=>x&&x.t), x=>norm(x.t)).sort((a,b)=>a.t.localeCompare(b.t));
L.idioms = uniqBy(L.idioms.filter(x=>x&&x.p), x=>norm(x.p)).sort((a,b)=>norm(a.p).localeCompare(norm(b.p)));
L.wordorigins = uniqBy(L.wordorigins.filter(x=>x&&x.w), x=>norm(x.w));
L.roots = uniqBy(L.roots.filter(x=>x&&x.r), x=>x.kind+"|"+norm(x.r));
L.rhymes = uniqBy(L.rhymes.filter(x=>x&&x.key), x=>x.key);

const dictBy = new Map(L.dict.map(x=>[norm(x.w),x]));
const dictSlug = new Map(L.dict.map(x=>[slug(x.w),x]));
const thesBy = new Map(); L.thes.forEach(x=>{ const k=norm(x.w); if(!thesBy.has(k)) thesBy.set(k,[]); thesBy.get(k).push(x); });
const thesSlug = new Map(); L.thes.forEach(x=>{ const k=slug(x.w); if(!thesSlug.has(k)) thesSlug.set(k,[]); thesSlug.get(k).push(x); });
const encyBy = new Map(L.ency.map(x=>[norm(x.t),x]));
const encySlug = new Map(L.ency.map(x=>[slug(x.t),x]));
const rhymeOf = new Map();   // word -> family
L.rhymes.forEach(f=>{ ["one","two","three"].forEach(k=>(f[k]||[]).forEach(w=>{ const n=norm(w); if(!rhymeOf.has(n)) rhymeOf.set(n,f); })); });
const famSlug = new Map(L.rhymes.map(f=>[slug(f.key),f]));
const idiomSlug = new Map(L.idioms.map(x=>[slug(x.p),x]));
const woSlug = new Map(L.wordorigins.map(x=>[slug(x.w),x]));

const SECTIONS = [
  {id:"overview", label:"Overview", count:()=>null, blurb:""},
  {id:"encyclopedia", label:"Encyclopedia", count:()=>L.ency.length},
  {id:"dictionary", label:"Dictionary", count:()=>L.dict.length},
  {id:"thesaurus", label:"Thesaurus", count:()=>L.thes.length},
  {id:"rhymes", label:"Rhymes", count:()=>L.rhymes.length},
  {id:"origins", label:"Origins", count:()=>L.idioms.length+L.wordorigins.length},
  {id:"roots", label:"Roots & Affixes", count:()=>L.roots.length},
  {id:"almanac", label:"Almanac 2027", count:()=>null}
];
const LEVELS = ["","Everyday","Common","Educated","Advanced"];

/* ---------- bookmarks & history ---------- */
let saved = store.get("saved",[]);
let recent = store.get("recent",[]);
function isSaved(h){ return saved.some(s=>s.h===h); }
function toggleSave(h,label,kind){ if(isSaved(h)){ saved=saved.filter(s=>s.h!==h); toast("Removed from saved"); } else { saved.unshift({h,label,kind}); toast("Saved"); } store.set("saved",saved); }
function pushRecent(h,label,kind){ recent=[{h,label,kind}].concat(recent.filter(r=>r.h!==h)).slice(0,12); store.set("recent",recent); }
function starBtn(h,label,kind){ const on=isSaved(h); return `<button class="star${on?" on":""}" data-star="${esc(h)}" data-label="${esc(label)}" data-kind="${esc(kind)}"><svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>${on?"Saved":"Save"}</button>`; }

/* ---------- linking ---------- */
function wordLink(w, pref){ // best destination for a word
  const n=norm(w);
  if(pref!=="dict" && thesBy.has(n)) return "#thesaurus--"+slug(w);
  if(dictBy.has(n)) return "#dictionary--"+slug(w);
  if(thesBy.has(n)) return "#thesaurus--"+slug(w);
  return "#search--"+slug(w);
}
function chipWords(list, pref){ return (list||[]).map(w=>`<a href="${wordLink(w,pref)}">${esc(w)}</a>`).join(""); }

/* ---------- rail ---------- */
function drawRail(active){
  $("#rail").innerHTML = SECTIONS.map(s=>{ const c=s.count(); return `<a class="tab${s.id===active?" on":""}" href="#${s.id}" style="--tc:var(--c-${s.id})">${esc(s.label)}${c!=null?`<span class="ct num">${fmtN(c)}</span>`:""}</a>`; }).join("")
   + `<div class="foot">2027 edition. Content reviewed November 2026; dates for future events follow organisers’ announcements and may change.</div>`;
  const on=$("#rail .tab.on"); if(on && window.innerWidth<=860) on.scrollIntoView({block:"nearest",inline:"center"});
}
function sectionHead(id, title, text){
  return `<div class="sh" style="--sc:var(--c-${id})"><div><div class="eyebrow">Volume · ${esc(SECTIONS.find(s=>s.id===id).label)}</div><h1>${esc(title)}</h1></div><p>${text}</p></div>`;
}

/* ---------- routing ---------- */
let current = {sec:null,item:null};
function parseHash(){
  const h=(location.hash||"#overview").slice(1);
  const i=h.indexOf("--");
  return i<0 ? {sec:h||"overview", item:null} : {sec:h.slice(0,i), item:h.slice(i+2)};
}
function route(){
  let {sec,item}=parseHash();
  let pendingSearch=null;
  if(sec==="search"){ const w=(item||"").replace(/-/g," "); $("#q").value=w;
    if(current.sec){ runSearch(w,true); $("#q").focus(); return; }
    pendingSearch=w; sec="overview"; item=null; }
  if(!SECTIONS.some(s=>s.id===sec)) sec="overview";
  const main=$("#main"); main.style.setProperty("--sc",`var(--c-${sec})`);
  drawRail(sec);
  const sameSec = current.sec===sec;
  current={sec,item};
  ({overview:viewOverview,encyclopedia:viewEncy,dictionary:viewDict,thesaurus:viewThes,rhymes:viewRhymes,origins:viewOrigins,roots:viewRoots,almanac:viewAlmanac})[sec](main,item,sameSec);
  if(!sameSec) window.scrollTo({top:0});
  if(pendingSearch){ runSearch(pendingSearch,true); $("#q").focus(); }
}

/* ===================== OVERVIEW ===================== */
function dayIndex(n, salt){ const d=new Date(); const key=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+salt; return n? hash32(key)%n : 0; }
function viewOverview(main){
  const adv = L.dict.filter(d=>d.level>=3);
  const pool = adv.length?adv:L.dict;
  const w = pool[dayIndex(pool.length,"w")];
  const idm = L.idioms[dayIndex(L.idioms.length,"i")];
  const art = L.ency[dayIndex(L.ency.length,"a")];
  const synTotal = L.thes.reduce((a,t)=>a+t.senses.reduce((b,s)=>b+(s.syn||[]).length,0),0);
  const rhymeWords = L.rhymes.reduce((a,f)=>a+(f.one||[]).length+(f.two||[]).length+(f.three||[]).length,0);
  const encyWords = L.ency.reduce((a,x)=>a+(x.body||[]).join(" ").split(/\s+/).length,0);
  const loanWords = L.loans.reduce((a,l)=>a+(l.words||[]).length,0);
  const next = nextAlmanac();

  let html = `<div class="sh" style="--sc:var(--c-encyclopedia)"><div><div class="eyebrow">Lexicon 2027 · six reference books in one</div><h1>Encyclopedia, dictionary, thesaurus, rhymes and origins</h1></div>
  <p>Look up a word, find a better one, make it rhyme, learn where it came from, then read the article. Everything links to everything else.</p></div>`;

  html += `<div class="ov-hero">`;
  if(w){ html += `<article class="card wotd"><div class="eyebrow">Word of the day</div>
     <h2><a href="#dictionary--${slug(w.w)}">${esc(w.w)}</a></h2>
     <div class="hwline"><span class="ipa">${esc(w.ipa)}</span><span class="pos">${esc(w.pos)}</span><span class="syl">${esc(w.syl)}</span></div>
     <p style="font-size:1.12rem;margin:12px 0 6px;max-width:60ch">${rich(w.defs[0])}</p>
     <p class="muted" style="margin:0;font-size:.93rem;max-width:64ch"><b style="font-family:var(--f-ui);font-size:.8rem;color:var(--ink-3)">ORIGIN</b> ${rich(w.ety)}</p></article>`; }
  html += `<div class="stack">`;
  html += `<a class="card" href="#almanac" style="text-decoration:none;color:inherit;border-top:5px solid var(--c-almanac)"><div class="eyebrow">Almanac 2027</div>${countdownHTML(next)}</a>`;
  if(idm) html += `<a class="card" href="#origins--${slug(idm.p)}" style="text-decoration:none;color:inherit;border-top:5px solid var(--c-origins)"><div class="eyebrow" style="display:flex;justify-content:space-between;gap:8px">Phrase of the day <span class="pill v-${esc(idm.v)}">${esc(idm.v)}</span></div><h3 style="font-size:1.35rem;margin:6px 0 4px">“${esc(idm.p)}”</h3><p class="muted" style="margin:0;font-size:.95rem">${rich(idm.m)}</p></a>`;
  html += `</div></div>`;

  const tiles = [
    ["encyclopedia",L.ency.length,"encyclopedia articles",fmtN(encyWords)+" words of text"],
    ["dictionary",L.dict.length,"dictionary headwords",L.dict.filter(d=>(d.tags||[]).includes("new")).length+" recent coinages"],
    ["thesaurus",L.thes.length,"thesaurus entries",fmtN(synTotal)+" synonyms"],
    ["rhymes",L.rhymes.length,"rhyme families",fmtN(rhymeWords)+" rhyming words"],
    ["origins",L.idioms.length+L.wordorigins.length,"origin stories",fmtN(loanWords)+" loanwords traced"],
    ["roots",L.roots.length,"roots & affixes",L.roots.filter(r=>r.kind==="root").length+" roots"]
  ];
  html += `<div class="stats">`+tiles.map(t=>`<a class="stat" href="#${t[0]}" style="--tc:var(--c-${t[0]})"><b>${fmtN(t[1])}</b><span>${t[2]}</span><small>${t[3]}</small></a>`).join("")+`</div>`;

  html += `<div class="charts">`;
  html += `<section class="card chart"><h3>Where the dictionary’s words come from</h3><div class="cap">Headwords by ultimate source language, ${fmtN(L.dict.length)} entries</div>${langBars()}</section>`;
  html += `<section class="card chart"><h3>When the words entered English</h3><div class="cap">First recorded use, by century</div>${centuryChart()}</section>`;
  html += `<section class="card chart"><h3>Phrase origins: fact or folklore?</h3><div class="cap">Verdicts on ${fmtN(L.idioms.length)} popular origin stories</div>${verdictBar()}</section>`;
  html += `<section class="card chart"><h3>Encyclopedia coverage</h3><div class="cap">Articles per subject</div>${encyBars()}</section>`;
  html += `</div>`;

  html += `<div class="tools2">
    <form class="card" id="ovRhyme" style="--sc:var(--c-rhymes)"><div class="eyebrow">Quick rhyme</div><div class="field" style="margin-top:8px"><input class="in" id="ovRhymeIn" placeholder="e.g. heart" style="flex:1"><button class="btn">Find rhymes</button></div></form>
    <form class="card" id="ovBuild" style="--sc:var(--c-roots)"><div class="eyebrow">Word builder</div><div class="field" style="margin-top:8px"><input class="in" id="ovBuildIn" placeholder="e.g. biography" style="flex:1"><button class="btn">Break it down</button></div></form>
  </div>`;

  if(art){ html += `<a class="card" href="#encyclopedia--${slug(art.t)}" style="display:block;margin-top:16px;text-decoration:none;color:inherit;border-left:5px solid var(--c-encyclopedia)"><div class="eyebrow">From the encyclopedia · ${esc(art.cat)}</div><h3 style="font-size:1.5rem;margin:6px 0">${esc(art.t)}</h3><p class="muted" style="margin:0;max-width:70ch">${rich(art.sum)}</p></a>`; }

  const list=(arr,t)=> arr.length? `<section class="card"><div class="eyebrow" style="margin-bottom:8px">${t}</div><div class="chips">${arr.map(s=>`<a class="chip" href="${esc(s.h)}">${esc(s.label)} <span class="n">${esc(s.kind)}</span></a>`).join("")}</div></section>`:"";
  const sv=list(saved,"Saved"), rc=list(recent,"Recently opened");
  if(sv||rc) html += `<div class="tools2">${sv}${rc}</div>`;

  main.innerHTML = html;
  $("#ovRhyme").onsubmit=e=>{e.preventDefault(); const v=$("#ovRhymeIn").value.trim(); if(v) location.hash="#rhymes--"+slug(v);};
  $("#ovBuild").onsubmit=e=>{e.preventDefault(); const v=$("#ovBuildIn").value.trim(); if(v) location.hash="#roots--"+slug(v);};
}
function langBars(){
  const c={}; L.dict.forEach(d=>{ const k=d.lang||"Unknown"; c[k]=(c[k]||0)+1; });
  const arr=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,12); const max=arr.length?arr[0][1]:1;
  return `<div class="hbar" style="--bc:var(--c-dictionary)">`+arr.map(([k,v])=>`<div class="r"><span title="${esc(k)}">${esc(k)}</span><div class="t"><i style="width:${(v/max*100).toFixed(1)}%"></i></div><b>${v}</b></div>`).join("")+`</div>`;
}
function encyBars(){
  const c={}; L.ency.forEach(d=>{ c[d.cat]=(c[d.cat]||0)+1; });
  const arr=Object.entries(c).sort((a,b)=>b[1]-a[1]); const max=arr.length?arr[0][1]:1;
  return `<div class="hbar" style="--bc:var(--c-encyclopedia)">`+arr.map(([k,v])=>`<div class="r"><span>${esc(k)}</span><div class="t"><i style="width:${(v/max*100).toFixed(1)}%"></i></div><b>${v}</b></div>`).join("")+`</div>`;
}
function centuryChart(){
  const c={}; L.dict.forEach(d=>{ if(!d.first) return; const cen=Math.max(8,Math.min(21,Math.floor(d.first/100)+1)); c[cen]=(c[cen]||0)+1; });
  const cens=[]; for(let i=8;i<=21;i++) cens.push(i);
  const max=Math.max(1,...cens.map(k=>c[k]||0));
  const W=440,H=190,pl=28,pb=34,pt=16,bw=(W-pl-6)/cens.length;
  const nice = max<=10?Math.ceil(max/2)*2: max<=50?Math.ceil(max/10)*10: Math.ceil(max/20)*20;
  const y=v=>pt+(H-pt-pb)*(1-v/nice);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram of first recorded use by century">`;
  [0,nice/2,nice].forEach(v=>{ s+=`<line x1="${pl}" x2="${W-4}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${pl-5}" y="${y(v)+4}" text-anchor="end">${v}</text>`; });
  cens.forEach((k,i)=>{ const v=c[k]||0, x=pl+i*bw+3, h=(H-pt-pb)*(v/nice);
    s+=`<rect x="${x}" y="${y(v)}" width="${bw-6}" height="${Math.max(0,h)}" rx="3" fill="var(--c-dictionary)" opacity="${k===21?1:.78}"><title>${ord(k)} century: ${v}</title></rect>`;
    if(v) s+=`<text class="v" x="${x+(bw-6)/2}" y="${y(v)-4}" text-anchor="middle">${v}</text>`;
    s+=`<text x="${x+(bw-6)/2}" y="${H-pb+14}" text-anchor="middle">${k}</text>`; });
  s+=`<text x="${(W+pl)/2}" y="${H-4}" text-anchor="middle">century (8 = before 800 CE, 21 = since 2000)</text></svg>`;
  return s;
}
function ord(n){ const s=["th","st","nd","rd"],v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
function verdictBar(){
  const order=[["documented","Documented","var(--good)"],["plausible","Plausible","var(--info)"],["disputed","Disputed","var(--warn)"],["myth","Popular story is a myth","var(--bad)"]];
  const c={}; L.idioms.forEach(x=>c[x.v]=(c[x.v]||0)+1); const tot=L.idioms.length||1;
  return `<div class="stackbar">`+order.map(([k,,col])=>`<i style="width:${((c[k]||0)/tot*100).toFixed(2)}%;background:${col}" title="${k}: ${c[k]||0}"></i>`).join("")+`</div>
   <div class="legend">`+order.map(([k,l,col])=>`<span style="--lc:${col}">${l} <b class="num">${c[k]||0}</b></span>`).join("")+`</div>
   <p class="muted tiny" style="margin:12px 0 0;font-family:var(--f-ui)">“Myth” means the story people usually tell is wrong; each entry gives the better-supported origin.</p>`;
}

/* ===================== ENCYCLOPEDIA ===================== */
let encyState = {cat:"All", q:"", mode:"az"};
function viewEncy(main,item,same){
  const art = item ? encySlug.get(item) : null;
  if(!same || !$("#encyList")){
    const cats=["All",...[...new Set(L.ency.map(x=>x.cat))].sort()];
    main.innerHTML = sectionHead("encyclopedia","Encyclopedia",`${fmtN(L.ency.length)} articles across ${cats.length-1} subjects, from black holes to the blues. Each has a fact box and links to related articles.`)
    + `<div class="chips" id="encyCats" style="margin-bottom:14px">${cats.map(c=>`<button class="chip${c===encyState.cat?" on":""}" data-c="${esc(c)}">${esc(c)}<span class="n">${c==="All"?L.ency.length:L.ency.filter(x=>x.cat===c).length}</span></button>`).join("")}</div>
     <div class="split"><aside class="list"><div class="lh"><input class="in" id="encyQ" placeholder="Filter articles" value="${esc(encyState.q)}"><div class="chips"><button class="chip${encyState.mode==="az"?" on":""}" data-m="az">A–Z</button><button class="chip${encyState.mode==="tl"?" on":""}" data-m="tl">Timeline</button></div></div><div class="lb" id="encyList"></div><div class="cnt" id="encyCnt"></div></aside><div id="encyRead"></div></div>`;
    $("#encyCats").onclick=e=>{ const b=e.target.closest("[data-c]"); if(!b) return; encyState.cat=b.dataset.c; [...$("#encyCats").children].forEach(x=>x.classList.toggle("on",x===b)); drawEncyList(); };
    $("#encyQ").oninput=e=>{ encyState.q=e.target.value; drawEncyList(); };
    main.querySelector(".lh .chips").onclick=e=>{ const b=e.target.closest("[data-m]"); if(!b) return; encyState.mode=b.dataset.m; [...b.parentNode.children].forEach(x=>x.classList.toggle("on",x===b)); drawEncyList(); };
  }
  drawEncyList(art);
  const show = art || L.ency.find(x=>x.t==="Black hole") || L.ency[0];
  $("#encyRead").innerHTML = show ? encyArticle(show) : `<div class="reader empty">No articles loaded.</div>`;
  if(art){ pushRecent("#encyclopedia--"+slug(art.t),art.t,"article"); if(window.innerWidth<=860) $("#encyRead").scrollIntoView({behavior:"smooth"}); }
}
function drawEncyList(active){
  const q=norm(encyState.q);
  let arr=L.ency.filter(x=>(encyState.cat==="All"||x.cat===encyState.cat) && (!q || norm(x.t).includes(q) || norm(x.sum).includes(q)));
  const cur = current.item;
  let html="";
  if(encyState.mode==="tl"){
    arr=arr.filter(x=>typeof x.yr==="number").sort((a,b)=>a.yr-b.yr);
    html=arr.map(x=>`<a href="#encyclopedia--${slug(x.t)}" class="${slug(x.t)===cur?"on":""}"><span>${hl(x.t,encyState.q)}</span><small>${yearStr(x.yr)}</small></a>`).join("");
  } else {
    let last="";
    arr.forEach(x=>{ const l=x.t[0].toUpperCase(); if(l!==last){ html+=`<div class="lg">${esc(l)}</div>`; last=l; } html+=`<a href="#encyclopedia--${slug(x.t)}" class="${slug(x.t)===cur?"on":""}"><span>${hl(x.t,encyState.q)}</span><small>${esc(x.cat)}</small></a>`; });
  }
  $("#encyList").innerHTML = html || `<div class="empty">No matching articles.</div>`;
  $("#encyCnt").textContent = arr.length+" of "+L.ency.length+" articles";
}
function yearStr(y){ return y<0? Math.abs(y)+" BCE" : String(y); }
function encyArticle(a){
  const h="#encyclopedia--"+slug(a.t);
  const rel=(a.rel||[]).map(r=>{ const t=encyBy.get(norm(r)); return t? `<a class="chip" href="#encyclopedia--${slug(t.t)}">${esc(t.t)}</a>` : `<a class="chip ghost" href="#search--${slug(r)}">${esc(r)}</a>`; }).join("");
  const words=(a.body||[]).join(" ").split(/\s+/).length;
  const dictHits = L.dict.filter(d=>d.w.length>4 && new RegExp("\\b"+d.w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(a.t+" "+a.sum)).slice(0,6);
  return `<article class="reader"><div class="eyebrow" style="color:var(--sc)">${esc(a.cat)}${typeof a.yr==="number"?" · key date "+yearStr(a.yr):""}</div>
   <h2 class="hw">${esc(a.t)}</h2>
   <div class="rowmeta">${starBtn(h,a.t,"article")}<span class="tiny muted mono">${words} words · ${Math.max(1,Math.round(words/230))} min read</span></div>
   <p class="lede">${rich(a.sum)}</p>
   <div class="art"><div class="body">${(a.body||[]).map(p=>`<p>${rich(p)}</p>`).join("")}</div>
   <aside class="factbox"><h4>Key facts</h4><dl>${(a.facts||[]).map(f=>`<div><dt>${esc(f[0])}</dt><dd>${rich(f[1])}</dd></div>`).join("")}</dl></aside></div>
   ${rel?`<div class="sub"><h3>Related articles</h3><div class="chips">${rel}</div></div>`:""}
   ${dictHits.length?`<div class="sub"><h3>In the dictionary</h3><div class="chips">${dictHits.map(d=>`<a class="chip" href="#dictionary--${slug(d.w)}">${esc(d.w)}</a>`).join("")}</div></div>`:""}
  </article>`;
}

/* ===================== DICTIONARY ===================== */
let dictState={letter:"All", pos:"", level:"", lang:"", q:"", onlyNew:false};
function viewDict(main,item,same){
  const e = item ? dictSlug.get(item) : null;
  if(!same || !$("#dictList")){
    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const has=new Set(L.dict.map(d=>norm(d.w)[0].toUpperCase()));
    const poses=[...new Set(L.dict.map(d=>d.pos))].sort();
    const langs=[...new Set(L.dict.map(d=>d.lang))].sort();
    main.innerHTML = sectionHead("dictionary","Dictionary",`${fmtN(L.dict.length)} headwords with American IPA pronunciation, syllable breaks, numbered senses, examples, etymology and first recorded use.`)
    + `<div class="chips" id="dictAZ" style="margin-bottom:10px"><button class="chip${dictState.letter==="All"?" on":""}" data-l="All">All</button>${letters.map(l=>`<button class="chip${dictState.letter===l?" on":""}" data-l="${l}" ${has.has(l)?"":"disabled style='opacity:.35'"}>${l}</button>`).join("")}</div>
      <div class="field" style="margin-bottom:14px">
        <select class="in" id="dPos" aria-label="Part of speech"><option value="">All parts of speech</option>${poses.map(p=>`<option ${dictState.pos===p?"selected":""}>${esc(p)}</option>`).join("")}</select>
        <select class="in" id="dLvl" aria-label="Difficulty"><option value="">All levels</option>${[1,2,3,4].map(l=>`<option value="${l}" ${String(dictState.level)===String(l)?"selected":""}>${LEVELS[l]}</option>`).join("")}</select>
        <select class="in" id="dLang" aria-label="Origin language"><option value="">All origins</option>${langs.map(p=>`<option ${dictState.lang===p?"selected":""}>${esc(p)}</option>`).join("")}</select>
        <label class="chip${dictState.onlyNew?" on":""}" id="dNewL"><input type="checkbox" id="dNew" ${dictState.onlyNew?"checked":""} hidden>Recent coinages</label>
      </div>
      <div class="split"><aside class="list"><div class="lh"><input class="in" id="dictQ" placeholder="Filter headwords or definitions" value="${esc(dictState.q)}"></div><div class="lb" id="dictList"></div><div class="cnt" id="dictCnt"></div></aside><div id="dictRead"></div></div>`;
    $("#dictAZ").onclick=ev=>{ const b=ev.target.closest("[data-l]"); if(!b||b.disabled) return; dictState.letter=b.dataset.l; [...$("#dictAZ").children].forEach(x=>x.classList.toggle("on",x===b)); drawDictList(); };
    $("#dPos").onchange=ev=>{dictState.pos=ev.target.value; drawDictList();};
    $("#dLvl").onchange=ev=>{dictState.level=ev.target.value; drawDictList();};
    $("#dLang").onchange=ev=>{dictState.lang=ev.target.value; drawDictList();};
    $("#dNew").onchange=ev=>{dictState.onlyNew=ev.target.checked; $("#dNewL").classList.toggle("on",dictState.onlyNew); drawDictList();};
    $("#dictQ").oninput=ev=>{dictState.q=ev.target.value; drawDictList();};
  }
  drawDictList();
  const show = e || dictBy.get("serendipity") || L.dict[0];
  $("#dictRead").innerHTML = show? dictEntry(show) : `<div class="reader empty">No entries loaded.</div>`;
  if(e){ pushRecent("#dictionary--"+slug(e.w),e.w,"word"); if(window.innerWidth<=860) $("#dictRead").scrollIntoView({behavior:"smooth"}); }
}
function drawDictList(){
  const q=norm(dictState.q), s=dictState;
  const arr=L.dict.filter(d=>(s.letter==="All"||norm(d.w)[0].toUpperCase()===s.letter)&&(!s.pos||d.pos===s.pos)&&(!s.level||String(d.level)===String(s.level))&&(!s.lang||d.lang===s.lang)&&(!s.onlyNew||(d.tags||[]).includes("new"))&&(!q||norm(d.w).includes(q)||d.defs.some(x=>norm(x).includes(q))));
  let html="",last="";
  arr.forEach(d=>{ const l=norm(d.w)[0].toUpperCase(); if(l!==last){ html+=`<div class="lg">${esc(l)}</div>`; last=l; } html+=`<a href="#dictionary--${slug(d.w)}" class="${slug(d.w)===current.item?"on":""}"><span>${hl(d.w,s.q)}</span><small>${esc(abbrPos(d.pos))}</small></a>`; });
  $("#dictList").innerHTML=html||`<div class="empty">No matching words.</div>`;
  $("#dictCnt").textContent=arr.length+" of "+L.dict.length+" headwords";
}
function abbrPos(p){ return ({noun:"n.",verb:"v.",adjective:"adj.",adverb:"adv.",pronoun:"pron.",preposition:"prep.",conjunction:"conj.",interjection:"interj.",phrase:"phr."})[p]||p; }
function dictEntry(d){
  const h="#dictionary--"+slug(d.w);
  const fam=rhymeOf.get(norm(d.w)) || guessFamily(d.w);
  const rh = fam? [...(fam.one||[]),...(fam.two||[])].filter(x=>norm(x)!==norm(d.w)).slice(0,14):[];
  const sameLang = L.dict.filter(x=>x!==d && x.lang===d.lang).sort((a,b)=>Math.abs((a.first||0)-(d.first||0))-Math.abs((b.first||0)-(d.first||0))).slice(0,8);
  const th=thesBy.get(norm(d.w));
  const wo=L.wordorigins.find(x=>norm(x.w)===norm(d.w));
  return `<article class="reader">
    <div class="eyebrow" style="color:var(--sc)">${esc(d.pos)} · ${esc(LEVELS[d.level]||"")}</div>
    <h2 class="hw">${esc(d.w)}</h2>
    <div class="hwline"><span class="ipa">${esc(d.ipa)}</span><span class="syl">${esc(d.syl)}</span><span class="pos">${esc(d.pos)}</span></div>
    <div class="rowmeta">${starBtn(h,d.w,"word")}<button class="star" data-speak="${esc(d.w)}"><svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>Hear it</button>
      <span class="lvl" title="Difficulty: ${esc(LEVELS[d.level]||"")}">${[1,2,3,4].map(i=>`<i class="${i<=d.level?"f":""}"></i>`).join("")} ${esc(LEVELS[d.level]||"")}</span>
      ${(d.tags||[]).map(t=>`<span class="kind">${esc(t)}</span>`).join("")}</div>
    <ol class="defs">${d.defs.map(x=>`<li>${rich(x)}</li>`).join("")}</ol>
    ${d.ex?`<p class="example">${rich(d.ex)}</p>`:""}
    <div class="box"><h4>Etymology</h4><p>${rich(d.ety)}</p>
      <dl class="kv" style="margin-top:10px"><dt>Source</dt><dd>${esc(d.lang)}</dd><dt>First recorded</dt><dd class="num">${d.first?("c. "+d.first+" · "+ord(Math.floor(d.first/100)+1)+" century"):"unknown"}</dd></dl></div>
    ${wo?`<div class="box"><h4>From the book of origins</h4><p>${rich(wo.story)}</p></div>`:""}
    ${(d.syn&&d.syn.length)?`<div class="sub"><h3>Synonyms ${th?`<small><a href="#thesaurus--${slug(d.w)}">full thesaurus entry →</a></small>`:""}</h3><div class="syn">${chipWords(d.syn)}</div></div>`:(th?`<div class="sub"><h3><a href="#thesaurus--${slug(d.w)}">Thesaurus entry →</a></h3></div>`:"")}
    ${(d.ant&&d.ant.length)?`<div class="sub"><h3>Antonyms</h3><div class="syn ant">${chipWords(d.ant)}</div></div>`:""}
    ${rh.length?`<div class="sub"><h3>Rhymes <small><a href="#rhymes--${slug(d.w)}">all rhymes for “${esc(d.w)}” →</a></small></h3><div class="rwords">${rh.map(x=>`<a href="#rhymes--${slug(x)}">${esc(x)}</a>`).join("")}</div></div>`:""}
    ${sameLang.length?`<div class="sub"><h3>Also from ${esc(d.lang)} <small>nearest in date</small></h3><div class="chips">${sameLang.map(x=>`<a class="chip" href="#dictionary--${slug(x.w)}">${esc(x.w)} <span class="n">${x.first||""}</span></a>`).join("")}</div></div>`:""}
  </article>`;
}

/* ===================== THESAURUS ===================== */
let thesQ="";
function viewThes(main,item,same){
  const list = item ? (thesSlug.get(item) || null) : null;
  if(!same || !$("#thesList")){
    main.innerHTML = sectionHead("thesaurus","Thesaurus",`${fmtN(L.thes.length)} entries grouped by sense, with antonyms, a mild-to-strong intensity scale, formal and informal alternatives, and notes on how near-synonyms differ.`)
    + `<div class="split"><aside class="list"><div class="lh"><input class="in" id="thesQ" placeholder="Filter, or type any word" value="${esc(thesQ)}"></div><div class="lb" id="thesList"></div><div class="cnt" id="thesCnt"></div></aside><div id="thesRead"></div></div>`;
    $("#thesQ").oninput=e=>{thesQ=e.target.value; drawThesList();};
  }
  drawThesList();
  let entries=list;
  if(!entries && item){ // word not a headword: find entries listing it as synonym
    const w=item.replace(/-/g," ");
    const back=L.thes.filter(t=>t.senses.some(s=>(s.syn||[]).some(x=>norm(x)===norm(w))));
    $("#thesRead").innerHTML = `<article class="reader"><div class="eyebrow">Not a headword</div><h2 class="hw">${esc(w)}</h2>${back.length?`<p class="lede">“${esc(w)}” appears as a synonym in these entries:</p><div class="chips">${back.map(t=>`<a class="chip" href="#thesaurus--${slug(t.w)}">${esc(t.w)} <span class="n">${esc(abbrPos(t.pos))}</span></a>`).join("")}</div>`:`<p class="lede">No thesaurus entry yet.</p>`}${dictBy.has(norm(w))?`<p><a href="#dictionary--${slug(w)}">Open “${esc(w)}” in the dictionary →</a></p>`:""}</article>`;
    return;
  }
  entries = entries || thesBy.get("happy") || (L.thes[0]?[L.thes[0]]:null);
  $("#thesRead").innerHTML = entries? thesEntry(entries) : `<div class="reader empty">No entries loaded.</div>`;
  if(list){ pushRecent("#thesaurus--"+slug(list[0].w),list[0].w,"synonyms"); if(window.innerWidth<=860) $("#thesRead").scrollIntoView({behavior:"smooth"}); }
}
function drawThesList(){
  const q=norm(thesQ);
  const arr=L.thes.filter(t=>!q||norm(t.w).includes(q)||t.senses.some(s=>(s.syn||[]).some(x=>norm(x).includes(q))));
  let html="",last="";
  arr.forEach(t=>{ const l=norm(t.w)[0].toUpperCase(); if(l!==last){ html+=`<div class="lg">${esc(l)}</div>`; last=l; } html+=`<a href="#thesaurus--${slug(t.w)}" class="${slug(t.w)===current.item?"on":""}"><span>${hl(t.w,thesQ)}</span><small>${esc(abbrPos(t.pos))}</small></a>`; });
  if(q && !arr.length) html=`<div class="empty">No entry. <a href="#thesaurus--${slug(thesQ)}">Search synonyms of “${esc(thesQ)}”</a></div>`;
  $("#thesList").innerHTML=html; $("#thesCnt").textContent=arr.length+" of "+L.thes.length+" entries";
}
function thesEntry(list){
  const w=list[0].w, h="#thesaurus--"+slug(w), d=dictBy.get(norm(w));
  return `<article class="reader"><div class="eyebrow" style="color:var(--sc)">Thesaurus</div><h2 class="hw">${esc(w)}</h2>
   <div class="rowmeta">${starBtn(h,w,"synonyms")}${d?`<a class="star" href="#dictionary--${slug(w)}" style="text-decoration:none;color:inherit">Definition →</a>`:""}<a class="star" href="#rhymes--${slug(w)}" style="text-decoration:none;color:inherit">Rhymes →</a></div>`
  + list.map(t=>`<div class="sub" style="margin-top:26px"><h3><span class="pos" style="font-size:1.1rem">${esc(t.pos)}</span></h3>
     ${t.senses.map((s,i)=>`<div class="sense"><div class="g"><em>${t.senses.length>1?(i+1):"·"}</em>${rich(s.gloss)}</div><div class="syn">${chipWords(s.syn,"dict")}</div>${(s.ant&&s.ant.length)?`<div class="syn ant" style="margin-top:8px"><span class="lab">opposite</span>${chipWords(s.ant)}</div>`:""}</div>`).join("")}
     ${((t.mild&&t.mild.length)||(t.strong&&t.strong.length))?`<div class="box"><h4>Intensity</h4><div class="scale"><div class="side l syn">${chipWords(t.mild)}</div><span class="mid">${esc(w)}</span><div class="side syn">${chipWords(t.strong)}</div></div><div class="gradbar"></div><div class="scale-lab"><span>milder</span><span>stronger</span></div></div>`:""}
     ${((t.formal&&t.formal.length)||(t.informal&&t.informal.length))?`<div class="box"><h4>Register</h4><dl class="kv">${t.formal&&t.formal.length?`<dt>Formal</dt><dd><div class="syn">${chipWords(t.formal)}</div></dd>`:""}${t.informal&&t.informal.length?`<dt>Informal</dt><dd><div class="syn">${chipWords(t.informal)}</div></dd>`:""}</dl></div>`:""}
     ${t.note?`<div class="box"><h4>Usage note</h4><p>${rich(t.note)}</p></div>`:""}</div>`).join("")
  + `</article>`;
}

/* ===================== RHYMES ===================== */
function syllables(word){
  return String(word).toLowerCase().split(/[\s-]+/).filter(Boolean).reduce((tot,w)=>{
    w=w.replace(/[^a-z]/g,""); if(!w) return tot; if(w.length<=3) return tot+1;
    w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"").replace(/^y/,"");
    const m=w.match(/[aeiouy]{1,2}/g); return tot+Math.max(1,m?m.length:1); },0);
}
function spellTail(w){ w=norm(w).replace(/[^a-z]/g,""); const m=w.match(/[aeiouy]+[^aeiouy]*e?$/); return m?m[0]:w.slice(-3); }
function guessFamily(w){
  const tail=spellTail(w); if(tail.length<2) return null;
  let best=null,score=0;
  L.rhymes.forEach(f=>{ const words=[...(f.one||[]),...(f.two||[]),...(f.three||[])]; const s=words.filter(x=>norm(x).endsWith(tail)).length/Math.max(1,words.length); if(s>score){score=s;best=f;} });
  return score>=0.25?best:null;
}
let rhyFilter="all";
function viewRhymes(main,item){
  const word=item?item.replace(/-/g," "):"";
  const famDirect = item? famSlug.get(item):null;
  main.innerHTML = sectionHead("rhymes","Rhyming dictionary",`${fmtN(L.rhymes.length)} rhyme families grouped by sound, not spelling, so “site”, “height” and “byte” land together. Perfect rhymes are split by syllable count, followed by near rhymes and ready-made phrases.`)
  + `<form class="card rhyme-in" id="rhyForm"><input class="in" id="rhyIn" placeholder="Type a word to rhyme…" value="${esc(famDirect?famDirect.sample:word)}" aria-label="Word to rhyme"><button class="btn">Find rhymes</button></form>
     <div id="rhyOut" style="margin-top:16px"></div>
     <section style="margin-top:26px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px"><h3 style="font-size:1.2rem">Browse rhyme families</h3><div class="chips" id="rhyF"><button class="chip${rhyFilter==="all"?" on":""}" data-f="all">All</button><button class="chip${rhyFilter==="m"?" on":""}" data-f="m">Single-syllable sounds</button><button class="chip${rhyFilter==="f"?" on":""}" data-f="f">Multi-syllable endings</button></div></div><div class="fam-grid" id="famGrid"></div></section>`;
  $("#rhyForm").onsubmit=e=>{e.preventDefault(); const v=$("#rhyIn").value.trim(); if(v) location.hash="#rhymes--"+slug(v);};
  $("#rhyF").onclick=e=>{const b=e.target.closest("[data-f]"); if(!b) return; rhyFilter=b.dataset.f; [...$("#rhyF").children].forEach(x=>x.classList.toggle("on",x===b)); drawFams();};
  drawFams();
  if(famDirect) $("#rhyOut").innerHTML=rhymeResult(famDirect,famDirect.sample,false);
  else if(word) { const f=rhymeOf.get(norm(word)); $("#rhyOut").innerHTML = f? rhymeResult(f,word,false) : rhymeFallback(word); pushRecent("#rhymes--"+slug(word),word,"rhymes"); }
  else { const f=L.rhymes.find(x=>x.key==="ight")||L.rhymes[0]; if(f) $("#rhyOut").innerHTML=rhymeResult(f,f.sample,false); }
}
function isMulti(f){ return syllables(f.sample||"")>1 && !(f.one||[]).every(w=>syllables(w)===1); }
function drawFams(){
  const arr=L.rhymes.filter(f=>rhyFilter==="all"||(rhyFilter==="f")===isMulti(f)).sort((a,b)=>a.key.localeCompare(b.key));
  $("#famGrid").innerHTML=arr.map(f=>{ const n=(f.one||[]).length+(f.two||[]).length+(f.three||[]).length; return `<a class="fam" href="#rhymes--${slug(f.key)}"><b>${famLabel(f)}</b><span>${esc(f.sound)} · ${esc(f.sample)}</span><small>${n} words</small></a>`; }).join("");
}
function famLabel(f){ const [a,b]=f.key.split("-"); return "-"+esc(a)+(b?` <small style="font-family:var(--f-ui);font-weight:400">(${esc(b)})</small>`:""); }
function rwords(arr){ return `<div class="rwords">${(arr||[]).map(w=>`<a href="${dictBy.has(norm(w))?"#dictionary--"+slug(w):"#rhymes--"+slug(w)}" class="${dictBy.has(norm(w))?"has":""}">${esc(w)}</a>`).join("")||`<span class="muted tiny">none listed</span>`}</div>`; }
function rhymeResult(f,word,guess){
  const n=syllables(word);
  const ex=x=>(x||[]).filter(w=>norm(w)!==norm(word));
  const cols=[["One syllable",ex(f.one)],["Two syllables",ex(f.two)],["Three or more",ex(f.three)]];
  if(isMulti(f)){ cols[0][0]="Shortest"; cols[1][0]="Longer"; cols[2][0]="Longest"; }
  return `<div class="reader" style="--sc:var(--c-rhymes)">
   <div class="eyebrow" style="color:var(--sc)">${guess?"Closest rhyme family (matched by spelling, check by ear)":"Perfect rhymes"}</div>
   <div style="display:flex;flex-wrap:wrap;gap:8px 18px;align-items:baseline"><h2 class="hw" style="font-size:clamp(1.8rem,4vw,2.6rem)">${esc(word)}</h2><span class="ipa" style="font-size:1.2rem;color:var(--ink-2)">rhymes on ${esc(f.sound)}</span><span class="sylcount" title="Estimated syllables">${"<i></i>".repeat(Math.min(n,8))} ${n} syllable${n>1?"s":""}</span></div>
   <div class="rcols">${cols.map(([t,a])=>`<div class="rcol"><h4><span>${t}</span><span class="mono">${a.length}</span></h4>${rwords(a)}</div>`).join("")}</div>
   <div class="rcols"><div class="rcol"><h4><span>Near rhymes (slant)</span><span class="mono">${(f.near||[]).length}</span></h4>${rwords(f.near)}</div>
   <div class="rcol"><h4><span>Rhyming phrases</span><span class="mono">${(f.phrases||[]).length}</span></h4><div class="rwords">${(f.phrases||[]).map(p=>`<span>${esc(p)}</span>`).join("")}</div></div></div>
   <p class="tiny muted" style="margin:16px 0 0;font-family:var(--f-ui)">Underlined words have a full dictionary entry. Rhymes follow General American pronunciation.</p></div>`;
}
function rhymeFallback(word){
  const fam=guessFamily(word);
  if(fam) return rhymeResult(fam,word,true);
  const tail=spellTail(word);
  const pool=new Set(); L.rhymes.forEach(f=>[...(f.one||[]),...(f.two||[]),...(f.three||[])].forEach(w=>pool.add(w))); L.dict.forEach(d=>pool.add(d.w)); L.thes.forEach(t=>pool.add(t.w));
  const hits=[...pool].filter(w=>norm(w)!==norm(word) && norm(w).endsWith(tail) && !w.includes(" ")).sort((a,b)=>syllables(a)-syllables(b)||a.localeCompare(b)).slice(0,60);
  return `<div class="reader"><div class="eyebrow">No rhyme family for “${esc(word)}”</div><h2 class="hw" style="font-size:2rem">${esc(word)}</h2>
   ${hits.length?`<p class="lede">Words ending in “-${esc(tail)}”. Spelling matches are not always sound matches, so say them aloud.</p>${rwords(hits)}`:`<p class="lede">Nothing in the lexicon ends in “-${esc(tail)}”. Some words, such as “orange” and “month”, have no perfect rhyme in English. Try a near rhyme, or rework the line so a different word lands at the end.</p>`}</div>`;
}

/* ===================== ORIGINS ===================== */
let orState={tab:"phrases", v:"", cat:"", q:"", group:""};
function viewOrigins(main,item){
  let target=null;
  if(item){ if(idiomSlug.has(item)){ orState.tab="phrases"; target=item; } else if(woSlug.has(item)){ orState.tab="words"; target=item; } else if(["phrases","words","loans"].includes(item)) orState.tab=item; }
  main.innerHTML = sectionHead("origins","Book of origins",`Where ${fmtN(L.idioms.length)} phrases and ${fmtN(L.wordorigins.length)} words came from, with a verdict on every popular story. English borrowings are traced across ${L.loans.length} source languages.`)
  + `<nav class="subtabs" id="orTabs">${[["phrases","Phrases & idioms",L.idioms.length],["words","Word stories",L.wordorigins.length],["loans","Borrowed words",L.loans.length]].map(([k,l,n])=>`<a href="#origins--${k}" class="${orState.tab===k?"on":""}">${l} <span class="mono tiny muted">${n}</span></a>`).join("")}</nav><div id="orBody"></div>`;
  ({phrases:drawPhrases,words:drawWords,loans:drawLoans})[orState.tab](target);
  if(target){ const el=document.getElementById("o-"+target); if(el){ el.classList.add("hl"); setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"center"}),40); }
    const x=idiomSlug.get(target)||woSlug.get(target); if(x) pushRecent("#origins--"+target, x.p||x.w, "origin"); }
}
function drawPhrases(target){
  const cats=[...new Set(L.idioms.map(x=>x.cat))].sort(); const vs=["documented","plausible","disputed","myth"];
  const c={}; L.idioms.forEach(x=>c[x.v]=(c[x.v]||0)+1);
  if(target){ orState.v=""; orState.cat=""; orState.q=""; }
  $("#orBody").innerHTML=`<div class="field" style="margin-bottom:14px"><input class="in" id="orQ" placeholder="Filter phrases" value="${esc(orState.q)}" style="flex:1;min-width:180px">
    <select class="in" id="orCat" aria-label="Category"><option value="">All categories</option>${cats.map(k=>`<option ${orState.cat===k?"selected":""}>${esc(k)}</option>`).join("")}</select></div>
    <div class="chips" id="orV" style="margin-bottom:14px"><button class="chip${!orState.v?" on":""}" data-v="">All verdicts</button>${vs.map(v=>`<button class="chip${orState.v===v?" on":""}" data-v="${v}"><span class="pill v-${v}" style="border:0;padding:0">${v}</span><span class="n">${c[v]||0}</span></button>`).join("")}</div><div class="ocards" id="orCards"></div>`;
  const draw=()=>{ const q=norm(orState.q); const arr=L.idioms.filter(x=>(!orState.v||x.v===orState.v)&&(!orState.cat||x.cat===orState.cat)&&(!q||norm(x.p).includes(q)||norm(x.m).includes(q)||norm(x.o).includes(q)));
    $("#orCards").innerHTML=arr.map(x=>`<article class="ocard" id="o-${slug(x.p)}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><h3>${hl(x.p,orState.q)}</h3><span class="pill v-${esc(x.v)}">${esc(x.v)}</span></div><p class="m">${rich(x.m)}</p><p class="o">${rich(x.o)}</p><div class="meta"><span>${esc(x.era)}</span><span>${esc(x.region)}</span><span>${esc(x.cat)}</span><span style="margin-left:auto">${starBtn("#origins--"+slug(x.p),x.p,"origin")}</span></div></article>`).join("")||`<div class="empty">No matching phrases.</div>`; };
  $("#orQ").oninput=e=>{orState.q=e.target.value; draw();};
  $("#orCat").onchange=e=>{orState.cat=e.target.value; draw();};
  $("#orV").onclick=e=>{const b=e.target.closest("[data-v]"); if(!b) return; orState.v=b.dataset.v; [...$("#orV").children].forEach(x=>x.classList.toggle("on",x===b)); draw();};
  draw();
}
function drawWords(target){
  const groups=[...new Set(L.wordorigins.map(x=>x.group))];
  if(target) { orState.group=""; orState.q=""; }
  $("#orBody").innerHTML=`<div class="field" style="margin-bottom:12px"><input class="in" id="woQ" placeholder="Filter word stories" value="${esc(orState.q)}" style="flex:1;min-width:180px"></div><div class="chips" id="woG" style="margin-bottom:14px"><button class="chip${!orState.group?" on":""}" data-g="">All</button>${groups.map(g=>`<button class="chip${orState.group===g?" on":""}" data-g="${esc(g)}">${esc(g)}<span class="n">${L.wordorigins.filter(x=>x.group===g).length}</span></button>`).join("")}</div><div class="ocards" id="woCards"></div>`;
  const draw=()=>{ const q=norm(orState.q); const arr=L.wordorigins.filter(x=>(!orState.group||x.group===orState.group)&&(!q||norm(x.w).includes(q)||norm(x.story).includes(q)));
    $("#woCards").innerHTML=arr.map(x=>`<article class="ocard" id="o-${slug(x.w)}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><h3>${hl(x.w,orState.q)}</h3><span class="mono tiny muted">${x.year?("c. "+x.year):""}</span></div><p class="o">${rich(x.story)}</p><div class="meta"><span>From ${esc(x.from)}</span><span>${esc(x.group)}</span>${dictBy.has(norm(x.w))?`<a href="#dictionary--${slug(x.w)}">Dictionary entry →</a>`:""}</div></article>`).join("")||`<div class="empty">No matching stories.</div>`; };
  $("#woQ").oninput=e=>{orState.q=e.target.value; draw();};
  $("#woG").onclick=e=>{const b=e.target.closest("[data-g]"); if(!b) return; orState.group=b.dataset.g; [...$("#woG").children].forEach(x=>x.classList.toggle("on",x===b)); draw();};
  draw();
}
function drawLoans(){
  const max=Math.max(1,...L.loans.map(l=>(l.words||[]).length));
  $("#orBody").innerHTML=`<p class="muted" style="margin:0 0 14px;max-width:70ch">English has borrowed from almost every language its speakers met through trade, conquest, religion and science. Each card lists well-documented borrowings with the original form and meaning.</p><div class="loan-grid">${L.loans.map(l=>`<section class="card loan"><h3>${esc(l.lang)}<small>${(l.words||[]).length} words</small></h3><ul>${(l.words||[]).map(([w,n])=>`<li><b>${dictBy.has(norm(w))?`<a href="#dictionary--${slug(w)}">${esc(w)}</a>`:esc(w)}</b> <span>· ${rich(n)}</span></li>`).join("")}</ul></section>`).join("")}</div>`;
}

/* ===================== ROOTS ===================== */
let rootState={kind:"", q:""};
function rootForms(r){ // "il-/im-/in-/ir-" -> ["il","im","in","ir"]; "the(o)" -> ["the","theo"]
  return String(r.r).split(/[\/,]/).flatMap(s=>{ s=s.trim().replace(/^-|-$/g,"").replace(/-/g,""); const m=s.match(/^(.*)\((.*)\)(.*)$/); return m?[m[1]+m[3],m[1]+m[2]+m[3]]:[s]; }).map(s=>s.toLowerCase().replace(/[^a-z]/g,"")).filter(Boolean);
}
function decompose(word){
  const w=norm(word).replace(/[^a-z]/g,""); if(!w) return [];
  const pre=[],suf=[],roo=[];
  L.roots.forEach(r=>rootForms(r).forEach(f=>{ (r.kind==="prefix"?pre:r.kind==="suffix"?suf:roo).push([f,r]); }));
  const by=a=>a.sort((x,y)=>y[0].length-x[0].length);
  by(pre);by(suf);by(roo);
  let s=w; const head=[],tail=[];
  for(let k=0;k<2;k++){ const p=pre.find(([f])=>f.length>=2 && s.startsWith(f) && s.length-f.length>=3); if(p){ head.push([p[0],p[1]]); s=s.slice(p[0].length);} else break; }
  for(let k=0;k<2;k++){ const x=suf.find(([f])=>f.length>=2 && s.endsWith(f) && s.length-f.length>=3); if(x){ tail.unshift([x[0],x[1]]); s=s.slice(0,s.length-x[0].length);} else break; }
  const mid=[]; let i=0, buf="";
  while(i<s.length){ const m=roo.find(([f])=>f.length>=3 && s.startsWith(f,i)); if(m){ if(buf){mid.push([buf,null]);buf="";} mid.push([m[0],m[1]]); i+=m[0].length; } else { buf+=s[i]; i++; } }
  if(buf) mid.push([buf,null]);
  return [...head,...mid,...tail];
}
function viewRoots(main,item){
  const word=item?item.replace(/-/g," "):"";
  const kinds={root:"var(--c-roots)",prefix:"var(--c-encyclopedia)",suffix:"var(--c-origins)"};
  main.innerHTML = sectionHead("roots","Roots & affixes",`${fmtN(L.roots.length)} Greek, Latin and English building blocks. Type a long word into the builder to see the parts it is made from.`)
  + `<form class="card" id="bForm"><div class="eyebrow" style="margin-bottom:8px">Word builder</div><div class="field"><input class="in" id="bIn" value="${esc(word||"photosynthesis")}" style="flex:1;font-size:1.15rem;font-family:var(--f-display)" aria-label="Word to break down"><button class="btn">Break it down</button></div><div id="bOut"></div></form>
   <div class="field" style="margin:18px 0 12px"><input class="in" id="rQ" placeholder="Filter by element, meaning or example" value="${esc(rootState.q)}" style="flex:1;min-width:180px"><div class="chips" id="rK">${[["","All"],["root","Roots"],["prefix","Prefixes"],["suffix","Suffixes"]].map(([k,l])=>`<button type="button" class="chip${rootState.kind===k?" on":""}" data-k="${k}">${l}<span class="n">${k?L.roots.filter(r=>r.kind===k).length:L.roots.length}</span></button>`).join("")}</div></div>
   <div class="tblwrap"><table class="t"><thead><tr><th>Element</th><th>Type</th><th>Meaning</th><th>Source</th><th>Examples</th></tr></thead><tbody id="rBody"></tbody></table></div>`;
  const build=()=>{ const v=$("#bIn").value.trim(); const parts=decompose(v);
    const known=parts.filter(p=>p[1]).length;
    $("#bOut").innerHTML = parts.length? `<div class="builder-out">${parts.map(([f,r])=>r?`<div class="morph" style="--mc:${kinds[r.kind]}"><b>${esc(f)}</b><span>${esc(r.meaning)}</span><br><span class="mono" style="font-size:.7rem">${esc(r.kind)} · ${esc(r.src)}</span></div>`:`<div class="morph unk"><b>${esc(f)}</b><span>connecting or unlisted part</span></div>`).join("")}</div>
      <p class="tiny muted" style="margin:10px 0 0;font-family:var(--f-ui)">${known?`Found ${known} known element${known>1?"s":""}. The split is automatic; real word histories can be messier.`:"No listed elements found in this word."}${dictBy.has(norm(v))?` <a href="#dictionary--${slug(v)}">See the dictionary entry →</a>`:""}</p>`:""; };
  $("#bForm").onsubmit=e=>{e.preventDefault(); build();};
  const draw=()=>{ const q=norm(rootState.q); const arr=L.roots.filter(r=>(!rootState.kind||r.kind===rootState.kind)&&(!q||norm(r.r).includes(q)||norm(r.meaning).includes(q)||(r.ex||[]).some(x=>norm(x).includes(q)))).sort((a,b)=>a.r.replace(/^-/,"").localeCompare(b.r.replace(/^-/,"")));
    $("#rBody").innerHTML=arr.map(r=>`<tr><td class="el">${hl(r.r,rootState.q)}</td><td><span class="kind" style="color:${kinds[r.kind]}">${esc(r.kind)}</span></td><td>${esc(r.meaning)}</td><td class="muted">${esc(r.src)}</td><td>${(r.ex||[]).map(x=>dictBy.has(norm(x))?`<a href="#dictionary--${slug(x)}">${esc(x)}</a>`:esc(x)).join(", ")}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No matching elements.</td></tr>`; };
  $("#rQ").oninput=e=>{rootState.q=e.target.value; draw();};
  $("#rK").onclick=e=>{const b=e.target.closest("[data-k]"); if(!b) return; rootState.kind=b.dataset.k; [...$("#rK").children].forEach(x=>x.classList.toggle("on",x===b)); draw();};
  draw(); build();
}

/* ===================== ALMANAC ===================== */
const CATC={Sky:"var(--c-rhymes)",Holiday:"var(--c-dictionary)",Sport:"var(--c-thesaurus)",Civic:"var(--c-encyclopedia)",Culture:"var(--c-origins)","US federal":"var(--c-almanac)",Clocks:"var(--ink-3)"};
const ds=(y,m,d)=>`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
function nthDow(y,m,dow,n){ // n>0 nth, n=-1 last
  if(n>0){ const f=new Date(Date.UTC(y,m-1,1)).getUTCDay(); return 1+((dow-f+7)%7)+(n-1)*7; }
  const last=new Date(Date.UTC(y,m,0)); return last.getUTCDate()-((last.getUTCDay()-dow+7)%7);
}
function computedEvents(){
  const Y=2027, ev=[];
  const fed=[["New Year’s Day",1,1],["Martin Luther King Jr. Day",1,nthDow(Y,1,1,3)],["Washington’s Birthday (Presidents’ Day)",2,nthDow(Y,2,1,3)],["Memorial Day",5,nthDow(Y,5,1,-1)],["Juneteenth National Independence Day",6,19],["Independence Day",7,4],["Labor Day",9,nthDow(Y,9,1,1)],["Columbus Day / Indigenous Peoples’ Day",10,nthDow(Y,10,1,2)],["Veterans Day",11,11],["Thanksgiving Day",11,nthDow(Y,11,4,4)],["Christmas Day",12,25]];
  fed.forEach(([t,m,d])=>{ const dow=new Date(Date.UTC(Y,m-1,d)).getUTCDay(); let note=""; if(dow===6) note="Falls on a Saturday; observed Friday "+(d-1)+" "+MONTHS[m-1]+"."; if(dow===0) note="Falls on a Sunday; observed Monday "+(d+1)+" "+MONTHS[m-1]+"."; ev.push({d:ds(Y,m,d),t,cat:"US federal",note}); });
  ev.push({d:ds(Y,3,nthDow(Y,3,0,2)),t:"US & Canada: clocks go forward",cat:"Clocks",note:"Daylight saving time begins at 2:00 a.m. local time."});
  ev.push({d:ds(Y,11,nthDow(Y,11,0,1)),t:"US & Canada: clocks go back",cat:"Clocks",note:"Daylight saving time ends at 2:00 a.m. local time."});
  ev.push({d:ds(Y,3,nthDow(Y,3,0,-1)),t:"EU & UK: clocks go forward",cat:"Clocks",note:"Summer time begins at 01:00 UTC."});
  ev.push({d:ds(Y,10,nthDow(Y,10,0,-1)),t:"EU & UK: clocks go back",cat:"Clocks",note:"Summer time ends at 01:00 UTC."});
  ev.push({d:ds(Y,5,nthDow(Y,5,0,2)),t:"Mother’s Day (US, Canada, many others)",cat:"Holiday",note:""});
  ev.push({d:ds(Y,6,nthDow(Y,6,0,3)),t:"Father’s Day (US, UK, Canada, many others)",cat:"Holiday",note:""});
  return ev;
}
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
let ALM=null;
function almanacAll(){ if(!ALM){ ALM=[...L.almanac.filter(e=>!(e.cat==="Holiday"&&/^(New Year’s Day|Christmas Day)$/.test(e.t))),...computedEvents()].sort((a,b)=>a.d.localeCompare(b.d)||a.t.localeCompare(b.t)); } return ALM; }
function dayDiff(a,b){ return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5); }
function parseD(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function nextAlmanac(){
  const now=new Date(); const jan1=new Date(2027,0,1);
  if(now<jan1) return {label:"until 1 January 2027",days:dayDiff(now,jan1),sub:"2027 starts on a Friday. Next big date after that: the annular solar eclipse and Lunar New Year on 6 February."};
  const up=almanacAll().find(e=>parseD(e.d)>=new Date(now.getFullYear(),now.getMonth(),now.getDate()) && !e.month);
  return up? {label:"until "+up.t, days:dayDiff(now,parseD(up.d)), sub:fmtDate(up.d)+(up.note?" · "+up.note:"")} : {label:"2027 has ended",days:0,sub:""};
}
function countdownHTML(n){ return `<div class="count" style="margin-top:6px"><b>${fmtN(n.days)}</b> <span style="font-family:var(--f-ui);font-weight:600">day${n.days===1?"":"s"} ${esc(n.label)}</span></div><p class="muted" style="margin:8px 0 0;font-size:.92rem">${esc(n.sub)}</p>`; }
function fmtDate(s,short){ const d=parseD(s); return d.toLocaleDateString("en-GB",{weekday:short?undefined:"short",day:"numeric",month:short?"short":"long"}); }
let almSel=null, almCat="";
function viewAlmanac(main){
  const all=almanacAll(); const byDay={}; all.forEach(e=>{ (byDay[e.d]=byDay[e.d]||[]).push(e); if(e.end){ let d=parseD(e.d); const end=parseD(e.end); d.setDate(d.getDate()+1); while(d<=end && d.getFullYear()===2027){ const k=ds(d.getFullYear(),d.getMonth()+1,d.getDate()); (byDay[k]=byDay[k]||[]).push(Object.assign({},e,{cont:true})); d.setDate(d.getDate()+1);} } });
  const n=nextAlmanac(); const isoWeeks= (new Date(2027,0,1).getDay()===4||new Date(2027,11,31).getDay()===4)?53:52;
  const todayK=(()=>{const t=new Date(); return ds(t.getFullYear(),t.getMonth()+1,t.getDate());})();
  const cats=[...new Set(all.map(e=>e.cat))];
  main.innerHTML = sectionHead("almanac","Almanac 2027",`The year at a glance: eclipses and meteor showers, holidays across calendars, elections, world championships and the anniversaries 2027 will mark. Click any date.`)
  + `<div class="alm-top"><div class="card">${countdownHTML(n)}</div>
     <div class="card"><div class="eyebrow">The year itself</div><dl class="kv" style="margin-top:8px"><dt>Starts</dt><dd>Friday 1 January</dd><dt>Length</dt><dd>365 days (not a leap year)</dd><dt>ISO weeks</dt><dd>${isoWeeks}</dd><dt>Chinese zodiac</dt><dd>Fire Goat, from 6 Feb</dd><dt>Hebrew year</dt><dd>5787 → 5788 on 2 Oct</dd><dt>Islamic year</dt><dd>1448 → 1449 AH on ~6 Jun</dd></dl></div>
     <div class="card"><div class="eyebrow">Headline event</div><h3 style="font-size:1.25rem;margin:6px 0">Total solar eclipse · 2 August</h3><p class="muted" style="margin:0;font-size:.93rem">Up to 6 min 23 s of totality near Luxor, Egypt, along a path from southern Spain across North Africa to Arabia. The longest total eclipse over land until 2114.</p></div></div>
   <div class="chips" id="almC" style="margin-bottom:12px"><button class="chip${!almCat?" on":""}" data-c="">All</button>${cats.map(c=>`<button class="chip${almCat===c?" on":""}" data-c="${esc(c)}"><span class="catdot" style="--dc:${CATC[c]||"var(--ink-3)"}">${esc(c)}</span><span class="n">${all.filter(e=>e.cat===c).length}</span></button>`).join("")}</div>
   <div class="two"><div class="months" id="almM"></div><div class="stack"><section class="card" id="almDay"></section><section class="card"><div class="eyebrow" style="margin-bottom:10px">Anniversaries in 2027</div><div class="anniv">${L.anniv.slice().sort((a,b)=>b.n-a.n||a.y-b.y).map(a=>`<div><b>${a.n}</b><span>${esc(a.t)} <small>${a.y}</small></span></div>`).join("")}</div></section></div></div>
   <section class="card" style="margin-top:16px"><div class="eyebrow" style="margin-bottom:6px">Every event, in order</div><div class="evlist" id="almList"></div></section>`;
  const drawM=()=>{ $("#almM").innerHTML=MONTHS.map((mn,mi)=>{ const first=new Date(2027,mi,1).getDay(); const lead=(first+6)%7; const days=new Date(2027,mi+1,0).getDate(); let cells=["M","T","W","T","F","S","S"].map(x=>`<span class="dh">${x}</span>`).join("")+"<span></span>".repeat(lead);
      let cnt=0;
      for(let d=1;d<=days;d++){ const k=ds(2027,mi+1,d); const evs=(byDay[k]||[]).filter(e=>!almCat||e.cat===almCat); if(evs.some(e=>!e.cont)) cnt+=evs.filter(e=>!e.cont).length; const dow=(lead+d-1)%7; const cs=[...new Set(evs.map(e=>e.cat))].slice(0,3);
        cells+=`<button class="${dow>=5?"we ":""}${evs.length?"has ":""}${almSel===k?"sel ":""}${k===todayK?"today":""}" data-d="${k}" aria-label="${d} ${mn}${evs.length?", "+evs.length+" events":""}">${d}${cs.length?`<span class="dots">${cs.map(c=>`<i style="--dc:${CATC[c]}"></i>`).join("")}</span>`:""}</button>`; }
      return `<div class="month"><h4>${mn}<small>${cnt?cnt+" events":""}</small></h4><div class="mg">${cells}</div></div>`; }).join(""); };
  const drawDay=()=>{ const k=almSel; const evs=k?(byDay[k]||[]):[];
    $("#almDay").innerHTML = k? `<div class="eyebrow">${esc(fmtDate(k))} 2027</div>${evs.length?evs.map(evRow).join(""):`<p class="muted">Nothing listed for this day.</p>`}` : `<div class="eyebrow">Pick a date</div><p class="muted" style="margin:6px 0 0">Coloured dots mark events. Multi-day events such as tournaments shade every day they run.</p>`; };
  const drawList=()=>{ $("#almList").innerHTML=all.filter(e=>!almCat||e.cat===almCat).map(evRow).join(""); };
  $("#almM").onclick=e=>{const b=e.target.closest("[data-d]"); if(!b) return; almSel=b.dataset.d; drawM(); drawDay(); if(window.innerWidth<=1100) $("#almDay").scrollIntoView({behavior:"smooth",block:"nearest"}); };
  $("#almC").onclick=e=>{const b=e.target.closest("[data-c]"); if(!b) return; almCat=b.dataset.c; [...$("#almC").children].forEach(x=>x.classList.toggle("on",x===b)); drawM(); drawList();};
  drawM(); drawDay(); drawList();
}
function evRow(e){
  const range=e.end? (fmtDate(e.d,true)+" – "+(e.end.startsWith("2028")?parseD(e.end).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):fmtDate(e.end,true))) : "";
  return `<div class="ev"><div class="dt">${e.month?`<b>${MONTHS[parseD(e.d).getMonth()].slice(0,3)}</b>month`:`<b>${parseD(e.d).getDate()} ${MONTHS[parseD(e.d).getMonth()].slice(0,3)}</b>${parseD(e.d).toLocaleDateString("en-GB",{weekday:"long"})}`}</div><div><h4>${esc(e.t)} <span class="catdot" style="--dc:${CATC[e.cat]||"var(--ink-3)"}">${esc(e.cat)}</span></h4>${range?`<p class="mono tiny">${esc(range)}</p>`:""}${e.note?`<p>${esc(e.note)}</p>`:""}</div></div>`;
}

/* ===================== GLOBAL SEARCH ===================== */
let sIdx=-1, sItems=[];
function searchAll(q){
  q=norm(q); if(!q) return [];
  const out=[]; const score=(t)=>{ t=norm(t); return t===q?0: t.startsWith(q)?1: t.includes(q)?2: 9; };
  const add=(grp,label,desc,href,s)=>{ if(s<9) out.push({grp,label,desc,href,s}); };
  L.dict.forEach(d=>add("Dictionary",d.w,d.defs[0],"#dictionary--"+slug(d.w),score(d.w)));
  L.thes.forEach(t=>add("Thesaurus",t.w,t.pos+" · "+(t.senses[0].syn||[]).slice(0,4).join(", "),"#thesaurus--"+slug(t.w),score(t.w)));
  L.ency.forEach(a=>add("Encyclopedia",a.t,a.sum,"#encyclopedia--"+slug(a.t),Math.min(score(a.t),norm(a.sum).includes(q)&&q.length>3?3:9)));
  L.idioms.forEach(x=>add("Phrase origins",x.p,x.m,"#origins--"+slug(x.p),score(x.p)));
  L.wordorigins.forEach(x=>add("Word stories",x.w,x.story,"#origins--"+slug(x.w),score(x.w)));
  L.roots.forEach(r=>add("Roots & affixes",r.r,r.meaning+" · "+r.src,"#roots--"+slug((r.ex||[])[0]||r.r),Math.min(score(r.r.replace(/-/g,"")),score(r.meaning)+1)));
  const f=rhymeOf.get(q); if(f) out.push({grp:"Rhymes",label:"Rhymes for “"+q+"”",desc:f.sound+" · "+(f.one||[]).slice(0,6).join(", "),href:"#rhymes--"+slug(q),s:0});
  else if(q.length>1) out.push({grp:"Rhymes",label:"Find rhymes for “"+q+"”",desc:"Rhyming dictionary",href:"#rhymes--"+slug(q),s:5});
  const order=["Dictionary","Thesaurus","Encyclopedia","Phrase origins","Word stories","Rhymes","Roots & affixes"];
  out.sort((a,b)=>a.s-b.s||order.indexOf(a.grp)-order.indexOf(b.grp)||a.label.length-b.label.length);
  const per={}; return out.filter(x=>(per[x.grp]=(per[x.grp]||0)+1)<=5).sort((a,b)=>order.indexOf(a.grp)-order.indexOf(b.grp)||a.s-b.s);
}
function runSearch(q,open){
  const box=$("#sres"); sItems=searchAll(q); sIdx=sItems.length?0:-1;
  if(!q.trim()){ box.hidden=true; return; }
  let html="",last=""; sItems.forEach((it,i)=>{ if(it.grp!==last){ html+=`<div class="grp eyebrow">${esc(it.grp)}</div>`; last=it.grp; } html+=`<button data-i="${i}" class="${i===sIdx?"on":""}"><span class="k">${hl(it.label,q)}</span><span class="d">${esc(it.desc)}</span></button>`; });
  box.innerHTML=html||`<div class="empty">Nothing found for “${esc(q)}”.</div>`;
  box.hidden=false;
}
function closeSearch(){ $("#sres").hidden=true; }
$("#q").addEventListener("input",e=>runSearch(e.target.value,true));
$("#q").addEventListener("focus",e=>{ if(e.target.value.trim()) runSearch(e.target.value,true); });
$("#q").addEventListener("keydown",e=>{
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); if(!sItems.length) return; sIdx=(sIdx+(e.key==="ArrowDown"?1:-1)+sItems.length)%sItems.length; [...$("#sres").querySelectorAll("button")].forEach(b=>b.classList.toggle("on",+b.dataset.i===sIdx)); const on=$("#sres button.on"); if(on) on.scrollIntoView({block:"nearest"}); }
  else if(e.key==="Enter"){ e.preventDefault(); const it=sItems[sIdx]; if(it){ location.hash=it.href; closeSearch(); e.target.blur(); } }
  else if(e.key==="Escape"){ closeSearch(); e.target.blur(); }
});
$("#sres").addEventListener("mousedown",e=>{ const b=e.target.closest("button[data-i]"); if(!b) return; e.preventDefault(); location.hash=sItems[+b.dataset.i].href; closeSearch(); $("#q").blur(); });
document.addEventListener("click",e=>{ if(!e.target.closest("#searchBox")) closeSearch(); });
document.addEventListener("keydown",e=>{ if(e.key==="/" && document.activeElement.tagName!=="INPUT" && document.activeElement.tagName!=="SELECT"){ e.preventDefault(); $("#q").focus(); } });

/* ---------- global delegated actions ---------- */
document.addEventListener("click",e=>{
  const s=e.target.closest("[data-star]");
  if(s){ e.preventDefault(); toggleSave(s.dataset.star,s.dataset.label,s.dataset.kind); const on=isSaved(s.dataset.star); s.classList.toggle("on",on); s.lastChild.textContent=on?"Saved":"Save"; return; }
  const sp=e.target.closest("[data-speak]");
  if(sp){ e.preventDefault(); try{ if(!("speechSynthesis" in window)) throw 0; const u=new SpeechSynthesisUtterance(sp.dataset.speak); u.lang="en-US"; u.rate=.9; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(_){ toast("Speech isn’t available in this browser"); } }
});
$("#randBtn").onclick=()=>{
  const pools=[["dictionary",L.dict,x=>x.w],["encyclopedia",L.ency,x=>x.t],["thesaurus",L.thes,x=>x.w],["origins",L.idioms,x=>x.p]].filter(p=>p[1].length);
  const p=pools[Math.floor(Math.random()*pools.length)]; const x=p[1][Math.floor(Math.random()*p[1].length)];
  location.hash="#"+p[0]+"--"+slug(p[2](x));
};
(function theme(){
  const root=document.documentElement; const saved=store.get("theme",null); if(saved) root.dataset.theme=saved;
  $("#themeBtn").onclick=()=>{ const cur=root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"); const nx=cur==="dark"?"light":"dark"; root.dataset.theme=nx; store.set("theme",nx); };
})();

window.addEventListener("hashchange",route);
route();
})();
