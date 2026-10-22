  /* ================= WAVE 2 POLISH — reveal, count-up, reading progress =================
     Guarded end to end: no IntersectionObserver, no requestAnimationFrame, reduced motion or a pure-Node DOM shim
     all leave the page exactly as it was. Nothing here touches data or any existing render function. */
  (function w2Polish() {
    try {
      if (typeof document === "undefined" || !document.documentElement || typeof window === "undefined") return;
      var reduce = false;
      try { reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e0) {}
      if (reduce || typeof IntersectionObserver === "undefined") return;
      var SEL = ".card, .stat, .kanban-col, .tk-tile";
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.className += " w2-in";
          io.unobserve(en.target);
          w2Count(en.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
      /* Above-the-fold items are marked visible BEFORE the hide rule exists, so nothing flickers and a page thumbnail
         or a print never catches a faded card; only items below the fold wait for the scroll reveal. */
      function w2Observe(root, initial) {
        var els = []; if (!root || !root.querySelectorAll) return;
        if (root.matches && root.matches(SEL)) els.push(root);
        Array.prototype.forEach.call(root.querySelectorAll(SEL), function (el) { els.push(el); });
        var vh = window.innerHeight || 800;
        els.forEach(function (el) {
          if (el.className.indexOf("w2-seen") !== -1) return;
          el.className += " w2-seen";
          if (initial && el.getBoundingClientRect().top < vh * 1.05) { el.className += " w2-in"; return; }
          io.observe(el);
        });
      }
      w2Observe(document, true);
      document.documentElement.className += " w2-js";
      window.addEventListener("beforeprint", function () { Array.prototype.forEach.call(document.querySelectorAll(SEL), function (el) { if (el.className.indexOf("w2-in") === -1) el.className += " w2-in"; }); });
      /* count-up for plain numbers only; the real text is restored at the end */
      var NUM = /^(\$?)(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?(%?)$/;
      function w2Count(card) {
        if (!card.querySelectorAll) return;
        Array.prototype.forEach.call(card.querySelectorAll(".stat-value, .es-num, .tk-tile b"), function (n) {
          if (n.getAttribute("data-w2")) return;
          var txt = (n.textContent || "").trim(), m = NUM.exec(txt);
          if (!m || txt.length > 12) return;
          n.setAttribute("data-w2", "1");
          var target = parseFloat(txt.replace(/[$,%]/g, "")), dec = m[3] ? m[3].length - 1 : 0, t0 = null, dur = 700;
          if (!isFinite(target) || target === 0) return;
          function step(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3), v = target * e;
            if (p < 1 && n.textContent.trim() !== txt && n.getAttribute("data-w2") === "done") return;
            n.textContent = p >= 1 ? txt : m[1] + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + m[4];
            if (p < 1) requestAnimationFrame(step); else n.setAttribute("data-w2", "done");
          }
          if (typeof requestAnimationFrame === "function") requestAnimationFrame(step);
        });
      }
      /* New cards appear when pages switch or panels render later. Only the nodes that were ADDED are scanned (never the
         whole document), and a ticking clock or any text-only change is ignored, so a 4.6 MB deck pays almost nothing. */
      if (typeof MutationObserver !== "undefined") {
        var queue = [], pending = false;
        new MutationObserver(function (recs) {
          recs.forEach(function (r) { Array.prototype.forEach.call(r.addedNodes, function (n) { if (n.nodeType === 1 && queue.length < 300) queue.push(n); }); });
          if (pending || !queue.length) return; pending = true;
          setTimeout(function () { pending = false; var q = queue.splice(0, queue.length); q.forEach(function (n) { w2Observe(n, false); }); }, 150);
        }).observe(document.body, { childList: true, subtree: true });
      }
      var bar = document.createElement("div"); bar.id = "w2Progress"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var h = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.setProperty("--w2p", String(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0));
        });
      }, { passive: true });
    } catch (e) { try { console.warn("[w2Polish] skipped: " + (e && e.message)); } catch (e2) {} }
  })();
