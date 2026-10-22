#!/usr/bin/env bash
# mac-sync.sh — the "same information" half of two equal Macs (R6, 2026-09-24). Steven, verbatim:
# "Ensure both of my MacBooks can access the same information and equally have control of this dashboard
# setup infrastructure." The lease (integrations/omniroute-failover/claude-auto.sh, --take-lease/--release-lease)
# is the "equal control" half; this script is the "same information" half.
#
#   mac-sync.sh status         # one-screen parity report for THIS Mac
#   mac-sync.sh pull           # git pull --rebase --autostash on the brain repo; refuses on a real conflict
#   mac-sync.sh export [--push]  # writes names-only manifests to mac-config/<machineId>/ in the repo,
#                                 # commits locally; --push (the LaunchAgent uses this) also pushes
#   mac-sync.sh diff [other-machine-id]  # what THIS Mac lacks, vs the other Mac's exported manifest
#
# RULES, enforced throughout, never bent:
#   - NAMES only. `.env` variable NAMES, never a value. Never a client name, phone number or loan amount.
#   - `export` never writes a runner-task PROMPT — only name, cron and enabled, from `runnerctl list`
#     (never `runnerctl show`/`dry`/`logs`, which is what would surface a prompt).
#   - Vault detection (status/diff) reads PATHS and CONFIG PRESENCE only — it never opens a note.
#   - `export` writes and commits locally; it never pushes unless you pass --push yourself, so a background
#     LaunchAgent's daily export is the only thing that pushes on its own — see the plist template.
#
# Written for macOS bash 3.2: no associative arrays, no mapfile, no ${x^^}, no &>>, no `comm` flag assumed
# beyond -13/-23 (POSIX).
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="${MAC_SYNC_REPO_DIR:-$(cd "$HERE/../.." && pwd)}"           # this file lives at integrations/mac-sync/
RUNNER_CFG="${CLAUDE_RUNNER_CFG:-$HOME/.config/claude-runner}"
OMNI_STATE="${MAC_SYNC_OMNI_STATE:-$HOME/.config/omniroute/state}"
VAULT_DIR="${MAC_SYNC_VAULT_DIR:-$HOME/Shearrill-Vault}"
CONFIG_ROOT="${MAC_SYNC_CONFIG_ROOT:-$HOME/.config}"
MANIFEST_ROOT="$REPO_DIR/mac-config"
CATEGORIES="mcp-servers plugins skills runner-tasks launchagents env-vars tool-versions"

have() { command -v "$1" >/dev/null 2>&1; }

usage() { sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# ------------------------------------------------------------------ identity (mirrors claude-auto.sh's
# lease_my_id(), deliberately, so mac-config/<id>/ lines up with the heartbeat doc macHeartbeat.<id>)
machine_id() {
  _i=''
  if [ -f "$RUNNER_CFG/id" ] && [ ! -L "$RUNNER_CFG/id" ]; then
    _i=$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$RUNNER_CFG/id" 2>/dev/null | grep -v '^$' | head -1)
  fi
  [ -n "$_i" ] || _i=$(scutil --get ComputerName 2>/dev/null || true)
  [ -n "$_i" ] || _i=$(hostname 2>/dev/null || true)
  [ -n "$_i" ] || _i=unknown-mac
  printf '%s' "$_i" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9._-' '-' | cut -c1-40
}
# Mirrors claude-auto.sh's read_role(): same absent/owner/perm rules, so this reports what claude-auto.sh
# would actually treat this Mac as, not a naive read that might disagree with the real gate.
machine_role() {
  _f="$RUNNER_CFG/role"
  if [ ! -f "$_f" ] || [ -L "$_f" ]; then printf 'standby'; return; fi
  _owner=$(stat -c '%u' "$_f" 2>/dev/null || stat -f '%u' "$_f" 2>/dev/null || echo x)
  [ "$_owner" = "$(id -u)" ] || { printf 'standby'; return; }
  _mode=$(stat -c '%a' "$_f" 2>/dev/null || stat -f '%OLp' "$_f" 2>/dev/null || echo 777)
  case "${_mode#?}" in *[2367]*) printf 'standby'; return ;; esac
  _r=$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$_f" 2>/dev/null | grep -v '^$' | head -1 | tr '[:upper:]' '[:lower:]')
  case "$_r" in peer|primary|standby) printf '%s' "$_r" ;; *) printf 'standby' ;; esac
}

# ------------------------------------------------------------------ repo facts
repo_branch() { git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown; }
repo_head()   { git -C "$REPO_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown; }
# behind/ahead against the configured upstream, read-only — never a `git fetch` (this runs up to every 30
# min under the LaunchAgent; a fetch belongs to `pull`, not to a status read)
repo_behind_ahead() {
  _v=$(git -C "$REPO_DIR" rev-list --left-right --count '@{upstream}...HEAD' 2>/dev/null)
  if [ -n "$_v" ]; then printf '%s' "$_v"; else printf 'unknown\tunknown'; fi
}

# ------------------------------------------------------------------ per-category listers, one line each,
# shared by status (counts), export (writes the file) and diff (compares). NAMES only, always.
list_mcp_servers() {
  have claude || return 0
  claude mcp list 2>/dev/null | grep -oE '^[A-Za-z0-9_.-]+:' | sed 's/:$//'
}
list_plugins() {
  have claude || return 0
  # Best effort: `claude plugin list`'s exact column shape is not documented here, so this takes the
  # first token of each non-empty line — usually name@marketplace or a bare name. Never the whole line
  # verbatim beyond that first token, so nothing but a plugin identifier ever lands in the manifest.
  claude plugin list 2>/dev/null | sed -e 's/^[[:space:]]*[-*•][[:space:]]*//' -e 's/^[[:space:]]*//' \
    | grep -vE '^[[:space:]]*$' | awk '{print $1}'
}
list_skills() {
  # The per-Mac, globally-installed set — the one that can actually drift between Macs. The repo-vendored
  # .claude/skills travel with git and are identical the moment both Macs are on the same commit.
  for d in "$HOME/.claude/skills"/*/; do
    [ -d "$d" ] || continue
    s=${d%/}; s=${s##*/}
    [ -f "$d/SKILL.md" ] && printf '%s\n' "$s"
  done
}
list_runner_tasks() {
  # name<TAB>cron<TAB>enabled — from `runnerctl list` ONLY, never `show`/`dry`/`logs`, which is where a
  # prompt would appear. This command's shape is not fully documented here, so parsing is defensive: the
  # first token is the task name; a five-space-separated-field run is treated as the cron (cron's own
  # shape); a bare true/false/enabled/disabled token is the enabled flag. Anything not confidently found is
  # `unknown` rather than a guess — never fabricated, and never the full raw line beyond those three fields.
  have runnerctl || return 0
  runnerctl list 2>/dev/null | while IFS= read -r _line; do
    [ -n "$_line" ] || continue
    _name=$(printf '%s' "$_line" | awk '{print $1}')
    [ -n "$_name" ] || continue
    _cron=$(printf '%s' "$_line" | grep -oE '[0-9*/,-]+[[:space:]]+[0-9*/,-]+[[:space:]]+[0-9*/,-]+[[:space:]]+[0-9*/,-]+[[:space:]]+[0-9*/,-]+' | head -1 | tr -s ' ')
    [ -n "$_cron" ] || _cron=unknown
    _en=$(printf '%s' "$_line" | grep -ioE '\b(true|false|enabled|disabled)\b' | head -1 | tr '[:upper:]' '[:lower:]')
    [ -n "$_en" ] || _en=unknown
    printf '%s\t%s\t%s\n' "$_name" "$_cron" "$_en"
  done
}
list_launchagents() {
  have launchctl || return 0
  launchctl list 2>/dev/null | grep 'com\.stevenshearrill' | awk '{print $NF}'
}
list_env_vars() {
  # relative/path/.env:VARNAME — one per line, never a value. Only ~/.config/<tool>/.env, the one location
  # every credential file in this repo already uses (MAC-SETUP.sh's ensure_env_file, mac-verify.sh's
  # check_env_file).
  for f in "$CONFIG_ROOT"/*/.env; do
    [ -f "$f" ] || continue
    _rel=${f#"$HOME"/}
    grep -E '^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*=' "$f" 2>/dev/null | sed -E 's/^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=.*/\1/' \
      | while IFS= read -r _n; do printf '%s:%s\n' "$_rel" "$_n"; done
  done
}
list_tool_versions() {
  for t in claude node npm git uv omniroute runnerctl; do
    have "$t" || continue
    _v=$("$t" --version 2>/dev/null | head -1 | tr -d '\r')
    [ -n "$_v" ] && printf '%s\t%s\n' "$t" "$_v"
  done
}
list_for() { # category name -> calls the matching list_* function
  case "$1" in
    mcp-servers)  list_mcp_servers ;;
    plugins)      list_plugins ;;
    skills)       list_skills ;;
    runner-tasks) list_runner_tasks ;;
    launchagents) list_launchagents ;;
    env-vars)     list_env_vars ;;
    tool-versions) list_tool_versions ;;
  esac
}

# ------------------------------------------------------------------ vault sync detection (status/diff).
# READS PATHS AND CONFIG PRESENCE ONLY. It never opens a note, never greps note content, never lists a
# folder's contents beyond checking whether specific config files/dirs exist.
vault_sync_method() {
  if [ ! -e "$VAULT_DIR" ]; then printf 'no-vault'; return; fi
  # fully resolve symlinks (the vault folder itself, or an ancestor) to the real physical path
  _real=$(cd "$VAULT_DIR" 2>/dev/null && pwd -P)
  [ -n "$_real" ] || _real="$VAULT_DIR"
  _methods=''
  case "$_real" in
    "$HOME/Library/Mobile Documents/"*) _methods="icloud" ;;
  esac
  if git -C "$VAULT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    [ -n "$_methods" ] && _methods="$_methods+git" || _methods="git"
  fi
  # Obsidian Sync is a CORE plugin, not a community one: enabled state lives in core-plugins.json; some
  # versions also create a sync/ state directory under .obsidian/. Config presence only, never its content
  # beyond a one-word grep for the plugin id.
  _obs=0
  if [ -f "$VAULT_DIR/.obsidian/core-plugins.json" ] && grep -q '"sync"' "$VAULT_DIR/.obsidian/core-plugins.json" 2>/dev/null; then _obs=1; fi
  [ -d "$VAULT_DIR/.obsidian/sync" ] && _obs=1
  if [ "$_obs" = 1 ]; then [ -n "$_methods" ] && _methods="$_methods+obsidian-sync" || _methods="obsidian-sync"; fi
  [ -n "$_methods" ] || _methods="local-only"
  printf '%s' "$_methods"
}

# ------------------------------------------------------------------ status
cmd_status() {
  _id=$(machine_id); _role=$(machine_role)
  printf 'mac-sync status — %s — %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$_id"
  printf '\nrepo\n'
  if git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    _ba=$(repo_behind_ahead)
    printf '  branch  %s @ %s\n' "$(repo_branch)" "$(repo_head)"
    printf '  behind  %s   ahead  %s\n' "$(printf '%s' "$_ba" | awk '{print $1}')" "$(printf '%s' "$_ba" | awk '{print $2}')"
    _dirty=$(git -C "$REPO_DIR" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    printf '  dirty   %s file(s) not committed\n' "$_dirty"
  else printf '  NOT a git repo at %s\n' "$REPO_DIR"; fi

  printf '\nrole and lease\n'
  printf '  role    %s (%s)\n' "$_role" "$RUNNER_CFG/role"
  if [ -r "$OMNI_STATE/lease.env" ]; then
    _lv=$(sed -n 's/^verdict=//p' "$OMNI_STATE/lease.env" | tail -1)
    _lh=$(sed -n 's/^holder=//p'  "$OMNI_STATE/lease.env" | tail -1)
    _lc=$(sed -n 's/^checked_at=//p' "$OMNI_STATE/lease.env" | tail -1 | tr -dc '0-9')
    _la='unknown age'; [ -n "$_lc" ] && _la="$(( ($(date +%s) - _lc) / 60 ))m ago"
    printf '  lease   %s holder=%s (cached, checked %s)\n' "${_lv:-none}" "${_lh:--}" "$_la"
  else printf '  lease   no cached decision yet — this Mac has not run a --task through claude-auto\n'; fi

  printf '\nvault (%s)\n' "$VAULT_DIR"
  printf '  sync    %s\n' "$(vault_sync_method)"

  printf '\ncounts (this Mac)\n'
  for c in mcp-servers plugins skills runner-tasks; do
    _n=$(list_for "$c" | grep -c . 2>/dev/null); [ -n "$_n" ] || _n=0
    printf '  %-13s %s\n' "$c" "$_n"
  done

  printf '\n.env files (variable NAMES only — no value is ever read)\n'
  _envf=$(list_env_vars)
  if [ -n "$_envf" ]; then printf '%s\n' "$_envf" | sed 's/^/  /'
  else printf '  none found under %s/*/.env\n' "$CONFIG_ROOT"; fi
}

# ------------------------------------------------------------------ pull
cmd_pull() {
  if ! git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "mac-sync pull: $REPO_DIR is not a git repo — refusing" >&2; return 1
  fi
  if [ -d "$REPO_DIR/.git/rebase-merge" ] || [ -d "$REPO_DIR/.git/rebase-apply" ]; then
    echo "mac-sync pull: a rebase from an earlier conflict is already in progress. Resolve it first —" >&2
    echo "  cd $REPO_DIR && git status   # see what conflicts" >&2
    echo "  then: git rebase --continue   (or git rebase --abort to back out). Refusing to start another." >&2
    return 1
  fi
  _errf=$(mktemp "${TMPDIR:-/tmp}/mac-sync-pull.XXXXXX") || return 1
  _before=$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null)
  # capture the real exit code BEFORE branching: `if CMD; then …; fi` with no else discards CMD's own
  # status once the then-branch is skipped (the if-statement itself exits 0 in that case, by POSIX rule —
  # `_rc=$?` placed after such a fi would always read 0, never the failure it is meant to report)
  git -C "$REPO_DIR" pull --rebase --autostash >"$_errf" 2>&1
  _rc=$?
  if [ "$_rc" -eq 0 ]; then
    _after=$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null)
    if [ "$_before" = "$_after" ]; then
      echo "mac-sync pull: already up to date. $(repo_branch) @ $(repo_head)"
    else
      echo "mac-sync pull: pulled clean. $(repo_branch) @ $(repo_head) (was ${_before:0:7})"
    fi
    rm -f "$_errf"; return 0
  fi
  echo "mac-sync pull: refused — 'git pull --rebase --autostash' failed (rc=$_rc). This is a real conflict," >&2
  echo "not just local edits (--autostash already handles a plain dirty tree). Output:" >&2
  sed 's/^/  /' "$_errf" >&2
  if [ -d "$REPO_DIR/.git/rebase-merge" ] || [ -d "$REPO_DIR/.git/rebase-apply" ]; then
    echo "mac-sync pull: a rebase is now in progress. Fix the conflicting file(s) 'git status' names, 'git add'" >&2
    echo "them, then 'git rebase --continue' (or 'git rebase --abort' to back out)." >&2
  fi
  if git -C "$REPO_DIR" stash list 2>/dev/null | grep -qi 'autostash'; then
    echo "mac-sync pull: your local changes were auto-stashed and were NOT restored. See 'git stash list' and" >&2
    echo "'git stash pop' once the rebase above is resolved." >&2
  fi
  rm -f "$_errf"; return 1
}

# ------------------------------------------------------------------ export
cmd_export() {
  _push=0; for a in "$@"; do [ "$a" = --push ] && _push=1; done
  if ! git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "mac-sync export: $REPO_DIR is not a git repo — refusing" >&2; return 1
  fi
  _id=$(machine_id)
  _dir="$MANIFEST_ROOT/$_id"
  mkdir -p "$_dir" || { echo "mac-sync export: could not create $_dir" >&2; return 1; }
  for c in $CATEGORIES; do
    list_for "$c" | sort -u > "$_dir/$c.txt"
  done
  # No live timestamp in here on purpose: a field that always changes would make every export a real git
  # diff and defeat the "no change -> nothing to commit" check just below. "When" is git's own commit date
  # on this path (cmd_diff reads it with `git log`), not a value baked into the tracked file.
  {
    printf '# mac-sync export — %s\n' "$_id"
    printf 'role: %s\n' "$(machine_role)"
    printf 'vaultSync: %s\n' "$(vault_sync_method)"
  } > "$_dir/meta.txt"
  # shellcheck disable=SC2086  # CATEGORIES is a space-separated list, split into words on purpose
  echo "mac-sync export: wrote $_dir/{$(printf '%s,' $CATEGORIES | sed 's/,$//'),meta}.txt"

  ( cd "$REPO_DIR" && git add "mac-config/$_id" ) || { echo "mac-sync export: git add failed" >&2; return 1; }
  if git -C "$REPO_DIR" diff --cached --quiet -- "mac-config/$_id"; then
    echo "mac-sync export: no change since the last export — nothing to commit"
  else
    if git -C "$REPO_DIR" commit -q -m "mac-sync export: $_id $(date -u +%Y-%m-%dT%H:%M:%SZ)" -- "mac-config/$_id"; then
      echo "mac-sync export: committed locally ($(repo_head))"
    else
      echo "mac-sync export: git commit failed — the files are written but not committed" >&2; return 1
    fi
  fi
  if [ "$_push" = 1 ]; then
    if git -C "$REPO_DIR" push >/dev/null 2>&1; then
      echo "mac-sync export: pushed"
    else
      echo "mac-sync export: push FAILED — committed locally only. Check network/credentials and 'git push' by hand; the next successful push (or the other Mac's next 'pull') will pick this up." >&2
      return 1
    fi
  else
    echo "mac-sync export: not pushed (pass --push, or 'git push' yourself, so the other Mac's 'pull' can see it)"
  fi
}

# ------------------------------------------------------------------ diff
cmd_diff() {
  _me=$(machine_id)
  if [ ! -d "$MANIFEST_ROOT" ]; then
    echo "mac-sync diff: no $MANIFEST_ROOT yet — run 'export' on at least one Mac first" >&2; return 1
  fi
  _other="${1:-}"
  if [ -z "$_other" ]; then
    _cands=''
    for d in "$MANIFEST_ROOT"/*/; do
      [ -d "$d" ] || continue
      n=${d%/}; n=${n##*/}
      [ "$n" = "$_me" ] || _cands="$_cands $n"
    done
    _n_cands=$(printf '%s' "$_cands" | tr -s ' ' '\n' | grep -c .)
    case "$_n_cands" in
      0) echo "mac-sync diff: no OTHER Mac has exported yet (only $_me, or nothing). Nothing to diff against." >&2; return 1 ;;
      1) _other=$(printf '%s' "$_cands" | tr -d ' ') ;;
      *) echo "mac-sync diff: more than one other Mac has exported:$_cands — name one: mac-sync.sh diff <machine-id>" >&2; return 1 ;;
    esac
  fi
  _odir="$MANIFEST_ROOT/$_other"
  [ -d "$_odir" ] || { echo "mac-sync diff: no manifest at $_odir — run 'pull' first, or check the id" >&2; return 1; }
  _otime=$(git -C "$REPO_DIR" log -1 --format=%cI -- "mac-config/$_other" 2>/dev/null)
  echo "mac-sync diff: this Mac ($_me) vs $_other's last export (${_otime:-unknown})"
  _found=0
  for c in $CATEGORIES; do
    [ -f "$_odir/$c.txt" ] || continue
    _mine=$(list_for "$c" | sort -u)
    _missing=$(comm -23 "$_odir/$c.txt" <(printf '%s\n' "$_mine" | sort -u) 2>/dev/null)
    if [ -n "$_missing" ]; then
      _found=1
      printf '\n%s — this Mac lacks:\n' "$c"
      printf '%s\n' "$_missing" | sed 's/^/  /'
    fi
  done
  _mv=$(vault_sync_method); _ov=$(sed -n 's/^vaultSync: //p' "$_odir/meta.txt" 2>/dev/null)
  if [ -n "$_ov" ] && [ "$_ov" != "$_mv" ]; then
    _found=1
    printf '\nvault sync — differs: this Mac = %s, %s = %s\n' "$_mv" "$_other" "${_ov:-unknown}"
  fi
  _mr=$(machine_role); _or=$(sed -n 's/^role: //p' "$_odir/meta.txt" 2>/dev/null)
  if [ -n "$_or" ] && [ "$_or" != "$_mr" ]; then
    _found=1
    printf '\nrole — differs: this Mac = %s, %s = %s\n' "$_mr" "$_other" "${_or:-unknown}"
  fi
  [ "$_found" = 1 ] || echo "mac-sync diff: no gaps found — this Mac has everything $_other's last export listed"
  return 0
}

# ------------------------------------------------------------------ dispatch
[ $# -ge 1 ] || usage 2
CMD="$1"; shift
case "$CMD" in
  status) cmd_status "$@" ;;
  pull)   cmd_pull "$@" ;;
  export) cmd_export "$@" ;;
  diff)   cmd_diff "$@" ;;
  -h|--help) usage 0 ;;
  *) echo "mac-sync: unknown subcommand '$CMD'" >&2; usage 2 ;;
esac
