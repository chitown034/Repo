"""``brain weekly`` -- the weekly improvement review through three engineering lenses (Steven, 2026-11-22).

"add Harness engineering, graph engineering and loop engineering to weekly improvements."

- **Harness engineering** -- the scaffolding the agents run inside: cloud routines and Mac tasks, skills and
  their frontmatter, session hooks, the router's paths and the connectors. A good model in a broken harness
  still fails, so the harness is measured on its own.
- **Graph engineering** -- the shape of the knowledge: the 6D Brain graph built by ``brain/graph.py``.
  Pages with no edges, the graph split into islands, Markdown links that point nowhere and pages that carry
  no date stamp at all. A fact nobody can reach is a fact the brain does not have.
- **Loop engineering** -- whether the system is actually getting better: the brain loop's run history
  (``brain/loop-history.jsonl``), its trend, open regressions, tune proposals nobody judged, wiki pages no
  gold question guards. The full propose -> test -> compare -> promote cycle stays in the
  ``loop-engineering`` skill; this lens is the scoreboard it reads.

Plain code, no model call. ``bin/brain weekly --write`` writes docs/reports/WEEKLY-IMPROVEMENTS.md,
brain/weekly.json (read by ``brain recs`` -- each proposal becomes a move in the Self-improvement lane) and
one line in brain/weekly-history.jsonl. Proposals are proposals: nothing here edits a live prompt or task.
"""

from __future__ import annotations

import json
import re
import time
from urllib.parse import unquote
from datetime import date, datetime, timezone
from pathlib import Path

REPORT = "docs/reports/WEEKLY-IMPROVEMENTS.md"
STATE = "brain/weekly.json"
MAX_AGE_DAYS = 8   # a review older than this feeds no moves: the weekly run stopped, so its proposals are stale
HISTORY = "brain/weekly-history.jsonl"
LENSES = (
    ("harness", "Harness engineering", "the scaffolding agents run inside: routines, Mac tasks, skills, hooks, router, connectors"),
    ("graph", "Graph engineering", "the shape of the knowledge: 6D Brain graph edges, islands, dead links, undated pages"),
    ("loop", "Loop engineering", "whether the system gets better: loop run history, trend, regressions, untested pages"),
)
MD_LINK = re.compile(r"\]\(([^)\s#]+\.md)(?:#[^)]*)?\)")
LINK_SCAN = ("wiki", "context", "projects", "references", "integrations", "docs/inventory")
FAILED = re.compile(r"\bFAILED\b|\berror\b|\brefused\b|\btimeout\b", re.I)


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _proposal(kind: str, title: str, why: str, plan: list[str], impact: int = 2, effort: int = 2) -> dict:
    """`kind` is the proposal's stable name (it never carries a count), so a declined move keeps its id week to week."""
    return {"kind": kind, "title": title[:140], "why": why[:300], "plan": [p[:200] for p in plan][:5], "impact": impact, "effort": effort}


def _score(penalties: list[float]) -> int:
    return max(0, round(100 - sum(penalties)))


# ------------------------------------------------------------------ harness

def _skills_without_frontmatter(root: Path) -> list[str]:
    out = []
    for p in sorted((root / ".claude" / "skills").glob("*/SKILL.md")):
        head = p.read_text(encoding="utf-8", errors="replace")[:2000]
        if not (head.startswith("---") and re.search(r"^name:\s*\S", head, re.M) and re.search(r"^description:\s*\S", head, re.M)):
            out.append(str(p.relative_to(root)))
    return out


def _hook_scripts_missing(root: Path) -> list[str]:
    p = root / ".claude" / "settings.json"
    try:
        hooks = json.loads(p.read_text(encoding="utf-8")).get("hooks", {})
    except (OSError, ValueError):
        return []
    missing = []
    for groups in hooks.values():
        for g in groups or []:
            for h in g.get("hooks", []):
                m = re.search(r'(?:"?\$CLAUDE_PROJECT_DIR"?/)?(\.claude/[\w./-]+\.(?:sh|py|js))', h.get("command", ""))
                if m and not (root / m.group(1)).is_file():
                    missing.append(m.group(1))
    return missing


def harness(root: Path) -> dict:
    from . import doctor, toolkit
    items = toolkit.inventory(root)["items"]
    routines = [i for i in items if i["kind"] == "routine"]
    tasks = [i for i in items if i["kind"] == "mactask"]
    failing_r = [i["name"] for i in routines if FAILED.search(i["desc"])]
    failing_t = [i["name"] for i in tasks if FAILED.search(i["desc"])]
    conns = [i for i in items if i["kind"] in ("connector", "mcp")]
    reconnect = [i["name"] for i in conns if i.get("state") == "reconnect"]
    attention = [i["name"] for i in conns if i.get("state") == "attention"]
    skills_bad = _skills_without_frontmatter(root)
    hooks_missing = _hook_scripts_missing(root)
    ok_doc, rep = doctor.run(root)
    router_bad = [ln for ln in rep if ln.startswith("FAIL router")]
    m = {"routines": len(routines), "routines_failing": len(failing_r), "mac_tasks": len(tasks), "mac_tasks_failing": len(failing_t),
         "connectors": len(conns), "connectors_reconnect": len(reconnect), "connectors_attention": len(attention),
         "skills": len(list((root / ".claude" / "skills").glob("*/SKILL.md"))), "skills_no_frontmatter": len(skills_bad),
         "hooks_missing": len(hooks_missing), "router_ok": not router_bad, "doctor_ok": ok_doc}
    from . import harness as hz
    hs = hz.status(root)
    ks = hs["kill_switch"]
    m.update({"kill_switch": "ENGAGED (all)" if ks["all"] else (", ".join(ks["names"]) or "off"), "breakers_open": len(hs["breakers_open"]),
              "traced_runs_7d": hs["traces_7d"], "traced_failures_7d": hs["fails_7d"],
              "retry_policy": f"{hz.POLICY['retries']} retries → re-route → Needs-Steven",
              "budget": f"≤{hz.POLICY['max_parallel']} parallel · cap {hz.POLICY['hard_cap']} · ≤{hz.POLICY['max_web_research_per_wave']} web/wave",
              "self_tests": f"doctor {'PASS' if hs['selftests']['doctor'] else 'FAIL'} · gold {hs['selftests']['gold_questions']} · routing {hs['selftests']['org_routing']}"})
    props = []
    if hs["breakers_open"]:
        props.append(_proposal("breakers_open", f"Fix {len(hs['breakers_open'])} automation(s) whose circuit breaker is open", "refused until fixed: " + ", ".join(hs["breakers_open"][:5]),
                               ["read the last failing traces in brain/harness/trace.jsonl", "fix the cause", "bin/brain harness reset <name>"], impact=4, effort=2))
    if ks["all"] or ks["names"]:
        props.append(_proposal("kill_switch", "Decide whether to release the kill switch", f"engaged by {ks['by']} {ks['at']}: {ks['reason']}",
                               ["Steven decides", "bin/brain harness kill <name>|--all --release"], impact=3, effort=1))
    if not hs["traces_7d"]:
        props.append(_proposal("tracing_silent", "Start tracing: no automation traced a run this week", "without traces the breaker and budget cannot see anything",
                               ["every routine ends with bin/brain harness trace <name> ok|fail", "commit brain/harness/trace.jsonl with the run"], impact=3, effort=1))
    if hooks_missing:
        props.append(_proposal("hooks_missing", f"Restore {len(hooks_missing)} missing session hook script(s)", "a hook that points at a missing file fails every session: " + ", ".join(hooks_missing),
                               ["recreate or remove the hook entry in .claude/settings.json", "start a session; confirm the hook runs"], impact=4, effort=1))
    if router_bad:
        props.append(_proposal("router_dead_paths", "Fix the router's dead paths", router_bad[0], ["point the CLAUDE.md row at the real file", "bin/brain doctor → PASS"], impact=4, effort=1))
    if failing_r:
        props.append(_proposal("routines_failing", f"Repair {len(failing_r)} cloud routine(s) whose last run failed", "failing: " + "; ".join(n[:60] for n in failing_r[:4]),
                               ["read each routine's last run (list_triggers)", "fix the prompt's broken step or retire the routine", "record it in docs/inventory/cloud-routines.md"], impact=3, effort=2))
    if failing_t:
        props.append(_proposal("mac_tasks_failing", f"Repair {len(failing_t)} Mac task(s) in error", "erroring: " + "; ".join(n[:60] for n in failing_t[:4]),
                               ["read the task log from the next connect-all REPORT", "fix the spec in integrations/mac-task-specs.md"], impact=3, effort=2))
    if skills_bad:
        props.append(_proposal("skills_frontmatter", f"Give {len(skills_bad)} skill(s) proper name/description frontmatter", "a skill without a description is never picked: " + ", ".join(skills_bad[:4]),
                               ["add name + description frontmatter", "bin/brain toolkit --write"], impact=2, effort=1))
    if reconnect:
        props.append(_proposal("connectors_reconnect", f"Reconnect {len(reconnect)} connector(s)", "needs sign-in: " + ", ".join(reconnect[:6]),
                               ["Steven: claude.ai Settings → Connectors → reconnect", "next 6D rebuild re-checks"], impact=2, effort=1))
    score = _score([15 * len(hooks_missing), 0 if not router_bad else 20, min(30, 3 * len(failing_r)), min(20, 4 * len(failing_t)),
                    min(10, 2 * len(skills_bad)), min(10, 2 * len(reconnect)), min(10, 0.2 * len(attention)), 0 if ok_doc else 10,
                    10 * len(hs["breakers_open"]), 10 if (ks["all"] or ks["names"]) else 0, 0 if hs["traces_7d"] else 10])
    return {"score": score, "metrics": m, "proposals": props}


# ------------------------------------------------------------------ graph

def _components(nodes: list[str], links: list[tuple[str, str]]) -> list[set[str]]:
    parent = {n: n for n in nodes}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in links:
        if a in parent and b in parent:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
    comps: dict[str, set[str]] = {}
    for n in nodes:
        comps.setdefault(find(n), set()).add(n)
    return sorted(comps.values(), key=len, reverse=True)


def dead_links(root: Path, limit: int = 50) -> list[dict]:
    out = []
    root_r = root.resolve()
    for top in LINK_SCAN:
        base = root / top
        if not base.is_dir():
            continue
        for p in sorted(base.rglob("*.md")):
            if not p.is_file():
                continue
            text = p.read_text(encoding="utf-8", errors="replace")
            for m in MD_LINK.finditer(text):
                target = unquote(m.group(1))
                if target.startswith(("http:", "https:", "mailto:")) or target.startswith("/"):
                    continue
                dest = (p.parent / target).resolve()
                inside = dest == root_r or root_r in dest.parents
                if not (inside and dest.is_file()):
                    out.append({"file": str(p.relative_to(root)), "link": target})
                    if len(out) >= limit:
                        return out
    return out


def _call_corpus(root: Path) -> str:
    """Text of everything that actually calls an agent: routines, Mac tasks, pods/routes, skills, traces."""
    parts = []
    for rel in ("docs/inventory/mac-task-descriptions.md", "integrations/mac-task-specs.md", "wiki/ai-team/cross-functional.md"):
        try:
            parts.append((root / rel).read_text(encoding="utf-8", errors="replace"))
        except OSError:
            pass
    for p in sorted((root / "docs/inventory").glob("cloud-routines*.md")) + sorted((root / ".claude/skills").glob("*/SKILL.md")):
        parts.append(p.read_text(encoding="utf-8", errors="replace"))
    try:
        parts.append((root / "brain/harness/trace.jsonl").read_text(encoding="utf-8"))
    except OSError:
        pass
    return "\n".join(parts).lower()


def idle_agents(root: Path) -> tuple[list[str], list[str]]:
    """Agents nothing calls (idle) and Agency agents placed but not yet installed on the Mac (pending)."""
    corpus = _call_corpus(root)
    idle = []
    try:
        agents = json.loads((root / "integrations/agent-os/agents.json").read_text(encoding="utf-8")).get("agents", [])
    except (OSError, ValueError):
        agents = []
    for a in agents:
        slug = str(a.get("slug") or "")
        if slug and slug.lower() not in corpus:
            idle.append(slug)
    pending = []
    try:
        ag = json.loads((root / "integrations/agency-agents/roster.json").read_text(encoding="utf-8")).get("agents", [])
        pending = [a["installAs"] for a in ag if a.get("status") == "active" and a.get("installAs", "").lower() not in corpus]
    except (OSError, ValueError, KeyError, TypeError):
        pass
    return sorted(idle), sorted(pending)


def single_points(g: dict, limit: int = 20) -> list[dict]:
    """Articulation points among the map's non-page nodes (seats, squads, pods, stores, tools): removing one splits the map."""
    # agents are leaves under their seat by design; leave them out so a seat is not "a single point" for its own team
    adj: dict[str, set[str]] = {n["id"]: set() for n in g["nodes"] if not n["id"].startswith("agent:")}
    for l in g["links"]:
        if l["s"] in adj and l["t"] in adj and l["s"] != l["t"]:
            adj[l["s"]].add(l["t"]); adj[l["t"]].add(l["s"])
    disc, low, cuts, timer = {}, {}, {}, [0]
    for start in adj:
        if start in disc:
            continue
        disc[start] = low[start] = timer[0]; timer[0] += 1
        stack = [(start, None, iter(sorted(adj[start])))]
        children = {start: 0}
        while stack:
            v, parent, it = stack[-1]
            w = next(it, None)
            if w is None:
                stack.pop()
                if parent is not None:
                    low[parent] = min(low[parent], low[v])
                    if (stack[-1][1] is not None and low[v] >= disc[parent]):
                        cuts[parent] = cuts.get(parent, 0) + 1
                continue
            if w == parent:
                continue
            if w in disc:
                low[v] = min(low[v], disc[w])
            else:
                disc[w] = low[w] = timer[0]; timer[0] += 1
                children[v] = children.get(v, 0) + 1
                stack.append((w, v, iter(sorted(adj[w]))))
        if children.get(start, 0) > 1:
            cuts[start] = children[start] - 1
    out = [{"node": n, "cuts": c} for n, c in cuts.items() if ":" in n and "/" not in n.split(":", 1)[0]]
    out.sort(key=lambda x: (-x["cuts"], x["node"]))
    return out[:limit]


def graph_lens(root: Path, today: date | None = None) -> dict:
    from . import graph
    g = graph.build(root, today=today)
    files = [n["id"] for n in g["nodes"] if "/" in n["id"] and ":" not in n["id"]]
    pairs = [(l["s"], l["t"]) for l in g["links"]]
    deg = {n: 0 for n in files}
    for a, b in pairs:
        if a in deg:
            deg[a] += 1
        if b in deg:
            deg[b] += 1
    orphans = sorted(n for n, d in deg.items() if d == 0)
    comps = _components(files, pairs)
    islands = [c for c in comps[1:] if len(c) > 1]   # a lone page is an orphan, counted once above
    undated = sorted(n["id"] for n in g["nodes"] if n["id"] in deg and not n.get("z") and n["id"].startswith(("wiki/", "projects/", "context/")))
    dead = dead_links(root)
    idle, pending = idle_agents(root)
    spof = single_points(g)
    m = {"nodes": len(g["nodes"]), "links": len(g["links"]), "file_nodes": len(files), "orphans": len(orphans),
         "components": len(comps), "largest_component": len(comps[0]) if comps else 0, "dead_links": len(dead), "undated_pages": len(undated),
         "idle_agents": len(idle), "agents_pending_install": len(pending), "single_points_of_failure": len(spof)}
    props = []
    if spof:
        props.append(_proposal("spof", f"Back up {len(spof)} single point(s) of failure in the map", "removing one cuts part of the map off: " + ", ".join(f"{s['node']} (cuts {s['cuts']})" for s in spof[:4]),
                               ["give each a second path: a backup seat, a second connector, or a link from another hub", "bin/brain weekly → count falls"], impact=3, effort=2))
    if idle:
        props.append(_proposal("idle_agents", f"Put {len(idle)} idle agent(s) to work or park them", "no routine, Mac task, pod, skill or trace calls: " + ", ".join(idle[:5]),
                               ["give each a pod or a routine step, or mark it parked in its manifest", "bin/brain weekly → idle falls"], impact=2, effort=2))
    if dead:
        props.append(_proposal("dead_links", f"Fix {len(dead)} Markdown link(s) that point nowhere", "first: " + "; ".join(f"{d['file']} → {d['link']}" for d in dead[:3]),
                               ["repoint each link at the file that now holds the content", "bin/brain weekly → dead links 0"], impact=3, effort=1))
    if orphans:
        props.append(_proposal("orphans", f"Connect {len(orphans)} orphan page(s) to the graph", "no edge reaches: " + ", ".join(orphans[:4]),
                               ["give each page the keywords its neighbours use, or link it from its index page", "python3 dashboard/brain-4d/build.py → orphans fall"], impact=2, effort=2))
    if len(islands) > 0:
        props.append(_proposal("islands", f"Bridge {len(islands)} island(s) cut off from the main graph", f"largest island {len(islands[0])} page(s): " + ", ".join(sorted(islands[0])[:3]),
                               ["link the island's hub page from the nearest wiki index", "re-run bin/brain weekly → components fall"], impact=2, effort=2))
    if undated:
        props.append(_proposal("undated", f"Date-stamp {len(undated)} wiki/project/context page(s)", "a page without a date cannot say how fresh it is: " + ", ".join(undated[:3]),
                               ["add 'as of YYYY-MM-DD' to each page's header", "bin/brain reindex"], impact=1, effort=1))
    score = _score([min(30, 3 * len(dead)), min(25, 1.5 * len(orphans)), min(20, 4 * len(islands)), min(10, 0.5 * len(undated)),
                    min(15, 1.5 * len(spof)), min(10, 0.05 * len(idle))])
    return {"score": score, "metrics": m, "proposals": props, "orphans": orphans[:20], "dead": dead[:20], "idle": idle[:40], "spof": spof[:20]}


# ------------------------------------------------------------------ loop

def _history(root: Path) -> list[dict]:
    p = root / "brain" / "loop-history.jsonl"
    out = []
    if p.is_file():
        for ln in p.read_text(encoding="utf-8").splitlines():
            try:
                h = json.loads(ln)
            except ValueError:
                continue
            if isinstance(h, dict):
                out.append(h)
    return out


def _day(h: dict) -> date | None:
    try:
        return date.fromisoformat(str(h.get("ts", ""))[:10])
    except ValueError:
        return None


def _int(v) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


def learning(root: Path, today: date | None = None) -> dict:
    """What the agents learned from Steven: approve/decline decisions (recs ledger -> weights), learned synonyms, edit lessons."""
    today = today or date.today()
    dec = dec30 = 0
    p = root / "brain/recs/ledger.jsonl"
    if p.is_file():
        for ln in p.read_text(encoding="utf-8").splitlines():
            try:
                d = json.loads(ln)
                day = date.fromisoformat(str(d.get("at", ""))[:10])
            except (ValueError, AttributeError):
                continue
            if 0 <= (today - day).days <= 30:
                dec += 1
                dec30 += d.get("decision") == "declined"
    try:
        w = json.loads((root / "brain/recs/weights.json").read_text(encoding="utf-8"))
        moved = sum(1 for k, v in (w.get("category") or w).items() if isinstance(v, (int, float)) and abs(v - 1.0) > 1e-9) if isinstance(w, dict) else 0
    except (OSError, ValueError, AttributeError):
        moved = 0
    try:
        syn = json.loads((root / "brain/synonyms-learned.json").read_text(encoding="utf-8"))
        pr = syn.get("promoted") if isinstance(syn, dict) else None
        nsyn = len(pr) if isinstance(pr, (list, dict)) else 0
    except (OSError, ValueError):
        nsyn = 0
    edits = 0
    try:
        for ln in (root / "memory.md").read_text(encoding="utf-8").splitlines():
            mm = re.search(r"(20\d\d-\d\d-\d\d).*edit lesson", ln, re.I)
            if mm and 0 <= (today - date.fromisoformat(mm.group(1))).days <= 30:
                edits += 1
    except (OSError, ValueError):
        pass
    return {"decisions_30d": dec, "declined_30d": dec30, "weights_moved": moved, "synonyms": nsyn, "edits_30d": edits}


def loop_lens(root: Path, today: date | None = None) -> dict:
    from . import loop
    today = today or date.today()
    hist = _history(root)
    week = [h for h in hist if _day(h) and 0 <= (today - _day(h)).days <= 7]
    last = next((h for h in reversed(hist) if "bench_total" in h), hist[-1] if hist else {})
    first = week[0] if week else last
    bench_now, bench_total = _int(last.get("bench_correct")), _int(last.get("bench_total"))
    trend = bench_now - _int(first.get("bench_correct", bench_now))
    untested = loop.untested_pages(root)
    m = {"runs_last_7_days": len(week), "bench": f"{bench_now}/{bench_total}", "bench_trend_7d": trend,
         "route": f"{_int(last.get('route_correct'))}/{_int(last.get('route_total'))}", "tune_proposals": _int(last.get("tune_proposals")),
         "untested_wiki_pages": len(untested), "stale_pages": _int(last.get("stale_pages")), "gaps": _int(last.get("gaps"))}
    lr = learning(root, today)
    from . import harness as hz
    autos = hz.automations(root)
    health = {s: sum(1 for a in autos if a["state"] == s) for s in ("ok", "failing", "unknown", "off", "breaker-open")}
    m.update({"decisions_learned_30d": lr["decisions_30d"], "rejections_30d": lr["declined_30d"], "weights_moved": lr["weights_moved"],
              "synonyms_learned": lr["synonyms"], "edits_captured_30d": lr["edits_30d"],
              "automation_loops": len(autos), "loops_ok": health["ok"], "loops_failing": health["failing"] + health["breaker-open"], "loops_unknown": health["unknown"]})
    props = []
    names = [a["name"] for a in autos if a["state"] in ("failing", "breaker-open") and a["kind"] != "routine"]   # routines: harness lens
    if names:
        props.append(_proposal("loops_failing", f"Close {len(names)} automation loop(s) that are failing", "failing: " + "; ".join(n[:50] for n in names[:4]),
                               ["bin/brain harness status → the failing list", "fix or retire each; a fixed loop traces ok"], impact=3, effort=2))
    if health["unknown"]:
        props.append(_proposal("loops_unmonitored", f"Monitor {health['unknown']} automation loop(s) with no known last run", "a loop nobody can see is a loop that can fail silently",
                               ["add bin/brain harness trace <name> ok|fail as the loop's last step", "or record its last run in docs/inventory"], impact=2, effort=2))
    if not lr["edits_30d"]:
        props.append(_proposal("edits_not_learned", "Teach the agents from Steven's edits", "rejections feed the recommendation weights, but edits to drafts are not captured yet",
                               ["when Steven edits a draft, save the before/after as a lesson: bin/brain remember \"edit lesson: …\"", "bin/brain weekly → edits captured rises"], impact=2, effort=2))
    if not week:
        props.append(_proposal("loop_not_run", "Run the brain loop — none in the last 7 days", "without a run, regressions go unseen",
                               ["bin/brain loop", "fix what it lists under Regressions first"], impact=4, effort=1))
    if bench_total and bench_now < bench_total:
        props.append(_proposal("bench_misses", f"Fix the {bench_total - bench_now} gold question(s) the brain misses", f"bench {bench_now}/{bench_total}, trend {trend:+d} this week",
                               ["bin/brain loop → the failing questions", "write the answer into the routed page; reindex; re-run"], impact=3, effort=2))
    if m["tune_proposals"]:
        props.append(_proposal("tune_unjudged", f"Judge {m['tune_proposals']} tune proposal(s) — promote or reject", "the loop proposes, nobody decides: proposals pile up",
                               ["docs/reports/BRAIN-LOOP.md → Next fixes", "promote the ones the holdout passes; log the rest as rejected"], impact=2, effort=1))
    if untested:
        props.append(_proposal("untested_pages", f"Guard {len(untested)} wiki page(s) with gold questions", "untested: " + ", ".join(untested[:3]),
                               ["one question per page in brain/bench/questions.json", "bin/brain loop → count rises"], impact=2, effort=2))
    score = _score([0 if week else 30, 5 * max(0, bench_total - bench_now), 10 * max(0, -trend), min(10, 3 * m["tune_proposals"]),
                    min(20, 0.5 * len(untested)), min(10, 0.5 * m["stale_pages"]),
                    min(15, 2 * len(names)), min(10, 0.1 * health["unknown"]), 0 if lr["edits_30d"] else 5])
    return {"score": score, "metrics": m, "proposals": props, "automations": autos}


# ------------------------------------------------------------------ report

def review(root: Path, today: date | None = None) -> dict:
    today = today or date.today()
    t0 = time.perf_counter()
    res = {"ts": _now(), "date": today.isoformat(), "lenses": []}
    for key, label, about in LENSES:
        r = {"harness": harness, "graph": lambda rt: graph_lens(rt, today), "loop": lambda rt: loop_lens(rt, today)}[key](root)
        res["lenses"].append({"key": key, "label": label, "about": about, **r})
    res["seconds"] = round(time.perf_counter() - t0, 1)
    return res


def format_report(res: dict, prev: dict | None = None) -> str:
    prev_scores = {l["key"]: l["score"] for l in (prev or {}).get("lenses", [])} if prev else {}
    lines = ["# Weekly improvements — harness, graph and loop engineering", "",
             f"Run: {res['ts']} · {res.get('seconds', 0)} s · `bin/brain weekly --write`. Plain code, no model calls. "
             "Each proposal is carried into the 6D Brain's Self-improvement lane by `bin/brain recs`; nothing here edits a live prompt or task.", "",
             "| Lens | Score | Last week | What it measures |", "|---|---|---|---|"]
    for l in res["lenses"]:
        lines.append(f"| {l['label']} | {l['score']}/100 | {prev_scores.get(l['key'], '—')} | {l['about']} |")
    for l in res["lenses"]:
        lines += ["", f"## {l['label']}", "", "| Metric | Value |", "|---|---|"]
        lines += [f"| {k.replace('_', ' ')} | {v} |" for k, v in l["metrics"].items()]
        lines += ["", "Proposals:", ""]
        if l["proposals"]:
            for i, p in enumerate(l["proposals"], 1):
                lines.append(f"{i}. **{p['title']}** — {p['why']}")
                lines += [f"   - {s}" for s in p["plan"]]
        else:
            lines.append("Nothing open.")
    return "\n".join(lines) + "\n"


def load(root: Path) -> dict | None:
    p = root / STATE
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def write(root: Path, today: date | None = None) -> tuple[dict, Path]:
    prev = load(root)
    res = review(root, today)
    (root / REPORT).parent.mkdir(parents=True, exist_ok=True)
    (root / REPORT).write_text(format_report(res, prev), encoding="utf-8")
    slim = {**res, "lenses": [{k: v for k, v in l.items() if k not in ("orphans", "dead", "automations")} for l in res["lenses"]]}
    (root / STATE).write_text(json.dumps(slim, indent=1) + "\n", encoding="utf-8")
    with (root / HISTORY).open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({"ts": res["ts"], **{l["key"]: l["score"] for l in res["lenses"]}}) + "\n")
    return res, root / REPORT


def summary_line(res: dict) -> str:
    return " · ".join(f"{l['label']} {l['score']}/100 ({len(l['proposals'])} proposals)" for l in res["lenses"])
