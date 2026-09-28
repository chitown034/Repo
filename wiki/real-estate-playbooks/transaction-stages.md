# Transaction stages

Stage definitions and the deadline that defines each one. **Status: stub, 2026-09-28.**

Primary source: **The Ultimate Realtor Playbook** (602 pages, `references/index.md`) for the stage
definitions themselves.

## What is verified in this repository

- **Earnest money is a deadline, not a detail** — the standing fact this topic's index already
  states; any stage list that omits EMD is wrong. See `wiki/real-estate-playbooks/index.md`.
- The **live** stage tracking for mortgage deals is Zoho's kanban — `zoho-crm-sync`
  (`.claude/skills/zoho-crm-sync/SKILL.md`) writes `zohoLeads` as a **14-stage kanban**. That is a
  different system from this playbook's stages (mortgage pipeline vs. real-estate transaction), and
  the two should not be conflated in an answer.
- Real-estate pipeline stage totals are `loftyLeads`/`pipeline`, not this wiki page — see
  `wiki/dashboard-ops/db-docs.md`. This page is the process definition; those docs are the live count.
