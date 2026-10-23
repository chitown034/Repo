# Arive (mortgage LOS/POS) — pipeline status into the brain (as of 2026-10-23)

**Route:** Arive's REST API gateway (release v4.6): `POST /api/auth/access-token` with Client ID + Secret Key + API
Key, then `GET /api/loans` (list, search, status), loan by number, leads. Also a **private Zapier app** (invite link
from Arive support) with triggers New Loan, Loan Status Updated, Loan Tracker Updated (appraisal/title/HOI), Key Dates
Updated, New Lead, POS Application Submitted; actions Get Loan List / Details, Create/Update Loan or Lead. Needs the
Pro / Broker Pro plan. No Pabbly, Composio or MCP app exists; rate limits unpublished. Developer portal reportedly
developer.arive.com (unverified).

**Read-only safe:** loan list, loan details, status triggers. **HALT:** any loan write (LOS of record, client PII).

**Steven, once:** Arive → Company Settings (admin) or User Settings → Integrations → Generate → Client ID, Secret Key,
API Key (user-level credentials see only loans where he is Primary LO). Ask Arive support for the Zapier invite link and
the developer docs. Keep the three values in `~/.config/arive/.env` on the Mac (`open -e`, chmod 600) — never in chat.

**Plan:** Arive status → Zapier (or a Pabbly custom app built with the Integration Builder once docs are in hand) →
Zoho stage change → the Zoho workflow sends the approved template (`wiki/real-estate-playbooks/drip-and-text-follow-up.md`).
A connect-all step is added the day the credentials and the token endpoint are confirmed.
