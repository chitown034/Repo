"""Tests for brain/ingest_claude_export.py (2026-10-23)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import ingest_claude_export as ic  # noqa: E402

EXPORT = [
    {"uuid": "1", "name": "Refi list | planning", "created_at": "2026-10-20T10:00:00Z",
     "chat_messages": [
         {"sender": "human", "text": "Remind me to connect Zoho and call Jane at 951-555-0199 tomorrow."},
         {"sender": "assistant", "text": "SECRET ASSISTANT TEXT that must never be copied"},
         {"sender": "human", "text": "Also set up the refi watch. Thanks!"}]},
    {"uuid": "2", "name": "Untitled", "created_at": "2026-10-22T10:00:00Z",
     "chat_messages": [{"sender": "human", "text": "what is the VA funding fee"}]},
]


class IngestTests(unittest.TestCase):
    def test_digest_keeps_only_steven_masks_and_finds_tasks(self):
        text, stats = ic.digest(EXPORT, today=date(2026, 10, 23))
        self.assertNotIn("SECRET ASSISTANT TEXT", text)
        self.assertIn("[phone masked]", text)
        self.assertNotIn("951-555-0199", text)
        self.assertIn("Refi list / planning", text)
        self.assertIn("connect Zoho", text)
        self.assertIn("set up the refi watch", text)
        self.assertEqual(stats["conversations"], 2)
        self.assertGreaterEqual(stats["tasks"], 2)
        self.assertTrue(text.index("2026-10-22") < text.index("2026-10-20"))  # newest first

    def test_ingest_writes_memory_file(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); src = root / "conversations.json"
            src.write_text(json.dumps(EXPORT), encoding="utf-8")
            st = ic.ingest(root, src, today=date(2026, 10, 23))
            self.assertTrue((root / "memory" / "claude-chats.md").exists())
            self.assertEqual(st["conversations"], 2)

    def test_dict_shaped_export(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); src = root / "c.json"
            src.write_text(json.dumps({"conversations": EXPORT}), encoding="utf-8")
            self.assertEqual(ic.ingest(root, src)["conversations"], 2)


if __name__ == "__main__":
    unittest.main()
