#!/usr/bin/env bash
# AI Engineering from Scratch — rohitg00's open curriculum (MIT): 542 lessons, 20 phases, Python/TypeScript/Rust/Julia.
# Steven, 2026-11-09: "install https://github.com/rohitg00/ai-engineering-from-scratch.git".
# Usage:  bash integrations/ai-engineering-from-scratch/install.sh            (clone or update, ~250 MB)
#         bash integrations/ai-engineering-from-scratch/install.sh --python   (also build a Python venv for the labs; adds PyTorch, several GB)
set -euo pipefail
REPO=https://github.com/rohitg00/ai-engineering-from-scratch.git
DIR="$HOME/Learning/ai-engineering-from-scratch"
mkdir -p "$HOME/Learning"
if [ -d "$DIR/.git" ]; then git -C "$DIR" pull -q --ff-only; else git clone -q --depth 1 "$REPO" "$DIR"; fi
echo "Curriculum at $DIR ($(git -C "$DIR" log -1 --format=%cd --date=short))."
if [ "${1:-}" = "--python" ]; then
  command -v python3 >/dev/null || { echo "python3 not found"; exit 1; }
  python3 -m venv "$DIR/.venv" && "$DIR/.venv/bin/pip" install -q --upgrade pip && "$DIR/.venv/bin/pip" install -q -r "$DIR/requirements.txt"
  echo "Lab environment ready: source $DIR/.venv/bin/activate"
fi
echo "Start: open https://aiengineeringfromscratch.com or read $DIR/README.md (phase 00 = setup)."
open "$DIR" 2>/dev/null || true
