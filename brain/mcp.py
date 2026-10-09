"""``brain mcp`` -- the brain as a stdio MCP server (JSON-RPC 2.0, one message per line).

One recall path for every platform that speaks MCP: Claude Code, Claude Desktop, Codex, Cursor.
Tools: brain_recall, brain_pack, brain_gaps, brain_stale, brain_related, brain_remember. No network, no model call.
Registering this server in a client is a change to that client's MCP config -- Steven approves
it first (his standing rule); nothing here registers itself.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from . import loop, recall, remember

TOOLS = [
    {"name": "brain_recall", "description": "Answer a question from the second brain: one section, with its source. Returns 'not in the brain' rather than guessing.",
     "inputSchema": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}},
    {"name": "brain_pack", "description": "Several best sections under a token budget, for a question that spans pages.",
     "inputSchema": {"type": "object", "properties": {"question": {"type": "string"}, "budget": {"type": "integer"}}, "required": ["question"]}},
    {"name": "brain_gaps", "description": "Questions asked of the brain and not answered, most-asked first.",
     "inputSchema": {"type": "object", "properties": {}}},
    {"name": "brain_stale", "description": "Pages stating live facts whose newest date stamp is older than N days (default 21).",
     "inputSchema": {"type": "object", "properties": {"days": {"type": "integer"}}}},
    {"name": "brain_related", "description": "Pages most related to a page path or a question.",
     "inputSchema": {"type": "object", "properties": {"target": {"type": "string"}}, "required": ["target"]}},
    {"name": "brain_remember", "description": "Store one durable fact. Refuses secrets, account numbers and client PII.",
     "inputSchema": {"type": "object", "properties": {"fact": {"type": "string"}}, "required": ["fact"]}},
]


def _call(root: Path, name: str, a: dict) -> str:
    if name == "brain_recall":
        res = recall.recall(a["question"], root=root)
        loop.log_recall(root, res)
        return recall.format_human(res)
    if name == "brain_pack":
        return loop.format_pack(loop.pack(root, a["question"], budget_tokens=int(a.get("budget") or 900)))
    if name == "brain_gaps":
        return json.dumps(loop.gaps(root), indent=1) or "[]"
    if name == "brain_stale":
        return json.dumps(loop.stale(root, days=int(a.get("days") or 21)), indent=1)
    if name == "brain_related":
        return json.dumps(loop.related(root, a["target"]), indent=1)
    if name == "brain_remember":
        try:
            r = remember.remember(a["fact"], root=root)
        except remember.Refused as e:
            return f"REFUSED: the fact {e}. Nothing was written."
        return f"{'appended to' if r['added'] else 'already in'} {r['file']}"
    raise KeyError(name)


def handle(root: Path, msg: dict) -> dict | None:
    mid, method = msg.get("id"), msg.get("method")
    if mid is None:
        return None  # notification
    if method == "initialize":
        res = {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}},
               "serverInfo": {"name": "second-brain", "version": "1.0"}}
    elif method == "tools/list":
        res = {"tools": TOOLS}
    elif method == "tools/call":
        p = msg.get("params") or {}
        try:
            text, err = _call(root, p.get("name", ""), p.get("arguments") or {}), False
        except KeyError:
            return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32602, "message": f"unknown tool {p.get('name')}"}}
        except Exception as e:  # noqa: BLE001
            text, err = f"error: {e}", True
        res = {"content": [{"type": "text", "text": text}], "isError": err}
    elif method == "ping":
        res = {}
    else:
        return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": f"no method {method}"}}
    return {"jsonrpc": "2.0", "id": mid, "result": res}


def serve(root: Path) -> int:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            out = handle(root, json.loads(line))
        except ValueError:
            out = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "parse error"}}
        if out is not None:
            sys.stdout.write(json.dumps(out) + "\n")
            sys.stdout.flush()
    return 0
