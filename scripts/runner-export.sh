#!/bin/bash
# runner-export.sh - on MAC 1: pack the task runner for the second Mac (2026-10-23). Bash 3.2 safe.
#
#   bash scripts/runner-export.sh            writes ~/Desktop/claude-runner-mac2.zip
#   bash scripts/runner-export.sh --preview  shows what would go in, writes nothing
#
# Packs: ~/Applications/claude-runner (supervisor.py, schedule.json, task files), ~/.local/bin/runnerctl, and the
# LaunchAgent plist. NEVER packs: logs, __pycache__, any oauth-token / token / .env / credential file. The sign-in on
# Mac 2 is Steven's (`runnerctl login` there). Also writes this Mac's lease role file (`peer`) if it is missing, so both
# Macs run the same role (docs/SECOND-MAC-SETUP.md 11b).
set -u
PREVIEW=0; [ "${1:-}" = "--preview" ] && PREVIEW=1
BASE="${RUNNER_BASE:-$HOME/Applications/claude-runner}"
CTL="${RUNNER_CTL:-$HOME/.local/bin/runnerctl}"
PLIST="${RUNNER_PLIST:-$HOME/Library/LaunchAgents/com.stevenshearrill.claude-runner.plist}"
OUT="${RUNNER_ZIP:-$HOME/Desktop/claude-runner-mac2.zip}"
say() { printf '%s\n' "$*"; }
[ -d "$BASE" ] || { say "no runner folder at $BASE - is this Mac 1?"; exit 1; }
[ -f "$CTL" ] || { say "no runnerctl at $CTL"; exit 1; }
[ -f "$PLIST" ] || { say "no LaunchAgent at $PLIST"; exit 1; }
if grep -rlE 'oauth-token|sk-ant-|Bearer ' "$BASE" --include='*.json' --include='*.txt' --include='*.env' 2>/dev/null | grep -q .; then
  say "a file under $BASE looks like it holds a token - not packing anything. Tell Claude which file."; exit 1; fi
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/runner-export.XXXXXX")"; trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/claude-runner" "$STAGE/bin" "$STAGE/LaunchAgents"
say "Packing from $BASE (no logs, caches, tokens or .env files):"
( cd "$BASE" && find . -type f ! -name '*.log' ! -name '*.out' ! -name '*.err' ! -path '*/__pycache__/*' ! -name 'oauth-token' ! -name '*.token' ! -name '.env' ! -name '*.pem' ! -name '*.key' ) | sed 's/^/  /' | head -60
if [ "$PREVIEW" = 1 ]; then say "  would write $OUT"; exit 0; fi
( cd "$BASE" && find . -type f ! -name '*.log' ! -name '*.out' ! -name '*.err' ! -path '*/__pycache__/*' ! -name 'oauth-token' ! -name '*.token' ! -name '.env' ! -name '*.pem' ! -name '*.key' -exec sh -c 'mkdir -p "$0/$(dirname "$1")" && cp -p "$1" "$0/$1"' "$STAGE/claude-runner" {} \; )
cp -p "$CTL" "$STAGE/bin/runnerctl"; cp -p "$PLIST" "$STAGE/LaunchAgents/"
rm -f "$OUT"; ( cd "$STAGE" && zip -qr "$OUT" claude-runner bin LaunchAgents ) || { say "zip failed"; exit 1; }
if [ ! -s "$HOME/.config/claude-runner/role" ]; then mkdir -p "$HOME/.config/claude-runner" && chmod 700 "$HOME/.config/claude-runner" && printf 'peer\n' > "$HOME/.config/claude-runner/role"; say "lease role on this Mac: wrote peer"; else say "lease role on this Mac: $(head -1 "$HOME/.config/claude-runner/role")"; fi
say ""; say "Wrote $OUT ($(du -h "$OUT" | cut -f1)). Next: AirDrop that file from this Mac's Desktop to the other Mac"
say "(Finder -> right-click the zip -> Share -> AirDrop). On the other Mac it lands in ~/Downloads. Then there:"
say "  cd ~/Repo && bash scripts/runner-import.sh && runnerctl login && runnerctl status"
