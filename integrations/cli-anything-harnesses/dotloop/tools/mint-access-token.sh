#!/usr/bin/env bash
# mint-access-token.sh — print a short-lived dotloop access token to stdout.
#
# This, and exchange-auth-code.sh, are the ONLY non-GET calls in the dotloop harness directory,
# and both live OUTSIDE the pip package on purpose: the refresh-token grant is a POST by
# specification (RFC 6749 section 6), while cli-anything-dotloop is GET-only against the dotloop
# API and its tests grep the package for any other method. This script talks only to the auth
# server (token endpoint), never to the dotloop API itself.
#
# Reads ~/.config/dotloop/.env (or $DOTLOOP_ENV_FILE): DOTLOOP_AUTH_URL, DOTLOOP_CLIENT_ID,
# DOTLOOP_CLIENT_SECRET, DOTLOOP_REFRESH_TOKEN. Prints the access token and nothing else. Never
# prints the secret or the refresh token, never writes a file, never stores the token.
#
#   export DOTLOOP_ACCESS_TOKEN="$(integrations/cli-anything-harnesses/dotloop/tools/mint-access-token.sh)"
#   cli-anything-dotloop --json selftest
#
# Status: written 2026-09-27, syntax-checked only, NEVER RUN. DOTLOOP_REFRESH_TOKEN only exists
# after Steven runs exchange-auth-code.sh once, by hand, which has also never happened — no
# dotloop app registration or credential exists in the sandbox this was built in.
set -euo pipefail

ENV_FILE="${DOTLOOP_ENV_FILE:-$HOME/.config/dotloop/.env}"
if [ ! -r "$ENV_FILE" ]; then
  echo "not configured: $ENV_FILE is missing or unreadable" >&2
  exit 5
fi

getvar() {  # KEY -> value from the env file; tolerates 'export', spaces and quotes; never echoes elsewhere
  sed -n "s/^[[:space:]]*\(export[[:space:]]\{1,\}\)\{0,1\}$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" \
    | head -1 | sed -e "s/^['\"]//" -e "s/['\"][[:space:]]*$//"
}

AUTH_URL="$(getvar DOTLOOP_AUTH_URL)"; AUTH_URL="${AUTH_URL:-https://auth.dotloop.com}"
CLIENT_ID="$(getvar DOTLOOP_CLIENT_ID)"
CLIENT_SECRET="$(getvar DOTLOOP_CLIENT_SECRET)"
REFRESH_TOKEN="$(getvar DOTLOOP_REFRESH_TOKEN)"
for pair in "DOTLOOP_CLIENT_ID:$CLIENT_ID" "DOTLOOP_CLIENT_SECRET:$CLIENT_SECRET" \
            "DOTLOOP_REFRESH_TOKEN:$REFRESH_TOKEN"; do
  if [ -z "${pair#*:}" ]; then
    echo "not configured: ${pair%%:*} is empty in $ENV_FILE" >&2
    exit 5
  fi
done

# The refresh grant. Secrets travel in the request body only; the response is parsed, not printed.
RESPONSE="$(curl -sS -X POST "${AUTH_URL%/}/oauth/token" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode "refresh_token=$REFRESH_TOKEN")" || {
  echo "token endpoint unreachable — check DOTLOOP_AUTH_URL" >&2
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
  echo "no token minted — the refresh token may be revoked, or DOTLOOP_CLIENT_ID/SECRET may be wrong" >&2
  exit 1
fi
printf '%s\n' "$TOKEN"
