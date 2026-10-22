#!/usr/bin/env python3
"""Command Deck: Las Vegas nightlife and shows in Travel & Experiences. Steven, 2026-10-14: "Add Day and night clubs
in Vegas, shows, events, circus de solei under Vegas section of entertainment". Adds rows to TRAVEL_VEGAS (the
Las Vegas card): the five Cirque du Soleil resident shows one per row, the Strip's nightclubs and dayclubs, the
long-running production shows, and dated events found this pass (F1 Grand Prix, Tim McGraw, Weezer, Jonas Brothers,
Backstreet Boys at Sphere, Trans-Siberian Orchestra). Evergreen clubs and shows use "Nightly"/"Ongoing"/"Seasonal"
wording so travelEndDate() keeps them visible; dated rows hide themselves once past. WebSearch snippets only
(2026-10-14) — confirm on the venue page. The old "all 5 resident shows" summary row is retired (replaced by the
five rows). Usage: python3 splice-travel-vegas.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== TRAVEL-VEGAS 2026-10-14 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


S = "via WebSearch 2026-10-14"
rows = r'''  var TRAVEL_VEGAS = [
    // == TRAVEL-VEGAS 2026-10-14 == nightlife, shows, Cirque and events added at Steven's request (WebSearch snippets that day)
    ["Entertainment", "Cirque du Soleil — “O”", "Nightly (Wed–Sun), 7:00 PM & 9:30 PM", "Bellagio — the aquatic show in a 1.5-million-gallon pool; resale listings from about $168 (Nevada Business Magazine / concerts.vegas, SRC). Schedule published Sep 2025 said Wed–Sun 6:30 & 9 PM; confirm times on cirquedusoleil.com."],
    ["Entertainment", "Cirque du Soleil — Mystère", "Nightly (Fri–Tue), 6:00 PM & 8:30 PM", "Treasure Island — the original Vegas Cirque show, running since 1993 (Nevada Business Magazine, SRC)."],
    ["Entertainment", "Cirque du Soleil — KÀ", "Nightly (Mon–Wed, Sat–Sun)", "MGM Grand — martial-arts epic on a rotating stage; Mon–Wed 6 & 8:30 PM, Sat–Sun 4:30 & 7 PM; resale from about $60 (Nevada Business Magazine / vividseats, SRC)."],
    ["Entertainment", "Cirque du Soleil — Michael Jackson ONE", "Nightly (Thu–Mon), 6:30 PM & 9:00 PM", "Mandalay Bay — MJ catalogue with Cirque acrobatics; resale from about $162 (Nevada Business Magazine / seatgeek, SRC)."],
    ["Entertainment", "Cirque du Soleil — Mad Apple", "Nightly (Tue–Sat), 7:00 PM & 9:30 PM", "New York-New York — NYC-themed comedy, music and acrobatics; the most casual of the five (Nevada Business Magazine, SRC)."],
    ["Entertainment", "XS Nightclub (Encore at Wynn)", "Nightly (Fri–Sun, Mon Nightswim seasonal)", "Encore at Wynn — the highest-grossing club in the U.S. for over a decade; indoor-outdoor room around the pool, EDM resident DJs (nocovervegas.com / vegas.com, SRC). Check xslasvegas.com for the weekend's DJ."],
    ["Entertainment", "Omnia Nightclub (Caesars Palace)", "Nightly (Tue, Fri, Sat)", "Caesars Palace — kinetic chandelier main room, Heart of Omnia lounge, rooftop terrace; EDM residents (Tao Group) (Wikipedia / promoternow.com, SRC)."],
    ["Entertainment", "Hakkasan Nightclub (MGM Grand)", "Nightly (Thu–Sun)", "MGM Grand — five-floor complex, main room plus Ling Ling club; EDM and hip-hop residents (promoternow.com, SRC)."],
    ["Entertainment", "Zouk Nightclub (Resorts World)", "Nightly (Thu–Sat)", "Resorts World — promoternow's #1 club for 2026; the Mothership LED installation, house and tech-house lineup (promoternow.com, SRC)."],
    ["Entertainment", "LIV Nightclub (Fontainebleau)", "Nightly (Fri–Sat)", "Fontainebleau — the Miami brand in a new room on the north Strip; LIV Beach dayclub next door (promoternow.com, SRC)."],
    ["Entertainment", "Marquee Nightclub (Cosmopolitan)", "Nightly (Fri–Mon)", "The Cosmopolitan — three rooms plus the Boombox hip-hop room; one of the only even-ratio free guest lists on the Strip, a good weeknight pick (promoternow.com, SRC)."],
    ["Entertainment", "Drai's Nightclub & Beachclub (The Cromwell)", "Nightly (Thu–Sun) · dayclub seasonal", "The Cromwell rooftop, 11 floors up with a Strip view; hip-hop and R&B live performers; Drai's After Hours runs late (vegas.com, SRC — status of specific nights not confirmed)."],
    ["Entertainment", "Encore Beach Club — dayclub", "Seasonal (Mar–late Oct); Nightswim evenings", "Encore at Wynn — the Strip's flagship pool party; the 2026 season opened Mar 7 and dayclubs generally close mid/late Oct to early Nov (thebettervacation.com / nocovernightclubs.com, SRC). Check the calendar before a fall visit."],
    ["Entertainment", "Tao Beach Dayclub (The Venetian)", "Seasonal (Mar–Oct)", "The Venetian — rooftop pool club by Tao Group; 2026 season opened Mar 14 (thebettervacation.com, SRC)."],
    ["Entertainment", "Marquee Dayclub (Cosmopolitan)", "Seasonal (Mar–Oct)", "The Cosmopolitan — pool club above the Strip with grand cabanas; 2026 season opened Mar 13 (thebettervacation.com, SRC)."],
    ["Entertainment", "Palm Tree Beach Club (MGM Grand)", "Seasonal (Mar–Oct)", "MGM Grand — Kygo's Palm Tree Crew club in the former Wet Republic footprint; 2026 season opened Mar 11 (travelmarketreport.com / thebettervacation.com, SRC)."],
    ["Entertainment", "LIV Beach (Fontainebleau) — dayclub", "Seasonal (Mar–Oct)", "Fontainebleau — the first 2026 dayclub to open (Mar 6) (thebettervacation.com, SRC)."],
    ["Entertainment", "Ayu Dayclub (Resorts World)", "Seasonal (spring–fall)", "Resorts World — Southeast-Asia-themed pool club next to Zouk; opens later in spring than the others (thebettervacation.com, SRC — exact 2026 dates not found)."],
    ["Entertainment", "Liquid Pool Lounge (Aria)", "Seasonal (Mar–Oct)", "Aria — the calmer, adults-only pool option; 2026 season opened Mar 18 (thebettervacation.com, SRC)."],
    ["Entertainment", "Blue Man Group", "Nightly, 5:00 PM & 8:00 PM", "Luxor — Blue Man Theater; Ticketmaster lists shows daily through late October and beyond (ticketmaster.com / livenation.com, SRC)."],
    ["Entertainment", "Penn & Teller", "Nightly, 8:00 PM & 9:30 PM", "Rio — Masquerade Tower; the Strip's longest-running headliners (showscalendar.vegas October roundup, SRC)."],
    ["Entertainment", "Jabbawockeez", "Nightly, 5:30 PM & 8:00 PM", "MGM Grand — masked hip-hop dance crew, all ages (showscalendar.vegas, SRC)."],
    ["Entertainment", "David Copperfield", "Nightly", "MGM Grand — David Copperfield Theater; listed in the October 2026 roundup, times not captured (showscalendar.vegas, SRC)."],
    ["Entertainment", "Awakening (Wynn) · Atomic Saloon · Magic Mike Live", "Ongoing — status not re-verified", "Wynn / Grand Canal Shoppes at the Venetian / Sahara — three more long-running productions; not found in this pass's search results, so confirm they are still open before booking (SRC)."],
    ["Event", "Formula 1 Heineken Las Vegas Grand Prix", "Nov 19–21, 2026", "Strip street circuit — race weekend Thu–Sat, race Saturday night Nov 21 (visitlasvegas.com / racingnews365.com, SRC). Expect Strip closures and peak hotel rates all week."],
    ["Entertainment", "Tim McGraw — Colosseum run", "Through Nov 7, 2026", "The Colosseum at Caesars Palace (Ticketmaster Las Vegas listings, SRC). Dates as found: 2026-10-23 to 2026-11-07."],
    ["Entertainment", "Weezer with The Shins & Silversun Pickups", "Oct 23, 2026", "T-Mobile Arena (lavishvegas.com October guide, SRC)."],
    ["Entertainment", "Jonas Brothers — The Burning Up Tour", "Nov 28, 2026", "MGM Grand Garden Arena (Ticketmaster Las Vegas listings, SRC)."],
    ["Entertainment", "Trans-Siberian Orchestra — The Ghosts of Christmas Eve", "Dec 4, 2026", "Michelob ULTRA Arena at Mandalay Bay (Ticketmaster Las Vegas listings, SRC)."],
    ["Entertainment", "Matt Rife — Stay Golden World Tour", "Dec 4, 2026", "Dolby Live at Park MGM (Ticketmaster Las Vegas listings, SRC)."],
    ["Entertainment", "Backstreet Boys: Into The Millennium at Sphere", "Dec 26, 2026", "Sphere — listed December date; more may be added (Ticketmaster Las Vegas listings, SRC)."],
'''.replace("SRC", S)

sub1(r'  var TRAVEL_VEGAS = \[\n', rows.replace("\\", "\\\\"), "TRAVEL_VEGAS head")

# Retire the summary row now that each Cirque show has its own line (keeps the table honest, no duplicate).
sub1(r'    \["Entertainment", "Cirque du Soleil — all 5 resident shows", "Ongoing", [^\n]*\n', "", "old Cirque summary row")

# Stamp: keep the leading date (the panel note slices 10 chars), add this pass after it.
sub1(r'(var TRAVEL_SYNCED_AT = "2026-10-12 — )',
     r'\1Las Vegas nightlife, shows, Cirque and events added 2026-10-14 (31 rows, WebSearch that day). ',
     "TRAVEL_SYNCED_AT")

open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
