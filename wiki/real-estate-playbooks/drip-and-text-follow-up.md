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
