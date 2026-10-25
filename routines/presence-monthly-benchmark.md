# Routine spec — Presence monthly LLM benchmark (proposal; not installed anywhere)

Installing is **Steven's yes** (HALT). Half of it cannot run unattended anyway: ChatGPT, Gemini and Grok answers come
from Steven's own signed-in accounts (or `agent-browser` on the Mac in a logged-in profile, read-only), so the routine
prepares the run sheet and scores what it can reach (Claude, Perplexity), then hands Steven a 15-minute task.

| | Value |
|---|---|
| Name | Presence — monthly LLM visibility benchmark (1st business day, 8:10 AM PT) |
| Cron | `CRON_TZ=America/Los_Angeles 10 8 1-3 * 1-5` (first weekday of the month; the skill makes later firings no-ops once the month is scored) |
| Model | Sonnet 5 |
| Skill | `llm-visibility-benchmark` |
| Writes | `data/llm-benchmark-log.csv`, `docs/reports/PRESENCE-BENCHMARK.md`, `data/kpi-monthly.csv` (one cell), `vanessaQueue` (three fixes + the run-sheet task for Steven) |
| Reads | the kit; Claude web search; Perplexity MCP when connected |
| Budget | +1 run/month |
| HALT | never posts, never submits feedback to an engine, never pastes PII |

## Prompt (for `create_trigger`, once Steven says yes)
> First business day. `node projects/aeo-presence/scripts/benchmark.mjs --template <this month>` unless rows exist.
> Score the Claude and Perplexity cells yourself per `.claude/skills/llm-visibility-benchmark/SKILL.md`; write the
> ChatGPT/Gemini/Grok run sheet as one `vanessaQueue` item for Steven (15 minutes, paste answers back). Run `--score`,
> fill "Next three fixes", queue them, commit, and end with ≤ 5 lines: average, delta, the three fixes.
