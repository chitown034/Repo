#!/bin/bash
# install-mac.sh - turn on the Agent OS on one Mac: every roster agent reachable through Laya (lane), Jarvis (recall)
# and Orca (launch). Run it once on EACH Mac. Bash 3.2 safe (macOS default).
#
#   bash integrations/agent-os/install-mac.sh            read-only: checks everything, writes a local status file
#   bash integrations/agent-os/install-mac.sh --apply    the same, plus two safe local steps (below)
#
# --apply changes ONLY: (1) ~/.local/bin/brain (a symlink to this repo's bin/brain) and (2) ~/.config/agent-os/config
# (the repo path, chmod 600). It never installs an app, logs in, pairs Orca, edits a skill, an MCP server, a runner task
# or a live prompt, opens a port, or reads client data. Anything it finds missing it names with the one command to run.
set -u
MODE="${1:---verify}"
case "$MODE" in --verify|--apply) ;; -h|--help) sed -n 2,11p "$0"; exit 0 ;; *) echo "unknown option $MODE (try --help)" >&2; exit 2 ;; esac

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
HOST="$(scutil --get ComputerName 2>/dev/null || hostname -s 2>/dev/null || echo mac)"
HOST="$(printf '%s' "$HOST" | LC_ALL=C tr -cd 'A-Za-z0-9 ._()@+-' | cut -c1-40)"
OK=0; WARN=0; BAD=0
ok()   { printf '  ok    %s\n' "$*"; OK=$((OK+1)); }
warn() { printf '  WARN  %s\n' "$*"; WARN=$((WARN+1)); }
bad()  { printf '  FAIL  %s\n' "$*"; BAD=$((BAD+1)); }

echo "Agent OS - $HOST - $(date -u +%Y-%m-%dT%H:%M:%SZ) - mode $MODE"
echo "repo: $REPO"

echo "1. Platform and tools"
if [ "$(uname -s)" = "Darwin" ] || [ "${AGENT_OS_FORCE:-}" = "1" ]; then ok "macOS"; else bad "this script is for a Mac (the Alienware uses install-alienware.ps1)"; fi
for t in git python3; do command -v "$t" >/dev/null 2>&1 && ok "$t found" || bad "$t missing"; done
if command -v claude >/dev/null 2>&1; then ok "Claude Code CLI: $(claude --version 2>/dev/null | head -n 1)"; else bad "Claude Code CLI missing - install it first (https://claude.com/claude-code)"; fi

echo "2. The brain and the roster"
if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)' 2>/dev/null; then
  ok "python3 is 3.10 or newer"
  if out="$("$REPO/bin/brain" os check 2>&1)"; then ok "$(printf '%s' "$out" | head -n 1)"; else bad "bin/brain os check failed: $(printf '%s' "$out" | head -n 2 | tr '\n' ' ')"; fi
else
  bad "python3 older than 3.10 - the brain needs 3.10+ (brew install python)"
fi

echo "3. Agent files Claude Code can launch"
AGDIR="${HOME}/.claude/agents"; TOTAL=0; HAVE=0; MISSING=""
if [ -f "$REPO/integrations/agent-os/agents.json" ]; then
  for s in $(grep -o '"slug": "[^"]*"' "$REPO/integrations/agent-os/agents.json" | sed 's/"slug": "//; s/"$//'); do
    TOTAL=$((TOTAL+1))
    if [ -f "$AGDIR/$s.md" ]; then HAVE=$((HAVE+1)); else MISSING="$MISSING $s"; fi
  done
fi
if [ "$TOTAL" -eq 0 ]; then bad "integrations/agent-os/agents.json missing - run: bin/brain os write"
elif [ "$HAVE" -eq "$TOTAL" ]; then ok "all $TOTAL roster agents have a file in ~/.claude/agents"
else warn "$HAVE of $TOTAL roster agents have a file in ~/.claude/agents; missing: $(printf '%s' "$MISSING" | tr ' ' '\n' | sed '/^$/d' | head -n 8 | tr '\n' ' ')... (those start as a persona skill or through their lead until the file exists)"; fi

echo "4. Orca (runs the agents side by side)"
ORCA="$(command -v orca 2>/dev/null || true)"
if [ -z "$ORCA" ] && [ -d /Applications/Orca.app ]; then ORCA="/Applications/Orca.app"; fi
if [ -n "$ORCA" ]; then ok "Orca found at $ORCA (pair the phone and the other Mac with: bash integrations/remote-control/orca-remote.sh serve)"; else warn "Orca not found - install stablyai/orca, then rerun"; fi

echo "5. Laya (zero-token first hop)"
LV="${LAYA_VENV_DIR:-$HOME/laya-venv}"
if [ -x "$LV/bin/laya" ] || command -v laya >/dev/null 2>&1; then ok "Laya installed"; else warn "Laya not installed - run: bash integrations/laya/install.sh"; fi

echo "6. Jarvis (on-device recall and voice)"
if [ -f "$REPO/integrations/jarvis/jarvis-setup.sh" ]; then
  J="$(bash "$REPO/integrations/jarvis/jarvis-setup.sh" --verify 2>&1 | tail -n 4)"
  if printf '%s' "$J" | grep -qi 'unverified\|fail\|missing'; then warn "Jarvis check says: $(printf '%s' "$J" | tail -n 2 | tr '\n' ' ' | cut -c1-200)"; else ok "Jarvis verified: $(printf '%s' "$J" | tail -n 1 | cut -c1-120)"; fi
else warn "jarvis-setup.sh not in this checkout"; fi

if [ "$MODE" = "--apply" ]; then
  echo "7. Safe local steps (--apply)"
  mkdir -p "$HOME/.local/bin" "$HOME/.config/agent-os"
  ln -sf "$REPO/bin/brain" "$HOME/.local/bin/brain" && ok "linked ~/.local/bin/brain -> $REPO/bin/brain"
  umask 077; printf 'AGENT_OS_REPO=%s\n' "$REPO" > "$HOME/.config/agent-os/config" && ok "wrote ~/.config/agent-os/config"
  case ":$PATH:" in *":$HOME/.local/bin:"*) ok "~/.local/bin is on PATH" ;; *) warn "add ~/.local/bin to PATH (zshrc): export PATH=\"\$HOME/.local/bin:\$PATH\"" ;; esac
fi

mkdir -p "$REPO/brain/state"
printf '{"machine":"%s","kind":"mac","checkedAt":"%s","ok":%s,"warn":%s,"fail":%s,"agentFiles":%s,"agentsTotal":%s}\n' \
  "$HOST" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$OK" "$WARN" "$BAD" "$HAVE" "$TOTAL" > "$REPO/brain/state/agent-os-status.json"
echo
echo "Result: $OK ok, $WARN warnings, $BAD failures. Try it: bin/brain os run \"prepare a VA loan scenario in Temecula\""
[ "$BAD" -eq 0 ]
