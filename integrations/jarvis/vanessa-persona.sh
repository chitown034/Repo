#!/bin/bash
# vanessa-persona.sh - Jarvis speaks and thinks as Vanessa, and knows the Second Brain. Bash 3.2 safe (macOS).
#
#   bash integrations/jarvis/vanessa-persona.sh            dry run: shows what it would write, changes nothing
#   bash integrations/jarvis/vanessa-persona.sh --apply    does it (idempotent; safe to rerun)
#
# --apply writes ONLY: ~/.openjarvis/personas/vanessa/{SOUL,MEMORY,USER}.md (persona from this repo; USER.md is
# context/about-me.md, which holds no client data by design), `persona_name = "vanessa"` in ~/.openjarvis/config.toml
# (backup kept once), a staging copy of the brain in ~/.cache/jarvis-brain WITHOUT wiki/clients, memory/, docs/findings or any
# HTML/JSON, which `jarvis memory index` reads, and the persona + index fields in brain/state/jarvis-status.json (local only).
# It never logs in, never pairs, never reads a client page, never touches the voice clips (jarvis-setup.sh does the voice).
set -u
MODE="${1:---dry-run}"
case "$MODE" in --dry-run|--apply) ;; -h|--help) sed -n 2,11p "$0"; exit 0 ;; *) echo "unknown option $MODE (try --help)" >&2; exit 2 ;; esac
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
JH="${JARVIS_HOME:-$HOME/.openjarvis}"; PERSONA="$JH/personas/vanessa"; CONF="$JH/config.toml"
STAGE="${JARVIS_BRAIN_STAGE:-$HOME/.cache/jarvis-brain}"
STATUS="${JARVIS_STATUS:-$REPO/brain/state/jarvis-status.json}"   # tests point this at a scratch file
JARVIS="${JARVIS_BIN:-}"; [ -n "$JARVIS" ] && [ ! -x "$JARVIS" ] && JARVIS=""   # a pointed-at binary that is not there counts as absent
[ -z "$JARVIS" ] && for c in "$HOME/Applications/OpenJarvis/.venv/bin/jarvis" "$HOME/.local/bin/jarvis" "$(command -v jarvis 2>/dev/null)"; do [ -n "$c" ] && [ -x "$c" ] && { JARVIS="$c"; break; }; done
BAD=0
say() { printf '%s\n' "$*"; }
do_() { if [ "$MODE" = "--apply" ]; then "$@"; else say "  WOULD $*"; fi; }

say "== Vanessa persona for Jarvis ($MODE) =="
# 1. persona files
for f in SOUL.md MEMORY.md; do
  [ -f "$REPO/integrations/jarvis/persona/$f" ] || { say "  FAIL  missing template integrations/jarvis/persona/$f"; BAD=1; }
done
if [ "$MODE" = "--apply" ]; then
  mkdir -p "$PERSONA" && chmod 700 "$JH" "$JH/personas" 2>/dev/null
  cp "$REPO/integrations/jarvis/persona/SOUL.md" "$PERSONA/SOUL.md" && cp "$REPO/integrations/jarvis/persona/MEMORY.md" "$PERSONA/MEMORY.md"
  { printf '# USER — Steven (from context/about-me.md, the one page with no client data)\n\n'; cat "$REPO/context/about-me.md"; } > "$PERSONA/USER.md"
  say "  ok    persona files: $PERSONA/{SOUL,MEMORY,USER}.md"
else say "  WOULD write $PERSONA/{SOUL,MEMORY,USER}.md from integrations/jarvis/persona + context/about-me.md"; fi

# 2. config.toml: [memory_files] persona_name = "vanessa"
if [ "$MODE" = "--apply" ]; then
  mkdir -p "$JH"; [ -f "$CONF" ] && [ ! -f "$CONF.bak-vanessa" ] && cp "$CONF" "$CONF.bak-vanessa"
  if python3 - "$CONF" <<'PY'
import re, sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8") if p.exists() else ""
HEAD = re.compile(r"(?m)^[ \t]*\[[ \t]*memory_files[ \t]*\][ \t]*(#.*)?$")      # the table header, however spaced
m = HEAD.search(s)
if m:
    sec_start = m.end()
    nxt = re.search(r"(?m)^[ \t]*\[", s[sec_start:]); sec_end = sec_start + (nxt.start() if nxt else len(s) - sec_start)
    body = s[sec_start:sec_end]
    if re.search(r"(?m)^[ \t]*persona_name[ \t]*=", body):       # an uncommented key: replace it (a '# persona_name' comment is left alone)
        body = re.sub(r'(?m)^[ \t]*persona_name[ \t]*=.*$', 'persona_name = "vanessa"', body, count=1)
    else:
        body = body.rstrip("\n") + '\npersona_name = "vanessa"\n'
    s = s[:sec_start] + body + s[sec_end:]
else:
    s = s.rstrip("\n") + ('\n\n' if s.strip() else '') + '[memory_files]\npersona_name = "vanessa"\n'
try:
    import tomllib
    d = tomllib.loads(s)
    assert d.get("memory_files", {}).get("persona_name") == "vanessa"
except ModuleNotFoundError:
    pass                                                       # Python < 3.11: no validator; the grep below still checks the line
except Exception as e:                                         # noqa: BLE001 — never write an invalid config
    print(f"config would be invalid TOML, left unchanged: {e}", file=sys.stderr); sys.exit(1)
p.write_text(s, encoding="utf-8")
PY
  then grep -q '^persona_name = "vanessa"' "$CONF" && say "  ok    $CONF: persona_name = \"vanessa\"" || { say "  FAIL  could not set persona_name in $CONF"; BAD=1; }
  else say "  FAIL  $CONF not changed (it would not parse as TOML afterwards)"; BAD=1; fi
else say "  WOULD set persona_name = \"vanessa\" under [memory_files] in $CONF"; fi

# 3. the brain into Jarvis memory, from a staging copy that leaves client data out
stage_brain() {   # plain Python, no rsync: copies only .md pages, never the excluded folders; deletes what is no longer in the repo
  python3 - "$REPO" "$STAGE" <<'PY'
import os, shutil, sys, pathlib
repo, stage = pathlib.Path(sys.argv[1]).resolve(), pathlib.Path(sys.argv[2]).resolve()
home = pathlib.Path.home().resolve()
MARK = stage / ".jarvis-brain-stage"
# only ever prune a folder this script made: never $HOME, never the repo, never a folder without the marker (validator P11-F1)
if stage in (home, repo) or repo in stage.parents or stage in repo.parents:
    print(f"refusing to stage into {stage}", file=sys.stderr); sys.exit(2)
if stage.exists() and any(stage.iterdir()) and not MARK.exists():
    print(f"refusing to prune {stage}: not a staging folder this script made (no .jarvis-brain-stage marker)", file=sys.stderr); sys.exit(2)
stage.mkdir(parents=True, exist_ok=True); MARK.write_text("made by integrations/jarvis/vanessa-persona.sh; safe to delete\n")
EXCLUDE_DIRS = {".git", "node_modules", "memory", "exports", "dashboard", "vector-index", "brain/state", "docs/findings", "docs/data",
                "wiki/clients", "integrations/code-validation"}
keep = {MARK}
for root, dirs, files in os.walk(repo):
    rel = pathlib.Path(root).relative_to(repo)
    dirs[:] = sorted(d for d in dirs if str(rel / d) not in EXCLUDE_DIRS and d not in EXCLUDE_DIRS and not d.startswith("."))
    for f in files:
        if not f.endswith(".md"):
            continue
        src, dst = pathlib.Path(root) / f, stage / rel / f
        keep.add(dst); dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime or dst.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dst)
for old in list(stage.rglob("*")):
    if old.is_file() and old not in keep:
        old.unlink()
for d in sorted((d for d in stage.rglob("*") if d.is_dir()), key=lambda d: -len(str(d))):
    if not any(d.iterdir()):
        d.rmdir()
print(len(keep))
PY
}
if [ "$MODE" = "--apply" ]; then
  mkdir -p "$STAGE"
  if N="$(stage_brain)"; then say "  ok    staged $N brain pages in $STAGE (no wiki/clients, memory/, findings)"; else say "  FAIL  staging the brain failed"; BAD=1; N=0; fi
  [ -d "$STAGE/wiki/clients" ] && { say "  FAIL  wiki/clients reached the staging copy - not indexing"; BAD=1; }
  if [ $BAD -eq 0 ] && [ -n "$JARVIS" ]; then
    if "$JARVIS" memory index "$STAGE" >/tmp/vanessa-persona-index.log 2>&1; then say "  ok    jarvis memory index $STAGE"; INDEXED=1
    else say "  FAIL  jarvis memory index failed: $(tail -1 /tmp/vanessa-persona-index.log)"; BAD=1; INDEXED=0; fi
  else [ -z "$JARVIS" ] && say "  WARN  jarvis CLI not found (install OpenJarvis first: connect-all step 6a); persona files are in place for when it is"; INDEXED=0; fi
else say "  WOULD stage the brain's .md pages into $STAGE (excluding wiki/clients, memory/, docs/findings) and run: ${JARVIS:-jarvis} memory index $STAGE"; INDEXED=0; fi

# 4. the status file the brain and the 6D page read (local only, gitignored)
if [ "$MODE" = "--apply" ]; then
  mkdir -p "$(dirname "$STATUS")"
  python3 - "$STATUS" "${N:-0}" "$INDEXED" "$PERSONA" <<'PY'
import json, sys, pathlib, datetime
p = pathlib.Path(sys.argv[1]); d = {}
if p.exists():
    try: d = json.loads(p.read_text(encoding="utf-8"))
    except ValueError: d = {}
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
d.update({"persona": "vanessa", "persona_dir": sys.argv[4], "persona_at": now, "brain_staged_pages": int(sys.argv[2]),
          "brain_indexed": sys.argv[3] == "1", "brain_indexed_at": now if sys.argv[3] == "1" else d.get("brain_indexed_at")})
p.write_text(json.dumps(d, indent=1) + "\n", encoding="utf-8")
PY
  say "  ok    $STATUS updated (persona + brain index fields)"
else say "  WOULD record persona + index fields in $STATUS"; fi
if [ $BAD -ne 0 ]; then say "persona: see FAIL rows"
elif [ "$MODE" = "--apply" ] && [ "${INDEXED:-0}" != 1 ]; then say "persona: files written, NOT indexed (jarvis CLI missing — connect-all step 6a, then rerun)"
else say "persona: done"; fi
exit $BAD
