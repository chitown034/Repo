"""Store a memory in one step, no model: guard -> append -> reindex.

* default          one dated line appended to ``memory.md`` (``- YYYY-MM-DD — fact``,
                   the format its Entries section already uses; append-only).
* ``--topic NAME`` one dated line appended to ``memory/NAME.md`` (created with
                   an H1 and a one-sentence description so it indexes cleanly).

Either way ``INDEX.md`` and ``brain/index.json`` are rebuilt in the same call,
so the catalogue cannot drift from the files.

Before anything is written the fact goes through ``guard()``. CLAUDE.md's HALT
list and memory.md's own table say credentials, account numbers and client
PII go *nowhere* in this repo; anything that looks like one is refused with a
non-zero exit and nothing is written.
"""

from __future__ import annotations

import re
from datetime import date
from pathlib import Path

from . import indexer

MEMORY_MD = "memory.md"
MEMORY_DIR = "memory"
MEMORY_CAP_LINES = 100


class Refused(ValueError):
    """The fact looks like a secret or PII; nothing was written."""


# ------------------------------------------------------------------ guard

_SECRET_PATTERNS = [
    ("an OpenAI/Anthropic-style API key", re.compile(r"\bsk-(?:ant-|proj-|live-|test-)?[A-Za-z0-9_\-]{16,}")),
    ("a GitHub token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}")),
    ("a Slack token", re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}")),
    ("an AWS access key id", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("a Google API key", re.compile(r"\bAIza[0-9A-Za-z_\-]{30,}")),
    ("a Stripe key", re.compile(r"\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}")),
    ("a JSON web token", re.compile(r"\beyJ[A-Za-z0-9_\-]{8,}\.eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}")),
    ("a private key block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("a bearer token", re.compile(r"\bbearer\s+[A-Za-z0-9_\-.=]{20,}", re.I)),
    ("a credential assignment (password=/token=/api_key=)", re.compile(
        r"\b(?:pass(?:word|wd|code)?|pwd|secret|api[_\- ]?key|access[_\- ]?token|auth[_\- ]?token|"
        r"client[_\- ]?secret|token)\s*[:=]\s*\S{4,}", re.I)),
    ("a password", re.compile(r"\b(?:password|passcode)\s+(?:is|was)\s+\S{4,}|\bpin\s+(?:is|was)\s+\d{4,}", re.I)),
    ("a URL with embedded credentials", re.compile(r"[a-z][a-z0-9+.-]*://[^/\s:@]+:[^/\s@]+@", re.I)),
    ("a URL carrying a token", re.compile(r"[?&](?:token|key|api_key|access_token|sig|signature)=[^&\s]{8,}", re.I)),
]
_SSN = re.compile(r"(?<![\d-])(?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}(?![\d-])")
_SSN_WORDED = re.compile(r"\b(?:ssn|social security)\b\D{0,20}\d{9}\b", re.I)
_CARD = re.compile(r"(?<![\d-])(?:\d[ -]?){12,18}\d(?![\d-])")
_ACCOUNT = re.compile(r"\b(?:account|acct|a/c|iban|routing|aba|member(?:ship)?|loan)\s*(?:number|no\.?|#|num)?\s*[:#]?\s*"
                      r"(?-i:[A-Z]{0,4})\d[\d ]{4,}\d\b", re.I)
_NINE = re.compile(r"(?<![\d-])\d{9}(?![\d-])")
_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_PHONE = re.compile(r"(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}(?!\d)")
_HEX = re.compile(r"\b[0-9a-fA-F]{32,}\b")
_B64 = re.compile(r"[A-Za-z0-9+/_\-]{32,}={0,2}")


def _luhn(digits: str) -> bool:
    total, alt = 0, False
    for ch in reversed(digits):
        d = int(ch)
        if alt:
            d *= 2
            if d > 9:
                d -= 9
        total += d
        alt = not alt
    return total % 10 == 0


def _aba(d: str) -> bool:
    w = [3, 7, 1] * 3
    return len(d) == 9 and sum(int(c) * k for c, k in zip(d, w)) % 10 == 0


def _looks_random(s: str) -> bool:
    """A long token that flips between lower/upper/digit often is a key, not a word."""
    s = s.rstrip("=")
    if not s:
        return False
    if "-" in s and all(len(p) < 20 for p in s.split("-")):
        return False                    # hyphenated words / uuids-in-prose are not blobs
    kinds = ["l" if c.islower() else "u" if c.isupper() else "d" if c.isdigit() else "o" for c in s]
    if len(set(kinds) - {"o"}) < 2:
        return False
    flips = sum(1 for a, b in zip(kinds, kinds[1:]) if a != b)
    return flips / len(s) >= 0.25


def guard(fact: str) -> None:
    """Raise Refused if the fact looks like a secret, a credential or PII."""
    for why, pat in _SECRET_PATTERNS:
        if pat.search(fact):
            raise Refused(f"looks like {why}")
    if _HEX.search(fact):
        raise Refused("looks like a secret (a long hex string)")
    for m in _B64.finditer(fact):
        blob = m.group(0)
        segs = blob.split("/")
        if any(len(seg) >= 32 and _looks_random(seg) for seg in segs):
            raise Refused("looks like a secret (a long random token / base64 blob)")
        # base64 with slashes: long, flips a lot, and no plain-word path segment
        if (len(segs) > 1 and len(blob) >= 40 and _looks_random(blob.replace("/", ""))
                and not any(re.fullmatch(r"[a-z][a-z\-]{2,}", seg) for seg in segs)):
            raise Refused("looks like a secret (a long random token / base64 blob)")
    if _SSN.search(fact) or _SSN_WORDED.search(fact):
        raise Refused("looks like a Social Security number")
    for m in _CARD.finditer(fact):
        digits = re.sub(r"\D", "", m.group(0))
        if 13 <= len(digits) <= 19 and _luhn(digits):
            raise Refused("looks like a payment card number (passes the Luhn check)")
    if _ACCOUNT.search(fact):
        raise Refused("looks like an account, routing, member or loan number")
    for m in _NINE.finditer(fact):
        if _aba(m.group(0)) and re.search(r"\b(?:bank|routing|aba|wire|ach|deposit)\b", fact, re.I):
            raise Refused("looks like a bank routing number")
    if _EMAIL.search(fact) and _PHONE.search(fact):
        raise Refused("carries an email address and a phone number together (third-party contact details)")


# ------------------------------------------------------------------ write

def _slug(topic: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", topic.strip().lower()).strip("-")
    if not s or len(s) > 60:
        raise ValueError("topic must be 1-60 letters, digits or hyphens")
    return s


def _one_line(fact: str) -> str:
    fact = re.sub(r"\s+", " ", fact).strip()
    if not fact:
        raise ValueError("empty fact")
    if len(fact) > 1200:
        raise ValueError("one line per memory: over 1,200 characters is a wiki page, not a memory")
    return fact


def _append_line(path: Path, line: str) -> bool:
    """Append ``line``; False (and no write) if an identical line is already there."""
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    if any(l.strip() == line.strip() for l in text.splitlines()):
        return False
    with path.open("a", encoding="utf-8") as fh:
        if text and not text.endswith("\n"):
            fh.write("\n")
        fh.write(line + "\n")
    return True


def remember(fact: str, topic: str | None = None, source: str | None = None,
             root: Path | str | None = None, today: date | None = None) -> dict:
    """Guard, append, reindex. Returns {file, line, added, warnings, indexed}."""
    root = Path(root) if root else indexer.repo_root()
    fact = _one_line(fact)
    guard(fact)
    if source:
        source = _one_line(source)
        guard(source)
    day = (today or date.today()).isoformat()
    line = f"- {day} — {fact}" + (f" (source: {source})" if source else "")
    warnings = []
    if topic:
        slug = _slug(topic)
        rel = f"{MEMORY_DIR}/{slug}.md"
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            path.write_text(
                f"# Memory — {topic.strip()}\n\n"
                f"Dated facts about {topic.strip()}, one line each, appended by `bin/brain remember --topic {slug}`.\n"
                "Append-only: a superseded line gets a new line that says so.\n\n"
                "## Entries\n\n", encoding="utf-8")
    else:
        rel = MEMORY_MD
        path = root / rel
        if not path.exists():
            raise FileNotFoundError(f"{rel} is missing — refusing to invent a new memory store")
    added = _append_line(path, line)
    n_lines = len(path.read_text(encoding="utf-8").splitlines())
    if rel == MEMORY_MD and n_lines > MEMORY_CAP_LINES:
        warnings.append(f"memory.md is {n_lines} lines, over its {MEMORY_CAP_LINES}-line cap — "
                        "brain-weekly-verify should promote durable lines to the wiki and prune")
    index = indexer.write(root)
    return {"file": rel, "line": line, "added": added, "warnings": warnings,
            "indexed": index["files_indexed"]}
