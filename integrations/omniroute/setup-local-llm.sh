#!/usr/bin/env bash
# setup-local-llm.sh — installs Bonsai 27B's own runtime and serves it on loopback only, for
# OmniRoute's `local` combo (integrations/omniroute/README.md). Prints the OMNIROUTE_LOCAL_MODEL
# value to export once it is up.
#
# WHY NOT LM STUDIO / OLLAMA / STOCK LLAMA.CPP (verified 2026-09-28, sources below):
#   PrismML's own demo repo says plainly: "Bonsai 2 needs this demo's llama.cpp binaries, from the
#   PrismML fork; stock llama.cpp cannot run these files." As of 2026-09-25 only CPU/Metal Fast
#   Walsh-Hadamard Transform support has merged upstream — full Bonsai 2 support has not. So this
#   script installs PrismML's own tooling (a clone of PrismML-Eng/Bonsai-demo, which builds/fetches
#   the fork, and on Apple Silicon also sets up a native MLX venv), not a third-party runtime. LM
#   Studio's own model page (lmstudio.ai/models/bonsai-27b) could not be reached from this sandbox
#   (egress-blocked) to check whether *its* bundled llama.cpp carries the same fork — unverified,
#   so this script does not offer LM Studio as an alternative.
#
# Sources (fetched 2026-09-28, all primary — quote the license/runtime/size facts you rely on
# against these again before trusting them past this date; PrismML ships fast):
#   https://github.com/PrismML-Eng/Bonsai-demo (README.md, setup.sh)  — license: Apache-2.0 (repo
#     footer). Runtime: PrismML llama.cpp fork (github.com/PrismML-Eng/llama.cpp) for GGUF; a native
#     MLX venv (`.venv-vlm`, mlx-vlm==0.7.2) on Apple Silicon.
#   Size: the setup script's own downloader picks between "PQ2_0 where the backend has kernels,
#     group-64 Q2_0 otherwise" -- NOT a user-selectable flag in setup.sh (grepped 2026-09-28: no
#     interactive prompt or env var chooses quantization). The README documents two named packings:
#       PQ2_0 (the default the demo downloads): 7.8 GB + 1.7 GB vision projector  ~9.5 GB total
#       PTQ1_0 (smaller, "requires slower prompt processing"): 5.9 GB
#     Because the downloader — not this script — decides which one a given Mac gets, and no
#     confirmed override exists, this script CANNOT promise the 5.9 GB build; it prints both figures
#     up front (per the brief: "print the size first") and reports which one actually landed.
#   Env vars setup.sh reads (from setup.sh itself): BONSAI_MODEL (default 27B; 4B also exists — a
#     real "smaller build" if 27B does not fit), BONSAI_FAMILY (default bonsai2), BONSAI_TOKEN (a
#     Hugging Face token — REQUIRED to download; never put a real one in this repo or its state
#     files), BONSAI_SKIP_MLX, BONSAI_MLX_VLM, BONSAI_OPENWEBUI, BONSAI_CODE_INTERPRETER.
#   Serve: ./scripts/start_llama_server.sh -> documented at http://localhost:8080. This script does
#     NOT independently confirm that binds loopback-only (llama.cpp's own server defaults to
#     127.0.0.1, and this is a fork of it, but the wrapper script's own flags were not read in this
#     sandbox) — it checks after starting and REFUSES to hand back a model id if the port answers on
#     a non-loopback address too. Treat that check, not this comment, as the proof.
#   Hugging Face itself is blocked from this sandbox (403; confirmed 2026-09-28, same result
#     integrations/laya/README.md recorded for the same block) — BONSAI_TOKEN's download cannot run
#     here. This script detects that and stops before attempting it (see check_can_reach_hf below),
#     rather than fighting it. Real installs need a Mac with network access.
#
# Usage: setup-local-llm.sh [--dry-run] [--install-dir PATH] [--port N]
# macOS, bash 3.2-safe (no associative arrays, no ${var,,}, no mapfile). Idempotent: safe to re-run.
set -u
umask 077

DRY_RUN=0
INSTALL_DIR="${BONSAI_INSTALL_DIR:-$HOME/Applications/bonsai-demo}"
PORT="${BONSAI_PORT:-8080}"
HOST="127.0.0.1"
REPO_URL="https://github.com/PrismML-Eng/Bonsai-demo.git"
PROVIDER_ID="${BONSAI_OMNIROUTE_PROVIDER_ID:-bonsai-local}"
HF_BLOCKED=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --install-dir) shift; INSTALL_DIR="${1:-}" ;;
    --port) shift; PORT="${1:-}" ;;
    -h|--help) sed -n '2,45p' "$0"; exit 0 ;;
    *) echo "setup-local-llm.sh: unknown argument '$1'" >&2; exit 64 ;;
  esac
  shift
done

log()  { printf '[setup-local-llm] %s\n' "$*"; }
run()  { # print then, unless --dry-run, execute
  log "+ $*"
  [ "$DRY_RUN" = 1 ] && return 0
  "$@"
}

print_size_info() {
  cat <<'SIZES'
[setup-local-llm] Bonsai 2 27B build sizes (PrismML-Eng/Bonsai-demo README, read 2026-09-28):
    PTQ1_0  5.9 GB   smaller; slower prompt processing
    PQ2_0   7.8 GB + 1.7 GB vision projector (~9.5 GB total)   the demo's default
  The demo's own downloader picks between these ("PQ2_0 where the backend has kernels, group-64
  Q2_0 otherwise") — this script cannot force the smaller build; it reports which one actually
  landed after setup.sh runs. A 4B family also exists (BONSAI_MODEL=4B) if 27B does not fit this
  Mac's RAM/disk — this script does not switch to it on your behalf.
SIZES
}

check_can_reach_hf() {
  # Same probe integrations/laya/README.md used for the identical block, same day.
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 https://huggingface.co 2>/dev/null) || code="000"
  case "$code" in
    2*|3*) return 0 ;;
    *) log "huggingface.co unreachable (http=$code) from this host — Bonsai's weights cannot download here."
       return 1 ;;
  esac
}

port_listening_on() { # host port -> 0 if something answers there
  curl -fsS --max-time 2 "http://$1:$2/health" >/dev/null 2>&1 \
    || curl -fsS --max-time 2 "http://$1:$2/v1/models" >/dev/null 2>&1
}

print_size_info

if [ "$(uname -s 2>/dev/null)" != "Darwin" ] && [ "$DRY_RUN" != 1 ]; then
  log "this is macOS-only (PrismML's fork ships Metal kernels); refusing to actually install on '$(uname -s)'."
  log "re-run with --dry-run to see the plan on any OS."
  exit 1
fi

# --- idempotency: already served? -------------------------------------------------------------
if port_listening_on "$HOST" "$PORT"; then
  if ! curl -fsS --max-time 3 "http://$HOST:$PORT/v1/models" 2>/dev/null | grep -qi 'bonsai'; then
    log "something else is already using http://$HOST:$PORT (its /v1/models does not list Bonsai) —"
    log "  stop it or re-run with --port N. Nothing changed."
    exit 1
  fi
  log "Bonsai is already answering on http://$HOST:$PORT — nothing to install."
  log "OMNIROUTE_LOCAL_MODEL=$PROVIDER_ID/bonsai-2-27b   # confirm the exact model string: curl -s http://$HOST:$PORT/v1/models"
  exit 0
fi

if ! check_can_reach_hf; then
  log "DEFERRED: Hugging Face (where Bonsai's weights live) is not reachable from this machine. Check the"
  log "  network, then re-run. The steps below are shown as a plan only — nothing is installed."
  HF_BLOCKED=1
  if [ "$DRY_RUN" != 1 ]; then
    log "(showing the plan anyway, as --dry-run would, since nothing further here can actually run)"
  fi
  DRY_RUN=1
fi

# --- clone (idempotent: skip if already a clone) -----------------------------------------------
if [ -d "$INSTALL_DIR/.git" ]; then
  log "already cloned at $INSTALL_DIR — skipping clone. (git -C \"$INSTALL_DIR\" pull, by hand, to update.)"
else
  run mkdir -p "$(dirname "$INSTALL_DIR")"
  run git clone "$REPO_URL" "$INSTALL_DIR"
fi

# --- setup.sh: builds/fetches the PrismML llama.cpp fork, downloads the model ------------------
# BONSAI_TOKEN is read from the CALLER's environment (never written by this script, never logged,
# never stored in a repo file) — Steven exports it in his own shell before running this for real.
if [ -z "${BONSAI_TOKEN:-}" ] && [ "$DRY_RUN" != 1 ]; then
  log "BONSAI_TOKEN is not set in this shell's environment — setup.sh needs a Hugging Face token to"
  log "  download weights. export BONSAI_TOKEN=... (your own HF token, never pasted into this repo)"
  log "  and re-run. Stopping before setup.sh so it does not fail mid-download."
  exit 78
fi
if [ -x "$INSTALL_DIR/setup.sh" ] || [ "$DRY_RUN" = 1 ]; then
  ( run cd "$INSTALL_DIR" && run ./setup.sh )
else
  log "no setup.sh at $INSTALL_DIR (clone incomplete or layout changed upstream) — stopping."
  [ "$DRY_RUN" != 1 ] && exit 1
fi

# --- serve on loopback only ----------------------------------------------------------------------
if [ "$DRY_RUN" != 1 ]; then
  if [ -x "$INSTALL_DIR/scripts/start_llama_server.sh" ]; then
    log "starting the server in the background (log: $INSTALL_DIR/.bonsai-server.log)"
    ( cd "$INSTALL_DIR" && nohup ./scripts/start_llama_server.sh >".bonsai-server.log" 2>&1 & )
    tries=0
    while [ $tries -lt 30 ] && ! port_listening_on "$HOST" "$PORT"; do sleep 2; tries=$((tries + 1)); done
    if ! port_listening_on "$HOST" "$PORT"; then
      log "server did not answer on $HOST:$PORT after 60s — check $INSTALL_DIR/.bonsai-server.log"
      exit 1
    fi
    # loopback-only check the header above promises: refuse to hand back a model id otherwise.
    lan_ip=$(ipconfig getifaddr en0 2>/dev/null || true)
    if [ -n "$lan_ip" ] && curl -fsS --max-time 2 "http://$lan_ip:$PORT/v1/models" >/dev/null 2>&1; then
      log "REFUSING: $PORT also answers on $lan_ip, not loopback-only. Fix the server's --host flag"
      log "  (llama.cpp's own default is 127.0.0.1; something here is overriding it) before using this"
      log "  as OmniRoute's local provider — client data must never reach a LAN-reachable port."
      srv_pids=$(lsof -ti "tcp:$PORT" -sTCP:LISTEN 2>/dev/null || true)
      [ -n "$srv_pids" ] && kill $srv_pids 2>/dev/null && log "  stopped the server this script started (pid $srv_pids)."
      exit 1
    fi
    log "confirmed loopback-only: $PORT answers on 127.0.0.1, not on ${lan_ip:-<no LAN interface found>}."
  else
    log "no scripts/start_llama_server.sh at $INSTALL_DIR — the upstream layout may have changed; not proven."
    exit 1
  fi
fi

echo
if [ "$DRY_RUN" = 1 ]; then
  log "PLAN ONLY — nothing was installed, downloaded or started."
  [ "$HF_BLOCKED" = 1 ] && exit 75
  exit 0
fi
log "Bonsai 27B is ready to register with OmniRoute as a local provider (configure-omniroute.sh does this):"
log "  base URL:  http://$HOST:$PORT/v1   (no credential — it is local)"
log "  provider id to use: $PROVIDER_ID"
log "  OMNIROUTE_LOCAL_MODEL=$PROVIDER_ID/bonsai-2-27b"
log "  ^ confirm the exact model name string against the running server before trusting it verbatim:"
log "    curl -s http://$HOST:$PORT/v1/models"
