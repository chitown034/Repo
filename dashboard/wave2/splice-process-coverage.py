#!/usr/bin/env python3
"""Command Deck: (1) Nova — Coverage & Process Auditor — joins Derek's reports in ORG_CHART; (2) a "Process coverage" card
opens the Orchestration & Loop Engineering panel: it reads the `processCoverage` register (written by `bin/brain coverage
--deck-doc`, Nova's seat) and computes LIVE freshness for every automated document from that document's own stamp in this
database — nothing typed by hand, no routine needed for the status. Steven, 2026-10-26: "update AI org chart… ensure all data
is live and synced and look for gaps in the process to automate and have an AI agent facilitate complete coverage".
Usage: python3 splice-process-coverage.py <deck.html>   Refuses to run twice."""
import re
import sys

deck = sys.argv[1]
t = open(deck, encoding="utf-8").read()
MARK = "== PROCESS-COVERAGE 2026-10-26 =="
if MARK in t:
    raise SystemExit("ABORT: already applied")


def sub1(pat, repl, label, flags=0):
    global t
    found = len(re.findall(pat, t, flags=flags))
    if found != 1:
        raise SystemExit("ABORT: anchor " + label + " (matched %d, need exactly 1)" % found)
    t = re.sub(pat, lambda m: m.group(0).replace(m.group(0), repl(m) if callable(repl) else repl), t, count=1, flags=flags)


# 0. marker in <head>
sub1(r'(<!-- == PRESENCE-DESK 2026-10-25 == -->\n)', lambda m: m.group(1) + "<!-- " + MARK + " -->\n", "head marker")

# 1. Nova under Derek, right after Rafael (Workflow Architect)
nova = ('        { kind: "report", name: "Nova", role: "Coverage & Process Auditor \\u00b7 new 2026-10-26", owns: "Complete coverage of every process on both dashboards. Broker Command Center: the Coverage Engine (daily sweep, process coverage matrix, live-sync board, health checks). Command Deck: the process-coverage register \\u2014 every document the deck reads, its writer, cadence and owning seat (bin/brain coverage, brain/coverage/writers.json) \\u2014 and the live Process coverage card in Orchestration that scores each one from its own stamp. Uncovered processes go to Owen and Kai\\u2019s Kaizen board; stale automated documents become Big-moves risk signals. Proposes, never edits a live routine.", agent: "coverage_report \\u00b7 bin/brain coverage" },\n')
if 'name: "Nova"' in t:
    print("Nova already on the org chart (another session added her) — seat not duplicated")
else:
    sub1(r'(        \{ kind: "report", name: "Rafael", role: "Workflow Architect[^\n]*\n)', lambda m: m.group(1) + nova, "Rafael anchor")

# 2. The card, first section of the Orchestration panel
card = '''    <h3 class="section-label collapsible" data-secnum="39.0">Process coverage — every document, its writer, its owner, and whether it moved</h3>
    <div class="card" style="margin-bottom:16px;" id="orchCoverageCard">
      <div class="card-title-row">
        <div>
          <p class="card-title">Live coverage of the Command Deck's processes</p>
          <p class="card-sub" style="margin:0;">The register is <code>processCoverage</code> (Nova's seat, <code>bin/brain coverage</code>); the status of each automated document is computed right now from that document's own stamp in this database against its cadence. Manual rows are Steven's by design; "no writer" and "stale" rows are the gaps.</p>
        </div>
        <span class="badge gray" id="orchCovBadge">—</span>
      </div>
      <div class="tk-tiles" id="orchCovTiles"></div>
      <div class="kanban-filter" id="orchCovFilter" role="group" aria-label="Filter coverage rows"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Doc</th><th>Panel</th><th>Writer</th><th>Cadence</th><th>Owner</th><th>Last stamp</th><th>Status</th></tr></thead>
          <tbody id="orchCovRows"></tbody>
        </table>
      </div>
      <p class="src-note" id="orchCovNote" style="margin-top:8px;"></p>
    </div>

'''
sub1(r'(    <h3 class="section-label collapsible" data-secnum="39\.1">Cycle status</h3>\n)', lambda m: card + m.group(1), "39.1 anchor")

# 3. The renderer + registration
js = r'''
  /* ---- 39.0 Process coverage (== PROCESS-COVERAGE 2026-10-26 ==) ----
     Reads the processCoverage register and scores every automated document from ITS OWN stamp in this database.
     The register never carries a status: a stale register could not make a stale document look fresh. */
  var ORCH_COV_FILTER = "gaps";
  var ORCH_COV_KEYS = ["syncedAt", "checkedAt", "ranAt", "updatedAt", "generatedAt", "generated", "builtAt", "asOf", "writtenAt", "refreshedAt", "lastBackup", "date"];
  function orchCovStamp(doc) {
    var v = null;
    try { v = lsGet(doc, null); } catch (e) { return { missing: true, t: null }; }
    if (v === null || v === undefined) return { missing: true, t: null };
    var raw = null;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (var i = 0; i < ORCH_COV_KEYS.length; i++) {
        if (typeof v[ORCH_COV_KEYS[i]] === "string" && orchCovParse(v[ORCH_COV_KEYS[i]]) !== null) { raw = v[ORCH_COV_KEYS[i]]; break; }   // the first key that PARSES, as the Python does
      }
    }
    var txt = "", t = raw ? orchCovParse(raw) : null;
    if (!raw) {
      try { txt = JSON.stringify(v).slice(0, 20000); } catch (e) { txt = ""; }
      /* whole tokens (seconds, fraction, zone kept) so the zone is never dropped; body dates in the future are
         renewal/expiry dates, never write stamps, so they are ignored (48 h skew) */
      var m = txt.match(/20\d\d-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:\.\d+)?(?:Z|[+-]\d\d:?\d\d)?/g) || txt.match(/\b20\d\d-\d\d-\d\d\b/g) || [];
      var limit = Date.now() + 48 * 3600000;
      for (var j = 0; j < m.length; j++) { var tj = orchCovParse(m[j]); if (tj !== null && tj <= limit && (t === null || tj > t)) { t = tj; raw = m[j]; } }
    }
    return { missing: false, t: t, raw: raw, empty: v === "" || v === null || (Array.isArray(v) ? v.length === 0 : (typeof v === "object" && !Object.keys(v).length)) };
  }
  function orchCovParse(s) {
    s = String(s || "").trim();
    if (!s) return null;
    /* a zone-less ISO stamp is UTC (every writer stamps UTC); without this a Pacific browser would read it as local
       time and call a fresh document a "future stamp" */
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(s)) s += "Z";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T12:00:00Z";
    var t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    var m = String(s).match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s*(PDT|PST)?/i);
    if (m) {
      var h = (parseInt(m[2], 10) % 12) + (m[4].toUpperCase() === "PM" ? 12 : 0), off = (m[5] || "PDT").toUpperCase() === "PST" ? 8 : 7;
      return Date.UTC(+m[1].slice(0, 4), +m[1].slice(5, 7) - 1, +m[1].slice(8, 10), h + off, +m[3]);
    }
    m = String(s).match(/([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/);
    if (m) { t = new Date(m[1] + " " + m[2] + ", " + m[3] + " 21:00:00Z").getTime(); if (!isNaN(t)) return t; }
    return null;
  }
  function orchCovStatus(r) {
    var auto = r.kind === "cloud" || r.kind === "mac" || r.kind === "ci" || r.kind === "deck";
    if (r.kind === "derived") return ["derived", "gray", false];
    if (r.kind === "retired") return ["retired", "gray", !!r.note];
    if (r.kind === "none") return ["no writer", "red", true];
    var s = orchCovStamp(r.doc);
    if (r.kind === "user" || r.kind === "session") return [s.missing || s.empty ? "never typed" : "manual", "gray", false];
    if (s.missing) return ["never written", "red", true];
    if (!auto || !r.cadenceHours) return ["queue-driven", "gray", false];
    if (!s.t) return ["no stamp", "amber", true];
    var age = (Date.now() - s.t) / 3600000;
    if (age < -1) return ["future stamp", "amber", true];
    return age <= r.cadenceHours * 1.5 ? ["fresh", "green", false] : ["stale", "red", true];
  }
  function renderOrchCoverage() {
    var rows = $("orchCovRows"), tiles = $("orchCovTiles"), note = $("orchCovNote"), fw = $("orchCovFilter"); if (!rows) return;
    var reg = lsGet("processCoverage", null);
    var list = reg && Array.isArray(reg.docs) ? reg.docs : [];
    if (!list.length) {
      orBadge("orchCovBadge", "no register yet", "gray");
      rows.innerHTML = '<tr><td colspan="7" class="src-note">No processCoverage register yet — run <code>bin/brain coverage --db &lt;export&gt; --deck-doc out.json</code> and write it with ArtifactData (Nova).</td></tr>';
      if (note) note.textContent = "";
      return;
    }
    var scored = list.map(function (r) { var st = orchCovStatus(r); var s = orchCovStamp(r.doc); return { r: r, status: st[0], cls: st[1], gap: st[2], t: s.t, raw: s.raw }; });
    var auto = scored.filter(function (x) { return x.r.kind === "cloud" || x.r.kind === "mac" || x.r.kind === "ci" || x.r.kind === "deck"; });
    var n = function (st) { return scored.filter(function (x) { return x.status === st; }).length; };
    var gapsN = scored.filter(function (x) { return x.gap; }).length;
    var tileRows = [[String(scored.length), "Documents"], [String(auto.length), "Automated"], [String(n("fresh")), "Fresh now"], [String(n("stale")), "Stale"],
                    [String(n("never written") + n("no writer")), "Never written / no writer"], [String(n("manual") + n("never typed")), "Manual (Steven)"], [String(gapsN), "Gaps"]];
    if (tiles) tiles.innerHTML = tileRows.map(function (x) { return '<div class="tk-tile"><b>' + orEsc(x[0]) + "</b><span>" + orEsc(x[1]) + "</span></div>"; }).join("");
    orBadge("orchCovBadge", gapsN ? gapsN + " gap" + (gapsN === 1 ? "" : "s") : "all automated documents moved on time", gapsN ? "red" : "green");
    var tabs = []; scored.forEach(function (x) { var tb = x.r.tab || "code only"; if (tabs.indexOf(tb) < 0) tabs.push(tb); });
    if (fw) {
      var chips = [["gaps", "Gaps (" + gapsN + ")"], ["auto", "Automated"], ["all", "All"]].concat(tabs.map(function (tb) { return ["tab:" + tb, tb]; }));
      fw.innerHTML = chips.map(function (c) { return '<button type="button" class="kanban-filter-chip' + (ORCH_COV_FILTER === c[0] ? " on" : "") + '" data-orch-cov="' + orEsc(c[0]) + '">' + orEsc(c[1]) + "</button>"; }).join("");
    }
    var shown = scored.filter(function (x) {
      if (ORCH_COV_FILTER === "gaps") return x.gap;
      if (ORCH_COV_FILTER === "auto") return x.r.kind === "cloud" || x.r.kind === "mac" || x.r.kind === "ci" || x.r.kind === "deck";
      if (ORCH_COV_FILTER.indexOf("tab:") === 0) return (x.r.tab || "code only") === ORCH_COV_FILTER.slice(4);
      return true;
    });
    var order = { "no writer": 0, "never written": 1, "stale": 2, "no stamp": 3, "future stamp": 3, "retired": 4, "fresh": 5, "queue-driven": 6, "manual": 7, "never typed": 7, "derived": 8 };
    shown.sort(function (a, b) { return (order[a.status] - order[b.status]) || (String(a.r.tab).localeCompare(String(b.r.tab))) || String(a.r.doc).localeCompare(String(b.r.doc)); });
    rows.innerHTML = shown.slice(0, 300).map(function (x) {
      var r = x.r, cad = r.cadenceHours ? (r.cadenceHours >= 48 ? Math.round(r.cadenceHours / 24) + "d" : r.cadenceHours + "h") : "—";
      var last = x.t ? orStampText(new Date(x.t).toISOString()) : (x.raw ? String(x.raw).slice(0, 24) : "—");
      return "<tr><td><code>" + orEsc(r.doc) + "</code></td><td>" + orEsc(r.panel || r.tab || "code only") + "</td><td>" + orEsc((r.writer || "")) + (r.note ? '<div class="src-note">' + orEsc(r.note) + "</div>" : "") + "</td><td>" + orEsc(cad) +
        "</td><td>" + orEsc(r.owner || "—") + (r.pod && r.pod !== "—" ? '<div class="src-note">' + orEsc(r.pod) + "</div>" : "") + "</td><td>" + orEsc(last) + '</td><td><span class="badge ' + x.cls + '">' + orEsc(x.status) + "</span></td></tr>";
    }).join("") || '<tr><td colspan="7" class="src-note">Nothing in this view.</td></tr>';
    if (note) note.textContent = "Register generated " + orEsc(String(reg.generatedAt || "undated")) + " by " + String(reg.by || "bin/brain coverage") + " · statuses computed in this browser just now from each document's own stamp (fresh = within 1.5× its cadence) · " + shown.length + " of " + scored.length + " rows shown. A manual row is Steven's by design; a gap is a document an automation owns and did not deliver.";
  }
  function wireOrchCoverage() {
    var fw = $("orchCovFilter"); if (!fw) return;
    fw.addEventListener("click", function (e) { var b = e.target.closest("[data-orch-cov]"); if (!b) return; ORCH_COV_FILTER = b.getAttribute("data-orch-cov"); safeRun("renderOrchCoverage", renderOrchCoverage); });
  }
  safeRun("wireOrchCoverage", wireOrchCoverage);
'''
sub1(r'(\n  function renderOrchestration\(\) \{\n)', lambda m: js + m.group(1), "renderOrchestration anchor")
sub1(r'(  function renderOrchestration\(\) \{\n    safeRun\("renderOrchTiles", renderOrchTiles\);\n)', lambda m: m.group(1) + '    safeRun("renderOrchCoverage", renderOrchCoverage);\n', "renderOrchestration body")

open(deck, "w", encoding="utf-8").write(t)
print("applied", MARK)
