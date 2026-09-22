#!/bin/bash
set -euo pipefail

# Only relevant for Claude Code on the web / remote sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ORCA_SRC="/root/.orca-src"
ORCA_REPO="https://github.com/stablyai/orca"

# pnpm's "manage-package-manager-versions" feature tries to auto-switch to the
# exact pnpm version pinned in Orca's package.json ("packageManager" field).
# That auto-installed pnpm build is broken in this environment (ships as an
# unbuilt placeholder), so pin pnpm to whatever is already on PATH instead.
pnpm config set manage-package-manager-versions false --global >/dev/null 2>&1 || true

if [ -d "$ORCA_SRC/.git" ]; then
  git -C "$ORCA_SRC" fetch --depth 1 origin >/dev/null 2>&1
  git -C "$ORCA_SRC" reset --hard origin/HEAD >/dev/null 2>&1
else
  rm -rf "$ORCA_SRC"
  git clone --depth 1 "$ORCA_REPO" "$ORCA_SRC"
fi

cd "$ORCA_SRC"

# oxlint-plugin-anti-slop is pinned to a raw GitHub commit tarball
# (codeload.github.com), which 403s for anonymous fetches through this
# environment's HTTPS egress proxy. `git clone` over the smart-HTTP protocol
# is allowed, so resolve the same pinned commit that way and swap the
# dependency to a local tarball built from it. It's a lint-only
# devDependency, unused by the CLI build itself.
node -e '
  const fs = require("fs");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dep = pkg.devDependencies && pkg.devDependencies["oxlint-plugin-anti-slop"];
  if (dep && dep.startsWith("github:")) {
    const ref = dep.split("#")[1];
    fs.writeFileSync("/tmp/anti-slop-ref", ref);
    pkg.devDependencies["oxlint-plugin-anti-slop"] = "file:/tmp/anti-slop.tar.gz";
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  }
'
if [ -f /tmp/anti-slop-ref ]; then
  rm -rf /tmp/anti-slop-src
  git clone https://github.com/dmmulroy/anti-slop /tmp/anti-slop-src >/dev/null 2>&1
  git -C /tmp/anti-slop-src archive --format=tar.gz -o /tmp/anti-slop.tar.gz "$(cat /tmp/anti-slop-ref)"
fi

pnpm install --no-frozen-lockfile
pnpm run build:cli
# Builds out/main + out/preload + out/renderer, the pieces `orca-dev serve`
# needs to actually launch Electron as a headless runtime (out/cli alone is
# just a thin client with nothing to talk to).
pnpm run build:electron-vite

chmod +x "$ORCA_SRC/out/cli/index.js"
ln -sf "$ORCA_SRC/out/cli/index.js" /usr/local/bin/orca

# Electron refuses to start as root without --no-sandbox / this env var; there
# is no setuid sandbox helper available in this container anyway.
export ELECTRON_DISABLE_SANDBOX=1

ORCA_SERVE_LOG="/root/.orca-serve.log"
ORCA_SERVE_PID_FILE="/root/.orca-serve.pid"

runtime_reachable() {
  orca-dev status --json 2>/dev/null | node -e '
    let d = "";
    process.stdin.on("data", c => (d += c));
    process.stdin.on("end", () => {
      try {
        process.exit(JSON.parse(d).result?.runtime?.reachable ? 0 : 1)
      } catch {
        process.exit(1)
      }
    })
  '
}

# `orca-dev serve` runs in the foreground forever, so only (re-)launch it if
# nothing is already listening (re-running this hook on resume/compact should
# not spawn a second runtime process).
if ! runtime_reachable; then
  nohup orca-dev serve --json >"$ORCA_SERVE_LOG" 2>&1 &
  echo $! >"$ORCA_SERVE_PID_FILE"
  for _ in $(seq 1 60); do
    if grep -q '"type":"orca_server_ready"' "$ORCA_SERVE_LOG" 2>/dev/null; then
      break
    fi
    sleep 1
  done
fi

# Register this checkout with Orca so it shows up as a managed project,
# without piling up duplicate entries across hook re-runs.
if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  repo_already_tracked=$(orca-dev repo list --json 2>/dev/null | node -e '
    let d = "";
    process.stdin.on("data", c => (d += c));
    process.stdin.on("end", () => {
      try {
        const repos = JSON.parse(d).result?.repos ?? []
        console.log(repos.some(r => r.path === process.env.CLAUDE_PROJECT_DIR) ? "1" : "0")
      } catch {
        console.log("0")
      }
    })
  ')
  if [ "$repo_already_tracked" != "1" ]; then
    orca-dev repo add --path "$CLAUDE_PROJECT_DIR" --json >/dev/null 2>&1 || true
  fi
fi
