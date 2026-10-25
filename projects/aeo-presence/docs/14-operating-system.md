# 14 · The presence operating system — how this scales without more of Steven's hours

The kit is a set of documents. This page is the machine that runs them: one source of truth, zero-token checks, a
weekly pulse that writes the queue, two desk seats that do the repetitive reading, and gates that keep every public
line clean. It is built on the same rules as the rest of the brain: deterministic code before the model, drafts only,
Steven does the 20% only he can do.

## 1. One source of truth

```
data/identity.json  ──build-identity.mjs──►  site/llms.txt · site/humans.txt · schema/person.jsonld · schema/faq.jsonld · profiles/_generated-bios.md
data/faq.json       ──────────────────────►  (FAQ schema; the visible FAQ on index.html is checked against it by validate-schema)
```

- A fact changes (phone, office, license state, brokerage line) → edit `identity.json`, run the build, commit. Nothing
  else is hand-edited. `build-identity.mjs --check` fails CI when a generated file drifted.
- `profiles/00-canonical-identity.md` stays the human-readable brief; `_generated-bios.md` is the copy seats paste.
- Fields marked `VERIFY` are published as "unconfirmed" until Steven confirms them; the generator carries the mark.

## 2. The weekly machine (zero tokens, then Sonnet, then Steven)

| Step | Who / what | Cost | Output |
|---|---|---|---|
| Monday 6:10 AM PT | GitHub workflow `presence-pulse.yml` runs `scripts/pulse.mjs` | free | `PRESENCE-PULSE.md`, `presence-queue.json` as a build artifact; red on a failed gate |
| Monday 7:50 AM PT (proposed routine) | Presence Pod on Sonnet: queue → `vanessaQueue`, 8-listing citation sweep, 3 answer-block drafts | +1 Sonnet run/week | queue items, updated `citations-nap.csv`, drafts with Alexandra's checklist attached |
| Weekday 6:25 AM PT | Vanessa's Chief-of-Staff cycle works `vanessaQueue` like everything else | existing | ≤3 Needs-Steven lines |
| Steven, ~30 min/week | Edits the listings in the packet, posts the approved drafts, answers the fact questions | his 20% | — |
| 1st business day (proposed routine) | LLM Visibility Analyst: run sheet, scores, `PRESENCE-BENCHMARK.md`, three fixes | +1 Sonnet run/month | the score that matters |

The pulse is idempotent: the same input produces the same queue, and `vanessaQueue` writes dedupe on `task`, so a
rerun never doubles work.

## 3. Definition of done, per artifact

| Artifact | Done when |
|---|---|
| A listing | `status = correct` in `citations-nap.csv` with today's `last_checked`, verified by the Citation Auditor, not by the person who edited it |
| An answer block | On the page, in the FAQ schema, in `data/faq.json` if on the hub, logged in `data/content-log.csv` with platforms, Alexandra's initials in `data/compliance-log.csv` |
| A profile change | The packet's field values appear on the live profile; the next sweep confirms; the retired identifier count in the pulse drops |
| A benchmark month | 50 cells scored, report written, three fixes queued, `kpi-monthly.csv` cell filled |
| A site change | `build-identity --check`, `validate-schema`, `nap-consistency` green; CI green; Steven deployed |

## 4. The queue contract

`data/presence-queue.json` items are shaped for `vanessaQueue`:

```json
{"task": "Fix stale citation: Homes.com", "priority": "p1", "status": "pending", "from": "presence-pulse",
 "ref": "data/citations-nap.csv", "note": "status: stale (old brokerage; Winchester); canonical NAP in …", "owner": "Citation Auditor"}
```

`owner` names the seat that drafts; anything only Steven can do says so in `note`. Priorities: p1 = a live wrong fact
or a failed gate; p2 = a missing Tier-1 listing or the benchmark; p3 = content.

## 5. Capacity model

| Seat | Unit of work | Sustainable weekly volume | When to add a seat |
|---|---|---|---|
| Orin | answer block (page/FAQ + 3 derivatives, Alexandra-ready) | 3 | queue holds > 9 blocks for 3 weeks |
| Citation Auditor | directory read + status + packet line | 8 (Tier 1 weekly, Tier 2 every 3 weeks, Tier 3 every 5) | > 60 directories or a second brand |
| LLM Visibility Analyst | 50-cell benchmark + fixes | monthly; weekly spot-check of 2 prompts | a second brand, or a 7th engine worth tracking |
| Delia | review asks + responses | every closing + 48 h responses | > 10 reviews/week |
| Steven | listing edits, posts, deploy, pay | ~30 min/week after the first two weeks | never: this is the ceiling the system protects |

The first two weeks are heavier for Steven (the Tier-1 fixes and account creations); after that the system holds at
about 30 minutes a week of his time.

## 6. Scaling to a second brand

The nonprofit (Active Duty Veteran & Hometown Hero Homeowners Club, Inc.), Patriot Pacific's team page, or a future
team brand each get their own `data/identity.json` and `data/faq.json` in a sibling folder
(`projects/<brand>-presence/`), the same scripts (copy `scripts/`), their own `citations-nap.csv`, and the same
seats. Nothing in the seats is Steven-specific except the identity file. Rules that stay fixed across brands: the
canonical-entity rule (one hub per entity; every other property links to it), the disclosure lines, the HALT list.

## 7. Gates and escalation

1. **Code gates** (free): `build-identity --check`, `validate-schema`, `nap-consistency`, CI on every push.
2. **Alexandra** on every public line (`docs/13` checklist; initials in `compliance-log.csv`).
3. **Elena** on any domain, DNS, registrar, verification tag or account creation.
4. **Steven** posts, deploys, submits, pays; approves the facts list once.
Escalation: a gate failing twice in a row, or a listing still stale 3 sweeps after the packet went to Steven, becomes
a Needs-Steven line in the morning brief rather than another queue item.

## 8. Continuous improvement hooks

- `data/friction-log.csv` (what took longer than planned, which packet Steven could not act on, which engine changed
  behaviour). The weekly CPI pass (`continuous-process-improvement` skill) reads it; the fix is a change to a script,
  a skill or this page, never a longer checklist for Steven.
- The benchmark's "sources when absent" list is the program's own feedback loop: it tells next month's citation and
  content work where to go.
- Quarterly: refresh pillar dates, bump `identity.json` `updated`, rerun the audit (`docs/01`), re-check AI crawler
  access in `robots.txt`, confirm the engine list in `benchmark.mjs` still reflects where buyers ask.

## 9. What is deliberately not automated

Posting, replying to reviews (Steven's voice, Delia's draft), creating accounts, buying listings or tools, contacting
directory support, and anything that states a rate, fee or eligibility. Automating any of these would trade minutes
for licence risk.
