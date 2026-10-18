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
| **VA Toolkit** | Funding-fee calculator (2026 tiers + exemptions), entitlement/down-payment calculator (full vs partial), residual-income calculator (Pamphlet 26-7 tables, 120% rule), IRRRL eligibility tester (seasoning, NTB, recoupment), COE quick check, Nellis BAH-vs-mortgage, allowable/non-allowable fees, MPR checklist, document checklists, purchase timeline |
| **Qualifying Strategies** | 32 strategies with 14 structured dimensions, side-by-side comparison of up to 4, and a worked comparison (price cut vs points vs 2-1 buydown vs closing-cost credit) on one deal |
| **Credit Simulator** | Heuristic score model; per-tradeline actions (pay to 30/10/0%, close, limit increase, AU removal, inaccurate-late removal, collection pay / pay-for-delete / delete / settle); score range, tier crossings, cash needed, points-per-dollar ranking, budget auto-planner |
| **Letter Desk** | 36 dispute/validation/goodwill letters (bureau, furnisher, collector, SCRA) and 83 letters of explanation (28 military/veteran scenarios) in a grouped dropdown; merge fields; plug-and-play tailoring (click-to-insert field tokens, snippet library, per-template edits with reset); download as `.docx` or `.pdf`, all-3-bureau `.zip`, or the entire library `.zip` (Word + PDF) — no dependencies (`pdf.js` is a tiny Times-Roman PDF writer) |
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
