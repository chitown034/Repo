#!/usr/bin/env bash
# shellcheck disable=SC2016,SC2086,SC2015,SC2126,SC2012,SC1091,SC2317
# mac-bootstrap-tests.sh — runs mac-bootstrap.sh inside a TEMPORARY fake Repo folder, with STUB executables
# first on PATH (git, brew, uv, runnerctl, claude, node, lofty-cli) and stub scripts in place of every installer.
# No Mac, no network, no real runner, no real claude login, no secret anywhere. Every stub logs its call to
# one file, so the tests can prove what was (and was not) run.
#
#   ./mac-bootstrap-tests.sh        # run everything
#   ./mac-bootstrap-tests.sh -v     # also print each invocation
# Exit 0 only if every case passes. Isolation: the script under test finds its repo from ITS OWN location, so
# it is always run as a COPY inside the fake repo (never the real one), and the stub git is first on PATH.
set -u

VERBOSE=0; for a in "$@"; do [ "$a" = -v ] && VERBOSE=1; done
HERE="$(cd "$(dirname "$0")" && pwd)"
SUT="${MAC_BOOTSTRAP_TESTS_SCRIPT:-$HERE/mac-bootstrap.sh}"
[ -f "$SUT" ] || { echo "no mac-bootstrap.sh at $SUT" >&2; exit 2; }
# Optional: a real Repo folder to compare the REFUSED list and the cron text against (drift checks).
REAL_REPO="${MAC_BOOTSTRAP_TESTS_REPO:-}"
if [ -z "$REAL_REPO" ] && [ -f "$HERE/MAC-SETUP.sh" ]; then REAL_REPO="$HERE"; fi
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/mac-bootstrap-tests.XXXXXX") || exit 2
trap 'rm -rf "$ROOT"' EXIT INT TERM
export LC_ALL=C

N_PASS=0; N_FAIL=0; FAILED=''
pass() { N_PASS=$((N_PASS+1)); printf '  ok    %s\n' "$1"; }
fail() { N_FAIL=$((N_FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; FAILED="$FAILED
  $1 :: $2"; }
sect() { printf '\n== %s\n' "$*"; }
eq()   { if [ "$2" = "$3" ]; then pass "$1 ($2)"; else fail "$1" "expected '$3', got '$2'"; fi; }
has()  { case "$2" in *"$3"*) pass "$1" ;; *) fail "$1" "'$3' not found in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-600)" ;; esac; }
hasnt(){ case "$2" in *"$3"*) fail "$1" "'$3' WAS present in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-600)" ;; *) pass "$1" ;; esac; }

# ------------------------------------------------------------------ the fake world
BIN="$ROOT/bin"; REPO="$ROOT/repo"; HOMED="$ROOT/home"; OUTD="$ROOT/out"; CALLS="$ROOT/calls.log"
mkdir -p "$BIN" "$HOMED" "$OUTD" "$ROOT/tmp"
export CALLS

mkstub() { # mkstub <path> — body on stdin
  cat >"$1"; chmod +x "$1"
}
SECRET='sk-ant-api03-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123'

mkstub "$BIN/git" <<'STUB'
#!/usr/bin/env bash
echo "git $*" >>"$CALLS"
case "$*" in
  *"--version") echo "git version 2.39.5 (stub)" ;;
  *"rev-parse --short HEAD") echo abc1234 ;;
  *"rev-parse --abbrev-ref HEAD") echo main ;;
  *"symbolic-full-name"*) echo origin/main ;;
  *"rev-list"*) echo "${STUB_GIT_COUNTS:-0 0}" ;;
  *"pull --ff-only"*) [ -z "${STUB_GIT_PULL_MSG:-}" ] || printf '%b\n' "$STUB_GIT_PULL_MSG"; exit "${STUB_GIT_PULL_RC:-0}" ;;
esac
exit 0
STUB
mkstub "$BIN/brew" <<'STUB'
#!/usr/bin/env bash
echo "brew $*" >>"$CALLS"
[ "${1:-}" = "--version" ] && echo "Homebrew 4.4.3"
exit 0
STUB
mkstub "$BIN/uv" <<'STUB'
#!/usr/bin/env bash
echo "uv $*" >>"$CALLS"
[ "${1:-}" = "--version" ] && echo "uv 0.5.1"
exit 0
STUB
mkstub "$BIN/node" <<'STUB'
#!/usr/bin/env bash
echo "node $*" >>"$CALLS"
echo v22.13.0
STUB
mkstub "$BIN/lofty-cli" <<'STUB'
#!/usr/bin/env bash
echo "lofty-cli $*" >>"$CALLS"
if [ -n "${STUB_NO_V2:-}" ]; then echo "Usage: lofty-cli leads timeline <id>"; else echo "Options: --v2  unified v2.0 timeline"; fi
STUB
mkstub "$BIN/runnerctl" <<'STUB'
#!/usr/bin/env bash
echo "runnerctl $*" >>"$CALLS"
case "${1:-}" in
  status) if [ -n "${STUB_RUNNER_LOGGEDOUT:-}" ]; then echo "claude-runner: Not logged in"; else echo "claude-runner: running (token $STUB_SECRET)"; fi ;;
  list) [ -z "${STUB_RUNNER_LISTFAIL:-}" ] || { echo "error: not authenticated" >&2; exit 1; }
        printf 'openrouter-feeds-refresh 0 * * * * enabled\nfeeds-weekly 0 5 * * 1 enabled\nfeeds-market-close 5 13 * * 1-5 enabled\nother-task 0 6 * * * enabled\n'
        [ -z "${STUB_RUNNER_HAS_MAINT:-}" ] || echo "brain-maintenance 0 6 * * * enabled" ;;
  pause) exit "${STUB_PAUSE_RC:-0}" ;;
esac
exit 0
STUB
mkstub "$BIN/claude" <<'STUB'
#!/usr/bin/env bash
echo "claude $*" >>"$CALLS"
case "${1:-}" in
  --version) echo "${STUB_CLAUDE_VER:-2.1.285} (Claude Code)" ;;
  mcp) case "${2:-}" in
         list) printf 'context7: npx -y ctx - Connected\nleaky: npx --api-key %s - Connected\n' "$STUB_SECRET"
               [ -z "${STUB_MCP_LAYA:-}" ] || echo "laya: /x/laya-mcp-server - Connected" ;;
       esac ;;
  *) printf '%s' "${1:-}" >"$ROOT_PROMPT" ;;
esac
exit 0
STUB

mkrepo() { # build a fresh fake Repo folder with stub installers
  rm -rf "$REPO" "$HOMED"; mkdir -p "$REPO/.git" "$REPO/scripts" "$REPO/bin" "$REPO/always-on" "$HOMED" \
    "$REPO/integrations/ai-team" "$REPO/integrations/browser-use" "$REPO/integrations/open-design" \
    "$REPO/integrations/api-anything" "$REPO/integrations/cli-anything-harnesses"
  : >"$CALLS"; : >"$REPO/CLAUDE.md"; : >"$REPO/.bootstrap-test-root"
  cp "$SUT" "$REPO/mac-bootstrap.sh"
  mkstub "$REPO/MAC-SETUP.sh" <<'STUB'
#!/usr/bin/env bash
echo "script MAC-SETUP.sh $*" >>"$CALLS"
echo "  NEEDS-STEVEN  DOMSHELL_TOKEN is required"
[ -z "${STUB_LEAK:-}" ] || echo "debug OPENAI_API_KEY=$STUB_SECRET and $STUB_SECRET"
exit "${STUB_SETUP_RC:-0}"
STUB
  mkstub "$REPO/integrations/ai-team/opus-5-5-on-mac.sh" <<'STUB'
#!/usr/bin/env bash
echo "script opus $*" >>"$CALLS"
case "${1:-}" in
  --apply) echo "Changed 2 file(s)." ;;
  --verify) echo "   opus ran on: claude-opus-5-5"; exit "${STUB_VERIFY_RC:-0}" ;;
  *) if [ "${STUB_OPUS_PINS:-2}" = 0 ]; then echo "Nothing on this Mac names Opus 5 outright."; else echo "Found ${STUB_OPUS_PINS:-2} pin(s) to Opus 5 above. Nothing was changed."; fi ;;
esac
STUB
  for t in browser-use open-design api-anything; do
    mkstub "$REPO/integrations/$t/install-mac.sh" <<STUB
#!/usr/bin/env bash
echo "script $t install" >>"\$CALLS"
echo "==== step"
if [ "$t" = api-anything ] && [ -n "\${STUB_API_SELFTEST_FAIL:-}" ]; then echo "Self-test did not pass. It printed: nope"; else echo "Self-test passed: $t ok"; fi
echo "Rules: integrations/$t/README.md"
STUB
  done
  mkstub "$REPO/integrations/install-orca-whatsapp-laya.sh" <<'STUB'
#!/usr/bin/env bash
echo "script whatsapp $*" >>"$CALLS"
echo "==== 3/3  WhatsApp connection (OpenWA)"
if [ -n "${STUB_WA_FAIL:-}" ]; then echo "setup-phone: not linked within 5 minutes" >&2; exit 1; fi
STUB
  mkstub "$REPO/integrations/cli-anything-harnesses/connect.sh" <<'STUB'
#!/usr/bin/env bash
echo "script connect.sh $*" >>"$CALLS"
echo "== 4. Sign-ins needed: homes (by hand)"
STUB
  mkstub "$REPO/scripts/brain-sync.sh" <<'STUB'
#!/usr/bin/env bash
echo "script brain-sync $*" >>"$CALLS"
if [ "${1:-}" = "--dry-run" ]; then
  echo "brain-sync — now"; echo "  would run: git pull --rebase --autostash"
  echo "  would link alpha -> $HOME/.claude/skills/alpha"; echo "  would link beta -> $HOME/.claude/skills/beta"
  echo "  CONFLICT  gamma — $HOME/.claude/skills/gamma is a real directory that differs"
  echo "== brain-sync summary =="; echo "  skills:        linked=2 already-ok=5 conflicts=1"
else
  echo "== brain-sync summary =="; echo "  index:         ok"; echo "  skills:        linked=2 already-ok=5 conflicts=1"
fi
STUB
  mkstub "$REPO/bin/brain" <<'STUB'
#!/usr/bin/env bash
echo "script brain $*" >>"$CALLS"
case "${1:-}" in
  doctor) echo "ok   index: fine"; echo "doctor: ${STUB_DOCTOR:-PASS}"; [ "${STUB_DOCTOR:-PASS}" = PASS ] ;;
  bench) printf 'wrote docs/reports/BRAIN-BENCH.md\n# Brain bench\n\n## Totals\n\n| Path | Est. tokens | Mean | Calls | ms | Correct | Refusals |\n|---|---:|---:|---:|---:|---:|---:|\n| brain | 4,734 | 236 | 20 | 2,057.0 | 16/18 | 2/2 |\n| default session | 1,894,796 | 94,739 | 180 | 5,310.6 | 13/18 | n/a |\n\n## Per question\n\n| 1 | x |\n' ;;
esac
STUB
  printf 'brain-maintenance | daily `0 6 * * *`; weekly check `30 15 * * 0`\n' >"$REPO/always-on/README.md"
  { echo "# ISA"; echo "---- PASTE FROM HERE ----"; echo "You are fixing two things on this Mac for Steven."; echo "SECTION A"
    echo "=== MAC ISA-KPI REPORT ==="; echo "left for Steven's hands: <list or none>"; echo "---- PASTE TO HERE ----"; echo "after"; } >"$REPO/integrations/mac-fix-isa-kpi-2026-10-08.md"
}

STDIN_FILE=/dev/null
sb() { # sb <args...>: run the COPY in the fake repo; OUT / ERR / RC / CALLSTXT / LOGTXT
  ( cd "$REPO" && HOME="$HOMED" PATH="$BIN:$PATH" TMPDIR="$ROOT/tmp" STUB_SECRET="$SECRET" ROOT_PROMPT="$ROOT/prompt.txt" \
      BOOTSTRAP_ALLOW_NON_MAC=1 BOOTSTRAP_TEST_HARNESS=1 bash ./mac-bootstrap.sh "$@" <"$STDIN_FILE" >"$OUTD/out" 2>"$OUTD/err" )
  RC=$?
  OUT=$(cat "$OUTD/out"); ERR=$(cat "$OUTD/err"); CALLSTXT=$(cat "$CALLS")
  LOGTXT=''; for lf in "$HOMED"/Library/Logs/vanessa-setup/*; do if [ -f "$lf" ]; then LOGTXT="$LOGTXT$(cat "$lf")"; fi; done
  [ "$VERBOSE" = 1 ] && printf '    $ mac-bootstrap %s -> rc=%s\n' "$*" "$RC"
  return 0
}
ncalls() { grep -c "$1" "$CALLS" 2>/dev/null || true; }
ALLYES="--yes-runner --yes-opus --yes-tools --yes-whatsapp --yes-brain --yes-laya"
printf 'mac-bootstrap-tests\n  script : %s\n  sandbox: %s\n' "$SUT" "$ROOT"
HOST_HEAD=''
if git -C "$HERE" rev-parse --is-inside-work-tree >/dev/null 2>&1; then HOST_HEAD=$(git -C "$HERE" rev-parse HEAD 2>/dev/null; git -C "$HERE" status --porcelain 2>/dev/null | cksum); fi

# ================================================================== A. static
sect "A. static"
if bash -n "$SUT" 2>"$OUTD/e"; then pass "bash -n"; else fail "bash -n" "$(cat "$OUTD/e")"; fi
if command -v shellcheck >/dev/null 2>&1; then
  if shellcheck "$SUT" >"$OUTD/e" 2>&1; then pass "shellcheck"; else fail "shellcheck" "$(head -20 "$OUTD/e")"; fi
  if shellcheck "$0" >"$OUTD/e" 2>&1; then pass "shellcheck (this test file)"; else fail "shellcheck tests" "$(head -20 "$OUTD/e")"; fi
else printf '  --    shellcheck not installed, skipped\n'; fi
b4=$(grep -nE 'mapfile|readarray|declare -A|\$\{[A-Za-z_]+\^\^|\$\{[A-Za-z_]+,,|&>>|\|&|wait -n|readlink -f|printf -v|coproc|local -n|sort -V|grep -P|=~|read -t [0-9]*\.' "$SUT" | grep -v '^[0-9]*:[[:space:]]*#' || true)
if [ -z "$b4" ]; then pass "no bash-4-only or GNU-only constructs outside comments"; else fail "bash 3.2 lint" "$b4"; fi
bs=$(grep -nE '\$\{[A-Za-z_]+\[@\]\}' "$SUT" | grep -v '^[0-9]*:[[:space:]]*#' || true)
if [ -z "$bs" ]; then pass "no bare \${array[@]} expansion (unsafe under set -u on bash 3.2)"; else fail "array expansion" "$bs"; fi

# ================================================================== B. dry run
sect "B. --dry-run changes nothing"
mkrepo
snap() { find "$ROOT" \( -path "$OUTD" -o -path "$CALLS" -o -path "$ROOT/prompt.txt" \) -prune -o -type f -print | sort | xargs cksum; find "$ROOT" -type d | sort; }
S1=$(snap)
sb --dry-run --with-claude --also zoho,lofty,connections
S2=$(snap)
eq   "B1 exits 0" "$RC" 0
eq   "B2 the fake world is byte-for-byte unchanged (no log, no report, no key file, no temp dir)" "$S2" "$S1"
bad=$(grep -vE '^(git|brew|uv|claude) --version$|^git -C .* (rev-parse|rev-list)' "$CALLS" || true)
eq   "B3 only read-only version probes ran (no installer, no pull, no pause, no mcp add)" "$bad" ""
has  "B4 prints would-run for the pull" "$OUT" "would run: git -C"
has  "B5 prints would-run for the harness step" "$OUT" "MAC-SETUP.sh --only cli-anything-harnesses"
has  "B6 prints would-run for runner pause" "$OUT" "would run: runnerctl pause feeds-weekly"
has  "B7 prints would-run for opus --apply" "$OUT" "opus-5-5-on-mac.sh --apply"
has  "B8 prints would-run for the whatsapp installer with both skips" "$OUT" "install-orca-whatsapp-laya.sh --skip-orca --skip-laya"
has  "B9 prints would-run for the laya registration" "$OUT" "claude mcp add -s user laya --env LAYA_DEVICE=cpu"
has  "B10 prints would-run for the zoho key file" "$OUT" "ZOHO_ACCOUNTS_URL ZOHO_API_URL ZOHO_CLIENT_ID ZOHO_CLIENT_SECRET ZOHO_REFRESH_TOKEN"
has  "B11 the report block still prints" "$OUT" "=== MAC COMBINED REPORT $(date +%Y-%m-%d) ==="
has  "B12 says no report file was written" "$OUT" "no report file was written"
sb --dry-run
eq   "B13 BOOTSTRAP_ALLOW_NON_MAC without the harness and without --dry-run is refused" "$(cd "$REPO" && HOME="$HOMED" PATH="$BIN:$PATH" BOOTSTRAP_ALLOW_NON_MAC=1 bash ./mac-bootstrap.sh --only graph </dev/null >/dev/null 2>&1; echo $?)" 1
eq   "B14 a plain non-Mac run (no flag at all) is refused" "$(cd "$REPO" && HOME="$HOMED" PATH="$BIN:$PATH" bash ./mac-bootstrap.sh --only graph </dev/null >/dev/null 2>&1; echo $?)" 1

# ================================================================== C. order, skip, only
sect "C. phase order, --skip, --only"
mkrepo; mkdir -p "$HOMED/laya-venv/bin"; : >"$HOMED/laya-venv/bin/laya-mcp-server"; chmod +x "$HOMED/laya-venv/bin/laya-mcp-server"
sb $ALLYES --also zoho,lofty,connections --yes-connections
eq   "C1 exits 0 when every phase succeeds" "$RC" 0
o=$(printf '%s\n' "$OUT" | grep -oE '^==== ([0-9]+ of 9|optional) — ' | sed 's/ — $//;s/==== //' | tr '\n' ',')
eq   "C2 headings appear in order, optional ones before the report" "$o" "0 of 9,1 of 9,2 of 9,3 of 9,4 of 9,5 of 9,6 of 9,7 of 9,8 of 9,optional,optional,optional,9 of 9,"
has  "C3 plain-English heading" "$OUT" "==== 4 of 9 — Opus 5.5"
c=$(grep -E '^(git -C .* pull|script MAC-SETUP|runnerctl pause|script opus --apply|script opus --verify|script browser-use|script open-design|script api-anything|script whatsapp|script brain-sync --dry-run|script brain doctor|script brain bench|claude mcp add|script connect)' "$CALLS" | sed -E 's/ .*//; ' | tr '\n' ' ')
first=$(grep -nE '^git -C .* pull' "$CALLS" | head -1 | cut -d: -f1); ms=$(grep -n 'script MAC-SETUP' "$CALLS" | head -1 | cut -d: -f1)
rp=$(grep -n '^runnerctl pause' "$CALLS" | head -1 | cut -d: -f1); ap=$(grep -n 'script opus --apply' "$CALLS" | head -1 | cut -d: -f1)
ba=$(grep -n 'script browser-use' "$CALLS" | head -1 | cut -d: -f1); wa=$(grep -n 'script whatsapp' "$CALLS" | head -1 | cut -d: -f1)
bs1=$(grep -n 'script brain-sync --dry-run' "$CALLS" | head -1 | cut -d: -f1); bd=$(grep -n 'script brain doctor' "$CALLS" | head -1 | cut -d: -f1)
bb=$(grep -n 'script brain bench' "$CALLS" | head -1 | cut -d: -f1); mc=$(grep -n 'claude mcp add' "$CALLS" | head -1 | cut -d: -f1)
cs=$(grep -n 'script connect' "$CALLS" | head -1 | cut -d: -f1)
ok=1; prev=0; for v in "$first" "$ms" "$rp" "$ap" "$ba" "$wa" "$bs1" "$bd" "$bb" "$cs"; do
  if [ -z "$v" ] || [ "$v" -le "$prev" ]; then ok=0; fi; prev=${v:-0}; done
eq   "C4 commands ran in phase order (pull, harnesses, runner, opus, tools, whatsapp, brain-sync, doctor, bench, connections)" "$ok" 1
[ -n "$mc" ] && [ "$mc" -gt "$bb" ] && pass "C5 laya registration comes after bench" || fail "C5 laya after bench" "mc=$mc bb=$bb"
sb --dry-run --skip tools --skip 6
has  "C6 --skip name" "$OUT" "5 of 9 — Browser, design and API tools: skipped by --skip"
has  "C7 --skip number" "$OUT" "6 of 9 — WhatsApp (OpenWA): skipped by --skip"
hasnt "C8 skipped phases print no commands" "$OUT" "install-orca-whatsapp-laya.sh"
mkrepo
sb --only runner --yes-runner
eq   "C9 --only runner: exits 0" "$RC" 0
eq   "C10 --only runner: exactly the runner calls (no git, no installer)" "$(grep -vE '^runnerctl ' "$CALLS" | wc -l | tr -d ' ')" 0
has  "C11 --only runner: other phases reported as not selected" "$OUT" "not selected by --only"
has  "C12 --only still prints the report" "$OUT" "=== MAC COMBINED REPORT"
sb --only 3,graph --dry-run
has  "C13 comma list and numbers work" "$OUT" "3 of 9 — Pausing three duplicate feed tasks"
sb --only
eq   "C14 --only with nothing after it is a usage error" "$RC" 2
sb --only=
eq   "C15 --only= with nothing after it is a usage error (never 'everything')" "$RC" 2
sb --only nonsense
eq   "C16 an unknown phase is a usage error" "$RC" 2
sb --bogus
eq   "C17 an unknown flag is a usage error" "$RC" 2
sb --yes
eq   "C18 there is no blanket --yes" "$RC" 2
sb --yes-all
eq   "C19 there is no --yes-all either" "$RC" 2

# ================================================================== D. prompts default to N
sect "D. y/N defaults to N; only --yes-<phase> pre-answers"
mkrepo; mkdir -p "$HOMED/laya-venv/bin"; : >"$HOMED/laya-venv/bin/laya-mcp-server"; chmod +x "$HOMED/laya-venv/bin/laya-mcp-server"
sb --skip pull
eq   "D1 no terminal and no flags: exits 0" "$RC" 0
eq   "D2 runner left untouched (no pause)" "$(ncalls '^runnerctl pause')" 0
eq   "D3 no MCP server added" "$(ncalls '^claude mcp add')" 0
eq   "D4 no opus --apply / --verify" "$(ncalls 'script opus --')" 0
eq   "D5 no tool installer ran" "$(ncalls 'script \(browser-use\|open-design\|api-anything\)')" 0
eq   "D6 no whatsapp installer ran" "$(ncalls 'script whatsapp')" 0
eq   "D7 no real brain-sync (only the dry-run preview)" "$(grep -c '^script brain-sync$' "$CALLS" || true)" 0
has  "D8 says the unanswered question was taken as no" "$OUT" "taken as no"
STDIN_FILE="$ROOT/answers"; printf 'n\nno\nmaybe\n\n' >"$STDIN_FILE"
mkrepo; mkdir -p "$HOMED/laya-venv/bin"; : >"$HOMED/laya-venv/bin/laya-mcp-server"; chmod +x "$HOMED/laya-venv/bin/laya-mcp-server"
sb --only runner
eq   "D9 typed 'n' leaves the runner alone" "$(ncalls '^runnerctl pause')" 0
printf 'yes\n' >"$STDIN_FILE"; mkrepo
sb --only runner
eq   "D10 typed 'yes' pauses exactly three" "$(ncalls '^runnerctl pause')" 3
printf 'yes please\n' >"$STDIN_FILE"; mkrepo
sb --only runner
eq   "D11 'yes please' is not a yes" "$(ncalls '^runnerctl pause')" 0
STDIN_FILE=/dev/null
mkrepo; mkdir -p "$HOMED/laya-venv/bin"; : >"$HOMED/laya-venv/bin/laya-mcp-server"; chmod +x "$HOMED/laya-venv/bin/laya-mcp-server"
sb --only brain --yes-brain
eq   "D12 --yes-brain does NOT pre-answer the Laya MCP question" "$(ncalls '^claude mcp add')" 0
sb --only brain --yes-laya
eq   "D13 --yes-laya registers it, exactly once" "$(ncalls '^claude mcp add')" 1
has  "D14 with the exact command" "$CALLSTXT" "claude mcp add -s user laya --env LAYA_DEVICE=cpu -- $HOMED/laya-venv/bin/laya-mcp-server"
hasnt "D15 BRAIN_ROUTER is never set" "$CALLSTXT$OUT" "BRAIN_ROUTER="
mkrepo; mkdir -p "$HOMED/laya-venv/bin"; : >"$HOMED/laya-venv/bin/laya-mcp-server"; chmod +x "$HOMED/laya-venv/bin/laya-mcp-server"
STUB_MCP_LAYA=1 sb --only brain --yes-laya
eq   "D16 already registered: nothing added" "$(ncalls '^claude mcp add')" 0
mkrepo
sb --only brain --yes-laya
eq   "D17 no laya-venv on the Mac: nothing added, no error" "$(ncalls '^claude mcp add')" 0
has  "D18 and it says so" "$OUT" "No laya-venv on this Mac"

# ================================================================== E. runner: exactly three, pause only
sect "E. runner"
mkrepo
sb --only runner --yes-runner
tasks=$(grep '^runnerctl pause' "$CALLS" | sort | tr '\n' ',')
eq   "E1 --yes-runner pauses exactly the three named tasks" "$tasks" "runnerctl pause feeds-market-close,runnerctl pause feeds-weekly,runnerctl pause openrouter-feeds-refresh,"
other=$(grep '^runnerctl' "$CALLS" | grep -vE '^runnerctl (status|list|pause (openrouter-feeds-refresh|feeds-weekly|feeds-market-close))$' || true)
eq   "E2 no other runnerctl subcommand was ever called (no delete, login, save-token, run, restart)" "$other" ""
hasnt "E3 other-task was not paused" "$CALLSTXT" "pause other-task"
has  "E4 shows runnerctl list after" "$OUT" "The runner's list now"
has  "E5 report lists the three" "$OUT" "paused=openrouter-feeds-refresh,feeds-weekly,feeds-market-close"
hasnt "E6 the status output (it carried a fake token) is never printed" "$OUT$ERR" "$SECRET"
mkrepo
STUB_RUNNER_LOGGEDOUT=1 sb --only runner --yes-runner
eq   "E7 not logged in: nothing paused" "$(ncalls '^runnerctl pause')" 0
has  "E8 says so, and whose hands" "$OUT" "runnerctl login"
eq   "E9 never ran login or save-token" "$(grep -cE '^runnerctl (login|save-token)' "$CALLS" || true)" 0
eq   "E10 exits non-zero" "$RC" 1
mkrepo
STUB_RUNNER_LISTFAIL=1 sb --only runner --yes-runner
eq   "E11 list failing: nothing paused, failure recorded" "$(ncalls '^runnerctl pause')$RC" "01"
mkrepo
STUB_PAUSE_RC=1 sb --only runner --yes-runner
has  "E12 a failed pause is a failed phase" "$OUT" "phase 3 runner: failed(runnerctl pause failed for:"

# ================================================================== F. failures do not stop later phases
sect "F. a failing phase is recorded and later phases still run"
mkrepo
STUB_SETUP_RC=1 sb $ALLYES
has  "F1 phase 2 recorded as failed" "$OUT" "phase 2 harnesses: failed("
eq   "F2 exit code is non-zero" "$RC" 1
has  "F3 later phase (runner) still ran" "$CALLSTXT" "runnerctl pause feeds-weekly"
has  "F4 later phase (brain) still ran" "$CALLSTXT" "script brain bench"
has  "F5 report line for brain is done" "$OUT" "phase 7 brain: done"
mkrepo
STUB_GIT_PULL_RC=1 STUB_GIT_PULL_MSG='fatal: Not possible to fast-forward, aborting.' sb $ALLYES
has  "F6 pull that cannot fast-forward: plain message" "$OUT" "cannot simply catch up"
has  "F7 and the pull phase failed" "$OUT" "phase 1 pull: failed(cannot fast-forward"
has  "F8 phases after it still ran" "$CALLSTXT" "script opus --verify"
mkrepo
STUB_GIT_PULL_RC=1 STUB_GIT_PULL_MSG='error: Your local changes to the following files would be overwritten by merge:\n\tINDEX.md\n\tbrain/index.json\nAborting' sb --only pull
has  "F9 generated-file collision names the one-line fix" "$OUT" "git checkout -- INDEX.md brain/index.json"
mkrepo
STUB_API_SELFTEST_FAIL=1 sb $ALLYES
has  "F10 api-anything exits 0 but its self-test did not pass: recorded as a failure" "$OUT" "api-anything=fail"
has  "F11 the other two passed" "$OUT" "browser-use=pass open-design=pass"
mkrepo
STUB_WA_FAIL=1 sb --only whatsapp --yes-whatsapp
has  "F12 whatsapp: says where it stopped" "$OUT" "whatsapp=stopped at setup-phone: not linked within 5 minutes"
mkrepo
STUB_VERIFY_RC=1 sb --only opus --yes-opus
has  "F13 opus verify failing is a failed phase" "$OUT" "phase 4 opus: failed("
mkrepo
STUB_DOCTOR=FAIL sb --only brain --yes-brain
has  "F14 doctor FAIL is reported as FAIL" "$OUT" "doctor=FAIL"
mkrepo
STUB_GIT_COUNTS="2 3" sb --only brain --yes-brain
eq   "F15 diverged history: the real brain-sync (which rebases) is NOT run" "$(grep -c '^script brain-sync$' "$CALLS" || true)" 0
has  "F16 and the preview + doctor + bench still ran" "$CALLSTXT" "script brain bench"

# ================================================================== G. opus, version, tools, brain values
sect "G. opus, tools, brain, graph"
mkrepo
STUB_CLAUDE_VER=2.1.270 sb --only opus
has  "G1 warns when Claude Code is older than 2.1.280" "$OUT" "older than 2.1.280"
mkrepo
sb --only opus
hasnt "G2 no warning at 2.1.285" "$OUT" "WARNING: older"
mkrepo
sb --only opus --yes-opus
o=$(grep -E '^script opus' "$CALLS" | tr '\n' ',')
eq   "G3 preview, then --apply, then --verify, in that order" "$o" "script opus ,script opus --apply,script opus --verify,"
has  "G4 report carries model and cli version" "$OUT" "opus_verify=claude-opus-5-5 cli=2.1.285"
mkrepo
STUB_OPUS_PINS=0 sb --only opus --yes-opus
hasnt "G5 nothing to change: --apply is not run" "$CALLSTXT" "opus --apply"
has  "G6 but the check is" "$CALLSTXT" "opus --verify"
mkrepo
sb --only tools --yes-tools
has  "G7 captured self-test lines" "$OUT" "self-test line: Self-test passed: api-anything ok"
mkrepo
sb --only brain --yes-brain
has  "G8 doctor and bench values in the report" "$OUT" "doctor=PASS bench=16/18 tokens=4734 refusals=2/2 sync=ran skills_linked=2 conflicts=1 laya_mcp=not brain_maintenance=proposed"
has  "G9 shows the conflict" "$OUT" "CONFLICT"
has  "G10 shows every skill it would link" "$OUT" "would link alpha"
eq   "G11 a runner task is never added (only list was called)" "$(grep -c '^runnerctl' "$CALLS" || true)" 1
has  "G12 prints the maintenance proposal" "$OUT" "0 6 * * *"
mkrepo
STUB_RUNNER_HAS_MAINT=1 sb --only brain --yes-brain
has  "G13 existing brain-maintenance task is reported as exists" "$OUT" "brain_maintenance=exists"
mkrepo
sb --only graph
has  "G14 graph phase prints the Claude Code instruction" "$OUT" "ops-knowledge-graph"
has  "G15 and is reported as not run" "$OUT" "phase 8 graph: skipped("

# ================================================================== H. report, log, secrets
sect "H. report block, log, secrets"
mkrepo
STUB_LEAK=1 sb $ALLYES
today=$(date +%Y-%m-%d)
first=$(printf '%s\n' "$OUT" | grep -n '^=== MAC COMBINED REPORT' | head -1 | cut -d: -f2-)
eq   "H1 block starts with the header" "$first" "=== MAC COMBINED REPORT $today ==="
block=$(printf '%s\n' "$OUT" | sed -n '/^=== MAC COMBINED REPORT/,/^=== END MAC COMBINED REPORT ===/p')
eq   "H2 one line per phase (13)" "$(printf '%s\n' "$block" | grep -c '^phase [0-9]* ')" 13
eq   "H3 every phase line is done / skipped / failed" "$(printf '%s\n' "$block" | grep '^phase ' | grep -cvE ': (done|skipped\(|failed\()')" 0
has  "H4 left-for-Steven line present" "$block" "left for Steven's hands:"
has  "H5 FINAL REPORT values: harness_v2" "$block" "harness_v2=y"
has  "H6 FINAL REPORT values: cli=" "$block" "cli=2.1.285"
rf="$HOMED/Library/Logs/vanessa-setup/bootstrap-$today.txt"
[ -f "$rf" ] && pass "H7 report file written" || fail "H7 report file" "missing $rf"
eq   "H8 the file holds exactly the printed block" "$(cat "$rf" 2>/dev/null)" "$block"
[ -f "$HOMED/Library/Logs/vanessa-setup/bootstrap-$today.log" ] && pass "H9 log file written" || fail "H9 log" "missing"
sb --only graph
[ -f "$HOMED/Library/Logs/vanessa-setup/bootstrap-$today-2.txt" ] && pass "H10 a second run the same day does not overwrite the first report" || fail "H10" "no -2 file"
mkrepo; STUB_LEAK=1 sb $ALLYES
all="$OUT$ERR$LOGTXT$(cat "$HOMED"/Library/Logs/vanessa-setup/*.txt 2>/dev/null)"
hasnt "H11 no key value in the log or the report" "$LOGTXT$(cat "$HOMED"/Library/Logs/vanessa-setup/*.txt)" "$SECRET"
has  "H12 the log shows it was redacted" "$LOGTXT" "[redacted]"
hasnt "H13 'claude mcp list' output (it carried a token) never printed" "$all" "$SECRET-"
hasnt "H14 no raw home path in the report" "$block" "$HOMED"
mkrepo
sb --with-claude --only graph --yes-claude
exp=$(sed -n '/^---- PASTE FROM HERE ----$/,/^---- PASTE TO HERE ----$/p' "$REPO/integrations/mac-fix-isa-kpi-2026-10-08.md" | sed '1d;$d')
eq   "H15 --with-claude --yes-claude starts claude with exactly the text between the PASTE lines" "$(cat "$ROOT/prompt.txt" 2>/dev/null)" "$exp"
rm -f "$ROOT/prompt.txt"; mkrepo
sb --with-claude --only graph
eq   "H16 --with-claude without --yes-claude: asked, default N, claude not started" "$(ncalls '^claude [^-m]')" 0

# ================================================================== I. optional key-file phases
sect "I. optional phases: key files with names only"
mkrepo
sb --only zoho
f="$HOMED/.config/zoho/.env"
[ -f "$f" ] && pass "I1 zoho .env created" || fail "I1" "missing"
eq   "I2 names only, no values" "$(grep -v '^#' "$f" | sed '/^$/d' | tr '\n' ',')" "ZOHO_ACCOUNTS_URL=,ZOHO_API_URL=,ZOHO_CLIENT_ID=,ZOHO_CLIENT_SECRET=,ZOHO_REFRESH_TOKEN=,"
eq   "I3 mode 600" "$(stat -c %a "$f" 2>/dev/null || stat -f %Lp "$f")" 600
has  "I4 tells Steven to type the values himself" "$OUT" "type each value after the = sign"
printf 'ZOHO_CLIENT_ID=%s\n' "$SECRET" >"$f"
sb --only zoho
eq   "I5 an existing file is never rewritten" "$(cat "$f")" "ZOHO_CLIENT_ID=$SECRET"
hasnt "I6 an existing value is never echoed" "$OUT$ERR$LOGTXT" "$SECRET"
has  "I7 only names are listed as still empty" "$OUT" "ZOHO_ACCOUNTS_URL"
hasnt "I8 a name that has a value is not listed as empty" "$OUT" "still empty (names only): ZOHO_ACCOUNTS_URL ZOHO_API_URL ZOHO_CLIENT_ID"
mkrepo
sb --only lofty
eq   "I9 lofty .env has the one name" "$(grep -v '^#' "$HOMED/.config/lofty/.env" | sed '/^$/d')" "LOFTY_API_KEY="
sb --only connections --yes-connections
has  "I10 connections runs connect.sh" "$CALLSTXT" "script connect.sh"
mkrepo
sb --only connections
eq   "I11 connections without a yes does not run it" "$(ncalls 'script connect')" 0
mkrepo
sb
eq   "I12 optional phases are off by default" "$(ncalls 'script connect')$(ls "$HOMED/.config" 2>/dev/null | wc -l | tr -d ' ')" "00"
has  "I13 no prompt in the script reads a value (only y/N answers)" "$(grep -n 'read -r' "$SUT" | grep -v 'IFS=\|BR_\|_ <<\|a ||\|line' | tr '\n' ' ')" ""

# ================================================================== J. REFUSED / HALT
sect "J. REFUSED names and forbidden commands"
for n in vphone-cli agent402 agent-skills-plugin media-inference-worker agent-reach-skill whatsapp-plugin whatscli; do
  sb --only "$n"
  eq "J1 --only $n is rejected (exit 2)" "$RC" 2
  has "J2 --only $n says REFUSED" "$ERR" "REFUSED: $n"
done
mkrepo
sb --skip agent402
eq   "J3 --skip agent402 is rejected too" "$RC" 2
eq   "J4 nothing ran" "$(wc -c <"$CALLS" | tr -d ' ')" 0
g() { ( BOOTSTRAP_SOURCE_ONLY=1 . "$REPO/mac-bootstrap.sh"; "$@" ) >"$OUTD/g.out" 2>"$OUTD/g.err"; GRC=$?; GERR=$(cat "$OUTD/g.err"); }
for c in "brew install agent402" "git clone https://x/framepipe-dev/y" "claude plugins install whatsapp-cli@x" "runnerctl login" "runnerctl save-token" "runnerctl delete feeds-weekly" "claude auth login" "rm -rf /tmp/x" "sudo ls"; do
  g guard_refused "$c"
  eq "J5 guard aborts on: $c" "$GRC" 3
  has "J6 and says ABORT" "$GERR" "ABORT"
done
g guard_refused "runnerctl pause feeds-weekly"
eq   "J7 the allowed pause passes the guard" "$GRC" 0
g runner_allowed pause other-task
eq   "J8 pausing any other task aborts" "$GRC" 3
g runner_allowed list
eq   "J9 runnerctl list is allowed" "$GRC" 0
g runner_allowed restart
eq   "J10 runnerctl restart aborts" "$GRC" 3
if [ -n "$REAL_REPO" ] && [ -f "$REAL_REPO/MAC-SETUP.sh" ]; then
  a=$(sed -n "/^REFUSED_LIST='/,/'\$/p" "$REAL_REPO/MAC-SETUP.sh" | sed "1s/^REFUSED_LIST='//; \$s/'\$//")
  b=$(sed -n "/^REFUSED_LIST='/,/'\$/p" "$SUT" | sed "1s/^REFUSED_LIST='//; \$s/'\$//")
  eq "J11 REFUSED_LIST is identical to MAC-SETUP.sh's" "$b" "$a"
  a=$(sed -n "/^REFUSED_GUARDS='/,/'\$/p" "$REAL_REPO/MAC-SETUP.sh"); b=$(sed -n "/^REFUSED_GUARDS='/,/'\$/p" "$SUT")
  eq "J12 REFUSED_GUARDS is identical to MAC-SETUP.sh's" "$b" "$a"
  [ -f "$REAL_REPO/always-on/README.md" ] && has "J13 the proposed cron times still appear in always-on/README.md" "$(cat "$REAL_REPO/always-on/README.md")" '30 15 * * 0'
else printf '  --    J11-J13 skipped (no real Repo folder next to the tests; set MAC_BOOTSTRAP_TESTS_REPO)\n'; fi

# ================================================================== K. small functions
sect "K. helpers"
v() { ( BOOTSTRAP_SOURCE_ONLY=1 . "$REPO/mac-bootstrap.sh"; ver_ge "$1" "$2" ) >/dev/null 2>&1; echo $?; }
eq   "K1 2.1.285 >= 2.1.280" "$(v 2.1.285 2.1.280)" 0
eq   "K2 2.1.279 < 2.1.280" "$(v 2.1.279 2.1.280)" 1
eq   "K3 2.2.0 >= 2.1.280" "$(v 2.2.0 2.1.280)" 0
eq   "K4 3.9 < 3.10 (numeric, not text)" "$(v 3.9 3.10)" 1
eq   "K5 2.1.280-beta >= 2.1.280" "$(v 2.1.280-beta 2.1.280)" 0
mkrepo
mkstub "$BIN/python3" <<'STUB'
#!/usr/bin/env bash
echo "3.9"
STUB
sb --dry-run --only preflight,brain
rm -f "$BIN/python3"
has  "K6 python 3.9 is flagged with a one-line fix" "$OUT" "brew install python@3.12"
eq   "K7 and preflight fails" "$RC" 1
mkrepo
sb --only preflight
eq   "K8 preflight is clean with the stubs present" "$RC" 0
mkrepo
mkdir -p "$ROOT/alt"; mkstub "$ROOT/alt/install-orca-whatsapp-laya.sh" <<'STUB'
#!/usr/bin/env bash
echo "script ALT-whatsapp $*" >>"$CALLS"
STUB
BOOTSTRAP_INTEGRATIONS_DIR="$ROOT/alt" sb --only whatsapp --yes-whatsapp
has  "K9 BOOTSTRAP_INTEGRATIONS_DIR points the installers at another folder (harness only)" "$CALLSTXT" "script ALT-whatsapp --skip-orca --skip-laya"

# ================================================================== Z. isolation
sect "Z. isolation"
if [ -n "$HOST_HEAD" ]; then
  now=$(git -C "$HERE" rev-parse HEAD 2>/dev/null; git -C "$HERE" status --porcelain 2>/dev/null | cksum)
  eq "Z1 the real repo's HEAD and status are unchanged" "$now" "$HOST_HEAD"
else pass "Z1 tests are not inside a git repo; nothing to protect"; fi

printf '\n------------------------------------------------------------\n'
printf 'pass %s   FAIL %s\n' "$N_PASS" "$N_FAIL"
if [ "$N_FAIL" -gt 0 ]; then printf 'failed:%s\n' "$FAILED"; exit 1; fi
exit 0
