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

    def test_no_match_goes_to_vanessa(self):
        self.assertEqual(self.plan("hello there")["lead"], "Vanessa")


if __name__ == "__main__":
    unittest.main()
