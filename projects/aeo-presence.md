# Project — AEO / SEO / GEO / AIO presence kit

**What.** The kit that makes Steven the entity Google, Bing and the large language models (ChatGPT, Claude, Gemini,
Grok, Perplexity, Copilot, Meta AI) resolve to for "veteran-focused realtor / VA loan officer in Temecula or San
Diego". It lives in `projects/aeo-presence/`: the audit of every public profile, the strategy and 90-day plan, 140+
real questions mapped to quotable answers, a content calendar, the LLM-citation checklist, copy for eleven platforms,
JSON-LD, a static entity site with `llms.txt`, and (since 2026-10-22) the deep layer: technical SEO spec, the full
citation list, answer engineering per engine, the GEO mechanics (Wikidata, Reddit, earned mentions, benchmark),
twelve page briefs, measurement and RACI, the marketing-claims compliance page, three new site pages, and the
machine-readable logs under `data/`.

**Owner.** Sofia (CMO); **Orin** (GEO / AEO Lead, `geo-aeo-optimizer`) runs it day to day with the Presence Pod
(SEO Specialist, Delia, Gareth, Derek, Alexandra; Elena on domains and accounts) — `wiki/ai-team/org-chart.md`.
**Gate.** Alexandra reviews every public line (`docs/13-compliance-marketing-claims.md`), then Steven posts, deploys,
submits or pays. Drafts and packets only until both say yes. Nothing has been posted, pasted or deployed.

## Map of the kit

| Path | What it holds |
|---|---|
| `README.md` | Quick start in priority order; facts policy |
| `docs/01-presence-audit.md` | Every property found (12 Oct, plus the 24 Sep playbook findings): conflicts, scores |
| `docs/02-strategy.md` | How LLMs decide; positioning; keyword clusters; four workstreams; 90-day plan; metrics |
| `docs/03-question-bank.md` | 140+ questions with ≤40-word answer openers, by priority |
| `docs/04-content-calendar-90-days.md` | Week-by-week posting plan |
| `docs/05-llm-citation-checklist.md` | Per-engine sources; checklist; the 10 benchmark prompts |
| `docs/06-schema-for-existing-sites.md` | Paste-ready title/meta/JSON-LD for temeculahomefinder.com and patriotpacific.com |
| `docs/07-technical-seo-spec.md` | Domains, IDX index control, URL architecture, on-page template, CWV, GSC/Bing/IndexNow/GA4, security |
| `docs/08-local-seo-citations.md` | Canonical NAP, 40 directories in three tiers, GBP rhythm, review engine, backlinks, never-do list |
| `docs/09-aeo-answer-engineering.md` | What each answer surface extracts; the answer block; harvesting; snippet types; 10 ready answers |
| `docs/10-geo-llm-playbook.md` | How recommendations form; engine mechanics; llms.txt; Wikidata spec; Reddit; earned mentions; benchmark; failure modes |
| `docs/11-content-pillars-and-briefs.md` | Twelve pages with briefs (3 built) |
| `docs/12-measurement-and-governance.md` | KPIs with targets, rituals, RACI, HALT list, monthly report format |
| `docs/13-compliance-marketing-claims.md` | The five hold items resolved or proposed; Reg Z, UDAAP, DRE, NAR, fair housing, dual capacity, TCPA rules; checklist |
| `profiles/` | Canonical identity (NAP, bios, retired identifiers, disclosure lines) + 10 platform files |
| `schema/` | Person, RealEstateAgent, FinancialService, FAQ, Video JSON-LD |
| `site/` | Entity page, VA loans pillar, military families' guide, link hub, `llms.txt`, `llms-full.txt`, `robots.txt`, sitemap, humans, security.txt |
| `data/` | `llm-benchmark-log.csv`, `citations-nap.csv`, `kpi-monthly.csv`, `geo-activity-log.csv`, `compliance-log.csv` |
| `scripts/` | `validate-schema.mjs` (JSON-LD + required fields + stale facts), `nap-consistency.mjs` (one name/phone/city everywhere) |

Related, earlier: the Claude Doc *Steven Shearrill — VA Brand, GEO & Google Playbook* (2026-09-24,
https://claude.ai/artifact/5SKAbJcoQzGG98fMoy865A) holds the competitor research, the Scotsman Guide angle, the
HMDA chart and the asset audit; the kit does not repeat it. Where the two differ on copy, the kit's
`profiles/00-canonical-identity.md` is the current wording.

## Status (2026-10-22)

| Item | State |
|---|---|
| Kit written | 2026-10-12 from Steven's public pages; deepened 2026-10-22 (docs 07–13, three site pages, data logs, NAP script) |
| On the main line | 2026-10-22, held draft; branch `claude/tender-feynman-mw4cm1` carries the deep layer |
| Checks | `node projects/aeo-presence/scripts/validate-schema.mjs` and `node projects/aeo-presence/scripts/nap-consistency.mjs`: both pass (2026-10-22) |
| Compliance hold | Items 2–5 fixed in the files; item 1 (Reg Z "no down payment") proposed as non-triggering per comment 24(c)-2 — Alexandra to confirm (`docs/13`) |
| Deployed / profiles updated | No |
| Org chart | Orin (GEO / AEO Lead) under Sofia on the deck and in the wiki; Presence Pod added 2026-10-22 |
| 6D Brain | rebuilt 2026-10-22 with this page, the pod and the lane words |

## Facts the kit states that the brain did not hold (confirm with Steven, then add the confirmed ones to `context/about-me.md`)

Personal NMLS #2449246 (Instagram bio, Patriot Pacific page) · LPT Realty, Inc. DRE #02248983, designated broker
Molly Winkle (temeculahomefinder.com footer) · real estate licensed 2015, broker July 2024, MLO 2024 (Patriot
Pacific bio, LinkedIn) · mobile (619) 368-7141 and an unlabeled (877) 366-2213 on the contact page · Patriot Pacific
office 41923 Second St, Suite 203, Temecula 92590 (NC Secretary of State filing; VERIFY as the office to publish) ·
an existing YouTube channel still named "Steven Shearrill eXp Realty", the X handle @exp_steven and the Chamber
listing's old site MyTemeculaRealEstateConcierge.com (24 Sep playbook) · `about-me.md` adds MLO licensing in CA, NV,
AZ, FL, IL and the public brand thevaloanmastermind.com (not found by search on 2026-10-22; VERIFY what is live
there — the kit's `docs/07` says how to fold it into one canonical hub).

## Next step

1. Alexandra: confirm item 1 of the hold and initial `data/compliance-log.csv`.
2. Steven: answer the facts list; pick the primary phone; say which domain is the hub.
3. Orin + SEO Specialist: run the kit's README quick start in order (NAP conflicts first; `data/citations-nap.csv`
   is the tracker), then the day-0 LLM benchmark into `data/llm-benchmark-log.csv`.
4. Derek: deploy packet for `site/` (Cloudflare Pages or Netlify), GSC + Bing + IndexNow; Elena reviews the
   registrar and DNS steps first.
