"""CLI: ``python3 -m brain <command>`` or ``bin/brain <command>``.

  recall "<question>" [--json] [--top N]
  remember "<fact>" [--topic NAME] [--source TEXT]
  reindex
  doctor
  bench [--write]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import bench, doctor, indexer, recall, remember

CONTRACT = ["query", "keywords", "file", "section", "pointer_followed", "pointer_file", "evidence",
            "bytes_read", "est_tokens", "candidates_scored", "ms", "confidence"]


def _parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="brain", description="Deterministic recall for the second brain — no model calls.")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("recall", help="keywords → score the index → open ONE file → best section → ≤1 pointer hop")
    r.add_argument("question", nargs="+")
    r.add_argument("--json", action="store_true", help="emit the JSON contract")
    r.add_argument("--top", type=int, default=0, metavar="N",
                   help="also list the N best-scoring candidates (still opens only one file)")

    m = sub.add_parser("remember", help="store one dated fact and refresh the index, in one step")
    m.add_argument("fact", nargs="+")
    m.add_argument("--topic", help="append to memory/<topic>.md instead of memory.md")
    m.add_argument("--source", help="where the fact came from (appended as '(source: …)')")

    sub.add_parser("reindex", help="rebuild INDEX.md and brain/index.json from the tree")
    sub.add_parser("doctor", help="non-zero exit if the index is stale or a routed path is missing")
    b = sub.add_parser("bench", help="brain vs default session vs router-only")
    b.add_argument("--write", action="store_true", help="write docs/reports/BRAIN-BENCH.md")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    root = indexer.repo_root()

    if args.cmd == "recall":
        res = recall.recall(" ".join(args.question), root=root, top=args.top)
        if args.json:
            out = {k: res[k] for k in CONTRACT}
            if args.top:
                out["top"] = res.get("top", [])
            print(json.dumps(out, ensure_ascii=False))
        else:
            print(recall.format_human(res))
        return 0

    if args.cmd == "remember":
        try:
            res = remember.remember(" ".join(args.fact), topic=args.topic, source=args.source, root=root)
        except remember.Refused as e:
            print(f"REFUSED: the fact {e}. Nothing was written.\n"
                  "Secrets, credentials, account numbers and client PII never enter the brain "
                  "(CLAUDE.md HALT list). Reference where it lives — the Mac keychain or a .env — not the value.",
                  file=sys.stderr)
            return 2
        except (ValueError, FileNotFoundError) as e:
            print(f"error: {e}", file=sys.stderr)
            return 1
        verb = "appended to" if res["added"] else "already in (nothing written)"
        print(f"{verb} {res['file']}: {res['line']}")
        print(f"reindexed: INDEX.md + brain/index.json ({res['indexed']} files)")
        for w in res["warnings"]:
            print(f"warning: {w}", file=sys.stderr)
        return 0

    if args.cmd == "reindex":
        ix = indexer.write(root)
        print(f"wrote INDEX.md + brain/index.json — {ix['files_indexed']} files, {ix['sections_indexed']} sections")
        return 0

    if args.cmd == "doctor":
        ok, report = doctor.run(root)
        print("\n".join(report))
        return 0 if ok else 1

    if args.cmd == "bench":
        return bench.main(root, write=args.write)
    return 2


if __name__ == "__main__":
    sys.exit(main())
