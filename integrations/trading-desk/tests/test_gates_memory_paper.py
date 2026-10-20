import copy
import csv
import dataclasses
import inspect
import json
import os
import sqlite3
import tempfile
import unittest

import _deskpath  # noqa: F401
from _deskpath import strat, always_long, make_bars, flat_rows, spec
from desk import gates, backtest as bt
from desk.cli import main as cli_main
from desk.data import synthetic_bars, write_csv
from desk.loop import selftest
from desk.memory import Memory, DEFAULT_PATH
from desk.paper import PaperTrader
from desk.strategy import Strategy


def good_result(rules=None):
    rules = rules or gates.Rules()
    m_is = {"total_trades": 45, "win_rate": 0.45, "profit_factor": 1.6, "sharpe": 1.1, "max_drawdown": 0.12,
            "return_after_costs": 0.20, "bars": 700}
    m_oos = {"total_trades": 18, "win_rate": 0.44, "profit_factor": 1.4, "sharpe": 0.9, "max_drawdown": 0.10,
             "return_after_costs": 0.08, "bars": 300}
    return {"rules_hash": rules.hash(), "in_sample": m_is, "oos": m_oos}


class TestGates(unittest.TestCase):
    def test_pass_case(self):
        v = gates.evaluate(good_result())
        self.assertEqual(v["verdict"], "PASS", v)
        self.assertEqual(v["reasons"], [])

    def fail_with(self, mutate, expect):
        r = good_result()
        mutate(r)
        v = gates.evaluate(r)
        self.assertEqual(v["verdict"], "FAIL")
        self.assertTrue(any(expect in x for x in v["reasons"]), v["reasons"])
        return v

    def test_fail_tiny_sample_in_and_oos(self):
        v = self.fail_with(lambda r: r["in_sample"].update(total_trades=29), "tiny sample")
        self.assertIn("tiny sample", v["flags"])
        self.fail_with(lambda r: r["oos"].update(total_trades=9), "tiny sample")

    def test_boundary_trade_counts_pass(self):
        r = good_result()
        r["in_sample"]["total_trades"], r["oos"]["total_trades"] = 30, 10
        self.assertEqual(gates.evaluate(r)["verdict"], "PASS")

    def test_fail_unprofitable_in_sample_and_oos(self):
        self.fail_with(lambda r: r["in_sample"].update(return_after_costs=-0.01), "in-sample")
        self.fail_with(lambda r: r["oos"].update(return_after_costs=-0.01), "out-of-sample")

    def test_fail_profit_factor_drawdown_sharpe(self):
        self.fail_with(lambda r: r["oos"].update(profit_factor=1.19), "profit factor")
        self.fail_with(lambda r: r["in_sample"].update(max_drawdown=0.26), "drawdown")
        self.fail_with(lambda r: r["oos"].update(max_drawdown=0.30), "drawdown")
        self.fail_with(lambda r: r["oos"].update(sharpe=0.4), "sharpe")

    def test_suspiciously_perfect_flags(self):
        for key, val in (("win_rate", 0.95), ("profit_factor", 6.0), ("sharpe", 4.5)):
            v = self.fail_with(lambda r: r["in_sample"].update({key: val}), "suspiciously perfect")
            self.assertIn("suspiciously perfect", v["flags"])

    def test_overfit_flag(self):
        v = self.fail_with(lambda r: r["oos"].update(return_after_costs=0.005), "overfit")
        self.assertIn("overfit", v["flags"])

    def test_malformed_result_fails_closed(self):
        r = good_result()
        del r["oos"]["sharpe"]
        self.assertEqual(gates.evaluate(r)["verdict"], "FAIL")
        self.assertEqual(gates.evaluate({})["verdict"], "FAIL")

    def test_rules_are_frozen(self):
        with self.assertRaises(dataclasses.FrozenInstanceError):
            gates.DEFAULT_RULES.min_trades_oos = 1
        with self.assertRaises(dataclasses.FrozenInstanceError):
            gates.Rules().max_drawdown = 0.9

    def test_rules_hash_is_stable_and_sensitive(self):
        self.assertEqual(gates.Rules().hash(), gates.Rules().hash())
        self.assertNotEqual(gates.Rules().hash(), gates.Rules(max_drawdown=0.5).hash())

    def test_evaluate_rejects_result_made_under_different_rules(self):
        r = good_result()
        r["oos"]["total_trades"] = 5      # would fail under defaults ...
        loose = gates.Rules(min_trades_oos=1)   # ... so someone loosens the rules afterwards
        v = gates.evaluate(r, loose)
        self.assertEqual(v["verdict"], "FAIL")
        self.assertIn("RULES_HASH_MISMATCH", v["reasons"][0])

    def test_evaluate_has_no_override_parameters(self):
        self.assertEqual(list(inspect.signature(gates.evaluate).parameters), ["strategy_result", "rules"])

    def test_constants_match_spec(self):
        r = gates.Rules()
        self.assertEqual((r.min_trades_in_sample, r.min_trades_oos, r.min_profit_factor_oos, r.max_drawdown,
                          r.min_sharpe_oos), (30, 10, 1.2, 0.25, 0.5))

    def test_full_evaluation_result_checks_against_pinned_hash(self):
        bars = synthetic_bars(seed=14, n=1000, vol=0.015, momentum=0.2)
        rules = gates.Rules()
        res = bt.full_evaluation(bars, strat(), rules.hash(), mc_runs=50)
        self.assertIn(gates.evaluate(res, rules)["verdict"], ("PASS", "FAIL"))
        self.assertNotIn("RULES_HASH_MISMATCH", " ".join(gates.evaluate(res, rules)["reasons"]))
        self.assertIn("RULES_HASH_MISMATCH", " ".join(gates.evaluate(res, gates.Rules(max_drawdown=0.9))["reasons"]))


class MemBase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = os.path.join(self.tmp.name, "m.sqlite3")
        self.mem = Memory(self.path)
        self.addCleanup(self.mem.close)

    def rec(self, s, verdict="FAIL", why="no edge", dnr="dont", gate_extra=None):
        gate = {"verdict": verdict, "reasons": [why], "flags": [], "rules_hash": "h"}
        return self.mem.record(s, {"max_drawdown": 0.1, "return_after_costs": -0.02}, {"max_drawdown": 0.2,
                               "return_after_costs": 0.05, "sharpe": 0.7}, None, why, dnr, "next", gate=gate)


class TestMemory(MemBase):
    def test_never_deletes_no_api(self):
        bad = ("delete", "remove", "drop", "purge", "truncate", "update", "clear", "erase")
        names = [n for n in dir(Memory) if not n.startswith("_")]
        self.assertFalse([n for n in names if any(b in n.lower() for b in bad)], names)

    def test_sqlite_triggers_abort_delete_and_update(self):
        self.rec(strat())
        for t in ("strategies", "results", "lessons"):
            with self.assertRaises(sqlite3.DatabaseError):
                self.mem._db.execute("DELETE FROM %s" % t)
        with self.assertRaises(sqlite3.DatabaseError):
            self.mem._db.execute("UPDATE strategies SET name='x'")
        with self.assertRaises(sqlite3.DatabaseError):
            self.mem._db.execute("UPDATE results SET payload_json='{}'")
        # a second raw connection (no Python wrapper) is blocked too, because triggers live in the file
        other = sqlite3.connect(self.path)
        with self.assertRaises(sqlite3.DatabaseError):
            other.execute("DELETE FROM lessons")
        other.close()
        self.assertEqual(self.mem.stats()["tested"], 1)

    def test_default_path_is_outside_repo(self):
        self.assertTrue(DEFAULT_PATH.endswith(".config/trading-desk/memory.sqlite3"))
        self.assertTrue(DEFAULT_PATH.startswith(os.path.expanduser("~")))

    def test_failures_are_stored_and_survive_reopen(self):
        s = strat()
        self.rec(s, "FAIL")
        self.mem.close()
        again = Memory(self.path)
        self.addCleanup(again.close)
        self.assertEqual(again.status(s), "FAIL")
        self.assertEqual(again.stats()["rejected_before_paper"], 1)

    def test_status_uses_latest_gate_and_untested_is_none(self):
        s = strat()
        self.assertIsNone(self.mem.status(s))
        self.rec(s, "FAIL")
        self.rec(s, "PASS")
        self.assertEqual(self.mem.status(s), "PASS")

    def test_exact_duplicate_detected(self):
        self.rec(strat())
        d = self.mem.find_duplicates(strat())
        self.assertEqual(d[0]["match"], "identical_spec")

    def test_renamed_duplicate_detected(self):
        self.rec(strat(name="Golden Cross Alpha"))
        d = self.mem.find_duplicates(strat(name="Totally Unrelated Title", hypothesis="new words"))
        self.assertEqual(len(d), 1)
        self.assertEqual(d[0]["match"], "identical_spec")
        self.assertEqual(d[0]["name"], "Golden Cross Alpha")

    def test_similar_by_name_or_near_params(self):
        self.rec(strat(name="SMA cross trend follower"))
        by_name = self.mem.find_duplicates(strat(name="SMA cross trend follower v2", params={"fast": 5, "slow": 60}))
        self.assertEqual(by_name[0]["match"], "similar")
        near = self.mem.find_duplicates(strat(name="zzz", params={"fast": 10, "slow": 31}))
        self.assertEqual(near[0]["match"], "similar")
        far = self.mem.find_duplicates(strat(name="zzz", params={"fast": 5, "slow": 80}))
        self.assertEqual(far, [])

    def test_different_market_is_not_a_duplicate(self):
        self.rec(strat())
        self.assertEqual(self.mem.find_duplicates(strat(market="OTHER")), [])

    def test_previously_failed_returns_reason(self):
        self.rec(strat(), "FAIL", why="OOS profit factor 0.8 < 1.2", dnr="Do not retry 10/30 SMA on SYN")
        w = self.mem.previously_failed(strat(name="renamed"))
        self.assertEqual(len(w), 1)
        self.assertIn("profit factor", w[0]["why"])
        self.assertIn("Do not retry", w[0]["do_not_repeat"])
        self.rec(strat(name="winner", params={"fast": 3, "slow": 90}), "PASS", why="ok")
        self.assertEqual(self.mem.previously_failed(strat(name="winner", params={"fast": 3, "slow": 90})), [])

    def test_stats(self):
        a, b = strat(), strat(name="b", params={"fast": 3, "slow": 90})
        self.rec(a, "FAIL")
        sid = self.rec(b, "PASS")
        self.mem.add_paper_result(sid, {"gap": 0.01})
        self.mem.add_paper_result(sid, {"gap": 0.03})
        self.mem.log_duplicate_prevented(sid, "dup")
        st = self.mem.stats()
        self.assertEqual((st["tested"], st["rejected_before_paper"], st["passed"], st["duplicates_prevented"]),
                         (2, 1, 1, 1))
        self.assertAlmostEqual(st["avg_oos_return_after_costs"], 0.05)
        self.assertAlmostEqual(st["worst_max_drawdown"], 0.2)
        self.assertAlmostEqual(st["backtest_vs_paper_gap"], 0.02)


class TestPaperTrader(MemBase):
    def setUp(self):
        super().setUp()
        self.log = os.path.join(self.tmp.name, "paper.csv")
        self.bars = synthetic_bars(seed=11, n=600, vol=0.015, momentum=0.2)
        self.s = strat()

    def trader(self, **kw):
        return PaperTrader(self.mem, log_path=self.log, **kw)

    def test_blocks_untested_and_failed_strategy(self):
        out = self.trader().trade(self.s, self.bars)
        self.assertTrue(out.startswith("TRADE BLOCKED"), out)
        self.assertIn("untested", out)
        self.rec(self.s, "FAIL")
        out = self.trader().trade(self.s, self.bars)
        self.assertTrue(out.startswith("TRADE BLOCKED") and "FAIL" in out)
        self.assertFalse(os.path.exists(self.log))

    def test_blocks_missing_or_bad_data(self):
        self.rec(self.s, "PASS")
        for bad in ([], None, [{"date": "2020-01-01"}]):
            out = self.trader().trade(self.s, bad)
            self.assertTrue(str(out).startswith("TRADE BLOCKED: required data"), out)
        self.assertTrue(self.trader().trade(self.s, self.bars[:40]).startswith("TRADE BLOCKED"))

    def test_blocks_excess_risk(self):
        self.rec(self.s, "PASS")
        for r in (0.02, 0.0, -0.01):
            out = self.trader(risk_per_trade=r).trade(self.s, self.bars)
            self.assertTrue(out.startswith("TRADE BLOCKED") and "risk" in out, out)

    def test_trades_logged_with_required_columns_and_limits(self):
        self.rec(self.s, "PASS")
        res = self.trader().trade(self.s, self.bars, expected_return_per_bar=0.0001)
        self.assertEqual(res["status"], "OK")
        self.assertIn("no orders", res["mode"])
        with open(self.log) as fh:
            rows = list(csv.DictReader(fh))
        self.assertEqual(len(rows), res["trades"])
        for col in ("entry_date", "exit_date", "stop", "target", "fees", "slippage", "pnl"):
            self.assertIn(col, rows[0])
        self.assertIsNotNone(res["gap"])
        res2 = bt.run_backtest(self.bars, self.s, trade_from=len(self.bars) - 120)
        for t in res2["trades"]:
            self.assertLessEqual(t["position_value"], t["equity_at_entry"] * (1 + 1e-9))
            self.assertLessEqual(t["risk_amount"], 0.01 * t["equity_at_entry"] * (1 + 1e-9))

    def test_one_open_position_per_strategy(self):
        s = strat(name="al", entry={"type": "always_long"}, params={"warmup": 100})
        self.rec(s, "PASS")
        flat = make_bars(flat_rows(120))
        t = self.trader()
        first = t.trade(s, flat)
        self.assertEqual(first["status"], "OK")
        self.assertTrue(first["open_at_end"] and t.has_open(s))
        out = t.trade(s, flat)
        self.assertTrue(out.startswith("TRADE BLOCKED") and "one open" in out, out)


class TestNoNetworkOrBroker(unittest.TestCase):
    FORBIDDEN = ["requests", "urllib", "socket", "http", "alpaca", "ibkr", "order(", "eval(", "exec(",
                 "subprocess", "os.system"]
    WHITELIST = {}   # {(filename, word): reason}. Intentionally empty: the package has no such words at all.

    def test_package_source_has_no_network_or_broker_code(self):
        pkg = os.path.join(_deskpath.ROOT, "desk")
        files = [f for f in os.listdir(pkg) if f.endswith(".py")]
        self.assertGreaterEqual(len(files), 9)
        hits = []
        for f in files:
            with open(os.path.join(pkg, f), encoding="utf-8") as fh:
                src = fh.read().lower()
            for w in self.FORBIDDEN:
                if w in src and (f, w) not in self.WHITELIST:
                    hits.append((f, w))
        self.assertEqual(hits, [])


class TestCliAndSelftest(unittest.TestCase):
    def test_selftest_passes(self):
        import io
        import contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            self.assertTrue(selftest())
        self.assertIn("SYNTHETIC", buf.getvalue())
        self.assertIn("SELFTEST RESULT: PASS", buf.getvalue())

    def test_run_command_writes_report_and_blocks_duplicate(self):
        import io
        import contextlib
        with tempfile.TemporaryDirectory() as tmp:
            csv_p, spec_p = os.path.join(tmp, "SYNTHETIC.csv"), os.path.join(tmp, "s.json")
            write_csv(synthetic_bars(seed=11, n=900, vol=0.015, momentum=0.2), csv_p)
            with open(spec_p, "w") as fh:
                json.dump(spec(), fh)
            rep = os.path.join(tmp, "desk-report.json")
            argv = ["run", "--data", csv_p, "--strategy", spec_p, "--memory", os.path.join(tmp, "m.db"),
                    "--report", rep, "--paper-log", os.path.join(tmp, "p.csv")]
            with contextlib.redirect_stdout(io.StringIO()) as out:
                self.assertEqual(cli_main(argv), 0)
            first = json.loads(out.getvalue())
            self.assertEqual(first["status"], "TESTED")
            with open(rep) as fh:
                report = json.load(fh)
            for k in ("tested", "rejected_before_paper", "oos_perf", "max_dd", "after_costs",
                      "duplicates_prevented", "backtest_vs_paper_gap"):
                self.assertIn(k, report)
            self.assertEqual(report["tested"], 1)
            with contextlib.redirect_stdout(io.StringIO()) as out2:
                cli_main(argv)
            self.assertEqual(json.loads(out2.getvalue())["status"], "DUPLICATE_BLOCKED")
            with open(rep) as fh:
                self.assertEqual(json.load(fh)["duplicates_prevented"], 1)
            with contextlib.redirect_stdout(io.StringIO()) as out3:
                self.assertEqual(cli_main(["report", "--memory", os.path.join(tmp, "m.db")]), 0)
            self.assertEqual(json.loads(out3.getvalue())["tested"], 1)

    def test_run_command_bad_data_exits_nonzero(self):
        import io
        import contextlib
        with tempfile.TemporaryDirectory() as tmp:
            bad = os.path.join(tmp, "bad.csv")
            with open(bad, "w") as fh:
                fh.write("date,open\n")
            with open(os.path.join(tmp, "s.json"), "w") as fh:
                json.dump(spec(), fh)
            with contextlib.redirect_stderr(io.StringIO()):
                rc = cli_main(["run", "--data", bad, "--strategy", os.path.join(tmp, "s.json"),
                               "--memory", os.path.join(tmp, "m.db")])
            self.assertEqual(rc, 2)

    def test_sample_spec_is_valid(self):
        d = os.path.join(_deskpath.ROOT, "samples")
        files = [f for f in os.listdir(d) if f.endswith(".json")]
        self.assertTrue(files)
        for f in files:
            with open(os.path.join(d, f)) as fh:
                Strategy.from_dict(json.load(fh))


if __name__ == "__main__":
    unittest.main()
