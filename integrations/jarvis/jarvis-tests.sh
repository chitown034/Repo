#!/usr/bin/env bash
# Offline tests for jarvis-setup.sh and the brain's reading of its status file. No Mac needed.
set -u
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; P=0; F=0
ok() { if [ "$2" = 0 ]; then P=$((P+1)); else F=$((F+1)); echo "FAIL $1"; fi; }
bash -n "$REPO/integrations/jarvis/jarvis-setup.sh"; ok "syntax" $?
python3 -c "import json;json.load(open('$REPO/integrations/jarvis/vanessa-voice-profile.json'))"; ok "profile is json" $?
bash "$REPO/integrations/jarvis/jarvis-setup.sh" --bogus >/dev/null 2>&1; [ $? = 2 ]; ok "bad flag exits 2" $?
OUT="$(bash "$REPO/integrations/jarvis/jarvis-setup.sh" --verify 2>&1)"; RC=$?
if [ "$(uname)" != Darwin ]; then
  [ $RC = 1 ]; ok "non-Mac verify fails" $?
  printf '%s' "$OUT" | grep -q "no status file written"; ok "non-Mac writes no status file" $?
  [ ! -f "$REPO/brain/state/jarvis-status.json" ]; ok "no status file on disk" $?
fi
# brain reads a fresh / stale / missing status
T="$(mktemp -d)"; mkdir -p "$T/brain/state"
chk() { PYTHONPATH="$REPO" python3 - "$T" "$1" <<'PY'
import sys; from pathlib import Path
from brain import loop
print(loop.jarvis_status(Path(sys.argv[1]))["state"])
PY
}
[ "$(chk x)" = unverified ]; ok "missing = unverified" $?
echo "{\"checked\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"ok\":true,\"documents\":1761,\"summary\":\"0 of 6\"}" > "$T/brain/state/jarvis-status.json"
[ "$(chk x)" = ok ]; ok "fresh ok" $?
echo '{"checked":"2020-01-01T00:00:00Z","ok":true}' > "$T/brain/state/jarvis-status.json"
[ "$(chk x)" = stale ]; ok "old = stale" $?
echo '{"checked":"2999-01-01T00:00:00Z","ok":false,"summary":"x"}' > "$T/brain/state/jarvis-status.json"
[ "$(chk x)" = failing ]; ok "not ok = failing" $?
rm -rf "$T"
echo "jarvis-tests: $P passed, $F failed"; [ $F = 0 ]
