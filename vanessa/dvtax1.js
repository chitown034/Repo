/* California Disabled Veterans' Property Tax Exemption + SB 296 (2025-26). Research as of 2026-10-26.
   Note: boe.ca.gov, leginfo and legiscan could not be fetched directly from this environment (proxy/DNS block);
   facts below were cross-checked across multiple search-indexed sources (Governor's office, BOE analyses/letters as indexed,
   Legislative Counsel digest excerpts, CA American Legion, Bloomberg Tax). Verify the chaptered text before quoting to clients. */
window.DVTAX_CA = {
  bill: {
    id: "SB 296",
    session: "2025-2026 Regular Session (introduced Feb 2025; heavily amended Aug 13, 2026)",
    author: "Sen. Bob Archuleta (D-30)",
    status: "Signed by Gov. Newsom Sept 28, 2026 as part of a five-bill veterans package; chaptered as Chapter 727, Statutes of 2026 (chapter number from bill trackers - confirm on leginfo). Passed Assembly 78-0 (Aug 19, 2026), Senate concurred, presented to Governor Aug 27, 2026.",
    effective: "Statute effective Jan 1, 2027; the new exemption applies to property tax lien dates on or after Jan 1, 2027 and before Jan 1, 2032 (i.e., fiscal years 2027-28 through 2031-32). First tax bill affected: 2027-28 secured bill (mailed ~Oct 2027). Some trackers still show the old 2026-2036 window from the 2025 introduced version - that is NOT the final law.",
    summary: "SB 296 (Property taxation: exemption: disabled veteran homeowners) adds R&T Code 205.5.1, a temporary substitute for the existing Disabled Veterans' Exemption (R&T 205.5) for 2027-2031 lien dates. A veteran rated 100% disabled (or paid at 100% due to individual unemployability), or an eligible unmarried surviving spouse, gets 50% of the full value of the principal residence exempt, up to the first $1,000,000 of value (max $500,000 exempt). If household income is at or below the low-income limit ($83,474 for the 2027 lien date), 100% of the first $1,000,000 is exempt. The $1M cap and income limit are indexed for inflation in later years. It largely suspends the current basic and low-income DVE amounts for those years, but a homeowner whose existing exemption would be larger (homes with full value at or below about $371,778 for 2027, above the income limit) may keep the existing 205.5 basic exemption. The 2025 introduced version would have given a FULL exemption on the residence with no cap; that version did not pass.",
    changes: [
      "New R&T Code 205.5.1 (substitute exemption) for lien dates 1/1/2027 through 1/1/2031 (sunsets before 1/1/2032).",
      "Standard tier: 50% of full value exempt, applied to the first $1,000,000 of value (max exempt value $500,000). Indexed for inflation after 2027.",
      "Low-income tier: household income at or below $83,474 (2027 lien date) -> 100% of the first $1,000,000 of full value exempt. Income limit indexed annually.",
      "Hold-harmless: where the old 205.5 basic exemption ($185,889 for 2027 per CA American Legion; unverified against BOE letter) would be larger - i.e., home full value of about $371,778 or less and income above the limit - the existing exemption continues to apply.",
      "Same eligibility categories as 205.5: 100% service-connected rating or paid at 100% due to individual unemployability (TDIU), blind, loss of use of 2+ limbs, or died of service-connected cause; unmarried surviving spouse gets the same amount the veteran would have received.",
      "Requires VA (or military branch) documentation filed with the county assessor; BOE expected to issue updated claim forms for the 2027 lien date.",
      "Effectively suspends the existing basic and low-income DVE dollar amounts for 2027-2031 (per BOE staff analysis of the Aug 13, 2026 amendments); after the sunset, 205.5 resumes unless extended.",
      "State reimburses local agencies (schools backfilled) for lost revenue - not a cost to the homeowner (detail unverified)."
    ],
    sources: [
      "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB296",
      "https://www.gov.ca.gov/2026/09/28/governor-newsom-signs-legislation-supporting-veterans-servicemembers/",
      "https://www.boe.ca.gov/legdiv/pdf/0296sb081326ml.pdf",
      "https://boe.ca.gov/legdiv/pdf/0296sb031925ml.pdf",
      "https://calegion.org/california-expands-property-tax-exemption-for-100-disabled-veterans/",
      "https://news.bloombergtax.com/daily-tax-report-state/california-expands-property-tax-exemption-for-disabled-veterans",
      "https://calmatters.digitaldemocracy.org/bills/ca_202520260sb296",
      "https://www.govbuddy.com/california/bills/sb-296/",
      "https://sd30.senate.ca.gov/node/757",
      "https://media.api.sf.gov/documents/SB296_Support_Letter_and_Legislative_Overview_09082026.pdf"
    ]
  },
  years: {
    "2025": { basic: 175298, lowIncome: 262950, incomeLimit: 78718, source: "BOE Letter to Assessors 2024/015 (May 2, 2024), lien date Jan 1, 2025; inflation factor 1.03257. https://www.boe.ca.gov/proptaxes/pdf/lta24015.pdf" },
    "2026": { basic: 180671, lowIncome: 271009, incomeLimit: 81131, source: "BOE Letter to Assessors 2025/014 (May 21, 2025), lien date Jan 1, 2026 (factor ~1.0307). https://aws.boe.ca.gov/proptaxes/pdf/lta25014.pdf" },
    "2027": { basic: 185889, lowIncome: null, incomeLimit: 83474, newLawCap: 1000000, source: "BOE Letter to Assessors 2026/019 gives 2027 income limit $83,474 (factor ~1.0289). Basic $185,889 per CA American Legion (unverified against BOE). Old-law low-income amount for 2027 unverified (approx. $278,800 if indexed). For 2027-2031 SB 296 substitutes 50%/100% of first $1M. https://boe.ca.gov/proptaxes/pdf/lta26019.pdf" }
  },
  eligibility: [
    "Veteran (honorably discharged) rated 100% service-connected disabled by the VA, OR paid at the 100% rate due to individual unemployability (TDIU), OR blind in both eyes (visual acuity 5/200 or less) or lost use of two or more limbs due to service.",
    "Unmarried surviving spouse of a veteran who died of a service-connected injury/disease, or who would have qualified; also the unmarried surviving spouse of a qualifying 100% veteran (remarriage ends eligibility).",
    "Property must be the principal place of residence on the lien date (Jan 1), or become so during the year (prorated). Vacation/rental homes do not qualify; one exemption per veteran.",
    "Title may be held by the veteran, the spouse, jointly, or in a revocable trust; the exemption is NOT reduced by the spouse's ownership share.",
    "Veteran need not have been a California resident at entry into service (residency-at-entry requirement removed years ago).",
    "Temporary absence (hospital, nursing facility) generally does not break principal-residence status if intent to return.",
    "Low-income tier: total household income (veteran + spouse/household members) at or below the annual limit; VA disability compensation is generally excluded (unverified - confirm). Confirm income definition with assessor (R&T 205.5(g)).",
    "Under SB 296 (2027-2031): same categories qualify for the 50% / 100% of first $1M substitute exemption."
  ],
  filing: [
    "Form: BOE-261-G, Claim for Disabled Veterans' Property Tax Exemption, filed with the COUNTY ASSESSOR (not BOE), with the VA rating/benefit letter (and DD-214 if requested).",
    "Basic exemption: ONE-TIME filing; continues until eligibility ends or property changes. Low-income exemption: must be refiled ANNUALLY (BOE-261-G each year by the deadline), with household income info.",
    "Termination/change: BOE-261-GNT (notice of termination) when the veteran moves, sells, or remarriage of surviving spouse, etc.",
    "Full exemption deadline: Feb 15 for existing ownership (or before the next lien date following eligibility). For a new purchase or new rating: file within 90 days of the change in ownership/ eligibility or the supplemental bill notice, or by the next Feb 15 (whichever is later) for full credit.",
    "Late filing (R&T 276): filed after Feb 15 but on or before Dec 10 -> 90% of the exemption; after Dec 10 -> 85% of the exemption (low-income: different late rules may apply; confirm with assessor).",
    "Exemption can be retroactive to the effective date of the VA rating; prior-year relief is granted via escaped/roll correction and refund. Refund claims related to the DVE may be filed up to 8 years after the tax was paid (R&T 5097, per SB 1113 (2014)).",
    "Supplemental assessments: a buyer who qualifies can get the exemption prorated on the supplemental bill from the date of purchase or rating effective date; file promptly after closing.",
    "Under SB 296 for 2027+: BOE to issue revised forms for the Jan 1, 2027 lien date; existing basic DVE claimants are expected to be converted by assessors, but low-income claimants must still file annually (confirm county procedure)."
  ],
  notExempt: [
    "Mello-Roos / Community Facilities District special taxes (fixed per-parcel, not ad valorem).",
    "Special assessments and direct charges: lighting & landscaping, sewer, water, trash, vector control, flood control, school parcel taxes (fixed-amount), fire/paramedic fees.",
    "Fixed parcel taxes approved by voters (non-ad valorem) - the exemption reduces ASSESSED VALUE only, so only ad valorem taxes (1% general levy + voter-approved debt rates) fall.",
    "Value above the exemption amount (e.g., under old law, value above $180,671 in 2026; under SB 296, the non-exempt 50% and all value above $1M).",
    "Non-residence property (rentals, second homes, vacant land) and the portion of a mixed-use property not used as the residence.",
    "Supplemental tax bills for periods before eligibility/claim; penalties already incurred (generally)."
  ],
  strategies: [
    "Estimating taxes for a 100% veteran buyer (2026 lien year, old law): (purchase price - $180,671 basic or $271,009 low-income) x county ad valorem rate (1% + voter debt, typically ~1.05-1.25%) + direct charges/Mello-Roos. Example: $800,000 home, 1.15% rate: (800,000-180,671) x 1.15% = $7,122 + direct charges vs $9,200 without.",
    "For tax years 2027-28 onward (SB 296): exempt value = 50% x min(value, $1,000,000) (or 100% x min(value, $1M) if low-income). $800,000 home, 1.15%: taxable $400,000 -> about $4,600 + direct charges; low-income -> $0 ad valorem, only direct charges/Mello-Roos remain.",
    "Underwrite conservatively: until the assessor actually applies the exemption, many lenders/VA underwriters use full unexempt taxes in DTI and escrow; once the exemption posts, request an escrow analysis to lower the payment. Document the plan in the file.",
    "VA loans: 100% disabled vets are already exempt from the VA funding fee; pairing that with the property tax exemption meaningfully lowers PITI - include both in buyer consultations.",
    "Always include Mello-Roos / special assessments at full amount; the exemption never reduces them. Pull the tax bill or a CFD disclosure for new-construction areas.",
    "Supplemental bills: warn buyers that a supplemental bill will arrive 3-9 months post-closing and is NOT paid through escrow; file BOE-261-G right after closing so the supplemental is prorated with the exemption.",
    "Do not file the Homeowners' Exemption (BOE-266) on top of the DVE - they cannot be combined on the same property; the DVE supersedes the $7,000 HOE.",
    "Refinance / cash-out clients already owning homes: check the tax bill for exemption code; many eligible vets never filed - retroactive relief up to 8 years of refunds may be available, improving DTI and cash flow.",
    "Low-income tier clients: calendar a Feb 15 reminder every year (annual refiling required); missing it drops relief to 90%/85%.",
    "Prop 19 sellers (55+, severely disabled) can transfer a low Prop 13 base year to a replacement home anywhere in CA; the DVE then applies on top of the transferred base value - combine both for maximum savings.",
    "For price-point advice under SB 296: the benefit caps at $1M of value, so the exempt amount stops growing above $1M; below about $371,778 (2027) the old basic exemption may be better and is preserved.",
    "Surviving spouse refi/purchase: confirm she/he remains unmarried and has VA DIC letter; the exemption follows the spouse to a new principal residence."
  ],
  caveats: [
    "SB 296 status and chapter number were verified through the Governor's Sept 28, 2026 release and bill trackers; leginfo/BOE PDFs could not be opened directly from this environment - verify the chaptered text of R&T 205.5.1 before quoting exact terms.",
    "Some sites (GovBuddy, early Newsweek/CA Legion articles, Nevada County page) describe the 2025 introduced version (full exemption, 2026-2036) - outdated.",
    "2027 basic amount $185,889 and $371,778 hold-harmless threshold are from CA American Legion reporting - unverified against a BOE letter.",
    "Old-law 2027 low-income exemption amount not located - unverified.",
    "Tax rates vary by tax rate area; 1% + voter-approved debt is typically 1.0-1.25%, but some areas are higher. Always use the actual TRA rate.",
    "Income definition for the low-income tier follows R&T 205.5 / BOE rules; confirm exclusions (VA disability compensation is generally excluded) with the assessor.",
    "This is general information for a broker, not tax or legal advice; the county assessor makes eligibility determinations.",
    "SB 296 is temporary (2027-2031 lien dates); budget/legislative changes could alter it."
  ],
  faq: [
    ["What is California SB 296?", "SB 296 (2025-26, Sen. Bob Archuleta) is the disabled veteran homeowners property tax bill signed Sept 28, 2026 (Ch. 727, Stats. 2026). It creates R&T 205.5.1: 50% of the first $1M of a 100% disabled veteran's home value is exempt, or 100% of the first $1M for low-income households, for lien dates 2027-2031."],
    ["When does SB 296 start saving money?", "Lien date Jan 1, 2027 - the 2027-28 fiscal-year tax bill (first installment due Nov/Dec 2027). It does not change 2026-27 bills."],
    ["Does SB 296 make 100% disabled vets fully property-tax free?", "Only low-income households (income at or below $83,474 for 2027), and only on the first $1M of value; Mello-Roos and special assessments still apply. Others get 50% of the first $1M exempt."],
    ["What are the 2025 figures?", "Basic $175,298; low-income $262,950; household income limit $78,718 (BOE LTA 2024/015)."],
    ["What are the 2026 figures?", "Basic $180,671; low-income $271,009; household income limit $81,131 (BOE LTA 2025/014)."],
    ["How are amounts indexed?", "R&T 205.5 compounds the exemption amounts and income limit annually by an inflation factor based on the California Consumer Price Index; BOE publishes them in a Letter to Assessors each spring."],
    ["Who qualifies?", "Veterans rated 100% service-connected or paid at 100% for individual unemployability, blind, or lost use of 2+ limbs; and unmarried surviving spouses of veterans who died of service-connected causes or of qualifying veterans."],
    ["Does TDIU count?", "Yes. A veteran paid at the 100% rate due to unemployability qualifies under 205.5 and SB 296."],
    ["What form is used and where is it filed?", "BOE-261-G, filed with the county assessor with VA documentation. BOE-261-GNT reports termination."],
    ["Is filing annual?", "Basic: one-time. Low-income: annually by Feb 15 (with income info)."],
    ["What is the deadline and what if late?", "Feb 15 for full exemption (or 90 days after a supplemental notice/ new eligibility). Late by Dec 10 = 90%; after = 85%."],
    ["Can a veteran get refunds for past years?", "Yes; the exemption can be backdated to the VA rating effective date and refund claims can reach back up to 8 years after payment (DVE-specific rule)."],
    ["Can the vet also take the $7,000 homeowners' exemption?", "No, not on the same property; the DVE replaces the homeowners' exemption."],
    ["Does it change Prop 13 base-year value?", "No. Assessed value is still the Prop 13 base plus up to 2% per year; the exemption is subtracted from that assessed value."],
    ["Does it work with a Prop 19 base-year transfer?", "Yes. A 55+/severely disabled owner can transfer the base-year value, then claim the DVE on the replacement residence."],
    ["Are Mello-Roos and assessments exempt?", "No. Only ad valorem taxes (1% + voter-approved debt rates) are reduced."],
    ["What is the typical tax rate to use?", "About 1.0-1.25% of assessed value depending on tax rate area, plus fixed direct charges."],
    ["Does the spouse being on title reduce the exemption?", "No. Title held by the veteran, spouse, jointly or in a trust qualifies in full."],
    ["Does it apply on a new purchase mid-year?", "Yes, prorated from the date of purchase/eligibility on supplemental and/or escape bills, if filed timely."],
    ["What happens after 2031?", "SB 296's substitute exemption sunsets; R&T 205.5 basic/low-income amounts resume unless extended."]
  ],
  sources: [
    ["SB 296 bill page (leginfo)", "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB296"],
    ["Governor Newsom signs veterans legislation (Sept 28, 2026)", "https://www.gov.ca.gov/2026/09/28/governor-newsom-signs-legislation-supporting-veterans-servicemembers/"],
    ["BOE staff analysis SB 296 as amended Aug 13, 2026", "https://www.boe.ca.gov/legdiv/pdf/0296sb081326ml.pdf"],
    ["BOE staff analysis SB 296 as introduced (2025)", "https://boe.ca.gov/legdiv/pdf/0296sb031925ml.pdf"],
    ["CA American Legion - California expands property tax exemption for 100% disabled veterans", "https://calegion.org/california-expands-property-tax-exemption-for-100-disabled-veterans/"],
    ["Bloomberg Tax - California expands property tax exemption for disabled veterans", "https://news.bloombergtax.com/daily-tax-report-state/california-expands-property-tax-exemption-for-disabled-veterans"],
    ["CalMatters Digital Democracy - SB 296", "https://calmatters.digitaldemocracy.org/bills/ca_202520260sb296"],
    ["Senator Archuleta - SB 296", "https://sd30.senate.ca.gov/node/757"],
    ["SF Veterans Council SB 296 overview (Sept 2026)", "https://media.api.sf.gov/documents/SB296_Support_Letter_and_Legislative_Overview_09082026.pdf"],
    ["Assembly analysis SB 296 (June 29, 2026 hearing)", "https://billtexts.s3.amazonaws.com/ca/ca-analysishttps-leginfo-legislature-ca-gov-faces-billAnalysisClient-xhtml-bill-id-202520260SB296-ca-analysis-401225.pdf"],
    ["BOE LTA 2024/015 (2025 amounts)", "https://www.boe.ca.gov/proptaxes/pdf/lta24015.pdf"],
    ["BOE LTA 2025/014 (2026 amounts)", "https://aws.boe.ca.gov/proptaxes/pdf/lta25014.pdf"],
    ["BOE LTA 2026/019 (2027 income limit)", "https://boe.ca.gov/proptaxes/pdf/lta26019.pdf"],
    ["BOE sample BOE-261-G", "https://boe.ca.gov/proptaxes/pdf/sample-boe261g.pdf"],
    ["SLO County BOE-261-G", "https://www.slocounty.ca.gov/departments/assessor/forms-documents/exemptions/boe-261-g-disabled-veterans-exemption"],
    ["R&T Code 276 (late filing)", "https://california.public.law/codes/revenue_and_taxation_code_section_276"],
    ["SB 1113 (2014) 8-year refund analysis", "https://www.leginfo.ca.gov/pub/13-14/bill/sen/sb_1101-1150/sb_1113_cfa_20140818_204934_asm_floor.html"],
    ["Nevada County DVE page (pre-signing, outdated on SB 296)", "https://www.nevadacountyca.gov/4051/Disabled-Veterans-Exemption"]
  ],
  asOf: "2026-10-26"
};
