"""Tests for brain/layers.py — the Command Deck DB stamp (2026-11-02 fix)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import layers  # noqa: E402


def _tree(d: Path, status: str | None = None, sync: str | None = None, moves: str | None = None) -> Path:
    if status:
        (d / "projects").mkdir(parents=True, exist_ok=True)
        (d / "projects" / "command-deck.md").write_text(f"# Deck\n\n## Status ({status}) — note\n", encoding="utf-8")
    if sync:
        (d / "brain" / "state").mkdir(parents=True, exist_ok=True)
        (d / "brain" / "state" / "deck-sync.json").write_text(json.dumps({"lastWrite": sync}), encoding="utf-8")
    if moves:
        (d / "docs" / "reports").mkdir(parents=True, exist_ok=True)
        (d / "docs" / "reports" / "BIG-MOVES.md").write_text(f"# Big moves — Vanessa's top 10 for {moves}\n", encoding="utf-8")
    return d


class DeckStampTests(unittest.TestCase):
    def test_newest_source_wins(self):
        with tempfile.TemporaryDirectory() as t:
            r = _tree(Path(t), status="2026-10-22", sync="2026-10-30T10:00:00Z", moves="2026-11-01")
            self.assertEqual(layers._deck_last(r), date(2026, 11, 1))

    def test_stamp_file_alone(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertEqual(layers._deck_last(_tree(Path(t), sync="2026-11-02T01:00:00Z")), date(2026, 11, 2))

    def test_nothing_is_none(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertIsNone(layers._deck_last(Path(t)))

    def test_status_notes_still_count(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertEqual(layers._deck_last(_tree(Path(t), status="2026-10-22")), date(2026, 10, 22))


if __name__ == "__main__":
    unittest.main()
