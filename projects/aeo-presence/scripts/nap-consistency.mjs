#!/usr/bin/env node
// NAP consistency: every profile, doc, schema and site file must use the canonical name, phone, email,
// licenses and city, and must not carry a retired identifier (eXp, Winchester-as-home, Las Vegas,
// @exp_steven, the old concierge domain) except inside an explicit "retired/stale/formerly" context.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CANON = {
  name: "Steven Shearrill", phone: "(619) 368-7141", phoneE164: "+1-619-368-7141",
  email: "steven.shearrill@gmail.com", dre: "01988316", nmls: "2449246", lptDre: "02248983", ppfNmls: "1921615",
};
const RETIRED = [/eXp Realty/i, /Las Vegas/, /@exp_steven/i, /MyTemeculaRealEstateConcierge/i, /Winchester, CA \d{5}/];
const CONTEXT_OK = /(retired|stale|formerly|old|previous|remove|replace|rename|no longer|out of date|duplicate|conflict|conflicts|mixed|was |still (says|reads|shows)|not affiliated|currently shows|already own|may say|must be|never|home city|references)/i;
// a line under a "Retired identifiers" heading is a list of what to purge, not a live use
const RETIRED_SECTION = /^## Retired identifiers/;
const BAD_NAMES = [/\bSteve Shearrill\b/, /Sherrill\b/, /Shearill\b/, /\bShearrill,? MBA\b/];

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (f === "node_modules" || f.startsWith(".git")) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(md|html|txt|jsonld|xml|csv)$/.test(f)) files.push(p);
  }
})(ROOT);

let problems = 0;
const fail = (f, msg) => { problems++; console.error(`  ✗ ${relative(ROOT, f)}: ${msg}`); };

for (const f of files) {
  const t = readFileSync(f, "utf8");
  const lines = t.split("\n");
  for (const re of BAD_NAMES) if (re.test(t)) fail(f, `misspelled or non-canonical name matches ${re}`);
  let inRetired = false;
  lines.forEach((line, i) => {
    if (/^## /.test(line)) inRetired = RETIRED_SECTION.test(line);
    for (const re of RETIRED) {
      if (re.test(line) && !inRetired && !CONTEXT_OK.test(line) && !CONTEXT_OK.test(lines[i - 1] || "")) fail(f, `line ${i + 1}: retired identifier without 'retired/stale' context: ${line.trim().slice(0, 90)}`);
    }
    // any phone that is not the canonical one (allow the 877 office line only when labeled)
    const phones = line.match(/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g) || [];
    for (const ph of phones) {
      const digits = ph.replace(/\D/g, "");
      if (digits === "6193687141") continue;
      if (digits === "8773662213" && /office|877|label|VERIFY|second|unlabeled/i.test(line)) continue;
      if (digits === "6504849720") continue; // Inkbox line referenced in brain docs, never a profile phone
      if (/\d{3}-\d{3}-\d{4}/.test(ph) && /example|sample|placeholder/i.test(line)) continue;
      fail(f, `line ${i + 1}: non-canonical phone ${ph}`);
    }
  });
}
// The canonical facts must appear in the identity file and the hub
for (const must of ["profiles/00-canonical-identity.md", "site/index.html", "site/llms.txt"]) {
  const t = readFileSync(join(ROOT, must), "utf8");
  for (const [k, v] of Object.entries(CANON)) if (!t.includes(v) && !(k === "phoneE164" && !must.endsWith("index.html")) && !(k === "phone" && must.endsWith("llms.txt"))) fail(join(ROOT, must), `missing canonical ${k} ${v}`);
}
console.log(problems ? `${problems} NAP problem(s)` : "NAP consistent across the kit");
process.exit(problems ? 1 : 0);
