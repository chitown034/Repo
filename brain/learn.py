"""``brain learn`` -- the brain promotes its own fixes, but only after they prove themselves.

``tune`` proposes synonym groups for words people asked that the index never matched. ``learn`` is the gate that turns a
proposal into behaviour without a person editing code, the way the loop-engineering skill prescribes:

  try      add the group as a CANDIDATE only if, with it in place, every gold question still answers (no regression on the
           holdout) AND the asked word now resolves to a page (the fix actually fixes something).
  tick     every ``bin/brain loop`` run that keeps the gold set green counts one correct run for every candidate;
           at TRUST_RUNS consecutive correct runs a candidate is PROMOTED. One regression demotes every candidate to
           REJECTED, so a bad learned synonym can never survive the week that would have exposed it.

State lives in ``brain/synonyms-learned.json`` (committed; small; human-readable). Hand-written groups in
``brain/synonyms.py`` are never touched. Plain code, no model call.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from . import loop, recall as recall_mod, text, tune

TRUST_RUNS = 7


def _path(root: Path) -> Path:
    return Path(os.environ.get("BRAIN_LEARNED") or (root / "brain" / "synonyms-learned.json"))


def load(root: Path) -> dict:
    p = _path(root)
    if p.is_file():
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
            for k in ("candidates", "promoted", "rejected"):
                d.setdefault(k, [])
            return d
        except ValueError:
            pass
    return {"candidates": [], "promoted": [], "rejected": [], "baseline": None}


def save(root: Path, d: dict) -> None:
    p = _path(root)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    text.reload_synonyms(str(p))


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _resolves(root: Path, word: str) -> bool:
    r = recall_mod.recall(word, root=root)
    return r["file"] is not None


def try_proposals(root: Path, max_new: int = 5) -> dict:
    """Test each tune proposal against the gold set; keep the ones that help and hurt nothing, as candidates."""
    state = load(root)
    known = {tuple(sorted(g["group"])) for k in ("candidates", "promoted", "rejected") for g in state[k]}
    text.reload_synonyms(str(_path(root)))
    base = loop._bench_summary(root)["correct"]
    state["baseline"] = base
    tried, kept = 0, []
    for it in tune.proposals(root):
        if not it["nearest"] or tried >= max_new:
            continue
        group = [it["asked"], it["nearest"][0]["term"]]
        key = tuple(sorted(group))
        if key in known:
            continue
        tried += 1
        before = _resolves(root, it["asked"])
        state["candidates"].append({"group": group, "since": _now(), "runs": 0, "why": f"asked {it['times']}x, never matched"})
        save(root, state)
        after_bench = loop._bench_summary(root)["correct"]
        after = _resolves(root, it["asked"])
        if after_bench >= base and after and not before:
            kept.append(group)
        else:
            state["candidates"].pop()
            state["rejected"].append({"group": group, "when": _now(), "why": f"bench {after_bench} vs {base}, resolves {before}->{after}"})
            save(root, state)
    return {"baseline": base, "tried": tried, "kept": kept, "candidates": len(state["candidates"]), "promoted": len(state["promoted"])}


def tick(root: Path, bench_correct: int) -> dict:
    """Called by the loop after its bench run: credit or demote candidates, promote at TRUST_RUNS."""
    state = load(root)
    base = state.get("baseline")
    if base is None:
        state["baseline"] = bench_correct
        save(root, state)
        return {"promoted": [], "demoted": [], "candidates": len(state["candidates"])}
    promoted, demoted = [], []
    if bench_correct < base:
        for c in state["candidates"]:
            c["why"] = f"demoted: bench fell {base} -> {bench_correct}"; c["when"] = _now()
            demoted.append(c["group"]); state["rejected"].append(c)
        state["candidates"] = []
    else:
        keep = []
        for c in state["candidates"]:
            c["runs"] = c.get("runs", 0) + 1
            if c["runs"] >= TRUST_RUNS:
                c["promoted_at"] = _now(); state["promoted"].append(c); promoted.append(c["group"])
            else:
                keep.append(c)
        state["candidates"] = keep
        state["baseline"] = max(base, bench_correct)
    save(root, state)
    return {"promoted": promoted, "demoted": demoted, "candidates": len(state["candidates"])}


def format_state(root: Path) -> str:
    s = load(root)
    out = [f"learned synonyms: {len(s['promoted'])} promoted · {len(s['candidates'])} candidates (promote at {TRUST_RUNS} green loop runs) · {len(s['rejected'])} rejected"]
    for c in s["candidates"]:
        out.append(f"  candidate {c['group']}  runs {c.get('runs', 0)}/{TRUST_RUNS}  ({c.get('why', '')})")
    for c in s["promoted"][-5:]:
        out.append(f"  promoted  {c['group']}  since {c.get('promoted_at', '')[:10]}")
    return "\n".join(out)
