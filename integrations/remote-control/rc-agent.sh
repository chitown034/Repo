#!/bin/bash
# rc-agent.sh - keep Claude Code Remote Control available on this Mac (bash 3.2 safe).
# Subcommands: install status url report restart stop uninstall doctor   (+ internal: run)
# Global flag:  --dry-run  (print what would happen, change nothing)
# Nothing here reads a token or a key. No poller: one long-lived process, KeepAlive.
# shellcheck disable=SC2310
set -u

LABEL_ID="com.stevenshearrill.claude-remote-control"
CFG_DIR="${HOME}/.config/claude-runner"
STATE_FILE="${CFG_DIR}/remote-control.json"
ID_FILE="${CFG_DIR}/id"
LOG_DIR="${HOME}/Library/Logs/vanessa-remote-control"
AGENT_LOG="${LOG_DIR}/agent.log"
LAUNCHD_LOG="${LOG_DIR}/launchd.log"
PLIST="${HOME}/Library/LaunchAgents/${LABEL_ID}.plist"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SELF="${SELF_DIR}/$(basename "${BASH_SOURCE[0]}")"
DRY=0

say()  { printf '%s\n' "$*"; }
warn() { printf '%s\n' "$*" >&2; }
now()  { date -u +%Y-%m-%dT%H:%M:%SZ; }
dry()  { printf 'DRY-RUN would: %s\n' "$*"; }

# ---------- identity -------------------------------------------------------
clean() { # printable ASCII only, no $HOME text, max 40 chars
  printf '%s' "$1" | LC_ALL=C tr -cd 'A-Za-z0-9 ._()@+-' | cut -c1-40
}
host_short() { clean "$(hostname -s 2>/dev/null || hostname 2>/dev/null || echo mac)"; }
host_label() {
  local l=""
  if [ -r "$ID_FILE" ]; then l="$(head -n 1 "$ID_FILE" 2>/dev/null)"; fi
  if [ -z "$(clean "$l")" ]; then l="$(scutil --get ComputerName 2>/dev/null || true)"; fi
  if [ -z "$(clean "$l")" ]; then l="$(host_short)"; fi
  clean "$l"
}

json_str() { # JSON-escape a short string (already cleaned or a URL)
  printf '%s' "$1" | LC_ALL=C tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}
xml_esc() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }

# ---------- tool discovery -------------------------------------------------
find_claude() {
  if [ -n "${RC_CLAUDE:-}" ] && [ -x "${RC_CLAUDE}" ]; then printf '%s' "$RC_CLAUDE"; return 0; fi
  command -v claude 2>/dev/null
}
find_caff() {
  if [ -n "${RC_CAFFEINATE:-}" ] && [ -x "${RC_CAFFEINATE}" ]; then printf '%s' "$RC_CAFFEINATE"; return 0; fi
  command -v caffeinate 2>/dev/null
}
find_repo() {
  local r="${RC_REPO:-}"
  if [ -z "$r" ]; then r="$(git -C "$SELF_DIR" rev-parse --show-toplevel 2>/dev/null || true)"; fi
  if [ -z "$r" ]; then r="${HOME}/Repo"; fi
  printf '%s' "$r"
}

# ---------- URL capture ----------------------------------------------------
# Strip colour/cursor escapes, OSC-8 hyperlinks and CRs, then take the LAST claude.ai link.
# Parsed generously, never invented: empty output means "no link seen".
strip_ansi() {
  local esc bel
  esc="$(printf '\033')"; bel="$(printf '\007')"
  LC_ALL=C sed -e "s/${esc}\\]8;[^;]*;\\([^${bel}]*\\)${bel}/ \\1 /g" \
               -e "s/${esc}\\]8;[^;]*;\\([^${esc}]*\\)${esc}\\\\/ \\1 /g" \
               -e "s/${esc}\\[[0-9;?]*[A-Za-z]//g" \
               -e "s/${esc}\\][^${bel}]*${bel}//g" \
               -e "s/${esc}\\][^${esc}]*${esc}\\\\//g" | tr -d '\r'
}
extract_url() { # stdin -> last https link on a claude.ai host
  strip_ansi | grep -Eo 'https://([A-Za-z0-9-]+\.)*claude\.ai/[^][ "<>)'"'"'`]*' | sed -e 's/[.,;:]*$//' | tail -n 1
}
logged_url() { # last link in the agent log
  [ -r "$AGENT_LOG" ] || return 0
  tail -n 600 "$AGENT_LOG" 2>/dev/null | extract_url
}

# ---------- state ----------------------------------------------------------
state_get() { # key -> value from our own flat JSON
  [ -r "$STATE_FILE" ] || return 0
  sed -n 's/.*"'"$1"'": *"\([^"]*\)".*/\1/p' "$STATE_FILE" | head -n 1
}
state_pid() { [ -r "$STATE_FILE" ] && sed -n 's/.*"pid": *\([0-9][0-9]*\).*/\1/p' "$STATE_FILE" | head -n 1; }
write_state() { # url startedAt pid version
  local tmp="${STATE_FILE}.tmp.$$"
  mkdir -p "$CFG_DIR"
  printf '{"host":"%s","startedAt":"%s","pid":%s,"url":"%s","claudeVersion":"%s"}\n' \
    "$(json_str "$(host_short)")" "$(json_str "$2")" "${3:-0}" "$(json_str "$1")" "$(json_str "$4")" > "$tmp" \
    && mv "$tmp" "$STATE_FILE"
}
pid_alive() { [ -n "${1:-}" ] && [ "$1" -gt 0 ] 2>/dev/null && kill -0 "$1" 2>/dev/null; }

# ---------- launchd helpers ------------------------------------------------
UIDN="$(id -u)"
DOMAIN="gui/${UIDN}"
agent_loaded() { launchctl print "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1; }
agent_launchd_pid() { launchctl print "${DOMAIN}/${LABEL_ID}" 2>/dev/null | sed -n 's/^[[:space:]]*pid = \([0-9][0-9]*\).*/\1/p' | head -n 1; }
agent_alive() {
  local p
  p="$(agent_launchd_pid)"; if pid_alive "$p"; then return 0; fi
  p="$(state_pid)"; pid_alive "$p"
}

# ---------- the long-running wrapper (what launchd executes) ----------------
cmd_run() {
  umask 077
  mkdir -p "$LOG_DIR" "$CFG_DIR"
  local claude caff repo label ver fails=0 t0 t1 started pre=()
  claude="$(find_claude)" || { warn "claude not found"; exit 127; }
  caff="$(find_caff || true)"
  repo="$(find_repo)"
  cd "$repo" || { warn "repo folder missing: $repo"; exit 1; }
  ver="$("$claude" --version 2>/dev/null | head -n 1)"
  if [ -f "$AGENT_LOG" ] && [ "$(wc -c < "$AGENT_LOG")" -gt 5000000 ]; then mv "$AGENT_LOG" "${AGENT_LOG}.1"; fi
  if [ -n "$caff" ]; then pre=("$caff" -i); fi
  while :; do
    label="$(host_label)"
    started="$(now)"; t0="$(date +%s)"
    write_state "" "$started" "$$" "$ver"
    printf '%s starting remote-control as "%s"\n' "$started" "$label" >> "$AGENT_LOG"
    if [ "${RC_PTY:-0}" = "1" ]; then # only if the CLI refuses to run without a terminal
      "${pre[@]+"${pre[@]}"}" /usr/bin/script -q /dev/null "$claude" remote-control --name "$label" 2>&1
    else
      "${pre[@]+"${pre[@]}"}" "$claude" remote-control --name "$label" 2>&1 < /dev/null
    fi | while IFS= read -r line; do
      printf '%s\n' "$line" >> "$AGENT_LOG"
      if printf '%s' "$line" | grep -q 'https://'; then
        u="$(printf '%s' "$line" | extract_url)"
        if [ -n "$u" ]; then write_state "$u" "$started" "$$" "$ver"; fi
      fi
    done
    t1="$(date +%s)"
    printf '%s remote-control exited after %ss\n' "$(now)" "$((t1 - t0))" >> "$AGENT_LOG"
    write_state "" "$started" 0 "$ver"
    if [ "$((t1 - t0))" -lt 60 ]; then fails=$((fails + 1)); else fails=0; fi
    # back off so a broken login or an unanswered first-run prompt cannot become a run-storm
    local wait=$((30 * (1 << (fails > 5 ? 5 : fails))))
    if [ "$wait" -gt 900 ]; then wait=900; fi
    sleep "$wait"
  done
}

# ---------- plist ----------------------------------------------------------
make_plist() { # claude caff repo
  local path
  path="$(dirname "$1"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
  cat <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL_ID}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$(xml_esc "$SELF")</string>
    <string>run</string>
  </array>
  <key>WorkingDirectory</key><string>$(xml_esc "$3")</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>60</integer>
  <key>ProcessType</key><string>Background</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$(xml_esc "$path")</string>
    <key>RC_CLAUDE</key><string>$(xml_esc "$1")</string>
    <key>RC_CAFFEINATE</key><string>$(xml_esc "$2")</string>
    <key>RC_REPO</key><string>$(xml_esc "$3")</string>
  </dict>
  <key>StandardOutPath</key><string>$(xml_esc "$LAUNCHD_LOG")</string>
  <key>StandardErrorPath</key><string>$(xml_esc "$LAUNCHD_LOG")</string>
</dict>
</plist>
PL
}

# ---------- subcommands ----------------------------------------------------
cmd_install() {
  local claude caff repo ans
  claude="$(find_claude)" || { warn "claude is not on PATH. Install Claude Code first."; return 1; }
  caff="$(find_caff)" || { warn "caffeinate not found (it ships with macOS)."; return 1; }
  repo="$(find_repo)"
  [ -d "$repo" ] || { warn "Repo folder not found: $repo  (set RC_REPO=/path/to/Repo)"; return 1; }
  say "This will install a per-user LaunchAgent (${LABEL_ID}) that keeps"
  say "'claude remote-control' running from ${repo##*/} under caffeinate -i, restarted if it exits."
  say "It grants no extra permissions and reads no credentials. Turn off: rc-agent.sh stop | uninstall."
  say "Before the first install: run 'claude remote-control' once by hand in the Repo folder and answer"
  say "its one-time prompts ('Enable Remote Control? (y/n)', 'Trust <directory>? [y/N]')."
  if [ "$DRY" = 1 ]; then
    dry "mkdir $LOG_DIR, write $PLIST, launchctl bootstrap ${DOMAIN}"
    say "---- plist that would be written ----"
    make_plist "$claude" "$caff" "$repo"
    return 0
  fi
  printf 'Install and start it on this Mac? [y/N] '
  ans=""; read -r ans || ans=""
  case "$ans" in y|Y|yes|YES) ;; *) say "Not installed (default N)."; return 0 ;; esac
  umask 077
  mkdir -p "$LOG_DIR" "$CFG_DIR" "$(dirname "$PLIST")"
  make_plist "$claude" "$caff" "$repo" > "$PLIST"
  chmod 644 "$PLIST"
  launchctl enable "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl bootout "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl bootstrap "$DOMAIN" "$PLIST" || { warn "launchctl bootstrap failed. Run: rc-agent.sh doctor"; return 1; }
  say "Installed and started. Give it ~20 s, then: rc-agent.sh url   and   rc-agent.sh report"
}

cmd_status() {
  local u; u="$(state_get url)"
  say "host:      $(host_short)  (label: $(host_label))"
  say "installed: $([ -f "$PLIST" ] && echo yes || echo no)"
  say "loaded:    $(agent_loaded && echo yes || echo no)"
  if agent_alive; then say "process:   alive"; else say "process:   not running"; fi
  say "started:   $(state_get startedAt)"
  say "link:      ${u:-none captured yet}"
  say "log:       ${AGENT_LOG##*/} in ~/Library/Logs/vanessa-remote-control/"
}

cmd_url() {
  local u; u="$(state_get url)"
  if [ -z "$u" ]; then u="$(logged_url)"; fi
  if [ -z "$u" ]; then
    warn "No session link captured. Open https://claude.ai/code and look for the session named '$(host_label)'."
    warn "Run: rc-agent.sh doctor"
    return 1
  fi
  if ! agent_alive; then warn "(agent is not running; this link may be dead)"; fi
  say "$u"
}

cmd_report() {
  local u="" started="" ck
  if agent_alive; then
    u="$(state_get url)"; if [ -z "$u" ]; then u="$(logged_url)"; fi
    started="$(state_get startedAt)"
  fi
  case "$u" in https://*) ;; *) u="" ;; esac
  ck="$(now)"
  printf '{"host":"%s","label":"%s","url":"%s","startedAt":"%s","checkedAt":"%s"}\n' \
    "$(json_str "$(host_short)")" "$(json_str "$(host_label)")" "$(json_str "$u")" "$(json_str "$started")" "$ck"
}

cmd_restart() {
  [ -f "$PLIST" ] || { warn "Not installed. Run: rc-agent.sh install"; return 1; }
  if [ "$DRY" = 1 ]; then dry "launchctl enable, bootout, bootstrap ${DOMAIN}/${LABEL_ID}"; return 0; fi
  launchctl enable "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl bootout "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl bootstrap "$DOMAIN" "$PLIST" || { warn "bootstrap failed"; return 1; }
  say "Restarted."
}

cmd_stop() {
  if [ "$DRY" = 1 ]; then dry "launchctl bootout + disable ${DOMAIN}/${LABEL_ID}"; return 0; fi
  if [ ! -f "$PLIST" ] && ! agent_loaded; then say "Nothing to stop (not installed)."; return 0; fi
  launchctl bootout "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl disable "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  say "Stopped and held off (stays off after login). Back on: rc-agent.sh restart"
}

cmd_uninstall() {
  if [ "$DRY" = 1 ]; then dry "bootout, remove $PLIST and $STATE_FILE (logs are kept)"; return 0; fi
  launchctl bootout "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  launchctl enable "${DOMAIN}/${LABEL_ID}" >/dev/null 2>&1 || true
  rm -f "$PLIST" "$STATE_FILE"
  say "Uninstalled. Logs kept in ~/Library/Logs/vanessa-remote-control/ (delete by hand if wanted)."
}

# ---------- doctor ---------------------------------------------------------
FAILS=0
ok()   { printf '  OK    %s\n' "$*"; }
wr()   { printf '  WARN  %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; FAILS=$((FAILS + 1)); }

pmset_val() { # section(AC|Battery) key
  pmset -g custom 2>/dev/null | awk -v want="$1" -v key="$2" '
    /^AC Power/      { sec="AC"; next }
    /^Battery Power/ { sec="Battery"; next }
    sec==want && $1==key { print $2; exit }'
}

cmd_doctor() {
  local claude ver auth am n pids extra tailtxt acs bts
  say "Remote Control doctor - $(host_label)"
  claude="$(find_claude || true)"
  if [ -z "$claude" ]; then bad "claude not on PATH"; else
    ver="$("$claude" --version 2>/dev/null | head -n 1)"; ok "claude: ${ver:-unknown version}"
  fi
  if [ -n "$claude" ]; then
    auth="$("$claude" auth status 2>/dev/null || true)"
    if printf '%s' "$auth" | grep -Eq '"loggedIn": *true'; then
      am="$(printf '%s' "$auth" | sed -n 's/.*"authMethod": *"\([^"]*\)".*/\1/p' | head -n 1)"
      ok "logged in (method: ${am:-unknown}); no token read"
      case "$am" in *api*|*key*) bad "API-key login: Remote Control needs a claude.ai subscription login (/login)" ;; esac
    else
      bad "not logged in: run 'claude' then /login (claude.ai account)"
    fi
  fi
  if [ -n "${ANTHROPIC_BASE_URL:-}" ]; then
    case "$ANTHROPIC_BASE_URL" in https://api.anthropic.com*) ;; *) bad "ANTHROPIC_BASE_URL points elsewhere: Remote Control is unavailable through a gateway/proxy" ;; esac
  fi
  if [ -n "${CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:-}" ] || [ -n "${DISABLE_GROWTHBOOK:-}" ]; then
    bad "an env var that disables feature flags is set: Remote Control is unavailable"
  fi
  if [ -n "${ANTHROPIC_API_KEY:-}" ]; then wr "ANTHROPIC_API_KEY set in this shell (API keys are not supported for Remote Control; the agent does not inherit your shell env)"; fi
  if [ -r "${HOME}/.claude/settings.json" ] && grep -Eq '"disableRemoteControl": *true' "${HOME}/.claude/settings.json"; then
    bad "disableRemoteControl is true in ~/.claude/settings.json"
  fi
  if [ -f "$PLIST" ]; then ok "LaunchAgent file present"; else bad "LaunchAgent not installed: rc-agent.sh install"; fi
  if agent_loaded; then ok "LaunchAgent loaded"; else bad "LaunchAgent not loaded: rc-agent.sh restart"; fi
  if agent_alive; then ok "process alive (pid $(agent_launchd_pid || true))"; else bad "process not running"; fi
  if [ -n "$(state_get url)" ]; then ok "session link captured (started $(state_get startedAt))"; else wr "no session link captured yet (open claude.ai/code and find '$(host_label)')"; fi
  if [ -r "$AGENT_LOG" ]; then
    tailtxt="$(tail -n 80 "$AGENT_LOG" | strip_ansi)"
    if printf '%s' "$tailtxt" | grep -Eqi 'Enable Remote Control\?|Trust .*\[y/N\]|Workspace trust'; then
      bad "log shows a first-run prompt nobody can answer: run 'claude remote-control' once by hand in the Repo folder, answer y, Ctrl+C, then rc-agent.sh restart"
    fi
    if printf '%s' "$tailtxt" | grep -Eqi 'exited after'; then wr "agent has exited and restarted recently (see agent.log)"; fi
  else
    wr "no agent.log yet"
  fi
  # other instances
  pids="$(pgrep -f '^[^ ]*claude remote-control' 2>/dev/null || true)"
  n=0; for _ in $pids; do n=$((n + 1)); done
  if agent_alive; then extra=$((n - 1)); else extra=$n; fi
  if [ "$extra" -gt 0 ]; then wr "$extra other 'claude remote-control' process(es) running (pids: $(printf '%s' "$pids" | tr '\n' ' ')): two servers = two sessions listed"; else ok "no other remote-control instance"; fi
  # power
  if command -v pmset >/dev/null 2>&1; then
    acs="$(pmset_val AC sleep)"; bts="$(pmset_val Battery sleep)"
    say "  INFO  pmset sleep: AC=${acs:-?} min, Battery=${bts:-?} min (0 = never)"
    if [ -n "$acs" ] && [ "$acs" != 0 ]; then wr "AC idle sleep is ${acs} min; caffeinate -i holds it off only while the agent runs. Lid-close and manual Sleep still end the session; it reconnects on wake"; fi
    if [ -n "$bts" ] && [ "$bts" != 0 ]; then wr "on battery the Mac sleeps after ${bts} min of idle; keep it on power for an always-on session"; fi
    if [ "$(pmset_val AC womp)" = 0 ]; then wr "Wake for network access is off (AC womp=0)"; fi
  else
    wr "pmset not available (not macOS?)"
  fi
  if [ "$FAILS" -gt 0 ]; then say "Result: ${FAILS} problem(s)."; return 1; fi
  say "Result: all required checks pass."
}

usage() {
  say "usage: rc-agent.sh [--dry-run] install|status|url|report|restart|stop|uninstall|doctor"
}

main() {
  local args=() a cmd=""
  for a in "$@"; do
    case "$a" in --dry-run) DRY=1 ;; *) args+=("$a") ;; esac
  done
  cmd="${args[0]:-}"
  case "$cmd" in
    install)   cmd_install ;;
    status)    cmd_status ;;
    url)       cmd_url ;;
    report)    cmd_report ;;
    restart)   cmd_restart ;;
    stop)      cmd_stop ;;
    uninstall) cmd_uninstall ;;
    doctor)    cmd_doctor ;;
    run)       if [ "$DRY" = 1 ]; then dry "run claude remote-control loop"; else cmd_run; fi ;;
    *)         usage; return 2 ;;
  esac
}
main "$@"
