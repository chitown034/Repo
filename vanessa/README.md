# VANESSA 3.0 — Command Dashboard

Interactive prototype of the Realtor + Mortgage + Credit OS from the VANESSA 3.0 blueprint. Static site, no build step.

```bash
cd vanessa && python3 -m http.server 8765   # open http://localhost:8765
node scripts/check-calcs.js                 # 42 golden checks: calculators == Supabase SQL, VA toolkit, credit sim
python3 scripts/build-artifact.py           # single-file build → dist/vanessa-dashboard.html (published artifact)
```

## Pages added in the second pass
| Page | What it does |
|---|---|
| **VA Toolkit** | **BAH for every duty station** (115 seeded stations in 41 states/territories × 27 pay grades × with/without dependents, state → station → grade dropdowns, ZIP lookup, BAH-covers-what-home solver) with an **importer for the official DTMO files** (bahw/bahwo/mhanames/zip-MHA) that replaces estimates with exact rates for all ~300 MHAs; **military pay & special-pays calculator** (2026 basic pay by grade/YOS, BAS, 23 special pays/allowances with the underwriter's counts/excluded/gross-up treatment, qualifying income, max PITI); funding-fee calculator (2026 tiers + exemptions), entitlement/down-payment calculator (full vs partial), residual-income calculator (Pamphlet 26-7 tables, 120% rule), IRRRL eligibility tester (seasoning, NTB, recoupment), COE quick check, Nellis BAH-vs-mortgage, allowable/non-allowable fees, MPR checklist, document checklists, purchase timeline |
| **Qualifying Strategies** | 32 strategies with 14 structured dimensions, side-by-side comparison of up to 4, and a worked comparison (price cut vs points vs 2-1 buydown vs closing-cost credit) on one deal |
| **Credit Simulator** | Heuristic score model; per-tradeline actions (pay to 30/10/0%, close, limit increase, AU removal, inaccurate-late removal, collection pay / pay-for-delete / delete / settle); score range, tier crossings, cash needed, points-per-dollar ranking, budget auto-planner |
| **Letter Desk** | 36 dispute/validation/goodwill letters (bureau, furnisher, collector, SCRA) and 113 letters of explanation (40 military/veteran scenarios) in a grouped dropdown; merge fields; plug-and-play tailoring (click-to-insert field tokens, snippet library, per-template edits with reset); download as `.docx` or `.pdf`, all-3-bureau `.zip`, or the entire library `.zip` (Word + PDF) — no dependencies (`pdf.js` is a tiny Times-Roman PDF writer) |
| **Partner Targets** | 125 home builders in CA/NV/AZ/IL/FL (captive-lender flag + preferred-lender playbook + pitch one-pager), 72 family offices/trust companies/RIAs + 14 reverse-mortgage referral channels, self-employed marketing map (demographics, 7 channels), foreign-national DSCR (program rules, demographics by state, associations, DSCR calc), assisted-living facilities (state licensing databases, 33 operators, 8 loan products, loan sizer), and an outreach tracker with CSV export |
| **Wealth & Debt** | 14 wealth-building playbooks (VA house-hack, PCS portfolio, invest-the-difference, assumptions, HELOC recycling…) with a net-worth simulator (6 strategies, 20-yr chart), a debt-payoff simulator (avalanche, snowball, consolidation, 0% transfer, DMP, minimums — months, interest, DTI, loan-ready date) and a dated credit-repair plan generator |
| **Scale Engine** | 1,000-closings capacity model (leads/apps/closings per day, staffing by ratio, P&L, 24-month ramp), AI/automation catalog for all 8 loan stages (A1–A26 + SLAs + human gates), 10 AI agents, and the 5-star service & loyalty system (journey touches, tiers, recovery triggers, KPIs) |
| **Marketing Plan** | VA Loan Mastermind plan: event, KPI scorecard, funnel calculator, personas, channels, follow-up, timeline, compliance |
| **EA / ISA Ops** | Speed-to-lead SLA timer, start/end-of-day and new-lead SOP checklists, qualification script, four-layer leverage model, 17 pipeline stages, IRRRL prospecting program, escalation triggers |
| **Zoho CRM** | Connection status, module/field mapping, stage map, Z1–Z7 sync workflows, go-live checklist, Supabase edge-function code, sync log |

**Zoho status:** your Composio Zoho connection returned `403 NO_PERMISSION` on 2026-10-18 — reconnect with `ZohoCRM.modules.ALL`, `ZohoCRM.settings.ALL`, `ZohoCRM.users.READ` before the sync can run.

## What's here
| Path | What |
|---|---|
| `index.html`, `app.js`, `styles.css` | 15-page dashboard: Today (daily brief + approvals), Market Intel (animated seesaw, gauge, UMBS line, yield-curve morph, story stepper, payment slider), **Home Report**, Pipeline (drag & drop), Refi Hunter, Ops, **Scenario Builder**, Programs & Rules, Lender Directory, **Calculators**, Agents, Workflows, Integrations, Build Prompts, Settings |
| `data.js` | Program rules (as of 2026-10-12), 61 lenders with niche tags, strategies, 18 agents, 38 workflows, sample market + Home Report data |
| `engine.js` | Calculators + loan recommendation / lender-matching engine |
| `prompts.js`, `docs/CLAUDE_BUILD_PROMPTS.md` | Claude Code build prompts — **P2 = MBS Highway Home Report workflow (HR1–HR7)**, P3–P5 = calculators |
| `supabase/001_calculators_and_home_report.sql` | `calc_buy_vs_rent`, `calc_debt_consolidation`, `calc_arm_vs_fixed`, `run_calc` (+ `calc_runs` w/ RLS), Home Report tables/views, `home_report_alert_level` |

## Added in this pass
- **5/1 ARMs**: five ARM programs (Conventional, FHA, VA, Jumbo, Non-QM/DSCR), scenario-builder triggers ("expect to sell/refi < 7 yrs", "lowest starting payment"), a 5/1 ARM vs Fixed calculator with caps and worst-case payment, and `calc_arm_vs_fixed` in Supabase.
- **Loan recommendation** from lender niches: ranked paths with fit scores, reasons, warnings, seller-credit limits, top matched lenders, strategy cards.
- **Home Report** signals on the Market Intel/Home Report pages and in the Morning/Midday/EOD brief.

## Live vs. simulated
Market numbers, Home Report signals, pipeline, approvals and refi queue are **sample data**; the ticker is a local simulation. In **Settings**, add your Supabase URL + anon key and n8n base URL to make Home Report *Sync*, the calculators' *Run in Supabase*, and workflow ▶ buttons call your real endpoints. The anon key must be RLS-protected (never paste a service key).

## Caveats
- Program rules come from the blueprint's research table; DSCR/Non-QM/Jumbo/HELOC/ARM ranges are lender-typical — verify against live investor overlays before quoting.
- USDA FY2027 fee is unconfirmed; FHFA 2027 limits not yet announced.
- The blueprint does not define the MBS Highway "Home Report" format; the signal schema here is an assumption — adjust `mbsh_signals.kind` to the real report once you see an export.
- Consumer-facing output always routes through Compliance/approval; nothing here sends anything.

## v10 — Loan intelligence expansion (2026-10-19)
- **AI Loan Coach** (`coach`): underwriter/processor/broker mentor grounded in 28 guideline sheets (`guidelines.js`, `guidelines2.js`), 32 VA tough-file strategies, 138 LOEs; uses the artifact `sample` capability, falls back to local retrieval.
- **Programs & Rules**: full guideline accordions for every loan type (conforming, affordable, high-balance, renovation, FHA/USDA/VA, HUD 184, jumbo, Non-QM, DSCR, foreign-national/ITIN, construction, manufactured, HELOC, reverse, DPA/CalVet, physician, commercial/SBA/ALF) + broker / non-delegated / delegated correspondent channels; 53 programs.
- **Scenario Library** (`scenarios.js`): 30 challenging cases, top-4 courses of action with reasoning; **Script Library** (`scripts.js`): 30 talk tracks; **62 qualifying strategies** (`strategies2.js`, VA concession/buydown/correspondent-credit structures).
- **Document Processor** (`docproc.js`): checklist by loan × borrower type, filename classification, readiness %, missing-docs email, income/asset calculators (W-2, LES, Schedule C, K-1, bank statements CSV, rental, deposits/reserves).
- **Loan Process Map** (`process.js`): 11 stages step by step with tools/agents/automations/SLAs; **LO Toolkit**: 20 hard tasks → tools/agents, Kaizen improvement loop, top-1% OS; **Delegation Map** (`delegation.js`): 41 tasks by owner, Steven's Layer-1 list.
- **Automation Center**: 24 routines (n8n cron + .ics export), 11 sequences / 60 touches (`sequences.js`) with enrollment; **Partner Targets**: best-leads playbooks + contact tracker with CSV import.
- **VA Toolkit**: tough-file strategist tab; BAH 335 stations; **Calculators**: +debt payoff, amortization/extra pay, refi break-even, affordability+residual, PMI removal, loan comparison.
- **ISA Portal** (`isa.js`): mirrored daily playbook, SOD/EOD, scorecard, KPIs, 18 VA checklists, SOP flows, team matrix, SoCal bases, Mello-Roos, business blueprint, tech stack.
- **Marketing Toolkit** (`marketing2.js`): channels, calendar, 15 templates, ad compliance checklist, tools. New agents #19–33; workflows SQ/BD1/BD2/VT1/GL1/DP1/DP2/PI1/LK1/TT1.

## v12 (2026-10-19)
- Strategies 107 (`strategies2.js`), scenarios 40, dispute letters 52, LOEs 170, guideline sheets 41 (`guidelines3.js`: VA/FHA/conventional refinance deep dives, investment & second homes, hard money/bridge, lot & land, NADL/184, 203(h) disaster, buydowns, state programs CA/NV/AZ/IL/FL, ITIN, church/nonprofit).
- Calculators 17 (+cash-to-close & seller-credit optimizer, points vs credit breakeven, HELOC vs cash-out blended rate, HECM principal limit, DSCR quick qualifier, VA entitlement).
- Loan Process Map deep dive (`process2.js`): every stage with why, what done looks like, sub-steps (how/why/forms/timing/mistake), hand-off; 55-term glossary; Word export.
- Ops Command page: Steven's daily checklist, setup gaps, lender scorecard, pricing/lock exception log, exports of all workflows/routines/sequences/agents (JSON) and an operations manual (Word). Quick links strip on Today.
- v15: VA Toolkit → Q&A (500) tab: 501 questions with in-depth answers and references (`vaqa.js`), searchable by category, Word export, hand-off to the Coach. Vanessa & Steve persona chats (own recorded voices only).
- v16: Programs & Rules → Q&A by loan type (217 Q&As: FHA, conventional, USDA, jumbo, Non-QM, DSCR, FN/ITIN, reverse, HELOC, construction, manufactured, DPA, refinance, partners, FTHB), program picker and side-by-side comparison (`loanqa.js`, `app11.js`). New Assistance & Grants page (`assist.js`, `app12.js`): eligibility finder, California deep-dive, 50-state DPA sheets, federal, utilities, nonprofits.
- v17: AUS Simulator (DU/LPA/TOTAL-GUS with FICO 10T / VantageScore 4.0 toggle), Underwriter Discretion & Advocacy memo builder, VA Mastery course (14 modules, 60+ lessons with cites) + surviving-spouse, restoration-path and reservist-points tools; VA Regional Loan Center 877-827-3702 on the VA page (`vacourse.js`, `app13.js`).
- v26: ARIVE Mastery page (`arive.js`, `app15.js`): 13-module step-by-step course with schematic screen visuals and your-own-screenshot slots, flow/timeline diagram, variations for 11 loan types, per-file submission checklist, glossary. Global search block (`app14.js`).
- v27: Offer Playbook (`offers.js`, `app16.js`); VA MPR Safe/Sound/Sanitary guide, Assumptions tab (rules, calculator, senior-care prospecting playbook, three seller paths), Timelines tab with 27 clocks, VA appraisal days by state and an escrow planner (`app17.js`).
- v28: Underwriter QC Auditor (`qc.js`, `app18.js`): 67 common + 69 program-specific checks across 10 loan types with severity, evidence and cites; auto-checks from dates/ratios (TRID, document age, DTI/residual/LTV/IPC); red-flag scan; weighted score; findings report.
- v30: VAREP MVLC course tab on the VA page (`mvlc.js`, `app19.js`): the full Military & Veteran Lending Certification Student Workbook (7 chapters, 120 sections, stats, 10 myths with facts, resources, COE codes/statuses, funding-fee table, residual tables, ranks, acronyms, proof-of-service documents) with an in-depth practitioner note on every section; calculators that reproduce the guide's answer key (entitlement/down payment, vet+non-vet and vet+vet joint loans, residual income with the 120% rule, funding fee, seasoning, ETS, LES age, 4% concession test); references (VA forms, systems, Handbook 26-7 chapter map, circular topics, government sites); letter templates (ROV, appraisal transfer, rapid restoration, Statement of Service, re-enlistment LOE, SOE, Tidewater package); checklists by borrower type; study progress; search and coach wiring.
- v31: VA Practice Exam (`exam.js`, `app20.js`): 86 MVLC questions with explanations that also say why the distractors are wrong, quick/full-timed/chapter/miss-drill modes, six randomized scenario simulators with worked steps, per-chapter rings and score history. Simulators page: deal simulator with live DTI/residual/approval gauges and fix-it levers, rate shock curve, pipeline funnel, capacity 80/20. Autopilot 80/20 command center: minute-weighted "runs without Steven" gauge, loan-flow strip by owner, Steven's queue (approvals, high tasks, ISA escalations) with approve/done/delegate-to-ISA, team queue, 12 toggleable handoff rules, morning autopilot run and a 100-event day simulation. Shared `viz.js` (gauges, rings, meters, funnels, flow strips, share bars, lines) injected into Today, AUS Simulator and the MVLC residual tool.
- v32: DPR directory tab on Assistance & Grants (`dpr.js`): all 441 Down Payment Resource programs from Steve's export with dropdown filters (type, status, provider type, lender-delivered, delivered-through, stackable, audience, keyword, minimum assistance), official-site links for the major channels plus official-site search for the rest, basis-code legend, program-type notes, CSV/copy export; indexed in coach and global search.
- v33: Partner Targets — "Defense employers (CA · relocation)" tab (`defense.js`): 203 California defense/aerospace employers and base contractor pools, San Diego first, with tier, sites, focus, approximate size, relocation/veteran signals, site + LinkedIn-role + careers links, the preferred-relocation-lender strategy (RMC gate, six contact roles, channels, KPIs), four outreach scripts and tracker handoff. "DSCR investors (50 states)" tab (`dscr.js`): 200 investor groups, REIAs, apartment associations, turnkey/PM operators, hard-money/1031/SDIRA partners, STR and military investor communities with why-DSCR-fits, how to get in and who to reach, the preferred-investment-lender playbook, pitch/objection track, four scripts, CSV/.docx export.
- v34: Homebuyer Class & Webinar Playbook (`classes.js`, `app21.js`, Growth & Ops): the Nellis AFB VA Loan Seminar master plan (population, why-Vegas-wins, BAH table with a BAH-vs-rent-vs-mortgage slide calculator and gauges, housing snapshot, Realtor-referral role and 10 vetting channels, venues, minute-by-minute agenda, marketing, referral strategy, follow-up, budget split, travel, execution checklist, itinerary, honesty flags, note to Charles, .docx); a new-class builder that turns any date into a T-60…T+30 countdown with budget share, launches and filled scripts; an annual cadence generator (quarterly in-person seminar + webinars rotating through the other licensed states, .ics export, company-license check per row); a licensing tracker for Steven and Patriot Pacific with 60-day renewal alerts; the template library (formats, channels, agenda, KPIs, compliance, scripts).
- v35: Military Base Installation Guide (VA page, `bases.js`): 152 installations — the 20 California installations checked 2026-10-04 with MHA codes, gates, housing offices, markets, sources and dates, plus a compiled worldwide index marked "not checked"; no BAH dollars stored (live DTMO link per row), filters, star/notes, plan-a-class handoff, CSV. ISA Daily Playbook page (`isapb.js`, `app22.js`): live Pacific-time shift header, theme days and hourly blocks, interactive Greatness tracker, Top-50 VIP filter and cadence list, daily scorecard with weekly baseline gauges, lead-triage snapshot + manual entry, start/end-of-day sequences, capacity audit, KPI scorecards, ISA grading, 90-day plan, editable tool directory. Practice Trackers page: Licenses & renewals (NMLS state licenses, DRE, CE, E&O, entity filings, 60/30/7-day alerts, base coverage by licensed state; replaces the class licensing tab) plus refi watch, partners, files, reviews, recruiting, webinars; alerts surface on Today.
- v36: Daily Rate Desk (`ratedesk.js`, `app23.js`, Operate, beside Market Intel): daily MBS Highway entry (typed or pasted Home Report text, best-effort parse) feeding a 10-driver weighted model (10-yr 25 · UMBS 20 · inflation 12 · jobs 12 · Fed 12 · growth 6 · stocks 5 · oil 3 · auctions 3 · geopolitics 2; auto-scored where numbers exist, editable weights) that outputs a −100…+100 pressure score, estimated par-rate pressure, lock/float lean, plain-language "why" and a borrower note; lock desk; history with 5/20-read averages and CSV; 33-entry plain-language guide to everything that moves rates (daily movers, slow-moving forces, loan-level adjustments); interactive rate builder; trading-day timeline and report calendar; client Q&A; tick/payment/points tools. Saving syncs Today, the Daily brief (which now reads live market values instead of the sample constants) and Market Intel.

## v37 — Calculators, 100 scenarios, Pabbly Workflow Hub, service & AE book
- +37 calculators (calc2.js) · scenarios SC41–SC100 (scenarios2.js)
- Lender AE contact book (empty/import-ready; no invented contacts — CSV/paste/vCard, official-site search links)
- Workflow Hub: 30 Pabbly Connect workflows (PB01–PB30), event bus → per-workflow webhook URL, dry-run, log, retry, local rules engine (R1–R9)
- Speed-to-Lead cockpit, Handoff Board (ISA/EA/AI/LO lanes), 5-Star Service center, quick-capture button
- Note: Pabbly sends are browser no-cors POSTs; use the downloaded HTML (artifact viewer may block outbound calls). Confirm delivery in Pabbly Task History.

## v38 — Operations Manual, VA Fees & Elite Strategies, Video Library, Process Improvement, GCI Planner
- Operations Manual: role × stage swimlane, 15 roles, 13 lifecycle stages, 16 loan types, 24 SOPs, 19 checkable checklists, ARIVE common path + per-loan-type setup
- VA Fees: allowable vs non-allowable, compliant structures (no relabeling), fee checker vs the 1% flat charge, 31 elite approval strategies
- Video Library: 44 topic searches, official sources, saved/embedded videos (no fabricated URLs)
- Process Improvement: log with hours saved, daily update tracker, weekly self-engineering loop + prompt, gap register
- GCI & Commission Planner: sides, split/cap/fees, loan comp bps, expenses, taxes, net goal solver, sensitivity/break-even

## v39 — 40 more scenarios, Compliance Clock, Pabbly Setup Guide
- Scenarios SC101–SC140 (scenarios3.js): lender-selection, overlay, credit-event, process and compliance situations (verify waiting periods/overlays before advising)
- Compliance Clock (app27.js): LE/CD/rescission/lock/contract date math with business-day rules and federal holidays; timeline graphic; push deadlines to the Handoff Board
- Pabbly Setup Guide: 7-step walkthrough with illustrations, 30 workflow blueprints with flow diagrams and field mapping, test lab, troubleshooting

## v40 — Integration Center, Loan Sync Board, Title & Property Desk, Reports & Lists
- Integration Center (conn.js, app28.js): Zoho CRM, ARIVE, Pabbly, MBS Highway, Pivo (unconfirmed), title, property — honest connection methods, field maps, milestone map, CSV importers with column mapping
- Loan Sync Board: imported ARIVE pipeline, aging, lock/closing alerts, one-click milestones that fire Pabbly workflows
- Title & Property Desk: title orders (checklist, aging and wire/binder warnings), property records, tickets → Handoff Board
- Reports & Lists: list reports over any dashboard data (CSV/print/copy), home report from a property record, market report archive + weekly agent update
- PB31–PB46: 16 new Pabbly workflows (Zoho, ARIVE milestones, title, tickets, weekly report)
- Nothing connects to a vendor automatically; see the page's "Honest status" note.

## v41 — My Tools launcher
- Sidebar group "My Tools": Rent/Buy/Wait, Veterans Benefits (Muster Point), VA Lead CRM, Personal Branding & Marketing, Social Media Growth (Signal Deck), 2nd Brain (Brain 6D) — each with Open ↗ and an embed page. Separate pages keep their own data.

## v42 — Equity/Refi/Reverse products, Referral Partner Playbooks, Annual Mortgage Review
- Equity, Refi & Reverse (equity.js): HELOC, HELOAN, VA IRRRL / cash-out / Type I / other VA refi, conventional & FHA refi, HECM, HECM for purchase; compare table, FAQ, VA refi tester, HELOC-vs-HELOAN-vs-cash-out, refi/IRRRL break-even, HECM illustration, LTV tiers
- Referral Partner Playbooks (refp.js): 8 partner types (realtors, CPAs, tax, wealth, family offices/private banks, estate attorneys, elder-law/senior, insurance), 90-day plan, templates, compliance, tracker, 200 organization targets in CA/IL/NV/FL/AZ (organizations only — no invented contacts)
- Annual Mortgage Review: client profile analyzer (ranked opportunities, health score, summary), SOP & checklist, templates, review log with due list; PB47–PB49 workflows

## v43 — 6 Growth Niches
- Page "6 Growth Niches" (Growth & Ops): Second Liens, Reverse, Your Database, Concessions→Buydowns, Investors/Non-QM, Add a State — playbooks, scripts, KPIs, compliance
- Where-to-find-contacts source lists for CA/IL/NV/FL/AZ (sources and search links, not named people) + CSV export
- Database mining (segments from imported ARIVE/Zoho loans and saved reviews), buydown calculator (price cut vs permanent vs 2-1), add-a-state scoring planner + licensing checklist, niche tracker; PB50 workflow

## v44 — Lender DTI Matrix
- Loan Intelligence → Lender DTI Matrix: 61 lenders × 6 programs, agency baselines shown as gray placeholders, lender cells blank until entered with source/date (stale flag at 90 days), DTI fit finder, paste/import, AE request email, CSV export, public overlay examples. Lender caps are overlays in broker-only matrices — not fetchable here.

## v45 — Market Intel Live (MBS Highway-style desk from public data)
- live.js: relay-fed data layer (Yahoo delayed quotes/OHLC, official Treasury par curve, FRED series), normalizer, candlestick renderer with support/resistance + 20-period MA, rule-based economic calendar (+ 2026 FOMC dates, paste importer), factors-by-loan-type table
- app33.js: Market Intel Live page (dashboard tiles, candles, curve, calendar with release scoring, factors, relay setup with Apps Script + Cloudflare Worker code, status log); wires live readings into the ticker, Market Intel page and Daily Rate Desk (auto-scores for fed/inflation/risk/growth); PB51–PB52 workflows
- Honest limits: browsers cannot read Treasury/FRED/Yahoo directly, so a user-deployed relay is required; UMBS/TBA coupon prices and Econoday are licensed (proxies: ZN=F, MBB; calendar is rule-based unless pasted); the artifact viewer blocks outside calls — use the downloaded HTML
- app23.js: rdAuto made reassignable so live auto-scores can extend it

## v46 — Guidelines Library & Free Data
- library.js / app34.js: official sources for 19 guides (Fannie Selling/Servicing, Freddie Guide, Ginnie MBS Guide, VA Pamphlet 26-7 + circulars + 38 CFR 36, HUD 4000.1 + Mortgagee Letters, USDA HB-1-3555, FHFA, CFPB regs, NMLS, HECM, Sec. 184, DPA), 43-topic finder with site-restricted searches per agency, dated excerpt notebook, update watch, free data-feed catalog (24 feeds; 8 in the relay)
- Relay code now also pulls free calendar sources (BLS ICS, TreasuryDirect upcoming auctions, optional FRED release dates) — untested from the sandbox
- Not included by design: full text of the guides (owned by their publishers, thousands of pages, change constantly)

## v47 — Complete-documents index + FRED key walkthrough
- Library: "All documents" tab (58 official guides, handbooks, matrices, MI insurer guidelines, regs and state licensing laws; each with Official / Find PDF / Search-site links, CSV export); every guide card gets "Find full PDF"
- Step-by-step free FRED API key walkthrough on Market Intel Live → Relay setup and Library → Free data feeds (key stored as an Apps Script property, never in the dashboard)

## v48 — My Tools: Real Estate Broker Dashboard
- Added "Real Estate Broker Dashboard" (Broker Command Center) to the My Tools launcher.

## v49 — AI Team Bridge · Broker Bridge · Brain 6D link
- **AI Team Bridge** (`aiteam.js`, `app35.js`): snapshot of the Command Deck org chart (143 seats: Steve, Vanessa and her reports, ISA/EA, 8 executives with teams, 4 mentors) mapped to this dashboard — every Pabbly workflow PB01–PB52 has a primary and backup owner seat, every seat has home pages and an output lane. Dispatch creates a Handoff Board card (fires `task.delegated`) and a ready-to-paste prompt with live dashboard context. Coverage tab flags unowned workflows. The org chart is a snapshot — re-extract when it changes.
- **Broker Bridge**: paste the Real Estate Broker Dashboard's Contacts CSV or `broker-cc-v1` JSON → buyer leads (speed-to-lead list + pipeline), escrow deadlines from RPA day counts (EMD, appraisal, loan contingency, CR, COE), open tasks, DRE/E&O alerts → Handoff Board. De-duplicated; re-paste any time. Not a live sync (separate artifact origins).
- **Brain 6D link**: dashboard-first search + `bin/brain recall` command builder, brain-ready Markdown export (AI-team map, workflow catalog, excerpts, board, decisions), decision/lesson capture.

## v50 — Send to VANESSA · deeper AI Team, Broker Bridge, Brain 6D · 70 new scripts
- **Broker Dashboard → Send to VANESSA**: new page in the Broker Command Center (System and Specialties nav, plus buttons on Escrow Tracker and Mortgage Desk) that copies or downloads one JSON for VANESSA's Broker Bridge. Commissions, splits, expenses, vendors and referral fees are not sent.
- **AI Team Bridge**: per-seat playbooks (daily, weekly, KPIs, never-do) for 36 seats with team inheritance; scripts each seat uses; 16 quick dispatch templates; daily operating rhythm; escalation ladder with "Raise now" cards; HALT list; workload by seat from the Handoff Board; prompt-pack export.
- **Broker Bridge**: detects Send-to-VANESSA payloads; Escrow watch (milestones, TRID CD-received-by date, lender-update and contingency-extension copy); import history with undo; bridge scripts tab.
- **Brain 6D**: 24 ask templates; script library, guideline sources, operating rules and bridge log as brain sources; weekly digest; brain hygiene (freshness by source + Friday routine).
- **Script library**: P31–P100 (`talk2.js`) — Realtor bridge, escrow deadlines, ISA desk, equity, reverse, refi, niches, referral partners, military, AI team, past clients.

## v55 — Loan Niche Encyclopedia (98 niches) · 300 new scenarios (440 total)
- **Loan Niche Encyclopedia** (`nichelib1-3.js`, `app36.js`, Loan Intelligence → after Programs): 98 niches in 11 groups (Government, Conventional & agency, Jumbo & portfolio, Non-QM, Investor & private, Equity & second liens, Reverse, Construction & renovation, Specialty property, Specialty borrower, Commercial & business). Each: what it is, who it's for, key rules, underwriting, docs, pros/cons, pitfalls, where to find clients, partners, pitch, compliance, CA/IL/NV/FL/AZ notes; lender matches from the directory; related scenarios/scripts; campaign card; Word export.
- **Scenarios SC141–SC440** (`scenarios4-8.js`): 300 new, each with 4 ranked COAs (why, steps, risk), avoid, docs. New categories: USDA, Military, Equity, Realtor bridge, State-specific, Life events, Growth, Operations.

## v56 — Lender Profiles & Matrices (61 lenders, public research 2026-10-22)
- `lenderinfo1-6.js` + `app37.js` (Loan Intelligence → Lender Profiles & Matrices): channel, broker site, NMLS, niches, 244 programs (147 with published max LTV / min FICO / max DTI / loan limits, each with its source URL), CA/IL/NV/FL/AZ coverage, highlights, cautions, status. Deal finder (state, program, FICO, LTV), AE verification email, AE-confirmed notes per lender.
- Directory corrections in `data.js`: Eleven Mortgage exited wholesale (9/25/2026), TPO Go exited wholesale (8/10/2026), Liberty Reverse parent exiting reverse — all three tagged "exited" so the matcher no longer suggests them; NextRes is not NewRez; Provident Bank vs Provident Funding name collision; REMN = Homebridge division; Commercial Capital Bidco unverified.
- v57: second research pass — 294 programs, 243 with published LTV/FICO/DTI/limits (sources on each), 44 NMLS IDs, new cautions (Kiavi → Figure 9/1/2026, EPM closed Vetted VA TPO, Plaza data breach 2026, NewRez exited retail, Acra parent acquired by BlackRock). Broker Bridge loan contingency default 17 days.

### v58 publish note — PPFC Trainual block
Another session added the PPFC Trainual knowledge base (`PPFC_KB`, `PPFC_LENDERS`, the `ppfc` page and its panels) straight into the published artifact. It holds internal company SOPs and AE contacts, so it is **not** kept in this repo. To publish a new build: read the live artifact, copy the block that starts at `/* ===== PPFC TRAINUAL KNOWLEDGE BASE` and ends just before `boot();`, and paste it into `dist/vanessa-dashboard.html` right before `boot();`.

### v70 — Lender Compare & Recommend (app39.js)
Loan Intelligence → Lender Compare & Recommend: deal recommender (loan type, state, FICO, LTV, loan amount, DTI, priority weighting), sortable/filterable table of every lender with comp, limits, licensing and CSV export, best-lender-by-loan-type matrix for 31 loan types, side-by-side compare of up to 4, and a personal speed/service/favorite/avoid scorecard that feeds the ranking.
Other sessions also publish directly to the live artifact (PPFC Trainual block, ARIVE Mastery 2.0, 147-seat AI team). Always merge onto the current live version before publishing; do not publish a plain repo build over it.

### v73 — Push-Button Autopilot (app40.js)
Operate → ⚡ Push-Button Autopilot. Seven one-click playbooks (Morning Launch, Lender-Mail Triage, Deal → Lender Shop, AE Matrix Sweep, Partner Touch, Find Borrower Docs, End-of-Day Wrap), an "Ask VANESSA to do it" agent (in-page Claude with page tools: knowledge search, lender ranking, board tasks, Gmail search/drafts, calendar, Drive), connection status, automation log, full-data backup/restore and the gap analysis. The published artifact declares capabilities `sample`, `downloads` and `mcp` (Gmail: search_threads, create_draft · Google Calendar: list_events, create_event · Google Drive: search_files · Notion: notion-create-pages). All writes are drafts or need a click.

### v74 — AI Squads (app41.js)
AI Team & Bridges → AI Squads: 10 cross-functional squads (Deal Desk, Speed-to-Lead, Close & Fund, Purchase Transaction, Refi Strike, Growth Engine, Lender Intelligence, Revenue & Finance, Automation & Reliability, Morning Ops), 49 parallel lanes. Launch puts every lane on the Handoff Board at once plus a fan-in card and a compliance-gate card; "Draft all lanes with Claude" runs each lane concurrently with in-page Claude and then merges. Also a Push-Button playbook and event → squad routing. Mods for Claude Code live in ../mods (vanessa-hq with /squad for real parallel subagents, drafts-only-guard, public-repo-guard).

### v76 — Zoho CRM Live (app42.js)
The Zoho CRM page now runs live through the viewer's Composio connector (`Composio` → `COMPOSIO_MULTI_EXECUTE_TOOL` with ZOHO_* actions on account alias `crm`): pipeline by stage, newest leads (Speed-to-Lead squad, first-touch Gmail draft, notes to Zoho), open tasks, CRM search, create lead with duplicate check, deals closing ≤30 days to the board. Ask VANESSA gained zoho_search / zoho_pipeline / zoho_new_leads; Morning Launch adds a Zoho section. Zoho returned NO_PERMISSION on the old Composio connection (no CRM scopes) — reconnect with CRM access.

### v78 — Integration Hub (app43.js)
Operate → 🔌 Integration Hub (also System → Integration Hub): catalog of 13 live integrations with a test button; Research Desk (Perplexity via Composio, sourced, save to Docs/board); Sheets & Docs exports (lender comparison, board, scenarios, Zoho pipeline, automation log → new Google Sheet; briefs/research → Google Doc); Google Tasks sync of board cards; Book a Consult (Zoom + Calendar hold + Gmail invite draft + board card); Property intel (Google Maps places near an address + fair-housing-safe listing paragraph); Vanessa's inbox (Inkbox identity: channels, conversations, calls, contacts, notes, briefs emailed to Steven only). Four new playbooks, four new agent tools (research_web, places_near, save_google_doc, add_google_task), six new AI seats and two new squads (Market Research Cell, Client Experience Pod). Artifact capabilities now also declare Inkbox.

### v79 — Runbooks & AI Workforce (app44.js)
Operate → 📘 Runbooks & Workforce: 16 runbooks (every playbook, the two scheduled tasks, squads, Zoho, Inkbox, Property intel) with trigger, inputs, steps (checklist), outputs, connectors, owner/backup seat, squad, KPIs, guardrails and failure → fix; Word export. RACI matrix (owner/backup per runbook, Steven accountable, Alexandra/Diane gate). AI Workforce directory of every seat with type, squads, runbooks, CSV export. Ops metrics from the automation log and board (runs/day, success rate, per playbook, open/overdue by owner, squad launches) with CSV export.

### v81 — Pricing & correspondent, Brand Visibility, Global Investor Desk, LPT broker info (app45.js + lptinfo.js, fiassoc.js, correspfi.js)
- Loan Intelligence → Pricing & Channel Economics: channel calculator (broker LPC vs mini-correspondent vs non-delegated vs delegated: revenue, cost, LO comp, net/loan, net/month, break-even; CSV), rate-sheet pricing (base ± LLPAs ± lock, LPC vs BPC), correspondent guide (models, requirements, economics, path, investors, warehouse lenders, resources — correspfi.js, sourced).
- Growth & Ops → Brand Visibility (AIO/AEO/SEO): brand profile → JSON-LD and llms.txt generators, AI-written GBP description/bios/FAQ/12-week calendar, 20-question AEO bank with Perplexity AI-visibility checks and a log, citations/listings checklist, technical SEO checklist, advertising compliance (NMLS, DRE §10140.6, Reg Z trigger terms, Fair Housing).
- Loan Intelligence → Global Investor Desk: 9-step playbook, community guides (Chinese/Taiwanese/HK, European, Middle Eastern), in-language intro + invite drafts, foreign-national lender matches, association library (159 organizations in CA/IL/NV/FL/AZ — fiassoc.js, public sources), compliance (FinCEN RRE rule status, Florida SB 264, CFIUS, OFAC, FIRPTA, AML, fair lending).
- C.A.R. Forms → LPT Broker Info: LPT Realty CA entity/DRE #/designated officer and IL/NV/FL/AZ records (lptinfo.js — confirm with LPT; note the 02249735 footer conflict), my license fields, compliant signature.
- New squad Global Investor Desk; new seats Brand Visibility Agent, Channel Economist, Global Investor Liaison; three new runbooks.

### v82 (built, publishes after the daily limit resets) — automation wiring (app46.js)
Push-Button playbooks "Global Investor Week" (2 orgs/state not touched in 60 days, Perplexity event research, in-language outreach drafts, outreach log, board cards) and "Brand Visibility Check" (5 AEO questions through Perplexity in parallel, mention log, Claude content plan for gaps → board). Agent tools find_associations, log_outreach, channel_economics, ai_visibility_check (19 tools). Mod commands /global-week and /brand-check.

### v84 — Consult Desk (app47.js)
Operate → 🗓 Consult Desk (TidyCal, read-only): booking links, open slots formatted as a text message, upcoming consults with prep packs (Gmail history + Zoho + Drive + Claude brief: summary, scenario, questions, docs, lender ideas, red flags, next step, follow-up draft), past consults with a follow-up check. Playbooks: Consult Prep (next 48 h, parallel), Follow-up Sweep (Gmail drafts), Board Sweep (overdue/stale cards → nudge/reassign/reschedule/close, applied on approval). Agent tools tidycal_upcoming/tidycal_open_slots/tidycal_links (22 total). Seats Consult Prep Agent and Board Steward; runbooks Consult Prep & Follow-up, Board Sweep; /consult-prep mod command. Artifact capabilities add TidyCal (list-bookings, list-booking-types, list-booking-type-available-times). Note: another session added DBA program seats/links directly to the live page; always merge onto live.

### v86 — 7-Star Client Journey, Service Excellence, Process Improvement & Scale (app48.js)
Operate → ⭐ 7-Star Client Journey: every client tracked Lead → Consult → Application → Processing → Underwriting → Clear to close → Funded → Past client with a 30-touch journey (11 wow moments) per stage; Journey Engine drafts every due touch in one Claude pass (Gmail drafts, texts, gift cards on the board, mark done); Friday Status Updates for every active file; imports from Zoho deals and TidyCal; personal details (channel, language, birthday, family, favorites, realtor, military, gift) drive personalization. Service Excellence: SLA standards, on-time %, CSAT log, survey draft, review tracking, 6-step service recovery with Claude plan + apology draft that also adds a Kaizen item. Process Improvement & Scale: bottlenecks by owner/lane, capacity planner (utilization, max loans/month, biggest lever), automation ROI from the run log, Kaizen log (impact × (6 − effort)) with Claude suggestions. Playbooks Journey Engine + Friday Status Updates (19); agent tools journey_clients/journey_add_client/journey_move/touches_due (26); seats Journey Conductor, Service Recovery Lead, Process Improvement Analyst; runbooks 7-Star Client Journey, Service Recovery, Weekly Kaizen & Capacity Review (24).

## v88 (published as artifact version 90) — 2026-10-26
- **Document Screener** (app50): upload PDF / .docx / scans / text / email. The instant in-browser layer finds:
  - every date and time period (turned into calendar dates from an anchor date, business days skip federal holidays)
  - amounts, parties and blanks
  - 67 risk rules in 11 categories
  - hidden or altered content: Word hidden, white and micro text, tracked changes, comments, macros, external links; PDF JavaScript, embedded files, multiple saves, editing-tool producers, micro and off-page text; zero-width, bidi and look-alike characters; changed wire instructions

  Claude deep screen (chunked, scans sent as images, SSN/account masking): verdict, risk score, summaries, timeline with consequences, clauses, obligations, negotiation points. Also Ask-the-document, a two-document compare (LE vs CD / TRID), a highlighted reader, a Word report, .ics deadlines, CSV, Board cards, a Gmail draft and history.
- **Loan Lifecycle Command** (app51): 12-stage coverage map plus these tools:
  - Rate Lock Desk
  - TRID timing and tolerance cure
  - QM / HPML / HOEPA tests
  - Conditions Manager
  - Appraisal & ROV
  - Licensing, CE and compliance registers (GLBA Safeguards, retention)
  - Post-close and retention
- **GoHighLevel Live** (Composio `HIGHLEVEL_MCP_*`, alias "ghl"): pipelines, opportunities, contacts, unread conversations, AI reply drafts, confirmed send.
- **Headline News**: weekly Perplexity headlines on 8 beats, brief, and a Gmail draft.
- **VA Mastery** (app49) now in the build (vamaster1-3).
- **DV Property Tax Desk** (app52): California SB 296 (R&T 205.5.1, 2027-2031) vs the 205.5 calculator, with a 6-year projection and an in-depth explainer; 50-state + DC table with estimates (dvtax1/2).
- Build now auto-includes every appN.js and ends with boot.js.

## v89 (published as artifact version 91) — 2026-10-26
- **AI Coverage Command** (app53):
  - **Coverage grid:** 82 processes across 17 stages (lead gen → platform ops, VANESSA + Command Deck). Each has an AI owner, backup, trigger, automation, human gate and live pages. Coverage is computed live from PAGES / AI_SEATS / RB / AI_SQUADS (100% on the live page).
  - **18 gap seats:**
    - Income & Asset Analyst, Disclosure Desk Agent, Submission Packager
    - Insurance & Escrow Analyst, Condo & HOA Project Reviewer
    - Lender Onboarding & Scorecard Agent
    - Licensing & CE Registrar, Complaint & Fair Lending Officer, Regulatory Reporting Clerk, GLBA Safeguards Officer
    - DPA Navigator, Non-QM Specialist, Reverse & Equity Specialist, Renovation & Construction Coordinator, Hardship Navigator
    - Mortgage Academy Coach, Live Sync Monitor, Coverage Auditor
  - **Runbooks, squads and lanes:** 23 runbooks; 2 squads (Compliance & Risk Cell, Specialty Loans Desk); 8 lanes added to existing squads.
  - **Coverage Sweep** playbook: gaps and stale work (locks, conditions, trailing docs, licenses, complaints, overdue cards, down connectors) → owned Board cards.
  - **Live Sync & Health:** read-only check of 9 connectors plus data freshness, with an optional daily auto-run.
  - **Agent tools:** process_owner, coverage_gaps, sync_health.
