---
name: sellbird-setup
description: "Finish installing Sellbird (github.com/ethanplusai/sellbird) on Steven's Mac for partner prospecting, using the configuration in integrations/sellbird/. Use when Steven says 'finish setting up Sellbird', 'set up Sellbird', 'start Sellbird', or asks why Sellbird isn't running."
---

# sellbird-setup — finish Sellbird on the Mac

Runs on the Mac only (Sellbird needs the Claude Code login, a mailbox and the open internet). Steven's
configuration, email rules and installer are in `integrations/sellbird/` (validated 2026-11-15 with Sellbird's own
config loader; its 3,700-test suite passed). The dashboard page is Broker Command Center → Growth → Sellbird
Outreach (seat: Hollis, under Riley).

Work one step at a time, check before acting, and ask Steven only for what only he can give. Never print, log or
commit a key, password, OAuth secret or the dashboard token. Never turn autopilot on
(`channels.email.require_approval` stays `true`) unless Steven asks for it in those words.

## 1. Check state (silently)
- `~/sellbird/.venv` exists and `~/sellbird/.venv/bin/sellbird --help` runs → installed. Else run
  `bash integrations/sellbird/install-sellbird.sh` from the Repo folder.
- `~/sellbird/sellbird.local.yaml` exists → config installed (the installer copies it; never overwrite it).
- `cd ~/sellbird && .venv/bin/sellbird status` → read "Postal address", provider and prospect counts.

## 2. What only Steven can supply — ask, one at a time
1. **Sending mailbox** for `persona.email`: a Google Workspace mailbox on a *separate* domain from his main one
   (cold email from the main domain risks its reputation). If he has none, explain: buy a lookalike domain,
   add Google Workspace (~$7/mo), set SPF/DKIM/DMARC, then warm it ~14 days (TrulyInbox recommended by Sellbird).
   Set `channels.email.warmup.start_date` to the day warmup starts.
2. **Postal address** for `compliance.postal_address` (CAN-SPAM): a street address, PO box or virtual mailbox he
   receives mail at. Do not assume the LPT office address; ask whether he may use it.
3. **Gmail OAuth client** → he pastes `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` into `~/sellbird/.env` himself
   (Google Cloud Console → new project → enable Gmail API → OAuth client ID, type Desktop app). Then he runs
   `sellbird gmail auth` (a browser sign-in).
4. **Email verifier key**: `REOON_API_KEY` (600 free/month) or `ZEROBOUNCE_API_KEY` in `.env`. Without one, every
   address stays "guess" and nothing is sent.
5. Optional, to reach realtors, CPAs and planners: `TINYFISH_API_KEY` or `SERPER_API_KEY`.

Edit `sellbird.local.yaml` only for items 1 and 2 (and warmup start_date). Never edit `.env` values for him;
let him paste them.

## 3. Then run, checking each result
```bash
cd ~/sellbird && source .venv/bin/activate
sellbird precleared-key          # free legality-check key, saved to .env
sellbird warmup                  # SPF/DKIM/DMARC, domain age, blocklists, warmup — report what is missing
sellbird signals                 # show Steven; confirm what he approves (e.g. --confirm free)
sellbird discover --estimate     # show the searches and cost ($0 on OpenStreetMap)
sellbird discover                # after his yes
sellbird status
sellbird dashboard               # tell him to open the private link it prints; do not repeat the token
sellbird mcp install claude      # lets Claude read Sellbird and pause sending
sellbird autostart install       # tray icon at login (optional)
```
Start `sellbird run` only after warmup says the mailbox is ready and Steven agrees. Every email still waits in the
Outbox for his approval.

## 4. Hand-off to the dashboard
- Export weekly: `sellbird export --out ~/Desktop/sellbird-prospects.csv`, then Growth → Sellbird Outreach →
  Import. Partners land in Alliances; replies become intro-call tasks for Riley.
- Tell Steven which checklist steps on that page he can now tick.

## Guardrails
Business-to-business only (professionals at business addresses). RESPA §8: no referral fees or anything of value
for referrals. No rate/approval claims. LinkedIn automation stays off. `sellbird sending pause` stops everything.
