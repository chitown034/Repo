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

    def test_card_rows_feed_the_6d_seat_lens(self):
        rows = {r["seat"]: r for r in toolkit.seat_card_rows(ROOT, toolkit.inventory(ROOT))}
        self.assertEqual(rows["Vanessa"]["model"], "Fable 5.1")
        self.assertTrue(rows["Nadia"]["proposal_only"]); self.assertFalse(rows["Victor"]["proposal_only"])
        self.assertIn("refi-watch", rows["Victor"]["skills"])
        for r in rows.values():
            self.assertTrue(all(len(c) == 2 for c in r["connectors"]))
            self.assertIsInstance(r["pods"], list)
        page = (ROOT / "dashboard/brain-4d/template.html").read_text(encoding="utf-8")
        self.assertIn("const C = S.c;", page)

    def test_card_rows_survive_a_partial_manifest_entry(self):
        import json
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); (root / "integrations/agent-os").mkdir(parents=True)
            agents = json.loads((ROOT / "integrations/agent-os/agents.json").read_text(encoding="utf-8"))
            agents["agents"].append({"slug": "half-merged"})          # no laya, no model
            agents["agents"].append({"laya": {"lane": "Victor"}})      # no slug
            (root / "integrations/agent-os/agents.json").write_text(json.dumps(agents), encoding="utf-8")
            rows = {r["seat"]: r for r in toolkit.seat_card_rows(root, toolkit.inventory(ROOT))}
        self.assertEqual(rows["Vanessa"]["model"], "Fable 5.1")

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


class ConnectorRegisterMerge(unittest.TestCase):
    """A partial status report appended to CONNECTIONS.md updates the register row by row; it never shrinks it (2026-10-23)."""

    def _root(self, text: str) -> Path:
        import tempfile
        t = Path(tempfile.mkdtemp()); (t / "integrations").mkdir(); (t / "integrations/CONNECTIONS.md").write_text(text, encoding="utf-8")
        self.addCleanup(lambda: __import__("shutil").rmtree(t, ignore_errors=True)); return t

    BASE = ("## Connection status — consolidated, 2026-10-23 13:10 UTC\n\n| Connection | Status today | Fix | Who |\n|---|---|---|---|\n"
            "| Lofty | key file step 7b; no key on the Mac yet | make the key | Steven |\n| Pivo | no API — tour link only | — | — |\n"
            "| Mac runner (all Mac tasks) | silent since Oct 13 | restart | Steven |\n")
    LATER = ("\n## Connection status — Mac 1 report #3, 2026-10-23 11:16 PT\n\n| Connection | Status today | Fix | Who |\n|---|---|---|---|\n"
             "| Lofty | connected — Lofty's own MCP signed in | — | — |\n| Mac runner (all Mac tasks) | healthy — 42 ok (the \"silent since Oct 13\" reading was wrong) | — | — |\n")
    OLD = "## Connection status — checked live 2026-10-20\n\n| Connection | Status today | Fix | Who |\n|---|---|---|---|\n| Python on Mac 2 | attention — second attempt | — | — |\n\n"

    def test_later_partial_section_overrides_rows_and_keeps_the_rest(self):
        c = {x["name"]: x for x in toolkit.connectors(self._root(self.OLD + self.BASE + self.LATER))}
        self.assertEqual(set(c), {"Lofty", "Pivo", "Mac runner (all Mac tasks)"}, "rows before the consolidated section stay out; Pivo is kept")
        self.assertEqual(c["Lofty"]["state"], "ok"); self.assertEqual(c["Mac runner (all Mac tasks)"]["state"], "ok", "healthy wins over a quoted 'silent'")
        self.assertEqual(c["Pivo"]["state"], "attention")

    def test_without_a_consolidated_section_only_the_last_one_counts(self):
        c = toolkit.connectors(self._root(self.OLD + self.LATER.lstrip()))
        self.assertEqual({x["name"] for x in c}, {"Lofty", "Mac runner (all Mac tasks)"})

    def test_same_connection_named_differently_counts_once(self):
        self.assertEqual(toolkit._conn_key("Lofty CRM"), toolkit._conn_key("Lofty (developer.lofty.com)"))
        self.assertEqual(toolkit._conn_key("Inkbox iMessage line"), toolkit._conn_key("iMessage line (morning brief text + voice)"))

    def test_different_machines_and_same_section_rows_never_merge(self):
        self.assertNotEqual(toolkit._conn_key("AnyDesk (Mac 1, Mac 2)"), toolkit._conn_key("AnyDesk (Alienware, tablet, phone)"))
        self.assertNotEqual(toolkit._conn_key("Jarvis · Laya · Orca (Mac 1)"), toolkit._conn_key("Jarvis · Laya · Orca (Mac 2)"))
        self.assertEqual(toolkit._conn_key("AnyDesk (Mac 1, Mac 2)"), toolkit._conn_key("AnyDesk on Mac 1 and Mac 2"))
        text = ("## Connection status — consolidated\n\n| Connection | Status today | Fix | Who |\n|---|---|---|---|\n"
                "| Kapso (Mac 1) | keys saved | — | — |\n| Kapso webhooks (Pabbly → Kapso) | pending — not pasted | — | — |\n")
        names = {x["name"] for x in toolkit.connectors(self._root(text))}
        self.assertEqual(names, {"Kapso (Mac 1)", "Kapso webhooks (Pabbly → Kapso)"}, "two rows of one section stay two connections")

