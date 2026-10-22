"""Tests for brain/route.py against the real rules pages (read-only). Run: python3 -m unittest discover -s brain/tests"""

from __future__ import annotations

import unittest

from fixture import REPO  # noqa: E402

from brain import route  # noqa: E402


class RouteTests(unittest.TestCase):
    def plan(self, q):
        return route.route(REPO, q, with_reads=False)

    def test_selftest_all_pass(self):
        r = route.selftest(REPO)
        self.assertGreater(r["total"], 0)
        self.assertEqual(r["misses"], [])

    def test_client_facing_brings_compliance_gate(self):
        p = self.plan("Draft an Instagram post about FHA loans")
        self.assertIn("Alexandra", {g["gate"] for g in p["gates"]})
        self.assertEqual(p["gates"][-1]["gate"], "Vanessa")

    def test_halt_on_send(self):
        self.assertTrue(self.plan("send the disclosure to the borrower")["halts"])
        self.assertFalse(self.plan("what is my budget this month")["halts"])

    def test_waves_respect_limit(self):
        q = ("marketing pipeline compliance security budget automation loan buyer listing coaching "
             "habit estate trade feasibility tool research")
        p = self.plan(q)
        self.assertTrue(all(len(w) <= route.MAX_PARALLEL for w in p["waves"]))
        self.assertGreater(len(p["waves"]), 1)

    def test_validation_gate_follows_engineering(self):
        plan = route.route(REPO, "fix the bug in the dashboard refresh script and add a test")
        self.assertIn("Validation", [g["gate"] for g in plan["gates"]])
        plan2 = route.route(REPO, "write an Instagram caption about Temecula wine country")
        self.assertNotIn("Validation", [g["gate"] for g in plan2["gates"]])

    def test_pod_brings_whole_team_in_parallel(self):
        p = route.route(REPO, "the escrow has an inspection contingency due friday", with_reads=False)
        self.assertIn("Deal Pod", [x["pod"] for x in p["pods"]])
        first = [x["seat"] for x in p["waves"][0]]
        for seat in ("Victor", "Carmen", "Harrison"):
            self.assertIn(seat, first)
        self.assertIn("Alexandra", [g["gate"] for g in p["gates"]])

    def test_two_pods_share_seats_without_duplicates(self):
        p = route.route(REPO, "listing launch marketing campaign for the open house", with_reads=False)
        seats = [x["seat"] for w in p["waves"] for x in w]
        self.assertEqual(len(seats), len(set(seats)))
        self.assertTrue({"Listing Pod", "Growth Pod"} <= {x["pod"] for x in p["pods"]})

    def test_no_match_goes_to_vanessa(self):
        self.assertEqual(self.plan("hello there")["lead"], "Vanessa")


if __name__ == "__main__":
    unittest.main()
