#!/usr/bin/env bash
# Vanessa speaks on iMessage — one setup command for the Mac (2026-09-28).
# Automates docs/SETUP-RUNBOOK.md §G1 steps 1-4 and hands you the two paste blocks for step 5.
#
#     bash integrations/voice-setup.sh <your Vanessa thread's conversation id>
#
# The conversation id is in the Claude chat where you got this command. It is deliberately not written into
# the repo. Run it from your Repo folder. Safe to re-run: each step checks what is already done.
#   1. installs the Inkbox SDK (./MAC-SETUP.sh --only inkbox-voice);
#   2. asks for your Inkbox API key WITHOUT showing it, and writes ~/.inkbox/config (chmod 600);
#   3. allow-lists your Vanessa thread, and only that thread (~/.config/inkbox/voice-allow);
#   4. runs the offline self-test (nothing sent) and the voice rows of mac-verify.sh;
#   5. copies §6a to your clipboard for the runner task vanessa-imessage-inbox, then §6b for
#      voice-reply-render, waiting for you to paste each one.
# Then text Vanessa from your phone: her text reply comes first; the voice note follows within one render
# poll (at most 10 minutes). The delivery script refuses any conversation that is not in the allow-list.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC="$REPO/integrations/mac-task-specs.md"
PY="$HOME/Applications/inkbox-voice/.venv/bin/python"
CONV="${1:-}"

say()  { printf '%s\n' "$*"; }
step() { printf '\n==== %s\n' "$*"; }
fail() { printf '\nvoice-setup: %s\n' "$*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
[[ "$CONV" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] \
  || fail "give your Vanessa thread's conversation id as the one argument (it is in the Claude chat)"

step "1/5  Inkbox SDK"
bash "$REPO/MAC-SETUP.sh" --only inkbox-voice
[ -x "$PY" ] && "$PY" -c 'import inkbox' >/dev/null 2>&1 || fail "the Inkbox SDK did not install — see the lines above"

step "2/5  Inkbox API key"
if [ -s "$HOME/.inkbox/config" ] && grep -Eq '^[[:space:]]*api_key[[:space:]]*=[[:space:]]*[^[:space:]]' "$HOME/.inkbox/config"; then
  say "A key is already in ~/.inkbox/config — keeping it."
else
  say "Create a key in the Inkbox dashboard (API keys), copy it, and paste it here. It will not be shown:"
  read -r -s KEY; echo
  [ -n "$KEY" ] || fail "no key pasted — run this again when you have it"
  mkdir -p "$HOME/.inkbox"
  ( umask 077; printf 'api_key = %s\n' "$KEY" > "$HOME/.inkbox/config" )
  chmod 600 "$HOME/.inkbox/config"; unset KEY
  say "Key saved to ~/.inkbox/config (readable only by you)."
fi

step "3/5  Allow-list your Vanessa thread, and only it"
mkdir -p "$HOME/.config/inkbox"
touch "$HOME/.config/inkbox/voice-allow"; chmod 600 "$HOME/.config/inkbox/voice-allow"
if grep -qix "$CONV" "$HOME/.config/inkbox/voice-allow"; then say "Already allow-listed."
else printf '%s\n' "$CONV" >> "$HOME/.config/inkbox/voice-allow"; say "Allow-listed."; fi

step "4/5  Prove it offline (nothing is sent)"
"$PY" "$REPO/integrations/tests/test_vanessa_voice_send.py" || fail "the offline self-test failed — send Vanessa the lines above"
if [ -x "$REPO/mac-verify.sh" ]; then "$REPO/mac-verify.sh" 2>/dev/null | grep -i -E 'inkbox|voice' || true; fi

step "5/5  Paste the two blocks into your runner tasks"
# §6a is the blockquote under "### 6a"; §6b is the blockquote after "Paste this, replacing the first 6b in full:".
A="$(awk '/^### 6a\./{f=1;next} /^### 6b\./{f=0} f && /^>/{sub(/^> ?/,""); print}' "$SPEC")"
B="$(awk '/Paste this, replacing the first 6b in full:/{f=1;next} /^### 6c\./{f=0} f && /^>/{sub(/^> ?/,""); print}' "$SPEC")"
[ -n "$A" ] && [ -n "$B" ] || fail "could not read the §6a/§6b text from integrations/mac-task-specs.md"
printf '%s\n' "$A" | pbcopy
say "§6a is on your clipboard. Append it to the END of the runner task 'vanessa-imessage-inbox'"
say "(the same way you edit any runner task). Press Enter here when it is pasted and saved."
read -r _
printf '%s\n' "$B" | pbcopy
say "§6b is on your clipboard. Append it to the END of the runner task 'voice-reply-render' — replacing"
say "any OLDER §6b you may have pasted before 2026-09-24. Press Enter when it is pasted and saved."
read -r _

step "Done"
say "Now text Vanessa from your phone. Her text reply arrives first; her voice note follows within 10 minutes."
say "If no voice note comes, look at voiceReplyStatus on the dashboard — its 'error' gives the reason:"
say "  5 = thread not allow-listed · 6 = Inkbox refused · 7 = SDK missing."
say "Your Mac's runner must be running and the account must be under its usage limit for any of this to fire."
