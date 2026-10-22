"""Append-only strategy memory (sqlite3). Failures are kept forever.

There is deliberately no delete or update API, and sqlite triggers abort any
DELETE or UPDATE on every table. Default path is outside the repo.
"""
import datetime as _dt
import difflib
import json
import os
import sqlite3

from .strategy import Strategy

DEFAULT_PATH = os.path.expanduser("~/.config/trading-desk/memory.sqlite3")
NAME_SIMILARITY = 0.85
PARAM_CLOSENESS = 0.10

_TABLES = ("strategies", "results", "lessons")
_SCHEMA = """
CREATE TABLE IF NOT EXISTS strategies(
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, fingerprint TEXT NOT NULL,
  market TEXT, timeframe TEXT, hypothesis TEXT, spec_json TEXT NOT NULL, created_ts TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS results(
  id INTEGER PRIMARY KEY AUTOINCREMENT, strategy_id INTEGER NOT NULL REFERENCES strategies(id),
  kind TEXT NOT NULL CHECK(kind IN ('backtest','oos','paper','gate','duplicate_flag')),
  payload_json TEXT NOT NULL, ts TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lessons(
  id INTEGER PRIMARY KEY AUTOINCREMENT, strategy_id INTEGER NOT NULL REFERENCES strategies(id),
  why TEXT, do_not_repeat TEXT, next_idea TEXT, ts TEXT NOT NULL);
"""


def _now():
    return _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds")


def _slim(metrics):
    return {k: v for k, v in (metrics or {}).items() if k != "trades"}


class Memory:
    def __init__(self, path=None):
        self.path = os.path.expanduser(path or DEFAULT_PATH)
        parent = os.path.dirname(self.path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        self._db = sqlite3.connect(self.path)
        self._db.row_factory = sqlite3.Row
        self._db.executescript(_SCHEMA)
        for t in _TABLES:
            for op in ("DELETE", "UPDATE"):
                self._db.execute(
                    "CREATE TRIGGER IF NOT EXISTS no_%s_%s BEFORE %s ON %s "
                    "BEGIN SELECT RAISE(ABORT, 'strategy memory is append-only'); END" % (op.lower(), t, op, t))
        self._db.commit()

    def close(self):
        self._db.close()

    # ------------------------------------------------------------- writing
    def record(self, strategy, backtest, oos, paper=None, why="", do_not_repeat="", next_idea="", gate=None):
        """Append one tested strategy with its results and lesson. Returns its id.

        `gate` is the dict returned by gates.evaluate(); it decides the status.
        """
        ts = _now()
        cur = self._db.execute(
            "INSERT INTO strategies(name,fingerprint,market,timeframe,hypothesis,spec_json,created_ts) "
            "VALUES(?,?,?,?,?,?,?)",
            (strategy.name, strategy.fingerprint(), strategy.market, strategy.timeframe, strategy.hypothesis,
             json.dumps(strategy.to_dict(), sort_keys=True), ts))
        sid = cur.lastrowid
        rows = [("backtest", backtest), ("oos", oos), ("paper", paper), ("gate", gate)]
        for kind, payload in rows:
            if payload is not None:
                self._db.execute("INSERT INTO results(strategy_id,kind,payload_json,ts) VALUES(?,?,?,?)",
                                 (sid, kind, json.dumps(_slim(payload), default=str), ts))
        self._db.execute("INSERT INTO lessons(strategy_id,why,do_not_repeat,next_idea,ts) VALUES(?,?,?,?,?)",
                         (sid, why, do_not_repeat, next_idea, ts))
        self._db.commit()
        return sid

    def add_paper_result(self, strategy_id, paper):
        self._db.execute("INSERT INTO results(strategy_id,kind,payload_json,ts) VALUES(?,?,?,?)",
                         (strategy_id, "paper", json.dumps(_slim(paper), default=str), _now()))
        self._db.commit()

    def log_duplicate_prevented(self, matched_strategy_id, new_name):
        self._db.execute("INSERT INTO results(strategy_id,kind,payload_json,ts) VALUES(?,?,?,?)",
                         (matched_strategy_id, "duplicate_flag", json.dumps({"attempted_name": new_name}), _now()))
        self._db.commit()

    # ------------------------------------------------------------- reading
    def status(self, strategy):
        """'PASS' / 'FAIL' from the latest gate verdict for this normalised spec, else None."""
        row = self._db.execute(
            "SELECT r.payload_json FROM results r JOIN strategies s ON s.id=r.strategy_id "
            "WHERE s.fingerprint=? AND r.kind='gate' ORDER BY r.id DESC LIMIT 1",
            (strategy.fingerprint(),)).fetchone()
        return json.loads(row["payload_json"])["verdict"] if row else None

    def _status_by_id(self, sid):
        row = self._db.execute("SELECT payload_json FROM results WHERE strategy_id=? AND kind='gate' "
                               "ORDER BY id DESC LIMIT 1", (sid,)).fetchone()
        return json.loads(row["payload_json"])["verdict"] if row else None

    def _lesson(self, sid):
        row = self._db.execute("SELECT why,do_not_repeat,next_idea FROM lessons WHERE strategy_id=? "
                               "ORDER BY id DESC LIMIT 1", (sid,)).fetchone()
        return dict(row) if row else {"why": "", "do_not_repeat": "", "next_idea": ""}

    def find_duplicates(self, strategy):
        """Compare against everything stored. Each hit: match 'identical_spec' or 'similar',
        with status and (for failures) why it failed and what not to repeat."""
        fp = strategy.fingerprint()
        mine = strategy.normalised()
        hits, seen = [], set()
        for row in self._db.execute("SELECT * FROM strategies ORDER BY id DESC"):
            if row["fingerprint"] in seen:
                continue
            old_spec = json.loads(row["spec_json"])
            old = Strategy.from_dict(old_spec)
            theirs = old.normalised()
            sim = difflib.SequenceMatcher(None, strategy.name.lower(), row["name"].lower()).ratio()
            match = None
            if row["fingerprint"] == fp:
                match = "identical_spec"
            elif (mine["entry"].get("type") == theirs["entry"].get("type")
                  and mine["market"] == theirs["market"] and mine["timeframe"] == theirs["timeframe"]
                  and (sim >= NAME_SIMILARITY or self._params_close(mine["entry"], theirs["entry"]))):
                match = "similar"
            if match:
                seen.add(row["fingerprint"])
                les = self._lesson(row["id"])
                hits.append({"id": row["id"], "name": row["name"], "match": match,
                             "name_similarity": round(sim, 3), "status": self._status_by_id(row["id"]),
                             "why": les["why"], "do_not_repeat": les["do_not_repeat"]})
        hits.sort(key=lambda h: (h["match"] != "identical_spec", -h["name_similarity"]))
        return hits

    @staticmethod
    def _params_close(a, b):
        keys = {k for k, v in a.items() if isinstance(v, float)}
        if not keys or keys != {k for k, v in b.items() if isinstance(v, float)}:
            return False
        return all(abs(a[k] - b[k]) <= PARAM_CLOSENESS * max(abs(a[k]), abs(b[k]), 1e-9) for k in keys)

    def previously_failed(self, strategy):
        """Earlier FAIL entries that are identical or similar, with their reasons."""
        return [{"name": h["name"], "why": h["why"], "do_not_repeat": h["do_not_repeat"], "match": h["match"]}
                for h in self.find_duplicates(strategy) if h["status"] == "FAIL"]

    def stats(self):
        q = self._db.execute
        tested = q("SELECT COUNT(*) FROM strategies").fetchone()[0]
        passed = failed = 0
        for row in q("SELECT id FROM strategies"):
            s = self._status_by_id(row["id"])
            passed += s == "PASS"
            failed += s == "FAIL"
        oos = [json.loads(r["payload_json"]) for r in q("SELECT payload_json FROM results WHERE kind='oos'")]
        bt = [json.loads(r["payload_json"]) for r in q("SELECT payload_json FROM results WHERE kind='backtest'")]
        paper = [json.loads(r["payload_json"]) for r in q("SELECT payload_json FROM results WHERE kind='paper'")]
        dds = [m.get("max_drawdown", 0.0) for m in oos + bt]
        gaps = [p["gap"] for p in paper if p.get("gap") is not None]
        avg = lambda xs: (sum(xs) / len(xs)) if xs else None
        return {
            "tested": tested,
            "passed": passed,
            "rejected_before_paper": failed,
            "avg_oos_return_after_costs": avg([m.get("return_after_costs", 0.0) for m in oos]),
            "avg_oos_sharpe": avg([m.get("sharpe", 0.0) for m in oos]),
            "worst_max_drawdown": max(dds) if dds else None,
            "duplicates_prevented": q("SELECT COUNT(*) FROM results WHERE kind='duplicate_flag'").fetchone()[0],
            "paper_runs": len(paper),
            "backtest_vs_paper_gap": avg(gaps),
        }
