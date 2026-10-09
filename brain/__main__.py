"""CLI: ``python3 -m brain <command>`` or ``bin/brain <command>``.

  recall "<question>" [--json] [--top N]
  remember "<fact>" [--topic NAME] [--source TEXT]
  reindex
  doctor
  bench [--write]
  gaps | orgcheck | stale | related | pack "<question>" | loop | mcp
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import bench, doctor, indexer, loop, recall, remember

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
    sub.add_parser("gaps", help="questions asked and not answered (from the local recall log), most-asked first")
    sub.add_parser("orgcheck", help="does every org-chart seat resolve to a brain page; is Jarvis verified")
    k = sub.add_parser("pack", help="best sections from several files under a token budget, as one paste")
    k.add_argument("question", nargs="+")
    k.add_argument("--budget", type=int, default=900, help="token budget (default 900)")
    st = sub.add_parser("stale", help="pages stating live facts whose newest date stamp is older than N days")
    st.add_argument("--days", type=int, default=21)
    rl = sub.add_parser("related", help="pages sharing the most distinctive keywords with a page or a question")
    rl.add_argument("target", nargs="+")
    gr = sub.add_parser("graph", help="the whole brain as nodes, links and dates (JSON) for any visualiser")
    gr.add_argument("--out", help="write to this file instead of stdout")
    sub.add_parser("loop", help="reindex, doctor, bench, gaps, orgcheck; write docs/reports/BRAIN-LOOP.md; exit 1 on regression")
    sub.add_parser("mcp", help="serve recall/remember/pack/gaps over stdio MCP for any MCP client")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    root = indexer.repo_root()

    if args.cmd == "recall":
        res = recall.recall(" ".join(args.question), root=root, top=args.top)
        loop.log_recall(root, res)
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

    if args.cmd == "gaps":
        g = loop.gaps(root)
        if not g:
            print("no gaps logged (the log fills as `bin/brain recall` is used; BRAIN_NOLOG=1 turns it off)")
        for x in g:
            print(f"{x['count']:>3}x  {x['state']:<16} {' '.join(x['keywords'])}")
            if x.get("nearest"):
                print(f"       nearest: {', '.join(x['nearest'])}")
            print(f"       fix: {x['action']}")
        return 0

    if args.cmd == "orgcheck":
        r = loop.orgcheck(root)
        print(loop.format_orgcheck(r))
        return 0 if r["covered"] == r["total"] else 1

    if args.cmd == "pack":
        print(loop.format_pack(loop.pack(root, " ".join(args.question), budget_tokens=args.budget)))
        return 0

    if args.cmd == "stale":
        rows = loop.stale(root, days=args.days)
        print(f"{len(rows)} pages with live-sounding facts and no date stamp newer than {args.days} days" + (":" if rows else ""))
        for x in rows:
            print(f"  {x['age_days']:>4} d  {x['newest_stamp']}  {x['file']}")
        return 0

    if args.cmd == "related":
        rows = loop.related(root, " ".join(args.target))
        if not rows:
            print("not in the brain")
        for x in rows:
            print(f"  {x['file']}  ({x.get('why') or 'shares: ' + x['shared']})")
        return 0

    if args.cmd == "graph":
        from . import graph
        return graph.main(root, args.out)

    if args.cmd == "loop":
        ok, text = loop.run_loop(root)
        print(text)
        return 0 if ok else 1

    if args.cmd == "mcp":
        from . import mcp
        return mcp.serve(root)
    return 2


if __name__ == "__main__":
    sys.exit(main())
