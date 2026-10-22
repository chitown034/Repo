# Loan task agents

Written 2026-10-11. Three agent skills that prepare loan and real-estate work for Steven. They prepare; he decides.

## Tax assessor agent
Reads public San Diego and Riverside County records (assessor, recorder, treasurer-tax collector) with the read-only
browser tools and produces a one-page Property Tax Sheet: APN, assessed values, exemptions flag, special assessments
flag, an estimated annual tax with its formula, and a source line with the date retrieved. County URLs and field names are
marked verify except the well-known official domains, which are also marked verify-current. Exemptions such as disabled
veteran are flagged "verify eligibility with county; Steven decides". Tax advice goes to a CPA (Marcus frames it).

## Loan pricing prep agent
Builds the scenario worksheet from facts Steven supplies, computes P&I, PITI, LTV and DTI with shown formulas
(`scripts/amortize.py`, tested), and compares scenarios. Flags items for Lucia (eligibility), Walter (TRID timing)
and Alexandra (compliance). Rate and points are always "enter from lender sheet"; funding-fee and MI percents are inputs.

## The rules
- Never quote a rate, state eligibility as a decision, lock, or send. Those are Steven's (CLAUDE.md HALT).
- Public records only; no logins, orders or payments; client names never typed into a county search.
- Tax figures are estimates, not quotes.
- Reverse engineering (REA) is gated: allowed only for owned or licensed software and public behaviour; Elena and Alexandra join; nothing installs without Steven.

## See also
- `.claude/skills/tax-assessor-agent/SKILL.md`
- `.claude/skills/loan-pricing-agent/SKILL.md`
- `.claude/skills/reverse-engineering/SKILL.md`
- `integrations/loan-stack/CONNECTIONS.md` and `integrations/loan-stack/README.md`
- `wiki/mortgage-programs/va-eligibility.md`, `va-affordability.md`, `disclosure-timing.md`
