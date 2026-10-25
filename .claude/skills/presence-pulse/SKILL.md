---
name: presence-pulse
description: "Orin's weekly read of the AEO/SEO/GEO/AIO presence program: run the zero-token pulse (NAP, schema and identity gates, citation status, LLM benchmark, KPIs, this week's answer blocks), turn its queue into vanessaQueue drafts, and hand Steven the short list only he can do. Use when Steven says 'how is my presence', 'run the presence pulse', 'what's next for SEO/AEO/GEO', 'am I showing up in ChatGPT', or when the Presence Pod is woken by the Monday routine."
---
# presence-pulse — the Monday read for the Presence Pod

Owner: **Orin** (GEO / AEO Lead, under Sofia). Pod: Sofia, Orin, SEO Specialist, Citation Auditor, LLM Visibility
Analyst, Delia, Derek, Alexandra. Drafts and packets only — nothing is posted, deployed, submitted or paid by a seat.

## Reads
- The kit: `projects/aeo-presence/` (`data/identity.json` is the single source of truth for every public fact).
- `data/citations-nap.csv`, `data/llm-benchmark-log.csv`, `data/kpi-monthly.csv`, `data/content-log.csv`,
  `docs/03-question-bank.md`.
- Command Deck `state`: `vanessaQueue` (read before write, `if_version`).

## Writes
- `docs/reports/PRESENCE-PULSE.md` and `data/presence-queue.json` (the script writes both, zero tokens).
- `vanessaQueue`: one item per queue entry that is not already there (match on `task`), fields
  `{task, priority, status:"pending", from:"presence-pulse", ref, note, owner}`.
- Nothing else. No profile, site, DNS, account or CRM write.

## Procedure
1. `node projects/aeo-presence/scripts/pulse.mjs` — read the report. A failed gate is the first item; fix the kit file
   (never a live property) and rerun before anything else.
2. If a fact changed (phone, office, license, brokerage): edit `data/identity.json` only, run
   `node projects/aeo-presence/scripts/build-identity.mjs`, rerun the pulse. Never hand-edit `llms.txt`, `humans.txt`,
   `schema/person.jsonld` or `schema/faq.jsonld`.
3. Queue the items (step above). Group Steven's own actions (listing edits, account creations, posting) into one
   Needs-Steven line with the exact field values from `data/citations-nap.csv`.
4. Hand the week's three answer blocks to Orin's answer-block procedure (`docs/09-aeo-answer-engineering.md`), the
   stale citations to the Citation Auditor, the benchmark line to the LLM Visibility Analyst.
5. Reply to Steven in ≤8 lines: gates, citations fixed/stale/missing, benchmark average, the three answer blocks, and
   the one list only he can do.

## Guardrails
- Every public line still passes Alexandra (`docs/13-compliance-marketing-claims.md`) before Steven posts it.
- No number without a date and source; no rate, APR, fee or eligibility statement anywhere.
- The pulse is read-only on the web; it never fetches a directory (that is the Citation Auditor's sweep, read-only too).
