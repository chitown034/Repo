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

## Locked install and status check (`install.sh`)

`install.sh` does the same install as `install-sellbird.sh` (it copies the configuration and email rules above
without overwriting), with two differences: it pins Sellbird to the commit reviewed on 2026-11-15 (`25ec839`,
v0.4.0) rather than taking the newest code, and it turns Sellbird's kill switch on, so nothing can leave until you
run `sellbird sending resume` yourself. Running it again pauses sending again.

```sh
bash integrations/sellbird/install.sh             # install or update at the reviewed commit, then lock
bash integrations/sellbird/install.sh status      # one line, no names; exits 1 unless paused with approval on
bash integrations/sellbird/install.sh dashboard   # open Sellbird's own screen (127.0.0.1:5555, Mac only)
```

## Before anything is sent (Steven decides; CLAUDE.md HALT list)

Cold email from a licensed real-estate and mortgage professional is advertising. These are open decisions, not
settings Claude chooses. Alexandra drafts the compliance read; Steven decides.

1. **Who it prospects** is set in `sellbird.local.yaml` (referral partners, business-to-business). Consumer leads
   stay in Lofty and Zoho. Confirm the list is the one you want.
2. **Which business it speaks for**: LPT Realty or Patriot Pacific Financial. The email footer needs the right
   licence line (NMLS 1921615 on anything about loans) and a postal address; Sellbird's `status` reports the postal
   address as missing until it is set.
3. **Broker and lender sign-off** on the wording, and the state rules for the states the prospects are in.
4. **A mailbox to send from**, ideally a separate sending domain with warmup (about $7 a month; spending money).
5. Only then: `sellbird train <site>`, `sellbird signals --confirm free`, `sellbird discover`, approve drafts in the
   Outbox, and `sellbird sending resume`. Autopilot stays off.

## Verified here (cloud sandbox, 2026-11-15) / not verified

- `install.sh` end to end into a throwaway folder (Python 3.13): clone at the pin, install, pause, state line
  "sending PAUSED · approval on · LinkedIn off"; second run the same; `status` on a missing folder says not installed.
- `sellbird sending status`: PAUSED. Effective settings: approval on, LinkedIn off, 50 a day limit.
- `sellbird dashboard`: serves on 127.0.0.1:5555 (HTTP 200), loopback only, token link.
- **Not verified (Mac only):** the install on macOS, the Claude Code sign-in driving it, any mailbox. Nothing was
  trained, searched or sent.

## Finish setup with Claude on the Mac
Open Claude Code (or the Claude desktop app) in the Repo folder on the Mac and say **"finish setting up Sellbird"**. The `sellbird-setup` skill (`.claude/skills/sellbird-setup/`) checks what is done, runs the installer if needed, asks only for what you must supply (sending mailbox, postal address, Gmail sign-in, a verifier key), runs the checks and opens Sellbird's dashboard.
