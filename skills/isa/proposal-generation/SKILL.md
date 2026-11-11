---
name: proposal-generation
description: A full proposal draft in your structure. Installed in Steven's Broker Command Center AI Call Center (ISA Skill Desk).
---

# Proposal Generation

**Built for:** California real estate broker associate + MLO (LPT Realty)
**Reads before it acts:** `deals/pricing.md`, `voice.md`, `sales/offer.md`, `sales/proof.md`
**AI seat:** Harrison

## What it does
Takes the first pass so Steven approves instead of produces. Call transcript or notes, the pricing file and past proposals. Hands back: A full proposal draft in your structure. Nothing goes out without a human.

## Steps
1. Read the pricing file, then the full transcript or notes — never answer from the last message alone.
2. Identify the stage (new lead, warm, went quiet, ready to buy) and say why.
3. Draft the proposal: their situation, goals, recommended plan (listing / buying / loan options), what is included, next steps and timeline — prices and terms only from the pricing file; otherwise [PLACEHOLDER].
4. Flag anything uncertain instead of guessing. Never invent a price, rate, date or promise.
5. Queue the draft for approval with a two-line summary.

## Output
A full proposal draft in your structure. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails
- Drafts only. Never send, post, invoice or book on Steven's behalf.
- Use only facts from the context files. If it is not written down, ask.
- California / federal guardrails: drafts only — never send, book, quote a rate or promise approval, price or timeline. No fair-housing preference language (describe homes, not people). TCPA: calls/texts only with consent, honor STOP/DNC, 8 AM–9 PM local; AI voice needs prior express written consent. CAN-SPAM for email: identify sender, include opt-out. RESPA §8: no referral fees or kickbacks. Mortgage: no specific rate/APR unless from the pricing file and with required disclosures; NMLS# in mortgage marketing. Real estate: DRE# on first-contact materials; buyer representation agreement before touring (AB 2992).
- Log every run: date, input, output, open questions.
