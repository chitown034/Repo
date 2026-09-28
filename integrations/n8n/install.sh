#!/usr/bin/env bash
# integrations/n8n/install.sh — Steven's Mac only. Ready to install; nothing here has run on a
# Mac. Loopback-only n8n, an owner account Steven creates by hand, and a data directory that
# survives restarts. Two methods:
#   ./install.sh            (default) npm-global — what R9 actually started and tested, see
#                            ../../$S/r9/work-C2-fabric/n8n-test/ in the engineering log, not this repo.
#   ./install.sh --docker   Docker Compose, matching OpenWA's own docker-native shape. Its YAML
#                            was validated with `docker compose config` but never run (no
#                            container runtime in the R9 sandbox) — validate once more on the
#                            Mac with the same command before trusting it.
#
# Never installs anything client-facing. Never prints, requests or stores a real secret --
# the two values below are generated locally with openssl and never leave this Mac.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

MODE="npm"
if [ "${1:-}" = "--docker" ]; then MODE="docker"; fi

if [ ! -f .env ]; then
  cp .env.example .env
  ENC_KEY="$(openssl rand -hex 32)"
  TOKEN="$(openssl rand -hex 24)"
  # BSD sed (macOS) needs -i '' ; GNU sed needs -i with no argument. Try BSD form first.
  if sed -i '' "s/^N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=${ENC_KEY}/" .env 2>/dev/null; then
    sed -i '' "s/^OPENWA_WEBHOOK_TOKEN=.*/OPENWA_WEBHOOK_TOKEN=${TOKEN}/" .env
  else
    sed -i "s/^N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=${ENC_KEY}/" .env
    sed -i "s/^OPENWA_WEBHOOK_TOKEN=.*/OPENWA_WEBHOOK_TOKEN=${TOKEN}/" .env
  fi
  echo "Wrote integrations/n8n/.env with a fresh N8N_ENCRYPTION_KEY and OPENWA_WEBHOOK_TOKEN."
  echo "Both are local-only values; .env is gitignored and this script never prints them again."
fi

mkdir -p data workflows

if [ "$MODE" = "docker" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker Desktop is required for --docker. Install it, or drop --docker for the npm path." >&2
    exit 1
  fi
  docker compose config >/dev/null   # fail fast on a bad .env/YAML before starting anything
  docker compose up -d
  echo "n8n starting via Docker on http://127.0.0.1:\${N8N_PORT:-5678} (loopback only)."
else
  if ! command -v npm >/dev/null 2>&1; then
    echo "Node.js/npm is required (n8n needs Node >= 24). Install it, then re-run." >&2
    exit 1
  fi
  if ! command -v n8n >/dev/null 2>&1; then
    echo "Installing n8n globally (npm install -g n8n) -- one-time, may take a few minutes."
    npm install -g n8n
  fi
  set -a; source .env; set +a
  export N8N_USER_FOLDER="$(pwd)/data"
  echo "Starting n8n on http://127.0.0.1:${N8N_PORT:-5678} (loopback only). Ctrl-C to stop;"
  echo "run this script again (or 'n8n start' with the same env) to resume -- data/ persists it."
  exec n8n start
fi

cat <<'EOF'

NEXT (Steven, by hand -- never scripted):
  1. Open the URL above once and create the OWNER account yourself in n8n's first-run wizard.
  2. Workflows -> Import from File -> add every file in integrations/n8n/workflows/.
  3. Each imported workflow needs credentials it does not ship with (by design -- see each
     workflow's header comment). Create them in n8n's Credentials screen; this script and this
     repo never hold a credential value.
  4. Coordinate with the OpenWA install (integrations/openwa/) for the webhook side of the
     bridge workflow -- its README names the exact webhook URL and header to set on OpenWA.
EOF
