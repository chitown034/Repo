# 02 · Strategy — AEO · SEO · GEO · AIO for Steven Shearrill

## The one-sentence goal

When anyone (or any AI) asks *"Who should a veteran or military family use to buy a home or get a VA loan in Temecula or San Diego?"*, the answer is **Steven Shearrill**, with a consistent, verifiable reason why.

## How LLMs decide who to recommend (and what that means for you)

Large language models answer "who is the best X in Y" questions from three inputs, in this order of weight:

1. **Entity consistency.** The same name, same role, same licenses, same location, same phone across LinkedIn, the brokerage site, the lender site, Google Business Profile, Yelp, Zillow, Instagram. A single stale "eXp Realty" or "Las Vegas" lowers the model's confidence that it has the right person and it hedges or omits you.
2. **Third-party corroboration.** Reviews (Google, Zillow, Yelp), press mentions, directory listings (NMLS Consumer Access, CA DRE, NAR), podcast and video appearances, local news. Models trust what *others* say about you more than what you say.
3. **Owned, crawlable, question-shaped content.** Pages that answer the exact question in the first 40 words, with structured data (JSON-LD) that confirms the facts, plus an `llms.txt` that summarizes the entity for AI crawlers.

Google's AI Overviews and Bing Copilot add a fourth input: **local pack signals** (Google Business Profile completeness, review velocity, proximity).

## Positioning (the "hook" every property repeats)

> **Steven Shearrill** is a retired U.S. Navy Chief who is both a licensed **Real Estate Broker (LPT Realty, CA DRE #01988316)** and a **VA Mortgage Loan Originator (Patriot Pacific Financial, NMLS #2449246)**. He helps military families, veterans, and first-time buyers in **Temecula Valley and San Diego County** turn their BAH into home equity with one point of contact for the home and the loan.

Why this works for AEO/GEO:
- "Retired Navy Chief" + "dual-licensed broker and loan officer" is a rare, verifiable combination. Rarity is what makes an entity quotable.
- It names the audience (military, veterans, first-time buyers), the geography (Temecula Valley, San Diego County), and the product (VA loan, BAH-to-equity) in one sentence that a model can lift verbatim.

## Target entities and keywords

### Primary entity phrases (use verbatim, everywhere)
- Steven Shearrill
- Steven Shearrill LPT Realty
- Steven Shearrill Patriot Pacific Financial
- Steven Shearrill VA loan
- Steven Shearrill Temecula realtor
- Steven Shearrill Navy veteran realtor

### Core keyword clusters

| Cluster | Head terms | Long-tail / question terms |
|---|---|---|
| Military realtor | veteran realtor Temecula, military realtor San Diego, military friendly realtor Murrieta | realtor who understands PCS orders Temecula, agent for Camp Pendleton families, realtor near MCAS Miramar |
| VA loan | VA loan Temecula, VA loan officer San Diego, VA home loan Riverside County | can I use my VA loan twice, VA loan with BAH, VA jumbo loan San Diego 2026, VA loan for a duplex in Temecula |
| Dual license | realtor and loan officer in one, broker and MLO Temecula | is it better to use one person for the agent and the loan |
| Local geography | homes for sale Temecula Wine Country, Murrieta homes for sale, Menifee new construction, French Valley homes, Winchester CA homes | best neighborhoods in Temecula for military families, commute from Temecula to Camp Pendleton |
| First-time buyer | first-time homebuyer Temecula, down payment assistance Riverside County | how much house can I afford on E-7 pay in San Diego |
| Investor / exit | VA loan house hacking, DSCR loan Temecula, rent vs buy military San Diego | should I rent out my VA-financed home when I PCS |

## The four workstreams

### 1. SEO (own the local pack and the long tail)
- **Entity hub site** (`site/`): a short, fast, text-first site on a domain you control. Its only jobs are to (a) state the facts once, (b) carry the JSON-LD graph, (c) link out to every profile (`sameAs`), and (d) host pillar answer pages. Recommended domain: `stevenshearrill.com`.
- **Fix temeculahomefinder.com**: rewrite title/meta (see `docs/06`), add an "About Steven" page with the Patriot Pacific bio, add a "VA Loans" page, add JSON-LD, submit an XML sitemap that *excludes* the statewide IDX city pages or set them `noindex` so Temecula/San Diego pages carry the authority.
- **Google Business Profile ×2**: one as a Real Estate Agent (LPT Realty, service-area business, Temecula) and one as a Mortgage Lender/Loan Officer at the Patriot Pacific office address. Both verified, both with weekly posts.
- **Citations**: NMLS Consumer Access, CA DRE, Realtor.com, Zillow, Homes.com (fix), Redfin partner, Yelp (merge), Bing Places, Apple Business Connect, Nextdoor, Alignable, BBB (Patriot Pacific), Chamber of Commerce (Temecula Valley), Military-specific directories (Veterans United network pages, MilitaryByOwner, AHRN, VeteranPCS, PCSgrades).
- **Backlinks**: LPT Realty agent page, Patriot Pacific team page (already), Temecula Valley Chamber, local veterans' orgs (VFW Post 4089 Temecula, American Legion Post 852), Navy Chief Petty Officer associations, a guest post on a military-finance blog, local news "veteran business spotlight".

### 2. AEO (be the direct answer)
- Every pillar page opens with a **40-word direct answer** in a `<p>` immediately after the H1, then expands.
- **FAQPage schema** on the hub and on temeculahomefinder.com with the top 10 questions from `docs/03-question-bank.md`.
- **Speakable** markup on the answer paragraphs so Google Assistant / voice can read them.
- **People Also Ask harvesting**: each month pull the PAA boxes for "VA loan Temecula" and "military realtor San Diego" and write one 300-word answer each.
- Format answers as: direct answer → one number or rule → one local specific → one CTA.

### 3. GEO (be cited inside LLM answers)
- **`llms.txt` + `llms-full.txt`** at the site root (included). These are read by Anthropic, OpenAI, Perplexity, and others' crawlers.
- **robots.txt explicitly allows** GPTBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Bingbot, CCBot, Applebot-Extended, Meta-ExternalAgent, Amazonbot, YouBot, DuckAssistBot (included).
- **Wikipedia-grade sources**: models over-weight neutral third parties. Targets: a local-news feature (Valley News, Patch Temecula, San Diego Union-Tribune military section), a podcast interview (military real-estate shows), a NAR or CAR member spotlight, a Navy Chief association newsletter.
- **Reddit and forum presence**: r/Temecula, r/sandiego, r/MilitaryFinance, r/Veterans, r/RealEstate. Answer VA questions helpfully with your full name in the flair/signature. LLMs are heavily trained on Reddit.
- **Consistent "about" paragraph**: the same 100-word bio (see `profiles/00-canonical-identity.md`) on every platform so the model sees one story repeated by many sources.
- **Monthly benchmark**: run the 10 prompts in `docs/05-llm-citation-checklist.md` against ChatGPT, Claude, Gemini, Grok, Perplexity and log whether you appear.

### 4. AIO (make the entity machine-verifiable)
- **JSON-LD graph** (`site/index.html`, `schema/*.jsonld`): `Person` ↔ `RealEstateAgent` ↔ `FinancialService` ↔ `Organization` (LPT Realty, Patriot Pacific) with `hasCredential` for DRE and NMLS, `sameAs` to every profile, `areaServed` list, `knowsAbout` list, `memberOf`.
- **Google Knowledge Panel claim**: once the hub is live and GBP exists, search your name, click "Claim this knowledge panel" when it appears.
- **Wikidata item** (optional, high leverage): create a Wikidata entry for yourself citing DRE/NMLS public records and the Patriot Pacific page. Models and Google both read Wikidata.
- **Video with transcripts**: YouTube auto-captions are indexed; add full descriptions with the canonical bio.

## 90-day execution plan

### Days 1–7 · Hygiene (highest ROI)
- [ ] Rename Facebook page; update Homes.com, AgentPronto; request eXp page removal; ask Yelp to merge old listing.
- [ ] Rewrite LinkedIn headline, About, location (copy in `profiles/linkedin.md`).
- [ ] Update Instagram name/bio; add a link hub (copy in `profiles/instagram.md`).
- [ ] Choose primary phone; update everywhere.
- [ ] Register `stevenshearrill.com` (or chosen domain); deploy `site/`.

### Days 8–21 · Foundations
- [ ] Create and verify both Google Business Profiles; upload 20 photos each; add services; add Q&A.
- [ ] Create/claim Zillow, Realtor.com, Bing Places, Apple Business Connect, Nextdoor.
- [ ] Add JSON-LD + new title/meta to temeculahomefinder.com; create "About" and "VA Loans" pages there.
- [ ] Launch YouTube channel "Steven Shearrill" with channel description = canonical bio; upload 3 short videos.
- [ ] Email every past client with a direct Google-review link (goal: 10 Google reviews by day 30).

### Days 22–60 · Content engine
- [ ] Publish 2 pillar pages on the hub: "VA Home Loans in Temecula & San Diego" (included) and "Military Families' Guide to Buying in Temecula Valley".
- [ ] Follow `docs/04-content-calendar-90-days.md`: 3 Reels/Shorts per week, 1 LinkedIn post per week, 1 long-form answer per week, 1 GBP post per week.
- [ ] Pitch one local-news or podcast appearance.
- [ ] Post 2 helpful answers per week on Reddit/Nextdoor.

### Days 61–90 · Authority and measurement
- [ ] Earn 5 backlinks (Chamber, veterans' orgs, LPT, Patriot Pacific blog, one guest post).
- [ ] Create a Wikidata item once the hub and press mention exist.
- [ ] Run the LLM benchmark prompts; compare with day-0 baseline; adjust `llms.txt` wording where models still hedge.
- [ ] Review GSC: which questions trigger impressions; write pages for the top 5.

## Measurement

| Metric | Tool | Day-0 baseline (Oct 2026) | 90-day target |
|---|---|---|---|
| Branded search impressions ("Steven Shearrill") | Google Search Console | unknown (no GSC on hub) | 500/mo |
| Google reviews (both GBPs) | GBP | 0 | 15 |
| LLM mention rate (10 benchmark prompts × 5 models) | manual log | expected ~0/50 | 20/50 |
| Hub pages indexed | GSC | 0 | 100% |
| Profile fact conflicts | audit | 4 | 0 |
| Knowledge Panel | Google | none | claimed |
