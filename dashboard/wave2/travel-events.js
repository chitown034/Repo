  /* ================= TRAVEL — WEEKLY EVENTS & NETWORKING =================
     SOURCES is embedded at build time from integrations/events/sources.json. Rows come from the eventsFeed document
     (the scout's EVENTS.json); with no document the table says so. Ticks are device-local and reset each Monday. */
  var EV_SOURCES = /*EV_SOURCES_JSON*/[];
  var EV_CITY_ORDER = ["Temecula", "Murrieta", "Menifee", "San Diego", "Orange County", "Riverside", "Los Angeles", "Online"];
  var EV_CITY_ICON = { "Temecula": "🍷", "Murrieta": "🐎", "Menifee": "🏘️", "San Diego": "🌊", "Orange County": "🏖️", "Riverside": "🍊", "Los Angeles": "🌴", "Online": "💻" };
  var EV_CITY = "all", EV_CAT = "all";
  function evMonday() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function evTicks() { var t = lsGet("eventsChecked", {}); if (!t || typeof t !== "object" || Array.isArray(t) || t.week !== evMonday()) t = { week: evMonday(), ids: {} }; if (!t.ids) t.ids = {}; return t; }
  function evSafeUrl(u) { return /^https:\/\//i.test(String(u || "")) ? String(u) : ""; }
  function evFeedRows() {
    var d = lsGet("eventsFeed", null); if (d && typeof d === "object" && !Array.isArray(d) && Object.prototype.hasOwnProperty.call(d, "v")) d = d.v;
    var rows = Array.isArray(d) ? d : (d && Array.isArray(d.events) ? d.events : (d && Array.isArray(d.rows) ? d.rows : []));
    return rows.filter(function (r) { return r && typeof r === "object"; });
  }
  function evChip(host, label, on, fn) { var b = document.createElement("button"); b.type = "button"; b.className = "tv-chip" + (on ? " on" : ""); b.textContent = label; b.addEventListener("click", fn); host.appendChild(b); }
  function renderTravelEvents() {
    var card = $("evCard"); if (!card) return;
    var cities = $("evCities"), cats = $("evCats"), rowsEl = $("evRows"), srcEl = $("evSources"); if (!cities || !cats || !rowsEl || !srcEl) return;
    cities.innerHTML = ""; cats.innerHTML = ""; rowsEl.innerHTML = ""; srcEl.innerHTML = "";
    evChip(cities, "All cities", EV_CITY === "all", function () { EV_CITY = "all"; renderTravelEvents(); });
    EV_CITY_ORDER.forEach(function (c) { if (EV_SOURCES.some(function (s) { return s.city === c; })) evChip(cities, (EV_CITY_ICON[c] || "") + " " + c, EV_CITY === c, function () { EV_CITY = c; renderTravelEvents(); }); });
    var catList = []; EV_SOURCES.forEach(function (s) { if (catList.indexOf(s.category) === -1) catList.push(s.category); });
    evChip(cats, "All types", EV_CAT === "all", function () { EV_CAT = "all"; renderTravelEvents(); });
    catList.sort().forEach(function (c) { evChip(cats, c.replace(/-/g, " "), EV_CAT === c, function () { EV_CAT = c; renderTravelEvents(); }); });
    var feed = evFeedRows().filter(function (r) { return (EV_CITY === "all" || r.city === EV_CITY) && (EV_CAT === "all" || r.category === EV_CAT); });
    var badge = $("evBadge"); if (badge) { badge.textContent = feed.length ? feed.length + " events this scan" : "sources only"; badge.className = "badge " + (feed.length ? "green" : "gray"); }
    if (!feed.length) {
      var tr = document.createElement("tr"), td = document.createElement("td"); td.colSpan = 4; td.style.color = "var(--text-dim)";
      td.textContent = "No scanned events on this dashboard yet. The weekly events scout (integrations/events/events_scout.py) writes them from the sources below; the first scan has to run on a machine with internet access. Until then use the source links.";
      tr.appendChild(td); rowsEl.appendChild(tr);
    } else feed.slice(0, 60).forEach(function (r) {
      var tr = document.createElement("tr");
      [r.day || r.date || "", r.name || "", [r.venue, r.city].filter(Boolean).join(" • ")].forEach(function (v) { var td = document.createElement("td"); td.textContent = String(v); tr.appendChild(td); });
      var tdl = document.createElement("td"), u = evSafeUrl(r.url); if (u) { var a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Open"; tdl.appendChild(a); }
      tr.appendChild(tdl); rowsEl.appendChild(tr);
    });
    var ticks = evTicks();
    EV_CITY_ORDER.forEach(function (c) {
      if (EV_CITY !== "all" && EV_CITY !== c) return;
      var list = EV_SOURCES.filter(function (s) { return s.city === c && (EV_CAT === "all" || s.category === EV_CAT); }); if (!list.length) return;
      var h = document.createElement("div"); h.className = "ev-city"; h.textContent = (EV_CITY_ICON[c] || "") + " " + c; srcEl.appendChild(h);
      list.forEach(function (s) {
        var row = document.createElement("label"); row.className = "ev-src" + (ticks.ids[s.id] ? " is-done" : "");
        var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!ticks.ids[s.id]; cb.setAttribute("aria-label", "Checked " + s.name + " this week");
        cb.addEventListener("change", function () { var t = evTicks(); t.ids[s.id] = cb.checked; lsSetLocal("eventsChecked", t); renderTravelEvents(); });
        row.appendChild(cb);
        var u = evSafeUrl(s.url), name;
        if (u) { name = document.createElement("a"); name.href = u; name.target = "_blank"; name.rel = "noopener noreferrer"; } else name = document.createElement("span");
        name.textContent = s.name; row.appendChild(name);
        var cat = document.createElement("span"); cat.className = "badge gray"; cat.textContent = String(s.category || "").replace(/-/g, " "); row.appendChild(cat);
        if (s.kind === "manual") { var m = document.createElement("span"); m.className = "badge gold"; m.textContent = "check by hand"; row.appendChild(m); }
        if (s.verify) { var v = document.createElement("span"); v.className = "badge amber"; v.textContent = "verify link"; v.title = "The scout is not sure this address is current"; row.appendChild(v); }
        srcEl.appendChild(row);
      });
    });
  }
