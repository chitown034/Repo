/* Letter libraries — credit-bureau/furnisher/collector dispute letters and borrower Letters of Explanation (LOEs).
   Every letter is fact-only. Tokens like {{NAME}} are filled from the Letter Desk form. Nothing here advises disputing
   accurate information or any identity manipulation (CPN, new EIN for personal credit). */
const BUREAUS = {
  EFX:{ name:"Equifax Information Services LLC", addr:"P.O. Box 740256\nAtlanta, GA 30374-0256", online:"equifax.com/personal/credit-report-services/credit-dispute" },
  EXP:{ name:"Experian", addr:"P.O. Box 4500\nAllen, TX 75013", online:"experian.com/disputes" },
  TU: { name:"TransUnion LLC, Consumer Dispute Center", addr:"P.O. Box 2000\nChester, PA 19016-2000", online:"transunion.com/credit-disputes" },
};
const BUREAU_NOTE = "Verify the current mailing address on each bureau's website before sending; send by certified mail with return receipt and keep copies of everything. Never send original documents.";

const LETTER_FIELDS = [
  ["NAME","Full legal name"],["ADDR","Street address"],["CITY","City, State ZIP"],["DOB","Date of birth"],["SSN4","SSN last 4"],["PHONE","Phone"],["EMAIL","Email"],["DATE","Letter date"],
  ["CREDITOR","Creditor / furnisher / collector"],["ACCT","Account number (last 4 only)"],["AMOUNT","Amount ($)"],["EVENT_DATE","Date of event / month-year"],["DETAIL","Specific facts (1–3 sentences)"],["LENDER","Lender name (for LOEs)"],["LOAN_NO","Loan number (for LOEs)"],
];

/* ------------------------------------------------------------------ DISPUTE LETTERS */
const DL = (id,title,cat,to,situation,basis,notUse,body,enc,tips)=>({id,title,cat,to,situation,basis,notUse,body,enc,tips});
const DISPUTE_LETTERS = [
DL("D01","Account is not mine — identity theft (block request)","Identity & fraud","bureau",
"A tradeline, inquiry or collection was opened by someone else using your identity.",
"FCRA §605B (15 U.S.C. §1681c-2) — bureaus must block fraudulent information within 4 business days of receiving an identity theft report. FCRA §611 reinvestigation.",
"Do not use for an account you opened and simply don't recognize the name of (many creditors report under a parent name) — call the creditor first.",
`I am a victim of identity theft. The following item on my {{BUREAU}} credit file does not belong to me and was opened without my knowledge or authorization:

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Reported balance: $\{{AMOUNT}}    Opened: {{EVENT_DATE}}

{{DETAIL}}

Under section 605B of the Fair Credit Reporting Act, I request that you block this information from my credit file within four business days of receipt of this letter and notify the furnisher that the information is the result of identity theft. I have enclosed a copy of my FTC Identity Theft Report (IdentityTheft.gov), a copy of my government-issued ID, and proof of address.

Please also place a fraud alert on my file and send me a free copy of my corrected report when the block is complete.`,
["FTC Identity Theft Report (IdentityTheft.gov) or police report","Government photo ID","Proof of address (utility bill)","Any evidence the account isn't yours"],
"File the FTC report first — a §605B block requires it. Consider a security freeze at all three bureaus."),
DL("D02","Account is not mine — mixed file / similar name","Identity & fraud","bureau",
"Someone else's account (often a relative or a person with a similar name/SSN) is merged into your file.",
"FCRA §611(a) reinvestigation; §607(b) reasonable procedures to assure maximum possible accuracy.",
"If you were an authorized user or co-signer, the account IS yours for reporting purposes — use D13 (AU removal) instead.",
`The following item on my credit file does not belong to me. I have never had an account with this creditor, and I am not a co-signer, joint owner or authorized user on it.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Reported balance: $\{{AMOUNT}}

{{DETAIL}}

I believe this information has been mixed into my file from another consumer. Under FCRA §611, please reinvestigate this item, verify my identifying information with the furnisher (full name, date of birth {{DOB}}, SSN ending {{SSN4}}, address history) and delete the item if it cannot be verified as mine. Please provide written results of your reinvestigation and a description of the procedure used to verify the information, including the name, address and telephone number of the furnisher contacted.`,
["Government photo ID","Proof of address","Social Security card copy (optional)"],
"Mixed files are common with Jr./Sr. and close SSNs — include your full address history for the last 5 years."),
DL("D03","Inaccurate balance","Inaccurate data","bureau",
"The balance reported is higher than what you actually owe.",
"FCRA §611(a); §623(a)(2) furnisher duty to correct and update.",
"Balances lag 30–45 days — if you just paid, wait a cycle or ask the creditor for a rapid rescore through your lender instead.",
`The balance reported for the account below is inaccurate.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}
Reported balance: $\{{AMOUNT}}    Correct balance as of {{EVENT_DATE}}: see enclosed statement

{{DETAIL}}

Please reinvestigate and update the balance to the correct amount. I have enclosed the most recent account statement and payment confirmation showing the actual balance. Please send me written results and an updated copy of my report.`,
["Most recent statement","Payment confirmation / bank record"],
"For a mortgage application, a rapid rescore through your loan officer (3–5 business days) is faster than a bureau dispute (30 days) and does not flag the account as 'in dispute'."),
DL("D04","Inaccurate credit limit or high balance (utilization)","Inaccurate data","bureau",
"The credit limit is reported too low (or missing), which inflates your utilization ratio.",
"FCRA §611(a); §623(a) accuracy. Scoring models use reported limit (or high balance when the limit is missing).",
"If the card has no preset limit (charge card), the model uses high balance — a dispute won't change that.",
`The credit limit reported for the account below is inaccurate, which overstates my credit utilization.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}
Reported limit: see report    Actual limit: $\{{AMOUNT}}

{{DETAIL}}

Enclosed is a current statement showing the actual credit limit. Please reinvestigate and update the credit limit field for this tradeline and provide written results.`,
["Current statement showing credit limit","Letter from creditor confirming limit (if available)"],
"Also ask the creditor to report the limit — some issuers withhold limits by policy."),
DL("D05","Late payment reported in error","Inaccurate data","bureau",
"A 30/60/90-day late is reported but you paid on time (or within the grace period before it was reported).",
"FCRA §611(a); §623(a)(1)(A) furnisher may not report information it knows or should know is inaccurate.",
"Do NOT use if the payment was actually late. For an accurate late, use the goodwill letter (D31) to the creditor.",
`My credit file shows a late payment on the account below that is inaccurate. I made the payment on time, as shown by the enclosed records.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Month reported late: {{EVENT_DATE}}

{{DETAIL}}

Please reinvestigate this item and correct the payment history to reflect that the payment was made on time. Enclosed: bank statement showing the payment cleared, creditor statement showing the posted payment and due date. Please send written results of your reinvestigation and an updated report.`,
["Bank statement showing payment cleared","Creditor statement showing due date and posted payment","Any confirmation number / email"],
"If a lender shows a late inside the last 12 months, fixing this is usually the single highest-impact item on a mortgage file."),
DL("D06","Paid account still reporting a balance / paid collection shown unpaid","Inaccurate data","bureau",
"You paid (or settled) the account but it still reports a balance or 'unpaid'.",
"FCRA §611(a); §623(a)(2). Paid collections are excluded by newer FICO (9/10) and VantageScore models but mortgage models still see them — so the status must be correct.",
"If you settled for less, the correct status is 'paid, settled for less than full balance' — not deletion, unless the collector agreed in writing (D30).",
`The account below has been paid in full / settled, yet it still reports an outstanding balance of $\{{AMOUNT}}.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Date paid: {{EVENT_DATE}}

{{DETAIL}}

Enclosed is proof of payment and the creditor's paid-in-full (or settlement) letter. Please reinvestigate and update this item to show a zero balance and the correct paid status, and send me written results.`,
["Paid-in-full / settlement letter","Proof of payment (cancelled check, bank record, receipt)"],
"Ask the collector for a paid letter at the time of payment; many will not re-issue it later."),
DL("D07","Duplicate account — same debt reported twice","Inaccurate data","bureau",
"The original creditor AND a collector both report a balance for the same debt, or the same collection appears twice (sold and re-sold).",
"FCRA §611(a); §607(b). Only one entity may report a balance owed on a single debt.",
"The original creditor may legitimately show a $0 charge-off AND the collector a balance — that is not a duplicate. The issue is two balances.",
`My credit file reports the same debt more than once, inflating my total reported debt.

Item 1: {{CREDITOR}} — account ending {{ACCT}} — balance $\{{AMOUNT}}
Item 2: see report (same original creditor, same original account, same date of first delinquency)

{{DETAIL}}

Only one furnisher may report a balance on this debt. Please reinvestigate and delete the duplicate entry (or update the sold/transferred account to a $0 balance with the correct 'transferred/sold' status) and provide written results.`,
["Copy of report with both items highlighted","Any letter showing the debt was sold/transferred"],
"Pull all three reports — duplicates often appear on only one bureau."),
DL("D08","Obsolete item — past the 7-year reporting period","Obsolete / timing","bureau",
"A collection, charge-off or late payment is older than 7 years from the date of first delinquency (DOFD). Chapter 7 BK: 10 years; Chapter 13: 7 years from filing.",
"FCRA §605(a) — adverse items may not be reported after 7 years (plus 180 days from DOFD for collections/charge-offs under §605(c)).",
"The clock runs from the FIRST delinquency with the original creditor, not from when the collector bought it or the last payment.",
`The following item is obsolete and must be removed from my credit file.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}
Date of first delinquency: {{EVENT_DATE}} (more than seven years ago)

{{DETAIL}}

Under FCRA §605(a) and §605(c), this item has exceeded the maximum reporting period. Please delete it and send me written confirmation and an updated report. If you contend the date of first delinquency is later, please provide the date you are relying on and the furnisher's name and address.`,
["Copy of report showing the item and DOFD","Any old statement showing the first missed payment"],
"If the DOFD on the report looks newer than reality, use D10 (re-aging) — that is a separate violation."),
DL("D09","Debt discharged in bankruptcy still shows a balance","Bankruptcy","bureau",
"An account included in a discharged bankruptcy still reports a balance, 'charge-off' or past-due instead of 'included in bankruptcy, $0 balance'.",
"FCRA §611(a); the bankruptcy discharge order (11 U.S.C. §524) — reporting a discharged debt as owed can also violate the discharge injunction.",
"Only for debts actually included and discharged. Reaffirmed debts (e.g. a car you kept) continue to report normally.",
`The account below was included in and discharged through my Chapter {{DETAIL}} bankruptcy (case no. on enclosed discharge order), discharged {{EVENT_DATE}}. It continues to report a balance of $\{{AMOUNT}} and an inaccurate status.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

Please reinvestigate and update this tradeline to show 'Included in bankruptcy', a $0 balance, and no past-due amount. A copy of the discharge order and Schedule F listing this creditor is enclosed. Please send written results and an updated report.`,
["Bankruptcy discharge order","Schedule F / creditor matrix listing the creditor"],
"For mortgage underwriting, every discharged account must show $0 — otherwise the AUS counts the payment in DTI."),
DL("D10","Re-aged debt — date of first delinquency changed","Obsolete / timing","bureau",
"A collector reported a newer date of first delinquency, restarting the 7-year clock.",
"FCRA §605(c) — the reporting period runs from the original delinquency with the original creditor; §623(a)(5) furnishers must report the DOFD accurately.",
"If you made a payment that legitimately reset the statute of limitations (varies by state), the FCRA reporting clock still does NOT reset — different clocks.",
`The item below reports a date of first delinquency that is inaccurate. The original delinquency with the original creditor occurred on {{EVENT_DATE}}; the collector is reporting a later date, which improperly extends the reporting period.

Collector: {{CREDITOR}}    Account ending: {{ACCT}}    Balance: $\{{AMOUNT}}

{{DETAIL}}

Under FCRA §605(c) and §623(a)(5), the date of first delinquency may not be re-aged. Please reinvestigate, correct the DOFD, and delete the item if the corrected date places it beyond the seven-year reporting period. Please provide written results including the DOFD the furnisher reported.`,
["Original creditor statements showing the first missed payment","Prior credit reports showing the original DOFD"],
"Old credit reports are your best evidence — save PDFs every year."),
DL("D11","Account status incorrect (closed shown open, paid shown delinquent, wrong account type)","Inaccurate data","bureau",
"Status, account type, or open/closed indicator is wrong.",
"FCRA §611(a); §623(a)(2).",
"A closed account with a balance can correctly show 'closed' AND a balance — that's not an error.",
`The status reported for the account below is inaccurate.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}
Reported status: see report    Correct status: {{DETAIL}}   Effective: {{EVENT_DATE}}

Enclosed is documentation from the creditor confirming the correct status. Please reinvestigate, correct the status, account type and open/closed indicator as applicable, and send written results.`,
["Creditor letter / final statement"],
""),
DL("D12","Add 'closed by consumer' notation","Inaccurate data","bureau",
"An account you closed shows 'closed by credit grantor', which reads negatively to underwriters.",
"FCRA §611(a) accuracy; the closure reason is part of the account status.",
"Only if you actually closed it. If the issuer closed it for inactivity, you can ask the issuer (not the bureau) for a courtesy change.",
`The account below was closed at my request on {{EVENT_DATE}}, but it reports as closed by the credit grantor.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

{{DETAIL}}

Please reinvestigate and update the closure reason to 'Closed by consumer'. The creditor's closure confirmation is enclosed.`,
["Closure confirmation letter or email"],
""),
DL("D13","Remove authorized-user account","Authorized user","bureau",
"An authorized-user tradeline (often a family member's card) is hurting you — high utilization or late payments you don't control.",
"FCRA §611(a). An authorized user has no contractual liability; the primary cardholder or bureau can remove the tradeline on request.",
"Removing a seasoned, low-utilization AU card can LOWER your score (less history). Run it through the Credit Simulator first.",
`I am listed as an authorized user, not an account holder, on the account below. I have no contractual liability for this account and I request that it be removed from my credit file.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

{{DETAIL}}

Please remove this tradeline from my file and send written confirmation. I have also asked the primary cardholder to remove me as an authorized user with the issuer.`,
["Issuer confirmation that you were removed as AU (if available)"],
"Ask the primary cardholder to remove you with the issuer first — the bureau removal then sticks."),
DL("D14","Unauthorized hard inquiry","Inquiries","bureau",
"A hard inquiry you did not authorize (no application, or a company you never dealt with).",
"FCRA §604 — a permissible purpose is required to pull a report; §611(a) reinvestigation.",
"Mortgage, auto and student-loan inquiries within a 14–45 day window are de-duplicated by scoring models — multiple lender pulls for ONE loan are not a problem worth disputing. Inquiries drop off at 2 years and stop affecting scores after 12 months.",
`The following hard inquiry on my {{BUREAU}} file was made without my authorization. I did not apply for credit with this company and did not give permission to access my report.

Company: {{CREDITOR}}    Inquiry date: {{EVENT_DATE}}

{{DETAIL}}

Under FCRA §604, a consumer report may be furnished only for a permissible purpose. Please investigate, confirm the permissible purpose the company certified, and remove the inquiry if none existed. Please provide written results.`,
["Copy of report with inquiry highlighted"],
"Contact the company too — if they can't show an application, they will usually request removal."),
DL("D15","Personal information errors (name, address, employer, DOB)","Personal info","bureau",
"Wrong or outdated names, addresses, employers, phone or date of birth.",
"FCRA §611(a). Clean identifying data also prevents mixed files and underwriting 'address discrepancy' conditions.",
"Keep legitimate former addresses — underwriters match them to your application; only remove addresses that were never yours.",
`The personal information on my credit file contains the following errors:

{{DETAIL}}

My correct information is: {{NAME}}, {{ADDR}}, {{CITY}}; date of birth {{DOB}}; SSN ending {{SSN4}}. Enclosed are a copy of my government ID and proof of address. Please correct the items above and remove any name, address or employer that has never been associated with me, then send an updated report.`,
["Government photo ID","Proof of address","Social Security card (optional)"],
""),
DL("D16","Deceased indicator in error","Personal info","bureau",
"Your file (or a joint/AU account) shows a 'deceased' flag, which blocks scoring and lending.",
"FCRA §611(a); §607(b).",
"",
`My credit file (or the account below) incorrectly indicates that I am deceased. I am alive and am writing this letter personally.

Account (if applicable): {{CREDITOR}} — ending {{ACCT}}

{{DETAIL}}

Enclosed is a copy of my government-issued photo ID and a notarized statement. Please remove the deceased indicator from my file and from the tradeline, reinvestigate with the furnisher, and send me written confirmation and an updated report. This error is preventing me from obtaining credit and must be corrected urgently.`,
["Government photo ID","Notarized statement of identity","Recent utility bill"],
"Common after a joint account holder or spouse passes — the furnisher usually coded the wrong person."),
DL("D17","Request method of verification after a 'verified' result","Escalation","bureau",
"You disputed an item, the bureau said 'verified', and you believe the reinvestigation was superficial.",
"FCRA §611(a)(6)(B)(iii) and §611(a)(7) — you may request a description of the procedure used to determine accuracy, including the business name, address and phone of any furnisher contacted, within 15 days of your request.",
"",
`On {{EVENT_DATE}} you notified me that the following disputed item was 'verified':

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

Under FCRA §611(a)(7), I request a description of the procedure used to determine the accuracy and completeness of this information, including the business name, address and telephone number of the furnisher contacted, and the specific documents or data the furnisher provided. Please respond within 15 days as required.

{{DETAIL}}

If the item was verified solely through an automated (e-OSCAR/ACDV) match without review of underlying documents, I request that it be reinvestigated with the enclosed evidence or deleted.`,
["Prior dispute letter and the bureau's results letter","Your evidence (again)"],
"Next step if ignored: CFPB complaint (D25). Keep every certified-mail receipt."),
DL("D18","Reinserted item without the required notice","Escalation","bureau",
"An item deleted after a dispute reappeared on your report without written notice.",
"FCRA §611(a)(5)(B) — a bureau may not reinsert deleted information unless the furnisher certifies accuracy, and must notify you in writing within 5 business days of reinsertion.",
"",
`On {{EVENT_DATE}} you deleted the item below from my file following my dispute. It has since been reinserted without the written notice required by FCRA §611(a)(5)(B).

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

{{DETAIL}}

Please delete this item immediately, provide the furnisher's certification of completeness and accuracy on which you relied (if any), and send written confirmation. Your prior deletion notice is enclosed.`,
["Prior deletion/results letter","Current report showing the reinsertion"],
""),
DL("D19","Medical collection — paid, or under $500, or under one year","Medical","bureau",
"A medical collection that is paid, below $500, or less than a year old is still on your file.",
"Bureau policy (Equifax/Experian/TransUnion, 2022–2023): paid medical collections removed; unpaid medical collections under $500 not reported; one-year waiting period before medical collections appear. Verify the current policy — it has changed and may change again.",
"Does not apply to non-medical collections. Does not apply to medical debt placed on a credit card.",
`The item below is a medical collection that should not appear on my file under the bureaus' medical-debt reporting policy.

Collector: {{CREDITOR}}    Account ending: {{ACCT}}    Balance: $\{{AMOUNT}}    Date of service: {{EVENT_DATE}}

{{DETAIL}} (It is paid / the balance is under $500 / it is less than one year from the date of service — as applicable.)

Please delete this medical collection from my file and send written confirmation and an updated report.`,
["Proof of payment or provider statement","Explanation of benefits (EOB) if insurance paid"],
"Mortgage lenders generally ignore medical collections for VA/FHA, but a paid/removed item still helps the score."),
DL("D20","Student loan reported incorrectly (deferment, forbearance, rehabilitation, consolidation)","Inaccurate data","bureau",
"Student loan shows late/default while it was in deferment or forbearance, or rehabilitated/consolidated loans still show default.",
"FCRA §611(a); §623(a). After successful rehabilitation, the default notation is removed by law (20 U.S.C. §1078-6); the servicer must report accurately.",
"Lates that occurred before an approved forbearance are accurate.",
`The student loan account below is reported inaccurately.

Servicer: {{CREDITOR}}    Account ending: {{ACCT}}
Status reported: see report    Correct status: {{DETAIL}}    Effective: {{EVENT_DATE}}

Enclosed is the servicer's letter confirming the deferment/forbearance period (or completion of rehabilitation / consolidation payoff). Please reinvestigate, correct the payment history and status, and send written results.`,
["Servicer letter confirming deferment/forbearance dates","Rehabilitation completion or consolidation payoff letter"],
"For a VA loan, federal student loans in deferment 12+ months beyond closing can be excluded from DTI — the report must show the correct status to use that rule."),
DL("D21","Foreclosure / short sale / deed-in-lieu reported incorrectly","Inaccurate data","bureau",
"The mortgage shows the wrong completion date, a balance after a completed short sale/foreclosure, or 'foreclosure' when it was a short sale.",
"FCRA §611(a). Waiting periods for VA/FHA/Conventional run from the completion/transfer date — an incorrect date can wrongly block a new mortgage.",
"",
`The mortgage account below is reported inaccurately.

Lender/servicer: {{CREDITOR}}    Account ending: {{ACCT}}
Event: {{DETAIL}}    Completed on: {{EVENT_DATE}}    Reported balance: $\{{AMOUNT}} (should be $0)

Enclosed are the recorded deed/trustee's deed, short-sale approval and settlement statement (as applicable). Please reinvestigate and correct the status, completion date and balance, and send written results.`,
["Recorded trustee's deed / deed-in-lieu / settlement statement","Short-sale approval letter"],
"VA waiting period after foreclosure: typically 2 years (verify Pamphlet 26-7 Ch. 4); the clock runs from the completion date on this report."),
DL("D22","Judgment / tax lien / civil record removal","Public records","bureau",
"A civil judgment or tax lien appears on your file. Since 2017–2018 the bureaus stopped reporting most civil judgments and tax liens (NCAP standards); satisfied or vacated ones should not appear.",
"National Consumer Assistance Plan standards; FCRA §605(a)(3); §611(a).",
"Bankruptcy is still reported. Child-support judgments may still be reported by some furnishers.",
`The public record below appears on my credit file and should be removed.

Record: {{DETAIL}}    Filed: {{EVENT_DATE}}    Amount: $\{{AMOUNT}}

Under current bureau public-record standards, civil judgments and tax liens are not reported unless they meet enhanced identity-matching requirements; in addition the record has been satisfied/vacated/released as shown in the enclosed court or IRS document. Please delete this record and send written confirmation.`,
["Satisfaction of judgment / lien release / vacatur order"],
"Lenders will still find open liens in title searches — pay or arrange a payment plan regardless of the credit report."),
DL("D23","Place an active-duty alert / fraud alert / extended alert","Fraud alerts","bureau",
"You are deploying (active-duty alert, 1 year), suspect fraud (initial alert, 1 year), or have an identity-theft report (extended alert, 7 years).",
"FCRA §605A — one bureau must forward the alert to the other two. Active-duty alerts also remove you from prescreened offers for 2 years.",
"An alert slows new credit (lenders must verify identity). Lift it before a mortgage application if timing is tight, or plan for the verification call.",
`Please place a(n) {{DETAIL}} alert on my credit file under FCRA §605A, effective immediately, and forward this request to the other two nationwide consumer reporting agencies.

Full name: {{NAME}}    DOB: {{DOB}}    SSN ending: {{SSN4}}
Address: {{ADDR}}, {{CITY}}    Phone to verify identity: {{PHONE}}

(For an active-duty alert: I am a member of the U.S. Armed Forces on active duty / deploying on {{EVENT_DATE}}.)
(For an extended alert: my FTC Identity Theft Report is enclosed.)

Please confirm in writing when the alert is in place and provide the free credit report(s) to which I am entitled.`,
["Government ID","Military orders (active-duty alert, optional)","FTC Identity Theft Report (extended alert)"],
"Servicemembers can also use the free Military Credit Monitoring (FCRA §605A(k)) at each bureau."),
DL("D24","Place or temporarily lift a security freeze","Fraud alerts","bureau",
"Freeze your file (free under federal law) or lift it for a specific lender during a mortgage application.",
"FCRA §605A(i) — free freezes and lifts; bureaus must place within 1 business day (online/phone) or 3 business days (mail).",
"Tell your loan officer before they pull credit; a frozen file returns 'no file' and can delay pre-approval.",
`Please {{DETAIL}} (place / temporarily lift / permanently remove) the security freeze on my credit file.

Full name: {{NAME}}    DOB: {{DOB}}    SSN ending: {{SSN4}}    Address: {{ADDR}}, {{CITY}}
For a temporary lift: from {{EVENT_DATE}} for the lender {{CREDITOR}} (or a date range).
PIN (if applicable): on file.

Please confirm in writing.`,
["Government ID","Proof of address"],
""),
DL("D25","Escalation — notice of intent to file a CFPB complaint","Escalation","bureau",
"The bureau ignored your dispute (no response in 30 days / 45 if you sent new information), gave a frivolous determination, or failed to correct a documented error.",
"FCRA §611(a)(1) reinvestigation deadlines; §616/§617 civil liability for willful or negligent noncompliance; CFPB complaint portal (consumerfinance.gov/complaint).",
"",
`On {{EVENT_DATE}} I sent you a dispute (copy enclosed) regarding:

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

{{DETAIL}}

You have not completed a reinvestigation within the time required by FCRA §611(a)(1), or your response failed to address the documentation provided. This is my final request that you correct or delete the item and send written results. If the item is not corrected within 10 days of receipt of this letter, I will file a complaint with the Consumer Financial Protection Bureau and my state attorney general, and I reserve all rights under FCRA §616 and §617.`,
["All prior correspondence and certified-mail receipts","Your evidence"],
"File the CFPB complaint at the same time — bureaus respond to CFPB cases quickly."),
DL("D26","Add a 100-word consumer statement","Other","bureau",
"You want to attach a brief explanation to a disputed item that remains on your report.",
"FCRA §611(b) — you may file a brief statement (bureaus allow ~100 words) setting forth the nature of the dispute.",
"Statements don't change scores and underwriters rarely weigh them — an LOE to the lender is more useful. Use sparingly.",
`Please add the following consumer statement to my credit file regarding the account below, under FCRA §611(b):

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

Statement (100 words or fewer): "{{DETAIL}}"

Please confirm in writing that the statement has been added.`,
[],
""),
DL("D27","Servicemember — account reported in violation of SCRA protections","Military","furnisher",
"Interest above 6% was charged, or a late/default was reported, on a pre-service debt during active duty after you invoked the SCRA; or a foreclosure/repossession proceeded without the required court order.",
"Servicemembers Civil Relief Act, 50 U.S.C. §3937 (6% cap), §3953 (foreclosure protection), §3952 (installment contracts); FCRA §623(a) accuracy. The SCRA also prohibits adverse credit reporting for exercising SCRA rights (§3919).",
"Applies to obligations incurred BEFORE entering active duty (or before a Guard/Reserve activation), after you provide written notice and orders.",
`I am (was) a servicemember on active duty from {{EVENT_DATE}} and provided you written notice and a copy of my orders invoking my rights under the Servicemembers Civil Relief Act. Despite that notice, the account below reflects {{DETAIL}} (interest above the 6% cap / late payments / default / adverse credit reporting).

Account: {{CREDITOR}} — ending {{ACCT}}    Amount in question: $\{{AMOUNT}}

Under 50 U.S.C. §3937 and §3919, please (1) recalculate interest at no more than 6% for the covered period and refund or credit the overcharge, (2) correct the payment history and status reported to all consumer reporting agencies, and (3) confirm in writing within 30 days. Copies of my orders and prior SCRA notice are enclosed. If this is not resolved, I will contact the Department of Justice Servicemembers and Veterans Initiative and the CFPB Office of Servicemember Affairs.`,
["Active-duty orders","Prior SCRA notice letter","Statements showing the interest/lates"],
"Send to the furnisher AND dispute with each bureau (attach this letter). The DOJ enforces SCRA; the CFPB has a dedicated servicemember office."),
DL("D28","Direct dispute to the furnisher (creditor)","Furnisher","furnisher",
"You want the creditor itself to investigate and correct what it reports, in parallel with (or instead of) the bureau dispute.",
"FCRA §623(a)(8) and Regulation V §1022.43 — furnishers must investigate direct disputes about accuracy and respond within 30 days.",
"Furnishers need not investigate disputes about identity information, inquiries, or ones they deem frivolous — be specific and document.",
`I dispute the accuracy of information you furnish to the consumer reporting agencies about the account below, under FCRA §623(a)(8) and 12 C.F.R. §1022.43.

Account ending: {{ACCT}}    Item disputed: {{DETAIL}}    Date: {{EVENT_DATE}}    Amount: $\{{AMOUNT}}

The enclosed documents show the information is inaccurate. Please investigate, correct the information you report to Equifax, Experian and TransUnion, and notify me of the results within 30 days. Please send the correction to all three agencies, and send me a copy.`,
["Statements / payment proof","Prior correspondence"],
"Send to the address the creditor designates for disputes (on the statement), not the payment address."),
DL("D29","Debt validation request to a collector","Collector","collector",
"A collector contacted you (first contact within the last 30 days) and you want them to prove the debt before you pay or dispute.",
"FDCPA §809(b) (15 U.S.C. §1692g) — a written dispute within 30 days of the validation notice requires the collector to stop collection until it mails verification; Regulation F §1006.34.",
"After the 30-day window you can still request validation, but the collector is not required to pause collection. Validation does NOT stop the statute of limitations clock.",
`I received your communication dated {{EVENT_DATE}} regarding an alleged debt (your reference: {{ACCT}}, amount $\{{AMOUNT}}, original creditor {{CREDITOR}}). I dispute this debt and request validation under 15 U.S.C. §1692g(b).

Please provide: the name and address of the original creditor; the original account number; an itemization of the amount claimed (principal, interest, fees) from the itemization date; a copy of the agreement or application bearing my signature; proof you are licensed to collect in my state (if required); and the date of first delinquency.

{{DETAIL}}

Until you provide validation, please cease collection activity and do not report this debt to any consumer reporting agency, or report it only as disputed as required by §1692e(8).`,
["Copy of the collector's notice"],
"Keep the envelope and notice — the 30-day window runs from receipt of the validation notice."),
DL("D30","Pay-for-delete offer to a collector","Collector","collector",
"You are willing to pay a collection if the collector agrees in writing to delete the tradeline.",
"Contract offer; not required by law. Many collectors decline (bureau agreements discourage it) but some original-creditor-owned and smaller agencies accept.",
"Never pay before you have the written agreement. Never admit the debt is valid in the letter. Paying a collection does not remove it; only deletion does.",
`This letter is an offer to resolve the account referenced below. It is not an acknowledgment that the debt is valid or that I am responsible for it.

Your reference: {{ACCT}}    Original creditor: {{CREDITOR}}    Reported balance: $\{{AMOUNT}}

In exchange for payment of $\{{DETAIL}} (within 10 business days of your written acceptance), you agree to: (1) request deletion of this tradeline from Equifax, Experian and TransUnion within 30 days of payment; (2) report nothing further about this account; (3) treat the account as settled in full with no remaining balance and sell or assign no remaining balance to any third party.

If you accept, please sign and return this letter on company letterhead. Payment will be made only after I receive the signed acceptance.

Accepted by: ______________________  Title: __________  Date: {{EVENT_DATE}}`,
[],
"Have the collector return the signed letter on letterhead; save it with the payment confirmation."),
DL("D31","Goodwill adjustment request (accurate late payment)","Creditor","furnisher",
"The late payment is accurate, you have a good history otherwise, and you are asking the creditor to remove it as a courtesy.",
"No legal right — a courtesy request. Works best with a long on-time history and a specific, verifiable hardship.",
"Do not frame it as a dispute. Do not claim inaccuracy.",
`I am writing to request a goodwill adjustment on my account ending {{ACCT}}.

In {{EVENT_DATE}} a payment was reported 30 days late. The late payment was caused by {{DETAIL}}. The account is current and has been paid as agreed before and since; I have been a customer since (year).

I am applying for a mortgage and this single late payment is affecting my qualification. I respectfully ask that you remove the late payment notation from the credit bureaus as a one-time goodwill gesture. I value the relationship and have enrolled in autopay to make sure it does not happen again. Thank you for considering my request.`,
["Proof of hardship (optional): medical bill, PCS orders, employer letter"],
"Call first and ask who handles goodwill requests; send to that person. A deployment or PCS is a strong, verifiable reason."),
DL("D32","Cease communication / dispute to a collector","Collector","collector",
"You want the collector to stop calling/writing (they may still sue or report) and to note the debt as disputed.",
"FDCPA §805(c) (15 U.S.C. §1692c(c)); §1692e(8).",
"A cease letter can prompt a lawsuit if the debt is within the statute of limitations — consider validation (D29) or a settlement first.",
`Regarding your reference {{ACCT}} (original creditor {{CREDITOR}}, alleged amount $\{{AMOUNT}}): I dispute this debt. Under 15 U.S.C. §1692c(c), I request that you cease all communication with me about it, except to notify me that collection efforts are terminated or that you intend to invoke a specific remedy.

{{DETAIL}}

Under §1692e(8), any report of this debt to a consumer reporting agency must reflect that it is disputed.`,
[],
""),
DL("D33","Charge-off still reports a balance after settlement","Inaccurate data","bureau",
"You settled a charged-off account for less than the balance; it still shows the full balance or past-due amount.",
"FCRA §611(a); §623(a)(2).",
"The correct status is 'settled for less than full balance / $0 balance' — not deletion.",
`The charged-off account below was settled on {{EVENT_DATE}} for $\{{AMOUNT}}, as agreed in the enclosed settlement letter. It continues to report an outstanding balance and past-due amount.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}

{{DETAIL}}

Please reinvestigate and update this tradeline to a $0 balance, $0 past due and 'settled' status, and send written results.`,
["Settlement agreement","Proof of settlement payment"],
"For conventional loans, charged-off mortgage debt and large collections have specific payoff rules — ask the Loan Tutor."),
DL("D34","Repossession — deficiency balance disputed / wrong amount","Inaccurate data","bureau",
"After a voluntary or involuntary repo, the deficiency balance reported is wrong or the vehicle sale wasn't credited.",
"FCRA §611(a); UCC §9-611/§9-614 notices of disposition; state deficiency notice requirements.",
"",
`The repossession account below reports a deficiency balance of $\{{AMOUNT}} that is inaccurate.

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Repossession date: {{EVENT_DATE}}

{{DETAIL}} (e.g., the vehicle sale proceeds were not credited; no post-sale deficiency notice was received; the balance was settled.)

Please reinvestigate with the furnisher, require documentation of the sale proceeds and deficiency calculation, correct the balance, and send written results.`,
["Any post-sale notice","Settlement or payment records"],
""),
DL("D35","Account opened by someone else while I was deployed","Military","bureau",
"Fraudulent account opened during a deployment or overseas assignment — identity theft variant for servicemembers.",
"FCRA §605B block; §605A active-duty alert; Military Lending Act / SCRA context.",
"",
`I am a member of the U.S. Armed Forces and was deployed / stationed overseas from {{EVENT_DATE}} (orders enclosed). During that period the following account was opened in my name without my knowledge or authorization:

Creditor: {{CREDITOR}}    Account ending: {{ACCT}}    Balance: $\{{AMOUNT}}

{{DETAIL}}

Under FCRA §605B, please block this information within four business days, notify the furnisher that it resulted from identity theft, and place an active-duty alert on my file under §605A. My FTC Identity Theft Report, government ID and orders are enclosed.`,
["FTC Identity Theft Report","Deployment orders","Government ID"],
"Also enroll in free Military Credit Monitoring at all three bureaus."),
DL("D36","Request a free annual report + dispute results in writing","Other","bureau",
"You want your free report (weekly free online via AnnualCreditReport.com, or by mail) and written dispute results.",
"FCRA §612 (free annual report; additional free report after a dispute or adverse action).",
"",
`Please send me a free copy of my credit report under FCRA §612. {{DETAIL}} (I was denied credit on {{EVENT_DATE}} / I am unemployed and intend to apply for employment / I am a victim of fraud / I am a servicemember — as applicable.)

Full name: {{NAME}}    DOB: {{DOB}}    SSN ending: {{SSN4}}    Address: {{ADDR}}, {{CITY}}    Prior address (last 2 years): ______

Please also confirm that the results of any pending dispute will be sent to me in writing.`,
["Government ID","Proof of address"],
""),
];

/* ------------------------------------------------------------------ LETTERS OF EXPLANATION */
const LO = (id,title,cat,when,uw,body,docs,tip)=>({id,title,cat,when,uw,body,docs,tip});
const LOE_LETTERS = [
/* Credit */
LO("L01","Late payment(s)","Credit","Any 30+ day late in the last 24 months (mortgage lates in 12 months are usually disqualifying — explain anyway).","Was it an isolated event with a clear cause, now resolved? Is there a pattern?",
`The late payment reported on my {{CREDITOR}} account (ending {{ACCT}}) in {{EVENT_DATE}} occurred because {{DETAIL}}. This was an isolated event. The account has been paid on time before and since, and I have set up automatic payments to prevent a recurrence. I have no other late payments in the last 24 months.`,
["Proof of cause if available (medical bill, PCS orders, employer letter)","Statement showing the account current"],
"One cause, one fix, one sentence each. Don't blame the creditor unless you have proof."),
LO("L02","Collection account","Credit","Any open or paid collection on the report.","Is it medical? Disputed? Paid or being paid? Does the program require payoff (e.g., conventional >$2,000 non-medical aggregate may need payoff or 5% payment in DTI)?",
`The collection from {{CREDITOR}} (ending {{ACCT}}, $\{{AMOUNT}}) arose from {{DETAIL}}. (It has been paid in full on {{EVENT_DATE}} / I am paying it under the enclosed agreement / I am disputing it as inaccurate — enclosed.) It does not reflect my current ability or willingness to meet my obligations, as shown by my other accounts, all of which are current.`,
["Paid letter or payment plan","Original bill / EOB if medical"],
""),
LO("L03","Charge-off","Credit","Charged-off account, paid or unpaid.","Cause, whether it's settled, and whether any similar risk remains.",
`The {{CREDITOR}} account (ending {{ACCT}}) was charged off in {{EVENT_DATE}} after {{DETAIL}}. (I settled the account on ____ for $____ / the balance remains and I intend to resolve it by ____.) Since then I have rebuilt my credit, and all of my open accounts are current.`,
["Settlement letter","Proof of payment"],""),
LO("L04","Chapter 7 bankruptcy","Credit","BK7 discharged within ~7 years (VA/FHA: 2-yr wait from discharge; conventional: 4 yrs, 2 with extenuating circumstances — verify).","Was it caused by a one-time event outside your control (extenuating) or by financial mismanagement? Has the cause been resolved?",
`I filed Chapter 7 bankruptcy on {{EVENT_DATE}}, discharged on ____ (case no. ____). The bankruptcy was caused by {{DETAIL}} (for example: a job loss / a medical event / a divorce / a business failure). The circumstances that led to it have been resolved: ____. Since the discharge I have re-established credit and paid every obligation on time, as shown on my credit report.`,
["Discharge order","Schedule F","Documentation of the extenuating event"],
"If you're claiming extenuating circumstances, the documentation must show the event was outside your control and the cause of the BK."),
LO("L05","Chapter 13 bankruptcy (in repayment or discharged)","Credit","BK13 — VA/FHA may allow purchase after 12 months of on-time plan payments with trustee permission.","Cause; on-time plan history; trustee approval to incur new debt.",
`I filed Chapter 13 bankruptcy on {{EVENT_DATE}} (case no. ____) because {{DETAIL}}. I have made all ____ plan payments on time through the trustee (payment history enclosed). (The plan was discharged on ____ / I have obtained the trustee's written permission to incur this mortgage debt — enclosed.) My finances are stable and I have had no new derogatory credit since filing.`,
["Trustee payment history","Trustee/court permission letter","Discharge order if applicable"],""),
LO("L06","Foreclosure","Credit","Prior foreclosure (VA: ~2 yrs; FHA: 3 yrs; conventional: 7 yrs or 3 with extenuating circumstances — verify).","Cause, completion date, whether a VA loan was involved (entitlement/CAIVRS), and what's different now.",
`My previous home at ____ was foreclosed; the foreclosure completed on {{EVENT_DATE}}. It resulted from {{DETAIL}}. (If the loan was a VA loan: the VA has been repaid / I have a remaining entitlement of $____ per the enclosed COE.) My income and housing costs are now stable, and I have had no late payments since.`,
["Trustee's deed / completion documentation","Updated COE (VA)","Documentation of the cause"],""),
LO("L07","Short sale or deed-in-lieu","Credit","Prior short sale / DIL (shorter waits than foreclosure for most programs).","Cause, completion date, whether the lender released the deficiency.",
`In {{EVENT_DATE}} I completed a short sale (or deed-in-lieu of foreclosure) on my previous home at ____ with {{CREDITOR}}. The sale was necessary because {{DETAIL}}. The lender approved the sale and (released the deficiency balance / I repaid the deficiency on ____). My financial situation has stabilized since, and my credit has been current.`,
["Short-sale approval letter","Settlement statement","Deficiency release"],""),
LO("L08","Judgment, tax lien or IRS installment agreement","Credit","Open judgment/lien, or an IRS payment plan (payments count in DTI; VA/FHA allow with 3 months' history on the plan).","Is it paid or on an approved plan? Will it attach to the new property?",
`A {{DETAIL}} (judgment / tax lien / IRS balance) of $\{{AMOUNT}} from {{CREDITOR}} dated {{EVENT_DATE}} appears on my record. (It was satisfied on ____ — release enclosed / I am paying it under an installment agreement of $____ per month, approved ____, with ____ payments made on time — enclosed.)`,
["Satisfaction / release","IRS installment agreement and payment history"],""),
LO("L09","Disputed accounts on the credit report","Credit","Accounts showing 'consumer disputes' — AUS (DU/LPA/GUS) may refuse to run or require the dispute to be removed.","Why the dispute, whether it's resolved, and confirmation the account is accurate or being corrected.",
`The {{CREDITOR}} account (ending {{ACCT}}) shows a consumer dispute. I disputed it on {{EVENT_DATE}} because {{DETAIL}}. (The dispute has been resolved and I have asked the bureau to remove the dispute notation — enclosed / I withdraw the dispute and confirm the account is reported accurately.)`,
["Bureau dispute results","Request to remove dispute notation"],
"Open disputes during a loan can block automated underwriting — resolve or withdraw them before the credit pull if possible."),
LO("L10","Recent credit inquiries","Credit","Multiple inquiries in the last 90–120 days — underwriters must confirm no new undisclosed debt.","Did any inquiry result in new credit? Rate shopping is fine; new debt must be in DTI.",
`The following inquiries on my credit report were for: {{DETAIL}} (e.g., 'Lender A and B — mortgage rate shopping for this loan; Auto Finance — pricing a vehicle, no loan opened'). No new credit accounts or debts were opened as a result of these inquiries other than those already listed on my application.`,
[],"List every inquiry by name and date. If a new account WAS opened, disclose it — the underwriter will find it on the pre-closing refresh."),
LO("L11","New credit account opened recently","Credit","A new tradeline opened in the last 6–12 months.","Why, the payment, and that it is included in DTI.",
`I opened the {{CREDITOR}} account (ending {{ACCT}}) on {{EVENT_DATE}} for {{DETAIL}}. The monthly payment is $\{{AMOUNT}} and is included in my debt-to-income calculation. I do not intend to open any further credit before closing.`,
["New account statement"],""),
LO("L12","Thin credit / no credit score — non-traditional credit","Credit","Fewer than 2–3 tradelines or no score (VA/FHA allow manual underwriting with non-traditional credit: rent, utilities, insurance, phone, 12 months each).","12 months of on-time history on at least 3 non-traditional sources, one of which is housing.",
`I have limited traditional credit because {{DETAIL}} (e.g., I have paid cash and avoided debt / I recently separated from the military / I am new to the U.S.). I have enclosed 12 months of verified on-time payment history for: rent to ____, ____ utility, ____ insurance, and ____ phone service, to be used as non-traditional credit references.`,
["12 months cancelled checks/bank statements for rent","Utility/insurance/phone payment histories","Landlord verification of rent (VOR)"],""),
LO("L13","Co-signed debt paid by someone else","Credit","You co-signed (student loan, car) and want it excluded from DTI — requires 12 months of proof the other party paid from their own account.","12 consecutive months of payments made by the other party, no lates.",
`The {{CREDITOR}} account (ending {{ACCT}}, payment $\{{AMOUNT}}/month) is a debt I co-signed for {{DETAIL}} (name/relationship). The primary borrower has made every payment from their own account for the past 12 months, as shown by the enclosed 12 months of statements/cancelled checks. I request that this payment be excluded from my debt-to-income ratio.`,
["12 months of the other party's bank statements or cancelled checks","Statement showing no lates"],""),
LO("L14","Authorized-user accounts","Credit","AU accounts on the report — some programs require proof the AU didn't make payments to exclude them from DTI, or won't count them toward tradeline requirements.","Who pays; whether to count the payment.",
`I am an authorized user, not the account holder, on the {{CREDITOR}} account (ending {{ACCT}}). The account belongs to {{DETAIL}} (name/relationship), who makes all payments. I am not obligated on the account and do not make payments on it.`,
["Statement from the account holder (optional)"],""),
LO("L15","Credit counseling / debt management plan","Credit","Enrolled in a DMP (FHA/VA allow with 12 months on-time plan payments and counselor permission).","Plan history and permission to take on a mortgage.",
`I enrolled in a debt management plan with {{CREDITOR}} on {{EVENT_DATE}} to resolve {{DETAIL}}. I have made ____ consecutive on-time plan payments of $\{{AMOUNT}}. The counseling agency's letter permitting me to obtain a mortgage and my payment history are enclosed.`,
["DMP agreement and payment history","Agency permission letter"],""),
/* Income & employment */
LO("L16","Gap in employment","Income & employment","Any gap over 30 days in the last 2 years (6+ months usually needs 6 months back on the job).","Why, how you supported yourself, and that current employment is stable.",
`I was not employed from {{EVENT_DATE}} to ____ because {{DETAIL}} (e.g., caring for a family member / relocating for my spouse's PCS / completing a degree / a layoff). During that time I supported myself through ____. I returned to work on ____ with {{CREDITOR}} in the same field, and my employment is full-time and ongoing.`,
["Offer letter / first pay stub after the gap","Documentation of the reason if available"],""),
LO("L17","Job change within the last 2 years","Income & employment","Changed employers or positions recently — including a change from W-2 to 1099/commission (which may require 2 years' history).","Same line of work? Lateral or advancement? Pay structure change?",
`On {{EVENT_DATE}} I changed employers from ____ to {{CREDITOR}} as a {{DETAIL}}. The move was within the same line of work and represents an advancement in title and compensation (from $____ to $\{{AMOUNT}} per year). My compensation remains salaried/hourly W-2 (not commission). I have worked continuously in this field for ____ years.`,
["Offer letter","Most recent pay stubs","Prior employer's final pay stub / W-2"],""),
LO("L18","Declining income (W-2) or reduced hours","Income & employment","This year's income is lower than last year's (overtime, bonus or hours fell).","Is the decline temporary or permanent? Underwriter will use the lower figure unless explained and documented.",
`My income for {{EVENT_DATE}} is lower than the previous year because {{DETAIL}} (e.g., a temporary reduction in overtime during a plant slowdown that ended ____ / a one-time bonus in the prior year that is not part of my base pay). My base pay of $\{{AMOUNT}} per year has not changed, as shown on the enclosed written verification of employment.`,
["Written VOE showing base pay","Year-to-date pay stub","Employer letter on the temporary nature of the decline"],""),
LO("L19","Self-employed income decline","Income & employment","Year-over-year decline on Schedule C / K-1 / 1120S (over ~20% usually requires an explanation and may require the lower year to be used).","Cause, whether it's reversed, and current YTD P&L support.",
`My business, ____, showed lower net income in {{EVENT_DATE}} compared with the prior year because {{DETAIL}} (e.g., a one-time equipment purchase expensed that year / a client lost and since replaced / a deliberate reinvestment). The enclosed year-to-date profit-and-loss statement and business bank statements show income has recovered to $\{{AMOUNT}}, and the business remains stable and ongoing.`,
["YTD P&L (CPA-prepared if possible)","Business bank statements","CPA letter"],
"If the decline is >25% most agency programs will average the lower year or decline — consider Bank Statement programs (see Scenario Builder)."),
LO("L20","Overtime, bonus or commission continuance","Income & employment","Using variable income — needs a 2-year history (12 months sometimes) and likelihood of continuance.","History, consistency and whether the employer expects it to continue.",
`My compensation at {{CREDITOR}} includes {{DETAIL}} (overtime / quarterly bonus / commission) which I have received consistently for ____ years, averaging $\{{AMOUNT}} per year. My employer's enclosed letter confirms that this compensation is expected to continue.`,
["2 years W-2s","Employer letter on continuance","Written VOE with breakdown"],""),
LO("L21","1099 / contract income or multiple part-time jobs","Income & employment","1099 income needs a 2-year history; multiple jobs need 12–24 months of holding both.","Stability and whether the arrangement will continue.",
`I have earned 1099 income from {{CREDITOR}} since {{EVENT_DATE}} doing {{DETAIL}}, averaging $\{{AMOUNT}} per year as shown on the enclosed 1099s and tax returns. (I have also held my part-time position at ____ concurrently since ____.) Both arrangements are ongoing.`,
["2 years 1099s and returns","Contract or engagement letter","YTD payment records"],""),
LO("L22","Retirement, pension, Social Security or disability income","Income & employment","Fixed income — needs an award letter and proof of receipt; non-taxable portions may be grossed up (usually 25%).","Continuance for at least 3 years; receipt.",
`My income consists of {{DETAIL}} (pension from ____ / Social Security retirement / SSDI) of $\{{AMOUNT}} per month, which began {{EVENT_DATE}} and will continue for life / at least three years, as shown on the enclosed award letter. The enclosed bank statements show the deposits. (This income is non-taxable and I ask that it be grossed up per program guidelines.)`,
["Award letter","Bank statements showing deposits","1099-R / SSA-1099"],""),
LO("L23","Child support or alimony received (as income)","Income & employment","Using support as qualifying income — needs a court order and 6–12 months of receipt, continuing 3 years.","Order, receipt history, remaining duration.",
`I receive child support / alimony of $\{{AMOUNT}} per month under the enclosed court order dated {{EVENT_DATE}}, payable through {{DETAIL}} (child's 18th birthday / date). I have received these payments consistently for the past ____ months, as shown by the enclosed bank statements. I ask that this income be included in my qualifying income.`,
["Court order / divorce decree","6–12 months bank statements or state disbursement records"],""),
LO("L24","Child support, alimony or garnishment paid (as debt)","Income & employment","A support obligation or garnishment that doesn't appear on the credit report but must be included in DTI.","Amount, duration, and whether you're current.",
`I pay child support / alimony of $\{{AMOUNT}} per month under the enclosed order dated {{EVENT_DATE}}, which continues until {{DETAIL}}. I am current on all payments. (A wage garnishment of $____ per month for ____ will end on ____.) Please include this obligation in my debt-to-income ratio.`,
["Court order","Pay stubs showing deduction or payment records"],""),
LO("L25","Future employment contract / start date after closing","Income & employment","New job starting within 60–90 days of closing (physician, teacher, relocating employee) — allowed by some programs with a non-contingent contract.","Non-contingent offer, start date, and reserves to cover payments until the first paycheck.",
`I have accepted a position as {{DETAIL}} with {{CREDITOR}} starting {{EVENT_DATE}} at an annual salary of $\{{AMOUNT}}. The enclosed offer letter is non-contingent (all contingencies have been satisfied). I have reserves of $____ to cover housing expenses until my first paycheck.`,
["Executed offer letter / employment contract","Proof of reserves"],""),
LO("L26","Seasonal or temporary employment","Income & employment","Seasonal work with off-season unemployment income (2-year history, same employer/field, likely rehire).","History and the employer's rehire expectation.",
`I work seasonally for {{CREDITOR}} as a {{DETAIL}} and have done so for ____ consecutive seasons since {{EVENT_DATE}}. During the off-season I receive unemployment benefits of $____. My employer expects to rehire me next season (letter enclosed).`,
["2 years W-2s","Employer rehire letter","Unemployment benefit history"],""),
LO("L27","Probationary period at new job","Income & employment","Employer confirms you're in a probationary period — some lenders won't close until it ends.","Length and whether termination risk is real.",
`My position at {{CREDITOR}} includes a standard ____-day introductory period ending {{EVENT_DATE}}, which applies to all new hires and is not performance-related. {{DETAIL}} My employer's enclosed letter confirms my employment is full-time, permanent and expected to continue.`,
["Employer letter"],""),
/* Assets */
LO("L28","Large deposit","Assets","Any non-payroll deposit over ~50% of monthly qualifying income (conventional) or any unusual deposit (VA/FHA).","Source, that it's not a loan, and a paper trail.",
`The deposit of $\{{AMOUNT}} on {{EVENT_DATE}} into my {{CREDITOR}} account (ending {{ACCT}}) was {{DETAIL}} (e.g., the sale of my vehicle / a tax refund / a transfer from my savings account ending ____ / an insurance claim payment). It is not a loan and I have no obligation to repay it. Supporting documentation is enclosed.`,
["Bill of sale + title transfer","Tax refund transcript / IRS deposit","Statement of the sending account","Insurance claim letter"],
"Each large deposit needs its own paper trail. If you can't source it, the lender will exclude it from assets — which is fine if you still have enough."),
LO("L29","Cash deposits","Assets","Cash (currency) deposits — most programs can't source cash; the funds may be excluded.","Whether the funds are needed, and the legitimate origin.",
`The cash deposits totaling $\{{AMOUNT}} between {{EVENT_DATE}} and ____ into my account ending {{ACCT}} were {{DETAIL}} (e.g., cash tips from my job, which are reported on my W-2 / cash wedding gifts). I understand these funds may not be counted toward my down payment or reserves, and I have sufficient other verified funds to close.`,
["W-2 showing reported tips","Wedding announcement + gift letters (if gifts)"],""),
LO("L30","Gift funds","Assets","Down payment or closing costs from a relative (VA/FHA/conventional each have gift-letter rules; some conventional loans require 5% own funds on 2–4 units).","Donor relationship, no repayment, and the transfer trail.",
`$\{{AMOUNT}} of my funds to close is a gift from {{DETAIL}} (name and relationship), transferred on {{EVENT_DATE}} from the donor's account at ____ to my account ending {{ACCT}}. The enclosed gift letter, signed by the donor, confirms that no repayment is expected or implied. The donor's statement showing the withdrawal and my statement showing the deposit are enclosed.`,
["Signed gift letter (lender's form)","Donor's bank statement","Recipient's statement showing deposit"],""),
LO("L31","401(k) / retirement loan or withdrawal","Assets","Using retirement funds for closing — a 401(k) loan payment may need to be in DTI (program-dependent); withdrawals need the terms of withdrawal.","Amount, terms, and whether a repayment is required.",
`On {{EVENT_DATE}} I (withdrew / took a loan of) $\{{AMOUNT}} from my {{CREDITOR}} 401(k)/retirement account to use toward my down payment and closing costs. {{DETAIL}} (If a loan: the repayment of $____ per month is deducted from my paycheck; I have included it as requested.) The enclosed terms of withdrawal and statement show the transaction and the deposit into my account ending {{ACCT}}.`,
["Terms of withdrawal / loan documents","Retirement account statement","Bank statement showing deposit"],""),
LO("L32","Sale of an asset (vehicle, boat, collectibles, stock)","Assets","Funds from selling personal property or liquidating investments.","Proof of ownership, sale, and receipt of funds.",
`On {{EVENT_DATE}} I sold my {{DETAIL}} (e.g., 2019 Toyota Tacoma / 120 shares of ____) for $\{{AMOUNT}}. The proceeds were deposited into my account ending {{ACCT}}. The bill of sale, proof of prior ownership and deposit record are enclosed.`,
["Bill of sale","Title / registration or brokerage statement","Deposit record"],""),
LO("L33","Transfers between own accounts","Assets","Transfers that look like deposits — underwriter needs to see both sides.","That both accounts are yours.",
`The deposits on {{EVENT_DATE}} of $\{{AMOUNT}} into my account ending {{ACCT}} are transfers from my own {{CREDITOR}} account ending {{DETAIL}}. Statements for both accounts are enclosed showing the withdrawal and the matching deposit.`,
["Statements for both accounts"],""),
LO("L34","Use of business funds for closing","Assets","Self-employed borrowers using business account funds (underwriter must confirm the withdrawal won't harm the business — often needs a CPA letter and a cash-flow analysis).","Ownership %, business impact.",
`I own ____% of {{CREDITOR}} and will use $\{{AMOUNT}} from the business account ending {{ACCT}} toward closing. {{DETAIL}} The enclosed CPA letter and year-to-date financials confirm that the withdrawal will not negatively affect the business's operations or ability to meet its obligations.`,
["CPA letter","Business bank statements","YTD P&L and balance sheet"],""),
LO("L35","Overdrafts / NSF charges","Assets","Overdrafts or NSF fees on bank statements (VA/FHA manual underwriting especially).","Cause, isolated vs pattern, now resolved.",
`The overdraft / NSF charges on my {{CREDITOR}} account ending {{ACCT}} on {{EVENT_DATE}} occurred because {{DETAIL}} (e.g., an automatic payment posted before my payroll deposit / a bank error later reversed). The account has maintained a positive balance since, and I have set up low-balance alerts.`,
["Bank statements showing the fees and subsequent positive balance","Bank letter if it was a bank error"],""),
LO("L36","Source of earnest money deposit","Assets","EMD paid from an account other than the verified assets, or paid in cash.","Where it came from, trail into escrow.",
`The earnest money deposit of $\{{AMOUNT}} paid on {{EVENT_DATE}} came from my {{CREDITOR}} account ending {{ACCT}}. The enclosed statement shows the withdrawal/cleared check, and the escrow receipt is enclosed. {{DETAIL}}`,
["Cleared check copy or wire confirmation","Escrow receipt","Bank statement"],""),
LO("L37","Undisclosed account / account not on application","Assets","An account appears on statements or in a VOD that wasn't listed.","Why omitted; whether it's yours; any debt tied to it.",
`The {{CREDITOR}} account ending {{ACCT}} was not listed on my application because {{DETAIL}} (e.g., it is a dormant account with a small balance / it was closed on ____ / it belongs to my child and I'm only a custodian). The enclosed statement is provided for completeness. It has no associated debt.`,
["Account statement"],""),
LO("L38","Cryptocurrency liquidation","Assets","Funds from selling crypto — usable only once converted to U.S. dollars with a full trail (exchange history, wallet ownership).","Ownership, sale, and deposit trail.",
`On {{EVENT_DATE}} I sold {{DETAIL}} (e.g., 0.75 BTC) on {{CREDITOR}} for $\{{AMOUNT}}, which was transferred to my bank account ending {{ACCT}}. The enclosed exchange transaction history, account-ownership verification and bank statement show the full trail.`,
["Exchange transaction history and account verification","Bank statement showing deposit"],""),
LO("L39","Proceeds from sale of a previous home","Assets","Down payment from a departing residence closing concurrently or recently.","Closing statement; net proceeds; timing.",
`My previous home at {{DETAIL}} (sold / is scheduled to close on {{EVENT_DATE}}). The net proceeds of approximately $\{{AMOUNT}}, shown on the enclosed (final / estimated) settlement statement, will be used for the down payment and closing costs on my new home.`,
["Settlement statement (final or estimated)","Purchase contract on the departing home"],""),
LO("L40","Foreign assets / funds from abroad","Assets","Funds held in or transferred from a foreign account (needs translated statements, currency conversion, and a transfer trail into a U.S. account).","Ownership, legitimacy, and transfer.",
`The $\{{AMOUNT}} deposited on {{EVENT_DATE}} into my account ending {{ACCT}} was transferred from my own account at {{CREDITOR}} in ____ (country). {{DETAIL}} The enclosed translated foreign statements, currency-conversion record and wire confirmation show the ownership and transfer of the funds.`,
["Foreign bank statements (translated)","Wire confirmation","Currency conversion"],""),
/* Property & occupancy */
LO("L41","Primary-residence occupancy intent","Property & occupancy","Occupancy questions — distance from job, keeping another home nearby, buying a smaller home, or a VA/FHA loan (owner-occupancy required; VA: occupy within 60 days).","Credible reason to live in this home.",
`I will occupy the property at {{DETAIL}} as my primary residence within 60 days of closing. {{CREDITOR}} (e.g., 'I am relocating to be closer to my new job at ____ / my children's school / my aging parents.') My current residence at ____ will be (sold / rented / retained as ____).`,
["Employer letter (if relocating for work)","Listing agreement or lease on the departing home"],""),
LO("L42","Commuting distance / remote work","Property & occupancy","Property is far from the employer's address.","Remote/hybrid arrangement in writing, or a transfer.",
`The property is ____ miles from my employer's office. My position with {{CREDITOR}} is {{DETAIL}} (fully remote / hybrid with ____ days per month on site), as confirmed in the enclosed employer letter. I will occupy the property as my primary residence.`,
["Employer letter confirming remote/hybrid work"],""),
LO("L43","Departing residence — converting to a rental","Property & occupancy","Keeping the current home and renting it (rental income may count with a lease and, for some programs, proof of equity or security deposit).","Lease, deposit, and the plan.",
`I will retain my current home at {{DETAIL}} and rent it out. A lease with ____ beginning {{EVENT_DATE}} at $\{{AMOUNT}} per month is enclosed, along with the deposit of the security deposit/first month's rent into my account ending {{ACCT}}. I will occupy the new property as my primary residence.`,
["Executed lease","Proof of security deposit","Appraisal or equity evidence if required"],""),
LO("L44","Non-arm's-length / buying from a relative or landlord","Property & occupancy","Purchasing from a family member, your landlord, or your employer (extra scrutiny; gift-of-equity rules).","Relationship, fair price, any gift of equity.",
`I am purchasing the property from {{DETAIL}} (name and relationship). The purchase price of $\{{AMOUNT}} was based on ____ (an appraisal / comparable sales). (A gift of equity of $____ is being provided and is documented in the enclosed gift letter.) There are no side agreements, and I will occupy the home as my primary residence.`,
["Gift-of-equity letter","Purchase contract","Prior lease (if buying from landlord)"],""),
LO("L45","Rent-free living / no housing history","Property & occupancy","Living with family rent-free (common for first-time buyers and after military separation) — some programs require a letter from the homeowner.","Who you lived with, that no rent was paid.",
`From {{EVENT_DATE}} to the present I have lived rent-free at {{DETAIL}} (address) with ____ (name and relationship). I have not paid rent during this period. A letter from the homeowner confirming this is enclosed.`,
["Homeowner's letter confirming rent-free residence"],""),
LO("L46","Multiple addresses / address discrepancy","Property & occupancy","Credit report or ID shows addresses not on the application.","Explain each address.",
`The following addresses appear on my credit report or identification: {{DETAIL}}. (Address 1 was my residence from ____ to ____; Address 2 is my parents' mailing address used for mail during my deployment; Address 3 I have never lived at and have asked the bureau to remove.) My current residence is {{ADDR}}, {{CITY}}, since {{EVENT_DATE}}.`,
["Updated ID or utility bill for current address"],""),
LO("L47","Second home vs investment intent","Property & occupancy","Buying a second home (must be a reasonable distance from the primary and for personal use).","Reasonable distance, personal use, no rental management agreement.",
`The property at {{DETAIL}} will be used as my second home for personal use (e.g., family vacations ____ weeks per year). It is ____ miles from my primary residence. I will not enter into a rental or management agreement and will keep it available for my exclusive use.`,
[],""),
LO("L48","Mixed-use, accessory unit or unusual property","Property & occupancy","Property with an ADU, home business use, or acreage.","Residential use dominant; no commercial income relied on (unless documented).",
`The property at {{DETAIL}} includes ____ (an accessory dwelling unit / a home office). The property is primarily residential and I will occupy the main residence. {{CREDITOR}} (e.g., 'The ADU will be used by my parents; no rental income is being used to qualify.')`,
["Appraisal addendum","Zoning letter if required"],""),
/* Identity & misc */
LO("L49","Name variation / alias on credit report","Identity & misc","Maiden name, nickname, Jr./Sr., or a misspelling.","Confirm all names belong to you.",
`My credit report lists the following name variations: {{DETAIL}}. These are all me — (my maiden name prior to marriage on {{EVENT_DATE}} / a nickname used on an application / a misspelling by a creditor). My legal name is {{NAME}}.`,
["Marriage certificate / court order if name changed"],""),
LO("L50","Social Security number discrepancy","Identity & misc","SSN digits differ between documents or a credit report shows an SSN variation.","Confirm the correct SSN with the card and clear the variation.",
`The Social Security number on {{DETAIL}} (document) differs from my actual SSN because {{CREDITOR}} (e.g., a transposition by the creditor / a prior ITIN before I received my SSN on {{EVENT_DATE}}). My correct SSN ends in {{SSN4}}; a copy of my Social Security card is enclosed.`,
["Social Security card","SSA letter if applicable"],""),
LO("L51","Divorce or legal separation","Identity & misc","Divorce affecting debts, support, property, or a former spouse's accounts on your report.","Which debts you're responsible for; support obligations.",
`My divorce from {{DETAIL}} was finalized on {{EVENT_DATE}} (decree enclosed). Under the decree, I am responsible for ____ and my former spouse is responsible for ____ (including the {{CREDITOR}} account ending {{ACCT}}). (I pay / receive child support or alimony of $\{{AMOUNT}} per month.) The former marital home was (sold / awarded to ____ / refinanced out of my name on ____).`,
["Divorce decree / separation agreement","Deed or refinance proof removing you from the prior mortgage"],""),
LO("L52","Student loans in deferment / IDR payment","Identity & misc","Student loans show $0 or deferred — each program calculates the payment differently (VA: payment on the credit report or 5% of balance ÷ 12 unless deferred 12+ months past closing; FHA: 0.5% of balance if $0; conventional: 1% or documented IDR payment).","Actual payment under the plan; deferment end date.",
`My federal student loans with {{CREDITOR}} (balance $\{{AMOUNT}}) are {{DETAIL}} (in deferment until {{EVENT_DATE}} / on an income-driven repayment plan with a payment of $____ per month). The servicer's letter confirming the status and payment is enclosed.`,
["Servicer letter confirming status/payment","NSLDS printout"],""),
LO("L53","Undisclosed debt found on the credit refresh","Identity & misc","A debt appeared on the pre-closing credit refresh or was omitted from the application.","Why omitted; include it in DTI.",
`The {{CREDITOR}} account (ending {{ACCT}}, payment $\{{AMOUNT}}) was not on my application because {{DETAIL}} (e.g., it was opened on {{EVENT_DATE}} after I applied / I believed it had been paid off / it is a family member's account on which I'm a co-signer). Please include it in my debt-to-income calculation.`,
["Account statement"],""),
LO("L54","Prior loan denial / withdrawn application","Identity & misc","A prior mortgage application was denied or withdrawn (lender may see the inquiry).","What happened, and what's different now.",
`I applied with {{CREDITOR}} on {{EVENT_DATE}} and the application was {{DETAIL}} (denied for ____ / withdrawn because ____). Since then I have ____ (paid down the balances / documented my income / chosen a different program), which addresses the prior issue.`,
[],""),
LO("L55","Property taxes / HOA / insurance claims","Identity & misc","Delinquent property taxes, HOA dues, or a prior insurance claim affecting the file.","Resolution.",
`The {{DETAIL}} (delinquent property taxes / HOA dues / insurance claim) relating to ____ in {{EVENT_DATE}} were caused by ____. They have been (paid on ____ / resolved as follows: ____). Documentation is enclosed.`,
["Proof of payment / resolution"],""),
/* Military & veteran */
LO("L56","PCS orders — occupancy within 60 days","Military & veteran","Buying at a new duty station before or shortly after a PCS move (VA occupancy rule: within 60 days; up to 12 months in some cases with justification).","Orders, report date, and the occupancy plan.",
`I have received Permanent Change of Station orders (enclosed) to {{DETAIL}} (installation) with a report date of {{EVENT_DATE}}. I will occupy the property at ____ as my primary residence within 60 days of closing, upon arrival at my new duty station. My spouse/family will occupy the home (on ____).`,
["PCS orders","Statement of service / LES"],""),
LO("L57","Deployment — spouse will occupy the home","Military & veteran","Servicemember is deployed or unaccompanied; VA allows the spouse (or dependent child, with conditions) to satisfy occupancy.","Deployment status and the spouse's occupancy; POA for closing.",
`I am currently deployed to / assigned unaccompanied at {{DETAIL}} from {{EVENT_DATE}} to ____ (orders enclosed). My spouse, ____, will occupy the property at ____ as our primary residence within 60 days of closing, and I will occupy it upon my return. I have executed a VA-compliant specific power of attorney (enclosed) authorizing my spouse to close on my behalf, and I have confirmed my intent to proceed via the enclosed 'alive and well' statement.`,
["Deployment orders","Specific POA (VA-approved form)","Alive-and-well verification (commanding officer letter)"],
"VA requires a specific POA naming the property, price, and VA loan terms, plus an alive-and-well check close to funding."),
LO("L58","Late payments during deployment / SCRA","Military & veteran","Lates that occurred while deployed (mail/pay disruption, autopay failure) — may also be an SCRA violation if the creditor was notified.","Cause tied to the deployment; current status.",
`The late payment(s) on my {{CREDITOR}} account (ending {{ACCT}}) in {{EVENT_DATE}} occurred while I was deployed to {{DETAIL}} (orders enclosed), when I had limited access to banking and mail. The account was brought current on ____ and has been paid on time since. (I have requested a goodwill adjustment / SCRA correction from the creditor.)`,
["Deployment orders","Statement showing the account current","Goodwill or SCRA letter sent"],""),
LO("L59","BAH / BAS as qualifying income","Military & veteran","Using Basic Allowance for Housing and Subsistence — non-taxable, may be grossed up; must be likely to continue (ETS date matters).","LES showing the allowances; ETS/re-enlistment status; whether BAH changes with the move.",
`My monthly military compensation (LES enclosed) includes Basic Allowance for Housing of $\{{AMOUNT}} and Basic Allowance for Subsistence of $____, both non-taxable. {{DETAIL}} (e.g., 'My BAH at the new duty station, ____, will be $____ per the DoD BAH calculator.') My current enlistment/service obligation runs through {{EVENT_DATE}}. These allowances are expected to continue.`,
["2 most recent LES","BAH calculator printout for the new MHA","Orders"],""),
LO("L60","VA disability compensation as income (and gross-up)","Military & veteran","Using VA disability — non-taxable, typically grossed up 25%; award must be documented and ongoing.","Award letter; permanence; also supports funding-fee exemption.",
`I receive VA disability compensation of $\{{AMOUNT}} per month for a service-connected rating of ____% effective {{EVENT_DATE}} (award letter enclosed). {{DETAIL}} (e.g., 'The rating is permanent and total' / 'No re-examination is scheduled.') This income is non-taxable; I request that it be grossed up in accordance with program guidelines. (If rated 10%+: I am also exempt from the VA funding fee, as reflected on my Certificate of Eligibility.)`,
["VA award letter / benefit summary (VA.gov)","Bank statements showing deposits","COE showing funding-fee exemption"],""),
LO("L61","Drill pay / Reserve or National Guard income","Military & veteran","Using drill pay (needs a 2-year history, or 12 months with likelihood of continuance) alongside civilian income.","History and continuance; activation status.",
`In addition to my civilian employment with {{CREDITOR}}, I serve in the {{DETAIL}} (Army National Guard / Navy Reserve, etc.) and have received drill pay averaging $\{{AMOUNT}} per year since {{EVENT_DATE}} (LES and W-2s enclosed). My service obligation continues through ____ and I am not currently on orders for activation.`,
["2 years military W-2s","Recent LES","Points statement / contract"],""),
LO("L62","Separating from service within 12 months (ETS / EAS)","Military & veteran","ETS within 12 months of closing — VA requires evidence of re-enlistment, a valid civilian job offer, or other stable income (e.g., retirement), or sufficient post-service income.","What happens after separation and the income that follows.",
`My current enlistment ends on {{EVENT_DATE}}. {{DETAIL}} (Choose: 'I intend to re-enlist; the enclosed statement from my commanding officer confirms my eligibility and intent.' / 'I have accepted a civilian position with {{CREDITOR}} as ____ starting ____ at $\{{AMOUNT}} per year — offer letter enclosed.' / 'I will retire with 20+ years of service and receive retirement pay of $____ per month — retirement estimate enclosed.')`,
["Commanding officer letter on re-enlistment","Civilian offer letter","Retirement pay estimate (DFAS)"],
"VA Pamphlet 26-7 Ch. 4: if ETS is within 12 months, the lender must document continuance — this LOE plus one of the three documents is what the underwriter needs."),
LO("L63","Military retirement pending / retirement pay","Military & veteran","Retiring soon or recently retired — retirement pay, VA disability, and a civilian job may all combine.","Retirement date, DFAS estimate, concurrent receipt/offset.",
`I will retire from the {{DETAIL}} on {{EVENT_DATE}} after ____ years of service. My retirement pay will be $\{{AMOUNT}} per month per the enclosed DFAS estimate (and I expect VA disability compensation of $____, with ____ concurrent receipt / offset). I have also accepted a civilian position with {{CREDITOR}} starting ____ (offer letter enclosed).`,
["DFAS retirement estimate / retiree account statement","Proposed VA rating decision","Civilian offer letter"],""),
LO("L64","GI Bill / tuition stipend not used as income","Military & veteran","Underwriter sees Post-9/11 GI Bill BAH-equivalent deposits and must know they are not qualifying income (education benefits generally cannot be used for VA loans).","Clarify the deposits' nature.",
`The monthly deposits of $\{{AMOUNT}} from the Department of Veterans Affairs into my account ending {{ACCT}} are Post-9/11 GI Bill monthly housing allowance payments for my enrollment at {{DETAIL}}. I understand these education benefits are not being used as qualifying income. My qualifying income consists of ____ as documented.`,
["VA education benefits statement","Enrollment verification"],""),
LO("L65","Prior VA loan — entitlement restoration or remaining entitlement","Military & veteran","A previous VA loan was paid off/sold (restoration), is still open (second-tier entitlement), or was foreclosed (entitlement charged).","Status of the prior loan; COE; the math for remaining entitlement.",
`I previously used my VA entitlement for a loan on {{DETAIL}} (address) in {{EVENT_DATE}}. That loan has been (paid in full and the property sold — entitlement restored per the enclosed COE / is still open with a balance of $\{{AMOUNT}}; I am using my remaining entitlement, as shown on the enclosed COE / was assumed by an eligible veteran who substituted their entitlement). My current COE reflects the correct available entitlement.`,
["Current COE (WebLGY)","Payoff/closing statement on the prior loan","Release of liability (if assumed)"],
"Use the VA Toolkit → Entitlement calculator to show the down payment (if any) needed with partial entitlement."),
LO("L66","Assumed VA loan / release of liability","Military & veteran","A VA loan you sold via assumption — if the VA didn't approve the assumption and release of liability, you may still be liable and your entitlement remains tied up.","Documentation of VA approval and the substitution of entitlement.",
`My former home at {{DETAIL}} was sold on {{EVENT_DATE}} by assumption of my VA loan with {{CREDITOR}}. The assumption was approved by the VA/servicer and I received a release of liability (enclosed). (The buyer substituted their entitlement, restoring mine, as shown on my COE / the buyer was not a veteran, so my entitlement remains tied to that loan and I am using my remaining entitlement.)`,
["Release of liability","Updated COE"],""),
LO("L67","VA debt / overpayment offset (CAIVRS hit)","Military & veteran","CAIVRS shows a delinquent federal debt (VA benefits overpayment, prior VA loan loss, defaulted federal student loan) — must be paid or on an approved repayment plan to proceed.","Nature of the debt and resolution.",
`CAIVRS shows a federal debt from {{DETAIL}} (VA benefits overpayment / prior VA loan claim / federal student loan) of $\{{AMOUNT}} dated {{EVENT_DATE}}. (It was paid in full on ____ — VA Debt Management Center letter enclosed / I entered a repayment agreement with the VA DMC on ____ and have made ____ on-time payments / the debt was waived on ____.) I ask that CAIVRS be re-checked and the clearance letter be placed in the file.`,
["VA Debt Management Center letter","Repayment agreement and history","Waiver decision"],""),
LO("L68","Residual income shortfall — compensating factors","Military & veteran","Residual income is below the VA table (or DTI >41% and residual isn't 120% of the table) — the underwriter needs documented compensating factors.","Specific, documented factors: reserves, tax-free income, low payment shock, long employment, conservative use of credit, high residual despite DTI, etc.",
`My residual income is $\{{AMOUNT}} against a VA guideline of $____ for my region and family size. I ask the underwriter to consider the following compensating factors: {{DETAIL}} (e.g., 'my BAH of $____ is non-taxable; my housing payment will increase by only $____ over my current rent; I have ____ months of PITI in reserves; I have ____ years with my current employer; my VA disability compensation of $____ per month is non-taxable and permanent'). Supporting documents are enclosed.`,
["Reserves statements","Current rent proof (payment-shock calc)","LES / award letters"],""),
LO("L69","TDY / geographic bachelor — spouse and family at the property","Military & veteran","Servicemember is on temporary duty or living in the barracks at a distant station while the family occupies the home.","Family occupancy; intent to return.",
`I am on temporary duty / assigned as a geographic bachelor at {{DETAIL}} through {{EVENT_DATE}} (orders enclosed). My spouse and children occupy the property at ____ as our family's primary residence, and I return there when not on duty. I will occupy the home full-time upon completion of this assignment.`,
["Orders","Spouse's occupancy statement"],""),
LO("L70","Security-clearance financial review / disclosed debts","Military & veteran","Borrower holds a clearance and must disclose or explain debts (or a clearance review flagged finances).","Consistency between the SF-86 disclosures and the application.",
`As a holder of a {{DETAIL}} security clearance, I have disclosed the following financial matters on my SF-86 / to my security officer: ____. These are consistent with the debts listed on my loan application. (The matter dated {{EVENT_DATE}} with {{CREDITOR}} was resolved on ____.)`,
[],""),
LO("L71","Military spouse — employment gap due to PCS","Military & veteran","Co-borrower spouse has gaps from repeated moves (common; underwriters accept with the pattern explained).","Gaps tied to PCS dates; current job stability.",
`My employment history includes gaps from {{EVENT_DATE}} to ____ and ____ to ____, each coinciding with my spouse's Permanent Change of Station moves to {{DETAIL}} (orders enclosed). At each new duty station I resumed work in my field within ____ months. I have been employed with {{CREDITOR}} since ____ at $\{{AMOUNT}} per year, and my position is ongoing.`,
["Spouse's PCS orders for each move","Offer letter / pay stubs"],""),
LO("L72","Enlistment / re-enlistment / combat bonus deposit","Military & veteran","A large deposit that is an enlistment, re-enlistment, or special-duty bonus (one-time; not qualifying income but fine as assets).","Source trail from DFAS; not a loan.",
`The deposit of $\{{AMOUNT}} on {{EVENT_DATE}} into my account ending {{ACCT}} is my {{DETAIL}} (re-enlistment / selective retention / special-duty) bonus paid by DFAS, as shown on the enclosed LES. It is not a loan. I understand it is a one-time payment and is not being used as qualifying income.`,
["LES showing the bonus","Re-enlistment contract"],""),
LO("L73","Combat pay / hazardous duty pay","Military & veteran","Combat-zone tax-exclusion pay or hazard pay — may be used only if likely to continue (rare); otherwise explain it's excluded.","Whether it continues.",
`My LES for {{EVENT_DATE}} includes {{DETAIL}} (Hostile Fire / Imminent Danger Pay / combat-zone tax exclusion) of $\{{AMOUNT}} per month associated with my deployment ending ____. I understand this pay is temporary and is not being used as qualifying income. My base pay and allowances are documented separately.`,
["LES","Deployment orders"],""),
LO("L74","Guard/Reserve activation — income change","Military & veteran","Activated to active duty (civilian pay replaced by military pay, or employer differential pay).","Which income continues, for how long; USERRA reemployment rights.",
`I was activated to active duty with the {{DETAIL}} on {{EVENT_DATE}} through ____ (orders enclosed). During activation my income is military base pay plus allowances of $\{{AMOUNT}} per month (LES enclosed). (My civilian employer, {{CREDITOR}}, pays differential pay of $____ / has confirmed my reemployment rights under USERRA upon release — letter enclosed.)`,
["Activation orders","LES","Employer USERRA / differential pay letter"],""),
LO("L75","Discharge characterization / eligibility explanation","Military & veteran","COE denied or pending due to discharge type (other than honorable), insufficient service, or a Guard/Reserve service question — explanation accompanies the VA Form 26-1880 or appeal.","Service dates, character of discharge, and any upgrade or VA character-of-discharge determination.",
`I served in the {{DETAIL}} from {{EVENT_DATE}} to ____ and was discharged with a characterization of ____. (I have applied to the Discharge Review Board for an upgrade / the VA issued a favorable character-of-discharge determination on ____ — enclosed / I am submitting VA Form 26-1880 with my DD-214 and a statement of service.) I request a determination of my eligibility for the VA home loan benefit.`,
["DD-214","VA Form 26-1880","Discharge upgrade application or decision"],""),
LO("L76","DD-214 not yet available / statement of service","Military & veteran","Active-duty borrower (no DD-214) — eligibility is shown by a statement of service on letterhead signed by the commander/personnel office.","Statement of service contents: name, SSN/DoD ID, DOB, entry date, lost time, name of command.",
`I am currently on active duty and do not have a DD-214. The enclosed statement of service, signed by {{DETAIL}} (name/title) on {{EVENT_DATE}}, confirms my full name, date of birth, entry date of ____, any lost time, and the name of my command. My Certificate of Eligibility has been (obtained through WebLGY / requested).`,
["Statement of service on letterhead","COE"],""),
LO("L77","Non-purchasing spouse — community-property state debts","Military & veteran","In AZ, CA, NV, TX, WA, etc. (community-property states), the non-borrowing spouse's debts may be counted on VA/FHA loans.","Spouse's debts and credit, even though they aren't on the loan.",
`My spouse, ____, is not a borrower on this loan. Because we reside in {{DETAIL}} (community-property state), I understand their debts are considered. Their obligations are: {{CREDITOR}} — $\{{AMOUNT}} per month; ____. (Their credit report is enclosed as required; any derogatory items are explained as follows: ____.)`,
["Non-purchasing spouse credit report","Statement of spouse's debts"],""),
LO("L78","VA funding fee exemption pending a disability rating","Military & veteran","Rating claim pending at closing — the fee must be paid (or escrowed) and is refunded if the rating is later granted retroactively.","Status of the claim; understanding of the refund process.",
`My claim for VA disability compensation filed on {{EVENT_DATE}} is pending (VA.gov claim status enclosed). I understand the VA funding fee of $\{{AMOUNT}} must be paid at closing because the exemption is not yet reflected on my COE, and that if my rating is granted with an effective date before closing I may request a refund of the fee through the lender/VA Regional Loan Center. {{DETAIL}}`,
["VA.gov claim status printout","COE"],""),
LO("L79","Two VA loans at once (second-tier entitlement)","Military & veteran","Keeping a VA-financed home (e.g., renting it after a PCS) and buying another with remaining entitlement.","Why two homes; occupancy of the new one; the entitlement math; rental income on the departing home.",
`I currently have a VA loan on my home at {{DETAIL}}, which I am retaining because {{CREDITOR}} (e.g., 'I received PCS orders to ____ and will rent the home — lease enclosed'). I will occupy the new property as my primary residence. My remaining entitlement, per the enclosed COE, is $____, which (requires no down payment / requires a down payment of $____ as calculated by the lender).`,
["COE","PCS orders","Lease on the departing home"],""),
LO("L80","Low appraisal — Tidewater / Reconsideration of Value response","Military & veteran","VA appraiser invoked Tidewater (value likely below contract) — borrower/agent may submit comps within 2 business days; or request an ROV after the NOV.","Relevant comps and facts for the appraiser; or a renegotiation plan.",
`Regarding the appraisal of {{DETAIL}} (address) under contract at $\{{AMOUNT}}: in response to the Tidewater notice dated {{EVENT_DATE}}, we submit the enclosed comparable sales and property information for the appraiser's consideration. (If the value is not supported, the seller has agreed to reduce the price to ____ / I will pay the difference of $____ from documented funds / I will exercise my VA escape clause.)`,
["Comparable sales (3–5) with MLS sheets","Repair/upgrade receipts","Amended contract if renegotiated"],""),
LO("L81","Overseas assignment / closing by power of attorney","Military & veteran","Borrower stationed overseas — VA requires a specific POA and alive-and-well verification; documents may need to be notarized at a U.S. embassy/consulate or by a military notary.","POA details; notarization; contact method.",
`I am stationed at {{DETAIL}} (overseas location) through {{EVENT_DATE}} (orders enclosed). I have executed a specific power of attorney (enclosed) appointing ____ as my attorney-in-fact for this transaction; it identifies the property, purchase price, loan amount and my intent to use my VA entitlement and occupy the home. It was notarized by ____ (military notary / U.S. consulate). My commanding officer's alive-and-well letter will be provided within ____ days of closing. I can be reached at ____.`,
["Specific POA","Orders","Alive-and-well letter"],""),
LO("L82","Pay delay / government shutdown affecting payments","Military & veteran","Missed or late payments during a pay disruption (shutdown, DFAS error).","Cause outside your control; now current.",
`The late payment on my {{CREDITOR}} account in {{EVENT_DATE}} occurred during {{DETAIL}} (a federal government shutdown / a DFAS pay processing error), when my pay was delayed by ____ days (documentation enclosed). The account was brought current as soon as pay resumed, and all accounts have been paid on time since.`,
["Pay statement showing the delay","News/official notice of the shutdown"],""),
LO("L83","Child support via military allotment / dependents","Military & veteran","Support paid by allotment doesn't appear on credit — must be disclosed; dependents affect residual income family size.","Amount, duration, allotment proof; correct family size.",
`I pay child support of $\{{AMOUNT}} per month by military allotment (LES enclosed) under the order dated {{EVENT_DATE}}, continuing until {{DETAIL}}. My household for residual-income purposes consists of ____ persons (myself, my spouse, and ____ dependents, ____ of whom reside with me ____% of the time).`,
["LES showing allotment","Court order"],""),
];
const LOE_CATS=[...new Set(LOE_LETTERS.map(l=>l.cat))];
const DISPUTE_CATS=[...new Set(DISPUTE_LETTERS.map(l=>l.cat))];
/* ---- Additional LOE scenarios (L84+) ---- */
LOE_LETTERS.push(
LO("L84","Purpose of cash-out refinance","Assets","Cash-out refi — underwriter must document the use of proceeds (debt payoff, improvements, investment, reserves).","Specific, legitimate use; no undisclosed new debt.",
`I am refinancing to take cash out of my home at {{DETAIL}} (address). The proceeds of approximately $\{{AMOUNT}} will be used for: {{CREDITOR}} (e.g., 'payoff of the credit-card balances listed on my application; a kitchen renovation; funds held in reserve'). I am not using the proceeds to purchase another property with financing that is not disclosed on this application.`,["Payoff statements","Contractor estimate (if improvements)"],""),
LO("L85","Employer-paid relocation / relocation package","Income & employment","Relocation benefits (lump sum, buyout, temporary housing) appear as deposits or affect the departing home.","Nature of the benefit; whether it's income or reimbursement; treatment of the old home.",
`My employer, {{CREDITOR}}, is relocating me to {{DETAIL}} effective {{EVENT_DATE}}. The relocation package (enclosed) includes a lump-sum payment of $\{{AMOUNT}}, which was deposited into my account ending {{ACCT}}. This is a one-time reimbursement, not qualifying income. (My current home will be purchased by the relocation company under the guaranteed buyout — agreement enclosed.)`,["Relocation agreement","Buyout agreement"],""),
LO("L86","RSU / stock compensation as income","Income & employment","Using restricted stock units or ESPP — needs 2-year vesting history and a continuance schedule; valued at current price with a haircut by some lenders.","Vesting history, future schedule, and current share price.",
`My compensation at {{CREDITOR}} includes restricted stock units that have vested annually since {{EVENT_DATE}}, averaging $\{{AMOUNT}} per year at the time of vesting (vesting statements enclosed). The enclosed grant schedule shows continued vesting of ____ shares per year through ____. {{DETAIL}}`,["Vesting statements (2 yrs)","Grant/vesting schedule","Recent brokerage statement"],""),
LO("L87","Trust income or trust-held assets","Income & employment","Beneficiary income from a trust, or a trust-owned asset account.","Trust agreement, trustee letter, 3-year continuance, history of distributions.",
`I receive distributions of $\{{AMOUNT}} per {{DETAIL}} (month/quarter) from the {{CREDITOR}} trust, of which I am a beneficiary. The enclosed trust agreement and trustee letter confirm the distribution amount, frequency and that distributions will continue for at least three years. Bank statements since {{EVENT_DATE}} show receipt.`,["Trust agreement (relevant pages)","Trustee letter","Bank statements"],""),
LO("L88","Side business showing a loss on Schedule C","Income & employment","A secondary business with a loss on returns — lenders may subtract the loss from income.","Whether the business is ongoing; size of loss; main income unaffected.",
`Schedule C of my {{EVENT_DATE}} tax return shows a loss of $\{{AMOUNT}} from {{DETAIL}} (a side business). {{CREDITOR}} (e.g., 'The business was closed on ____ and will not generate future losses' / 'The loss resulted from one-time startup expenses; the business is now profitable as shown on the enclosed YTD P&L'). My qualifying income is from my W-2 employment and is not dependent on this business.`,["Business closure proof or YTD P&L"],""),
LO("L89","Rental property showing a loss / negative cash flow","Property & occupancy","Schedule E shows a net loss on a rental you own — the loss counts as a liability.","Why (depreciation, one-time repairs, vacancy) and current rent.",
`My rental property at {{DETAIL}} shows a net loss of $\{{AMOUNT}} on Schedule E for {{EVENT_DATE}} because of {{CREDITOR}} (e.g., 'a one-time roof replacement of $____' / 'depreciation of $____, which is a non-cash expense' / 'two months of vacancy during a tenant turnover'). The property is currently leased at $____ per month (lease enclosed) and is cash-flow positive before depreciation.`,["Schedule E","Current lease","Repair invoices"],""),
LO("L90","Tax return extension / unfiled or amended return","Identity & misc","Returns on extension at application, or an amended return.","Why; proof of extension; how income is being documented.",
`I filed an extension (Form 4868, enclosed) for my {{EVENT_DATE}} federal return because {{DETAIL}}. My income for that year is documented by the enclosed W-2s/1099s, and I have no tax liability outstanding (or: the estimated payment of $\{{AMOUNT}} was made on ____). I will provide the filed return and transcripts when available.`,["Form 4868","W-2s/1099s","Proof of estimated payment"],""),
LO("L91","IRS payment plan / back taxes owed","Identity & misc","Owe the IRS with an installment agreement (VA/FHA allow with 3 on-time payments; conventional needs agreement + history).","Agreement, history, no lien (or lien subordinated).",
`I owe federal taxes of $\{{AMOUNT}} for tax year {{EVENT_DATE}} resulting from {{DETAIL}}. I entered an installment agreement with the IRS on ____ (enclosed) for $____ per month and have made ____ consecutive on-time payments (enclosed). No tax lien has been filed. Please include the payment in my debt-to-income ratio.`,["IRS installment agreement","Payment history","Account transcript"],""),
LO("L92","SBA / EIDL / PPP business loan","Income & employment","Business loans appearing on personal credit or in business bank statements.","Whether personally liable; payment; forgiveness status.",
`The {{CREDITOR}} loan (ending {{ACCT}}, balance $\{{AMOUNT}}) is a {{DETAIL}} (EIDL / PPP / SBA 7(a)) loan to my business, ____, obtained {{EVENT_DATE}}. (The PPP loan was forgiven on ____ — notice enclosed / the EIDL payment of $____ per month is paid by the business from business funds as shown on the enclosed statements.)`,["Forgiveness notice","Business statements showing payments"],""),
LO("L93","Short-term disability / parental leave","Income & employment","Borrower is on leave at closing; returning to work after closing (allowed with employer confirmation and sufficient income/reserves).","Return date, pay during leave, and the employer's confirmation.",
`I am currently on {{DETAIL}} (parental / short-term disability) leave from {{CREDITOR}} beginning {{EVENT_DATE}}, and will return to my position on ____ at my regular salary of $\{{AMOUNT}} per year (employer letter enclosed). During leave I receive $____ per month in leave pay/benefits. (I have reserves of $____ to cover housing expenses until my return.)`,["Employer return-to-work letter","Leave benefit statement"],""),
LO("L94","New second job (<2 years)","Income & employment","Part-time or second job started recently — may not count until 12–24 months; explain whether you need it.","Whether qualification depends on it.",
`I began a second job with {{CREDITOR}} on {{EVENT_DATE}} as a {{DETAIL}}, earning approximately $\{{AMOUNT}} per month. I understand this income may not be used to qualify until it has a sufficient history; my primary employment income is sufficient on its own.`,["Pay stubs"],""),
LO("L95","Personal loan from family — repayment or forgiveness","Assets","A deposit that was a family loan, or a family loan being repaid (counts as debt unless forgiven/gifted).","Whether it's a loan or a gift; terms.",
`On {{EVENT_DATE}} I received $\{{AMOUNT}} from {{DETAIL}} (name/relationship). {{CREDITOR}} (Choose: 'This was a gift with no repayment expected — gift letter enclosed.' / 'This is a loan repaid at $____ per month; please include it in my debt-to-income ratio.' / 'The loan was forgiven on ____ — letter enclosed.')`,["Gift letter or loan terms"],""),
LO("L96","Property held in a trust / LLC — vesting","Property & occupancy","Taking title in a revocable living trust (allowed with trust review) or moving a property out of an LLC to refinance.","Trust type, trustee/borrower identity, occupancy.",
`I intend to take title to {{DETAIL}} in the {{CREDITOR}} Revocable Living Trust dated {{EVENT_DATE}}, of which I am the settlor, trustee and primary beneficiary. The trust is revocable and I will occupy the property as my primary residence. The trust certification is enclosed.`,["Trust certification / relevant pages"],""),
LO("L97","Spouse/partner on title but not on the loan","Property & occupancy","Non-borrowing spouse on title (common; needs signature on security instrument) — or a borrower with a co-owner.","Who is on title and why; community-property implications.",
`My spouse, {{DETAIL}}, will be on title to the property but is not a borrower on the loan because {{CREDITOR}} (e.g., 'their income is not needed to qualify' / 'their credit score is below the program minimum'). They will sign the deed of trust and required disclosures. (We reside in a community-property state; their debts are disclosed on the enclosed statement.)`,["Non-borrowing spouse credit report (if required)"],""),
LO("L98","Closing by power of attorney (non-military)","Identity & misc","Borrower unavailable at closing; attorney-in-fact signs (lender approval of the POA required in advance).","Why; identity of the agent; specific POA.",
`I will be unable to attend closing because {{DETAIL}}. I have executed a specific power of attorney (enclosed for lender review) appointing {{CREDITOR}} (name/relationship) as my attorney-in-fact for this transaction only, identifying the property and loan terms. I will be reachable at {{PHONE}} on the closing date to confirm my intent.`,["Specific POA"],""),
LO("L99","Student loan forgiveness / discharge pending","Identity & misc","PSLF, TPD discharge or IDR forgiveness pending — the balance still counts until discharged.","Status; expected date; the payment to use meanwhile.",
`My federal student loans with {{CREDITOR}} (balance $\{{AMOUNT}}) are pending {{DETAIL}} (Public Service Loan Forgiveness / Total and Permanent Disability discharge), applied for on {{EVENT_DATE}} (status letter enclosed). Until discharge is granted, my payment under my repayment plan is $____ per month, and I understand that payment will be used in my debt-to-income ratio.`,["Forgiveness/discharge status letter"],""),
LO("L100","HOA litigation or special assessment","Property & occupancy","Condo/HOA has pending litigation or a special assessment affecting approval.","Nature, amount, who pays, impact on safety/structure.",
`The {{CREDITOR}} homeowners association has {{DETAIL}} (pending litigation regarding ____ / a special assessment of $\{{AMOUNT}} approved {{EVENT_DATE}} for ____). The HOA's enclosed letter confirms the matter does not involve structural safety or the project's financial viability. (The seller will pay the assessment at closing / I will pay $____ per month, included in my ratios.)`,["HOA letter","Litigation summary / assessment notice"],""),
LO("L101","Insurance claim on the subject property / prior damage","Property & occupancy","Property had a prior claim or recent damage (roof, flood); repairs completed.","Repairs done; permits; no open claims.",
`The property at {{DETAIL}} sustained {{CREDITOR}} damage on {{EVENT_DATE}}. Repairs totaling $\{{AMOUNT}} were completed on ____ by a licensed contractor (invoices and permits enclosed), and the insurance claim is closed. The appraiser noted no remaining deficiencies.`,["Contractor invoices","Permit final","Claim closure letter"],""),
LO("L102","Gap after military separation (transition period)","Military & veteran","Veteran had a gap between ETS and civilian employment.","Transition reason; current job stability.",
`I separated from the {{DETAIL}} on {{EVENT_DATE}} and was not employed until ____ while I {{CREDITOR}} (e.g., 'relocated my family, completed the SkillBridge program and interviewed for positions'). I supported my household with terminal leave pay and savings. I have been employed with ____ since ____ at $\{{AMOUNT}} per year in a position related to my military occupational specialty.`,["DD-214","Offer letter / pay stubs"],""),
LO("L103","VA pension / Survivors Pension / DIC income","Military & veteran","Non-service-connected pension, Survivors Pension, or Dependency and Indemnity Compensation.","Award letter, non-taxable status, continuance.",
`I receive {{DETAIL}} (VA Pension / Survivors Pension / Dependency and Indemnity Compensation) of $\{{AMOUNT}} per month, effective {{EVENT_DATE}} (award letter enclosed). This benefit is non-taxable and will continue for life. Bank statements showing the deposits are enclosed.`,["VA award letter","Bank statements"],""),
LO("L104","Combat-Related Special Compensation / CRDP","Military & veteran","Retiree receiving CRSC or Concurrent Retirement and Disability Pay in addition to retirement.","Breakdown of retirement vs VA vs CRSC; taxable vs not.",
`My monthly retirement income consists of DFAS retired pay of $____ (taxable), VA disability compensation of $____ (non-taxable) and {{DETAIL}} (CRSC / CRDP) of $\{{AMOUNT}} (non-taxable), effective {{EVENT_DATE}}. The DFAS retiree account statement and VA award letter are enclosed. I request gross-up of the non-taxable portions per program guidelines.`,["DFAS RAS","VA award letter","CRSC award letter"],""),
LO("L105","Reserve/Guard retirement (gray-area retiree) — pay starts at 60","Military & veteran","Guard/Reserve retiree not yet drawing retired pay (begins at 60, or earlier with qualifying active service).","Not yet income; when it starts; current income sources.",
`I retired from the {{DETAIL}} on {{EVENT_DATE}} with a Notice of Eligibility for retired pay (enclosed), which begins on ____ (age 60, reduced by qualifying active-duty time). I understand this retired pay is not current income and is not used to qualify. My current qualifying income is from ____.`,["NOE (20-year letter)","Retirement points statement"],""),
LO("L106","Active-duty spouse buying alone / veteran not on loan","Military & veteran","Non-veteran spouse applying alone (not VA-eligible) or veteran on title only.","Why; program used; occupancy.",
`I am applying for this loan in my name only. My spouse, {{DETAIL}}, is an active-duty servicemember currently {{CREDITOR}} (deployed / stationed at ____). Because the loan is not a VA loan, their VA entitlement is not used. They will be on title and will occupy the home with me when not on duty. (We reside in a community-property state; their obligations are disclosed.)`,["Spouse's orders","Marriage certificate (if needed)"],""),
LO("L107","Deployment income spike (tax-free combat pay) — prior year higher","Military & veteran","Prior-year income was higher due to deployment pay; current year is lower.","That the decline is not a loss of base income.",
`My {{EVENT_DATE}} income was higher than my current income because I was deployed to {{DETAIL}} from ____ to ____ and received combat-zone pay and family separation allowance. Those temporary entitlements ended when I returned. My base pay and allowances of $\{{AMOUNT}} per month are unchanged and are my qualifying income.`,["LES before/during/after deployment","Deployment orders"],""),
LO("L108","Blended Retirement System continuation pay / TSP loan","Military & veteran","BRS continuation-pay deposit (one-time) or a TSP loan used for closing.","Source and treatment.",
`The deposit of $\{{AMOUNT}} on {{EVENT_DATE}} into my account ending {{ACCT}} is {{DETAIL}} (Blended Retirement System continuation pay — one-time / a loan from my Thrift Savings Plan, repaid by payroll deduction at $____ per month — loan agreement enclosed). (The TSP loan payment has been included in my debts as requested.)`,["LES showing continuation pay","TSP loan agreement"],""),
LO("L109","Discharge upgrade pending / Discharge Review Board","Military & veteran","Applying for a discharge upgrade that affects VA eligibility or a civilian job.","Status; alternative program if VA isn't available yet.",
`I was discharged from the {{DETAIL}} on {{EVENT_DATE}} with a characterization of ____. I applied to the Discharge Review Board on ____ for an upgrade (application enclosed). {{CREDITOR}} (e.g., 'Until the upgrade is granted, I am proceeding under the FHA program.' / 'The VA issued a favorable character-of-service determination on ____ — enclosed.')`,["DRB application / decision","VA COD determination"],""),
LO("L110","Native American Direct Loan / tribal trust land","Military & veteran","Buying on federal trust land under the NADL program (VA is the lender; MOU with the tribe required).","Tribe MOU, lease, eligibility.",
`I am a {{DETAIL}} (tribal member / spouse) purchasing a home on {{CREDITOR}} (trust land) under the VA Native American Direct Loan program. The tribe has a Memorandum of Understanding with the VA (enclosed), and I hold a residential lease on the parcel (enclosed) dated {{EVENT_DATE}}. I will occupy the home as my primary residence.`,["Tribal MOU","Residential lease","Tribal enrollment"],""),
LO("L111","Specially Adapted Housing (SAH/SHA) grant with a VA loan","Military & veteran","Combining an SAH/SHA/TRA grant with a VA purchase or construction loan.","Grant approval, amount, and how it's applied.",
`I have been approved for a {{DETAIL}} (Specially Adapted Housing / Special Home Adaptation) grant of $\{{AMOUNT}} (VA approval dated {{EVENT_DATE}}, enclosed) to {{CREDITOR}} (e.g., 'construct a wheelchair-accessible home' / 'adapt the home I am purchasing'). The grant funds will be disbursed by the VA directly to the contractor/escrow and are not a loan.`,["VA grant approval","Contractor bids / plans"],""),
LO("L112","VA caregiver stipend / aid and attendance as income","Military & veteran","Program of Comprehensive Assistance for Family Caregivers stipend or A&A benefit.","Award, amount, continuance.",
`I receive a monthly stipend of $\{{AMOUNT}} from the VA Program of Comprehensive Assistance for Family Caregivers as the primary caregiver for {{DETAIL}}, effective {{EVENT_DATE}} (approval letter enclosed). The stipend is non-taxable and has continued without interruption; bank statements are enclosed.`,["PCAFC approval letter","Bank statements"],""),
LO("L113","Manufactured home purchase with a VA loan","Military & veteran","VA-financed manufactured home — must be on a permanent foundation, titled as real property, meet HUD code.","Foundation, title elimination, MPRs.",
`I am purchasing a manufactured home at {{DETAIL}} with my VA entitlement. The home was built in {{EVENT_DATE}} (HUD certification label ____), is permanently affixed to a foundation that meets HUD standards (engineer's certification enclosed), and the title has been (or will be at closing) converted to real property (enclosed). The land is included in the purchase.`,["HUD 7584 foundation certification","Title elimination / affidavit of affixture","HUD data plate"],""),
);
LOE_CATS.length=0; [...new Set(LOE_LETTERS.map(l=>l.cat))].forEach(c=>LOE_CATS.push(c));
/* ---- Additional LOE scenarios (L114+) ---- */
LOE_LETTERS.push(
LO("L114","Occupancy — buying while renting elsewhere / lease not ended","Property & occupancy","Current lease runs past closing; underwriter must see the plan to occupy within 60 days.","Lease end date, early-termination plan, occupancy date.",
`My current lease at {{DETAIL}} ends on {{EVENT_DATE}}. (I have given notice and will pay an early-termination fee of $\{{AMOUNT}} / my landlord has agreed to release me on ____ — letter enclosed.) I will move into the new property within 60 days of closing and it will be my primary residence.`,["Lease","Landlord release / notice"],""),
LO("L115","Private sale / no real estate agent (FSBO)","Property & occupancy","Buying directly from a seller without agents — underwriter checks for undisclosed relationships or concessions.","No relationship, no side agreements, price basis.",
`I am purchasing {{DETAIL}} directly from the seller, {{CREDITOR}}, without real estate agents. I found the property through ____. I have no family, business or employment relationship with the seller. The price of $\{{AMOUNT}} was agreed based on ____ (comparable listings / an independent appraisal). There are no side agreements or undisclosed credits.`,["Purchase contract","Comparable sales"],""),
LO("L116","Credit report shows employer not on application","Identity & misc","An employer on the credit report differs from the application (old job, side job, or creditor error).","Clarify the timeline.",
`My credit report lists {{CREDITOR}} as an employer. {{DETAIL}} (This was my employer from ____ to {{EVENT_DATE}} / this is a side business I closed in ____ / I have never worked for this company and have asked the bureau to correct it.) My current employer is ____ as stated on my application.`,[],""),
LO("L117","Declining bank balance / recent withdrawals","Assets","Statements show large withdrawals or a falling balance before closing.","Where the money went; funds remaining are sufficient.",
`The withdrawals from my account ending {{ACCT}} between {{EVENT_DATE}} and ____ totaling $\{{AMOUNT}} were for {{DETAIL}} (e.g., earnest money, moving deposits, a vehicle purchase, tuition). The remaining balance of $____ is sufficient for closing and reserves, as shown on the enclosed statement.`,["Statements","Receipts for large items"],""),
LO("L118","Non-occupant co-borrower","Credit","A parent or relative co-signs without living in the home (FHA/Conv allow; VA does not count non-spouse income).","Relationship, why needed, that they won't occupy.",
`{{DETAIL}} (name/relationship) is a non-occupant co-borrower on my loan to help me qualify. They will not occupy the property. I will occupy it as my primary residence and will make the payments from my own income; the co-borrower understands their joint liability.`,["Co-borrower's income/credit docs"],"VA: a non-veteran, non-spouse co-borrower makes it a joint loan — VA guarantees only the veteran's share (12.5% down on the other half). Use FHA/Conv instead."),
LO("L119","Pending litigation / lawsuit party","Identity & misc","Borrower is a party to a lawsuit (or was sued) — potential liability must be explained.","Nature, status, exposure, insurance coverage.",
`I am a party to {{DETAIL}} (describe the matter), filed {{EVENT_DATE}}, in ____ court. (I am the plaintiff and have no financial exposure / my exposure is covered by insurance / the matter was settled on ____ for $\{{AMOUNT}} — enclosed.) It will not affect my ability to repay this loan.`,["Attorney letter","Settlement / dismissal"],""),
LO("L120","Prior rental late / eviction filing","Credit","Landlord reported lates or an eviction was filed (even if dismissed).","Cause, outcome, current rent history.",
`The {{DETAIL}} (late rent payments / eviction filing) in {{EVENT_DATE}} at ____ occurred because {{CREDITOR}}. (The case was dismissed on ____ / I paid the balance in full on ____ — enclosed.) My rent for the last 12 months has been paid on time, as shown by the enclosed landlord verification and bank statements.`,["VOR","12 months cancelled checks","Dismissal / paid letter"],""),
LO("L121","Hobby income / cash side gigs not used to qualify","Income & employment","Deposits from a hobby or side gig that you don't want counted (so the underwriter doesn't require 2 years of history).","Clarify they're not qualifying income.",
`The deposits of approximately $\{{AMOUNT}} per month into my account ending {{ACCT}} are from {{DETAIL}} (e.g., weekend photography / selling items online). I am not using this income to qualify and understand it will not be counted.`,[],""),
LO("L122","Vehicle or debt paid by employer / business","Assets","A debt on your credit report is paid by your employer or business (needs 12 months of proof to exclude).","Who pays; 12 months of payments from that account.",
`The {{CREDITOR}} account (ending {{ACCT}}, payment $\{{AMOUNT}}) is paid by my {{DETAIL}} (employer / business, ____). The enclosed 12 months of business/employer statements show each payment made from that account. I request that this payment be excluded from my debt-to-income ratio.`,["12 months of statements from the paying entity","Employer letter"],""),
LO("L123","Bankruptcy of a business (not personal)","Credit","A business you owned filed bankruptcy; personal credit unaffected or partially affected.","Separate the entity; personal guarantees.",
`My former business, {{DETAIL}}, filed Chapter ____ bankruptcy on {{EVENT_DATE}}. I did not file personal bankruptcy. (The only personally guaranteed obligation was {{CREDITOR}}, which was resolved on ____ / I had no personal guarantees.) My personal credit has been current throughout.`,["Business BK filing","Discharge / resolution of guaranteed debts"],""),
LO("L124","Address on ID differs from current residence","Identity & misc","Driver's license shows an old address.","Timeline and current address proof.",
`My driver's license shows {{DETAIL}} because I moved on {{EVENT_DATE}} and have not yet updated it. My current residence is {{ADDR}}, {{CITY}}, as shown by the enclosed utility bill/lease. I will update my license (before/after) closing.`,["Utility bill or lease"],""),
LO("L125","Income from multiple states / remote work tax","Income & employment","W-2s from several states or remote work for an out-of-state employer.","Consistency of employment; where you'll live.",
`My {{EVENT_DATE}} W-2s show wages in {{DETAIL}} (states) because {{CREDITOR}} (e.g., 'I relocated mid-year from ____ to ____' / 'my employer is based in ____ and I work remotely from ____'). My employment has been continuous and my income is as stated on the application.`,["W-2s","Employer remote-work letter"],""),
LO("L126","Social Security number issued recently / new immigrant credit","Identity & misc","SSN issued within the last few years (new permanent resident); thin U.S. credit.","Immigration status, work authorization, non-traditional credit.",
`I received my Social Security number on {{EVENT_DATE}} after becoming a {{DETAIL}} (permanent resident / asylee / work-visa holder — status and document enclosed). My U.S. credit history is short for that reason; I have enclosed non-traditional credit references (rent, utilities, insurance) and, where available, my credit report from ____ (country).`,["Green card / EAD / visa","Non-traditional credit references","Foreign credit report"],""),
LO("L127","Earnest money paid by someone else","Assets","EMD came from a relative or friend (treated as a gift) or a business account.","Gift letter or business ownership.",
`The earnest money deposit of $\{{AMOUNT}} on {{EVENT_DATE}} was paid by {{DETAIL}} (name/relationship) on my behalf. (It is a gift — gift letter enclosed / I reimbursed them on ____ from my account ending {{ACCT}} — statements enclosed.)`,["Gift letter or reimbursement proof","Escrow receipt"],""),
LO("L128","Change in marital status after application","Identity & misc","Married or divorced during the process; title/community property implications.","What changed and how title will vest.",
`On {{EVENT_DATE}} I {{DETAIL}} (married ____ / finalized my divorce). (My spouse will/will not be on title; in our community-property state their debts are disclosed as follows: ____.) My income and the terms of my application are otherwise unchanged.`,["Marriage certificate / decree"],""),
LO("L129","Property purchased at auction / cash then delayed financing","Assets","Bought with cash and now financing within 6 months (delayed financing) or an auction purchase.","Source of the cash; no liens; delayed-financing rules.",
`I purchased {{DETAIL}} on {{EVENT_DATE}} for $\{{AMOUNT}} with cash from ____ (source documented in the enclosed statements). No financing was used and there are no liens. I am applying for delayed financing to recoup the funds for ____.`,["Settlement statement","Source-of-funds statements","Title report"],""),
LO("L130","Reserve/Guard member — concurrent civilian & military income","Military & veteran","Both W-2s present; underwriter must see they don't overlap problematically and drill pay is ongoing.","Schedules, history, continuance.",
`I work full-time for {{CREDITOR}} and serve in the {{DETAIL}} (Guard/Reserve) one weekend per month plus annual training. My military W-2s for the past two years are enclosed (average $\{{AMOUNT}} per year). My employer accommodates my service under USERRA (letter enclosed). Both sources are ongoing.`,["2 yrs military W-2s","Employer USERRA letter"],""),
LO("L131","VA loan on a property with an accessory unit / non-conforming use","Military & veteran","VA property eligibility question (ADU, zoning, mixed use).","Residential character; appraiser/zoning support.",
`The property at {{DETAIL}} includes ____ (an accessory dwelling unit / a legal non-conforming use). The property is primarily residential; the enclosed zoning letter confirms the use is legal (or legal non-conforming and rebuildable). I will occupy the main residence; (rental income from the ADU is / is not being used to qualify).`,["Zoning verification letter","Appraisal addendum"],""),
LO("L132","Child support arrears / state collection","Credit","Arrears reported or garnished; must be current on a plan.","Plan and payment history.",
`Child support arrears of $\{{AMOUNT}} arose from {{DETAIL}} (period of unemployment / a modification that was delayed). I am paying the arrears under the enclosed order at $____ per month in addition to current support, and have made ____ consecutive on-time payments (state disbursement records enclosed).`,["Support order","Payment history"],""),
LO("L133","Explanation of credit freeze / inquiry failure","Credit","Credit couldn't be pulled or a bureau returned 'frozen'.","Lift dates for the lender.",
`My credit files are frozen at {{DETAIL}} (bureaus) for identity-theft protection. I lifted the freezes on {{EVENT_DATE}} for {{CREDITOR}} (lender) through ____ so the tri-merge can be pulled. Please let me know if a re-pull is needed before closing so I can extend the lift.`,[],""),
LO("L134","Retirement account withdrawal penalty / hardship","Assets","Early withdrawal from retirement with penalty; underwriter wants net proceeds.","Net amount after tax/penalty; terms.",
`On {{EVENT_DATE}} I withdrew $\{{AMOUNT}} from my {{CREDITOR}} retirement account. After the 10% early-withdrawal penalty and withholding, the net deposit was $____ (statement enclosed). {{DETAIL}} The funds are for my down payment and I have no obligation to repay them.`,["Withdrawal confirmation","Deposit statement"],""),
LO("L135","Gap in rental/housing history (lived abroad, military housing, dorm)","Property & occupancy","No verifiable housing payment history (on-base housing, barracks, overseas).","Where you lived and why there's no payment.",
`From {{EVENT_DATE}} to ____ I lived in {{DETAIL}} (government quarters at ____ / barracks / university housing / abroad in ____) and did not pay rent or a mortgage. (My BAH was forfeited for on-base housing — LES enclosed.) I therefore have no housing payment history for that period.`,["LES / housing office letter","University housing records"],""),
LO("L136","Seller is a relative — gift of equity (VA/FHA/Conv variants)","Property & occupancy","Buying a relative's home below value.","Relationship, value support, gift-of-equity letter, no cash back.",
`I am purchasing {{DETAIL}} from {{CREDITOR}} (relationship). The appraised value is $____ and the price is $\{{AMOUNT}}; the difference is a gift of equity (letter enclosed). No funds are being returned to me outside of closing. I will occupy the home as my primary residence.`,["Gift-of-equity letter","Appraisal"],""),
LO("L137","Loan application discrepancy (typo / changed figure)","Identity & misc","A number on the 1003 changed (income, assets, debts) between application and verification.","Explain the correction.",
`The {{DETAIL}} (e.g., 'annual income' / 'balance of account ending {{ACCT}}') on my initial application was stated as $____ and has been corrected to $\{{AMOUNT}} because {{CREDITOR}} (e.g., 'I included a bonus that is not guaranteed' / 'a typo'). The corrected figure is documented in the enclosed ____.`,[],""),
LO("L138","Why I'm refinancing (rate-and-term / term change / IRRRL)","Identity & misc","Underwriter or NTB form asks the purpose.","Benefit, term, costs vs savings.",
`I am refinancing my loan with {{CREDITOR}} to {{DETAIL}} (reduce my rate from ____% to ____% / change from an ARM to a fixed rate / shorten the term to 15 years / remove a co-borrower). My payment will change from $____ to $\{{AMOUNT}}, and the closing costs of $____ are recouped in ____ months.`,["Current note/statement","Loan comparison"],""),
);
LOE_CATS.length=0; [...new Set(LOE_LETTERS.map(l=>l.cat))].forEach(c=>LOE_CATS.push(c));
