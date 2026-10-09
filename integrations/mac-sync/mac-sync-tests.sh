#!/usr/bin/env bash
# mac-sync-tests.sh — executes mac-sync.sh's four subcommands against a TEMPORARY git repo (a bare "origin"
# plus two working clones standing in for two Macs) and STUBBED claude/runnerctl/launchctl/scutil. No real
# Mac, no real claude login, no network beyond the local temp "origin", no secret anywhere.
#
#   ./mac-sync-tests.sh            # run everything
#   ./mac-sync-tests.sh -v         # also print each invocation
# Exit 0 only if every case passes. Written for macOS bash 3.2; BSD and GNU userland.
set -u
set -f

VERBOSE=0; for a in "$@"; do [ "$a" = -v ] && VERBOSE=1; done
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="${MAC_SYNC_TESTS_SCRIPT:-$HERE/mac-sync.sh}"
[ -f "$SCRIPT" ] || { echo "no mac-sync.sh at $SCRIPT" >&2; exit 2; }
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/mac-sync-tests.XXXXXX") || exit 2
trap 'rm -rf "$ROOT"' EXIT INT TERM

# Isolation guard. Corrected 2026-09-24: mac-sync.sh finds its repo from its OWN location, so calling the
# real "$SCRIPT" without naming a repo ran a real `git pull --rebase --autostash` on the repo this file lives
# in (it happened once, in the cloud copy, and was aborted). From here on every call inherits a repo path
# that does not exist, so a call that forgets to name its temp repo is refused ("not a git repo") instead.
# run_a / run_b unset it on purpose: they run the COPY inside a temp clone, whose own location is safe.
export MAC_SYNC_REPO_DIR="$ROOT/guard-no-repo-here"

# Snapshot the repo this file lives in (if any); section Z proves the run left it exactly as it was.
HOST=''
if git -C "$HERE/../.." rev-parse --is-inside-work-tree >/dev/null 2>&1; then HOST=$(cd "$HERE/../.." && pwd); fi
host_state() {
  [ -n "$HOST" ] || { echo none; return; }
  _gd=$(git -C "$HOST" rev-parse --git-dir 2>/dev/null)
  case "$_gd" in /*) ;; *) _gd="$HOST/$_gd" ;; esac
  _mid=no; { [ -d "$_gd/rebase-merge" ] || [ -d "$_gd/rebase-apply" ] || [ -f "$_gd/MERGE_HEAD" ] || [ -f "$_gd/CHERRY_PICK_HEAD" ]; } && _mid=yes
  printf 'head=%s reflog=%s stash=%s midop=%s' \
    "$(git -C "$HOST" rev-parse HEAD 2>/dev/null)" \
    "$(git -C "$HOST" reflog 2>/dev/null | wc -l | tr -d ' ')" \
    "$(git -C "$HOST" stash list 2>/dev/null | wc -l | tr -d ' ')" "$_mid"
}
HOST_BEFORE=$(host_state)

N_PASS=0; N_FAIL=0; FAILED=''
pass() { N_PASS=$((N_PASS+1)); printf '  ok    %s\n' "$1"; }
fail() { N_FAIL=$((N_FAIL+1)); printf '  FAIL  %s\n     -> %s\n' "$1" "$2"; FAILED="$FAILED
  $1 :: $2"; }
sect() { printf '\n== %s\n' "$*"; }
eq()   { if [ "$2" = "$3" ]; then pass "$1 ($2)"; else fail "$1" "expected '$3', got '$2'"; fi; }
has()  { case "$2" in *"$3"*) pass "$1" ;; *) fail "$1" "'$3' not found in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-500)" ;; esac; }
hasnt(){ case "$2" in *"$3"*) fail "$1" "'$3' WAS present in: $(printf '%s' "$2" | tr '\n' '|' | cut -c1-500)" ;; *) pass "$1" ;; esac; }

# ------------------------------------------------------------------ stubbed commands
BIN="$ROOT/bin"; mkdir -p "$BIN"
cat > "$BIN/claude" <<'STUB'
#!/usr/bin/env bash
case "${1:-}" in
  --version) echo "2.1.999 (stub)" ;;
  mcp) [ "${2:-}" = list ] && printf 'omni-server: connected\nfilesystem: connected\n' ;;
  plugin) [ "${2:-}" = list ] && printf '  cli-anything@cli-anything\n  ponytail@ponytail\n' ;;
esac
exit 0
STUB
cat > "$BIN/runnerctl" <<'STUB'
#!/usr/bin/env bash
case "${1:-}" in
  --version) echo "runnerctl stub 1.0" ;;
  list) printf 'task-one 0 5 * * * True\ntask-two */10 * * * * False\n' ;;
esac
exit 0
STUB
cat > "$BIN/launchctl" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = list ]; then
  printf '1234\t0\tcom.stevenshearrill.claude-runner\n'
  printf '5678\t0\tcom.stevenshearrill.omniroute-probe\n'
  printf '9999\t0\tcom.other.unrelated\n'
fi
exit 0
STUB
cat > "$BIN/scutil" <<'STUB'
#!/usr/bin/env bash
[ "${2:-}" = ComputerName ] && echo "Test-Mac-Stub"
exit 0
STUB
chmod +x "$BIN"/claude "$BIN"/runnerctl "$BIN"/launchctl "$BIN"/scutil

# ------------------------------------------------------------------ a temporary git repo, two "Macs"
ORIGIN="$ROOT/origin.git"; MACA="$ROOT/macA"; MACB="$ROOT/macB"
git init -q --bare "$ORIGIN"
git clone -q "$ORIGIN" "$MACA" >/dev/null 2>&1
( cd "$MACA" && git config user.email a@example.com && git config user.name MacA
  mkdir -p integrations/mac-sync
  cp "$SCRIPT" integrations/mac-sync/mac-sync.sh && chmod +x integrations/mac-sync/mac-sync.sh
  echo "brain repo" > README.md
  git add -A && git commit -qm init && git push -q origin HEAD:master >/dev/null 2>&1 )
git clone -q "$ORIGIN" "$MACB" >/dev/null 2>&1
( cd "$MACB" && git config user.email b@example.com && git config user.name MacB )

HOMEA="$ROOT/homeA"; HOMEB="$ROOT/homeB"
mkdir -p "$HOMEA/.config/claude-runner" "$HOMEB/.config/claude-runner"

run_a() { ( cd "$MACA" && unset MAC_SYNC_REPO_DIR && HOME="$HOMEA" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh "$@" >"$ROOT/out" 2>"$ROOT/err" ); RC=$?; OUT=$(cat "$ROOT/out"); ERR=$(cat "$ROOT/err"); [ "$VERBOSE" = 1 ] && printf '    $ [A] mac-sync %s -> rc=%s\n' "$*" "$RC"; return 0; }
run_b() { ( cd "$MACB" && unset MAC_SYNC_REPO_DIR && HOME="$HOMEB" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh "$@" >"$ROOT/out" 2>"$ROOT/err" ); RC=$?; OUT=$(cat "$ROOT/out"); ERR=$(cat "$ROOT/err"); [ "$VERBOSE" = 1 ] && printf '    $ [B] mac-sync %s -> rc=%s\n' "$*" "$RC"; return 0; }

printf 'mac-sync-tests — executed tests\n  script : %s\n  sandbox: %s\n' "$SCRIPT" "$ROOT"

# ================================================================== A. static
sect "A. static"
if bash -n "$SCRIPT" 2>"$ROOT/e"; then pass "bash -n mac-sync.sh"; else fail "bash -n" "$(cat "$ROOT/e")"; fi
if command -v shellcheck >/dev/null 2>&1; then
  if shellcheck "$SCRIPT" >"$ROOT/e" 2>&1; then pass "shellcheck (default)"; else fail "shellcheck" "$(cat "$ROOT/e")"; fi
  if shellcheck -S style "$SCRIPT" >"$ROOT/e" 2>&1; then pass "shellcheck -S style"; else fail "shellcheck style" "$(cat "$ROOT/e")"; fi
else printf '  --    shellcheck not installed, skipped\n'; fi
b4=$(grep -nE 'mapfile|readarray|declare -A|\$\{[A-Za-z_]+\^\^|\$\{[A-Za-z_]+,,|&>>|wait -n|readlink -f' "$SCRIPT" | grep -v '^[0-9]*:#' || true)
if [ -z "$b4" ]; then pass "no bash-4-only constructs outside comments"; else fail "bash 3.2" "$b4"; fi

# ================================================================== B. status
sect "B. status"

printf '# role\npeer\n' > "$HOMEA/.config/claude-runner/role"; chmod 644 "$HOMEA/.config/claude-runner/role"
run_a status
eq   "B1 status exits 0"                                 "$RC" "0"
has  "B1 shows the role"                                 "$OUT" "role    peer"
has  "B1 shows repo branch"                               "$OUT" "branch  master"
has  "B1 shows an MCP server count (stub: 2)"             "$OUT" "mcp-servers   2"
has  "B1 shows a plugin count (stub: 2)"                  "$OUT" "plugins       2"
has  "B1 shows a runner-task count (stub: 2)"              "$OUT" "runner-tasks  2"
has  "B1 no lease.env yet -> says so plainly"             "$OUT" "no cached decision yet"

rm -f "$HOMEA/.config/claude-runner/role"
run_a status
has  "B2 no role file -> reports standby (the safe default)" "$OUT" "role    standby"

printf 'PEER\n' > "$HOMEA/.config/claude-runner/role"
run_a status
has  "B3 role file is case-insensitive"                  "$OUT" "role    peer"

printf 'sideways\n' > "$HOMEA/.config/claude-runner/role"
run_a status
has  "B4 an invalid role word -> standby, not a crash"    "$OUT" "role    standby"
printf 'peer\n' > "$HOMEA/.config/claude-runner/role"

mkdir -p "$HOMEA/.config/omniroute/state"
printf 'decision=run\nverdict=ACQUIRED\nrole=peer\nchecked_at=%s\nexpires_iso=2099-01-01T00:00:00Z\nholder=test-mac-one\nfails=0\n' "$(date +%s)" > "$HOMEA/.config/omniroute/state/lease.env"
run_a status
has  "B5 shows the cached lease verdict"                  "$OUT" "ACQUIRED holder=test-mac-one"

mkdir -p "$HOMEA/.config/lofty" "$HOMEA/.config/omniroute"
printf 'LOFTY_API_KEY=not-a-real-secret-value\n' > "$HOMEA/.config/lofty/.env"
printf 'OMNIROUTE_API_KEY=also-not-real\nOPENROUTER_API_KEY=nope\n' > "$HOMEA/.config/omniroute/.env"
run_a status
has  "B6 lists the .env variable NAME"                    "$OUT" "lofty/.env:LOFTY_API_KEY"
has  "B6 lists a second file's NAMEs too"                 "$OUT" "omniroute/.env:OPENROUTER_API_KEY"
hasnt "B6 NEVER prints the value"                         "$OUT" "not-a-real-secret-value"
hasnt "B6 NEVER prints the other value either"             "$OUT" "also-not-real"

# vault sync detection — paths and config presence only, never note content
rm -rf "$HOMEA/vault"
run_a status
has  "B7 no vault directory -> no-vault"                  "$OUT" "sync    no-vault"

mkdir -p "$HOMEA/vault/some-note-folder"
echo "this looks like a private note, never read by the detector" > "$HOMEA/vault/some-note-folder/note.md"
( cd "$MACA" && HOME="$HOMEA" MAC_SYNC_VAULT_DIR="$HOMEA/vault" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh status >"$ROOT/out" 2>"$ROOT/err" ); RC=$?; OUT=$(cat "$ROOT/out")
has  "B8 a vault dir with nothing recognised -> local-only" "$OUT" "sync    local-only"

mkdir -p "$HOMEA/vault/.obsidian"
printf '{"sync":true}\n' > "$HOMEA/vault/.obsidian/core-plugins.json"
( cd "$MACA" && HOME="$HOMEA" MAC_SYNC_VAULT_DIR="$HOMEA/vault" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh status >"$ROOT/out" 2>"$ROOT/err" ); OUT=$(cat "$ROOT/out")
has  "B9 core-plugins.json naming sync -> obsidian-sync detected" "$OUT" "sync    obsidian-sync"

mkdir -p "$HOMEA/Library/Mobile Documents/vault-here"
ln -sfn "$HOMEA/Library/Mobile Documents/vault-here" "$HOMEA/icloud-vault"
( cd "$MACA" && HOME="$HOMEA" MAC_SYNC_VAULT_DIR="$HOMEA/icloud-vault" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh status >"$ROOT/out" 2>"$ROOT/err" ); OUT=$(cat "$ROOT/out")
has  "B10 a symlink resolving into Library/Mobile Documents -> icloud" "$OUT" "sync    icloud"

( cd "$HOMEA/Library/Mobile Documents/vault-here" && git init -q )
( cd "$MACA" && HOME="$HOMEA" MAC_SYNC_VAULT_DIR="$HOMEA/icloud-vault" PATH="$BIN:$PATH" bash integrations/mac-sync/mac-sync.sh status >"$ROOT/out" 2>"$ROOT/err" ); OUT=$(cat "$ROOT/out")
has  "B11 both a git repo AND inside iCloud -> combined, neither hides the other" "$OUT" "sync    icloud+git"
hasnt "B12 vault detection never quotes note content" "$OUT" "private note"

# ================================================================== C. pull
sect "C. pull"

run_a pull
eq   "C1 already up to date -> exits 0"                  "$RC" "0"
has  "C1 says so"                                        "$OUT" "up to date"

( cd "$MACA" && echo "A change" >> README.md && git commit -qam "A edits" && git push -q origin HEAD:master >/dev/null 2>&1 )
run_b pull
eq   "C2 clean fast-forward pull -> exits 0"              "$RC" "0"
has  "C2 says pulled clean"                               "$OUT" "pulled clean"

( cd "$MACA" && echo "A change 2" >> README.md && git commit -qam "A edits 2" && git push -q origin HEAD:master >/dev/null 2>&1 )
( cd "$MACB" && echo "B change" >> README.md && git commit -qam "B edits" )
run_b pull
eq   "C3 a real conflict -> refuses, exits 1"             "$RC" "1"
has  "C3 says why (a real conflict, not local edits)"     "$ERR" "real conflict"
has  "C3 tells you the exact recovery commands"           "$ERR" "rebase --continue"
( cd "$MACB" && git rebase --abort >/dev/null 2>&1; git reset -q --hard origin/master )

# The real script with NO repo named inherits the isolation guard above and must refuse, not reach for the
# repo it lives in. (This line used to run exactly that call unguarded — see the note at the top.)
mkdir -p "$ROOT/cwd-only"
( cd "$ROOT/cwd-only" && HOME="$HOMEA" PATH="$BIN:$PATH" bash "$SCRIPT" pull >"$ROOT/out" 2>"$ROOT/err" )
RC=$?; ERR=$(cat "$ROOT/err")
eq   "C4a no repo named -> the guard refuses, exits 1"     "$RC" "1"
has  "C4a names the guard path, not the real repo"         "$ERR" "guard-no-repo-here"

mkdir -p "$ROOT/no-git-here"
( cd "$ROOT/no-git-here" && HOME="$HOMEA" PATH="$BIN:$PATH" MAC_SYNC_REPO_DIR="$ROOT/no-git-here" bash "$SCRIPT" pull >"$ROOT/out" 2>"$ROOT/err" )
RC=$?; ERR=$(cat "$ROOT/err")
eq   "C4 not a git repo at all -> refuses, exits 1"       "$RC" "1"
has  "C4 says why"                                        "$ERR" "not a git repo"

# ================================================================== D. export
sect "D. export"

printf 'test-mac-one\n' > "$HOMEA/.config/claude-runner/id"
run_a export
eq   "D1 export exits 0"                                 "$RC" "0"
has  "D1 says what it wrote"                              "$OUT" "wrote"
if [ -f "$MACA/mac-config/test-mac-one/mcp-servers.txt" ]; then pass "D1 mcp-servers.txt exists"; else fail "D1 mcp-servers.txt exists" "missing"; fi
if [ -f "$MACA/mac-config/test-mac-one/runner-tasks.txt" ]; then pass "D1 runner-tasks.txt exists"; else fail "D1 runner-tasks.txt exists" "missing"; fi

mcp=$(cat "$MACA/mac-config/test-mac-one/mcp-servers.txt" 2>/dev/null)
has  "D2 mcp-servers.txt has the stub's server names"     "$mcp" "omni-server"
rtasks=$(cat "$MACA/mac-config/test-mac-one/runner-tasks.txt" 2>/dev/null)
has  "D3 runner-tasks.txt has the task NAME"              "$rtasks" "task-one"
has  "D3 runner-tasks.txt has the cron"                   "$rtasks" "0 5 * * *"
has  "D3 runner-tasks.txt has enabled=true"                "$rtasks" "true"
hasnt "D4 runner-tasks.txt NEVER carries anything prompt-shaped" "$rtasks" "Steps, in order"
envv=$(cat "$MACA/mac-config/test-mac-one/env-vars.txt" 2>/dev/null)
has  "D5 env-vars.txt lists names"                        "$envv" "LOFTY_API_KEY"
hasnt "D5 env-vars.txt never a value"                      "$envv" "not-a-real-secret-value"

( cd "$MACA" && git log --oneline -1 ) > "$ROOT/gitlog"
has  "D6 export committed locally"                        "$(cat "$ROOT/gitlog")" "mac-sync export"
has  "D7 export does NOT push by default"                 "$OUT" "not pushed"
( cd "$MACA" && git log origin/master --oneline -1 2>/dev/null ) > "$ROOT/originlog" || true
hasnt "D7 confirmed: origin has no export commit yet"      "$(cat "$ROOT/originlog" 2>/dev/null)" "mac-sync export"

run_a export
eq   "D8 exporting again with no changes -> still exits 0" "$RC" "0"
has  "D8 says nothing to commit"                            "$OUT" "nothing to commit"

run_a export --push
eq   "D9 export --push exits 0"                          "$RC" "0"
has  "D9 says pushed"                                     "$OUT" "pushed"
( cd "$MACA" && git log origin/master --oneline -1 2>/dev/null ) > "$ROOT/originlog2"
has  "D9 confirmed on the remote"                           "$(cat "$ROOT/originlog2")" "mac-sync export"

# ================================================================== E. diff
sect "E. diff"

run_b pull
eq   "E1 setup: MacB pulls MacA's export"                 "$RC" "0"
printf 'test-mac-two\n' > "$HOMEB/.config/claude-runner/id"
printf 'peer\n' > "$HOMEB/.config/claude-runner/role"
run_b diff
eq   "E2 diff exits 0 when there is exactly one other Mac to compare" "$RC" "0"
has  "E2 names who it compared against"                   "$OUT" "test-mac-one"

mkdir -p "$HOMEB/.claude/skills/only-on-b"
run_b diff
# MacA also picked up .env files in section B's fixtures that MacB never got, so a real (and correct) gap
# is expected there; the point of this assertion is the SKILLS category specifically, before E4 gives MacA
# a skill MacB genuinely lacks.
hasnt "E3 no skills gap yet: MacB already has its own skill, nothing missing there" "$OUT" "skills — this Mac lacks"

# give MacA an extra skill MacB does not have, re-export, MacB re-pulls
mkdir -p "$HOMEA/.claude/skills/extra-on-a"
printf -- '---\nname: extra-on-a\ndescription: x\n---\n' > "$HOMEA/.claude/skills/extra-on-a/SKILL.md"
run_a export --push
run_b pull
run_b diff
has  "E4 reports the skill MacB lacks"                    "$OUT" "extra-on-a"

# role/vault mismatch reporting
printf 'standby\n' > "$HOMEB/.config/claude-runner/role"
run_b diff
has  "E5 reports a role mismatch"                         "$OUT" "role — differs"

printf 'no-such-machine\n' | : # noop, just documents intent
run_b diff no-such-machine
eq   "E6 an explicit but unknown id -> exits 1"           "$RC" "1"
has  "E6 says why"                                         "$ERR" "no manifest"

rm -rf "$MACA/mac-config" 2>/dev/null
mkdir -p "$ROOT/nomanifest"
( cd "$ROOT" && git init -q -b master onlyme >/dev/null 2>&1 )
( cd "$ROOT/onlyme" && git config user.email x@example.com && git config user.name X && echo hi > R.md && git add -A && git commit -qm init )
( cd "$ROOT/onlyme" && HOME="$HOMEB" PATH="$BIN:$PATH" MAC_SYNC_REPO_DIR="$ROOT/onlyme" bash "$SCRIPT" diff >"$ROOT/out" 2>"$ROOT/err" )
RC=$?; ERR=$(cat "$ROOT/err")
eq   "E7 no mac-config directory at all -> refuses, exits 1" "$RC" "1"
has  "E7 says why"                                          "$ERR" "run 'export'"

# ================================================================== Z. isolation
sect "Z. isolation — the repo this file lives in"
if [ -z "$HOST" ]; then
  pass "Z1 not run from inside a git repo — nothing to protect"
else
  eq   "Z1 HEAD, reflog, stash and rebase/merge state unchanged" "$(host_state)" "$HOST_BEFORE"
fi

# ================================================================== summary
printf '\n------------------------------------------------------------\n'
printf 'pass %s   FAIL %s\n' "$N_PASS" "$N_FAIL"
if [ "$N_FAIL" -gt 0 ]; then printf 'failed:%s\n' "$FAILED"; exit 1; fi
exit 0
