"""Test helper: make `desk` importable and build hand-made bars."""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import datetime as _dt

from desk.strategy import Strategy


def make_bars(rows, start="2020-01-01"):
    """rows: list of (open, high, low, close). Dates are consecutive days."""
    d = _dt.date.fromisoformat(start)
    out = []
    for i, (o, h, l, c) in enumerate(rows):
        out.append({"date": (d + _dt.timedelta(days=i)).isoformat(), "open": o, "high": h, "low": l,
                    "close": c, "volume": 1000})
    return out


def flat_rows(n, price=100.0):
    return [(price, price + 1, price - 1, price)] * n


def spec(name="t sma", entry=None, params=None, stop_mult=2.0, exit_rules=None, **over):
    d = {"name": name, "market": "SYN", "timeframe": "1d",
         "entry_rules": entry or {"type": "sma_cross"}, "params": {"fast": 10, "slow": 30} if params is None else params,
         "exit_rules": exit_rules or {"type": "stance_exit"},
         "stop_rule": {"type": "atr", "period": 14, "mult": stop_mult},
         "hypothesis": "h", "falsifier": "f", "data_required": "d"}
    d.update(over)
    return d


def strat(**kw):
    return Strategy.from_dict(spec(**kw))


def always_long(stop_mult=2.0, **kw):
    return strat(name="always long", entry={"type": "always_long"}, params={}, stop_mult=stop_mult, **kw)
