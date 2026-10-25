# 12 · Measurement, governance, and who does what

## 1. KPIs (logged monthly in `data/kpi-monthly.csv`)

| KPI | Source | Baseline (Oct 2026) | 90-day target | 180-day target |
|---|---|---|---|---|
| Branded impressions ("steven shearrill" + variants) | GSC | unknown (no GSC on hub) | 500/mo | 1,500/mo |
| Non-branded impressions on target queries (VA loan Temecula, military realtor Temecula, etc.) | GSC | unknown | 5,000/mo | 20,000/mo |
| Hub pages indexed | GSC | 0 | 100% | 100% |
| Google reviews (sum of both GBPs) | GBP | 0 | 15 | 40 |
| Zillow reviews | Zillow | 0 (VERIFY) | 5 | 15 |
| LLM benchmark score (10 prompts × 5 engines, 0–2) | `data/llm-benchmark-log.csv` | ~0 | 0.8 avg | 1.5 avg |
| Entity conflicts live | audit | 4 | 0 | 0 |
| Citations with correct NAP (Tier 1+2) | `data/citations-nap.csv` | ~5 | 28 | 40 |
| Earned mentions (news, podcast, association) | log | 0 since 2018 | 2 | 6 |
| Calls/texts attributed to search + AI | GA4 events + "how did you find me" | unknown | tracked | +20% q/q |
| Knowledge Panel | Google | none | claimed | claimed |

## 2. Rituals

| Cadence | Ritual | Seat |
|---|---|---|
| Daily (weekdays) | Review replies, GBP Q&A, social replies drafted | Delia, Tariq (drafts) → Steven |
| Weekly | Content week from `docs/04`; Reddit/Nextdoor answers; citation sweep (3 directories) | Sofia, Orin, SEO Specialist |
| Weekly (Mon) | `scripts/pulse.mjs` (free, CI) → queue; citation sweep of 8 listings; three answer blocks | Orin, Citation Auditor, SEO Specialist |
| Monthly | LLM benchmark (`scripts/benchmark.mjs`); GSC top queries; PageSpeed; KPI row | LLM Visibility Analyst, SEO Specialist, Derek |
| Quarterly | Refresh pillar dates and numbers; llms.txt bump; re-run audit (`docs/01`); check AI crawler access | Sofia, Derek |
| Annually (January) | FHFA limits, BAH tables, VA funding fee table updated on every page | Harrison |

## 3. RACI

| Work | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Positioning, bios, copy | Sofia, Elise (`mktg-brand-strategist`) | Sofia | Alexandra | Vanessa |
| Answer blocks, FAQ, identity file, weekly pulse | Orin (`geo-aeo-optimizer`, GEO / AEO Lead) | Sofia | Harrison (loan facts) | Nadia |
| Monthly LLM visibility benchmark and the next three fixes | LLM Visibility Analyst (`llm-visibility-analyst`, under Orin) | Orin | Nadia (engine changes) | Sofia |
| Technical SEO, hub deploy, schema, GSC/Bing/IndexNow | SEO Specialist (`seo-specialist`) | Derek | Elena | Sofia |
| Citations and directory sweep (read-only, weekly) | Citation Auditor (`citation-auditor`, under SEO Specialist) | Sofia | Alexandra (ad rules) | Victor |
| Review requests, responses, GBP hygiene | Delia (`mktg-reputation-manager`), Sphere Nurture Coordinator | Victor | Alexandra | Sofia |
| Press and podcast pitches | Gareth (`mktg-pr-media-relations`) | Sofia | Alexandra | Steven |
| Reddit/Nextdoor/Quora answers (drafts) | Orin | Sofia | Harrison | — |
| Video scripts and descriptions; social derivatives | Rico (`mktg-video-producer`), Tariq (`mktg-social-media-manager`) | Sofia | Alexandra | — |
| Domain, DNS, registrar, account creation | Derek | Elena | — | Steven |
| Engine-change watch (new crawlers, policy changes) | Nadia, Disruption Scout | Nadia | Orin | Sofia |
| Compliance review of every public line | Alexandra | Alexandra | — | Steven |
| Publish, post, submit, pay | **Steven** | Steven | — | — |

## 4. HALT list for this project

Nothing in this kit is published by an agent. These are Steven's actions, each prepared as a packet:
post or edit a public profile · deploy the hub · submit a sitemap or verification · create an account · request a review · send a pitch · pay for a domain, listing or tool · state a rate, fee, APR or eligibility · anything with a client's name or photo.

## 5. Monthly report format (one page to `vanessaQueue`)

1. Score: LLM benchmark average and the three cells that changed most.
2. Search: branded and non-branded impressions, top 5 new queries.
3. Reviews: count added, average, one quote.
4. Fixes shipped (links) and fixes blocked (what Steven must do).
5. Next three fixes, ranked by expected lift.
