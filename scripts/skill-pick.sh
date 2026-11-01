#!/usr/bin/env bash
# skill-pick.sh - copy ONE skill from the local Agentic Awesome Skills library into Claude Code, after showing it.
#   bash scripts/skill-pick.sh --find <word>   list matching skill names (name + first description line)
#   bash scripts/skill-pick.sh <name>          show the SKILL.md head, ask y/N, copy to ~/.claude/skills/<name>
#   bash scripts/skill-pick.sh --remove <name> take it back out
# The library is downloaded by integrations/skill-packs/install-mac.sh. Community skills are mixed quality: read
# before you keep one, and never one that asks for a key, runs a server or adds hooks without Elena's look.
set -u
LIB="${SKILL_LIBRARY:-$HOME/skill-library/agentic-awesome-skills}/skills"
DEST="$HOME/.claude/skills"
[ -d "$LIB" ] || { echo "Library not found at $LIB - run: bash integrations/skill-packs/install-mac.sh"; exit 1; }
case "${1:-}" in
  ""|-h|--help) sed -n '2,7p' "$0"; exit 0 ;;
  --find) shift; w="${*:-}"; [ -n "$w" ] || { echo "give a word"; exit 1; }
    for d in "$LIB"/*/; do n="$(basename "$d")"; f="$d/SKILL.md"; [ -f "$f" ] || continue
      if echo "$n" | grep -qi -- "$w" || grep -qi -- "$w" "$f"; then
        printf '%-40s %s\n' "$n" "$(grep -m1 -i '^description:' "$f" | cut -c14-110)"; fi
    done | head -40; exit 0 ;;
  --remove) n="${2:-}"; case "$n" in ""|*/*|.*) echo "bad name"; exit 1 ;; esac
    [ -d "$DEST/$n" ] && rm -rf "${DEST:?}/$n" && echo "removed $n" || echo "$n is not installed"; exit 0 ;;
esac
n="$1"; case "$n" in */*|.*) echo "bad name"; exit 1 ;; esac
src="$LIB/$n"; [ -f "$src/SKILL.md" ] || { echo "no skill named $n (try --find)"; exit 1; }
[ -e "$DEST/$n" ] && { echo "$n is already installed"; exit 0; }
echo "---- $n/SKILL.md (first 25 lines) ----"; head -25 "$src/SKILL.md"; echo "----"
echo "Files: $(find "$src" -type f | wc -l | tr -d ' ')   Scripts: $(find "$src" -type f \( -name '*.sh' -o -name '*.py' -o -name '*.js' \) | wc -l | tr -d ' ')"
printf 'Copy %s into %s? [y/N] ' "$n" "$DEST"; read -r a || a=''
case "$a" in y|Y|yes) mkdir -p "$DEST" && cp -R "$src" "$DEST/$n" && echo "installed $n - restart Claude Code" ;; *) echo "skipped" ;; esac
