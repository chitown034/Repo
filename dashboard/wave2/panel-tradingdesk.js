  /* ================= PANEL 41 — TRADING RESEARCH DESK =================
     Reads one document, tradingDeskReport, and never invents a number: no document means every tile says "no runs yet".
     The replay is an illustration with a fixed fake idea and is labelled as such. All text goes through textContent. */
  var TD_NODES = [
    { id: "idea", x: 20, y: 90, label: "Idea Agent", sub: "one testable idea", color: "accent",
      prompt: "You are the Strategy Idea Agent on an AI trading research desk.\n\nGenerate ONE simple, testable strategy at a time.\n\nReturn:\nNAME:\nMARKET:\nTIMEFRAME:\nENTRY RULES:\nEXIT RULES:\nSTOP RULE:\nWHY IT MIGHT WORK:\nWHAT WOULD PROVE IT WRONG:\nDATA REQUIRED:\n\nAvoid vague ideas. Do not optimize parameters yet. This is research only." },
    { id: "builder", x: 190, y: 90, label: "Builder", sub: "rules to code", color: "accent",
      prompt: "You are the Builder Agent.\n\nConvert the approved trading hypothesis into clean Python code for backtesting.\n\nRequirements:\n- separate signal logic from data loading\n- no future-data leakage\n- configurable fees and slippage\n- clear stop/exit rules\n- export every trade to CSV\n- add comments explaining each rule\n- no live execution" },
    { id: "backtest", x: 360, y: 90, label: "Backtester", sub: "history + out-of-sample", color: "accent",
      prompt: "You are the Backtester.\n\nEvaluate the strategy on historical data.\n\nReport:\nTOTAL TRADES:\nWIN RATE:\nAVERAGE WIN:\nAVERAGE LOSS:\nPROFIT FACTOR:\nSHARPE:\nMAX DRAWDOWN:\nTOTAL RETURN:\nRESULT AFTER FEES/SLIPPAGE:\nOUT-OF-SAMPLE RESULT:\nPASS / FAIL:\n\nFlag overfitting, tiny samples, or suspiciously perfect results." },
    { id: "gate", x: 530, y: 90, label: "Gate", sub: "fixed pass rules", color: "gold",
      prompt: "Fixed rules, set before any test and hashed into every result:\n- at least 30 in-sample and 10 out-of-sample trades\n- profitable after fees and slippage in BOTH samples\n- out-of-sample profit factor 1.2 or better\n- max drawdown 25% or less\n- out-of-sample Sharpe 0.5 or better\n- flags: suspiciously perfect, overfit, tiny sample\nA fail is recorded, never deleted." },
    { id: "paper", x: 700, y: 90, label: "Paper Trader", sub: "simulation only", color: "positive",
      prompt: "You are the Paper Trader.\n\nOnly simulate strategies that passed the Backtester.\n\nRules:\n- one open paper position at a time per strategy\n- max 1% paper-account risk per trade\n- no leverage\n- log entry, exit, stop, target, fees, slippage, and P&L\n- never place a live order\n\nIf required data is missing, output TRADE BLOCKED." },
    { id: "memory", x: 360, y: 215, label: "Memory Agent", sub: "keeps every failure", color: "negative",
      prompt: "You are the Memory Agent.\n\nStore every tested strategy, including failures.\n\nFor each strategy save:\nNAME:\nHYPOTHESIS:\nMARKET CONDITIONS:\nPARAMETERS:\nBACKTEST RESULT:\nOUT-OF-SAMPLE RESULT:\nPAPER RESULT:\nWHY IT FAILED OR WORKED:\nWHAT NOT TO REPEAT:\nNEXT RESEARCH IDEA:\n\nBefore any new strategy is tested, compare it against this memory and flag duplicates or previously failed ideas." },
    { id: "risk", x: 530, y: 215, label: "Risk Manager", sub: "can veto, never trades", color: "negative",
      prompt: "Extra seat (proposal-only): vetoes any strategy that breaks drawdown, exposure or correlation limits, and any paper position that would exceed 1% account risk. It cannot place or change an order." },
    { id: "regime", x: 700, y: 215, label: "Regime Analyst", sub: "trend / range / high-vol", color: "gold",
      prompt: "Extra seat (proposal-only): tags the market regime in every test window (trend, range, high-volatility) and says which strategies are allowed in which regime, so one lucky regime is not mistaken for an edge." }
  ];
  var TD_PATH = ["idea", "builder", "backtest", "gate", "paper", "memory", "idea"];
  var TD_RULES = ["Paper mode only — no live permissions, ever", "No strategy moves forward without out-of-sample testing", "Fees and slippage are always included", "Tiny samples are rejected", "Max drawdown is tracked, not just profit", "Failed strategies are never deleted", "No agent rewrites the rules after seeing results"];
  var TD_PLUS = ["Walk-forward windows, not one lucky split", "Monte Carlo drawdown: the 95th-percentile bad luck, not the average", "Parameter sensitivity: edge must survive ±20% on the settings", "Regime tags on every window", "Duplicate-idea and repeated-failure blocking from memory", "Risk veto before any paper trade", "Backtest-vs-paper gap tracked as the honesty metric"];
  var TD_MISTAKES = ["Optimizing until the backtest looks perfect", "Using the same data to invent and validate", "Ignoring transaction costs", "Judging on too few trades", "Letting the AI invent market data", "Only saving winners"];
  var TD_TILES = [["strategies_tested", "Strategies tested"], ["rejected_before_paper", "Rejected before paper"], ["oos_performance", "Out-of-sample result"], ["max_drawdown", "Max drawdown"], ["after_costs", "After fees + slippage"], ["duplicates_prevented", "Duplicates blocked"], ["backtest_vs_paper_gap", "Backtest vs paper gap"]];
  var TD_SELECTED = "idea", TD_TIMER = null;
  function tdNode(id) { for (var i = 0; i < TD_NODES.length; i++) if (TD_NODES[i].id === id) return TD_NODES[i]; return TD_NODES[0]; }
  function tdSvg(tag, attrs) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
  function tdCenter(n) { return { x: n.x + 70, y: n.y + 34 }; }
  function renderTradingDesk() {
    var nodes = $("tdNodes"), edges = $("tdEdges"); if (!nodes || !edges || typeof document.createElementNS !== "function") return;
    nodes.innerHTML = ""; edges.innerHTML = "";
    for (var i = 0; i < TD_PATH.length - 1; i++) {
      var a = tdCenter(tdNode(TD_PATH[i])), b = tdCenter(tdNode(TD_PATH[i + 1]));
      var dx = b.x - a.x, dy = b.y - a.y, k = Math.min(Math.abs(dx) > 0 ? 70 / Math.abs(dx) : 9, Math.abs(dy) > 0 ? 34 / Math.abs(dy) : 9);
      var s = { x: a.x + dx * k, y: a.y + dy * k }, e = { x: b.x - dx * k, y: b.y - dy * k };   /* clip each end to the node edge so arrowheads show */
      edges.appendChild(tdSvg("path", { d: "M" + s.x.toFixed(1) + " " + s.y.toFixed(1) + " L" + e.x.toFixed(1) + " " + e.y.toFixed(1), "class": "td-edge", "marker-end": "url(#tdArrow)" }));
    }
    TD_NODES.forEach(function (n) {
      var g = tdSvg("g", { "class": "td-node td-" + n.color + (n.id === TD_SELECTED ? " is-on" : ""), tabindex: "0", role: "button", "data-id": n.id, "aria-label": n.label + ": " + n.sub });
      g.appendChild(tdSvg("rect", { x: n.x, y: n.y, width: 140, height: 68, rx: 14 }));
      var t1 = tdSvg("text", { x: n.x + 70, y: n.y + 30, "text-anchor": "middle", "class": "td-t1" }); t1.textContent = n.label; g.appendChild(t1);
      var t2 = tdSvg("text", { x: n.x + 70, y: n.y + 50, "text-anchor": "middle", "class": "td-t2" }); t2.textContent = n.sub; g.appendChild(t2);
      function pick() { tdSelect(n.id); }
      g.addEventListener("click", pick); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      nodes.appendChild(g);
    });
    var tok = $("tdToken"); if (tok) { var c = tdCenter(tdNode(TD_SELECTED)); tok.setAttribute("cx", c.x); tok.setAttribute("cy", c.y); }
    tdDetail(); tdTiles();
    var rl = $("tdRules"); if (rl && !rl.children.length) TD_RULES.forEach(function (r) { var li = document.createElement("li"); li.textContent = r; rl.appendChild(li); });
    var pl = $("tdPlus"); if (pl && !pl.children.length) TD_PLUS.forEach(function (r) { var li = document.createElement("li"); li.textContent = r; pl.appendChild(li); });
    var mk = $("tdMistakes"); if (mk && !mk.children.length) TD_MISTAKES.forEach(function (r) { var s = document.createElement("span"); s.className = "tv-chip"; s.textContent = r; mk.appendChild(s); });
    var rb = $("tdReplay"); if (rb && !rb.getAttribute("data-bound")) { rb.setAttribute("data-bound", "1"); rb.addEventListener("click", tdReplay); }
  }
  function tdSelect(id) {
    TD_SELECTED = id;
    var els = document.querySelectorAll("#tdNodes .td-node");
    Array.prototype.forEach.call(els, function (g) { var on = g.getAttribute("data-id") === id; g.setAttribute("class", g.getAttribute("class").replace(/ is-on/g, "") + (on ? " is-on" : "")); });
    var tok = $("tdToken"); if (tok) { var c = tdCenter(tdNode(id)); tok.setAttribute("cx", c.x); tok.setAttribute("cy", c.y); }
    tdDetail();
  }
  function tdDetail() {
    var box = $("tdDetail"); if (!box) return; var n = tdNode(TD_SELECTED); box.innerHTML = "";
    var h = document.createElement("div"); h.className = "td-dh"; h.textContent = n.label + " — " + n.sub; box.appendChild(h);
    var pre = document.createElement("pre"); pre.className = "tk-out"; pre.textContent = n.prompt; box.appendChild(pre);
    var b = document.createElement("button"); b.type = "button"; b.textContent = "Copy this prompt";
    b.addEventListener("click", function () { var o = b.textContent; try { navigator.clipboard.writeText(n.prompt); b.textContent = "Copied"; } catch (e) { b.textContent = "Select + copy"; } setTimeout(function () { b.textContent = o; }, 1400); });
    box.appendChild(b);
  }
  function tdReplay() {
    if (TD_TIMER) { clearTimeout(TD_TIMER); TD_TIMER = null; }
    var i = 0, box = $("tdDetail");
    var story = ["Idea: “Buy a 20-day breakout, exit on a 10-day low” (an illustration, not a real strategy result).", "Builder turns the rules into code with fees and slippage switched on.", "Backtester runs history, then data it has never seen.", "Gate applies the fixed rules. In this illustration the out-of-sample result is too weak: FAIL.", "Paper Trader is skipped — only passes get simulated. TRADE BLOCKED.", "Memory stores the failure and WHAT NOT TO REPEAT.", "The next idea must reference what already failed."];
    function step() {
      tdSelect(TD_PATH[i]);
      if (box) { var s = document.createElement("div"); s.className = "td-story"; s.textContent = "ILLUSTRATION • " + story[i]; box.appendChild(s); }
      i++; if (i < TD_PATH.length) TD_TIMER = setTimeout(step, 1300); else TD_TIMER = null;
    }
    step();
  }
  function tdTiles() {
    var wrap = $("tdTiles"); if (!wrap) return; wrap.innerHTML = "";
    var d = lsGet("tradingDeskReport", null); if (d && typeof d === "object" && !Array.isArray(d) && Object.prototype.hasOwnProperty.call(d, "v")) d = d.v;
    var ok = d && typeof d === "object" && !Array.isArray(d) && Object.keys(d).length > 0;
    var badge = $("tdBadge"); if (badge) { badge.textContent = ok ? "report loaded" : "no runs yet"; badge.className = "badge " + (ok ? "green" : "gray"); }
    TD_TILES.forEach(function (t) {
      var tile = document.createElement("div"); tile.className = "tk-tile";
      var b = document.createElement("b"); var v = ok ? d[t[0]] : null; b.textContent = (v === null || v === undefined || typeof v === "object") ? "—" : String(v);
      var s = document.createElement("span"); s.textContent = t[1]; tile.appendChild(b); tile.appendChild(s); wrap.appendChild(tile);
    });
    var sub = $("tdSub"); if (sub && !ok) sub.textContent = "No desk report on this dashboard yet. Run the desk on Steven’s own historical data (integrations/trading-desk/README.md) and the report fills these tiles. Nothing here is a placeholder number.";
  }
