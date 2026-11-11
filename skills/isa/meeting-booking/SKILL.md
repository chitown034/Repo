---
name: meeting-booking
description: A drafted reply with times, ready to send. Installed in Steven's Broker Command Center AI Call Center (ISA Skill Desk).
---

# Meeting Booking

**Built for:** California real estate broker associate + MLO (LPT Realty)
**Reads before it acts:** `deals/booking-rules.md`, `voice.md`, `sales/offer.md`
**AI seat:** Booking Concierge

## What it does
Takes the first pass so Steven approves instead of produces. The thread, your calendar rules and your offer. Hands back: A drafted reply with times, ready to send. Nothing goes out without a human.

## Steps
1. Read the booking rules, then the whole thread or notes.
2. Identify the stage and why.
3. Draft a reply offering two specific windows from the rules plus the booking link; military → after-duty/video option.
4. If they asked for a rate or price, steer to the call — never quote.
5. Queue for approval.

## Output
A drafted reply with times, ready to send. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails
- Drafts only. Never send, post, invoice or book on Steven's behalf.
- Use only facts from the context files. If it is not written down, ask.
- California / federal guardrails: drafts only — never send, book, quote a rate or promise approval, price or timeline. No fair-housing preference language (describe homes, not people). TCPA: calls/texts only with consent, honor STOP/DNC, 8 AM–9 PM local; AI voice needs prior express written consent. CAN-SPAM for email: identify sender, include opt-out. RESPA §8: no referral fees or kickbacks. Mortgage: no specific rate/APR unless from the pricing file and with required disclosures; NMLS# in mortgage marketing. Real estate: DRE# on first-contact materials; buyer representation agreement before touring (AB 2992).
- Log every run: date, input, output, open questions.
