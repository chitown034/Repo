import csv
import os
import tempfile
import unittest

import _deskpath  # noqa: F401
from _deskpath import strat, spec, make_bars, flat_rows, always_long
from desk import backtest as bt
from desk.data import synthetic_bars
from desk.strategy import Strategy


def crash_bars():
    """20 flat bars (ATR=2), entry bar 21 at open 100, then a bar that trades down through the stop."""
    rows = flat_rows(22) + [(100, 100, 95, 96)] + flat_rows(5, 96)
    return make_bars(rows)


class TestFillsAndStops(unittest.TestCase):
    def test_entry_fills_at_next_bar_open_not_signal_close(self):
        bars = synthetic_bars(seed=21, n=600, vol=0.02, momentum=0.2)
        r = bt.run_backtest(bars, strat(), fee_bps=0, slippage_bps=10)
        self.assertGreater(len(r["trades"]), 3)
        by_date = {b["date"]: i for i, b in enumerate(bars)}
        st = strat().stance(bars)
        for t in r["trades"]:
            i = by_date[t["entry_date"]]
            raw_open = bars[i]["open"]
            expect = raw_open * (1.001 if t["side"] == "long" else 0.999)
            self.assertAlmostEqual(t["entry_price"], expect, places=9)
            self.assertNotEqual(st[i - 1], 0, "entry bar must follow a live signal bar")

    def test_stop_exit_and_one_percent_risk(self):
        r = bt.run_backtest(crash_bars(), always_long(), fee_bps=0, slippage_bps=0)
        t = r["trades"][0]
        self.assertEqual(t["exit_reason"], "stop")
        self.assertAlmostEqual(t["entry_price"], 100.0)
        self.assertAlmostEqual(t["stop"], 96.0)          # entry - 2 * ATR(=2)
        self.assertAlmostEqual(t["exit_price"], 96.0)
        self.assertAlmostEqual(t["pnl"], -1000.0, places=6)   # exactly 1% of 100k
        self.assertAlmostEqual(t["risk_amount"], 1000.0)

    def test_position_sizing_risk_never_above_one_percent(self):
        bars = synthetic_bars(seed=4, n=800, vol=0.02, momentum=0.2)
        r = bt.run_backtest(bars, strat(), risk_per_trade=0.01)
        for t in r["trades"]:
            self.assertLessEqual(t["risk_amount"], 0.01 * t["equity_at_entry"] * (1 + 1e-9))

    def test_no_leverage_cap(self):
        # tiny stop distance would imply a 5x position; the cap holds it at equity
        r = bt.run_backtest(make_bars(flat_rows(25) + [(100, 101, 99, 100)] * 5), always_long(stop_mult=0.1),
                            fee_bps=0, slippage_bps=0)
        t = r["trades"][0]
        self.assertLessEqual(t["position_value"], t["equity_at_entry"] * (1 + 1e-9))
        self.assertLess(t["risk_amount"], 0.01 * t["equity_at_entry"])

    def test_gap_through_stop_fills_at_open(self):
        rows = flat_rows(22) + [(90, 91, 89, 90)] + flat_rows(3, 90)
        t = bt.run_backtest(make_bars(rows), always_long(), fee_bps=0, slippage_bps=0)["trades"][0]
        self.assertEqual(t["exit_reason"], "stop_gap")
        self.assertAlmostEqual(t["exit_price"], 90.0)
        self.assertLess(t["pnl"], -1000.0)   # gap loss exceeds the planned 1%

    def test_target_exit(self):
        rows = flat_rows(22) + [(100, 110, 100, 109)] + flat_rows(3, 109)
        s = always_long(exit_rules={"type": "stance_exit", "target_atr": 3})
        t = bt.run_backtest(make_bars(rows), s, fee_bps=0, slippage_bps=0)["trades"][0]
        self.assertEqual(t["exit_reason"], "target")
        self.assertAlmostEqual(t["exit_price"], 106.0)   # 100 + 3*ATR(2)

    def test_max_bars_exit(self):
        s = always_long(exit_rules={"type": "stance_exit", "max_bars": 3})
        t = bt.run_backtest(make_bars(flat_rows(40)), s)["trades"][0]
        self.assertEqual(t["exit_reason"], "signal")
        self.assertEqual(t["bars_held"], 4)   # held through bars 21..24: exit fills at the open after the 3rd held bar

    def test_end_of_data_closes_position(self):
        t = bt.run_backtest(make_bars(flat_rows(30)), always_long())["trades"]
        self.assertEqual(t[-1]["exit_reason"], "end_of_data")

    def test_short_side_pnl_sign(self):
        down = [(p, p + 1, p - 1, p) for p in range(200, 100, -1)]
        up_first = [(p, p + 1, p - 1, p) for p in range(100, 140)]
        bars = make_bars(up_first + down)
        r = bt.run_backtest(bars, strat(params={"fast": 3, "slow": 8}), fee_bps=0, slippage_bps=0)
        shorts = [t for t in r["trades"] if t["side"] == "short"]
        self.assertTrue(shorts)
        for t in shorts:
            self.assertAlmostEqual(t["gross_pnl"], t["qty"] * (t["entry_price"] - t["exit_price"]), places=6)
            self.assertGreater(t["stop"], t["entry_price"])

    def test_single_position_no_overlap(self):
        bars = synthetic_bars(seed=33, n=900, vol=0.02, momentum=0.2)
        trades = bt.run_backtest(bars, strat(params={"fast": 5, "slow": 15}))["trades"]
        self.assertGreater(len(trades), 5)
        for a, b in zip(trades, trades[1:]):
            self.assertLessEqual(a["exit_date"], b["entry_date"])

    def test_trade_from_blocks_earlier_entries(self):
        bars = synthetic_bars(seed=8, n=600, vol=0.02, momentum=0.2)
        r = bt.run_backtest(bars, strat(), trade_from=400)
        self.assertTrue(all(t["entry_date"] >= bars[400]["date"] for t in r["trades"]))
        self.assertEqual(len(r["equity_curve"]), 200)


class TestCostsAndMetrics(unittest.TestCase):
    def test_fees_and_slippage_reduce_return(self):
        bars = synthetic_bars(seed=11, n=1000, vol=0.015, momentum=0.2)
        free = bt.run_backtest(bars, strat(), fee_bps=0, slippage_bps=0)["metrics"]
        fee = bt.run_backtest(bars, strat(), fee_bps=20, slippage_bps=0)["metrics"]
        slip = bt.run_backtest(bars, strat(), fee_bps=0, slippage_bps=20)["metrics"]
        self.assertLess(fee["return_after_costs"], free["return_after_costs"])
        self.assertLess(slip["return_after_costs"], free["return_after_costs"])
        self.assertGreater(fee["total_fees"], 0)
        self.assertGreater(slip["total_slippage"], 0)

    def test_pnl_identity_gross_minus_costs(self):
        bars = synthetic_bars(seed=12, n=700, vol=0.015, momentum=0.2)
        for t in bt.run_backtest(bars, strat(), fee_bps=7, slippage_bps=3)["trades"]:
            self.assertAlmostEqual(t["pnl"], t["gross_pnl"] - t["fees"] - t["slippage"], places=6)

    def test_compute_metrics_hand_example(self):
        trades = [{"pnl": 300.0, "gross_pnl": 310.0, "fees": 5.0, "slippage": 5.0},
                  {"pnl": -100.0, "gross_pnl": -90.0, "fees": 5.0, "slippage": 5.0},
                  {"pnl": 100.0, "gross_pnl": 110.0, "fees": 5.0, "slippage": 5.0}]
        m = bt.compute_metrics(trades, [100000, 100300, 100200, 100300], 100000.0)
        self.assertEqual(m["total_trades"], 3)
        self.assertAlmostEqual(m["win_rate"], 2 / 3)
        self.assertAlmostEqual(m["avg_win"], 200.0)
        self.assertAlmostEqual(m["avg_loss"], -100.0)
        self.assertAlmostEqual(m["profit_factor"], 4.0)
        self.assertAlmostEqual(m["expectancy"], 100.0)
        self.assertAlmostEqual(m["return_after_costs"], 0.003)
        self.assertAlmostEqual(m["total_return"], 0.003 + 0.0003 - 0.0, places=6)  # (310-90+110)/1e5
        self.assertAlmostEqual(m["max_drawdown"], 100 / 100300)

    def test_metrics_empty_is_zero(self):
        m = bt.compute_metrics([], [100000.0, 100000.0], 100000.0)
        self.assertEqual((m["total_trades"], m["sharpe"], m["profit_factor"]), (0, 0.0, 0.0))

    def test_export_trades_csv(self):
        bars = synthetic_bars(seed=11, n=600, vol=0.015, momentum=0.2)
        r = bt.run_backtest(bars, strat())
        with tempfile.TemporaryDirectory() as tmp:
            p = bt.export_trades_csv(r["trades"], os.path.join(tmp, "t.csv"))
            with open(p) as fh:
                rows = list(csv.DictReader(fh))
        self.assertEqual(len(rows), len(r["trades"]))
        self.assertIn("pnl", rows[0])
        self.assertIn("slippage", rows[0])

    def test_bars_per_year_mapping(self):
        self.assertEqual(bt.bars_per_year_for("1d"), 252)
        self.assertEqual(bt.bars_per_year_for("weird"), 252)
        self.assertEqual(bt.bars_per_year_for("1w"), 52)


class TestValidationMethods(unittest.TestCase):
    def setUp(self):
        self.bars = synthetic_bars(seed=14, n=1000, vol=0.015, momentum=0.2)

    def test_oos_split_sizes(self):
        a, b = bt.split_in_out_of_sample(self.bars, 0.3)
        self.assertEqual((len(a), len(b)), (700, 300))
        self.assertEqual(a + b, self.bars)
        a, b = bt.split_in_out_of_sample(self.bars, 0.2)
        self.assertEqual((len(a), len(b)), (800, 200))
        for bad in (0, 1, -0.1, 1.5):
            with self.assertRaises(ValueError):
                bt.split_in_out_of_sample(self.bars, bad)

    def test_walk_forward_windows(self):
        wf = bt.walk_forward(self.bars, strat(), windows=4)
        self.assertEqual([w["window"] for w in wf], [1, 2, 3, 4])
        self.assertEqual(sum(w["bars"] for w in wf), 1000)
        self.assertEqual(wf[0]["start_date"], self.bars[0]["date"])
        self.assertEqual(wf[-1]["end_date"], self.bars[-1]["date"])
        for a, b in zip(wf, wf[1:]):
            self.assertLess(a["end_date"], b["start_date"])
        with self.assertRaises(ValueError):
            bt.walk_forward(self.bars[:20], strat(), windows=4)

    def test_monte_carlo_deterministic_with_seed(self):
        trades = [{"return_pct": r} for r in (0.02, -0.01, 0.015, -0.02, 0.01, -0.005, 0.03, -0.012)]
        a = bt.monte_carlo_drawdown(trades, runs=500, seed=7)
        self.assertEqual(a, bt.monte_carlo_drawdown(trades, runs=500, seed=7))
        self.assertNotEqual(a, bt.monte_carlo_drawdown(trades, runs=500, seed=8))
        self.assertTrue(0 < a < 1)
        self.assertEqual(bt.monte_carlo_drawdown([], seed=1), 0.0)

    def test_monte_carlo_worse_trades_worse_drawdown(self):
        mild = [{"return_pct": r} for r in (0.01, -0.005) * 10]
        harsh = [{"return_pct": r} for r in (0.01, -0.03) * 10]
        self.assertGreater(bt.monte_carlo_drawdown(harsh, 500, 1), bt.monte_carlo_drawdown(mild, 500, 1))

    def test_parameter_sensitivity_grid_is_plus_minus_20_percent(self):
        s = bt.parameter_sensitivity(self.bars, strat())
        fast = sorted(v["value"] for v in s["variants"] if v["param"] == "fast")
        self.assertEqual(fast, [8, 12])
        slow = sorted(v["value"] for v in s["variants"] if v["param"] == "slow")
        self.assertEqual(slow, [24, 36])
        self.assertIn("fragile", s)

    def test_sensitivity_fragile_flag_follows_definition(self):
        base = bt.parameter_sensitivity(self.bars, strat())
        if base["base_profitable"]:
            self.assertEqual(base["fragile"], base["profitable_fraction"] < 0.75)
        else:
            self.assertFalse(base["fragile"])

    def test_full_evaluation_records_rules_hash_and_oos_after_split(self):
        res = bt.full_evaluation(self.bars, strat(), "abc123", mc_runs=100)
        self.assertEqual(res["rules_hash"], "abc123")
        self.assertEqual(res["split_index"], 700)
        split_date = self.bars[700]["date"]
        self.assertTrue(all(t["entry_date"] >= split_date for t in res["trades"]["oos"]))
        self.assertTrue(all(t["exit_date"] < split_date for t in res["trades"]["in_sample"]))
        self.assertEqual(res["oos"]["bars"], 300)


if __name__ == "__main__":
    unittest.main()
