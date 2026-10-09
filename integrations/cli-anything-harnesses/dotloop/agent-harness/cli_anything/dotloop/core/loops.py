"""The read recipes: account, profiles, loops, loop detail, participants, documents, activity.

dotloop Public API v2 (base ``https://api-gateway.dotloop.com/public/v2``, confirmed via the
third-party API profile at github.com/api-evangelist/dotloop, read 2026-09-27 — dotloop's own
docs at dotloop.github.io/public-api/ are egress-blocked from this sandbox, the same restriction
already recorded for Redfin, lender and builder sites in publicfeeds/PUBLICFEEDS.md).

Response envelope shapes are NOT confirmed live — no dotloop credential exists in any environment
this was built in, and dotloop's own docs could not be read directly. Every list recipe therefore
does a best-effort extraction (a bare JSON array, or a ``data`` key that is a list) and always
keeps the untouched body under ``raw`` so nothing is lost if the guess is wrong. The first live
call is the proof, exactly as cli-anything-zoho's README says of its own contract.

Nothing here is a write. No POST, PUT, PATCH or DELETE exists in this package — a test in
``tests/test_core.py`` greps every source file in the package for one, the same check
cli-anything-zoho runs on itself.
"""

from __future__ import annotations

import datetime as _dt
import re
from typing import Callable, Optional

SOURCE = "dotloop Public API v2 via direct REST (cli-anything-dotloop)"
_ID_RE = re.compile(r"^\d{1,20}$")

Getter = Callable[[str, Optional[dict]], dict]


def check_id(name: str, value: str) -> str:
    if not value or not _ID_RE.match(value):
        raise ValueError(f"{name} {value!r} is not a dotloop id (digits only)")
    return value


def _rows(body) -> list:
    """Best-effort row extraction. dotloop's exact list envelope has never been observed live:
    a bare JSON array is used as-is, a ``data`` key holding a list is unwrapped, and anything
    else becomes a single-item list so a caller always gets ``rows`` — the untouched body is
    always available separately as ``raw``."""
    if isinstance(body, list):
        return body
    if isinstance(body, dict):
        data = body.get("data")
        if isinstance(data, list):
            return data
    return [body] if body else []


def account_get(get: Getter) -> dict:
    """GET /account."""
    body = get("account", None)
    return {"recipe": "account get", "account": body, "raw": body}


def list_profiles(get: Getter) -> dict:
    """GET /profile."""
    body = get("profile", None)
    rows = _rows(body)
    return {"recipe": "profile list", "count": len(rows), "rows": rows, "raw": body}


def get_profile(get: Getter, profile_id: str) -> dict:
    """GET /profile/{id}."""
    profile_id = check_id("profile_id", profile_id)
    body = get(f"profile/{profile_id}", None)
    return {"recipe": "profile get", "profileId": profile_id, "profile": body, "raw": body}


def list_loops(get: Getter, profile_id: str, params: Optional[dict] = None) -> dict:
    """GET /profile/{id}/loop. dotloop's own filter/sort/batch query-parameter names are not
    guessed here — the CLI passes them through with ``--param key=value`` exactly as dotloop
    documents them, rather than inventing a field mapping this package cannot verify."""
    profile_id = check_id("profile_id", profile_id)
    body = get(f"profile/{profile_id}/loop", params)
    rows = _rows(body)
    return {"recipe": "loop list", "profileId": profile_id, "count": len(rows), "rows": rows,
            "raw": body}


def get_loop(get: Getter, profile_id: str, loop_id: str) -> dict:
    """GET /profile/{id}/loop/{id}."""
    profile_id = check_id("profile_id", profile_id)
    loop_id = check_id("loop_id", loop_id)
    body = get(f"profile/{profile_id}/loop/{loop_id}", None)
    return {"recipe": "loop get", "profileId": profile_id, "loopId": loop_id, "loop": body,
            "raw": body}


def get_loop_detail(get: Getter, profile_id: str, loop_id: str) -> dict:
    """GET /profile/{id}/loop/{id}/loop-detail."""
    profile_id = check_id("profile_id", profile_id)
    loop_id = check_id("loop_id", loop_id)
    body = get(f"profile/{profile_id}/loop/{loop_id}/loop-detail", None)
    return {"recipe": "loop detail get", "profileId": profile_id, "loopId": loop_id,
            "detail": body, "raw": body}


def list_participants(get: Getter, profile_id: str, loop_id: str) -> dict:
    """GET /profile/{id}/loop/{id}/participant."""
    profile_id = check_id("profile_id", profile_id)
    loop_id = check_id("loop_id", loop_id)
    body = get(f"profile/{profile_id}/loop/{loop_id}/participant", None)
    rows = _rows(body)
    return {"recipe": "participant list", "profileId": profile_id, "loopId": loop_id,
            "count": len(rows), "rows": rows, "raw": body}


def list_documents(get: Getter, profile_id: str, loop_id: str) -> dict:
    """GET /profile/{id}/loop/{id}/document."""
    profile_id = check_id("profile_id", profile_id)
    loop_id = check_id("loop_id", loop_id)
    body = get(f"profile/{profile_id}/loop/{loop_id}/document", None)
    rows = _rows(body)
    return {"recipe": "document list", "profileId": profile_id, "loopId": loop_id,
            "count": len(rows), "rows": rows, "raw": body}


def list_activities(get: Getter, profile_id: str, loop_id: str) -> dict:
    """GET /profile/{id}/loop/{id}/activity."""
    profile_id = check_id("profile_id", profile_id)
    loop_id = check_id("loop_id", loop_id)
    body = get(f"profile/{profile_id}/loop/{loop_id}/activity", None)
    rows = _rows(body)
    return {"recipe": "activity list", "profileId": profile_id, "loopId": loop_id,
            "count": len(rows), "rows": rows, "raw": body}


def selftest(get: Getter) -> dict:
    """The smallest possible call: GET /account. Errors propagate so the CLI can map them onto
    the status vocabulary other sync skills use (ok | blocked | error | not-configured)."""
    body = get("account", None)
    return {"checkedAt": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
            "status": "ok", "httpCode": 200, "error": None, "fix": None, "source": SOURCE,
            "account": body if isinstance(body, dict) else {"raw": body}}
