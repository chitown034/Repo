"""The one seam between recipes and the page: a ``TreeSource``.

Recipes never talk to DOMShell directly. They call four read operations on a
source object — ``open``, ``ls``, ``cat``, ``grep`` — and two sources implement
them:

* :class:`LiveTree` — wraps the browser harness's ``Session`` and its ``fs`` /
  ``page`` modules (``cli_anything.browser.core``). This is the only path that
  reaches Chrome, and it reaches it through the browser harness, never through
  a re-implementation of the DOMShell protocol.
* :class:`FixtureTree` — a synthetic accessibility tree loaded from JSON. Used
  by the offline tests and by nothing else.

Neither source exposes ``click`` or ``type``. The browser harness's
``domshell_backend.click`` / ``type_text`` are never imported by this package.

DOMShell's ``ls`` output format is only loosely known (the upstream harness's
own parser keeps "every line as the name"), so :func:`parse_entry` accepts the
three shapes seen in the upstream test-suite: ``button[0]``, ``name [role]``
and an indented tree. When only one indentation level is present all lines are
direct children; when several are present only the shallowest are.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Optional, Protocol

from cli_anything.browser.core import fs as _fs
from cli_anything.browser.core import page as _page
from cli_anything.browser.core.session import Session
from cli_anything.browser.utils import domshell_backend as _backend
from cli_anything.browser.utils.security import sanitize_dom_text

from cli_anything.publicfeeds.utils.security import require_site_url

MAX_TEXT = 2000  # hard cap on any single text value a recipe stores


class TreeError(RuntimeError):
    """A read operation failed at the DOMShell layer (e.g. no such directory)."""


class TreeSource(Protocol):
    current_url: str

    def open(self, url: str) -> dict: ...
    def ls(self, path: str) -> dict: ...
    def cat(self, path: str) -> dict: ...
    def grep(self, pattern: str, path: str = "/") -> dict: ...


# ── entry parsing ──────────────────────────────────────────────────────

_ROLE_RE = re.compile(r"\[([^\]]+)\]")


def parse_entry(line: str) -> dict:
    """Parse one ``ls`` line into ``{name, role, label, is_dir, indent, raw}``.

    ``name`` is the first whitespace-delimited token with a trailing ``/``
    removed — it is what gets joined onto the parent path. Everything else is
    best-effort decoration for humans and for ``--discover``.
    """
    raw = line.rstrip()
    indent = len(raw) - len(raw.lstrip())
    s = raw.strip()
    if not s:
        return {"name": "", "role": "", "label": "", "is_dir": False, "indent": indent, "raw": raw}
    token, _, rest = s.partition(" ")
    is_dir = token.endswith("/")
    name = token.rstrip("/")
    role = ""
    m = _ROLE_RE.search(rest)
    if m:
        role = m.group(1).strip().lower()
        rest = (rest[: m.start()] + rest[m.end():]).strip()
    if not role and "[" not in name:
        # `button[0]`-style names carry no role; `heading_1`-style names carry
        # the role as their prefix. Keep the prefix as a hint only.
        prefix = re.split(r"[_\d\[]", name, maxsplit=1)[0]
        role = prefix.lower() if prefix and prefix != name else ""
    label = rest.strip().strip("\"'“”")
    return {"name": name, "role": role, "label": label, "is_dir": is_dir,
            "indent": indent, "raw": raw}


def parse_entries(entries: list[dict]) -> list[dict]:
    """Parse the browser harness's ``entries`` list into direct children only."""
    parsed = [parse_entry(e.get("name", "")) for e in entries]
    parsed = [p for p in parsed if p["name"]]
    if not parsed:
        return []
    min_indent = min(p["indent"] for p in parsed)
    return [p for p in parsed if p["indent"] == min_indent]


def join_path(parent: str, name: str) -> str:
    parent = parent or "/"
    if parent == "/":
        return "/" + name
    return parent.rstrip("/") + "/" + name


def clean_text(text: Any) -> str:
    """Normalise DOM text: strip, cap length, flag prompt-injection patterns."""
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)
    text = text.strip()
    if len(text) > MAX_TEXT:
        text = text[:MAX_TEXT] + "…"
    # Reuses the browser harness's guard: control chars removed, obvious
    # "ignore previous instructions" patterns flagged and truncated. A page's
    # text is untrusted data, never an instruction.
    return sanitize_dom_text(text)


# ── helpers used by recipes ────────────────────────────────────────────

def children(source: TreeSource, path: str) -> list[dict]:
    """Direct children of ``path`` with a ``path`` key added; raises TreeError."""
    result = source.ls(path)
    if not isinstance(result, dict):
        raise TreeError(f"ls {path}: unexpected result {type(result).__name__}")
    if "error" in result:
        raise TreeError(f"ls {path}: {result.get('error')}")
    out = []
    for entry in parse_entries(result.get("entries", [])):
        entry["path"] = join_path(path, entry["name"])
        out.append(entry)
    return out


def text_of(source: TreeSource, path: str) -> str:
    """Text content of the node at ``path`` (empty string on error)."""
    result = source.cat(path)
    if not isinstance(result, dict) or "error" in result:
        return ""
    return clean_text(result.get("output") or result.get("text") or "")


def grep_hits(source: TreeSource, pattern: str, path: str = "/") -> list[str]:
    result = source.grep(pattern, path)
    if not isinstance(result, dict) or "error" in result:
        return []
    return [m for m in result.get("matches", []) if str(m).strip()]


def exists(source: TreeSource, path: str) -> bool:
    try:
        children(source, path)
        return True
    except TreeError:
        return False


# ── live source (the only Chrome-facing code in this package) ─────────

class LiveTree:
    """Reads Steven's logged-in Chrome tab through the browser harness.

    Use as a context manager around a recipe run: it tries to hold one
    persistent DOMShell connection for the run (the browser harness's daemon
    mode, process-local, never exposed as a verb) and releases it on exit. If
    the daemon cannot start the harness falls back to one connection per call,
    which is slower but identical in what it reads.
    """

    def __init__(self, hosts: list[str], use_daemon: bool = True) -> None:
        self.hosts = list(hosts)
        self.session = Session()
        self._want_daemon = use_daemon
        self._daemon_started = False
        self.warnings: list[str] = []

    # -- lifecycle ------------------------------------------------------
    @staticmethod
    def check_available() -> tuple[bool, str]:
        return _backend.is_available()

    def __enter__(self) -> "LiveTree":
        if self._want_daemon:
            try:
                _backend.start_daemon()
                self.session.enable_daemon()
                self._daemon_started = True
            except RuntimeError as e:  # pragma: no cover - needs a live DOMShell
                self.warnings.append(f"persistent connection unavailable, using per-call mode: {e}")
        return self

    def __exit__(self, *exc: Any) -> None:
        if self._daemon_started:
            try:
                _backend.stop_daemon()
            except Exception:  # pragma: no cover - cleanup only
                pass
            self.session.disable_daemon()
            self._daemon_started = False

    # -- TreeSource -----------------------------------------------------
    @property
    def current_url(self) -> str:
        return self.session.current_url

    def open(self, url: str) -> dict:
        url = require_site_url(url, self.hosts)   # allow-list, then browser rules
        result = _page.open_page(self.session, url)
        if isinstance(result, dict) and result.get("url"):
            self.session.set_url(result["url"], record_history=False)
        return result

    def ls(self, path: str) -> dict:
        return _fs.list_elements(self.session, path)

    def cat(self, path: str) -> dict:
        return _fs.read_element(self.session, path)

    def grep(self, pattern: str, path: str = "/") -> dict:
        return _fs.grep_elements(self.session, pattern, path)


# ── fixture source (tests only) ────────────────────────────────────────

class FixtureTree:
    """A synthetic accessibility tree loaded from ``tests/fixtures/*.json``.

    File shape::

        {"url": "https://…", "landed_url": "https://… (optional redirect)",
         "tree": {"name": "/", "children": [{"name": "main", "role": "main",
                  "text": "…", "children": [...]}]},
         "expect": {...}}   # assertions the generic tests read

    ``ls`` renders children as the browser harness would hand them to us
    (``name/`` for nodes with children, ``name [role]`` decoration), so the
    same :func:`parse_entries` code path is exercised offline.
    """

    def __init__(self, data: dict, hosts: Optional[list[str]] = None) -> None:
        self.data = data
        self.root = data.get("tree") or {"name": "/", "children": []}
        self.hosts = list(hosts or [])
        self.current_url = ""
        self.opened: list[str] = []
        self.calls: list[tuple[str, str]] = []

    @classmethod
    def load(cls, path: str | Path, hosts: Optional[list[str]] = None) -> "FixtureTree":
        with open(path, "r", encoding="utf-8") as fh:
            return cls(json.load(fh), hosts=hosts)

    # Same lifecycle surface as LiveTree so the CLI's `with source:` works offline.
    warnings: list[str] = []

    def __enter__(self) -> "FixtureTree":
        return self

    def __exit__(self, *exc: Any) -> None:
        return None

    # -- navigation of the in-memory tree --
    def _find(self, path: str) -> Optional[dict]:
        parts = [p for p in (path or "/").split("/") if p]
        node = self.root
        for part in parts:
            nxt = None
            for child in node.get("children", []) or []:
                if child.get("name") == part:
                    nxt = child
                    break
            if nxt is None:
                return None
            node = nxt
        return node

    # -- TreeSource --
    def open(self, url: str) -> dict:
        if self.hosts:
            url = require_site_url(url, self.hosts)
        self.opened.append(url)
        landed = self.data.get("landed_url") or self.data.get("url") or url
        self.current_url = landed
        return {"output": f"✓ Opened\nURL: {landed}", "url": landed}

    def ls(self, path: str) -> dict:
        self.calls.append(("ls", path))
        node = self._find(path)
        if node is None:
            return {"error": f"ls: {path}: No such directory", "output": ""}
        entries = []
        for child in node.get("children", []) or []:
            name = child.get("name", "")
            if child.get("children"):
                name += "/"
            role = child.get("role")
            line = f"{name} [{role}]" if role else name
            entries.append({"name": line, "role": role or "", "path": line})
        return {"entries": entries, "raw": "\n".join(e["name"] for e in entries)}

    def cat(self, path: str) -> dict:
        self.calls.append(("cat", path))
        node = self._find(path)
        if node is None:
            return {"error": f"cat: {path}: No such element", "output": ""}
        return {"output": node.get("text", "") or ""}

    def grep(self, pattern: str, path: str = "/") -> dict:
        self.calls.append(("grep", f"{path}:{pattern}"))
        node = self._find(path)
        if node is None:
            return {"error": f"cd: {path}: No such directory", "output": ""}
        rx = re.compile(pattern, re.IGNORECASE)
        matches: list[str] = []

        def walk(n: dict, p: str) -> None:
            for child in n.get("children", []) or []:
                cp = join_path(p, child.get("name", ""))
                hay = " ".join(str(child.get(k, "") or "") for k in ("name", "label", "text"))
                if rx.search(hay):
                    matches.append(f"{cp}: {child.get('text', '') or child.get('label', '')}")
                walk(child, cp)

        walk(node, path if path != "/" else "")
        return {"matches": matches, "raw": "\n".join(matches)}
