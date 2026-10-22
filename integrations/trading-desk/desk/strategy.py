"""Strategy definition and a tiny SAFE rule engine.

No dynamic code execution: a strategy is plain data (a JSON-like spec) that
names a built-in signal type. Each signal turns a bar list into a "stance"
series (+1 long, -1 short, 0 neutral). The stance at index t uses only bars
0..t (through t's close). The backtester fills at bar t+1 OPEN.
"""
import hashlib
import json
import math
from dataclasses import dataclass, field, replace


# ---------------------------------------------------------------- indicators
# Each returns a list the same length as the input, None during warm-up.
# Value at index i uses only inputs [0..i].

def sma(values, n):
    out = [None] * len(values)
    total = 0.0
    for i, v in enumerate(values):
        total += v
        if i >= n:
            total -= values[i - n]
        if i >= n - 1:
            out[i] = total / n
    return out


def ema(values, n):
    out = [None] * len(values)
    if len(values) < n:
        return out
    k = 2.0 / (n + 1.0)
    cur = sum(values[:n]) / n
    out[n - 1] = cur
    for i in range(n, len(values)):
        cur = values[i] * k + cur * (1.0 - k)
        out[i] = cur
    return out


def rsi(values, n):
    """Wilder RSI."""
    out = [None] * len(values)
    if len(values) <= n:
        return out
    gain = loss = 0.0
    for i in range(1, n + 1):
        d = values[i] - values[i - 1]
        gain += max(d, 0.0)
        loss += max(-d, 0.0)
    gain /= n
    loss /= n

    def val(g, l):
        if l == 0.0:
            return 50.0 if g == 0.0 else 100.0
        return 100.0 - 100.0 / (1.0 + g / l)

    out[n] = val(gain, loss)
    for i in range(n + 1, len(values)):
        d = values[i] - values[i - 1]
        gain = (gain * (n - 1) + max(d, 0.0)) / n
        loss = (loss * (n - 1) + max(-d, 0.0)) / n
        out[i] = val(gain, loss)
    return out


def atr(highs, lows, closes, n):
    """Wilder average true range."""
    size = len(closes)
    out = [None] * size
    if size < n:
        return out
    tr = [highs[0] - lows[0]]
    for i in range(1, size):
        tr.append(max(highs[i] - lows[i], abs(highs[i] - closes[i - 1]), abs(lows[i] - closes[i - 1])))
    cur = sum(tr[:n]) / n
    out[n - 1] = cur
    for i in range(n, size):
        cur = (cur * (n - 1) + tr[i]) / n
        out[i] = cur
    return out


def breakout_high(highs, n):
    """Highest high of the PREVIOUS n bars (excludes the current bar)."""
    out = [None] * len(highs)
    for i in range(n, len(highs)):
        out[i] = max(highs[i - n:i])
    return out


def breakout_low(lows, n):
    """Lowest low of the PREVIOUS n bars (excludes the current bar)."""
    out = [None] * len(lows)
    for i in range(n, len(lows)):
        out[i] = min(lows[i - n:i])
    return out


def zscore(values, n):
    out = [None] * len(values)
    for i in range(n - 1, len(values)):
        w = values[i - n + 1:i + 1]
        m = sum(w) / n
        var = sum((x - m) ** 2 for x in w) / n
        sd = math.sqrt(var)
        out[i] = 0.0 if sd == 0 else (values[i] - m) / sd
    return out


# ------------------------------------------------------------------- signals

def _col(bars, key):
    return [b[key] for b in bars]


def _sig_sma_cross(bars, p):
    f, s = sma(_col(bars, "close"), int(p["fast"])), sma(_col(bars, "close"), int(p["slow"]))
    short = p.get("short", True)
    out = []
    for a, b in zip(f, s):
        if a is None or b is None or a == b:
            out.append(0)
        elif a > b:
            out.append(1)
        else:
            out.append(-1 if short else 0)
    return out


def _sig_breakout(bars, p):
    lb = int(p["lookback"])
    xl = int(p.get("exit_lookback", max(1, lb // 2)))
    short = p.get("short", True)
    close = _col(bars, "close")
    bh, bl = breakout_high(_col(bars, "high"), lb), breakout_low(_col(bars, "low"), lb)
    xh, xlo = breakout_high(_col(bars, "high"), xl), breakout_low(_col(bars, "low"), xl)
    state, out = 0, []
    for i, c in enumerate(close):
        if bh[i] is None:
            out.append(0)
            continue
        if state == 1 and xlo[i] is not None and c < xlo[i]:
            state = 0
        elif state == -1 and xh[i] is not None and c > xh[i]:
            state = 0
        if state == 0:
            if c > bh[i]:
                state = 1
            elif short and c < bl[i]:
                state = -1
        out.append(state)
    return out


def _sig_rsi_reversion(bars, p):
    r = rsi(_col(bars, "close"), int(p["period"]))
    low, high = float(p["low"]), float(p["high"])
    short = p.get("short", False)
    state, out = 0, []
    for v in r:
        if v is None:
            out.append(0)
            continue
        if state == 1 and v >= high:
            state = 0
        elif state == -1 and v <= 100.0 - high:
            state = 0
        if state == 0:
            if v < low:
                state = 1
            elif short and v > 100.0 - low:
                state = -1
        out.append(state)
    return out


def _sig_zscore_reversion(bars, p):
    z = zscore(_col(bars, "close"), int(p["period"]))
    entry, exit_ = float(p["entry"]), float(p.get("exit", 0.0))
    short = p.get("short", False)
    state, out = 0, []
    for v in z:
        if v is None:
            out.append(0)
            continue
        if state == 1 and v >= -exit_:
            state = 0
        elif state == -1 and v <= exit_:
            state = 0
        if state == 0:
            if v < -entry:
                state = 1
            elif short and v > entry:
                state = -1
        out.append(state)
    return out


def _sig_always_long(bars, p):
    """Benchmark/test stance: long once `warmup` bars (default 20) exist for the ATR stop."""
    warm = int(p.get("warmup", 20))
    return [1 if i >= warm else 0 for i in range(len(bars))]


SIGNALS = {
    "sma_cross": (_sig_sma_cross, ("fast", "slow")),
    "breakout": (_sig_breakout, ("lookback",)),
    "rsi_reversion": (_sig_rsi_reversion, ("period", "low", "high")),
    "zscore_reversion": (_sig_zscore_reversion, ("period", "entry")),
    "always_long": (_sig_always_long, ()),
}

EXIT_TYPES = ("stance_exit",)
STOP_TYPES = ("atr",)


def _is_num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


@dataclass(frozen=True)
class Strategy:
    name: str
    market: str
    timeframe: str
    entry_rules: dict
    exit_rules: dict
    stop_rule: dict
    hypothesis: str
    falsifier: str
    data_required: str
    params: dict = field(default_factory=dict)

    # -- construction
    @classmethod
    def from_dict(cls, d):
        known = set(cls.__dataclass_fields__)
        extra = set(d) - known
        if extra:
            raise ValueError("unknown strategy fields: %s" % sorted(extra))
        data = dict(d)
        data.setdefault("exit_rules", {"type": "stance_exit"})
        data.setdefault("stop_rule", {"type": "atr", "period": 14, "mult": 2.0})
        for k in ("hypothesis", "falsifier", "data_required"):
            data.setdefault(k, "")
        data.setdefault("params", {})
        s = cls(**data)
        s.validate()
        return s

    def to_dict(self):
        return {k: getattr(self, k) for k in self.__dataclass_fields__}

    # -- spec helpers
    def effective_entry(self):
        """entry_rules with `params` overriding (params are the tunables)."""
        return {**self.entry_rules, **self.params}

    def validate(self):
        e = self.effective_entry()
        t = e.get("type")
        if t not in SIGNALS:
            raise ValueError("unknown entry type %r; allowed: %s" % (t, sorted(SIGNALS)))
        for req in SIGNALS[t][1]:
            if req not in e or not _is_num(e[req]) or e[req] <= 0:
                raise ValueError("entry type %s needs positive numeric %r" % (t, req))
        if t == "sma_cross" and not e["fast"] < e["slow"]:
            raise ValueError("sma_cross needs fast < slow")
        if t == "rsi_reversion" and not (0 < e["low"] < e["high"] <= 100):
            raise ValueError("rsi_reversion needs 0 < low < high <= 100")
        x = self.exit_rules
        if x.get("type", "stance_exit") not in EXIT_TYPES:
            raise ValueError("unknown exit type %r" % x.get("type"))
        for k in ("target_atr", "max_bars"):
            if k in x and x[k] is not None and (not _is_num(x[k]) or x[k] <= 0):
                raise ValueError("exit rule %s must be positive" % k)
        s = self.stop_rule
        if s.get("type") not in STOP_TYPES:
            raise ValueError("unknown stop type %r (a stop is mandatory)" % s.get("type"))
        if not _is_num(s.get("period")) or s["period"] < 1 or not _is_num(s.get("mult")) or s["mult"] <= 0:
            raise ValueError("atr stop needs period >= 1 and mult > 0")
        if not self.name:
            raise ValueError("strategy needs a name")
        return True

    def stance(self, bars):
        """Stance series; value at t depends only on bars[0..t]."""
        self.validate()
        e = self.effective_entry()
        return SIGNALS[e["type"]][0](bars, e)

    def atr_series(self, bars):
        return atr(_col(bars, "high"), _col(bars, "low"), _col(bars, "close"), int(self.stop_rule["period"]))

    def tunable_params(self):
        """Numeric parameters that parameter_sensitivity may perturb."""
        out = {k: v for k, v in self.effective_entry().items() if k != "type" and _is_num(v)}
        out["stop_mult"] = self.stop_rule["mult"]
        return out

    def with_params(self, **kw):
        """Copy with some tunables replaced. `stop_mult` edits the stop rule."""
        params = dict(self.params)
        stop = dict(self.stop_rule)
        for k, v in kw.items():
            if k == "stop_mult":
                stop["mult"] = v
            else:
                params[k] = v
        return replace(self, params=params, stop_rule=stop)

    def fingerprint(self):
        """Hash of the NORMALISED spec; ignores name and prose, so a renamed copy collides."""
        return hashlib.sha256(json.dumps(self.normalised(), sort_keys=True).encode()).hexdigest()

    def normalised(self):
        def norm(d):
            return {str(k).lower(): (round(float(v), 8) if _is_num(v) else v) for k, v in sorted(d.items())}
        return {
            "entry": norm(self.effective_entry()),
            "exit": norm({"type": "stance_exit", **{k: v for k, v in self.exit_rules.items() if v is not None}}),
            "stop": norm(self.stop_rule),
            "market": str(self.market).strip().upper(),
            "timeframe": str(self.timeframe).strip().lower(),
        }
