#!/bin/bash
# orca-launch.sh - turn a request into running agents on this Mac: one Claude Code session per seat, each in its own
# Terminal window inside this repo, at most 8 at once. Orca lists every running session, so they can be watched and
# steered from Orca on this Mac, the other Mac or the phone once Orca is paired. Bash 3.2 safe.
#
#   bash integrations/agent-os/orca-launch.sh "prepare a VA loan scenario in Temecula"          launches
#   bash integrations/agent-os/orca-launch.sh --dry-run "..."                                   prints what it would open
#
# It never sends, books, pays or signs: a HALT in the plan is printed and the marked step waits for Steven.
# It never pairs Orca and never touches a pairing link.
set -u
DRY=0; [ "${1:-}" = "--dry-run" ] && { DRY=1; shift; }
REQ="${*:-}"; [ -z "$REQ" ] && { sed -n 2,10p "$0"; exit 2; }
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
PLAN="$("$REPO/bin/brain" os run --json "$REQ")" || { echo "brain os run failed" >&2; exit 1; }
printf '%s\n' "$PLAN" | python3 -c '
import json, sys
p = json.load(sys.stdin)
print("lead:", p["lead"], "| gates:", " -> ".join(p["gates"]))
for h in p["halts"]: print("HALT:", h)
for i, w in enumerate(p["waves"], 1):
    for x in w:
        if x["command"]: print("%d\t%s\t%s\t%s" % (i, x["seat"], x["command"], x.get("first_message", "")))
' | while IFS=$'\t' read -r wave seat cmd first; do
  case "$wave" in lead:*|HALT:*) echo "$wave"; continue ;; esac
  [ -z "$cmd" ] && continue
  if [ "$DRY" = 1 ] || [ "$(uname -s)" != "Darwin" ]; then
    echo "  would open Terminal: cd $REPO && $cmd   ${first:+(first message: $first)}"
  else
    osascript -e "tell application \"Terminal\" to do script \"cd '$REPO' && echo 'Seat: $seat' && $cmd\"" >/dev/null && echo "  opened: $seat -> $cmd"
  fi
done
echo "Orca shows these sessions (Orca app, this Mac, or the phone once paired). Nothing is sent or signed by this launcher."
