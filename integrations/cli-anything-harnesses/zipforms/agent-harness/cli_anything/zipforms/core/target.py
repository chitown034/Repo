"""Everything that is specific to zipForms (Lone Wolf Transactions, zipForm
Edition) lives here. The engine modules (policy, paths, recipes, discover) read
these constants and are otherwise identical to the SkySlope harness.
"""

SLUG = "zipforms"
NAME = "zipForms"
CLI_NAME = "cli-anything-zipforms"
PATHS_ENV = "CLI_ANYTHING_ZIPFORMS_PATHS"
GATE_FINDING = "F-S1-10"

# Hosts the harness may open. Hard-coded on purpose: paths.json can narrow the
# URLs it uses, it cannot widen this list. Both hosts are unverified guesses
# (zipForm Plus classic, and Lone Wolf Transactions) until the first live run.
ALLOWED_HOSTS = ("www.zipformplus.com", "zipformplus.com", "transactions.lwolf.com")

# Read recipes and whether each needs a form id.
RECIPES = {
    "form-index": {"needs_id": False, "help": "List the forms visible on the forms page. Names only."},
    "form-detail": {"needs_id": True, "help": "Read one form's summary page. Never fills, never sends."},
    "packet-index": {"needs_id": False, "help": "List packets (form bundles). Names only — never sends."},
}

READ_VERBS = [
    "recipe form-index", "recipe form-detail", "recipe packet-index", "discover",
    "fs ls", "fs cat", "fs grep", "fs pwd", "page open (allow-listed hosts only)",
    "page info", "page reload", "page back", "page forward", "gate status", "verbs",
    "paths show", "paths validate",
]

# Deliberately absent. Documentation of what is NOT built and why — each would
# be an `act click` / `act type` underneath, and `act` does not exist here.
DISABLED_WRITE_VERBS = [
    {"verb": "form fill",
     "blast_radius": "Writes contract terms. A wrong price or date in a draft that is later sent is a real-money error."},
    {"verb": "packet send",
     "blast_radius": "Delivers a contract packet to a client or the other side. Client-facing; cannot be unsent."},
    {"verb": "Authentisign / esign send",
     "blast_radius": "Signature request. A licensed decision — HALT — legally binding and unrecallable once opened."},
    {"verb": "form create / clone / delete",
     "blast_radius": "Mutates the forms of record. A deleted or duplicated form in a live transaction is an audit problem."},
    {"verb": "form download",
     "blast_radius": "Lands client PII on disk. Allowed only into a path Steven names, never the vector index or the knowledge graph. Absent; form-detail reads on-screen text only."},
    {"verb": "act click / act type",
     "blast_radius": "The entire DOMShell write surface. Every verb above is one of these underneath. The group is absent from this harness, not switched off."},
]
