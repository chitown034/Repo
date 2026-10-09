"""Tests for brain/loop.py and brain/mcp.py. Run: python3 -m unittest discover -s brain/tests"""

from __future__ import annotations

import json
import os
import unittest
from pathlib import Path

from fixture import BrainCase  # noqa: E402

from brain import indexer, loop, mcp, recall  # noqa: E402

ORG = """\
# Org

```
Steven
├─ Vanessa — Chief of Staff
└─ Marcus (CFO) — money
```

- **Gwen** (Buyer's Agent) — preps showings.
"""


class LogAndGaps(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        os.environ.pop("BRAIN_NOLOG", None)
        indexer.write(self.root)

    def test_miss_is_logged_with_keywords_not_sentence(self):
        res = recall.recall("zebra quantum mortgage", root=self.root)
        self.assertTrue(loop.log_recall(self.root, res))
        raw = (self.root / loop.LOG).read_text()
        self.assertNotIn("zebra quantum mortgage", raw)
        self.assertIn("kw", raw)

    def test_gaps_group_and_rank_repeated_misses(self):
        for _ in range(3):
            loop.log_recall(self.root, {"query": "unicorn ledger", "keywords": ["unicorn", "ledger"], "file": None, "confidence": 0})
        loop.log_recall(self.root, {"query": "other thing", "keywords": ["other"], "file": None, "confidence": 0})
        g = loop.gaps(self.root)
        self.assertEqual(g[0]["count"], 3)
        self.assertEqual(g[0]["keywords"], ["ledger", "unicorn"])

    def test_good_answers_are_not_gaps(self):
        loop.log_recall(self.root, {"query": "x", "keywords": ["x"], "file": "memory.md", "confidence": 0.9})
        self.assertEqual(loop.gaps(self.root), [])

    def test_nolog_env_and_secret_guard(self):
        os.environ["BRAIN_NOLOG"] = "1"
        try:
            self.assertFalse(loop.log_recall(self.root, {"query": "a", "keywords": ["a"], "file": None}))
        finally:
            os.environ.pop("BRAIN_NOLOG")
        self.assertFalse(loop.log_recall(self.root, {"query": "key sk-ant-api03-AbCdEf1234567890AbCdEf1234567890", "keywords": ["key"], "file": None}))


class OrgAndJarvis(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        d = self.root / "wiki/ai-team"
        d.mkdir(parents=True, exist_ok=True)
        (d / "org-chart.md").write_text(ORG, encoding="utf-8")
        indexer.write(self.root)

    def test_seats_parsed(self):
        names = [s["name"] for s in loop.org_seats(self.root)]
        self.assertEqual(names, ["Vanessa", "Marcus", "Gwen"])

    def test_orgcheck_counts(self):
        r = loop.orgcheck(self.root)
        self.assertEqual(r["total"], 3)
        self.assertGreaterEqual(r["covered"], 1)
        self.assertEqual(r["jarvis"]["state"], "unverified")

    def test_jarvis_states(self):
        sd = self.root / loop.STATE_DIR
        sd.mkdir(parents=True, exist_ok=True)
        f = self.root / loop.JARVIS_STATUS
        f.write_text(json.dumps({"checked": "2020-01-01T00:00:00Z", "ok": True}))
        self.assertEqual(loop.jarvis_status(self.root)["state"], "stale")
        f.write_text("not json")
        self.assertEqual(loop.jarvis_status(self.root)["state"], "unverified")


class PackAndLoop(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        indexer.write(self.root)

    def test_pack_respects_budget(self):
        p = loop.pack(self.root, "licenses states", budget_tokens=400)
        self.assertLessEqual(p["used"], 400)
        for part in p["parts"]:
            self.assertIn("file", part)

    def test_pack_unknown_says_not_in_brain(self):
        self.assertIn("not in the brain", loop.format_pack(loop.pack(self.root, "zzzz qqqq xxxx")))

    def test_loop_writes_report_and_history_and_flags_regression(self):
        (self.root / "docs/reports").mkdir(parents=True, exist_ok=True)
        ok, text = loop.run_loop(self.root)
        self.assertIn("Brain loop report", text)
        self.assertTrue((self.root / loop.HISTORY).is_file())
        prev = loop.last_run(self.root)
        prev["org_covered"] = 99  # pretend coverage used to be higher
        (self.root / loop.HISTORY).write_text(json.dumps(prev) + "\n")
        ok2, text2 = loop.run_loop(self.root)
        self.assertFalse(ok2)
        self.assertIn("org coverage fell", text2)


class StaleAndRelated(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        (self.root / "wiki").mkdir(exist_ok=True)
        (self.root / "wiki/old.md").write_text("# Old\n\nStatus: running, as of 2020-01-05.\n")
        (self.root / "wiki/fresh.md").write_text("# Fresh\n\nStatus: running, as of 2026-10-01.\n")
        (self.root / "wiki/history.md").write_text("# History\n\nWe moved on 2020-01-05.\n")
        indexer.write(self.root)

    def test_stale_flags_old_live_facts_only(self):
        from datetime import date
        rows = {r["file"] for r in loop.stale(self.root, days=21, today=date(2026, 10, 9))}
        self.assertIn("wiki/old.md", rows)
        self.assertNotIn("wiki/fresh.md", rows)
        self.assertNotIn("wiki/history.md", rows)  # no live-sounding words

    def test_related_by_path_excludes_itself(self):
        rows = loop.related(self.root, "wiki/old.md")
        self.assertNotIn("wiki/old.md", [r["file"] for r in rows])

    def test_related_unknown_question(self):
        self.assertEqual(loop.related(self.root, "zzzz qqqq xxxx"), [])


class McpTests(BrainCase, unittest.TestCase):
    def setUp(self):
        super().setUp()
        os.environ["BRAIN_NOLOG"] = "1"
        indexer.write(self.root)

    def tearDown(self):
        os.environ.pop("BRAIN_NOLOG", None)
        super().tearDown()

    def test_handshake_and_tools(self):
        r = mcp.handle(self.root, {"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        self.assertEqual(r["result"]["serverInfo"]["name"], "second-brain")
        t = mcp.handle(self.root, {"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        self.assertEqual({x["name"] for x in t["result"]["tools"]}, {"brain_recall", "brain_pack", "brain_gaps", "brain_stale", "brain_related", "brain_remember"})

    def test_notification_gets_no_reply(self):
        self.assertIsNone(mcp.handle(self.root, {"jsonrpc": "2.0", "method": "notifications/initialized"}))

    def test_recall_call(self):
        r = mcp.handle(self.root, {"jsonrpc": "2.0", "id": 3, "method": "tools/call",
                                   "params": {"name": "brain_recall", "arguments": {"question": "licenses states"}}})
        self.assertFalse(r["result"]["isError"])
        self.assertTrue(r["result"]["content"][0]["text"])

    def test_remember_refuses_secret_and_unknown_tool_errors(self):
        r = mcp.handle(self.root, {"jsonrpc": "2.0", "id": 4, "method": "tools/call",
                                   "params": {"name": "brain_remember", "arguments": {"fact": "key sk-ant-api03-AbCdEf1234567890AbCdEf1234567890"}}})
        self.assertIn("REFUSED", r["result"]["content"][0]["text"])
        r = mcp.handle(self.root, {"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "nope"}})
        self.assertIn("error", r)


if __name__ == "__main__":
    unittest.main()
