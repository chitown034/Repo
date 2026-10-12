#!/usr/bin/env bash
# Configure Claude Code on THIS machine to route model calls through an LLM gateway.
#
#   ./scripts/setup-claude-gateway.sh https://your-gateway.example.com
#   ./scripts/setup-claude-gateway.sh --undo
#
# Writes ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN into the "env" block of
# ~/.claude/settings.json. The token is read from a hidden prompt (or the
# GATEWAY_TOKEN env var) so it never lands in shell history or git.
#
# WARNING: once a gateway credential is active, Claude Code stops using the
# claude.ai login. claude.ai Connectors, synced Skills and synced Plugins are
# unavailable in that mode. Run with --undo to go back.
set -euo pipefail

SETTINGS="${CLAUDE_SETTINGS_FILE:-$HOME/.claude/settings.json}"

usage() { sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

if ! command -v python3 >/dev/null; then
  echo "python3 is required to edit $SETTINGS safely" >&2
  exit 1
fi

mode="set"
url=""
case "${1:-}" in
  --undo) mode="undo" ;;
  -h|--help|"") usage ;;
  http://*|https://*) url="$1" ;;
  *) echo "Gateway URL must start with http:// or https://" >&2; usage ;;
esac

token=""
if [ "$mode" = "set" ]; then
  if [ -n "${GATEWAY_TOKEN:-}" ]; then
    token="$GATEWAY_TOKEN"
  else
    read -r -s -p "Gateway auth token (input hidden): " token; echo
  fi
  [ -n "$token" ] || { echo "Token cannot be empty" >&2; exit 1; }
fi

mkdir -p "$(dirname "$SETTINGS")"
[ -f "$SETTINGS" ] || echo '{}' >"$SETTINGS"
cp "$SETTINGS" "$SETTINGS.bak"

MODE="$mode" URL="$url" TOKEN="$token" SETTINGS="$SETTINGS" python3 - <<'PY'
import json, os
path = os.environ["SETTINGS"]
with open(path) as f:
    data = json.load(f)
env = data.setdefault("env", {})
if os.environ["MODE"] == "set":
    env["ANTHROPIC_BASE_URL"] = os.environ["URL"]
    env["ANTHROPIC_AUTH_TOKEN"] = os.environ["TOKEN"]
    env.pop("ANTHROPIC_API_KEY", None)
else:
    for k in ("ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_KEY"):
        env.pop(k, None)
    if not env:
        data.pop("env", None)
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY

if [ "$mode" = "set" ]; then
  echo "Gateway configured in $SETTINGS (backup at $SETTINGS.bak)"
  echo "  ANTHROPIC_BASE_URL = $url"
  echo "  ANTHROPIC_AUTH_TOKEN = (hidden)"
  echo
  echo "Restart Claude Code, then run /status to confirm the connection."
  echo "claude.ai Connectors/Skills/Plugins are disabled while this is active; --undo restores them."
else
  echo "Gateway settings removed from $SETTINGS (backup at $SETTINGS.bak)"
  echo "Restart Claude Code and run /login to return to claude.ai."
fi
