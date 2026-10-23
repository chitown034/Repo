"""The second brain's front doors — every live surface, one URL each (2026-10-23).

`bin/brain links` prints them; the 6D Brain embeds them (store nodes become clickable, the Layers readout gets an
"open" per layer); the Notion layer directory repeats them. Stdlib only. Add a surface here and every reader gets it.
"""
from __future__ import annotations

import json
from pathlib import Path

LINKS: list[dict] = [
    {"key": "deck", "label": "Command Deck", "url": "https://claude.ai/artifact/3jbdGMNFkGLEpJiZ3cTmZW", "store": "store:deck", "layer": "deck"},
    {"key": "isa", "label": "ISA Portal", "url": "https://claude.ai/artifact/9Jtqg2W1t98PfhNYHNTMDS", "store": None, "layer": "deck"},
    {"key": "brain6d", "label": "6D Brain", "url": "https://claude.ai/artifact/VoWHW4YuKUCyNqGZMikEv8", "store": None, "layer": "brain6d"},
    {"key": "desk", "label": "Action Desk (what only Steven can do)", "url": "https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn", "store": None, "layer": None},
    {"key": "botcrew", "label": "The Bot Crew", "url": "https://claude.ai/artifact/B8BPDvyE55p8hT7PTyKbjG", "store": "store:vanessa", "layer": None},
    {"key": "repo", "label": "Repo (GitHub, branch claude/stoic-cori-pvn3f8)", "url": "https://github.com/chitown034/Repo/tree/claude/stoic-cori-pvn3f8", "store": None, "layer": "repo"},
    {"key": "drive", "label": "Google Drive · SECOND BRAIN", "url": "https://drive.google.com/drive/folders/16sh0SNlicvHOEpAtTUufI504agSlQRaX", "store": "store:drive", "layer": "drive"},
    {"key": "notebooklm", "label": "NotebookLM (notebook.google.com)", "url": "https://notebook.google.com/", "store": "store:notebooklm", "layer": "notebooklm"},
    {"key": "notion", "label": "Notion · Second Brain database", "url": "https://app.notion.com/p/e767daccebf6434d828b5818414ef495", "store": "store:notion", "layer": "notion"},
    {"key": "notion_dir", "label": "Notion · Second Brain layer directory", "url": "https://app.notion.com/p/402c1760a749811eaea5d07005df0179", "store": None, "layer": "notion"},
    {"key": "fieldy", "label": "Fieldy (recorded meetings)", "url": "https://app.fieldy.ai/", "store": None, "layer": "fieldy"},
    {"key": "routines", "label": "Cloud routines (claude.ai/code)", "url": "https://claude.ai/code/routines", "store": None, "layer": None},
]


def sb_docs(root: Path) -> list[dict]:
    """The 13 SB Google Docs from the Drive manifest, as links."""
    p = root / "integrations" / "notebooklm" / "drive-manifest.json"
    try:
        man = json.loads(p.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return []
    return [{"key": "sb:" + d["file"], "label": d["title"], "url": d["url"], "store": "store:notebooklm", "layer": "drive"} for d in man.get("docs", [])]


def all_links(root: Path) -> list[dict]:
    return LINKS + sb_docs(root)


def for_store(root: Path) -> dict[str, str]:
    """store id -> the one URL the 6D inspector opens."""
    out: dict[str, str] = {}
    for l in LINKS:
        if l["store"] and l["store"] not in out:
            out[l["store"]] = l["url"]
    return out


def for_layer(root: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    for l in LINKS:
        if l["layer"] and l["layer"] not in out:
            out[l["layer"]] = l["url"]
    return out


def format_links(root: Path) -> str:
    rows = all_links(root)
    w = max(len(r["label"]) for r in rows)
    return "\n".join(f"{r['label']:<{w}}  {r['url']}" for r in rows)
