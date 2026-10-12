# 01 · Presence Audit — Steven Shearrill (12 Oct 2026)

## Entity snapshot (what the web currently says)

| Fact | Value found | Source(s) | Status |
|---|---|---|---|
| Legal / display name | Steven Shearrill | all | Consistent |
| Credentials in headline | MBA, Broker, MLO, TS-SCI, Ret. Navy, PMP | LinkedIn | Consistent but unexplained to a lay reader |
| Military | Retired U.S. Navy Chief, 20 years, retired 2023 | patriotpacific.com | Consistent |
| Real estate start | Realtor since 2015 (while on active duty) | patriotpacific.com, AgentPronto ("11 years experience") | Consistent |
| CA DRE license | #01988316 (Broker license added July 2024) | temeculahomefinder.com, Homes.com, Instagram bio, eXp page, LinkedIn | Consistent |
| Brokerage | LPT Realty, Inc. (CA DRE #02248983, Designated Broker Molly Winkle) | temeculahomefinder.com, Instagram, LinkedIn, Yelp | **Conflicts** with eXp on Homes.com, Facebook page name, src.exprealty.com, old Yelp URL |
| MLO license | NMLS #2449246, Patriot Pacific Financial Corp (NMLS #1921615), since 2024 | patriotpacific.com, Instagram bio | Consistent |
| Patriot Pacific office | 41923 Second St, Suite 203, Temecula, CA 92590 | NC SoS filing for Patriot Pacific Financial Corp | VERIFY this is the address you want published as your loan-officer office |
| Phone | (619) 368-7141 (mobile, used on most pages) and (877) 366-2213 (contact page "Phone") | temeculahomefinder.com | **Two numbers** — pick one primary |
| Email | steven.shearrill@gmail.com | temeculahomefinder.com | Consistent; a branded address (steven@temeculahomefinder.com) would strengthen entity trust |
| Home city on profiles | Temecula (Yelp, Instagram, site) · Winchester (Homes.com, AgentPronto) · Las Vegas (LinkedIn location text) | mixed | **Three different cities** |
| Service areas stated | Temecula, Murrieta, Menifee (Homes.com); Temecula Wine Country & San Diego (Instagram); Temecula & San Diego (eXp, AgentPronto) | mixed | Needs one canonical list |
| Specialties stated | VA home loans, military/veterans, first-time buyers, relocation, "service first", BAH-to-equity | patriotpacific.com, AgentPronto | Good; not yet phrased as answerable questions |
| Reviews | Yelp 5.0 (3 reviews, verified business) · MapQuest mirrors Yelp · Homes.com/AgentPronto review sections not captured · no Zillow or Realtor.com profile surfaced · no Google Business Profile surfaced | Yelp, MapQuest | **Thin and scattered**; Google reviews absent |
| Sales data | AgentPronto: 3 recent sales, $405K–$682K range, $670K median | AgentPronto | Low volume signal; counteract with content and reviews |

## Property-by-property findings

### temeculahomefinder.com (primary website, IDX platform)
- Title tag is "Real Estate - Steven Shearrill - LPT Realty Search All Homes For Sale". Generic, keyword order is wrong, and it does not say *where* or *for whom*.
- The crawlable surface is dominated by thousands of auto-generated IDX pages (Tiburon, Alameda, Menlo Park, Irvine, Dana Point sold listings). Google sees a statewide listing aggregator, not a Temecula/San Diego veteran specialist. This dilutes topical authority.
- No `llms.txt`, no visible Person/RealEstateAgent JSON-LD, no FAQ content, no dedicated "About Steven" page surfaced in search.
- Contact page shows two phone numbers. Footer carries the correct LPT Realty DRE line.
- Social links present: LinkedIn, Instagram, Zillow, YouTube.
- Verdict: good brokerage compliance, near-zero entity and answer optimization.

### patriotpacific.com/team-member/steven-shearrill/
- Strong bio: Navy Chief, 20 years, Realtor since 2015, Broker + MLO 2024, VA loans + BAH equity strategy. This is the best narrative paragraph you have online.
- Lives on a company page you don't control; no deep link from your own site to it was found. No schema found. Not linked from Instagram bio (only one link is allowed there; needs a link hub).

### Instagram @stevenshearrillhomes
- Name field: "Steven Shearrill LPT Realty & Patriot Pacific MLO". Bio lists DRE and NMLS and "Temecula Wine Country and San Diego". Good entity signals.
- Missing: a clear who-I-help line, a CTA, a link hub, and the keyword "VA loan" / "veteran" in the searchable name field.

### LinkedIn /in/stevenshearrillhomes
- Headline is an alphabet soup ("MBA, BROKER, MLO, TS-SCI, Ret. NAVY, PMP"). LLMs and recruiters can't infer *what you do for whom*.
- Location text references Las Vegas, NV. Must be Temecula, CA.
- LinkedIn is the single most-cited source LLMs use to describe a person. Fixing this profile moves GEO more than any other single profile edit.

### Facebook /stevenshearrillhomes
- Page name still reads "Realtor Brokered by EXP Realty of California, Inc". This is the most visible stale fact online and directly contradicts LPT Realty.

### YouTube
- Only a 2018 eXp "Veteran's Day Serpa Show" interview surfaced. No owned channel with your name as the channel title was found. YouTube is Google-owned, indexed instantly, and heavily quoted by Gemini; this is the largest untapped channel.

### Yelp
- Two URLs exist: `/steven-shearrill-lpt-realty-temecula` (current, verified, 5.0 with 3 reviews, 41 photos) and `/steven-shearrill-exp-realty-of-california-temecula` (stale). Ask Yelp support to merge/redirect the old one.

### Homes.com, AgentPronto, src.exprealty.com
- All three still say eXp Realty and/or Winchester. Homes.com and AgentPronto are claimable; the eXp page should be removed by asking eXp's agent-services desk (you are no longer affiliated).

### Not found (opportunities)
- Google Business Profile for "Steven Shearrill - LPT Realty" or "Steven Shearrill - Patriot Pacific Financial" (searches surfaced none).
- Zillow agent profile (your site links to Zillow, but no profile ranked).
- Realtor.com agent profile.
- Bing Places, Apple Business Connect, Nextdoor, Alignable, Crunchbase/Wikidata-style knowledge entries.
- Any press mention, podcast appearance, or third-party article after 2018.
- NMLS Consumer Access and CA DRE public pages are not linked from any owned property.

## Inconsistencies to fix first (NAP / entity hygiene)

1. Brokerage: change every eXp mention to **LPT Realty** (Facebook page name, Homes.com, AgentPronto, old Yelp, eXp agent page removal).
2. City: standardize on **Temecula, CA** everywhere (remove Las Vegas from LinkedIn; update Winchester on Homes.com/AgentPronto to Temecula with Winchester in service areas).
3. Phone: pick **(619) 368-7141** as the primary on every profile; list (877) 366-2213 only as "office" if it is indeed an LPT line.
4. Name format: use exactly **Steven Shearrill** (no "Steve", no middle initial) in every profile name field; put credentials in headline/bio fields, not the name field.
5. Headline: use one sentence everywhere: *"Veteran-focused Real Estate Broker (LPT Realty) and VA Loan Officer (Patriot Pacific Financial) serving Temecula Valley and San Diego County. Retired U.S. Navy Chief."*

## Scores (1–5, before this kit)

| Dimension | Score | Why |
|---|---|---|
| SEO (rankings) | 2 | IDX site has no topical focus; no owned content; few backlinks |
| AEO (direct answers) | 1 | No FAQ, no question-shaped content, no speakable markup |
| GEO (LLM citations) | 1 | No llms.txt; conflicting facts; LinkedIn headline unreadable to models |
| AIO (structured entity) | 1 | No Person/RealEstateAgent schema; no sameAs graph |
| Reviews / social proof | 2 | 3 Yelp reviews; no Google reviews |
| Consistency (NAP) | 2 | 4 brokerage/city conflicts live right now |
