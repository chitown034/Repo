#!/usr/bin/env bash
# Sellbird (ethanplusai/sellbird, AGPL-3.0) — open-source cold-email outreach that runs on the Claude Code sign-in:
# finds companies, finds who decides, checks the address, drafts the email, and (only when allowed) sends it.
# Steven, 2026-11-15: "install and configure sellbird within my dashboard".
#
# Usage (on the Mac, from the repo folder):
#   bash integrations/sellbird/install.sh             install or update at the reviewed commit, then lock sending
#   bash integrations/sellbird/install.sh status      one line: installed? sending paused? approval on? (no names);
#                                                     exits 1 unless it is paused with approval on
#   bash integrations/sellbird/install.sh dashboard   open Sellbird's own local dashboard (127.0.0.1:5555)
#
# It installs with sending PAUSED and leaves approval mode on. It never stores a key, never connects a mailbox,
# never trains, searches or sends. Turning sending on is Steven's call (CLAUDE.md HALT list: client sends, licensed
# advertising). The code is not copied into this repo (AGPL); it is cloned next to it.
set -euo pipefail
PIN=25ec83978b21d16ae20779d09bfea113f37f0ef8   # v0.4.0, reviewed 2026-11-15; bump only after a re-review
DIR="${SELLBIRD_DIR:-$HOME/sellbird}"
case "$DIR" in /*) ;; *) DIR="$PWD/$DIR" ;; esac   # absolute, so the commands below still resolve after cd
SB="$DIR/.venv/bin/sellbird"
say() { printf '%s\n' "$*"; }

find_python() {
  for p in python3.13 python3.12 python3.11 python3; do
    command -v "$p" >/dev/null 2>&1 || continue
    "$p" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' 2>/dev/null && { printf '%s' "$p"; return 0; }
  done
  return 1
}

guard() {   # prints the state line; exit 0 only when sending is paused AND approval is on
  [ -x "$SB" ] || { say "SELLBIRD: not installed (run: bash integrations/sellbird/install.sh)"; return 1; }
  local paused cfg at
  if [ "$(git -C "$DIR" rev-parse HEAD 2>/dev/null)" = "$PIN" ]; then at="at the reviewed commit"; else at="NOT at the reviewed commit (run the installer again)"; fi
  if (cd "$DIR" && "$SB" sending status 2>/dev/null | grep -q PAUSED); then paused="PAUSED"; else paused="ON"; fi
  cfg="$(cd "$DIR" && "$DIR/.venv/bin/python" -c '
from sellbird.config import load_config
c = load_config()
print("approval " + ("on" if c.channels.email.require_approval else "OFF (autopilot)") + " · LinkedIn " + ("ON" if c.channels.linkedin.enabled else "off"))' 2>/dev/null || echo "config unreadable")"
  say "SELLBIRD: installed $at · sending $paused · $cfg"
  [ "$paused" = PAUSED ] || return 1
  case "$cfg" in *"approval on"*) return 0 ;; *) return 1 ;; esac
}

case "${1:-install}" in
  install)
    command -v git >/dev/null || { say "git is not installed."; exit 1; }
    PY="$(find_python)" || { say "Sellbird needs Python 3.11 or newer. Run:  brew install python@3.13  then run this again."; exit 1; }
    if [ -d "$DIR/.git" ]; then git -C "$DIR" fetch -q origin "$PIN" 2>/dev/null || git -C "$DIR" fetch -q origin
    else git clone -q https://github.com/ethanplusai/sellbird.git "$DIR"; fi
    git -C "$DIR" -c advice.detachedHead=false checkout -q "$PIN"
    [ -x "$DIR/.venv/bin/python" ] || "$PY" -m venv "$DIR/.venv"
    say "Installing Sellbird into its own folder ($DIR)…"
    "$DIR/.venv/bin/pip" install -q -e "$DIR"
    HERE="$(cd "$(dirname "$0")" && pwd)"   # Steven's configuration and email rules (never overwritten)
    [ -f "$DIR/sellbird.local.yaml" ] || { [ -f "$HERE/sellbird.local.yaml" ] && cp "$HERE/sellbird.local.yaml" "$DIR/sellbird.local.yaml"; } || true
    mkdir -p "$DIR/skills"
    [ -f "$DIR/skills/email_rules.md" ] || { [ -f "$HERE/email_rules.md" ] && cp "$HERE/email_rules.md" "$DIR/skills/email_rules.md"; } || true
    (cd "$DIR" && "$SB" sending pause >/dev/null)
    guard || { say "Sellbird is NOT locked: the line above shows what is open (sending not paused, or approval off). Fix that before using it."; exit 1; }
    say ""
    say "Sellbird is installed and locked: sending is paused and every email waits for your approval."
    say "Next (yours, in $DIR): read integrations/sellbird/README.md 'Before anything is sent', then"
    say "  bash integrations/sellbird/install.sh dashboard"
    ;;
  status) guard ;;
  dashboard)
    [ -x "$SB" ] || { say "Not installed yet. Run:  bash integrations/sellbird/install.sh"; exit 1; }
    cd "$DIR" && exec "$SB" dashboard
    ;;
  *) say "Usage: bash integrations/sellbird/install.sh [install|status|dashboard]"; exit 2 ;;
esac
