/* Credit Report Simulator — HEURISTIC model (not FICO). Estimates the direction and rough size of score changes for
   mortgage scoring models (FICO 2/4/5 classic) from actions taken on tradelines. Deltas are calibrated to published
   FICO factor weights (payment history 35%, amounts owed 30%, length 15%, mix 10%, new credit 10%) and common rescore
   outcomes; always show a range and the "verify with a rapid rescore" note. Mirrors the §17.6 heuristic_score_sim contract. */
const SAMPLE_TRADELINES = [
  {id:"t1",creditor:"Chase Freedom",type:"revolving",balance:4850,limit:5000,payment:145,opened:"2019-03",status:"current",lates:[],au:false},
  {id:"t2",creditor:"Capital One",type:"revolving",balance:2900,limit:3000,payment:90,opened:"2021-07",status:"current",lates:[],au:false},
  {id:"t3",creditor:"Navy Federal Visa",type:"revolving",balance:1200,limit:10000,payment:40,opened:"2016-11",status:"current",lates:[{months:9,days:30}],au:false},
  {id:"t4",creditor:"Discover (AU — spouse)",type:"revolving",balance:300,limit:8000,payment:25,opened:"2012-05",status:"current",lates:[],au:true},
  {id:"t5",creditor:"USAA Auto",type:"installment",balance:14200,limit:28000,payment:455,opened:"2022-09",status:"current",lates:[],au:false},
  {id:"t6",creditor:"Nelnet Student Loan",type:"installment",balance:23000,limit:31000,payment:0,opened:"2015-08",status:"deferred",lates:[],au:false},
  {id:"t7",creditor:"Midland Credit (collection — Verizon)",type:"collection",balance:680,limit:0,payment:0,opened:"2024-02",status:"collection",dofd:"2023-06",medical:false,au:false},
  {id:"t8",creditor:"Radius Global (collection — ER visit)",type:"collection",balance:410,limit:0,payment:0,opened:"2023-11",status:"collection",dofd:"2023-03",medical:true,au:false},
];
const SAMPLE_INQUIRIES=[{creditor:"Carvana",months:4},{creditor:"Synchrony",months:7},{creditor:"Patriot Pacific (mortgage)",months:0}];
const SAMPLE_SCORE=642;

const ACTIONS = {
  revolving:[
    {id:"pay30",label:"Pay down to 30% of limit",cost:t=>Math.max(0,t.balance-t.limit*0.30)},
    {id:"pay10",label:"Pay down to 10% of limit",cost:t=>Math.max(0,t.balance-t.limit*0.10)},
    {id:"pay0",label:"Pay to $0 (keep open)",cost:t=>t.balance},
    {id:"close",label:"Pay off AND close",cost:t=>t.balance,warn:"Closing reduces available credit; utilization on remaining cards rises."},
    {id:"limit",label:"Request limit increase (+50%)",cost:()=>0,warn:"May trigger a hard inquiry; not possible on most AU cards."},
    {id:"removeAU",label:"Remove authorized-user tradeline",cost:()=>0,warn:"Loses the account's age and limit."},
    {id:"fixlate",label:"Remove an inaccurate late (dispute/goodwill)",cost:()=>0,warn:"Only if inaccurate (dispute) or creditor agrees (goodwill)."},
  ],
  installment:[
    {id:"paydown50",label:"Pay down 50%",cost:t=>t.balance*0.5},
    {id:"payoff",label:"Pay off",cost:t=>t.balance,warn:"Minimal score gain; big DTI gain."},
    {id:"fixlate",label:"Remove an inaccurate late",cost:()=>0},
  ],
  collection:[
    {id:"pay",label:"Pay in full (stays as 'paid')",cost:t=>t.balance,warn:"Classic FICO still counts a paid collection; newer models ignore it."},
    {id:"pfd",label:"Pay-for-delete (collector agrees in writing)",cost:t=>t.balance},
    {id:"delete",label:"Delete — inaccurate / obsolete / medical policy",cost:()=>0,warn:"Only for inaccurate, >7-yr, or qualifying medical items."},
    {id:"settle",label:"Settle for 50% (stays as 'settled')",cost:t=>t.balance*0.5},
  ],
};
const UTIL_TIERS=[[0.09,0],[0.29,-10],[0.49,-25],[0.74,-42],[0.89,-58],[1.01,-72]];
const utilPenalty=u=>{for(const [max,p] of UTIL_TIERS) if(u<=max) return p; return -80};
const monthsSince=ym=>{const [y,m]=ym.split("-").map(Number);const d=new Date();return (d.getFullYear()-y)*12+(d.getMonth()+1-m)};

function scoreModel(tradelines,inquiries){
  const rev=tradelines.filter(t=>t.type==="revolving"&&t.status!=="closed");
  const lim=rev.reduce((a,t)=>a+t.limit,0), bal=rev.reduce((a,t)=>a+t.balance,0);
  const util=lim?bal/lim:0;
  let s=0, notes=[];
  // amounts owed
  s+=utilPenalty(util); notes.push(["Aggregate utilization",`${(util*100).toFixed(0)}%`,utilPenalty(util)]);
  const maxed=rev.filter(t=>t.limit&&t.balance/t.limit>0.9).length; if(maxed){s-=8*maxed;notes.push(["Cards over 90%",maxed,-8*maxed]);}
  const zeroAll=rev.length&&rev.every(t=>t.balance===0); if(zeroAll){s-=5;notes.push(["All revolving at $0 (no activity)","",-5]);}
  // payment history
  tradelines.forEach(t=>(t.lates||[]).forEach(l=>{const p=l.months<12?(l.days>=60?-55:-38):l.months<24?-22:-9;s+=p;notes.push([`${l.days}-day late — ${t.creditor} (${l.months} mo ago)`,"",p]);}));
  tradelines.filter(t=>t.type==="collection").forEach(t=>{const age=monthsSince(t.dofd||t.opened);let p=t.status==="deleted"?0:age<24?-40:age<48?-25:-12;if(t.status==="paid"||t.status==="settled")p=Math.round(p*0.85);if(t.medical&&t.status!=="deleted")p=Math.round(p*0.6);if(p){s+=p;notes.push([`Collection — ${t.creditor} (${t.status})`,"",p]);}});
  // length
  const ages=tradelines.filter(t=>t.status!=="deleted"&&t.type!=="collection").map(t=>monthsSince(t.opened));
  const aaoa=ages.length?ages.reduce((a,b)=>a+b,0)/ages.length:0; const agePts=aaoa>=96?0:aaoa>=60?-6:aaoa>=36?-14:-24; s+=agePts; notes.push(["Average age of accounts",`${(aaoa/12).toFixed(1)} yrs`,agePts]);
  // mix
  const types=new Set(tradelines.filter(t=>t.status!=="deleted"&&t.type!=="collection").map(t=>t.type)); const mixPts=types.size>=2?0:-8; s+=mixPts; if(mixPts)notes.push(["Credit mix (one type only)","",mixPts]);
  const thin=tradelines.filter(t=>t.status!=="deleted"&&t.type!=="collection").length; if(thin<3){s-=10;notes.push(["Thin file (<3 tradelines)","",-10]);}
  // new credit
  const inq=inquiries.filter(i=>i.months<12).length; const inqPts=-Math.min(20,inq*4); s+=inqPts; if(inqPts)notes.push(["Hard inquiries <12 mo",inq,inqPts]);
  return {s,notes,util,aaoa};
}
/* Apply a set of actions {tradelineId:actionId} and return before/after estimates. Base score anchors the model. */
function simulate(base,tradelines,inquiries,actions){
  const before=scoreModel(tradelines,inquiries);
  const after=JSON.parse(JSON.stringify(tradelines)); let cost=0, warns=[];
  after.forEach(t=>{const a=actions[t.id]; if(!a) return; const def=(ACTIONS[t.type]||[]).find(x=>x.id===a); if(!def) return; cost+=def.cost(tradelines.find(o=>o.id===t.id)); if(def.warn) warns.push(`${t.creditor}: ${def.warn}`);
    switch(a){case"pay30":t.balance=Math.min(t.balance,t.limit*0.30);break;case"pay10":t.balance=Math.min(t.balance,t.limit*0.10);break;case"pay0":t.balance=0;break;
      case"close":t.balance=0;t.status="closed";break;case"limit":t.limit=Math.round(t.limit*1.5);break;case"removeAU":t.status="deleted";break;case"fixlate":t.lates=[];break;
      case"paydown50":t.balance*=0.5;break;case"payoff":t.balance=0;break;case"pay":t.status="paid";t.balance=0;break;case"settle":t.status="settled";t.balance=0;break;case"pfd":case"delete":t.status="deleted";t.balance=0;break;}});
  const aft=scoreModel(after,inquiries);
  const delta=aft.s-before.s; const est=base+delta;
  return {before,after:aft,delta,est,low:est-12,high:est+12,cost,warns,tradelines:after};
}
const TIERS=[580,620,640,660,680,700,720,740,760,780];
const tierOf=s=>TIERS.filter(t=>s>=t).pop()||"<580";
/* points-per-dollar ranking of single actions */
function rankActions(base,tradelines,inquiries){
  const out=[];
  tradelines.forEach(t=>(ACTIONS[t.type]||[]).forEach(def=>{const r=simulate(base,tradelines,inquiries,{[t.id]:def.id}); if(r.delta>0) out.push({t,def,delta:r.delta,cost:r.cost,ppd:r.cost?r.delta/(r.cost/1000):Infinity});}));
  return out.sort((a,b)=>b.ppd-a.ppd||b.delta-a.delta);
}
const PROGRAM_TIERS=[["VA (typical overlay)",620],["FHA 3.5% down",580],["Conventional",620],["Conv best LLPA tier",780],["Jumbo",700],["DSCR",660],["Bank Statement",660]];
