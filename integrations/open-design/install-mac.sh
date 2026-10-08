#!/usr/bin/env bash
# OpenDesign on Steven's Mac (2026-10-08): an open-source design workspace (Apache 2.0) that uses Claude Code
# as its engine to build prototypes, decks and pages from a brief. Run it in Terminal from your Repo folder:
#
#     git pull && bash integrations/open-design/install-mac.sh          # install (safe to re-run)
#     bash integrations/open-design/install-mac.sh start               # start it, prints the web address
#     bash integrations/open-design/install-mac.sh stop                # stop it
#
# Tested in the cloud sandbox 2026-10-08 on Linux (OpenDesign 0.23.1, commit 53231d4, Node 24.21, pnpm 10.33.2):
# install finished, the daemon answered /api/health ok, the web app returned 200, and Claude Code showed as an
# available engine. Nothing here has run on a Mac yet, so read what it prints.
# Built from source on purpose: upstream's PRIVACY.md says builds without its telemetry credentials send no
# analytics. Its paid "OpenDesign Go"/Cloud plans are not used (HALT: spends money).
set -euo pipefail

OD_COMMIT="53231d4"
DEST="$HOME/Applications/open-design"
say()  { printf '%s\n' "$*"; }
step() { printf '\n==== %s\n' "$*"; }
fail() { printf '\nopen-design: %s\n' "$*" >&2; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "run this on your Mac"
command -v brew >/dev/null 2>&1 || fail "Homebrew is not installed (https://brew.sh), then run this again."

node24() {   # Node 24 through fnm, which OpenDesign's QUICKSTART names; leaves your other Node alone
  command -v fnm >/dev/null 2>&1 || brew install fnm
  eval "$(fnm env)"
  fnm install 24 >/dev/null
  fnm use 24 >/dev/null
  corepack enable
}

run_pnpm() { (cd "$DEST" && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm "$@"); }

case "${1:-install}" in
  start) node24; run_pnpm tools-dev start web
         say "Open the web address printed above (it only listens on this Mac)."; exit 0 ;;
  stop)  node24; run_pnpm tools-dev stop; exit 0 ;;
  install) ;;
  *) fail "usage: install-mac.sh [install|start|stop]" ;;
esac

step "1/3  Node 24 and pnpm"
node24
say "node $(node -v), pnpm $(cd /tmp && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm@10.33.2 --version)"

step "2/3  OpenDesign source ($OD_COMMIT)"
if [ -d "$DEST/.git" ]; then
  git -C "$DEST" fetch -q origin
else
  git clone -q https://github.com/nexu-io/open-design.git "$DEST"
fi
git -C "$DEST" checkout -q "$OD_COMMIT"
run_pnpm install

step "3/3  Self-test"
run_pnpm tools-dev start web
sleep 15
port="$(run_pnpm tools-dev status 2>/dev/null | sed -n 's/.*daemon:.*127\.0\.0\.1:\([0-9]*\).*/\1/p' | head -1)"
health="$(curl -s -m 10 "http://127.0.0.1:${port:-0}/api/health" || true)"
run_pnpm tools-dev stop >/dev/null 2>&1 || true
case "$health" in
  *'"ok":true'*) say "Self-test passed: the OpenDesign daemon answered healthy." ;;
  *) fail "self-test failed (daemon port '${port}', answer '${health}'). Logs: $DEST/.tmp/tools-dev/default/logs" ;;
esac

say ""
say "Done. Start it:  bash integrations/open-design/install-mac.sh start   — then open the web address it prints."
say "On first load: choose \"Don't share\" on the privacy banner, pick Claude Code as the engine. Rules: integrations/open-design/README.md"
