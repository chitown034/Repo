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

# --------------------------------------------------------------------------- DECLINED
# name|one-line reason. Evaluated against a named alternative and NOT installed. This is not the
# REFUSED list: there is no safety objection to any of these, they are simply not the tool for this
# stack. They live here so that "was this ever looked at?" has an answer the script itself can give
# — `--only <name>` on one prints the reason instead of "unknown step". (V1 reconciliation 2026-09-22.)
DECLINED_LIST='freellmapi|tashfeenahmed/freellmapi is a SECOND free-tier aggregator (MIT, Docker on :3001, desktop app, its own encrypted key store, USD 19/yr for the live catalogue). It is NOT a key source. OmniRoute already holds that seat, and running two routers would mean two egress surfaces to audit for client data. Its public catalogue (freellmapi.co/models, 34 providers) is used as reference only.
free-llm-api-resources|cheahjs/free-llm-api-resources returns HTTP 404 — the repo is gone (re-verified 2026-09-22). It was wanted only as a free-tier catalogue: OmniRoute ships docs/reference/FREE_TIERS.md (audited 2026-09-03) and freellmapi.co/models is the live second opinion.
openalternative|openalternative.co/alternatives/ is a directory to read, not software to install. Registered in references/index.md; consult it when a paid SaaS comes up for renewal (FR5a §13).'

STEPS_PREREQ='homebrew uv pipx node python-toolchain'
STEPS_BRAIN='vendored-skills'
STEPS_FR5A='codeburn graphify claude-code-setup headroom'
STEPS_FR5B='whatsapp-cli inkbox-voice omniroute scrapers-venv scrapling scrapegraphai cli-anything cli-anything-harnesses lofty-keyfile'
STEPS_ONDEMAND='strix ponytail prompts-chat screenshot-to-code agent-reach laya higgsfield'
ALL_STEPS="$STEPS_PREREQ $STEPS_BRAIN $STEPS_FR5A $STEPS_FR5B $STEPS_ONDEMAND"

DRY_RUN=0; ONLY=''; SKIP=''; LIST=0
LOG_DIR="$HOME/Library/Logs/vanessa-setup"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"
SCRAPERS_DIR="$HOME/Applications/scrapers"
WA_DIR="$HOME/Applications/whatsapp-cli"
IV_DIR="$HOME/Applications/inkbox-voice"   # Inkbox SDK for Vanessa's iMessage voice notes (2026-09-24)
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

declined_reason() {
  printf '%s\n' "$DECLINED_LIST" | while IFS='|' read -r _n _r; do
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

# plugin_advisory <the real reason it is not automatic> <the command Steven would run>
#
# CORRECTION, 2026-09-22 (V1). An earlier spec held that Claude Code plugin installs are interactive
# and cannot run unattended. That is FALSE and it is not the reason any block below is manual. Both
#   claude plugin marketplace add <owner/repo>   -> "Successfully added marketplace"
#   claude plugin install <name>@<marketplace>   -> "Successfully installed plugin"
# were verified non-interactive, exit 0, in a throwaway HOME — and the cli-anything step further down
# already runs exactly that pair unattended. So every plugin block here is held by POLICY or by VALUE,
# never by a technical limit, and each one states which. Nothing is promoted to automatic by this note.
plugin_advisory() {
  needs_steven "$1"
  say "      command: $2"
  say "      Technically scriptable: both 'claude plugin' commands run non-interactively (verified 2026-09-22, exit 0)."
  say "      It stays manual for the reason above, not because a script could not do it. Your call, then your command."
}

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
    # `--only=` / `--skip=` with nothing after the = used to append a bare space. ONLY was then non-empty
    # but matched no step, so every step was filtered out and the script printed a clean "WOULD INSTALL:
    # none" and exited 0 — a typo that looks like a successful run. R3, 2026-09-23.
    --only) shift; ONLY="$ONLY ${1:?--only needs a step name}" ;;
    --only=*) ONLY="$ONLY ${1#--only=}"
              [ -n "${1#--only=}" ] || { printf -- '--only= needs a step name (see --list)\n' >&2; exit 2; } ;;
    --skip) shift; SKIP="$SKIP ${1:?--skip needs a step name}" ;;
    --skip=*) SKIP="$SKIP ${1#--skip=}"
              [ -n "${1#--skip=}" ] || { printf -- '--skip= needs a step name (see --list)\n' >&2; exit 2; } ;;
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
  printf '\nDECLINED — evaluated, not installed, no safety objection:\n'
  printf '%s\n' "$DECLINED_LIST" | while IFS='|' read -r n r; do printf '  %-24s %s\n' "$n" "$r"; done
  exit 0
fi

for n in $ONLY $SKIP; do
  if ! in_list "$n" "$ALL_STEPS"; then
    if printf '%s\n' "$REFUSED_LIST" | grep -q "^$n|"; then
      printf 'REFUSED: %s — %s\n' "$n" "$(refused_reason "$n")" >&2
      printf 'This script will not install it. Nothing was done.\n' >&2
      exit 2
    fi
    if printf '%s\n' "$DECLINED_LIST" | grep -q "^$n|"; then
      printf 'DECLINED: %s — %s\n' "$n" "$(declined_reason "$n")" >&2
      printf 'Evaluated and not installed. No safety objection — argue the case if you disagree. Nothing was done.\n' >&2
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
  header vendored-skills "every skill vendored in this repo — verified, never installed globally"
  missing=''
  skill_n=0
  # Enumerated, not listed (F-P6-03, 2026-09-22). This was a hard-coded nine while the repo held 22,
  # so 13 skills were checked by nothing and a newly added one would be silently unverified forever.
  for skill_dir in "$REPO_DIR"/.claude/skills/*/; do
    [ -d "$skill_dir" ] || continue
    s=${skill_dir%/}; s=${s##*/}
    skill_n=$((skill_n + 1))
    if [ -f "$REPO_DIR/.claude/skills/$s/SKILL.md" ]; then :; else missing="$missing $s"; fi
  done
  # Enumerating means an empty or absent skills directory runs the loop zero times, leaves $missing
  # empty, and would report "all present" — a green light for nothing at all. Count, then judge.
  if [ "$skill_n" -eq 0 ]; then failed "no skills found in $REPO_DIR/.claude/skills (empty or missing — pull the repo again)"
  elif [ -z "$missing" ]; then skipped "all $skill_n vendored skills present — they load with the repo, nothing to install"
  else failed "vendored skills missing a SKILL.md:$missing (pull the repo again)"; fi
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
  # POLICY, and the weakest of the three holds — the honest reading. The plugin adds no hooks and is
  # inert until invoked, so the install itself is low-risk. It is held because (a) it lands in the
  # live user scope of the Mac that holds the vault and wiki/clients/, so every session there gains
  # it, including unattended claude-runner tasks, and (b) what it PRODUCES is recommendations that
  # edit hooks and settings — HALT-class changes needing a Needs-Steven packet each (FR5a §9).
  # If Steven says yes once, this is the first candidate to promote to an automatic step.
  plugin_advisory "POLICY (not technical): it lands in the live Claude Code user scope of the business Mac, and every recommendation it makes is a hooks/settings edit — HALT-class. Choosing what the user scope carries is yours. The install is otherwise read-only and low risk; say the word and it becomes an automatic step." \
    "claude plugin marketplace add anthropics/claude-plugins-official  &&  claude plugin install claude-code-setup@claude-plugins-official"
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
if should_run inkbox-voice; then
  header inkbox-voice "Inkbox SDK so Vanessa's iMessage replies can carry her voice (mac-task-specs §6b, 2026-09-24)"
  # Why a venv and not the MCP: a 27 s clip is 135,424 tokens of base64, which no model can put into a
  # tool call. integrations/vanessa-voice-send.py moves the bytes with this SDK so the model never sees
  # them. Pinned: every call the script makes was read from 0.7.7's own source.
  if [ -x "$IV_DIR/.venv/bin/python" ] && "$IV_DIR/.venv/bin/python" -c 'import inkbox' >/dev/null 2>&1; then
    skipped "$IV_DIR/.venv already has the inkbox SDK"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    ok=1
    if uv_python 12; then
      run mkdir -p "$IV_DIR" || ok=0
      run uv venv --python 3.12 "$IV_DIR/.venv" || ok=0
      run uv pip install --python "$IV_DIR/.venv/bin/python" "inkbox==0.7.7" || ok=0
    else ok=0; failed "CPython 3.12 unavailable — the inkbox SDK needs >=3.11; install it and re-run --only inkbox-voice"; fi
    if [ "$ok" -eq 1 ]; then
      run mkdir -p "$HOME/.config/inkbox" || true
      if [ "$DRY_RUN" -eq 1 ] || "$IV_DIR/.venv/bin/python" -c 'import inkbox' >/dev/null 2>&1; then
        installed "inkbox SDK 0.7.7 in $IV_DIR/.venv"
      else failed "inkbox SDK did not import after install"; fi
    else failed "inkbox-voice install"; fi
  else failed "uv missing"; fi
  needs_steven "Vanessa's iMessage voice: (1) create an Inkbox API key in the Inkbox dashboard and put it in ~/.inkbox/config as 'api_key = ...' then chmod 600 — the SDK reads that file because launchd jobs do not inherit shell variables; (2) put the Vanessa thread's conversation UUID in ~/.config/inkbox/voice-allow, one per line — the send script refuses every other thread; (3) run integrations/tests/test_vanessa_voice_send.py with $IV_DIR/.venv/bin/python; (4) paste mac-task-specs §6a and the REWRITTEN §6b. Do not paste the first §6b — it cannot work."
fi

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
      # Was `run mkdir -p … && run ln -sf … || true` (SC2015). The warning's literal case is harmless
      # here — C is `true` — but the line was wrong for a second reason the warning does not name: it
      # then reported "+ symlink in $BINDIR" whether or not the symlink existed. Two independent
      # best-effort commands, then say what actually landed. R3, 2026-09-23.
      run mkdir -p "$BINDIR" || true
      run ln -sf "$WA_DIR/.venv/bin/whatsapp-cli" "$BINDIR/whatsapp-cli" || true
      if [ "$DRY_RUN" -eq 1 ] || [ -L "$BINDIR/whatsapp-cli" ]; then
        installed "whatsapp-cli (Python 3.12 venv) + symlink in $BINDIR"
      else
        installed "whatsapp-cli (Python 3.12 venv) — built, but $BINDIR/whatsapp-cli was NOT created; call it by its full path until that is fixed"
      fi
    else failed "whatsapp-cli install"; fi
  else failed "uv missing"; fi
  needs_steven "Your OWN WhatsApp number linked in the WhatsApp desktop app (decided 2026-09-23 over a dedicated one — context/decisions.md); AUDIT the existing Full Disk Access list before granting FDA to this shell and the runner, plus Accessibility for System Events; then run integrations/whatsapp-selfchat-setup.sh to settle the self-chat probe, and create vanessa-whatsapp-inbox DISABLED. Build mac-task-specs.md SECTION 5a, not 5 — 5 cannot run in a self-chat (F-FR5b-01)."
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
  # --- the task lease: this Mac's role. One word, and it is the whole of what makes a second Mac safe (P7).
  # Never overwrite an existing role file: on Mac #1 that would silently demote the machine that runs the tasks.
  RUNNER_CFG="$HOME/.config/claude-runner"
  if [ -f "$RUNNER_CFG/role" ]; then
    skipped "$RUNNER_CFG/role already says $(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$RUNNER_CFG/role" | grep -v '^$' | head -1)"
  elif run mkdir -p "$RUNNER_CFG" && run_sh "printf '# claude-runner role for this Mac: primary (runs the 59 tasks) or standby (lease-blocked).\n# See REMOTE-ACCESS.md -> Primary / standby. Absent or unreadable reads as standby.\nstandby\n' > '$RUNNER_CFG/role'"; then
    installed "$RUNNER_CFG/role (standby — change it to primary on the Mac that runs the tasks)"
  else failed "could not write $RUNNER_CFG/role"; fi
  needs_steven "OmniRoute dashboard password + API key value, 'omniroute providers add … --credential-env' for each free provider, the probe LaunchAgent (com.stevenshearrill.omniroute-probe, StartInterval 900), re-pointing the vanessa launcher and the runner wrapper at claude-auto, and the PII canary with the security steward — all of it is F-FR5b-05/06 and stays yours. Also: set ~/.config/claude-runner/role to primary on the Mac that runs the tasks (it is written as standby), then run 'claude-auto --lease-check' on BOTH Macs before enabling the schedule — F-P7-10."
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

if should_run cli-anything; then
  header cli-anything "agent-native CLI wrappers for the sites with no API — read-only (S1, mac-task-specs §4)"
  # Telemetry is opt-OUT: cli_hub/analytics.py reports this machine's HOSTNAME, the CLI name, the hub
  # version and which agent tool is running, on install/uninstall/launch/every call. Export it before
  # the first cli-hub command so nothing in this run leaks it.
  export CLI_HUB_NO_ANALYTICS=1
  CA_DIR="$HOME/Applications/CLI-Anything"
  # uv_tool_present, not `have`: pipx's shim lands in $BINDIR, which is not always on PATH.
  if uv_tool_present cli-hub; then skipped "cli-hub $(ver cli-hub --version)"
  elif have pipx || [ "$DRY_RUN" -eq 1 ]; then
    # The old message read "cli-anything-hub (cli-hub) 0.4.1 verified" on a run that checked neither the
    # version nor that anything had landed — 0.4.1 was verified in a cloud sandbox on 2026-09-22, not
    # here. Report what THIS run can see, the way codeburn/omniroute/headroom already do. R3, 2026-09-23.
    if run pipx install cli-anything-hub && { [ "$DRY_RUN" -eq 1 ] || uv_tool_present cli-hub; }; then
      # `|| true` inside the substitution: a bare assignment takes the substitution's status, so with
      # `set -e` a missing cli-hub (the dry-run case) would abort the script here.
      _chv=$(ver cli-hub --version || true)
      installed "cli-anything-hub (cli-hub)${_chv:+ $_chv}"
    else failed "pipx install cli-anything-hub"; fi
  else failed "pipx missing"; fi
  # Verified non-interactive 2026-09-22, both exit 0. 'marketplace add' is idempotent and may exit
  # non-zero when already declared, so it must not gate the install.
  if have claude || [ "$DRY_RUN" -eq 1 ]; then
    run claude plugin marketplace add HKUDS/CLI-Anything || true
    if run claude plugin install cli-anything@cli-anything; then
      installed "cli-anything Claude Code plugin (user scope) — /cli-anything, :list, :refine, :test, :validate"
    else failed "claude plugin install cli-anything@cli-anything"; fi
  else failed "claude CLI missing — the plugin half cannot install"; fi
  # The browser harness is what every web target actually runs on (DOMShell).
  # STILL HERE ON PURPOSE (P1, 2026-09-22), though the cli-anything-harnesses step below now
  # vendors and builds this same harness from the repo. This step keeps two things that step does
  # NOT provide: cli-hub (pipx, from PyPI) and the Claude Code plugin (from the marketplace).
  # What IS now redundant is this clone+build as a PREREQUISITE for the seven site harnesses —
  # they no longer need ~/Applications/CLI-Anything to exist. It is left in place because it is
  # idempotent (an existing build reports "already built" and re-clones nothing), because
  # mac-verify.sh and the runbooks already report on this exact path, and because ripping out a
  # working block buys nothing today. Retiring it is a separate, reviewable change.
  if [ -x "$CA_DIR/.venv/bin/cli-anything-browser" ]; then skipped "cli-anything-browser already built"
  elif have uv || [ "$DRY_RUN" -eq 1 ]; then
    _ca_ok=1
    if [ ! -d "$CA_DIR/.git" ]; then
      run mkdir -p "$HOME/Applications" || _ca_ok=0
      run git clone https://github.com/HKUDS/CLI-Anything "$CA_DIR" || _ca_ok=0
    fi
    if [ "$_ca_ok" -eq 1 ]; then
      run uv venv "$CA_DIR/.venv" || _ca_ok=0
      run uv pip install --python "$CA_DIR/.venv/bin/python" "$CA_DIR/browser/agent-harness" || _ca_ok=0
    fi
    if [ "$_ca_ok" -eq 1 ]; then
      run mkdir -p "$BINDIR" || true
      run ln -sf "$CA_DIR/.venv/bin/cli-anything-browser" "$BINDIR/cli-anything-browser" || true
      installed "cli-anything-browser (DOMShell harness) + symlink in $BINDIR"
    else failed "cli-anything-browser build"; fi
  else failed "uv missing"; fi
  ensure_env_file cli-anything <<'CAENV'
HOMES_USER|homes.com sign-in, only if the harness cannot use the logged-in Chrome profile
HOMES_PASS|homes.com password — keychain is preferred; never paste it into a prompt or a task
SHOWINGTIME_USER|ShowingTime sign-in. If your MLS uses SSO or MFA, STOP: do not automate around it
SHOWINGTIME_PASS|ShowingTime password — keychain preferred
SHOWAMI_USER|Showami sign-in
SHOWAMI_PASS|Showami password — keychain preferred
CAENV
  needs_steven "Put 'export CLI_HUB_NO_ANALYTICS=1' in your shell profile AND in the cli-anything runner task's env — this script only covers its own run. Then install the DOMShell Chrome extension and sign in to the target BY HAND — the harnesses cannot sign in, and MFA/SSO is a HALT. Nothing needs generating: the seven read-only packages in integrations/cli-anything-harnesses/ are pre-built and this script installs them; /cli-anything is only for a target we do not have (F-H1-10). Your work is the path maps: run 'cli-anything-homes --json recipe <name> --discover --text' once per recipe, edit ~/.config/cli-anything/homes-paths.json until the values match the screen, then ShowingTime and Showami the same way — all 18 browser recipes ship verified:false and no site has ever been reached (F-H1-01). SkySlope and zipForms refuse every live command, exit 3, until CLI_ANYTHING_ECC_REVIEWED_AT holds the ECC security review's sign-off date (F-S1-10)."
  say "      REFUSED here: any 'act click' / 'act type' verb in a SITE harness — that is the entire write surface, and none of the seven has one (the vendored browser engine does; that is the layer, not a wrapper). Check it with a WORD match: cli-anything-<target> --help | grep -qw act (a substring match false-trips on my-listing-activity, redact, contact, interactive, exact — F-H1-04)"
fi

if should_run cli-anything-harnesses; then
  header cli-anything-harnesses "the nine harnesses vendored in THIS repo — browser engine + eight read-only site CLIs"
  # Why this step exists (P1, 2026-09-22). The cli-anything step above clones HKUDS/CLI-Anything and
  # builds its browser harness into ~/Applications/CLI-Anything/.venv. That worked, but it made the
  # repo's own packages depend on a clone: homes, showingtime and showami declare
  # cli-anything-browser>=1.0.0, which is NOT on PyPI, and they import cli_anything.browser.core at
  # module level. Without that clone `pip install .` said "No matching distribution found", and with
  # --no-deps their --help exited 1 and pytest aborted at collection. The browser harness is now
  # vendored at integrations/cli-anything-harnesses/browser/agent-harness (Apache-2.0; ONE file carries a
  # local security patch — see its VENDORED.md and browser/patches/), so all eight install and test from
  # this checkout alone.
  CAH_SRC="$REPO_DIR/integrations/cli-anything-harnesses"
  CAH_DIR="$HOME/Applications/cli-anything-harnesses"
  CAH_PY="$CAH_DIR/.venv/bin/python"
  # browser MUST stay first. The eight site packages are installed in the SAME uv command so the
  # local browser distribution satisfies their cli-anything-browser>=1.0.0 pin inside one resolution;
  # installing homes on its own sends uv to PyPI for a package that is not there, and it fails.
  # publicfeeds added R6, 2026-09-24: 8 read-only recipes (market pages, lender-rate pages, builder
  # incentive pages) for the sites CONNECTIONS.md flags as having no Composio toolkit and no API and
  # no no-key public endpoint. Every recipe in it is ALSO gated behind its own
  # CLI_ANYTHING_TOS_REVIEWED_<GROUP> terms-of-service review (see publicfeeds/PUBLICFEEDS.md) — the
  # same disabled-by-policy pattern SkySlope/zipForms use for the ECC review, generalised to three
  # independent groups so clearing one never quietly opens another.
  CAH_PKGS='browser homes showingtime showami skyslope zipforms lofty zoho publicfeeds'

  cah_missing=''
  for p in $CAH_PKGS; do
    [ -f "$CAH_SRC/$p/agent-harness/setup.py" ] || cah_missing="$cah_missing $p"
  done
  # PEP 420: eight distributions share one cli_anything/ namespace. An __init__.py directly under any
  # cli_anything/ turns that portion into a regular package and hides the other seven. Checked, not assumed.
  cah_initpy=''
  for p in $CAH_PKGS; do
    [ -f "$CAH_SRC/$p/agent-harness/cli_anything/__init__.py" ] && cah_initpy="$cah_initpy $p"
  done

  if [ -n "$cah_missing" ]; then
    failed "harness sources missing from this checkout:$cah_missing (pull the repo again)"
  elif [ -n "$cah_initpy" ]; then
    failed "PEP 420 violation — cli_anything/__init__.py exists in:$cah_initpy . That hides the other portions; delete it before installing."
  else
    cah_have_all=1
    for p in $CAH_PKGS; do
      [ -x "$CAH_DIR/.venv/bin/cli-anything-$p" ] || cah_have_all=0
    done
    if [ "$cah_have_all" -eq 1 ]; then
      skipped "all nine harnesses already built in $CAH_DIR/.venv"
    elif have uv || [ "$DRY_RUN" -eq 1 ]; then
      cah_ok=1
      run mkdir -p "$CAH_DIR" || cah_ok=0
      [ -x "$CAH_PY" ] || run uv venv "$CAH_DIR/.venv" || cah_ok=0
      if [ "$cah_ok" -eq 1 ]; then
        # one command, browser first — see the note above
        run uv pip install --python "$CAH_PY" \
          "$CAH_SRC/browser/agent-harness" \
          "$CAH_SRC/homes/agent-harness" \
          "$CAH_SRC/showingtime/agent-harness" \
          "$CAH_SRC/showami/agent-harness" \
          "$CAH_SRC/skyslope/agent-harness" \
          "$CAH_SRC/zipforms/agent-harness" \
          "$CAH_SRC/lofty/agent-harness" \
          "$CAH_SRC/zoho/agent-harness" \
          "$CAH_SRC/publicfeeds/agent-harness" || cah_ok=0
      fi
      if [ "$cah_ok" -eq 1 ]; then
        run mkdir -p "$BINDIR" || true
        for p in $CAH_PKGS; do
          run ln -sf "$CAH_DIR/.venv/bin/cli-anything-$p" "$BINDIR/cli-anything-$p" || true
        done
        # A successful `uv pip install` is not nine working console scripts, and nine `ln -sf … || true`
        # are not nine symlinks. Both were asserted in the same breath before. Count them. R3, 2026-09-23.
        cah_built=0; cah_linked=0
        for p in $CAH_PKGS; do
          if [ -x "$CAH_DIR/.venv/bin/cli-anything-$p" ]; then cah_built=$((cah_built + 1)); fi
          if [ -L "$BINDIR/cli-anything-$p" ]; then cah_linked=$((cah_linked + 1)); fi
        done
        if [ "$DRY_RUN" -eq 1 ]; then
          installed "nine harnesses (browser engine + homes, showingtime, showami, skyslope, zipforms, lofty, zoho, publicfeeds) + symlinks in $BINDIR"
        elif [ "$cah_built" -eq 9 ]; then
          installed "nine harnesses (browser engine + homes, showingtime, showami, skyslope, zipforms, lofty, zoho, publicfeeds); $cah_linked/9 symlinked into $BINDIR"
        else
          failed "uv pip install reported success but only $cah_built/9 console scripts exist in $CAH_DIR/.venv/bin — do not treat the harnesses as installed; see $LOG_FILE"
        fi
        # F-P1-02: the harness spawns `npx -p @apireno/domshell domshell-proxy` with no version pin, and
        # is_available() makes a SECOND unpinned npx call on every invocation. Pre-install the
        # lockfile-pinned copy so runtime/bin/npx answers both locally instead of hitting the registry.
        # `npm ci`, not `npm install`: every tarball is checked against the hash recorded in this repo.
        if have npm; then
          run "$CAH_SRC/browser/runtime/posture.sh" install || failed "DOMShell pin install — see $LOG_FILE"
        else
          needs_steven "Node.js/npm is not installed, so @apireno/domshell could not be pinned. Until it is, the browser harness fetches an unpinned copy from the npm registry on first use (F-P1-02). Install Node.js, then run integrations/cli-anything-harnesses/browser/runtime/posture.sh install."
        fi
      else failed "uv pip install of the eight harnesses — see $LOG_FILE"; fi
    else failed "uv missing — run this script's uv step first"; fi
  fi

  # Zoho is the one harness with no key skeleton anywhere: lofty-keyfile below covers Lofty, and the
  # cli-anything step covers the three browser sites. Names only, no values, never rewritten.
  ensure_env_file zoho <<'ZOHOENV'
ZOHO_ACCOUNTS_URL|your Zoho accounts host, e.g. the accounts.zoho.<region> that matches your data centre
ZOHO_API_URL|your Zoho CRM API host for the same data centre
ZOHO_CLIENT_ID|Zoho API console -> your self-client / server app
ZOHO_CLIENT_SECRET|the matching secret — this file is the only place it goes; never a prompt, a task, a skill or a .md
ZOHO_REFRESH_TOKEN|minted once against scopes ZohoCRM.modules.ALL,ZohoCRM.settings.READ
ZOHOENV
  needs_steven "DOMSHELL_TOKEN is required before cli-anything-browser will connect — it is printed by the DOMShell server at startup and is a credential, so this script never reads, writes or guesses it. Export it in the shell (and in the runner task env) that drives the harness."
  needs_steven "Zoho stays blocked on the profile toggle, not on a credential: Setup -> Security Control -> Profiles -> Developer Permissions -> enable 'Zoho CRM API Access'. That is an account permission change — a HALT row. The harness is GET-only and reports the 403 honestly rather than inventing pipeline data."
  say "      the seven site harnesses have NO act verb — that is the read-only guarantee, and mac-verify.sh re-checks it by word match"
  say "      the browser ENGINE does have 'act click' / 'act type'. It is the DOMShell write surface; never point it at a client-facing system by hand"
  say "      START THE BROWSER HARNESS THROUGH integrations/cli-anything-harnesses/browser/runtime/run-browser-harness.sh"
  say "      — it sets CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true BEFORE the interpreter starts (security.py:22 reads it at"
  say "        import time, so exporting it afterwards does nothing), puts the pinned-npx shim on PATH, and creates the"
  say "        history directory 0700. Started any other way the harness runs with UPSTREAM defaults: SSRF off, npx"
  say "        unpinned, history 0755/0644. Prove it any time: browser/runtime/posture.sh check"
  needs_steven "Put these three in your shell profile AND in every runner task env that drives the browser harness, so a hand-typed command gets the same posture as the launcher: CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true ; CLI_ANYTHING_DOMSHELL_PIN_DIR=\$HOME/Applications/cli-anything-harnesses/domshell-pin ; PATH=\"<repo>/integrations/cli-anything-harnesses/browser/runtime/bin:\$PATH\""
  # R6, 2026-09-24: everything above this line is scriptable and just ran. Everything after it —
  # the DOMShell extension, signing in by hand, --discover per recipe, the ECC date, the three
  # publicfeeds terms-of-service dates — is Steven's, in order, and connect.sh is the one command
  # that walks it: idempotent, never signs in, never stores or echoes a credential.
  say ""
  say "      Next: integrations/cli-anything-harnesses/connect.sh — installs anything still missing"
  say "      (safe to re-run), runs the posture check, runs --discover for every gate-open target,"
  say "      and prints exactly who still needs to sign in, which approvals are pending (the ECC"
  say "      date for SkySlope/zipForms; the three publicfeeds terms-of-service dates), and the"
  say "      paste-ready line that writes cliAnythingStatus (mac-task-specs.md §4 / routines/mac-task-repairs.md §9)."
fi
if should_run lofty-keyfile; then
  header lofty-keyfile "Lofty CRM — the key file the API path has always needed (F-S1-11)"
  # Steven asked to "setup lofty … using anything cli". S1's answer was right and stands: Lofty is
  # NOT a CLI-Anything target, because it has a documented REST API (api.lofty.com/v1.0,
  # 'Authorization: token <key>') and lofty-bridge MCP + lofty-cli are already installed on the Mac.
  # A browser wrapper would be strictly worse. But the one concrete, automatable, secret-free step
  # that follows from that answer was never written anywhere: nothing creates the file the key goes
  # in. CONNECTIONS.md and docs/SECOND-MAC-SETUP.md both name ~/.config/lofty/.env as the location,
  # and F-S1-11 names the empty LOFTY_API_KEY as the real blocker — "no pull has ever succeeded".
  # So: create the skeleton, by NAME only. The value is Steven's, and it is a HALT item.
  ensure_env_file lofty <<'LOFTYENV'
LOFTY_API_KEY|Lofty -> Settings -> Integrations -> API -> generate a key. This file is the only place it goes; never a prompt, a task definition, a skill or a .md
LOFTYENV
  needs_steven "Generate the Lofty API key yourself (Lofty → Settings → Integrations → API), put the value in ~/.config/lofty/.env, then run lofty-crm-sync ONCE by hand and read what it wrote. Generating a credential is a HALT item — this script only made the empty file. Lofty stays on the REST API: do NOT build a CLI-Anything wrapper for it (F-S1-11)."
  say "      lofty-bridge MCP and lofty-cli are already installed on the Mac — the key is the only thing missing"
fi

# --------------------------------------------------------------------------- on a named need only
if should_run higgsfield; then
  header higgsfield "Higgsfield media API — the API, reached WITHOUT the refused repo (FR5b §4)"
  # Steven asked for the Higgsfield API. The REPO he named it through
  # (a third-party test client) is REFUSED because it commits a live-looking credential — that
  # refusal stands and is enforced by the guard above. But the refusal is of the repo, not of the
  # vendor: Higgsfield is an ordinary hosted HTTPS API, and the client is ~60 lines of `requests`
  # POSTing to platform.higgsfield.ai/<vendor>/<model>/text-to-image|text-to-video with
  # 'Authorization: Key <id>:<secret>' and polling status_url. Anyone can write that against their
  # own account; nothing about it requires cloning anybody's repo. So the request is answerable:
  # the safe path is Steven's own account, his own two values, and a few lines of curl/requests.
  # FR5b's business verdict still stands and is repeated below — no use today, paid account needed.
  if ! named_explicitly higgsfield; then
    advisory "FR5b §4 verdict for Sofia's lane: NO USE TODAY — it needs a paid account Steven does not have, and the deck already has Canva (needs reconnect) and Magica. Named here so the request is not left 'refused by association' with the repo: the API itself is fine, only that repo is refused." \
      "$0 --only higgsfield   (creates the empty key file only — it calls nothing and spends nothing)"
    say "      the safe client is a few lines of your own against platform.higgsfield.ai — never anyone else's committed key"
  else
    ensure_env_file higgsfield <<'HFENV'
HF_API_KEY_ID|Your OWN Higgsfield account -> API keys. Never a key found in someone else's repository
HF_API_KEY_SECRET|The matching secret for your own key. Paid account — decide the budget before you fill this in
HFENV
    needs_steven "A funded Higgsfield account of Steven's own and both values — that is a spend decision and a credential, two HALT rows. This script created an empty file and called nothing. Write the client yourself against platform.higgsfield.ai (Authorization: Key <id>:<secret>, poll status_url); do not obtain it by cloning the refused repo."
    say "      REFUSED and unchanged: that third-party worker repo ships a live-looking credential — never clone it, never run it"
  fi
fi

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
  # POLICY, and the strongest hold of the three. Unlike the other two plugins this one is NOT inert:
  # two Node lifecycle hooks fire on every prompt of every session and inject into every subagent,
  # so installing it silently rewrites how Vanessa dispatches work on the Mac that holds client
  # files — no one invokes it, it is simply on. That is a live-prompt/live-dispatch change, which is
  # on CLAUDE.md's HALT list, and it is Steven's decision, not a script's. It also duplicates the
  # vendored karpathy-coding-principles skill, and leaves ~/.claude/.ponytail-active on uninstall.
  plugin_advisory "POLICY (not technical), and this is the one that genuinely needs your decision: its two Node hooks run on EVERY prompt of EVERY session and inject into every subagent, so it changes Vanessa's dispatch on the Mac holding client files without ever being invoked — a live-prompt edit, HALT-class. It also overlaps the vendored karpathy-coding-principles skill." \
    "claude plugin marketplace add DietrichGebert/ponytail  &&  claude plugin install ponytail@ponytail --scope user"
fi

if should_run prompts-chat; then
  header prompts-chat "prompt library (FR5a §12)"
  # VALUE, not safety, and not a technical limit — the honest reason. FR5a read the catalogue and
  # found no skill that does anything for a mortgage/real-estate operation: Steven's prompts are his
  # persona skills. There is one security footnote (its MCP server talks to prompts.chat, so never
  # "improve" a prompt holding client detail) but that is a usage rule, not the reason it is skipped.
  plugin_advisory "VALUE, not safety: FR5a read it and found no business skill inside — Steven's prompts are his persona skills, so this buys nothing. Nothing here is blocked; it is simply not worth the user-scope slot. (Footnote: its MCP server talks to prompts.chat — never paste a prompt holding client detail into it.)" \
    "npx prompts.chat   (or: claude plugin marketplace add f/prompts.chat && claude plugin install prompts.chat@prompts.chat)"
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
