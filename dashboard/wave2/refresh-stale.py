#!/usr/bin/env python3
"""Stale-info refresh for the Command Deck's baked seeds (2026-10-12 pass).

Every block the deck bakes into its HTML that still carried a September stamp is rewritten from the
research JSON files in dashboard/wave2/research-2026-10-12/ (WebSearch + AccuWeather, sourced rows only)
or from the live documents the deck already prefers (newsSnapshot, liveFeeds, ratesSnapshot).
Blocks that only a Mac task can refresh (STRATEGY, HF_MEMO, MARKETING, NEXT_MOVES/SWOT, TV_INTEGRATION)
are left alone on purpose and reported by the caller.

Usage: python3 refresh-stale.py <deck.html> <research-dir> <YYYY-MM-DD>     Refuses to run twice.
"""
import json, re, sys
from pathlib import Path

deck, rdir, today = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
t = open(deck, encoding="utf-8").read()
MARK = "== STALE-REFRESH " + today + " =="
if MARK in t:
    raise SystemExit("ABORT: already applied")
j = lambda x: json.dumps(x, ensure_ascii=False)
R = lambda n: json.load(open(rdir / n, encoding="utf-8"))
changes = []


def sub1(pattern, repl, label, flags=0):
    global t
    t, n = re.subn(pattern, repl, t, count=1, flags=flags)
    if n != 1:
        raise SystemExit("ABORT: anchor not found for " + label)
    changes.append(label)


def replace_block(start_anchor, end_line, body, label):
    """Replace everything between start_anchor (kept) and the first end_line after it (kept)."""
    global t
    i = t.index(start_anchor) + len(start_anchor)
    k = t.index(end_line, i)
    t = t[:i] + body + t[k:]
    changes.append(label)


def stamp(var, text):
    sub1(r'var %s = "' % var, 'var %s = "%s ' % (var, text.replace("\\", "\\\\").replace('"', '\\"')), var)


# ---- 1. Weather seed (AccuWeather read of today; the weatherSnapshot doc carries the same rows) ----
w = R("weather.json")["v"]
rows = "".join("    %s,\n" % j({k: c[k] for k in ("city", "temp", "condition", "high", "low", "feelsLike", "alert", "source", "url")}).replace('"city"', "city").replace('"temp"', "temp").replace('"condition"', "condition").replace('"high"', "high").replace('"low"', "low").replace('"feelsLike"', "feelsLike").replace('"alert"', "alert").replace('"source"', "source").replace('"url"', "url") for c in w["cities"])
replace_block("  var WEATHER_SNAPSHOT = [\n", "  ];", rows, "WEATHER_SNAPSHOT")
sub1(r'var WEATHER_SYNCED_AT = "[^"]*";', lambda _: 'var WEATHER_SYNCED_AT = %s;' % j(w["syncedAt"]), "WEATHER_SYNCED_AT")

# ---- 2. News seed from today's newsSnapshot document (cloud weather & news writer) ----
nw = R("newsSnapshot.json")["v"]
def news_rows(items):
    return "".join("    { title: %s, source: %s, url: %s, date: %s },\n" % (j(i.get("title", "")), j(i.get("source", "")), j(i.get("url", "")), j(i.get("date", ""))) for i in items)
replace_block("  var NEWS_GLOBAL = [\n", "  ];", news_rows(nw["global"]), "NEWS_GLOBAL")
# carry the one seed city the document never writes (Menifee) forward unchanged
m = re.search(r'    "Menifee, CA": \[\n(.*?)\n    \],\n', t, flags=re.S)
menifee = m.group(0) if m else ""
local = ""
for city, items in nw["local"].items():
    local += "    %s: [\n%s    ],\n" % (j(city), news_rows(items).replace("    {", "      {"))
local += menifee
replace_block("  var NEWS_LOCAL = {\n", "  };", local, "NEWS_LOCAL")
sub1(r'var NEWS_SYNCED_AT = "[^"]*";', lambda _: 'var NEWS_SYNCED_AT = %s;' % j(nw["syncedAt"]), "NEWS_SYNCED_AT")

# ---- 3. Bears tracker (Week 5 played Oct 11) ----
b = R("bears.json")
sub1(r'var BEARS_NEXT_GAME_ISO = "[^"]*";', 'var BEARS_NEXT_GAME_ISO = %s;' % j(b["nextGame"]["dateIso"]), "BEARS_NEXT_GAME_ISO")
st = b["standings"]
standing = "NFC North after Week 5: " + " · ".join("%s %d-%d" % (r[0].split()[-1], r[1], r[2]) for r in st) + " (%s)" % b["standingsSource"].split(";")[0]
detail = ("Week 5: %s -- %s Week 4: Bears 23, Jets 12 (Oct 4); Week 3: Bears 27, Eagles 7 on Monday Night Football (Sep 28); Week 2: Vikings 9, Bears 3 (Sep 20); "
          "Week 1: Bears 59, Panthers 37 at Carolina (Sep 13). These tiles are a hand snapshot researched %s (after Week 5), not a feed; the headline list below is refreshed daily by the morning-feeds routine. "
          "Check the midweek practice report before assuming any player's status." % (b["week5"]["final"], b["week5"]["summary"], today))
bd = ("    record: %s,\n    standing: %s,\n    nextGame: %s,\n    detail: %s,\n    source: %s, url: %s\n" % (
    j("%s — W 59-37 at Carolina (Sep 13), L 9-3 vs Minnesota (Sep 20), W 27-7 vs Philadelphia (Sep 28), W 23-12 vs the Jets (Oct 4), L 31-7 at Green Bay (Oct 11) — as of %s" % (b["record"], today)),
    j(standing), j(b["nextGame"]["text"]), j(detail),
    j("%s / %s — WebSearch, %s" % (b["week5"]["source"], b["nextGame"]["source"], today)), j(b["week5"]["url"])))
replace_block("  var BEARS_DATA = {\n", "  };", bd, "BEARS_DATA")
replace_block("  var BEARS_NFC_NORTH_STANDINGS = [\n", "  ];", "".join("    %s,\n" % j(r) for r in st), "BEARS_NFC_NORTH_STANDINGS")
sub1(r'var BEARS_SYNCED_AT = "[^"]*";', lambda _: 'var BEARS_SYNCED_AT = %s;' % j("%s — WebSearch (ESPN recap, Packers.com and ChicagoBears.com for the Week 5 game; Bleacher Report / StatMuse / Yahoo Sports for the standings; ChicagoBears.com and NFL.com for Week 6). Tiebreak order among the three 3-2 teams is unconfirmed." % today), "BEARS_SYNCED_AT")

# ---- 4. Top performers: stocks table re-baked to the Fri Oct 9 close ----
mk = R("market.json")
stocks = "".join("    { ticker: %s, name: %s, change: %s, source: %s, url: %s },\n" % (
    j(g["ticker"]), j(g["name"]), "%.2f" % g["change"], j("%s at the Fri Oct 9, 2026 close — %s (percentages are from close reports, not an exchange table)" % (g["source"], g["why"])), j(g["url"])) for g in mk["gainers"])
replace_block("  var TOP_STOCKS = [\n", "  ];", stocks, "TOP_STOCKS")
sub1(r'"The stocks table is the Sep 21 close" \+ \(function \(\) \{ var n = execDaysOld\("2026-09-21"\);',
     '"The stocks table is the Fri Oct 9 close" + (function () { var n = execDaysOld("2026-10-09");', "topPerformersSyncNote")
stamp("TOP_PERFORMERS_SYNCED_AT", "%s — stocks table re-baked to the Fri Oct 9, 2026 close (Trefis S&P 500 movers, 24/7 Wall St, Motley Fool and CNBC close reports via WebSearch; the ETF, dividend and mutual-fund tables were NOT re-verified today and keep their own dates below). Previous pass:" % today)

# ---- 5. Opportunity radar: four dated items on top ----
ob = R("opp-builders.json")
items = "".join("    {\n      title: %s,\n      category: %s,\n      badge: %s,\n      found: %s,\n      body: %s,\n      url: %s\n    },\n" % tuple(j(i[k]) for k in ("title", "category", "badge", "found", "body", "url")) for i in ob["oppRadar"])
replace_block("  var OPPORTUNITY_RADAR = [\n", "    {", items, "OPPORTUNITY_RADAR")
stamp("OPP_RADAR_SYNCED_AT", "%s — WebSearch (Fannie Mae SEL-2026-09 page, Trading Economics on the Oct 8 PMMS, Scotsman Guide on the FOMC minutes, VA Loan Network on VA rates); four items added at the top, the rest carried from the pass below unchanged. Previous pass:" % today)

# ---- 6. Builder incentives: all three area write-ups re-checked ----
bi = "".join("    { area: %s, summary: %s, source: %s, url: %s },\n" % tuple(j(x[k]) for k in ("area", "summary", "source", "url")) for x in ob["builders"])
replace_block("  var BUILDER_INCENTIVES = [\n", "  ];", bi, "BUILDER_INCENTIVES")
sub1(r'var BUILDER_INCENTIVE_SYNCED_AT = "[^"]*";', lambda _: 'var BUILDER_INCENTIVE_SYNCED_AT = %s;' % j("%s — WebSearch only (Lennar, Tri Pointe, Richmond American and NewHomeSource pages are search-indexed copies; the builder sites themselves are blocked by this session's egress proxy). Every area write-up re-checked today; expired windows are named as expired rather than deleted." % today), "BUILDER_INCENTIVE_SYNCED_AT")
sub1(r"Nothing in them has been re-verified since \(the San Diego write-up was last re-checked 2026-09-28\);", "Every write-up was re-checked on the stamp date;", "builder note")

# ---- 7. PE & Defense + Elite Affluent curated tables: new rows on top ----
pa = R("pe-affluent.json")
replace_block("  var PE_MOVES = [\n", "    [", "".join("    %s,\n" % j(r) for r in pa["peMoves"]), "PE_MOVES")
stamp("PEDEFENSE_SYNCED_AT", "%s — WebSearch (Blackstone release via Benzinga, DefenseScoop, Sinclair wire, Private Equity Wire citing the FT); four rows added at the top, the rest carried unchanged. Previous pass:" % today)
replace_block("  var AFFLUENT_EMPIRES = [\n", "    [", "".join("    %s,\n" % j(r) for r in pa["empires"]), "AFFLUENT_EMPIRES")
stamp("ELITE_AFFLUENT_SYNCED_AT", "%s — WebSearch (PR Newswire / Sportico on Agentiq, Banking Dive on Citi Private Bank, Fortune on Traackr's celebrity-brand data); three rows added at the top of the empires table, the rest carried unchanged. Previous pass:" % today)

# ---- 8. VA compensation + loan program facts: re-verified, stamps say so ----
vf = R("verify.json")
stamp("VA_COMP_SYNCED_AT", "%s — re-verified: %s Previous check:" % (today, vf["vaComp"]["note"]))
pf = "; ".join("%s: %s (%s)" % (i["fact"], i["status"], i["note"].split(".")[0]) for i in vf["programFacts"]["items"])
stamp("PROGRAM_FACTS_SYNCED_AT", "%s — re-verified via WebSearch: %s. Previous pass:" % (today, pf))

# ---- 9. Elite rewards scan: transfer bonuses re-checked today, Hilton +30% added ----
rw = vf["rewards"]
sub1(r'var ELIT_SCAN_SYNCED_AT = "2026-09-22";', 'var ELIT_SCAN_SYNCED_AT = "%s";' % today, "ELIT_SCAN_SYNCED_AT")
t = t.replace("checked Oct 5)", "checked Oct 12)").replace("re-checked Oct 5)", "re-checked Oct 12)").replace("LIVE (checked Oct 5)", "LIVE (checked Oct 12)")
changes.append("ELIT checked-dates")
hil = next((x for x in rw["bonuses"] if x["partner"] == "Hilton Honors"), None)
if hil:
    row = '  [\n    "NEW: Transfer Amex MR → Hilton Honors",\n    %s,\n    %s,\n    "Medium — reported as possibly targeted; open the Amex transfer page to confirm it shows in your account before moving points"\n  ],\n' % (
        j("%s bonus — Frequent Miler / InsideFlyer; verify in-account" % hil["bonus"]), j("Through Oct 14, 2026 — \" + elitCountdown(\"2026-10-14\") + \" (checked Oct 12)"))
    row = row.replace('"Through Oct 14, 2026 — \\" + elitCountdown(\\"2026-10-14\\") + \\" (checked Oct 12)"', '"Through Oct 14, 2026 — " + elitCountdown("2026-10-14") + " (checked Oct 12)"')
    replace_block("  var ELIT_TOP_ACTIONS = [\n", "  [", row, "ELIT_TOP_ACTIONS")
sub1(r'(  /\* Re-scanned 2026-09-22 13:09 UTC by the FR2 freshness pass)', '  /* %s: transfer bonuses (Marriott +70%% to Oct 15, Flying Blue +25%% and Aeromexico +20%% to Oct 30/31, Hilton +30%% to Oct 14) re-checked by WebSearch and the Marriott fall promo / Pechanga / National rows re-read; the issuer-credit lists below were not re-checked today. */\n\\1' % today, "ELIT comment")

# ---- 10. On this day: today's entries from the morning-feeds write (the live feed paints over these) ----
otd = R("onthisday.json")
replace_block("  var ON_THIS_DAY_HISTORY = [\n", "  ];", "".join("    %s,\n" % j(r) for r in otd["history"]), "ON_THIS_DAY_HISTORY")
replace_block("  var ON_THIS_DAY_BIRTHDAYS = [\n", "  ];", "".join("    %s,\n" % j(r) for r in otd["birthdays"]), "ON_THIS_DAY_BIRTHDAYS")
sub1(r'var ON_THIS_DAY_SYNCED_AT = "[^"]*";', 'var ON_THIS_DAY_SYNCED_AT = %s;' % j(otd["checkedAt"]), "ON_THIS_DAY_SYNCED_AT")

# ---- 11. Stamps that only need today's re-check noted (data is live-doc driven or still ahead) ----
stamp("MARKET_SYNCED_AT", "%s — the ratesSnapshot document (mortgage-rates-daily) re-checked Redfin today (marketsSyncedAt 2026-10-12T12:05:58Z) and found no newer published period: Temecula $735,000 (Aug 2026), Murrieta $660,000 (Jul 2026), San Diego County $961,781 (Aug 2026); the page prefers that document over the seed below. Previous seed note:" % today)
stamp("ECONODAY_SYNCED_AT", "%s — calendar re-checked against today's date: this week's rows (Existing-Home Sales Tue Oct 13, CPI Wed Oct 14 — the SSA announces the 2027 COLA the same morning —, PPI + Retail Sales Thu Oct 15) and the FOMC Oct 27-28 / GDP Oct 29 rows were already on the table and agree with the Econoday live note written today; rows dated before Oct 12 are history. Previous pass:" % today)
stamp("TRAVEL_SYNCED_AT", "%s — rows re-checked against today's date (the page hides anything that has already ended; the John Mulaney Oct 15, America Oct 23 and Rocktober Oct 24 rows are still ahead). Research pass:" % today)

t = t.replace("<!-- == APPLE-V2 == -->", "<!-- == APPLE-V2 == -->\n<!-- %s -->" % MARK, 1) if "<!-- == APPLE-V2 == -->" in t else t.replace("</head>", "<!-- %s -->\n</head>" % MARK, 1)
assert MARK in t
open(deck, "w", encoding="utf-8").write(t)
print("ok:", ", ".join(changes))
