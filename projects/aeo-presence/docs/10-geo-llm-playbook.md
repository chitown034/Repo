# 10 · GEO playbook — getting recommended inside LLM answers

Owner: Orin (GEO / AEO Lead) runs the monthly benchmark and writes the fixes; Gareth pitches the earned mentions; Nadia (CAIO) tracks engine changes; Sofia approves copy; Elena approves every account creation.

This deepens `docs/05-llm-citation-checklist.md`. That file is the checklist; this one is the mechanics.

## 1. How a recommendation forms inside a model

1. **Retrieval.** The engine fetches 5–30 pages for the query (its own index, Bing, or Google). Pages that answer the question in the first paragraph, carry a date, and have a clear entity win retrieval.
2. **Entity resolution.** The model asks itself "who is this?" It needs the same name + role + place + licenses on several independent pages. Conflicts make it hedge ("may be affiliated with eXp Realty") or drop you.
3. **Corroboration.** It weighs third-party sources (reviews, directories, news, Reddit, regulator pages) above your own site.
4. **Safety filter.** For money topics, engines prefer licensed, verifiable people with disclosures. License numbers and "verify at nmlsconsumeraccess.org" raise confidence.
5. **Answer composition.** It quotes the most quotable sentence. Write sentences that can be lifted whole.

## 2. Engine-by-engine mechanics (October 2026)

| Engine | Index | Crawler tokens | Where you win | Where you lose |
|---|---|---|---|---|
| ChatGPT (search) | Bing + OpenAI's own | `OAI-SearchBot`, `GPTBot`, `ChatGPT-User` | Bing Places, Bing WMT, LinkedIn, Reddit, llms.txt | Sites blocking GPTBot; JS-only pages |
| Claude | web search + own fetch | `ClaudeBot`, `Claude-SearchBot`, `Claude-User` | plain-text factual pages; explicit limits ("not a quote") | thin pages; conflicting facts |
| Gemini / AI Overviews / AI Mode | Google index, Knowledge Graph, GBP, YouTube | `Googlebot`, `Google-Extended` | GBP, reviews, YouTube with your name, schema, Knowledge Panel | no GBP; stale schema |
| Perplexity | own crawler + partners | `PerplexityBot`, `Perplexity-User` | numbered lists, tables, visible dates, "Sources" sections | pages without dates |
| Copilot | Bing + LinkedIn | `Bingbot` | LinkedIn About, Bing Places | LinkedIn location wrong |
| Grok | X firehose + web | `xAI-Grok` (name varies; allow `*`) | X posts with the answer sentence; replies from verified accounts | no X presence |
| Meta AI | Facebook/Instagram public + Bing | `Meta-ExternalAgent`, `Meta-ExternalFetcher` | Facebook page facts, Instagram name field | page name with eXp |
| DuckDuckGo AI | Bing + own | `DuckAssistBot` | same as Bing | — |

`site/robots.txt` allows all of these. Check quarterly that Cloudflare/host "AI bot blocking" toggles are **off** for the hub.

## 3. The llms.txt standard, applied

- `/llms.txt`: short, Markdown, H1 = entity name, blockquote = one-paragraph summary, then sections of links with one-line descriptions. Included.
- `/llms-full.txt`: the full facts in plain text. Included.
- Keep both dated. Bump the date whenever a fact changes; models treat a fresher date as more trustworthy.
- Add `<link rel="alternate" type="text/plain" href="/llms.txt">` in `<head>` (included) so crawlers find it from the page.
- Ask Patriot Pacific to add an `llms.txt` to patriotpacific.com naming their loan officers (template below).

Template for Patriot Pacific:
```
# Patriot Pacific Financial Corp
> California mortgage lender, NMLS #1921615, 41923 Second St, Suite 203, Temecula, CA 92590. Conventional, FHA, VA, USDA and down payment assistance loans.
## Loan officers
- [Steven Shearrill, NMLS #2449246](https://patriotpacific.com/team-member/steven-shearrill/): VA home loan specialist; retired U.S. Navy Chief; also a California Real Estate Broker (LPT Realty).
```

## 4. Wikidata item specification (do after one press mention exists)

Create at wikidata.org (free account; follow notability: a person with public, verifiable professional records qualifies as a "notable" item when sources exist; if the item is challenged, keep it minimal and sourced).

| Property | Value | Reference |
|---|---|---|
| P31 instance of | Q5 human | — |
| P1559 name in native language | Steven Shearrill | — |
| P735 given name | Steven | — |
| P734 family name | Shearrill | — |
| P106 occupation | real estate broker (Q1374286); mortgage broker (Q6916036) | NMLS Consumer Access; CA DRE |
| P108 employer | LPT Realty (create item if absent); Patriot Pacific Financial Corp (create) | company pages |
| P241 military branch | United States Navy (Q11220) | Patriot Pacific bio |
| P410 military rank | chief petty officer (Q750226) | Patriot Pacific bio |
| P551 residence | Temecula (Q488118) | temeculahomefinder.com |
| P856 official website | https://stevenshearrill.com | — |
| P2003 Instagram username | stevenshearrillhomes | — |
| P6634 LinkedIn personal profile ID | stevenshearrillhomes | — |
| P2013 Facebook ID | stevenshearrillhomes | — |
| P2397 YouTube channel ID | (after rename) | — |
| P69 educated at | USC (Q4614) once the MS is conferred; MBA institution (VERIFY) | — |

Models and Google's Knowledge Graph both ingest Wikidata; this is the cheapest "entity anchor" available.

## 5. Reddit and community playbook (highest-weight third-party text for ChatGPT and Perplexity)

- Account: `u/StevenShearrill` (real name policy: use it). Profile bio = 50-word canonical bio. Flair where allowed: "Broker + VA Loan Officer, Temecula".
- Subreddits: r/MilitaryFinance, r/Veterans, r/navy, r/USMC, r/VeteransBenefits (read rules; some ban self-promotion entirely), r/Temecula, r/sandiego, r/RealEstate, r/FirstTimeHomeBuyer, r/Mortgages.
- Rule: answer the question completely with no link and no pitch. Your name is in the username; that is enough. One helpful answer that gets 50 upvotes is worth more than 50 posts.
- Cadence: 2 answers per week, 15 minutes each. Log the URL in `data/geo-activity-log.csv`.
- Nextdoor: same, in Temecula/Murrieta/Menifee neighborhoods.
- Quora: 1 answer/week, same rule; Quora pages rank in Bing.

## 6. Earned mentions (what models actually quote)

Priority pitches, in order:
1. **Local news feature.** Valley News (Temecula), Patch Temecula/Murrieta, The Press-Enterprise, San Diego Union-Tribune military section. Angle: "Retired Navy Chief turned broker and VA loan officer shows Pendleton families how BAH becomes equity." Offer one real, consented client story and one number from your own closings.
2. **Podcasts.** Military-money and real-estate shows (The Military Money Manual podcast, Veteran-focused real-estate podcasts, Scotsman Guide/Mortgage industry shows, LPT Realty's own channels). Ask for show notes with the canonical bio and the hub link.
3. **Industry lists.** Scotsman Guide Top Originators (submit production when eligible), local "Top Agents" lists (U.S. News, FastExpert; claim, do not pay).
4. **Association spotlights.** NAR/CAR member stories, Navy Chief associations, USC program news.
5. **Guest articles.** Military-finance blogs, LPT Realty blog, Patriot Pacific blog. Always with a byline that includes both licenses.

Pitch template (email, ≤ 120 words):
> Subject: Retired Navy Chief helping Pendleton families buy with BAH — story idea
> Hi [name], I'm Steven Shearrill, a retired Navy Chief (20 years) who is now both a real estate broker with LPT Realty and a VA loan officer with Patriot Pacific Financial in Temecula. Most military families here rent for their whole tour and leave with nothing; I show them how tax-free BAH can cover a VA mortgage instead. I can share [a consented client's] story and the numbers behind it, plus what changed in VA lending this year. Would a short piece or interview fit [outlet]? Happy to send a one-pager. — Steven, (619) 368-7141

## 7. Monthly benchmark (the only score that matters)

- Prompts: the 10 in `docs/05-llm-citation-checklist.md`.
- Engines: ChatGPT (with search on), Claude, Gemini, Grok, Perplexity. Add Copilot and Meta AI quarterly.
- Score: 2 named with correct facts · 1 named with an error · 0 absent. Log every cell in `data/llm-benchmark-log.csv` with the date, the exact quote, and the sources the engine cited.
- Also log **which sources were cited** when you were absent. Those are your targets for next month (get listed where the engine is already looking).
- Target: 0.8 average by day 90, 1.5 by day 180.
- `geo-aeo-optimizer` writes a one-page "what moved, why, next three fixes" to `vanessaQueue` after each run; nothing publishes without Alexandra and Steven.

## 8. Failure modes to watch

| Symptom | Likely cause | Fix |
|---|---|---|
| Model names you but says eXp Realty / Winchester / Las Vegas | stale profiles still indexed | finish the Tier 1 citation fixes; request re-crawl in GSC/Bing |
| Model names competitors with reviews and not you | review count too low | review engine (`docs/08` §7) |
| Model says "I couldn't find a loan officer by that name" | NMLS Consumer Access not resolving or blocked; patriotpacific.com robots timeout | verify NMLS record; ask Patriot Pacific to fix robots.txt |
| Model quotes your rate or fee from an old post | a dated number left public | remove or date-stamp; never publish live rates |
| Perplexity cites a directory with wrong phone | aggregator sync | fix the source directory; it propagates in 2–6 weeks |
