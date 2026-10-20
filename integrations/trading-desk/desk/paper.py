"""Paper trader: simulation only. It reads bars you give it and writes a CSV log.

There is no broker, exchange or network code in this package.
Replaying bars the strategy was already tested on is a plumbing check, not a
forward test; real evidence needs bars that arrived after the backtest.
"""
import csv
import os

from .backtest import run_backtest
from .data import DataError, validate_bars

MAX_RISK_PER_TRADE = 0.01
MAX_LEVERAGE = 1.0
MIN_WARMUP_BARS = 50
LOG_FIELDS = ["strategy", "side", "entry_date", "exit_date", "entry_price", "exit_price", "qty", "stop",
              "target", "fees", "slippage", "pnl", "exit_reason"]


class PaperTrader:
    def __init__(self, memory, log_path="paper-trades.csv", equity=100000.0, fee_bps=5.0,
                 slippage_bps=5.0, risk_per_trade=0.01):
        self.memory = memory
        self.log_path = log_path
        self.equity = float(equity)
        self.fee_bps = fee_bps
        self.slippage_bps = slippage_bps
        self.risk_per_trade = risk_per_trade
        self.open_positions = {}   # strategy name -> trade still marked open at the end of the data

    def has_open(self, strategy):
        return strategy.name in self.open_positions

    def trade(self, strategy, bars, window_fraction=0.2, expected_return_per_bar=None):
        """Simulate the last `window_fraction` of `bars`.

        Returns "TRADE BLOCKED: <reason>" (a string) when any precondition fails,
        otherwise a result dict. `expected_return_per_bar` (from the backtest) lets
        us report gap = expected return over the window minus the paper return.
        """
        blocked = lambda why: "TRADE BLOCKED: " + why
        try:
            validate_bars(bars)
        except (DataError, TypeError) as exc:
            return blocked("required data missing or invalid (%s)" % exc)
        status = self.memory.status(strategy)
        if status != "PASS":
            return blocked("strategy memory status is %s, not PASS" % (status or "untested"))
        if self.risk_per_trade > MAX_RISK_PER_TRADE + 1e-12 or self.risk_per_trade <= 0:
            return blocked("risk per trade %.4f exceeds the %.0f%% paper limit" % (
                self.risk_per_trade, 100 * MAX_RISK_PER_TRADE))
        if self.has_open(strategy):
            return blocked("one open paper position per strategy; %s is still open" % strategy.name)
        n = len(bars)
        start = n - max(1, int(n * window_fraction))
        if start < MIN_WARMUP_BARS:
            return blocked("not enough history before the paper window (need %d bars)" % MIN_WARMUP_BARS)

        res = run_backtest(bars, strategy, fee_bps=self.fee_bps, slippage_bps=self.slippage_bps,
                           start_equity=self.equity, risk_per_trade=self.risk_per_trade, trade_from=start)
        trades = res["trades"]
        last_exit = None
        for t in trades:
            if t["risk_amount"] > MAX_RISK_PER_TRADE * t["equity_at_entry"] * (1 + 1e-9):
                return blocked("risk exceeded on a simulated trade (%.2f > 1%% of equity)" % t["risk_amount"])
            if t["position_value"] > MAX_LEVERAGE * t["equity_at_entry"] * (1 + 1e-9):
                return blocked("leverage not allowed: position value exceeds equity")
            if last_exit is not None and t["entry_date"] < last_exit:
                return blocked("overlapping positions are not allowed")
            last_exit = t["exit_date"]

        new_file = not os.path.exists(self.log_path)
        with open(self.log_path, "a", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=LOG_FIELDS)
            if new_file:
                w.writeheader()
            for t in trades:
                row = {k: t.get(k) for k in LOG_FIELDS if k != "strategy"}
                row["strategy"] = strategy.name
                w.writerow(row)
        if trades and trades[-1]["exit_reason"] == "end_of_data":
            self.open_positions[strategy.name] = trades[-1]

        m = res["metrics"]
        gap = None
        if expected_return_per_bar is not None:
            gap = expected_return_per_bar * m["bars"] - m["return_after_costs"]
        return {"status": "OK", "mode": "paper-replay (simulation, no orders)", "strategy": strategy.name,
                "window_start": bars[start]["date"], "window_bars": m["bars"], "trades": len(trades),
                "return_after_costs": m["return_after_costs"], "max_drawdown": m["max_drawdown"],
                "fees": m["total_fees"], "slippage": m["total_slippage"], "gap": gap,
                "open_at_end": strategy.name in self.open_positions, "log": self.log_path}
