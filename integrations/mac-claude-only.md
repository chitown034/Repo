> **Superset:** `integrations/mac-fix-all-2026-10-05.md` runs this exact paste-in as its Section 1 and then fixes the rest of the Mac side (runner repairs, Orca, knowledge graph, Opus 5.5, readiness) — paste that one instead, and use this file alone only if you want the Claude-only switch by itself.

# Mac: remove Perplexity, run everything on the Claude subscription (2026-10-05)

Steven, 2026-10-05: *"remove everything running on Perplexity and replace with Claude subscription"* and
*"ensure entire dashboard routines and task are updated using Claude"*.

The cloud side is done: Claude cloud routines (agent-created, on the subscription, Claude WebSearch only)
now write every research feed the Command Deck shows. See `routines/feed-writers-2026-10-05/README.md`.
What is left lives on the Mac, where no cloud session can reach. Steven pastes the prompt below into a
Claude Code session **on the Mac**, in the Repo folder, after `git pull`.

## The paste-in

```text
Steven's decision, 2026-10-05: remove everything running on Perplexity on this Mac and run all research
on the Claude subscription (WebSearch / WebFetch). Perplexity is out of credit; every task has been
falling back to Claude anyway. Do these, in order, and report what you changed:

1. Pause the three Mac feed tasks the cloud routines replaced (their feeds are now written by Claude
   cloud routines — do not delete them): runnerctl pause openrouter-feeds-refresh ;
   runnerctl pause feeds-weekly ; runnerctl pause feeds-market-close
2. weather-news-refresh: keep it running, but for WEATHER ONLY (wttr.in, no LLM research). Edit its
   prompt so it no longer writes newsSnapshot — the Claude news routine in the cloud writes news now.
3. Switch the runner's research provider to Claude only: remove the Perplexity-first / fallback logic
   you added on 2026-10-04, so every research task uses Claude WebSearch / WebFetch and runnerStatus
   reports researchProvider.provider = "claude".
4. vanessa-research-queue: edit its prompt — research with Claude WebSearch / WebFetch and the AI team,
   never Perplexity. Same for any other task prompt, agent file, skill or roster-tiers.json rule that
   names Perplexity (grep ~/.claude and the runner's task definitions, case-insensitive). If you rename
   roster-tiers.json's maxPerplexityPerWave, update every reader in the same change.
5. Remove the Perplexity MCP server: claude mcp remove perplexity (user scope), and drop it from any
   project .mcp.json. Leave the Composio perplexityai connection alone unless I say so — nothing calls it.
6. OmniRoute: git pull is enough for routing — research now routes direct on the Claude subscription
   (integrations/omniroute/route-map.json), never through OmniRoute. If OmniRoute runs on this Mac, open
   its dashboard (http://127.0.0.1:20128) and delete any leftover "research" combo and "perplexity"
   provider; configure-omniroute.sh no longer creates either.
7. Verify and report: runnerctl list (the three paused), one research task run end to end on Claude,
   runnerStatus.researchProvider, and a final case-insensitive grep showing no task, agent, skill or MCP
   config on this Mac still sends work to Perplexity.
Never delete a task, never touch a client-facing system, never edit anything this list does not name.
```

## What each step replaces

| Mac piece | Was | Now |
|---|---|---|
| `openrouter-feeds-refresh` (headlines, AI news, On This Day, Bears, Econoday, opportunity radar) | Perplexity first, Claude fallback | **paused** — cloud *morning feeds* + *Econoday* routines |
| `feeds-weekly` (builders, offers, PE/defense, affluent, city news) | Perplexity first | **paused** — cloud note writers + *news & city lists* routine |
| `feeds-market-close` (movers, sectors, VA rate second read) | Perplexity first | **paused** — cloud *market close* routine (weekdays 21:20 UTC) |
| `weather-news-refresh` | wttr.in weather + Perplexity news | weather only (wttr.in); news from the cloud |
| `vanessa-research-queue` and every other research task | Perplexity first | Claude WebSearch / WebFetch |
| `perplexity` MCP server | installed (user scope) | removed |
| OmniRoute `research` route | Perplexity combo | none — research routes direct on the Claude subscription; leftover combo/provider deleted |
| `mortgage-rates-daily`, `r5-rates-market-refresh` | FRED / Optimal Blue (no Perplexity) | unchanged |
