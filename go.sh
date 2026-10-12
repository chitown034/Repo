#!/bin/bash
# go.sh - Steven's ONE paste per Mac. Asks one question, then does every safe step in order and prints one report.
#
#   bash go.sh              asks "Do everything safe on this Mac?" once; Enter = no (preview only)
#   bash go.sh --preview    changes nothing, shows the plan
#
# "Safe" means: pull this branch, verify and link the brain, turn on the Agent OS, install Laya and register it with
# Claude Code, check Orca, install the browser hands and skill packs, verify Jarvis, and run the health report.
# It NEVER signs in anywhere, pairs Orca (the pairing link is yours), stores a key, spends money, touches a client
# system, or runs anything on MAC-SETUP.sh's refused list. Each step keeps going if an earlier one fails, and the
# report at the end says exactly what still needs you. Bash 3.2 safe. Run on Mac 1, then on Mac 2.
set -u
cd "$(dirname "$0")" || exit 1
BRANCH="claude/gracious-newton-4hpfco"
LOGDIR="$HOME/Library/Logs/vanessa-setup"; mkdir -p "$LOGDIR" 2>/dev/null || LOGDIR="/tmp"
LOG="$LOGDIR/go-$(date +%Y-%m-%d-%H%M).log"
PREVIEW=0; [ "${1:-}" = "--preview" ] && PREVIEW=1
PASS=""; FAIL=""; NEEDS=""
say() { printf '%s\n' "$*" | tee -a "$LOG"; }

say "Steven's one paste - $(scutil --get ComputerName 2>/dev/null || hostname -s) - $(date)"
if [ "$(uname -s)" != "Darwin" ] && [ "${GO_FORCE:-}" != "1" ]; then say "This is for a Mac. On the Alienware use go.ps1."; exit 1; fi
if [ "$PREVIEW" = 0 ]; then
  printf 'Do everything safe on this Mac now? It installs only into your home folder and never signs in, pairs or pays. [y/N] '
  read -r ans; case "$ans" in y|Y|yes|YES) ;; *) say "Preview only (you answered no). Rerun and answer y when ready."; PREVIEW=1 ;; esac
fi

step() { # <name> <needs-you-note-if-skipped> <command...>
  local name="$1" note="$2"; shift 2
  say ""; say "== $name =="
  if [ "$PREVIEW" = 1 ]; then say "  would run: $*"; return 0; fi
  if "$@" >>"$LOG" 2>&1; then say "  done"; PASS="$PASS\n  - $name"
  else say "  did not finish (see $LOG)"; FAIL="$FAIL\n  - $name"; [ -n "$note" ] && NEEDS="$NEEDS\n  - $note"; fi
}

step "1 Get today's files" "" sh -c "git fetch origin $BRANCH && git checkout $BRANCH && git pull --ff-only origin $BRANCH"
step "2 The brain (index, self-tests, encyclopedia)" "Python 3.10+ (brew install python)" sh -c "bin/brain doctor && bin/brain loop >/dev/null && bin/brain os check"
step "3 Agent OS on this Mac" "" bash integrations/agent-os/install-mac.sh --apply
step "4 Laya + Orca" "Pair Orca yourself: bash integrations/remote-control/orca-remote.sh serve --phone (Mac 1) then ... pair (Mac 2)" bash integrations/agent-os/connect-orca-laya.sh --apply
step "5 Browser hands + skill finder" "" bash integrations/browser-agents/install.sh
step "6 Skill packs" "" bash integrations/skill-packs/install-mac.sh
step "7 Jarvis + Vanessa's voice" "Jarvis: run the Toolkit tab's Jarvis check, or ask Vanessa" bash integrations/jarvis/jarvis-setup.sh --apply
step "8 Weekly events scan (first real run)" "" python3 integrations/events/events_scout.py
step "9 Health report" "" bash scripts/setup-health.sh --write
step "10 OpenMontage video studio (big download; keys are yours to type later)" "OpenMontage: paste any free key into ~/Applications/OpenMontage/.env" bash integrations/openmontage/openmontage.sh install --apply

say ""; say "================ REPORT ================"
[ -n "$PASS" ] && say "Done:$(printf "$PASS")"
[ -n "$FAIL" ] && say "Did not finish:$(printf "$FAIL")"
say ""
say "Still yours (the only things a script must not do):"
say "  - Pair Orca: Mac 1  bash integrations/remote-control/orca-remote.sh serve --phone   /  Mac 2  ... pair"
say "  - Sign in once: ShowingTime, Showami, homes.com, Strava (claude.ai > Connectors), Zoho API tick, GoHighLevel"
say "  - Type keys into ~/.config/zoho/.env and ~/.config/lofty/.env (never in chat)"
say "  - AnyDesk IDs into the Computer Hub card; the Alienware: run go.ps1 there"
[ -n "$NEEDS" ] && say "From the steps above:$(printf "$NEEDS")"
say ""; say "Log: $LOG   Health: docs/reports/SETUP-HEALTH.md"
say "Paste this whole report back to Claude and say: 'here is the go report'."
[ -z "$FAIL" ]
