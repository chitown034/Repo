#!/usr/bin/env python3
"""Mirror the Command Deck's 2026-10-12 stale-info refresh into the ISA Portal's baked seeds.

The ISA Portal reads the same live documents (ratesSnapshot, liveFeeds) but bakes its own fallback rows.
This copies, from the refreshed deck HTML: MORTGAGE_RATES (the three lender rows the feed never carries
were a month old here) plus the Benchmark rows re-baked from ratesSnapshot.benchmarks, BUILDER_INCENTIVES
(three re-checked areas), and the PROGRAM_FACTS / BUILDER stamps. ISA-only text is left alone.

Usage: python3 refresh-stale-isa.py <isa.html> <deck.html> <ratesSnapshot.json> <YYYY-MM-DD>   Refuses to run twice.
"""
import json, re, sys

isa, deck, ratesj, today = sys.argv[1:5]
t = open(isa, encoding="utf-8").read(); d = open(deck, encoding="utf-8").read()
MARK = "== STALE-REFRESH-ISA " + today + " =="
if MARK in t:
    raise SystemExit("ABORT: already applied")
j = lambda x: json.dumps(x, ensure_ascii=False)


def block(src, start, end="  ];"):
    i = src.index(start) + len(start); k = src.index(end, i)
    return src[i:k]


def put(start, body, end="  ];", label=""):
    global t
    i = t.index(start) + len(start); k = t.index(end, i)
    t = t[:i] + body + t[k:]


def sub1(pat, repl, label):
    global t
    t, n = re.subn(pat, repl, t, count=1)
    if n != 1:
        raise SystemExit("ABORT: anchor " + label)


# 1. Mortgage rates: the deck's 11 rows + ISA's 4 Benchmark rows re-baked from the ratesSnapshot document
rates = block(d, "  var MORTGAGE_RATES = [\n")
r = json.load(open(ratesj, encoding="utf-8")); r = r.get("v", r)
bench = {b["name"]: b for b in r.get("benchmarks", [])}
bmap = [("PMMS 30-yr (weekly survey)", "Freddie Mac PMMS 30-year (weekly survey)", "https://www.freddiemac.com/pmms", "Freddie Mac PMMS"),
        ("PMMS 15-yr (weekly survey)", "Freddie Mac PMMS 15-year (weekly survey)", "https://www.freddiemac.com/pmms", "Freddie Mac PMMS"),
        ("10-yr Treasury yield", "10-year Treasury yield", "https://fred.stlouisfed.org/series/DGS10", "FRED (DGS10)"),
        ("MND 30-yr top-tier (daily index)", "Mortgage News Daily 30-yr top-tier (daily index)", "https://www.mortgagenewsdaily.com/mortgage-rates", "Mortgage News Daily")]
brows = ""
for term, name, url, src in bmap:
    b = bench.get(name)
    if not b:
        continue
    brows += '    { type: "Benchmark", term: %s, rate: %s, apr: null, source: %s, url: %s },\n' % (
        j(term), b["rate"], j("%s · %s (%s) — re-baked %s from the ratesSnapshot document (mortgage-rates-daily, syncedAt %s)" % (src, b["asOf"], b.get("note", ""), today, r.get("syncedAt", ""))), j(url))
rates = rates.rstrip()
if not rates.endswith(","):
    rates += ","
put("  var MORTGAGE_RATES = [\n", rates + "\n" + brows)
stamp = block(d, 'var MORTGAGE_RATES_SYNCED_AT = "', '";')
sub1(r'var MORTGAGE_RATES_SYNCED_AT = "[^"]*";', lambda _: 'var MORTGAGE_RATES_SYNCED_AT = "%s — mirrored from the Command Deck: %s";' % (today, stamp), "MORTGAGE_RATES_SYNCED_AT")

# 2. Builder incentives: the deck's three re-checked areas replace the two September write-ups
put("  var BUILDER_INCENTIVES = [\n", block(d, "  var BUILDER_INCENTIVES = [\n"))
bstamp = block(d, 'var BUILDER_INCENTIVE_SYNCED_AT = "', '";')
sub1(r'var BUILDER_INCENTIVE_SYNCED_AT = "[^"]*";', lambda _: 'var BUILDER_INCENTIVE_SYNCED_AT = "%s";' % bstamp, "BUILDER_INCENTIVE_SYNCED_AT")
t = t.replace("Two hand-researched area write-ups plus a live note", "Three hand-researched area write-ups plus a live note", 1)
t = t.replace("The two area write-ups below are a hand snapshot researched ", "The three area write-ups below are a hand snapshot researched ", 1)

# 3. Program facts: same re-verification stamp as the deck (the rows agree on every figure)
pstamp = block(d, 'var PROGRAM_FACTS_SYNCED_AT = "', '";')
head = pstamp.split(" Previous pass:")[0]
sub1(r'var PROGRAM_FACTS_SYNCED_AT = "', 'var PROGRAM_FACTS_SYNCED_AT = "%s Previous pass: ' % head.replace("\\", "\\\\"), "PROGRAM_FACTS_SYNCED_AT")

# 3b. Market stamp: the live ratesSnapshot.markets (re-checked today) overrides this seed; say so on the fallback too
sub1(r'var MARKET_SYNCED_AT = "', 'var MARKET_SYNCED_AT = "%s — the ratesSnapshot document (mortgage-rates-daily) re-checked Redfin today (marketsSyncedAt %s) and found no newer published period: Temecula Aug 2026, Murrieta Jul 2026, San Diego County Aug 2026; the page prefers that document over this seed. Previous seed note: ' % (today, r.get("marketsSyncedAt", "")), "MARKET_SYNCED_AT")

# 4. Footer build line
sub1(r'<span style="opacity:\.75;">Build 2026-10-05 — ', '<span style="opacity:.75;">Build %s — rates, builder write-ups and program-facts stamps mirror the Command Deck\'s stale-info refresh of %s; previously: Build 2026-10-05 — ' % (today, today), "footer")

t = t.replace("</head>", "<!-- %s -->\n</head>" % MARK, 1)
assert MARK in t
open(isa, "w", encoding="utf-8").write(t)
print("ok: rates (%d benchmark rows), builders, program facts stamp, footer" % brows.count("\n"))
