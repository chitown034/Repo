---
name: past-client-nurture
description: "Monthly sphere-touch marketing drafts for Steven's past clients from reClients and pipeline — a local market note, home-purchase anniversaries and birthdays, and a plain check-in — as Gmail drafts plus the three templates Pabbly workflow 8 needs; marketing drafts only, nothing sent, no rate in any touch. Use when Steven says 'who should I touch this month', 'anniversary emails', 'past-client campaign', or when the ISA asks for the month's sphere list."
---
# past-client-nurture — the monthly sphere touches

Owners: **Sofia** (CMO) for the voice and the market note; **Wren** drafts the touches. Pabbly **workflow 8**
(`integrations/pabbly/WORKFLOWS.md` §B: daily 7:00 AM PT matcher → Gmail draft per birthday/anniversary + Slack list to
the ISA) runs this unattended once Steven clicks it together; until then, and for the market note, this skill does it in
an attended session.

## Reads
- **Command Deck** `state`: `reClients` (past real-estate clients: first name, close date, property), `pipeline` (funded
  mortgage clients), `ratesSnapshot` (market figures for the note — the county numbers, **not** the rate rows),
  `marketingQueue` (last month's touches, to avoid repeats).
- `wiki/clients/<client>.md` when one exists for the person — whole file.
- Gmail `search_threads` only to check the last exchange with that person (so a touch never lands on top of an open
  transaction thread).

## Writes
- **Gmail** `create_draft` — one draft per touch, to the address Steven's record holds; never `send_message`.
- `marketingQueue` (`if_version`): one item per touch `{id:"mq_<ms>", ts, kind:"nurture-market"|"nurture-anniversary"|
  "nurture-birthday"|"nurture-checkin", client:<first name>, status:"awaiting Steven", draftId, from:"past-client-nurture"}`.
- `vanessaQueue`: one item for the ISA — `task:"Sphere touches — <month>"`, note = the first-name list with the kind of touch
  and the draft id each.
- **Pabbly workflow 8 templates** (first run only, then on change): the three bodies (birthday, anniversary, check-in) with
  `{{first_name}}`, `{{close_year}}`, `{{street}}` merge fields, written to `integrations/pabbly/templates/workflow-8.md`
  for Steven to paste into the Pabbly Gmail-draft step.

## Procedure
1. Build this month's list: anniversaries (close date month), birthdays if the record has one, everyone not touched in
   90 days (check-in), and all of them get the market note at most once a quarter.
2. **Market note**: three county numbers from `ratesSnapshot` (median price, days on market, months of supply) with the
   doc's own stamp — "as of <syncedAt>". No mortgage rate, no "now is a good time", no forecast.
3. **Anniversary / birthday**: two sentences, the house or the year, an offer to help with anything home-related, and
   Alexandra's line. **Check-in**: one question, one offer, no pitch.
4. Draft, queue, hand the list to the ISA, and tell Steven: how many touches, which kinds, and the three he should
   personalise by hand (longest relationship, biggest file, most recent referral).

## Guardrails
- Drafts only. The ISA sends after Steven approves the month's batch; Pabbly's drafts are drafts too.
- No rate, no refi suggestion, no "your home is worth" figure in any touch (`refi-watch` is a separate, Steven-supplied
  list; this skill never crosses into it).
- Deck and Slack text: first names only. Addresses and emails live in the Gmail draft.
- Someone with an open transaction, an open complaint, or a "do not contact" flag in the record is skipped and listed
  as skipped.

## HALT
- A client replies with a transaction question → the thread goes to Steven; the skill never answers.
- A touch would carry a referral incentive, a gift, or anything of value → Alexandra reviews (RESPA §8), Steven decides.
- The record's email is missing or bounced last time → list it for the ISA, do not guess an address.

## What proves it worked
- `marketingQueue` holds one item per touch with a `draftId` that `get_draft` resolves; no sent mail this run.
- The `vanessaQueue` list and the drafts agree in count and first names.
- `integrations/pabbly/templates/workflow-8.md` exists, three templates, merge fields only — no real name in it.
- Running it again the same month adds nothing (dedupe on client + kind + month).
