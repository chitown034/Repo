"""Vanessa's recommendations — the daily top 10 "big moves", scored, prioritised, learned from Steven's decisions (2026-10-23).

Steven: "allow Vanessa to give recommendations of things to do, a game of how to execute them by priority, distinguish
the value of taking action, a HITL interface to approve or disapprove, and if approved execute; anticipate where Vanessa
can be useful with a plan standing by; prioritise the top 10 actionable items daily automatically; self-learn".

Plain code, no model call. Candidates come from what the brain already measures (layers, the loop, the toolkit
registers, Steven's open steps) plus optional live signals a routine passes in (`--signals file.json`, e.g. the deck's
queue, refi list, presence score). Each candidate carries impact (1-5), effort (1-5), confidence (0-1), an owner seat,
an executor ("vanessa" = the daily cycle runs it from the queue once approved; "steven" = only he can; "mac" = a Mac
task) and a plan that is ready before he says yes. Score = impact × confidence ÷ effort × learned category weight.
Learning: every approve/decline lands in brain/recs/ledger.jsonl; `learn()` moves the category weight (approved ×1.1,
declined ×0.85, bounded 0.3-2.0) and hides a declined item for 30 days. Outputs: docs/reports/BIG-MOVES.md and
brain/recs/big-moves.json (the 6D Brain embeds it; the deck gets the same list through the routine). Stdlib only.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

WEIGHTS = "brain/recs/weights.json"
LEDGER = "brain/recs/ledger.jsonl"
OUT_JSON = "brain/recs/big-moves.json"
OUT_MD = "docs/reports/BIG-MOVES.md"
SNOOZE_DAYS = 30
CATEGORIES = ("connect", "sync", "brain", "revenue", "marketing", "money", "compliance", "ops", "steven")
# Four courses of action (Steven, 2026-10-23): what to do next, how the system improves itself, what could go wrong, what to go after.
COAS = (("big-move", "Next big moves", "the moves that bring money, clients or connections in — approve and Vanessa runs hers"),
        ("improve", "Self-improvement (loop engineering)", "what the brain, the loops and the team change in themselves to get better"),
        ("risk", "Risks and actions to take", "what is stale, failing or silent, and the action that heads it off"),
        ("opportunity", "Opportunities to pursue", "marketing, presence and new capabilities worth a move"))
RISK_WORDS = re.compile(r"\b(error|refused|failing|failed|stale|silent|broken|repair|restart|overdue|expir\w*|unproven|never run|403|no key|missing)\b", re.I)
# (question Steven asks, the words that route the brain's zero-token recall to the page that answers it)
STANDARD_QUESTIONS = (("What are the phone and Mac steps only I can do?", "STEVEN-STEPS start here three pastes then four clicks"),
                      ("What runs every morning, and when?", "daily updates schedule what runs each morning command deck isa portal 6D brain"),
                      ("Which connections are not connected yet?", "connections not connected status CONNECTIONS"),
                      ("What did the weekly loop find?", ""),
                      ("How do I approve a big move and what happens next?", "approve on the 6D Brain executes big move"),
                      ("Where is the morning brief and why did it not arrive?", "morning brief iMessage not arrive fallback e-mail"))


def _id(category: str, key: str) -> str:
    return "bm_" + hashlib.sha1(f"{category}|{key}".encode("utf-8")).hexdigest()[:10]


TOPIC_WORDS = ("imessage", "drip", "lofty", "zoho", "tidycal", "arive", "kapso", "anydesk", "orca", "jarvis", "laya", "mbs", "ticor", "pivo", "notion",
               "notebooklm", "drive", "fieldy", "openflowkit", "composio", "inkbox", "gondola", "refi", "presence", "zillow")


def topic_of(text: str) -> str:
    low = text.lower()
    for w in TOPIC_WORDS:
        if w in low:
            return w
    return ""


def rec(category: str, key: str, title: str, why: str, owner: str, executor: str, impact: int, effort: int,
        confidence: float, plan: list[str], source: str) -> dict:
    return {"id": _id(category, key), "category": category, "topic": topic_of(title + " " + why), "title": title[:140], "why": why[:300], "owner": owner,
            "executor": executor, "impact": max(1, min(5, int(impact))), "effort": max(1, min(5, int(effort))),
            "confidence": max(0.05, min(1.0, float(confidence))), "plan": [p[:200] for p in plan][:6], "source": source}


# ------------------------------------------------------------------ candidates from the brain's own measurements

def _toolkit_candidates(root: Path) -> list[dict]:
    from . import toolkit
    out = []
    for it in toolkit.inventory(root)["items"]:
        if it["kind"] not in ("connector", "mcp", "api") or it.get("state") in ("ok", "none"):
            continue
        name = it["name"]
        fix = it.get("fix") or it.get("where") or ""
        blob = (it.get("who", "") + " " + fix + " " + it["desc"]).lower().replace("no key", "").replace("no api key", "")
        steven = bool(re.search(r"steven|sign-in|sign in|tick|token|\bkey\b|\brep\b|pair|licen", blob))
        out.append(rec("connect", f"{it['kind']}:{name}", f"Connect {name}", it["desc"], it["seat"], "steven" if steven else "vanessa",
                       impact=4 if it["kind"] == "api" else 3, effort=2 if steven else 1, confidence=0.8,
                       plan=[f"Owner {it['seat']} confirms the route in the register ({'integrations/APIS.md' if it['kind']=='api' else 'integrations/MCP-SERVERS.md' if it['kind']=='mcp' else 'integrations/CONNECTIONS.md'})",
                             f"Steven: {fix}" if steven and fix else (fix or "run the connect-all step and paste the REPORT"),
                             "Vanessa re-checks the status on the next connect report and closes the item"],
                       source=f"toolkit:{it['kind']}"))
    return out


def _layer_candidates(root: Path, today: date) -> list[dict]:
    from . import layers
    out = []
    for r in layers.collect(root, today):
        if r["verdict"] != "stale":
            continue
        out.append(rec("sync", r["key"], f"Resync the {r['layer']} layer", f"last stamp {r['last']}, {r['age_days']} days old, cadence {r['cadence_days']} d",
                       "Derek", "vanessa", impact=3, effort=1, confidence=0.9,
                       plan=[f"Run the layer's own sync ({r['sync']})", "bin/brain layers --write; confirm 'even: yes'"], source="layers"))
    return out


def coa_of(c: dict) -> str:
    """Which course of action a candidate belongs to: explicit `coa`, else from its source, category and wording."""
    coa = str(c.get("coa") or "")
    if coa in {k for k, _, _ in COAS}:
        return coa
    src = str(c.get("source") or ""); cat = str(c.get("category") or ""); text = (c.get("title", "") + " " + c.get("why", ""))
    if src in ("loop:stale", "layers") or cat == "compliance" or (RISK_WORDS.search(text) and src != "steven-steps"):
        return "risk"
    if src in ("loop:gaps", "loop:untested", "loop:history", "loop:ledger", "loop:tune") or cat == "brain":
        return "improve"
    if cat == "marketing" or src.startswith("scout") or c.get("topic") in ("presence", "zillow", "drip"):
        return "opportunity"
    return "big-move"


def _improve_candidates(root: Path, today: date) -> list[dict]:
    """Loop engineering: what the last weekly loop, the decision ledger and the scout say the system should change in itself."""
    from . import loop
    out = []
    try:
        last = loop.last_run(root) or {}
    except Exception:  # noqa: BLE001 — a malformed history line must not take the whole engine down
        last = {}
    if not isinstance(last, dict):
        last = {}
    def n(key: str) -> int:
        try:
            return int(last.get(key) or 0)
        except (TypeError, ValueError):
            return 0
    ran = _strict_date(str(last.get("ts") or ""))   # a missing or garbage stamp counts as "never ran", not "ran today"
    if not last or ran is None or (today - ran).days > 7:
        out.append(rec("brain", "loop:run", "Run the weekly brain loop", "no loop run in the last 7 days — regressions would go unseen", "Vanessa", "vanessa",
                       impact=3, effort=1, confidence=0.9, plan=["bin/brain loop (writes docs/reports/BRAIN-LOOP.md)", "fix any gold question that regressed"], source="loop:history"))
    bt, bc = n("bench_total"), n("bench_correct")
    if bt and bc < bt:
        out.append(rec("brain", "loop:bench", f"Fix the {bt - bc} gold question(s) the brain gets wrong", f"bench {bc}/{bt} on {str(last.get('ts'))[:10]}", "Vanessa", "vanessa",
                       impact=3, effort=2, confidence=0.9, plan=["bin/brain loop → the failing questions", "write the answer into the routed page; reindex; re-run"], source="loop:history"))
    tp = n("tune_proposals")
    if tp:
        out.append(rec("brain", "loop:tune", f"Review {tp} tune proposal(s) from the weekly loop", "the loop proposed prompt/route changes nobody has judged", "Vanessa", "vanessa",
                       impact=2, effort=1, confidence=0.8, plan=["docs/reports/BRAIN-LOOP.md → Proposals", "promote the ones that pass the holdout; log the rest as rejected"], source="loop:tune"))
    sp = n("stale_pages")
    if sp >= 10:
        out.append(rec("brain", "loop:stale-sweep", f"Sweep the {sp} pages with stale live facts", "a page with a dated number that nobody re-checked is a wrong answer waiting", "Derek", "vanessa",
                       impact=2, effort=2, confidence=0.7, plan=["bin/brain loop lists them", "re-verify each stamp against its source or move the fact to a report"], source="loop:history"))
    uw = n("untested_wiki_pages")
    if uw >= 10:
        out.append(rec("brain", "loop:coverage", f"Add gold questions for {uw} untested wiki pages", "coverage is how the brain proves it still answers after a change", "Vanessa", "vanessa",
                       impact=2, effort=2, confidence=0.8, plan=["one question per page in brain/bench/questions.json", "bin/brain loop → count rises"], source="loop:untested"))
    # the ledger: many declines in a fortnight means the ranking is off, not Steven
    led = [d for d in read_ledger(root) if isinstance(d, dict)]
    recent_declines = [d for d in led if d.get("decision") == "declined" and (today - _date_of(str(d.get("at") or ""), today)).days <= 14]
    if len(recent_declines) >= 5:
        out.append(rec("brain", "loop:weights", f"Retune the recommendation weights ({len(recent_declines)} declines in 14 days)", "the engine should stop offering what Steven keeps saying no to",
                       "Vanessa", "vanessa", impact=3, effort=1, confidence=0.9, plan=["bin/brain recs --json → which categories were declined", "lower those weights or drop the source; log it in context/decisions.md"], source="loop:ledger"))
    # the weekly scout: new tools seen but never evaluated become opportunities
    try:
        seen = json.loads((root / "integrations/scout/seen.json").read_text(encoding="utf-8"))
        raw = seen.get("ids") if isinstance(seen, dict) else None
        ids = [str(x) for x in raw] if isinstance(raw, list) else []
        upd = _strict_date(str(seen.get("updated") or "")[:10]) if isinstance(seen, dict) else None
        if ids and (upd is None or (today - upd).days > 14):
            # category "brain", not "marketing": a no to the scout must not lower the drip / presence moves (validator P08-F1)
            r = rec("brain", "scout:run", "Run Nadia's weekly scout for new AI tooling", f"last scout {upd or 'unknown'}; {len(ids)} servers seen so far", "Nadia", "vanessa",
                    impact=2, effort=1, confidence=0.8, plan=["python3 integrations/scout/scout.py (proposal-only)", "shortlist 3 with a Context7 doc check; install nothing"], source="scout")
            r["coa"] = "opportunity"; out.append(r)
    except Exception:  # noqa: BLE001 — unreadable, unparsable or oddly shaped: no scout move, nothing else lost
        pass
    return out


def _strict_date(at: str) -> date | None:
    """YYYY-MM-DD from the front of a stamp, or None — never a guess."""
    try:
        return date.fromisoformat(at.strip()[:10])
    except (ValueError, AttributeError):
        return None


def _loop_candidates(root: Path, today: date) -> list[dict]:
    from . import loop
    out = []
    for g in loop.gaps(root)[:5]:
        q = g.get("question") or g.get("q") or ""
        if q:
            out.append(rec("brain", "gap:" + q[:60], f"Teach the brain: {q[:80]}", f"asked {g.get('count', 1)}× and not answered",
                           "Vanessa", "vanessa", impact=2, effort=1, confidence=0.7,
                           plan=["Write the answer into the routed page in plain words", "bin/brain reindex; bin/brain recall to prove it"], source="loop:gaps"))
    for p in loop.untested_pages(root)[:5]:
        out.append(rec("brain", "untested:" + p, f"Guard {p} with a gold question", "no gold question tests this page, so a regression would go unseen",
                       "Vanessa", "vanessa", impact=1, effort=1, confidence=0.9,
                       plan=["Add one question to brain/bench/questions.json with the expected phrase", "bin/brain loop → count rises"], source="loop:untested"))
    for s in loop.stale(root, today=today)[:6]:
        out.append(rec("brain", "stale:" + s["file"], f"Re-check live facts on {s['file']}", f"newest stamp {s['newest_stamp']} ({s['age_days']} days)",
                       _owner_for(s["file"]), "vanessa", impact=2, effort=2, confidence=0.6,
                       plan=["Read the page's live-sounding lines; re-verify each against its source", "Restamp the page or move the fact to a report"], source="loop:stale"))
    return out


def _owner_for(path: str) -> str:
    if path.startswith("wiki/mortgage"):
        return "Harrison"
    if path.startswith("wiki/real-estate"):
        return "Victor"
    if path.startswith(("integrations", "routines", "docs/inventory", "always-on")):
        return "Derek"
    return "Vanessa"


# What each of Steven's sign-ins unblocks (impact 1-5, effort 1-5): revenue plumbing first, tools and media last.
STEP_VALUE = {"imessage": (4, 1), "lofty": (5, 1), "zoho": (5, 1), "drip": (5, 3), "refi": (5, 1), "presence": (4, 3), "zillow": (4, 3), "arive": (4, 2),
              "tidycal": (3, 1), "mbs": (3, 2), "orca": (3, 2), "jarvis": (3, 2), "anydesk": (2, 2), "ticor": (2, 2), "pivo": (1, 2)}


def _steven_steps(root: Path) -> list[dict]:
    """The 'only you' lists in docs/STEVEN-STEPS.md: '- **a. Title** → what' lines under the bold markers below (the four clicks
    A-D and the list Vanessa carries as big moves), until the next bold marker or heading."""
    p = root / "docs/STEVEN-STEPS.md"
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return []
    # Two bold markers since 2026-10-23: the four clicks only Steven can do, and the list Vanessa carries as big moves.
    blocks = re.findall(r"\*\*(?:Then, the sign-ins and keys only you can do|Then four clicks, in this order|Carried by Vanessa as big moves)\*\*.*?\n(.*?)(?=\n\*\*[A-Z][^*\n]*\*\*|\n## |\Z)", text, re.S)
    if not blocks:
        return []
    out = []
    for item in re.findall(r"^- \*\*([A-Za-z])\. ([^*]+?)\.?\*\*(.*?)(?=^- \*\*[A-Za-z]\. |\Z)", "\n".join(blocks), re.S | re.M):
        letter, title, rest = item
        what = re.sub(r"\s+", " ", rest).strip(" →-")
        from . import toolkit
        impact, effort = STEP_VALUE.get(topic_of(title + " " + what), (3, 2))
        letter = letter.lower()
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48]   # id from the title, not the letter: re-lettering the list keeps every id (validator P05-F1)
        out.append(rec("steven", "step:" + slug, title.strip(), what[:280], toolkit._seat(title + " " + what), "steven", impact=impact, effort=effort, confidence=0.85,
                       plan=[what[:200] or "see docs/STEVEN-STEPS.md", "Say 'done " + letter + "' and Vanessa closes it and runs what it unblocks"], source="steven-steps"))
    return out


def _signal_candidates(signals: list[dict]) -> list[dict]:
    """Live signals a routine passes in: each {category, key, title, why, owner, executor, impact, effort, confidence, plan[], source}."""
    out = []
    if isinstance(signals, dict):
        signals = signals.get("signals") or signals.get("items") or []
    for s in signals or []:
        if not isinstance(s, dict):
            continue
        try:
            plan = s.get("plan", [])
            plan = [str(x) for x in plan] if isinstance(plan, list) else [str(plan)] if plan else []
            r = rec(str(s.get("category", "ops")), str(s["key"]), str(s["title"]), str(s.get("why", "")), str(s.get("owner", "Vanessa")), str(s.get("executor", "vanessa")),
                    int(s.get("impact", 3)), int(s.get("effort", 2)), float(s.get("confidence", 0.6)), plan, str(s.get("source", "signal")))
            if s.get("coa"):
                r["coa"] = str(s["coa"])
            out.append(r)
        except (KeyError, TypeError, ValueError):
            continue
    return out


def candidates(root: Path, signals: list[dict] | None = None, today: date | None = None) -> list[dict]:
    today = today or date.today()
    seen: set[str] = set()
    out = []
    for c in _signal_candidates(signals or []) + _steven_steps(root) + _toolkit_candidates(root) + _layer_candidates(root, today) + _loop_candidates(root, today) + _improve_candidates(root, today):
        if c["id"] in seen:
            continue
        seen.add(c["id"])
        out.append(c)
    return out


# ------------------------------------------------------------------ learning

def load_weights(root: Path) -> dict:
    p = root / WEIGHTS
    try:
        w = json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        w = {}
    return {c: float(w.get(c, 1.0)) for c in CATEGORIES} | {k: float(v) for k, v in w.items() if k not in CATEGORIES}


def read_ledger(root: Path) -> list[dict]:
    p = root / LEDGER
    if not p.is_file():
        return []
    out = []
    for ln in p.read_text(encoding="utf-8").splitlines():
        try:
            e = json.loads(ln)
        except ValueError:
            continue
        if isinstance(e, dict) and "id" in e and "decision" in e:
            out.append(e)
    return out


def _date_of(at: str, fallback: date) -> date:
    try:
        return date.fromisoformat(str(at)[:10])
    except ValueError:
        return fallback


def learn(root: Path, decisions: list[dict], today: date | None = None) -> dict:
    """Record decisions ({id, decision: approved|declined|later, at?, by?, category?}) and move the category weights."""
    today = today or date.today()
    known = {(e["id"], e.get("at")) for e in read_ledger(root)}
    known_dec = {(e["id"], str(e.get("at"))): e.get("decision") for e in read_ledger(root)}
    cats = {c["id"]: c["category"] for c in candidates(root, today=today)}
    w = load_weights(root)
    added = 0
    (root / LEDGER).parent.mkdir(parents=True, exist_ok=True)
    with (root / LEDGER).open("a", encoding="utf-8") as f:
        for d in decisions:
            try:
                rid, dec = str(d["id"]), str(d["decision"]).lower()
            except (KeyError, TypeError):
                continue
            if dec not in ("approved", "declined", "later", "done"):
                continue
            at = str(d.get("at") or today.isoformat())
            if (rid, at) in known or (rid, dec, at[:10]) in {(k[0], e, k[1][:10]) for k, e in known_dec.items()}:
                continue  # the same decision on the same day counts once, however it is fed
            known_dec[(rid, at)] = dec
            known.add((rid, at))
            cat = d.get("category") or cats.get(rid) or "ops"
            f.write(json.dumps({"id": rid, "decision": dec, "at": at, "by": str(d.get("by", ""))[:40], "category": cat}) + "\n")
            added += 1
            if dec == "approved":
                w[cat] = min(2.0, w.get(cat, 1.0) * 1.1)
            elif dec == "declined":
                w[cat] = max(0.3, w.get(cat, 1.0) * 0.85)
    (root / WEIGHTS).write_text(json.dumps(w, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return {"added": added, "weights": w}


def decisions_by_id(root: Path) -> dict[str, dict]:
    latest: dict[str, dict] = {}
    for e in read_ledger(root):
        if e["id"] not in latest or str(e.get("at", "")) >= str(latest[e["id"]].get("at", "")):
            latest[e["id"]] = e
    return latest


# ------------------------------------------------------------------ ranking

def value_label(score: float) -> str:
    return "high" if score >= 2.4 else "medium" if score >= 1.2 else "low"


def top(root: Path, n: int = 10, signals: list[dict] | None = None, today: date | None = None) -> list[dict]:
    today = today or date.today()
    w = load_weights(root)
    dec = decisions_by_id(root)
    cands = candidates(root, signals, today)
    by_id = {c["id"]: c for c in cands}
    snoozed_topics = {by_id[i]["topic"] for i, d in dec.items() if i in by_id and by_id[i]["topic"] and d["decision"] in ("declined", "done")
                      and (today - _date_of(d.get("at"), today)).days < SNOOZE_DAYS}
    ranked = []
    for c in cands:
        if c["topic"] and c["topic"] in snoozed_topics and c["id"] not in dec:
            continue  # "no" to Lofty means no to every Lofty move for 30 days
        d = dec.get(c["id"])
        if d:
            if d["decision"] in ("declined", "done"):
                if (today - _date_of(d.get("at"), today)).days < SNOOZE_DAYS:
                    continue
            c["decision"] = d["decision"]
            c["decided_at"] = d.get("at")
        c["weight"] = round(w.get(c["category"], 1.0), 3)
        c["score"] = round(c["impact"] * c["confidence"] / c["effort"] * c["weight"], 3)
        c["value"] = value_label(c["score"])
        ranked.append(c)
    ranked.sort(key=lambda c: (-c["score"], c["executor"] != "vanessa", c["title"]))
    # the day's list mixes what only Steven can unblock with what Vanessa can run now: at most 60% of the slots per executor
    cap = max(1, int(n * 0.6)); used: dict[str, int] = {}; picked = []; rest = []
    for c in ranked:
        if used.get(c["executor"], 0) < cap and len(picked) < n:
            picked.append(c); used[c["executor"]] = used.get(c["executor"], 0) + 1
        else:
            rest.append(c)
    for c in rest:
        if len(picked) >= n:
            break
        picked.append(c)
    picked.sort(key=lambda c: (-c["score"], c["executor"] != "vanessa", c["title"]))
    for i, c in enumerate(picked, 1):
        c["rank"] = i
    return picked


def coas(root: Path, n_per: int = 4, signals: list[dict] | None = None, today: date | None = None) -> dict:
    """The four courses of action, n_per ranked items each, from the same scored pool as top()."""
    pool = top(root, 80, signals, today)
    must = {c["id"] for c in top(root, 10, signals, today)}   # the real top 10 (with its executor cap) always reaches an approve surface (validator P05-F1)
    groups: dict[str, list] = {k: [] for k, _, _ in COAS}
    topics_used: set[str] = set()
    for c in pool:
        k = coa_of(c); c["coa"] = k
        topic = str(c.get("topic") or c["id"])
        if topic in topics_used and c["id"] not in must:
            continue                                  # one move per topic across the four lanes (validator P05-F2)
        if len(groups[k]) < n_per or c["id"] in must:
            groups[k].append(dict(c, rank=len(groups[k]) + 1)); topics_used.add(topic)
    return groups


def questions(root: Path, groups: dict, standard: int = 6) -> list[dict]:
    """Answers to the questions Steven is likely to ask: one per leading move, plus the standing ones answered by the brain's
    own zero-token recall (the page and section are named, so the answer can be checked)."""
    from . import recall
    out = []
    for k, label, _ in COAS:
        for c in (groups.get(k) or [])[:1]:
            why = (c.get("why") or "").rstrip("."); first = (c.get("plan") or [""])[0]
            if not first or first.rstrip(".") == why:
                first = "approve it on the 6D Brain and Vanessa runs it" if c.get("executor") == "vanessa" else "it is yours: do the step on the move, then say done"
            out.append({"q": f"What should I do about: {c['title']}?", "a": why + ".", "action": first, "coa": k, "ref": c["id"]})
    for q, hint in STANDARD_QUESTIONS[:standard]:
        if q.startswith("What did the weekly loop"):
            from . import loop
            last = loop.last_run(root) or {}
            if last:
                a = (f"last run {str(last.get('ts'))[:10]}: bench {last.get('bench_correct')}/{last.get('bench_total')}, routes {last.get('route_correct')}/{last.get('route_total')}, "
                     f"{last.get('stale_pages')} stale pages, {last.get('untested_wiki_pages')} untested wiki pages, {last.get('tune_proposals')} tune proposals, "
                     f"{last.get('learned_promoted')}/{last.get('learned_candidates')} learned facts promoted")
                out.append({"q": q, "a": a, "action": "Open docs/reports/BRAIN-LOOP.md; the Self-improvement lane above carries the fixes", "coa": "question", "ref": "brain/loop-history.jsonl"})
                continue
        try:
            r = recall.recall(hint or q, root=root)
            ev = str(r.get("evidence") or "")
            body = ev.split("\n", 1)[1] if "\n" in ev else ev
            body = _clean_answer(body)
            f, sec = r.get("file"), r.get("section")
            action = f"Open {f}" + (f" § {sec}" if sec else "") if f else "ask Vanessa (the brain found no page for this)"
            out.append({"q": q, "a": body or "not in the brain", "action": action, "coa": "question",
                        "ref": str(f or ""), "confidence": float(r.get("confidence") or 0)})
        except Exception:  # noqa: BLE001
            out.append({"q": q, "a": "not in the brain (recall failed)", "action": "ask Vanessa", "coa": "question", "ref": ""})
    return out


def _clean_answer(text: str, limit: int = 320) -> str:
    """A recall passage as a readable answer: no headings, pointers, code lines, table rows or bold markers; cut at a sentence."""
    keep = []
    for line in text.splitlines():
        t = line.strip()
        if not t or t.startswith("#") or t.startswith("|") or t.startswith("```") or t.startswith("[pointer"):
            continue
        if t.startswith("`") and t.endswith("`"):
            continue
        keep.append(t)
    body = " ".join(keep)
    body = re.sub(r"\[pointer → [^\]]*\]", " ", body)
    body = re.sub(r"`[^`]*`", lambda m: m.group(0)[1:-1] if len(m.group(0)) < 40 else "", body)
    body = re.sub(r"\*\*|__|(?<!\w)[*_](?!\w)", "", body)
    body = re.sub(r"\s+", " ", body).strip()
    if len(body) > limit:
        cut = body[:limit]
        end = max(cut.rfind(". "), cut.rfind("; "), cut.rfind(": "))
        body = (cut[:end + 1] if end > limit // 2 else cut.rsplit(" ", 1)[0] + "…")
    return body


def format_top(items: list[dict]) -> str:
    out = [f"{'#':>2} {'score':>5} {'value':<6} {'who':<9} {'exec':<7} title"]
    for c in items:
        out.append(f"{c['rank']:>2} {c['score']:>5} {c['value']:<6} {c['owner'][:9]:<9} {c['executor']:<7} {c['title'][:70]}{' [' + c['decision'] + ']' if c.get('decision') else ''}")
    return "\n".join(out)


def write(root: Path, n: int = 10, signals: list[dict] | None = None, today: date | None = None) -> Path:
    today = today or date.today()
    items = top(root, n, signals, today)
    groups = coas(root, 4, signals, today)
    qs = questions(root, groups)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    (root / OUT_JSON).parent.mkdir(parents=True, exist_ok=True)
    (root / OUT_JSON).write_text(json.dumps({"generated": now, "date": today.isoformat(), "items": items, "weights": load_weights(root),
                                             "coas": [{"key": k, "label": label, "about": about, "items": groups.get(k, [])} for k, label, about in COAS],
                                             "questions": qs}, indent=1) + "\n", encoding="utf-8")
    L = [f"# Big moves — Vanessa's top {n} for {today.isoformat()}", "",
         "Scored impact × confidence ÷ effort × a weight the brain learns from Steven's approvals and declines",
         "(`brain/recs/weights.json`, `brain/recs/ledger.jsonl`). Approve or decline on the 6D Brain or the Command Deck;",
         "an approved item whose executor is Vanessa is queued and run by the 6:25 AM daily cycle. `bin/brain recs`.", "",
         "| # | Score | Value | Owner | Executor | Move | Why | Plan standing by |", "|---|---|---|---|---|---|---|---|"]
    for c in items:
        plan = " → ".join(c["plan"])
        L.append(f"| {c['rank']} | {c['score']} | {c['value']} | {c['owner']} | {c['executor']} | {c['title']}{' (' + c['decision'] + ')' if c.get('decision') else ''} | {c['why'].replace('|', '/')} | {plan.replace('|', '/')} |")
    L += ["", "## Four courses of action (4 each)", ""]
    for k, label, about in COAS:
        L += [f"### {label}", f"_{about}_", ""]
        for c in groups.get(k, []):
            L.append(f"- **{c['title']}** ({c['value']} value, score {c['score']}, {c['executor']}) — {c['why']}. First step: {(c.get('plan') or ['—'])[0]}")
        if not groups.get(k):
            L.append("- nothing in this lane today")
        L.append("")
    L += ["## Questions you may have", ""]
    for q in qs:
        L.append(f"- **{q['q']}** {q['a']} → {q['action']}")
    w = load_weights(root)
    L += ["", "Category weights: " + ", ".join(f"{k} {v:.2f}" for k, v in sorted(w.items())), f"Generated {now}."]
    (root / OUT_MD).parent.mkdir(parents=True, exist_ok=True)
    (root / OUT_MD).write_text("\n".join(L) + "\n", encoding="utf-8")
    return root / OUT_MD
