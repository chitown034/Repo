#!/bin/bash
# scripts/repo-sync.sh - bring this Mac's Repo folder up to date with GitHub, every time, with no conflicts
# for Steven to resolve (2026-10-22). Bash 3.2 safe. Never pushes, never signs in, never deletes his work.
#
#   bash scripts/repo-sync.sh            sync now, print a short report
#   bash scripts/repo-sync.sh --quiet    only the one-line result (the every-30-minutes LaunchAgent uses this)
#
# Why it exists: the cloud "6D Brain daily rebuild" commits INDEX.md, brain/index.json, brain/loop-history.jsonl,
# docs/reports/*.md and dashboard/brain-4d.html to this branch every day, and the Mac rebuilds the SAME files
# locally (go.sh step 2, brain-sync, the brain-maintenance task, bin/brain loop). So every morning the Mac had
# uncommitted copies of exactly the files GitHub had changed, and `git pull --ff-only` refused ("your local
# changes would be overwritten"); `pull --rebase --autostash` instead left half-finished rebases and stashes.
#
# What it does, in order:
#   1. Backs up first. Anything it is about to replace is copied to ~/Documents/Repo-sync-backups/<date-time>/
#      (files/ keeps the folder layout, changes.patch has every uncommitted edit, commits/ any local commits).
#   2. Ends a stuck rebase/merge left by an earlier sync (git's own --abort, which restores the earlier state).
#   3. Fetches the branch from GitHub (read-only).
#   4. Rebuilt files (marked linguist-generated in .gitattributes) are put back to the committed copy - the
#      brain rebuilds them anyway. Your own edits to any other file are KEPT in place, unless GitHub changed
#      the same file: then GitHub's version wins and your copy is in the backup folder (the report names it).
#   5. If the Mac is on another branch, switches to this one (the other branch is left exactly as it was).
#   6. Fast-forwards. Local commits are replayed on top (rebase); if that cannot be done cleanly they are
#      saved on a branch named backup/repo-sync-<date-time> plus patch files, and the folder matches GitHub.
# Logs: ~/Library/Logs/vanessa-setup/repo-sync.log. Exit 0 = up to date with GitHub, 1 = could not sync
# (offline, not a git folder, git itself failed) - nothing was lost either way.
set -u
QUIET=0
for a in "$@"; do
  case "$a" in
    --quiet) QUIET=1 ;;
    -h|--help) sed -n 2,26p "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "repo-sync: unknown option $a (try --help)" >&2; exit 2 ;;
  esac
done

REPO="${REPO_SYNC_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${REPO_SYNC_BRANCH:-claude/stoic-cori-pvn3f8}"
REMOTE="${REPO_SYNC_REMOTE:-origin}"
LOGDIR="${REPO_SYNC_LOGDIR:-$HOME/Library/Logs/vanessa-setup}"
BACKROOT="${REPO_SYNC_BACKUP_ROOT:-$HOME/Documents/Repo-sync-backups}"
STAMP="$(date +%Y-%m-%d-%H%M%S)"
UP="refs/remotes/$REMOTE/$BRANCH"
mkdir -p "$LOGDIR" 2>/dev/null || LOGDIR="${TMPDIR:-/tmp}"
LOG="$LOGDIR/repo-sync.log"

BACKUP=""; GEN=0; OWN_KEPT=""; OWN_REPLACED=""; NOTES=""
log()  { printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >>"$LOG" 2>/dev/null; [ "$QUIET" = 1 ] || printf '  %s\n' "$*"; }
note() { NOTES="$NOTES
  - $*"; log "$*"; }
g()    { git -C "$REPO" -c core.quotePath=false "$@"; }
finish() { # <rc> <one-line result>
  printf '%s repo-sync: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$2" >>"$LOG" 2>/dev/null
  echo "repo-sync: $2"
  if [ "$QUIET" = 0 ]; then
    [ -n "$OWN_KEPT" ] && printf 'Your own edits, kept in place (not committed):%s\n' "$OWN_KEPT"
    [ -n "$OWN_REPLACED" ] && printf 'GitHub changed these files too, so GitHub'"'"'s version is in place; YOUR copy is in the backup:%s\n' "$OWN_REPLACED"
    [ -n "$NOTES" ] && printf 'Notes:%s\n' "$NOTES"
    [ -n "$BACKUP" ] && echo "Backup folder: $BACKUP"
  fi
  rmdir "$LOCK" 2>/dev/null
  exit "$1"
}

g rev-parse --is-inside-work-tree >/dev/null 2>&1 || { LOCK=/nonexistent; finish 1 "$REPO is not a git folder - nothing done"; }
GITDIR="$(g rev-parse --absolute-git-dir)"
LOCK="$GITDIR/repo-sync.lock"
# one sync at a time (the LaunchAgent and connect-all can overlap); a lock older than 30 min is stale
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then rmdir "$LOCK" 2>/dev/null; mkdir "$LOCK" 2>/dev/null || { echo "repo-sync: another sync is running - skipped (try again in a minute)"; exit 75; }
  else echo "repo-sync: another sync is running - skipped (try again in a minute)"; exit 75; fi
fi
[ "$QUIET" = 1 ] || echo "repo-sync - $REPO - branch $BRANCH - $(date)"

# The list of rebuilt files is .gitattributes (linguist-generated). A Mac that has never synced since that file was
# added has no copy yet, so GitHub's copy is also consulted (core.attributesFile; the folder's own copy wins).
ATTRS="$GITDIR/repo-sync-attributes"
load_attrs() { g show "$UP:.gitattributes" >"$ATTRS" 2>/dev/null || : >"$ATTRS"; }
is_generated() { g -c core.attributesFile="$ATTRS" check-attr linguist-generated -- "$1" 2>/dev/null | grep -q ': linguist-generated: true$'; }
load_attrs
in_list() { printf '%s\n' "$2" | grep -Fxq -- "$1"; }
ensure_backup() {
  [ -n "$BACKUP" ] && return 0
  BACKUP="$BACKROOT/$STAMP"; mkdir -p "$BACKUP/files" || { BACKUP=""; return 1; }
  touch "$BACKUP/GENERATED-ONLY"   # removed as soon as anything of Steven's own goes in
  { echo "repo-sync backup $STAMP of $REPO"; echo "branch: $(g symbolic-ref -q --short HEAD || echo detached) @ $(g rev-parse --short HEAD 2>/dev/null)"; echo; g status --porcelain; } >"$BACKUP/git-status.txt" 2>&1
  g diff HEAD --binary >"$BACKUP/changes.patch" 2>/dev/null
  return 0
}
backup_file() { # <path> [own]
  ensure_backup || return 1
  [ "${2:-}" = own ] && rm -f "$BACKUP/GENERATED-ONLY"
  if [ -e "$REPO/$1" ] || [ -L "$REPO/$1" ]; then
    mkdir -p "$BACKUP/files/$(dirname "$1")" && cp -pR "$REPO/$1" "$BACKUP/files/$1"
  fi
}
restore_committed() { # put <path> back to HEAD's copy (or remove it if HEAD has none)
  g reset -q -- "$1" >/dev/null 2>&1
  if g cat-file -e "HEAD:$1" 2>/dev/null; then g checkout -q HEAD -- "$1"; else rm -rf "${REPO:?}/$1"; fi
}

# ---- 1-2. a rebase/merge left half-finished by an earlier pull: back up, then git's own abort ----------
for op in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD; do
  if [ -e "$GITDIR/$op" ]; then
    ensure_backup; rm -f "$BACKUP/GENERATED-ONLY"
    case "$op" in
      rebase-*) g rebase --abort >/dev/null 2>&1 || rm -rf "${GITDIR:?}/$op" ;;
      MERGE_HEAD) g merge --abort >/dev/null 2>&1 ;;
      CHERRY_PICK_HEAD) g cherry-pick --abort >/dev/null 2>&1 ;;
    esac
    note "ended a $op left over from an earlier pull (git's own --abort; nothing lost, a copy is in the backup)"
  fi
done
# files still in a conflicted state (e.g. a stash that did not pop cleanly): back up, put the committed copy back
NL='
'
OLDIFS=$IFS; IFS=$NL
for f in $(g diff --name-only --diff-filter=U 2>/dev/null); do
  if is_generated "$f"; then backup_file "$f" || finish 1 "could not write the backup folder ($BACKUP) - stopped before touching $f; nothing of yours was changed"; GEN=$((GEN+1)); else backup_file "$f" own || finish 1 "could not write the backup folder ($BACKUP) - stopped before touching $f; nothing of yours was changed"; OWN_REPLACED="$OWN_REPLACED
  - $f (had conflict markers from an earlier pull)"; fi
  restore_committed "$f"
done
IFS=$OLDIFS

# ---- 3. fetch (read-only) ---------------------------------------------------------------------------------
if ! g fetch -q "$REMOTE" "+refs/heads/$BRANCH:$UP" >>"$LOG" 2>&1; then
  finish 1 "could not reach GitHub (offline or signed out of git) - kept the local copy, nothing changed"
fi

load_attrs
CUR="$(g symbolic-ref -q --short HEAD || true)"
# files GitHub's side will change: same branch -> since the common ancestor; other branch -> anything that differs
if [ "$CUR" = "$BRANCH" ]; then
  MB="$(g merge-base HEAD "$UP" 2>/dev/null || true)"
  if [ -n "$MB" ]; then INCOMING="$(g diff --name-only "$MB" "$UP")"; else INCOMING="$(g diff --name-only HEAD "$UP")"; fi
else
  INCOMING="$(g diff --name-only HEAD "$UP")"
  if g rev-parse -q --verify "refs/heads/$BRANCH" >/dev/null; then
    INCOMING="$INCOMING
$(g diff --name-only HEAD "refs/heads/$BRANCH")"
  fi
fi

# ---- 4. uncommitted edits -----------------------------------------------------------------------------
DIRTY="$(g diff --name-only HEAD 2>/dev/null; g diff --name-only --cached 2>/dev/null)"
DIRTY="$(printf '%s\n' "$DIRTY" | sed '/^$/d' | sort -u)"
IFS=$NL
for f in $DIRTY; do
  if is_generated "$f"; then
    backup_file "$f" || finish 1 "could not write the backup folder ($BACKUP) - stopped before touching $f; nothing of yours was changed"; restore_committed "$f"; GEN=$((GEN+1))
  elif in_list "$f" "$INCOMING"; then
    backup_file "$f" own || finish 1 "could not write the backup folder ($BACKUP) - stopped before touching $f; nothing of yours was changed"; restore_committed "$f"; OWN_REPLACED="$OWN_REPLACED
  - $f"
  else
    backup_file "$f" own || finish 1 "could not write the backup folder ($BACKUP) - stopped before touching $f; nothing of yours was changed"; OWN_KEPT="$OWN_KEPT
  - $f"
  fi
done
# untracked files sitting where GitHub now has a file would block the update: move them into the backup
for f in $(g ls-files -o --exclude-standard 2>/dev/null); do
  if g cat-file -e "$UP:$f" 2>/dev/null; then
    backup_file "$f" own && rm -rf "${REPO:?}/$f"; OWN_REPLACED="$OWN_REPLACED
  - $f (was not in git here; GitHub now has a file with this name)"
  fi
done
IFS=$OLDIFS
[ "$GEN" -gt 0 ] && log "put $GEN rebuilt file(s) back to the committed copy (backed up first; the brain rebuilds them)"

# ---- 5. switch to the branch if the Mac is on another one ----------------------------------------------
if [ "$CUR" != "$BRANCH" ]; then
  if [ -z "$CUR" ] && ! g branch --contains HEAD 2>/dev/null | grep -q .; then
    g branch "backup/repo-sync-$STAMP-detached" HEAD && note "this folder was on a loose commit; saved it as branch backup/repo-sync-$STAMP-detached"
  fi
  if g rev-parse -q --verify "refs/heads/$BRANCH" >/dev/null; then
    g checkout -q "$BRANCH" >>"$LOG" 2>&1 || finish 1 "could not switch to $BRANCH (see $LOG) - nothing lost"
  else
    g checkout -q -b "$BRANCH" --track "$REMOTE/$BRANCH" >>"$LOG" 2>&1 || finish 1 "could not create $BRANCH (see $LOG) - nothing lost"
  fi
  note "switched from ${CUR:-a loose commit} to $BRANCH (${CUR:-that commit} is unchanged and still there)"
fi
g branch -q --set-upstream-to="$REMOTE/$BRANCH" "$BRANCH" >/dev/null 2>&1

# ---- 6. catch up -----------------------------------------------------------------------------------------
AHEAD="$(g rev-list --count "$UP..HEAD")"; BEHIND="$(g rev-list --count "HEAD..$UP")"
BEFORE="$(g rev-parse --short HEAD)"
if [ "$BEHIND" = 0 ]; then
  :
elif [ "$AHEAD" = 0 ]; then
  if ! g merge -q --ff-only "$UP" >>"$LOG" 2>&1; then
    g reset -q --keep "$UP" >>"$LOG" 2>&1 || finish 1 "fast-forward failed (see $LOG) - nothing lost, backup kept"
  fi
else
  ensure_backup; rm -f "$BACKUP/GENERATED-ONLY"
  g branch -f "backup/repo-sync-$STAMP" HEAD >/dev/null 2>&1
  g format-patch -q -o "$BACKUP/commits" "$UP..HEAD" >/dev/null 2>&1
  if g rebase -q --autostash "$UP" >>"$LOG" 2>&1; then
    note "replayed $AHEAD local commit(s) on top of GitHub's (also saved as branch backup/repo-sync-$STAMP); not pushed"
  else
    g rebase --abort >/dev/null 2>&1
    if ! g reset -q --keep "$UP" >>"$LOG" 2>&1; then
      g stash push -q -m "repo-sync $STAMP" >>"$LOG" 2>&1
      g reset -q --hard "$UP"
      g stash pop -q >>"$LOG" 2>&1 || { g reset -q --hard "$UP"; note "some uncommitted edits clashed; they are in git stash 'repo-sync $STAMP' and in the backup folder"; }
    fi
    note "$AHEAD local commit(s) could not be replayed cleanly; they are saved on branch backup/repo-sync-$STAMP and in $BACKUP/commits - this folder now matches GitHub"
  fi
fi

g merge-base --is-ancestor "$UP" HEAD 2>/dev/null || finish 1 "still behind GitHub after the update (see $LOG) - nothing lost"
# drop old backups that hold nothing but rebuilt files (never one with Steven's own work in it)
if [ -d "$BACKROOT" ]; then
  find "$BACKROOT" -mindepth 2 -maxdepth 2 -name GENERATED-ONLY -mtime +14 2>/dev/null | while IFS= read -r m; do rm -rf "$(dirname "$m")"; done
fi
NOW="$(g rev-parse --short HEAD)"
if [ "$BEHIND" = 0 ]; then finish 0 "up to date - $BRANCH @ $NOW"; fi
finish 0 "updated $BEFORE -> $NOW ($BEHIND new commit(s) from GitHub) - $BRANCH"
