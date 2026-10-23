"""Test for integrations/laya/laya_route.py's `route` field (R12-OMNI) — the tier/pii_gate -> route
wiring added when OmniRoute/Bonsai were wired in as the local and research routes. The research tier
moved to the subscription route on 2026-10-05 (Perplexity removed; research is Claude web research, direct).

    python3 integrations/tests/test_laya_route.py

Two checks, no network, no model weights, no pytest:
  1. route_for() against every {tier} x {pii_gate fired} combination in route-map.json, including the
     one property that matters most — pii_gate firing overrides EVERY tier, not just the ones a bag-of-
     words stub happens to guess in the sample batch — plus the safe-fallback paths (unknown tier,
     missing route-map.json).
  2. A subprocess regression run of `laya_route.py --engine stub --batch sample-requests.jsonl`, the
     same holdout laya/README.md documents, asserting the routed/escalated/pii_gate-fired counts are
     unchanged from before this field existed (20 requests | 15 routed, 5 escalated | 2 pii_gate fired)
     and that both PII-fired rows now print route=local regardless of their (stub-guessed) tier.
Exit 0 only if every case passes.
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
LAYA_DIR = HERE.parent / "laya"
sys.path.insert(0, str(LAYA_DIR))

from laya_route import DEFAULT_ROUTE_MAP, load_route_map, route_for, score_label, decide  # noqa: E402

N_PASS = 0
N_FAIL = 0


def check(label, got, want):
    global N_PASS, N_FAIL
    if got == want:
        N_PASS += 1
        print(f"  ok    {label} ({got!r})")
    else:
        N_FAIL += 1
        print(f"  FAIL  {label}\n     -> expected {want!r}, got {got!r}")


def main() -> int:
    print("== route_for() matrix — route-map.json")
    route_map = load_route_map(DEFAULT_ROUTE_MAP)
    check("route-map.json loads", route_map is not None, True)

    subscription_tiers = ["orchestrator", "executive", "worker"]
    for tier in subscription_tiers:
        check(f"tier={tier} pii=0 -> subscription", route_for(tier, False, route_map), "subscription")
        check(f"tier={tier} pii=1 -> local (override)", route_for(tier, True, route_map), "local")
    check("tier=research pii=0 -> subscription (Claude web research, direct; Perplexity removed 2026-10-05)",
          route_for("research", False, route_map), "subscription")
    check("tier=research pii=1 -> local (override, the case that matters most)",
          route_for("research", True, route_map), "local")
    check("unknown tier, pii=0 -> subscription (safe default on drift)",
          route_for("some-new-tier-nobody-mapped-yet", False, route_map), "subscription")
    check("no route-map.json, pii=0 -> subscription", route_for("research", False, None), "subscription")
    check("no route-map.json, pii=1 -> local", route_for("research", True, None), "local")
    # 2026-10-23: the real laya 0.3.x engine answers a `score` question with score+legend and no `label`
    # (Mac log: KeyError: 'label'); the stub answers with `label`. Both must give the level text.
    check("score_label: stub shape", score_label({"label": "soon"}), "soon")
    check("score_label: real shape (score 1.8 -> level 2)",
          score_label({"score": 1.8, "legend": {"0": "not urgent", "1": "soon", "2": "blocking"}}), "blocking")
    check("score_label: real shape rounds down", score_label({"score": 0.4, "legend": {"0": "not urgent", "1": "soon"}}), "not urgent")
    check("score_label: halves round up (0.5 -> soon)", score_label({"score": 0.5, "legend": {"0": "not urgent", "1": "soon", "2": "blocking"}}), "soon")
    check("score_label: NaN score -> probabilities fallback", score_label({"score": float("nan"), "legend": {"0": "a", "1": "b"}, "probabilities": {"0": 0.2, "1": 0.8}}), "b")
    check("score_label: no legend -> the question's criteria", score_label({"score": 1.2, "probabilities": {"0": 0.1, "1": 0.9}}, ["not urgent", "soon"]), "soon")
    # the crash site itself: decide() with a real-shaped engine (no `label` anywhere)
    def real_shaped(state, questions):
        return {"answers": {
            "pii_gate": {"type": "noul", "noul": 0.05, "confidence": 0.95},
            "brain_route": {"type": "choice", "choice": "mortgage_program", "probabilities": {"mortgage_program": 0.9, "recall_cost": 0.1}, "confidence": 0.9},
            "tier": {"type": "choice", "choice": "report", "probabilities": {"report": 1.0}, "confidence": 1.0},
            "lane": {"type": "choice", "choice": "victor", "probabilities": {"victor": 1.0}, "confidence": 1.0},
            "urgency": {"type": "score", "score": 1.8, "legend": {"0": "not urgent", "1": "soon", "2": "blocking"}, "probabilities": {"0": 0.1, "1": 0.1, "2": 0.8}, "confidence": 0.8},
        }}
    d = decide("VA funding fee?", {"urgency": {"type": "score", "criteria": ["not urgent", "soon", "blocking"]}},
               {"mortgage_program": "wiki/mortgage-programs/index.md"}, real_shaped, 0.5, 0.5, None)
    check("decide(): real-shaped engine (no label) routes and names the urgency level", d["urgency"], "blocking")
    check("decide(): real-shaped engine ROUTEs to the mapped leaf", d["leaf"], "wiki/mortgage-programs/index.md")
    check("score_label: nothing usable -> unknown", score_label({}), "unknown")

    print("\n== subprocess regression — laya_route.py --engine stub --batch sample-requests.jsonl")
    proc = subprocess.run(
        [sys.executable, str(LAYA_DIR / "laya_route.py"), "--engine", "stub", "--json",
         "--batch", str(LAYA_DIR / "sample-requests.jsonl")],
        capture_output=True, text=True, timeout=30,
    )
    check("batch run exits 0", proc.returncode, 0)
    rows = [json.loads(line) for line in proc.stdout.splitlines() if line.strip()]
    check("20 rows printed", len(rows), 20)
    routed = [r for r in rows if r["decision"] == "ROUTE"]
    escalated = [r for r in rows if r["decision"] == "ESCALATE"]
    pii_fired = [r for r in rows if r.get("pii_fired")]
    check("15 routed", len(routed), 15)
    check("5 escalated", len(escalated), 5)
    check("2 pii_gate fired", len(pii_fired), 2)
    check("every pii_fired row carries route=local", sorted({r["route"] for r in pii_fired}), ["local"])
    check("every ROUTE row (incl. pii-fired) carries a 'route' key",
          all("route" in r for r in routed), True)

    print(f"\n{N_PASS} ok, {N_FAIL} failed")
    return 0 if N_FAIL == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
