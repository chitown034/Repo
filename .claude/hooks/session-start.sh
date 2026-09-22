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

chmod +x "$ORCA_SRC/out/cli/index.js"
ln -sf "$ORCA_SRC/out/cli/index.js" /usr/local/bin/orca

# --- OmniRoute (https://github.com/diegosouzapw/OmniRoute) ---
# Free multi-provider AI gateway. Installed and kept running so Claude Code
# can be pointed at it instead of talking to Anthropic directly. Its
# "priority" combo strategy + circuit breaker auto-heal is what implements
# the subscription<->fallback transition: prefer the real Claude
# subscription, fail over to a free provider once it's rate-limited or
# exhausted, and automatically resume the Claude subscription once its quota
# window resets - no restart needed, since OmniRoute makes that decision
# per-request, transparently.
#
# Installing/running the gateway is scripted here; actually routing traffic
# through it (the ANTHROPIC_BASE_URL/ANTHROPIC_MODEL env block) still
# requires the one-time manual OAuth step documented in OMNIROUTE.md
# (connecting the real Claude subscription + a fallback provider, and
# creating the priority combo) - that can't be scripted since it needs a
# live login.
npm install --global --silent omniroute >/dev/null 2>&1 || true

# Any HTTP response (even 401 - no API key configured yet) means the server
# is already up; "000" means curl couldn't connect at all. curl's -w prints
# "000" itself on a failed connection (and nothing if it can't even do
# that), so only neutralize the exit code here - don't also echo a
# fallback, or a failed connection reports "000000".
OMNIROUTE_STATUS="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:20128/v1/models 2>/dev/null || true)"
if command -v omniroute >/dev/null 2>&1 && [ "$OMNIROUTE_STATUS" != "200" ] && [ "$OMNIROUTE_STATUS" != "401" ]; then
  nohup omniroute serve >/tmp/omniroute.log 2>&1 &
  disown || true
fi
