#!/usr/bin/env bash
# browser-use on Steven's Mac (2026-10-07). Lets Claude Code open web pages, read them and take screenshots in a
# separate, hidden "agent Chrome" that has none of your logins. Run it in Terminal from your Repo folder:
#
#     git pull && bash integrations/browser-use/install-mac.sh
#
# Safe to re-run: every step checks what is already there first. Tested in the cloud sandbox 2026-10-07 on Linux
# with Chromium (browser-use 0.13.11): the command line and the MCP server each opened a test page in a separate
# profile and read it back. Nothing here has run on a Mac yet, so read what it prints.
#
#   1. uv           — the Python tool installer (Homebrew), if it is missing.
#   2. browser-use  — version 0.13.11 in its own Python 3.12 environment (uv tool install).
#   3. Telemetry    — off (browser-use telemetry disable).
#   4. Agent Chrome — ~/Applications/browser-use/agent-chrome.sh, then a self-test: open a test page, read it back.
#   5. Claude Code  — registers the MCP server "browser-use" (all projects), pinned to the agent Chrome.
#
# Not done, on purpose: "browser-use skill install" (that skill drives your everyday, logged-in Chrome) and
# "browser-use auth login" (Browser Use Cloud is a separate paid account). Undo everything:
#     claude mcp remove -s user browser-use; uv tool uninstall browser-use; rm -rf ~/Applications/browser-use
set -euo pipefail

BU_VERSION="0.13.11"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/Applications/browser-use"
CHROME_APP="/Applications/Google Chrome.app"

say()  { printf '%s\n' "$*"; }
step() { printf '\n==== %s\n' "$*"; }
fail() { printf '\ninstall: %s\n' "$*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
command -v brew >/dev/null 2>&1 || fail "Homebrew is not installed. Paste the one-line installer from https://brew.sh into Terminal, then run this again."
[ -d "$CHROME_APP" ] || fail "Google Chrome is not in /Applications. Install Chrome, then run this again."

# ---- 1. uv ---------------------------------------------------------------------------------------
step "1/5  uv"
if command -v uv >/dev/null 2>&1; then say "uv is already installed ($(uv --version))."; else brew install uv; fi

# ---- 2. browser-use ------------------------------------------------------------------------------
step "2/5  browser-use $BU_VERSION"
BU="$(uv tool dir --bin)/browser-use"
have="$(uv tool list 2>/dev/null | awk '$1=="browser-use"{print $2}')"
if [ "$have" = "v$BU_VERSION" ]; then
  say "browser-use $BU_VERSION is already installed."
else
  uv tool install --force --python 3.12 "browser-use==$BU_VERSION"
fi
[ -x "$BU" ] || fail "browser-use did not land at $BU"

# ---- 3. Telemetry --------------------------------------------------------------------------------
step "3/5  Telemetry off"
"$BU" telemetry disable >/dev/null
ts="$("$BU" telemetry status)"
case "$ts" in *'"enabled": false'*) say "Anonymous usage pings are off." ;; *) fail "telemetry did not switch off: $ts" ;; esac

# ---- 4. Agent Chrome + self-test -----------------------------------------------------------------
step "4/5  Agent Chrome and a self-test"
mkdir -p "$DEST"
install -m 0755 "$HERE/agent-chrome.sh" "$DEST/agent-chrome.sh"
BROWSER_USE_BIN="$BU" "$DEST/agent-chrome.sh" start
out="$(cd /tmp && BU_CDP_URL=http://127.0.0.1:9333 "$BU" 2>&1 <<'PY'
new_tab("data:text/html,<title>bu-smoke</title><h1 id=x>browser-use works</h1>")
print("H1:", js("document.getElementById('x').textContent"))
PY
)" || true
"$BU" --reload >/dev/null 2>&1 || true
"$DEST/agent-chrome.sh" stop >/dev/null
case "$out" in
  *"H1: browser-use works"*) say "Self-test passed: the agent Chrome opened a test page and browser-use read it back." ;;
  *) fail "self-test failed. browser-use printed: $out" ;;
esac

# ---- 5. Claude Code ------------------------------------------------------------------------------
step "5/5  Claude Code"
if command -v claude >/dev/null 2>&1; then
  if claude mcp list 2>/dev/null | grep -q '^browser-use'; then
    say "Claude Code already has the 'browser-use' MCP server."
  else
    claude mcp add -s user browser-use --env BROWSER_USE_BIN="$BU" -- "$DEST/agent-chrome.sh" mcp \
      && say "Registered 'browser-use' with Claude Code (all projects): two tools, browser_exec and browser_screenshot."
  fi
else
  say "Claude Code's 'claude' command was not found, so nothing was registered. Later:"
  say "  claude mcp add -s user browser-use --env BROWSER_USE_BIN=$BU -- $DEST/agent-chrome.sh mcp"
fi

say ""
say "Done. In a new Claude Code session, ask e.g.: \"use browser-use to open <a public web page> and summarise it\"."
say "The agent Chrome starts hidden when Claude Code starts. Close it any time: $DEST/agent-chrome.sh stop"
say "Rules for agents using it: integrations/browser-use/README.md"
