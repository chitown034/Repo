#!/usr/bin/env bash
# OpenWA — key provisioning (R9, 2026-09-27). Run ONCE on Steven's Mac, by hand, after install.sh
# and after the openwa-api container is up. Never run in a cloud sandbox; never run unattended.
#
# What it does:
#   1. reads the admin key OpenWA minted on first boot straight out of the running container
#      (never off a printed log line you might paste wrong or leave in scrollback);
#   2. stores that admin key in the macOS keychain (item name below) instead of a file;
#   3. creates ONE operator API key, scoped with `allowedChats` to the self-chat id you give it,
#      and stores THAT in the keychain too;
#   4. never writes either key value to disk outside the keychain, never to this repo, never logs it.
#
# It asks you, interactively, for the self-chat WhatsApp id (e.g. `<your number>@c.us` — the same
# id WhatsApp uses for your own "Message Yourself" thread). That value lives only in this shell's
# memory for the one API call that needs it. It is never written to a file, this repo, or a log.
set -euo pipefail

INSTALL_DIR="${OPENWA_INSTALL_DIR:-$HOME/Applications/openwa}"
API="http://127.0.0.1:2785/api"
KEYCHAIN_ADMIN_ITEM="openwa-admin-key"
KEYCHAIN_OPERATOR_ITEM="openwa-vanessa-operator-key"

say() { printf '%s\n' "$*"; }
fail() { printf 'provision-keys: %s\n' "$*" >&2; exit 1; }

command -v security >/dev/null 2>&1 || fail "this script is for macOS ('security' not found)"
command -v docker >/dev/null 2>&1 || fail "docker not found"
command -v python3 >/dev/null 2>&1 || fail "python3 not found — run: xcode-select --install"
curl -fsS "$API/health" >/dev/null 2>&1 || fail "OpenWA is not answering on 127.0.0.1:2785 — is the container up? (docker compose ps)"

say "== reading the admin key from the running container's data volume (never off a log line)"
ADMIN_KEY="$(docker compose -f "$INSTALL_DIR/docker-compose.yml" exec -T openwa-api cat /app/data/.api-key 2>/dev/null | tr -d '[:space:]')"
[ -n "$ADMIN_KEY" ] || fail "could not read /app/data/.api-key from the container — check 'docker compose logs openwa-api'"

if security find-generic-password -a "$USER" -s "$KEYCHAIN_ADMIN_ITEM" >/dev/null 2>&1; then
  say "== keychain item '$KEYCHAIN_ADMIN_ITEM' already exists — leaving it; delete it first if you want to replace it"
else
  security add-generic-password -a "$USER" -s "$KEYCHAIN_ADMIN_ITEM" -w "$ADMIN_KEY"
  say "== admin key stored in keychain item '$KEYCHAIN_ADMIN_ITEM'"
fi

say ""
say "Vanessa answers ONLY in your own WhatsApp self-chat ('Message Yourself'). Give me that chat's"
say "WhatsApp id so the operator key can be scoped to it and nothing else — e.g. <your number>@c.us"
say "with country code, no plus sign, no spaces. This is typed here only; it is never written to a"
say "file, never logged, never leaves this shell."
read -r -p "Self-chat WhatsApp id: " SELF_CHAT_ID
[ -n "$SELF_CHAT_ID" ] || fail "no id given — re-run when you have it"

say "== creating a chat-scoped operator key (allowedChats=[\"$SELF_CHAT_ID\"])"
# The admin key goes to curl on stdin (`-K -`), not on its command line, so it never shows up in
# `ps` output while the request runs. python3 ships with the Xcode Command Line Tools that git needs.
RESP="$(printf 'header = "X-API-Key: %s"\n' "$ADMIN_KEY" | curl -fsS -K - -X POST "$API/auth/api-keys" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"vanessa-selfchat-operator\",\"role\":\"operator\",\"allowedChats\":[\"$SELF_CHAT_ID\"]}")"

OPERATOR_KEY="$(printf '%s' "$RESP" | python3 -c 'import json,sys
try: print(json.load(sys.stdin).get("apiKey") or "")
except Exception: print("")' 2>/dev/null || true)"
[ -n "$OPERATOR_KEY" ] || fail "key creation did not return an apiKey — check 'docker compose logs openwa-api --tail 40'"

security add-generic-password -a "$USER" -s "$KEYCHAIN_OPERATOR_ITEM" -w "$OPERATOR_KEY" -U
say "== operator key stored in keychain item '$KEYCHAIN_OPERATOR_ITEM'"
say ""
say "Done. Neither key value was printed, logged, or written outside the keychain. n8n's HTTP"
say "Request node for sending Vanessa's replies should read '$KEYCHAIN_OPERATOR_ITEM' from the"
say "keychain (or your own secret store) at run time — see BRIDGE.md for where it plugs in."
