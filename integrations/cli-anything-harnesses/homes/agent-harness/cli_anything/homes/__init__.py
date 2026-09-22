"""cli-anything-homes — read-only homes.com recipes over the DOMShell browser harness.

This package adds site-specific *read recipes* on top of ``cli-anything-browser``.
It imports that harness's ``fs`` and ``page`` layers and never re-implements DOMShell.

By construction it has no ``act`` group: ``act click`` and ``act type`` are the entire
write surface of the browser harness and are not imported, wrapped or re-exported here.
"""

__version__ = "0.1.0"

SITE = "homes"
SITE_TITLE = "homes.com"
CLI_NAME = "cli-anything-homes"
