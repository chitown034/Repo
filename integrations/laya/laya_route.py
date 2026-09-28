#!/usr/bin/env python3
"""laya_route.py — the zero-token System-1 hop in front of Vanessa.

Reads one request, answers CLAUDE.md's router questions (brain_route, lane,
tier, pii_gate, urgency) from router-questions.json in this directory, and
prints ONE decision line: which leaf file to open, which lane/tier owns it,
and ROUTE or ESCALATE. Below --threshold confidence on brain_route, it
prints ESCALATE and Vanessa's full recall order runs instead — this script
never guesses past its own confidence.

Two engines, same downstream logic either way:

  --engine real   laya.Router() — the real, calibrated model. Needs a
                  checkpoint cached from Hugging Face (one-time, on the
                  Mac; see install.sh). This is what runs in production.
  --engine stub   A deterministic, offline, bag-of-words matcher with NO
                  model weights and NO network call. It exists only to
                  prove this script's own plumbing — question loading, leaf
                  lookup, the confidence/ESCALATE branch, the pii_gate
                  override — when the real checkpoint cannot be reached.
                  It is NOT a measurement of Laya's accuracy and must never
                  be reported as one.
  --engine auto   (default) try real, fall back to stub on any error
                  (network, missing checkpoint, import) and say so loudly
                  on stderr. Never fails silently into the stub.

PII rule, enforced here, not just documented: if pii_gate answers true at
or above --pii-threshold, the decision is forced to the local client path
and the raw request text is withheld from the printed output. brain_route
is not trusted to make that call by itself, because a client question
phrased unusually is exactly the case a classifier is least sure of.

Never pass real client data to this script, in --engine real or --engine
stub, in a test or otherwise. See wiki/clients/index.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_QUESTIONS = HERE / "router-questions.json"
DEFAULT_ROUTE_MAP = HERE.parent / "omniroute" / "route-map.json"

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "does", "do", "for",
    "from", "has", "have", "how", "i", "in", "is", "it", "its", "of", "on",
    "or", "our", "should", "that", "the", "this", "to", "was", "what",
    "when", "where", "which", "who", "whom", "why", "will", "with",
}


def tokenize(text: str) -> list[str]:
    words = re.findall(r"[a-z0-9']+", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 1]


def load_questions(path: Path) -> dict:
    data = json.loads(path.read_text())
    leaves = data.get("leaves", {})
    laya_questions = {k: v for k, v in data.items() if k not in ("_meta", "leaves")}
    return laya_questions, leaves


def load_route_map(path: Path) -> dict | None:
    """integrations/omniroute/route-map.json — tier/pii_gate -> route. Optional: an older
    checkout or a stripped-down deployment may not carry integrations/omniroute/ at all, so a
    missing file degrades to route=None (printed as 'route=? (no route-map.json)') rather than
    crashing laya_route.py, which must keep working as the zero-token System-1 hop either way."""
    try:
        return json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return None


def route_for(tier_choice: str, pii_fired: bool, route_map: dict | None) -> str:
    """route-map.json's own invariant, enforced here too (not just documented): pii_gate firing
    always wins, whatever tier said. Any lookup miss (missing file, unknown tier, malformed map)
    falls back to 'subscription' — the one route that is never OmniRoute and never spends anything
    beyond the seat Steven already pays for, i.e. the safe direction when this mapping can't answer."""
    if not route_map:
        return "local" if pii_fired else "subscription"
    if pii_fired:
        return route_map.get("pii_gate", {}).get("true", {}).get("route", "local")
    return route_map.get("tier", {}).get(tier_choice, {}).get("route", "subscription")


# --------------------------------------------------------------------------
# Stub engine — deterministic bag-of-words overlap. No model, no network.
# --------------------------------------------------------------------------

def _stub_choice(state_tokens: set[str], criteria: dict[str, str],
                  smoothing: dict[str, float] | None = None) -> dict:
    scores = {}
    for label, text in criteria.items():
        crit_tokens = set(tokenize(text))
        overlap = len(state_tokens & crit_tokens)
        denom = max(1, len(crit_tokens)) ** 0.5
        scores[label] = overlap / denom + (smoothing or {}).get(label, 0.0)
    total = sum(scores.values())
    if total <= 0:
        # No overlap with any option and no smoothing pulled it positive:
        # honest uniform distribution, which is exactly the low-confidence
        # case ESCALATE exists for.
        n = len(scores) or 1
        probs = {k: 1.0 / n for k in scores}
    else:
        probs = {k: v / total for k, v in scores.items()}
    top = max(probs, key=probs.get)
    return {"choice": top, "probabilities": probs, "confidence": probs[top]}


# pii_gate needs a base rate, not a coin flip: most requests are not about a
# specific client (compare the 16 brain_route classes, only one of which is
# "client"), and "false"'s own criteria text shares words like "client" and
# "named" with "true"'s, which a bag-of-words match cannot tell apart on
# vocabulary alone. Zero real overlap on both sides should read as false,
# not as an even split -- so a small, asymmetric smoothing constant stands
# in for that prior. This is a property of THIS TOY STUB ONLY: it is not
# Laya's real, trained, calibrated pii_gate, and must never be reported as
# though it were.
_PII_SMOOTHING = {"false": 0.15, "true": 0.02}


def _stub_noul(state_tokens: set[str], criteria: dict[str, str]) -> dict:
    r = _stub_choice(state_tokens, {"false": criteria["false"], "true": criteria["true"]},
                      smoothing=_PII_SMOOTHING)
    return {"noul": r["probabilities"]["true"], "probabilities": r["probabilities"]}


def _stub_score(state_tokens: set[str], criteria: list[str]) -> dict:
    crit = {str(i): c for i, c in enumerate(criteria)}
    r = _stub_choice(state_tokens, crit)
    level = int(r["choice"])
    return {"level": level, "label": criteria[level], "probabilities": r["probabilities"],
            "confidence": r["confidence"]}


def stub_predict(state: str, questions: dict) -> dict:
    tokens = set(tokenize(state))
    answers = {}
    for key, q in questions.items():
        qtype = q["type"]
        if qtype == "choice":
            answers[key] = _stub_choice(tokens, q["criteria"])
        elif qtype == "noul":
            answers[key] = _stub_noul(tokens, q["criteria"])
        elif qtype == "score":
            answers[key] = _stub_score(tokens, q["criteria"])
        else:
            raise ValueError(f"unknown question type {qtype!r} for {key!r}")
    return {"answers": answers, "routing": {"model": "stub-bow-v1"}}


# --------------------------------------------------------------------------
# Real engine — laya.Router(). Needs a cached Hugging Face checkpoint.
# --------------------------------------------------------------------------

def real_predict(state: str, questions: dict):
    from laya import Router  # local import: never required for --engine stub
    router = Router()
    return router.predict(state, questions)


def get_engine(requested: str):
    if requested == "stub":
        return stub_predict, "stub-bow-v1"
    if requested == "real":
        return real_predict, "laya"
    # auto: try one real call now so the fallback is a fact, not a guess
    try:
        real_predict("connectivity probe", {
            "probe": {"type": "noul", "instructions": "probe", "criteria": {"false": "a", "true": "b"}}
        })
        return real_predict, "laya"
    except Exception as exc:  # noqa: BLE001 — any failure means fall back
        print(f"[laya_route] --engine auto: real Laya unavailable ({exc!r}); "
              f"falling back to --engine stub. Rerun with --engine real to see "
              f"this error again, or --engine stub to silence this probe.",
              file=sys.stderr)
        return stub_predict, "stub-bow-v1"


def decide(state: str, questions: dict, leaves: dict, predict_fn, threshold: float,
           pii_threshold: float, route_map: dict | None = None) -> dict:
    t0 = time.monotonic()
    result = predict_fn(state, questions)
    latency_ms = (time.monotonic() - t0) * 1000.0
    answers = result["answers"]

    pii_true = answers["pii_gate"]["noul"]
    pii_fired = pii_true >= pii_threshold

    br = answers["brain_route"]
    br_choice = br["choice"]
    br_conf = br["confidence"] if "confidence" in br else max(br["probabilities"].values())
    escalate = br_conf < threshold

    if pii_fired:
        decision = "ROUTE"
        leaf = "wiki/clients/<client>.md — local vault only, never leaves the Mac"
        route_class = "client"
        shown_state = "[client-shaped request — text withheld: pii_gate fired]"
    elif escalate:
        decision = "ESCALATE"
        leaf = None
        route_class = br_choice
        shown_state = state
    else:
        decision = "ROUTE"
        leaf = leaves.get(br_choice, "(no leaf mapped — router-questions.json drifted from CLAUDE.md)")
        route_class = br_choice
        shown_state = state

    tier_choice = answers["tier"]["choice"]
    route = route_for(tier_choice, pii_fired, route_map)

    return {
        "decision": decision,
        "route_class": route_class,
        "leaf": leaf,
        "brain_route_confidence": round(br_conf, 4),
        "pii_gate": round(pii_true, 4),
        "pii_fired": pii_fired,
        "lane": answers["lane"]["choice"],
        "tier": tier_choice,
        "route": route,
        "urgency": answers["urgency"]["label"],
        "latency_ms": round(latency_ms, 2),
        "state_shown": shown_state,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("text", nargs="*", help="the request text (omit with --batch)")
    ap.add_argument("--questions", type=Path, default=DEFAULT_QUESTIONS)
    ap.add_argument("--route-map", type=Path, default=DEFAULT_ROUTE_MAP,
                     help="tier/pii_gate -> route, see integrations/omniroute/README.md "
                          "(default: integrations/omniroute/route-map.json next to this repo's laya/)")
    ap.add_argument("--engine", choices=["auto", "real", "stub"], default="auto")
    ap.add_argument("--threshold", type=float, default=0.60,
                     help="brain_route confidence floor; below this, ESCALATE (default 0.60, "
                          "an unvalidated starting point — see OPTIMIZATION.md and the Laya "
                          "weekly accuracy check in always-on/README.md)")
    ap.add_argument("--pii-threshold", type=float, default=0.50)
    ap.add_argument("--batch", type=Path, help="JSONL file of {\"id\":..., \"state\":...} lines")
    ap.add_argument("--json", action="store_true", help="print one JSON object per decision")
    args = ap.parse_args()

    questions, leaves = load_questions(args.questions)
    route_map = load_route_map(args.route_map)
    if route_map is None:
        print(f"[laya_route] no route-map.json at {args.route_map} — 'route' falls back to "
              f"subscription/local only, per-tier routes unavailable. See integrations/omniroute/README.md.",
              file=sys.stderr)
    predict_fn, engine_name = get_engine(args.engine)

    def run_one(state: str, rid: str = "-") -> dict:
        d = decide(state, questions, leaves, predict_fn, args.threshold, args.pii_threshold, route_map)
        d["id"] = rid
        d["engine"] = engine_name
        return d

    rows = []
    if args.batch:
        for line in args.batch.read_text().splitlines():
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            rows.append(run_one(rec["state"], rec.get("id", "-")))
    else:
        state = " ".join(args.text) if args.text else sys.stdin.read().strip()
        rows.append(run_one(state))

    for r in rows:
        if args.json:
            print(json.dumps(r))
        else:
            head = f"[{r['id']}] {r['decision']}"
            if r["decision"] == "ESCALATE":
                print(f"{head} — brain_route={r['route_class']} conf={r['brain_route_confidence']} "
                      f"< threshold; full recall order runs instead. ({r['latency_ms']} ms, {r['engine']})")
            else:
                print(f"{head} class={r['route_class']} -> {r['leaf']} | lane={r['lane']} "
                      f"tier={r['tier']} route={r['route']} urgency={r['urgency']} pii_gate={r['pii_gate']}"
                      f"{' (FIRED)' if r['pii_fired'] else ''} ({r['latency_ms']} ms, {r['engine']})")

    if args.batch:
        n = len(rows)
        escalated = sum(1 for r in rows if r["decision"] == "ESCALATE")
        pii = sum(1 for r in rows if r["pii_fired"])
        mean_ms = sum(r["latency_ms"] for r in rows) / n if n else 0.0
        print(f"\n{n} requests | {n - escalated} routed, {escalated} escalated | "
              f"{pii} pii_gate fired | mean {mean_ms:.2f} ms | engine={rows[0]['engine'] if rows else '-'}",
              file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
