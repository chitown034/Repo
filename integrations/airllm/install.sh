#!/usr/bin/env bash
# AirLLM on Steven's Mac (2026-11-23, Steven: "install https://github.com/lyogavin/airllm.git").
# Runs big open models locally by streaming one layer at a time from disk: slow, but no cloud and no big GPU.
# Mac rules (AirLLM's own README): Apple silicon only; on macOS only Llama-style models (LlamaForCausalLM,
# MistralForCausalLM) run. Usage:
#   bash integrations/airllm/install.sh            # venv at ~/airllm/.venv + airllm 4.0.0 + mlx + torch
#   bash integrations/airllm/install.sh smoke      # tiny open test model (TinyLlama 1.1B, ~2.2 GB download)
#   bash integrations/airllm/install.sh status
# Nothing here sends anything anywhere except Hugging Face model downloads. No key is read or stored by this
# script; a gated model (e.g. Meta Llama) needs Steven's own `huggingface-cli login` first.
set -euo pipefail
PIN_PKG="airllm==4.0.0"           # PyPI release matching upstream commit 7f7b518 (2026-11-23)
HOME_DIR="${AIRLLM_HOME:-$HOME/airllm}"
VENV="$HOME_DIR/.venv"
HERE="$(cd "$(dirname "$0")" && pwd)"
SMOKE_MODEL="${AIRLLM_SMOKE_MODEL:-TinyLlama/TinyLlama-1.1B-Chat-v1.0}"

need_mac() {
  [ "$(uname -s)" = "Darwin" ] || { echo "airllm: this installer is for the Mac (found $(uname -s))"; exit 1; }
  [ "$(uname -m)" = "arm64" ] || { echo "airllm: AirLLM on macOS needs Apple silicon (found $(uname -m))"; exit 1; }
}

install() {
  need_mac
  command -v python3 >/dev/null || { echo "airllm: python3 not found (brew install python@3.12)"; exit 1; }
  python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' || { echo "airllm: needs Python 3.9+"; exit 1; }
  mkdir -p "$HOME_DIR"
  [ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
  "$VENV/bin/python" -m pip install -q --upgrade pip
  "$VENV/bin/python" -m pip install -q "$PIN_PKG" mlx torch
  cp "$HERE/ask.py" "$HOME_DIR/ask.py"
  echo "airllm: installed $("$VENV/bin/python" -m pip show airllm | awk '/^Version/{print $2}') in $VENV"
  echo "airllm: try  $VENV/bin/python $HOME_DIR/ask.py --model $SMOKE_MODEL 'What is the capital of the United States?'"
}

smoke() {
  need_mac
  [ -x "$VENV/bin/python" ] || install
  "$VENV/bin/python" "$HOME_DIR/ask.py" --model "$SMOKE_MODEL" --max-new-tokens 12 "What is the capital of the United States?"
}

status() {
  if [ -x "$VENV/bin/python" ]; then
    echo "airllm: $("$VENV/bin/python" -m pip show airllm 2>/dev/null | awk '/^Version/{print "version " $2}') at $VENV"
    du -sh "$HOME_DIR/layers" 2>/dev/null | awk '{print "airllm: split-layer cache " $1}' || true
  else
    echo "airllm: not installed (bash integrations/airllm/install.sh)"
  fi
}

case "${1:-install}" in
  install) install ;;
  smoke) smoke ;;
  status) status ;;
  *) echo "usage: $0 [install|smoke|status]"; exit 2 ;;
esac
