#!/bin/bash
# runner-import.sh - on MAC 2: install the task runner packed by scripts/runner-export.sh (2026-10-23). Bash 3.2 safe.
#
#   bash scripts/runner-import.sh [zip]            default zip: ~/Downloads/claude-runner-mac2.zip
#   bash scripts/runner-import.sh --preview [zip]  shows what it would do
#
# Installs ~/Applications/claude-runner, ~/.local/bin/runnerctl and the LaunchAgent, rewrites the home path in the
# plist for this user, loads the agent. It never signs in: run  runnerctl login  yourself afterwards. The runner waits
# quietly until then. Both Macs must hold the lease role `peer` (scripts/second-mac.sh wrote it here).
set -u
PREVIEW=0; [ "${1:-}" = "--preview" ] && { PREVIEW=1; shift; }
ZIP="${1:-$HOME/Downloads/claude-runner-mac2.zip}"
BASE="$HOME/Applications/claude-runner"; LABEL="com.stevenshearrill.claude-runner"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
say() { printf '%s\n' "$*"; }
run() { if [ "$PREVIEW" = 1 ]; then say "  would: $*"; else "$@"; fi; }
[ -f "$ZIP" ] || { say "zip not found: $ZIP (AirDrop it from Mac 1's Desktop; it lands in ~/Downloads)"; exit 1; }
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/runner-import.XXXXXX")"; trap 'rm -rf "$STAGE"' EXIT
unzip -qo "$ZIP" -d "$STAGE" || { say "could not unzip $ZIP"; exit 1; }
[ -f "$STAGE/claude-runner/supervisor.py" ] && [ -f "$STAGE/bin/runnerctl" ] && [ -f "$STAGE/LaunchAgents/$LABEL.plist" ] || { say "zip is missing supervisor.py, runnerctl or the plist - re-export on Mac 1"; exit 1; }
if grep -rlE 'oauth-token|sk-ant-' "$STAGE/claude-runner" 2>/dev/null | grep -q .; then say "the zip holds something that looks like a token - stopping"; exit 1; fi
SRC_HOME="$(sed -n 's#.*<string>\(.*\)/Applications/claude-runner/supervisor.py</string>.*#\1#p' "$STAGE/LaunchAgents/$LABEL.plist" | head -1)"
say "runner from $ZIP -> $BASE (source home: ${SRC_HOME:-unknown}, this home: $HOME)"
if [ -d "$BASE" ]; then say "  $BASE already exists - keeping it (delete it first to replace)"; else run mkdir -p "$HOME/Applications" && run cp -Rp "$STAGE/claude-runner" "$BASE"; fi
run mkdir -p "$HOME/.local/bin" "$HOME/.claude/logs/runner" "$HOME/Library/LaunchAgents"
run cp -p "$STAGE/bin/runnerctl" "$HOME/.local/bin/runnerctl"; [ "$PREVIEW" = 1 ] || chmod +x "$HOME/.local/bin/runnerctl"
if [ "$PREVIEW" = 1 ]; then say "  would: write $PLIST with $SRC_HOME -> $HOME, then launchctl bootstrap"
else
  if [ -n "$SRC_HOME" ] && [ "$SRC_HOME" != "$HOME" ]; then sed "s#$SRC_HOME#$HOME#g" "$STAGE/LaunchAgents/$LABEL.plist" > "$PLIST"; else cp -p "$STAGE/LaunchAgents/$LABEL.plist" "$PLIST"; fi
  plutil -lint "$PLIST" >/dev/null 2>&1 || { say "plist did not validate: $PLIST"; exit 1; }
  launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$(id -u)" "$PLIST" || { say "launchctl bootstrap failed - open a new Terminal and rerun"; exit 1; }
  say "  runner installed and loaded (it waits until you sign in)"
fi
[ -s "$HOME/.config/claude-runner/role" ] || say "  WARNING: no lease role file here - run scripts/second-mac.sh first (it writes peer)"
say ""; say "Yours now:  runnerctl login   then   runnerctl status   (the computer name must differ from Mac 1's - it does)."
