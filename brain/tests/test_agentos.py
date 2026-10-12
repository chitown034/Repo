"""Agent OS: every roster agent reachable through Laya lane + Jarvis recall + Orca launch command."""
import json
import unittest

from fixture import REPO  # noqa: E402

from brain import agentos, encyclopedia  # noqa: E402

ROOT = REPO


class AgentOS(unittest.TestCase):
    def test_every_roster_agent_reachable(self):
        r = agentos.check(ROOT)
        self.assertEqual(r["reachable"], r["total"])
        self.assertGreaterEqual(r["total"], 172)
        self.assertEqual(r["named_seats_unresolved"], [])

    def test_manifest_current(self):
        self.assertFalse(agentos.check(ROOT)["manifest_stale"], "run bin/brain os write")

    def test_proposal_only_flagged(self):
        m = {a["slug"]: a for a in agentos.build(ROOT)["agents"]}
        self.assertTrue(m["caio-nadia"]["guard"]["proposal_only"])
        self.assertFalse(m["cfo-marcus"]["guard"]["proposal_only"])

    def test_launch_sheet_halts_on_send(self):
        out = agentos.plan_launch(ROOT, "prepare a VA buyer loan scenario in Temecula and email the client")
        self.assertIn("HALT", out)
        self.assertIn("claude --agent", out)
        self.assertIn("Nothing is sent", out)

    def test_encyclopedia_has_entries(self):
        t = encyclopedia.build(ROOT)
        self.assertIn("# Encyclopedia", t)
        self.assertIn("About Steven", t)


if __name__ == "__main__":
    unittest.main()
