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
        p = toolkit.write_page(ROOT, toolkit.inventory(ROOT))
        self.assertTrue(p.is_file())
        self.assertIn("## Vanessa", p.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
