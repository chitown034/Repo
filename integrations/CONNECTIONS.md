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
| **Zoho CRM** (mortgage system of record — Steven, restated 2026-09-24) | Composio toolkit `zoho`, account `zoho_talite-spike` | Connection **ACTIVE**, but every CRM call returns **HTTP 403 NO_PERMISSION** — reproduced 2026-09-22 08:17 UTC and **re-tested 2026-09-24** (`ZOHO_GET_ZOHO_RECORDS`, Leads, one record, status field only). Steven reports having an API key; **the key is not the blocker** — the profile permission refuses every key and token for that user until it is switched on. | **In Zoho CRM → Setup → Security Control → Profiles → the connected user's profile → Developer Permissions, enable "Zoho CRM API Access".** Then re-authorise the Composio connection once. | L1 → L2 once unblocked |
| **CLI-Anything** (homes.com, ShowingTime, Showami, SkySlope, zipForms — plus Lofty and Zoho REST) | `cli-anything-hub` + Claude Code plugin; `cli-anything-browser` (**vendored in this repo**, not on PyPI — F-H1-02) driving DOMShell for the sites with no API; REST for Lofty and Zoho | **Not installed on the Mac** — and no longer generated: **seven read-only harness packages are pre-built** in `integrations/cli-anything-harnesses/` and install **browser first, then the seven, into one venv** — not `pip install .` per package: the three DOMShell sites (homes, ShowingTime, Showami) pin `cli-anything-browser>=1.0.0`, which is not on PyPI, so installing one of them on its own exits 1 (built and unit-tested offline 2026-09-22, F-H2b-01…13; standalone-install measurement F-P4-03). Hub and plugin are one scripted step (`MAC-SETUP.sh --only cli-anything`); the vendored browser engine and all seven site packages are another (`--only cli-anything-harnesses`, one `uv pip install` into `~/Applications/cli-anything-harnesses/.venv`, browser first, symlinked into `~/.local/bin`); the earlier claim that the install is interactive was wrong (F-S1-18), and so is the claim that each wrapper must be generated one per site (F-H1-10). **Nothing is verified:** all 18 browser recipes ship `verified: false`, no site has ever been reached, and not one of the seven has ever made a live call (F-H1-01, F-H2b-13). SkySlope and zipForms refuse every live command, exit 3, until `CLI_ANYTHING_ECC_REVIEWED_AT` holds a real sign-off date. Hub registry has no CRM or real-estate entries (README checked 2026-09-22; `clianything.cc` egress-blocked). | **Run `./MAC-SETUP.sh` — hub, plugin, the vendored browser harness and the seven packages all install non-interactively — put `export CLI_HUB_NO_ANALYTICS=1` in your shell profile **and** the runner task's env (the script only covers its own run), install the DOMShell Chrome extension and sign in by hand, then run `--discover` once per recipe and edit your `paths.json` until the values match the screen. There is nothing to generate.** | L1, read-only |
| **Apple Health** | New: Claude iOS → Notion "Health Log" → `health-notion-sync` → `appleHealth` doc. Old: Health Auto Export → daemon :8765 → DuckDB → `apple-health` MCP | Old pipeline **down** — daemon not responding, doc 9 days stale (`last_received 2026-09-13 14:30:40`), `r8-apple-health-snapshot` errors since 2026-09-17. New path: **spec written, first phone run pending.** | **Open Claude on your iPhone, say "update my health stats in Notion", and approve the Apple Health read + Notion write prompts once.** | L2 |

## Everything else

| System | Path | Status today | What Steven must do | Trust |
|---|---|---|---|---|
| You.com | connector + `you-*` tools | **RETIRED 2026-09-22** — replaced by the Claude subscription. Free tier returned "limit exceeded" 08:40 UTC 2026-09-22. | Nothing. Research now runs on WebSearch/WebFetch in scheduled tasks and Perplexity for depth. | n/a |
| Notion | connector (connected + enabled) | Working. `brain-deck-sync` ok; Second Brain 68 rows. Will also host the Health Log. | Nothing. | L2 |
| **Google Drive** | **none — there is no Drive connector, no MCP server, no CLI and no key file anywhere in this stack** | **NEVER ADDRESSED** (found by the V1 reconciliation, 2026-09-22). Steven asked for the second brain to be optimised "with Notion **+ Drive**". Notion was wired; Drive never was. Two tasks nevertheless *claim* to read a Drive "Second Brain" folder — `brain-learn-daily` and `openjarvis` — and the knowledge-fabric count for that store has read **0 files** every time it has been sampled. Composio carries googledocs, googlesheets and googletasks but **no googledrive**. So the deck counts a store nothing can reach. | **Decide it: either wire it (spec in `integrations/google-drive-brain.md`) or drop the Drive store from the fabric counts.** Do not leave a 0-file store on the deck implying a working feed. | n/a |
| Composio | connected apps: api_ninjas, discord, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho, and **highlevel (GoHighLevel) — initiated 2026-09-24, awaiting Steven's sign-in**. The retired legacy-CRM connection was **removed 2026-09-24** (`routines/fub-removal-2026-09-24.md`). **No Lofty, ShowingTime, Showami or homes.com toolkit exists** — and Composio's tool search does not say so: asked for Lofty or ShowingTime it offered the retired CRM's tools, asked for homes.com a Zillow/Redfin scraper. Never accept a tool whose name is not the system you asked for. | Working as a transport. The failures above are on the far side of it, not in Composio. | Sign in to GoHighLevel via the Composio link, and say what it is for. | L1 |
| Google Calendar | connector | Working — `calendar-daily-sync` ok 2026-09-21. | Nothing. | L2 |
| Gmail | connector + Composio | Working — `r12-inbox-triage` ok; drafts only, never sends. | Nothing. | L2 |
| Strava | connector | Connected. The `stravaSnapshot` doc was repaired to `{v:…}` on 2026-09-22, but the Mac task `strava-daily-sync` (`20 5 * * *` PT = 12:20 UTC) still writes it **bare** and re-broke it at 12:32 UTC that day — it will keep overwriting the repair until its prompt is fixed on the Mac (P1, open). | Nothing — engineering fix. | L1 |
| Slack | connector | Connected. Not load-bearing for any task. | Nothing. | L1 |
| Inkbox | connector | Working — iMessage +1 650-484-9720; `vanessa-imessage-inbox` ok. **Discord `#vanessa` is not live**: `agentInbox` (its own stamp 2026-09-22 13:44 UTC) says "awaiting bot token" and has no channel id — corrected 2026-09-24, this row used to call it working. **Steven ↔ Vanessa only, never clients:** the identity is Inkbox's (`jasmine`), not Steven's, so nothing a client could take as coming from a licensed originator goes out on it (F-E8-62). | Discord bot token (Steven). The allow-list's unused second number is his to trim on the Mac. | L2 |
| Perplexity | Composio `perplexityai` + local `perplexity` MCP | Working — carries the research load since You.com retired. | Nothing. | L1 |
| Context7 | connector | Connected. Docs lookup only. | Nothing. | L1 |
| Canva | connector | **needs_reconnect.** | Reconnect it in claude.ai → Settings → Connectors if he still wants it; otherwise drop it. | n/a |
| Microsoft 365 | connector | **Not connected.** | Nothing unless he wants it. | n/a |
| BlackRock Advisor Center | connector | **Not connected.** | Nothing. | n/a |
| Health Data Avatar (HDA) | connector | **Not connected.** Not needed by the Notion health recipe. | Nothing. | n/a |
| PlayMCP | connector | **connect_incomplete.** | Finish or remove it. | n/a |
| Eromify | connector | Connected. Out of scope for the business stack. | Nothing. | n/a |
| OpenRouter | local MCP | Connected, **no API key** — council outside-model seats are unpriced and unused. Do not present them as available. | Add a key only if he wants outside models; otherwise leave it. | n/a |
| Plaid | — | **No keys.** `r7-plaid-balances` runs and reports nothing; the deck's balances are manual. | Add Plaid keys, or accept manual balances. | n/a |
| Orca Computer Use v1.4.203 | Stably AI desktop app (`com.stablyai.orca`) | **Reported installed on the Mac — unverified from the cloud** (no Mac here and no inventory artefact in this repo attests to it; confirm with `./mac-verify.sh`, F-V2-23), and in any case a standalone computer-use app — **not integrated with Claude Code.** The stablyai/orca parallel-worktree IDE integration is not done. | Nothing — proposal, vetted by the CTO Innovator. | n/a |
| `apple-health` MCP / `apple-health-xml` / `health-export` | local MCP servers | Connected as servers; the **data behind them is stale** because the ingest daemon is down. Connected server ≠ fresh data. | Covered by the Apple Health row above. | L1 |
| **WhatsApp → Vanessa** | `whatsapp-cli` (marcelrgberger, MIT; reads the WhatsApp desktop app's local DB on the Mac, sends through the app) + `vanessa-whatsapp-inbox` task — `integrations/mac-task-specs.md` §5, install `MAC-INSTALL-comms-data.md` §1 | **Spec written 2026-09-22 · Mac install pending · not yet live.** Sandbox: installs and runs its help on Python 3.12 (exit 0), SyntaxError on 3.11; reads are headless-safe, sends need a GUI session. Second client evaluated, `normen/whatscli` (builds, exit 0): no non-interactive mode by its own README — rejected. | **Decided 2026-09-23: his OWN number, message-yourself thread — build §5a, not §5.** Link it in the WhatsApp desktop app on the Mac, audit the existing Full Disk Access list before granting FDA + Accessibility to the runner's shell, run `MAC-INSTALL-comms-data.md` §1, then `integrations/whatsapp-selfchat-setup.sh "<his number>"` and run the task once by hand. | L1 → L2 after 7 clean runs |
| **OmniRoute failover** (`claude-auto`) | `integrations/omniroute-failover/` — `claude-auto.sh` launcher + `probe.sh`; OmniRoute 3.8.50 on loopback `:20128`, free-tier combo `auto/coding:free` | **Design written 2026-09-22.** The Mac already runs an older `claude-auto` with an unverified guard hook (F-E8-60) — this replaces it. Sandbox: `npm install omniroute` 3.8.50 exit 0, `--version` ok. Scripts **executed in the sandbox** (H3 2026-09-22, then re-run independently by H3b against the pre-fix copies restored from git, so every claim here has a before as well as an after) against a stub `claude`, a dead `:20128` and a live stand-in `/healthz`, not on the Mac. The PII gate now **fails closed**: while on free providers every invocation defers (exit 75) unless its `--task` name is on the free-OK allow-list or it carries an explicit `--no-pii`, in any argument order; client-data name patterns (`lofty-*`, `*crm*`, `*inbox*`, `health-*`, …), matched case-insensitively, win over both. F-V2-07/08/09/10/11/12/13/14/15/18 fixed, plus F-H3b-01 (a client task renamed in different case evaded the deny-list); the switch-back probe escalates to `state/NEEDS-STEVEN` after four inconclusive runs instead of stranding. One residual is recorded and deliberately unfixed (F-H3b-02): a task that fails *and* whose own output mentions a usage limit still flips the route to free-fallback — it cannot leak, since the gate is closed on that route, and the probe restores the subscription within 15 minutes. | **Put `OMNIROUTE_API_KEY` in `~/.config/omniroute/.env` (chmod 600), add free provider keys with `omniroute providers add … --credential-env`, copy the two scripts to `~/.local/bin`, load the probe LaunchAgent, run the PII canary with the security steward.** | L1 |

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
