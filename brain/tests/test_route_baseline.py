"""Ordinary requests must keep their seat lists: a new lane keyword must not hijack them (validator 2026-11-02)."""
import unittest

from fixture import REPO  # noqa: F401,E402

from brain import route  # noqa: E402

KEEP_OUT = {
    "fix the stop hook in claude code": ["Hook Writer"],
    "install a git pre-commit hook": ["Hook Writer"],
    "review my react hooks": ["Hook Writer"],
    "paint the front door before listing photos": ["Chief of Staff"],
}
MUST_HAVE = {
    "write a hook for a listing reel": "Hook Writer",
    "prep my monday": "Chief of Staff",
    "prep my meeting with a lender": "Calendar Prep",
    "draft a duet brief": "Claude Duet",
}


class RouteBaseline(unittest.TestCase):
    def _seats(self, q):
        return str(route.route(REPO, q))

    def test_keywords_do_not_hijack(self):
        for q, bad in KEEP_OUT.items():
            for seat in bad:
                self.assertNotIn(seat, self._seats(q), q)

    def test_new_lanes_still_reachable(self):
        for q, seat in MUST_HAVE.items():
            self.assertIn(seat, self._seats(q), q)


if __name__ == "__main__":
    unittest.main()
