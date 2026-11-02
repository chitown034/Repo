"""Tests for brain/layers.py — the second brain's layer register (2026-10-23)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import layers  # noqa: E402


class LayerTests(unittest.TestCase):
    def test_every_layer_has_a_verdict(self):
        rows = layers.collect(ROOT, today=date(2026, 10, 23))
        keys = {r["key"] for r in rows}
        for k in ("repo", "index", "deck", "brain6d", "jarvis", "notion", "drive", "notebooklm", "vector", "graph"):
            self.assertIn(k, keys)
        for r in rows:
            self.assertIn(r["verdict"], ("fresh", "stale", "unverified", "spec only", "no recordings yet"), r)
            self.assertEqual(r["cadence_days"], layers.CADENCE_DAYS[r["key"]])

    def test_stamps_come_from_files_not_today(self):
        # The weekly layers sync rewrites drive-manifest.json `last_sync.date`, so the expected stamp is read
        # from the file (last_sync.date, else `created`) rather than typed here; the verdict is checked far enough
        # past that stamp that it must read stale whatever the date is.
        import json
        man = json.loads((ROOT / "integrations" / "notebooklm" / "drive-manifest.json").read_text(encoding="utf-8"))
        expected = (man.get("last_sync") or {}).get("date") or man.get("created")
        self.assertRegex(expected, r"^\d{4}-\d{2}-\d{2}")
        far = date.fromisoformat(expected[:10]) + timedelta(days=69)
        rows = {r["key"]: r for r in layers.collect(ROOT, today=far)}
        self.assertEqual(rows["drive"]["last"], expected[:10])
        self.assertEqual(rows["drive"]["verdict"], "stale")      # 69 days later it must say so
        self.assertIsNone(rows["vector"]["last"]); self.assertEqual(rows["vector"]["verdict"], "spec only")

    def test_format_and_write(self):
        rows = layers.collect(ROOT, today=date(2026, 10, 23))
        txt = layers.format_rows(rows)
        self.assertIn("even:", txt)
        self.assertIn("NotebookLM notebooks", txt)
        import tempfile, shutil
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "docs" / "reports").mkdir(parents=True)
            (root / "brain").mkdir(); (root / "integrations" / "notebooklm").mkdir(parents=True)
            shutil.copy(ROOT / "integrations" / "notebooklm" / "drive-manifest.json", root / "integrations" / "notebooklm" / "drive-manifest.json")
            p = layers.write(root, today=date(2026, 10, 23))
            body = p.read_text(encoding="utf-8")
            self.assertIn("| Google Drive SECOND BRAIN/ |", body)
            self.assertIn("**Even:**", body)

    def test_fieldy_row_reads_no_recordings_until_a_day_heading_exists(self):
        rows = {r["key"]: r for r in layers.collect(ROOT, today=date(2026, 10, 23))}
        self.assertEqual(rows["fieldy"]["cadence_days"], 1)
        self.assertIn(rows["fieldy"]["verdict"], ("no recordings yet", "fresh", "stale"))
        self.assertIn("fieldy.ai", rows["fieldy"]["url"])
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); (root / "memory").mkdir()
            (root / "memory" / "fieldy-meetings.md").write_text("# Fieldy\n\n## 2026-10-22\n- x\n", encoding="utf-8")
            r = {x["key"]: x for x in layers.collect(root, today=date(2026, 10, 23))}["fieldy"]
            self.assertEqual((r["last"], r["verdict"]), ("2026-10-22", "fresh"))
            # an empty day still counts as checked: the task rewrites "Last checked" even when there are no recordings
            (root / "memory" / "fieldy-meetings.md").write_text("# Fieldy\n\nLast checked: 2026-10-23\n\n## 2026-10-20\n- x\n", encoding="utf-8")
            r = {x["key"]: x for x in layers.collect(root, today=date(2026, 10, 23))}["fieldy"]
            self.assertEqual((r["last"], r["verdict"]), ("2026-10-23", "fresh"))


def _tree(d: Path, status=None, sync=None, moves=None) -> Path:
    if status:
        (d / "projects").mkdir(parents=True, exist_ok=True)
        (d / "projects" / "command-deck.md").write_text(f"# Deck\n\n## Status ({status}) — note\n", encoding="utf-8")
    if sync is not None:
        (d / "brain").mkdir(parents=True, exist_ok=True)
        (d / "brain" / "deck-sync.json").write_text(sync if isinstance(sync, str) else json.dumps(sync), encoding="utf-8")
    if moves:
        (d / "docs" / "reports").mkdir(parents=True, exist_ok=True)
        (d / "docs" / "reports" / "BIG-MOVES.md").write_text(f"# Big moves — Vanessa's top 10 for {moves}\n", encoding="utf-8")
    return d


class DeckStampTests(unittest.TestCase):
    """2026-11-02: the deck row reads only proof of a confirmed deck write."""

    def test_report_alone_is_not_proof(self):
        with tempfile.TemporaryDirectory() as t:
            r = _tree(Path(t), status="2026-10-22", moves="2026-11-01")
            self.assertEqual(layers._deck_last(r), date(2026, 10, 22))
            row = [x for x in layers.collect(r, today=date(2026, 11, 2)) if x["key"] == "deck"][0]
            self.assertEqual(row["verdict"], "stale")

    def test_confirmed_stamp_counts(self):
        with tempfile.TemporaryDirectory() as t:
            r = _tree(Path(t), status="2026-10-22")
            layers.deck_stamp(r, "agentInbox", "115", "inbox sweep", now=datetime(2026, 11, 1, 20, 4, tzinfo=timezone.utc))
            self.assertEqual(layers._deck_last(r), date(2026, 11, 1))
            row = [x for x in layers.collect(r, today=date(2026, 11, 2)) if x["key"] == "deck"][0]
            self.assertEqual(row["verdict"], "fresh")

    def test_bad_stamp_files_never_crash(self):
        for body in ("[]", '"x"', "not json", json.dumps({"lastWrite": "2026-13-40"}), json.dumps({"lastWrite": 7})):
            with tempfile.TemporaryDirectory() as t:
                self.assertIsNone(layers._deck_last(_tree(Path(t), sync=body)), body)

    def test_stamp_refuses_without_a_version(self):
        with tempfile.TemporaryDirectory() as t:
            with self.assertRaises(ValueError):
                layers.deck_stamp(Path(t), "agentInbox", "", "x")
            with self.assertRaises(ValueError):
                layers.deck_stamp(Path(t), "../etc", "3", "x")

    def test_nothing_is_none(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertIsNone(layers._deck_last(Path(t)))


if __name__ == "__main__":
    unittest.main()
