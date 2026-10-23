"""Ingest a claude.ai data export into the brain (2026-10-23).

Steven: "update 2nd brain with all searches and tasks from claude from all search windows, new chats, etc". claude.ai
chats have no API, so the path is his own export (claude.ai → Settings → Privacy → Export data → e-mailed zip →
`conversations.json`). `bin/brain ingest claude-export <conversations.json>` writes `memory/claude-chats.md`: one line per
conversation (date, title, what Steven asked first) and a "tasks Steven mentioned" list pulled from his own messages.
Only Steven's side is kept; assistant text is never copied. Phones/e-mails are masked (export_notebooklm.mask). Stdlib only.
"""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

from .export_notebooklm import mask

TASK_RE = re.compile(r"\b(remind me|to-?do|follow[- ]up|need to|needs to|next step|make sure|don't forget|schedule|set up|setup|fix|connect|build|update|create|install)\b", re.I)
MAX_FIRST = 160


def _msgs(conv: dict) -> list[dict]:
    return conv.get("chat_messages") or conv.get("messages") or []


def _text(m: dict) -> str:
    t = m.get("text")
    if not t and isinstance(m.get("content"), list):
        t = " ".join(c.get("text", "") for c in m["content"] if isinstance(c, dict))
    return (t or "").strip()


def _is_human(m: dict) -> bool:
    return str(m.get("sender") or m.get("role") or "").lower() in ("human", "user")


def digest(export: list[dict], today: date | None = None) -> tuple[str, dict]:
    today = today or date.today()
    convs = sorted(export, key=lambda c: str(c.get("created_at") or ""), reverse=True)
    lines = [f"# Claude chats — digest of Steven's export (ingested {today.isoformat()})", "",
             "One line per claude.ai conversation: when, title, what Steven asked first. Only Steven's own words are kept;",
             "phones and e-mails are masked. Rebuild: `bin/brain ingest claude-export <conversations.json>`. Source: claude.ai →",
             "Settings → Privacy → Export data. These are notes of what was asked, not facts — a fact goes into the wiki or a decision.", "",
             "| Date | Title | First ask | Msgs |", "|---|---|---|---|"]
    tasks: list[str] = []
    masked = 0
    for c in convs:
        human = [_text(m) for m in _msgs(c) if _is_human(m)]
        human = [h for h in human if h]
        first, n = mask(human[0] if human else "")
        masked += n
        first = re.sub(r"\s+", " ", first)[:MAX_FIRST]
        title, n2 = mask((c.get("name") or c.get("title") or "(untitled)").replace("|", "/"))
        masked += n2
        lines.append(f"| {str(c.get('created_at') or '')[:10]} | {title[:90]} | {first.replace('|', '/')} | {len(_msgs(c))} |")
        for h in human:
            for sent in re.split(r"(?<=[.!?])\s+|\n+", h):
                s = sent.strip()
                if 12 <= len(s) <= 220 and TASK_RE.search(s):
                    s2, n3 = mask(s)
                    masked += n3
                    tasks.append(f"- {str(c.get('created_at') or '')[:10]} · {s2}")
    seen: set[str] = set()
    uniq = [t for t in tasks if not (t.lower() in seen or seen.add(t.lower()))]
    lines += ["", f"## Tasks Steven mentioned ({len(uniq)})", ""] + uniq[:400]
    if len(uniq) > 400:
        lines.append(f"- … and {len(uniq) - 400} more")
    return "\n".join(lines) + "\n", {"conversations": len(convs), "tasks": len(uniq), "masked": masked}


def ingest(root: Path, export_path: Path, today: date | None = None) -> dict:
    data = json.loads(export_path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("conversations") or data.get("data") or []
    text, stats = digest(data, today)
    out = root / "memory" / "claude-chats.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    stats["out"] = str(out)
    return stats
