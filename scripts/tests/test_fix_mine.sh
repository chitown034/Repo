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
# 2e. step_voice: thread allow-list
mkdir -p "$T/Repo"   # step_voice cds into $HOME/Repo; an empty folder here means no MAC-SETUP.sh and no SDK step from VANESSA_THREAD (valid id appended once, junk refused), Inkbox key hidden -> ~/.inkbox/config 600
printf 'ink-key-xyz\n' > "$tty"
VANESSA_THREAD=aa1a9d19-c7db-4dea-b7c8-f34999e58510 FIX_MINE_TTY=$tty FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice; printf "%s" "$DONE$SKIP"' > "$T/voice.out" 2>"$T/voice.err"
grep -qx "aa1a9d19-c7db-4dea-b7c8-f34999e58510" "$T/.config/inkbox/voice-allow" && ok || bad "thread not allow-listed"
grep -q "^api_key = ink-key-xyz$" "$T/.inkbox/config" && ok || bad "inkbox key not written in the SDK's format"
[ "$(stat -c %a "$T/.inkbox/config" 2>/dev/null || stat -f %Lp "$T/.inkbox/config")" = "600" ] && ok || bad "inkbox config not mode 600"
grep -q "ink-key" "$T/voice.err" "$T/voice.out" && bad "inkbox key leaked to output" || ok
VANESSA_THREAD=aa1a9d19-c7db-4dea-b7c8-f34999e58510 FIX_MINE_TTY=/dev/null FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice' >/dev/null 2>&1
[ "$(grep -c . "$T/.config/inkbox/voice-allow")" = 1 ] && ok || bad "thread allow-listed twice"
VANESSA_THREAD="not-an-id; rm -rf /" FIX_MINE_TTY=/dev/null FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice; printf "%s" "$SKIP"' 2>/dev/null | grep -q "not a conversation id" && [ "$(grep -c . "$T/.config/inkbox/voice-allow")" = 1 ] && ok || bad "junk thread id accepted"
# 2f. voice hardening (validator pass 4): a newline-smuggled second id is refused; other config lines survive; Enter writes nothing
VANESSA_THREAD="$(printf 'aa1a9d19-c7db-4dea-b7c8-f34999e58510\nbbbbbbbb-cccc-dddd-eeee-ffffffffffff')" FIX_MINE_TTY=/dev/null FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice; printf "%s" "$SKIP"' 2>/dev/null | grep -q "not a conversation id" && [ "$(grep -c . "$T/.config/inkbox/voice-allow")" = 1 ] && ok || bad "newline-smuggled thread id accepted"
printf 'base_url = https://example.test\n' > "$T/.inkbox/config"; printf '  ink-key-2  \n' > "$tty"
FIX_MINE_TTY=$tty FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice' >/dev/null 2>&1
grep -q '^base_url = https://example.test$' "$T/.inkbox/config" && grep -q '^api_key = ink-key-2$' "$T/.inkbox/config" && ok || bad "config lines lost or key not trimmed"
printf 'base_url = x\n' > "$T/.inkbox/config"; printf '\n' > "$tty"
FIX_MINE_TTY=$tty FIX_MINE_UNAME=Darwin bash -c '. scripts/fix-mine.sh; step_voice' >/dev/null 2>&1
[ "$(wc -l < "$T/.inkbox/config")" -eq 1 ] && ok || bad "Enter at the key prompt changed the config"
# 2g. SkySlope hint names the pair that is actually missing (validator P11-F1)
mkdir -p "$T/.config/skyslope" "$T/Repo/integrations/skyslope"; cp integrations/skyslope/skyslope_cli.py "$T/Repo/integrations/skyslope/"
printf 'SKYSLOPE_ACCESS_KEY=a\nSKYSLOPE_ACCESS_SECRET=b\n' > "$T/.config/skyslope/.env"
HOME="$T" FIX_MINE_TTY=/dev/null bash -c '. scripts/fix-mine.sh; step_keys >/dev/null 2>&1; printf "%s" "$SKIP"' 2>/dev/null | grep -q "Client ID/Secret pair is issued by SkySlope" && ok || bad "missing client pair not named"
printf 'SKYSLOPE_CLIENT_ID=a\nSKYSLOPE_CLIENT_SECRET=b\n' > "$T/.config/skyslope/.env"
HOME="$T" FIX_MINE_TTY=/dev/null bash -c '. scripts/fix-mine.sh; step_keys >/dev/null 2>&1; printf "%s" "$SKIP"' 2>/dev/null | grep -q "My Account -> Integrations" && ok || bad "missing access pair not named"
rm -f "$T/.config/skyslope/.env"
# 2h. step_hours: only the message tasks go to window 00-24, proven by `runnerctl dry` on each; a refusal restores THIS run's copy;
#     --check writes nothing; unknown window formats are reported, never "already"; dict-keyed files work; no value is ever printed
cat > "$T/bin/runnerctl" <<'STUB'
#!/bin/bash
case "$1" in
  status) [ -n "${FIX_MINE_STATUS_FIXTURE:-}" ] && cat "$FIX_MINE_STATUS_FIXTURE"; exit "${FIX_MINE_STATUS_RC:-0}" ;;
  pause|run) echo "$1 $2" >> "$FIX_MINE_CALLS" ;;
  dry) w="${FIX_MINE_DRY_WINDOW:-$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); t=d.get("tasks",d); e=[x for x in t if x.get("name")==sys.argv[2]][0] if isinstance(t,list) else t[sys.argv[2]]; print(e.get("window","07-22"))' "$HOME/Applications/claude-runner/schedule.json" "$2")}"
       echo "task=$2 model=claude-sonnet-5 max_turns=25 timeout=600 window=$w in_window=1 cwd=/x" ;;
esac
STUB
SCH="$T/Applications/claude-runner/schedule.json"
win() { python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); t=d.get("tasks",d); e=[x for x in t if x.get("name")==sys.argv[2]][0] if isinstance(t,list) else t[sys.argv[2]]; print(e.get("window","NOKEY"))' "$SCH" "$1" 2>/dev/null || echo ABSENT; }
hours() { PATH="$T/bin:$PATH" FIX_MINE_TTY=/dev/null bash -c '. scripts/fix-mine.sh; '"${1:-}"' step_hours; printf "%s|%s" "$DONE" "$SKIP"' 2>"$T/hours.err"; }
cat > "$SCH" <<'FIX'
{"tasks":[{"name":"vanessa-imessage-inbox","cron":"*/10 * * * *","window":"07-22","env":{"KEY":"S3CR3T-VALUE"}},{"name":"voice-reply-render","cron":"*/10 * * * *","window":"07-22"},{"name":"nightly-self-test","cron":"0 2 * * *","window":"07-22"}]}
FIX
out=$(hours "CHECK=1;")
[ "$(win vanessa-imessage-inbox)" = "07-22" ] && ok || bad "--check changed the window"
ls "$T/Applications/claude-runner/"schedule.json.* >/dev/null 2>&1 && bad "--check left a backup or a .new file" || ok
out=$(hours)
[ "$(win vanessa-imessage-inbox)" = "00-24" ] && [ "$(win voice-reply-render)" = "00-24" ] && ok || bad "message tasks not widened"
[ "$(win nightly-self-test)" = "07-22" ] && ok || bad "a non-message task was widened"
printf '%s' "$out" | grep -q "day and night" && ok || bad "hours step did not report done"
ls "$T/Applications/claude-runner/"schedule.json.bak-2* >/dev/null 2>&1 && ok || bad "no history backup of schedule.json"
ls "$T/Applications/claude-runner/"schedule.json.bak-run-* "$T/Applications/claude-runner/"schedule.json.new-* >/dev/null 2>&1 && bad "per-run backup or .new file left behind" || ok
grep -q "S3CR3T" "$T/hours.err" && bad "a schedule value leaked to stderr" || ok
printf '%s' "$out" | grep -q "S3CR3T" && bad "a schedule value leaked to the report" || ok
out=$(hours); printf '%s' "$out" | grep -q "already run day and night" && ok || bad "second run did not say already"
# stale-backup sequence (validator P05-F1): MISSING run, tasks registered the same day, then a refused proof -> the new tasks survive
printf '{"tasks":[{"name":"nightly-self-test","window":"07-22"}]}\n' > "$SCH"; rm -f "$T/Applications/claude-runner/"schedule.json.bak-*
out=$(hours); printf '%s' "$out" | grep -q "is registered in schedule.json yet" && ok || bad "unregistered message tasks not explained"
ls "$T/Applications/claude-runner/"schedule.json.bak-* >/dev/null 2>&1 && bad "a MISSING run wrote a backup" || ok
cat > "$SCH" <<'FIX'
{"tasks":[{"name":"nightly-self-test","window":"07-22"},{"name":"vanessa-imessage-inbox","window":"07-22"},{"name":"kapso-inbox-sync","window":"07-22"}]}
FIX
out=$(hours "export FIX_MINE_DRY_WINDOW=07-22;")
[ "$(win vanessa-imessage-inbox)" = "07-22" ] && [ "$(win kapso-inbox-sync)" = "07-22" ] && printf '%s' "$out" | grep -q "did not accept" && ok || bad "a refused window was not restored to this run's copy"
printf '%s' "$out" | grep -q "runnerctl dry vanessa-imessage-inbox did not print" && ok || bad "the refusal does not name the failing check"
out=$(hours "export FIX_MINE_STATUS_RC=1;")
[ "$(win vanessa-imessage-inbox)" = "07-22" ] && [ "$(win kapso-inbox-sync)" = "07-22" ] && printf '%s' "$out" | grep -q "runnerctl status failed" && ok || bad "a status failure did not restore and name itself"
# odd formats (validator P04-F1): never "already"
printf '{"tasks":[{"name":"vanessa-imessage-inbox","window":"7-22"}]}\n' > "$SCH"
out=$(hours); printf '%s' "$out" | grep -q "already" && bad "unparsed window 7-22 reported as already" || ok
printf '%s' "$out" | grep -q 'does not know how to widen — vanessa-imessage-inbox="7-22"' && ok || bad "odd window not named"
printf '{"tasks":[{"name":"vanessa-imessage-inbox","window":"00-24"},{"name":"kapso-inbox-sync","cron":"* * * * *"}]}\n' > "$SCH"
out=$(hours); printf '%s' "$out" | grep -q "kapso-inbox-sync=no window key" && ok || bad "a message task falling back to the runner default reported as already"
[ "$(win vanessa-imessage-inbox)" = "00-24" ] && ok || bad "odd run changed the file"
printf '{"tasks":[{"name":"vanessa-imessage-inbox","cron":"*/10 * * * *"}]}\n' > "$SCH"
out=$(hours); printf '%s' "$out" | grep -q "runner-wide default" && ok || bad "missing window key not explained"
# dict-keyed schedule.json: only the keyed message entry changes, its inner fields survive, the file's other keys survive
printf '{"version":3,"defaults":{"window":"07-22"},"tasks":{"vanessa-imessage-inbox":{"window":"07-22","name":"alias","cron":"*/10 * * * *"},"nightly-self-test":{"window":"07-22"}}}\n' > "$SCH"
out=$(hours); printf '%s' "$out" | grep -q "day and night" && ok || bad "dict-keyed file not handled"
python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); t=d["tasks"]; assert t["vanessa-imessage-inbox"]["window"]=="00-24" and t["vanessa-imessage-inbox"]["name"]=="alias" and t["nightly-self-test"]["window"]=="07-22" and d["defaults"]["window"]=="07-22" and d["version"]==3' "$SCH" 2>/dev/null && ok || bad "dict-keyed write touched the wrong entry"
printf '{"tasks":null}\n' > "$SCH"
out=$(hours); printf '%s' "$out" | grep -q "could not read schedule.json" && ! printf '%s' "$out" | grep -q "json.tool" && ok || bad "bad shape not handled without a value-pasting hint"
rm -f "$T/Applications/claude-runner/"schedule.json.*
# 3. the script never echoes a value it was given (grep the whole file for a read without -s)
grep -n 'read -r [a-z]' scripts/fix-mine.sh | grep -v -- '-rs' | grep -q . && bad "a read without -s found" || ok
rm -rf "$T" "$tty"
echo "fix-mine tests: $pass passed, $fail failed"; [ $fail -eq 0 ]
