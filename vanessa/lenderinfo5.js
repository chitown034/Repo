// Lender research batch — public sources as of 2026-10-22; verify with the AE before quoting.
(window.LENDER_INFO=window.LENDER_INFO||[]).push(...[
{
  n:45, name:"Quontic Bank", channel:"Wholesale (broker) + correspondent (bank / CDFI)",
  portal:"https://cor.quontic.com/",
  niches:["ITIN (investor)","Foreign National","Lite Doc (P&L / VOE)","DSCR","Asset Utilization","Closed-end seconds / HELOAN","CDFI mission lending"],
  programs:[
    {p:"ITIN Investor (Wholesale GP, eff. 10/31/2025)", ltv:"75% purchase & R/T / 70% cash-out", fico:"680", dti:"50%", loan:"Max $1,000,000", notes:"Lite Doc only; 12-mo PTIN or accountant-prepared P&L for self-employed; 1 month bank statement; property need not cash-flow. Cash-out may count toward reserves only if LTV <=70% and FICO >=720. (Read via search snippet; PDF host not reachable from this session.)", src:"https://cor.quontic.com/wp-content/uploads/2025/11/ITIN-investor-Wholesale-GP.pdf"},
    {p:"Asset Utilization — Owner Occupied (Wholesale GP)", ltv:"80% purchase, R/T and cash-out", fico:"660", dti:"50%", loan:"Max $3,000,000 (cash-out max $1,500,000 cash-in-hand)", notes:"Guide states it is not a bank statement program; 1 month bank statement (30 days). Qualifying income = post-closing assets x utilization factor / 60. DTI/loan read via search excerpt of the GP PDF.", src:"https://cor.quontic.com/wp-content/uploads/2025/11/Asset-Utilization-Owner-Occupied-Wholesale-GP.pdf"},
    {p:"DSCR (broker page — newer version)", ltv:"75% purchase & R/T / 70% cash-out", fico:"700", dti:"N/A (DSCR)", loan:"Up to $2,000,000 (Quontic consumer DSCR page, which also states 680 min FICO)", notes:"Loan max from https://www.quontic.com/mortgages/non-traditional-loans/dscr/ . DSCR >=1.00x. An older broker page showed DSCR >=1.10x, 680 FICO, loans to $2M, max $500k cash in hand. Exact page per version not isolated in search results (cor.quontic.com/?p=13334 or ?p=280).", src:"https://cor.quontic.com/?p=13334"},
    {p:"Lite Doc (investor)", ltv:"80% (older version 75%)", fico:"Not published — ask AE", dti:"50%", loan:"Not published — ask AE", notes:"Self-employed: 12-mo CPA/accountant P&L; salaried: Quontic VOE. 100% gift funds accepted (per NMP 2023 webinar summary).", src:"https://nationalmortgageprofessional.com/webinar/dealdesk-focus-quontic-banks-lite-doc-program"},
    {p:"Foreign National (Wholesale GP, eff. 10/31/2025)", ltv:"75% purchase & R/T / 60% cash-out", fico:"Not published — ask AE", dti:"N/A (DSCR >=1.10x, subject property income only)", loan:"Max $2,000,000 (cash-out proceeds max $500,000)", notes:"True foreign nationals only (cannot live/work in US); valid passport/visa; ITIN accepted. Only FICO reference is the 720 cash-out-for-reserves footnote. Read via search excerpt of the GP PDF.", src:"https://cor.quontic.com/wp-content/uploads/2025/11/Foreign-National-Wholesale-GP.pdf"},
    {p:"HELOAN Full Doc (Wholesale GP, eff. 10/31/2025)", ltv:"Up to 85% CLTV", fico:"680", dti:"50% primary / 45% second home & investor", loan:"$100,000 – $500,000", notes:"Agency-style income docs (paystubs, W2s, tax returns); no minimum reserves; primary, second home and investment eligible; TX excluded (TN also ineligible per Quontic full-doc page). Older 2024 seconds guide tiered 85% @740 / 80% @700 and capped >$250k at 80%.", src:"https://cor.quontic.com/wp-content/uploads/2025/11/HELOAN-Full-Doc-Wholesale-GP-1.pdf"}
  ],
  states:{CA:"Not confirmed",IL:"Not confirmed",NV:"Not confirmed",FL:"Not confirmed",AZ:"Not confirmed"}, statesSrc:"",
  nmls:"403503",
  highlights:["Self-described CDFI with ITIN, Foreign National, Lite Doc, DSCR, Asset Utilization programs","ITIN investor program — property does not need positive cash flow","Lite Doc: P&L or VOE income, no tax returns/W2s","FDIC-insured bank lender (balance sheet)"],
  cautions:["OCC consent order (2022) terminated effective 6/30/2026 (https://www.bankingdive.com/news/occ-terminates-quontic-consent-order/825480/); OCC prohibition order vs. a former VP in June 2026 for working with unapproved brokers — follow approval process strictly","Guide versions conflict (75% vs 80% LTV; DSCR 1.00 vs 1.10) — confirm current GP with AE","NMLS 403503 shown in quontic.com site footer (OCC-regulated federal savings bank — state licensing not shown; verify state eligibility with AE)","Third-party review lists Foreign National at 80% LTV, conflicting with Quontic GP (75%/60%) — use the GP (https://www.crowdfundedwealth.com/reviews/quontic-bank-dscr-review)"],
  status:"Active wholesale verified",
  sources:["https://cor.quontic.com/wp-content/uploads/2025/11/ITIN-investor-Wholesale-GP.pdf","https://cor.quontic.com/wp-content/uploads/2025/11/Asset-Utilization-Owner-Occupied-Wholesale-GP.pdf","https://cor.quontic.com/wp-content/uploads/2025/11/Foreign-National-Wholesale-GP.pdf","https://cor.quontic.com/?p=13334","https://cor.quontic.com/?p=280","https://cor.quontic.com/wp-content/uploads/2024/08/QB-Full-Doc-Seconds-Guidelines-04-11-2024.pdf","https://nationalmortgageprofessional.com/webinar/dealdesk-focus-quontic-banks-lite-doc-program","https://www.bankingdive.com/news/occ-terminates-quontic-consent-order/825480/","https://cor.quontic.com/wp-content/uploads/2025/11/HELOAN-Full-Doc-Wholesale-GP-1.pdf","https://www.quontic.com/mortgages/non-traditional-loans/dscr/"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:46, name:"RCN Capital", channel:"Private lender (broker-friendly) — Broker Referral Program + Correspondent Lending Program",
  portal:"https://rcncapital.com/",
  niches:["Fix & flip (ARV)","Long-term rental / DSCR","Multifamily 5+","New construction","Bridge","Protected broker relationships"],
  programs:[
    {p:"Fix & Flip (ARV program)", ltv:"Up to 100% purchase + 100% rehab, max 75% of ARV (tiered by experience)", fico:"650 (one RCN blog cites 600)", dti:"N/A", loan:"$75k – $3M", notes:"12 & 18 month terms; leverage tiered by completed flips; term sheets next business day for most ARV/short-term deals.", src:"https://rcncapital.com/faqs"},
    {p:"Long-Term Rental (DSCR)", ltv:"80% purchase (lesser of as-is/LTC) & R/T / 75% cash-out; 70% LTV on 2-4 units per RCN blog", fico:"660", dti:"N/A (DSCR)", loan:"$70k – $1.5M", notes:"30-year term; 24-hour decisions on full DSCR requests. Min DSCR not on RCN page found (third parties cite 1.00–1.15).", src:"https://rcncapital.com/faqs"},
    {p:"Multifamily (5+ units)", ltv:"~70–75% LTV", fico:"650–700 depending on program", dti:"N/A", loan:"Not published — ask AE", notes:"Per RCN loan programs summary.", src:"https://rcncapital.com/loan-programs"},
    {p:"New Construction", ltv:"Up to 75% of initial advance and up to 90% total LTC (top experience tier; tiered by completed ground-up projects — e.g. 1–4 projects 70% ARV / 85% LTC)", fico:"per flipperforce.com: 650", dti:"N/A", loan:"$100k – $2M (min as-completed value $150k)", notes:"12–24 month terms; interest-only; draws on inspection. RCN pages conflict on rates/terms (some >3 yrs old). FICO is third-party only.", src:"https://rcncapital.com/faqs"},
    {p:"Bridge (short-term)", ltv:"per thinkrealty.com: up to 80% LTV", fico:"Not published — ask AE", dti:"N/A", loan:"Not published — ask AE", notes:"Third-party figure; aggregators conflict on loan range ($75k–$2M vs $50k–$10M). Confirm with RCN.", src:"https://thinkrealty.com/article/the-short-term-bridge-loan-breakdown/"}
  ],
  states:{CA:"Yes",IL:"Not confirmed",NV:"Not confirmed",FL:"Not confirmed",AZ:"Yes"}, statesSrc:"https://rcncapital.com/document-library",
  nmls:"1045656",
  highlights:["Wholesale-first: Broker Referral Program with protected brokers","24-hour decisions on DSCR and bridge requests","Up to 100% purchase + 100% rehab for experienced flippers (75% ARV cap)","Broker training platform"],
  cautions:["RCN document library lists NMLS 1045656 and licenses AZ 0932325, CA Finance Lender 60DBO-46258, MN, OR ML-5571 (https://rcncapital.com/document-library); IL/FL/NV not listed there — third parties say RCN does NOT lend in NV (https://flipperforce.com/lenders/rcn-capital, https://www.crowdfundedwealth.com/reviews/rcn-capital-review) — confirm before submitting NV","Some RCN pages are 3+ years old; min FICO cited as 600, 650 and 660 in different places","rcncapital.com not reachable from research session; values from search snippets of RCN pages"],
  status:"Active wholesale verified",
  sources:["https://rcncapital.com/faqs","https://rcncapital.com/loan-programs","https://rcncapital.com/blog/why-rcn-capital-is-a-top-dscr-lender-for-brokers","https://rcncapital.com/blog/close-more-deals-with-rcn-capitals-broker-focused-loan-programs","https://rentalrealestate.com/tools/rcn-capital/","https://biggerpockets.com/business/page/1623","https://rcncapital.com/document-library","https://flipperforce.com/lenders/rcn-capital","https://thinkrealty.com/article/the-short-term-bridge-loan-breakdown/"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:47, name:"REMN (Real Estate Mortgage Network)", channel:"Wholesale (broker) — REMN Wholesale, division of Homebridge Financial Services",
  portal:"https://www.remnwholesale.com",
  niches:["FHA 203(k) Standard & Limited","Fannie Mae HomeStyle Renovation","Renovation Concierge Service","Conv / FHA / VA / USDA","Non-QM (Homebridge Access / Elite Access)"],
  programs:[
    {p:"FHA 203(k) (historic REMN launch)", ltv:"96.5% purchase / 97.5% refi (2011 launch); R/T refi 75% LTV/CLTV per Homebridge bulletin 21-19", fico:"620 (Homebridge bulletin 21-19, lowered from 680)", dti:"Not published — ask AE", loan:"FHA limits", notes:"Dedicated team manages post-closing, inspections and draws. Homebridge (REMN parent) bulletin 21-19 removed $150k Standard repair cap and allowed 2–4 units. 2011 launch data + ~2021 bulletin — confirm current. FICO/R-T LTV from https://www.homebridgewholesale.com/bulletin/enhancements-to-the-203k-standard-and-limited-programs/", src:"https://www.homebridgewholesale.com/bulletin/enhancements-to-the-203k-standard-and-limited-programs/"},
    {p:"Fannie Mae HomeStyle Renovation", ltv:"95% (Homebridge 2017 doc); R/T refi 90% primary/2nd home, 75% investment (bulletin 21-18)", fico:"620 (Homebridge bulletin 21-18, lowered from 680)", dti:"Not published — ask AE", loan:"Fannie Mae limits", notes:"Purchase repairs capped at lesser of $200k or 50% of sales price (bulletin 21-18); contractor profile, W-9, license & insurance required. Bulletin ~2021 — confirm current. 95% LTV from https://www.homebridge.com/wp-content/uploads/2017/04/Handyman-Special.pdf", src:"https://www.homebridgewholesale.com/bulletin/enhancements-and-updates-to-the-fannie-mae-homestyle-program/"},
    {p:"Access (Non-QM) — Homebridge, Oct 2025", ltv:"IO up to 85% (80% ICF/P&L-only); P&L-only max 70%", fico:"620 full doc/bank stmt/1099/ICF; 660 P&L-only & asset qualifier (P&L-only conditions cite 720)", dti:"50%, no exceptions (Oct 2024 combined guide; DSCR option N/A)", loan:"Max $3.5M", notes:"Homebridge Wholesale product; confirm availability through the REMN division. DTI from https://www.homebridgewholesale.com/wp-content/uploads/2024/11/Access-Combined-Matrices-and-Guidelines-10-18-24.pdf", src:"https://www.homebridgewholesale.com/wp-content/uploads/2025/11/Access-Overview-10-28-25.pdf"},
    {p:"Elite Access (Non-QM) Full Doc — Oct 2025", ltv:"80% to $2M / 75% $2M–2.5M / 70% >$2.5M", fico:"680 (older bulletin; 700 ICF)", dti:"50%", loan:"Min $125k–$150k (footnotes conflict); max ~$3M", notes:"IO eligible; non-warrantable condo 75% max (older bulletin).", src:"https://www.homebridgewholesale.com/wp-content/uploads/2025/12/Elite-Access-10-24-25.pdf"},
    {p:"Symmetry HELOC piggyback", ltv:"89.99% CLTV primary", fico:"680", dti:"45%", loan:"Line up to $750k (<=80% CLTV)", notes:"Closes with FNMA/FHLMC/FHA first; see Symmetry entry.", src:"https://www.homebridgewholesale.com/wp-content/uploads/2026/07/HELOC-Program-Guides-7-23-26.pdf"}
  ],
  states:{CA:"Yes",IL:"Yes",NV:"Yes",FL:"Yes",AZ:"Yes"}, statesSrc:"https://www.homebridge.com/licensing/",
  nmls:"6521",
  highlights:["Long-time renovation specialist (203k, HomeStyle, Renovation Concierge)","Parent Homebridge is Ginnie Mae issuer with own servicing","On ARIVE LOS since 2022; licensed/approved in 50 states + DC (2022 release)","Homebridge sold retail to CMG (2023) — wholesale-only parent"],
  cautions:["No REMN-specific news 2024–2026 found; division still listed on homebridge.com (2026) — confirm REMN vs Homebridge Wholesale is the right channel for your approval","Most 203(k) specifics are 2011–2014 press; verify current guides","Homebridge licensing page ~600 days old (CA DFPI RMLA; IL MB.6760732; NV 4122; FL MLD1222; AZ 0922458)"],
  status:"Active — channel not confirmed",
  sources:["https://nationalmortgageprofessional.com/news/22650/remn-launches-new-wholesale-203k-product","https://nationalmortgageprofessional.com/news/40684/remn-updates-product-line-include-fannie-maes-homepath-reno","https://en.wikipedia.org/wiki/Homebridge_Financial_Services","https://arive.com/press/remn-wholesale-joins-arive","https://www.homebridge.com/licensing/","https://www.homebridge.com/","https://www.homebridgewholesale.com/wp-content/uploads/2025/11/Access-Overview-10-28-25.pdf","https://www.homebridgewholesale.com/wp-content/uploads/2025/12/Elite-Access-10-24-25.pdf","https://www.homebridge.com/wp-content/uploads/2017/04/Handyman-Special.pdf","https://www.homebridgewholesale.com/bulletin/enhancements-to-the-203k-standard-and-limited-programs/","https://www.homebridgewholesale.com/bulletin/enhancements-and-updates-to-the-fannie-mae-homestyle-program/","https://www.homebridgewholesale.com/wp-content/uploads/2024/11/Access-Combined-Matrices-and-Guidelines-10-18-24.pdf"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:48, name:"Spring EQ", channel:"Wholesale (broker) + delegated correspondent",
  portal:"https://wholesale.springeq.com/",
  niches:["Variable-rate HELOC","Fixed-rate HELOC (FixLine)","HELOAN closed-end seconds","1st-lien HELOC","DSCR (2026 program guides)","Second homes & investment (1-unit)"],
  programs:[
    {p:"HELOAN (closed-end 2nd)", ltv:"Owner-occ 90% CLTV @680 / 80% @660 / 70% @640 (2024 overview showed 95% @740)", fico:"640", dti:"45% (50% exception @700 FICO w/ $3,500 residual — correspondent matrix)", loan:"$25k – $500k (>= $400k needs 740+)", notes:"20/30-yr fixed terms.", src:"https://wholesale.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_files/Active_Spring%20EQ%20Wholesale%20Product%20Comparison.pdf"},
    {p:"Variable-rate HELOC", ltv:"80% max CLTV (2026 correspondent matrix)", fico:"640 (Spring EQ HELOC page: https://mortgage.springeq.com/heloc-search)", dti:"45%", loan:"Min $50k; max $500k 2nd lien", notes:"Correspondent matrix released 9/8/2026; wholesale may differ.", src:"https://correspondent.springeq.com/hubfs/Wholesale%20File%20Transfer/Correspondent/ActiveDelegatedMatrices.pdf"},
    {p:"Fixed-rate HELOC (FixLine)", ltv:"Owner-occ 90% CLTV @680 / 80% @660 / 70% @640; 2nd home & investment (SFR) 80% @740 / 70% @680 (wholesale product comparison 8/27/2025)", fico:"640 (consumer site 'as low as')", dti:"45%", loan:"Min $25k ($50k TX); max $500k 2nd lien", notes:"15/20/30-yr fully amortizing; initial draw greater of $25k or 75% of line. Consumer site advertises $50k–$500k. Max/min loan per 2026 correspondent matrix.", src:"https://wholesale.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_files/Active_Spring%20EQ%20Wholesale%20Product%20Comparison.pdf"},
    {p:"1st-lien HELOC", ltv:"80% max CLTV (2026 correspondent matrix)", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Max $750k (>= $400k needs 740+)", notes:"Per 2026 correspondent matrix (9/8/2026): not available for purchase or in HI, NY, PA.", src:"https://correspondent.springeq.com/hubfs/Wholesale%20File%20Transfer/Correspondent/ActiveDelegatedMatrices.pdf"},
    {p:"DSCR (program guide released 1/12/2026)", ltv:"DSCR >=1.00: 740+ 80% purch/R-T, 75% cash-out; 700–739 80%/70%; 680–699 75%/65%; 660–679 70%/60% (lower for DSCR 0.75–0.99)", fico:"660", dti:"N/A (min DSCR 0.75x; 1.00x if loan > $1.5M)", loan:"$100,000 – $2,500,000 (740+; $1.5M max below 740); cash-out max $500k", notes:"Requires broker company + MLO license in CA (DSCR licensing map 2/16/2026). $5M aggregate exposure per borrower. Matrix read via search excerpt (text partly garbled) — confirm column alignment.", src:"https://wholesale.springeq.com/hubfs/Spring%20EQ%20DSCR%20Program%20Guides%20-%20Released%201.12.2026.pdf?hsLang=en"}
  ],
  states:{CA:"Yes",IL:"Yes",NV:"Yes",FL:"Yes",AZ:"Yes"}, statesSrc:"https://wholesale.springeq.com/legal",
  nmls:"1464945",
  highlights:["Dedicated home-equity wholesale lender with HELOC, FixLine and HELOAN","Public wholesale matrices and daily rate sheets (latest seen 09.30.2026)","Second home and investment eligibility (1-unit)","Expanded into DSCR in 2026"],
  cautions:["2024 vs later matrices conflict on top CLTV (95% vs 90%) — use the current matrix","Variable HELOC capped at 80% CLTV in the 2026 correspondent matrix","NV: Spring EQ legal page lists Nevada Mortgage Company License No. 4993 (https://www.springeq.com/legal) — seen in a cached excerpt; a newer legal-page excerpt did not show NV, so confirm"],
  status:"Active wholesale verified",
  sources:["https://wholesale.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_files/Active_Spring%20EQ%20Wholesale%20Product%20Comparison.pdf","https://mortgage.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_files/Spring%20EQ%20Wholesale%20Product%20Overview.pdf","https://correspondent.springeq.com/hubfs/Wholesale%20File%20Transfer/Correspondent/ActiveDelegatedMatrices.pdf","https://mortgage.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_rates_fees_guidelines_matrices/ActiveWholesaleRateSheet.pdf?hsLang=en","https://wholesale.springeq.com/hubfs/Spring%20EQ%20DSCR%20Program%20Guides%20-%20Released%201.12.2026.pdf?hsLang=en","https://wholesale.springeq.com/hubfs/Wholesale%20File%20Transfer/2022_website_rates_fees_guidelines_matrices/Active%20DSCR%20State%20Licensing%20Map.pdf","https://wholesale.springeq.com/legal","https://www.springeq.com/legal","https://mortgage.springeq.com/heloc-search"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:49, name:"Symmetry Lending", channel:"Wholesale (broker) — HELOC via credit-union partner; also offered through Homebridge Wholesale",
  portal:"",
  niches:["Piggyback HELOC with agency/FHA first","Standalone HELOC (120+ days after first)","1st-lien HELOC","Second homes & 1-4 unit investment","Jumbo lines to $1M"],
  programs:[
    {p:"HELOC — Primary residence (Homebridge guide 7/23/26)", ltv:"89.99% CLTV", fico:"680", dti:"45%", loan:"Line $750k (<=80% CLTV) / $500k (>80%) / $1M (<=75% CLTV, 720+); combined 1st+HELOC max $4M", notes:"Min initial draw $25k ($50k in AZ, CA, FL, OR, WA). Prime + margin; +0.25% for 10-yr draw, +0.50% if CLTV >80%. Borrower must join partner credit union before CTC; Symmetry-ordered desk review.", src:"https://www.homebridgewholesale.com/wp-content/uploads/2026/07/HELOC-Program-Guides-7-23-26.pdf"},
    {p:"HELOC — Second home", ltv:"85% CLTV", fico:"700", dti:"43% (HELOC guide 7/23/26)", loan:"Max line $500k", notes:"", src:"https://www.homebridgewholesale.com/wp-content/uploads/2026/07/Introduction-to-Symmetry-HELOC-Program-7-23-26.pdf"},
    {p:"HELOC — Investment (1-4 unit)", ltv:"70% CLTV", fico:"720", dti:"43%", loan:"Max line $500k", notes:"", src:"https://www.homebridgewholesale.com/wp-content/uploads/2026/07/HELOC-Program-Guides-7-23-26.pdf"},
    {p:"First-lien HELOC", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Announced for Symmetry's approved broker network (MPA).", src:"https://mpamag.com/us/specialty/wholesale/symmetry-lending-unveils-new-first-lien-heloc/470037"}
  ],
  states:{CA:"Not confirmed",IL:"Not confirmed",NV:"Not confirmed",FL:"Not confirmed",AZ:"Not confirmed"}, statesSrc:"",
  nmls:"",
  highlights:["Lines up to $1M at <=75% CLTV with 720+","Closes simultaneously with FNMA/FHLMC/FHA first lien","~50,000 HELOCs / $7.2B funded since 2018; master servicer (MPA)","Enhanced broker fees announced (MPA)"],
  cautions:["Draw period reduced from 10 to 5 years on all HELOCs (https://www.mpamag.com/us/specialty/reverse/symmetry-lending-revamps-heloc-rates-and-terms/471809)","Lines > $750k ineligible in CA (2025 Homebridge deck)","Own site/NMLS not retrievable — terms are from Homebridge Wholesale documents"],
  status:"Active wholesale verified",
  sources:["https://www.homebridgewholesale.com/wp-content/uploads/2026/07/HELOC-Program-Guides-7-23-26.pdf","https://www.homebridgewholesale.com/wp-content/uploads/2026/07/Introduction-to-Symmetry-HELOC-Program-7-23-26.pdf","https://www.homebridgewholesale.com/wp-content/uploads/2026/04/Introduction-to-Symmetry-HELOC-Program-4-15-25.pdf","https://www.homebridgewholesale.com/wp-content/uploads/2025/10/HELOC-Program-Guides-10-28-25.pdf","https://mpamag.com/us/specialty/wholesale/symmetry-lending-unveils-new-first-lien-heloc/470037","https://www.mpamag.com/us/specialty/reverse/symmetry-lending-revamps-heloc-rates-and-terms/471809"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:50, name:"TaliMar Financial", channel:"Private lender (broker-friendly) — California direct lender / debt fund",
  portal:"https://www.talimarfinancial.com/",
  niches:["California bridge loans","Fix & flip","New construction / ADU / infill","Cash-out bridge","Owner-occupied consumer bridge (per directory)","Fast close (5–7 days)"],
  programs:[
    {p:"Bridge", ltv:"Up to 75% LTV (purchase / refi / cash-out)", fico:"Not published — ask AE", dti:"N/A", loan:"Not published — ask AE", notes:"6–60 month term; interest-only; 5–7 day close; California only.", src:"https://www.talimarfinancial.com/bridge-loan-program/"},
    {p:"Fix & Flip", ltv:"Up to 70% of completion value", fico:"Not published — ask AE", dti:"N/A", loan:"Not published — ask AE", notes:"12–24 month terms; older pages cite up to 100% of renovation costs funded.", src:"https://www.talimarfinancial.com/hard-money-loan-programs/"},
    {p:"New Construction", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"N/A", loan:"Not published — ask AE", notes:"Draw-based funding; ground-up, infill, ADU.", src:"https://www.talimarfinancial.com/"},
    {p:"Overall terms (per flipperforce.com directory)", ltv:"70% LTV / 75% LTC", fico:"Not published — ask AE", dti:"N/A", loan:"$50k – $10M", notes:"Per flipperforce.com: rates 7.99%–12%, 1–4 points, 3–24 month terms; also DSCR rental.", src:"https://flipperforce.com/lenders/talimar-financial"}
  ],
  states:{CA:"Yes",IL:"No",NV:"No",FL:"No",AZ:"No"}, statesSrc:"https://www.talimarfinancial.com/bridge-loan-program/",
  nmls:"",
  highlights:["Asset-based, California-focused direct lender","5–7 day closings","Works with mortgage brokers (per TaliMar posts)","Interest-only bridge up to 60 months"],
  cautions:["States other than CA marked No based on 'California only' on bridge page — confirm for other products","NMLS 337721 / CA DRE 01889802 per flipperforce.com only — not verified on NMLS Consumer Access"],
  status:"Active — channel not confirmed",
  sources:["https://www.talimarfinancial.com/","https://www.talimarfinancial.com/bridge-loan-program/","https://www.talimarfinancial.com/hard-money-loan-programs/","https://flipperforce.com/lenders/talimar-financial"],
  checked:"2026-10-22"
},
{
  n:51, name:"The Loan Store (TLS) — now Averra Financial", channel:"Wholesale (broker) + non-delegated correspondent",
  portal:"https://tlstpo.com",
  niches:["Agency Conv / FHA / VA / USDA","Non-QM: DSCR, bank statement, asset depletion, foreign national","Second mortgages / HELOC (Aven partnership)","Buy-before-you-sell","Averra Advantage income tool"],
  programs:[
    {p:"Agency (Conv/FHA/VA/USDA)", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Guides behind broker login.", src:"https://nationalmortgageprofessional.com/news/loan-store-rebrands-averra-financial"},
    {p:"Non-QM (DSCR, bank statement, asset depletion, foreign national)", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Branded Flex NQM Income, Flex NQM Income Max, Flex NQM DSCR, Flex NQM DSCR Max (https://tlstpo.com/products/). Non-QM volume +68% FY-to-date through Aug 2026.", src:"https://tlstpo.com/products/"},
    {p:"Wholesale HELOC (Figure) — AAG eff. 9/30/2025", ltv:"Up to 85% CLTV (owner-occ 1st/2nd lien @740+); NOO max 80% (1st lien @680+); FL max 70%; NM 1st lien 79.99%", fico:"600 (600–639 band: owner-occ 2nd lien only, max 75% CLTV / $250k); variable-rate min 640", dti:"Not published — ask AE", loan:"$25,000 – $750,000 ($110k min when CLTV >70%–80%)", notes:"Variable-rate option not available on 1st liens and not offered in several states incl. IL. Read via search excerpt of the AAG PDF.", src:"https://tlstpo.com/wp-content/uploads/2025/07/Figure-HELOC-AAG.pdf"},
    {p:"HELOC (Aven partnership) / second mortgages", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"First Aven HELOC funded May 2026.", src:"https://www.housingwire.com/articles/averra-financial-the-loan-store-rebrand/"}
  ],
  states:{CA:"Yes",IL:"Not confirmed",NV:"Not confirmed",FL:"Yes",AZ:"Yes"}, statesSrc:"https://tlstpo.com/licensing/",
  nmls:"1121650",
  highlights:["Acquired Homepoint wholesale (2023); says it is a top-4 US wholesale lender","Broad agency + non-QM + seconds menu","Averra Advantage income-qualification tool for complex income","AEs, programs, pricing and approvals unchanged by rebrand"],
  cautions:["Rebranded to Averra Financial effective Oct 1, 2026 (https://www.housingwire.com/articles/averra-financial-the-loan-store-rebrand/) — update lender name/portal bookmarks","NMLS 1121650 shown on tlstpo.com (now branded Averra Financial Inc.) and Missouri licensee record (https://finance.mo.gov/licensee/details/219)","tlstpo.com now carries Averra branding; IL/NV license entries not visible in licensing-page excerpt — check NMLS Consumer Access"],
  status:"Active wholesale verified",
  sources:["https://www.housingwire.com/articles/averra-financial-the-loan-store-rebrand/","https://nationalmortgageprofessional.com/news/loan-store-rebrands-averra-financial","https://informaconnect.com/imn-non-qm/sponsors/the-loan-store/","https://finance.mo.gov/licensee/details/219","https://themortgagepoint.com/2023/04/07/the-loan-store-acquires-homepoints-wholesale-operations/","https://tlstpo.com/licensing/","https://tlstpo.com/products/","https://tlstpo.com/wp-content/uploads/2025/07/Figure-HELOC-AAG.pdf"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:52, name:"TMAC Reverse", channel:"Wholesale (broker) — also correspondent, principal-agent, retail (dba GoodLife Home Loans)",
  portal:"",
  niches:["HECM reverse mortgages","Proprietary jumbo reverse (Meridian, to $4M)","HECM for Purchase (not confirmed)","FHA direct lender / Ginnie Mae HMBS issuer","Broker wholesale reverse"],
  programs:[
    {p:"HECM (FHA-insured)", ltv:"Not published — ask AE (HUD PLF-based)", fico:"Not published — ask AE", dti:"N/A (HUD financial assessment)", loan:"Not published — ask AE (FHA max claim limit)", notes:"TMAC is FHA direct lender and Ginnie Mae issuer of HECMs.", src:"https://nrmlaonline.org/vendors/traditional-mortgage-acceptance-corporation"},
    {p:"Proprietary / jumbo reverse (Meridian)", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"per housingwire.com: up to $4 million", notes:"HousingWire (Sept 2025): GoodLife has its own proprietary product under the Meridian brand; plans to expand options.", src:"https://www.housingwire.com/articles/goodlife-home-loans-chase-kinder-reverse-mortgage-expansion/"}
  ],
  states:{CA:"Not confirmed",IL:"Not confirmed",NV:"Not confirmed",FL:"Not confirmed",AZ:"Not confirmed"}, statesSrc:"",
  nmls:"971307",
  highlights:["4th-largest HECM originator per RMI (1,344 HECMs in year ending July 2025)","Dedicated wholesale division led by VP Chase Kinder (Sept 2025)","Ginnie Mae issuer — in-house execution"],
  cautions:["No formal broker protection plan; launched retail reverse division May 2025 (https://www.housingwire.com/articles/goodlife-home-loans-launches-retail-reverse-mortgage-division-says-it-is-actively-hiring/)","Newest public info is late 2025; no broker portal URL found"],
  status:"Active wholesale verified",
  sources:["https://nrmlaonline.org/vendors/traditional-mortgage-acceptance-corporation","https://www.housingwire.com/articles/goodlife-home-loans-chase-kinder-reverse-mortgage-expansion/","https://www.housingwire.com/articles/goodlife-home-loans-launches-retail-reverse-mortgage-division-says-it-is-actively-hiring/"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:53, name:"TPO Go", channel:"Wholesale (broker) — Norwich Commercial Group dba TPO GO (former Norcom wholesale)",
  portal:"",
  niches:["Conventional / Government / USDA","Chenoa down payment assistance","First-time homebuyer","Renovation: 203(k), HomeStyle, CHOICERenovation, VA reno"],
  programs:[
    {p:"Agency Conv / FHA / VA / USDA", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Products/pricing in ARIVE (June 2026).", src:"https://www.arive.com/press/tpo-go-integrates-with-arive-bringing-its-full-suite-of-broker-focused-products-and-pricing"},
    {p:"Renovation (203k, HomeStyle, CHOICERenovation, VA)", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Per older trade reporting.", src:"https://mpamag.com/us/specialty/wholesale/tpo-go-to-commit-fully-to-wholesale-mortgage-lending/491329"}
  ],
  states:{CA:"Not confirmed",IL:"Not confirmed",NV:"Not confirmed",FL:"Not confirmed",AZ:"Not confirmed"}, statesSrc:"",
  nmls:"",
  highlights:["Integrated with ARIVE (June 2026)","Chenoa DPA and renovation suite"],
  cautions:["TPO GO exiting wholesale nationally under strategic alliance with Stockton Mortgage, closing Aug 10 (2026); may keep limited wholesale in defined markets (https://www.housingwire.com/articles/tpo-go-exits-wholesale-stockton/)","Chrisman (Aug 5, 2026) says the wholesale division joins Cursive Lending, Stockton's TPO channel (https://chrismancommentary.com/?p=22049) — consider moving pipeline/approval to Stockton/Cursive","Do not confuse with GO Mortgage (Tampa) TPO channel launched May 2026"],
  status:"Possibly inactive/exited — verify",
  sources:["https://www.housingwire.com/articles/tpo-go-exits-wholesale-stockton/","https://chrismancommentary.com/?p=22049","https://www.arive.com/press/tpo-go-integrates-with-arive-bringing-its-full-suite-of-broker-focused-products-and-pricing","https://mpamag.com/us/specialty/wholesale/tpo-go-to-commit-fully-to-wholesale-mortgage-lending/491329"],
  checked:"2026-10-22"
},
{
  n:54, name:"Triad Financial Services", channel:"Wholesale (broker) — manufactured housing lender (also retailer/dealer channel)",
  portal:"https://www.triadfs.com/brokers/enrollment",
  niches:["Chattel / home-only","Land-home (land-in-lieu of down payment)","Existing land-home","Land Plus","ITIN manufactured home program","550 credit score"],
  programs:[
    {p:"Home Only (chattel)", ltv:"95%", fico:"550", dti:"50% (broker flyer 10/3/25; 2022 CA guideline showed 48%)", loan:"$20,000 – $450,000 (broker flyer 10/3/25; older 3/27/25 retailer flyer said $10k min)", notes:"Max term 300 months; credit-tier matrix applies; min 5% down; single/double/triple-wides and park models eligible. LTV/term per broker training deck 10/3/25 (https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Broker%20Training/Triad%20Broker%20Training%2010.3.25.pdf).", src:"https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/BROKER%20Home%20Only%20Flyer_Fillable_10.3.25.pdf"},
    {p:"Land-Home", ltv:"95%", fico:"550", dti:"Not published — ask AE", loan:"Min $35,000", notes:"Land owned free & clear; land can be gifted/inherited in lieu of cash down; up to $25k land improvements; 360-month term.", src:"https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Broker%20Training/Triad%20Broker%20Training%2010.3.25.pdf"},
    {p:"Land Plus", ltv:"95%", fico:"550", dti:"Not published — ask AE", loan:"Min $80,000", notes:"360-month term.", src:"https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Broker%20Training/Triad%20Broker%20Training%2010.3.25.pdf"},
    {p:"Broker Home Only & Existing Land Home (flyer 3/27/25)", ltv:"Not published — ask AE", fico:"550", dti:"Not published — ask AE", loan:"Min $20,000", notes:"Low down payments, fixed rates.", src:"https://triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/Broker%20Home%20Only%20%26%20Existing%20Land%20Home%203.27.25.pdf"},
    {p:"ITIN Program (flyer 6/24/25)", ltv:"Not published — ask AE", fico:"550", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"ITINs accepted on all chattel programs (Gold, Silver, Bronze); NOT accepted for Land Home or Land Plus. Needs gov't non-resident ID or foreign passport + ITIN card; credit pulled on SSN and ITIN if borrower has both.", src:"https://offers.triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/TFS%20%20ITIN%20Program%206.24.25.pdf"}
  ],
  states:{CA:"Yes",IL:"Yes",NV:"Yes",FL:"Not confirmed",AZ:"Yes"}, statesSrc:"https://www.triadfs.com/licensing",
  nmls:"1063",
  highlights:["550 minimum credit score","Land-in-lieu of cash down payment","Home-only financing in 43 states (FAQ)","Broker training deck and flyers published publicly"],
  cautions:["FL mortgage license number not found on licensing page (only insurance licenses) — verify FL lending eligibility","Loan minimums conflict across flyers ($10k on 3/27/25 retailer flyer vs $20k on 9/30/25 and 10/3/25 flyers) — newer flyers show $20k"],
  status:"Active wholesale verified",
  sources:["https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Broker%20Training/Triad%20Broker%20Training%2010.3.25.pdf","https://triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/Broker%20Home%20Only%20%26%20Existing%20Land%20Home%203.27.25.pdf","https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/Triad%20BROKER%20Program%20Flyer.pdf","https://offers.triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/TFS%20%20ITIN%20Program%206.24.25.pdf","https://www.triadfs.com/licensing","https://triadfs.com/realtor/faq","https://www.triadfs.com/brokers/enrollment","https://www.triadfs.com/hubfs/Website%20Images/Retail%20Material/Flyer%20Library/BROKER%20Home%20Only%20Flyer_Fillable_10.3.25.pdf","https://www.triadfs.com/hubfs/Marketing%20Materials/2022%20New%20Branding/California/Chattel%20Programs%20and%20Guidlines_Condensed_CA%2012.29.2022.pdf"],
  checked:"2026-10-22 (2nd pass)"
},
{
  n:55, name:"Union Home Mortgage (UHM)", channel:"Wholesale (broker) + retail",
  portal:"",
  niches:["Agency Conv / FHA / VA / USDA","Non-QM Platinum suite (bank statement, DSCR)","Jumbo","Non-owner occupied","Renovation incl. FHA 203(k) (per third-party review)","Former Sierra Pacific wholesale team"],
  programs:[
    {p:"Agency Conv / FHA / VA / USDA", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Products/pricing in ARIVE (May 2025).", src:"https://www.streetinsider.com/PRNewswire/Union+Home+Mortgage+Joins+ARIVE+Platform/24794343.html"},
    {p:"Platinum Non-QM (bank statement, DSCR)", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"Launched Oct 2025.", src:"https://nationalmortgageprofessional.com/news/union-home-mortgage-expands-non-qm-options"},
    {p:"Jumbo / Non-owner-occupied QM", ltv:"Not published — ask AE", fico:"Not published — ask AE", dti:"Not published — ask AE", loan:"Not published — ask AE", notes:"", src:"https://nationalmortgageprofessional.com/news/union-home-mortgage-expands-non-qm-options"}
  ],
  states:{CA:"Yes",IL:"Yes",NV:"Yes",FL:"Yes",AZ:"Yes"}, statesSrc:"https://uhm.com/licensing-information",
  nmls:"2229",
  highlights:["Self-described 7th-largest US wholesale lender","Acquired AmeriTrust origination assets incl. broker relationships (July 2026) to expand wholesale & non-QM","On ARIVE LOS","Licensed in 48 states (Inman 2025)"],
  cautions:["No public wholesale matrix or broker portal URL found — guides likely behind broker login","States: UHM licensing page says it is not licensed in HI and NY only; CA RMLA 4131047 / CFL 60DBO61986 (Irvine branch page shows CA 41DBO-180026 — conflicts); NV marked Yes by that exclusion statement, not by a listed NV number — confirm on NMLS Consumer Access"],
  status:"Active wholesale verified",
  sources:["https://nationalmortgageprofessional.com/news/union-home-mortgage-expands-non-qm-options","https://nationalmortgageprofessional.com/news/union-home-targets-20b-run-rate-ameritrust-deal","https://www.uhm.com/in-the-news/union-home-mortgage-acquires-origination-assets-of-ameritrust-mortgage-corporation/","https://www.streetinsider.com/PRNewswire/Union+Home+Mortgage+Joins+ARIVE+Platform/24794343.html","https://www.thetruthaboutmortgage.com/union-home-mortgage-review","https://www.inman.com/2025/03/04/uhm-adds-1b-in-lending-capacity-with-nrl-mortgage-acquisition/","https://uhm.com/licensing-information"],
  checked:"2026-10-22 (2nd pass)"
}
]);
