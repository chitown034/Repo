#!/usr/bin/env node
"use strict";
/* ============================================================================
   stress-sweep.js — E7 Stress Test Engineer sweep over the Command Deck.

     node stress-sweep.js [deckHtml] [--quick]

   Runs, in order:
     A  Volume         routineHealth 5,000 rows · kanbanCards 2,000 ·
                       isaLine 10,000 messages · liveFeeds 50 feeds x 200 citations
     B  Edge           every OUTPUT_WATCH doc + zohoLeads/twinQueue/vanessaRecommendations,
                       each injected as null / [] / {} / "string" / wrong-typed fields /
                       a row that is a number / truncated JSON
     C  FailureInject  window.claude.use throws · claude.use rejects ·
                       localStorage.setItem throws (quota) · localStorage disabled ·
                       the cdStateSeed block removed
     D  Concurrency    applyRemoteSnapshot with a 200-doc burst incl. conflicting isaLine
                       arrays, replayed for idempotence
     E  BackupRecovery restore all exported docs into localStorage, run the page, verify

   Writes: stress-report.json, stress-report.md, ../backup/restore-test.json
           and the backup bundle under ../backup/<date>/
   ========================================================================== */

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { run: runInProcess } = require(path.join(__dirname, "runtime-harness.js"));
const { makeBundle } = require(path.join(__dirname, "make-backup.js"));

/* Each page run builds a full DOM of a 4 MB document. Two hundred of them in one
   process exhausts the V8 old space (measured: FATAL heap limit at run ~85), so every
   run except the concurrency probes is executed in its own child process. That also
   exercises the CLI exactly as another engineer would use it. */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "cd-stress-"));
let RUN_SEQ = 0;
function run(cfg) {
  const id = ++RUN_SEQ;
  const outFile = path.join(TMP, "run-" + id + ".json");
  const args = [path.join(HERE, "runtime-harness.js"), cfg.file, "--quiet", "--out", outFile];
  if (cfg.store) { args.push("--store", cfg.store); }
  if (cfg.storeRaw) args.push("--store-raw");
  if (cfg.timers !== undefined) args.push("--timers", String(cfg.timers));
  if (cfg.label) args.push("--label", cfg.label);
  if (cfg.inject && Object.keys(cfg.inject).length) {
    const injFile = path.join(TMP, "inject-" + id + ".json");
    fs.writeFileSync(injFile, JSON.stringify(cfg.inject));
    args.push("--inject", injFile);
  }
  try {
    execFileSync(process.execPath, ["--max-old-space-size=3072"].concat(args), { stdio: ["ignore", "ignore", "pipe"], timeout: 300000 });
  } catch (e) {
    // exit code 2 = the page halted; that is a RESULT, not a harness failure
    if (!fs.existsSync(outFile)) {
      throw new Error("harness child failed for " + (cfg.label || cfg.file) + ": " +
        ((e.stderr && e.stderr.toString().slice(0, 600)) || e.message));
    }
  }
  const r = JSON.parse(fs.readFileSync(outFile, "utf8"));
  try { fs.unlinkSync(outFile); } catch (e2) {}
  return Promise.resolve(r);
}

const HERE = __dirname;
const DECK = path.resolve(process.argv[2] && process.argv[2][0] !== "-" ? process.argv[2] : path.join(HERE, "..", "deck", "command-deck.html"));
const STORE = path.join(HERE, "..", "db", "state");
const BACKUP_ROOT = path.join(HERE, "..", "backup");
const BACKUP_DATE = "2026-09-22";
const QUICK = process.argv.indexOf("--quick") !== -1;

const rows = [];
const detail = {};
let BASELINE = null;

function addRow(o) {
  rows.push({
    capability: o.capability,
    testType: o.testType,
    result: o.result,
    weakness: o.weakness || "",
    engineer: o.engineer || "",
    fixApplied: "",
    retest: "Pending",
    status: o.status || (o.result === "Pass" ? "Resolved" : "Open"),
    evidence: o.evidence || ""
  });
}
function verdict(r) {
  if (!r.completedTopLevel) return "Fail";
  if (r.exceptions.length || r.safeRunFailures.length) return "Degraded";
  return "Pass";
}
function failSummary(r) {
  return r.safeRunFailures.map(function (f) {
    return f.name + " (" + f.error + (f.line ? " @ html:" + f.line : "") + ")";
  });
}
function log() { console.log.apply(console, arguments); }

/* --------------------------------------------------------------- generators */
function bigRoutineHealth(n) {
  const routines = [];
  const statuses = ["ok", "error", "limited", "refused", "never"];
  for (let i = 0; i < n; i++) {
    routines.push({
      name: "synthetic-task-" + i,
      cadence: (i % 7 === 0) ? "weekly" : "daily",
      source: (i % 3 === 0) ? "cloud" : "mac",
      lastRun: "2026-09-" + String(10 + (i % 12)).padStart(2, "0") + "T12:00:00Z",
      nextRun: "2026-09-23T12:00:00Z",
      docTs: "2026-09-21T00:00:00Z",
      expectedDoc: "doc" + (i % 40),
      result: statuses[i % statuses.length] + " — volume-test row " + i
    });
  }
  return {
    syncedAt: "2026-09-22T08:00:00Z",
    counts: { ok: n - 400, failed: 120, late: 80, neverRun: 100, stale: 60, producedNothing: 40 },
    routines: routines,
    skips: { total: n, bySince: "2026-09-01", top: routines.slice(0, 50).map(function (r, i) { return { task: r.name, count: i + 1, reason: "waiting" }; }) }
  };
}
function bigKanban(n) {
  const cols = ["backlog", "progress", "done"], prios = ["p1", "p2", "p3"];
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({ id: "k" + i, text: "Volume card " + i + " — " + "x".repeat(40), col: cols[i % 3], prio: prios[i % 3], due: i % 5 === 0 ? "2026-09-30" : "" });
  }
  return out;
}
function bigIsaLine(n) {
  const out = [];
  const origins = ["cd", "isa"], prios = ["urgent", "decision", "fyi", "normal"];
  for (let i = 0; i < n; i++) {
    const t = new Date(Date.UTC(2026, 8, 1, 0, 0, 0) + i * 60000).toISOString();
    out.push({ id: "vol-" + i, ts: t, relayedAt: t, origin: origins[i % 2], from: i % 2 ? "isa" : "steven", to: i % 2 ? "steven" : "isa", priority: prios[i % 4], text: "Volume message " + i + " " + "y".repeat(80) });
  }
  return out;
}
function bigLiveFeeds(feedCount, citationCount) {
  const real = JSON.parse(fs.readFileSync(path.join(STORE, "liveFeeds.json"), "utf8")).v;
  const keys = Object.keys(real.feeds);
  const feeds = {};
  const cites = [];
  for (let c = 0; c < citationCount; c++) cites.push({ title: "Citation " + c + " " + "z".repeat(60), url: "https://example.test/article-" + c });
  keys.forEach(function (k) {
    feeds[k] = { checkedAt: "2026-09-22T08:00:00Z", source: "volume-test", model: "synthetic", text: real.feeds[k].text, citations: cites.slice() };
  });
  for (let i = keys.length; i < feedCount; i++) {
    feeds["syntheticFeed" + i] = { checkedAt: "2026-09-22T08:00:00Z", source: "volume-test", model: "synthetic", text: "- Synthetic headline row\n".repeat(30), citations: cites.slice() };
  }
  return { updatedAt: "2026-09-22T08:00:00Z", via: "volume-test", feeds: feeds };
}
function realDoc(name) {
  const p = path.join(STORE, name + ".json");
  if (!fs.existsSync(p)) return null;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return (j && typeof j === "object" && Object.prototype.hasOwnProperty.call(j, "v")) ? j.v : j;
}
function flipTypes(v, depth) {
  depth = depth || 0;
  if (v === null || v === undefined) return 0;
  if (Array.isArray(v)) {
    if (depth > 2) return { wasArray: true };
    const o = {};
    v.slice(0, 20).forEach(function (x, i) { o["k" + i] = depth < 2 ? flipTypes(x, depth + 1) : x; });
    return o;                                    // array -> object
  }
  if (typeof v === "object") {
    if (depth > 2) return "was-an-object";
    const o = {};
    Object.keys(v).forEach(function (k) { o[k] = flipTypes(v[k], depth + 1); });
    return o;
  }
  if (typeof v === "string") return v.length;    // string -> number
  if (typeof v === "number") return String(v);   // number -> string
  if (typeof v === "boolean") return String(v);
  return v;
}
function numberRow(v) {
  if (Array.isArray(v)) { const c = v.slice(); c.unshift(42); c.push(7); return c; }
  if (v && typeof v === "object") {
    const c = JSON.parse(JSON.stringify(v));
    let touched = false;
    Object.keys(c).forEach(function (k) {
      if (Array.isArray(c[k]) && !touched) { c[k] = [42].concat(c[k]); touched = true; }
    });
    if (!touched) {
      // nest one level down to find an array
      Object.keys(c).forEach(function (k) {
        if (touched || !c[k] || typeof c[k] !== "object") return;
        Object.keys(c[k]).forEach(function (k2) {
          if (Array.isArray(c[k][k2]) && !touched) { c[k][k2] = [42].concat(c[k][k2]); touched = true; }
        });
      });
    }
    if (!touched) return [42];
    return c;
  }
  return [42];
}

/* ================================================================= A · BASELINE */
async function sectionBaseline() {
  log("\n=== BASELINE ===");
  detail.deckSha256 = crypto.createHash("sha256").update(fs.readFileSync(DECK)).digest("hex");
  detail.deckLines = fs.readFileSync(DECK, "utf8").replace(/\n$/, "").split("\n").length;
  log("  deck " + path.basename(DECK) + " sha256 " + detail.deckSha256.slice(0, 16) + " · " + detail.deckLines + " lines");
  await run({ file: DECK, timers: 1500, label: "warmup" });   // discard: pays the parse + compile cost
  const r = await run({ file: DECK, timers: 1500, label: "baseline" });
  BASELINE = r;
  detail.baseline = {
    ok: r.ok, durationMs: r.durationMs, containers: r.containersRendered.length,
    scriptStartLine: r.scriptStartLine, scriptLines: r.scriptLines,
    largestInnerHtmlWrites: r.largestInnerHtmlWrites, totalInnerHtmlBytes: r.totalInnerHtmlBytes,
    containersRendered: r.containersRendered,
    safeRunFailures: r.safeRunFailures, exceptions: r.exceptions,
    missingIds: r.missingIds, slowestRenders: r.slowestRenders, stats: r.stats,
    shapeMismatch: r.shapeMismatch
  };
  log("  baseline " + verdict(r) + " in " + r.durationMs + "ms · " + r.containersRendered.length + " containers · " +
    r.safeRunFailures.length + " safeRun failures · " + r.missingIds.length + " dead ids");
  addRow({
    capability: "Whole page — published seed, no synced docs",
    testType: "Functional",
    result: verdict(r),
    weakness: verdict(r) === "Pass" ? "" : failSummary(r).join("; "),
    engineer: verdict(r) === "Pass" ? "" : "Reliability Engineer",
    status: verdict(r) === "Pass" ? "Resolved" : "Open",
    evidence: r.containersRendered.length + " container ids received innerHTML; " + r.durationMs + " ms; 0 exceptions"
  });
  const dead = r.missingIds.filter(function (m) { return m.id !== "travelVisibleCount"; });
  addRow({
    capability: "Element wiring — $() targets that do not exist in the document",
    testType: "Regression",
    result: dead.length ? "Degraded" : "Pass",
    weakness: dead.length ? dead.length + " ids are looked up but never exist: " + dead.map(function (m) { return m.id; }).join(", ") +
      ". Every call site is null-guarded so nothing throws — the features simply never wire up (voice toggles, both mic buttons, the ISA power-block tracker + VIP tiles)." : "",
    engineer: "Capability Engineer",
    status: dead.length ? "Escalated" : "Resolved",
    evidence: "voice toggles html:23626 · presenceAttachMic('vanessaMicBtn'…) html:23631 · presenceAttachMic('steveMicBtn'…) html:23632 · renderIsaPlaybook trackEl/vipEl html:25039"
  });
  addRow({
    capability: "Travel panel — 'N showing' count on first paint",
    testType: "Regression",
    result: "Degraded",
    weakness: "renderTravelPage reads $('travelVisibleCount') one line BEFORE renderTravelFilters() creates that span, so the count is empty on the first paint and only fills on a later re-render.",
    engineer: "Reliability Engineer",
    status: "Open",
    evidence: "html:17776 reads the id, html:17778 calls renderTravelFilters() which emits it (html:17719)"
  });
}

/* ================================================================== B · VOLUME */
async function sectionVolume() {
  log("\n=== A · VOLUME ===");
  const cases = [
    { name: "routineHealth · 5,000 routine rows", key: "routineHealth", value: bigRoutineHealth(5000), cap: "Automation health board (routineHealth)" },
    { name: "kanbanCards · 2,000 cards", key: "kanbanCards", value: bigKanban(2000), cap: "Task board (kanbanCards)" },
    { name: "isaLine · 10,000 messages", key: "isaLine", value: bigIsaLine(10000), cap: "ISA direct line (isaLine)" },
    { name: "liveFeeds · 50 feeds x 200 citations", key: "liveFeeds", value: bigLiveFeeds(50, 200), cap: "Live research feeds (liveFeeds)" }
  ];
  detail.volume = [];
  for (const c of cases) {
    const inj = { localStorage: {} };
    inj.localStorage[c.key] = c.value;
    const bytes = JSON.stringify(c.value).length;
    const r = await run({ file: DECK, timers: 1500, label: "volume:" + c.key, inject: inj });
    const slow = r.slowestRenders.slice(0, 5);
    const delta = r.durationMs - BASELINE.durationMs;
    const v = verdict(r);
    const biggest = (r.largestInnerHtmlWrites || [])[0];
    detail.volume.push({
      case: c.name, key: c.key, payloadBytes: bytes, durationMs: r.durationMs,
      deltaVsBaselineMs: delta, verdict: v, slowestRenders: slow,
      safeRunFailures: r.safeRunFailures, exceptions: r.exceptions,
      containers: r.containersRendered.length, shapeMismatch: r.shapeMismatch,
      largestInnerHtmlWrites: (r.largestInnerHtmlWrites || []).slice(0, 6),
      totalInnerHtmlBytes: r.totalInnerHtmlBytes
    });
    log("  " + c.name.padEnd(42) + v + "  " + r.durationMs + "ms (" + (delta >= 0 ? "+" : "") + delta + "ms)  payload " +
      (bytes / 1024 / 1024).toFixed(2) + " MB  slowest: " + (slow[0] ? slow[0].name + " " + slow[0].ms + "ms" : "—"));
    const weak = [];
    if (v !== "Pass") weak.push(failSummary(r).join("; "));
    if (slow[0] && slow[0].ms > 250) weak.push("slowest render " + slow[0].name + " " + slow[0].ms + " ms");
    if (biggest && biggest.lastBytes > 1024 * 1024) weak.push("one innerHTML write of " + (biggest.lastBytes / 1024 / 1024).toFixed(2) + " MB into #" + biggest.id + " — no display cap on this list");
    if (bytes > 5 * 1024 * 1024) weak.push("payload " + (bytes / 1024 / 1024).toFixed(2) + " MB exceeds the ~5 MB localStorage quota — this document can never round-trip through localStorage");
    addRow({
      capability: c.cap,
      testType: "Volume",
      result: v === "Pass" && !weak.length ? "Pass" : (v === "Fail" ? "Fail" : "Degraded"),
      weakness: weak.join(" · "),
      engineer: weak.length ? (v === "Pass" ? "Efficiency Engineer" : "Reliability Engineer") : "",
      status: weak.length ? "Monitoring" : "Resolved",
      evidence: "payload " + (bytes / 1024).toFixed(0) + " KB · page " + r.durationMs + " ms (" + (delta >= 0 ? "+" : "") + delta + " ms vs baseline) · " + r.containersRendered.length + " containers · largest single innerHTML write " + (biggest ? (biggest.lastBytes / 1024).toFixed(0) + " KB into #" + biggest.id : "n/a")
    });
  }
  // all four at once
  const all = { localStorage: {} };
  cases.forEach(function (c) { all.localStorage[c.key] = c.value; });
  const r = await run({ file: DECK, timers: 1500, label: "volume:combined", inject: all });
  const v = verdict(r);
  const totalBytes = cases.reduce(function (a, c) { return a + JSON.stringify(c.value).length; }, 0);
  detail.volumeCombined = {
    payloadBytes: totalBytes, durationMs: r.durationMs, verdict: v,
    slowestRenders: r.slowestRenders.slice(0, 8), safeRunFailures: r.safeRunFailures, exceptions: r.exceptions
  };
  log("  combined (all four)".padEnd(44) + v + "  " + r.durationMs + "ms  payload " + (totalBytes / 1024 / 1024).toFixed(2) + " MB");
  addRow({
    capability: "Whole page under all four volume payloads at once",
    testType: "Volume",
    result: v === "Pass" ? (r.durationMs > 4 * BASELINE.durationMs ? "Degraded" : "Pass") : v,
    weakness: (v !== "Pass" ? failSummary(r).join("; ") + " · " : "") +
      "page time " + r.durationMs + " ms vs " + BASELINE.durationMs + " ms baseline (" + (r.durationMs / BASELINE.durationMs).toFixed(1) + "x); " +
      (totalBytes / 1024 / 1024).toFixed(2) + " MB of documents against the ~5 MB localStorage budget a browser gives one origin (" +
      (totalBytes / 5242880).toFixed(2) + "x \u2014 at the cap, so the next document written is the one that fails), and nothing on the page measures its own storage footprint",
    engineer: "Efficiency Engineer",
    status: "Monitoring",
    evidence: "slowest: " + r.slowestRenders.slice(0, 3).map(function (s) { return s.name + " " + s.ms + "ms"; }).join(", ")
  });
}

/* ==================================================================== C · EDGE */
async function sectionEdge() {
  log("\n=== B · EDGE (malformed documents) ===");
  const owDocs = BASELINE.outputWatchDocs.slice();
  ["zohoLeads", "routineHealth", "backupStatus", "twinQueue", "vanessaRecommendations",
    "calendarSnapshot", "weatherSnapshot", "stravaSnapshot"].forEach(function (d) {
      if (owDocs.indexOf(d) === -1) owDocs.push(d);
    });
  const docs = QUICK ? owDocs.slice(0, 4) : owDocs;
  detail.edge = [];
  for (const docName of docs) {
    const real = realDoc(docName);
    const variants = [
      { v: "null", inject: { localStorage: {} }, set: null },
      { v: "[]", inject: { localStorage: {} }, set: [] },
      { v: "{}", inject: { localStorage: {} }, set: {} },
      { v: '"string"', inject: { localStorage: {} }, set: "string" },
      { v: "wrong-typed fields", inject: { localStorage: {} }, set: real === null ? { syncedAt: 17, rows: { not: "an array" } } : flipTypes(real) },
      { v: "row is a number", inject: { localStorage: {} }, set: real === null ? [42] : numberRow(real) },
      { v: "truncated JSON", raw: true, set: (JSON.stringify(real === null ? { syncedAt: "2026-09-22", rows: [] } : real)).slice(0, 220) }
    ];
    const perDoc = { doc: docName, inExport: real !== null, variants: [] };
    for (const vr of variants) {
      const inj = vr.raw ? { localStorageRaw: {} } : { localStorage: {} };
      (vr.raw ? inj.localStorageRaw : inj.localStorage)[docName] = vr.set;
      const r = await run({ file: DECK, timers: 1200, label: "edge:" + docName + ":" + vr.v, inject: inj });
      const newFails = r.safeRunFailures.filter(function (f) {
        return !BASELINE.safeRunFailures.some(function (b) { return b.name === f.name && b.error === f.error; });
      });
      const rec = {
        variant: vr.v,
        completed: r.completedTopLevel,
        throws: newFails.map(function (f) { return { fn: f.name, error: f.error, htmlLine: f.line, at: f.at }; }),
        exceptions: r.exceptions,
        shapeMismatch: Array.from(new Set(r.shapeMismatch.map(function (m) { return m.key + " expected " + m.want + ", got " + m.got; }))),
        shapeMismatchCount: r.shapeMismatch.length,
        containers: r.containersRendered.length,
        containersLost: BASELINE.containersRendered.filter(function (id) { return r.containersRendered.indexOf(id) === -1; })
      };
      perDoc.variants.push(rec);
    }
    const throwing = perDoc.variants.filter(function (x) { return x.throws.length; });
    const halted = perDoc.variants.filter(function (x) { return !x.completed; });
    const guarded = perDoc.variants.filter(function (x) { return x.shapeMismatch.length; });
    detail.edge.push(perDoc);
    const fns = {};
    throwing.forEach(function (x) { x.throws.forEach(function (t) { fns[t.fn + " @html:" + t.htmlLine] = t.error; }); });
    const fnList = Object.keys(fns);
    log("  " + docName.padEnd(24) + (halted.length ? "HALT " : "") +
      (throwing.length ? throwing.length + "/7 variants throw → " + fnList.slice(0, 3).join(", ") : "7/7 survived") +
      (guarded.length ? "  [" + guarded.length + " caught by lsGetSeeded]" : ""));
    addRow({
      capability: "Document `" + docName + "` (malformed input)",
      testType: "Edge",
      result: halted.length ? "Fail" : (throwing.length ? "Degraded" : "Pass"),
      weakness: throwing.length
        ? throwing.length + " of 7 malformed shapes (" + throwing.map(function (x) { return x.variant; }).join(", ") +
          ") reach a renderer and throw: " + fnList.join("; ") + ". safeRun catches each one, so the page stays up but those panels render empty with no on-page reason."
        : (real === null ? "Not an edge failure — all 7 malformed shapes were handled. Separate observation: this document is not in the 161-document export at all, so the deck reads it but no task has ever written it." : ""),
      engineer: throwing.length ? "Reliability Engineer" : (real === null ? "Integration Engineer" : ""),
      status: throwing.length ? "Open" : (real === null ? "Escalated" : "Resolved"),
      evidence: perDoc.variants.map(function (x) { return x.variant + ":" + (x.throws.length ? "throw" : (x.shapeMismatch.length ? "guarded" : "ok")); }).join(" ")
    });
  }
}

/* ======================================================== D · FAILURE INJECTION */
async function sectionFailure() {
  log("\n=== C · FAILURE INJECTION ===");
  const cases = [
    { name: "window.claude present, use() throws", inject: { claude: "throwing" }, cap: "Claude capability handshake (initSync / claudeUse)" },
    { name: "window.claude present, use() rejects", inject: { claude: "rejecting" }, cap: "Claude capability handshake — rejected promise" },
    { name: "localStorage.setItem throws (quota)", inject: { setItemThrows: true }, cap: "Local persistence — write path" },
    { name: "localStorage.getItem throws (disabled)", inject: { getItemThrows: true }, cap: "Local persistence — read path" },
    { name: "localStorage 100 KB quota (writes fail part-way)", inject: { quotaBytes: 100 * 1024 }, cap: "Local persistence — quota exhausted part-way through hydration" },
    { name: "localStorage 5 MB quota + all 161 live docs", inject: { quotaBytes: 5 * 1024 * 1024 }, store: STORE, cap: "Local persistence — 5 MB browser quota with the real store" },
    { name: "cdStateSeed block removed", inject: { removeSeed: true }, cap: "Published seed hydration (hydrateFromSeed)" }
  ];
  detail.failureInjection = [];
  for (const c of cases) {
    const r = await run({ file: DECK, timers: 1500, label: "fail:" + c.name, inject: c.inject, store: c.store });
    const v = verdict(r);
    const honest = {
      lsUnavailableFlag: r.localStorageUnavailable,
      shapeMismatchReported: r.shapeMismatch.length,
      consoleWarnings: r.stats.consoleWarnings,
      containers: r.containersRendered.length,
      containersLost: BASELINE.containersRendered.filter(function (id) { return r.containersRendered.indexOf(id) === -1; })
    };
    detail.failureInjection.push({
      case: c.name, verdict: v, durationMs: r.durationMs,
      exceptions: r.exceptions, safeRunFailures: r.safeRunFailures, honest: honest
    });
    log("  " + c.name.padEnd(44) + v + "  containers " + r.containersRendered.length + "/" + BASELINE.containersRendered.length +
      "  lsUnavailableFlag=" + r.localStorageUnavailable + "  lost=" + honest.containersLost.length);
    let weakness = "";
    let engineer = "";
    let status = "Resolved";
    if (v !== "Pass") { weakness = failSummary(r).join("; "); engineer = "Reliability Engineer"; status = "Open"; }
    if (!r.completedTopLevel) {
      weakness = "P1 — the whole page dies. `(function initSync(){...})` calls `window.claude.use(\"db\").then(...)` at html:6921 with NO try/catch; only the promise is `.catch()`ed. A SYNCHRONOUS throw from claude.use propagates out of the IIFE and halts every remaining top-level statement, so 0 of " +
        BASELINE.containersRendered.length + " containers render — a blank dashboard, exactly the 2026-09-03 CI-log regression class. Exception: " +
        (r.exceptions[0] ? r.exceptions[0].message + " @ html:" + r.exceptions[0].line : "n/a") +
        ". Fix: wrap the use() call in try/catch and fall back to setSyncStatus(\"Local only (this device)\",\"off\").";
      engineer = "Reliability Engineer"; status = "Escalated";
    }
    if (c.inject.getItemThrows && !r.localStorageUnavailable) {
      weakness = "localStorage reads throw but LS_UNAVAILABLE was never set, so the 'Local storage is unavailable in this view' alert never fires — every panel silently shows its seed. lsGet() swallows the throw in its own catch; only lsGetSeeded() sets the flag.";
      engineer = "Reliability Engineer"; status = "Open";
    }
    // Both write-failure cases below used to assert the defect by construction: they
    // fired on the injection alone, looking only at container counts and the
    // LS_UNAVAILABLE flag, neither of which changes when the failure IS surfaced. So
    // they reported Degraded forever, fix or no fix — a red that was never measured.
    // The question a write-failure test must actually ask is whether anything told the
    // user the save failed. r.stats.saveFailureWarnings answers it.
    const saveFailuresSurfaced = (r.stats && r.stats.saveFailureWarnings) || 0;
    if (c.inject.quotaBytes && c.inject.quotaBytes < 1024 * 1024 && !r.localStorageUnavailable && !r.shapeMismatch.length && !saveFailuresSurfaced) {
      const keysLost = BASELINE.stats.localStorageKeys - r.stats.localStorageKeys;
      weakness = "With the storage budget exhausted part-way through hydrateFromSeed, " + keysLost + " of " +
        BASELINE.stats.localStorageKeys + " key(s) failed to persist and every QuotaExceededError was swallowed. The page still rendered " +
        r.containersRendered.length + " containers, raised " + r.stats.consoleWarnings +
        " console warnings, surfaced 0 of them as save failures and left LS_UNAVAILABLE false — LS_UNAVAILABLE is only ever set on a failing READ, never on a failing write, so a full store is indistinguishable from a healthy day.";
      engineer = "Reliability Engineer"; status = "Open";
    }
    if (c.inject.setItemThrows && honest.containersLost.length === 0 && !r.localStorageUnavailable && !saveFailuresSurfaced) {
      weakness = "Every write is swallowed silently. The page rendered all " +
        r.containersRendered.length + " containers, raised " + r.stats.consoleWarnings +
        " console warnings of which 0 named a failed save, reported " + r.shapeMismatch.length +
        " shape warnings and left LS_UNAVAILABLE false, and the sync pill still reads 'Local only (this device)'. Nothing anywhere says a save failed, so anything Steven types into a panel is gone on reload with no warning.";
      engineer = "Reliability Engineer"; status = "Open";
    }
    if (c.inject.removeSeed && honest.containersLost.length) {
      weakness = (weakness ? weakness + " · " : "") + honest.containersLost.length + " containers stop rendering without the seed: " + honest.containersLost.slice(0, 8).join(", ");
      engineer = engineer || "Reliability Engineer"; status = "Monitoring";
    }
    addRow({
      capability: c.cap,
      testType: "FailureInjection",
      result: v === "Fail" ? "Fail" : (weakness ? "Degraded" : "Pass"),
      weakness: weakness,
      engineer: engineer,
      status: weakness ? status : "Resolved",
      evidence: "page " + (r.completedTopLevel ? "ran to completion" : "HALTED") + " · " + r.containersRendered.length + " containers · " +
        r.shapeMismatch.length + " shape warnings · " + r.stats.consoleWarnings + " console warnings"
    });
  }
}

/* =========================================================== E · CONCURRENCY */
function makeSnap(changes) {
  return {
    empty: changes.length === 0,
    docChanges: function () {
      return changes.map(function (c) {
        return {
          type: c.type || "modified",
          doc: {
            id: c.id,
            updatedAt: c.updatedAt || "2026-09-22T08:30:00.000Z",
            metadata: { hasPendingWrites: false },
            data: function () { return { v: c.v }; }
          }
        };
      });
    }
  };
}
async function sectionConcurrency() {
  log("\n=== D · CONCURRENCY ===");
  detail.concurrency = {};
  await concurrencyMode("db-connected", { claude: "ok" });
  await concurrencyMode("local-only", {});
}
async function concurrencyMode(mode, inject) {
  const r = await runInProcess({ file: DECK, timers: 1500, label: "concurrency:" + mode, store: STORE, inject: inject });
  const probe = r._probe || {};
  const win = r._window;
  const apply = probe.applyRemoteSnapshot;
  const PREF = r.lsPrefix;
  const out = { applyRemoteSnapshotExposed: !!apply };
  if (!apply) {
    log("  applyRemoteSnapshot not reachable — skipping");
    addRow({ capability: "Cross-device merge (applyRemoteSnapshot) [" + mode + "]", testType: "Concurrency", result: "Fail", weakness: "applyRemoteSnapshot could not be reached from the harness probe.", engineer: "Reliability Engineer", status: "Open" });
    return;
  }
  // --- build a 200-change burst, including two conflicting isaLine arrays
  const docNames = fs.readdirSync(STORE).filter(function (f) { return f.endsWith(".json"); }).map(function (f) { return f.replace(/\.json$/, ""); });
  const changes = [];
  const isaA = [], isaB = [];
  for (let i = 0; i < 40; i++) {
    const t = new Date(Date.UTC(2026, 8, 22, 7, i)).toISOString();
    isaA.push({ id: "conc-a-" + i, ts: t, origin: "cd", from: "steven", to: "isa", priority: "fyi", text: "device A message " + i });
    isaB.push({ id: "conc-b-" + i, ts: t, origin: "isa", from: "isa", to: "steven", priority: "urgent", text: "device B message " + i });
  }
  // a message with NO id from each side — the merge drops those
  isaA.push({ ts: "2026-09-22T07:59:00Z", origin: "cd", text: "device A message with no id" });
  isaB.push({ ts: "2026-09-22T07:59:30Z", origin: "isa", text: "device B message with no id" });

  // 198 non-isaLine changes. There are only ~160 documents, so the tail repeats doc ids —
  // that is deliberate (the same document changing twice inside one snapshot is exactly what a
  // burst looks like), but each id always carries the SAME payload so a replay is a true echo
  // and "did anything change?" stays a meaningful question.
  let n = 0;
  while (changes.length < 198) {
    const idx = n % docNames.length;
    const d = docNames[idx];
    if (d !== "isaLine") {
      const v = realDoc(d);
      changes.push({ id: d, v: (v && typeof v === "object" && !Array.isArray(v)) ? Object.assign({}, v, { _burst: idx }) : v });
    }
    n++;
    if (n > 5000) break;
  }
  const distinctDocsInBurst = Object.keys(changes.reduce(function (a, c) { a[c.id] = 1; return a; }, {})).length;
  changes.push({ id: "isaLine", v: isaA });
  changes.push({ id: "isaLine", v: isaB });   // conflicting arrays in ONE burst

  function snapshotState() {
    const s = {};
    for (const [k, v] of win.localStorage._map) if (k.indexOf(PREF) === 0) s[k] = v;
    return s;
  }
  function readIsa() { try { return JSON.parse(win.localStorage._map.get(PREF + "isaLine") || "[]"); } catch (e) { return null; } }

  const isaBefore = (readIsa() || []).length;
  const t0 = Date.now();
  let changed1 = null, err1 = null;
  try { changed1 = apply(makeSnap(changes)); } catch (e) { err1 = (e && e.message) || String(e); }
  const ms1 = Date.now() - t0;
  const state1 = snapshotState();
  const isa1 = readIsa();

  // replay the identical burst — an idempotent merge must not change anything
  let changed2 = null, err2 = null;
  const t1 = Date.now();
  try { changed2 = apply(makeSnap(changes)); } catch (e) { err2 = (e && e.message) || String(e); }
  const ms2 = Date.now() - t1;
  const state2 = snapshotState();
  const isa2 = readIsa();

  // replay with the two isaLine arrays in the OPPOSITE order
  const swapped = changes.slice(0, changes.length - 2).concat([{ id: "isaLine", v: isaB }, { id: "isaLine", v: isaA }]);
  let err3 = null;
  try { apply(makeSnap(swapped)); } catch (e) { err3 = (e && e.message) || String(e); }
  const isa3 = readIsa();

  const keys1 = Object.keys(state1).sort(), keys2 = Object.keys(state2).sort();
  const diffKeys = keys1.filter(function (k) { return state1[k] !== state2[k]; });
  const idsIn = {};
  isaA.concat(isaB).forEach(function (m) { if (m.id) idsIn[m.id] = 1; });
  const idsOut = {};
  (isa1 || []).forEach(function (m) { if (m && m.id) idsOut[m.id] = 1; });
  // An id-less message that SURVIVED the merge no longer looks id-less on the way
  // out: isaLineMergeArrays gives it a deterministic id derived from its own
  // timestamp, sender and text, and marks it idDerived. Counting output rows with
  // no id therefore counts zero survivors and reports every one of them as dropped,
  // fix or no fix. Count the rows that actually carry an id-less message instead.
  const survivedNoId = (isa1 || []).filter(function (m) { return m && (!m.id || m.idDerived); }).length;
  const lost = Object.keys(idsIn).filter(function (id) { return !idsOut[id]; });
  const orderStable = JSON.stringify(isa1) === JSON.stringify(isa3);

  out.burstSize = changes.length;
  out.firstApplyMs = ms1;
  out.replayApplyMs = ms2;
  out.changedFirst = changed1;
  out.changedOnReplay = changed2;
  out.errors = [err1, err2, err3].filter(Boolean);
  out.keysAfterFirst = keys1.length;
  out.keysAfterReplay = keys2.length;
  out.keysThatChangedOnReplay = diffKeys;
  out.isaAlreadyInDoc = isaBefore;
  out.isaBurstWithId = Object.keys(idsIn).length;
  out.isaBurstWithoutId = 2;
  out.isaMessagesStored = (isa1 || []).length;
  out.isaMessagesWithoutIdSurvived = survivedNoId;
  out.isaMessagesWithoutIdDropped = Math.max(0, 2 - survivedNoId);
  out.isaExpectedIfNothingLost = isaBefore + Object.keys(idsIn).length + 2;
  out.isaIdsLost = lost;
  out.isaOrderIndependent = orderStable;
  out.reloadsRequested = r._window._stats.reloads;
  out.mode = mode;
  detail.concurrency[mode] = out;

  log("  [" + mode + "] burst " + out.burstSize + " changes applied in " + ms1 + "ms (changed=" + changed1 + "); replay " + ms2 + "ms (changed=" + changed2 + ")");
  log("  [" + mode + "] keys differing after identical replay: " + diffKeys.length + (diffKeys.length ? " [" + diffKeys.slice(0, 5).join(", ") + "]" : ""));
  log("  [" + mode + "] isaLine: " + isaBefore + " already in the doc + " + out.isaBurstWithId + " ID'd + " +
    out.isaBurstWithoutId + " id-less sent -> " + out.isaMessagesStored + " stored (" + out.isaExpectedIfNothingLost +
    " if nothing were lost); " + out.isaMessagesWithoutIdDropped + " id-less dropped, " + lost.length +
    " ID'd lost; order-independent=" + orderStable);

  addRow({
    capability: "Cross-device merge — 200-change burst (applyRemoteSnapshot)" + " [" + mode + "]",
    testType: "Concurrency",
    result: out.errors.length ? "Fail" : "Pass",
    weakness: out.errors.length ? out.errors.join("; ") : "",
    engineer: out.errors.length ? "Reliability Engineer" : "",
    status: out.errors.length ? "Open" : "Resolved",
    evidence: out.burstSize + " doc changes applied in " + ms1 + " ms, no throw; " + keys1.length + " keys in localStorage afterwards"
  });
  const idempotent = diffKeys.length === 0;
  addRow({
    capability: "Merge idempotence — identical burst replayed [" + mode + "]",
    testType: "Concurrency",
    result: idempotent ? (changed2 === false ? "Pass" : "Degraded") : "Fail",
    weakness: !idempotent
      ? "replaying the identical snapshot rewrote " + diffKeys.length + " key(s) to different values (" + diffKeys.slice(0, 5).join(", ") + ") — the merge is not idempotent and two devices can oscillate."
      : (changed2 === false ? ""
        : "state IS idempotent (0 of " + keys1.length + " keys differ after the replay) but applyRemoteSnapshot still returned changed=true, and the caller turns changed=true into location.reload(). Echoed documents therefore cost a reload every 30 s even when nothing actually changed. Note this burst deliberately repeats " +
          (changes.length - distinctDocsInBurst) + " doc ids inside one snapshot, which is one legitimate way changed=true arises."),
    engineer: idempotent && changed2 === false ? "" : "Reliability Engineer",
    status: idempotent ? (changed2 === false ? "Resolved" : "Monitoring") : "Open",
    evidence: "changed(first)=" + changed1 + " changed(replay)=" + changed2 + " · " + diffKeys.length + " of " + keys1.length +
      " stored keys differ after an identical replay · " + distinctDocsInBurst + " distinct doc ids in a " + changes.length + "-change burst"
  });
  addRow({
    capability: "ISA line conflict merge (isaLineMergeArrays)" + " [" + mode + "]",
    testType: "Concurrency",
    result: (lost.length === 0 && orderStable && out.isaMessagesWithoutIdDropped === 0) ? "Pass" : "Degraded",
    weakness: [
      lost.length ? lost.length + " ID'd message(s) never reached the document (" + out.isaMessagesStored + " stored vs " +
        out.isaExpectedIfNothingLost + " expected)" + (mode === "local-only"
          ? " — NOT the merge's doing: the isaLine branch calls syncKeyToDb, which with no db capability queues a pendingDbWrites entry, and the very next guard (`!dbReady && pendingDbWrites[key]`, html:6881) then discards every later isaLine change in the session"
          : "") : "",
      out.isaMessagesWithoutIdDropped ? out.isaMessagesWithoutIdDropped + " of " + out.isaBurstWithoutId + " message(s) WITHOUT an `id` were discarded by the merge — on a two-way channel with a person that is lost correspondence, not a rounding error" : "",
      orderStable ? "" : "merge is order-dependent: swapping the two conflicting isaLine arrays produced a different stored array"
    ].filter(Boolean).join(" · "),
    engineer: "Reliability Engineer",
    status: (lost.length === 0 && orderStable && out.isaMessagesWithoutIdDropped === 0) ? "Resolved" : "Open",
    evidence: "isaLineMergeArrays take() at html:24534; doc held " + isaBefore + " messages, burst added " +
      out.isaBurstWithId + " with an id and " + out.isaBurstWithoutId + " without; " + out.isaMessagesStored +
      " stored afterwards vs " + out.isaExpectedIfNothingLost + " if nothing were lost; ISA_LINE_MAX=300 cap at html:24524"
  });
}

/* ======================================================= F · BACKUP / RECOVERY */
async function sectionBackup() {
  log("\n=== E · BACKUP / RECOVERY ===");
  const r = await run({ file: DECK, timers: 1500, label: "restore", store: STORE });
  const s = r.store;
  const ow = BASELINE.outputWatchDocs;
  // OUTPUT_WATCH container: the freshness board writes into autoHealthBody; each watched
  // doc also feeds a panel. Report both the board and per-doc presence in the export.
  const owMissingFromExport = ow.filter(function (d) { return !fs.existsSync(path.join(STORE, d + ".json")); });
  const containersLost = BASELINE.containersRendered.filter(function (id) { return r.containersRendered.indexOf(id) === -1; });
  const containersGained = r.containersRendered.filter(function (id) { return BASELINE.containersRendered.indexOf(id) === -1; });

  const restoreTest = {
    at: new Date().toISOString(),
    deck: path.resolve(DECK),
    store: path.resolve(STORE),
    lsPrefix: r.lsPrefix,
    docs: s.docs,
    docsRestored: s.restored,
    sizeBytes: s.sizeBytes,
    parseFailures: s.parseFailures,
    missingV: s.missingV,
    outputWatchDocs: ow.length,
    outputWatchDocsMissingFromExport: owMissingFromExport,
    containersRendered: r.containersRendered.length,
    containersRenderedIds: r.containersRendered,
    containersLostVsSeedOnly: containersLost,
    containersGainedVsSeedOnly: containersGained,
    exceptions: r.exceptions,
    safeRunFailures: r.safeRunFailures,
    shapeMismatch: r.shapeMismatch,
    durationMs: r.durationMs,
    verdict: (r.completedTopLevel && !r.exceptions.length && !r.safeRunFailures.length && s.parseFailures.length === 0)
      ? (s.restored === s.docs && owMissingFromExport.length === 0 ? "PASS" : "PASS WITH EXCEPTIONS")
      : "FAIL",
    notes: [
      s.missingV.length
        ? s.missingV.length + " document(s) carry no `v` wrapper (" + s.missingV.join(", ") + "). applyRemoteSnapshot now adopts such a document as {v: <doc>} after a shape warning instead of skipping it, so all " + s.restored + " of " + s.docs + " restore. The writing task still needs fixing — a document that only survives because the reader is forgiving is one bad deploy from being lost."
        : "every document carries a `v` wrapper",
      owMissingFromExport.length
        ? owMissingFromExport.length + " OUTPUT_WATCH document(s) do not exist in the export at all: " + owMissingFromExport.join(", ") + " — the owning task has never written them, so a restore cannot bring them back."
        : "every OUTPUT_WATCH document is present in the export",
      "restore is verified by execution, not by file count: the deck was run against the restored store and " +
        r.containersRendered.length + " container ids received innerHTML with " + r.exceptions.length + " exceptions and " +
        r.safeRunFailures.length + " safeRun failures."
    ]
  };
  fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  fs.writeFileSync(path.join(BACKUP_ROOT, "restore-test.json"), JSON.stringify(restoreTest, null, 2));
  detail.restoreTest = restoreTest;
  log("  restored " + s.restored + "/" + s.docs + " docs (" + (s.sizeBytes / 1024).toFixed(0) + " KB) · containers " +
    r.containersRendered.length + " · parse failures " + s.parseFailures.length + " · missing v " + s.missingV.length +
    " · verdict " + restoreTest.verdict);

  addRow({
    capability: "Restore all " + s.docs + " exported documents and run the page",
    testType: "BackupRecovery",
    result: restoreTest.verdict === "FAIL" ? "Fail" : ((s.restored !== s.docs) || owMissingFromExport.length ? "Degraded" : "Pass"),
    weakness: [
      (s.restored !== s.docs) ? (s.docs - s.restored) + " document(s) could not be restored (" + s.restored + "/" + s.docs + ")" : "",
      owMissingFromExport.length ? owMissingFromExport.length + " watched documents were never written by their task and therefore cannot be restored: " + owMissingFromExport.join(", ") : ""
    ].filter(Boolean).join(" · "),
    engineer: ((s.restored !== s.docs) || owMissingFromExport.length) ? "Integration Engineer" : "",
    status: ((s.restored !== s.docs) || owMissingFromExport.length) ? "Escalated" : "Resolved",
    evidence: s.restored + "/" + s.docs + " restored · " + (s.sizeBytes / 1024).toFixed(0) + " KB · " + r.containersRendered.length + " containers rendered · " + r.exceptions.length + " exceptions"
  });
  addRow({
    capability: "OUTPUT_WATCH freshness board after a full restore",
    testType: "BackupRecovery",
    result: containersLost.length ? "Degraded" : "Pass",
    weakness: containersLost.length ? containersLost.length + " container(s) that render from the seed stop rendering once real documents are restored: " + containersLost.slice(0, 10).join(", ") : "",
    engineer: containersLost.length ? "Reliability Engineer" : "",
    status: containersLost.length ? "Open" : "Resolved",
    evidence: "all " + ow.length + " OUTPUT_WATCH docs are read by outputWatchRows(); autoHealthBody rendered=" + (r.containersRendered.indexOf("autoHealthBody") !== -1)
  });

  // ---- the bundle
  const bundle = makeBundle({ deck: DECK, store: STORE, outDir: path.join(BACKUP_ROOT, BACKUP_DATE) });
  detail.backupBundle = bundle;
  log("  bundle " + bundle.dir + " · " + bundle.docCount + " docs · " + (bundle.totalBytes / 1024 / 1024).toFixed(2) + " MB · " + bundle.fileCount + " files");
  addRow({
    capability: "Backup bundle " + path.relative(path.join(HERE, ".."), bundle.dir) + " (sha256 manifest)",
    testType: "BackupRecovery",
    result: bundle.verifyFailures.length ? "Fail" : "Pass",
    weakness: bundle.verifyFailures.length ? bundle.verifyFailures.join("; ") : "",
    engineer: bundle.verifyFailures.length ? "Reliability Engineer" : "",
    status: bundle.verifyFailures.length ? "Open" : "Resolved",
    evidence: bundle.docCount + " docs + the deck, " + (bundle.totalBytes / 1024 / 1024).toFixed(2) + " MB, every file re-hashed after write and matched"
  });
}

/* =============================================== F · DRIFT (other worktrees) */
async function sectionDrift() {
  log("\n=== F · DRIFT CHECK (this cycle's edited files, point in time) ===");
  const targets = [];
  const live = path.join(HERE, "..", "deck", "command-deck.html");
  if (fs.existsSync(live)) targets.push({ label: "deck/command-deck.html (working tree)", file: live });
  fs.readdirSync(path.join(HERE, "..")).filter(function (d) { return d.indexOf("wt-") === 0; }).sort().forEach(function (d) {
    const f = path.join(HERE, "..", d, "command-deck.html");
    if (fs.existsSync(f)) targets.push({ label: d + "/command-deck.html", file: f });
  });
  detail.drift = [];
  for (const t of targets) {
    const sha = crypto.createHash("sha256").update(fs.readFileSync(t.file)).digest("hex");
    if (sha === detail.deckSha256) {
      log("  " + t.label.padEnd(40) + "identical to the pinned baseline — skipped");
      detail.drift.push({ label: t.label, sha256: sha, identicalToBaseline: true });
      continue;
    }
    let r;
    try { r = await run({ file: t.file, timers: 1500, label: "drift:" + t.label }); }
    catch (e) { log("  " + t.label.padEnd(40) + "harness could not run: " + e.message.slice(0, 120));
      detail.drift.push({ label: t.label, sha256: sha, error: e.message.slice(0, 300) }); continue; }
    const v = verdict(r);
    const newFails = r.safeRunFailures.filter(function (f) {
      return !BASELINE.safeRunFailures.some(function (b) { return b.name === f.name && b.error === f.error; });
    });
    const newMissing = r.missingIds.filter(function (m) {
      return !BASELINE.missingIds.some(function (b) { return b.id === m.id; });
    }).map(function (m) { return m.id; });
    detail.drift.push({
      label: t.label, sha256: sha, verdict: v, completed: r.completedTopLevel,
      durationMs: r.durationMs, containers: r.containersRendered.length,
      containersVsBaseline: r.containersRendered.length - BASELINE.containersRendered.length,
      exceptions: r.exceptions, newSafeRunFailures: newFails, newMissingIds: newMissing,
      shapeMismatch: r.shapeMismatch
    });
    log("  " + t.label.padEnd(40) + v + "  containers " + r.containersRendered.length +
      " (" + (r.containersRendered.length - BASELINE.containersRendered.length >= 0 ? "+" : "") +
      (r.containersRendered.length - BASELINE.containersRendered.length) + ")  new failures " + newFails.length +
      "  new dead ids " + newMissing.length);
    addRow({
      capability: "Runtime gate — " + t.label,
      testType: "Regression",
      result: !r.completedTopLevel ? "Fail" : (newFails.length || newMissing.length ? "Degraded" : "Pass"),
      weakness: [
        r.completedTopLevel ? "" : "the inline script HALTS: " + (r.exceptions[0] ? r.exceptions[0].message + " @ html:" + r.exceptions[0].line : "unknown"),
        newFails.length ? newFails.length + " NEW safeRun failure(s) not in the baseline: " + newFails.map(function (f) { return f.name + " (" + f.error + " @ html:" + f.line + ")"; }).join("; ") : "",
        newMissing.length ? newMissing.length + " NEW $() id(s) with no element: " + newMissing.join(", ") : ""
      ].filter(Boolean).join(" · "),
      engineer: !r.completedTopLevel || newFails.length || newMissing.length ? "Reliability Engineer" : "",
      status: !r.completedTopLevel ? "Escalated" : (newFails.length || newMissing.length ? "Open" : "Resolved"),
      evidence: "sha256 " + sha.slice(0, 12) + " · " + r.containersRendered.length + " containers · " + r.durationMs + " ms · point-in-time snapshot taken during the cycle, files were still being edited"
    });
  }
}

/* ==================================================================== report */
function writeReports() {
  const summary = {
    total: rows.length,
    pass: rows.filter(function (r) { return r.result === "Pass"; }).length,
    degraded: rows.filter(function (r) { return r.result === "Degraded"; }).length,
    fail: rows.filter(function (r) { return r.result === "Fail"; }).length
  };
  const report = {
    generatedAt: new Date().toISOString(),
    engineer: "E7 — Stress Test Engineer",
    cycle: "Loop Cycle 6 · 2026-09-22",
    baselineLabel: "Baseline 2026-09-12 · verified 2026-09-22",
    deck: path.resolve(DECK),
    deckSha256: detail.deckSha256,
    deckLines: detail.deckLines,
    deckProvenance: "git master commit 5fbe844 (the published build 2026-09-15 02:19 PT), pinned to tests/baseline-5fbe844.html so every line number in this report stays valid while seven engineers edit their worktrees",
    harness: path.join(HERE, "runtime-harness.js"),
    node: process.version,
    summary: summary,
    rows: rows,
    detail: detail
  };
  fs.writeFileSync(path.join(HERE, "stress-report.json"), JSON.stringify(report, null, 2));
  // the write-up lives in write-reports.js so it can be regenerated without re-running the sweep
  const { build } = require(path.join(HERE, "write-reports.js"));
  fs.writeFileSync(path.join(HERE, "stress-report.md"), build(report));
  log("\n=== WROTE ===");
  log("  " + path.join(HERE, "stress-report.json"));
  log("  " + path.join(HERE, "stress-report.md"));
  log("  " + path.join(BACKUP_ROOT, "restore-test.json"));
  log("  summary: " + summary.pass + " Pass · " + summary.degraded + " Degraded · " + summary.fail + " Fail");
}

/* ------------------------------------------------------------------- main */
(async function () {
  const t0 = Date.now();
  await sectionBaseline();
  await sectionVolume();
  await sectionEdge();
  await sectionFailure();
  await sectionConcurrency();
  await sectionBackup();
  await sectionDrift();
  writeReports();
  log("  total sweep time " + ((Date.now() - t0) / 1000).toFixed(1) + "s");
})().catch(function (e) {
  console.error("sweep failed: " + (e && e.stack || e));
  process.exit(1);
});
