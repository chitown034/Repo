# Real-estate playbooks

Second Brain export for NotebookLM · as of 2026-10-26 · bundle `06-wiki-real-estate-playbooks`.
Every section below begins with `# FILE: <path>` naming the page in the repo (chitown034/Repo, branch claude/stoic-cori-pvn3f8).
Client pages are never exported; phone numbers and e-mails are masked. Facts carry the page's own dates, not today's.


---

<!-- source file: wiki/real-estate-playbooks/ai-search-visibility.md -->
# FILE: wiki/real-estate-playbooks/ai-search-visibility.md

# AI-search visibility — being found by ChatGPT, Perplexity, Gemini, Google AI (AEO · GEO · SEO), as of 2026-10-23

Steven's ask (2026-10-23): "AEO, AIO, GEO, SEO optimizations of me on the internet". Owner: **Sofia (CMO)** drafts and
audits; **Alexandra** reviews any page with a licence, rate or client statement; **Steven** signs in, verifies and posts.
Researched 2026-10-23 by web search (vendor data ±10 points; one source per claim is in the brain's research log).

## Why this order

- 86% of AI citations come from brand-managed sources; ChatGPT leans on third-party listings (49%), Gemini on
  websites (52%), forums about 2% for local intent (Yext, 6.8M citations, Oct 2025).
- Google needs no special markup for AI Overviews / AI Mode; AI-feature traffic shows in Search Console under "Web".
- Specialty queries ("VA loan officer who is also a realtor, San Diego") name a specific agent 87% of the time; 91.5%
  of ranked agents got zero AI citations in a 37,500-query audit (Aug 2026). **The VA / military niche is the lever.**

Legend: **S** = Steven (sign-in, verification, licensed act) · **AI** = Sofia drafts or audits · **S+AI** = AI drafts, Steven posts.

## Tier 1 — listings and reviews (highest impact, cheapest)

1. **Google Business Profile** — one profile; primary "Real estate agent", secondary "Mortgage broker"; service area =
   the SoCal cities he actually serves; services list (VA purchase, VA IRRRL, FHA, conventional, listing, buyer rep);
   a Post every week; ten seeded VA questions in Q&A. **S** verify and own · **AI** descriptions, posts, Q&A, monthly audit.
   Benchmarks from loan-officer guides: 50+ reviews, review velocity over star count, 90 days of steady posting.
2. **Reviews, compliant** — day-10 ask after every close (the `review-request` skill): Google first, then Zillow; ask the
   client to mention the city, VA/military and what he did (geography + specifics are what AI cites). **No incentive of
   any kind** (Google policy; FTC Consumer Review Rule, ~$53k per violation); never gate or filter negatives. **S** sends.
3. **Portal profiles, identical everywhere** — Zillow (agent + lender/NMLS), Realtor.com, Homes.com, LinkedIn, Yelp
   (in ~80% of ChatGPT local answers), Bing Places. Same name, brokerage, phone, address and bio wording. **S** claims ·
   **AI** keeps the canonical bio (`context/about-me.md`) and runs a quarterly NAP check.
4. **NMLS Consumer Access** — name, employer (Patriot Pacific Financial), licence states current; link to it from the
   site and LinkedIn. **S** (NMLS login) · **AI** check.

## Tier 2 — his own site (the Gemini / Google lever)

5. **Entity page** — `/about` as a `ProfilePage` whose `mainEntity` is a `Person` (jobTitle, worksFor → LPT Realty +
   Patriot Pacific Financial, identifier NMLS 1921615 and the DRE number, knowsAbout VA loans, areaServed, `sameAs` →
   GBP, Zillow, LinkedIn, YouTube, NMLS, DRE lookup), plus a `RealEstateAgent` node and a `MortgageBroker` node linked
   by `@id`. Markup must match the visible text. **AI** writes and validates the JSON-LD · **S** publishes.
6. **Niche answer pages + FAQPage** — 10 to 15 pages that answer one question each in the first 60 words: VA loan with
   PCS orders in San Diego, funding-fee exemption, a veteran buying a multi-unit in Riverside, a VA offer against a
   conventional buyer. **AI** drafts · **Alexandra/S** approve; no rate, no eligibility promise.
7. **llms.txt** — cheap; Anthropic and Perplexity read it, OpenAI/Google unconfirmed. **AI**.
8. **Author bio on every page** (name, licences, veteran, NMLS/DRE) with `author` → the Person `@id`. **AI**.

## Tier 3 — off-site authority

9. **YouTube** — the most-cited domain on Perplexity (32% of citations). Short VA explainers, titles phrased as the
   question, transcript on the matching site page. **S** records · **AI** scripts, descriptions, chapters.
10. **Press, podcasts, associations** — veteran-business features, the Navy Chief story, VREB/VAREP, military-spouse
    groups, the LPT and Patriot Pacific team pages linking to `/about`. **S+AI**.
11. **Reddit / Quora** — low weight for local; only genuine answers in r/VeteransBenefits, r/Militaryfinance, r/SanDiego
    with the licence disclosed; never solicit. **S only** (licensed-advice risk).

## Measurement — the monthly audit (the `presence-audit` task runs it; Steven reads `docs/reports/PRESENCE.md`)

- **Prompt set (20)** across ChatGPT, Perplexity, Gemini, Claude, Google AI Mode: "best VA loan officer in San Diego",
  "veteran-friendly realtor Temecula", "who is Steven Shearrill", "Steven Shearrill NMLS", "real estate agent who is also
  a loan officer Southern California", "VA IRRRL lender Riverside County", plus 14 city × service variants. Log:
  mentioned Y/N, position, cited URL, sentiment. The task can only run the web-search half from the cloud; the four
  chat engines are a once-a-month 10-minute paste for Steven (the prompts are in the report).
- **Search Console**: branded queries + the FAQ pages. **GBP Insights**: calls, site clicks, review count and velocity.
- **Score**: mentions ÷ prompt-runs. Target: above zero by month 3, above 20% by month 6 (vendors claim 60–90 days to
  first movement). Paid trackers are optional; the prompt set costs nothing.

## Compliance flags (every item)

- **DRE licence number** on all first-point-of-contact material, websites, e-mail and social (B&P 10140.6(b)); font no
  smaller than the ad's smallest text (DRE RE 559).
- **NMLS ID** on every ad soliciting borrowers — California B&P 10236.4 requires the broker licence and each MLO's NMLS
  identifier; DRE RE 858 says this reaches the internet.
- **Equal Housing Opportunity** logo or statement on real-estate and loan advertising (HUD 4310.5).
- **Reviews**: no inducements, no selective solicitation.
- **HALT**: any page with a rate, an eligibility statement or a client name goes to Alexandra, then Steven, before publish.

## What Steven does first (30 minutes)

1. Claim or verify Google Business Profile and Bing Places; 2. claim Zillow (agent and lender), Realtor.com, Homes.com,
Yelp; 3. send Sofia the DRE number and the site's host login path (never the password) so the entity page and llms.txt can
be drafted for his review; 4. record one 60-second VA explainer on the phone.


---

<!-- source file: wiki/real-estate-playbooks/buyer-process.md -->
# FILE: wiki/real-estate-playbooks/buyer-process.md

# Buyer process

The buyer-side path from lead intake through matching, showings, offer, earnest money, contingencies, and close — the sequence the ISA and Steven actually run, stage by stage.

## Lead intake and the First-10-Days Sprint

Speed-to-lead commitment: auto-text within 60 seconds, phone call within 5 minutes. Qualify with **LPMAMA** — Location, Price, Motivation, Agent, Mortgage, Appointment. The follow-up cadence for a new lead: Day 0 text+call+voicemail → Day 1 call+value text → Day 2 call+email → Day 3 text → Day 5 call+listing → Day 7 email → Day 10 decision point, after which the lead moves into long-game nurture tiered by timeline (A: 0–30 days, B: 1–6 months, C: 6–18+ months).

## Consultation and matching

The buyer consultation runs: rapport → agenda → LPMAMA → financing confirmation → agent-value conversation → **signed Buyer Representation Agreement** → showings begin. The signed agreement comes before showings start, not after — this is the compensation-disclosure step, not a formality.

## Stage-by-stage ownership

| Stage | Owner | Action |
|---|---|---|
| Lead | ISA | Same-day call/text response; qualify wants/must-haves; schedule consult within 24 hrs |
| Consult scheduled | Steven | Buyer consultation — confirm timeline, financing readiness, must-haves vs. nice-to-haves |
| Pre-approved | Loan Processor + Steven | Issue pre-approval letter; hand off to showing assistant for active search setup |
| Active search | Showing Assistant | Weekly curated listing batch + scheduled showings; log feedback after every showing |
| Offer written | Steven | Draft/negotiate offer same-day; confirm seller-credit/rate-buydown strategy before submission |
| Under contract | Transaction Coordinator | Open escrow within 24 hrs; confirm **earnest money deposit** delivered and receipted within the contract deadline |
| Escrow / inspection | Transaction Coordinator | Schedule inspection within the contract window; track contingency deadlines; weekly status update |
| Clear to close | Loan Processor | Confirm CD 3-day rule; schedule final walkthrough; confirm wire instructions **verbally** |
| Closed | ISA | Closing-day gift + handwritten note; enroll in post-close follow-up |
| Post-close follow-up | ISA | 30/60/90-day check-ins; request review; add to annual client-appreciation list |

## Earnest money — a deadline, not a detail

**A missed EMD deadline can put the buyer in default.** The Transaction Coordinator confirms the deposit is delivered and receipted inside the contract's own deadline the moment escrow opens (within 24 hours of going under contract) — never assume it is handled because escrow was opened. See `wiki/real-estate-playbooks/transaction-stages.md` for where EMD sits inside the full closing-day-count sequence (day 3 of the standard timeline).

## Wire fraud protocol

All wiring instructions are verified by an **outbound phone call to a known number** — never a number or instructions received by email, at any stage of the buyer process.

## See also

- `wiki/real-estate-playbooks/transaction-stages.md` — the day-count deadlines behind each stage above.
- `wiki/real-estate-playbooks/showing-operations.md` — how the "Active search" stage's showings actually get booked.
- `wiki/mortgage-programs/disclosure-timing.md` — the LE/CD clock running in parallel on the lending side.

Source: Command Deck, "Real estate transaction — lead to close" card and the buyer-side stage playbook (RE_STAGE_PLAYBOOK), from The Ultimate Realtor Playbook (SPACE/LPT operating manual).


---

<!-- source file: wiki/real-estate-playbooks/drip-and-text-follow-up.md -->
# FILE: wiki/real-estate-playbooks/drip-and-text-follow-up.md

# Drip campaigns and text follow-ups — Lofty, Zoho, Pabbly, and the rules (as of 2026-10-23)

Steven's ask (2026-10-23): "setup drip campaigns and text messages follow ups" across Arive, Zoho and Lofty. Owner:
**Victor (CRO)** for the lead lanes, **Harrison** for refi touches, **Alexandra** reviews every template; **Steven**
enables plans, approves copy and registers texting. Researched 2026-10-23 (vendor help pages via search; menu paths
marked (G) are to be confirmed in-app).

## Where each drip lives

| Lane | System | Mechanism | Trigger | Text sending |
|---|---|---|---|---|
| Buyer and seller leads, open-house visitors, sphere | **Lofty** | Smart Plans (Auto Email, Auto Text, call/task steps, branching; "AI Builder" builds a plan from a description). Path: Automation → Smart Plans → Create (older builds: Marketing → Automation) | "Lead Created" (new or all leads); manual or bulk apply; stage/tag triggers live in the Automation module (G) | Lofty is the ISV: it registers the 10DLC brand + campaign for you. Sole-proprietor brand = 1 campaign, 1 number; Standard brand needs an EIN. Unregistered = blocked |
| Mortgage pipeline (lead → application → funded), refi watch, post-funding | **Zoho CRM** | Workflow Rules (Setup → Automation → Workflow Rules): create/edit/field-update triggers, instant + scheduled e-mail, task, field update, webhook; e-mail templates under Setup → Customization → Templates. Zoho Campaigns for long drips (CRM → Campaigns sync is effectively one-way) | Stage field change | No native SMS. Marketplace "Twilio SMS Texting for Zoho CRM": Twilio number + Twilio's own 10DLC registration + per-message cost |
| Arive (LOS) | **Arive → Zoho** | Arive has no drips; its Zapier (private app) triggers — Loan Status Updated, Key Dates Updated, POS Application Submitted — feed Zoho stage changes through Pabbly (`integrations/arive/README.md`) | Loan status | — |
| Cross-system glue | **Pabbly Connect** | Workflows 7–10 in `integrations/pabbly/WORKFLOWS.md` (post-close, sphere, open house, voicemail) + Lofty API ↔ Zoho ↔ Gmail | — | — |

Auto-pause: a Lofty plan stops when the lead replies by e-mail, call or text, or to the AI Sales Agent; any manual
message takes over. Lofty's AI Sales Agent (AI Copilots → Sales Agent → Settings) texts on its own — Proactive /
Balanced / Reserved; it stops on do-not-contact hints but does **not** flip opt-in status. Steven picks the style.

## The cadences (day · channel · purpose) — copy stays a draft until Steven approves it

**New buyer lead** (Lofty, trigger Lead Created, auto-pause on reply)

| Day | Channel | Purpose |
|---|---|---|
| 0 (≤ 5 min) | Text | Intro, confirm search criteria (the speed-to-lead text) |
| 0 | E-mail | Welcome + saved-search link |
| 0 | Call task | Speed-to-lead call |
| 1 | Text | "Did the homes fit?" |
| 2 | E-mail | Pre-approval value (the MLO angle; no rate) |
| 4 | Call task | Second attempt |
| 7 | Text | New-listings nudge |
| 10 | E-mail | Market snapshot |
| 14 | Text | Last touch → move to the long-term drip |

**Seller lead:** D0 text + e-mail (home-value CTA) · D1 call task · D3 e-mail (how comps work) · D7 text · D14 e-mail
(prep checklist) · D30 text (market update).
**Refi / rate-watch past client** (Zoho, tag RateWatch; **no rate in any touch**): monthly e-mail market-average note ·
quarterly text check-in · a task when the `refi-watch` routine lists them (`refi-review-prep.md`).
**Post-close** (Lofty Closed / Zoho Funded): D1 thank-you · D10 review request · D30 check-in · D90 home-tips · annual
anniversary e-mail + text (`post-close-care.md`, `review-request` skill).
**Sphere monthly:** e-mail (local market note) · birthday / anniversary text · quarterly call task (`sphere-nurture.md`).

## Rules every template and send obeys

- **TCPA**: marketing texts need prior express written consent (an e-sign tick is fine); the FCC's one-to-one rule was
  vacated and the prior standard reinstated 2025-08-29. Revocation by any reasonable method, honoured within 10
  business days; one confirmation text allowed. Quiet hours 8 AM–9 PM recipient local time — set Lofty/Twilio windows
  9 AM–7 PM PT. STOP/HELP handled by Lofty and Twilio natively — never override an opt-out.
- **CAN-SPAM**: physical address + working unsubscribe in every marketing e-mail.
- **10DLC**: registered before the first text (Lofty does it as ISV; Twilio is Steven's own registration).
- **California B&P 10140.6(b)**: DRE licence number **and** NMLS ID on all first-point-of-contact solicitation material,
  font no smaller than the ad's smallest (DRE RE 559). **Equal Housing** logo or legend on dwelling-loan ads.
- **CCPA/CPRA**: notice at collection on every lead form; "Do Not Sell or Share" link if lead data goes to partners.
- Footer for every template: `Steven Shearrill · LPT Realty · DRE #____ · NMLS #1921615 · Patriot Pacific Financial
  NMLS #____ · Equal Housing Opportunity · [address] · Reply STOP to opt out.`
- **HALT**: a rate, an eligibility promise, or a send to a client is Steven's; the team drafts and specs only.

## Who does what

| The AI team (drafts and specs, nothing sent) | Steven only |
|---|---|
| Every template with the footer; the Smart Plan spec (steps, timing, branches) phrased for Lofty's AI Builder; the Zoho workflow + template specs per stage; the Pabbly maps; the CCPA form notice text | Enable or publish each plan; approve all copy; 10DLC registration (Lofty, and Twilio if Zoho texts); buy the Twilio number and credits; generate the Lofty API key (Settings → Integrations → API); tick Zoho's API access; choose send windows; pick the Sales Agent style |

## Setup order (Steven, about 40 minutes once the specs are approved)

1. Lofty → Settings → Integrations → API → create key → paste it into `bash connect-all.sh` step 7b (never into chat).
2. Lofty → start 10DLC registration (A2P 10DLC guide in Lofty help) — sole-proprietor or EIN brand.
3. Lofty → Automation → Smart Plans → Create → AI Builder → paste the approved buyer-lead spec → set trigger Lead
   Created → turn on. Repeat for seller, post-close, sphere.
4. Zoho → Setup → Security Control → Profiles → Developer Permissions → tick "Zoho CRM API Access" (the 403 fix).
5. Zoho → Setup → Automation → Workflow Rules → one rule per stage with its approved e-mail template.
6. Only if Zoho should text: install "Twilio SMS Texting for Zoho CRM", buy a Twilio number, register 10DLC in Twilio.
7. Say "specs ready for review" to Vanessa; Victor and Alexandra return the four Smart Plan specs and the Zoho rules as
   drafts in the Vanessa queue.

Open items to confirm in-app: Lofty stage/tag triggers, Lofty tag/note/enrolment endpoints and webhooks, the 2026
status of the TCPA revoke-all deferral.


---

<!-- source file: wiki/real-estate-playbooks/index.md -->
# FILE: wiki/real-estate-playbooks/index.md

# Wiki — Real estate playbooks

Listing, buyer, transaction and showing process. Steven's brokerage side: CA Broker acting as Broker
Associate with LPT Realty (Space RE), Temecula / SW Riverside and San Diego.

**Status: written**, sourced from the deck's own playbook cards (lead-to-close SOP, stage tables,
showing panel, org chart). The four digitised playbooks registered in `references/index.md` remain
the deeper primary source when a page here doesn't answer fully.

## Pages

| Page | One-line summary |
|---|---|
| `buyer-process.md` | Lead intake (LPMAMA, First-10-Days Sprint) → consultation → matching → showing → offer → EMD → close, stage by stage |
| `listing-process.md` | Intake → CMA pricing → pre-listing package → launch → offer management → post-close, stage by stage |
| `transaction-stages.md` | The six-phase TC checklist's day-count deadlines (EMD day 3 through closing day 30) and the parallel mortgage-stage table |
| `showing-operations.md` | Itinerary/route planning, ShowingTime vs. Showami, why an automation never contacts a client directly |
| `referral-reciprocity.md` | The referral-partner ledger, reciprocity scoring, RESPA §8, and LPT recruiting/revenue share |
| `military-relocation.md` | PCS-driven transactions, the VA house-hack mechanism, the dual-licensed referral opportunity — with an open gap flagged on rent/buy/wait mechanics |
| `open-house.md` | Before / during / after an open house: sign-in capture, the Open House Captain's lead list, thank-you drafts and ISA call list, Pabbly workflow 9, fair-housing reminders (2026-10-22) |
| `post-close-care.md` | Day 1 / 10 / 30 after a close or funding, the no-inducement review ask, Pabbly workflow 7, the twelve-month care touches, Delia's drafts (2026-10-22) |
| `sphere-nurture.md` | The `sphereList` fields, monthly touches, birthdays and home anniversaries, 90-day check-ins, the 11th-of-month routine and Pabbly workflow 8 (2026-10-22) |

## Standing facts worth keeping here

- **Earnest money is a deadline, not a detail.** A missed EMD deadline can put a buyer in default.
  This was a real gap found by the improvement loop and patched into both the deck and the ISA
  Portal — any stage description that omits EMD is wrong.
- **Showings never contact a client or listing agent from an automation.** Requests land on the ISA
  line and reach the ISA Portal on the next bridge run.
- These playbooks are **duplicated on the ISA Portal**. A correction applied to one copy only will
  silently diverge. Fix both, or record why you did not.

## What does not belong here

A specific transaction, a specific buyer, or a specific address. Those go in `wiki/clients/` as
full-context pages, and they stay on the Mac.
- `ai-search-visibility.md` — being found by ChatGPT/Perplexity/Gemini/Google AI: GBP + reviews first, entity page + FAQ pages, YouTube; monthly prompt-set audit; DRE/NMLS/EHO ad rules (2026-10-23)
- `drip-and-text-follow-up.md` — where each drip lives (Lofty Smart Plans, Zoho workflows, Arive→Zoho via Pabbly), the cadences per lane, TCPA/10DLC/CAN-SPAM/DRE-NMLS/EHO rules, who does what (2026-10-23)


---

<!-- source file: wiki/real-estate-playbooks/listing-process.md -->
# FILE: wiki/real-estate-playbooks/listing-process.md

# Listing process

The seller-side path from intake through pricing, prep, launch, offer management, and close — Marguerite's (Listing Agent) lane, prepping Steven for the appointment and the file, never taking the listing herself.

## Intake and consultation flow

The listing consultation runs: **pre-listing package** → property tour → the seller's why (motivation) → market education → **CMA pricing conversation** → marketing plan → objection handling → signature. The pricing conversation is called out separately in the SOP specifically for the case where the seller's number is high — that is a planned, prepared conversation, not an improvised one.

## What the pre-listing package and presentation cover

- The full CAR disclosure pack.
- The seller net sheet.
- The **Clear Cooperation and delayed-marketing decision**, made and documented in writing at listing — not left ambiguous once showings start.
- The **price-reduction trigger**, agreed with the seller at listing (not negotiated later under pressure if the property sits).
- Multiple-offer presentation approach, decided in advance of receiving offers.

## Launch

Once signed, the listing goes live on CRMLS/Zillow/Homes.com with professional photography, plus "Just Listed" circle-prospecting to the surrounding farm area. See `wiki/real-estate-playbooks/referral-reciprocity.md` for the farming/geographic-prospecting side of this.

## Offer management

Every accepted offer moves the file to "Pending" in the CRM and hands off to the Transaction Coordinator, who owns everything from acceptance forward — see `wiki/real-estate-playbooks/transaction-stages.md` for the six-phase closing checklist that starts at handoff. Multiple-offer situations use the presentation approach agreed at listing, not one improvised per offer.

## Client experience commitments (seller side)

- Weekly check-in call regardless of file status.
- Bad news, delays, or an anxious client: **phone first, email second** — never email-only.
- Target close: 21–25 days for conventional/cash, ~28–30 days for VA; the SOP's own internal target is 21 days or fewer.

## Post-close

Day-of call, Day 3 gift + review request, Day 7 thank-you, Day 30 check-in, then enrollment in the 33-Touch annual client-appreciation program.

## See also

- `wiki/real-estate-playbooks/transaction-stages.md` — the day-count deadlines once a listing goes under contract.
- `wiki/real-estate-playbooks/buyer-process.md` — the mirror-image consultation flow on the buyer side.
- `wiki/ai-team/org-chart.md` — Marguerite (Listing Agent) and Simone (Listing Marketing Specialist), the two seats that prep this work.

Source: Command Deck, "Real estate transaction — lead to close" card, from The Ultimate Realtor Playbook (SPACE/LPT operating manual).


---

<!-- source file: wiki/real-estate-playbooks/military-relocation.md -->
# FILE: wiki/real-estate-playbooks/military-relocation.md

# Military relocation

PCS-driven transactions: the ownership-versus-rent question, base-area intelligence, and the dual-licensed referral opportunity that is unique to Steven holding both a real-estate license and a VA-focused MLO license.

## The seat that owns this

Rosa (Military & Corporate Relocation, see `wiki/ai-team/org-chart.md`) runs PCS timelines against a household's actual orders, the BAH-versus-ownership math, base-area intelligence, SCRA awareness, deployed-spouse POA and remote-notarization logistics, and corporate relocation packages for non-military moves. This is analysis and preparation only — the buy/rent decision and every client conversation stay Steven's.

## The VA house-hack mechanism (why PCS and VA eligibility connect)

The mechanism that makes repeat PCS moves work as a wealth strategy: buy a 2–4 unit property, live in one unit, convert it to a rental at the next PCS, and restore or reuse VA entitlement for the next duty station's purchase — repeating the cycle. The same feature that makes VA loans **assumable** (a locked-in low rate transfers to the next buyer) is also what most owners never realize adds resale value to the property they are converting to a rental. See `wiki/mortgage-programs/va-eligibility.md` for the second-tier-entitlement math this depends on, and confirm PCS orders or a new-duty-station letter is documented in the file as the occupancy justification.

## The dual-licensed referral opportunity

A PCS transaction naturally needs both a buy/list-side agent and a VA-savvy lender at the new duty station. Because Steven holds both an LPT Realty license and a VA-focused MLO license (across CA/NV/AZ/FL/IL), he can capture both sides of that same PCS transaction where a single-hat agent or loan officer in a military-relocation referral network cannot. Referral partnerships built around this (e.g., a PCS-focused referral network) are funded through partnership arrangements rather than fees charged to the family — confirm the specific network's structure clears RESPA (`wiki/real-estate-playbooks/referral-reciprocity.md`) before relying on it.

## Known gap — flag rather than guess

The deck's dashboard also runs a separate "Rent, Buy or Wait" military-housing gate (its own refresh skill, tracking BAH-versus-ownership math with live figures). The detailed PCS-timeline tables, tour-length assumptions, and the rent/buy/wait decision gate's actual mechanics were **not found in the real-estate-playbook region of the deck read for this page** — do not invent them here. For a live PCS/BAH-vs-buy question, route to Rosa directly or to the dashboard's Rent-Buy-Wait card rather than to this page, and treat this gap as open until someone sources it properly into the wiki.

## See also

- `wiki/mortgage-programs/va-eligibility.md` — second-tier entitlement, the mechanic behind repeat PCS purchases.
- `wiki/real-estate-playbooks/referral-reciprocity.md` — the RESPA-clean structure a referral network needs.
- `wiki/ai-team/org-chart.md` — Rosa's full seat description.

Source: Command Deck, AI Team org chart (Rosa, Military & Corporate Relocation) and the VA house-hacking narrative card (VA Loan Mastery Playbook, Ch. 41).


---

<!-- source file: wiki/real-estate-playbooks/open-house.md -->
# FILE: wiki/real-estate-playbooks/open-house.md

# Open house — before, during, after

How an open house is run on Steven's listing side and what happens to every visitor afterwards: the
sign-in capture, the Open House Captain's output, Pabbly workflow 9, and the line between what the ISA
does and what only Steven does. As of 2026-10-22. Sources: skill `.claude/skills/open-house-follow-up`
(2026-10-22), `wiki/ai-team/desk-seats.md` § Open House Captain, `integrations/pabbly/WORKFLOWS.md` § B
row 9, `wiki/ai-team/cross-functional.md` (Client Care Pod, Listing Pod).

**Drafts only, everywhere.** Nothing on this page sends an email or text, creates a Lofty lead, quotes
a rate, answers an offer question or signs anything. Those are the ISA's hands (after Steven's yes) or
Steven's licensed acts.

## Who owns what

| Piece | Owner | Notes |
|---|---|---|
| The listing side — seller feedback, the seller weekly report line | Marguerite (Listing Agent) | Listing Pod |
| The visitor side — who is a buyer, who is a neighbour, who has an agent | Gwen (Buyer's Agent) | Lead Pod |
| Sign-in → lead list, thank-you drafts, ISA call list, next-open-house checklist | Open House Captain (Sonnet 5 desk seat, reports to Marguerite / Gwen) | Client Care Pod |
| Compliance line on every draft | Alexandra | gate, runs after the wave |
| Calls the visitors, enters leads in Lofty, sends approved thank-yous | the human ISA / EA (Mon–Fri 12–4 PM PT) | from the ISA Portal |
| Hosts the open house; any price, financing, offer or commission answer | Steven | licensed |

## Before

1. **Launch check** — the listing is live on the MLS and the launch package is done (`listing-launch` skill:
   remarks, flyer, social drafts, seller report template). Broker open first if the launch plan says so.
2. **Sign-in capture** — one Google Form per open house (title: `<street> — <date>`), or a Drive sheet with
   the same columns: first name, last initial, email, phone, "working with an agent?" (yes / no / blank),
   timeline, what they liked, **a consent line for follow-up contact**. The Forms response sheet lives in Drive;
   that is what the Captain reads. A sheet with no consent line → thank-you drafts only, no call list.
3. **Fair-housing setup** — same flyer, same disclosures packet, same greeting for everyone. Nothing in the
   materials describes who "should" live there. Equal Housing Opportunity on the flyer and the sign-in page.
4. **Seller prep** — Marguerite's checklist: lights, staging, valuables away, pets out, disclosures on the counter.

## During

- Greet every visitor the same way; offer the sign-in; offer the disclosures. Do not ask about family
  status, religion, national origin, disability or source of income, and do not steer ("you'd like the
  other side of town better"). Keep the conversation on the house.
- A visitor who says they have an agent is thanked, not solicited (CA: no interference with an existing agency).
- Questions about price, financing, offers, seller motivation or commission → "Steven will follow up" —
  write it on the sheet. The Captain turns those into Needs-Steven packets; no draft answers them.
- Note feedback themes as you go (kitchen, price, layout); they become the seller report line.

## After — the Open House Captain's output (skill `open-house-follow-up`)

Reads: the Forms sheet or Drive sheet (read-only), `loftyLeads` (is the visitor already a lead? match on
first name + last initial only), `tcDeals` (the listing's dates), `reClients` (past clients who came by).

| Output | Where it lands | What it holds |
|---|---|---|
| Lead list | the session answer | first name, last initial, interest (hot / warm / neighbour / agent / past client), timeline, has-agent?, "existing — update, don't create" for Lofty matches |
| Thank-you drafts | Gmail `create_draft`, one per visitor with an email and no "have an agent" | two sentences, the one thing they liked, an offer of comparable homes or the disclosures, Alexandra's line — never sent by the skill |
| ISA call list | `vanessaQueue` item `Open house <street> — ISA call list` | first name, interest, has-agent?, best time, draft id; `p1` for "buying in 30 days" |
| Seller feedback | `vanessaQueue` item `Open house <street> — seller feedback` | visitor count, three themes — themed, never attributed to a named visitor |
| Workflow 9 field map | `integrations/pabbly/templates/workflow-9.md` (first run only) | Forms columns → Lofty lead fields, the 24-hour draft body, the ISA task title |

Deck text carries first names, last initials and interest level only — no phone, email or employer.
Re-running on the same sheet creates no new drafts (dedupe on draft subject `<street> — <first name> <initial>`).

## Pabbly workflow 9 — the unattended version

`integrations/pabbly/WORKFLOWS.md` § B row 9, as of 2026-10-22: trigger **Google Forms / Lofty open-house
sign-in** → **Lofty lead** with source "Open house <address>" → **Gmail draft** 24 hours later → **ISA call task**.
Runs on Pabbly, not on the Claude allowance. Status: a workflow Steven clicks together in Pabbly's editor
(§ C of that file); nothing runs until he turns it on and tells Claude "Pabbly workflow 9 on". Until then the
Captain does the same job in an attended session and the ISA enters the leads by hand. Even on Pabbly the
follow-up is a **draft** — the ISA sends.

## ISA vs Steven

| The ISA does (from the ISA Portal, after Steven's yes) | Only Steven does |
|---|---|
| Calls the call list in priority order, logs the outcome on the ISA line | Hosts; any price opinion, financing answer or offer strategy |
| Enters new leads in Lofty, updates existing ones | A represented buyer's agent asking about commission or an offer deadline |
| Sends the approved thank-you drafts | Approves the thank-you batch once; signs anything |
| Adds the seller feedback line to the weekly report | Decides whether a visitor who asked about financing gets a loan conversation (MLO, NMLS 1921615) |

## Fair-housing notes (reminders, not a ruling)

These are the standing reminders the Captain and the ISA work from. A question about whether a specific
wording or practice is compliant is Alexandra's draft and Steven's decision (HALT list in `CLAUDE.md`).

- Treat every visitor identically: same information, same materials, same follow-up offer.
- No questions or notes about protected characteristics; the sign-in form asks about the house, not the household.
- Thank-you drafts and the flyer carry Equal Housing Opportunity and Steven's licence line (Broker Associate,
  LPT Realty · MLO NMLS 1921615).
- Feedback to the seller is themed ("three visitors mentioned the kitchen"), never "the family with kids said…".
- Interest level is about timeline and intent, never about who the visitor is.

## HALT

- Anything that would send (email, text, Lofty auto-text) → stop; the draft waits.
- A visitor's question about financing, price or offers on the sheet → Needs-Steven packet.
- A represented buyer's agent asking for a commission or deadline answer → Steven only.
- A sheet without a consent line → drafts only, no call list, and say why.

## See also

- `wiki/real-estate-playbooks/listing-process.md` — the launch the open house belongs to.
- `wiki/real-estate-playbooks/post-close-care.md` — what happens once one of these visitors closes.
- `wiki/real-estate-playbooks/sphere-nurture.md` — neighbours and past clients who signed in join the sphere list.
- `wiki/ai-team/push-button-system.md` — where the `vanessaQueue` items go and when the cycle works them.


---

<!-- source file: wiki/real-estate-playbooks/post-close-care.md -->
# FILE: wiki/real-estate-playbooks/post-close-care.md

# Post-close care — day 1, day 10, day 30, then the year

What happens after a real-estate close (Lofty stage → Closed) or a mortgage funding (Zoho deal → Funded):
the three-email sequence, the review-request rules, the twelve-month care touches, who drafts and who sends.
As of 2026-10-22. Sources: skill `.claude/skills/review-request` (2026-10-22), `integrations/pabbly/WORKFLOWS.md`
§ B row 7, `wiki/real-estate-playbooks/transaction-stages.md` (the Funded / Post-close rows),
`wiki/ai-team/desk-seats.md`, `wiki/ai-team/cross-functional.md` (Client Care Pod).

**Drafts only.** The skill and the Pabbly workflow both produce Gmail drafts. The ISA sends each one on its
date, after Steven has approved the three templates once. Nothing here quotes, signs, spends or writes to the
CRM. Gap audit 2026-10-22: before this, nothing owned the review ask.

## Who does what

| Role | Who |
|---|---|
| Owns the sequence, confirms the COE / funding date from `tcDeals` or `pipeline` | Carmen (Transaction Coordinator, under Victor) |
| Writes the three drafts | Delia (Carmen's drafter; the `review-request` skill is her tool) |
| Compliance line on the review ask, the no-inducement check | Alexandra |
| Sends each draft on its day, logs it on the ISA line | the human ISA / EA |
| Approves the three templates once; decides any exception; the congratulations call | Steven |

The twelve-month touches that follow (below) belong to the Sphere Nurture Coordinator with Wren and Sofia —
see `sphere-nurture.md`. This page hands the client to that one on day 30.

## The sequence (skill `review-request`)

Day 0 is the COE date (`tcDeals`) for a real-estate close or the funded date (`pipeline`) for a mortgage.
A buyer who also took the mortgage with Steven gets **one** sequence, not two.

| Day | Subject prefix | Content | Rule |
|---|---|---|---|
| 1 | `[Day 1]` | Thank-you only; the one thing they cared about most (from `wiki/clients/<client>.md` if it exists) | **No ask.** |
| 10 | `[Day 10]` | The review ask: one link — Google Business profile for a real-estate client, Zillow lender profile for a mortgage client | Both links are `{{google_review_url}}` / `{{zillow_review_url}}` placeholders until Steven supplies the URLs; never both links to a dual-side client in one email |
| 30 | `[Day 30]` | Check-in: utilities, first-payment **date** for a mortgage client (date only, no amount), "anything I can fix?" | No pitch, no rate |

Before drafting, Gmail `search_threads` once to confirm the closing thread is quiet (no open repair, no funds
question). Skip the whole sequence if the file closed with a dispute, a credit or an open repair — list it for Steven.

What the skill writes: three Gmail drafts per close (never sent), one `vanessaQueue` item
`Post-close — <first name>: send day 1 on <date>, day 10 on <date>, day 30 on <date>` carrying the three draft
ids, and — first run only — the three templates in `integrations/pabbly/templates/workflow-7.md` with merge
fields (`{{first_name}}`, `{{street}}`, the two review URLs) and the delay values. Deck text is first names only;
the street stays in the draft. Re-running for the same close updates the item rather than adding another.

## Review-request rules (no inducement)

- Nothing of value for a review: no gift, discount, raffle, charity match, "in return", and no request to edit
  a review already left. Google and Zillow policies, and RESPA §8 for anything that could read as a referral
  thing-of-value.
- The wording is "if you were happy with the work, a review helps the next family find us" — never "a 5-star
  review", never conditional.
- Every draft ends with Alexandra's line: Steven Shearrill · Broker Associate, LPT Realty DRE 01988316 · MLO,
  Patriot Pacific Financial NMLS 1921615 · Equal Housing Opportunity.
- The closing gift in the Funded row of `transaction-stages.md` is a thank-you, sent with the day-1 note at
  most. It is never mentioned in the same email as the review ask and never tied to it.
- A review link is only used for a platform Steven has confirmed he has a profile on; otherwise the placeholder stays.
- Proof the batch is clean: grep the three bodies for "gift", "discount", "5-star", "in return" — all absent.

## Pabbly workflow 7 — the unattended version

`integrations/pabbly/WORKFLOWS.md` § B row 7, as of 2026-10-22: trigger **Lofty lead stage → Closed** (or **Zoho
CRM deal → Funded**) → Gmail **drafts** on day 1, day 10 and day 30 through Pabbly's Delay step → a **Google
Calendar task for the ISA** on each of those days. Runs on Pabbly, so it costs no Claude allowance. Status: a
workflow Steven clicks together in Pabbly's editor (§ C of that file); off until he turns it on and says
"Pabbly workflow 7 on". The templates it needs are the ones the skill writes to `workflow-7.md`. Zoho's side
waits on the API permission Steven has to tick (`docs/STEVEN-STEPS.md` 2b). Until the workflow is on, the
`review-request` skill runs in an attended session whenever `tcDesk` shows a deal at COE with no review item.

## The twelve-month care touches

After day 30 the client moves to the sphere list (`sphere-nurture.md`). The standing cadence there, as of
2026-10-22 (skill `past-client-nurture`):

| When | Touch | Drafted by |
|---|---|---|
| Every 90 days without contact | Plain check-in — one question, one offer, no pitch | Sphere Nurture Coordinator / Wren |
| Once a quarter at most | Local market note (three county figures with the doc's own stamp; no rate, no "good time to…") | Sofia (voice), Wren |
| Birthday, if the record has one | Two sentences, Alexandra's line | Wren |
| Month 12 — home anniversary | Two sentences about the house or the year, an offer to help with anything home-related | Wren |
| Mortgage client, around month 12 | The annual mortgage review outreach named in `transaction-stages.md` — a **draft** for Steven; any rate conversation is his | Harrison (with Alexandra) |
| When rates move | The client may appear on the Monday refi watch list — `wiki/mortgage-programs/refi-review-prep.md`; a prep list for Steven only, never a touch | Refi Watch Analyst |

No touch carries a rate, a refi suggestion or a home-value figure. The refi list and the care touches never mix.

## HALT

- A negative review or a complaint anywhere → no ask; Needs-Steven packet.
- Thanking a referral partner (lender, escrow, title) with anything but words → Alexandra, then Steven.
- A client replies with a transaction or loan question → the thread goes to Steven; no draft answers it.
- Anything that would send, schedule a send, or write to Lofty / Zoho → stop.

## See also

- `wiki/real-estate-playbooks/transaction-stages.md` — the Funded and Post-close rows this page expands.
- `wiki/real-estate-playbooks/sphere-nurture.md` — where the client goes after day 30.
- `wiki/real-estate-playbooks/referral-reciprocity.md` — RESPA §8 and the referral ledger.
- `wiki/ai-team/push-button-system.md` — the `vanessaQueue` the day-1/10/30 item lands in.


---

<!-- source file: wiki/real-estate-playbooks/referral-reciprocity.md -->
# FILE: wiki/real-estate-playbooks/referral-reciprocity.md

# Referral & reciprocity

How realtor reciprocal referrals, the referral-partner ledger, and LPT's recruiting/revenue-share pipeline actually run — and the RESPA line that gates all of it.

## The referral-partner ledger

Referral partners are tracked with, at minimum: the partner's name/agent, their metro area, the date of the last check-in call, and whether a **written agreement** is on file. Two standing alerts run off this data:

- A partner **past the quarterly call** cadence (no contact logged in 100+ days) surfaces as an info-level alert to re-engage.
- A partner with **no signed agreement** surfaces as a warning: **a referral fee without a written broker-to-broker agreement is not collectable.** Get the agreement signed before counting on the fee, not after a referral has already closed.

## Reciprocity, both ways

The referral ledger runs both directions — who Steven owes a referral to, and who owes Steven one — with reciprocity scoring and partner tiering. Co-marketing with a reciprocal partner follows the RESPA cost-split rule (each side pays its own fair-market-value share of a joint marketing cost; nothing is structured as compensation for referrals). This lane never contracts a referral exchange on its own — that stays a human, licensed decision.

## RESPA §8 — the gate

**No fee or gift may be tied to a referral.** This is the same anti-kickback/unearned-fee rule covered in `wiki/mortgage-programs/disclosure-timing.md`, and it applies identically to a real-estate reciprocal-referral relationship, an affiliate/sponsorship arrangement, and a vendor-network referral. A settlement-service-adjacent sponsorship candidate is blocked pending a compliance (Alexandra) review before any agreement is signed — never proceed on the assumption that "it's just marketing" clears the bar.

## LPT recruiting and revenue share

Separately from client-referral reciprocity, LPT's sponsored-agent recruiting pipeline runs its own attraction, onboarding, ramp, and downline-health tracking, with an honest value case presented to candidates — recruiting income projections are never promised to a prospective agent. This is downline/revenue-share economics, not client-referral reciprocity, and the two should not be conflated in a single conversation with a partner.

## Vendor network — the multiple-options rule

The vendor bench (inspectors, contractors, title, escrow, etc.) is scored on real outcomes with license and insurance verified, and referrals to it follow a **multiple-options rule** — a client is offered more than one vendor option in a category, which is what keeps the referral RESPA-clean rather than a steered, single-option send.

## See also

- `wiki/mortgage-programs/disclosure-timing.md` — the RESPA §8 rule in full, with its ECOA/Reg Z neighbors.
- `wiki/real-estate-playbooks/listing-process.md` — the geographic-farming/circle-prospecting side that overlaps with partner-facing marketing.

Source: Command Deck, referral-partner tracking data and alert logic (`referralPartners` doc), and the AI Team org chart entries for the Realtor Reciprocal Referral Manager and LPT Recruiting & Revenue Share seats.


---

<!-- source file: wiki/real-estate-playbooks/showing-operations.md -->
# FILE: wiki/real-estate-playbooks/showing-operations.md

# Showing operations

How a showing actually gets booked: itinerary building, the ShowingTime-vs-Showami choice, and feedback capture — plus the hard rule on what an automation may never do here.

## The itinerary and route planner

Enter the day's showings in order on the Showings tab, then open the whole run as one multi-stop Google Maps route (Google Maps takes up to 9 stops between start and finish). The itinerary syncs across devices. For each property the method is one of: **ShowingTime request**, **Showami showing agent**, **Steven shows**, or **ISA coordinates**. Status runs planned → requested → confirmed → shown → feedback logged.

## ShowingTime vs. Showami

- **ShowingTime**: standard showing-request channel to the listing agent.
- **Showami**: books a licensed, independent showing agent to physically show the property so Steven stays on licensed work he alone can do (consultation, negotiation, the file). Post the request directly at showami.com, or hand the itinerary to the ISA to book.

## The one rule that never moves

**Showings never contact a client or listing agent from an automation.** "Send to ISA" drops the itinerary and a coordination checklist (access arrangements with listing agents, buyer confirmations, Showami booking, feedback capture after each stop) onto the ISA line; it reaches the ISA Portal on the next hourly bridge run and a **human** — the ISA — makes the actual contact, confirmation, and booking. No agent, task, or routine sends a showing request, books a Showami agent, or confirms with a client directly.

## Automation status — read this before assuming something is live

Showami markets API automation to brokerage/enterprise accounts, but no public developer documentation, base URL, or auth scheme has been found (checked against showami.com, which was unreachable from the research sandbox at last check). The only path that works today is the manual one: **Open Showami** / **Copy Showami request** buttons that pre-fill a complete request for copy-paste. A browser-automation (DOMShell) path for Showami is spec'd but **not installed**, and is deliberately gated: posting a showing request hires a person and spends money, so that verb stays off until Steven approves it in writing. The same gate applies to ShowingTime.

## Feedback capture

Every stop has a feedback field logged after the showing, which feeds the buyer-matching/revealed-preference analysis (Tobias, `wiki/ai-team/org-chart.md`) and the weekly curated-listing batch referenced in `wiki/real-estate-playbooks/buyer-process.md`.

## See also

- `wiki/real-estate-playbooks/buyer-process.md` — where "Active search" showings sit in the buyer stage table.
- `wiki/ai-team/tool-integration-status.md` — the CLI-Anything / DOMShell automation status in full, including why the write verbs stay off.

Source: Command Deck, "Showings — schedule by client" panel and the CLI-Anything connectors card (checked 2026-09-22).


---

<!-- source file: wiki/real-estate-playbooks/sphere-nurture.md -->
# FILE: wiki/real-estate-playbooks/sphere-nurture.md

# Sphere nurture — the list, the monthly touches, the 11th-of-month routine

How past clients and the wider sphere are kept warm without anything being sent by a machine: what the
sphere list holds, which touches go out each month, how the 11th-of-month routine and Pabbly workflow 8
divide the work, and what Steven alone does. As of 2026-10-22. Sources: skill
`.claude/skills/past-client-nurture` (2026-10-22), cloud routine `trig_01Pn8xLNKTVVFYjYTj8d8JTd`
(`docs/inventory/cloud-routines-2026-10.md`), `integrations/pabbly/WORKFLOWS.md` § B row 8,
`wiki/ai-team/desk-seats.md` § Sphere Nurture Coordinator, `wiki/ai-team/org-chart.md` § What the desks run on,
`.claude/skills/cos-daily-cycle` (the `listOutbox` → `sphereList` move).

**Drafts only.** Every touch is a Gmail draft or a `marketingQueue` item marked "awaiting Steven". The ISA sends
after Steven approves the month's batch. No touch carries a rate, a refi suggestion or a home-value figure.

## Who does what

| Role | Who |
|---|---|
| The month's nurture calendar and the draft for each touch | Sphere Nurture Coordinator (Sonnet 5 desk seat, reports to Sofia, with Wren) |
| Voice of the market note | Sofia (CMO) |
| The referral ask — only when it fits (`referral-reciprocity.md`) | Wren |
| Compliance line on every draft; RESPA §8 on anything of value | Alexandra |
| Keeps the list current, sends the approved drafts, works the call list | the human ISA / EA |
| Supplies the list in the first place; approves the batch; personalises three by hand | Steven |

## The sphere list — `sphereList` on the Command Deck

`sphereList` is `{v: {people: [...]}}` in the deck's `state` collection. Each person (fields as the ISA Portal's
intake form writes them, 2026-10-22):

| Field | Means |
|---|---|
| `first` | First name only — the deck never holds a surname, address or email |
| `relation` | past client · referral partner · friend / family · neighbour · lead that went quiet |
| `lastTouch` | Date of the last real contact (drives the 90-day check-in) |
| `birthdayMonthDay` | `MM-DD`, if known |
| `homeAnniversaryMonthDay` | `MM-DD` of the close — the home-purchase anniversary |
| `note` | One line Steven or the ISA wants remembered (never PII, never a loan figure) |
| `ts`, `status` | When the row was written; `pending` → `moved` once the cycle copies it in |

Three ways a row gets in: Steven tells Claude "sphere list: <first name>, <relation>, <birthday>, <home
anniversary>" (`docs/STEVEN-STEPS.md` 6b); the deck's own form; or the ISA Portal's intake form, which writes
`listOutbox.v.sphere` — the 6:25 AM daily cycle moves pending rows to `sphereList.v.people`, de-duplicated by first
name + month, and marks them `moved`. Addresses and emails live in Steven's records and the Gmail draft, not here.
The older inputs the skill also reads: `reClients` (past real-estate clients) and `pipeline` (funded mortgage clients).

## The monthly touches (skill `past-client-nurture`)

| Touch | Who gets it | Content | Cap |
|---|---|---|---|
| Market note | everyone, at most once a quarter | Three county numbers from the housing feeds / `ratesSnapshot` county rows (median price, days on market, months of supply) "as of <the doc's stamp>". No mortgage rate, no "now is a good time", no forecast | quarterly |
| Home anniversary | `homeAnniversaryMonthDay` in this month | Two sentences about the house or the year; an offer to help with anything home-related; Alexandra's line | yearly |
| Birthday | `birthdayMonthDay` in this month | Two sentences; Alexandra's line | yearly |
| 90-day check-in | `lastTouch` older than 90 days | One question, one offer, no pitch | per quarter |

Skipped and listed as skipped: anyone with an open transaction, an open complaint or a do-not-contact flag; anyone
whose email is missing or bounced last time (listed for the ISA — never a guessed address). Gmail `search_threads`
is read once per person so a touch never lands on top of an open transaction thread.

What the skill writes: one Gmail draft per touch (`create_draft`, never `send_message`); one `marketingQueue` item per
touch `{id, ts, kind: nurture-market | nurture-anniversary | nurture-birthday | nurture-checkin, client: <first name>,
status: "awaiting Steven", draftId, from}`; one `vanessaQueue` item `Sphere touches — <month>` for the ISA with the
first-name list, the kind of touch and the draft id each; and, first run only, the three Pabbly templates in
`integrations/pabbly/templates/workflow-8.md` (`{{first_name}}`, `{{close_year}}`, `{{street}}` — no real name in it).
Running it again the same month adds nothing (dedupe on client + kind + month).

## The 11th-of-month routine — `trig_01Pn8xLNKTVVFYjYTj8d8JTd`

"Sphere & past-client touches — monthly drafts (day 11, 7:40 AM PT, drafts only)". Cron
`CRON_TZ=America/Los_Angeles 40 7 11 * *`, created 2026-10-22, enabled, **first run 2026-11-11** — nothing has run
yet. It reads `sphereList` and the housing feeds in `liveFeeds`, writes `sphereTouches` (the month's list),
`marketingQueue` drafts and the `vanessaQueue` ISA call list; Alexandra's line on every draft; nothing sent. It runs
on the 11th because the 1st and 2nd were the days the weekly Claude allowance was already spent
(`docs/ROUTINE-BUDGET-2026-10-22.md`). Before the 11th each month the same job can be run by hand: "who should I
touch this month" wakes the skill in an attended session. Judge it by the `sphereTouches` stamp, never by the
routine's "succeeded" (`wiki/dashboard-ops/index.md`, the one rule).

## Pabbly workflow 8 — the dated touches, unattended

`integrations/pabbly/WORKFLOWS.md` § B row 8, as of 2026-10-22: a **daily 7:00 AM PT scheduler** matches today's
birthdays and home-purchase anniversaries in **Google Sheets / Lofty** → a **Gmail draft** per match from the
workflow-8 templates → a **Slack list to the ISA** (first names only). Runs on Pabbly, no Claude allowance. Status:
Steven clicks it together in Pabbly's editor (§ C); off until he says "Pabbly workflow 8 on". Division of labour once
it is on: Pabbly drafts the **dated** touches on the day; the 11th routine still does the market note, the 90-day
check-ins and the ISA call list. Pabbly's drafts are drafts too — the ISA sends.

## What Steven does

- Supplies the list (6b in `docs/STEVEN-STEPS.md`) and keeps it honest; the ISA maintains it after that.
- Approves the month's batch; personalises the three the skill names by hand (longest relationship, biggest file,
  most recent referral).
- Takes any reply that turns into a transaction or loan question — the skill never answers one.
- Decides anything of value (a gift, a referral incentive) after Alexandra's RESPA §8 review.

## HALT

- A touch would carry a gift, incentive or anything of value → Alexandra, then Steven.
- A rate, a refi hint or a home-value figure in a touch → stop; that is `refi-review-prep.md`'s separate list.
- Sending, scheduling a send, or writing to Lofty / the calendar → stop; drafts only.

## See also

- `wiki/real-estate-playbooks/post-close-care.md` — the day 1 / 10 / 30 sequence that feeds this list on day 30.
- `wiki/real-estate-playbooks/referral-reciprocity.md` — when a referral ask fits, and the ledger.
- `wiki/mortgage-programs/refi-review-prep.md` — the Monday refi watch; a different list, never mixed in.
- `wiki/ai-team/push-button-system.md` — the queue, the schedule and the ISA Portal's `listOutbox`.


---

<!-- source file: wiki/real-estate-playbooks/transaction-stages.md -->
# FILE: wiki/real-estate-playbooks/transaction-stages.md

# Transaction stages

Stage definitions on both sides of a deal — the real-estate closing checklist and the parallel mortgage-file stage table — with the deadline that actually defines each stage, computed from the contract date rather than a template default.

## The six-phase Transaction Coordinator checklist

Day offsets below are counted from the contract acceptance date (day 0), per the SOP:

| Phase | Day (from acceptance) |
|---|---|
| File setup — open escrow, **earnest money deposit (EMD) receipted** | 3 |
| California disclosures delivered (TDS/SPQ/NHD/Lead Paint/HOA/AVID/SBSA) | 7 |
| Inspection / due-diligence window closes | 17 |
| Contingency removal | 21 |
| Appraisal & loan conditions (VA: Tidewater/NOV inside this window) | 25 |
| Clear to close → closing & funding | 30 |

**The EMD line is not a formality — it is the earliest hard deadline in the file, and a missed EMD deadline can put the buyer in default.** Confirm delivery and receipt inside the *contract's own* deadline, not the SOP's generic day-3 target, whenever the actual RPA states something different. Every date on this table should be recomputed from the real contract, never assumed from the template.

## Real-estate stage-by-stage ownership

See `wiki/real-estate-playbooks/buyer-process.md` for the full buyer-side table (Lead → Consult scheduled → Pre-approved → Active search → Offer written → Under contract → Escrow/inspection → Clear to close → Closed → Post-close follow-up) and `listing-process.md` for the seller-side consultation-to-close flow. Both funnel into the six-phase checklist above once a file goes under contract.

## The parallel mortgage-file stage table

| Stage | Owner | Action |
|---|---|---|
| Lead | ISA | Same-day response; secure application link within 1 hour |
| Application taken | Loan Processor | Order credit + AUS same day; disclosures out within 3 business days (TRID) |
| Processing | Loan Processor | Collect conditions checklist; weekly status call/text to client + agent |
| Underwriting | Steven + Loan Processor | Submit a complete file; flag any condition risk before UW asks |
| Conditional approval | Loan Processor | Same-day condition clearing; confirm appraisal ordered/received |
| Clear to close | Steven | Confirm CD 3-day rule; personally call the client to review numbers before signing; verify wire instructions verbally |
| Funded | ISA | Congratulations call + closing gift; request a review |
| Post-close follow-up | ISA | Rate-watch alert for a future refi; annual mortgage review outreach |

This table runs in parallel with the real-estate table above whenever the same file has both a listing/purchase side and a Steven-originated loan — the two clocks (TRID's LE/CD timing and the CA disclosure/EMD timing) do not share a start date and must both be tracked.

## Wire fraud protocol

All wiring instructions, on either table, are confirmed by an **outbound phone call to a known number** — never trusted from an email.

## See also

- `wiki/mortgage-programs/disclosure-timing.md` — the regulatory TRID/RESPA clock behind the mortgage-side rows.
- `wiki/real-estate-playbooks/buyer-process.md` / `listing-process.md` — the consultation flow that feeds into this table.

Source: Command Deck, "Real estate transaction — lead to close" card (6-phase TC SOP) and the stage-based service playbook data (RE_STAGE_PLAYBOOK / MLO_STAGE_PLAYBOOK), from The Ultimate Realtor Playbook and The Ultimate Mortgage Broker SOP.
