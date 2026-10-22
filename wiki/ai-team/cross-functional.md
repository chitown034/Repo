# Cross-functional dispatch — who joins whom, and when to stop

`bin/brain route "<request>"` reads this page and the lane table in `wiki/ai-team/index.md` and prints a
dispatch plan: the lead seat, the seats that join it, the parallel waves (≤8 per wave, ≤4 web-research
seats per wave), the gates that run last, and any HALT the request trips. Plain code, no model call.
Edit the tables below to change how the team works together; the planner follows them on the next run.

## Lane keywords — which seat owns a request

Words in the request pull in the seat. The seat with the most matching words leads (ties: the row higher up).
"Starts from" is the part of the brain that seat reads first; the planner picks the best section inside it.

| Seat | Words that pull this seat in | Starts from |
|---|---|---|
| Marcus | net worth, income, budget, liabilities, expense, cash, close, tax, profit, money, finance, revenue forecast, plaid, balance | `projects/` |
| Sofia | marketing, campaign, content, social, post, email blast, newsletter, video, avatar, brand, ad, seo, instagram, facebook, linkedin, youtube | `wiki/real-estate-playbooks/` |
| Derek | automation, connector, integration, routine, task, broken, stack, api, mcp, dashboard, deck, sync, runner, failover, mac, script, browser, website, playwright, agent-browser, portal, anydesk, orca, remote control, alienware, tailscale, bonsai, laya | `wiki/dashboard-ops/` |
| Alexandra | compliance, trid, respa, reg z, disclosure, fair housing, dre, nmls, license, advertising rule, anti-steering, le, cd | `wiki/mortgage-programs/` |
| Nadia | ai strategy, tool, tooling, evaluate, adopt, disruption, new model, agent design, hype, scout, new repo, skill, mcp server, plugin, find a skill | `docs/CAIO-DISRUPTION-BRIEF.md` |
| Victor | pipeline, conversion, lead, leads, speed to lead, crm, lofty, zoho, funnel, referral, revenue, six levers, isa, networking, networking event, chamber | `wiki/real-estate-playbooks/` |
| Elena | security, credential, password, key, token, access, breach, privacy, pii, data risk, backup, reverse engineer, reverse engineering, pairing link | `docs/` |
| Elon | feasibility, architecture, build, engineer, prototype, integration cost, refactor, brain, second brain | `brain/README.md` |
| Harrison | loan, mortgage, va, fha, usda, irrrl, jumbo, non-qm, conventional, rate, refinance, pre-approval, dti, ltv, assessor, apn, property tax, piti, amortization, payment scenario, loan scenario, tax sheet | `wiki/mortgage-programs/` |
| Gwen | buyer, showing, tour, offer, house hunt | `wiki/real-estate-playbooks/` |
| Marguerite | listing, seller, list price, cma, staging | `wiki/real-estate-playbooks/` |
| Maxwell | coaching, coach, weekly review, accountability | `wiki/ai-team/mentors-and-benches.md` |
| Kevin | personal development, habit, 11-dimension, discipline, mindset, singles event, speed dating, social event | `wiki/ai-team/mentors-and-benches.md` |
| James | family office, estate, trust, wealth plan, legacy | `wiki/ai-team/mentors-and-benches.md` |
| Apex | trade, futures, nq, es, order flow, liquidity, backtest, paper trade, trading research, research desk, strategy idea | `wiki/ai-team/mentors-and-benches.md` |

## Pods — standing cross-functional teams that work in parallel

A pod is a team that always works together (Steven, 2026-10-22: "ensure AI agents work cross-functional as teams
and in parallel"). When the request matches a pod's words, every seat in the pod joins the plan and runs in the
same wave (≤8 a wave), then the gates below run in order. A request can wake more than one pod; seats are not
duplicated. Vanessa's daily cycle forms its squads from these pods.

| Pod | Words that wake it | Seats (run in parallel) | What it delivers |
|---|---|---|---|
| Deal Pod | escrow, contingency, under contract, closing, transaction, deal, tc, appraisal, inspection, coe | Victor, Carmen, Showing Coordinator, Harrison, Alexandra | Timeline, due-in-7 list, document checklist, reminder drafts, loan-side milestones |
| Lead Pod | lead, leads, speed to lead, follow up, follow-up, nurture, sphere, past client, open house, referral | Victor, Gwen, Sofia, Alexandra | Call list for the ISA, follow-up drafts, nurture touches, compliance line on each |
| Listing Pod | listing, seller, list price, cma, staging, listing launch, open house | Marguerite, Sofia, Bianca, Alexandra | CMA prep, launch checklist, MLS remarks and marketing drafts, seller weekly report |
| Mortgage Pod | loan, mortgage, va, fha, irrrl, refinance, pre-approval, dti, ltv, conditions, underwriting, trid, le, cd | Harrison, Denise, Howard, Walter, Lucia, Alexandra | Scenario prep, conditions list, TRID clock, program fit — never a quote or an eligibility call |
| Growth Pod | marketing, campaign, content, brand, social, seo, video, newsletter | Sofia, Victor, Marcus, Alexandra | Content week, campaign drafts, cost and revenue read, compliance |
| Money Pod | budget, cash, net worth, tax, commission, expense, income, profit | Marcus, Nathan, Anita, James | Numbers with sources, deadlines, cash and commission view |
| Ops Pod | automation, routine, connector, sync, broken, dashboard, mac, runner, integration, workflow, pabbly, mod | Derek, Elena, Elon, Nadia | Fix plan, security check, feasibility, the one paste for Steven |

## Joins — a seat that must come along

When the request matches the words, the seat joins the plan even if it is not the lead.

| When the request touches | Also bring in | Why |
|---|---|---|
| client, borrower, buyer, seller, post, ad, email, marketing, disclosure, rate, video | Alexandra | Anything client-facing or advertised passes compliance before it leaves |
| website, browser, browse, log in, login, portal, fill the form, scrape | Elena | Browsing as Steven can reach logged-in accounts and client data; the CISO sets what it may touch |
| credential, key, token, api, connector, integration, access, pii, client data | Elena | Credentials and client data are the CISO's gate |
| automation, connector, integration, routine, script, dashboard, deck, mcp | Derek | The CTO owns whether it runs and stays green |
| tool, adopt, new model, ai strategy | Elon | Every Nadia proposal gets Elon's feasibility check |
| reverse engineer, reverse engineering, decompile | Alexandra | Terms of service and licence limits decide whether it is allowed at all |
| lead, pipeline, crm, referral | Victor | Revenue impact is measured by the CRO |
| cost, spend, budget, subscription, price, paid, pay, upgrade, purchase | Marcus | Anything that spends money is costed by the CFO |
| loan, mortgage, va, fha, rate, refinance | Harrison | Loan mechanics are prepared by the senior mortgage seat |
| buyer, listing, showing, offer, escrow | Carmen | The transaction coordinator owns the file timeline |

## Gates — run after the wave, never in parallel with it

| Gate | Runs when | What it does |
|---|---|---|
| Alexandra | Alexandra is in the plan | Compliance review of the drafted output; Steven decides |
| ECC | Derek or Elon is in the plan | Standards, tests, security and agent-safety review of any change |
| Validation | Derek or Elon is in the plan (any code change) | The code-validator agent: `scripts/validate-code.sh` then the VibeBreaker 20-pass adversarial review of the diff; code is not done until both pass (`.claude/skills/code-validation-gate`) |
| Vanessa | always | Consolidates every seat into one answer for Steven |

## HALT words — stop and write a Needs-Steven packet

Mirrors the HALT list in `CLAUDE.md`. The planner still prints the plan, marked HALT, so the prep work can
run while the licensed or irreversible step waits for Steven.

| When the request says | HALT because |
|---|---|
| send, email the client, text the client, post it, publish, schedule the post, submit the form, place the order, book it | A send to a client or a public post needs Steven's yes |
| quote, rate quote, lock, eligibility, approve the loan, pre-approve, sign, signature, negotiate | A licensed decision is Steven's |
| pay, buy, purchase, subscribe, upgrade plan, spend | Spending money needs Steven's yes |
| delete, wipe, drop, reset, force push | Irreversible |
| api key, password, token, credential, permission, grant access | Credentials and account changes are Steven's |
| legal, lawsuit, is it legal, compliant, violation | A legal or compliance call is Steven's (Alexandra drafts) |
| rsvp, register for the event, buy tickets, place a live order, live trading | Registering, paying or any live order is Steven's yes (the trading desk is paper only) |
| crm write, update the crm, calendar invite | Writing to a client-facing system needs Steven's yes |

## See also

- `wiki/ai-team/index.md` — the lane table this page extends.
- `wiki/ai-team/org-chart.md` — the full seat map.
- `wiki/ai-team/model-tiering-dispatch.md` — the ≤8 / ≤4 dispatch limits and model per seat.

Written 2026-10-09. Routing self-test: `brain/bench/routes.json`, checked by `bin/brain loop`.
