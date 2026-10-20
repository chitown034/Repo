# Loan stack — how the new agents fit the org chart (written 2026-10-11)

Three additions, all reached through Vanessa's dispatch and none changing a live agent prompt:

| Piece | Where | Lead | Joins |
|---|---|---|---|
| Property tax & assessor lookup | `.claude/skills/tax-assessor-agent/` | Integration Engineer (browser hands) with Harrison as requester | Alexandra (compliance gate), Elena (browser/terms), Marcus (tax-advice referral wording) |
| Loan scenario & pricing prep | `.claude/skills/loan-pricing-agent/` | Harrison | Lucia (eligibility), Walter (TRID timing), Alexandra, Denise (processing view), Howard (underwriting view) |
| Reverse-engineering (gated) | `.claude/skills/reverse-engineering/` | Derek / Elon | Elena and Alexandra on every use |

Carmen (transaction coordinator) receives the finished worksheet and tax sheet for the file. Derek owns the integration plumbing;
see `CONNECTIONS.md` for what is connected and what Steven must do.

## Flow
```
Steven (asks)  ->  Vanessa (dispatch)
   |-> Integration Engineer: tax-assessor-agent -> Property Tax Sheet (public records, read-only)
   |         |  estimated annual tax (labelled estimate)
   |         v
   |-> Harrison: loan-pricing-agent <- Steven's facts + rate/points from lender sheet
   |         |-> Lucia (eligibility flags)  -> Walter (TRID clocks) -> Alexandra (compliance)
   |         |-> Denise / Howard (processing and underwriting view)
   |         v
   |   Worksheet + comparison  ->  Carmen (file)  ->  Vanessa consolidates
   v
Steven decides: quote, eligibility, lock, send to client
```
Gates run in the order Alexandra, ECC review of any change, Vanessa last (`wiki/ai-team/org-chart.md`).

## Rules
Prep only; licensed acts stay Steven's. Public records only for county data. Rate and points come from the lender sheet.
CLAUDE.md HALT list applies unchanged. Brain page: `wiki/mortgage-programs/loan-task-agents.md`.
