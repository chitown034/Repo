"""Single-position long/short backtester with costs, OOS split, walk-forward,
bootstrap drawdown and parameter sensitivity.

Timing: a signal read at bar t's close is filled at bar t+1's OPEN. Stops and
targets are checked against each bar's high/low (stop wins if both are hit in
one bar; gaps through a stop fill at the open). Nothing here touches a network
or a broker; it only consumes bars you pass in.

Sharpe assumption: per-bar mark-to-market equity returns, risk-free rate 0,
annualised by sqrt(bars_per_year). bars_per_year defaults from the strategy
timeframe (1d=252, 1h=1638, 1w=52, ...) and falls back to 252.
"""
import csv
import math
import random

PF_CAP = 999.0
BARS_PER_YEAR = {"1d": 252, "d": 252, "daily": 252, "1w": 52, "w": 52, "1h": 1638, "4h": 410,
                 "30m": 3276, "15m": 6552, "5m": 19656, "1m": 98280}
TRADE_FIELDS = ["side", "entry_date", "exit_date", "entry_price", "exit_price", "qty", "stop", "target",
                "fees", "slippage", "gross_pnl", "pnl", "return_pct", "equity_at_entry", "risk_amount",
                "position_value", "bars_held", "exit_reason"]


def bars_per_year_for(timeframe):
    return BARS_PER_YEAR.get(str(timeframe).strip().lower(), 252)


# ------------------------------------------------------------------ engine

def run_backtest(bars, strategy, fee_bps=5.0, slippage_bps=5.0, start_equity=100000.0,
                 risk_per_trade=0.01, trade_from=0, bars_per_year=None):
    """Run one backtest. Returns {"trades": [...], "equity_curve": [...], "metrics": {...}}.

    fee_bps and slippage_bps are charged on every fill (entry and exit).
    risk_per_trade is the fraction of current equity lost if the stop is hit;
    position value is capped at equity (no leverage). Entries are only allowed
    at bar index >= trade_from; earlier bars are indicator warm-up only.
    """
    strategy.validate()
    n = len(bars)
    fee, slip = fee_bps / 1e4, slippage_bps / 1e4
    stance = strategy.stance(bars)
    atrs = strategy.atr_series(bars)
    mult = float(strategy.stop_rule["mult"])
    tgt_atr = strategy.exit_rules.get("target_atr")
    max_bars = strategy.exit_rules.get("max_bars")
    bpy = bars_per_year or bars_per_year_for(strategy.timeframe)

    equity = float(start_equity)
    pos = None
    trades, curve = [], []
    pend_entry, pend_exit = 0, False

    def close_pos(i, raw, reason):
        nonlocal pos, equity
        d = pos["dir"]
        exit_fill = raw * (1.0 - d * slip)
        fees = pos["qty"] * (pos["entry_fill"] + exit_fill) * fee
        slippage = pos["qty"] * (abs(pos["entry_fill"] - pos["entry_raw"]) + abs(exit_fill - raw))
        gross = pos["qty"] * d * (raw - pos["entry_raw"])
        pnl = pos["qty"] * d * (exit_fill - pos["entry_fill"]) - fees
        trades.append({
            "side": "long" if d > 0 else "short",
            "entry_date": bars[pos["idx"]]["date"], "exit_date": bars[i]["date"],
            "entry_price": pos["entry_fill"], "exit_price": exit_fill, "qty": pos["qty"],
            "stop": pos["stop"], "target": pos["target"], "fees": fees, "slippage": slippage,
            "gross_pnl": gross, "pnl": pnl, "return_pct": pnl / pos["equity_at_entry"],
            "equity_at_entry": pos["equity_at_entry"], "risk_amount": pos["risk_amount"],
            "position_value": pos["qty"] * pos["entry_fill"], "bars_held": i - pos["idx"] + 1,
            "exit_reason": reason,
        })
        equity += pnl
        pos = None

    def stop_target_hit(b):
        d = pos["dir"]
        if d > 0:
            if b["open"] <= pos["stop"]:
                return b["open"], "stop_gap"
            if b["low"] <= pos["stop"]:
                return pos["stop"], "stop"
            if pos["target"] is not None:
                if b["open"] >= pos["target"]:
                    return b["open"], "target_gap"
                if b["high"] >= pos["target"]:
                    return pos["target"], "target"
        else:
            if b["open"] >= pos["stop"]:
                return b["open"], "stop_gap"
            if b["high"] >= pos["stop"]:
                return pos["stop"], "stop"
            if pos["target"] is not None:
                if b["open"] <= pos["target"]:
                    return b["open"], "target_gap"
                if b["low"] <= pos["target"]:
                    return pos["target"], "target"
        return None, None

    for i in range(n):
        b = bars[i]
        # (a) signal exit decided at the previous close fills at this open
        if pos is not None and pend_exit:
            close_pos(i, b["open"], "signal")
        # (b) otherwise protective stop / target
        elif pos is not None:
            px, why = stop_target_hit(b)
            if px is not None:
                close_pos(i, px, why)
                pend_entry = 0
        pend_exit = False
        # (c) entry decided at the previous close fills at this open
        if pos is None and pend_entry and i >= trade_from:
            a = atrs[i - 1] if i >= 1 else None
            d = pend_entry
            if a is not None and a > 0:
                entry_fill = b["open"] * (1.0 + d * slip)
                stop_dist = mult * a
                qty = min(equity * risk_per_trade / stop_dist, equity / entry_fill)
                if qty > 0 and equity > 0:
                    pos = {"dir": d, "idx": i, "entry_raw": b["open"], "entry_fill": entry_fill, "qty": qty,
                           "stop": entry_fill - d * stop_dist,
                           "target": (entry_fill + d * float(tgt_atr) * a) if tgt_atr else None,
                           "equity_at_entry": equity, "risk_amount": qty * stop_dist,
                           "entry_fee": qty * entry_fill * fee}
                    px, why = stop_target_hit(b)
                    if px is not None:
                        close_pos(i, px, why)
        pend_entry = 0
        # (d) mark to market at the close
        if i >= trade_from:
            val = equity
            if pos is not None:
                val += pos["qty"] * pos["dir"] * (b["close"] - pos["entry_fill"]) - pos["entry_fee"]
            curve.append(val)
        # (e) read signals at the close -> act next bar
        if pos is not None:
            if max_bars and (i - pos["idx"] + 1) >= max_bars:
                pend_exit = True
            if stance[i] != pos["dir"]:
                pend_exit = True
                if stance[i] != 0 and (i == 0 or stance[i] != stance[i - 1]) and i + 1 >= trade_from:
                    pend_entry = stance[i]
        elif i + 1 >= trade_from and stance[i] != 0 and (i == 0 or stance[i] != stance[i - 1]):
            pend_entry = stance[i]

    if pos is not None:
        close_pos(n - 1, bars[-1]["close"], "end_of_data")
        if curve:
            curve[-1] = equity
    metrics = compute_metrics(trades, curve, start_equity, bpy)
    return {"trades": trades, "equity_curve": curve, "metrics": metrics}


# ----------------------------------------------------------------- metrics

def max_drawdown_of(curve):
    peak, mdd = None, 0.0
    for v in curve:
        peak = v if peak is None or v > peak else peak
        if peak > 0:
            mdd = max(mdd, (peak - v) / peak)
    return mdd


def compute_metrics(trades, curve, start_equity, bars_per_year=252):
    nt = len(trades)
    wins = [t["pnl"] for t in trades if t["pnl"] > 0]
    losses = [t["pnl"] for t in trades if t["pnl"] <= 0]
    gw, gl = sum(wins), -sum(losses)
    if gl > 0:
        pf = min(gw / gl, PF_CAP)
    else:
        pf = PF_CAP if gw > 0 else 0.0
    rets = [curve[k] / curve[k - 1] - 1.0 for k in range(1, len(curve)) if curve[k - 1] > 0]
    sharpe = 0.0
    if len(rets) > 1:
        mu = sum(rets) / len(rets)
        sd = math.sqrt(sum((r - mu) ** 2 for r in rets) / (len(rets) - 1))
        sharpe = 0.0 if sd == 0 else mu / sd * math.sqrt(bars_per_year)
    net = sum(t["pnl"] for t in trades)
    return {
        "total_trades": nt,
        "win_rate": (len(wins) / nt) if nt else 0.0,
        "avg_win": (gw / len(wins)) if wins else 0.0,
        "avg_loss": (sum(losses) / len(losses)) if losses else 0.0,
        "profit_factor": pf,
        "expectancy": (net / nt) if nt else 0.0,
        "sharpe": sharpe,
        "max_drawdown": max_drawdown_of(curve),
        "total_return": sum(t["gross_pnl"] for t in trades) / start_equity,   # before fees + slippage
        "return_after_costs": net / start_equity,                              # net of fees + slippage
        "total_fees": sum(t["fees"] for t in trades),
        "total_slippage": sum(t["slippage"] for t in trades),
        "bars": len(curve),
    }


def export_trades_csv(trades, path):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=TRADE_FIELDS)
        w.writeheader()
        for t in trades:
            w.writerow({k: t[k] for k in TRADE_FIELDS})
    return path


# ------------------------------------------------------- validation methods

def split_in_out_of_sample(bars, oos_fraction=0.3):
    """Chronological split. Returns (in_sample, out_of_sample)."""
    if not 0.0 < oos_fraction < 1.0:
        raise ValueError("oos_fraction must be in (0, 1)")
    n_oos = max(1, int(round(len(bars) * oos_fraction)))
    if n_oos >= len(bars):
        raise ValueError("not enough bars to split")
    return bars[:len(bars) - n_oos], bars[len(bars) - n_oos:]


def walk_forward(bars, strategy, windows=4, **kw):
    """Fixed-parameter walk-forward: `windows` consecutive test segments.

    Parameters are NOT re-fitted per window (that would be optimisation); this
    shows whether the same rules held up across consecutive regimes.
    """
    if windows < 1 or len(bars) < windows * 10:
        raise ValueError("not enough bars for %d windows" % windows)
    size = len(bars) // windows
    out = []
    for w in range(windows):
        start = w * size
        end = (w + 1) * size if w < windows - 1 else len(bars)
        r = run_backtest(bars[:end], strategy, trade_from=start, **kw)
        out.append({"window": w + 1, "start_date": bars[start]["date"], "end_date": bars[end - 1]["date"],
                    "bars": end - start, "metrics": r["metrics"]})
    return out


def monte_carlo_drawdown(trades, runs=1000, seed=0):
    """Bootstrap-resample trade returns; return the 95th percentile max drawdown."""
    rets = [t["return_pct"] if isinstance(t, dict) else float(t) for t in trades]
    if not rets:
        return 0.0
    rng = random.Random(seed)
    dds = []
    for _ in range(int(runs)):
        eq = peak = 1.0
        mdd = 0.0
        for _ in range(len(rets)):
            eq *= 1.0 + rets[rng.randrange(len(rets))]
            peak = max(peak, eq)
            mdd = max(mdd, (peak - eq) / peak)
        dds.append(mdd)
    dds.sort()
    return dds[min(len(dds) - 1, int(math.ceil(0.95 * len(dds))) - 1)]


def parameter_sensitivity(bars, strategy, grid=None, **kw):
    """Perturb each tunable by -20% and +20% (or a supplied grid) one at a time.

    `fragile` is True when the base case is profitable after costs but fewer
    than 75% of the perturbed variants are. Use in-sample bars only.
    """
    base = run_backtest(bars, strategy, **kw)["metrics"]["return_after_costs"]
    tun = strategy.tunable_params()
    if grid is None:
        grid = {}
        for k, v in tun.items():
            vals = [v * 0.8, v * 1.2]
            if isinstance(v, int):
                vals = [max(1, int(round(x))) for x in vals]
            grid[k] = [x for x in vals if x != v]
    variants = []
    for k, vals in grid.items():
        for v in vals:
            try:
                s2 = strategy.with_params(**{k: v})
                s2.validate()
            except ValueError:
                continue
            ret = run_backtest(bars, s2, **kw)["metrics"]["return_after_costs"]
            variants.append({"param": k, "value": v, "return_after_costs": ret})
    frac = (sum(1 for x in variants if x["return_after_costs"] > 0) / len(variants)) if variants else 0.0
    return {"base_return": base, "base_profitable": base > 0, "variants": variants,
            "profitable_fraction": frac, "fragile": bool(base > 0 and variants and frac < 0.75)}


# ---------------------------------------------------------- full evaluation

def full_evaluation(bars, strategy, rules_hash, fee_bps=5.0, slippage_bps=5.0, oos_fraction=0.3,
                    start_equity=100000.0, risk_per_trade=0.01, mc_runs=1000, seed=0, windows=4):
    """Everything the gates need. `rules_hash` must come from a Rules object
    created BEFORE this call; it is recorded in the result."""
    kw = dict(fee_bps=fee_bps, slippage_bps=slippage_bps, start_equity=start_equity,
              risk_per_trade=risk_per_trade)
    is_bars, _ = split_in_out_of_sample(bars, oos_fraction)
    split = len(is_bars)
    ins = run_backtest(is_bars, strategy, **kw)
    # OOS runs on the full series but may only ENTER after the split (earlier bars are warm-up only).
    oos = run_backtest(bars, strategy, trade_from=split, **kw)
    sens = parameter_sensitivity(is_bars, strategy, **kw)
    wf = walk_forward(bars, strategy, windows=windows, **kw)
    all_trades = ins["trades"] + oos["trades"]
    return {
        "rules_hash": rules_hash,
        "strategy": strategy.name,
        "fingerprint": strategy.fingerprint(),
        "costs": {"fee_bps": fee_bps, "slippage_bps": slippage_bps, "risk_per_trade": risk_per_trade},
        "split_index": split,
        "in_sample": ins["metrics"],
        "oos": oos["metrics"],
        "walk_forward": wf,
        "monte_carlo_dd95": monte_carlo_drawdown(all_trades, runs=mc_runs, seed=seed),
        "sensitivity": sens,
        "trades": {"in_sample": ins["trades"], "oos": oos["trades"]},
    }
