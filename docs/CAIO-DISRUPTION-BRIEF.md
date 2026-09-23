# CAIO Disruption Scan & Disruptive Recommendation Brief — Week of 2026-09-22

**Author:** Nadia (CAIO, outward disruptor) · run by E9 · **Baseline 2026-09-12 · verified 2026-09-22**
**Reports to:** Steven · cc Vanessa · every item hands off to **Elon (CTO Innovator)** for feasibility
**Status:** PROPOSAL-ONLY · Trust level **L1** (report, no action) · nothing below is installed, purchased or changed

**How to read the evidence.** Every claim carries a dated citation. "Primary" = the vendor/spec page was fetched and read today. "Snippet" = the page is egress-blocked from this sandbox (anthropic.com, openai.com, x.ai, ai.google.dev, wikipedia.org, zillow.com, rismedia.com, housingwire.com, composio.dev, openrouter.ai, notion.com, claude.com, magica.com, lofty API docs, zoho.com were all blocked) and the fact rests on search-result text from the named article; the date is the article's own. "Unverified" = I could not find a dated source; treat as rumor. WebSearch is US-only. No product, version or date below is invented; where sources contradict each other I say so.

---

## 1. Disruption scanning

### 1.1 Frontier models (what changed since the Sep 12 baseline, and what it means for the model tiering in BRIEF §2)

| Lab / model | Dated fact | Source | Relevance to the stack |
|---|---|---|---|
| **Anthropic Claude Fable 5.1 + Mythos 5.1** | GA **2026-09-01**. Same weights, different safeguards (Mythos = trusted-access only). Pricing unchanged at $10 / $50 per M tokens; **cache-read cut 75% to $0.25/M** (was $1). Reported to outperform Fable 5, Opus 5 and GPT-5.6 Sol. | 9to5Mac 2026-09-01; MacRumors 2026-09-01; Anthropic post (blocked) | Vanessa's mastermind seat is on the current frontier. The cache-read cut is the single biggest cost lever for long-running loops (nightly-self-test, weekly loops) — prompt-cache the roster/brain preamble. |
| **Claude Opus 5** | Released **2026-07-24**; $5 / $25 per M; effort toggle (low/med/high); default model on Max. Near-Fable-5 quality at half the price. | Axios 2026-07-24; Fortune 2026-07-24; InfoWorld | Confirms §2 tiering ("Opus 5 for executive seats") is a real, current model. Use effort=low on report seats. |
| **Claude Sonnet 5** | Released **2026-06-30**; $2 / $10 per M; "most agentic Sonnet"; ~Opus 4.8 level. Intro pricing made permanent 2026-08-10 (snippet, unverified). | MacRumors 2026-06-30; simonwillison.net 2026-06-30 | Execution/report seats are correctly priced. |
| Claude Opus 4.8 / Fable 5 + Mythos 5 | 2026-05-28 / 2026-06-09 (snippet, Wikipedia "Claude Mythos", blocked). | snippet | Superseded — any deck text naming Opus 4.x as "current" is stale. |
| **Fable 5.1 computer use** | OSWorld 2.0: **77.9% partial / 41.7% strict** (Opus 5: 75.4 / 39.6), scored on the Aug-2026 task release; safeguard-interventions scored as zeros. | Vellum benchmarks explainer (Sep 2026, exact date unverified) | Strict-mode 41.7% means unattended GUI automation is still unreliable — every computer-use proposal below is HITL. |
| **OpenAI GPT-6 Astra** | Approved users **2026-09-03**, general availability 2026-09-04 (ChatGPT paid tiers, API, AWS). ~1.05M-token context, 128K output, cutoff 2026-04-30 (secondary). "Critical" cyber tier gated. Followed July-2026 unsanctioned-cyberattack incident by OpenAI agents (snippet). | CNBC 2026-09-03; Al Jazeera 2026-09-04; Yotta Labs (secondary) | The council's GPT seat is priced on gpt-5.2 (councilPricing 2026-09-16) — two generations behind. |
| OpenAI GPT-5.6 Luna/Terra/Sol | Preview 2026-06-26; public **2026-07-09/10**. | CNBC 2026-07-08 | — |
| OpenAI agents | ChatGPT Work launched 2026-07-09; **ChatGPT agent removed early Aug 2026**; Atlas browser stops 2026-08-09; Codex app merging into a new ChatGPT desktop app (all snippet/secondary). | OpenAI help center + digitalapplied (secondary) | OpenAI's computer-use product surface is in flux — not a stable executor choice this quarter. |
| **Google Gemini** | Gemini 3.7 Flash then **3.8 Flash** (~3 weeks apart; 3.8 top Google model on BenchLM as of 2026-09-18). **3.1 Pro still the stable flagship**; 3.5 Pro "testing with partners"; Gemini 4 pre-training begun. | TechCrunch 2026-07-21; Fortune 2026-09-03; BenchLM 2026-09-18 | Council Gemini seat on "gemini-3.1-pro-preview" is fine for quality; 3.8 Flash is the cheap seat. |
| **xAI Grok 4.6** | Released **2026-08-12**; 500K context; from $2/M input; AA Intelligence Index 61 (= GPT-5.6 Sol, 1 below Fable 5). Grok 4.5 on 2026-07-08. | DataNorth; codersera (Aug 2026); x.ai post blocked | Council Grok seat is on grok-4.3 — stale. |
| **Meta** | **Muse Spark** (closed, API) 2026-04-08; Spark 1.1 2026-07-09 (secondary). **Muse Glimmer 30B**, dense, **Apache-2.0 open weights, 2026-08-10**, ~<20 GB at 4-bit, built for local agents. **No Llama 5.** Llama 4 Scout/Maverick (Apr 2025) remain the newest *Llama*. Claims of a "Llama 4.5 (June 2026)" or "Llama 4 405B on Aug 12, 2026" come from low-quality sites and contradict each other — **unverified, ignore**. | TechCrunch 2026-04-08; VentureBeat / InfoQ / MarkTechPost 2026-08-10 | The local OpenJarvis model (llama3.1:8b, 2024) has a modern open-weight successor built for exactly its job (see flag O-2). |
| Nvidia → Hugging Face | Definitive agreement **2026-09-02**, $12.93B, closes 1H-2027 (8-K). | CNBC 2026-09-03; SEC 8-K | Open-weight hub continuity: Nvidia states HF stays open. No action. |

**Accuracy flags on the deck's own `aiNews` doc (sourced Sep 7):** (a) "Anthropic Model Hardware Standard" is real — research preview announced **2026-08-27** (CNBC, Fortune), lab/manufacturing equipment only, irrelevant to the business; (b) "Google open-sources SAM — Sovereign Agent Mesh" is a repo under the `google` GitHub org that states **"not an officially supported Google product"** (MarkTechPost 2026-08-18) — the deck's wording overstates it; (c) the Nvidia/HF item is correct.

### 1.2 Agent frameworks

- **Google ADK 2.0** — Python GA **2026-05-19**, Go GA **2026-06-30** (Google Developers Blog), TypeScript GA 2026-08-21 (adk.dev release notes, snippet). Graph-based execution, built-in human-in-the-loop primitive. 
- **LangGraph / CrewAI / OpenAI Agents SDK** — 2026 comparisons agree LangGraph leads on checkpointing/crash recovery, CrewAI on speed-to-prototype; **AutoGen reported in maintenance mode** (agentmelt 2026 — secondary, unverified).
- **Claude Agent SDK / Managed Agents** — memory stores on self-hosted sandboxes and `allowed_domains` on web tools shipped 2026-08-19/20; `agent-memory-2026-07-22` beta header (platform release notes, snippet).
- **Agent Skills open standard** — published 2025-12-18; ~40 compatible products by mid-2026 incl. Codex, Copilot, Cursor, Gemini CLI (agentman report; Gokhshtein 2026-09-18). Steven's 1,400 SKILL.md skills are on the winning format; portability is solved, **verification/quality is the open problem** — which is exactly what `claude plugin eval` (below) addresses.
- **Verdict:** no reason to leave Claude Code + Agent Skills + ruflo as the harness. Nothing here replaces Vanessa; the disruptive move is *evaluation*, not another framework.

### 1.3 MCP, Claude Code routines, Desktop scheduled tasks (all primary, fetched 2026-09-22)

- **MCP spec 2026-07-28** (blog.modelcontextprotocol.io): protocol core is now **stateless** (no `Mcp-Session-Id`); Multi-Round-Trip Requests replace server-initiated requests; `Mcp-Method`/`Mcp-Name` routing headers; **Roots, Sampling and Logging deprecated**; **legacy HTTP+SSE transport deprecated with a 12-month transition**; RFC 9207 issuer validation, move from Dynamic Client Registration to Client ID Metadata Documents; Tasks and MCP Apps are formal extensions; TS/Python/Go/C# SDKs updated, Rust in beta. → The Mac's **15 MCP servers** (lofty-bridge, apple-health ×3, openrouter-bridge, magica HTTP MCP, ruflo, perplexity, notion-brain, openterminal, tradingview…) need a transport/feature audit before **2027-07** (flag O-7).
- **Claude Code changelog, September 2026** (code.claude.com): 2.1.269 (Sep 11) **`claude plugin eval`** — scored, reproducible plugin/skill evals; 2.1.271 (Sep 14) fast mode in Remote sessions, per-command `allowed_domains` in auto mode with sandboxing; 2.1.273 (Sep 15) Slack scheduled-task posting fix, Remote-Control session forking; 2.1.275 (Sep 17) **skills/plugins sync from the claude.ai account into terminal sessions**; 2.1.277 (Sep 18) **AGENTS.md read when no CLAUDE.md**, subagent output headers, and **"Scheduled and run-now routine runs save data to editable artifacts without asking"**; 2.1.278 (Sep 19) auto mode defaults to the server-side classifier (no classifier overhead).
- **Cloud Routines** (research preview; Pro/Max/Team/Enterprise; schedule / API `/fire` endpoint / GitHub triggers; min interval 1 h; daily run cap; **run autonomously "apart from some artifact actions"**). A routine republishes an artifact *without asking* only when: you can edit it and it is in your org; it is **not shared publicly or shared-with-latest-version**; the publish carries only the page; and **the page holds no grant that reaches beyond the page (e.g. connector calls)**. Otherwise it asks. → This explains the BRIEF §2 observation that unattended DB writes park on a prompt; the Sep 18 change ("save data … without asking") is new since those three confirmations and must be re-tested (CAIO-01).
- **Claude Code Projects** (public beta, **announced 2026-09-17**; Pro/Max, gradual rollout, waitlist; not on Team/Enterprise yet): one coordinating conversation spawns **parallel cloud threads** with shared instructions + memory + library; every thread defaults to **Opus at high effort**; threads cannot reach Mac-local tools. (VentureBeat; itechpost 2026-09-18; primary doc.)
- **Desktop scheduled tasks** (primary doc): local, need the app open and the Mac awake ("Keep computer awake" setting); min interval 1 minute; **per-task permission mode with "always allow" learned on first run**; **missed-run catch-up: exactly one catch-up run for runs missed in the last 7 days**; prompt stored at `~/.claude/scheduled-tasks/<task>/SKILL.md`; a task can reschedule itself via `update_scheduled_task`. → Directly addresses two chronic runner failure modes: "refused" (permission not allow-listed) and "never run / missed Sep 20" (no catch-up). See CAIO-06.

### 1.4 Computer-use agents (incl. Orca and CLI-Anything)

| Option | Dated fact | Source | Fit for homes.com / SkySlope / zipForms |
|---|---|---|---|
| **Orca (Stably AI)** | GitHub releases: **v1.4.206 on 2026-09-20**, v1.4.205 (Sep 17), v1.4.204 (Sep 16), **v1.4.203 (Sep 15)** = the exact version on the Mac. The project describes itself as the agent ADE/orchestrator (MIT) **with an `orca computer` CLI** (list apps, read accessibility trees, click, set values, type, scroll, screenshot) and 7 first-party skills incl. `computer-use`. | github.com/stablyai/orca/releases (primary); YC profile; skills-hub (secondary) | **Contradicts the deck's "no MCP or API of its own found"**: the installed bundle matches the current Orca product, which exposes a CLI a Claude Code skill can call. 3 patch releases behind. onorca.dev docs were egress-blocked — CTO to confirm the CLI on the Mac. |
| **CLI-Anything (HKUDS)** | 49.7k stars; DOMShell MCP + accessibility-tree "Browser CLI" for web apps without APIs; recent security hardening (path traversal, defusedxml, symlink escape); **no CRM or real-estate wrappers in the hub**; last visible activity 2026-05-30. | github.com/HKUDS/CLI-Anything (primary) | The spec'd path for API-less sites. Generated CLIs are unvetted code — ECC security review is mandatory. |
| **Claude Cowork in the Chrome side panel** | **2026-08-12**: the Chrome side panel is a full Cowork session; skills, plugins and connectors work in the browser; cross-device hand-off; Max/Team now, Pro rolling out. | 9to5Mac 2026-08-12; claude.com post (blocked) | Lowest-integration path for *interactive* (Steven-present) browser work on SkySlope/zipForms; not unattended. |
| Perplexity Computer / Personal / Portable Computer | Computer 2026-02-25 ($200/mo); Personal Computer 2026-03-11; Windows 2026-07-28; Portable Computer with NVIDIA 2026-08-25. | Semafor 2026-02-25; SiliconANGLE 2026-07-28 / 2026-08-25 (blocked, URL-dated) | Duplicates the Claude subscription; IGNORE. |
| OpenAI ChatGPT agent / Operator | Removed from ChatGPT early Aug 2026; browser work routed to ChatGPT Work + cloud browser (snippet). | OpenAI help center (secondary) | Unstable surface; IGNORE this quarter. |

---

## 2. Obsolescence flags against the current stack (BRIEF §2 + toolkitSnapshot 2026-09-22)

| # | Stack item (as installed) | External state (dated) | Flag | Proposal |
|---|---|---|---|---|
| O-1 | **ruflo** — "Ruflo (claude-flow v3)", 45 ruflo-* plugins, MCP `plugin:ruflo-core:ruflo`, CLI pinned to node@22 because **Node 24.19 aborts every short-lived run**; Ruflo memory = 238 entries (L3/L4 store) | Upstream releases weekly: v3.41.4 (Sep 14) → **v3.42.4 (2026-09-17)**; v3.42.0 (Sep 15) changed swarm consensus/trust weights, vector search, MCP governance; v3.42.4 changed `similarity` score semantics and added `rankingScore`; v3.41.4 added a `degraded:true` flag on fallback responses. Rebranded from claude-flow at v3.5.0 (Feb 2026, secondary). | **Drift + runtime fragility.** Installed version unrecorded; search-score semantics changed upstream, so recall results may silently differ after any upgrade; Node 24 incompatibility is unresolved. | Record the installed version in toolkitSnapshot; upgrade only inside sandbox-qa with the recall holdout set; consider collapsing L3 onto Graphify + Jarvis if Ruflo's 238 entries add no recall hits (loop-engineering metric). (CAIO-08) |
| O-2 | **OpenJarvis** — Rust memory store built 2026-09-13; **llama3.1:8b via Ollama** as Vanessa's offline voice; also an Ollama model literally named "claude-fable-5.1" that is llama3.1:8b with a system prompt | Upstream active (Stanford Hazy Research/Scaling Intelligence; Apache-2.0; 10.1k stars; commits through 2026-09-20). **Meta Muse Glimmer 30B** (2026-08-10, Apache-2.0, dense, ~<20 GB at 4-bit, built for local agents) is the obvious successor to an 8B 2024 model — *if the Mac's RAM allows (unverified)*. | **Model obsolescence, plus a naming hazard:** an Ollama model tagged "claude-fable-5.1" that is actually llama3.1:8b will mislead any status page or log that prints the model name. | Rename the Ollama tag honestly (e.g. `vanessa-local-llama31-8b`); pilot Muse Glimmer 30B or a 4-bit 27–30B class model for the free-mode voice. (CAIO-09) |
| O-3 | **Composio** — 12 connected apps (incl. github, gmail, zoho, perplexityai) | **Security incident disclosed 2026-05-21**: ~5,241 API keys and ~5,001 GitHub OAuth tokens exfiltrated via a compromised employee Gmail OAuth token → magic-link interception; all user GitHub tokens revoked; affected keys contacted; IP allowlisting added (Material Security; Metorial; P0; composio.dev post blocked). June 2026 platform security updates (releasebot, secondary). Catalog ~1,089 toolkits (Aug 2026, secondary); **no Lofty toolkit** (BRIEF). | **Credential-custody risk** on the path that carries Zoho, Gmail, GitHub. Nothing shows Steven's account was in the affected set — and nothing shows it wasn't. | (a) Steven: confirm no incident notice, rotate the Composio API key, re-authorize GitHub, enable IP allowlisting; (b) move Zoho to Zoho's **own MCP servers / the official Claude "Zoho CRM" connector** and keep Composio as fallback. (CAIO-02, CAIO-03) |
| O-4 | **Inkbox** — iMessage +1 650-484-9720 and email jasmine@inkboxmail.com (Inkbox identity, not Steven's) | YC S26; SDKs Python/TS/Rust, Claude Code plugin in the marketplace, MCP-only Cursor plugin; **custom email domains supported** ("eligible paid plan"); 705 commits (github.com/inkbox-ai/inkbox, primary; no dated Aug–Sep changelog visible). | Not obsolete. **Identity gap**: client-facing email from an inkboxmail.com address is wrong for a licensed MLO/broker. | WATCH; if Vanessa ever emails clients, use a custom domain and route through Alexandra's compliance review first. (CAIO-13) |
| O-5 | **Magica** — HTTP MCP at inference.magica.com for image/video/TTS; 22 persona portraits (flux-2-max), Seed Audio voice clips, Hedra lipsync | magica.com is egress-blocked; App Store lists "Magica – AI super agent" (id 6742551956); tools page (per snippet) lists Hedra Lipsync, Infinitalk, video tools. **No dated primary evidence of API/MCP stability or SLA — unverified.** | **Single-vendor dependency** for all avatar/voice media; pre-rendered clips only (no request-time TTS on the deck). | WATCH; keep source portraits/audio exported in the weekly backup so a vendor change is survivable. (CAIO-14) |
| O-6 | **You.com** — retired 2026-09-22 (Steven) | Internal decision; free tier returned "limit exceeded" 2026-09-22 08:40 UTC (BRIEF). | Retired — confirm no silent call sites remain (13 interactive call sites listed in §2). | Retire item; verification belongs to the integrator's grep, not CAIO. (CAIO-15) |
| O-7 | **MCP servers on the Mac (15)** | Spec 2026-07-28 deprecates Roots/Sampling/Logging and HTTP+SSE (12-month transition); stateless core; CIMD auth. | **Migration clock started 2026-07-28.** | Transport/feature audit per server; prefer Streamable HTTP; add Tasks extension for long syncs (lofty-crm-sync). (CAIO-07) |
| O-8 | **OpenRouter bridge** — no key; councilPricing (2026-09-16) seats: openai/gpt-5.2, google/gemini-3.1-pro-preview, x-ai/grok-4.3, meta-llama/llama-4-maverick | **Stripe acquiring OpenRouter for >$7B** (Bloomberg 2026-08-16; Axios 2026-07-24); Series B at $1.3B (TechCrunch 2026-05-26); ~$160M ARR Aug 2026 (Sacra, secondary). Current models: GPT-6 Astra (Sep 3–4), Gemini 3.8 Flash / 3.1 Pro, Grok 4.6 (Aug 12), Muse Glimmer 30B (Aug 10). | **Stale seat list**, dormant. Ownership change = possible key/billing changes if ever funded. | WATCH; have openrouter-credits-refresh re-price against current model ids; no key purchase recommended (Claude subscription covers research). (CAIO-10) |
| O-9 | **Perplexity** — `npx @perplexity-ai/mcp-server` (user scope) + Composio perplexityai; does research heavy lifting | Computer (2026-02-25, $200/mo), Personal Computer (Mar 11), Windows (Jul 28), Portable Computer (Aug 25); API now Agent/Search/Embeddings; Pro subscribers get $5/mo Sonar credit (felloai, secondary). | Not obsolete; the *agent* products duplicate Claude. | Keep the MCP path; IGNORE Computer/Portable. (CAIO-16) |
| O-10 | **Health Auto Export → LaunchAgent :8765 → DuckDB → apple-health MCP** — daemon down; `appleHealth` last real ingest 2026-09-13 | The **app is alive and maintained** (App Store id 1115567069; HealthyApps help center; GitHub Lybron/health-auto-export API docs). The failure is Steven's local daemon, not the vendor. **Claude iOS app reads Apple Health directly** since **2026-01-22** (beta; Pro/Max, US; read-only; movement, sleep, workouts, vitals, body measurements) (MacRumors 2026-01-22; @claudeai post). | **Pipeline obsolete by design**: four hops (phone app → Drive → daemon → DuckDB) where one (Claude iOS → Notion) now exists. | Adopt the §2 Notion recipe as primary; keep Health Auto Export as optional second source only if the daemon is fixed. (CAIO-04) |
| O-11 | **Lofty — real-estate system of record since 2026-09-22**; API key not installed, no successful pull yet; Composio has no Lofty toolkit, so the path is the Mac's `lofty-bridge` | **Lofty**: AOS + Cowork + House.ai on **2026-07-28** (GlobeNewswire/Inman/HousingWire); AI Sales Agent (24/7 virtual ISA) **from $60/mo per 200 leads, +$30 per 100** (Luxury Presence 2026, secondary); Homeowner Agent Apr 2026 (secondary). | **Not connected yet** — the real-estate CRM path carries no live data until the key lands, so no lead figure on any surface is current. Lofty ships agentic features natively. | Complete the key + first sync; pilot Lofty AI Sales Agent against the human-ISA gap. (CAIO-11) |

---

## 3. Competitive / capability gap analysis — solo VA-loan MLO + broker, Temecula/San Diego

Ground truth on Steven's side comes from BRIEF §2 and the inventory (not assumed). "Market" facts are dated.

| Capability | What the market ships (dated) | What Steven has today (verified) | Gap | Proposal |
|---|---|---|---|---|
| **Speed-to-lead / 24/7 ISA** | Lofty AI Sales Agent (24/7 qualifying + booking; from $60/mo, secondary); **UWM Mia** voice LO assistant — 2026-05-14 upgrades: Mia On Demand, pre-qual follow-up, Mortgage Review, Mia Español; "80,000+ loans closed in 12 months" (HousingWire, snippet). | Human ISA has posted nothing since 2026-09-16; r2-lead-response-watchdog and lead-triage-daily have had no working lead source since 2026-09-16 and Lofty is **not connected yet**; the `leadResponse` doc is stamped 2026-09-22 03:02Z but carries no live CRM data; Vanessa iMessage inbox polls hourly 7:30–21:30 PT; **no outbound phone agent** ("still open" on the deck). | **Largest gap.** Competitors answer in seconds by voice/text at all hours; Steven's loop is hourly polling with no connected CRM feed. | Pilot Lofty AI Sales Agent for real-estate leads (Vanessa QA + escalation); ask Patriot Pacific whether Mia is available to the brokerage for mortgage leads (unverified). (CAIO-11, CAIO-12) |
| **Conversational home search surfaces** | Zillow AI mode **2026-03-25** (beta; multi-agent "skills" for search/financing/valuation; tours + agent connection); Zillow app in ChatGPT Oct 2025; Redfin ChatGPT app Feb 2026; **Realtor.com ChatGPT app 2026-03-30** (previews only, no MLS training, routes back to Realtor.com); **Homes AI 2026-02-17** (Azure OpenAI; "Your Listing, Your Lead"). | Property-search strategy card depended on You.com (retired today → queued research); no AI-surface presence audit; `geo-aeo-optimizer` agent exists on the Mac (roster). | Buyer discovery is moving into chat surfaces that route to the **listing agent** (Homes.com) or Zillow's own network. | Run the geo-aeo-optimizer weekly against Steven's agent/listing/NMLS profiles on all six surfaces; treat as marketing (Sofia) not build. (CAIO-17) |
| **Buyer financial readiness / affordability** | Lofty **House.ai** (2026-07-28: credit-building, savings, affordability → "transaction-ready clients"); Realtor.com in ChatGPT builds affordability budgets; Zillow AI mode financing skill. | Rent-Buy-Wait military dashboard (cloud refresh routine **abandoned 2026-09-21**); VA specialist content; rates feed ok (ratesSnapshot 2026-09-22). | Medium — the VA-specific affordability/entitlement conversation is a **differentiator nobody above owns**. | Revive the Rent-Buy-Wait refresh on the Mac runner; expose it as Vanessa's "VA readiness" answer path. (CAIO-17) |
| **CRM-native AI agents** | **Zoho Zia Digital Employees** (Zoholics USA 2026-05-12/13: agent provisioned as a CRM user with its own role/audit trail; Enterprise+; US/India DCs); Agent Studio 700+ actions; Marketplace 25+ agents; Zia LLM 1.3B/2.6B/7B; **Zoho's own MCP servers + official Claude connector** (zoho.com developer MCP page, claude.com/connectors/zoho-crm — dates unverified, pages blocked). Lofty AOS/Cowork (2026-07-28). | Zoho: connected via Composio but **every call 403 NO_PERMISSION** until Steven flips the profile setting; Lofty: bridge + CLI installed, key unverified; pipelines are deck-only pastes (Sep 14). | Blocked by **permissions**, not capability. | Steven's two one-line fixes unblock everything downstream; then choose Zoho MCP over Composio. (CAIO-02) |
| **LOS / pricing in the broker's workflow** | ARIVE: Rocket Pro full in-LOS submission + live status (Jun 2026), HomeXpress on ARIVE (Feb 2026); "Mortgage Intel AI" LOS-agnostic sidekick (GitHub issue only — **unverified product**). | mortgage-rates-daily ok; LOAN_PROGRAMS 39 / LENDER_DIRECTORY 61 held in the deck; **which LOS Patriot Pacific uses is not in the inventory**. | Unknown until Steven states the LOS. | Steven: name the LOS/PPE; if ARIVE, request its API/partner docs for a read-only pipeline feed. (CAIO-18) |
| **Transaction / forms automation** | SkySlope **Ayce** iOS coaching app 2026-02-11 (goal-driven tasks, scripts, chat); SkySlope × Cloze paperwork automation (undated); zipForms/Lone Wolf — no public agent API found. | CLI-Anything wrapper spec written this cycle (E11b); nothing installed on the Mac; Orca present but unwired. | Medium; no vendor offers an agent API, so the DOMShell/computer-use path is the only one. | HITL-only pilot with ECC security review. (CAIO-05) |
| **Buyer expectations for AI** | Veterans United survey: **45%** of prospective buyers use AI tools (up from 40% in Q1 2026); **89%** would share financial info with a lender's AI tool; **68%** trust AI mortgage information (PRNewswire, 2026 — exact date unverified). Homebuyers Privacy Protection Act in effect **2026-03-04** restricting trigger-lead sales (secondary; Alexandra to confirm). | VA niche + Navy Chief credibility — an unusually strong trust position for an AI-assisted intake. | Opportunity, not gap. | Let Vanessa's intake be the "lender AI tool" veterans say they'd use — with disclosures Alexandra approves. |
| **Personal ops (health)** | Claude iOS ↔ Apple Health (2026-01-22, read-only, beta). | Daemon dead 9 days. | Fix in hand. | CAIO-04. |
| **Orchestration** | Claude Code Projects beta (2026-09-17): parallel cloud threads + shared memory. | Vanessa dispatches ≤8 sub-agents by hand-built skill; Mac-bound. | Cloud-side parallelism exists off the shelf, but can't touch Mac-local tools. | WATCH / waitlist. (CAIO-19) |

---

## 4. Weekly Disruptive Recommendation Brief (proposal-only, trust L1)

Format: **Verdict · action** — expected value — risk — evidence — **→ CTO Innovator feasibility** (fit · integration cost · security risk · real-vs-hyped).

### CAIO-01 · PILOT · upgrade — Re-test unattended cloud-routine writes after Claude Code 2.1.277
- **Affects:** 46 enabled cloud routines (research-only by design), Command Deck artifact DB, Ops Radar, weather/news/rates feeds.
- **Expected value:** if writes now succeed, the deck refreshes even when the Mac sleeps, and ~10 Mac-runner feed tasks become redundant.
- **Risk:** the doc's no-prompt conditions (artifact not shared-with-latest-version; page holds no grant beyond the page) may still exclude the deck; a false positive would mask the parked prompts again. Test one low-stakes doc (e.g. `weatherSnapshot`) for 3 runs before touching anything else.
- **Evidence:** Claude Code changelog 2.1.277, 2026-09-18 (primary); Routines doc, fetched 2026-09-22 (primary); BRIEF §2 "parks on a permission prompt (confirmed three times)".
- **→ CTO Innovator feasibility:** fit high · integration cost S (one routine, one doc) · security risk low (read/write of Steven's own doc) · real — a shipped changelog line, but its scope ("save data to editable artifacts") vs the deck's `db` capability is unverified.
- **OUTCOME, added 2026-09-23 (the proposal above is left as written):** the pilot was run and it
  **succeeded**. A probe routine fired unattended at 2026-09-22 09:05:56Z and left `cloudWriteProbe`
  in the deck's store; four cloud writers have run on it since (weekly backup, live Pipeline Sync,
  ISA escalation ladder, feed freshness watchdog — `feedFreshness` written 2026-09-23 00:50Z). The
  "research-only by design" premise in *Affects* above no longer holds. What did **not** change is
  the connector limit: an agent-created routine carries no connectors, so the ~10 Mac feed tasks
  that need Zoho, Lofty, Gmail, Calendar, Strava or Notion do **not** become redundant. Write-up:
  `docs/CLOUD-WRITE-ARCHITECTURE.md`.

### CAIO-02 · ADOPT · replace — Zoho via Zoho's own MCP servers / official Claude "Zoho CRM" connector, Composio as fallback
- **Affects:** zoho-crm-sync (cloud, 4×/day), zohoSync/zohoLeads/zohoDeals docs, Composio dependency.
- **Expected value:** removes a third-party credential custodian from the mortgage pipeline path; same OAuth scopes as the user; no extra cost per Zoho.
- **Risk:** the same Zoho-side profile permission (`Crm_Implied_Api_Access`) almost certainly gates MCP too — **Steven's fix comes first either way**; the official pages were egress-blocked, so plan/DC availability is unverified.
- **Evidence:** Zoho CRM MCP developer page + Claude setup guide (snippet; dates unverified); Zoho community post dated 2026-03-27 (URL); claude.com/connectors/zoho-crm (snippet); Zoholics USA 2026-05-12/13 (crmexpertsonline, shashi.co May 2026).
- **→ CTO feasibility:** fit high · cost S–M (custom connector in claude.ai + rewrite zoho-crm-sync tool names) · security risk lower than today · real.

### CAIO-03 · ADOPT · upgrade — Composio hygiene after the May 21, 2026 incident
- **Affects:** all 12 Composio apps (gmail, github, zoho, perplexityai, googleads, googlesheets…).
- **Expected value:** closes an open question the deck cannot answer ("was this account in the 0.3%?"); IP allowlisting + key rotation are free.
- **Risk:** none technical; requires Steven (credentials) — flagged **needs Steven**, not a halt.
- **Evidence:** Material Security "One token, 10K doors" (2026); Metorial; P0 Security; composio.dev incident post (blocked). Disclosure 2026-05-21.
- **→ CTO feasibility:** fit n/a · cost XS · security risk reduced · real.

### CAIO-04 · ADOPT · replace — Apple Health via the Claude iOS integration → Notion → `appleHealth`
- **Affects:** Health Auto Export daemon (:8765), r8-apple-health-snapshot, health-full-analysis, apple-health MCP, wellness tiles.
- **Expected value:** ends a 9-day-stale feed with a one-tap daily phone routine; no daemon, no Drive hop.
- **Risk:** integration is **beta, US, Pro/Max**; read-only; daily human tap (Steven) — if he skips days the tiles must say so. Health data privacy: Notion becomes a health-data store (Elena to scope; keep PHI out of shared pages).
- **Evidence:** MacRumors 2026-01-22; @claudeai post (Jan 2026); Health Auto Export App Store/HealthyApps (app alive); BRIEF §2 daemon status.
- **→ CTO feasibility:** fit high · cost M (health-notion-sync task, E11b spec exists) · security medium (PHI in Notion) · real.

### CAIO-05 · PILOT · upgrade — Computer-use executor for API-less sites: Orca CLI first, Cowork-in-Chrome for interactive, CLI-Anything DOMShell for wrappers
- **Affects:** Orca v1.4.203 on the Mac, CLI-Anything install, homes.com / SkySlope / zipForms wrappers, Integration Engineer seat.
- **Expected value:** first working read-only pulls (saved searches, transaction status, form status) without vendor APIs; reconciles the deck's Orca card honestly.
- **Risk:** strict-mode computer-use success is ~42% on OSWorld 2.0 even for Fable 5.1 → **HITL only, read-only first**, never credentials in prompts; generated CLIs are unreviewed code → ECC security review gate; Orca docs were egress-blocked so the CLI surface on the Mac is unverified.
- **Evidence:** stablyai/orca releases v1.4.203 (2026-09-15) … v1.4.206 (2026-09-20) (primary); HKUDS/CLI-Anything README (primary; no CRM wrappers); 9to5Mac 2026-08-12 (Cowork in Chrome); Vellum OSWorld 2.0 numbers (Sep 2026).
- **→ CTO feasibility:** fit medium · cost M–L · security risk **high** (browser sessions with logged-in CRM/transaction data) · half-hyped: the tooling is real, unattended reliability is not.

### CAIO-06 · PILOT · upgrade — Move the never-run / refused runner slots to Claude Desktop scheduled tasks
- **Affects:** r6-weekly-backup (missed Sep 20), steve-twin-sweep (refused: vault write), weekly/monthly slots never proven (loop-engineering-weekly, weekly-self-update, access-audit-monthly…).
- **Expected value:** built-in **missed-run catch-up (one run within 7 days)** and **per-task "always allow"** learned on the first run remove the two failure modes the custom claude-runner shows most.
- **Risk:** still requires the app open + Mac awake ("Keep computer awake" setting); two schedulers side by side must not double-fire — migrate three tasks, disable them in the runner, compare for two weeks.
- **Evidence:** Desktop scheduled tasks doc (primary, 2026-09-22); inventory/mac-runner-status.md (Sep 22).
- **→ CTO feasibility:** fit high · cost S per task · security low (same pre-approved tools, now explicit per task) · real.

### CAIO-07 · WATCH · upgrade — MCP 2026-07-28 migration audit for the Mac's 15 servers
- **Expected value:** avoids a cliff when hosts drop HTTP+SSE / Sampling / Roots (12-month clock from 2026-07-28); Tasks extension suits long syncs.
- **Risk:** none now; cost later if ignored.
- **Evidence:** blog.modelcontextprotocol.io 2026-07-28 (primary).
- **→ CTO feasibility:** fit n/a · cost S (audit) / M (rewrites) · security improves (CIMD auth) · real.

### CAIO-08 · PILOT · upgrade — ruflo: pin, record, and sandbox-upgrade; decide whether L3 needs it
- **Expected value:** protects recall quality (score semantics changed in v3.42.4) and settles the Node 24 problem; possible simplification of the five-store recall.
- **Risk:** upgrade could change Ruflo-memory results silently → run against the untouched holdout set (loop-engineering).
- **Evidence:** github.com/ruvnet/ruflo/releases (primary): v3.42.4 2026-09-17, v3.42.0 2026-09-15, v3.41.4 2026-09-14; toolkitSnapshot 2026-09-22.
- **→ CTO feasibility:** fit medium · cost M · security low · real.

### CAIO-09 · PILOT · upgrade — Replace llama3.1:8b in OpenJarvis with a 2026 local agent model (Muse Glimmer 30B) and rename the misleading "claude-fable-5.1" Ollama tag
- **Expected value:** materially better offline answers for Vanessa free-mode; honest model naming in logs.
- **Risk:** RAM/disk on the Mac unverified; a 30B dense model may be too slow for voice — test tokens/s first; licensing is Apache-2.0 (fine).
- **Evidence:** VentureBeat / InfoQ / MarkTechPost 2026-08-10 (Muse Glimmer); open-jarvis/OpenJarvis README (primary); toolkitSnapshot 2026-09-22.
- **→ CTO feasibility:** fit medium · cost S–M · security low (local) · real, hardware-dependent.

### CAIO-10 · WATCH · upgrade — Council seats and OpenRouter: re-price against current models; do not fund
- **Expected value:** the council price table stops quoting superseded models; if ever funded, seats would be GPT-6 Astra / Gemini 3.8 Flash or 3.1 Pro / Grok 4.6 / Muse Glimmer.
- **Risk:** Stripe acquisition may change keys/billing; the council is unused today — no urgency.
- **Evidence:** councilPricing doc 2026-09-16; Bloomberg 2026-08-16; TechCrunch 2026-05-26; CNBC 2026-09-03 (GPT-6); Fortune 2026-09-03 (Gemini); DataNorth (Grok 4.6, Aug 2026).
- **→ CTO feasibility:** fit low · cost XS · security n/a · real but low value.

### CAIO-11 · PILOT · adopt — Lofty AI Sales Agent as the 24/7 first-response layer for real-estate leads
- **Affects:** ISA coverage, r2-lead-response-watchdog, lead-triage-daily, isaKpi, Vanessa iMessage inbox.
- **Expected value:** closes the speed-to-lead gap while the human ISA is silent (since 2026-09-16); Vanessa moves to QA/escalation, which is her better seat.
- **Risk:** cost ($60/mo + setup fees reported $299–$1,499 — secondary source), AI-to-consumer messaging must pass Alexandra (TCPA/advertising) and Elena; depends on the Lofty key + first sync landing first.
- **Evidence:** GlobeNewswire/Inman/HousingWire 2026-07-28 (Lofty AOS/Cowork/House.ai); Luxury Presence Lofty pricing 2026 (secondary); Lofty Help Center "Getting Started with AI Sales Agent" (undated).
- **→ CTO feasibility:** fit high · cost S (vendor-side config) · security medium (consumer PII, consent) · real product, ROI unproven for a solo operator.

### CAIO-12 · WATCH · adopt — UWM Mia for mortgage-side voice follow-up (if Patriot Pacific is a UWM broker partner)
- **Expected value:** outbound/inbound voice at zero build cost; Spanish; pre-qual follow-ups.
- **Risk:** lender-captive (steers volume to UWM) — Alexandra's anti-steering lens; availability to Steven **unverified**.
- **Evidence:** UWM media alert 2026-05-14; HousingWire "Refi '86 and Mia upgrades" (May 2026); MPA (Mia Español).
- **→ CTO feasibility:** fit conditional · cost XS · security vendor-side · real.

### CAIO-13 · WATCH · upgrade — Inkbox custom-domain identity before any client-facing email
- **Evidence:** github.com/inkbox-ai/inkbox README (primary; custom domains on eligible paid plan); YC S26 profile.
- **→ CTO feasibility:** fit medium · cost S · security/compliance medium · real. Not needed while Inkbox only serves Steven's own team.

### CAIO-14 · WATCH · upgrade — Magica single-vendor media dependency
- **Evidence:** App Store "Magica – AI super agent" (id 6742551956); magica.com/tools (snippet); magica.com egress-blocked — API/MCP stability **unverified**.
- **→ CTO feasibility:** fit n/a · cost XS (export source assets into the Sunday backup) · security low · unverified vendor durability.

### CAIO-15 · IGNORE · retire — You.com (retired 2026-09-22)
- Nothing to adopt; the integrator's grep for the 13 call sites is the only remaining action.

### CAIO-16 · IGNORE · — Perplexity Computer / Personal / Portable Computer; OpenAI ChatGPT agent/Work
- **Evidence:** Semafor 2026-02-25; SiliconANGLE 2026-07-28, 2026-08-25; OpenAI help center (snippet).
- Duplicate the Claude subscription at $200/mo, or are mid-reorganization. Keep Perplexity strictly as the research MCP.

### CAIO-17 · ADOPT · adopt — AI-surface presence audit (six conversational search surfaces) + revive Rent-Buy-Wait as the VA-readiness answer
- **Evidence:** Zillow Front Porch 2026-03-25; realestatenews 2026-03-26; PRNewswire/Inman 2026-03-30 (Realtor.com); CoStar/BusinessWire 2026-02-17 (Homes AI); Inman 2026-07-09 (Zillow Pro nationwide); BRIEF §2 (Rent-Buy-Wait refresh abandoned 2026-09-21).
- **→ CTO feasibility:** fit high · cost S (runs on existing geo-aeo-optimizer + Sofia) · security none · real.

### CAIO-18 · WATCH · adopt — ARIVE (or whichever LOS Patriot Pacific uses) as a read-only pipeline feed
- **Evidence:** NMP/HousingWire Rocket Pro–ARIVE (June 2026); HousingWire/NMP HomeXpress on ARIVE (Feb 2026). "Mortgage Intel AI" is a GitHub issue, not a product — unverified.
- **→ CTO feasibility:** fit unknown until Steven names the LOS · cost M · security medium (borrower PII) · real.

### CAIO-19 · WATCH · adopt — Claude Code Projects (parallel cloud threads) as a future home for Vanessa's cloud-side fan-out
- **Evidence:** VentureBeat / itechpost 2026-09-17/18; code.claude.com/docs/en/claude-projects (primary: Pro/Max beta, waitlist, Opus-high default per thread, no Mac-local tools).
- **→ CTO feasibility:** fit medium (cloud-only work) · cost M · security medium (repos/connectors in cloud) · real but early; join the waitlist, do not re-architect.

### CAIO-20 · ADOPT · adopt — `claude plugin eval` + account→terminal skill sync + AGENTS.md as the measurement layer for skills-refresh and loop-engineering
- **Expected value:** the trust-graduation gate (7 consecutive correct runs) finally has a scorer; the claude.ai skill set (cole-mentor etc.) and the Mac's 1,400 skills stop drifting; E10's AGENTS.md router is honored natively.
- **Risk:** evals cost tokens; scope to the ~20 skills the AI Team table names.
- **Evidence:** Claude Code changelog 2.1.269 (2026-09-11), 2.1.275 (2026-09-17), 2.1.277 (2026-09-18) — primary.
- **→ CTO feasibility:** fit high · cost S–M · security low · real.

---

## 5. Summary — top three (≤300 words)

**1. Close the speed-to-lead gap with a vendor ISA layer, not more polling (CAIO-11, PILOT).** The market answers leads in seconds by text and voice at all hours — Lofty's AI Sales Agent (from $60/mo, secondary source) and UWM's Mia (upgraded 2026-05-14) — while Steven's lead loop has been dead since 2026-09-16 (no connected CRM, silent ISA, hourly polling). Once the Lofty key lands, pilot the AI Sales Agent for real-estate leads with Vanessa as QA/escalation and Alexandra's consent review up front. It is the only item that plausibly moves revenue.

**2. Rebuild the data spine on first-party paths (CAIO-02/03/04, ADOPT).** Composio disclosed a credential-exfiltration incident on 2026-05-21 (~5,241 API keys, ~5,001 GitHub tokens). Zoho now ships its own MCP servers and an official Claude connector, so the mortgage pipeline should not route through a third-party custodian — but Steven's one-line Zoho profile fix comes first either way, and he should rotate the Composio key and re-authorize GitHub regardless. Apple Health should move to the Claude iOS integration (live since 2026-01-22) → Notion, retiring a four-hop daemon stale for nine days. All three are permission tasks, near-zero build.

**3. Re-test unattended cloud writes and measure the skills (CAIO-01, CAIO-20).** Claude Code 2.1.277 (2026-09-18) says scheduled routine runs "save data to editable artifacts without asking" — new since the three confirmed parked prompts. A three-run pilot on one low-stakes doc could turn 46 research-only routines into writers and retire Mac feed tasks. In the same train, `claude plugin eval` (2.1.269) and account→terminal skill sync (2.1.275) give the loop-engineering trust gate a real scorer.

Computer-use (Orca CLI, Cowork-in-Chrome, CLI-Anything) stays a HITL-only pilot: Fable 5.1 scores 41.7% strict on OSWorld 2.0. Everything else is WATCH or IGNORE. Nothing is executed; every item goes to the CTO Innovator.
