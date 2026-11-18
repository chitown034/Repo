#!/usr/bin/env bash
# The rest of Steven's 2026-11-18 list ("install agency-agents, openworker, claude-video, agent-browser,
# automate-faceless-content, image-blaster, API-mega-list"). The Agency has its own installer
# (integrations/agency-agents/install.sh); claude-video and agent-browser are already installed by
# integrations/skill-packs/install-mac.sh and integrations/browser-agents/install.sh at today's versions.
#
# Usage (on the Mac, from the repo folder):
#   bash integrations/skill-packs/install-2026-11-18.sh image-blaster   clone image-blaster (MIT) to ~/image-blaster
#   bash integrations/skill-packs/install-2026-11-18.sh shelf           clone the two reading-only repos to ~/reference
#   bash integrations/skill-packs/install-2026-11-18.sh openworker      open the OpenWorker app download page
#   bash integrations/skill-packs/install-2026-11-18.sh status          what is in place
#
# Nothing here stores a key, buys anything or connects an account. image-blaster and OpenWorker both need paid model
# keys you choose to add yourself (CLAUDE.md HALT list: spending money, credentials).
set -euo pipefail
say() { printf '%s\n' "$*"; }
clone_at() {   # clone_at <owner/repo> <commit> <dir>
  local repo="$1" pin="$2" dir="$3"
  command -v git >/dev/null || { say "git is not installed."; exit 1; }
  if [ -d "$dir/.git" ]; then git -C "$dir" fetch -q origin 2>/dev/null || true
  elif [ -e "$dir" ]; then say "$dir exists and is not a git checkout; leaving it alone."; return 1
  else git clone -q "https://github.com/$repo.git" "$dir"; fi
  git -C "$dir" -c advice.detachedHead=false checkout -q "$pin" && say "$repo at $pin -> $dir"
}

case "${1:-status}" in
  image-blaster)
    clone_at neilsonnn/image-blaster 4acb43b "$HOME/image-blaster"
    say ""
    say "Before first use (yours; each one costs money per run):"
    say "  1. Create keys at platform.worldlabs.ai (World Labs) and fal.ai (FAL)."
    say "  2. Copy ~/image-blaster/.env.example to ~/image-blaster/.env and paste the two keys there yourself."
    say "     Never paste a key into a chat. Set a spending limit on both accounts first."
    say "  3. cd ~/image-blaster && claude, drop an image in input/, and say: blast it and confirm each step with me."
    say "  Listing photos: anything generated or altered must be labelled as such before it is used in marketing"
    say "  (MLS and DRE advertising rules; Alexandra checks before it goes out)."
    ;;
  shelf)
    mkdir -p "$HOME/reference"
    clone_at cporter202/automate-faceless-content 89abd62 "$HOME/reference/automate-faceless-content" || true
    clone_at cporter202/API-mega-list b7c914f "$HOME/reference/API-mega-list" || true
    say "Reading only: no licence is stated on either, so nothing is copied into the repo. Both carry paid-product and"
    say "referral links; the API list points at paid scrapers (Alexandra checks a site's terms before any use)."
    ;;
  openworker)
    say "OpenWorker (andrewyng/openworker, MIT) is a desktop app. Download: https://download.openworker.com/mac"
    say "On first open it asks for a model: use a local model through Ollama (free), or an Anthropic key if you decide"
    say "to pay for one (Settings -> Models & Keys). Turn on approval for every action before connecting any app."
    if [ "$(uname)" = Darwin ]; then open "https://download.openworker.com/mac"; fi
    ;;
  status)
    for d in "$HOME/image-blaster" "$HOME/reference/automate-faceless-content" "$HOME/reference/API-mega-list"; do
      if [ -d "$d/.git" ]; then say "present  $d at $(git -C "$d" rev-parse --short HEAD)"; else say "absent   $d"; fi
    done
    if [ -d "/Applications/OpenWorker.app" ]; then say "present  OpenWorker.app"; else say "absent   OpenWorker.app"; fi
    ;;
  *) say "Usage: bash integrations/skill-packs/install-2026-11-18.sh [image-blaster|shelf|openworker|status]"; exit 2 ;;
esac
