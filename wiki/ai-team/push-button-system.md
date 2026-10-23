# Push-button system — one queue, one daily schedule, one-word buttons (as of 2026-10-22)

The architecture Steven asked for on 2026-10-22 ("the best automated push button system"): every surface hands
work to **one Vanessa queue**, a fixed morning schedule works it, the Command Deck carries push-buttons for the
rest, the Claude Code mods turn each job into one word, and Pabbly carries the vendor-to-vendor hand-offs off the
Claude allowance. Sources: `context/decisions.md` (2026-10-22 entries), `always-on/README.md` § push-button
schedule, `docs/AUTOMATION-MAP-2026-10-20.md`, `docs/ROUTINE-BUDGET-2026-10-22.md`,
`integrations/pabbly/WORKFLOWS.md`, `integrations/mods/RECOMMENDATIONS.md`, `wiki/ai-team/cross-functional.md`,
`wiki/ai-team/org-chart.md`, `.claude/skills/cos-daily-cycle`, `integrations/mac-task-specs.md` § 8b.

**Drafts only, everywhere.** No button, routine, mod or workflow sends to a client, quotes a rate, decides
eligibility, signs, spends, enters a credential or writes to a client-facing system. The HALT list is at the end.

## What `vanessaQueue` is — the one queue

`vanessaQueue` is a document in the Command Deck's `state` collection (`{v: ...}` like every doc). It is the single
intake for Vanessa: whatever anyone wants her team to do goes there, and nowhere else. Writers, all append-only
and pinned to the version they read:

| Writer | How |
|---|---|
| Deck buttons | "Hand to Vanessa" on kanban cards, lead rows and deal rows |
| Vanessa's chat card | her own `queue_task` tool |
| Claude Code | the `/queue <task>` mod (`push-buttons`) |
| The ISA Portal | the "Hand to Vanessa" box writes the portal's `vanessaOutbox`; the 6:25 cycle moves pending items in and marks them `moved` |
| Routines and skills | refi watch, sphere touches, review-request, open-house, meeting scribe, inbox triage — each adds its item with `from:` set |

An item carries at least `{task, priority (p1/p2), status (pending → done | needs-steven), from, ref, note}`
(the `refi-watch` skill's shape; other fields: see the routine prompt). The 6:25 AM cycle works the queue first,
marks each item done or needs-Steven with where the draft is, and folds the rest into the ≤3 "Needs you" lines.

## The daily schedule (Pacific time; `always-on/README.md`)

| When | What | Routine / task |
|---|---|---|
| 3:30 AM daily | 6D Brain rebuild + republish | `trig_01MQ7HRYTh27b8uUM4BtnFXE` |
| 6:05 AM weekdays | Transaction & Showing desk → `tcDesk` (timelines from `tcDeals`, due-in-7, overdue, drafts) | `trig_011iofWVNizNQ1SNujNcp5tL` |
| 6:25 AM weekdays | Vanessa's Chief-of-Staff cycle: `vanessaQueue` first, ≤8 pod squads in parallel → `cosBrief`, `twinQueue`, ISA `isaToday` | `trig_019whypw6EeNu2G8xxY5xE5N` |
| 6:34 AM daily | Morning brief across the three dashboards → push + `morningBrief {text, voiceScript}`, `morningBriefStatus` | `trig_01Q9VPMwrKwNUW3kZL54rKgy` |
| 6:40 AM daily (Mac) | iMessage text of that brief, then Vanessa's voice note on the same thread | Mac task `vanessa-morning-brief-text` + §8/§8b |
| 7:20 AM Mon | Refi watch prep list (`refi-review-prep.md`) | `trig_014ipr6x9z35psmtHJCPVqj1` |
| 7:40 AM, 11th monthly | Sphere & past-client touches (`sphere-nurture.md`) | `trig_01Pn8xLNKTVVFYjYTj8d8JTd` |
| 8:40 AM daily (15:40 UTC) | Freshness sweep, per-key cadence 8 d / 4 d / 80 h / 26 h | `trig_01Y1zZ3bmawgi4Mw2jNw9ZFM` |
| Sun 2:07 PM (21:07 UTC) | Weekly backup after the allowance reset; watchdog 4:41 PM | `trig_01JcPh3AM2z21Bsv34SvSkqM` |

Cloud routines carry no connectors on this account, so the text and the voice stay Mac-side. Budget after the
2026-10-22 cuts: about 133 runs a week (−34%); all 14 October failures were `USAGE_LIMIT_REACHED`
(`docs/ROUTINE-BUDGET-2026-10-22.md`). The Mac runner was frozen from 2026-10-13 until the paste below.

## The Command Deck push-buttons

| Button | Does | Writes |
|---|---|---|
| Run cycle | the Chief-of-Staff cycle now (same as `/cycle`) | `cosBrief`, `vanessaQueue`, `twinQueue` |
| Triage inbox | last 24 h of Gmail grouped; replies as Gmail **drafts**; fraud flags; Needs-Steven list | `inboxDesk`, drafts |
| Recap meetings | Fieldy + Zoom recaps, decisions, action items, one follow-up draft each | `inboxDesk.meetings`, `vanessaQueue` |
| Draft follow-ups | follow-up drafts for leads and deals due | `vanessaQueue`, drafts |
| Text me the brief | today's `morningBrief.text` to Steven's **own** mobile via Inkbox (number in localStorage only) | — |
| Hand to Vanessa | one row → one `vanessaQueue` item | `vanessaQueue` |

The inbox and meeting buttons use the page's own Gmail / Fieldy / Zoom / Inkbox connectors with the viewer's
sign-in, because routines cannot carry connectors here. "Today from Vanessa" shows `cosBrief`; the TC intake form
writes `tcDeals`. Deck version 224 and ISA Portal version 46 as of 2026-10-22 (`projects/command-deck.md`,
`projects/isa-portal.md`).

## Pods and gates (`wiki/ai-team/cross-functional.md`)

Eight standing pods wake together in one wave (≤8 seats, ≤4 web-research): **Deal** (Victor, Carmen, Showing
Coordinator, Harrison, Document Intake Clerk, Alexandra) · **Lead** · **Listing** · **Mortgage** (Harrison's
reports + Refi Watch Analyst) · **Growth** · **Money** · **Ops** (Derek, Elena, Elon, Nadia) · **Client Care**
(Sofia, Sphere Nurture Coordinator, Open House Captain, Wren, Victor, Alexandra). Gates run after the wave, never
inside it: **Alexandra** (any client / ad / disclosure draft) → **ECC** and **Validation** (any code change) →
**Vanessa** (one answer for Steven). Nadia and Elon only propose; a fraud smell goes to Elena before anyone replies.
`bin/brain route "<request>"` prints the plan with zero tokens; the seven desk seats are in `desk-seats.md`.

## The mods — one word each (`integrations/mods/RECOMMENDATIONS.md`, added 2026-10-22)

| Word | Does |
|---|---|
| `/cycle` | runs the Chief-of-Staff cycle in this session |
| `/inbox` | triages the last 24 h of Gmail — drafts only, fraud flags, Needs-Steven list |
| `/meetings` | recaps recent Fieldy and Zoom meetings with a follow-up draft each |
| `/today` | reads today's brief and lists what needs Steven |
| `/tc` | runs the Transaction & Showing desk |
| `/queue <task>` | appends one item to `vanessaQueue` |
| `/sync` | brings the Repo folder up to date (`scripts/repo-sync.sh`, never pushes) |
| `/connect` | previews `connect-all.sh` and says what is left |

Every prompt ends with the HALT line. `ops-pulse` adds the status line ("repo: 3 behind · /sync /cycle /today")
and a toast when GitHub is ahead. Both validated on Claude Code 2.1.308; seven of Steven's mods in all.

## Pabbly workflows 1–11 (`integrations/pabbly/WORKFLOWS.md`)

Vendor-to-vendor glue that runs on Pabbly, not on the Claude allowance. Steven clicks each together; off until
he does. 1 Lofty new lead → Gmail draft + Calendar task · 2 Zoho stage → Notion + Slack · 3 Calendar −60 min →
WhatsApp nudge (Steven's number) · 4 Gmail "Action" label → Notion + Slack · 5 Kapso inbound from Steven → Notion ·
6 Strava → Notion Health Log · 7 Closed / Funded → day 1 / 10 / 30 drafts (`post-close-care.md`) · 8 birthdays and
anniversaries → drafts + ISA list (`sphere-nurture.md`) · 9 open-house sign-in → Lofty lead + draft + ISA task
(`open-house.md`) · 10 voicemail email → Notion + ISA · 11 Kapso inbound from anyone else → Slack + Notion. The
custom Kapso app: triggers built as manual webhooks, send step waits on Steven's test number.

## The Mac paste (`docs/STEVEN-STEPS.md` "Start here (2026-10-22, evening)")

One Terminal line syncs the repo (and every 30 min after), restarts the frozen runner, keeps the Mac awake on the
charger, installs or checks Kapso, Gondola, Inkbox voice, Laya, Jarvis, Orca, AnyDesk and the seven mods. It never
signs in, pairs, sends or pays. Then: text `connect @vanessa-shearrill` to Vanessa's Inkbox line once; paste §8b
at the start and §8 at the end of `vanessa-morning-brief-text`; share the ISA Portal with the ISA.

## HALT (mirrors `CLAUDE.md`)

Never: send to a client · quote a rate · decide eligibility · negotiate, sign or lock · spend money · enter or
change a credential · write to Lofty, Zoho, a calendar invite or an email send · move client PII off the local
model · edit a live prompt, task or artifact outside an assigned region. Each becomes a Needs-Steven packet; the
cycle allows at most three a day.

## See also

`always-on/README.md` · `wiki/ai-team/cross-functional.md` · `wiki/ai-team/desk-seats.md` ·
`docs/AUTOMATION-MAP-2026-10-20.md` · `docs/ROUTINE-BUDGET-2026-10-22.md` · `integrations/pabbly/WORKFLOWS.md` ·
`integrations/mods/RECOMMENDATIONS.md` · `wiki/dashboard-ops/db-docs.md` (the docs named above).
