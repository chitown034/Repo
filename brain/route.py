"""Org-chart dispatch planner -- turn a request into the AI team's parallel plan.

``brain route "<request>"`` reads the lane table in ``wiki/ai-team/index.md`` (seat -> model tier) and the
tables in ``wiki/ai-team/cross-functional.md`` (lane keywords, joins, gates, HALT words) and returns:
the lead seat, the seats that join it, parallel waves (<=8 seats a wave, <=4 web-research seats a wave),
the gates that run after the wave, the HALTs the request trips, and the brain page each seat starts from.

Plain code, no model call. Edit the markdown tables to change the behaviour; nothing is hard-wired here
except the dispatch limits, which come from CLAUDE.md.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from . import indexer, recall as recall_mod

RULES = "wiki/ai-team/cross-functional.md"
LANES = "wiki/ai-team/index.md"
SELFTEST = "brain/bench/routes.json"
MAX_PARALLEL = 8
MAX_RESEARCH = 4
RESEARCH_WORDS = ("research", "latest", "compare", "market", "trend", "news", "what's new", "best", "options")
DEFAULT_TIER = "Sonnet 5"


def _table(text: str, heading: str) -> list[list[str]]:
    """Rows of the first markdown table under the heading that starts with ``heading``."""
    rows, inside = [], False
    for ln in text.splitlines():
        if ln.startswith("## "):
            inside = ln[3:].strip().lower().startswith(heading.lower())
            continue
        if inside and ln.startswith("|"):
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue
            rows.append(cells)
    return rows[1:]  # drop the header row


def _words(cell: str) -> list[str]:
    return [w.strip().lower() for w in cell.split(",") if w.strip()]


def _hit(text: str, phrase: str) -> bool:
    return re.search(r"(?<![a-z0-9])" + re.escape(phrase) + r"s?(?![a-z0-9])", text) is not None


def load_rules(root: Path) -> dict:
    p = root / RULES
    t = p.read_text(encoding="utf-8") if p.is_file() else ""
    lane_rows = [r for r in _table(t, "Lane keywords") if len(r) >= 2]
    lanes = {r[0]: _words(r[1]) for r in lane_rows}
    starts = {r[0]: r[2].strip("` ") for r in lane_rows if len(r) > 2 and r[2].strip("` ")}
    joins = [(_words(r[0]), r[1], r[2] if len(r) > 2 else "") for r in _table(t, "Joins") if len(r) >= 2]
    gates = [(r[0], r[1], r[2] if len(r) > 2 else "") for r in _table(t, "Gates") if len(r) >= 2]
    halts = [(_words(r[0]), r[1]) for r in _table(t, "HALT words") if len(r) >= 2]
    tiers: dict[str, str] = {}
    lp = root / LANES
    if lp.is_file():
        for r in _table(lp.read_text(encoding="utf-8"), "Routing by lane"):
            if len(r) < 3:
                continue
            for name in re.findall(r"\*\*([^*]+)\*\*", r[1]):
                seat = name.split("(")[0].strip()
                tier = r[2]
                tiers.setdefault(seat, "Fable 5.1" if "Fable" in tier else "Opus 5.5" if "Opus" in tier else DEFAULT_TIER)
            for name in re.findall(r"(?:^|,\s*)([A-Z][a-z]+)(?=,|$)", r[1]):
                tiers.setdefault(name, DEFAULT_TIER if "Sonnet" in r[2] and "Opus" not in r[2] else "Opus 5.5")
    return {"lanes": lanes, "starts": starts, "joins": joins, "gates": gates, "halts": halts, "tiers": tiers}


def route(root: Path, request: str, rules: dict | None = None, with_reads: bool = True) -> dict:
    rules = rules or load_rules(root)
    text = " " + request.lower() + " "
    scores: dict[str, list[str]] = {}
    for seat, words in rules["lanes"].items():
        hits = [w for w in words if _hit(text, w)]
        if hits:
            scores[seat] = hits
    order = sorted(scores, key=lambda s: (-len(scores[s]), list(rules["lanes"]).index(s)))
    lead = order[0] if order else "Vanessa"
    seats: dict[str, str] = {s: "owns: " + ", ".join(scores[s]) for s in order}
    for words, seat, why in rules["joins"]:
        hits = [w for w in words if _hit(text, w)]
        if hits and seat not in seats:
            seats[seat] = f"joins ({', '.join(hits)}): {why}"
    research = any(_hit(text, w) for w in RESEARCH_WORDS)
    halts = []
    for words, why in rules["halts"]:
        hits = [w for w in words if _hit(text, w)]
        if hits:
            halts.append({"words": hits, "why": why})
    gate_names = {g[0] for g in rules["gates"]}
    workers = [s for s in seats if s not in gate_names or s == lead]
    gates = []
    for name, when, what in rules["gates"]:
        on = name == "Vanessa" or name in seats or (name == "ECC" and ({"Derek", "Elon"} & set(seats)))
        if on:
            gates.append({"gate": name, "does": what})
    waves: list[list[dict]] = []
    cur: list[dict] = []
    for s in workers:
        cur.append({"seat": s, "tier": rules["tiers"].get(s, DEFAULT_TIER), "why": seats[s]})
        if len(cur) == MAX_PARALLEL:
            waves.append(cur)
            cur = []
    if research:
        slot = {"seat": "Claude web research", "tier": "Sonnet 5", "why": "the request asks for outside facts"}
        if len(cur) < MAX_PARALLEL:
            cur.append(slot)
        else:
            waves.append(cur)
            cur = [slot]
    if cur:
        waves.append(cur)
    if with_reads and waves:
        ix = indexer.load(root)
        ranked, q = recall_mod.rank(request, ix, root)
        for w in waves:
            for x in w:
                x["reads"] = _start(root, ranked, q, rules["starts"].get(x["seat"]))
    return {"request": request, "lead": lead, "waves": waves, "gates": gates, "halts": halts,
            "seat_count": sum(len(w) for w in waves),
            "limits": f"<= {MAX_PARALLEL} seats a wave, <= {MAX_RESEARCH} web-research seats a wave"}


def _start(root: Path, ranked: list, q, prefix: str | None) -> str | None:
    """Best section for the request inside the seat's own part of the brain (its "Starts from" path)."""
    if not prefix:
        return None
    for _s, _c, f in ranked:
        if not f["path"].startswith(prefix):
            continue
        try:
            text = (root / f["path"]).read_text(encoding="utf-8")
        except OSError:
            continue
        sec, _sc = recall_mod.best_section(text, q, recall_mod._ident(f))
        if sec:
            return f"{f['path']} § {sec['title']}"
    return prefix


def format_plan(p: dict) -> str:
    out = [f"request: {p['request']}", f"lead: {p['lead']}  ·  {p['seat_count']} seats  ·  {p['limits']}"]
    if p["halts"]:
        out.append("HALT — prep runs, the marked step waits for Steven (write a Needs-Steven packet):")
        out += [f"  - {h['why']}  (matched: {', '.join(h['words'])})" for h in p["halts"]]
    for i, w in enumerate(p["waves"], 1):
        out.append(f"wave {i} — in parallel:")
        for x in w:
            reads = f"\n        starts from: {x['reads']}" if x.get("reads") else ""
            out.append(f"  - {x['seat']} [{x['tier']}] — {x['why']}{reads}")
    out.append("then, in order:")
    out += [f"  - {g['gate']}: {g['does']}" for g in p["gates"]]
    return "\n".join(out)


def selftest(root: Path) -> dict:
    """Check brain/bench/routes.json: each case names the lead, seats that must join, and whether it HALTs."""
    p = root / SELFTEST
    cases = json.loads(p.read_text(encoding="utf-8")).get("cases", []) if p.is_file() else []
    rules = load_rules(root)
    ok, misses = 0, []
    for c in cases:
        plan = route(root, c["request"], rules=rules, with_reads=False)
        seats = {x["seat"] for w in plan["waves"] for x in w} | {g["gate"] for g in plan["gates"]}
        good = plan["lead"] == c["lead"] and set(c.get("must_include", [])) <= seats \
            and bool(plan["halts"]) == bool(c.get("halt", False))
        if good:
            ok += 1
        else:
            misses.append(f"{c['request'][:60]} -> lead {plan['lead']}, halt {bool(plan['halts'])}")
    return {"total": len(cases), "correct": ok, "misses": misses}
