"""``brain harness`` -- the runtime layer around every agent and automation run (Steven, 2026-11-22).

"Harness engineering: the runtime layer around every agent call. Tracing, retries, a budget, a circuit breaker for
failing agents, a kill switch, and automated self-tests."

Plain code, no model call, one committed state folder (brain/harness/) so the cloud routines, the Mac tasks and any
session share it through git:

- **Tracing** -- ``bin/brain harness trace NAME ok|fail|skip [--note TEXT] [--ms N]`` appends one line to
  brain/harness/trace.jsonl. Every routine in the orchestrator session ends with it.
- **Retries** -- the policy CLAUDE.md sets (2 retries -> re-route to another seat -> Needs-Steven packet, never a
  third retry) lives in POLICY; ``bin/brain harness policy`` prints it so every brief quotes the same numbers.
- **Budget** -- POLICY carries the dispatch budget (<= 8 parallel, hard cap 12, <= 4 web-research per wave) and a
  run budget per automation per day; ``check`` refuses a name that has used its day's budget.
- **Circuit breaker** -- a name whose last BREAK_AFTER traced runs all failed is OPEN: ``check`` refuses it until a
  person resets it (``bin/brain harness reset NAME``) or a later traced run succeeds. A cloud routine the inventory
  marks FAILED shows as a breaker warning (not a refusal -- the inventory can be stale).
- **Kill switch** -- ``bin/brain harness kill NAME|--all --reason TEXT`` / ``--release``. Stored in
  brain/harness/kill-switch.json; ``check`` refuses a killed name (exit 3) and every routine checks first.
- **Self-tests** -- ``bin/brain harness status`` folds in the last brain loop run (doctor, gold questions, org routing
  self-test, agent reachability) so the harness says whether the system still passes its own tests.

Exit codes of ``check``: 0 run, 3 killed, 4 breaker open, 5 over budget.
"""

from __future__ import annotations

import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

PACIFIC = ZoneInfo("America/Los_Angeles")   # the run budget resets at midnight where Steven lives

DIR = "brain/harness"
TRACE = f"{DIR}/trace.jsonl"
KILL = f"{DIR}/kill-switch.json"
RESETS = f"{DIR}/resets.json"
BREAK_AFTER = 3
POLICY = {
    "retries": 2,
    "after_retries": ["re-route to another seat", "Needs-Steven packet"],
    "never": "a third retry",
    "max_parallel": 8,
    "hard_cap": 12,
    "max_web_research_per_wave": 4,
    "runs_per_day_default": 6,
    "runs_per_day": {"inbox-sweep": 40},
    "source": "CLAUDE.md 'Sub-agent dispatch' + roster-tiers.json (maxParallel 8, hardCap 12)",
}
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,79}$")
STATUSES = ("ok", "fail", "skip")


class HarnessError(ValueError):
    pass


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _name(name: str) -> str:
    n = (name or "").strip().lower()
    if not NAME_RE.match(n):
        raise HarnessError(f"bad name {name!r}: lowercase letters, digits, . _ : - (max 80)")
    return n


def _read_json(p: Path, default):
    try:
        v = json.loads(p.read_text(encoding="utf-8"))
        return v if isinstance(v, type(default)) else default
    except (OSError, ValueError):
        return default


def _write_json(p: Path, v) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, indent=1, sort_keys=True) + "\n", encoding="utf-8")


# ------------------------------------------------------------------ tracing

def _valid_ts(s) -> bool:
    try:
        datetime.strptime(str(s), "%Y-%m-%dT%H:%M:%SZ")
        return True
    except ValueError:
        return False


def traces(root: Path) -> list[dict]:
    p = root / TRACE
    out = []
    if p.is_file():
        for ln in p.read_text(encoding="utf-8").splitlines():
            try:
                t = json.loads(ln)
            except ValueError:
                continue
            if isinstance(t, dict) and isinstance(t.get("name"), str) and t.get("status") in STATUSES and _valid_ts(t.get("ts")):
                out.append(t)
    out.sort(key=lambda t: t["ts"])   # time order, whatever order the lines were appended or merged in
    return out


def trace(root: Path, name: str, status: str, note: str = "", ms: int | None = None, now: datetime | None = None) -> dict:
    if status not in STATUSES:
        raise HarnessError(f"status must be one of {STATUSES}")
    rec = {"ts": _iso(now or _now()), "name": _name(name), "status": status}
    if note:
        rec["note"] = str(note)[:200]
    if ms is not None:
        rec["ms"] = max(0, int(ms))
    p = root / TRACE
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(rec) + "\n")
    return rec


# ------------------------------------------------------------------ kill switch

def kill_state(root: Path) -> dict:
    """Fail closed: a kill-switch file that exists but cannot be read (a git conflict, a bad hand edit) stops everything."""
    p = root / KILL
    if p.exists():
        try:
            k = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            k = None
        if not isinstance(k, dict) or not isinstance(k.get("names", []), list):
            return {"all": True, "names": [], "reason": f"{KILL} is unreadable — fix or delete it to release", "by": "harness", "at": "", "corrupt": True}
    else:
        k = {}
    names = k.get("names") if isinstance(k.get("names"), list) else []
    return {"all": bool(k.get("all")), "names": [n for n in names if isinstance(n, str)], "reason": str(k.get("reason") or ""),
            "by": str(k.get("by") or ""), "at": str(k.get("at") or "")}


def kill(root: Path, name: str | None, reason: str, by: str = "Steven", release: bool = False, now: datetime | None = None) -> dict:
    k = kill_state(root)
    if k.pop("corrupt", False):
        k = {"all": True, "names": [], "reason": "", "by": "", "at": ""}   # rewriting a corrupt file starts from 'all engaged'

    if name is None:
        k["all"] = not release
    else:
        n = _name(name)
        k["names"] = sorted(set(k["names"]) - {n}) if release else sorted(set(k["names"]) | {n})
    if not release and not reason.strip():
        raise HarnessError("a kill needs --reason")
    k.update({"reason": reason.strip()[:200] if not release else k["reason"], "by": by[:40], "at": _iso(now or _now())})
    _write_json(root / KILL, k)
    return k


# ------------------------------------------------------------------ breaker + budget

def _ts(t: dict) -> datetime | None:
    try:
        return datetime.strptime(t["ts"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except (KeyError, ValueError):
        return None


def breaker(root: Path, name: str, all_traces: list[dict] | None = None) -> dict:
    n = _name(name)
    resets = _read_json(root / RESETS, {})
    reset_at = str(resets.get(n) or "")
    if reset_at and not _valid_ts(reset_at):
        reset_at = ""   # a malformed reset stamp must not switch the breaker off for good
    runs = [t for t in (all_traces if all_traces is not None else traces(root)) if t["name"] == n and t["status"] != "skip" and t["ts"] > reset_at]
    tail = runs[-BREAK_AFTER:]
    open_ = len(tail) == BREAK_AFTER and all(t["status"] == "fail" for t in tail)
    return {"name": n, "open": open_, "consecutive_failures": next((i for i, t in enumerate(reversed(runs)) if t["status"] != "fail"), len(runs)),
            "last": runs[-1] if runs else None}


def reset(root: Path, name: str, now: datetime | None = None) -> None:
    r = _read_json(root / RESETS, {})
    r[_name(name)] = _iso(now or _now())
    _write_json(root / RESETS, r)


def runs_today(root: Path, name: str, now: datetime | None = None, all_traces: list[dict] | None = None) -> int:
    day = (now or _now()).astimezone(PACIFIC).date()
    n = _name(name)
    return sum(1 for t in (all_traces if all_traces is not None else traces(root))
               if t["name"] == n and t["status"] != "skip" and (_ts(t) or datetime.min.replace(tzinfo=timezone.utc)).astimezone(PACIFIC).date() == day)


def budget_for(name: str) -> int:
    return int(POLICY["runs_per_day"].get(name, POLICY["runs_per_day_default"]))


def check(root: Path, name: str, now: datetime | None = None) -> tuple[int, str]:
    n = _name(name)
    k = kill_state(root)
    if k["all"] or n in k["names"]:
        return 3, f"KILLED: {n} — {k['reason'] or 'kill switch engaged'} ({k['by']}, {k['at']}); release with `bin/brain harness kill {n} --release`"
    tr = traces(root)
    b = breaker(root, n, tr)
    if b["open"]:
        return 4, f"BREAKER OPEN: {n} failed its last {BREAK_AFTER} traced runs; fix the cause, then `bin/brain harness reset {n}`"
    used = runs_today(root, n, now, tr)
    if used >= budget_for(n):
        return 5, f"OVER BUDGET: {n} already ran {used}x today (budget {budget_for(n)}); wait for tomorrow or raise POLICY in brain/harness.py"
    return 0, f"ok: {n} may run ({used}/{budget_for(n)} today, {b['consecutive_failures']} consecutive failures)"


# ------------------------------------------------------------------ status (everything the dashboards show)

def automations(root: Path) -> list[dict]:
    """Every automation loop we know of -- cloud routines, Mac tasks, traced names -- with its health."""
    from . import toolkit
    tr = traces(root)
    traced = {}
    for t in tr:
        traced.setdefault(t["name"], []).append(t)
    out = []
    for it in toolkit.inventory(root)["items"]:
        if it["kind"] not in ("routine", "mactask"):
            continue
        desc = it["desc"]
        state = "failing" if re.search(r"\bFAILED\b|\berror\b|\btimeout\b", desc, re.I) else ("ok" if "SUCCEEDED" in desc else "unknown")
        if it["kind"] == "routine" and " · off · " in desc:
            state = "off"
        out.append({"kind": it["kind"], "name": it["name"][:80], "state": state, "seat": it.get("seat", "")})
    for n, ts in sorted(traced.items()):
        last = ts[-1]
        b = breaker(root, n, tr)
        out.append({"kind": "traced", "name": n, "state": "breaker-open" if b["open"] else ("ok" if last["status"] == "ok" else "failing"),
                    "last": last["ts"], "seat": ""})
    return out


def status(root: Path, now: datetime | None = None) -> dict:
    from . import loop
    now = now or _now()
    tr = traces(root)
    week = [t for t in tr if (_ts(t) or now) >= now - timedelta(days=7)]
    names = sorted({t["name"] for t in tr})
    breakers = [breaker(root, n, tr) for n in names]
    last = loop.last_run(root) or {}
    if not isinstance(last, dict):
        last = {}
    selftests = {"doctor": bool(last.get("doctor")), "gold_questions": f"{last.get('bench_correct', 0)}/{last.get('bench_total', 0)}",
                 "org_routing": f"{last.get('route_correct', 0)}/{last.get('route_total', 0)}",
                 "agents_reachable": f"{last.get('agents_reachable', 0)}/{last.get('agents_total', 0)}", "ran": str(last.get("ts") or "never")}
    autos = automations(root)
    return {"ts": _iso(now), "policy": POLICY, "kill_switch": kill_state(root),
            "traces_7d": len(week), "traced_names": len(names), "fails_7d": sum(1 for t in week if t["status"] == "fail"),
            "breakers_open": [b["name"] for b in breakers if b["open"]],
            "automations": {s: sum(1 for a in autos if a["state"] == s) for s in ("ok", "failing", "unknown", "off", "breaker-open")},
            "failing": [a["name"] for a in autos if a["state"] in ("failing", "breaker-open")][:20],
            "selftests": selftests}


def format_status(s: dict) -> str:
    k = s["kill_switch"]
    ks = "ENGAGED (all)" if k["all"] else (f"engaged for {', '.join(k['names'])}" if k["names"] else "off")
    a = s["automations"]
    st = s["selftests"]
    return "\n".join([
        f"harness {s['ts']}",
        f"  kill switch: {ks}",
        f"  breakers open: {', '.join(s['breakers_open']) or 'none'}",
        f"  traces (7 d): {s['traces_7d']} runs across {s['traced_names']} names, {s['fails_7d']} failed",
        f"  automations: {a['ok']} ok · {a['failing']} failing · {a['unknown']} unknown · {a['off']} off · {a['breaker-open']} breaker open",
        f"  self-tests ({st['ran']}): doctor {'PASS' if st['doctor'] else 'FAIL'} · gold {st['gold_questions']} · routing {st['org_routing']} · agents {st['agents_reachable']}",
        f"  policy: {POLICY['retries']} retries -> {' -> '.join(POLICY['after_retries'])}; <= {POLICY['max_parallel']} parallel (cap {POLICY['hard_cap']}), <= {POLICY['max_web_research_per_wave']} web per wave",
    ])
