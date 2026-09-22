#!/usr/bin/env bash
# mac-verify.sh — read-only health check for everything MAC-SETUP.sh installs. Safe to run any time.
#
#   ./mac-verify.sh          # per-item report; exit 0 only if everything required is healthy
#   ./mac-verify.sh --quiet  # the summary and the failures only
#
# It writes nothing: it creates, edits, chmods or deletes no file, touches no task, starts no service.
# Every command it runs is a version query, a listing or a status read. Two of those commands keep
# their own caches under $HOME and refresh them as a side effect — `uv python find` (uv's
# interpreter cache) and `claude mcp list` (~/.claude.json, ~/.claude/). Nothing of its own is written.
# It never prints the value of a key — only whether the NAME has one.
# Written for macOS /bin/bash 3.2. Companion to MAC-SETUP.sh and MAC-INSTALL.md §9.
# Author: M3 (Build/Release) 2026-09-22. Not executed on a Mac by its author — see the report.

set -uo pipefail

QUIET=0
for a in "$@"; do
  case "$a" in
    --quiet|-q) QUIET=1 ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) printf 'unknown argument: %s\n' "$a" >&2; exit 2 ;;
  esac
done

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BINDIR="$HOME/.local/bin"
SCRAPERS_PY="$HOME/Applications/scrapers/.venv/bin/python"
WA_BIN="$HOME/Applications/whatsapp-cli/.venv/bin/whatsapp-cli"
CA_BROWSER="$HOME/Applications/CLI-Anything/.venv/bin/cli-anything-browser"
N_OK=0; N_FAIL=0; N_NEED=0; N_INFO=0
FAILS=''; NEEDS=''

ok()   { N_OK=$((N_OK+1));     [ "$QUIET" -eq 1 ] || printf '  ok    %-26s %s\n' "$1" "${2:-}"; }
bad()  { N_FAIL=$((N_FAIL+1)); printf '  FAIL  %-26s %s\n' "$1" "${2:-}"; FAILS="$FAILS
  $1 — ${2:-}"; }
need() { N_NEED=$((N_NEED+1)); printf '  NEED  %-26s %s\n' "$1" "${2:-}"; NEEDS="$NEEDS
  $1 — ${2:-}"; }
info() { N_INFO=$((N_INFO+1)); [ "$QUIET" -eq 1 ] || printf '  --    %-26s %s\n' "$1" "${2:-}"; }
sect() { [ "$QUIET" -eq 1 ] || printf '\n== %s\n' "$*"; }

have() { command -v "$1" >/dev/null 2>&1; }
NPM_ROOT=$(npm root -g 2>/dev/null || true)
ver()  { "$@" 2>/dev/null | head -1 | tr -d '\r'; }
# GNU stat first and validated: on Linux `stat -f` means "file SYSTEM status" and succeeds with the
# wrong output, so the usual BSD-first fallback silently prints a filesystem report as a file mode.
filemode() {
  _m=$(stat -c '%a' "$1" 2>/dev/null || true)
  case "${_m:-x}" in ''|*[!0-7]*) _m='' ;; esac
  if [ -z "$_m" ]; then
    _m=$(stat -f '%OLp' "$1" 2>/dev/null || true)          # macOS / BSD
    case "${_m:-x}" in ''|*[!0-7]*) _m='?' ;; esac
  fi
  printf '%s' "$_m"
}

# check_cmd <label> <command> <version args...>
# on PATH -> ok with its version; installed but unreachable -> NEED (a PATH problem, not a broken
# install); nowhere -> FAIL.
check_cmd() {
  _label=$1; _cmd=$2; shift 2
  _p=$(command -v "$_cmd" 2>/dev/null || true)
  if [ -n "$_p" ]; then ok "$_label" "$("$_p" "$@" 2>/dev/null | head -1 | tr -d '\r')"; return; fi
  if [ -x "$BINDIR/$_cmd" ]; then
    need "$_label" "installed at $BINDIR/$_cmd but $BINDIR is not on PATH"; return
  fi
  # a directory test, not `npm ls` — a failing `npm ls` writes a debug log into ~/.npm
  if [ -n "${NPM_ROOT:-}" ] && [ -d "$NPM_ROOT/$_cmd" ]; then
    need "$_label" "npm has it at $NPM_ROOT/$_cmd but npm's global bin is not on PATH"; return
  fi
  bad "$_label" "not installed"
}

printf 'mac-verify.sh — %s — host %s — repo %s\n' "$(date +%Y-%m-%dT%H:%M:%S%z)" "$(uname -s)" "$REPO_DIR"
[ "$(uname -s)" = "Darwin" ] || info "platform" "not macOS — the launchd, permission and WhatsApp checks cannot mean anything here"
printf '  --    %-26s %s\n' "bash running this" "${BASH_VERSION:-unknown}"

# --------------------------------------------------------------------------- prerequisites
sect "prerequisites"
check_cmd "homebrew" brew --version
check_cmd "uv" uv --version
check_cmd "node" node --version
check_cmd "npm" npm --version
if have pipx; then ok "pipx" "$(ver pipx --version)"; else need "pipx" "missing — graphify was installed with it"; fi
for m in 3.12 3.13; do
  if have uv && uv python find "$m" >/dev/null 2>&1; then ok "CPython $m" "available to uv"
  else need "CPython $m" "uv cannot find it — the version gates depend on it"; fi
done
case ":${PATH}:" in
  *":$BINDIR:"*) ok "PATH" "$BINDIR is on PATH" ;;
  *) need "PATH" "$BINDIR is not on PATH — whatsapp-cli, claude-auto and pipx tools will not resolve" ;;
esac

# --------------------------------------------------------------------------- the brain's own files
sect "vendored skills (they ship with the repo — nothing to install)"
missing=''
for s in code-review-and-quality git-workflow-and-versioning source-driven-development \
         documentation-and-adrs security-and-hardening debugging-and-error-recovery \
         find-skills apple-design karpathy-coding-principles; do
  [ -f "$REPO_DIR/.claude/skills/$s/SKILL.md" ] || missing="$missing $s"
done
if [ -z "$missing" ]; then ok "vendored skills" "all nine present"; else bad "vendored skills" "missing:$missing"; fi

# --------------------------------------------------------------------------- FR5a tools
sect "FR5a tooling"
check_cmd "codeburn" codeburn --version
check_cmd "graphify" graphify --version
check_cmd "headroom" headroom --version
if have strix; then ok "strix (optional)" "$(ver strix --version)"; else info "strix (optional)" "not installed — FR5a: only on a named need"; fi

# --------------------------------------------------------------------------- FR5b tools
sect "FR5b comms & data"
if [ -x "$WA_BIN" ]; then
  wv=$("$WA_BIN" --version 2>/dev/null | head -1)
  [ -n "$wv" ] || wv="present (no --version; 'whatsapp-cli --help' is the check)"
  ok "whatsapp-cli" "$wv"
  pyv=$("$HOME/Applications/whatsapp-cli/.venv/bin/python" -c 'import sys;print("%d.%d"%sys.version_info[:2])' 2>/dev/null)
  case "${pyv:-0.0}" in
    3.1[2-9]|3.[2-9]*) ok "whatsapp-cli python" "$pyv" ;;
    *) bad "whatsapp-cli python" "venv is on ${pyv:-unknown} — the code is a SyntaxError below 3.12" ;;
  esac
else bad "whatsapp-cli" "not built at $WA_BIN"; fi

check_cmd "omniroute" omniroute --version
for f in claude-auto probe.sh; do
  if [ -x "$BINDIR/$f" ]; then
    src="$REPO_DIR/integrations/omniroute-failover/${f%.sh}.sh"
    [ "$f" = "probe.sh" ] && src="$REPO_DIR/integrations/omniroute-failover/probe.sh"
    if [ -f "$src" ] && cmp -s "$src" "$BINDIR/$f"; then ok "$f" "matches the repo copy"
    else ok "$f" "installed (differs from the repo copy — diff it before trusting it)"; fi
  else bad "$f" "not in $BINDIR"; fi
done
if [ -r "$HOME/.config/omniroute/state/mode" ]; then
  ok "omniroute route mode" "$(cat "$HOME/.config/omniroute/state/mode" 2>/dev/null)"
else info "omniroute route mode" "no state/mode yet — claude-auto has not run"; fi

if [ -x "$SCRAPERS_PY" ]; then
  if "$SCRAPERS_PY" -c 'from scrapling.fetchers import Fetcher' >/dev/null 2>&1; then
    ok "scrapling" "$("$SCRAPERS_PY" -c 'import scrapling;print(scrapling.__version__)' 2>/dev/null) — Fetcher imports"
  elif "$SCRAPERS_PY" -c 'import scrapling' >/dev/null 2>&1; then
    bad "scrapling" "installed without the [fetchers] extra — Fetcher will not import (curl_cffi missing)"
  else bad "scrapling" "not installed in the scrapers venv"; fi
  sg=$("$SCRAPERS_PY" -c 'import importlib.metadata as m;print(m.version("scrapegraphai"))' 2>/dev/null)
  case "${sg:-none}" in
    1.*) bad "scrapegraphai" "$sg is the import-broken build served to Python 3.11 — rebuild the venv on 3.12" ;;
    none|'') bad "scrapegraphai" "not installed in the scrapers venv" ;;
    *) ok "scrapegraphai" "$sg" ;;
  esac
  spy=$("$SCRAPERS_PY" -c 'import sys;print("%d.%d"%sys.version_info[:2])' 2>/dev/null)
  case "${spy:-0.0}" in
    3.1[2-9]|3.[2-9]*) ok "scrapers venv python" "$spy" ;;
    *) bad "scrapers venv python" "${spy:-unknown} — scrapegraphai needs >= 3.12" ;;
  esac
else bad "scrapers venv" "missing at $SCRAPERS_PY"; fi

# CLI-Anything: MAC-SETUP.sh installs three separate halves (hub, Claude plugin, browser harness)
# and nothing here checked any of them until the V1 reconciliation (2026-09-22).
if have cli-hub; then
  ok "cli-hub" "$(ver cli-hub --version)"
  case "${CLI_HUB_NO_ANALYTICS:-}" in
    1|true|TRUE|yes) ok "  cli-hub telemetry" "CLI_HUB_NO_ANALYTICS is set in this shell" ;;
    *) need "  cli-hub telemetry" "CLI_HUB_NO_ANALYTICS is NOT set here — its analytics are opt-OUT and report this machine's hostname (F-S1-05). Put it in your shell profile AND the runner task env" ;;
  esac
else info "cli-hub" "not installed — MAC-SETUP.sh --only cli-anything"; fi
if [ -x "$CA_BROWSER" ]; then ok "cli-anything-browser" "built"
else info "cli-anything-browser" "not built at $CA_BROWSER (DOMShell harness — every web target runs on it)"; fi
if have claude; then
  if claude plugin list 2>/dev/null | grep -q 'cli-anything'; then ok "  cli-anything plugin" "installed"
  else info "  cli-anything plugin" "not installed — MAC-SETUP.sh --only cli-anything installs it non-interactively"; fi
fi

# --------------------------------------------------------------------------- credentials (names only)
sect "key files — names only, never a value"
check_env_file() { # check_env_file <tool> <NAME>...
  _tool=$1; shift
  _f="$HOME/.config/$_tool/.env"
  if [ ! -f "$_f" ]; then need "$_tool/.env" "missing — run MAC-SETUP.sh --only $_tool to create the skeleton"; return; fi
  _m=$(filemode "$_f")
  if [ "$_m" = "600" ]; then ok "$_tool/.env" "mode 600"
  else bad "$_tool/.env" "mode $_m — must be 600 (chmod 600 '$_f')"; fi
  for _n in "$@"; do
    if grep -q "^[[:space:]]*${_n}=[^[:space:]]" "$_f" 2>/dev/null; then ok "  $_n" "set"
    else need "  $_n" "no value yet"; fi
  done
}
check_env_file omniroute OMNIROUTE_API_KEY OPENROUTER_API_KEY NVIDIA_API_KEY BYTEZ_API_KEY
# Lofty: F-S1-11 — the bridge and the CLI are installed, the REST API is the right path, and the
# empty LOFTY_API_KEY is the only reason no pull has ever succeeded. Checked here since 2026-09-22.
check_env_file lofty LOFTY_API_KEY
if have strix; then check_env_file strix STRIX_LLM LLM_API_KEY; fi
if [ -f "$HOME/.config/cli-anything/.env" ]; then check_env_file cli-anything HOMES_USER SHOWINGTIME_USER SHOWAMI_USER; fi
if [ -f "$HOME/.config/higgsfield/.env" ]; then check_env_file higgsfield HF_API_KEY_ID HF_API_KEY_SECRET; fi

# --------------------------------------------------------------------------- MCP servers
sect "MCP servers (read-only listing)"
if have claude; then
  mcp=$(claude mcp list 2>&1)
  if [ -n "$mcp" ]; then
    n=$(printf '%s\n' "$mcp" | grep -c .)
    ok "claude mcp list" "$n line(s) returned"
    [ "$QUIET" -eq 1 ] || printf '%s\n' "$mcp" | sed 's/^/        /'
    if printf '%s' "$mcp" | grep -qi 'agent402'; then
      bad "MCP agent402" "REGISTERED — it is on the refused list (pay-per-call wallet). Remove it: claude mcp remove agent402"
    fi
  else bad "claude mcp list" "returned nothing"; fi
else need "claude CLI" "not on PATH — cannot list MCP servers"; fi

# --------------------------------------------------------------------------- scheduled work
sect "scheduled tasks and agents (read-only)"
if have launchctl; then
  la=$(launchctl list 2>/dev/null | grep 'com\.stevenshearrill' || true)
  if [ -n "$la" ]; then
    ok "launchd agents" "$(printf '%s\n' "$la" | grep -c .) found (columns: PID, last exit status, label)"
    [ "$QUIET" -eq 1 ] || printf '%s\n' "$la" | sed 's/^/        /'
    # heredoc, not a pipe: the counters must survive (a pipeline would run this in a subshell)
    while read -r _pid _rc _label; do
      [ -n "${_label:-}" ] || continue
      case "${_rc:-0}" in
        0|-) ok "${_label}" "last exit status ${_rc}" ;;
        *)   bad "${_label}" "last exit status ${_rc} — that agent's last run failed" ;;
      esac
    done <<EOF
$la
EOF
  else need "launchd agents" "no com.stevenshearrill agents loaded"; fi
  if printf '%s' "$la" | grep -q 'omniroute-probe'; then ok "omniroute probe agent" "loaded"
  else need "omniroute probe agent" "com.stevenshearrill.omniroute-probe not loaded — the route cannot switch back on its own"; fi
else info "launchctl" "not present — not a Mac"; fi

if have runnerctl; then
  rs=$(runnerctl status 2>&1 | head -40)
  ok "runnerctl status" "read"
  [ "$QUIET" -eq 1 ] || printf '%s\n' "$rs" | sed 's/^/        /'
  rl=$(runnerctl list 2>/dev/null | grep -iE 'whatsapp|omniroute|incentives' || true)
  if [ -n "$rl" ]; then [ "$QUIET" -eq 1 ] || printf '%s\n' "$rl" | sed 's/^/        /'; fi
  if runnerctl list 2>/dev/null | grep -qi 'vanessa-whatsapp-inbox'; then ok "vanessa-whatsapp-inbox" "registered with the runner"
  else need "vanessa-whatsapp-inbox" "not registered — create it DISABLED and run it once by hand (mac-task-specs.md §5)"; fi
else need "runnerctl" "not on PATH — cannot report task last-run or status"; fi

# --------------------------------------------------------------------------- refused items must be absent
sect "refused items must be absent"
refused_absent() { # refused_absent <label> <test-expression result already computed>
  if [ "$2" = "present" ]; then bad "$1" "PRESENT — it is on the refused list; see MAC-SETUP.sh"; else ok "$1" "absent"; fi
}
p=absent; { have vphone || have vphone-cli; } && p=present;           refused_absent "vphone-cli" "$p"
p=absent; have whatscli && p=present;                                 refused_absent "whatscli" "$p"
p=absent
for d in "$HOME/Applications/media-inference-worker" "$HOME/media-inference-worker" "$HOME/Projects/media-inference-worker"; do
  [ -d "$d" ] && p=present
done;                                                                 refused_absent "media-inference-worker clone" "$p"
p=absent
if have claude; then
  claude plugin list 2>/dev/null | grep -qi 'agent-skills' && p=present
fi;                                                                   refused_absent "addyosmani agent-skills plugin" "$p"

# --------------------------------------------------------------------------- summary
printf '\n================ summary ================\n'
printf 'ok %s   FAIL %s   NEEDS-STEVEN %s   info %s\n' "$N_OK" "$N_FAIL" "$N_NEED" "$N_INFO"
if [ -n "$(printf '%s' "$FAILS" | tr -d ' \n')" ]; then
  printf '\nFAILED:%s\n' "$FAILS"
fi
if [ -n "$(printf '%s' "$NEEDS" | tr -d ' \n')" ]; then
  printf '\nNEEDS STEVEN (not broken — not set up yet):%s\n' "$NEEDS"
fi
if [ "$N_FAIL" -eq 0 ] && [ "$N_NEED" -eq 0 ]; then
  printf '\nEverything required is healthy.\n'; exit 0
fi
printf '\nNot healthy yet: %s failed, %s waiting on Steven. Nothing was changed by this check.\n' "$N_FAIL" "$N_NEED"
exit 1
