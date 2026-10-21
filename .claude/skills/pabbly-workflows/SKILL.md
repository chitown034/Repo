---
name: pabbly-workflows
description: "Build and run Pabbly Connect automations for Steven's operation: the six built-in-app workflows (Lofty, Zoho, Gmail, Google Calendar, Notion, Slack, Strava) he clicks together in Pabbly's editor, and the custom Kapso WhatsApp app built through the Pabbly Integration Builder MCP (plan → his yes → record_plan → auth on Pabbly's secure page → build → test). Use when Steven asks for a Pabbly workflow, an automation between two apps, or to continue the Kapso app build."
---
# Pabbly workflows

The map and the six workflows live in `integrations/pabbly/WORKFLOWS.md`; read it first (`bin/brain recall "pabbly workflows"`).

## Two kinds of work, two tools
1. **Workflows in Pabbly's editor** (connect.pabbly.com → Workflows): "when X in app A, do Y in app B". Pabbly has
   built-in apps for Lofty, Zoho CRM, Gmail, Google Calendar, Notion, Slack, Strava. Claude cannot click these for
   Steven; it gives the exact trigger, action and field mapping, he builds it in about five minutes, then says
   "Pabbly workflow N on" and Claude records it in `integrations/CONNECTIONS.md` and the toolkit register.
2. **A custom app through the Integration Builder MCP** (tools `mcp__Pabbly_Connect_Integration_Builder__*`), only
   for a vendor Pabbly lacks. Today: **Kapso WhatsApp** (app id in `integrations/CONNECTIONS.md` § Pabbly; shell and
   API-key auth done 2026-10-20). Builder order, enforced by its gate: `start_here` → `get_app` → `get_guidance`
   for the stage → write. The plan must be agreed in chat and recorded with Steven's own words (`record_plan`);
   secrets only through `request_connection_link`; prove the login before endpoints; every id field is a tested
   dropdown, never an invented sample; follow a refusal's fix, never work around it; report the verdict honestly.

## Rules (CLAUDE.md HALT list applies)
- The Command Deck database is not reachable by Pabbly (no public API); reach the deck through Lofty, Zoho, Notion,
  Calendar and Gmail, which the deck already syncs from. One owner per system (R9): Pabbly never becomes a second
  path to Zoho (Composio) or Lofty (CLI-Anything); it is the glue between apps.
- Anything that sends to a client, spends money, or needs a new credential is a Needs-Steven packet, not a build.
  Kapso Phase 1: Steven's own number only; a "Send WhatsApp Message" action exists only if he says so.
- Never paste an API key in chat, a tool argument, the repo, the deck or a routine prompt.

## Kapso app plan (waiting on "yes, build the Kapso app")
Triggers: **New Inbound WhatsApp Message**, **New Conversation**. Actions: **Send WhatsApp Message**, **List Phone
Numbers** (dropdown source). Endpoints are the ones `integrations/kapso/kapso-fetch.py` and `kapso-send.py` already
use (`/platform/v1/whatsapp/…`, `X-API-Key`). After his yes: `record_plan` quoting him, `request_connection_link`
for the key, `propose_inbuilt_action` type auth (`/whatsapp/phone_numbers`), `prove_auth`, then actions before
triggers, each tested by the builder.
