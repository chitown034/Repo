/* carfdeep2.js - field-by-field walkthroughs for C.A.R./CRMLS forms (seller disclosures, advisories, agency, buyer representation, listing).
   Merged into CARF_DEEP by app64.js. Keys match CARF_BASE k values. Written 2026-10-26 against the 2024-2026 C.A.R. form releases;
   where a field or revision date is uncertain the text says "(verify on the current form)". Not legal advice - confirm with LPT broker/TC. */
window.CARF_DEEP_EXT=Object.assign(window.CARF_DEEP_EXT||{},{
"AAA":[
{s:"Header: underlying agreement",d:"Check the box for the agreement the acknowledgement attaches to (RPA, BRBC, RLA or other) and enter its date and the property address exactly as written on that agreement. Mistake: dating the AAA with today's date in the agreement-date blank; the date here must be the original contract date so the two documents tie together."},
{s:"Parties",d:"Enter every buyer and/or seller name as it appears on the underlying agreement. If a trust or LLC signs, use the same representative-capacity wording as the RCSD already in the file."},
{s:"Additional agent identification",d:"Enter the additional agent's full name, DRE license number, and the brokerage name and DRE number. If the agent is from LPT, use the LPT broker-of-record name and license shown on the RPA page 16 broker section; if from another office, get the info from their broker, not from a business card."},
{s:"Role / party represented",d:"Check whether the additional agent represents the seller, the buyer, or both. This must match the agency confirmation in the RPA or the AD/PRBS already delivered. The AAA cannot create dual agency on its own; if the role is changing, use a CAC amendment plus new AD disclosures instead."},
{s:"Acknowledgement text",d:"The body states the additional agent has received and agrees to the agency disclosures and confirmations in the underlying agreement. Read it with the client; it does not change compensation. Any compensation split between the agents is handled inside the brokerage (or a referral/co-op agreement), never on this form."},
{s:"Signatures",d:"Client(s) sign and date; additional agent signs with license number; broker/manager signs where the form provides. SkySlope carries AAA-1 and AAA-2 so a second added agent gets its own copy. Upload under the agency/representation tab and send to escrow if the added agent will be on the commission instructions. Confirm with LPT broker/TC."}
],
"ABA":[
{s:"Header: purchase agreement reference",d:"Enter the purchase agreement date (the date the RPA was prepared, not acceptance) and the full property address. Mistake: using the acceptance date - escrow and the RPA both key off the contract date on page 1 of the RPA."},
{s:"Parties",d:"List all buyers and sellers exactly as on the RPA. If the RPA has been assigned or counter-offered with name changes, use the final names from the last counter."},
{s:"Additional broker identification",d:"Enter the additional brokerage name, its DRE firm license number, the agent's name and DRE number, and contact info. Confirm the DRE numbers on the DRE public license lookup; a wrong firm number is a frequent escrow hold."},
{s:"Party represented and agency",d:"Check which party the additional broker represents; it must agree with the RPA agency confirmation and the AD forms delivered. If adding the broker creates representation of both sides, the PRBS disclosure and written dual-agency consent are needed before signing."},
{s:"Compensation acknowledgement",d:"The ABA does not set compensation. After the Aug 2024 NAR settlement changes, a buyer-broker's fee must already be in a signed buyer agreement (BRBC/LPRBC) or a seller-paid instruction; note the source document in the blank if the form provides one (verify on the current form). Tell the MLO: seller-paid buyer-broker compensation shows on the CD."},
{s:"Signatures and delivery",d:"Additional broker/agent signs and dates; existing brokers acknowledge where lines are provided. Deliver to buyer, seller and escrow so commission instructions and the escrow contact sheet are updated. Upload to SkySlope under the RPA addenda. Confirm with LPT broker/TC before a second brokerage is added to any LPT file."}
],
"APD":[
{s:"Header and prior disclosure identified",d:"Enter property address, buyer and seller names, and check which prior disclosure is being amended: TDS, SPQ, AVID, ESD, lead disclosure, or other (verify checkbox list on the current form). Enter the date the prior disclosure was signed so the buyer can match it."},
{s:"Who is amending",d:"Check whether the seller, the listing agent or the buyer's agent is the party amending. The AVID is the agent's document, so only the agent amends an AVID; the seller amends TDS/SPQ answers. Agents must never write the seller's new facts for them."},
{s:"Description of new or corrected information",d:"Write the new fact plainly: what, where, when discovered, and any report attached (e.g., roof leak found 10/20/26, roofer report attached). Avoid characterizing severity or offering repair opinions. If the item changes a TDS answer, state which question number is changed."},
{s:"Signatures",d:"Seller (or agent) signs and dates. Buyer signs the receipt line. Deliver the same day it is signed; do not hold it for a convenient time."},
{s:"Rescission / timing implication",d:"A TDS or NHD amendment delivered after acceptance restarts the statutory right to terminate: 3 days after in-person delivery or 5 days after mailing (Civ. Code 1102.3); electronic delivery is treated like in-person per the RPA. Calendar it. A material new fact also feeds the buyer's investigation contingency if still open. Confirm with LPT broker/TC on any late amendment."},
{s:"Loan implication",d:"If the new fact is physical damage or a safety item, tell the MLO: the appraiser may need to re-inspect, and FHA/VA appraisal conditions can be added. Insurance binders can also be affected by newly disclosed claims or damage."}
],
"ARC":[
{s:"Client and transaction",d:"Enter the client name(s) and identify the transaction: property address or, for a buyer, a description such as the BRBC date. Each ARC copy in SkySlope (1-3) should name one client set; use additional copies for separate authorizations rather than cramming several on one."},
{s:"Authorized third parties",d:"List each person or company the agent may talk to: lender/MLO, loan servicer (short sale), attorney, CPA, family member, HOA. Include company, contact name, phone and email. Vague entries like my family are useless to a servicer; name the person."},
{s:"Scope of information",d:"Describe what may be shared and received: loan status, payoff figures, escrow documents, offer terms. Keep it to what the third party needs. Consider excluding the client's negotiating position unless the client wants the relative involved in decisions."},
{s:"Direction of authority",d:"The ARC authorizes conveying and receiving information; it is not a power of attorney and gives no one the right to sign. If the third party will sign, that requires a POA plus the RCSD."},
{s:"Term / expiration and revocation",d:"Enter an expiration date if desired (often close of escrow). Note that the client may revoke in writing; note how. Store a copy with each authorized party's contact in the file."},
{s:"Signatures and loan use",d:"Client signs and dates; agent signs acknowledgement where provided (verify on the current form). For Steven's MLO/agent coordination, have both buyer and borrower sign so the lender's privacy rules (GLBA) are satisfied when the agent asks for loan status; the lender may still require its own borrower authorization form."}
],
"BFPI":[
{s:"Header",d:"Enter the buyer name(s) and the BRBC/LPRBC date; the July 2024 release ties the BFPI to the buyer agreement and expects it delivered with the BRBC or within 5 days after signing (verify on the current form)."},
{s:"Financial information section",d:"Buyer states purchase price range, down payment source, pre-approval status and lender, and whether cash or financed. Enter what the buyer gives you; do not fill in numbers from a lender conversation without the buyer confirming. This information is for the agent to identify suitable properties, not a representation to sellers."},
{s:"Personal information / needs",d:"Captures household facts that affect the search (move timing, occupants, accessibility, pets). Keep answers to objective property needs; do not record protected characteristics (familial status, national origin, religion, disability detail) beyond what the buyer volunteers as a need."},
{s:"Authorization to share",d:"Check what the agent may send to listing agents with offers: pre-approval letter, proof of funds, both. Advise the buyer to provide a property-specific pre-approval from the MLO per offer and to redact account numbers and SSNs on proof-of-funds statements. The lender's full loan file is never shared."},
{s:"Signatures and storage",d:"Buyer signs and dates. Keep with the BRBC in the SkySlope buyer file. Update if the price range or financing type changes (a new BFPI or a note). Confirm with LPT broker/TC on the brokerage's privacy policy for storing financial documents."}
],
"BHIA":[
{s:"Header",d:"Enter buyer name(s) and property address. Deliver at offer stage; ideally when the buyer first considers a high fire-hazard area, since insurance availability can change what to offer."},
{s:"Insurance availability advisory",d:"The form explains that carriers may decline, non-renew or price coverage high in wildfire and other hazard areas, and that the California FAIR Plan plus a Difference-in-Conditions (DIC) policy may be the only option. Walk through it; do not predict a premium."},
{s:"Buyer action items",d:"Advise the buyer in writing to get quotes immediately and to review the CLUE claims history (RPA requires seller cooperation with insurance inquiries). Under the RPA the insurance investigation falls inside the investigation contingency (paragraph 8/12 depending on version - verify), so quotes must be in hand before contingency removal."},
{s:"Signatures",d:"Buyer signs and dates; agent signs the delivery acknowledgement if provided (verify on the current form). Upload with the offer package in SkySlope."},
{s:"Loan implication",d:"Lender requires an insurance binder before docs/funding; FAIR Plan + DIC premiums count in DTI and can push a tight file over the ratio. Tell the MLO the quoted premium as soon as the buyer has it so qualification is re-run before the loan contingency is removed."}
],
"BIPP":[
{s:"Header and date",d:"Enter buyer name(s), agent name and the date of the consultation. Tie it to the BRBC date. The BIPP was new in the June/July 2024 release and is confidential to the buyer and broker."},
{s:"Price and financing",d:"Enter price range, financing type (VA, FHA, conventional, cash, seller financing) and pre-approval status. Share these with the MLO so pre-approval amount and loan program match what the buyer is being shown; mismatch here is where VA/FHA buyers end up touring homes that will not pass appraisal conditions."},
{s:"Location and property type",d:"Enter cities, neighborhoods or school districts by name, property types (SFR, condo, 2-4 units, manufactured) and HOA tolerance. Record objective criteria only; a request such as a certain kind of neighbors is a fair housing problem and should be redirected."},
{s:"Size and features",d:"Bedrooms, baths, square footage, single-story vs multi-level, lot, garage, pool, green and accessibility features, condition tolerance (fixer vs turnkey). Use must-have vs nice-to-have columns where the form provides them (verify layout on the current form)."},
{s:"Deal-breakers and timing",d:"Note busy street, flood/fire zones, power lines, HOA restrictions, STR plans and the buyer's move-in deadline or lease end. These feed BMI and the investigation plan later."},
{s:"Signatures and updates",d:"Buyer signs and dates; agent keeps a copy with the BRBC in SkySlope. Re-date or complete a new BIPP when criteria change materially so the file shows the search matched the buyer's stated needs. It does not replace the BRBC or any agency form."}
],
"BMI":[
{s:"Header",d:"Enter buyer name(s) and date. Deliver with the BRBC or at the first consultation; it is a worksheet, not a contract."},
{s:"Checklist of issues",d:"The buyer checks the conditions material to them: noise, airport/freeway/rail, schools, views, flood or fire zones, HOA rules, pets, smoking, cell towers, cemeteries, planned development, and so on (verify exact list on the current form). Have the buyer check, not you."},
{s:"Explanation / deal-breakers",d:"Buyer writes why each checked item matters and marks deal-breakers. This tells you what to research on each listing (NHD, city planning, HOA docs) and what to ask the listing agent in writing."},
{s:"Fair housing guardrail",d:"Do not accept or record preferences about the protected characteristics of neighbors or occupants. Redirect to property-based criteria; the FHDA already signed explains why."},
{s:"Signatures and use",d:"Buyer signs and dates; keep with the BRBC in SkySlope. Revisit during tours and before writing; for a particular home, convert concerns into a BMI-SP so they reach the seller in writing."}
],
"BMI-SP":[
{s:"Header",d:"Enter property address, buyer name(s), and the purchase agreement date if an offer is already written; if used pre-offer, leave the RPA date blank and attach it to the offer later (verify on the current form)."},
{s:"List of material issues",d:"Write each concern in plain language: e.g., buyer needs confirmation no planned road widening on Elm St; buyer concerned about prior water intrusion in garage. One issue per line with what information or document the buyer wants from the seller."},
{s:"Informational vs. investigation item",d:"Indicate whether each item is informational or something the buyer will investigate under the RPA investigation contingency. Listing a concern here does not create a contingency; only the RPA (or an addendum) does. Get the seller's written answers before contingency removal."},
{s:"Delivery and seller response",d:"Deliver to the listing agent with the offer or during the contingency period. Track responses; a seller's written answer about a known issue is a disclosure and belongs in the disclosure package. An unanswered item should be chased before the CR deadline."},
{s:"Signatures",d:"Buyer signs and dates; seller acknowledgement line if provided (verify on the current form). Upload to SkySlope with the offer. Confirm with LPT broker/TC if the buyer wants an item made an actual condition of the contract - that is an RPA addendum, not this form."}
],
"BNA":[
{s:"Header and parties",d:"Enter buyer name(s), broker name and DRE number, agent name, and the property address or general description of what will be shown. Sign before any showing or service."},
{s:"Non-agency statement",d:"The form states the broker does not represent the buyer and owes no fiduciary duties; the agent may be the seller's agent on the property. Review it aloud. Do not give advice on price, offers or strategy to the buyer afterwards - that conduct creates implied agency regardless of the paper."},
{s:"Limited services",d:"Describe what the broker will do (open the door, deliver forms, pass offers to the seller) and will not do (advise, negotiate for the buyer). Keep the list narrow and consistent with the seller-side AD already given."},
{s:"Compensation",d:"State whether the buyer owes any compensation; usually none. Under MLS rules after the NAR settlement and Civil Code 1670.50 (AB 2992, eff. 1/1/2025) a written agreement is needed before touring; the BNA satisfies that for an unrepresented buyer. If a fee is stated it must be a specific amount or rate."},
{s:"Agency disclosure cross-check",d:"Deliver the AD form (buyer version) even to an unrepresented buyer before they sign an offer; the RPA confirmation will show the buyer as unrepresented or the listing agent as seller's agent only."},
{s:"Signatures and file",d:"Buyer and broker/agent sign and date. Upload to SkySlope. If the buyer later wants representation, replace with a BRBC and new AD; do not amend the BNA. Confirm with LPT broker/TC - some brokerages do not permit agents to work unrepresented buyers on their own listings."}
],
"BTA":[
{s:"Header",d:"Enter buyer name(s) and property address. Deliver at offer stage or immediately after acceptance; delivering at closing defeats the purpose and looks bad in a dispute."},
{s:"Deposit and contingency section",d:"Review the initial deposit timing (3 business days under the RPA), the loan, appraisal and investigation contingency days (default 17 unless changed), and that removals must be in writing on the CR form. Write the actual dates from the RPA in the margin or in your email to the buyer."},
{s:"Inspections, title, insurance, escrow",d:"Walk through recommended inspections, the preliminary title report review, insurance (pair with BHIA), escrow instructions and the final verification of condition. Note any items the buyer wants investigated and get them scheduled within the contingency window."},
{s:"Financing and credit",d:"Covers the buyer's duty to apply promptly and keep finances unchanged. MLO point: no new credit, job changes or large undocumented deposits until funding; remind the buyer the loan contingency date is not the funding date."},
{s:"Wire fraud and other advisories",d:"Review the wire fraud warning (confirm wiring instructions by phone to a known number) and any statutory advisories referenced; pair with the WFA and SBSA."},
{s:"Signatures",d:"Buyer signs and dates each page or the acknowledgement as the form provides. Upload with the offer package in SkySlope."}
],
"CAC":[
{s:"Header: contract identification",d:"Enter property address, the RPA (or other purchase agreement) date, and every buyer and seller name. The CAC is an amendment; if names do not match the contract, escrow will reject it."},
{s:"Prior confirmation cancelled",d:"Identify the agency confirmation being cancelled: the confirmation paragraph in the RPA (page 1 / paragraph 2B in the 2024-2025 RPA - verify) or a separate AC form, with its date."},
{s:"New agency confirmation",d:"For each brokerage, enter the firm name, DRE number, agent name and DRE number, and check the party represented: seller only, buyer only, or both. If one brokerage now represents both sides, dual agency exists and both principals must consent in writing."},
{s:"Supporting disclosures",d:"Deliver fresh AD forms to the affected parties and, for dual agency, the PRBS disclosure/consent before signing the CAC. Update the escrow commission instructions and the lender's contact sheet."},
{s:"Signatures",d:"All buyers, all sellers and both brokers sign and date. Send to escrow the same day. Upload to SkySlope under the RPA amendments; notify the MLO because agent contact info and any commission credit on the CD may change."}
],
"CCPA":[
{s:"Choose version",d:"Pick the Buyer/Tenant or Seller/Landlord version in SkySlope. Give it at the start of the relationship with the BRBC or listing agreement."},
{s:"Client identification",d:"Enter the client name(s) and the brokerage name. The advisory describes how the brokerage, MLS, lenders, escrow and vendors collect and share personal information."},
{s:"Rights and request process",d:"The form explains CCPA/CPRA rights to know, delete, correct and opt out of sale/sharing. Enter or point to the brokerage's privacy-request contact (LPT's privacy policy URL/email - confirm with LPT broker/TC). Do not promise deletion of transaction records the broker must keep by law (3 years under B&P 10148)."},
{s:"Signatures",d:"Client signs and dates; upload to SkySlope. Lender GLBA notices are separate; the MLO gives those."}
],
"CLA":[
{s:"Header and parties",d:"Enter seller name(s) exactly as on title (entity names with state of formation), property address, APN(s) and a legal description reference. Attach the RCSD-S for entity signers."},
{s:"Term and price",d:"Enter listing start and expiration dates and the list price. Check sale, lease, or both. Note any exchange (1031) cooperation language the seller wants."},
{s:"Compensation",d:"Enter the broker's compensation (percentage or amount) and when earned, the safety/protection period and the deadline to deliver the prospective-buyer list (NPB). State separately any amount the seller authorizes to be offered to a buyer's broker; post-2024 it cannot be published in the MLS, so it is communicated by the listing broker directly."},
{s:"Cooperation, MLS and marketing",d:"Check MLS submission or exclusion, CoStar/LoopNet/other platforms, signage, keysafe, and excluded prospects by name. Commercial listings are also subject to CRMLS clear-cooperation if entered in the residential MLS - verify with CRMLS."},
{s:"Seller representations and disclosures",d:"Seller represents ownership, authority, known tenancies, environmental conditions and pending notices. Attach rent roll, leases and operating statements now - buyers' DSCR/commercial lenders will require them. Commercial sales are exempt from the TDS but not from the duty to disclose known material facts; use the CSPQ."},
{s:"Signatures",d:"All owners and the broker sign and date. Upload to SkySlope with the CSPQ and AD (commercial AD applies - verify). Confirm with LPT broker/TC for commercial listing approval."}
],
"COBR":[
{s:"Header",d:"Enter the BRBC (or LPRBC) date, buyer name(s), brokerage name and agent. Match names to the original agreement."},
{s:"Effective date of cancellation",d:"Enter the date representation ends. Services after this date without a new agreement would violate the written-agreement rule, so stop touring that day."},
{s:"Compensation and protection list",d:"Check whether the broker keeps the right to compensation for properties shown or negotiated during the term (the BRBC's protection clause), waives it, or limits it. If retained, attach the property list and the protection period end date. Under AB 2992 buyer agreements cannot run longer than 3 months without written renewal; a cancellation does not extend any protection beyond what the BRBC says."},
{s:"Fees owed",d:"State any amount the buyer owes now (e.g., for a pending escrow). If a transaction is in escrow, the cancellation should not be signed until compensation on that deal is addressed in writing."},
{s:"Signatures",d:"Buyer(s) and the broker or designated manager sign; an individual agent cannot release the brokerage's agreement. Give the buyer a copy and upload to SkySlope. Confirm with LPT broker/TC before releasing any buyer with an open escrow."}
],
"COL":[
{s:"Header",d:"Enter listing agreement date, seller name(s) and property address exactly as on the RLA."},
{s:"Effective date",d:"Enter the cancellation date. Change the MLS status (Withdrawn/Cancelled) the same day; late status changes are a CRMLS citation item."},
{s:"Fees and reimbursement",d:"State any cancellation fee or marketing-cost reimbursement the seller has agreed to pay, or write none. Check what the RLA says about early cancellation first."},
{s:"Protection (safety) clause",d:"Check whether the broker keeps compensation rights for buyers introduced during the listing, and attach the NPB list within the RLA's deadline. If the seller relists with another broker, the RLA typically makes the clause inapplicable - read the paragraph before promising anything."},
{s:"Signatures and wrap-up",d:"All sellers on title and the broker sign and date. Remove the sign and lockbox, return keys, cancel showing services and photographers, and upload the COL to SkySlope. Confirm with LPT broker/TC on any fee the seller refuses to pay."}
],
"COOP-OA":[
{s:"Header",d:"Enter the property address and unit, and identify it as a stock cooperative. Deliver at listing (seller) and before writing an offer (buyer)."},
{s:"Nature of ownership",d:"The advisory explains the buyer gets shares in a corporation plus a proprietary lease or occupancy agreement, not a deed. Review that the co-op board can approve or reject buyers, that transfer fees and board rules apply, and that the blanket mortgage on the building is a shared risk."},
{s:"Financing and documents",d:"Note that share loans are limited; FHA/VA generally do not finance co-ops in California and conventional share loans are niche. Have the MLO confirm a product before the offer. Request the co-op's bylaws, financials and occupancy agreement."},
{s:"Signatures",d:"Buyer (and seller on the listing side) sign and date the acknowledgement. Attach the COOP-PA purchase agreement, not the RPA, for the contract. Upload to SkySlope."}
],
"CSPQ":[
{s:"Header",d:"Enter property address, APN(s) and the seller entity's legal name. Signers must be authorized by the entity; attach the RCSD-S."},
{s:"Structure, systems and condition",d:"Seller answers each question on roof, structure, HVAC, electrical, plumbing, ADA/accessibility compliance and known defects, explaining every yes with dates and reports. The agent never fills in answers; the seller's knowledge is what is being disclosed."},
{s:"Environmental",d:"Asbestos, underground tanks, hazardous materials, Phase I/II reports, dry-cleaner or auto-use history. Attach reports. Lenders will order their own Phase I; conflicting answers here cause problems."},
{s:"Tenants, leases and income",d:"Rent roll, lease terms, options, security deposits held, delinquencies, estoppels, management contracts and service contracts. These documents feed the buyer's DSCR underwriting; inaccuracies become lender conditions."},
{s:"Permits, zoning, litigation, notices",d:"Open permits, code violations, zoning conformity, pending litigation and government notices. Attach copies."},
{s:"Signatures and delivery",d:"Seller signers sign and date; buyer signs receipt. Deliver early in due diligence (CPA contingency period) so the buyer cannot claim late disclosure. Upload to SkySlope with attachments."}
],
"DBD":[
{s:"Header",d:"Enter the property address and every buyer or tenant name exactly as on the RPA or lease. The current RPA and C.A.R. leases already contain the Civil Code 2079.10a notice; the DBD is the stand-alone version for non-C.A.R. contracts or when the brokerage wants a separate signature."},
{s:"Statutory notice text",d:"The pre-printed paragraph refers buyers to meganslaw.ca.gov and explains that the DOJ database exists. Do not add commentary, research offender locations, or characterize the neighborhood - that is both a fair housing risk and beyond the agent's role."},
{s:"Delivery timing",d:"Deliver with the offer package or lease before signing. For a lease, give it with the application or before the tenant signs."},
{s:"Signatures and retention",d:"Each buyer/tenant signs and dates. Upload to SkySlope with the disclosure package and keep for the brokerage retention period (3 years minimum)."}
],
"FHDA":[
{s:"Header",d:"Enter client name(s) and the property address, or buyer search for a buyer client. Deliver with the RLA, BRBC or lease listing at the start of representation."},
{s:"Protected classes",d:"Walk through federal classes (race, color, religion, sex, national origin, familial status, disability) and California FEHA/Unruh additions (source of income including Section 8, sexual orientation, gender identity, marital status, age, ancestry, citizenship, immigration status, military status, genetic information, and others - verify current list on the form)."},
{s:"Prohibited conduct",d:"Explain steering, discriminatory advertising, refusing offers or tenants on protected grounds, and that the agent cannot follow a client's discriminatory instruction. Address offer love letters and buyer photos: LPT policy is generally not to transmit them - confirm with LPT broker/TC."},
{s:"Reasonable accommodations and modifications",d:"For landlords: the duty to allow assistance animals and reasonable modifications. For sellers: no limits on who may view based on protected class."},
{s:"Reporting and signatures",d:"The form lists how to report discrimination (HUD, CRD). Client signs and dates; upload to SkySlope with the representation agreement. Fair lending rules (ECOA) apply on the loan side; MLOs should treat every borrower by the same standards."}
],
"HID":[
{s:"Header",d:"Enter buyer name(s) and property address at the top of the HUD-92564-CN notice. Required for FHA-insured purchases; many agents give it to all financed buyers."},
{s:"What the notice says",d:"Explains that the FHA appraisal determines value and minimum property standards only and is not a home inspection. Correct the common belief that FHA passed the house."},
{s:"Inspection recommendation",d:"Recommend a licensed home inspection within the RPA investigation contingency period (default 17 days unless changed). If the buyer declines all inspections, document it on the BIW (Buyer Inspection Waiver)."},
{s:"Signatures and loan file",d:"Every buyer signs and dates; give them a copy. Send the signed notice to the MLO because FHA lenders require it at or before the sales contract is signed and underwriting will condition for it. Upload to SkySlope with the offer."}
],
"KLA":[
{s:"Header",d:"Enter seller name(s), property address and the listing agreement date. Attach to the RLA before the lockbox goes on."},
{s:"Seller authorization and risk advisory",d:"Seller checks authorization for a keysafe/lockbox (MLS electronic box vs. combination box) and acknowledges that neither broker nor MLS insures against loss or damage; the seller is told to verify homeowner's insurance coverage and to secure valuables, prescriptions and personal information."},
{s:"Tenant permission",d:"If tenant-occupied, the tenant signs permission for lockbox use and showings. Record showing restrictions, required notice (24-hour written notice of entry under Civ. Code 1954 still applies) and contact preferences. Without tenant consent, do not install a box."},
{s:"Access notes",d:"Enter alarm codes and access instructions only in the MLS private remarks/showing instructions, not on this form if it will be shared broadly (verify where the current form puts them)."},
{s:"Signatures and removal",d:"Seller (and tenant) sign and date; broker signs. Upload to SkySlope, then install. Remove the box when the listing closes, expires or cancels - leaving it is a CRMLS violation and a security issue."}
],
"LPRBC":[
{s:"Header and parties",d:"Enter each buyer's full legal name, the brokerage (LPT Realty) and its DRE number, and the representing agent with DRE number. The LPRBC is the limited, property-specific alternative to the BRBC introduced after the NAR settlement; use the current revision (BRBC family revised June 2025 - verify the LPRBC's date in SkySlope)."},
{s:"Properties covered",d:"List every property address the agreement covers. Showing a home not listed leaves you with no written agreement for that home; add addresses by a written modification before touring, or move to a BRBC."},
{s:"Term",d:"Enter the start and expiration dates. Under Civ. Code 1670.50 (AB 2992) the term cannot exceed 3 months and may not auto-renew; renew in writing. Showings must occur within the term."},
{s:"Compensation",d:"Enter a specific dollar amount or percentage that is objectively ascertainable - not whatever the seller offers. State that compensation is negotiable, who pays, and that seller or listing-broker payment is credited against the buyer's obligation. The broker may not receive more than this amount from any source."},
{s:"Agency and disclosures",d:"Deliver the AD, PRBS-B and FHDA with it; the form references them. Check whether the agent may act as a dual agent on these properties."},
{s:"Signatures and loan implication",d:"Buyer(s) and broker/agent sign and date before the first showing; give the buyer a copy and upload to SkySlope. If any part of the fee may be buyer-paid, tell the MLO: VA limits what the veteran can pay, and FHA/conventional count buyer-paid fees in cash to close; seller-paid amounts are not IPCs under current agency guidance but still appear on the CD."}
],
"LOHA":[
{s:"Header",d:"Enter the property address and the RLA date; check whether this is an addendum signed with the listing or an amendment added later."},
{s:"Authorization and limits",d:"Check that open houses are authorized and enter limits: days, hours, frequency, and whether broker opens or twilight events are included. Note any HOA rules on open houses."},
{s:"Who may host",d:"Identify permitted hosts: listing agent, other LPT agents, or other licensees. Unlicensed assistants cannot host. Note sign-in and ID requirements (use OHNA or PSI sheets)."},
{s:"Seller responsibilities",d:"Seller acknowledges securing valuables, medications, firearms, keys, mail and personal documents, and that the broker does not insure against loss. Pair with the PVOH advisory for visitors and disclose any cameras."},
{s:"Signatures",d:"Seller and broker sign and date; keep with the RLA in SkySlope. Advise the seller in writing before each event about securing valuables."}
],
"LPD-RLAS":[
{s:"Applicability",d:"Confirm the home was built before 1978. Enter the property address and the RLAS (Residential Lease After Sale) date this disclosure attaches to. Roles reverse: the buyer is the landlord/lessor, the seller is the tenant/lessee."},
{s:"Lessor's disclosure",d:"Buyer-landlord checks known lead-based paint/hazards or no knowledge, and lists records available - usually the seller's own lead disclosure and any reports from the sale. Attach them."},
{s:"Lessee's acknowledgment",d:"Seller-tenant initials receipt of the records list and of the EPA pamphlet Protect Your Family From Lead in Your Home. A 10-day inspection opportunity is not required for leases, only for sales."},
{s:"Agent certification",d:"Both agents sign certifying they informed the lessor of the federal obligations. Skipping this leaves the agents exposed to federal penalties even though the sale-side LPD was done."},
{s:"Signatures, delivery and loan note",d:"All parties and agents sign and date before the lease term begins; attach to the RLAS and upload to SkySlope. Loan point: owner-occupied financing generally expects buyer occupancy within 60 days; an RLAS beyond that conflicts with the occupancy certification - tell the MLO before the RLAS term is set."}
],
"MCN":[
{s:"Confirm the order",d:"Obtain a copy of the local health officer's order (methamphetamine or fentanyl contamination, Health & Safety Code 25400.10 et seq.) and the current status. Disclosure is required until the property is remediated and the order is lifted."},
{s:"Notice content",d:"Enter property address, the date of the order, the issuing agency, and attach the order. Do not summarize the order in your own words; attach it."},
{s:"Delivery",d:"Deliver to a buyer before transfer (with the disclosure package, and ideally before the offer) and to a tenant before the lease is signed. Note that the property may be required to remain unoccupied until remediated."},
{s:"Signatures",d:"Buyer or tenant signs and dates the acknowledgment; seller/landlord signs. Keep with the TDS/SPQ in SkySlope and keep the clearance letter once issued."},
{s:"Loan implication",d:"An open order is a health and safety condition; FHA, VA and nearly all lenders will not fund until clearance is documented, and the appraiser must be told. Plan the timeline around remediation."}
],
"MHTDS":[
{s:"Header and home identification",d:"Enter the home's address or space number, park name, HCD decal/serial numbers and year. The MHTDS (Civ. Code 1102.6d) is the mobilehome equivalent of the TDS."},
{s:"Section I: seller's features and condition",d:"Seller checks features (appliances, systems, skirting, awnings, earthquake bracing/tie-downs) and answers whether each is in working order, then answers the defect questions and park/community questions (space rent, rules, pending park sale). Seller completes personally; the agent never fills answers."},
{s:"Section II/III: agent visual inspection",d:"Listing agent completes the visual inspection section based on a reasonably competent and diligent inspection of accessible areas; the buyer's agent completes a separate section. Note observed items plainly (e.g., soft spot in hall floor); do not diagnose."},
{s:"Delivery timing",d:"Deliver within the RPA seller-disclosure period (7 days default on the MH-PA/RPA - verify). Late delivery gives the buyer a 3-day/5-day statutory termination right; calendar it."},
{s:"Signatures",d:"Seller signs; both agents sign their sections; buyer signs receipt. Upload to SkySlope. Loan note: chattel vs. real-property status (whether the home is on a permanent foundation with a 433A) decides which lenders can finance; tell the MLO early."}
],
"MLSA":[
{s:"Header",d:"Enter property address and the RLA date this addendum attaches to. Use when the listing form lacks MLS terms or the seller wants a delayed or limited MLS submission."},
{s:"MLS submission election",d:"Check submission within the MLS deadline (CRMLS: within 2 business days of listing signing for Active, or per current rule - verify) or exclusion/delay. CRMLS office-exclusive listings require the seller exclusion form (SELI/CRMLS seller instruction) and must not be publicly marketed, or Clear Cooperation requires MLS entry within one business day."},
{s:"Data and display options",d:"Note items the seller does not want displayed: address, photos, AVM/automated valuations, blog comments, days on market. These map to MLS opt-out fields."},
{s:"Status changes and accuracy",d:"Seller authorizes the broker to submit data and status changes; the seller is responsible for accuracy of information provided. Keep source documents for square footage and year built."},
{s:"Signatures",d:"All sellers sign and date; broker signs. Upload to SkySlope before any marketing. Confirm with LPT broker/TC on current CRMLS deadlines - they change."}
],
"MT-BR":[
{s:"Header",d:"Enter the BRBC date and buyer name(s), brokerage and agent. SkySlope carries MT-BR-1 to -4; use the next unused number each time so the file shows the sequence."},
{s:"Items modified",d:"Check what changes: expiration date (new date cannot extend the agreement beyond the 3-month limit per Civ. Code 1670.50 without counting as a written renewal - verify how the form handles this), compensation amount or rate, property type/area/price range, exclusivity, or other."},
{s:"Property-specific compensation",d:"If compensation changes for one property (e.g., to match a seller's offered amount), identify that property address. A change must be signed before it applies and before the offer is written; the broker still cannot collect more than the agreement states."},
{s:"Effective date and other terms",d:"Enter the effective date and any other terms in the blank lines. Everything else in the BRBC stays in force."},
{s:"Signatures and loan note",d:"All buyers and broker/agent sign and date; give the buyer a copy and upload to SkySlope. Send the final compensation terms to the MLO because buyer-paid or seller-credited amounts affect cash to close and CD disclosure."}
],
"MT-LA":[
{s:"Header",d:"Enter the RLA date, property address and seller name(s)."},
{s:"Items changing",d:"Check and complete: new list price, new expiration date, compensation (broker's fee and/or amount authorized to offer buyer brokers), and other terms (e.g., removing a keysafe, changing marketing). Each change needs the new value written out."},
{s:"Additional terms",d:"Use the blank section for anything not covered, such as a new seller concession strategy or lease-back willingness."},
{s:"Signatures",d:"All sellers on title (or authorized representatives with RCSD) and the broker sign and date. A price change in CRMLS without a signed MT-LA (or other written authorization) is a common audit flag."},
{s:"MLS and file",d:"Update CRMLS within the rule deadline after signing and upload to SkySlope. If compensation to buyer brokers changes, update any seller-paid compensation communications to cooperating agents."}
],
"NBIP":[
{s:"Header",d:"Enter the licensee's name, brokerage, DRE number and the property address. Deliver before the other party signs the RPA or listing. (Verify the exact title and layout on the current form; SkySlope lists it as Notice of Broker Involved Properties.)"},
{s:"Nature of interest",d:"Describe the interest plainly: licensee is the owner/seller; licensee is the buyer; a party is the licensee's spouse, parent, child or sibling; the licensee holds an interest in the buying/selling entity. Disclose even small or indirect interests."},
{s:"Acknowledgment",d:"The other party signs and dates acknowledging the disclosure. Also disclose licensee status in the RPA (buyer/seller is a licensee checkbox - verify) and in MLS remarks per CRMLS rules."},
{s:"File and loan implication",d:"Upload to SkySlope; LPT may require broker approval for agent-principal deals - confirm with LPT broker/TC. Lenders treat these as non-arm's-length: FHA limits LTV on identity-of-interest deals, VA and conventional have added conditions; tell the MLO at pre-approval."}
],
"NCOA":[
{s:"Header",d:"Enter buyer name(s) and property address. Use whenever the offer waives or shortens any contingency to zero."},
{s:"Contingencies being waived",d:"Check loan, appraisal, investigation, sale of buyer's property, or others as listed (verify on the current form). For each, the form explains the risk: no exit if the loan fails, appraisal gap paid in cash, defects discovered after removal are the buyer's problem."},
{s:"Deposit risk",d:"Explain that without contingencies the deposit is at risk if the buyer cannot close; the RPA liquidated damages clause caps it at 3% for 1-4 unit owner-occupied if initialed."},
{s:"Buyer initials and signature",d:"Buyer initials each applicable item and signs/dates. Keep in the buyer file; it is not usually sent to the seller."},
{s:"Loan implication",d:"Before waiving loan/appraisal contingencies the MLO should provide a full underwriting (TBD) approval and an appraisal gap strategy, and confirm the buyer has reserves for the gap. Document the advice in an email."}
],
"NPB":[
{s:"Header",d:"Enter seller name(s), property address and the RLA date. Deliver within the RLA's deadline after expiration or cancellation (commonly 3 calendar days - verify your RLA paragraph)."},
{s:"List of prospective buyers",d:"List each buyer by name who toured, made an offer or received property information during the listing, with the date of contact or showing and the agent they used if any. Open house sign-in sheets (OHNA/PSI) are your source; keep them."},
{s:"Protection period",d:"State the protection period end date from the RLA. The seller owes compensation if a listed buyer purchases within that period, unless the seller lists with another broker under terms that make the clause inapplicable."},
{s:"Delivery proof",d:"Send by email with read receipt or get the seller's signed acknowledgment. Missing the delivery deadline forfeits the protection."},
{s:"File",d:"Upload the NPB and delivery proof to SkySlope and calendar the protection expiration. Confirm with LPT broker/TC before asserting a commission claim."}
],
"NSF":[
{s:"Header and forms identified",d:"Enter client name(s), property address and list each non-C.A.R. document by title and source: bank REO addendum, builder purchase contract, relocation company addendum, attorney-drafted addendum."},
{s:"Advisory content",d:"Explain that non-standard forms may conflict with the C.A.R. RPA, may shift risk to the client (as-is, shortened contingencies, deposit forfeiture, venue), and that the client should have an attorney review conflicting terms. Note in your file which document controls per its own language."},
{s:"Signatures",d:"Client signs and dates before signing the non-standard forms. Upload with those forms in SkySlope."},
{s:"Loan implication",d:"Builder and REO contracts often require the seller's lender or a specific closing date; tell the MLO about any lender-choice incentives or hard closing deadlines in the non-standard contract."}
],
"NTF":[
{s:"Source check",d:"Review the preliminary title report and CC&Rs for a recorded private transfer fee covenant (Civ. Code 1098/1098.5). SkySlope has NTF-1 to -3 for multiple fees."},
{s:"Notice content",d:"Enter the fee amount or calculation method (e.g., 0.5% of sales price), the payee, the purpose stated in the recorded document, and the recording information. Attach the recorded instrument."},
{s:"Delivery",d:"Deliver to the buyer during the RPA seller disclosure period and before contingency removal. The notice is a statutory disclosure (Civ. Code 1102.6e) separate from the TDS."},
{s:"Signatures and closing",d:"Buyer signs and dates receipt; seller signs. Upload to SkySlope. Coordinate with escrow and title on collection at closing. Loan note: lenders check for transfer fee covenants (Fannie/Freddie restrict certain private transfer fees created after 2011); send the recorded document to the MLO."}
],
"OHNA":[
{s:"Header",d:"Enter property address, date and host agent name/brokerage at the top of the sheet."},
{s:"Non-agency statement",d:"The pre-printed text tells visitors the host represents the seller (or is not their agent) and owes them no fiduciary duty. Point to it before discussing price, seller motivation or offers."},
{s:"Visitor lines",d:"Visitors write name, phone/email, and whether they are working with an agent (and who). Do not require ID numbers or sensitive data to enter; apply the same sign-in rule to everyone."},
{s:"Use after the event",d:"Keep the sheets with the listing file (source for the NPB list and seller feedback). Follow up only within Do-Not-Call, CAN-SPAM and CCPA rules. If an unrepresented visitor wants to see other homes, a written buyer agreement (BRBC/LPRBC) is required before touring."}
],
"PHSA":[
{s:"Header",d:"Enter property address, buyer and seller names and the RPA date; attach to the purchase agreement."},
{s:"Pool/spa identification",d:"Check pool, spa, hot tub; in-ground or above-ground; and whether it is shared (HOA) or private."},
{s:"Existing drowning-prevention features",d:"Check which of the seven Pool Safety Act features exist (Health & Safety Code 115922): enclosure/fence with self-closing self-latching gate, removable mesh fence, safety cover, exit alarms on doors to the pool, self-closing self-latching door devices, pool alarm, or other approved device. The home inspector must also report on these for 1-4 unit sales."},
{s:"Responsibility for upgrades",d:"Allocate who pays for any required features, anti-entrapment drain covers, or city-required inspections before closing. Many cities require two safety features at sale; check the local requirement early."},
{s:"Signatures and tracking",d:"Buyer and seller sign and date; deliver to escrow and track completion before closing. Loan note: FHA/VA appraisers report pool hazards (empty pools, missing barriers) as repair conditions."}
],
"PIA":[
{s:"Header",d:"Enter property address, seller name(s), listing broker and the RLA date. Use at listing."},
{s:"Image source",d:"Check whether images are seller-provided, broker-commissioned, or both. Enter the photographer/vendor name; note that the photographer usually retains copyright and licenses use to the broker."},
{s:"License scope",d:"State what the broker and MLS may do with the images: MLS display, syndication, social media, print. CRMLS also takes a license of listing content when you upload; the PIA aligns the seller's consent with that."},
{s:"Post-listing use",d:"Check whether the broker may use images after expiration or closing (portfolio, testimonials) and whether seller-provided images must be removed. Include the buyer's interest after closing in your thinking - many buyers object to continued use."},
{s:"Signatures",d:"Seller and broker sign and date; keep with photography invoices and the RLA in SkySlope."}
],
"PRBS-B":[
{s:"Header",d:"Enter buyer name(s), brokerage and agent name. The PRBS was split into buyer (PRBS-B) and seller (PRBS-S) versions in a recent release (verify date on the form); deliver with the BRBC/LPRBC before showing."},
{s:"Disclosure content",d:"Explains that the brokerage may represent other buyers competing for the same property, may represent the seller of a property the buyer wants (dual agency), and how confidential information is handled. Review the dual agency paragraph alongside the AD form."},
{s:"Consent",d:"Buyer indicates consent to these possible representations by signing; there is no opt-out that keeps the agreement whole, so answer questions before signing rather than altering the form."},
{s:"Signatures and renewal",d:"Buyer signs and dates; agent signs. Upload to SkySlope with the buyer agreement; re-deliver when the agreement is renewed or replaced. Never share one buyer's offer terms with another buyer you represent."}
],
"PRBS-S":[
{s:"Header",d:"Enter seller name(s), brokerage and listing agent. Deliver with the RLA at the listing appointment; it is a separate signature from the RLA."},
{s:"Disclosure content",d:"Explains that the brokerage may list competing properties, may represent buyers who view this and other listings, and may end up representing both sides (dual agency). Review with the AD seller version."},
{s:"Consent",d:"Seller consents by signing. Keep pricing strategy and motivation confidential among competing sellers the office represents."},
{s:"Signatures and renewal",d:"Seller signs and dates; agent signs. Upload to SkySlope with the RLA; re-deliver when the listing is extended or rewritten under a new agreement."}
],
"PSD":[
{s:"Header",d:"Enter property address and unit, HOA/project name, buyer and seller names. Use for condos, co-ops, PUDs and multifamily with assigned parking or storage."},
{s:"Parking spaces",d:"List each space by number and location and check its type: deeded (in the legal description), exclusive-use common area (per CC&Rs/condo plan), assigned by the HOA (can change), or rented. Enter EV charging availability and restrictions."},
{s:"Storage units",d:"Same for storage lockers, bike storage and other areas. Note fees and waitlists."},
{s:"HOA rules",d:"Note guest parking limits, permit requirements, towing policies and any pending rule changes. The seller's statements must match the HOA documents and preliminary title report; have the buyer compare them during the HOA document review."},
{s:"Signatures",d:"Seller signs and delivers within the RPA disclosure period; buyer signs receipt. Upload to SkySlope. Loan note: the appraiser and condo questionnaire report parking; a deeded space missing from the legal description can affect value and title."}
],
"PSI":[
{s:"Header",d:"Enter property address, date, host agent name and brokerage. Use at open houses and showings where the seller wants rules posted and visitors recorded."},
{s:"Showing guidelines",d:"Check or write the rules: remove shoes, no photos/video, no touching personal items, children supervised, no food, limited party size. Post them at the door or read them to each visitor. Apply the same rules to everyone to stay within fair housing."},
{s:"Visitor sign-in",d:"Visitors write name, contact and whether they are represented and by whom. Do not require driver's license numbers or other sensitive data."},
{s:"Retention and follow-up",d:"Keep the sheet in the listing file as a security record, for seller feedback and as the source list for the NPB. Follow up only within Do-Not-Call, CAN-SPAM and privacy rules; unrepresented visitors need a written buyer agreement before touring other homes."}
],
"PSRA":[
{s:"Status of this form",d:"The PSRA was C.A.R.'s short showing-and-representation agreement issued in mid-2024 right after the NAR settlement. Later releases added the LPRBC (limited property) and revised the BRBC (June 2025); check the SkySlope library for which form LPT wants used for single showings and confirm with LPT broker/TC. Fields below are generic (verify on the current form)."},
{s:"Header and parties",d:"Enter buyer name(s), brokerage (LPT Realty) with DRE number, agent name and DRE number, and the property or properties to be shown."},
{s:"Term",d:"Enter start and end dates - typically the showing day or a few days. Cannot exceed 3 months and cannot auto-renew (Civ. Code 1670.50); services after expiration without a new agreement violate the written-agreement rule."},
{s:"Representation and compensation",d:"State whether the broker represents the buyer for these showings and enter a specific compensation amount or rate (objectively ascertainable). Note that the broker may not receive more than stated from any source and that seller/listing-broker payment is credited. Deliver the AD and PRBS-B."},
{s:"Signatures and conversion",d:"Buyer and broker/agent sign and date before touring; upload to SkySlope. If the relationship continues, replace with a BRBC (do not keep stacking short agreements). Loan note: if the buyer could owe any fee, tell the MLO because it changes cash to close and VA allowable fees."}
],
"PVOH":[
{s:"Placement",d:"Post the advisory at the entrance or hand it to each visitor on arrival; attach it to showing instructions for buyer's agents. Enter property address and date if the form has blanks (verify on the current form)."},
{s:"Surveillance disclosure",d:"States that the seller may have audio/video devices (doorbells, interior cameras) recording. California is a two-party consent state for confidential conversations (Penal Code 632); advise sellers in writing to disable audio recording during showings."},
{s:"Visitor conduct",d:"Reminds visitors not to discuss price, motivation or negotiating strategy inside the home and that the host may not represent them. Buyer's agents should coach clients before entering."},
{s:"Acknowledgment",d:"If the seller requires it for entry, visitors sign the acknowledgment; otherwise keep the posted copy and any signed copies with the listing file in SkySlope."}
],
"PVR":[
{s:"Header",d:"Enter property address, owner name(s), listing broker and the photographer/videographer or vendor. Sign before the shoot, especially for occupied units."},
{s:"Media types",d:"Check photos, video, drone/aerial, 3D/virtual tour, floor plans. Drone work must be by an FAA Part 107 operator; note the operator."},
{s:"Permitted uses and duration",d:"State where media may appear (MLS, syndication, social, print, broker portfolio) and for how long, including after closing. Coordinate with the PIA if both are used so the license terms match."},
{s:"Occupant release",d:"Any occupant or person who may appear in images signs the release. Tenants must consent before an occupied unit is photographed; their belongings and identifying items should be excluded or blurred."},
{s:"Signatures and file",d:"Owner, occupants and broker sign and date; store with vendor invoices in the SkySlope listing file."}
],
"RCSD":[
{s:"Choose the right version",d:"SkySlope offers RCSD-B (buyer) -1 to -6, RCSD-S (seller) -1 to -6, RCSD-T (tenant) -1 to -2 and a housing provider version. One form per representative signer; use the next number for each additional signer."},
{s:"Principal identification",d:"Enter the principal's legal name exactly as on title or formation documents: e.g., The Smith Family Trust dated 1/1/2010; ABC Holdings, LLC, a California limited liability company; Estate of Jane Doe; or the individual for whom a POA acts."},
{s:"Representative and capacity",d:"Enter the representative's name and capacity: trustee, co-trustee, managing member/manager, officer, general partner, executor/administrator, attorney-in-fact, conservator. The signature on the contract should then read Name, Trustee (or as the form instructs)."},
{s:"Proof of authority",d:"Attach a trust certification (Probate Code 18100.5), LLC operating agreement/statement of information, corporate resolution, letters testamentary, or the recorded POA. Escrow/title will require these before closing; probate sales also need court confirmation or IAEA authority."},
{s:"Signatures and delivery",d:"Representative signs and dates; attach to the RPA, RLA or lease and deliver to escrow. Loan note: lenders restrict trust vesting (revocable trusts generally OK; LLC buyers usually need non-QM/DSCR) and require lender approval of any POA, often with a specific POA for the loan - tell the MLO at application."}
],
"RGM":[
{s:"Header",d:"Enter property address, buyer and seller names and the RPA date. Deliver before the investigation contingency expires; earlier for homes with basements, crawl spaces or prior water intrusion."},
{s:"Radon section",d:"Explains radon is a naturally occurring gas, that brokers cannot detect it, and how to test (short-term kit or certified tester). California radon potential maps by zip are available from CDPH; some foothill and coastal counties have elevated potential."},
{s:"Mold section",d:"Explains mold and moisture risks and that visible mold may indicate hidden water intrusion. Recommend inspection and testing by a licensed professional within the contingency period; the seller still must disclose known mold or water intrusion on the TDS/SPQ."},
{s:"Release",d:"Buyer releases the brokers from liability for radon and mold conditions. Have the buyer note testing ordered or declined (in the blank or by email). Encourage testing in writing rather than accepting a verbal waiver."},
{s:"Signatures",d:"All buyers sign and date; brokers sign where provided; seller may acknowledge. Upload to SkySlope before CR. Loan note: visible mold noted by an FHA/VA appraiser becomes a repair condition before funding."}
],
"RLAN":[
{s:"Header and parties",d:"Enter seller name(s) exactly as on title, property address, APN and list price. Enter beginning and ending dates of the open (non-exclusive) listing."},
{s:"Non-exclusive terms",d:"The seller may list with other brokers or sell on their own; this broker earns compensation only if this broker procures the buyer who closes. Explain the procuring-cause exposure and keep a written log of every buyer you introduce, with dates."},
{s:"Compensation",d:"Enter the compensation (percentage or amount), when earned, and any amount the seller authorizes for a buyer's broker. Post-2024, buyer-broker compensation is not published in MLS; it is communicated directly."},
{s:"Agency and MLS",d:"Complete the agency disclosure section and deliver the AD/PRBS-S. Confirm with CRMLS whether an open listing may be entered or advertised; many MLS rules require exclusive-right or exclusive-agency for entry (verify current CRMLS rule)."},
{s:"Seller representations and disclosures",d:"Seller represents ownership, authority and known defects; note items to be disclosed on the TDS/SPQ. Attach the SA and FHDA."},
{s:"Signatures",d:"All sellers and broker sign and date; upload to SkySlope. Confirm with LPT broker/TC - some brokerages discourage open listings."}
],
"RLASR":[
{s:"Header and parties",d:"Enter seller name(s) as on title, property address, APN, list price, and listing start and expiration dates. This is an exclusive listing except as to reserved buyers."},
{s:"Reserved buyers",d:"List each reserved prospective buyer by full legal name (e.g., neighbor John Lee; tenant Maria Perez) and the period the reservation lasts (e.g., first 30 days). Vague entries such as family members cause disputes."},
{s:"Compensation",d:"Enter full compensation for a sale to any non-reserved buyer, and the reduced compensation (or none) if a reserved buyer purchases within the reservation period. State any amount authorized for a buyer's broker."},
{s:"MLS, keysafe, signage, marketing",d:"Complete the elections; confirm with CRMLS how a seller-reserved exclusion is entered (exclusive agency vs exclusive right field - verify)."},
{s:"Standard RLA sections",d:"Complete agency disclosure, seller representations, dispute resolution and attorney fees as on the RLA; deliver AD, PRBS-S, FHDA and SA."},
{s:"Signatures",d:"All sellers and broker sign and date; upload to SkySlope before marketing. Confirm with LPT broker/TC."}
],
"RPOA":[
{s:"Header",d:"Enter the owner's name(s) and the rental property address. Deliver at the property management or lease listing appointment before advertising."},
{s:"Fair housing and screening",d:"Review protected classes including source of income (Section 8), assistance animals, criminal history limits, and the application screening fee cap and screening-report rules (Civ. Code 1950.6)."},
{s:"Rent control and just cause",d:"Identify whether AB 1482 (Civ. Code 1946.2/1947.12) applies: statewide rent cap and just-cause eviction for most units older than 15 years, with exemptions for some SFRs if the required notice is in the lease. Note any stricter city/county ordinance in writing."},
{s:"Habitability, deposits, entry",d:"Security deposit limit of one month's rent (AB 12, since 7/1/2024, with small-landlord exception), move-in/move-out photo requirements (AB 2801), 21-day deposit accounting, 24-hour written entry notice, and habitability duties."},
{s:"Required tenant disclosures",d:"Lead-based paint (pre-1978), Megan's Law, bed bugs, flood zone, mold booklet, smoking policy, pest control, military ordnance, and the AB 1482 notice as applicable. Point the owner to the C.A.R. lease package."},
{s:"Signatures",d:"Owner signs and dates; recommend attorney/tax advice for eviction and tax questions. Upload to the property management or lease listing file in SkySlope."}
],
"SA":[
{s:"Header",d:"Enter property address and every seller's name as on the RLA. Deliver at the listing appointment; the buyer gets a copy with disclosures after acceptance."},
{s:"Disclosure duties",d:"Review the TDS, SPQ, NHD, lead, Megan's Law, water heater/smoke/CO, and death-on-property items, and the duty to disclose all known material facts even if not asked. Explain that the agent completes the AVID separately."},
{s:"Property condition and inspections",d:"Covers pre-listing inspections, permits and unpermitted work, pool safety, and the buyer's investigation rights."},
{s:"Taxes, title, HOA, escrow",d:"Withholding (FIRPTA/Cal 593), capital gains, HOA document delivery duties (Civ. Code 4525), prelim title review, and escrow/closing costs. Recommend tax advice."},
{s:"Contingencies, insurance, occupancy",d:"Explains buyer contingencies and removal, insurance availability issues for buyers, and post-closing possession risks (pair with SIPA if a rent-back is likely)."},
{s:"Signatures",d:"Every seller signs and dates at listing; upload with the RLA. Include in the buyer's disclosure package and obtain the buyer's signature; upload the fully signed copy. The SA does not replace the TDS/SPQ."}
],
"SELI":[
{s:"Header",d:"Enter seller name(s) and property address as on the RLA."},
{s:"Exclusion election",d:"Check the specific instruction: exclude the listing from all internet display, or display the listing but not the address, or no AVM/comments (verify options on the current form). These map to CRMLS internet display opt-outs."},
{s:"Exposure advisory",d:"The seller acknowledges that limiting internet display reduces exposure and may reduce showings and offers. Explain it in writing and keep the email."},
{s:"Clear Cooperation check",d:"Excluding from the internet is different from excluding from the MLS. If the property is publicly marketed, CRMLS still requires MLS entry within one business day; an office exclusive needs the CRMLS seller exclusion form instead. Confirm current CRMLS policy."},
{s:"Signatures",d:"All sellers sign and date; submit to CRMLS if its rules require and upload to SkySlope with the RLA."}
],
"SNA":[
{s:"Choose version",d:"SkySlope has SNA (Seller Non-Agency Agreement) and the Seller (or Housing Provider) Non-Agency version for leases. Use when you represent only the buyer/tenant and need the seller/landlord's written agreement to pay you or to confirm no agency."},
{s:"Header and parties",d:"Enter seller/housing provider name(s), property address, your brokerage and agent, and the buyer/tenant you represent."},
{s:"Non-agency statement",d:"States you do not represent the seller/landlord and will not advise them. Do not help them with pricing, disclosures or negotiations; direct them to get their own representation or counsel."},
{s:"Compensation",d:"Enter the amount or rate the seller agrees to pay your brokerage, when earned (close of escrow or lease execution), and payment through escrow. Post-NAR settlement, this seller-paid amount is credited against what the buyer owes under the BRBC/LPRBC and cannot exceed it."},
{s:"Signatures and loan note",d:"Seller/housing provider and broker sign and date before the offer or application is submitted; upload to SkySlope and give escrow a copy for disbursement. Seller-paid buyer-broker compensation must be disclosed to the lender; VA treats it separately from seller concessions."}
],
"CRMLS-CS":[
{s:"Choose version",d:"Two CRMLS forms: Seller Instruction to Place Listing into Coming Soon Status, and Seller's Instructions for Limited Exposure in Coming Soon Status. Use the one that matches what the seller wants; CRMLS rules change, so verify the current form and time limits on crmls.org."},
{s:"Header",d:"Enter seller name(s) and property address exactly as on the RLA, and the listing agent/brokerage."},
{s:"Coming Soon election and dates",d:"Check Coming Soon (or Limited Exposure) and enter the planned Active date. CRMLS currently limits Coming Soon duration (21 days - verify) and no showings are allowed while in Coming Soon; the listing must be a signed exclusive listing."},
{s:"Seller acknowledgments",d:"Seller acknowledges the showing restriction, that days on market start at Active, and that the limited-exposure version restricts syndication/public display per CRMLS rules."},
{s:"Signatures and file",d:"All sellers sign and date; keep on file or submit to CRMLS as required. Upload to SkySlope and calendar the Active deadline so the listing does not sit past the limit."}
],
"SFLS":[
{s:"Header",d:"Enter property address, buyer and seller names. Deliver before the investigation contingency expires whenever size figures are advertised."},
{s:"Sources of size figures",d:"Explains that square footage and lot size may come from assessor records, MLS, prior appraisals, builder plans or the seller, and that these sources often disagree and may not be accurate."},
{s:"Verification recommendation",d:"Recommend in writing that the buyer hire an appraiser, architect or surveyor to measure if size affects price or decision. Note the ANSI Z765 standard used by appraisers for gross living area."},
{s:"Marketing guardrail",d:"Never state square footage as fact in marketing; cite the source (per assessor). Keep the source document in the file."},
{s:"Signatures",d:"Every buyer signs and dates; seller may sign. Upload to SkySlope. Loan note: the appraiser measures independently; a large discrepancy can lower value and trigger an appraisal gap."}
],
"SIPA":[
{s:"Header",d:"Enter property address, buyer and seller names and the RPA date. Deliver as soon as a post-closing possession term appears in the offer or a counter. (Verify the title/layout on the current form.)"},
{s:"Risks reviewed",d:"Insurance gap (buyer's policy vs seller's), damage after closing, utilities, personal property, and that a seller who stays long may acquire tenant protections requiring formal eviction."},
{s:"Governing agreement",d:"Confirm which form controls the stay: SIP (Seller in Possession Addendum) for short stays (typically under 30 days - verify) or RLAS (Residential Lease After Sale) for longer terms with rent and deposit. Make sure the chosen form is attached to the RPA."},
{s:"Signatures",d:"Every buyer and seller sign and date before possession terms are final; upload to SkySlope with the SIP/RLAS and give escrow a copy."},
{s:"Loan implication",d:"Owner-occupied loans require the buyer to occupy within 60 days of closing; a rent-back beyond that conflicts with the occupancy certification. Tell the MLO the rent-back length before the contract is final."}
],
"SOLAR":[
{s:"Header",d:"Enter property address, seller and buyer names. Seller completes the questionnaire at listing; buyer receives it with disclosures."},
{s:"System ownership",d:"Seller checks owned outright, financed (loan or PACE assessment on the tax bill), leased, or power purchase agreement (PPA). Enter the provider/lender, account contact, monthly payment, remaining term and buyout options."},
{s:"System details",d:"Installation date, installer, system size, battery storage, net metering (NEM) agreement, warranties and transfer requirements. Attach the solar contract and any NEM paperwork."},
{s:"Liens and UCC filings",d:"Identify any UCC-1 fixture filing or lien recorded against the property; leases and PPAs usually have one. Escrow and title need the payoff or UCC termination/assumption handled before closing."},
{s:"Advisory and signatures",d:"Buyer reads the advisory on obligations and signs; seller signs the questionnaire. Send copies to escrow and the MLO. Loan note: lenders require the lease/PPA and UCC details; FHA/VA count lease payments in DTI and PACE assessments must usually be paid off at sale."}
],
"SPT":[
{s:"Header",d:"Enter property address and buyer name(s). Deliver with the disclosure package; it is the statutory notice under Civ. Code 1102.6c."},
{s:"Notice content",d:"Explains that the county will reassess on change of ownership and send one or more supplemental tax bills directly to the owner, prorated from the closing date, and that the lender's impound account does not pay them."},
{s:"Buyer guidance",d:"Tell the buyer to expect the bill several months after closing, that escrow tax prorations are based on the seller's old assessment, and to budget for the difference."},
{s:"Signatures",d:"Every buyer signs and dates; deliver a copy to escrow and upload to SkySlope. Loan note: MLOs set impounds using the new assessed value but the supplemental bill still arrives separately; remind the borrower at closing."}
],
"STRL":[
{s:"Header and parties",d:"Enter owner name(s), property address and the listing term with start and end dates. Attach the RCSD if an entity owns the property."},
{s:"Compensation",d:"Enter the broker's compensation (percentage of gross rents or flat fee), when earned, and how booking fees and cleaning fees are handled."},
{s:"Broker duties",d:"Define advertising platforms, guest screening, booking, collecting rents and deposits (trust account under DRE rules), cleaning/turnover coordination, and transient occupancy tax (TOT) collection and remittance."},
{s:"Owner representations",d:"Owner confirms local STR permit/registration, TOT registration, HOA approval, insurance (STR endorsement), and authorizes a keysafe/smart lock. Many cities ban or cap STRs; verify before marketing."},
{s:"Signatures",d:"Owner and broker sign and date; give the owner a copy and upload to SkySlope. Confirm with LPT broker/TC whether LPT permits property management/STR management activity."}
],
"SVLA":[
{s:"Header",d:"Enter seller name(s) and the parcel address or APN. Deliver to the seller at listing and to the buyer with the disclosure package after acceptance."},
{s:"Topics reviewed",d:"Zoning and permitted uses, legal and physical access, easements and encroachments, utilities availability and hookup costs, water rights and wells, septic/percolation, soils and drainage, flood/fire zones, endangered species and wetlands, Williamson Act, and pending government actions."},
{s:"Seller duties",d:"Explain the seller must disclose known material facts on the VLQ even though the TDS does not apply to unimproved land. Note items the seller mentions for the VLQ."},
{s:"Buyer verification",d:"Recommend in writing that the buyer verify buildability with the county planning department, order a survey and check title for easements during the investigation period."},
{s:"Signatures and loan note",d:"Seller signs at listing; buyer signs during escrow; upload to SkySlope. Land loans are limited (large down payments, few conventional programs, no FHA/VA for raw land), so buyers often use cash, seller financing or construction-to-perm; tell the MLO early."}
],
"SVRA":[
{s:"Header",d:"Enter property address and the buyer or owner name(s). Use when the client plans short-term/vacation rental use."},
{s:"Local rules and HOA",d:"Review that cities and counties ban, cap or permit STRs, require registration and TOT, and that HOA CC&Rs may prohibit them. Rules change often; the client must verify directly with the jurisdiction and HOA during the investigation period."},
{s:"Insurance and income",d:"Note that standard homeowner policies may exclude STR use and that projected STR income is not guaranteed."},
{s:"Signatures",d:"Client signs and dates; keep in the SkySlope file. Loan note: owner-occupied programs (VA, FHA, primary conventional) require occupancy; STR income usually cannot be used to qualify without history, so a DSCR or second-home program may be needed - tell the MLO before writing."}
],
"SWPI-Q":[
{s:"Header",d:"Enter property address, seller and buyer names. Seller completes at listing; deliver with disclosures."},
{s:"Septic system",d:"Seller identifies type and location, installation date, permits, last pumping/service date and company, known problems or repairs, and any county notices. Many counties require an inspection or certification at transfer (verify local rule)."},
{s:"Private well",d:"Location, depth, pump age, yield, water quality tests (bacteria, nitrates), shared well agreements and easements. Attach test results and any well log."},
{s:"Propane tank",d:"Owned or leased, supplier, tank size, location, and lease terms; a leased tank usually requires the buyer to open a new account with the supplier."},
{s:"Signatures",d:"Seller signs; deliver within the disclosure period and obtain buyer acknowledgment; upload with attachments to SkySlope. Loan note: FHA/VA/USDA require a water potability test and septic certification/distance checks; get results to the MLO and appraiser early."}
],
"TIC-FD":[
{s:"Header",d:"Enter property address, the specific TIC interest (percentage) and the exclusive-use area (unit, parking, storage) being sold, buyer and seller names."},
{s:"Group loan",d:"List the shared loan lender, balance, rate, maturity, whether it is a single group loan or fractional loans, and each co-owner's share. Joint liability on a group loan is the key risk."},
{s:"Shared expenses and reserves",d:"Enter the seller's monthly share of expenses (loan, taxes, insurance, maintenance), reserve balances and any special assessments or planned repairs."},
{s:"Delinquencies and disputes",d:"Disclose co-owner delinquencies, pending disputes, litigation, condo-conversion status and resale restrictions in the TIC agreement."},
{s:"Attachments and signatures",d:"Attach the TIC agreement, recent budget/financials and loan documents. Seller signs; deliver during the disclosure period and obtain the buyer's acknowledgment; upload to SkySlope. Loan note: fractional TIC loans are niche; the MLO should confirm a lender before the offer."}
],
"TIC-OA":[
{s:"Header",d:"Enter buyer name(s) and property address; deliver before or with the offer."},
{s:"TIC vs condo",d:"Explain there is no separate parcel per unit; the buyer owns an undivided interest in the whole with an exclusive-use right under the TIC agreement."},
{s:"Financial and legal risks",d:"Joint liability on group loans, co-owner default risk, limits on resale and financing, HOA-like governance by agreement rather than statute, and condo-conversion limits in some cities."},
{s:"Recommendations and signatures",d:"Recommend attorney review of the TIC agreement and a fractional loan pre-approval. Every buyer signs and dates; upload to SkySlope with the offer and give the buyer a copy."}
],
"TOBR":[
{s:"Header",d:"Enter buyer name(s) and the date of the original BRBC/LPRBC being transferred."},
{s:"Brokers",d:"Identify the transferring broker and the receiving broker with firm names, DRE numbers and the assigned agent. Typical use: an agent moves brokerages and the buyer wants to follow."},
{s:"Compensation",d:"State how compensation is handled on pending transactions (often a referral or split to the original broker) and on future purchases under the agreement. Agree before signing; the buyer's obligation under the BRBC does not increase."},
{s:"Consent and signatures",d:"Every buyer and both brokers sign and date; buyer consent is required because the agreement is with the brokerage. Upload to SkySlope; notify listing agents and escrow on any pending deal and update the AD/agency confirmation if the brokerage on the RPA changes (CAC). Confirm with LPT broker/TC."}
],
"TOL":[
{s:"Header",d:"Enter seller name(s), property address and the date of the original RLA being transferred."},
{s:"Brokers",d:"Identify the transferring and receiving brokers with firm names, DRE numbers and the new listing agent."},
{s:"Compensation",d:"State how compensation is handled, including any referral fee to the original broker and treatment of a pending escrow. Agree in writing before the seller signs."},
{s:"Consent, MLS and signatures",d:"Every seller and both brokers sign and date; seller consent is required. Update the CRMLS listing to the new broker promptly (listing must be withdrawn by the old broker and re-entered or transferred per CRMLS procedure - verify) and upload to SkySlope. Confirm with LPT broker/TC."}
],
"TRBC":[
{s:"Header and parties",d:"Enter tenant name(s), brokerage and agent with DRE numbers, and the beginning and ending dates of the representation. Sign before showing rentals."},
{s:"Scope",d:"Describe property type, areas, budget, move-in date and lease term sought; check exclusive or non-exclusive."},
{s:"Compensation",d:"Enter the amount or rate, who pays (tenant, landlord, or landlord first with tenant paying any shortfall), and when earned (lease execution). State that compensation is negotiable. Written buyer-side agreements rules (AB 2992) apply to purchases; for leases follow the form and LPT policy - confirm with LPT broker/TC."},
{s:"Agency and disclosures",d:"Deliver the AD (lease version for terms over one year) and FHDA; review dual representation possibilities."},
{s:"Signatures",d:"Tenant and broker sign and date; give the tenant a copy and upload to SkySlope before showings."}
],
"VLL":[
{s:"Header and parties",d:"Enter seller name(s) as on title, APN(s), legal description reference, property location, and the listing start and expiration dates."},
{s:"Price and compensation",d:"Enter the list price, the broker's compensation and when earned, safety-clause period, and any amount authorized to offer buyer brokers (communicated directly, not in MLS)."},
{s:"MLS, signage, marketing, access",d:"Complete the elections and write access instructions for showing the land (gate codes, legal access route, no trespass on neighbors)."},
{s:"Seller representations",d:"Legal access, easements, liens, pending government actions, Williamson Act contracts, known environmental conditions and prior use. Confirm the APN matches the county record."},
{s:"Disclosures and signatures",d:"Attach the SVLA, AD, PRBS-S and FHDA; have the seller start the VLQ. Sellers and broker sign and date; upload to SkySlope."}
],
"VLQ":[
{s:"Header",d:"Enter seller name(s), APN and property location. Seller completes personally at listing; deliver to the buyer within the VLPA seller-disclosure period after acceptance."},
{s:"Access and boundaries",d:"Legal and physical access, recorded and unrecorded easements, encroachments, boundary disputes, surveys and corner markers. Recommend a survey; these are the most common land disputes."},
{s:"Utilities and improvements",d:"Availability of water, sewer/septic (percolation tests), electricity, gas, phone/internet, and any existing improvements or wells with permits."},
{s:"Soils, drainage, water, environment",d:"Soils or geologic reports, grading, drainage and flooding, water rights, wells, hazardous materials, prior agricultural use and chemicals, endangered species and wetlands."},
{s:"Government and legal",d:"Zoning, general plan, permits, pending assessments, Williamson Act, notices of violation, litigation and HOA/road maintenance agreements."},
{s:"Signatures and delivery",d:"Every seller signs and dates; the agent reviews for completeness but never answers. Attach reports and notices; deliver through SkySlope and get the buyer's signed acknowledgment within the disclosure period."}
],
"VRL":[
{s:"Header and parties",d:"Enter owner name(s), property address and the term of the exclusive authorization; attach the RCSD for entity owners."},
{s:"Rates and owner use",d:"Enter nightly/weekly rates or a rate schedule, minimum stays, seasonal pricing authority, cleaning fees, and the owner's blocked personal-use dates."},
{s:"Compensation and funds",d:"Enter the broker's percentage of rents or fee, when earned, and that rents and deposits are held in the broker's trust account per DRE trust fund rules with periodic owner statements."},
{s:"Broker duties and compliance",d:"Advertising, guest screening, check-in, cleaning and maintenance coordination, STR permit and TOT collection/remittance, insurance responsibilities and HOA rules. Confirm the permit before marketing."},
{s:"Signatures",d:"Owner and broker sign and date; upload to SkySlope and keep with trust account records. Confirm with LPT broker/TC on LPT's policy for vacation rental management."}
],
"WCMD":[
{s:"Header",d:"Enter property address, buyer and seller names. Deliver with the disclosure package before close of escrow."},
{s:"Water-conserving fixtures",d:"Seller checks whether non-compliant fixtures have been replaced per Civ. Code 1101.1-1101.8: toilets over 1.6 gpf, showerheads over 2.5 gpm, faucets over 2.2 gpm in pre-1994 homes. Since 1/1/2017 the seller must disclose compliance; the law does not make replacement a condition of sale, but some cities require retrofit certificates at sale."},
{s:"Carbon monoxide detectors",d:"Seller states whether CO alarms are installed per Health & Safety Code 17926 (dwellings with fuel-burning appliances, fireplaces or attached garages) in required locations. Distinct from the smoke-alarm statement on the WHSD."},
{s:"Signatures",d:"Every seller signs and dates; buyer signs acknowledgment; upload to SkySlope. Loan note: FHA/VA appraisers flag missing smoke/CO alarms as repair conditions."}
],
"WFDA":[
{s:"Header",d:"Enter property address, buyer and seller names. Deliver during escrow before contingency removal for properties in or near declared wildfire disaster areas or high/very high fire hazard severity zones (form revised 6/22 - verify current revision)."},
{s:"Insurance",d:"Advises the buyer to check early whether insurance can be obtained (FAIR Plan plus DIC may be the only option) and to get a quote or binder before removing contingencies. Pair with the BHIA."},
{s:"Rebuilding and area conditions",d:"Covers prolonged construction in the area, permit and debris-removal processes, utility restoration, and possible soil, water or air contamination; recommend testing where applicable."},
{s:"Price gouging and rules",d:"Notes emergency price-gouging limits (Penal Code 396) on rents and sales in declared disaster areas and that local/state rules may change during recovery."},
{s:"Signatures",d:"Every buyer and seller sign and date; upload to SkySlope. Pair with the NHD fire hazard disclosures and the FHDS defensible space/home hardening form for high-fire-zone homes. Loan note: lenders require proof of hazard insurance before funding; coverage problems can derail closing."}
],
"WHS":[
{s:"Header",d:"Enter property address and every seller's name. Deliver during escrow; required before close (Health & Safety Code 19211)."},
{s:"Compliance statement",d:"Seller certifies each water heater is braced, anchored or strapped (two straps, upper and lower third, per state standards) to resist earthquake motion. If not compliant, have it strapped before closing and keep the receipt."},
{s:"Signatures",d:"Every seller signs and dates; buyer acknowledges. Upload to SkySlope and send to escrow. If you also need the smoke alarm statement, use the combined WHSD instead. Loan note: FHA/VA appraisers require double strapping as a repair condition."}
],
"WHSD":[
{s:"Header",d:"Enter property address and every seller's name. Deliver during escrow; required before close of escrow."},
{s:"Water heater",d:"Seller certifies water heaters are braced, anchored or strapped to resist earthquake motion (Health & Safety Code 19211)."},
{s:"Smoke alarms",d:"Seller certifies smoke alarms are installed and operable per state law (Health & Safety Code 13113.8): in each bedroom, hallways outside sleeping areas and on each level; battery-only units must be 10-year sealed. Some cities issue their own compliance certificates - check local requirements."},
{s:"Signatures",d:"Every seller signs and dates; buyer acknowledges; upload to SkySlope and escrow. The CO alarm and water-fixture statements are on the separate WCMD. Loan note: missing alarms are common FHA/VA appraisal repair conditions."}
]
});
