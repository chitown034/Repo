"""URL allow-list for ``page open`` and every recipe URL.

The browser harness already blocks dangerous schemes; this adds the per-target
host allow-list from the connectors spec: ``page open`` is allowed but
URL-allow-listed per target, because a crafted URL can itself perform an action
on some sites. The list is code (``core/target.py``), not configuration.
"""

from __future__ import annotations

from urllib.parse import urlparse

from cli_anything.zipforms.core import target


def validate_target_url(url: str) -> tuple[bool, str]:
    if not url or not isinstance(url, str):
        return False, "URL must be a non-empty string"
    if "\n" in url or "\r" in url:
        return False, "URL must be a single line"
    parsed = urlparse(url.strip())
    if parsed.scheme != "https":
        return False, f"only https URLs are allowed, got scheme {parsed.scheme!r}"
    if parsed.username or parsed.password:
        return False, "URLs with embedded credentials are refused"
    host = (parsed.hostname or "").lower()
    if host not in target.ALLOWED_HOSTS:
        return False, (f"host {host!r} is not on the {target.NAME} allow-list: "
                       f"{', '.join(target.ALLOWED_HOSTS)}")
    return True, ""
