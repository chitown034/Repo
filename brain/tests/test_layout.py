"""brain layout: the brain mapped onto the backend folder structure, and the untested-service rule."""
import unittest
from pathlib import Path

from fixture import REPO

from brain import layout


class LayoutTest(unittest.TestCase):
    def test_real_tree_passes(self):
        r = layout.check(REPO)
        self.assertEqual(r["missing"], [])
        self.assertEqual(r["untested_services"], [])
        self.assertTrue(r["ok"])

    def test_untested_service_is_named(self):
        import tempfile, shutil
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            for paths in layout.LAYERS.values():
                for p in paths:
                    t = root / p
                    if p.endswith("tests"):
                        t.mkdir(parents=True, exist_ok=True)
                    else:
                        t.parent.mkdir(parents=True, exist_ok=True); t.write_text("x", encoding="utf-8")
            (root / layout.REFERENCE).parent.mkdir(parents=True, exist_ok=True)
            (root / layout.REFERENCE).write_text("# ref", encoding="utf-8")
            (root / "brain/tests/test_only_recall.py").write_text("from brain import recall\n", encoding="utf-8")
            r = layout.check(root)
            self.assertEqual(r["missing"], [])
            self.assertIn("brain/ask.py", r["untested_services"])
            self.assertNotIn("brain/recall.py", r["untested_services"])
            self.assertFalse(r["ok"])
            ok, row = layout.doctor_row(root)
            self.assertFalse(ok); self.assertIn("untested services", row)

    def test_format_mentions_every_layer(self):
        text = layout.format_check(layout.check(REPO))
        for layer in layout.LAYERS:
            self.assertIn(layer, text)


if __name__ == "__main__":
    unittest.main()
