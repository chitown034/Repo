---
name: open-house-follow-up
description: "After an open house: read the sign-in sheet (Google Forms export or a Drive sheet), build the lead list with first names and interest level, draft the thank-you emails as Gmail drafts, and write the ISA call list — plus the field map Pabbly workflow 9 needs to create the Lofty leads and the 24-hour follow-up draft unattended. Drafts only; the ISA calls, nothing is sent, nothing written to Lofty by the skill. Use when Steven says 'open house follow-up', 'who came Sunday', 'thank-you emails for the open house', or the Lead Pod is handed a sign-in sheet."
---
# open-house-follow-up — sign-in sheet → leads, drafts, call list

Owners: **Marguerite** (Listing Agent — the seller's side: feedback and the seller report line) and **Gwen** (Buyer's Agent —
the visitor side: who is a buyer, who is a neighbour). Lead Pod rules (`wiki/ai-team/cross-functional.md`): call list for
the ISA, follow-up drafts, Alexandra's line on each. Pabbly **workflow 9** (`integrations/pabbly/WORKFLOWS.md` §B) is the
unattended version: Forms/Lofty sign-in → Lofty lead with source "Open house <address>" → Gmail draft 24 h later → ISA
task.

## Reads
- **Google Drive** (read): the Forms responses sheet or the scanned sign-in (`search_files` by the address and date →
  `read_file_content`).
- **Command Deck** `state`: `loftyLeads` (is the visitor already a lead? match on first name + last initial only),
  `tcDeals` (the listing's dates, for the "offers reviewed on…" line), `reClients` (past clients who dropped by).
- `wiki/real-estate-playbooks/listing-process.md` § open house, one page.

## Writes
- **Gmail** `create_draft` — one thank-you per visitor with an email on the sheet; never `send_message`.
- `vanessaQueue` (`if_version`), two items: `task:"Open house <street> — ISA call list"` (first name, interest, has-agent?,
  best time, draft id; `priority:"p1"` for anyone marked "buying in 30 days"), and `task:"Open house <street> — seller
  feedback"` (visitor count, three feedback themes, for Marguerite's seller weekly report).
- **Pabbly workflow 9 field map** (first run only): `integrations/pabbly/templates/workflow-9.md` — the Forms columns →
  Lofty lead fields (first/last/email/phone/source/notes), the 24-hour draft body with `{{first_name}}` and `{{street}}`,
  and the ISA task title. Steven pastes it into the Pabbly editor.

## Procedure
1. Parse the sheet into rows: first name, last initial, contact on file (yes/no — the deck never gets the contact
   itself), represented by an agent (yes/no/blank), timeline, interest (hot/warm/neighbour/agent/past client), feedback.
2. Dedupe against `loftyLeads` by first name + last initial; mark matches "existing — update, don't create".
3. Thank-you drafts: two sentences, the one thing they said they liked, the offer to send comparable homes or the
   disclosures, Alexandra's line. A visitor who wrote "have an agent" gets the thank-you with **no** solicitation
   (CA law: no interference with an existing agency) and is left off the call list.
4. Call list to the ISA; feedback item to the seller side; tell Steven the counts and the two or three hot ones by first name.

## Guardrails
- The skill never creates, updates or texts a Lofty lead; Pabbly workflow 9 does that only after Steven turns it on.
- Deck text: first names and last initials, interest level, no phone, no email, no employer.
- Feedback to the seller is themed, never attributed ("three visitors mentioned the kitchen", not "Dana said…").
- A sheet with no consent line for contact → thank-you drafts only, no call list, and say why.

## HALT
- A visitor asks about financing, a price opinion, or an offer strategy on the sheet → Needs-Steven packet; the draft
  does not answer it.
- A represented buyer's agent asks for a commission or offer-deadline answer → Steven only.
- Anything that would send (email, text, Lofty auto-text) → stop.

## What proves it worked
- Drafts count = visitors with an email and no "have an agent" opt-out; each ends with Alexandra's line; none sent.
- Two `vanessaQueue` items, versions pinned, first names only, each hot visitor with a draft id.
- `integrations/pabbly/templates/workflow-9.md` exists with merge fields and no real visitor data.
- A second run on the same sheet creates no new drafts (dedupe on draft subject = "<street> — <first name> <initial>").
