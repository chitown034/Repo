"""learn (self-promoting synonyms behind a holdout gate) and passages (level 3 inside big documents)."""
import json, os, tempfile, unittest
from pathlib import Path

from fixture import REPO  # noqa: E402

from brain import learn, passages, text  # noqa: E402


class Learn(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory(); self.p = Path(self.t.name) / "learned.json"
        os.environ["BRAIN_LEARNED"] = str(self.p)

    def tearDown(self):
        os.environ.pop("BRAIN_LEARNED", None); text.reload_synonyms(); self.t.cleanup()

    def test_tick_promotes_after_trust_runs_and_demotes_on_regression(self):
        learn.save(REPO, {"candidates": [{"group": ["foo", "bar"], "runs": 0}], "promoted": [], "rejected": [], "baseline": 10})
        for _ in range(learn.TRUST_RUNS - 1):
            r = learn.tick(REPO, 10); self.assertEqual(r["promoted"], [])
        r = learn.tick(REPO, 10); self.assertEqual(r["promoted"], [["foo", "bar"]])
        learn.save(REPO, {"candidates": [{"group": ["baz", "qux"], "runs": 3}], "promoted": [], "rejected": [], "baseline": 10})
        r = learn.tick(REPO, 9); self.assertEqual(r["demoted"], [["baz", "qux"]]); self.assertEqual(learn.load(REPO)["candidates"], [])

    def test_learned_groups_feed_synonyms(self):
        learn.save(REPO, {"candidates": [], "promoted": [{"group": ["zebra", "lofty"]}], "rejected": [], "baseline": 1})
        syn = text.reload_synonyms(str(self.p))
        self.assertIn(text.stem("lofty"), syn.get(text.stem("zebra"), set()))

    def test_handwritten_synonyms_untouched(self):
        before = (REPO / "brain/synonyms.py").read_bytes()
        learn.try_proposals(REPO, max_new=0)
        self.assertEqual(before, (REPO / "brain/synonyms.py").read_bytes())


class Passages(unittest.TestCase):
    def test_never_chunks_clients_or_decisions(self):
        store = passages.build(REPO)
        self.assertTrue(all(not k.startswith("wiki/clients/") and k != "context/decisions.md" for k in store))
        self.assertTrue(store, "expected at least one big document")

    def test_search_returns_scored_passages_with_lines(self):
        ps = passages.search(REPO, "Zoho 403 NO_PERMISSION profile API access", top=2)
        self.assertTrue(ps); self.assertIn("-", ps[0]["lines"]); self.assertGreater(ps[0]["coverage"], 0)
        self.assertTrue(passages.format_passages(ps).startswith("["))


if __name__ == "__main__":
    unittest.main()
