#!/bin/bash
# connect-orca-laya.sh - connect Laya and Orca on THIS Mac in one go. Run on each Mac. Bash 3.2 safe.
#
#   bash integrations/agent-os/connect-orca-laya.sh            shows what it would do (changes nothing)
#   bash integrations/agent-os/connect-orca-laya.sh --apply    does it
#
# Laya : installs it if missing (integrations/laya/install.sh), registers its MCP server with Claude Code
#        (claude mcp add laya ...), and runs one routing test through the real engine.
# Orca : confirms Orca is installed, runs the safe doctor check, and tells you the one pairing command.
# It never logs in, never pairs for you (the pairing link is a secret that only you may paste, into a hidden
# prompt), never opens a public port, and never touches client data.
set -u
MODE="${1:---dry-run}"
case "$MODE" in --dry-run|--apply) ;; -h|--help) sed -n 2,13p "$0"; exit 0 ;; *) echo "unknown option $MODE (try --help)" >&2; exit 2 ;; esac
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
BAD=0
say() { printf '%s\n' "$*"; }
do_() { if [ "$MODE" = "--apply" ]; then say "  RUN   $*"; "$@"; else say "  WOULD $*"; fi; }

say "== Laya =="
LV=""
for d in "${LAYA_VENV_DIR:-}" "$HOME/laya-venv" "$HOME/Applications/laya-venv"; do
  [ -n "$d" ] && [ -x "$d/bin/laya-mcp-server" ] && { LV="$d"; break; }
done
if [ -z "$LV" ]; then
  say "  Laya is not installed (no laya-mcp-server found)."
  if ! command -v uv >/dev/null 2>&1; then say "  FAIL  'uv' is missing. Run: brew install uv   - then rerun this script."; BAD=1
  else do_ bash "$REPO/integrations/laya/install.sh"; LV="${LAYA_VENV_DIR:-$HOME/laya-venv}"; fi
else say "  ok    Laya found in $LV"; fi

if [ -n "$LV" ] && command -v claude >/dev/null 2>&1; then
  if claude mcp list 2>/dev/null | grep -q '^laya'; then say "  ok    Laya MCP server already registered with Claude Code"
  else do_ claude mcp add laya --env LAYA_DEVICE=cpu -- "$LV/bin/laya-mcp-server"; fi
elif ! command -v claude >/dev/null 2>&1; then say "  FAIL  Claude Code CLI missing - install it, then rerun."; BAD=1; fi

if [ "$MODE" = "--apply" ] && [ -n "$LV" ]; then
  say "  test  routing one sample request through the real Laya engine (no client data)"
  if out="$(python3 "$REPO/integrations/laya/laya_route.py" --engine real "What is the VA funding fee for a first-time use with no down payment?" 2>&1 | tail -n 2)"; then say "        $out"
  else say "  WARN  real engine did not answer (checkpoint download needs huggingface.co): $out"; BAD=1; fi
fi

say "== Orca =="
ORCA="$(command -v orca 2>/dev/null || true)"; [ -z "$ORCA" ] && [ -d /Applications/Orca.app ] && ORCA="/Applications/Orca.app"
if [ -z "$ORCA" ]; then say "  FAIL  Orca is not installed. Get it from github.com/stablyai/orca, then rerun."; BAD=1
else
  say "  ok    Orca found at $ORCA"
  if [ "$MODE" = "--apply" ]; then bash "$REPO/integrations/remote-control/orca-remote.sh" doctor 2>&1 | sed 's/^/        /' | tail -n 12; else say "  WOULD run: orca-remote.sh doctor"; fi
  say "  NEXT  (yours only - the pairing link is a secret) on Mac 1:  bash integrations/remote-control/orca-remote.sh serve --phone"
  say "        then on Mac 2:                                    bash integrations/remote-control/orca-remote.sh pair"
fi
say
if [ "$BAD" -eq 0 ]; then say "Result: ready. Next: bash integrations/agent-os/install-mac.sh --apply, then: bin/brain os run \"<request>\""; else say "Result: fix the lines above and rerun."; fi
[ "$BAD" -eq 0 ]
