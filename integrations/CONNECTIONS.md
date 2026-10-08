# CONNECTIONS — every integration, its real status, and the one thing Steven must do

**Baseline 2026-09-12 · verified 2026-09-22.** Owner: Integration Engineer (under CTO Innovator,
reporting line Derek/CTO). Rule of this file: *connected ≠ working.* A row says what a run proved,
not what a settings page claims.

Trust levels: **L1** report-only · **L2** drafts for Steven's approval · **L3** owns end-to-end ·
**n/a** not an agent path.

## The four that need Steven today

| System | Path | Status today | **What Steven must do (one line)** | Trust |
|---|---|---|---|---|
| **Lofty** (real-estate CRM) | `lofty-bridge` MCP (read-only) + `lofty-cli` on the Mac; REST `api.lofty.com/v1.0`, `Authorization: token <key>` | Bridge and CLI installed (status RUN, MCP server `lofty` connected). **API key presence unverified from the cloud — no successful pull yet.** Composio has no Lofty toolkit. | **In Lofty → Settings → Integrations → API, generate an API key and put it in `~/.config/lofty/.env` on the Mac as `LOFTY_API_KEY=…`, then run `lofty-crm-sync` once.** | L1 → L2 after 7 clean runs |
| **Zoho CRM** (mortgage system of record — Steven, restated 2026-09-24) | Composio toolkit `zoho`, account `zoho_talite-spike` | Connection **ACTIVE**, but every CRM call returns **HTTP 403 NO_PERMISSION** — reproduced 2026-09-22 08:17 UTC and **re-tested 2026-09-24**, twice — the second at 15:56 UTC (`ZOHO_GET_ZOHO_RECORDS`, Leads, one record, one non-PII field): still 403. Steven reports having an API key; **the key is not the blocker** — the profile permission refuses every key and token for that user until it is switched on. | **In Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → Developer Permissions, enable "Zoho CRM API Access".** Then re-authorise the Composio connection once. | L1 → L2 once unblocked |
| **CLI-Anything** (homes.com, ShowingTime, Showami, SkySlope, zipForms — plus Lofty and Zoho REST) | `cli-anything-hub` + Claude Code plugin; `cli-anything-browser` (**vendored in this repo**, not on PyPI — F-H1-02) driving DOMShell for the sites with no API; REST for Lofty and Zoho | **Not installed on the Mac** — and no longer generated: **eight read-only harness packages are pre-built** in `integrations/cli-anything-harnesses/` (a ninth, `publicfeeds`, added R6 2026-09-24 — see the dedicated section below) and install **browser first, then the eight, into one venv** — not `pip install .` per package: the six DOMShell packages (homes, ShowingTime, Showami, plus `publicfeeds`) pin `cli-anything-browser>=1.0.0`, which is not on PyPI, so installing one of them on its own exits 1 (built and unit-tested offline 2026-09-22, F-H2b-01…13; standalone-install measurement F-P4-03). Hub and plugin are one scripted step (`MAC-SETUP.sh --only cli-anything`); the vendored browser engine and all eight site packages are another (`--only cli-anything-harnesses`, one `uv pip install` into `~/Applications/cli-anything-harnesses/.venv`, browser first, symlinked into `~/.local/bin`); the earlier claim that the install is interactive was wrong (F-S1-18), and so is the claim that each wrapper must be generated one per site (F-H1-10). **Nothing is verified:** all 26 browser recipes ship `verified: false`, no site has ever been reached, and not one of the eight has ever made a live call (F-H1-01, F-H2b-13). SkySlope and zipForms refuse every live command, exit 3, until `CLI_ANYTHING_ECC_REVIEWED_AT` holds a real sign-off date; `publicfeeds`'s three groups refuse the same way behind their own three `CLI_ANYTHING_TOS_REVIEWED_<GROUP>` gates. Hub registry has no CRM or real-estate entries (README checked 2026-09-22; `clianything.cc` egress-blocked). | **Run `./MAC-SETUP.sh` — hub, plugin, the vendored browser harness and the eight packages all install non-interactively — put `export CLI_HUB_NO_ANALYTICS=1` in your shell profile **and** the runner task's env (the script only covers its own run), install the DOMShell Chrome extension and sign in by hand, then run `integrations/cli-anything-harnesses/connect.sh` for the guided next steps (posture check, `--discover` per open gate, what's still pending). There is nothing to generate.** | L1, read-only |
| **Apple Health** | New: Claude iOS → Notion "Health Log" → `health-notion-sync` → `appleHealth` doc. Old: Health Auto Export → daemon :8765 → DuckDB → `apple-health` MCP | Old pipeline **down** — daemon not responding, doc 9 days stale (`last_received 2026-09-13 14:30:40`), `r8-apple-health-snapshot` errors since 2026-09-17. New path: **spec written, first phone run pending.** | **Open Claude on your iPhone, say "update my health stats in Notion", and approve the Apple Health read + Notion write prompts once.** | L2 n8n evaluated for the Notion→doc leg 2026-09-28, not chosen — last hop is a Claude-only write_db call; see routing row 10. |

## Everything else

| System | Path | Status today | What Steven must do | Trust |
|---|---|---|---|---|
| You.com | connector + `you-*` tools | **RETIRED 2026-09-22** — replaced by the Claude subscription. Free tier returned "limit exceeded" 08:40 UTC 2026-09-22. *Measured 2026-09-24:* the connector still answers, and its balance reads **0 credits** — connected but unfunded, so any paid search fails (NEEDS-STEVEN 56). | Nothing. Research now runs on Claude WebSearch/WebFetch on Steven's subscription (Perplexity removed 2026-10-05). | n/a |
| Notion | connector (connected + enabled) | Working. `brain-deck-sync` ok; Second Brain 68 rows. Will also host the Health Log. | Nothing. | L2 |
| **Google Drive** | **none — there is no Drive connector, no MCP server, no CLI and no key file anywhere in this stack** | **NEVER ADDRESSED** (found by the V1 reconciliation, 2026-09-22). Steven asked for the second brain to be optimised "with Notion **+ Drive**". Notion was wired; Drive never was. Two tasks nevertheless *claim* to read a Drive "Second Brain" folder — `brain-learn-daily` and `openjarvis` — and the knowledge-fabric count for that store has read **0 files** every time it has been sampled. Composio carries googledocs, googlesheets and googletasks but **no googledrive**. So the deck counts a store nothing can reach. *Updated 2026-09-24 (R7):* a Composio `googledrive` connection is now **initiated**, awaiting Steven's sign-in (NEEDS-STEVEN 55) — still no account, so the 0-file count is still a store nothing reaches. | **Decide it: either wire it (spec in `integrations/google-drive-brain.md`) or drop the Drive store from the fabric counts.** Do not leave a 0-file store on the deck implying a working feed. | n/a |
| Composio | connected apps: api_ninjas, discord, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai (no longer used — Perplexity removed 2026-10-05), youtube, zoho, and **highlevel (GoHighLevel), googledrive and discordbot — all three initiated, no account, awaiting Steven's sign-in** (fresh links generated 2026-09-24 ~15:57 UTC; each expires in ten minutes — NEEDS-STEVEN 55). The `discord` entry is Steven's user OAuth, not the bot. The retired legacy-CRM connection was **removed 2026-09-24** (`routines/fub-removal-2026-09-24.md`). **No Lofty, ShowingTime, Showami or homes.com toolkit exists** — and Composio's tool search does not say so: asked for Lofty or ShowingTime it offered the retired CRM's tools, asked for homes.com a Zillow/Redfin scraper. Never accept a tool whose name is not the system you asked for. | Working as a transport. The failures above are on the far side of it, not in Composio. | Sign in to GoHighLevel via the Composio link, and say what it is for. | L1 |
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
| `apple-health` MCP / `apple-health-xml` / `health-export` | local MCP servers | Connected as servers; the **data behind them is stale** because the ingest daemon is down. Connected server ≠ fresh data. | Covered by the Apple Health row above. | L1 |
| **WhatsApp → Vanessa** | OpenWA on the Mac (loopback only, Docker) + `integrations/openwa/vanessa-bridge.py` (LaunchAgent; polls the self-chat every 20 s with Vanessa's chat-fenced key; answers via `claude -p --agent vanessa-orchestrator`, read-only tools) — `integrations/openwa/README.md` Steps 1–8 | **Built and tested 2026-09-28 (18 tests against a stand-in OpenWA + Claude) · not yet run on a Mac.** Replaces the 2026-09-22 whatsapp-cli design (desktop-DB reads needed Full Disk Access; sends needed a GUI session) | Steven: `bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya` on the Mac — link the phone (QR or 8-character code), then the bridge installs itself · `docs/NEEDS-STEVEN.md` item 78 | L1 → L2 after 7 clean days |
| **OmniRoute failover** (`claude-auto`) | `integrations/omniroute-failover/` — `claude-auto.sh` launcher + `probe.sh`; OmniRoute 3.8.50 on loopback `:20128`, free-tier combo `auto/coding:free` | **Design written 2026-09-22.** The Mac already runs an older `claude-auto` with an unverified guard hook (F-E8-60) — this replaces it. Sandbox: `npm install omniroute` 3.8.50 exit 0, `--version` ok. Scripts **executed in the sandbox** (H3 2026-09-22, then re-run independently by H3b against the pre-fix copies restored from git, so every claim here has a before as well as an after) against a stub `claude`, a dead `:20128` and a live stand-in `/healthz`, not on the Mac. The PII gate now **fails closed**: while on free providers every invocation defers (exit 75) unless its `--task` name is on the free-OK allow-list or it carries an explicit `--no-pii`, in any argument order; client-data name patterns (`lofty-*`, `*crm*`, `*inbox*`, `health-*`, …), matched case-insensitively, win over both. F-V2-07/08/09/10/11/12/13/14/15/18 fixed, plus F-H3b-01 (a client task renamed in different case evaded the deny-list); the switch-back probe escalates to `state/NEEDS-STEVEN` after four inconclusive runs instead of stranding. One residual is recorded and deliberately unfixed (F-H3b-02): a task that fails *and* whose own output mentions a usage limit still flips the route to free-fallback — it cannot leak, since the gate is closed on that route, and the probe restores the subscription within 15 minutes. | **Put `OMNIROUTE_API_KEY` in `~/.config/omniroute/.env` (chmod 600), add free provider keys with `omniroute providers add … --credential-env`, copy the two scripts to `~/.local/bin`, load the probe LaunchAgent, run the PII canary with the security steward.** | L1 |

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
