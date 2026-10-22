#!/usr/bin/env bash
# OpenWA — Mac install script (R9, 2026-09-27). Run this ON STEVEN'S MAC. It has never run there;
# everything it does was proved piece-by-piece in a cloud sandbox instead (see SECURITY-REVIEW.md).
#
# What this script does:
#   1. clones rmyndharis/OpenWA to ~/Applications/openwa at the exact commit this review covers;
#   2. copies this package's .env.example (names-only) into that clone's .env;
#   3. builds and starts ONLY the openwa-api service with `docker compose up -d --no-deps` —
#      SQLite, no Postgres/Redis/MinIO, loopback-only by that repo's own docker-compose.yml
#      (127.0.0.1 is hardcoded there, not set here). `--no-deps` matters: openwa-api lists the
#      docker-socket-proxy sidecar under depends_on, and a plain `up` would start it too. That
#      proxy has POST enabled on containers/images/volumes, i.e. it can create containers on the
#      Mac's Docker — not something a WhatsApp gateway needs. The dependency is `required: false`
#      and OpenWA's DockerService degrades gracefully without it (upstream comment, compose file).
#
# What it deliberately does NOT do: scan a QR code, create an operator key, or touch the macOS
# keychain — that is provision-keys.sh, run by hand, once, after this script finishes. It also never
# prints, stores or asks for a credential value. Read-only against every vendor system by design —
# this touches nothing but OpenWA's own container.
set -euo pipefail

# Pinned to the exact commit this security review read and this install path was written against.
# Bump this only after re-running the review in SECURITY-REVIEW.md against the new commit.
OPENWA_REF="25525579e32a3456ab0de3f89c4c5855c0461614"
OPENWA_REPO="https://github.com/rmyndharis/OpenWA.git"
INSTALL_DIR="${OPENWA_INSTALL_DIR:-$HOME/Applications/openwa}"
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

say() { printf '%s\n' "$*"; }
fail() { printf 'openwa install: %s\n' "$*" >&2; exit 1; }

command -v git >/dev/null 2>&1 || fail "git not found — install Xcode Command Line Tools first"
command -v docker >/dev/null 2>&1 || fail "docker not found — install Docker Desktop first, then re-run"
docker compose version >/dev/null 2>&1 || fail "'docker compose' (v2 plugin) not found — Docker Desktop ships it; check your install"
docker info >/dev/null 2>&1 || fail "Docker daemon is not running — start Docker Desktop, then re-run"

if [ -d "$INSTALL_DIR/.git" ]; then
  say "== openwa already cloned at $INSTALL_DIR — fetching and checking out the pinned commit"
  git -C "$INSTALL_DIR" fetch --quiet origin
  git -C "$INSTALL_DIR" checkout --quiet "$OPENWA_REF"
else
  say "== cloning OpenWA into $INSTALL_DIR"
  git clone --quiet "$OPENWA_REPO" "$INSTALL_DIR"
  git -C "$INSTALL_DIR" checkout --quiet "$OPENWA_REF"
fi

if [ -f "$INSTALL_DIR/.env" ]; then
  say "== $INSTALL_DIR/.env already exists — leaving it alone (not overwriting your settings)"
  say "   diff it against $PACKAGE_DIR/.env.example by hand if you want this run's changes"
else
  say "== writing $INSTALL_DIR/.env from this package's names-only template"
  cp "$PACKAGE_DIR/.env.example" "$INSTALL_DIR/.env"
fi

say "== building the image from the pinned, reviewed commit (the compose file names no prebuilt image)"
( cd "$INSTALL_DIR" && docker compose build openwa-api )

say "== starting openwa-api alone (--no-deps: the docker-socket proxy is NOT started)"
( cd "$INSTALL_DIR" && docker compose up -d --no-deps openwa-api )

say ""
say "== done. Next steps (yours, not this script's):"
say "   1. curl -s http://127.0.0.1:2785/api/health     -> {\"status\":\"ok\",...}"
say "   2. bash $PACKAGE_DIR/provision-keys.sh"
say "      -> copies the admin key OpenWA minted on first boot (kept in the container's data/.api-key)"
say "         into the keychain item 'openwa-admin-key', and creates Vanessa's operator key, scoped"
say "         to your own 'Message Yourself' chat only, in 'openwa-vanessa-operator-key'."
say "   3. security find-generic-password -a \"\$USER\" -s openwa-admin-key -w | pbcopy"
say "      then open http://127.0.0.1:2785 and paste it (Cmd-V) where the dashboard asks for an API key."
say "   4. In the dashboard: create a session, start it, and scan the QR with your phone:"
say "      WhatsApp > Settings > Linked Devices > Link a Device. Nobody but you can do this step."
say "   5. Optional, so it comes back after a reboot: install the launchd job —"
say "      sed \"s#__HOME__#\$HOME#g\" $PACKAGE_DIR/launchd/com.stevenshearrill.openwa.plist \\"
say "        > ~/Library/LaunchAgents/com.stevenshearrill.openwa.plist"
say "      launchctl load ~/Library/LaunchAgents/com.stevenshearrill.openwa.plist"
