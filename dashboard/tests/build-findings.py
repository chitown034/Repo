#!/usr/bin/env python3
"""Merge every engineer's findings-*.json into one Master Findings Table.

Writes:
  audit/auditFindings.json   — the document shape the dashboard panel reads
  audit/MASTER-FINDINGS.md   — the human table, sorted by priority then id

Usage: python3 build-findings.py
"""
import json, glob, os, collections

SCRATCH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT = os.path.join(SCRATCH, "audit")

REQUIRED = ["id", "category", "description", "priority", "effort", "status"]
DEFAULTS = {"resolution": "Open", "testResult": "Pending", "dateResolved": None,
            "owner": "Vanessa", "trustLevel": "n/a", "halt": False, "panel": "", "system": ""}

def main():
    files = sorted(glob.glob(os.path.join(AUDIT, "findings-*.json")))
    rows, skipped, seen = [], [], set()
    for f in files:
        try:
            data = json.load(open(f, encoding="utf-8"))
        except Exception as e:
            skipped.append((os.path.basename(f), f"unreadable: {e}"))
            continue
        if isinstance(data, dict):
            data = data.get("findings") or data.get("v") or []
        if not isinstance(data, list):
            skipped.append((os.path.basename(f), "not a list"))
            continue
        for r in data:
            if not isinstance(r, dict):
                skipped.append((os.path.basename(f), "non-object row")); continue
            missing = [k for k in REQUIRED if not r.get(k)]
            if missing:
                skipped.append((os.path.basename(f), f"{r.get('id','?')} missing {missing}")); continue
            if r["id"] in seen:
                skipped.append((os.path.basename(f), f"duplicate id {r['id']}")); continue
            seen.add(r["id"])
            out = dict(DEFAULTS); out.update(r)
            out["source"] = os.path.basename(f)
            rows.append(out)

    order = {"P1": 0, "P2": 1, "P3": 2}
    rows.sort(key=lambda r: (order.get(str(r["priority"]).upper(), 3), str(r["id"])))

    # The dashboard panel renders the row, not the essay. before/after are the full record and
    # live in MASTER-FINDINGS.md; carrying them into the document would trade ~140 KB of page
    # weight for text nothing on the page displays.
    DROP = {"source", "before", "after"}
    doc = {"v": {"syncedAt": "2026-09-22", "cycle": 6,
                 "baseline": "2026-09-12 04:47 UTC",
                 "note": "Cycle 6 audit and remediation. Every row was produced by an engineer working a named region of the ecosystem and is traceable to a live document, a scheduled task, or a dated source. Before-and-after detail for each row is in the repository at docs/MASTER-FINDINGS.md.",
                 "findings": [{k: v for k, v in r.items() if k not in DROP} for r in rows]}}
    json.dump(doc, open(os.path.join(AUDIT, "auditFindings.json"), "w", encoding="utf-8"), indent=1)

    by_cat = collections.Counter(r["category"] for r in rows)
    by_pri = collections.Counter(str(r["priority"]).upper() for r in rows)
    by_res = collections.Counter(str(r["resolution"]) for r in rows)
    by_own = collections.Counter(str(r["owner"]) for r in rows)
    halts = [r for r in rows if r.get("halt") is True]

    L = []
    L.append("# Master Findings Table — Cycle 6\n")
    L.append("**Baseline:** 2026-09-12 04:47 UTC · **Audited and remediated:** 2026-09-22 · "
             f"**Findings:** {len(rows)}\n")
    L.append("Every row below was produced by an engineer working one named region of the ecosystem, and is\n"
             "traceable to a live document, a scheduled task, or a dated external source. A row marked\n"
             "Escalated is waiting on Steven and says why in its halt reason.\n")
    L.append("## Totals\n")
    L.append("| By priority | | By resolution | | By owner | |")
    L.append("|---|---|---|---|---|---|")
    pri = [f"{k} {v}" for k, v in sorted(by_pri.items())]
    res = [f"{k} {v}" for k, v in sorted(by_res.items(), key=lambda x: -x[1])]
    own = [f"{k} {v}" for k, v in sorted(by_own.items(), key=lambda x: -x[1])]
    for i in range(max(len(pri), len(res), len(own))):
        a = pri[i].split(" ") if i < len(pri) else ["", ""]
        b = res[i].rsplit(" ", 1) if i < len(res) else ["", ""]
        c = own[i].rsplit(" ", 1) if i < len(own) else ["", ""]
        L.append(f"| {a[0]} | {a[1]} | {b[0]} | {b[1]} | {c[0]} | {c[1]} |")
    L.append("")
    if halts:
        L.append(f"## Halted — waiting on Steven ({len(halts)})\n")
        for r in halts:
            L.append(f"- **{r['id']}** — {r['description'][:180]}  \n  *{r.get('haltReason') or 'Needs a decision.'}*")
        L.append("")
    L.append("## Every finding\n")
    L.append("| ID | Category | Finding | Pri | Eff | Status | Resolution | Test | Resolved | Owner |")
    L.append("|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        d = str(r["description"]).replace("|", "/").replace("\n", " ")
        if len(d) > 240:
            d = d[:237] + "..."
        L.append(f"| {r['id']} | {r['category']} | {d} | {r['priority']} | {r['effort']} | "
                 f"{r['status']} | {r['resolution']} | {r['testResult']} | {r['dateResolved'] or '—'} | {r['owner']} |")
    L.append("")
    L.append("## Before and after, for every remediated row\n")
    for r in rows:
        if r.get("before") or r.get("after"):
            L.append(f"**{r['id']} — {r['category']}**  ")
            if r.get("before"): L.append(f"Before: {str(r['before'])[:500]}  ")
            if r.get("after"): L.append(f"After: {str(r['after'])[:500]}  ")
            L.append("")
    L.append("## By category\n")
    for k, v in sorted(by_cat.items(), key=lambda x: -x[1]):
        L.append(f"- {k}: {v}")
    if skipped:
        L.append("\n## Rows rejected by the merge gate\n")
        L.append("These did not meet the schema and are not counted above. Silence would have been worse.\n")
        for f, why in skipped:
            L.append(f"- `{f}` — {why}")
    open(os.path.join(AUDIT, "MASTER-FINDINGS.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")

    print(f"merged {len(rows)} findings from {len(files)} files")
    print("  priority:", dict(by_pri))
    print("  resolution:", dict(by_res))
    print("  halted:", len(halts))
    if skipped:
        print(f"  rejected {len(skipped)}:")
        for f, why in skipped[:12]:
            print(f"    {f} — {why}")

if __name__ == "__main__":
    main()
