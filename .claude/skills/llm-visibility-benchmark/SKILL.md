---
name: llm-visibility-benchmark
description: "The LLM Visibility Analyst's monthly benchmark: ten fixed prompts across ChatGPT, Claude, Gemini, Grok and Perplexity, scored 0–2, logged to data/llm-benchmark-log.csv, scored by scripts/benchmark.mjs into docs/reports/PRESENCE-BENCHMARK.md, with the sources the engines cited when Steven was absent turned into next month's citation targets. Use when Steven says 'am I showing up in ChatGPT/Gemini/Grok', 'run the AI visibility benchmark', 'LLM score', or on the first business day of the month."
---
# llm-visibility-benchmark — the only score that matters

Owner: **LLM Visibility Analyst** (desk seat under Orin, Sofia's line). Report tier, Sonnet 5. Reads and scores;
never posts, never creates an account, never asks an engine to "remember" anything about Steven.

## Reads
- `projects/aeo-presence/scripts/benchmark.mjs` (prompt list and scoring), `data/llm-benchmark-log.csv`,
  `data/identity.json` (what "correct facts" means: name, LPT Realty, DRE 01988316, Patriot Pacific, NMLS 2449246, Temecula).
- Engines: Claude and Perplexity from here (web search on; Perplexity MCP when connected); ChatGPT, Gemini and Grok need
  Steven's signed-in accounts — either Steven runs the 30 prompts from the run sheet (15 minutes, paste answers back) or
  the analyst drives `agent-browser` on the Mac in a logged-in profile, read-only, stopping at anything that posts.

## Writes
- `data/llm-benchmark-log.csv`: `score_0_2`, `named_as`, `facts_correct`, `quote` (≤ 200 chars), `sources_cited`
  (semicolon-separated domains) for every cell of the month.
- `docs/reports/PRESENCE-BENCHMARK.md` (via `--score`), the "Next three fixes" section filled in by hand.
- `data/kpi-monthly.csv`: `llm_benchmark_avg` for the month.
- `vanessaQueue`: the three fixes as items (owner per fix: citation → Citation Auditor, content → Orin, profile → Steven).

## Procedure
1. `node projects/aeo-presence/scripts/benchmark.mjs --template YYYY-MM` once per month.
2. Run each prompt fresh (new chat, no memory, web/search on where the engine offers it). Score: 2 named with correct
   facts · 1 named with an error (old brokerage, wrong city, missing license) · 0 absent. Record the exact quote and the
   domains the engine cited.
3. `node projects/aeo-presence/scripts/benchmark.mjs --score`; read the lowest engine, the lowest prompt and the
   "sources when absent" list.
4. Write the next three fixes: get listed where the engine already looks (a directory, a Reddit thread, a news site),
   repair the fact it got wrong (profile edit packet for Steven), or publish the answer block it could not find.
5. Queue them; one line to Steven with the average, the delta and the three fixes.

## Guardrails
- Never "correct" an engine in chat on Steven's behalf or submit feedback forms; the fix is always on the web, not in the model.
- Never paste client names or PII into any engine.
- A score of 1 with a safety hedge ("may be affiliated with eXp") is a stale-fact finding: it goes to the Citation Auditor, not to content.
