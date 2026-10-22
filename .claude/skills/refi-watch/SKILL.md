---
name: refi-watch
description: "Compare the market-average rate in ratesSnapshot with the note rates on a past-client list Steven supplies (he types each client's rate — the skill reads no loan file) and prep the pipeline list of who is worth a conversation; a prep list only, labelled 'market average, not a quote', with no eligibility, no savings promise and no outreach. Use when Steven says 'who could refi', 'run the refi watch', 'rates dropped — who do I call', or when Harrison is asked for the refi list."
---
# refi-watch — market average vs. note rate, prep list only

Owner: **Harrison** (Elite Mortgage Broker, under Victor). Preparation and analysis only — the rate quote, the
eligibility call and every client contact are Steven's licensed acts (NMLS 1921615). Gap audit 2026-10-22: rate drops
went unnoticed because nothing compared the daily snapshot with the book.

## Reads
- **Command Deck** `state`: `ratesSnapshot` (written daily by `mortgage-rates-daily`; Optimal Blue via FRED — use the
  product rows and the doc's `syncedAt`/index date), `pipeline` (funded files: first name, program, funded month —
  **never a rate; the deck holds none**).
- **Steven's list**, typed or pasted in the session: `first name · program · note rate · funded month`. This is the only
  source of a client's rate. No Zoho read, no loan file, no Drive search for a Closing Disclosure.

## Writes
- `vanessaQueue` (`if_version`): one item `{task:"Refi watch — <date>", priority:"p2", status:"pending", from:"refi-watch",
  ref:"ratesSnapshot <syncedAt>", note:<the prep table below>}`.
- Nothing else. No `pipeline` change, no draft to any client, no CRM note.

## Procedure
1. Read `ratesSnapshot`; write down the product rows (30-yr conventional, VA, FHA, jumbo…) and the index date. If the
   doc is older than 80 h, say so and stop — a stale average is not a watch.
2. For each client on Steven's list, compute `spread = note rate − market average for the same program` and show the
   arithmetic. Thresholds are Steven's (default 0.50 point, his call 2026-10-22 pending — until he sets one, list every
   positive spread and let him cut).
3. Order by spread, group by program. For VA loans note "IRRRL path — see `wiki/mortgage-programs/va-eligibility.md`" as a
   pointer only. Mark anyone funded < 210 days ago (VA seasoning) or < 6 months (most programs) as "seasoning — not yet".
4. Queue the table and tell Steven: how many are above threshold, by program, with the market average's stamp.

## The label on everything
> Market average from `ratesSnapshot` (<index date>). Not a quote, not a pre-qualification, not an eligibility decision.
> Any rate for a specific client is Steven Shearrill's, MLO NMLS 1921615, after a full application.

## Guardrails
- Never a savings number per client ("you'd save $212/month"). The spread in points is the whole output.
- Never an eligibility word: no "qualifies", "eligible", "approved", "can refinance". "Worth a conversation" is the
  ceiling.
- Never contacts a client, drafts to a client, or hands the list to the ISA for calls — this list goes to Steven alone.
  (If he then wants scripts, that is a Harrison + Alexandra draft with the label above on it.)
- Deck text: first names and programs only; the note rates Steven typed stay in the session, not in `vanessaQueue`
  beyond the spread column.

## HALT
- A client's rate came from anywhere but Steven's typed list → stop, do not use it.
- Steven asks "what rate would they get" → that is a quote; Needs-Steven packet, pointer to `loan-pricing-agent` for the
  worksheet he drives himself.
- `ratesSnapshot` is stale or its `status` is not ok → report staleness, no comparison.

## What proves it worked
- One `vanessaQueue` item whose `ref` carries the exact `syncedAt` used and whose table shows the arithmetic per row.
- The label appears verbatim in the item and in the session answer.
- No Gmail draft, no CRM note, no `pipeline` version change this run.
- Running it with the same list and the same snapshot produces the same spreads.
