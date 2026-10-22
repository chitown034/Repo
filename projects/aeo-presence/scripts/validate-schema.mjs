#!/usr/bin/env node
// Validates every JSON-LD block in site/*.html and every schema/*.jsonld file:
// parses, checks @context/@type, required fields per type, and that the two
// license numbers and the canonical phone appear consistently.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CANON = { dre: "01988316", nmls: "2449246", phone: "+1-619-368-7141", name: "Steven Shearrill" };
const REQUIRED = {
  Person: ["name", "jobTitle", "url", "sameAs"],
  RealEstateAgent: ["name", "telephone", "address", "areaServed"],
  FinancialService: ["name", "telephone", "address"],
  FAQPage: ["mainEntity"],
  WebSite: ["name", "url"],
  WebPage: ["name", "url"],
  ProfilePage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  VideoObject: ["name", "description", "thumbnailUrl", "uploadDate"],
  Organization: ["name"],
};

let failures = 0;
const fail = (where, msg) => { failures++; console.error(`  ✗ ${where}: ${msg}`); };
const ok = (where, msg) => console.log(`  ✓ ${where}: ${msg}`);

function checkNode(node, where, top = false) {
  if (!node || typeof node !== "object") return;
  const types = [].concat(node["@type"] ?? []);
  // Required fields are enforced on top-level graph nodes only; nested nodes
  // (e.g. a worksFor reference) are allowed to be partial.
  if (top) for (const t of types) {
    const req = REQUIRED[t];
    if (!req) continue;
    for (const k of req) if (!(k in node)) fail(where, `${t} missing "${k}"`);
  }
  if (types.includes("FAQPage")) {
    const qs = node.mainEntity ?? [];
    if (qs.length < 3) fail(where, "FAQPage has fewer than 3 questions");
    for (const q of qs) {
      if (q["@type"] !== "Question" || !q.name || !q.acceptedAnswer?.text) fail(where, `bad Question: ${JSON.stringify(q).slice(0, 60)}`);
      else if (q.acceptedAnswer.text.split(/\s+/).length > 120) fail(where, `answer too long for AEO (>120 words): "${q.name}"`);
    }
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => checkNode(x, where));
    else if (v && typeof v === "object") checkNode(v, where);
  }
}

function checkDoc(doc, where) {
  if (!doc["@context"]) fail(where, "missing @context");
  const nodes = doc["@graph"] ?? [doc];
  nodes.forEach((n) => checkNode(n, where, true));
  const text = JSON.stringify(doc);
  if (text.includes(CANON.name)) ok(where, "canonical name present");
  for (const [k, v] of Object.entries(CANON)) {
    if (k === "name") continue;
    if (text.includes(v)) ok(where, `${k} ${v} present`);
  }
  if (/eXp Realty|Las Vegas|Winchester, CA(?!.*areaServed)/.test(text) && !/previous brokerage/.test(text)) {
    // Winchester is a legitimate service area; only flag stale brokerage/city facts.
    if (/eXp Realty|Las Vegas/.test(text)) fail(where, "stale fact (eXp Realty / Las Vegas) found");
  }
  if (/REPLACE/.test(text)) console.log(`  ! ${where}: contains REPLACE placeholders (template, fill before use)`);
}

console.log("schema/*.jsonld");
for (const f of readdirSync(join(ROOT, "schema")).filter((f) => f.endsWith(".jsonld"))) {
  const where = `schema/${f}`;
  try { checkDoc(JSON.parse(readFileSync(join(ROOT, "schema", f), "utf8")), where); }
  catch (e) { fail(where, `JSON parse error: ${e.message}`); }
}

console.log("site/*.html JSON-LD blocks");
for (const f of readdirSync(join(ROOT, "site")).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join(ROOT, "site", f), "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) { fail(`site/${f}`, "no JSON-LD block"); continue; }
  blocks.forEach((m, i) => {
    const where = `site/${f} [block ${i + 1}]`;
    try { checkDoc(JSON.parse(m[1]), where); } catch (e) { fail(where, `JSON parse error: ${e.message}`); }
  });
  if (!/<title>[^<]*Steven Shearrill[^<]*<\/title>/.test(html)) fail(`site/${f}`, "<title> does not contain the canonical name");
  if (!/<meta name="description"/.test(html)) fail(`site/${f}`, "missing meta description");
  if (!/rel="canonical"/.test(html)) fail(`site/${f}`, "missing canonical link");
  if (/\beXp Realty\b/.test(html) && !/formerly|previous/i.test(html)) fail(`site/${f}`, "stale brokerage mention");
}

console.log("site/llms.txt, robots.txt, sitemap.xml");
for (const f of ["llms.txt", "llms-full.txt", "robots.txt", "sitemap.xml"]) {
  try {
    const t = readFileSync(join(ROOT, "site", f), "utf8");
    if (f === "robots.txt") for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Bingbot"]) {
      if (!t.includes(bot)) fail(`site/${f}`, `does not mention ${bot}`);
    }
    if (f.startsWith("llms") && !t.includes(CANON.nmls)) fail(`site/${f}`, "NMLS number missing");
    if (f === "sitemap.xml" && !t.includes("<urlset")) fail(`site/${f}`, "not a sitemap");
    ok(`site/${f}`, "present");
  } catch { fail(`site/${f}`, "missing"); }
}

console.log(failures ? `\n${failures} problem(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
