#!/usr/bin/env bash
# MAC-SETUP.sh — one idempotent installer for the tools FR5a (MAC-INSTALL-tooling.md) and
# FR5b (MAC-INSTALL-comms-data.md) verified. Run it on Steven's Mac; re-run it any time.
#
#   ./MAC-SETUP.sh --dry-run            # print every command, change nothing  <- start here
#   ./MAC-SETUP.sh                      # install the default set
#   ./MAC-SETUP.sh --only codeburn      # one step (repeatable)
#   ./MAC-SETUP.sh --skip scrapegraphai # everything but that (repeatable)
#   ./MAC-SETUP.sh --list               # the step names, and what is refused
#
# --dry-run installs nothing, writes no file of its own and does not even create the log. The
# read-only probes it uses to decide what is already present (command -v, uv python find) can still
# refresh uv's own interpreter cache — that is the only footprint, and it is uv's, not this script's.
#
# Written for macOS /bin/bash 3.2: no associative arrays, no mapfile, no ${x^^}, no &>>.
# It never writes a secret. Where a tool needs a key it creates ~/.config/<tool>/.env with the
# variable NAMES only (chmod 600) and prints what is still missing at the end.
# It never installs anything on the REFUSED list below, and aborts if a future edit tries to.
# Everything on a runbook's HALT row — a key's value, an account, a live task, a live prompt,
# a permission grant, anything that spends money — is reported as NEEDS-STEVEN and never done.
# Log: ~/Library/Logs/vanessa-setup/<date>.log   Checker: ./mac-verify.sh
# Author: M3 (Build/Release) 2026-09-22. Not executed on a Mac by its author — see the report.

set -euo pipefail

# --------------------------------------------------------------------------- REFUSED
# name|one-line reason. Nothing here is ever installed, and --only <name> on one is an error.
REFUSED_LIST='vphone-cli|needs SIP/AMFI relaxation on the Mac that holds the keychain and client files — a security regression (FR5a §15)
agent402|pay-per-call tool market settled from an agent-held wallet; spends money by design (CLAUDE.md HALT line 1, FR5a §16)
agent-skills-plugin|the whole addyosmani/agent-skills plugin ships an interview-me that collides by name with the interview-me skill this brain already has — the six wanted skills are vendored individually (FR5a §6)
media-inference-worker|framepipe-dev/media-inference-worker commits a live-looking third-party credential in its repo — never clone it, never run it (FR5b §4)
agent-reach-skill|its SKILL.md frontmatter says MUST USE for any research request, which would hijack the research path the router defines (FR5a §11)
whatsapp-plugin|the whatsapp-cli Claude plugin lets every Claude Code session on the Mac read and send WhatsApp; the task needs only the CLI (FR5b §1)
whatscli|normen/whatscli is a TUI with no automation and emulates a WhatsApp Web device — ban risk, and nothing a runner task can call (FR5b §1b)'

# name|glob — a command fragment that must never appear in anything this script executes.
REFUSED_GUARDS='vphone-cli|*vphone*
agent402|*agent402*
media-inference-worker|*media-inference-worker*
media-inference-worker|*framepipe-dev*
agent-skills-plugin|*agent-skills*
whatscli|*whatscli*
agent-reach-skill|*Agent-Reach@agent-reach*
whatsapp-plugin|*plugins?install?whatsapp*'

STEPS_PREREQ='homebrew uv pipx node python-toolchain'
STEPS_BRAIN='vendored-skills'
STEPS_FR5A='codeburn graphify claude-code-setup headroom'
STEPS_FR5B='whatsapp-cli omniroute scrapers-venv scrapling scrapegraphai'
STEPS_ONDEMAND='strix ponytail prompts-chat screenshot-to-code agent-reach laya'
ALL_STEPS="$STEPS_PREREQ $STEPS_BRAIN $STEPS_FR5A $STEPS_FR5B $STEPS_ONDEMAND"

DRY_RUN=0; ONLY=''; SKIP=''; LIST=0
LOG_DIR="$HOME/Library/Logs/vanessa-setup"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"
SCRAPERS_DIR="$HOME/Applications/scrapers"
WA_DIR="$HOME/Applications/whatsapp-cli"
BINDIR="$HOME/.local/bin"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

R_INSTALLED=''; R_SKIPPED=''; R_FAILED=''; R_NEEDS=''; R_ENVMISS=''
CUR_STEP='(startup)'

# --------------------------------------------------------------------------- plumbing
usage() { sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'; }

in_list() { # in_list needle "space separated haystack"
  _n=$1; _h=${2:-}
  for _w in $_h; do if [ "$_w" = "$_n" ]; then return 0; fi; done
  return 1
}

refused_reason() {
  printf '%s\n' "$REFUSED_LIST" | while IFS='|' read -r _n _r; do
    if [ "$_n" = "$1" ]; then printf '%s\n' "$_r"; fi
  done
}

say() { printf '%s\n' "$*"; log_line "$*"; }
log_line() {
  [ "$DRY_RUN" -eq 1 ] && return 0
  printf '%s %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*" >>"$LOG_FILE" 2>/dev/null || true
}

# Nothing that changes state runs without going through run/run_sh, and both refuse the REFUSED list.
guard_refused() {
  # no pipeline here: `exit` must kill the script, not a subshell
  while IFS='|' read -r _gname _glob; do
    [ -n "${_glob:-}" ] || continue
    # shellcheck disable=SC2254
    case "$1" in
      $_glob) printf 'ABORT: step %s tried to run a REFUSED item (%s): %s\n' "$CUR_STEP" "$_gname" "$1" >&2
              printf '       %s\n' "$(refused_reason "$_gname")" >&2
              printf '       Nothing further runs. Remove that line, or argue the case with Steven first.\n' >&2
              exit 3 ;;
    esac
  done <<EOF
$REFUSED_GUARDS
EOF
}

# NOTE: `_rc=$?` after an `if cmd; then ...; fi` reads the *if statement's* status, which is 0 on the
# else branch — that silently turned every failure into a success. Capture it with `|| _rc=$?` instead.
run() { # run cmd arg...   (no shell metacharacters)
  guard_refused "$*"
  if [ "$DRY_RUN" -eq 1 ]; then printf '  would run: %s\n' "$*"; return 0; fi
  log_line "RUN $*"
  _rc=0
  "$@" >>"$LOG_FILE" 2>&1 || _rc=$?
  [ "$_rc" -eq 0 ] || log_line "EXIT $_rc  $*"
  return "$_rc"
}

run_sh() { # run_sh 'shell string'   (pipes, redirection, globs)
  guard_refused "$1"
  if [ "$DRY_RUN" -eq 1 ]; then printf '  would run: %s\n' "$1"; return 0; fi
  log_line "RUN $1"
  _rc=0
  bash -c "$1" >>"$LOG_FILE" 2>&1 || _rc=$?
  [ "$_rc" -eq 0 ] || log_line "EXIT $_rc  $1"
  return "$_rc"
}

# npm's global bin is not always on PATH (the Mac uses $HOME/.npm-global/bin, which launchd jobs
# get only via an explicit PATH), so presence is checked by the registry listing too.
npm_present() { # npm_present <command> <package>
  have "$1" && return 0
  have npm && npm ls -g --depth=0 "$2" >/dev/null 2>&1 && return 0
  return 1
}

# uv tool / pipx put their shims in ~/.local/bin, which is not always on PATH either.
uv_tool_present() { have "$1" && return 0; [ -x "$BINDIR/$1" ] && return 0; return 1; }

have() { command -v "$1" >/dev/null 2>&1; }
ver()  { "$@" 2>/dev/null | head -1 | tr -d '\r'; }

installed()   { R_INSTALLED="$R_INSTALLED
  $CUR_STEP — $1"; if [ "$DRY_RUN" -eq 1 ]; then say "  would install  $1"; else say "  INSTALLED  $1"; fi; }
skipped()     { R_SKIPPED="$R_SKIPPED
  $CUR_STEP — $1";   say "  already present  $1"; }
failed()      { R_FAILED="$R_FAILED
  $CUR_STEP — $1";     say "  FAILED  $1"; }
needs_steven() { R_NEEDS="$R_NEEDS
  $CUR_STEP — $1";      say "  NEEDS-STEVEN  $1"; }
env_missing() { R_ENVMISS="$R_ENVMISS
  $1"; }

header() { CUR_STEP=$1; shift; say ""; say "== $CUR_STEP — $*"; }

# advisory <why not installed> <the command Steven would run>
advisory() { needs_steven "$1"; say "      command: $2"; }

# ensure_env_file <tool> — reads NAME|where-to-get-it lines on stdin.
# Creates the file with names and empty values only if it does not exist; never rewrites one that
# does (it may already hold values); always chmod 600; never reads, prints or logs a value.
ensure_env_file() {
  _tool=$1; _dir="$HOME/.config/$_tool"; _f="$_dir/.env"; _names=''
  _body=$(cat)
  while IFS='|' read -r _name _hint; do
    [ -n "${_name:-}" ] || continue
    _names="$_names $_name"
  done <<EOF
$_body
EOF
  if [ ! -f "$_f" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      printf '  would run: (umask 077; mkdir -p %s)\n' "$_dir"
      printf '  would run: write %s then chmod 600 it — variable NAMES only, no values:%s\n' "$_f" "$_names"
    elif ( umask 077
        mkdir -p "$_dir"
        {
          printf '# %s — variable NAMES only. Fill each value in yourself; nothing here is committed.\n' "$_tool"
          printf '# Written by MAC-SETUP.sh on %s. chmod 600. Never paste a value into a prompt, a task or a .md.\n' "$(date +%Y-%m-%d)"
          printf '%s\n' "$_body" | while IFS='|' read -r _n _h; do
            [ -n "${_n:-}" ] || continue
            printf '\n# %s\n%s=\n' "${_h:-value from the vendor}" "$_n"
          done
        } >"$_f" ) && chmod 600 "$_f"; then
      installed "$_f created with variable names only (chmod 600)"
    else
      failed "could not write $_f — no key file was created"
    fi
  else
    [ "$DRY_RUN" -eq 1 ] || chmod 600 "$_f"
    skipped "$_f exists — left untouched, mode set to 600"
  fi
  # report which names still have no value, by NAME only
  for _n in $_names; do
    if [ -f "$_f" ] && grep -q "^[[:space:]]*${_n}=[^[:space:]]" "$_f" 2>/dev/null; then :; else
      env_missing "$_tool/.env: $_n is not set yet"
    fi
  done
}

# uv_python <minor> — make sure a pinned CPython exists; the version gates depend on this.
UV_PY_STATE=''
uv_python() {
  if have uv && uv python find "3.$1" >/dev/null 2>&1; then UV_PY_STATE=present; return 0; fi
  UV_PY_STATE=fetched
  if [ "$DRY_RUN" -eq 1 ]; then printf '  would run: uv python install 3.%s\n' "$1"; return 0; fi
  run uv python install "3.$1"
}

# --------------------------------------------------------------------------- args
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --only) shift; ONLY="$ONLY ${1:?--only needs a step name}" ;;
    --only=*) ONLY="$ONLY ${1#--only=}" ;;
    --skip) shift; SKIP="$SKIP ${1:?--skip needs a step name}" ;;
    --skip=*) SKIP="$SKIP ${1#--skip=}" ;;
    --list) LIST=1 ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'unknown argument: %s\n\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

if [ "$LIST" -eq 1 ]; then
  printf 'prerequisites : %s\n' "$STEPS_PREREQ"
  printf 'brain         : %s\n' "$STEPS_BRAIN"
  printf 'FR5a tooling  : %s\n' "$STEPS_FR5A"
  printf 'FR5b comms    : %s\n' "$STEPS_FR5B"
  printf 'on named need : %s   (reported, not installed, unless named with --only)\n' "$STEPS_ONDEMAND"
  printf '\nREFUSED — never installed by this script:\n'
  printf '%s\n' "$REFUSED_LIST" | while IFS='|' read -r n r; do printf '  %-24s %s\n' "$n" "$r"; done
  exit 0
fi

for n in $ONLY $SKIP; do
  if ! in_list "$n" "$ALL_STEPS"; then
    if printf '%s\n' "$REFUSED_LIST" | grep -q "^$n|"; then
      printf 'REFUSED: %s — %s\n' "$n" "$(refused_reason "$n")" >&2
      printf 'This script will not install it. Nothing was done.\n' >&2
      exit 2
    fi
    printf 'unknown step: %s (see --list)\n' "$n" >&2; exit 2
  fi
done

should_run() {
  if [ -n "$ONLY" ] && ! in_list "$1" "$ONLY"; then return 1; fi
  if in_list "$1" "$SKIP"; then return 1; fi
  return 0
}
named_explicitly() { [ -n "$ONLY" ] && in_list "$1" "$ONLY"; }

# --------------------------------------------------------------------------- preflight
OS=$(uname -s)
if [ "$DRY_RUN" -eq 1 ]; then
  printf 'DRY RUN — nothing is installed, nothing is written, not even the log.\n'
else
  if [ "$OS" != "Darwin" ] && [ "${VANESSA_SETUP_ALLOW_NON_DARWIN:-0}" != "1" ]; then
    printf 'This installer targets macOS (uname says %s).\n' "$OS" >&2
    printf 'Use --dry-run anywhere; set VANESSA_SETUP_ALLOW_NON_DARWIN=1 only for a sandbox test.\n' >&2
    exit 1
  fi
  mkdir -p "$LOG_DIR" || { printf 'cannot create the log directory %s\n' "$LOG_DIR" >&2; exit 1; }
fi
say "MAC-SETUP.sh — $(date +%Y-%m-%dT%H:%M:%S%z) — host $(uname -s) — repo $REPO_DIR"
[ "$DRY_RUN" -eq 1 ] || say "log: $LOG_FILE"

# --------------------------------------------------------------------------- prerequisites
if should_run homebrew; then
  header homebrew "package manager — checked, never installed unattended"
  if have brew; then skipped "$(ver brew --version)"
  else
    needs_steven "Homebrew is not installed. This script will not pipe an installer from the network into a shell on your Mac."
    # shellcheck disable=SC2016  # printed verbatim for Steven to run, deliberately not expanded here
    say '      command: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    say "      Then re-run this script. Every step below that uses brew will report failed until it exists."
  fi
fi

if should_run uv; then
  header uv "Python toolchain used by Headroom, Strix, whatsapp-cli and the scrapers"
  if have uv; then skipped "$(ver uv --version)"
  elif have brew || [ "$DRY_RUN" -eq 1 ]; then
    if run brew install uv; then installed "uv"; else failed "brew install uv"; fi
  else failed "uv missing and brew missing"; fi
fi

if should_run pipx; then
  header pipx "isolated CLI installs — Graphify"
  if have pipx; then skipped "$(ver pipx --version)"
  elif have brew || [ "$DRY_RUN" -eq 1 ]; then
    if run brew install pipx; then installed "pipx"; else failed "brew install pipx"; fi
  else failed "pipx missing and brew missing"; fi
  case ":${PATH}:" in
    *":$BINDIR:"*) : ;;
    *) needs_steven "$BINDIR is not on your PATH, so pipx-installed commands will not resolve. Add it to ~/.zprofile yourself — this script does not edit your shell config." ;;
  esac
fi

if should_run node; then
  header node "Node 22+ — CodeBurn, OmniRoute, the skills CLI, Ponytail hooks"
  if have node; then skipped "node $(ver node --version), npm $(ver npm --version)"
  elif have brew || [ "$DRY_RUN" -eq 1 ]; then
    if run brew install node; then installed "node"; else failed "brew install node"; fi
  else failed "node missing and brew missing"; fi
fi

if should_run python-toolchain; then
  header python-toolchain "pinned CPythons — 3.12 (whatsapp-cli, scrapegraphai, strix) and 3.13 (headroom)"
  if have uv || [ "$DRY_RUN" -eq 1 ]; then
    for m in 12 13; do
      if uv_python "$m"; then
        if [ "$UV_PY_STATE" = present ]; then skipped "CPython 3.$m already available to uv"; else installed "CPython 3.$m"; fi
      else failed "could not provide CPython 3.$m"; fi
    done
  else failed "uv missing — run this script's uv step first"; fi
fi

# --------------------------------------------------------------------------- the brain itself
if should_run vendored-skills; then
  header vendored-skills "the nine skills vendored in this repo — verified, never installed globally"
  missing=''
  for s in code-review-and-quality git-workflow-and-versioning source-driven-development \
           documentation-and-adrs security-and-hardening debugging-and-error-recovery \
           find-skills apple-design karpathy-coding-principles; do
    if [ -f "$REPO_DIR/.claude/skills/$s/SKILL.md" ]; then :; else missing="$missing $s"; fi
  done
  if [ -z "$missing" ]; then skipped "all nine vendored skills present — they load with the repo, nothing to install"
  else failed "vendored skills missing from this checkout:$missing (pull the repo again)"; fi
  needs_steven "Run skills-refresh once in Claude Code so the deck's toolkit table learns about them (FR5a order of operations, step 1). Installing a skill globally is a live-prompt edit — not this script's job."
fi

# --------------------------------------------------------------------------- FR5a, in its order
if should_run codeburn; then
  header codeburn "token/cost meter — baseline the spend before anything else (FR5a §3)"
  if npm_present codeburn codeburn; then skipped "codeburn $(ver codeburn --version)"
  elif have npm || [ "$DRY_RUN" -eq 1 ]; then
    if run npm install -g codeburn && { [ "$DRY_RUN" -eq 1 ] || npm_present codeburn codeburn; }; then
      installed "codeburn"
    else failed "npm install -g codeburn — see $LOG_FILE for npm's own error"; fi
  else failed "npm missing"; fi
  say "      read-only check afterwards: codeburn overview --no-color"
  say "      keep 'share' and 'devices' off — it reads session logs that contain conversation text"
fi

if should_run graphify; then
  header graphify "knowledge-graph CLI + skill (FR5a §2) — the L4 store"
  if uv_tool_present graphify; then skipped "graphify $(ver graphify --version)"
  elif have pipx || have uv || [ "$DRY_RUN" -eq 1 ]; then
    ok=0
    if have pipx || [ "$DRY_RUN" -eq 1 ]; then run pipx install graphifyy && ok=1; fi
    if [ "$ok" -eq 0 ] && have uv; then run uv tool install graphifyy && ok=1; fi
    if [ "$ok" -eq 1 ] && { [ "$DRY_RUN" -eq 1 ] || uv_tool_present graphify; }; then
      installed "graphifyy (the CLI is named graphify)"
    else failed "could not install graphifyy — see $LOG_FILE"; fi
  else failed "neither pipx nor uv present"; fi
  needs_steven "'graphify install --platform claude' writes ~/.claude/skills/graphify/ and APPENDS to ~/.claude/CLAUDE.md — that is a live-prompt edit, so run it yourself after reading what it appends."
  say "      never run /graphify over wiki/clients/ or a vault client folder; keep graphify-out/ out of git"
fi

if should_run claude-code-setup; then
  header claude-code-setup "Anthropic's read-only project analyser (FR5a §9)"
  advisory "A plugin install lands in your live Claude Code user scope — yours to approve, not a script's." \
    "/plugin marketplace add anthropics/claude-plugins-official  →  /plugin install claude-code-setup@claude-plugins-official"
fi

if should_run headroom; then
  header headroom "context-compression proxy, measured trial only (FR5a §1)"
  if uv_tool_present headroom; then skipped "headroom $(ver headroom --version)"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    uv_python 13 || true
    if run uv tool install --python 3.13 "headroom-ai[all]" && { [ "$DRY_RUN" -eq 1 ] || uv_tool_present headroom; }; then
      installed "headroom-ai"
    else failed "uv tool install headroom-ai[all] — see $LOG_FILE"; fi
  else failed "uv missing"; fi
  needs_steven "'headroom wrap claude' / 'headroom mcp install' re-point a live session's traffic through 127.0.0.1:8787 — start it yourself on ONE report seat and compare a week of CodeBurn."
  say "      read the HEADROOM_BEACON telemetry section and turn it off; keep its local cache off iCloud;"
  say "      never wrap a session that reads wiki/clients/"
fi

# --------------------------------------------------------------------------- FR5b
if should_run whatsapp-cli; then
  header whatsapp-cli "third chat channel to Vanessa — CLI only, never the plugin (FR5b §1)"
  if [ -x "$WA_DIR/.venv/bin/whatsapp-cli" ]; then skipped "$WA_DIR/.venv/bin/whatsapp-cli already built"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    ok=1
    if [ ! -d "$WA_DIR/.git" ]; then
      run mkdir -p "$HOME/Applications" || ok=0
      run git clone https://github.com/marcelrgberger/whatsapp-cli "$WA_DIR" || ok=0
    fi
    if [ "$ok" -eq 1 ]; then
      # version gate: the code is a SyntaxError on 3.11 although its README claims 3.10+ (F-FR5b-02)
      if uv_python 12; then
        run uv venv --python 3.12 "$WA_DIR/.venv" || ok=0
        run uv pip install --python "$WA_DIR/.venv/bin/python" "$WA_DIR/agent-harness" || ok=0
      else ok=0; failed "CPython 3.12 unavailable — whatsapp-cli is a SyntaxError on 3.11 (f-string backslash, whatsapp_cli.py:1232). Not installing a broken build."; fi
    fi
    if [ "$ok" -eq 1 ]; then
      run mkdir -p "$BINDIR" && run ln -sf "$WA_DIR/.venv/bin/whatsapp-cli" "$BINDIR/whatsapp-cli" || true
      installed "whatsapp-cli (Python 3.12 venv) + symlink in $BINDIR"
    else failed "whatsapp-cli install"; fi
  else failed "uv missing"; fi
  needs_steven "A DEDICATED WhatsApp number linked in the WhatsApp desktop app — never Steven's client-facing one; Full Disk Access for the shell and the runner, Accessibility for System Events; then run the checks by hand and create vanessa-whatsapp-inbox DISABLED (F-FR5b-01, integrations/mac-task-specs.md §5)."
  say "      REFUSED here: 'claude plugins install whatsapp-cli' — it would give every session on the Mac WhatsApp"
fi

if should_run omniroute; then
  header omniroute "subscription-first failover with a PII gate (FR5b §2)"
  if npm_present omniroute omniroute; then skipped "omniroute $(ver omniroute --version)"
  elif have npm || [ "$DRY_RUN" -eq 1 ]; then
    if run npm install -g omniroute && { [ "$DRY_RUN" -eq 1 ] || npm_present omniroute omniroute; }; then
      installed "omniroute"
    else failed "npm install -g omniroute — see $LOG_FILE for npm's own error"; fi
  else failed "npm missing"; fi
  ensure_env_file omniroute <<'EOF'
OMNIROUTE_API_KEY|OmniRoute's own loopback key: start OmniRoute, open http://127.0.0.1:20128, set the dashboard password, issue an API key
OPENROUTER_API_KEY|openrouter.ai account -> Keys (free tier); load it with: omniroute providers add openrouter --credential-env OPENROUTER_API_KEY
NVIDIA_API_KEY|build.nvidia.com account -> API key; omniroute providers add nvidia --credential-env NVIDIA_API_KEY
BYTEZ_API_KEY|bytez.com account -> API key; omniroute providers add bytez --credential-env BYTEZ_API_KEY
EOF
  # claude-auto.sh -> claude-auto (the launcher name), probe.sh -> probe.sh (the plist names it with .sh)
  for pair in claude-auto.sh:claude-auto probe.sh:probe.sh; do
    f=${pair%%:*}; src="$REPO_DIR/integrations/omniroute-failover/$f"; dst="$BINDIR/${pair#*:}"
    if [ ! -f "$src" ]; then failed "$src missing from this checkout"
    elif [ -e "$dst" ] && ! cmp -s "$src" "$dst"; then
      needs_steven "$dst already exists and differs from the repo copy — the Mac's older claude-auto. Diff it and replace it yourself (FR5b: replaced, not run beside it)."
    elif [ -e "$dst" ]; then skipped "$dst already matches the repo copy"
    else
      if run mkdir -p "$BINDIR" && run cp "$src" "$dst" && run chmod +x "$dst"; then installed "$dst"; else failed "copy $f"; fi
    fi
  done
  needs_steven "OmniRoute dashboard password + API key value, 'omniroute providers add … --credential-env' for each free provider, the probe LaunchAgent (com.stevenshearrill.omniroute-probe, StartInterval 900), re-pointing the vanessa launcher and the runner wrapper at claude-auto, and the PII canary with the security steward — all of it is F-FR5b-05/06 and stays yours."
  say "      this script installs no LaunchAgent and re-points no launcher: that would be editing a live task"
fi

if { should_run scrapling || should_run scrapegraphai || should_run scrapers-venv; } && ! in_list scrapers-venv "$SKIP"; then
  header scrapers-venv "shared Python 3.12 venv for both scrapers"
  if [ -d "$SCRAPERS_DIR/.venv" ]; then skipped "$SCRAPERS_DIR/.venv already exists"
  else
    if have uv || [ "$DRY_RUN" -eq 1 ]; then
      if uv_python 12 && run mkdir -p "$SCRAPERS_DIR" && run uv venv --python 3.12 "$SCRAPERS_DIR/.venv"; then
        installed "$SCRAPERS_DIR/.venv (3.12 — scrapegraphai 2.2.4 requires >=3.12; 3.11 resolves the broken 1.76.0)"
      else failed "could not create $SCRAPERS_DIR/.venv on CPython 3.12"; fi
    else failed "uv missing"; fi
  fi
fi
SC_PY="$SCRAPERS_DIR/.venv/bin/python"

if should_run scrapling; then
  header scrapling "public-page fetcher/parser — terms check first (FR5b §3a)"
  if [ -x "$SC_PY" ] && "$SC_PY" -c 'from scrapling.fetchers import Fetcher' >/dev/null 2>&1; then
    skipped "scrapling with working fetchers ($("$SC_PY" -c 'import scrapling;print(scrapling.__version__)' 2>/dev/null))"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    # the [fetchers] extra is not optional: bare scrapling omits curl_cffi and Fetcher fails to import
    if run uv pip install --python "$SC_PY" "scrapling[fetchers]"; then
      if [ "$DRY_RUN" -eq 1 ]; then installed "scrapling[fetchers]"
      elif "$SC_PY" -c 'from scrapling.fetchers import Fetcher' >/dev/null 2>&1; then
        installed "scrapling[fetchers] — Fetcher imports"
        run_sh "'$SCRAPERS_DIR/.venv/bin/scrapling' install" || failed "scrapling install (browser deps) — rerun it by hand"
      else
        failed "scrapling installed but 'from scrapling.fetchers import Fetcher' still fails — the [fetchers] extra did not land (curl_cffi missing, F-FR5b-09). Left as-is rather than calling it working."
      fi
    else failed "uv pip install scrapling[fetchers]"; fi
  else failed "uv missing"; fi
  needs_steven "Alexandra's written terms + robots.txt check on every target before a scraper is pointed at it — homes.com, SkySlope and zipForms are named and legally loaded (F-FR5b-11). Public pages only, never a login-walled one, never a client record."
fi

if should_run scrapegraphai; then
  header scrapegraphai "LLM-extracted JSON from the same public pages, local model only (FR5b §3b)"
  if [ -x "$SC_PY" ]; then
    sg=$("$SC_PY" -c 'import importlib.metadata as m;print(m.version("scrapegraphai"))' 2>/dev/null || true)
  else sg=''; fi
  case "${sg:-none}" in
    1.*) failed "scrapegraphai $sg is the import-broken build PyPI serves to Python 3.11 (ChatOllama gone from langchain-community 0.4.2). Recreate $SCRAPERS_DIR/.venv on 3.12 and rerun." ;;
    none|'')
      if have uv || [ "$DRY_RUN" -eq 1 ]; then
        if run uv pip install --python "$SC_PY" scrapegraphai; then
          installed "scrapegraphai"
          run_sh "'$SCRAPERS_DIR/.venv/bin/playwright' install chromium" || failed "playwright install chromium — rerun it by hand"
        else failed "uv pip install scrapegraphai (needs Python >=3.12)"; fi
      else failed "uv missing"; fi ;;
    *) skipped "scrapegraphai $sg" ;;
  esac
  needs_steven "Ollama running with llama3.1:8b for the local, PII-safe model ('ollama list'). SGAI_API_KEY is the paid cloud service — not used; a cloud extractor would ship page text off the Mac."
fi

# --------------------------------------------------------------------------- on a named need only
if should_run strix; then
  header strix "AI pentester — one scan of the ISA portal, nothing else (FR5a §10)"
  if ! named_explicitly strix; then
    advisory "FR5a: never Strix without a Needs-Steven packet. It needs Docker Desktop, an LLM key that spends money, and written authorization for every target." \
      "$0 --only strix   (installs the binary only; it is never run for you)"
  elif uv_tool_present strix; then skipped "strix $(ver strix --version)"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    uv_python 12 || true
    if run uv tool install --python 3.12 strix-agent && { [ "$DRY_RUN" -eq 1 ] || uv_tool_present strix; }; then
      installed "strix-agent (pip on 3.11 refuses it — needs >=3.12)"
    else failed "uv tool install strix-agent — see $LOG_FILE"; fi
    ensure_env_file strix <<'EOF'
STRIX_LLM|the model id Strix should drive, e.g. from its README's provider list
LLM_API_KEY|your own provider key — this SPENDS MONEY per run; decide the budget before you fill it in
LLM_API_BASE|optional, only for a non-default endpoint
EOF
    needs_steven "Docker Desktop running, the key's value, and a written authorization decision per target. Own systems only — never Lofty, Zoho, LPT, Patriot Pacific, a lender portal or any vendor SaaS. strix_runs/ may contain live secrets it found: keep it out of the repo."
  else failed "uv missing"; fi
fi

if should_run ponytail; then
  header ponytail "lazy-senior-dev ruleset (FR5a §4)"
  advisory "Its two Node hooks run on every prompt of every session and inject into every subagent — that touches Vanessa's dispatch. It also overlaps the vendored karpathy-coding-principles skill." \
    "/plugin marketplace add DietrichGebert/ponytail  →  /plugin install ponytail@ponytail"
fi

if should_run prompts-chat; then
  header prompts-chat "prompt library (FR5a §12)"
  advisory "A plugin/MCP install that talks to a remote service, and FR5a found no business skill inside it." \
    "npx prompts.chat   (or /plugin marketplace add f/prompts.chat)"
fi

if should_run screenshot-to-code; then
  header screenshot-to-code "screenshot to HTML/React (FR5a §5)"
  advisory "Needs a provider API key (spend) and two local servers; FR5a's verdict was that the hosted app is enough." \
    "git clone https://github.com/abi/screenshot-to-code  →  backend: poetry install; frontend: pnpm dev"
  say "      never drop an LE, a CD, a credit report or anything with a client's name into it"
fi

if should_run agent-reach; then
  header agent-reach "social listening CLIs (FR5a §11)"
  advisory "It drives logged-in accounts with exported cookies; it needs a dedicated Chrome profile or burner decision first. Note PyPI 'agent-reach' is a different project — the source URL is the real one." \
    "pipx install 'git+https://github.com/Panniantong/agent-reach'  →  agent-reach install --env=auto  →  agent-reach doctor"
  say "      its SKILL.md is on the REFUSED list: 'MUST USE for any research' would hijack the router's research path"
fi

if should_run laya; then
  header laya "local encoder classifier (FR5a §17)"
  advisory "FR5a's verdict is 'not now': it needs fine-tuning on ~30k labelled questions and GPUs, and Claude-driven triage already works." \
    "uv venv --python 3.12 ~/laya-venv && uv pip install --python ~/laya-venv/bin/python laya"
  say "      the npm package named laya is an unrelated game engine — do not npm install it"
fi

# --------------------------------------------------------------------------- summary
printf '\n'
say "================ summary ================"
section() { # section LABEL BODY
  if [ -n "$(printf '%s' "$2" | tr -d ' \n')" ]; then say "$1:"; say "$(printf '%s\n' "$2" | sed '/^[[:space:]]*$/d')"; else say "$1: none"; fi
}
if [ "$DRY_RUN" -eq 1 ]; then section "WOULD INSTALL" "$R_INSTALLED"; else section "INSTALLED" "$R_INSTALLED"; fi
section "ALREADY PRESENT / SKIPPED" "$R_SKIPPED"
section "FAILED"       "$R_FAILED"
section "NEEDS STEVEN" "$R_NEEDS"
section "MISSING KEY VALUES (names only — no value is ever read or printed)" "$R_ENVMISS"
say "REFUSED (never installed, by design):"
printf '%s\n' "$REFUSED_LIST" | while IFS='|' read -r n r; do say "  $n — $r"; done
printf '\n'
if [ "$DRY_RUN" -eq 1 ]; then
  say "DRY RUN finished. Nothing was installed and nothing was written — not even the log."
else
  say "Log: $LOG_FILE    Next: ./mac-verify.sh"
fi
if [ -n "$(printf '%s' "$R_FAILED" | tr -d ' \n')" ]; then exit 1; fi
exit 0
