#!/usr/bin/env python3
"""Command Deck: add Fitness Coach (Plate & Pulse, https://claude.ai/artifact/4DQyh8Yw2WwGzj8CddBnEd) properly: (1) a
descriptive card at the top of Health & Wellness, (2) the existing "Fitness Dashboard" button renamed to match, (3) a
pages-menu entry under Personal. Steven, 2026-10-27: "add to the dashboard: Fitness Coach <url>". The artifact already
had a bare button in "Related dashboards" (added 2026-10-23); this makes it findable. Plate & Pulse keeps its data in
the viewer's browser and reads Strava, Google Drive (Health Auto Export files) and OpenGym through its own connectors;
it does not read or write any Command Deck document, so the card says the deck's Apple Health and Strava tiles stay the
deck's own. Usage: python3 splice-fitness-coach.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== FITNESS-COACH 2026-10-27 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")
URL = "https://claude.ai/artifact/4DQyh8Yw2WwGzj8CddBnEd"


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


card = '''    <div class="card" style="margin-bottom:16px;border-left:4px solid var(--accent);" id="fitnessCoachCard">
      <div class="card-title-row"><p class="card-title" style="margin:0;">&#127947; Fitness Coach &mdash; Plate &amp; Pulse</p><span class="badge gray">own page</span></div>
      <p class="card-sub" style="margin-top:0;">Training, nutrition and recovery in one page: a profile-driven energy and macro budget, a Data hub that syncs Strava, Apple Health through your Health Auto Export files in Google Drive, and imports from MyFitnessPal, Garmin, Oura, Whoop and others, body-scan entry, a 360 assessment, meal plans with a grocery list, workout programs, and an AI coaching team (trainer, nutritionist, wellness and sleep coaches) that reads the data you choose to share. Its data stays in the browser you open it in; it does not read or write the Command Deck's own Apple Health and Strava tiles, which keep their daily cloud sync. Equations are estimates, not medical advice.</p>
      <p style="margin:0;"><a href="%s" target="_blank" rel="noopener"><b>Open Fitness Coach &#8599;</b></a> &nbsp;&middot;&nbsp; <span class="src-note">also in the pages menu under Personal.</span></p>
    </div>
''' % URL
sub1(r'(    <div class="card" style="margin-bottom:16px;" id="healthLinksCard">)', lambda m: card + m.group(1), "health links anchor")
sub1(r'(<a class="ch-btn ch-btn-go" href="%s" target="_blank" rel="noopener">)Fitness Dashboard(</a>)' % re.escape(URL),
     lambda m: m.group(1) + "Fitness Coach (Plate &amp; Pulse)" + m.group(2), "button label")
sub1(r'(      <div class="pm-group">Personal</div>\n)',
     lambda m: m.group(1) + '      <a class="pm-item" role="menuitem" href="%s" target="_blank" rel="noopener">Fitness Coach &mdash; Plate &amp; Pulse<span class="pm-n" aria-hidden="true">&#8599;</span></a>\n' % URL,
     "pages menu anchor")
sub1(r'(<!-- == LEDGERWISE 2026-10-27 == -->\n)', lambda m: m.group(1) + "<!-- " + MARK + " -->\n", "head marker")
open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
