"""MausBots (brain/mausbot.py): the AI org placed inside one OpenMausBot workspace, and kept in sync with the roster."""
import unittest

from fixture import REPO  # noqa: E402

from brain import agentos, mausbot  # noqa: E402

ROOT = REPO


class Placement(unittest.TestCase):
    def setUp(self):
        self.m = agentos.build(ROOT)
        self.pl = mausbot.place(self.m["agents"], self.m["named_seats"])

    def test_every_seat_is_placed_once(self):
        self.assertEqual(set(self.pl), {a["slug"] for a in self.m["agents"]})
        for v in self.pl.values():
            self.assertIn(v["team"], mausbot.TEAMS)
            self.assertIn(v["as"], ("bot", "bench"))

    def test_bots_fit_the_workspace(self):
        bots = [s for s, v in self.pl.items() if v["as"] == "bot"]
        self.assertLessEqual(len(bots), mausbot.CAP)
        self.assertLessEqual(mausbot.CAP, mausbot.WORKSPACE_LIMIT)

    def test_chiefs_and_named_seats_have_bots(self):
        for slug in [mausbot.TOP, *mausbot.DEPTS]:
            self.assertEqual(self.pl[slug]["as"], "bot", slug)
        for seat in self.m["named_seats"].values():
            if seat["agent"] in self.pl:
                self.assertEqual(self.pl[seat["agent"]]["as"], "bot", seat["agent"])
        self.assertEqual(self.pl[mausbot.TOP]["team"], mausbot.EXEC_OFFICE)
        self.assertEqual(self.pl["cro-victor"]["team"], "Revenue")

    def test_over_cap_is_refused_before_anything_is_written(self):
        many = [{"slug": f"x{i}", "tier": "1", "lead": None, "model": "Opus 5.5", "role": "r"} for i in range(mausbot.CAP + 1)]
        with self.assertRaises(mausbot.MausbotError):
            mausbot.place(many, {})

    def test_reporting_cycle_does_not_hang(self):
        a = [{"slug": "a", "tier": "3", "lead": "b", "model": "Opus 5.5", "role": "r"},
             {"slug": "b", "tier": "3", "lead": "a", "model": "Opus 5.5", "role": "r"}]
        self.assertEqual(mausbot.place(a, {})["a"]["team"], mausbot.EXEC_OFFICE)


class TeamFile(unittest.TestCase):
    def test_committed_team_file_is_current(self):
        r = mausbot.check(ROOT)
        self.assertIsNone(r["error"])
        self.assertFalse(r["stale"], "run bin/brain mausbot --write")

    def test_render_is_deterministic_and_guarded(self):
        t1, s1, _ = mausbot.render(ROOT)
        t2, s2, _ = mausbot.render(ROOT)
        self.assertEqual((t1, s1), (t2, s2))
        self.assertIn("  approval: ask", t1)
        self.assertIn('  computer: "off"', t1)
        self.assertIn("  browser: false", t1)
        for bad in ("approval: full", "approval: auto", "computer: local", "key:", "env:"):
            self.assertNotIn(bad, t1)
        for text in s1.values():
            self.assertLessEqual(len(text.encode()), mausbot.SOUL_LIMIT)
            self.assertIn("Specialist bench", text)

    def test_every_soul_file_exists(self):
        import re
        text, _, _ = mausbot.render(ROOT)
        base = ROOT / mausbot.OUT_DIR
        for rel in re.findall(r'soul: \{ file: "([^"]+)" \}', text):
            if rel.startswith("souls/"):
                continue   # written by mausbot.write from the same render
            self.assertTrue((base / rel).resolve().is_file(), rel)

    def test_summary_counts_add_up(self):
        s = mausbot.summary(ROOT)
        self.assertEqual(s["bots"] + s["bench"], s["seats"])
        self.assertEqual(sum(t["bots"] for t in s["teams"]), s["bots"])
        self.assertEqual(s["teams"][0]["chief"], "Vanessa")
        self.assertEqual(len(s["rooms"]), len(s["teams"]) + 1)

    def test_manifest_carries_the_placement(self):
        m = {a["slug"]: a for a in agentos.build(ROOT)["agents"]}
        self.assertEqual(m["cfo-marcus"]["mausbot"]["team"], "Finance")
        self.assertEqual(m["cfo-marcus"]["mausbot"]["as"], "bot")


if __name__ == "__main__":
    unittest.main()
