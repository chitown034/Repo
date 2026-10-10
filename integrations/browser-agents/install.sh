#!/usr/bin/env bash
# install.sh — browser control + skill discovery for Steven's Mac (2026-10-10). macOS bash 3.2 safe.
# Asks y/N before EACH change (Enter = no). --dry-run asks and changes nothing. Never asks for or stores a password or key.
#   1. agent-browser (Vercel Labs, Apache-2.0) — fast browser CLI for Claude Code, pinned 0.39.0, + its Chrome for Testing
#   2. Playwright MCP (Microsoft, Apache-2.0) — 25 browser tools for Claude Code (user scope), pinned 0.0.83, own profile
#   3. The same Playwright MCP for Claude Desktop — PRINTED, not written (Steven pastes it; the config is his)
#   4. skills CLI (Vercel Labs, MIT) — `npx skills find <topic>` / `npx skills add <repo>`; nothing global to install
#   5. Global copies of the skills this repo vendors (agent-browser, find-skills, web-design-guidelines, writing-guidelines)
#   6. Self-test: opens a local test page, fills a field, clicks, reads the result — proves control works
set -u
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
AB_VER=0.39.0; PW_VER=0.0.83
PROFILE="$HOME/.config/playwright-mcp/profile"
ask() { if [ $DRY = 1 ]; then echo "  [dry-run] would ask: $1"; return 1; fi; printf '  %s [y/N] ' "$1"; read -r a || a=''; case "$a" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac; }
ok()  { echo "  done: $*"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "  missing: $1 — $2"; return 1; }; }
echo "Browser control + skill discovery installer (dry-run=$DRY)"
need node "install Node first: brew install node" || exit 1
need npm "comes with Node" || exit 1

echo; echo "1. agent-browser $AB_VER (Claude Code drives Chrome: open, read, fill, click, screenshot)"
if command -v agent-browser >/dev/null 2>&1; then echo "  installed: $(agent-browser --version 2>/dev/null)"; fi
if ask "npm install -g agent-browser@$AB_VER, then download its Chrome for Testing?"; then
  npm install -g "agent-browser@$AB_VER" && agent-browser install && ok "agent-browser $(agent-browser --version)"
fi

echo; echo "2. Playwright MCP $PW_VER for Claude Code (user scope; its own browser profile at $PROFILE)"
if command -v claude >/dev/null 2>&1; then
  if claude mcp list 2>/dev/null | grep -q '^playwright'; then echo "  already registered: $(claude mcp list 2>/dev/null | grep '^playwright')"
  elif ask "Register it: claude mcp add --scope user playwright -- npx -y @playwright/mcp@$PW_VER --user-data-dir $PROFILE ?"; then
    mkdir -p "$PROFILE" && chmod 700 "$HOME/.config/playwright-mcp" &&
    claude mcp add --scope user playwright -- npx -y "@playwright/mcp@$PW_VER" --user-data-dir "$PROFILE" && ok "playwright MCP registered"
  fi
else echo "  claude CLI not found — skip (install Claude Code first)"; fi

echo; echo "3. Claude Desktop (not edited by this script). To give Desktop the same browser tools:"
cat <<EOT
  Claude Desktop → Settings → Developer → Edit Config, and add inside "mcpServers":
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@$PW_VER", "--user-data-dir", "$PROFILE"] }
  Save, quit and reopen Claude Desktop. (Claude in Chrome and computer use stay available as before.)
EOT

echo; echo "4. skills CLI — nothing to install. Use it any time:"
echo "  npx -y skills@1.7.2 find <topic>        # search the open skills directory (skills.sh)"
echo "  npx -y skills@1.7.2 add <owner/repo>    # adds a skill; Elon + Elena review it first (README: Guardrails)"

echo; echo "5. Global skills (so every Claude Code session on this Mac has them, not only this repo)"
for s in agent-browser find-skills web-design-guidelines writing-guidelines; do
  src="$REPO/.claude/skills/$s"; dst="$HOME/.claude/skills/$s"
  [ -f "$src/SKILL.md" ] || { echo "  missing in repo: $s"; continue; }
  if [ -f "$dst/SKILL.md" ] && cmp -s "$src/SKILL.md" "$dst/SKILL.md"; then echo "  up to date: $s"; continue; fi
  if ask "Copy $s to ~/.claude/skills/ ?"; then mkdir -p "$dst" && cp "$src/SKILL.md" "$dst/SKILL.md" && ok "$s"; fi
done

echo; echo "6. Self-test (local page only, nothing leaves the Mac)"
if command -v agent-browser >/dev/null 2>&1 && [ $DRY = 0 ]; then
  T="$(mktemp -d)/t.html"
  printf '%s' '<input placeholder="Search address"><button onclick="document.getElementById(&quot;o&quot;).textContent=&quot;searched:&quot;+document.querySelector(&quot;input&quot;).value">Search</button><p id="o"></p>' > "$T"
  agent-browser open "file://$T" >/dev/null 2>&1 && agent-browser fill 'input' "123 Main St Temecula" >/dev/null 2>&1 &&
    agent-browser click 'button' >/dev/null 2>&1 && R=$(agent-browser get text '#o' 2>/dev/null | tail -1)
  agent-browser close >/dev/null 2>&1
  case "${R:-}" in *"searched:123 Main St Temecula"*) echo "  BROWSER SELF-TEST PASS — open, fill, click, read all work" ;; *) echo "  BROWSER SELF-TEST FAIL (got: ${R:-nothing}) — run: agent-browser doctor" ;; esac
else echo "  skipped (agent-browser not installed, or dry-run)"; fi
echo; echo "Paste the lines above back to Claude so the dashboards can show it as installed."
