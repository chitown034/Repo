"""The harness (brain/harness.py): tracing, retries policy, budget, circuit breaker, kill switch, self-tests."""
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fixture import REPO  # noqa: E402

from brain import harness  # noqa: E402

T0 = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)


class Harness(unittest.TestCase):
    def setUp(self):
        self._d = tempfile.TemporaryDirectory()
        self.root = Path(self._d.name)

    def tearDown(self):
        self._d.cleanup()

    def test_trace_appends_and_rejects_bad_input(self):
        harness.trace(self.root, "6d-rebuild", "ok", note="n", ms=5, now=T0)
        self.assertEqual(len(harness.traces(self.root)), 1)
        with self.assertRaises(harness.HarnessError):
            harness.trace(self.root, "Bad Name!", "ok")
        with self.assertRaises(harness.HarnessError):
            harness.trace(self.root, "x", "maybe")

    def test_breaker_opens_after_three_failures_and_resets(self):
        for i in range(3):
            harness.trace(self.root, "sync", "fail", now=T0 + timedelta(minutes=i))
        code, msg = harness.check(self.root, "sync", now=T0 + timedelta(hours=1))
        self.assertEqual(code, 4, msg)
        harness.reset(self.root, "sync", now=T0 + timedelta(minutes=5))
        self.assertEqual(harness.check(self.root, "sync", now=T0 + timedelta(hours=1))[0], 0)

    def test_success_closes_the_breaker(self):
        for i in range(3):
            harness.trace(self.root, "sync", "fail", now=T0 + timedelta(minutes=i))
        harness.trace(self.root, "sync", "ok", now=T0 + timedelta(minutes=9))
        self.assertFalse(harness.breaker(self.root, "sync")["open"])

    def test_kill_switch_named_and_all(self):
        harness.kill(self.root, "sweep", "runaway", now=T0)
        self.assertEqual(harness.check(self.root, "sweep", now=T0)[0], 3)
        self.assertEqual(harness.check(self.root, "other", now=T0)[0], 0)
        harness.kill(self.root, None, "stop everything", now=T0)
        self.assertEqual(harness.check(self.root, "other", now=T0)[0], 3)
        harness.kill(self.root, None, "", release=True, now=T0)
        harness.kill(self.root, "sweep", "", release=True, now=T0)
        self.assertEqual(harness.check(self.root, "sweep", now=T0)[0], 0)
        with self.assertRaises(harness.HarnessError):
            harness.kill(self.root, "sweep", "   ")

    def test_budget_refuses_after_the_day_quota(self):
        for i in range(harness.budget_for("job")):
            harness.trace(self.root, "job", "ok", now=T0 + timedelta(minutes=i))
        self.assertEqual(harness.check(self.root, "job", now=T0 + timedelta(hours=1))[0], 5)
        self.assertEqual(harness.check(self.root, "job", now=T0 + timedelta(days=1))[0], 0)

    def test_unreadable_kill_switch_fails_closed(self):
        (self.root / harness.DIR).mkdir(parents=True)
        for bad in ("garbage", "[1]", '{"names":"job"}'):
            (self.root / harness.KILL).write_text(bad)
            self.assertEqual(harness.check(self.root, "job", now=T0)[0], 3, bad)

    def test_breaker_uses_time_not_line_order(self):
        (self.root / harness.DIR).mkdir(parents=True)
        lines = [{"ts": "2026-11-22T13:00:00Z", "name": "job", "status": "ok"}] + [{"ts": f"2026-11-22T09:0{i}:00Z", "name": "job", "status": "fail"} for i in range(3)]
        (self.root / harness.TRACE).write_text("\n".join(json.dumps(x) for x in lines) + "\n")
        self.assertFalse(harness.breaker(self.root, "job")["open"])
        (self.root / harness.RESETS).write_text('{"job": 9}')
        for i in range(3):
            harness.trace(self.root, "job", "fail", now=T0 + timedelta(hours=2, minutes=i))
        self.assertTrue(harness.breaker(self.root, "job")["open"])

    def test_malformed_state_files_do_not_crash(self):
        (self.root / harness.DIR).mkdir(parents=True)
        (self.root / harness.TRACE).write_text('[1]\n{"name":5}\nnot json\n{"ts":"x","name":"a","status":"ok"}\n')
        self.assertEqual(harness.check(self.root, "a", now=T0)[0], 0)

    def test_status_on_the_repo(self):
        s = harness.status(REPO)
        self.assertIn("kill_switch", s)
        self.assertEqual(s["policy"]["retries"], 2)
        self.assertIn("doctor", s["selftests"])
        self.assertTrue(harness.format_status(s).startswith("harness "))


if __name__ == "__main__":
    unittest.main()
