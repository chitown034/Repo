#!/usr/bin/env python3
"""Command Deck: the AI Team org chart carries the presence desk (2026-10-22).
Steven, 2026-10-22: "continue add more in depth and update 6D brain and update AI org chart with all changes."
Orin (GEO / AEO Lead) already sat under Sofia with the held draft as his working file. This updates his `owns`
text to the deepened kit (docs 07-13, three site pages, data logs, the compliance resolution), names the Presence
Pod in the pods line and in Sofia's AI_TEAM_ORG entry, and stamps the head. Data only; no script or layout change.
Usage: python3 splice-presence-orgchart.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== PRESENCE-ORGCHART 2026-10-22 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(old, new, label):
    global t
    n = t.count(old)
    if n != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % n)
    t = t.replace(old, new, 1)


# 1. Orin's row: the deep kit, the owners, the hold status
sub1(
    'Working file since 2026-10-22: the AEO/SEO/GEO/AIO presence kit (projects/aeo-presence/: audit, 140+ question bank, 90-day calendar, profile copy, JSON-LD, entity site) \\u2014 a held draft until Alexandra clears the Reg Z triggering terms and the VA disclaimer and Steven confirms the unverified licence facts; nothing published.", agent: "geo-aeo-optimizer" },',
    'Working file since 2026-10-22: the AEO/SEO/GEO/AIO presence kit (projects/aeo-presence/: audit, strategy, 140+ question bank, 90-day calendar, profile copy for 11 platforms, JSON-LD, entity site with llms.txt; deepened 2026-10-22 with the technical SEO spec, 40-directory citation list, answer engineering per engine, the GEO playbook with the Wikidata spec and the monthly 10-prompt \\u00d7 5-engine benchmark, twelve page briefs, KPIs/RACI, the marketing-claims compliance page, and the benchmark/citation/KPI logs under data/). Leads the Presence Pod (Sofia, Orin, SEO Specialist, Delia, Gareth, Derek, Alexandra; Elena on domains and accounts). Held draft: hold items 2\\u20135 fixed in the files; item 1 (Reg Z \\u201cno down payment\\u201d) proposed as non-triggering per comment 24(c)-2 and waits on Alexandra; Steven confirms the licence facts; nothing published, deployed or posted.", agent: "geo-aeo-optimizer" },',
    "orin-owns",
)

# 2. Pods prose: add the Presence Pod after the Client Care Pod sentence
sub1(
    "Client Care Pod (Sofia, Sphere Nurture Coordinator, Open House Captain, Wren, Victor, Alexandra; added 2026-10-22).",
    "Client Care Pod (Sofia, Sphere Nurture Coordinator, Open House Captain, Wren, Victor, Alexandra; added 2026-10-22). Presence Pod (Sofia, Orin, SEO Specialist, Delia, Gareth, Derek, Alexandra; Elena joins on domain, DNS and account steps; added 2026-10-22) \\u2014 AEO/SEO/GEO/AIO: profile copy and NAP fixes, schema and llms.txt, the hub deploy packet, citations, review asks, press pitches and the monthly LLM benchmark, drafts and packets only.",
    "pods-prose",
)

# 3. AI_TEAM_ORG Sofia entry: name the presence desk
sub1(
    'Leads the Growth & Marketing Pod (Tariq, Delia, Ansel, Priya, Victor, Maya), run in parallel by Vanessa.", reports: [["content-writer", "finished posts, newsletters, sequences"], ["webinar-producer", "run-of-show, registration, follow-up"]],',
    'Leads the Growth & Marketing Pod (Tariq, Delia, Ansel, Priya, Victor, Maya) and, since 2026-10-22, the Presence Pod (Orin as GEO / AEO Lead, SEO Specialist, Delia, Gareth, Derek, Alexandra) that runs the AEO/SEO/GEO/AIO presence kit in projects/aeo-presence/, run in parallel by Vanessa.", reports: [["content-writer", "finished posts, newsletters, sequences"], ["webinar-producer", "run-of-show, registration, follow-up"], ["geo-aeo-optimizer", "Orin: AI-answer visibility, the monthly LLM benchmark, llms.txt, schema, the presence kit"]],',
    "aiteam-sofia",
)

# 4. Head stamp, next to the other splice marks
sub1("<!-- == PRESENCE-TEXTTALK 2026-10-13 == -->", "<!-- == PRESENCE-TEXTTALK 2026-10-13 == -->\n<!-- " + MARK + " -->", "head-mark")

open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
