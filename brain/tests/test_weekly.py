"""The weekly improvement review (brain/weekly.py): harness, graph and loop engineering lenses feeding the improve lane."""
import json
import shutil
import tempfile
import unittest
from datetime import date
from pathlib import Path

from fixture import REPO  # noqa: E402

from brain import recs, weekly  # noqa: E402


class Weekly(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.res = weekly.review(REPO)

    def test_three_lenses_in_order_with_scores(self):
        self.assertEqual([l["key"] for l in self.res["lenses"]], ["harness", "graph", "loop"])
        for l in self.res["lenses"]:
            self.assertTrue(0 <= l["score"] <= 100, l)
            self.assertIn("metrics", l)
            for p in l["proposals"]:
                self.assertTrue(p["title"] and p["plan"], p)

    def test_report_names_every_lens(self):
        text = weekly.format_report(self.res)
        for label in ("Harness engineering", "Graph engineering", "Loop engineering"):
            self.assertIn(f"## {label}", text)

    def test_dead_link_is_found(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            (d / "wiki").mkdir()
            (d / "wiki" / "a.md").write_text("see [b](b.md) and [gone](missing.md)\n")
            (d / "wiki" / "b.md").write_text("ok\n")
            dead = weekly.dead_links(d)
            self.assertEqual([x["link"] for x in dead], ["missing.md"])

    def test_missing_hook_script_is_found(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            (d / ".claude").mkdir()
            (d / ".claude" / "settings.json").write_text(json.dumps({"hooks": {"Stop": [{"hooks": [
                {"type": "command", "command": '"$CLAUDE_PROJECT_DIR"/.claude/hooks/nope.sh'}]}]}}))
            self.assertEqual(weekly._hook_scripts_missing(d), [".claude/hooks/nope.sh"])

    def test_skill_without_frontmatter_is_found(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            (d / ".claude" / "skills" / "x").mkdir(parents=True)
            (d / ".claude" / "skills" / "x" / "SKILL.md").write_text("# no frontmatter\n")
            self.assertEqual(weekly._skills_without_frontmatter(d), [".claude/skills/x/SKILL.md"])

    def test_components_split_islands(self):
        comps = weekly._components(["a", "b", "c", "d"], [("a", "b"), ("c", "d")])
        self.assertEqual(sorted(len(c) for c in comps), [2, 2])

    def test_proposals_reach_the_improve_lane(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            (d / "brain").mkdir()
            state = {"date": "2026-11-22", "lenses": [{"key": "graph", "label": "Graph engineering", "score": 80,
                                                       "proposals": [{"kind": "dead_links", "title": "Fix 2 dead links", "why": "w", "plan": ["p"], "impact": 3, "effort": 1}]}]}
            (d / weekly.STATE).write_text(json.dumps(state))
            cs = recs._weekly_candidates(d, date(2026, 11, 23))
            self.assertEqual(len(cs), 1)
            self.assertEqual(recs.coa_of(cs[0]), "improve")
            self.assertTrue(cs[0]["title"].startswith("Graph engineering:"))

    def test_move_id_survives_a_changed_count_and_order(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); (d / "brain").mkdir()
            def ids(props):
                (d / weekly.STATE).write_text(json.dumps({"date": "2026-11-22", "lenses": [{"key": "harness", "label": "H", "score": 50, "proposals": props}]}))
                return {c["title"].split(": ", 1)[1].split()[0]: c["id"] for c in recs._weekly_candidates(d, date(2026, 11, 22))}
            a = ids([{"kind": "routines_failing", "title": "Repair 10 routines", "plan": []}, {"kind": "connectors_reconnect", "title": "Reconnect 1", "plan": []}])
            b = ids([{"kind": "connectors_reconnect", "title": "Reconnect 3", "plan": []}])
            self.assertEqual(a["Reconnect"], b["Reconnect"])

    def test_stale_or_malformed_review_feeds_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); (d / "brain").mkdir()
            good = {"lenses": [{"key": "loop", "label": "L", "score": 1, "proposals": [{"kind": "k", "title": "t", "plan": []}]}]}
            (d / weekly.STATE).write_text(json.dumps({"date": "2026-11-01", **good}))
            self.assertEqual(recs._weekly_candidates(d, date(2026, 11, 22)), [])
            for bad in ({"date": "2026-11-22", "lenses": ["x"]}, {"date": "2026-11-22", "lenses": {"a": 1}},
                        {"date": "2026-11-22", "lenses": [{"key": "loop", "proposals": [{"title": None}]}]}, ["x"], {"date": "junk"}):
                (d / weekly.STATE).write_text(json.dumps(bad))
                self.assertEqual(recs._weekly_candidates(d, date(2026, 11, 22)), [], bad)

    def test_bad_loop_history_lines_do_not_crash(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); (d / "brain").mkdir()
            (d / "brain" / "loop-history.jsonl").write_text('{"ts":"garbage"}\n[1,2]\n{"ts":"2026-11-21T00:00:00Z","bench_correct":"30","bench_total":31}\n{"ts":"2030-01-01"}\n')
            r = weekly.loop_lens(d, date(2026, 11, 22))
            self.assertEqual(r["metrics"]["runs_last_7_days"], 1)

    def test_lone_orphan_is_not_also_an_island(self):
        comps = weekly._components(["a", "b", "c"], [("a", "b")])
        self.assertEqual([c for c in comps[1:] if len(c) > 1], [])

    def test_dead_links_edge_cases(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); (d / "wiki" / "dir.md").mkdir(parents=True)
            (d / "wiki" / "my page.md").write_text("x")
            (d / "wiki" / "a.md").write_text("[s](my%20page.md) [up](../../zz.md)\n")
            self.assertEqual([x["link"] for x in weekly.dead_links(d)], ["../../zz.md"])

    def test_write_keeps_history(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d)
            shutil.copytree(REPO, d / "r", ignore=shutil.ignore_patterns(".git", "node_modules", "*.html", "exports"))
            r = d / "r"
            (r / weekly.HISTORY).unlink(missing_ok=True)
            weekly.write(r)
            weekly.write(r)
            lines = (r / weekly.HISTORY).read_text().splitlines()
            self.assertEqual(len(lines), 2)
            self.assertIn("Last week", (r / weekly.REPORT).read_text())


if __name__ == "__main__":
    unittest.main()
