#!/usr/bin/env bash
# One script for Steven's Mac (2026-09-28): Orca, the WhatsApp connection (OpenWA) and Laya.
# Run it in Terminal from your Repo folder, with your iPhone next to you:
#
#     git pull && bash integrations/install-orca-whatsapp-laya.sh
#
# Skip any part with --skip-orca, --skip-whatsapp or --skip-laya. Safe to re-run: every step checks
# what is already there first. It was written and syntax-checked in a cloud sandbox, which cannot reach
# your Mac. Nothing here has run on a Mac yet, so read what it prints.
#
#   1. Orca     — the desktop app that runs Claude Code and Codex agents side by side (brew cask), plus
#                 the link to its phone app for watching and steering agents from anywhere.
#   2. Laya     — a local "System 1" router (about 33 ms per decision, runs on this Mac, no cloud call),
#                 installed in ~/laya-venv and registered with Claude Code as the MCP server "laya".
#   3. WhatsApp — Docker Desktop, then integrations/openwa/setup-phone.sh: OpenWA installed on this
#                 Mac only, a QR code to scan with your phone, and Vanessa's key fenced to your
#                 "Message Yourself" chat.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_ORCA=0; SKIP_WA=0; SKIP_LAYA=0; PASS_ARGS=()
for a in "$@"; do
  case "$a" in
    --skip-orca) SKIP_ORCA=1 ;; --skip-whatsapp) SKIP_WA=1 ;; --skip-laya) SKIP_LAYA=1 ;;
    *) PASS_ARGS+=("$a") ;;   # e.g. --code, passed through to setup-phone.sh
  esac
done
LAYA_VERSION="0.3.21"
LAYA_VENV="$HOME/laya-venv"

say()  { printf '%s\n' "$*"; }
step() { printf '\n==== %s\n' "$*"; }
fail() { printf '\ninstall: %s\n' "$*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
command -v brew >/dev/null 2>&1 || fail "Homebrew is not installed. Paste the one-line installer from https://brew.sh into Terminal, then run this again."
command -v git >/dev/null 2>&1 || fail "git not found — run: xcode-select --install"

# ---- 1. Orca -------------------------------------------------------------------------------------
if [ "$SKIP_ORCA" = 0 ]; then
  step "1/3  Orca"
  if [ -d "/Applications/Orca.app" ]; then
    v="$(defaults read /Applications/Orca.app/Contents/Info CFBundleShortVersionString 2>/dev/null || echo unknown)"
    say "Orca is already installed (version $v). It updates itself; to force it: brew upgrade --cask stablyai/orca/orca"
  else
    brew install --cask stablyai/orca/orca
    say "Orca installed."
  fi
  open -a Orca || true
  say "Phone app — watch and steer your agents from anywhere:"
  say "  iPhone: https://apps.apple.com/us/app/orca-ide/id6766130217   (then pair it from Orca on this Mac)"
  say "Orca only runs agents you start in it; it does not change how Vanessa or your Mac runner work."
fi

# ---- 2. Laya -------------------------------------------------------------------------------------
if [ "$SKIP_LAYA" = 0 ]; then
  step "2/3  Laya (local router)"
  command -v uv >/dev/null 2>&1 || brew install uv
  if [ -x "$LAYA_VENV/bin/laya" ]; then
    say "Laya is already installed in $LAYA_VENV."
  else
    # The canonical package (R11): venv, laya[mcp]==$LAYA_VERSION, then the one-time model download.
    bash "$HERE/laya/install.sh"
  fi
  if command -v claude >/dev/null 2>&1; then
    if claude mcp list 2>/dev/null | grep -q '^laya'; then
      say "Claude Code already has the 'laya' MCP server."
    else
      claude mcp add -s user laya --env LAYA_DEVICE=cpu -- "$LAYA_VENV/bin/laya-mcp-server" && say "Registered 'laya' with Claude Code (all projects)."
    fi
  else
    say "Claude Code's 'claude' command was not found, so Laya was not registered. Later: claude mcp add -s user laya --env LAYA_DEVICE=cpu -- $LAYA_VENV/bin/laya-mcp-server"
  fi
  say "Laya runs only on this Mac. Nothing it reads leaves the computer."
fi

# ---- 3. WhatsApp (OpenWA) ------------------------------------------------------------------------
if [ "$SKIP_WA" = 0 ]; then
  step "3/3  WhatsApp connection (OpenWA)"
  if ! command -v docker >/dev/null 2>&1; then
    say "Installing Docker Desktop (OpenWA runs inside it)…"
    brew install --cask docker
  fi
  if ! docker info >/dev/null 2>&1; then
    open -a Docker || true
    say "Docker Desktop is starting. If a window asks you to accept its terms, accept them. Waiting up to 3 minutes…"
    for _ in $(seq 1 90); do docker info >/dev/null 2>&1 && break; sleep 2; done
    docker info >/dev/null 2>&1 || fail "Docker Desktop did not finish starting — open it, wait for 'Engine running', then run: bash integrations/install-orca-whatsapp-laya.sh --skip-orca --skip-laya"
  fi
  bash "$HERE/openwa/setup-phone.sh" ${PASS_ARGS[@]+"${PASS_ARGS[@]}"}
fi

step "Done"
say "Orca, Laya and WhatsApp are set up on this Mac, except for any step above that printed an error."
say "Tell Vanessa \"Mac installs done\" in a Claude session, and paste any lines that said FAIL."
