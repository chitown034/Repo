#!/bin/bash
# orca-remote.sh - control Orca on one Mac from the other (bash 3.2 safe).
# Subcommands: serve pair status unpair report doctor        Global flag: --dry-run
# A pairing link (orca://pair?code=...) is a SECRET: control of that Mac's agents.
# This script never writes one to a file or log, never puts one in `report`, never echoes one,
# never passes --grant-desktop-control, and never advertises a public address.
set -u

CFG_DIR="${HOME}/.config/claude-runner"
ID_FILE="${CFG_DIR}/id"
DRY=0

say()  { printf '%s\n' "$*"; }
warn() { printf '%s\n' "$*" >&2; }
now()  { date -u +%Y-%m-%dT%H:%M:%SZ; }
dry()  { printf 'DRY-RUN would: %s\n' "$*"; }

clean() { printf '%s' "$1" | LC_ALL=C tr -cd 'A-Za-z0-9 ._()@+-' | cut -c1-40; }
host_short() { clean "$(hostname -s 2>/dev/null || hostname 2>/dev/null || echo mac)"; }
host_label() {
  local l=""
  if [ -r "$ID_FILE" ]; then l="$(head -n 1 "$ID_FILE" 2>/dev/null)"; fi
  if [ -z "$(clean "$l")" ]; then l="$(scutil --get ComputerName 2>/dev/null || true)"; fi
  if [ -z "$(clean "$l")" ]; then l="$(host_short)"; fi
  clean "$l"
}
json_str() { printf '%s' "$1" | LC_ALL=C tr -d '\000-\037' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

find_orca() {
  if [ -n "${ORCA_BIN:-}" ] && [ -x "${ORCA_BIN}" ]; then printf '%s' "$ORCA_BIN"; return 0; fi
  command -v orca 2>/dev/null
}

# Anything that looks like a pairing link or code is removed from text we print.
scrub() { sed -e 's#orca://[^[:space:]"'"'"']*#[link hidden]#g' -e 's#\(code=\)[^&[:space:]"'"'"']*#\1[hidden]#g'; }

# ---------- address policy -------------------------------------------------
# Private LAN, CGNAT/Tailscale (100.64/10), loopback, link-local, .local, .ts.net, .home.arpa.
is_private_addr() {
  local a="$1" o1 o2 o3 o4 extra n
  [ -n "$a" ] || return 1
  case "$a" in *://*|*/*|*@*|*" "*) return 1 ;; esac
  case "$a" in
    localhost|*.local|*.ts.net|*.home.arpa) return 0 ;;
    fd*:*|FD*:*|fe80:*|::1) return 0 ;;
  esac
  case "$a" in *[!0-9.]*) return 1 ;; esac
  local IFS=.
  # shellcheck disable=SC2086
  set -- $a
  IFS=' '
  o1="${1:-}"; o2="${2:-}"; o3="${3:-}"; o4="${4:-}"; extra="${5:-}"
  [ -n "$o4" ] && [ -z "$extra" ] || return 1
  for n in "$o1" "$o2" "$o3" "$o4"; do
    case "$n" in ''|*[!0-9]*) return 1 ;; esac
    [ "${#n}" -le 3 ] && [ "$n" -le 255 ] || return 1
  done
  case "$o1" in
    10|127) return 0 ;;
    172) [ "$o2" -ge 16 ] && [ "$o2" -le 31 ] ;;
    192) [ "$o2" -eq 168 ] ;;
    100) [ "$o2" -ge 64 ] && [ "$o2" -le 127 ] ;;
    169) [ "$o2" -eq 254 ] ;;
    *) return 1 ;;
  esac
}

lan_candidates() { # one private IPv4 per line, read-only
  { ifconfig 2>/dev/null | sed -n 's/^[[:space:]]*inet \([0-9.]*\).*/\1/p'
    if command -v tailscale >/dev/null 2>&1; then tailscale ip -4 2>/dev/null; fi
  } | while IFS= read -r ip; do
    case "$ip" in 127.*) continue ;; esac
    if is_private_addr "$ip"; then printf '%s\n' "$ip"; fi
  done
}

confirm() { # prompt -> 0 only on y/Y/yes
  local ans=""
  printf '%s [y/N] ' "$1" >&2
  read -r ans || ans=""
  case "$ans" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}

# ---------- subcommands ----------------------------------------------------
cmd_serve() {
  local orca addr="" port="" phone=0 a cands n i pick
  while [ "$#" -gt 0 ]; do
    a="$1"
    case "$a" in
      --grant-desktop-control*) warn "REFUSED: --grant-desktop-control lets a paired client drive this Mac's screen. This script never allows it."; return 2 ;;
      --phone) phone=1 ;;
      --address) shift; addr="${1:-}" ;;
      --port) shift; port="${1:-}" ;;
      *) warn "unknown serve option: $a  (allowed: --phone, --address <private host>, --port <n>)"; return 2 ;;
    esac
    shift
  done
  orca="$(find_orca)" || { warn "orca is not on PATH. Install/open Orca first."; return 1; }
  if [ -n "$port" ]; then case "$port" in ''|*[!0-9]*) warn "bad port"; return 2 ;; esac; fi
  if [ -z "$addr" ]; then
    cands="$(lan_candidates)"
    say "Which address should the OTHER Mac use to reach this one? Private networks only." >&2
    n=0
    for i in $cands; do n=$((n + 1)); say "  $n) $i" >&2; done
    say "  or type a private IP / name.local / name.ts.net. Public addresses are refused." >&2
    if [ "$DRY" = 1 ]; then dry "ask for an address, then run: orca serve --pairing-address <address>"; return 0; fi
    printf 'Address: ' >&2; pick=""; read -r pick || pick=""
    case "$pick" in
      ''|*[!0-9]*) addr="$pick" ;;
      *) addr="$(printf '%s\n' "$cands" | sed -n "${pick}p")" ;;
    esac
  fi
  if ! is_private_addr "$addr"; then
    warn "REFUSED: '${addr}' is not a private address (home LAN, Tailscale 100.64/10, .local, .ts.net)."
    return 2
  fi
  if [ "$DRY" = 1 ]; then dry "run in the foreground: orca serve --pairing-address ${addr}${port:+ --port $port}$([ "$phone" = 1 ] && echo ' --mobile-pairing')  (no --grant-desktop-control)"; return 0; fi
  if { [ ! -t 1 ] || [ ! -t 2 ]; } && [ "${ORCA_REMOTE_ALLOW_NOTTY:-0}" != 1 ]; then
    warn "REFUSED: stdout/stderr is not a terminal. The pairing link prints only to a terminal, never to a file or pipe."
    return 2
  fi
  say "The server prints a pairing link. It is a SECRET (control of this Mac's agents). Show it only to the other Mac." >&2
  say "Advertising ${addr}. Stop the server with Ctrl+C - that also invalidates the offer (rotate by stopping)." >&2
  confirm "Start Orca server on this Mac now?" || { say "Not started (default N)." >&2; return 0; }
  set -- serve --pairing-address "$addr"
  if [ -n "$port" ]; then set -- "$@" --port "$port"; fi
  if [ "$phone" = 1 ]; then set -- "$@" --mobile-pairing; fi
  if command -v caffeinate >/dev/null 2>&1; then exec caffeinate -i "$orca" "$@"; fi
  exec "$orca" "$@"
}

cmd_pair() {
  local orca name="" code="" rc
  orca="$(find_orca)" || { warn "orca is not on PATH."; return 1; }
  if [ "$DRY" = 1 ]; then dry "ask a name, ask y/N, read the other Mac's link with a hidden prompt, run: orca environment add --name <name> --pairing-code <hidden>"; return 0; fi
  say "Pair ONLY over your home LAN or your own private network. The link is a secret; never paste it anywhere but this prompt." >&2
  printf 'Name for the other Mac (a-z, 0-9, -): ' >&2; read -r name || name=""
  case "$name" in
    [a-z0-9]*) ;; *) warn "bad name"; return 2 ;;
  esac
  case "$name" in *[!a-z0-9-]*) warn "bad name"; return 2 ;; esac
  [ "${#name}" -le 30 ] || { warn "name too long"; return 2; }
  confirm "Save '${name}' as a paired Orca environment on this Mac?" || { say "Not paired (default N)." >&2; return 0; }
  printf 'Paste the pairing link (hidden): ' >&2
  read -rs code || code=""
  printf '\n' >&2
  case "$code" in
    orca://pair\?code=*) ;;
    *) code=""; warn "That is not an Orca pairing link. Nothing saved."; return 2 ;;
  esac
  "$orca" environment add --name "$name" --pairing-code "$code" >/dev/null 2>&1; rc=$?
  code=""; unset code
  if [ "$rc" = 0 ]; then say "Paired as '${name}'. Try: orca-remote.sh status"; else warn "orca refused the pairing (exit ${rc}). Output withheld; check the link is current and the other Mac is serving."; return 1; fi
}

env_names() { # names only, from `orca environment list --json`; empty if shape differs
  local orca; orca="$(find_orca)" || return 0
  "$orca" environment list --json 2>/dev/null | grep -Eo '"name": *"[^"]*"' | sed -e 's/^"name": *"//' -e 's/"$//' \
    | grep -E '^[A-Za-z0-9._-]{1,40}$' || true
}

cmd_status() {
  local orca nm; orca="$(find_orca)" || { warn "orca is not on PATH."; return 1; }
  if [ "$DRY" = 1 ]; then dry "orca status; orca environment list --json (names only); status output scrubbed of links/codes"; return 0; fi
  say "== orca status =="; "$orca" status 2>&1 | scrub
  say "== paired environments (names only) =="
  nm="$(env_names)"
  if [ -n "$nm" ]; then printf '%s\n' "$nm"; else say "(none, or the list format was not recognised; run 'orca environment list' yourself)"; fi
  return 0
}

cmd_unpair() {
  local orca name="${1:-}"
  orca="$(find_orca)" || { warn "orca is not on PATH."; return 1; }
  if [ "$DRY" = 1 ]; then dry "orca environment rm <name> after y/N"; return 0; fi
  if [ -z "$name" ]; then
    say "Paired: $(env_names | tr '\n' ' ')" >&2
    printf 'Name to remove: ' >&2; read -r name || name=""
  fi
  case "$name" in ''|*[!A-Za-z0-9._-]*) warn "bad name"; return 2 ;; esac
  confirm "Remove paired environment '${name}'?" || { say "Kept (default N)." >&2; return 0; }
  if "$orca" environment rm "$name" >/dev/null 2>&1; then say "Removed '${name}'."; else say "'${name}' was not paired (nothing to remove)."; fi
  return 0
}

cmd_report() {
  local orca ver="" reach=false names="" first=1 nm
  if orca="$(find_orca)"; then
    ver="$("$orca" --version 2>/dev/null | head -n 1 | LC_ALL=C tr -cd 'A-Za-z0-9._ -' | cut -c1-30)"
    if "$orca" status >/dev/null 2>&1; then reach=true; fi
    for nm in $(env_names); do
      if [ "$first" = 1 ]; then first=0; else names="${names},"; fi
      names="${names}\"$(json_str "$nm")\""
    done
  fi
  printf '{"host":"%s","label":"%s","orcaVersion":"%s","runtimeReachable":%s,"pairedEnvironments":[%s],"checkedAt":"%s"}\n' \
    "$(json_str "$(host_short)")" "$(json_str "$(host_label)")" "$(json_str "$ver")" "$reach" "$names" "$(now)"
}

FAILS=0
ok()  { printf '  OK    %s\n' "$*"; }
wr()  { printf '  WARN  %s\n' "$*"; }
bad() { printf '  FAIL  %s\n' "$*"; FAILS=$((FAILS + 1)); }

cmd_doctor() {
  local orca line pid addr nserve=0 cand n
  say "Orca remote doctor - $(host_label)"
  if orca="$(find_orca)"; then
    ok "orca on PATH, version: $("$orca" --version 2>/dev/null | head -n 1)"
    if "$orca" status >/dev/null 2>&1; then ok "orca status: runtime reachable"; else wr "orca status failed: open the Orca app, or run 'orca serve' via orca-remote.sh serve"; fi
  else
    bad "orca not on PATH (install Orca; in the app: Shell Command / CLI install)"
  fi
  if [ -d /Applications/Orca.app ] || [ -d "${HOME}/Applications/Orca.app" ]; then ok "Orca app installed"; else wr "Orca.app not found in /Applications or ~/Applications"; fi
  if command -v tailscale >/dev/null 2>&1 || [ -d /Applications/Tailscale.app ]; then ok "Tailscale present (private network option)"; else wr "Tailscale not found: pair over the home LAN only"; fi
  cand="$(lan_candidates)"; n=0
  n="$(printf '%s' "$cand" | grep -c . || true)"
  if [ "$n" -gt 0 ]; then say "  INFO  private address candidates (read-only): $(printf '%s' "$cand" | tr '\n' ' ')"; else wr "no private LAN/Tailscale address found"; fi
  if [ -x /usr/libexec/ApplicationFirewall/socketfilterfw ]; then
    say "  INFO  firewall: $(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null | head -n 1) (macOS may prompt to allow incoming connections the first time you serve)"
  fi
  while IFS= read -r line; do
    case "$line" in *"orca serve"*|*"orca-dev serve"*) ;; *) continue ;; esac
    case "$line" in *doctor*|*grep*) continue ;; esac
    nserve=$((nserve + 1))
    pid="$(printf '%s' "$line" | awk '{print $1}')"
    case "$line" in *--grant-desktop-control*) bad "orca serve pid ${pid} was started with --grant-desktop-control: stop it (Ctrl+C / kill ${pid})" ;; esac
    addr="$(printf '%s' "$line" | sed -n 's/.*--pairing-address[= ]\([^ ]*\).*/\1/p')"
    if [ -n "$addr" ] && ! is_private_addr "$addr"; then bad "orca serve pid ${pid} advertises a non-private address: stop it"; fi
  done <<EOT
$(ps -axo pid=,command= 2>/dev/null)
EOT
  if [ "$nserve" -gt 0 ]; then say "  INFO  ${nserve} orca serve process(es) running"; else ok "no orca serve running"; fi
  if [ "$FAILS" -gt 0 ]; then say "Result: ${FAILS} problem(s)."; return 1; fi
  say "Result: all required checks pass."
}

usage() { say "usage: orca-remote.sh [--dry-run] serve [--phone] [--address <private>] [--port <n>] | pair | status | unpair [name] | report | doctor"; }

main() {
  local args=() a
  for a in "$@"; do case "$a" in --dry-run) DRY=1 ;; *) args+=("$a") ;; esac; done
  local cmd="${args[0]:-}"
  [ "${#args[@]}" -gt 0 ] && args=("${args[@]:1}")
  case "$cmd" in
    serve)  cmd_serve "${args[@]+"${args[@]}"}" ;;
    pair)   cmd_pair ;;
    status) cmd_status ;;
    unpair) cmd_unpair "${args[@]+"${args[@]}"}" ;;
    report) cmd_report ;;
    doctor) cmd_doctor ;;
    *)      usage; return 2 ;;
  esac
}
main "$@"
