#!/usr/bin/env bash
# Launcher for the vendored cli-anything-browser harness.
#
# Everything the harness's security posture depends on has to be in place
# BEFORE the Python interpreter starts, because utils/security.py reads its
# flags at module import time. That is this script's whole job:
#
#   F-P1-05  CLI_ANYTHING_BROWSER_BLOCK_PRIVATE=true is exported first.
#   F-P1-02  runtime/bin is put at the head of PATH, so the harness's
#            `npx -p @apireno/domshell …` spawn is answered by the shim from
#            the lockfile-pinned local copy and never by the npm registry;
#            cwd is also moved into the pin tree so even a bare npx resolves
#            locally.
#   F-P1-06  the REPL history directory is created 0700 / 0600 before the
#            REPL can create it world-readable.
#
# Usage:
#   run-browser-harness.sh fs ls /
#   run-browser-harness.sh --json fs cat /main/title
#   run-browser-harness.sh                      # interactive REPL
#
# Overrides (export before calling):
#   CLI_ANYTHING_VENV             default ~/Applications/cli-anything-harnesses/.venv
#   CLI_ANYTHING_DOMSHELL_PIN_DIR default ~/Applications/cli-anything-harnesses/domshell-pin
#   CLI_ANYTHING_BROWSER_BIN      default $CLI_ANYTHING_VENV/bin/cli-anything-browser

set -euo pipefail

HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# 1. Posture environment. `set -a` exports every assignment in the file.
set -a
# shellcheck source=/dev/null
. "$HERE/browser-harness.env"
set +a

: "${CLI_ANYTHING_VENV:=$HOME/Applications/cli-anything-harnesses/.venv}"
: "${CLI_ANYTHING_BROWSER_BIN:=$CLI_ANYTHING_VENV/bin/cli-anything-browser}"

# 2. The shim goes first on PATH.
PATH="$HERE/bin:$PATH"; export PATH

# 3. History directory, locked down before the REPL can create it (F-P1-06).
#    The REPL does `hist_dir.mkdir(parents=True, exist_ok=True)` and leaves an
#    existing directory's mode alone, so creating it here wins.
hist_dir="$HOME/.cli-anything-browser"
mkdir -p "$hist_dir"
chmod 700 "$hist_dir"
if [ -e "$hist_dir/history" ]; then
    chmod 600 "$hist_dir/history"
fi

# 4. Pinned-package resolution is cwd-sensitive, so run from the pin tree.
if [ -d "$CLI_ANYTHING_DOMSHELL_PIN_DIR" ]; then
    cd "$CLI_ANYTHING_DOMSHELL_PIN_DIR"
else
    echo "run-browser-harness.sh: no pin tree at $CLI_ANYTHING_DOMSHELL_PIN_DIR" >&2
    echo "run-browser-harness.sh: run $HERE/posture.sh install first" >&2
    exit 1
fi

if [ ! -x "$CLI_ANYTHING_BROWSER_BIN" ]; then
    echo "run-browser-harness.sh: $CLI_ANYTHING_BROWSER_BIN not found or not executable" >&2
    exit 1
fi

exec "$CLI_ANYTHING_BROWSER_BIN" "$@"
