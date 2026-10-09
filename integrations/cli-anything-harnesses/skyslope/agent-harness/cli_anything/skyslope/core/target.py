"""Everything that is specific to SkySlope lives here.

The engine modules (policy, paths, recipes, discover) read these constants and
are otherwise identical to the zipForms harness. Change a fact about the
target here, not in the engine.
"""

SLUG = "skyslope"
NAME = "SkySlope"
CLI_NAME = "cli-anything-skyslope"
PATHS_ENV = "CLI_ANYTHING_SKYSLOPE_PATHS"
GATE_FINDING = "F-S1-10"

# Hosts the harness may open. Hard-coded on purpose: paths.json can narrow the
# URLs it uses, it cannot widen this list. Unverified until the first live run.
ALLOWED_HOSTS = ("app.skyslope.com", "skyslope.com", "www.skyslope.com")

# Read recipes and whether each needs a transaction id.
RECIPES = {
    "transactions": {"needs_id": False, "help": "List the transactions visible on the transactions page."},
    "transaction-detail": {"needs_id": True, "help": "Read one transaction's summary page."},
    "document-index": {"needs_id": True, "help": "List the documents attached to a transaction. Names only — never downloads."},
    "checklist-status": {"needs_id": True, "help": "Read the compliance checklist for a transaction."},
}

# The read surface. Every verb here is ls/cat/grep/open underneath.
READ_VERBS = [
    "recipe transactions", "recipe transaction-detail", "recipe document-index",
    "recipe checklist-status", "discover", "fs ls", "fs cat", "fs grep", "fs pwd",
    "page open (allow-listed hosts only)", "page info", "page reload", "page back",
    "page forward", "gate status", "verbs", "paths show", "paths validate",
]

# Deliberately absent. Documentation of what is NOT built and why — each would
# be an `act click` / `act type` underneath, and `act` does not exist here.
DISABLED_WRITE_VERBS = [
    {"verb": "esign send",
     "blast_radius": "Signature request to a client or co-op agent. A licensed act, legally binding, unrecallable once opened. HALT: signature is a licensed decision."},
    {"verb": "document upload",
     "blast_radius": "Alters the transaction file of record. Broker-audit exposure."},
    {"verb": "document delete",
     "blast_radius": "Removes part of the transaction file of record. Broker-audit exposure; may be unrecoverable."},
    {"verb": "document download",
     "blast_radius": "Lands client PII on disk. Allowed only into a path Steven names, never the vector index or the knowledge graph. Absent from this harness; document-index lists names only."},
    {"verb": "checklist item complete",
     "blast_radius": "Falsely marks a compliance item done — the failure nobody notices until an audit."},
    {"verb": "transaction submit / status change",
     "blast_radius": "Routes the file to a human and can start downstream compliance clocks."},
    {"verb": "act click / act type",
     "blast_radius": "The entire DOMShell write surface. Every verb above is one of these underneath. The group is absent from this harness, not switched off."},
]
