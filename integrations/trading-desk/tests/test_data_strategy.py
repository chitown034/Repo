import json
import os
import tempfile
import unittest

import _deskpath  # noqa: F401
from _deskpath import strat, spec, make_bars, flat_rows
from desk import strategy as S
from desk.data import DataError, load_ohlcv_csv, synthetic_bars, validate_bars, write_csv


def write(tmp, text, name="b.csv"):
    p = os.path.join(tmp, name)
    with open(p, "w") as fh:
        fh.write(text)
    return p


GOOD = "date,open,high,low,close,volume\n2024-01-01,10,11,9,10.5,100\n2024-01-02,10.5,12,10,11,120\n"


class TestCsvLoader(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)

    def test_loads_valid_file(self):
        bars = load_ohlcv_csv(write(self.tmp.name, GOOD))
        self.assertEqual(len(bars), 2)
        self.assertEqual(bars[1]["close"], 11.0)

    def test_headers_case_insensitive(self):
        bars = load_ohlcv_csv(write(self.tmp.name, GOOD.replace("date,open", "Date,OPEN")))
        self.assertEqual(len(bars), 2)

    def test_rejects_unsorted(self):
        txt = "date,open,high,low,close,volume\n2024-01-02,1,2,1,1,1\n2024-01-01,1,2,1,1,1\n"
        with self.assertRaisesRegex(DataError, "not sorted"):
            load_ohlcv_csv(write(self.tmp.name, txt))

    def test_rejects_duplicate_timestamp(self):
        txt = "date,open,high,low,close,volume\n2024-01-01,1,2,1,1,1\n2024-01-01,1,2,1,1,1\n"
        with self.assertRaisesRegex(DataError, "duplicate"):
            load_ohlcv_csv(write(self.tmp.name, txt))

    def test_rejects_nan(self):
        txt = "date,open,high,low,close,volume\n2024-01-01,nan,2,1,1,1\n"
        with self.assertRaisesRegex(DataError, "NaN"):
            load_ohlcv_csv(write(self.tmp.name, txt))

    def test_rejects_empty_cell_and_non_numeric(self):
        with self.assertRaisesRegex(DataError, "empty"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\n2024-01-01,,2,1,1,1\n"))
        with self.assertRaisesRegex(DataError, "not a number"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\n2024-01-01,x,2,1,1,1\n"))

    def test_rejects_missing_column(self):
        with self.assertRaisesRegex(DataError, "missing required columns"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close\n2024-01-01,1,2,1,1\n"))

    def test_rejects_inconsistent_ohlc_and_bad_prices(self):
        with self.assertRaisesRegex(DataError, "inconsistent"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\n2024-01-01,1,0.5,1,1,1\n"))
        with self.assertRaisesRegex(DataError, "> 0"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\n2024-01-01,0,1,0,0,1\n"))

    def test_rejects_empty_and_missing_file_and_bad_date(self):
        with self.assertRaises(DataError):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\n"))
        with self.assertRaises(DataError):
            load_ohlcv_csv(os.path.join(self.tmp.name, "nope.csv"))
        with self.assertRaisesRegex(DataError, "timestamp"):
            load_ohlcv_csv(write(self.tmp.name, "date,open,high,low,close,volume\nyesterday,1,2,1,1,1\n"))

    def test_validate_bars_rejects_empty_list(self):
        with self.assertRaises(DataError):
            validate_bars([])


class TestSynthetic(unittest.TestCase):
    def test_deterministic_and_valid(self):
        a, b = synthetic_bars(seed=3, n=200), synthetic_bars(seed=3, n=200)
        self.assertEqual(a, b)
        self.assertNotEqual(a, synthetic_bars(seed=4, n=200))
        validate_bars(a)

    def test_csv_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            bars = synthetic_bars(seed=5, n=60)
            p = os.path.join(tmp, "SYNTHETIC.csv")
            write_csv(bars, p)
            self.assertEqual(load_ohlcv_csv(p), bars)


class TestIndicators(unittest.TestCase):
    def test_sma_and_ema_values(self):
        self.assertEqual(S.sma([1, 2, 3, 4, 5], 3), [None, None, 2.0, 3.0, 4.0])
        e = S.ema([1, 2, 3, 4, 5], 3)
        self.assertEqual(e[:2], [None, None])
        self.assertAlmostEqual(e[2], 2.0)
        self.assertAlmostEqual(e[3], 3.0)  # k=0.5: 4*.5 + 2*.5

    def test_rsi_extremes(self):
        up = S.rsi([float(i) for i in range(1, 30)], 14)
        self.assertEqual(up[14], 100.0)
        down = S.rsi([float(30 - i) for i in range(30)], 14)
        self.assertEqual(down[14], 0.0)
        self.assertIsNone(up[13])

    def test_atr_constant_range(self):
        h, l, c = [101.0] * 20, [99.0] * 20, [100.0] * 20
        a = S.atr(h, l, c, 14)
        self.assertIsNone(a[12])
        self.assertAlmostEqual(a[13], 2.0)
        self.assertAlmostEqual(a[19], 2.0)

    def test_breakout_excludes_current_bar(self):
        highs = [1, 2, 3, 10]
        self.assertEqual(S.breakout_high(highs, 3), [None, None, None, 3])
        self.assertEqual(S.breakout_low([5, 4, 3, 1], 3), [None, None, None, 3])

    def test_zscore(self):
        z = S.zscore([1.0, 1.0, 1.0, 1.0], 4)
        self.assertEqual(z[3], 0.0)
        z = S.zscore([1.0, 2.0, 3.0], 3)
        self.assertAlmostEqual(z[2], 1.2247, places=3)


class TestRuleEngine(unittest.TestCase):
    SPECS = [
        spec(),
        spec(name="b", entry={"type": "breakout"}, params={"lookback": 20}),
        spec(name="r", entry={"type": "rsi_reversion"}, params={"period": 14, "low": 30, "high": 55}),
        spec(name="z", entry={"type": "zscore_reversion"}, params={"period": 20, "entry": 1.5, "short": True}),
    ]

    def test_no_lookahead_truncation_invariance(self):
        bars = synthetic_bars(seed=9, n=400, vol=0.02, momentum=0.1)
        for sp in self.SPECS:
            s = S.Strategy.from_dict(sp)
            full = s.stance(bars)
            for k in (60, 150, 299, 399):
                self.assertEqual(s.stance(bars[:k + 1]), full[:k + 1], "%s changed at k=%d" % (sp["name"], k))

    def test_changing_future_data_does_not_change_past_signals(self):
        bars = synthetic_bars(seed=2, n=300, vol=0.02)
        cut = 200
        altered = [dict(b) for b in bars]
        for b in altered[cut + 1:]:  # shift/scramble everything after the cut
            b["open"] *= 1.5
            b["high"] *= 1.5
            b["low"] *= 1.5
            b["close"] *= 1.5
        for sp in self.SPECS:
            s = S.Strategy.from_dict(sp)
            self.assertEqual(s.stance(bars)[:cut + 1], s.stance(altered)[:cut + 1], sp["name"])

    def test_sma_cross_stance_direction(self):
        rows = [(p, p + 1, p - 1, p) for p in list(range(100, 140)) + list(range(140, 100, -1))]
        bars = make_bars(rows)
        st = strat(params={"fast": 3, "slow": 8}).stance(bars)
        self.assertEqual(st[30], 1)
        self.assertEqual(st[-1], -1)
        self.assertEqual(st[0], 0)

    def test_rejects_unknown_or_malicious_types(self):
        for bad in ({"type": "__import__('os').system('x')"}, {"type": "eval"}, {}):
            with self.assertRaises(ValueError):
                S.Strategy.from_dict(spec(entry=bad, params={}))

    def test_rejects_bad_params_and_fields(self):
        with self.assertRaises(ValueError):
            S.Strategy.from_dict(spec(params={"fast": 30, "slow": 10}))
        with self.assertRaises(ValueError):
            S.Strategy.from_dict(spec(params={"fast": "10", "slow": 30}))
        with self.assertRaises(ValueError):
            S.Strategy.from_dict(spec(bogus_field=1))
        with self.assertRaises(ValueError):
            S.Strategy.from_dict(spec(stop_rule={"type": "none"}))

    def test_fingerprint_ignores_name_but_not_params(self):
        a, b = strat(name="alpha"), strat(name="beta", hypothesis="different words")
        self.assertEqual(a.fingerprint(), b.fingerprint())
        self.assertNotEqual(a.fingerprint(), strat(params={"fast": 11, "slow": 30}).fingerprint())
        self.assertNotEqual(a.fingerprint(), strat(stop_mult=3.0).fingerprint())

    def test_inline_spec_form_matches_params_form(self):
        a = S.Strategy.from_dict(spec(entry={"type": "sma_cross", "fast": 10, "slow": 30}, params={}))
        self.assertEqual(a.fingerprint(), strat().fingerprint())

    def test_json_round_trip(self):
        s = strat()
        self.assertEqual(S.Strategy.from_dict(json.loads(json.dumps(s.to_dict()))), s)

    def test_with_params_edits_stop_mult(self):
        s = strat().with_params(stop_mult=3.0, fast=5)
        self.assertEqual(s.stop_rule["mult"], 3.0)
        self.assertEqual(s.effective_entry()["fast"], 5)


if __name__ == "__main__":
    unittest.main()
