#!/usr/bin/env bash
# install-mac.sh — installs the reviewed third-party packs through Claude Code's own plugin system, plus media tools.
# macOS bash 3.2 safe. Asks y/N before EACH step (Enter = no). --dry-run changes nothing. Never asks for or stores a key.
# Reviewed commits are in REGISTRY-2026-10-11.md; this script does not pin plugin versions (Claude Code's marketplace
# fetches the default branch), so it prints the reviewed commit and tells you to stop if you see a surprise.
set -u
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
ask() { if [ $DRY = 1 ]; then echo "  [dry-run] would ask: $1"; return 1; fi; printf '  %s [y/N] ' "$1"; read -r a || a=''; case "$a" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac; }
have() { command -v "$1" >/dev/null 2>&1; }
plug() { # label owner/repo marketplace plugin reviewed-sha note
  echo; echo "- $1  (reviewed $5)  $6"
  if ! have claude; then echo "  claude CLI not found - install Claude Code first"; return; fi
  if claude plugin list 2>/dev/null | grep -q "^.*$4@$3"; then echo "  already installed"; return; fi
  if ask "Install plugin $4 from github.com/$2?"; then
    claude plugin marketplace add "$2" && claude plugin install "$4@$3" && echo "  done: $4 (restart Claude Code)"
  fi
}
echo "Third-party packs for Claude Code (dry-run=$DRY). Each is MIT/Apache-2.0 and was read before this script was written."
echo; echo "== Content & marketing (Sofia) - drafts only, nothing posts"
plug "Instagram agent (12 skills)"  Jakeschincariol/instagram-agent-skill instagram-agent-skill instagram-agent d03c56b ""
plug "LinkedIn agent (10 skills)"   Jakeschincariol/linkedin-agent-skill  linkedin-agent-skill  linkedin-agent  add2c23 ""
plug "YouTube agent (10 skills)"    Jakeschincariol/youtube-agent-skill   youtube-agent-skill   youtube-agent   a2feb21 ""
plug "vidIQ workflow skills (12)"   vid-io/vidiq-mcp                      vidiq-plugins         vidiq           1b2daf2 "(the vidIQ MCP itself needs a vidIQ account: HALT, ask Steven)"
plug "/watch video reader"          bradautomates/claude-video            claude-video          watch           03ceb42 "(needs yt-dlp + ffmpeg below)"
echo; echo "== Business & product (Nadia, Marcus, Elon)"
plug "Founder skills (10)"          Jakeschincariol/founder-skill         founder-skill         founder-skill   fd9385b ""
plug "Arena (compare options)"      Jakeschincariol/arena-skill           arena-skill           arena-skill     df07b8e ""
plug "Replica (site recon + rebuild)" Jakeschincariol/replica-skill       replica-skill         replica-skill   77c9436 "(Alexandra gates any copy of someone else's site or brand)"
echo; echo "== From the 16-item list (2026-10-12) - read before writing this; details in REGISTRY-2026-10-12.md"
plug "frontend-design (official Anthropic)" anthropics/claude-plugins-official claude-plugins-official frontend-design f359d43 ""
plug "Humanizer (de-AI prose, 1 skill)"     blader/humanizer                   humanizer               humanizer       225a6f3 ""
plug "Marketing skills (50, drafts only)"   coreyhaines31/marketingskills      marketingskills         marketing-skills 1efedbc "(adds ~9.7k tokens to every turn; never give its tools/ CLIs an API key; sms/cold-email/prospecting wait for Alexandra)"
echo; echo "== Steven said 'add and install all' (2026-10-12) - each in its leanest safe form; details in REGISTRY-2026-10-12b.md"
plug "HyperFrames core (10 video skills)"  heygen-com/hyperframes               hyperframes              core-skills      d0b551d "(telemetry is switched off right after; HeyGen cloud render needs your own account)"
have npx && npx -y hyperframes telemetry disable >/dev/null 2>&1 && echo "  hyperframes telemetry: off"
plug "claude-seo (26 SEO skills, no cockpit)" AgriciDaniel/claude-seo           agricidaniel-claude-seo  claude-seo       4b99de2 "(adds ~3k tokens a turn and a hook on every edit; no paid keys given)"
plug "claude-for-legal: commercial-legal"  anthropics/claude-for-legal          claude-for-legal         commercial-legal 4a6c651 "(your OWN contracts only; Alexandra reviews every output)"
plug "claude-for-legal: privacy-legal"     anthropics/claude-for-legal          claude-for-legal         privacy-legal    4a6c651 "(your own lead data / CCPA; Alexandra reviews)"
plug "AEO (1 skill, from the 388-skill library)" alirezarezvani/claude-skills    claude-code-skills       aeo              19392f7 ""
plug "wshobson: security-scanning"         wshobson/agents                      claude-code-workflows    security-scanning 46891e7 ""
plug "wshobson: tdd-workflows"             wshobson/agents                      claude-code-workflows    tdd-workflows    46891e7 ""
plug "wshobson: debugging-toolkit"         wshobson/agents                      claude-code-workflows    debugging-toolkit 46891e7 ""
copyskills() { # label owner/repo sha folder...   - copies named skill folders only (no plugin, no hooks)
  local label="$1" repo="$2" sha="$3"; shift 3
  echo; echo "- $label  (reviewed $sha)"
  if ! have git; then echo "  git not found"; return; fi
  if ask "Copy skill folders from github.com/$repo into ~/.claude/skills (no hooks, no plugin)?"; then
    local tmp; tmp="$(mktemp -d)"; git clone -q --depth 1 "https://github.com/$repo.git" "$tmp/r" || { echo "  clone failed"; return; }
    local head; head="$(git -C "$tmp/r" rev-parse --short=7 HEAD)"
    [ "$head" = "$sha" ] || { echo "  upstream moved since review ($sha -> $head)"; ask "Copy anyway?" || { rm -rf "$tmp"; return; }; }
    mkdir -p "$HOME/.claude/skills"
    for f in "$@"; do
      src="$(find "$tmp/r" -type d -name "$f" -path '*skills*' | head -n 1)"
      if [ -n "$src" ] && [ -f "$src/SKILL.md" ]; then [ -e "$HOME/.claude/skills/$f" ] && echo "  $f already there" || { cp -R "$src" "$HOME/.claude/skills/$f" && echo "  copied $f"; }
      else echo "  $f not found in the repo"; fi
    done; rm -rf "$tmp"
  fi
}
copyskills "Superpowers (3 skills, no session hook)" obra/superpowers bb92a77 systematic-debugging verification-before-completion writing-plans
copyskills "Rampstack (5 brand/site skills)" rampstackco/claude-skills 482c9bf brand-voice landing-page-copy seo-onpage seo-technical accessibility-audit
copyskills "Caveman voice (the one skill only, no proxy, no hooks)" JuliusBrussee/caveman 2e08b91 caveman
echo; echo "-- repomix (CLI only, no MCP)"; have repomix && echo "  already installed" || { have npm && ask "npm install -g repomix ?" && npm install -g repomix; }
echo; echo "-- Hosted MCPs for Claude Code (sign-in happens in your browser the first time; each is yours to approve)"
mcpadd() { # name url note
  if ! have claude; then return; fi
  if claude mcp list 2>/dev/null | grep -q "^$1"; then echo "  $1 already registered"; return; fi
  ask "Register $1 ($3)?" && claude mcp add --transport http "$1" "$2" && echo "  registered $1"
}
mcpadd higgsfield https://mcp.higgsfield.ai/mcp "cinematic video; every generation bills your Higgsfield credits; no client or property photos"
mcpadd firecrawl  https://mcp.firecrawl.dev/v2/mcp "keyless 3-tool scrape/search; public sites only, never client data"
mcpadd granola    https://mcp.granola.ai/mcp "reads Granola meeting notes; only if you use the Granola app"
echo; echo "== Optional"
plug "Superpowers (process skills)" obra/superpowers                      superpowers-dev       superpowers     bb92a77 "(makes sessions slower and costlier; try on one Mac only)"
echo; echo "== Media tools (Homebrew / pip; no accounts)"
if have brew; then
  for f in yt-dlp ffmpeg; do have $f && echo "  $f already installed" || { ask "brew install $f ?" && brew install $f; }; done
  have whisper && echo "  whisper already installed" || { ask "Install OpenAI Whisper (brew install openai-whisper; runs on this Mac, nothing uploaded)?" && brew install openai-whisper; }
else echo "  Homebrew not found - install it from https://brew.sh first, then re-run"; fi
echo; echo "== Reverse engineering (REA) - gated: only on software Steven owns or may analyse"
echo "  Read .claude/skills/reverse-engineering/SKILL.md first. Setup is interactive and edits agent configs with backups."
have npx && { ask "Run: npx rea-agents setup (you review every change it proposes)?" && npx rea-agents setup; } || echo "  npx not found (install Node first)"
echo; echo "== From the three images + 17 links (2026-10-31) - 62 repos read; details in REGISTRY-2026-10-31.md"
plug "GSAP animation skills (official, 8 skills)" greensock/gsap-skills gsap-skills gsap-skills aed9cfd "(motion for web pages and videos; no hooks, no key)"
copyskills "Anthropic visual skills (3, no hooks)" anthropics/skills ca45fc4 canvas-design algorithmic-art slack-gif-creator
echo "  NEVER download yqman34/reverse-api-engineer - it is a malware copy (zip with Launcher.cmd / luajit.exe)."
echo "  Held for your yes: Remotion licence, ElevenLabs, 21st.dev magic-mcp, After Effects MCP, claude-task-master, DeepTutor,"
echo "  kalil0321/reverse-api-engineer (uses your logged-in Chrome), ViralWave. Libraries (three.js, gsap, motion...) install per project."
echo; echo "== NOT installed on purpose (see REGISTRY-2026-10-11.md and -12.md)"
echo "  Still not here after 'install all' (each needs your own explicit yes, see REGISTRY-2026-10-12b.md): oh-my-claudecode, claude-mem, gstack,"
echo "  vibe-kanban, notebooklm-skill, kondo, zapier (needs the URL from your Zapier account), github-mcp on the Mac (gh already does it)."
echo "  claude-x-jev (OpenRouter key + sends text to a third party), apify MCP (account + spend cap), skool-mcp (uses your login cookie on a private API),"
echo "  Remotion (company licence to verify), the two API list repos (reference only)."
echo; echo "Done. Restart Claude Code, then type /plugin to see what is installed."
echo; echo "== The four repos (2026-10-23) - details in REGISTRY-2026-10-23.md (pr-lens + openflowkit skills come with the repo; the MCP via connect-all 6g)"
echo "- Archify (explorable HTML diagrams and explainers, MIT, reviewed 25cf370)"
if have npx; then
  if ask "Install the archify skill with the official 'npx skills add tt-a1i/archify -g' (18 MB, user scope; update check stays off)?"; then
    if ARCHIFY_UPDATE_CHECK_DISABLED=1 npx -y skills add tt-a1i/archify -g -a claude-code -y; then
      echo "  done: archify. Its update check stays off through ~/.zprofile (export ARCHIFY_UPDATE_CHECK_DISABLED=1)."
      if ! grep -q ARCHIFY_UPDATE_CHECK_DISABLED "$HOME/.zprofile" 2>/dev/null; then
        [ -s "$HOME/.zprofile" ] && [ "$(tail -c 1 "$HOME/.zprofile")" != "" ] && printf '\n' >> "$HOME/.zprofile"
        printf 'export ARCHIFY_UPDATE_CHECK_DISABLED=1\n' >> "$HOME/.zprofile"
      fi
    else echo "  archify install failed (npx skills add returned an error) - nothing written to ~/.zprofile; rerun later"; fi
  fi
else echo "  npx not found - install Node (brew install node) first"; fi
echo; echo "== From the ~64 screenshots (2026-11-01) - ~45 repos read; details in REGISTRY-2026-11-01.md"
copyskills "Social media skills (15 of 17, text-only, drafts only - Alexandra checks every post)" charlie947/social-media-skills 10ca79c voice-builder post-writer hook-generator post-formatter content-matrix newsletter-voice pinned-comment quote-post graphic-designer gemini-infographic gemini-carousel youtube-thumbnail profile-optimizer analytics-dashboard niche-research
echo "  Apillow Zillow MCP stays yours (sign-up, key, Zillow terms - Alexandra). Everything else held is offered at the end of this script."
echo "  The rest of the held list is offered at the end of this script (Steven, 2026-11-01)."
echo; echo "== Steven asked for these two by name (2026-11-01) - installed in their safe form"
echo "- AI website cloner (JCodesMore/ai-website-cloner-template, MIT, reviewed ee3f5a2): a Next.js project with a /clone-website command."
echo "  Use it only on sites you own or have written permission to copy (copyright, trademark, DRE/NMLS ad rules: Alexandra)."
if have git && ask "Clone it into ~/Projects/ai-website-cloner (nothing runs; you open it in Claude Code later)?"; then
  mkdir -p "$HOME/Projects"
  if [ -e "$HOME/Projects/ai-website-cloner" ]; then echo "  already there"; else
    # pinned to the reviewed commit: npm install would run its scripts, so never a newer, unread version
    if git -c core.hooksPath=/dev/null clone -q https://github.com/JCodesMore/ai-website-cloner-template.git "$HOME/Projects/ai-website-cloner" &&
       git -C "$HOME/Projects/ai-website-cloner" -c advice.detachedHead=false checkout -q ee3f5a2; then
      echo "  done (held at the reviewed commit ee3f5a2). To use: cd ~/Projects/ai-website-cloner && npm install && claude, then /clone-website <your own site URL>"
    else rm -rf "$HOME/Projects/ai-website-cloner"; echo "  clone failed or ee3f5a2 is gone upstream - nothing kept"; fi
  fi
fi
echo "- Agentic Awesome Skills library (sickn33/antigravity-awesome-skills, MIT, reviewed 6f819e3): ~2,900 skills."
echo "  Kept as a LIBRARY in ~/skill-library, not loaded into Claude Code: 2,900 skill descriptions in every turn would"
echo "  slow every session and burn your limit. Pull any one skill in when you want it: bash ~/Repo/scripts/skill-pick.sh <name>"
if have git && ask "Download the library into ~/skill-library/agentic-awesome-skills (~28,000 files, nothing runs)?"; then
  mkdir -p "$HOME/skill-library"
  if [ -d "$HOME/skill-library/agentic-awesome-skills" ]; then git -C "$HOME/skill-library/agentic-awesome-skills" pull -q --ff-only && echo "  updated (reviewed 6f819e3 -> now $(git -C "$HOME/skill-library/agentic-awesome-skills" rev-parse --short=7 HEAD); nothing in it loads until you pick a skill)"; else
    git -c core.hooksPath=/dev/null clone -q --depth 1 https://github.com/sickn33/antigravity-awesome-skills.git "$HOME/skill-library/agentic-awesome-skills" &&
    echo "  done: $(ls "$HOME/skill-library/agentic-awesome-skills/skills" | wc -l | tr -d ' ') skills in the library. Search: bash ~/Repo/scripts/skill-pick.sh --find <word>"
  fi
fi

echo; echo "== Everything else (Steven, 2026-11-01: 'whatever else not installed') - each y/N; keys and sign-ins stay yours"
copyskills "Social media skills: the last 2 (post-scorer, reels-scripting - need your own Apify / Gemini key to do anything)" charlie947/social-media-skills 10ca79c post-scorer reels-scripting
copyskills "ScrapeCreators research skills (10 - need a ScrapeCreators API key from scrapecreators.com, yours to buy)" ScrapeCreators/social-media-research-skills 64ba7b4 ad-library-teardown audience-research comment-mining competitor-social-research content-repurposing creator-profile-teardown influencer-prospecting outlier-post-finder product-demand-research scrapecreators-api
echo; echo "- Anatomy (one explainer-graphic skill, MIT, reviewed 1482e84)"
if have git && ask "Install the anatomy skill into ~/.claude/skills/anatomy?"; then
  if [ -e "$HOME/.claude/skills/anatomy" ]; then echo "  already there"; else
    mkdir -p "$HOME/.claude/skills"
    if git -c core.hooksPath=/dev/null clone -q https://github.com/wheresryan22/anatomy.git "$HOME/.claude/skills/anatomy" &&
       git -C "$HOME/.claude/skills/anatomy" -c advice.detachedHead=false checkout -q 1482e84; then echo "  done (held at 1482e84)"
    else rm -rf "$HOME/.claude/skills/anatomy"; echo "  failed - nothing kept"; fi
  fi
fi
echo; echo "- OpenScreen demo skill (also installs the OpenScreen desktop app + MCP; macOS will ask for Screen Recording and Accessibility)"
have npx && { ask "Run: npx skills add getopenscreen/openscreen --skill openscreen-demo ?" && npx -y skills add getopenscreen/openscreen --skill openscreen-demo -g -a claude-code -y; }
echo; echo "- spec-kit (GitHub's spec-driven development CLI, MIT)"
if have uv; then ask "uv tool install specify-cli from github/spec-kit (held at the reviewed 7370e59)?" && uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@7370e59
else echo "  uv not found - brew install uv, then re-run"; fi
echo; echo "-- Cloudflare Code Mode MCP (free to register; using it needs your Cloudflare account and sign-in in the browser)"
mcpadd cloudflare-api https://mcp.cloudflare.com/mcp "Cloudflare Code Mode; sign-in happens on first use"
echo; echo "-- Apillow Zillow MCP: not scriptable from here (sign-up, key and plan are yours; Zillow terms - Alexandra first)."
echo "   If you go ahead: sign up at apillow.co, then run the 'claude mcp add' line their page gives you. Never paste the key into a chat."
GP="$HOME/Projects/github-picks"
PICKS="huginn/huginn gitroomhq/postiz-app langchain-ai/social-media-agent soumatheusgomes/editonny debpalash/VoiceStudio ace-step/ACE-Step-1.5
black-forest-labs/flux2 LearningCircuit/local-deep-research souzatharsis/podcastfy Anil-matcha/AI-Youtube-Shorts-Generator jakeb144/reel-watcher
krillinai/OpenCreator YILS-LIN/short-video-factory Human-Agent-Society/reef CopilotKit/OpenBot paperclipai/paperclip alibaba/open-code-review
zai-org/ZCode Donchitos/Claude-Code-Game-Studios pinchtab/pinchtab microsoft/skill-recorder greenarmor/GESF HKUDS/DeepTutor
eyaltoledano/claude-task-master kalil0321/reverse-api-engineer cporter202/real-estate-data-apis cporter202/ai-agent-data-apis
cporter202/video-scraping-apis cporter202/ai-apis-you-can-ship-today cporter202/social-growth-apis-for-creators cporter202/stock-market-signal-automation
hesreallyhim/awesome-claude-code"
echo; echo "- The held apps and lists (32 repos) - downloaded to $GP so they are on hand; NOTHING is installed or run."
echo "  Each one's own README says how to start it; several need Docker, a GPU, or your own keys. Licence notes: postiz, VoiceStudio,"
echo "  short-video-factory are AGPL; flux2 [dev] weights are non-commercial. Anything that posts as you waits for Alexandra."
if have git && ask "Download all 32 into $GP (shallow copies, hooks off, nothing runs)?"; then
  mkdir -p "$GP"
  for r in $PICKS; do d="$GP/$(basename "$r")"
    if [ -d "$d" ]; then echo "  have $(basename "$r")"; else
      GIT_LFS_SKIP_SMUDGE=1 git -c core.hooksPath=/dev/null clone -q --depth 1 "https://github.com/$r.git" "$d" 2>/dev/null && echo "  got $r" || echo "  could not get $r (moved or private)"; fi
  done
fi
echo; echo "  Not installable: BillionMail (a Linux mail server; its installer refuses macOS), CleanMyLinux (Linux only), Orbit Agents"
echo "  (paid hosted service, no code), roast-room (gone), Turnitout (no engine code - a proprietary hosted web app), openclaude"
echo "  (its own licence says it redistributes Anthropic's code without permission), yqman34/reverse-api-engineer (malware)."

echo; echo "== Steven, 2026-11-02: cc-switch + career-ops (both MIT, read before this was written)"
echo "- CC Switch (farion1231/cc-switch, reviewed 9119dec): desktop app that edits Claude Code's settings and switches its API provider,"
echo "  and manages MCP servers, skills and prompts in one window. KEEP THE PROVIDER ON OFFICIAL ANTHROPIC: the 'relay' providers its"
echo "  README advertises (discount gateways) route every prompt - and any client data in it - through a third party. Not allowed here."
if have brew; then
  if brew list --cask cc-switch >/dev/null 2>&1; then echo "  already installed"
  elif ask "brew install --cask cc-switch ?"; then brew install --cask cc-switch && echo "  done - open CC Switch from Applications; leave Claude on the official provider"; fi
else echo "  Homebrew not found - install it from https://brew.sh first"; fi
echo "- career-ops (career-ops-hq/career-ops, reviewed 6825dc6, v1.38.0): AI job-search agent - scores openings against your CV,"
echo "  tailors the CV and drafts answers. It never submits: you press Submit. Your CV and profile stay in that folder on this Mac."
if have npx; then
  if [ -e "$HOME/Projects/career-ops" ]; then echo "  already there: cd ~/Projects/career-ops && claude"
  elif ask "Set up career-ops in ~/Projects/career-ops (npx @santifer/career-ops init)?"; then
    mkdir -p "$HOME/Projects" && ( cd "$HOME/Projects" && npx -y @santifer/career-ops@1.38.0 init career-ops ) &&
      echo "  done. Start: cd ~/Projects/career-ops && claude  (it walks you through your CV and target roles by chatting)"
  fi
else echo "  npx not found - brew install node first"; fi

echo; echo "== Steven, 2026-11-03: langchain, transformers, open-webui, promptfoo, new-api, spec-kit, OpenMontage, ghidra, ecommerce-intelligence-apis, openscreen (10 links, read first)"
echo "- Already yours: spec-kit (installed above, held at 7370e59), OpenMontage (integrations/openmontage), OpenScreen skill (installed above)."
echo "  The OpenScreen desktop app is installed by that skill after you agree to it; macOS then asks for Screen Recording + Accessibility."
echo "- promptfoo (promptfoo/promptfoo, MIT, reviewed 06778a3, v0.125.1): test and compare prompts/agents before you trust them (Derek / code-validator use)."
if have npm; then
  if have promptfoo; then echo "  already installed"
  elif ask "npm install -g promptfoo@0.125.1 (telemetry and update checks switched off in ~/.zprofile)?"; then
    if npm install -g promptfoo@0.125.1; then
      for v in PROMPTFOO_DISABLE_TELEMETRY PROMPTFOO_DISABLE_UPDATE; do
        grep -q "$v" "$HOME/.zprofile" 2>/dev/null || { [ -s "$HOME/.zprofile" ] && [ "$(tail -c 1 "$HOME/.zprofile")" != "" ] && printf '\n' >> "$HOME/.zprofile"; printf 'export %s=1\n' "$v" >> "$HOME/.zprofile"; }
      done
      echo "  done: promptfoo. Open a new Terminal window so the privacy settings load."
    else echo "  promptfoo install failed - nothing written to ~/.zprofile"; fi
  fi
else echo "  npm not found - brew install node first"; fi
echo "- Ghidra (NationalSecurityAgency/ghidra, Apache-2.0, reviewed 251f3603): the NSA's reverse-engineering suite. Only for software you own or may analyse"
echo "  (Elena + Alexandra gate it; see .claude/skills/reverse-engineering/SKILL.md). Needs Java; the Homebrew cask brings it."
if have brew; then
  if brew list --cask ghidra >/dev/null 2>&1; then echo "  already installed"
  elif ask "brew install --cask ghidra ?"; then brew install --cask ghidra && echo "  done: run 'ghidraRun' (first launch: macOS may ask you to allow it in Privacy & Security)"; fi
else echo "  Homebrew not found - install it from https://brew.sh first"; fi
echo "- LangChain (MIT) and Transformers (Apache-2.0) are Python LIBRARIES, not apps: they go inside a project's own virtual environment"
echo "  (python3 -m venv .venv && . .venv/bin/activate && pip install langchain  /  pip install transformers torch). Nothing global to install;"
echo "  Transformers pulls several GB (torch). Tell Claude which project needs them and it adds them there."
echo "- Open WebUI (open-webui/open-webui, 'Open WebUI License' = BSD-3 + a branding clause): a self-hosted chat window for local models (Ollama) or API keys."
echo "  Held for your yes: needs a model behind it (Ollama or a key) and a few GB; it is downloaded below (not run). To start it later: see its README 'Installation'."
echo "- new-api (QuantumNous/new-api, AGPL-3.0): a gateway that HOLDS all your upstream API keys and hands out its own. Held for your yes + Elena (it is a key vault"
echo "  and a relay); downloaded below, never run here."
echo "- cporter202/ecommerce-intelligence-apis (MIT): another link list of paid scrapers (products/prices/reviews). Off-lane for a broker: not installed, not downloaded."
GP="$HOME/Projects/github-picks"
if have git && ask "Download open-webui and new-api into $GP (shallow copies, hooks off, LFS off, nothing runs)?"; then
  mkdir -p "$GP"
  for r in open-webui/open-webui QuantumNous/new-api; do d="$GP/$(basename "$r")"
    if [ -d "$d" ]; then echo "  have $(basename "$r")"; else
      GIT_LFS_SKIP_SMUDGE=1 git -c core.hooksPath=/dev/null clone -q --depth 1 "https://github.com/$r.git" "$d" 2>/dev/null && echo "  got $r" || echo "  could not get $r (moved or private)"; fi
  done
fi
