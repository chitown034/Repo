#!/usr/bin/env node
"use strict";
/* ============================================================================
   harness-selftest.js — does the harness actually catch the bug it exists for?

     node harness-selftest.js [deck.html]

   A test tool nobody has tested is a comfort, not a gate. This proves three
   things about runtime-harness.js before anyone trusts its PASS:

     1. a clean deck runs to completion with containers rendered;
     2. the 2026-09-03 regression class — a function that is still CALLED but no
        longer DEFINED, which node --check and quickcheck.py both wave through —
        is caught, with the right name and the right line;
     3. a document written in a shape a renderer cannot use is reported as a
        safeRun failure rather than swallowed.

   Exits non-zero if any of them fails.
   ========================================================================== */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { run } = require(path.join(__dirname, "runtime-harness.js"));

const DECK = path.resolve(process.argv[2] || path.join(__dirname, "baseline-5fbe844.html"));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "cd-selftest-"));
const checks = [];
function check(name, ok, detail) {
  checks.push({ name: name, ok: !!ok, detail: detail || "" });
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + (detail ? "   — " + detail : ""));
}

(async function () {
  console.log("harness self-test against " + path.basename(DECK));

  // 1 — clean run
  const clean = await run({ file: DECK, timers: 1500, label: "selftest:clean" });
  check("a clean deck runs to completion", clean.completedTopLevel,
    clean.containersRendered.length + " containers, " + clean.exceptions.length + " exceptions");
  check("containers are actually recorded", clean.containersRendered.length > 100,
    clean.containersRendered.length + " container ids received innerHTML");

  // 2 — called-but-undefined function (the 2026-09-03 regression class)
  const src = fs.readFileSync(DECK, "utf8");
  const broken = path.join(TMP, "broken-undefined-fn.html");
  const FROM = "function updateHeaderClock()";
  if (src.indexOf(FROM) === -1) {
    check("called-but-undefined function is caught", false, "anchor `" + FROM + "` not found — update the self-test");
  } else {
    fs.writeFileSync(broken, src.replace(FROM, "function updateHeaderClock_REMOVED()"));
    const r = await run({ file: broken, timers: 1500, label: "selftest:undefined-fn" });
    const e = r.exceptions[0];
    check("called-but-undefined function is caught", !r.completedTopLevel && !!e && /updateHeaderClock is not defined/.test(e.message),
      e ? e.message + " @ html:" + e.line : "no exception recorded");
    check("the halt costs containers, and the harness says so", r.containersRendered.length < clean.containersRendered.length,
      r.containersRendered.length + " of " + clean.containersRendered.length + " containers rendered before the halt");
  }

  // 3 — an unusable document shape surfaces as a safeRun failure
  const bad = await run({
    file: DECK, timers: 1200, label: "selftest:bad-doc",
    inject: { localStorage: { liveFeeds: { updatedAt: "2026-09-22T00:00:00Z", feeds: { aiNewsList: { checkedAt: "2026-09-22T00:00:00Z", text: "x", citations: { not: "an array" } } } } } }
  });
  const named = bad.safeRunFailures.filter(function (f) { return f.line; });
  check("a malformed document is reported, not swallowed", bad.safeRunFailures.length > 0,
    bad.safeRunFailures.map(function (f) { return f.name + " (" + f.error + " @ html:" + f.line + ")"; }).join("; ") || "nothing reported");
  check("the failure carries a function name and a line", named.length > 0,
    named.length + " of " + bad.safeRunFailures.length + " failures have a resolved line number");

  const failed = checks.filter(function (c) { return !c.ok; });
  console.log("\n" + (checks.length - failed.length) + "/" + checks.length + " self-tests passed");
  process.exit(failed.length ? 1 : 0);
})().catch(function (e) {
  console.error("self-test crashed: " + (e && e.stack || e));
  process.exit(2);
});
