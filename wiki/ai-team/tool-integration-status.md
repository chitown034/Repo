# Tool & integration status

What is actually connected, installed, or merely proposed — read this before assuming a seat can do something because its description says so. Status categories follow `wiki/dashboard-ops/index.md`'s rule: a task existing is not a task running, and a connector existing is not a connector enabled.

## Connectors (claude.ai)

**Connected + enabled:** Gmail (read + drafts) · Google Calendar (read) · Notion · Slack (Patriot Pacific workspace, read-only) · Strava · Context7 · Inkbox (iMessage, email, Discord relay) · Perplexity · Google Docs/Sheets/Tasks · GitHub · YouTube · Discord · Magica (media).
**API-blocked, connection active:** Composio → Zoho CRM — every call returns 403 `NO_PERMISSION` until Steven enables "Zoho CRM API Access" on the connected profile.
**Mac only, key pending:** Lofty — `lofty-bridge` MCP + `lofty-cli`, no Composio toolkit, API key and first sync pending.
**Retired:** You.com (replaced by the Claude subscription's own search). **Never completed:** GoHighLevel.
**Not connected:** Canva (needs reconnect) · BlackRock Advisor Center · Health Data Avatar · Microsoft 365 · PlayMCP.

## Local MCP / bridges (Mac)

TradingView · Apple Health (+ apple-health-xml, health-export — the ingest daemon has gone unresponsive for stretches; check `runnerStatus` for current state) · Lofty (read-only) · notion-brain · Perplexity · OpenTerminal · OpenRouter (no API key) · ruflo (claude-flow) · API Nation · filesystem · fetch · memory · git. Plus the Plaid bridge (no keys) and Magica.

## Mac scheduled tasks and cloud routines

Both run under their own status doctrine — see `wiki/dashboard-ops/task-catalog.md` and `routine-catalog.md` for the current per-task/per-routine state. In short: the daily research cadence (weather/news, calendar, rates) is the layer that reliably holds; the weekly review/self-improvement layer is the one that has repeatedly failed and needs fixing first.

## Orca — proposed, not integrated

**Orca Computer Use v1.4.203 (Stably AI) is installed on the Mac as a standalone computer-use app, NOT integrated with Claude Code.** The separate `stablyai/orca` parallel-worktree IDE is **not installed**. This is a **proposal only**: an "Anything/Orca computer-use executor" seat under Elon, for sites without an API, vetted by the CTO Innovator (and Elena, for security) before it becomes real. Do not report Orca as a working executor seat, and do not confuse the installed standalone app with the unbuilt IDE integration.

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
