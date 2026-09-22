# MAC-INSTALL — communications, data & model-routing tools (FR5b)

**Written 2026-09-22 in the cloud sandbox. Nothing here is installed on the Mac yet.** Companion to
`MAC-INSTALL.md` (the brain tree) and `MAC-INSTALL-tooling.md`. Every command below was run here in a
throwaway prefix — `/tmp/fr5b-venv` (Python 3.11), `/tmp/fr5b-venv312` (3.12), `/tmp/fr5b-npm`,
`/tmp/fr5b-go` — and the result sits next to it. Keys are **named, never valued**. Binding rules for every
section: the `CLAUDE.md` HALT list — client PII never leaves the local model or the Claude subscription,
and nothing contacts a client without Steven. Read a section, do its steps, run its check, stop.

## Summary
| # | Tool | Install method | Sandbox verified? | Keys needed (names only) | Use for Steven |
|---|---|---|---|---|---|
| 1 | **WhatsApp → Vanessa: `marcelrgberger/whatsapp-cli`** (recommended) | `git clone` + `uv venv --python 3.12` + `uv pip install ./agent-harness`; CLI only, plugin not installed | **Yes** — installs, `--help` exit 0, honest JSON error off-macOS (Python 3.12). **SyntaxError on 3.11** | none — the WhatsApp desktop app's own login; macOS Full Disk Access + Accessibility | Third chat channel to Vanessa, **dedicated number only**. Task spec `integrations/mac-task-specs.md` §5 |
| 1b | `normen/whatscli` (evaluated, **rejected**) | `brew install normen/tap/whatscli` or `go install github.com/normen/whatscli@latest` | **Yes** — `go install` exit 0, 30 MB binary built | none — QR-paired session file | None for automation: TUI only; its README: "No automation of messages, no sending of messages through shell commands" |
| 2 | **OmniRoute failover (`claude-auto`)** | `npm install -g omniroute` + `integrations/omniroute-failover/` | **Partly** — 3.8.50 installs, `omniroute --version` ok; scripts `bash -n` only (no Mac, no login) | `OMNIROUTE_API_KEY` (loopback key) · `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `BYTEZ_API_KEY` → OmniRoute's store | Non-client work keeps running when the subscription is limited; client work waits or runs on Jarvis |
| 3a | **Scrapling 0.4.15** | `pip install "scrapling[fetchers]"` + `scrapling install` | **Yes** — install exit 0; offline parse example ran; live fetch blocked by the sandbox proxy (403) | none | Public builder-incentive pages, public listing counts — **after Alexandra's terms check** |
| 3b | **Scrapegraph-ai 2.2.4** | Python ≥ 3.12: `pip install scrapegraphai` + `playwright install`; LLM = local Ollama `llama3.1:8b` (Jarvis) | **Yes on 3.12** — install exit 0, `SmartScraperGraph` constructs with `ChatOllama`; run needs Playwright browsers + Ollama (the Mac has both). On 3.11 PyPI serves the broken 1.76.0 | none with Ollama (`SGAI_API_KEY` only for the paid cloud service) | Same public pages, LLM-extracted to JSON; the local model keeps it PII-safe |
| 4 | Higgsfield API via `framepipe-dev/media-inference-worker` | `pip install requests` + `python generate.py <model> "<prompt>"` | **Read only, not run** — running it would use someone else's committed credential | `HF_API_KEY_ID`, `HF_API_KEY_SECRET` (Steven's own, if ever) | **None today** for Sofia's lane. The repo ships a live-looking third-party key — never use it |
| 5 | Apple Health: `Rachnog/alex-honchar-claude-for-life` | Claude plugin marketplace (UI) | **Read only** — nothing to install | none (Oura / Garmin / Withings MCPs) | Complementary reference only; it never reads Apple Health — `integrations/apple-health-dashboard.md` |
| 6 | `tashfeenahmed/freellmapi` (evaluated, **declined**) | Docker Compose on `:3001`, or a desktop app; keys go in its own encrypted store via its dashboard | **Yes** — repo cloned and read 2026-09-22 (V1); live, MIT, active | none for us — it holds provider keys itself | **None.** It is a *second* free-tier aggregator, not a key source — OmniRoute already holds that seat. Its public catalogue (`freellmapi.co/models`) is used as **reference only**. §6 below |

## 1. WhatsApp for Vanessa — `whatsapp-cli` (marcelrgberger) vs `whatscli` (normen)
**What/why.** Steven wants WhatsApp beside the iMessage path (`REMOTE-ACCESS.md`). The deciding question was
automation: an unattended `claude-runner` task must read new messages and send a reply without a person at
the keyboard. Both repos were cloned and read in full (2026-09-22).
- `whatsapp-cli` — MIT, v1.0.0, Python, a Claude Code plugin whose `agent-harness` CLI reads the **WhatsApp
  desktop app's** own database (`~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite`,
  opened `mode=ro`) and sends by opening `whatsapp://send?phone=…&text=…` in the app and pressing Return through
  System Events. Scriptable: `--json` on every verb, `monitor since <ts> [--chat]`, `message get --after`,
  `message send`, `chat find <phone>`, `session status`. No protocol emulation, no token file.
- `whatscli` — MIT, Go, a `tview` terminal UI on `go.mau.fi/whatsmeow` (a linked-device client). `main.go`
  parses no flags; the README states "No automation of messages, no sending of messages through shell commands".
  Nothing a runner task can call. It also *emulates a device* on the WhatsApp Web protocol — the class of client
  the deck's own note warns gets numbers banned.

**Recommendation: `whatsapp-cli`.** It is the only one a task can drive, and it drives the official app instead
of impersonating one. Its costs are real and stated: macOS only, the WhatsApp desktop app must stay logged in,
and **sends need a GUI session** (Mac awake, user logged in, Accessibility granted) while reads work headless.

**Trap — the PyPI name is somebody else's package (found 2026-09-22, P6).** `pip install whatsapp-cli`
installs **`yausername/whatsapp-cli` 0.1.3** ("CLI for whatsapp", MIT), an unrelated project — not
marcelrgberger's 1.0.0. This is the same class of trap as Agent Reach (`MAC-INSTALL-tooling.md` §11), and it
had not been written down. The install below is safe because it installs **from the clone's `agent-harness`
directory**, never from PyPI by name; `MAC-SETUP.sh` does the same (`uv pip install … "$WA_DIR/agent-harness"`).
Never "simplify" it to `pip install whatsapp-cli`.

**Install (Steven, on the Mac) — verified form**
```bash
brew install uv                                   # or python@3.12; the code needs 3.12, README's "3.10+" is wrong
git clone https://github.com/marcelrgberger/whatsapp-cli ~/Applications/whatsapp-cli
uv venv --python 3.12 ~/Applications/whatsapp-cli/.venv
uv pip install --python ~/Applications/whatsapp-cli/.venv/bin/python ~/Applications/whatsapp-cli/agent-harness
ln -sf ~/Applications/whatsapp-cli/.venv/bin/whatsapp-cli ~/.local/bin/whatsapp-cli
```
Do **not** run `claude plugins install whatsapp-cli` in the business profile: the plugin adds a `/whatsapp` skill
that lets *any* Claude Code session on that Mac read and send WhatsApp. The task needs only the CLI.
Sandbox record: `uv venv --python 3.12` + `uv pip install` → exit 0 (whatsapp-cli 1.0.0, click, prompt-toolkit);
`whatsapp-cli --help` → exit 0; `whatsapp-cli --json chat list --limit 3` → `{"error": "Failed to list chats:
WhatsApp database not found at …"}` exit 0 (correct off-macOS). On Python 3.11: `SyntaxError: f-string expression
part cannot include a backslash` (`whatsapp_cli.py:1232`) — hence the 3.12 pin.
`whatscli` record: `GOPATH=/tmp/fr5b-go go install github.com/normen/whatscli@latest` → exit 0, binary built —
documented for completeness; not the channel.

**Post-install check (Mac, screen unlocked):** `whatsapp-cli --json session status` → ok · `whatsapp-cli --json
chat list --limit 3` → rows · `whatsapp-cli --json chat find <Steven's own number>` → the JID that becomes
`allowFrom` in `whatsappInboxState` · `whatsapp-cli message send "<that chat>" "test from Vanessa"` → arrives on
the phone. Then create `vanessa-whatsapp-inbox` **disabled** per `integrations/mac-task-specs.md` §5 and run it
once by hand. macOS permissions: **Full Disk Access** for the shell that runs it (Terminal and the runner's launchd
context) and **Accessibility** for `osascript`/System Events.

**Security (Elena's lens).** There is no separate session token here — the linked desktop app *is* full-account
access, and `ChatStorage.sqlite` is the entire message history in plaintext SQLite readable by any process with
Full Disk Access on that Mac, including the OSINT tooling F-E8-61 flagged. Therefore: **(1) a dedicated WhatsApp
number** (second SIM/eSIM or prepaid line) linked in the desktop app — never Steven's client-facing WhatsApp; if
his own account is already linked on that Mac, use a **dedicated macOS user profile** for the second WhatsApp
install and let the task read that profile's container. **(2) Local only** — the DB is read on the Mac, message
text goes only into the same subscription path iMessage uses, no cloud routine ever touches it. **(3) Never
client-facing** — the task answers one allow-listed sender (Steven) and logs everything else as ignored; no
group chats, no `monitor auto-reply` (it shells out to `claude -p` on its own, outside the handler and HALT list),
no `export` into the vault, brain, vector index or knowledge graph. **(4) Blast radius** — if WhatsApp ever
restricts the number for automated sending, only the dedicated line is lost. **(5)** The deck row says exactly
"spec written 2026-09-22 · Mac install pending · not yet live" until the first manual run exists.

**"Reach Vanessa" row (added to the Command Deck copy and to `REMOTE-ACCESS.md`):** *WhatsApp — via
`whatsapp-cli` reading the WhatsApp desktop app on this Mac; `vanessa-whatsapp-inbox` would poll every 10 min under
claude-runner; dedicated number only, never a client-facing one → spec written 2026-09-22 · Mac install pending ·
not yet live.* Runtime harness on the edited deck: **0 exceptions, 0 safeRun failures, 337 containers rendered**;
the two `missingIds` it lists (`vanessaMicBtn`, `steveMicBtn`) are identical on the pre-edit copy.

## 2. OmniRoute failover — `claude-auto.sh` + `probe.sh`
**What/why.** Steven: *"Ensure model switch to the OmniRoute free LLM models when subscription runs out and then
switches back to subscription model when subscription refreshes."* The Mac already carries an older `claude-auto`
(subscription first → OmniRoute `:20128` free-only combo → back) with a client-data guard hook nobody has tested
(F-E8-60). The full design — detection signal, switch-over, probe, PII policy, key sources, canary — is
`integrations/omniroute-failover/README.md`; the scripts sit beside it. Summary: the launcher publishes a mode
(`subscription` / `free-fallback` / `local-only`) in `~/.config/omniroute/state/mode` and as `VANESSA_ROUTE_MODE`
/ `VANESSA_PII_OK`; a headless run that hits the usage limit flips the mode and exits 75 so the runner retries on
the new route; `probe.sh` (LaunchAgent, 15 min) restores the subscription with a one-turn, no-tool probe.
**Client-data tasks are deferred while on free providers** — or pinned to Jarvis through OmniRoute once
`OMNIROUTE_LOCAL_MODEL` names it. Free tiers are paid for with prompts; the local model is the only PII-safe fallback.

**Verified here:** `npm --prefix /tmp/fr5b-npm install omniroute` → 3.8.50, MIT, 1,140 packages, exit 0;
`omniroute --version` → `3.8.50`; catalog carries provider ids `openrouter` (+`openrouter-free`), `nvidia`,
`nvidia-nim`, `bytez`; `auto/<category>:free` tier, `/healthz`, `providers add … --credential-env` and the
Claude Code root URL **without `/v1`** are all in its docs. Both scripts pass `bash -n`; **not executed** (no Mac).
**Keys (names):** `OMNIROUTE_API_KEY` (OmniRoute's own loopback key) and the provider keys `OPENROUTER_API_KEY`,
`NVIDIA_API_KEY`, `BYTEZ_API_KEY`, all as `NAME=value` lines in `~/.config/omniroute/.env` (`chmod 600`), loaded
into OmniRoute's encrypted store with `omniroute providers add <id> --credential-env <NAME>` — never typed into a
prompt. Note: OmniRoute does not read provider keys from the environment by itself (grep of the 3.8.50 source).
**Post-install check:** `claude-auto --status` → `mode=subscription`; `claude-auto --force free -p 'say hi'
--output-format json` answers from OmniRoute; `probe.sh --now` restores; then the **PII canary** in the README
with the security steward — both halves must pass before the runner is pointed at `claude-auto`.
**Security note:** loopback only (`127.0.0.1:20128`, dashboard password set, `REQUIRE_API_KEY` on); the
subscription credential is unset in fallback so it can never reach the proxy; do not add the Claude subscription as
an OmniRoute OAuth provider on the business Mac; the launcher-level gate is a second layer beside the existing
guard hook, not a replacement for the HALT list.

## 3. Scrapling and Scrapegraph-ai — public pages only, terms first
**What/why.** Two scrapers for *public* real-estate data: a builder's "current incentives" page for the
`incentives-daily-scan` lane, a public listing count for a market card. **Terms gate, not optional:** homes.com,
SkySlope and zipForms (and most MLS-fed sites) carry terms that may forbid automated access, and SkySlope/zipForms
hold legally binding documents. **Alexandra (Compliance) confirms the target's terms and robots.txt in writing
before any wrapper is enabled**, per `cli-anything-connectors`. Never a login-walled page, never a client record.
```bash
uv venv --python 3.12 ~/Applications/scrapers/.venv && . ~/Applications/scrapers/.venv/bin/activate
pip install "scrapling[fetchers]"        # bare `pip install scrapling` omits curl_cffi — Fetcher then fails to import (verified)
scrapling install                        # browser deps for StealthyFetcher/DynamicFetcher (not run here)
pip install scrapegraphai && playwright install     # 2.2.4 needs Python >= 3.12 (PyPI `requires_python`)
```
Sandbox record — Scrapling: `pip install scrapling` 0.4.15 exit 0, but `from scrapling.fetchers import Fetcher` →
`ModuleNotFoundError: curl_cffi`; `pip install "scrapling[fetchers]"` → curl_cffi 0.16.3, exit 0; CLI present
(`extract`, `install`, `mcp`, `shell`). Live fetch executed (github.com → HTTP 403 from the proxy; lennar.com and
khov.com → `CONNECT tunnel failed, response 403` = sandbox egress), so the worked example below was proven on a
local fixture: two incentives and a listing count extracted exactly. Scrapegraph-ai: on 3.11, PyPI resolves 1.76.0
and `import` fails (`ChatOllama` gone from langchain-community 0.4.2, which 1.76.0 requires) — **broken on a fresh
3.11 install today**; on a clean 3.12 venv `pip install scrapegraphai` → 2.2.4 exit 0, `SmartScraperGraph`
constructs with `ChatOllama`, `run()` stops at the missing Playwright browser (expected here).
```python
from scrapling.fetchers import Fetcher                       # Scrapling: builder incentives, public page
page = Fetcher.get(URL, timeout=25)                          # add stealthy_headers/StealthyFetcher only if Alexandra cleared the site
rows = [{"title": p.css("h3::text").get(), "detail": p.css(".detail::text").get(),
         "expires": p.css(".expires::text").get()} for p in page.css(".promo")]
count = len(page.css("li.home"))                             # public listing count
```
```python
from scrapegraphai.graphs import SmartScraperGraph            # Scrapegraph-ai: same page, local model only
cfg = {"llm": {"model": "ollama/llama3.1:8b", "model_tokens": 8192, "format": "json",
               "base_url": "http://localhost:11434"}, "headless": True, "verbose": False}
g = SmartScraperGraph(prompt="List every incentive on this page as {title, detail, expires}.", source=URL, config=cfg)
print(g.run())
```
**Keys:** none. `SGAI_API_KEY` exists only for ScrapeGraph's paid cloud — not used; a cloud extractor would ship
page text off the Mac. **Post-install check:** the Scrapling snippet against a page Alexandra cleared returns rows;
`ollama list` shows `llama3.1:8b`; the Scrapegraph snippet returns JSON. **Security note:** results land in a deck
doc with `source`, `fetchedAt` and the URL; polite rate (one request per page per run); robots.txt honoured; no
proxies/rotation on business targets; anything that starts to look like scraping a client's data stops.

## 4. Higgsfield API + `framepipe-dev/media-inference-worker`
**What.** `generate.py` (~60 lines, `requests` only; last commit 2026-08-26) POSTs to
`https://platform.higgsfield.ai/<vendor>/<model>/text-to-image|text-to-video` with
`Authorization: Key <HF_API_KEY_ID>:<HF_API_KEY_SECRET>` and polls `status_url`. `RUNBOOK.md` lists the routes:
Qwen-Image-3, Nano Banana 2, GPT-Image-2, MiniMax H3, LTX-2.5, Kling 3.0, Veo 3.1 — image and video generation.
Higgsfield is a hosted media-generation API; `docs.higgsfield.ai` is egress-blocked, so pricing and terms were not read.
**Keys (names):** `HF_API_KEY_ID`, `HF_API_KEY_SECRET`. **Finding:** the repository **commits a `.env` holding both
values** ("service account was still active when I copied this… no idea… when the key will be rotated"). That is
someone else's credential: never use it, never clone the repo onto the Mac with it, never reference it in a task —
it was deleted from the sandbox clone after listing the names. **Install (only if Steven ever funds his own
account):** `pip install requests`, put his own two values in `~/.config/higgsfield/.env`, run `generate.py`.
**Verdict for Sofia's lane, one line: no use today** — the deck already has Canva (needs reconnect) and Magica,
Higgsfield needs a paid account Steven does not have, and the worker adds nothing a curl would not.

**Correction, 2026-09-22 (V1): the refusal is of the REPO, not of the vendor.** Steven asked for the *Higgsfield
API*, which is a separate thing from the test client he named it through. Leaving the whole request refused by
association was wrong, because the API is an ordinary hosted HTTPS endpoint: the safe path is Steven's own
account, his own two values in `~/.config/higgsfield/.env`, and a few lines of `requests`/`curl` written here —
`POST https://platform.higgsfield.ai/<vendor>/<model>/text-to-image|text-to-video`, header
`Authorization: Key <HF_API_KEY_ID>:<HF_API_KEY_SECRET>`, then poll `status_url`. Nothing about that requires
cloning anybody's repository. `MAC-SETUP.sh --only higgsfield` now creates that key file (**names only**) and
calls nothing; without `--only` it prints the no-use-today verdict. The repo itself stays REFUSED and the
script's runtime guard still aborts on it. The business verdict above is unchanged — this only means the
request has an answer instead of a silence, and the spend decision is Steven's.

## 6. `tashfeenahmed/freellmapi` — evaluated, declined (was never written down until now)

Steven listed this beside the free-key sources. It was read in 2026-09-22 and the verdict was recorded only in a
table row inside `integrations/omniroute-failover/README.md`, where nobody could find it — so it looked dropped.
Re-verified by cloning it (V1, 2026-09-22): **live, MIT, actively maintained.** What it is: a self-hosted
aggregator that puts ~34 providers' free tiers behind one OpenAI-compatible `/v1` endpoint, with its own router,
failover, per-key quota tracking and an **encrypted key store fed from its own dashboard** on `:3001`. Desktop
apps for macOS/Windows; USD 19/yr buys the live catalogue (the free install gets a 30-day-old snapshot).

**Declined, and why:** it is *not a key source* — it is a competitor to OmniRoute, which already holds that seat
in `integrations/omniroute-failover/`. Running both would mean **two routers and two egress surfaces to audit for
client data**, against one PII canary. It also does not cover `bytez`, one of the three sources Steven named.
**What is kept:** its public catalogue page `freellmapi.co/models` is adopted as the live replacement for the
dead `cheahjs` catalogue (§ below) — read-only reference, nothing installed. `MAC-SETUP.sh --only freellmapi`
now prints this reason rather than "unknown step".

## 5. Apple Health — `Rachnog/alex-honchar-claude-for-life`
Read in full. It is a Claude Code plugin marketplace of life-area skills, JSON schemas and cadence reviews whose
body data comes from **Oura, Garmin and Withings MCPs — it never touches Apple Health** (zero mentions of
HealthKit or Health Auto Export). Not a better path than phone → Notion Health Log → `appleHealth`. Complementary
only as a schema/review reference — recorded in `integrations/apple-health-dashboard.md` ("Alternative source").
No LICENSE file in the repo; ask before copying a schema. The `apple-health-notion` skill was not touched.

## Unreachable from the sandbox on 2026-09-22 (documented by name, not guessed)
`bytez.com`, `openrouter.ai`, `build.nvidia.com`, `support.claude.com`, `docs.higgsfield.ai` — EGRESS_BLOCKED by
the proxy. `github.com/cheahjs/free-llm-api-resources` — HTTP 404. The session's WebSearch budget was exhausted
before this task, so no page was substituted by search: OmniRoute's own audited `docs/reference/FREE_TIERS.md` is
the free-tier catalogue used instead. Live fetches from Python were blocked (403) — parsing was proven offline.

**Re-verified 2026-09-22 (V1), independently:** `github.com/cheahjs/free-llm-api-resources` is **still HTTP 404 —
the repository is gone**, not merely unreachable from here. It was wanted only as a catalogue of free tiers, and
that need is covered twice over: OmniRoute's `docs/reference/FREE_TIERS.md` (audited 2026-09-03, ships with the
tool) and `freellmapi.co/models` (live, §6). Nothing Steven asked for is lost with that repo.

**The three free-key sources — key NAMES are wired, values are not (verified, not assumed).** All three pages
stay egress-blocked, so no limit or price below is claimed from a page read. What matters is that Steven only has
to paste values, and that is in place: `MAC-SETUP.sh --only omniroute` creates `~/.config/omniroute/.env` at
`chmod 600` holding `OMNIROUTE_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `BYTEZ_API_KEY` as **empty
names**, prints which are still unset, and `mac-verify.sh` checks the same four by name. The `omniroute providers
add … --credential-env <NAME>` lines that load them are written out in `integrations/omniroute-failover/README.md`.
A dry run prints all four names; the file-writing code path was executed for real (V1, throwaway `HOME`) through
the identical `ensure_env_file` used by the `lofty` and `higgsfield` steps.

## What NOT to do
- Do not link Steven's client-facing WhatsApp to the Mac's desktop app for this. Dedicated number, always.
- Do not point the runner at `claude-auto` before the PII canary passes twice. Do not put a key in any `.md`.
- Do not enable a scraper against homes.com, SkySlope or zipForms without Alexandra's written terms check.
- Do not run `media-inference-worker` with the committed credential. Do not install the WhatsApp plugin's skill.
