---
name: whatsapp-kapso
description: Read and answer WhatsApp through Kapso (WhatsApp Business Cloud API; MCP server "kapso" registered for every Claude Code session, Orca included) — Phase 1 is the sandbox number and Steven's own phone only. Use when Steven asks to open Kapso, read or answer his WhatsApp, check the WhatsApp card on the Command Deck, or when a seat is asked to message someone on WhatsApp (it stops at the HALT rules below).
---
# WhatsApp through Kapso

Installed by `bash integrations/kapso/install-mac.sh install --apply` (`go.sh` step 11). Reference:
`integrations/kapso/README.md`. The Kapso plugin's own skills (`integrate-whatsapp`, `automate-whatsapp`,
`observe-whatsapp`) know the tool schemas; this skill is the house rules on top of them.

## Before anything
1. **Is the MCP signed in?** `/mcp` must show `kapso` connected. If not, tell Steven the one step only he can do
   (`claude` → `/mcp` → kapso → sign in) and stop. Never ask for, type or store an API key.
2. **Which phase are we in?** Call the plugin's `status` tool. Sandbox number only = Phase 1. A business number
   connected = Phase 2 (needs the Needs-Steven packet in the README to have been approved).

## Phase 1 — sandbox, Steven only
- Allowed: read the sandbox conversations; reply **to Steven's own number** on the thread he started; open the
  Kapso inbox UI (`kapso_inbox_open`) when asked.
- Vanessa answers as Vanessa: the `vanessa-orchestrator` intake, the AI team, the HALT list, then the reply. Log
  each inbound and outbound item to `agentInbox` with `channel: "whatsapp"` in the same shape the iMessage task
  uses (no phone number in the document).
- Not allowed: any send to a number that is not Steven's; templates; webhooks; setup links; automations.

## Phase 2 — business number (only after Steven approves the packet)
- Every client send is a licensed, client-facing act: **HALT** — draft, show Steven, he sends (or says "send it").
- Marketing templates go through Alexandra (opt-in on file, NMLS 1921615 / DRE identity line, no rate quotes, no
  "guaranteed", Equal Housing). Utility/transactional messages still carry the identity line.
- No client name, address, loan or document enters Kapso without Elena's yes (third-party processor); never paste a
  message body into the deck, a routine prompt or this repo.
- Cost: template messages are billed by Meta per delivery; Kapso Pro is $25/month. Both are HALT (money).

## Command Deck
The card "WhatsApp — Kapso" on the Vanessa panel reads the `whatsappKapso` document: status, masked numbers,
conversation counts and the latest threads (contact label and time only). Written every 10 minutes by the Mac task
`kapso-inbox-sync` (`integrations/mac-task-specs.md` §5b). By hand: run `python3 integrations/kapso/kapso-fetch.py
--json` with Bash and `set` the printed JSON as doc `whatsappKapso` (collection `state`) with ArtifactData. "Not
configured" means the Keychain has no `kapso` key.

## Unattended replies — `vanessa-whatsapp-inbox` (spec §5c)
`python3 integrations/kapso/kapso-fetch.py --inbound --since <whatsappInboxState.v.lastSeenAt>` returns only messages from the
allow-listed number (Keychain `kapso-allow` = Steven's own). Answer each as Vanessa (intake → team → HALT list →
reply, under 1,500 characters, no rate quote, no client PII) and send with
`python3 integrations/kapso/kapso-send.py --text - --phone-number-id <the message's phone_number_id> <<'REPLY'`
… `REPLY` (the reply on stdin in a single-quoted heredoc, so `$450,000` or a backtick is text, never shell; use a
delimiter the reply cannot contain, e.g. `REPLY_<message id>`, and never let a reply hold that line by itself). The
recipient is always the allow-listed number; the script refuses any other `--to` before any network call. Log each pair to `agentInbox` (`channel: "whatsapp"`, no number, no body beyond the
first 80 characters). A message that needs a HALT item gets a one-line "that one needs you — packet on the deck"
reply and a Needs-Steven packet, never the licensed answer.

## Orca
No pairing step. The MCP is registered at user scope, so `claude --agent <seat>` inside any Orca worktree carries
the `kapso` tools; `bin/brain os run "answer my WhatsApp"` routes to Vanessa with this skill.
