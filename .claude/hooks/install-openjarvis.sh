#!/bin/bash
set -euo pipefail

# Install the OpenJarvis CLI (https://github.com/open-jarvis/OpenJarvis) so
# `jarvis` is on PATH in every remote session.
#
# Mirrors OpenJarvis's own installer (scripts/install/install.sh upstream) and
# its on-disk layout, so `jarvis doctor`, `jarvis self-update` and
# `jarvis-uninstall` work as documented:
#   $OPENJARVIS_HOME/src        git checkout (editable install)
#   $OPENJARVIS_HOME/.venv      uv-managed virtualenv
#   $OPENJARVIS_HOME/.scripts   upstream helper scripts (wrapper, uninstall, ...)
#   $OPENJARVIS_HOME/.state     install-state.json, logs, background-work markers
#   ~/.local/bin/jarvis         symlink to the upstream wrapper script
#
# The upstream one-liner can't be piped here: it refuses to run as root (this
# container is root), and it installs Ollama and pulls a 1.5 GB model, which
# is pointless without a GPU and would be thrown away with this ephemeral
# container. So there are no local models: use a cloud engine instead (export
# ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY in the environment
# and the generated config picks it up, or run `jarvis init`).
#
# The Rust extension (openjarvis_rust: agent tools, security checks, memory)
# is built in the background like upstream does, about two minutes of cargo
# work after the session starts. `jarvis doctor` shows its status.

# Only relevant for Claude Code on the web / remote sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

OPENJARVIS_HOME="${OPENJARVIS_HOME:-$HOME/.openjarvis}"
OPENJARVIS_REPO="${OPENJARVIS_REPO_URL:-https://github.com/open-jarvis/OpenJarvis.git}"
SRC_DIR="$OPENJARVIS_HOME/src"
VENV_DIR="$OPENJARVIS_HOME/.venv"
STATE_DIR="$OPENJARVIS_HOME/.state"
SCRIPTS_DIR="$OPENJARVIS_HOME/.scripts"
LOG="$STATE_DIR/session-start.log"

mkdir -p "$OPENJARVIS_HOME" "$STATE_DIR" "$SCRIPTS_DIR" "$HOME/.local/bin"
: > "$LOG"

# Tool chatter goes to the log, not the session context; show it on failure.
on_error() {
  echo "install-openjarvis.sh: failed; last lines of $LOG:" >&2
  tail -n 30 "$LOG" >&2
}
trap on_error ERR

# Blobless rather than shallow clone, as upstream: hatch-vcs derives the
# version from release tags, and `jarvis self-update` fast-forwards it later.
if [ -d "$SRC_DIR/.git" ]; then
  before="$(git -C "$SRC_DIR" rev-parse HEAD)"
  git -C "$SRC_DIR" pull --ff-only --quiet >>"$LOG" 2>&1 \
    || echo "install-openjarvis.sh: could not fast-forward $SRC_DIR; keeping the current checkout" >&2
  # A moved checkout needs the Rust extension rebuilt to match.
  [ "$(git -C "$SRC_DIR" rev-parse HEAD)" = "$before" ] || rm -f "$STATE_DIR/extension-built"
else
  rm -rf "$SRC_DIR"
  git clone --quiet --filter=blob:none "$OPENJARVIS_REPO" "$SRC_DIR" >>"$LOG" 2>&1
fi

cp -f "$SRC_DIR"/scripts/install/*.sh "$SCRIPTS_DIR/"
chmod +x "$SCRIPTS_DIR"/*.sh

# Editable install from the committed lockfile (what upstream CI tests) into
# the venv beside src/ that the wrapper and `jarvis self-update` expect.
# --inexact keeps packages not in the lockfile: the Rust extension installed
# by the background build, and extras added by hand.
(cd "$SRC_DIR" && UV_PROJECT_ENVIRONMENT="$VENV_DIR" uv sync --inexact >>"$LOG" 2>&1)

# Initial config.toml (+ SOUL.md / MEMORY.md / USER.md) with upstream's
# defaults; switches to a cloud engine when a provider API key is in the env.
# Never overwrites an existing config.
if [ ! -f "$OPENJARVIS_HOME/config.toml" ]; then
  "$VENV_DIR/bin/jarvis" _bootstrap --write-config \
    --engine ollama --model qwen3.5:2b --prefer-cloud-when-available >>"$LOG" 2>&1
fi

ln -sf "$SCRIPTS_DIR/jarvis-wrapper.sh" "$HOME/.local/bin/jarvis"
ln -sf "$SCRIPTS_DIR/jarvis-uninstall.sh" "$HOME/.local/bin/jarvis-uninstall"

# Record the completed steps in upstream's format so `jarvis-uninstall`
# recognises this tree as an OpenJarvis install.
cat > "$STATE_DIR/install-state.json" <<'EOF'
{
  "install_uv": true,
  "clone_repo": true,
  "copy_scripts": true,
  "create_venv": true,
  "editable_install": true,
  "write_config": true,
  "install_symlinks": true,
  "ensure_path": true,
  "wsl": false
}
EOF

# Rust extension via upstream's background orchestrator, built with the
# preinstalled stable cargo (newer than the 1.88 minimum pinned in
# rust/rust-toolchain.toml). It writes .state/extension-built or
# extension-failed when done. UV_PROJECT_ENVIRONMENT points
# build-extension.sh's `uv run` at the venv above instead of a second one
# under src/.venv. Detached in its own session with no inherited stdio, so
# the hook returns without waiting for it.
if [ -f "$STATE_DIR/extension-built" ]; then
  EXT_STATUS="Rust extension ready"
elif [ -f "$STATE_DIR/bg.pid" ] && kill -0 "$(cat "$STATE_DIR/bg.pid")" 2>/dev/null; then
  EXT_STATUS="Rust extension still building in the background"
else
  UV_PROJECT_ENVIRONMENT="$VENV_DIR" setsid nohup "$SCRIPTS_DIR/bg-orchestrator.sh" \
    > "$STATE_DIR/bg-orchestrator.log" 2>&1 < /dev/null &
  EXT_STATUS="Rust extension building in the background (~2 min)"
fi

VERSION="$("$VENV_DIR/bin/jarvis" --version)"
echo "OpenJarvis installed ($VERSION) at $OPENJARVIS_HOME; \`jarvis\` is on PATH. $EXT_STATUS; \`jarvis doctor\` shows status. No local models: configure a cloud engine with \`jarvis init\`."
