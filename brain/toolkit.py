"""``brain toolkit`` / ``brain owner`` -- zero-token inventory of what the AI team can use, and who owns what.

Toolkit = the skills in ``.claude/skills``, the Claude Code plugins (mods) in ``integrations/mods``, the
connectors and their live status (``integrations/CONNECTIONS.md``, "Connection status" section), the cloud
routines (``docs/inventory/cloud-routines*.md``) and the Mac runner tasks (``docs/inventory/mac-task-descriptions.md``).
Every item is assigned to the seat on the org chart that owns it, by the seat names and lane words in its own
description. Owner = the Command Deck panel map in ``docs/AUTOMATION-MAP-*.md`` (who keeps a panel alive, by what
mechanism, and what stays Steven's). Nothing here calls a model, the network or a secret.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from .text import tokenize as tokens

# seat -> lane words that claim an item when no seat is named outright (first match wins, in this order)
SEATS: list[tuple[str, str, list[str]]] = [
    ("Vanessa", "Chief of Staff / orchestrator", ["vanessa", "orchestrat", "chief of staff", "whatsapp", "imessage", "interview", "prompt", "loop", "skills-refresh", "skill finder", "install agent skills"]),
    ("Steve", "Digital twin", ["twin", "steve "]),
    ("Kevin", "Standards mentor", ["kevin"]),
    ("Apex", "Trade mentor", ["apex", "futures"]),
    ("James", "Wealth mentor", ["james", "family office"]),
    ("Maxwell", "Broker coach", ["maxwell"]),
    ("Alexandra", "CCO — compliance", ["alexandra", "compliance", "trid", "respa", "fair housing"]),
    ("Elena", "CISO — security", ["elena", "security", "credential", "hardening", "vulnerab"]),
    ("Marcus", "CFO — money", ["marcus", "bookkeep", "budget", "net worth", "finance", "plaid", "tax"]),
    ("Sofia", "CMO — marketing", ["sofia", "marketing", "content", "social", "canva", "avatar", "campaign", "youtube", "instagram", "linkedin", "facebook", "tiktok"]),
    ("Victor", "CRO — revenue", ["victor", "crm", "lead", "pipeline", "lofty", "zoho", "showing", "isa "]),
    ("Elon", "CTO Innovator — engineering team", ["elon", "stress", "cpi", "process improvement", "scale", "capacity"]),
    ("Nadia", "CAIO — AI strategy", ["nadia", "ai tooling", "disrupt"]),
    ("Derek", "CTO — automation & integrations", ["derek", "automation", "integration", "code", "git", "debug", "backup", "health", "install", "mac", "connector", "api", "sync", "deploy", "design"]),
]


# Items whose lane words point at the wrong seat, pinned to the seat the org chart names (wiki/ai-team/org-chart.md).
# Keyed by item name, or by the start of a connector row's name. Keep each entry tied to an org-chart line.
OWNER = {
    "loan-pricing-agent": "Victor",    # "Tax Assessor Agent and Loan Pricing Prep Agent" sit under Victor/Harrison
    "tax-assessor-agent": "Victor",
    "Fieldy": "Vanessa",               # Meeting Scribe, under Vanessa
    "Gondola": "Vanessa",              # Travel Desk, under Vanessa
    "BlackRock": "Derek",              # "finish or remove" connector rows are Derek's; "avatar" made it Sofia's
}


def _owner(item: dict) -> str:
    for key, seat in OWNER.items():
        if item["name"] == key or item["name"].startswith(key + " ") or item["name"].startswith(key + "("):
            return seat
    return item["seat"]


def _seat(text: str) -> str:
    t = text.lower()
    for name, _role, words in SEATS:
        if any(w in t for w in words):
            return name
    return "Derek"


def _frontmatter(path: Path) -> dict:
    out: dict[str, str] = {}
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return out
    if not lines or lines[0].strip() != "---":
        return out
    for ln in lines[1:60]:
        if ln.strip() == "---":
            break
        m = re.match(r"^([a-zA-Z_-]+):\s*(.*)$", ln)
        if m:
            out[m.group(1)] = m.group(2).strip().strip('"')
    return out


def skills(root: Path) -> list[dict]:
    out = []
    for p in sorted((root / ".claude/skills").glob("*/SKILL.md")):
        fm = _frontmatter(p)
        name = fm.get("name") or p.parent.name
        desc = (fm.get("description") or "")[:220]
        out.append({"kind": "skill", "name": name, "desc": desc, "seat": _seat(name + " " + desc), "path": str(p.relative_to(root))})
    return out


def plugins(root: Path) -> list[dict]:
    out = []
    for p in sorted((root / "integrations/mods").glob("*/.claude-plugin/plugin.json")):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        desc = (d.get("description") or "")[:220]
        out.append({"kind": "plugin", "name": d.get("name") or p.parent.parent.name, "desc": desc,
                    "seat": _seat(desc), "path": str(p.parent.parent.relative_to(root))})
    return out


def _table_rows(text: str, header_word: str) -> list[list[str]]:
    """Rows of the first markdown table whose header contains ``header_word``."""
    rows, inside = [], False
    for ln in text.splitlines():
        if ln.startswith("|") and not inside and header_word in ln:
            inside = True
            continue
        if inside:
            if not ln.startswith("|"):
                if rows:
                    break
                continue
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue
            rows.append(cells)
    return rows


def connectors(root: Path) -> list[dict]:
    p = root / "integrations/CONNECTIONS.md"
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return []
    i = text.rfind("## Connection status")
    if i < 0:
        return []
    out = []
    for cells in _table_rows(text[i:], "Connection"):
        if len(cells) < 4:
            continue
        name = re.sub(r"\*\*", "", cells[0]).strip()
        status = re.sub(r"\*\*|`", "", cells[1]).strip()
        low = status.lower()
        state = ("attention" if ("403" in low or "refused" in low)
                 else "ok" if (low.startswith("connected") or low.startswith("active") or "active**" in cells[1].lower())
                 else "silent" if "silent" in low else "pending" if ("pending" in low or "initiated" in low or "never" in low or "locked" in low or "drafted" in low)
                 else "reconnect" if "reconnect" in low else "attention")
        out.append({"kind": "connector", "name": name[:90], "desc": status[:200], "state": state,
                    "fix": re.sub(r"`", "", cells[2])[:160], "who": cells[3][:40], "seat": _seat(name + " " + status)})
    return out


def routines(root: Path) -> list[dict]:
    out, seen = [], set()
    for p in sorted((root / "docs/inventory").glob("cloud-routines*.md")):
        try:
            text = p.read_text(encoding="utf-8")
        except OSError:
            continue
        for cells in _table_rows(text, "Routine"):
            if len(cells) < 3:
                continue
            name = cells[0].strip()
            if name.lower() in seen:
                continue
            seen.add(name.lower())
            enabled = cells[2].strip().lower() in ("true", "yes", "on")
            out.append({"kind": "routine", "name": name[:100], "desc": f"cron {cells[1].strip('` ')} · {'on' if enabled else 'off'} · {cells[3][:40] if len(cells) > 3 else ''}",
                        "enabled": enabled, "seat": _seat(name), "id": cells[-1].strip() if cells[-1].startswith("trig_") else ""})
    return out


def mac_tasks(root: Path) -> list[dict]:
    p = root / "docs/inventory/mac-task-descriptions.md"
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return []
    out = []
    for m in re.finditer(r"^- \*\*([a-z0-9-]+)\*\* — (.+)$", text, re.M):
        name, desc = m.group(1), m.group(2)[:200]
        out.append({"kind": "mactask", "name": name, "desc": desc, "seat": _seat(name + " " + desc)})
    return out


def inventory(root: Path) -> dict:
    items = skills(root) + plugins(root) + connectors(root) + routines(root) + mac_tasks(root)
    for it in items:
        it["seat"] = _owner(it)
    by_seat: dict[str, dict[str, int]] = {}
    for it in items:
        by_seat.setdefault(it["seat"], {}).setdefault(it["kind"], 0)
        by_seat[it["seat"]][it["kind"]] += 1
    counts = {k: sum(1 for it in items if it["kind"] == k) for k in ("skill", "plugin", "connector", "routine", "mactask")}
    counts["connector_ok"] = sum(1 for it in items if it["kind"] == "connector" and it["state"] == "ok")
    counts["connector_attention"] = counts["connector"] - counts["connector_ok"]
    seats_without = [n for n, _r, _w in SEATS if n not in by_seat]
    return {"counts": counts, "by_seat": by_seat, "seats_without_tools": seats_without, "items": items}


def format_inventory(inv: dict) -> str:
    c = inv["counts"]
    out = [f"toolkit: {c['skill']} skills · {c['plugin']} plugins · {c['connector']} connectors ({c['connector_ok']} ok, {c['connector_attention']} need attention) · {c['routine']} cloud routines · {c['mactask']} Mac tasks"]
    for seat, _role, _w in SEATS:
        k = inv["by_seat"].get(seat)
        if k:
            out.append(f"  {seat:<10} " + " · ".join(f"{n} {kind}{'s' if n != 1 else ''}" for kind, n in sorted(k.items())))
    if inv["seats_without_tools"]:
        out.append("  no tool of their own: " + ", ".join(inv["seats_without_tools"]))
    att = [it for it in inv["items"] if it["kind"] == "connector" and it["state"] != "ok"]
    if att:
        out.append("needs attention:")
        for it in att:
            out.append(f"  {it['state']:<9} {it['name'][:48]:<48} → {it['fix'][:70]} ({it['who']})")
    return "\n".join(out)


def write_page(root: Path, inv: dict) -> Path:
    """wiki/ai-team/toolkit.md — the org chart's tool register, one line per item, grouped by seat."""
    p = root / "wiki/ai-team/toolkit.md"
    L = ["# AI Team toolkit — skills, plugins, connectors, routines, Mac tasks per seat", "",
         "Generated by `bin/brain toolkit --write` from the tree (zero tokens). Each item sits under the seat whose lane",
         "claims it; the status words come from `integrations/CONNECTIONS.md` (connectors), `docs/inventory/cloud-routines*.md`",
         "(routines) and `docs/inventory/mac-task-descriptions.md` (Mac tasks). Edit those sources, not this page.", "",
         "## Counts", "",
         format_inventory(inv).splitlines()[0], ""]
    for seat, role, _w in SEATS:
        mine = [it for it in inv["items"] if it["seat"] == seat]
        if not mine:
            continue
        L += [f"## {seat} — {role}", ""]
        for kind, label in (("skill", "Skills"), ("plugin", "Plugins (Claude Code mods)"), ("connector", "Connectors"), ("routine", "Cloud routines"), ("mactask", "Mac tasks")):
            rows = [it for it in mine if it["kind"] == kind]
            if not rows:
                continue
            L.append(f"**{label}**")
            for it in rows:
                extra = f" — *{it['state']}*" if kind == "connector" else ""
                L.append(f"- `{it['name']}`{extra}: {it['desc']}")
            L.append("")
    L += ["## Seats with no tool of their own", "", ", ".join(inv["seats_without_tools"]) or "none", ""]
    p.write_text("\n".join(L), encoding="utf-8")
    return p


# ------------------------------------------------------------------ seat cards (the org chart's generated block)

ORG_CHART = "wiki/ai-team/org-chart.md"
CARDS_BEGIN = "<!-- seat-cards:begin (generated by `bin/brain toolkit --write`; edit the sources, not this block) -->"
CARDS_END = "<!-- seat-cards:end -->"
MODEL_WORD = {"fable": "Fable 5.1", "opus 5.5": "Opus 5.5", "sonnet 5": "Sonnet 5"}


def _pods(text: str) -> dict[str, list[str]]:
    """Seat name -> pods it sits in, from the org chart's Standing pods table (Pod | Seats | Delivers)."""
    sec = text.split("## Standing pods", 1)[1].split("\n## ", 1)[0] if "## Standing pods" in text else ""
    out: dict[str, list[str]] = {}
    for row in _table_rows(sec, "Pod"):
        if len(row) >= 2 and row[0] and not set(row[0]) <= set("-: "):
            for seat in (x.strip() for x in row[1].split("·")):
                out.setdefault(seat, []).append(row[0].replace(" Pod", ""))
    return out


def seat_card_rows(root: Path, inv: dict) -> list[dict]:
    """One dict per org-chart seat that owns a tool or leads a lane: model, roster agents in its lane, the tools it
    owns by kind, the pods it sits in. The org chart's table and the 6D Brain's seat lens both read this."""
    from . import agentos
    try:
        roster = json.loads((root / agentos.MANIFEST).read_text(encoding="utf-8"))["agents"]
    except (OSError, ValueError, KeyError) as e:
        # Never render blank models and zero lanes over a good table (a conflicted or missing manifest).
        raise ValueError(f"seat cards: {agentos.MANIFEST} unreadable ({e})") from e
    by_slug = {a["slug"]: a for a in roster}
    lane: dict[str, int] = {}
    for a in roster:
        lane[a["laya"]["lane"]] = lane.get(a["laya"]["lane"], 0) + 1
    try:
        pods = _pods((root / ORG_CHART).read_text(encoding="utf-8"))
    except OSError:
        pods = {}
    rows = []
    for seat, role, _w in SEATS:
        mine = [it for it in inv["items"] if it["seat"] == seat]
        if not mine and seat not in lane:
            continue
        slug, kind = agentos.ALIASES.get(seat, ("", ""))
        if kind == "roster" and slug in by_slug:
            m = by_slug[slug]["model"]
            model = MODEL_WORD.get(m.strip().lower(), m)
        else:
            model = "persona skill (session model)" if kind == "skill" else "—"
        rows.append({
            "seat": seat, "role": role, "model": model, "lane": lane.get(seat, 0),
            "proposal_only": slug in agentos.PROPOSAL_ONLY,
            "skills": [it["name"] for it in mine if it["kind"] == "skill"],
            "connectors": [[it["name"], it["state"]] for it in mine if it["kind"] == "connector"],
            "routines": sum(1 for it in mine if it["kind"] == "routine"),
            "mactasks": sum(1 for it in mine if it["kind"] == "mactask"),
            "pods": pods.get(seat, []),
        })
    return rows


def seat_cards(root: Path, inv: dict) -> str:
    """The org chart's seat-cards table, rendered from seat_card_rows. Zero tokens; rebuilt with the toolkit page."""
    L = ["| Seat | Role | Model | Agents in lane | Skills | Connectors | Routines · Mac tasks | Pods |",
         "|---|---|---|---|---|---|---|---|"]
    for r in seat_card_rows(root, inv):
        role = r["role"] + (" · proposal-only" if r["proposal_only"] else "")
        sk = ", ".join(f"`{n}`" for n in r["skills"]) or "—"
        cons = ", ".join(f"{n} ({st})" for n, st in r["connectors"]) or "—"
        L.append(f"| **{r['seat']}** | {role} | {r['model']} | {r['lane']} | {sk} | {cons} | {r['routines']} · {r['mactasks']} | "
                 f"{', '.join(r['pods']) or '—'} |")
    return "\n".join(L)


def write_cards(root: Path, inv: dict) -> bool:
    """Replace the seat-cards block in the org chart. Returns False and writes nothing if the begin/end markers are
    absent or out of order, or if the agent manifest cannot be read."""
    p = root / ORG_CHART
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return False
    head, sep, rest = text.partition(CARDS_BEGIN)
    if not sep or CARDS_END not in rest:
        return False
    tail = rest.split(CARDS_END, 1)[1]
    try:
        cards = seat_cards(root, inv)
    except ValueError:
        return False
    p.write_text(f"{head}{CARDS_BEGIN}\n{cards}\n{CARDS_END}{tail}", encoding="utf-8")
    return True


# ------------------------------------------------------------------ owner (the 80/20 panel map)

def panel_map(root: Path) -> list[dict]:
    maps = sorted(root.glob("docs/AUTOMATION-MAP-*.md"))
    if not maps:
        return []
    text = maps[-1].read_text(encoding="utf-8")
    out = []
    for cells in _table_rows(text, "| Panel |"):
        if len(cells) >= 5:
            out.append({"n": cells[0], "panel": cells[1], "owner": cells[2].replace("**", ""), "mechanism": cells[3], "residual": cells[4].replace("**", ""), "source": str(maps[-1].relative_to(root))})
    return out


def owner(root: Path, query: str) -> dict | None:
    q = set(tokens(query))
    best, score = None, 0.0
    for row in panel_map(root):
        words = set(tokens(row["panel"] + " " + row["mechanism"]))
        s = len(q & words) + (2 if row["panel"].lower() in query.lower() or query.lower() in row["panel"].lower() else 0)
        if s > score:
            best, score = row, s
    if best:
        best = dict(best, score=score)
    return best


def format_owner(r: dict | None, query: str) -> str:
    if not r:
        return f"no panel in the automation map matches '{query}' — say 'not in the brain'"
    return (f"{r['panel']} (panel {r['n']}) — owner: {r['owner']}\n  how: {r['mechanism']}\n  Steven's part: {r['residual']}\n  source: {r['source']}")
