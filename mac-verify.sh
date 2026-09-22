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
# Anything this script echoes from another tool's output passes through here first, so a key that a tool
# prints in its own listing (an MCP server's command line, say) never reaches the report. Same shapes as
# the failover scripts' redact(): NAME=value, name: value, "name":"value", Bearer/sk- tokens, long opaque runs.
redact_line() {
  sed -E \
    -e 's/([A-Za-z0-9_.-]*([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][A-Za-z]*|[Aa][Uu][Tt][Hh][A-Za-z]*|[Cc][Rr][Ee][Dd][A-Za-z]*)[A-Za-z0-9_.-]*["'"'"']?[[:space:]]*[=:][[:space:]]*["'"'"']?)(([Bb][Ee][Aa][Rr][Ee][Rr]|[Bb][Aa][Ss][Ii][Cc]|[Tt][Oo][Kk][Ee][Nn])[[:space:]]+)?[^[:space:]"'"'"',;}]+/\1[REDACTED]/g' \
    -e 's/(([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][Ww]?[Oo]?[Rr]?[Dd]?)[-_[:space:]]+)[A-Za-z0-9._-]{8,}/\1[REDACTED]/g' \
    -e 's/(sk-(ant-)?|[Bb][Ee][Aa][Rr][Ee][Rr][[:space:]]+|ghp_|xox[a-z]-)[A-Za-z0-9._-]{6,}/\1[REDACTED]/g' \
    -e 's/[A-Za-z0-9+\/_=.-]{32,}/[REDACTED-LONG]/g'
}
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
  if [ -n "$_p" ]; then
    # F-V2-27: a binary that is on PATH but cannot run is broken, not healthy — the exit status and the
    # output are both tested, instead of printing whatever (possibly nothing) came out.
    _out=$("$_p" "$@" 2>/dev/null); _rc=$?
    _out=$(printf '%s\n' "$_out" | head -1 | tr -d '\r')
    if [ "$_rc" -ne 0 ]; then bad "$_label" "on PATH at $_p but '$_cmd $*' exited $_rc"
    elif [ -z "$_out" ]; then bad "$_label" "on PATH at $_p but '$_cmd $*' printed nothing"
    else ok "$_label" "$_out"; fi
    return
  fi
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
# F-V2-24: a file being there is not a skill loading. For each one: the frontmatter (the block between the
# two --- fences) must parse, its name must equal the directory name, its description must be non-empty, and
# every relative ](link) in the body must resolve. Nine local files, no network.
for s in code-review-and-quality git-workflow-and-versioning source-driven-development \
         documentation-and-adrs security-and-hardening debugging-and-error-recovery \
         find-skills apple-design karpathy-coding-principles; do
  f="$REPO_DIR/.claude/skills/$s/SKILL.md"
  if [ ! -f "$f" ]; then bad "skill $s" "SKILL.md missing"; continue; fi
  fm=$(awk 'NR==1{if($0!="---"){nofm=1; exit 2}; next} /^---[[:space:]]*$/{found=1; exit 0} {print} END{if(!found && !nofm) exit 3}' "$f"); fm_rc=$?
  if [ "$fm_rc" -ne 0 ]; then bad "skill $s" "frontmatter fences missing or unterminated (a session cannot load it)"; continue; fi
  name=$(printf '%s\n' "$fm" | sed -n 's/^name:[[:space:]]*//p' | head -1 | sed -e "s/^[\"']//" -e "s/[\"']*[[:space:]]*$//")
  desc=$(printf '%s\n' "$fm" | sed -n 's/^description:[[:space:]]*//p' | head -1 | sed -e 's/[[:space:]]*$//')
  case "$desc" in '>'|'|'|'>-'|'|-'|'>+'|'|+')   # block scalar: the text is on the indented lines that follow
    desc=$(printf '%s\n' "$fm" | sed -n '/^description:/,/^[^[:space:]]/p' | sed -n '2,$p' | grep -E '^[[:space:]]+[^[:space:]]' | head -1) ;;
  esac
  desc=$(printf '%s' "$desc" | sed -e "s/^[[:space:]]*[\"']*//" -e "s/[\"']*[[:space:]]*$//")
  if [ "$name" != "$s" ]; then bad "skill $s" "frontmatter name '${name:-<none>}' is not the directory name — the loader rejects it"; continue; fi
  if [ -z "$desc" ]; then bad "skill $s" "frontmatter description is empty — the loader rejects it"; continue; fi
  dead=''
  while IFS= read -r l; do
    [ -n "$l" ] || continue
    [ -e "$REPO_DIR/.claude/skills/$s/$l" ] || dead="$dead $l"
  done <<EOF
$(grep -oE '\]\([^)]+\)' "$f" | sed -e 's/^](//' -e 's/)$//' | grep -vE '^(https?:|mailto:|#|/)' | sed 's/#.*//' | sort -u)
EOF
  if [ -n "$dead" ]; then bad "skill $s" "dead relative link(s):$dead"
  else ok "skill $s" "loads: name matches, description $(printf '%s' "$desc" | wc -c | tr -d ' ') chars, links resolve"; fi
done

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
    elif [ -f "$src" ]; then
      # F-V2-25: the installed launcher IS the PII gate. A copy that differs from the repo is unverified,
      # and unverified is not ok — it lands in the summary and blocks exit 0 until it is diffed and replaced.
      need "$f" "installed copy DIFFERS from the repo copy — diff it, then reinstall from the repo before trusting the gate"
    else bad "$f" "repo copy missing at $src — cannot verify the installed one"; fi
  else bad "$f" "not in $BINDIR"; fi
done
# F-V2-26: only mode=subscription is healthy. Anything else means tasks are on free providers or deferred —
# the condition the whole design exists to keep temporary — so it is reported with its age, never as ok.
# route.env is parsed with sed, never sourced.
OMNI_STATE="$HOME/.config/omniroute/state"
if [ -r "$OMNI_STATE/mode" ]; then
  rmode=$(tr -dc 'A-Za-z0-9-' < "$OMNI_STATE/mode")
  if [ "$rmode" = "subscription" ]; then ok "omniroute route mode" "subscription"
  else
    rsince=''; rreason=''
    if [ -r "$OMNI_STATE/route.env" ]; then
      rsince=$(sed -n 's/^since=//p' "$OMNI_STATE/route.env" | tail -1 | tr -dc '0-9')
      rreason=$(sed -n 's/^reason=//p' "$OMNI_STATE/route.env" | tail -1 | tr -dc 'A-Za-z0-9 _.:=/-')
    fi
    if [ -n "$rsince" ]; then rage=$(( ($(date +%s) - rsince) / 60 )); ragestr="for $((rage / 60))h$((rage % 60))m"
    else ragestr="for an unknown time (no since= in route.env)"; fi
    need "omniroute route mode" "${rmode:-?} $ragestr (reason: ${rreason:-?}) — the probe has not restored the subscription"
  fi
else info "omniroute route mode" "no state/mode yet — claude-auto has not run"; fi
if [ -f "$OMNI_STATE/NEEDS-STEVEN" ]; then
  need "omniroute probe" "ESCALATED — $(head -1 "$OMNI_STATE/NEEDS-STEVEN" | tr -dc 'A-Za-z0-9 _.:=/()-' | cut -c1-170)"
fi
if [ -f "$OMNI_STATE/probe-failures" ]; then
  pf=$(tr -dc '0-9' < "$OMNI_STATE/probe-failures")
  [ "${pf:-0}" -gt 0 ] && info "omniroute probe" "$pf consecutive inconclusive probe(s) so far (escalates at 4)"
fi

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

# --------------------------------------------------------------------------- the eight repo harnesses
# P1, 2026-09-22. Nothing checked these until now. For each of the eight: is it there, does --help exit 0,
# and does the help name an `act` verb?
#
# WORD match, never substring. Measured 2026-09-22 against all eight real --help outputs: `grep -q act`
# matches "interactive" in all seven site harnesses, plus "action" in skyslope/zipforms and
# "redact"/"redacted" in lofty/zoho — it would report a write surface on seven harnesses that have
# none. (Recipe names like showingtime's my-listing-activity are the same trap one level down.)
# `grep -qw act` is the check; it matches none of those and does match a real `act` command group.
#
# The seven SITE harnesses must have no act verb: that is the read-only guarantee, so act there is a FAIL.
# The browser ENGINE genuinely ships `act click` / `act type` — that is DOMShell's write surface and the
# reason the engine exists. It is reported by name every run rather than passed silently or failed forever.
sect "cli-anything harnesses (eight — browser engine + seven read-only site CLIs)"
CAH_VENV="$HOME/Applications/cli-anything-harnesses/.venv"
harness_check() { # harness_check <name> <act-is-expected: yes|no>
  _h="cli-anything-$1"; _expect_act=$2
  _p=$(command -v "$_h" 2>/dev/null || true)
  [ -n "$_p" ] || { [ -x "$CAH_VENV/bin/$_h" ] && _p="$CAH_VENV/bin/$_h"; }
  [ -n "$_p" ] || { [ -x "$BINDIR/$_h" ] && _p="$BINDIR/$_h"; }
  if [ -z "$_p" ]; then
    bad "$_h" "not installed — MAC-SETUP.sh --only cli-anything-harnesses"; return
  fi
  _out=$("$_p" --help 2>&1); _rc=$?
  if [ "$_rc" -ne 0 ]; then
    bad "$_h" "present at $_p but '--help' exited $_rc (the browser dependency is the usual cause)"; return
  fi
  if printf '%s\n' "$_out" | grep -qw act; then
    if [ "$_expect_act" = yes ]; then
      info "$_h" "--help ok; has the act verb (act click / act type) — DOMShell's write surface, expected on the engine only"
    else
      bad "$_h" "--help ok BUT its help names an 'act' verb — a site harness must be read-only (word match, not substring)"
    fi
  else
    if [ "$_expect_act" = yes ]; then
      need "$_h" "--help ok but no act verb — expected on the engine; a different build than this repo vendors?"
    else
      ok "$_h" "--help exits 0, no act verb"
    fi
  fi
}
harness_check browser yes
for _s in homes showingtime showami skyslope zipforms lofty zoho; do harness_check "$_s" no; done
# PEP 420: the eight share one cli_anything/ namespace. An __init__.py directly under it hides the others.
if [ -x "$CAH_VENV/bin/python" ]; then
  _sp=$("$CAH_VENV/bin/python" -c 'import sysconfig;print(sysconfig.get_paths()["purelib"])' 2>/dev/null)
  if [ -n "$_sp" ] && [ -d "$_sp/cli_anything" ]; then
    if [ -f "$_sp/cli_anything/__init__.py" ]; then
      bad "cli_anything namespace" "an __init__.py sits directly under cli_anything/ — that hides the other portions (PEP 420)"
    else
      _n=0
      for _d in "$_sp"/cli_anything/*/; do [ -d "$_d" ] && _n=$((_n+1)); done
      ok "cli_anything namespace" "PEP 420, no __init__.py, $_n portion(s) installed"
    fi
  fi
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
    # F-V2-29: a placeholder is not a value. The value is read into a variable, classified by shape, and
    # never printed — the report says set / no value / placeholder, nothing more.
    _v=$(sed -n "s/^[[:space:]]*${_n}=//p" "$_f" 2>/dev/null | tail -1 | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e "s/^[\"']//" -e "s/[\"']$//")
    _lv=$(printf '%s' "$_v" | tr '[:upper:]' '[:lower:]')
    if [ -z "$_v" ]; then need "  $_n" "no value yet"
    else
      case "$_lv" in
        changeme|change-me|change_me|xxx*|todo*|tbd*|fixme*|'<'*'>'|*your-*|*your_*|*-here|*_here|placeholder*|example*|dummy*|sample*|none|null|n/a|replace*|*paste*|'...'|'…'|'$'*)
          need "  $_n" "placeholder value — replace it with the real key (value not shown)" ;;
        *) ok "  $_n" "set" ;;
      esac
    fi
    _v=''; _lv=''
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
  # F-V2-28: stdout only, exit status tested, the empty-state message is NEED, servers counted rather than
  # lines. stderr is read separately (a second, identical read-only call) only when the first call failed.
  mcp=$(claude mcp list 2>/dev/null); mcp_rc=$?
  if [ "$mcp_rc" -ne 0 ]; then
    mcp_err=$(claude mcp list 2>&1 >/dev/null | head -1 | redact_line | cut -c1-120)
    bad "claude mcp list" "exited $mcp_rc${mcp_err:+ — $mcp_err}"
  elif printf '%s' "$mcp" | grep -qi 'No MCP servers configured'; then
    need "claude mcp list" "no MCP servers configured for this user — the brain's local servers are not registered"
  elif [ -z "$(printf '%s' "$mcp" | tr -d '[:space:]')" ]; then bad "claude mcp list" "exit 0 but printed nothing"
  else
    n=$(printf '%s\n' "$mcp" | grep -cE '^[A-Za-z0-9_.-]+:')
    nbad=$(printf '%s\n' "$mcp" | grep -cE '(✗|Failed to connect|Error:)')
    ok "claude mcp list" "$n server(s) listed"
    [ "$nbad" -gt 0 ] && need "MCP servers failing" "$nbad server(s) not connected — see the listing"
    [ "$QUIET" -eq 1 ] || printf '%s\n' "$mcp" | redact_line | sed 's/^/        /'
    if printf '%s' "$mcp" | grep -qi 'agent402'; then
      bad "MCP agent402" "REGISTERED — it is on the refused list (pay-per-call wallet). Remove it: claude mcp remove agent402"
    fi
  fi
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
