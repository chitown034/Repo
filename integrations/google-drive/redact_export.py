#!/usr/bin/env python3
"""Screen the Drive "_Second Brain index.md" export before it enters the brain.

    python3 -I integrations/google-drive/redact_export.py <export.json|export.md> <out.md> [--tags-only]

Keeps a row only when NONE of its tags is client-shaped (BLOCK_TAGS) and its text has no
client-shaped wording (BLOCK_WORDS); then masks emails, phone numbers, long digit runs and
street addresses in what is kept. Prints counts only -- never a matched value -- so the
screen itself cannot leak what it removes. Steven approved indexing his notes on 2026-10-09.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter

BLOCK_TAGS = {"client", "clients", "lead", "leads", "transaction", "transactions", "borrower", "pipeline", "crm", "personal", "health", "family"}
BLOCK_WORDS = re.compile(r"\b(borrower|my client|the client|clients'|buyer named|seller named|escrow #|loan #|ssn|date of birth|dob)\b", re.I)
MASKS = [
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[email]"),
    (re.compile(r"(?<!\d)(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?!\d)"), "[phone]"),
    (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[id]"),
    (re.compile(r"(?<![\d.])\d{8,}(?!\.?\d)"), "[number]"),
    (re.compile(r"\b\d{2,6}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Ct|Court|Blvd|Way|Pl|Place)\b\.?"), "[address]"),
]


def load(path: str) -> str:
    raw = open(path, encoding="utf-8").read()
    try:
        raw = json.loads(raw)["fileContent"]
    except (ValueError, KeyError, TypeError):
        pass
    return raw.replace("\\#", "#").replace("\\_", "_").replace("\\-", "-").replace("\\*", "*").replace("\\~", "~")


def rows(text: str) -> tuple[str, list[str]]:
    parts = re.split(r"\n(?=## )", text)
    return parts[0], parts[1:]


def tags_of(row: str) -> set[str]:
    lines = [ln.strip() for ln in row.splitlines() if ln.strip()]
    meta = lines[1] if len(lines) > 1 else ""
    if "·" not in meta:
        return set()
    return {t.strip().lower() for t in meta.split("·")[-1].split(",") if t.strip()}


def main(argv: list[str]) -> int:
    src, out = argv[1], argv[2]
    head, body = rows(load(src))
    tagcount: Counter = Counter()
    kept, dropped_tag, dropped_word, masked = [], 0, 0, Counter()
    for r in body:
        tg = tags_of(r)
        tagcount.update(tg)
        if tg & BLOCK_TAGS:
            dropped_tag += 1
            continue
        if BLOCK_WORDS.search(r):
            dropped_word += 1
            continue
        pieces = re.split(r"(https?://\S+)", r)  # links (Notion page ids) are left whole
        for i in range(0, len(pieces), 2):
            for pat, rep in MASKS:
                pieces[i], n = pat.subn(rep, pieces[i])
                masked[rep] += n
        r = "".join(pieces)
        kept.append(r.rstrip())
    print(f"rows {len(body)} · kept {len(kept)} · dropped for tag {dropped_tag} · dropped for wording {dropped_word}")
    print("masked: " + ", ".join(f"{k} {v}" for k, v in masked.items()))
    print("tags: " + ", ".join(f"{k} {v}" for k, v in tagcount.most_common()))
    if "--tags-only" in argv:
        return 0
    stamp = re.search(r"Synced (\S+)", head)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("# Drive Second Brain notes (screened)\n\n")
        fh.write(f"Steven's Notion Second Brain rows as exported to Google Drive, synced {stamp.group(1)[:10] if stamp else 'unknown'}. "
                 f"Screened by `integrations/google-drive/redact_export.py`: {len(kept)} of {len(body)} rows kept; "
                 "client-tagged rows left out; emails, phones and long numbers masked. The Notion database is the record — "
                 "these are a dated copy. Source: `references/google-drive.md`.\n\n")
        fh.write("\n\n".join(re.sub(r"^## ", "## ", k) for k in kept) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
