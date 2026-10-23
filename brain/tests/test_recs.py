"""Tests for brain/recs.py — Vanessa's top 10 big moves and what they learn (2026-10-23)."""
from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from brain import recs  # noqa: E402

TODAY = date(2026, 10, 23)


class RecsTests(unittest.TestCase):
    def setUp(self):  # never read or write the repo's real ledger and weights from a test
        self._tmp = tempfile.TemporaryDirectory(); t = Path(self._tmp.name)
        self._saved = (recs.WEIGHTS, recs.LEDGER)
        recs.WEIGHTS, recs.LEDGER = str(t / "w.json"), str(t / "l.jsonl")

    def tearDown(self):
        recs.WEIGHTS, recs.LEDGER = self._saved; self._tmp.cleanup()

    def test_steven_steps_all_eleven_and_ranked_by_what_they_unblock(self):
        steps = {c["title"]: c for c in recs._steven_steps(ROOT)}
        for t in ("Lofty API key", "Zoho", "TidyCal token", "Arive", "MBS Highway", "Ticor Title", "Pivo", "AnyDesk"):
            self.assertIn(t, steps, t)
        self.assertEqual(len(steps), 11)
        self.assertGreater(steps["Lofty API key"]["impact"] / steps["Lofty API key"]["effort"], steps["AnyDesk"]["impact"] / steps["AnyDesk"]["effort"])
        top = recs.top(ROOT, 10, today=TODAY)
        self.assertLess([c["title"] for c in top].index("Lofty API key"), [c["title"] for c in top].index("AnyDesk") if "AnyDesk" in [c["title"] for c in top] else 99)

    def test_declining_one_lofty_move_hides_every_lofty_move(self):
        top = recs.top(ROOT, 60, today=TODAY)
        lofty = [c for c in top if c["topic"] == "lofty"]
        self.assertGreaterEqual(len(lofty), 2)
        recs.learn(ROOT, [{"id": lofty[0]["id"], "decision": "declined", "at": "2026-10-23T10:00:00Z"}], today=TODAY)
        after = recs.top(ROOT, 60, today=TODAY)
        self.assertFalse([c for c in after if c["topic"] == "lofty"])

    def test_bad_ledger_and_signal_shapes_do_not_crash(self):
        Path(recs.LEDGER).write_text('5\n{"id":"bm_zz","decision":"declined","at":"yesterday"}\n', encoding="utf-8")
        items = recs.top(ROOT, 5, signals={"signals": [{"key": "k", "title": "Wrapped works", "plan": "one step"}, "junk"]}, today=TODAY)
        self.assertTrue(items)
        w = [c for c in recs.top(ROOT, 60, signals=[{"key": "k", "title": "Wrapped works", "plan": "one step"}], today=TODAY) if c["title"] == "Wrapped works"][0]
        self.assertEqual(w["plan"], ["one step"])

    def test_same_decision_fed_twice_without_time_counts_once(self):
        recs.learn(ROOT, [{"id": "bm_q", "decision": "approved", "category": "ops"}], today=TODAY)
        recs.learn(ROOT, [{"id": "bm_q", "decision": "approved", "category": "ops"}], today=TODAY)
        self.assertAlmostEqual(recs.load_weights(ROOT)["ops"], 1.1, places=4)

    def test_top_ten_is_scored_ranked_and_mixed(self):
        items = recs.top(ROOT, 10, today=TODAY)
        self.assertEqual(len(items), 10)
        self.assertEqual([c["rank"] for c in items], list(range(1, 11)))
        self.assertEqual(items, sorted(items, key=lambda c: -c["score"]))
        ex = [c["executor"] for c in items]
        self.assertLessEqual(ex.count("steven"), 6, "one executor never fills more than 60% of the list")
        for c in items:
            self.assertIn(c["value"], ("high", "medium", "low")); self.assertTrue(c["plan"]); self.assertTrue(c["id"].startswith("bm_"))
            self.assertAlmostEqual(c["score"], round(c["impact"] * c["confidence"] / c["effort"] * c["weight"], 3))

    def test_signals_rank_with_the_brain_and_bad_signals_are_skipped(self):
        sig = [{"category": "revenue", "key": "refi:3", "title": "Call the 3 refi candidates", "why": "spread > 0.75", "owner": "Harrison",
                "executor": "steven", "impact": 5, "effort": 1, "confidence": 0.9, "plan": ["ISA calls", "Harrison preps"], "source": "deck:refiWatchDesk"},
               {"title": "no key"}]
        items = recs.top(ROOT, 10, signals=sig, today=TODAY)
        self.assertEqual(items[0]["title"], "Call the 3 refi candidates"); self.assertEqual(items[0]["value"], "high")
        self.assertFalse([c for c in items if c["title"] == "no key"])

    def test_learning_moves_weights_and_snoozes_declined(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            for rel in ("docs", "brain/recs", "brain/bench", "wiki/ai-team", "integrations", "docs/inventory"):
                (root / rel).mkdir(parents=True, exist_ok=True)
            (root / "docs/STEVEN-STEPS.md").write_text("## x\n**Then, the sign-ins and keys only you can do** (say so):\n- **a. Lofty API key** → Lofty → Settings.\n- **b. Zoho** → tick the box.\n\n## next\n", encoding="utf-8")
            shutil.copy(ROOT / "brain/bench/questions.json", root / "brain/bench/questions.json")
            (root / "brain/index.json").write_text(json.dumps({"files": [], "built": "2026-10-23"}), encoding="utf-8")
            (root / "INDEX.md").write_text("", encoding="utf-8")
            before = recs.top(root, 10, today=TODAY)
            ids = {c["title"]: c["id"] for c in before}
            self.assertIn("Lofty API key", ids)
            r = recs.learn(root, [{"id": ids["Lofty API key"], "decision": "approved", "at": "2026-10-23"},
                                  {"id": ids["Zoho"], "decision": "declined", "at": "2026-10-23"},
                                  {"id": ids["Zoho"], "decision": "declined", "at": "2026-10-23"}], today=TODAY)  # the duplicate is ignored
            self.assertEqual(r["added"], 2)
            w = recs.load_weights(root)
            self.assertAlmostEqual(w["steven"], 1.0 * 1.1 * 0.85, places=4)
            after = recs.top(root, 10, today=TODAY)
            titles = [c["title"] for c in after]
            self.assertNotIn("Zoho", titles, "a declined move is hidden for 30 days")
            self.assertEqual([c for c in after if c["title"] == "Lofty API key"][0]["decision"], "approved")
            later = recs.top(root, 10, today=date(2026, 11, 30))
            self.assertIn("Zoho", [c["title"] for c in later], "and comes back after the snooze")
            p = recs.write(root, 10, today=TODAY)
            self.assertTrue(p.exists()); self.assertTrue((root / "brain/recs/big-moves.json").exists())
            body = p.read_text(encoding="utf-8")
            self.assertIn("| 1 |", body); self.assertIn("Category weights", body)

    def test_weights_are_bounded(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); (root / "brain/recs").mkdir(parents=True); (root / "docs").mkdir()
            (root / "brain/index.json").write_text(json.dumps({"files": []}), encoding="utf-8"); (root / "INDEX.md").write_text("")
            (root / "brain/bench").mkdir(); shutil.copy(ROOT / "brain/bench/questions.json", root / "brain/bench/questions.json")
            decs = [{"id": "bm_x", "decision": "approved", "at": f"2026-01-{i:02d}", "category": "ops"} for i in range(1, 29)]
            w = recs.learn(root, decs, today=TODAY)["weights"]
            self.assertLessEqual(w["ops"], 2.0)
            decs = [{"id": "bm_y", "decision": "declined", "at": f"2026-02-{i:02d}", "category": "ops"} for i in range(1, 29)]
            w = recs.learn(root, decs, today=TODAY)["weights"]
            self.assertGreaterEqual(w["ops"], 0.3)


if __name__ == "__main__":
    unittest.main()
