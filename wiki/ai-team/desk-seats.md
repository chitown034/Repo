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

## Booking Concierge

Added 2026-10-25. Reports to Priya (ISA line); member of the Growth & Marketing and Buyer pods.
Owns the Broker Command Center **Bookings Desk** (Clients → Bookings Desk). It reads TidyCal consults
(read-only: `list-bookings`, `list-booking-types`) and makes each booking a contact at *Appointment Set*,
with a confirmation the day before, a prep brief the day of the call, and a follow-up after it.
Outcomes are logged as Held or No-show. Held starts the onboarding mission; No-show queues a two-touch
recovery with the booking link. It also tracks the show rate and puts
https://tidycal.com/stevenshearrill/discovery-call into every lead touch. Reschedules and cancellations stay in TidyCal.
Launchpad mission: *Booked consult — prep to follow-up*. Vanessa tool: `tidycal_bookings`.

## Aria — Anticipation & Client Success Lead (7-Star)

Added 2026-10-25. Reports to Sterling; member of the Client Experience and Escrow & Closing pods.
Owns the Broker Command Center **7-Star & Scale Engine** (Clients → 7-Star & Scale Engine):
- **Anticipation engine.** 15 rules, each dated from acceptance, a contract milestone or close of escrow:
  welcome-to-escrow pack, wire-fraud call, inspection prep, appraisal watch, homeowner's insurance quotes
  (wildfire zones), moving kit, final walk-through and closing-day kit, seller close-out, closing gift,
  settled-in call, Homeowners' Exemption (BOE-266, Feb 15), supplemental property tax heads-up, CPA
  note for sellers, 90-day review, and the home-anniversary equity review.
- **Response standards by stage.** New lead same day; contacted every 2 days; appointment confirmed
  24 h before; active client every 3 days; under contract weekly plus every milestone; closed every
  90 days. Breaches become recovery tasks every day.
- **Friday Pulse.** A weekly written status to every escrow client: done, next, late, what we need, and
  the wire-fraud reminder. Drafted in Gmail with one button.
Launchpad mission: *Friday Pulse*. Vanessa tool: `seven_star`.

## Kai — Process Improvement & Scale Lead (Kaizen)

Added 2026-10-25. Reports to Owen; member of the Automation & AI pod.
- **Capacity plan.** Weekly hours needed against hours available, with hire triggers: TC at 5+ escrows,
  ISA at 60+ leads a month, showing partner at 8+ active buyers.
- **Kaizen board.** Bottlenecks read from live data: late tasks by owner, clients untouched for 14+ days,
  escrows with a late milestone, automation coverage. Ideas are scored by impact ÷ effort, and the
  winners become missions, autopilot rules or SOPs.
Launchpad mission: *Monthly Kaizen review*.

## Sloane — Document Screening Analyst (Doc Screener)

Added 2026-10-26. Reports to Winston; member of the Escrow & Closing, Compliance & Risk and Listing pods.
Owns the Broker Command Center **Doc Screener** (Properties → Doc Screener):
- **Deterministic first pass.** Finds every date, dollar amount, percentage, day count, blank or checkbox,
  and 60+ risk phrases (as-is, waivers, liquidated damages, arbitration, auto-renewal, Mello-Roos, PACE,
  solar lease, transfer fees, "notwithstanding", deemed approval and others), each with its page number.
- **AI read.** Long files are read in parts and merged into one report: summary, bottom line, parties,
  key terms, dates, timelines with computed deadlines, clauses in plain English (who each one favors,
  risk), hidden items, money, obligations, blanks and missing pages, conflicts, questions and next actions.
  A second-pass reviewer then looks for anything the first pass missed.
- **Actions.** Deadlines go to tasks or Google Calendar. Ask the document; compare two versions; download
  the report; draft a client summary email. High-risk findings create a review task for Steven.
Launchpad mission: *Screen a document package*. Vanessa tool: `doc_screener`. Not legal advice.

## Nova — Coverage & Process Auditor

Added 2026-10-26. Reports to Owen; member of the Automation & AI and Compliance & Risk pods.
Owns the Broker Command Center **Coverage Engine & Sync** (System → Coverage Engine & Sync):
- **Daily sweep.** Detects offers received, showings done without feedback, listing agreements expiring
  within 21 days, consults booked on TidyCal, screened documents with high-risk findings, cancelled
  escrows and low appraisals, and fires the matching workflow for each. Gives every open task an owner
  and the named seat.
- **Process coverage matrix.** For every page in the dashboard: owning seat, pod, whether the seat lists
  it, automation, Vanessa tool and health check. Uncovered processes go to Owen and Kai's Kaizen board.
- **Live-sync board.** Freshness of autopilot, the sweep, TidyCal, Headline News, market data, Lofty and
  backups against each one's standard, with one-press *Sync everything*.
- **Health checks added:** offers answered in 24 h, showing feedback in 2 days, no listing expiring
  unplanned, every escrow's documents screened, news and TidyCal fresh, response standards 80%+,
  every task owned, event workflows on, sweep ran today.
Launchpad mission: *Weekly coverage & sync audit*. Vanessa tool: `coverage_report`.
Also new: the **Life & Wealth Pod** (lead James: Kevin, Apex, Marcus, Travel Desk, Tax Assessor Agent)
keeps Steven's personal finance, habits, trading research and travel separate from client work.

## Isabel — Loan Processing & Conditions Desk

Added 2026-10-26. Reports to Harrison; member of the Loan Pod.
Runs the Broker Command Center **Loan Pipeline** file from application to clear-to-close: records the TRID
application date and the Loan Estimate deadline (3 business days), keeps the document checklist by program
and sends one request list, orders VOE/VOD, title and insurance, orders the appraisal after intent to
proceed and delivers the borrower's copy (ECOA), enters every underwriting condition with owner and due
date, flags changed circumstances to Alexandra, and texts the borrower a status every two days. After
funding: first payment and escrow-account follow-up.

## Reyes — Closing & Funding Coordinator (TRID timing)

Added 2026-10-26. Reports to Harrison; member of the Loan Pod.
Owns the back end of every loan: consummation date, Closing Disclosure received 3 business days before
(every day but Sunday and federal holidays), LE-to-CD comparison and tolerance check with Alexandra,
rate-lock expiration calendar and extensions, signing logistics, the refinance rescission period, funding
conditions, the wire call-back with Elena, recording and the final file. Keeps the loan calendar in step
with Carmen's escrow timeline so clear-to-close lands before the loan contingency.

**Loan Pod** (lead Harrison: Isabel, Reyes, Lucia, Lender Matchmaker, Inbox Sentinel, Refi Watch Analyst,
Rosa, Alexandra, Carmen). Fourteen stages, each with an owned workflow fired when the file advances:
pre-qualification, pre-approval, application, Loan Estimate, lock, processing, appraisal, underwriting,
conditions, clear to close, Closing Disclosure, signing, funding, post-close.

## Winston — When-Needed Matrix 2.0 (addition, 2026-10-26)

The Broker Command Center's When-Needed Matrix now covers 237 forms (C.A.R. plus 12 LPT Realty brokerage
forms) across 11 stages (Consult, Listing, Buyer Rep, Offer, Escrow Open, Contingencies, Loan & Appraisal,
Closing, Post-close, Leasing & Tenancy, Broker File) and 20 deal types, with four levels: required every
deal, required if triggered, optional, broker admin. 24 triggers (pre-1978, HOA, probate, trust, tenant,
rent-back, multiple offers, VA/FHA, foreign seller, solar, Mello-Roos and more) turn conditional forms into
required ones. Stage checklists tick against a live escrow and sync across devices; missing forms become
tasks dated by stage (daily sweep); the Doc Screener ticks a form when the matching document is screened;
the MLO hand-off list goes to the loan side at escrow open. Vanessa tool: `when_needed`.

## Winston — SkySlope library (addition, 2026-10-26)

The Broker Command Center now carries all 548 SkySlope library forms from Steven's Browse Libraries (C.A.R. 445,
LPT Realty 100, CRMLS 2, SkySlope 1), imported from the LO dashboard's library (pulled 2026-10-22) and grouped
into 314 base forms with stages, deal types, required levels, who signs, how-to steps, tips, loan-side notes and
44 line-by-line walkthroughs. The Forms Hub and the When-Needed Matrix run on this library; the matrix also keeps
34 C.A.R. forms that are not in the library. Vanessa tool: `skyslope_form`.

## Maya — Area Intelligence (addition, 2026-10-31)

The Broker Command Center's Area Intelligence page (Local Markets) joins the Market Explorer's 382 Southern
California cities and communities with demographics (Census ACS 2023 5-year: population, median age, household
income, home value, owner-occupancy, education, unemployment, rent, veterans — read live from the Census API in
the viewer's browser when available, otherwise an embedded seed), schools, major employers and military, typical
property tax rates, Mello-Roos / CFD amounts and communities, special assessments, transfer and sales tax. Sortable
by any metric, lowest-tax and Mello-Roos rankings, ZIP lookup, side-by-side compare and a client-ready area brief.
The Tax Assessor Agent keeps the tax tables current. Vanessa tool: `area_intel`.
