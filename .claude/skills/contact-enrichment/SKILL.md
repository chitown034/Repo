---
name: contact-enrichment
description: Each contact filled in with public business details and a confidence score. Use when the operator asks for help enriching contacts or finding a prospect's brokerage, website or business contact details.
---

# Contact Enrichment

**Category:** Sales · **Built for:** Mortgage Broker (Steven Shearrill) · closes a SkillTree Sales gap

## What it does
Takes a list of contacts (one per line: name — company/brokerage — city) and fills in public business details: brokerage or company, role, website, public business email/phone, license number, with the source URL and a 0–100 confidence score. Hands back a draft table; nothing is contacted.

## Reads before it acts
- `vanessa/skilltree/context/sales/icp.md` and `vanessa/skilltree/context/voice.md`
- Public web research only (company sites, brokerage rosters, state license lookups, LinkedIn public pages)

## Steps
1. Read the ICP and voice files.
2. For each contact, search public business sources. Record only what a source shows, with its URL.
3. Score confidence: 90+ = matched on two sources; 60–89 = one strong source; below 60 = unsure. Flag low scores.
4. Suggest a first touch that fits the ICP. Two-line summary on top: what this is, what needs a human.
5. Log the run: who, what was found, what is still unknown.

## Guardrails
- Public business information only. No personal phone numbers, home addresses, family details or anything behind a login.
- Never guess an email or phone. If it isn't on a source, leave it blank and say so.
- Drafts only; follow `.claude/skills/*/SKILL.md` mortgage guardrails (NMLS 2449246, licensed CA/IL/NV/FL/AZ, LO Comp Rule).
- Same agent runs in VANESSA › AI Call Center ISA › SkillTree Agents.
