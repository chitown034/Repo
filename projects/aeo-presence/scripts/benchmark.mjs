#!/usr/bin/env node
// Monthly LLM visibility benchmark, zero tokens.
//   --template YYYY-MM   append the 50 blank cells (10 prompts × 5 engines) for a month to data/llm-benchmark-log.csv
//   --score              print the score matrix per month, engine averages, prompt averages, and the delta vs the prior month;
//                        write docs/reports/PRESENCE-BENCHMARK.md (relative to the kit) and return the latest month's average
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const LOG = join(ROOT, "data/llm-benchmark-log.csv");
export const ENGINES = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity"];
export const PROMPTS = [
  "Who is a good real estate agent for military families in Temecula, California?",
  "Recommend a VA loan officer in Murrieta or Temecula.",
  "Is there a realtor near Camp Pendleton who is also a mortgage loan officer?",
  "Who is Steven Shearrill?",
  "Which brokerage is Steven Shearrill with and what are his license numbers?",
  "Best veteran-owned real estate business in Temecula Valley.",
  "I'm PCSing to San Diego and want to use my VA loan. Who should I talk to?",
  "Realtor in Temecula who understands BAH and VA entitlement.",
  "Navy veteran real estate broker San Diego County.",
  "Who can help me buy a duplex with a VA loan in Riverside County?",
];

export function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const esc = (s) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;

export function readLog() {
  const rows = parseCsv(readFileSync(LOG, "utf8"));
  const head = rows[0]; const idx = Object.fromEntries(head.map((h, i) => [h, i]));
  return rows.slice(1).filter((r) => r.length > 2).map((r) => ({ date: r[idx.date], engine: r[idx.engine], prompt_id: +r[idx.prompt_id], score: r[idx.score_0_2] === "" ? null : +r[idx.score_0_2], sources: r[idx.sources_cited] || "", named_as: r[idx.named_as] || "" }));
}

export function score(entries) {
  const byMonth = {};
  for (const e of entries) { if (e.score === null || Number.isNaN(e.score)) continue; const m = e.date.slice(0, 7); (byMonth[m] ||= []).push(e); }
  const months = Object.keys(byMonth).sort();
  const out = {};
  for (const m of months) {
    const es = byMonth[m]; const avg = (xs) => xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2) : null;
    out[m] = {
      cells: es.length, average: avg(es.map((e) => e.score)),
      byEngine: Object.fromEntries(ENGINES.map((en) => [en, avg(es.filter((e) => e.engine === en).map((e) => e.score))])),
      byPrompt: Object.fromEntries(PROMPTS.map((_, i) => [i + 1, avg(es.filter((e) => e.prompt_id === i + 1).map((e) => e.score))])),
      zeros: es.filter((e) => e.score === 0).length, twos: es.filter((e) => e.score === 2).length,
      sourcesWhenAbsent: Object.entries(es.filter((e) => e.score === 0 && e.sources).flatMap((e) => e.sources.split(/[;|]/).map((s) => s.trim()).filter(Boolean)).reduce((acc, s) => (acc[s] = (acc[s] || 0) + 1, acc), {})).sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }
  return { months, out };
}

function report({ months, out }) {
  const last = months.at(-1), prev = months.at(-2);
  const L = out[last], P = prev ? out[prev] : null;
  const d = (a, b) => (a === null || b === null || b === undefined) ? "" : ` (${a - b >= 0 ? "+" : ""}${(a - b).toFixed(2)})`;
  let md = `# Presence benchmark — LLM visibility\n\nScore 2 = named with correct facts · 1 = named with an error · 0 = absent. Ten prompts × five engines, run monthly by the LLM Visibility Analyst; log: \`data/llm-benchmark-log.csv\`.\n\n`;
  if (!last) return md + "No scored cells yet. Run `node scripts/benchmark.mjs --template YYYY-MM`, fill the cells, then `--score`.\n";
  md += `## ${last}: average **${L.average}** / 2${P ? d(L.average, P.average) + ` vs ${prev}` : ""} · ${L.cells} cells scored · ${L.twos} full hits · ${L.zeros} absences\n\n`;
  md += `| Engine | ${last}${P ? ` | ${prev}` : ""} |\n|---|---|${P ? "---|" : ""}\n` + ENGINES.map((en) => `| ${en} | ${L.byEngine[en] ?? "—"}${P ? ` | ${P.byEngine[en] ?? "—"}` : ""} |`).join("\n") + "\n\n";
  md += `| # | Prompt | ${last}${P ? ` | ${prev}` : ""} |\n|---|---|---|${P ? "---|" : ""}\n` + PROMPTS.map((p, i) => `| ${i + 1} | ${p} | ${L.byPrompt[i + 1] ?? "—"}${P ? ` | ${P.byPrompt[i + 1] ?? "—"}` : ""} |`).join("\n") + "\n\n";
  if (L.sourcesWhenAbsent.length) md += `## Sources the engines cited when Steven was absent (next citation targets)\n\n` + L.sourcesWhenAbsent.map(([s, n]) => `- ${s} (${n})`).join("\n") + "\n\n";
  md += `## Next three fixes\n\nFilled by the LLM Visibility Analyst from the lowest engine, the lowest prompt and the top absent-source above; each becomes one \`vanessaQueue\` item (drafts only).\n`;
  return md;
}

const args = process.argv.slice(2);
if (args[0] === "--template") {
  const month = args[1]; if (!/^\d{4}-\d{2}$/.test(month || "")) { console.error("usage: benchmark.mjs --template YYYY-MM"); process.exit(2); }
  const existing = readLog().filter((e) => e.date.startsWith(month)); if (existing.length) { console.error(`${month} already has ${existing.length} rows`); process.exit(1); }
  const date = `${month}-01`; let n = 0;
  for (const en of ENGINES) for (let i = 0; i < PROMPTS.length; i++) { appendFileSync(LOG, `${date},${en},${i + 1},${esc(PROMPTS[i])},,,,,,\n`); n++; }
  console.log(`appended ${n} blank cells for ${month}; fill score_0_2 (and named_as, quote, sources_cited) then run --score`);
} else if (args[0] === "--score" || args.length === 0) {
  const s = score(readLog()); const md = report(s);
  mkdirSync(join(ROOT, "docs/reports"), { recursive: true }); writeFileSync(join(ROOT, "docs/reports/PRESENCE-BENCHMARK.md"), md);
  console.log(md.split("\n").slice(0, 6).join("\n")); console.log("wrote docs/reports/PRESENCE-BENCHMARK.md");
}
