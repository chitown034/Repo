#!/usr/bin/env python3
"""Build integrations/openmausbot/team.yaml from the AI org (integrations/agent-os/agents.json).

Steven, 2026-11-15: "install OpenMausBot and wire my AI org to be structured within Mausbots".
One OpenMausBot team per department: Vanessa is Chief of the Executive Office and manages every
department; each executive is Chief of their own department; every other seat joins the department
of the executive above it in the reporting line. Standing instructions (soul) come from the seat's
agent file in integrations/agent-os/agents/. Every bot starts on approval "ask", with no computer
and no browser, so the HALT list in CLAUDE.md holds inside OpenMausBot too.

An OpenMausBot workspace holds at most 100 bots (MAX_WORKSPACE_BOTS in its server, 0.1.160) and the org
has 185 seats. So the core gets bots, within CAP (leaving room for bots Steven adds himself): every tier-1
seat, every named seat, every seat that leads others, then the tier-2 seats of whole departments in
DEPT_ORDER while they fit. Every other seat is on its department Chief's specialist bench: listed in the
Chief's soul, dispatched as a Claude Code subagent (integrations/agent-os/install-mac.sh links all 185
agent files into ~/.claude/agents), never lost from the org.

Usage: python3 integrations/openmausbot/build-team.py   (rewrites team.yaml next to this file)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
ROSTER = os.path.join(ROOT, "integrations", "agent-os", "agents.json")
AGENT_DIR = os.path.join(ROOT, "integrations", "agent-os", "agents")

DEPTS = {  # executive slug -> department team name
    "cfo-marcus": "Finance", "cmo-sofia": "Marketing", "cto-derek": "Technology",
    "cco-alexandra": "Compliance", "caio-nadia": "AI Strategy", "cro-victor": "Revenue",
    "ciso-elena": "Security", "cto-innovator": "Innovation",
}
TOP = "vanessa-orchestrator"
EXEC_OFFICE = "Executive Office"
MODELS = {"Fable 5.2": "claude/claude-fable-5-2", "Fable 5.1": "claude/claude-fable-5-2"}
DEFAULT_MODEL = "claude/claude-opus-5-5"
CAP = 92
DEPT_ORDER = ["Revenue", "Executive Office", "Marketing", "Finance", "Compliance", "AI Strategy", "Security",
              "Innovation", "Technology"]
HALT = ("Rules that never change (CLAUDE.md HALT list): never send to a client, post publicly, pay, sign, "
        "lock or quote a rate, grant access, or write to a CRM, calendar invite or email send. Stop and write a "
        "Needs-Steven packet instead. Client data never leaves the local model. First names only.")


def q(s):
    """YAML double-quoted scalar."""
    return json.dumps(s, ensure_ascii=False)


def one_line(s, n):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def main():
    data = json.load(open(ROSTER))
    agents = data["agents"]
    by = {a["slug"]: a for a in agents}
    names = {v["agent"]: k for k, v in data.get("named_seats", {}).items()}

    def dept(slug):
        seen = set()
        while slug and slug not in seen:
            seen.add(slug)
            if slug == TOP:
                return EXEC_OFFICE
            if slug in DEPTS:
                return DEPTS[slug]
            slug = by.get(slug, {}).get("lead")
        return EXEC_OFFICE

    def bot_name(slug):
        n = names.get(slug)
        return f"{n} ({slug})" if n else slug

    teams = [EXEC_OFFICE] + list(DEPTS.values())
    chief_of = {t: (TOP if t == EXEC_OFFICE else next(k for k, v in DEPTS.items() if v == t)) for t in teams}
    named = set(names)
    leads = {a["lead"] for a in agents if a["lead"]}
    core = {a["slug"] for a in agents if a["tier"] == "1" or a["slug"] in named or a["slug"] in leads}
    if len(core) > CAP:
        sys.exit(f"build-team: {len(core)} tier-1/named/lead seats exceed CAP={CAP} (OpenMausBot holds at most 100 bots "
                 f"per workspace); nothing written. Raise CAP (max 100) or move seats onto a bench by hand.")
    for t in DEPT_ORDER:
        extra = {a["slug"] for a in agents if a["tier"] == "2" and dept(a["slug"]) == t} - core
        if len(core) + len(extra) <= CAP:
            core |= extra
    bench = {t: [a for a in agents if a["slug"] not in core and dept(a["slug"]) == t] for t in teams}
    soul_dir = os.path.join(HERE, "souls")
    os.makedirs(soul_dir, exist_ok=True)
    bench_text = {}
    for t in teams:
        if not bench[t]:
            continue
        chief = chief_of[t]
        base = open(os.path.join(AGENT_DIR, chief + ".md")).read() if os.path.exists(os.path.join(AGENT_DIR, chief + ".md")) else by[chief]["role"]
        lines = [base.rstrip(), "", f"## Specialist bench ({t}, {len(bench[t])} seats)",
                 "These seats are part of your department but have no bot of their own here (the workspace holds at most "
                 "100 bots). Dispatch one as a Claude Code subagent by its name, for example with the Agent tool "
                 "(subagent_type = the name) or `claude --agent <name>`; it returns its deliverable to you. "
                 "At most 8 at once, at most 4 doing web research.", ""]
        lines += [f"- `{a['slug']}`: {one_line(a['role'], 160)}" for a in sorted(bench[t], key=lambda a: a["slug"])]
        text = "\n".join(lines) + "\n"
        if len(text.encode()) > 24000:
            sys.exit(f"build-team: {chief}'s soul with its bench is {len(text.encode())} bytes (OpenMausBot takes 24000)")
        bench_text[chief] = text
    for f in os.listdir(soul_dir):
        if f.endswith(".md"):
            os.remove(os.path.join(soul_dir, f))
    for chief, text in bench_text.items():
        open(os.path.join(soul_dir, chief + ".md"), "w").write(text)
    agents = [a for a in agents if a["slug"] in core]
    members = {t: [] for t in teams}
    out = ["# Generated by integrations/openmausbot/build-team.py from integrations/agent-os/agents.json.",
           "# Do not edit by hand; edit the roster and re-run the script.",
           "# Apply on the Mac: bash integrations/openmausbot/install.sh apply   (dry run first: ... plan)",
           "version: 1", "defaults:", "  approval: ask", "  computer: \"off\"", "  browser: false", "teams:"]
    for t in teams:
        chief = chief_of[t]
        brief = (f"{t} of Steven Shearrill's AI team. Chief: {bot_name(chief)}. Vanessa (Chief of Staff) routes all work; "
                 f"hand work to other teams through Vanessa, never a side channel. Read CLAUDE.md first and answer from "
                 f"the Second Brain (bin/brain recall). {HALT}")
        out += [f"  - name: {q(t)}", f"    brief: {q(brief)}", "    prune: false"]
    out.append("bots:")
    for a in sorted(agents, key=lambda a: (a["tier"], a["slug"])):
        slug, t = a["slug"], dept(a["slug"])
        members[t].append(slug)
        soul_file = os.path.join(AGENT_DIR, slug + ".md")
        bench_soul = os.path.join(soul_dir, slug + ".md")
        out.append(f"  - name: {q(bot_name(slug))}")
        out.append(f"    team: {q(t)}")
        out.append(f"    title: {q(one_line(a['role'], 200))}")
        if slug == TOP:
            out += ["    chief: true", "    manages: " + json.dumps(list(DEPTS.values()))]
        elif slug in DEPTS:
            out.append("    chief: true")
        if os.path.exists(bench_soul):
            out.append(f"    soul: {{ file: {q('souls/' + slug + '.md')} }}")
        elif os.path.exists(soul_file) and os.path.getsize(soul_file) <= 24000:
            out.append(f"    soul: {{ file: {q('../agent-os/agents/' + slug + '.md')} }}")
        else:
            out.append(f"    soul: {q(one_line(a['role'], 2000) + ' ' + HALT)}")
        out.append(f"    model: {MODELS.get(a['model'], DEFAULT_MODEL)}")
    out.append("rooms:")
    out += [f"  - name: \"Exec council\"", f"    team: {q(EXEC_OFFICE)}",
            "    members: " + json.dumps([bot_name(TOP)] + [bot_name(s) for s in DEPTS]),
            f"    responder: {q(bot_name(TOP))}"]
    for t in teams:
        chief = TOP if t == EXEC_OFFICE else next(k for k, v in DEPTS.items() if v == t)
        mem = [bot_name(chief)] + [bot_name(s) for s in members[t] if s != chief]
        out += [f"  - name: {q(t + ' room')}", f"    team: {q(t)}", "    members: " + json.dumps(mem, ensure_ascii=False),
                f"    responder: {q(bot_name(chief))}"]
    path = os.path.join(HERE, "team.yaml")
    open(path, "w").write("\n".join(out) + "\n")
    print(f"wrote {os.path.relpath(path, ROOT)}: {len(agents)} bots in {len(teams)} teams, {len(teams) + 1} rooms, "
          f"{sum(len(v) for v in bench.values())} seats on Chiefs' benches")
    for t in teams:
        print(f"  {t}: {len(members[t])} bots + {len(bench[t])} on {chief_of[t]}'s bench")


if __name__ == "__main__":
    main()
