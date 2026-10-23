"""Tests for brain/toolkit.py — the zero-token tool register and the panel owner lookup."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from brain import toolkit, graph  # noqa: E402


class ToolkitTests(unittest.TestCase):
    def test_inventory_counts(self):
        inv = toolkit.inventory(ROOT)
        c = inv["counts"]
        self.assertGreaterEqual(c["skill"], 20)
        self.assertGreaterEqual(c["plugin"], 3)
        self.assertGreaterEqual(c["connector"], 10)
        self.assertGreaterEqual(c["routine"], 40)
        self.assertGreaterEqual(c["mactask"], 40)
        self.assertEqual(c["connector_ok"] + c["connector_attention"], c["connector"])

    def test_registers_become_mcp_api_mod_items(self):
        inv = toolkit.inventory(ROOT)
        kinds = {it["kind"] for it in inv["items"]}
        self.assertTrue({"mcp", "api"} <= kinds)
        names = [(it["kind"], it["name"]) for it in inv["items"] if it["kind"] in ("plugin", "mod")]
        self.assertEqual(len(names), len({n for _k, n in names}), "a Claude mod must be counted once (plugin), never also as 'mod'")
        m = {it["name"]: it for it in inv["items"] if it["kind"] == "mcp"}
        self.assertEqual(m["openflowkit"]["state"], "pending"); self.assertEqual(m["laya"]["state"], "ok"); self.assertEqual(m["laya"]["seat"], "Vanessa")
        a = {it["name"]: it for it in inv["items"] if it["kind"] == "api"}
        self.assertEqual(a["TidyCal (tidycal.com/api)"]["state"], "pending"); self.assertEqual(a["Pivo · Ticor Title"]["state"], "none")
        self.assertIn("halt-guard", {it["name"] for it in inv["items"] if it["kind"] == "plugin"})
        self.assertEqual(m["Composio (cloud)"]["state"], "attention")  # "connected — Zoho 403 until…" is not green
        self.assertEqual(m["kapso"]["state"], "attention")
        for it in inv["items"]:
            self.assertNotRegex(it["desc"], r"(?i)token=|bearer [a-z0-9]{8}|api[_-]?key=")
        g = graph.build(ROOT)
        gs = {n["g"] for n in g["nodes"]}
        self.assertTrue({"mcp", "api"} <= gs); self.assertNotIn("mod", gs)

    def test_every_item_has_a_seat(self):
        names = {n for n, _r, _w in toolkit.SEATS}
        for it in toolkit.inventory(ROOT)["items"]:
            self.assertIn(it["seat"], names, it["name"])

    def test_known_assignments(self):
        by = {it["name"]: it["seat"] for it in toolkit.skills(ROOT)}
        self.assertEqual(by["vanessa-orchestrator"], "Vanessa")
        self.assertEqual(by["kevin-mentor"], "Kevin")
        self.assertEqual(by["security-and-hardening"], "Elena")

    def test_owner_lookup(self):
        r = toolkit.owner(ROOT, "marketing drafts")
        self.assertIsNotNone(r)
        self.assertIn("Marketing", r["panel"])
        self.assertIsNone(toolkit.owner(ROOT, "zzqx"))

    def test_graph_has_tool_lobes(self):
        g = graph.build(ROOT)
        kinds = {n["g"] for n in g["nodes"]}
        for k in ("skill", "plugin", "connector", "routine", "mactask"):
            self.assertIn(k, kinds)
        ids = {n["id"] for n in g["nodes"]}
        for l in g["links"]:
            self.assertIn(l["s"], ids); self.assertIn(l["t"], ids)

    def test_write_page(self):
        # never into the real tree: a test that rewrote wiki/ai-team/toolkit.md left CI's index stale (2026-10-23)
        import tempfile
        with tempfile.TemporaryDirectory() as t:
            (Path(t) / "wiki/ai-team").mkdir(parents=True)
            p = toolkit.write_page(Path(t), toolkit.inventory(ROOT))
            self.assertTrue(p.is_file())
            self.assertIn("## Vanessa", p.read_text(encoding="utf-8"))

    def test_committed_toolkit_page_is_current(self):
        # bin/brain reindex regenerates the page; a commit without it is what CI catches, so catch it here first
        import tempfile
        with tempfile.TemporaryDirectory() as t:
            (Path(t) / "wiki/ai-team").mkdir(parents=True)
            fresh = toolkit.write_page(Path(t), toolkit.inventory(ROOT)).read_text(encoding="utf-8")
        self.assertEqual((ROOT / "wiki/ai-team/toolkit.md").read_text(encoding="utf-8"), fresh,
                         "wiki/ai-team/toolkit.md is stale — run bin/brain reindex (it regenerates the page) before committing")


if __name__ == "__main__":
    unittest.main()
