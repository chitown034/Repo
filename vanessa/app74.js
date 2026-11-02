/* app74: Seat merges (v100) — folds newer duplicate AI seats into the established seat so each role has one owner.
   For each pair the survivor keeps its name, parent and backup; it gains the merged seat's duties and tools; every runbook,
   coverage row, scheduler job and seat backup/parent that named the merged seat is repointed. Seats that merely share a first
   name (e.g. two different agents called Grace or Priya) are NOT merged — they are different roles. Runs at load and once more after boot so seats registered later are covered. */
const SM_PAIRS=[["Reverse Mortgage Specialist","Reverse & Equity Specialist"],["AI Call Center ISA","Jessica"],["Regulatory Watch","Regina"],["Training Officer","Mortgage Academy Coach"]];
function smMerge(){if(typeof AI_SEATS==="undefined")return 0;let n=0;const swap=(x,a,b)=>typeof x==="string"&&x===a?b:x;
 const repoint=(a,b)=>{if(typeof RB!=="undefined")RB.forEach(r=>{r.owner=swap(r.owner,a,b);r.backup=swap(r.backup,a,b)});if(typeof CV_PROCS!=="undefined")CV_PROCS.forEach(r=>{r[3]=swap(r[3],a,b);r[4]=swap(r[4],a,b)});if(typeof AP_JOBS!=="undefined")AP_JOBS.forEach(j=>{j.seat=swap(j.seat,a,b)});AI_SEATS.forEach(s=>{s.b=swap(s.b,a,b);s.parent=swap(s.parent,a,b)})};
 SM_PAIRS.forEach(([dup,keep])=>{const i=AI_SEATS.findIndex(s=>s.n===dup),k=AI_SEATS.find(s=>s.n===keep);if(!k)return;if(i<0){repoint(dup,keep);return}const d=AI_SEATS[i];
  if(!String(k.r||"").includes("[merged "+dup+"]"))k.r=`${k.r||""} · [merged ${dup}] ${d.r||""}`;if(d.a&&!String(k.a||"").includes(d.a))k.a=[k.a,d.a].filter(Boolean).join(" · ");AI_SEATS.splice(i,1);repoint(dup,keep);if(k.b===keep)k.b=d.b&&d.b!==keep?d.b:k.b;n++});
 if(typeof CV_PROCS!=="undefined"){const old=CV_PROCS.find(r=>/^Mortgage academy & LO training$/i.test(r[1])),mine=CV_PROCS.findIndex(r=>/^Training & certification \(Mortgage Academy\)$/.test(r[1]));if(old&&mine>=0){const add=String(CV_PROCS[mine][2]).split(",").filter(h=>!String(old[2]).split(",").includes(h));if(add.length)old[2]+=","+add.join(",");if(!/Mortgage Academy \(#academy\)/.test(old[6]||""))old[6]=`${old[6]||""} · Mortgage Academy (#academy): 39 modules, quizzes, certificates; Live Role-Play Trainer`;CV_PROCS.splice(mine,1);n++}}
 return n}
smMerge();setTimeout(()=>{try{smMerge()}catch(e){}},0);
