---
name: listing-launch
description: "Prepare a listing launch for a seller Steven has signed: the launch checklist, MLS public and private remarks drafts, Canva flyer and social-post drafts, and the seller weekly-report template — marketing drafts only, nothing published, nothing entered in the MLS. Use when Steven says 'launch the listing on…', 'write the remarks', 'make the flyer', 'set up the seller report', or when the Listing Pod is asked for a launch package."
---
# listing-launch — the Listing Pod's launch package

Owners: **Marguerite** (Listing Agent) for the checklist, remarks and seller report; **Sofia** (CMO) for the flyer and
social drafts. Bianca assists; Alexandra's line on every seller-facing or public draft. Gap audit 2026-10-22: the
Listing Pod existed on paper with no runnable package.

## Reads
- `wiki/real-estate-playbooks/listing-process.md` (the checklist source) — one page.
- **Command Deck** `state`: `tcDeals` (the listing's dates), `reClients` (seller first name, property), `marketingQueue`
  (what is already drafted for this address).
- **Google Drive** (read): photos folder, the signed listing agreement (for list price and term — read, never restated
  as advice), any CMA Steven ran.
- Canva: `search-brand-templates` / `search-designs` for the LPT listing templates.

## Writes
- `marketingQueue` (`if_version` pinned, append one item per draft): `{id:"mq_<ms>", ts, kind:"mls-remarks"|"flyer"|
  "social"|"seller-report", property:<street>, status:"awaiting Steven", canvaDesignId?, text?, from:"listing-launch"}`.
- Canva `create-design` / `edit-design` for the flyer and the social set — private designs, **never** `publish-brand-template`,
  never exported to a channel.
- `vanessaQueue`: one item `task:"Listing launch — <street>: checklist"` carrying the checklist with owners (Steven / ISA /
  photographer / stager) and dates counted back from the go-live date Steven gave.

## The package
1. **Checklist** — pre-list (disclosures ordered, photos, sign, lockbox, pre-inspection?), go-live day (MLS entry by
   Steven, syndication check, broker open), week one (open house, feedback loop, price review date).
2. **MLS remarks** — public (≤ 1,000 characters, features not adjectives, no occupancy or protected-class language,
   no "perfect for…" phrasing) and private agent remarks (showing instructions, offer deadline if any, compensation
   line left **blank for Steven**).
3. **Flyer + social** — Canva drafts from the LPT template; price and terms as Steven stated them; identity line and Equal
   Housing logo on every piece; no "just sold", "coming soon" or off-market language unless the MLS rules allow it that day.
4. **Seller weekly report template** — showings, feedback, online views, price-per-square-foot of new competition, next
   steps; filled by the showing assistant's data each week, sent by Steven.

## Guardrails
- Nothing is published, posted, entered in the MLS, or sent to the seller. Every artifact sits in `marketingQueue` as
  "awaiting Steven" or as a private Canva design.
- Fair-housing language check on every public word (Alexandra's list: no familial, religious, disability, origin or
  "safe neighbourhood" wording). A flagged phrase is rewritten, not left for Steven to catch.
- The list price is Steven's number from the signed agreement. The skill never suggests a price, a reduction or a
  "likely sale" figure.
- Deck text: street name and seller first name only.

## HALT
- The seller asks for a price opinion, a commission change, or a dual-agency question → Needs-Steven packet.
- Any Canva publish, export to a social channel, or a paid Canva element → stop (money, publication).
- Photos that show people, licence plates or interior documents → flag for Steven before any design uses them.

## What proves it worked
- Four `marketingQueue` items for the address, each `status:"awaiting Steven"`, none `published`.
- The Canva designs open from `search-designs` and show no publish/export history.
- The checklist item in `vanessaQueue` has an owner and a date on every line, counted from the go-live date given.
- A second run for the same address updates the four items instead of adding four more.
