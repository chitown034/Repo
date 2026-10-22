---
name: tc-doc-intake
description: "Read a purchase contract, counter, addendum or disclosure package (Google Drive file or Gmail attachment) and pull the dates into the deal's tcDeals entry for the Transaction & Showing desk — acceptance, deposit, inspection / appraisal / loan contingencies, COE — flagging every date the document does not state. Reads only; never writes to SkySlope, zipForms, dotloop or the MLS. Use when Steven says 'we're in escrow on…', 'log the RPA dates', 'what are the contingency deadlines', or when tcDesk shows a deal with no dates."
---
# tc-doc-intake — contract → dates → tcDeals

Owner: **Carmen** (CA Transaction Coordinator, under Victor). The Transaction & Showing desk routine (weekdays 6:05 AM PT)
builds timelines **only from dates in `tcDeals`, never assumed** — this skill is how those dates get there without the
ISA retyping them. SkySlope/zipForms stay locked until Alexandra signs off (`integrations/pabbly/WORKFLOWS.md` §B).

## Reads
- **Google Drive** (read-only): `search_files` → `read_file_content` / `download_file_content` on the RPA, counters,
  addenda, disclosure package.
- **Gmail**: `search_threads` → `get_thread` for an attachment the escrow officer or co-op agent sent. Never `forward`.
- **Command Deck** `state`: `tcDeals` (existing entry for this property, with its version), `tcDesk` (what the desk
  already flagged).
- `wiki/real-estate-playbooks/transaction-stages.md` for the default CA RPA day-counts (17 / 17 / 21 / 30) — used only
  to label what is *missing*, never to fill a blank.

## Writes
- `tcDeals` (`if_version` pinned, merge into the one deal, never `set` the array): the entry
  `{id, property:<street name only on the deck>, side:"buyer"|"seller"|"both", client:<first name>, acceptance, depositDue,
  inspectionContingency, appraisalContingency, loanContingency, coe, source:{file, page}, missing:[...], intakeAt}`.
  Each date carries where it came from (`{date, source:"RPA ¶3B", asStated:"17 days"}`); a computed date says
  `computed:true` and shows the arithmetic.
- `vanessaQueue` (append-only): one item `task:"Confirm dates — <street>"` with the `missing` list, `priority:"p1"` if COE
  or a contingency is missing, `from:"tc-doc-intake"`.

## Procedure
1. `bin/brain recall "<property or client>"`. Open the existing `tcDeals` entry first; note its version.
2. Read the contract. Pull: acceptance date (the last signature date, not the offer date), deposit due, each contingency
   (days-after-acceptance *as written* and the resulting calendar date), COE, possession, and any counter/addendum that
   changed one. Quote the paragraph for each.
3. Compare to the existing entry. A date that differs from one the ISA typed → do **not** overwrite; list both in
   `missing` as a conflict and queue it.
4. Write the entry; queue the missing/conflict list; tell Steven: the five dates, the source page for each, what is
   missing, and the next deadline inside seven days.

## Guardrails
- A date the document does not state is `null` and listed in `missing`. Never derive it from "the usual 17 days".
- Deck text carries the street name and the client's first name only — no full address, no APN, no escrow number.
- Reads one file per run; a package with ten PDFs is ten runs or a Needs-Steven ask to point at the right one.
- Never writes to SkySlope, zipForms, dotloop, CRMLS, Lofty, Zoho, or the calendar.

## HALT
- A contingency removal, cancellation, or a notice to perform is due inside 48 h → Needs-Steven packet (legal act).
- A clause that reads as a legal question (as-is, liquidated damages, a non-standard addendum) → Alexandra drafts the
  question, Steven decides; the skill records the dates only.
- Steven is not on the contract as agent or broker → stop; this is not his file.

## What proves it worked
- `tcDeals` version +1, with every non-null date carrying a `source` paragraph.
- The next desk run (`tcDesk`) shows the deal's timeline with those dates and no "no dates" flag.
- A `vanessaQueue` item listing exactly the `missing` fields, or none when the contract was complete.
- Running it twice on the same file changes nothing (same dates, same sources, version +1 only if something differed).
