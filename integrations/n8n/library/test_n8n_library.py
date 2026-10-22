import json, os, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import n8n_library as L


def wf(name, nodes):
    return {"name": name, "active": True, "nodes": [{"type": "n8n-nodes-base." + t, "name": t, **extra} for t, extra in nodes], "connections": {}}


class Lib(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.TemporaryDirectory(); r = Path(self.t.name) / "w"; (r / "A").mkdir(parents=True)
        files = {"safe.json": wf("Calendly to Notion", [("calendlyTrigger", {}), ("notion", {"credentials": {"notionApi": {"id": "1"}}})]),
                 "shell.json": wf("Run it", [("webhook", {"parameters": {}}), ("executeCommand", {})]),
                 "auth.json": wf("Authed hook", [("webhook", {"parameters": {"authentication": "headerAuth"}}), ("set", {})]),
                 "secret.json": wf("Leaky", [("httpRequest", {"parameters": {"k": "ghp_" + "a" * 36}})])}
        for k, v in files.items(): (r / "A" / k).write_text(json.dumps(v))
        (r / "A" / "bad.json").write_text("not json"); self.root = r
        L.INDEX = Path(self.t.name) / "idx.json"; L.build_index(r)

    def tearDown(self): self.t.cleanup()

    def flags(self, rel): return next(i for i in L.load()["items"] if i["path"] == rel)["flags"]

    def test_flags(self):
        self.assertIn("execute_command", self.flags("A/shell.json")); self.assertIn("unauth_webhook", self.flags("A/shell.json"))
        self.assertNotIn("unauth_webhook", self.flags("A/auth.json")); self.assertIn("secret_shape", self.flags("A/secret.json"))
        self.assertIn("may_write", self.flags("A/safe.json"))

    def test_bad_json_skipped(self): self.assertEqual(len(L.load()["items"]), 4)

    def test_safe_filter(self):
        rows, _ = L.find([], safe=True); paths = {r["path"] for r in rows}
        self.assertEqual(paths, {"A/safe.json", "A/auth.json"})

    def test_stage_inactive_no_credentials_and_refusal(self):
        d = L.stage("A/safe.json", Path(self.t.name) / "out"); j = json.loads(d.read_text())
        self.assertFalse(j["active"]); self.assertTrue(j["name"].startswith("[STAGED inactive]"))
        self.assertTrue(all("credentials" not in n for n in j["nodes"]))
        with self.assertRaises(SystemExit): L.stage("A/shell.json", Path(self.t.name) / "out")
        with self.assertRaises(SystemExit): L.stage("A/secret.json", Path(self.t.name) / "out")
        L.stage("A/shell.json", Path(self.t.name) / "out", reviewed=True)


if __name__ == "__main__":
    unittest.main()
