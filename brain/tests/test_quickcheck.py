"""dashboard/tests/quickcheck.py — the cdStateSeed check: skipped on a page with no seed, FAIL on a bad seed, PASS on a
good one (code-validator, 2026-10-22: the skip must never hide a Command Deck regression)."""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QC = ROOT / "dashboard/tests/quickcheck.py"
PAGE = '<html><body><section><div id="a">x</div></section>{seed}<script>var x = 1;</script></body></html>'


def run(seed: str) -> str:
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "page.html"
        p.write_text(PAGE.format(seed=seed), encoding="utf-8")
        return subprocess.run([sys.executable, str(QC), str(p)], capture_output=True, text=True).stdout


@unittest.skipUnless(shutil.which("node"), "quickcheck runs node --check; node is not installed here")
class SeedCheck(unittest.TestCase):
    def test_no_seed_is_skipped(self):
        out = run("")
        self.assertIn("SKIP cdStateSeed", out); self.assertNotIn("FAIL cdStateSeed", out)

    def test_malformed_seed_fails(self):
        self.assertIn("FAIL cdStateSeed", run('<script type="application/json" id="cdStateSeed">{bad</script>'))

    def test_seed_mentioned_but_tag_missing_fails(self):
        self.assertIn("FAIL cdStateSeed", run("<!-- cdStateSeed removed -->"))

    def test_good_seed_passes(self):
        self.assertIn("PASS cdStateSeed", run('<script type="application/json" id="cdStateSeed">{"a": 1}</script>'))


if __name__ == "__main__":
    unittest.main()
