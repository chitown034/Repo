#!/usr/bin/env bash
# opus-5-5-on-mac.sh — move every AI-team seat that is pinned to Claude Opus 5 onto Opus 5.5 (2026-09-28).
# Steven's decision, 2026-09-28: "in the AI team replace Opus 5 with opus 5.5". Run it ON YOUR MAC:
#
#     bash integrations/ai-team/opus-5-5-on-mac.sh            # shows what it would change; changes nothing
#     bash integrations/ai-team/opus-5-5-on-mac.sh --apply    # makes the change, with a backup first
#     bash integrations/ai-team/opus-5-5-on-mac.sh --verify   # one tiny Claude call: which model does `opus` run?
#
# Why so small: since Claude Code 2.1.280 the `opus` alias IS Opus 5.5 ("Added Claude Opus 5.5
# (claude-opus-5-5), now the default Opus model" — the CLI's own changelog). Every agent whose
# frontmatter says `model: opus` already runs on it once the CLI is 2.1.280 or newer. What still runs on
# Opus 5 is anything that names it outright: the id `claude-opus-5`, or the label "Opus 5" in
# roster-tiers.json. This script finds exactly those and nothing else.
#
# Where it looks: ~/.claude/settings.json, ~/.claude/settings.local.json, ~/.claude/agents/*.md, every
# roster-tiers.json under ~/.claude, ~/Documents and ~/Library/Application Support (4 levels), and your
# LaunchAgents. It never touches `claude-opus-5-5`, `opus`, other models, or anything outside those files.
# It never sets ANTHROPIC_DEFAULT_OPUS_MODEL in settings.json: Claude Code applies settings env OVER the
# shell's, which would override OmniRoute's free-route remap (integrations/omniroute-failover).
# macOS bash 3.2-safe.
set -euo pipefail

MODE="show"; case "${1:-}" in --apply) MODE="apply" ;; --verify) MODE="verify" ;; "") ;; *) echo "usage: $0 [--apply|--verify]" >&2; exit 64 ;; esac
STAMP="$(date +%Y-%m-%d-%H%M%S)"
BACKUP="$HOME/.claude/backups/opus-5-5-$STAMP"
say() { printf '%s\n' "$*"; }

if [ "$MODE" = "verify" ]; then
  command -v claude >/dev/null 2>&1 || { say "claude not found"; exit 1; }
  say "Asking Claude Code which model the 'opus' alias runs (one short request)…"
  claude -p --model opus --output-format json --no-session-persistence "Reply with the single word OK." \
    | python3 -c 'import json,sys
d=json.load(sys.stdin); m=sorted((d.get("modelUsage") or {}).keys())
print("   opus ran on: " + (", ".join(m) if m else "unknown (no modelUsage in the result)"))
sys.exit(0 if any("opus-5-5" in x for x in m) else 1)' \
    && say "PASS — the AI team's opus seats run on Opus 5.5." \
    || { say "Not Opus 5.5 yet — run: claude update   (Opus 5.5 is the default Opus from Claude Code 2.1.280)"; exit 1; }
  exit 0
fi

VER="$(claude --version 2>/dev/null | awk '{print $1}' || true)"
say "Claude Code version on this Mac: ${VER:-not found}"
case "$VER" in
  2.1.28[0-9]*|2.1.29*|2.[2-9]*|[3-9].*) say "   ok — 2.1.280 or newer, so 'opus' already means Opus 5.5" ;;
  *) say "   older than 2.1.280 — run 'claude update' first, or 'opus' still means Opus 5" ;;
esac

FILES=""
add() { [ -f "$1" ] && FILES="$FILES
$1"; return 0; }
add "$HOME/.claude/settings.json"; add "$HOME/.claude/settings.local.json"
for f in "$HOME"/.claude/agents/*.md "$HOME"/Library/LaunchAgents/*.plist; do add "$f"; done
while IFS= read -r f; do add "$f"; done < <(find "$HOME/.claude" "$HOME/Documents" "$HOME/Library/Application Support" \
  -maxdepth 4 -name 'roster-tiers.json' 2>/dev/null || true)

hits=0; changed=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  n="$(grep -c -E 'claude-opus-5([^-0-9]|$)|"Opus 5([^.0-9]|$)' "$f" 2>/dev/null || true)"
  [ "${n:-0}" -gt 0 ] || continue
  hits=$((hits + n))
  say "   $n  $f"
  if [ "$MODE" = "apply" ]; then
    mkdir -p "$BACKUP"; cp -p "$f" "$BACKUP/$(printf '%s' "$f" | tr '/' '_')"
    python3 - "$f" <<'PYEDIT'
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s2 = re.sub(r"claude-opus-5(?![-\d])", "claude-opus-5-5", s)
s2 = re.sub(r"\"Opus 5(?![.\d])", "\"Opus 5.5", s2)
if s2 != s:
    open(p, "w", encoding="utf-8").write(s2)
PYEDIT
    changed=$((changed + 1))
  fi
done <<LIST
$FILES
LIST

if [ "$hits" -eq 0 ]; then
  say "Nothing on this Mac names Opus 5 outright. With Claude Code 2.1.280+, the AI team is already on Opus 5.5."
elif [ "$MODE" = "apply" ]; then
  say "Changed $changed file(s). Backup: $BACKUP"
  say "Undo: copy the files in that folder back (each name is the original path with / turned into _)."
  say "Then check it: bash integrations/ai-team/opus-5-5-on-mac.sh --verify"
else
  say "Found $hits pin(s) to Opus 5 above. Nothing was changed. To switch them: bash integrations/ai-team/opus-5-5-on-mac.sh --apply"
fi
say "Your own Claude Code sessions: type /model and pick Opus 5.5 (or 'opus') once — a session keeps the model it started with."
