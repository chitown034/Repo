#!/usr/bin/env bash
# Perplexica (upstream name: Vane) — a self-hosted AI answering engine (SearxNG web search + any LLM).
# Steven, 2026-11-09: "install https://github.com/BunsDev/perplexica-search-engine-ai.git".
# Runs on the Mac in Docker, at http://localhost:3010 (3000 is OpenStock's port). Nothing leaves the Mac except the
# web searches SearxNG makes and the model calls to whichever provider you pick in its Settings.
# Usage:  bash integrations/perplexica/install.sh          (install or update, then start)
#         bash integrations/perplexica/install.sh stop     (stop it)
set -euo pipefail
REPO=https://github.com/BunsDev/perplexica-search-engine-ai.git
PIN=348feca3e378fb4157b217724ed508dc707f853f   # reviewed 2026-11-09 (Vane 1.12.2); bump only after a re-review
DIR="$HOME/Apps/perplexica"; PORT=3010; NAME=perplexica
if [ "${1:-}" = "stop" ]; then docker stop "$NAME" >/dev/null && echo "Perplexica stopped."; exit 0; fi
command -v docker >/dev/null || { echo "Docker Desktop is not installed. Install it from https://www.docker.com/products/docker-desktop/ , open it once, then run this again."; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker Desktop is installed but not running. Open Docker Desktop, wait for the whale icon to settle, then run this again."; exit 1; }
mkdir -p "$HOME/Apps"
if [ -d "$DIR/.git" ]; then git -C "$DIR" fetch -q origin; else git clone -q "$REPO" "$DIR"; fi
git -C "$DIR" checkout -q "$PIN"
echo "Building Perplexica from the pinned source (first build takes 5–10 minutes)…"
docker build -q -t perplexica:local "$DIR" >/dev/null
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --restart unless-stopped -p 127.0.0.1:$PORT:3000 -v perplexica-data:/home/vane/data perplexica:local >/dev/null
for i in $(seq 1 60); do curl -fsS "http://localhost:$PORT" >/dev/null 2>&1 && break; sleep 2; done
if curl -fsS "http://localhost:$PORT" >/dev/null 2>&1; then
  echo "Perplexica is running: http://localhost:$PORT"
  echo "First time: open it, go to Settings, and pick a model — Ollama (free, local) if Ollama is installed, or Anthropic and paste your own API key there yourself."
  open "http://localhost:$PORT" 2>/dev/null || true
else
  echo "Perplexica did not answer on port $PORT yet. Check: docker logs $NAME | tail -40"; exit 1
fi
