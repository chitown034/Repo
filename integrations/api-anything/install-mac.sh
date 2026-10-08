#!/usr/bin/env bash
# API Anything on Steven's Mac (2026-10-08): teaches Claude a website once, then calls it like an API (plain HTTP,
# JSON back) instead of driving a browser. Run it in Terminal from your Repo folder:
#
#     git pull && bash integrations/api-anything/install-mac.sh
#
# Safe to re-run. Tested in the cloud sandbox 2026-10-08 (api-anything 0.1.0, commit 0b556c3, Node 22.22): built and
# installed, a plain-HTTP call returned JSON in 345 ms, and its MCP server listed its four tools. Nothing here has run
# on a Mac yet, so read what it prints. Rules for agents: integrations/api-anything/README.md.
set -euo pipefail

AA_COMMIT="0b556c3"
say()  { printf '%s\n' "$*"; }
step() { printf '\n==== %s\n' "$*"; }
fail() { printf '\napi-anything: %s\n' "$*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
command -v brew >/dev/null 2>&1 || fail "Homebrew is not installed (https://brew.sh), then run this again."

step "1/4  Node 22.13 or newer"
node_ok() { command -v node >/dev/null 2>&1 && node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)'; }
if ! node_ok; then
  command -v fnm >/dev/null 2>&1 || brew install fnm
  eval "$(fnm env)"; fnm install 24 >/dev/null; fnm use 24 >/dev/null
fi
node_ok || fail "could not get Node 22.13+"
say "node $(node -v)"

step "2/4  api-anything ($AA_COMMIT)"
dir="$(mktemp -d)"
git clone -q https://github.com/goodnight000/api-anything.git "$dir"
git -C "$dir" checkout -q "$AA_COMMIT"
(cd "$dir" && npm ci --no-audit --no-fund && npm install -g "$(npm pack --silent | tail -1)") \
  || { rm -rf "$dir"; fail "install failed. If it says EACCES, do not use sudo — tell Claude."; }
rm -rf "$dir"
AA="$(command -v api-anything)" || fail "api-anything is not on PATH after install"
# Real paths, so Claude Code can start the server even when fnm's per-shell PATH is not loaded.
realp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }
NODE_BIN="$(realp "$(command -v node)")"
CLI_JS="$(realp "$(npm root -g)/api-anything/dist/cli.js")"
[ -f "$CLI_JS" ] || fail "cannot find api-anything's cli.js under $(npm root -g)"
say "installed: $AA ($("$AA" --version)) · server: $NODE_BIN $CLI_JS mcp"

step "3/4  Self-test (Hacker News search, plain HTTP)"
out="$("$AA" call hacker-news search query=sqlite 2>&1 || true)"
case "$out" in
  *'"ok":true'*) say "Self-test passed: a plain-HTTP call returned JSON." ;;
  *) say "Self-test did not pass. It printed: ${out:0:300}"; say "(If it says Google Chrome is needed: install Chrome; it is only for teaching new sites.)" ;;
esac

step "4/4  Claude Code"
if command -v claude >/dev/null 2>&1; then
  if claude mcp list 2>/dev/null | grep -q '^api-anything'; then
    say "Claude Code already has the 'api-anything' MCP server."
  else
    claude mcp add --scope user api-anything -- "$NODE_BIN" "$CLI_JS" mcp && say "Registered 'api-anything' with Claude Code (four tools: list_sites, list_operations, call_operation, login)."
  fi
  mkdir -p "$HOME/.claude/skills/api-anything"
  cp "$(npm root -g)/api-anything/skills/api-anything/SKILL.md" "$HOME/.claude/skills/api-anything/SKILL.md" && say "Skill installed (teaches Claude to turn a site into operations)."
else
  say "Claude Code's 'claude' command was not found. Later: claude mcp add --scope user api-anything -- $NODE_BIN $CLI_JS mcp"
fi
say ""
say "Done. Restart Claude Code, then try: \"What sites can API Anything call?\""
say "Rules (read before teaching it a site): integrations/api-anything/README.md"
