---
name: proposal-generation
description: A full proposal draft in your structure. Use when the operator asks for help with writing proposals and quotes.
---

# Proposal Generation · starter skill

**Category:** Deals
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Mortgage Broker
**Replaces:** "writing proposals and quotes" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at writing proposals and quotes so the operator approves instead of produces. It reads the call transcript, your pricing file and past proposals, then hands back a full proposal draft in your structure. Nothing goes out without a human.

## Reads before it acts

- `deals/pricing.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Slack, WhatsApp, Google Drive, Notion, GoHighLevel, Instagram, LinkedIn, Canva

## How to install

1. Save this file at `.claude/skills/proposal-generation/SKILL.md`
2. Save the starter context file at `deals/pricing.md` and fill in the blanks
3. In Claude Code, say: "Use the proposal-generation skill on [the thing]"

## Steps

1. Read the context file, then the full thread or transcript. Never answer from the last message alone.
2. Identify the stage: new lead, warm, went quiet, ready to buy. Say which and why.
3. Draft the next move (reply, follow-up or proposal) in the operator's voice, using only prices and terms from the context file.
4. Flag anything you are not sure of instead of guessing. Never invent a price, date or promise.
5. Log the run and queue the draft for approval.

## Output

A full proposal draft in your structure. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Proposal Generation carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

## Steven's mortgage guardrails (added on install)

- Context files live in `vanessa/skilltree/context/` (voice.md, deals/*.md, sales/*.md). Read the one this skill names plus `voice.md` first.
- No rate, APR, payment, points or fee unless it is in the input (current rate sheet or Loan Estimate). Otherwise write `[from today's rate sheet]` and flag it. If a rate or payment appears, add "APR and terms subject to change and credit approval."
- Never recommend or rank a lender or product by compensation (LO Comp Rule, 12 CFR 1026.36(e)). Comp terms never go in these files or this repo.
- Written drafts end with: Steven Shearrill · NMLS 2449246 · CA DRE #01988316 · Patriot Pacific Financial Corp, NMLS 1921615.
- Steven is licensed in CA, IL, NV, FL, AZ only. Any other property state: no loan pitch or consult; point to https://patriotpacificmlo.com/out-of-state-referral/ (and Charles's application link where Patriot Pacific is licensed) and flag it.
- Email, Slack and calendar are drafts only unless Steven explicitly asks to send. Respect opt-outs/DNC, text consent and 8am–9pm local calling hours.
- The same agent runs inside VANESSA › AI Call Center ISA › SkillTree Agents, with an approval queue and run log.
