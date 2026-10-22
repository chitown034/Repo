"""Fixed pass/fail gates. The rules are constants, frozen, and hash-pinned.

Workflow: build a Rules object BEFORE any backtest, pass rules.hash() into the
evaluation so it is recorded in the result, then call evaluate(). evaluate()
rejects any result whose recorded hash differs from the rules it is given, so
rules cannot be quietly changed after the numbers are known.
"""
import hashlib
import json
from dataclasses import dataclass, asdict

# ---- FIXED RULES (edit these only as a deliberate, reviewed change) ----------
MIN_TRADES_IN_SAMPLE = 30
MIN_TRADES_OOS = 10
MIN_PROFIT_FACTOR_OOS = 1.2
MAX_DRAWDOWN = 0.25           # fraction of equity
MIN_SHARPE_OOS = 0.5
PERFECT_WIN_RATE = 0.9        # win_rate above this is "suspiciously perfect"
PERFECT_PROFIT_FACTOR = 5.0
PERFECT_SHARPE = 4.0
OVERFIT_RATIO = 0.30          # OOS per-bar return < 30% of in-sample per-bar return


@dataclass(frozen=True)
class Rules:
    min_trades_in_sample: int = MIN_TRADES_IN_SAMPLE
    min_trades_oos: int = MIN_TRADES_OOS
    min_profit_factor_oos: float = MIN_PROFIT_FACTOR_OOS
    max_drawdown: float = MAX_DRAWDOWN
    min_sharpe_oos: float = MIN_SHARPE_OOS
    perfect_win_rate: float = PERFECT_WIN_RATE
    perfect_profit_factor: float = PERFECT_PROFIT_FACTOR
    perfect_sharpe: float = PERFECT_SHARPE
    overfit_ratio: float = OVERFIT_RATIO

    def hash(self):
        return hashlib.sha256(json.dumps(asdict(self), sort_keys=True).encode()).hexdigest()


DEFAULT_RULES = Rules()


def _fail(reasons, flags, rules_hash):
    return {"verdict": "FAIL", "reasons": reasons, "flags": flags, "rules_hash": rules_hash}


def evaluate(strategy_result, rules=None):
    """Return {"verdict": "PASS"|"FAIL", "reasons": [...], "flags": [...], "rules_hash": ...}.

    `rules` defaults to DEFAULT_RULES. A custom Rules object is accepted only
    if its hash equals the hash recorded in the result at backtest time.
    """
    rules = DEFAULT_RULES if rules is None else rules
    h = rules.hash()
    recorded = strategy_result.get("rules_hash") if isinstance(strategy_result, dict) else None
    if recorded != h:
        return _fail(["RULES_HASH_MISMATCH: result was produced under different (or no) rules; rejected"],
                     ["rules_changed"], h)
    try:
        ins, oos = strategy_result["in_sample"], strategy_result["oos"]
        for m in (ins, oos):
            for k in ("total_trades", "win_rate", "profit_factor", "sharpe", "max_drawdown",
                      "return_after_costs", "bars"):
                m[k]
    except (KeyError, TypeError) as exc:
        return _fail(["MALFORMED_RESULT: missing %s" % exc], [], h)

    reasons, flags = [], []

    if ins["total_trades"] < rules.min_trades_in_sample or oos["total_trades"] < rules.min_trades_oos:
        flags.append("tiny sample")
        reasons.append("tiny sample: %d in-sample trades (need %d), %d OOS trades (need %d)" % (
            ins["total_trades"], rules.min_trades_in_sample, oos["total_trades"], rules.min_trades_oos))
    if ins["return_after_costs"] <= 0:
        reasons.append("not profitable after fees+slippage in-sample (%.2f%%)" % (100 * ins["return_after_costs"]))
    if oos["return_after_costs"] <= 0:
        reasons.append("not profitable after fees+slippage out-of-sample (%.2f%%)" % (100 * oos["return_after_costs"]))
    if oos["profit_factor"] < rules.min_profit_factor_oos:
        reasons.append("OOS profit factor %.2f < %.2f" % (oos["profit_factor"], rules.min_profit_factor_oos))
    worst_dd = max(ins["max_drawdown"], oos["max_drawdown"])
    if worst_dd > rules.max_drawdown:
        reasons.append("max drawdown %.1f%% > %.1f%%" % (100 * worst_dd, 100 * rules.max_drawdown))
    if oos["sharpe"] < rules.min_sharpe_oos:
        reasons.append("OOS sharpe %.2f < %.2f" % (oos["sharpe"], rules.min_sharpe_oos))

    for label, m in (("in-sample", ins), ("OOS", oos)):
        if m["total_trades"] > 0 and (m["win_rate"] > rules.perfect_win_rate
                                      or m["profit_factor"] > rules.perfect_profit_factor
                                      or m["sharpe"] > rules.perfect_sharpe):
            if "suspiciously perfect" not in flags:
                flags.append("suspiciously perfect")
            reasons.append("suspiciously perfect %s result (win_rate %.2f, PF %.2f, sharpe %.2f): "
                           "treat as a bug or leak until proven otherwise" % (
                               label, m["win_rate"], m["profit_factor"], m["sharpe"]))

    is_pp = ins["return_after_costs"] / max(ins["bars"], 1)
    oos_pp = oos["return_after_costs"] / max(oos["bars"], 1)
    if is_pp > 0 and oos_pp < rules.overfit_ratio * is_pp:
        flags.append("overfit")
        reasons.append("overfit: OOS return/bar %.5f < %.0f%% of in-sample %.5f" % (
            oos_pp, 100 * rules.overfit_ratio, is_pp))

    sens = strategy_result.get("sensitivity")
    if isinstance(sens, dict) and sens.get("fragile"):
        flags.append("fragile params (warning only)")

    return {"verdict": "FAIL" if reasons else "PASS", "reasons": reasons, "flags": flags, "rules_hash": h}
