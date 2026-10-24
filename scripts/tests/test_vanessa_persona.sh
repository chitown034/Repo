#!/bin/bash
# tests for integrations/jarvis/vanessa-persona.sh against a throwaway home and a fake jarvis binary.
set -u
cd "$(dirname "$0")/../.." || exit 1
pass=0; fail=0; ok() { pass=$((pass+1)); }; bad() { fail=$((fail+1)); echo "FAIL: $*"; }
T=$(mktemp -d); mkdir -p "$T/bin" "$T/oj"
printf '#!/bin/bash\necho "jarvis $*" >> %s/calls\n' "$T" > "$T/bin/jarvis"; chmod +x "$T/bin/jarvis"
printf '[agent]\nmax_turns = 10\n\n[memory_files]\nsoul_path = "~/.openjarvis/SOUL.md"\npersona_name = ""\n\n[intelligence]\ntemperature = 0.7\n' > "$T/oj/config.toml"
export HOME="$T" JARVIS_HOME="$T/oj" JARVIS_BIN="$T/bin/jarvis" JARVIS_BRAIN_STAGE="$T/stage" JARVIS_STATUS="$T/status.json"
trap 'rm -rf "$T"' EXIT   # the real $JARVIS_STATUS is never touched: the script writes $JARVIS_STATUS
# dry run changes nothing
bash integrations/jarvis/vanessa-persona.sh >/dev/null 2>&1; [ -e "$T/oj/personas" ] && bad "dry run wrote persona files" || ok
grep -q 'persona_name = ""' "$T/oj/config.toml" && ok || bad "dry run edited config"
# apply
bash integrations/jarvis/vanessa-persona.sh --apply > "$T/out" 2>&1; rc=$?
[ $rc -eq 0 ] && ok || { bad "apply exit $rc"; cat "$T/out"; }
for f in SOUL.md MEMORY.md USER.md; do [ -s "$T/oj/personas/vanessa/$f" ] && ok || bad "$f missing"; done
grep -q "^# SOUL — Vanessa" "$T/oj/personas/vanessa/SOUL.md" && ok || bad "SOUL is not Vanessa's"
grep -q "About Steven" "$T/oj/personas/vanessa/USER.md" && ok || bad "USER.md lacks about-me"
grep -c '^persona_name = "vanessa"' "$T/oj/config.toml" | grep -qx 1 && ok || bad "persona_name not set exactly once"
grep -q '^max_turns = 10' "$T/oj/config.toml" && grep -q '^temperature = 0.7' "$T/oj/config.toml" && ok || bad "other config sections damaged"
[ -f "$T/oj/config.toml.bak-vanessa" ] && ok || bad "no config backup"
grep -q "jarvis memory index $T/stage" "$T/calls" && ok || bad "jarvis memory index not called on the stage"
[ -d "$T/stage/wiki/clients" ] && bad "wiki/clients staged" || ok
[ -d "$T/stage/memory" ] && bad "memory/ staged" || ok
[ -d "$T/stage/docs/findings" ] && bad "docs/findings staged" || ok
find "$T/stage" -type f ! -name '*.md' ! -name '.jarvis-brain-stage' | grep -q . && bad "non-markdown file staged" || ok
[ -f "$T/stage/.jarvis-brain-stage" ] && ok || bad "stage marker missing"
[ -f "$T/stage/CLAUDE.md" ] && [ -f "$T/stage/wiki/ai-team/index.md" ] && ok || bad "router or wiki index not staged"
python3 -c "import json,sys; d=json.load(open('$JARVIS_STATUS')); sys.exit(0 if d.get('persona')=='vanessa' and d.get('brain_indexed') is True and d.get('brain_staged_pages',0)>50 else 1)" && ok || bad "status file not updated"
# the whole AI team is in her memory, once
[ "$(grep -c '^## The AI team' "$T/oj/personas/vanessa/MEMORY.md")" = 1 ] && ok || bad "roster heading missing or duplicated"
want=$(python3 -c "import json;print(len(json.load(open('integrations/agent-os/agents.json'))['agents']))")
got=$(python3 - "$T/oj/personas/vanessa/MEMORY.md" <<'PY'
import json, re, sys
slugs = {a["slug"] for a in json.load(open("integrations/agent-os/agents.json"))["agents"]}
txt = open(sys.argv[1]).read(); print(sum(1 for s in slugs if s in txt))
PY
)
[ "$got" = "$want" ] && ok || bad "roster lists $got of $want seats"
# rerun is idempotent: still one persona_name line, exit 0
bash integrations/jarvis/vanessa-persona.sh --apply >/dev/null 2>&1 && grep -c 'persona_name = "vanessa"' "$T/oj/config.toml" | grep -qx 1 && ok || bad "rerun not idempotent"
# missing jarvis: persona still written, exit 0 with a WARN
rm -rf "$T/oj"; mkdir -p "$T/oj"; JARVIS_BIN=/nonexistent bash integrations/jarvis/vanessa-persona.sh --apply > "$T/out2" 2>&1; rc=$?
[ $rc -eq 0 ] && grep -q "WARN" "$T/out2" && [ -s "$T/oj/personas/vanessa/SOUL.md" ] && ok || bad "missing jarvis should warn, not fail (exit $rc)"
python3 -c "import json,sys; d=json.load(open('$JARVIS_STATUS')); sys.exit(1 if 'checked' in d else 0)" && ok || bad "persona invented a 'checked' stamp"
grep -q "NOT indexed" "$T/out2" && ok || bad "missing jarvis: last line does not say NOT indexed"
# config header variants: indented and spaced headers must not get a second table; result must parse
for hdr in '  [memory_files]' '[ memory_files ]'; do
  rm -rf "$T/oj"; mkdir -p "$T/oj"; printf '[agent]\nmax_turns = 10\n\n%s\nsoul_path = "x"\n# persona_name = "old"\n\n[memory_files.extra]\nk = 1\n' "$hdr" > "$T/oj/config.toml"
  bash integrations/jarvis/vanessa-persona.sh --apply >/dev/null 2>&1
  python3 - "$T/oj/config.toml" <<'PY' && ok || bad "config broken for header '$hdr'"
import sys, tomllib
d = tomllib.loads(open(sys.argv[1]).read()); assert d["memory_files"]["persona_name"] == "vanessa"; assert d["memory_files"]["extra"]["k"] == 1
assert open(sys.argv[1]).read().count("persona_name = \"vanessa\"") == 1
PY
done
# a foreign stage folder (no marker) is never pruned
mkdir -p "$T/foreign"; printf 'keep me\n' > "$T/foreign/notes.txt"
JARVIS_BRAIN_STAGE="$T/foreign" bash integrations/jarvis/vanessa-persona.sh --apply > "$T/out3" 2>&1; rc=$?
[ -f "$T/foreign/notes.txt" ] && [ $rc -ne 0 ] && grep -q "refusing" "$T/out3" && ok || bad "foreign folder was pruned or accepted (rc $rc)"
echo "vanessa-persona tests: $pass passed, $fail failed"; [ $fail -eq 0 ]
