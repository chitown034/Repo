# MBS Highway — Home Report (as of 2026-10-23)

**What it is:** an automated monthly past-client report (equity growth, estimated value, regional appreciation) with a
live landing page per homeowner; clients get two e-mails a month, the LO gets engagement notifications. Also "Bid Over
Asking" one-off reports. $169.95/month, up to 1,000 clients; co-branding an agent costs $20/yr (RESPA).

**Route:** **no public API, Zapier, Pabbly, Composio or MCP.** Documented integrations: Shape CRM (a webhook URL from
your MBS Highway account rep) and Surefire. Enrolment is Clients → Client Manager → Add Client (e-mail is enough) or a
CSV of up to 500; a personal invite link/QR exists.

**Practical plan:** (1) Steven asks his MBS Highway rep for the Home Report inbound webhook or CSV-import path and
whether a generic CRM endpoint exists; (2) the team parses the "Home Report activity" notification e-mails in Gmail
into the sphere touches (read-only); (3) a read-only browser read of Client Manager (agent-browser) for the client list
and report links. The team never creates a client-facing send; a Home Report enrolment is Steven's click.

**Steven, once:** sign in, confirm the plan, e-mail the rep (draft in the Vanessa queue when he says "draft the MBS
Highway rep email"), and export the past-client CSV from Lofty/Zoho for the bulk enrolment.
