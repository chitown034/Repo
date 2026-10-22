---
name: review-request
description: "After a Lofty close or a Zoho funding: draft the three post-close emails — day-1 thank-you, day-10 review request with Google and Zillow link placeholders, day-30 check-in — as Gmail drafts, with the timing rules and the no-inducement wording, and the three templates Pabbly workflow 7 needs for the Lofty Closed / Zoho Funded trigger. Drafts only; the ISA sends after Steven approves. Use when Steven says 'ask for a review', 'we closed on…', 'post-close emails', or when tcDesk shows a deal at COE with no review item."
---
# review-request — post-close care and the review ask

Owner: **Carmen** (Transaction Coordinator, under Victor); **Delia** writes the drafts. Pabbly **workflow 7**
(`integrations/pabbly/WORKFLOWS.md` §B: Lofty stage → Closed, or Zoho deal → Funded, then Gmail drafts on day 1 / 10 / 30
via Pabbly's Delay step + a Google Calendar task for the ISA each day) is the unattended version. Gap audit 2026-10-22:
nothing owned the review ask.

## Reads
- **Command Deck** `state`: `tcDeals` (COE date, side, client first name), `pipeline` (funded date), `reClients`.
- `wiki/clients/<client>.md` if present — whole file (the thing they cared about most is the thank-you's one sentence).
- Gmail `search_threads` once, to confirm the closing thread is quiet (no open repair, no funds question).

## Writes
- **Gmail** `create_draft` × 3 per close (subjects prefixed `[Day 1]`, `[Day 10]`, `[Day 30]`); never sent by the skill.
- `vanessaQueue` (`if_version`): one item `task:"Post-close — <first name>: send day 1 on <date>, day 10 on <date>, day 30 on
  <date>"`, `from:"review-request"`, note = the three draft ids. The ISA sends each on its date after Steven's one-time
  approval of the templates.
- **Pabbly workflow 7 templates** (first run only): `integrations/pabbly/templates/workflow-7.md` — three bodies with
  `{{first_name}}`, `{{street}}`, `{{google_review_url}}`, `{{zillow_review_url}}` merge fields, and the delay values.

## Timing rules
- Day 1 (COE or funding + 1): thank-you only. No ask.
- Day 10: the review ask, one link for real-estate (Google Business profile) and one for a mortgage client (Zillow lender
  profile) — both as `{{…}}` placeholders until Steven supplies the URLs; never both links to a dual-side client in one email.
- Day 30: check-in — utilities, first payment date for a mortgage client (date only, no amount), "anything I can fix".
- Skip entirely if the file closed with a dispute, a credit, or an open repair; list it for Steven instead.

## Alexandra's line on the review ask
Steven Shearrill · Broker Associate, LPT Realty DRE 01988316 · MLO, Patriot Pacific Financial NMLS 1921615 · Equal
Housing Opportunity — **and** no gift, discount, raffle, charity match or anything of value for a review (Google and
Zillow policies; RESPA §8 for anything that could read as a referral thing-of-value). The ask reads "if you were happy
with the work, a review helps the next family find us" — never "a 5-star review", never conditional wording.

## Guardrails
- Drafts only; the skill never sends, and never schedules a Pabbly send — workflow 7 produces drafts too.
- Deck text: first names only. The street stays in the draft.
- No "we'd love a 5-star", no reward, no "in return", no request to edit a review they already left.
- One sequence per close; a buyer who also took the mortgage gets one sequence, not two.

## HALT
- The client left a negative review or a complaint anywhere → no ask; Needs-Steven packet.
- A referral partner (lender, escrow) is to be thanked with anything but words → Alexandra, then Steven.
- A review link is for a platform Steven has not confirmed he has a profile on → placeholder stays, no guess.

## What proves it worked
- Three drafts per close in `list_drafts`, each with Alexandra's line, none with a reward word (grep the bodies for
  "gift", "discount", "5-star", "in return").
- One `vanessaQueue` item with the three dates computed from the COE/funding date in `tcDeals`/`pipeline`.
- `integrations/pabbly/templates/workflow-7.md` exists with merge fields only.
- Re-running for the same close updates the item rather than adding another.
