# Mortgage Lead CRM

An AI-assisted CRM for loan officers and mortgage teams. It takes the database you already have (past clients, sphere, purchased leads, old form fills), cleans it up, scores every contact on how likely they are to need a mortgage *now*, hands you a ranked call list each morning, and follows up automatically on the guardrails you set.

## What it does

| Capability | How it works here |
|---|---|
| **One CRM built for the loan cycle** | Contacts carry their full history (texts, emails, calls, notes, stage moves, score changes) on one timeline. The drag-and-drop pipeline runs New Lead → Contacted → Nurture → Pre-Qualified → Application → Processing → Underwriting → Clear to Close → Funded / Lost. |
| **Ready Score (0-100)** | Every contact is scored, and each point comes with a plain-English reason. Refinance signals: how far the rate is above market, equity and LTV, FHA loans that can drop MIP, loan age and anniversaries. Purchase signals: timeline, pre-approval, credit, VA eligibility. Engagement signals: recent replies, opens, clicks, form fills. Scores refresh nightly, when contacts engage, and right away when you change the market rate. |
| **Daily call list** | Your top contacts by Ready Score, with the reason to call each one. Past clients with refi opportunities are included. Anyone you already reached today is left off. |
| **Automated stage transitions** | A reply or a connected call moves New/Nurture → Contacted. "Not interested" moves to Nurture. Funded turns a lead into a past client and starts tracking their loan for future refinance opportunities. |
| **Import from anywhere** | CSV from Google Contacts, Outlook, your LOS, or another CRM. Columns are mapped automatically. Phones and emails are normalized, names are re-cased, and rates entered as 0.0675 are fixed. Duplicates (same email or phone) are merged by filling blanks only, so existing data is never overwritten. |
| **Team tools** | Owner, admin, and member roles; members see only their own contacts. New leads are routed round-robin, weighted, or all to the owner. |
| **Calling & texting** | Two-way SMS and click-to-call through Twilio from your business number. Calls and texts share one thread per contact. Inbound texts arrive by webhook. |
| **AI follow-up assistant** (default name "Ava") | Scans the database for brand-new leads nobody has contacted (speed to lead), scores that jumped 10+ points, and contacts who have gone quiet. It writes a personalized text or email for each. Replies are read to pick up names, timelines, and life events. Warm replies are handed off: the assistant creates an urgent task, emails the owner (when SMTP is set up), and steps aside. **STOP is honored immediately with no override.** Choose *Off*, *Approve first*, or *Autonomous*. Any manual message counts as a human takeover and pauses the assistant for that contact. |
| **Smart campaigns** | Email and SMS from one builder, with merge fields and AI-drafted copy. Audience filters: stage, lead type, loan type, score, tags, rate gap, days since last touch. Triggers: manual, new lead, stage entered, score crosses a threshold, reply, rate drop, gone quiet, loan anniversary, landing-page form. Tracks opens, clicks, replies, and conversions (an application within 30 days counts as a conversion). |
| **Landing pages** | Branded lead-capture pages at `/p/your-slug`, with TCPA consent text, NMLS footer, a honeypot, and rate limiting. Each submission becomes a scored, routed contact and gets an immediate first-touch draft. |
| **Monthly Intelligence Report** | Built automatically on the 1st of each month: who moved up, who went quiet, pipeline flow, funded volume, campaign results, lead sources, and who to focus on next. Includes an AI-written briefing when Claude is configured. |
| **Voicemail drops** | Save pre-recorded voicemails (an audio file, or a script read aloud with merge fields). Drop one from a contact's Call tab or to many contacts at once. Twilio's answering-machine detection waits for the beep and leaves your message. If a person answers instead, they're connected straight to the loan officer's phone. Drops are blocked during quiet hours and for opted-out or Do Not Contact contacts. |
| **Direct sync** | **Google Contacts:** connect with Google (read-only) for a daily incremental sync of your phone and Gmail contacts, imported as Sphere. **Follow Up Boss:** paste an API key to import everyone with stages and tags, re-synced daily. **Inbound lead webhook:** `POST /hooks/lead` with an API key accepts leads from Zapier, Make, Zillow, Realtor.com, your website, or any CRM. Field names are matched automatically, and every lead is scored, routed, and gets a speed-to-lead draft. Synced records are matched by the source system's id, then email or phone, so re-syncing never duplicates. |
| **Property enrichment** | Addresses are standardized through the free US Census geocoder, which also adds county and coordinates. With an ATTOM key, each contact also gets an automated home value with its range, beds/baths/sqft/year built, last sale, and the recorded first mortgage (amount, date, lender). Data refreshes every 90 days and again whenever the address changes. Enrichment only fills blanks and never overwrites numbers you entered. Equity in the Ready Score uses the current estimated value. |
| **Your data stays yours** | Export every contact to CSV at any time. |

### Workflows (automation engine)
A visual, multi-step workflow builder covers the work tools like Follow Up Boss Action Plans, kvCORE Smart Campaigns, Lofty, and Jungo drips handle, with mortgage-specific triggers and steps.
- **12 triggers:** new lead (optionally filtered by source), landing-page/webhook lead, stage entered, Ready Score crosses a threshold, reply, tag added, warm handoff, birthday, loan anniversary, gone quiet, market-rate drop, or manual enrollment (single or bulk).
- **19 steps:** send text, send email, AI-personalized message, voicemail drop, enroll in campaign, wait (minutes/hours/days), **if/else branches** (nestable; conditions on score, stage, tags, lead/loan type, source, rate gap, days since contact, replied or contacted since the workflow started, has partner…), end, create task, move stage, add/remove tag, assign (specific person or round-robin), update field, pause/resume the AI, notify the loan officer (email + Slack), **email the referral partner a status update**, and send a webhook.
- **Goals and exits:** stop on reply, stop when a goal stage is reached, and re-enrollment rules. Yearly triggers re-fire every year.
- **Safety on every step:** opt-outs, Do Not Contact, quiet hours, and the compliance footers apply on every step. Workflow AI steps respect human takeover.
- **9 installable recipes:** speed-to-lead blitz, 12-month nurture, rate-drop refinance alert, past-client annual review, application document chase, referral-partner loan updates, post-close review and referral ask, birthday wishes, and warm-handoff escalation.
- **Performance tracking:** each workflow shows enrolled / active / completed / replied / goal-reached counts, and each run has a log you can stop at any time.

### Analytics
- **KPIs and funnel:** new leads, contact and engagement rate, **speed to lead** (median, % under 5 minutes, never contacted), and a nested conversion funnel (Leads → Contacted → Engaged → Pre-qualified → Application → Funded).
- **Revenue and pipeline:** funded volume and **revenue at your basis points**, plus a pipeline forecast weighted by stage close-probability with projected revenue.
- **Trend and mix:** activity trend chart (outbound, replies, new leads) with tooltips and a table view, and an outreach mix breakdown.
- **Lead source ROI:** enter monthly ad and lead spend to get cost per lead, cost per funded loan, revenue, and ROI per source.
- **Team leaderboard:** leads, speed to lead, calls, texts, emails, appointments, tasks, apps, funded, volume, and revenue per person.
- **Program performance:** AI performance (drafted, approval rate, sent, reply rate, handoffs), plus workflow, campaign, and referral-partner performance.
- **Ranges and scoping:** 7/30/90/365-day ranges and a per-loan-officer filter. Members only ever see their own numbers.

### AI agents
- **Ava (follow-up assistant):** speed to lead, re-engagement, reply reading, fact learning, warm handoff (see above).
- **Copilot:** chat with your CRM (🧠 button on every page). It uses 12 tools to search contacts, open records, find opportunities (refinance, equity, hot, dormant, stalled loans, unanswered replies), pull metrics, list and create tasks, add notes, draft messages (always through the approval and compliance path), move stages, add tags, and enroll contacts in workflows. Conversations are saved. Without an API key it still answers the most common questions directly from your data.
- **Coach:** a prioritized "next best actions" list on the Today screen. It covers warm handoffs, unanswered replies, new leads waiting, overdue tasks, stalled loans, AI drafts to approve, hot contacts gone untouched, refinance opportunities, and birthdays/anniversaries. With Claude configured it adds a daily AI briefing (one win, the biggest funnel leak, and the top actions).
- **Content Studio:** AI-written social posts (Facebook, Instagram, LinkedIn, X), newsletters, blog articles, video scripts, and market updates, in your tone, for a chosen audience, with mortgage advertising guardrails. You can edit, save, schedule, and publish. Publishing fires a `content.published` event for Zapier, Make, or Buffer to post to social, and newsletters turn into an email campaign in one click.

### Marketing tools
- **Campaigns:** email and SMS campaigns (above), landing pages with an optional payment calculator (the visitor enters every number, so no triggering terms are advertised), and **QR codes** for open houses and flyers.
- **Referral partners:** track realtors, builders, and advisors. Clients are credited automatically from co-branded landing pages, partners get automatic loan-status emails at every milestone, and each partner has a scorecard (referrals, in process, funded volume).
- **Date triggers:** a birthday field plus birthday and home-anniversary triggers.

### Integrations hub
- **Outbound webhooks:** 9 event types, HMAC-signed (`X-CRM-Signature: sha256=…`), with automatic retries (1m → 10m → 1h → 6h), a delivery log, a test button, and SSRF protection (private/local addresses are blocked).
- **Public REST API (`/v1`):** per-user API keys, role-scoped, rate-limited, revocable. Endpoints for contacts CRUD, notes, stage changes, tasks, workflow enrollment, metrics, and **Zapier-style REST hooks** (`POST/DELETE /v1/hooks`).
- **Slack:** handoffs, new leads, funded loans, replies, and stage changes posted to a channel.
- **Calendar feed:** a private iCal URL for tasks and appointments that you can subscribe to in Google, Outlook, or Apple Calendar.
- **Also connected:** Twilio, SMTP, Claude, Google Contacts, Follow Up Boss, the inbound lead webhook, the Census geocoder, and ATTOM.

### Compliance guardrails built in
- Automated texts **never send during quiet hours** (default 8pm-8am local time). They wait in the queue until morning.
- The first text to each contact includes "Reply STOP to opt out." STOP, UNSUBSCRIBE, CANCEL and similar replies opt the contact out immediately and cancel anything queued. START opts them back in.
- Every email gets your company name, NMLS numbers, address, an Equal Housing Opportunity line, a one-click unsubscribe link, and a `List-Unsubscribe` header.
- The AI is instructed never to quote rates, APRs, payments, or terms (Reg Z triggering terms), never to promise approval, and never to reference protected characteristics.
- Do Not Contact blocks every outbound channel.
- Inbound Twilio webhooks are signature-verified, and the click tracker refuses to redirect to any link that isn't in the campaign.

These guardrails help, but they are not legal advice. Have your compliance team review your scripts, consent language, and texting registration (A2P 10DLC).

## Quick start

Requires **Node.js 22.13+**. The database is the SQLite built into Node, so nothing else needs installing.

```bash
npm install
npm run seed      # optional: ~70 realistic demo contacts, campaigns, and landing pages
npm start         # http://localhost:3000
```

- With the demo seed, sign in as `demo@example.com` / `demo1234` (owner) or `alex@example.com` / `demo1234` (member).
- Without the seed, the first visit asks you to create the owner account.

Until you connect providers, outbound texts and emails are logged on the timeline as **simulated**, so you can try every workflow safely. To test the assistant's reply handling, open a contact and use **Log reply**.

## Connecting providers

Copy `.env.example` to `.env` and fill in what you need. Each provider is optional.

- **Claude (AI assistant):** set `ANTHROPIC_API_KEY`. Messages, reply analysis, campaign copy, and report briefings then come from Claude (`claude-opus-5-5` by default; override with `CLAUDE_MODEL`). Without a key, the assistant falls back to built-in templates and keyword rules.
- **Twilio (texting and click-to-call):** set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Then point the number's *A message comes in* webhook to `https://YOUR_APP_URL/webhooks/twilio/sms`. Click-to-call rings your phone first (add your mobile under Team), then connects you to the contact from the business number.
- **Email:** set any SMTP provider in `SMTP_*`.
- **Google Contacts:** in Google Cloud Console, enable the *People API* and create an OAuth client of type *Web application*. Add `https://YOUR_APP_URL/integrations/google/callback` as an authorized redirect URI. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then click **Connect Google** in Settings.
- **Follow Up Boss:** no server setup needed. Paste your API key (FUB → Admin → API) in Settings.
- **Inbound webhook:** Settings shows your URL and key, plus a **Copy example** button with a ready-to-run `curl`. Send the key in an `X-API-Key` header (or `?key=`). Add `?source=Zillow` to label where leads came from.
- **Property data:** set `ATTOM_API_KEY` for home values and mortgage records. Address standardization works without a key.
- **Voicemail drops:** these use the same Twilio credentials. Add each loan officer's mobile under Team so live answers can be connected. Prerecorded calls to cell phones generally require prior express written consent, so only drop to contacts who gave it.
- **`APP_URL`:** set this to your public URL so tracking links, unsubscribe links, and webhook signatures work.

## Day-to-day

1. **Morning:** open **Today**. Work the ranked call list, clear handoff tasks, and approve the assistant's drafts.
2. **After a call:** click **Log** to record the outcome. "Connected" advances the stage, and you can set a follow-up task in the same step.
3. **When rates move:** update the 30-yr market rate in **Settings**. The whole database is rescored right away, and any active *rate drop* campaign fires for contacts whose rate is now far enough above market.
4. **Month end:** read the **Monthly Intelligence Report** to see who moved and where to focus.

## Project layout

```
src/
  server.js       Express app, public landing pages, tracking, unsubscribe, Twilio webhooks
  api.js          Authenticated JSON API used by the web app
  db.js           SQLite schema, settings, stages
  contacts.js     Create / merge / update contacts, routing, stage changes, activity log
  scoring.js      Ready Score model with explanations
  assistant.js    AI follow-up: scan, drafts, approvals, inbound handling, handoff, takeover
  ai.js           Claude integration (structured outputs) with template fallback
  messaging.js    SMS/email/call providers, opt-outs, quiet-hours outbox
  voicemail.js    Voicemail drop library, answering-machine detection TwiML, outcomes
  integrations.js Google Contacts (OAuth + People API), Follow Up Boss, inbound lead webhook
  enrichment.js   Census address standardization + ATTOM home value / mortgage records
  workflows.js    Workflow engine: triggers, step tree with branches/waits, exits, recipes
  metrics.js      Analytics: funnel, speed to lead, pipeline forecast, ROI, leaderboard
  agents.js       Copilot (Claude tool use), Coach next-best-actions, Content Studio
  hooks.js        Signed outbound webhooks with retries, Slack, SSRF guard
  publicapi.js    /v1 REST API with API keys + REST hooks, iCal calendar feed
  campaigns.js    Audience builder, triggers, enrollment, attribution
  reports.js      Monthly Intelligence Report
  automation.js   Event wiring + background scheduler
  csv.js, util.js, auth.js, events.js, seed.js
public/           Single-page web app (no build step); views-pro.js holds the newer pages
test/             End-to-end API tests (npm test); outside services are mocked
```

## What's simulated or needs your accounts

Every feature works out of the box in simulated mode. These parts need real accounts to reach the outside world: texting, calling, and voicemail (Twilio); email (SMTP); AI writing, Copilot conversations, and the Coach briefing (Anthropic API key); Google Contacts (Google OAuth app); Follow Up Boss (your API key); home values (ATTOM); and posting to social networks (route `content.published` through Zapier, Make, or Buffer; there is no direct Facebook/Instagram posting).

## Tests

```bash
npm test
```

The tests cover setup and auth, normalization and dedupe, CSV import, STOP handling, warm handoff with fact learning, the draft → approval → outbox → send path, landing-page capture with the honeypot, campaign targeting and open/click tracking (including the open-redirect guard), signed unsubscribe links, role-based visibility, round-robin routing, funded → past-client conversion, reports, and export. They also cover the newer features: property enrichment (Census and ATTOM responses, fill-blanks-only, AVM-based equity, re-enrich when the address changes), voicemail drops (library validation, opt-out blocking, the machine vs. person call flows, forged-webhook rejection), the inbound webhook (key check, nested fields, dedupe, key rotation), Google sync (signed OAuth state, token exchange, incremental sync tokens, dedupe), Follow Up Boss import (rejected keys, pagination, stage mapping, re-sync without duplicates), and a check that secrets never reach the browser.

Further tests cover the workflow engine (triggers, waits, if/else branches, no re-entry, exit on reply, goal stages, every recipe valid), partner attribution and automatic partner updates, signed webhook delivery with retries and SSRF blocking, the public API (keys, role scoping, CRUD, REST hooks, revocation), the signed calendar feed, analytics (nested funnel, ROI with spend, member scoping), the Coach and Content Studio (draft, publish, event fan-out, newsletter to campaign), and the Copilot tool-use loop against a stubbed Claude API.
