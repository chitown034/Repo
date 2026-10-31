"""Agent files -- one Claude Code sub-agent definition per roster seat, laid out as the org chart says.

``brain os agents --write`` turns docs/inventory/agent-roster.md (172 seats: slug, tier, lead, model, role) plus the
Agent OS manifest (Laya lane, starting page, gates, proposal-only) into ``integrations/agent-os/agents/<slug>.md``:
the frontmatter Claude Code reads (name, description, model) and a short system prompt that states the seat's place
in the org chart, who it reports to, the brain page it starts from, and the HALT rules that never move. The Mac
installer links the folder into ~/.claude/agents without overwriting a hand-edited file, so ``claude --agent <slug>``
works on every machine and every running seat shows up in Orca. Plain code, no model call; nothing here is a prompt
Steven has tuned by hand -- those live on the Mac and win on conflict.
"""

from __future__ import annotations

import re
from pathlib import Path

from . import agentos

OUT = "integrations/agent-os/agents"
HAND = ".claude/agents"  # hand-written agents (Steven-tuned prompts) win over the generated seat file of the same slug
MODEL = {"Opus 5.5": "opus", "Sonnet 5": "sonnet", "Fable 5.1": "opus"}
HALT = ("Never send to a client, post publicly, pay, sign, lock or quote a rate, grant access, or write to a CRM, calendar "
        "invite or email send: stop and write a Needs-Steven packet. Never move client data off the local model. State the "
        "age of every fact. Read one brain page, not the tree; come back to CLAUDE.md to route.")


def _name(slug: str) -> str:
    return slug  # Claude Code matches --agent on the frontmatter name; keep it identical to the slug


def render(a: dict, lead_of: dict) -> str:
    seat = a["laya"]["lane"]
    lead = a["lead"] or "vanessa-orchestrator"
    start = a["laya"]["starts_from"] or "CLAUDE.md"
    desc = re.sub(r"\s+", " ", a["role"]).strip().rstrip(".")[:150]
    prop = "This seat is PROPOSAL-ONLY: return proposals, never changes." if a["guard"]["proposal_only"] else ""
    gates = " -> ".join(a["guard"]["gates"]) or "Vanessa"
    tk = a.get("toolkit") or []
    toolkit = ("Toolkit (code-validation gate, mandatory on any code change): " + "; ".join(tk) +
               ". Code is not done until scripts/validate-code.sh passes AND the code-validator agent has reviewed the diff.") if tk else ""
    body = f"""---
name: {_name(a['slug'])}
description: {desc}. Lane {seat}, tier {a['tier']}, reports to {lead}.
model: {MODEL.get(a['model'], 'sonnet')}
---
You are **{a['slug']}** on Steven Shearrill's AI team (org chart: wiki/ai-team/org-chart.md).
Role: {a['role'].strip()}
Place: tier {a['tier']} · lane {seat} · reports to **{lead}** · model {a['model']} · dispatched by Vanessa in waves of at most 8.
{prop}
{toolkit}
Start by reading `{start}` and nothing else until CLAUDE.md's routing table sends you elsewhere. Prefer `bin/brain ask "<question>"` over opening files.
Your output goes through these gates, in order: {gates}. Say which brain page you used.

Rules that never change: {HALT}
Reply in plain language Steven can act on: what you found, what you recommend, what only he can decide.
"""
    return body


def write(root: Path) -> tuple[int, Path]:
    m = agentos.build(root)
    out = root / OUT
    out.mkdir(parents=True, exist_ok=True)
    lead_of = {a["slug"]: a["lead"] for a in m["agents"]}
    n = 0
    for a in m["agents"]:
        gen = out / f"{a['slug']}.md"
        if (root / HAND / f"{a['slug']}.md").is_file():
            gen.unlink(missing_ok=True)  # the hand-written file is the agent; a generated twin would shadow it on the Mac
            continue
        gen.write_text(render(a, lead_of), encoding="utf-8")
        n += 1
    (out / "README.md").write_text(
        "# Generated agent files — do not edit here\n\nOne file per roster seat, written by `bin/brain os agents --write` from "
        "`docs/inventory/agent-roster.md` and `integrations/agent-os/agents.json`. `install-mac.sh` links them into "
        "`~/.claude/agents` without overwriting a file that already exists there, so a hand-tuned prompt on the Mac wins. "
        f"{n} files as of the last run. Seats with a hand-written file in `.claude/agents/` are not generated here.\n", encoding="utf-8")
    return n, out


def check(root: Path) -> dict:
    m = agentos.build(root)
    out = root / OUT
    def path(slug: str) -> Path:
        hand = root / HAND / f"{slug}.md"
        return hand if hand.is_file() else out / f"{slug}.md"
    missing = [a["slug"] for a in m["agents"] if not path(a["slug"]).is_file()]
    bad = []
    for a in m["agents"]:
        p = path(a["slug"])
        if p.is_file():
            t = p.read_text(encoding="utf-8")
            if not t.startswith("---\nname: " + a["slug"] + "\n"):
                bad.append(a["slug"])
    return {"total": m["count"], "present": m["count"] - len(missing), "missing": missing, "bad_frontmatter": bad}
