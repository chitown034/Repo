"""The single seam to the browser harness. Read-only by construction.

This is the only module that imports ``cli_anything.browser``. It exposes
``ls``, ``cat``, ``grep``, allow-listed ``open_url`` and page info/reload/back/
forward — and nothing else. No click, no type, no download, no upload exist
here, so nothing above this module can reach them. Unit tests mock these
functions; the rest of the package does not know DOMShell exists.

``cli-anything-browser`` is not on PyPI. It is vendored in this repo at
``integrations/cli-anything-harnesses/browser/agent-harness`` and installs into
the same venv (``MAC-SETUP.sh`` does this into
``$HOME/Applications/cli-anything-harnesses/.venv``).
"""

from __future__ import annotations

import typing as _t

from cli_anything.skyslope.utils import security as _security

INSTALL_HINT = (
    "cli-anything-browser is not installed in this Python environment. It is not on "
    "PyPI: it is vendored in this repo and installs into the same venv as this harness — "
    "  pip install \"<repo>/integrations/cli-anything-harnesses/browser/agent-harness\"  — "
    "(MAC-SETUP.sh does this into $HOME/Applications/cli-anything-harnesses/.venv)."
)

READ_ONLY_SURFACE = ("is_available", "new_session", "open_url", "ls", "cat", "grep",
                     "page_info", "reload", "back", "forward")
FORBIDDEN_NAMES = ("click", "type_text", "type", "download", "upload", "act", "submit")


def _browser():
    try:
        from cli_anything.browser.core import fs, page, session
        from cli_anything.browser.utils import domshell_backend
    except ImportError as e:  # pragma: no cover - exercised only without the harness
        raise RuntimeError(INSTALL_HINT) from e
    return fs, page, session, domshell_backend


def is_available() -> tuple[bool, str]:
    """(available, message). False with the install hint when the browser harness
    is missing, otherwise DOMShell's own availability check (npx + package)."""
    try:
        _, _, _, domshell = _browser()
    except RuntimeError as e:
        return False, str(e)
    return domshell.is_available()


def new_session() -> _t.Any:
    _, _, session_mod, _ = _browser()
    return session_mod.Session()


def open_url(session: _t.Any, url: str) -> dict:
    ok, msg = _security.validate_target_url(url)
    if not ok:
        return {"error": f"refused: {msg}", "output": ""}
    _, page, _, _ = _browser()
    try:
        return page.open_page(session, url)
    except ValueError as e:
        return {"error": f"refused: {e}", "output": ""}


def ls(session: _t.Any, path: str = "") -> dict:
    fs, _, _, _ = _browser()
    return fs.list_elements(session, path)


def cat(session: _t.Any, path: str = "") -> dict:
    fs, _, _, _ = _browser()
    return fs.read_element(session, path)


def grep(session: _t.Any, pattern: str, path: str = "") -> dict:
    fs, _, _, _ = _browser()
    return fs.grep_elements(session, pattern, path)


def page_info(session: _t.Any) -> dict:
    _, page, _, _ = _browser()
    return page.get_page_info(session)


def reload(session: _t.Any) -> dict:
    _, page, _, _ = _browser()
    return page.reload_page(session)


def back(session: _t.Any) -> dict:
    _, page, _, _ = _browser()
    return page.go_back(session)


def forward(session: _t.Any) -> dict:
    _, page, _, _ = _browser()
    return page.go_forward(session)
