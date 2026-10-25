"""Tests for brain/layers.py — the second brain's layer register (2026-10-23)."""
from __future__ import annotations

import sys
import tempfile
import unittest
from datetime import date
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
        rows = {r["key"]: r for r in layers.collect(ROOT, today=date(2026, 12, 31))}
        self.assertEqual(rows["drive"]["last"], "2026-10-23")  # drive-manifest.json `created`
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


if __name__ == "__main__":
    unittest.main()
