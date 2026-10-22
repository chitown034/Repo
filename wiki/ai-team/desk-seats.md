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
