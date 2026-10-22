---
name: meeting-recap-to-crm
description: "Turn a recorded client or partner meeting (Fieldy pendant, Zoom for Claude) into a recap — decisions, action items, a follow-up Gmail draft and a CRM note queued on the deck for the ISA to paste into Lofty or Zoho. Drafts only: the skill never writes to the CRM, never sends. Use when Steven says 'recap my meeting with…', 'what did I promise on the call', 'draft the follow-up', or when the Inbox & Meetings card shows a meeting with no recap."
---
# meeting-recap-to-crm — recording → recap → drafts → queue

Owner: **Victor** (CRO); worked by Carmen (deal context) and Harrison (loan mechanics named on the call). Chosen by the
gap audit of 2026-10-22: meetings were recorded (Fieldy since 2026-10, Zoom) and nothing turned them into CRM notes
or follow-ups. Attended sessions only — the connectors below are not available to cloud routines.

## Reads
- **Fieldy**: `fieldy_browse_conversations` (date range or person) → `fieldy_get_conversation` (summary + transcript;
  the transcript is the ground truth, the summary can be null).
- **Zoom for Claude**: `search_meetings` → `get_meeting_assets` (recording summary, transcript).
- **Command Deck** (`state`, ArtifactData, note versions): `inboxDesk` (which meetings are already recapped),
  `tcDeals` / `pipeline` / `reClients` (only to match the attendee to an open file by first name).
- `wiki/clients/<client>.md` if the attendee is a named client — read whole, per the router.

## Writes
- **Gmail** `create_draft` only — the follow-up to the attendee, never `send_message`, never `reply`.
- **vanessaQueue** (append-only, `if_version` pinned): one item per meeting
  `{id:"vq_<ms>", ts, task:"CRM note — <first name>, <date>", priority:"p2", status:"pending", from:"meeting-recap-to-crm", ref:<fieldy or zoom id>, note:<the CRM note text>}`.
  The ISA pastes the note into Lofty (real-estate) or Zoho (mortgage) at the noon huddle. The skill writes to neither.
- `inboxDesk` (`if_version`): mark the meeting `recapped: true` with the queue id — the only deck field it changes.

## Procedure
1. `bin/brain recall "<attendee or topic>"` once. Find the recording (Fieldy first, Zoom second). One meeting per run.
2. Extract, in this order, quoting the transcript where the wording matters: **decisions** (who decided what),
   **action items** (owner, due date, as said on the call — never invented), **open questions**, **anything on the HALT
   list** said aloud (a rate, a price, an eligibility opinion) — those become a Needs-Steven packet in `twinQueue`, not a
   draft.
3. Write the CRM note (≤ 120 words, first name only, no phone/email/address/loan number) and queue it (Writes above).
4. Draft the follow-up email: what was agreed, what Steven owes, what the client owes, next date. Add **Alexandra's
   line** (identity: Steven Shearrill · Broker Associate, LPT Realty DRE 01988316 · MLO, Patriot Pacific Financial NMLS
   1921615 · Equal Housing Opportunity) on every client-facing draft; no rate, no "approved", no "guaranteed".
5. Tell Steven in plain words: three decisions, the action items with dates, the draft id, the queue id.

## Guardrails
- Never write to Lofty, Zoho, Notion CRM pages, a calendar invite to a third party, or SkySlope. Queue, don't write.
- Never paraphrase a number the client said as a commitment Steven made. A quote heard on a call stays a quote with
  a speaker attached.
- Dashboard text: first names only. Full names, numbers, addresses stay in the Gmail draft and the recording.
- A recording with no transcript (Fieldy summary null, Zoom assets empty) → say so; do not reconstruct the meeting.

## HALT
- The attendee asks for a rate, an eligibility call, a negotiation position, or a signature → Needs-Steven packet.
- The follow-up would go to a third party not on the recording (co-op agent, escrow, lender) → draft, flag, Steven sends.
- A recording that sounds like it includes someone who did not consent (CA two-party) → stop, tell Steven, no recap.

## What proves it worked
- A `vanessaQueue` item with `from:"meeting-recap-to-crm"` and a `ref` that resolves in Fieldy/Zoom.
- A Gmail draft (listed by `list_drafts`) whose body ends with Alexandra's line — and no sent item.
- `inboxDesk` version advanced by exactly one, with `recapped: true` on that meeting and nothing else changed.
- Re-running on the same recording creates no second queue item (match on `ref`).
