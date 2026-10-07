#!/usr/bin/env bash
# Agent Chrome for browser-use (2026-10-07): a separate, hidden Chrome with its own empty profile (none of your
# logins, cookies or bookmarks) that browser-use drives instead of your everyday Chrome. install-mac.sh copies
# this file to ~/Applications/browser-use/ and registers "agent-chrome.sh mcp" with Claude Code.
#
#   agent-chrome.sh start    start it if it is not already running (no window, nothing to click)
#   agent-chrome.sh mcp      start it, then run the browser-use MCP server against it (Claude Code calls this)
#   agent-chrome.sh status   say whether it is running
#   agent-chrome.sh stop     close it
#
# It listens only on this computer (127.0.0.1) on port 9333, not 9222, so it never collides with the
# remote-debugging switch of your everyday Chrome. If it is not running, browser-use stops with an error
# rather than falling back to your everyday Chrome (checked in the cloud sandbox 2026-10-07).
# In "mcp" mode nothing may be printed to standard output: that channel belongs to the MCP server.
set -u

PORT="${AGENT_CHROME_PORT:-9333}"
PROFILE="${AGENT_CHROME_PROFILE:-$HOME/Applications/browser-use/agent-profile}"
CHROME="${AGENT_CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
BU="${BROWSER_USE_BIN:-$(command -v browser-use 2>/dev/null || echo "$HOME/.local/bin/browser-use")}"
URL="http://127.0.0.1:$PORT"

up() { curl -s --max-time 1 "$URL/json/version" >/dev/null 2>&1; }

start() {
  up && return 0
  [ -x "$CHROME" ] || { echo "agent-chrome: Google Chrome not found at $CHROME" >&2; return 1; }
  mkdir -p "$PROFILE"
  nohup "$CHROME" --headless=new --user-data-dir="$PROFILE" --remote-debugging-port="$PORT" \
    --no-first-run --no-default-browser-check about:blank >/dev/null 2>&1 &
  for _ in $(seq 1 60); do up && return 0; sleep 0.25; done
  echo "agent-chrome: started, but nothing answers on $URL" >&2
  return 1
}

case "${1:-status}" in
  start)  start && echo "Agent Chrome is running on $URL (hidden, separate profile)." ;;
  mcp)    start || true
          export BU_CDP_URL="$URL"
          exec "$BU" --cli-mcp ;;
  status) if up; then echo "Agent Chrome is running on $URL."; else echo "Agent Chrome is not running."; fi ;;
  stop)   pkill -f -- "--user-data-dir=$PROFILE" 2>/dev/null; echo "Agent Chrome closed." ;;
  *)      echo "usage: agent-chrome.sh start|mcp|status|stop" >&2; exit 2 ;;
esac
