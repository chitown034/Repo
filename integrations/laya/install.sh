#!/usr/bin/env bash
# install.sh — Laya, the zero-token System-1 router, into its own venv.
#
# Proven in the R11 sandbox, 2026-09-28: `uv venv` + `uv pip install "laya[mcp]==0.3.21"`
# succeeds from PyPI (no proxy needed there) in well under a minute. The model
# download step below needs Hugging Face, which THIS sandbox cannot reach
# (egress proxy: 403 Forbidden, confirmed both with curl and with the real
# `laya` CLI's own --predict path) — see integrations/laya/README.md for the
# exact evidence. Run this on the Mac, where Hugging Face is expected to be
# reachable; if it is not, this script says so and stops instead of hanging.
#
# Never run this against a prompt or file containing client PII. Laya runs
# fully local once its checkpoint is cached — nothing it does sends data
# anywhere — but the checkpoint DOWNLOAD itself is one outbound call to
# huggingface.co, and this script proves that path before anything else runs.

set -euo pipefail

VENV_DIR="${LAYA_VENV_DIR:-$HOME/laya-venv}"
LAYA_SPEC="laya[mcp]==0.3.21"

command -v uv >/dev/null 2>&1 || {
  echo "install.sh: 'uv' is not on PATH. Install it first: https://docs.astral.sh/uv/" >&2
  exit 1
}

echo "[1/4] uv venv at $VENV_DIR"
uv venv --python 3.11 "$VENV_DIR"

echo "[2/4] pip install $LAYA_SPEC (from PyPI — no Hugging Face needed for this step)"
uv pip install --python "$VENV_DIR/bin/python" "$LAYA_SPEC"

echo "[2b/4] version check (offline, no checkpoint) — laya's own recommended check"
"$VENV_DIR/bin/python" -I -c "import laya; print('laya', laya.__version__)"

echo "[3/4] Hugging Face reachability probe (HEAD only, no download)"
if "$VENV_DIR/bin/python" - <<'PY'
import sys
import urllib.request
req = urllib.request.Request("https://huggingface.co/api/models/convaiinnovations/laya", method="HEAD")
try:
    urllib.request.urlopen(req, timeout=15)
except Exception as exc:  # noqa: BLE001
    print(f"BLOCKED: {exc!r}", file=sys.stderr)
    sys.exit(1)
print("REACHABLE")
PY
then
  echo "[4/4] Hugging Face reachable — downloading the checkpoints Router() needs (english + multilingual; one-time, then cached under ~/.cache/huggingface)"
  "$VENV_DIR/bin/python" -c "from laya import Router; Router(preload=True); print('checkpoints cached')"
else
  echo "[4/4] Hugging Face is NOT reachable from this machine right now." >&2
  echo "      The venv and package are installed and correct — only the model" >&2
  echo "      download is blocked. Re-run this script once network access to" >&2
  echo "      huggingface.co is available; nothing else needs to change." >&2
  exit 2
fi

echo
echo "Done. Test it with:"
echo "  $VENV_DIR/bin/python integrations/laya/laya_route.py --engine real \"a non-PII test question\""
echo
echo "Register the MCP server with Claude Code (see README.md for the full command):"
echo "  claude mcp add laya --env LAYA_DEVICE=cpu -- $VENV_DIR/bin/laya-mcp-server"
