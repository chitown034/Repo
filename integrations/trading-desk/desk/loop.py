"""The research loop: duplicate check -> backtest -> OOS -> gates -> memory -> paper (if PASS)."""
import json
import os
import tempfile
import datetime as _dt

from . import backtest as bt
from .data import SYNTHETIC_LABEL, load_ohlcv_csv, synthetic_bars, write_csv
from .gates import Rules, evaluate
from .memory import Memory
from .paper import PaperTrader
from .strategy import Strategy

DISCLAIMER = "PAPER MODE ONLY. Research output, not financial advice. No orders are ever placed."


def _lesson_text(strategy, verdict, result):
    if verdict["verdict"] == "PASS":
        return ("Passed the fixed gates on the supplied data. A pass is a reason to keep paper-testing on "
                "new data, not evidence of a durable edge.",
                "Do not re-tune parameters on the out-of-sample window and re-submit as a new idea.",
                "Re-test on a different market or a later period before trusting it.")
    why = "; ".join(verdict["reasons"]) or "failed gates"
    dnr = "Same spec (%s, %s %s) failed: %s" % (strategy.effective_entry().get("type"), strategy.market,
                                                strategy.timeframe, why)
    nxt = "Try a materially different hypothesis or market; do not nudge parameters until it looks good."
    return why, dnr, nxt


def run_pipeline(data_path, strategy_path, memory_path=None, report_path="desk-report.json",
                 fee_bps=5.0, slippage_bps=5.0, oos_fraction=0.3, paper_log="paper-trades.csv",
                 trades_csv=None, bars=None, strategy=None, seed=0):
    rules = Rules()                     # created BEFORE any backtest; its hash is pinned into the result
    rules_hash = rules.hash()
    if strategy is None:
        with open(strategy_path, encoding="utf-8") as fh:
            strategy = Strategy.from_dict(json.load(fh))
    if bars is None:
        bars = load_ohlcv_csv(data_path)
    mem = Memory(memory_path)
    summary = {"mode": "PAPER", "disclaimer": DISCLAIMER, "strategy": strategy.name, "rules_hash": rules_hash}
    try:
        dups = mem.find_duplicates(strategy)
        summary["duplicate_check"] = dups
        identical = [d for d in dups if d["match"] == "identical_spec"]
        if identical:
            mem.log_duplicate_prevented(identical[0]["id"], strategy.name)
            summary.update(status="DUPLICATE_BLOCKED", verdict=None,
                           message="Identical normalised spec already tested as %r (status %s). Not re-run." % (
                               identical[0]["name"], identical[0]["status"]))
        else:
            summary["previously_failed_warnings"] = mem.previously_failed(strategy)
            result = bt.full_evaluation(bars, strategy, rules_hash, fee_bps=fee_bps, slippage_bps=slippage_bps,
                                        oos_fraction=oos_fraction, seed=seed)
            verdict = evaluate(result, rules)
            why, dnr, nxt = _lesson_text(strategy, verdict, result)
            sid = mem.record(strategy, result["in_sample"], result["oos"], None, why, dnr, nxt, gate=verdict)
            if trades_csv:
                bt.export_trades_csv(result["trades"]["in_sample"] + result["trades"]["oos"], trades_csv)
            summary.update(status="TESTED", verdict=verdict["verdict"], reasons=verdict["reasons"],
                           flags=verdict["flags"], in_sample=result["in_sample"], oos=result["oos"],
                           monte_carlo_dd95=result["monte_carlo_dd95"],
                           sensitivity={k: result["sensitivity"][k] for k in
                                        ("base_profitable", "profitable_fraction", "fragile")},
                           walk_forward=[{"window": w["window"], "return_after_costs":
                                          w["metrics"]["return_after_costs"], "trades":
                                          w["metrics"]["total_trades"]} for w in result["walk_forward"]])
            if verdict["verdict"] == "PASS":
                trader = PaperTrader(mem, log_path=paper_log, fee_bps=fee_bps, slippage_bps=slippage_bps)
                oos_pp = result["oos"]["return_after_costs"] / max(result["oos"]["bars"], 1)
                paper = trader.trade(strategy, bars, expected_return_per_bar=oos_pp)
                summary["paper"] = paper
                if isinstance(paper, dict):
                    mem.add_paper_result(sid, paper)
            else:
                summary["paper"] = "not run: strategy did not PASS"
        stats = mem.stats()
    finally:
        mem.close()
    report = {
        "label": DISCLAIMER,
        "generated": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
        "tested": stats["tested"],
        "rejected_before_paper": stats["rejected_before_paper"],
        "oos_perf": {"avg_return_after_costs": stats["avg_oos_return_after_costs"],
                     "avg_sharpe": stats["avg_oos_sharpe"]},
        "max_dd": stats["worst_max_drawdown"],
        "after_costs": summary.get("oos", {}).get("return_after_costs"),
        "duplicates_prevented": stats["duplicates_prevented"],
        "backtest_vs_paper_gap": stats["backtest_vs_paper_gap"],
        "last_run": {"strategy": strategy.name, "status": summary["status"], "verdict": summary.get("verdict")},
    }
    with open(report_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    summary["report_file"] = report_path
    summary["stats"] = stats
    return summary


# ------------------------------------------------------------------ selftest

def _spec(name="selftest sma cross", **over):
    d = {"name": name, "market": "SYNTH", "timeframe": "1d",
         "entry_rules": {"type": "sma_cross"}, "params": {"fast": 10, "slow": 30},
         "exit_rules": {"type": "stance_exit"}, "stop_rule": {"type": "atr", "period": 14, "mult": 2.0},
         "hypothesis": "synthetic plumbing check", "falsifier": "no edge on noise",
         "data_required": "synthetic OHLCV"}
    d.update(over)
    return d


def selftest(verbose=True):
    """Exercise the whole pipeline on SYNTHETIC data. Proves plumbing, NOT an edge."""
    checks = []

    def check(name, ok, detail=""):
        checks.append((name, bool(ok), detail))

    tmp = tempfile.mkdtemp(prefix="desk-selftest-")
    mem_path = os.path.join(tmp, "memory.sqlite3")
    csv_path = os.path.join(tmp, "SYNTHETIC_bars.csv")
    bars = synthetic_bars(seed=11, n=1500, drift=0.0004, vol=0.012, momentum=0.2)
    write_csv(bars, csv_path)
    loaded = load_ohlcv_csv(csv_path)
    check("csv round-trip", loaded == bars)

    strat = Strategy.from_dict(_spec())
    cut = 900
    a, b = strat.stance(bars[:cut]), strat.stance(bars)
    check("no look-ahead (past signals unchanged by future bars)", a == b[:cut])

    base = bt.run_backtest(bars, strat, fee_bps=0, slippage_bps=0)["metrics"]
    cost = bt.run_backtest(bars, strat, fee_bps=10, slippage_bps=10)["metrics"]
    check("costs reduce returns", cost["return_after_costs"] < base["return_after_costs"])

    sj = os.path.join(tmp, "spec.json")
    with open(sj, "w") as fh:
        json.dump(_spec(), fh)
    s1 = run_pipeline(csv_path, sj, mem_path, os.path.join(tmp, "desk-report.json"),
                      paper_log=os.path.join(tmp, "paper.csv"))
    check("pipeline ran and produced a verdict", s1["status"] == "TESTED" and s1["verdict"] in ("PASS", "FAIL"),
          "verdict=%s" % s1.get("verdict"))
    s2 = run_pipeline(csv_path, sj, mem_path, os.path.join(tmp, "desk-report.json"))
    check("identical re-submission blocked as duplicate", s2["status"] == "DUPLICATE_BLOCKED")
    sj2 = os.path.join(tmp, "spec2.json")
    with open(sj2, "w") as fh:
        json.dump(_spec(name="totally different title"), fh)
    s3 = run_pipeline(csv_path, sj2, mem_path, os.path.join(tmp, "desk-report.json"))
    check("renamed duplicate blocked", s3["status"] == "DUPLICATE_BLOCKED")

    mem = Memory(mem_path)
    try:
        import sqlite3
        try:
            mem._db.execute("DELETE FROM strategies")
            deleted = True
        except sqlite3.DatabaseError:
            deleted = False
        check("memory refuses DELETE", not deleted)
        untested = Strategy.from_dict(_spec(name="never tested", params={"fast": 5, "slow": 50}))
        trader = PaperTrader(mem, log_path=os.path.join(tmp, "p2.csv"))
        out = trader.trade(untested, bars)
        check("paper trader blocks untested strategy", isinstance(out, str) and out.startswith("TRADE BLOCKED"), str(out))
        check("paper trader blocks missing data", str(trader.trade(strat, [])).startswith("TRADE BLOCKED"))
    finally:
        mem.close()

    # Fixture: force a PASS row so the paper path itself is exercised. Plumbing only.
    mem = Memory(os.path.join(tmp, "fixture.sqlite3"))
    try:
        fx = Strategy.from_dict(_spec(name="fixture forced pass"))
        mem.record(fx, {}, {}, gate={"verdict": "PASS", "reasons": [], "flags": [], "rules_hash": "fixture"})
        res = PaperTrader(mem, log_path=os.path.join(tmp, "p3.csv")).trade(fx, bars)
        check("paper path runs for a PASS fixture (forced; plumbing only)",
              isinstance(res, dict) and res["status"] == "OK", str(res)[:120])
    finally:
        mem.close()

    ok = all(c[1] for c in checks)
    if verbose:
        print("SELFTEST on %s" % SYNTHETIC_LABEL)
        for name, good, detail in checks:
            print("  [%s] %s%s" % ("PASS" if good else "FAIL", name, ("  (%s)" % detail) if detail and not good else ""))
        print("  info: synthetic gate verdict for the sample strategy = %s. This proves the plumbing, "
              "NOT a trading edge." % s1.get("verdict"))
        print("  workdir: %s" % tmp)
        print("SELFTEST RESULT: %s" % ("PASS" if ok else "FAIL"))
    return ok
