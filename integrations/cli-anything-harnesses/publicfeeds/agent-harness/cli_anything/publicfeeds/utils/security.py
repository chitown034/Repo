"""URL allow-list for the public-feeds harness (one shared allow-list per
package; a recipe additionally checks its own policy_group gate — see policy.py).

``page open`` and every recipe URL must pass BOTH checks, in this order:

1. The browser harness's own ``validate_url`` — scheme rules (no ``file:``,
   ``javascript:``, ``data:`` …), explicit scheme, hostname present. Reused from
   ``cli_anything.browser.utils.security``; not re-implemented here.
2. The per-site host allow-list from ``paths.json`` (``"hosts"``): the URL must be
   ``https`` and its hostname must be one of the listed hosts or a subdomain of one.

Why an allow-list on a read-only tool: on some sites a crafted URL performs an
action on open (unsubscribe links, one-click confirmations, ``?action=`` query
strings). Restricting ``open`` to the target site's own hosts, over https, is the
cheapest way to keep "read-only" true at the navigation layer too.
"""

from __future__ import annotations

from urllib.parse import urlparse

from cli_anything.browser.utils.security import validate_url as _browser_validate_url


class URLRejected(ValueError):
    """Raised when a URL fails the site allow-list. Exit code 4 at the CLI."""


def _normalise_host(host: str) -> str:
    return (host or "").strip().lower().rstrip(".")


def host_allowed(hostname: str, hosts: list[str]) -> bool:
    """True if ``hostname`` equals one of ``hosts`` or is a subdomain of one."""
    h = _normalise_host(hostname)
    if not h:
        return False
    for allowed in hosts or []:
        a = _normalise_host(allowed)
        if not a:
            continue
        if h == a or h.endswith("." + a):
            return True
    return False


def validate_site_url(url: str, hosts: list[str]) -> tuple[bool, str]:
    """Validate ``url`` against the browser harness rules AND the site allow-list.

    Returns ``(True, "")`` when the URL may be opened, otherwise ``(False, reason)``.
    """
    ok, reason = _browser_validate_url(url)
    if not ok:
        return False, reason

    parsed = urlparse(url.strip())
    if parsed.scheme.lower() != "https":
        return False, (
            f"Site allow-list requires https; got scheme '{parsed.scheme}'. "
            f"Allowed hosts: {', '.join(hosts)}"
        )
    if "@" in parsed.netloc:
        # `https://<allowed-host>@evil.example/` parses to hostname evil.example, so the
        # host check alone would catch it; reject the userinfo form outright anyway —
        # it is only ever used to confuse a reader.
        return False, "URLs with userinfo (user@host) are not allowed"
    if not host_allowed(parsed.hostname or "", hosts):
        return False, (
            f"Host '{parsed.hostname}' is not on this package's allow-list "
            f"({', '.join(hosts)}). Edit 'hosts' in paths.json only if the site "
            f"itself moved."
        )
    return True, ""


def require_site_url(url: str, hosts: list[str]) -> str:
    """Return the stripped URL if allowed, else raise :class:`URLRejected`."""
    ok, reason = validate_site_url(url, hosts)
    if not ok:
        raise URLRejected(reason)
    return url.strip()
