"""CLI: ``python3 -m brain <command>`` or ``bin/brain <command>``.

  recall "<question>" [--json] [--top N]
  remember "<fact>" [--topic NAME] [--source TEXT]
  reindex
  doctor
  bench [--write]
  gaps | orgcheck | stale | related | pack "<question>" | route "<request>" | loop | mcp
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
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
    sub.add_parser("layout", help="the brain mapped onto references/backend-folder-structure.md; untested services fail")
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
    ro = sub.add_parser("route", help="org-chart dispatch plan: lead seat, joins, parallel waves, gates, HALTs")
    ro.add_argument("request", nargs="+")
    ro.add_argument("--json", action="store_true")
    os_ = sub.add_parser("os", help="agent OS: every agent via Laya lane + Jarvis recall + Orca launch command")
    os_.add_argument("action", choices=["list", "show", "run", "check", "write", "agents"])
    os_.add_argument("target", nargs="*")
    os_.add_argument("--json", action="store_true")
    os_.add_argument("--write", action="store_true", help="with `agents`: (re)generate integrations/agent-os/agents/*.md")
    ak = sub.add_parser("ask", help="the front door: recall, auto-escalate to several sections when weak, owner seat, next step")
    ak.add_argument("question", nargs="+"); ak.add_argument("--json", action="store_true")
    sub.add_parser("tune", help="propose synonyms/pages for asked words the brain never matched (writes proposals, edits nothing)")
    ln = sub.add_parser("learn", help="self-promoting synonyms: try tune proposals against the gold set, show candidates/promoted")
    ln.add_argument("action", nargs="?", default="status", choices=["status", "try"])
    pg = sub.add_parser("passages", help="level 3: best passages inside the big documents (sparse-vector search, no model)")
    pg.add_argument("question", nargs="+"); pg.add_argument("--top", type=int, default=3)
    sub.add_parser("encyclopedia", help="rewrite docs/reports/ENCYCLOPEDIA.md: the living A-Z of every page with backlinks")
    sub.add_parser("loop", help="reindex, doctor, bench, gaps, orgcheck; write docs/reports/BRAIN-LOOP.md; exit 1 on regression")
    tk = sub.add_parser("toolkit", help="skills, plugins, connectors (with status), cloud routines and Mac tasks, per org-chart seat")
    tk.add_argument("--json", action="store_true"); tk.add_argument("--write", action="store_true", help="write wiki/ai-team/toolkit.md")
    ow = sub.add_parser("owner", help="who keeps a Command Deck panel alive, by what mechanism, and what stays Steven's")
    ow.add_argument("query"); ow.add_argument("--json", action="store_true")
    sub.add_parser("mcp", help="serve recall/remember/pack/gaps over stdio MCP for any MCP client")
    ig = sub.add_parser("ingest", help="ingest an outside export into the brain: `claude-export <conversations.json>` (claude.ai data export) -> memory/claude-chats.md")
    ig.add_argument("source", choices=["claude-export"]); ig.add_argument("path")
    sub.add_parser("links", help="every front door of the second brain: deck, ISA Portal, 6D, Action Desk, Drive SECOND BRAIN, NotebookLM, Notion, the SB Docs")
    ly = sub.add_parser("layers", help="every layer of the second brain (repo, index, deck, 6D, Jarvis, Notion, Drive, NotebookLM...): last sync, age, verdict")
    ly.add_argument("--write", action="store_true", help="rewrite docs/reports/LAYERS.md"); ly.add_argument("--json", action="store_true")
    rc = sub.add_parser("recs", help="Vanessa's top 10 big moves for today: scored, prioritised, learned from approvals (docs/reports/BIG-MOVES.md)")
    rc.add_argument("action", nargs="?", default="top", choices=["top", "learn"], help="top (default) or learn <decisions.json>")
    rc.add_argument("file", nargs="?", default=None, help="learn: a JSON list of {id, decision, at, by}")
    rc.add_argument("--write", action="store_true"); rc.add_argument("--json", action="store_true"); rc.add_argument("--n", type=int, default=10)
    rc.add_argument("--signals", default=None, help="a JSON list of live signals (deck queue, refi list, presence...) to rank with the brain's own")
    rc.add_argument("--coas", action="store_true", help="the four courses of action (4 each) plus the questions block, instead of the top 10")
    og = sub.add_parser("org", help="the AI org chart as one JSON: seats, lanes, pods, tiers (what every dashboard should show)")
    ex = sub.add_parser("export", help="export the brain for another tool: `notebooklm` writes exports/notebooklm/*.md (no client pages, PII masked)")
    ex.add_argument("target", choices=["notebooklm"]); ex.add_argument("--out", default=None, help="folder (default exports/notebooklm)")
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

    if args.cmd == "route":
        from . import route
        plan = route.route(root, " ".join(args.request))
        print(json.dumps(plan, ensure_ascii=False, indent=1) if args.json else route.format_plan(plan))
        return 0

    if args.cmd == "ask":
        from . import ask as ask_mod
        a = ask_mod.ask(root, " ".join(args.question))
        print(json.dumps(a, ensure_ascii=False, indent=1) if args.json else ask_mod.format_ask(a)); return 0

    if args.cmd == "layout":
        from . import layout
        r = layout.check(root)
        print(layout.format_check(r))
        return 0 if r["ok"] else 1
    if args.cmd == "tune":
        from . import tune
        items = tune.proposals(root); tune.write(root); print(tune.format_proposals(items)); return 0

    if args.cmd == "learn":
        from . import learn
        if args.action == "try":
            r = learn.try_proposals(root); print(f"baseline {r['baseline']} · tried {r['tried']} · kept as candidates: {r['kept'] or 'none'}")
        print(learn.format_state(root)); return 0

    if args.cmd == "passages":
        from . import passages
        print(passages.format_passages(passages.search(root, " ".join(args.question), top=args.top))); return 0

    if args.cmd == "ingest":
        from . import ingest_claude_export
        st = ingest_claude_export.ingest(root, Path(args.path))
        print(f"ingested {st['conversations']} conversations, {st['tasks']} tasks, {st['masked']} masks -> {st['out']}"); return 0

    if args.cmd == "links":
        from . import links
        print(links.format_links(root)); return 0

    if args.cmd == "recs":
        from . import recs
        if args.action == "learn":
            if not args.file:
                print("recs learn needs a decisions JSON file"); return 2
            r = recs.learn(root, json.loads(Path(args.file).read_text(encoding="utf-8")))
            print(f"learned {r['added']} decisions; weights: " + ", ".join(f"{k} {v:.2f}" for k, v in sorted(r["weights"].items()))); return 0
        signals = json.loads(Path(args.signals).read_text(encoding="utf-8")) if args.signals else None
        if args.write:
            print("wrote", recs.write(root, args.n, signals))
        if args.coas:
            groups = recs.coas(root, 4, signals)
            if args.json:
                print(json.dumps({"coas": groups, "questions": recs.questions(root, groups)}, indent=1)); return 0
            for key, label, about in recs.COAS:
                print(f"== {label} — {about}"); print(recs.format_top(groups.get(key, [])) or "  (nothing in this lane today)"); print()
            print("== Questions you may have")
            for q in recs.questions(root, groups):
                print(f"- {q['q']} {q['a']} → {q['action']}")
            return 0
        items = recs.top(root, args.n, signals)
        print(json.dumps(items, indent=1) if args.json else recs.format_top(items)); return 0
    if args.cmd == "org":
        from . import loop as loop_mod, route as route_mod
        rules = route_mod.load_rules(root)
        seats = loop_mod.org_seats(root)
        print(json.dumps({"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "seats": seats,
                          "lanes": {k: v for k, v in rules["lanes"].items()}, "tiers": rules["tiers"],
                          "pods": [{"pod": n, "words": w, "seats": m, "delivers": d} for n, w, m, d in rules["pods"]],
                          "source": "wiki/ai-team/org-chart.md + cross-functional.md (bin/brain org)"}, indent=1)); return 0
    if args.cmd == "layers":
        from . import layers
        if args.write:
            print("wrote", layers.write(root)); return 0
        rows = layers.collect(root)
        print(json.dumps(rows, indent=1) if args.json else layers.format_rows(rows)); return 0

    if args.cmd == "export":
        from . import export_notebooklm
        r = export_notebooklm.export(root, Path(args.out) if args.out else None)
        print(export_notebooklm.format_summary(r)); return 0

    if args.cmd == "encyclopedia":
        from . import encyclopedia
        print("wrote", encyclopedia.write(root)); return 0

    if args.cmd == "os":
        from . import agentos
        t = " ".join(args.target)
        if args.action == "write":
            print("wrote", agentos.write(root)); return 0
        if args.action == "agents":
            from . import agentfiles
            if args.write:
                n, out = agentfiles.write(root); print(f"wrote {n} agent files -> {out}"); return 0
            r = agentfiles.check(root); print(f"agent files: {r['present']}/{r['total']} present, {len(r['bad_frontmatter'])} bad"); return 0 if not r["missing"] and not r["bad_frontmatter"] else 1
        if args.action == "check":
            r = agentos.check(root); print(agentos.format_check(r)); return 0 if not r["unreachable"] and not r["manifest_stale"] else 1
        if args.action == "run":
            print(json.dumps(agentos.plan_launch_json(root, t), ensure_ascii=False, indent=1) if args.json else agentos.plan_launch(root, t)); return 0
        m = agentos.build(root)
        if args.action == "list":
            for a in m["agents"]:
                if not t or t in (a["lead"] or "") or t in a["laya"]["lane"].lower() or t in a["slug"]:
                    print(f"{a['slug']:<34} tier {a['tier']} {a['model']:<9} lane {a['laya']['lane']:<10} {a['orca']['command']}")
            return 0
        hit = [a for a in m["agents"] if a["slug"] == t]
        if not hit:
            print("not a roster slug; named seats:", ", ".join(m["named_seats"])); return 1
        print(json.dumps(hit[0], ensure_ascii=False, indent=1)); return 0

    if args.cmd == "loop":
        ok, text = loop.run_loop(root)
        print(text)
        return 0 if ok else 1

    if args.cmd == "toolkit":
        from . import toolkit
        inv = toolkit.inventory(root)
        if args.write:
            print(f"wrote {toolkit.write_page(root, inv).relative_to(root)}")
        print(json.dumps(inv, indent=1) if args.json else toolkit.format_inventory(inv))
        return 0
    if args.cmd == "owner":
        from . import toolkit
        r = toolkit.owner(root, args.query)
        print(json.dumps(r, indent=1) if args.json else toolkit.format_owner(r, args.query))
        return 0 if r else 1
    if args.cmd == "mcp":
        from . import mcp
        return mcp.serve(root)
    return 2


if __name__ == "__main__":
    sys.exit(main())
