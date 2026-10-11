"""OHLCV data loading and validation, plus a SYNTHETIC generator for tests.

No market data is bundled with this package. Steven supplies a CSV with the
columns date,open,high,low,close,volume. Everything here is local file I/O.
"""
import csv
import datetime as _dt
import math
import random

REQUIRED_COLUMNS = ("date", "open", "high", "low", "close", "volume")
SYNTHETIC_LABEL = "SYNTHETIC DATA - FOR TESTS ONLY - NOT MARKET DATA"


class DataError(ValueError):
    """Raised when a data file or bar list fails strict validation."""


def _parse_ts(text, where):
    text = str(text).strip()
    try:
        ts = _dt.datetime.fromisoformat(text)
    except ValueError:
        raise DataError("%s: unparseable timestamp %r (use ISO, e.g. 2024-01-31)" % (where, text))
    if ts.tzinfo is not None:
        ts = ts.astimezone(_dt.timezone.utc).replace(tzinfo=None)
    return ts


def _num(value, name, where):
    try:
        x = float(value)
    except (TypeError, ValueError):
        raise DataError("%s: %s is not a number: %r" % (where, name, value))
    if math.isnan(x) or math.isinf(x):
        raise DataError("%s: %s is NaN/inf" % (where, name))
    return x


def validate_bars(bars):
    """Strictly validate a list of bar dicts. Returns the list, or raises DataError."""
    if not bars:
        raise DataError("no bars supplied")
    prev = None
    for i, b in enumerate(bars):
        where = "bar %d" % i
        for k in REQUIRED_COLUMNS:
            if k not in b:
                raise DataError("%s: missing field %r" % (where, k))
        ts = _parse_ts(b["date"], where)
        o, h, l, c, v = (_num(b[k], k, where) for k in ("open", "high", "low", "close", "volume"))
        if min(o, h, l, c) <= 0:
            raise DataError("%s: prices must be > 0" % where)
        if v < 0:
            raise DataError("%s: volume is negative" % where)
        if h < l or h < max(o, c) - 1e-9 or l > min(o, c) + 1e-9:
            raise DataError("%s: inconsistent OHLC (high/low do not bracket open/close)" % where)
        if prev is not None:
            if ts == prev:
                raise DataError("%s: duplicate timestamp %s" % (where, b["date"]))
            if ts < prev:
                raise DataError("%s: timestamps not sorted ascending at %s" % (where, b["date"]))
        prev = ts
    return bars


def load_ohlcv_csv(path):
    """Load a CSV of OHLCV bars. Header names are case-insensitive."""
    try:
        fh = open(path, newline="", encoding="utf-8-sig")
    except OSError as exc:
        raise DataError("cannot open %s: %s" % (path, exc))
    with fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            raise DataError("empty file: %s" % path)
        names = {str(n).strip().lower(): n for n in reader.fieldnames if n is not None}
        missing = [c for c in REQUIRED_COLUMNS if c not in names]
        if missing:
            raise DataError("missing required columns: %s" % ", ".join(missing))
        bars = []
        for lineno, row in enumerate(reader, start=2):
            where = "line %d" % lineno
            bar = {"date": str(row[names["date"]]).strip()}
            for k in ("open", "high", "low", "close", "volume"):
                raw = row[names[k]]
                if raw is None or str(raw).strip() == "":
                    raise DataError("%s: empty %s" % (where, k))
                bar[k] = _num(raw, k, where)
            bars.append(bar)
    try:
        return validate_bars(bars)
    except DataError as exc:
        raise DataError("%s (file %s)" % (exc, path))


def synthetic_bars(seed=1, n=500, drift=0.0003, vol=0.01, momentum=0.0, start="2000-01-03"):
    """SYNTHETIC random-walk bars, deterministic per seed. FOR TESTS ONLY.

    This is NOT market data. `momentum` adds AR(1) persistence to returns so
    plumbing tests can exercise a trend-following path. Passing results on
    this data prove the code runs, never that a strategy has an edge.
    """
    rng = random.Random(seed)
    day = _dt.date.fromisoformat(start)
    price = 100.0
    prev_dev = 0.0
    bars = []
    for _ in range(int(n)):
        dev = momentum * prev_dev + rng.gauss(0.0, vol)
        prev_dev = dev
        r = drift + dev
        o = price * (1.0 + rng.gauss(0.0, vol * 0.1))
        c = max(price * (1.0 + r), 0.01)
        o = max(o, 0.01)
        hi = max(o, c) * (1.0 + abs(rng.gauss(0.0, vol * 0.3)))
        lo = min(o, c) * (1.0 - min(abs(rng.gauss(0.0, vol * 0.3)), 0.5))
        bars.append({
            "date": day.isoformat(),
            "open": round(o, 4), "high": round(hi, 4), "low": round(lo, 4),
            "close": round(c, 4), "volume": int(1000 + rng.random() * 9000),
        })
        # keep rounded OHLC consistent
        b = bars[-1]
        b["high"] = max(b["high"], b["open"], b["close"])
        b["low"] = min(b["low"], b["open"], b["close"])
        price = b["close"]
        day += _dt.timedelta(days=1)
    return bars


def write_csv(bars, path):
    """Write bars to CSV (used by selftest to make a labelled synthetic file)."""
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(REQUIRED_COLUMNS)
        for b in bars:
            w.writerow([b[k] for k in REQUIRED_COLUMNS])
