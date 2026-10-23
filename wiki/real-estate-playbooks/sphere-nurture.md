# Sphere nurture — the list, the monthly touches, the 11th-of-month routine

How past clients and the wider sphere are kept warm without anything being sent by a machine: what the
sphere list holds, which touches go out each month, how the 11th-of-month routine and Pabbly workflow 8
divide the work, and what Steven alone does. As of 2026-10-22. Sources: skill
`.claude/skills/past-client-nurture` (2026-10-22), cloud routine `trig_01Pn8xLNKTVVFYjYTj8d8JTd`
(`docs/inventory/cloud-routines-2026-10.md`), `integrations/pabbly/WORKFLOWS.md` § B row 8,
`wiki/ai-team/desk-seats.md` § Sphere Nurture Coordinator, `wiki/ai-team/org-chart.md` § What the desks run on,
`.claude/skills/cos-daily-cycle` (the `listOutbox` → `sphereList` move).

**Drafts only.** Every touch is a Gmail draft or a `marketingQueue` item marked "awaiting Steven". The ISA sends
after Steven approves the month's batch. No touch carries a rate, a refi suggestion or a home-value figure.

## Who does what

| Role | Who |
|---|---|
| The month's nurture calendar and the draft for each touch | Sphere Nurture Coordinator (Sonnet 5 desk seat, reports to Sofia, with Wren) |
| Voice of the market note | Sofia (CMO) |
| The referral ask — only when it fits (`referral-reciprocity.md`) | Wren |
| Compliance line on every draft; RESPA §8 on anything of value | Alexandra |
| Keeps the list current, sends the approved drafts, works the call list | the human ISA / EA |
| Supplies the list in the first place; approves the batch; personalises three by hand | Steven |

## The sphere list — `sphereList` on the Command Deck

`sphereList` is `{v: {people: [...]}}` in the deck's `state` collection. Each person (fields as the ISA Portal's
intake form writes them, 2026-10-22):

| Field | Means |
|---|---|
| `first` | First name only — the deck never holds a surname, address or email |
| `relation` | past client · referral partner · friend / family · neighbour · lead that went quiet |
| `lastTouch` | Date of the last real contact (drives the 90-day check-in) |
| `birthdayMonthDay` | `MM-DD`, if known |
| `homeAnniversaryMonthDay` | `MM-DD` of the close — the home-purchase anniversary |
| `note` | One line Steven or the ISA wants remembered (never PII, never a loan figure) |
| `ts`, `status` | When the row was written; `pending` → `moved` once the cycle copies it in |

Three ways a row gets in: Steven tells Claude "sphere list: <first name>, <relation>, <birthday>, <home
anniversary>" (`docs/STEVEN-STEPS.md` 6b); the deck's own form; or the ISA Portal's intake form, which writes
`listOutbox.v.sphere` — the 6:25 AM daily cycle moves pending rows to `sphereList.v.people`, de-duplicated by first
name + month, and marks them `moved`. Addresses and emails live in Steven's records and the Gmail draft, not here.
The older inputs the skill also reads: `reClients` (past real-estate clients) and `pipeline` (funded mortgage clients).

## The monthly touches (skill `past-client-nurture`)

| Touch | Who gets it | Content | Cap |
|---|---|---|---|
| Market note | everyone, at most once a quarter | Three county numbers from the housing feeds / `ratesSnapshot` county rows (median price, days on market, months of supply) "as of <the doc's stamp>". No mortgage rate, no "now is a good time", no forecast | quarterly |
| Home anniversary | `homeAnniversaryMonthDay` in this month | Two sentences about the house or the year; an offer to help with anything home-related; Alexandra's line | yearly |
| Birthday | `birthdayMonthDay` in this month | Two sentences; Alexandra's line | yearly |
| 90-day check-in | `lastTouch` older than 90 days | One question, one offer, no pitch | per quarter |

Skipped and listed as skipped: anyone with an open transaction, an open complaint or a do-not-contact flag; anyone
whose email is missing or bounced last time (listed for the ISA — never a guessed address). Gmail `search_threads`
is read once per person so a touch never lands on top of an open transaction thread.

What the skill writes: one Gmail draft per touch (`create_draft`, never `send_message`); one `marketingQueue` item per
touch `{id, ts, kind: nurture-market | nurture-anniversary | nurture-birthday | nurture-checkin, client: <first name>,
status: "awaiting Steven", draftId, from}`; one `vanessaQueue` item `Sphere touches — <month>` for the ISA with the
first-name list, the kind of touch and the draft id each; and, first run only, the three Pabbly templates in
`integrations/pabbly/templates/workflow-8.md` (`{{first_name}}`, `{{close_year}}`, `{{street}}` — no real name in it).
Running it again the same month adds nothing (dedupe on client + kind + month).

## The 11th-of-month routine — `trig_01Pn8xLNKTVVFYjYTj8d8JTd`

"Sphere & past-client touches — monthly drafts (day 11, 7:40 AM PT, drafts only)". Cron
`CRON_TZ=America/Los_Angeles 40 7 11 * *`, created 2026-10-22, enabled, **first run 2026-11-11** — nothing has run
yet. It reads `sphereList` and the housing feeds in `liveFeeds`, writes `sphereTouches` (the month's list),
`marketingQueue` drafts and the `vanessaQueue` ISA call list; Alexandra's line on every draft; nothing sent. It runs
on the 11th because the 1st and 2nd were the days the weekly Claude allowance was already spent
(`docs/ROUTINE-BUDGET-2026-10-22.md`). Before the 11th each month the same job can be run by hand: "who should I
touch this month" wakes the skill in an attended session. Judge it by the `sphereTouches` stamp, never by the
routine's "succeeded" (`wiki/dashboard-ops/index.md`, the one rule).

## Pabbly workflow 8 — the dated touches, unattended

`integrations/pabbly/WORKFLOWS.md` § B row 8, as of 2026-10-22: a **daily 7:00 AM PT scheduler** matches today's
birthdays and home-purchase anniversaries in **Google Sheets / Lofty** → a **Gmail draft** per match from the
workflow-8 templates → a **Slack list to the ISA** (first names only). Runs on Pabbly, no Claude allowance. Status:
Steven clicks it together in Pabbly's editor (§ C); off until he says "Pabbly workflow 8 on". Division of labour once
it is on: Pabbly drafts the **dated** touches on the day; the 11th routine still does the market note, the 90-day
check-ins and the ISA call list. Pabbly's drafts are drafts too — the ISA sends.

## What Steven does

- Supplies the list (6b in `docs/STEVEN-STEPS.md`) and keeps it honest; the ISA maintains it after that.
- Approves the month's batch; personalises the three the skill names by hand (longest relationship, biggest file,
  most recent referral).
- Takes any reply that turns into a transaction or loan question — the skill never answers one.
- Decides anything of value (a gift, a referral incentive) after Alexandra's RESPA §8 review.

## HALT

- A touch would carry a gift, incentive or anything of value → Alexandra, then Steven.
- A rate, a refi hint or a home-value figure in a touch → stop; that is `refi-review-prep.md`'s separate list.
- Sending, scheduling a send, or writing to Lofty / the calendar → stop; drafts only.

## See also

- `wiki/real-estate-playbooks/post-close-care.md` — the day 1 / 10 / 30 sequence that feeds this list on day 30.
- `wiki/real-estate-playbooks/referral-reciprocity.md` — when a referral ask fits, and the ledger.
- `wiki/mortgage-programs/refi-review-prep.md` — the Monday refi watch; a different list, never mixed in.
- `wiki/ai-team/push-button-system.md` — the queue, the schedule and the ISA Portal's `listOutbox`.
