#!/usr/bin/env bash
# mac-bootstrap.sh — Steven's pending Mac setup in ONE command. It replaces the seven pastes of
# integrations/mac-everything-2026-10-09.md with a single walk-through that asks before every
# consequential change and ends with one report block to paste back to the cloud session.
#
#   ./mac-bootstrap.sh                    # the whole walk-through
#   ./mac-bootstrap.sh --dry-run          # print every command, change nothing  <- start here
#   ./mac-bootstrap.sh --only runner      # one phase (repeatable)    --skip tools   # leave one out
#   ./mac-bootstrap.sh --with-claude      # after the report, offer to start Claude Code on the ISA-KPI job
#   ./mac-bootstrap.sh --list             # the phases, the flags, and what is refused
#
# Phases (name or number):  0 preflight  1 pull  2 harnesses  3 runner  4 opus  5 tools  6 whatsapp
#                           7 brain  8 graph  9 report
#
# Every yes/no question defaults to NO (Enter = no). One can be pre-answered only by its own explicit flag:
#   --yes-runner --yes-opus --yes-tools --yes-whatsapp --yes-brain --yes-laya --yes-claude
# There is no blanket --yes.
#
# It NEVER: logs in to anything or saves a token, deletes or adds a runner task (it PAUSES three named
# ones, after you say yes), overwrites a hand-edited skill, installs anything on MAC-SETUP.sh's REFUSED
# list, prints or writes a key, touches a client-facing system, or spends money. A failed phase does not
# stop the independent phases after it; the exit code is non-zero if any phase failed.
#
# Written for macOS /bin/bash 3.2: no associative arrays, no mapfile, no ${x^^}, no &>>.
# Log: ~/Library/Logs/vanessa-setup/bootstrap-<date>.log   Report: bootstrap-<date>.txt (same folder)
# Not executed on a Mac by its author — see report.md. Exit codes: 0 ok · 1 a phase failed or this is
# not a Mac · 2 usage error / a REFUSED name · 3 aborted because something forbidden was about to run.

set -euo pipefail

BOOTSTRAP_VERSION='2026-10-09.1'

# --------------------------------------------------------------------------- never-run lists
# name|one-line reason. Copied VERBATIM from MAC-SETUP.sh (mac-bootstrap-tests.sh fails if they drift).
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

# What CLAUDE.md's HALT list forbids a script to do on Steven's behalf. Same mechanism, same abort.
HALT_LIST='no-login|logging in is a credential step: Steven does it by hand. This script never runs login, save-token or setup-token (CLAUDE.md HALT line 2)
no-runner-change|adding, editing or deleting a runner task is a live-task change. This script only PAUSES three named tasks, after a yes (CLAUDE.md HALT line 6)
no-run-task|running or restarting a runner task spends allowance — not done here (CLAUDE.md HALT line 1)
no-rm-rf|a recursive delete is irreversible — not done here (CLAUDE.md HALT line 1)
no-sudo|sudo needs a credential — not done here (CLAUDE.md HALT line 2)'

HALT_GUARDS='no-login|*runnerctl login*
no-login|*runnerctl save-token*
no-login|*claude auth login*
no-login|*claude setup-token*
no-login|*claude login*
no-runner-change|*runnerctl delete*
no-runner-change|*runnerctl remove*
no-runner-change|*runnerctl add*
no-runner-change|*runnerctl create*
no-runner-change|*runnerctl edit*
no-run-task|*runnerctl run *
no-run-task|*runnerctl restart*
no-rm-rf|*rm -rf*
no-sudo|*sudo *'

# The only runner tasks this script may pause. Pause only — never delete.
RUNNER_TASKS='openrouter-feeds-refresh feeds-weekly feeds-market-close'

# --------------------------------------------------------------------------- state
DRY_RUN=0; ONLY=''; SKIP=''; ALSO=''; LIST=0; WITH_CLAUDE=0; NON_MAC=0
YES_RUNNER=0; YES_OPUS=0; YES_TOOLS=0; YES_WHATSAPP=0; YES_BRAIN=0; YES_LAYA=0; YES_CLAUDE=0; YES_CONNECTIONS=0
TODAY=$(date +%Y-%m-%d)
LOG_DIR="$HOME/Library/Logs/vanessa-setup"
LOG_FILE="$LOG_DIR/bootstrap-$TODAY.log"
LOG_READY=0
TMP_DIR=''
RUN_SEQ=0
REPO_DIR=''
INTEG_DIR=''
HANDS=''
MACOS_VER=''
PREFLIGHT_MISSING=''
CLI_VER=''
P_OUT=''; P_RC=0; C_OUT=''; C_RC=0; R_FILE=''; R_RC=0
PH_STATUS=(notrun notrun notrun notrun notrun notrun notrun notrun notrun notrun notrun notrun notrun)
PH_NOTE=('' '' '' '' '' '' '' '' '' '' '' '' '')
PH_VALS=('' '' '' '' '' '' '' '' '' '' '' '' '')

# --------------------------------------------------------------------------- plumbing
usage() {
  cat <<'USAGE'
mac-bootstrap.sh — Steven's pending Mac setup in one command.

  ./mac-bootstrap.sh                 walk through every phase; asks before every consequential change
  ./mac-bootstrap.sh --dry-run       print every command, change nothing (start here)
  ./mac-bootstrap.sh --only <phase>  run just that phase (repeatable, or comma-separated)
  ./mac-bootstrap.sh --skip <phase>  leave a phase out (repeatable, or comma-separated)
  ./mac-bootstrap.sh --with-claude   after the report, offer to start Claude Code on the ISA-KPI job
  ./mac-bootstrap.sh --list          the phases, the flags, and what is refused

Phases: 0 preflight  1 pull  2 harnesses  3 runner  4 opus  5 tools  6 whatsapp  7 brain  8 graph  9 report

Questions default to NO. Pre-answer one only with its own flag (there is no blanket --yes):
  --yes-runner    pause the three duplicate feed tasks (phase 3)
  --yes-opus      apply the Opus 5.5 changes and run the one-request check (phase 4)
  --yes-tools     install browser-use, OpenDesign and API Anything (phase 5)
  --yes-whatsapp  set up WhatsApp / OpenWA — you still scan the QR code yourself (phase 6)
  --yes-brain     run brain-sync for real: link new skills, never overwrite one (phase 7)
  --yes-laya      register the Laya MCP server with Claude Code (phase 7)
  --yes-claude    start Claude Code on the ISA-KPI job (needs --with-claude)
  --yes-connections  run the CLI-Anything connections check (optional phase 12)

Optional phases, off unless asked for (--also zoho,lofty,connections or --only):
  10 zoho, 11 lofty   create an EMPTY ~/.config/<tool>/.env with variable NAMES only; you type the values yourself
  12 connections      integrations/cli-anything-harnesses/connect.sh (asks first)

Log: ~/Library/Logs/vanessa-setup/bootstrap-<date>.log   Report: bootstrap-<date>.txt
USAGE
}

list_phases() {
  cat <<'PHASES'
Phases (run in this order; --skip / --only take the name or the number):
  0 preflight   check git, Homebrew, uv, Claude Code, Python, runnerctl; one-line fixes for what is missing
  1 pull        git pull --ff-only (stops with a plain message if it cannot fast-forward)
  2 harnesses   ./MAC-SETUP.sh --only cli-anything-harnesses, then check that Lofty lists --v2
  3 runner      PAUSE openrouter-feeds-refresh, feeds-weekly, feeds-market-close (asks first; never deletes)
  4 opus        Opus 5.5: preview the change list, apply (asks), verify; warns if Claude Code is older than 2.1.280
  5 tools       browser-use, OpenDesign, API Anything (asks per tool; they register an MCP server / a skill)
  6 whatsapp    OpenWA via integrations/install-orca-whatsapp-laya.sh (asks; iPhone next to you for the QR code)
  7 brain       brain-sync preview, then real run (asks); doctor; bench; Laya MCP (asks); maintenance task PROPOSED
  8 graph       prints the one-line Claude Code instruction (the graph is not built by this script)
  9 report      the MAC COMBINED REPORT block, plus a saved copy
  optional (--also): 10 zoho, 11 lofty (empty key files, names only), 12 connections (connect.sh guided check)
PHASES
  printf '\nREFUSED — never run by this script (the same list as MAC-SETUP.sh):\n'
  printf '%s\n' "$REFUSED_LIST" | while IFS='|' read -r n r; do printf '  %-24s %s\n' "$n" "$r"; done
  printf '\nAlso never: log in or save a token, delete/add/edit a runner task, run a runner task, rm -rf, sudo.\n'
}

die_usage() { printf '%s\n' "$1" >&2; printf 'Try: ./mac-bootstrap.sh --help\n' >&2; exit 2; }

in_list() { # in_list needle "space separated haystack"
  local n=$1 h=${2:-} w
  for w in $h; do if [ "$w" = "$n" ]; then return 0; fi; done
  return 1
}

have() { command -v "$1" >/dev/null 2>&1; }

phase_num() { # name or number -> number; status 1 (and no output) if it is neither
  case "$1" in
    preflight|0) printf 0 ;; pull|1) printf 1 ;; harnesses|2) printf 2 ;; runner|3) printf 3 ;;
    opus|4) printf 4 ;; tools|5) printf 5 ;; whatsapp|6) printf 6 ;; brain|7) printf 7 ;;
    graph|8) printf 8 ;; report|9) printf 9 ;;
    zoho|10) printf 10 ;; lofty|11) printf 11 ;; connections|12) printf 12 ;; *) return 1 ;;
  esac
}
phase_name() {
  case "$1" in
    0) printf preflight ;; 1) printf pull ;; 2) printf harnesses ;; 3) printf runner ;; 4) printf opus ;;
    5) printf tools ;; 6) printf whatsapp ;; 7) printf brain ;; 8) printf graph ;; 9) printf report ;;
    10) printf zoho ;; 11) printf lofty ;; 12) printf connections ;;
  esac
}
phase_title() {
  case "$1" in
    0) printf 'Checking this Mac (nothing is changed)' ;;
    1) printf 'Updating your Repo folder' ;;
    2) printf 'Reinstalling the CLI harnesses (adds the Lofty --v2 option)' ;;
    3) printf 'Pausing three duplicate feed tasks (pause only, never delete)' ;;
    4) printf 'Opus 5.5' ;;
    5) printf 'Browser, design and API tools' ;;
    6) printf 'WhatsApp (OpenWA)' ;;
    7) printf 'The Second Brain engine' ;;
    8) printf 'The knowledge graph (done in Claude Code, not here)' ;;
    9) printf 'The report (one block to paste back)' ;;
    10) printf 'Zoho key file (names only; you type the values)' ;;
    11) printf 'Lofty key file (names only; you type the value)' ;;
    12) printf 'Site connections check (CLI-Anything connect.sh)' ;;
  esac
}

refused_reason() { # refused_reason <name> -> the reason, only if <name> is on the REFUSED list
  printf '%s\n' "$REFUSED_LIST" | while IFS='|' read -r _n _r; do
    if [ "$_n" = "$1" ]; then printf '%s\n' "$_r"; fi
  done
}
guard_reason() { # guard_reason <name> -> the reason from the REFUSED or HALT list
  printf '%s\n%s\n' "$REFUSED_LIST" "$HALT_LIST" | while IFS='|' read -r _n _r; do
    if [ "$_n" = "$1" ]; then printf '%s\n' "$_r"; fi
  done
}

# Display helpers: ~ for $HOME, ./ for a path inside the Repo folder (keeps the screen and the log readable).
short() {
  local s=$1 t='~' d='./'
  if [ -n "$REPO_DIR" ]; then s=${s//"$REPO_DIR/"/$d}; fi
  s=${s//"$HOME"/$t}
  printf '%s' "$s"
}
# One report-safe line: ~ for home, printable ASCII only, at most 160 characters.
clean() {
  local s
  s=$(short "$1")
  printf '%s' "$s" | LC_ALL=C tr -cd ' -~' | cut -c1-160
}
# Defence in depth: key- and token-shaped strings never reach the log or the report. The scripts this one
# calls are written not to print any; this catches a surprise.
redact() {
  sed -E \
    -e 's/(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{16,}/\1[redacted]/g' \
    -e 's/(^|[^A-Za-z0-9])(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{20,}/\1[redacted]/g' \
    -e 's/github_pat_[A-Za-z0-9_]{20,}/[redacted]/g' \
    -e 's/xox[abprs]-[A-Za-z0-9-]{10,}/[redacted]/g' \
    -e 's/AKIA[0-9A-Z]{16}/[redacted]/g' \
    -e 's/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/[redacted]/g' \
    -e 's#([Bb][Ee][Aa][Rr][Ee][Rr]) +[A-Za-z0-9._~+/=-]{16,}#\1 [redacted]#g' \
    -e 's/([A-Za-z_]*(TOKEN|SECRET|PASSWORD|API_KEY|APIKEY)[A-Za-z_]*)=[^[:space:]]+/\1=[redacted]/g'
}

log_line() {
  [ "$LOG_READY" -eq 1 ] || return 0
  printf '%s %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$*" | redact >>"$LOG_FILE" 2>/dev/null || true
}
log_output() { # log_output <file>: what a child printed, indented, redacted
  [ "$LOG_READY" -eq 1 ] || return 0
  [ -f "$1" ] || return 0
  redact <"$1" | sed 's/^/    | /' >>"$LOG_FILE" 2>/dev/null || true
}
say() { printf '%s\n' "$*"; log_line "$*"; }

heading() { # heading <n> <text>  — "4 of 9 — Opus 5.5"
  say ""
  if [ "$1" -ge 10 ]; then say "==== optional — $2"; else say "==== $1 of 9 — $2"; fi
}

add_hands() { # one line for the "left for Steven's hands" list, no duplicates
  case "
$HANDS
" in
    *"
$1
"*) return 0 ;;
  esac
  HANDS="${HANDS:+$HANDS
}$1"
}
join_hands() {
  local out='' line
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    out="${out:+$out; }$line"
  done <<EOF
$HANDS
EOF
  printf '%s' "$out"
}

# Nothing runs without going through guard_refused. A match aborts the whole run (exit 3), as in MAC-SETUP.sh.
guard_refused() {
  local gname glob
  # no pipeline here: `exit` must end the script, not a subshell
  while IFS='|' read -r gname glob; do
    [ -n "${glob:-}" ] || continue
    # shellcheck disable=SC2254
    case "$1" in
      $glob) printf 'ABORT: this script tried to run something it must never run (%s): %s\n' "$gname" "$(short "$1")" >&2
             printf '       %s\n' "$(guard_reason "$gname")" >&2
             printf '       Nothing further runs.\n' >&2
             exit 3 ;;
    esac
  done <<EOF
$REFUSED_GUARDS
$HALT_GUARDS
EOF
}

# probe: a read-only look at the machine (a --version, a --help). The only helper that also runs in --dry-run.
probe() { # probe <command...>   -> P_OUT, P_RC (always returns 0)
  guard_refused "$*"
  P_RC=0
  P_OUT=$("$@" 2>&1) || P_RC=$?
  return 0
}
# capture: runs quietly; the output stays in memory (never shown, never logged), the result is in C_RC / C_OUT.
capture() {
  guard_refused "$*"
  C_RC=0; C_OUT=''
  if [ "$DRY_RUN" -eq 1 ]; then say "  would run: $(short "$*")   (its output is read, not shown)"; return 0; fi
  log_line "RUN (quiet) $(short "$*")"
  C_OUT=$("$@" 2>&1) || C_RC=$?
  log_line "EXIT $C_RC: $(short "$*")"
  return "$C_RC"
}
# run_cmd: shown on screen as it runs (long builds stay visible), copied to the log; result in R_RC, output in R_FILE.
run_cmd() {
  guard_refused "$*"
  R_RC=0; R_FILE=''
  if [ "$DRY_RUN" -eq 1 ]; then say "  would run: $(short "$*")"; return 0; fi
  RUN_SEQ=$((RUN_SEQ + 1))
  R_FILE="$TMP_DIR/run.$RUN_SEQ"
  say "  running: $(short "$*")"
  "$@" 2>&1 | tee "$R_FILE" || R_RC=$?
  log_output "$R_FILE"
  log_line "EXIT $R_RC: $(short "$*")"
  return "$R_RC"
}
file_has() { # file_has <file> <fixed text>
  [ -n "${1:-}" ] && [ -f "$1" ] && grep -qF -- "$2" "$1"
}
file_last() { # file_last <file> <extended regex>  — the last matching line, or nothing
  if [ -z "${1:-}" ] || [ ! -f "$1" ]; then return 0; fi
  { grep -iE -- "$2" "$1" || true; } | tail -n 1
}

yes_flag() { # yes_flag <name> -> 0 when --yes-<name> was given
  case "$1" in
    runner) [ "$YES_RUNNER" -eq 1 ] ;; opus) [ "$YES_OPUS" -eq 1 ] ;; tools) [ "$YES_TOOLS" -eq 1 ] ;;
    whatsapp) [ "$YES_WHATSAPP" -eq 1 ] ;; brain) [ "$YES_BRAIN" -eq 1 ] ;; laya) [ "$YES_LAYA" -eq 1 ] ;;
    claude) [ "$YES_CLAUDE" -eq 1 ] ;; connections) [ "$YES_CONNECTIONS" -eq 1 ] ;; *) return 1 ;;
  esac
}
# ask_yn <flag-name> <question>: 0 = yes. Default NO. Only --yes-<flag-name> pre-answers it.
ask_yn() {
  local f=$1 q=$2 a=''
  if yes_flag "$f"; then say "  ? $q [y/N]  -> yes (pre-answered by --yes-$f)"; return 0; fi
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  ? $q [y/N]  -> (dry run: shown as if you said yes; a real run waits for you and Enter means no)"
    return 0
  fi
  printf '  ? %s [y/N] ' "$q"
  read -r a || a=''
  [ -t 0 ] || printf '\n'
  log_line "ASK $q -> ${a:-<no answer>}"
  case "$a" in
    y|Y|yes|YES|Yes) return 0 ;;
    *) if [ -z "$a" ] && [ ! -t 0 ]; then say "    (no answer and no terminal: taken as no; use --yes-$f to pre-answer)"
       else say "    (taken as no)"; fi
       return 1 ;;
  esac
}

# The report phase always runs unless it is skipped; --only narrows the other nine.
should_run() {
  if in_list "$1" "$SKIP"; then return 1; fi
  if [ "$1" -ge 10 ] && ! in_list "$1" "$ONLY $ALSO"; then return 1; fi
  if [ "$1" -ne 9 ] && [ "$1" -lt 10 ] && [ -n "$ONLY" ] && ! in_list "$1" "$ONLY"; then return 1; fi
  return 0
}
needed() { local p; for p in "$@"; do if should_run "$p"; then return 0; fi; done; return 1; }

# Version helpers (no sort -V on old macOS): ver_ge A B -> 0 when A >= B, comparing up to three dotted numbers.
ver_ge() {
  local a=$1 b=$2 i=1 x y
  while [ "$i" -le 3 ]; do
    x=$(printf '%s' "$a" | cut -d. -f"$i" | sed 's/[^0-9].*//')
    y=$(printf '%s' "$b" | cut -d. -f"$i" | sed 's/[^0-9].*//')
    [ -n "$x" ] || x=0
    [ -n "$y" ] || y=0
    if [ "$x" -gt "$y" ]; then return 0; fi
    if [ "$x" -lt "$y" ]; then return 1; fi
    i=$((i + 1))
  done
  return 0
}
first_version() { # first_version <text> -> the first dotted number on the first line
  printf '%s\n' "$1" | sed -n '1s/[^0-9]*\([0-9][0-9]*\(\.[0-9][0-9]*\)*\).*/\1/p'
}

# --------------------------------------------------------------------------- phase results
phase_set() { PH_STATUS[$1]=$2; PH_NOTE[$1]=$3; PH_VALS[$1]=$4; }
phase_done() { # <n> [values]
  if [ "$DRY_RUN" -eq 1 ]; then
    phase_set "$1" planned "" "${2:-}"; say "  Result: planned (dry run) — nothing was run"
  else
    phase_set "$1" "done" "" "${2:-}"; say "  Result: done${2:+ — $2}"
  fi
}
phase_skip() { # <n> <reason> [values]
  phase_set "$1" skipped "$2" "${3:-}"; say "  Result: skipped — $2"
}
phase_fail() { # <n> <reason> [values]
  phase_set "$1" failed "$2" "${3:-}"; say "  Result: FAILED — $2"
}

# --------------------------------------------------------------------------- phase 0: preflight
tool_line() { # tool_line <label> <found 1|0> <detail> <phases that need it> <one-line fix>
  local label=$1 found=$2 detail=$3 phases=$4 fix=$5
  if [ "$found" -eq 1 ]; then say "  ok       $label${detail:+ $detail}"; return 0; fi
  # shellcheck disable=SC2086
  if needed $phases; then
    say "  MISSING  $label${detail:+ — $detail} (needed by phase $phases)"
    say "           fix: $fix"
    PREFLIGHT_MISSING="${PREFLIGHT_MISSING:+$PREFLIGHT_MISSING, }$label"
    add_hands "install or fix $label (the fix is printed under phase 0)"
  else
    say "  --       $label not found (not needed for the phases you selected)"
  fi
}

phase_preflight() {
  local vals v found detail
  heading 0 "$(phase_title 0)"
  if [ "$NON_MAC" -eq 1 ]; then
    MACOS_VER='not-a-mac'; say "  note     this is $(uname -s), not macOS: preview/test mode"
  else
    probe sw_vers -productVersion
    MACOS_VER=$P_OUT; [ "$P_RC" -eq 0 ] || MACOS_VER=unknown
    say "  ok       macOS $MACOS_VER"
  fi
  say "  ok       Repo folder $(short "$REPO_DIR")"
  vals="macos=$MACOS_VER"

  # git — /usr/bin/git exists on every Mac but only works once the command line tools are installed
  found=0; detail=''; v=''
  if have git; then
    probe git --version
    if [ "$P_RC" -eq 0 ]; then found=1; v=$(first_version "$P_OUT"); detail=$v; fi
  fi
  tool_line git "$found" "$detail" "1 6 7" "xcode-select --install   (then run this again)"
  vals="$vals git=${v:-missing}"

  # Homebrew
  found=0; detail=''; v=''
  if have brew; then probe brew --version; found=1; v=$(first_version "$P_OUT"); detail=$v; fi
  if [ "$found" -eq 0 ] && [ -x /opt/homebrew/bin/brew ]; then
    # shellcheck disable=SC2016  # printed verbatim, not expanded
    tool_line brew 0 "is installed but not on your PATH" "5 6" 'eval "$(/opt/homebrew/bin/brew shellenv)"   (then add that line to ~/.zprofile)'
  else
    # shellcheck disable=SC2016  # printed verbatim for Steven to run, deliberately not expanded here
    tool_line brew "$found" "$detail" "5 6" '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   (from brew.sh; this script never pipes an installer into a shell for you)'
  fi
  vals="$vals brew=${v:-missing}"

  # uv — MAC-SETUP.sh's harness step needs it on PATH and does not install it
  found=0; detail=''
  if have uv; then found=1; probe uv --version; detail=$(first_version "$P_OUT"); fi
  tool_line uv "$found" "$detail" "2" "./MAC-SETUP.sh --only uv   (then run this again)"

  # Claude Code
  found=0; detail=''; CLI_VER=''
  if have claude; then
    probe claude --version
    CLI_VER=$(first_version "$P_OUT"); found=1; detail=$CLI_VER
    if [ -n "$CLI_VER" ] && ! ver_ge "$CLI_VER" 2.1.280; then detail="$CLI_VER (older than 2.1.280: phase 4 will say what to do)"; fi
  fi
  tool_line claude "$found" "$detail" "4" "npm install -g @anthropic-ai/claude-code   (or the installer you used before)"
  vals="$vals claude=${CLI_VER:-missing}"
  if [ "$WITH_CLAUDE" -eq 1 ] && [ "$found" -eq 0 ]; then
    say "  MISSING  claude — needed by --with-claude"
    PREFLIGHT_MISSING="${PREFLIGHT_MISSING:+$PREFLIGHT_MISSING, }claude"
  fi

  # python3 3.10+ — bin/brain refuses to run on anything older (macOS ships 3.9)
  found=0; detail=''; v=''
  if have python3; then
    probe python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])'
    if [ "$P_RC" -eq 0 ]; then
      v=$(first_version "$P_OUT")
      if [ -n "$v" ] && ver_ge "$v" 3.10; then found=1; detail=$v; else detail="$v is too old: the brain needs 3.10 or newer"; fi
    fi
  fi
  tool_line python3 "$found" "$detail" "7" "brew install python@3.12   (then open a new Terminal window and run this again)"
  vals="$vals python3=${v:-missing}"

  # runnerctl
  found=0; if have runnerctl; then found=1; fi
  tool_line runnerctl "$found" "" "3" "it ships with claude-runner; open a new Terminal window, and if it is still missing tell Claude Code (see REMOTE-ACCESS.md)"

  if [ -n "$PREFLIGHT_MISSING" ]; then
    phase_fail 0 "missing: $PREFLIGHT_MISSING" "$vals"
  else
    phase_done 0 "$vals"
  fi
}

# --------------------------------------------------------------------------- phase 1: pull
PULL_REASON=''
pull_diagnosis() { # pull_diagnosis <git's own output> -> sets PULL_REASON and prints the plain message
  local out=$1 files f gen='' other=0
  say ""
  say "  The pull stopped and NOTHING was changed. In plain words:"
  case "$out" in
    *"Not possible to fast-forward"*|*"divergent branches"*|*"diverged"*|*"reconcile"*)
      PULL_REASON="cannot fast-forward (this Mac has commits the server does not)"
      say "    This Mac has commits the server does not, so a clean fast-forward is impossible."
      say "    Fix: ask Claude Code \"why can git not fast-forward here?\" — do not force it (no reset, no rebase)." ;;
    *"would be overwritten"*|*"Please commit your changes or stash"*)
      PULL_REASON="local edits are in the way of the update"
      files=$(printf '%s\n' "$out" | sed -n 's/^[[:space:]]\{1,\}\([^[:space:]].*\)$/\1/p')
      while IFS= read -r f; do
        [ -n "$f" ] || continue
        case "$f" in
          INDEX.md|brain/index.json|docs/reports/BRAIN-BENCH.md) gen="$gen $f" ;;
          *) other=$((other + 1)) ;;
        esac
      done <<EOF
$files
EOF
      say "    Files in your Repo folder were edited here, and the update wants to change them too."
      if [ -n "$gen" ] && [ "$other" -eq 0 ]; then
        say "    They are files the brain rebuilds itself (an earlier brain-sync or bench run wrote them)."
        say "    Fix: git checkout --$gen   (it discards only those rebuilt copies), then run this again."
      else
        say "    Fix: run  git status  and ask Claude Code before discarding anything — $other of them are not rebuilt files."
      fi ;;
    *"no tracking information"*|*"no upstream"*|*"not currently on a branch"*)
      PULL_REASON="this folder is not following a server branch"
      say "    This folder is not following a branch on the server."
      say "    Fix: ask Claude Code to set the upstream branch for you." ;;
    *"Could not resolve host"*|*"unable to access"*|*"Network is unreachable"*|*"timed out"*)
      PULL_REASON="could not reach GitHub (offline?)"
      say "    GitHub could not be reached — check the internet connection."
      say "    Fix: connect, then run this again." ;;
    *"Authentication failed"*|*"Permission denied"*|*"could not read Username"*)
      PULL_REASON="git needs a GitHub sign-in"
      say "    git needs you signed in to GitHub. That is your hands — this script never handles credentials."
      say "    Fix: sign in the way you normally do, then run this again." ;;
    *)
      PULL_REASON="git pull failed (see the lines above)"
      say "    git gave the message printed above."
      say "    Fix: ask Claude Code what it means before changing anything." ;;
  esac
}

phase_pull() {
  local before after branch
  heading 1 "$(phase_title 1)"
  if [ "$DRY_RUN" -eq 1 ]; then
    run_cmd git -C "$REPO_DIR" pull --ff-only
    phase_done 1 ""
    return 0
  fi
  if ! have git; then
    phase_fail 1 "git is not installed (fix: xcode-select --install)"
    add_hands "install git: xcode-select --install"
    return 0
  fi
  probe git -C "$REPO_DIR" rev-parse --short HEAD; before=$P_OUT
  say "  Fast-forward only: if this folder cannot simply catch up, it stops and changes nothing."
  if run_cmd git -C "$REPO_DIR" pull --ff-only; then
    probe git -C "$REPO_DIR" rev-parse --short HEAD; after=$P_OUT
    probe git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD; branch=$P_OUT
    if [ "$before" = "$after" ]; then say "  Already up to date at $after."; else say "  Updated $before -> $after."; fi
    phase_done 1 "head=$after branch=$(clean "$branch")"
  else
    pull_diagnosis "$(cat "$R_FILE" 2>/dev/null || true)"
    add_hands "fix the git pull (see the phase 1 message), then run this again"
    phase_fail 1 "$PULL_REASON"
  fi
}

# --------------------------------------------------------------------------- phase 2: harnesses
phase_harnesses() {
  local c via='' v2=n ok=1 extra=''
  heading 2 "$(phase_title 2)"
  if [ "$DRY_RUN" -eq 0 ] && ! have uv; then
    phase_fail 2 "uv is not installed (fix: ./MAC-SETUP.sh --only uv, then run this phase again)"
    add_hands "install uv: ./MAC-SETUP.sh --only uv"
    return 0
  fi
  if ! run_cmd bash "$REPO_DIR/MAC-SETUP.sh" --only cli-anything-harnesses; then
    ok=0
    say "  MAC-SETUP.sh reported a problem — its own log: ~/Library/Logs/vanessa-setup/$TODAY.log"
  fi
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  would then run: lofty-cli leads timeline --help   (or cli-anything-lofty), and look for --v2"
    phase_done 2 ""
    return 0
  fi
  if file_has "$R_FILE" "NEEDS-STEVEN"; then
    add_hands "the NEEDS STEVEN list MAC-SETUP.sh printed (credentials, site sign-ins, the Zoho API permission); none of it is done by this script"
  fi
  for c in lofty-cli cli-anything-lofty "$HOME/.local/bin/cli-anything-lofty" "$HOME/Applications/cli-anything-harnesses/.venv/bin/cli-anything-lofty"; do
    have "$c" || continue
    probe "$c" leads timeline --help
    case "$P_OUT" in *--v2*) v2=y; via=$c; break ;; esac
  done
  if [ "$v2" = y ]; then
    extra=" via=$(basename "$via")"
    say "  Checked: the Lofty timeline command lists --v2 ($(basename "$via"))."
  else
    say "  Checked: no Lofty command on this Mac lists --v2 under  leads timeline --help."
  fi
  if [ "$ok" -eq 1 ] && [ "$v2" = y ]; then phase_done 2 "harness_v2=y$extra"
  elif [ "$ok" -eq 0 ]; then phase_fail 2 "MAC-SETUP.sh reported a failure" "harness_v2=$v2$extra"
  else phase_fail 2 "installed, but the Lofty timeline help does not list --v2" "harness_v2=n"; fi
}

# --------------------------------------------------------------------------- phase 3: runner
# The ONLY runnerctl calls this script may ever make: status, list, and pause <one of RUNNER_TASKS>.
runner_allowed() {
  case "$1" in
    status|list) if [ $# -eq 1 ]; then return 0; fi ;;
    pause) if [ $# -eq 2 ] && in_list "$2" "$RUNNER_TASKS"; then return 0; fi ;;
  esac
  printf 'ABORT: this script may only run  runnerctl status | list | pause <one of: %s>.\n' "$RUNNER_TASKS" >&2
  printf '       Refused: runnerctl %s\n       Nothing further runs.\n' "$*" >&2
  exit 3
}
task_line() { # task_line <name> <text> -> the first line of <text> that has <name> as a whole word
  printf '%s\n' "$2" | awk -v t="$1" '{ for (i = 1; i <= NF; i++) { w = $i; sub(/[,:;|]+$/, "", w); if (w == t) { print; exit } } }'
}

runner_not_logged_in() {
  say "  runnerctl is not logged in. That is yours to do: run  runnerctl login  yourself."
  say "  This script never logs in and never saves a token for you."
  add_hands "run: runnerctl login   then: ./mac-bootstrap.sh --only runner"
}

phase_runner() {
  local t line paused='' absent='' bad='' list_out=''
  heading 3 "$(phase_title 3)"
  say "  These three tasks would be PAUSED (they stay in the runner and can be resumed; nothing is deleted):"
  for t in $RUNNER_TASKS; do say "    - $t"; done
  if [ "$DRY_RUN" -eq 1 ]; then
    runner_allowed status; capture runnerctl status
    runner_allowed list; capture runnerctl list
    ask_yn runner "Pause these three tasks now?" || true
    for t in $RUNNER_TASKS; do runner_allowed pause "$t"; run_cmd runnerctl pause "$t"; done
    runner_allowed list; run_cmd runnerctl list
    phase_done 3 ""
    return 0
  fi
  if ! have runnerctl; then
    phase_fail 3 "runnerctl not found (it ships with claude-runner)"
    add_hands "install or find runnerctl, then: ./mac-bootstrap.sh --only runner"
    return 0
  fi
  # a read-only look first: is it logged in, and which of the three exist?
  runner_allowed status; capture runnerctl status || true
  case "$C_OUT" in
    *[Nn]ot\ logged\ in*|*[Ll]ogged\ out*|*[Nn]ot\ signed\ in*|*[Nn]ot\ authenticated*|*[Ll]ogin\ required*|*[Pp]lease\ log\ in*|*[Uu]nauthenticated*)
      runner_not_logged_in
      phase_fail 3 "runnerctl is not logged in (your hands: runnerctl login)"
      return 0 ;;
  esac
  runner_allowed list
  if ! capture runnerctl list; then
    say "  Could not read the task list (exit $C_RC)."
    runner_not_logged_in
    phase_fail 3 "runnerctl list failed (exit $C_RC); if it is not logged in: runnerctl login"
    return 0
  fi
  list_out=$C_OUT
  if ! ask_yn runner "Pause these three tasks now?"; then
    phase_skip 3 "declined, no runner task was touched" "paused=none"
    return 0
  fi
  for t in $RUNNER_TASKS; do
    line=$(task_line "$t" "$list_out")
    if [ -z "$line" ]; then
      say "  $t: not in  runnerctl list  — nothing to pause"; absent="${absent:+$absent,}$t"; continue
    fi
    case "$line" in
      *[Pp]aused*|*PAUSED*) say "  $t: already paused"; paused="${paused:+$paused,}$t"; continue ;;
    esac
    runner_allowed pause "$t"
    if run_cmd runnerctl pause "$t"; then paused="${paused:+$paused,}$t"; else bad="${bad:+$bad,}$t"; fi
  done
  say ""
  say "  The runner's list now (runnerctl list):"
  runner_allowed list
  if capture runnerctl list; then
    printf '%s\n' "$C_OUT" | sed 's/^/    /'
  else
    say "    (could not read the list again: exit $C_RC)"
  fi
  if [ -n "$bad" ]; then
    add_hands "pause by hand (runnerctl pause <name>): $bad"
    phase_fail 3 "runnerctl pause failed for: $bad" "paused=${paused:-none}"
  else
    phase_done 3 "paused=${paused:-none}${absent:+ not_in_list=$absent}"
  fi
}

# --------------------------------------------------------------------------- phase 4: opus
opus_model() { # opus_model <file> -> the model name after "opus ran on:"
  file_last "$1" 'opus ran on:' | sed -n 's/.*opus ran on: *//p' | sed 's/ *$//'
}

phase_opus() {
  local script="$INTEG_DIR/ai-team/opus-5-5-on-mac.sh" pins='' model='' q
  heading 4 "$(phase_title 4)"
  if [ "$DRY_RUN" -eq 0 ] && ! have claude; then
    phase_fail 4 "claude not found (fix: npm install -g @anthropic-ai/claude-code)"
    add_hands "install Claude Code, then: ./mac-bootstrap.sh --only opus"
    return 0
  fi
  if have claude; then probe claude --version; CLI_VER=$(first_version "$P_OUT"); fi
  if [ "$DRY_RUN" -eq 0 ]; then
    say "  Claude Code version: ${CLI_VER:-unknown}"
    if [ -z "$CLI_VER" ]; then
      say "  WARNING: could not read the Claude Code version."
    elif ! ver_ge "$CLI_VER" 2.1.280; then
      say "  WARNING: older than 2.1.280. The 'opus' alias only means Opus 5.5 from 2.1.280, so here it still means Opus 5."
      say "           Run  claude update  yourself (this script does not update Claude Code), then run this phase again."
      add_hands "run: claude update   (Claude Code is older than 2.1.280)"
    fi
  fi
  say "  Step 1 — what would change (a read-only preview; nothing is changed):"
  run_cmd bash "$script" || true
  if [ "$DRY_RUN" -eq 1 ]; then
    ask_yn opus "Apply the changes above (a backup is made first) and run the one-request check?" || true
    run_cmd bash "$script" --apply
    run_cmd bash "$script" --verify
    phase_done 4 ""
    return 0
  fi
  pins=$(file_last "$R_FILE" 'Found [0-9]+ pin' | sed -n 's/.*Found \([0-9][0-9]*\) pin.*/\1/p')
  case "$pins" in ''|*[!0-9]*) pins=0 ;; esac
  if [ "$pins" -gt 0 ]; then
    q="Apply these $pins change(s) (a backup is made first), then run the one-request check?"
  else
    q="Run the one-request check that 'opus' really runs Opus 5.5 (one short Claude request)?"
  fi
  if ! ask_yn opus "$q"; then
    phase_skip 4 "declined, nothing was changed" "cli=${CLI_VER:-unknown}"
    return 0
  fi
  if [ "$pins" -gt 0 ]; then
    if ! run_cmd bash "$script" --apply; then
      phase_fail 4 "--apply failed, so nothing was verified" "cli=${CLI_VER:-unknown}"
      return 0
    fi
  fi
  run_cmd bash "$script" --verify || true
  model=$(opus_model "$R_FILE")
  if [ "$R_RC" -eq 0 ]; then
    phase_done 4 "opus_verify=$(clean "${model:-unknown}") cli=${CLI_VER:-unknown}"
  else
    add_hands "run: claude update   (the opus alias is not Opus 5.5 yet)"
    phase_fail 4 "the opus alias does not run Opus 5.5 yet (run: claude update)" "opus_verify=$(clean "${model:-unknown}") cli=${CLI_VER:-unknown}"
  fi
}

# --------------------------------------------------------------------------- phase 5: tools
# selftest_line <file>: the last line that mentions a self-test, else the last non-empty line.
selftest_line() {
  local l
  l=$(file_last "$1" 'self-test')
  if [ -z "$l" ] && [ -f "$1" ]; then l=$({ grep -v '^[[:space:]]*$' "$1" || true; } | tail -n 1); fi
  printf '%s\n' "$l"
}

TOOLS_VALS=''; TOOLS_BAD=''; TOOLS_RAN=0
tool_install() { # tool_install <label> <script> <what it changes>
  local label=$1 script=$2 what=$3 line res
  say ""
  say "  $label — $what"
  if ! ask_yn tools "Install $label?"; then
    TOOLS_VALS="$TOOLS_VALS $label=skipped"; return 0
  fi
  TOOLS_RAN=$((TOOLS_RAN + 1))
  if [ "$DRY_RUN" -eq 1 ]; then
    run_cmd bash "$script"
    say "  would then read its self-test line"
    TOOLS_VALS="$TOOLS_VALS $label=planned"
    return 0
  fi
  run_cmd bash "$script" || true
  line=$(clean "$(selftest_line "$R_FILE")")
  say "  self-test line: ${line:-<none printed>}"
  res=fail
  case "$line" in *[Pp]assed*) if [ "$R_RC" -eq 0 ]; then res=pass; fi ;; esac
  TOOLS_VALS="$TOOLS_VALS $label=$res"
  if [ "$res" = fail ]; then TOOLS_BAD="${TOOLS_BAD:+$TOOLS_BAD, }$label"; fi
}

phase_tools() {
  heading 5 "$(phase_title 5)"
  TOOLS_VALS=''; TOOLS_BAD=''; TOOLS_RAN=0
  say "  Each one is safe to repeat. They download software; two of them also register a Claude Code"
  say "  MCP server, and one installs a skill, so each is a separate yes/no."
  if [ "$DRY_RUN" -eq 0 ] && ! have brew; then
    phase_fail 5 "Homebrew is not installed (see phase 0 for the fix)"
    return 0
  fi
  tool_install browser-use "$INTEG_DIR/browser-use/install-mac.sh" \
    "a separate hidden Chrome for Claude (no logins) plus the MCP server 'browser-use'; needs Google Chrome in /Applications"
  tool_install open-design "$INTEG_DIR/open-design/install-mac.sh" \
    "downloads and builds a design workspace in ~/Applications/open-design (several minutes), then a quick self-test; no MCP server"
  tool_install api-anything "$INTEG_DIR/api-anything/install-mac.sh" \
    "builds a pinned API Anything, installs it with npm, adds the MCP server 'api-anything' and a skill in ~/.claude/skills/api-anything"
  TOOLS_VALS=${TOOLS_VALS# }
  if [ "$TOOLS_RAN" -eq 0 ]; then
    phase_skip 5 "declined, nothing was installed" "$TOOLS_VALS"
  elif [ -n "$TOOLS_BAD" ]; then
    add_hands "check the tool installer(s) whose self-test did not pass: $TOOLS_BAD (log: ~/Library/Logs/vanessa-setup/bootstrap-$TODAY.log)"
    phase_fail 5 "self-test did not pass for: $TOOLS_BAD" "$TOOLS_VALS"
  else
    phase_done 5 "$TOOLS_VALS"
  fi
}

# --------------------------------------------------------------------------- phase 6: whatsapp
phase_whatsapp() {
  local script="$INTEG_DIR/install-orca-whatsapp-laya.sh" stop=''
  heading 6 "$(phase_title 6)"
  say "  This sets up WhatsApp (OpenWA) on this Mac only; Orca and Laya are left alone:"
  say "    - installs Docker Desktop if it is missing, then builds OpenWA (10-15 minutes the first time)"
  say "    - stores keys in your Keychain (never printed) and starts a background helper so Vanessa can"
  say "      answer you in your own 'Message Yourself' chat"
  say "    - opens a QR code in your browser: HAVE YOUR iPHONE NEXT TO YOU NOW"
  say "      (WhatsApp > Settings > Linked Devices > Link a Device, then scan). It waits 5 minutes for you."
  say "    Nothing is ever sent to anyone but you."
  if [ "$DRY_RUN" -eq 0 ] && ! have brew; then
    phase_fail 6 "Homebrew is not installed (see phase 0 for the fix)"
    return 0
  fi
  if ! ask_yn whatsapp "Set up WhatsApp now?"; then
    phase_skip 6 "declined" "whatsapp=not run"
    return 0
  fi
  if run_cmd bash "$script" --skip-orca --skip-laya; then
    phase_done 6 "whatsapp=done"
  else
    stop=$(file_last "$R_FILE" '^(install|setup-phone|install-bridge|provision-keys)[a-z.-]*: ')
    if [ -z "$stop" ]; then stop=$(file_last "$R_FILE" '^=='); fi
    stop=$(clean "${stop:-unknown}")
    say "  It is safe to run again; it picks up where it stopped:  ./mac-bootstrap.sh --only whatsapp"
    add_hands "WhatsApp: run  ./mac-bootstrap.sh --only whatsapp  with your iPhone next to you (it stopped at: $stop)"
    phase_fail 6 "stopped at: $stop" "whatsapp=stopped at $stop"
  fi
}

# --------------------------------------------------------------------------- phase 7: brain
BR_PROBLEMS=''; BR_SYNC=declined; BR_LINKED=0; BR_WOULD=0; BR_CONF=0
BR_DOCTOR=''; BR_BENCH=''; BR_TOKENS=''; BR_REFUSALS=''; BR_LAYA=not; BR_MAINT=proposed

br_problem() { BR_PROBLEMS="${BR_PROBLEMS:+$BR_PROBLEMS; }$1"; }

# 0 unless `git pull --rebase --autostash` (which brain-sync.sh runs) would have local-only commits to replay
sync_pull_is_safe() {
  local ahead behind
  probe git -C "$REPO_DIR" rev-parse --abbrev-ref --symbolic-full-name '@{u}'
  [ "$P_RC" -eq 0 ] || return 0
  probe git -C "$REPO_DIR" rev-list --left-right --count 'HEAD...@{u}'
  [ "$P_RC" -eq 0 ] || return 0
  ahead=${P_OUT%%[[:space:]]*}; behind=${P_OUT##*[[:space:]]}
  case "$ahead$behind" in ''|*[!0-9]*) return 0 ;; esac
  if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then return 1; fi
  return 0
}
# "<tokens> <correct>/<answerable> <refusals_correct>/<refusals>" from the brain row of the bench Totals table
parse_bench() {
  printf '%s\n' "$1" | awk -F'|' '
    { n = $2; gsub(/^ +/, "", n); gsub(/ +$/, "", n) }
    n == "brain" { t = $3; c = $7; r = $8; gsub(/[ ,]/, "", t); gsub(/ /, "", c); gsub(/ /, "", r); print t, c, r; exit }'
}
# "<linked> <already-ok> <conflicts>" from brain-sync's summary block
sync_summary() {
  printf '%s\n' "$1" | sed -n 's/^ *skills: *linked=\([0-9]*\) already-ok=\([0-9]*\) conflicts=\([0-9]*\).*/\1 \2 \3/p' | tail -n 1
}
# Show the preview without the "would run" noise, paths shortened: every skill it would link, every conflict.
show_sync_preview() {
  local line
  while IFS= read -r line; do
    case "$line" in
      ''|*"would run:"*|"brain-sync —"*|"(dry-run"*|"== git pull"*|"== bin/brain"*) ;;
      *) say "  $(short "$line")" ;;
    esac
  done <<EOF
$1
EOF
}

brain_sync_step() {
  local sum
  say "  Step 1 — preview what brain-sync would do (it changes nothing in this preview):"
  if [ "$DRY_RUN" -eq 1 ]; then
    capture bash "$REPO_DIR/scripts/brain-sync.sh" --dry-run
  else
    capture bash "$REPO_DIR/scripts/brain-sync.sh" --dry-run || true
    show_sync_preview "$C_OUT"
    sum=$(sync_summary "$C_OUT")
    if [ -n "$sum" ]; then
      read -r BR_WOULD _ BR_CONF <<EOF
$sum
EOF
    fi
    if [ "$BR_CONF" -gt 0 ]; then
      say "  $BR_CONF skill(s) have a hand-edited copy on this Mac. They are NOT touched; the CONFLICT lines above"
      say "  show the command to replace one if you ever want to. That is your call, not this script's."
      add_hands "decide about the $BR_CONF hand-edited skill(s) brain-sync kept as they were (its CONFLICT lines)"
    fi
  fi
  if ! ask_yn brain "Run brain-sync for real (updates the repo, rebuilds INDEX.md, links bin/brain into ~/.local/bin, links ${BR_WOULD} new skill(s); never overwrites a hand-edited one)?"; then
    say "  Skipped the real sync."
    return 0
  fi
  if [ "$DRY_RUN" -eq 0 ] && ! sync_pull_is_safe; then
    BR_SYNC=blocked
    say "  NOT running it: this Repo folder has commits the server does not, and the server has new ones."
    say "  brain-sync would try to rebase them, which can leave the folder half-finished. Ask Claude Code to look"
    say "  first (git log --oneline @{u}..HEAD). Nothing was changed."
    br_problem "sync blocked (history diverged)"
    add_hands "sort out the diverged Repo folder, then: ./mac-bootstrap.sh --only brain"
    return 0
  fi
  run_cmd bash "$REPO_DIR/scripts/brain-sync.sh" || true
  if [ "$DRY_RUN" -eq 1 ]; then BR_SYNC=planned; return 0; fi
  BR_SYNC=ran
  sum=$(sync_summary "$(cat "$R_FILE" 2>/dev/null || true)")
  if [ -n "$sum" ]; then
    read -r BR_LINKED _ BR_CONF <<EOF
$sum
EOF
  fi
  if file_has "$R_FILE" "reindex-failed" || file_has "$R_FILE" "doctor-flagged"; then
    br_problem "brain-sync's own index check was not clean"
  fi
}

brain_checks_step() {
  local brain="$REPO_DIR/bin/brain" row first
  say ""
  say "  Step 2 — brain doctor (read-only):"
  capture "$brain" doctor || true
  if [ "$DRY_RUN" -eq 0 ]; then
    printf '%s\n' "$C_OUT" | sed 's/^/    /'
    BR_DOCTOR=$(printf '%s\n' "$C_OUT" | sed -n 's/^doctor: \(PASS\|FAIL\)$/\1/p' | tail -n 1)
    if [ -z "$BR_DOCTOR" ]; then
      BR_DOCTOR=FAIL; first=$(printf '%s\n' "$C_OUT" | sed -n '1p')
      br_problem "doctor could not run ($(clean "${first:-no output}"))"
    elif [ "$BR_DOCTOR" = FAIL ]; then
      br_problem "doctor FAIL (the index is stale; bin/brain reindex fixes it)"
    fi
  fi
  say "  Step 3 — brain bench --write (rewrites docs/reports/BRAIN-BENCH.md in your Repo folder; that is normal):"
  capture "$brain" bench --write || true
  if [ "$DRY_RUN" -eq 0 ]; then
    printf '%s\n' "$C_OUT" | awk '/^## Totals/{f=1;next} /^## /{f=0} f && NF' | sed 's/^/    /'
    row=$(parse_bench "$C_OUT")
    if [ -n "$row" ]; then
      read -r BR_TOKENS BR_BENCH BR_REFUSALS <<EOF
$row
EOF
    fi
    case "$BR_TOKENS" in ''|*[!0-9]*) BR_TOKENS='' ;; esac
    if [ -z "$BR_TOKENS" ] || [ -z "$BR_BENCH" ]; then
      first=$(printf '%s\n' "$C_OUT" | sed -n '1p')
      br_problem "could not read the bench totals ($(clean "${first:-no output}"))"
    elif [ "$C_RC" -ne 0 ]; then
      say "  Note: bench exited $C_RC, meaning the brain path did not beat the baselines on this run."
    fi
  fi
}

brain_laya_step() {
  local d lbin=''
  say ""
  say "  Step 4 — Laya (local router) MCP server:"
  if [ "$DRY_RUN" -eq 1 ]; then
    capture claude mcp list
    say "  would look for laya-mcp-server in ~/Applications/laya-venv/bin or ~/laya-venv/bin"
    ask_yn laya "Register Laya with Claude Code for all projects?" || true
    run_cmd claude mcp add -s user laya --env LAYA_DEVICE=cpu -- '<path to laya-mcp-server>'
    return 0
  fi
  if ! have claude; then say "  claude is not installed, so Laya was not looked at."; return 0; fi
  if ! capture claude mcp list; then
    say "  Could not read  claude mcp list  (exit $C_RC), so Laya was not touched."
    return 0
  fi
  if printf '%s\n' "$C_OUT" | grep -Eq '^[[:space:]]*laya([: ]|$)'; then
    BR_LAYA=registered; say "  Laya is already registered with Claude Code."; return 0
  fi
  for d in "$HOME/Applications/laya-venv/bin" "$HOME/laya-venv/bin"; do
    if [ -x "$d/laya-mcp-server" ]; then lbin="$d/laya-mcp-server"; break; fi
  done
  if [ -z "$lbin" ]; then
    say "  No laya-venv on this Mac (integrations/laya/install.sh creates one), so laya_mcp stays 'not'."
    return 0
  fi
  if ask_yn laya "Register Laya with Claude Code for all projects (LAYA_DEVICE=cpu; BRAIN_ROUTER stays unset)?"; then
    if run_cmd claude mcp add -s user laya --env LAYA_DEVICE=cpu -- "$lbin"; then BR_LAYA=registered
    else br_problem "claude mcp add laya failed"; fi
  else
    say "  Left alone."
  fi
}

brain_maintenance_step() {
  local exists=0
  say ""
  say "  Step 5 — the brain-maintenance runner task (PROPOSED only; this script never adds a runner task):"
  if [ "$DRY_RUN" -eq 0 ] && have runnerctl; then
    runner_allowed list
    if capture runnerctl list && [ -n "$(task_line brain-maintenance "$C_OUT")" ]; then exists=1; fi
  fi
  if [ "$exists" -eq 1 ]; then
    BR_MAINT=exists; say "  It already exists in  runnerctl list  — nothing to propose."
    return 0
  fi
  say "    brain-maintenance   daily   6:00 AM      (0 6 * * *)    scripts/brain-sync.sh --quiet"
  say "                        weekly  Sun 3:30 PM  (30 15 * * 0)  bin/brain doctor ; bin/brain bench --write"
  say "                        it runs before the 4:00 PM review gate and also flags memory.md lines older than"
  say "                        90 days as proposals; it never edits memory.md itself. Full text: always-on/README.md"
  say "    To add it, tell Claude Code: \"add the brain-maintenance task as proposed in always-on/README.md\" — it asks you first."
  if [ "$DRY_RUN" -eq 0 ] && ! grep -q '30 15 \* \* 0' "$REPO_DIR/always-on/README.md" 2>/dev/null; then
    say "    (always-on/README.md no longer shows these times; check it before adding the task.)"
  fi
  add_hands "decide whether to add the brain-maintenance runner task (the proposal was printed in phase 7)"
}

phase_brain() {
  local vals
  heading 7 "$(phase_title 7)"
  BR_PROBLEMS=''; BR_SYNC=declined; BR_LINKED=0; BR_WOULD=0; BR_CONF=0
  BR_DOCTOR=''; BR_BENCH=''; BR_TOKENS=''; BR_REFUSALS=''; BR_LAYA=not; BR_MAINT=proposed
  brain_sync_step
  brain_checks_step
  brain_laya_step
  brain_maintenance_step
  if [ "$DRY_RUN" -eq 1 ]; then phase_done 7 ""; return 0; fi
  vals="doctor=${BR_DOCTOR:-FAIL} bench=${BR_BENCH:-unknown} tokens=${BR_TOKENS:-unknown}${BR_REFUSALS:+ refusals=$BR_REFUSALS} sync=$BR_SYNC"
  if [ "$BR_SYNC" = ran ]; then vals="$vals skills_linked=$BR_LINKED"; else vals="$vals would_link=$BR_WOULD"; fi
  vals="$vals conflicts=$BR_CONF laya_mcp=$BR_LAYA brain_maintenance=$BR_MAINT"
  if [ -n "$BR_PROBLEMS" ]; then phase_fail 7 "$BR_PROBLEMS" "$vals"; else phase_done 7 "$vals"; fi
}

# --------------------------------------------------------------------------- phase 8: graph
phase_graph() {
  heading 8 "$(phase_title 8)"
  say "  The graph needs a live task run and a judgement call, so it is a Claude Code job. In Claude Code,"
  say "  in this Repo folder, say:"
  say "    \"Run the ops-knowledge-graph task once (ask me first - it uses my allowance), watch its log, and"
  say "     report the node and edge counts, or why it ended with no work.\""
  phase_skip 8 "Claude Code job, not run by this script" "graph=not run"
}

# --------------------------------------------------------------------------- optional phases 10-12
# Opt-in (--also zoho|lofty|connections, or --only). They print guidance and create EMPTY key files with variable
# NAMES only. Steven types the values into those files himself; this script never asks for, reads out or prints one.
ensure_env_names() { # ensure_env_names <tool> <NAME...>
  local tool=$1 dir f n missing=''
  shift
  dir="$HOME/.config/$tool"; f="$dir/.env"
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  would run: create $(short "$f") (chmod 600) with these variable NAMES and no values: $*"
    return 0
  fi
  if [ ! -f "$f" ]; then
    if ( umask 077; mkdir -p "$dir"
         { printf '# %s - variable NAMES only. Type each value in yourself, save, and never paste one into a terminal, a prompt or a chat.\n' "$tool"
           for n in "$@"; do printf '%s=\n' "$n"; done; } >"$f" ) 2>/dev/null && chmod 600 "$f"; then
      say "  created $(short "$f") (mode 600) with empty names"
    else
      say "  could not create $(short "$f")"; return 1
    fi
  else
    chmod 600 "$f" 2>/dev/null || true
    say "  $(short "$f") already exists - left untouched (mode set to 600)"
  fi
  for n in "$@"; do
    grep -Eq "^[[:space:]]*$n=[^[:space:]]" "$f" 2>/dev/null || missing="${missing:+$missing }$n"
  done
  if [ -n "$missing" ]; then
    say "  still empty (names only): $missing"
    say "  Your hands: open $(short "$f") in a text editor, type each value after the = sign, save."
    add_hands "type the values for $missing into $(short "$f") yourself"
  else
    say "  every name has a value (not shown, not checked)."
  fi
  ENV_MISSING=$missing
}

phase_zoho() {
  local rc=0
  heading 10 "$(phase_title 10)"
  say "  Zoho (the mortgage CRM) is read through a GET-only harness. It needs these names in the file below."
  ENV_MISSING=''
  ensure_env_names zoho ZOHO_ACCOUNTS_URL ZOHO_API_URL ZOHO_CLIENT_ID ZOHO_CLIENT_SECRET ZOHO_REFRESH_TOKEN || rc=1
  say "  Where the values come from: the Zoho API console (self-client). Separately, Zoho CRM API Access must be"
  say "  switched on in Setup > Security Control > Profiles > Developer Permissions; that permission change is yours."
  add_hands "Zoho: enable 'Zoho CRM API Access' for your profile (Setup > Security Control > Profiles > Developer Permissions)"
  if [ "$rc" -ne 0 ]; then phase_fail 10 "could not create the key file"; return 0; fi
  phase_done 10 "zoho_env_names_empty=${ENV_MISSING:-none}"
}

phase_lofty() {
  local rc=0
  heading 11 "$(phase_title 11)"
  say "  Lofty is already connected (lofty-bridge and lofty-cli); this only makes sure the key file has its name."
  ENV_MISSING=''
  ensure_env_names lofty LOFTY_API_KEY || rc=1
  say "  The key comes from Lofty > Settings > Integrations > API. You type it into the file yourself."
  if [ "$rc" -ne 0 ]; then phase_fail 11 "could not create the key file"; return 0; fi
  phase_done 11 "lofty_env_names_empty=${ENV_MISSING:-none}"
}

phase_connections() {
  heading 12 "$(phase_title 12)"
  say "  Runs integrations/cli-anything-harnesses/connect.sh: installs anything missing, checks the safety posture,"
  say "  checks homes.com / ShowingTime / Showami / SkySlope / zipForms, and prints who still has to sign in."
  say "  It never signs in and never stores or prints a credential."
  if [ "$DRY_RUN" -eq 0 ] && ! ask_yn connections "Run the connections check now?"; then
    phase_skip 12 "declined"
    return 0
  fi
  if [ "$DRY_RUN" -eq 1 ]; then ask_yn connections "Run the connections check now?" || true; fi
  if run_cmd bash "$INTEG_DIR/cli-anything-harnesses/connect.sh"; then
    add_hands "the sign-ins and approvals connect.sh listed (homes.com, ShowingTime, Showami by hand; ECC date for SkySlope/zipForms)"
    phase_done 12 "connect_sh=ran"
  else
    phase_fail 12 "connect.sh exited $R_RC (see the lines above)"
  fi
}

# --------------------------------------------------------------------------- phase 9: report
build_report() {
  local i=0 st nt vl s done_n=0 skip_n=0 fail_n=0 plan_n=0 hands
  printf '=== MAC COMBINED REPORT %s ===\n' "$TODAY"
  if [ "$DRY_RUN" -eq 1 ]; then printf 'mode: DRY RUN - nothing was run or written | bootstrap %s\n' "$BOOTSTRAP_VERSION"
  else printf 'mode: real run | bootstrap %s\n' "$BOOTSTRAP_VERSION"; fi
  while [ "$i" -le 12 ]; do
    st=${PH_STATUS[$i]}; nt=${PH_NOTE[$i]}; vl=${PH_VALS[$i]}
    case "$st" in
      "done") done_n=$((done_n + 1)); s="done" ;;
      planned) plan_n=$((plan_n + 1)); s=planned ;;
      skipped) skip_n=$((skip_n + 1)); s="skipped($(clean "${nt:-no reason given}"))" ;;
      failed) fail_n=$((fail_n + 1)); s="failed($(clean "${nt:-no reason given}"))" ;;
      *) s=$st ;;
    esac
    printf 'phase %s %s: %s' "$i" "$(phase_name "$i")" "$s"
    if [ -n "$vl" ]; then printf ' | %s' "$(clean "$vl")"; fi
    printf '\n'
    i=$((i + 1))
  done
  printf 'result: done=%s skipped=%s failed=%s planned=%s\n' "$done_n" "$skip_n" "$fail_n" "$plan_n"
  printf 'api-anything sites: fred=not run freddie=not run (Claude Code job: integrations/api-anything/mac-connect-sites-2026-10-09.md, Group 1)\n'
  printf 'isa-kpi: not run (Claude Code job: ./mac-bootstrap.sh --with-claude, or integrations/mac-fix-isa-kpi-2026-10-08.md)\n'
  hands=$(join_hands)
  printf "left for Steven's hands: %s\n" "$(clean "${hands:-none}")"
  printf '=== END MAC COMBINED REPORT ===\n'
}

phase_report() {
  local block file n=1
  heading 9 "$(phase_title 9)"
  phase_set 9 "done" "" ""
  if [ "$DRY_RUN" -eq 1 ]; then
    PH_STATUS[9]=planned
  else
    file="$LOG_DIR/bootstrap-$TODAY.txt"
    while [ -e "$file" ]; do n=$((n + 1)); file="$LOG_DIR/bootstrap-$TODAY-$n.txt"; done
    PH_VALS[9]="file=$(short "$file")"
  fi
  block=$(build_report | redact)
  say ""
  printf '%s\n' "$block"
  log_line "REPORT printed"
  if [ "$DRY_RUN" -eq 1 ]; then
    say ""
    say "  Dry run: nothing was run, and no report file was written."
    return 0
  fi
  if mkdir -p "$LOG_DIR" 2>/dev/null && ( umask 077; printf '%s\n' "$block" >"$file" ) 2>/dev/null; then
    say ""
    say "  Saved a copy: $(short "$file")"
    say "  To report back: copy everything from  === MAC COMBINED REPORT  down to  === END MAC COMBINED REPORT ===  and paste it into the cloud session."
  else
    PH_STATUS[9]=failed; PH_NOTE[9]="could not save the report file"
    say ""
    say "  WARNING: could not save $(short "$file"). Copy the block above from your screen instead."
  fi
}

# --------------------------------------------------------------------------- --with-claude
ISA_DOC_REL='integrations/mac-fix-isa-kpi-2026-10-08.md'
extract_paste_block() { # extract_paste_block <file> -> the text strictly between the PASTE FROM / PASTE TO lines
  awk '/^---- PASTE FROM HERE ----$/ { f = 1; next } /^---- PASTE TO HERE ----$/ { f = 0 } f' "$1"
}
offer_isa_kpi() {
  local doc="$REPO_DIR/$ISA_DOC_REL" from to tmp
  say ""
  say "==== Extra — the ISA-KPI job (--with-claude)"
  say "  That part needs judgement and live task prompts, so it stays a Claude Code job. Claude Code would start in"
  say "  this Repo folder with the paste block from $ISA_DOC_REL as its first message."
  say "  It asks you before changing any live task prompt or tool permission, and never touches a client system."
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  would run: claude <the text between the PASTE FROM / PASTE TO lines of $ISA_DOC_REL>   (started in $(short "$REPO_DIR"))"
    return 0
  fi
  if [ ! -f "$doc" ]; then say "  Cannot find $ISA_DOC_REL, so nothing was started."; return 1; fi
  from=$(grep -c '^---- PASTE FROM HERE ----$' "$doc" || true)
  to=$(grep -c '^---- PASTE TO HERE ----$' "$doc" || true)
  if [ "$from" != 1 ] || [ "$to" != 1 ]; then
    say "  $ISA_DOC_REL does not have exactly one PASTE FROM and one PASTE TO line, so nothing was started."; return 1
  fi
  tmp="$TMP_DIR/isa-kpi-prompt.txt"
  extract_paste_block "$doc" >"$tmp"
  if ! grep -q '=== MAC ISA-KPI REPORT ===' "$tmp"; then
    say "  The paste block in $ISA_DOC_REL has no report block, so nothing was started."; return 1
  fi
  if [ "${PH_STATUS[2]}" != "done" ]; then
    say "  Note: phase 2 did not finish, so section A of that job will stop at its first check (the --v2 one)."
  fi
  if ! ask_yn claude "Start Claude Code now with those instructions as its first message?"; then
    say "  Not started. Whenever you want it:  ./mac-bootstrap.sh --with-claude   (or paste the block from $ISA_DOC_REL)"
    return 0
  fi
  if ! have claude; then say "  claude is not installed, so nothing was started."; return 1; fi
  guard_refused "claude <the ISA-KPI paste block from $ISA_DOC_REL>"
  say "  Starting Claude Code in $(short "$REPO_DIR") — type /exit when you are done and you are back here."
  log_line "RUN claude <the ISA-KPI paste block>"
  ( cd "$REPO_DIR" && claude "$(cat "$tmp")" ) || true
  say "  Back in the bootstrap. Paste the === MAC ISA-KPI REPORT === block from that session back with the combined report."
}

# --------------------------------------------------------------------------- startup
harness_open() { [ "${BOOTSTRAP_TEST_HARNESS:-0}" = 1 ] && [ -f "$REPO_DIR/.bootstrap-test-root" ]; }

resolve_self_dir() {
  local src=${BASH_SOURCE[0]:-$0} dir
  while [ -L "$src" ]; do
    dir=$(cd -P "$(dirname "$src")" && pwd)
    src=$(readlink "$src")
    case "$src" in /*) ;; *) src="$dir/$src" ;; esac
  done
  cd -P "$(dirname "$src")" && pwd
}

add_phase_arg() { # add_phase_arg only|skip <comma- or space-separated names or numbers>
  local kind=$1 raw=${2//,/ } tok n seen=0
  for tok in $raw; do
    seen=1
    if n=$(phase_num "$tok"); then
      case "$kind" in only) ONLY="$ONLY $n" ;; also) ALSO="$ALSO $n" ;; *) SKIP="$SKIP $n" ;; esac
    elif [ -n "$(refused_reason "$tok")" ]; then
      printf 'REFUSED: %s — %s\n' "$tok" "$(refused_reason "$tok")" >&2
      printf 'This script will not touch it. Nothing was done.\n' >&2
      exit 2
    else
      die_usage "unknown phase: $tok (see --list)"
    fi
  done
  if [ "$seen" -eq 0 ]; then die_usage "--$kind needs a phase name (see --list)"; fi
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --dry-run) DRY_RUN=1 ;;
      --only)   shift; [ $# -gt 0 ] || die_usage "--only needs a phase name"; add_phase_arg only "$1" ;;
      --only=*) add_phase_arg only "${1#--only=}" ;;
      --skip)   shift; [ $# -gt 0 ] || die_usage "--skip needs a phase name"; add_phase_arg skip "$1" ;;
      --skip=*) add_phase_arg skip "${1#--skip=}" ;;
      --with-claude) WITH_CLAUDE=1 ;;
      --yes-runner) YES_RUNNER=1 ;;
      --yes-opus) YES_OPUS=1 ;;
      --yes-tools) YES_TOOLS=1 ;;
      --yes-whatsapp) YES_WHATSAPP=1 ;;
      --yes-brain) YES_BRAIN=1 ;;
      --yes-laya) YES_LAYA=1 ;;
      --yes-claude) YES_CLAUDE=1 ;;
      --yes-connections) YES_CONNECTIONS=1 ;;
      --also)   shift; [ $# -gt 0 ] || die_usage "--also needs zoho, lofty or connections"; add_phase_arg also "$1" ;;
      --also=*) add_phase_arg also "${1#--also=}" ;;
      --yes|--yes-*) die_usage "There is no blanket --yes, and no '$1'. Pre-answer one question at a time: --yes-runner --yes-opus --yes-tools --yes-whatsapp --yes-brain --yes-laya --yes-claude" ;;
      --list) LIST=1 ;;
      -h|--help) usage; exit 0 ;;
      *) printf 'unknown argument: %s\n\n' "$1" >&2; usage >&2; exit 2 ;;
    esac
    shift
  done
}

cleanup() { if [ -n "${TMP_DIR:-}" ] && [ -d "$TMP_DIR" ]; then rm -rf "$TMP_DIR"; fi; return 0; }
on_interrupt() { printf '\n'; say "Stopped (Ctrl-C). Nothing further was run. Every phase is safe to repeat; run this again any time."; exit 130; }

startup() {
  REPO_DIR=$(resolve_self_dir)
  if [ ! -f "$REPO_DIR/CLAUDE.md" ] || [ ! -f "$REPO_DIR/MAC-SETUP.sh" ] || [ ! -e "$REPO_DIR/.git" ]; then
    printf 'This script has to live inside your Repo folder (next to MAC-SETUP.sh), but it is in:\n  %s\n' "$REPO_DIR" >&2
    printf 'Fix: cd into your Repo folder and run  ./mac-bootstrap.sh  from there.\n' >&2
    exit 1
  fi
  INTEG_DIR="$REPO_DIR/integrations"
  if [ -n "${BOOTSTRAP_INTEGRATIONS_DIR:-}" ]; then
    if harness_open; then INTEG_DIR=$BOOTSTRAP_INTEGRATIONS_DIR
    else printf 'note: BOOTSTRAP_INTEGRATIONS_DIR is for the test harness only; ignored.\n' >&2; fi
  fi
  if [ "$(uname -s)" != Darwin ]; then
    if [ "${BOOTSTRAP_ALLOW_NON_MAC:-0}" = 1 ] && { [ "$DRY_RUN" -eq 1 ] || harness_open; }; then
      NON_MAC=1
    elif [ "${BOOTSTRAP_ALLOW_NON_MAC:-0}" = 1 ]; then
      printf 'BOOTSTRAP_ALLOW_NON_MAC=1 is honoured only together with --dry-run (or the test harness). Refusing.\n' >&2
      exit 1
    else
      printf 'This is for the Mac (uname says %s). To preview the plan anywhere:\n' "$(uname -s)" >&2
      printf '  BOOTSTRAP_ALLOW_NON_MAC=1 ./mac-bootstrap.sh --dry-run\n' >&2
      exit 1
    fi
  fi
  cd "$REPO_DIR"
  if [ "$DRY_RUN" -eq 0 ]; then
    TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/mac-bootstrap.XXXXXX") || { printf 'cannot create a temporary folder\n' >&2; exit 1; }
    if ( umask 077; mkdir -p "$LOG_DIR" && : >>"$LOG_FILE" ) 2>/dev/null; then LOG_READY=1
    else printf 'note: cannot write %s, so this run will not keep a log.\n' "$LOG_DIR" >&2; fi
  fi
}

banner() {
  say "Mac bootstrap — $TODAY — version $BOOTSTRAP_VERSION"
  if [ "$DRY_RUN" -eq 1 ]; then
    say "DRY RUN: every command is printed, nothing is run, nothing is written (not even the log)."
  else
    say "Real run. It asks before every consequential change, and Enter always means no."
    say "Ctrl-C stops it at any point; every phase is safe to repeat."
    say "log: $(short "$LOG_FILE")"
  fi
  say "repo: $(short "$REPO_DIR")"
  log_line "START version=$BOOTSTRAP_VERSION only='${ONLY# }' skip='${SKIP# }' with_claude=$WITH_CLAUDE"
}

run_phase() { # run_phase <n>
  local n=$1 why
  if ! should_run "$n"; then
    if in_list "$n" "$SKIP"; then why="skipped by --skip"; else why="not selected by --only"; fi
    say ""
    if [ "$n" -ge 10 ]; then why="optional, not selected (add --also $(phase_name "$n"))"; say "==== optional — $(phase_title "$n"): $why"
    else say "==== $n of 9 — $(phase_title "$n"): $why"; fi
    phase_set "$n" skipped "$why" ""
    return 0
  fi
  case "$n" in
    0) phase_preflight ;; 1) phase_pull ;; 2) phase_harnesses ;; 3) phase_runner ;; 4) phase_opus ;;
    5) phase_tools ;; 6) phase_whatsapp ;; 7) phase_brain ;; 8) phase_graph ;; 9) phase_report ;;
    10) phase_zoho ;; 11) phase_lofty ;; 12) phase_connections ;;
  esac
  if [ "${PH_STATUS[$n]}" = notrun ]; then phase_fail "$n" "internal error: the phase ended without recording a result"; fi
}

needs_steven_box() {
  local line
  [ -n "$HANDS" ] || return 0
  say ""
  say "NEEDS STEVEN (your hands; this script does none of it):"
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    say "  - $line"
  done <<EOF
$HANDS
EOF
}

main() {
  local n failed=0
  parse_args "$@"
  if [ "$LIST" -eq 1 ]; then list_phases; exit 0; fi
  startup
  trap cleanup EXIT
  trap on_interrupt INT TERM
  banner
  for n in 0 1 2 3 4 5 6 7 8 10 11 12 9; do run_phase "$n"; done
  if [ "$WITH_CLAUDE" -eq 1 ]; then offer_isa_kpi || true; fi
  needs_steven_box
  for n in 0 1 2 3 4 5 6 7 8 9 10 11 12; do
    if [ "${PH_STATUS[$n]}" = failed ]; then failed=$((failed + 1)); fi
  done
  say ""
  if [ "$failed" -gt 0 ]; then say "Finished with $failed failed phase(s); see the report above."; return 1; fi
  say "Finished: no phase failed."
  return 0
}

# Sourcing for the tests (BOOTSTRAP_SOURCE_ONLY=1) defines everything and runs nothing.
if [ "${BOOTSTRAP_SOURCE_ONLY:-0}" = 1 ] && [ "${BASH_SOURCE[0]}" != "$0" ]; then
  return 0
fi
main "$@"; exit "$?"
