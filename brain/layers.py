"""The second brain's layers — what each holds, how it syncs, how fresh it is (2026-10-23).

`bin/brain layers` prints one row per layer with its last-sync stamp and a verdict; `--write` refreshes
docs/reports/LAYERS.md (the page the 6D Brain, the deck and Vanessa read). Every stamp comes from a file the layer's own
sync writes, never from today's date, so "even" means every layer is inside its own cadence. Stdlib only.
"""
from __future__ import annotations

import json
import re
import subprocess
from datetime import date, datetime, timezone
from pathlib import Path

CADENCE_DAYS = {"repo": 1, "index": 1, "deck": 1, "brain6d": 1, "jarvis": 2, "notion": 7, "drive": 7, "notebooklm": 7,
                "vector": 30, "graph": 30, "fieldy": 1}


def _iso(s: str | None) -> date | None:
    if not s:
        return None
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    return date(int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None


def _git_date(root: Path) -> date | None:
    try:
        out = subprocess.run(["git", "-C", str(root), "log", "-1", "--format=%cI"], capture_output=True, text=True, timeout=10).stdout
        return _iso(out)
    except Exception:  # noqa: BLE001
        return None


def _json(p: Path) -> dict:
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}


def _grep(p: Path, pattern: str) -> str | None:
    try:
        m = re.search(pattern, p.read_text(encoding="utf-8", errors="replace"))
        return m.group(1) if m else None
    except OSError:
        return None


def collect(root: Path, today: date | None = None) -> list[dict]:
    today = today or date.today()
    ix = _json(root / "brain" / "index.json")
    man = _json(root / "integrations" / "notebooklm" / "drive-manifest.json")
    js = _json(root / "brain" / "state" / "jarvis-status.json")
    b6 = root / "dashboard" / "brain-4d.html"
    rows = [
        {"key": "repo", "layer": "Repo (GitHub, both Macs)", "holds": "every page, the router, skills, scripts",
         "sync": "git; Macs pull every 30 min (repo-sync.sh); cloud routines commit daily", "last": _git_date(root)},
        {"key": "index", "layer": "Recall index (bin/brain)", "holds": "INDEX.md + brain/index.json over the tree",
         "sync": "bin/brain reindex (daily rebuild routine; connect-all 6a2)", "last": _iso(ix.get("built") or ix.get("generated") or "")
         or _git_date(root)},
        {"key": "deck", "layer": "Command Deck DB", "holds": "live docs: queue, briefs, desks, lists, statuses",
         "sync": "routines + Mac tasks write; page reads live", "last": max((_iso(d) for d in re.findall(r"## Status \((\d{4}-\d{2}-\d{2})\)", (root / "projects" / "command-deck.md").read_text(encoding="utf-8", errors="replace") if (root / "projects" / "command-deck.md").exists() else "")), default=None)},
        {"key": "brain6d", "layer": "6D Brain page", "holds": "every node (pages, stores, tools, pods) and links",
         "sync": "daily 3:30 AM PT rebuild + merge-live publish", "last": _iso(_grep(b6, r'"generated":\s*"(\d{4}-\d{2}-\d{2})"') or "")},
        {"key": "jarvis", "layer": "Jarvis (Mac, local)", "holds": "vault index + voice; recall level 5",
         "sync": "openjarvis runner task; jarvis-setup.sh writes the status file", "last": _iso(js.get("checked"))},
        {"key": "notion", "layer": "Notion Second Brain DB", "holds": "decisions, references, the layer directory",
         "sync": "brain-learn-daily rows; export mirrored to Drive; directory page refreshed by the weekly sync",
         "last": max(filter(None, [_iso(((man.get("last_sync") or {}).get("notion_directory") or {}).get("date")),
                                   _iso(_grep(root / "references" / "drive-second-brain-notes.md", r"synced (\d{4}-\d{2}-\d{2})") or "")]), default=None)},
        {"key": "drive", "layer": "Google Drive SECOND BRAIN/", "holds": "13 SB Google Docs (the brain, masked) + Steven's own folders",
         "sync": "weekly Sunday 2:45 PM PT task rewrites changed Docs", "last": _iso((man.get("last_sync") or {}).get("date") or man.get("created"))},
        {"key": "notebooklm", "layer": "NotebookLM notebooks", "holds": "the same 13 Docs as sources; source-grounded Q&A",
         "sync": "Google auto-syncs Drive Docs after the weekly rewrite", "last": _iso((man.get("last_sync") or {}).get("date") or man.get("created"))},
        {"key": "fieldy", "layer": "Fieldy meetings (recorded conversations)", "holds": "daily digest of recorded meetings: title, first names, summary, action items",
         "sync": "Fieldy → brain task, 6:50 AM PT, through the Fieldy connector; fieldyDesk doc on the deck",
         "last": max(filter(None, [_iso(_grep(root / "memory" / "fieldy-meetings.md", r"(?m)^## (\d{4}-\d{2}-\d{2})") or ""),
                                   _iso(_grep(root / "memory" / "fieldy-meetings.md", r"(?m)^Last checked: (\d{4}-\d{2}-\d{2})") or "")]), default=None)},
        {"key": "vector", "layer": "Vector index", "holds": "high-volume corpora (transcripts, disclosures)",
         "sync": "spec only until a corpus is loaded (vector-index/README.md)", "last": None},
        {"key": "graph", "layer": "Knowledge graph", "holds": "entities and relationships", "sync": "spec only (knowledge-graph/README.md)", "last": None},
    ]
    from . import links as links_mod
    layer_url = links_mod.for_layer(root)
    for r in rows:
        r["url"] = layer_url.get(r["key"])
        cad = CADENCE_DAYS[r["key"]]
        r["cadence_days"] = cad
        if r["last"] is None:
            r["age_days"], r["verdict"] = None, "unverified" if r["key"] in ("jarvis",) else "spec only" if r["key"] in ("vector", "graph") else "no recordings yet" if r["key"] == "fieldy" else "unverified"
        else:
            age = (today - r["last"]).days
            r["age_days"] = age
            r["verdict"] = "fresh" if age <= cad * 1.5 + 0.5 else "stale"
        r["last"] = r["last"].isoformat() if r["last"] else None
    return rows


def format_rows(rows: list[dict]) -> str:
    out = [f"{'layer':<28} {'last':<11} {'age':>4} {'cadence':>8}  verdict"]
    for r in rows:
        out.append(f"{r['layer'][:28]:<28} {r['last'] or '—':<11} {str(r['age_days']) if r['age_days'] is not None else '—':>4} {str(r['cadence_days'])+'d':>8}  {r['verdict']}")
    bad = [r for r in rows if r["verdict"] == "stale"]
    out.append(f"even: {'yes' if not bad else 'no — ' + ', '.join(r['layer'] for r in bad)}")
    return "\n".join(out)


def write(root: Path, today: date | None = None) -> Path:
    today = today or date.today()
    rows = collect(root, today)
    p = root / "docs" / "reports" / "LAYERS.md"
    lines = [f"# Second Brain layers — freshness report ({today.isoformat()})", "",
             "One row per layer of the second brain: what it holds, how it syncs, the date its own sync last stamped, and whether it is",
             "inside its cadence. `bin/brain layers` prints this; `bin/brain layers --write` rewrites it. Rules: `wiki/ai-team/second-brain-layers.md`.",
             "", "| Layer | Holds | Sync | Last | Age | Cadence | Verdict |", "|---|---|---|---|---|---|---|"]
    for r in rows:
        lines.append(f"| {r['layer']} | {r['holds']} | {r['sync']} | {r['last'] or '—'} | {r['age_days'] if r['age_days'] is not None else '—'} | {r['cadence_days']} d | **{r['verdict']}** |")
    bad = [r["layer"] for r in rows if r["verdict"] == "stale"]
    lines += ["", f"**Even:** {'yes — every stamped layer is inside its cadence.' if not bad else 'no — stale: ' + ', '.join(bad) + '.'}",
              f"Generated {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}."]
    p.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return p
