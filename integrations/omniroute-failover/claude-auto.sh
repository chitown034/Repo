#!/usr/bin/env bash
# claude-auto.sh — Claude subscription first; OmniRoute free-only providers while the subscription is
# usage-limited; back to the subscription when probe.sh proves it usable again.
# PII gate: a task that touches client data, loan files, CRM records or the ISA line never runs on a free
# provider. It is deferred (exit 75, the runner retries later) or, when OMNIROUTE_LOCAL_MODEL names the local
# Jarvis model inside OmniRoute, pinned to that local model. Mode is published for every task to read.
# Spec: integrations/omniroute-failover/README.md · written 2026-09-22 · NOT yet installed on the Mac.
# Usage: claude-auto [--task NAME] [--pii|--no-pii] [--force subscription|free|local] [--status] [--] <claude args…>
# No secrets live in this file. OMNIROUTE_API_KEY is read from ~/.config/omniroute/.env (must be chmod 600).
# Written for macOS bash 3.2 (no associative arrays, no ${var,,}).
set -u

CFG="${OMNIROUTE_CFG:-$HOME/.config/omniroute}"
STATE="$CFG/state"; mkdir -p "$STATE"
ROUTE="$STATE/route.env"          # mode= since= reset_at= reason= omni_ok= probed_at=  (shell-sourceable)
MODEFILE="$STATE/mode"            # one word for tasks to read: subscription | free-fallback | local-only
LOG="$STATE/claude-auto.log"
SAMPLES="$STATE/limit-samples.log" # redacted copies of every real limit message, to tighten LIMIT_RE
OMNI_BASE="${OMNIROUTE_BASE:-http://127.0.0.1:20128}"
FREE_MODEL="${OMNIROUTE_FREE_MODEL:-auto/coding:free}"   # OmniRoute auto-combo, free tier only (docs/routing/AUTO-COMBO.md)
LOCAL_MODEL="${OMNIROUTE_LOCAL_MODEL:-}"                  # e.g. ollama-local/llama3.1:8b once that provider exists in OmniRoute; empty = no local route
PROBE_MAX_AGE="${OMNIROUTE_PROBE_MAX_AGE:-1500}"          # seconds of stale state before the launcher re-probes on its own
LIMIT_RE='usage limit|hit your [a-z ]{0,12}limit|limit (has been )?reached|out of (extra )?usage|resets? (at|in) |rate_limit(_error)?|"error": ?"rate_limit"|[^0-9]429[^0-9]'
DEFAULT_PII_TASKS="lofty-crm-sync zoho-crm-sync isa-comms-bridge-local lead-triage-daily r2-lead-response-watchdog r12-inbox-triage r13-appointment-prep showing-sync steve-twin-sweep r11-isa-kpi-compile vanessa-imessage-inbox vanessa-discord-inbox vanessa-whatsapp-inbox health-notion-sync health-full-analysis health-coaching-weekly"

log()  { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$LOG"; }
now()  { date +%s; }
redact() { sed -E 's/(sk|key|token|Bearer)[-_ ][A-Za-z0-9_-]{6,}/\1-…/g' | tr -d '\r' | head -c 300; }
read_route() { mode=subscription; since=0; reset_at=0; reason=; omni_ok=1; probed_at=0; [ -f "$ROUTE" ] && . "$ROUTE"; }
write_route() { # mode since reset_at reason omni_ok probed_at
  r=$(printf '%s' "$4" | tr -c 'A-Za-z0-9 _.:=-' '_')
  printf 'mode=%s\nsince=%s\nreset_at=%s\nreason=%s\nomni_ok=%s\nprobed_at=%s\n' "$1" "$2" "$3" "'$r'" "$5" "$6" > "$ROUTE"
  printf '%s\n' "$1" > "$MODEFILE"; }

TASK=""; PII=""; FORCE=""; SHOW=0
while [ $# -gt 0 ]; do
  case "$1" in
    --task) TASK="$2"; shift 2 ;;  --pii) PII=1; shift ;;  --no-pii) PII=0; shift ;;
    --force) FORCE="$2"; shift 2 ;;  --status) SHOW=1; shift ;;  --) shift; break ;;  *) break ;;
  esac
done

is_pii=0
if [ "$PII" = 1 ]; then is_pii=1
elif [ "$PII" = 0 ]; then is_pii=0
elif [ -n "$TASK" ]; then
  list="$DEFAULT_PII_TASKS"; [ -f "$CFG/pii-tasks.txt" ] && list="$list $(tr '\n' ' ' < "$CFG/pii-tasks.txt")"
  case " $list " in *" $TASK "*) is_pii=1 ;; esac
fi

if [ -n "$FORCE" ]; then
  case "$FORCE" in
    subscription) write_route subscription "$(now)" 0 forced 1 0 ;;
    free)         write_route free-fallback "$(now)" 0 forced 1 0 ;;
    local)        write_route local-only "$(now)" 0 forced 1 0 ;;
    *) echo "claude-auto: --force takes subscription|free|local" >&2; exit 64 ;;
  esac
  log "forced mode=$FORCE by $(id -un)"
fi
read_route
if [ "$mode" != subscription ] && [ $(( $(now) - ${probed_at:-0} )) -gt "$PROBE_MAX_AGE" ] && [ "${reset_at:-0}" -le "$(now)" ]; then
  "$(dirname "$0")/probe.sh" --now >/dev/null 2>&1 || true   # state is stale: prove it before trusting it
  read_route
fi
if [ $SHOW = 1 ]; then cat "$ROUTE" 2>/dev/null || echo "mode=subscription"; exit 0; fi

headless=0; for a in "$@"; do case "$a" in -p|--print) headless=1 ;; esac; done

load_omni_key() {
  f="$CFG/.env"; [ -f "$f" ] || { echo "claude-auto: $f missing (needs OMNIROUTE_API_KEY=…)" >&2; return 1; }
  p=$(stat -f %Lp "$f" 2>/dev/null || stat -c %a "$f" 2>/dev/null)
  case "$p" in 600|400) ;; *) echo "claude-auto: $f must be chmod 600 (is $p)" >&2; return 1 ;; esac
  OMNIROUTE_API_KEY=$(grep -E '^OMNIROUTE_API_KEY=' "$f" | tail -1 | cut -d= -f2- | tr -d '"'"'"' ')
  [ -n "$OMNIROUTE_API_KEY" ] || { echo "claude-auto: OMNIROUTE_API_KEY not set in $f" >&2; return 1; }
}

route_omni() { # model route-mode pii_ok claude-args…
  model="$1"; rmode="$2"; piiok="$3"; shift 3
  curl -fsS --max-time 5 "$OMNI_BASE/healthz" >/dev/null 2>&1 || { log "omniroute /healthz failed"; echo "claude-auto: OmniRoute not answering on $OMNI_BASE — deferred (exit 75)" >&2; exit 75; }
  export ANTHROPIC_BASE_URL="$OMNI_BASE" ANTHROPIC_AUTH_TOKEN="$OMNIROUTE_API_KEY"
  export ANTHROPIC_MODEL="$model" ANTHROPIC_DEFAULT_OPUS_MODEL="$model" ANTHROPIC_DEFAULT_SONNET_MODEL="$model" \
         ANTHROPIC_DEFAULT_HAIKU_MODEL="$model" ANTHROPIC_DEFAULT_FABLE_MODEL="$model"
  unset ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN       # the subscription credential never reaches the proxy
  export VANESSA_ROUTE_MODE="$rmode" VANESSA_PII_OK="$piiok"
  args=(); skip=0                                       # rewrite an explicit --model so seat names resolve inside OmniRoute
  for a in "$@"; do
    if [ $skip = 1 ]; then args+=("$model"); skip=0; continue; fi
    case "$a" in --model) args+=("$a"); skip=1 ;; --model=*) args+=("--model=$model") ;; *) args+=("$a") ;; esac
  done
  log "route=$rmode model=$model task=${TASK:-?} pii=$is_pii headless=$headless"
  exec claude ${args[@]+"${args[@]}"}
}

run_headless_and_watch() { # subscription path: run, mirror output, detect a usage-limit result
  tmp=$(mktemp "${TMPDIR:-/tmp}/claude-auto.XXXXXX")
  claude "$@" 2>"$tmp.err" | tee "$tmp"; rc=${PIPESTATUS[0]}
  if [ "$rc" -ne 0 ] || grep -qE '"is_error": ?true' "$tmp"; then
    if cat "$tmp" "$tmp.err" | grep -qiE "$LIMIT_RE"; then
      epoch=$(cat "$tmp" "$tmp.err" | grep -oE '\|[0-9]{10}' | head -1 | tr -d '|'); [ -n "$epoch" ] || epoch=0
      write_route free-fallback "$(now)" "$epoch" "limit-detected task=${TASK:-?}" 1 0
      { printf '%s task=%s rc=%s sample=' "$(date -u +%FT%TZ)" "${TASK:-?}" "$rc"; cat "$tmp" "$tmp.err" | redact; echo; } >> "$SAMPLES"
      log "LIMIT detected task=${TASK:-?} reset_at=$epoch -> mode=free-fallback; exit 75 so the runner retries on the new route"
      cat "$tmp.err" >&2; rm -f "$tmp" "$tmp.err"; exit 75
    fi
  fi
  cat "$tmp.err" >&2; rm -f "$tmp" "$tmp.err"; exit "$rc"
}

case "$mode" in
  subscription)
    unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN           # never inherit a stale proxy setting
    export VANESSA_ROUTE_MODE=subscription VANESSA_PII_OK=1
    if [ $headless = 1 ]; then run_headless_and_watch "$@"; else exec claude "$@"; fi ;;
  free-fallback|local-only)
    if [ "${omni_ok:-1}" != 1 ]; then log "defer task=${TASK:-?}: subscription limited and OmniRoute unhealthy"; echo "claude-auto: subscription limited and OmniRoute unhealthy — deferred (exit 75)" >&2; exit 75; fi
    load_omni_key || exit 78
    if [ $is_pii = 1 ] || [ "$mode" = local-only ]; then
      if [ -n "$LOCAL_MODEL" ]; then route_omni "$LOCAL_MODEL" local-only 1 "$@"; fi
      log "defer task=${TASK:-?}: client-data task, no local model configured, subscription limited (reset_at=${reset_at:-0})"
      echo "claude-auto: client-data task deferred until the subscription resets — never on a free provider (exit 75)" >&2; exit 75
    fi
    route_omni "$FREE_MODEL" free-fallback 0 "$@" ;;
  *) echo "claude-auto: unknown mode '$mode' in $ROUTE" >&2; exit 78 ;;
esac
