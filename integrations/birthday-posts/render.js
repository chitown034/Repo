#!/usr/bin/env node
/**
 * render.js — turn one birthday job into a 1080x1080 PNG with the bundled template.
 *
 *   node render.js job.json            job = {name, photo|null, out, brand?}
 *   node render.js --name "Jane Doe" --photo path.jpg --out out/jane.png
 *
 * Uses the Playwright Chromium that is already installed (cloud sessions, the Mac after
 * `npx playwright install chromium`). No network: fonts, photo and logos are read from disk
 * and inlined as data URIs, so the same job renders identically anywhere.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const HERE = __dirname;

function parseArgs(argv) {
  if (argv.length === 1 && !argv[0].startsWith("--")) {
    const job = JSON.parse(fs.readFileSync(argv[0], "utf8"));
    job._dir = path.dirname(path.resolve(argv[0]));
    return job;
  }
  const job = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i].replace(/^--/, "");
    job[k] = argv[i + 1];
  }
  return job;
}

function dataUri(p, mimeHint) {
  if (!p) return null;
  const abs = path.isAbsolute(p) ? p : path.resolve(HERE, p);
  if (!fs.existsSync(abs)) return null;
  const ext = path.extname(abs).toLowerCase();
  const mime = mimeHint || { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
    ".svg": "image/svg+xml", ".ttf": "font/ttf", ".otf": "font/otf", ".woff2": "font/woff2" }[ext] || "application/octet-stream";
  return `data:${mime};base64,${fs.readFileSync(abs).toString("base64")}`;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Deterministic confetti so two renders of the same job are byte-for-byte identical.
function stars(seed) {
  let s = seed >>> 0 || 1;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const out = [];
  for (let i = 0; i < 120; i++) {
    const x = Math.round(rnd() * 1080), y = Math.round(60 + rnd() * 600), r = rnd();
    const size = 6 + Math.round(rnd() * 18), rot = Math.round(rnd() * 360), op = (0.35 + rnd() * 0.55).toFixed(2);
    if (r < 0.55) out.push(`<use href="#st" x="${x}" y="${y}" width="${size}" height="${size}" fill="url(#g)" opacity="${op}" transform="rotate(${rot} ${x + size / 2} ${y + size / 2})"/>`);
    else if (r < 0.8) out.push(`<circle cx="${x}" cy="${y}" r="${Math.max(2, size / 5)}" fill="#c9962b" opacity="${op}"/>`);
    else out.push(`<rect x="${x}" y="${y}" width="${size * 2}" height="6" rx="3" fill="url(#g)" opacity="${op}" transform="rotate(${rot} ${x} ${y})"/>`);
  }
  return out.join("\n    ");
}

function brandBlock(side, brand, logoUri) {
  if (logoUri) return `<div class="block"><img src="${logoUri}" alt=""></div>`;
  if (side === "left") return `<div class="block"><div class="who">${esc(brand.name)}</div><div class="lines"><div>${esc(brand.line1)}</div></div></div>`;
  return `<div class="block"><div class="lines"><div>${esc(brand.line2)}</div></div></div>`;
}

function buildHtml(job, brand) {
  const tpl = fs.readFileSync(path.join(HERE, "template.html"), "utf8");
  const name = String(job.name || "").trim();
  const nameClass = name.length > 26 ? "verylong" : name.length > 18 ? "long" : "";
  const photoRel = job.photo === undefined ? brand.default_photo : job.photo;
  const photoAbs = photoRel && !path.isAbsolute(photoRel) && job._dir && fs.existsSync(path.resolve(job._dir, photoRel))
    ? path.resolve(job._dir, photoRel) : photoRel;
  const photo = dataUri(photoAbs);
  let seed = 7;
  for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rep = {
    FONT_SCRIPT: dataUri(brand.fonts.script), FONT_NAME: dataUri(brand.fonts.name),
    FONT_BODY: dataUri(brand.fonts.body), FONT_BODY_BOLD: dataUri(brand.fonts.body_bold),
    BG_TOP: brand.colors.bg_top, BG_BOTTOM: brand.colors.bg_bottom, GOLD: brand.colors.gold,
    BLACK: brand.colors.black, BAND: brand.colors.band, INK: brand.colors.ink,
    STARS: stars(seed), NAME: esc(name), NAME_CLASS: nameClass,
    PHOTO_SRC: photo || "", PHOTO_CLASS: photo ? "" : "empty",
    BRAND_LEFT: brandBlock("left", brand, dataUri(brand.logo_left)),
    BRAND_RIGHT: brandBlock("right", brand, dataUri(brand.logo_right)),
  };
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in rep ? rep[k] : ""));
}

async function render(job) {
  const brand = JSON.parse(fs.readFileSync(path.resolve(HERE, job.brand || "brand.json"), "utf8"));
  const html = buildHtml(job, brand);
  const out = path.resolve(job._dir || process.cwd(), job.out || `${(job.name || "card").replace(/[^\w.-]+/g, "_")}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (process.env.BIRTHDAY_HTML_ONLY) { fs.writeFileSync(out.replace(/\.png$/, ".html"), html); return out; }
  const { chromium } = require("playwright");
  const launch = {};
  if (process.env.PLAYWRIGHT_CHROMIUM) launch.executablePath = process.env.PLAYWRIGHT_CHROMIUM;
  if (process.getuid && process.getuid() === 0) launch.args = ["--no-sandbox"];
  const browser = await chromium.launch(launch);
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: 1080, height: 1080 } });
  } finally {
    await browser.close();
  }
  return out;
}

if (require.main === module) {
  const job = parseArgs(process.argv.slice(2));
  if (!job.name) { console.error("usage: node render.js job.json | --name NAME [--photo FILE] [--out FILE]"); process.exit(2); }
  render(job).then(p => { console.log(p); }).catch(e => { console.error(e && e.stack || e); process.exit(1); });
}

module.exports = { buildHtml, render, stars };
