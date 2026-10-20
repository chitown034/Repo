  /* ================= APPLE-V2 — segmented-control slide direction, class names only =================
     Marks <html class="av2-js"> and, when the active page tab changes, adds av2-from-left / av2-from-right
     to the new active tab so the CSS thumb slides in from the previous tab's side. Reduced motion, a DOM
     without MutationObserver/classList, or any thrown error leaves the page exactly as it was. */
  (function av2Tabs() {
    try {
      if (typeof document === "undefined" || !document.documentElement || typeof window === "undefined") return;
      var reduce = false;
      try { reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e0) {}
      if (reduce || typeof MutationObserver === "undefined" || !document.documentElement.classList) return;
      var wrap = document.getElementById("pageTabs"); if (!wrap) return;
      document.documentElement.className += " av2-js";
      function tabs() { return Array.prototype.slice.call(wrap.querySelectorAll(".page-tab")); }
      function activeIdx() { var t = tabs(); for (var i = 0; i < t.length; i++) { if (t[i].classList.contains("active")) return i; } return -1; }
      var lastIdx = activeIdx();
      var mo = new MutationObserver(function () {
        try {
          var idx = activeIdx(); if (idx === lastIdx) return;
          var t = tabs()[idx];
          if (t && lastIdx >= 0) {
            t.classList.remove("av2-from-left", "av2-from-right");
            void t.offsetWidth; /* restart the keyframe when the same tab is re-selected */
            t.classList.add(lastIdx < idx ? "av2-from-left" : "av2-from-right");
          }
          lastIdx = idx;
        } catch (e1) {}
      });
      mo.observe(wrap, { attributes: true, attributeFilter: ["class"], subtree: true, childList: true });
      document.addEventListener("animationend", function (ev) {
        try { var el = ev.target; if (el && el.classList && el.classList.contains("page-tab")) el.classList.remove("av2-from-left", "av2-from-right"); } catch (e2) {}
      }, true);
    } catch (e) {}
  })();
