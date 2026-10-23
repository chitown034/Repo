# AI-search visibility — being found by ChatGPT, Perplexity, Gemini, Google AI (AEO · GEO · SEO), as of 2026-10-23

Steven's ask (2026-10-23): "AEO, AIO, GEO, SEO optimizations of me on the internet". Owner: **Sofia (CMO)** drafts and
audits; **Alexandra** reviews any page with a licence, rate or client statement; **Steven** signs in, verifies and posts.
Researched 2026-10-23 by web search (vendor data ±10 points; one source per claim is in the brain's research log).

## Why this order

- 86% of AI citations come from brand-managed sources; ChatGPT leans on third-party listings (49%), Gemini on
  websites (52%), forums about 2% for local intent (Yext, 6.8M citations, Oct 2025).
- Google needs no special markup for AI Overviews / AI Mode; AI-feature traffic shows in Search Console under "Web".
- Specialty queries ("VA loan officer who is also a realtor, San Diego") name a specific agent 87% of the time; 91.5%
  of ranked agents got zero AI citations in a 37,500-query audit (Aug 2026). **The VA / military niche is the lever.**

Legend: **S** = Steven (sign-in, verification, licensed act) · **AI** = Sofia drafts or audits · **S+AI** = AI drafts, Steven posts.

## Tier 1 — listings and reviews (highest impact, cheapest)

1. **Google Business Profile** — one profile; primary "Real estate agent", secondary "Mortgage broker"; service area =
   the SoCal cities he actually serves; services list (VA purchase, VA IRRRL, FHA, conventional, listing, buyer rep);
   a Post every week; ten seeded VA questions in Q&A. **S** verify and own · **AI** descriptions, posts, Q&A, monthly audit.
   Benchmarks from loan-officer guides: 50+ reviews, review velocity over star count, 90 days of steady posting.
2. **Reviews, compliant** — day-10 ask after every close (the `review-request` skill): Google first, then Zillow; ask the
   client to mention the city, VA/military and what he did (geography + specifics are what AI cites). **No incentive of
   any kind** (Google policy; FTC Consumer Review Rule, ~$53k per violation); never gate or filter negatives. **S** sends.
3. **Portal profiles, identical everywhere** — Zillow (agent + lender/NMLS), Realtor.com, Homes.com, LinkedIn, Yelp
   (in ~80% of ChatGPT local answers), Bing Places. Same name, brokerage, phone, address and bio wording. **S** claims ·
   **AI** keeps the canonical bio (`context/about-me.md`) and runs a quarterly NAP check.
4. **NMLS Consumer Access** — name, employer (Patriot Pacific Financial), licence states current; link to it from the
   site and LinkedIn. **S** (NMLS login) · **AI** check.

## Tier 2 — his own site (the Gemini / Google lever)

5. **Entity page** — `/about` as a `ProfilePage` whose `mainEntity` is a `Person` (jobTitle, worksFor → LPT Realty +
   Patriot Pacific Financial, identifier NMLS 1921615 and the DRE number, knowsAbout VA loans, areaServed, `sameAs` →
   GBP, Zillow, LinkedIn, YouTube, NMLS, DRE lookup), plus a `RealEstateAgent` node and a `MortgageBroker` node linked
   by `@id`. Markup must match the visible text. **AI** writes and validates the JSON-LD · **S** publishes.
6. **Niche answer pages + FAQPage** — 10 to 15 pages that answer one question each in the first 60 words: VA loan with
   PCS orders in San Diego, funding-fee exemption, a veteran buying a multi-unit in Riverside, a VA offer against a
   conventional buyer. **AI** drafts · **Alexandra/S** approve; no rate, no eligibility promise.
7. **llms.txt** — cheap; Anthropic and Perplexity read it, OpenAI/Google unconfirmed. **AI**.
8. **Author bio on every page** (name, licences, veteran, NMLS/DRE) with `author` → the Person `@id`. **AI**.

## Tier 3 — off-site authority

9. **YouTube** — the most-cited domain on Perplexity (32% of citations). Short VA explainers, titles phrased as the
   question, transcript on the matching site page. **S** records · **AI** scripts, descriptions, chapters.
10. **Press, podcasts, associations** — veteran-business features, the Navy Chief story, VREB/VAREP, military-spouse
    groups, the LPT and Patriot Pacific team pages linking to `/about`. **S+AI**.
11. **Reddit / Quora** — low weight for local; only genuine answers in r/VeteransBenefits, r/Militaryfinance, r/SanDiego
    with the licence disclosed; never solicit. **S only** (licensed-advice risk).

## Measurement — the monthly audit (the `presence-audit` task runs it; Steven reads `docs/reports/PRESENCE.md`)

- **Prompt set (20)** across ChatGPT, Perplexity, Gemini, Claude, Google AI Mode: "best VA loan officer in San Diego",
  "veteran-friendly realtor Temecula", "who is Steven Shearrill", "Steven Shearrill NMLS", "real estate agent who is also
  a loan officer Southern California", "VA IRRRL lender Riverside County", plus 14 city × service variants. Log:
  mentioned Y/N, position, cited URL, sentiment. The task can only run the web-search half from the cloud; the four
  chat engines are a once-a-month 10-minute paste for Steven (the prompts are in the report).
- **Search Console**: branded queries + the FAQ pages. **GBP Insights**: calls, site clicks, review count and velocity.
- **Score**: mentions ÷ prompt-runs. Target: above zero by month 3, above 20% by month 6 (vendors claim 60–90 days to
  first movement). Paid trackers are optional; the prompt set costs nothing.

## Compliance flags (every item)

- **DRE licence number** on all first-point-of-contact material, websites, e-mail and social (B&P 10140.6(b)); font no
  smaller than the ad's smallest text (DRE RE 559).
- **NMLS ID** on every ad soliciting borrowers — California B&P 10236.4 requires the broker licence and each MLO's NMLS
  identifier; DRE RE 858 says this reaches the internet.
- **Equal Housing Opportunity** logo or statement on real-estate and loan advertising (HUD 4310.5).
- **Reviews**: no inducements, no selective solicitation.
- **HALT**: any page with a rate, an eligibility statement or a client name goes to Alexandra, then Steven, before publish.

## What Steven does first (30 minutes)

1. Claim or verify Google Business Profile and Bing Places; 2. claim Zillow (agent and lender), Realtor.com, Homes.com,
Yelp; 3. send Sofia the DRE number and the site's host login path (never the password) so the entity page and llms.txt can
be drafted for his review; 4. record one 60-second VA explainer on the phone.
