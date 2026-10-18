# VANESSA 3.0 — Command Dashboard

Interactive prototype of the Realtor + Mortgage + Credit OS from the VANESSA 3.0 blueprint. Static site, no build step.

```bash
cd vanessa && python3 -m http.server 8765   # open http://localhost:8765
node scripts/check-calcs.js                 # 24 golden checks: JS calculators == Supabase SQL
```

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
