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
    # every "## Connection status" section, oldest first; a later section's row replaces an earlier row with the same
    # name, so a partial status report appended later (a Mac REPORT, 2026-10-23) updates the register instead of shrinking it
    starts = [m.start() for m in re.finditer(r"^## Connection status", text, re.M)]
    if not starts:
        return []
    # the register starts at the last "consolidated" section (the file's own rule: later sections supersede it row by row)
    heads = [text[i:text.find("\n", i)].lower() for i in starts]
    first = max((n for n, h in enumerate(heads) if "consolidated" in h), default=len(starts) - 1)
    starts = starts[first:]
    merged: dict[str, dict] = {}
    for n, i in enumerate(starts):
        chunk = text[i:starts[n + 1]] if n + 1 < len(starts) else text[i:]
        in_section: set[str] = set()
        for cells in _table_rows(chunk, "Connection"):
            if len(cells) < 4:
                continue
            name = re.sub(r"\*\*", "", cells[0]).strip()
            key = _conn_key(name)
            if key in in_section:          # two rows of ONE section are two connections, whatever the key says (validator P04-F1)
                key = name.lower().strip()
            in_section.add(key)
            status = re.sub(r"\*\*|`", "", cells[1]).strip()
            low = status.lower()
            state = ("attention" if ("403" in low or "refused" in low)
                     else "ok" if (low.startswith(("connected", "active", "healthy", "linked")) or "active**" in cells[1].lower())
                     else "silent" if "silent" in low else "pending" if ("pending" in low or "initiated" in low or "never" in low or "locked" in low or "drafted" in low)
                     else "reconnect" if "reconnect" in low else "attention")
            merged[key] = {"kind": "connector", "name": name[:90], "desc": status[:200], "state": state,
                                       "fix": re.sub(r"`", "", cells[2])[:160], "who": cells[3][:40], "seat": _seat(name + " " + status)}
    return list(merged.values())


_MACHINES = ("mac 1", "mac 2", "alienware", "tablet", "phone", "ipad", "windows", "webhook")


def _conn_key(name: str) -> str:
    """The same connection named slightly differently across reports ("Lofty", "Lofty CRM", "Lofty (developer.lofty.com)")
    — but a different machine or device is a different connection ("AnyDesk (Mac 1)" vs "AnyDesk (Alienware, tablet, phone)")."""
    low = name.lower()
    k = re.sub(r"\(.*?\)|\b(crm|api|the|line|connector|connectors|inkbox|mac|title|property|search)\b", " ", low)
    words = re.sub(r"[^a-z0-9]+", " ", k).split()
    base = words[0] if words else low
    quals = [m for m in _MACHINES if m in low]
    return base + ("|" + "+".join(quals) if quals else "")


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


def _register(root: Path, rel: str, heading: str, first_col: str, kind: str, state_words: dict) -> list[dict]:
    """Rows of the last '## <heading>' table in a register file (MCP-SERVERS.md, APIS.md) as toolkit items (2026-10-23)."""
    try:
        text = (root / rel).read_text(encoding="utf-8")
    except OSError:
        return []
    i = text.rfind("## " + heading)
    if i < 0:
        return []
    out = []
    for cells in _table_rows(text[i:], first_col):
        if len(cells) < 5:
            continue
        name = re.sub(r"\*\*|`", "", cells[0]).strip()
        status = re.sub(r"\*\*|`", "", cells[3]).strip()
        low = status.lower()
        state = next((v for k, v in state_words.items() if low.startswith(k)), "attention")
        if state == "ok" and re.search(r"403|needs (steven|sign)|sign-in|until|blocked|not yet|refused", low):
            state = "attention"  # "connected — Zoho 403 until…" is not green (validator, 2026-10-23)
        owner = re.sub(r"\*\*", "", cells[4]).strip().split("·")[0].split("/")[0].strip()
        seat = owner if any(owner == n for n, _r, _w in SEATS) else _seat(name + " " + cells[2])
        out.append({"kind": kind, "name": name[:90], "desc": f"{cells[2][:120]} · {status[:90]}", "state": state,
                    "fix": "", "who": owner[:40], "seat": seat, "where": re.sub(r"`", "", cells[1])[:120]})
    return out


def mcps(root: Path) -> list[dict]:
    return _register(root, "integrations/MCP-SERVERS.md", "MCP servers", "Server", "mcp",
                     {"connected": "ok", "registered": "ok", "installed": "ok", "pending": "pending"})


def apis(root: Path) -> list[dict]:
    return _register(root, "integrations/APIS.md", "APIs", "API", "api",
                     {"connected": "ok", "key on mac": "ok", "ready": "pending", "pending": "pending", "no api": "none"})


def mods(root: Path) -> list[dict]:
    """Alias kept for callers: the Claude mods ARE the plugins() items (integrations/mods/<name>/.claude-plugin/plugin.json)."""
    return plugins(root)


KINDS = ("skill", "plugin", "connector", "routine", "mactask", "mcp", "api")


def inventory(root: Path) -> dict:
    items = skills(root) + plugins(root) + connectors(root) + routines(root) + mac_tasks(root) + mcps(root) + apis(root)
    by_seat: dict[str, dict[str, int]] = {}
    for it in items:
        by_seat.setdefault(it["seat"], {}).setdefault(it["kind"], 0)
        by_seat[it["seat"]][it["kind"]] += 1
    counts = {k: sum(1 for it in items if it["kind"] == k) for k in KINDS}
    counts["connector_ok"] = sum(1 for it in items if it["kind"] == "connector" and it["state"] == "ok")
    counts["connector_attention"] = counts["connector"] - counts["connector_ok"]
    seats_without = [n for n, _r, _w in SEATS if n not in by_seat]
    return {"counts": counts, "by_seat": by_seat, "seats_without_tools": seats_without, "items": items}


def format_inventory(inv: dict) -> str:
    c = inv["counts"]
    out = [f"toolkit: {c['skill']} skills · {c['plugin']} Claude mods (plugins) · {c['connector']} connectors ({c['connector_ok']} ok, {c['connector_attention']} need attention) · {c['mcp']} MCP servers · {c['api']} APIs · {c['routine']} cloud routines · {c['mactask']} Mac tasks"]
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
    L = ["# AI Team toolkit — skills, Claude mods, connectors, MCP servers, APIs, routines, Mac tasks per seat", "",
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
        for kind, label in (("skill", "Skills"), ("plugin", "Claude mods (plugins)"), ("connector", "Connectors"), ("mcp", "MCP servers"), ("api", "APIs"), ("routine", "Cloud routines"), ("mactask", "Mac tasks")):
            rows = [it for it in mine if it["kind"] == kind]
            if not rows:
                continue
            L.append(f"**{label}**")
            for it in rows:
                extra = f" — *{it['state']}*" if kind in ("connector", "mcp", "api") else ""
                L.append(f"- `{it['name']}`{extra}: {it['desc']}")
            L.append("")
    L += ["## Seats with no tool of their own", "", ", ".join(inv["seats_without_tools"]) or "none", ""]
    p.write_text("\n".join(L), encoding="utf-8")
    return p


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
