"""Command line: python3 -m desk run|report|selftest"""
import argparse
import json
import sys

from .data import DataError
from .loop import run_pipeline, selftest
from .memory import Memory


def main(argv=None):
    p = argparse.ArgumentParser(prog="desk", description="Trading research desk. PAPER MODE ONLY. Not advice.")
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="test one strategy spec against your OHLCV CSV")
    r.add_argument("--data", required=True)
    r.add_argument("--strategy", required=True)
    r.add_argument("--memory", default=None, help="sqlite path (default ~/.config/trading-desk/memory.sqlite3)")
    r.add_argument("--report", default="desk-report.json")
    r.add_argument("--paper-log", default="paper-trades.csv")
    r.add_argument("--trades-csv", default=None)
    r.add_argument("--fee-bps", type=float, default=5.0)
    r.add_argument("--slippage-bps", type=float, default=5.0)
    r.add_argument("--oos-fraction", type=float, default=0.3)
    g = sub.add_parser("report", help="print memory statistics")
    g.add_argument("--memory", default=None)
    sub.add_parser("selftest", help="run everything on SYNTHETIC data")
    a = p.parse_args(argv)
    try:
        if a.cmd == "run":
            out = run_pipeline(a.data, a.strategy, a.memory, a.report, a.fee_bps, a.slippage_bps,
                               a.oos_fraction, a.paper_log, a.trades_csv)
            print(json.dumps(out, indent=2, default=str))
            return 0
        if a.cmd == "report":
            mem = Memory(a.memory)
            try:
                print(json.dumps(mem.stats(), indent=2))
            finally:
                mem.close()
            return 0
        return 0 if selftest() else 1
    except (DataError, ValueError, OSError) as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2
