#!/usr/bin/env python3
"""Command Deck: (1) a Palm Springs / Palm Desert card in Travel & Experiences, (2) a Job Command Center card in the
Mind (career) panel. Steven, 2026-10-14: "Add events local to the Palm Springs/Palm Desert to the travel and
experiences section. Add in the career and education section: https://claude.ai/artifact/FYb2UHsVZZB5bZcpU1B6eF
Job Command Center". Rows researched by WebSearch on 2026-10-14 (snippets only; dates as the sources list them —
the page hides anything already past). Usage: python3 splice-travel-palmsprings.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== TRAVEL-PALMSPRINGS 2026-10-14 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


# 1. Travel card, after the New Braunfels card
card = '''    <div class="card" style="margin-bottom:16px;">
      <p class="card-title">🌴 Palm Springs &amp; Palm Desert (Coachella Valley) — activities, events &amp; entertainment</p>
      <p class="card-sub" style="margin-top:0;">Added 2026-10-14 at Steven's request. Palm Springs, Palm Desert, Rancho Mirage and Indio — about 90 minutes from Temecula. Venues: Plaza Theatre and Agua Caliente (Palm Springs/Rancho Mirage), McCallum Theatre and Acrisure Arena (Palm Desert). Rows come from WebSearch snippets; confirm dates on the venue page before buying.</p>
      <div class="table-wrap"><table><thead><tr><th>Category</th><th>Name</th><th>Date</th><th>Details</th></tr></thead><tbody id="travelPalmSpringsRows"></tbody></table></div>
    </div>
'''
sub1(r'(<tbody id="travelNewBraunfelsRows"></tbody></table></div>\n    </div>\n)', r"\1" + card.replace("\\", "\\\\"), "travel card anchor")

# 2. Rows + city definition
rows = r'''  var TRAVEL_PALMSPRINGS = [
    ["Event", "Modernism Week — Fall Preview", "Oct 15–18, 2026", "Palm Springs — architecture tours, home tours, talks (modernismweek.com via WebSearch 2026-10-14). Dates as found: 2026-10-15 to 2026-10-18 (one listing says Oct 16-19; verify)."],
    ["Entertainment", "Steve Earle — 51 Years of Songs & Stories", "Oct 16, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Randy Rainbow", "Oct 16–18, 2026", "McCallum Theatre, Palm Desert — several shows Oct 16-18 (concertfix.com via WebSearch 2026-10-14)."],
    ["Event", "19th Annual Concerts for Autism", "Oct 17, 2026", "The Big Rock Pub, Indio (discoverpalmdesert.com via WebSearch 2026-10-14)."],
    ["Entertainment", "10,000 Maniacs", "Oct 18, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "WWE Survivor Series: WarGames", "Oct 22, 2026", "Acrisure Arena, Palm Desert (acrisurearena.com via WebSearch 2026-10-14)."],
    ["Sports", "Coachella Valley Firebirds (AHL) — home games", "Oct 23–30, 2026", "Acrisure Arena, Palm Desert — Oct 23, Oct 28 and Oct 30 home dates (acrisurearena.com/events via WebSearch 2026-10-14)."],
    ["Entertainment", "Westminster Chorus LIVE! with Smoke Ring", "Oct 24, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Megan Hilty", "Oct 25, 2026", "McCallum Theatre, Palm Desert (concertfix.com via WebSearch 2026-10-14)."],
    ["Entertainment", "The B-52s and DEVO", "Oct 31, 2026", "Acrisure Arena, Palm Desert (acrisurearena.com via WebSearch 2026-10-14; one aggregator shows Oct 30 — verify)."],
    ["Entertainment", "PS Pops at the Plaza: Dancing Queens", "Nov 4, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Tom Papa (comedy)", "Nov 4, 2026", "McCallum Theatre, Palm Desert (concertfix.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Rita Moreno", "Nov 5, 2026, 7:00 PM", "McCallum Theatre, Palm Desert (allevents.in via WebSearch 2026-10-14)."],
    ["Event", "Greater Palm Springs Pride — 40th anniversary", "Nov 6–8, 2026", "Downtown Palm Springs and the Arenas District — festival Nov 6-8 with stages, marketplace and block parties; parade Sunday Nov 8, 10 AM, Palm Canyon Dr from Tachevah south; free (palmspringsca.gov, visitpalmsprings.com, pspride.org via WebSearch 2026-10-14)."],
    ["Sports", "Palm Springs Pride Run and Walk 5K", "Nov 7, 2026, 8:00 AM", "Las Palmas neighborhood, Palm Springs (allevents.in via WebSearch 2026-10-14)."],
    ["Event", "Palm Springs Veterans Day Parade (29th annual)", "Nov 11, 2026", "Downtown Palm Springs, Palm Canyon Dr — the valley's Veterans Day parade; a natural fit for the nonprofit and the VA-loan practice (WebSearch listing 2026-10-14; check the city page for the start time)."],
    ["Entertainment", "Los Tigres del Norte", "Nov 13, 2026, 8:00 PM", "Acrisure Arena, Palm Desert (acrisurearena.com via WebSearch 2026-10-14)."],
    ["Event", "Pride on the Page — book festival", "Nov 14, 2026", "Palm Springs Cultural Center — free (WebSearch listing 2026-10-14)."],
    ["Entertainment", "Jonas Brothers", "Nov 17, 2026, 7:30 PM", "Acrisure Arena, Palm Desert (allevents.in via WebSearch 2026-10-14)."],
    ["Entertainment", "Rachael & Vilray", "Nov 18, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Sports", "Acrisure Series — college basketball", "Nov 21–26, 2026", "Acrisure Arena, Palm Desert — Nov 21-26; Gonzaga vs Michigan State Nov 26 (acrisurearena.com via WebSearch 2026-10-14)."],
    ["Entertainment", "The Drifters", "Nov 27, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Zeppelin USA", "Nov 27, 2026", "Agua Caliente Casino, Rancho Mirage (songkick.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Big Bad Voodoo Daddy", "Nov 29, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Entertainment", "David Benoit", "Nov 30, 2026", "Plaza Theatre, Palm Springs (palmspringsconcerts.com via WebSearch 2026-10-14)."],
    ["Event", "WildLights at The Living Desert", "Through Dec 30, 2026", "Living Desert Zoo & Gardens, Palm Desert — 3 million lights on select nights, 6-9 PM, reservations recommended. 2026 dates not yet posted; 2025 ran Nov 25-Dec 30 (livingdesert.org, palmspringslife.com via WebSearch 2026-10-14) — verify before going."],
    ["Event", "Indio International Tamale Festival (34th)", "Dec 5–6, 2026", "Downtown Indio — Dec 5-6, 10 AM-7 PM, free admission (nbcpalmsprings.com, visitcalifornia.com via WebSearch 2026-10-14)."],
    ["Sports", "BYU vs San Diego State — men's basketball", "Dec 19, 2026", "Acrisure Arena, Palm Desert — neutral-site game (acrisurearena.com via WebSearch 2026-10-14)."],
    ["Entertainment", "Palm Springs Aerial Tramway — winter hours", "Through May 27, 2027", "Rotating tram to Mountain Station (8,516 ft): 54 miles of trails, Peaks restaurant and Pines Café; winter hours from Oct 2026 to May 27, 2027 after the fall maintenance closure (pstramway.com via WebSearch 2026-10-14). Adult admission listed at $34.95 in Feb 2026 — check the site."]
  ];
'''
sub1(r'(  var TRAVEL_CITY_DEFS = \[\n)', rows.replace("\\", "\\\\") + r"\1", "rows anchor")
sub1(r'(    \{ id: "travelNewBraunfelsRows", get: function \(\) \{ return TRAVEL_NEWBRAUNFELS; \} \})\n', r'\1,\n    { id: "travelPalmSpringsRows", get: function () { return TRAVEL_PALMSPRINGS; } }\n', "city defs")
sub1(r'  var TRAVEL_SYNCED_AT = "2026-10-12 — rows re-checked', '  var TRAVEL_SYNCED_AT = "2026-10-12 — Palm Springs / Palm Desert card added 2026-10-14 (29 rows, WebSearch that day; other cities not re-researched). Rows re-checked', "synced-at")

# 4. The shared Date parser read "7 PM" as day 7 of the month (it only stripped "7:00 PM" times); strip any clock time
sub1(r'    var s = String\(raw\)\.replace\(/\\d\{1,2\}:\\d\{2\}\\s\*\(am\|pm\)/ig, " "\);',
     r'    var s = String(raw).replace(/\\d{1,2}(:\\d{2})?\\s*(am|pm)\\b/ig, " ");   // 2026-10-14: "7 PM" is a time, not a day of the month', "date parser")
sub1(r'\(Chicago and New Braunfels were added 2026-10-05 with headline events only\)',
     '(Chicago and New Braunfels were added 2026-10-05 with headline events only; Palm Springs / Palm Desert on 2026-10-14)', "coverage note")

# 3. Job Command Center card at the top of the Mind (career) panel
job = '''    <div class="card" style="margin-bottom:16px;border-left:4px solid var(--accent);" id="jobCommandCenterCard">
      <div class="card-title-row"><p class="card-title" style="margin:0;">💼 Job Command Center</p><span class="badge gray">daily 6:40 AM PT</span></div>
      <p class="card-sub" style="margin-top:0;">RoleCompass — Steven's job-search command center (its own dashboard and database). The cloud routine “RoleCompass daily job hunt (v4)” searches every active profile each morning (NAVWAR / PEO C4I program support, cleared and AI/automation roles at the tracked contractors, ClearanceJobs, USAJOBS), scores against the evidence file, drafts a packet per new role, re-verifies open listings and flags deadlines inside 7 days. It never applies, emails or contacts anyone — that is yours.</p>
      <p style="margin:0;"><a href="https://claude.ai/artifact/FYb2UHsVZZB5bZcpU1B6eF" target="_blank" rel="noopener"><b>Open the Job Command Center &#8599;</b></a> &nbsp;·&nbsp; <span class="src-note">also in the pages menu as “Job Machine — Ultimate Job Search Dashboard”</span></p>
    </div>
'''
sub1(r'(<h2 class="panel-title">Mind — USC &amp; Study: AI DBA</h2>\n    </div>\n)', r"\1" + job.replace("\\", "\\\\"), "mind panel anchor")

t = t.replace("<!-- == KAPSO 2026-10-13 == -->", "<!-- == KAPSO 2026-10-13 == -->\n<!-- %s -->" % MARK, 1)
assert MARK in t
open(deck, "w", encoding="utf-8").write(t)
print("ok: travel card + 29 rows, city def, stamps, job command center card")
