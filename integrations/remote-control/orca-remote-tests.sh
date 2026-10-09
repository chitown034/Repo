#!/bin/bash
# Tests for orca-remote.sh with a stub orca in a temp HOME.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="${HERE}/orca-remote.sh"
T="$(mktemp -d "${TMPDIR:-/tmp}/orca-test.XXXXXX")"
trap 'rm -rf "$T"' EXIT
export HOME="$T/home"; mkdir -p "$HOME" "$T/bin"
export STUB_DIR="$T/stubstate"; mkdir -p "$STUB_DIR"
export PATH="$T/bin:/usr/bin:/bin"
export ORCA_REMOTE_ALLOW_NOTTY=1
SECRET="orca://pair?code=TOPSECRETXYZ789"
PASS=0; FAIL=0
ck() { if [ "$1" = 0 ]; then PASS=$((PASS + 1)); printf 'ok   - %s\n' "$2"; else FAIL=$((FAIL + 1)); printf 'FAIL - %s\n' "$2"; fi; }
t() { local d="$1"; shift; if "$@"; then ck 0 "$d"; else ck 1 "$d"; fi; }

cat > "$T/bin/orca" <<'S'
#!/bin/bash
echo "$1 $2" >> "$STUB_DIR/calls.log"
case "$1" in
  --version) echo "1.4.214" ;;
  status) echo "app: ready  runtime: ok"; echo "debug link $LEAKLINE"; exit "${STUB_STATUS_RC:-0}" ;;
  serve) echo "$@" > "$STUB_DIR/serve.args"; echo "bound 0.0.0.0:6768"; echo "pairing: orca://pair?code=SERVEOFFER1" ;;
  environment)
    case "$2" in
      add) # args: add --name N --pairing-code CODE
        echo "$4" > "$STUB_DIR/add.name"; echo "$6" > "$STUB_DIR/secret.seen"
        printf '{"name":"%s"}\n' "$4" > "$STUB_DIR/env.json"; echo "added $6 at 10.9.9.9" ;;
      list) if [ "${3:-}" = "--json" ]; then cat "$STUB_DIR/env.json" 2>/dev/null || echo '[]'
            else echo "other-mac  address=192.168.9.9  pairing=orca://pair?code=ENVSECRET"; fi ;;
      rm) if grep -q "\"$3\"" "$STUB_DIR/env.json" 2>/dev/null; then rm -f "$STUB_DIR/env.json"; else exit 1; fi ;;
    esac ;;
esac
S
cat > "$T/bin/ps" <<'S'
#!/bin/bash
cat "$STUB_DIR/ps.out" 2>/dev/null
S
cat > "$T/bin/ifconfig" <<'S'
#!/bin/bash
printf 'lo0: flags=8049\n\tinet 127.0.0.1 netmask 0xff000000\nen0: flags=8863\n\tinet 192.168.1.23 netmask 0xffffff00\nen1:\n\tinet 8.8.4.4 netmask 0xff\n'
S
chmod +x "$T/bin/"*
export LEAKLINE="$SECRET"

snap() { (cd "$HOME" && find . -print | LC_ALL=C sort); cat "$STUB_DIR/calls.log" 2>/dev/null; }

# 1 dry-run
before="$(snap)"
"$TOOL" --dry-run serve --address 192.168.1.23 </dev/null >"$T/d1" 2>&1
"$TOOL" --dry-run pair </dev/null >"$T/d2" 2>&1
"$TOOL" --dry-run unpair </dev/null >"$T/d3" 2>&1
"$TOOL" --dry-run serve </dev/null >"$T/d4" 2>&1
after="$(snap)"
t "dry-run: no files, orca never called" [ "$before" = "$after" ]
t "dry-run serve shows the command without the grant flag" bash -c "grep -q 'pairing-address 192.168.1.23' '$T/d1' && ! grep -q 'grant-desktop-control\$' '$T/d1' || ! grep -q -- '--grant-desktop-control --' '$T/d1'"
t "dry-run pair never asks for a code" grep -q 'DRY-RUN' "$T/d2"

# 2 serve policy
t "serve refuses --grant-desktop-control" bash -c "'$TOOL' serve --grant-desktop-control --address 192.168.1.23 </dev/null >/dev/null 2>&1; [ \$? = 2 ]"
t "serve refuses the grant flag with =value too" bash -c "'$TOOL' serve --grant-desktop-control=true </dev/null >/dev/null 2>&1; [ \$? = 2 ]"
for bad in 8.8.8.8 example.com 1.2.3.4 172.32.0.1 192.169.1.1 100.128.0.1 wss://proxy.example.com 192.168.1.1/x 999.1.1.1 ""; do
  printf 'y\n' | "$TOOL" serve --address "$bad" >/dev/null 2>&1; rc=$?
  t "serve refuses public/odd address '$bad'" [ "$rc" = 2 ]
done
t "no orca serve was started by any refusal" bash -c "! grep -q '^serve' '$STUB_DIR/calls.log' 2>/dev/null"
for good in 192.168.1.23 10.0.0.5 172.20.1.1 100.101.102.103 mac.local host.tail1234.ts.net; do
  rm -f "$STUB_DIR/serve.args"
  printf 'y\n' | "$TOOL" serve --address "$good" >/dev/null 2>&1
  t "serve accepts private address '$good'" test -f "$STUB_DIR/serve.args"
done
t "serve passes --pairing-address and never the grant flag" bash -c "grep -q -- '--pairing-address host.tail1234.ts.net' '$STUB_DIR/serve.args' && ! grep -q grant '$STUB_DIR/serve.args'"
rm -f "$STUB_DIR/serve.args"
printf 'n\n' | "$TOOL" serve --address 192.168.1.23 >/dev/null 2>&1
t "serve without y does not start" bash -c "! test -f '$STUB_DIR/serve.args'"
rm -f "$STUB_DIR/serve.args"; printf '1\ny\n' | "$TOOL" serve >/dev/null 2>&1
t "serve menu pick 1 chooses the private candidate (public 8.8.4.4 not offered)" grep -q -- '--pairing-address 192.168.1.23' "$STUB_DIR/serve.args"
rm -f "$STUB_DIR/serve.args"; printf '2\ny\n' | "$TOOL" serve >/dev/null 2>&1
t "serve menu pick of the non-existent public entry is refused" bash -c "! test -f '$STUB_DIR/serve.args'"
rm -f "$STUB_DIR/serve.args"; printf 'y\n' | "$TOOL" serve --address 192.168.1.23 --phone >/dev/null 2>&1
t "serve --phone adds --mobile-pairing" grep -q -- '--mobile-pairing' "$STUB_DIR/serve.args"
t "serve refuses when stdout is not a terminal (no override)" bash -c "unset ORCA_REMOTE_ALLOW_NOTTY; printf 'y\n' | '$TOOL' serve --address 192.168.1.23 >/dev/null 2>&1; [ \$? = 2 ]"
t "script never tees and never redirects the exec of orca serve" bash -c "! grep -E '\\btee\\b' '$TOOL' | grep -v '^#' | grep -q . && ! grep -E 'exec .*[>|]' '$TOOL' | grep -q ."
printf 'y\n' | "$TOOL" serve --address 192.168.1.23 >"$T/serve.out" 2>&1
t "serve wrote no file under HOME" bash -c "[ -z \"\$(find '$HOME' -type f | head -1)\" ]"

# 3 pair: hidden prompt, nothing leaks
rm -f "$STUB_DIR/env.json" "$STUB_DIR/secret.seen"
printf 'other-mac\nn\n%s\n' "$SECRET" | "$TOOL" pair >"$T/p0" 2>&1
t "pair without y saves nothing and never reads the code" bash -c "! test -f '$STUB_DIR/secret.seen'"
printf 'other-mac\ny\nhttps://evil.example/x\n' | "$TOOL" pair >"$T/p1" 2>&1; rc=$?
t "pair rejects a non-orca link and does not echo it" bash -c "[ $rc != 0 ] && ! grep -q evil '$T/p1' && ! test -f '$STUB_DIR/secret.seen'"
printf 'Other Mac!\ny\n%s\n' "$SECRET" | "$TOOL" pair >/dev/null 2>&1; t "pair rejects a bad name" bash -c "! test -f '$STUB_DIR/secret.seen'"
printf 'other-mac\ny\n%s\n' "$SECRET" | "$TOOL" pair >"$T/p2" 2>&1; rc=$?
t "pair succeeds and orca received the exact code" bash -c "[ $rc = 0 ] && [ \"\$(cat '$STUB_DIR/secret.seen')\" = '$SECRET' ]"
t "pair name passed through" grep -q '^other-mac$' "$STUB_DIR/add.name"
"$TOOL" status >"$T/s.out" 2>&1; "$TOOL" report >"$T/r.out" 2>&1; "$TOOL" doctor >"$T/dr.out" 2>&1
"$TOOL" unpair other-mac </dev/null >"$T/u.out" 2>&1
printf 'other-mac\ny\n%s\n' "$SECRET" | "$TOOL" pair >>"$T/p2" 2>&1
leak=0
for f in "$T/p0" "$T/p1" "$T/p2" "$T/s.out" "$T/r.out" "$T/dr.out" "$T/u.out"; do
  grep -qE 'TOPSECRET|ENVSECRET|SERVEOFFER|orca://pair|10\.9\.9\.9|192\.168\.9\.9' "$f" && { leak=1; echo "  leak in $f"; }
done
t "no secret/link/address in pair, status, report, doctor, unpair output" [ "$leak" = 0 ]
t "no secret in ANY file under HOME" bash -c "! grep -rIl 'TOPSECRET\|ENVSECRET\|SERVEOFFER\|orca://pair' '$HOME' 2>/dev/null | grep -q ."
t "HOME has no files at all after pairing" bash -c "[ -z \"\$(find '$HOME' -type f | head -1)\" ]"

# 4 status scrubs
t "status prints orca state but hides links" bash -c "grep -q 'app: ready' '$T/s.out' && grep -q 'link hidden' '$T/s.out'"

# 5 report
printf 'other-mac\ny\n%s\n' "$SECRET" | "$TOOL" pair >/dev/null 2>&1
R="$("$TOOL" report)"
t "report: one line with exactly the allowed keys" bash -c "printf '%s' '$R' | grep -Eq '^\\{\"host\":\"[^\"]*\",\"label\":\"[^\"]*\",\"orcaVersion\":\"1.4.214\",\"runtimeReachable\":true,\"pairedEnvironments\":\\[\"other-mac\"\\],\"checkedAt\":\"20[^\"]*\"\\}\$'"
t "report: valid JSON (if python3)" bash -c "command -v python3 >/dev/null || exit 0; printf '%s' '$R' | python3 -c 'import json,sys; d=json.load(sys.stdin); assert sorted(d)==[\"checkedAt\",\"host\",\"label\",\"orcaVersion\",\"pairedEnvironments\",\"runtimeReachable\"]'"
t "report: no code, address or HOME" bash -c "! printf '%s' '$R' | grep -Eq 'orca://|code=|TOPSECRET|ENVSECRET|[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+|$HOME'"
R2="$(STUB_STATUS_RC=1 "$TOOL" report)"
t "report: runtimeReachable false when orca status fails" bash -c "printf '%s' '$R2' | grep -q '\"runtimeReachable\":false'"

# 6 unpair
t "unpair N keeps it" bash -c "printf 'n\n' | '$TOOL' unpair other-mac >/dev/null 2>&1; test -f '$STUB_DIR/env.json'"
t "unpair y removes it" bash -c "printf 'y\n' | '$TOOL' unpair other-mac >/dev/null 2>&1; ! test -f '$STUB_DIR/env.json'"
t "unpair again is idempotent (exit 0)" bash -c "printf 'y\n' | '$TOOL' unpair other-mac >/dev/null 2>&1"
t "unpair rejects odd names" bash -c "printf 'y\n' | '$TOOL' unpair 'a;b' >/dev/null 2>&1; [ \$? = 2 ]"

# 7 doctor
printf '  501 /Applications/Orca.app/x/orca serve --pairing-address 192.168.1.23\n' > "$STUB_DIR/ps.out"
"$TOOL" doctor >"$T/dok" 2>&1
t "doctor: clean serve is not flagged" bash -c "! grep -q 'FAIL' '$T/dok' && grep -q '1 orca serve' '$T/dok'"
t "doctor: lists only private address candidates" bash -c "grep -q '192.168.1.23' '$T/dok' && ! grep -q '8.8.4.4' '$T/dok'"
printf '  777 orca serve --pairing-address 192.168.1.23 --grant-desktop-control\n' > "$STUB_DIR/ps.out"
"$TOOL" doctor >"$T/dbad" 2>&1; rc=$?
t "doctor flags a serve started with --grant-desktop-control" bash -c "[ $rc != 0 ] && grep -q 'FAIL  orca serve pid 777' '$T/dbad'"
printf '  778 orca serve --pairing-address 8.8.8.8\n' > "$STUB_DIR/ps.out"
t "doctor flags a serve advertising a public address" bash -c "'$TOOL' doctor 2>&1 | grep -q 'FAIL  orca serve pid 778'"
: > "$STUB_DIR/ps.out"
t "doctor: orca missing is a FAIL" bash -c "ORCA_BIN= PATH=/usr/bin:/bin '$TOOL' doctor 2>&1 | grep -q 'FAIL  orca not on PATH'"
t "usage on bad subcommand" bash -c "'$TOOL' nope >/dev/null 2>&1; [ \$? = 2 ]"

printf '\n%s passed, %s failed\n' "$PASS" "$FAIL"
[ "$FAIL" = 0 ]
