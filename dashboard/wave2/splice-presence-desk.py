#!/usr/bin/env python3
"""Command Deck: the AI Team org chart gains the two Presence desk seats (2026-10-25).
Steven, 2026-10-25: "continue add more advance capabilities, automations, workflows, process improvement to enable
scalability, and ai agents if need be and update 2nd brain and ai org chart." Adds Citation Auditor and LLM Visibility
Analyst as report rows under Sofia right after Orin, points Orin's `owns` at the machine (identity file, pulse, benchmark,
free CI), and names the two seats in the Presence Pod sentence. Data only; no script or layout change.
Usage: python3 splice-presence-desk.py <deck.html>   Refuses to run twice."""
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== PRESENCE-DESK 2026-10-25 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(old, new, label):
    global t
    n = t.count(old)
    if n != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % n)
    t = t.replace(old, new, 1)


# 1. Orin: the machine, then the two new rows after his
sub1(
    'Held draft: hold items 2\\u20135 fixed in the files; item 1 (Reg Z \\u201cno down payment\\u201d) proposed as non-triggering per comment 24(c)-2 and waits on Alexandra; Steven confirms the licence facts; nothing published, deployed or posted.", agent: "geo-aeo-optimizer" },',
    'Held draft: hold items 2\\u20135 fixed in the files; item 1 (Reg Z \\u201cno down payment\\u201d) proposed as non-triggering per comment 24(c)-2 and waits on Alexandra; Steven confirms the licence facts; nothing published, deployed or posted. Since 2026-10-25 the program runs as a machine: data/identity.json is the single source of every public fact (build-identity.mjs regenerates llms.txt, schema and bios; --check is the CI gate), scripts/pulse.mjs is the zero-token Monday read that writes PRESENCE-PULSE.md and a vanessaQueue-shaped queue, the free GitHub workflow presence-pulse.yml runs the gates on every push and every Monday; skill presence-pulse. Routine specs (weekly pulse, monthly benchmark) wait on Steven\'s yes.", agent: "geo-aeo-optimizer" },\n        { kind: "report", name: "Citation Auditor", role: "Presence desk \\u00b7 listings sweep \\u00b7 new 2026-10-25", owns: "Weekly read-only sweep of the 40 directory listings (Google Business Profile, Yelp, Zillow, Realtor.com, Homes.com, Bing, Apple, Chamber, military directories) against the identity file: status per listing, last-checked date, and the fix packet Steven applies. Eight listings a week, Tier 1 first; skill citation-sweep. Never edits a listing, never logs in as Steven, never creates an account.", agent: "citation-auditor" },\n        { kind: "report", name: "LLM Visibility Analyst", role: "Presence desk \\u00b7 monthly AI benchmark \\u00b7 new 2026-10-25", owns: "Ten fixed prompts across ChatGPT, Claude, Gemini, Grok and Perplexity, scored 0\\u20132 each month (scripts/benchmark.mjs), the sources engines cite when Steven is absent turned into next month\\u2019s citation and content targets, the next three fixes as queue items, and the 15-minute run sheet Steven completes in his own accounts; skill llm-visibility-benchmark. Never posts or submits feedback to an engine.", agent: "llm-visibility-analyst" },',
    "orin-plus-two",
)

# 2. Pods prose: the Presence Pod's seats
sub1(
    "Presence Pod (Sofia, Orin, SEO Specialist, Delia, Gareth, Derek, Alexandra; Elena joins on domain, DNS and account steps; added 2026-10-22)",
    "Presence Pod (Sofia, Orin, SEO Specialist, Citation Auditor, LLM Visibility Analyst, Delia, Derek, Alexandra; Gareth joins on press, Elena on domain, DNS and account steps; added 2026-10-22, desk seats 2026-10-25)",
    "pods-prose",
)

# 3. Head stamp
sub1("<!-- == PRESENCE-ORGCHART 2026-10-22 == -->", "<!-- == PRESENCE-ORGCHART 2026-10-22 == -->\n<!-- " + MARK + " -->", "head-mark")

open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
