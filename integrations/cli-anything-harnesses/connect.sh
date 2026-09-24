#!/usr/bin/env bash
# connect.sh — one guided command through CLI-Anything's install -> posture -> discover ->
# "what's left for you" -> the cliAnythingStatus paste line. Written R6, 2026-09-24, for
# Steven's request: "connect the sites and feeds that aren't in Composio or have an API."
#
#   integrations/cli-anything-harnesses/connect.sh            # do it
#   integrations/cli-anything-harnesses/connect.sh --dry-run  # print every command, change nothing
#
# What it does, in order, and nothing else:
#   1. Installs anything still missing — browser first, then the eight site packages, into the
#      ONE venv — by calling ./MAC-SETUP.sh --only cli-anything --only cli-anything-harnesses,
#      exactly the way the repo already does it. Skipped if all nine console scripts exist.
#   2. Runs the posture check (browser/runtime/posture.sh check) — proves SSRF blocking, the
#      pinned DOMShell, the injection guard and 0700 history are actually in force, not just
#      configured.
#   3. For every DOMShell recipe whose policy gate (if it has one) is open, runs --discover once
#      and reports OK / disabled-by-policy / failed. A failure here (no DOMShell, not signed in,
#      Chrome not running) is reported, never fatal — this is a status pass, not an installer.
#   4. Prints exactly which sites need a hand sign-in, and which approvals are still pending: the
#      ECC date for SkySlope/zipForms, and the three publicfeeds terms-of-service dates.
#   5. Prints the paste-ready line that starts the cli-anything-status task, which is the ONLY
#      thing allowed to write the cliAnythingStatus document (routines/mac-task-repairs.md §9).
#
# It is idempotent — re-run it any time, including right after step 1 fails partway.
# It NEVER signs in to anything (the harnesses cannot; MFA/SSO is a HALT, not a puzzle) and NEVER
# stores, prints, echoes or logs a credential value — only names, env var names and file paths.
# Written for macOS /bin/bash 3.2: no associative arrays, no mapfile, no ${x^^}, no &>>.

set -uo pipefail

HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$HERE/../.." && pwd)"
CAH_DIR="$HOME/Applications/cli-anything-harnesses"
CAH_BIN="$CAH_DIR/.venv/bin"
LOCAL_BIN="$HOME/.local/bin"
POSTURE="$HERE/browser/runtime/posture.sh"

DRY_RUN=0
for _a in "$@"; do [ "$_a" = "--dry-run" ] && DRY_RUN=1; done

# Telemetry is opt-OUT (cli_hub/analytics.py reports this machine's hostname on every call) —
# set it before anything below could invoke cli-hub or a harness, same as MAC-SETUP.sh does.
export CLI_HUB_NO_ANALYTICS=1
export PATH="$CAH_BIN:$LOCAL_BIN:$PATH"

say()     { printf '%s\n' "$*"; }
section() { say ""; say "== $* =="; }

have() { command -v "$1" >/dev/null 2>&1; }

# Every package this repo vendors, plus which console script proves it is installed.
CAH_PKGS="browser homes showingtime showami skyslope zipforms lofty zoho publicfeeds"

# --------------------------------------------------------------------- 1. install if missing
section "1. Install"
need_install=0
for p in $CAH_PKGS; do
  have "cli-anything-$p" && continue
  [ -x "$CAH_BIN/cli-anything-$p" ] && continue
  need_install=1
done
if [ "$need_install" -eq 1 ]; then
  say "One or more harnesses are missing from $CAH_BIN — running the same steps MAC-SETUP.sh"
  say "already scripts: hub + plugin, then the vendored browser engine and all eight site CLIs"
  say "in one venv, browser first."
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  (dry run) $REPO_DIR/MAC-SETUP.sh --only cli-anything --only cli-anything-harnesses"
  elif [ -x "$REPO_DIR/MAC-SETUP.sh" ]; then
    ( cd "$REPO_DIR" && ./MAC-SETUP.sh --only cli-anything --only cli-anything-harnesses )
  else
    say "  MAC-SETUP.sh not found or not executable at $REPO_DIR — run it yourself, then re-run this script."
  fi
else
  say "All nine harnesses already present in $CAH_BIN — nothing to install. (Safe to re-run any time.)"
fi
export PATH="$CAH_BIN:$LOCAL_BIN:$PATH"

# --------------------------------------------------------------------- 2. posture
section "2. Posture check"
if [ "$DRY_RUN" -eq 1 ]; then
  say "  (dry run) $POSTURE check"
elif [ -x "$POSTURE" ]; then
  if "$POSTURE" check; then
    say "posture: OK — SSRF blocking, pinned DOMShell, the injection guard and 0700 history are all in force."
  else
    say "posture: NOT fully in force. On a fresh Mac, run '$POSTURE install' first (needs npm), then re-run this script."
  fi
else
  say "posture.sh not found at $POSTURE — this checkout looks incomplete."
fi

# --------------------------------------------------------------------- 3. discover
# python3 is a hard dependency of every harness already (they are Python packages); reused here
# to parse --json output correctly instead of pattern-matching raw JSON text in shell.
section "3. --discover per gate-open recipe (best-effort; a failure here is reported, not fatal)"

discover_dynamic_recipes() {  # discover_dynamic_recipes <pkg>  — homes/showingtime/showami/publicfeeds shape
  _pkg=$1; _bin="cli-anything-$_pkg"
  if ! have "$_bin"; then say "  $_pkg: not installed, skipping"; return; fi
  _names=$("$_bin" --json recipes 2>/dev/null | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
for r in d.get("recipes", []):
    print(r.get("name", ""))
' 2>/dev/null)
  if [ -z "$_names" ]; then say "  $_pkg: could not list recipes (harness not installed, or paths.json unreadable)"; return; fi
  for _name in $_names; do
    if [ "$DRY_RUN" -eq 1 ]; then say "  (dry run) $_bin --json recipe $_name --discover"; continue; fi
    _out=$("$_bin" --json recipe "$_name" --discover 2>&1); _rc=$?
    case "$_rc" in
      0) say "  $_pkg/$_name: discover OK — edit ~/.config/cli-anything/$_pkg-paths.json, then re-run without --discover" ;;
      3) say "  $_pkg/$_name: disabled-by-policy — gate closed, skipped" ;;
      *) _short=$(printf '%s' "$_out" | tr '\n' ' ' | cut -c1-140)
         say "  $_pkg/$_name: discover failed (exit $_rc) — $_short" ;;
    esac
  done
}

for p in homes showingtime showami publicfeeds; do discover_dynamic_recipes "$p"; done

# SkySlope / zipForms: ONE top-level `discover --url` (not per-recipe), and every non-list
# recipe needs an --id this script does not have. So: report the ECC gate only, and name the
# one command that is safe to run without an id, rather than guessing at IDs.
for p in skyslope zipforms; do
  bin="cli-anything-$p"
  if ! have "$bin"; then say "  $p: not installed, skipping"; continue; fi
  if [ "$DRY_RUN" -eq 1 ]; then say "  (dry run) $bin --json gate status"; continue; fi
  gate_ok=$("$bin" --json gate status 2>/dev/null | python3 -c '
import json, sys
try:
    print("1" if json.load(sys.stdin).get("ok") else "0")
except Exception:
    print("0")
' 2>/dev/null)
  if [ "$gate_ok" = "1" ]; then
    say "  $p: ECC gate open — run '$bin discover --url <a URL from: $bin paths show --json>' by hand (recipes needing an id are excluded on purpose)"
  else
    say "  $p: disabled-by-policy — ECC security review not recorded yet"
  fi
done

for p in lofty zoho; do
  bin="cli-anything-$p"
  if have "$bin"; then
    say "  $p: REST, not DOMShell — no --discover; see its own --help for the read verbs (config check / selftest)"
  else
    say "  $p: not installed, skipping"
  fi
done

# --------------------------------------------------------------------- 4. what Steven still does
section "4. Sign-in and approvals still pending (Steven, by hand — this script never does these)"
say "  Sign in BY HAND in the Chrome profile DOMShell drives. The harnesses cannot sign in —"
say "  that needs 'act type', which none of them has — and MFA/SSO is a HALT, not a puzzle:"
say "    - homes.com          (search + listing pages are public; only 'saved-searches' needs it)"
say "    - ShowingTime        (MLS-SSO'd in many markets incl. CRMLS — if it wants MFA/SSO, STOP)"
say "    - Showami"
say "    - SkySlope           (only worth doing once the ECC date below exists)"
say "    - zipForms/Lone Wolf (only worth doing once the ECC date below exists)"
say "  No sign-in needed for: publicfeeds (every page it reads is public), Lofty and Zoho (a REST"
say "  API key, not a browser sign-in — see ~/.config/lofty/.env and ~/.config/zoho/.env, names only)."
say ""
say "  Approvals pending:"
if [ -n "${CLI_ANYTHING_ECC_REVIEWED_AT:-}" ]; then
  say "    - ECC security review (SkySlope + zipForms): recorded — CLI_ANYTHING_ECC_REVIEWED_AT=$CLI_ANYTHING_ECC_REVIEWED_AT"
else
  say "    - ECC security review (SkySlope + zipForms): NOT recorded. Hold the review (Elena's lens:"
  say "      what it can reach, what it stores, what a prompt-injected page could make it do), THEN"
  say "      export CLI_ANYTHING_ECC_REVIEWED_AT=YYYY-MM-DD with the real sign-off date."
fi
for g in marketpages:MARKETPAGES lenderrates:LENDERRATES builderpages:BUILDERPAGES; do
  group=${g%%:*}; envname="CLI_ANYTHING_TOS_REVIEWED_${g##*:}"
  val=$(printenv "$envname" 2>/dev/null || true)
  if [ -n "$val" ]; then
    say "    - publicfeeds/$group terms-of-service review: recorded — $envname=$val"
  else
    say "    - publicfeeds/$group terms-of-service review: NOT recorded. The exact question is in"
    say "      integrations/cli-anything-harnesses/publicfeeds/PUBLICFEEDS.md — Alexandra drafts the"
    say "      answer, Steven decides. Then export $envname=YYYY-MM-DD."
  fi
done

# --------------------------------------------------------------------- 5. the paste line
section "5. Once you have looked: write cliAnythingStatus"
say "  Only a task running ON THIS MAC may write the cliAnythingStatus document the Command Deck's"
say "  connector card reads — this script never does, and neither does any cloud session."
say ""
say "  Paste this into Claude Code on this Mac (full prompt: routines/mac-task-repairs.md §9):"
say "    Use the cli-anything-connectors skill. Follow routines/mac-task-repairs.md section 9"
say "    exactly: inspect what is ACTUALLY installed and gate-open on this Mac right now"
say "    (cli-hub --version; claude plugin list; which of the nine console scripts exist in"
say "    $CAH_BIN; each package's --help verb groups, word-matched for 'act'; gate status for"
say "    skyslope, zipforms and publicfeeds's three groups) and write cliAnythingStatus from"
say "    what you observe this run — never a value you did not just see, and never a recipe"
say "    name in verbsEnabled, only verb groups. Then tell me in one line what is installed,"
say "    which path maps are verified, and what is still null and why."
say ""
say "Done. Re-run this script any time — every step above is safe to repeat."
