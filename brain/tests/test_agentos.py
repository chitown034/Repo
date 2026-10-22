"""Agent OS: every roster agent reachable through Laya lane + Jarvis recall + Orca launch command."""
import json
from pathlib import Path
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


class LaunchJson(unittest.TestCase):
    def test_launch_json_shape_and_halt(self):
        p = agentos.plan_launch_json(ROOT, "have Marcus review the budget and email the client")
        self.assertEqual(p["lead"], "Marcus")
        self.assertTrue(p["halts"])
        cmds = [x["command"] for w in p["waves"] for x in w]
        self.assertIn("claude --agent cfo-marcus", cmds)
        self.assertLessEqual(max(len(w) for w in p["waves"]), p["max_parallel"])

    def test_jarvis_verbs_file(self):
        import json
        d = json.loads((ROOT / "integrations/jarvis/agent-verbs.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(d["verbs"]), 6)
        for v in d["verbs"]:
            self.assertTrue(v["run"].startswith(("bin/brain", "bash integrations/")))
        self.assertIn("pair orca", d["never"])


class AgentFiles(unittest.TestCase):
    def test_every_seat_has_a_file_with_matching_name(self):
        from brain import agentfiles
        r = agentfiles.check(ROOT)
        self.assertEqual(r["present"], r["total"]); self.assertEqual(r["bad_frontmatter"], [])
        t = (ROOT / "integrations/agent-os/agents/caio-nadia.md").read_text(encoding="utf-8")
        self.assertIn("PROPOSAL-ONLY", t); self.assertIn("Needs-Steven", t); self.assertIn("model: opus", t)

    def test_core_seats_in_project_agents(self):
        from brain import agentfiles
        for slug in agentfiles.CORE:
            t = (ROOT / ".claude/agents" / f"{slug}.md").read_text(encoding="utf-8")
            self.assertTrue(t.startswith(f"---\nname: {slug}\n"), slug); self.assertIn(agentfiles.MARK, t)

    def test_write_core_keeps_hand_edited_file(self):
        import tempfile
        from brain import agentfiles, agentos
        m = agentos.build(REPO); lead_of = {a["slug"]: a["lead"] for a in m["agents"]}
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); (root / ".claude/agents").mkdir(parents=True)
            mine = root / ".claude/agents/cfo-marcus.md"; mine.write_text("hand-tuned", encoding="utf-8")
            kept = agentfiles.write_core(root, m, lead_of)
            self.assertEqual(kept, ["cfo-marcus"]); self.assertEqual(mine.read_text(encoding="utf-8"), "hand-tuned")
            self.assertIn("model: fable", (root / ".claude/agents/vanessa-orchestrator.md").read_text(encoding="utf-8"))

    def test_write_core_refreshes_a_stale_generated_file(self):
        import tempfile
        from brain import agentfiles, agentos
        m = agentos.build(REPO); lead_of = {a["slug"]: a["lead"] for a in m["agents"]}
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); (root / ".claude/agents").mkdir(parents=True)
            stale = root / ".claude/agents/cto-derek.md"
            stale.write_text(f"---\nname: cto-derek\nmodel: sonnet\n---\n{agentfiles.MARK}\nold body\n", encoding="utf-8")
            self.assertEqual(agentfiles.write_core(root, m, lead_of), [])
            t = stale.read_text(encoding="utf-8")
            self.assertIn("model: opus", t); self.assertNotIn("old body", t); self.assertEqual(t.count(agentfiles.MARK), 1)

    def test_unknown_model_falls_back_to_sonnet(self):
        from brain import agentfiles, agentos
        a = dict(agentos.build(REPO)["agents"][0]); a["model"] = "Haiku 9"
        self.assertIn("\nmodel: sonnet\n", agentfiles.render(a, {}))
        a["model"] = " FABLE "
        self.assertIn("\nmodel: fable\n", agentfiles.render(a, {}))

    def test_orchestrator_runs_on_fable(self):
        # Tiering (wiki/ai-team/model-tiering-dispatch.md): Vanessa masterminds on Fable, never the worker tier.
        t = (ROOT / "integrations/agent-os/agents/vanessa-orchestrator.md").read_text(encoding="utf-8")
        self.assertIn("model: fable", t)
        self.assertIn("reports to Steven", t)  # never to herself

    def test_engineer_toolkit(self):
        from brain import agentos
        self.assertTrue(agentos.is_engineer("cto-derek", "Derek"))
        self.assertTrue(agentos.is_engineer("code-validator", "Derek"))
        self.assertTrue(agentos.is_engineer("sandbox-qa", "Elon"))
        self.assertTrue(agentos.is_engineer("anything", "Elon"))
        self.assertFalse(agentos.is_engineer("cfo-marcus", "Marcus"))
        m = agentos.build(REPO)
        by = {a["slug"]: a for a in m["agents"]}
        self.assertTrue(by["code-validator"]["toolkit"])
        self.assertEqual(by["cfo-marcus"]["toolkit"], [])
        from brain import agentfiles
        self.assertNotIn("Toolkit", agentfiles.render(by["cfo-marcus"], {}))
        self.assertIn("Toolkit", agentfiles.render(by["code-validator"], {}))

