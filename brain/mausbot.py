"""MausBots: the AI org structured as an OpenMausBot workspace (integrations/openmausbot/).

Steven, 2026-11-15: "install OpenMausBot and wire my AI org to be structured within Mausbots"; "add mausbots to the
dashboard and finish setting up".

One OpenMausBot team per department. Vanessa is Chief of the Executive Office and manages every department; each
executive is Chief of their own department; every other seat joins the department of the executive above it in the
reporting line. A workspace holds at most 100 bots (MAX_WORKSPACE_BOTS in OpenMausBot's server, 0.1.160) and the org
has more seats than that, so the core gets bots within CAP: every tier-1 seat, every named seat, every seat that leads
others, then the tier-2 seats of whole departments in DEPT_ORDER while they fit. Every other seat is on its
department Chief's specialist bench: listed in the Chief's soul, dispatched as a Claude Code subagent, never lost.

`place()` is pure (roster in, placement out) so the Agent OS manifest can carry each seat's MausBots placement;
`render()` builds the team file and the Chiefs' souls; `write()`/`check()` keep integrations/openmausbot/ current;
`summary()` is what the dashboards show.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

OUT_DIR = "integrations/openmausbot"
TEAM_FILE = OUT_DIR + "/team.yaml"
SOUL_DIR = OUT_DIR + "/souls"
AGENT_DIR = "integrations/agent-os/agents"
HAND_DIR = ".claude/agents"   # hand-written agent files win over a generated one, as in brain/agentfiles.py
APP_VERSION = "0.1.160"     # the CLI version install.sh pins; reviewed 2026-11-15
WORKSPACE_LIMIT = 100       # OpenMausBot's MAX_WORKSPACE_BOTS
CAP = 92                    # bots we create; the rest of the 100 stays free for bots Steven adds himself
SOUL_LIMIT = 24000          # bytes OpenMausBot takes for one soul

DEPTS = {  # executive slug -> department team name
    "cfo-marcus": "Finance", "cmo-sofia": "Marketing", "cto-derek": "Technology",
    "cco-alexandra": "Compliance", "caio-nadia": "AI Strategy", "cro-victor": "Revenue",
    "ciso-elena": "Security", "cto-innovator": "Innovation",
}
TOP = "vanessa-orchestrator"
EXEC_OFFICE = "Executive Office"
TEAMS = [EXEC_OFFICE] + list(DEPTS.values())
DEPT_ORDER = ["Revenue", "Executive Office", "Marketing", "Finance", "Compliance", "AI Strategy", "Security",
              "Innovation", "Technology"]
MODELS = {"Fable 5.2": "claude/claude-fable-5-2", "Fable 5.1": "claude/claude-fable-5-2"}
DEFAULT_MODEL = "claude/claude-opus-5-5"
HALT = ("Rules that never change (CLAUDE.md HALT list): never send to a client, post publicly, pay, sign, "
        "lock or quote a rate, grant access, or write to a CRM, calendar invite or email send. Stop and write a "
        "Needs-Steven packet instead. Client data never leaves the local model. First names only.")


class MausbotError(ValueError):
    """The org cannot be placed inside one workspace as configured."""


def _q(s: str) -> str:
    """A YAML double-quoted scalar."""
    return json.dumps(s, ensure_ascii=False)


def _one_line(s: str, n: int) -> str:
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def chief_of(team: str) -> str:
    return TOP if team == EXEC_OFFICE else next(k for k, v in DEPTS.items() if v == team)


def place(agents: list[dict], named_seats: dict) -> dict:
    """Where every seat sits in MausBots: {slug: {team, as: 'bot'|'bench', chief, name}}. Pure; raises MausbotError."""
    by = {a["slug"]: a for a in agents}
    names = {v["agent"]: k for k, v in named_seats.items()}

    def dept(slug):
        seen = set()
        while slug and slug not in seen:
            seen.add(slug)
            if slug == TOP:
                return EXEC_OFFICE
            if slug in DEPTS:
                return DEPTS[slug]
            slug = (by.get(slug) or {}).get("lead")
        return EXEC_OFFICE

    def bot_name(slug):
        n = names.get(slug)
        return f"{n} ({slug})" if n else slug

    leads = {a["lead"] for a in agents if a.get("lead")}
    core = {a["slug"] for a in agents if a["tier"] == "1" or a["slug"] in names or a["slug"] in leads}
    if len(core) > CAP:
        raise MausbotError(f"{len(core)} tier-1/named/lead seats exceed CAP={CAP} (OpenMausBot holds at most "
                           f"{WORKSPACE_LIMIT} bots per workspace). Raise CAP (max {WORKSPACE_LIMIT}) or bench seats by hand.")
    for t in DEPT_ORDER:
        extra = {a["slug"] for a in agents if a["tier"] == "2" and dept(a["slug"]) == t} - core
        if len(core) + len(extra) <= CAP:
            core |= extra
    out = {}
    for a in agents:
        t = dept(a["slug"])
        out[a["slug"]] = {"team": t, "as": "bot" if a["slug"] in core else "bench", "chief": chief_of(t), "name": bot_name(a["slug"])}
    return out


def render(root: Path, manifest: dict | None = None) -> tuple[str, dict[str, str], dict]:
    """(team.yaml text, {chief slug: soul text with its bench}, placement). Raises MausbotError; writes nothing."""
    if manifest is None:
        from . import agentos
        manifest = agentos.build(root)
    agents = manifest["agents"]
    by = {a["slug"]: a for a in agents}
    pl = place(agents, manifest.get("named_seats", {}))
    name = lambda s: pl[s]["name"]  # noqa: E731
    bench = {t: sorted((a for a in agents if pl[a["slug"]]["as"] == "bench" and pl[a["slug"]]["team"] == t), key=lambda a: a["slug"]) for t in TEAMS}
    souls = {}
    for t in TEAMS:
        if not bench[t]:
            continue
        chief = chief_of(t)
        f = next((x for x in (root / HAND_DIR / (chief + ".md"), root / AGENT_DIR / (chief + ".md")) if x.is_file()), None)
        base = f.read_text(encoding="utf-8") if f else by[chief]["role"]
        lines = [base.rstrip(), "", f"## Specialist bench ({t}, {len(bench[t])} seats)",
                 "These seats are part of your department but have no bot of their own here (the workspace holds at most "
                 "100 bots). Dispatch one as a Claude Code subagent by its name, for example with the Agent tool "
                 "(subagent_type = the name) or `claude --agent <name>`; it returns its deliverable to you. "
                 "At most 8 at once, at most 4 doing web research.", ""]
        lines += [f"- `{a['slug']}`: {_one_line(a['role'], 160)}" for a in bench[t]]
        text = "\n".join(lines) + "\n"
        if len(text.encode()) > SOUL_LIMIT:
            raise MausbotError(f"{chief}'s soul with its bench is {len(text.encode())} bytes (OpenMausBot takes {SOUL_LIMIT})")
        souls[chief] = text

    core = [a for a in agents if pl[a["slug"]]["as"] == "bot"]
    members = {t: [] for t in TEAMS}
    out = ["# Generated by `bin/brain mausbot --write` (brain/mausbot.py) from the AI org roster.",
           "# Do not edit by hand; edit the roster (docs/inventory/agent-roster.md) and re-run.",
           "# Apply on the Mac: bash integrations/openmausbot/install.sh apply   (dry run first: ... plan)",
           "version: 1", "defaults:", "  approval: ask", "  computer: \"off\"", "  browser: false", "teams:"]
    for t in TEAMS:
        brief = (f"{t} of Steven Shearrill's AI team. Chief: {name(chief_of(t))}. Vanessa (Chief of Staff) routes all work; "
                 f"hand work to other teams through Vanessa, never a side channel. Read CLAUDE.md first and answer from "
                 f"the Second Brain (bin/brain recall). {HALT}")
        out += [f"  - name: {_q(t)}", f"    brief: {_q(brief)}", "    prune: false"]
    out.append("bots:")
    for a in sorted(core, key=lambda a: (a["tier"], a["slug"])):
        slug, t = a["slug"], pl[a["slug"]]["team"]
        members[t].append(slug)
        soul_file = root / AGENT_DIR / (slug + ".md")
        hand_file = root / HAND_DIR / (slug + ".md")
        out.append(f"  - name: {_q(name(slug))}")
        out.append(f"    team: {_q(t)}")
        out.append(f"    title: {_q(_one_line(a['role'], 200))}")
        if slug == TOP:
            out += ["    chief: true", "    manages: " + json.dumps(list(DEPTS.values()))]
        elif slug in DEPTS:
            out.append("    chief: true")
        if slug in souls:
            out.append(f"    soul: {{ file: {_q('souls/' + slug + '.md')} }}")
        elif hand_file.is_file() and hand_file.stat().st_size <= SOUL_LIMIT:
            out.append(f"    soul: {{ file: {_q('../../.claude/agents/' + slug + '.md')} }}")
        elif soul_file.is_file() and soul_file.stat().st_size <= SOUL_LIMIT:
            out.append(f"    soul: {{ file: {_q('../agent-os/agents/' + slug + '.md')} }}")
        else:
            out.append(f"    soul: {_q(_one_line(a['role'], 2000) + ' ' + HALT)}")
        out.append(f"    model: {MODELS.get(a['model'], DEFAULT_MODEL)}")
    out.append("rooms:")
    out += ["  - name: \"Exec council\"", f"    team: {_q(EXEC_OFFICE)}",
            "    members: " + json.dumps([name(TOP)] + [name(s) for s in DEPTS]),
            f"    responder: {_q(name(TOP))}"]
    for t in TEAMS:
        chief = chief_of(t)
        mem = [name(chief)] + [name(s) for s in members[t] if s != chief]
        out += [f"  - name: {_q(t + ' room')}", f"    team: {_q(t)}", "    members: " + json.dumps(mem, ensure_ascii=False),
                f"    responder: {_q(name(chief))}"]
    return "\n".join(out) + "\n", souls, pl


def write(root: Path) -> dict:
    """Rewrite team.yaml and souls/ (render first, so an error leaves the old files untouched). Returns summary()."""
    text, souls, _ = render(root)
    d = root / SOUL_DIR
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.md"):
        f.unlink()
    for chief, t in souls.items():
        (d / (chief + ".md")).write_text(t, encoding="utf-8")
    (root / TEAM_FILE).write_text(text, encoding="utf-8")
    return summary(root)


def check(root: Path) -> dict:
    """Are the committed team file and souls what the roster says today?"""
    try:
        text, souls, pl = render(root)
    except MausbotError as e:
        return {"ok": False, "error": str(e), "stale": True, "bots": 0, "bench": 0}
    p = root / TEAM_FILE
    stale = not p.is_file() or p.read_text(encoding="utf-8") != text
    d = root / SOUL_DIR
    have = {f.stem: f.read_text(encoding="utf-8") for f in d.glob("*.md")} if d.is_dir() else {}
    stale = stale or have != souls
    bots = sum(1 for v in pl.values() if v["as"] == "bot")
    return {"ok": not stale and bots <= CAP, "error": None, "stale": stale, "bots": bots, "bench": len(pl) - bots,
            "seats": len(pl), "teams": len(TEAMS), "rooms": len(TEAMS) + 1}


def summary(root: Path, manifest: dict | None = None) -> dict:
    """What a dashboard shows: the org inside MausBots, team by team. No client data, first names only."""
    if manifest is None:
        from . import agentos
        manifest = agentos.build(root)
    agents = manifest["agents"]
    pl = place(agents, manifest.get("named_seats", {}))
    by = {a["slug"]: a for a in agents}
    first = lambda s: pl[s]["name"].split(" (")[0]  # noqa: E731
    teams = []
    for t in TEAMS:
        chief = chief_of(t)
        bots = sorted(s for s, v in pl.items() if v["team"] == t and v["as"] == "bot" and s != chief)
        bench = sorted(s for s, v in pl.items() if v["team"] == t and v["as"] == "bench")
        teams.append({"name": t, "chief": first(chief), "chiefSlug": chief, "model": by[chief]["model"],
                      "manages": list(DEPTS.values()) if chief == TOP else [],
                      "bots": 1 + len(bots), "bench": len(bench),
                      "members": [first(s) for s in bots], "benchSeats": bench,
                      "room": t + " room"})
    n_bots = sum(t["bots"] for t in teams)
    return {"app": "OpenMausBot", "appVersion": APP_VERSION, "limit": WORKSPACE_LIMIT, "cap": CAP,
            "seats": len(pl), "bots": n_bots, "bench": len(pl) - n_bots, "free": WORKSPACE_LIMIT - n_bots,
            "teams": teams, "rooms": ["Exec council"] + [t["room"] for t in teams],
            "guard": "every bot on Ask · no computer · no browser · no connectors or routines switched on",
            "install": ["bash integrations/openmausbot/install.sh", "open the OpenMausBot app (or: openmausbot start)",
                        "bash integrations/openmausbot/install.sh plan", "bash integrations/openmausbot/install.sh apply"],
            "teamFile": TEAM_FILE, "source": "bin/brain mausbot (brain/mausbot.py)"}


def format_check(r: dict) -> str:
    if r.get("error"):
        return "mausbot: FAIL " + r["error"]
    return (f"mausbot: {r['seats']} seats -> {r['bots']} bots + {r['bench']} on Chiefs' benches, {r['teams']} teams, "
            f"{r['rooms']} rooms; team file {'STALE (run bin/brain mausbot --write)' if r['stale'] else 'current'}")
