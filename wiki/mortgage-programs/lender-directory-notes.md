# Lender directory notes

How the 61 lenders differ in practice (overlays, turn times). **Status: stub, 2026-09-28.**

## What is verified in this repository

- **61 lenders** is the deck's own tracked count, drift-checked against the ISA Portal alongside the
  39-program count (`wiki/mortgage-programs/index.md`, `projects/isa-portal.md`) — not restated as
  a fact to maintain here.
- The closest thing to real per-lender data in this stack today is **advertised-rate scraping**, not
  overlay or turn-time notes: `integrations/CONNECTIONS.md`'s CLI-Anything section lists read-only
  `publicfeeds` recipes for **Veterans United** (VA 30-yr refi) and **Navy Federal** (VA/Jumbo 15-yr
  fixed) rate pages — built, `verified: false`, and disabled-by-policy pending Alexandra's
  terms-of-service review (`CLI_ANYTHING_TOS_REVIEWED_LENDERRATES`). No call has ever been made live.
- No overlay or turn-time note for any of the 61 lenders is recorded anywhere in this repository.

Overlay and turn-time practice is exactly the kind of thing worth capturing with `interview-me`
("Grill Me") once Steven has a session for it — see `.claude/skills/interview-me/SKILL.md`.
