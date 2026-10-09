#!/usr/bin/env bash
# Install and turn on Claude Mods on this Mac (Steven said "install and turn on Claude mods", 2026-10-09).
#
#   bash integrations/mods/install-mods.sh            # asks once, then installs and turns on all five
#   bash integrations/mods/install-mods.sh --dry-run  # shows what it would do, changes nothing
#   bash integrations/mods/install-mods.sh --off      # turns them all off again
#
# Turns on:
#   Steven's own (this folder, read on 2026-10-09):  route-beacon · halt-guard · brain-reflect
#   Anthropic samples (claude-code-playground, pinned to commit 569c5283d9a0, read 2026-10-09): blast-radius · replay-theater
# Left off on purpose: Cache Tax (its repo had no code to review on 2026-10-09), Savvy Progress, Reflect,
# Terminal Browser, Skins, Filetree — see RECOMMENDATIONS.md.
# Changes: adds this folder as a mod store and installs the three from it; clones the Anthropic samples into
# ~/Applications/claude-mods and names them in ~/.claude/settings.json (env CLAUDE_CODE_PLUGIN_DIRS), after a backup.
# Mods run in the Terminal and in the desktop app's Code tab. Open a new Claude Code session afterwards.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-}"
PIN=569c5283d9a0
SAMPLES="$HOME/Applications/claude-mods/claude-code-playground"
SETTINGS="$HOME/.claude/settings.json"
say() { printf '%s\n' "$*"; }
run() { if [ "$MODE" = "--dry-run" ]; then say "  would run: $*"; else "$@"; fi; }
fail() { say "install-mods: $*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || [ "$MODE" = "--dry-run" ] || fail "run this on your Mac"
command -v claude >/dev/null || fail "Claude Code is not installed (claude command not found)"
V="$(claude --version 2>/dev/null | awk '{print $1}')"
python3 - "$V" <<'PY' || fail "Claude Code $V is too old for mods; update it (claude update), then rerun"
import sys
v = tuple(int(x) for x in (sys.argv[1] or "0").split(".")[:3] if x.isdigit())
sys.exit(0 if v >= (2, 1, 287) else 1)
PY
say "Claude Code $V — mods supported."

set_dirs() { # $1 = list of folders (colon-separated) or "" to remove
  [ "$MODE" = "--dry-run" ] && { say "  would set CLAUDE_CODE_PLUGIN_DIRS in $SETTINGS to: ${1:-<removed>}"; return; }
  mkdir -p "$HOME/.claude"; [ -f "$SETTINGS" ] && cp "$SETTINGS" "$SETTINGS.bak-$(date +%Y%m%d%H%M%S)"
  python3 - "$SETTINGS" "$1" <<'PY'
import json, os, sys
p, dirs = sys.argv[1], sys.argv[2]
d = json.load(open(p)) if os.path.exists(p) and os.path.getsize(p) else {}
env = d.setdefault("env", {})
if dirs: env["CLAUDE_CODE_PLUGIN_DIRS"] = dirs
else: env.pop("CLAUDE_CODE_PLUGIN_DIRS", None)
json.dump(d, open(p, "w"), indent=2)
PY
}

if [ "$MODE" = "--off" ]; then
  for m in route-beacon halt-guard brain-reflect; do claude plugin uninstall "$m@steven-mods" >/dev/null 2>&1 && say "off: $m"; done
  set_dirs ""; say "off: blast-radius, replay-theater. Open a new session."; exit 0
fi

if [ "$MODE" != "--dry-run" ]; then
  say ""; say "This turns on 5 mods and edits ~/.claude/settings.json (a backup is kept). Mods run with your permissions."
  read -r -p "Go ahead? [y/N] " ok; [ "$ok" = y ] || [ "$ok" = Y ] || { say "Nothing changed."; exit 0; }
fi

say ""; say "1/3  Check Steven's mods"
for m in route-beacon halt-guard brain-reflect; do
  claude plugin validate "$HERE/$m" >/dev/null 2>&1 && say "  ok  $m" || fail "$m did not validate: claude plugin validate $HERE/$m"
done

say "2/3  Turn them on (mod store: $HERE)"
run claude plugin marketplace add "$HERE"
for m in route-beacon halt-guard brain-reflect; do run claude plugin install "$m@steven-mods"; done

say "3/3  Anthropic samples: blast-radius, replay-theater (pinned $PIN)"
if [ ! -d "$SAMPLES/.git" ]; then
  run mkdir -p "$(dirname "$SAMPLES")"
  run git clone -q --filter=blob:none --sparse https://github.com/anthropics/claude-code-playground.git "$SAMPLES"
  run git -C "$SAMPLES" sparse-checkout set claude-code/mods
fi
run git -C "$SAMPLES" fetch -q origin "$PIN" 2>/dev/null; run git -C "$SAMPLES" checkout -q "$PIN" 2>/dev/null
for m in blast-radius replay-theater; do
  [ "$MODE" = "--dry-run" ] || claude plugin validate "$SAMPLES/claude-code/mods/$m" >/dev/null 2>&1 || fail "$m did not validate"
done
set_dirs "$SAMPLES/claude-code/mods/blast-radius:$SAMPLES/claude-code/mods/replay-theater"

say ""; say "Done. Open a NEW Claude Code session (Terminal: claude · desktop app: Code tab). You should see:"
say "  · the status line: Route: Claude subscription   (route-beacon)"
say "  · /remember and /replay in the slash-command list (brain-reflect, replay-theater)"
say "  · a Proceed/Cancel question before any send, share, payment or force push (halt-guard, blast-radius)"
say "Turn everything off again: bash integrations/mods/install-mods.sh --off"
