"""``brain layout`` -- the brain checked against the backend folder structure it recommends to everyone else.

references/backend-folder-structure.md records the eight-layer layout (config, models, middlewares, controllers,
services, routes, utils, tests). This module maps the brain's own modules onto those layers and checks two things
plain code can check: every mapped path exists, and every *service* module has a test that names it. A service
without a test is unfinished -- the same rule the reference page sets for any backend the team builds.
``brain doctor`` carries the result as one more row, so the weekly loop notices a new untested service.
"""

from __future__ import annotations

import re
from pathlib import Path

REFERENCE = "references/backend-folder-structure.md"
LAYERS = {
    "config": ["brain/synonyms.py", "brain/synonyms-learned.json", "brain/stopwords.py"],
    "models": ["brain/indexer.py", "brain/bench/questions.json", "brain/bench/routes.json"],
    "middlewares": ["CLAUDE.md", "brain/route.py"],
    "controllers": ["brain/__main__.py", "bin/brain"],
    "services": ["brain/recall.py", "brain/ask.py", "brain/loop.py", "brain/learn.py", "brain/passages.py",
                 "brain/agentos.py", "brain/agentfiles.py", "brain/encyclopedia.py", "brain/tune.py",
                 "brain/remember.py", "brain/graph.py", "brain/layout.py"],
    "routes": ["CLAUDE.md", "INDEX.md"],
    "utils": ["brain/text.py", "brain/doctor.py"],
    "tests": ["brain/tests", "scripts/setup-health.sh"],
}


def _tests_text(root: Path) -> str:
    d = root / "brain" / "tests"
    return "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in sorted(d.glob("test_*.py"))) if d.is_dir() else ""


def check(root: Path) -> dict:
    missing = [p for paths in LAYERS.values() for p in paths if not (root / p).exists()]
    tests = _tests_text(root)
    untested = []
    for p in LAYERS["services"]:
        mod = Path(p).stem
        if not re.search(r"\b" + re.escape(mod) + r"\b", tests):
            untested.append(p)
    return {"reference": REFERENCE, "reference_present": (root / REFERENCE).is_file(), "layers": LAYERS,
            "missing": missing, "untested_services": untested,
            "ok": not missing and not untested and (root / REFERENCE).is_file()}


def format_check(r: dict) -> str:
    out = ["layout: the brain against " + r["reference"] + (" (page present)" if r["reference_present"] else " (PAGE MISSING)")]
    for layer, paths in r["layers"].items():
        out.append(f"  {layer:<12} " + ", ".join(paths))
    out.append("  missing paths: " + (", ".join(r["missing"]) if r["missing"] else "none"))
    out.append("  services without a test naming them: " + (", ".join(r["untested_services"]) if r["untested_services"] else "none"))
    out.append("layout: " + ("PASS" if r["ok"] else "FAIL"))
    return "\n".join(out)


def doctor_row(root: Path) -> tuple[bool, str]:
    r = check(root)
    if r["ok"]:
        return True, f"ok   layout: every mapped path exists and all {len(LAYERS['services'])} service modules have a test naming them"
    bits = []
    if not r["reference_present"]:
        bits.append("reference page missing")
    if r["missing"]:
        bits.append("missing: " + ", ".join(r["missing"]))
    if r["untested_services"]:
        bits.append("untested services: " + ", ".join(r["untested_services"]))
    return False, "FAIL layout: " + "; ".join(bits) + " — run `bin/brain layout`"
