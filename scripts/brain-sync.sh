#!/usr/bin/env bash
# scripts/brain-sync.sh — "the brain on every Mac" (Second Brain L5, R7 2026-09-27)
#
# Idempotent. Safe to run by hand, from cron, or from a launchd/scheduled task. Does five things,
# in order, and never force-anything:
#   1. git pull --rebase --autostash on whatever branch is currently checked out. Offline or a real
#      conflict is reported and the run continues with the local copy — never a force-pull, never a
#      reset, never a stash pop it did not create.
#   2. bin/brain reindex, then bin/brain doctor — only if bin/brain exists in this checkout yet
#      (the brain/ CLI is built separately; this script degrades gracefully until it lands).
#   3. Puts bin/brain on PATH via a symlink in ~/.local/bin (created if absent).
#   4. Syncs this repo's .claude/skills/<name>/ dirs to ~/.claude/skills/<name>: links what is
#      missing, leaves what is already linked here, and NEVER overwrites a real (non-symlink)
#      directory that differs — the Mac carries ~1,400 skill dirs and some are hand-edited. A
#      conflict prints a diff summary and the exact command to replace it, and moves on.
#   5. Prints a short status summary.
#
#   scripts/brain-sync.sh              # do the sync
#   scripts/brain-sync.sh --dry-run    # print every action, change nothing
#   scripts/brain-sync.sh --quiet      # only the final summary (for scheduled runs)
#
# Written for macOS /bin/bash 3.2: no associative arrays, no mapfile/readarray, no ${x^^}, no &>>.
# Never touches .claude/skills-staged/ (third-party packs staged by integrations/skill-packs/
# import_pack.py, never live) — that directory is a sibling of .claude/skills/ and this script only
# ever walks .claude/skills/*, so it is never reached, by construction.
set -euo pipefail

DRY_RUN=0
QUIET=0

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --quiet) QUIET=1 ;;
    -h|--help) usage; exit 0 ;;
    *) printf 'unknown argument: %s\n\n' "$arg" >&2; usage >&2; exit 2 ;;
  esac
done

# --------------------------------------------------------------------------- locate the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BINDIR="$HOME/.local/bin"
SKILLS_SRC="$REPO_DIR/.claude/skills"
SKILLS_DST="$HOME/.claude/skills"
BRAIN_BIN="$REPO_DIR/bin/brain"

say()  { [ "$QUIET" -eq 1 ] && return 0; printf '%s\n' "$*"; }
warn() { printf '%s\n' "$*" >&2; }
# The final summary always prints, quiet or not — a scheduled run still needs a one-glance status.
summary_line() { printf '%s\n' "$*"; }

say "brain-sync — $(date -u +%Y-%m-%dT%H:%M:%SZ) — $REPO_DIR"
[ "$DRY_RUN" -eq 1 ] && say "(dry-run — nothing below is actually done)"

# --------------------------------------------------------------------------- 1. git pull --rebase --autostash
say ""
say "== git pull --rebase --autostash =="
PULL_STATUS="skipped"
if [ "$DRY_RUN" -eq 1 ]; then
  say "  would run: git -C \"$REPO_DIR\" pull --rebase --autostash"
  PULL_STATUS="dry-run"
elif ! git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  warn "  $REPO_DIR is not a git repo — skipping the pull, using the checkout as-is"
  PULL_STATUS="not-a-repo"
else
  _before="$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
  _errf="$(mktemp "${TMPDIR:-/tmp}/brain-sync-pull.XXXXXX" 2>/dev/null || echo /tmp/brain-sync-pull.$$)"
  if git -C "$REPO_DIR" pull --rebase --autostash >"$_errf" 2>&1; then
    _after="$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo unknown)"
    if [ "$_before" = "$_after" ]; then
      say "  already up to date ($(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null) @ ${_after})"
      PULL_STATUS="up-to-date"
    else
      say "  pulled: ${_before} -> ${_after}"
      PULL_STATUS="pulled"
    fi
  else
    warn "  git pull failed — offline, or a real conflict. Reporting and continuing with the local copy."
    warn "  never force-pulling, never resetting, never popping a stash this run did not make. Output:"
    sed 's/^/    /' "$_errf" >&2 || true
    PULL_STATUS="failed-kept-local"
  fi
  rm -f "$_errf" 2>/dev/null || true
fi

# --------------------------------------------------------------------------- 2. bin/brain reindex + doctor
say ""
say "== bin/brain reindex / doctor =="
INDEX_STATUS="skipped (bin/brain not in this checkout yet)"
if [ -x "$BRAIN_BIN" ]; then
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  would run: $BRAIN_BIN reindex"
    say "  would run: $BRAIN_BIN doctor"
    INDEX_STATUS="dry-run"
  else
    _reindex_ok=1
    if "$BRAIN_BIN" reindex; then
      say "  reindex: ok"
    else
      warn "  reindex: failed (non-zero exit) — continuing to doctor anyway"
      _reindex_ok=0
    fi
    if "$BRAIN_BIN" doctor; then
      say "  doctor: ok"
      if [ "$_reindex_ok" -eq 1 ]; then INDEX_STATUS="ok"; else INDEX_STATUS="reindex-failed"; fi
    else
      warn "  doctor: reported a problem (non-zero exit — stale INDEX or a routed path missing)"
      INDEX_STATUS="doctor-flagged"
    fi
  fi
else
  say "  $BRAIN_BIN not present — skipping gracefully (brain/ is built separately)"
fi

# --------------------------------------------------------------------------- 3. bin/brain on PATH
say ""
say "== bin/brain on PATH =="
BRAIN_ON_PATH="not-present"
if [ -x "$BRAIN_BIN" ]; then
  if [ "$DRY_RUN" -eq 1 ]; then
    say "  would run: mkdir -p \"$BINDIR\""
    say "  would run: ln -sf \"$BRAIN_BIN\" \"$BINDIR/brain\""
    BRAIN_ON_PATH="dry-run"
  else
    mkdir -p "$BINDIR"
    ln -sf "$BRAIN_BIN" "$BINDIR/brain"
    say "  linked $BINDIR/brain -> $BRAIN_BIN"
    BRAIN_ON_PATH="linked"
  fi
  case ":${PATH}:" in
    *":$BINDIR:"*) : ;;
    *)
      warn "  $BINDIR is not on your PATH. Add it, e.g. in ~/.zprofile:"
      warn "    export PATH=\"$BINDIR:\$PATH\""
      BRAIN_ON_PATH="${BRAIN_ON_PATH}, not-on-PATH"
      ;;
  esac
else
  say "  bin/brain not present — nothing to link yet"
fi

# --------------------------------------------------------------------------- 4. sync skills to ~/.claude/skills
say ""
say "== syncing .claude/skills/* to $SKILLS_DST =="
SKILLS_LINKED=0
SKILLS_ALREADY_OK=0
SKILLS_CONFLICTS=0
if [ -d "$SKILLS_SRC" ]; then
  for src_dir in "$SKILLS_SRC"/*/; do
    [ -d "$src_dir" ] || continue
    name="${src_dir%/}"; name="${name##*/}"
    src="$SKILLS_SRC/$name"
    dst="$SKILLS_DST/$name"

    if [ -L "$dst" ]; then
      # Already a symlink somewhere. Is it pointed at THIS repo's copy? Compare resolved real paths,
      # not the raw link text, so an old relative link that happens to resolve here still counts.
      resolved="$(cd -P "$dst" 2>/dev/null && pwd -P || true)"
      src_resolved="$(cd -P "$src" 2>/dev/null && pwd -P || true)"
      if [ -n "$resolved" ] && [ "$resolved" = "$src_resolved" ]; then
        say "  ok        $name — already linked to this repo"
        SKILLS_ALREADY_OK=$((SKILLS_ALREADY_OK + 1))
      else
        link_target="$(readlink "$dst" 2>/dev/null || echo '?')"
        warn "  CONFLICT  $name — $dst is a symlink to somewhere else ($link_target). Not touching it."
        warn "            to replace it: rm -f \"$dst\" && ln -s \"$src\" \"$dst\""
        SKILLS_CONFLICTS=$((SKILLS_CONFLICTS + 1))
      fi
    elif [ -e "$dst" ]; then
      # A real (non-symlink) directory already exists — possibly a hand-edited copy. Never overwrite.
      _difftmp="$(mktemp "${TMPDIR:-/tmp}/brain-sync-diff.XXXXXX" 2>/dev/null || echo /tmp/brain-sync-diff.$$)"
      if diff -rq "$src" "$dst" >"$_difftmp" 2>&1; then
        say "  ok        $name — a real directory at $dst, but it matches this repo's copy byte-for-byte"
        SKILLS_ALREADY_OK=$((SKILLS_ALREADY_OK + 1))
      else
        warn "  CONFLICT  $name — $dst is a real directory that differs from this repo's copy. NOT overwriting."
        _n="$(wc -l < "$_difftmp" | tr -d ' ')"
        warn "            diff summary (first 10 of ${_n} line(s)):"
        sed 's/^/              /' "$_difftmp" | head -10 >&2
        warn "            to replace the hand-edited copy with this repo's version, run yourself:"
        warn "              rm -rf \"$dst\" && ln -s \"$src\" \"$dst\""
        SKILLS_CONFLICTS=$((SKILLS_CONFLICTS + 1))
      fi
      rm -f "$_difftmp" 2>/dev/null || true
    else
      # Absent at the destination — safe to create.
      if [ "$DRY_RUN" -eq 1 ]; then
        say "  would link $name -> $dst"
      else
        mkdir -p "$SKILLS_DST"
        ln -s "$src" "$dst"
        say "  linked    $name -> $dst"
      fi
      SKILLS_LINKED=$((SKILLS_LINKED + 1))
    fi
  done
else
  warn "  no $SKILLS_SRC in this checkout — nothing to sync"
fi

# --------------------------------------------------------------------------- 5. summary (always prints)
say ""
summary_line "== brain-sync summary =="
summary_line "  pulled:        $PULL_STATUS"
summary_line "  index:         $INDEX_STATUS"
summary_line "  skills:        linked=$SKILLS_LINKED already-ok=$SKILLS_ALREADY_OK conflicts=$SKILLS_CONFLICTS"
summary_line "  brain on PATH: $BRAIN_ON_PATH"

exit 0
