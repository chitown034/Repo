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
