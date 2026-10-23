#!/bin/bash
# second-mac.sh - bring a SECOND Mac up to the same brain as Mac 1 in one paste (2026-10-23). Bash 3.2 safe.
#
#   bash scripts/second-mac.sh            installs the basics, then runs connect-all.sh (which asks its one question)
#   bash scripts/second-mac.sh --preview  shows the plan, changes nothing
#
# Basics it installs only when missing: Xcode command-line tools (Apple's own dialog), Homebrew (official installer -
# it asks for your Mac password itself), Claude Code (official installer), uv (for Laya). Then the lease role file
# (`peer`, the same word as Mac 1 - docs/SECOND-MAC-SETUP.md 11b), then connect-all.sh. It never signs in anywhere,
# never copies a credential, never pairs. Two things stay yours on a second Mac: `claude` sign-in, and the task runner
# (claude-runner lives only on Mac 1; its copy step is added once Mac 1 reports where it lives).
set -u
PREVIEW=0; [ "${1:-}" = "--preview" ] && PREVIEW=1
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
say() { printf '%s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }
run() { if [ "$PREVIEW" = 1 ]; then say "  would run: $*"; else "$@"; fi; }
brew_install() { /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; }
claude_install() { curl -fsSL https://claude.ai/install.sh | bash; }

[ "$(uname -s)" = Darwin ] || [ "${GO_FORCE:-}" = 1 ] || { say "This is for a Mac."; exit 1; }
say "Second Mac - $(scutil --get ComputerName 2>/dev/null || hostname -s) - $(date)"

say ""; say "== 0a Xcode command-line tools (git) =="
if xcode-select -p >/dev/null 2>&1; then say "  present"
else say "  Apple's install window opens: click Install, wait, then paste the same line again"; run xcode-select --install; [ "$PREVIEW" = 1 ] || exit 2; fi

say ""; say "== 0b Homebrew =="
if have brew; then say "  present"
else
  say "  official installer (it asks for your Mac password itself; nothing is sent anywhere else)"
  run brew_install || { say "  Homebrew did not finish - rerun"; exit 1; }
  [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
fi

say ""; say "== 0c Claude Code =="
if have claude; then say "  present: $(claude --version 2>/dev/null | head -1)"
else run claude_install || { say "  Claude Code install did not finish"; exit 1; }
  [ -x "$HOME/.local/bin/claude" ] && export PATH="$HOME/.local/bin:$PATH"; fi

say ""; say "== 0d uv (Laya's installer) =="
if have uv; then say "  present"; else run brew install uv || say "  uv did not install - Laya step will say so"; fi

say ""; say "== 0d2 Python 3.10+ (the brain, the Agent OS and Jarvis's checks need it; a fresh Mac ships 3.9) =="
pyver() { python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])' 2>/dev/null || echo 0.0; }
py_ok() { python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; }
# uv first: it downloads a ready-built CPython (no compiler, no Homebrew bottle needed - Mac 2 is an Intel Mac on macOS 26,
# where Homebrew builds python from source and stops on outdated Command Line Tools). The shim ~/.local/bin/python3 is
# user-level only (same folder Claude Code's own installer uses) and never touches /usr/bin.
py_via_uv() {
  local p
  uv python install 3.12 >/dev/null 2>&1 || return 1
  p="$(uv python find 3.12 2>/dev/null)"; [ -x "$p" ] || return 1
  mkdir -p "$HOME/.local/bin" && ln -sfn "$p" "$HOME/.local/bin/python3" && ln -sfn "$p" "$HOME/.local/bin/python3.12" || return 1
  grep -qs 'HOME/.local/bin' "$HOME/.zprofile" 2>/dev/null || printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$HOME/.zprofile"
  echo "python3 -> $p (shim in ~/.local/bin)"
}
if py_ok; then say "  present: $(pyver)"
else
  say "  found $(pyver) - installing a ready-built Python 3.12 with uv (free, no compiler)"
  if have uv; then run py_via_uv || say "  uv could not install Python - trying Homebrew"; fi
  export PATH="$HOME/.local/bin:$PATH"
  if ! py_ok && have brew; then run brew install python || say "  Homebrew python did not install (on an Intel Mac it builds from source and needs current Command Line Tools)"
    for d in /opt/homebrew/bin /usr/local/bin; do [ -x "$d/python3" ] && export PATH="$d:$PATH"; done; fi
  if py_ok; then say "  now $(pyver)"; else say "  still $(pyver): open a NEW Terminal window and paste the same line again"; fi
fi

say ""; say "== 0d3 Claude Code 2.1.287+ (the mods need it) =="
cver() { claude --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1; }
cver_ok() { printf '%s\n%s\n' "2.1.287" "$(cver)" | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | grep -qx "$(cver)"; }
if have claude && cver_ok; then say "  present: $(cver)"; elif have claude; then say "  $(cver) is older - updating"; run claude update || say "  claude update did not finish"; fi

say ""; say "== 0e Lease role: peer (same word as Mac 1) =="
if [ -s "$HOME/.config/claude-runner/role" ]; then say "  kept: $(head -1 "$HOME/.config/claude-runner/role")"
else run mkdir -p "$HOME/.config/claude-runner"; [ "$PREVIEW" = 1 ] || printf 'peer\n' > "$HOME/.config/claude-runner/role"; say "  wrote peer"; fi

say ""; say "== 1 Everything else: connect-all.sh =="
if [ "$PREVIEW" = 1 ]; then run bash "$REPO_DIR/connect-all.sh" --preview; else CONNECT_ALL_YES=1 bash "$REPO_DIR/connect-all.sh"; fi

say ""; say "Second Mac - still yours:"
say "  a. Sign in Claude Code once: run  claude  and follow the browser sign-in (your subscription)."
say "  b. The task runner lives only on Mac 1. On MAC 1 paste:  command -v runnerctl; ls ~/Library/LaunchAgents | grep -i runner"
say "     and send Claude the two lines; the copy step for this Mac is added from that (never a token - you run  runnerctl login  here)."
say "  c. Orca: Add Project -> this Repo folder, then pair the phone/Mac 1 (bash integrations/remote-control/orca-remote.sh pair)."
say "  d. AnyDesk permissions (Screen Recording + Accessibility), then its ID into the Computer Hub card."
