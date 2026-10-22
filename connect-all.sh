#!/bin/bash
# connect-all.sh - Steven's ONE paste to reconnect everything on this Mac (2026-10-20). Bash 3.2 safe.
#
#   bash connect-all.sh            asks one question, then does every safe step and prints one report
#   bash connect-all.sh --preview  shows the plan, changes nothing
#
# Safe means: it pulls this branch, checks and restarts the Mac runner (the thing that has been silent since
# Oct 13), installs Kapso (WhatsApp) for Claude Code, installs the Inkbox voice SDK, checks Jarvis and Vanessa's
# voice, checks the Lofty and Zoho key files, and runs the read-only health check. It NEVER signs in anywhere,
# never runs runnerctl login or save-token, never prints a key, never pairs Orca, never sends a message, never
# spends money. The two things it asks you to TYPE (your mobile number and the Kapso key) go straight into the
# Mac Keychain through a hidden prompt; press Enter to skip either. The report at the end lists exactly what is
# still yours, with where to click. Paste that report back to Claude.
set -u
cd "$(dirname "$0")" || exit 1
BRANCH="claude/stoic-cori-pvn3f8"
LOGDIR="$HOME/Library/Logs/vanessa-setup"; mkdir -p "$LOGDIR" 2>/dev/null || LOGDIR="/tmp"
LOG="$LOGDIR/connect-$(date +%Y-%m-%d-%H%M).log"
PREVIEW=0; [ "${1:-}" = "--preview" ] && PREVIEW=1
PASS=""; FAIL=""; NEEDS=""
say() { printf '%s\n' "$*" | tee -a "$LOG"; }
have() { command -v "$1" >/dev/null 2>&1; }

say "Connect everything - $(scutil --get ComputerName 2>/dev/null || hostname -s) - $(date)"
if [ "$(uname -s)" != "Darwin" ] && [ "${GO_FORCE:-}" != "1" ]; then say "This is for a Mac."; exit 1; fi
if [ "$PREVIEW" = 0 ]; then
  printf 'Reconnect everything safe on this Mac now? It never signs in, pairs, sends or pays. [y/N] '
  read -r ans; case "$ans" in y|Y|yes|YES) ;; *) say "Preview only (you answered no). Rerun and answer y when ready."; PREVIEW=1 ;; esac
fi

step() { # <name> <needs-you-note-if-it-fails> <command...>
  local name="$1" note="$2"; shift 2
  say ""; say "== $name =="
  if [ "$PREVIEW" = 1 ]; then say "  would run: $*"; return 0; fi
  if "$@" >>"$LOG" 2>&1; then say "  done"; PASS="$PASS\n  - $name"
  else say "  did not finish (see $LOG)"; FAIL="$FAIL\n  - $name"; [ -n "$note" ] && NEEDS="$NEEDS\n  - $note"; fi
}

# 1. today's files. If you have local edits it stops rather than discard them.
step "1 Get today's files ($BRANCH)" "git: local changes blocked the pull - tell Claude what 'git status' prints" \
  sh -c "git fetch origin $BRANCH && git checkout $BRANCH && git pull --ff-only origin $BRANCH"

# 2. the runner - silent on the dashboard since 2026-10-13. Its last report (2026-10-13 07:13 UTC) says it was
#    logged in, not backing off, and stuck "running" fabric-deck-sync - so "restart only if stopped" never fired.
#    It now always restarts once: that ends a hung task (tasks re-run at their next slot) and never logs in.
runner_fix() {
  have runnerctl || { echo "runnerctl not installed - run ./mac-bootstrap.sh --only runner"; return 1; }
  runnerctl status 2>&1 | tee -a "$LOG" | tail -15
  echo "restarting the runner once to clear a hung task (never logs in)"
  local out rc; out="$(runnerctl restart 2>&1)"; rc=$?; printf '%s\n' "$out" | tail -5
  [ "$rc" = 0 ] || { echo "runnerctl restart failed (exit $rc)"; return 1; }
  sleep 5; runnerctl status 2>&1 | tail -5
  if runnerctl status 2>&1 | grep -qiE 'not running|stopped|dead|no runner'; then
    echo "runner is still not running after the restart"; return 1
  fi
  if runnerctl status 2>&1 | grep -qiE 'logged out|not logged in|login required'; then
    echo "RUNNER IS LOGGED OUT - only you can sign it in: run  runnerctl login  yourself"; return 1
  fi
  runnerctl list >/dev/null 2>&1
}
step "2 Mac runner (silent since Oct 13): status, restart once" \
  "Runner: run  runnerctl login  yourself (a script must never sign in), then  runnerctl status" runner_fix

# 2b. keep the Mac awake while it is on the charger, so the 6 AM tasks run. A user LaunchAgent running
#     caffeinate -s (blocks system sleep on AC power only; the display still sleeps; no password). Undo:
#     launchctl unload ~/Library/LaunchAgents/com.vanessa.keepawake.plist && rm that file.
keep_awake() {
  local p="$HOME/Library/LaunchAgents/com.vanessa.keepawake.plist"
  mkdir -p "$HOME/Library/LaunchAgents"
  cat > "$p" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.vanessa.keepawake</string>
  <key>ProgramArguments</key><array><string>/usr/bin/caffeinate</string><string>-s</string></array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
</dict></plist>
PLIST
  launchctl unload "$p" >/dev/null 2>&1; launchctl load "$p" || return 1
  sleep 1; launchctl list com.vanessa.keepawake 2>/dev/null | grep -q '"PID"' && echo "keep-awake on (charger only)"
}
step "2b Keep the Mac awake on the charger (so the morning tasks run)" \
  "Keep-awake: System Settings -> Battery -> Options -> 'Prevent automatic sleeping on power adapter' ON" keep_awake

# 3. Kapso - WhatsApp for Vanessa: plugin + MCP for every Claude Code session
step "3 Kapso WhatsApp plugin + MCP (Claude Code)" \
  "Kapso: in Terminal run  claude  , type  /mcp  , choose kapso, sign in (free sandbox)" \
  bash integrations/kapso/install-mac.sh install --apply

# 4. Kapso keys - your mobile (allow-list) and the project key, Keychain only, hidden prompt. Enter skips.
kapso_keys() {
  if security find-generic-password -a "$USER" -s kapso-allow >/dev/null 2>&1 && security find-generic-password -a "$USER" -s kapso >/dev/null 2>&1; then
    echo "both Keychain items already present"; return 0; fi
  printf 'Your own mobile number, digits only with country code (e.g. 16195551234) - the ONLY number Vanessa may answer. Enter to skip: '
  read -r mob </dev/tty; mob="$(printf '%s' "$mob" | tr -cd '0-9')"
  [ -z "$mob" ] && { echo "skipped"; return 1; }
  echo "Next it asks for the Kapso project API key (app.kapso.ai -> your project -> API keys). Typed hidden, stored only in the Keychain."
  bash integrations/kapso/install-mac.sh keys --allow "$mob" </dev/tty
}
step "4 Kapso keys (your mobile + the project key, Keychain only)" \
  "Kapso keys: bash integrations/kapso/install-mac.sh keys --allow <your mobile>" kapso_keys

# 5. Inkbox voice SDK so Vanessa's iMessage replies and morning brief carry her voice
step "5 Inkbox voice SDK (Vanessa speaks on iMessage)" \
  "Voice: bash integrations/voice-setup.sh <your Vanessa thread's conversation id>" \
  bash MAC-SETUP.sh --only inkbox-voice

# 6. Jarvis + the recorded voice clips + the brain
step "6 Jarvis, Laya and Vanessa's recorded voice" "" bash integrations/jarvis/jarvis-setup.sh --apply

# 7. key files (names only, never values)
keyfiles() {
  local ok=0
  for f in "$HOME/.config/lofty/.env" "$HOME/.config/zoho/.env"; do
    if [ -s "$f" ] && grep -qE '^[A-Z_]+=.+' "$f"; then echo "$f: has values"; else echo "$f: EMPTY or missing"; ok=1; fi
  done
  return $ok
}
step "7 Lofty and Zoho key files" "Keys: open -e ~/.config/zoho/.env (and lofty) and type the values after the = signs" keyfiles

# 8. Claude Mods: route beacon, HALT guard, /remember, connection beacon (/connections, /owner), /paste. Asks y once.
mods_install() { bash integrations/mods/install-mods.sh </dev/tty; }
step "8 Claude Mods (status line, HALT guard, /remember, /connections, /owner, /paste)" \
  "Mods: bash integrations/mods/install-mods.sh  (needs Claude Code 2.1.287+: claude update)" mods_install

# 9. read-only health check
step "9 Health check (read-only)" "" sh -c "./mac-verify.sh --quiet || true"

say ""; say "================ REPORT ================"
[ -n "$PASS" ] && say "Done:$(printf "$PASS")"
[ -n "$FAIL" ] && say "Did not finish:$(printf "$FAIL")"
say ""
say "Still yours (a script must never do these):"
say "  1. Kapso sign-in: run  claude  , type  /mcp  , choose kapso, sign in or create the free account. Then message"
say "     (202) 474-5223 from your phone - save it as 'Vanessa (WhatsApp)'. Say 'read my WhatsApp' in Claude Code."
say "  2. Vanessa's voice on iMessage: bash integrations/voice-setup.sh <your Vanessa thread's conversation id>"
say "     then paste section 8 of integrations/mac-task-specs.md at the end of the runner task vanessa-morning-brief-text."
say "  3. claude.ai -> Settings -> Connectors: Inkbox says 'needs reconnect' - click Reconnect (this is Vanessa's"
say "     iMessage channel for cloud sessions). Same for EVRoutes and Turo, or remove them."
say "  4. Zoho: Zoho CRM -> Setup -> Security Control -> Profiles -> your profile -> Developer Permissions ->"
say "     tick 'Zoho CRM API Access'. That is the whole 403 fix."
say "  5. Sign in once in the agent Chrome to ShowingTime, Showami and homes.com:"
say "     bash integrations/cli-anything-harnesses/connect.sh"
say "  6. TikTok, GoHighLevel, Discord bot, HeyGen: say 'Composio links' to Claude when you sit down (links last 10 min)."
say "  7. Pabbly: open the Pabbly 'Connect' link Claude sent, paste your Kapso API key there (Pabbly's page, never chat),"
say "     then build the six workflows in integrations/pabbly/WORKFLOWS.md (about 5 minutes each at connect.pabbly.com)."
say ""
say "From now on, in any Claude Code session in this folder: type /paste for this list, /connections for what is"
say "not connected, /owner <panel> for who keeps a dashboard panel alive."
[ -n "$NEEDS" ] && say "From the steps above:$(printf "$NEEDS")"
say ""; say "Log: $LOG"
say "Copy everything from REPORT down and paste it to Claude with: 'here is the connect report'."
[ -z "$FAIL" ]
