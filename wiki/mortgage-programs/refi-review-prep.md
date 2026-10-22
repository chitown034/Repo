# Refi review prep — who could refi, as a prep list (market average, not a quote)

How the Refi Watch works: the list Steven keeps, the market average it is compared with, the spread thresholds,
the Monday routine, the `refi-watch` skill, the VA IRRRL note, and the one step that is Steven's licensed act.
As of 2026-10-22. Sources: skill `.claude/skills/refi-watch` (2026-10-22), cloud routine
`trig_014ipr6x9z35psmtHJCPVqj1` (`docs/inventory/cloud-routines-2026-10.md`, `docs/AUTOMATION-MAP-2026-10-20.md`),
`wiki/ai-team/desk-seats.md` § Refi Watch Analyst, `wiki/ai-team/org-chart.md` § What the desks run on,
`.claude/skills/cos-daily-cycle` (the `listOutbox` → `refiWatchList` move).

**The label on everything:** *Market average from `ratesSnapshot` (<index date>). Not a quote, not a
pre-qualification, not an eligibility decision. Any rate for a specific client is Steven Shearrill's, MLO NMLS
1921615, after a full application.* Gap audit 2026-10-22: rate drops went unnoticed because nothing compared the
daily snapshot with the book.

## Who does what

| Role | Who |
|---|---|
| The Monday prep list: first name, program, note rate, market average, spread | Refi Watch Analyst (Sonnet 5 desk seat; Mortgage Pod) |
| Scenario prep for anyone Steven picks; the VA IRRRL lane | Harrison (Elite Mortgage Broker, under Victor) |
| The touch draft, if Steven wants one after the conversation | Sphere Nurture Coordinator + Alexandra |
| Keeps the list current | Steven (and the ISA, from the ISA Portal form) |
| The rate quote, the eligibility call, the savings figure, every client contact | **Steven only** (licensed) |

## Who could refi — the question this page answers

"Who could refi", "rates dropped — who do I call", "run the refi watch": the answer is a **prep list** of past
clients whose note rate sits above today's market average for the same program, ordered by spread. It is a list
of conversations worth having, for Steven alone. It is never a list of people who *can* refinance.

## The list — `refiWatchList` on the Command Deck

`refiWatchList` is `{v: {clients: [...]}}` in the deck's `state` collection. Each client (fields as the ISA
Portal's intake form writes them, 2026-10-22):

| Field | Means |
|---|---|
| `first` | First name only — no surname, no loan number, no address |
| `noteRate` | The rate on the client's current note, **typed by Steven** — the only source. The skill reads no loan file, no Zoho record, no Closing Disclosure |
| `loanType` | VA · FHA · conventional · jumbo · USDA · non-QM — picks the `ratesSnapshot` row to compare against |
| `closedMonth` | `YYYY-MM` the loan funded — drives the seasoning flag |
| `note` | One line (e.g. "wants to stay 10 years"); never a figure |
| `ts`, `status` | When written; `pending` → `moved` once the cycle copies an ISA Portal row in |

Ways in: Steven tells Claude "refi list: <first name>, <note rate>, <loan type>, <month closed>" (`docs/STEVEN-STEPS.md`
6b); the deck's own form; or the ISA Portal form, which writes `listOutbox.v.refi` — the 6:25 AM daily cycle appends
pending rows to `refiWatchList.v.clients` (de-duplicated by first name + month) and marks them `moved`. The note
rates stay on the list and in the session; `vanessaQueue` text carries first names, programs and the spread only.

## The comparison

1. Read `ratesSnapshot` (written daily by the Mac task `mortgage-rates-daily`; Optimal Blue via FRED). Note the
   product rows and the doc's `syncedAt` / index date. **Older than 80 hours, or `status` not ok → say so and stop.**
   A stale average is not a watch. (The Mac rates task has been silent since 2026-10-13 — the ISA Portal mirrors
   the deck's last copy; check the stamp before trusting it.)
2. For each client: `spread = note rate − market average for the same program`. Show the arithmetic.
3. Order by spread, group by program. Flag seasoning: funded < 210 days ago on VA, < 6 months on most programs →
   "seasoning — not yet".
4. Write `refiWatchDesk` (the week's list) and one `vanessaQueue` item per flag (or one table item in the attended
   skill) with `ref` = the exact `ratesSnapshot` stamp used.

### Spread thresholds — 0.75 and 0.50

| Threshold | Where it applies | As of |
|---|---|---|
| **0.75 point** or more | The Monday routine flags "worth a conversation" and queues a call-outline task per flag | 2026-10-22, `docs/AUTOMATION-MAP-2026-10-20.md` |
| **0.50 point** (default) | The attended `refi-watch` skill; Steven's own threshold was still pending on 2026-10-22, so until he sets one the skill lists **every positive spread** and lets him cut | 2026-10-22, the skill |

Steven's word settles it; until then the two numbers coexist and the page says which one produced a list.
"Worth a conversation" is the ceiling of the wording — never "qualifies", "eligible", "approved", "can refinance",
and never a dollar savings figure ("you'd save $212/month"). The spread in points is the whole output.

## VA IRRRL — Harrison's lane, pointer only

For a VA client the list says "IRRRL path — Harrison" and nothing more. What the brain holds today: the IRRRL
funding fee is **0.50%**, may be financed, due to the VA within 15 calendar days of closing
(`wiki/mortgage-programs/va-eligibility.md`); the 210-day seasoning flag above; residual-income mechanics in
`wiki/mortgage-programs/va-affordability.md`; and Loan United's no-FICO IRRRL / streamline note in
`lender-directory-notes.md`. The skill points at `wiki/mortgage-programs/va-irrrl.md`, which **does not exist yet**
(2026-10-22) — an open gap; until it is written, `va-eligibility.md` is the page. Whether a given client's IRRRL
works (net tangible benefit, recoupment, the 210-day / six-payment rule) is a Harrison scenario and then Steven's call.

## The Monday routine — `trig_014ipr6x9z35psmtHJCPVqj1`

"Refi watch — weekly prep list (Mon 7:20 AM PT, drafts only)". Cron `CRON_TZ=America/Los_Angeles 20 7 * * 1`,
created 2026-10-22, enabled, **first run 2026-10-26** — nothing has run yet. Reads `ratesSnapshot` and
`refiWatchList`; writes `refiWatchDesk` and `vanessaQueue`. The 6:25 AM cycle that follows on Tuesday folds the flags
into the ≤3 Needs-Steven items. Judge it by the `refiWatchDesk` stamp, not by "succeeded". The attended version is the
skill: "who could refi" in any session runs the same comparison on the list Steven types.

## Steven's licensed step

Everything above is preparation. The licensed step — his alone, NMLS 1921615 — is: deciding to call, the call
itself, any rate he mentions, any eligibility view, any savings number, a lock, and a full application. "What rate
would they get" is a quote: the answer is a Needs-Steven packet and the `loan-pricing-agent` worksheet he drives
himself. If he wants call scripts afterwards, that is a Harrison + Alexandra draft carrying the label above.

## HALT

- A client's rate came from anywhere but Steven's typed list → do not use it.
- `ratesSnapshot` stale or not ok → report staleness; no comparison.
- A quote, an eligibility word, a savings figure, or any message to a borrower → stop; packet.
- Handing the list to the ISA for calls → no; this list goes to Steven alone.

## See also

- `wiki/mortgage-programs/va-eligibility.md` · `va-affordability.md` — the VA mechanics behind the IRRRL note.
- `wiki/mortgage-programs/program-selection.md` — which `ratesSnapshot` row a loan type maps to.
- `wiki/real-estate-playbooks/sphere-nurture.md` — the care touches; a different list that never carries a rate.
- `wiki/ai-team/push-button-system.md` — the queue and the Monday slot in the daily schedule.
