# Wiki — Clients — FULL CONTEXT

**Every page in this directory is FULL CONTEXT.** Read a client page whole or not at all.

## The rules, before anything else

1. **Never chunked.** A client page does not enter `vector-index/`. A sentence about a borrower
   pulled out of its file changes meaning, and a retrieved fragment can be wrong in a way that costs
   someone a loan.
2. **Never graphed.** No client becomes a node or an edge in `knowledge-graph/`. See the
   never-graph-a-secret rule in `knowledge-graph/README.md`.
3. **Local only.** Sensitive client data is answered by the **local model (Jarvis)**. It does not go
   to a cloud research call, a Perplexity query, a Notion row, or any store that syncs off the Mac.
4. **Never in a prompt that leaves the machine.** Not in a copy-prompt button, not in a routine
   prompt, not in a report.
5. **No client page is committed to this repo.** This directory ships with this index and nothing
   else. The real pages live in the Mac vault. See `MAC-INSTALL.md`.

## Page shape (on the Mac only)

```
# <Client label>  — FULL CONTEXT
Stage · who is on it · the one thing that matters this week

## Decision log        (append-only, dated — the reason a choice was made)
## Constraints         (what the file cannot do — timing, funds, eligibility)
## Open items          (with the deadline that defines each)
## History             (what happened, dated)
```

Use a **label**, not a full legal name, in any filename. The label is enough to route; the detail
lives inside the file, on the Mac.

## What still belongs in the deck instead

Pipeline counts, stage totals, speed-to-lead, KPI actuals — those are aggregate and they live in
`loftyLeads`, `zohoLeads`, `zohoDeals`, `leadTriage`, `leadResponse`, `isaKpi`. Aggregates are safe
to report. Individuals are not.

## If you are asked for client information

Answer from the client page if you are the local model and the page is open. Otherwise say the data
is local-only and offer the aggregate. Do not reconstruct a client from lead-source fields.
