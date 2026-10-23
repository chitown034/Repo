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
        for t in ("Link your iMessage line (fixes the missing morning text + voice note)", "Zoho", "Claim your profiles for AI search", "AnyDesk permissions",
                  "Lofty API key", "TidyCal token", "Arive", "MBS Highway", "Ticor Title", "Pivo", "Drips and texts"):
            self.assertIn(t, steps, t)
        self.assertEqual(len(steps), 13)  # five clicks A-E + eight carried as big moves
        self.assertGreater(steps["Lofty API key"]["impact"] / steps["Lofty API key"]["effort"], steps["AnyDesk permissions"]["impact"] / steps["AnyDesk permissions"]["effort"])
        top = recs.top(ROOT, 10, today=TODAY)
        self.assertLess([c["title"] for c in top].index("Lofty API key"), [c["title"] for c in top].index("AnyDesk permissions") if "AnyDesk permissions" in [c["title"] for c in top] else 99)

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

    def test_step_ids_follow_the_title_not_the_letter(self):
        import tempfile, shutil
        t = Path(tempfile.mkdtemp()); (t / "docs").mkdir()
        doc = "# x\n\n**Then four clicks, in this order** (say):\n- **A. Zoho** → tick the box.\n- **B. Pivo** → pair it.\n\n**Carried by Vanessa as big moves** (list):\n- **a. Lofty API key** → make it.\n\n## next\n"
        (t / "docs/STEVEN-STEPS.md").write_text(doc, encoding="utf-8")
        first = {c["title"]: c["id"] for c in recs._steven_steps(t)}
        (t / "docs/STEVEN-STEPS.md").write_text(doc.replace("**A. Zoho**", "**C. Zoho**").replace("**B. Pivo**", "**D. Pivo**").replace("**a. Lofty API key**", "**k. Lofty API key**"), encoding="utf-8")
        second = {c["title"]: c["id"] for c in recs._steven_steps(t)}
        self.assertEqual(first, second)                      # re-lettering keeps every id
        self.assertEqual(len(set(first.values())), 3)        # "A." and "a." never collide: ids come from titles
        shutil.rmtree(t)

if __name__ == "__main__":
    unittest.main()


class CoursesOfAction(unittest.TestCase):
    """The four lanes (2026-10-23): big moves, self-improvement (loop engineering), risks, opportunities; and the questions block."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory(); t = Path(self._tmp.name)
        self._saved = (recs.WEIGHTS, recs.LEDGER); recs.WEIGHTS = str(t / "w.json"); recs.LEDGER = str(t / "l.jsonl")

    def tearDown(self):
        recs.WEIGHTS, recs.LEDGER = self._saved; self._tmp.cleanup()

    def test_coa_of_covers_all_four_lanes_and_explicit_wins(self):
        self.assertEqual(recs.coa_of({"source": "loop:untested", "category": "brain"}), "improve")
        self.assertEqual(recs.coa_of({"source": "loop:stale", "category": "brain"}), "risk")
        self.assertEqual(recs.coa_of({"source": "toolkit:api", "category": "connect", "title": "Connect X", "why": "403 until the box is ticked"}), "risk")
        self.assertEqual(recs.coa_of({"source": "steven-steps", "category": "steven", "title": "Zoho", "why": "no key yet"}), "big-move")
        self.assertEqual(recs.coa_of({"source": "toolkit:connector", "category": "marketing"}), "opportunity")
        self.assertEqual(recs.coa_of({"source": "signal", "category": "ops", "coa": "opportunity"}), "opportunity")
        self.assertEqual(recs.coa_of({"source": "signal", "category": "ops", "coa": "nonsense"}), "big-move")

    def test_coas_four_per_lane_ranked_and_from_the_scored_pool(self):
        g = recs.coas(ROOT, 4, today=TODAY)
        self.assertEqual(list(g), [k for k, _, _ in recs.COAS])
        top10 = {c["id"] for c in recs.top(ROOT, 10, today=TODAY)}
        laned = {c["id"] for items in g.values() for c in items}
        self.assertTrue(top10 <= laned, "every top-10 move reaches an approve surface (validator P05-F1)")
        for k, items in g.items():
            self.assertLessEqual(len([c for c in items if c["id"] not in top10]), 4, "four per lane plus the top-10 overflow")
            self.assertEqual([c["rank"] for c in items], list(range(1, len(items) + 1)))
            self.assertTrue(all(c["coa"] == k for c in items))
            self.assertEqual([c["score"] for c in items], sorted((c["score"] for c in items), reverse=True))
        self.assertTrue(g["big-move"] and g["improve"], "the repo always has moves and loop work")

    def test_explicit_coa_on_a_signal_lands_in_that_lane(self):
        sig = [{"key": "zillow-q4", "title": "Zillow Q4 push", "plan": ["one step"], "coa": "opportunity", "impact": 5, "effort": 1, "confidence": 0.95}]
        g = recs.coas(ROOT, 4, signals=sig, today=TODAY)
        self.assertIn("Zillow Q4 push", [c["title"] for c in g["opportunity"]])

    def test_questions_answer_each_leading_move_and_the_standing_questions(self):
        g = recs.coas(ROOT, 4, today=TODAY)
        qs = recs.questions(ROOT, g)
        self.assertEqual(len(qs), sum(1 for k in g if g[k]) + len(recs.STANDARD_QUESTIONS))
        for q in qs:
            self.assertTrue(q["q"].endswith("?") and q["a"] and q["action"], q)
            self.assertLessEqual(len(q["a"]), 330)
        loop_q = [q for q in qs if q["q"].startswith("What did the weekly loop")][0]
        self.assertIn("bench", loop_q["a"])
        self.assertNotIn("##", " ".join(q["a"] for q in qs), "headings are stripped from recall evidence")

    def test_write_carries_coas_and_questions_beside_the_top_ten(self):
        t = Path(self._tmp.name); saved = (recs.OUT_JSON, recs.OUT_MD)
        recs.OUT_JSON, recs.OUT_MD = "out/big-moves.json", "out/BIG-MOVES.md"
        try:
            (t / "brain").mkdir(); shutil.copytree(ROOT / "brain", t / "brain", dirs_exist_ok=True)
            for p in ("docs", "integrations", "wiki", "memory.md", "INDEX.md", "always-on", "context", "projects", "references", "knowledge-graph", "vector-index", "OPTIMIZATION.md", "README.md"):
                src = ROOT / p
                if src.is_dir(): shutil.copytree(src, t / p, dirs_exist_ok=True, ignore=shutil.ignore_patterns("*.html", "*.jsonl.bak"))
                elif src.exists(): shutil.copy(src, t / p)
            recs.write(t, 10, today=TODAY)
            d = json.loads((t / "out/big-moves.json").read_text(encoding="utf-8"))
            self.assertEqual([g["key"] for g in d["coas"]], [k for k, _, _ in recs.COAS])
            self.assertTrue(all(g["items"] is not None and g["label"] and g["about"] for g in d["coas"]))
            self.assertEqual(len(d["items"]), 10); self.assertTrue(d["questions"])
            md = (t / "out/BIG-MOVES.md").read_text(encoding="utf-8")
            for _, label, _ in recs.COAS: self.assertIn("### " + label, md)
            self.assertIn("## Questions you may have", md)
        finally:
            recs.OUT_JSON, recs.OUT_MD = saved


class CoursesOfActionHardening(unittest.TestCase):
    """Validator pass on cafcabe8265c2ad7: malformed inputs, one topic per lane set, no 'None' in an action, scout weight."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory(); self.t = Path(self._tmp.name)
        self._saved = (recs.WEIGHTS, recs.LEDGER); recs.WEIGHTS = str(self.t / "w.json"); recs.LEDGER = str(self.t / "l.jsonl")
        (self.t / "brain").mkdir(); (self.t / "integrations/scout").mkdir(parents=True); (self.t / "docs").mkdir()
        shutil.copy(ROOT / "docs/STEVEN-STEPS.md", self.t / "docs/STEVEN-STEPS.md")

    def tearDown(self):
        recs.WEIGHTS, recs.LEDGER = self._saved; self._tmp.cleanup()

    def _history(self, line: str):
        (self.t / "brain/loop-history.jsonl").write_text(line + "\n", encoding="utf-8")

    def test_malformed_loop_history_and_scout_file_do_not_stop_the_engine(self):
        for line in ('{"ts":"2026-10-23T00:00:00Z","bench_total":"n/a","bench_correct":1}', "[1,2]", "not json at all"):
            self._history(line)
            (self.t / "integrations/scout/seen.json").write_text('{"updated":"2026-01-01","ids":5}', encoding="utf-8")
            items = recs.candidates(self.t, today=TODAY)
            self.assertTrue(items, line)
            self.assertFalse([c for c in items if c["source"] == "scout"], "oddly shaped ids: no scout move, no crash")

    def test_missing_or_garbage_ts_offers_the_loop_run_move(self):
        for line in ('{"bench_total":31,"bench_correct":31}', '{"ts":"garbage","bench_total":31,"bench_correct":31}'):
            self._history(line)
            titles = [c["title"] for c in recs._improve_candidates(self.t, TODAY)]
            self.assertIn("Run the weekly brain loop", titles, line)
        self._history('{"ts":"2026-10-22T04:30:00Z","bench_total":31,"bench_correct":31}')
        self.assertNotIn("Run the weekly brain loop", [c["title"] for c in recs._improve_candidates(self.t, TODAY)])

    def test_one_topic_across_the_lanes_unless_it_is_a_top_ten_move(self):
        g = recs.coas(ROOT, 4, today=TODAY)
        top10 = {c["id"] for c in recs.top(ROOT, 10, today=TODAY)}
        seen = {}
        for k, items in g.items():
            for c in items:
                if c["id"] in top10 or not c["topic"]:
                    continue
                self.assertNotIn(c["topic"], seen, f"{c['title']} repeats topic {c['topic']} already in {seen.get(c['topic'])}")
                seen[c["topic"]] = k

    def test_a_signal_pinned_to_risk_lands_there_without_risk_words(self):
        sig = [{"key": "quiet", "title": "Quiet thing", "plan": ["one"], "coa": "risk", "impact": 5, "effort": 1, "confidence": 0.9, "category": "revenue"}]
        self.assertIn("Quiet thing", [c["title"] for c in recs.coas(ROOT, 4, signals=sig, today=TODAY)["risk"]])

    def test_question_action_never_says_none_and_answers_are_clean(self):
        saved = recs.STANDARD_QUESTIONS
        try:
            recs.STANDARD_QUESTIONS = (("Is there anything here?", "zqxv wkjq plmtr nonsensewords"),)
            qs = recs.questions(ROOT, recs.coas(ROOT, 4, today=TODAY), standard=1)
            for q in qs:
                self.assertNotIn("None", q["action"], q)
                self.assertNotIn("**", q["a"]); self.assertNotIn("|", q["a"]); self.assertNotIn("##", q["a"])
        finally:
            recs.STANDARD_QUESTIONS = saved
        self.assertEqual(recs._clean_answer("## Head\n| a | b |\n**bold** text `code` here. [pointer → x § y] more. tail"), "bold text code here. more. tail")

    def test_declining_the_scout_leaves_the_marketing_weight_alone(self):
        self._history('{"ts":"2026-10-23T00:00:00Z","bench_total":1,"bench_correct":1}')
        (self.t / "integrations/scout/seen.json").write_text('{"updated":"2026-01-01","ids":["mcp:a"]}', encoding="utf-8")
        scout = [c for c in recs._improve_candidates(self.t, TODAY) if c["source"] == "scout"][0]
        self.assertEqual((scout["coa"], scout["category"]), ("opportunity", "brain"))
        recs.learn(self.t, [{"id": scout["id"], "decision": "declined", "at": "2026-10-23T10:00:00Z", "category": scout["category"]}], today=TODAY)
        self.assertAlmostEqual(recs.load_weights(self.t).get("marketing", 1.0), 1.0, places=4)
