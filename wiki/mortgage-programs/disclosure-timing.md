# Disclosure timing — TRID, RESPA, Reg Z

The TRID/RESPA/Reg Z timing gates that govern every mortgage file, plus the parallel California real-estate disclosure clock. Alexandra's (CCO) lane — cite the section, don't guess it.

## The TRID clock (Reg Z §1026.19)

The **6-piece application trigger** — name, income, Social Security number, property address, estimated property value, and loan amount — starts the Loan Estimate clock the moment all six are collected. From there:

- **Loan Estimate (LE)**: must be delivered within **3 business days** of the 6-piece trigger (the desk's own target is same-day/within 24 hours, which is faster than the regulatory floor).
- **Closing Disclosure (CD)**: must be received at least **3 business days before consummation**. E-delivery without confirmed receipt adds **3 calendar days** to that count.
- **Changed circumstance**: any material change (loan amount, program, rate lock) triggers a re-disclosure — track it the same way as the original LE.

## Tolerance buckets

- **Zero-tolerance**: lender fees — 0% increase is permitted; any increase requires a lender credit to cure.
- **10% cumulative**: a basket of third-party fees the borrower cannot shop for.
- **Unlimited / good-faith**: prepaid interest, escrow deposits, and fees for services the borrower shopped for themselves.

## Reg Z LO compensation and anti-steering

- **No double-dipping**: an LO is paid **lender-paid OR borrower-paid, never both** on the same transaction, and compensation cannot vary by the loan's terms.
- **Anti-steering safe harbor**: present **3 distinct options** on every loan-level-priced-comp (LPC) transaction — lowest rate, lowest fees, and safest features (e.g. no negative amortization) — and document that presentation. This is also the anti-steering documentation requirement referenced in the pricing-comparison step of the loan flow.

## RESPA and ECOA

- **RESPA §8**: no fee or gift may be tied to a referral — anti-kickback and unearned-fee prohibitions carry criminal penalties. This is the rule that gates every affiliate/sponsorship and realtor-reciprocity arrangement (see `wiki/real-estate-playbooks/referral-reciprocity.md`) before money changes hands.
- **ECOA / Reg B**: an adverse-action notice is due within **30 days**, with specific reasons stated — an AUS output alone is not sufficient justification for a denial.

## California real-estate disclosures (the parallel clock)

Once a purchase contract is accepted, the California-side clock runs independently of TRID: **TDS/SPQ/NHD** (and related disclosures — Lead Paint, HOA docs, AVID, SBSA) are due within **7 days** of acceptance. See `wiki/real-estate-playbooks/transaction-stages.md` for how this clock nests inside the full six-phase closing checklist, including the earnest-money deposit deadline that sits even earlier in the sequence.

## VA-specific timing

**Tidewater**: on a low VA appraisal, the response window is **2 business days** from the Notice of Value concern, with 3+ comps ready to submit — see `wiki/mortgage-programs/va-eligibility.md`.

## See also

- `wiki/mortgage-programs/program-selection.md` — where this clock sits inside the loan flow.
- `wiki/real-estate-playbooks/transaction-stages.md` — the CA-side disclosure and closing deadlines this clock runs alongside.

Source: Command Deck, "Compliance quick-reference" card (The Ultimate Mortgage Broker SOP) and the VA scenario checklists (VA Loan Mastery Playbook, pp. 271–280).
