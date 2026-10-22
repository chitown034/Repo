# 06 · Paste-ready schema and meta tags for your existing sites

## A. temeculahomefinder.com

### A1. Title and meta (homepage)
Replace the current title `Real Estate - Steven Shearrill - LPT Realty Search All Homes For Sale` with:

```html
<title>Steven Shearrill | Veteran Realtor & VA Loan Officer in Temecula & San Diego | LPT Realty</title>
<meta name="description" content="Steven Shearrill is a retired Navy Chief, California Real Estate Broker (LPT Realty, DRE #01988316) and VA Loan Originator (NMLS #2449246) helping military families and first-time buyers in Temecula, Murrieta, Menifee and San Diego County. Search homes or call (619) 368-7141.">
<link rel="canonical" href="https://temeculahomefinder.com/">
<meta property="og:type" content="profile">
<meta property="og:title" content="Steven Shearrill | Veteran Realtor & VA Loan Officer | Temecula & San Diego">
<meta property="og:description" content="Retired Navy Chief. Real Estate Broker with LPT Realty and VA Loan Originator with Patriot Pacific Financial. Temecula Valley & San Diego County.">
<meta property="og:url" content="https://temeculahomefinder.com/">
<meta property="og:image" content="https://temeculahomefinder.com/PATH-TO-HEADSHOT-1200x630.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="US-CA">
<meta name="geo.placename" content="Temecula, California">
```

Recommended page titles for new pages:
- `/about` → `About Steven Shearrill | Retired Navy Chief, Broker & VA Loan Officer | Temecula`
- `/va-loans` → `VA Home Loans in Temecula & San Diego | Steven Shearrill, NMLS #2449246`
- `/military-relocation` → `PCS to Temecula or San Diego? Military Relocation Guide | Steven Shearrill`
- `/reviews` → `Steven Shearrill Reviews | LPT Realty Temecula`

### A2. JSON-LD (paste once in the global `<head>` or footer)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": "https://temeculahomefinder.com/#agent",
      "name": "Steven Shearrill - LPT Realty",
      "alternateName": "Steven Shearrill, Real Estate Broker",
      "url": "https://temeculahomefinder.com/",
      "telephone": "+1-619-368-7141",
      "email": "steven.shearrill@gmail.com",
      "image": "https://temeculahomefinder.com/PATH-TO-HEADSHOT.jpg",
      "priceRange": "$$",
      "address": {"@type": "PostalAddress", "addressLocality": "Temecula", "addressRegion": "CA", "postalCode": "92590", "addressCountry": "US"},
      "areaServed": ["Temecula CA","Murrieta CA","Menifee CA","Winchester CA","French Valley CA","Wildomar CA","Lake Elsinore CA","Fallbrook CA","Oceanside CA","San Diego CA","Riverside County CA","San Diego County CA"],
      "parentOrganization": {"@type": "RealEstateAgent", "name": "LPT Realty, Inc.", "identifier": "CA DRE #02248983"},
      "employee": {"@id": "https://temeculahomefinder.com/#steven"},
      "sameAs": [
        "https://www.instagram.com/stevenshearrillhomes/",
        "https://www.linkedin.com/in/stevenshearrillhomes/",
        "https://www.facebook.com/stevenshearrillhomes/",
        "https://www.yelp.com/biz/steven-shearrill-lpt-realty-temecula",
        "https://patriotpacific.com/team-member/steven-shearrill/"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://temeculahomefinder.com/#steven",
      "name": "Steven Shearrill",
      "givenName": "Steven",
      "familyName": "Shearrill",
      "honorificSuffix": "MBA, PMP",
      "jobTitle": ["Real Estate Broker", "Mortgage Loan Originator"],
      "description": "Retired U.S. Navy Chief (20 years, retired 2023). California Real Estate Broker with LPT Realty (DRE #01988316) since 2015 and VA Mortgage Loan Originator with Patriot Pacific Financial (NMLS #2449246) since 2024. Serves military families, veterans and first-time buyers in Temecula Valley and San Diego County.",
      "url": "https://temeculahomefinder.com/",
      "telephone": "+1-619-368-7141",
      "email": "steven.shearrill@gmail.com",
      "worksFor": [
        {"@type": "Organization", "name": "LPT Realty, Inc.", "identifier": "CA DRE #02248983"},
        {"@type": "Organization", "name": "Patriot Pacific Financial Corp", "identifier": "NMLS #1921615", "url": "https://patriotpacific.com/"}
      ],
      "hasCredential": [
        {"@type": "EducationalOccupationalCredential", "credentialCategory": "license", "name": "California Real Estate Broker License", "identifier": "DRE #01988316", "recognizedBy": {"@type": "Organization", "name": "California Department of Real Estate"}},
        {"@type": "EducationalOccupationalCredential", "credentialCategory": "license", "name": "Mortgage Loan Originator License", "identifier": "NMLS #2449246", "recognizedBy": {"@type": "Organization", "name": "Nationwide Multistate Licensing System"}},
        {"@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "Master of Business Administration (MBA)"},
        {"@type": "EducationalOccupationalCredential", "credentialCategory": "certification", "name": "Project Management Professional (PMP)"}
      ],
      "knowsAbout": ["VA home loans","Military relocation (PCS)","BAH-based home buying","First-time home buyers","Temecula Valley real estate","San Diego County real estate","Multi-unit VA purchases","Mello-Roos"],
      "homeLocation": {"@type": "Place", "name": "Temecula, California"},
      "sameAs": [
        "https://www.instagram.com/stevenshearrillhomes/",
        "https://www.linkedin.com/in/stevenshearrillhomes/",
        "https://www.facebook.com/stevenshearrillhomes/",
        "https://patriotpacific.com/team-member/steven-shearrill/",
        "https://www.yelp.com/biz/steven-shearrill-lpt-realty-temecula"
      ]
    }
  ]
}
</script>
```

Add the FAQ block from `schema/faq.jsonld` to the `/va-loans` page only (FAQ schema must sit on the page that visibly shows the questions and answers).

### A3. IDX dilution fix
Ask your IDX provider's support to either (a) add `<meta name="robots" content="noindex,follow">` to city pages outside Riverside and San Diego counties and to all `/listing/price-between-*` and `/listing/with-*-bath` pages, or (b) exclude them from the generated sitemap. Keep sold-listing detail pages for Temecula/Murrieta/Menifee/San Diego indexed.

## B. patriotpacific.com/team-member/steven-shearrill/

Send this to Patriot Pacific's web admin (WordPress; can be added with a "Custom HTML" block or a schema plugin):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://patriotpacific.com/team-member/steven-shearrill/#person",
  "name": "Steven Shearrill",
  "jobTitle": "Mortgage Loan Originator",
  "identifier": "NMLS #2449246",
  "description": "Retired U.S. Navy Chief and VA home loan specialist. Mortgage Loan Originator (NMLS #2449246) with Patriot Pacific Financial Corp (NMLS #1921615) and California Real Estate Broker (DRE #01988316) with LPT Realty. Serves Temecula, Murrieta, Menifee and San Diego County.",
  "url": "https://patriotpacific.com/team-member/steven-shearrill/",
  "telephone": "+1-619-368-7141",
  "worksFor": {"@type": "FinancialService", "name": "Patriot Pacific Financial Corp", "identifier": "NMLS #1921615", "url": "https://patriotpacific.com/", "address": {"@type": "PostalAddress", "streetAddress": "41923 Second St, Suite 203", "addressLocality": "Temecula", "addressRegion": "CA", "postalCode": "92590", "addressCountry": "US"}},
  "hasCredential": [
    {"@type": "EducationalOccupationalCredential", "credentialCategory": "license", "name": "Mortgage Loan Originator License", "identifier": "NMLS #2449246"},
    {"@type": "EducationalOccupationalCredential", "credentialCategory": "license", "name": "California Real Estate Broker License", "identifier": "DRE #01988316"}
  ],
  "knowsAbout": ["VA home loans","VA IRRRL refinance","VA jumbo loans","FHA loans","Conventional loans","Down payment assistance","BAH income qualification"],
  "sameAs": [
    "https://temeculahomefinder.com/",
    "https://www.linkedin.com/in/stevenshearrillhomes/",
    "https://www.instagram.com/stevenshearrillhomes/",
    "https://www.nmlsconsumeraccess.org/"
  ]
}
</script>
```

Also ask them to:
- Set the page title to `Steven Shearrill, VA Loan Officer (NMLS #2449246) | Patriot Pacific Financial, Temecula CA`.
- Link the words "LPT Realty" in the bio to temeculahomefinder.com (a backlink from a lender's domain is valuable).
- Add a "Apply with Steven" button that points to your personal application link.

## C. YouTube video pages (hub)
Use `schema/video.jsonld` for each video you embed-link from the hub; fill `uploadDate`, `duration`, `thumbnailUrl`, and the YouTube URL. Do not guess dates.

## D. Validation
1. https://search.google.com/test/rich-results
2. https://validator.schema.org/
3. `node scripts/validate-schema.mjs` in this repo (checks the `site/` and `schema/` files).
