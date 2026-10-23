# AI team: org chart, seats, pods, toolkit, push-button system

Second Brain export for NotebookLM · as of 2026-10-23 · bundle `04-wiki-ai-team`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: wiki/ai-team/agent-os.md -->
# FILE: wiki/ai-team/agent-os.md

# Agent OS — every agent through Laya, Jarvis and Orca

How the org chart works as an operating system: **Laya** picks the lane, **Jarvis** recalls first, **Orca** runs the
agents side by side, and the dispatch planner (`bin/brain route`) holds the rules. To run any agent: `bin/brain os run "<request>"`, then start each agent in its own Orca worktree with `claude --agent <slug>`. Written 2026-10-12.

## The four steps for any request

1. **Laya (first hop, zero tokens).** Confident → straight to the lane. Below its own threshold → ESCALATE to Vanessa.
   Laya never decides a licensed matter. Status: installed on the Mac per the 2026-10-05 toolkit snapshot, MCP server not registered, unverified from the cloud.
2. **Jarvis (recall first).** `bin/brain recall "<question>"` first; any client question stays on the local model (Jarvis/Bonsai), never the web.
3. **Orca (run the agents).** One Orca worktree per agent, at most 8 live at once, each started with `claude --agent <slug>`. Orca's phone app watches and steers the same sessions; pairing links never leave the device.
4. **Gates.** Alexandra reviews anything client-facing, ECC reviews any change, Vanessa consolidates last. HALT words stop the marked step for Steven.

## The commands (plain code, no model call)

| Command | What it does |
|---|---|
| `bin/brain os list [seat]` | every roster agent with its tier, model, Laya lane and Orca command |
| `bin/brain os show <slug>` | one agent: lane, starting page, recall line, launch command, guards |
| `bin/brain os run "<request>"` | the Laya → Jarvis → Orca launch sheet for a request, with HALTs and gates |
| `bin/brain os check` | exit 1 unless all roster agents are reachable and the manifest is current |
| `bin/brain os write` | rewrite `integrations/agent-os/agents.json` (the loop does this every run) |

## Control from Orca and Jarvis (added 2026-10-12)

- **Orca:** `bash integrations/agent-os/orca-launch.sh "<request>"` opens one Claude Code session per seat the planner
  picks (≤8), each in its own Terminal window inside the repo; Orca lists every running session, so once Orca is paired
  they can be watched and steered from this Mac, the other Mac or the phone. `--dry-run` prints instead of opening.
- **Jarvis:** `integrations/jarvis/agent-verbs.json` maps spoken verbs ("Jarvis, have Marcus …", "Jarvis, run the team
  on …", "Jarvis, ask the brain …") to the same commands. The `never` list (send, pay, sign, pair Orca …) is enforced by
  the HALT words in the planner, not by trusting the voice layer.
- `bin/brain os run --json` is the data form both use.
- Pairing Orca is the one step that cannot be scripted: the pairing link is generated on the Mac and is a secret.

## Agent files — the org chart as 172 launchable seats (added 2026-10-12)

`bin/brain os agents --write` generates `integrations/agent-os/agents/<slug>.md` for every roster seat: Claude Code's
frontmatter (name = slug, model opus/sonnet by tier) and a system prompt that states the seat's lane, tier, lead, starting brain
page, gates and the HALT rules. `install-mac.sh --apply` links them into `~/.claude/agents` and never overwrites a file already
there, so a prompt Steven tuned on the Mac wins. After that, `claude --agent <slug>` starts any seat on any machine and Orca
lists it as a running session; `orca-launch.sh` opens the seats a request needs. Checked weekly: `bin/brain os agents`.

## Coverage and limits

- **172 of 172** roster agents resolve to a lane, a recall line and a launch command (`bin/brain loop` checks this weekly).
- Named seats stored only as persona skills (Kevin, James, Apex, Harrison) launch as `/kevin-mentor`, `/james-wealth`, `/apex-trader`, `/vanessa-broker`.
- **Proposal-only** seats (Nadia, Elon, Disruption Scout, the council, the twin) return proposals, never changes.
- Nothing here starts Orca, Laya or Jarvis or sends anything. The commands are printed for the Mac, where those tools live.
- Orca's own CLI flags were not verified from the cloud; the launch line is the Claude Code command Orca runs inside a terminal.
- The living A–Z of every page, with backlinks, is `docs/reports/ENCYCLOPEDIA.md`, rewritten by `bin/brain encyclopedia` and every loop run.

See also `computer-hub.md` (the machines), `cross-functional.md` (the rules the planner follows), `org-chart.md`.

## Seats added after the Mac snapshot

`code-validator` (2026-10-12) exists in `docs/inventory/agent-roster.md`, the Agent OS manifest, the agent files and the deck's live `aiTeamRoster` document (v15). The Mac's `roster-tiers.json` and `agent-lint/roster_snapshot.py` do not know it yet: add the seat there (tier 2, lead cto-derek, model opus) before the next snapshot runs, or that run will drop it from the deck's count.

The seven desk seats of 2026-10-22 (`refi-watch-analyst`, `sphere-nurture-coordinator`, `voicemail-inbox-triage`, `document-intake-clerk`, `open-house-captain`, `travel-desk`, `meeting-scribe`; tier 2, model sonnet, leads per `desk-seats.md`) are in the roster, the manifest and the agent files the same way, and are likewise missing from the Mac's `roster-tiers.json` until added there.


---

<!-- source file: wiki/ai-team/bot-crew.md -->
# FILE: wiki/ai-team/bot-crew.md

# The Bot Crew — the 355-agent chat surface that mirrors the org chart

The Bot Crew (https://claude.ai/artifact/B8BPDvyE55p8hT7PTyKbjG) is Steven's in-Claude agent page: every seat on
`wiki/ai-team/org-chart.md` has a chat card there, plus the specialist groups that roll up under each executive.
It sits under Vanessa as a surface, not a new seat. Last aligned with the org chart 2026-10-22 (wave 6).

## What is on it (2026-10-22)

| Part | Count | Notes |
|---|---|---|
| Executive team and mentors | 13 | Vanessa (Chief of Staff, first card) · Marcus · Victor · Sofia · Derek · Alexandra · Nadia · Elena · Elon · Maxwell · Apex · James · Kevin |
| Named seats and desk group | 21 | Harrison, Gwen, Marguerite, Carmen, Denise, Howard, Lucia, Walter, Rosa, Wren, Garrett, Juliet, Winston, Beatrice + the seven desk seats (`desk-seats.md`) |
| CA broker and C.A.R. forms group | 8 | Forms Tutor, Form Selector, purchase-agreement walkthrough, disclosure package, deadline calculator, broker file review, DRE tracker, new-agent forms coach |
| Specialist groups | 308 | 31 groups (personal life, real estate, lending, veterans, recruiting, content, nonprofit, book, trading, education, MBSE/DAU, AI ops) |
| Original agents | 5 | Lucy, Riley, Jeffrey, Karen, Hermela |
| Total | 355 | |

**Workflows (23):** 12 multi-agent runs (inbox to action, new lead, loan milestone, realtor partners, recruiting,
content week, webinar, weekly CEO review, listing launch, closing, trading day, DAWIA study) and the 8 standing pods
from the org chart as runnable workflows — Deal, Lead, Listing, Mortgage, Growth, Money, Ops, Client Care — plus three
org-level runs: the Chief of Staff daily cycle (Automation / AI team / ISA / Steven buckets, ≤3 Needs-Steven), the
mentor council (Maxwell, James, Kevin, then Vanessa's call) and new-tool vetting (Nadia grades → Elon → Elena → Derek's
pilot plan; nothing installs without Steven). Each pod
runs its seats in order, Alexandra gates anything client-facing, Vanessa consolidates last. "Schedule in Claude" turns
any workflow into a scheduled-task prompt (nothing is scheduled until Steven creates it).

**AI org chart panel:** Vanessa → executives (with their named seats and the crew groups that roll up to them) →
mentors → pods. Group roll-up: Vanessa p14 p1 p2 p3 p5 p8 p10 c9 · Marcus p4 c8 · Victor c1–c6 c11 c12 · Sofia c7 c13
c14 p12 · Derek p9 c15 · Alexandra x2 · Nadia c10 p7 · Apex p13 · Kevin p6 p11.

**Orchestration:** Vanessa (and the Command center group) can `consult_agent` any card and `start_workflow`; join rules
are the same as `cross-functional.md` (client-facing → Alexandra; credentials/fraud → Elena; automation → Derek;
money → Marcus; loan mechanics → Harrison; transactions → Carmen; new tools → Elon).

**Live tools:** 20 connectors read through the page (Gmail, Google Calendar, Google Drive, Notion, Fieldy, You.com,
Slack, Expedia, WhisperAI, Canva, Context7, Claude Code Remote repos, Strava, CarGurus, Rome2Rio, Groupon, Trip
Logistics, Zoom, Turo, Vanguard Advisor Tools). Anything that writes — a Gmail draft, a calendar event, a Notion
page — waits on an approval card. Nothing sends.

**Resource library:** official sources each group checks first (VA M26-7, CFPB TRID, Reg Z / Reg X, NMLS, HUD fair
housing, C.A.R. Forms Tutor, DRE, Google Ad Grants policies, DAU, GI Bill tool, USAJOBS, CME NQ, BLS, NinjaTrader,
Claude docs, Pabbly, Turo). Steven's own dashboard links are owner-only (`ownerseed/links`).

**Owner seed:** Steven's profile and links sit in the page's owner-only store (`ownerseed`), so viewers of a shared
link never see them.

## Rules the page keeps

- Draft-only. No card sends, books, pays, quotes, signs or writes to a client-facing system.
- Kevin is an original fictional composite (`.claude/skills/kevin-mentor`); he replaced Cole on the crew on 2026-10-22,
  keeping Cole's card id so old notes carry over.
- Elon and Nadia are proposal-only; Apex is paper-only; Harrison and the Mortgage Pod never quote ("market average,
  not a quote").

## Where the build lives

Built from session scratch files (`assemble.py` + `wave4.js` / `wave5.js` / `wave6.js`), not from this repo. A change to a
seat here should be mirrored on the crew page in its next wave.


---

<!-- source file: wiki/ai-team/capability-matrix.md -->
# FILE: wiki/ai-team/capability-matrix.md

# Capability matrix — what each seat can reach (2026-10-11)

Every seat reaches these through Vanessa's dispatch (`bin/brain route`), never by editing a live agent prompt (those change only through the weekly-self-update gate). A tick means the seat may use it for its own lane; every use stops at the HALT list.

| Capability | What it is | Marcus | Sofia | Derek | Alexandra | Nadia | Victor | Elena | Elon | Harrison | Apex | Kevin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Browser hands (agent-browser, Playwright MCP) | Read, search and fill websites; stop before submit/send/pay | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | review | ✓ | ✓ | ✓ | – |
| Skill finder (`find-skills`) | Find a skill for the task; Elon and Elena gate any add | ✓ | ✓ | ✓ | – | ✓ | ✓ | gate | gate | – | – | – |
| Weekly scout | New repos, skills, MCP servers, upgrades | – | – | ✓ | – | grades | – | gate | gate | – | – | – |
| Tax Assessor Agent | Public county records → Property Tax Sheet | ✓ | – | – | – | – | ✓ | – | – | ✓ | – | – |
| Loan Pricing Prep Agent | Scenario worksheet, never a quote | ✓ | – | – | review | – | ✓ | – | – | ✓ | – | – |
| Reverse-engineering gate (REA) | Owned or licensed software only | – | – | ✓ | gate | proposes | – | gate | ✓ | – | – | – |
| Trading Research Desk | Paper-only strategy research loop | ✓ | – | – | – | – | – | – | – | – | ✓ | – |
| Events scout | Weekly events and networking by city | – | – | – | – | – | ✓ | – | – | – | – | ✓ |
| Computer Hub (Claude Remote Control, Orca, AnyDesk) | Reach every computer | – | – | ✓ | – | – | – | gate | ✓ | – | – | – |
| Dispatch planner (`bin/brain route`) | Lead, joins, waves, gates, HALTs | all seats, through Vanessa |||||||||||

"gate" = the seat reviews before anything is added or used; "review" = the seat checks the output; "–" = not in that seat's lane (ask Vanessa, who routes it). Steven's yes is required for any send, spend, signature, account change or live order.


---

<!-- source file: wiki/ai-team/computer-hub.md -->
# FILE: wiki/ai-team/computer-hub.md

# Computer Hub — reaching every computer

Written 2026-10-11. Steven's computers: **Mac 1**, **Mac 2**, the **Alienware PC**, plus a tablet and phone. Each gets the same three doors.

| Door | What it gives | How | Where it lives |
|---|---|---|---|
| Claude Remote Control | The Claude Code session on that computer appears in the session list at claude.ai/code and on the phone | `claude remote-control`, then `rc-agent.sh install` (Mac) | `integrations/remote-control/` |
| Orca | All the AI agents on that computer, paired over a private network | `orca-remote.sh serve` / `pair` (Mac), `alienware-setup.ps1 -Action OrcaServe` / `OrcaPair` (Windows) | `integrations/remote-control/`, `integrations/alienware/` |
| AnyDesk | The whole screen, keyboard and mouse | Macs: `connect-all.sh` step 6d (official Homebrew cask, prints the ID); Alienware: one `winget` line; tablet/phone: App Store / Google Play — all in `integrations/anydesk/README.md`. ID saved in the Computer Hub card; `integrations/anydesk/anydesk-links.py` | `integrations/anydesk/` |

The dashboard card is Panel 40 on Toolkit & Remote Access. Ticks and AnyDesk IDs stay in that browser only.

## Alienware PC (Windows) — local AI
`integrations/alienware/alienware-setup.ps1` checks and installs, asking y/N before each change: Orca, Laya (`laya[serve,mcp]` 0.3.21 in its own venv), Bonsai 2 27B through PrismML's own Bonsai-demo (pinned commit), optional Ollama with the community `MichelRosselli/bonsai-27b` upload (unverified), AnyDesk and Tailscale. `-Action Doctor` is read-only; `-Action Report` prints one status line for the dashboard. It has **never run on Windows** — first run is the real test.
Bonsai 2 needs PrismML's llama.cpp fork; stock Ollama may not run it. The local tier (Bonsai) is for client-data requests only and never falls back to a cloud model.

## Connect status (2026-10-22)
`connect-all.sh` now does each Mac's safe half of all three doors in one paste: step 6c installs Orca (official tap `stablyai/orca/orca`) if missing and opens it on the Repo folder; step 6d installs AnyDesk (official cask) and reads the Mac's AnyDesk ID. Steven's half, printed in its report: Screen Recording + Accessibility for AnyDesk, an optional unattended-access password typed by him, and the one Orca phone-pairing scan. Nothing is "connected" until he has done those on each device.

## Rules
- A pairing link or an AnyDesk password is full control of that computer. Never paste one into chat, the dashboard, a note or the repo.
- Pair Orca only over the home network or Tailscale; desktop control is never granted through Orca.
- AnyDesk's unattended-access password is a credential: Steven sets it himself. Its paid REST API needs his licence and credentials (Needs-Steven).
- An agent reached through any door follows the HALT list: no sends, spending, signing or account changes without Steven.

## See also
`wiki/ai-team/tool-integration-status.md`, `REMOTE-ACCESS.md`, `integrations/alienware/README.md`, `integrations/anydesk/README.md`.

## Remote access from anywhere — AnyDesk (added 2026-10-12)

Panel 40 opens with a "Remote access — every computer" card: one Connect button per computer, driven by the AnyDesk IDs saved in each device card. IDs are stored in the deck's shared store (`anydeskIds`) so the phone, tablet and both Macs see the same list; an ID is an address, never a secret. The password stays inside AnyDesk on the computer being reached (Settings → Security → unattended access, set on that machine). Source: `dashboard/wave2/splice-anydesk.py`; local tool `integrations/anydesk/anydesk-links.py`.


---

<!-- source file: wiki/ai-team/cross-functional.md -->
# FILE: wiki/ai-team/cross-functional.md

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
| fraud, scam, phishing, wire instructions, impersonation | Elena | A fraud flag from triage or a recap goes to the CISO before anyone replies |

## Gates — run after the wave, never in parallel with it

| Gate | Runs when | What it does |
|---|---|---|
| Alexandra | Alexandra is in the plan | Compliance review of the drafted output; Steven decides |
| ECC | Derek or Elon is in the plan | Standards, tests, security and agent-safety review of any change |
| Validation | Derek or Elon is in the plan (any code change) | The code-validator agent: `scripts/validate-code.sh` then the VibeBreaker 20-pass adversarial review of the diff; code is not done until both pass (`.claude/skills/code-validation-gate`) |
| Vanessa | always | Consolidates every seat into one answer for Steven; the same pods run as workflows on The Bot Crew (`wiki/ai-team/bot-crew.md`) |

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


---

<!-- source file: wiki/ai-team/desk-seats.md -->
# FILE: wiki/ai-team/desk-seats.md

# Desk seats — seven Sonnet 5 report seats added 2026-10-22

Seven report-tier seats that prepare lists and drafts for Steven, the ISA and the executives. Every one is **drafts
only**: it never sends, quotes, signs, books, pays or writes to a client-facing system — that step is a Needs-Steven
packet. Each hands finished work to `vanessaQueue` (or the named DB doc) and says which brain page it used. Lane words
and pod membership live in `cross-functional.md`; the launchable agent file is `integrations/agent-os/agents/<slug>.md`.

| Seat | Slug | Reports to | Pod |
|---|---|---|---|
| Refi Watch Analyst | `refi-watch-analyst` | Harrison (Victor's line) | Mortgage Pod |
| Sphere Nurture Coordinator | `sphere-nurture-coordinator` | Sofia (with Wren) | Client Care Pod |
| Voicemail & Inbox Triage | `voicemail-inbox-triage` | Victor (ISA line) | Lead Pod |
| Document Intake Clerk | `document-intake-clerk` | Carmen (Victor's line) | Deal Pod |
| Open House Captain | `open-house-captain` | Marguerite / Gwen | Client Care Pod |
| Travel Desk | `travel-desk` | Vanessa (with Marcus) | none — Vanessa's desk |
| Meeting Scribe | `meeting-scribe` | Vanessa | none — Vanessa's desk |

## Refi Watch Analyst

- **Role:** weekly rate-vs-note-rate prep list — which past clients and pipeline borrowers sit above the current market
  average and by how much.
- **Owns:** the Monday refi watch list (name, note rate, market average, spread, last touch), the hand-off to Harrison
  for scenario prep and to the Sphere Nurture Coordinator for the touch draft.
- **HALT:** "market average, not a quote." Never a rate quote, a lock, an eligibility call or a message to a borrower —
  those are Steven's. Drafts only.
- **Starts from:** this page, then see `wiki/mortgage-programs/refi-review-prep.md` (the list fields, the 0.75 / 0.50 thresholds,
  the Monday routine, the IRRRL pointer); skill `.claude/skills/refi-watch`.

## Sphere Nurture Coordinator

- **Role:** monthly past-client and sphere touch drafts — birthdays, home anniversaries, closing anniversaries, check-ins.
- **Owns:** the month's nurture calendar and the draft for each touch (text, email, card), built with Wren (referral
  reciprocity) so every touch carries a referral ask only when it fits; Alexandra reviews each draft.
- **HALT:** drafts only — never sends a text or email, never writes to Lofty or the calendar.
- **Starts from:** this page, then see `wiki/real-estate-playbooks/sphere-nurture.md` (the `sphereList` fields, the monthly touches,
  the 11th-of-month routine) and `referral-reciprocity.md`; skill `.claude/skills/past-client-nurture`.

## Voicemail & Inbox Triage

- **Role:** turns WhisperAI voicemail transcripts and the Gmail inbox into triaged items in `vanessaQueue` for the ISA line.
- **Owns:** the triage rule (new lead / client question / vendor / junk), the one-line summary and suggested next action
  per item, and the fraud flag: anything that smells like wire fraud, phishing or impersonation goes to Elena first.
- **HALT:** never replies, forwards, deletes or marks spam; never moves client PII off the local model. Drafts only.
- **Starts from:** this page, then `wiki/dashboard-ops/index.md` for the queue and inbox docs; skill `.claude/skills/voicemail-to-lead`.

## Document Intake Clerk

- **Role:** reads each new contract and disclosure package and enters its dates into `tcDeals` for Carmen.
- **Owns:** the date fields (acceptance, EMD, contingencies, COE, disclosure due dates), the missing-date flag list per file,
  and the hand-off to the Transaction & Showing desk routine.
- **HALT:** never signs, sends or edits a document; a missing or conflicting date is a flag for Carmen, never a guess.
- **Starts from:** this page, then `wiki/real-estate-playbooks/transaction-stages.md`; skill `.claude/skills/tc-doc-intake`.

## Open House Captain

- **Role:** after an open house, turns the sign-in sheet into leads, thank-you drafts and an ISA call list for Marguerite
  and Gwen.
- **Owns:** the sign-in → lead list (deduped against Lofty), the thank-you draft per visitor, the ISA call list in priority
  order, and the open house checklist for the next one.
- **HALT:** drafts only — never sends the thank-you, never writes the lead to the CRM.
- **Starts from:** this page, then see `wiki/real-estate-playbooks/open-house.md` (before / during / after, workflow 9) and
  `post-close-care.md` (day 1 / 10 / 30); skills `.claude/skills/open-house-follow-up` and `.claude/skills/review-request`.

## Travel Desk

- **Role:** Vanessa's travel desk through the Gondola MCP — points vs cash comparisons, trip options, price watches on
  flights and hotels; Marcus costs every trip.
- **Owns:** the trip brief (dates, options, points-vs-cash math with the valuation stated), the price watch list and its
  alerts, and the events tie-in from `wiki/events-networking/index.md`.
- **HALT:** booking is Steven's. Never books, pays, holds a fare or transfers points.
- **Starts from:** this page, then `wiki/events-networking/index.md`.

## Meeting Scribe

- **Role:** recaps every Fieldy conversation and Zoom meeting — decisions, action items, open questions — and hands the
  action items to `vanessaQueue`.
- **Owns:** the meeting recap format (who, decisions, action items with owner and date, follow-ups), the weekly decisions
  digest, and the hand-off of any licensed or client-facing item as a Needs-Steven line.
- **HALT:** never shares a recap outside the deck, never sends a follow-up; client names stay on the local model.
- **Starts from:** this page, then `always-on/README.md` for the recap schedule; skill `.claude/skills/meeting-recap-to-crm`.

Source: Steven's seat list, 2026-10-22. Mac snapshot (`roster-tiers.json`) does not know these seven yet — add them there
(tier 2, model sonnet, leads as above) before the next snapshot, as `agent-os.md` § Seats added after the Mac snapshot says.


---

<!-- source file: wiki/ai-team/index.md -->
# FILE: wiki/ai-team/index.md

# Wiki — AI team

Who owns what, which model a seat runs on, what it may decide on its own. Use this to route a
question to a seat. For project status use `projects/ai-team.md`; this page is the routing layer.

**Status: written.** The routing table below sends a question to the right seat; the four pages
hold the actual detail once you know which seat or layer you need.

## Pages

| Page | One-line summary |
|---|---|
| `toolkit.md` | **Generated** by `bin/brain toolkit --write`: every skill, plugin, connector (with live status), cloud routine and Mac task, grouped under the seat that owns it; who has no tool of their own. |
| `org-chart.md` | The full seat map: Steven → Vanessa/Steve/ISA → 8 executives with named reports and ruflo benches |
| `model-tiering-dispatch.md` | Which model each layer runs on, ≤8-parallel/≤4-web-research dispatch rules, trust levels, the ECC gate |
| `tool-integration-status.md` | Connectors, MCP bridges, tasks/routines/skills status — plus honest Orca/Laya/77skills proposal status |
| `capability-matrix.md` | Which seat can reach which tool (browser, skill finder, scout, loan agents, trading desk, Computer Hub) |
| `computer-hub.md` | Mac 1, Mac 2, Alienware, tablet, phone: Claude Remote Control, Orca, AnyDesk, local AI |
| `third-party-packs.md` | The 18 repos Steven asked for: installed, held or declined, and why |
| `agent-os.md` | Every agent through Laya (lane), Jarvis (recall) and Orca (launch): `bin/brain os`, 172/172 reachable |
| `cross-functional.md` | Who leads, who joins, the parallel waves, the gates and the HALT words — the rules `bin/brain route` runs |
| `bot-crew.md` | The Bot Crew: 355 chat agents mirroring this org chart — 13 executive/mentor cards, named and desk seats, 8 pods and 12 workflows runnable, org-chart panel, 20 connectors behind approval cards (2026-10-22) |
| `desk-seats.md` | The seven Sonnet 5 desk seats added 2026-10-22 (refi watch, sphere nurture, voicemail/inbox triage, document intake, open house, travel desk, meeting scribe): role, owns, HALT, starting page |
| `push-button-system.md` | The 2026-10-22 architecture: one `vanessaQueue`, the 6:05 → 6:25 → 6:34 → 6:40 morning schedule, the deck push-buttons, pods and gates, the one-word mods, Pabbly workflows 1–11, the Mac paste |
| `mentors-and-benches.md` | Maxwell, Apex, James, Kevin (name settled 2026-10-07), and what a "bench" row actually counts |

## Routing by lane

| Owns (ask about) | Seat | Model tier |
|---|---|---|
| Anything at all, first | **Vanessa** — Chief of Staff / COO, orchestrator, council chair | Fable 5.1 masterminds |
| Net worth, income, budget, liabilities, close | **Marcus** — CFO | Opus 5.5 |
| Marketing, campaigns, content, social, email | **Sofia** — CMO | Opus 5.5 |
| Automation health, connectors, stack, what is broken | **Derek** — CTO | Opus 5.5 |
| TRID/RESPA/Reg Z, VA-FHA-USDA compliance, disclosures | **Alexandra** — CCO | Opus 5.5 |
| Where AI genuinely helps vs hype; tooling evaluation | **Nadia** — CAIO, outward disruptor | Opus 5.5 |
| Pipeline, conversion, the Six Levers | **Victor** — CRO | Opus 5.5 |
| Data/cyber risk, credential hygiene, access | **Elena** — CISO | Opus 5.5 |
| Feasibility of anything Nadia proposes; the engineering team | **Elon** — CTO Innovator, inward architect | Opus 5.5 |
| Lending / real-estate specialist work | **Vanessa (broker skill)**, Harrison, Gwen, Marguerite | Opus 5.5 / Sonnet 5 |
| Broker coaching, weekly pipeline review | **Maxwell** — Broker Mentor & Coach | Opus 5.5 |
| Order flow, market structure, a trade idea | **Apex** — Trade Advisor Mentor (research only) | Opus 5.5 |
| Family office, tax strategy, estate | **James** — Wealth Advisor | Opus 5.5 |
| Personal development, the 11-Dimension check | **Kevin** — Personal Development Mentor | Opus 5.5 |
| Execution, reports, benches | The named report seat | Sonnet 5 |
| Refi watch list, sphere touches, voicemail/inbox triage, contract dates, open-house follow-up, travel, meeting recaps | **Refi Watch Analyst**, **Sphere Nurture Coordinator**, **Voicemail & Inbox Triage**, **Document Intake Clerk**, **Open House Captain**, **Travel Desk**, **Meeting Scribe** — drafts only (`desk-seats.md`) | Sonnet 5 |
| Research heavy lifting | **Claude web research** — WebSearch/WebFetch on Steven's Claude subscription (Perplexity removed 2026-10-05) | Sonnet 5 |

**Kevin is the mentor seat's name everywhere** (Steven, 2026-10-07: "replace Cole with Kevin throughout"). The
skill is `kevin-mentor` (`.claude/skills/kevin-mentor/`, and `integrations/claude-desktop/kevin-mentor.zip` for
Claude Desktop); it writes to the deck's `kevinChat` thread. The old `cole-mentor` Desktop skill is retired.

## Delegation rules

- Vanessa routes; the seat answers; Vanessa consolidates into **one** answer. `bin/brain route "<request>"` prints the
  plan (lead, joins, waves, gates, HALTs) from `cross-functional.md`.
- **≤8 sub-agents in parallel. ≤4 web-research sub-agents per wave.** A stall gets 2 retries, then a
  re-route, then a Needs-Steven packet.
- **Proposal-only seats:** Nadia (weekly Disruption Brief — replace / upgrade / adopt), Elon
  (feasibility gate on every Nadia item), the LLM Council, the digital twin, the hedge-fund
  committee. They produce proposals, never changes.
- **ECC** (standards, test, observability, accessibility, security, dependency, agent-safety officers
  under Derek) reviews every change. It is a **gate, not a store** — never recall from it.
- **Integration Engineer** (under Elon) owns CRM & connectors: Lofty (`lofty-bridge` MCP), Zoho
  (Composio, API-blocked), CLI-Anything wrappers for homes.com / SkySlope / zipForms.

## Trust levels

| Level | Means |
|---|---|
| L1 | Report only. Proposes; Steven acts. |
| L2 | Drafts for approval. Nothing leaves without a human yes. |
| L3 | Owns end-to-end inside a named boundary. |

Graduation L1 → L2 → L3 is earned, never assumed: a seat needs a run of consecutive correct runs
under the loop-engineering gate. Nothing goes straight to L3.


---

<!-- source file: wiki/ai-team/mentors-and-benches.md -->
# FILE: wiki/ai-team/mentors-and-benches.md

# Mentors and benches

The four mentor seats (on call through Vanessa, not inside the executive dispatch chain) and what a "ruflo bench" actually is when you see one listed under an executive.

## The mentor seats

- **Maxwell** — Broker Mentor & Coach. Loan scenarios and underwriting, processing, mortgage brokering, California practice and CAR forms, transaction coordination, producer coaching. Answers in a fixed structure: priorities → 4 courses of action → recommendation → implement this week. Monday recommendations task.
- **Apex** — Trade Advisor Mentor. Structured trade tickets, session plans, process grades — **never an execution**. Runs the 7-agent investment-committee bench (market-scout → technical-analyst → fundamental-analyst → news-analyst → quant-analyst → risk-manager → portfolio-manager) as a research-memo-only exercise; no order is ever placed by any agent in this chain.
- **James** — Wealth Advisor / Family Office. Entity structure, income routing, deduction/deferral, asset protection, estate, governance — avoidance never evasion; licensed professionals implement the actual filings.
- **Kevin** — Personal Development Mentor. The 11-Dimension Wealth scorecard (Financial · Physical · Mental · Time · Social · Emotional · Relational · Purpose · Discipline · Image · Legacy), scored 1–10, with no single strength allowed to excuse a neglected dimension. Cadence: daily 5-minute check-in, weekly two-dimension spot-check, monthly full scorecard, quarterly vision recalibration. Escalation rule: any dimension scoring under 4 twice running suspends work on the other ten until it recovers.

**Name settled 2026-10-07:** Steven chose **Kevin** everywhere ("replace Cole with Kevin throughout"). The skill is `kevin-mentor`; it writes the deck's `kevinChat` thread. The old `cole-mentor` Desktop skill is retired once Steven uploads `integrations/claude-desktop/kevin-mentor.zip`.

## What a "bench" means

A bench row (e.g. "Research & memory bench — ruflo · 17 employees" under Nadia, or "Engineering bench — ruflo · 21 employees" under Derek) is **one row standing for a group** of specialized ruflo agents, invoked by name when a task needs that specific specialist (e.g. `graph-navigator`, `dossier-investigator`, `swarm-coordinator`). It is not a headcount to silently add on top of the named seats above it — the deck's own renderer reports named-seat count and bench-agent count **separately** for exactly this reason, and this wiki does the same. Read the current split off the deck's AI Team panel rather than repeating a number here that will drift.

## Where mentors sit relative to the executive dispatch

Mentors are **on call through Vanessa**, not part of the ≤8-parallel executive dispatch wave described in `wiki/ai-team/model-tiering-dispatch.md` — a mentor consult ("check with Maxwell") is a single targeted call, not a fan-out. This is also why Apex has its own standalone dashboard chat card rather than sitting inside the Markets & Trading executive lane.

## See also

- `wiki/ai-team/org-chart.md` — where these seats sit in the full chart.
- `wiki/ai-team/model-tiering-dispatch.md` — dispatch limits and proposal-only rules.

Source: Command Deck, `ORG_CHART.mentors` and `AI_TEAM_ORG` "Mentors" group (AI Team panel).


---

<!-- source file: wiki/ai-team/model-tiering-dispatch.md -->
# FILE: wiki/ai-team/model-tiering-dispatch.md

# Model tiering and dispatch

Which model each seat runs on, and the rules that bound how many run at once — Steven's decision, recorded 2026-09-22.

## The tiering

| Seat | Model |
|---|---|
| Vanessa — orchestration, council chair, final synthesis | Claude Fable 5.1 masterminds |
| Executives (Marcus, Sofia, Derek, Alexandra, Nadia, Victor, Elena, Elon) | Claude Opus 5.5 (since 2026-09-28) |
| Reports, benches, execution and report-only seats | Claude Sonnet 5 |
| Research heavy lifting | Claude web research — Sonnet 5 with WebSearch/WebFetch on Steven's subscription (Perplexity removed 2026-10-05) |

The deck's own toolkit snapshot (2026-09-16) shows this roughly reflected in the live agent roster: 1 agent on Fable 5.1 (Vanessa), 93 on Opus 5 (the executives have since moved to Opus 5.5), 78 on Sonnet 5. Model tiering is **decided and recorded** but, as of the same snapshot, **not yet enforced by tooling** — a seat's actual runtime model can drift from this table until that enforcement is built. Check the live roster before assuming a seat is on the model this table says it should be.

## Dispatch rules

- Vanessa dispatches **one sub-agent per agent**. **≤8 in parallel. ≤4 web-research sub-agents per wave.**
- A sub-agent that stalls gets **2 retries**, then a **re-route** to another seat, then a **Needs-Steven packet**. Never a third retry.
- Every sub-agent gets the router (`CLAUDE.md`) and its **one** leaf file — never the whole wiki tree, and never the 172-agent roster dump.
- Vanessa routes; the seat answers; Vanessa consolidates into **one** answer back to Steven.

## Proposal-only seats

Nadia (CAIO), Elon (CTO Innovator), the LLM Council, the digital twin (Steve), and the hedge-fund committee are **proposal-only** by design: they return proposals, recommendations, or drafts — never a live change to a system, a send to a client, or a spend. This is a dispatch-level rule, not a per-request judgment call — treat any output from these seats as something that still needs Steven's yes.

## The engineering gate — ECC

**ECC** (standards, test, observability, accessibility, security, and dependency officers, plus the agent-safety officer, all under Derek/Nadia's reporting lines) reviews every change before it ships. It is explicitly a **gate, not a store** — never recall an answer from ECC the way you would from a wiki page or a knowledge store; it only ever returns BLOCK / FIX / NOTE against a specific proposed change, with the rule cited.

## Trust levels

| Level | Means |
|---|---|
| L1 | Report only. Proposes; Steven acts. |
| L2 | Drafts for approval. Nothing leaves without a human yes. |
| L3 | Owns end-to-end inside a named boundary. |

Graduation L1 → L2 → L3 is earned through a run of consecutive correct runs under the loop-engineering gate — nothing goes straight to L3, and no seat grants itself a graduation.

## See also

- `wiki/ai-team/org-chart.md` — the full seat map this tiering applies to.
- `wiki/ai-team/tool-integration-status.md` — connector and tool status per seat.
- `CLAUDE.md` — the HALT list (irreversible actions, money, credentials, licensed decisions) that bounds every seat regardless of trust level.

Source: Command Deck, model-tiering table and dispatch rules (AI Team panel); `context/decisions.md`, 2026-09-22 entry.


---

<!-- source file: wiki/ai-team/org-chart.md -->
# FILE: wiki/ai-team/org-chart.md

# AI Team org chart

The full seat map behind Vanessa: Steven at the top, then Steve (digital twin) / Vanessa (Chief of Staff) / the human ISA, then eight executives each with their own named reports and ruflo benches, then the mentor seats on call through Vanessa.

## The shape

```
Steven (Principal)
├─ Steve — digital twin, Tier-1 work
├─ Vanessa — Chief of Staff / COO / orchestrator, council chair — the 80/20 rule (Steven, 2026-10-20):
│   │   AI, automations, Steve, Vanessa and the ISA/EA handle 80%; Steven personally does only the 20% on the HALT list
│   ├─ Daily Chief-of-Staff cycle — cloud routine, weekdays 6:25 AM PT: backlog → Automation / AI team / ISA-EA /
│   │   Steven buckets → ≤8 cross-functional squads in parallel (lane leads below, Alexandra on any client/ad draft,
│   │   Elena on anything that smells like fraud) → QA → `cosBrief` (≤3 Needs-Steven), `twinQueue`, `vanessaRuns`
│   │   (docs/AUTOMATION-MAP-2026-10-20.md)
│   ├─ Morning brief to Steven's phone — 6:40 AM iMessage text (Mac `vanessa-morning-brief-text`), 6:48 AM Claude-app
│   │   push (cloud, reads `cosBrief`), then her recorded voice as a voice note on the same thread (Mac
│   │   `voice-reply-render` → `vanessa-voice-send.py`; spec `integrations/mac-task-specs.md` §7)
│   ├─ Jarvis — on-device voice + local index (verify: integrations/jarvis/jarvis-setup.sh; voice = Vanessa's recorded Magica set)
│   ├─ Laya — zero-token on-device first hop (proposed; Mac install unverified, routing logic proven on the stub only — integrations/laya/)
│   ├─ Knowledge fabric — Second Brain · vault · Jarvis · Graphify · Ruflo, one recall (+ Notion record, Google Drive mirror read-only)
│   ├─ Brain loop — self-check that finds unanswered questions, drift, wrong routing and untested pages (`bin/brain loop`)
│   ├─ Browser hands + skill finder — `agent-browser`, Playwright MCP, `find-skills` (any seat asks Vanessa; Integration Engineer owns, Elena gates; stop before submit/send/pay) — `integrations/browser-agents/`
│   ├─ Computer Hub — Claude Remote Control + Orca + AnyDesk on Mac 1, Mac 2, the Alienware PC, tablet and phone (`wiki/ai-team/computer-hub.md`)
│   ├─ Weekly scout — `integrations/scout/scout.py` → `docs/reports/SCOUT.md`: new repos, skills, MCP servers, upgrades, CLIs, free tools (Disruption Scout → Nadia grades → Elon gates → Steven approves)
│   ├─ Agent OS — `bin/brain os`: all 172 roster agents reachable via Laya lane, Jarvis recall and an Orca launch command (`wiki/ai-team/agent-os.md`)
│   ├─ Dispatch planner — `bin/brain route`: lead seat, cross-functional joins, ≤8-wide parallel waves, gates, HALTs (rules: `wiki/ai-team/cross-functional.md`)
│   ├─ Broker Command Center — realtor/broker OS (https://claude.ai/artifact/XFx2H7cf8mnS8e8hjFzxNg), connected 2026-10-22
│   ├─ The Bot Crew — 355 chat agents mirroring this chart: 13 executive/mentor cards, 21 named + desk seats, 8 pods and
│   │   15 workflows runnable, an org-chart panel, 20 live connectors behind approval cards (https://claude.ai/artifact/B8BPDvyE55p8hT7PTyKbjG; `wiki/ai-team/bot-crew.md`, 2026-10-22)
│   ├─ Travel Desk — Gondola MCP: points vs cash, trips, price watches; Marcus costs each trip; booking is Steven's (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
│   ├─ Meeting Scribe — Fieldy/Zoom recaps: decisions, action items → `vanessaQueue`; drafts only (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
│   └─ Juliet — Escalation & Service Recovery
├─ ISA / EA (human) — Mon–Fri 12–4 PM; the ISA Portal opens with "Today from Vanessa" (`isaToday`, copied from
│   `cosBrief.isaInstructions` by the daily cycle, weekdays 6:25 AM PT, since 2026-10-22)
│   (sends showing confirmations, chases escrow/lender items, enters each new deal's dates into the TC intake)
├─ Transaction & Showing desk — cloud routine, weekdays 6:05 AM PT (before the cycle), under Victor: the transaction coordinator
│   (timelines, checklists, deadline alerts, reminder drafts) and the showing assistant (prep, route, confirmation
│   drafts, feedback forms); Alexandra gates every draft; writes `tcDesk`
└─ Executives (report to Vanessa, ≤8 dispatched in parallel, formed into cross-functional squads by the daily cycle):
    ├─ Marcus (CFO) — Nathan, Bianca, Maya (four-county market & schools data, new 2026-10-22), Dov, Anita, Paloma, Grace, Alan, Hazel, Corinne + ruflo cost-analyst bench
    ├─ Sofia (CMO) — 14 named marketing reports + ruflo audio bench
    │   ├─ Sphere Nurture Coordinator — monthly past-client/sphere touch drafts, birthdays and anniversaries, with Wren; drafts only (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    ├─ Derek (CTO) — Sam, Naomi, Integration Engineer (owns OmniRoute failover + `claude-auto --keep-going`, and the browser tools: agent-browser, Playwright MCP) + 5 ECC officers + Ivan, Lena, Grace, Raj, Tomas, Owen (Broker Command Center Autopilot) and Rafael (Workflow Studio), both new 2026-10-22
    │   + code-validator (the code-validation gate, 2026-10-12: validate-code.sh + VibeBreaker 20-pass review of every code change — a different agent than the author)
    │   + code-review / build-fix / code-quality / infrastructure benches (56 agents)
    ├─ Alexandra (CCO) — Lucia, Bennett, Fern, Clay, Odette, Gus, Imani, Roland, Diane, Walter, Denise, Howard, Beatrice (DRE broker supervision) and Winston (C.A.R. forms + file QA), both new 2026-10-22
    ├─ Nadia (CAIO, proposal-only) — Leah, Disruption Scout (runs `integrations/scout/scout.py` weekly), Yuki, Hana, Felix, Nora, Ezra + research bench
    ├─ Victor (CRO) — Harrison, Gwen, Marguerite + 19 named reports + Carmen + the Transaction & Showing desk routine
    │   + Tax Assessor Agent and Loan Pricing Prep Agent (prep only; `wiki/mortgage-programs/loan-task-agents.md`)
    │   + Paula (probate/trust/distressed), Riley (professional alliances), Ingrid (Academy), Celeste (Coach HQ), Lenora (knowledge librarian) — new 2026-10-22, Broker Command Center
    │   ├─ Refi Watch Analyst — under Harrison: weekly rate-vs-note-rate prep list, "market average, not a quote" (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   ├─ Voicemail & Inbox Triage — ISA line: WhisperAI voicemails and Gmail triaged into `vanessaQueue`; fraud flags to Elena (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   ├─ Document Intake Clerk — under Carmen: contract and disclosure dates into `tcDeals`, missing-date flags (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    │   └─ Open House Captain — under Marguerite/Gwen: sign-in sheet → leads, thank-you drafts, ISA call list (new 2026-10-22, `wiki/ai-team/desk-seats.md`)
    ├─ Elena (CISO) — Omar, Renee, Ruth, Dev + ruflo security bench
    └─ Elon (CTO Innovator, proposal-only) — the AI Agent Engineering Team: stress-test, reliability,
       efficiency, capability, integration engineers + sandbox QA + chief automation strategist
```

## Standing pods — cross-functional teams that work in parallel (2026-10-22)

Steven: "ensure AI agents work cross-functional as teams and in parallel when needed." Eight standing pods sit across
the executive lines; `bin/brain route` wakes a whole pod in one parallel wave (≤8 seats) and Vanessa's daily cycle
forms its squads from them. Gates run after the wave: Alexandra on anything client-facing, ECC + the code validator
on any change, Vanessa last. Rules and wake words: `wiki/ai-team/cross-functional.md` § Pods.

| Pod | Seats (parallel) | Delivers |
|---|---|---|
| Deal Pod | Victor · Carmen · Showing Coordinator · Harrison · Document Intake Clerk · Alexandra | timelines, due-in-7, checklists, contract/disclosure dates into `tcDeals`, reminder drafts, loan milestones |
| Lead Pod | Victor · Gwen · Sofia · Voicemail & Inbox Triage · Alexandra | ISA call list, voicemail/inbox triage into `vanessaQueue`, follow-up and nurture drafts |
| Listing Pod | Marguerite · Sofia · Bianca · Alexandra | CMA prep, launch checklist, remarks, seller report |
| Mortgage Pod | Harrison · Denise · Howard · Walter · Lucia · Refi Watch Analyst · Alexandra | scenario prep, conditions, TRID clock, weekly refi watch list — never a quote |
| Growth Pod | Sofia · Victor · Marcus · Alexandra | content week, campaigns, cost/revenue read |
| Money Pod | Marcus · Nathan · Anita · James | numbers with sources, deadlines, commissions |
| Ops Pod | Derek · Elena · Elon · Nadia | fix plan, security check, feasibility, Steven's one paste |
| Client Care Pod | Sofia · Sphere Nurture Coordinator · Open House Captain · Wren · Victor · Alexandra | sphere touch drafts, open-house sign-in → leads, thank-you drafts, ISA call list, review/referral asks |

**One Vanessa, one queue (2026-10-22).** Every surface hands work to `vanessaQueue` on the Command Deck: deck buttons
("Hand to Vanessa" on kanban, lead and deal rows), Vanessa's own `queue_task` tool in chat, `/queue` in Claude Code,
the ISA Portal's "Hand to Vanessa" box (via its `vanessaOutbox`, moved in each morning) and the routines. The 6:25 AM
daily cycle works the queue first, marks each item done / needs-Steven with where the draft is, and folds the rest
into the ≤3 Needs-you items.

## What the desks run on (2026-10-22, evening)

| Desk seat | Routine / button | Reads | Writes | Steven's step |
|---|---|---|---|---|
| Refi Watch Analyst | Mon 7:20 AM PT `trig_014ipr6x9z35psmtHJCPVqj1`; `refi-watch` skill | `ratesSnapshot`, `refiWatchList` | `refiWatchDesk`, `vanessaQueue` | keeps the refi list (deck form, ISA Portal form, or "refi list: …" to Claude) |
| Sphere Nurture Coordinator | 11th 7:40 AM PT `trig_01Pn8xLNKTVVFYjYTj8d8JTd`; `past-client-nurture` | `sphereList`, housing feeds | `sphereTouches`, `marketingQueue`, `vanessaQueue` | approves the drafts; the ISA sends |
| Voicemail & Inbox Triage | deck "Triage my inbox" (Gmail as the viewer); `voicemail-to-lead` (WhisperAI) | Gmail, recording links | `inboxDesk`, `vanessaQueue`, Gmail drafts | clicks "Save draft in Gmail"; sends himself |
| Document Intake Clerk | `tc-doc-intake`; deck TC intake form | Drive / Gmail attachments | `tcDeals` | confirms dates the document does not state |
| Open House Captain | `open-house-follow-up`; Pabbly workflow 9 | sign-in export | `vanessaQueue`, Gmail drafts | approves thank-yous; the ISA calls |
| Travel Desk | Gondola MCP (`connect-all` 4b; claude.ai custom connector) | Gondola | trip options, price watches | books, pays, transfers points |
| Meeting Scribe | deck "Recap my meetings" (Fieldy + Zoom as the viewer); `meeting-recap-to-crm` | Fieldy, Zoom | `inboxDesk.meetings`, `vanessaQueue`, Gmail drafts | records with the pendant / Zoom AI Companion |

The ISA Portal carries the same two lists as intake forms (`listOutbox`); the 6:25 cycle moves pending rows to the
deck and marks them "moved". Inkbox (reconnected 2026-10-22) gives Vanessa an email address and an iMessage line;
the deck's "Text me this brief" sends the morning brief to Steven's own mobile only.

## Tools per seat (skills · plugins · connectors · routines · Mac tasks)

`wiki/ai-team/toolkit.md` is the register — regenerated by `bin/brain toolkit --write` (zero tokens) from
`.claude/skills`, `integrations/mods`, `integrations/CONNECTIONS.md`, `docs/inventory/cloud-routines*.md` and
`docs/inventory/mac-task-descriptions.md`. On 2026-10-20: 24 skills · 3 plugins · 15 connectors · 60 cloud routines ·
60 Mac tasks; Apex, James and Nadia have no tool of their own (they answer through Vanessa's recall). `bin/brain owner
"<panel>"` says who keeps a Command Deck panel alive and what stays Steven's. The 3D brain shows the same five as lobes.

## The named seats worth knowing by name

- **Harrison** — Elite Mortgage Broker, the senior mortgage authority across six standing lanes (VA purchase, VA IRRRL, conventional/high-balance, FHA, self-employed/non-QM, jumbo/portfolio). Preparation and analysis only — the licensed act stays Steven's.
- **Gwen** (Buyer's Agent) and **Marguerite** (Listing Agent) — prep Steven or the showing agent for the appointment itself; neither represents anyone directly. See `wiki/real-estate-playbooks/buyer-process.md` and `listing-process.md`.
- **Carmen** (CA Transaction Coordinator) and **Denise** (CA Loan Processor) / **Howard** (CA Underwriter) — run the operational file day to day on both sides of a deal; see `wiki/real-estate-playbooks/transaction-stages.md`.
- **Lucia** (Guideline & Program Eligibility) — the seat that separates agency rule from investor overlay; see `wiki/mortgage-programs/program-selection.md`.
- **Walter** (TRID Timeline Checker) — per-file LE/CD clocks; see `wiki/mortgage-programs/disclosure-timing.md`.
- **Rosa** (Military & Corporate Relocation) — see `wiki/real-estate-playbooks/military-relocation.md`.
- **Disruption Scout** (under Nadia) — runs the weekly internet scout (`integrations/scout/scout.py`): GitHub, the official MCP registry, npm, Hacker News and releases of tools already in the stack. Its shortlist feeds Nadia's weekly brief; Elon gates every ADOPT/PILOT; nothing installs without Steven. See `wiki/ai-team/tool-integration-status.md`.
- **Wren** / **Garrett** — referral reciprocity and LPT recruiting; see `wiki/real-estate-playbooks/referral-reciprocity.md`.
- **Desk seats (2026-10-22)** — Refi Watch Analyst, Sphere Nurture Coordinator, Voicemail & Inbox Triage, Document Intake Clerk, Open House Captain, Travel Desk, Meeting Scribe: Sonnet 5 report seats, drafts only; see `wiki/ai-team/desk-seats.md`.

## What "bench" means

A bench row (e.g. "ruflo · 21 employees" under Derek's engineering bench) stands for a group of specialized ruflo agents invoked **by name** when needed — it is not a headcount to add to named seats without noting which is which. The deck's own renderer counts named seats and bench-standing-for-agents separately rather than blending them into one impressive total; this wiki does the same and does not restate either number as a fact to maintain — read the live count off the deck's AI Team panel.

## How the seats work together

Every request runs the same pattern, and `bin/brain route "<request>"` prints it: Vanessa picks the **lead** (the seat
whose lane words match most), the **joins** come along by rule (client-facing → Alexandra; credentials/data → Elena;
automation → Derek; money → Marcus; loan mechanics → Harrison; transactions → Carmen; new tools → Elon), all of them run
**in parallel** (≤8 a wave, ≤4 web research), then the **gates** run in order — Alexandra's compliance review, the ECC
review of any change, and Vanessa last, consolidating one answer. A HALT word (send, quote, pay, delete, credential,
legal) lets the prep run but holds the final step for Steven. Rules: `wiki/ai-team/cross-functional.md`.

## What every seat can now do (2026-10-10)

Any seat can, through Vanessa: **find a skill** for the task (`find-skills`, `npx skills find`), **use a browser** to read
and fill websites (`agent-browser` from Claude Code, Playwright MCP from Claude Desktop), and have UI or copy reviewed
(`web-design-guidelines`, `writing-guidelines`). Examples: Victor reads a lead's public listing history; Gwen pulls
showing slots; Sofia checks a post's landing page; Derek dogfoods the Command Deck; Nadia tries a new tool's demo. Every
click that submits, sends, pays or signs stops for Steven. `bin/brain route` brings in Elena when a request touches a website.

## Added 2026-10-11

- **Trading Research Desk** (under Apex, paper mode only) — Idea, Builder, Backtester, Paper Trader and Memory agents plus a Risk Manager and a Regime Analyst; out-of-sample testing, fees and slippage, memory that never deletes a failure. `integrations/trading-desk/`.
- **Tax Assessor Agent** and **Loan Pricing Prep Agent** (under Victor/Harrison) — public county records and scenario worksheets; never a quote or an eligibility decision.
- **Reverse-engineering gate** (REA, under Elon with Elena and Alexandra) — owned or licensed software only.
- **Events scout** — weekly events and networking by city for the Travel tab; networking leads go to Victor as proposals. `wiki/events-networking/index.md`.
- **Computer Hub** and the **Alienware local-AI tier** (Laya, Bonsai 2 27B) — `wiki/ai-team/computer-hub.md`.
- **Third-party skill packs** — Sofia's content skills, `/watch`, vidIQ and more, installed by Steven on the Mac. `wiki/ai-team/third-party-packs.md`.

## Proposal-only seats

Nadia (CAIO) and Elon (CTO Innovator) never ship a change themselves — Nadia scans outward and writes the weekly Disruption Brief (replace/upgrade/adopt, graded ADOPT/PILOT/WATCH/IGNORE); Elon vets every item for feasibility, integration cost and security risk before it can enter the test queue. Both report to Steven, cc Vanessa. The LLM Council and the digital twin are proposal-only in the same sense — see `wiki/ai-team/tool-integration-status.md` for what that means for Orca, Laya, and 77skills specifically.

## See also

- `wiki/ai-team/model-tiering-dispatch.md` — which model each layer of this chart runs on, and the parallel-dispatch limits.
- `wiki/ai-team/tool-integration-status.md` — connector, skill, and proposed-tool status by seat.
- `wiki/ai-team/mentors-and-benches.md` — Maxwell, Apex, James, Kevin and what a "bench" actually is.
- `wiki/ai-team/bot-crew.md` — The Bot Crew: every seat above as a chat card, pods as runnable workflows.

Source: Command Deck, `ORG_CHART` / `AI_TEAM_ORG` data (AI Team panel), toolkit snapshot referenced 2026-09-16. Tree last updated 2026-10-09 (Laya, Brain loop, Google Drive mirror, Jarvis verify script; dispatch planner, keep-going failover and weekly scout added the same day; browser control + skill finder 2026-10-10; trading desk, loan-task agents, events scout, Computer Hub, third-party packs 2026-10-11; Broker Command Center seats, the ISA's "Today from Vanessa" list and the Transaction & Showing desk node 2026-10-22; seven desk seats and the Client Care Pod 2026-10-22; The Bot Crew surface under Vanessa 2026-10-22). `bin/brain orgcheck` proves every seat above resolves to a brain page.


---

<!-- source file: wiki/ai-team/push-button-system.md -->
# FILE: wiki/ai-team/push-button-system.md

# Push-button system — one queue, one daily schedule, one-word buttons (as of 2026-10-22)

The architecture Steven asked for on 2026-10-22 ("the best automated push button system"): every surface hands
work to **one Vanessa queue**, a fixed morning schedule works it, the Command Deck carries push-buttons for the
rest, the Claude Code mods turn each job into one word, and Pabbly carries the vendor-to-vendor hand-offs off the
Claude allowance. Sources: `context/decisions.md` (2026-10-22 entries), `always-on/README.md` § push-button
schedule, `docs/AUTOMATION-MAP-2026-10-20.md`, `docs/ROUTINE-BUDGET-2026-10-22.md`,
`integrations/pabbly/WORKFLOWS.md`, `integrations/mods/RECOMMENDATIONS.md`, `wiki/ai-team/cross-functional.md`,
`wiki/ai-team/org-chart.md`, `.claude/skills/cos-daily-cycle`, `integrations/mac-task-specs.md` § 8b.

**Drafts only, everywhere.** No button, routine, mod or workflow sends to a client, quotes a rate, decides
eligibility, signs, spends, enters a credential or writes to a client-facing system. The HALT list is at the end.

## What `vanessaQueue` is — the one queue

`vanessaQueue` is a document in the Command Deck's `state` collection (`{v: ...}` like every doc). It is the single
intake for Vanessa: whatever anyone wants her team to do goes there, and nowhere else. Writers, all append-only
and pinned to the version they read:

| Writer | How |
|---|---|
| Deck buttons | "Hand to Vanessa" on kanban cards, lead rows and deal rows |
| Vanessa's chat card | her own `queue_task` tool |
| Claude Code | the `/queue <task>` mod (`push-buttons`) |
| The ISA Portal | the "Hand to Vanessa" box writes the portal's `vanessaOutbox`; the 6:25 cycle moves pending items in and marks them `moved` |
| Routines and skills | refi watch, sphere touches, review-request, open-house, meeting scribe, inbox triage — each adds its item with `from:` set |

An item carries at least `{task, priority (p1/p2), status (pending → done | needs-steven), from, ref, note}`
(the `refi-watch` skill's shape; other fields: see the routine prompt). The 6:25 AM cycle works the queue first,
marks each item done or needs-Steven with where the draft is, and folds the rest into the ≤3 "Needs you" lines.

## The daily schedule (Pacific time; `always-on/README.md`)

| When | What | Routine / task |
|---|---|---|
| 3:30 AM daily | 6D Brain rebuild + republish | `trig_01MQ7HRYTh27b8uUM4BtnFXE` |
| 6:05 AM weekdays | Transaction & Showing desk → `tcDesk` (timelines from `tcDeals`, due-in-7, overdue, drafts) | `trig_011iofWVNizNQ1SNujNcp5tL` |
| 6:25 AM weekdays | Vanessa's Chief-of-Staff cycle: `vanessaQueue` first, ≤8 pod squads in parallel → `cosBrief`, `twinQueue`, ISA `isaToday` | `trig_019whypw6EeNu2G8xxY5xE5N` |
| 6:34 AM daily | Morning brief across the three dashboards → push + `morningBrief {text, voiceScript}`, `morningBriefStatus` | `trig_01Q9VPMwrKwNUW3kZL54rKgy` |
| 6:40 AM daily (Mac) | iMessage text of that brief, then Vanessa's voice note on the same thread | Mac task `vanessa-morning-brief-text` + §8/§8b |
| 7:20 AM Mon | Refi watch prep list (`refi-review-prep.md`) | `trig_014ipr6x9z35psmtHJCPVqj1` |
| 7:40 AM, 11th monthly | Sphere & past-client touches (`sphere-nurture.md`) | `trig_01Pn8xLNKTVVFYjYTj8d8JTd` |
| 8:40 AM daily (15:40 UTC) | Freshness sweep, per-key cadence 8 d / 4 d / 80 h / 26 h | `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` |
| Sun 2:07 PM (21:07 UTC) | Weekly backup after the allowance reset; watchdog 4:41 PM | `trig_01JcPh3AM2z21Bsv34SvSkqM` |

Cloud routines carry no connectors on this account, so the text and the voice stay Mac-side. Budget after the
2026-10-22 cuts: about 133 runs a week (−34%); all 14 October failures were `USAGE_LIMIT_REACHED`
(`docs/ROUTINE-BUDGET-2026-10-22.md`). The Mac runner was frozen from 2026-10-13 until the paste below.

## The Command Deck push-buttons

| Button | Does | Writes |
|---|---|---|
| Run cycle | the Chief-of-Staff cycle now (same as `/cycle`) | `cosBrief`, `vanessaQueue`, `twinQueue` |
| Triage inbox | last 24 h of Gmail grouped; replies as Gmail **drafts**; fraud flags; Needs-Steven list | `inboxDesk`, drafts |
| Recap meetings | Fieldy + Zoom recaps, decisions, action items, one follow-up draft each | `inboxDesk.meetings`, `vanessaQueue` |
| Draft follow-ups | follow-up drafts for leads and deals due | `vanessaQueue`, drafts |
| Text me the brief | today's `morningBrief.text` to Steven's **own** mobile via Inkbox (number in localStorage only) | — |
| Hand to Vanessa | one row → one `vanessaQueue` item | `vanessaQueue` |

The inbox and meeting buttons use the page's own Gmail / Fieldy / Zoom / Inkbox connectors with the viewer's
sign-in, because routines cannot carry connectors here. "Today from Vanessa" shows `cosBrief`; the TC intake form
writes `tcDeals`. Deck version 224 and ISA Portal version 46 as of 2026-10-22 (`projects/command-deck.md`,
`projects/isa-portal.md`).

## Pods and gates (`wiki/ai-team/cross-functional.md`)

Eight standing pods wake together in one wave (≤8 seats, ≤4 web-research): **Deal** (Victor, Carmen, Showing
Coordinator, Harrison, Document Intake Clerk, Alexandra) · **Lead** · **Listing** · **Mortgage** (Harrison's
reports + Refi Watch Analyst) · **Growth** · **Money** · **Ops** (Derek, Elena, Elon, Nadia) · **Client Care**
(Sofia, Sphere Nurture Coordinator, Open House Captain, Wren, Victor, Alexandra). Gates run after the wave, never
inside it: **Alexandra** (any client / ad / disclosure draft) → **ECC** and **Validation** (any code change) →
**Vanessa** (one answer for Steven). Nadia and Elon only propose; a fraud smell goes to Elena before anyone replies.
`bin/brain route "<request>"` prints the plan with zero tokens; the seven desk seats are in `desk-seats.md`.

## The mods — one word each (`integrations/mods/RECOMMENDATIONS.md`, added 2026-10-22)

| Word | Does |
|---|---|
| `/cycle` | runs the Chief-of-Staff cycle in this session |
| `/inbox` | triages the last 24 h of Gmail — drafts only, fraud flags, Needs-Steven list |
| `/meetings` | recaps recent Fieldy and Zoom meetings with a follow-up draft each |
| `/today` | reads today's brief and lists what needs Steven |
| `/tc` | runs the Transaction & Showing desk |
| `/queue <task>` | appends one item to `vanessaQueue` |
| `/sync` | brings the Repo folder up to date (`scripts/repo-sync.sh`, never pushes) |
| `/connect` | previews `connect-all.sh` and says what is left |

Every prompt ends with the HALT line. `ops-pulse` adds the status line ("repo: 3 behind · /sync /cycle /today")
and a toast when GitHub is ahead. Both validated on Claude Code 2.1.308; seven of Steven's mods in all.

## Pabbly workflows 1–11 (`integrations/pabbly/WORKFLOWS.md`)

Vendor-to-vendor glue that runs on Pabbly, not on the Claude allowance. Steven clicks each together; off until
he does. 1 Lofty new lead → Gmail draft + Calendar task · 2 Zoho stage → Notion + Slack · 3 Calendar −60 min →
WhatsApp nudge (Steven's number) · 4 Gmail "Action" label → Notion + Slack · 5 Kapso inbound from Steven → Notion ·
6 Strava → Notion Health Log · 7 Closed / Funded → day 1 / 10 / 30 drafts (`post-close-care.md`) · 8 birthdays and
anniversaries → drafts + ISA list (`sphere-nurture.md`) · 9 open-house sign-in → Lofty lead + draft + ISA task
(`open-house.md`) · 10 voicemail email → Notion + ISA · 11 Kapso inbound from anyone else → Slack + Notion. The
custom Kapso app: triggers built as manual webhooks, send step waits on Steven's test number.

## The Mac paste (`docs/STEVEN-STEPS.md` "Start here (2026-10-22, evening)")

One Terminal line syncs the repo (and every 30 min after), restarts the frozen runner, keeps the Mac awake on the
charger, installs or checks Kapso, Gondola, Inkbox voice, Laya, Jarvis, Orca, AnyDesk and the seven mods. It never
signs in, pairs, sends or pays. Then: text `connect @vanessa-shearrill` to Vanessa's Inkbox line once; paste §8b
at the start and §8 at the end of `vanessa-morning-brief-text`; share the ISA Portal with the ISA.

## HALT (mirrors `CLAUDE.md`)

Never: send to a client · quote a rate · decide eligibility · negotiate, sign or lock · spend money · enter or
change a credential · write to Lofty, Zoho, a calendar invite or an email send · move client PII off the local
model · edit a live prompt, task or artifact outside an assigned region. Each becomes a Needs-Steven packet; the
cycle allows at most three a day.

## See also

`always-on/README.md` · `wiki/ai-team/cross-functional.md` · `wiki/ai-team/desk-seats.md` ·
`docs/AUTOMATION-MAP-2026-10-20.md` · `docs/ROUTINE-BUDGET-2026-10-22.md` · `integrations/pabbly/WORKFLOWS.md` ·
`integrations/mods/RECOMMENDATIONS.md` · `wiki/dashboard-ops/db-docs.md` (the docs named above).


---

<!-- source file: wiki/ai-team/second-brain-layers.md -->
# FILE: wiki/ai-team/second-brain-layers.md

# The second brain's layers — what lives where, how it syncs, how to tell it is even (2026-10-23)

Steven's rule (2026-10-23): "ensure all data syncs evenly across all layers — Notion, Google Drive, NotebookLM and
more". Even means **every layer is inside its own cadence**, measured from the stamp its own sync writes, never from
today's date. `bin/brain layers` prints the register; `bin/brain layers --write` rewrites `docs/reports/LAYERS.md`.

## One job per layer

| Layer | Job | Writes | Reads | Cadence |
|---|---|---|---|---|
| **Repo** (GitHub + both Macs) | the record: every page, rule, skill, script | Claude Code sessions, cloud routines, the Macs (never force) | everything else | continuous; Macs pull every 30 min |
| **Recall index** (`bin/brain`) | zero-token answers, level 1 | `bin/brain reindex` (daily rebuild, `connect-all` 6a2) | Vanessa, every session | daily |
| **Command Deck DB** | live operational state (queue, desks, briefs, lists) | routines, Mac tasks, deck buttons | the three dashboards, routines | continuous |
| **6D Brain page** | the map: every node and link, including the stores below | 3:30 AM PT rebuild + merge-live | Steven, the org chart | daily |
| **Jarvis** (Mac) | local recall over the vault, her voice; level 5 | `openjarvis` runner task, `jarvis-setup.sh` | Mac sessions only | 2 days |
| **Notion Second Brain** | operational memory: decisions, lessons, the layer directory | `brain-learn-daily`; the weekly sync refreshes the directory page | Steven, Vanessa (Notion MCP) | weekly |
| **Google Drive `SECOND BRAIN/`** | the shared knowledge layer and the off-GitHub redundant copy: 13 `SB` Google Docs + Steven's own folders (Inbox, Reference Sources, Approved Playbooks, Research Briefs, Decisions and Lessons, Archive) | weekly sync rewrites the 13 Docs; Steven drops originals in his folders | NotebookLM, Claude (Drive connector), Steven | weekly |
| **NotebookLM** | source-grounded research over the same Docs; level 4 when the repo and the Mac are unreachable | Google auto-syncs the Docs | Steven (and Claude, through a research brief he pastes) | follows Drive |
| Vector index · knowledge graph | high-volume corpora · relationships | spec only until a corpus is loaded | — | 30 days |

What flows where: **repo → index, 6D, Drive Docs → NotebookLM**; **deck DB → briefs → repo (cosBrief, memory)**;
**NotebookLM brief → Claude → Notion decision → repo `context/decisions.md`** (the approval gate: nothing an AI
produced becomes a "fact" in the repo without Steven's yes).

## Capabilities (2026-10-23)

- `bin/brain export notebooklm` — the pack (13 masked bundles, no client pages, the 6D map as text).
- `bin/brain layers [--write] [--json]` — the register above with last-sync stamps and verdicts.
- `bin/brain ingest claude-export <conversations.json>` — Steven's claude.ai chats (his words only, masked) → `memory/claude-chats.md`;
  the daily "Claude sessions ledger" task → `docs/inventory/claude-sessions.md` (every Claude Code session, title/date/status).
- `bin/brain links` — every front door with its URL (deck, ISA Portal, 6D, Action Desk, Bot Crew, repo, Drive SECOND BRAIN,
  NotebookLM, Notion database + layer directory, the 13 SB Docs). The 6D Brain embeds the same list: "Open the brain"
  panel, an open link per layer, and clickable store nodes (Drive, NotebookLM, Notion, Command Deck).
- Weekly sync task **NotebookLM mirror weekly sync** (Sun 2:45 PM PT, after the allowance reset): export → commit →
  rewrite changed Docs → stamp `drive-manifest.json` → refresh the Notion directory page → `layers --write`.
- CLAUDE.md recall level 4 and a routing row for the mirror; 6D store node `store:notebooklm`.
- NotebookLM notebooks (Steven's three, from his plan): **Mortgage Reference Library**, **AI Automation and VANESSA**,
  **Business Operating Playbooks** — which Doc goes in which is in `integrations/notebooklm/drive-manifest.json`.

## Rules

1. Client pages never leave the Mac and the repo's `wiki/clients/` (they are not in the pack, Drive or NotebookLM).
2. Drive writes are limited to `SECOND BRAIN/` (Steven's 2026-10-23 instruction); the rest of Drive stays read-only.
3. A NotebookLM answer is an intermediate: for anything licensed or consequential, read the page it cites.
4. State the age of every fact as the layer's own stamp. A stale layer says so (`bin/brain layers`).
5. The community NotebookLM MCP connector (`notebooklm-mcp-cli`) stays opt-in on the Mac: it stores browser session
   material; `integrations/notebooklm/README.md` has the gated steps if Steven chooses it.

## What "the most powerful second brain" means here, and what is next (2026-10-23)

Live now: zero-token recall (`bin/brain recall`, 1,257 sections), the 6D Brain with a Layers readout, one Vanessa queue
every dashboard writes, push-buttons, 46 skills, seven pods, two Macs on one schedule, Jarvis + Laya on-device, the brain
mirrored to Drive and NotebookLM with a weekly sync, Notion holding the layer directory, a validator gate on every code
change. Next, each one Steven's yes because it spends, signs in or installs: (1) Notion **Decisions** and **Actions**
databases fed by `context/decisions.md` and the Vanessa queue (approval gate stays); (2) the first vector-index corpus
(Fieldy transcripts, once recordings exist); (3) NotebookLM research briefs landing in `03 Research Briefs` and read by
`bin/brain ask`; (4) the community NotebookLM MCP on one Mac, non-sensitive notebook only; (5) a Drive copy of the 6D
page itself (redundancy of the map, not only the data). Each becomes a dated entry here when done.


---

<!-- source file: wiki/ai-team/third-party-packs.md -->
# FILE: wiki/ai-team/third-party-packs.md

# Third-party skills and tools — what was installed, held or declined (2026-10-11)

Steven asked for 18 repositories. Each was read before anything was installed; nothing was run from the cloud sandbox. Full table with the commit reviewed: `integrations/skill-packs/REGISTRY-2026-10-11.md`. Installer for the Mac: `bash integrations/skill-packs/install-mac.sh` (y/N each).

- **Installed through Claude Code plugins on the Mac, drafts only:** Instagram, LinkedIn and YouTube agent skills, vidIQ workflow skills, founder skills, arena, replica, `/watch` (claude-video). Owner for content: Sofia. Nothing posts or sends.
- **Already done:** the Codex plugin.
- **Optional:** superpowers (process skills; makes sessions slower and costlier).
- **Gated:** REA (reverse engineering) — Elena and Alexandra join every use. See `.claude/skills/reverse-engineering/SKILL.md`.
- **Media tools:** yt-dlp, ffmpeg, Whisper by Homebrew; Remotion held until its company licence is checked.
- **Held for Steven (account or spend):** Apify MCP, vidIQ MCP connection, claude-x-jev with OpenRouter.
- **Not installed, recommend no:** skool-mcp — it acts as Steven on Skool's private API using his login cookie, with no licence.
- **Reference only:** the two cporter202 API lists (links to Apify scrapers, no licence, promotional text treated as data).
- **Web scraping connector:** Ultimate Web Scraper (`ultimatewebscraper.com/claudemcp`) could not be reached from the sandbox, so it is unverified. Adding a claude.ai connector is an account change — Steven's step, Elena's review first; page text and sites it visits pass through the vendor.
- **Why not everything live:** every live skill's description costs tokens on every turn, so only lane-relevant packs are installed and the rest stay off.

## The 16-item list (2026-10-12)

Read, decided and pinned in `integrations/skill-packs/REGISTRY-2026-10-12.md`: install frontend-design (official), humanizer, marketingskills (drafts only); codex-plugin-cc already done; HOLD hyperframes, claude-seo, claude-for-legal, superpowers, alirezarezvani and rampstack libraries (cost or account decisions are Steven's); DECLINE gstack, caveman, notebooklm-skill, second-brain-starter, antfu/skills, financial-services. Installs run through `install-mac.sh` (go.sh step 6).

## The 32-item image (2026-10-12)

`integrations/skill-packs/REGISTRY-2026-10-12b.md`: 10 already yours (Slack, Notion, Context7, GitHub, Codex plugin, skill-creator, find-skills, karpathy, Playwright MCP, anthropics skills); 3 to install (same as the 16-list); HOLD wshobson/agents (cherry-pick), repomix (one-off), zapier, higgsfield; DECLINE oh-my-claudecode, vibe-kanban, claude-mem, firecrawl, github-mcp on the Mac, granola, kondo, perplexity.


---

<!-- source file: wiki/ai-team/tool-integration-status.md -->
# FILE: wiki/ai-team/tool-integration-status.md

# Tool & integration status

What is actually connected, installed, or merely proposed — read this before assuming a seat can do something because its description says so. Status categories follow `wiki/dashboard-ops/index.md`'s rule: a task existing is not a task running, and a connector existing is not a connector enabled.

## Connectors (claude.ai)

**Connected + enabled:** Gmail (read + drafts) · Google Calendar (read) · Notion · Slack (Patriot Pacific workspace, read-only) · Strava · Context7 · Inkbox (iMessage, email, Discord relay) · Google Docs/Sheets/Tasks · GitHub · YouTube · Discord · Magica (media).
**API-blocked, connection active:** Composio → Zoho CRM — every call returns 403 `NO_PERMISSION` until Steven enables "Zoho CRM API Access" on the connected profile.
**Mac only, live:** Lofty — `lofty-bridge` MCP + `lofty-cli`, no Composio toolkit; key in place and syncing since 2026-10-07 (54 leads). Speed to lead is not measurable yet: the bridge's lead list carries no lead id (`integrations/mac-fix-isa-kpi-2026-10-08.md`).
**Retired:** You.com (replaced by the Claude subscription's own search). **Never completed:** GoHighLevel.
**Not connected:** Canva (needs reconnect) · BlackRock Advisor Center · Health Data Avatar · Microsoft 365 · PlayMCP.

## Local MCP / bridges (Mac)

TradingView · Apple Health (+ apple-health-xml, health-export — the ingest daemon has gone unresponsive for stretches; check `runnerStatus` for current state) · Lofty (read-only) · notion-brain · OpenTerminal · OpenRouter (no API key) · ruflo (claude-flow) · API Nation · filesystem · fetch · memory · git. Plus the Plaid bridge (no keys) and Magica.

## Mac scheduled tasks and cloud routines

Both run under their own status doctrine — see `wiki/dashboard-ops/task-catalog.md` and `routine-catalog.md` for the current per-task/per-routine state. In short: the daily research cadence (weather/news, calendar, rates) is the layer that reliably holds; the weekly review/self-improvement layer is the one that has repeatedly failed and needs fixing first.

## Orca — proposed, not integrated

**Orca Computer Use v1.4.220 (Stably AI; Mac toolkit snapshot 2026-10-05, v1.4.203 on 09-16) is reported installed on the Mac as a standalone computer-use app — unverified from the cloud — NOT integrated with Claude Code.** The separate `stablyai/orca` parallel-worktree IDE is **not installed**. This is a **proposal only**: an "Anything/Orca computer-use executor" seat under Elon, for sites without an API, vetted by the CTO Innovator (and Elena, for security) before it becomes real. Do not report Orca as a working executor seat, and do not confuse the installed standalone app with the unbuilt IDE integration.

## Laya — proposed, not installed

**Laya** (`github.com/NandhaKishorM/laya`, Apache-2.0) is a local, non-autoregressive "System 1" decision model: typed choice/score/yes-no answers in a single forward pass, roughly 33 ms on GPU, with an MCP server available via `pip install "laya[mcp]"`. It is **proposed** as the brain's zero-token router/ingest classifier under Derek — a fast local pre-filter ahead of a full LLM call — and is **not yet installed on the Mac**. Treat any mention of Laya doing live routing today as wrong until this status changes.

## 77skills.ai — proposed, not purchased

**77skills.ai** is a paid ($77) pack of 77 business skills delivered as markdown/`SKILL.md` files. It is **not purchased and not installed**. The intended import path is a skill-pack importer being built at `integrations/skill-packs/`, with an **ECC security review required before anything from the pack is enabled** — a purchase decision alone does not clear that gate.

## Skills actually in the repo today

Three skills Steven asked for exist as `SKILL.md` files in this repo's `.claude/skills/`: **interview-me**, **prompt-master**, **skills-refresh**. Installing them onto each Mac is the job of `scripts/brain-sync.sh` (being written by another agent, not yet confirmed run) — a skill existing in this repo is not the same as it being live on Steven's Mac until that script has actually run there.

## See also

- `wiki/ai-team/org-chart.md` — which seat each connector or bridge belongs to.
- `wiki/ai-team/model-tiering-dispatch.md` — the ECC review gate every proposal above must clear.
- `wiki/dashboard-ops/task-catalog.md` / `routine-catalog.md` — live status detail for the tasks and routines mentioned here.

Source: Command Deck, "Connectors / Local MCP / Mac tasks / Cloud routines / Skills / Agents" toolbox card (`AI_TEAM_TOOLBOX`) for the connector/bridge/task/routine sections. The Orca/Laya/77skills/repo-skills statuses are Steven's own stated facts about tools outside the deck's current toolbox card, recorded here for the first time — not yet cross-checked against the deck itself.

*Updated 2026-10-08: Perplexity removed (2026-10-05); Lofty live; browser-use and OpenDesign proven in the cloud, Mac install pending (`integrations/browser-use/`, `integrations/open-design/`).*

## API Anything — websites as read-only APIs

**API Anything** (added 2026-10-08, `integrations/api-anything/`): turns a website into read-only operations Claude calls over plain HTTP (MCP server `api-anything`: list_sites, list_operations, call_operation, login). Proven in the cloud; Mac install is one command. Site connections run on the Mac (`integrations/api-anything/mac-connect-sites-2026-10-09.md`): FRED and Freddie Mac PMMS now; Redfin, lender, builder and homes.com pages only after Steven's terms-of-service yes per group; never ShowingTime, Showami, SkySlope or zipForms (client data). Owner Derek; risk owner Elena.

## Remote control — both Macs, Claude sessions and Orca (2026-10-09)

Steven asked for remote control of his two Macs ("this computer" and the other) from his dashboard. Built, tested against stubs, **not yet run on a Mac**:
- **Claude sessions:** `integrations/remote-control/rc-agent.sh` keeps one `claude remote-control` server running per Mac (LaunchAgent, asks first, no poller, needs the claude.ai subscription login; an API key or gateway blocks it). Claude Desktop sessions join the same list through `/remote-control` in its Code tab. Remote Control steers sessions; it does not click the Desktop window.
- **Orca:** `integrations/remote-control/orca-remote.sh` wraps Orca's own `orca serve` / `orca environment add`. A pairing link is a secret equal to control of that Mac's agents: pair only over his own network, never store it, never grant desktop control.
- **Dashboard:** the Command Deck Toolkit tab has a "Remote control" card. It cannot reach the Macs; it shows what Steven pastes from each Mac's `report` line, with its age, and refuses pairing links. Org chart: Derek's team has a "Remote Control" lane (Sam).
- **Failover:** `claude-auto --doctor` and `install-failover.sh` (integrations/omniroute-failover) diagnose and fix why OmniRoute does not take over at the Claude limit.
- **Keep going (2026-10-09):** `claude-auto --keep-going` — Steven's own sessions continue on OmniRoute's free models at the Claude limit (type `/exit`, press Enter) and go back to Claude once it resets, same conversation. Client data never goes free. Built and tested here (265 failover checks); not yet run on the Mac. Owner: Integration Engineer under Elon; security gate Elena.
- **Wave 2 (2026-10-11):** (1) **Computer Hub** — Panel 40 on the Command Deck; Alienware installer `integrations/alienware/alienware-setup.ps1` (Orca, Laya, Bonsai 2 27B, optional Ollama/AnyDesk/Tailscale; lint-clean, never run on Windows); AnyDesk deep-link tool `integrations/anydesk/` (no passwords stored). (2) **Trading Research Desk** — `integrations/trading-desk/` (85 tests pass, paper only, no broker code), Panel 41. (3) **Loan task agents** — tax assessor (San Diego & Riverside public records) and loan pricing prep skills; `integrations/loan-stack/CONNECTIONS.md` lists ARIVE, Zoho, Lofty, SkySlope, Dotloop, Ticor and county records with what Steven must do (accounts and credentials are HALT items; ARIVE API terms unverified). (4) **Events scout** — `integrations/events/` (36 sources, 34 tests; the cloud sandbox could reach none of them, so the first real scan must run on a machine with internet). (5) **Third-party packs** — registry and Mac installer in `integrations/skill-packs/`; the permission checker blocked importing third-party skills into the repo, so they install on the Mac by Steven's hand. (6) **Reverse engineering** — gated skill for REA. (7) Dashboard motion layer and new org-chart nodes spliced into the Command Deck.
- **Browser control + skill discovery (2026-10-10):** `agent-browser` (Vercel, CLI 0.39.0) and Microsoft's Playwright MCP (0.0.83, 25 browser tools) let Claude Code and Claude Desktop open websites, read them, fill forms and click for Steven; `find-skills` + `npx skills find <topic>` find a skill for whatever he is doing; `web-design-guidelines` (deck/portal UI review) and `writing-guidelines` (copy review) vendored from vercel-labs/agent-skills. Skills are in `.claude/skills/`; the Mac installer is `integrations/browser-agents/install.sh` (asks y/N each step, ends with a browser self-test). Tested in the cloud sandbox (fill + click + read PASS; MCP lists 25 tools); not yet installed on the Mac. agenticskills.io does not resolve — nothing installed from it. Guardrails: stop before submit/send/pay/sign, never type a password, CRM sites read-only. Owner: Integration Engineer; Elena gates; every seat may use them through Vanessa. See `integrations/browser-agents/README.md`. **In the weekly loop (2026-10-10):** step 2c of `loop-engineering` (and step 5b of the Sunday 1:05 PM cloud routine) uses all four — find-skills once per open gap, agent-browser to dogfood the Command Deck and ISA Portal read-only, web-design-guidelines on the deck/portal HTML, writing-guidelines on the weekly brief; `skills-refresh` step 5b checks they are installed and pinned; the scout watches their releases for upgrades.
- **Weekly scout (2026-10-09):** `integrations/scout/scout.py` scans GitHub (new/rising repos: MCP servers, Claude Code plugins, skills, hooks, agent CLIs, memory, real-estate/mortgage/CRM APIs), releases of tools already in the stack, the official MCP registry, npm and Hacker News for the last 7 days; scores each for fit with Steven's stack, tags its owner seat, marks NEW, writes `docs/reports/SCOUT.md`. Runs free in the GitHub `scout` workflow (Sat 06:23 UTC) and as step 2b of the weekly loop; Disruption Scout → Nadia grades → Elon gates → Steven approves. Proposal only — installs nothing. First run 2026-10-09 in the cloud sandbox: MCP registry and npm reached (1,051 items, 454 relevant); GitHub and Hacker News are blocked from this sandbox and run in the GitHub workflow and on the Mac.
- **Dispatch planner (2026-10-09):** `bin/brain route "<request>"` turns a request into the org chart's parallel plan — lead seat, seats that join, waves of ≤8, gates (Alexandra, ECC, Vanessa last), HALTs. Rules live in `wiki/ai-team/cross-functional.md`; self-tested by `bin/brain loop`.

## context.dev and the AI Replica Studio (2026-10-09)
- **context.dev** (web scraping, brand intelligence, structured web data) is connected through Composio (account added 2026-10-09). A read-only brand search proved it that day; the free allowance showed 1,000 credits, 1 used. Owner: Sofia (marketing) for brand look-ups; Integration lane for the connection. Rule: public/brand data only, never client data.
- **AI Replica Studio** is a *plan*, not a system yet: `integrations/ai-replica-studio/PLAN.md`. Weekly real-estate and loan-officer videos of Steven's avatar, scripts by the Marketing Agent, compliance read by Alexandra, Steven approves every video, scheduled posting through the connected Facebook / Instagram / LinkedIn / YouTube accounts. Avatar provider and voice are Steven's decisions; he records his own consent and samples.

## Added 2026-10-12 (cloud-built, not yet run on a Mac)

| Item | Status | Where |
|---|---|---|
| OpenStock market viewer (AGPL) | installer + Panel 41 card published (deck v190); loopback only; needs Steven's free Finnhub key | `integrations/openstock/` |
| n8n workflow library (2,061, MIT) | read-only catalog + gated inactive staging; 1,013 with no unsafe flag; nothing activated | `integrations/n8n/WORKFLOW-LIBRARY.md` |
| Agent files for Orca / Claude Code | 172 generated, linked by `install-mac.sh` (never overwrites); `claude --agent <seat>` on any machine | `integrations/agent-os/agents/` |
| setup-health CI | green since run #19 (shellcheck + buffered-output fixes) | `.github/workflows/setup-health.yml` |

## WhatsApp — Kapso (2026-10-13)

Installed by `go.sh` step 11 (`integrations/kapso/install-mac.sh`): Kapso plugin + user-scope MCP `kapso` for every Claude Code session, Orca included. Status: **installed on the next go.sh run, sign-in needed** (Steven: `claude` → `/mcp` → kapso). Phase 1 = sandbox number + Steven's phone; Phase 2 (business number, clients) = Needs-Steven packet. Deck card "WhatsApp — Kapso" reads `whatsappKapso`, written by the `kapso-inbox-sync` task (spec §5b); replies live in any session or unattended by `vanessa-whatsapp-inbox` (§5c, Kapso mode: reads only Steven's number, sends only to it). Rules: `.claude/skills/whatsapp-kapso`.


---

<!-- source file: wiki/ai-team/toolkit.md -->
# FILE: wiki/ai-team/toolkit.md

# AI Team toolkit — skills, plugins, connectors, routines, Mac tasks per seat

Generated by `bin/brain toolkit --write` from the tree (zero tokens). Each item sits under the seat whose lane
claims it; the status words come from `integrations/CONNECTIONS.md` (connectors), `docs/inventory/cloud-routines*.md`
(routines) and `docs/inventory/mac-task-descriptions.md` (Mac tasks). Edit those sources, not this page.

## Counts

toolkit: 46 skills · 7 plugins · 12 connectors (2 ok, 10 need attention) · 65 cloud routines · 60 Mac tasks

## Vanessa — Chief of Staff / orchestrator

**Skills**
- `cos-daily-cycle`: Vanessa's Chief-of-Staff daily cycle, run on demand in an attended session (the cloud routine runs it weekdays 6:25 AM PT): read the backlog, sort every item into Automation / AI team / ISA-EA / Steven, dispatch up to 8 
- `find-skills`: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used w
- `interview-me`: The relentless 'Grill Me' interview: pulls what only Steven knows about one named topic out of his head and files it as structured knowledge — a vault 60-Knowledge note plus knowledge-graph entity stubs, with sensitive i
- `loop-engineering`: The weekly self-improvement cycle (v2): every agent, skill and routine gets a Goal, a Loop and a Routine; changes are proposed, tested against an untouched holdout, compared, then promoted or rejected and logged; trust g
- `prompt-master`: Once per loop cycle, reviews the orchestrator's and the executives' system prompts against measured outcomes — runs, failures, rework, escalations — and proposes at most five prompt diffs through the weekly-self-update h
- `skills-refresh`: Weekly audit of every installed skill against the Command Deck's AI Team toolkit table: frontmatter that will not load, dead paths, duplicates, and skills the dashboard advertises but the machine does not have. Reports o
- `vanessa-orchestrator`: Vanessa as orchestrator (v2): C-Suite delegation and parallel execution — intake, decompose, delegate, run up to 8 agents concurrently, resolve conflicts, QA, consolidate, report. Use when a request spans more than one e
- `whatsapp-kapso`: Read and answer WhatsApp through Kapso (WhatsApp Business Cloud API; MCP server "kapso" registered for every Claude Code session, Orca included) — Phase 1 is the sandbox number and Steven's own phone only. Use when Steve

**Plugins (Claude Code mods)**
- `ops-pulse`: At session start in the Repo folder: one read-only status line (behind/ahead of GitHub, local edits, brain-loop age, connect-all today) and a toast when it is time to /sync.
- `push-buttons`: One-word slash commands (/cycle /inbox /meetings /sync /connect /tc /queue /today /help-buttons) that send the full, correct prompt for each workflow, HALT rules included.

**Connectors**
- `Inkbox iMessage line` — *ok*: connected — no phone linked yet

**Cloud routines**
- `Vanessa — Chief of Staff daily cycle (weekdays 6:25 AM PT, parallel squads)`: cron CRON_TZ=America/Los_Angeles 25 6 * * 1-5 · on · —
- `Vanessa — morning brief across the dashboards (6:34 AM PT; push + writes the iMessage/voice script)`: cron CRON_TZ=America/Los_Angeles 34 6 * * * · on · SUCCEEDED @ 2026-10-22T13:49 (as the 6:4
- `Command Deck & ISA Portal Weekly Loop Engineering QA`: cron 0 16 * * 0 · on · FAILED @ 2026-09-20T16:06
- `Command Deck — Vanessa orchestrated ops review (C-suite in parallel, Fri 4 PM PT)`: cron 0 23 * * 5 · on · FAILED @ 2026-09-18T23:03
- `Command Deck — weekly improvement loop (research → apply)`: cron 0 16 * * 0 · on · FAILED @ 2026-09-20T16:06
- `Command Deck — weekly self-improvement loop`: cron 0 15 * * 0 · on · FAILED @ 2026-09-20T15:08

**Mac tasks**
- `brain-deck-sync`: Copies every Second Brain row (name, summary, type, status, tags, link) from Notion into the Command Deck's secondBrain doc so Vanessa, Stev
- `loop-engineering-weekly`: The full self-improvement cycle: nine parallel audit passes, Nadia's disruption brief, the CTO Innovator's feasibility gate, the CPI and Sca
- `r6-weekly-backup`: Exports both dashboard stores, a redacted copy of the Claude configuration, and the latest audit findings table + loop report to a dated fol
- `skills-refresh-weekly`: Sundays 7:00 AM - audits every SKILL.md on this Mac (skills, scheduled tasks, plugin skills) for frontmatter that will not load, dead paths,
- `vanessa-discord-inbox`: Answers Discord questions queued by the local bot, as Vanessa with full deck and agent access, and posts replies back through the same bot.
- `vanessa-imessage-inbox`: Polls Inkbox for inbound iMessages from Steven, answers as Vanessa using the AI team, replies on the same thread, and logs to the Command De
- `vanessa-morning-brief-text`: Texts Steven a short morning brief as Vanessa, delivered over the Inkbox iMessage channel, composed from the Command Deck's real documents.
- `vanessa-ops-review`: Fridays: Vanessa orchestrates Victor, Marcus, Derek and Elena in parallel, plus one rotating deep-dive seat, writes the brief and decisions 
- `vanessa-research-queue`: Reads the Command Deck's vanessaResearch document, researches every queued question with Perplexity and the AI team, and writes the answers 
- `vanessa-significant-alerts`: Texts Steven only genuinely significant new items as Vanessa — money at risk, a deadline inside 48h, client/licence exposure, or a security 
- `vanessa-sweep`: Vanessa's local queue sweep, three times a day, weekdays — the same operating rhythm as the Steve twin's sweep, but for orchestration-sized 
- `voice-reply-render`: Reads the Command Deck's voiceReplyQueue, renders each new Vanessa or Steve chat reply in that persona's own voice with Magica Seed Audio (f

## Steve — Digital twin

**Cloud routines**
- `AI twin autopilot (posts only approved items)`: cron CRON_TZ=America/Los_Angeles 57 7 * * * · on · SUCCEEDED @ 2026-10-20T14:58
- `Command Deck — Steve twin (works the twin queue, writes the brief)`: cron 0 0,13,19 * * * · off · ABANDONED @ 2026-09-09T00:06

**Mac tasks**
- `r1-morning-brief`: One merged morning brief: calendar, ISA line, alerts, overnight leads, twin prep, top 3 decisions. Writes twinBrief and pushes to the phone.
- `steve-twin-sweep`: Runs Steven's digital twin locally three times each weekday: works the Command Deck twin queue by tier, does the standing prep/content work,
- `weekly-self-update`: Friday 4 PM audit of what ran this week across routines, desktop tasks, the twin, agents and feeds; writes ≤5 improvement proposals with hum

## Kevin — Standards mentor

**Skills**
- `kevin-mentor`: Kevin, Steven's standalone Standards Mentor persona (personal development, the 11-Dimension Wealth framework) with his own chat card on the Command Deck. Use whenever Steven addresses Kevin directly, or asks for a progre

## Apex — Trade mentor

**Skills**
- `apex-trade-journal`: Apex's one seat tool: a Notion-backed paper-trade journal — log an NQ/ES idea, its thesis, levels, outcome and the lesson, and read back the stats — never an order, never a broker connection, paper only. Use when Steven 

## James — Wealth mentor

**Skills**
- `james-portfolio-read`: James's one seat tool: read Vanguard Advisor Tools get_model_portfolios (read-only) to describe model allocations when Steven asks how a family-office style portfolio is built — education and comparison only, never a rec

## Maxwell — Broker coach

**Mac tasks**
- `coach-weekly-recs`: Monday 7 AM: Maxwell, the broker mentor & coach, reviews the week's pipeline, showings, lead triage, ISA scorecard, kanban and licenses, and

## Alexandra — CCO — compliance

**Skills**
- `web-design-guidelines`: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
- `writing-guidelines`: Review docs/prose for Writing Guidelines compliance. Use when asked to "review my docs", "check writing style", "audit prose", "review docs voice and tone", or "check this page against the writing handbook".

**Cloud routines**
- `R16 — Monthly marketing compliance sweep (Alexandra)`: cron 0 16 1 * * · on · SUCCEEDED @ 2026-09-13T23:45

**Mac tasks**
- `r14-content-pipeline`: Drafts the day's post, runs the compliance pass and queues it — moved to 5:45 AM so the draft is waiting before the day starts, and so it la

## Elena — CISO — security

**Skills**
- `security-and-hardening`: Hardens code against vulnerabilities. Use when auditing an input handler for vulnerabilities, when handling user input, authentication, data storage, or external integrations, or when checking a login flow is safe agains

**Mac tasks**
- `access-audit-monthly`: First business morning of the month: Elena's access-auditor reviews who and what can read or write each store and connector, plaintext-secre

## Marcus — CFO — money

**Skills**
- `tax-assessor-agent`: Property tax lookup for San Diego and Riverside County: reads PUBLIC assessor and tax-collector pages with read-only browser tools and writes a one-page Property Tax Sheet (APN, assessed values, exemptions to verify, Pro

**Cloud routines**
- `Command Deck — Property Search & Tax-Data integrations health check (monthly)`: cron 0 15 1 * * · on · SUCCEEDED @ 2026-09-04T19:42

**Mac tasks**
- `month-end-close-prep`: On the 28th: Marcus's bookkeeper drafts the month-end close checklist from the dashboard's accounts, liabilities, income and (if present) Pl
- `r7-plaid-balances`: Bank balances twice daily instead of every 6 hours. Balances settle overnight, so four runs a day bought nothing, and two of the four fell o
- `revenue-scan-weekly`: Sunday: runs the four opportunity agents in parallel — refinance hunter, realtor reciprocity, predictive seller intelligence and borrower re

## Sofia — CMO — marketing

**Skills**
- `listing-launch`: Prepare a listing launch for a seller Steven has signed: the launch checklist, MLS public and private remarks drafts, Canva flyer and social-post drafts, and the seller weekly-report template — marketing drafts only, not
- `openmontage-video`: Make a marketing, explainer or training video with OpenMontage on the Mac (~/Applications/OpenMontage) — Sofia's brief, Claude Code runs the pipeline, Steven approves every creative stop, nothing is posted. Use when Stev
- `past-client-nurture`: Monthly sphere-touch marketing drafts for Steven's past clients from reClients and pipeline — a local market note, home-purchase anniversaries and birthdays, and a plain check-in — as Gmail drafts plus the three template

**Cloud routines**
- `VA Command Center — weekly avatar content drafts`: cron CRON_TZ=America/Los_Angeles 58 14 * * 0 · on · SUCCEEDED @ 2026-10-18T21:58
- `Command Deck — Weekly content edit reminder`: cron 0 15 * * 1 · on · SUCCEEDED @ 2026-09-21T15:03
- `Content Calendar Review`: cron 0 15 * * 1 · on · SUCCEEDED @ 2026-09-21T15:06
- `SEO Content Gap Audit`: cron 0 17 1 * * · on · @
- `Social Calendar Planning`: cron 30 15 * * 1 · on · SUCCEEDED @ 2026-09-21T15:31

## Victor — CRO — revenue

**Skills**
- `cli-anything-connectors`: Install CLI-Anything on the Mac and the seven pre-built, read-only agent-native CLI wrappers for the real-estate tools that have no usable API — homes.com, ShowingTime, Showami, SkySlope, zipForms/Lone Wolf — plus the Lo
- `lofty-crm-sync`: Sync Lofty (formerly Chime), Steven's real-estate CRM since 2026-09-22, into the Command Deck — writes the loftyLeads doc (stage totals, 90-day new leads, speed-to-lead) and points the lead-triage / lead-response / ISA-K
- `meeting-recap-to-crm`: Turn a recorded client or partner meeting (Fieldy pendant, Zoom for Claude) into a recap — decisions, action items, a follow-up Gmail draft and a CRM note queued on the deck for the ISA to paste into Lofty or Zoho. Draft
- `open-house-follow-up`: After an open house: read the sign-in sheet (Google Forms export or a Drive sheet), build the lead list with first names and interest level, draft the thank-you emails as Gmail drafts, and write the ISA call list — plus 
- `pabbly-workflows`: Build and run Pabbly Connect automations for Steven's operation: the six built-in-app workflows (Lofty, Zoho, Gmail, Google Calendar, Notion, Slack, Strava) he clicks together in Pabbly's editor, and the custom Kapso Wha
- `refi-watch`: Compare the market-average rate in ratesSnapshot with the note rates on a past-client list Steven supplies (he types each client's rate — the skill reads no loan file) and prep the pipeline list of who is worth a convers
- `review-request`: After a Lofty close or a Zoho funding: draft the three post-close emails — day-1 thank-you, day-10 review request with Google and Zillow link placeholders, day-30 check-in — as Gmail drafts, with the timing rules and the
- `tc-doc-intake`: Read a purchase contract, counter, addendum or disclosure package (Google Drive file or Gmail attachment) and pull the dates into the deal's tcDeals entry for the Transaction & Showing desk — acceptance, deposit, inspect
- `voicemail-to-lead`: Transcribe a voicemail (a recording link Steven or the carrier email provides) with WhisperAI transcribe_url, summarise who called about what, and queue a lead-triage item on the deck for Victor's ISA line — no callback,
- `zoho-crm-sync`: Sync Zoho CRM — Steven's system of record for the mortgage pipeline — into the Command Deck through Composio: writes zohoSync (connection health), zohoLeads (14-stage kanban) and zohoDeals. Self-tests first and reports t

**Connectors**
- `Zoho CRM (Composio)` — *attention*: 403 NO_PERMISSION until the API box is ticked

**Cloud routines**
- `Transaction & Showing desk — TC + showing assistant (weekdays 6:05 AM PT, before the cycle)`: cron CRON_TZ=America/Los_Angeles 5 6 * * 1-5 · on · SUCCEEDED @ 2026-10-22T14:10
- `Command Deck ↔ ISA Portal drift check (2x/day)`: cron 0 2,14 * * * · on · SUCCEEDED @ 2026-09-22T02:05
- `Command Deck ↔ ISA Portal — Pipeline Sync`: cron 0 1,7,13,19 * * * · on · SUCCEEDED @ 2026-09-22T07:08
- `Command Deck ↔ ISA Portal comms bridge (hourly)`: cron 7 * * * * · off · SUCCEEDED @ 2026-09-09T02:07

**Mac tasks**
- `isa-comms-bridge-local`: Merges the shared message thread both ways. Narrowed from 24 hours to 7 AM–9 PM: the ISA works 12–4 PM, so overnight runs moved no messages 
- `lead-triage-daily`: Must read **Lofty** for the last 24 hours of leads, measure first-response gaps against the 5-minute standard, and list leads needing a next task. **Not connected yet** — needs `LOFTY_API_KEY` in `~/.
- `r11-isa-kpi-compile`: Turns **Lofty** events into real KPI actuals on the ISA Portal: median first response, share of leads with a next task, overdue tasks. **Not connected yet** — needs `LOFTY_API_KEY` in `~/.config/lofty
- `r13-appointment-prep`: About an hour before each meeting, pushes a one-page brief: who they are, CRM history, last touch, open items, three questions to ask.
- `r2-lead-response-watchdog`: Flags **Lofty** leads with no logged first contact against the 5-minute SLA, posts Urgent to the ISA line, escalates to Steven past 15 minutes. **Not connected yet** — needs `LOFTY_API_KEY` in `~/.con
- `r3-eod-rollup`: End-of-day roll-up and ISA nudge, moved to 10:20 PM: inside the app's real uptime window, and late enough to see the ISA's whole 12–4 shift 
- `showing-sync`: Works the Command Deck showing sync queue three times a day: creates calendar events and **Lofty** appointments for confirmed showings. **Not connected yet** — needs `LOFTY_API_KEY` in `~/.config/loft

## Elon — CTO Innovator — engineering team

**Skills**
- `continuous-process-improvement`: The CPI engine (v2): a cheap daily OBSERVE/IDENTIFY scan and a weekly deep RECOMMEND/IMPLANT/MEASURE pass that turns observed friction in Steven's operation into logged, measured improvements. Low-risk, high-confidence f
- `scale-growth-engine`: Weekly ADR pass — Automate, Delegate, Replicate — that finds what is capping Steven's capacity and converts it into logged, measured capacity: automate anything that must survive 5x/10x volume, delegate with a named rece
- `stress-test-sweep`: Structured stress sweep of the Command Deck and the automation layer — Volume, Edge, FailureInjection, Concurrency and BackupRecovery — that finds where things break under load or bad data, routes each weakness to the Re

**Mac tasks**
- `automation-audit-weekly`: Weekly seven-phase audit-and-remediate pass driven by the chief-automation-strategist agent, including the AI Agent Engineering Team stress-
- `cpi-daily-scan`: Cheap daily OBSERVE + IDENTIFY pass — no subagents. Logs new, specific automation opportunities to the CPI Opportunity Log for Saturday's de

## Nadia — CAIO — AI strategy

**Skills**
- `nadia-scout-run`: Nadia's one seat tool: run the weekly scout (integrations/scout/scout.py) for what is new in AI tooling that could help Steven's operation — MCP servers, Claude Code plugins, agent CLIs, real-estate and mortgage APIs — t

## Derek — CTO — automation & integrations

**Skills**
- `agent-browser`: Browser automation CLI (Chrome via accessibility snapshots). Use to open websites, read pages, fill forms, click, take screenshots and extract data, test web apps, or drive Electron apps. Stops before any submit, send, p
- `ai-ecosystem-backup`: Weekly full backup of Steven's AI ecosystem (v2): both artifact stores, the redacted Claude Desktop configuration, the Master Findings Table and the latest Weekly Report, into Documents/AI-Ecosystem-Backups/YYYY-MM-DD, w
- `apple-design`: Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible tran
- `apple-health-notion`: Keep Steven's Command Deck Apple Health tiles alive through the phone instead of the dead Mac ingest daemon — Claude iOS reads Apple Health, writes a Notion Health Log row, and the health-notion-sync Mac task turns those
- `code-review-and-quality`: Conducts multi-axis code review. Use before merging any change. Use when reviewing code written by yourself, another agent, or a human. Use when you need to assess code quality across multiple dimensions before it enters
- `code-validation-gate`: The rule that code is not done until a different agent has validated it — deterministic checks (scripts/validate-code.sh) plus the VibeBreaker 20-pass adversarial review by the code-validator agent, recorded per change-s
- `connection-doctor`: Answer 'what is not connected?' and 'what do I paste?' without burning tokens: run bin/brain toolkit for every connector's live status and fix, bin/brain owner for who keeps a panel alive, then hand Steven the one Termin
- `debugging-and-error-recovery`: Guides systematic root-cause debugging. Use when tests fail, builds break, something that worked yesterday broke, behavior doesn't match expectations, or you encounter any unexpected error. Use when you need to figure ou
- `documentation-and-adrs`: Records decisions and documentation. Use when you need to document an architecture decision (ADR) or the reasoning behind a design choice, when changing public APIs, shipping features, or when you need to record context 
- `git-workflow-and-versioning`: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, splitting uncommitted work in a messy working tree into clean atomic commits, opening or reviewing 
- `karpathy-coding-principles`: Andrej Karpathy's four behavioral guidelines for LLM coding — think before coding, simplicity first, surgical changes, goal-driven execution. Use when writing or editing any code, skill, task spec or Command Deck HTML in
- `loan-pricing-agent`: Loan scenario and pricing PREP: builds the worksheet from facts Steven supplies, computes P&I, PITI, LTV and DTI with visible formulas, compares VA/FHA/conventional/jumbo/non-QM structures. Never quotes a rate, decides e
- `reverse-engineering`: Reverse-engineering capability (REA) — gated. Describes morluto/rea (MIT, MCP server via npx rea-agents setup, 6.x) and the rules for when Steven's agents may use it and when not. Use when a seat proposes analysing a bin
- `source-driven-development`: Grounds every implementation decision in official documentation. Use when you want to verify an approach against the official docs before implementing it, or when you want authoritative, source-cited code free from outda

**Plugins (Claude Code mods)**
- `brain-reflect`: /remember saves a standing rule into the second brain (bin/brain remember), refusing contact details and numbers.
- `connection-beacon`: Status line with how many connections need Steven; /connections lists them with the fix; /owner <panel> says who keeps a Command Deck panel alive.
- `halt-guard`: Proceed/Cancel before sends, shares, payments and force pushes (HALT list), when someone is at the keyboard.
- `paste-desk`: /paste shows the one Terminal line that reconnects this Mac and the short list only Steven can do, straight from docs/STEVEN-STEPS.md.
- `route-beacon`: Shows which AI route this session is on and toasts when the failover switches.

**Connectors**
- `NotebookLM "2nd brain" notebook sources` — *ok*: connected — connector signed in (5 notebooks); the SB Docs are not yet attached as sources
- `Kapso (Mac 1)` — *attention*: plugin + MCP registered; ! Needs authentication
- `Kapso webhooks (Pabbly → Kapso)` — *attention*: two trigger URLs not pasted yet
- `Gondola (claude.ai)` — *attention*: Claude Code MCP registered; custom connector still his
- `Orca pairing · AnyDesk permissions` — *attention*: apps installed on both Macs
- `Mac 2` — *attention*: Python 3.12 (uv), Claude Code 2.1.309, mods, Agent OS, brain index, Orca, AnyDesk, Gondola done; Laya + Jarvis engine unproven (last REPORT not pasted)
- `EVRoutes · Turo` — *reconnect*: needs_reconnect
- `Four http_api Sunday routines` — *attention*: still enabled
- `GitHub repo visibility` — *attention*: public
- `Notion `brain-learn-daily` rows` — *attention*: resume with Mac 1's runner (signed in 2026-10-23); directory page written 2026-10-23

**Cloud routines**
- `Command Deck — daily freshness sweep (writer, Claude; once a day since 2026-10-22, per-key cadence)`: cron 40 15 * * * · on · SUCCEEDED @ 2026-10-20T15:40
- `Command Deck — morning feeds (writer, Claude)`: cron 5 13 * * * · on · SUCCEEDED @ 2026-10-20T13:08
- `Command Deck — market close (writer, Claude)`: cron 20 21 * * 1-5 · on · SUCCEEDED @ 2026-10-19T21:20
- `Scrape queue runner`: cron CRON_TZ=America/Los_Angeles 7 9 * * * · on · SUCCEEDED @ 2026-10-19T16:08
- `Attraction Command Center: daily cloud run`: cron CRON_TZ=America/Los_Angeles 40 6 * * 1-5 · on · SUCCEEDED @ 2026-10-20T13:40
- `RoleCompass daily job hunt (v4)`: cron CRON_TZ=America/Los_Angeles 40 6 * * * · on · SUCCEEDED @ 2026-10-20T13:40
- `Refi watch — weekly prep list (Mon 7:20 AM PT, drafts only)`: cron CRON_TZ=America/Los_Angeles 20 7 * * 1 · on · —
- `Sphere & past-client touches — monthly drafts (day 11, 7:40 AM PT, drafts only)`: cron CRON_TZ=America/Los_Angeles 40 7 11 * * · on · —
- `Weekly ecosystem backup — cloud writer (Sunday, after the allowance reset)`: cron 7 21 * * 0 · on · SUCCEEDED @ 2026-10-22T14:16 (catch-up)
- `6D Brain — daily rebuild and republish (3:30 AM PT, this session)`: cron CRON_TZ=America/Los_Angeles 30 3 * * * · on · —
- `Account Health Check`: cron 0 17 * * 1 · on · SUCCEEDED @ 2026-09-21T17:09
- `Books Reconciliation Reminder`: cron 0 22 * * 5 · on · FAILED @ 2026-09-18T22:01
- `Command Deck Brief`: cron 45 13 * * * · on · SUCCEEDED @ 2026-09-21T13:45
- `Command Deck — AI Hedge Fund Team remote run (reads the ticker requested on the dashboard)`: cron 0 12 * * 1 · on · SUCCEEDED @ 2026-09-21T12:05
- `Command Deck — Econoday calendar refresh`: cron 45 12 * * * · on · SUCCEEDED @ 2026-09-21T12:46
- `Command Deck — Elite Affluent Tracker weekly refresh`: cron 0 16 * * 0 · on · FAILED @ 2026-09-20T16:09
- `Command Deck — Elite Rewards-Optimization Scan`: cron 0 13 * * * · on · SUCCEEDED @ 2026-09-21T13:18
- `Command Deck — FERS engine + federal salary calculator annual refresh (GS/58 localities/VA/TSP)`: cron 0 16 10 1 * · on · SUCCEEDED @ 2026-09-13T21:34
- `Command Deck — News daily refresh`: cron 0 14 * * * · on · SUCCEEDED @ 2026-09-21T14:01
- `Command Deck — Next Big Moves weekly review`: cron 0 15 * * 0 · on · FAILED @ 2026-09-20T15:07
- `Command Deck — On This Day & Birthdays daily midnight refresh`: cron 0 7 * * * · on · SUCCEEDED @ 2026-09-22T07:08
- `Command Deck — Opportunity Radar research (daily 5am PT)`: cron 0 12 * * * · on · SUCCEEDED @ 2026-09-21T12:12
- `Command Deck — PE & Defense Innovation daily refresh`: cron 0 14 * * * · on · SUCCEEDED @ 2026-09-21T14:07
- `Command Deck — Strava activity refresh`: cron 0 3,15 * * * · on · SUCCEEDED @ 2026-09-22T03:08
- `Command Deck — Trading strategy performance daily 3pm PST sync`: cron 0 22 * * 1-5 · on · SUCCEEDED @ 2026-09-21T22:03
- `Command Deck — Travel & Experiences weekly refresh`: cron 0 15 * * 1 · on · SUCCEEDED @ 2026-09-21T15:10
- `Command Deck — Weather daily refresh`: cron 0 13 * * * · on · SUCCEEDED @ 2026-09-21T13:02
- `Command Deck — builder incentives refresh`: cron 0 14 * * * · on · SUCCEEDED @ 2026-09-21T14:00
- `Command Deck — calendar refresh`: cron 0 3,15 * * * · on · SUCCEEDED @ 2026-09-22T03:07
- `Command Deck — daily deals & hacks refresh`: cron 0 13 * * * · on · SUCCEEDED @ 2026-09-21T13:14
- `Command Deck — mortgage rates & market refresh`: cron 15 13 * * * · on · SUCCEEDED @ 2026-09-21T13:16
- `Command Deck — top performers refresh`: cron 30 13 * * * · on · SUCCEEDED @ 2026-09-21T13:37
- `Command Deck — weather & news refresh`: cron 0 1,5,13,17,21 * * * · on · SUCCEEDED @ 2026-09-22T05:08
- `Command Deck — weekly opportunity audit`: cron 0 17 * * 0 · on · FAILED @ 2026-09-20T17:04
- `Financial Summary`: cron 0 16 1 * * · on · @
- `Metrics Digest`: cron 30 14 * * 1 · on · SUCCEEDED @ 2026-09-21T14:30
- `Morning Brief`: cron 0 14 * * * · on · SUCCEEDED @ 2026-09-21T14:09
- `Ops Issue Review`: cron 0 20 * * 5 · on · FAILED @ 2026-09-18T20:08
- `Project Risk Review`: cron 0 21 * * 5 · on · FAILED @ 2026-09-18T21:07
- `R18 — Card credits and status deadlines (1st and 15th)`: cron 0 15 1,15 * * · on · SUCCEEDED @ 2026-09-15T15:01
- `R19 — USC study planner (Sunday evening)`: cron 0 0 * * 1 · on · SUCCEEDED @ 2026-09-21T00:01
- `Real Estate Weekly Brief`: cron 0 15 * * 1 · on · ABANDONED @ 2026-09-21T15:08
- `Weekly 1/5/10-Year Plan Review Reminder`: cron 0 14 * * 1 · on · SUCCEEDED @ 2026-09-21T14:10
- `Weekly dashboard refresh — Rent, Buy, or Wait`: cron 0 15 * * 1 · on · ABANDONED @ 2026-09-21T15:08
- `Command Deck — On This Day & birthdays daily`: cron 0 13 * * * · off · SUCCEEDED @ 2026-09-04T13:01
- `Weekly Review (retired — replaced by desktop task r20-weekly-review-local)`: cron 0 23 * * 5 · off · SUCCEEDED @ 2026-09-10T02:27

**Mac tasks**
- `automation-audit-quarterly`: The full seven-phase audit-and-remediate pass — nine parallel audit passes scored on output not execution, every Finding ID driven to resolv
- `brain-learn-daily`: Distills Steven's own words (chat transcripts) and his personal Google Drive "Second Brain" folder into Second Brain rows; flagged items wai
- `brain-weekly-verify`: Sunday review list for Steven: what the brain learned this week (Notion Inbox rows) plus sensitive items held back; re-indexes the Obsidian 
- `calendar-daily-sync`: Pulls the next 7 days from Steven's business Google Calendars through the connector and writes the calendarSnapshot document, so the Command
- `fabric-deck-sync`: Keeps the Command Deck's knowledge-fabric tiles live — counts every store (Second Brain rows, vault notes, Jarvis documents, graph nodes, Ru
- `feeds-market-close`: Weekday post-close refresh of the market feed and a second read on VA rates, using Perplexity. No API key.
- `feeds-weekly`: Evening-tier feeds (builders, offers, PE defense, affluent, city news) refreshed daily via Perplexity on the Claude subscription. No API key
- `health-coaching-weekly`: Sundays 6:30 AM - dispatches health-coach-analyst, fitness-trainer and meal-planner together against Steven's Apple Health data and his heal
- `health-full-analysis`: Daily after the 5:10 AM sync: deep analysis of Steven's Apple Health data (trends, week-over-week, workouts, sleep, recovery, ECG/symptoms/s
- `incentives-daily-scan`: Daily search for new and changed incentives, rebates, grants, credits, veteran benefits and promotions (Temecula/SW Riverside, San Diego Cou
- `local-bridge-queue`: Reads the Command Deck's localBridgeQueue and runs each queued verb through ~/Applications/local-bridge/run.sh, which enforces a read-only a
- `mortgage-desk-weekly`: Sunday: Harrison runs the mortgage desk with his declared hand-off partners in parallel, and every hand-off is recorded to the Command Deck 
- `mortgage-rates-daily`: Weekdays 06:40 and 13:40, publishes the free daily mortgage-rate feed (Optimal Blue lock-based indices for conforming 30 and 15, FHA, VA, US
- `nightly-self-test`: Cheap functional and integration check across every skill, task, agent and connector. Self-heals the routine breakage, sends real regression
- `openrouter-credits-refresh`: Two writes each night. The credit balance runs through the local bridge and only reports a figure once a key is set. The council price table
- `openrouter-feeds-refresh`: Daily-tier feeds (headlines, Bears, VA rates) refreshed via Perplexity on the Claude subscription. NO OpenRouter call is made and no API key
- `openterminal-remote-queue`: Reads the Command Deck's openTerminalQueue document and runs each queued market lookup against the local OpenTerminal API through a strict a
- `ops-knowledge-graph`: Graphs the dashboard export, playbooks, decisions and agent roster into the Obsidian vault so the team can query how things connect.
- `r10-automation-health`: Scores every routine and task on OUTPUT, not execution. Moved to 10:10 PM so it runs inside the hours the desktop app is actually open, and 
- `r12-inbox-triage`: Classifies Gmail into skip / info / meeting / action, writes reply drafts into Gmail Drafts, posts a short digest. Never sends.
- `r17-trading-day-log`: Asks for the day's daily-loss-limit triggers and account status, then computes drawdown against the 6–10 percent high-water-mark rule.
- `r20-weekly-review-local`: The Friday review moved onto the Mac so its findings write into Next Big Moves and the task board instead of only being emailed.
- `r4-quantvue-sync`: Re-reads the live QuantVue Google Sheet, writes strategySnapshot, and flags any strategy under −4% month to date.
- `r5-rates-market-refresh`: Weekly mortgage rates, local market figures and active listing counts into one ratesSnapshot both dashboards read.
- `r8-apple-health-snapshot`: Twice daily: builds the Apple Health snapshot (90-day daily series, workouts, sleep, sources, symptoms/ECG/state-of-mind records) from the M
- `r9-feed-freshness-sweep`: Re-runs the research passes for every dashboard feed marked Due and republishes through the safe checklist.
- `runner-probe`: One harmless Command Deck write that proves a headless runner task can reach the deck database through the approver.
- `strava-daily-sync`: Pulls recent Strava activities through the connector and writes the stravaSnapshot document, so the Strava panel refreshes daily instead of 
- `toolkit-deck-sync`: Twice daily: builds the toolkitSnapshot document (tools, agents, skills, scheduled tasks, MCP servers) from what is installed on the Mac and
- `weather-news-refresh`: Weather and news snapshots twice daily. Cut from 3x to 2x because the midday and 5:45 PM slots sat outside the hours the desktop app is open

## Seats with no tool of their own

none
