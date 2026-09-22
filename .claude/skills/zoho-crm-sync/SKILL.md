---
name: zoho-crm-sync
description: "Sync Zoho CRM — Steven's system of record for the mortgage pipeline — into the Command Deck through Composio: writes zohoSync (connection health), zohoLeads (14-stage kanban) and zohoDeals. Self-tests first and reports the exact NO_PERMISSION block honestly rather than inventing pipeline data. Use when Steven asks to run the Zoho sync, refresh the lead board, check the mortgage pipeline, or asks why the Zoho card is red."
---

# zoho-crm-sync — Zoho CRM → Command Deck (via Composio)

Status today (verified 2026-09-22 08:17 UTC): the Composio connection is **ACTIVE** (account
`zoho_talite-spike`, created 2026-09-21) but **every CRM call returns HTTP 403 NO_PERMISSION
`Crm_Implied_Api_Access`** — reproduced on `ZOHO_LIST_LEADS` and `ZOHO_LIST_DEALS`. Connected is not
the same as working. Until the permission lands, the deck's Zoho board stays the **Sep 14 paste**
(`ZH_SEED`, 48 leads pasted by Steven from the Zoho Leads kanban) and this skill writes only
`zohoSync`. The fix is Zoho-side and only Steven can do it.

## Inputs
- Composio toolkit `zoho`, connection `zoho_talite-spike`. Tools: `ZOHO_LIST_LEADS`, `ZOHO_LIST_DEALS`.
- Existing docs `zohoSync`, `zohoLeads`, `zohoDeals` (Command Deck, collection `state`).
- `ZH_STAGES` — the 14 stages the board renders, in this order:
  `NEW`, `Contact Established`, `Application Sent`, `Application Complete`, `Docs Requested`,
  `Docs Received`, `Pre-Approved`, `Opened Escrow/Converted`, `Old Database`, `Credit Repair`,
  `Refi Watch list`, `DEAD LEAD`, `From Prior Database`, `UnAccounted`.

## Outputs — exactly these shapes
```
zohoSync  {v:{checkedAt, status:"ok"|"blocked"|"error", error: string|null,
              source:"Zoho CRM via Composio (account zoho_talite-spike)",
              leads: number|null, deals: number|null,
              fix:"Zoho CRM → Setup → Security Control → Profiles → enable 'Zoho CRM API Access'"}}

zohoLeads {v:{syncedAt, source, counts:{<stage>:n},
              leads:[{id,name,stage,created,modified,leadSource?,leadOwner?,local?}]}}

zohoDeals {v:{syncedAt, source, counts:{<stage>:n}, totalAmount,
              deals:[{id,name,stage,amount,closingDate,leadSource,owner,modified}]}}
```

## Procedure
1. **Self-test first — every run, before any board write.**
   Call `ZOHO_LIST_LEADS` with the smallest page size (1 record).
   - **200** → `status:"ok"`, continue to step 2.
   - **403 `NO_PERMISSION` / `Crm_Implied_Api_Access`** → `status:"blocked"`, `error` = the verbatim
     Zoho message, `leads:null`, `deals:null`, `fix` = the string above. Write `zohoSync` and
     **stop**. Do not touch `zohoLeads` or `zohoDeals` — the Sep 14 paste stays, correctly labelled.
   - Anything else (401, 429, 5xx, transport) → `status:"error"` with the verbatim message, stop.
2. Pull leads (`ZOHO_LIST_LEADS`, paginate to the end). For each record map:
   `id` ← Zoho record id, `name` ← Full_Name (or First+Last), `stage` ← **mapped** Lead_Status,
   `created` ← Created_Time, `modified` ← Modified_Time, `leadSource` ← Lead_Source,
   `leadOwner` ← Owner.name. Keep Zoho's own date formatting as a string; the board parses it.
3. **Stage mapping.** Match the Zoho `Lead_Status` against the 14 `ZH_STAGES` names,
   case-insensitive and trimmed. **Any status that does not match maps to `"UnAccounted"`** — never
   invent a new stage, never drop the lead, and list the unmapped raw values in the run log so
   Steven can fix them in Zoho or a mapping can be added deliberately.
4. **Preserve deck-only leads.** Read the existing `zohoLeads` doc. Any lead carrying `local:true`
   that Zoho did **not** return (match on `id`, then on `name`+`created`) is carried into the new
   `leads` array unchanged, with `local:true` intact. These are leads Steven added on the deck that
   were never created in Zoho; a sync that silently deletes them is a data-loss bug. Recompute
   `counts` over the merged array so the kanban column totals include them.
   Note in the card copy: Zoho is the system of record — the next sync overwrites a stage moved on
   the deck for any lead that exists in Zoho. Write-back is an L2 proposal, not built.
5. Pull deals (`ZOHO_LIST_DEALS`, paginate). Map `id, name ← Deal_Name, stage ← Stage,
   amount ← Amount, closingDate ← Closing_Date, leadSource ← Lead_Source, owner ← Owner.name,
   modified ← Modified_Time`. `counts` = deals per stage (Zoho's deal stages, **not** `ZH_STAGES` —
   they are a different picklist). `totalAmount` = sum of `amount` over all deals, `null` if any
   amount is missing rather than a silently partial total.
6. Write `zohoLeads`, `zohoDeals`, then `zohoSync` with `status:"ok"` and real `leads`/`deals` counts
   (`write_db` **set**, not update — update fails when the doc does not exist yet).
7. Cadence: **4× daily** (see `integrations/mac-task-specs.md`). Every run re-tests; the moment the
   permission lands, the board fills on its own with no further work from Steven.

## Guardrails
- **Never fabricate CRM data.** No lead, deal, stage count or dollar total that did not come from a
  200 response this run. A blocked connection produces a red badge and the fix text, not numbers.
- Never present the Sep 14 paste as a live sync. Its `source` string —
  `"pasted by Steven from Zoho CRM Leads kanban"`, `syncedAt "2026-09-14"` — is the honest label and
  stays until a real pull replaces it.
- Read-only. This skill never creates, updates or deletes a Zoho record.
- No client PII beyond name + stage + dates into the deck. No phone, email or SSN, ever.
- No credentials in prompts, logs or findings. Composio holds the connection; you don't.

## HALT conditions
- A write to Zoho is requested → stop, escalate to Steven.
- 403 persists for more than 7 consecutive days → escalate as a Needs-Steven packet: the fix has not
  been applied and every Zoho figure on the deck is 8+ days stale.
- A pull returns fewer than half the leads of the last successful run → write `zohoSync`
  `status:"error"` with the counts and ask Steven before overwriting `zohoLeads`.
- Composio reports the connection as disconnected or expired → `status:"error"`, stop, escalate.

## Logging
Append `{ts, task:"zoho-crm-sync", status, httpCode, leads, deals, unmappedStages:[…], error}` to
doc `zohoSyncLog` (`read_db` get → missing means `[]` → `write_db` **set**); keep the last 200.

## Self-test
1. `ZOHO_LIST_LEADS` page size 1 → record the HTTP code and the verbatim error.
2. Assert the mapper sends an unknown `Lead_Status` to `UnAccounted` and logs the raw value.
3. Seed a fixture `zohoLeads` containing one `local:true` lead absent from the pull → assert it
   survives the merge with `local:true` intact and is counted in `counts`.
4. Force the self-test to 403 → assert `zohoSync.status === "blocked"`, the `fix` string is exact,
   and `zohoLeads`/`zohoDeals` are byte-identical to before.
5. Run twice → assert idempotence apart from `syncedAt`/`checkedAt`.

## The one line Steven has to do
**In Zoho CRM go to Setup → Security Control → Profiles → the connected user's profile and enable
"Zoho CRM API Access".** Nothing else unblocks this; the sync re-tests every few hours and fills the
board automatically the moment it lands.
