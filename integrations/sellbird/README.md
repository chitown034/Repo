# Sellbird — partner prospecting for Steven

[Sellbird](https://github.com/ethanplusai/sellbird) (open source, AGPL-3.0) finds local businesses, the person who
decides, verifies their email, drafts a short personal sequence, sends from your own mailbox after you approve it,
and handles replies. It runs on the Mac with the Claude Code login; nothing here holds a key or password.

Configured for the **referral-partner channel** (business-to-business only): real-estate, estate-planning/probate,
family-law, divorce and bankruptcy attorneys, home builders and general contractors in Temecula, Murrieta, Menifee,
San Diego, Carlsbad, Oceanside, Escondido and Chula Vista. Realtors, CPAs and financial planners need a search key
(TinyFish or Serper, both with free tiers): the free OpenStreetMap source maps lawyers and builders, not them.

## Files
- `sellbird.local.yaml` — Steven's configuration, built from Sellbird's own template and validated with its
  config loader (2026-11-15; Sellbird's 3,700-test suite passed on the install used to check it).
- `email_rules.md` — what the writer may and may not say (RESPA §8 no-referral-fee language, no rate claims, fair
  housing, DRE/NMLS signature). Installed to `~/sellbird/skills/email_rules.md`.
- `install-sellbird.sh` — clones to `~/sellbird`, installs, copies the two files above without overwriting, checks
  the config and prints the remaining one-time steps.

## Install (on the Mac)
```bash
bash integrations/sellbird/install-sellbird.sh
```
Then fill in `persona.email` (the sending mailbox, on a separate domain) and `compliance.postal_address`
(CAN-SPAM) in `~/sellbird/sellbird.local.yaml`, the Gmail OAuth client and a Reoon or ZeroBounce key in
`~/sellbird/.env`, and run `sellbird gmail auth`, `sellbird precleared-key`, `sellbird warmup`, `sellbird signals`,
`sellbird discover`, `sellbird dashboard`, `sellbird run`.

## Safety settings
Approval required for every email (autopilot off); 25 a day; weekdays 8:30–4:30 in the recipient's time zone;
quiet 8 PM–7 AM Pacific; writes only for fit score ≥ 50 and only with something specific to say; verified
addresses only; Precleared legality check on; LinkedIn automation off; LPT Realty addresses never emailed;
at most 40% of the Claude plan per day. `sellbird sending pause` stops everything.

## Dashboard
Broker Command Center → Growth → Sellbird Outreach (Hollis, under Riley): setup checklist, configuration,
compliance, and weekly import of `sellbird export --out ~/Desktop/sellbird-prospects.csv` into Alliances; engaged
partners become intro-call tasks and appear in the Daily Flow inbox.
