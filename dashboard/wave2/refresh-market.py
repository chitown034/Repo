#!/usr/bin/env python3
"""Add the latest Freddie Mac PMMS rows and the missing upcoming economic releases to the deck's baked seeds.
Usage: python3 refresh-market.py <deck.html> <market.json> <YYYY-MM-DD>   Refuses to run twice."""
import json, sys, re
deck, mj, today = sys.argv[1:4]
t = open(deck, encoding="utf-8").read(); m = json.load(open(mj))
if 'term: "30-yr fixed (Freddie Mac PMMS)"' in t: raise SystemExit("ABORT: already applied")
j = lambda x: json.dumps(x, ensure_ascii=False)
p3, p1 = m["mortgage"]["pmms_30yr"], m["mortgage"]["pmms_15yr"]
rows = []
for term, p in (("30-yr fixed (Freddie Mac PMMS)", p3), ("15-yr fixed (Freddie Mac PMMS)", p1)):
    rows.append('    { type: "Conventional", term: %s, rate: %s, apr: null, source: %s, asOf: %s, url: %s },' % (
        j(term), p["rate"], j(p["source"] + " — weekly average; the Optimal Blue rows below are daily lender-locked rates and read differently"), j(p["week"]), j(p["url"])))
i = t.index("var MORTGAGE_RATES = [\n") + len("var MORTGAGE_RATES = [\n")
t = t[:i] + "\n".join(rows) + "\n" + t[i:]
t, n = re.subn(r'var MORTGAGE_RATES_SYNCED_AT = "', 'var MORTGAGE_RATES_SYNCED_AT = "%s — added the Freddie Mac PMMS weekly rows (%s: 30-yr %s%%, 15-yr %s%%; WebSearch snippet, not opened on freddiemac.com). Rows below are as previously baked: ' % (today, p3["week"], p3["rate"], p1["rate"]), t, count=1)
assert n == 1
have = set(re.findall(r'event: "([^"]{0,40})', t))
new = []
for e in m["econ"]["upcoming"]:
    if "Retail" in e["event"] or "GDP" in e["event"]:
        new.append('    { date: %s, time: %s, event: %s, consensus: %s, source: %s, url: %s },' % tuple(j(e[k]) for k in ("date", "time", "event", "consensus", "source", "url")))
k = t.index("var ECONODAY_EVENTS = [\n") + len("var ECONODAY_EVENTS = [\n")
t = t[:k] + "\n".join(new) + "\n" + t[k:]
t, n = re.subn(r'var ECONODAY_SYNCED_AT = "', 'var ECONODAY_SYNCED_AT = "%s — added Retail Sales (Oct 15) and the GDP advance estimate (Oct 29) from WebSearch; the other Oct 13–29 rows were already on the calendar. ' % today, t, count=1)
assert n == 1
open(deck, "w", encoding="utf-8").write(t); print("ok", len(rows), "rate rows,", len(new), "econ rows")
