#!/bin/bash
# connect-all-tests.sh - stubbed tests for connect-all.sh's runner_fix and keep_awake (runs on Linux or macOS).
set -u
cd "$(dirname "$0")" || exit 1
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/bin" "$T/home"
FUNCS="$(sed -n '/^have()/p;/^RUNNER_OUT=/p;/^runner_fix() {/,/^}/p;/^keep_awake() {/,/^}/p;/^repo_sync_agent() {/,/^}/p;/^laya_venv() {/,/^}/p;/^laya_connect() {/,/^}/p;/^JARVIS_MODEL=/p;/^jarvis_db() {/,/^}/p;/^jarvis_engine() {/,/^}/p;/^orca_app() {/,/^}/p;/^orca_connect() {/,/^}/p;/^anydesk_app() {/,/^}/p;/^anydesk_connect() {/,/^}/p;/^gondola_mcp() {/,/^}/p;/^LOFTY_VENV=/p;/^lofty_connect() {/,/^}/p' connect-all.sh)"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then pass=$((pass+1)); echo "ok   $1"; else fail=$((fail+1)); echo "FAIL $1 (expected rc $3, got $2)"; fi; }
stub_runner() { # <restart exit code> <status text after restart>
  cat > "$T/bin/runnerctl" <<S
#!/bin/sh
case "\$1" in
  restart) echo restarted; [ -f "$T/restarted" ] || touch "$T/restarted"; exit $1 ;;
  status) if [ -f "$T/restarted" ]; then echo "$2"; else echo "logged in; running: fabric-deck-sync"; fi ;;
  list) echo "task ok" ;;
esac
S
  chmod +x "$T/bin/runnerctl"; rm -f "$T/restarted"
}
run_fn() { PATH="$T/bin:$PATH" HOME="$T/home" LOG="$T/log" REPO_DIR="$PWD" bash -c "sleep() { \${FAKESLEEP:-:}; }; MACSYNC_OLD=0; ANYDESK_ID=; $FUNCS
$1" >"$T/out" 2>&1; echo $?; }

stub_runner 0 "logged in; idle";            check "hung runner is restarted and passes"      "$(run_fn runner_fix)" 0
stub_runner 1 "logged in; idle";            check "failed restart lands in FAIL"            "$(run_fn runner_fix)" 1
stub_runner 0 "not running";                check "runner still stopped lands in FAIL"      "$(run_fn runner_fix)" 1
stub_runner 0 "not logged in";              check "logged-out runner lands in FAIL"         "$(run_fn runner_fix)" 1
run_fn 'RUNNER_OUT=0; runner_fix; echo "flag=$RUNNER_OUT"' >/dev/null; grep -q "flag=1" "$T/out"; check "logged-out runner sets RUNNER_OUT" "$?" 0
stub_runner 1 "logged in; idle"; run_fn 'RUNNER_OUT=0; runner_fix; echo "flag=$RUNNER_OUT"' >/dev/null; grep -q "flag=0" "$T/out"; check "failed restart does not claim sign-out" "$?" 0
grep -qE "login|save-token" "$T/out"; check "runner_fix never runs login or save-token" "$?" 1

printf '#!/bin/sh\n[ "$1" = list ] && echo "{ \\"PID\\" = 42; }"\nexit 0\n' > "$T/bin/launchctl"; chmod +x "$T/bin/launchctl"
check "keep-awake loads and is confirmed by PID"    "$(run_fn keep_awake)" 0
printf '#!/bin/sh\n[ "$1" = list ] && echo "{ }"\nexit 0\n' > "$T/bin/launchctl"
check "keep-awake without a PID lands in FAIL"       "$(run_fn keep_awake)" 1
printf '#!/bin/sh\n[ "$1" = load ] && exit 5\nexit 0\n' > "$T/bin/launchctl"
check "launchctl load failure lands in FAIL"         "$(run_fn keep_awake)" 1

# ---- 1b repo-sync LaunchAgent
printf '#!/bin/sh\necho "$@" >> "%s/launchctl.calls"\nexit 0\n' "$T" > "$T/bin/launchctl"; chmod +x "$T/bin/launchctl"
check "repo-sync agent loads"                        "$(run_fn repo_sync_agent)" 0
grep -q "scripts/repo-sync.sh" "$T/home/Library/LaunchAgents/com.vanessa.repo-sync.plist" && grep -q "<integer>1800</integer>" "$T/home/Library/LaunchAgents/com.vanessa.repo-sync.plist"
check "repo-sync plist runs repo-sync every 30 min"  "$?" 0
printf '#!/bin/sh\n[ "$1" = load ] && exit 5\nexit 0\n' > "$T/bin/launchctl"
check "repo-sync agent load failure lands in FAIL"   "$(run_fn repo_sync_agent)" 1
printf '#!/bin/sh\nexit 0\n' > "$T/bin/launchctl"

# ---- 6 Laya
LV="$T/home/Applications/laya-venv/bin"; mkdir -p "$LV"
printf '#!/bin/sh\necho "ROUTE brain_route=mortgage_program p=0.81"\n' > "$LV/python"; printf '#!/bin/sh\n' > "$LV/laya-mcp-server"; chmod +x "$LV/python" "$LV/laya-mcp-server"
printf '#!/bin/sh\necho "$@" >> "%s/claude.calls"\nexit 0\n' "$T" > "$T/bin/claude"; chmod +x "$T/bin/claude"; rm -f "$T/claude.calls"
check "laya: registers MCP and real engine answers"  "$(run_fn laya_connect)" 0
grep -q "mcp add -s user laya --env LAYA_DEVICE=cpu -- $LV/laya-mcp-server" "$T/claude.calls"
check "laya: registered for all projects, from its venv" "$?" 0
printf '#!/bin/sh\n[ "$2" = list ] && echo "laya: %s - Connected"\necho "$@" >> "%s/claude.calls"\n' "$LV/laya-mcp-server" "$T" > "$T/bin/claude"; rm -f "$T/claude.calls"
run_fn laya_connect >/dev/null; grep -q "mcp add" "$T/claude.calls"
check "laya: already registered -> not added twice"  "$?" 1
printf '#!/bin/sh\necho "httpx.ProxyError: 403"\n' > "$LV/python"
check "laya: engine not answering lands in FAIL"     "$(run_fn laya_connect)" 1
rm -rf "$T/home/Applications/laya-venv"
check "laya: not installed, no uv/brew -> FAIL"      "$(PATH="$T/bin:/usr/bin:/bin" run_fn laya_connect)" 1

# ---- 6c Orca

# ---- 6a jarvis engine (ollama + model + openjarvis index)
stub_ollama() { # <models text>  (ollama present, serving)
  printf '#!/bin/sh\ncase "$1" in list) printf "%%s\\n" "%s" ;; pull) echo "$@" >> "%s/ollama.calls" ;; esac\nexit 0\n' "$1" "$T" > "$T/bin/ollama"; chmod +x "$T/bin/ollama"; rm -f "$T/ollama.calls"
}
printf '#!/bin/sh\necho "$@" >> "%s/runner.calls"\ncase "$1" in list) echo "openjarvis ok" ;; run) mkdir -p "%s/home/.openjarvis"; echo x > "%s/home/.openjarvis/memory.db" ;; esac\nexit 0\n' "$T" "$T" "$T" > "$T/bin/runnerctl"; chmod +x "$T/bin/runnerctl"
rm -rf "$T/home/.openjarvis"; rm -f "$T/runner.calls"
stub_ollama "NAME ID
llama3.1:8b abc"
check "jarvis: no index and no opt-in -> FAIL, names the command" "$(run_fn jarvis_engine)" 1
[ ! -f "$T/runner.calls" ] || ! grep -q "^run" "$T/runner.calls"; check "jarvis: runner task never run without JARVIS_BUILD_INDEX=1" "$?" 0
check "jarvis: opt-in builds the index with the openjarvis task" "$(JARVIS_BUILD_INDEX=1 run_fn jarvis_engine)" 0
grep -q "^run openjarvis" "$T/runner.calls";                     check "jarvis: runnerctl run openjarvis used"      "$?" 0
grep -qiE "login|save-token" "$T/runner.calls";                  check "jarvis: never logs in"                      "$?" 1
[ ! -f "$T/ollama.calls" ];                                      check "jarvis: model not pulled twice"             "$?" 0
stub_ollama "NAME ID
llama3.1:8b-instruct-q8_0 def"
check "jarvis: index present -> no runner call"      "$(rm -f "$T/runner.calls"; run_fn jarvis_engine)" 0
grep -qx "pull llama3.1:8b" "$T/ollama.calls";                   check "jarvis: similar tag is not the model - exact tag pulled" "$?" 0
[ ! -f "$T/runner.calls" ] || ! grep -q "^run" "$T/runner.calls"; check "jarvis: existing index not rebuilt"         "$?" 0
rm -f "$T/bin/ollama"
check "jarvis: no ollama and no brew -> FAIL"        "$(PATH="$T/bin:/usr/bin:/bin" run_fn jarvis_engine)" 1
printf '#!/bin/sh\necho "$@" >> "%s/brew.calls"\ncase "$*" in *--cask*ollama*) cp "%s/ollama.stub" "%s/bin/ollama"; chmod +x "%s/bin/ollama" ;; esac\nexit 0\n' "$T" "$T" "$T" "$T" > "$T/bin/brew"; chmod +x "$T/bin/brew"
printf '#!/bin/sh\ncase "$1" in list) printf "NAME ID\\nllama3.1:8b abc\\n" ;; esac\nexit 0\n' > "$T/ollama.stub"; printf '#!/bin/sh\nexit 0\n' > "$T/bin/open"; chmod +x "$T/bin/open"; rm -f "$T/brew.calls"
mkdir -p "$T/home/.openjarvis"; echo x > "$T/home/.openjarvis/memory.db"
check "jarvis: no ollama + brew -> prebuilt cask installed, passes" "$(run_fn jarvis_engine)" 0
grep -q "install --cask ollama" "$T/brew.calls";                 check "jarvis: the cask (prebuilt app) is tried first" "$?" 0
rm -f "$T/bin/ollama" "$T/bin/open"

export ORCA_APP="$T/apps/Orca.app"
printf '#!/bin/sh\necho "$@" >> "%s/open.calls"\n' "$T" > "$T/bin/open"
printf '#!/bin/sh\necho com.stablyai.orca\n' > "$T/bin/defaults"
printf '#!/bin/sh\necho "$@" >> "%s/brew.calls"\ncase "$*" in *orca*) mkdir -p "%s" ;; *anydesk*) mkdir -p "%s/apps/AnyDesk.app/Contents/MacOS" ;; esac\n' "$T" "$ORCA_APP" "$T" > "$T/bin/brew"
chmod +x "$T/bin/open" "$T/bin/defaults" "$T/bin/brew"
check "orca: missing -> installed from the official tap" "$(run_fn orca_connect)" 0
grep -q "install --cask stablyai/orca/orca" "$T/brew.calls"; check "orca: brew cask stablyai/orca/orca used" "$?" 0
grep -q -- "$ORCA_APP $PWD" "$T/open.calls";               check "orca: opened on the Repo folder"         "$?" 0
grep -qiE "pair|login|sign" "$T/open.calls" "$T/brew.calls"; check "orca: never pairs or signs in"            "$?" 1
rm -f "$T/brew.calls"; check "orca: already installed -> no brew"   "$(run_fn orca_connect)" 0
printf '#!/bin/sh\necho "123 orca serve --grant-desktop-control"\n' > "$T/bin/ps"; chmod +x "$T/bin/ps"
check "orca: doctor finds --grant-desktop-control -> FAIL" "$(run_fn orca_connect)" 1
printf '#!/bin/sh\necho "123 orca serve"\n' > "$T/bin/ps"
check "orca: doctor clean -> ok"                            "$(run_fn orca_connect)" 0
rm -f "$T/bin/ps"
[ ! -f "$T/brew.calls" ]; check "orca: no reinstall"   "$?" 0
rm -rf "$ORCA_APP"; mv "$T/bin/brew" "$T/brew.off"
check "orca: missing and no Homebrew -> FAIL"        "$(PATH="$T/bin:/usr/bin:/bin" run_fn orca_connect)" 1
mv "$T/brew.off" "$T/bin/brew"

# ---- 6d AnyDesk
export ANYDESK_APP="$T/apps/AnyDesk.app"; rm -f "$T/brew.calls"
check "anydesk: missing -> installed from the official cask" "$(run_fn 'anydesk_connect && echo "ID=$ANYDESK_ID"')" 0
grep -q "install --cask anydesk" "$T/brew.calls"; check "anydesk: brew cask anydesk used" "$?" 0
printf '#!/bin/sh\necho "$@" >> "%s/anydesk.calls"\n[ "$1" = --get-id ] && echo "123 456 789"\n' "$T" > "$ANYDESK_APP/Contents/MacOS/AnyDesk"; chmod +x "$ANYDESK_APP/Contents/MacOS/AnyDesk"
FAKESLEEP="command sleep 0.2" run_fn 'anydesk_connect && echo "ID=$ANYDESK_ID"' >/dev/null; grep -q "ID=123456789" "$T/out"
check "anydesk: reads this Mac's ID into the report" "$?" 0
grep -v -- "--get-id" "$T/anydesk.calls" | grep -q .; check "anydesk: binary only ever asked for --get-id" "$?" 1
printf '#!/bin/sh\necho "not ready"\n' > "$ANYDESK_APP/Contents/MacOS/AnyDesk"
run_fn 'anydesk_connect && echo "ID=[$ANYDESK_ID]"' >/dev/null; grep -q "ID=\[\]" "$T/out"
check "anydesk: unreadable ID -> blank, still ok"    "$?" 0
rm -rf "$ANYDESK_APP"; mv "$T/bin/brew" "$T/brew.off"
check "anydesk: missing, no Homebrew -> FAIL with URL" "$(PATH="$T/bin:/usr/bin:/bin" run_fn anydesk_connect)" 1
grep -q "anydesk.com/en/downloads/mac-os" "$T/out"; check "anydesk: prints the official download URL" "$?" 0
grep -vE '^[[:space:]]*(#|say )' connect-all.sh | grep -qiE -- '--set-password|unattended.*(on|enable)|--with-password'
check "connect-all never sets an AnyDesk password"   "$?" 1

# gondola: registers once, idempotent, fails honestly when the claude CLI is missing
cat > "$T/bin/claude" <<'S'
#!/bin/sh
case "$1 $2" in
  "mcp list") [ -f "$GONDOLA_FILE" ] && echo "gondola: https://mcp.gondola.ai/mcp (HTTP)"; exit 0 ;;
  "mcp add") echo "$*" >> "$GONDOLA_FILE.args"; touch "$GONDOLA_FILE"; exit 0 ;;
esac
S
chmod +x "$T/bin/claude"; export GONDOLA_FILE="$T/gondola"; rm -f "$GONDOLA_FILE"
check "gondola: registers the MCP"                       "$(run_fn gondola_mcp)" 0
grep -q -- "--transport http --scope user gondola https://mcp.gondola.ai/mcp" "$GONDOLA_FILE.args"; check "gondola: official URL, user scope" "$?" 0
check "gondola: second run is a no-op"                   "$(run_fn gondola_mcp)" 0
[ "$(wc -l < "$GONDOLA_FILE.args")" -eq 1 ];              check "gondola: added only once" "$?" 0
rm -f "$T/bin/claude"
check "gondola: missing claude CLI lands in FAIL"        "$(PATH="$T/bin:/usr/bin:/bin" run_fn gondola_mcp)" 1

# lofty: key present + CLI works -> pass (read-only GET calls only); key refused -> FAIL; never writes the key twice
mkdir -p "$T/home/.config/lofty" "$T/home/Applications/cli-anything-harnesses/.venv/bin"
printf 'LOFTY_API_KEY=test-not-real\n' > "$T/home/.config/lofty/.env"
LCLI="$T/home/Applications/cli-anything-harnesses/.venv/bin/cli-anything-lofty"
printf '#!/bin/sh\necho "$*" >> "%s"\n[ "$1" = me ] && exit ${LOFTY_ME_RC:-0}\necho "New Lead: 12"\n' "$T/lofty.calls" > "$LCLI"; chmod +x "$LCLI"
check "lofty: working key passes"                         "$(run_fn lofty_connect)" 0
grep -qvE '^(me|leads stage-totals)$' "$T/lofty.calls"; check "lofty: only GET-style commands were run (me, stage-totals)" "$?" 1
check "lofty: refused key lands in FAIL"                  "$(LOFTY_ME_RC=1 run_fn lofty_connect)" 1
[ "$(grep -c LOFTY_API_KEY "$T/home/.config/lofty/.env")" = 1 ]; check "lofty: existing key file left as is" "$?" 0

echo "connect-all tests: $pass passed, $fail failed"; [ "$fail" = 0 ]
