#!/usr/bin/env node
"use strict";
/* ============================================================================
   make-backup.js — build the dated backup bundle for the Command Deck.

     node make-backup.js [--deck <html>] [--store <dir>] [--out <dir>]

   Produces  <out>/state/<doc>.json   (every exported DB document, byte-for-byte)
             <out>/command-deck.html  (the deck file that was tested)
             <out>/manifest.json      (sha256 + size per file, doc count, totals)

   Every file is re-read and re-hashed AFTER it is written, so the manifest
   describes what is actually on disk rather than what was intended.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }

function makeBundle(opts) {
  const deck = path.resolve(opts.deck);
  const store = path.resolve(opts.store);
  const outDir = path.resolve(opts.outDir);
  const stateOut = path.join(outDir, "state");
  fs.mkdirSync(stateOut, { recursive: true });

  const files = [];
  const verifyFailures = [];
  let docCount = 0, docBytes = 0, missingV = [], parseFailures = [];

  // --- documents
  fs.readdirSync(store).filter(function (f) { return f.endsWith(".json"); }).sort().forEach(function (f) {
    const src = path.join(store, f);
    const dst = path.join(stateOut, f);
    const buf = fs.readFileSync(src);
    fs.writeFileSync(dst, buf);
    const back = fs.readFileSync(dst);
    const h = sha256(back);
    if (h !== sha256(buf)) verifyFailures.push("hash mismatch after write: state/" + f);
    let parsed = null;
    try { parsed = JSON.parse(back.toString("utf8")); }
    catch (e) { parseFailures.push({ doc: f, error: e.message }); }
    if (parsed !== null && !(parsed && typeof parsed === "object" && !Array.isArray(parsed) &&
      Object.prototype.hasOwnProperty.call(parsed, "v"))) missingV.push(f.replace(/\.json$/, ""));
    docCount++; docBytes += back.length;
    files.push({ path: "state/" + f, bytes: back.length, sha256: h });
  });

  // --- the deck itself
  const deckBuf = fs.readFileSync(deck);
  const deckDst = path.join(outDir, "command-deck.html");
  fs.writeFileSync(deckDst, deckBuf);
  const deckBack = fs.readFileSync(deckDst);
  if (sha256(deckBack) !== sha256(deckBuf)) verifyFailures.push("hash mismatch after write: command-deck.html");
  files.push({ path: "command-deck.html", bytes: deckBack.length, sha256: sha256(deckBack) });

  const totalBytes = files.reduce(function (a, f) { return a + f.bytes; }, 0);
  const manifest = {
    bundle: path.basename(outDir),
    createdAt: new Date().toISOString(),
    createdBy: "E7 — Stress Test Engineer · tests/make-backup.js",
    spec: "Steven's backup spec: Documents/AI-Ecosystem-Backups/YYYY-MM-DD, every Sunday 00:00 local, rolling 8 weeks, integrity check, auto-retry once, escalate after two failures, log every run. This bundle is the scratchpad rehearsal of that spec for the command-deck store only.",
    scope: {
      store: store,
      collection: "state",
      deck: deck,
      note: "One artifact store only (command-deck `state`). The ISA Portal store and the Claude Desktop config are NOT in this bundle — they are part of the ai-ecosystem-backup skill's scope, not this harness's."
    },
    docCount: docCount,
    docBytes: docBytes,
    fileCount: files.length,
    totalBytes: totalBytes,
    docsWithoutVWrapper: missingV,
    parseFailures: parseFailures,
    integrity: {
      method: "sha256 per file, recomputed from disk after write",
      verifyFailures: verifyFailures,
      pass: verifyFailures.length === 0 && parseFailures.length === 0
    },
    files: files
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  return {
    dir: outDir, docCount: docCount, fileCount: files.length, totalBytes: totalBytes,
    docBytes: docBytes, missingV: missingV, parseFailures: parseFailures,
    verifyFailures: verifyFailures, manifest: path.join(outDir, "manifest.json")
  };
}

module.exports = { makeBundle, sha256 };

if (require.main === module) {
  const a = process.argv.slice(2);
  const get = function (flag, dflt) { const i = a.indexOf(flag); return i === -1 ? dflt : a[i + 1]; };
  const here = __dirname;
  const res = makeBundle({
    deck: get("--deck", path.join(here, "..", "deck", "command-deck.html")),
    store: get("--store", path.join(here, "..", "db", "state")),
    outDir: get("--out", path.join(here, "..", "backup", "2026-09-22"))
  });
  console.log("bundle: " + res.dir);
  console.log("  docs        : " + res.docCount);
  console.log("  files       : " + res.fileCount);
  console.log("  total bytes : " + res.totalBytes + " (" + (res.totalBytes / 1024 / 1024).toFixed(2) + " MB)");
  console.log("  no-v docs   : " + (res.missingV.join(", ") || "none"));
  console.log("  integrity   : " + (res.verifyFailures.length ? "FAIL — " + res.verifyFailures.join("; ") : "pass"));
}
