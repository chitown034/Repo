#!/bin/bash
# openstock.sh - install and run OpenStock (Open-Dev-Society/OpenStock) on THIS computer, loopback only. Bash 3.2 safe.
#
#   bash integrations/openstock/openstock.sh install            shows what it would do (changes nothing)
#   bash integrations/openstock/openstock.sh install --apply    clones, patches, builds, starts MongoDB + the app
#   bash integrations/openstock/openstock.sh start|stop|status|open
#
# What it does: clones the reviewed commit into ~/Applications/OpenStock (outside this repo), starts a MongoDB container
# bound to 127.0.0.1 with a generated password (the vendor compose file publishes MongoDB with root/example on every
# interface - not used), writes .env (chmod 600) with generated secrets, removes the Vercel Analytics tag, builds, and
# serves http://127.0.0.1:3000. Your only manual step: a FREE Finnhub key typed into the .env file (never into chat).
# It is a market VIEWER (watchlists, charts, news) - not a brokerage; it cannot place a trade. AGPL-3.0: running it for
# yourself is fine; do not expose it to the internet or redistribute your patched copy without publishing the source.
set -u
SHA=d890d91
DIR="${OPENSTOCK_DIR:-$HOME/Applications/OpenStock}"
PORT="${OPENSTOCK_PORT:-3000}"
CMD="${1:-}"; FLAG="${2:-}"
say() { printf '%s\n' "$*"; }
do_() { if [ "$FLAG" = "--apply" ]; then say "  RUN   $*"; "$@"; else say "  WOULD $*"; fi; }
need() { command -v "$1" >/dev/null 2>&1 || { say "  MISSING $1 - $2"; return 1; }; }

case "$CMD" in
install)
  say "OpenStock install ($([ "$FLAG" = "--apply" ] && echo APPLY || echo PREVIEW)) -> $DIR"
  M=0
  need git "install Xcode command line tools: xcode-select --install" || M=1
  need node "install Node 20+: brew install node" || M=1
  need npm "comes with node" || M=1
  need docker "install Docker Desktop (docker.com) and open it once; used only for MongoDB" || M=1
  need openssl "ships with macOS" || M=1
  [ "$M" = 1 ] && { say "Fix the MISSING items above, then run this again."; [ "$FLAG" = "--apply" ] && exit 1; }
  if [ -d "$DIR/.git" ]; then say "  ok    already cloned"; else do_ git clone --depth 50 https://github.com/Open-Dev-Society/OpenStock.git "$DIR"; fi
  if [ "$FLAG" = "--apply" ]; then
    cd "$DIR" || exit 1
    git checkout -q "$SHA" 2>/dev/null || say "  note  could not pin $SHA (shallow); continuing on the cloned head - review before trusting"
    # 1) no Vercel Analytics tag
    if grep -q "<Analytics />" app/layout.tsx 2>/dev/null; then sed -i.bak -e '/<Analytics \/>/d' -e '/@vercel\/analytics\/next/d' app/layout.tsx && say "  patched app/layout.tsx: Vercel Analytics removed (local copy only)"; fi
    # 2) loopback-only MongoDB with a generated password
    if [ ! -f .env ]; then
      PW="$(openssl rand -hex 16)"; SECRET="$(openssl rand -hex 32)"
      umask 077
      { printf 'NODE_ENV=production\n'
        printf 'MONGODB_URI=mongodb://openstock:%s@127.0.0.1:27017/openstock?authSource=admin\n' "$PW"
        printf 'MONGO_PW=%s\n' "$PW"
        printf 'BETTER_AUTH_SECRET=%s\nBETTER_AUTH_URL=http://127.0.0.1:%s\n' "$SECRET" "$PORT"
        printf '# Free key from finnhub.io/register - type it on the next line, then save. Never paste it into a chat.\n'
        printf 'NEXT_PUBLIC_FINNHUB_API_KEY=\nFINNHUB_BASE_URL=https://finnhub.io/api/v1\n'
        printf '# Optional features left OFF on purpose: welcome/weekly emails (Gmail, Kit), Gemini AI, Inngest, Adanos sentiment.\n'
      } > .env; chmod 600 .env; say "  wrote .env (chmod 600) with generated secrets"
    fi
    cat > compose.local.yml <<'Y'
services:
  mongodb:
    image: mongo:7
    container_name: openstock-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: openstock
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PW}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - openstock-mongo:/data/db
volumes:
  openstock-mongo:
Y
    docker compose -f compose.local.yml --env-file .env up -d && say "  MongoDB running on 127.0.0.1 only"
    npm install --no-audit --no-fund && npm run build && say "  built"
    say "NEXT (yours): open $DIR/.env, put your free Finnhub key after NEXT_PUBLIC_FINNHUB_API_KEY=, save, then: bash $0 start"
  fi ;;
start)
  [ -d "$DIR" ] || { say "not installed - run: bash $0 install --apply"; exit 1; }
  cd "$DIR" || exit 1
  grep -q '^NEXT_PUBLIC_FINNHUB_API_KEY=.\+' .env || { say "Add your free Finnhub key to $DIR/.env first (finnhub.io/register)."; exit 1; }
  docker compose -f compose.local.yml --env-file .env up -d >/dev/null 2>&1
  [ -f .pid ] && kill -0 "$(cat .pid)" 2>/dev/null && { say "already running: http://127.0.0.1:$PORT"; exit 0; }
  set -a
  # shellcheck source=/dev/null
  . ./.env
  set +a
  nohup npx next start -H 127.0.0.1 -p "$PORT" > openstock.log 2>&1 & echo $! > .pid
  say "OpenStock: http://127.0.0.1:$PORT  (log: $DIR/openstock.log)" ;;
stop)
  [ -f "$DIR/.pid" ] && kill "$(cat "$DIR/.pid")" 2>/dev/null; rm -f "$DIR/.pid"
  [ -d "$DIR" ] && (cd "$DIR" && docker compose -f compose.local.yml --env-file .env stop >/dev/null 2>&1); say "stopped" ;;
status)
  if [ -f "$DIR/.pid" ] && kill -0 "$(cat "$DIR/.pid")" 2>/dev/null; then say "running: http://127.0.0.1:$PORT"; else say "not running"; fi
  if curl -fsS -m 3 "http://127.0.0.1:$PORT" >/dev/null 2>&1; then say "responding"; else say "no response"; fi ;;
open) open "http://127.0.0.1:$PORT" 2>/dev/null || say "http://127.0.0.1:$PORT" ;;
*) sed -n 2,14p "$0"; exit 2 ;;
esac
