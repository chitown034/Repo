#!/usr/bin/env bash
# install-failover.sh — puts the failover launcher on this Mac, one asked-for change at a time.
# Every change is a y/N question, default N (Enter, EOF or anything but y/yes = no). --dry-run asks nothing and changes nothing.
#
#   ./install-failover.sh [--dry-run]
#
# It DOES (each only on a yes):  copy claude-auto.sh -> ~/.local/bin/claude-auto and probe.sh -> ~/.local/bin/probe.sh
#   (an older copy is moved aside, not deleted) · write ~/.config/claude-runner/role = peer · create an EMPTY
#   ~/.config/omniroute/.env holding the key NAME only (chmod 600) · write the probe LaunchAgent plist and load it.
# It NEVER: touches the Claude subscription login or any Claude settings · writes or asks for a key value ·
#   edits a runner task (it prints the lines for Steven to apply) · edits PATH or a shell profile · deletes the old
#   ~/Applications/claude-fallback launcher. It ends by running `claude-auto --doctor` (read-only).
# Written for macOS bash 3.2 (no associative arrays, no mapfile, no ${var,,}); BSD and GNU userland. No secrets here.
set -u
set -f
umask 077
DRY=0; for a in "$@"; do case "$a" in --dry-run) DRY=1 ;; -h|--help) sed -n '2,12p' "$0"; exit 0 ;; *) echo "install-failover: unknown option '$a'" >&2; exit 64 ;; esac; done
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN="${CLAUDE_AUTO_INSTALL_DIR:-$HOME/.local/bin}"
OCFG="${OMNIROUTE_CFG:-$HOME/.config/omniroute}"
RCFG="${CLAUDE_RUNNER_CFG:-$HOME/.config/claude-runner}"
AGENTS="$HOME/Library/LaunchAgents"
LABEL="com.stevenshearrill.omniroute-probe"
PLIST="$AGENTS/$LABEL.plist"
for f in claude-auto.sh probe.sh; do [ -f "$HERE/$f" ] || { echo "install-failover: $HERE/$f not found — run this from the omniroute-failover folder" >&2; exit 2; }; done

ask() { # question -> 0 only on an explicit yes. In --dry-run it prints what it WOULD do and returns 1.
  if [ "$DRY" = 1 ]; then printf '  would ask: %s [y/N]  (dry run - nothing changed)\n' "$1"; return 1; fi
  printf '%s [y/N] ' "$1" >&2
  _a=''; read -r _a || _a=''
  case "$_a" in y|Y|yes|YES|Yes) return 0 ;; esac
  echo "  skipped." >&2; return 1
}
done_() { printf '  done: %s\n' "$1"; }
mode_of() { _m=$(stat -c '%a' "$1" 2>/dev/null || true); case "${_m:-x}" in ''|*[!0-7]*) _m=$(stat -f '%OLp' "$1" 2>/dev/null || echo '?') ;; esac; printf '%s' "$_m"; }

echo "== Failover install ($( [ "$DRY" = 1 ] && echo DRY RUN || echo live ))   source: $HERE   target: $BIN"

echo; echo "1. Launcher and probe, side by side in $BIN"
for pair in claude-auto.sh:claude-auto probe.sh:probe.sh; do
  src="$HERE/${pair%%:*}"; dst="$BIN/${pair#*:}"
  if [ -f "$dst" ] && cmp -s "$src" "$dst"; then echo "  $dst already matches the repo copy"; continue; fi
  if [ -f "$dst" ]; then q="Replace $dst with the repo copy (the current one is kept as $dst.bak.<time>)?"; else q="Install $dst?"; fi
  if ask "$q"; then
    mkdir -p "$BIN" || { echo "  cannot create $BIN" >&2; continue; }
    [ -f "$dst" ] && mv "$dst" "$dst.bak.$(date +%Y%m%d%H%M%S)"
    cp "$src" "$dst" && chmod 755 "$dst" && done_ "$dst"
  fi
done

echo; echo "2. Lease role file"
if [ -f "$RCFG/role" ]; then echo "  $RCFG/role already says: $(sed -e 's/#.*//' "$RCFG/role" | tr -d ' \t' | grep -v '^$' | head -1)"
else
  echo "  none yet: without it this Mac is 'standby' and defers --task runs whenever the lease check cannot complete."
  if ask "Write $RCFG/role = peer (both of Steven's Macs run peer)?"; then
    mkdir -p "$RCFG" && chmod 700 "$RCFG" && printf 'peer\n' > "$RCFG/role" && chmod 600 "$RCFG/role" && done_ "$RCFG/role"
  fi
fi

echo; echo "3. OmniRoute key file (the NAME only - you paste the value)"
if [ -f "$OCFG/.env" ]; then
  echo "  $OCFG/.env exists (mode $(mode_of "$OCFG/.env")); it is not modified."
  case "$(mode_of "$OCFG/.env")" in 600|400) ;; *) if ask "chmod 600 $OCFG/.env (the launcher refuses any other mode)?"; then chmod 600 "$OCFG/.env" && done_ "chmod 600"; fi ;; esac
else
  if ask "Create $OCFG/.env containing only the line OMNIROUTE_API_KEY= (empty, chmod 600)?"; then
    mkdir -p "$OCFG" && chmod 700 "$OCFG" && printf 'OMNIROUTE_API_KEY=\n' > "$OCFG/.env" && chmod 600 "$OCFG/.env" && done_ "$OCFG/.env"
    echo "  >> YOU paste the key: open $OCFG/.env and put the OmniRoute dashboard API key after OMNIROUTE_API_KEY= (this script never sees it)."
  fi
fi

echo; echo "4. Probe LaunchAgent (every 15 min: restores the subscription when it works again)"
if ask "Write $PLIST ?"; then
  mkdir -p "$AGENTS" "$OCFG/state" && cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$BIN/probe.sh</string></array>
  <key>StartInterval</key><integer>900</integer>
  <key>RunAtLoad</key><false/>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:$BIN:/usr/bin:/bin</string></dict>
  <key>StandardOutPath</key><string>$OCFG/state/probe.launchd.out</string>
  <key>StandardErrorPath</key><string>$OCFG/state/probe.launchd.err</string>
</dict></plist>
PL
  chmod 644 "$PLIST" && done_ "$PLIST"
  if command -v launchctl >/dev/null 2>&1; then
    if ask "Load it now (launchctl load -w $PLIST)?"; then launchctl load -w "$PLIST" && done_ "loaded"; fi
  else echo "  launchctl not found on this machine - on the Mac run: launchctl load -w $PLIST"; fi
elif [ -f "$PLIST" ]; then
  echo "  $PLIST exists."
  if command -v launchctl >/dev/null 2>&1 && ! launchctl list 2>/dev/null | grep -q "$LABEL"; then
    if ask "It is not loaded. Load it (launchctl load -w $PLIST)?"; then launchctl load -w "$PLIST" && done_ "loaded"; fi
  fi
fi

echo; echo "4b. Keep going automatically when Claude runs out (claude-auto --keep-going)"
echo "  Your own Claude sessions: at the limit, type /exit once - the same conversation continues on OmniRoute's free"
echo "  models, and the next session goes back to Claude as soon as it has reset. Client data never goes to the free route."
if [ -f "$OCFG/auto-continue" ]; then echo "  already on ($OCFG/auto-continue exists)."
elif ask "Turn it on (create the empty file $OCFG/auto-continue)?"; then
  mkdir -p "$OCFG" && : > "$OCFG/auto-continue" && done_ "$OCFG/auto-continue"
fi
echo "  Start your sessions with:   claude-auto --keep-going"
echo "  (optional) make it the default by adding this line to ~/.zshrc yourself:   alias claude='claude-auto --keep-going'"

echo; echo "5. Runner tasks - NOT edited by this script. Apply these yourself:"
cat <<EOT
  - In every runner task's command, replace the bare   claude -p ...
    with                                                claude-auto --task <that-task's-own-name> -p ...
    (the name is how the PII gate decides: no --task = deferred when the route is free; client-data names never go free).
  - Make sure $BIN comes first in the PATH the runner and your shell use:
        export PATH="$BIN:\$PATH"
  - The old launcher in ~/Applications/claude-fallback is left alone. Once the doctor below is clean and the PII canary
    (README, "PII canary") passes, remove every reference to it (the doctor lists them), then archive the folder.
  - Free providers: OmniRoute needs at least one (README, "Free-key sources"). Keys go in through its dashboard or
    'omniroute providers add <id> --credential-env <NAME>' - never through this script.
  - Your own sessions: start them with   claude-auto --keep-going   (switches to OmniRoute at the limit and back by itself)
EOT

echo; echo "6. Doctor (read-only)"
if [ -x "$BIN/claude-auto" ] && [ "$DRY" = 0 ]; then "$BIN/claude-auto" --doctor; rc=$?; else bash "$HERE/claude-auto.sh" --doctor; rc=$?; fi
exit "$rc"
