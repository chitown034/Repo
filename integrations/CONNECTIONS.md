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
| **Zoho CRM** (mortgage system of record) | Composio toolkit `zoho`, account `zoho_talite-spike` | Connection **ACTIVE**, but every CRM call returns **HTTP 403 NO_PERMISSION `Crm_Implied_Api_Access`** (reproduced on `ZOHO_LIST_LEADS` and `ZOHO_LIST_DEALS`, 2026-09-22 08:17 UTC). Deck shows the **Sep 14 paste**, 48 leads. | **In Zoho CRM → Setup → Security Control → Profiles → the connected user's profile, enable "Zoho CRM API Access".** | L1 → L2 once unblocked |
| **CLI-Anything** (homes.com, SkySlope, zipForms) | `cli-anything-hub` + Claude Code plugin; DOMShell MCP browser path for sites with no API | **Not installed on the Mac**, but no longer manual: the hub, the plugin and the browser harness are all a scripted step (`MAC-SETUP.sh --only cli-anything`). The earlier claim that the install is interactive was wrong (F-S1-18). Hub registry has no CRM or real-estate entries (README checked 2026-09-22; `clianything.cc` egress-blocked). | **Run `./MAC-SETUP.sh` (hub, plugin and browser harness install non-interactively), install the DOMShell Chrome extension and sign in, then say "generate the homes.com wrapper" — generation is the only interactive step.** | L1, read-only |
| **Apple Health** | New: Claude iOS → Notion "Health Log" → `health-notion-sync` → `appleHealth` doc. Old: Health Auto Export → daemon :8765 → DuckDB → `apple-health` MCP | Old pipeline **down** — daemon not responding, doc 9 days stale (`last_received 2026-09-13 14:30:40`), `r8-apple-health-snapshot` errors since 2026-09-17. New path: **spec written, first phone run pending.** | **Open Claude on your iPhone, say "update my health stats in Notion", and approve the Apple Health read + Notion write prompts once.** | L2 |

## Everything else

| System | Path | Status today | What Steven must do | Trust |
|---|---|---|---|---|
| You.com | connector + `you-*` tools | **RETIRED 2026-09-22** — replaced by the Claude subscription. Free tier returned "limit exceeded" 08:40 UTC 2026-09-22. | Nothing. Research now runs on WebSearch/WebFetch in scheduled tasks and Perplexity for depth. | n/a |
| Notion | connector (connected + enabled) | Working. `brain-deck-sync` ok; Second Brain 68 rows. Will also host the Health Log. | Nothing. | L2 |
| **Google Drive** | **none — there is no Drive connector, no MCP server, no CLI and no key file anywhere in this stack** | **NEVER ADDRESSED** (found by the V1 reconciliation, 2026-09-22). Steven asked for the second brain to be optimised "with Notion **+ Drive**". Notion was wired; Drive never was. Two tasks nevertheless *claim* to read a Drive "Second Brain" folder — `brain-learn-daily` and `openjarvis` — and the knowledge-fabric count for that store has read **0 files** every time it has been sampled. Composio carries googledocs, googlesheets and googletasks but **no googledrive**. So the deck counts a store nothing can reach. | **Decide it: either wire it (spec in `integrations/google-drive-brain.md`) or drop the Drive store from the fabric counts.** Do not leave a 0-file store on the deck implying a working feed. | n/a |
| Composio | connected apps: api_ninjas, discord, github, gmail, googleads, googledocs, googlesheets, googletasks, perplexityai, youtube, zoho — plus one **retired legacy-CRM connection** Steven can delete at his convenience. **No Lofty toolkit exists in Composio** — Lofty runs over the Mac bridge, not Composio. | Working as a transport. The failures above are on the far side of it, not in Composio. | Nothing. | L1 |
| Google Calendar | connector | Working — `calendar-daily-sync` ok 2026-09-21. | Nothing. | L2 |
| Gmail | connector + Composio | Working — `r12-inbox-triage` ok; drafts only, never sends. | Nothing. | L2 |
| Strava | connector | Connected. The `stravaSnapshot` doc was repaired to `{v:…}` on 2026-09-22, but the Mac task `strava-daily-sync` (`20 5 * * *` PT = 12:20 UTC) still writes it **bare** and re-broke it at 12:32 UTC that day — it will keep overwriting the repair until its prompt is fixed on the Mac (P1, open). | Nothing — engineering fix. | L1 |
| Slack | connector | Connected. Not load-bearing for any task. | Nothing. | L1 |
| Inkbox | connector | Working — iMessage +1 650-484-9720 and Discord #vanessa; `vanessa-imessage-inbox` ok. | Nothing. | L2 |
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
| Orca Computer Use v1.4.203 | Stably AI desktop app (`com.stablyai.orca`) | **Installed on the Mac**, but a standalone computer-use app — **not integrated with Claude Code.** The stablyai/orca parallel-worktree IDE integration is not done. | Nothing — proposal, vetted by the CTO Innovator. | n/a |
| `apple-health` MCP / `apple-health-xml` / `health-export` | local MCP servers | Connected as servers; the **data behind them is stale** because the ingest daemon is down. Connected server ≠ fresh data. | Covered by the Apple Health row above. | L1 |
| **WhatsApp → Vanessa** | `whatsapp-cli` (marcelrgberger, MIT; reads the WhatsApp desktop app's local DB on the Mac, sends through the app) + `vanessa-whatsapp-inbox` task — `integrations/mac-task-specs.md` §5, install `MAC-INSTALL-comms-data.md` §1 | **Spec written 2026-09-22 · Mac install pending · not yet live.** Sandbox: installs and runs its help on Python 3.12 (exit 0), SyntaxError on 3.11; reads are headless-safe, sends need a GUI session. Second client evaluated, `normen/whatscli` (builds, exit 0): no non-interactive mode by its own README — rejected. | **Get a dedicated WhatsApp number (never the client-facing one), link it in the WhatsApp desktop app on the Mac, grant Full Disk Access + Accessibility to the runner's shell, run `MAC-INSTALL-comms-data.md` §1, then run the task once by hand.** | L1 → L2 after 7 clean runs |
| **OmniRoute failover** (`claude-auto`) | `integrations/omniroute-failover/` — `claude-auto.sh` launcher + `probe.sh`; OmniRoute 3.8.50 on loopback `:20128`, free-tier combo `auto/coding:free` | **Design written 2026-09-22.** The Mac already runs an older `claude-auto` with an unverified guard hook (F-E8-60) — this replaces it. Sandbox: `npm install omniroute` 3.8.50 exit 0, `--version` ok; scripts syntax-checked, not executed. Client-data tasks defer (exit 75) while on free providers. | **Put `OMNIROUTE_API_KEY` in `~/.config/omniroute/.env` (chmod 600), add free provider keys with `omniroute providers add … --credential-env`, copy the two scripts to `~/.local/bin`, load the probe LaunchAgent, run the PII canary with the security steward.** | L1 |

## Standing rules for every row here
1. **Self-test before you sync.** Each sync skill proves its connection on its own smallest call
   before writing anything. A failed self-test writes an honest status doc and stops.
2. **Never fabricate CRM or health data.** No lead, stage, deal, dollar or vital that did not come
   from a 200 response this run. An empty result is a fact worth reporting.
3. **The page displays the doc's own `source` string.** No hard-coded CRM name anywhere in the deck.
4. **Deck-only records survive every sync.** A lead carrying `local:true` that the CRM does not
   return is carried forward untouched.
5. **Credentials live in the Mac keychain or a `.env` the tool reads itself** — never in a prompt,
   a task definition, a skill file, a log, a finding or the deck.
6. **Read-only until Steven approves a write verb, per system, in writing.** Write-back to Lofty and
   Zoho is an L2 proposal, not built.
7. **Trust graduation is earned:** L1 → L2 → L3 only after 7 consecutive correct runs. Never
   straight to L3.

## Related files
- `.claude/skills/lofty-crm-sync/SKILL.md` · `.claude/skills/zoho-crm-sync/SKILL.md`
- `.claude/skills/apple-health-notion/SKILL.md` · `.claude/skills/cli-anything-connectors/SKILL.md`
- `integrations/apple-health-dashboard.md` · `integrations/mac-task-specs.md`
