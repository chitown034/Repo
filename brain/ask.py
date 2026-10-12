"""``brain ask`` -- the one front door: recall, escalate when weak, say who owns it, say what to do next.

CLAUDE.md's recall order as code. Level 1 is ``brain recall`` (one section of one file). When that answer is
missing or its confidence is below ASK_ESCALATE, level 2 runs automatically: ``pack`` gathers the best section
from several files under a token budget, so a question that spans two pages still gets its evidence without a
second command. Every answer carries the lead seat the dispatch planner would give it and a one-line "next":
answer found / escalated / queue research (level 3). Plain code, no model call; the recall log gets the same
keyword-only line ``brain recall`` writes.
"""

from __future__ import annotations

from pathlib import Path

from . import loop, recall as recall_mod, route as route_mod

ASK_ESCALATE = 0.5


def ask(root: Path, question: str, budget_tokens: int = 900, log: bool = True) -> dict:
    res = recall_mod.recall(question, root=root)
    if log:
        loop.log_recall(root, res)
    plan = route_mod.route(root, question, with_reads=False)
    out = {"question": question, "level": 1, "file": res["file"], "section": res["section"],
           "confidence": res["confidence"], "evidence": res["evidence"], "est_tokens": res["est_tokens"],
           "owner": plan["lead"], "halts": [h["why"] for h in plan["halts"]], "sections": [], "next": ""}
    weak = res["file"] is None or res["confidence"] < ASK_ESCALATE
    if weak:
        pk = loop.pack(root, question, budget_tokens=budget_tokens)
        secs = pk.get("parts") or []
        if secs:
            out["level"] = 2
            out["sections"] = [{"file": p["file"], "section": p["section"]} for p in secs]
            out["evidence"] = "\n\n".join(f"[{p['file']} § {p['section']}]\n{p['text']}" for p in secs)
            out["est_tokens"] = pk.get("used", out["est_tokens"])
            out["next"] = f"escalated to level 2 (several sections) because level 1 was {'missing' if res['file'] is None else 'weak'}; read them in order"
        else:
            out["level"] = 3
            out["next"] = "not in the brain — queue research (level 3) or `bin/brain remember` the answer once known"
    else:
        out["next"] = "answered at level 1 — one section, no escalation needed"
    return out


def format_ask(a: dict) -> str:
    head = [f"question: {a['question']}",
            f"owner: {a['owner']}" + (f"  ·  HALT: {'; '.join(a['halts'])}" if a["halts"] else ""),
            f"level {a['level']}  ·  confidence {a['confidence']}  ·  ~{a['est_tokens']} tokens  ·  {a['next']}"]
    return "\n".join(head) + "\n\n" + (a["evidence"] or "").rstrip()
