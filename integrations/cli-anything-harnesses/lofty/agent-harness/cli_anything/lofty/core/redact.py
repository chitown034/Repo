"""Default PII redaction for terminal output.

The deck rules for Lofty (lofty-crm-sync skill) say no phone, email or street
address leaves Lofty. A CLI prints to a terminal an agent may paste anywhere,
so contact fields are redacted by default; ``--full`` shows them.
"""

from __future__ import annotations

PII_KEY_HINTS = ("phone", "email", "address", "street", "ssn", "mobile", "cell", "zip", "fax")
REDACTED = "[redacted]"


def is_pii_key(key: str) -> bool:
    k = str(key).lower()
    return any(h in k for h in PII_KEY_HINTS)


def redact(obj):
    """Recursively replace values under PII-looking keys. Never mutates input."""
    if isinstance(obj, dict):
        return {k: (REDACTED if is_pii_key(k) and v not in (None, "", [], {}) else redact(v))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact(v) for v in obj]
    return obj
