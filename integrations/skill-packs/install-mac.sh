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
echo; echo "== NOT installed on purpose (see REGISTRY-2026-10-11.md and -12.md)"
echo "  Still not here after 'install all' (each needs your own explicit yes, see REGISTRY-2026-10-12b.md): oh-my-claudecode, claude-mem, gstack,"
echo "  vibe-kanban, notebooklm-skill, kondo, zapier (needs the URL from your Zapier account), github-mcp on the Mac (gh already does it)."
echo "  claude-x-jev (OpenRouter key + sends text to a third party), apify MCP (account + spend cap), skool-mcp (uses your login cookie on a private API),"
echo "  Remotion (company licence to verify), the two API list repos (reference only)."
echo; echo "Done. Restart Claude Code, then type /plugin to see what is installed."
