#!/usr/bin/env node
// The presence pulse: one zero-token command that tells the Presence Pod what to do this week.
//   node scripts/pulse.mjs            runs the gates (NAP, schema, identity drift), summarises citations, the benchmark and KPIs,
//                                     picks the week's content from the question bank, writes docs/reports/PRESENCE-PULSE.md
//                                     and data/presence-queue.json (vanessaQueue-shaped items), exit 1 if any gate fails.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseCsv, readLog, score } from "./benchmark.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const today = new Date().toISOString().slice(0, 10);
const run = (args) => { const r = spawnSync(process.execPath, args.map((a) => join(ROOT, a)), { encoding: "utf8" }); return { ok: r.status === 0, out: (r.stdout + r.stderr).trim().split("\n").slice(-3).join(" · ") }; };

// 1. gates
const gates = {
  "NAP consistency": run(["scripts/nap-consistency.mjs"]),
  "Schema validity": run(["scripts/validate-schema.mjs"]),
  "Identity → generated files": run(["scripts/build-identity.mjs", "--check"]),
};
// 2. citations
const cit = parseCsv(readFileSync(join(ROOT, "data/citations-nap.csv"), "utf8")); const ch = cit[0]; const ci = Object.fromEntries(ch.map((h, i) => [h, i]));
const citRows = cit.slice(1).filter((r) => r.length > 3).map((r) => ({ tier: r[ci.tier], dir: r[ci.directory], status: (r[ci.status] || "unknown").toLowerCase(), checked: r[ci.last_checked] || "" }));
const bucket = (s) => /live|correct|done/.test(s) && !/stale/.test(s) ? "correct" : /stale|dup|wrong|old/.test(s) ? "stale" : /not created|not found|unknown|missing|verify/.test(s) ? "missing" : "other";
const citSummary = {}; for (const r of citRows) { const b = bucket(r.status); citSummary[r.tier] ||= { correct: 0, stale: 0, missing: 0, other: 0, total: 0 }; citSummary[r.tier][b]++; citSummary[r.tier].total++; }
const staleFirst = citRows.filter((r) => bucket(r.status) === "stale").sort((a, b) => a.tier - b.tier).slice(0, 5);
const missingTier1 = citRows.filter((r) => r.tier === "1" && bucket(r.status) === "missing").slice(0, 5);
// 3. benchmark
const bench = score(readLog()); const lastM = bench.months.at(-1); const lastB = lastM ? bench.out[lastM] : null;
// 4. KPIs
const kpi = parseCsv(readFileSync(join(ROOT, "data/kpi-monthly.csv"), "utf8")); const kh = kpi[0]; const kRow = kpi.filter((r) => r.length > 3).at(-1); const kpiLast = Object.fromEntries(kh.map((h, i) => [h, kRow?.[i] ?? ""]));
// 5. this week's content: P1 questions not yet in data/content-log.csv, 3 per week
const qb = readFileSync(join(ROOT, "docs/03-question-bank.md"), "utf8");
const p1 = [...qb.matchAll(/^\| P1 \| ([^|]+?) \| ([^|]+?) \|$/gm)].map((m) => ({ q: m[1].trim(), opener: m[2].trim() }));
const logPath = join(ROOT, "data/content-log.csv"); if (!existsSync(logPath)) writeFileSync(logPath, "date,question,page_or_post,platforms,owner,status\n");
const done = new Set(parseCsv(readFileSync(logPath, "utf8")).slice(1).map((r) => (r[1] || "").trim()));
const week = p1.filter((x) => !done.has(x.q)).slice(0, 3);
// 6. queue items (vanessaQueue shape: task, priority, status, from, ref, note)
const queue = [];
for (const [g, r] of Object.entries(gates)) if (!r.ok) queue.push({ task: `Presence gate failed: ${g}`, priority: "p1", status: "pending", from: "presence-pulse", ref: `projects/aeo-presence · ${today}`, note: r.out, owner: "SEO Specialist" });
for (const r of staleFirst) queue.push({ task: `Fix stale citation: ${r.dir}`, priority: r.tier === "1" ? "p1" : "p2", status: "pending", from: "presence-pulse", ref: "data/citations-nap.csv", note: `status: ${r.status}; canonical NAP in profiles/00-canonical-identity.md; Steven edits the listing, Citation Auditor verifies next sweep`, owner: "Citation Auditor" });
for (const r of missingTier1) queue.push({ task: `Create Tier-1 listing: ${r.dir}`, priority: "p2", status: "pending", from: "presence-pulse", ref: "docs/08-local-seo-citations.md", note: "packet: name, phone, city, website, category from data/citations-nap.csv; Elena reviews account creation; Steven creates", owner: "SEO Specialist" });
for (const w of week) queue.push({ task: `Answer block this week: ${w.q}`, priority: "p3", status: "pending", from: "presence-pulse", ref: "docs/09-aeo-answer-engineering.md", note: `opener: ${w.opener} · derivatives: page/FAQ entry, Short, GBP post, Reddit answer (drafts; Alexandra gates)`, owner: "Orin" });
if (lastB) queue.push({ task: `Benchmark ${lastM}: average ${lastB.average}/2, lowest engine ${Object.entries(lastB.byEngine).filter(([, v]) => v !== null).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "—"}`, priority: "p2", status: "pending", from: "presence-pulse", ref: "docs/reports/PRESENCE-BENCHMARK.md", note: "LLM Visibility Analyst writes the next three fixes", owner: "LLM Visibility Analyst" });
else queue.push({ task: "Run the day-0 LLM benchmark (10 prompts × 5 engines)", priority: "p2", status: "pending", from: "presence-pulse", ref: "scripts/benchmark.mjs --template", note: "Steven runs the prompts in his own ChatGPT/Gemini/Grok accounts (15 min) or the analyst drives agent-browser read-only on the Mac; scores go in data/llm-benchmark-log.csv", owner: "LLM Visibility Analyst" });

mkdirSync(join(ROOT, "docs/reports"), { recursive: true });
writeFileSync(join(ROOT, "data/presence-queue.json"), JSON.stringify({ generated: today, items: queue }, null, 2) + "\n");
const fmt = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(" · ");
const md = `# Presence pulse — ${today}

Zero-token weekly read of the AEO/SEO/GEO/AIO program. Owner: Orin (Presence Pod). Items below are also in \`data/presence-queue.json\`, shaped for \`vanessaQueue\`. Drafts and packets only; Steven posts, deploys, submits and pays.

## Gates
${Object.entries(gates).map(([g, r]) => `- ${r.ok ? "PASS" : "FAIL"} ${g} — ${r.out}`).join("\n")}

## Citations (\`data/citations-nap.csv\`)
${Object.entries(citSummary).sort().map(([t, s]) => `- Tier ${t}: ${fmt(s)}`).join("\n")}
${staleFirst.length ? `\nStale first: ${staleFirst.map((r) => r.dir).join("; ")}` : ""}

## LLM benchmark
${lastB ? `- ${lastM}: average ${lastB.average}/2 over ${lastB.cells} cells · by engine ${fmt(lastB.byEngine)}` : "- No scored month yet (day-0 run pending)"}

## KPIs (last row of \`data/kpi-monthly.csv\`)
- ${fmt(kpiLast)}

## This week's answer blocks (from the P1 question bank, not yet logged in \`data/content-log.csv\`)
${week.map((w) => `- ${w.q}`).join("\n") || "- all P1 questions logged; move to P2"}

## Queue (${queue.length} items)
${queue.map((q) => `- [${q.priority}] ${q.task} — ${q.owner}`).join("\n")}
`;
writeFileSync(join(ROOT, "docs/reports/PRESENCE-PULSE.md"), md);
console.log(md);
const failed = Object.values(gates).some((r) => !r.ok); process.exit(failed ? 1 : 0);
