"""Everything that is specific to the three public-feed categories lives here.

One CLI, one venv, three unrelated groups of public pages — grouped into a
single package (rather than three near-duplicate ones) because the engine
(``core/recipes.py`` / ``core/tree.py`` / ``core/auth.py``) is identical for
all of them: open an allow-listed URL, walk the accessibility tree, extract
fields by prefix/regex. What differs per group is which company's terms of
service govern it, so each group gets its **own** policy gate
(``core/policy.py``) rather than one shared one — clearing the market-pages
question must never quietly enable the builder-pages question too.
"""

SLUG = "publicfeeds"
NAME = "Public real-estate & lender research pages"
CLI_NAME = "cli-anything-publicfeeds"
PATHS_ENV = "CLI_ANYTHING_PUBLICFEEDS_PATHS"

# One group per company-family, each with its OWN CLI_ANYTHING_TOS_REVIEWED_<GROUP>
# gate (core/policy.py). A group stays disabled-by-policy until that exact
# question is answered in writing (Alexandra drafts, Steven decides) — see
# PUBLICFEEDS.md and integrations/CONNECTIONS.md for the full text of each.
POLICY_GROUPS = {
    "marketpages": {
        "title": "Redfin market pages (San Diego County, Temecula, Murrieta)",
        "hosts": ["redfin.com"],
        "writes_into": "ratesSnapshot.markets[]",
        "tos_question": (
            "Does Redfin's Terms of Use permit read-only, low-frequency, "
            "non-cached automated access to /city/ and /county/ housing-market "
            "pages for a single licensed agent's own reference, and does "
            "redfin.com/robots.txt allow-list or disallow those paths for a "
            "generic (non-Googlebot) user agent?"
        ),
    },
    "lenderrates": {
        "title": "Lender-advertised-rate pages (Veterans United, Navy Federal)",
        "hosts": ["veteransunited.com", "navyfederal.org"],
        "writes_into": "ratesSnapshot.rates[]",
        "tos_question": (
            "Do Veterans United's and Navy Federal's website terms permit "
            "automated, read-only retrieval of their publicly posted rate "
            "tables (no account, no quote request submitted), and does each "
            "site's robots.txt allow the specific rate-page path?"
        ),
    },
    "builderpages": {
        "title": "Builder incentive pages (D.R. Horton, Lennar, Richmond American)",
        "hosts": ["drhorton.com", "lennar.com", "richmondamerican.com"],
        "writes_into": "liveFeeds.feeds.builderIncentiveLiveList",
        "tos_question": (
            "Do D.R. Horton's, Lennar's and Richmond American's website terms "
            "permit automated, read-only retrieval of their public community "
            "and promotion pages, and does each site's robots.txt allow the "
            "specific community/promo paths this package reads? (Note: this "
            "overlaps with the Scrapling/Scrapegraph-ai path already scoped for "
            "builder incentives in MAC-INSTALL-comms-data.md §3 — same terms "
            "question, and Steven should pick one tool as the standard rather "
            "than run both against the same pages.)"
        ),
    },
}

# The read surface. Every verb here is open/ls/cat/grep underneath — no `act`.
READ_VERBS = [
    "recipe <name>", "recipe <name> --discover", "recipes", "paths show",
    "paths where", "paths init", "gate status",
]

# Deliberately absent. Nothing in this package writes anywhere — it reads
# published pages only. Listed for the same reason SkySlope's list is: so
# "absent" reads as "decided", not "forgotten".
DISABLED_WRITE_VERBS = [
    {"verb": "act click / act type",
     "blast_radius": "The entire DOMShell write surface. Absent from this harness, not switched off."},
    {"verb": "any form submission (rate-quote request, contact-agent, save-search)",
     "blast_radius": "Would send Steven's (or a client's) information to a third party and cannot be unsent. Never built."},
]
