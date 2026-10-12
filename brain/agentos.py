"""Agent OS -- every AI-team agent reachable through Laya, Jarvis and Orca from one registry.

``brain os list|show|run|check|write`` reads the roster (docs/inventory/agent-roster.md) and the dispatch rules
(wiki/ai-team/cross-functional.md) and answers, for any agent or request, the same four things:

  Laya    which router row / lane / tier the zero-token first hop should pick (this module reproduces that choice
          from the org-chart rules, so the answer holds when Laya is not installed)
  Jarvis  the exact local recall to run first, and the brain page the seat starts from
  Orca    the command to paste into an Orca terminal/worktree to start that agent as a Claude Code session
  Guard   proposal-only seats, HALT words and the compliance/ECC gates that still apply

Plain code, standard library, no model calls. Nothing here starts a process, opens a network socket or touches
Orca, Laya or Jarvis: it prints the commands. What is installed on the Mac is reported from the toolkit status the
brain already keeps, never assumed.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from . import route as route_mod

ROSTER = "docs/inventory/agent-roster.md"
MANIFEST = "integrations/agent-os/agents.json"
PROPOSAL_ONLY = {"caio-nadia", "cto-innovator", "disruption-scout"}
# Named seats on the org chart that the Mac roster stores under a role slug (or only as a persona skill).
ALIASES = {
    "Vanessa": ("vanessa-orchestrator", "roster"), "Marcus": ("cfo-marcus", "roster"), "Sofia": ("cmo-sofia", "roster"),
    "Derek": ("cto-derek", "roster"), "Alexandra": ("cco-alexandra", "roster"), "Nadia": ("caio-nadia", "roster"),
    "Victor": ("cro-victor", "roster"), "Elena": ("ciso-elena", "roster"), "Elon": ("cto-innovator", "roster"),
    "Gwen": ("buyers-agent-elite", "roster"), "Marguerite": ("listing-agent-elite", "roster"),
    "Carmen": ("ca-transaction-coordinator", "roster"), "Denise": ("ca-loan-processor", "roster"),
    "Howard": ("ca-underwriter", "roster"), "Maxwell": ("broker-coach-maxwell", "roster"),
    "Kevin": ("kevin-mentor", "skill"), "James": ("james-wealth", "skill"), "Apex": ("apex-trader", "skill"),
    "Harrison": ("vanessa-broker", "skill"),
}
SEAT_OF_LEAD = {"cfo-marcus": "Marcus", "cmo-sofia": "Sofia", "cto-derek": "Derek", "cco-alexandra": "Alexandra",
                "caio-nadia": "Nadia", "cro-victor": "Victor", "ciso-elena": "Elena", "cto-innovator": "Elon",
                "vanessa-orchestrator": "Vanessa"}
TIER_MODEL = {"1": "Opus 5.5", "2": None, "3": "Sonnet 5"}


def load_roster(root: Path) -> list[dict]:
    p = root / ROSTER
    out = []
    if not p.is_file():
        return out
    for ln in p.read_text(encoding="utf-8").splitlines():
        if not ln.startswith("| ") or ln.startswith("| slug") or ln.startswith("|---"):
            continue
        c = [x.strip() for x in ln.strip().strip("|").split("|")]
        if len(c) >= 5:
            out.append({"slug": c[0], "tier": c[1], "lead": c[2], "model": c[3], "role": c[4]})
    return out


def _keywords(a: dict) -> str:
    words = [w for w in re.split(r"[-_]", a["slug"]) if len(w) > 2]
    role = re.sub(r"^(Report under [A-Za-z]+ \([^)]*\):\s*)", "", a["role"])
    return " ".join(words + role.split()[:6])


def entry(root: Path, a: dict, rules: dict) -> dict:
    lead_slug = a["lead"] if a["lead"] != "—" else ""
    seat = SEAT_OF_LEAD.get(a["slug"]) or SEAT_OF_LEAD.get(lead_slug)
    if not seat:   # benches with no lead: route the role text through the dispatch rules to find the owning lane
        seat = route_mod.route(root, a["role"], rules=rules, with_reads=False)["lead"]
    model = {"opus": "Opus 5.5", "sonnet": "Sonnet 5"}.get(a["model"], a["model"] or "Sonnet 5")
    return {
        "slug": a["slug"], "tier": a["tier"], "model": model, "lead": lead_slug or None, "role": a["role"][:160],
        "laya": {"lane": seat, "starts_from": rules["starts"].get(seat)},
        "jarvis": {"recall": f'bin/brain recall "{_keywords(a)}"', "local_only_for_client_data": True},
        "orca": {"command": f"claude --agent {a['slug']}", "worktree": "one Orca worktree per agent; <=8 live at once"},
        "guard": {"proposal_only": a["slug"] in PROPOSAL_ONLY,
                  "gates": [g for g in ("Alexandra" if seat in ("Alexandra", "Victor", "Sofia", "Harrison") else "",
                                        "ECC" if seat in ("Derek", "Elon") else "", "Vanessa") if g]},
    }


def build(root: Path) -> dict:
    rules = route_mod.load_rules(root)
    agents = [entry(root, a, rules) for a in load_roster(root)]
    named = {n: {"agent": slug, "via": via} for n, (slug, via) in ALIASES.items()}
    return {"count": len(agents), "agents": agents, "named_seats": named,
            "surfaces": {"laya": "integrations/laya/", "jarvis": "integrations/jarvis/", "orca": "integrations/remote-control/orca-remote.sh",
                         "planner": "bin/brain route"}}


def write(root: Path) -> Path:
    p = root / MANIFEST
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(build(root), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return p


def check(root: Path) -> dict:
    """Is every roster agent reachable through all three surfaces, and is the written manifest current?"""
    m = build(root)
    bad = [a["slug"] for a in m["agents"] if not (a["laya"]["lane"] and a["jarvis"]["recall"] and a["orca"]["command"])]
    stale = True
    p = root / MANIFEST
    if p.is_file():
        try:
            stale = json.loads(p.read_text(encoding="utf-8")) != m
        except ValueError:
            stale = True
    skills = {d.name for d in (root / ".claude/skills").iterdir()} if (root / ".claude/skills").is_dir() else set()
    unresolved = [n for n, (slug, via) in ALIASES.items()
                  if via == "roster" and slug not in {a["slug"] for a in m["agents"]}]
    return {"total": m["count"], "reachable": m["count"] - len(bad), "unreachable": bad, "manifest_stale": stale,
            "named_seats_unresolved": unresolved, "skills_present": len(skills)}


def plan_launch(root: Path, request: str) -> str:
    """Laya hop -> Jarvis recall -> Orca launch sheet for the seats the dispatch planner picks."""
    rules = route_mod.load_rules(root)
    plan = route_mod.route(root, request, rules=rules)
    by_slug = {a["slug"]: a for a in build(root)["agents"]}
    out = [f"request: {request}", "1. LAYA (first hop, zero tokens): confident -> go straight to the lane below; unsure -> ESCALATE to Vanessa.",
           f"   lead lane: {plan['lead']}  ·  {plan['seat_count']} seats"]
    if plan["halts"]:
        out.append("   HALT — prep only; Steven decides the marked step: " + "; ".join(h["why"] for h in plan["halts"]))
    out.append("2. JARVIS (recall first, local only for client data):")
    out.append(f'   bin/brain recall "{request}"')
    out.append("3. ORCA (paste each line into its own Orca worktree terminal; <=8 at once):")
    for i, w in enumerate(plan["waves"], 1):
        out.append(f"   wave {i}:")
        for x in w:
            alias = ALIASES.get(x["seat"])
            slug = alias[0] if alias else None
            if slug and slug in by_slug:
                out.append(f"     {x['seat']:<12} claude --agent {slug}")
            elif slug:
                out.append(f"     {x['seat']:<12} /{slug}   (persona skill in Claude Code)")
            else:
                out.append(f"     {x['seat']:<12} (run through its lead; no separate agent file)")
    out.append("4. GATES, in order: " + " -> ".join(g["gate"] for g in plan["gates"]))
    out.append("Nothing is sent, booked, paid or signed by this plan.")
    return "\n".join(out)


def format_check(r: dict) -> str:
    out = [f"agent OS: {r['reachable']}/{r['total']} roster agents reachable via Laya lane + Jarvis recall + Orca launch command",
           f"manifest {MANIFEST}: {'STALE — run bin/brain os write' if r['manifest_stale'] else 'current'}"]
    if r["named_seats_unresolved"]:
        out.append("named seats with no roster slug: " + ", ".join(r["named_seats_unresolved"]))
    return "\n".join(out)
