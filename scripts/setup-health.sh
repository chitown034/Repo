#!/usr/bin/env bash
# setup-health.sh — one command that runs every offline check in the repo and says what is green, what is red,
# and what only Steven can finish. Plain bash + python3 + node; no network, no model calls, no secrets.
#   bash scripts/setup-health.sh [--quick] [--write]     --quick skips the slow failover suites; --write saves docs/reports/SETUP-HEALTH.md
set -u
cd "$(dirname "$0")/.." || exit 2
QUICK=0; WRITE=0; for a in "$@"; do case "$a" in --quick) QUICK=1 ;; --write) WRITE=1 ;; esac; done
PASS=0; FAIL=0; ROWS=""
run() { # name command...
  _n="$1"; shift; _o=$(mktemp); _t0=$(date +%s)
  if "$@" >"$_o" 2>&1; then _s=PASS; PASS=$((PASS+1)); else _s=FAIL; FAIL=$((FAIL+1)); fi
  _d=$(( $(date +%s) - _t0 )); _l=$(grep -E "^(Ran [0-9]+ tests|pass [0-9]+|RESULT|doctor:|SELFTEST RESULT|lint-ps1|ok )" "$_o" | tail -1 | cut -c1-70)
  ROWS="$ROWS| $_n | $_s | ${_d}s | ${_l:-} |\n"; printf '  %-4s %-34s %3ss  %s\n' "$_s" "$_n" "$_d" "${_l:-}"
  [ "$_s" = FAIL ] && { echo "       --- last lines:"; tail -5 "$_o" | sed 's/^/       /'; }
  rm -f "$_o"
}
echo "Setup health ($(date -u +%FT%TZ))"
run "brain doctor"                    bin/brain doctor
run "brain unit tests"                python3 -m unittest discover -s brain/tests
run "brain loop (no regression)"      bash -c 'bin/brain loop >/dev/null'
run "scout tests"                     python3 integrations/scout/test_scout.py
run "trading desk tests (paper only)" python3 -m unittest discover -s integrations/trading-desk/tests
run "trading desk selftest"           bash -c 'cd integrations/trading-desk && python3 -m desk selftest'
run "events scout tests"              python3 -m unittest discover -s integrations/events/tests
run "loan pricing tests"              python3 -m unittest discover -s .claude/skills/loan-pricing-agent/tests
run "anydesk link tests"              bash -c 'cd integrations/anydesk && python3 -m unittest test_anydesk_links'
run "kapso fetch tests"                bash -c 'cd integrations/kapso/tests && python3 -m unittest -q test_kapso_fetch'
run "code-validation gate tests"       bash scripts/tests/test-validate-code.sh
run "setup.sh tests"                  bash scripts/tests/test_setup.sh
run "n8n workflow library tests"      bash -c 'cd integrations/n8n/library && python3 -m unittest -q test_n8n_library'
run "alienware script lint"           python3 integrations/alienware/lint-ps1.py integrations/alienware/alienware-setup.ps1
run "alienware docs/secret checks"    bash integrations/alienware/test-alienware-docs.sh
for f in integrations/skill-packs/install-mac.sh integrations/browser-agents/install.sh integrations/omniroute-failover/claude-auto.sh integrations/omniroute-failover/install-failover.sh; do
  run "bash syntax $(basename "$f")" bash -n "$f"
done
if [ $QUICK = 0 ]; then
  run "failover tests (265 checks)"   bash integrations/omniroute-failover/failover-tests.sh
  run "lease tests (156 checks)"      bash integrations/omniroute-failover/lease-tests.sh
fi
run "dashboard: action desk runtime"  node dashboard/tests/runtime-harness.js dashboard/action-desk.html
run "dashboard: ISA portal runtime"   node dashboard/tests/runtime-harness.js dashboard/isa/isa-portal.html
echo; echo "RESULT: $PASS passed, $FAIL failed"
if [ $WRITE = 1 ]; then
  {
    echo "# Setup health"; echo; echo "Run $(date -u +%FT%TZ) by \`bash scripts/setup-health.sh --write\`. Offline checks only: green here means the code and docs hold together, **not** that anything runs on Steven's Macs, the Alienware, or the live dashboards."; echo
    echo "| Check | Result | Time | Last line |"; echo "|---|---|---|---|"; printf '%b' "$ROWS"; echo
    echo "## Only Steven can finish (see docs/STEVEN-STEPS.md, steps 24-32)"; echo
    echo "- Say \"publish the deck\" and approve: the live Command Deck, ISA Portal, Action Desk and 2nd Brain 4D are not yet updated."
    echo "- Run the Mac installers (browser hands, skill packs, failover, mods) and the Alienware PowerShell script; paste back the status lines."
    echo "- Accounts, keys and spend: ARIVE, Zoho API permission, Apify, vidIQ, OpenRouter, AnyDesk passwords, the Ultimate Web Scraper connector. All HALT items."
    echo "- First real run of the events scout (36 sources) and real price data for the trading desk."
  } > docs/reports/SETUP-HEALTH.md
  echo "wrote docs/reports/SETUP-HEALTH.md"
fi
[ "$FAIL" -eq 0 ]
