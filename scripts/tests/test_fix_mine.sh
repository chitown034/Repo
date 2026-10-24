#!/bin/bash
# tests for scripts/fix-mine.sh: secrets land only in the env file (mode 600), never on stdout; --check changes nothing.
set -u
cd "$(dirname "$0")/../.." || exit 1
fail=0; pass=0
ok()   { pass=$((pass+1)); }
bad()  { fail=$((fail+1)); echo "FAIL: $*"; }
T=$(mktemp -d); export HOME="$T"
# 1. --check under an empty home: no prompt, no file, exit 0, report present
out=$(FIX_MINE_TTY=/dev/null bash scripts/fix-mine.sh --check 2>&1); rc=$?
[ $rc -eq 0 ] && ok || bad "--check exit $rc"
printf '%s' "$out" | grep -q "REPORT" && ok || bad "--check prints no REPORT"
[ -e "$T/.config" ] && bad "--check created files" || ok
# 2. set_key: writes VAR=value mode 600, skips when present, replaces an existing line, Enter skips
export FIX_MINE_NO_MAIN=1
tty=$(mktemp); printf 'sekrit-value\n' > "$tty"
# shellcheck disable=SC1091
FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_key "$HOME/.config/lofty/.env" LOFTY_API_KEY "Lofty"' >/dev/null 2>"$T/err"
grep -q '^LOFTY_API_KEY=sekrit-value$' "$T/.config/lofty/.env" && ok || bad "key not written"
[ "$(stat -c %a "$T/.config/lofty/.env" 2>/dev/null || stat -f %Lp "$T/.config/lofty/.env")" = "600" ] && ok || bad "env file is not mode 600"
grep -q "sekrit" "$T/err" && bad "secret leaked to stderr" || ok
printf 'other\n' > "$tty"
FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_key "$HOME/.config/lofty/.env" LOFTY_API_KEY "Lofty"; echo rc=$?' 2>/dev/null | grep -q "rc=0" && ok || bad "present key should return 0 without asking"
grep -q '^LOFTY_API_KEY=sekrit-value$' "$T/.config/lofty/.env" && ok || bad "present key was overwritten"
printf '\n' > "$tty"
FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_key "$HOME/.config/tidycal/.env" TIDYCAL_TOKEN "TidyCal"; echo rc=$?' 2>/dev/null | grep -q "rc=1" && ok || bad "Enter should skip with rc 1"
[ -e "$T/.config/tidycal/.env" ] && bad "Enter created a file" || ok
printf 'second\n' > "$tty"
mkdir -p "$T/.config/arive"; printf 'ARIVE_CLIENT_ID=old\nARIVE_API_KEY=keep\n' > "$T/.config/arive/.env"
FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_key "$HOME/.config/arive/.env" ARIVE_SECRET_KEY "Arive"' >/dev/null 2>&1
grep -q '^ARIVE_API_KEY=keep$' "$T/.config/arive/.env" && grep -q '^ARIVE_SECRET_KEY=second$' "$T/.config/arive/.env" && [ "$(wc -l < "$T/.config/arive/.env")" -eq 3 ] && ok || bad "adding a key lost another line"
# 2b. step_runner on a real `runnerctl status` paste with a stub runnerctl: right names run, no state words, no retired task
mkdir -p "$T/bin"; cat > "$T/bin/runnerctl" <<'STUB'
#!/bin/bash
case "$1" in
  status) cat "$FIX_MINE_STATUS_FIXTURE" ;;
  pause|run) echo "$1 $2" >> "$FIX_MINE_CALLS" ;;
esac
STUB
chmod +x "$T/bin/runnerctl"
cat > "$T/status.txt" <<'FIX'
updated 2026-10-23T13:01:25 · CLI logged in · running steve-twin-sweep · waiting none
       brain-weekly-verify          0 16 * * 0       next 2026-10-25T16:00     last error    2026-10-11T20:13
       calendar-daily-sync          35 6,17 * * *    next 2026-10-23T17:35     last ok       2026-10-23T06:38
  off  r8-apple-health-snapshot     10 5,21 * * *    next 2026-10-23T21:10     last ok       2026-10-23T05:12
  off  r9-feed-freshness-sweep      0 4 * * 0        next 2026-10-25T04:00     last error    2026-10-11T14:05
  RUN  steve-twin-sweep             55 12 * * 1-5    next 2026-10-26T12:55     last ok       2026-10-22T18:38
       strava-daily-sync            20 5 * * *       next 2026-10-24T05:20     last error    2026-10-23T05:24
       toolkit-deck-sync            15 6 * * *       next 2026-10-24T06:15     last error    2026-10-23T06:25
  BADZ some-broken-tz-task         5 5 * * *        next -                    last error    2026-10-20T05:05
  (runnerctl list shows every task; NOAL = no allow-list yet; BADZ = its tz cannot be loaded, so it does not run)
FIX
: > "$T/calls"
PATH="$T/bin:$PATH" FIX_MINE_STATUS_FIXTURE="$T/status.txt" FIX_MINE_CALLS="$T/calls" FIX_MINE_TTY=/dev/null \
  bash -c '. scripts/fix-mine.sh; step_runner; printf "%s" "$DONE"' >/dev/null 2>&1
grep -qx "pause strava-daily-sync" "$T/calls" && ok || bad "strava-daily-sync (not off) was not paused"
grep -q "pause r9-feed-freshness-sweep" "$T/calls" && bad "already-off task paused again" || ok
grep -qx "run brain-weekly-verify" "$T/calls" && grep -qx "run toolkit-deck-sync" "$T/calls" && ok || bad "errored tasks not re-run"
grep -qE "run (ok|off|RUN|updated|BADZ|NOAL|some-broken-tz-task)$" "$T/calls" && bad "a marker word or a BADZ task was run" || ok
grep -q "run r9-feed-freshness-sweep" "$T/calls" && bad "paused task re-run" || ok
grep -q "run strava-daily-sync" "$T/calls" && bad "a task paused by this run was then re-run" || ok
# 2c. set_keychain with a stub `security`: present item -> no prompt; new item stored with -w from the hidden value; Enter skips
cat > "$T/bin/security" <<'STUB'
#!/bin/bash
case "$1" in
  find-generic-password) grep -q "item=$5" "$FIX_MINE_KC" 2>/dev/null ;;
  add-generic-password) echo "item=$6 value=$8" >> "$FIX_MINE_KC" ;;
esac
STUB
chmod +x "$T/bin/security"; : > "$T/kc"; printf 'tok-123\n' > "$tty"
PATH="$T/bin:$PATH" FIX_MINE_KC="$T/kc" FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_keychain vanessa-discord-bot-token "Discord"; echo rc=$?' 2>"$T/err2" | grep -q "rc=0" && ok || bad "keychain store failed"
grep -q "item=vanessa-discord-bot-token value=tok-123" "$T/kc" && ok || bad "token not stored via security add-generic-password"
grep -q "tok-123" "$T/err2" && bad "token leaked to stderr" || ok
printf 'other\n' > "$tty"
PATH="$T/bin:$PATH" FIX_MINE_KC="$T/kc" FIX_MINE_TTY=$tty bash -c '. scripts/fix-mine.sh; set_keychain vanessa-discord-bot-token "Discord"; echo rc=$?' 2>/dev/null | grep -q "rc=0" && [ "$(grep -c vanessa-discord-bot-token "$T/kc")" = 1 ] && ok || bad "present item was asked again or stored twice"
# 2d. the REPORT catalog prints shapes, never values (validator P04-F1)
mkdir -p "$T/Applications/claude-runner"
cat > "$T/Applications/claude-runner/schedule.json" <<'FIX'
{"tasks":[{"name":"vanessa-imessage-inbox","cron":"*/10 * * * *","model":"claude-sonnet-5","timeout":600,"env":{"DISCORD_BOT_TOKEN":"MTA0SECRETTOKENVALUE1234567890abcdefghijklmnopqrstuvwxyz"},"api_key":"sk-SECRETKEY-0000000000","prompt":"Call Mike P. at 619-555-0101 about the house","allowedTools":["Artifact"]}]}
FIX
out=$(HOME="$T" FIX_MINE_TTY=/dev/null bash -c '. scripts/fix-mine.sh; runner_catalog >/dev/null 2>&1; printf "%s" "$CATALOG"' 2>/dev/null)
printf '%s' "$out" | grep -q "vanessa-imessage-inbox" && printf '%s' "$out" | grep -q '"model": "claude-sonnet-5"' && ok || bad "catalog lost the safe keys"
printf '%s' "$out" | grep -qE "SECRET|619-555|Mike|MTA0" && bad "catalog printed a value it must not" || ok
printf '%s' "$out" | grep -q '"api_key": "<str' && printf '%s' "$out" | grep -q '"prompt": "<str' && ok || bad "unsafe keys not reduced to shapes"
# 3. the script never echoes a value it was given (grep the whole file for a read without -s)
grep -n 'read -r [a-z]' scripts/fix-mine.sh | grep -v -- '-rs' | grep -q . && bad "a read without -s found" || ok
rm -rf "$T" "$tty"
echo "fix-mine tests: $pass passed, $fail failed"; [ $fail -eq 0 ]
