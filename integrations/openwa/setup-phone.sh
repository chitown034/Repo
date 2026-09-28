#!/usr/bin/env bash
# OpenWA — link WhatsApp on your phone in one command (2026-09-28). Run it ON YOUR MAC, from the Repo:
#
#     bash integrations/openwa/setup-phone.sh          # a QR code opens on screen (default, most reliable)
#     bash integrations/openwa/setup-phone.sh --code   # an 8-character code you type into WhatsApp instead
#
# It is safe to re-run at any point: every step checks what is already done and skips it.
#   1. starts OpenWA if it is not running (runs install.sh the first time — a 10-15 minute build);
#   2. puts OpenWA's admin key in your Keychain (provision-keys.sh admin);
#   3. creates or reuses the WhatsApp session "steven-selfchat" and starts it;
#   4. links your phone: a QR code opens in your browser and refreshes itself until you scan it
#      (WhatsApp > Settings > Linked Devices > Link a Device), or --code prints a code to type in;
#   5. reads YOUR number from the linked session and creates Vanessa's key, fenced to your own
#      "Message Yourself" chat only (provision-keys.sh operator) — in QR mode you never type it;
#   6. proves the fence: Vanessa's key reads and writes your self-chat and is refused everywhere else.
# Nothing is ever sent to anyone but you. No key or phone number is printed or written to a file.
set -euo pipefail

API="http://127.0.0.1:2785/api"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_NAME="steven-selfchat"
LINK_TIMEOUT="${OPENWA_LINK_TIMEOUT:-300}"
MODE="qr"; [ "${1:-}" = "--code" ] && MODE="code"
WORK="${TMPDIR:-/tmp}/openwa-link-$$"

say()  { printf '%s\n' "$*"; }
fail() { printf '\nsetup-phone: %s\n' "$*" >&2; exit 1; }
kc()   { security find-generic-password -a "$USER" -s "$1" -w 2>/dev/null || true; }
# Every call sends its key to curl on stdin, never on the command line (so it never shows in `ps`).
api()  { local key="$1"; shift; printf 'header = "X-API-Key: %s"\n' "$key" | curl -sS --max-time 20 -K - "$@"; }
http() { local key="$1"; shift; printf 'header = "X-API-Key: %s"\n' "$key" | curl -s --max-time 20 -o /dev/null -w '%{http_code}' -K - "$@"; }
field() { python3 -c 'import json,sys
try: d=json.load(sys.stdin)
except Exception: print(""); sys.exit(0)
for k in sys.argv[1].split("."):
    d = d.get(k) if isinstance(d, dict) else None
print("" if d is None else d)' "$1"; }
healthy() { curl -fsS --max-time 3 "$API/health" >/dev/null 2>&1; }

main() {
  [ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
  for c in docker curl python3 security; do command -v "$c" >/dev/null 2>&1 || fail "'$c' not found"; done
  docker info >/dev/null 2>&1 || fail "Docker Desktop is not running — open it, wait for 'Engine running', then run this again"

  # ---- 1. OpenWA running -------------------------------------------------------------------------
  if ! healthy; then
    if [ -d "$HOME/Applications/openwa/.git" ]; then
      say "== starting OpenWA"
      ( cd "$HOME/Applications/openwa" && docker compose up -d --no-deps openwa-api )
    else
      say "== OpenWA is not installed yet — installing (the first build takes 10-15 minutes)"
      bash "$HERE/install.sh"
    fi
    for _ in $(seq 1 120); do healthy && break; sleep 2; done
    healthy || fail "OpenWA did not answer on 127.0.0.1:2785 — look at: docker compose -f ~/Applications/openwa/docker-compose.yml logs openwa-api --tail 60"
  fi
  say "== OpenWA is running (reachable only from this Mac, 127.0.0.1:2785)"

  # ---- 2. admin key ------------------------------------------------------------------------------
  [ -n "$(kc openwa-admin-key)" ] || bash "$HERE/provision-keys.sh" admin
  ADMIN="$(kc openwa-admin-key)"
  [ -n "$ADMIN" ] || fail "no admin key in the Keychain (item 'openwa-admin-key')"
  [ "$(http "$ADMIN" "$API/sessions")" = "200" ] || fail "OpenWA refuses the admin key in your Keychain. If OpenWA was reinstalled, delete the Keychain item 'openwa-admin-key' and run this again."

  # ---- 3. session --------------------------------------------------------------------------------
  SID="$(api "$ADMIN" "$API/sessions" | python3 -c 'import json,sys
try: d=json.load(sys.stdin)
except Exception: d=[]
rows = d if isinstance(d, list) else (d.get("data") or d.get("items") or d.get("sessions") or [])
print(next((r.get("id","") for r in rows if isinstance(r, dict) and r.get("name") == sys.argv[1]), ""))' "$SESSION_NAME")"
  if [ -z "$SID" ]; then
    SID="$(api "$ADMIN" -X POST "$API/sessions" -H 'Content-Type: application/json' -d "{\"name\":\"$SESSION_NAME\"}" | field id)"
    [ -n "$SID" ] || fail "could not create the WhatsApp session"
    say "== created the WhatsApp session '$SESSION_NAME'"
  fi
  # A missed poll (timeout, restart) must not abort a link in progress: read "" and poll again.
  status() { { api "$ADMIN" "$API/sessions/$SID" 2>/dev/null || true; } | field status; }
  phone_of() { { api "$ADMIN" "$API/sessions/$SID" 2>/dev/null || true; } | field phone | tr -cd '0-9'; }
  ST="$(status)"

  # ---- 4. link your phone ------------------------------------------------------------------------
  if [ "$ST" = "ready" ]; then
    say "== your phone is already linked"
  else
    case "$ST" in
      qr_ready|initializing|authenticating) ;;
      *) api "$ADMIN" -X POST "$API/sessions/$SID/start" >/dev/null ;;
    esac
    say "== starting WhatsApp inside OpenWA (up to two minutes)"
    for _ in $(seq 1 60); do ST="$(status)"; case "$ST" in qr_ready|ready) break ;; esac; sleep 2; done
    case "$ST" in
      qr_ready|ready) ;;
      action_required) fail "WhatsApp wants an action on this session — open http://127.0.0.1:2785 and look at the session" ;;
      *) fail "the session did not reach the linking step (status: ${ST:-unknown}). Run this again in a minute; if it repeats, send Vanessa the output of: docker compose -f ~/Applications/openwa/docker-compose.yml logs openwa-api --tail 60" ;;
    esac
    mkdir -p "$WORK"; chmod 700 "$WORK"; trap 'rm -rf "$WORK"' EXIT
    deadline=$((SECONDS + LINK_TIMEOUT))

    if [ "$MODE" = "code" ] && [ "$ST" != "ready" ]; then
      read -r -p "Your WhatsApp number, digits only with country code (US: 1 then 10 digits): " PHONE_IN
      [[ "$PHONE_IN" =~ ^[0-9]{6,15}$ ]] || fail "digits only, with country code — e.g. 1 and then your 10 digits"
      CODE="$(api "$ADMIN" -X POST "$API/sessions/$SID/pairing-code" -H 'Content-Type: application/json' -d "{\"phoneNumber\":\"$PHONE_IN\"}" | field pairingCode)"
      unset PHONE_IN
      [ -n "$CODE" ] || fail "no code came back — run it again without --code to scan a QR code instead"
      say ""
      say "   YOUR CODE:   ${CODE:0:4}-${CODE:4:4}"
      say ""
      say "   iPhone: WhatsApp > Settings > Linked Devices > Link a Device >"
      say "           'Link with phone number instead' > type the 8 characters."
      say "   If WhatsApp says the code is wrong or expired, run this again WITHOUT --code (QR)."
    elif [ "$ST" != "ready" ]; then
      cat > "$WORK/qr.html" <<'HTML'
<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="4"><title>Link WhatsApp</title></head>
<body style="font-family:-apple-system,Helvetica,sans-serif;text-align:center;padding:24px;background:#fff;color:#111">
<h2 style="margin:0 0 8px">Scan with WhatsApp on your iPhone</h2>
<p style="margin:0 0 16px">WhatsApp &rarr; Settings &rarr; Linked Devices &rarr; Link a Device</p>
<img src="qr.png" width="320" height="320" alt="WhatsApp QR code" style="image-rendering:pixelated;border:12px solid #fff;box-shadow:0 0 0 1px #ddd">
<p style="color:#666;font-size:14px">This page refreshes itself every few seconds. Close it once your phone says the device is linked.</p>
</body></html>
HTML
      say "== a QR code is opening in your browser — it refreshes itself until you scan it."
      say "   iPhone: WhatsApp > Settings > Linked Devices > Link a Device, then point the camera at the screen."
      opened=0
      while [ $SECONDS -lt $deadline ]; do
        ST="$(status)"; [ "$ST" = "ready" ] && break
        { api "$ADMIN" "$API/sessions/$SID/qr" 2>/dev/null || true; } | python3 -c 'import json,sys,base64,os
try: q = json.load(sys.stdin).get("qrCode") or ""
except Exception: q = ""
if q.startswith("data:image"):
    tmp = sys.argv[1] + ".tmp"
    open(tmp, "wb").write(base64.b64decode(q.split(",", 1)[1]))
    os.replace(tmp, sys.argv[1])' "$WORK/qr.png" || true
        if [ "$opened" = 0 ] && [ -s "$WORK/qr.png" ]; then open "$WORK/qr.html"; opened=1; fi
        sleep 3
      done
    fi

    while [ $SECONDS -lt $deadline ] && [ "$ST" != "ready" ]; do sleep 3; ST="$(status)"; done
    [ "$ST" = "ready" ] || fail "not linked within $((LINK_TIMEOUT / 60)) minutes — just run this again; it picks up where it stopped"
    say "== linked — your phone now shows OpenWA under Linked Devices"
  fi

  # ---- 5. Vanessa's key, fenced to your self-chat -----------------------------------------------------
  PHONE="$(phone_of)"
  for _ in $(seq 1 10); do [ -n "$PHONE" ] && break; sleep 3; PHONE="$(phone_of)"; done
  [ -n "$PHONE" ] || fail "linked, but OpenWA has not reported your number yet — wait a minute and run this again"
  ME="${PHONE}@c.us"
  [ -n "$(kc openwa-vanessa-operator-key)" ] || bash "$HERE/provision-keys.sh" operator "$ME"
  OP="$(kc openwa-vanessa-operator-key)"
  [ -n "$OP" ] || fail "Vanessa's key is not in the Keychain (item 'openwa-vanessa-operator-key')"

  # ---- 6. prove the fence --------------------------------------------------------------------------
  say "== checking that Vanessa's key reaches your self-chat and nothing else"
  read_self="$(http "$OP" "$API/sessions/$SID/messages/$ME/history")"
  send_self="$(printf 'header = "X-API-Key: %s"\n' "$OP" | curl -s --max-time 20 -o /dev/null -w '%{http_code}' -K - -X POST "$API/sessions/$SID/messages/send-text" \
    -H 'Content-Type: application/json' -d "{\"chatId\":\"$ME\",\"text\":\"[V] Vanessa is linked to this chat only — setup check. You can delete this message.\"}")"
  read_other="$(http "$OP" "$API/sessions/$SID/messages/15550001111@c.us/history")"   # a chat outside the fence
  list_all="$(http "$OP" "$API/sessions")"
  keys_admin="$(http "$OP" "$API/auth/api-keys")"
  ok() { case "$1" in 2??) printf 'PASS' ;; *) printf 'FAIL (%s)' "$1" ;; esac; }
  no() { case "$1" in 401|403) printf 'PASS (refused)' ;; *) printf 'FAIL (%s — expected a refusal)' "$1" ;; esac; }
  say "   reads your self-chat ............ $(ok "$read_self")"
  say "   writes your self-chat ........... $(ok "$send_self")   <- look for the [V] message in Message Yourself"
  say "   reads any other chat ............ $(no "$read_other")"
  say "   lists sessions .................. $(no "$list_all")"
  say "   manages keys .................... $(no "$keys_admin")"
  unset ADMIN OP
  say ""
  say "Done. WhatsApp is linked to OpenWA on this Mac, and Vanessa's key is fenced to your self-chat."
  say "Vanessa does not answer there yet — the bridge from OpenWA to her inbox is the next step."
}

main "$@"
