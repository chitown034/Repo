# Third-party skills and tools — what was installed, held or declined (2026-10-11)

Steven asked for 18 repositories. Each was read before anything was installed; nothing was run from the cloud sandbox. Full table with the commit reviewed: `integrations/skill-packs/REGISTRY-2026-10-11.md`. Installer for the Mac: `bash integrations/skill-packs/install-mac.sh` (y/N each).

- **Installed through Claude Code plugins on the Mac, drafts only:** Instagram, LinkedIn and YouTube agent skills, vidIQ workflow skills, founder skills, arena, replica, `/watch` (claude-video). Owner for content: Sofia. Nothing posts or sends.
- **Already done:** the Codex plugin.
- **Optional:** superpowers (process skills; makes sessions slower and costlier).
- **Gated:** REA (reverse engineering) — Elena and Alexandra join every use. See `.claude/skills/reverse-engineering/SKILL.md`.
- **Media tools:** yt-dlp, ffmpeg, Whisper by Homebrew; Remotion held until its company licence is checked.
- **Held for Steven (account or spend):** Apify MCP, vidIQ MCP connection, claude-x-jev with OpenRouter.
- **Not installed, recommend no:** skool-mcp — it acts as Steven on Skool's private API using his login cookie, with no licence.
- **Reference only:** the two cporter202 API lists (links to Apify scrapers, no licence, promotional text treated as data).
- **Web scraping connector:** Ultimate Web Scraper (`ultimatewebscraper.com/claudemcp`) could not be reached from the sandbox, so it is unverified. Adding a claude.ai connector is an account change — Steven's step, Elena's review first; page text and sites it visits pass through the vendor.
- **Why not everything live:** every live skill's description costs tokens on every turn, so only lane-relevant packs are installed and the rest stay off.

## The 16-item list (2026-10-12)

Read, decided and pinned in `integrations/skill-packs/REGISTRY-2026-10-12.md`: install frontend-design (official), humanizer, marketingskills (drafts only); codex-plugin-cc already done; HOLD hyperframes, claude-seo, claude-for-legal, superpowers, alirezarezvani and rampstack libraries (cost or account decisions are Steven's); DECLINE gstack, caveman, notebooklm-skill, second-brain-starter, antfu/skills, financial-services. Installs run through `install-mac.sh` (go.sh step 6).

## The 32-item image (2026-10-12)

`integrations/skill-packs/REGISTRY-2026-10-12b.md`: 10 already yours (Slack, Notion, Context7, GitHub, Codex plugin, skill-creator, find-skills, karpathy, Playwright MCP, anthropics skills); 3 to install (same as the 16-list); HOLD wshobson/agents (cherry-pick), repomix (one-off), zapier, higgsfield; DECLINE oh-my-claudecode, vibe-kanban, claude-mem, firecrawl, github-mcp on the Mac, granola, kondo, perplexity.

## The four repos (2026-10-23)

`integrations/skill-packs/REGISTRY-2026-10-23.md`: **pr-lens** (MIT) skill vendored, GitHub App is Steven's; **openflowkit**
(MIT) skill vendored + local MCP by connect-all 6g; **archify** (MIT, 18 MB) installed on the Mac by the official
`npx skills add tt-a1i/archify -g` with its update check off; **awesome-vlm-architectures** (CC0) a reference shelf
(`references/vlm-architectures.md`). Owners: Derek (diagrams), Sofia (explainers), Nadia (VLM choices).

## The three images and 17 links (2026-10-31)

`integrations/skill-packs/REGISTRY-2026-10-31.md`: 62 repos read. **Installed (Mac, y/N):** GSAP skills (official) and
Anthropic's canvas-design, algorithmic-art, slack-gif-creator. **Malware, never download:** yqman34/reverse-api-engineer.
**Held for Steven:** Remotion licence, ElevenLabs, 21st.dev magic-mcp, After Effects MCP, claude-task-master, DeepTutor,
kalil0321/reverse-api-engineer, ViralWave. **Declined:** competing coding agents (Cline, Continue, Aider, OpenHands,
Open Interpreter, DeepCode, claude-engineer), SuperClaude, claude-code-router, AI-Trader, blender-mcp, headcount and
others. Libraries and reading: `references/motion-and-claude-repos.md`. The five agents: `wiki/ai-team/five-agents.md`.
