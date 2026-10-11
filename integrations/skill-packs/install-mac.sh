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
echo; echo "== NOT installed on purpose (see REGISTRY-2026-10-11.md)"
echo "  claude-x-jev (OpenRouter key + sends text to a third party), apify MCP (account + spend cap), skool-mcp (uses your login cookie on a private API),"
echo "  Remotion (company licence to verify), the two API list repos (reference only)."
echo; echo "Done. Restart Claude Code, then type /plugin to see what is installed."
