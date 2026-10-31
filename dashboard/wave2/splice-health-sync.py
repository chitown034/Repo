#!/usr/bin/env python3
"""Command Deck: the Apple Health card tells the truth about the cloud sync (2026-10-31).

Steven, 2026-10-31: "Integrate apple health for health metrics and update the health metrics of the command deck and fix
everything not working". Found: the twelve Health tiles were a week stale although Health Auto Export had dropped a file
into Google Drive every day. The 6:15 AM cloud routine that merges those files (trig_01YPmyQiy1SMzFfr1SzEoLoe) is bound
to a session that stopped working its queue after 10-27, so nothing merged them; the deck could not say so because no card
read the routine's own status document (`healthDriveSync`), and the Apple Health card still carried the 2026-10-05 copy
("This pipeline is down… Replacement route — Claude iOS → Notion").

This splice (1) replaces that stale copy with one live status line driven by `healthDriveSync` (last run, result, newest
export, days of data, Strava), coloured by the AGE OF THE RUN, not of the data; (2) adds the matching alert to the
exception report when the routine has been silent more than 30 hours; (3) fixes two leftover "R8 sync on the Mac" /
"Press Refresh from this Mac" strings; (4) renames the badge iPhone → Google Drive → cloud sync → here. No doc shape
changes; the status doc is read exactly as the routine writes it (ranAt, status, newestFile, days, strava, error).
Usage: python3 splice-health-sync.py <deck.html>   Refuses to run twice (marker in <head>).
"""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== HEALTH-SYNC 2026-10-31 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, repl, t, count=1, flags=flags)


# 1. head marker
sub1(r"(<!-- == FITNESS-COACH 2026-10-27 == -->\n)", lambda m: m.group(1) + "<!-- " + MARK + " -->\n", "head marker")

# 2. badge on the Apple Health card
sub1(r'<span class="badge gold">iPhone → Mac → here</span>',
     lambda m: '<span class="badge gold">iPhone → Google Drive → cloud sync → here</span>', "badge")

# 3. the three 2026-10-05 paragraphs → one live status line + one short explanation
new_copy = (
    '          <p class="card-sub" id="ahDriveSync" style="margin-bottom:6px;">Checking the cloud sync…</p>\n'
    '          <p class="card-sub" style="margin-bottom:6px;">How the tiles refresh (since 2026-10-23): Health Auto Export on the '
    'iPhone writes one JSON file a day into Google Drive, and the cloud routine “Health daily sync” (6:15 AM PT) merges it '
    'into this document — no Mac, no daemon. The Hume ring, the iPhone and Fitbod all arrive through that one file. When the '
    'line above turns amber or red the phone is usually fine; it is the cloud merge that has not run.</p>\n'
)
STALE_RE = (r'          <p class="card-sub" style="margin-bottom:6px;"><b style="color:var\(--negative\);">This pipeline is down as of 2026-10-05.*?\n'
            r'(?=          <p class="src-note" id="ahSyncNote")')
_span = re.search(STALE_RE, t, flags=re.S)
if not _span or _span.group(0).count("<p ") != 3:
    raise SystemExit("ABORT: the stale copy is not exactly three paragraphs (the lazy span would eat other markup)")
sub1(STALE_RE, lambda m: new_copy, "stale 2026-10-05 copy", flags=re.S)

# 4. renderer for the status line, called first thing in renderAppleHealth
render_fn = '''  // HEALTH-SYNC 2026-10-31: the cloud routine writes healthDriveSync after every run (ok / no-new-export / error).
  // The tiles only ever showed the age of the DATA; when the routine itself stopped running (its session sat parked for
  // four days in late October) nothing on the card said so. This line is the routine's own heartbeat, coloured by the
  // age of the RUN. Plain text only — the doc is written by a routine, never rendered as HTML.
  function ahDriveSyncRender() {
    var el = $("ahDriveSync"); if (!el) return;
    var d = lsGet("healthDriveSync", null);
    if (!d || typeof d !== "object" || !d.ranAt) {
      el.style.color = "var(--warning)";
      el.textContent = "Cloud sync has never reported: the 6:15 AM routine has not written its status document yet.";
      return;
    }
    var ms = new Date(String(d.ranAt)).getTime(); var ageH = isNaN(ms) ? null : (Date.now() - ms) / 3600000;
    var when = ageH == null ? String(d.ranAt) : ageH < 1 ? "under an hour ago" : ageH < 48 ? Math.floor(ageH) + " h ago" : Math.floor(ageH / 24) + " days ago";
    var st = String(d.status || "unknown");
    el.style.color = ageH == null ? "var(--text-faint)" : ageH > 60 ? "var(--negative)" : ageH > 30 ? "var(--warning)" : st === "ok" ? "var(--positive)" : "var(--warning)";
    el.textContent = "Cloud sync last ran " + when + " (" + chatFmtTs(d.ranAt) + ") · result: " + st
      + (d.newestFile ? " · newest export " + String(d.newestFile) : "")
      + (d.days ? " · " + String(d.days) + " days of data" : "")
      + (d.strava ? " · Strava: " + String(d.strava) : "")
      + (d.error ? " · error: " + String(d.error) : "");
  }
'''
sub1(r'(  function renderAppleHealth\(\) \{\n    var grid = \$\("ahGrid"\); if \(!grid\) return;\n)',
     lambda m: render_fn + m.group(1) + '    try { ahDriveSyncRender(); } catch (eDs) {}\n', "renderAppleHealth head")

# 5. two leftover strings from the Mac-daemon era
sub1(r'"No snapshot on this dashboard yet\. The R8 sync writes one[^"]*"',
     lambda m: '"No snapshot on this dashboard yet. The cloud routine “Health daily sync” (6:15 AM PT) writes one from the Health Auto Export files in Google Drive; if it stays empty, read the sync line above."',
     "no-snapshot note")
sub1(r'sub: "Press Refresh from this Mac in the desktop app[^"]*"',
     lambda m: 'sub: "The 6:15 AM cloud routine has not merged a new export; read the Health daily sync line on the Apple Health card."',
     "snapshot-age alert sub")

# 6. the alert the exception report was missing: the routine itself went silent. It goes BEFORE the `if (!snap)` early
#    return, in its own try, so a dead routine is reported even when the tiles are empty (validator P05-F1, 2026-10-31).
m = re.search(r'      if \(age > 3\) out\.push\(\{ sev: "info", cat: "health"[^\n]*panel: "([^"]+)"', t)
if not m:
    raise SystemExit("ABORT: anchor snapshot-age alert line (panel id)")
panel = m.group(1)
alert = (
    '    try {\n'
    '      var ds = lsGet("healthDriveSync", null); var dsMs = ds && ds.ranAt ? new Date(String(ds.ranAt)).getTime() : NaN;\n'
    '      if (isNaN(dsMs)) out.push({ sev: "warn", cat: "health", icon: "🍎", title: "Health cloud sync has never reported", '
    'sub: "The 6:15 AM routine has not written its status document; the tiles cannot refresh until it runs.", panel: "' + panel + '" });\n'
    '      else { var dsH = (Date.now() - dsMs) / 3600000; if (dsH > 30) out.push({ sev: dsH > 60 ? "critical" : "warn", cat: "health", icon: "🍎", '
    'title: "Health cloud sync silent " + Math.floor(dsH / 24) + " day" + (Math.floor(dsH / 24) === 1 ? "" : "s"), '
    'sub: "The 6:15 AM routine has not written its status since " + String(ds.ranAt).slice(0, 10) + "; Drive exports are piling up unmerged.", panel: "' + panel + '" }); }\n'
    '    } catch (eDs) {}\n'
)
sub1(r'(  function appleHealthAlerts\(\) \{\n    var out = \[\];\n)', lambda mm: mm.group(1) + alert, "appleHealthAlerts head")

open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
