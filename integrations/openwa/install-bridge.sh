#!/usr/bin/env bash
# install-bridge.sh — let Vanessa answer in your WhatsApp "Message Yourself" chat (2026-09-28).
# Run it ON YOUR MAC, from the Repo, after setup-phone.sh has linked your phone:
#
#     bash integrations/openwa/install-bridge.sh              # install and start
#     bash integrations/openwa/install-bridge.sh --uninstall  # stop it and remove it
#
# Safe to re-run: it replaces its own LaunchAgent and settings each time.
#   1. checks OpenWA is up and your phone is linked (the "steven-selfchat" session is ready);
#   2. stores the bridge's two settings (the session id and your self-chat id) in the Keychain item
#      'openwa-vanessa-bridge' — read with the admin key once here, never printed or written to a file;
#   3. finds Claude Code and runs the bridge's self-test, which sends nothing;
#   4. installs a LaunchAgent that keeps integrations/openwa/vanessa-bridge.py running: it starts at
#      login, restarts if it stops, and checks your self-chat every 20 seconds.
# The bridge only ever writes to your own "Message Yourself" chat, and Vanessa answers with read-only
# tools (no commands, no file edits). Rules and limits: vanessa-bridge.py's header.
set -euo pipefail

API="${OPENWA_API:-http://127.0.0.1:2785/api}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
SESSION_NAME="steven-selfchat"
LABEL="com.stevenshearrill.vanessa-whatsapp-bridge"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
ITEM="openwa-vanessa-bridge"
LOG="$HOME/Library/Logs/vanessa-whatsapp-bridge.log"

say()  { printf '%s\n' "$*"; }
fail() { printf '\ninstall-bridge: %s\n' "$*" >&2; exit 1; }
kc()   { security find-generic-password -a "$USER" -s "$1" -w 2>/dev/null || true; }
api()  { local key="$1"; shift; printf 'header = "X-API-Key: %s"\n' "$key" | curl -sS --max-time 20 -K - "$@"; }
field() { python3 -c 'import json,sys
try: d=json.load(sys.stdin)
except Exception: print(""); sys.exit(0)
for k in sys.argv[1].split("."):
    d = d.get(k) if isinstance(d, dict) else None
print("" if d is None else d)' "$1"; }

unload() {
  launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || launchctl unload "$PLIST" >/dev/null 2>&1 || true
}

if [ "${1:-}" = "--uninstall" ]; then
  unload
  rm -f "$PLIST"
  security delete-generic-password -a "$USER" -s "$ITEM" >/dev/null 2>&1 || true
  say "Removed: Vanessa no longer answers on WhatsApp. OpenWA and your linked phone are untouched"
  say "(integrations/openwa/README.md, 'How to undo all of it', removes those too)."
  exit 0
fi

main() {
  [ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
  for c in python3 curl security launchctl; do command -v "$c" >/dev/null 2>&1 || fail "'$c' not found"; done

  # ---- 1. OpenWA up, phone linked -----------------------------------------------------------------
  curl -fsS --max-time 5 "$API/health" >/dev/null 2>&1 \
    || fail "OpenWA is not answering on this Mac. Start Docker Desktop, then run: bash integrations/openwa/setup-phone.sh"
  ADMIN="$(kc openwa-admin-key)"
  [ -n "$ADMIN" ] || fail "no OpenWA admin key in the Keychain — run: bash integrations/openwa/setup-phone.sh"
  [ -n "$(kc openwa-vanessa-operator-key)" ] || fail "Vanessa's key is missing — run: bash integrations/openwa/setup-phone.sh"
  SID="$(api "$ADMIN" "$API/sessions" | python3 -c 'import json,sys
try: d=json.load(sys.stdin)
except Exception: d=[]
rows = d if isinstance(d, list) else (d.get("data") or d.get("items") or d.get("sessions") or [])
print(next((r.get("id","") for r in rows if isinstance(r, dict) and r.get("name") == sys.argv[1]), ""))' "$SESSION_NAME")"
  [ -n "$SID" ] || fail "no WhatsApp session named '$SESSION_NAME' — run: bash integrations/openwa/setup-phone.sh"
  ST="$(api "$ADMIN" "$API/sessions/$SID" | field status)"
  [ "$ST" = "ready" ] || fail "your phone is not linked yet (session status: ${ST:-unknown}) — run: bash integrations/openwa/setup-phone.sh"
  PHONE="$(api "$ADMIN" "$API/sessions/$SID" | field phone | tr -cd '0-9')"
  [ -n "$PHONE" ] || fail "OpenWA has not reported your number yet — wait a minute and run this again"
  unset ADMIN
  say "== OpenWA is up and your phone is linked"

  # ---- 2. the bridge's settings, Keychain only -------------------------------------------------------
  security add-generic-password -U -a "$USER" -s "$ITEM" -w "{\"sid\":\"$SID\",\"me\":\"${PHONE}@c.us\"}"
  unset PHONE
  say "== bridge settings stored in the Keychain item '$ITEM'"

  # ---- 3. Claude Code + self-test ---------------------------------------------------------------------
  CLAUDE="$(command -v claude 2>/dev/null || true)"
  for cand in "$HOME/.local/bin/claude" "$HOME/.claude/local/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
    [ -n "$CLAUDE" ] && break
    [ -x "$cand" ] && CLAUDE="$cand"
  done
  [ -n "$CLAUDE" ] || fail "Claude Code (the 'claude' command) was not found on this Mac"
  PY="/usr/bin/python3"; [ -x "$PY" ] || PY="$(command -v python3)"
  say "== self-test (sends nothing)"
  "$PY" "$HERE/vanessa-bridge.py" --check --repo "$REPO" --claude "$CLAUDE" \
    || fail "the self-test failed — the FAIL line above says which part"

  # ---- 4. LaunchAgent ------------------------------------------------------------------------------
  mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
  "$PY" - "$HERE/launchd/$LABEL.plist" "$PLIST" "$PY" "$HERE/vanessa-bridge.py" "$REPO" "$CLAUDE" "$HOME" <<'PYFILL'
import sys
from xml.sax.saxutils import escape
src, dst, py, bridge, repo, claude, home = sys.argv[1:8]
import os
path = ":".join([os.path.dirname(claude), "/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"])
text = open(src, encoding="utf-8").read()
for k, v in {"__PYTHON__": py, "__BRIDGE__": bridge, "__REPO__": repo, "__CLAUDE__": claude,
             "__PATH__": path, "__HOME__": home}.items():
    text = text.replace(k, escape(v))
assert "__" not in text.split("-->", 1)[1], "unfilled placeholder"
open(dst, "w", encoding="utf-8").write(text)
PYFILL
  plutil -lint "$PLIST" >/dev/null 2>&1 || [ "$(uname)" != "Darwin" ] || fail "the LaunchAgent file did not validate: $PLIST"
  unload
  launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || launchctl load -w "$PLIST"
  say "== LaunchAgent installed and started ($LABEL)"

  for _ in 1 2 3 4 5 6 7 8 9 10; do
    grep -q '"event": "initialized"\|"event": "started"' "$LOG" 2>/dev/null && break
    sleep 2
  done
  grep -q '"event": "started"' "$LOG" 2>/dev/null \
    && say "== the bridge is running (log: $LOG)" \
    || say "   note: no 'started' line in $LOG yet — check it in a minute: tail -5 \"$LOG\""

  say ""
  say "Done. In WhatsApp, open your \"Message Yourself\" chat and send: Vanessa, are you there?"
  say "Her answer arrives in the same chat within a minute or two, starting with [V]."
  say "Limits: 3 answers per check, 20 messages a day. Stop it any time: bash integrations/openwa/install-bridge.sh --uninstall"
}

main "$@"
