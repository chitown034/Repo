#!/bin/bash
# scripts/fix-mine.sh - ONE paste for Steven: everything a script may do, done; every secret typed hidden (Enter skips);
# the few things only a person can do printed once, at the end, as a short checklist. Bash 3.2 safe (macOS). Idempotent:
# run it again any time and it only does what is still missing. It never signs in anywhere, never pays, never sends.
#
#   cd ~/Repo && bash scripts/fix-mine.sh            do everything that is missing, then print the checklist
#   bash scripts/fix-mine.sh --check                 show what it WOULD do, change nothing, prompt for nothing
#
# Secrets: hidden prompt (read -s), written only to ~/.config/<tool>/.env (mode 600), never echoed, never logged.
# Steps: 1 repo up to date · 2 keys (Lofty, TidyCal, Arive, Zoho) · 3 Lofty's own MCP as "lofty-cloud" · 3b Vanessa everywhere
# (Jarvis engine + her voice + her persona + the brain in its memory; Laya routed; Orca and the AI team wired) · 4 runner: retired
# tasks paused, repaired tasks re-run in the background · 5 the checklist only Steven can do · REPORT to paste back to Claude.
set -u
CHECK=0; [ "${1:-}" = "--check" ] && CHECK=1
TTY="${FIX_MINE_TTY:-/dev/tty}"   # tests point this at a file; real runs read from the terminal
OUT=/dev/tty; [ "$TTY" = /dev/tty ] || OUT=/dev/stderr   # prompts never go into a file that is being read
REPO="$HOME/Repo"; BR="claude/stoic-cori-pvn3f8"
DONE=""; SKIP=""; YOU=""
done_() { DONE="$DONE
  - $*"; }
skip_() { SKIP="$SKIP
  - $*"; }
you_()  { YOU="$YOU
  $*"; }
say() { printf '%s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

# ---- 1. repo --------------------------------------------------------------------------------------------------------
step_repo() {
  if [ ! -d "$REPO/.git" ]; then skip_ "repo: $REPO is not a git checkout (clone it first: docs/SECOND-MAC-SETUP.md)"; return; fi
  if [ $CHECK = 1 ]; then say "would: update $REPO from GitHub ($BR)"; return; fi
  if [ -x "$REPO/scripts/repo-sync.sh" ] || [ -f "$REPO/scripts/repo-sync.sh" ]; then
    (cd "$REPO" && bash scripts/repo-sync.sh --quiet) && done_ "repo up to date (scripts/repo-sync.sh)" || skip_ "repo: repo-sync.sh reported a problem (paste its line to Claude)"
  else
    (cd "$REPO" && git pull -q --no-rebase origin "$BR") && done_ "repo up to date (git pull)" || skip_ "repo: git pull failed (network or a local edit)"
  fi
}

# ---- 2. keys ------------------------------------------------------------------------------------------------------------
# set_key <env file> <VAR> <prompt>: asks hidden once if VAR is not already in the file; Enter skips; file mode 600.
set_key() {
  local f="$1" var="$2" prompt="$3" v=""
  if [ -s "$f" ] && grep -qE "^$var=.+" "$f"; then return 0; fi
  if [ $CHECK = 1 ]; then say "would ask (hidden, Enter skips): $prompt -> $f"; return 1; fi
  printf '%s (hidden; Enter to skip): ' "$prompt" >"$OUT"
  IFS= read -rs v <"$TTY" || v=""; printf '\n' >"$OUT"
  [ -z "$v" ] && return 1
  mkdir -p "$(dirname "$f")"
  ( umask 077; { [ -f "$f" ] && grep -vE "^$var=" "$f"; printf '%s=%s\n' "$var" "$v"; } > "$f.tmp" && mv "$f.tmp" "$f" )
  chmod 600 "$f"; return 0
}
step_keys() {
  local c="$HOME/.config"
  say "Keys. Each is asked once, typed hidden, saved only on this Mac. Press Enter to skip any you do not have yet."
  set_key "$c/lofty/.env"   LOFTY_API_KEY       "Lofty API key (Lofty -> Settings -> Integrations -> API)"              && done_ "Lofty API key saved"   || skip_ "Lofty API key: not entered (optional once lofty-cloud is signed in)"
  set_key "$c/tidycal/.env" TIDYCAL_TOKEN       "TidyCal token (TidyCal -> Settings -> Integrations -> API)"            && done_ "TidyCal token saved"   || skip_ "TidyCal token: not entered"
  set_key "$c/arive/.env"   ARIVE_CLIENT_ID     "Arive Client ID (Arive -> Settings -> Integrations)"                   && done_ "Arive client id saved" || skip_ "Arive credentials: not entered"
  set_key "$c/arive/.env"   ARIVE_SECRET_KEY    "Arive Secret Key"                                                      >/dev/null || true
  set_key "$c/arive/.env"   ARIVE_API_KEY       "Arive API Key"                                                         >/dev/null || true
  set_key "$c/zoho/.env"    ZOHO_CLIENT_ID      "Zoho Client ID (api-console.zoho.com -> Self Client)"                  && done_ "Zoho client id saved"  || skip_ "Zoho credentials: not entered (the API tick in Zoho is still needed either way)"
  set_key "$c/zoho/.env"    ZOHO_CLIENT_SECRET  "Zoho Client Secret"                                                    >/dev/null || true
  set_key "$c/zoho/.env"    ZOHO_REFRESH_TOKEN  "Zoho Refresh Token (Enter if you only have id + secret)"              >/dev/null || true
  if [ -s "$c/zoho/.env" ] && [ $CHECK = 0 ]; then
    grep -q '^ZOHO_ACCOUNTS_URL=' "$c/zoho/.env" || printf 'ZOHO_ACCOUNTS_URL=https://accounts.zoho.com\nZOHO_API_URL=https://www.zohoapis.com\n' >> "$c/zoho/.env"
  fi
}

# ---- 3. Lofty's own MCP server (OAuth, browser sign-in is Steven's) ------------------------------------------------------
step_lofty_cloud() {
  have claude || { skip_ "lofty-cloud MCP: the claude CLI is not on this Mac"; return; }
  if claude mcp get lofty-cloud >/dev/null 2>&1; then done_ "lofty-cloud MCP already registered"; return; fi
  if [ $CHECK = 1 ]; then say "would: claude mcp add -s user --transport http lofty-cloud https://mcp.lofty.com/mcp"; return; fi
  if claude mcp add -s user --transport http --client-id 1wzhz7fnrr8qo --callback-port 8766 lofty-cloud https://mcp.lofty.com/mcp >/dev/null 2>&1; then
    done_ "lofty-cloud MCP registered (sign-in is yours: see the checklist)"
  else skip_ "lofty-cloud MCP: claude mcp add failed (run it by hand and paste the error)"; fi
}

# ---- 3b. Vanessa everywhere on this Mac: Jarvis speaks and thinks as her and knows the brain; Laya routes; Orca launches the
#          team. Each script is idempotent and reports its own FAIL/WARN rows; this just runs them in order and keeps the last line.
run_quiet() {   # run_quiet <label> <cmd...>: run, keep the log, report one line
  local label="$1"; shift; local log="$HOME/Library/Logs/vanessa-setup/fix-mine-$(printf '%s' "$label" | tr ' /' '--').log"
  mkdir -p "$(dirname "$log")"
  if [ $CHECK = 1 ]; then say "would: $*"; return 0; fi
  if "$@" >"$log" 2>&1; then done_ "$label — $(tail -1 "$log")"; else skip_ "$label — $(grep -m1 -E 'FAIL|WARN|rror' "$log" || tail -1 "$log") (log: $log)"; fi
}
step_vanessa_everywhere() {
  [ "$(uname)" = Darwin ] || { skip_ "Vanessa/Jarvis/Laya/Orca: not a Mac"; return; }
  [ -d "$REPO" ] || return
  cd "$REPO" || return
  [ -f integrations/jarvis/jarvis-setup.sh ]        && run_quiet "Jarvis engine + Vanessa's voice"            bash integrations/jarvis/jarvis-setup.sh --apply
  [ -f integrations/jarvis/vanessa-persona.sh ]     && run_quiet "Jarvis speaks as Vanessa, knows the brain" bash integrations/jarvis/vanessa-persona.sh --apply
  [ -f integrations/agent-os/connect-orca-laya.sh ] && run_quiet "Laya routed + Orca checked"                 bash integrations/agent-os/connect-orca-laya.sh --apply
  [ -f integrations/agent-os/install-mac.sh ]       && run_quiet "AI team wired to Laya, Jarvis, Orca"        bash integrations/agent-os/install-mac.sh --apply
  if have brain; then run_quiet "team reachability (brain os check)" brain os check; fi
  you_ "G. Orca phone view (once): Orca on the Mac -> account/status menu -> pairing screen; scan it with the 'Orca IDE' iPhone app. Never read the code to anyone."
}

# ---- 4. runner ----------------------------------------------------------------------------------------------------------
step_runner() {
  have runnerctl || { skip_ "runner: runnerctl not on this Mac"; return; }
  local st; st="$(runnerctl status 2>/dev/null)" || { skip_ "runner: runnerctl status failed"; return; }
  printf '%s\n' "$st" | grep -q "CLI logged in" || you_ "R. The runner's Claude CLI is signed out: runnerctl login"
  # one parse for both uses: a status line is "<flag> <task> …" when it starts with off/RUN, else "<task> …"
  local rows t; rows="$(printf '%s\n' "$st" | awk '$1=="off"||$1 ~ /^[A-Z]+$/ {print $1, $2; next} $1 ~ /^[a-z0-9]/ && $2 ~ /^[0-9*@]/ {print "on", $1}')"   # off/RUN/NOAL/BADZ: marker first
  for t in r9-feed-freshness-sweep r8-apple-health-snapshot strava-daily-sync; do
    if printf '%s\n' "$rows" | grep -qx "off $t"; then :; else
      [ $CHECK = 1 ] && say "would: runnerctl pause $t" || { runnerctl pause "$t" >/dev/null 2>&1 && done_ "paused retired task $t"; }
    fi
  done
  # tasks whose last result is error and that are not paused: re-run in the background (each takes minutes), one log per task
  local errs; errs="$(printf '%s\n' "$st" | awk '/last error/ {n=($1=="off"||$1 ~ /^[A-Z]+$/)?$2:$1; if ($1!="off" && $1!="BADZ" && $1!="NOAL") print n}' \
                      | grep -vxE 'r9-feed-freshness-sweep|r8-apple-health-snapshot|strava-daily-sync' | head -4)"   # never a retired task; at most 4 runs
  if [ -z "$errs" ]; then done_ "runner: no task in error"; return; fi
  for t in $errs; do
    if [ $CHECK = 1 ]; then say "would: runnerctl run $t (background)"; continue; fi
    mkdir -p "$HOME/Library/Logs/vanessa-setup"
    nohup runnerctl run "$t" >"$HOME/Library/Logs/vanessa-setup/fix-mine-$t.log" 2>&1 </dev/null &
    done_ "re-running $t in the background (log: ~/Library/Logs/vanessa-setup/fix-mine-$t.log)"
  done
  you_ "T. In about 30 minutes paste:  runnerctl status   (the re-run tasks should read ok; if one still says error, paste its runnerctl logs <task>)"
}

# ---- 5. only you ------------------------------------------------------------------------------------------------------------
checklist() {
  you_ "A. Phone: text  connect @vanessa-shearrill  to +1 650 484 9720 (once) — the morning brief then arrives by iMessage + voice."
  you_ "B. Zoho: Setup -> Security Control -> Profiles -> your profile -> Developer Permissions -> tick 'Zoho CRM API Access'."
  you_ "C. Sign-ins (browser, 2 minutes): type  claude  then  /mcp  -> lofty-cloud -> sign in; then kapso -> sign in. Say 'list my Lofty lead stages' there and paste the answer to Claude."
  you_ "D. Phone, once: MyFitnessPal -> Apps & Devices -> Apple Health ON; Strava -> Settings -> Apple Health ON; BodyPark app -> allow Apple Health; Health Auto Export -> Metrics select all + Workouts ON."
  you_ "E. claude.ai -> Settings -> Connectors: Reconnect (or remove) EVRoutes and Turo; Add custom connector 'Lofty' https://mcp.lofty.com/mcp and 'Gondola' https://mcp.gondola.ai/mcp."
  you_ "F. AnyDesk on this Mac: System Settings -> Privacy & Security -> Screen Recording + Accessibility -> AnyDesk ON (quit and reopen AnyDesk)."
}

main() {
  say "fix-mine $(date '+%Y-%m-%d %H:%M') $( [ $CHECK = 1 ] && echo '(check only: nothing changes, nothing asked)')"
  step_repo; step_keys; step_lofty_cloud; step_vanessa_everywhere; step_runner; checklist
  say ""; say "================ REPORT (copy from here down and paste it to Claude) ================"
  say "Done:${DONE:-
  - nothing new (everything scripted was already in place)}"
  [ -n "$SKIP" ] && { say "Skipped / not finished:$SKIP"; }
  say "Only you (in this order; each is one screen):$YOU"
  say "Run this again any time:  cd ~/Repo && bash scripts/fix-mine.sh"
}
[ "${FIX_MINE_NO_MAIN:-0}" = 1 ] || main "$@"
