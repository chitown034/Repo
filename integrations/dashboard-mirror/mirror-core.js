/* ===== THREE-DASHBOARD MIRROR (2026-11-08, Steven: "ensure all data and feeds from command desk, broker dashboard and loan dashboard are linked and mirrored across all 3 dashboards").
   Each dashboard writes its own snapshot into its own database (Broker: state/bccMetrics, Loan: state/loanMetrics; the Command Deck's feeds are already there).
   The Deck relay scheduled task (06:13 · 10:13 · 14:13 · 18:13 PT) copies every feed in MIR_FEEDS into the other two dashboards' `state` collection, unchanged.
   This module reads them live and renders the same Mirror page on every dashboard. It never invents a value: a feed that has not arrived shows "awaiting relay". ===== */
var MIR=(function(){
 var URLS={deck:'https://claude.ai/artifact/3jbdGMNFkGLEpJiZ3cTmZW',bcc:'https://claude.ai/artifact/XFx2H7cf8mnS8e8hjFzxNg',loan:'https://claude.ai/artifact/Ce5m1WNWsQW7y2u91EA8az',ret:'https://claude.ai/artifact/QKRB5uNwSuEyxd7C9obPGf'};
 var NAMES={deck:'Command Deck',bcc:'Broker Command Center',loan:'Loan Dashboard',ret:'Retirement Dashboard'};
 var FEEDS=[
  ['bccMetrics','bcc','Broker metrics','pipeline, deals, loans, tasks, calls, SLA, health, integrations'],
  ['loanMetrics','loan','Loan metrics','pipeline, leads, speed-to-lead, rate locks, Handoff Board, approvals'],
  ['retirementMetrics','ret','Retirement plan','plan success, nest egg at retirement, income gap, Social Security claim age'],
  ['loftyLeads','deck','Lofty CRM','stage totals, new leads, speed-to-lead'],
  ['zohoSync','deck','Zoho CRM status','connection health'],
  ['zohoLeads','deck','Zoho CRM leads','14-stage counts'],
  ['zohoDeals','deck','Zoho CRM deals','deal stages and amounts'],
  ['ratesSnapshot','deck','Rates & benchmarks','PMMS, indices, active listings'],
  ['refiWatchDesk','deck','Refi watch','candidates above the spread'],
  ['leadResponse','deck','Speed-to-lead monitor','first-response minutes'],
  ['cosBrief','deck','Vanessa daily brief','headline and Needs-Steven'],
  ['bigMoves','deck','Big moves','today’s top 10'],
  ['aiTeamOrg','deck','AI org chart','seats, pods, lanes'],
  ['marketSnapshot','deck','Markets','indices and movers'],
  ['newsSnapshot','deck','News','local and global headlines'],
  ['weatherSnapshot','deck','Weather','your cities'],
  ['feedFreshness','deck','Feed freshness','which deck feeds are stale']];
 var S={self:null,db:null,docs:{},err:null,ready:false,onChange:null,pushedAt:null};
 function e(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function stamp(v){if(!v||typeof v!=='object'||Array.isArray(v))return null;return v.syncedAt||v.checkedAt||v.ranAt||v.generated||v.asOf||v.date||null}
 function age(iso){if(!iso)return '—';var t=new Date(iso).getTime();if(!isFinite(t))return String(iso);var h=(Date.now()-t)/36e5;if(h<0)return 'just now';return h<1?Math.round(h*60)+' min ago':h<48?Math.round(h)+' h ago':Math.round(h/24)+' d ago'}
 function fresh(iso,hrs){if(!iso)return false;var t=new Date(iso).getTime();return isFinite(t)&&(Date.now()-t)<hrs*36e5}
 function n(x){return (typeof x==='number'&&isFinite(x))?x:null}
 function money(x){x=n(x);return x==null?'—':'$'+Math.round(x).toLocaleString('en-US')}
 function get(id){var d=S.docs[id];return d&&d.v!==undefined?d.v:null}
 function summary(id,v){try{
  if(v==null)return '';
  if(v.status==='awaiting')return v.note||'source not written yet';
  switch(id){
   case 'bccMetrics':return (v.pipeline?v.pipeline.total+' in pipeline · ':'')+(v.deals?v.deals.active+' active deals ('+money(v.deals.volume)+') · ':'')+(v.loans?v.loans.total+' loans in process · ':'')+(v.tasks?v.tasks.overdue+' tasks overdue':'');
   case 'loanMetrics':return (v.pipeline?v.pipeline.total+' in loan pipeline'+(v.pipeline.sample?' (sample data)':'')+' · ':'')+(v.leads?v.leads.total+' leads, '+v.leads.uncontacted+' not yet contacted · ':'')+(v.locks?v.locks.active+' rate locks, '+v.locks.expiring5d+' expiring ≤5 d · ':'')+(v.handoff?v.handoff.needsSteven+' Handoff cards need you':'');
   case 'retirementMetrics':return (v.successPct!=null?v.successPct+'% plan success · ':'')+(v.nestEggAtRetire!=null?money(v.nestEggAtRetire)+' at retirement · ':'')+(v.retireAge!=null?'retire at '+v.retireAge:'')+(v.ssClaimAge!=null?' · SS at '+v.ssClaimAge:'');
   case 'loftyLeads':return (v.status||'')+(Array.isArray(v.stageTotals)?' · '+v.stageTotals.reduce(function(a,r){return a+(+r[1]||0)},0)+' leads':'')+(v.firstResponse&&v.firstResponse.medianMin!=null?' · median first response '+v.firstResponse.medianMin+' min':'');
   case 'zohoSync':return (v.status||'')+(v.leads!=null?' · '+v.leads+' leads':'')+(v.deals!=null?' · '+v.deals+' deals':'')+(v.status!=='ok'&&v.error?' · '+String(v.error).slice(0,120):'');
   case 'zohoLeads':return v.counts?Object.keys(v.counts).filter(function(k){return v.counts[k]}).map(function(k){return k+' '+v.counts[k]}).join(' · '):'';
   case 'zohoDeals':return (Array.isArray(v.deals)?v.deals.length+' deals':'')+(v.totalAmount!=null?' · '+money(v.totalAmount):'');
   case 'ratesSnapshot':return (v.benchmarks||[]).slice(0,3).map(function(b){return b.name.replace(/\s*\(.*\)/,'')+' '+b.rate+'%'}).join(' · ');
   case 'refiWatchDesk':return (v.flagged||[]).length+' flagged of '+(v.listSize||0)+(v.marketAverage&&v.marketAverage.thirty?' · 30-yr avg '+String(v.marketAverage.thirty).split(' ')[0]:'');
   case 'leadResponse':return (v.status||'')+' · '+(v.breaches||0)+' over '+(v.target||5)+' min of '+(v.leadsChecked||0)+(v.medianMinutes!=null?' · median '+v.medianMinutes+' min':'');
   case 'cosBrief':return (v.headline?String(v.headline).slice(0,140)+' · ':'')+((v.needsSteven||[]).length)+' Needs-Steven';
   case 'bigMoves':return (v.items||[]).slice(0,3).map(function(i){return '#'+i.rank+' '+i.title}).join(' · ');
   case 'aiTeamOrg':return (v.seats||[]).length+' seats · '+(v.pods||[]).length+' pods';
   case 'marketSnapshot':return (v.indices||[]).slice(0,3).map(function(i){return (i.name||i.n||'')+' '+(i.change||i.chg||i.value||'')}).join(' · ');
   case 'newsSnapshot':var L=v.local||{};return Object.keys(L).map(function(k){return k+' '+(L[k]||[]).length}).join(' · ');
   case 'weatherSnapshot':return (v.cities||[]).slice(0,3).map(function(c){return c.city+' '+c.temp+'°'}).join(' · ');
   case 'feedFreshness':return v.counts?Object.keys(v.counts).map(function(k){return k+' '+v.counts[k]}).join(' · '):'';
  }}catch(x){}return ''}
 function start(self,writeOwn){S.self=self;
  setTimeout(function(){var p;try{p=window.claude&&window.claude.use&&window.claude.use('db')}catch(x){p=null}
   if(!p||typeof p.then!=='function'){S.err='No shared database in this view (open the page signed in on claude.ai)';fire();return}
   p.then(function(db){if(!db){S.err='No shared database in this view';fire();return}S.db=db;
    try{db.collection('state').onSnapshot(function(snap){(snap.docs||[]).forEach(function(d){var x;try{x=d.data()}catch(y){x=null}if(x)S.docs[d.id]=x});S.ready=true;S.err=null;fire()},function(er){S.err=(er&&(er.code||er.message))||'read failed';fire()})}catch(x){S.err=String(x&&x.message||x);fire()}
    if(writeOwn)writeOwn(db)}).catch(function(er){S.err=String(er&&er.message||er);fire()})},4000)}
 function fire(){if(typeof S.onChange==='function')try{S.onChange()}catch(x){}}
 function rows(){return FEEDS.map(function(f){var id=f[0],v=get(id),own=f[1]===S.self,st=stamp(v);var src=own?'this dashboard':NAMES[f[1]];
  var badge=v==null?(own&&id!=='bccMetrics'&&id!=='loanMetrics'?'local':'awaiting relay'):(v.status==='awaiting'?'awaiting source':fresh(st,30)?'fresh':'stale');
  return {id:id,from:f[1],src:src,label:f[2],about:f[3],v:v,stamp:st,badge:badge,line:summary(id,v)}})}
 function kpi(label,val,sub,cls){return '<div class="'+(S.cls||'card')+'" style="padding:10px;min-width:140px;flex:1"><div class="sm mut" style="font-size:12px;opacity:.75">'+e(label)+'</div><div style="font-size:22px;font-weight:700" class="'+(cls||'')+'">'+e(val==null?'—':val)+'</div>'+(sub?'<div style="font-size:12px;opacity:.75">'+e(sub)+'</div>':'')+'</div>'}
 function html(){var R=rows(),ok=R.filter(function(r){return r.badge==='fresh'}).length;
  var b=get('bccMetrics'),l=get('loanMetrics'),z=get('zohoSync'),lf=get('loftyLeads'),cb=get('cosBrief'),bm=get('bigMoves'),rs=get('ratesSnapshot');
  var links=['deck','bcc','loan','ret'].map(function(k){return '<a class="btn ghost sm" style="margin:2px" href="'+URLS[k]+'" target="_blank" rel="noopener">'+e(NAMES[k])+(k===S.self?' (this one)':'')+' ↗</a>'}).join('');
  var h='<div class="'+(S.cls||'card')+'" style="border-left:4px solid #c9a227"><h3 style="margin:0">Three-dashboard mirror <span style="font-size:13px;opacity:.7">'+ok+' of '+R.length+' feeds fresh · '+(S.err?e(S.err):S.ready?'live from this dashboard’s database':'connecting…')+'</span></h3>'
   +'<p style="font-size:13px;margin:6px 0">The Command Deck, the Broker Command Center and the Loan Dashboard each write their own feed; the <b>Deck relay</b> (06:13 · 10:13 · 14:13 · 18:13 PT) copies every feed below into the others (the Retirement Dashboard included), unchanged, so all three show the same numbers. Values are shown exactly as the source wrote them, with the source’s own time stamp.</p><div>'+links+'</div></div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0">'
   +kpi('Broker pipeline',b&&b.pipeline?b.pipeline.total:null,b?'Broker · '+age(b.syncedAt):'awaiting relay')
   +kpi('Active deals',b&&b.deals?b.deals.active:null,b&&b.deals?money(b.deals.volume):'')
   +kpi('Loan pipeline',l&&l.pipeline?l.pipeline.total:null,l?'Loan · '+age(l.syncedAt)+(l.pipeline&&l.pipeline.sample?' · sample data':''):'awaiting relay')
   +kpi('Loan leads not contacted',l&&l.leads?l.leads.uncontacted:null,l&&l.leads?l.leads.over5min+' past 5 min':'',l&&l.leads&&l.leads.over5min?'bad':'')
   +kpi('Lofty leads',lf&&Array.isArray(lf.stageTotals)?lf.stageTotals.reduce(function(a,r){return a+(+r[1]||0)},0):null,lf?(lf.status||'')+' · '+age(lf.syncedAt):'awaiting relay')
   +kpi('Zoho CRM',z?z.status:null,z?age(z.checkedAt):'awaiting relay',z&&z.status!=='ok'?'bad':'')
   +kpi('Needs Steven (Vanessa)',cb?(cb.needsSteven||[]).length:null,cb?'brief '+(cb.date||''):'awaiting relay')
   +kpi('30-yr PMMS',rs&&rs.benchmarks&&rs.benchmarks[0]?rs.benchmarks[0].rate+'%':null,rs&&rs.benchmarks&&rs.benchmarks[0]?rs.benchmarks[0].asOf:'')+'</div>';
  h+='<div class="'+(S.cls||'card')+'"><h4 style="margin:0 0 6px">Every linked feed</h4><div style="overflow:auto"><table style="width:100%;font-size:13px;border-collapse:collapse"><thead><tr><th style="text-align:left">Feed</th><th style="text-align:left">From</th><th style="text-align:left">Stamp</th><th style="text-align:left">Status</th><th style="text-align:left">What it says</th></tr></thead><tbody>'
   +R.map(function(r){var c=r.badge==='fresh'?'#2e7d32':r.badge==='stale'?'#b26a00':'#888';return '<tr style="border-top:1px solid rgba(128,128,128,.25)"><td><b>'+e(r.label)+'</b><div style="opacity:.7">'+e(r.about)+' · <code>'+e(r.id)+'</code></div></td><td>'+e(r.src)+'</td><td>'+e(age(r.stamp))+'</td><td><span style="color:'+c+';font-weight:600">'+e(r.badge)+'</span></td><td>'+e(r.line)+(r.v!=null?'<details><summary style="cursor:pointer;opacity:.75">raw</summary><pre style="white-space:pre-wrap;max-height:260px;overflow:auto;font-size:11px">'+e(JSON.stringify(r.v,null,1).slice(0,20000))+'</pre></details>':'')+'</td></tr>'}).join('')+'</tbody></table></div></div>';
  if(cb&&(cb.needsSteven||[]).length)h+='<div class="'+(S.cls||'card')+'"><h4 style="margin:0 0 6px">Needs Steven — from Vanessa’s brief ('+e(cb.date||'')+')</h4><ol style="font-size:13px;margin:0 0 0 18px">'+cb.needsSteven.slice(0,5).map(function(x){return '<li>'+e(x.task||x)+(x.deadline?' <span style="opacity:.7">· '+e(x.deadline)+'</span>':'')+'</li>'}).join('')+'</ol></div>';
  if(bm&&(bm.items||[]).length)h+='<div class="'+(S.cls||'card')+'"><h4 style="margin:0 0 6px">Big moves — top 10 ('+e(bm.date||'')+')</h4><ol style="font-size:13px;margin:0 0 0 18px">'+bm.items.slice(0,10).map(function(i){return '<li>'+e(i.title)+' <span style="opacity:.7">· '+e(i.owner||'')+' · '+e(i.value||'')+(i.decision?' · '+e(i.decision):'')+'</span></li>'}).join('')+'</ol></div>';
  return h}
 function tool(){return {name:'mirror_feeds',description:'The three-dashboard mirror: every feed shared between the Command Deck, the Broker Command Center and the Loan Dashboard (broker metrics, loan metrics, Lofty, Zoho, rates, refi watch, speed-to-lead, Vanessa brief, big moves, AI org chart, markets, news, weather, freshness), each with its source time stamp. Optional feed id for the full document.',inputSchema:{type:'object',properties:{feed:{type:'string'}}},execute:function(a){var f=a&&a.feed;if(f)return {feed:f,doc:get(f)};return rows().map(function(r){return {id:r.id,from:r.src,stamp:r.stamp,status:r.badge,summary:r.line}})}}}
 return {start:start,html:html,rows:rows,get:get,age:age,tool:tool,S:S,URLS:URLS,NAMES:NAMES,FEEDS:FEEDS}})();
