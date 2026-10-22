#!/bin/bash
# Keep Laya loaded on this Mac so the brain's route hint answers in milliseconds, not seconds.
# Localhost only: nothing on the network can reach it, and no text leaves the machine.
set -euo pipefail

VENV="${LAYA_VENV:-$HOME/Applications/laya-venv}"
if [ ! -x "$VENV/bin/laya-serve" ]; then
  echo "laya-serve not found in $VENV — run: $VENV/bin/python -m pip install 'laya[serve]'" >&2
  exit 1
fi

export LAYA_HOST=127.0.0.1
export LAYA_PORT="${LAYA_PORT:-8770}"       # not 8765: the Apple Health ingest daemon owns that port
export LAYA_PRELOAD=1
export LAYA_MODELS="${LAYA_MODELS:-english}" # one checkpoint resident keeps memory down
export LAYA_MAX_LOADED="${LAYA_MAX_LOADED:-1}"
export LAYA_LOG_LEVEL="${LAYA_LOG_LEVEL:-warning}"

exec "$VENV/bin/laya-serve"
