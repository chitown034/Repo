#!/usr/bin/env python3
"""Refresh the Command Deck's baked Travel & Experiences tables from researched rows.

Usage: python3 refresh-travel.py <deck.html> <rows-dir> <YYYY-MM-DD>
  rows-dir holds inland.json, coast.json, away.json: {City: [[category, name, date, "venue — text (source)"], ...]}
Rules: new rows replace each city's Event/Sports/Entertainment rows; Restaurant rows are kept as they were;
an older non-restaurant row is kept only if it is evergreen or its end date is still ahead (so nothing already
researched is lost, and nothing that has passed stays). Dates are rewritten into the form the deck's own
travelEndDate() understands ("Oct 24, 2026", "Nov 6–15, 2026", "Through Nov 7, 2026"); the date text the
researcher found is kept in the description. Exits without writing if an anchor is missing."""
import json, re, sys, datetime, os

deck, rows_dir, today_s = sys.argv[1:4]
today = datetime.date.fromisoformat(today_s)
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
TVM = {m.lower(): i for i, m in enumerate(MON)}
MAP = {"Temecula": "TEMECULA", "Pechanga": "PECHANGA", "Murrieta": "MURRIETA", "Menifee": "MENIFEE",
       "Riverside": "RIVERSIDE", "SanDiego": "SANDIEGO", "OC": "OC", "LA": "LA",
       "Vegas": "VEGAS", "Chicago": "CHICAGO", "NewBraunfels": "NEWBRAUNFELS"}


def end_date(raw):
    """Python port of the deck's travelEndDate()."""
    s = re.sub(r"\d{1,2}:\d{2}\s*(am|pm)", " ", str(raw), flags=re.I)
    low = s.lower()
    if re.search(r"ongoing|year-?round|home games|lineup|seasonal|nightly|daily|weekly", low):
        return None
    ym = re.search(r"(20\d{2})", s)
    months = re.findall(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)", low)
    if not ym or not months:
        return None
    year, mon = int(ym.group(1)), TVM[months[-1]]
    rg = re.search(r"(\d{1,2})\s*[–—-]\s*(\d{1,2})", s)
    if rg:
        day = int(rg.group(2))
    else:
        nums = [int(n) for n in re.findall(r"\b\d{1,2}\b", re.sub(r"20\d{2}", " ", s)) if 1 <= int(n) <= 31]
        day = max(nums) if nums else 0
    if not day:
        nxt = datetime.date(year + (mon == 11), (mon + 1) % 12 + 1 if mon < 11 else 1, 1)
        return nxt - datetime.timedelta(days=1)
    try:
        return datetime.date(year, mon + 1, day)
    except ValueError:
        return None


def fmt(d):
    return f"{MON[d.month - 1]} {d.day}, {d.year}"


def norm_date(raw):
    """-> (date text the deck can parse, extra note). Returns (None, None) when the row has passed."""
    iso = sorted({datetime.date.fromisoformat(x) for x in re.findall(r"20\d\d-\d\d-\d\d", raw)})
    time = re.search(r"\d{1,2}(?::\d{2})?\s*(?:am|pm)", raw, flags=re.I)
    if iso:
        last = iso[-1]
        if last < today:
            return None, None
        if len(iso) == 1:
            txt = fmt(last)
        elif re.search(r"\bto\b|through|–|—", raw, flags=re.I) and len(iso) == 2 and iso[0].year == last.year:
            if iso[0].month == last.month:
                txt = f"{MON[last.month - 1]} {iso[0].day}–{last.day}, {last.year}"
            else:
                txt = f"Through {fmt(last)}"
        elif all(x.month == last.month and x.year == last.year for x in iso):
            txt = f"{MON[last.month - 1]} {', '.join(str(x.day) for x in iso)}, {last.year}"
        else:
            txt = f"Through {fmt(last)}"
        if len(iso) == 1 and time:
            txt += ", " + time.group(0).upper()
        return txt, raw
    e = end_date(raw)
    if e and e < today:
        return None, None
    return raw, None


def js_str(x):
    return json.dumps(x, ensure_ascii=False).replace("</", "<\\/")


def main():
    t = open(deck, encoding="utf-8").read()
    new = {}
    for f in ("inland", "coast", "away"):
        for k, v in json.load(open(os.path.join(rows_dir, f + ".json"), encoding="utf-8")).items():
            new[k] = v
    stats = {}
    for key, var in MAP.items():
        m = re.search(r"var TRAVEL_%s = \[\n(.*?)\n  \];" % var, t, flags=re.S)
        if not m:
            raise SystemExit(f"ABORT: TRAVEL_{var} not found")
        old = json.loads("[" + m.group(1).rstrip().rstrip(",") + "]")
        out, seen = [], set()
        for cat, name, date, desc in new.get(key, []):
            d, note = norm_date(date)
            if d is None:
                continue
            if cat not in ("Event", "Sports", "Entertainment"):
                cat = "Event"
            if note:
                desc = desc.rstrip() + f" Dates as found: {note}."
            out.append([cat, name, d, desc])
            seen.add(re.sub(r"\W+", "", name.lower())[:24])
        kept = 0
        for r in old:
            if re.sub(r"\W+", "", r[1].lower())[:24] in seen:
                continue
            e = end_date(r[2])
            if r[0] == "Restaurant" or e is None or e >= today:
                out.append(r)
                kept += 1
        stats[key] = (len(new.get(key, [])), len(out) - kept, kept)
        body = ",\n".join("    " + js_str(r) for r in out)
        t = t[:m.start()] + f"var TRAVEL_{var} = [\n{body}\n  ];" + t[m.end():]
    stamp = (f"{today_s} — WebSearch refresh (snippets only; every venue and ticketing page is unreachable from the "
             "build sandbox). Event, sports and entertainment rows were re-researched; restaurant rows and any older "
             "row still ahead were carried over unchanged.")
    t, n = re.subn(r'var TRAVEL_SYNCED_AT = "[^"]*";', lambda _: f'var TRAVEL_SYNCED_AT = {js_str(stamp)};', t)
    if n != 1:
        raise SystemExit("ABORT: TRAVEL_SYNCED_AT anchor")
    a = t.index("      \" · the weekly cloud routine")
    b = t.index("renderTravelFilters();   // creates #travelVisibleCount")
    repl = ('      " · event, sports and entertainment rows were re-researched " + TRAVEL_SYNCED_AT.slice(0, 10) + '
            '"; restaurant rows are evergreen and older carried rows say so in their text. Every row names its source and many come from '
            'search snippets and aggregators, so confirm the date, venue and price on the official page before you drive, buy or RSVP.";\n    ')
    t = t[:a] + repl + t[b:]
    open(deck, "w", encoding="utf-8").write(t)
    for k, (n_in, n_new, kept) in stats.items():
        print(f"{k:13s} researched {n_in:2d} → {n_new:2d} new, {kept:2d} carried")


main()
