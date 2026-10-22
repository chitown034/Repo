#!/bin/bash
# Tests for scripts/repo-sync.sh in throwaway git repos (a bare "GitHub", a "cloud" clone that pushes the daily
# rebuild, and a "Mac" clone that has local edits). The real Repo folder is never touched. Bash 3.2 safe.
set -u
HERE="$(cd "$(dirname "$0")/../.." && pwd)"
SYNC="$HERE/scripts/repo-sync.sh"
T=$(mktemp -d 2>/dev/null || mktemp -d -t rs); [ -n "$T" ] && [ -d "$T" ] || { echo "no temp dir" >&2; exit 2; }
trap 'rm -rf "$T"' EXIT
B="claude/stoic-cori-pvn3f8"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
PASS=0; FAIL=0
check() { if eval "$2"; then PASS=$((PASS+1)); echo "ok   $1"; else FAIL=$((FAIL+1)); echo "FAIL $1"; fi; }

N=0
fresh() { # new bare remote + cloud clone + mac clone, all on $B
  N=$((N+1)); R="$T/$N"; mkdir -p "$R"
  git init -q --bare "$R/github.git"
  git clone -q "$R/github.git" "$R/cloud" 2>/dev/null
  ( cd "$R/cloud" && git checkout -q -b "$B" && mkdir -p brain docs/reports wiki &&
    printf 'INDEX.md linguist-generated=true\nbrain/index.json linguist-generated=true\ndocs/reports/BRAIN-LOOP.md linguist-generated=true\n' > .gitattributes &&
    echo "index v1" > INDEX.md && echo '{"v":1}' > brain/index.json && echo loop1 > docs/reports/BRAIN-LOOP.md &&
    echo "notes v1" > wiki/notes.md && echo "plan v1" > wiki/plan.md &&
    git add -A && git commit -qm init && git push -q origin "$B" 2>/dev/null &&
    git push -q origin "$B:main" 2>/dev/null )
  git clone -q -b "$B" "$R/github.git" "$R/mac" 2>/dev/null
  MAC="$R/mac"; HOMEDIR="$R/home"; mkdir -p "$HOMEDIR"
}
cloud_rebuild() { ( cd "$R/cloud" && echo "index v2" > INDEX.md && echo '{"v":2}' > brain/index.json && echo loop2 > docs/reports/BRAIN-LOOP.md && eval "${1:-:}" && git add -A && git commit -qm "6D Brain daily rebuild" && git push -q origin "$B" 2>/dev/null ); }
run() { OUT="$(HOME="$HOMEDIR" REPO_SYNC_DIR="$MAC" REPO_SYNC_LOGDIR="$HOMEDIR/logs" REPO_SYNC_BACKUP_ROOT="$HOMEDIR/backups" bash "$SYNC" "$@" 2>&1)"; RC=$?; }
at_origin() { [ "$(git -C "$MAC" rev-parse HEAD)" = "$(git -C "$MAC" rev-parse "origin/$B")" ]; }
bk() { ls -d "$HOMEDIR"/backups/*/ 2>/dev/null | head -1; }

# A. the daily case: Mac rebuilt the index locally, cloud pushed its own rebuild
fresh; echo "index mac" > "$MAC/INDEX.md"; echo '{"v":"mac"}' > "$MAC/brain/index.json"; cloud_rebuild; run
check "A rebuilt files + remote ahead -> sync succeeds"            '[ $RC = 0 ]'
check "A Mac is now at GitHub's commit"                            'at_origin'
check "A Mac has the GitHub INDEX.md"                                   '[ "$(cat "$MAC/INDEX.md")" = "index v2" ]'
check "A the Mac's rebuilt copy is in the dated backup"            '[ "$(cat "$(bk)files/INDEX.md")" = "index mac" ]'
check "A backup holds only rebuilt files (marked prunable)"       '[ -f "$(bk)GENERATED-ONLY" ]'
check "A log written"                                              'grep -q "updated" "$HOMEDIR/logs/repo-sync.log"'
check "A working tree clean afterwards"                            '[ -z "$(git -C "$MAC" status --porcelain)" ]'

# B. Steven's own edit to a file GitHub did not change: kept in place and reported
fresh; echo "my own note" >> "$MAC/wiki/notes.md"; echo "index mac" > "$MAC/INDEX.md"; cloud_rebuild; run
check "B own edit + remote ahead -> sync succeeds"                 '[ $RC = 0 ] && at_origin'
check "B own edit is still in the file"                            'grep -q "my own note" "$MAC/wiki/notes.md"'
check "B own edit is reported as kept"                             'printf "%s" "$OUT" | grep -A2 "kept in place" | grep -q wiki/notes.md'
check "B own edit also copied to the backup"                       'grep -q "my own note" "$(bk)files/wiki/notes.md"'
check "B backup with own work is NOT marked prunable"             '[ ! -f "$(bk)GENERATED-ONLY" ]'

# C. Steven edited a file GitHub ALSO changed: GitHub wins in place, his copy is in the backup, reported
fresh; echo "my plan" > "$MAC/wiki/plan.md"; cloud_rebuild 'echo "plan v2" > wiki/plan.md'; run
check "C clash on own file -> sync still succeeds"                 '[ $RC = 0 ] && at_origin'
check "C the GitHub version in place"                                '[ "$(cat "$MAC/wiki/plan.md")" = "plan v2" ]'
check "C his copy saved in the backup"                             '[ "$(cat "$(bk)files/wiki/plan.md")" = "my plan" ]'
check "C reported by name"                                         'printf "%s" "$OUT" | grep -A2 "YOUR copy is in the backup" | grep -q wiki/plan.md'

# D. Mac sitting on another branch (main) with a rebuilt file dirty
fresh; git -C "$MAC" checkout -q -b main "origin/main"; echo "index mac" > "$MAC/INDEX.md"; cloud_rebuild; run
check "D other branch -> switched and synced"                      '[ $RC = 0 ] && [ "$(git -C "$MAC" symbolic-ref --short HEAD)" = "$B" ] && at_origin'
check "D the other branch is untouched"                            'git -C "$MAC" rev-parse -q --verify refs/heads/main >/dev/null'
check "D switch is reported"                                       'printf "%s" "$OUT" | grep -q "switched from main"'

# E. a local commit that does not clash (e.g. mac-sync export) is replayed on top, never pushed
fresh; ( cd "$MAC" && mkdir -p mac-config && echo m > mac-config/a.txt && git add mac-config && git commit -qm export ); cloud_rebuild; run
check "E local commit -> rebased on GitHub, sync succeeds"         '[ $RC = 0 ] && git -C "$MAC" merge-base --is-ancestor "origin/$B" HEAD && [ -f "$MAC/mac-config/a.txt" ]'
check "E local commit also saved on a backup branch"              'git -C "$MAC" branch --list "backup/repo-sync-*" | grep -q .'
check "E nothing was pushed"                                       '[ "$(git -C "$R/github.git" rev-parse "$B")" = "$(git -C "$R/cloud" rev-parse HEAD)" ]'

# F. a local commit that DOES clash with the cloud rebuild: folder matches GitHub, commit kept on a branch + patch
fresh; ( cd "$MAC" && echo "index committed on mac" > INDEX.md && git commit -qam "mac index" ); cloud_rebuild; run
check "F clashing local commit -> sync succeeds, matches GitHub"   '[ $RC = 0 ] && at_origin'
check "F clashing commit kept on backup branch"                    'git -C "$MAC" log --format=%s "$(git -C "$MAC" branch --list "backup/repo-sync-*" | tr -d " *" | head -1)" | grep -q "mac index"'
check "F clashing commit kept as a patch file"                     'ls "$(bk)commits/"*.patch >/dev/null 2>&1'

# G. a rebase left half-finished by the old pull --rebase --autostash
fresh; ( cd "$MAC" && echo "index committed on mac" > INDEX.md && git commit -qam "mac index" ); cloud_rebuild
git -C "$MAC" fetch -q; git -C "$MAC" rebase "origin/$B" >/dev/null 2>&1; run
check "G stuck rebase is ended and the folder syncs"               '[ $RC = 0 ] && at_origin && [ ! -d "$MAC/.git/rebase-merge" ] && [ ! -d "$MAC/.git/rebase-apply" ]'

# H. an untracked file where GitHub now has a file
fresh; echo "mine" > "$MAC/wiki/new.md"; cloud_rebuild 'echo theirs > wiki/new.md'; run
check "H untracked collision -> moved to backup, synced"           '[ $RC = 0 ] && at_origin && [ "$(cat "$(bk)files/wiki/new.md")" = mine ]'

# I. offline: nothing changes, honest failure
fresh; echo "index mac" > "$MAC/INDEX.md"; git -C "$MAC" remote set-url origin "$T/nowhere.git"; run
check "I offline -> exit 1 and says so"                           '[ $RC = 1 ] && printf "%s" "$OUT" | grep -q "could not reach GitHub"'
check "I offline -> local copy untouched"                          '[ "$(cat "$MAC/INDEX.md")" = "index mac" ]'

# K. first sync on a Mac whose folder predates .gitattributes: GitHub's copy of the list is used
fresh; ( cd "$R/cloud" && git rm -q .gitattributes && git commit -qm "old tree" && git push -q origin "$B" 2>/dev/null )
git -C "$MAC" pull -q 2>/dev/null; ( cd "$R/cloud" && printf 'INDEX.md linguist-generated=true\n' > .gitattributes && git add .gitattributes && git commit -qm attrs && git push -q origin "$B" 2>/dev/null )
echo "index mac" > "$MAC/INDEX.md"; cloud_rebuild; run
check "K no local .gitattributes -> INDEX.md still treated as rebuilt" '[ $RC = 0 ] && at_origin && [ -f "$(bk)GENERATED-ONLY" ] && ! printf "%s" "$OUT" | grep -q "YOUR copy"'

# J. already up to date, second run is a no-op
fresh; run; run
check "J up to date -> exit 0, no backup folder made"             '[ $RC = 0 ] && printf "%s" "$OUT" | grep -q "up to date" && [ -z "$(bk)" ]'

# L. backup folder cannot be written -> stop before touching anything of Steven's (validator finding 2026-10-22)
fresh; echo "my plan" > "$MAC/wiki/plan.md"; cloud_rebuild 'echo "plan v2" > wiki/plan.md'
mkdir -p "$HOMEDIR"; : > "$HOMEDIR/backups"   # a FILE where the backup folder should be
run
check "L unwritable backup -> exit 1"                              '[ $RC = 1 ] && printf "%s" "$OUT" | grep -q "could not write the backup folder"'
check "L unwritable backup -> his edit survives"                   '[ "$(cat "$MAC/wiki/plan.md")" = "my plan" ]'

# M. non-ASCII file name with an own edit is backed up and kept, sync not stuck
fresh; ( cd "$R/cloud" && echo "cv v1" > "wiki/Résumé.md" && git add -A && git commit -qm cv && git push -q origin "$B" 2>/dev/null )
git -C "$MAC" pull -q 2>/dev/null; echo "my cv" > "$MAC/wiki/Résumé.md"; cloud_rebuild; run
check "M non-ASCII own edit -> sync succeeds"                      '[ $RC = 0 ] && at_origin'
check "M non-ASCII own edit kept and backed up"                    'grep -q "my cv" "$MAC/wiki/Résumé.md" && grep -q "my cv" "$(bk)files/wiki/Résumé.md"'

# N. another sync holds the lock -> not reported as success
fresh; mkdir "$(git -C "$MAC" rev-parse --absolute-git-dir)/repo-sync.lock"; run
check "N lock held -> exit 75, says skipped"                       '[ $RC = 75 ] && printf "%s" "$OUT" | grep -q "skipped"'

echo "repo-sync tests: $PASS passed, $FAIL failed"; [ "$FAIL" = 0 ]
