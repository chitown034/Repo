#!/bin/bash
set -euo pipefail

# Installs CopilotKit's OpenBot (https://github.com/CopilotKit/OpenBot) and brings up as much of
# its stack as this container can actually run.
#
# Upstream expects Docker for PostgreSQL and for each Bot's computer. There is no Docker daemon
# here, so `scripts/start.sh` cannot be used: it starts compose services first and exits before
# anything else happens. PostgreSQL 16 is available as ordinary Ubuntu packages, though, so this
# script runs the database directly on the host and starts the app and API server as plain Bun
# processes. The parts that genuinely need containers -- the Bots' computers, built by the
# supervisor -- stay unavailable, and nothing here pretends otherwise.

# Only relevant for Claude Code on the web / remote sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

OPENBOT_SRC="/root/.openbot-src"
OPENBOT_REPO="https://github.com/CopilotKit/OpenBot.git"
# Not under /root: the cluster runs as the `postgres` user, which cannot traverse /root, and initdb
# fails with a bare "Permission denied" that names the directory rather than the reason.
PGDATA="/var/lib/openbot-pg"
PG_LOG="/var/log/openbot-pg.log"
APP_LOG="/root/.openbot-app.log"
SERVER_LOG="/root/.openbot-server.log"
IPV4_FALLBACK="/root/.openbot-ipv4-fallback.ts"

export PATH="/root/.bun/bin:$PATH"

# ---------------------------------------------------------------------------
# Bun
# ---------------------------------------------------------------------------
# OpenBot is a Bun workspace: package manager, test runner and TypeScript runtime at once. Nothing
# in the repository runs without it.
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

# ---------------------------------------------------------------------------
# Source
# ---------------------------------------------------------------------------
if [ -d "$OPENBOT_SRC/.git" ]; then
  # OpenBot is a template meant to be edited into your own deployment, so a checkout with local
  # changes is the expected state rather than a mistake. Only fast-forward a clean one; silently
  # resetting would throw away the customization the project is built around.
  if git -C "$OPENBOT_SRC" diff --quiet && git -C "$OPENBOT_SRC" diff --cached --quiet; then
    git -C "$OPENBOT_SRC" fetch --depth 1 origin HEAD >/dev/null 2>&1 || true
    git -C "$OPENBOT_SRC" reset --hard FETCH_HEAD >/dev/null 2>&1 || true
  else
    echo "OpenBot: checkout has local changes, leaving it on its current commit."
  fi
else
  rm -rf "$OPENBOT_SRC"
  git clone --depth 1 "$OPENBOT_REPO" "$OPENBOT_SRC"
fi

# ---------------------------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------------------------
PG_BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
if [ -z "$PG_BIN" ]; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql >/dev/null 2>&1 ||
    { apt-get update >/dev/null 2>&1 && DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql >/dev/null; }
  PG_BIN="$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)"
fi
PG_VERSION="$(basename "$(dirname "$PG_BIN")")"
export PATH="$PG_BIN:$PATH"

# The first migration is `CREATE EXTENSION IF NOT EXISTS vector`, and every embedding column is
# `vector(...)`. Upstream gets this from the pgvector Docker image; a stock Ubuntu postgresql
# package does not carry it, and without it drizzle-kit fails with a spinner and no error text.
if [ ! -f "/usr/share/postgresql/$PG_VERSION/extension/vector.control" ]; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y "postgresql-$PG_VERSION-pgvector" >/dev/null 2>&1 ||
    { apt-get update >/dev/null 2>&1 && DEBIAN_FRONTEND=noninteractive apt-get install -y "postgresql-$PG_VERSION-pgvector" >/dev/null; }
fi

id postgres >/dev/null 2>&1 || useradd -m postgres
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  rm -rf "$PGDATA"
  mkdir -p "$PGDATA"
  chown postgres:postgres "$PGDATA"
  # trust auth: the cluster listens on loopback only, inside a single-tenant ephemeral container,
  # and DATABASE_URL in .env.example carries the throwaway password `openbot` anyway.
  su postgres -c "PATH='$PG_BIN':\$PATH initdb -D '$PGDATA' -U postgres --auth=trust" >/dev/null
fi

touch "$PG_LOG"
chown postgres:postgres "$PG_LOG"
# The container keeps its filesystem across a session resume but not its processes, so this is the
# ordinary path on a resume rather than an error case: the cluster is already initialised and only
# needs starting again.
if ! pg_isready -h 127.0.0.1 -p 5432 -q 2>/dev/null; then
  su postgres -c "PATH='$PG_BIN':\$PATH pg_ctl -D '$PGDATA' -l '$PG_LOG' -o '-p 5432 -k /tmp' -w start" >/dev/null
fi

if ! psql -h 127.0.0.1 -p 5432 -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='openbot'" | grep -q 1; then
  psql -h 127.0.0.1 -p 5432 -U postgres -c "CREATE USER openbot WITH PASSWORD 'openbot' SUPERUSER;" >/dev/null
fi

# `openbot` is what DATABASE_URL in .env.example points at; `openbot_test` is what the repository's
# own CI job uses, so the suite is runnable straight away rather than against the dev database.
for db in openbot openbot_test; do
  if ! psql -h 127.0.0.1 -p 5432 -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
    psql -h 127.0.0.1 -p 5432 -U postgres -c "CREATE DATABASE $db OWNER openbot;" >/dev/null
  fi
  psql -h 127.0.0.1 -p 5432 -U openbot -d "$db" -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null
done

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
cd "$OPENBOT_SRC"
[ -f .env ] || cp .env.example .env

# The two credentials the API server refuses to boot without are the operator's to supply. Picked
# up from the session environment when set, so they can be configured once as environment variables
# rather than edited into .env on every fresh container.
set_env_value() {
  [ -n "$2" ] || return 0
  KEY="$1" VALUE="$2" awk '
    BEGIN { key = ENVIRON["KEY"]; value = ENVIRON["VALUE"]; written = 0 }
    $0 ~ "^" key "=" { print key "=" value; written = 1; next }
    { print }
    END { if (!written) print key "=" value }
  ' .env > .env.next && mv .env.next .env
}
set_env_value INTELLIGENCE_API_KEY "${INTELLIGENCE_API_KEY:-}"
set_env_value OPENAI_API_KEY "${OPENAI_API_KEY:-}"

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
bun install

# The Bots and the desktop app are not root workspaces (`workspaces` is app, server, worker) and
# each keeps its own lockfile. Root test discovery still imports their tests, so without these the
# suite loses ~1100 tests to import-time "Cannot find module" errors rather than failures. The
# repository's own CI installs exactly these four for the same reason.
for pkg in agent-bot agent-langgraph desktop; do
  (cd "$pkg" && bun install --frozen-lockfile >/dev/null)
done
(cd agent-mastra && bun install >/dev/null)

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
bun run generate:app-config
(cd server && bun --env-file=../.env drizzle-kit migrate --config=drizzle.config.ts >/dev/null)
# Not the db:migrate script for the test database: that one hard-codes --env-file=../.env, which
# points at the dev database. DATABASE_URL from the environment is what drizzle.config.ts reads.
(cd server && DATABASE_URL="postgres://openbot:openbot@localhost:5432/openbot_test" \
  bunx drizzle-kit migrate --config=drizzle.config.ts >/dev/null)

# ---------------------------------------------------------------------------
# IPv6
# ---------------------------------------------------------------------------
# app/serve.ts binds `hostname: "::"` on purpose, so one URL answers on both loopbacks. This
# container has no IPv6 at all, and binding `::` there fails as EADDRINUSE -- which reads as a port
# conflict and sends you hunting for a process that does not exist.
#
# Rewriting serve.ts would leave the checkout dirty and block the fast-forward above, so the bind
# is redirected at runtime instead: a preload module that swaps `::` for 0.0.0.0 and leaves every
# other hostname alone. Written only when IPv6 is genuinely missing, so the upstream behaviour is
# what runs anywhere it works.
rm -f "$IPV4_FALLBACK"
PRELOAD=""
if ! bun -e 'const s = Bun.serve({ port: 0, hostname: "::", fetch: () => new Response("") }); s.stop()' >/dev/null 2>&1; then
  cat > "$IPV4_FALLBACK" <<'FALLBACK_EOF'
const original = Bun.serve.bind(Bun);
// @ts-expect-error - replacing a built-in, deliberately
Bun.serve = (options: any, ...rest: any[]) =>
  original(options && options.hostname === "::" ? { ...options, hostname: "0.0.0.0" } : options, ...rest);
FALLBACK_EOF
  PRELOAD="--preload $IPV4_FALLBACK"
fi

# ---------------------------------------------------------------------------
# Launch
# ---------------------------------------------------------------------------
# `ss` reports no sockets in this container, so a listener is detected by connecting to it rather
# than by listing them. Checked so that a re-run on resume or compact does not start a second copy.
port_free() { ! (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# The app front-end needs no credentials, so it comes up either way. `serve-or-build.ts` builds
# app/dist only when the cache is stale, which is why there is no separate `bun run build` here:
# rebuilding unconditionally would add ~45s to every session resume for no change.
if port_free 3010; then
  setsid nohup bash -c "cd '$OPENBOT_SRC/app' && bun scripts/serve-or-build.ts && exec bun $PRELOAD serve.ts" \
    >"$APP_LOG" 2>&1 </dev/null &
fi

# The API server reads its configuration at boot and throws on a missing Intelligence key rather
# than degrading, so starting it without one only produces a crash log.
missing=()
grep -qE '^INTELLIGENCE_API_KEY=.+' .env || missing+=(INTELLIGENCE_API_KEY)
grep -qE '^OPENAI_API_KEY=.+' .env || missing+=(OPENAI_API_KEY)

if [ ${#missing[@]} -eq 0 ]; then
  if port_free 3001; then
    setsid nohup bash -c "cd '$OPENBOT_SRC/server' && exec bun --env-file=../.env src/index.ts" \
      >"$SERVER_LOG" 2>&1 </dev/null &
  fi
else
  echo "OpenBot: API server not started, ${missing[*]} not set in $OPENBOT_SRC/.env"
  echo "OpenBot: get an Intelligence project key with 'npx --yes copilotkit@latest login && npx --yes copilotkit@latest project select'"
fi

echo "OpenBot: installed at $OPENBOT_SRC, database on localhost:5432, app on http://localhost:3010"
