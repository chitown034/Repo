#!/usr/bin/env bash
# OpenMausBot (milind-soni/OpenMausBot, Apache-2.0) — a chat app where every contact is a real AI agent
# (Claude Code running locally), organised into teams with a Chief of Staff, rooms, approvals and routines.
# Steven, 2026-11-15: "install OpenMausBot and wire my AI org to be structured within Mausbots".
#
# Usage (on the Mac, from the repo folder):
#   bash integrations/openmausbot/install.sh          install or update the pinned CLI + the bots' browser
#   bash integrations/openmausbot/install.sh plan     show what the AI org would create (changes nothing)
#   bash integrations/openmausbot/install.sh apply    create or update the AI org: 9 teams, 91 bots, 10 rooms
#
# It never stores a key, never connects an app, and never turns on a routine. Every bot starts on approval
# "Ask", with no computer and no browser, so nothing a bot does happens without your yes (CLAUDE.md HALT list).
# The bots run on your own Claude Code sign-in; no API key is needed.
set -euo pipefail
VER=0.1.160   # reviewed 2026-11-15 (team apply tested end to end in the cloud sandbox); bump only after a re-review
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
TEAM="$HERE/team.yaml"
say() { printf '%s\n' "$*"; }

need_cli() {
  command -v node >/dev/null || { say "Node.js is not installed. Install it (https://nodejs.org, LTS), then run this again."; exit 1; }
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$NODE_MAJOR" -lt 24 ]; then
    say "Note: OpenMausBot asks for Node 24 or newer; this Mac has Node $(node -v). It ran on Node 22 in testing,"
    say "but if a command below fails with an unclear error, install Node 24 (https://nodejs.org) and run this again."
  fi
  if ! command -v openmausbot >/dev/null || [ "$(openmausbot --version 2>/dev/null | tr -dc '0-9.')" != "$VER" ]; then
    say "Installing the OpenMausBot command, version $VER…"
    npm install -g "openmausbot@$VER" >/dev/null
  fi
}

workspace_up() {
  openmausbot doctor >/dev/null 2>&1 && return 0
  say "No OpenMausBot workspace is running on this Mac."
  say "Either open the OpenMausBot desktop app (download: https://github.com/milind-soni/OpenMausBot/releases/latest),"
  say "or run:  openmausbot start   (first time: it asks how you want to sign in to AI; pick your Claude Code sign-in)."
  say "Then run this again."
  exit 1
}

case "${1:-install}" in
  install)
    need_cli
    say "Installing the bots' browser engine (agent-browser, pinned by OpenMausBot) and Chrome for Testing…"
    openmausbot browser install || say "Browser engine did not install; bots still work, without a browser."
    say ""
    say "OpenMausBot $(openmausbot --version 2>/dev/null) is installed."
    say "Next: open the desktop app (or 'openmausbot start'), then:  bash integrations/openmausbot/install.sh plan"
    ;;
  plan)
    need_cli; workspace_up
    python3 "$HERE/build-team.py"   # rebuild from the current roster, so the plan shows exactly what apply will do
    openmausbot team apply "$TEAM" --dry-run
    ;;
  apply)
    need_cli; workspace_up
    python3 "$HERE/build-team.py"
    openmausbot team apply "$TEAM"
    say ""
    say "Done. Your AI org is in OpenMausBot: Vanessa leads the Executive Office and every department's Chief."
    say "Seats without their own bot (the workspace holds 100 bots at most) are on their Chief's specialist bench and"
    say "run as Claude Code subagents: make sure  bash integrations/agent-os/install-mac.sh  has linked them."
    ;;
  *) say "Usage: bash integrations/openmausbot/install.sh [install|plan|apply]"; exit 2 ;;
esac
