"""Logged-in / logged-out detection. Fails closed.

A recipe that needs a signed-in session must never return an empty result
that *looks* like success when the page was really a login wall. So:

* If the landed URL contains a login fragment → ``AuthError(state="logged_out")``.
* If the recipe requires auth and no ``logged_in_marker`` is found on the page:
  - a ``logged_out_marker`` present → ``AuthError(state="logged_out")``
  - nothing conclusive       → ``AuthError(state="unknown")``
  Both are errors (exit code 2). "Unknown" says exactly which marker list to
  correct after a ``--discover`` run if Steven *is* signed in.

Nothing here reads a credential. Signing in is done by Steven, in Chrome, by
hand. This harness cannot sign in on his behalf: that would need ``act type``,
which this package does not have.
"""

from __future__ import annotations

from .tree import TreeSource, grep_hits


class AuthError(RuntimeError):
    """Explicit authentication failure. ``state`` is 'logged_out' or 'unknown'."""

    def __init__(self, message: str, state: str = "logged_out", hint: str = "") -> None:
        super().__init__(message)
        self.state = state
        self.hint = hint


def _any_hit(source: TreeSource, patterns: list[str]) -> str:
    for pat in patterns or []:
        if not pat:
            continue
        if grep_hits(source, pat, "/"):
            return pat
    return ""


def check_auth(source: TreeSource, auth_cfg: dict, landed_url: str, required: bool) -> str:
    """Return the auth state string, or raise :class:`AuthError`.

    States returned: ``"not_required"``, ``"logged_in"``.
    """
    auth_cfg = auth_cfg or {}
    url_l = (landed_url or "").lower()
    for frag in auth_cfg.get("login_url_fragments", []) or []:
        if frag and frag.lower() in url_l:
            raise AuthError(
                f"ShowingTime redirected to a sign-in page ({landed_url}). "
                f"Sign in to ShowingTime in Chrome, then re-run.",
                state="logged_out",
                hint="Sign in by hand in the Chrome profile DOMShell drives; this harness never types credentials.",
            )

    if not required:
        return "not_required"

    if _any_hit(source, auth_cfg.get("logged_in_markers", [])):
        return "logged_in"

    out_marker = _any_hit(source, auth_cfg.get("logged_out_markers", []))
    if out_marker:
        raise AuthError(
            f"ShowingTime page shows '{out_marker}' and no signed-in marker — you are signed out. "
            f"Sign in to ShowingTime in Chrome, then re-run.",
            state="logged_out",
            hint="Sign in by hand in the Chrome profile DOMShell drives; this harness never types credentials.",
        )

    raise AuthError(
        "Could not confirm a signed-in ShowingTime session: none of auth.logged_in_markers "
        f"{auth_cfg.get('logged_in_markers', [])} was found on the page. Refusing to return data "
        "that might be a login wall.",
        state="unknown",
        hint="If you ARE signed in, run `recipe <name> --discover`, find the text that only a "
             "signed-in page shows (your name, 'Sign Out', 'My Account'…) and add it to "
             "auth.logged_in_markers in your paths.json copy.",
    )
