# MAC-INSTALL-tooling — the tools Steven asked about, verified where the sandbox allowed

Companion to `MAC-INSTALL.md`. **Nothing here is required for the brain.** Written 2026-09-22 by FR5a from a
cloud sandbox that cannot touch the Mac: every "sandbox" result below is a throwaway-prefix install on
Linux (`/tmp/fr5a-venv` Python 3.11, `/tmp/fr5a-venv312` Python 3.12, `/tmp/fr5a-npm` Node 22, a fake
`$HOME` for `claude plugin` / `npx skills`). The Mac step is still yours. Keys are named, never valued —
they live in the keychain or a tool-owned `.env`, per `integrations/CONNECTIONS.md` rule 5. This runbook and
the vendored upstream skills exceed the tree's 200-line rule (`MAC-INSTALL.md` §7) on purpose: upstream text is
kept verbatim, and neither is a router leaf — expect that check to list them.

## Summary

| # | Tool | Install method (Mac) | Sandbox verified? | Keys needed | Use for Steven | Vendored? |
|---|---|---|---|---|---|---|
| 1 | Headroom | `uv tool install --python 3.13 "headroom-ai[all]"` | Yes — pip 0.38.0, `headroom --version` ok | none (telemetry switch `HEADROOM_BEACON`) | Yes, measured trial: cut Claude Code token spend | — |
| 2 | Graphify | `pipx install graphifyy && graphify install` | Yes — 0.9.65; skill lands in `~/.claude/skills/graphify/` | none (runs inside Claude Code) | Yes — it **is** the L4 store; README gaps below | — |
| 3 | CodeBurn | `brew install codeburn` / `npm i -g codeburn` | Yes — 0.9.25, `codeburn overview` ran | none | Yes — the missing "cost of a recall" meter | — |
| 4 | Ponytail | `/plugin marketplace add DietrichGebert/ponytail` → `/plugin install ponytail@ponytail` | Yes — 4.10.0 installed (fake HOME) | none; needs `node` | Optional — overlaps Karpathy skill | — |
| 5 | Screenshot to Code | clone; poetry backend :7001 + pnpm frontend :5173, or `docker-compose` | Partial — clone + layout only, not run | one of `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`; `REPLICATE_API_KEY` opt. | Occasional — hosted app is enough | — |
| 6 | Agent Skills (addyosmani) | per-skill `npx skills add addyosmani/agent-skills --skill <name> -g` | Yes — plugin 0.6.10 + per-skill install, byte-identical | none | Yes — 6 of 25 | **6 vendored** |
| 7 | Find Skills (vercel-labs) | vendored; or `npx skills add vercel-labs/skills@find-skills -g` | Yes — identical to upstream | none | Yes — how the team looks before it builds | **yes** |
| 8 | Apple Design (emilkowalski) | vendored; or `npx skills add emilkowalski/skills@apple-design -g` | Yes — identical to upstream | none | Yes — deck panel polish | **yes** |
| 9 | Claude Code Setup (Anthropic) | `/plugin marketplace add anthropics/claude-plugins-official` → `/plugin install claude-code-setup@claude-plugins-official` | Yes — 1.0.0 installed (fake HOME); claude.com page egress-blocked | none | Yes — one read-only pass over the brain and the deck repo | — |
| 10 | Strix | `uv tool install --python 3.12 strix-agent` + Docker Desktop | Yes — 1.6.2 on Py 3.12; not run (no Docker daemon) | `STRIX_LLM`, `LLM_API_KEY` (opt. `LLM_API_BASE`) or Strix Cloud login | Narrow — one scan of the ISA portal before it takes logins | — |
| 11 | Agent Reach | `pipx install git+https://github.com/Panniantong/agent-reach` → `agent-reach install --env=auto` | Yes — 1.5.0 from source; `doctor` ran (2/16 channels here) | `TWITTER_AUTH_TOKEN`, `TWITTER_CT0`; Reddit login; opt. Exa key; a browser session | Moderate — Sofia's social listening, read-only | skill not vendored (see §11) |
| 12 | prompts.chat | `/plugin marketplace add f/prompts.chat` → `/plugin install prompts.chat@prompts.chat`; or `npx prompts.chat` | Yes — plugin 1.0.0 + npm 0.1.1 | none to read; prompts.chat API key only to save | Low — generic prompts; no business skill inside | 0 vendored |
| 13 | openalternative.co | nothing to install | **Unreachable** — egress-blocked, search budget exhausted | — | Reference only | — |
| 14 | Karpathy CLAUDE.md | vendored as skill; or `/plugin marketplace add multica-ai/andrej-karpathy-skills` → `/plugin install andrej-karpathy-skills@karpathy-skills` | Yes — plugin 1.0.0 installed (fake HOME) | none | Yes — surgical-change discipline for every agent | **yes** (`karpathy-coding-principles`) |
| 15 | vphone-cli | `brew install zqxwce/tap/vphone-cli` (macOS only) | No — macOS-only; README verified | none | **None** — do not install (needs SIP/AMFI relaxation) | — |
| 16 | Agent402 | `claude mcp add agent402 -- npx -y agent402-mcp` | Registry metadata only; not run | none free; wallet / `STRIPE_SECRET_KEY` / `AGENT402_CREDITS_KEY` paid | **None** — pay-per-call crypto tool market; do not install | — |
| 17 | Laya | `uv venv ~/laya-venv && uv pip install --python ~/laya-venv/bin/python laya` (Python library) | **Yes, re-proven 2026-09-22 (P6)** — 0.3.6 into a *fresh empty* venv, exit 0; `import laya` ok; 7 of 8 upstream test scripts pass; checkpoints not downloaded | none (optional `HF_TOKEN`) | Not now — local PII-safe triage classifier only after fine-tuning | — |

## 1. Headroom — `headroom-ai` 0.38.0, Apache-2.0
- **What / why:** local context-compression proxy between a coding agent and the model API (tool output, logs,
  history), plus `headroom wrap claude` and an MCP mode. For Steven: the roster's Claude Code sessions are the
  token bill; a measured trial on one report seat could cut it. It is a middlebox — it changes what the model
  sees, so trial before trusting it under Vanessa.
- **Commands:** `brew install python@3.13` (if needed) → `uv tool install --python 3.13 "headroom-ai[all]"` →
  `headroom wrap claude` (launch a wrapped session) or `headroom mcp install` + `headroom proxy --port 8787`.
  Sandbox: `pip install headroom-ai` exit 0 → 0.38.0; `headroom --version` → `0.38.0`.
- **Keys:** none for compression; the wrapped Claude Code keeps its own login. Env names: `HEADROOM_BEACON`
  (telemetry — read that README section and turn it off), `HEADROOM_OUTPUT_SHAPER`, `HEADROOM_UPDATE_CHECK`.
- **Check:** `headroom --version`, `headroom doctor`; compare a week of CodeBurn before/after.
- **Security:** traffic stays on `127.0.0.1:8787`; originals cached locally (CCR) — that cache holds
  conversation content, keep it off iCloud sync. Do not wrap sessions that read `wiki/clients/`.

## 2. Graphify — PyPI `graphifyy` 0.9.65 (CLI/skill still named `graphify`), MIT (pyproject)
- **What / why:** a Claude Code skill + CLI that turns a folder into a knowledge graph (`graphify-out/`:
  `graph.json`, `graph.html`, `GRAPH_REPORT.md`, `obsidian/` with `--obsidian`, `wiki/`), edges tagged
  EXTRACTED / INFERRED / AMBIGUOUS, Leiden communities, `graphify query|path|explain`, `--mcp`, git hook.
- **Commands:** `pipx install graphifyy && graphify install` (macOS python is externally managed; or
  `uv tool install graphifyy`). Sandbox: pip exit 0 → 0.9.65; `graphify install --platform claude` against a fake
  HOME wrote `~/.claude/skills/graphify/SKILL.md` + `references/` and **appended to `~/.claude/CLAUDE.md`** (the
  user file — not this repo's router). Then in Claude Code: `/graphify <folder>`.
- **Keys:** none — extraction runs inside the Claude Code session.
- **Check:** `graphify --version`; `/graphify` on a small folder produces `graphify-out/GRAPH_REPORT.md`.
- **Does `knowledge-graph/README.md` match the real tool?** Partly. Matches: nodes/edges/communities, local,
  Obsidian output, "how do these connect". Gaps: (a) no install path recorded — it is the line above;
  (b) the README calls `entities/` "the entity files a build reads" and `schema.md` a closed vocabulary a run
  honors — Graphify reads no entity files and enforces no schema; it extracts free-form concepts from the corpus
  (`entities/` is empty). The schema is a Steven-side convention, and the README should say so; (c) the cheap
  L4 recall — `graphify query "..."` / `--mcp` — is not in the recall order; (d) 750 nodes / 1,104 edges are the
  `knowledgeFabric` doc's numbers, not verifiable from here.
- **Security:** the corpus goes through Claude and lands in `graph.json` / `obsidian/`. Never run `/graphify`
  over `wiki/clients/` or the vault's client folders (never-graph-a-secret rule). Keep `graphify-out/` out of git.

## 3. CodeBurn — npm `codeburn` 0.9.25, MIT
- **What / why:** local-first token/cost tracker that reads the session logs Claude Code already writes
  (`~/.claude/projects/`) and 40 other tools; `overview`, `web`, `menubar`, `budget`, and `optimize` (finds
  re-read files, ghost skills/agents in `~/.claude/`). This is the "cost or freshness of a recall" meter that
  `OPTIMIZATION.md` reasons about without numbers, and `optimize` dovetails with `skills-refresh`.
- **Commands:** `brew install codeburn` (or `npm install -g codeburn`, or `npx codeburn`). Sandbox: npm exit 0 →
  0.9.25; `codeburn --version` → `0.9.25`; `codeburn overview --no-color` ran (empty box).
- **Keys:** none. Env overrides only (`CLAUDE_CONFIG_DIR` …). The optional desktop app asks consent for telemetry.
- **Check:** `codeburn overview --no-color`; `codeburn optimize --format json` (read-only).
- **Security:** it reads logs that contain conversation text — leave `share` / `devices` off; run
  `optimize --apply` only after `--dry-run`; never paste its output into a client-facing doc.

## 4. Ponytail — Claude Code plugin 4.10.0, MIT
- **What / why:** "lazy senior dev" ruleset injected on every prompt by two Node lifecycle hooks; modes
  `/ponytail lite|full|ultra|off`; `/ponytail-review|-audit|-debt|-gain`. Optional for Steven — it overlaps the
  vendored Karpathy skill; consider it only if bloat persists in deck/skill edits.
- **Commands:** `/plugin marketplace add DietrichGebert/ponytail` → `/plugin install ponytail@ponytail` (CLI:
  `claude plugin marketplace add DietrichGebert/ponytail && claude plugin install ponytail@ponytail --scope user`).
  Sandbox: both succeeded with claude CLI 2.1.278 against a fake HOME → 4.10.0. Needs `node` on PATH.
- **Keys:** none. **Check:** `claude plugin list` shows `ponytail@ponytail`; `/ponytail-help`.
- **Security:** hooks run `node` every turn and inject into **every subagent** (scope with
  `PONYTAIL_SUBAGENT…` per README) — that touches Vanessa's dispatch; run `/ponytail off` if it fights a
  skill. Leaves `~/.claude/.ponytail-active` behind on uninstall. No network.

## 5. Screenshot to Code — web app, MIT
- **What / why:** FastAPI + Vite app that turns screenshots / mockups / Figma / recordings into HTML-Tailwind /
  React. Occasional use: rebuild a landing page or a deck panel from a Canva mock. The hosted
  `screenshottocode.com` is cheaper than keeping two local servers alive.
- **Commands:** `git clone https://github.com/abi/screenshot-to-code` → `cd backend && poetry install &&
  poetry run playwright install chromium && poetry run uvicorn main:app --reload --port 7001` and `cd frontend &&
  pnpm install && pnpm dev` (→ http://localhost:5173), or `docker-compose up -d --build`. Sandbox: shallow clone
  ok, layout confirmed (`backend/pyproject.toml` python ^3.10, `frontend/`, `docker-compose.yml`); **not run**.
- **Keys (in `backend/.env`):** one of `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`;
  `REPLICATE_API_KEY` for image edits.
- **Check:** open http://localhost:5173, drop a screenshot. **Security:** screenshots go to the model
  provider — never upload an LE/CD, a credit report or anything with a client's name; keep `.env` out of git.

## 6. Agent Skills (addyosmani) — 25 skills, MIT · **6 vendored**
- **What / why:** production-grade engineering skills (review, git, security, debugging, docs…). Vendored into
  `.claude/skills/`: `code-review-and-quality`, `git-workflow-and-versioning`, `source-driven-development`
  (research with verified citations), `documentation-and-adrs` (the discipline behind `context/decisions.md`),
  `security-and-hardening` (+ its own `references/hardening-patterns.md`), `debugging-and-error-recovery`.
- **Available, not vendored:** using-agent-skills, interview-me, idea-refine, spec-driven-development,
  constraint-driven-development, planning-and-task-breakdown, incremental-implementation,
  test-driven-development, context-engineering, doubt-driven-development, frontend-ui-engineering,
  api-and-interface-design, browser-testing-with-devtools, code-simplification, performance-optimization,
  ci-cd-and-automation, deprecation-and-migration, documentation…(done), observability-and-instrumentation,
  shipping-and-launch.
- **Commands:** nothing — the six load once the repo is pulled. Per-skill on the Mac:
  `npx skills add addyosmani/agent-skills --skill <name> -g` (sandbox: landed in `~/.agents/skills/`,
  byte-identical). **Do not** install the whole plugin (`agent-skills@addy-agent-skills`, sandbox-verified
  0.6.10): it ships an `interview-me` that collides by name with the brain's own `interview-me`.
- **Note:** `../../references/*.md` links inside two vendored files point at upstream (header says so).
- **Keys:** none. **Check:** `skills-refresh` next Sunday lists nine new skills as installed-but-not-on-the-deck.

## 7. Find Skills (vercel-labs) · 8. Apple Design (emilkowalski) — vendored, MIT
- **7:** `.claude/skills/find-skills/SKILL.md` — how to search skills.sh / `npx skills find` before building.
  Needs the `skills` CLI (npm 1.7.0 verified). For Steven: Derek/Vanessa look before they build, then route the
  install through the Sunday `skills-refresh` gate. **Security:** the CLI's own banner — "skills run with full
  agent permissions" — so no `-y` install on the Mac without reading the SKILL.md; installing a skill is a
  live-prompt edit (HALT list).
- **8:** `.claude/skills/apple-design/SKILL.md` — fluid motion, materials, typography, reduced-motion for the
  web. For Steven: the Command Deck's sheets/drawers/tiles when Engineering polishes panels.
- Both byte-identical to upstream (verified against `npx skills add … -g -y` in a fake HOME). Keys: none.

## 9. Claude Code Setup — Anthropic plugin 1.0.0, Apache-2.0
- **What / why:** read-only codebase analysis that recommends hooks, skills, MCP servers, subagents and slash
  commands. One pass over this repo and the deck repo is worth it (e.g. a hook that blocks writes to
  `wiki/clients/`, a 200-line check).
- **Commands:** `/plugin marketplace add anthropics/claude-plugins-official` →
  `/plugin install claude-code-setup@claude-plugins-official`. Sandbox: both succeeded (fake HOME); the
  marketplace holds 310 plugins. `claude.com/plugins/...` was egress-blocked; GitHub manifests verified.
- **Keys:** none. **Check:** ask "recommend automations for this project". **Security:** it only reads;
  every recommendation that edits hooks/settings is a HALT-class change — Needs-Steven packet first.

## 10. Strix — `strix-agent` 1.6.2, Apache-2.0 — **HALT: key, spend, authorization**
- **What / why:** autonomous AI penetration tester (code, web apps, APIs) in a Docker sandbox. Narrow use: one
  scan of the ISA portal before it takes client logins; otherwise nothing Steven owns needs it.
- **Commands:** Docker Desktop running → `uv tool install --python 3.12 strix-agent` (upstream offers
  `curl -sSL https://strix.ai/install | bash`; prefer the explicit install) → `export STRIX_LLM=…` and
  `LLM_API_KEY` from the keychain → `strix --target ./app-directory`. Sandbox: pip on 3.11 refused (needs ≥3.12);
  `uv venv --python 3.12` + `uv pip install strix-agent` → 1.6.2, `strix --version` ok; not run (no Docker).
- **Keys:** `STRIX_LLM`, `LLM_API_KEY`, optional `LLM_API_BASE`; or `strix cloud login` (account).
- **Check:** `strix --version`; first run pulls the sandbox image.
- **Security (Elena):** README: "only run it against systems you own or have explicit, written permission to
  test". Own systems only — never Lofty, Zoho, LPT, Patriot Pacific, a lender portal or any vendor SaaS.
  `strix_runs/` may contain live secrets it found — keep out of the repo. Never point it at client data.

## 11. Agent Reach — 1.5.0 from GitHub source, MIT — **HALT: logged-in accounts**
- **What / why:** installs and health-checks upstream CLIs (twitter-cli, rdt-cli, yt-dlp, OpenCLI, Jina reader,
  Exa via mcporter) so an agent can read X, Reddit, YouTube, LinkedIn, Instagram, Facebook, RSS, any page. For
  Steven: Sofia's social listening on Temecula agents, lenders and buyer chatter — **read-only**.
- **Trap:** `pip install agent-reach` from PyPI is a different project (jgalea, 0.1.0). Use the source URL.
- **Commands:** `pipx install "git+https://github.com/Panniantong/agent-reach"` → `agent-reach install --env=auto`
  (read-only check) → `agent-reach doctor` → `--system` only after you approve system changes. Skill:
  `npx skills add Panniantong/Agent-Reach@agent-reach -g` (sandbox-verified). Sandbox: pip from git exit 0 →
  1.5.0; `doctor` ran, 2/16 channels usable there; output is Chinese by default.
- **Keys:** `TWITTER_AUTH_TOKEN` + `TWITTER_CT0` (cookie export), Reddit login (`rdt login`), optional Exa API
  key, a logged-in Chrome session for Facebook/Instagram via OpenCLI, `gh` for GitHub.
- **Check:** `agent-reach doctor`. **Security (Elena):** bind every browser session to a **dedicated Chrome
  profile** (or a burner account) — never Steven's brokerage-branded logins; cookies stay in `~/.agent-reach/`,
  never in a prompt, skill or the repo; read only — posting from licensed accounts is Alexandra's lane;
  automated access can get an account suspended; never feed it client data. **Its skill's frontmatter says
  "MUST USE" for any research request — that would hijack the router's research path (Perplexity queue), so
  do not install the skill; call the CLIs from Sofia's seat explicitly.**

## 12. prompts.chat — plugin 1.0.0 / npm 0.1.1, MIT code + CC0 prompts
- **What / why:** open prompt library with a TUI (`npx prompts.chat`), an MCP server (`npx -y prompts.chat mcp`
  or `https://prompts.chat/api/mcp`) and a Claude Code plugin (`/prompts.chat:prompts`, `/prompts.chat:skills`,
  two agents, discovery skills). Low value here: Steven's prompts are his persona skills; the plugin's skills
  are about its own catalogue, so **nothing vendored**.
- **Commands:** `/plugin marketplace add f/prompts.chat` → `/plugin install prompts.chat@prompts.chat`. Sandbox:
  plugin install ok (fake HOME); `npm install prompts.chat` → 0.1.1, `--help` ok.
- **Keys:** none to read; a prompts.chat API key only for `save_prompt`. **Check:** `npx prompts.chat`.
- **Security:** the MCP server talks to prompts.chat — never "improve" a prompt that contains client detail.

## 13. openalternative.co/alternatives/ — reference only
Egress-blocked from the sandbox (curl 000, WebFetch EGRESS_BLOCKED) and the session's search budget was already
spent, so it is recorded from Steven's own description: a directory of open-source alternatives to commercial
software. Nothing to install. Registered in `references/index.md`; consult it when a paid SaaS comes up for renewal.

## 14. Karpathy coding principles — vendored `karpathy-coding-principles`, MIT
- **What / why:** upstream `CLAUDE.md` (think before coding, simplicity first, surgical changes, goal-driven
  execution) wrapped as a skill with generated frontmatter; upstream text verbatim. **Not merged into this repo's
  `CLAUDE.md`** — the router stays as it is. For Steven: the cure for gold-plated deck edits.
- **Alt:** `/plugin marketplace add multica-ai/andrej-karpathy-skills` →
  `/plugin install andrej-karpathy-skills@karpathy-skills` (sandbox-verified 1.0.0; README still names the old
  owner `forrestchang`, GitHub redirects). Keys: none.

## 15. vphone-cli — macOS-only, MIT — **do not install**
- **What:** boots a virtual iPhone on Apple Silicon (macOS 15+, Xcode + iOS SDK) from Apple's PCC research VM
  images: downloads/patches IPSW, DFU restore, custom firmware, then screenshots/touch/keys over a socket.
  Install would be `brew install zqxwce/tap/vphone-cli` after a long `brew install` list; **requires SIP/AMFI
  relaxation** (`csrutil allow-research-guests enable`, `amfi_get_out_of_my_way=1` or `amfidont`).
- **Verdict for the Apple Health path: none.** Health data lives on the physical iPhone (HealthKit, Watch); a
  research VM boots a patched iOS with no Health data and no iCloud sign-in. `apple-health-notion` stays the path.
- **Security (Elena):** relaxing SIP/AMFI on the Mac that holds the keychain, CRM keys and client files is a
  step backwards. If it is ever wanted for research, use a separate machine. Not verifiable from Linux.

## 16. Agent402 — server AGPL-3.0, npm `agent402-mcp` 0.13.3 MIT — **do not install; HALT: spends money**
- **What:** hosted/self-hostable MCP server exposing 500+ pay-per-call tools (search, crypto/DeFi data, paid
  reports, utilities) settled in USDC over x402/MPP or by card; `claude mcp add agent402 -- npx -y agent402-mcp`;
  `FREE_MODE=true npm start` to self-host without payments.
- **Verdict: no clear use.** Steven already has Perplexity, WebSearch and Composio for search and data; the
  paid door is an agent-initiated crypto wallet (HALT list, first line), and the catalogue is DeFi-heavy.
- **Keys (paid only):** `WALLET_ADDRESS`, `CDP_FACILITATOR_*`, `STRIPE_SECRET_KEY`, `AGENT402_CREDITS_KEY`.
  Sandbox: registry metadata only; not run (it would connect to agent402.tools).

## 17. Laya — PyPI `laya` 0.3.6, Apache-2.0 (Convai Innovations) — **not now**
- **What:** a Python library, not an agent tool: small encoder checkpoints from Hugging Face (ModernBERT-large
  421M / mmBERT-base 322M) that answer typed questions — `choice`, `score`, `noul` (calibrated yes/no) — over an
  email, ticket or JSON in one forward pass (33 ms on a T4 GPU; 193–464 ms on CPU). Built-in question packs:
  model routing, prompt-injection guardrails, moderation, support-ticket triage; fine-tuning notebooks (Kaggle
  2×T4). Its own README: zero-shot is near chance on typed decisions — "a fast base to specialise, not a
  zero-shot decision engine". The npm package `laya` is an unrelated game-engine tool — do not `npm install` it.
- **Verdict for Steven:** no clear use today. The one fit is a **local, PII-safe classifier** for inbound
  email and lead triage (`r12-inbox-triage`, `lead-triage-daily`: intent, urgency, churn) — it would keep client
  text on the Mac, which the HALT list likes. But it needs fine-tuning on ~30k labelled questions and GPUs he
  does not have, and the Claude-driven triage already works. Revisit only if volume or a PII rule forces a
  local model.
- **Commands (if revisited) — re-proven end to end 2026-09-22 (P6), not copied forward:**
  ```bash
  uv venv --python 3.12 ~/laya-venv        # 3.11 also works (proven); 3.12 is the house pin, keep it
  uv pip install --python ~/laya-venv/bin/python laya
  ~/laya-venv/bin/python -c "import laya; print(laya.__version__)"
  ```
  First `laya.load(...)`/`Router(preload=True)` downloads 1–2 GB of checkpoints into `~/.cache/huggingface`.
  **Sandbox record (fresh, empty venv — `pip list` held only pip+setuptools before the install):**
  `pip install --no-cache-dir laya` → **exit 0, laya 0.3.6** with torch 2.14.0+cu130 and transformers 5.17.0
  on **CPython 3.11**; `import laya` ok. Linux pulled ~5 GB of CUDA wheels (a Mac gets the CPU/MPS build, a
  few hundred MB); no checkpoint downloaded. The venv and the clone were deleted afterwards.
- **Upstream test suite — 7 of 8 pass, and it is NOT a pytest suite.** `pytest tests/` aborts with
  `INTERNALERROR … SystemExit` because every file calls `sys.exit()` at module level. Run them as plain
  scripts instead, one per file:
  ```bash
  cd <a clone of github.com/NandhaKishorM/laya>
  for t in tests/*.py; do ~/laya-venv/bin/python "$t"; done
  ```
  Result here: `test_criteria` 34 passed · `test_decision_model` ok · `test_download` ok · `test_email`
  11 passed · `test_packaging` ok · `test_router` ok · `test_shortlist` 81 passed · **`test_local_e2e` fails
  (rc 1)** with `FileNotFoundError: Local model path not found: '~/laya_models/laya-multilingual'` — expected,
  it wants checkpoints nobody downloaded. That one failure is not a defect; the other seven are the proof.
- **Keys:** none for the public checkpoints; `HF_TOKEN` only to push a fine-tune or if the Hub rate-limits.
- **Check:** `~/laya-venv/bin/python -c "import laya; print(laya.__version__)"` → `0.3.6`.
  Nothing in `MAC-SETUP.sh` installs this and nothing in `mac-verify.sh` checks it — it is an advisory step
  (`MAC-SETUP.sh --only laya` prints the command, it does not run it). That is deliberate given the verdict
  below; the commands above are what to paste the day the verdict changes.
- **Security:** runs locally; checkpoints are safetensors (no pickle execution). Never upload a fine-tuning set
  containing client PII to Kaggle or the Hub — that is PII leaving the local model (HALT).

## Order of operations on the Mac
1. Pull the repo — the nine vendored skills load with it; run `skills-refresh` once so the deck's toolkit
   table learns about them. 2. CodeBurn (baseline the spend). 3. Graphify + fix the README gaps in §2.
4. Claude Code Setup, one read-only pass. 5. Headroom on one report seat, measured against step 2.
6. Everything else only on a named need. Never Strix, Agent Reach or any plugin without the Needs-Steven packet.
