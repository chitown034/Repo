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
| Sofia | marketing, campaign, content, social, post, email blast, newsletter, video, avatar, brand, ad, seo, instagram, facebook, linkedin, youtube, aeo, geo, aio, llm visibility, ai answers, chatgpt, perplexity, gemini, grok, copilot, llms.txt, schema, json-ld, knowledge panel, entity, google business profile, gbp, citation, directory, nap, backlink, press, podcast, pitch, tiktok, threads, reddit, nextdoor | `projects/aeo-presence.md` |
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
| Refi Watch Analyst | refi watch, note rate, rate watch, refi list, refi candidate, rate drop, market average | `wiki/ai-team/desk-seats.md` |
| Sphere Nurture Coordinator | sphere, nurture, past client, birthday, anniversary, home anniversary, touch plan, check-in | `wiki/ai-team/desk-seats.md` |
| Voicemail & Inbox Triage | voicemail, inbox, triage, whisperai, gmail, missed call, unread | `wiki/ai-team/desk-seats.md` |
| Document Intake Clerk | document intake, intake, contract dates, disclosure dates, missing date, key dates, tcdeals, date entry | `wiki/ai-team/desk-seats.md` |
| Open House Captain | open house, sign-in sheet, sign-in, visitor, thank-you, thank you note | `wiki/ai-team/desk-seats.md` |
| Travel Desk | travel, trip, flight, hotel, points vs cash, points, miles, price watch, gondola, itinerary | `wiki/ai-team/desk-seats.md` |
| Meeting Scribe | meeting recap, recap, meeting notes, action items, fieldy, zoom, meeting minutes, debrief | `wiki/ai-team/desk-seats.md` |
| Maya | market data, median price, zip code, neighborhood, school, schools, days on market, months of supply, inventory, comps, city stats, redfin, caaspp, community ranking | `wiki/real-estate-playbooks/` |
| Rosa | pcs, military, base, bah, relocation, orders, scra, camp pendleton, miramar, coronado, march arb, deployment, rent buy or wait, rent vs buy, duty radius, bah affordability, breakeven, military objection, military & relocation pod | `wiki/real-estate-playbooks/military-relocation.md` |
| Quincy | lofty, pabbly, integration, connector, crm sync, import leads, export leads, webhook, zoho lofty, smart plan | `integrations/CONNECTIONS.md` |
| Owen | autopilot, sweep, auto task, follow-up task, dedupe, daily automation, launchpad, mission, push button, run everything, monday kickoff, friday wrap, automation & ai pod | `docs/AUTOMATION-MAP-2026-10-20.md` |
| Beatrice | dre, broker supervision, trust account, file review, license renewal, e&o, record retention, broker compliance | `wiki/mortgage-programs/disclosure-timing.md` |
| Paula | probate, trust sale, iaea, court confirmation, overbid, short sale, foreclosure, executor, estate sale | `wiki/real-estate-playbooks/` |
| Riley | alliance, cpa, attorney, financial planner, partner, lunch and learn, professional network, co-marketing | `wiki/real-estate-playbooks/referral-reciprocity.md` |
| Ingrid | training, academy, role-play, roleplay, quiz, drill, script practice, lesson, onboarding agent | `wiki/ai-team/mentors-and-benches.md` |
| Steve | draft, drafts, inbox triage, follow-up draft, digital twin, tomorrow prep, meeting brief | `projects/ai-team.md` |
| Winston | car forms, c.a.r. forms, rpa, contingency removal, nbp, request for repair, transaction qa, file audit, form library, tds, spq, avid, forms tutor, clause by clause, forms matrix, form pdf, zipform, which forms, forms hub, skyslope, skyslope forms, when needed matrix, when-needed, required forms, forms checklist, deal type forms, 548 forms | `wiki/real-estate-playbooks/transaction-stages.md` |
| Sterling | 5-star, five star, client experience, service standard, ritz, delight, client preferences, nps, after-care, concierge service, value add, client experience pod | `wiki/real-estate-playbooks/buyer-process.md` |
| Juliet | escalation, service recovery, blown closing, denied loan, failed appraisal, angry client, honors, unhappy client, complaint | `wiki/real-estate-playbooks/transaction-stages.md` |
| Imani | pcs, military family, base, bah, relocation briefing | `wiki/real-estate-playbooks/military-relocation.md` |
| Logan | lpt, lpt realty, hybridshare, revenue share, downline, recruiting, recruit, business builder, brokerage partner, cap, stock award, sponsor, lpt growth pod | `wiki/real-estate-playbooks/referral-reciprocity.md` |
| Wren | referral ledger, reciprocal referral, referral fee, partner tier | `wiki/real-estate-playbooks/referral-reciprocity.md` |
| Bianca | absorption, months of inventory, price per sqft, list-to-sale, market report, pricing authority | `wiki/real-estate-playbooks/listing-process.md` |
| Lucia | eligibility, guideline, va m26-7, fha 4000.1, usda, program fit | `wiki/mortgage-programs/program-selection.md` |
| Priya | instant response, new lead, speed-to-lead call, appointment setting | `wiki/real-estate-playbooks/buyer-process.md` |
| Vera | sphere, soi, past client, review request, home anniversary, post-close, preference profile, closing gift, lifetime cadence | `wiki/real-estate-playbooks/referral-reciprocity.md` |
| Rafael | workflow studio, workflow, automation flow, lifecycle automation, trigger, automation coverage | `wiki/dashboard-ops/index.md` |
| Celeste | coach hq, coaching, training plan, skills assessment, recommendation, role-play gym, weekly 1:1, coach, skills plan, knowledge & coaching pod | `wiki/ai-team/mentors-and-benches.md` |
| Lenora | q&a, question and answer, glossary, reference library, roles and responsibilities, raci, broker's guide, law library, who does what, guidebook, office policy manual, property management guide, employment law, short sale guide, foreclosure guide, lead paint, environmental hazards, earthquake safety, new broker start-up, team building | `wiki/index.md` |
| Showing Coordinator | showingtime, showami, showing, tour, schedule a showing, showing assistant, lockbox, showing feedback, route, route planner, drive time, showing route, optimize route | `wiki/real-estate-playbooks/showing-operations.md` |
| Halle | new construction, builder, new build, builder incentive, model home | `wiki/real-estate-playbooks/buyer-process.md` |
| Lorenzo | investor, income property, 1031, cash flow, fourplex, duplex, adu, cap rate, investor & special sales pod | `wiki/real-estate-playbooks/buyer-process.md` |
| Tariq | social media, instagram, tiktok, facebook post, reel | `wiki/real-estate-playbooks/listing-process.md` |
| Delia | reviews, google review, testimonial, reputation, net promoter, scorecard | `wiki/real-estate-playbooks/referral-reciprocity.md` |
| Ansel | predictive seller, likely seller, probate lead, expired, seller intelligence | `wiki/real-estate-playbooks/listing-process.md` |
| Tax Assessor Agent | assessor, property tax, apn, tax bill, supplemental tax | `wiki/real-estate-playbooks/transaction-stages.md` |
| Carmen | transaction coordinator, tc, escrow timeline, contingency dates, file timeline, escrow checklist, coe date | `wiki/real-estate-playbooks/transaction-stages.md` |
| Booking Concierge | tidycal, booking, booked consult, consult, discovery call, appointment, no-show, reschedule, show rate, booking link | `wiki/ai-team/desk-seats.md` |
| Autopilot Conductor | autopilot panel, run autopilot, autopilot conductor, scheduled sweep, overnight run | `wiki/dashboard-ops/index.md` |
| Lender Matchmaker | lender match, lender fit, which lender, wholesale lender, lender pricing, loan scenario match | `wiki/mortgage-programs/program-selection.md` |
| Inbox Sentinel | inbox watch, inbox sentinel, email watch, important email, reply needed, inbox alert | `wiki/ai-team/desk-seats.md` |

## Pods — standing cross-functional teams that work in parallel

A pod is a team that always works together (Steven, 2026-10-22: "ensure AI agents work cross-functional as teams
and in parallel"). When the request matches a pod's words, every seat in the pod joins the plan and runs in the
same wave (≤8 a wave), then the gates below run in order. A request can wake more than one pod; seats are not
duplicated. Vanessa's daily cycle forms its squads from these pods.

| Pod | Words that wake it | Seats (run in parallel) | What it delivers |
|---|---|---|---|
| Deal Pod | escrow, contingency, under contract, closing, transaction, deal, tc, appraisal, inspection, coe | Victor, Carmen, Showing Coordinator, Harrison, Document Intake Clerk, Alexandra | Timeline, due-in-7 list, document checklist, contract and disclosure dates into `tcDeals` with missing-date flags, reminder drafts, loan-side milestones |
| Lead Pod | lead, leads, speed to lead, follow up, follow-up, nurture, sphere, past client, open house, referral | Victor, Gwen, Sofia, Voicemail & Inbox Triage, Alexandra | Call list for the ISA, voicemail and inbox triage into `vanessaQueue`, follow-up drafts, nurture touches, compliance line on each |
| Listing Pod | listing, seller, list price, cma, staging, listing launch, open house | Marguerite, Sofia, Bianca, Alexandra | CMA prep, launch checklist, MLS remarks and marketing drafts, seller weekly report |
| Mortgage Pod | loan, mortgage, va, fha, irrrl, refinance, pre-approval, dti, ltv, conditions, underwriting, trid, le, cd | Harrison, Denise, Howard, Walter, Lucia, Refi Watch Analyst, Alexandra | Scenario prep, conditions list, TRID clock, program fit, the weekly refi watch list (market average, not a quote) — never a quote or an eligibility call |
| Growth Pod | marketing, campaign, content, brand, social, seo, video, newsletter | Sofia, Victor, Marcus, Alexandra | Content week, campaign drafts, cost and revenue read, compliance |
| Money Pod | budget, cash, net worth, tax, commission, expense, income, profit | Marcus, Nathan, Anita, James | Numbers with sources, deadlines, cash and commission view |
| Ops Pod | automation, routine, connector, sync, broken, dashboard, mac, runner, integration, workflow, pabbly, mod | Derek, Elena, Elon, Nadia | Fix plan, security check, feasibility, the one paste for Steven |
| Client Care Pod | sphere, nurture, past client, birthday, anniversary, open house, sign-in sheet, thank-you, review request, testimonial | Sofia, Sphere Nurture Coordinator, Open House Captain, Wren, Victor, Alexandra | Monthly sphere touch drafts, open-house sign-in → leads, thank-you drafts, ISA call list, review and referral asks — drafts only |
| Presence Pod | aeo, seo, geo, aio, llm visibility, ai answers, chatgpt, perplexity, gemini, grok, llms.txt, schema, knowledge panel, google business profile, gbp, citation, directory, nap, backlink, review, press, podcast, profile, bio, handle, entity | Sofia, Orin, SEO Specialist, Delia, Gareth, Derek, Alexandra | Profile copy and NAP fixes, schema and `llms.txt`, hub deploy packet, citation sweep, review asks, press and podcast pitches, the monthly LLM benchmark and KPI row (`projects/aeo-presence/data/`) — drafts and Needs-Steven packets only; Steven posts, deploys, submits and pays |

**Every seat is cross-functional (Steven, 2026-10-23: "enable all agents to be cross functionable").** A pod is the
default crew, never a wall: the planner also brings in any seat whose lane words appear in the request (the Lane
keywords table) and any Join below, and Vanessa may pull any of the 198 roster agents into any pod through the Agent OS
(`bin/brain route "<request>"` prints the crew; `integrations/agent-os/`). The lead stays the lane owner; the gates
still run after the wave. The org chart every dashboard shows is one JSON — `bin/brain org` — written daily to the
Command Deck doc `aiTeamOrg` by the Big-moves task, embedded in the 6D Brain's seat lens, and mirrored by the Mac's
`aiTeamRoster` snapshot (198 agents).

## Joins — a seat that must come along

When the request matches the words, the seat joins the plan even if it is not the lead.

| When the request touches | Also bring in | Why |
|---|---|---|
| client, borrower, buyer, seller, post, ad, email, marketing, disclosure, rate, video | Alexandra | Anything client-facing or advertised passes compliance before it leaves |
| website, browser, browse, log in, login, portal, fill the form, scrape | Elena | Browsing as Steven can reach logged-in accounts and client data; the CISO sets what it may touch |
| domain, dns, registrar, hosting, deploy, verification tag, new account, claim a profile | Elena | Domains, DNS records and account creation are credential-grade; the CISO reviews before Steven does them |
| credential, key, token, api, connector, integration, access, pii, client data | Elena | Credentials and client data are the CISO's gate |
| automation, connector, integration, routine, script, dashboard, deck, mcp | Derek | The CTO owns whether it runs and stays green |
| tool, adopt, new model, ai strategy | Elon | Every Nadia proposal gets Elon's feasibility check |
| reverse engineer, reverse engineering, decompile | Alexandra | Terms of service and licence limits decide whether it is allowed at all |
| lead, pipeline, crm, referral | Victor | Revenue impact is measured by the CRO |
| cost, spend, budget, subscription, price, paid, pay, upgrade, purchase | Marcus | Anything that spends money is costed by the CFO |
| loan, mortgage, va, fha, rate, refinance | Harrison | Loan mechanics are prepared by the senior mortgage seat |
| buyer, listing, showing, offer, escrow | Carmen | The transaction coordinator owns the file timeline |
| fraud, scam, phishing, wire instructions, impersonation | Elena | A fraud flag from triage or a recap goes to the CISO before anyone replies |

## Gates — run after the wave, never in parallel with it

| Gate | Runs when | What it does |
|---|---|---|
| Alexandra | Alexandra is in the plan | Compliance review of the drafted output; Steven decides |
| ECC | Derek or Elon is in the plan | Standards, tests, security and agent-safety review of any change |
| Validation | Derek or Elon is in the plan (any code change) | The code-validator agent: `scripts/validate-code.sh` then the VibeBreaker 20-pass adversarial review of the diff; code is not done until both pass (`.claude/skills/code-validation-gate`) |
| Vanessa | always | Consolidates every seat into one answer for Steven; the same pods run as workflows on The Bot Crew (`wiki/ai-team/bot-crew.md`) |

Who validates code after you write it, and with what protocol: the **code-validator** agent validates every code
change — first the deterministic checks (`scripts/validate-code.sh`), then the **VibeBreaker** 20-pass adversarial
review protocol over the diff — and the change-set is marked reviewed (`validate-code.sh --mark`). The Stop hook asks
for it once per change-set; code is not done until both halves pass (2026-10-12, `.claude/skills/code-validation-gate`).

## HALT words — stop and write a Needs-Steven packet

Mirrors the HALT list in `CLAUDE.md`. The planner still prints the plan, marked HALT, so the prep work can
run while the licensed or irreversible step waits for Steven.

| When the request says | HALT because |
|---|---|
| send, email the client, text the client, post it, publish, schedule the post, submit the form, place the order, book it, book the flight, book the hotel, book the trip | A send to a client or a public post needs Steven's yes |
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

Written 2026-10-09; desk seats (`desk-seats.md`), Client Care Pod and the fraud join added 2026-10-22. Routing self-test: `brain/bench/routes.json`, checked by `bin/brain loop`.
