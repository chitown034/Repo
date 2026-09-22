
  /* ================= PANEL 39 — ORCHESTRATION & LOOP ENGINEERING =================
     Reads six documents and never invents a row. Every table has an honest empty state that
     names the task that was supposed to write it, because a blank table that looks tidy is the
     exact failure this panel exists to catch. Local escape helper so this block does not depend
     on the declaration order of chatEsc further up the file. */
  function orEsc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function orDoc(key) {
    var d = lsGet(key, null);
    if (d && typeof d === "object" && !Array.isArray(d) && Object.prototype.hasOwnProperty.call(d, "v")) return d.v;
    return d;
  }
  function orArr(v, prop) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object" && prop && Array.isArray(v[prop])) return v[prop];
    return [];
  }
  function orRow(r) { return (r && typeof r === "object" && !Array.isArray(r)) ? r : {}; }
  function orBadge(id, text, cls) { var e = $(id); if (e) { e.textContent = text; e.className = "badge " + cls; } }
  function orEmpty(cols, title, sub) {
    return '<tr><td colspan="' + cols + '" style="padding:14px 10px;color:var(--text-dim);">' +
      '<b>' + orEsc(title) + '</b><br><span class="src-note">' + orEsc(sub) + "</span></td></tr>";
  }
  function orPriCls(p) { p = String(p || "").toUpperCase(); return p === "P1" ? "red" : p === "P2" ? "amber" : "gray"; }
  function orResCls(r) {
    r = String(r || "").toLowerCase();
    if (r.indexOf("escalat") > -1) return "amber";
    if (r.indexOf("fixed") > -1 || r.indexOf("implemented") > -1 || r.indexOf("improved") > -1) return "green";
    return "gray";
  }
  function orTestCls(t) {
    t = String(t || "").toLowerCase();
    return t === "pass" ? "green" : t === "fail" ? "red" : "gray";
  }
  function orResultCls(r) {
    r = String(r || "").toLowerCase();
    return r === "pass" ? "green" : r === "fail" ? "red" : r === "degraded" ? "amber" : "gray";
  }

  /* ---- findings ---- */
  var ORCH_FIND_FILTER = "all";
  function orFindings() { return orArr(orDoc("auditFindings"), "findings").map(orRow); }
  function renderOrchFindings() {
    var body = $("orchFindRows"); if (!body) return;
    var all = orFindings();
    var doc = orDoc("auditFindings");
    if (!all.length) {
      orBadge("orchFindBadge", "No findings recorded", "gray");
      body.innerHTML = orEmpty(10, "No findings table on this dashboard yet",
        "The chief-automation-strategist agent writes the auditFindings document — from the automation-audit-weekly task on the Mac (Saturdays), or from a Claude Code session running /automation-audit. Until one runs, this is genuinely empty, not clean.");
      var fn0 = $("orchFindNote"); if (fn0) fn0.textContent = "";
      renderOrchRoadmap(); return;
    }
    var counts = { all: all.length, P1: 0, open: 0, escalated: 0, halt: 0 };
    all.forEach(function (f) {
      if (String(f.priority).toUpperCase() === "P1") counts.P1++;
      var res = String(f.resolution || "").toLowerCase();
      if (!res || res === "open") counts.open++;
      if (res.indexOf("escalat") > -1) counts.escalated++;
      if (f.halt === true) counts.halt++;
    });
    var chips = [["all", "All", counts.all], ["p1", "P1", counts.P1], ["open", "Open", counts.open],
      ["escalated", "Escalated", counts.escalated], ["halt", "Halted", counts.halt]];
    var fw = $("orchFindFilter");
    if (fw) {
      fw.innerHTML = chips.map(function (c) {
        return '<button type="button" class="kanban-filter-chip' + (ORCH_FIND_FILTER === c[0] ? " on" : "") +
          '" data-orch-find="' + c[0] + '">' + orEsc(c[1]) + '<span class="kfc-n">' + c[2] + "</span></button>";
      }).join("");
    }
    var rows = all.filter(function (f) {
      var res = String(f.resolution || "").toLowerCase();
      if (ORCH_FIND_FILTER === "p1") return String(f.priority).toUpperCase() === "P1";
      if (ORCH_FIND_FILTER === "open") return !res || res === "open";
      if (ORCH_FIND_FILTER === "escalated") return res.indexOf("escalat") > -1;
      if (ORCH_FIND_FILTER === "halt") return f.halt === true;
      return true;
    });
    var order = { P1: 0, P2: 1, P3: 2 };
    rows.sort(function (a, b) {
      var d1 = (order[String(a.priority).toUpperCase()] === undefined ? 3 : order[String(a.priority).toUpperCase()]);
      var d2 = (order[String(b.priority).toUpperCase()] === undefined ? 3 : order[String(b.priority).toUpperCase()]);
      if (d1 !== d2) return d1 - d2;
      return String(a.id || "").localeCompare(String(b.id || ""));
    });
    orBadge("orchFindBadge", counts.open ? counts.open + " open of " + counts.all : "All " + counts.all + " resolved",
      counts.halt ? "red" : counts.open ? "amber" : "green");
    body.innerHTML = rows.length ? rows.map(function (f) {
      return "<tr>" +
        '<td style="font-family:var(--font-mono);font-size:11.5px;white-space:nowrap;">' + orEsc(f.id) + (f.halt === true ? ' <span class="badge red">halt</span>' : "") + "</td>" +
        "<td>" + orEsc(f.category) + "</td>" +
        "<td>" + orEsc(f.description) + (f.panel ? ' <a href="#' + orEsc(f.panel) + '" class="src-note">' + orEsc(f.panel) + "</a>" : "") + "</td>" +
        '<td><span class="badge ' + orPriCls(f.priority) + '">' + orEsc(f.priority || "—") + "</span></td>" +
        "<td>" + orEsc(f.effort || "—") + "</td>" +
        "<td>" + orEsc(f.status || "—") + "</td>" +
        '<td><span class="badge ' + orResCls(f.resolution) + '">' + orEsc(f.resolution || "Open") + "</span></td>" +
        '<td><span class="badge ' + orTestCls(f.testResult) + '">' + orEsc(f.testResult || "Pending") + "</span></td>" +
        '<td style="font-family:var(--font-mono);font-size:11.5px;">' + orEsc(f.dateResolved || "—") + "</td>" +
        "<td>" + orEsc(f.owner || "—") + "</td></tr>";
    }).join("") : orEmpty(10, "Nothing matches that filter", "Clear the filter to see all " + counts.all + " findings.");
    var note = $("orchFindNote");
    if (note) {
      note.textContent = "Cycle " + (doc && doc.cycle ? doc.cycle : "—") + " · written " +
        ((doc && doc.syncedAt) ? doc.syncedAt : "date not recorded") +
        (counts.halt ? " · " + counts.halt + " item" + (counts.halt === 1 ? "" : "s") + " halted, waiting on your decision" : "");
    }
    renderOrchRoadmap();
  }

  /* ---- stress tests ---- */
  function renderOrchStress() {
    var body = $("orchStressRows"); if (!body) return;
    var doc = orDoc("stressTestReport");
    var rows = orArr(doc, "rows").map(orRow);
    if (!rows.length) {
      orBadge("orchStressBadge", "Never run", "red");
      body.innerHTML = orEmpty(8, "No stress test has been recorded against this ecosystem",
        "The Stress Test Engineer writes the stressTestReport document, from the automation-audit-weekly task or a /stress-test-sweep run. Until then nothing here has been proven to survive load, a malformed input, a dead connector or a restore.");
      var n0 = $("orchStressNote"); if (n0) n0.textContent = "";
      return;
    }
    var fail = 0, degraded = 0, open = 0;
    rows.forEach(function (r) {
      var res = String(r.result || "").toLowerCase();
      if (res === "fail") fail++;
      if (res === "degraded") degraded++;
      var st = String(r.status || "").toLowerCase();
      if (st && st !== "resolved") open++;
    });
    orBadge("orchStressBadge", fail ? fail + " failing" : degraded ? degraded + " degraded" : rows.length + " passing",
      fail ? "red" : degraded ? "amber" : "green");
    body.innerHTML = rows.map(function (r) {
      var st = String(r.status || "Open");
      var stCls = /resolved/i.test(st) ? "green" : /escalat/i.test(st) ? "amber" : /monitor/i.test(st) ? "gray" : "amber";
      return "<tr><td><b>" + orEsc(r.capability) + "</b></td><td>" + orEsc(r.testType) + "</td>" +
        '<td><span class="badge ' + orResultCls(r.result) + '">' + orEsc(r.result || "—") + "</span></td>" +
        "<td>" + orEsc(r.weakness || "—") + "</td><td>" + orEsc(r.engineer || "—") + "</td>" +
        "<td>" + orEsc(r.fixApplied || "—") + "</td>" +
        '<td><span class="badge ' + orResultCls(r.retest) + '">' + orEsc(r.retest || "Pending") + "</span></td>" +
        '<td><span class="badge ' + stCls + '">' + orEsc(st) + "</span></td></tr>";
    }).join("");
    var note = $("orchStressNote");
    if (note) {
      note.textContent = "Sweep " + ((doc && doc.syncedAt) ? doc.syncedAt : "date not recorded") +
        " · " + rows.length + " test" + (rows.length === 1 ? "" : "s") + " · " + open + " still open" +
        " · nothing is marked Resolved until it passes the same test that broke it.";
    }
  }

  /* ---- CPI log ---- */
  function renderOrchCpi() {
    var body = $("orchCpiRows"); if (!body) return;
    var rows = orArr(orDoc("cpiOpportunityLog")).map(orRow);
    if (!rows.length) {
      orBadge("orchCpiBadge", "Empty", "amber");
      body.innerHTML = orEmpty(8, "No improvement opportunities logged",
        "The cpi-daily-scan task on the Mac (nightly) writes the cpiOpportunityLog document. Its last recorded run failed, so an empty log here may mean the scanner is down rather than that the week was quiet — check Automation health on Ops Radar.");
      var n0 = $("orchCpiNote"); if (n0) n0.textContent = "";
      return;
    }
    var measured = 0, proposed = 0;
    rows.forEach(function (r) {
      if (r.measured) measured++;
      if (/propos/i.test(String(r.status || ""))) proposed++;
    });
    orBadge("orchCpiBadge", rows.length + " logged · " + measured + " measured", measured ? "green" : "amber");
    rows.slice().sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    body.innerHTML = rows.map(function (r) {
      var st = String(r.status || "Proposed");
      var cls = /implant|implemented|done/i.test(st) ? (r.measured ? "green" : "amber") : /declin|reject/i.test(st) ? "gray" : "amber";
      return '<tr><td style="font-family:var(--font-mono);font-size:11.5px;white-space:nowrap;">' + orEsc(r.id) + "</td>" +
        '<td style="font-family:var(--font-mono);font-size:11.5px;">' + orEsc(r.date) + "</td>" +
        "<td>" + orEsc(r.opportunity) + "</td>" +
        '<td style="font-size:12px;color:var(--text-dim);">' + orEsc(r.evidence || "—") + "</td>" +
        "<td>" + orEsc(r.expectedSaving || "not estimated") + "</td>" +
        "<td>" + orEsc(r.complexity || "—") + "</td>" +
        '<td><span class="badge ' + cls + '">' + orEsc(st) + "</span></td>" +
        "<td>" + (r.measured ? orEsc(r.measured) : '<span class="src-note">unproven</span>') + "</td></tr>";
    }).join("");
    var note = $("orchCpiNote");
    if (note) {
      note.textContent = rows.length + " opportunit" + (rows.length === 1 ? "y" : "ies") + " logged · " +
        proposed + " still only proposed · " + measured + " with a measured before-and-after. " +
        "An item with no measurement is unproven, however good it looked on paper.";
    }
  }

  /* ---- scale log ---- */
  function renderOrchScale() {
    var body = $("orchScaleRows"); if (!body) return;
    var rows = orArr(orDoc("scaleOpportunityLog")).map(orRow);
    if (!rows.length) {
      orBadge("orchScaleBadge", "Empty", "amber");
      body.innerHTML = orEmpty(7, "No scale opportunities logged",
        "The scale-growth-engine skill writes the scaleOpportunityLog document as part of the weekly loop. Nothing has written it yet, so this is a genuine gap rather than a quiet week.");
      var n0 = $("orchScaleNote"); if (n0) n0.textContent = "";
      return;
    }
    var byLens = { Automate: 0, Delegate: 0, Replicate: 0 };
    rows.forEach(function (r) { var l = String(r.lens || ""); if (byLens[l] !== undefined) byLens[l]++; });
    orBadge("orchScaleBadge", rows.length + " logged", "green");
    body.innerHTML = rows.map(function (r) {
      var lens = String(r.lens || "—");
      var lensCls = lens === "Automate" ? "green" : lens === "Delegate" ? "amber" : lens === "Replicate" ? "gold" : "gray";
      var noOwner = /delegate/i.test(lens) && !r.delegateTarget;
      return '<tr><td style="font-family:var(--font-mono);font-size:11.5px;white-space:nowrap;">' + orEsc(r.id) + "</td>" +
        '<td style="font-family:var(--font-mono);font-size:11.5px;">' + orEsc(r.date) + "</td>" +
        "<td>" + orEsc(r.opportunity) + "</td>" +
        '<td><span class="badge ' + lensCls + '">' + orEsc(lens) + "</span></td>" +
        "<td>" + (noOwner ? '<span class="badge red">no confirmed owner — halted</span>' : orEsc(r.delegateTarget || "—")) + "</td>" +
        "<td>" + orEsc(r.capacityImpact || "not measured") + "</td>" +
        "<td>" + orEsc(r.status || "Proposed") + "</td></tr>";
    }).join("");
    var note = $("orchScaleNote");
    if (note) {
      note.textContent = "Automate " + byLens.Automate + " · Delegate " + byLens.Delegate + " · Replicate " + byLens.Replicate +
        ". A delegation without a confirmed receiving owner is halted by rule, not merely flagged.";
    }
  }

  /* ---- trust levels ---- */
  function renderOrchTrust() {
    var body = $("orchTrustRows"); if (!body) return;
    var doc = orDoc("trustLevels");
    var rows = orArr(doc, "loops").map(orRow);
    if (!rows.length) {
      orBadge("orchTrustBadge", "Not recorded", "gray");
      body.innerHTML = orEmpty(5, "No loop has a recorded trust level yet",
        "The loop-engineering skill writes the trustLevels document each cycle. Treat every loop as L1, report only, until it appears here with a streak behind it.");
      var n0 = $("orchTrustNote"); if (n0) n0.textContent = "";
      return;
    }
    var l3 = 0, l2 = 0;
    rows.forEach(function (r) { var l = String(r.level || "").toUpperCase(); if (l.indexOf("L3") === 0) l3++; if (l.indexOf("L2") === 0) l2++; });
    orBadge("orchTrustBadge", rows.length + " loops · " + l2 + " at L2 · " + l3 + " at L3", l3 ? "green" : l2 ? "amber" : "gray");
    body.innerHTML = rows.map(function (r) {
      var lvl = String(r.level || "L1");
      var cls = lvl.indexOf("L3") === 0 ? "green" : lvl.indexOf("L2") === 0 ? "amber" : "gray";
      return "<tr><td><b>" + orEsc(r.name) + "</b>" + (r.note ? '<br><span class="src-note">' + orEsc(r.note) + "</span>" : "") + "</td>" +
        '<td><span class="badge ' + cls + '">' + orEsc(lvl) + "</span></td>" +
        '<td class="num">' + orEsc(r.streak === undefined || r.streak === null ? "—" : r.streak) + "</td>" +
        "<td>" + orEsc(r.gate || "one full week of correct runs") + "</td>" +
        "<td>" + orEsc(r.owner || "—") + "</td></tr>";
    }).join("");
    var note = $("orchTrustNote");
    if (note) note.textContent = "Recorded " + ((doc && doc.syncedAt) ? doc.syncedAt : "date not recorded") + " · promotion is earned by a streak, never granted by a good week.";
  }

  /* ---- weekly brief ---- */
  function renderOrchBrief() {
    var host = $("orchBriefBody"); if (!host) return;
    var b = orDoc("weeklyBrief");
    if (!b || typeof b !== "object") {
      orBadge("orchBriefBadge", "No brief yet", "amber");
      host.innerHTML = '<div class="p9-empty" style="padding:14px 4px;color:var(--text-dim);"><b>No weekly brief has been written.</b><br>' +
        '<span class="src-note">The Weekly Loop Engineering and Self-Test routine produces it every Saturday and pushes it to your phone; the Mac\'s loop-engineering-weekly task writes it into the weeklyBrief document. Neither has recorded a completed run yet.</span></div>';
      var n0 = $("orchBriefNote"); if (n0) n0.textContent = "";
      return;
    }
    var sections = [
      ["Chief AI Officer — outside the walls", "caio", "Nadia"],
      ["CTO Innovator — feasibility and internal build", "ctoInnovator", "Elon"],
      ["Continuous process improvement", "cpi", "Vanessa coordinates"],
      ["Scale and growth", "scale", "Vanessa coordinates"],
      ["AI Agent Engineering Team", "engineering", "Elon's bench"],
      ["Backup and restore", "backup", "Derek"]
    ];
    var html = "";
    sections.forEach(function (s) {
      var v = b[s[1]];
      var content;
      if (Array.isArray(v) && v.length) content = "<ul class='simple-list'>" + v.map(function (x) {
        return "<li>" + orEsc(typeof x === "string" ? x : (x && (x.title || x.text || JSON.stringify(x)))) + "</li>";
      }).join("") + "</ul>";
      else if (typeof v === "string" && v) content = "<p style='margin:4px 0 0;'>" + orEsc(v) + "</p>";
      else if (v && typeof v === "object" && Object.keys(v).length) content = "<ul class='simple-list'>" + Object.keys(v).map(function (k) {
        return "<li><b>" + orEsc(k) + ":</b> " + orEsc(typeof v[k] === "object" ? JSON.stringify(v[k]) : v[k]) + "</li>";
      }).join("") + "</ul>";
      else content = '<p class="src-note" style="margin:4px 0 0;">Nothing recorded for this section this cycle — that is this owner\'s gap, not a quiet week.</p>';
      html += '<div class="hc-box" style="margin-bottom:10px;"><h5>' + orEsc(s[0]) + " · " + orEsc(s[2]) + "</h5>" + content + "</div>";
    });
    var halted = orArr(b.halted);
    if (halted.length) {
      html += '<div class="hc-flag"><b>Halted, waiting on you</b><ul class="simple-list">' + halted.map(function (h) {
        return "<li>" + orEsc(typeof h === "string" ? h : (h && (h.title || h.reason || JSON.stringify(h)))) + "</li>";
      }).join("") + "</ul></div>";
    }
    host.innerHTML = html;
    orBadge("orchBriefBadge", "Cycle " + (b.cycle || "—") + (halted.length ? " · " + halted.length + " halted" : ""), halted.length ? "amber" : "green");
    var note = $("orchBriefNote");
    if (note) note.textContent = "Week ending " + orEsc(b.weekEnding || "—") + " · written " + orEsc(b.ranAt || "date not recorded") + ".";
  }

  /* ---- roadmap, derived from the findings so it can never disagree with them ---- */
  function renderOrchRoadmap() {
    var host = $("orchRoadmap"); if (!host) return;
    var all = orFindings().filter(function (f) {
      var res = String(f.resolution || "").toLowerCase();
      return !res || res === "open" || res.indexOf("escalat") > -1;
    });
    if (!all.length) {
      host.innerHTML = '<div class="hc-box" style="grid-column:1/-1;"><h5>Nothing outstanding</h5>' +
        '<p class="src-note" style="margin:0;">Every recorded finding is resolved, or no findings table exists yet. The roadmap fills itself from the open rows above.</p></div>';
      orBadge("orchRoadBadge", "—", "gray");
      var n0 = $("orchRoadNote"); if (n0) n0.textContent = "";
      return;
    }
    var buckets = { quick: [], mid: [], long: [] };
    all.forEach(function (f) {
      var eff = String(f.effort || "M").toUpperCase();
      var pri = String(f.priority || "P3").toUpperCase();
      if (eff === "S" && (pri === "P1" || pri === "P2")) buckets.quick.push(f);
      else if (eff === "L" || f.halt === true) buckets.long.push(f);
      else buckets.mid.push(f);
    });
    var defs = [["Quick wins", "quick", "Small effort, real priority — do these first"],
      ["Mid-term", "mid", "Worth doing properly, not today"],
      ["Long-term", "long", "Large effort, or blocked on somebody else"]];
    host.innerHTML = defs.map(function (d) {
      var items = buckets[d[1]];
      return '<div class="hc-box"><h5>' + orEsc(d[0]) + " · " + items.length + "</h5>" +
        '<p class="src-note" style="margin:0 0 6px;">' + orEsc(d[2]) + "</p>" +
        (items.length ? "<ul class='simple-list'>" + items.slice(0, 12).map(function (f) {
          return '<li><span class="badge ' + orPriCls(f.priority) + '">' + orEsc(f.priority || "—") + "</span> " +
            orEsc(f.description || f.id) + (f.owner ? ' <span class="src-note">' + orEsc(f.owner) + "</span>" : "") + "</li>";
        }).join("") + "</ul>" + (items.length > 12 ? '<p class="src-note">and ' + (items.length - 12) + " more in the table above.</p>" : "")
          : '<p class="src-note" style="margin:0;">Nothing in this bucket.</p>') + "</div>";
    }).join("");
    orBadge("orchRoadBadge", all.length + " open", buckets.quick.length ? "amber" : "gray");
    var note = $("orchRoadNote");
    if (note) note.textContent = "Derived from the open rows of the findings table, so the roadmap and the table can never drift apart.";
  }

  /* ---- headline tiles ---- */
  function renderOrchTiles() {
    var host = $("orchTiles"); if (!host) return;
    var finds = orFindings();
    var fDoc = orDoc("auditFindings");
    var stress = orArr(orDoc("stressTestReport"), "rows").map(orRow);
    var trust = orArr(orDoc("trustLevels"), "loops").map(orRow);
    var backup = orDoc("backupStatus") || {};
    var open = finds.filter(function (f) { var r = String(f.resolution || "").toLowerCase(); return !r || r === "open"; }).length;
    var resolved = finds.length - open;
    var failing = stress.filter(function (r) { return String(r.result || "").toLowerCase() === "fail"; }).length;
    var l3 = trust.filter(function (r) { return String(r.level || "").toUpperCase().indexOf("L3") === 0; }).length;
    var bAge = null;
    try { bAge = execDaysOld(backup.lastBackup || backup.syncedAt); } catch (e) { bAge = null; }
    var tiles = [
      [finds.length ? resolved + "/" + finds.length : "—", "Findings resolved"],
      [finds.length ? String(open) : "—", "Findings open"],
      [stress.length ? (stress.length - failing) + "/" + stress.length : "—", "Stress tests passing"],
      [trust.length ? l3 + "/" + trust.length : "—", "Loops at L3"],
      [bAge === null ? "never" : bAge === 0 ? "today" : bAge + "d", "Last verified backup"]
    ];
    host.innerHTML = tiles.map(function (t) {
      return '<div class="tk-tile"><b>' + orEsc(t[0]) + "</b><span>" + orEsc(t[1]) + "</span></div>";
    }).join("");
    var haltCount = finds.filter(function (f) { return f.halt === true; }).length;
    orBadge("orchCycleBadge",
      fDoc && fDoc.cycle ? "Cycle " + fDoc.cycle : finds.length ? "Findings on record" : "No cycle recorded",
      haltCount ? "red" : finds.length ? "green" : "gray");
    var note = $("orchCycleNote");
    if (note) {
      var bits = [];
      bits.push(finds.length ? finds.length + " findings from " + ((fDoc && fDoc.syncedAt) ? fDoc.syncedAt : "an undated run") : "no findings table yet");
      bits.push(stress.length ? stress.length + " stress tests" : "no stress sweep recorded");
      bits.push(bAge === null ? "no verified backup on record" : "backup " + (bAge === 0 ? "today" : bAge + " days old"));
      if (haltCount) bits.push(haltCount + " item" + (haltCount === 1 ? "" : "s") + " halted for your decision");
      note.textContent = bits.join(" · ") + ".";
    }
  }

  /* ---- templates ---- */
  var ORCH_TEMPLATES = {
    loop: ["Weekly loop report", "Run the weekly loop for Steven's Command Deck (artifact 1624daae-d683-405a-971d-c5828dce0f8d).\n" +
      "For every agent, skill, routine and connector: state the GOAL, run the LOOP (propose, test, compare against the current version, promote or reject, log), and name the ROUTINE that carries it (schedule and trigger). Keep an untouched holdout set aside and use it only for final validation.\n" +
      "Score every scheduled item on OUTPUT — did the document it owns actually get fresher — never on whether the task fired.\n" +
      "Then write the loopLog document with: cycle number, proposed, tested, promoted, rejected, healed, halted, agents used, findings, trustLevels, needsSteven, and a one-paragraph report.\n" +
      "Halt and produce a decision packet instead of acting for: anything irreversible, anything outside the task's scope, any loop with no checkable success condition, any replace-or-rebuild recommendation that has not cleared L1 to L2 to L3, any change measuring negative, any delegation with no confirmed receiving owner, and any capability that failed the same stress test twice."],
    brief: ["Weekly brief", "Write this week's Command Deck brief into the weeklyBrief document (artifact 1624daae-d683-405a-971d-c5828dce0f8d, collection state).\n" +
      "Shape: {cycle, weekEnding, ranAt, caio:[], ctoInnovator:[], cpi:{new, implemented, measuredImpact, cumulativeSaved}, scale:{findings, capacityImpact, roadmap}, engineering:{stressResults, weaknesses, fixes, retests}, backup:{lastBackup, verified, restoreTest}, halted:[], trust:[]}.\n" +
      "CAIO section: external findings and the recommended action. CTO Innovator: feasibility verdicts, internal proposals, sandbox status. CPI: new opportunities, what was implemented, measured impact, cumulative saving. Scale: automate, delegate and replicate findings with capacity impact and the updated growth roadmap. Engineering: this week's stress results, weaknesses found, fixes applied, re-test outcomes. Backup: confirmation of this week's backup and the last restore test.\n" +
      "A section with nothing in it says so plainly and names whose gap it is. Never pad a section."],
    backup: ["Backup confirmation", "Run the weekly ecosystem backup for Steven.\n" +
      "Scope: both dashboard stores (Command Deck 1624daae-d683-405a-971d-c5828dce0f8d and ISA Portal 4348b34d-afa0-4d2e-8214-29b1319cf041), the Claude Desktop configuration with every secret redacted (settings, installed skills and extensions, memory and context files, connector and MCP configuration), plus the current Master Findings Table and the latest weekly report.\n" +
      "Destination: ~/Documents/AI-Ecosystem-Backups/YYYY-MM-DD. Keep the last 8 weekly folders and prune older ones.\n" +
      "Verify after writing: every file non-empty, readable, and in the expected structure; run a restore test against the newest folder. Log the run — timestamp, size, contents summary, verification result — into the backupStatus document. Retry once on failure; if it fails twice, stop and raise it to Steven rather than writing a green status."],
    stress: ["Stress test report", "Run the stress sweep against every capability on Steven's Command Deck and write the stressTestReport document.\n" +
      "Volume: push each skill, routine and agent well past a normal day's load and find the breaking point. Edge cases: malformed input, missing permissions, conflicting instructions, simultaneous requests to the same agent. Failure injection: disable a connector, plugin or dependency mid-task and confirm it fails loudly and recovers, with no silent data loss. Concurrency: fire several agents at once with overlapping sub-tasks and check Vanessa's parallel delegation still holds. Backup and recovery: restore from last week's backup and prove it is usable, not merely saved.\n" +
      "Route every weakness to its owner — reliability for crashes, efficiency for speed and cost once stable, capability for an unmet need rather than a bug, integration for anything that failed under load.\n" +
      "Rows: {capability, testType, result, weakness, engineer, fixApplied, retest, status}. Nothing is marked Resolved until it passes the same test that originally broke it."]
  };
  function wireOrchTemplates() {
    var row = $("orchTemplateBtns"), out = $("orchTemplateOut");
    if (!row || !out) return;
    row.innerHTML = Object.keys(ORCH_TEMPLATES).map(function (k) {
      return '<button type="button" data-orch-tpl="' + k + '">' + orEsc(ORCH_TEMPLATES[k][0]) + "</button>";
    }).join("") + '<button type="button" class="ghost" id="orchTplCopy">⧉ Copy shown template</button>';
    row.addEventListener("click", function (e) {
      var b = e.target.closest("[data-orch-tpl]");
      if (b) {
        var k = b.getAttribute("data-orch-tpl");
        if (ORCH_TEMPLATES[k]) { out.textContent = ORCH_TEMPLATES[k][1]; out.setAttribute("data-current", k); }
        return;
      }
      if (e.target.id === "orchTplCopy") {
        var text = out.textContent || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { e.target.textContent = "✓ Copied"; setTimeout(function () { e.target.textContent = "⧉ Copy shown template"; }, 1600); },
            function () { e.target.textContent = "✗ Clipboard blocked"; setTimeout(function () { e.target.textContent = "⧉ Copy shown template"; }, 1600); });
        }
      }
    });
  }
  function wireOrchFilter() {
    var fw = $("orchFindFilter"); if (!fw) return;
    fw.addEventListener("click", function (e) {
      var b = e.target.closest("[data-orch-find]");
      if (!b) return;
      ORCH_FIND_FILTER = b.getAttribute("data-orch-find");
      safeRun("renderOrchFindings", renderOrchFindings);
    });
  }
  function renderOrchestration() {
    safeRun("renderOrchTiles", renderOrchTiles);
    safeRun("renderOrchFindings", renderOrchFindings);
    safeRun("renderOrchStress", renderOrchStress);
    safeRun("renderOrchCpi", renderOrchCpi);
    safeRun("renderOrchScale", renderOrchScale);
    safeRun("renderOrchTrust", renderOrchTrust);
    safeRun("renderOrchBrief", renderOrchBrief);
  }
  safeRun("wireOrchTemplates", wireOrchTemplates);
  safeRun("wireOrchFilter", wireOrchFilter);
  safeRun("renderOrchestration", renderOrchestration);
  window.cdRenderOrchestration = function () { safeRun("renderOrchestration", renderOrchestration); };
