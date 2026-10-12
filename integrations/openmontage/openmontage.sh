#!/bin/bash
# openmontage.sh - install and check OpenMontage (calesthio/OpenMontage) on THIS Mac. Bash 3.2 safe.
#
#   bash integrations/openmontage/openmontage.sh install            shows what it would do (changes nothing)
#   bash integrations/openmontage/openmontage.sh install --apply    clones the reviewed commit, builds the venv + Remotion
#   bash integrations/openmontage/openmontage.sh doctor|status|open
#
# What it is: an agentic video-production system - Claude Code reads its pipeline YAML + skill files and calls its
# Python tools to research, script, narrate (Piper TTS works offline, no key), find royalty-free music, subtitle and
# render (Remotion / FFmpeg) a video. Reviewed 2026-10-12 at commit e45f5b1 (AGPL-3.0, 163 MB, no telemetry, no
# install hooks, every API key optional). It installs OUTSIDE this repo, into ~/Applications/OpenMontage.
# Keys: you type any paid-provider key into its .env yourself (chmod 600) - never into chat, never into this repo.
# AGPL-3.0: running it for your own videos is fine; do not host a modified copy for others without publishing source.
set -u
SHA=e45f5b1
DIR="${OPENMONTAGE_DIR:-$HOME/Applications/OpenMontage}"
CMD="${1:-}"; FLAG="${2:-}"
say() { printf '%s\n' "$*"; }
do_() { if [ "$FLAG" = "--apply" ]; then say "  RUN   $*"; "$@"; else say "  WOULD $*"; fi; }
need() { command -v "$1" >/dev/null 2>&1 || { say "  MISSING $1 - $2"; return 1; }; }

case "$CMD" in
install)
  say "OpenMontage install ($([ "$FLAG" = "--apply" ] && echo APPLY || echo PREVIEW)) -> $DIR"
  ok=1
  need python3 "brew install python" || ok=0
  need ffmpeg "brew install ffmpeg" || ok=0
  need node "brew install node" || ok=0
  need npm "comes with node" || ok=0
  need git "xcode-select --install" || ok=0
  [ "$ok" = 1 ] || { say "  install the missing tools above, then rerun"; exit 1; }
  if [ -d "$DIR/.git" ]; then
    say "  already cloned: $DIR (pinned at $(git -C "$DIR" rev-parse --short HEAD 2>/dev/null))"
  else
    do_ mkdir -p "$(dirname "$DIR")"
    do_ git clone --quiet https://github.com/calesthio/OpenMontage.git "$DIR"
  fi
  if [ "$FLAG" = "--apply" ]; then
    git -C "$DIR" fetch --quiet origin "$SHA" 2>/dev/null || true
    git -C "$DIR" checkout --quiet "$SHA" 2>/dev/null || say "  note: could not pin $SHA, staying on $(git -C "$DIR" rev-parse --short HEAD)"
  else
    say "  WOULD git -C $DIR checkout $SHA   (the reviewed commit)"
  fi
  do_ python3 -m venv "$DIR/.venv"
  do_ "$DIR/.venv/bin/python" -m pip install --quiet --upgrade pip
  do_ "$DIR/.venv/bin/python" -m pip install --quiet -r "$DIR/requirements.txt"
  do_ "$DIR/.venv/bin/python" -m pip install --quiet piper-tts
  if [ "$FLAG" = "--apply" ]; then
    say "  RUN   npm install (remotion-composer) - the big download"
    (cd "$DIR/remotion-composer" && npm install --no-fund --no-audit --loglevel=error)
  else
    say "  WOULD npm install in $DIR/remotion-composer"
  fi
  if [ ! -f "$DIR/.env" ]; then
    do_ cp "$DIR/.env.example" "$DIR/.env"
    [ "$FLAG" = "--apply" ] && chmod 600 "$DIR/.env"
  fi
  say ""
  say "  Keys are optional. Offline path works now (Piper voice + FFmpeg). For stock footage, music or AI video,"
  say "  open $DIR/.env in TextEdit and paste the key next to its name (free tiers: Pexels, Pixabay, Google TTS)."
  say "  Then open the folder in Claude Code and say: Make a 45-second explainer about VA loans for first-time buyers."
  ;;
doctor|status)
  say "OpenMontage status -> $DIR"
  [ -d "$DIR/.git" ] && say "  clone: $(git -C "$DIR" rev-parse --short HEAD) (reviewed: $SHA)" || say "  clone: not installed"
  [ -x "$DIR/.venv/bin/python" ] && say "  venv: ok ($("$DIR/.venv/bin/python" --version 2>&1))" || say "  venv: missing"
  [ -d "$DIR/remotion-composer/node_modules/remotion" ] && say "  remotion: installed" || say "  remotion: missing (npm install)"
  for t in ffmpeg node; do command -v "$t" >/dev/null 2>&1 && say "  $t: $(command -v "$t")" || say "  $t: MISSING"; done
  if [ -f "$DIR/.env" ]; then
    n=$(grep -c '^[A-Z_]*\(KEY\|TOKEN\|SECRET\)[A-Z_]*=.\+' "$DIR/.env" 2>/dev/null || echo 0); say "  .env: present, $n key(s) filled (values never printed)"
  else say "  .env: missing"; fi
  [ -x "$DIR/.venv/bin/python" ] && (cd "$DIR" && "$DIR/.venv/bin/python" -c "from tools.tool_registry import registry; registry.discover(); e=registry.support_envelope(); print('  tools:', len(e), 'registered;', len(registry.provider_menu()), 'capability groups')" 2>/dev/null || say "  tools: registry not importable yet")
  ;;
open)
  [ -d "$DIR" ] && (command -v open >/dev/null 2>&1 && open "$DIR" || say "$DIR") || say "not installed - run install --apply"
  ;;
*)
  say "usage: $0 install [--apply] | doctor | status | open"; exit 2 ;;
esac
