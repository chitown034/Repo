"""brain ask (front door with auto-escalation) and brain tune (self-proposals, never auto-applied)."""
import json
import unittest

from fixture import REPO  # noqa: E402

from brain import ask as ask_mod, tune  # noqa: E402


class Ask(unittest.TestCase):
    def test_level1_answer_has_owner_and_next(self):
        a = ask_mod.ask(REPO, "What is the VA funding fee for first use with no down payment?", log=False)
        self.assertIn(a["level"], (1, 2))
        self.assertTrue(a["owner"])
        self.assertTrue(a["evidence"])
        self.assertIn("level", a["next"])

    def test_halt_words_surface(self):
        a = ask_mod.ask(REPO, "email the client their rate quote", log=False)
        self.assertTrue(a["halts"])

    def test_nonsense_escalates_to_research(self):
        a = ask_mod.ask(REPO, "zxqv plorf gribble", log=False)
        self.assertIn(a["level"], (3, 4))
        self.assertTrue("queue research" in a["next"] or "passages" in a["next"])

    def test_format_runs(self):
        self.assertIn("owner:", ask_mod.format_ask(ask_mod.ask(REPO, "who owns compliance review", log=False)))


class Tune(unittest.TestCase):
    def test_proposals_write_and_never_edit_synonyms(self):
        before = (REPO / "brain/synonyms.py").read_bytes()
        items = tune.proposals(REPO)
        p = tune.write(REPO)
        self.assertTrue(p.is_file())
        self.assertEqual(before, (REPO / "brain/synonyms.py").read_bytes())
        for it in items:
            self.assertNotIn(it["asked"], set(json.load(open(REPO / "brain/index.json"))["vocab"]))
        self.assertTrue(tune.format_proposals(items).startswith("tune:"))


if __name__ == "__main__":
    unittest.main()
