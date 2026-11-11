---
name: email-verification
description: Every email marked send / fix / don't send with the reason. Use when the operator asks to check or clean an email list before outreach.
---

# Email Verification

**Category:** Sales · **Built for:** Mortgage Broker (Steven Shearrill) · closes a SkillTree Sales gap

## What it does
Checks each address before outreach: valid syntax, common domain typos (gmial.com → gmail.com), disposable inboxes (mailinator, yopmail…), role addresses (info@, sales@ — lower reply rate) and duplicates. Marks each send / send (role) / fix / don't send with the reason and a next step.

## Steps
1. Extract every email from the input (lines, CSV column or free text).
2. Run the checks above. Do not claim a mailbox exists — no SMTP/MX ping is done.
3. Return the table plus a two-line summary: counts, and which ones need the lead to confirm.
4. Log the run.

## Guardrails
- Never "fix" an address silently — a likely typo is confirmed with the lead first.
- Drafts only. In VANESSA this runs locally (no AI cost): AI Call Center ISA › SkillTree Agents › Email Verification, or the `email_verify` agent tool.
