#!/bin/bash
# connect-all.sh - Steven's ONE paste to reconnect everything on this Mac (2026-10-20). Bash 3.2 safe.
#
#   bash connect-all.sh            asks one question, then does every safe step and prints one report
#   bash connect-all.sh --preview  shows the plan, changes nothing
#
# Safe means: it syncs this branch (scripts/repo-sync.sh: backs up, never loses your edits, never pushes) and keeps
# it synced every 30 minutes, checks and restarts the Mac runner (the thing that has been silent since
# Oct 13), installs Kapso (WhatsApp) for Claude Code, installs the Inkbox voice SDK, installs Ollama + the Jarvis model and
# builds the Jarvis index if missing, checks Vanessa's voice, installs/registers Laya, turns on the Agent OS, opens Orca on the Repo folder, installs AnyDesk (official cask), checks the
# Lofty and Zoho key files, and runs the read-only health check. It NEVER signs in anywhere,
# never runs runnerctl login or save-token, never prints a key, never pairs Orca, never sends a message, never
# spends money. The two things it asks you to TYPE (your mobile number and the Kapso key) go straight into the
# Mac Keychain through a hidden prompt; press Enter to skip either. The report at the end lists exactly what is
# still yours, with where to click. Paste that report back to Claude.
set -u
REPO_DIR="${CONNECT_ALL_REPO:-$(cd "$(dirname "$0")" && pwd)}"
# Run from a private copy: step 1 updates this very file, and bash reads a script while it runs.
if [ -z "${CONNECT_ALL_COPY:-}" ]; then
  _c="$(mktemp "${TMPDIR:-/tmp}/connect-all.XXXXXX")" && cp "$REPO_DIR/connect-all.sh" "$_c" &&
    CONNECT_ALL_COPY="$_c" CONNECT_ALL_REPO="$REPO_DIR" exec bash "$_c" "$@"
fi
cd "$REPO_DIR" || exit 1
trap 'rm -f "${CONNECT_ALL_COPY:-}"' EXIT
BRANCH="claude/stoic-cori-pvn3f8"
LOGDIR="$HOME/Library/Logs/vanessa-setup"; mkdir -p "$LOGDIR" 2>/dev/null || LOGDIR="/tmp"
LOG="$LOGDIR/connect-$(date +%Y-%m-%d-%H%M).log"
PREVIEW=0; [ "${1:-}" = "--preview" ] && PREVIEW=1
PASS=""; FAIL=""; NEEDS=""
say() { printf '%s\n' "$*" | tee -a "$LOG"; }
have() { command -v "$1" >/dev/null 2>&1; }

say "Connect everything - $(scutil --get ComputerName 2>/dev/null || hostname -s) - $(date)"
if [ "$(uname -s)" != "Darwin" ] && [ "${GO_FORCE:-}" != "1" ]; then say "This is for a Mac."; exit 1; fi
if [ "$PREVIEW" = 0 ] && [ "${CONNECT_ALL_YES:-}" != 1 ]; then
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

# 1. today's files. scripts/repo-sync.sh: fetch, switch to this branch if needed, fast-forward. Files the brain
#    rebuilds (INDEX.md, brain/index.json, reports - .gitattributes) were what blocked every pull since the cloud
#    started committing its daily rebuild; they are backed up and replaced. Your own edits are kept, or - if GitHub
#    changed the same file - saved to ~/Documents/Repo-sync-backups/<date-time>/ first. Never pushes.
if [ "${CONNECT_ALL_SYNCED:-}" = 1 ]; then
  say ""; say "== 1 Get today's files ($BRANCH) =="; say "  done (just now, before this updated copy restarted)"; PASS="$PASS\n  - 1 Get today's files"
else
  step "1 Get today's files ($BRANCH)" "git: the sync could not finish - paste the last lines of ~/Library/Logs/vanessa-setup/repo-sync.log to Claude" \
    bash scripts/repo-sync.sh
  if [ "$PREVIEW" = 0 ] && ! cmp -s "$REPO_DIR/connect-all.sh" "${CONNECT_ALL_COPY:-/dev/null}"; then
    say "  connect-all.sh itself was updated - continuing with the new version"
    rm -f "${CONNECT_ALL_COPY:-}"
    exec env CONNECT_ALL_COPY= CONNECT_ALL_SYNCED=1 CONNECT_ALL_YES=1 bash "$REPO_DIR/connect-all.sh" "$@"
  fi
fi

# 1b. keep it caught up: a LaunchAgent runs repo-sync every 30 minutes (and at login). Undo:
#     launchctl unload ~/Library/LaunchAgents/com.vanessa.repo-sync.plist && rm that file.
repo_sync_agent() {
  local p="$HOME/Library/LaunchAgents/com.vanessa.repo-sync.plist"
  mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs/vanessa-setup"
  cat > "$p" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.vanessa.repo-sync</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$REPO_DIR/scripts/repo-sync.sh</string><string>--quiet</string></array>
  <key>StartInterval</key><integer>1800</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$HOME/Library/Logs/vanessa-setup/repo-sync-agent.log</string>
  <key>StandardErrorPath</key><string>$HOME/Library/Logs/vanessa-setup/repo-sync-agent.log</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
</dict></plist>
PLIST
  launchctl unload "$p" >/dev/null 2>&1; launchctl load "$p" || return 1
  launchctl list com.vanessa.repo-sync >/dev/null 2>&1 || { echo "repo-sync agent did not load"; return 1; }
  echo "repo-sync agent loaded (every 30 minutes)"
  if launchctl list com.stevenshearrill.mac-sync-pull >/dev/null 2>&1; then
    echo "NOTE: the older mac-sync-pull agent (git pull --rebase --autostash) is also loaded; repo-sync replaces it."
    echo "      To stop it: launchctl unload ~/Library/LaunchAgents/com.stevenshearrill.mac-sync-pull.plist"
    MACSYNC_OLD=1
  fi
  return 0
}
MACSYNC_OLD=0
step "1b Keep the Repo folder caught up (every 30 minutes)" \
  "Repo sync: run  bash scripts/repo-sync.sh  by hand and paste what it prints to Claude" repo_sync_agent

# 2. the runner - silent on the dashboard since 2026-10-13. Its last report (2026-10-13 07:13 UTC) says it was
#    logged in, not backing off, and stuck "running" fabric-deck-sync - so "restart only if stopped" never fired.
#    It now always restarts once: that ends a hung task (tasks re-run at their next slot) and never logs in.
RUNNER_OUT=0
runner_fix() {
  have runnerctl || { echo "runnerctl not installed on this Mac. The task runner was built on Mac 1 only; a second Mac gets it from there (scripts/second-mac.sh, 'still yours' b)"; return 1; }
  runnerctl status 2>&1 | tee -a "$LOG" | tail -15
  echo "restarting the runner once to clear a hung task (never logs in)"
  local out rc; out="$(runnerctl restart 2>&1)"; rc=$?; printf '%s\n' "$out" | tail -5
  [ "$rc" = 0 ] || { echo "runnerctl restart failed (exit $rc)"; return 1; }
  sleep 5; runnerctl status 2>&1 | tail -5
  if runnerctl status 2>&1 | grep -qiE 'not running|stopped|dead|no runner'; then
    echo "runner is still not running after the restart"; return 1
  fi
  if runnerctl status 2>&1 | grep -qiE 'logged out|not logged in|login required'; then
    RUNNER_OUT=1; echo "RUNNER IS LOGGED OUT - only you can sign it in: run  runnerctl login  yourself"; return 1
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

# 4b. Gondola - travel: hotel/flight/car search with points vs cash, loyalty balances and trips (official MCP,
#     https://mcp.gondola.ai/mcp, Streamable HTTP). Search works with no account; trips and points ask Steven to sign
#     in (OAuth) the first time a session uses them - the script never signs in. Registered for every project.
gondola_mcp() {
  have claude || { echo "claude CLI not found - install Claude Code first"; return 1; }
  if claude mcp list 2>/dev/null | grep -qi '^gondola'; then echo "gondola already registered"; return 0; fi
  claude mcp add --transport http --scope user gondola https://mcp.gondola.ai/mcp 2>&1 | tail -3
  claude mcp list 2>/dev/null | grep -qi '^gondola'
}
step "4b Gondola travel MCP (Claude Code, every project)" \
  "Gondola: claude mcp add --transport http --scope user gondola https://mcp.gondola.ai/mcp" gondola_mcp

# 5. Inkbox voice SDK so Vanessa's iMessage replies and morning brief carry her voice
step "5 Inkbox voice SDK (Vanessa speaks on iMessage)" \
  "Voice: bash integrations/voice-setup.sh <your Vanessa thread's conversation id>" \
  bash MAC-SETUP.sh --only inkbox-voice

# 6. Laya - the zero-token local router in front of Vanessa. Installs into ~/Applications/laya-venv if missing
#    (PyPI package + one free model download from Hugging Face), registers its MCP server with Claude Code for
#    every project, then routes one non-client test question through the REAL engine. BRAIN_ROUTER stays unset
#    (Steven's 2026-09-28 bench: no accuracy gain), so recall never waits on it.
laya_venv() {
  local d; for d in "${LAYA_VENV_DIR:-}" "$HOME/Applications/laya-venv" "$HOME/laya-venv"; do
    [ -n "$d" ] && [ -x "$d/bin/python" ] && [ -x "$d/bin/laya-mcp-server" ] && { printf '%s' "$d"; return 0; }
  done; return 1
}
laya_connect() {
  local lv out
  lv="$(laya_venv)" || {
    have uv || { have brew && brew install uv; } || { echo "uv missing and no Homebrew to install it"; return 1; }
    LAYA_VENV_DIR="$HOME/Applications/laya-venv" bash integrations/laya/install.sh || { echo "Laya install did not finish (exit 2 = Hugging Face unreachable; rerun later)"; return 1; }
    lv="$(laya_venv)" || { echo "Laya installed but laya-mcp-server not found"; return 1; }
  }
  echo "Laya in $lv"
  if have claude; then
    if claude mcp list 2>/dev/null | grep -Eq '^[[:space:]]*laya([: ]|$)'; then echo "Laya MCP already registered with Claude Code"
    else claude mcp add -s user laya --env LAYA_DEVICE=cpu -- "$lv/bin/laya-mcp-server" || return 1; echo "Laya MCP registered (all projects)"; fi
  else echo "claude CLI missing - Laya not registered with Claude Code"; return 1; fi
  out="$(HF_HUB_DISABLE_PROGRESS_BARS=1 "$lv/bin/python" integrations/laya/laya_route.py --engine real "What is the VA funding fee for a first-time use?" 2>/dev/null | tail -n 2)"
  printf '%s\n' "$out"
  printf '%s' "$out" | grep -Eq 'ROUTE|ESCALATE' || { echo "real Laya engine did not answer"; return 1; }
}
step "6 Laya local router (install if missing, register with Claude Code, one real test)" \
  "Laya: needs huggingface.co once for the free model - rerun  bash connect-all.sh  on a normal internet connection" laya_connect

# 6a. Jarvis's engine. Jarvis (OpenJarvis) is the on-device recall-and-voice system: a Rust memory store that
#     indexes the vault into ~/.openjarvis/memory.db and answers through the local llama3.1:8b on Ollama. The runner
#     task `openjarvis` builds the index. This installs Ollama (official Homebrew formula) and pulls the model if
#     missing (free, about 5 GB, one time), starts Ollama, and - when no memory.db exists yet - asks the runner to run
#     the openjarvis task once. It never logs in and never reads the index's content.
JARVIS_MODEL="${JARVIS_MODEL:-llama3.1:8b}"
jarvis_db() {
  local c; for c in "$HOME/.openjarvis/memory.db" "$HOME/Library/Application Support/OpenJarvis/memory.db" "$HOME/Applications/OpenJarvis/memory.db"; do
    [ -s "$c" ] && { printf '%s' "$c"; return 0; }
  done; return 1
}
jarvis_engine() {
  local i db
  if ! have ollama; then
    have brew || { echo "Ollama missing and no Homebrew: install it from https://ollama.com/download/mac, then rerun"; return 1; }
    # the cask is Ollama's prebuilt app (no compile) - the formula builds from source, which an Intel Mac on macOS 26
    # with old Command Line Tools cannot do (Mac 2, 2026-10-23). The app links the ollama CLI on first open.
    brew install --cask ollama || brew install ollama || return 1
    open -a Ollama 2>/dev/null || true
    i=0; while [ $i -lt 30 ] && ! have ollama && [ ! -x /usr/local/bin/ollama ] && [ ! -x /opt/homebrew/bin/ollama ]; do sleep 1; i=$((i+1)); done
    have ollama || { [ -x /usr/local/bin/ollama ] && export PATH="/usr/local/bin:$PATH"; } || { [ -x /opt/homebrew/bin/ollama ] && export PATH="/opt/homebrew/bin:$PATH"; }
    have ollama || { echo "Ollama app installed but its command is not linked yet - open Ollama once (it asks to install the command line tool), then rerun"; return 1; }
  fi
  if ! ollama list >/dev/null 2>&1; then
    { brew services start ollama >/dev/null 2>&1 || open -a Ollama 2>/dev/null || (nohup ollama serve >/dev/null 2>&1 &); }
    i=0; while [ $i -lt 20 ] && ! ollama list >/dev/null 2>&1; do sleep 1; i=$((i+1)); done
    ollama list >/dev/null 2>&1 || { echo "Ollama installed but not answering - open the Ollama app once, then rerun"; return 1; }
  fi
  echo "Ollama running"
  if ollama list 2>/dev/null | awk 'NR>1{print $1}' | grep -qxF "$JARVIS_MODEL"; then echo "model $JARVIS_MODEL present"
  else echo "pulling $JARVIS_MODEL (one time, about 5 GB)"; ollama pull "$JARVIS_MODEL" || { echo "model pull did not finish - rerun on a normal internet connection"; return 1; }; fi
  if db="$(jarvis_db)"; then echo "Jarvis index: $db"
  elif have runnerctl && runnerctl list 2>/dev/null | grep -q openjarvis; then
    # Building the index is a runner task (claude -p): it spends Claude allowance, so it runs only when Steven says
    # so:  JARVIS_BUILD_INDEX=1 bash connect-all.sh   (or: runnerctl run openjarvis   by hand).
    [ "${JARVIS_BUILD_INDEX:-}" = 1 ] || { echo "no Jarvis index yet. To build it (one runner task, uses Claude allowance): runnerctl run openjarvis"; return 1; }
    echo "no Jarvis index yet - running the openjarvis task once (indexes the vault; no content printed)"
    runnerctl run openjarvis || { echo "openjarvis task did not finish - runnerctl logs openjarvis"; return 1; }
    db="$(jarvis_db)" || { echo "openjarvis ran but wrote no memory.db - is ~/Shearrill-Vault on this Mac? (docs/SECOND-MAC-SETUP.md 6b)"; return 1; }
    echo "Jarvis index built: $db"
  else echo "no Jarvis index and no openjarvis runner task on this Mac - the index lives on the other Mac (docs/SECOND-MAC-SETUP.md 6b)"; return 1; fi
}
step "6a Jarvis engine (Ollama + $JARVIS_MODEL, OpenJarvis index)" \
  "Jarvis: if the report says 'no Jarvis index yet', run  runnerctl run openjarvis  once (uses Claude allowance), or rerun with JARVIS_BUILD_INDEX=1; the vault must be on this Mac (docs/SECOND-MAC-SETUP.md 6b)" jarvis_engine

# 6a2. Brain index refresh: the Mac's own edits make brain/index.json stale against the tree (doctor FAIL on the first
#      report), and 6b runs doctor. reindex writes only brain/index.json + INDEX.md (rebuilt files; never pushed).
step "6a2 Brain index refresh (bin/brain reindex, local only)" "Brain: run  bin/brain reindex  then  bin/brain doctor" \
  bin/brain reindex

# 6b. Jarvis + the recorded voice clips + the brain: verifies OpenJarvis memory.db, the vault, the real Laya engine
#     (from Laya's own venv), Vanessa's clips and bin/brain doctor; writes brain/state/jarvis-status.json, which is
#     how the brain (bin/brain loop / orgcheck) knows Jarvis is alive.
step "6b Jarvis + Vanessa's recorded voice, wired to the brain" \
  "Jarvis: open  ~/Library/Logs/vanessa-setup  (newest connect log) - each FAIL row under 'Jarvis' names its one fix" \
  bash integrations/jarvis/jarvis-setup.sh --apply

# 6c. Orca (stablyai/orca) - parallel Claude Code agents on this Mac + the phone view. Installs from the official
#     Homebrew tap if missing, opens it on the Repo folder. Pairing the phone is YOURS: this never pairs, never signs
#     in, never reads or prints a pairing code.
orca_app() {
  local d; for d in "${ORCA_APP:-}" /Applications/Orca.app "$HOME/Applications/Orca.app"; do
    [ -n "$d" ] && [ -d "$d" ] && { printf '%s' "$d"; return 0; }
  done; return 1
}
orca_connect() {
  local app id ver
  app="$(orca_app)" || {
    have brew || { echo "Orca missing and no Homebrew; get it from https://github.com/stablyai/orca/releases"; return 1; }
    brew install --cask stablyai/orca/orca || return 1
    app="$(orca_app)" || { echo "brew finished but Orca.app not found"; return 1; }
  }
  id="$(defaults read "$app/Contents/Info" CFBundleIdentifier 2>/dev/null || echo unknown)"
  ver="$(defaults read "$app/Contents/Info" CFBundleShortVersionString 2>/dev/null || echo unknown)"
  echo "Orca at $app - $id $ver"
  [ "$id" = com.stablyai.orca ] || echo "WARNING: bundle id is $id, not com.stablyai.orca - check it is the right Orca"
  open -a "$app" "$REPO_DIR" || return 1
  echo "opened Orca with $REPO_DIR"
  if [ -f integrations/remote-control/orca-remote.sh ]; then
    local doc; doc="$(bash integrations/remote-control/orca-remote.sh doctor 2>&1 | tail -n 12)"; printf '%s\n' "$doc"
    case "$doc" in *--grant-desktop-control*|*"non-private address"*) echo "Orca doctor found a security problem above - stop that orca serve"; return 1 ;; esac
  fi
  return 0
}
step "6c Orca (agents side by side + phone view), opened on the Repo folder" \
  "Orca: install it from https://github.com/stablyai/orca/releases (free), then rerun" orca_connect

# 6d. AnyDesk - full screen/keyboard access between Mac 1, Mac 2, the Alienware, tablet and phone. Official cask
#     (download.anydesk.com) only. Reads this Mac's AnyDesk ID (an address, not a secret). NEVER sets a password
#     and never turns on unattended access - those are yours, in AnyDesk's own settings.
ANYDESK_ID=""
anydesk_app() {
  local d; for d in "${ANYDESK_APP:-}" /Applications/AnyDesk.app "$HOME/Applications/AnyDesk.app"; do
    [ -n "$d" ] && [ -d "$d" ] && { printf '%s' "$d"; return 0; }
  done; return 1
}
anydesk_connect() {
  local app bin tmp i pid
  app="$(anydesk_app)" || {
    have brew || { echo "AnyDesk missing and no Homebrew: download it from https://anydesk.com/en/downloads/mac-os"; return 1; }
    brew install --cask anydesk || return 1
    app="$(anydesk_app)" || { echo "brew finished but AnyDesk.app not found"; return 1; }
  }
  echo "AnyDesk at $app"
  open -a "$app" || return 1
  bin="$app/Contents/MacOS/AnyDesk"
  if [ -x "$bin" ]; then
    tmp="$(mktemp "${TMPDIR:-/tmp}/anydesk-id.XXXXXX")"
    "$bin" --get-id >"$tmp" 2>/dev/null & pid=$!
    i=0; while [ $i -lt 10 ] && kill -0 "$pid" 2>/dev/null; do sleep 1; i=$((i+1)); done
    kill -0 "$pid" 2>/dev/null && kill "$pid" 2>/dev/null
    wait "$pid" 2>/dev/null
    ANYDESK_ID="$(tr -cd '0-9' <"$tmp")"; rm -f "$tmp"
    case "${#ANYDESK_ID}" in 9|10) echo "this Mac's AnyDesk ID: $ANYDESK_ID" ;; *) ANYDESK_ID=""; echo "AnyDesk ID not readable yet (open AnyDesk once; it is on its main screen)" ;; esac
  fi
  return 0
}
step "6d AnyDesk (remote screen between all your computers)" \
  "AnyDesk: download it from https://anydesk.com/en/downloads/mac-os (free for personal use), then rerun" anydesk_connect

# 6e. Agent OS: every roster agent reachable through Laya (lane), Jarvis (recall) and Orca (launch). --apply only
#     writes ~/.local/bin/brain (symlink), ~/.config/agent-os/config, and symlinks the generated seat files from
#     integrations/agent-os/agents/ into ~/.claude/agents (files already there are never overwritten); the rest it reports.
step "6e Agent OS (brain on PATH, roster agents wired to Laya, Jarvis and Orca)" \
  "Agent OS: bash integrations/agent-os/install-mac.sh --apply and read its WARN lines" \
  bash integrations/agent-os/install-mac.sh --apply

# 6f. NotebookLM connector (Steven's opt-in, 2026-10-23: "setup and connect everything for me"). Community tool
#     notebooklm-mcp-cli (jacob-bd, PyPI): installs the `nlm` CLI + the notebooklm-mcp server with uv and registers the
#     server with Claude Code. It talks to notebook.google.com through undocumented internal APIs and keeps a copy of
#     Steven's Google session after HE runs `nlm login` - this step never logs in, never reads a cookie. Non-sensitive
#     notebooks only (the SB Docs hold no client data). Remove: uv tool uninstall notebooklm-mcp-cli; claude mcp remove notebooklm
nlm_connect() {
  have uv || { echo "uv missing - rerun after step 6 installed it (or: brew install uv)"; return 1; }
  if ! have nlm; then uv tool install notebooklm-mcp-cli || return 1; [ -x "$HOME/.local/bin/nlm" ] && export PATH="$HOME/.local/bin:$PATH"; fi
  have nlm || { echo "nlm installed but not on PATH - open a new Terminal and rerun"; return 1; }
  echo "nlm $(nlm --version 2>/dev/null | head -1)"
  if have claude; then
    if claude mcp list 2>/dev/null | grep -Eqi '^[[:space:]]*notebooklm'; then echo "notebooklm MCP already registered"
    else nlm setup add claude-code 2>&1 | tail -3; fi
  fi
  if nlm login --check >/dev/null 2>&1; then echo "signed in to NotebookLM"; return 0; fi
  echo "not signed in yet - yours: run  nlm login  (opens your browser; your Google session stays on this Mac only)"; return 1
}
step "6f NotebookLM connector (nlm CLI + MCP for Claude Code; sign-in stays yours)" \
  "NotebookLM: run  nlm login  (browser), then  nlm login --check  and  nlm setup list" nlm_connect

# 7. key files (names only, never values)
keyfiles() {
  local ok=0
  for f in "$HOME/.config/lofty/.env" "$HOME/.config/zoho/.env"; do
    if [ -s "$f" ] && grep -qE '^[A-Z_]+=.+' "$f"; then echo "$f: has values"; else echo "$f: EMPTY or missing"; ok=1; fi
  done
  return $ok
}
step "7 Lofty and Zoho key files" "Keys: open -e ~/.config/zoho/.env (and lofty) and type the values after the = signs" keyfiles

# 7b. Lofty CRM - make sure the key is on this Mac (hidden prompt, file only, chmod 600; Enter skips), install the
#     GET-only Lofty CLI if missing, and prove the key works: GET /me and the lead stage totals. Never writes to Lofty.
LOFTY_VENV="$HOME/Applications/cli-anything-harnesses/.venv"
lofty_connect() {
  local env="$HOME/.config/lofty/.env" key=""
  if ! { [ -s "$env" ] && grep -qE '^LOFTY_API_KEY=.+' "$env"; }; then
    printf 'Lofty API key (Lofty -> Settings -> Integrations -> API). Typed hidden, saved only in ~/.config/lofty/.env. Enter to skip: '
    trap 'stty echo 2>/dev/null' INT TERM; stty -echo 2>/dev/null; read -r key </dev/tty; stty echo 2>/dev/null; trap - INT TERM; echo
    [ -z "$key" ] && { echo "skipped - no Lofty key on this Mac"; return 1; }
    mkdir -p "$HOME/.config/lofty" && ( umask 077; printf 'LOFTY_API_KEY=%s\n' "$key" > "$env" ) && chmod 600 "$env"
    key=""; echo "key saved (value not shown)"
  fi
  local cli="$LOFTY_VENV/bin/cli-anything-lofty"
  if [ ! -x "$cli" ]; then
    [ -x "$LOFTY_VENV/bin/pip" ] || python3 -m venv "$LOFTY_VENV" || return 1
    "$LOFTY_VENV/bin/pip" install -q integrations/cli-anything-harnesses/lofty/agent-harness || return 1
  fi
  "$cli" me >/dev/null 2>&1 || { echo "Lofty refused the key (GET /me failed) - make a new key in Lofty and rerun"; return 1; }
  echo "Lofty key works (GET /me ok)"
  local tot; tot="$("$cli" leads stage-totals 2>&1)" || { printf '%s\n' "$tot" | tail -5; echo "Lofty stage totals failed"; return 1; }
  printf '%s\n' "$tot" | tail -12
}
step "7b Lofty CRM (key on this Mac, read-only check)" \
  "Lofty: make an API key in Lofty -> Settings -> Integrations -> API, rerun connect-all and paste it when asked" lofty_connect

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
if [ "$RUNNER_OUT" = 1 ]; then
say "  0. The runner is signed out (step 2): run  runnerctl login  (yours only), then  runnerctl status"
elif printf '%s' "$FAIL" | grep -q "2 Mac runner"; then
say "  0. Step 2 (runner) stopped for a reason other than sign-in - the log names it: grep -A 12 '== 2 Mac runner' $LOG"
fi
say "  1. Kapso sign-in: run  claude  , type  /mcp  , choose kapso, sign in or create the free account. Then message"
say "     (202) 474-5223 from your phone - save it as 'Vanessa (WhatsApp)'. Say 'read my WhatsApp' in Claude Code."
say "  2. Vanessa's iMessage line: from your phone text  connect @vanessa-shearrill  to +1 650 484 9720 (once)."
say "     Her voice on it: bash integrations/voice-setup.sh <your Vanessa thread's conversation id>, then paste"
say "     section 8b (start) and 8 (end) of integrations/mac-task-specs.md into the runner task vanessa-morning-brief-text."
say "  3. claude.ai -> Settings -> Connectors: EVRoutes and Turo say 'needs reconnect' - Reconnect or remove them."
say "  4. Zoho: Zoho CRM -> Setup -> Security Control -> Profiles -> your profile -> Developer Permissions ->"
say "     tick 'Zoho CRM API Access'. That is the whole 403 fix."
say "  5. Sign in once in the agent Chrome to ShowingTime, Showami and homes.com:"
say "     bash integrations/cli-anything-harnesses/connect.sh"
say "  6. TikTok, GoHighLevel, Discord bot, HeyGen: say 'Composio links' to Claude when you sit down (links last 10 min)."
say "  6b. Gondola (travel): claude.ai -> Settings -> Connectors -> Add custom connector -> name Gondola, URL"
say "     https://mcp.gondola.ai/mcp -> Connect and sign in. Then Vanessa and the dashboards can read your trips and points."
say "  7. Pabbly (Kapso login is proven): copy each trigger's webhook URL from your Kapso WhatsApp app in Pabbly into"
say "     Kapso -> WhatsApp -> your number -> Webhooks (docs/STEVEN-STEPS.md step 5), then the six workflows in"
say "     integrations/pabbly/WORKFLOWS.md (about 5 minutes each at connect.pabbly.com)."
say "  8. Orca: if the Repo folder is not listed in Orca, click Add Project and choose $REPO_DIR. Then pair your phone:"
say "     install 'Orca IDE' (https://apps.apple.com/us/app/orca-ide/id6766130217), in Orca on the Mac open the pairing"
say "     screen from the account/status menu, and scan the code with the phone app. Never read the code to anyone."
say "  9. AnyDesk on this Mac: System Settings -> Privacy & Security -> Screen Recording -> AnyDesk ON, and"
say "     Accessibility -> AnyDesk ON (quit and reopen AnyDesk after). Then, only if you want to reach this Mac when"
say "     nobody is at it: AnyDesk -> Settings -> Security -> unlock -> unattended access -> type your own password."
if [ -n "$ANYDESK_ID" ]; then
say "     This Mac's AnyDesk ID is $ANYDESK_ID - type it into the Computer Hub card (Toolkit & Remote Access, panel 40)."
fi
say "     Alienware, tablet and phone: integrations/anydesk/README.md (one PowerShell line; App Store / Play Store)."
if [ "$MACSYNC_OLD" = 1 ]; then
say " 10. Optional: the old mac-sync-pull agent is still loaded and repo-sync replaces it. To stop it:"
say "     launchctl unload ~/Library/LaunchAgents/com.stevenshearrill.mac-sync-pull.plist"
fi
say ""
say "From now on, in any Claude Code session in this folder: type /paste for this list, /connections for what is"
say "not connected, /owner <panel> for who keeps a dashboard panel alive."
[ -n "$NEEDS" ] && say "From the steps above:$(printf "$NEEDS")"
say ""; say "Log: $LOG"
say "Copy everything from REPORT down and paste it to Claude with: 'here is the connect report'."
[ -z "$FAIL" ]
