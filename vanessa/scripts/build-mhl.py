"""Merge lender MH/land research batches (JSON keyed by lender n) into vanessa/lendermhl.js (window.LENDER_MHL).
    python3 vanessa/scripts/build-mhl.py out1.json out2.json ...
Public-source research only: no rates, no broker compensation."""
import json, sys, pathlib, re
V = pathlib.Path(__file__).resolve().parent.parent
D = {}
for f in sys.argv[1:]:
    d = json.load(open(f, encoding="utf-8"))
    for k, v in d.items():
        if not re.fullmatch(r"\d+", str(k)): continue
        D[str(k)] = v
bad = [k for k, v in D.items() if re.search(r"\b(comp(?!\s*(factor|ensating|required))|lpc|bps|basis points|rate sheet price)\b", json.dumps(v), re.I)]
hdr = "// Lender manufactured-home + land/lot criteria and 2025-26 overlay updates, lenders n=1..70. Researched 2026-11-25 with web search\n// from public lender TPO pages, matrices, guides and trade press (sources per lender). No rates, no broker compensation.\n// null = not confirmed. Verify with the AE before quoting.\n"
(V / "lendermhl.js").write_text(hdr + "window.LENDER_MHL=Object.assign(window.LENDER_MHL||{}," + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ");\n", encoding="utf-8")
print(len(D), "lenders ->", V / "lendermhl.js", "| flagged for comp words:", bad)
