---
name: list-building
description: A scored list with the reason each one fits. Use when the operator asks for help with building lead lists.
---

# List Building · starter skill

**Category:** Sales
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Mortgage Broker
**Replaces:** "building lead lists" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at building lead lists so the operator approves instead of produces. It reads your ideal-customer file and the sources you already use, then hands back a scored list with the reason each one fits. Nothing goes out without a human.

## Reads before it acts

- `sales/icp.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Slack, WhatsApp, Google Drive, Notion, GoHighLevel, Instagram, LinkedIn, Canva

## How to install

1. Save this file at `.claude/skills/list-building/SKILL.md`
2. Save the starter context file at `sales/icp.md` and fill in the blanks
3. In Claude Code, say: "Use the list-building skill on [the thing]"

## Steps

1. Read the context file and the voice file. Do not write a word before both are loaded.
2. Read everything provided about the prospect. Pull three specifics: what they sell, one recent signal, one likely pain.
3. Draft the output in the operator's voice. Short. One idea per line. No opener fluff.
4. Add a one-line note explaining why this prospect fits, so the operator can approve in five seconds.
5. Log the run: who, what was drafted, what still needs a human.

## Output

A scored list with the reason each one fits. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of List Building carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

## Steven's mortgage guardrails (added on install)

- Context files live in `vanessa/skilltree/context/` (voice.md, deals/*.md, sales/*.md). Read the one this skill names plus `voice.md` first.
- No rate, APR, payment, points or fee unless it is in the input (current rate sheet or Loan Estimate). Otherwise write `[from today's rate sheet]` and flag it. If a rate or payment appears, add "APR and terms subject to change and credit approval."
- Never recommend or rank a lender or product by compensation (LO Comp Rule, 12 CFR 1026.36(e)). Comp terms never go in these files or this repo.
- Written drafts end with: Steven Shearrill · NMLS 2449246 · CA DRE #01988316 · Patriot Pacific Financial Corp, NMLS 1921615.
- Steven is licensed in CA, IL, NV, FL, AZ only. Any other property state: no loan pitch or consult; point to https://patriotpacificmlo.com/out-of-state-referral/ (and Charles's application link where Patriot Pacific is licensed) and flag it.
- Email, Slack and calendar are drafts only unless Steven explicitly asks to send. Respect opt-outs/DNC, text consent and 8am–9pm local calling hours.
- The same agent runs inside VANESSA › AI Call Center ISA › SkillTree Agents, with an approval queue and run log.
