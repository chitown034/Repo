"""cli-anything-dotloop — GET-only REST harness for the dotloop Public API v2.

Read recipes only. No POST, PUT, PATCH or DELETE exists anywhere in this package; a test greps
for them. Both OAuth exchanges (the one-time authorization-code consent, the repeatable
refresh-token grant) are therefore NOT done here — they happen in ``../../tools/`` outside the
pip package, and the CLI only ever receives a short-lived token through
``DOTLOOP_ACCESS_TOKEN``, never stored.

Nothing here has ever touched a live dotloop account. Base URL, the OAuth 2.0 endpoints and the
Bearer-token scheme are as documented in the third-party API profile at
github.com/api-evangelist/dotloop (read 2026-09-27); dotloop's own docs
(dotloop.github.io/public-api/) are egress-blocked from this sandbox, the same restriction
recorded against Redfin/lender/builder sites in publicfeeds/PUBLICFEEDS.md.
"""

__version__ = "0.1.0"
