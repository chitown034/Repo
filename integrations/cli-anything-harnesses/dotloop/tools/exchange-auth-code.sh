#!/usr/bin/env bash
# exchange-auth-code.sh — the ONE-TIME dotloop OAuth authorization-code step. Steven's alone: it
# needs a browser sign-in and a consent click, which is a HALT-list credential/account step
# (CLAUDE.md) that no harness or script can do for him.
#
# Two modes, both outside the pip package on purpose: the authorization-code grant is a POST by
# specification (RFC 6749 section 4.1.3), while cli-anything-dotloop is GET-only against the
# dotloop API itself and its tests grep the package for any other HTTP method.
#
#   exchange-auth-code.sh url                 # prints the browser URL to open and consent to
#   exchange-auth-code.sh exchange <code>     # trades that one-time code for tokens
#
# Reads ~/.config/dotloop/.env (or $DOTLOOP_ENV_FILE): DOTLOOP_AUTH_URL, DOTLOOP_CLIENT_ID,
# DOTLOOP_CLIENT_SECRET, DOTLOOP_REDIRECT_URI. Prints a DOTLOOP_REFRESH_TOKEN=... line to save
# into the .env by hand, plus the first access token for information only. Never prints the
# client secret, never writes a file, never stores anything itself.
#
# Status: written 2026-09-27, syntax-checked only, NEVER RUN — no dotloop app registration or
# credential exists in the sandbox this was built in.
set -euo pipefail

ENV_FILE="${DOTLOOP_ENV_FILE:-$HOME/.config/dotloop/.env}"
if [ ! -r "$ENV_FILE" ]; then
  echo "not configured: $ENV_FILE is missing or unreadable" >&2
  exit 5
fi

getvar() {
  sed -n "s/^[[:space:]]*\(export[[:space:]]\{1,\}\)\{0,1\}$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" \
    | head -1 | sed -e "s/^['\"]//" -e "s/['\"][[:space:]]*$//"
}

AUTH_URL="$(getvar DOTLOOP_AUTH_URL)"; AUTH_URL="${AUTH_URL:-https://auth.dotloop.com}"
CLIENT_ID="$(getvar DOTLOOP_CLIENT_ID)"
CLIENT_SECRET="$(getvar DOTLOOP_CLIENT_SECRET)"
REDIRECT_URI="$(getvar DOTLOOP_REDIRECT_URI)"

MODE="${1:-}"
case "$MODE" in
  url)
    for pair in "DOTLOOP_CLIENT_ID:$CLIENT_ID" "DOTLOOP_REDIRECT_URI:$REDIRECT_URI"; do
      if [ -z "${pair#*:}" ]; then
        echo "not configured: ${pair%%:*} is empty in $ENV_FILE" >&2
        exit 5
      fi
    done
    printf '%s/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code\n' \
      "${AUTH_URL%/}" "$CLIENT_ID" "$REDIRECT_URI"
    echo "Open that URL in a browser, sign in to dotloop, and approve access." >&2
    echo "dotloop redirects to $REDIRECT_URI?code=... — copy the 'code' value only." >&2
    ;;
  exchange)
    CODE="${2:-}"
    if [ -z "$CODE" ]; then
      echo "usage: exchange-auth-code.sh exchange <code>" >&2
      exit 2
    fi
    for pair in "DOTLOOP_CLIENT_ID:$CLIENT_ID" "DOTLOOP_CLIENT_SECRET:$CLIENT_SECRET" \
                "DOTLOOP_REDIRECT_URI:$REDIRECT_URI"; do
      if [ -z "${pair#*:}" ]; then
        echo "not configured: ${pair%%:*} is empty in $ENV_FILE" >&2
        exit 5
      fi
    done
    RESPONSE="$(curl -sS -X POST "${AUTH_URL%/}/oauth/token" \
      --data-urlencode "grant_type=authorization_code" \
      --data-urlencode "code=$CODE" \
      --data-urlencode "client_id=$CLIENT_ID" \
      --data-urlencode "client_secret=$CLIENT_SECRET" \
      --data-urlencode "redirect_uri=$REDIRECT_URI")" || {
      echo "token endpoint unreachable — check DOTLOOP_AUTH_URL" >&2
      exit 1
    }
    printf '%s' "$RESPONSE" | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.stderr.write("token endpoint returned unparseable output\n"); sys.exit(1)
rt = d.get("refresh_token", ""); at = d.get("access_token", ""); err = d.get("error", "")
if not rt:
    sys.stderr.write("no refresh_token in response" + (": " + err if err else "") + "\n"); sys.exit(1)
print("DOTLOOP_REFRESH_TOKEN=" + rt)
print("# first access token (short-lived, informational only): " + at)'
    echo "Save the DOTLOOP_REFRESH_TOKEN line into $ENV_FILE by hand. Never commit it, never paste it into a prompt." >&2
    ;;
  *)
    echo "usage: exchange-auth-code.sh url | exchange-auth-code.sh exchange <code>" >&2
    exit 2
    ;;
esac
