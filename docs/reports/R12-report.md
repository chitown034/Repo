# R12 — one brain on the AI Team page, OmniRoute + Bonsai 27B, live feeds (2026-09-28)

Steven, 2026-09-28 (condensed): make the dashboard live and not stale; the AI Team page reflects the org chart,
skills and brain; *"configure omni route Setup orca / Local LLM and token optimization Omniroute / PrismML's
Bonsai 27B: with Perplexity and [top-tier model] md"*; CLI-Anything for homes.com, SkySlope, zipForms, Zoho, Lofty.

## Live
- **Command Deck v158** (then a small correction release): R10's freshness fixes; the AI Team page's org chart
  as the dispatch model (one sub-agent per agent, tiers, Perplexity ≤4 per wave, Laya first hop and Orca phone
  view with honest not-installed status), skills (loop-engineering, prompt-master, skills-refresh, interview-me;
  77 Skills not bought), the five-level brain map; phone market-stat clipping fixed; the News freshness label
  now takes the newer of its two sources; Waiting-on-Steven updated. Real-browser sweep: 0 page errors, 0
  console errors, 0 throwing controls, 0 overflow (light and dark).
- **ISA Portal v36**: R10 fixes + a page that no longer halts when the runtime's database call throws.
- **Weather and news, current**: written 2026-09-28 from AccuWeather (current conditions + today's forecast,
  NWS alerts) and dated, sourced local news for all 10 cities.
- **Feed writers**: seven agent-owned writer routines (`routines/feed-writers-2026-09-28/README.md`). A shared
  document takes a deep-merge `update` of one entry, never a whole-document `set` (measured).

## In the repo
- `integrations/omniroute/` — local tier (Bonsai 27B, Apache-2.0, PrismML's own runtime) behind a single-target
  `local` combo, OFF until a real fail-closed test on the Mac; research tier (Perplexity) combo; the
  subscription never goes through OmniRoute (Anthropic's terms, cited). Laya prints a `route`. Tests: Laya
  route 19/19, failover lease 158/158. Integrator review fixed a false-success path, the key prompt, a
  LAN-exposure path and a misleading "ready" after a plan-only run.
- CLI-Anything: homes.com 67, SkySlope 68, zipForms 67, Zoho 43, Lofty 37 offline tests pass (browser
  dependency 195). What each still needs is Steven's: sign-in, security-review date, API grant, API key.
- `docs/findings/findings-R12.json` — the AI Team and OmniRoute hand-backs.

## Corrected during the round
- "Routines an agent creates cannot write" was wrong: the first writer wrote at 07:43 UTC, five minutes after
  its session looked idle; it had been deleted on that misreading and was recreated.
- That writer's first weather used yesterday's daytime temperatures as "current"; the prompt now requires a
  reading stamped within 2 hours.

## Steven's steps
`docs/NEEDS-STEVEN.md` 72–77: runner (`runnerctl`), switch the old routines off + paste Strava/calendar,
allow FRED/Freddie Mac/Redfin, Bonsai install + Mac proof, Perplexity key into OmniRoute, top tier via
OmniRoute (a spend decision — default no).
