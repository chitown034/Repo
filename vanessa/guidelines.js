/* Guideline sheets per program — the seasoned-underwriter summary. Sources: VA Pamphlet 26-7 / 38 CFR 36; HUD 4000.1; Fannie Selling Guide;
   Freddie Seller/Servicer Guide; USDA HB-1-3555; lender matrices (Non-QM). Figures as of the 2026 research pass — verify before quoting. */
const G=(id,o)=>({id,...o});
const GUIDELINES=[
G("va",{name:"VA Guaranteed Home Loan",manual:"VA Pamphlet 26-7 (Lenders Handbook), 38 CFR Part 36, VA Circulars",
 eligibility:["COE via WebLGY: 90 days wartime / 181 days peacetime / 24 continuous months (post-1980 enlisted); Guard/Reserve 6 years or 90 days Title 10 (30 consecutive) or 90 days Title 32; surviving spouses (DIC/eligible)","Discharge other than dishonorable; OTH needs VA character-of-service determination","Occupancy within 60 days (up to 12 months with justification); spouse/dependent child may satisfy while deployed"],
 income:["Stable & reliable; 2-year history standard; military: LES ×2, continuance beyond 12 months (ETS rule); BAH/BAS/clothing count; grossed-up 25% non-taxable","Self-employed: 2 years returns (12 months with prior experience); rental 75% with lease","Residual income by region/family size (Ch.4 tables); 120% when DTI > 41%; DTI 41% benchmark, no cap"],
 credit:["No VA minimum (lender overlays 580–640); 12 months satisfactory housing; BK7 2 yrs (1 w/ extenuating), BK13 12 mo + trustee, FC/short sale 2 yrs; CAIVRS clear; non-traditional credit OK on manual UW","Disputed/collections: judgment call with LOE; federal debt must be current"],
 assets:["No reserves required for 1-unit (2–4 units: 6 months PITI typical); gift funds allowed; seller concessions 4% + unlimited costs; no down payment with full entitlement"],
 property:["1–4 units, condos (VA-approved project), manufactured (permanent foundation, real property), new construction (builder warranty/inspections); MPRs; VA appraisal via portal; Tidewater/ROV; termite per locality; escrow holdbacks allowed"],
 limits:["No loan limit with full entitlement (lender caps ~$1.5–3M); partial entitlement: 25% × county limit − used; funding fee 2.15/3.3/1.5/1.25%, IRRRL 0.5%, exemptions; 1% flat origination or itemized ≤1%; non-allowable fees list"],
 refi:["IRRRL: 210 days + 6 payments; NTB (0.5% fixed→fixed, 2% fixed→ARM, ARM→fixed any); recoup ≤36 mo; no appraisal/income typically","Cash-out Type I/II: 100% LTV by statute (lender overlays 90%); NTB 1 of 8; seasoning 210 days/6 payments; full docs"],
 pitfalls:["Counting the 2-1 buydown as qualification","Forgetting the NPS in community-property states","Not pulling CAIVRS early","Mis-bucketing seller credits (4% vs costs)","Family size errors on residual","Letting an AUS 'refer' end the file — manual UW is normal on VA"],
 docs:"VA Toolkit → Document checklists"}),
G("fha",{name:"FHA (203(b) / 203(k) / Streamline)",manual:"HUD Handbook 4000.1 + Mortgagee Letters",
 eligibility:["Owner-occupied primary residence only (1–4 units); SSN; lawful residency (DACA accepted since ML 2021-12); non-occupant co-borrowers allowed (family); identity-of-interest 85% LTV cap with exceptions"],
 income:["2-year history; gaps >6 months need 6 months back; overtime/bonus 2 years; self-employed 2 years (12 with prior); rental 75% with lease/Schedule E; non-taxable grossed up 25%","Ratios 31/43 standard; AUS Accept to 46.99/56.99 with compensating factors; manual UW tiers 31/43 → 37/47 → 40/50 with specific factors"],
 credit:["580+ for 3.5% down; 500–579 10% down; no score → non-traditional (manual); BK7 2 yrs (12 mo extenuating), BK13 12 mo + court OK; FC 3 yrs (1 yr extenuating); short sale/DIL 3 yrs; collections: >$2,000 aggregate non-medical → payoff or 5% in DTI (medical excluded); disputed derog >$1,000 → manual","CAIVRS clear; judgments paid or 3 months on plan; IRS plan 3 months"],
 assets:["3.5% MRI from own funds or gift (family, employer, DPA); seller concessions 6%; reserves: 1-unit none (AUS), 3–4 units 3 months; large deposits >1% of value sourced"],
 property:["Appraisal with MPR/MPS; 203(k) standard/limited for repairs; condos: HUD-approved project or Single-Unit Approval; manufactured ≥400 sq ft on permanent foundation; flips: 90-day rule + 2nd appraisal 91–180 days if >100% increase"],
 limits:["2026 floor $541,287 / ceiling $1,249,125 (1-unit); UFMIP 1.75% financed; annual MIP 0.55% most (0.15–0.75); life of loan if <10% down, 11 yrs if ≥10%"],
 refi:["Streamline: 210 days + 6 payments, NTB (5% payment reduction fixed→fixed), no appraisal, UFMIP 0.55 refund schedule; rate-and-term 97.75% LTV; cash-out 80% LTV, 12 months ownership/occupancy"],
 pitfalls:["Student loans: 0.5% of balance if payment $0","Non-occupant co-borrower LTV 75% if not family","Gift funds from seller/agent prohibited","Chapter 13 needs court permission","Self-sufficiency test on 3–4 units"],docs:"VA Toolkit → FHA checklist"}),
G("conv",{name:"Conventional Conforming (Fannie Mae / Freddie Mac)",manual:"Fannie Selling Guide (B2–B5) / DU; Freddie Seller/Servicer Guide / LPA",
 eligibility:["Primary, second home, investment (1–4 units); U.S. citizens, permanent/non-permanent residents (DACA with EAD); first-time buyer programs HomeReady/Home Possible (80% AMI), HomeOne (3%)"],
 income:["2-year history; variable income averaged 24 months (12 if increasing); self-employed 2 years (1 with 5 years prior experience — DU); rental via Schedule E or 75% of lease; asset depletion (employment-related assets) allowed","DTI: DU up to 50% (45% typical threshold for LLPAs); manual 36/45"],
 credit:["620 minimum (DU risk-based; VantageScore 4.0/FICO 10T transition — verify); LLPAs by score/LTV; BK7 4 yrs (2 extenuating), BK13 2 yrs from discharge/4 from dismissal; FC 7 yrs (3 extenuating); short sale/DIL 4 yrs (2 extenuating); collections: 1-unit primary no payoff required (DU); investment >$250 individual/$1,000 total payoff","Disputed tradelines: DU may require resolution; multiple BK 5 yrs"],
 assets:["3% (HomeReady/Home Possible/HomeOne) or 5% standard; 15% 2-unit (HomeReady 5%), 25% 3–4 units/investment; gifts allowed on primary/second (not investment); seller concessions 3/6/9% by LTV, 2% investment; reserves: 2–6 months on second/investment, DU-driven","Large deposits >50% of monthly income sourced"],
 property:["Appraisal or value-acceptance (waiver) via DU/LPA; condos: Full/Limited Review, non-warrantable ineligible; manufactured (MH Advantage/CHOICEHome); ADU income allowed (1-unit) with rent schedule"],
 limits:["2026 baseline $832,750; ceiling $1,249,125; high-balance pricing; PMI above 80% LTV, cancel at 80% (request) / 78% (auto) per HPA; LPMI/single-premium options"],
 refi:["Rate-and-term to 97% (primary); cash-out 80% (70% investment, 75% 2–4 units); 6 months seasoning for cash-out (12 months on some); delayed financing exception"],
 pitfalls:["Counting AU accounts without proof","Student loans: 1% of balance unless documented IDR payment","Gift funds on investment","Departing residence: lease + 75% (no equity requirement now, verify)","Condo questionnaire/litigation"],docs:"VA Toolkit → Conventional checklist"}),
G("usda",{name:"USDA Rural Development Guaranteed (SFHGLP)",manual:"HB-1-3555; GUS",
 eligibility:["Property in an eligible rural area (USDA map); household income ≤ 115% AMI (2026 ~$122,800 for 1–4 in most counties; $162,100 for 5–8); primary residence; U.S. citizen/qualified alien; cannot own adequate housing nearby"],
 income:["Annual (eligibility) income counts ALL adult household members; repayment income is the borrower's; 2-year history; ratios 29/41; GUS Accept up to ~32/44 with factors; manual with debt-ratio waiver (compensating factors + 680+ score)"],
 credit:["No USDA minimum; GUS typically 640+ for streamlined; manual 580–639 with validated tradelines; BK7 3 yrs; FC 3 yrs; collections >$2,000 non-medical → payoff or 5% in DTI; CAIVRS"],
 assets:["0% down; gifts OK; seller concessions 6%; reserves not required; cash on hand not usable"],
 property:["Modest for the area; no income-producing structures; existing dwellings must meet HUD HB 4000.1 MPRs; manufactured: new units (existing eligible under pilot — verify); no in-ground pools (removed 2015? verify)"],
 limits:["No max loan (ratios/income cap limit it); guarantee fee 1% upfront (financeable) + 0.35% annual for life (FY2026 confirmed, FY2027 unconfirmed)"],
 refi:["Streamlined-Assist (no appraisal/credit review, $50 net payment reduction), Streamlined, Non-streamlined; 12 months seasoning"],
 pitfalls:["Forgetting household (not borrower) income for eligibility","Property map changes","Appraisal must note HUD MPR compliance"],docs:"USDA: income eligibility worksheet + map printout"}),
G("jumbo",{name:"Jumbo (non-agency)",manual:"Investor guides (lender-specific)",
 eligibility:["Above the conforming/high-balance limit; primary, second, investment; U.S. and permanent residents; some non-permanent with visa types"],
 income:["Full doc 2 years; self-employed 2 years + YTD P&L; rental 75%; DTI ≤43% typical (some 45–50 with reserves)"],
 credit:["700–740+ by loan size; BK/FC 7 yrs typical (4 on some); no late mortgage payments 24 months"],
 assets:["10–20%+ down by size; reserves 6–12 months PITIA (more above $1.5M); gifts limited; seller concessions 2–9% LTV-tiered (lender)"],
 property:["Two appraisals above ~$1.5–2M; condos full review; declining-market haircuts"],
 limits:["To $3M+ (portfolio); 89.99% LTV programs exist with no MI (Jumbo VA to 100% for veterans)"],
 refi:["Cash-out 70–80% LTV; seasoning 6–12 months"],
 pitfalls:["Reserves counted after closing","Second appraisal timelines","ARM qualifying at fully-indexed rate"],docs:"2 months all accounts; 2 years returns; letter for any large deposit"}),
G("dscr",{name:"DSCR (investor, no personal DTI)",manual:"Non-QM investor matrices",
 eligibility:["1–4 unit (some 5–8) investment; LLC vesting allowed; first-time investors at lower LTV; foreign nationals (FN DSCR variant)"],
 income:["Qualify on DSCR = rent ÷ PITIA (rent from lease or 1007 market rent; STR with history on some); min 1.00 (0.75 no-ratio at lower LTV); 1.25+ best pricing"],
 credit:["660–680 typical (620 at lower LTV); BK/FC 3–4 yrs; mortgage lates 0×30 in 12 months"],
 assets:["20–25% down (15% at 740+/1.25 DSCR on some); reserves 3–6 months; gifts limited; seller concessions 2–6%"],
 property:["Appraisal + 1007/1025 rent schedule; condotels/non-warrantable at select lenders; rural limits"],
 limits:["$100k–$3M+; prepayment penalties (1–5 yr step-down) standard; interest-only options; 30/40-yr terms"],
 refi:["Cash-out 70–75% LTV; 6 months seasoning (some 0 with delayed financing)"],
 pitfalls:["Using gross rent without vacancy on some investors","Prepay penalties illegal in some states/structures","STR income without 12-month history"],docs:"Lease/1007, entity docs, 2 months reserves, ID"}),
G("bank",{name:"Bank Statement / 1099 / P&L (Non-QM)",manual:"Non-QM investor matrices; ATR under Reg Z §1026.43 (non-QM must still show ATR)",
 eligibility:["Self-employed ≥2 years (12–24 months statements); 1099 contractors (1–2 years 1099s); P&L-only with CPA letter; primary/second/investment"],
 income:["12 or 24 months business or personal statements; expense factor 10–50% (industry) or CPA/P&L-based; NSFs/overdrafts limit; large irregular deposits sourced; co-mingled accounts restrictions"],
 credit:["620–680; BK/FC 2–4 yrs; housing history 0×30 ×12"],
 assets:["10–25% down (10% needs 680+/loan cap); reserves 6–12 months PITIA separate from down; gifts limited; concessions 2–6%"],
 property:["Standard; condos; non-warrantable at some"],
 limits:["To $3–4M; interest-only; 40-yr; prepay on investment only"],
 refi:["Cash-out 75–80% LTV"],
 pitfalls:["NSF count","Declining deposits trend","Statements from a different business than the license"],docs:"12/24 months statements, business license, CPA letter, ID"}),
G("heloc",{name:"HELOC / HELOAN (second lien)",manual:"Lender guides (Spring EQ, Symmetry)",
 eligibility:["Owner-occupied (some second/investment); existing first mortgage stays; stand-alone or piggyback"],
 income:["Full doc; DTI ≤43–45%; bank-statement HELOCs exist"],
 credit:["680+ typical (600 at lower CLTV)"],
 assets:["CLTV 80–90% (some 95%); min draw rules; AVM or drive-by appraisal"],
 property:["1–4 units; condos"],
 limits:["$25k–$500k+; HELOC variable (prime + margin), 10-yr draw/20-yr repay; HELOAN fixed 5–30 yrs"],
 refi:["Subordination needed if the first is refinanced"],
 pitfalls:["Draw-period interest-only payment shock","Rate caps"],docs:"Pay stubs/W-2s, mortgage statement, insurance"}),
G("reverse",{name:"HECM / Proprietary Reverse",manual:"HUD Handbook 4235.1, ML 2014-21 (financial assessment), 2017 PLF tables; proprietary guides",
 eligibility:["Youngest borrower 62+ (proprietary 55+ in some states); primary residence; HUD counseling certificate; non-borrowing spouse protections"],
 income:["Financial assessment: residual income by region/family size + property-charge history; LESA (life-expectancy set-aside) if weak"],
 credit:["No minimum score; satisfactory property-charge payment history; derogatory → LESA or decline"],
 assets:["HECM-for-purchase: down payment 40–60% of price from allowed sources (no seller concessions beyond customary — verify)"],
 property:["FHA-eligible 1–4 units, condos (HUD-approved or SUA), manufactured; repairs set-aside"],
 limits:["HECM max claim $1,249,125 (2026 — matches FHA ceiling; verify); PLF by age/rate; proprietary to $4M+; MIP 2% upfront + 0.5% annual (HECM)"],
 refi:["HECM-to-HECM refinance with 5× benefit test; proprietary refis"],
 pitfalls:["Counseling before application","Non-borrowing spouse deferral eligibility","Condo approval"],docs:"ID, counseling cert, property charges history, income/asset docs for FA"}),
G("fndscr",{name:"Foreign National DSCR",manual:"Investor matrices",eligibility:["Non-resident with valid passport (+visa/ESTA); no SSN/ITIN needed; U.S. LLC OK; countries on OFAC list excluded"],income:["DSCR only; rent from 1007/lease"],credit:["Foreign credit report or 2–3 reference letters; some: none"],assets:["25–35% down; 6–12 months reserves in U.S. account; funds sourced with translated statements"],property:["1–4 units investment; condos/condotels at select lenders"],limits:["$100k–$2M+; prepay; IO options"],refi:["Cash-out 60–70% LTV"],pitfalls:["FIRPTA/W-8ECI planning","Wire sourcing","Visa expiry at closing"],docs:"Passport, visa, reference letters, U.S. bank statements, LLC docs"}),
G("alf",{name:"Assisted Living Facility Financing",manual:"SBA SOP 50 10; HUD 232 Handbook 4232.1; agency seniors housing guides",eligibility:["Licensed facility (state); owner-operator experience; 6–10 bed homes via SBA/residential; 20+ beds HUD 232"],income:["Facility NOI; DSCR 1.25–1.45; occupancy ≥85% stabilized; T-12 financials; rent roll; census"],credit:["Guarantor 680+ (SBA); global cash flow"],assets:["10% (SBA 504/7a) to 20–25% (bank); HUD 232 to 80–85% LTV, non-recourse"],property:["Licensing & survey history; environmental; life-safety; appraisal (income approach)"],limits:["SBA $5M (7a) / $5.5M (504); HUD unlimited; bank $1–20M typical"],refi:["HUD 223(f) refinance; SBA refinance of eligible debt"],pitfalls:["Survey deficiencies","Change-of-ownership license timelines","Medicaid-heavy payor mix"],docs:"License, T-12, rent roll, census, operator resume, state survey"}),
];
const GUIDE_SECTIONS=[["eligibility","Eligibility & occupancy"],["income","Income & ratios"],["credit","Credit & waiting periods"],["assets","Assets, down payment, concessions"],["property","Property & appraisal"],["limits","Limits, fees & MI"],["refi","Refinance rules"],["pitfalls","Common pitfalls"]];
/* Coach corpus: everything the AI coach should know, as compact text chunks for retrieval */
function coachCorpus(){ const out=[];
  GUIDELINES.forEach(g=>GUIDE_SECTIONS.forEach(([k,l])=>(g[k]||[]).forEach(t=>out.push({src:`${g.name} — ${l}`,t}))));
  PROGRAMS.forEach(p=>out.push({src:`Program table — ${p.name}`,t:`Min credit: ${p.minFico}. Down: ${p.down}. DTI: ${p.dti}. MI/fee: ${p.mi}. Best for: ${p.best}. Seller credit: ${p.seller}.`}));
  STRATEGIES2.forEach(s=>out.push({src:`Strategy ${s.id} — ${s.t}`,t:`${s.problem} ${s.mech} Cost: ${s.cost}. Qualifying: ${s.qual}. Programs: ${s.progs}. Risk: ${s.risk}. Best: ${s.best}. Cite: ${s.cite}`}));
  (typeof VA_TOUGH!=="undefined"?VA_TOUGH:[]).forEach(s=>out.push({src:`VA tough-file ${s.id} — ${s.t}`,t:`${s.how} (${s.cite}; ${s.who})`}));
  (typeof WEALTH!=="undefined"?WEALTH:[]).forEach(w=>out.push({src:`Wealth ${w.id} — ${w.t}`,t:`${w.how} Risk: ${w.risk}. Best: ${w.best}`}));
  LOE_LETTERS.forEach(l=>out.push({src:`LOE ${l.id} — ${l.title}`,t:`When: ${l.when} Underwriter needs: ${l.uw}`}));
  DISPUTE_LETTERS.forEach(l=>out.push({src:`Dispute ${l.id} — ${l.title}`,t:`${l.situation} Basis: ${l.basis}`}));
  SELLER_CREDITS.forEach(r=>out.push({src:`Seller credit — ${r[0]}`,t:`${r[1]}: ${r[2]}`}));
  (typeof SPECIAL_PAYS!=="undefined"?SPECIAL_PAYS:[]).forEach(p=>out.push({src:`Military pay — ${p[1]}`,t:`${p[2]} (${p[3]}). Underwriter: ${p[4]}`}));
  LENDERS.forEach(l=>out.push({src:`Lender — ${l.name}`,t:`${l.spec}${l.flag?" ⚠ "+l.flag:""}`}));
  return out; }
function coachSearch(q,n=8){ const words=q.toLowerCase().split(/[^a-z0-9%]+/).filter(w=>w.length>2); const corp=coachCorpus();
  return corp.map(c=>{const s=(c.src+" "+c.t).toLowerCase();let sc=0;words.forEach(w=>{if(s.includes(w))sc+=w.length>5?2:1;if(c.src.toLowerCase().includes(w))sc+=2});return {c,sc}}).filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,n).map(x=>x.c); }
const COACH_SYSTEM=`You are the VANESSA Loan Coach: a 30-year senior underwriter, processor, mortgage broker/MLO, VA specialist and credit analyst for Steven Shearrill (Patriot Pacific Financial Corp; SPACE Real Estate / LPT Realty). Answer like a mentor: 1) one-line answer, 2) plain-English explanation, 3) technical detail with the guideline citation (VA Pamphlet 26-7 chapter, HUD 4000.1 section, Fannie Selling Guide section, USDA HB-1-3555) and effective date caveats, 4) what to do next on the file (documents, LOE template IDs, strategy IDs), 5) risks and what to verify. Prefer VA residual-income reasoning over DTI. Never invent investor overlays — say 'verify with the investor matrix'. Never promise approval or quote a rate. Refuse CPN/identity tricks, 'dispute everything', or RESPA §8 arrangements. Use ONLY the provided reference excerpts plus well-established guideline knowledge; mark anything uncertain as 'verify'.`;
