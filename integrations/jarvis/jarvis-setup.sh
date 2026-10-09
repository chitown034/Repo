#!/usr/bin/env bash
# Jarvis + Laya + Vanessa's voice -- verify and set up on the Mac (2026-10-09).
#
#   bash integrations/jarvis/jarvis-setup.sh --verify    read-only: checks everything, writes brain/state/jarvis-status.json
#   bash integrations/jarvis/jarvis-setup.sh --apply     --verify, plus the two safe local steps (below)
#   bash integrations/jarvis/jarvis-setup.sh --help
#
# --apply changes ONLY: (1) ~/.config/jarvis/vanessa-voice.json (a copy of the voice profile, chmod 600) and
# (2) the status file in this repo's brain/state/ (gitignored). It never edits a skill, an MCP server, a runner
# task, a live prompt or a client record -- those stay Steven's approval, one at a time. It never logs in.
# Nothing here reads client documents; the memory.db check counts rows and reads no content.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MODE="${1:---verify}"
STATE="$REPO/brain/state"; OUT="$STATE/jarvis-status.json"
PROFILE="$REPO/integrations/jarvis/vanessa-voice-profile.json"
VOICE_DIRS=("${VANESSA_VOICE_DIR:-}" "$HOME/.cache/vanessa-voice" "$HOME/Applications/team-avatars/voices")
FAILS=0; ROWS=()

case "$MODE" in --verify|--apply) ;; -h|--help) sed -n 2,13p "$0"; exit 0 ;; *) echo "unknown option $MODE (try --help)" >&2; exit 2 ;; esac

row() { # name status detail
  ROWS+=("$1|$2|$3"); printf '  %-4s %-26s %s\n' "$2" "$1" "$3"; [ "$2" = FAIL ] && FAILS=$((FAILS+1)); return 0
}
json_escape() { python3 -c 'import json,sys;print(json.dumps(sys.stdin.read().strip()))'; }

echo "Jarvis / Laya / Vanessa voice -- $MODE -- $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. Mac only
if [ "$(uname)" != "Darwin" ]; then row "platform" FAIL "not a Mac ($(uname)); Jarvis is on-device only -- run this on the Mac"; else row "platform" ok "macOS $(sw_vers -productVersion 2>/dev/null)"; fi

# 2. OpenJarvis install + memory.db (count rows only)
DB=""
for c in "$HOME/.openjarvis/memory.db" "$HOME/Library/Application Support/OpenJarvis/memory.db" "$HOME/Applications/OpenJarvis/memory.db"; do [ -f "$c" ] && DB="$c" && break; done
[ -z "$DB" ] && DB="$(find "$HOME" -maxdepth 5 -name memory.db -path '*enjarvis*' 2>/dev/null | head -1)"
DOCS=null
if [ -n "$DB" ] && command -v sqlite3 >/dev/null; then
  T="$(sqlite3 "$DB" "select name from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '%fts%' and name not like '%_data' and name not like '%_idx' and name not like '%_content' and name not like '%_docsize' and name not like '%_config';" 2>/dev/null)"
  BEST=0; for t in $T; do n="$(sqlite3 "$DB" "select count(*) from \"$t\";" 2>/dev/null || echo 0)"; [ "${n:-0}" -gt "$BEST" ] && BEST=$n; done
  DOCS=$BEST
  if [ "$BEST" -gt 0 ]; then row "jarvis memory.db" ok "$BEST rows in its largest table ($DB)"; else row "jarvis memory.db" FAIL "found but empty or unreadable ($DB)"; fi
elif [ -n "$DB" ]; then row "jarvis memory.db" FAIL "found at $DB but sqlite3 is missing"
else row "jarvis memory.db" FAIL "no OpenJarvis memory.db found under ~ -- Jarvis is not installed here (brain says 1,761 docs on the other Mac)"; fi

# 3. Vault Jarvis indexes
VAULT="$HOME/Shearrill-Vault"
if [ -d "$VAULT" ]; then n="$(find -L "$VAULT" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"; row "vault" ok "$n notes at $VAULT"; else row "vault" FAIL "$VAULT missing (docs/SECOND-MAC-SETUP.md 6b)"; fi

# 4. Laya: real engine or stub?
if python3 -c 'import laya' 2>/dev/null; then
  OUTL="$(python3 "$REPO/integrations/laya/laya_route.py" --engine real "what is the VA funding fee" 2>&1 | head -2)"
  if printf '%s' "$OUTL" | grep -q "ROUTE\|ESCALATE"; then row "laya real engine" ok "answered: $(printf '%s' "$OUTL" | head -1 | cut -c1-90)"; else row "laya real engine" FAIL "imports but did not answer: $(printf '%s' "$OUTL" | head -1 | cut -c1-90)"; fi
else
  row "laya real engine" FAIL "laya not installed -> router runs the keyword stub only. Fix: bash integrations/laya/install.sh"
fi
# 5. Vanessa's voice: the recorded clips Jarvis must speak from
CL=0; WHERE=""
for d in "${VOICE_DIRS[@]}"; do [ -n "$d" ] && [ -d "$d" ] && c="$(find "$d" -type f \( -name '*.mp3' -o -name '*.wav' -o -name '*.m4a' \) 2>/dev/null | wc -l | tr -d ' ')" && [ "$c" -gt "$CL" ] && CL=$c && WHERE=$d; done
if [ "$CL" -gt 0 ]; then row "vanessa voice clips" ok "$CL audio files in $WHERE"; else row "vanessa voice clips" FAIL "none found. Her voice is the Magica Seed Audio render set (8 clips) -- set VANESSA_VOICE_DIR to that folder"; fi
if [ -f "$HOME/.config/jarvis/vanessa-voice.json" ]; then row "jarvis voice profile" ok "$HOME/.config/jarvis/vanessa-voice.json"; else row "jarvis voice profile" FAIL "missing -- run with --apply"; fi

# 6. brain recall alive
if "$REPO/bin/brain" doctor >/dev/null 2>&1; then row "brain doctor" ok "PASS"; else row "brain doctor" FAIL "run bin/brain doctor"; fi

if [ "$MODE" = "--apply" ]; then
  mkdir -p "$HOME/.config/jarvis" && chmod 700 "$HOME/.config/jarvis"
  python3 - "$PROFILE" "$HOME/.config/jarvis/vanessa-voice.json" "${WHERE}" <<'PY'
import json, sys
p = json.load(open(sys.argv[1])); p["clip_dir"] = sys.argv[3] or None
json.dump(p, open(sys.argv[2], "w"), indent=2)
PY
  chmod 600 "$HOME/.config/jarvis/vanessa-voice.json"
  echo "  applied: ~/.config/jarvis/vanessa-voice.json (voice profile copy)"
fi

if [ "$(uname)" != "Darwin" ]; then echo; echo "not a Mac: no status file written (the brain keeps showing Jarvis as unverified, which is true)"; exit 1; fi
mkdir -p "$STATE"
{
  printf '{"checked":"%s","ok":%s,"documents":%s,"summary":%s,"rows":[' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$([ $FAILS -eq 0 ] && echo true || echo false)" "$DOCS" "$(printf '%s of %s checks failing' "$FAILS" "${#ROWS[@]}" | json_escape)"
  first=1; for r in "${ROWS[@]}"; do IFS='|' read -r a b c <<<"$r"; [ $first -eq 0 ] && printf ','; first=0
    printf '{"name":%s,"status":%s,"detail":%s}' "$(printf '%s' "$a" | json_escape)" "$(printf '%s' "$b" | json_escape)" "$(printf '%s' "$c" | json_escape)"; done
  printf ']}\n'
} > "$OUT"
echo; echo "status file: $OUT -- $FAILS failing"
[ "$FAILS" -eq 0 ]
