> **HELD DRAFT — nothing in `site/`, `profiles/` or `schema/` is published or pasted anywhere yet.**
> Owner: Sofia (CMO). Gate: Alexandra (compliance) signs off, then Steven approves the publish.
> Open items before any use: `projects/aeo-presence.md` § Compliance hold. Brought onto the main line
> 2026-10-22 from branch `claude/tender-feynman-mw4cm1` (written 2026-10-12); paths below are
> relative to this folder.

# Steven Shearrill — AEO / SEO / GEO / AIO Presence Kit

A complete, ready-to-deploy kit to make **Steven Shearrill** (Real Estate Broker, LPT Realty · Mortgage Loan Originator, Patriot Pacific Financial · Retired U.S. Navy Chief · Temecula Valley & San Diego County) the entity that Google, Bing, and every large language model (ChatGPT, Claude, Gemini, Grok, Perplexity, Copilot, Meta AI) resolve to when someone asks about a veteran-focused realtor or VA loan officer in Temecula / San Diego.

| Acronym | What it means here | Where it lives in this repo |
|---|---|---|
| **SEO** | Classic search ranking: titles, on-page structure, local citations, backlinks, NAP consistency | `docs/01-presence-audit.md`, `docs/02-strategy.md`, `profiles/` |
| **AEO** | Answer Engine Optimization: being *the* direct answer in featured snippets, People Also Ask, voice, and AI Overviews | `docs/03-question-bank.md`, FAQ schema in `site/` and `schema/` |
| **GEO** | Generative Engine Optimization: being cited and recommended inside LLM answers (ChatGPT, Claude, Gemini, Grok, Perplexity) | `docs/05-llm-citation-checklist.md`, `site/llms.txt`, `site/robots.txt` |
| **AIO** | AI Optimization / AI Overviews: structured, machine-readable entity data so AI systems can verify who you are | JSON-LD in `site/index.html`, `schema/*.jsonld`, `docs/06-schema-for-existing-sites.md` |

## What is in here

```
docs/
  01-presence-audit.md              Current-state audit of every property found online (Oct 2026)
  02-strategy.md                    The AEO/SEO/GEO/AIO strategy and 90-day execution plan
  03-question-bank.md               140+ real questions people ask search engines and LLMs, mapped to answers
  04-content-calendar-90-days.md    Week-by-week posting plan across every platform
  05-llm-citation-checklist.md      How to get recommended by ChatGPT, Claude, Gemini, Grok, Perplexity
  06-schema-for-existing-sites.md   Paste-ready JSON-LD and meta tags for temeculahomefinder.com and patriotpacific.com
profiles/
  00-canonical-identity.md          The single source of truth: name, titles, licenses, NAP, bios (50/100/300 words), keywords
  instagram.md · facebook.md · linkedin.md · youtube.md · tiktok.md · x-threads.md
  google-business-profile.md · zillow-realtor-homes.md · yelp-nextdoor-bing-apple.md · nmls-dre-directories.md
schema/
  person.jsonld · real-estate-agent.jsonld · mortgage-loan-originator.jsonld · faq.jsonld · video.jsonld
site/
  index.html                        Entity hub page: full JSON-LD graph, FAQ, speakable markup, sameAs links
  va-home-loans-temecula.html       AEO pillar page: VA home loans in Temecula & San Diego
  llms.txt · llms-full.txt          Machine-readable summaries for LLM crawlers
  robots.txt · sitemap.xml · humans.txt · .well-known/security.txt
scripts/
  validate-schema.mjs               Checks every JSON-LD block parses and has required fields
```

## Quick start (in priority order)

1. **Fix the NAP conflicts** listed in `docs/01-presence-audit.md` § "Inconsistencies to fix first". This is the single highest-leverage task; LLMs and Google both downgrade entities whose facts disagree across sources.
2. **Deploy `site/`** to a domain you control (recommended: `stevenshearrill.com`; if you use a different domain, search-and-replace `https://stevenshearrill.com` across `site/` and `schema/`). Any static host works: Netlify, Vercel, Cloudflare Pages, GitHub Pages.
3. **Paste the schema** from `docs/06-schema-for-existing-sites.md` into temeculahomefinder.com (site settings → custom head code) and ask Patriot Pacific's web admin to add the loan-officer block.
4. **Update every profile** using the copy in `profiles/`. Each file is copy-paste ready and already character-count checked.
5. **Run the 90-day calendar** in `docs/04-content-calendar-90-days.md`.
6. **Work the LLM checklist** in `docs/05-llm-citation-checklist.md` and re-test the prompts in its "Benchmark prompts" section monthly.

## Validate

```bash
node scripts/validate-schema.mjs
```

## Facts policy

Every fact in this kit was taken from Steven's own public business pages (temeculahomefinder.com, patriotpacific.com, Instagram bio, Yelp, Homes.com, AgentPronto, LinkedIn headline) as of 12 Oct 2026. Items marked `VERIFY` could not be confirmed from a primary source and must be checked before publishing. Nothing here was invented; where a figure was unavailable the kit says so instead of guessing.
