#!/bin/bash
# install-mac.sh - Kapso (WhatsApp Business Cloud API) for Claude Code on THIS Mac. Bash 3.2 safe.
#
#   bash integrations/kapso/install-mac.sh install            shows what it would do (changes nothing)
#   bash integrations/kapso/install-mac.sh install --apply    adds the plugin marketplace, installs the kapso plugin,
#                                                             registers the MCP server at user scope
#   bash integrations/kapso/install-mac.sh doctor            reports what is in place (nothing printed is secret)
#   bash integrations/kapso/install-mac.sh doctor --json     prints ONLY the whatsappKapso document (clean JSON) for a
#                                                             session or the kapso-inbox-sync task to write with
#                                                             ArtifactData (nothing here writes the deck)
#
# Nothing here signs in, sends a message or stores a key: the sign-in is `claude` -> `/mcp` -> kapso (Steven), the
# API key goes into the macOS Keychain item "kapso" by Steven's own hand. Reviewed 2026-10-13: gokapso/agent-plugins
# at a6cbfe9 (MIT) - three skills, reference docs, scripts that talk only to https://api.kapso.ai, no hooks.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
CMD="${1:-}"; FLAG="${2:-}"
MCP_URL="https://api.kapso.ai/mcp"
say() { printf '%s\n' "$*"; }
FAILED=0
do_() {
  if [ "$FLAG" = "--apply" ]; then
    say "  RUN   $*"
    "$@"; rc=$?
    if [ "$rc" != 0 ]; then say "  FAILED $1 $2 (exit $rc)"; FAILED=1; return 1; fi
  else say "  WOULD $*"; fi
}
need() { command -v "$1" >/dev/null 2>&1 || { say "  MISSING $1 - $2"; return 1; }; }

has_mcp() { claude mcp get kapso >/dev/null 2>&1; }
has_plugin() { claude plugin list 2>/dev/null | grep -qi "kapso"; }

case "$CMD" in
install)
  say "Kapso install ($([ "$FLAG" = "--apply" ] && echo APPLY || echo PREVIEW))"
  need claude "install Claude Code first (npm install -g @anthropic-ai/claude-code)" || exit 1
  if has_plugin; then say "  plugin: already installed"; else
    do_ claude plugin marketplace add gokapso/agent-plugins
    do_ claude plugin install kapso@kapso
  fi
  if has_mcp; then say "  mcp: kapso already registered ($(claude mcp get kapso 2>/dev/null | head -3 | tr '\n' ' '))"; else
    do_ claude mcp add --transport http --scope user kapso "$MCP_URL"
  fi
  say ""
  say "  Only you can do the next part: in Terminal run  claude  then type  /mcp  , choose kapso, and sign in or create"
  say "  the free Kapso account in the browser it opens. Back in Claude Code, say: Open Kapso. It opens the sandbox"
  say "  number setup; message that number from your phone and Vanessa can read and answer it from any Orca session."
  say "  Optional, for the dashboard card and the Vanessa reply task: paste your Kapso project API key into the Keychain -"
  say "    security add-generic-password -a \"\$USER\" -s kapso -w         (type the key at the prompt; it is never shown)"
  say "  and your own WhatsApp number (digits only, country code first) as the ONLY number Vanessa may answer -"
  say "    security add-generic-password -a \"\$USER\" -s kapso-allow -w   (e.g. 1951555XXXX; Phase 1 = you only)"
  [ "$FAILED" = 1 ] && { say "  install did not finish - see FAILED above"; exit 1; }
  ;;
doctor)
  if [ "$FLAG" = "--json" ]; then exec python3 "$HERE/kapso-fetch.py" --json; fi
  say "Kapso status"
  command -v claude >/dev/null 2>&1 || { say "  claude: MISSING"; exit 1; }
  has_plugin && say "  plugin: installed" || say "  plugin: not installed (install --apply)"
  has_mcp && say "  mcp: registered at $MCP_URL" || say "  mcp: not registered (install --apply)"
  if security find-generic-password -a "$USER" -s kapso >/dev/null 2>&1; then
    say "  keychain: item 'kapso' present (value never printed)"
    python3 "$HERE/kapso-fetch.py" --summary
  else
    say "  keychain: no 'kapso' item - the dashboard card stays 'not configured' until you add one"
  fi
  if security find-generic-password -a "$USER" -s kapso-allow >/dev/null 2>&1; then
    say "  keychain: item 'kapso-allow' present - Vanessa may answer that one number (value never printed)"
  else
    say "  keychain: no 'kapso-allow' item - the reply task refuses every send until you add your own number"
  fi
  say "  sign-in: run  claude  then  /mcp  and check kapso shows 'connected'"
  ;;
*)
  say "usage: $0 install [--apply] | doctor [--json]"; exit 2 ;;
esac
