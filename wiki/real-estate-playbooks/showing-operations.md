# Showing operations

Itinerary building, Showami bookings, feedback capture. **Status: stub, 2026-09-28.**

## The rule that overrides any process detail

**Showings never contact a client or listing agent from an automation.** Requests land on the ISA
line and reach the ISA Portal on the next bridge run — this topic's own index states this, and it
governs every page under this topic, not only this one.

## What is verified in this repository

- **Showami** is one of the five sites a CLI-Anything read-only harness targets
  (`integrations/CONNECTIONS.md`), alongside homes.com, ShowingTime, SkySlope and zipForms — **not
  installed on the Mac**, and every recipe across all five ships `verified: false`; no site has ever
  been reached live.
- Credentials for Showami (and the other four) live in the Mac keychain under
  `cli-anything.<target>` or `~/.config/cli-anything/.env` — never in a prompt, task, skill file or
  the deck (`integrations/CONNECTIONS.md`, standing rule 5).
- Itinerary-building and feedback-capture mechanics are playbook content — **The Ultimate Realtor
  Playbook** (602 pages, `references/index.md`) — not recorded here.
