# Wiki — L2 index

Five topics. **The index line is the product.** A router reads the one-line summary below, and opens
the topic page only when that line is not enough. A topic page in turn is an index of its own pages,
each with a one-line summary — same rule, one level down.

| Topic | Answers | One-line rule |
|---|---|---|
| [`mortgage-programs/`](mortgage-programs/index.md) | Loan programs, guidelines, VA mechanics, eligibility, disclosure timing | Program facts are versioned; always cite the edition |
| [`real-estate-playbooks/`](real-estate-playbooks/index.md) | Listing, buyer, transaction, showing process; SOPs | Duplicated on the ISA Portal — fix both |
| [`ai-team/`](ai-team/index.md) | Who owns what, seat models, trust levels, delegation | Seat names are canonical; never invent one |
| [`dashboard-ops/`](dashboard-ops/index.md) | Deck panels, DB docs, Mac tasks, cloud routines | A task existing ≠ a task running |
| [`clients/`](clients/index.md) | One page per client — **FULL CONTEXT** | Never chunked, never graphed, never leaves the Mac |

## What belongs in the wiki

Durable, reusable topic knowledge that more than one session will want: how a program works, how a
process runs, who owns a lane, what a doc means. Written once, corrected in place.

## What does NOT belong here

- **Live numbers.** Rates, balances, lead counts, health stats. Those live in the deck's `state`
  docs, and the wiki links to the doc name instead of copying the value.
- **Decisions.** Those are dated entries in `context/decisions.md`.
- **Session learnings.** Those are dated lines in `memory.md`.
- **Source documents.** Those are registered in `references/index.md`, not pasted here.
- **Secrets, credentials, account numbers, client PII.** Anywhere. Ever.

## The full-context rule

Some documents are only correct when read whole: client decision logs, meeting summaries, anything
where a sentence in isolation changes meaning. Those are marked **FULL CONTEXT** at the top of the
file. A full-context file:

- is read entirely or not at all — no chunking, no snippet retrieval;
- never enters `vector-index/`;
- never becomes graph nodes in `knowledge-graph/`;
- is quoted at most ~10 lines in an answer, with the rest summarized.

Everything in `wiki/clients/` is full-context by default. See `vector-index/README.md` for the
opposite case — what is safe to chunk and why.

## Adding a page

1. Create `wiki/<topic>/<page>.md`. First line after the H1 is a **one-sentence summary**.
2. Add one row to that topic's index with the same sentence. If the sentence will not fit on a row,
   the page is doing two jobs — split it.
3. If it is full-context, say so on line 2 and in the index row.
4. If it duplicates something on the ISA Portal or the deck, name the other copy.
