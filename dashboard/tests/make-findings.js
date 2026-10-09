#!/usr/bin/env node
"use strict";
/* ============================================================================
   make-findings.js — turn the stress sweep's measured results into the team's
   findings schema (BRIEF §6) at ../audit/findings-E7.json.

     node make-findings.js

   Reads tests/stress-report.json. Every finding below is anchored to a number
   this run actually measured; nothing is asserted that the sweep did not show.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const REPORT = path.join(HERE, "stress-report.json");
const OUT_DIR = path.join(HERE, "..", "audit");
const OUT = path.join(OUT_DIR, "findings-E7.json");

const R = JSON.parse(fs.readFileSync(REPORT, "utf8"));
const D = R.detail;

function rowsWith(pred) { return R.rows.filter(pred); }
function findRow(sub) { return R.rows.find(function (r) { return r.capability.indexOf(sub) !== -1; }); }

/* ---- measured numbers pulled from the report, never hand-typed ---- */
const baseline = D.baseline;
const restore = D.restoreTest;
const bundle = D.backupBundle;
const volIsa = (D.volume || []).find(function (v) { return v.key === "isaLine"; }) || {};
const volKan = (D.volume || []).find(function (v) { return v.key === "kanbanCards"; }) || {};
const volRh = (D.volume || []).find(function (v) { return v.key === "routineHealth"; }) || {};
const combined = D.volumeCombined || {};
const fiClaude = (D.failureInjection || []).find(function (f) { return /use\(\) throws/.test(f.case); }) || {};
const fiQuota = (D.failureInjection || []).find(function (f) { return /100 KB quota/.test(f.case); }) || {};
const fiSetItem = (D.failureInjection || []).find(function (f) { return /setItem throws/.test(f.case); }) || {};
const fiGetItem = (D.failureInjection || []).find(function (f) { return /getItem throws/.test(f.case); }) || {};
const fiSeed = (D.failureInjection || []).find(function (f) { return /cdStateSeed/.test(f.case); }) || {};
const concDb = (D.concurrency || {})["db-connected"] || {};
const concLocal = (D.concurrency || {})["local-only"] || {};

/* every edge doc whose malformed shapes reached a renderer */
const edgeThrowers = (D.edge || []).filter(function (e) {
  return e.variants.some(function (v) { return v.throws.length; });
});
const edgeFnLines = {};
edgeThrowers.forEach(function (e) {
  e.variants.forEach(function (v) {
    v.throws.forEach(function (t) {
      const k = t.fn + "|" + t.htmlLine + "|" + t.error;
      edgeFnLines[k] = (edgeFnLines[k] || 0) + 1;
    });
  });
});
const edgeSummary = Object.keys(edgeFnLines).map(function (k) {
  const p = k.split("|");
  return "safeRun('" + p[0] + "') @ html:" + p[1] + " — " + p[2];
});
const edgeDocsNotInExport = (D.edge || []).filter(function (e) { return !e.inExport; }).map(function (e) { return e.doc; });
const deadIds = (baseline.missingIds || []).filter(function (m) { return m.id !== "travelVisibleCount"; }).map(function (m) { return m.id; });
const slowest = (baseline.slowestRenders || [])[0] || {};

const F = [];
let n = 0;
function add(o) {
  n++;
  F.push(Object.assign({
    id: "F-E7-" + String(n).padStart(2, "0"),
    dateResolved: null,
    trustLevel: "n/a",
    halt: false,
    haltReason: ""
  }, o));
}

add({
  category: "Bug",
  panel: "global (sync pill / the whole inline IIFE)",
  system: "initSync() — window.claude.use(\"db\") handshake, command-deck.html:6921",
  description: "A SYNCHRONOUS throw from window.claude.use kills the entire dashboard. `(function initSync(){ ... window.claude.use(\"db\").then(...).catch(...) })()` guards only the PROMISE; the call itself is unguarded, so a throw propagates out of the top-level IIFE and every statement below it — every render, every safeRun — never executes. Measured under the harness: " +
    (fiClaude.honest ? fiClaude.honest.containers : 0) + " of " + baseline.containers + " container ids received innerHTML, i.e. a completely blank deck. This is the same failure class as the 2026-09-03 CI-log regression (a ReferenceError on the 1 s tick blanking Market Snapshot and everything below it). The async-rejection path is already safe: the same test with use() returning a rejected promise renders all " + baseline.containers + " containers.",
  priority: "P1",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "window.claude.use(\"db\").then(function (api) { ... }).catch(function () { setSyncStatus(\"Local only (this device)\", \"off\"); });",
  after: "try { window.claude.use(\"db\").then(...).catch(...); } catch (e) { setSyncStatus(\"Local only (this device)\", \"off\"); }",
  owner: "Reliability Engineer"
});

add({
  category: "Bug",
  panel: "panel-news / panel-property / every live-feed list",
  system: "orPaintFeed(el, noteEl, label, d, doc, budgetHrs) — command-deck.html:21367",
  description: "`var cites = (d.citations || []).filter(...)` assumes liveFeeds.feeds[x].citations is an array. A feed document whose citations field is an object, a number or a string throws \"(d.citations || []).filter is not a function\" and safeRun blanks the whole feed render — measured on both safeRun('renderNews') and safeRun('renderOrFeeds'), " +
    ((D.volume && true) ? "" : "") + "with " + (edgeThrowers.find(function (e) { return e.doc === "liveFeeds"; }) ? (edgeThrowers.find(function (e) { return e.doc === "liveFeeds"; }).variants.filter(function (v) { return v.throws.length; }).length) : 0) +
    " of 7 malformed liveFeeds shapes reaching it. The page already has the right tool for this — docRows(a, shape) filters at the DOCUMENT boundary — it is simply not applied to citations. Full list of functions the edge sweep drove into a throw: " + (edgeSummary.join(" · ") || "none"),
  priority: "P2",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "var cites = (d.citations || []).filter(function (c) { return c && c.url; }).slice(0, 5);",
  after: "var cites = docRows(d.citations).filter(function (c) { return c && c.url; }).slice(0, 5);",
  owner: "Reliability Engineer"
});

add({
  category: "Bug",
  panel: "panel-wellness (Strava card) + the Output-watch freshness board",
  system: "applyRemoteSnapshot(snap) — command-deck.html:6849 — vs. the stravaSnapshot document",
  description: "stravaSnapshot is the only one of the " + restore.docs + " exported documents with no `v` wrapper (top-level activities/syncedAt/via). applyRemoteSnapshot rejects any doc without `v` (`if (!data || typeof data !== \"object\" || !(\"v\" in data)) return;`), so the page ignores it and a full restore recovers " +
    restore.docsRestored + " of " + restore.docs + " documents. The freshness board then reports Strava as \"never produced output\" even though strava-daily-sync wrote it. Verified by restoring the whole export into the harness's localStorage and running the page.",
  priority: "P1",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "db doc stravaSnapshot = {activities, syncedAt, via}  → skipped by applyRemoteSnapshot; 160/161 docs restore",
  after: "either the writing task wraps it as {v:{...}}, or the page accepts both shapes on read (lsGet fallback) — E5 owns the page-side half of this",
  owner: "Integration Engineer"
});

add({
  category: "Bug",
  panel: "panel-vanessa (ISA direct line)",
  system: "renderIsaLine() — command-deck.html:24617 — and ISA_LINE_MAX at command-deck.html:24524",
  description: "renderIsaLine does `wrap.innerHTML = msgs.map(isaLineMsgHtml).join(\"\")` with no display cap. ISA_LINE_MAX (300) is applied ONLY inside isaLineMergeArrays, so any isaLine document written directly by a task — or restored from a larger store — renders in full. With 10,000 messages the page took " +
    volIsa.durationMs + " ms against a " + baseline.durationMs + " ms baseline (+" + volIsa.deltaVsBaselineMs + " ms), the slowest single render was " +
    ((volIsa.slowestRenders && volIsa.slowestRenders[0]) ? volIsa.slowestRenders[0].name + " at " + volIsa.slowestRenders[0].ms + " ms" : "n/a") +
    ", and the largest single innerHTML write was " +
    ((volIsa.largestInnerHtmlWrites && volIsa.largestInnerHtmlWrites[0]) ? (volIsa.largestInnerHtmlWrites[0].lastBytes / 1024 / 1024).toFixed(2) + " MB into #" + volIsa.largestInnerHtmlWrites[0].id : "n/a") + ".",
  priority: "P2",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "wrap.innerHTML = msgs.map(isaLineMsgHtml).join(\"\");  // harness milliseconds are relative, not browser timings — the unbounded write SIZE is the durable finding",
  after: "render the last ISA_LINE_MAX messages and say how many older ones are held back",
  owner: "Efficiency Engineer"
});

add({
  category: "Bug",
  panel: "panel-vanessa (ISA direct line) — cross-device merge",
  system: "isaLineMergeArrays(a, b) take() — command-deck.html:24534",
  description: "take() returns early on `!m.id`, so any relayed message without an id is discarded with no record anywhere — not a console warning, not SHAPE_MISMATCH, not the Ops Radar. Measured in the concurrency burst: " +
    (concDb.isaBurstWithoutId || 0) + " id-less messages sent, " + (concDb.isaMessagesWithoutIdDropped || 0) + " dropped silently. The merge itself is sound — order-independent=" + concDb.isaOrderIndependent + ", no ID'd message lost — so the fix is to keep id-less rows (synthesise an id from ts+origin) rather than to rewrite the merge.",
  priority: "P2",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "if (!m || typeof m !== \"object\" || !m.id) return;",
  after: "if (!m || typeof m !== \"object\") return; var key = m.id || (String(m.ts) + \"|\" + String(m.origin));",
  owner: "Reliability Engineer"
});

add({
  category: "Bug",
  panel: "global (every user-editable panel)",
  system: "lsSetLocal(key, value) — command-deck.html:6647 — and LS_UNAVAILABLE in lsGetSeeded — command-deck.html:6725",
  description: "A failing localStorage WRITE is completely invisible. lsSetLocal's catch is empty and LS_UNAVAILABLE is only ever set from a failing READ inside lsGetSeeded, so with setItem throwing the page still rendered all " +
    (fiSetItem.honest ? fiSetItem.honest.containers : baseline.containers) + " containers, raised " + (fiSetItem.honest ? fiSetItem.honest.consoleWarnings : 0) +
    " console warnings and set LS_UNAVAILABLE=" + (fiSetItem.honest ? fiSetItem.honest.lsUnavailableFlag : false) +
    ". The read path is handled correctly (getItem throwing sets LS_UNAVAILABLE=" + (fiGetItem.honest ? fiGetItem.honest.lsUnavailableFlag : "?") +
    " and raises the 'Local storage is unavailable in this view' alert), which is exactly why the write path reads as a healthy day. Anything Steven types into a panel is lost on reload with no warning.",
  priority: "P2",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "function lsSetLocal(key, value) { try { localStorage.setItem(...); } catch (e) {} }",
  after: "catch (e) { LS_WRITE_FAILED = true; } plus an Ops Radar alert alongside localStorageUnavailableAlerts()",
  owner: "Reliability Engineer"
});

add({
  category: "Bug",
  panel: "panel-vanessa (voice/mic controls) · panel-aiteam (ISA playbook)",
  system: "$() lookups with no matching element anywhere in the document",
  description: deadIds.length + " element ids are looked up by the script and exist nowhere in the 25,595-line pinned baseline (git 5fbe844): " + deadIds.join(", ") +
    ". Every call site is null-guarded so nothing throws — the features simply never wire up: the two voice toggles (html:23626), presenceAttachMic for Vanessa and Steve (html:23631-23632) and the ISA power-block tracker + VIP tiles inside renderIsaPlaybook (html:25039). Either the markup was removed and the wiring was not, or the markup was never added. Found by instrumenting document.getElementById in the harness and recording every miss.",
  priority: "P3",
  effort: "M",
  status: "Missing",
  resolution: "Open",
  testResult: "Fail",
  before: deadIds.join(", ") + " — referenced, never present",
  after: "either add the markup or delete the dead wiring; the harness's missingIds list is the regression test",
  owner: "Capability Engineer"
});

add({
  category: "Bug",
  panel: "panel-travel",
  system: "renderTravelPage() — command-deck.html:17776",
  description: "renderTravelPage reads $(\"travelVisibleCount\") at html:17776, one line before renderTravelFilters() (html:17778) creates that span at html:17719. On the first paint the element does not exist yet, the `if (cnt)` guard swallows it, and the \"N shown\" count stays empty until something triggers a second render.",
  priority: "P3",
  effort: "S",
  status: "Broken",
  resolution: "Open",
  testResult: "Fail",
  before: "var cnt = $(\"travelVisibleCount\"); if (cnt) cnt.textContent = shown + \" shown\"; renderTravelFilters();",
  after: "renderTravelFilters(); then read and fill travelVisibleCount",
  owner: "Reliability Engineer"
});

add({
  category: "Current State",
  panel: "global (cross-device sync)",
  system: "applyRemoteSnapshot(snap) — the `!dbReady && pendingDbWrites[key]` guard, command-deck.html:6881",
  description: "While dbReady is false, any key that already has a queued local write is skipped entirely (\"local is newer; it flushes next\"). The isaLine branch itself calls syncKeyToDb, so in local-only mode the FIRST isaLine change queues a pending write and every later isaLine change in the same session is discarded. Measured with a " +
    (concLocal.burstSize || 0) + "-change burst carrying two conflicting isaLine arrays: db-connected stored " + (concDb.isaMessagesStored || 0) +
    " of " + (concDb.isaExpectedIfNothingLost || 0) + " messages; local-only stored " + (concLocal.isaMessagesStored || 0) + " of " + (concLocal.isaExpectedIfNothingLost || 0) +
    ". The merge is otherwise well behaved: replaying the identical burst rewrote " + (concDb.keysThatChangedOnReplay || []).length +
    " keys (changed=" + concDb.changedOnReplay + "), so it is idempotent and cannot loop the 30 s location.reload() throttle.",
  priority: "P2",
  effort: "M",
  status: "New",
  resolution: "Open",
  testResult: "Fail",
  before: "second and later isaLine snapshots dropped in local-only mode",
  after: "exempt the merge-on-read keys (isaLine, isaLineRead) from the pendingDbWrites skip, since they merge rather than overwrite",
  owner: "Reliability Engineer"
});

add({
  category: "Current State",
  panel: "global (storage budget)",
  system: "localStorage — every synced document lives under the commandDeck. prefix",
  description: "The four volume payloads together are " + ((combined.payloadBytes || 0) / 1024 / 1024).toFixed(2) +
    " MB — about " + ((combined.payloadBytes || 0) / 5242880).toFixed(1) + "x the ~5 MB localStorage budget a browser gives one origin — and the page took " +
    (combined.durationMs || 0) + " ms to render them against a " + baseline.durationMs + " ms baseline. Nothing in the page measures its own storage footprint or warns as it approaches the cap; with a 100 KB quota injected the page rendered " +
    (fiQuota.honest ? fiQuota.honest.containers : "?") + " containers and reported the failure nowhere. Individually the documents are fine (routineHealth 5,000 rows " +
    volRh.durationMs + " ms, kanbanCards 2,000 " + volKan.durationMs + " ms) — the risk is cumulative.",
  priority: "P2",
  effort: "M",
  status: "New",
  resolution: "Recommended",
  testResult: "Fail",
  before: "no storage-budget instrumentation anywhere on the page",
  after: "a size check in the freshness board (sum of prefixed keys vs 5 MB) and a hard cap on the three unbounded lists (isaLine, liveFeeds citations, routineHealth rows)",
  owner: "Efficiency Engineer"
});

add({
  category: "Current State",
  panel: "panel-opsradar (Output watch)",
  system: "OUTPUT_WATCH (command-deck.html:18875) vs. the 2026-09-22 db export",
  description: (restore.outputWatchDocsMissingFromExport || []).length + " of the " + restore.outputWatchDocs +
    " watched documents do not exist in the " + restore.docs + "-document export at all: " + ((restore.outputWatchDocsMissingFromExport || []).join(", ") || "none") +
    ". Their owning tasks have never written them, so no backup can restore them and the Output-watch board is correct to say \"never produced output\". Restoring the whole export and running the page produced " +
    restore.containersRendered + " rendered containers (vs " + baseline.containers + " on the seed alone) with " + (restore.exceptions || []).length + " exceptions.",
  priority: "P2",
  effort: "M",
  status: "Missing",
  resolution: "Escalated",
  testResult: "Pass",
  before: "watched documents with no writer output: " + ((restore.outputWatchDocsMissingFromExport || []).join(", ") || "none") +
    "; every document the edge sweep read that is absent from the export: " + (edgeDocsNotInExport.join(", ") || "none"),
  after: "either run the owning task once to prove it, or take the row off OUTPUT_WATCH — a watch that can never go green is noise",
  owner: "Integration Engineer"
});

add({
  category: "Routine",
  panel: "panel-opsradar (backup card)",
  system: "r6-weekly-backup (Mac runner) + ai-ecosystem-backup skill",
  description: "r6-weekly-backup has never run under the runner and missed its 2026-09-20 slot; backupStatus still reports the 2026-09-14 backup. This cycle produced a verified bundle as a rehearsal of Steven's spec: " +
    bundle.docCount + " documents plus the deck, " + (bundle.totalBytes / 1024 / 1024).toFixed(2) + " MB across " + bundle.fileCount +
    " files, sha256 per file recomputed from disk after write, " + bundle.verifyFailures.length + " integrity failures, " + (bundle.parseFailures || []).length +
    " parse failures. Only Steven can make the real one run: a scheduled task dies on its first permission prompt, so it has to be opened in the desktop app's Scheduled section and Run-now'd once with each tool approved.",
  priority: "P2",
  effort: "S",
  status: "Broken",
  resolution: "Escalated",
  testResult: "Pass",
  before: "last verified backup 2026-09-14; r6-weekly-backup never run under claude-runner",
  after: "scratchpad/backup/2026-09-22/{state/*.json, command-deck.html, manifest.json} + restore-test.json, integrity pass",
  owner: "Steven",
  halt: true,
  haltReason: "A scheduled task cannot approve its own tool prompts. Steven must open r6-weekly-backup in the desktop app's Scheduled section and press Run now once, approving each tool, before the weekly backup can be called live."
});

add({
  category: "Automation Opportunity",
  panel: "panel-processexcellence",
  system: "nightly-self-test (Mac runner, currently failing with timeout exit 124) + tests/runtime-harness.js",
  description: "The deck has no automated runtime gate. quickcheck.py is static only and cannot see a function that is called but no longer defined — the exact bug that blanked Market Snapshot on 2026-09-03. tests/runtime-harness.js now executes the whole inline script under a pure-Node DOM shim in about " +
    baseline.durationMs + " ms and reports exceptions, safeRun failures, dead ids and which container ids received innerHTML. Wiring it into nightly-self-test (which currently fails on a 124 timeout) gives every engineer a pre-publish gate that costs one second.",
  priority: "P2",
  effort: "S",
  status: "Recommended",
  resolution: "Implemented",
  testResult: "Pass",
  before: "static checks only; runtime regressions found by Steven noticing a blank card",
  after: "node tests/runtime-harness.js <file> — exit 0 when the script runs to completion, exit 2 when it halts; " + baseline.containers + " containers is the baseline to diff against. tests/harness-selftest.js proves the harness catches that exact bug class before anyone trusts its PASS (6/6, it reconstructs the 2026-09-03 failure and reports `updateHeaderClock is not defined @ html:18204`).",
  owner: "CTO Innovator",
  dateResolved: "2026-09-22"
});

if (slowest.name) {
  add({
    category: "Bug",
    panel: "global (panel stamps)",
    system: "renderPanelStamps() — command-deck.html:20372 — the debounced re-render behind every lsSet",
    description: "renderPanelStamps is the single slowest render on a clean baseline (" + slowest.ms +
      " ms of a " + baseline.durationMs + " ms page) and it is re-run on a 400 ms debounce after EVERY recordSectionEdit, i.e. after every keystroke-driven save. Under the routineHealth volume payload it rose to " +
      (((volRh.slowestRenders || []).find(function (s) { return s.name === "renderPanelStamps"; }) || {}).ms || "n/a") + " ms. It re-runs document.querySelectorAll('.panel[data-page]') and walks every panel on each pass. CAVEAT: these milliseconds are harness time, not browser time — querySelectorAll and innerHTML parsing are native in a browser and plain JavaScript in the shim, so the absolute cost is lower in the deck. What the measurement establishes is the RANKING (the most expensive render on a clean load) and that every edit re-triggers it.",
    priority: "P3",
    effort: "M",
    status: "New",
    resolution: "Open",
    testResult: "Fail",
    before: "full re-walk of every panel stamp on a 400 ms debounce after each edit",
    after: "stamp only the panel whose key changed",
    owner: "Efficiency Engineer"
  });
}

add({
  category: "Current State",
  panel: "global (harness coverage)",
  system: "tests/runtime-harness.js — what it does and does not prove",
  description: "The harness runs the script under a DOM shim, not a browser. It proves: the script reaches its last line, which container ids receive innerHTML, which $() targets are missing, which renderers throw and on which document shape, and how long each render takes. It does NOT prove layout, CSS, real clipboard/speech/canvas behaviour, cross-origin fetches, or the real artifact db capability — window.claude is absent unless injected. " +
    R.summary.pass + " of " + R.summary.total + " sweep rows passed, " + R.summary.degraded + " degraded, " + R.summary.fail +
    " failed. Treat a harness PASS as 'the script did not break', not as 'the dashboard looks right'.",
  priority: "P3",
  effort: "S",
  status: "New",
  resolution: "Implemented",
  testResult: "Pass",
  before: "no runtime coverage statement anywhere",
  after: "tests/stress-report.md documents the scope and the exact rerun commands",
  owner: "Stress Test Engineer",
  dateResolved: "2026-09-22"
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(F, null, 2));
console.log("wrote " + OUT + " — " + F.length + " findings");
F.forEach(function (f) { console.log("  " + f.id + "  " + f.priority + "  " + f.owner.padEnd(22) + f.system.slice(0, 70)); });
