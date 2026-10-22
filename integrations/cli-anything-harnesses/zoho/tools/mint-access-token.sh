#!/usr/bin/env bash
# mint-access-token.sh — print a one-hour Zoho CRM access token to stdout.
#
# This is the ONLY non-GET call in the Zoho harness directory, and it lives OUTSIDE the pip
# package on purpose: the OAuth refresh-token grant is a POST by specification (RFC 6749 §6),
# while cli-anything-zoho is GET-only against the CRM and its tests grep the package for any
# other method. This script talks only to the accounts server (token endpoint), never to the CRM.
#
# Reads ~/.config/zoho/.env (or $ZOHO_ENV_FILE): ZOHO_ACCOUNTS_URL, ZOHO_CLIENT_ID,
# ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN. Prints the access token and nothing else. Never prints
# the secret or the refresh token, never writes a file, never stores the token.
#
#   export ZOHO_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/zoho/tools/mint-access-token.sh)"
#   cli-anything-zoho --json selftest
#
# Status: written 2026-09-22, syntax-checked only, NEVER RUN (no credential exists in the sandbox).
# Even a valid token returns 403 NO_PERMISSION until the profile toggle "Zoho CRM API Access" is on.
set -euo pipefail

ENV_FILE="${ZOHO_ENV_FILE:-$HOME/.config/zoho/.env}"
if [ ! -r "$ENV_FILE" ]; then
  echo "not configured: $ENV_FILE is missing or unreadable" >&2
  exit 5
fi

getvar() {  # KEY -> value from the env file; tolerates 'export', spaces and quotes; never echoes elsewhere
  sed -n "s/^[[:space:]]*\(export[[:space:]]\{1,\}\)\{0,1\}$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" \
    | head -1 | sed -e "s/^['\"]//" -e "s/['\"][[:space:]]*$//"
}

ACCOUNTS_URL="$(getvar ZOHO_ACCOUNTS_URL)"
CLIENT_ID="$(getvar ZOHO_CLIENT_ID)"
CLIENT_SECRET="$(getvar ZOHO_CLIENT_SECRET)"
REFRESH_TOKEN="$(getvar ZOHO_REFRESH_TOKEN)"
for pair in "ZOHO_ACCOUNTS_URL:$ACCOUNTS_URL" "ZOHO_CLIENT_ID:$CLIENT_ID" \
            "ZOHO_CLIENT_SECRET:$CLIENT_SECRET" "ZOHO_REFRESH_TOKEN:$REFRESH_TOKEN"; do
  if [ -z "${pair#*:}" ]; then
    echo "not configured: ${pair%%:*} is empty in $ENV_FILE" >&2
    exit 5
  fi
done

# The refresh grant. Secrets travel in the request body only; the response is parsed, not printed.
RESPONSE="$(curl -sS -X POST "${ACCOUNTS_URL%/}/oauth/v2/token" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode "refresh_token=$REFRESH_TOKEN")" || {
  echo "token endpoint unreachable — check ZOHO_ACCOUNTS_URL (data center: .com / .eu / .in / .com.au)" >&2
  exit 1
}

TOKEN="$(printf '%s' "$RESPONSE" | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    print(""); sys.exit(0)
tok = d.get("access_token", "")
err = d.get("error", "")
if not tok:
    sys.stderr.write("token endpoint returned no access_token" + (": " + err if err else "") + "\n")
print(tok)')"
if [ -z "$TOKEN" ]; then
  echo "no token minted — the refresh token may be revoked, or its scopes may not include ZohoCRM.modules.ALL,ZohoCRM.settings.READ" >&2
  exit 1
fi
printf '%s\n' "$TOKEN"
