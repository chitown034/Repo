  /* ================= PANEL 40 — COMPUTER HUB =================
     Device-local only: ticks and AnyDesk IDs are saved with lsSetLocal (this browser), never to the shared database.
     No password, key or pairing link is ever read, stored or rendered. Everything dynamic goes through textContent. */
  var CH_DEVICES = [
    { id: "mac1", name: "Mac 1", kind: "laptop", role: "Primary Mac — Vanessa Live, Claude Code, the runner",
      steps: [["claude", "Claude Remote Control on (claude remote-control, then rc-agent.sh install)", "claude remote-control"],
              ["orca", "Orca paired with the other computers (orca-remote.sh serve / pair)", "bash integrations/remote-control/orca-remote.sh serve"],
              ["any", "AnyDesk installed and its ID saved below", ""],
              ["local", "Brain, Laya and mods installed (mac-bootstrap.sh)", "./mac-bootstrap.sh --dry-run"]] },
    { id: "mac2", name: "Mac 2", kind: "laptop", role: "Second Mac — same brain, same controls",
      steps: [["claude", "Claude Remote Control on", "claude remote-control"],
              ["orca", "Orca paired both ways with Mac 1", "bash integrations/remote-control/orca-remote.sh pair"],
              ["any", "AnyDesk installed and its ID saved below", ""],
              ["local", "Brain synced (scripts/brain-sync.sh)", "bash scripts/brain-sync.sh"]] },
    { id: "alienware", name: "Alienware PC", kind: "tower", role: "Windows — local AI (Laya, Bonsai 27B), Orca, heavy jobs",
      steps: [["claude", "Claude Code installed and signed in", "claude"],
              ["orca", "Orca installed and paired (alienware-setup.ps1 -Action OrcaServe)", ".\\integrations\\alienware\\alienware-setup.ps1 -Action Doctor"],
              ["any", "AnyDesk installed and its ID saved below", ""],
              ["local", "Laya + Bonsai 2 27B running (alienware-setup.ps1 -Action Install)", ".\\integrations\\alienware\\alienware-setup.ps1 -Action Install -DryRun"]] },
    { id: "tablet", name: "Tablet", kind: "tablet", role: "iPad or Android tablet — control the others, watch the agents",
      steps: [["claude", "Claude app signed in; sessions list at claude.ai/code", ""],
              ["orca", "Orca app scanned the QR (serve --phone)", "bash integrations/remote-control/orca-remote.sh serve --phone"],
              ["any", "AnyDesk app installed; the other computers added by ID", ""]] },
    { id: "phone", name: "Phone", kind: "phone", role: "Quick control and alerts on the go",
      steps: [["claude", "Claude app signed in; sessions list visible", ""],
              ["orca", "Orca app scanned the QR", "bash integrations/remote-control/orca-remote.sh serve --phone"],
              ["any", "AnyDesk app installed", ""]] }
  ];
  var CH_ICON = {
    laptop: '<svg viewBox="0 0 64 44" aria-hidden="true"><rect x="10" y="4" width="44" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 38h56l-4 4H8z" fill="currentColor"/></svg>',
    tower: '<svg viewBox="0 0 64 44" aria-hidden="true"><rect x="22" y="3" width="20" height="38" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="12" r="2.6" fill="currentColor"/><path d="M27 24h10M27 29h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    tablet: '<svg viewBox="0 0 64 44" aria-hidden="true"><rect x="14" y="3" width="36" height="38" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="32" cy="36" r="1.8" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 64 44" aria-hidden="true"><rect x="22" y="2" width="20" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M29 7h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };
  var CH_ID_RE = /^(\d{9,10}|[a-z0-9][a-z0-9._-]{2,38}@ad)$/;
  var CH_SECRET_RE = /(api[_-]?key|secret|token|passw|pwd|pair(ing)?[_-]?(code|link)|https?:\/\/|orca:\/\/|sk-[a-z0-9])/i;
  var CH_STATUS_WORDS = { ok: 1, missing: 1, unverified: 1, "not-run": 1 };
  function chState() { var s = lsGet("computerHub", {}); return (s && typeof s === "object" && !Array.isArray(s)) ? s : {}; }
  function chSave(s) { lsSetLocal("computerHub", s); }
  function chDevState(s, id) { if (!s[id] || typeof s[id] !== "object") s[id] = { done: {}, anydesk: "", reported: {} }; if (!s[id].done) s[id].done = {}; if (!s[id].reported) s[id].reported = {}; return s[id]; }
  function chPct(dev, ds) { var n = 0; dev.steps.forEach(function (st) { if (ds.done[st[0]] || ds.reported[st[0]] === "ok") n++; }); return Math.round(100 * n / dev.steps.length); }
  function chCopy(text, btn) {
    var orig = btn.textContent;
    function done(m) { btn.textContent = m; setTimeout(function () { btn.textContent = orig; }, 1500); }
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done("Select + copy"); }); return; } } catch (e) {}
    done("Select + copy");
  }
  function renderComputerHub() {
    var grid = $("chGrid"); if (!grid) return;
    var st = chState(); grid.innerHTML = "";
    CH_DEVICES.forEach(function (dev) {
      var ds = chDevState(st, dev.id), pct = chPct(dev, ds);
      var card = document.createElement("div"); card.className = "card ch-card"; card.setAttribute("data-dev", dev.id);
      var head = document.createElement("div"); head.className = "ch-head";
      var ring = document.createElement("div"); ring.className = "ch-ring"; ring.style.setProperty("--p", pct); ring.setAttribute("role", "img"); ring.setAttribute("aria-label", pct + " percent set up");
      var ic = document.createElement("div"); ic.className = "ch-ic"; ic.innerHTML = CH_ICON[dev.kind] || ""; ring.appendChild(ic);
      var pc = document.createElement("span"); pc.className = "ch-pct"; pc.textContent = pct + "%"; ring.appendChild(pc);
      var tt = document.createElement("div"); var h = document.createElement("div"); h.className = "ch-name"; h.textContent = dev.name;
      var r = document.createElement("div"); r.className = "ch-role"; r.textContent = dev.role; tt.appendChild(h); tt.appendChild(r);
      head.appendChild(ring); head.appendChild(tt); card.appendChild(head);
      var list = document.createElement("div"); list.className = "ch-steps";
      dev.steps.forEach(function (stp) {
        var row = document.createElement("label"); row.className = "ch-step ch-" + stp[0] + (ds.done[stp[0]] || ds.reported[stp[0]] === "ok" ? " is-done" : "");
        var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!(ds.done[stp[0]] || ds.reported[stp[0]] === "ok");
        cb.addEventListener("change", function () { var s2 = chState(), d2 = chDevState(s2, dev.id); d2.done[stp[0]] = cb.checked; chSave(s2); renderComputerHub(); });
        var sp = document.createElement("span"); sp.textContent = stp[1];
        row.appendChild(cb); row.appendChild(sp);
        if (ds.reported[stp[0]]) { var bd = document.createElement("span"); bd.className = "badge " + (ds.reported[stp[0]] === "ok" ? "green" : "gray"); bd.textContent = ds.reported[stp[0]]; row.appendChild(bd); }
        list.appendChild(row);
        if (stp[2]) { var cp = document.createElement("button"); cp.type = "button"; cp.className = "ch-copy"; cp.textContent = "Copy command"; cp.addEventListener("click", function () { chCopy(stp[2], cp); }); list.appendChild(cp); }
      });
      card.appendChild(list);
      var act = document.createElement("div"); act.className = "ch-actions";
      var a1 = document.createElement("a"); a1.className = "ch-btn"; a1.href = "https://claude.ai/code"; a1.target = "_blank"; a1.rel = "noopener"; a1.textContent = "Open Claude sessions"; act.appendChild(a1);
      var idRow = document.createElement("div"); idRow.className = "ch-id";
      var inp = document.createElement("input"); inp.type = "text"; inp.placeholder = "AnyDesk ID (9–10 digits) — no password"; inp.value = ds.anydesk || ""; inp.setAttribute("aria-label", dev.name + " AnyDesk ID"); inp.autocomplete = "off"; inp.spellcheck = false;
      var sv = document.createElement("button"); sv.type = "button"; sv.textContent = "Save ID";
      var msg = document.createElement("span"); msg.className = "src-note"; msg.setAttribute("role", "status");
      sv.addEventListener("click", function () {
        var v = inp.value.replace(/\s+/g, "").toLowerCase();
        if (v && !CH_ID_RE.test(v)) { msg.textContent = "That is not an AnyDesk ID (9–10 digits, or name@ad). A password must never go here."; return; }
        var s2 = chState(), d2 = chDevState(s2, dev.id); d2.anydesk = v; if (v) d2.done.any = true; chSave(s2); renderComputerHub();
      });
      idRow.appendChild(inp); idRow.appendChild(sv); idRow.appendChild(msg);
      act.appendChild(idRow);
      if (ds.anydesk && CH_ID_RE.test(ds.anydesk)) {
        var a2 = document.createElement("a"); a2.className = "ch-btn ch-btn-go"; a2.href = "anydesk:" + ds.anydesk; a2.textContent = "Connect with AnyDesk";
        a2.title = "Opens the AnyDesk app on this device; AnyDesk asks for the password itself"; act.appendChild(a2);
      }
      card.appendChild(act); grid.appendChild(card);
    });
    var pn = $("chPasteBtn"); if (pn && !pn.getAttribute("data-bound")) { pn.setAttribute("data-bound", "1"); pn.addEventListener("click", chApplyPaste); }
  }
  function chApplyPaste() {
    var inp = $("chPaste"), note = $("chPasteNote"); if (!inp || !note) return;
    var raw = inp.value.trim(); if (!raw) { note.textContent = "Paste the one status line first."; return; }
    if (CH_SECRET_RE.test(raw)) { note.textContent = "Refused: this looks like it contains a key, password or link. Nothing was saved."; inp.value = ""; return; }
    var o; try { o = JSON.parse(raw); } catch (e) { note.textContent = "That is not a status line (it should be one JSON line)."; return; }
    if (!o || typeof o !== "object" || Array.isArray(o)) { note.textContent = "That is not a status line."; return; }
    var host = String(o.host || "").toLowerCase(), id = host.indexOf("alien") > -1 ? "alienware" : (host.indexOf("2") > -1 ? "mac2" : "mac1");
    if (typeof o.device === "string" && ["mac1", "mac2", "alienware", "tablet", "phone"].indexOf(o.device) > -1) id = o.device;
    var s = chState(), d = chDevState(s, id), n = 0;
    var map = { claude: ["claude", "remote_control", "rc"], orca: ["orca"], any: ["anydesk"], local: ["laya", "bonsai_server", "ollama"] };
    Object.keys(map).forEach(function (k) {
      var worst = ""; map[k].forEach(function (f) { var v = String(o[f] == null ? "" : o[f]).toLowerCase(); if (CH_STATUS_WORDS[v]) { if (!worst || v !== "ok") worst = v; } });
      if (worst) { d.reported[k] = worst; n++; }
    });
    chSave(s); inp.value = ""; note.textContent = n ? "Updated " + n + " item" + (n === 1 ? "" : "s") + " on " + id + "." : "No status words found in that line.";
    renderComputerHub();
  }
