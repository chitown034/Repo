#!/usr/bin/env node
"use strict";
/* ============================================================================
   runtime-harness.js — execute the Command Deck's inline <script> end-to-end
   under a pure-Node DOM shim (no npm installs, no jsdom). Node >= 20.

   USAGE
     node runtime-harness.js <html> [--store <dir of docs>] [--inject <json>]
                                    [--out <file.json>] [--json] [--quiet]
                                    [--timers <n>] [--label <name>]

     <html>            the deck file to run (e.g. ../deck/command-deck.html)
     --store <dir>     restore a directory of exported DB docs (<doc>.json, each
                       normally {"v": ...}) into the shim's localStorage under the
                       page's own LS_PREFIX, exactly the way applyRemoteSnapshot
                       does: a doc with no "v" key is adopted as {v: <doc>} and is
                       still listed in missingV/adoptedWithoutV so the writer gets
                       fixed. It counts as restored, because the page restores it.
     --inject <json>   a JSON file path OR inline JSON of test knobs:
                         { "claude": "absent"|"ok"|"throwing"|"rejecting",
                           "localStorage":    { key: <value> },   // JSON-encoded for you
                           "localStorageRaw": { key: "<raw>"  },  // stored verbatim (corrupt JSON)
                           "removeKeys":      ["key", ...],
                           "setItemThrows":   true,               // quota / disabled storage
                           "getItemThrows":   true,
                           "quotaBytes":      5000000,
                           "removeSeed":      true,               // delete the cdStateSeed block
                           "noTimers":        true }
     --out <file>      write the result JSON here
     --dump-text <ids> comma-separated element ids; print what each one SAYS after
                       the render (textContent + class). containersRendered only
                       tracks innerHTML, so a card built with textContent is
                       invisible to it — this is how you check those.
     --json            print the result JSON to stdout
     --timers <n>      max timer callbacks to drain after the main pass (default 1500)

   OUTPUT (stdout summary, and JSON via --out/--json)
     { file, label, ok, durationMs, exceptions:[{where,message,line,stack}],
       safeRunFailures:[{name,error,line}], containersRendered:[ids],
       shapeMismatch:[], missingIds:[], slowestRenders:[], stats:{...} }
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createDom } = require(path.join(__dirname, "dom-shim.js"));

/* ------------------------------------------------------------------- args */
function parseArgs(argv) {
  const out = { _: [], timers: 1500 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--store") out.store = argv[++i];
    else if (a === "--store-raw") out.storeRaw = true;
    else if (a === "--inject") out.inject = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--dump-text") out.dumpText = String(argv[++i] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    else if (a === "--label") out.label = argv[++i];
    else if (a === "--timers") out.timers = parseInt(argv[++i], 10) || 0;
    else if (a === "--json") out.json = true;
    else if (a === "--quiet") out.quiet = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else out._.push(a);
  }
  return out;
}

/* -------------------------------------------------- inline script extraction */
function extractInlineScript(html) {
  const re = /<script\b([^>]*)>/gi;
  let m, best = null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || "";
    const typeM = /type\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
    const type = typeM ? typeM[1].toLowerCase() : "";
    if (type && type.indexOf("javascript") === -1 && type !== "module") continue; // JSON seed etc.
    if (/\bsrc\s*=/.test(attrs)) continue;
    const start = m.index + m[0].length;
    const closeRe = /<\/script\s*>/gi;
    closeRe.lastIndex = start;
    const c = closeRe.exec(html);
    const end = c ? c.index : html.length;
    if (!best || end - start > best.end - best.start) {
      best = { start: start, end: end, tagIndex: m.index };
    }
  }
  if (!best) throw new Error("no inline <script> found in " + "the HTML");
  const before = html.slice(0, best.start);
  const line = before.split("\n").length;         // 1-based line the code starts on
  const col = best.start - (before.lastIndexOf("\n") + 1);
  return { code: html.slice(best.start, best.end), startLine: line, startCol: col };
}

/* Minimal, line-count-preserving instrumentation so failures carry a stack and
   a duration. If the deck is edited and these exact lines move, the harness
   still runs — it just reports fewer details. */
function instrument(code) {
  const applied = [];
  const A_FROM = '    try { if (typeof fn === "function") fn(); }';
  const A_TO = '    try { var __t0 = Date.now(); if (typeof fn === "function") fn(); if (window.__cdTime) window.__cdTime(name, Date.now() - __t0); }';
  const B_FROM = '      RENDER_FAILURES.push({ name: name, error: (e && (e.message || e.name)) || String(e) });';
  const B_TO = '      RENDER_FAILURES.push({ name: name, error: (e && (e.message || e.name)) || String(e), stack: (e && e.stack) || "" });';
  function once(src, from, to, tag) {
    const n = src.split(from).length - 1;
    if (n === 1) { applied.push(tag); return src.replace(from, to); }
    return src;
  }
  code = once(code, A_FROM, A_TO, "safeRun-timing");
  code = once(code, B_FROM, B_TO, "safeRun-stack");

  // Expose the closure internals the stress sweep needs. Appended at the very end
  // so no earlier line number moves.
  const probe = ';try{window.__cdProbe={LS_PREFIX:(typeof LS_PREFIX!=="undefined"?LS_PREFIX:null),' +
    'RENDER_FAILURES:(typeof RENDER_FAILURES!=="undefined"?RENDER_FAILURES:[]),' +
    'SHAPE_MISMATCH:(typeof SHAPE_MISMATCH!=="undefined"?SHAPE_MISMATCH:[]),' +
    'LS_UNAVAILABLE:(typeof LS_UNAVAILABLE!=="undefined"?LS_UNAVAILABLE:null),' +
    'OUTPUT_WATCH:(typeof OUTPUT_WATCH!=="undefined"?OUTPUT_WATCH:null),' +
    'applyRemoteSnapshot:(typeof applyRemoteSnapshot==="function"?applyRemoteSnapshot:null),' +
    'isaLineMergeArrays:(typeof isaLineMergeArrays==="function"?isaLineMergeArrays:null),' +
    'isaLineMergeRead:(typeof isaLineMergeRead==="function"?isaLineMergeRead:null),' +
    'outputWatchRows:(typeof outputWatchRows==="function"?outputWatchRows:null),' +
    'lsGet:(typeof lsGet==="function"?lsGet:null),' +
    'safeRun:(typeof safeRun==="function"?safeRun:null)};}catch(__e){}';
  const tail = code.lastIndexOf("})();");
  if (tail !== -1) {
    code = code.slice(0, tail) + probe + "\n" + code.slice(tail);
    applied.push("probe");
  }
  return { code: code, applied: applied };
}

/* ------------------------------------------------------------------ helpers */
/* Pull the first stack frame that belongs to the deck file itself. Frames from the
   harness (an injected throwing claude.use, a shim method) must never be reported as
   the deck's line number. */
function lineOf(stack, startLine, deckName) {
  if (!stack) return null;
  const frames = String(stack).split("\n");
  for (let i = 0; i < frames.length; i++) {
    if (deckName && frames[i].indexOf(deckName) === -1) continue;
    const m = /:(\d+):(\d+)\)?\s*$/.exec(frames[i].trim());
    if (!m) continue;
    const html = parseInt(m[1], 10);
    return { html: html, script: html - startLine + 1, frame: frames[i].trim() };
  }
  return null;
}

function loadStore(dir, opts) {
  const res = { docs: 0, restored: 0, parseFailures: [], missingV: [], adoptedWithoutV: [], sizeBytes: 0, values: {} };
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith(".json"); }).sort();
  files.forEach(function (f) {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, "utf8");
    const key = f.replace(/\.json$/, "");
    res.docs++;
    res.sizeBytes += Buffer.byteLength(raw, "utf8");
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) { res.parseFailures.push({ doc: key, error: e.message }); return; }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.prototype.hasOwnProperty.call(parsed, "v")) {
      res.values[key] = JSON.stringify(parsed.v);
      res.restored++;
    } else {
      // This branch used to model applyRemoteSnapshot's old behaviour — drop any
      // document with no {v: ...} wrapper — which is how a Strava sync went missing
      // from a restore. The page adopts such a document now (`data = { v: data }`
      // after a shape warning), so the loader adopts it too. Dropping it here would
      // make the restore test report a loss the page no longer suffers.
      res.missingV.push(key);      // still worth naming: the writer should be fixed
      res.adoptedWithoutV.push(key);
      res.values[key] = JSON.stringify(parsed);
      res.restored++;
    }
  });
  return res;
}

/* The read + extract + instrument + compile of a 19k-line script costs about as much
   as the run itself. The stress sweep executes the same file ~200 times, so cache it. */
const PREP_CACHE = new Map();
function prepare(file, removeSeed) {
  const ck = path.resolve(file) + "|" + (removeSeed ? "noseed" : "seed");
  if (PREP_CACHE.has(ck)) return PREP_CACHE.get(ck);
  let html = fs.readFileSync(file, "utf8");
  if (removeSeed) {
    html = html.replace(/<script type="application\/json" id="cdStateSeed">[\s\S]*?<\/script>/, "<!-- seed removed by harness -->");
  }
  const ex = extractInlineScript(html);
  const inst = instrument(ex.code);
  const lsPrefix = (/var\s+LS_PREFIX\s*=\s*"([^"]*)"/.exec(ex.code) || [null, "commandDeck."])[1];
  const vmScript = new vm.Script(inst.code, {
    filename: path.basename(file),
    lineOffset: ex.startLine - 1,
    columnOffset: ex.startCol
  });
  const prep = { html: html, ex: ex, inst: inst, lsPrefix: lsPrefix, vmScript: vmScript };
  PREP_CACHE.set(ck, prep);
  return prep;
}

/* --------------------------------------------------------------------- run */
async function run(cfg) {
  const t0 = Date.now();
  const file = cfg.file;
  const inject = cfg.inject || {};
  const prep = prepare(file, !!inject.removeSeed);
  const html = prep.html;
  const ex = prep.ex;
  const inst = prep.inst;
  const LS_PREFIX = prep.lsPrefix;
  const DECK_NAME = path.basename(file);

  const dom = createDom(html, {});
  const win = dom.window;
  const doc = dom.document;
  const stats = dom.stats;

  // ---- storage pre-load (store dir, then explicit injections)
  let storeInfo = null;
  if (cfg.store) {
    storeInfo = loadStore(cfg.store, { storeRaw: cfg.storeRaw });
    Object.keys(storeInfo.values).forEach(function (k) {
      win.localStorage._map.set(LS_PREFIX + k, storeInfo.values[k]);
    });
  }
  if (inject.localStorage) {
    Object.keys(inject.localStorage).forEach(function (k) {
      win.localStorage._map.set(LS_PREFIX + k, JSON.stringify(inject.localStorage[k]));
    });
  }
  if (inject.localStorageRaw) {
    Object.keys(inject.localStorageRaw).forEach(function (k) {
      win.localStorage._map.set(LS_PREFIX + k, String(inject.localStorageRaw[k]));
    });
  }
  if (Array.isArray(inject.removeKeys)) {
    inject.removeKeys.forEach(function (k) { win.localStorage._map.delete(LS_PREFIX + k); });
  }
  if (inject.quotaBytes) win.localStorage._state.quotaBytes = inject.quotaBytes;
  if (inject.setItemThrows) win.localStorage._state.throwOnSet = true;
  if (inject.getItemThrows) win.localStorage._state.throwOnGet = true;

  // ---- window.claude
  const claudeCalls = [];
  if (inject.claude === "throwing") {
    win.claude = {
      use: function (cap) { claudeCalls.push(cap); throw new Error("claude.use('" + cap + "') exploded (injected failure)"); },
      complete: function () { throw new Error("claude.complete exploded (injected failure)"); }
    };
  } else if (inject.claude === "ok") {
    win.claude = {
      use: function (cap) {
        claudeCalls.push(cap);
        if (cap === "db") {
          return Promise.resolve({
            collection: function () {
              return {
                doc: function () { return { set: function () { return Promise.resolve(); } }; },
                onSnapshot: function (cb) { try { cb({ empty: true, docChanges: function () { return []; } }); } catch (e) {} return function () {}; }
              };
            }
          });
        }
        return Promise.resolve(function () { return Promise.resolve({ text: "" }); });
      }
    };
  } else if (inject.claude === "rejecting") {
    win.claude = { use: function (cap) { claudeCalls.push(cap); return Promise.reject(new Error("permission revoked (injected)")); } };
  }

  // ---- console + timing capture
  const renderTimes = [];
  win.__cdTime = function (name, ms) { if (ms >= 1) renderTimes.push({ name: name, ms: ms }); };
  const console2 = {
    log: function () {},
    info: function () {},
    debug: function () {},
    warn: function () { stats.consoleWarn.push(Array.prototype.join.call(arguments, " ").slice(0, 400)); },
    error: function () { stats.consoleError.push(Array.prototype.join.call(arguments, " ").slice(0, 400)); },
    trace: function () {}, dir: function () {}, table: function () {},
    group: function () {}, groupEnd: function () {}, time: function () {}, timeEnd: function () {}
  };

  // ---- build the vm context
  const sandbox = win;
  sandbox.console = console2;
  sandbox.self = win;
  sandbox.top = win;
  sandbox.parent = win;
  sandbox.frames = win;
  sandbox.TextEncoder = TextEncoder;
  sandbox.TextDecoder = TextDecoder;
  sandbox.URL = URL;
  sandbox.URLSearchParams = URLSearchParams;
  sandbox.Buffer = undefined;
  sandbox.process = undefined;
  sandbox.require = undefined;
  sandbox.module = undefined;

  const context = vm.createContext(sandbox);
  vm.runInContext("this.window = this; this.globalThis = this; this.self = this;", context);
  // re-pin document after contextify
  context.document = doc;

  const exceptions = [];
  const script = prep.vmScript;

  let topLevelOk = true;
  try {
    script.runInContext(context, { timeout: cfg.scriptTimeoutMs || 120000 });
  } catch (e) {
    topLevelOk = false;
    const ln = lineOf(e && e.stack, ex.startLine, DECK_NAME);
    exceptions.push({
      where: "top-level IIFE",
      message: (e && e.message) || String(e),
      line: ln ? ln.html : null,
      scriptLine: ln ? ln.script : null,
      stack: String((e && e.stack) || "").split("\n").slice(0, 6).join(" | ")
    });
  }

  // ---- drain microtasks, then timers, then microtasks again
  const drainMicro = function () { return new Promise(function (r) { setImmediate(r); }); };
  await drainMicro(); await drainMicro();

  if (!inject.noTimers && cfg.timers > 0) {
    const seenIntervals = new Set();
    let budget = cfg.timers;
    let guard = 0;
    while (budget > 0 && guard < 40) {
      guard++;
      const batch = win._timers.splice(0, win._timers.length);
      if (!batch.length) break;
      batch.sort(function (a, b) { return (a.ms - b.ms) || (a.seq - b.seq); });
      for (const t of batch) {
        if (budget <= 0) break;
        if (win._cancelled.has(t.id)) continue;
        if (t.ms > 5000) continue;                        // long polls: never worth running
        if (t.kind === "interval") {
          if (seenIntervals.has(t.id)) continue;
          seenIntervals.add(t.id);
        }
        budget--;
        stats.timersRun++;
        try { t.fn.apply(win, t.args); }
        catch (e) {
          const ln = lineOf(e && e.stack, ex.startLine, DECK_NAME);
          exceptions.push({
            where: "timer(" + t.kind + " " + t.ms + "ms)",
            message: (e && e.message) || String(e),
            line: ln ? ln.html : null,
            scriptLine: ln ? ln.script : null,
            stack: String((e && e.stack) || "").split("\n").slice(0, 4).join(" | ")
          });
        }
      }
      await drainMicro();
    }
  }
  await drainMicro(); await drainMicro();

  // ---- collect
  const probe = context.__cdProbe || {};
  const safeRunFailures = (probe.RENDER_FAILURES || []).map(function (f) {
    const ln = lineOf(f.stack, ex.startLine, DECK_NAME);
    return {
      name: f.name,
      error: f.error,
      line: ln ? ln.html : null,
      scriptLine: ln ? ln.script : null,
      at: String(f.stack || "").split("\n").slice(1, 3).map(function (s) { return s.trim(); }).join(" | ")
    };
  });
  const containers = [];
  const anonContainers = [];
  for (const rec of stats.innerHtmlWrites.values()) {
    if (rec.id) containers.push({ id: rec.id, writes: rec.writes, lastBytes: rec.lastBytes });
    else anonContainers.push(rec);
  }
  containers.sort(function (a, b) { return a.id < b.id ? -1 : 1; });

  const allWrites = Array.from(stats.innerHtmlWrites.values())
    .map(function (r) { return { id: r.id || ("<" + r.tag + ">"), writes: r.writes, lastBytes: r.lastBytes, totalBytes: r.bytes }; })
    .sort(function (a, b) { return b.lastBytes - a.lastBytes; });

  const missingIds = Array.from(stats.missingIds.entries())
    .map(function (e) { return { id: e[0], lookups: e[1] }; })
    .sort(function (a, b) { return b.lookups - a.lookups; });

  renderTimes.sort(function (a, b) { return b.ms - a.ms; });

  const result = {
    file: path.resolve(file),
    label: cfg.label || path.basename(file),
    at: new Date().toISOString(),
    node: process.version,
    ok: topLevelOk && exceptions.length === 0 && safeRunFailures.length === 0,
    completedTopLevel: topLevelOk,
    durationMs: Date.now() - t0,
    lsPrefix: LS_PREFIX,
    scriptStartLine: ex.startLine,
    scriptLines: inst.code.split("\n").length,
    instrumentation: inst.applied,
    exceptions: exceptions,
    safeRunFailures: safeRunFailures,
    containersRendered: containers.map(function (c) { return c.id; }),
    // --dump-text: read back what named elements actually SAY after the render.
    // containersRendered only tracks innerHTML writes, so a card built with
    // textContent renders correctly and still shows up nowhere. This closes that
    // blind spot without changing any verdict.
    dumpText: (cfg.dumpText || []).reduce(function (acc, id) {
      // a plain id, or any CSS selector (so ".panel-stamp"-style elements that carry
      // no id can still be read back)
      var el = null;
      try { el = /^[A-Za-z][\w-]*$/.test(id) ? doc.getElementById(id) : doc.querySelector(id); } catch (eD) {}
      acc[id] = el ? { text: String(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 240), cls: el.className || "", href: el.getAttribute ? (el.getAttribute("href") || "") : "" } : null;
      return acc;
    }, {}),
    containerDetail: containers,
    anonymousContainerWrites: anonContainers.length,
    shapeMismatch: probe.SHAPE_MISMATCH || [],
    localStorageUnavailable: probe.LS_UNAVAILABLE === true,
    missingIds: missingIds,
    slowestRenders: renderTimes.slice(0, 15),
    largestInnerHtmlWrites: allWrites.slice(0, 12),
    totalInnerHtmlBytes: allWrites.reduce(function (a, w) { return a + w.totalBytes; }, 0),
    outputWatchDocs: (probe.OUTPUT_WATCH || []).map(function (w) { return w.doc; }),
    stats: {
      getElementByIdHits: stats.getByIdHits,
      innerHtmlWriteSites: stats.innerHtmlWrites.size,
      timersScheduled: stats.timersScheduled,
      timersRun: stats.timersRun,
      reloadsRequested: stats.reloads,
      consoleWarnings: stats.consoleWarn.length,
      consoleErrors: stats.consoleError.length,
      // A failed local save must be visible to somebody. The page reports one as
      // "[state] could not save <key> on this device: <reason>". Counting those is
      // the only way a test can tell a surfaced failure from a swallowed one —
      // container counts and the LS_UNAVAILABLE flag are identical either way.
      saveFailureWarnings: stats.consoleWarn.filter(function (m) { return /could not save/i.test(m); }).length,
      clipboardWrites: stats.clipboardWrites,
      localStorageKeys: win.localStorage._map.size,
      claudeCapabilitiesRequested: claudeCalls
    },
    consoleWarnSample: stats.consoleWarn.slice(0, 12),
    store: storeInfo ? {
      dir: path.resolve(cfg.store),
      docs: storeInfo.docs,
      restored: storeInfo.restored,
      sizeBytes: storeInfo.sizeBytes,
      parseFailures: storeInfo.parseFailures,
      missingV: storeInfo.missingV
    } : null
  };
  // hand the live context back for programmatic callers (concurrency tests)
  result._context = context;
  result._window = win;
  result._probe = probe;
  return result;
}

function summarize(r) {
  const L = [];
  L.push("── runtime harness ─ " + r.label);
  L.push("   file          : " + r.file);
  L.push("   top level     : " + (r.completedTopLevel ? "ran to completion" : "THREW — script halted"));
  L.push("   duration      : " + r.durationMs + " ms   (script lines " + r.scriptLines + ", starts at HTML line " + r.scriptStartLine + ")");
  L.push("   exceptions    : " + r.exceptions.length);
  r.exceptions.slice(0, 10).forEach(function (e) {
    L.push("      ! " + e.where + " — " + e.message + (e.line ? "  (html line " + e.line + ")" : ""));
  });
  L.push("   safeRun fails : " + r.safeRunFailures.length);
  r.safeRunFailures.slice(0, 20).forEach(function (f) {
    L.push("      x " + f.name + " — " + f.error + (f.line ? "  (html line " + f.line + ")" : ""));
  });
  L.push("   shape warns   : " + r.shapeMismatch.length +
    (r.shapeMismatch.length ? "  [" + r.shapeMismatch.slice(0, 6).map(function (m) { return m.key + ":" + m.got; }).join(", ") + "]" : ""));
  L.push("   containers    : " + r.containersRendered.length + " ids received innerHTML (" + r.stats.innerHtmlWriteSites + " write sites)");
  L.push("   missing ids   : " + r.missingIds.length + (r.missingIds.length ? "  [" + r.missingIds.slice(0, 8).map(function (m) { return m.id; }).join(", ") + "]" : ""));
  L.push("   timers        : " + r.stats.timersRun + " run / " + r.stats.timersScheduled + " scheduled   reloads requested: " + r.stats.reloadsRequested);
  if (r.store) {
    L.push("   store         : " + r.store.restored + "/" + r.store.docs + " docs restored, " +
      r.store.parseFailures.length + " parse failures, " + r.store.missingV.length + " without a v wrapper" +
      (r.store.missingV.length ? " [" + r.store.missingV.join(", ") + "]" : ""));
  }
  if (r.dumpText && Object.keys(r.dumpText).length) {
    L.push("   text dump     :");
    Object.keys(r.dumpText).forEach(function (id) {
      var d = r.dumpText[id];
      L.push("     " + id.padEnd(18) + (d ? (d.cls ? "[" + d.cls + "] " : "") + JSON.stringify(d.text) : "** NO SUCH ELEMENT **"));
    });
  }
  L.push("   verdict       : " + (r.ok ? "PASS" : (r.completedTopLevel ? "DEGRADED (page up, panels failed)" : "FAIL")));
  return L.join("\n");
}

/* --------------------------------------------------------------------- CLI */
async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.help || !a._.length) {
    console.log(fs.readFileSync(__filename, "utf8").split("/* ====")[1].split("==== */")[0]);
    process.exit(a.help ? 0 : 1);
  }
  let inject = {};
  if (a.inject) {
    const t = a.inject.trim();
    if (t[0] === "{") inject = JSON.parse(t);
    else inject = JSON.parse(fs.readFileSync(t, "utf8"));
  }
  const r = await run({
    file: a._[0], store: a.store, storeRaw: a.storeRaw, inject: inject,
    timers: a.timers, label: a.label, dumpText: a.dumpText
  });
  delete r._context; delete r._window; delete r._probe;
  if (!a.quiet) console.log(summarize(r));
  if (a.out) {
    fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
    fs.writeFileSync(a.out, JSON.stringify(r, null, 2));
    if (!a.quiet) console.log("   json          : " + path.resolve(a.out));
  }
  if (a.json) console.log(JSON.stringify(r, null, 2));
  process.exit(r.completedTopLevel ? 0 : 2);
}

module.exports = { run, summarize, extractInlineScript, loadStore };

if (require.main === module) {
  main().catch(function (e) {
    console.error("harness error: " + (e && e.stack || e));
    process.exit(3);
  });
}
