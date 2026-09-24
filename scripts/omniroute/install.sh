#!/usr/bin/env bash
# OmniRoute installer for Claude Code (macOS + Linux).
#
# Claude Code -> OmniRoute -> combo "subscription-fallback" (strategy: priority)
#   tier 1: your Claude subscription (OAuth provider "claude")
#   tier 2: a free fallback (AI Horde anonymous, optionally Gemini with your key)
# OmniRoute's priority combo + circuit breaker does the switching per request:
# it fails over when the subscription is exhausted and goes back when it resets.
# This script only installs and configures things.
#
# Subcommands: server | client | local | uninstall-client | status   (see --help)
# Bash 3.2 compatible (stock macOS bash).

set -euo pipefail

# ---------------------------------------------------------------- constants --
PORT=20128
COMBO_NAME="subscription-fallback"
API_KEY_NAME="claude-code-clients"
OMNI_DIR="${DATA_DIR:-$HOME/.omniroute}"   # OmniRoute honors DATA_DIR too
ENV_FILE="$OMNI_DIR/.env"
KEY_FILE="$OMNI_DIR/client-api-key"
LOG_DIR="$OMNI_DIR/logs"
CLAUDE_DIR="$HOME/.claude"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"
LOCAL_URL="http://127.0.0.1:$PORT"
AIHORDE_ANON_KEY="0000000000"   # AI Horde's documented public anonymous key
# Used only if the live catalog lists no AI Horde model (it is a passthrough
# provider, so any id routes); from OmniRoute's aihorde registry entry.
AIHORDE_DEFAULT_MODEL="aihorde/aphrodite/TheDrummer/Cydonia-24B-v4.3"
MIN_NODE_MAJOR=20
HEALTH_TIMEOUT=60
CLAUDE_ENV_KEYS="ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_MODEL ANTHROPIC_DEFAULT_OPUS_MODEL ANTHROPIC_DEFAULT_SONNET_MODEL ANTHROPIC_DEFAULT_HAIKU_MODEL CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY"
SCRIPT_NAME="$(basename "$0")"

# ------------------------------------------------------------------ options --
CMD=""
SERVER_URL=""
API_KEY_ENV=""
GEMINI_KEY_ENV=""
ASSUME_YES=0
CLIENT_KEY=""
OMNI_BIN=""
RUN_TMP=""

# ------------------------------------------------------------------- output --
if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_GRN=$'\033[32m'; C_YLW=$'\033[33m'; C_CYN=$'\033[36m'; C_B=$'\033[1m'; C_0=$'\033[0m'
else
  C_RED=""; C_GRN=""; C_YLW=""; C_CYN=""; C_B=""; C_0=""
fi
step() { printf '\n%s==> %s%s\n' "$C_B" "$*" "$C_0"; }
info() { printf '    %s\n' "$*"; }
ok()   { printf '%s  ✓ %s%s\n' "$C_GRN" "$*" "$C_0"; }
warn() { printf '%s  ! %s%s\n' "$C_YLW" "$*" "$C_0" >&2; }
err()  { printf '%s  ✗ %s%s\n' "$C_RED" "$*" "$C_0" >&2; }
die()  { err "$*"; exit 1; }

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME <command> [options]

Sets up OmniRoute (https://github.com/diegosouzapw/OmniRoute) so Claude Code uses
your Claude subscription first, fails over to a free provider when its usage is
exhausted, and goes back automatically when it resets.

Commands:
  server             Run once on the always-on machine: installs OmniRoute, sets
                     REQUIRE_API_KEY=true, starts it, connects your Claude
                     subscription (browser OAuth), adds the free fallback,
                     creates the '$COMBO_NAME' combo and a client API key.
  client             Run on every other computer: points this computer's Claude
                     Code (~/.claude/settings.json) at the server.
                       --server URL        e.g. http://192.168.1.20:$PORT (required)
                       --api-key-env NAME  read the API key from env var NAME
                                           (otherwise you are prompted; the key is
                                           never accepted as a command-line argument)
  local              Single computer: 'server' + 'client' against $LOCAL_URL
                     using the stored key.
  uninstall-client   Remove the OmniRoute settings from ~/.claude/settings.json
                     (after a backup) so Claude Code talks to Anthropic directly.
  status             Server health, connected providers, combo, and whether this
                     computer's Claude Code points at OmniRoute.

Options:
  --gemini-key-env NAME  (server/local) also add Gemini as a better fallback,
                         reading your Gemini API key from env var NAME
  -y, --yes              non-interactive: skip the Claude OAuth browser login
                         (prints the command to run instead)
  -h, --help             show this help

Files:
  $ENV_FILE          OmniRoute settings (edited in place)
  $KEY_FILE   client API key (chmod 600, server only)
  $SETTINGS_FILE        Claude Code settings (merged; backed up first)
EOF
}

# ------------------------------------------------------------------ helpers --
have() { command -v "$1" >/dev/null 2>&1; }

# RUN_TMP is created once in main() (not lazily: tmpfile runs inside $(...)
# subshells, which could not report a lazily-created dir back for cleanup).
cleanup() { if [ -n "$RUN_TMP" ] && [ -d "$RUN_TMP" ]; then rm -rf "$RUN_TMP"; fi; }
trap cleanup EXIT
tmpfile() { mktemp "$RUN_TMP/f.XXXXXX"; }

valid_env_name() { printf '%s' "$1" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*$'; }

# Value of the env var whose NAME is $1 (bash 3.2: indirect expansion).
env_value() {
  valid_env_name "$1" || die "Invalid environment variable name: $1"
  eval "printf '%s' \"\${$1:-}\""
}

mask() {
  local s="$1" n
  n=${#s}
  if [ "$n" -le 10 ]; then printf '****'; else printf '%s****%s' "${s:0:4}" "${s:$((n - 4))}"; fi
}

# Pick the JSON tool used for editing/parsing: node, then python3.
json_tool() {
  if have node; then printf 'node'; elif have python3; then printf 'python3'; else printf 'none'; fi
}

# HTTP GET with a bearer key; the key goes through a curl config on stdin, never argv.
# Usage: http_get_auth URL KEY OUTFILE -> prints the HTTP status ("000" = unreachable)
http_get_auth() {
  local code
  code="$(printf 'header = "Authorization: Bearer %s"\n' "$2" |
    curl -sS -m 15 -o "$3" -w '%{http_code}' -K - "$1" 2>/dev/null)" || true
  printf '%s' "${code:-000}"
}

http_code() {
  local code
  code="$(curl -s -m 3 -o /dev/null -w '%{http_code}' "$1" 2>/dev/null)" || true
  printf '%s' "${code:-000}"
}

server_up() {
  local c
  c="$(http_code "$LOCAL_URL/v1/models")"
  [ "$c" = "200" ] || [ "$c" = "401" ]
}

# Normalize a server URL: must be http(s), no trailing slash, no /v1 suffix.
normalize_url() {
  local u="$1"
  printf '%s' "$u" | grep -Eq '^https?://[^/]+' || die "Server URL must start with http:// or https:// (got: $u)"
  while [ "${u%/}" != "$u" ]; do u="${u%/}"; done
  u="${u%/v1}"
  while [ "${u%/}" != "$u" ]; do u="${u%/}"; done
  printf '%s' "$u"
}

# ----------------------------------------------------------- JSON (node/py) --
# The omniroute CLI prints "Loaded env from ..." banners on stdout before its
# JSON, so the node helper extracts the JSON document from mixed output.
# Usage: <json on stdin> | node_eval 'JS expression using `data`'
node_eval() {
  node -e '
    const raw = require("fs").readFileSync(0, "utf8");
    const lines = raw.split(/\r?\n/);
    let a = lines.findIndex((l) => /^[\[{]/.test(l));
    let b = -1;
    for (let i = lines.length - 1; i >= 0; i--) if (/^[\]}]/.test(lines[i])) { b = i; break; }
    let data = null;
    if (a >= 0 && b >= a) { try { data = JSON.parse(lines.slice(a, b + 1).join("\n")); } catch (e) { data = null; } }
    if (data === null) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
    const out = (function (data) { return eval(process.argv[1]); })(data);
    if (out !== undefined && out !== null) process.stdout.write(String(out));
  ' "$1"
}

# Pick a model id from a /v1/models response file.
# Usage: pick_model FILE OWNER PREFER_REGEX AVOID_REGEX
pick_model() {
  node -e '
    const [file, owner, prefer, avoid] = process.argv.slice(1);
    let data; try { data = JSON.parse(require("fs").readFileSync(file, "utf8")); } catch (e) { process.exit(0); }
    const list = (Array.isArray(data) ? data : (data && data.data) || []).filter((m) =>
      m && typeof m.id === "string" && (m.owned_by === owner || m.id.startsWith(owner + "/")) &&
      m.owned_by !== "combo" && (!m.type || m.type === "chat"));
    const av = avoid ? new RegExp(avoid, "i") : null;
    const pr = prefer ? new RegExp(prefer, "i") : null;
    const ok = list.filter((m) => !av || !av.test(m.id));
    const pick = (pr && ok.find((m) => pr.test(m.id))) || ok[0] || list[0];
    if (pick) process.stdout.write(pick.id);
  ' "$1" "$2" "$3" "$4"
}

# Does a /v1/models response FILE list model id $2?
models_has_id() {
  case "$(json_tool)" in
    node)
      node -e '
        const [f, id] = process.argv.slice(1);
        let d; try { d = JSON.parse(require("fs").readFileSync(f, "utf8")); } catch (e) { process.exit(2); }
        const list = Array.isArray(d) ? d : (d && d.data) || [];
        process.exit(list.some((m) => m && m.id === id) ? 0 : 1);
      ' "$1" "$2" ;;
    python3)
      python3 -c '
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(2)
lst = d if isinstance(d, list) else (d.get("data") or [] if isinstance(d, dict) else [])
sys.exit(0 if any(isinstance(m, dict) and m.get("id") == sys.argv[2] for m in lst) else 1)
' "$1" "$2" ;;
    *)
      grep -Eq "\"id\"[[:space:]]*:[[:space:]]*\"$2\"" "$1" ;;
  esac
}

# Claude Code settings.json operations. Values come in through environment
# variables (never argv) so the token doesn't show up in `ps`.
#   settings_op check  -> prints "same" or "diff"   (needs OR_BASE OR_TOKEN OR_MODEL)
#   settings_op apply  -> merges the env block, atomic write, mode 600
#   settings_op unset  -> removes exactly the managed env keys
#   settings_op has    -> prints "yes" if any managed key is present
#   settings_op get    -> prints KEY<TAB>VALUE lines for managed keys that are set
settings_op() {
  local tool
  tool="$(json_tool)"
  case "$tool" in
    node)
      OR_KEYS="$CLAUDE_ENV_KEYS" node -e '
        const fs = require("fs");
        const [mode, file] = process.argv.slice(1);
        const E = process.env;
        const keys = E.OR_KEYS.split(" ");
        let o = {};
        if (fs.existsSync(file)) {
          const t = fs.readFileSync(file, "utf8");
          if (t.trim()) {
            try { o = JSON.parse(t); } catch (e) { console.error(file + " is not valid JSON: " + e.message); process.exit(3); }
          }
        }
        if (typeof o !== "object" || o === null || Array.isArray(o)) { console.error(file + " is not a JSON object"); process.exit(3); }
        if (o.env !== undefined && (typeof o.env !== "object" || o.env === null || Array.isArray(o.env))) { console.error("\"env\" in " + file + " is not an object"); process.exit(3); }
        const want = {
          ANTHROPIC_BASE_URL: E.OR_BASE, ANTHROPIC_AUTH_TOKEN: E.OR_TOKEN, ANTHROPIC_MODEL: E.OR_MODEL,
          ANTHROPIC_DEFAULT_OPUS_MODEL: E.OR_MODEL, ANTHROPIC_DEFAULT_SONNET_MODEL: E.OR_MODEL,
          ANTHROPIC_DEFAULT_HAIKU_MODEL: E.OR_MODEL, CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY: "1",
        };
        const env = o.env || {};
        const write = () => {
          const tmp = file + ".tmp-omniroute-" + process.pid;
          fs.writeFileSync(tmp, JSON.stringify(o, null, 2) + "\n", { mode: 0o600 });
          fs.renameSync(tmp, file);
        };
        if (mode === "check") { process.stdout.write(keys.every((k) => env[k] === want[k]) ? "same" : "diff"); }
        else if (mode === "apply") { o.env = Object.assign({}, env, want); write(); }
        else if (mode === "unset") { if (o.env) { for (const k of keys) delete o.env[k]; write(); } }
        else if (mode === "has") { process.stdout.write(keys.some((k) => k in env) ? "yes" : "no"); }
        else if (mode === "get") { for (const k of keys) if (k in env) process.stdout.write(k + "\t" + String(env[k]) + "\n"); }
      ' "$1" "$SETTINGS_FILE" ;;
    python3)
      OR_KEYS="$CLAUDE_ENV_KEYS" python3 -c '
import json, os, sys
mode, path = sys.argv[1], sys.argv[2]
E = os.environ
keys = E["OR_KEYS"].split(" ")
o = {}
if os.path.exists(path):
    with open(path) as fh:
        t = fh.read()
    if t.strip():
        try:
            o = json.loads(t)
        except ValueError as e:
            sys.stderr.write("%s is not valid JSON: %s\n" % (path, e)); sys.exit(3)
if not isinstance(o, dict):
    sys.stderr.write("%s is not a JSON object\n" % path); sys.exit(3)
if "env" in o and not isinstance(o["env"], dict):
    sys.stderr.write("\"env\" in %s is not an object\n" % path); sys.exit(3)
m = E.get("OR_MODEL")
want = {"ANTHROPIC_BASE_URL": E.get("OR_BASE"), "ANTHROPIC_AUTH_TOKEN": E.get("OR_TOKEN"),
        "ANTHROPIC_MODEL": m, "ANTHROPIC_DEFAULT_OPUS_MODEL": m, "ANTHROPIC_DEFAULT_SONNET_MODEL": m,
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": m, "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1"}
env = o.get("env") or {}
def write():
    tmp = "%s.tmp-omniroute-%d" % (path, os.getpid())
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as fh:
        fh.write(json.dumps(o, indent=2, ensure_ascii=False) + "\n")
    os.rename(tmp, path)
if mode == "check":
    sys.stdout.write("same" if all(env.get(k) == want[k] for k in keys) else "diff")
elif mode == "apply":
    new_env = dict(env); new_env.update(want); o["env"] = new_env; write()
elif mode == "unset":
    if "env" in o:
        for k in keys:
            o["env"].pop(k, None)
        write()
elif mode == "has":
    sys.stdout.write("yes" if any(k in env for k in keys) else "no")
elif mode == "get":
    for k in keys:
        if k in env:
            sys.stdout.write("%s\t%s\n" % (k, env[k]))
' "$1" "$SETTINGS_FILE" ;;
    *) return 4 ;;
  esac
}

backup_settings() {
  local b
  b="$SETTINGS_FILE.bak-omniroute-$(date +%Y%m%d-%H%M%S)"
  if [ -e "$b" ]; then b="$b-$$"; fi
  cp -p "$SETTINGS_FILE" "$b"
  chmod 600 "$b"
  printf '%s' "$b"
}

# ----------------------------------------------------------------- OmniRoute --
# Run the omniroute CLI from the data dir (it also loads ./.env from the cwd).
omni() {
  (cd "$OMNI_DIR" 2>/dev/null || cd "$HOME"; "$OMNI_BIN" "$@")
}

find_omniroute() {
  if have omniroute; then OMNI_BIN="$(command -v omniroute)"; return 0; fi
  if have npm; then
    local p
    p="$(npm prefix -g 2>/dev/null || true)"
    if [ -n "$p" ] && [ -x "$p/bin/omniroute" ]; then
      OMNI_BIN="$p/bin/omniroute"
      warn "omniroute is installed at $OMNI_BIN but that directory is not on your PATH."
      return 0
    fi
  fi
  return 1
}

require_node() {
  if ! have node; then
    err "Node.js >= $MIN_NODE_MAJOR is required but 'node' was not found."
    node_hint
    exit 1
  fi
  local v major
  v="$(node -e 'process.stdout.write(process.versions.node)')"
  major="${v%%.*}"
  if [ "$major" -lt "$MIN_NODE_MAJOR" ]; then
    err "Node.js >= $MIN_NODE_MAJOR is required (found $v)."
    node_hint
    exit 1
  fi
  ok "Node.js $v"
  have npm || die "npm was not found (it normally ships with Node.js). Reinstall Node.js."
}

node_hint() {
  if [ "$(uname -s)" = "Darwin" ]; then
    info "Install it with Homebrew:  brew install node@22"
  else
    info "Install it with your package manager or nvm, e.g.:"
    info "  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && nvm install 22"
  fi
  info "Then re-run: $SCRIPT_NAME $CMD"
}

ensure_omniroute_installed() {
  if find_omniroute; then
    ok "omniroute already installed ($(omni --version 2>/dev/null | tail -n 1))"
    return 0
  fi
  info "Installing omniroute globally with npm..."
  if ! npm install -g omniroute; then
    err "npm install -g omniroute failed."
    info "If it was a permissions error (EACCES), either install Node via nvm/Homebrew so the"
    info "global prefix is user-writable, or run:  sudo npm install -g omniroute"
    exit 1
  fi
  hash -r 2>/dev/null || true
  find_omniroute || die "omniroute was installed but the 'omniroute' command cannot be found. Add \"\$(npm prefix -g)/bin\" to PATH."
  ok "omniroute installed ($(omni --version 2>/dev/null | tail -n 1))"
}

# Set KEY=VALUE in the OmniRoute .env in place. Returns 0 if the file changed.
set_env_var() {
  local key="$1" val="$2" re count current tmp
  re="^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*="
  count="$(grep -Ec "$re" "$ENV_FILE" 2>/dev/null || true)"
  if [ "${count:-0}" -gt 0 ]; then
    current="$(grep -E "$re" "$ENV_FILE" | head -n 1 | sed 's/^[^=]*=//')"
    if [ "$count" -eq 1 ] && [ "$current" = "$val" ]; then return 1; fi
    tmp="$(tmpfile)"
    awk -v k="$key" -v v="$val" '
      $0 ~ ("^[[:space:]]*(export[[:space:]]+)?" k "[[:space:]]*=") { if (!done) { print k "=" v; done = 1 } next }
      { print }' "$ENV_FILE" >"$tmp"
    cat "$tmp" >"$ENV_FILE"   # rewrite in place: keeps inode + permissions
  else
    if [ -s "$ENV_FILE" ] && [ -n "$(tail -c 1 "$ENV_FILE")" ]; then printf '\n' >>"$ENV_FILE"; fi
    printf '%s=%s\n' "$key" "$val" >>"$ENV_FILE"
  fi
  return 0
}

start_server() {
  mkdir -p "$LOG_DIR"
  # Subshell + "&" on the command itself: the server is orphaned (re-parented to
  # init/launchd) and survives this script and the terminal closing.
  (
    cd "$OMNI_DIR" || exit 1
    nohup "$OMNI_BIN" serve --no-open >>"$LOG_DIR/installer-serve.log" 2>&1 </dev/null &
  )
}

wait_for_server() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT)) c
  while [ "$SECONDS" -lt "$deadline" ]; do
    c="$(http_code "$LOCAL_URL/v1/models")"
    if [ "$c" = "200" ] || [ "$c" = "401" ]; then return 0; fi
    sleep 1
  done
  return 1
}

wait_for_server_down() {
  local deadline=$((SECONDS + 20))
  while [ "$SECONDS" -lt "$deadline" ]; do
    server_up || return 0
    sleep 1
  done
  return 1
}

provider_ids() {
  omni providers list --json 2>/dev/null |
    node_eval '((data && data.providers) || []).map((p) => p.provider).join("\n")' || true
}
has_provider() { provider_ids | grep -Fxq "$1"; }

combo_exists() {
  local names
  names="$(omni combo list --json 2>/dev/null |
    node_eval '((data && data.combos) || []).map((c) => c.name).join("\n")' || true)"
  printf '%s\n' "$names" | grep -Fxq "$COMBO_NAME"
}

key_works() { # key -> 0 if the local server accepts it
  [ "$(http_get_auth "$LOCAL_URL/v1/models" "$1" /dev/null)" = "200" ]
}

ensure_api_key() {
  local key="" out
  if [ -s "$KEY_FILE" ]; then
    key="$(head -n 1 "$KEY_FILE" | tr -d '[:space:]')"
    if [ -n "$key" ] && key_works "$key"; then
      chmod 600 "$KEY_FILE"
      ok "Reusing client API key stored in $KEY_FILE"
      CLIENT_KEY="$key"
      return 0
    fi
    warn "The key in $KEY_FILE is no longer accepted by the server; creating a new one."
  fi
  # POST /api/keys via the CLI's generated REST command (authenticated locally
  # with OmniRoute's machine-bound CLI credential).
  out="$(omni --output json api api-keys post-api-keys --body "{\"name\":\"$API_KEY_NAME\"}" 2>/dev/null || true)"
  key="$(printf '%s\n' "$out" | node_eval '(data && typeof data.key === "string") ? data.key : ""' || true)"
  if [ -z "$key" ]; then
    err "Could not create an OmniRoute API key (omniroute api api-keys post-api-keys)."
    info "Create one in the dashboard ($LOCAL_URL -> API Keys), save it to $KEY_FILE (chmod 600), and re-run."
    exit 1
  fi
  mkdir -p "$OMNI_DIR"
  (umask 077 && printf '%s\n' "$key" >"$KEY_FILE.tmp.$$")
  mv -f "$KEY_FILE.tmp.$$" "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  ok "Created OmniRoute API key '$API_KEY_NAME' -> stored in $KEY_FILE (chmod 600)"
  CLIENT_KEY="$key"
}

lan_ips() {
  if [ "$(uname -s)" = "Darwin" ]; then
    ifconfig 2>/dev/null | awk '/inet / && $2 !~ /^127\./ { print $2 }' || true
  else
    {
      hostname -I 2>/dev/null | tr ' ' '\n'
      if have ip; then ip -4 -o addr show scope global 2>/dev/null | awk '{ print $4 }' | cut -d/ -f1; fi
    } | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | grep -v '^127\.' | awk '!seen[$0]++' || true
  fi
}

# ------------------------------------------------------------------- server --
SERVER_COMBO_READY=0

cmd_server() {
  have curl || die "curl is required."
  if [ -n "$GEMINI_KEY_ENV" ] && [ -z "$(env_value "$GEMINI_KEY_ENV")" ]; then
    die "Environment variable $GEMINI_KEY_ENV (from --gemini-key-env) is empty or not set. Nothing was changed."
  fi

  step "1/7 Node.js and OmniRoute"
  require_node
  ensure_omniroute_installed

  step "2/7 OmniRoute settings ($ENV_FILE)"
  mkdir -p "$OMNI_DIR"
  [ -f "$ENV_FILE" ] || : >"$ENV_FILE"
  local env_changed=0
  # Other computers connect over the LAN and OmniRoute binds 0.0.0.0, so require a key.
  if set_env_var REQUIRE_API_KEY true; then env_changed=1; fi
  if set_env_var OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS true; then env_changed=1; fi
  chmod 600 "$ENV_FILE"
  if [ "$env_changed" -eq 1 ]; then ok "Updated REQUIRE_API_KEY=true and OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS=true"
  else ok "Already set: REQUIRE_API_KEY=true, OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS=true"; fi

  step "3/7 OmniRoute server ($LOCAL_URL)"
  if server_up; then
    if [ "$env_changed" -eq 1 ]; then
      info "Restarting OmniRoute so the .env changes take effect..."
      omni stop >/dev/null 2>&1 || true
      wait_for_server_down || warn "The old server is still answering; continuing."
      start_server
    else
      ok "Server already running"
    fi
  else
    info "Starting OmniRoute in the background (log: $LOG_DIR/installer-serve.log)..."
    start_server
  fi
  if ! wait_for_server; then
    err "OmniRoute did not answer on $LOCAL_URL/v1/models within ${HEALTH_TIMEOUT}s."
    info "Check $LOG_DIR/installer-serve.log, or run 'omniroute serve' in a terminal to see errors."
    exit 1
  fi
  ok "Server is up"

  step "4/7 Client API key"
  ensure_api_key

  step "5/7 Claude subscription (OAuth provider 'claude')"
  if has_provider claude; then
    ok "Claude subscription already connected"
  elif [ "$ASSUME_YES" -eq 1 ] || [ ! -t 0 ]; then
    warn "Skipping the Claude browser login (non-interactive)."
    info "Run this on this machine, then re-run '$SCRIPT_NAME $CMD':"
    info "  omniroute providers add claude --oauth"
  else
    info "Starting the Claude OAuth login. Complete it in your browser"
    info "(on a headless machine, follow the printed URL/paste instructions)."
    omni providers add claude --oauth || warn "The OAuth command did not finish successfully."
    if has_provider claude; then ok "Claude subscription connected"
    else warn "Claude is still not connected. Retry with: omniroute providers add claude --oauth"; fi
  fi

  step "6/7 Free fallback provider(s)"
  if has_provider aihorde; then
    ok "AI Horde (anonymous) already added"
  elif OMNIROUTE_INSTALLER_AIHORDE_KEY="$AIHORDE_ANON_KEY" omni providers add aihorde \
    --credential-env OMNIROUTE_INSTALLER_AIHORDE_KEY --yes --json >/dev/null 2>&1; then
    ok "Added AI Horde with its public anonymous key (no signup)"
  else
    warn "Could not add AI Horde; it is a no-auth provider so the combo can still use it."
  fi
  if [ -n "$GEMINI_KEY_ENV" ]; then
    if has_provider gemini; then
      ok "Gemini already added (rotate its key with: omniroute providers rotate gemini)"
    else
      if omni providers add gemini --credential-env "$GEMINI_KEY_ENV" --yes --json >/dev/null 2>&1; then
        ok "Added Gemini (key read from \$$GEMINI_KEY_ENV)"
      else
        warn "Could not add Gemini. Try: omniroute providers add gemini --credential-env $GEMINI_KEY_ENV"
      fi
    fi
  else
    info "Tip: AI Horde is slow and cannot do tool calls, which Claude Code relies on. For a much"
    info "better fallback, re-run with --gemini-key-env NAME (a free Google AI Studio key)."
  fi

  step "7/7 Combo '$COMBO_NAME' (strategy: priority)"
  if combo_exists; then
    ok "Combo '$COMBO_NAME' already exists (left unchanged; edit it in the dashboard if needed)"
    SERVER_COMBO_READY=1
  elif ! has_provider claude; then
    warn "Claude subscription is not connected yet, so the combo was NOT created."
    info "Connect it (omniroute providers add claude --oauth), then re-run '$SCRIPT_NAME $CMD'."
  else
    build_combo
  fi

  print_server_summary
}

build_combo() {
  local cat_file code claude_model gemini_model horde_model models
  cat_file="$(tmpfile)"
  code="$(http_get_auth "$LOCAL_URL/v1/models" "$CLIENT_KEY" "$cat_file")"
  [ "$code" = "200" ] || die "Could not read the model catalog from $LOCAL_URL/v1/models (HTTP $code)."

  claude_model="$(pick_model "$cat_file" claude 'sonnet' 'haiku|web' || true)"
  if [ -z "$claude_model" ]; then
    # Fallback: the CLI's model list (only accept ids that look like real ids).
    claude_model="$(omni models claude --output json 2>/dev/null |
      node_eval '(Array.isArray(data) ? data : []).map((m) => m.id).filter((id) => /^[A-Za-z0-9._-]+(\/[A-Za-z0-9._:\/-]+)?$/.test(id) && /claude-/.test(id)).sort((a, b) => (/sonnet/.test(b) ? 1 : 0) - (/sonnet/.test(a) ? 1 : 0))[0] || ""' || true)"
    case "$claude_model" in "" | */*) ;; *) claude_model="claude/$claude_model" ;; esac
  fi
  if [ -z "$claude_model" ]; then
    warn "Claude is connected but no Claude model was found in the catalog; combo NOT created."
    info "Check 'omniroute providers test claude', then re-run '$SCRIPT_NAME $CMD'."
    return 0
  fi
  models="$claude_model"
  if has_provider gemini; then
    gemini_model="$(pick_model "$cat_file" gemini 'flash' 'lite|image|tts|embed|live|audio|vision' || true)"
    if [ -n "$gemini_model" ]; then models="$models,$gemini_model"; else warn "No Gemini chat model found in the catalog; skipping it."; fi
  fi
  horde_model="$(pick_model "$cat_file" aihorde '' '' || true)"
  if [ -z "$horde_model" ]; then
    horde_model="$AIHORDE_DEFAULT_MODEL"
    warn "AI Horde's live model list is not available; using $horde_model"
  fi
  models="$models,$horde_model"
  info "Tiers (in order): $(printf '%s' "$models" | sed 's/,/  ->  /g')"
  if omni combo create "$COMBO_NAME" --strategy priority --models "$models" >/dev/null 2>&1 && combo_exists; then
    ok "Created combo '$COMBO_NAME'"
    SERVER_COMBO_READY=1
  else
    warn "Creating the combo failed. Try: omniroute combo create $COMBO_NAME --strategy priority --models \"$models\""
  fi
}

print_server_summary() {
  local ips ip first=""
  step "Summary"
  ips="$(lan_ips)"
  if [ -n "$ips" ]; then
    info "OmniRoute LAN URL(s) (allow inbound TCP $PORT in this machine's firewall):"
    for ip in $ips; do
      info "  http://$ip:$PORT"
      [ -n "$first" ] || first="$ip"
    done
  else
    info "Could not detect a LAN IP; use http://<this-machine's-IP>:$PORT"
  fi
  [ -n "$first" ] || first="<this-machine's-IP>"
  info "Client API key: stored in $KEY_FILE (chmod 600). Show it with:  cat $KEY_FILE"
  if [ "$SERVER_COMBO_READY" -eq 1 ]; then
    ok "Combo '$COMBO_NAME' is ready."
  else
    warn "Combo '$COMBO_NAME' is not ready yet; clients will refuse to configure until it is."
  fi
  info ""
  info "On each other computer, copy this script there and run (you'll be prompted for the key):"
  info "  ${C_CYN}bash $SCRIPT_NAME client --server http://$first:$PORT${C_0}"
  info "  (or non-interactively: OMNIROUTE_API_KEY=... bash $SCRIPT_NAME client --server http://$first:$PORT --api-key-env OMNIROUTE_API_KEY)"
  info "To use it on this computer too:  bash $SCRIPT_NAME local"
  info ""
  info "Optional: this installer does not enable start-at-login. To enable it yourself, see"
  info "OmniRoute's own docs ('omniroute autostart --help' on Linux; the OmniRouteTray app on macOS)."
}

# ------------------------------------------------------------------- client --
obtain_client_key() {
  if [ -n "$API_KEY_ENV" ]; then
    CLIENT_KEY="$(env_value "$API_KEY_ENV")"
    [ -n "$CLIENT_KEY" ] || die "Environment variable $API_KEY_ENV is empty or not set."
    return 0
  fi
  if ! { : </dev/tty; } 2>/dev/null; then
    die "No terminal to prompt for the API key. Use --api-key-env NAME. Nothing was changed."
  fi
  printf 'OmniRoute API key (input hidden): ' >&2
  IFS= read -rs CLIENT_KEY </dev/tty || true
  printf '\n' >&2
  CLIENT_KEY="$(printf '%s' "$CLIENT_KEY" | tr -d '[:space:]')"
  [ -n "$CLIENT_KEY" ] || die "No API key entered."
}

print_manual_block() {
  cat <<EOF
Add this to $SETTINGS_FILE yourself (merge into any existing "env" block),
replacing the placeholder with your OmniRoute API key:

{
  "env": {
    "ANTHROPIC_BASE_URL": "$1",
    "ANTHROPIC_AUTH_TOKEN": "<your OmniRoute API key>",
    "ANTHROPIC_MODEL": "$COMBO_NAME",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "$COMBO_NAME",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "$COMBO_NAME",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "$COMBO_NAME",
    "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1"
  }
}
EOF
}

# Configure this computer's Claude Code for server base URL $1 using CLIENT_KEY.
run_client() {
  local base="$1" cat_file code tool state backup=""
  have curl || die "curl is required."

  step "Preflight: $base/v1/models"
  cat_file="$(tmpfile)"
  code="$(http_get_auth "$base/v1/models" "$CLIENT_KEY" "$cat_file")"
  case "$code" in
    200) ;;
    000) die "Cannot reach $base (connection failed). Is OmniRoute running there and TCP $PORT allowed through its firewall? Nothing was changed." ;;
    401 | 403) die "The server rejected the API key (HTTP $code). Nothing was changed." ;;
    *) die "Unexpected response from $base/v1/models (HTTP $code). Nothing was changed." ;;
  esac
  ok "Server reachable and API key accepted"
  if ! models_has_id "$cat_file" "$COMBO_NAME"; then
    die "The server has no '$COMBO_NAME' combo yet. Finish '$SCRIPT_NAME server' on the server (connect Claude first). Nothing was changed."
  fi
  ok "Combo '$COMBO_NAME' is available (model id: $COMBO_NAME)"

  step "Claude Code settings ($SETTINGS_FILE)"
  tool="$(json_tool)"
  if [ "$tool" = "none" ]; then
    err "Neither node nor python3 is available to edit JSON safely. Nothing was changed."
    print_manual_block "$base"
    exit 1
  fi
  mkdir -p "$CLAUDE_DIR"
  state="$(OR_BASE="$base" OR_TOKEN="$CLIENT_KEY" OR_MODEL="$COMBO_NAME" settings_op check)" ||
    die "Could not read $SETTINGS_FILE (see error above). Nothing was changed."
  if [ "$state" = "same" ]; then
    chmod 600 "$SETTINGS_FILE"
    ok "Already configured for $base (no changes)"
  else
    if [ -f "$SETTINGS_FILE" ]; then
      backup="$(backup_settings)"
      ok "Backed up to $backup"
    fi
    OR_BASE="$base" OR_TOKEN="$CLIENT_KEY" OR_MODEL="$COMBO_NAME" settings_op apply ||
      die "Failed to write $SETTINGS_FILE."
    chmod 600 "$SETTINGS_FILE"
    ok "Merged OmniRoute env settings (other settings preserved; file mode 600)"
  fi
  info "ANTHROPIC_BASE_URL=$base"
  info "ANTHROPIC_MODEL / DEFAULT_OPUS / DEFAULT_SONNET / DEFAULT_HAIKU = $COMBO_NAME"
  info "ANTHROPIC_AUTH_TOKEN=$(mask "$CLIENT_KEY")"
  printf '\n%sRestart Claude Code%s to apply (it reads settings at startup).\n' "$C_B" "$C_0"
  info "Undo any time with: bash $SCRIPT_NAME uninstall-client"
}

cmd_client() {
  [ -n "$SERVER_URL" ] || die "client needs --server URL (e.g. --server http://192.168.1.20:$PORT)."
  local base
  base="$(normalize_url "$SERVER_URL")"
  obtain_client_key
  run_client "$base"
}

cmd_local() {
  cmd_server
  step "Configuring this computer's Claude Code (local)"
  [ -s "$KEY_FILE" ] || die "No stored API key at $KEY_FILE."
  CLIENT_KEY="$(head -n 1 "$KEY_FILE" | tr -d '[:space:]')"
  run_client "$LOCAL_URL"
}

# --------------------------------------------------------- uninstall-client --
cmd_uninstall_client() {
  step "Removing OmniRoute settings from $SETTINGS_FILE"
  if [ ! -f "$SETTINGS_FILE" ]; then ok "No $SETTINGS_FILE; nothing to do."; return 0; fi
  if [ "$(json_tool)" = "none" ]; then
    err "Neither node nor python3 is available to edit JSON safely. Nothing was changed."
    info "Remove these keys from the \"env\" block by hand: $CLAUDE_ENV_KEYS"
    exit 1
  fi
  local has backup
  has="$(settings_op has)" || die "Could not read $SETTINGS_FILE (see error above). Nothing was changed."
  if [ "$has" != "yes" ]; then ok "No OmniRoute settings present; nothing to do."; return 0; fi
  backup="$(backup_settings)"
  ok "Backed up to $backup"
  settings_op unset || die "Failed to write $SETTINGS_FILE."
  chmod 600 "$SETTINGS_FILE"
  ok "Removed: $CLAUDE_ENV_KEYS"
  printf '\n%sRestart Claude Code%s; it will talk to Anthropic directly again.\n' "$C_B" "$C_0"
}

# ------------------------------------------------------------------- status --
cmd_status() {
  local code rows="" base="" token="" model="" k v f

  step "OmniRoute server on this computer ($LOCAL_URL)"
  if find_omniroute; then info "omniroute CLI: $OMNI_BIN ($(omni --version 2>/dev/null | tail -n 1))"
  else info "omniroute CLI: not installed on this computer"; fi
  code="$(http_code "$LOCAL_URL/v1/models")"
  case "$code" in
    200 | 401) ok "Server is up (GET /v1/models -> HTTP $code)" ;;
    *) warn "Server is not answering on $LOCAL_URL (HTTP $code)" ;;
  esac
  if [ -f "$ENV_FILE" ]; then
    for k in REQUIRE_API_KEY OMNIROUTE_PREFER_CLAUDE_CODE_FOR_UNPREFIXED_CLAUDE_MODELS; do
      v="$(grep -E "^[[:space:]]*(export[[:space:]]+)?${k}[[:space:]]*=" "$ENV_FILE" | head -n 1 | sed 's/^[^=]*=//' || true)"
      info "$k=${v:-<not set>}  ($ENV_FILE)"
    done
  fi
  if [ -s "$KEY_FILE" ]; then info "Client API key file: $KEY_FILE"; fi
  if [ -n "$OMNI_BIN" ] && have node; then
    local ids
    ids="$(omni providers list --json 2>/dev/null |
      node_eval '((data && data.providers) || []).map((p) => p.provider + " (" + (p.name || "") + ", " + (p.isActive === false ? "inactive" : "active") + (p.testStatus ? ", " + p.testStatus : "") + ")").join("\n")' || true)"
    if [ -n "$ids" ]; then
      info "Connected providers:"
      printf '%s\n' "$ids" | sed 's/^/      /'
    else
      info "Connected providers: none"
    fi
    if printf '%s\n' "$ids" | grep -q '^claude '; then ok "Claude subscription connected"
    else warn "Claude subscription not connected (omniroute providers add claude --oauth)"; fi
    if combo_exists; then ok "Combo '$COMBO_NAME' present"; else warn "Combo '$COMBO_NAME' not present"; fi
  fi

  step "This computer's Claude Code ($SETTINGS_FILE)"
  if [ ! -f "$SETTINGS_FILE" ]; then
    info "No settings file: Claude Code talks to Anthropic directly."
    return 0
  fi
  if [ "$(json_tool)" = "none" ]; then warn "Need node or python3 to read $SETTINGS_FILE."; return 0; fi
  rows="$(settings_op get)" || { warn "Could not parse $SETTINGS_FILE."; return 0; }
  while IFS="$(printf '\t')" read -r k v; do
    case "$k" in
      ANTHROPIC_BASE_URL) base="$v" ;;
      ANTHROPIC_AUTH_TOKEN) token="$v" ;;
      ANTHROPIC_MODEL) model="$v" ;;
    esac
  done <<EOF
$rows
EOF
  if [ -z "$base" ]; then
    info "Not pointing at OmniRoute (no ANTHROPIC_BASE_URL): Claude Code talks to Anthropic directly."
    return 0
  fi
  info "ANTHROPIC_BASE_URL=$base"
  info "ANTHROPIC_MODEL=${model:-<not set>}"
  info "ANTHROPIC_AUTH_TOKEN=$( [ -n "$token" ] && mask "$token" || printf '<not set>')"
  if [ -n "$token" ] && have curl; then
    f="$(tmpfile)"
    code="$(http_get_auth "$base/v1/models" "$token" "$f")"
    if [ "$code" = "200" ]; then
      ok "OmniRoute at $base accepts this computer's key"
      if models_has_id "$f" "${model:-$COMBO_NAME}"; then ok "Model '${model:-$COMBO_NAME}' is available there"
      else warn "Model '${model:-$COMBO_NAME}' is NOT listed by the server"; fi
    else
      warn "OmniRoute at $base answered HTTP $code with this computer's key"
    fi
  fi
}

# --------------------------------------------------------------------- main --
parse_args() {
  if [ $# -eq 0 ]; then usage; exit 1; fi
  case "$1" in
    -h | --help | help) usage; exit 0 ;;
  esac
  CMD="$1"
  shift
  while [ $# -gt 0 ]; do
    case "$1" in
      --server) [ $# -ge 2 ] || die "--server needs a URL"; SERVER_URL="$2"; shift 2 ;;
      --server=*) SERVER_URL="${1#*=}"; shift ;;
      --api-key-env) [ $# -ge 2 ] || die "--api-key-env needs a variable NAME"; API_KEY_ENV="$2"; shift 2 ;;
      --api-key-env=*) API_KEY_ENV="${1#*=}"; shift ;;
      --gemini-key-env) [ $# -ge 2 ] || die "--gemini-key-env needs a variable NAME"; GEMINI_KEY_ENV="$2"; shift 2 ;;
      --gemini-key-env=*) GEMINI_KEY_ENV="${1#*=}"; shift ;;
      --api-key | --api-key=* | --key | --key=* | --token | --token=*)
        die "Never pass the key on the command line. Use --api-key-env NAME or answer the prompt." ;;
      -y | --yes) ASSUME_YES=1; shift ;;
      -h | --help) usage; exit 0 ;;
      *) die "Unknown option: $1 (see --help)" ;;
    esac
  done
  if [ -n "$API_KEY_ENV" ]; then valid_env_name "$API_KEY_ENV" || die "Invalid --api-key-env name: $API_KEY_ENV"; fi
  if [ -n "$GEMINI_KEY_ENV" ]; then valid_env_name "$GEMINI_KEY_ENV" || die "Invalid --gemini-key-env name: $GEMINI_KEY_ENV"; fi
}

main() {
  parse_args "$@"
  RUN_TMP="$(mktemp -d "${TMPDIR:-/tmp}/omniroute-install.XXXXXX")"
  case "$CMD" in
    server) cmd_server ;;
    client) cmd_client ;;
    local) cmd_local ;;
    uninstall-client) cmd_uninstall_client ;;
    status) cmd_status ;;
    *) err "Unknown command: $CMD"; usage; exit 1 ;;
  esac
}

main "$@"
