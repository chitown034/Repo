#!/usr/bin/env node
"use strict";
/* ============================================================================
   write-reports.js — render tests/stress-report.md from tests/stress-report.json.

     node write-reports.js [report.json] [out.md]

   Kept separate from stress-sweep.js so the write-up can be regenerated without
   re-running a 20-minute sweep.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const IN = process.argv[2] || path.join(HERE, "stress-report.json");
const OUT = process.argv[3] || path.join(HERE, "stress-report.md");

function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " "); }

function build(report) {
  const rows = report.rows || [];
  const detail = report.detail || {};
  const summary = report.summary || {};
  const md = [];

  md.push("# Command Deck — Stress Test Report");
  md.push("");
  md.push("**Engineer:** E7 — Stress Test Engineer · **Cycle:** " + (report.cycle || "Loop Cycle 6 · 2026-09-22") + " · **Run:** " + report.generatedAt);
  md.push("**Baseline 2026-09-12 · verified 2026-09-22**");
  md.push("");
  md.push("| | |");
  md.push("| --- | --- |");
  md.push("| Deck under test | `" + path.basename(report.deck || "") + "` |");
  md.push("| sha256 | `" + String(report.deckSha256 || "").slice(0, 32) + "…` |");
  md.push("| Lines | " + (report.deckLines || "—") + " |");
  md.push("| Provenance | " + (report.deckProvenance || "—") + " |");
  md.push("| Harness | `tests/runtime-harness.js` + `tests/dom-shim.js` (pure Node, no npm, no jsdom) · Node " + (report.node || "") + " |");
  md.push("| Result | **" + (summary.pass || 0) + " Pass · " + (summary.degraded || 0) + " Degraded · " + (summary.fail || 0) + " Fail** of " + (summary.total || rows.length) + " tests |");
  md.push("");

  md.push("## What these numbers are, and what they are not");
  md.push("");
  md.push("The harness executes the deck's inline script under a **DOM shim written in JavaScript**, not in a browser.");
  md.push("It proves, exactly: that the script reaches its last line; which container ids receive `innerHTML`; which");
  md.push("`$()` targets have no element; which renderer throws on which document shape, with the function name and the");
  md.push("line; and the relative cost of each render.");
  md.push("");
  md.push("`node harness-selftest.js` proves the harness is doing that job: it rebuilds the 2026-09-03 regression (a");
  md.push("function still called but no longer defined — the exact bug `node --check` and `quickcheck.py` both wave");
  md.push("through), and the harness catches it as `updateHeaderClock is not defined @ html:18204`, with only 195 of");
  md.push("318 containers rendered before the halt. 6 of 6 self-tests pass.");
  md.push("");
  md.push("It does **not** prove layout, CSS, real clipboard / speech / canvas behaviour, cross-origin fetches, or the");
  md.push("real artifact `db` capability (`window.claude` is absent unless a test injects it). **Treat every millisecond");
  md.push("below as a relative, worst-case figure, not a browser measurement** — `querySelectorAll` and `innerHTML`");
  md.push("parsing are native in a browser and are plain JavaScript here, so shim-side work inflates them. What the");
  md.push("numbers are good for is comparison: baseline vs. load, and one render against another in the same run.");
  md.push("");
  md.push("`Fix Applied` and `Re-test Result` are deliberately empty / Pending: **E7 does not edit the deck.** Nothing in");
  md.push("this table is marked Resolved on the strength of a fix — only on the strength of a test that passed.");
  md.push("");

  md.push("## Results");
  md.push("");
  md.push("| Capability | Test Type | Result | Weakness Found | Engineer Assigned | Fix Applied | Re-test Result | Status |");
  md.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  rows.forEach(function (r) {
    md.push("| " + [esc(r.capability), esc(r.testType), esc(r.result), esc(r.weakness || "—"),
      esc(r.engineer || "—"), "—", esc(r.retest || "Pending"), esc(r.status)].join(" | ") + " |");
  });
  md.push("");

  md.push("## Weakness dossier — for the Reliability / Efficiency / Capability / Integration Engineers");
  md.push("");
  md.push("Line numbers are lines of the pinned baseline (`tests/baseline-5fbe844.html`, identical to");
  md.push("`deck/command-deck.html` at git commit 5fbe844); the inline script starts at line " +
    ((detail.baseline && detail.baseline.scriptStartLine) || 6635) + ".");
  md.push("");
  const dossier = rows.filter(function (r) { return r.weakness; });
  if (!dossier.length) md.push("_No weaknesses found in this run._");
  dossier.forEach(function (r, i) {
    md.push("**W" + (i + 1) + " · " + r.capability + "** — *" + r.testType + " / " + r.result + " / " + (r.engineer || "unassigned") + "*  ");
    md.push(r.weakness + "  ");
    md.push("*Evidence:* " + (r.evidence || "—"));
    md.push("");
  });

  // --- section digests
  if (detail.baseline) {
    md.push("## Baseline digest");
    md.push("");
    md.push("- Ran to completion in **" + detail.baseline.durationMs + " ms**, **" + detail.baseline.containers +
      " container ids** received innerHTML, **" + (detail.baseline.exceptions || []).length + " exceptions**, **" +
      (detail.baseline.safeRunFailures || []).length + " safeRun failures**, **" + (detail.baseline.shapeMismatch || []).length + " shape warnings**.");
    md.push("- `document.getElementById` was called " + (detail.baseline.stats ? detail.baseline.stats.getElementByIdHits : "?") +
      " times and missed " + (detail.baseline.missingIds || []).length + " distinct ids.");
    md.push("- Slowest renders (shim time): " + (detail.baseline.slowestRenders || []).slice(0, 6).map(function (s) { return "`" + s.name + "` " + s.ms + " ms"; }).join(" · "));
    md.push("- Timers: " + (detail.baseline.stats ? detail.baseline.stats.timersRun + " of " + detail.baseline.stats.timersScheduled + " drained" : "—") + ".");
    md.push("");
  }
  if (detail.volume) {
    md.push("## Volume digest");
    md.push("");
    md.push("| Payload | Bytes | Page time | vs baseline | Slowest render | Largest single innerHTML write |");
    md.push("| --- | --- | --- | --- | --- | --- |");
    detail.volume.forEach(function (v) {
      const big = (v.largestInnerHtmlWrites || [])[0];
      md.push("| " + esc(v.case) + " | " + (v.payloadBytes / 1024).toFixed(0) + " KB | " + v.durationMs + " ms | " +
        (v.deltaVsBaselineMs >= 0 ? "+" : "") + v.deltaVsBaselineMs + " ms | " +
        ((v.slowestRenders || [])[0] ? "`" + v.slowestRenders[0].name + "` " + v.slowestRenders[0].ms + " ms" : "—") + " | " +
        (big ? (big.lastBytes / 1024).toFixed(0) + " KB → `#" + big.id + "`" : "—") + " |");
    });
    if (detail.volumeCombined) {
      md.push("| **all four at once** | " + (detail.volumeCombined.payloadBytes / 1024).toFixed(0) + " KB | " +
        detail.volumeCombined.durationMs + " ms | — | " +
        ((detail.volumeCombined.slowestRenders || [])[0] ? "`" + detail.volumeCombined.slowestRenders[0].name + "` " + detail.volumeCombined.slowestRenders[0].ms + " ms" : "—") + " | — |");
    }
    md.push("");
  }
  if (detail.edge) {
    md.push("## Edge digest — 7 malformed shapes per document");
    md.push("");
    md.push("Variants: `null` · `[]` · `{}` · `\"string\"` · wrong-typed fields · a row that is a number · truncated JSON.");
    md.push("`guarded` means `lsGetSeeded` caught the shape and fell back to the seed with a recorded SHAPE_MISMATCH;");
    md.push("`throw` means the value reached a renderer and `safeRun` had to catch it, blanking that panel.");
    md.push("");
    md.push("| Document | In the 2026-09-22 export | Variants that threw | Function(s) reached |");
    md.push("| --- | --- | --- | --- |");
    detail.edge.forEach(function (e) {
      const thrown = e.variants.filter(function (v) { return v.throws.length; });
      const fns = {};
      thrown.forEach(function (v) { v.throws.forEach(function (t) { fns["`" + t.fn + "` @ html:" + t.htmlLine] = 1; }); });
      md.push("| `" + e.doc + "` | " + (e.inExport ? "yes" : "**no — never written**") + " | " +
        (thrown.length ? thrown.length + "/7 (" + thrown.map(function (v) { return v.variant; }).join(", ") + ")" : "0/7") + " | " +
        (Object.keys(fns).join(" · ") || "—") + " |");
    });
    md.push("");
  }
  if (detail.failureInjection) {
    md.push("## Failure-injection digest");
    md.push("");
    md.push("| Injected failure | Page | Containers | LS_UNAVAILABLE raised | Shape warnings | Console warnings |");
    md.push("| --- | --- | --- | --- | --- | --- |");
    detail.failureInjection.forEach(function (f) {
      md.push("| " + esc(f.case) + " | " + (f.verdict === "Fail" ? "**HALTED**" : "ran to completion") + " | " +
        (f.honest ? f.honest.containers : "?") + " | " + (f.honest ? f.honest.lsUnavailableFlag : "?") + " | " +
        (f.honest ? f.honest.shapeMismatchReported : "?") + " | " + (f.honest ? f.honest.consoleWarnings : "?") + " |");
    });
    md.push("");
  }
  if (detail.concurrency) {
    md.push("## Concurrency digest");
    md.push("");
    md.push("| Mode | Burst | Apply | Replay | changed on replay | Keys rewritten on replay | isaLine stored / expected | ID'd lost | id-less dropped | Order-independent |");
    md.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    Object.keys(detail.concurrency).forEach(function (mode) {
      const c = detail.concurrency[mode];
      md.push("| " + mode + " | " + c.burstSize + " changes | " + c.firstApplyMs + " ms | " + c.replayApplyMs + " ms | " +
        c.changedOnReplay + " | " + (c.keysThatChangedOnReplay || []).length + " | " + c.isaMessagesStored + " / " + c.isaExpectedIfNothingLost +
        " | " + (c.isaIdsLost || []).length + " | " + c.isaMessagesWithoutIdDropped + " | " + c.isaOrderIndependent + " |");
    });
    md.push("");
    md.push("The burst is " + (detail.concurrency[Object.keys(detail.concurrency)[0]] || {}).burstSize +
      " document changes replayed through `applyRemoteSnapshot` — every exported document plus TWO CONFLICTING `isaLine` arrays");
    md.push("in the same snapshot (40 messages from each side, each side also sending one message with no `id`).");
    md.push("\"expected\" = what the document would hold if nothing were lost: what it already held, plus every message in the burst.");
    md.push("");
  }
  if (detail.restoreTest) {
    const rt = detail.restoreTest;
    md.push("## Backup / recovery digest");
    md.push("");
    md.push("- Restored **" + rt.docsRestored + " of " + rt.docs + "** exported documents (" + (rt.sizeBytes / 1024).toFixed(0) +
      " KB) into the shim's localStorage under `" + rt.lsPrefix + "`, then ran the page.");
    md.push("- Parse failures: **" + (rt.parseFailures || []).length + "** · documents with no `v` wrapper: **" +
      (rt.missingV || []).length + (rt.missingV && rt.missingV.length ? " (" + rt.missingV.join(", ") + ")" : "") + "**");
    md.push("- All **" + rt.outputWatchDocs + "** OUTPUT_WATCH documents are read by `outputWatchRows()`; **" +
      (rt.outputWatchDocsMissingFromExport || []).length + "** of them do not exist in the export" +
      ((rt.outputWatchDocsMissingFromExport || []).length ? " (" + rt.outputWatchDocsMissingFromExport.join(", ") + ")" : "") + ".");
    md.push("- Containers rendered from the restored store: **" + rt.containersRendered + "** (seed-only baseline: " +
      ((detail.baseline && detail.baseline.containers) || "?") + "); lost vs seed-only: " +
      (rt.containersLostVsSeedOnly || []).length + "; gained: " + (rt.containersGainedVsSeedOnly || []).length +
      ((rt.containersGainedVsSeedOnly || []).length ? " (" + rt.containersGainedVsSeedOnly.join(", ") + ")" : "") + ".");
    md.push("- **Verdict: " + rt.verdict + "** — written to `backup/restore-test.json`.");
    if (detail.backupBundle) {
      const b = detail.backupBundle;
      md.push("- Bundle: `backup/2026-09-22/` — " + b.docCount + " documents + the deck, " + b.fileCount + " files, " +
        (b.totalBytes / 1024 / 1024).toFixed(2) + " MB, sha256 per file recomputed from disk after write, " +
        b.verifyFailures.length + " integrity failures.");
    }
    md.push("");
  }
  if (detail.drift && detail.drift.length) {
    md.push("## Drift check — the files this cycle is editing (point in time)");
    md.push("");
    md.push("Snapshots taken while seven engineers were still editing, so these are advisory, not a gate.");
    md.push("");
    md.push("| File | sha256 | Page | Containers (Δ vs baseline) | New safeRun failures | New dead ids |");
    md.push("| --- | --- | --- | --- | --- | --- |");
    detail.drift.forEach(function (d) {
      if (d.identicalToBaseline) {
        md.push("| `" + d.label + "` | `" + d.sha256.slice(0, 12) + "` | identical to baseline — not re-run | — | — | — |");
        return;
      }
      if (d.error) {
        md.push("| `" + d.label + "` | `" + d.sha256.slice(0, 12) + "` | **harness could not run** | — | " + esc(d.error.slice(0, 120)) + " | — |");
        return;
      }
      md.push("| `" + d.label + "` | `" + d.sha256.slice(0, 12) + "` | " + (d.completed ? "ran to completion" : "**HALTED**") +
        " | " + d.containers + " (" + (d.containersVsBaseline >= 0 ? "+" : "") + d.containersVsBaseline + ") | " +
        ((d.newSafeRunFailures || []).map(function (f) { return "`" + f.name + "` " + f.error + " @ html:" + f.line; }).join("; ") || "none") + " | " +
        ((d.newMissingIds || []).join(", ") || "none") + " |");
    });
    md.push("");
  }

  md.push("## How to rerun");
  md.push("");
  md.push("```bash");
  md.push("cd scratchpad/tests");
  md.push("");
  md.push("# 1. one file, end to end — exit 0 = the script reached its last line, exit 2 = it halted");
  md.push("node runtime-harness.js ../deck/command-deck.html");
  md.push("node runtime-harness.js ../wt-e5-life/command-deck.html --out /tmp/e5.json");
  md.push("");
  md.push("# 2. with every live document restored into localStorage");
  md.push("node runtime-harness.js ../deck/command-deck.html --store ../db/state");
  md.push("");
  md.push("# 3. failure injection (inline JSON or a file path)");
  md.push("node runtime-harness.js ../deck/command-deck.html --inject '{\"claude\":\"throwing\"}'");
  md.push("node runtime-harness.js ../deck/command-deck.html --inject '{\"setItemThrows\":true}'");
  md.push("node runtime-harness.js ../deck/command-deck.html --inject '{\"removeSeed\":true}'");
  md.push("node runtime-harness.js ../deck/command-deck.html --inject '{\"localStorage\":{\"liveFeeds\":{\"feeds\":{\"aiNewsList\":{\"citations\":{\"not\":\"an array\"}}}}}}'");
  md.push("");
  md.push("# 4. the whole sweep (~20 min under load; writes this report, the findings input and the backup bundle)");
  md.push("node stress-sweep.js baseline-5fbe844.html      # pinned 5fbe844 — reproduces this report exactly");
  md.push("node stress-sweep.js                            # whatever ../deck/command-deck.html holds now");
  md.push("");
  md.push("# 5. prove the harness still catches the bug it exists for (6 self-tests)");
  md.push("node harness-selftest.js");
  md.push("");
  md.push("# 6. regenerate just the write-ups / the backup bundle");
  md.push("node write-reports.js");
  md.push("node make-findings.js            # -> ../audit/findings-E7.json");
  md.push("node make-backup.js              # -> ../backup/2026-09-22/{state,command-deck.html,manifest.json}");
  md.push("```");
  md.push("");
  return md.join("\n");
}

/* The integrator seeds a `stressTestReport` document into the live store (BRIEF §4).
   Emit it in the doc's own {v:...} wrapper so it can be dropped in without reshaping. */
function buildDoc(report) {
  return {
    v: {
      ranAt: report.generatedAt,
      by: report.engineer,
      cycle: report.cycle,
      deck: path.basename(report.deck || ""),
      deckSha256: report.deckSha256,
      harness: "tests/runtime-harness.js (pure-Node DOM shim, no jsdom)",
      summary: report.summary,
      rows: (report.rows || []).map(function (r) {
        return {
          capability: r.capability, testType: r.testType, result: r.result,
          weakness: r.weakness, engineer: r.engineer, fixApplied: r.fixApplied,
          retest: r.retest, status: r.status
        };
      })
    }
  };
}

module.exports = { build, buildDoc };

if (require.main === module) {
  const report = JSON.parse(fs.readFileSync(IN, "utf8"));
  fs.writeFileSync(OUT, build(report));
  const docOut = path.join(path.dirname(OUT), "stressTestReport.doc.json");
  fs.writeFileSync(docOut, JSON.stringify(buildDoc(report), null, 2));
  console.log("wrote " + OUT + " (" + fs.statSync(OUT).size + " bytes, " +
    (report.rows || []).length + " rows)");
  console.log("wrote " + docOut + " (stressTestReport doc seed for the integrator)");
}
