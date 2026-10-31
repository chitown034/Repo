#!/bin/bash
# setup.sh - Steven's ONE paste (2026-10-27). Everything a script may do on this Mac, in one run, with every secret typed
# hidden ONCE (Enter skips) and a single REPORT at the end that lists only what is still yours.
#
#   cd ~/Repo && bash setup.sh            do everything that is missing, then print the REPORT
#   bash setup.sh --check                 show the plan; change nothing, ask nothing
#
# It runs, in order: 1 repo sync (scripts/repo-sync.sh)  2 scripts/fix-mine.sh (keys: Lofty, TidyCal, Arive, Zoho, SkySlope;
# Kapso WhatsApp plugin + MCP; Discord bot token; Inkbox voice; Jarvis = Vanessa with the brain; message tasks all day; the
# runner)  3 connect-all.sh (Laya, Jarvis engine, Orca + the AI team wired to it, AnyDesk, Agent OS, NotebookLM, OpenFlowKit,
# homes.com / ShowingTime / Showami wrappers, Claude mods, health check)  4 the two keys only this script asks for (Hume,
# Composio - optional)  5 one REPORT: what is connected, what is not, and the numbered list only you can do.
# It never signs in anywhere, never runs runnerctl login, never prints a key, never pairs, never sends, never spends.
# Idempotent: run it again any time; it only does what is still missing. Bash 3.2 safe.
set -u
CHECK=0; [ "${1:-}" = "--check" ] && CHECK=1
REPO="${SETUP_REPO:-$HOME/Repo}"
[ -d "$REPO/.git" ] || REPO="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO" || { echo "setup: no Repo folder at $REPO - first:  git clone https://github.com/chitown034/Repo.git ~/Repo"; exit 1; }
BR="$(git symbolic-ref -q --short HEAD 2>/dev/null || echo claude/stoic-cori-pvn3f8)"
export REPO_SYNC_BRANCH="${REPO_SYNC_BRANCH:-$BR}" FIX_MINE_BRANCH="${FIX_MINE_BRANCH:-$BR}" CONNECT_ALL_BRANCH="${CONNECT_ALL_BRANCH:-$BR}" SETUP_NESTED=1 CONNECT_ALL_SKIP_KEYS=1
if [ "$(uname -s)" != "Darwin" ] && [ "${GO_FORCE:-}" != 1 ]; then echo "setup: this is for a Mac (set GO_FORCE=1 to run the --check plan elsewhere)"; exit 1; fi
LOGDIR="$HOME/Library/Logs/vanessa-setup"; mkdir -p "$LOGDIR" 2>/dev/null || LOGDIR="${TMPDIR:-/tmp}"
LOG="$LOGDIR/setup-$(date +%Y-%m-%d-%H%M).log"
USER="${USER:-$(id -un)}"
say() { printf '%s\n' "$*" | tee -a "$LOG"; }
have() { command -v "$1" >/dev/null 2>&1; }
OK=""; MISSING=""; YOU=""; N=0
ok_()   { OK="$OK
  - $*"; }
miss_() { MISSING="$MISSING
  - $*"; }
you_()  { N=$((N+1)); YOU="$YOU
  $N. $*"; }

say "setup.sh - $(scutil --get ComputerName 2>/dev/null || hostname -s) - $(date) - branch $BR$( [ $CHECK = 1 ] && echo ' - CHECK ONLY (nothing changes, nothing asked)')"
say "Log: $LOG"

# ---- 1. repo --------------------------------------------------------------------------------------------------------------
say ""; say "== 1 Repo up to date =="
if [ $CHECK = 1 ]; then say "  would: bash scripts/repo-sync.sh --quiet (branch $BR)"
elif [ -f scripts/repo-sync.sh ]; then
  if bash scripts/repo-sync.sh --quiet >>"$LOG" 2>&1; then say "  done"; else say "  repo-sync reported a problem (see the log); continuing with the files already here"; fi
else
  if git pull -q --no-rebase origin "$BR" >>"$LOG" 2>&1; then say "  done"; else say "  git pull failed; continuing"; fi
fi

# ---- 2. fix-mine: keys, channels, voice, Vanessa everywhere, hours, runner -----------------------------------------------
say ""; say "== 2 Keys, WhatsApp, Discord, voice, Jarvis = Vanessa, message hours, runner (scripts/fix-mine.sh) =="
if [ -f scripts/fix-mine.sh ]; then
  if [ $CHECK = 1 ]; then bash scripts/fix-mine.sh --check 2>&1 | tee -a "$LOG" | sed 's/^/  /'
  else bash scripts/fix-mine.sh 2>&1 | tee -a "$LOG" | sed 's/^/  /'; fi
else say "  scripts/fix-mine.sh is missing - run the repo step first"; fi

# ---- 3. connect-all: Laya, Jarvis engine, Orca + AI team, AnyDesk, Agent OS, NotebookLM, wrappers, mods, health ------------
say ""; say "== 3 Laya, Jarvis, Orca + the AI team, AnyDesk, Agent OS, NotebookLM, site wrappers, mods, health (connect-all.sh) =="
if [ -f connect-all.sh ]; then
  if [ $CHECK = 1 ]; then bash connect-all.sh --preview 2>&1 | tee -a "$LOG" | sed 's/^/  /'
  else CONNECT_ALL_YES=1 bash connect-all.sh 2>&1 | tee -a "$LOG" | sed 's/^/  /'; fi
else say "  connect-all.sh is missing - run the repo step first"; fi

# ---- 4. the two optional keys only this script asks for (Keychain, hidden, Enter skips) ------------------------------------
# set_kc <keychain item> <prompt>: nothing is asked when the item exists; the value never reaches the screen or the log.
set_kc() {
  local item="$1" prompt="$2" v=""
  if have security && security find-generic-password -a "$USER" -s "$item" >/dev/null 2>&1; then return 0; fi
  if [ $CHECK = 1 ]; then say "  would ask (hidden, Enter skips): $prompt -> Keychain item $item"; return 1; fi
  have security || return 1
  printf '%s (hidden; Enter to skip): ' "$prompt" >/dev/tty; IFS= read -rs v </dev/tty || v=""; printf '\n' >/dev/tty
  [ -z "$v" ] && return 1
  security add-generic-password -U -a "$USER" -s "$item" -w "$v" >/dev/null 2>&1; local rc=$?; v=""; return $rc
}
say ""; say "== 4 Optional keys (Keychain only) =="
if set_kc hume-api-key "Hume AI API key (platform.hume.ai -> API keys; only if you want Vanessa's voice to try Hume EVI later)"; then ok_ "Hume AI key in the Keychain (item hume-api-key) - a proposal, not yet used by any task"; else miss_ "Hume AI: no key yet (optional; Vanessa's voice keeps the recorded Magica set)"; fi
if set_kc composio-api-key "Composio API key (app.composio.dev -> Settings -> API keys; only if you want Zoho/Discord/TikTok through Composio from this Mac)"; then ok_ "Composio key in the Keychain (item composio-api-key)"; else miss_ "Composio: no key on this Mac (the claude.ai Composio connector still works from the cloud)"; fi

# ---- 5. what is connected now (read-only, names only) -----------------------------------------------------------------------
say ""; say "== 5 Connection check (read-only; names only, never a value) =="
kf() { [ -s "$HOME/.config/$1/.env" ] && grep -qE "^$2=.+" "$HOME/.config/$1/.env"; }
kc() { have security && security find-generic-password -a "$USER" -s "$1" >/dev/null 2>&1; }
if kf lofty LOFTY_API_KEY; then ok_ "Lofty key on this Mac"; else miss_ "Lofty key (Lofty -> Settings -> Integrations -> API; rerun this paste)"; fi
if kf tidycal TIDYCAL_TOKEN; then ok_ "TidyCal token on this Mac"; else miss_ "TidyCal token (TidyCal -> Integrations -> Automations/Advanced -> API -> Create token; rerun this paste)"; fi
if kf arive ARIVE_API_KEY; then ok_ "Arive credentials on this Mac (first read-only call happens in the daily cycle)"; else miss_ "Arive credentials (Arive -> Settings -> Integrations -> Generate: Client ID, Secret Key, API Key; rerun this paste)"; fi
if kf zoho ZOHO_CLIENT_ID; then ok_ "Zoho self-client id/secret on this Mac (the API stays 403 until you tick 'Zoho CRM API Access' - item below)"; else miss_ "Zoho client id + secret (api-console.zoho.com -> Self Client; rerun this paste)"; fi
if kf skyslope SKYSLOPE_ACCESS_KEY; then ok_ "SkySlope access key on this Mac"; else miss_ "SkySlope Access Key + Secret (SkySlope -> My Account -> Integrations -> Generate New Key; rerun this paste)"; fi
if kc kapso; then ok_ "Kapso project key in the Keychain"; else miss_ "Kapso project key (the fix-mine/connect-all prompt; rerun this paste)"; fi
if kc kapso-allow; then ok_ "WhatsApp allow-list (your mobile) in the Keychain"; else miss_ "WhatsApp allow-list: bash integrations/kapso/install-mac.sh keys --allow <your mobile>"; fi
if kc vanessa-discord-bot-token; then ok_ "Discord bot token in the Keychain"; else miss_ "Discord bot token (discord.com/developers -> your app -> Bot -> Reset Token; rerun this paste)"; fi
if [ -s "$HOME/.inkbox/config" ] || kc inkbox; then ok_ "Inkbox (iMessage voice) key on this Mac"; else miss_ "Inkbox API key (Inkbox dashboard -> API keys; rerun this paste)"; fi
RUNNER_LOGIN=0
if have runnerctl; then
  rs="$(runnerctl status 2>/dev/null | tr '\n' ' ')"
  if printf '%s' "$rs" | grep -q "CLI logged in"; then ok_ "Mac runner: Claude CLI logged in"
  elif [ -z "$rs" ]; then miss_ "Mac runner: runnerctl status printed nothing (step 2 above shows why)"
  else miss_ "Mac runner: the Claude CLI is signed out (only you can sign it in)"; RUNNER_LOGIN=1; fi
else miss_ "Mac runner (runnerctl) not installed - step 3 installs it; if it still is not, paste the log to Claude"; fi
if have ollama; then ok_ "Jarvis engine (Ollama) installed"; else miss_ "Jarvis engine (Ollama) - step 3 installs it"; fi
if [ -d "$HOME/Applications/orca" ] || have orca || [ -d "/Applications/Orca.app" ]; then ok_ "Orca installed (pairing is yours)"; else miss_ "Orca - step 3 installs it"; fi
if [ -d "/Applications/AnyDesk.app" ]; then ok_ "AnyDesk installed (permissions are yours)"; else miss_ "AnyDesk - step 3 installs it"; fi
if [ -x "$HOME/Applications/cli-anything-harnesses/.venv/bin/python" ]; then ok_ "homes.com / ShowingTime / Showami wrappers installed (sign-ins are yours)"; else miss_ "site wrappers - step 3 (7d) installs them"; fi

# ---- 6. only you ----------------------------------------------------------------------------------------------------------
[ "$RUNNER_LOGIN" = 1 ] && you_ "Terminal: runnerctl login (signs the Mac runner's Claude CLI in; then runnerctl status). Nothing scheduled runs until this is done."
you_ "Phone, once: text  connect @vanessa-shearrill  to +1 650 484 9720 - links the iMessage line (morning text + voice note)."
you_ "Zoho CRM -> Setup -> Security Control -> Profiles -> your profile -> Developer Permissions -> tick 'Zoho CRM API Access' (the whole 403 fix; the keys are already on this Mac once you typed them above)."
you_ "Sign-ins (one screen): type  claude  then  /mcp  -> lofty-cloud -> sign in; kapso -> sign in; then message (202) 474-5223 from your phone once."
you_ "Discord: discord.com/developers -> New Application 'Vanessa' -> Bot -> Reset Token (paste it when this script asks) -> OAuth2 URL Generator: scope bot, Send Messages + Read Message History -> open the URL, pick your server; then say 'Discord link' to Claude."
you_ "Phone, once: MyFitnessPal -> More -> Apps & Devices -> Apple Health ON; Strava -> Settings -> Apple Health ON; BodyPark app -> allow Apple Health; Health Auto Export -> Metrics select all + Workouts -> Google Drive folder (already set). That is the whole health sync."
you_ "Browser sign-ins, once each, in the agent Chrome: ShowingTime, Showami, homes.com (bash integrations/cli-anything-harnesses/connect.sh shows which one still needs it)."
you_ "AnyDesk: System Settings -> Privacy & Security -> Screen Recording + Accessibility -> AnyDesk ON; set an unattended password; type each computer's AnyDesk ID (never the password) into the Command Deck's Computer Hub card."
you_ "Orca phone pairing: bash integrations/remote-control/orca-remote.sh serve --phone, scan the QR in the Orca app; the AI team is already wired (Agent OS)."
you_ "Pabbly Connect: connect.pabbly.com -> build the workflows in integrations/pabbly/WORKFLOWS.md one by one (each is click-together: Lofty, Zoho, Gmail, Google Calendar, Notion, TidyCal, Kapso); say 'yes build the kapso connection' to Claude for the custom app."
you_ "Ticor Title: ask your San Diego Ticor rep for Ticor Online Pro access (no API exists); property search on the deck already uses the free county records."
you_ "claude.ai -> Settings -> Connectors: Reconnect (or remove) EVRoutes and Turo; add custom connector 'Gondola' https://mcp.gondola.ai/mcp (travel)."

# ---- REPORT ---------------------------------------------------------------------------------------------------------------
say ""; say "================ REPORT (copy from here down and paste it to Claude) ================"
say "Connected / on this Mac:${OK:-
  - nothing confirmed yet}"
say "Not yet:${MISSING:-
  - nothing}"
say "Only you (in this order; each is one screen):$YOU"
say "Log: $LOG"
say "Run this again any time:  cd ~/Repo && bash setup.sh      (plan only: bash setup.sh --check)"
