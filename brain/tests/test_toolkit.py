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


class SeatCardTests(unittest.TestCase):
    def test_owner_pins_follow_the_org_chart(self):
        inv = toolkit.inventory(ROOT)
        seat = {it["name"]: it["seat"] for it in inv["items"] if it["kind"] == "skill"}
        self.assertEqual(seat["loan-pricing-agent"], "Victor")
        self.assertEqual(seat["tax-assessor-agent"], "Victor")
        self.assertEqual(toolkit._owner({"name": "Fieldy (meeting recorder)", "seat": "Derek"}), "Vanessa")
        self.assertEqual(toolkit._owner({"name": "Fieldyish", "seat": "Derek"}), "Derek")

    def test_cards_name_models_lanes_and_pods(self):
        cards = toolkit.seat_cards(ROOT, toolkit.inventory(ROOT))
        row = {ln.split("|")[1].strip(" *"): ln for ln in cards.splitlines()[2:]}
        self.assertIn("Fable 5.1", row["Vanessa"])
        self.assertIn("proposal-only", row["Nadia"]); self.assertIn("proposal-only", row["Elon"])
        self.assertIn("Opus 5.5", row["Sofia"]); self.assertIn("Client Care", row["Sofia"])
        self.assertIn("`refi-watch`", row["Victor"])

    def test_write_cards_only_between_markers(self):
        import shutil
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            for rel in (toolkit.ORG_CHART, "integrations/agent-os/agents.json"):
                (root / rel).parent.mkdir(parents=True, exist_ok=True); shutil.copy(ROOT / rel, root / rel)
            inv = toolkit.inventory(ROOT)
            self.assertTrue(toolkit.write_cards(root, inv))
            once = (root / toolkit.ORG_CHART).read_text(encoding="utf-8")
            self.assertTrue(toolkit.write_cards(root, inv))
            self.assertEqual(once, (root / toolkit.ORG_CHART).read_text(encoding="utf-8"))
            self.assertIn("## The shape", once)
            swapped = f"x\n{toolkit.CARDS_END}\nkeep\n{toolkit.CARDS_BEGIN}\ny\n"
            (root / toolkit.ORG_CHART).write_text(swapped, encoding="utf-8")
            self.assertFalse(toolkit.write_cards(root, inv))
            self.assertEqual((root / toolkit.ORG_CHART).read_text(encoding="utf-8"), swapped)
            (root / toolkit.ORG_CHART).write_text(once, encoding="utf-8")
            (root / "integrations/agent-os/agents.json").write_text("<<<<<<< conflict", encoding="utf-8")
            self.assertFalse(toolkit.write_cards(root, inv))
            self.assertEqual((root / toolkit.ORG_CHART).read_text(encoding="utf-8"), once)
            (root / toolkit.ORG_CHART).write_text("# no markers\n", encoding="utf-8")
            self.assertFalse(toolkit.write_cards(root, inv))
            self.assertEqual((root / toolkit.ORG_CHART).read_text(encoding="utf-8"), "# no markers\n")


if __name__ == "__main__":
    unittest.main()
