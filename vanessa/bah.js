/* Military pay module — BAH by duty station, basic pay, BAS, special pays, and the mortgage-income treatment of each.
   SEEDED FIGURES ARE 2026 PLANNING ESTIMATES (E-5 with-dependents anchor per MHA; other grades derived from typical DoD grade
   ratios). Import the official DTMO files (bahw26.txt / bahwo26.txt / mhanames / zip-MHA) on the VA Toolkit → Import tab to
   replace every estimate with exact rates for all ~300 MHAs. Never publish an estimate to a consumer. */
const GRADES=["E-1","E-2","E-3","E-4","E-5","E-6","E-7","E-8","E-9","W-1","W-2","W-3","W-4","W-5","O-1E","O-2E","O-3E","O-1","O-2","O-3","O-4","O-5","O-6","O-7","O-8","O-9","O-10"];
const DTMO_ORDER=["E01","E02","E03","E04","E05","E06","E07","E08","E09","W01","W02","W03","W04","W05","O1E","O2E","O3E","O01","O02","O03","O04","O05","O06","O07","O08","O09","O10"];
/* ratio of each grade to the E-5 anchor (with dependents / without dependents) — typical DoD housing-profile ladder */
const BAH_RATIO={ "E-1":[0.92,0.78],"E-2":[0.92,0.78],"E-3":[0.92,0.78],"E-4":[0.92,0.78],"E-5":[1.00,0.84],"E-6":[1.07,0.90],"E-7":[1.13,0.95],"E-8":[1.20,1.00],"E-9":[1.27,1.05],
  "W-1":[1.03,0.86],"W-2":[1.12,0.94],"W-3":[1.22,1.01],"W-4":[1.30,1.08],"W-5":[1.36,1.12],"O-1E":[1.10,0.93],"O-2E":[1.17,0.98],"O-3E":[1.26,1.05],
  "O-1":[0.98,0.82],"O-2":[1.08,0.90],"O-3":[1.20,1.00],"O-4":[1.32,1.10],"O-5":[1.37,1.15],"O-6":[1.40,1.18],"O-7":[1.42,1.20],"O-8":[1.42,1.20],"O-9":[1.42,1.20],"O-10":[1.42,1.20] };
/* Seeded stations: [MHA code (best-known), MHA name, state, installations, E-5 with-dependents 2026 estimate] */
const STATIONS=[
 ["CA038","San Diego","CA","NB San Diego · MCAS Miramar · NAS North Island · MCRD San Diego · Coronado",4230],["CA024","Camp Pendleton / Oceanside","CA","MCB Camp Pendleton",3963],["CA052","Los Angeles","CA","LA AFB (Space Force) · Port Hueneme (nearby MHA)",4140],["CA072","Riverside / Moreno Valley","CA","March ARB",2910],["CA088","Twentynine Palms","CA","MCAGCC Twentynine Palms",2010],["CA013","Fort Irwin / Barstow","CA","NTC Fort Irwin · MCLB Barstow",2130],["CA031","Lancaster / Palmdale","CA","Edwards AFB",2460],["CA046","Vandenberg / Lompoc","CA","Vandenberg SFB",3330],["CA026","Monterey","CA","NPS · DLI Presidio of Monterey",4020],["CA084","Travis AFB / Fairfield","CA","Travis AFB",3010],["CA023","San Francisco","CA","Coast Guard Island · Presidio",5100],["CA030","Lemoore","CA","NAS Lemoore",2520],["CA087","Beale AFB / Marysville","CA","Beale AFB",2400],["CA041","Sacramento","CA","Sacramento recruiting / ANG",2780],["CA011","Seal Beach / Los Alamitos","CA","NWS Seal Beach · JFTB Los Alamitos",3950],
 ["NV361","Las Vegas / Nellis","NV","Nellis AFB · Creech AFB",2220],["NV218","Fallon","NV","NAS Fallon",1990],["NV219","Reno","NV","Nevada ANG",2300],
 ["AZ021","Phoenix / Luke","AZ","Luke AFB",2250],["AZ023","Tucson","AZ","Davis-Monthan AFB",2000],["AZ019","Sierra Vista","AZ","Fort Huachuca",1800],["AZ020","Yuma","AZ","MCAS Yuma · YPG",1920],
 ["IL060","North Chicago / Great Lakes","IL","NS Great Lakes",2520],["IL062","Scott AFB / Belleville","IL","Scott AFB",1900],["IL061","Rock Island","IL","Rock Island Arsenal",1650],["IL063","Chicago","IL","Recruiting · Reserve",2780],
 ["FL135","Tampa","FL","MacDill AFB",2700],["FL090","Pensacola","FL","NAS Pensacola · Corry · Whiting",2100],["FL105","Jacksonville","FL","NAS Jacksonville · NS Mayport",2250],["FL093","Fort Walton Beach","FL","Eglin AFB · Hurlburt Field",2300],["FL118","Cocoa Beach / Patrick","FL","Patrick SFB · Cape Canaveral",2500],["FL133","Key West","FL","NAS Key West",3900],["FL137","Miami / Homestead","FL","Homestead ARB · SOUTHCOM",3700],["FL153","Orlando","FL","NSA Orlando",2500],["FL098","Panama City","FL","Tyndall AFB · NSA Panama City",2050],
 ["WA328","Tacoma","WA","JB Lewis-McChord",2556],["WA331","Bremerton / Kitsap","WA","NB Kitsap · Bangor",2700],["WA329","Whidbey Island","WA","NAS Whidbey Island",2600],["WA335","Spokane","WA","Fairchild AFB",2000],["WA333","Everett","WA","NS Everett",2900],
 ["TX319","San Antonio","TX","JBSA Lackland · Randolph · Fort Sam Houston",2250],["TX275","Killeen / Fort Cavazos","TX","Fort Cavazos (Hood)",1650],["TX295","El Paso","TX","Fort Bliss",1750],["TX307","Corpus Christi","TX","NAS Corpus Christi",1950],["TX285","Abilene","TX","Dyess AFB",1500],["TX301","Wichita Falls","TX","Sheppard AFB",1550],["TX300","San Angelo","TX","Goodfellow AFB",1500],["TX310","Austin","TX","Camp Mabry",2400],["TX293","Fort Worth","TX","NAS JRB Fort Worth",2200],
 ["NC147","Fayetteville / Fort Bragg","NC","Fort Bragg (Liberty) · Pope Field",1806],["NC150","Jacksonville / Camp Lejeune","NC","MCB Camp Lejeune · New River",1584],["NC153","Goldsboro","NC","Seymour Johnson AFB",1650],["NC148","Havelock / Cherry Point","NC","MCAS Cherry Point",1600],
 ["VA315","Norfolk / Virginia Beach","VA","NS Norfolk · NAS Oceana · Little Creek",2350],["VA318","Quantico","VA","MCB Quantico",2900],["DC053","Washington DC","DC","Pentagon · JB Anacostia-Bolling · Fort Myer",3400],["MD118","Fort Meade","MD","Fort Meade · NSA",3100],["MD117","Annapolis","MD","USNA",3200],["VA317","Fort Belvoir / Alexandria","VA","Fort Belvoir",3350],["VA311","Hampton / Langley","VA","JB Langley-Eustis",2200],
 ["CO079","Colorado Springs","CO","Fort Carson · Peterson SFB · USAFA · Schriever",2500],["CO078","Denver / Aurora","CO","Buckley SFB",2650],
 ["HI015","Honolulu / Oahu","HI","JB Pearl Harbor-Hickam · Schofield · MCB Hawaii",3900],["AK010","Anchorage","AK","JB Elmendorf-Richardson",2500],["AK011","Fairbanks","AK","Fort Wainwright · Eielson AFB",2250],
 ["KY136","Fort Campbell / Clarksville","KY","Fort Campbell",1900],["KY137","Fort Knox","KY","Fort Knox",1750],["GA116","Hinesville / Fort Stewart","GA","Fort Stewart · Hunter AAF",2000],["GA111","Columbus / Fort Moore","GA","Fort Moore (Benning)",1800],["GA113","Augusta / Fort Eisenhower","GA","Fort Eisenhower (Gordon)",1750],["GA117","Warner Robins","GA","Robins AFB",1600],["GA114","Kings Bay","GA","NSB Kings Bay",2000],["GA122","Valdosta","GA","Moody AFB",1500],
 ["OK240","Lawton / Fort Sill","OK","Fort Sill",1500],["OK237","Oklahoma City","OK","Tinker AFB",1750],["MO186","Fort Leonard Wood","MO","Fort Leonard Wood",1500],["MO185","Whiteman AFB","MO","Whiteman AFB",1600],["KS135","Fort Riley / Manhattan","KS","Fort Riley",1650],["KS133","Fort Leavenworth","KS","Fort Leavenworth",1900],["NE204","Omaha","NE","Offutt AFB",1950],
 ["NY235","Fort Drum / Watertown","NY","Fort Drum",2100],["NY232","West Point","NY","USMA West Point",3300],["NY218","New York City","NY","Fort Hamilton · USCG",5070],["CT045","Groton / New London","CT","NSB New London",2900],["RI271","Newport","RI","NS Newport",3000],["MA122","Boston","MA","Hanscom AFB",4100],["NJ215","Joint Base MDL","NJ","JB McGuire-Dix-Lakehurst",2700],
 ["SC284","Charleston","SC","JB Charleston · NWS",2300],["SC285","Columbia / Fort Jackson","SC","Fort Jackson",1900],["SC282","Beaufort / Parris Island","SC","MCRD Parris Island · MCAS Beaufort",2200],["SC287","Sumter","SC","Shaw AFB",1800],
 ["AL005","Huntsville","AL","Redstone Arsenal",1750],["AL009","Montgomery","AL","Maxwell AFB",1550],["AL007","Fort Novosel / Enterprise","AL","Fort Novosel (Rucker)",1500],["AL003","Anniston","AL","Anniston Army Depot (lowest in the nation)",1185],["MS180","Biloxi / Gulfport","MS","Keesler AFB · NCBC Gulfport",1750],["MS179","Columbus","MS","Columbus AFB",1500],["LA144","Fort Johnson / Leesville","LA","Fort Johnson (Polk)",1550],["LA140","Shreveport","LA","Barksdale AFB",1700],["AR018","Little Rock","AR","Little Rock AFB",1600],["TN297","Millington","TN","NSA Mid-South",1800],
 ["OH233","Dayton","OH","Wright-Patterson AFB",1850],["ND228","Minot","ND","Minot AFB",1500],["ND227","Grand Forks","ND","Grand Forks AFB",1500],["SD291","Rapid City","SD","Ellsworth AFB",1650],["WY338","Cheyenne","WY","F.E. Warren AFB",1750],["MT190","Great Falls","MT","Malmstrom AFB",1700],["ID119","Mountain Home","ID","Mountain Home AFB",1700],["UT310","Ogden / Hill AFB","UT","Hill AFB",2300],["NM212","Albuquerque","NM","Kirtland AFB",2000],["NM213","Alamogordo","NM","Holloman AFB",1500],["NM214","Clovis","NM","Cannon AFB",1450],["NM215","Las Cruces","NM","White Sands Missile Range",1600],
 ["GU","Guam","GU","NB Guam · Andersen AFB",3000],["PR","Puerto Rico","PR","Fort Buchanan",2000],
];
/* 2026 BASIC PAY (monthly) — ESTIMATE: 2025 table × 1.038; verify against DFAS. Columns = years of service <2,2,3,4,6,8,10,12,14,16,18,20 */
const YOS=["<2","2","3","4","6","8","10","12","14","16","18","20"];
const BASIC_PAY={
 "E-1":[2320,2320,2320,2320,2320,2320,2320,2320,2320,2320,2320,2320],"E-2":[2600,2600,2600,2600,2600,2600,2600,2600,2600,2600,2600,2600],"E-3":[2735,2907,3083,3083,3083,3083,3083,3083,3083,3083,3083,3083],
 "E-4":[3029,3184,3357,3527,3677,3677,3677,3677,3677,3677,3677,3677],"E-5":[3306,3528,3699,3873,4145,4430,4663,4691,4691,4691,4691,4691],"E-6":[3610,3972,4147,4318,4495,4895,5052,5353,5445,5513,5591,5591],
 "E-7":[4173,4555,4729,4960,5140,5450,5625,5935,6193,6369,6556,6628],"E-8":[0,0,0,0,0,6004,6270,6434,6631,6844,7229,7424],"E-9":[0,0,0,0,0,0,7334,7500,7709,7956,8205,8603],
 "W-1":[3907,4328,4441,4680,4962,5377,5572,5845,6112,6322,6516,6751],"W-2":[4452,4874,5003,5092,5381,5830,6053,6272,6540,6749,6939,7166],"W-3":[5032,5242,5457,5527,5752,6196,6658,6876,7127,7386,7853,8166],"W-4":[5509,5926,6096,6263,6552,6837,7126,7560,7940,8303,8600,8889],"W-5":[0,0,0,0,0,0,0,0,0,0,0,9797],
 "O-1E":[0,0,0,5006,5347,5545,5747,5946,6217,6217,6217,6217],"O-2E":[0,0,0,6217,6344,6547,6887,7151,7347,7347,7347,7347],"O-3E":[0,0,0,7003,7340,7714,7952,8172,8498,8685,8939,8939],
 "O-1":[4165,4336,5241,5241,5241,5241,5241,5241,5241,5241,5241,5241],"O-2":[4799,5466,6295,6508,6642,6642,6642,6642,6642,6642,6642,6642],"O-3":[5554,6296,6796,7409,7764,8154,8407,8820,9036,9036,9036,9036],
 "O-4":[6316,7311,7800,7909,8361,8847,9453,9924,10251,10439,10548,10548],"O-5":[7320,8247,8818,8925,9282,9495,9963,10307,10751,11431,11755,12075],"O-6":[8780,9647,10280,10280,10319,10762,10820,10820,11435,12522,13159,13797],
 "O-7":[11847,12397,12652,12855,13222,13584,14003,14420,14838,16158,17268,17268],"O-8":[14259,14726,15036,15122,15507,16153,16304,16917,17093,17622,18387,19093],"O-9":[0,0,0,0,0,0,0,0,0,0,0,19093],"O-10":[0,0,0,0,0,0,0,0,0,0,0,19093],
};
const BAS_2026={enlisted:481,officer:331,note:"2026 BAS estimate (+~3% over 2025's $465.77 / $320.78). Verify DFAS. BAS II (double) for members without government-mess access in limited cases."};
/* Special pays & allowances — 2026 statutory/typical monthly amounts and how a mortgage underwriter treats each */
const SPECIAL_PAYS=[
 ["BAH","Basic Allowance for Housing","by MHA/grade","non-taxable","Counts; grossed up ~25%; must be likely to continue (ETS/PCS check)"],
 ["BAS","Basic Allowance for Subsistence","$481 enl / $331 off","non-taxable","Counts; grossed up"],
 ["HFP","Hostile Fire / Imminent Danger Pay","$225","non-taxable (CZTE)","Usually EXCLUDED — tied to deployment; counts only with 2+ yr history and continuance"],
 ["FSA","Family Separation Allowance","$250","non-taxable","Usually excluded — temporary"],
 ["HDP-L","Hardship Duty Pay – Location","$50 / $100 / $150","taxable","Excluded unless continuing at the new station"],
 ["HDIP","Hazardous Duty Incentive (parachute $150, HALO $225, demolition $150, flight deck $150, toxic/experimental $150)","$150–$225","taxable","Counts with 2-yr history + continuance (CO letter)"],
 ["DIVE","Diving Duty Pay","$150–$340","taxable","Counts with history + continuance"],
 ["CSP","Career Sea Pay (by grade & sea time)","$50–$805","taxable","Counts if sea duty continues ≥3 yrs; often excluded"],
 ["SUB","Submarine Duty Incentive Pay","$75–$1,000+","taxable","Counts with continuance"],
 ["AvIP","Aviation Incentive Pay (officers) / Career Enlisted Flyer","$125–$1,000 / $150–$400","taxable","Counts with 2-yr history + continuance"],
 ["FLPB","Foreign Language Proficiency Bonus","$100–$1,000 (max $1,000 multi-language)","taxable","Counts with history + current certification"],
 ["SDAP","Special Duty Assignment Pay (SD-1…SD-6)","$75–$450","taxable","Counts if assignment continues (drill sergeant, recruiter, etc.)"],
 ["AIP","Assignment Incentive Pay","up to $3,000","taxable","Counts only with written continuance"],
 ["NUC","Nuclear officer / enlisted pays","varies","taxable","Counts with continuance"],
 ["MED","Medical/Dental/Vet special & incentive pays","$1,000–$10,000+ /mo equivalents","taxable","Counts; document the pay agreement"],
 ["COLA-C","CONUS COLA (high-cost areas)","varies by MHA/grade","taxable","Counts if station continues"],
 ["COLA-O","OCONUS COLA","varies","non-taxable","Counts if station continues; grossed up"],
 ["OHA","Overseas Housing Allowance","varies","non-taxable","Counts (replaces BAH overseas); grossed up"],
 ["CLOTH","Clothing allowance (enlisted, annual)","~$400–$900 /yr","non-taxable","Excluded (reimbursement)"],
 ["BONUS","Enlistment / SRB / continuation bonuses","lump sum (up to $50k–$100k)","taxable","NOT income — asset only (source as deposit, LOE L72)"],
 ["CZTE","Combat Zone Tax Exclusion","tax status, not pay","—","Base pay still counts; don't gross up temporary tax-free status"],
 ["VA-DIS","VA disability compensation (concurrent for some)","by rating","non-taxable","Counts; grossed up; permanent & total is strongest"],
 ["DRILL","Drill pay (Guard/Reserve)","1/30 base pay per drill (4/weekend)","taxable","Counts with 2-yr history (LOE L61)"],
];
/* ---- lookups ---- */
try{const pp=JSON.parse(localStorage.getItem('vanessa.pay')||'null');if(pp)Object.assign(BASIC_PAY,pp)}catch(e){}
let BAH_DATA=null; // {mha:{name,state,w:[27],wo:[27]}} when official files are imported
try{ const d=JSON.parse(localStorage.getItem("vanessa.bah")||"null"); if(d&&Object.keys(d).length) BAH_DATA=d; }catch(e){}
function bahRate(mha,grade,withDep){
  const gi=GRADES.indexOf(grade); if(BAH_DATA&&BAH_DATA[mha]){const r=BAH_DATA[mha][withDep?"w":"wo"][gi]; if(r) return {v:r,official:true}}
  const st=STATIONS.find(s=>s[0]===mha); if(!st) return {v:0,official:false}; const k=BAH_RATIO[grade]; return {v:Math.round(st[4]*(withDep?k[0]:k[1])),official:false};
}
function stationList(){ const base=STATIONS.map(s=>({mha:s[0],name:s[1],state:s[2],inst:s[3],official:!!(BAH_DATA&&BAH_DATA[s[0]])}));
  if(BAH_DATA) Object.entries(BAH_DATA).forEach(([k,v])=>{ if(!base.some(b=>b.mha===k)) base.push({mha:k,name:v.name||k,state:v.state||(k.slice(0,2)),inst:"",official:true}) });
  return base.sort((a,b)=>a.state.localeCompare(b.state)||a.name.localeCompare(b.name)); }
function basicPay(grade,yosIdx){ return (BASIC_PAY[grade]||[])[yosIdx]||0 }
/* ---- official file parsers (DTMO ASCII format: "MHA,rate1,...,rate27" ; mhanames: "MHA  NAME, ST" ; zipmha: "ZIP MHA") ---- */
function parseBahFile(text,withDep){ const out={}; text.split(/\r?\n/).forEach(l=>{const p=l.trim().split(/[,\s]+/).filter(Boolean); if(p.length>=28&&/^[A-Z]{2}\d{3}$|^[A-Z]{2}$/.test(p[0])){const r=p.slice(1,28).map(Number); if(r.every(n=>!isNaN(n))) out[p[0]]=r}}); return out }
function parseMhaNames(text){ const out={}; text.split(/\r?\n/).forEach(l=>{const m=l.trim().match(/^([A-Z]{2}\d{3})\s+(.+)$/); if(m) out[m[1]]=m[2].trim()}); return out }
function parseZipMha(text){ const out={}; text.split(/\r?\n/).forEach(l=>{const m=l.trim().match(/^(\d{5})\s+([A-Z]{2}\d{3})/); if(m) out[m[1]]=m[2]}); return out }
function mergeBah({w,wo,names,zips}){ const d=BAH_DATA||{}; const keys=new Set([...Object.keys(w||{}),...Object.keys(wo||{})]); keys.forEach(k=>{d[k]=d[k]||{w:[],wo:[]}; if(w&&w[k])d[k].w=w[k]; if(wo&&wo[k])d[k].wo=wo[k]; if(names&&names[k]){d[k].name=names[k].replace(/,\s*[A-Z]{2}$/,"");d[k].state=(names[k].match(/,\s*([A-Z]{2})$/)||[])[1]||k.slice(0,2)}}); if(zips){d.__zips=Object.assign(d.__zips||{},zips)} BAH_DATA=d; try{localStorage.setItem("vanessa.bah",JSON.stringify(d))}catch(e){} return Object.keys(d).filter(k=>k!=="__zips").length }
/* ---- Expanded station list: every state/territory, major metros and installations (≈300). E-5 w/dep 2026 planning estimates.
   Codes are best-known MHA codes where confident; otherwise a state+name key (shown as "~") until the DTMO file is imported. ---- */
(function(){const add=[
 // Alabama
 ["AL008","Birmingham","AL","Recruiting · ANG",1800],["AL010","Mobile","AL","USCG Aviation Training Center",1700],["AL006","Dothan","AL","Near Fort Novosel",1450],
 // Alaska
 ["AK012","Kodiak","AK","USCG Base Kodiak",2200],["AK013","Juneau","AK","USCG Sector Juneau",2300],
 // Arizona extra
 ["AZ022","Flagstaff","AZ","Camp Navajo",2050],["AZ024","Prescott","AZ","ANG",1900],
 // Arkansas
 ["AR017","Fayetteville / NW Arkansas","AR","Recruiting",1600],["AR016","Fort Smith","AR","Fort Chaffee (Guard)",1350],["AR019","Pine Bluff","AR","Pine Bluff Arsenal",1300],
 // California extra
 ["CA015","Bakersfield","CA","Recruiting",1950],["CA020","Fresno","CA","Fresno ANG",2000],["CA035","Oakland / East Bay","CA","Coast Guard Island · Alameda",3950],["CA043","San Jose / Silicon Valley","CA","Moffett Field / NASA",4600],["CA050","Santa Barbara","CA","Recruiting",3700],["CA060","Stockton / Tracy","CA","DLA San Joaquin",2500],["CA063","Redding / Chico","CA","ANG",1900],["CA067","San Luis Obispo","CA","Camp SLO · Camp Roberts",3000],["CA074","Santa Rosa / Petaluma","CA","USCG Training Center Petaluma",3400],["CA080","Oxnard / Ventura","CA","NB Ventura County (Port Hueneme, Point Mugu)",3500],["CA090","Palm Springs / Coachella","CA","Recruiting",2300],["CA092","Temecula / SW Riverside","CA","Near Pendleton (commuting MHA)",2900],["CA094","Eureka / Humboldt","CA","USCG Humboldt Bay",1900],["CA096","Victorville / High Desert","CA","SCLA",2000],["CA098","Ridgecrest / China Lake","CA","NAWS China Lake",1900],["CA099","El Centro","CA","NAF El Centro",1700],
 // Colorado extra
 ["CO080","Pueblo","CO","Pueblo Chemical Depot",1650],["CO081","Fort Collins / Greeley","CO","Recruiting",2200],["CO082","Grand Junction","CO","Recruiting",1800],
 // Connecticut extra
 ["CT046","Hartford","CT","Bradley ANG",2100],
 // Delaware
 ["DE052","Dover","DE","Dover AFB",1900],["DE051","Wilmington","DE","Recruiting",2100],
 // Florida extra
 ["FL100","Tallahassee","FL","Recruiting",1800],["FL110","Gainesville","FL","Recruiting",1800],["FL112","Daytona Beach","FL","Recruiting",2000],["FL120","Melbourne / Palm Bay","FL","Patrick (adjacent)",2300],["FL125","Fort Lauderdale","FL","USCG · Recruiting",3300],["FL128","West Palm Beach","FL","Recruiting",3000],["FL140","Naples / Fort Myers","FL","Recruiting",2500],["FL145","Sarasota / Bradenton","FL","Recruiting",2400],["FL150","Lakeland","FL","Recruiting",2000],["FL155","Ocala","FL","Recruiting",1750],["FL160","Fort Pierce / Port St. Lucie","FL","Recruiting",2300],["FL165","Crestview / Niceville","FL","Duke Field · Eglin north",2000],
 // Georgia extra
 ["GA110","Atlanta","GA","Dobbins ARB · Fort Gillem",2400],["GA118","Savannah","GA","Hunter AAF",2100],["GA120","Macon","GA","Robins (adjacent)",1600],["GA124","Athens","GA","Navy Supply Corps (legacy)",1700],["GA126","Albany","GA","MCLB Albany",1450],
 // Hawaii extra
 ["HI016","Kaneohe / Windward Oahu","HI","MCB Hawaii",3900],["HI017","Kauai","HI","PMRF Barking Sands",3300],["HI018","Maui","HI","Recruiting",3700],["HI019","Hilo / Big Island","HI","Pohakuloa",2600],
 // Idaho
 ["ID120","Boise","ID","Gowen Field",2000],["ID121","Idaho Falls","ID","Recruiting",1700],["ID122","Coeur d'Alene","ID","Recruiting",1900],
 // Illinois extra
 ["IL064","Springfield","IL","ANG Capital",1500],["IL065","Peoria","IL","Peoria ANG",1500],["IL066","Champaign-Urbana","IL","Recruiting",1500],["IL067","Joliet / Will County","IL","Recruiting",2200],["IL068","Naperville / DuPage","IL","Recruiting",2400],["IL069","Waukegan / Lake County","IL","Great Lakes (adjacent)",2400],
 // Indiana
 ["IN126","Indianapolis","IN","Fort Benjamin Harrison (DFAS)",1750],["IN127","Fort Wayne","IN","ANG",1500],["IN128","Terre Haute","IN","Hulman Field ANG",1300],["IN129","Bloomington / Crane","IN","NSA Crane",1450],["IN130","Evansville","IN","Recruiting",1400],
 // Iowa
 ["IA131","Des Moines","IA","Des Moines ANG",1600],["IA132","Davenport / Quad Cities","IA","Rock Island (adjacent)",1600],["IA133","Sioux City","IA","185th ANG",1400],["IA134","Cedar Rapids / Iowa City","IA","Recruiting",1600],
 // Kansas extra
 ["KS136","Wichita","KS","McConnell AFB",1550],["KS137","Topeka","KS","Forbes Field ANG",1450],["KS138","Kansas City (KS side)","KS","Recruiting",1800],
 // Kentucky extra
 ["KY138","Louisville","KY","Recruiting · ANG",1700],["KY139","Lexington","KY","Blue Grass Army Depot (Richmond)",1650],
 // Louisiana extra
 ["LA141","New Orleans","LA","NAS JRB New Orleans · USCG",2100],["LA142","Baton Rouge","LA","Recruiting",1700],["LA143","Lafayette / Lake Charles","LA","Recruiting",1500],
 // Maine
 ["ME150","Portland","ME","USCG Sector Northern New England",2300],["ME151","Bangor","ME","Bangor ANG",1600],["ME152","Brunswick","ME","Former NAS (Reserve)",2000],["ME153","Kittery / Portsmouth","ME","Portsmouth Naval Shipyard",2500],
 // Maryland extra
 ["MD119","Baltimore","MD","Fort McHenry · USCG Yard",2600],["MD120","Aberdeen","MD","Aberdeen Proving Ground",2300],["MD121","Patuxent River / Lexington Park","MD","NAS Patuxent River",2500],["MD122","Frederick","MD","Fort Detrick",2500],["MD123","Bethesda / Rockville","MD","Walter Reed NMMC · NIH",3400],["MD124","Indian Head / Waldorf","MD","NSF Indian Head",2800],
 // Massachusetts extra
 ["MA123","Cape Cod","MA","JB Cape Cod (Otis) · USCG",2800],["MA124","Worcester","MA","Recruiting",2300],["MA125","Springfield / Westover","MA","Westover ARB",1900],["MA126","Natick","MA","Natick Soldier Systems",3200],
 // Michigan
 ["MI160","Detroit","MI","Selfridge ANGB · TACOM Warren",1900],["MI161","Grand Rapids","MI","Recruiting",1750],["MI162","Battle Creek","MI","DLA · ANG",1400],["MI163","Lansing","MI","Recruiting",1500],["MI164","Traverse City","MI","USCG Air Station",1700],["MI165","Sault Ste. Marie","MI","USCG",1300],["MI166","Alpena / Grayling","MI","Camp Grayling",1300],
 // Minnesota
 ["MN170","Minneapolis-St. Paul","MN","934th AW · Camp Ripley (north)",2100],["MN171","Duluth","MN","148th FW ANG",1500],["MN172","Rochester","MN","Recruiting",1700],
 // Mississippi extra
 ["MS181","Meridian","MS","NAS Meridian",1300],["MS182","Jackson","MS","Camp Shelby (south) · ANG",1500],["MS183","Hattiesburg","MS","Camp Shelby",1400],["MS184","Pascagoula","MS","Ingalls · NCBC",1600],
 // Missouri extra
 ["MO187","Kansas City","MO","Recruiting · Marine Corps Reserve",1800],["MO188","St. Louis","MO","Scott (adjacent) · NGA",1800],["MO189","Springfield","MO","Recruiting",1450],["MO190","Columbia / Jefferson City","MO","Recruiting",1450],
 // Montana extra
 ["MT191","Helena","MT","Fort Harrison (Guard)",1650],["MT192","Billings","MT","Recruiting",1600],["MT193","Missoula","MT","Recruiting",1700],
 // Nebraska extra
 ["NE205","Lincoln","NE","Lincoln ANG",1550],
 // Nevada extra
 ["NV220","Carson City","NV","Recruiting",2200],["NV221","Henderson / Boulder City","NV","Nellis (adjacent)",2250],
 // New Hampshire
 ["NH210","Portsmouth / Seacoast","NH","Portsmouth Naval Shipyard (ME) · Pease ANGB",2600],["NH211","Manchester / Nashua","NH","Recruiting",2400],
 // New Jersey extra
 ["NJ216","Newark / Northern NJ","NJ","Picatinny Arsenal (west) · USCG",3100],["NJ217","Atlantic City","NJ","177th FW ANG · FAA Tech Center",2200],["NJ218","Trenton","NJ","Recruiting",2500],["NJ219","Picatinny / Dover","NJ","Picatinny Arsenal",2900],["NJ220","Cape May","NJ","USCG Training Center Cape May",2300],["NJ221","Earle / Colts Neck","NJ","NWS Earle",2900],
 // New Mexico extra
 ["NM216","Santa Fe","NM","Recruiting",2000],["NM217","Los Alamos","NM","LANL",2100],
 // New York extra
 ["NY219","Long Island","NY","Recruiting · 106th RQW",3600],["NY220","Westchester / Hudson Valley","NY","Camp Smith · Stewart ANGB",3200],["NY221","Albany","NY","Watervliet Arsenal · Scotia",1900],["NY222","Syracuse","NY","Hancock Field ANGB",1600],["NY223","Rochester","NY","Recruiting",1600],["NY224","Buffalo / Niagara","NY","Niagara Falls ARS",1600],["NY225","Plattsburgh","NY","Former AFB",1500],["NY226","Binghamton","NY","Recruiting",1400],["NY227","Staten Island / Brooklyn","NY","Fort Hamilton · USCG",4500],
 // North Carolina extra
 ["NC151","Raleigh-Durham","NC","Recruiting",2200],["NC152","Charlotte","NC","Recruiting",2200],["NC154","Wilmington","NC","MOTSU Sunny Point",2100],["NC155","Elizabeth City","NC","USCG Base Elizabeth City",1700],["NC156","Greensboro / Winston-Salem","NC","Recruiting",1700],["NC157","Asheville","NC","Recruiting",2000],
 // North Dakota extra
 ["ND229","Fargo","ND","119th Wing ANG",1500],["ND230","Bismarck","ND","Recruiting",1500],
 // Ohio extra
 ["OH234","Columbus","OH","DLA Columbus · Rickenbacker ANGB",1850],["OH235","Cleveland","OH","USCG · Recruiting · DFAS",1700],["OH236","Cincinnati","OH","Recruiting",1800],["OH237","Toledo","OH","180th FW ANG",1500],["OH238","Youngstown","OH","Youngstown ARS",1350],["OH239","Akron / Canton","OH","Recruiting",1500],
 // Oklahoma extra
 ["OK241","Tulsa","OK","Tulsa ANG",1550],["OK242","Enid","OK","Vance AFB",1400],["OK243","Altus","OK","Altus AFB",1350],["OK244","McAlester","OK","McAlester AAP",1300],
 // Oregon
 ["OR250","Portland","OR","Portland ANGB · USCG",2500],["OR251","Salem / Eugene","OR","Recruiting",2100],["OR252","Klamath Falls","OR","Kingsley Field ANG",1700],["OR253","Astoria / Warrenton","OR","USCG Sector Columbia River",2000],["OR254","Bend / Medford","OR","Recruiting",2200],
 // Pennsylvania
 ["PA260","Philadelphia","PA","NSA Philadelphia · DLA · USCG",2500],["PA261","Pittsburgh","PA","911th AW ARS · Recruiting",1700],["PA262","Harrisburg / Carlisle","PA","Carlisle Barracks · Fort Indiantown Gap · DLA New Cumberland",1900],["PA263","Allentown / Lehigh Valley","PA","Recruiting",2000],["PA264","Scranton / Tobyhanna","PA","Tobyhanna Army Depot",1600],["PA265","Erie","PA","Recruiting",1400],["PA266","State College","PA","Recruiting",1600],["PA267","Johnstown","PA","Recruiting · ANG",1300],
 // Rhode Island extra
 ["RI272","Providence","RI","Quonset Point ANG",2500],
 // South Carolina extra
 ["SC286","Greenville / Spartanburg","SC","Recruiting",1800],["SC288","Myrtle Beach","SC","Former AFB",1800],["SC289","Hilton Head / Bluffton","SC","Parris Island (adjacent)",2300],
 // South Dakota extra
 ["SD292","Sioux Falls","SD","114th FW ANG",1500],
 // Tennessee extra
 ["TN298","Nashville","TN","Recruiting · ANG",2100],["TN299","Knoxville","TN","McGhee Tyson ANGB",1800],["TN300","Chattanooga","TN","Recruiting",1700],["TN301","Memphis","TN","NSA Mid-South (Millington)",1750],["TN302","Tullahoma","TN","Arnold AFB",1450],
 // Texas extra
 ["TX320","Houston","TX","Ellington Field JRB · USCG",2200],["TX321","Dallas","TX","Recruiting · Grand Prairie NAS JRB (Fort Worth)",2300],["TX322","Del Rio","TX","Laughlin AFB",1350],["TX323","Kingsville","TX","NAS Kingsville",1550],["TX324","Texarkana","TX","Red River Army Depot",1300],["TX325","Waco / Temple","TX","Recruiting",1600],["TX326","Lubbock","TX","Recruiting",1500],["TX327","Amarillo","TX","Pantex",1450],["TX328","Laredo / McAllen","TX","USCG · Recruiting",1500],["TX329","Galveston","TX","USCG Sector Houston-Galveston",1900],["TX330","Bryan / College Station","TX","Recruiting",1700],["TX331","Beaumont / Port Arthur","TX","Recruiting",1500],
 // Utah extra
 ["UT311","Salt Lake City","UT","Camp Williams · Tooele Army Depot",2250],["UT312","Provo / Orem","UT","Recruiting",2100],["UT313","St. George","UT","Recruiting",1900],
 // Vermont
 ["VT313","Burlington","VT","Burlington ANGB · Camp Johnson",2300],
 // Virginia extra
 ["VA312","Richmond","VA","Fort Gregg-Adams (Lee) · DSCR",2100],["VA313","Fort Gregg-Adams / Petersburg","VA","Fort Gregg-Adams",1850],["VA314","Fredericksburg / Dahlgren","VA","NSF Dahlgren · Quantico (adjacent)",2500],["VA316","Charlottesville","VA","NGIC · JAG School",2300],["VA319","Roanoke / Blacksburg","VA","Recruiting",1700],["VA320","Williamsburg / Yorktown","VA","NWS Yorktown · Camp Peary · Fort Eustis",2200],["VA321","Chesapeake / Suffolk","VA","Norfolk (adjacent) · NSA Northwest",2300],["VA322","Fort Walker / Bowling Green","VA","Fort Walker (A.P. Hill)",1900],
 // Washington extra
 ["WA330","Seattle","WA","USCG · Recruiting",3300],["WA332","Oak Harbor","WA","NAS Whidbey (town)",2600],["WA334","Yakima","WA","Yakima Training Center",1800],["WA336","Port Angeles","WA","USCG Air Station",1900],["WA337","Bellingham","WA","Recruiting",2400],["WA338","Olympia","WA","JBLM (adjacent) · Camp Murray",2500],["WA339","Tri-Cities","WA","Hanford",2000],
 // West Virginia
 ["WV340","Charleston","WV","130th AW ANG",1400],["WV341","Martinsburg","WV","167th AW ANG · USCG NMC",1800],["WV342","Morgantown","WV","Recruiting",1500],
 // Wisconsin
 ["WI345","Milwaukee","WI","128th ARW ANG · Recruiting",1800],["WI346","Madison","WI","Truax Field ANG",1900],["WI347","Fort McCoy / Sparta","WI","Fort McCoy",1400],["WI348","Green Bay","WI","Recruiting",1500],
 // Wyoming extra
 ["WY339","Casper","WY","Recruiting",1500],
 // Territories
 ["VI","U.S. Virgin Islands","VI","USCG · Guard",2400],["AS","American Samoa","AS","Army Reserve",1500],["MP","Northern Mariana Islands","MP","Guard",1700],["PR2","Puerto Rico — Ceiba / Roosevelt Roads (legacy)","PR","Guard",1700],
];
add.forEach(s=>{if(!STATIONS.some(x=>x[0]===s[0]))STATIONS.push(s)});
})();
