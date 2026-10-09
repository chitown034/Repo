"""Default PII redaction for terminal output.

A dotloop loop's participants carry name, email and phone by design — that is the whole point of
a transaction-management record, and a loop's own address fields are the property address, not
incidental. A CLI prints to a terminal an agent may paste anywhere, so contact-looking fields are
redacted by default; ``--full`` shows them. Same hint list and same behaviour as
cli-anything-zoho's ``redact.py``, kept identical on purpose so every harness in this repo redacts
the same way.
"""

from __future__ import annotations

PII_KEY_HINTS = ("email", "phone", "mobile", "street", "fax", "zip", "ssn", "address")
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
