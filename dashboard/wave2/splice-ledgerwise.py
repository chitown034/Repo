#!/usr/bin/env python3
"""Command Deck: add Ledgerwise Pro (https://claude.ai/artifact/Nor6oCBSDPY9eufMYcVx1Y) to (1) the Tax & Compliance part of
the Personal Accounts & Investments panel (a link card above the quarterly estimated tax cards) and (2) the pages menu
("Money & markets" group, after Ledger Room). Steven, 2026-10-27: "add Ledgerwise Pro … to the dashboard". The artifact is a
tax-practice prototype (clients, tax prep, bank feeds, mileage, invoices, AI agents) running on SAMPLE data, and the card
says so. Usage: python3 splice-ledgerwise.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== LEDGERWISE 2026-10-27 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")
URL = "https://claude.ai/artifact/Nor6oCBSDPY9eufMYcVx1Y"


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


card = '''    <div class="card" style="margin-bottom:16px;border-left:4px solid var(--accent);" id="ledgerwiseCard">
      <div class="card-title-row"><p class="card-title" style="margin:0;">&#128210; Ledgerwise Pro</p><span class="badge amber">sample data</span></div>
      <p class="card-sub" style="margin-top:0;">A tax-practice command center in its own page: clients and the return pipeline, tax prep with a liability estimator and filing calendar, a tax-research assistant, bank feeds with AI-coded transactions, mileage and expenses, invoices and collections, reports, and six AI agents with an autonomy dial plus automation rules. It runs on illustrative sample data; Plaid, Hurdlr and TaxGPT are simulated until a backend holds their keys, and its figures are not tax advice. Nothing here is connected to your accounts, and no client information should be typed into it.</p>
      <p style="margin:0;"><a href="%s" target="_blank" rel="noopener"><b>Open Ledgerwise Pro &#8599;</b></a> &nbsp;&middot;&nbsp; <span class="src-note">also in the pages menu under Money &amp; markets. Your real tax figures stay in the quarterly estimated tax and strategy cards below.</span></p>
    </div>

''' % URL
# 1. the card, right before the quarterly estimated tax grid
sub1(r'(    </div>\n\n)(    <div class="grid grid-2" style="margin-bottom:16px;">\n      <div class="card">\n        <p class="card-title">Quarterly estimated tax)',
     lambda m: m.group(1) + card + m.group(2), "qet anchor")
# 2. the pages-menu entry, after Ledger Room
sub1(r'(      <a class="pm-item" role="menuitem" href="https://claude\.ai/artifact/YJAz17eL85aSpdF8fgQJ3i"[^\n]*</a>\n)',
     lambda m: m.group(1) + '      <a class="pm-item" role="menuitem" href="%s" target="_blank" rel="noopener">Ledgerwise Pro &mdash; tax practice (sample data)<span class="pm-n" aria-hidden="true">&#8599;</span></a>\n' % URL,
     "pages menu anchor")
# 3. head marker
sub1(r'(<!-- == PROCESS-COVERAGE 2026-10-26 == -->\n)', lambda m: m.group(1) + "<!-- " + MARK + " -->\n", "head marker")
open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
