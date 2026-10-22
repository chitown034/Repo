# 07 · Technical SEO specification — temeculahomefinder.com and the entity hub

Owner: Derek (CTO) for deployment and tooling; SEO Specialist (`seo-specialist`) for audits; Sofia signs off on copy; Elena reviews DNS, domain registrar access and any script a third party asks you to paste.

## 1. Domains and hosting

| Property | Role | Platform | Action |
|---|---|---|---|
| temeculahomefinder.com | IDX home search + lead capture | IDX vendor (confirm which: kvCORE/BoldTrail, Lofty, Real Geeks, Placester or similar) | Keep. Fix titles, add schema, control what gets indexed |
| stevenshearrill.com (recommended) | Entity hub, pillar answers, link hub | Static files from `site/` on Cloudflare Pages, Netlify or Vercel | Register, deploy, point `sameAs` everywhere at it |
| thevaloanmastermind.com | Public VA brand (per `context/about-me.md`) | VERIFY what is live there | If live: canonical-link it to the hub or make it the hub; never run two sites that both claim to be "the" site. If parked: 301 to the hub |
| patriotpacific.com/team-member/steven-shearrill | Lender profile | WordPress (Patriot Pacific) | Request schema, title, backlink, robots.txt fix |

**Rule:** one canonical entity page. Every other property links *to* it; it links *out* to all of them (`sameAs`). Two sites that both say "I am Steven Shearrill's website" split the Knowledge Graph signal.

## 2. temeculahomefinder.com: index control (the IDX dilution fix)

Search engines currently see thousands of statewide IDX pages (Tiburon, Menlo Park, Alameda sold listings). Topical authority for "Temecula veteran realtor" is being spread across pages about cities you do not serve.

| Page type | Example | Directive |
|---|---|---|
| Home, About, VA Loans, Contact, Reviews, Military Relocation | `/`, `/about`, `/va-loans` | `index,follow`; in sitemap |
| City pages in service area | `/CA/Temecula`, `/CA/Murrieta`, `/CA/Menifee`, `/CA/Winchester`, `/CA/Fallbrook`, `/CA/Oceanside`, `/CA/San-Diego` | `index,follow`; in sitemap; add 150 words of unique intro copy each |
| City pages outside Riverside/San Diego counties | `/CA/Tiburon`, `/CA/Alameda,Alameda` | `noindex,follow`; out of sitemap |
| Price-band and attribute lists | `/listing/price-between-*`, `/listing/with-1-bath` | `noindex,follow`; out of sitemap |
| Sold-listing detail pages inside the service area | `/sold-listing/detail/.../Temecula-CA` | `index,follow` (they earn long-tail address queries) |
| Sold-listing detail pages outside | `/sold-listing/detail/.../Menlo-Park-CA` | `noindex,follow` |
| Paginated results `?page=2` | any | `noindex,follow` or `rel=canonical` to page 1 |
| Search-result and filter URLs with parameters | `?sort=`, `?view=` | canonical to the clean URL; block in GSC URL Parameters if offered |

How to request it from the IDX vendor (paste into a support ticket):

> Please (1) add `<meta name="robots" content="noindex,follow">` to city pages outside Riverside and San Diego counties and to all `/listing/price-between-*` and `/listing/with-*-bath` URLs; (2) exclude those URLs from the generated XML sitemap; (3) set `rel="canonical"` on paginated and filtered result pages to the unfiltered page 1; (4) let me edit the `<title>`, meta description and an intro paragraph on each city page; (5) give me a global `<head>` code slot for JSON-LD and verification tags.

If the vendor cannot do (1)–(3), move the brochure pages (About, VA Loans, Military Relocation, Reviews) to the hub and let the IDX site be only the search tool, linked from the hub with `rel="nofollow"` off (keep it followed) but no longer the canonical "about" source.

## 3. URL and information architecture

```
stevenshearrill.com/                      Entity page (who, licenses, FAQ, sameAs)
  /va-home-loans-temecula.html            Pillar: VA loans locally
  /military-families-temecula.html        Pillar: neighborhoods, commutes, schools, Mello-Roos, PCS
  /links.html                             Link hub (Instagram/TikTok bio link)
  /reviews.html                           (add once 5+ Google reviews exist) quotes + review links
  /llms.txt · /llms-full.txt · /robots.txt · /sitemap.xml · /humans.txt
temeculahomefinder.com/                   Search + lead capture
  /about · /va-loans · /military-relocation · /reviews · /contact
  /CA/<city> (7 service-area cities, each with unique copy)
```

Internal linking rules: every pillar links to the entity page and to at least two sibling pillars; the entity page links to every pillar; the hub footer links the IDX site; the IDX About page links the hub with the exact anchor "Steven Shearrill".

## 4. On-page template (every indexable page)

| Element | Rule | Example |
|---|---|---|
| `<title>` | ≤ 60 chars, question or entity first, city second, name last | `VA Home Loans in Temecula & San Diego \| Steven Shearrill` |
| Meta description | 140–160 chars, direct answer, one number, CTA | see `site/*.html` |
| H1 | one per page, matches the title's promise | `VA Home Loans in Temecula and San Diego` |
| First paragraph | ≤ 40 words, answers the H1 outright (AEO) | `#answer` blocks in `site/` |
| H2s | questions from `docs/03-question-bank.md` | `Can I buy a house with BAH?` |
| Images | WebP ≤ 150 KB, descriptive alt with name + city where honest, `loading="lazy"` below the fold | `alt="Steven Shearrill, VA loan officer, at a Temecula closing"` |
| Schema | `WebPage` + page type (`Article`/`FAQPage`) + `BreadcrumbList`, all `@id`-linked to the Person | `site/index.html` |
| Canonical | self-referencing absolute URL | `<link rel="canonical" href="https://stevenshearrill.com/">` |
| Dates | visible "Updated <date>" + `dateModified` in schema; refresh quarterly | footer |
| Disclosures | DRE, NMLS, EHO/EHL, VA non-affiliation line | footer |

## 5. Core Web Vitals and performance

The hub is static HTML with one Google Fonts request, so it will pass. The IDX site is the risk. Targets (Google's "good" thresholds): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

- Run PageSpeed Insights on `/`, `/about`, `/CA/Temecula` monthly; log in `data/kpi-monthly.csv`.
- Ask the IDX vendor to defer third-party chat/analytics scripts, serve WebP, and set explicit `width`/`height` on listing photos (CLS).
- On the hub: inline critical CSS (already), `font-display: swap` (already), no third-party scripts except analytics.

## 6. Verification, analytics, and indexing hooks

| Tool | Why | Setup |
|---|---|---|
| Google Search Console | queries, indexing, rich-result reports | DNS TXT verification on both domains; submit `sitemap.xml` |
| Bing Webmaster Tools | feeds ChatGPT search, Copilot, DuckDuckGo, Meta AI | import from GSC (one click); submit sitemap |
| IndexNow | instant indexing on Bing/Yandex/Seznam | generate a key, host `/<key>.txt`, ping on every publish (Cloudflare Pages and most hosts have a plugin) |
| GA4 | traffic by landing page and source; conversions | one property, two data streams; events: `phone_click`, `email_click`, `form_submit`, `review_click`, `calendar_booking` |
| Google Business Profile Insights | calls, direction requests, website clicks from Maps | included with GBP |
| UTM scheme | attribute social → hub → IDX | `utm_source=instagram&utm_medium=bio&utm_campaign=links` etc.; never put UTMs on canonical links inside the site |

## 7. Security and trust signals (Elena)

- HTTPS only, HSTS on, no mixed content.
- `/.well-known/security.txt` (included).
- Registrar: 2FA on, auto-renew on, registrant email = a monitored address; DNS at Cloudflare with DNSSEC.
- Never paste a "verification script" a vendor sends you without Elena's read; verification is a `<meta>` tag or a DNS TXT record, not a `<script>`.

## 8. Monthly technical checklist (seo-specialist runs it; Derek fixes)

- [ ] GSC: coverage errors = 0; "Crawled, not indexed" reviewed; rich results valid (FAQ, Breadcrumb, Profile page)
- [ ] GSC: top 20 queries exported to `data/kpi-monthly.csv`
- [ ] Bing WMT: no crawl errors; IndexNow submissions succeeding
- [ ] PageSpeed: the three IDX pages logged
- [ ] `node scripts/validate-schema.mjs` and `node scripts/nap-consistency.mjs` both pass
- [ ] Broken links: crawl the hub and the IDX brochure pages (Screaming Frog free tier or `lychee`)
- [ ] `robots.txt` unchanged (vendors sometimes reset it) and still allows AI crawlers
- [ ] `llms.txt` date bumped if any fact changed
