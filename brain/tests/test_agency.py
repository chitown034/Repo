"""The Agency (brain/agency.py): agency-agents placed into departments under Vanessa, with no duplicate seats."""
import unittest

from fixture import REPO  # noqa: E402

from brain import agency  # noqa: E402

ROOT = REPO


def _row(name, division="engineering"):
    return {"name": name, "slug": agency.slugify(name), "division": division, "path": division + "/x.md",
            "description": "d"}


class Placement(unittest.TestCase):
    def setUp(self):
        self.seats = agency._seats(ROOT)
        self.rows = agency.load(ROOT)

    def test_committed_roster_and_page_are_current(self):
        r = agency.check(ROOT)
        self.assertTrue(r["ok"], agency.format_check(r))

    def test_every_agent_has_a_department_led_by_an_executive_under_vanessa(self):
        for r in self.rows:
            self.assertIn(r["department"], agency.LEADS)
            self.assertEqual(r["leadSlug"], agency.LEADS[r["department"]][0])
            self.assertIn(r["leadSlug"], self.seats)
            self.assertEqual(r["model"], "opus")

    def test_duplicates_point_at_real_seats_and_are_not_installed(self):
        for r in self.rows:
            if r["status"] == "duplicate":
                self.assertIn(r["duplicateOf"], self.seats)
            self.assertTrue(r["installAs"].startswith(agency.PREFIX))
        self.assertEqual(len({r["installAs"] for r in self.rows}), len(self.rows))

    def test_rules(self):
        placed = agency.place([_row("Code Reviewer"), _row("Unity Architect", "game-development"),
                               _row("Frontend Developer"), _row("Finance Tracker", "support"),
                               _row("Chief Financial Officer", "specialized"), _row("Grant Writer", "specialized"),
                               _row("Real Estate Buyer & Seller", "specialized"), _row("Loan Officer Assistant", "specialized"),
                               _row("Legal Compliance Checker", "support"), _row("Recruitment Specialist", "specialized")]
                              + [_row(n) for n in sorted((set(agency.OVERRIDES) | set(agency.DUPLICATES) | agency.PARKED)
                                                         - {"Code Reviewer", "Finance Tracker", "Chief Financial Officer",
                                                            "Grant Writer", "Real Estate Buyer & Seller",
                                                            "Loan Officer Assistant", "Legal Compliance Checker",
                                                            "Recruitment Specialist"})],
                              self.seats)
        by = {r["name"]: r for r in placed}
        self.assertEqual(by["Code Reviewer"]["status"], "duplicate")
        self.assertEqual(by["Unity Architect"]["status"], "parked")
        self.assertEqual(by["Frontend Developer"]["status"], "active")
        self.assertEqual(by["Frontend Developer"]["department"], "Technology")
        self.assertEqual(by["Finance Tracker"]["department"], "Finance")

    def test_a_rule_naming_a_missing_seat_or_agent_is_refused(self):
        with self.assertRaises(agency.AgencyError):
            agency.place([_row("Frontend Developer")], self.seats)        # rules name agents not in this roster
        with self.assertRaises(agency.AgencyError):
            agency.place([_row("Frontend Developer"), _row("Frontend Developer")], self.seats)

    def test_a_hand_edited_roster_is_caught(self):
        import json, shutil, tempfile
        from pathlib import Path
        for field, value in (("model", "haiku"), ("installAs", "../../escaped"), ("lead", "Bob"),
                             ("path", "README.md"), ("department", "Finance")):
            with tempfile.TemporaryDirectory() as d:
                d = Path(d)
                for rel in (agency.MANIFEST, agency.PAGE, "integrations/agent-os/agents.json"):
                    (d / rel).parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy(ROOT / rel, d / rel)
                m = json.loads((d / agency.MANIFEST).read_text())
                m["agents"][0][field] = value
                (d / agency.MANIFEST).write_text(json.dumps(m))
                self.assertFalse(agency.check(d)["ok"], field)

    def test_refresh_refuses_a_clone_not_at_the_pinned_commit(self):
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(agency.AgencyError):
                agency.write(ROOT, Path(d))

    def test_summary_counts_add_up(self):
        s = agency.summary(ROOT)
        self.assertEqual(s["active"] + s["duplicate"] + s["parked"], s["total"])
        self.assertEqual(sum(q["active"] for q in s["squads"]), s["active"])
        self.assertEqual(s["reportsTo"], "Vanessa")


if __name__ == "__main__":
    unittest.main()
