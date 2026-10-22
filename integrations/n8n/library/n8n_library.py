#!/usr/bin/env python3
"""n8n_library.py - a read-only catalog and a gated, inactive importer for a folder of n8n workflow JSON files
(built for Zie619/n8n-workflows, reviewed 94007c1, MIT). Standard library only; never runs a workflow or a server.

  n8n_library.py index  <dir>                       build the index (default dir: ~/Applications/n8n-workflows/workflows)
  n8n_library.py find   <words...> [--service s] [--safe] [--limit n]
  n8n_library.py show   <relpath>                   nodes, trigger, every risk flag, what it can write
  n8n_library.py risks                              counts per risk class across the library
  n8n_library.py stage  <relpath> [--out dir] [--into-n8n] [--i-reviewed]
        writes a COPY with active=false and every credential reference removed; refuses a workflow that has a shell,
        SSH or hard-coded-secret flag unless --i-reviewed; --into-n8n then calls `n8n import:workflow` on loopback.

Risk classes: execute_command, ssh, code, local_file, unauth_webhook, secret_shape, may_write (a node type that can send
a message, write a CRM/Sheet/Drive record or post publicly). --safe hides everything with execute_command, ssh, code,
local_file, secret_shape or unauth_webhook. Nothing here decides a licensed matter or sends to a client: a may_write
workflow is only ever staged inactive, and Steven turns on any write himself."""
import json, os, re, subprocess, sys, shutil
from pathlib import Path

DEFAULT_DIR = Path(os.environ.get("N8N_LIBRARY_DIR", Path.home() / "Applications" / "n8n-workflows" / "workflows"))
INDEX = Path(os.environ.get("N8N_LIBRARY_INDEX", Path.home() / ".cache" / "n8n-library" / "index.json"))
SHELL, SSH = {"executeCommand"}, {"ssh"}
CODE = {"code", "function", "functionItem"}
FILES = {"readWriteFile", "readBinaryFile", "writeBinaryFile", "readBinaryFiles", "extractFromFile", "spreadsheetFile", "moveBinaryData"}
WRITES = {"gmail", "emailSend", "slack", "telegram", "whatsApp", "twilio", "mailchimp", "sendGrid", "mailgun", "zohoCrm", "hubspot",
          "salesforce", "pipedrive", "googleSheets", "googleDrive", "googleCalendar", "notion", "airtable", "twitter", "linkedIn",
          "facebookGraphApi", "discord", "docuSign", "wordpress", "github", "trello", "asana", "stripe"}
SECRET_RE = re.compile(r"(sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{30,}|AIza[0-9A-Za-z_-]{30,}|AKIA[0-9A-Z]{16})")


def short(t):
    return t.split(".")[-1]


def analyse(path, rel):
    try:
        d = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        return None
    nodes = d.get("nodes") if isinstance(d, dict) else None
    if not isinstance(nodes, list):
        return None
    types = [short(n.get("type", "")) for n in nodes if isinstance(n, dict)]
    raw = path.read_text(encoding="utf-8", errors="replace")
    flags = []
    if SHELL & set(types): flags.append("execute_command")
    if SSH & set(types): flags.append("ssh")
    if CODE & set(types): flags.append("code")
    if FILES & set(types): flags.append("local_file")
    for n in nodes:
        if isinstance(n, dict) and short(n.get("type", "")) in ("webhook", "formTrigger", "chatTrigger"):
            auth = (n.get("parameters") or {}).get("authentication", "none")
            if auth in (None, "none", ""):
                flags.append("unauth_webhook"); break
    if SECRET_RE.search(raw): flags.append("secret_shape")
    writes = sorted({t for t in types if t in WRITES})
    if writes: flags.append("may_write")
    trig = next((t for t in types if t.lower().endswith("trigger") or t in ("webhook", "cron", "schedule", "manualTrigger")), "manual")
    return {"path": rel, "name": d.get("name") or Path(rel).stem, "trigger": trig, "services": sorted(set(types) - {"set", "if", "merge", "noOp", "stickyNote", "wait", "splitInBatches", "itemLists", "switch"}),
            "flags": sorted(set(flags)), "writes": writes, "nodes": len(nodes), "tags": [t.get("name", t) if isinstance(t, dict) else t for t in (d.get("tags") or [])][:6]}


def build_index(root):
    root = Path(root)
    items = [a for a in (analyse(p, str(p.relative_to(root))) for p in sorted(root.rglob("*.json"))) if a]
    INDEX.parent.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps({"root": str(root), "items": items}), encoding="utf-8")
    return items


def load():
    if not INDEX.is_file():
        raise SystemExit("no index yet - run: n8n_library.py index <dir>")
    return json.loads(INDEX.read_text(encoding="utf-8"))


UNSAFE = {"execute_command", "ssh", "code", "local_file", "secret_shape", "unauth_webhook"}


def find(words, service=None, safe=False, limit=15):
    idx = load(); ws = [w.lower() for w in words]; out = []
    for it in idx["items"]:
        hay = " ".join([it["name"], it["path"], " ".join(it["services"]), " ".join(map(str, it["tags"]))]).lower()
        if ws and not all(w in hay for w in ws): continue
        if service and service.lower() not in [s.lower() for s in it["services"]]: continue
        if safe and UNSAFE & set(it["flags"]): continue
        out.append(it)
    return out[:limit], len(out)


def stage(rel, out_dir, into_n8n=False, reviewed=False):
    idx = load(); root = Path(idx["root"]); src = root / rel
    it = next((i for i in idx["items"] if i["path"] == rel), None)
    if not it or not src.is_file():
        raise SystemExit("not in the index: " + rel)
    hard = {"execute_command", "ssh", "secret_shape"} & set(it["flags"])
    if hard and not reviewed:
        raise SystemExit("REFUSED: %s has %s. Read the file yourself first, then rerun with --i-reviewed." % (rel, ", ".join(sorted(hard))))
    d = json.loads(src.read_text(encoding="utf-8"))
    d["active"] = False
    for n in d.get("nodes", []):
        if isinstance(n, dict) and "credentials" in n:
            n.pop("credentials")
    d["name"] = "[STAGED inactive] " + str(d.get("name", Path(rel).stem))[:80]
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    dst = out / (re.sub(r"[^A-Za-z0-9._-]", "_", Path(rel).stem) + ".staged.json")
    dst.write_text(json.dumps(d, indent=1), encoding="utf-8")
    print("staged (inactive, credentials removed):", dst)
    print("flags:", ", ".join(it["flags"]) or "none", "| can write to:", ", ".join(it["writes"]) or "nothing")
    if into_n8n:
        n8n = shutil.which("n8n")
        if not n8n:
            raise SystemExit("n8n CLI not found; import the staged file by hand in n8n (Import from file). It stays inactive.")
        subprocess.run([n8n, "import:workflow", "--input=" + str(dst)], check=True, env={**os.environ, "N8N_HOST": "127.0.0.1", "N8N_LISTEN_ADDRESS": "127.0.0.1"})
        print("imported into your local n8n as INACTIVE. Add your own credentials, test with write nodes disabled, then decide.")
    return dst


def main(argv):
    if not argv: print(__doc__); return 2
    c, a = argv[0], argv[1:]
    if c == "index":
        items = build_index(a[0] if a else DEFAULT_DIR); print("indexed", len(items), "workflows ->", INDEX); return 0
    if c == "find":
        svc = a[a.index("--service") + 1] if "--service" in a else None
        lim = int(a[a.index("--limit") + 1]) if "--limit" in a else 15
        words = [x for i, x in enumerate(a) if not x.startswith("--") and (i == 0 or a[i - 1] not in ("--service", "--limit"))]
        rows, total = find(words, svc, "--safe" in a, lim)
        for r in rows: print("%-72s %-14s flags: %s" % (r["path"][:72], r["trigger"][:14], ",".join(r["flags"]) or "-"))
        print("%d shown of %d matches" % (len(rows), total)); return 0
    if c == "show":
        it = next((i for i in load()["items"] if i["path"] == a[0]), None)
        if not it: print("not in the index"); return 1
        print(json.dumps(it, indent=1)); return 0
    if c == "risks":
        from collections import Counter
        cnt = Counter(f for i in load()["items"] for f in i["flags"]); n = len(load()["items"])
        print("%d workflows" % n)
        for k, v in cnt.most_common(): print("  %-16s %d" % (k, v))
        print("  %-16s %d" % ("no unsafe flag", sum(1 for i in load()["items"] if not UNSAFE & set(i["flags"])))); return 0
    if c == "stage":
        out = a[a.index("--out") + 1] if "--out" in a else str(Path.home() / ".n8n" / "library-staging")
        stage(a[0], out, "--into-n8n" in a, "--i-reviewed" in a); return 0
    print(__doc__); return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
