# Pabbly Connect — the workflows for Steven's operation (2026-10-20, five added 2026-10-22)

Steven: *"connect to Pabbly Connect MCP to enable automations of workflows of items within my dashboard"* and
*"Add workflows and automation connect to Pabbly as well."*

Two facts shape everything here. **(1)** Pabbly Connect workflows ("when X happens in app A, do Y in app B") are
built in Pabbly's own editor at connect.pabbly.com; the Pabbly tool Claude holds is the *Integration Builder*,
which only creates a **custom app** (triggers + actions for a vendor Pabbly does not already support). **(2)** The
Command Deck's own database is not reachable by Pabbly (it has no public API), so Pabbly reaches the deck through
the systems the deck already syncs from: **Lofty** (`lofty-crm-sync`), **Zoho** (Composio), **Google Calendar**
(`calendar-daily-sync`), **Notion** (`health-notion-sync`), **Gmail** (`r12-inbox-triage`).

The one-owner rule from R9 (2026-09-28) stands: a system already owned by Composio or CLI-Anything does not get a
second path. Pabbly's job is the **glue between vendor apps** — the hand-offs no owner covers today.

## A. What Claude is building with the Integration Builder: a custom **Kapso WhatsApp** app

Pabbly has no Kapso app. Kapso is a documented REST API (`https://api.kapso.ai/platform/v1`, header `X-API-Key`),
the same one `integrations/kapso/kapso-fetch.py` and `kapso-send.py` use. Proposed plan (Steven says yes before
anything is built; the builder refuses otherwise):

| Kind | Name | What it does | HALT note |
|---|---|---|---|
| Trigger | **New Inbound WhatsApp Message** | Polls `/whatsapp/messages?direction=inbound`; fires once per new message with sender (masked in logs), text, time, conversation id | Phase 1: only messages from Steven's own number are acted on downstream — put a Pabbly filter on the sender |
| Trigger | **New Conversation** | Polls `/whatsapp/conversations?status=active` | — |
| Action | **Send WhatsApp Message** | `POST /meta/whatsapp/<version>/<phone_number_id>/messages` with the text | **Client-facing send.** Steven decides whether this action exists at all; until Phase 2 (business number, opt-in, Alexandra's template review) it is wired only to his own number |
| Action | **List Phone Numbers** | `/whatsapp/phone_numbers` (dropdown source for the send action) | — |

**Build status (2026-10-22):** Steven connected his key; login proven (HTTP 200). Built and tested: the phone-number
dropdown source and **List Phone Numbers** (grade L3, publishable). Still to build: **Send WhatsApp Message** (its test
really sends, so it needs Steven's own mobile as the test recipient — he types it in Pabbly), and the two triggers as
instant webhooks (Kapso has a webhook API: `POST /platform/v1/whatsapp/phone_numbers/{id}/webhooks`, events
`whatsapp.message.received` and `whatsapp.conversation.created`) — pending confirmation of Kapso's delete-webhook path,
which the builder requires alongside each trigger. Then a person reviews and publishes the app in Pabbly.

Auth: API key in a header (`X-API-Key`). The key is entered by Steven on Pabbly's own secure page (the builder's
`request_connection_link`), never in chat. It is the same key the Mac Keychain item `kapso` holds.

## B. Workflows to build in Pabbly's editor (built-in apps, no custom app needed)

Each one is a Pabbly workflow Steven creates by clicking; nothing runs until he turns it on. Order = value.

| # | When (trigger app) | Then (action app) | Why it is worth it | Owner check |
|---|---|---|---|---|
| 1 | **Lofty** — new lead | **Gmail** draft to Steven + **Google Calendar** task "Call <first name> — 5-minute SLA" | Speed-to-lead without the Mac being awake; the deck's `leadResponse` watchdog still measures it | Lofty stays owned by CLI-Anything; this only reads the event |
| 2 | **Zoho CRM** — deal stage changed | **Notion** page in the pipeline database + **Slack** DM | Mortgage milestones land where the deck and the ISA read them | Zoho stays owned by Composio |
| 3 | **Google Calendar** — event starts in 60 min | **Kapso** (custom app) → WhatsApp to Steven's number: "Appointment prep ready" | The `r13-appointment-prep` Mac task does the brief; this is the nudge when the Mac is off | Steven's own number only |
| 4 | **Gmail** — label "Action" added | **Notion** task + **Slack** message | Inbox triage hand-off the twin can see | drafts only, never sends |
| 5 | **Kapso** (custom app) — new inbound message from Steven | **Notion** note in the Vanessa inbox database | A WhatsApp note to Vanessa becomes a record even when the Mac task is down | filter: sender = Steven |
| 6 | **Strava** — new activity | **Notion** Health Log row | Keeps the Health tiles alive through the same Notion path the phone recipe uses | — |
| 7 | **Lofty** — lead stage changed to Closed (or **Zoho CRM** deal Funded) | **Gmail** drafts on day 1 (thank-you), day 10 (review request: Google + Zillow links) and day 30 (check-in), via Pabbly's Delay step; **Google Calendar** task for the ISA each day | Post-close care and review requests without anyone remembering (gap audit 2026-10-22: nothing owned it) | drafts only — the ISA sends after Steven approves the three templates once; Alexandra reviews the review-request wording (no incentive for a review) |
| 8 | **Google Sheets / Lofty** — daily scheduler 7:00 AM PT, match today's birthdays and home-purchase anniversaries | **Gmail** draft per match + **Slack** list to the ISA | Sphere touches on the dates people remember | drafts only; first names in the Slack list |
| 9 | **Google Forms / Lofty** — open-house sign-in | **Lofty** lead (source "Open house <address>") + **Gmail** follow-up draft 24 h later + ISA call task | Open-house leads in the CRM the same day | drafts only; the ISA calls |
| 10 | **Gmail** — voicemail-notification email (Google Voice / carrier) | **Notion** Vanessa inbox note with the voicemail text + **Slack** DM to the ISA | Voicemail becomes a lead-triage item even when the Mac is off | no callbacks or texts by automation |
| 11 | **Kapso** (custom app) — New Inbound WhatsApp Message from a number other than Steven's | **Slack** DM to Steven + **Notion** note | Phase 2 readiness: someone new messaged the business number; Steven decides | no auto-reply to anyone but Steven |

All eleven workflows run on Pabbly, not on Claude's weekly allowance — that is the point (2026-10-22: every failed cloud routine failed on the usage limit).

Held on purpose (HALT): anything that sends to a client (Lofty texts, Zoho emails), anything that spends
(Pabbly task limits, paid apps), and SkySlope/zipForms (locked until compliance signs off).

## C. Steven's clicks (each workflow takes about 5 minutes)

1. Open https://connect.pabbly.com → **Workflows → Create Workflow**, name it as in the table.
2. **Trigger**: choose the app and event in the first column (Lofty, Zoho CRM, Google Calendar, Gmail, Strava are
   built-in). Click **Connect**, sign in to that app in the window Pabbly opens. Click **Save & Send Test Request**
   and do the thing once (create a test lead, move a deal) so Pabbly captures the fields.
3. **Action**: choose the app in the second column, pick the event, Connect, map the fields from the trigger
   (Pabbly shows them as chips), **Save & Send Test Request**.
4. For row 3 and 5 the Kapso app appears under **your private apps** once Claude's build is tested; choose it like
   any other app and paste your Kapso key on Pabbly's connection page (the same key as the Mac Keychain item).
5. Turn the workflow **ON**. Tell Claude "Pabbly workflow N on" and it adds the row to `integrations/CONNECTIONS.md`
   and the toolkit register.

## D. What stays outside Pabbly, and why

- The Command Deck database (no public API) and the cloud routines (no public fire endpoint) — Claude and the Mac
  runner write those; Pabbly reaches them through Lofty, Zoho, Notion, Calendar and Gmail.
- Vanessa's reasoning: Pabbly moves data between apps; it does not answer as Vanessa. A WhatsApp reply in her voice
  stays with the Mac task `vanessa-whatsapp-inbox` and any Claude Code session with the `kapso` MCP.
