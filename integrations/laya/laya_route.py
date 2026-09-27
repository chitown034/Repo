#!/usr/bin/env python3
"""laya_route.py — a zero-LLM-token routing/ingest hint for the brain retrieval engine.

Wraps Laya's real Python API (`from laya import Router; Router().predict(state, questions)` with
a `choice` question whose `criteria` describe each destination — see
`convaiinnovations/laya`, package version 0.3.21, `laya/router.py::Router.predict`,
`laya/mcp/tools.py` for the same question shape used by the MCP server).

Two independent modes, never combined in one call:

  python3 integrations/laya/laya_route.py --json "<question>"
      -> {"route": "<repo path prefix>", "confidence": 0.0-1.0}
      One "choice" question over the CLAUDE.md routing-table destinations.

  python3 integrations/laya/laya_route.py --gate "<text>"
      -> {"kind": "context"|"connection", "sensitive": 0.0-1.0, "ingest": bool}
      One "choice" question (context vs connection) + one "noul" question (sensitive/PII),
      in a single forward pass. `ingest` is true only when kind == "context" AND the
      sensitive score is under SENSITIVE_BLOCK_THRESHOLD — see the README's HALT caveats:
      this is a BOOST to deterministic scoring, never the sole decision-maker, and it never
      decides a HALT item (PII, credentials, anything CLAUDE.md's HALT list already covers)
      on its own.

If `laya` cannot be imported (not installed — the honest status as of 2026-09-27), this prints
a JSON error to stdout and exits 3. The brain engine's contract: ANY non-zero exit means
"ignore the hint," so a missing install degrades to the deterministic path alone, never a crash.

No network calls, no client text leaves the machine — Laya is a local model. This script itself
makes no HTTP requests either way.
"""
from __future__ import annotations

import argparse
import json
import sys

# Any failure importing or running Laya is treated the same way by the brain engine: exit
# non-zero means "ignore the hint." Exit code 3 specifically flags "laya unavailable" so a
# caller can tell that apart from a malformed-input error if it ever wants to (the brain
# engine itself does not need to — non-zero is non-zero).
EXIT_LAYA_UNAVAILABLE = 3
EXIT_BAD_INPUT = 2

# The brain's own sensitivity gate. Laya's "sensitive" score only ever narrows the
# deterministic ingest decision toward "skip" — it is never the only reason something is
# treated as safe. A HALT-list item (client PII, credentials, anything CLAUDE.md already
# names) must still be caught by the deterministic checks upstream of this script.
SENSITIVE_BLOCK_THRESHOLD = 0.5

# One route per CLAUDE.md routing-table row, as a repo path prefix. Descriptions are lifted
# from that table's "Question class" column so Laya's criteria mirror the router's own words
# rather than a second, drifting description of the same destinations.
ROUTE_CRITERIA = {
    "context/about-me.md": "Who Steven is, licences, states, credentials, bio",
    "context/decisions.md": "Why something is set up this way, a past call, a standing rule",
    "projects/": "Status of a named project (command-deck, isa-portal, ai-team, nonprofit, usc-pjmt-530)",
    "wiki/mortgage-programs/": "A loan program, guideline, VA mechanics, eligibility question",
    "wiki/real-estate-playbooks/": "A listing, buyer, transaction or showing process question",
    "wiki/ai-team/": "Who on the AI team owns X, a seat, model or trust level",
    "wiki/dashboard-ops/": "A deck panel, DB doc, Mac task or cloud routine question",
    "wiki/clients/": "A question about one specific, named client",
    "references/": "A source document, playbook PDF, or external system question",
    "memory.md": "Something learned in an earlier session, a durable preference",
    "vector-index/": "A high-volume corpus question — transcripts, disclosure libraries, rule sets",
    "knowledge-graph/": "How entities or things connect, relationships",
    "always-on/": "What runs on schedule, and whether it actually ran",
    "REMOTE-ACCESS.md": "Reaching Steven, or running something live or remote",
    "OPTIMIZATION.md": "Cost or freshness of a recall, token/store optimization",
}

GATE_KIND_CRITERIA = {
    "context": (
        "A durable fact, preference, decision or piece of knowledge worth keeping and "
        "reusing later — the kind of thing that belongs in a wiki page or memory.md"
    ),
    "connection": (
        "A transient, churning, or purely conversational exchange — status chatter, a "
        "one-off remark, something that will be stale or irrelevant within days"
    ),
}


def _build_router():
    """Import and construct a Laya Router, or raise ImportError/RuntimeError."""
    from laya import Router  # local import: keeps --help and argument errors laya-free

    return Router()


def _route(question: str) -> dict:
    router = _build_router()
    questions = {
        "route": {
            "type": "choice",
            "instructions": (
                "Which part of the second brain does this question belong to?"
            ),
            "criteria": ROUTE_CRITERIA,
        }
    }
    result = router.predict({"question": question}, questions)
    answer = result["answers"]["route"]
    return {
        "route": answer["choice"],
        "confidence": float(answer.get("confidence", answer.get("answer_confidence", 0.0))),
    }


def _gate(text: str) -> dict:
    router = _build_router()
    questions = {
        "kind": {
            "type": "choice",
            "instructions": "Is this durable context worth keeping, or a churning connection?",
            "criteria": GATE_KIND_CRITERIA,
        },
        "sensitive": {
            "type": "noul",
            "instructions": (
                "Does this contain sensitive or personally identifying information — a "
                "client's name plus financial, health or account detail, a credential, an "
                "SSN, a full loan file, anything a HALT rule would cover?"
            ),
        },
    }
    result = router.predict({"text": text}, questions)
    kind = result["answers"]["kind"]["choice"]
    sensitive = float(result["answers"]["sensitive"]["noul"])
    ingest = (kind == "context") and (sensitive < SENSITIVE_BLOCK_THRESHOLD)
    return {"kind": kind, "sensitive": sensitive, "ingest": ingest}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--json", metavar="QUESTION", help="route-hint mode")
    group.add_argument("--gate", metavar="TEXT", help="ingest-gate mode")
    args = parser.parse_args(argv)

    try:
        if args.json is not None:
            payload = _route(args.json)
        else:
            payload = _gate(args.gate)
    except ImportError as exc:
        print(json.dumps({"error": "laya_not_installed", "message": str(exc)}))
        return EXIT_LAYA_UNAVAILABLE
    except Exception as exc:  # noqa: BLE001 — any Laya/runtime failure degrades the same way
        print(json.dumps({"error": type(exc).__name__, "message": str(exc)}))
        return EXIT_LAYA_UNAVAILABLE

    print(json.dumps(payload))
    return 0


if __name__ == "__main__":
    sys.exit(main())
