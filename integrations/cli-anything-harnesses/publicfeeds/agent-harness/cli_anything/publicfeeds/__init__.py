"""cli-anything-publicfeeds — read-only recipes for the public research pages
the Command Deck depends on that have no Composio toolkit and no usable API:
builder-incentive pages, lender-advertised-rate pages and Redfin market pages.

This package adds site-specific *read recipes* on top of ``cli-anything-browser``,
the same way ``cli-anything-homes`` does. It imports that harness's ``fs`` and
``page`` layers and never re-implements DOMShell.

By construction it has no ``act`` group: ``act click`` and ``act type`` are the
entire write surface of the browser harness and are not imported, wrapped or
re-exported here.

Unlike homes/showingtime/showami, every recipe here also sits behind a
per-category **policy gate** (``core/policy.py`` + ``core/target.py``): it
refuses to touch the live site until Steven records that this category's
terms-of-service and robots.txt question has been reviewed. See
PUBLICFEEDS.md for the three open questions.
"""

__version__ = "0.1.0"

SITE = "publicfeeds"
SITE_TITLE = "public real-estate & lender research pages"
CLI_NAME = "cli-anything-publicfeeds"
