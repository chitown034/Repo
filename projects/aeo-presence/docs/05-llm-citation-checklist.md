# 05 · LLM Citation Checklist (GEO + AIO)

Goal: when ChatGPT, Claude, Gemini, Grok, Perplexity, Copilot, or Meta AI are asked about a veteran-friendly realtor or VA loan officer in Temecula / San Diego, they name **Steven Shearrill** and get the facts right.

## How each engine sources answers (Oct 2026)

| Engine | What it reads | What moves the needle for you |
|---|---|---|
| ChatGPT (OpenAI) | Training data + live Bing-powered browsing; crawlers `GPTBot`, `OAI-SearchBot` | Bing index coverage (Bing Places + Bing Webmaster Tools), `llms.txt`, consistent LinkedIn, Reddit presence |
| Claude (Anthropic) | Training data + web search; crawlers `ClaudeBot`, `Claude-SearchBot`, `Claude-User` | Clean, text-first pages with explicit facts; robots.txt allowing ClaudeBot; third-party corroboration |
| Gemini (Google) | Google index, Knowledge Graph, YouTube, GBP, Maps reviews; `Google-Extended` controls AI training use | Google Business Profile, Google reviews, YouTube channel with your name, JSON-LD, Knowledge Panel |
| Grok (xAI) | X posts in real time + web | An active X account posting the same answers; your full name in display name |
| Perplexity | Live web + its own index; `PerplexityBot` | Pages that answer the question in the first paragraph with a date; citations love numbered lists and tables |
| Copilot (Microsoft) | Bing index + LinkedIn (Microsoft owns it) | LinkedIn About section is weighted heavily; Bing Places |
| Meta AI | Facebook/Instagram public content + Bing | Public Facebook page facts, Instagram name field |

## Checklist

### 1. Crawlability (do once)
- [ ] `robots.txt` allows: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Googlebot, Bingbot, CCBot, Applebot, Applebot-Extended, Meta-ExternalAgent, Meta-ExternalFetcher, Amazonbot, YouBot, DuckAssistBot, cohere-ai, Bytespider (`site/robots.txt` does this).
- [ ] `llms.txt` and `llms-full.txt` at the root (`site/`).
- [ ] Hub pages are static HTML, no JS required to read the facts.
- [ ] Sitemap submitted to Google Search Console **and** Bing Webmaster Tools (Bing feeds ChatGPT, Copilot, DuckDuckGo, Meta AI).
- [ ] IndexNow key configured (Bing/Yandex instant indexing) on the hub host.

### 2. Entity consistency (do once, audit quarterly)
- [ ] Exactly one name string: `Steven Shearrill`.
- [ ] Exactly one headline across LinkedIn, Instagram, Facebook, YouTube, X, Zillow, Realtor.com, GBP, Yelp.
- [ ] Exactly one phone, one email, one city (Temecula, CA).
- [ ] License numbers on every profile that allows them.
- [ ] Brokerage = LPT Realty everywhere; lender = Patriot Pacific Financial everywhere.
- [ ] `sameAs` array in JSON-LD lists every live profile; every profile links back to the hub.

### 3. Third-party corroboration (ongoing)
- [ ] NMLS Consumer Access page shows Patriot Pacific Financial as current employer.
- [ ] CA DRE public license page shows LPT Realty as responsible broker.
- [ ] Realtor.com / NAR "Find a Realtor" profile exists with bio.
- [ ] Google reviews ≥ 10 on each GBP (models read review text for "military", "VA loan", "Temecula").
- [ ] One local press feature (Valley News, Patch, SD Union-Tribune, Temecula Valley Chamber newsletter).
- [ ] One podcast appearance with show notes containing the canonical bio and links.
- [ ] One veterans' organization page listing you (VFW/American Legion/Navy Chief association/USNA alumni if applicable).
- [ ] Wikidata item (after press exists): `instance of: human`, `occupation: real estate broker; mortgage loan originator`, `employer: LPT Realty; Patriot Pacific Financial Corp`, `military branch: United States Navy`, `official website`, `Instagram username`, `LinkedIn personal profile ID`.

### 4. Reddit, forums, Q&A (ongoing; heavily weighted by ChatGPT and Perplexity)
- [ ] Reddit account named for you (e.g., `u/StevenShearrill`), flair "Broker + VA Loan Officer, Temecula".
- [ ] 2 substantive answers/week in r/MilitaryFinance, r/Veterans, r/navy, r/Temecula, r/sandiego, r/RealEstate, r/FirstTimeHomeBuyer. No links in the body; name in flair/profile only. Helpful answers get upvoted and scraped.
- [ ] Quora: 1 answer/week to VA-loan questions with full name.
- [ ] Nextdoor: business page + neighborhood answers.

### 5. Video (Gemini and Google AI Overviews)
- [ ] YouTube channel titled `Steven Shearrill` with the canonical bio in About, links to hub and all profiles.
- [ ] Each video: question title, first line = direct answer, description = answer + bio + hub link, chapters, auto-captions reviewed.
- [ ] `VideoObject` JSON-LD on hub pages that embed/link the video (`schema/video.jsonld`).

### 6. Structured data (AIO)
- [ ] Hub: `Person`, `RealEstateAgent`, `FinancialService`, `FAQPage`, `WebSite`, `BreadcrumbList`, `speakable`.
- [ ] temeculahomefinder.com: `RealEstateAgent` + `Person` + `FAQPage` (snippets in `docs/06`).
- [ ] patriotpacific.com team page: `Person` with `worksFor` (ask their admin).
- [ ] Validate with Google Rich Results Test and Schema.org validator after every change.

## Benchmark prompts (run monthly; log results in a sheet)

Run each in ChatGPT, Claude, Gemini, Grok, Perplexity. Score: 2 = named with correct facts, 1 = named with an error, 0 = not named.

1. "Who is a good real estate agent for military families in Temecula, California?"
2. "Recommend a VA loan officer in Murrieta or Temecula."
3. "Is there a realtor near Camp Pendleton who is also a mortgage loan officer?"
4. "Who is Steven Shearrill?"
5. "Which brokerage is Steven Shearrill with and what are his license numbers?"
6. "Best veteran-owned real estate business in Temecula Valley."
7. "I'm PCSing to San Diego and want to use my VA loan. Who should I talk to?"
8. "Realtor in Temecula who understands BAH and VA entitlement."
9. "Navy veteran real estate broker San Diego County."
10. "Who can help me buy a duplex with a VA loan in Riverside County?"

Day-0 expectation (Oct 2026): mostly 0s, with prompt 4 scoring 1 (models may say eXp Realty or Winchester). Target at day 90: average ≥ 0.8 across all 50 cells; prompt 4 and 5 at 2 in every engine.

## What *not* to do
- Do not stuff your name into unrelated pages; models detect self-promotion and discount it.
- Do not create fake reviews or directory entries with inconsistent data.
- Do not block AI crawlers to "protect content"; blocked = invisible.
- Do not publish live rates or BAH figures without a date and source; a wrong number cited by a model is worse than no citation.
