# Tool & integration status

What is actually connected, installed, or merely proposed — read this before assuming a seat can do something because its description says so. Status categories follow `wiki/dashboard-ops/index.md`'s rule: a task existing is not a task running, and a connector existing is not a connector enabled.

## Connectors (claude.ai)

**Connected + enabled:** Gmail (read + drafts) · Google Calendar (read) · Notion · Slack (Patriot Pacific workspace, read-only) · Strava · Context7 · Inkbox (iMessage, email, Discord relay) · Google Docs/Sheets/Tasks · GitHub · YouTube · Discord · Magica (media).
**API-blocked, connection active:** Composio → Zoho CRM — every call returns 403 `NO_PERMISSION` until Steven enables "Zoho CRM API Access" on the connected profile.
**Mac only, live:** Lofty — `lofty-bridge` MCP + `lofty-cli`, no Composio toolkit; key in place and syncing since 2026-10-07 (54 leads). Speed to lead is not measurable yet: the bridge's lead list carries no lead id (`integrations/mac-fix-isa-kpi-2026-10-08.md`).
**Retired:** You.com (replaced by the Claude subscription's own search). **Never completed:** GoHighLevel.
**Not connected:** Canva (needs reconnect) · BlackRock Advisor Center · Health Data Avatar · Microsoft 365 · PlayMCP.

## Local MCP / bridges (Mac)

TradingView · Apple Health (+ apple-health-xml, health-export — the ingest daemon has gone unresponsive for stretches; check `runnerStatus` for current state) · Lofty (read-only) · notion-brain · OpenTerminal · OpenRouter (no API key) · ruflo (claude-flow) · API Nation · filesystem · fetch · memory · git. Plus the Plaid bridge (no keys) and Magica.

## Mac scheduled tasks and cloud routines

Both run under their own status doctrine — see `wiki/dashboard-ops/task-catalog.md` and `routine-catalog.md` for the current per-task/per-routine state. In short: the daily research cadence (weather/news, calendar, rates) is the layer that reliably holds; the weekly review/self-improvement layer is the one that has repeatedly failed and needs fixing first.

## Orca — proposed, not integrated

**Orca Computer Use v1.4.220 (Stably AI; Mac toolkit snapshot 2026-10-05, v1.4.203 on 09-16) is reported installed on the Mac as a standalone computer-use app — unverified from the cloud — NOT integrated with Claude Code.** The separate `stablyai/orca` parallel-worktree IDE is **not installed**. This is a **proposal only**: an "Anything/Orca computer-use executor" seat under Elon, for sites without an API, vetted by the CTO Innovator (and Elena, for security) before it becomes real. Do not report Orca as a working executor seat, and do not confuse the installed standalone app with the unbuilt IDE integration.

## Laya — proposed, not installed

**Laya** (`github.com/NandhaKishorM/laya`, Apache-2.0) is a local, non-autoregressive "System 1" decision model: typed choice/score/yes-no answers in a single forward pass, roughly 33 ms on GPU, with an MCP server available via `pip install "laya[mcp]"`. It is **proposed** as the brain's zero-token router/ingest classifier under Derek — a fast local pre-filter ahead of a full LLM call — and is **not yet installed on the Mac**. Treat any mention of Laya doing live routing today as wrong until this status changes.

## 77skills.ai — proposed, not purchased

**77skills.ai** is a paid ($77) pack of 77 business skills delivered as markdown/`SKILL.md` files. It is **not purchased and not installed**. The intended import path is a skill-pack importer being built at `integrations/skill-packs/`, with an **ECC security review required before anything from the pack is enabled** — a purchase decision alone does not clear that gate.

## Skills actually in the repo today

Three skills Steven asked for exist as `SKILL.md` files in this repo's `.claude/skills/`: **interview-me**, **prompt-master**, **skills-refresh**. Installing them onto each Mac is the job of `scripts/brain-sync.sh` (being written by another agent, not yet confirmed run) — a skill existing in this repo is not the same as it being live on Steven's Mac until that script has actually run there.

## See also

- `wiki/ai-team/org-chart.md` — which seat each connector or bridge belongs to.
- `wiki/ai-team/model-tiering-dispatch.md` — the ECC review gate every proposal above must clear.
- `wiki/dashboard-ops/task-catalog.md` / `routine-catalog.md` — live status detail for the tasks and routines mentioned here.

Source: Command Deck, "Connectors / Local MCP / Mac tasks / Cloud routines / Skills / Agents" toolbox card (`AI_TEAM_TOOLBOX`) for the connector/bridge/task/routine sections. The Orca/Laya/77skills/repo-skills statuses are Steven's own stated facts about tools outside the deck's current toolbox card, recorded here for the first time — not yet cross-checked against the deck itself.

*Updated 2026-10-08: Perplexity removed (2026-10-05); Lofty live; browser-use and OpenDesign proven in the cloud, Mac install pending (`integrations/browser-use/`, `integrations/open-design/`).*

## API Anything — websites as read-only APIs

**API Anything** (added 2026-10-08, `integrations/api-anything/`): turns a website into read-only operations Claude calls over plain HTTP (MCP server `api-anything`: list_sites, list_operations, call_operation, login). Proven in the cloud; Mac install is one command. Site connections run on the Mac (`integrations/api-anything/mac-connect-sites-2026-10-09.md`): FRED and Freddie Mac PMMS now; Redfin, lender, builder and homes.com pages only after Steven's terms-of-service yes per group; never ShowingTime, Showami, SkySlope or zipForms (client data). Owner Derek; risk owner Elena.

## Remote control — both Macs, Claude sessions and Orca (2026-10-09)

Steven asked for remote control of his two Macs ("this computer" and the other) from his dashboard. Built, tested against stubs, **not yet run on a Mac**:
- **Claude sessions:** `integrations/remote-control/rc-agent.sh` keeps one `claude remote-control` server running per Mac (LaunchAgent, asks first, no poller, needs the claude.ai subscription login; an API key or gateway blocks it). Claude Desktop sessions join the same list through `/remote-control` in its Code tab. Remote Control steers sessions; it does not click the Desktop window.
- **Orca:** `integrations/remote-control/orca-remote.sh` wraps Orca's own `orca serve` / `orca environment add`. A pairing link is a secret equal to control of that Mac's agents: pair only over his own network, never store it, never grant desktop control.
- **Dashboard:** the Command Deck Toolkit tab has a "Remote control" card. It cannot reach the Macs; it shows what Steven pastes from each Mac's `report` line, with its age, and refuses pairing links. Org chart: Derek's team has a "Remote Control" lane (Sam).
- **Failover:** `claude-auto --doctor` and `install-failover.sh` (integrations/omniroute-failover) diagnose and fix why OmniRoute does not take over at the Claude limit.
- **Keep going (2026-10-09):** `claude-auto --keep-going` — Steven's own sessions continue on OmniRoute's free models at the Claude limit (type `/exit`, press Enter) and go back to Claude once it resets, same conversation. Client data never goes free. Built and tested here (265 failover checks); not yet run on the Mac. Owner: Integration Engineer under Elon; security gate Elena.
- **Weekly scout (2026-10-09):** `integrations/scout/scout.py` scans GitHub (new/rising repos: MCP servers, Claude Code plugins, skills, hooks, agent CLIs, memory, real-estate/mortgage/CRM APIs), releases of tools already in the stack, the official MCP registry, npm and Hacker News for the last 7 days; scores each for fit with Steven's stack, tags its owner seat, marks NEW, writes `docs/reports/SCOUT.md`. Runs free in the GitHub `scout` workflow (Sat 06:23 UTC) and as step 2b of the weekly loop; Disruption Scout → Nadia grades → Elon gates → Steven approves. Proposal only — installs nothing. First run 2026-10-09 in the cloud sandbox: MCP registry and npm reached (1,051 items, 454 relevant); GitHub and Hacker News are blocked from this sandbox and run in the GitHub workflow and on the Mac.
- **Dispatch planner (2026-10-09):** `bin/brain route "<request>"` turns a request into the org chart's parallel plan — lead seat, seats that join, waves of ≤8, gates (Alexandra, ECC, Vanessa last), HALTs. Rules live in `wiki/ai-team/cross-functional.md`; self-tested by `bin/brain loop`.

## context.dev and the AI Replica Studio (2026-10-09)
- **context.dev** (web scraping, brand intelligence, structured web data) is connected through Composio (account added 2026-10-09). A read-only brand search proved it that day; the free allowance showed 1,000 credits, 1 used. Owner: Sofia (marketing) for brand look-ups; Integration lane for the connection. Rule: public/brand data only, never client data.
- **AI Replica Studio** is a *plan*, not a system yet: `integrations/ai-replica-studio/PLAN.md`. Weekly real-estate and loan-officer videos of Steven's avatar, scripts by the Marketing Agent, compliance read by Alexandra, Steven approves every video, scheduled posting through the connected Facebook / Instagram / LinkedIn / YouTube accounts. Avatar provider and voice are Steven's decisions; he records his own consent and samples.
