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
| **Your data stays yours** | Export every contact to CSV at any time. |

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
  campaigns.js    Audience builder, triggers, enrollment, attribution
  reports.js      Monthly Intelligence Report
  automation.js   Event wiring + background scheduler
  csv.js, util.js, auth.js, events.js, seed.js
public/           Single-page web app (no build step)
test/             End-to-end API tests (npm test)
```

## Tests

```bash
npm test
```

The tests cover setup and auth, normalization and dedupe, CSV import, STOP handling, warm handoff with fact learning, the draft → approval → outbox → send path, landing-page capture with the honeypot, campaign targeting and open/click tracking (including the open-redirect guard), signed unsubscribe links, role-based visibility, round-robin routing, funded → past-client conversion, reports, and export.
