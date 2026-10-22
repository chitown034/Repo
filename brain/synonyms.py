"""A small, hand-written synonym map.

Each group is a set of words that a question and a document use
interchangeably in *this* brain. Groups are symmetric: any member expands to
the others at a reduced weight (see recall.SYNONYM_WEIGHT). Keep it short and
generic -- a synonym that only exists to pass one benchmark question is
overfitting, and it belongs nowhere.
"""

GROUPS = [
    # identity / licensing
    ["license", "licence", "licensed", "licensing", "credential", "credentials"],
    ["nmls", "mlo"],
    ["graduate", "graduation", "degree"],
    ["school", "usc", "course", "class", "classroom"],
    ["nonprofit", "501c3", "charity", "foundation"],
    # people / seats
    ["seat", "agent", "persona", "role"],
    ["own", "owner", "ownership", "responsible", "accountable"],
    ["model", "tier", "tiering"],
    ["parallel", "concurrent", "concurrently", "simultaneous"],
    ["subagent", "sub-agent", "sub-agents", "subagents"],
    # systems
    ["crm", "lofty", "zoho"],
    ["backup", "backups", "snapshot"],
    ["schedule", "cron", "scheduled", "runs", "slot"],
    ["task", "tasks", "job", "jobs", "runner"],
    ["routine", "routines", "trigger"],
    ["dashboard", "deck"],
    ["mac", "macbook", "laptop", "machine"],
    ["phone", "imessage", "text", "sms"],
    ["cache", "cached", "ttl"],
    ["stale", "staleness", "frozen", "fresh", "freshness"],
    ["chunk", "chunks", "chunking", "chunked"],
    ["graph", "graphify", "nodes", "edges"],
    ["vector", "embedding", "embeddings", "semantic", "rag"],
    ["vault", "obsidian"],
    ["token", "tokens", "cost"],
    ["error", "fail", "failed", "failing", "broken"],
    ["permission", "access", "grant"],
    ["retired", "retire", "removed", "replaced"],
    ["hours", "hour", "schedule", "window"],
    ["password", "secret", "credential", "key"],
    ["pii", "sensitive", "client"],
    ["lease", "leader", "lock"],
    ["repair", "fix", "fixes", "repaired"],
]
