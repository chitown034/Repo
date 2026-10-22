"""python3 -m unittest dashboard/brain-4d/test_merge_live.py — merge-live keeps only foreign nodes and stays script-safe."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


def page(g):
    return "<script>\nconst G = " + json.dumps(g) + ";\nconst HUE = { a:\"#111111\" };\n</script>"


class MergeLive(unittest.TestCase):
    def test_foreign_only_and_escaped(self):
        live = {"nodes": [{"id": "wiki/x.md", "t": "renamed away"}, {"id": "vanessa:n1", "t": "evil </script><b>"},
                          {"id": "pod:Old Pod", "t": "retired"}], "links": [{"s": "vanessa:n1", "t": "wiki/y.md"}]}
        mine = {"nodes": [{"id": "wiki/y.md", "t": "new"}], "links": []}
        with tempfile.TemporaryDirectory() as d:
            lp, mp = Path(d, "live.html"), Path(d, "mine.html")
            lp.write_text(page(live)), mp.write_text(page(mine))
            r = subprocess.run([sys.executable, str(HERE / "merge-live.py"), str(lp), str(mp)], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
            out = mp.read_text()
        g = json.loads(out.split("const G = ")[1].split(";\n")[0])
        ids = [n["id"] for n in g["nodes"]]
        self.assertEqual(ids, ["wiki/y.md", "vanessa:n1"])          # renamed page and retired pod stay gone
        self.assertEqual(out.count("</script>"), 1)                   # a title cannot close the script early


if __name__ == "__main__":
    unittest.main()
