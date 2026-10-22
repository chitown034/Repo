# Post-close care — day 1, day 10, day 30, then the year

What happens after a real-estate close (Lofty stage → Closed) or a mortgage funding (Zoho deal → Funded):
the three-email sequence, the review-request rules, the twelve-month care touches, who drafts and who sends.
As of 2026-10-22. Sources: skill `.claude/skills/review-request` (2026-10-22), `integrations/pabbly/WORKFLOWS.md`
§ B row 7, `wiki/real-estate-playbooks/transaction-stages.md` (the Funded / Post-close rows),
`wiki/ai-team/desk-seats.md`, `wiki/ai-team/cross-functional.md` (Client Care Pod).

**Drafts only.** The skill and the Pabbly workflow both produce Gmail drafts. The ISA sends each one on its
date, after Steven has approved the three templates once. Nothing here quotes, signs, spends or writes to the
CRM. Gap audit 2026-10-22: before this, nothing owned the review ask.

## Who does what

| Role | Who |
|---|---|
| Owns the sequence, confirms the COE / funding date from `tcDeals` or `pipeline` | Carmen (Transaction Coordinator, under Victor) |
| Writes the three drafts | Delia (Carmen's drafter; the `review-request` skill is her tool) |
| Compliance line on the review ask, the no-inducement check | Alexandra |
| Sends each draft on its day, logs it on the ISA line | the human ISA / EA |
| Approves the three templates once; decides any exception; the congratulations call | Steven |

The twelve-month touches that follow (below) belong to the Sphere Nurture Coordinator with Wren and Sofia —
see `sphere-nurture.md`. This page hands the client to that one on day 30.

## The sequence (skill `review-request`)

Day 0 is the COE date (`tcDeals`) for a real-estate close or the funded date (`pipeline`) for a mortgage.
A buyer who also took the mortgage with Steven gets **one** sequence, not two.

| Day | Subject prefix | Content | Rule |
|---|---|---|---|
| 1 | `[Day 1]` | Thank-you only; the one thing they cared about most (from `wiki/clients/<client>.md` if it exists) | **No ask.** |
| 10 | `[Day 10]` | The review ask: one link — Google Business profile for a real-estate client, Zillow lender profile for a mortgage client | Both links are `{{google_review_url}}` / `{{zillow_review_url}}` placeholders until Steven supplies the URLs; never both links to a dual-side client in one email |
| 30 | `[Day 30]` | Check-in: utilities, first-payment **date** for a mortgage client (date only, no amount), "anything I can fix?" | No pitch, no rate |

Before drafting, Gmail `search_threads` once to confirm the closing thread is quiet (no open repair, no funds
question). Skip the whole sequence if the file closed with a dispute, a credit or an open repair — list it for Steven.

What the skill writes: three Gmail drafts per close (never sent), one `vanessaQueue` item
`Post-close — <first name>: send day 1 on <date>, day 10 on <date>, day 30 on <date>` carrying the three draft
ids, and — first run only — the three templates in `integrations/pabbly/templates/workflow-7.md` with merge
fields (`{{first_name}}`, `{{street}}`, the two review URLs) and the delay values. Deck text is first names only;
the street stays in the draft. Re-running for the same close updates the item rather than adding another.

## Review-request rules (no inducement)

- Nothing of value for a review: no gift, discount, raffle, charity match, "in return", and no request to edit
  a review already left. Google and Zillow policies, and RESPA §8 for anything that could read as a referral
  thing-of-value.
- The wording is "if you were happy with the work, a review helps the next family find us" — never "a 5-star
  review", never conditional.
- Every draft ends with Alexandra's line: Steven Shearrill · Broker Associate, LPT Realty DRE 01988316 · MLO,
  Patriot Pacific Financial NMLS 1921615 · Equal Housing Opportunity.
- The closing gift in the Funded row of `transaction-stages.md` is a thank-you, sent with the day-1 note at
  most. It is never mentioned in the same email as the review ask and never tied to it.
- A review link is only used for a platform Steven has confirmed he has a profile on; otherwise the placeholder stays.
- Proof the batch is clean: grep the three bodies for "gift", "discount", "5-star", "in return" — all absent.

## Pabbly workflow 7 — the unattended version

`integrations/pabbly/WORKFLOWS.md` § B row 7, as of 2026-10-22: trigger **Lofty lead stage → Closed** (or **Zoho
CRM deal → Funded**) → Gmail **drafts** on day 1, day 10 and day 30 through Pabbly's Delay step → a **Google
Calendar task for the ISA** on each of those days. Runs on Pabbly, so it costs no Claude allowance. Status: a
workflow Steven clicks together in Pabbly's editor (§ C of that file); off until he turns it on and says
"Pabbly workflow 7 on". The templates it needs are the ones the skill writes to `workflow-7.md`. Zoho's side
waits on the API permission Steven has to tick (`docs/STEVEN-STEPS.md` 2b). Until the workflow is on, the
`review-request` skill runs in an attended session whenever `tcDesk` shows a deal at COE with no review item.

## The twelve-month care touches

After day 30 the client moves to the sphere list (`sphere-nurture.md`). The standing cadence there, as of
2026-10-22 (skill `past-client-nurture`):

| When | Touch | Drafted by |
|---|---|---|
| Every 90 days without contact | Plain check-in — one question, one offer, no pitch | Sphere Nurture Coordinator / Wren |
| Once a quarter at most | Local market note (three county figures with the doc's own stamp; no rate, no "good time to…") | Sofia (voice), Wren |
| Birthday, if the record has one | Two sentences, Alexandra's line | Wren |
| Month 12 — home anniversary | Two sentences about the house or the year, an offer to help with anything home-related | Wren |
| Mortgage client, around month 12 | The annual mortgage review outreach named in `transaction-stages.md` — a **draft** for Steven; any rate conversation is his | Harrison (with Alexandra) |
| When rates move | The client may appear on the Monday refi watch list — `wiki/mortgage-programs/refi-review-prep.md`; a prep list for Steven only, never a touch | Refi Watch Analyst |

No touch carries a rate, a refi suggestion or a home-value figure. The refi list and the care touches never mix.

## HALT

- A negative review or a complaint anywhere → no ask; Needs-Steven packet.
- Thanking a referral partner (lender, escrow, title) with anything but words → Alexandra, then Steven.
- A client replies with a transaction or loan question → the thread goes to Steven; no draft answers it.
- Anything that would send, schedule a send, or write to Lofty / Zoho → stop.

## See also

- `wiki/real-estate-playbooks/transaction-stages.md` — the Funded and Post-close rows this page expands.
- `wiki/real-estate-playbooks/sphere-nurture.md` — where the client goes after day 30.
- `wiki/real-estate-playbooks/referral-reciprocity.md` — RESPA §8 and the referral ledger.
- `wiki/ai-team/push-button-system.md` — the `vanessaQueue` the day-1/10/30 item lands in.
