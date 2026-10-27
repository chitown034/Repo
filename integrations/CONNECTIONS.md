# CONNECTIONS — every integration, its real status, and the one thing Steven must do

**Baseline 2026-09-12 · verified 2026-09-22.** Owner: Integration Engineer (under CTO Innovator,
reporting line Derek/CTO). Rule of this file: *connected ≠ working.* A row says what a run proved,
not what a settings page claims.

Trust levels: **L1** report-only · **L2** drafts for Steven's approval · **L3** owns end-to-end ·
**n/a** not an agent path.

**2026-10-09 addition:** Zoho, Lofty, Showami, ShowingTime, homes.com, CRMLS, zipForms, SkySlope, Dotloop, Ticor Property Data,
OmniRoute, FreeAPI, OpenRouter, APInation, Composio, CLI-Anything and API Anything are planned system by system, with the
real path, what Steven does and what agents do, in `integrations/CONNECT-PLAN-2026-10-09.md`. APInation is unidentified.

**Remote control (2026-10-09):** two Macs, Claude sessions via `claude remote-control` and Orca via `orca serve` pairing; scripts in `integrations/remote-control/`, card on the Command Deck Toolkit tab. Nothing has run on a Mac yet.

**context.dev (2026-10-09):** connected through Composio (brand/web data, 1,000 free credits, search proved). **AI Replica Studio:** plan only, `integrations/ai-replica-studio/PLAN.md`; Facebook, Instagram, LinkedIn and YouTube are already connected through Composio, the avatar provider is not chosen.

## The four that need Steven today

| System | Path | Status today | **What Steven must do (one line)** | Trust |
|---|---|---|---|---|
| **Lofty** (real-estate CRM) | `lofty-bridge` MCP (read-only) + `lofty-cli` on the Mac; REST `api.lofty.com/v1.0`, `Authorization: token <key>` | **Live since 2026-10-07:** the Mac's `lofty-crm-sync` reads 54 leads and stage totals (`loftySyncLog`, 2026-10-08 09:45 PT). **Speed to lead not measurable yet:** the bridge's lead list carries no lead id, so no activity timeline can be fetched — fix in `integrations/mac-fix-isa-kpi-2026-10-08.md`. Composio has no Lofty toolkit. | **Key: done.** Run the ISA KPI paste-in on the Mac (Action Desk step 10). | L1 → L2 after 7 clean runs |
| **Zoho CRM** (mortgage system of record — Steven, restated 2026-09-24) | Composio toolkit `zoho`, account `zoho_talite-spike` | Connection **ACTIVE**, but every CRM call returns **HTTP 403 NO_PERMISSION** (re-tested 2026-10-08, still 403) — reproduced 2026-09-22 08:17 UTC and **re-tested 2026-09-24**, twice — the second at 15:56 UTC (`ZOHO_GET_ZOHO_RECORDS`, Leads, one record, one non-PII field): still 403. Steven reports having an API key; **the key is not the blocker** — the profile permission refuses every key and token for that user until it is switched on. | **In Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → Developer Permissions, enable "Zoho CRM API Access".** Then re-authorise the Composio connection once. | L1 → L2 once unblocked |
| **CLI-Anything** (homes.com, ShowingTime, Showami, SkySlope, zipForms — plus Lofty and Zoho REST) | `cli-anything-hub` + Claude Code plugin; `cli-anything-browser` (**vendored in this repo**, not on PyPI — F-H1-02) driving DOMShell for the sites with no API; REST for Lofty and Zoho | **Not installed on the Mac** — and no longer generated: **eight read-only harness packages are pre-built** in `integrations/cli-anything-harnesses/` (a ninth, `publicfeeds`, added R6 2026-09-24 — see the dedicated section below) and install **browser first, then the eight, into one venv** — not `pip install .` per package: the six DOMShell packages (homes, ShowingTime, Showami, plus `publicfeeds`) pin `cli-anything-browser>=1.0.0`, which is not on PyPI, so installing one of them on its own exits 1 (built and unit-tested offline 2026-09-22, F-H2b-01…13; standalone-install measurement F-P4-03). Hub and plugin are one scripted step (`MAC-SETUP.sh --only cli-anything`); the vendored browser engine and all eight site packages are another (`--only cli-anything-harnesses`, one `uv pip install` into `~/Applications/cli-anything-harnesses/.venv`, browser first, symlinked into `~/.local/bin`); the earlier claim that the install is interactive was wrong (F-S1-18), and so is the claim that each wrapper must be generated one per site (F-H1-10). **Nothing is verified:** all 26 browser recipes ship `verified: false`, no site has ever been reached, and not one of the eight has ever made a live call (F-H1-01, F-H2b-13). SkySlope and zipForms refuse every live command, exit 3, until `CLI_ANYTHING_ECC_REVIEWED_AT` holds a real sign-off date; `publicfeeds`'s three groups refuse the same way behind their own three `CLI_ANYTHING_TOS_REVIEWED_<GROUP>` gates. Hub registry has no CRM or real-estate entries (README checked 2026-09-22; `clianything.cc` egress-blocked). | **Run `./MAC-SETUP.sh` — hub, plugin, the vendored browser harness and the eight packages all install non-interactively — put `export CLI_HUB_NO_ANALYTICS=1` in your shell profile **and** the runner task's env (the script only covers its own run), install the DOMShell Chrome extension and sign in by hand, then run `integrations/cli-anything-harnesses/connect.sh` for the guided next steps (posture check, `--discover` per open gate, what's still pending). There is nothing to generate.** | L1, read-only |
| **Strava** | Cloud routine "Health daily sync" (6:15 AM PT) reads the Strava connector and writes `stravaSnapshot` (positional rows); Mac task `strava-daily-sync` retired | **Working** — read live 2026-10-23 (newest activity 2026-09-12; Fitbod posts to Strava) | Nothing. If the card says sign-in needed: claude.ai → Settings → Connectors → Strava → sign in. | L1 |
| **BodyPark ATOM** | No API or export documented; sessions reach the deck as Apple Health workouts (Apple Watch session, or the app's own Health write) → Health Auto Export → the daily sync | **Waiting on click E** (allow the app to write to Apple Health; Workouts on in Health Auto Export) | Click E, once. | L1 |
| **MyFitnessPal** | No API, none needed: MFP → Apple Health → Health Auto Export file → the same sync (`dietary_energy`, `protein`, `carbohydrates`, `total_fat`, `dietary_water`) | **Waiting on the phone step** (click E in STEVEN-STEPS): MFP → Apple Health on, Health Auto Export → Metrics: select all | Click E, once. | L1 |
| **Apple Health** | **Live (2026-10-23):** Health Auto Export → Google Drive folder → cloud routine 6:15 AM PT (`scripts/health-drive-sync.py`) → `appleHealth` doc, `via:"drive-sync"`. Optional: Claude iOS → Notion "Health Log". Retired: the Mac daemon :8765 / DuckDB path | **Working** — first sync 2026-10-23 (`appleHealth` v19, days through 2026-10-22); `healthDriveSync` carries each run. | Nothing daily. If the badge goes stale: Health Auto Export app → Automations → Google Drive export → on and signed in. One-time on the Mac: `runnerctl pause r8-apple-health-snapshot`. | L2 n8n evaluated for the Notion→doc leg 2026-09-28, not chosen — last hop is a Claude-only write_db call; see routing row 10. |
| **Second Brain layers** (weekly sync, 2026-10-26) | `bin/brain layers` · `docs/reports/LAYERS.md` · `integrations/notebooklm/drive-manifest.json` | **Sync ran clean** — all 13 SB Google Docs rewritten (02-who-and-decisions via the chunked fallback, 0 pieces failed), Notion layer directory rewritten, LAYERS.md written. **even: no** — Command Deck DB stamp 2026-10-22 (4 d against a 1-d cadence) and Fieldy meetings digest stamp 2026-10-23 (3 d against a 1-d cadence) are stale; Jarvis unverified, vector index and knowledge graph spec only. | Check that the Mac tasks that stamp the Command Deck DB and the Fieldy daily digest are running (`always-on/README.md`); nothing to do for the Docs. | L1 |

## Everything else

| System | Path | Status today | What Steven must do | Trust |
|---|---|---|---|---|
| You.com | connector + `you-*` tools | **RETIRED 2026-09-22** — replaced by the Claude subscription. Free tier returned "limit exceeded" 08:40 UTC 2026-09-22. *Measured 2026-09-24:* the connector still answers, and its balance reads **0 credits** — connected but unfunded, so any paid search fails (NEEDS-STEVEN 56). | Nothing. Research now runs on Claude WebSearch/WebFetch on Steven's subscription (Perplexity removed 2026-10-05). | n/a |
| Notion | connector (connected + enabled) | Working. `brain-deck-sync` ok; Second Brain 71 rows (knowledgeFabric 2026-09-23). Will also host the Health Log. | Nothing. | L2 |
| **Google Drive** | **Update 2026-10-09:** reached read-only through the claude.ai Google Drive connector — the Second Brain folder holds 1 file, a 69-row Notion export synced 2026-09-22; catalogue in `references/google-drive.md`; Steven approved indexing it on 2026-10-09. *(2026-09-22 text follows; its "no Drive connector anywhere" is superseded by the claude.ai connector — the Mac itself still has no Drive MCP server, CLI or key file, and Composio's googledrive connection is still only initiated, with no account)* none on the Mac — no Drive MCP server, no CLI and no key file in the Mac stack | **NEVER ADDRESSED** (found by the V1 reconciliation, 2026-09-22). Steven asked for the second brain to be optimised "with Notion **+ Drive**". Notion was wired; Drive never was. Two tasks nevertheless *claim* to read a Drive "Second Brain" folder — `brain-learn-daily` and `openjarvis` — and the knowledge-fabric count for that store has read **0 files** every time it has been sampled. Composio carries googledocs, googlesheets and googletasks but **no googledrive**. So the deck counts a store nothing can reach. *Updated 2026-09-24 (R7):* a Composio `googledrive` connection is now **initiated**, awaiting Steven's sign-in (NEEDS-STEVEN 55) — still no account, so the 0-file count is still a store nothing reaches. | **Decide it: either wire it (spec in `integrations/google-drive-brain.md`) or drop the Drive store from the fabric counts.** Do not leave a 0-file store on the deck implying a working feed. | n/a |
| Composio | connected apps: api_ninjas, discord, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai (no longer used — Perplexity removed 2026-10-05), youtube, zoho, and **highlevel (GoHighLevel) and discordbot — initiated, no account, awaiting Steven's sign-in**; googledrive also initiated but no longer needed (Drive is reached through the claude.ai connector, 2026-10-09) (fresh links generated 2026-09-24 ~15:57 UTC; each expires in ten minutes — NEEDS-STEVEN 55). The `discord` entry is Steven's user OAuth, not the bot. The retired legacy-CRM connection was **removed 2026-09-24** (`routines/fub-removal-2026-09-24.md`). **No Lofty, ShowingTime, Showami or homes.com toolkit exists** — and Composio's tool search does not say so: asked for Lofty or ShowingTime it offered the retired CRM's tools, asked for homes.com a Zillow/Redfin scraper. Never accept a tool whose name is not the system you asked for. | Working as a transport. The failures above are on the far side of it, not in Composio. | Sign in to GoHighLevel via the Composio link, and say what it is for. | L1 |
| Google Calendar | connector | Working — `calendar-daily-sync` ok 2026-09-21. | Nothing. | L2 |
| Gmail | connector + Composio | Working — `r12-inbox-triage` ok; drafts only, never sends. | Nothing. | L2 |
| Strava | connector | Connected. The `stravaSnapshot` doc was repaired to `{v:…}` on 2026-09-22, but the Mac task `strava-daily-sync` (`20 5 * * *` PT = 12:20 UTC) still writes it **bare** and re-broke it at 12:32 UTC that day — it will keep overwriting the repair until its prompt is fixed on the Mac (P1, open). | Nothing — engineering fix. | L1 |
| Slack | connector | Connected. Not load-bearing for any task. | Nothing. | L1 |
| Inkbox | connector | Working — iMessage +1 650-484-9720; `vanessa-imessage-inbox` ok. **Discord `#vanessa` is not live**: `agentInbox` (its own stamp 2026-09-22 13:44 UTC) says "awaiting bot token" and has no channel id — corrected 2026-09-24, this row used to call it working. **Steven ↔ Vanessa only, never clients:** the identity is Inkbox's (`jasmine`), not Steven's, so nothing a client could take as coming from a licensed originator goes out on it (F-E8-62). | Discord bot token (Steven). The allow-list's unused second number is his to trim on the Mac. | L2 |
| Perplexity | Composio `perplexityai` + local `perplexity` MCP | **Removed 2026-10-05 (Steven) — research runs on Claude; the Composio perplexityai connection and the Mac's perplexity MCP are no longer used.** It had run out of credit: in the week to 2026-10-05 every Mac task that called it logged `Perplexity 401 insufficient_quota` and fell back to Claude WebSearch. | Paste the one 2026-10-05 Mac prompt, `integrations/mac-claude-only.md` — it pauses the Mac's Perplexity feed tasks, switches the runner's research to Claude only and removes the `perplexity` MCP server. | n/a |
| Context7 | connector | Connected. Docs lookup only. | Nothing. | L1 |
| Canva | connector | **Working** — *corrected 2026-09-24:* a read-only `list-brand-kits` call answered (one brand kit). The old `needs_reconnect` no longer holds. | Nothing. | n/a |
| Microsoft 365 | connector | **Not connected.** | Nothing unless he wants it. | n/a |
| BlackRock Advisor Center | connector | **Not connected.** | Nothing. | n/a |
| Health Data Avatar (HDA) | connector | **Not connected.** Not needed by the Notion health recipe. | Nothing. | n/a |
| PlayMCP | connector | **connect_incomplete.** | Finish or remove it. | n/a |
| Eromify | connector | Connected. Out of scope for the business stack. | Nothing. | n/a |
| OpenRouter | local MCP | Connected, **no API key** — council outside-model seats are unpriced and unused. Do not present them as available. | Add a key only if he wants outside models; otherwise leave it. | n/a |
| Plaid | — | **No keys.** `r7-plaid-balances` runs and reports nothing; the deck's balances are manual. | Add Plaid keys, or accept manual balances. | n/a |
| Orca v1.4.220 (Mac snapshot 2026-10-05; v1.4.203 on 09-16) | Stably AI desktop app (`com.stablyai.orca`) | **Reported installed on the Mac — unverified from the cloud** (no Mac here and no inventory artefact in this repo attests to it; confirm with Section 3 of `integrations/mac-fix-all-2026-10-05.md` — `./mac-verify.sh` has no Orca check — F-V2-23), and in any case a standalone computer-use app — **not integrated with Claude Code.** The stablyai/orca parallel-worktree IDE integration is not done. | Nothing — proposal, vetted by the CTO Innovator. | n/a |
| **browser-use** 0.13.11 (added 2026-10-07) | `integrations/browser-use/` — MCP server `browser-use` (`browser_exec`, `browser_screenshot`) pinned to a hidden, logged-out **agent Chrome** on `127.0.0.1:9333` (`agent-chrome.sh`) | **Proven in the cloud sandbox 2026-10-07** (CLI and MCP each opened and read a test page; telemetry off) · **not yet on the Mac** | `git pull && bash integrations/browser-use/install-mac.sh` — rules for agents (look, don't act; no client pages; no logins) in its README | L1, read-only |
| **OpenDesign** 0.23.1 (added 2026-10-08) | `integrations/open-design/` — local daemon + web app on 127.0.0.1, Claude Code as engine, built from source (no analytics) | **Proven in the cloud sandbox 2026-10-08** (daemon health ok, web 200, Claude Code detected) · **not yet on the Mac** | `git pull && bash integrations/open-design/install-mac.sh` | L1, drafts only |
| **API Anything** 0.1.0 (added 2026-10-08) | `integrations/api-anything/` — MCP server `api-anything` (`list_sites`, `list_operations`, `call_operation`, `login`); learned website operations called over plain HTTP | **Proven in the cloud sandbox 2026-10-08** (tier-1 call returned JSON; MCP tools listed) · **not yet on the Mac** | `git pull && bash integrations/api-anything/install-mac.sh` — read-only operations only; `login` only on Steven's yes | L1, read-only |
| `apple-health` MCP / `apple-health-xml` / `health-export` | local MCP servers | Connected as servers; the **data behind them is stale** because the ingest daemon is down. Connected server ≠ fresh data. | Covered by the Apple Health row above. | L1 |
| **WhatsApp → Vanessa** | OpenWA on the Mac (loopback only, Docker) + `integrations/openwa/vanessa-bridge.py` (LaunchAgent; polls the self-chat every 20 s with Vanessa's chat-fenced key; answers via `claude -p --agent vanessa-orchestrator`, read-only tools) — `integrations/openwa/README.md` Steps 1–8 | **Built and tested 2026-09-28 (18 tests against a stand-in OpenWA + Claude) · not yet run on a Mac.** Replaces the 2026-09-22 whatsapp-cli design (desktop-DB reads needed Full Disk Access; sends needed a GUI session) | Steven: `bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya` on the Mac — link the phone (QR or 8-character code), then the bridge installs itself · `docs/NEEDS-STEVEN.md` item 78 | L1 → L2 after 7 clean days |
| **OmniRoute failover** (`claude-auto`) | `integrations/omniroute-failover/` — `claude-auto.sh` launcher + `probe.sh`; OmniRoute 3.8.50 on loopback `:20128`, free-tier combo `auto/coding:free` | **Design written 2026-09-22.** The Mac already runs an older `claude-auto` with an unverified guard hook (F-E8-60) — this replaces it. Sandbox: `npm install omniroute` 3.8.50 exit 0, `--version` ok. Scripts **executed in the sandbox** (H3 2026-09-22, then re-run independently by H3b against the pre-fix copies restored from git, so every claim here has a before as well as an after) against a stub `claude`, a dead `:20128` and a live stand-in `/healthz`, not on the Mac. The PII gate now **fails closed**: while on free providers every invocation defers (exit 75) unless its `--task` name is on the free-OK allow-list or it carries an explicit `--no-pii`, in any argument order; client-data name patterns (`lofty-*`, `*crm*`, `*inbox*`, `health-*`, …), matched case-insensitively, win over both. F-V2-07/08/09/10/11/12/13/14/15/18 fixed, plus F-H3b-01 (a client task renamed in different case evaded the deny-list); the switch-back probe escalates to `state/NEEDS-STEVEN` after four inconclusive runs instead of stranding. One residual is recorded and deliberately unfixed (F-H3b-02): a task that fails *and* whose own output mentions a usage limit still flips the route to free-fallback — it cannot leak, since the gate is closed on that route, and the probe restores the subscription within 15 minutes. | **Put `OMNIROUTE_API_KEY` in `~/.config/omniroute/.env` (chmod 600), add free provider keys with `omniroute providers add … --credential-env`, copy the two scripts to `~/.local/bin`, load the probe LaunchAgent, run the PII canary with the security steward.** | L1 |
| **Laya** (local decision-model router/gate, R9 2026-09-27) | `integrations/laya/laya_route.py` (Python SDK, `from laya import Router`) + optional MCP extra `laya[mcp]` (`laya-mcp-server` = `laya.mcp.server:main`) | **Proposed, not installed on the Mac.** Package 0.3.21 installed and imported in the R11 sandbox (2026-09-28); routing logic proven on the offline stub only (`integrations/laya/README.md`). | **If he wants it:** `python3 -m pip install "laya[mcp]"` on the Mac, and leave `BRAIN_ROUTER` unset — measured 2026-09-28: +4.4% tokens, no accuracy gain. Read `integrations/laya/README.md` first — it is a probabilistic BOOST to `brain/`'s deterministic scoring, never a sole decision-maker, and it never overrides a HALT item (client text never leaves the Mac either way — it's a local model). | n/a — zero-LLM-token router, not an agent seat |
| **77skills.ai** (skill-pack import, R9 2026-09-27) | `integrations/skill-packs/import_pack.py` (stdlib, dry-run by default, `--apply` stages to `.claude/skills-staged/`, never live) | **Not purchased.** Importer built and self-tested against a temporary 3-skill fake pack (1 clean, 1 flagged for a `curl\|bash`-piped `install.sh` with an `rm -rf`, 1 flagged for a name collision with the live `git-workflow-and-versioning` skill) — dry run correctly found 1 clean / 2 blocked and copied nothing; the fake pack and its test report were deleted, never committed. | **If he buys the $77 pack:** drop the ZIP anywhere, run the importer dry-run, read the report, `--apply` to stage the clean skills only. Promoting a staged skill to a live one still needs ECC (Elena) review, one at a time — see the token-cost math in `integrations/skill-packs/README.md` for why not all 77 belong live. | n/a |
| **Orca Computer Use v1.4.203** — restated, R9 2026-09-27 | Stably AI desktop app (`com.stablyai.orca`) — same system as the row above | Restates, not a new measurement: still a standalone computer-use app, **not integrated with Claude Code**; the `stablyai/orca` parallel-worktree IDE integration is **not installed**. No new inventory artefact was produced this round — the row above's "unverified from the cloud, confirm with `./mac-verify.sh`" caveat still applies. | Nothing — proposal, vetted by the CTO Innovator (unchanged from the row above). | n/a |
| **Google Drive — claude.ai connector (cloud sessions)**, found R9 2026-09-27 | `mcp__Google_Drive__*` tools (search, read, list, download, get metadata/permissions, share, copy, trash, update, create) | **Connected and usable for read/search from this and other cloud sessions** — a third, different Drive path from the two the Google Drive row above already tracks (no CLI/key file/MCP server on the Mac itself; a separate Composio `googledrive` connection still awaiting Steven's sign-in). None of the three has been reconciled into one story yet. | **Decide which Drive path is canonical** for which job (this connector for cloud-session work, Composio for Mac-driven tasks, or both) and fold that decision into the Google Drive row above — a third partial path should not sit next to the other two indefinitely. | n/a |

## CLI-Anything: the sites and feeds with no Composio toolkit and no API (R6, 2026-09-24)

Steven's words, verbatim: *"Use Anything CLI tool installed to assist in connecting the sites and
feeds that aren't in Composio or have an API."* The row above covers homes.com, ShowingTime, Showami,
SkySlope and zipForms — all five already had a CLI-Anything package before this round. What follows
is the honest map of what was **still** hand-carried, frozen, or degraded, and what this round did
about each. **Composio's tool search does not say "none" for any of these — it offers a near miss and
lets you mistake it for a real toolkit** (the existing row above already documents this trap for
homes.com/Lofty/ShowingTime; nothing below found a different result).

| Feed | Today's path | Best automated path | Status, with dates |
|---|---|---|---|
| **Local market snapshot** (San Diego County, Temecula, Murrieta — median price, DOM, YoY, months of supply) | Hand-typed prose block (`MARKET_UPDATES`/`BUILDER_INCENTIVES`-style seed) last refreshed by a Claude research session 2026-09-22; `r5-rates-market-refresh`, the task meant to keep it live, **has never run**. | **New read-only recipe** — `cli-anything-publicfeeds` recipes `temecula-market`, `murrieta-market`, `san-diego-county-market` (Redfin `/city/<id>/…/housing-market` pages; San Diego rides a dated monthly blog post instead of a stable page). A public no-key alternative may exist — Redfin's Data Center (`redfin.com/news/data-center`) publishes bulk CSV/TSV downloads with no key — but those are metro-wide historical files needing local filtering, not a per-city live number, and redfin.com is egress-blocked from this session so neither path has been reached. Recorded as the better long-term answer, not built this round. | **Recipes built, `verified: false`, disabled-by-policy** pending the `marketpages` terms-of-service review (see below). No live call ever made. |
| **Lender-advertised rates** (Veterans United VA 30-yr refinance; Navy Federal VA 15-yr fixed, Jumbo 15-yr fixed — the 3 rows the daily FRED/Optimal Blue feed does not carry) | Hand re-verified inside a Claude session, most recently 2026-09-22 13:30 UTC (`MORTGAGE_RATES_SYNCED_AT`), by reading search-indexed copies of the lender pages because the lender sites are blocked by this session's egress proxy. | **New read-only recipe** — `cli-anything-publicfeeds` recipes `veterans-united-va-rates` (`veteransunited.com/va-loans/va-mortgage-rates/`), `navy-federal-rates` (`navyfederal.org/loans-cards/mortgage/mortgage-rates.html`). No public no-key endpoint exists for a specific lender's own advertised rate — FRED/Optimal Blue (already used by `mortgage-rates-daily`) covers the *national average*, not what one lender is currently advertising, which is the whole reason these 3 rows are hand-carried in the first place. | **Recipes built, `verified: false`, disabled-by-policy** pending the `lenderrates` terms-of-service review. No live call ever made. |
| **Builder incentive pages** (D.R. Horton, Lennar, Richmond American community/promo pages) | `feeds-weekly` is supposed to write `builderIncentiveLiveList` daily; **status "limited" since 2026-09-17** — the recent fills came from ad hoc Claude research sessions (WebSearch/Perplexity against search-indexed copies; Perplexity removed 2026-10-05), not a real per-community pull, because newhomesource.com and every builder site named are blocked by this session's egress proxy. The separate hand-typed `BUILDER_INCENTIVES` prose block (2026-09-22) explicitly says it "does not refresh." | **New read-only recipe** — `cli-anything-publicfeeds` recipes `drhorton-menifee-spring-creek`, `lennar-san-diego-promo` (seasonal URL — rotates with each campaign), `richmond-american-sommers-bend` (URL is a guess; the real community page has never been found). No no-key endpoint exists for builder-specific incentive terms. **Known tooling overlap, not resolved by this round:** `MAC-INSTALL-tooling.md`/`MAC-INSTALL-comms-data.md` §3 already scoped **Scrapling + Scrapegraph-ai** for "a builder's current-incentives page" under the `incentives-daily-scan` lane — but that lane actually writes `incentivePrograms` (down-payment-assistance/utility/tax/veteran programs), a *different* document from `builderIncentiveLiveList`, so in practice neither tool has ever pulled a builder page on a schedule. **Needs-Steven: pick one tool as the standard for builder pages** (this package's `publicfeeds` recipes, or Scrapling/Scrapegraph-ai) rather than clearing a terms-of-service review for both against the same three sites. | **Recipes built, `verified: false`, disabled-by-policy** pending the `builderpages` terms-of-service review. No live call ever made. |
| **VA disability compensation rates** (VA.gov's published rate tables) | Reference material, verified by hand 2026-09-07; no runner task or LaunchAgent in the current schedule refreshes it, and the cloud routine that previously did is not confirmed active. | Not investigated this round — out of this round's named candidates (builder/lender/market pages). VA.gov is a government publication (materially different ToS posture than a commercial site), which makes it a reasonably low-risk **future** `cli-anything-publicfeeds` recipe or a no-key endpoint if `developer.va.gov` turns out to publish one; neither confirmed. | **Not automated. Flagged as a candidate for a follow-on round, not built here** — say so rather than silently leaving it off this map. |
| Weather, News, Econoday calendar, On This Day/Birthdays, Bears tracker, Top performers, Elite rewards scan, PE & Defense, Elite Affluent tracker, Opportunity Radar, Marketing | `openrouter-feeds-refresh`/`feeds-weekly` (status: error or limited since 2026-09-17 on several — see `FRESH_FEEDERS` in the deck source) | **Out of scope for CLI-Anything by design, not by oversight.** These are open-ended research queries against whichever page has today's answer, not one fixed page with a stable structure to scrape — Claude WebSearch/WebFetch (the automated path since You.com retired; Perplexity removed 2026-10-05 — the Claude cloud feed writers in `routines/feed-writers-2026-09-28/README.md` and `routines/feed-writers-2026-10-05/` run on it) is the right tool for that shape of problem, and a CLI-Anything recipe would need to pick one page per feed and would be *more* brittle, not less. | Already has a working (if sometimes degraded) automated path; not re-litigated here. |

### The three terms-of-service questions this round could not answer

Every `publicfeeds` recipe is disabled-by-policy until Alexandra drafts and Steven signs off the
matching question below (same HALT-list item CLAUDE.md already states: *"Any legal or compliance
interpretation. Scraping terms and robots.txt are Alexandra's to draft and Steven's to decide."*). The
mechanism (`CLI_ANYTHING_TOS_REVIEWED_<GROUP>`, exit 3 until it holds a real date) is code, not a
policy; the answer is not.

| Group | Env var | Question |
|---|---|---|
| `marketpages` | `CLI_ANYTHING_TOS_REVIEWED_MARKETPAGES` | Does Redfin's Terms of Use permit read-only, low-frequency, non-cached automated access to `/city/` and `/county/` housing-market pages for a single licensed agent's own reference, and does redfin.com's robots.txt allow those paths for a generic user agent? |
| `lenderrates` | `CLI_ANYTHING_TOS_REVIEWED_LENDERRATES` | Do Veterans United's and Navy Federal's website terms permit automated, read-only retrieval of their publicly posted rate tables (no account, no quote submitted), and does each robots.txt allow the rate-page path? |
| `builderpages` | `CLI_ANYTHING_TOS_REVIEWED_BUILDERPAGES` | Do D.R. Horton's, Lennar's and Richmond American's website terms permit automated, read-only retrieval of their public community/promo pages, and does each robots.txt allow the specific paths read? Decide alongside the Scrapling/Scrapegraph-ai overlap noted above. |

Full detail, including the exact recipes, field maps and what stays deliberately unbuilt (any write
verb): `integrations/cli-anything-harnesses/publicfeeds/PUBLICFEEDS.md`. The guided one-command path
through install, posture, `--discover` and "what's still pending" for all nine harnesses (not just
`publicfeeds`): `integrations/cli-anything-harnesses/connect.sh`. The Mac task that turns a verified,
gate-open recipe's output into `ratesSnapshot`/`liveFeeds`: `integrations/mac-task-specs.md` §7,
`cli-anything-feeds`.

## Standing rules for every row here
0. **REPL command history is client data.** Every harness REPL writes plaintext commands to
   `~/.cli-anything-<target>/history` — eight paths: `browser homes showingtime showami skyslope
   zipforms lofty zoho`. Browser commands carry URLs, and those URLs carry MLS numbers, listing
   addresses and portal paths. Left alone they are created **0755/0644**;
   `browser/runtime/posture.sh install` makes them 0700/0600. They belong inside disk encryption and
   the sensitive backup tier, and **never** in the repo, the vector index or the knowledge graph.
1. **Self-test before you sync.** Each sync skill proves its connection on its own smallest call
   before writing anything. A failed self-test writes an honest status doc and stops.
2. **Never fabricate CRM or health data.** No lead, stage, deal, dollar or vital that did not come
   from a 200 response this run. An empty result is a fact worth reporting.
3. **The page displays the doc's own `source` string.** No hard-coded CRM name anywhere in the deck.
4. **Deck-only records survive every sync.** A lead carrying `local:true` that the CRM does not
   return is carried forward untouched.
5. **Credentials live in the Mac keychain or a `.env` the tool reads itself** — never in a prompt,
   a task definition, a skill file, a log, a finding or the deck. **One location per secret, and the
   file is named after the tool that reads it** (`~/.config/<tool>/.env`, which is what
   `MAC-SETUP.sh`'s `ensure_env_file` creates). Decided 2026-09-22: the five browser-harness logins
   — homes.com, ShowingTime, **Showami**, SkySlope, zipForms — live in the keychain under
   `cli-anything.<target>`, or in **`~/.config/cli-anything/.env`**. The `~/.config/showing-sync/.env`
   path named on the deck's `SH_INTEGRATIONS` row is **superseded**: nothing creates it and nothing
   reads it, the credential is a CLI-Anything harness login rather than anything `showing-sync`
   signs in with, and `MAC-SETUP.sh` and `mac-verify.sh` both already create and check the
   `cli-anything` file. Two locations for one secret is how a secret ends up in the wrong one
   (F-S1-17).
6. **Read-only until Steven approves a write verb, per system, in writing.** Write-back to Lofty and
   Zoho is an L2 proposal, not built.
7. **Trust graduation is earned:** L1 → L2 → L3 only after 7 consecutive correct runs. Never
   straight to L3.

## Related files
- `.claude/skills/lofty-crm-sync/SKILL.md` · `.claude/skills/zoho-crm-sync/SKILL.md`
- `.claude/skills/apple-health-notion/SKILL.md` · `.claude/skills/cli-anything-connectors/SKILL.md`
- `integrations/apple-health-dashboard.md` · `integrations/mac-task-specs.md`
- `integrations/cli-anything-harnesses/publicfeeds/PUBLICFEEDS.md` · `integrations/cli-anything-harnesses/connect.sh` (R6, 2026-09-24)

## CLI-Anything vs. Composio vs. n8n vs. Pabbly — ten-system routing, R9 (2026-09-28)

## C2-fabric routing table — ten systems, one path each

**Written 2026-09-27, lane C2-fabric, round R9.** Read-only research only: vendor documentation and
public reference sites. No credential was requested, received or stored. Every vendor domain below
(zoho.com, api.lofty.com, showami.com, showingtime.com, homes.com/press.homes.com, crmls.org,
apidocs.lwolf.com, skyslope.com, dotloop.com/dotloop.github.io) returned `EGRESS_BLOCKED` or DNS
failure on a direct fetch from this sandbox — the same restriction earlier rounds hit on
redfin.com/veteransunited.com/navyfederal.org/lennar.com. Every URL below was therefore read as a
**WebSearch-returned excerpt that names and quotes that page**, not a direct fetch; each row says so.
Zero Perplexity calls used (budget left for the other two lanes). No CRMLS terms interpretation is
made here — that is lane C3's HALT row (Alexandra drafts, Steven decides); this table only records
what the API surface is.

**Row 10 (Apple Health) added 2026-09-28**, per Steven's verbatim direction that round naming it
alongside the original nine. It is not vendor research — Apple Health has no vendor API surface this
repo calls (see row 10) — it is a one-owner-per-data-flow decision about the pipeline
`.claude/skills/apple-health-notion/SKILL.md` and `integrations/CONNECTIONS.md` already document, so
it draws on those two files rather than a new WebSearch or Perplexity call.

### Headline finding

**Zero of the ten systems get n8n as their chosen path.** Zoho already has one owner in this
ecosystem (Composio — active connection, blocked only by a profile permission, not by API absence).
The other seven vendor systems either already have a CLI-Anything harness built and gated (Lofty,
Showami, ShowingTime, homes.com, SkySlope, zipForms) or are getting one this round from lane C3
(dotloop), or have no automated path pending Steven's own licensing decision (CRMLS). Apple Health
(row 10) is not a vendor at all — its existing owner is the `health-notion-sync` Mac task, for reasons
row 10 gives. Adding n8n or Pabbly beside any of these would be a second path to the same data, which
brief §0 names Zoho itself as the example to avoid. n8n's real job this round is the two bridge
categories the brief asks for regardless of this table's outcome — the OpenWA→Vanessa relay and
scheduled CLI-Anything harness runs — built in `integrations/n8n/` (see its README), not a new
connector for any row below.

---

### 1. Zoho CRM

| | |
|---|---|
| Public API | **Yes.** Zoho CRM REST API (v8), OAuth2. Evidence: n8n's own node documentation names and links it — [Zoho CRM \| Nodes \| n8n Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zohocrm) (read via WebSearch excerpt; `zoho.com` itself is `EGRESS_BLOCKED` from this sandbox). Already corroborated inside this repo: the `zoho` Composio toolkit and `integrations/cli-anything-harnesses/zoho/` both call this same API today. |
| Pabbly built-in app | **Yes.** "Zoho CRM Integrations FREE — Connect with 1000+ Apps" at pabbly.com/connect/integrations/zoho-crm/: 8 triggers (incl. webhook-based Create/Update/Delete Module Entry) and 55 actions; also listed as "Pabbly Connect for Zoho CRM" on Zoho's own marketplace. |
| n8n node | **Yes.** `n8n-nodes-base.zohoCrm` — https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zohocrm |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/zoho/` (REST harness, `tools/mint-access-token.sh`) — already built. |
| **Chosen path** | **Composio `zoho` toolkit — unchanged.** It is the ecosystem's existing one owner (`zoho-crm-sync` skill, `zohoSync`/`zohoLeads`/`zohoDeals` docs, connection **ACTIVE**). Building the n8n node or a Pabbly workflow here is exactly the "Zoho through Composio, n8n *and* Pabbly" drift brief §0 warns against. |
| **Steven's one step** | Unchanged from `integrations/CONNECTIONS.md`: in Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → Developer Permissions, enable **"Zoho CRM API Access"**, then re-authorize the Composio connection once. Not duplicated as a new NEEDS-STEVEN row — it is already open. |

### 2. Lofty (real-estate CRM)

| | |
|---|---|
| Public API | **Yes.** Lofty Developer API, REST, 94 endpoints, OAuth2 or API key. Evidence: [Lofty Developer API](https://api.lofty.com/) and [Lofty API — OAuth 2.0](https://help.lofty.com/hc/en-us/articles/4405826620571-Lofty-API-OAuth-2-0) (read via WebSearch excerpt; `api.lofty.com` is `EGRESS_BLOCKED` from this sandbox). |
| Pabbly built-in app | **Yes.** "Lofty Integrations FREE — Connect with 1000+ Apps" at pabbly.com/connect/integrations/lofty/. |
| n8n node | **No** dedicated node found in n8n's published integrations list or community forum — a generic HTTP Request node + credential would be needed if this were chosen. |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/lofty/` (REST harness) — already built and already the ecosystem's chosen path (`lofty-bridge` MCP + `lofty-cli`, `lofty-crm-sync` skill, L1→L2 trust track). |
| **Chosen path** | **CLI-Anything (`lofty-bridge`/`lofty-cli`) — unchanged.** Same one-owner reasoning as Zoho: it already has a working, tested-shape path; Pabbly's built-in app is a genuine alternative but adopting it now would run two paths into `loftyLeads`. |
| **Steven's one step** | Unchanged from `integrations/CONNECTIONS.md`: generate an API key in Lofty → Settings → Integrations → API, put it in `~/.config/lofty/.env` as `LOFTY_API_KEY=…`, run `lofty-crm-sync` once. |

### 3. Showami

| | |
|---|---|
| Public API | **Partial, not self-serve.** Showami has "moved out of Beta" on APIs for agent-roster sync, feedback requests and rental requests, but it is described as a **CRM/back-office integration** ("connects a CRM or back office system to Showami via API") — no public developer portal or self-serve credential flow was found. Evidence: [Automated Showings — Showami](https://blog.showami.com/automate-showings/) (via WebSearch excerpt; `showami.com` is `EGRESS_BLOCKED` here). |
| Pabbly built-in app | **No evidence found** (searched pabbly.com). |
| n8n node | **No evidence found.** |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/showami/` (browser/DOMShell harness) — already built, `verified: false`, never called live. |
| **Chosen path** | **CLI-Anything (browser/DOMShell, existing).** The only documented API is a partner/back-office integration Steven is not enrolled in; his own logged-in browser session, automated read-only, is the practical path already built. |
| **Steven's one step** | Install the DOMShell Chrome extension and sign in by hand, then run `integrations/cli-anything-harnesses/connect.sh` for the guided posture check — unchanged from the existing CLI-Anything row. If he later wants the roster/feedback API, that means contacting Showami as a connected back-office vendor — a business step, out of scope this round. |

### 4. ShowingTime

| | |
|---|---|
| Public API | **No self-serve public API for an individual agent's own showings/feedback.** ShowingTime+'s "Bridge" product is a RESO-certified **MLS data-distribution** feed (built for MLSs, not individual agents); a ShowingTime Postman workspace exists but no public endpoint reference page was reachable. Evidence: [MLS Listing Data Feeds RESO Web API \| ShowingTime+](https://showingtime.com/solutions/data-distribution) and the [ShowingTime Postman workspace listing](https://www.postman.com/showingtime) (via WebSearch excerpt; `showingtime.com` is `EGRESS_BLOCKED` here). |
| Pabbly built-in app | **No evidence found.** |
| n8n node | **No evidence found.** |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/showingtime/` (browser/DOMShell harness) — already built. |
| **Chosen path** | **CLI-Anything (browser/DOMShell, existing).** Same reasoning as Showami — the only real API on offer is an MLS-side feed, not something an individual agent account can call. |
| **Steven's one step** | Same DOMShell sign-in + `connect.sh` posture check as the row above. |

### 5. homes.com

| | |
|---|---|
| Public API | **No public self-serve developer API.** CoStar/Homes.com runs "Homes.com Connect," a partner API through which **CRM vendors** receive lead/contact data — confirmed as not a published, documented, self-serve program for an individual agent (no OpenAPI/OData/webhooks/SDK/Postman collection/auth scheme found). Evidence: [Homes.com Launches API to Streamline Real Estate Communication](https://press.homes.com/homes-com-launches-api-to-streamline-real-estate-communication/) (via WebSearch excerpt; `homes.com`/`press.homes.com` are `EGRESS_BLOCKED` here). |
| Pabbly built-in app | **No evidence found.** |
| n8n node | **No evidence found.** |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/homes/` (browser/DOMShell harness) — already built. |
| **Chosen path** | **CLI-Anything (browser/DOMShell, existing).** The real API is a CRM-partner feed Steven's own account cannot call directly. |
| **Steven's one step** | Same DOMShell sign-in + `connect.sh` posture check. |

### 6. CRMLS

| | |
|---|---|
| Public API | **Yes, but a licensed contractual MLS feed, not a public/self-serve API.** CRMLS promotes the RESO Web API as its main IDX/data feed; access requires a **data-licensing agreement**, typically at the Broker Participant level (agents subscribe under a broker), with CRMLS issuing the Web API URL/client id/secret directly (`licensing@crmls.org` to start, `api@crmls.org` for the API account). Evidence: [IDX Resources – CRMLS](https://go.crmls.org/idx-resources/) and [CRMLS Development Docs — Start](https://devdocs.crmls.org/start/) (via WebSearch excerpt; `crmls.org` is `EGRESS_BLOCKED` here). |
| Pabbly built-in app | Not checked further — moot given the row below. |
| n8n node | **No evidence found**; n8n has no MLS/RESO-specific node. |
| CLI-Anything harness | **No, and none should be built.** Per lane C3's mandate this round, a scraper is not an approved substitute for a licensed MLS feed until the terms question is answered. |
| **Chosen path** | **None today — halt.** This mirrors lane C3's halt row; this lane does not re-interpret CRMLS's terms (that is Alexandra's draft, Steven's decision, per the HALT list). |
| **Steven's one step** | Decide, with Alexandra's draft, whether to pursue the licensed RESO Web API path; if yes, apply as the Broker Participant via `licensing@crmls.org` / `api@crmls.org`. See C3's halt row for the compliance text itself — not duplicated here. |

### 7. zipForms (Lone Wolf Transactions — zipForm Edition)

| | |
|---|---|
| Public API | **Yes, but licensed/partner-gated.** A documented REST API exists (Shared Key + Context Id/External Id auth) but is, in the vendor's own words, "made available on a licensed basis to third-party **application partners**" — not self-serve for an individual broker. Evidence: [ZipForm API documentation](https://apidocs.lwolf.com/doc/zipform-api) (via WebSearch excerpt; `apidocs.lwolf.com` is `EGRESS_BLOCKED` here). |
| Pabbly built-in app | **No evidence found.** |
| n8n node | **No evidence found.** |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/zipforms/` (browser/DOMShell harness) — already built, gated behind `CLI_ANYTHING_ECC_REVIEWED_AT` (exits 3 until a real sign-off date is set). |
| **Chosen path** | **CLI-Anything (browser/DOMShell, existing).** Lone Wolf's real API needs a partner agreement Steven does not hold; the existing, already-gated harness is the practical path. |
| **Steven's one step** | Complete the ECC review already gating this harness (set `CLI_ANYTHING_ECC_REVIEWED_AT` to a real sign-off date) — unchanged, no new gate added. Pursuing Lone Wolf's partner API is a separate business step, out of scope this round. |

### 8. SkySlope

| | |
|---|---|
| Public API | **Yes, but partner-gated.** A Partnership/Forms API (OAuth2 + PKCE) and an Offers API (OAuth2 client-credentials) exist with public reference docs, but "obtaining OAuth client credentials is partner/brokerage-gated" through an Order Form; some endpoints are marked partner-only in the published reference. Evidence: [SkySlope Partnership API Reference](https://forms.skyslope.com/partner/api/docs) and [API License Terms of Use](https://skyslope.com/api-license-terms-of-use/) (via WebSearch excerpt; `skyslope.com` is `EGRESS_BLOCKED` here). |
| Pabbly built-in app | **No evidence found.** |
| n8n node | **No evidence found.** |
| CLI-Anything harness | **Yes.** `integrations/cli-anything-harnesses/skyslope/` (browser/DOMShell harness) — already built, same `CLI_ANYTHING_ECC_REVIEWED_AT` gate as zipForms. |
| **Chosen path** | **CLI-Anything (browser/DOMShell, existing).** Same reasoning as zipForms. |
| **Steven's one step** | Same ECC review sign-off as zipForms. |

### 9. dotloop

| | |
|---|---|
| Public API | **Yes — genuinely self-serve, the cleanest of the nine.** Public API v2, OAuth2 (3-legged/authorization-code), base `https://api-gateway.dotloop.com/public/v2`; register at `info.dotloop.com/developers` for a client id/secret; 100 requests/min per client per user. Evidence: [Dotloop Platform — Developer Guide, Public API v2](https://dotloop.github.io/public-api/) (via WebSearch excerpt; `dotloop.github.io`/`dotloop.com` did not resolve/were blocked from this sandbox). |
| Pabbly built-in app | **No evidence found** (searched pabbly.com directly; dotloop's own integration list names Zapier, not Pabbly). |
| n8n node | **No — confirmed absent.** An open n8n community feature request, ["Dotloop Node"](https://community.n8n.io/t/dotloop-node/296278), asks for one; it does not exist yet. |
| CLI-Anything harness | **Not yet in this repo as of this read** — `integrations/cli-anything-harnesses/` holds `browser, homes, lofty, publicfeeds, showami, showingtime, skyslope, zipforms, zoho` only. Lane C3 is building a new read-only dotloop harness this round per the brief. |
| **Chosen path** | **CLI-Anything — a new REST+OAuth harness (lane C3), in the same structure as the others.** dotloop is the one system here with a clean, documented, individually-provisionable OAuth API, so a real REST harness (not browser automation) is the right structure — and keeping it inside CLI-Anything, not n8n or Pabbly, keeps one owner even though neither of those tools already claims it. |
| **Steven's one step** | Register an app at `info.dotloop.com/developers`, complete the OAuth authorize/token consent once, and store the resulting client id/secret/refresh token the way the new harness's own `.env` names them (same `~/.config/cli-anything/.env`-or-keychain convention as the other five browser harnesses, per `CONNECTIONS.md` standing rule 5). |

### 10. Apple Health

Not a vendor-API row like 1–9 — Steven named it in the same 2026-09-28 list, so it gets the same
treatment: does it have a public API, is there a Pabbly/n8n path, what already exists, one chosen
owner, one Steven step. The path is already built and documented in
`.claude/skills/apple-health-notion/SKILL.md` and `integrations/CONNECTIONS.md` (row "Apple Health",
read 2026-09-28); this row's job is to decide whether n8n should take over the Notion→document leg,
per this round's brief, and record why not.

| | |
|---|---|
| Public API | **Not applicable in the vendor sense.** Apple Health data reaches this ecosystem through the Claude iOS app's own built-in Health-read permission (Apple's on-device HealthKit, granted phone-side) — there is no vendor REST/OAuth endpoint this repo's automations call. Evidence: `.claude/skills/apple-health-notion/SKILL.md` §Inputs (this repo, read directly — not egress-blocked, so no WebSearch/Perplexity needed for this row). |
| Pabbly built-in app | **N/A.** Nothing here is a third-party SaaS account Pabbly could hold OAuth for; the one real network leg (Notion) already has an owner (below), and Notion itself is a connector, not a system in this table. |
| n8n node | **Exists but not chosen.** n8n ships a first-party Notion node that could poll the "Health Log" database (id `bc71c45aac934a4f8aeddc54345136ef`) on a schedule — technically buildable. There is no n8n node or webhook for the read leg: that step happens entirely inside the Claude iOS app's own HealthKit permission, off any network n8n can reach. |
| CLI-Anything harness | **No, and none should be built.** CLI-Anything drives logged-in browser sessions for vendors with no API; Apple Health's only data source is the phone's own HealthKit permission, which a Mac-side DOMShell harness cannot reach. |
| **Chosen path** | **Unchanged — one owner, the existing Mac task, both legs.** Claude iOS → Notion "Health Log" (Stage A, phone) → the `health-notion-sync` Mac task (Stage B) → the `appleHealth` Command Deck doc. n8n does **not** take the Notion→document leg, for two independent reasons, either sufficient alone: **(1) the last hop is unreachable to n8n.** Stage B ends in a Command Deck `write_db` **set** call on doc `appleHealth` — an Anthropic-side Claude Code artifact-store write, not a REST endpoint; n8n's HTTP/Execute-Command/Notion nodes have no credential or API surface that reaches it. This is the identical boundary `integrations/n8n/workflows/cli-anything-scheduled-feeds.json`'s own header note draws this same round for the CLI-Anything feeds ("turning that output into the dashboard's docs is `read_db`/`write_db` work... not something an n8n... node can reach"). **(2) the merge logic is already built, tested and non-trivial**, and moving even half of it (an n8n node that polls Notion and hands off) would still make Notion a two-reader table for no gain. SKILL.md's Stage B keeps every pre-existing `daily` day / `sleep` night / `workout` id that Notion's own last-90-days read doesn't supply, preserves 5 daemon-only metric keys plus `records`/`sources`, compares `latest_at` as parsed timestamps rather than strings, and enforces the `{v:…}` wrapper the store requires — reimplementing any of that in an n8n Code node would be a second, drifting copy of logic that already exists once, exactly the "Zoho through Composio, n8n *and* Pabbly" duplication brief §0 warns against. One owner covers both legs today; n8n adds a path, not a capability. |
| **Steven's one step** | Already documented, unchanged, and not a new NEEDS-STEVEN item: on the iPhone, open Claude, say "Update my health stats in Notion," and approve the Apple Health read + Notion write prompts once (`.claude/skills/apple-health-notion/SKILL.md`, "The block Steven reads once"). The Mac task then runs on its own twice-daily schedule. |

---

### Summary table

| # | System | Public API | Pabbly built-in | n8n node | CLI-Anything harness exists | Chosen path | Steven's one step (short) |
|---|---|---|---|---|---|---|---|
| 1 | Zoho CRM | Yes (OAuth2 REST v8) | Yes | Yes | Yes (REST) | **Composio `zoho`** (unchanged) | Enable Zoho CRM API Access on the profile |
| 2 | Lofty | Yes (REST, OAuth2/key) | Yes | No | Yes (REST) | **CLI-Anything `lofty`** (unchanged) | Generate Lofty API key → `~/.config/lofty/.env` |
| 3 | Showami | Partial, partner-only | No evidence | No evidence | Yes (browser) | **CLI-Anything `showami`** (unchanged) | DOMShell sign-in + `connect.sh` |
| 4 | ShowingTime | No (MLS-side feed only) | No evidence | No evidence | Yes (browser) | **CLI-Anything `showingtime`** (unchanged) | DOMShell sign-in + `connect.sh` |
| 5 | homes.com | No (CRM-partner feed only) | No evidence | No evidence | Yes (browser) | **CLI-Anything `homes`** (unchanged) | DOMShell sign-in + `connect.sh` |
| 6 | CRMLS | Yes, licensed MLS feed only | n/a | No evidence | **No — none built** | **Halt** (C3's row) | Decide RESO Web API application w/ Alexandra |
| 7 | zipForms | Yes, partner-licensed only | No evidence | No evidence | Yes (browser) | **CLI-Anything `zipforms`** (unchanged) | ECC review sign-off |
| 8 | SkySlope | Yes, partner-gated | No evidence | No evidence | Yes (browser) | **CLI-Anything `skyslope`** (unchanged) | ECC review sign-off |
| 9 | dotloop | Yes, self-serve OAuth2 | No evidence | No (confirmed absent) | Not yet — C3 building it | **CLI-Anything `dotloop`** (new, C3) | Register OAuth app at dotloop, consent once |
| 10 | Apple Health | N/A — phone HealthKit permission, not a vendor API | N/A | Exists (Notion node) but not chosen — last hop is a Claude-only `write_db` call | No (phone-only source) | **Mac task `health-notion-sync`** (unchanged, both legs) | Say "Update my health stats in Notion" on iPhone once |

**For the integrator:** this table is written to be merged into `integrations/CONNECTIONS.md` as a new
section ("CLI-Anything vs. Composio vs. n8n vs. Pabbly — the ten-system routing decision, R9"); none
of its "Steven's one step" rows are new NEEDS-STEVEN items beyond what `CONNECTIONS.md` and lane C3's
handback already carry, except CRMLS and dotloop, which lane C3's own handback should carry (this
lane only records the API-surface facts feeding those two decisions). Row 10 (Apple Health) is also
not a new NEEDS-STEVEN item — its one step is the same phone step `CONNECTIONS.md`'s existing "Apple
Health" row and the `apple-health-notion` skill already carry; this row only adds the n8n-ownership
decision the brief asked for.

**Gondola (gondola.ai), 2026-10-19.** Asked to feed Travel and Rewards from it. It is a hotel-booking cash-back service (books direct with the hotel; its own site says it averages about 16% back across hotel points, card points and 3–7% Gondola Cash; promotional, unverified). No public feed or API was found, and the site is unreachable from the cloud (no egress). Nothing was wired; a card that shows its numbers would need Steven's own Gondola account or an export he pastes. Source: https://www.gondola.ai/what-is-gondola.

## Connection status — checked live 2026-10-20 (Steven: "what is not connected and fix those connections")

Checked from the cloud session: claude.ai connectors (`ListConnectors`), Composio (`list` on ten toolkits), the deck's
`runnerStatus` and `whatsappKapso`. One paste for everything a script may do: `connect-all.sh` on this branch.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| **Mac runner** (every Mac task) | **silent since 2026-10-13 07:13 UTC** | `connect-all.sh` step 2: `runnerctl status` / `restart`; a logged-out runner needs `runnerctl login` by Steven | paste + Steven |
| **Inkbox** (Vanessa's iMessage, cloud) | `needs_reconnect` on claude.ai | Settings → Connectors → Inkbox → Reconnect | Steven |
| Inkbox voice SDK (Mac) | installed by `MAC-SETUP.sh --only inkbox-voice` | `connect-all.sh` step 5, then `voice-setup.sh <conversation id>` | paste + Steven |
| **Kapso WhatsApp** | number (202) 474-5223 assigned 2026-10-14; plugin, MCP and both Keychain keys pending | `connect-all.sh` steps 3–4 (brought onto this branch today from `claude/gracious-newton-4hpfco`); sign-in `claude` → `/mcp` → kapso | paste + Steven |
| Zoho CRM (Composio) | account **active**; API calls 403 | tick "Zoho CRM API Access" on the Zoho profile | Steven |
| Lofty | key file on the Mac; sync task dark with the runner | runner back → `lofty-crm-sync` resumes; step 7 checks the file has values | paste |
| YouTube · Instagram · LinkedIn · Facebook (Composio) | **active** (Steven Shearrill channel / @stevenshearrillhomes / LinkedIn / Facebook) | — | — |
| TikTok · GoHighLevel · Discord bot · HeyGen (Composio) | initiated, no account | "Composio links" when he sits down (links expire in 10 min); HeyGen = paid avatar provider, his decision | Steven |
| Google Drive (Composio) | initiated — not needed | the claude.ai Google Drive connector is connected and read-only | — |
| Strava · Gmail · Calendar · Drive · Notion · Slack · Canva · Zoom · Fieldy · WhisperAI · Context7 · Composio · Pabbly · AccuWeather · Expedia · Rome2Rio · Groupon · CarGurus · Vanguard · Uber Eats · You.com · Eromify | connected | — | — |
| EVRoutes · Turo | `needs_reconnect` | Reconnect or remove | Steven |
| BlackRock · Health Data Avatar · Microsoft 365 · PlayMCP · Similarweb · Higgsfield | never finished connecting | finish or remove — none is used by a routine | Steven |
| ShowingTime · Showami · homes.com | sign-in pending | `integrations/cli-anything-harnesses/connect.sh` opens the agent Chrome once | Steven |
| SkySlope · zipForms | locked until compliance sign-off | — | Alexandra → Steven |
| CRMLS · dotloop · Ticor | applications/emails drafted, not sent | STEVEN-STEPS step 19 / 30 | Steven |

## Connection status — checked live 2026-10-22 17:55 UTC (Steven: "look for everything not working or not connected and fix them")

Checked from the cloud session: `ListConnectors`, Inkbox `channel_status_get`, Composio Zoho (live call), Fieldy (live
call), Pabbly Integration Builder, the deck's `runnerStatus`, `backupStatus`, `tcDesk`, `whatsappKapso`.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| **Mac runner** (every Mac task) | still silent since 2026-10-13 07:13 UTC — stuck "running" one task | `connect-all.sh` step 2 now restarts it unconditionally; 2b keeps the Mac awake on the charger | paste |
| **Repo sync on the Mac** | `git pull` failed daily (cloud and Mac both rebuild the brain files) | `scripts/repo-sync.sh` in step 1 + a 30-minute LaunchAgent; 36 tests | paste |
| **Inkbox** (Vanessa's iMessage + email) | connected — reconnected 2026-10-22: email active (vanessa-shearrill@inkboxmail.com), iMessage line ready; no phone linked yet | text `connect @vanessa-shearrill` to +1 650 484 9720 once from his phone | Steven |
| **Kapso WhatsApp** (Pabbly app) | connected — login proven (HTTP 200); phone list + List Phone Numbers built; both instant triggers built (manual webhook: paste the Pabbly URL into Kapso); Send step waits for his test number | `integrations/pabbly/WORKFLOWS.md` §A; STEVEN-STEPS 5/5b | Steven |
| Kapso WhatsApp (Mac) | plugin/MCP/Keychain keys pending | `connect-all.sh` steps 3–4, then `claude` → `/mcp` → kapso | paste + Steven |
| Zoho CRM (Composio) | account ACTIVE; `ZOHO_GET_ZOHO_RECORDS` → **403 NO_PERMISSION** (tested 14:46 UTC) | tick "Zoho CRM API Access" on his Zoho profile | Steven |
| Lofty | no key on the Mac yet; GET-only CLI built | `connect-all.sh` step 7b asks for the key once (hidden, file only) and proves it with GET /me | paste + Steven |
| Gondola (travel MCP) | not yet registered anywhere | `connect-all.sh` 4b (Claude Code); custom connector in claude.ai (`https://mcp.gondola.ai/mcp`) | paste + Steven |
| Fieldy | connected — no recordings yet (free plan, 7-day window) | record with the pendant or desktop app | Steven |
| Gmail · Google Calendar · Zoom · Fieldy · Inkbox | connected — callable from the Command Deck page (mcp capability): Triage inbox, Recap meetings, Text me the brief | — | — |
| Eromify | connected — reconnected 2026-10-22 (creator studio; spends credits — HALT: every generation is Steven's yes) | assign to Sofia's lane; no routine uses it | — |
| EVRoutes · Turo | `needs_reconnect` | Reconnect or remove | Steven |
| BlackRock · Health Data Avatar · Microsoft 365 · PlayMCP · Similarweb · Higgsfield | never finished connecting; nothing uses them | finish or remove | Steven |
| You.com | connected but 0 credits; 9 files still reference it | research stays on Claude web research | — |
| Weekly backup | active — GREEN: catch-up run 2026-10-22 verified 191 + 16 docs; now Sunday 21:07 UTC (after the allowance reset) | — | — |
| Cloud routines | active — 55 enabled; every failure this month = usage limit; 17 ran green today | budget cut ~34% (`docs/ROUTINE-BUDGET-2026-10-22.md`); 4 http_api loops are his to disable | Steven (4 clicks) |
| Broker Command Center (3rd dashboard) | data lives in the browser only — no routine can read it | move its state to its `db` (another session owns that page) | later |

### Pabbly Connect — status 2026-10-20

Custom app **"Kapso WhatsApp"** created in Steven's Pabbly account by the Integration Builder (private, unpublished):
shell set (Communication → Phone & SMS, domain api.kapso.ai), auth = API key as the `X-API-Key` header, entered by
Steven on Pabbly's own connection page. Triggers/actions are built only after he agrees the plan in
`integrations/pabbly/WORKFLOWS.md` §A, and the login is proven with his key. The six built-in-app workflows (§B)
are his clicks in Pabbly's editor; none exists yet.

## Connection status — checked live 2026-10-23 00:20 UTC (Steven: "fix and install everything not setup or connected, including Orca, Jarvis and Laya")

Nothing on the Mac is reachable from the cloud, so every Mac row below is what `connect-all.sh` now installs or
checks, and what its REPORT will prove. New in the paste: 6a (Ollama + the Jarvis model + the OpenJarvis index),
6c runs Orca's safe doctor after opening it, 6e turns on the Agent OS. 51 tests pass (`connect-all-tests.sh`).

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Jarvis engine (Ollama + llama3.1:8b + OpenJarvis `memory.db`) | not provable from the cloud; brain says 1,761 docs on the other Mac | `connect-all.sh` 6a installs Ollama (official formula), pulls the model if missing, names `runnerctl run openjarvis` when no index exists (the index build is a runner task that spends Claude allowance, so it runs only with `JARVIS_BUILD_INDEX=1` or by hand) | paste + Steven (one command) |
| Jarvis + Vanessa's voice (profile, clips, brain) | unverified until `brain/state/jarvis-status.json` exists | `connect-all.sh` 6b (`jarvis-setup.sh --apply`); the vault must be on that Mac (`docs/SECOND-MAC-SETUP.md` 6b) and the clips in `~/.cache/vanessa-voice` or `VANESSA_VOICE_DIR` | paste + Steven (vault/clips location) |
| Laya (local router + MCP server) | not provable from the cloud | `connect-all.sh` 6 installs into `~/Applications/laya-venv`, registers `laya` with Claude Code, runs one real route | paste |
| Orca (app + phone view) | not provable from the cloud | `connect-all.sh` 6c installs the official cask, opens it on the Repo folder, runs `orca-remote.sh doctor`; pairing is his (Orca → Add Project → scan the code with the phone app) | paste + Steven |
| Agent OS (roster agents through Laya / Jarvis / Orca) | never run on a Mac | `connect-all.sh` 6e (`install-mac.sh --apply`: brain on PATH + config only) | paste |
| **Mac runner** (every Mac task) | silent since 2026-10-13 until the paste runs | `connect-all.sh` step 2 restarts it; 2b keeps the Mac awake | paste |
| Repo sync on the Mac | daily `git pull` failures until the paste runs | `scripts/repo-sync.sh` (step 1) + 30-minute LaunchAgent (1b) | paste |
| Kapso WhatsApp (Mac) | plugin/MCP/Keychain keys pending | `connect-all.sh` steps 3–4, then `claude` → `/mcp` → kapso | paste + Steven |
| Inkbox iMessage line | connected — no phone linked yet | text `connect @vanessa-shearrill` to +1 650 484 9720 | Steven |
| Zoho CRM (Composio) | 403 NO_PERMISSION until the API box is ticked | tick "Zoho CRM API Access" on his Zoho profile | Steven |
| Lofty | key not yet on the Mac | `connect-all.sh` 7b asks once (hidden), proves it read-only | paste + Steven |
| Gondola (travel MCP) | not registered yet | `connect-all.sh` 4b; custom connector in claude.ai (`https://mcp.gondola.ai/mcp`) | paste + Steven |
| EVRoutes · Turo | `needs_reconnect` (EVRoutes 402 again 2026-10-23) | Reconnect or remove | Steven |
| BlackRock · Health Data Avatar · Microsoft 365 · PlayMCP · Similarweb · Higgsfield | never finished connecting | finish or remove | Steven |
| Four http_api Sunday routines | still enabled, fail on the usage limit | 4 clicks (`docs/ROUTINE-BUDGET-2026-10-22.md`) | Steven |
| Broker Command Center (3rd dashboard) | data lives in the browser only | move its state to its `db` (another session owns that page) | later |

## Connection status — Mac 1 report 2026-10-23 00:31 UTC (`connect-all.sh`, log connect-2026-10-22-1731)

First run of the paste on STEVEN's MacBook Pro. Done: repo sync + 30-min agent, keep-awake, Gondola MCP, Inkbox voice
SDK, Jarvis engine (6a), Orca opened on Repo, AnyDesk (ID 1514099895 → deck `anydeskIds.mac1`), Agent OS, Lofty key
proven read-only, health check.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Mac runner | signed out (step 2 stopped: `runnerctl login` is Steven's) | `runnerctl login && runnerctl status` | Steven |
| Kapso (Mac plugin + keys) | sign-in and mobile number pending | `claude` → `/mcp` → kapso; `bash integrations/kapso/install-mac.sh keys --allow <mobile>` | Steven |
| Laya | step 6 stopped (model download or venv) | paste the 6 / 6b log lines to Claude (`docs/STEVEN-STEPS.md` step 1c) | Steven (one paste) |
| Jarvis verify (6b) | FAIL rows unknown until the log lines are pasted | same paste | Steven (one paste) |
| Claude mods | Claude Code older than 2.1.287 | `claude update && bash integrations/mods/install-mods.sh` | Steven (one paste) |
| Lofty | connected — key on the Mac, GET /me proven 2026-10-23 | — | — |
| Gondola (Claude Code) | connected — MCP registered for every project; claude.ai custom connector still his | claude.ai → Connectors → Add custom connector | Steven |
| Orca | active — installed and opened on Repo; phone pairing his | Add Project → scan the code with the Orca IDE app | Steven |
| AnyDesk | active — installed, ID saved to the deck; permissions his | Screen Recording + Accessibility on | Steven |
| Repo sync on the Mac | connected — step 1 and the 30-minute agent ran | — | — |
| Inkbox iMessage line | connected — no phone linked yet | text `connect @vanessa-shearrill` to +1 650 484 9720 | Steven |
| Zoho CRM (Composio) | 403 NO_PERMISSION until the API box is ticked | tick "Zoho CRM API Access" on his Zoho profile | Steven |
| Kapso webhooks (Pabbly → Kapso) | two trigger URLs not pasted yet | `docs/STEVEN-STEPS.md` step 5 | Steven |
| EVRoutes · Turo | `needs_reconnect` | Reconnect or remove | Steven |
| Four http_api Sunday routines | still enabled, fail on the usage limit | 4 clicks (`docs/ROUTINE-BUDGET-2026-10-22.md`) | Steven |
| BlackRock · Health Data Avatar · Microsoft 365 · PlayMCP · Similarweb · Higgsfield | never finished connecting | finish or remove | Steven |

## Connection status — Mac 1 report #2, 2026-10-23 01:01 UTC (connect-2026-10-22-1800)

Same twelve steps done. Mods installed (7 + 2 samples, settings backup kept). Jarvis engine: Ollama running, llama3.1:8b
present, index `~/.openjarvis/memory.db` 1,828 rows, vault 850 notes, Laya MCP registered, voice profile written.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Mac runner | signed out ("CLI NOT logged in") — 24 tasks waiting | `runnerctl login && runnerctl status` | Steven |
| Laya real engine | crashed on `answers["urgency"]["label"]` (real 0.3.x `score` answers carry `score`+`legend`) | fixed: `score_label()` in `laya_route.py`, 23 tests; proven by the next real route on the Mac | paste |
| Jarvis voice clips | none under `~/.cache/vanessa-voice` or `~/Applications/team-avatars/voices` | locate (STEVEN-STEPS 1b) or export the 8 deck clips | Steven / Claude |
| brain doctor (Mac) | FAIL, reason not in the log | `bin/brain doctor` output | Steven (one paste) |
| Kapso (Mac) | plugin + MCP registered; `! Needs authentication` | `claude` → `/mcp` → kapso → sign in; then the keys line | Steven |
| Claude mods | connected — 7 mods + blast-radius, replay-theater | — | — |
| Jarvis engine + index | connected — 1,828 rows, model present | — | — |
| Inkbox iMessage line | connected — no phone linked yet | text `connect @vanessa-shearrill` to +1 650 484 9720 | Steven |
| Zoho CRM (Composio) | 403 NO_PERMISSION until the API box is ticked | tick "Zoho CRM API Access" | Steven |
| Kapso webhooks (Pabbly → Kapso) | two trigger URLs not pasted yet | `docs/STEVEN-STEPS.md` step 5 | Steven |
| Gondola (claude.ai) | Claude Code MCP registered; custom connector still his | claude.ai → Connectors → Add custom connector | Steven |
| Orca · AnyDesk | active — installed; pairing / permissions his | STEVEN-STEPS step 4 | Steven |
| EVRoutes · Turo | `needs_reconnect` | Reconnect or remove | Steven |
| Four http_api Sunday routines | still enabled | 4 clicks | Steven |

## Connection status — Mac 1, 2026-10-23 01:09 UTC (Steven's three pastes)

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Mac runner | connected — `runnerctl login` done 01:08 UTC; running toolkit-deck-sync + vanessa-morning-brief-text, 22 waiting; first scheduled runs resume on their own | — | — |
| Laya real engine | connected — routed a test question in 5.6 s (cold start) after the `score_label` fix; MCP registered | — | — |
| brain doctor (Mac) | index stale vs the Mac's own edits | `connect-all.sh` 6a2 now runs `bin/brain reindex` before 6b; one paste in STEVEN-STEPS 1b | paste |
| Jarvis voice clips | none on the Mac | exported the deck's 8 clips to `integrations/jarvis/voice/vanessa/`; jarvis-setup looks there first | paste |
| Kapso (Mac) | `! Needs authentication` | `claude` → `/mcp` → kapso → sign in; then the keys line | Steven |
| Mac's own uncommitted edits | 9 files kept in place by repo-sync (brain/bench.py, brain/tests/test_brain.py, cli-anything harness files) | review on the Mac: `git -C ~/Repo status --short`; commit or discard | Steven |

## Connection status — Mac 1, 2026-10-23 01:14 UTC (Jarvis proof paste)

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Jarvis (all rows) | connected — platform, memory.db 1,828 rows, vault 850 notes, Laya MCP, 8 voice clips (repo folder), voice profile, brain doctor PASS | — | — |
| Laya real engine row in jarvis-setup | false FAIL: Hugging Face progress bars on stderr overwrote the row; Laya itself routed a question at 01:09 | fixed: stdout only, progress bars off; proven on the next `jarvis-setup.sh --verify` | paste |
| brain doctor (Mac) | connected — PASS after `bin/brain reindex` (now connect-all 6a2) | — | — |
| Vanessa reference audio on the Mac | found `~/Applications/vanessa-voice/ref/vanessa_ref.wav` and `~/Documents/Vanessa/Vanessa1.m4a` — a cloned-voice reference exists locally; not copied anywhere (clone provider/consent are Steven's call, HALT) | decision only | Steven |

## Connection status — Mac 2 first run, 2026-10-23 01:39 UTC (connect-2026-10-22-1839, Intel MacBook Pro "(6)")

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Mac 2 basics | connected — repo cloned, 30-min sync, keep-awake, Gondola MCP, Orca opened, AnyDesk installed, Kapso plugin installed, Laya venv created, `peer` role written | — | — |
| Python on Mac 2 | 3.9.6 — brain reindex, Agent OS and Jarvis checks all stop on it | `second-mac.sh` 0d2 installs Homebrew python; rerun | paste |
| Laya on Mac 2 | venv made; package install stalled building `cryptography` from source (Intel, no wheel) | `install.sh` now wheel-first, build tools fallback; rerun | paste |
| Claude Code on Mac 2 | 2.1.278, mods need 2.1.287+ | `second-mac.sh` 0d3 runs `claude update`; rerun | paste |
| Jarvis engine on Mac 2 | step 6a cut off during `brew install ollama` (auto-update) | rerun | paste |
| Jarvis index + vault on Mac 2 | no memory.db, no `~/Shearrill-Vault` | SECOND-MAC-SETUP 6b (iCloud or copy); then `runnerctl run openjarvis` once the runner is on Mac 2 | Steven |
| Inkbox voice SDK on Mac 2 | needs an Inkbox API key file; Mac 1 already sends her voice | optional on Mac 2 | Steven (optional) |
| Runner on Mac 2 | not installed (built on Mac 1 only) | the two lines from **Mac 1**, then a copy step | Steven |
| Kapso sign-in, Lofty key on Mac 2 | pending | `claude` → `/mcp` → kapso; Lofty key at the 7b prompt (or Enter) | Steven |
| Python on Mac 2 — second attempt 01:53 UTC | Homebrew cannot build python there (Intel Mac on macOS 26: Tier 3, no bottles, and the Command Line Tools are outdated) | `second-mac.sh` 0d2 now installs a ready-built Python 3.12 with uv and a user-level `~/.local/bin/python3` shim; Homebrew only as fallback | paste |
| Claude Code on Mac 2 | connected — updated 2.1.278 → 2.1.309; a leftover npm copy remains (`npm -g uninstall @anthropic-ai/claude-code`, optional) | — | Steven (optional) |
| Command Line Tools on Mac 2 | outdated for macOS 26 (Homebrew refuses to build) | System Settings → Software Update, or `sudo rm -rf /Library/Developer/CommandLineTools && sudo xcode-select --install` | Steven (optional; nothing in the paste needs it once Python comes from uv) |
| Runner on Mac 2 — path known 02:10 UTC | Mac 1: `~/Applications/claude-runner` + `~/.local/bin/runnerctl` + LaunchAgent; `~/.config/claude-runner` absent on Mac 1 (no role file, no token file) | `scripts/runner-export.sh` (Mac 1, writes `peer` too) → AirDrop → `scripts/runner-import.sh` (Mac 2) → `runnerctl login` there; 11 tests | paste + Steven (AirDrop, login) |
| Mac 2 run 01:53 UTC (full report) | mods on (8 done); Ollama formula build refused like python (Intel + macOS 26 + old CLT) | `connect-all.sh` 6a now installs the Ollama cask (prebuilt app) first; Python via uv; rerun | paste |
| Command Line Tools on Mac 2 | outdated for macOS 26 — the one root cause left that only Steven can clear | System Settings → Software Update (install the Command Line Tools update), or the two `sudo` lines Homebrew printed | Steven |
| NotebookLM (6D Brain as a notebook) | active — source pack: `bin/brain export notebooklm` → 13 files, 98+ pages, clients excluded, PII masked; no public API for a consumer account, Drive stays read-only | upload the 13 files once (`scripts/notebooklm-export.sh` opens both), re-upload changed files weekly | Steven (5 min) |
| Google Drive `SECOND BRAIN/` (write, scoped) | connected — 13 `SB` Google Docs created 2026-10-23 06:05 UTC in Steven's folder tree (owner steven.shearrill@gmail.com); weekly rewrite task trig_01MR463NSmSAcA84zJHjerUp (Sun 2:45 PM PT) | — | — |
| NotebookLM (mirror) | connected — the 13 Docs are its sources; Google auto-syncs Drive Docs; Steven adds them to his three notebooks once (STEVEN-STEPS 1f) | add sources from Drive, once | Steven (5 min) |
| Notion Second Brain (layer directory) | active — DB e767dacc; directory page written by the weekly sync; `brain-learn-daily` rows resume with the runner | — | — |
| GitHub repo visibility | public — anyone can read the brain (no client files beyond first names) | Steven decides (STEVEN-STEPS 1g) | Steven |
| NotebookLM direct connector (`notebooklm-mcp-cli`) | pending — opt-in taken; installs with the next Mac paste (connect-all 6f); sign-in his | `nlm login` on Mac 1, then `nlm login --check` | Steven |
| NotebookLM direct connector — Mac 1, 2026-10-23 06:30 UTC | connected — `nlm login` done (protected mode, OS keystore), `--check` valid, account steven.shearrill@gmail.com, 5 notebooks found; MCP registered for Claude Code by connect-all 6f | first use: a Claude Code session on Mac 1 adds the SB Docs to the "2nd brain" notebook | Steven (one prompt) |
| Mac 1 full report 06:22 UTC | connected — 17 of 20 steps done (runner, Laya, Jarvis, mods, Lofty, Agent OS, Orca, AnyDesk, Gondola, Inkbox voice); open: Kapso sign-in + keys | `claude` → `/mcp` → kapso | Steven |

## Connection status — consolidated, 2026-10-23 13:10 UTC (Steven: "fix anything not optimized or broken")

Supersedes the per-run rows above. Only what is still open is listed; everything else in the earlier 2026-10-23 tables is
connected (Mac 1: runner, Laya, Jarvis, mods, Lofty, Agent OS, Orca, AnyDesk, Gondola, Inkbox voice, NotebookLM connector
signed in; cloud: Drive SECOND BRAIN, Notion directory, 6D daily rebuild with proof row, weekly layer sync).

| Connection | Status today | Fix | Who |
|---|---|---|---|
| NotebookLM "2nd brain" notebook sources | connected — connector signed in (5 notebooks); the SB Docs are not yet attached as sources | one prompt in a Claude Code session on Mac 1 (STEVEN-STEPS 1f2-done) | Steven (one prompt) |
| Kapso (Mac 1) | plugin + MCP registered; `! Needs authentication` | `claude` → `/mcp` → kapso → sign in; then the keys line | Steven |
| Inkbox iMessage line | connected — no phone linked yet | text `connect @vanessa-shearrill` to +1 650 484 9720 | Steven |
| Zoho CRM (Composio) | 403 NO_PERMISSION until the API box is ticked | tick "Zoho CRM API Access" | Steven |
| Kapso webhooks (Pabbly → Kapso) | two trigger URLs not pasted yet | `docs/STEVEN-STEPS.md` step 5 | Steven |
| Gondola (claude.ai) | Claude Code MCP registered; custom connector still his | claude.ai → Connectors → Add custom connector | Steven |
| Orca pairing · AnyDesk permissions | apps installed on both Macs | STEVEN-STEPS step 4 | Steven |
| Mac 2 | Python 3.12 (uv), Claude Code 2.1.309, mods, Agent OS, brain index, Orca, AnyDesk, Gondola done; Laya + Jarvis engine unproven (last REPORT not pasted) | rerun `bash scripts/second-mac.sh`, paste the REPORT; then runner-export (Mac 1) → AirDrop → runner-import (Mac 2); vault for Jarvis (SECOND-MAC-SETUP 6b) | Steven (pastes) |
| EVRoutes · Turo | `needs_reconnect` | Reconnect or remove | Steven |
| Four http_api Sunday routines | still enabled | 4 clicks | Steven |
| GitHub repo visibility | public | Steven decides (STEVEN-STEPS 1g) | Steven |
| Fieldy → 2nd brain | connected — the daily "Fieldy → brain" task (6:50 AM PT, this session, Fieldy connector) writes `memory/fieldy-meetings.md` + the deck `fieldyDesk` doc and queues a recap item per meeting with action items; 0 recordings as of 2026-10-23 13:20 UTC so the first digest waits for a recording | record with the pendant or the desktop app | Steven (records) |
| Notion `brain-learn-daily` rows | resume with Mac 1's runner (signed in 2026-10-23); directory page written 2026-10-23 | — | — |

## Connection status — round 2, 2026-10-23 14:45 UTC (Steven: "connect TidyCal, homes.com, ShowingTime, Showami, Pivo, Orca, Jarvis, Laya, AnyDesk on all 3 computers and tablet, Ticor, MBS Highway, AEO/GEO/SEO, Arive, Zoho, Lofty, drips and texts")

Supersedes the consolidated section above for the rows it names; the rest of that section still holds.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Jarvis · Laya · Orca (Mac 1) | connected — all rows ok 2026-10-23 01:14 UTC | — | — |
| Jarvis · Laya · Orca (Mac 2) | partially set — engine unproven; runner not yet imported | `bash scripts/second-mac.sh` + runner export/import (STEVEN-STEPS 1e) | Steven (pastes) |
| Orca · Laya · Bonsai (Alienware) | not started — `integrations/alienware/alienware-setup.ps1` never run on Windows yet | STEVEN-STEPS round 2, Alienware paste | Steven (pastes) |
| AnyDesk (Mac 1, Mac 2) | installed; permissions + unattended password are Steven's | step h | Steven |
| AnyDesk (Alienware, tablet, phone) | not started — winget id `AnyDesk.AnyDesk` confirmed; iPad is outgoing-only, Android tablet can be controlled | round 2 pastes; licence decision (free = private use) | Steven |
| TidyCal | connect-all step 7c ready (token → `~/.config/tidycal/.env`, read-only proof); no token yet | make the token, rerun connect-all | Steven |
| homes.com · ShowingTime · Showami | wrappers vendored and read-only; connect-all step 7d installs and reports; sign-ins in the agent Chrome are Steven's (MFA) | step 7d, then sign in where it says | Steven |
| Lofty | key file step 7b; no key on the Mac yet | Lofty → Settings → Integrations → API | Steven |
| Zoho CRM | 403 NO_PERMISSION until the API box is ticked | tick "Zoho CRM API Access" | Steven |
| Arive | not connected — REST API + private Zapier app need Pro plan credentials (`integrations/arive/README.md`) | generate credentials, ask Arive for the Zapier invite | Steven |
| MBS Highway Home Report | not connected — no public API; rep-issued webhook or CSV (`integrations/mbs-highway/README.md`) | e-mail the rep | Steven |
| Pivo | no API — tour link / video file only (`integrations/pivo/README.md`) | pair the Pod; share links | Steven |
| Ticor Title property search | no API — rep account + CSV/PDF export (`integrations/ticor/README.md`) | ask the Ticor rep | Steven |
| Drip campaigns + text follow-ups | planned — playbook written (`wiki/real-estate-playbooks/drip-and-text-follow-up.md`); specs on request; 10DLC is Steven's | "specs ready for review"; Lofty 10DLC | Steven + Victor/Alexandra |
| OpenFlowKit MCP + skill · pr-lens skill · archify skill (the four repos, 2026-10-23) | installed in the repo (skills) / pending on the Macs (MCP by connect-all 6g, archify by install-mac.sh); `integrations/skill-packs/REGISTRY-2026-10-23.md` | next Mac paste; pr-lens GitHub App is Steven's click | Steven (paste) · Derek |
| AI-search presence (AEO/GEO/SEO) | planned — playbook written (`wiki/real-estate-playbooks/ai-search-visibility.md`); monthly presence audit task live (1st, 7:10 AM PT) | claim the profiles (step j) | Steven + Sofia |

## Connection status — Mac 1 report #3, 2026-10-23 11:16 PT (connect-2026-10-23-1116; pasted by Steven the same evening)

Supersedes the round-2 section above for the rows it names. Source: the REPORT block of `scripts/connect-all.sh` on Steven's
MacBook Pro (log `~/Library/Logs/vanessa-setup/connect-2026-10-23-1116.log`); the script pulled the branch first (step 1).

**Done on the Mac (steps 1–9 except four):** repo caught up + 30-minute catch-up task · **Mac runner restarted** (it had been
silent since Oct 13 — the morning Mac tasks have a chance again from 2026-10-24) · caffeinate-on-charger · Kapso keys in the
Keychain · Gondola MCP · Inkbox voice SDK · Laya installed and registered, one real test · Jarvis engine (Ollama + llama3.1:8b,
OpenJarvis index) · brain reindex · Jarvis + Vanessa's voice wired · Orca on the Repo folder · AnyDesk installed · Agent OS ·
NotebookLM `nlm` CLI + MCP (sign-in Steven's) · OpenFlowKit MCP · Lofty/Zoho key-file steps ran · site wrappers installed ·
Claude Mods (status line, HALT guard, /remember, /connections, /owner, /paste) · health check.

**Did not finish:** 2c runner tasks in error (the report names no task — the last log lines did not reach the REPORT on this run;
the names are in the log, and `runnerctl status` prints them) · 3 Kapso plugin + MCP (needs Steven's sign-in) · 7c TidyCal and 7e
Arive (Enter skipped the key prompts; Lofty's key 7b was skipped the same way — the step ran, no key on the Mac).

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Mac runner (all Mac tasks) | healthy — `runnerctl status` 12:33 PT: 42 ok (morning tasks all ran today), 5 error (toolkit-deck-sync, nightly-self-test, three Sunday weeklies), 4 limited, 3 paused; the step-2 "silent since Oct 13" reading was wrong (`docs/inventory/routine-health.md`) | one paste: `runnerctl pause r9-feed-freshness-sweep && runnerctl pause r8-apple-health-snapshot && runnerctl pause strava-daily-sync && runnerctl run toolkit-deck-sync && runnerctl status` — paste the output to Claude | Steven (paste), then Derek |
| iMessage line (morning brief text + voice) | still not linked — brief arrives by e-mail + push | text `connect @vanessa-shearrill` to +1 650 484 9720, once | Steven |
| Lofty | two paths on Mac 1 (2026-10-23 13:05 PT): the old local bridge is the MCP named `lofty` (stdio, `~/Applications/lofty-bridge/mcp-server.js`, connected — the runner tasks use its `mcp__lofty__*` tools; it returns one stage and no lead ids, so speed-to-lead cannot be measured); Lofty's own cloud MCP (`https://mcp.lofty.com/mcp`, OAuth) is being added as `lofty-cloud` so nothing the runner relies on changes name | `claude mcp add -s user --transport http --client-id 1wzhz7fnrr8qo --callback-port 8766 lofty-cloud https://mcp.lofty.com/mcp`, then `claude` → `/mcp` → lofty-cloud → sign in; once it answers "list my Lofty lead stages", switch `lofty-crm-sync` to it (allow-list + spec) and retire the bridge. The REST API key (step 7b) is then optional | Steven (sign-in), then Derek |
| TidyCal | step 7c did not run (no token) | TidyCal → Settings → Integrations → API → token; rerun connect-all | Steven |
| Arive | step 7e did not run (no credentials) | Arive → Settings → Integrations → generate; rerun connect-all | Steven |
| Zoho CRM | 403 until the API box is ticked | Setup → Security Control → Profiles → your profile → Developer Permissions → "Zoho CRM API Access" | Steven |
| Kapso (WhatsApp) | keys in the Keychain; plugin + MCP waiting on the sign-in | `claude` → `/mcp` → kapso → sign in; then message (202) 474-5223 from the phone | Steven |
| Jarvis · Laya · Orca (Mac 1) | installed, tested, Orca on the Repo folder; phone pairing is Steven's | Orca IDE app → pairing screen → scan | Steven |
| AnyDesk (Mac 1) | installed; ID 1514099895; Screen Recording + Accessibility + unattended password are Steven's | System Settings → Privacy & Security; Computer Hub card (panel 40) | Steven |
| homes.com · ShowingTime · Showami | wrappers installed; sign-ins (MFA) in the agent Chrome are Steven's | `bash integrations/cli-anything-harnesses/connect.sh` | Steven |
| EVRoutes · Turo connectors | "needs reconnect" on claude.ai (EVRoutes also failed to connect in this session) | claude.ai → Settings → Connectors → Reconnect or remove | Steven |
| Gondola (travel) | MCP installed for Claude Code; the claude.ai connector is not added | Settings → Connectors → Add custom connector → `https://mcp.gondola.ai/mcp` | Steven |
| Pabbly ↔ Kapso webhooks, six workflows | Kapso login proven; webhook URLs and the six workflows are clicks at connect.pabbly.com | STEVEN-STEPS step 5; `integrations/pabbly/WORKFLOWS.md` | Steven |
| TikTok · GoHighLevel · Discord bot · HeyGen | not connected (Composio links last 10 minutes) | say "Composio links" in a live session | Steven + Vanessa |

## Connection status — Vanessa everywhere, 2026-10-23 21:30 UTC (Steven: "connect Jarvis with Vanessa replacing it with her voice and persona, and Laya, Orca and all my AI team to Orca, and connect these with my 6D 2nd brain")

Supersedes the sections above for the rows it names. Everything here is one paste on the Mac: `cd ~/Repo && bash scripts/fix-mine.sh`.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Jarvis speaks and thinks as Vanessa | ready — `integrations/jarvis/vanessa-persona.sh --apply` writes her SOUL/MEMORY/USER persona into OpenJarvis and sets `persona_name = "vanessa"`; her recorded voice via `jarvis-setup.sh --apply`; not yet run on Mac 1 | `bash scripts/fix-mine.sh` (step 3b) | Steven (paste) |
| Jarvis knows the Second Brain | ready — the same script indexes the brain's pages (no client pages, no meeting digests, no findings) into Jarvis memory; the 6D layers row shows "speaks as Vanessa" + the page count once run | same paste | Steven (paste) |
| Laya routes, Orca launches the AI team | installed on Mac 1 (connect report #3); `connect-orca-laya.sh --apply` + `agent-os/install-mac.sh --apply` re-run by the paste; `brain os check` is the proof | same paste; phone pairing in Orca is Steven's | Steven |
| 6D Brain shows all of it | the layers panel reads `brain/state/jarvis-status.json` (persona, indexed pages) and the toolkit register reads this table; the daily 3:30 AM rebuild carries it | — | Vanessa |

## Connection status — communication channels, 2026-10-23 23:50 UTC (Steven: "I texted Vanessa on iMessage and on Kapso WhatsApp with no response; fix all communication to include Discord and chat box")

Supersedes the sections above for the rows it names. Found live: Inkbox holds **no iMessage conversation and no linked phone** (`awaiting_inbound` empty) — the connect text never reached it, so the Mac poller had nothing to answer and the morning brief's send fails `imessage_no_assignment`. Kapso's sandbox number is assigned but **no Mac task reads it** (§5b/§5c were specified, never registered) and the Kapso sign-in is pending. Discord's bot has **no token** (Composio `discordbot` not connected; the Mac bot runs in relay mode). The deck chat box answers in-page through the viewer's own Claude (`sample`); when that permission is refused it says so and nothing else answered. New: a cloud hourly fallback (`Vanessa inbox sweep (cloud)`, trig_018cLszdipa7WAVt5nd8BuXT, :17 past the hour 6 AM–10 PM PT) answers unanswered iMessages, deck chat questions and Discord #vanessa messages behind the Mac pollers.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| iMessage line (morning brief text + voice, Vanessa replies) | not linked — Inkbox shows no connected phone and no conversation (23:50 UTC) | text exactly `connect @vanessa-shearrill` to +1 650 484 9720 (tap: `sms:+16504849720?&body=connect%20%40vanessa-shearrill`), then a real question; the Mac poller answers within 10 min, the cloud sweep within the hour | Steven |
| WhatsApp (Kapso) | number …5223 assigned; nothing reads it — runner tasks `kapso-inbox-sync` / `vanessa-whatsapp-inbox` not registered; Kapso MCP sign-in pending; keys in the Keychain (connect report #3) | `scripts/fix-mine.sh` installs the plugin + MCP and prints the runner task catalog Claude needs to register the two tasks; Steven: `claude` → `/mcp` → kapso → sign in. Until then answer WhatsApp live in a Claude Code session ("read my WhatsApp") | Steven (sign-in), Claude (task files next round) |
| Discord #vanessa | bot token missing (Composio `discordbot` initiated 23:55 UTC, not active; Mac bot in relay mode) | A2 in the fix-mine checklist: create the bot, paste the token when the script asks (Keychain `vanessa-discord-bot-token`), invite it, then "Discord link" to Claude for the Composio connect; the cloud sweep answers #vanessa hourly once active | Steven |
| Command Deck chat box | works in claude.ai through the viewer's own Claude (`sample` declared); last message 2026-09-13 | nothing to install; the cloud sweep now answers any question left unanswered for 10 minutes into the same thread | Vanessa |
| Jarvis = Vanessa, single point of contact for the whole AI team | persona + voice + brain index + the 180-seat roster in her memory, all from `vanessa-persona.sh` (run by fix-mine) | one paste | Steven (paste) |

## Connection status — Vanessa's voice on iMessage, 2026-10-24 00:45 UTC (Steven: "Vanessa's voice is supposed to speak with a voice message on top of the text")

| Connection | Status today | Fix | Who |
|---|---|---|---|
| iMessage line (Vanessa text replies) | **linked and live** since 2026-10-23 23:54 UTC — Steven's thread aa1a9d19…8510; the Mac poller answered a non-answer at 00:05, the cloud sweep answered rates + schedule at 00:22 | — | — |
| Vanessa's voice note after each text | not yet delivering — `voiceReplyQueue` held only the Sep 12 test item until the cloud sweep queued the first real one (00:28 UTC); the Mac's `voice-reply-render` runs ok every 10 min but needs the Inkbox API key in `~/.inkbox/config` and the thread in `~/.config/inkbox/voice-allow` (both from `fix-mine.sh` step 3a2 with `VANESSA_THREAD=…`); the Mac's `vanessa-imessage-inbox` prompt still lacks §6a (the catalog in fix-mine's REPORT shows where it lives) | the one paste; the cloud sweep queues voice for every reply it sends and reports `voiceReplyStatus` in `agentInbox.channels.voice` | Steven (paste), Derek (§6a into the Mac task) |

## Connection status — SkySlope, 2026-10-24 01:10 UTC (Steven: "setup skyslope i have an api key")

| Connection | Status today | Fix | Who |
|---|---|---|---|
| SkySlope (transactions, documents) | key on Mac path ready — `integrations/skyslope/skyslope_cli.py` (stdlib, GET-only, SkySlope's own HMAC login from github.com/skyslope/example-authentication); the login needs **two pairs**: the Access Key + Secret Steven generated (My Account → Integrations) AND a Client ID + Client Secret that SkySlope issues to the integration or brokerage. The paste asks for all four (hidden; Enter skips the pair you lack) and proves the login with `me`. If SkySlope answers 401, the Client pair is what is missing — ask the SkySlope rep or the brokerage admin; the browser harness (`cli-anything-harnesses/skyslope`) stays the fallback | `bash scripts/fix-mine.sh` | Steven (keys), Carmen (desk) |

## Connection status — answering at any hour, 2026-10-24 01:25 UTC (Steven: "enable all messages to respond when message is sent anytime of day")

Supersedes the schedule wording of the two sections above. Two clocks answer Vanessa's channels: the Mac pollers (every 5–10 minutes) and the cloud sweep (the fallback). The cloud sweep now runs every hour around the clock; a cloud routine cannot run more often than hourly, so the Mac pollers remain the fast path. The Mac runner skips any task outside its window, and every task carries `07-22` today — `scripts/fix-mine.sh` (step "hours") widens only the five message tasks to `00-24`, proves it with `runnerctl dry`, and restores the file if the runner does not print the new window back.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Cloud sweep (iMessage text + voice queue, deck chat box, Discord #vanessa) | hourly at :17, 24/7 (was 6 AM–10 PM PT) | done in this session | Vanessa |
| Mac pollers overnight (vanessa-imessage-inbox, vanessa-discord-inbox, voice-reply-render, kapso-inbox-sync, vanessa-whatsapp-inbox) | stop between 10 PM and 7 AM PT until the window is widened | the one paste (fix-mine) — if its REPORT says the window is a runner-wide default, paste the file names it lists | Steven (paste) |
| Night-time answer latency | up to 60 minutes until the Mac window is widened, then 10 minutes | — | — |

## Connection status — one paste, 2026-10-27 02:30 UTC (Steven: "fix everything not working and simplify … scripts that I can cut and paste")

`setup.sh` is now the single entry point: it runs `scripts/fix-mine.sh` then `connect-all.sh` with the keys asked once, and
prints one REPORT. Statuses below are what the repo and the deck's documents show today; the REPORT from the Mac is the
live truth once Steven has run it.

| Connection | Status today | Fix | Who |
|---|---|---|---|
| Kapso WhatsApp (Vanessa (202) 474-5223) | plugin + MCP + keys scripted; `whatsappKapso` deck doc stale since 10-22: the Mac tasks are not registered | `bash setup.sh`, then `claude` → `/mcp` → kapso → sign in; message the number once | Steven (paste + sign-in) |
| Discord #vanessa | bot token prompt in the paste; bot not yet created | create the bot (discord.com/developers), paste the token when asked, say "Discord link" | Steven |
| Jarvis = Vanessa | scripted (engine, recorded voice, persona, brain in memory) in fix-mine 3b + connect-all 6a/6b | `bash setup.sh` | Steven (paste) |
| Orca + the AI org chart | scripted (connect-all 6c + 6e Agent OS, 172 agents wired) | `bash setup.sh`; phone pairing is his scan | Steven (paste + scan) |
| AnyDesk | install scripted (connect-all 6d) | permissions + unattended password + IDs into the Computer Hub card | Steven |
| Arive | credentials prompt in the paste; no call yet | type the three values when asked; the daily cycle makes the first read-only call | Steven (keys) |
| Zoho CRM | self-client keys prompt in the paste; API 403 until the profile tick | tick "Zoho CRM API Access"; then Composio/`zoho-crm-sync` works | Steven (tick) |
| ShowingTime · Showami · homes.com | read-only CLI-Anything wrappers scripted (connect-all 7d) | one sign-in each in the agent Chrome | Steven (sign-ins) |
| TidyCal | token prompt in the paste + read-only proof call | type the token when asked | Steven (token) |
| SkySlope | four keys prompt in the paste + `GET /api/users/me` proof | type the keys; the Client ID/Secret pair is partner-gated (rep) | Steven (keys, rep) |
| Ticor Title property search | no API (`integrations/ticor/README.md`); county records already feed the deck | ask the San Diego rep for Ticor Online Pro | Steven |
| MyFitnessPal · Strava · BodyPark | all three flow through Apple Health → Health Auto Export → the cloud Health daily sync (Strava also by connector) | three phone toggles, once | Steven (phone) |
| Hume AI | not connected; Vanessa's voice is the recorded Magica set. A key can be stored (paste step 4) for a later EVI proposal; it spends money per call → HALT until Steven says so | optional key; decision later | Steven |
| Pabbly Connect | workflows written (`integrations/pabbly/WORKFLOWS.md`); built in Pabbly's editor, not by a script | click-together in connect.pabbly.com; Kapso custom app on "yes build the kapso connection" | Steven (+ Claude for the Kapso app) |
| Composio (Zoho, Discord, TikTok, GHL, HeyGen) | claude.ai connector works from the cloud; optional key on the Mac (paste step 4) | say "Composio links" in a live session for the OAuth screens | Steven |
| CLI-Anything | harnesses for homes.com / ShowingTime / Showami / Lofty installed by the paste | sign-ins only | Steven |
| Mac runner · message tasks all day | restart + hours widening scripted (fix-mine 4) | `bash setup.sh`; `runnerctl login` stays his if it is signed out | Steven (paste) |

